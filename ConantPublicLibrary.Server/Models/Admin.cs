using System;
using System.ComponentModel.DataAnnotations;

namespace ConantPublicLibrary.Server.Models
{
    public class Admin
    {
        [Key]
        public Guid AdminId { get; set; }
        public string SubmittedBy { get; set; } = "";
        public string UName { get; set; } = "";
        public string Password { get; set; } = "";
        public string FName { get; set; } = "";
        public string LName { get; set; } = "";
        public string Email { get; set; } = "";
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    }
}
