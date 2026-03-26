using backend.DTOs;

namespace backend.Services;

public interface IProgressService
{
    Task<ProgressDto> GetStudentProgressAsync(string studentId, string accessToken, CancellationToken cancellationToken = default);
}
