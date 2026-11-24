using System.Text.Json;
using Api.Dtos;
using Domain.Entities;

namespace Api.Services;

public static class Mapping
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static ProfileDto ToDto(this Profile p) =>
        new(p.Height, p.Weight, p.Sex, p.BirthDate.ToString("yyyy-MM-dd"), p.Conditions, p.Notes, p.Goal);

    public static UserDto ToDto(this User u) =>
        new(u.Id, u.Email, u.Role, u.Name, u.ConsentAt, u.Profile?.ToDto());

    // Для списков собеседников: без согласия и медицинских данных
    public static UserDto ToContactDto(this User u) =>
        new(u.Id, u.Email, u.Role, u.Name, null, null);

    public static WorkoutDto ToDto(this Workout w) =>
        new(w.Id, w.Title, w.Description,
            w.Items.OrderBy(i => i.Id).Select(i => new WorkoutItemDto(i.ExerciseId, i.Sets, i.Reps)).ToList(),
            w.Custom);

    public static CustomExerciseDto ToDto(this CustomExercise e) =>
        new(e.Id, e.Name, e.BodyPart, e.Equipment, e.Target, e.Description, e.VideoUrl, e.CreatedBy, e.CreatedAt);

    public static AssignmentDto ToDto(this Assignment a)
    {
        var workout = JsonSerializer.Deserialize<WorkoutDto>(a.WorkoutJson, Json)
                      ?? new WorkoutDto(null, "", null, new List<WorkoutItemDto>(), null);
        return new AssignmentDto(a.Id, a.PatientId, a.TherapistId, workout, a.Comment, a.CreatedAt);
    }

    public static PatientCommentDto ToDto(this PatientComment c) =>
        new(c.Id, c.PatientId, c.AuthorId, c.Text, c.CreatedAt);

    public static ChatMessageDto ToDto(this ChatMessage m) =>
        new(m.Id, m.FromId, m.ToId, m.Text, m.CreatedAt);

    public static WeightEntryDto ToDto(this WeightEntry e) =>
        new(e.Date, e.Weight, e.Kcal);
}
