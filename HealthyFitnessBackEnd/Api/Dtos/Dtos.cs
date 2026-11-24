namespace Api.Dtos;

// Имена полей (camelCase при сериализации) совпадают с типами фронтенда: src/types.ts

public record ErrorDto(string Error);

public record ProfileDto(decimal Height, decimal Weight, string Sex, string Birth, string[]? Conditions, string? Notes, string? Goal);

public record UserDto(string Id, string Email, string Role, string? Name, DateTimeOffset? ConsentAt, ProfileDto? Profile);

public record RegisterRequest(string Email, string Password, string? Role, string? Name);
public record LoginRequest(string Email, string Password);
public record ResetPasswordRequest(string Email, string Code, string Password);
public record AuthResponse(string Token, UserDto User);
public record RoleRequest(string Role);

public record WorkoutItemDto(string ExerciseId, int Sets, int Reps);
public record WorkoutDto(string? Id, string Title, string? Description, List<WorkoutItemDto> Items, bool? Custom);

public record CreateCustomExerciseRequest(string Name, string BodyPart, string Equipment, string Target, string Description, string VideoUrl);
public record CustomExerciseDto(string Id, string Name, string BodyPart, string Equipment, string Target, string Description, string VideoUrl, string CreatedBy, DateTimeOffset CreatedAt);
public record VideoUploadResponse(string Url);

public record CreateAssignmentRequest(string PatientId, WorkoutDto Workout, string? Comment);
public record AssignmentDto(string Id, string PatientId, string TherapistId, WorkoutDto Workout, string? Comment, DateTimeOffset CreatedAt);

public record TextRequest(string Text);
public record PatientCommentDto(string Id, string PatientId, string AuthorId, string Text, DateTimeOffset CreatedAt);

public record SendMessageRequest(string To, string Text);
public record ChatMessageDto(string Id, string From, string To, string Text, DateTimeOffset CreatedAt);

public record WeightEntryDto(DateOnly Date, decimal Weight, int? Kcal);
