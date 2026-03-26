using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.Text.Json.Serialization;

namespace backend.Models;

[Table("student_lesson_exercises")]
public sealed class StudentLessonExerciseSubmissionRow : BaseModel
{
    [PrimaryKey("id", false)]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [Column("lesson_exercise_id")]
    [JsonPropertyName("lesson_exercise_id")]
    public string LessonExerciseId { get; set; } = string.Empty;

    [Column("score")]
    [JsonPropertyName("score")]
    public int Score { get; set; }

    [Column("completed")]
    [JsonPropertyName("completed")]
    public bool Completed { get; set; }

    [Column("submitted_at")]
    [JsonPropertyName("submitted_at")]
    public DateTimeOffset SubmittedAt { get; set; }
}
