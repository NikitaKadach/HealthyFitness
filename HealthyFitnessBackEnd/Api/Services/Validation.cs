using System.Text.RegularExpressions;
using Api.Dtos;

namespace Api.Services;

public static partial class Validation
{
    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    private static partial Regex EmailRegex();

    public static string NormalizeEmail(string? email) => (email ?? "").Trim().ToLowerInvariant();

    public static bool IsEmail(string email) => email.Length <= 254 && EmailRegex().IsMatch(email);

    public static string? CleanName(string? name)
    {
        var t = name?.Trim();
        if (string.IsNullOrEmpty(t)) return null;
        return t.Length > 60 ? t[..60] : t;
    }

    public static string? ValidatePassword(string? password) =>
        string.IsNullOrEmpty(password) || password.Length < 8 ? "Пароль — не короче 8 символов"
        : password.Length > 128 ? "Пароль слишком длинный"
        : null;

    public static string? ValidateProfile(ProfileDto p, out DateOnly birth)
    {
        birth = default;
        if (p.Height is < 50 or > 260) return "Рост должен быть от 50 до 260 см";
        if (p.Weight is < 20 or > 400) return "Вес должен быть от 20 до 400 кг";
        if (p.Sex is not ("male" or "female")) return "Некорректный пол";
        if (!DateOnly.TryParseExact(p.Birth, "yyyy-MM-dd", out birth)) return "Некорректная дата рождения";
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (birth > today || birth < today.AddYears(-120)) return "Некорректная дата рождения";
        if ((p.Notes?.Length ?? 0) > 2000) return "Заметки слишком длинные (максимум 2000 символов)";
        if ((p.Goal?.Length ?? 0) > 500) return "Цель слишком длинная (максимум 500 символов)";
        if (p.Conditions is { Length: > 30 } || (p.Conditions?.Any(c => c is null || c.Length > 100) ?? false))
            return "Слишком много или слишком длинные записи о заболеваниях";
        return null;
    }

    public static string? ValidateWorkout(WorkoutDto w)
    {
        if (string.IsNullOrWhiteSpace(w.Title) || w.Title.Trim().Length > 120) return "Название тренировки: от 1 до 120 символов";
        if ((w.Description?.Length ?? 0) > 1000) return "Описание тренировки слишком длинное";
        if (w.Items is not { Count: > 0 and <= 50 }) return "В тренировке должно быть от 1 до 50 упражнений";
        foreach (var i in w.Items)
        {
            if (string.IsNullOrWhiteSpace(i.ExerciseId) || i.ExerciseId.Length > 100) return "Некорректный идентификатор упражнения";
            if (i.Sets is < 1 or > 100) return "Количество подходов: от 1 до 100";
            if (i.Reps is < 1 or > 1000) return "Количество повторений: от 1 до 1000";
        }
        return null;
    }

    public static string? ValidateText(string? text, int max = 1000) =>
        string.IsNullOrWhiteSpace(text) ? "Текст не может быть пустым"
        : text.Trim().Length > max ? $"Текст длиннее {max} символов"
        : null;
}
