using backend.DTOs.Auth;
using System.Security.Claims;

namespace backend.Services;

public interface IAuthService
{
    Task<AuthSessionDto> LoginAsync(AuthLoginRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthRegisterResponseDto> RegisterAsync(AuthRegisterRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthSessionDto> RefreshAsync(AuthRefreshRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthLogoutResponseDto> LogoutAsync(string accessToken, AuthLogoutRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthMeResponseDto> GetMeAsync(ClaimsPrincipal principal, string? accessToken, CancellationToken cancellationToken = default);
}
