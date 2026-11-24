using Api.Dtos;
using Api.Services;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppUser = Domain.Entities.User;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IPasswordHasher<AppUser> hasher, TokenService tokens, IConfiguration config) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req, CancellationToken ct)
    {
        var email = Validation.NormalizeEmail(req.Email);
        if (!Validation.IsEmail(email)) return BadRequest(new ErrorDto("Введите корректную почту"));
        var pwdError = Validation.ValidatePassword(req.Password);
        if (pwdError is not null) return BadRequest(new ErrorDto(pwdError));

        // Роль определяет сервер: самостоятельно можно стать только пациентом.
        // Роли физиотерапевта/админа выдаёт админ (PUT /api/users/{id}/role).
        var role = (req.Role ?? "patient").Trim().ToLowerInvariant();
        if (role is not ("patient" or "therapist" or "admin")) return BadRequest(new ErrorDto("Некорректная роль"));
        if (role != "patient" && !config.GetValue<bool>("Registration:AllowRoleSelection"))
            return StatusCode(403, new ErrorDto("Роль физиотерапевта или администратора выдаёт администратор"));

        if (await db.Users.AnyAsync(u => u.Email == email, ct))
            return Conflict(new ErrorDto("Аккаунт с такой почтой уже есть"));

        var user = new AppUser { Email = email, Role = role, Name = Validation.CleanName(req.Name) };
        user.PasswordHash = hasher.HashPassword(user, req.Password);
        db.Users.Add(user);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Conflict(new ErrorDto("Аккаунт с такой почтой уже есть"));
        }
        return Ok(new AuthResponse(tokens.Create(user), user.ToDto()));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req, CancellationToken ct)
    {
        var email = Validation.NormalizeEmail(req.Email);
        var user = await db.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Email == email, ct);
        var ok = user is not null
                 && hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password ?? "") != PasswordVerificationResult.Failed;
        if (!ok) return Unauthorized(new ErrorDto("Неверная почта или пароль"));
        return Ok(new AuthResponse(tokens.Create(user!), user!.ToDto()));
    }

    // Демо-восстановление: код берётся из конфигурации (Auth:DemoResetCode), письма не отправляются.
    // В appsettings.json код не задан, поэтому вне Development эндпоинт отключён.
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest req, CancellationToken ct)
    {
        var expected = config["Auth:DemoResetCode"];
        if (string.IsNullOrEmpty(expected))
            return StatusCode(501, new ErrorDto("Восстановление пароля не настроено"));
        if (req.Code != expected) return BadRequest(new ErrorDto("Неверный код"));
        var pwdError = Validation.ValidatePassword(req.Password);
        if (pwdError is not null) return BadRequest(new ErrorDto(pwdError));

        var email = Validation.NormalizeEmail(req.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user is null) return NotFound(new ErrorDto("Аккаунт не найден"));

        user.PasswordHash = hasher.HashPassword(user, req.Password);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
