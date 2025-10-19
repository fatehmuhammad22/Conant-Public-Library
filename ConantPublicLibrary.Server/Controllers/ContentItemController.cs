using ConantLibraryCMS.Data;
using ConantPublicLibrary.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConantPublicLibrary.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContentItemsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContentItemsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ContentItems/by-subcategory/5
        [HttpGet("by-subcategory/{subcategoryId}")]
        public async Task<ActionResult<IEnumerable<ContentItem>>> GetBySubcategory(int subcategoryId)
        {
            var items = await _context.ContentItem
                .Where(c => c.SubcategoryId == subcategoryId)
                .OrderBy(c => c.OrderNo)
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("homepage")]
        public async Task<IActionResult> GetHomepageTiles()
        {
            var data = await _context.ContentItem
                .Where(pc => pc.Status == "Public")
                .OrderBy(pc => pc.OrderNo)
                .ToListAsync();

            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult<ContentItem>> CreateContentItem(ContentItem item)
        {
            var lastId = await _context.ContentItem.MaxAsync(c => (int?)c.Id) ?? 0;
            item.Id = lastId + 1;

            item.CreatedOn = DateTime.UtcNow;
            item.ModifiedOn = null;
            item.Status = string.IsNullOrWhiteSpace(item.Status) ? "Public" : item.Status;

            _context.ContentItem.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBySubcategory), new { subcategoryId = item.SubcategoryId }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContentItem(int id, ContentItem updatedItem)
        {
            if (id != updatedItem.Id)
                return BadRequest("ID mismatch.");

            var existingItem = await _context.ContentItem.FindAsync(id);
            if (existingItem == null)
                return NotFound("Content item not found.");

            existingItem.Title = updatedItem.Title;
            existingItem.Subtitle = updatedItem.Subtitle;
            existingItem.Body = updatedItem.Body;
            existingItem.Status = updatedItem.Status;
            existingItem.OrderNo = updatedItem.OrderNo;
            existingItem.ColumnNo = updatedItem.ColumnNo;
            existingItem.ModifiedOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContentItem(int id)
        {
            var item = await _context.ContentItem.FindAsync(id);
            if (item == null)
                return NotFound();

            _context.ContentItem.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("SwapOrder")]
        public async Task<IActionResult> SwapOrder(int id1, int id2)
        {
            var item1 = await _context.ContentItem.FindAsync(id1);
            var item2 = await _context.ContentItem.FindAsync(id2);

            if (item1 == null || item2 == null)
                return NotFound("One or both content items not found.");

            int tempOrder = item1.OrderNo;
            item1.OrderNo = item2.OrderNo;
            item2.OrderNo = tempOrder;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}/move")]
        public async Task<IActionResult> MoveContent(int id, [FromBody] int newSubcategoryId)
        {
            var content = await _context.ContentItem.FindAsync(id);
            if (content == null)
                return NotFound();

            content.SubcategoryId = newSubcategoryId;

            var maxOrder = await _context.ContentItem
                .Where(c => c.SubcategoryId == newSubcategoryId)
                .MaxAsync(c => (int?)c.OrderNo) ?? 0;

            content.OrderNo = maxOrder + 1;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("pageinfo/{subcategoryId}")]
        public IActionResult GetPageInfo(int subcategoryId)
        {
            var subcategory = _context.Subcategories
                .Where(p => p.Id == subcategoryId && p.IsActive)
                .FirstOrDefault();

            if (subcategory == null)
                return NotFound();

            return Ok(new
            {
                categoryId = subcategory.CategoryId,
                subcategoryName = subcategory.Name,
                pageTypeId = subcategory.PageTypeId
            });
        }
        public class CopyTileRequest
        {
            public string FromTile { get; set; } 
            public string ToTile { get; set; } 
        }
        [HttpPost("copytile")]
        public async Task<IActionResult> CopyTile([FromBody] CopyTileRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.FromTile) || string.IsNullOrWhiteSpace(request.ToTile))
                return BadRequest("Invalid request data.");

            var sourceTile = await _context.ContentItem
                .FirstOrDefaultAsync(c => c.ColumnNo == request.FromTile);

            if (sourceTile == null)
                return NotFound("Source tile not found.");

            int nextId = 1;
            if (await _context.ContentItem.AnyAsync())
            {
                nextId = await _context.ContentItem.MaxAsync(c => c.Id) + 1;
            }

            var copy = new ContentItem
            {
                Id = nextId,
                CategoryId = sourceTile.CategoryId,
                SubcategoryId = sourceTile.SubcategoryId,
                Title = sourceTile.Title,
                Subtitle = sourceTile.Subtitle,
                Body = sourceTile.Body,
                ColumnNo = request.ToTile,
                Status = sourceTile.Status,
                OrderNo = sourceTile.OrderNo,
                CreatedOn = DateTime.UtcNow
            };

            _context.ContentItem.Add(copy);
            await _context.SaveChangesAsync();

            return Ok(copy);
        }

    }
}
