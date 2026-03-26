using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.Text.Json.Serialization;

namespace backend.Models;

[Table("student_general_exercises")]
public sealed class StudentGeneralExerciseSubmissionRow : BaseModel
{
    [PrimaryKey("id", false)]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [Column("exercise_id")]
    [JsonPropertyName("exercise_id")]
    public string ExerciseId { get; set; } = string.Empty;

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
