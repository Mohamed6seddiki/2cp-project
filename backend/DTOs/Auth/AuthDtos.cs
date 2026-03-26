using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public sealed class AuthLoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(256)]
    public string Password { get; set; } = string.Empty;
}

public sealed class AuthRegisterRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(256)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MinLength(2)]
    [MaxLength(64)]
    public string Username { get; set; } = string.Empty;
}

public sealed class AuthSessionDto
{
    public string AccessToken { get; set; } = string.Empty;

    public string TokenType { get; set; } = "bearer";

    public int ExpiresIn { get; set; }

    public string? RefreshToken { get; set; }

    public AuthUserDto User { get; set; } = new();
}

public sealed class AuthUserDto
{
    public string Id { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Role { get; set; } = "student";
}

public sealed class AuthMeResponseDto
{
    public bool IsAuthenticated { get; set; }

    public AuthUserDto? User { get; set; }
}

public sealed class AuthRegisterResponseDto
{
    public bool RequiresEmailConfirmation { get; set; }

    public string Message { get; set; } = string.Empty;

    public AuthSessionDto? Session { get; set; }
}

public sealed class AuthRefreshRequestDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public sealed class AuthLogoutRequestDto
{
    [MaxLength(50)]
    public string? Scope { get; set; }
}

public sealed class AuthLogoutResponseDto
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;
}
