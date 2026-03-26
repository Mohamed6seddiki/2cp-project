using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public sealed class CodeExecutionRequestDto
{
    [Required]
    [MinLength(1)]
    [MaxLength(20000)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Language { get; set; }

    [MaxLength(20000)]
    public string? Input { get; set; }
}
