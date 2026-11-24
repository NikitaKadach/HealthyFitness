using Api.Dtos;
using Api.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

// Упражнения, добавленные администратором. Читать каталог могут все авторизованные.
[Route("api/custom-exercises")]
public class CustomExercisesController(AppDbContext db, IWebHostEnvironment env) : ApiControllerBase
{
    private const long MaxVideoBytes = 25 * 1024 * 1024;
    private static readonly string[] VideoExtensions = [".mp4", ".webm", ".mov", ".gif"];

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var list = await db.CustomExercises.AsNoTracking().OrderByDescending(e => e.CreatedAt).ToListAsync(ct);
        return Ok(list.Select(e => e.ToDto()).ToList());
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create(CreateCustomExerciseRequest req, CancellationToken ct)
    {
        string? Check(string? value, string label, int max) =>
            string.IsNullOrWhiteSpace(value) ? $"Укажите: {label}"
            : value.Trim().Length > max ? $"{label}: не длиннее {max} символов" : null;

        var error = Check(req.Name, "название", 120) ?? Check(req.BodyPart, "часть тела", 50)
                    ?? Check(req.Equipment, "оборудование", 50) ?? Check(req.Target, "целевая мышца", 120)
                    ?? Check(req.Description, "описание", 4000);
        if (error is not null) return Error(400, error);

        var url = req.VideoUrl?.Trim() ?? "";
        if (url.Length > 2000 || !Uri.TryCreate(url, UriKind.Absolute, out var uri) || (uri.Scheme != "http" && uri.Scheme != "https"))
            return Error(400, "Ссылка на видео должна начинаться с http:// или https://");

        var exercise = new CustomExercise
        {
            Name = req.Name.Trim(),
            BodyPart = req.BodyPart.Trim(),
            Equipment = req.Equipment.Trim(),
            Target = req.Target.Trim(),
            Description = req.Description.Trim(),
            VideoUrl = url,
            CreatedBy = CurrentUserId,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        db.CustomExercises.Add(exercise);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, exercise.ToDto());
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var exercise = await db.CustomExercises.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (exercise is null) return Error(404, "Упражнение не найдено");
        db.CustomExercises.Remove(exercise);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // Загрузка видеофайла: сохраняется в папку uploads, возвращается ссылка для поля videoUrl
    [HttpPost("video")]
    [Authorize(Roles = "admin")]
    [RequestSizeLimit(27_000_000)]
    [RequestFormLimits(MultipartBodyLengthLimit = 27_000_000)]
    public async Task<IActionResult> UploadVideo(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0) return Error(400, "Файл пустой");
        if (file.Length > MaxVideoBytes) return Error(400, "Файл больше 25 МБ — используйте ссылку на видео");
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!VideoExtensions.Contains(ext)) return Error(400, "Допустимые форматы: mp4, webm, mov, gif");

        var name = $"{Guid.NewGuid():N}{ext}";
        var path = Path.Combine(env.ContentRootPath, "uploads", name);
        await using (var stream = System.IO.File.Create(path))
            await file.CopyToAsync(stream, ct);

        return Ok(new VideoUploadResponse($"{Request.Scheme}://{Request.Host}/uploads/{name}"));
    }
}
