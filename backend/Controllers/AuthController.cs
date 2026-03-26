using backend.DTOs.Auth;
using backend.DTOs.Common;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EndpointSummary("Authenticate with email and password")]
    [ProducesResponseType(typeof(AuthSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthSessionDto>> Login(
        [FromBody] AuthLoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var session = await _authService.LoginAsync(request, cancellationToken);
        return Ok(session);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [EndpointSummary("Register a new user")]
    [ProducesResponseType(typeof(AuthRegisterResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthRegisterResponseDto>> Register(
        [FromBody] AuthRegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EndpointSummary("Refresh access token")]
    [ProducesResponseType(typeof(AuthSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthSessionDto>> Refresh(
        [FromBody] AuthRefreshRequestDto request,
        CancellationToken cancellationToken)
    {
        var session = await _authService.RefreshAsync(request, cancellationToken);
        return Ok(session);
    }

    [HttpPost("logout")]
    [Authorize]
    [EndpointSummary("Logout current user session")]
    [ProducesResponseType(typeof(AuthLogoutResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthLogoutResponseDto>> Logout(
        [FromBody] AuthLogoutRequestDto request,
        CancellationToken cancellationToken)
    {
        var authorization = Request.Headers.Authorization.ToString();
        var accessToken = authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authorization[7..].Trim()
            : string.Empty;

        var result = await _authService.LogoutAsync(accessToken, request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    [EndpointSummary("Get current authenticated user")]
    [ProducesResponseType(typeof(AuthMeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthMeResponseDto>> Me(CancellationToken cancellationToken)
    {
        var me = await _authService.GetMeAsync(User, cancellationToken);
        return Ok(me);
    }
}
