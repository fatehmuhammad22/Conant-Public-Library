using ConantLibraryCMS.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class BottomFooterController : ControllerBase
{
    private readonly AppDbContext _context;

    public BottomFooterController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BottomFooter>>> GetBottomFooters()
    {
        return await _context.BottomFooter
            .Where(b => b.Status == "Public")
            .OrderBy(b => b.Id)
            .ToListAsync();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFooter(int id, [FromBody] BottomFooter updatedFooter)
    {
        var existing = await _context.BottomFooter.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Body = updatedFooter.Body;
        existing.Status = updatedFooter.Status;

        await _context.SaveChangesAsync();
        return NoContent();
    }

}
