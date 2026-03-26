namespace backend.DTOs;

public sealed class ProgressDto
{
    public string StudentId { get; set; } = string.Empty;

    public int TotalScore { get; set; }

    public IReadOnlyList<ProgressExerciseItemDto> LessonExercises { get; set; } = [];

    public IReadOnlyList<ProgressExerciseItemDto> GeneralExercises { get; set; } = [];
}

public sealed class ProgressExerciseItemDto
{
    public string ExerciseId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public int Score { get; set; }

    public bool Completed { get; set; }

    public DateTimeOffset SubmittedAt { get; set; }
}
