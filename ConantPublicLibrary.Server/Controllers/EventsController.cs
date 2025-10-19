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
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context) 
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetEvents()
        {
            var events = await _context.Event
                .Include(e => e.EventLocation)
                .Include(e => e.EventType)
                .OrderBy(e => e.Date)
                .ToListAsync();

            return Ok(events);
        }

        [HttpPost]
        public async Task<IActionResult> AddEvent([FromBody] Event newEvent)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var nextId = (_context.Event.Max(e => (int?)e.Id) ?? 0) + 1;
            newEvent.Id = nextId;

            newEvent.CreatedOn = DateTime.UtcNow;

            _context.Event.Add(newEvent);
            await _context.SaveChangesAsync();

            return Ok(newEvent);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] Event updatedEvent)
        {
            if (id != updatedEvent.Id)
                return BadRequest();

            var existing = await _context.Event.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Title = updatedEvent.Title;
            existing.Date = updatedEvent.Date;
            existing.StartTime = updatedEvent.StartTime;
            existing.EndTime = updatedEvent.EndTime;
            existing.EventLocationId = updatedEvent.EventLocationId;
            existing.EventTypeId = updatedEvent.EventTypeId;
            existing.Description = updatedEvent.Description;
            existing.ModifiedOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var ev = await _context.Event.FindAsync(id);
            if (ev == null) return NotFound();

            _context.Event.Remove(ev);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("GetBySubcategory/{subcategoryId}")]
        public IActionResult GetBySubcategory(int subcategoryId)
        {
            var events = _context.Event
                .Select(e => new {
                    id = e.Id,
                    title = e.Title,
                    date = e.Date.ToString("yyyy-MM-dd"),
                    description = e.Description
                })
                .ToList();

            return Ok(events);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEvent(int id)
        {
            var ev = await _context.Event
                .Include(e => e.EventLocation)
                .Include(e => e.EventType)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (ev == null) return NotFound();

            return Ok(new
            {
                ev.Id,
                ev.Title,
                Date = ev.Date.ToString("yyyy-MM-dd"),
                ev.StartTime,
                ev.EndTime,
                ev.EventLocationId,
                ev.EventTypeId,
                ev.Description
            });
        }


    }
}
