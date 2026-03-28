using System.Text.Json.Serialization;

namespace backend.Models;

public sealed class LessonExerciseCompletionQueryRow
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("points")]
    public int Points { get; set; }

    [JsonPropertyName("student_lesson_exercises")]
    public List<StudentLessonExerciseCompletionRow>? StudentSubmissions { get; set; }
}

public sealed class StudentLessonExerciseCompletionRow
{
    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("score")]
    public int Score { get; set; }

    [JsonPropertyName("completed")]
    public bool Completed { get; set; }

    [JsonPropertyName("submitted_at")]
    public DateTimeOffset SubmittedAt { get; set; }
}
