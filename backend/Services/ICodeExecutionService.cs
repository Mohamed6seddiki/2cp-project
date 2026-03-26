using backend.DTOs;

namespace backend.Services;

public interface ICodeExecutionService
{
    Task<CodeExecutionResponseDto> ExecuteAsync(CodeExecutionRequestDto request, CancellationToken cancellationToken = default);
}
