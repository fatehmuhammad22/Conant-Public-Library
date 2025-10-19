using ConantLibraryCMS.Data;
using ConantPublicLibrary.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    public class LoginRequest
    {
        public string UName { get; set; } = "";
        public string Password { get; set; } = "";
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _context.Admin
            .FirstOrDefaultAsync(u =>
                u.UName == req.UName &&
                u.Password == req.Password &&
                u.IsActive &&
                !u.IsDeleted
            );

        if (user == null)
            return Unauthorized("Invalid credentials");

        return Ok(new
        {
            message = "Login successful",
            uName = user.UName 
        });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        if (string.IsNullOrEmpty(req.UName) || string.IsNullOrEmpty(req.OldPassword) || string.IsNullOrEmpty(req.NewPassword))
            return BadRequest("Invalid data");

        var user = await _context.Admin
            .FirstOrDefaultAsync(u => u.UName == req.UName && u.Password == req.OldPassword && u.IsActive && !u.IsDeleted);

        if (user == null) return Unauthorized("Old password is incorrect.");

        user.Password = req.NewPassword;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully" });
    }

    public class ChangePasswordRequest
    {
        public string UName { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }

}
