namespace backend.DTOs;

public sealed class LessonDto
{
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "Beginner";

    public int EstimatedMinutes { get; set; }

    public int OrderIndex { get; set; }
}
