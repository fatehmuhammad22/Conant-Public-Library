using System.ComponentModel.DataAnnotations.Schema;

namespace ConantPublicLibrary.Server.Models
{
    public class PageType
    {
        [Column("pagetypeid")]
        public string Id { get; set; } = string.Empty;

        [Column("pagetypename")]
        public string? Name { get; set; }

        [Column("orderno")]
        public int OrderNo { get; set; }
    }
}
