using System.Security.Claims;
using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Models;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AureliaDbContext db, ITokenService tokens) : ApiControllerBase
{
    /// <summary>Creates a supporter account and returns a JWT.</summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        var errors = new Dictionary<string, string>();

        if (!Validation.HasText(req.FirstName, 1, 80)) errors["firstName"] = "First name is required.";
        if (!Validation.HasText(req.LastName, 1, 80)) errors["lastName"] = "Last name is required.";
        if (!Validation.IsEmail(req.Email)) errors["email"] = "Enter a valid email address.";
        if (!Validation.IsStrongPassword(req.Password))
            errors["password"] = "Password must be 8+ characters with upper case, lower case and a number.";

        if (req.ConfirmPassword is not null && req.Password != req.ConfirmPassword)
            errors["confirmPassword"] = "Passwords do not match.";

        if (errors.Count > 0) return ValidationErrors(errors);

        var email = Validation.Normalize(req.Email);
        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new ProblemDetails { Title = "Email already registered", Detail = "An account with that email already exists." });

        var user = new User
        {
            FirstName = req.FirstName.Trim(),
            LastName = req.LastName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = "Member",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var (token, expires) = tokens.CreateToken(user);
        return Ok(new AuthResponse(token, expires.ToString("o"), user.Id,
            user.FirstName, user.LastName, user.Email, user.Role));
    }

    /// <summary>Authenticates a supporter and returns a JWT.</summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        if (!Validation.IsEmail(req.Email) || string.IsNullOrEmpty(req.Password))
            return BadRequest(new ProblemDetails { Title = "Invalid credentials", Detail = "Email and password are required." });

        var email = Validation.Normalize(req.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new ProblemDetails { Title = "Invalid credentials", Detail = "The email or password is incorrect." });

        var (token, expires) = tokens.CreateToken(user);
        return Ok(new AuthResponse(token, expires.ToString("o"), user.Id,
            user.FirstName, user.LastName, user.Email, user.Role));
    }

    /// <summary>Returns the profile of the signed-in account.</summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound();
        return Ok(new UserDto(user.Id, user.FirstName, user.LastName, user.Email, user.Role,
            user.CreatedAt.ToString("yyyy-MM-dd")));
    }
}
