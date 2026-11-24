using System.Text.Json;
using Api.Dtos;
using Api.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

// Назначения физиотерапевта. Пациент видит только свои и не может их менять.
[Route("api/assignments")]
public class AssignmentsController(AppDbContext db) : ApiControllerBase
{
    [HttpGet]
    [Authorize(Roles = "patient,therapist")]
    public async Task<IActionResult> List([FromQuery] string? patientId, CancellationToken ct)
    {
        var me = CurrentUserId;
        IQueryable<Assignment> query = db.Assignments.AsNoTracking();

        if (CurrentRole == "patient")
        {
            if (!string.IsNullOrEmpty(patientId) && patientId != me) return Error(403, "Нет доступа");
            query = query.Where(a => a.PatientId == me);
        }
        else
        {
            query = string.IsNullOrEmpty(patientId)
                ? query.Where(a => a.TherapistId == me)
                : query.Where(a => a.PatientId == patientId);
        }

        var list = await query.OrderByDescending(a => a.CreatedAt).ToListAsync(ct);
        return Ok(list.Select(a => a.ToDto()).ToList());
    }

    [HttpPost]
    [Authorize(Roles = "therapist")]
    public async Task<IActionResult> Create(CreateAssignmentRequest req, CancellationToken ct)
    {
        var error = Validation.ValidateWorkout(req.Workout);
        if (error is not null) return Error(400, error);
        if ((req.Comment?.Length ?? 0) > 1000) return Error(400, "Комментарий слишком длинный");

        var patientExists = await db.Users.AnyAsync(u => u.Id == req.PatientId && u.Role == "patient", ct);
        if (!patientExists) return Error(404, "Пациент не найден");

        var w = req.Workout;
        var workout = new WorkoutDto(
            string.IsNullOrWhiteSpace(w.Id) ? Guid.NewGuid().ToString() : w.Id,
            w.Title.Trim(),
            string.IsNullOrWhiteSpace(w.Description) ? null : w.Description.Trim(),
            w.Items.Select(i => new WorkoutItemDto(i.ExerciseId.Trim(), i.Sets, i.Reps)).ToList(),
            true);

        var assignment = new Assignment
        {
            PatientId = req.PatientId,
            TherapistId = CurrentUserId,
            WorkoutJson = JsonSerializer.Serialize(workout, Mapping.Json),
            Comment = string.IsNullOrWhiteSpace(req.Comment) ? null : req.Comment.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
        };
        db.Assignments.Add(assignment);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, assignment.ToDto());
    }

    // Отменить назначение может только физиотерапевт, который его создал
    [HttpDelete("{id}")]
    [Authorize(Roles = "therapist")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var me = CurrentUserId;
        var assignment = await db.Assignments.FirstOrDefaultAsync(a => a.Id == id && a.TherapistId == me, ct);
        if (assignment is null) return Error(404, "Назначение не найдено");
        db.Assignments.Remove(assignment);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
