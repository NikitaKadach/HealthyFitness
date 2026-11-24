using System.Text;
using Api.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

// --- JWT ---
var jwtKey = config["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
    throw new InvalidOperationException("Не задан Jwt:Key (минимум 32 символа). Задайте его в appsettings.Development.json, user-secrets или переменной окружения Jwt__Key.");

builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddSingleton<TokenService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = config["Jwt:Issuer"] ?? "HealthyFitness",
            ValidateAudience = true,
            ValidAudience = config["Jwt:Audience"] ?? "HealthyFitnessClient",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "sub",
            RoleClaimType = "role",
        };
    });
builder.Services.AddAuthorization();

// --- CORS для React (Vite по умолчанию на 5173) ---
var origins = config.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:5173"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Папка для загруженных админом видео
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

// Подключаем политику CORS
app.UseCors("AllowFrontend");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Демо-аккаунты (therapist@demo.ru, admin@demo.ru / demo1234) — только в Development
if (app.Environment.IsDevelopment())
{
    try
    {
        using var scope = app.Services.CreateScope();
        await DemoSeeder.SeedAsync(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Не удалось создать демо-аккаунты. Применена ли миграция (dotnet ef database update)?");
    }
}

app.Run();
