using backend.DTOs;
using backend.DTOs.Common;
using backend.Middleware;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize(Roles = "student,admin")]
public sealed class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpGet("me")]
    [EndpointSummary("Get progress for current user")]
    [ProducesResponseType(typeof(ProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ProgressDto>> GetMyProgress(CancellationToken cancellationToken)
    {
        var studentId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(studentId))
        {
            studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        }
        var authorization = Request.Headers.Authorization.ToString();
        var accessToken = authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authorization[7..].Trim()
            : string.Empty;

        if (string.IsNullOrWhiteSpace(studentId))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is invalid.");
        }

        var progress = await _progressService.GetStudentProgressAsync(studentId, accessToken, cancellationToken);
        return Ok(progress);
    }
}
