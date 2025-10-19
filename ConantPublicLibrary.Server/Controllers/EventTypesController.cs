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
    public class EventTypesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventTypesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetEventTypes()
        {
            var types = await _context.EventType
                .OrderBy(t => t.OrderNo)
                .ToListAsync();

            return Ok(types);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEventType([FromBody] EventType type)
        {
            if (string.IsNullOrWhiteSpace(type.Name))
                return BadRequest("Name is required.");

            var maxId = await _context.EventType.MaxAsync(t => (int?)t.Id) ?? 0;
            type.Id = maxId + 1;

            var maxOrderNo = await _context.EventType.MaxAsync(t => (int?)t.OrderNo) ?? -1;
            type.OrderNo = maxOrderNo + 1;

            type.CreatedOn = DateTime.UtcNow;

            _context.EventType.Add(type);
            await _context.SaveChangesAsync();

            return Ok(type);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventType(int id, [FromBody] EventType updatedType)
        {
            var existing = await _context.EventType.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = updatedType.Name;
            existing.OrderNo = updatedType.OrderNo;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventType(int id)
        {
            var existing = await _context.EventType.FindAsync(id);
            if (existing == null) return NotFound();

            _context.EventType.Remove(existing);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
