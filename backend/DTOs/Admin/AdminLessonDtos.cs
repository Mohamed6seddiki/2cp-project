using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin;

public sealed class AdminLessonDto
{
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "Beginner";

    public int OrderIndex { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class AdminLessonUpsertRequestDto
{
    [Required]
    [MinLength(3)]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MinLength(10)]
    [MaxLength(20000)]
    public string Content { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Difficulty { get; set; } = "Beginner";

    [Range(1, 100000)]
    public int OrderIndex { get; set; } = 1;
}

public sealed class AdminLessonExerciseDto
{
    public string Id { get; set; } = string.Empty;

    public string LessonId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Points { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class AdminLessonExerciseUpsertRequestDto
{
    [Required]
    [MinLength(3)]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MinLength(5)]
    [MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 100000)]
    public int Points { get; set; }
}
