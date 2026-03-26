using System.Text.Json.Serialization;

namespace backend.Models;

public sealed class ProgressRpcResult
{
    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("total_score")]
    public int TotalScore { get; set; }

    [JsonPropertyName("lesson_exercises")]
    public List<ProgressExerciseRpcItem>? LessonExercises { get; set; }

    [JsonPropertyName("general_exercises")]
    public List<ProgressExerciseRpcItem>? GeneralExercises { get; set; }
}

public sealed class ProgressExerciseRpcItem
{
    [JsonPropertyName("exercise_id")]
    public string ExerciseId { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("score")]
    public int Score { get; set; }

    [JsonPropertyName("completed")]
    public bool Completed { get; set; }

    [JsonPropertyName("submitted_at")]
    public DateTimeOffset SubmittedAt { get; set; }
}
