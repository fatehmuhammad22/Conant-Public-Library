using ConantLibraryCMS.Data;
using ConantPublicLibrary.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConantPublicLibrary.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories
                .OrderBy(c => c.OrderNo)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();
            return category;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, Category category)
        {
            if (id != category.Id) return BadRequest();
            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Categories.Any(e => e.Id == id)) return NotFound();
                throw;
            }

            return NoContent();
        }
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            if (_context.Categories == null)
                return Problem("Entity set 'AppDbContext.Categories' is null.");

            var maxOrderNo = await _context.Categories
                .Where(c => c.OrderNo != 999)
                .MaxAsync(c => (int?)c.OrderNo) ?? 0;

            category.OrderNo = maxOrderNo + 1;

            var maxId = await _context.Categories
                .Where(c => c.Id != 999)
                .MaxAsync(c => (int?)c.Id) ?? 0;

            category.Id = maxId + 1;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("SwapOrder")]
        public async Task<IActionResult> SwapCategoryOrder([FromQuery] int id1, [FromQuery] int id2)
        {
            var cat1 = await _context.Categories.FindAsync(id1);
            var cat2 = await _context.Categories.FindAsync(id2);

            if (cat1 == null || cat2 == null)
                return NotFound("One or both categories not found.");

            int temp = cat1.OrderNo;
            cat1.OrderNo = cat2.OrderNo;
            cat2.OrderNo = temp;

            await _context.SaveChangesAsync();
            return Ok();
        }



    }

}
