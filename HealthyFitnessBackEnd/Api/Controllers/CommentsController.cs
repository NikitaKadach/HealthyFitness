using Api.Dtos;
using Api.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

// Внутренние комментарии физиотерапевта: пациент их не видит
[Route("api")]
[Authorize(Roles = "therapist")]
public class CommentsController(AppDbContext db) : ApiControllerBase
{
    [HttpGet("patients/{patientId}/comments")]
    public async Task<IActionResult> List(string patientId, CancellationToken ct)
    {
        var list = await db.PatientComments.AsNoTracking()
            .Where(c => c.PatientId == patientId).OrderBy(c => c.CreatedAt).ToListAsync(ct);
        return Ok(list.Select(c => c.ToDto()).ToList());
    }

    [HttpPost("patients/{patientId}/comments")]
    public async Task<IActionResult> Add(string patientId, TextRequest req, CancellationToken ct)
    {
        var error = Validation.ValidateText(req.Text, 2000);
        if (error is not null) return Error(400, error);
        if (!await db.Users.AnyAsync(u => u.Id == patientId && u.Role == "patient", ct))
            return Error(404, "Пациент не найден");

        var comment = new PatientComment
        {
            PatientId = patientId,
            AuthorId = CurrentUserId,
            Text = req.Text.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
        };
        db.PatientComments.Add(comment);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, comment.ToDto());
    }

    // Удалить комментарий может только его автор
    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var me = CurrentUserId;
        var comment = await db.PatientComments.FirstOrDefaultAsync(c => c.Id == id && c.AuthorId == me, ct);
        if (comment is null) return Error(404, "Комментарий не найден");
        db.PatientComments.Remove(comment);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
