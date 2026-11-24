using Api.Dtos;
using Api.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

// Дневник веса и калоража: только владелец-пациент
[Route("api/weights")]
[Authorize(Roles = "patient")]
public class WeightsController(AppDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var me = CurrentUserId;
        var list = await db.WeightEntries.AsNoTracking().Where(e => e.UserId == me).OrderBy(e => e.Date).ToListAsync(ct);
        return Ok(list.Select(e => e.ToDto()).ToList());
    }

    // Одна запись на дату: повторная отправка той же даты заменяет запись
    [HttpPost]
    public async Task<IActionResult> Upsert(WeightEntryDto dto, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (dto.Date < new DateOnly(1900, 1, 1) || dto.Date > today.AddDays(1)) return Error(400, "Некорректная дата");
        if (dto.Weight is < 20 or > 400) return Error(400, "Вес должен быть от 20 до 400 кг");
        if (dto.Kcal is < 0 or > 20000) return Error(400, "Калораж должен быть от 0 до 20000");

        var me = CurrentUserId;
        var entry = await db.WeightEntries.FirstOrDefaultAsync(e => e.UserId == me && e.Date == dto.Date, ct);
        if (entry is null)
        {
            entry = new WeightEntry { UserId = me, Date = dto.Date };
            db.WeightEntries.Add(entry);
        }
        entry.Weight = dto.Weight;
        entry.Kcal = dto.Kcal;
        await db.SaveChangesAsync(ct);
        return Ok(entry.ToDto());
    }

    [HttpDelete("{date}")]
    public async Task<IActionResult> Delete(DateOnly date, CancellationToken ct)
    {
        var me = CurrentUserId;
        var entry = await db.WeightEntries.FirstOrDefaultAsync(e => e.UserId == me && e.Date == date, ct);
        if (entry is null) return Error(404, "Запись не найдена");
        db.WeightEntries.Remove(entry);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
