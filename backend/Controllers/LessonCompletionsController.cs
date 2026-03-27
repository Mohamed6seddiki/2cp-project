using backend.DTOs;
using backend.DTOs.Common;
using backend.Middleware;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/lessons")]
[Authorize(Roles = "student")]
public sealed class LessonCompletionsController : ControllerBase
{
    private readonly ILessonCompletionService _lessonCompletionService;

    public LessonCompletionsController(ILessonCompletionService lessonCompletionService)
    {
        _lessonCompletionService = lessonCompletionService;
    }

    [HttpGet("completions/me")]
    [EndpointSummary("Get completion progress for all lessons")]
    [ProducesResponseType(typeof(IReadOnlyList<LessonCompletionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyList<LessonCompletionDto>>> GetMyLessonCompletions(CancellationToken cancellationToken)
    {
        var studentId = GetCurrentUserId();
        var accessToken = TryGetAccessToken();

        var completions = await _lessonCompletionService.GetAllLessonCompletionsAsync(studentId, accessToken, cancellationToken);
        return Ok(completions);
    }

    [HttpGet("{lessonId}/completion")]
    [EndpointSummary("Get current student's lesson completion details")]
    [ProducesResponseType(typeof(LessonCompletionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<LessonCompletionDto>> GetLessonCompletion(string lessonId, CancellationToken cancellationToken)
    {
        var studentId = GetCurrentUserId();
        var accessToken = TryGetAccessToken();

        var completion = await _lessonCompletionService.GetLessonCompletionAsync(studentId, lessonId, accessToken, cancellationToken);
        if (completion is null)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "lesson_not_found",
                Message = $"Lesson '{lessonId}' was not found.",
                TraceId = HttpContext.TraceIdentifier
            });
        }

        return Ok(completion);
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
