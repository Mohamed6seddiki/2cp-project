using backend.DTOs;
using backend.DTOs.Common;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/code")]
[Authorize(Roles = "student,admin")]
public sealed class CodeExecutionController : ControllerBase
{
    private readonly ICodeExecutionService _codeExecutionService;

    public CodeExecutionController(ICodeExecutionService codeExecutionService)
    {
        _codeExecutionService = codeExecutionService;
    }

    [HttpPost("execute")]
    [EndpointSummary("Execute MyAlgo code")]
    [ProducesResponseType(typeof(CodeExecutionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CodeExecutionResponseDto>> Execute(
        [FromBody] CodeExecutionRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _codeExecutionService.ExecuteAsync(request, cancellationToken);
        return Ok(result);
    }
}
