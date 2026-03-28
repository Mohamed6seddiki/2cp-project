using backend.DTOs.Admin;
using backend.DTOs.Common;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/admin/exercises")]
[Authorize(Roles = "admin")]
public sealed class AdminExercisesController : ControllerBase
{
    private readonly IAdminExerciseService _adminExerciseService;

    public AdminExercisesController(IAdminExerciseService adminExerciseService)
    {
        _adminExerciseService = adminExerciseService;
    }

    [HttpGet("general")]
    [EndpointSummary("Get general exercises for admin management")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminGeneralExerciseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyList<AdminGeneralExerciseDto>>> GetGeneralExercises(CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var exercises = await _adminExerciseService.GetGeneralExercisesAsync(accessToken, cancellationToken);
        return Ok(exercises);
    }

    [HttpPost("general")]
    [EndpointSummary("Create a new general exercise")]
    [ProducesResponseType(typeof(AdminGeneralExerciseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AdminGeneralExerciseDto>> CreateGeneralExercise(
        [FromBody] AdminGeneralExerciseUpsertRequestDto request,
        CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var exercise = await _adminExerciseService.CreateGeneralExerciseAsync(request, accessToken, cancellationToken);
        return Created($"/api/admin/exercises/general/{exercise.Id}", exercise);
    }

    [HttpPut("general/{exerciseId}")]
    [EndpointSummary("Update an existing general exercise")]
    [ProducesResponseType(typeof(AdminGeneralExerciseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AdminGeneralExerciseDto>> UpdateGeneralExercise(
        string exerciseId,
        [FromBody] AdminGeneralExerciseUpsertRequestDto request,
        CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var exercise = await _adminExerciseService.UpdateGeneralExerciseAsync(exerciseId, request, accessToken, cancellationToken);

        if (exercise is null)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "general_exercise_not_found",
                Message = $"General exercise '{exerciseId}' was not found.",
                TraceId = HttpContext.TraceIdentifier
            });
        }

        return Ok(exercise);
    }

    [HttpDelete("general/{exerciseId}")]
    [EndpointSummary("Delete a general exercise")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteGeneralExercise(string exerciseId, CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var deleted = await _adminExerciseService.DeleteGeneralExerciseAsync(exerciseId, accessToken, cancellationToken);

        if (!deleted)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "general_exercise_not_found",
                Message = $"General exercise '{exerciseId}' was not found.",
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
