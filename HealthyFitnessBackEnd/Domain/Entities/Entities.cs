
namespace Domain.Entities;

// 1. Пользователь
public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "patient";
    public string? Name { get; set; }
    public DateTimeOffset? ConsentAt { get; set; }

    public Profile? Profile { get; set; }
}

// 2. Профиль пользователя
public class Profile
{
    public string UserId { get; set; } = "";
    public decimal Height { get; set; }
    public decimal Weight { get; set; }
    public string Sex { get; set; } = "";
    public DateOnly BirthDate { get; set; }
    public string[] Conditions { get; set; } = [];
    public string Notes { get; set; } = "";
    public string Goal { get; set; } = "";

    public User? User { get; set; }
}

// 3. Тренировка
public class Workout
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public bool Custom { get; set; }

    public User? User { get; set; }
    public ICollection<WorkoutItem> Items { get; set; } = new List<WorkoutItem>();
}

// 4. Упражнения внутри тренировки
public class WorkoutItem
{
    public long Id { get; set; }
    public string WorkoutId { get; set; } = "";
    public string ExerciseId { get; set; } = "";
    public int Sets { get; set; }
    public int Reps { get; set; }

    public Workout? Workout { get; set; }
}

// 5. Упражнения, добавленные администратором
public class CustomExercise
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = "";
    public string BodyPart { get; set; } = "";
    public string Equipment { get; set; } = "";
    public string Target { get; set; } = "";
    public string Description { get; set; } = "";
    public string VideoUrl { get; set; } = "";
    public string CreatedBy { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }

    public User? Creator { get; set; }
}

// 6. Назначенные тренировки
public class Assignment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PatientId { get; set; } = "";
    public string TherapistId { get; set; } = "";
    public string WorkoutJson { get; set; } = "{}";
    public string? Comment { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public User? Patient { get; set; }
    public User? Therapist { get; set; }
}

// 7. Комментарии пациента
public class PatientComment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PatientId { get; set; } = "";
    public string AuthorId { get; set; } = "";
    public string Text { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }

    public User? Patient { get; set; }
    public User? Author { get; set; }
}

// 8. Сообщения чата
public class ChatMessage
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string FromId { get; set; } = "";
    public string ToId { get; set; } = "";
    public string Text { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }

    public User? Sender { get; set; }
    public User? Receiver { get; set; }
}

// 9. История веса
public class WeightEntry
{
    public string UserId { get; set; } = "";
    public DateOnly Date { get; set; }
    public decimal Weight { get; set; }
    public int? Kcal { get; set; }

    public User? User { get; set; }
}
