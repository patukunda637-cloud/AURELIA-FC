using System.Security.Claims;
using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Models;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController(AureliaDbContext db) : ApiControllerBase
{
    /// <summary>Persists a message submitted through the Contact form.</summary>
    [HttpPost]
    public async Task<ActionResult<ContactMessageResult>> Send(ContactMessageRequest req)
    {
        var errors = new Dictionary<string, string>();
        if (!Validation.HasText(req.FullName, 2, 160)) errors["fullName"] = "Full name is required.";
        if (!Validation.IsEmail(req.Email)) errors["email"] = "Enter a valid email address.";
        if (!Validation.HasText(req.Subject, 1, 120)) errors["subject"] = "Please choose a subject.";
        if (!Validation.HasText(req.Message, 10, 4000)) errors["message"] = "Message must be at least 10 characters.";

        if (errors.Count > 0) return ValidationErrors(errors);

        int? userId = null;
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idClaim, out var parsed) && await db.Users.AnyAsync(u => u.Id == parsed))
            userId = parsed;

        var message = new ContactMessage
        {
            FullName = req.FullName.Trim(),
            Email = Validation.Normalize(req.Email),
            Subject = req.Subject.Trim(),
            Message = req.Message.Trim(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            IsHandled = false,
        };

        db.ContactMessages.Add(message);
        await db.SaveChangesAsync();

        var reference = $"MSG-{message.Id:000000}";
        return Ok(new ContactMessageResult(message.Id, reference,
            "Thank you for contacting Aurelia FC. Our team will respond within two working days."));
    }
}
