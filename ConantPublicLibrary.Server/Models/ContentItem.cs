using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("PageContent")]
public class ContentItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] 

    public int Id { get; set; }

    public int CategoryId { get; set; }
    public int SubcategoryId { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Body { get; set; }
    public string ColumnNo { get; set; }
    public string Status { get; set; }
    public int OrderNo { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime? ModifiedOn { get; set; }
}
