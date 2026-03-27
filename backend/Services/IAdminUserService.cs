using backend.DTOs.Admin;

namespace backend.Services;

public interface IAdminUserService
{
    Task<IReadOnlyList<AdminUserDto>> GetUsersAsync(string accessToken, CancellationToken cancellationToken = default);

    Task<AdminUserDto?> UpdateUserRoleAsync(string userId, string role, string accessToken, CancellationToken cancellationToken = default);
}
