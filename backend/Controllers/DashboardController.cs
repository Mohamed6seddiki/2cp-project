using backend.DTOs;
using backend.DTOs.Common;
using backend.Middleware;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "student")]
public sealed class DashboardController : ControllerBase
{
    private readonly IStudentDashboardService _studentDashboardService;

    public DashboardController(IStudentDashboardService studentDashboardService)
    {
        _studentDashboardService = studentDashboardService;
    }

    [HttpGet("me")]
    [EndpointSummary("Get dashboard data for current student")]
    [ProducesResponseType(typeof(DashboardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DashboardDto>> GetMyDashboard(CancellationToken cancellationToken)
    {
        var studentId = GetCurrentUserId();
        var accessToken = TryGetAccessToken();

        var dashboard = await _studentDashboardService.GetDashboardAsync(studentId, accessToken, cancellationToken);
        return Ok(dashboard);
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
