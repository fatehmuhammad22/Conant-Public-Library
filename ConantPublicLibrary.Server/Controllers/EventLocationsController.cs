using ConantLibraryCMS.Data;
using ConantPublicLibrary.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ConantPublicLibrary.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventLocationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventLocationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetEventLocations()
        {
            var locations = await _context.EventLocation
                .OrderBy(l => l.OrderNo ?? int.MaxValue)
                .ToListAsync();

            return Ok(locations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventLocation(int id)
        {
            var location = await _context.EventLocation.FindAsync(id);
            if (location == null)
                return NotFound();

            return Ok(location);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEventLocation(EventLocation location)
        {
            var maxId = await _context.EventLocation.MaxAsync(l => (int?)l.Id) ?? 0;
            location.Id = maxId + 1;

            location.CreatedOn = DateTime.Now;

            _context.EventLocation.Add(location);
            await _context.SaveChangesAsync();

            return Ok(location);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventLocation(int id, [FromBody] EventLocation location)
        {
            if (id != location.Id)
                return BadRequest("Mismatched ID.");

            var existing = await _context.EventLocation.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = location.Name;
            existing.OrderNo = location.OrderNo;
            existing.CreatedOn = DateTime.UtcNow;

            _context.EventLocation.Update(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventLocation(int id)
        {
            var location = await _context.EventLocation.FindAsync(id);
            if (location == null)
                return NotFound();

            _context.EventLocation.Remove(location);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
