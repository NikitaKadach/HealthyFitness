using Api.Dtos;
using Api.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

// Собственные тренировки пользователя (шаблоны, которые он собрал сам)
[Route("api/workouts")]
public class WorkoutsController(AppDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var me = CurrentUserId;
        var list = await db.Workouts.AsNoTracking().Include(w => w.Items).Where(w => w.UserId == me).ToListAsync(ct);
        // Id — UUIDv7, то есть возрастает со временем: новые тренировки идут первыми
        return Ok(list.OrderByDescending(w => w.Id, StringComparer.Ordinal).Select(w => w.ToDto()).ToList());
    }

    [HttpPost]
    public async Task<IActionResult> Create(WorkoutDto dto, CancellationToken ct)
    {
        var error = Validation.ValidateWorkout(dto);
        if (error is not null) return Error(400, error);

        var workout = new Workout
        {
            Id = Guid.CreateVersion7().ToString(),
            UserId = CurrentUserId,
            Title = dto.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            Custom = dto.Custom ?? true,
            Items = dto.Items.Select(i => new WorkoutItem { ExerciseId = i.ExerciseId.Trim(), Sets = i.Sets, Reps = i.Reps }).ToList(),
        };
        db.Workouts.Add(workout);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, workout.ToDto());
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var me = CurrentUserId;
        var workout = await db.Workouts.FirstOrDefaultAsync(w => w.Id == id && w.UserId == me, ct);
        if (workout is null) return Error(404, "Тренировка не найдена");
        db.Workouts.Remove(workout);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
