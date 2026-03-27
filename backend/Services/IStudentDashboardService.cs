using backend.DTOs;

namespace backend.Services;

public interface IStudentDashboardService
{
    Task<DashboardDto> GetDashboardAsync(string studentId, string accessToken, CancellationToken cancellationToken = default);
}
