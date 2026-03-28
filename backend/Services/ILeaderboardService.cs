using backend.DTOs;

namespace backend.Services;

public interface ILeaderboardService
{
    Task<LeaderboardDto> GetLeaderboardAsync(string studentId, string accessToken, CancellationToken cancellationToken = default);
}
