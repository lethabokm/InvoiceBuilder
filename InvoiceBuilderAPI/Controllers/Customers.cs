using InvoiceBuilderAPI.Data;
using InvoiceBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Customers : ControllerBase
    {
        private readonly InvoiceBuilderDbContext _dbContext;

        public Customers(InvoiceBuilderDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<Customer>>> GetAll([FromQuery] PageRequest request)
        {
            var query = _dbContext.Customers
                .Where(c => c.Active)
                .OrderBy(c => c.CompanyName);

            var total = await query.CountAsync();
            var skip = (request.Page - 1) * request.PageSize;

            var customers = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync();

            return Ok(new PagedResult<Customer>
            {
                Items = customers,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize
            });
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<Customer>> Get(string email)
        {
            var customer = await _dbContext.Customers
                .Where(c => c.Active && c.Email == email)
                .FirstOrDefaultAsync();

            if (customer is null)
            {
                return NotFound();
            }

            return Ok(customer);
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> Create(Customer customer)
        {
            customer.CreatedAt = DateTime.UtcNow;
            customer.ModifiedAt = DateTime.UtcNow;
            customer.Active = true;

            _dbContext.Customers.Add(customer);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { email = customer.Email }, customer);
        }

        [HttpPut("{email}")]
        public async Task<ActionResult<Customer>> Update(string email, Customer updatedCustomer)
        {
            var existingCustomer = await _dbContext.Customers
                .Where(c => c.Active && c.Email == email)
                .FirstOrDefaultAsync();

            if (existingCustomer is null)
            {
                return NotFound();
            }

            existingCustomer.CompanyName = updatedCustomer.CompanyName;
            existingCustomer.ContactPerson = updatedCustomer.ContactPerson;
            existingCustomer.Address = updatedCustomer.Address;
            existingCustomer.Email = updatedCustomer.Email;
            existingCustomer.TaxId = updatedCustomer.TaxId;
            existingCustomer.PostalCode = updatedCustomer.PostalCode;
            existingCustomer.ModifiedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(existingCustomer);
        }

        [HttpDelete("{email}")]
        public async Task<ActionResult> Delete(string email)
        {
            var existingCustomer = await _dbContext.Customers
                .Where(c => c.Active && c.Email == email)
                .FirstOrDefaultAsync();

            if (existingCustomer is null)
            {
                return NotFound();
            }

            existingCustomer.Active = false;
            existingCustomer.ModifiedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
