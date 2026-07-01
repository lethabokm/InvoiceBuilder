using InvoiceBuilderAPI.Data;
using InvoiceBuilderAPI.Models;
using InvoiceBuilderAPI.Services.Pdf;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly InvoiceBuilderDbContext _dbContext;
        private readonly IInvoicePdfService _invoicePdfService;

        public InvoicesController(InvoiceBuilderDbContext dbContext, IInvoicePdfService invoicePdfService)
        {
            _dbContext = dbContext;
            _invoicePdfService = invoicePdfService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<Invoice>>> GetAll([FromQuery] PageRequest request)
        {
            var query = _dbContext.Invoices
                .Include(i => i.InvoiceLineItems)
                .OrderByDescending(i => i.InvoiceDate)
                .ThenByDescending(i => i.InvoiceNumber);

            var total = await query.CountAsync();
            var skip = (request.Page - 1) * request.PageSize;

            var invoices = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync();

            return Ok(new PagedResult<Invoice>
            {
                Items = invoices,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize
            });
        }

        [HttpGet("{invoiceNumber}")]
        public async Task<ActionResult<Invoice>> Get(string invoiceNumber)
        {
            var invoice = await _dbContext.Invoices
                .Include(i => i.InvoiceLineItems)
                .Where(i => i.InvoiceNumber == invoiceNumber)
                .FirstOrDefaultAsync();

            if (invoice is null)
            {
                return NotFound();
            }

            return Ok(invoice);
        }

        [HttpGet("{invoiceNumber}/line-items")]
        public async Task<ActionResult<IEnumerable<InvoiceLineItem>>> GetLineItems(string invoiceNumber)
        {
            var invoice = await _dbContext.Invoices
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);

            if (invoice is null)
            {
                return NotFound();
            }

            var lineItems = await _dbContext.InvoiceLineItems
                .Where(li => li.InvoiceId == invoice.Id)
                .ToListAsync();

            return Ok(lineItems);
        }

        [HttpGet("{invoiceNumber}/pdf")]
        public async Task<IActionResult> GetPdf(string invoiceNumber, CancellationToken cancellationToken)
        {
            var invoice = await _dbContext.Invoices
                .Include(i => i.InvoiceLineItems)
                .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber, cancellationToken);

            if (invoice is null)
            {
                return NotFound();
            }

            var sender = await _dbContext.Senders
                .FirstOrDefaultAsync(s => s.Active && s.Email == invoice.SenderEmail, cancellationToken);
            if (sender is null)
            {
                return NotFound($"Sender '{invoice.SenderEmail}' was not found.");
            }

            var customer = await _dbContext.Customers
                .FirstOrDefaultAsync(c => c.Active && c.Email == invoice.CustomerEmail, cancellationToken);
            if (customer is null)
            {
                return NotFound($"Customer '{invoice.CustomerEmail}' was not found.");
            }

            var pdfBytes = await _invoicePdfService.GenerateInvoicePdfAsync(invoice, customer, sender, cancellationToken);

            return File(pdfBytes, "application/pdf", $"{invoice.InvoiceNumber}.pdf");
        }

        [HttpPost]
        public async Task<ActionResult<Invoice>> Create(Invoice invoice)
        {
            var now = DateTime.UtcNow;
            var requestedLineItems = invoice.InvoiceLineItems?.ToList() ?? new List<InvoiceLineItem>();

            invoice.InvoiceLineItems = new List<InvoiceLineItem>();
            invoice.InvoiceNumber = string.Empty;
            invoice.StatusId = invoice.StatusId == 0 ? 1 : invoice.StatusId;
            invoice.CreatedAt = now;
            invoice.ModifiedAt = now;

            _dbContext.Invoices.Add(invoice);
            await _dbContext.SaveChangesAsync();

            invoice.InvoiceNumber = GenerateInvoiceNumber(invoice.InvoiceDate.Year, invoice.Id);
            invoice.ModifiedAt = DateTime.UtcNow;

            foreach (var lineItem in requestedLineItems)
            {
                lineItem.InvoiceId = invoice.Id;
                lineItem.InvoiceNumber = invoice.InvoiceNumber;
                lineItem.CreatedAt = now;
                lineItem.ModifiedAt = now;
                invoice.InvoiceLineItems.Add(lineItem);
            }

            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { invoiceNumber = invoice.InvoiceNumber }, invoice);
        }

        [HttpPut("{invoiceNumber}")]
        public async Task<ActionResult<Invoice>> Update(string invoiceNumber, Invoice updatedInvoice)
        {
            var existingInvoice = await _dbContext.Invoices
                .Include(i => i.InvoiceLineItems)
                .Where(i => i.InvoiceNumber == invoiceNumber)
                .FirstOrDefaultAsync();

            if (existingInvoice is null)
            {
                return NotFound();
            }

            var draftStatusId = 1;
            if (existingInvoice.StatusId != draftStatusId)
            {
                if (updatedInvoice.StatusId == existingInvoice.StatusId)
                {
                    return BadRequest("Once an invoice is no longer Draft, only its status may be changed.");
                }

                existingInvoice.StatusId = updatedInvoice.StatusId;
                existingInvoice.ModifiedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();
                return Ok(existingInvoice);
            }

            existingInvoice.InvoiceDate = updatedInvoice.InvoiceDate;
            existingInvoice.DueDate = updatedInvoice.DueDate;
            existingInvoice.Currency = updatedInvoice.Currency;
            existingInvoice.TaxRate = updatedInvoice.TaxRate;
            existingInvoice.Notes = updatedInvoice.Notes;
            existingInvoice.StatusId = updatedInvoice.StatusId;
            existingInvoice.SenderEmail = updatedInvoice.SenderEmail;
            existingInvoice.CustomerEmail = updatedInvoice.CustomerEmail;
            existingInvoice.ModifiedAt = DateTime.UtcNow;

            var updatedLineItems = updatedInvoice.InvoiceLineItems ?? new List<InvoiceLineItem>();

            // Remove line items that are no longer present in the payload.
            var updatedItemIds = updatedLineItems
                .Where(li => li.Id > 0)
                .Select(li => li.Id)
                .ToHashSet();

            var lineItemsToRemove = existingInvoice.InvoiceLineItems
                .Where(li => !updatedItemIds.Contains(li.Id))
                .ToList();
            _dbContext.InvoiceLineItems.RemoveRange(lineItemsToRemove);

            foreach (var updatedLineItem in updatedLineItems)
            {
                if (updatedLineItem.Id <= 0)
                {
                    existingInvoice.InvoiceLineItems.Add(new InvoiceLineItem
                    {
                        InvoiceId = existingInvoice.Id,
                        InvoiceNumber = existingInvoice.InvoiceNumber,
                        Description = updatedLineItem.Description,
                        Quantity = updatedLineItem.Quantity,
                        UnitPrice = updatedLineItem.UnitPrice,
                        Total = updatedLineItem.Total,
                        CreatedAt = DateTime.UtcNow,
                        ModifiedAt = DateTime.UtcNow
                    });

                    continue;
                }

                var existingLineItem = existingInvoice.InvoiceLineItems
                    .FirstOrDefault(li => li.Id == updatedLineItem.Id);

                if (existingLineItem is null)
                {
                    return BadRequest($"Invoice line item with id {updatedLineItem.Id} does not belong to this invoice.");
                }

                existingLineItem.Description = updatedLineItem.Description;
                existingLineItem.Quantity = updatedLineItem.Quantity;
                existingLineItem.UnitPrice = updatedLineItem.UnitPrice;
                existingLineItem.Total = updatedLineItem.Total;
                existingLineItem.ModifiedAt = DateTime.UtcNow;
            }

            await _dbContext.SaveChangesAsync();
            return Ok(existingInvoice);
        }

        [HttpDelete("{invoiceNumber}")]
        public async Task<ActionResult> Delete(string invoiceNumber)
        {
            var existingInvoice = await _dbContext.Invoices
                .Where(i => i.InvoiceNumber == invoiceNumber)
                .FirstOrDefaultAsync();

            if (existingInvoice is null)
            {
                return NotFound();
            }

            _dbContext.Invoices.Remove(existingInvoice);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        private static string GenerateInvoiceNumber(int year, int id)
        {
            return $"INV-{year}-{id}";
        }
    }
}
