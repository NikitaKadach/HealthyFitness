
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutItem> WorkoutItems => Set<WorkoutItem>();
    public DbSet<CustomExercise> CustomExercises => Set<CustomExercise>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<PatientComment> PatientComments => Set<PatientComment>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<WeightEntry> WeightEntries => Set<WeightEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Пользователи
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Email).HasColumnName("email");
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.PasswordHash).HasColumnName("hash");
            e.Property(x => x.Role).HasColumnName("role");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.ConsentAt).HasColumnName("consent_at");
        });

        // Профили
        modelBuilder.Entity<Profile>(e =>
        {
            e.ToTable("profiles");
            e.HasKey(x => x.UserId);
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Height).HasColumnName("height");
            e.Property(x => x.Weight).HasColumnName("weight");
            e.Property(x => x.Sex).HasColumnName("sex");
            e.Property(x => x.BirthDate).HasColumnName("birth_date");
            e.Property(x => x.Conditions).HasColumnName("conditions").HasColumnType("text[]");
            e.Property(x => x.Notes).HasColumnName("notes");
            e.Property(x => x.Goal).HasColumnName("goal");

            e.HasOne(x => x.User)
                .WithOne(x => x.Profile)
                .HasForeignKey<Profile>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Тренировки
        modelBuilder.Entity<Workout>(e =>
        {
            e.ToTable("workouts");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Title).HasColumnName("title");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.Custom).HasColumnName("custom");

            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Упражнения внутри тренировок
        modelBuilder.Entity<WorkoutItem>(e =>
        {
            e.ToTable("workout_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").UseIdentityByDefaultColumn();
            e.Property(x => x.WorkoutId).HasColumnName("workout_id");
            e.Property(x => x.ExerciseId).HasColumnName("exercise_id");
            e.Property(x => x.Sets).HasColumnName("sets");
            e.Property(x => x.Reps).HasColumnName("reps");

            e.HasOne(x => x.Workout)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Пользовательские упражнения
        modelBuilder.Entity<CustomExercise>(e =>
        {
            e.ToTable("custom_exercises");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.BodyPart).HasColumnName("body_part");
            e.Property(x => x.Equipment).HasColumnName("equipment");
            e.Property(x => x.Target).HasColumnName("target");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.VideoUrl).HasColumnName("video_url");
            e.Property(x => x.CreatedBy).HasColumnName("created_by");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasOne(x => x.Creator)
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Назначения
        modelBuilder.Entity<Assignment>(e =>
        {
            e.ToTable("assignments");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.PatientId).HasColumnName("patient_id");
            e.Property(x => x.TherapistId).HasColumnName("therapist_id");
            e.Property(x => x.WorkoutJson).HasColumnName("workout").HasColumnType("jsonb");
            e.Property(x => x.Comment).HasColumnName("comment");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasOne(x => x.Patient)
                .WithMany()
                .HasForeignKey(x => x.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Therapist)
                .WithMany()
                .HasForeignKey(x => x.TherapistId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Комментарии
        modelBuilder.Entity<PatientComment>(e =>
        {
            e.ToTable("patient_comments");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.PatientId).HasColumnName("patient_id");
            e.Property(x => x.AuthorId).HasColumnName("author_id");
            e.Property(x => x.Text).HasColumnName("text");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasOne(x => x.Patient)
                .WithMany()
                .HasForeignKey(x => x.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Author)
                .WithMany()
                .HasForeignKey(x => x.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Сообщения чата
        modelBuilder.Entity<ChatMessage>(e =>
        {
            e.ToTable("chat_messages");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.FromId).HasColumnName("from_id");
            e.Property(x => x.ToId).HasColumnName("to_id");
            e.Property(x => x.Text).HasColumnName("text");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasOne(x => x.Sender)
                .WithMany()
                .HasForeignKey(x => x.FromId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Receiver)
                .WithMany()
                .HasForeignKey(x => x.ToId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // История веса
        modelBuilder.Entity<WeightEntry>(e =>
        {
            e.ToTable("weight_entries");
            e.HasKey(x => new { x.UserId, x.Date });
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Date).HasColumnName("date");
            e.Property(x => x.Weight).HasColumnName("weight");
            e.Property(x => x.Kcal).HasColumnName("kcal");

            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
