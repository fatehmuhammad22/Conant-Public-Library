using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConantLibraryCMS.Models
{
    [Table("TopRibbon")]
    public class TopRibbon
    {
        [Key]
        public int Id { get; set; }
        public string Body { get; set; }
        public string Status { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
