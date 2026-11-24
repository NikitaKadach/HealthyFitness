using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261124160803_InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "users",
            columns: table => new
            {
                id = table.Column<string>(type: "text", nullable: false),
                email = table.Column<string>(type: "text", nullable: false),
                hash = table.Column<string>(type: "text", nullable: false),
                role = table.Column<string>(type: "text", nullable: false),
                name = table.Column<string>(type: "text", nullable: true),
                consent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_users", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "assignments",
            columns: table => new
            {
                id = table.Column<string>(type: "text", nullable: false),
                patient_id = table.Column<string>(type: "text", nullable: false),
                therapist_id = table.Column<string>(type: "text", nullable: false),
                workout = table.Column<string>(type: "jsonb", nullable: false),
                comment = table.Column<string>(type: "text", nullable: true),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_assignments", x => x.id);
                table.ForeignKey(
                    name: "FK_assignments_users_patient_id",
                    column: x => x.patient_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_assignments_users_therapist_id",
                    column: x => x.therapist_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "chat_messages",
            columns: table => new
            {
                id = table.Column<string>(type: "text", nullable: false),
                from_id = table.Column<string>(type: "text", nullable: false),
                to_id = table.Column<string>(type: "text", nullable: false),
                text = table.Column<string>(type: "text", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_chat_messages", x => x.id);
                table.ForeignKey(
                    name: "FK_chat_messages_users_from_id",
                    column: x => x.from_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_chat_messages_users_to_id",
                    column: x => x.to_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "custom_exercises",
            columns: table => new
            {
                id = table.Column<string>(type: "text", nullable: false),
                name = table.Column<string>(type: "text", nullable: false),
                body_part = table.Column<string>(type: "text", nullable: false),
                equipment = table.Column<string>(type: "text", nullable: false),
                target = table.Column<string>(type: "text", nullable: false),
                description = table.Column<string>(type: "text", nullable: false),
                video_url = table.Column<string>(type: "text", nullable: false),
                created_by = table.Column<string>(type: "text", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_custom_exercises", x => x.id);
                table.ForeignKey(
                    name: "FK_custom_exercises_users_created_by",
                    column: x => x.created_by,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "patient_comments",
            columns: table => new
            {
                id = table.Column<string>(type: "text", nullable: false),
                patient_id = table.Column<string>(type: "text", nullable: false),
                author_id = table.Column<string>(type: "text", nullable: false),
                text = table.Column<string>(type: "text", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_patient_comments", x => x.id);
                table.ForeignKey(
                    name: "FK_patient_comments_users_author_id",
                    column: x => x.author_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_patient_comments_users_patient_id",
                    column: x => x.patient_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "profiles",
            columns: table => new
            {
                user_id = table.Column<string>(type: "text", nullable: false),
                height = table.Column<decimal>(type: "numeric", nullable: false),
                weight = table.Column<decimal>(type: "numeric", nullable: false),
                sex = table.Column<string>(type: "text", nullable: false),
                birth_date = table.Column<DateOnly>(type: "date", nullable: false),
                conditions = table.Column<string[]>(type: "text[]", nullable: false),
                notes = table.Column<string>(type: "text", nullable: false),
                goal = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_profiles", x => x.user_id);
                table.ForeignKey(
                    name: "FK_profiles_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "weight_entries",
            columns: table => new
            {
                user_id = table.Column<string>(type: "text", nullable: false),
                date = table.Column<DateOnly>(type: "date", nullable: false),
                weight = table.Column<decimal>(type: "numeric", nullable: false),
                kcal = table.Column<int>(type: "integer", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_weight_entries", x => new { x.user_id, x.date });
                table.ForeignKey(
                    name: "FK_weight_entries_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "workouts",
            columns: table => new
            {
                id = table.Column<string>(type: "text", nullable: false),
                user_id = table.Column<string>(type: "text", nullable: false),
                title = table.Column<string>(type: "text", nullable: false),
                description = table.Column<string>(type: "text", nullable: true),
                custom = table.Column<bool>(type: "boolean", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_workouts", x => x.id);
                table.ForeignKey(
                    name: "FK_workouts_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "workout_items",
            columns: table => new
            {
                id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                workout_id = table.Column<string>(type: "text", nullable: false),
                exercise_id = table.Column<string>(type: "text", nullable: false),
                sets = table.Column<int>(type: "integer", nullable: false),
                reps = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_workout_items", x => x.id);
                table.ForeignKey(
                    name: "FK_workout_items_workouts_workout_id",
                    column: x => x.workout_id,
                    principalTable: "workouts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_assignments_patient_id",
            table: "assignments",
            column: "patient_id");

        migrationBuilder.CreateIndex(
            name: "IX_assignments_therapist_id",
            table: "assignments",
            column: "therapist_id");

        migrationBuilder.CreateIndex(
            name: "IX_chat_messages_from_id",
            table: "chat_messages",
            column: "from_id");

        migrationBuilder.CreateIndex(
            name: "IX_chat_messages_to_id",
            table: "chat_messages",
            column: "to_id");

        migrationBuilder.CreateIndex(
            name: "IX_custom_exercises_created_by",
            table: "custom_exercises",
            column: "created_by");

        migrationBuilder.CreateIndex(
            name: "IX_patient_comments_author_id",
            table: "patient_comments",
            column: "author_id");

        migrationBuilder.CreateIndex(
            name: "IX_patient_comments_patient_id",
            table: "patient_comments",
            column: "patient_id");

        migrationBuilder.CreateIndex(
            name: "IX_users_email",
            table: "users",
            column: "email",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_workout_items_workout_id",
            table: "workout_items",
            column: "workout_id");

        migrationBuilder.CreateIndex(
            name: "IX_workouts_user_id",
            table: "workouts",
            column: "user_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "assignments");

        migrationBuilder.DropTable(
            name: "chat_messages");

        migrationBuilder.DropTable(
            name: "custom_exercises");

        migrationBuilder.DropTable(
            name: "patient_comments");

        migrationBuilder.DropTable(
            name: "profiles");

        migrationBuilder.DropTable(
            name: "weight_entries");

        migrationBuilder.DropTable(
            name: "workout_items");

        migrationBuilder.DropTable(
            name: "workouts");

        migrationBuilder.DropTable(
            name: "users");
    }
}
