using backend.DTOs.Admin;
using backend.DTOs.Common;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "admin")]
public sealed class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    [EndpointSummary("Get all users for admin management")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminUserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyList<AdminUserDto>>> GetUsers(CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var users = await _adminUserService.GetUsersAsync(accessToken, cancellationToken);
        return Ok(users);
    }

    [HttpPut("{userId}/role")]
    [EndpointSummary("Update a user's role")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AdminUserDto>> UpdateUserRole(
        string userId,
        [FromBody] AdminUserRoleUpdateRequestDto request,
        CancellationToken cancellationToken)
    {
        var accessToken = TryGetAccessToken();
        var user = await _adminUserService.UpdateUserRoleAsync(userId, request.Role, accessToken, cancellationToken);

        if (user is null)
        {
            return NotFound(new ApiErrorDto
            {
                Status = StatusCodes.Status404NotFound,
                Code = "user_not_found",
                Message = $"User '{userId}' was not found.",
                TraceId = HttpContext.TraceIdentifier
            });
        }

        return Ok(user);
    }

    private string TryGetAccessToken()
    {
        var authorization = Request.Headers.Authorization.ToString();
        return authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authorization[7..].Trim()
            : string.Empty;
    }
}
