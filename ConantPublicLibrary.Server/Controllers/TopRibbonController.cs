using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConantLibraryCMS.Data;
using ConantLibraryCMS.Models;

namespace ConantLibraryCMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopRibbonController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TopRibbonController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TopRibbon>>> GetAll()
        {
            return await _context.TopRibbons
                .Where(r => r.Status == "Public")
                .OrderBy(r => r.Id)
                .ToListAsync();
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTopRibbon(int id, [FromBody] TopRibbon updatedRibbon)
        {
            if (id != updatedRibbon.Id)
            {
                return BadRequest("ID mismatch");
            }

            var existingRibbon = await _context.TopRibbons.FindAsync(id);
            if (existingRibbon == null)
            {
                return NotFound();
            }

            existingRibbon.Body = updatedRibbon.Body;
            existingRibbon.Status = updatedRibbon.Status;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent(); 
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Error saving to database: {ex.Message}");
            }
        }

    }
}
