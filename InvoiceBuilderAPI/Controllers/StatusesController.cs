using InvoiceBuilderAPI.Data;
using InvoiceBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusesController : ControllerBase
    {
        private readonly InvoiceBuilderDbContext _dbContext;

        public StatusesController(InvoiceBuilderDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Status>>> GetAll()
        {
            var statuses = await _dbContext.Statuses
                .OrderBy(s => s.Id)
                .ToListAsync();

            return Ok(statuses);
        }
    }
}
