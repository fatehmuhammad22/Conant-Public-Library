using System.ComponentModel.DataAnnotations.Schema;

namespace ConantPublicLibrary.Server.Models
{
    [Table("Category")]
    public class Category
    {
        public int Id { get; set; }
        public string CategoryName { get; set; }
        public bool IsActive { get; set; }
        public int OrderNo { get; set; }
    }

}
