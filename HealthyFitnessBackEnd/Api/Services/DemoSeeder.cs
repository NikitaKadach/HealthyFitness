using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

// Демо-аккаунты из README фронтенда. Пароль у обоих: demo1234
public static class DemoSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();
        var hasher = services.GetRequiredService<IPasswordHasher<User>>();

        var demo = new (string Email, string Role, string Name)[]
        {
            ("therapist@demo.ru", "therapist", "Иван Петров, физиотерапевт"),
            ("admin@demo.ru", "admin", "Администратор"),
        };

        foreach (var d in demo)
        {
            if (await db.Users.AnyAsync(u => u.Email == d.Email)) continue;
            var user = new User { Email = d.Email, Role = d.Role, Name = d.Name, ConsentAt = DateTimeOffset.UtcNow };
            user.PasswordHash = hasher.HashPassword(user, "demo1234");
            db.Users.Add(user);
        }
        await db.SaveChangesAsync();
    }
}
