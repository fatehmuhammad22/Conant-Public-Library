using ConantLibraryCMS.Models;
using ConantPublicLibrary.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace ConantLibraryCMS.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TopRibbon> TopRibbons { get; set; }
        public DbSet<BottomFooter> BottomFooter { get; set; }
        public DbSet<Event> Event { get; set; }
        public DbSet<EventType> EventType { get; set; }
        public DbSet<EventLocation> EventLocation { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Subcategory> Subcategories { get; set; }
        public DbSet<PageType> PageType { get; set; }
        public DbSet<ContentItem> ContentItem { get; set; }
        public DbSet<Message> Message { get; set; }
        public DbSet<Admin> Admin { get; set; } = null!;
    }
}
