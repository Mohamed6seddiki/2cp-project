using backend.DTOs.Admin;
using backend.DTOs.Common;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/admin/lessons")]
[Authorize(Roles = "admin")]
public sealed class AdminLessonsController : ControllerBase
{
    private readonly IAdminLessonService _adminLessonService;

    public AdminLessonsController(IAdminLessonService adminLessonService)
    {
        _adminLessonService = adminLessonService;
    }

    [HttpGet]
    [EndpointSummary("Get all lessons for admin management")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminLessonDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyList<AdminLessonDto>>> GetLessons(CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var lessons = await _adminLessonService.GetLessonsAsync(accessToken, cancellationToken);
        return Ok(lessons);
    }

    [HttpPost]
    [EndpointSummary("Create a new lesson")]
    [ProducesResponseType(typeof(AdminLessonDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AdminLessonDto>> CreateLesson(
        [FromBody] AdminLessonUpsertRequestDto request,
        CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var lesson = await _adminLessonService.CreateLessonAsync(request, accessToken, cancellationToken);
        return Created($"/api/admin/lessons/{lesson.Id}", lesson);
    }

    [HttpPut("{lessonId}")]
    [EndpointSummary("Update an existing lesson")]
    [ProducesResponseType(typeof(AdminLessonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AdminLessonDto>> UpdateLesson(
        string lessonId,
        [FromBody] AdminLessonUpsertRequestDto request,
        CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var lesson = await _adminLessonService.UpdateLessonAsync(lessonId, request, accessToken, cancellationToken);

        if (lesson is null)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "lesson_not_found",
                Message = $"Lesson '{lessonId}' was not found.",
                TraceId = HttpContext.TraceIdentifier
            });
        }

        return Ok(lesson);
    }

    [HttpDelete("{lessonId}")]
    [EndpointSummary("Delete a lesson")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteLesson(string lessonId, CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var deleted = await _adminLessonService.DeleteLessonAsync(lessonId, accessToken, cancellationToken);

        if (!deleted)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "lesson_not_found",
                Message = $"Lesson '{lessonId}' was not found.",
                TraceId = HttpContext.TraceIdentifier
            });
        }

        return NoContent();
    }

    [HttpGet("{lessonId}/exercises")]
    [EndpointSummary("Get exercises for a lesson")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminLessonExerciseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyList<AdminLessonExerciseDto>>> GetLessonExercises(
        string lessonId,
        CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var exercises = await _adminLessonService.GetLessonExercisesAsync(lessonId, accessToken, cancellationToken);
        return Ok(exercises);
    }

    [HttpPost("{lessonId}/exercises")]
    [EndpointSummary("Create a lesson exercise")]
    [ProducesResponseType(typeof(AdminLessonExerciseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AdminLessonExerciseDto>> CreateLessonExercise(
        string lessonId,
        [FromBody] AdminLessonExerciseUpsertRequestDto request,
        CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var exercise = await _adminLessonService.CreateLessonExerciseAsync(lessonId, request, accessToken, cancellationToken);
        return Created($"/api/admin/lessons/exercises/{exercise.Id}", exercise);
    }

    [HttpPut("exercises/{lessonExerciseId}")]
    [EndpointSummary("Update a lesson exercise")]
    [ProducesResponseType(typeof(AdminLessonExerciseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AdminLessonExerciseDto>> UpdateLessonExercise(
        string lessonExerciseId,
        [FromBody] AdminLessonExerciseUpsertRequestDto request,
        CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var exercise = await _adminLessonService.UpdateLessonExerciseAsync(lessonExerciseId, request, accessToken, cancellationToken);

        if (exercise is null)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "lesson_exercise_not_found",
                Message = $"Lesson exercise '{lessonExerciseId}' was not found.",
                TraceId = HttpContext.TraceIdentifier
            });
        }

        return Ok(exercise);
    }

    [HttpDelete("exercises/{lessonExerciseId}")]
    [EndpointSummary("Delete a lesson exercise")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteLessonExercise(string lessonExerciseId, CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var deleted = await _adminLessonService.DeleteLessonExerciseAsync(lessonExerciseId, accessToken, cancellationToken);

        if (!deleted)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "lesson_exercise_not_found",
                Message = $"Lesson exercise '{lessonExerciseId}' was not found.",
                TraceId = HttpContext.TraceIdentifier
            });
        }

        return NoContent();
    }

    private string TryGetAccessToken()
    {
        var authorization = Request.Headers.Authorization.ToString();
        return authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authorization[7..].Trim()
            : string.Empty;
    }
}
