using ConantPublicLibrary.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Event
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Title { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required, MaxLength(15)]
    public string StartTime { get; set; }

    [Required, MaxLength(15)]
    public string EndTime { get; set; }

    [Required]
    public int EventLocationId { get; set; }
    public EventLocation? EventLocation { get; set; }  // ✅ Nullable

    [Required]
    public int EventTypeId { get; set; }
    public EventType? EventType { get; set; }          // ✅ Nullable

    [MaxLength(5000)]
    public string Description { get; set; }

    [Required]
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public DateTime? ModifiedOn { get; set; }


}
