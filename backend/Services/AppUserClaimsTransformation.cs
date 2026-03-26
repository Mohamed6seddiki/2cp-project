using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace backend.Services;

public sealed class AppUserClaimsTransformation : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
        {
            return Task.FromResult(principal);
        }

        var role = principal.FindFirst("app_role")?.Value
            ?? principal.FindFirst("role")?.Value
            ?? principal.FindFirst("user_role")?.Value
            ?? "student";

        if (!identity.HasClaim(claim => claim.Type == ClaimTypes.Role && claim.Value == role))
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, role));
        }

        return Task.FromResult(principal);
    }
}
