using backend.DTOs;
using backend.DTOs.Common;
using backend.Middleware;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/leaderboard")]
[Authorize(Roles = "student")]
public sealed class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardController(ILeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService;
    }

    [HttpGet]
    [EndpointSummary("Get leaderboard for students")]
    [ProducesResponseType(typeof(LeaderboardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<LeaderboardDto>> GetLeaderboard(CancellationToken cancellationToken)
    {
        var studentId = GetCurrentUserId();
        var accessToken = TryGetAccessToken();

        var leaderboard = await _leaderboardService.GetLeaderboardAsync(studentId, accessToken, cancellationToken);
        return Ok(leaderboard);
    }

    private string GetCurrentUserId()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        }

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is invalid.");
        }

        return userId.Trim();
    }

    private string TryGetAccessToken()
    {
        var authorization = Request.Headers.Authorization.ToString();
        return authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authorization[7..].Trim()
            : string.Empty;
    }
}
