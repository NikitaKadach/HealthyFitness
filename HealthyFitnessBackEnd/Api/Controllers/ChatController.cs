using Api.Dtos;
using Api.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

// Чат только между пациентом и физиотерапевтом
[Route("api/chat")]
[Authorize(Roles = "patient,therapist")]
public class ChatController(AppDbContext db) : ApiControllerBase
{
    private async Task<bool> CanChatWith(string otherId, CancellationToken ct)
    {
        var otherRole = await db.Users.Where(u => u.Id == otherId).Select(u => u.Role).FirstOrDefaultAsync(ct);
        return (CurrentRole, otherRole) is ("patient", "therapist") or ("therapist", "patient");
    }

    [HttpGet("{otherId}")]
    public async Task<IActionResult> GetThread(string otherId, CancellationToken ct)
    {
        if (!await CanChatWith(otherId, ct)) return Error(403, "Нет доступа к этому чату");
        var me = CurrentUserId;

        var latest = await db.ChatMessages.AsNoTracking()
            .Where(m => (m.FromId == me && m.ToId == otherId) || (m.FromId == otherId && m.ToId == me))
            .OrderByDescending(m => m.CreatedAt).Take(500).ToListAsync(ct);
        return Ok(latest.OrderBy(m => m.CreatedAt).Select(m => m.ToDto()).ToList());
    }

    [HttpPost]
    public async Task<IActionResult> Send(SendMessageRequest req, CancellationToken ct)
    {
        var error = Validation.ValidateText(req.Text, 1000);
        if (error is not null) return Error(400, error);
        if (!await CanChatWith(req.To, ct)) return Error(403, "Нет доступа к этому чату");

        var message = new ChatMessage
        {
            FromId = CurrentUserId,
            ToId = req.To,
            Text = req.Text.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
        };
        db.ChatMessages.Add(message);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, message.ToDto());
    }
}
