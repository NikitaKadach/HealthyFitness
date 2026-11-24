using Api.Dtos;
using Api.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppUser = Domain.Entities.User;

namespace Api.Controllers;

[Route("api")]
public class UsersController(AppDbContext db) : ApiControllerBase
{
    private Task<AppUser?> LoadMe(CancellationToken ct) =>
        db.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Id == CurrentUserId, ct);

    [HttpGet("users/me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var me = await LoadMe(ct);
        return me is null ? Unauthorized() : Ok(me.ToDto());
    }

    // Анкета (профиль). Медицинские данные сохраняются только после согласия.
    [HttpPut("users/me/profile")]
    public async Task<IActionResult> SaveProfile(ProfileDto dto, CancellationToken ct)
    {
        var me = await LoadMe(ct);
        if (me is null) return Unauthorized();
        if (me.ConsentAt is null) return Error(403, "Сначала примите согласие на обработку данных");

        var error = Validation.ValidateProfile(dto, out var birth);
        if (error is not null) return Error(400, error);

        var conditions = (dto.Conditions ?? []).Select(c => c.Trim()).Where(c => c.Length > 0).Distinct().ToArray();
        if (me.Profile is null)
        {
            me.Profile = new Profile { UserId = me.Id };
            db.Profiles.Add(me.Profile);
        }
        me.Profile.Height = dto.Height;
        me.Profile.Weight = dto.Weight;
        me.Profile.Sex = dto.Sex;
        me.Profile.BirthDate = birth;
        me.Profile.Conditions = conditions;
        me.Profile.Notes = dto.Notes?.Trim() ?? "";
        me.Profile.Goal = dto.Goal?.Trim() ?? "";

        await db.SaveChangesAsync(ct);
        return Ok(me.ToDto());
    }

    [HttpPost("users/me/consent")]
    public async Task<IActionResult> Accept(CancellationToken ct)
    {
        var me = await LoadMe(ct);
        if (me is null) return Unauthorized();
        me.ConsentAt ??= DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(me.ToDto());
    }

    // Отзыв согласия: удаляется анкета
    [HttpDelete("users/me/consent")]
    public async Task<IActionResult> Revoke(CancellationToken ct)
    {
        var me = await LoadMe(ct);
        if (me is null) return Unauthorized();
        me.ConsentAt = null;
        if (me.Profile is not null) db.Profiles.Remove(me.Profile);
        await db.SaveChangesAsync(ct);
        me.Profile = null;
        return Ok(me.ToDto());
    }

    // Удаление аккаунта и всех связанных данных (каскадно)
    [HttpDelete("users/me")]
    public async Task<IActionResult> DeleteMe(CancellationToken ct)
    {
        var me = await db.Users.FirstOrDefaultAsync(u => u.Id == CurrentUserId, ct);
        if (me is null) return NoContent();
        db.Users.Remove(me);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // Собеседники для чата: пациенту — физиотерапевты, физиотерапевту — пациенты
    [HttpGet("users/contacts")]
    [Authorize(Roles = "patient,therapist")]
    public async Task<IActionResult> Contacts(CancellationToken ct)
    {
        var wanted = CurrentRole == "therapist" ? "patient" : "therapist";
        var list = await db.Users.AsNoTracking().Where(u => u.Role == wanted).OrderBy(u => u.Name ?? u.Email).ToListAsync(ct);
        return Ok(list.Select(u => u.ToContactDto()).ToList());
    }

    // Пациенты с анкетами — только для физиотерапевта
    [HttpGet("patients")]
    [Authorize(Roles = "therapist")]
    public async Task<IActionResult> Patients(CancellationToken ct)
    {
        var list = await db.Users.AsNoTracking().Include(u => u.Profile)
            .Where(u => u.Role == "patient").OrderBy(u => u.Name ?? u.Email).ToListAsync(ct);
        return Ok(list.Select(u => u.ToDto()).ToList());
    }

    // --- Управление ролями (админ) ---
    [HttpGet("users")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> AllUsers(CancellationToken ct)
    {
        var list = await db.Users.AsNoTracking().OrderBy(u => u.Email).ToListAsync(ct);
        return Ok(list.Select(u => u.ToContactDto()).ToList());
    }

    [HttpPut("users/{id}/role")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> SetRole(string id, RoleRequest req, CancellationToken ct)
    {
        var role = (req.Role ?? "").Trim().ToLowerInvariant();
        if (role is not ("patient" or "therapist" or "admin")) return Error(400, "Некорректная роль");
        if (id == CurrentUserId) return Error(400, "Нельзя изменить собственную роль");
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return Error(404, "Пользователь не найден");
        user.Role = role;
        await db.SaveChangesAsync(ct);
        return Ok(user.ToContactDto());
    }
}
