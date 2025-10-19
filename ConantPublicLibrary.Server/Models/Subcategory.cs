using ConantPublicLibrary.Server.Models;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Subcategory")]
public class Subcategory
{
    public int Id { get; set; }

    [Column("subcategoryname")]
    public string? Name { get; set; }

    public int CategoryId { get; set; }

    [Column("pagetypeid")]
    public string? PageTypeId { get; set; } 
    public bool IsActive { get; set; } = true;
    public int OrderNo { get; set; }

    public Category? Category { get; set; }

}
