using System.Security.Claims;
using System.Text.Json;
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

        var role = ResolveRole(principal) ?? "student";

        if (!identity.HasClaim(claim => claim.Type == ClaimTypes.Role && claim.Value == role))
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, role));
        }

        return Task.FromResult(principal);
    }

    private static string? ResolveRole(ClaimsPrincipal principal)
    {
        var candidates = new[]
        {
            principal.FindFirst("app_role")?.Value,
            principal.FindFirst("user_role")?.Value,
            ExtractRoleFromJsonClaim(principal, "user_metadata"),
            ExtractRoleFromJsonClaim(principal, "app_metadata"),
            principal.FindFirst("role")?.Value,
            principal.FindFirst(ClaimTypes.Role)?.Value
        };

        foreach (var candidate in candidates)
        {
            var normalizedRole = NormalizeRole(candidate);
            if (normalizedRole is not null)
            {
                return normalizedRole;
            }
        }

        return null;
    }

    private static string? ExtractRoleFromJsonClaim(ClaimsPrincipal principal, string claimName)
    {
        var rawJson = principal.FindFirst(claimName)?.Value;
        if (string.IsNullOrWhiteSpace(rawJson))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(rawJson);
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            if (!root.TryGetProperty("role", out var roleElement))
            {
                return null;
            }

            return roleElement.ValueKind == JsonValueKind.String ? roleElement.GetString() : roleElement.ToString();
        }
        catch
        {
            return null;
        }
    }

    private static string? NormalizeRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return null;
        }

        var normalized = role.Trim().ToLowerInvariant();
        return normalized is "admin" or "student" ? normalized : null;
    }
}
