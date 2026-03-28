using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin;

public sealed class AdminGeneralExerciseDto
{
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "Beginner";

    public int Points { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class AdminGeneralExerciseUpsertRequestDto
{
    [Required]
    [MinLength(3)]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MinLength(5)]
    [MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Difficulty { get; set; } = "Beginner";

    [Range(0, 100000)]
    public int Points { get; set; }
}
