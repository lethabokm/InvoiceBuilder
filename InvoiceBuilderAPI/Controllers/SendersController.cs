using InvoiceBuilderAPI.Data;
using InvoiceBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SendersController : ControllerBase
    {
        private readonly InvoiceBuilderDbContext _dbContext;

        public SendersController(InvoiceBuilderDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<Sender>>> GetAll([FromQuery] PageRequest request)
        {
            var query = _dbContext.Senders
                .Where(s => s.Active)
                .OrderBy(s => s.CompanyName);

            var total = await query.CountAsync();
            var skip = (request.Page - 1) * request.PageSize;

            var senders = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync();

            return Ok(new PagedResult<Sender>
            {
                Items = senders,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize
            });
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<Sender>> Get(string email)
        {
            var sender = await _dbContext.Senders
                .Where(s => s.Active && s.Email == email)
                .FirstOrDefaultAsync();

            if (sender is null)
            {
                return NotFound();
            }

            return Ok(sender);
        }

        [HttpPost]
        public async Task<ActionResult<Sender>> Create(Sender sender)
        {
            sender.CreatedAt = DateTime.UtcNow;
            sender.ModifiedAt = DateTime.UtcNow;
            sender.Active = true;

            _dbContext.Senders.Add(sender);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { email = sender.Email }, sender);
        }

        [HttpPut("{email}")]
        public async Task<ActionResult<Sender>> Update(string email, Sender updatedSender)
        {
            var existingSender = await _dbContext.Senders
                .Where(s => s.Active && s.Email == email)
                .FirstOrDefaultAsync();

            if (existingSender is null)
            {
                return NotFound();
            }

            existingSender.CompanyName = updatedSender.CompanyName;
            existingSender.ContactPerson = updatedSender.ContactPerson;
            existingSender.Address = updatedSender.Address;
            existingSender.Email = updatedSender.Email;
            existingSender.TaxId = updatedSender.TaxId;
            existingSender.Phone = updatedSender.Phone;
            existingSender.BankDetails = updatedSender.BankDetails;
            existingSender.ModifiedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(existingSender);
        }

        [HttpDelete("{email}")]
        public async Task<ActionResult> Delete(string email)
        {
            var existingSender = await _dbContext.Senders
                .Where(s => s.Active && s.Email == email)
                .FirstOrDefaultAsync();

            if (existingSender is null)
            {
                return NotFound();
            }

            existingSender.Active = false;
            existingSender.ModifiedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
