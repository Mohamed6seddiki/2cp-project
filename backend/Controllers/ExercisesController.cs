using backend.DTOs;
using backend.DTOs.Common;
using backend.Middleware;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "student,admin")]
public sealed class ExercisesController : ControllerBase
{
    private readonly IExerciseService _exerciseService;

    public ExercisesController(IExerciseService exerciseService)
    {
        _exerciseService = exerciseService;
    }

    [HttpGet("general")]
    [EndpointSummary("Get general exercises")]
    [ProducesResponseType(typeof(IReadOnlyList<ExerciseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyList<ExerciseDto>>> GetGeneralExercises(CancellationToken cancellationToken)
    {
        var exercises = await _exerciseService.GetGeneralExercisesAsync(cancellationToken);
        return Ok(exercises);
    }

    [HttpPost("{id}/submit")]
    [EndpointSummary("Submit a general exercise result")]
    [ProducesResponseType(typeof(ExerciseSubmissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ExerciseSubmissionDto>> SubmitGeneralExercise(
        string id,
        [FromBody] ExerciseSubmissionRequestDto request,
        CancellationToken cancellationToken)
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

        var submission = await _exerciseService.SubmitGeneralExerciseAsync(studentId, accessToken, id, request.Score, cancellationToken);
        return Ok(submission);
    }

    [HttpPost("/api/lessons/exercises/{id}/submit")]
    [EndpointSummary("Submit a lesson exercise result")]
    [ProducesResponseType(typeof(ExerciseSubmissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ExerciseSubmissionDto>> SubmitLessonExercise(
        string id,
        [FromBody] ExerciseSubmissionRequestDto request,
        CancellationToken cancellationToken)
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

        var submission = await _exerciseService.SubmitLessonExerciseAsync(studentId, accessToken, id, request.Score, cancellationToken);
        return Ok(submission);
    }
}
