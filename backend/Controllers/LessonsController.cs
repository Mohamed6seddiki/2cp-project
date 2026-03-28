using backend.DTOs;
using backend.DTOs.Common;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "student,admin")]
public sealed class LessonsController : ControllerBase
{
    private readonly ILessonService _lessonService;

    public LessonsController(ILessonService lessonService)
    {
        _lessonService = lessonService;
    }

    [HttpGet]
    [EndpointSummary("Get all lessons")]
    [ProducesResponseType(typeof(IReadOnlyList<LessonDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyList<LessonDto>>> GetLessons(CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var lessons = await _lessonService.GetLessonsAsync(accessToken, cancellationToken);
        return Ok(lessons);
    }

    [HttpGet("{id}")]
    [EndpointSummary("Get lesson details by id")]
    [ProducesResponseType(typeof(LessonDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<LessonDetailDto>> GetLessonById(string id, CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var lesson = await _lessonService.GetLessonByIdAsync(id, accessToken, cancellationToken);
        if (lesson is null)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "lesson_not_found",
                Message = $"Lesson '{id}' was not found.",
                TraceId = HttpContext.TraceIdentifier
            });
        }

        return Ok(lesson);
    }

    private string TryGetAccessToken()
    {
        var authorization = Request.Headers.Authorization.ToString();
        return authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authorization[7..].Trim()
            : string.Empty;
    }
}
