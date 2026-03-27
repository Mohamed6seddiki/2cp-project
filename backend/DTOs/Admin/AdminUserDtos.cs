using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin;

public sealed class AdminUserDto
{
    public string Id { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string Role { get; set; } = "student";

    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class AdminUserRoleUpdateRequestDto
{
    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = "student";
}
