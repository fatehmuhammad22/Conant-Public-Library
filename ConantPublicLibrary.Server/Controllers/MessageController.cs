using ConantLibraryCMS.Data;
using ConantPublicLibrary.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConantPublicLibrary.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessageController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<Message>> GetMessage()
        {
            var msg = await _context.Message.FirstOrDefaultAsync();

            if (msg == null)
            {
                msg = new Message
                {
                    Body = "",
                    CreatedOn = DateTime.UtcNow
                };
                _context.Message.Add(msg);
                await _context.SaveChangesAsync();
            }

            return Ok(msg);
        }

        [HttpPost]
        public async Task<IActionResult> SaveMessage([FromBody] Message incoming)
        {
            if (incoming == null)
                return BadRequest("No message data provided.");

            var msg = await _context.Message.FirstOrDefaultAsync();
            if (msg == null)
            {
                msg = new Message
                {
                    Body = incoming.Body,
                    CreatedOn = DateTime.UtcNow
                };
                _context.Message.Add(msg);
            }
            else
            {
                msg.Body = incoming.Body;
                msg.ModifiedOn = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}
