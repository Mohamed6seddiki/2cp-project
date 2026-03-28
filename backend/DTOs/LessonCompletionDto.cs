namespace backend.DTOs;

public sealed class LessonCompletionDto
{
    public string LessonId { get; set; } = string.Empty;

    public int CompletedExercises { get; set; }

    public int TotalExercises { get; set; }

    public int ProgressPercent { get; set; }

    public bool IsCompleted { get; set; }

    public IReadOnlyList<LessonExerciseCompletionDto> Exercises { get; set; } = [];
}

public sealed class LessonExerciseCompletionDto
{
    public string ExerciseId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public bool Completed { get; set; }

    public int Score { get; set; }

    public int MaxPoints { get; set; }

    public DateTimeOffset? SubmittedAt { get; set; }
}
