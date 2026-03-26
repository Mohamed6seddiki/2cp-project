using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public sealed class ExerciseSubmissionRequestDto
{
    [Range(0, int.MaxValue)]
    public int Score { get; set; }
}

public sealed class ExerciseSubmissionDto
{
    public string SubmissionId { get; set; } = string.Empty;

    public string ExerciseId { get; set; } = string.Empty;

    public int Score { get; set; }

    public bool Completed { get; set; }

    public DateTimeOffset SubmittedAt { get; set; }
}
