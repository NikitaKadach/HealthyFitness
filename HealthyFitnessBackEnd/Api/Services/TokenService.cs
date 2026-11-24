using System.Text;
using Domain.Entities;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Api.Services;

public class TokenService(IConfiguration config)
{
    private readonly SymmetricSecurityKey _key =
        new(Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key не задан")));

    public string Create(User user)
    {
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = config["Jwt:Issuer"] ?? "HealthyFitness",
            Audience = config["Jwt:Audience"] ?? "HealthyFitnessClient",
            Expires = DateTime.UtcNow.AddHours(config.GetValue("Jwt:ExpiresHours", 12)),
            SigningCredentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256),
            // Роль берётся из БД при выдаче токена, а не от клиента
            Claims = new Dictionary<string, object>
            {
                ["sub"] = user.Id,
                ["role"] = user.Role,
                ["email"] = user.Email,
            },
        };
        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}
