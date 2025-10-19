using ConantLibraryCMS.Data;
using ConantPublicLibrary.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConantPublicLibrary.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubcategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubcategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("byCategory/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Subcategory>>> GetSubcategoriesByCategory(int categoryId)
        {
            return await _context.Subcategories
                .Where(sc => sc.CategoryId == categoryId)
                .OrderBy(sc => sc.OrderNo)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Subcategory>> PostSubcategory(Subcategory subcategory)
        {
            if (_context.Subcategories == null)
                return Problem("Subcategory entity set is null.");

            var maxOrder = await _context.Subcategories
                .Where(s => s.CategoryId == subcategory.CategoryId)
                .MaxAsync(s => (int?)s.OrderNo) ?? 0;

            var maxId = await _context.Subcategories
                .Where(s => s.Id != 999)
                .MaxAsync(s => (int?)s.Id) ?? 0;

            subcategory.OrderNo = maxOrder + 1;
            subcategory.Id = maxId + 1;

            _context.Subcategories.Add(subcategory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSubcategoriesByCategory), new { categoryId = subcategory.CategoryId }, subcategory);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSubcategory(int id, Subcategory subcategory)
        {
            if (id != subcategory.Id) return BadRequest();

            _context.Entry(subcategory).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubcategory(int id)
        {
            var sub = await _context.Subcategories.FindAsync(id);
            if (sub == null) return NotFound();

            _context.Subcategories.Remove(sub);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("SwapOrder")]
        public async Task<IActionResult> SwapSubcategoryOrder([FromQuery] int id1, [FromQuery] int id2)
        {
            var sub1 = await _context.Subcategories.FindAsync(id1);
            var sub2 = await _context.Subcategories.FindAsync(id2);

            if (sub1 == null || sub2 == null)
                return NotFound("One or both subcategories not found.");

            int temp = sub1.OrderNo;
            sub1.OrderNo = sub2.OrderNo;
            sub2.OrderNo = temp;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("/api/pagetypes")]
        public async Task<ActionResult<IEnumerable<PageType>>> GetPageTypes()
        {
            return await _context.PageType
                .OrderBy(p => p.OrderNo)
                .ToListAsync();
        }

        [HttpPost("addPage")]
        public async Task<ActionResult<Subcategory>> AddSubcategoryPage(Subcategory page)
        {
            if (_context.Subcategories == null)
                return Problem("SubcategoryPages entity set is null.");

            var maxOrder = await _context.Subcategories
                .Where(p => p.CategoryId == page.CategoryId)
                .MaxAsync(p => (int?)p.OrderNo) ?? 0;

            var maxId = await _context.Subcategories
                .Where(p => p.Id != 999)
                .MaxAsync(p => (int?)p.Id) ?? 0;

            page.OrderNo = maxOrder + 1;
            page.Id = maxId + 1;

            _context.Subcategories.Add(page);
            await _context.SaveChangesAsync();

            return Ok(page);
        }

        [HttpPost("move")]
        public async Task<IActionResult> MoveSubcategory([FromBody] MoveSubcategoryRequest request)
        {
            var sub = await _context.Subcategories.FindAsync(request.SubcategoryId);
            if (sub == null) return NotFound("Subcategory not found.");

            var maxOrder = await _context.Subcategories
                .Where(s => s.CategoryId == request.TargetCategoryId)
                .MaxAsync(s => (int?)s.OrderNo) ?? 0;

            sub.CategoryId = request.TargetCategoryId;
            sub.OrderNo = maxOrder + 1;

            await _context.SaveChangesAsync();

            return Ok();
        }

        public class MoveSubcategoryRequest
        {
            public int SubcategoryId { get; set; }
            public int TargetCategoryId { get; set; }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetSubcategory(int id)
        {
            var subcategory = await _context.Subcategories
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    Name = s.Name
                })
                .FirstOrDefaultAsync();

            if (subcategory == null)
                return NotFound();

            return Ok(subcategory);
        }

    }
}
