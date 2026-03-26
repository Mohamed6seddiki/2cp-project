namespace backend.Models;

public sealed class ExerciseModel
{
    public string Id { get; set; } = string.Empty;

    public string? LessonId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "Beginner";

    public int Points { get; set; }
}
