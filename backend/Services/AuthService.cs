using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using backend.DTOs.Auth;
using backend.Middleware;
using backend.Models;
using backend.Supabase;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class AuthService : IAuthService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;
    private readonly ISupabaseClientFactory _supabaseClientFactory;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseOptions> supabaseOptions,
        ISupabaseClientFactory supabaseClientFactory,
        ILogger<AuthService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
        _supabaseClientFactory = supabaseClientFactory;
        _logger = logger;
    }

    public async Task<AuthSessionDto> LoginAsync(AuthLoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var response = await PostAuthAsync(
            "/auth/v1/token?grant_type=password",
            new
            {
                email = normalizedEmail,
                password = request.Password
            },
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureSuccess(response.StatusCode, payload);

        using var document = JsonDocument.Parse(payload);
        return await BuildSessionDtoAsync(document.RootElement, cancellationToken);
    }

    public async Task<AuthRegisterResponseDto> RegisterAsync(AuthRegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedUsername = NormalizeUsername(request.Username, normalizedEmail);

        var response = await PostAuthAsync(
            "/auth/v1/signup",
            new
            {
                email = normalizedEmail,
                password = request.Password,
                data = new
                {
                    username = normalizedUsername,
                    name = normalizedUsername,
                    preferred_username = normalizedUsername,
                    role = "student"
                }
            },
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureSuccess(response.StatusCode, payload);

        using var document = JsonDocument.Parse(payload);
        var root = document.RootElement;
        var hasSession = TryGetString(root, "access_token") is not null;

        if (!hasSession)
        {
            return new AuthRegisterResponseDto
            {
                RequiresEmailConfirmation = true,
                Message = "Account created. Please confirm your email, then login."
            };
        }

        var session = await BuildSessionDtoAsync(root, cancellationToken);

        return new AuthRegisterResponseDto
        {
            RequiresEmailConfirmation = false,
            Message = "Account created successfully.",
            Session = session
        };
    }

    public async Task<AuthSessionDto> RefreshAsync(AuthRefreshRequestDto request, CancellationToken cancellationToken = default)
    {
        var refreshToken = request.RefreshToken?.Trim();
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "bad_request", "Refresh token is required.");
        }

        var response = await PostAuthAsync(
            "/auth/v1/token?grant_type=refresh_token",
            new { refresh_token = refreshToken },
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureSuccess(response.StatusCode, payload);

        using var document = JsonDocument.Parse(payload);
        return await BuildSessionDtoAsync(document.RootElement, cancellationToken);
    }

    public async Task<AuthLogoutResponseDto> LogoutAsync(
        string accessToken,
        AuthLogoutRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is required.");
        }

        var normalizedScope = string.IsNullOrWhiteSpace(request.Scope)
            ? "global"
            : request.Scope.Trim().ToLowerInvariant();

        var scope = normalizedScope is "global" or "local" or "others"
            ? normalizedScope
            : "global";

        var client = CreateAuthHttpClient(accessToken);
        var response = await client.PostAsJsonAsync(
            $"/auth/v1/logout?scope={scope}",
            new { },
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureSuccess(response.StatusCode, payload);

        return new AuthLogoutResponseDto
        {
            Success = true,
            Message = "Logged out successfully."
        };
    }

    public async Task<AuthMeResponseDto> GetMeAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default)
    {
        if (principal.Identity?.IsAuthenticated != true)
        {
            return new AuthMeResponseDto { IsAuthenticated = false };
        }

        var userId = principal.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is invalid.");
        }

        var email = principal.FindFirst("email")?.Value ?? string.Empty;
        var profile = await TryGetUserProfileAsync(userId, cancellationToken);
        var username = profile?.Username
            ?? principal.FindFirst("app_username")?.Value
            ?? principal.FindFirst("preferred_username")?.Value
            ?? BuildUsernameFromEmail(email);
        var role = profile?.Role
            ?? principal.FindFirst("app_role")?.Value
            ?? principal.FindFirst(ClaimTypes.Role)?.Value
            ?? "student";

        return new AuthMeResponseDto
        {
            IsAuthenticated = true,
            User = new AuthUserDto
            {
                Id = userId,
                Email = profile?.Email ?? email,
                Username = username,
                Name = username,
                Role = role
            }
        };
    }

    private async Task<HttpResponseMessage> PostAuthAsync(string relativeUrl, object payload, CancellationToken cancellationToken)
    {
        var client = CreateAuthHttpClient(_supabaseOptions.ServiceKey);
        return await client.PostAsJsonAsync(relativeUrl, payload, cancellationToken);
    }

    private HttpClient CreateAuthHttpClient(string bearerToken)
    {
        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(_supabaseOptions.Url.TrimEnd('/'));
        client.DefaultRequestHeaders.Add("apikey", _supabaseOptions.ServiceKey);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", bearerToken);
        return client;
    }

    private async Task<AuthSessionDto> BuildSessionDtoAsync(JsonElement root, CancellationToken cancellationToken)
    {
        var accessToken = TryGetString(root, "access_token")
            ?? throw new ApiException(StatusCodes.Status500InternalServerError, "invalid_auth_response", "Missing access token in auth response.");
        var tokenType = TryGetString(root, "token_type") ?? "bearer";
        var expiresIn = TryGetInt(root, "expires_in") ?? 3600;
        var refreshToken = TryGetString(root, "refresh_token");

        var userElement = root.TryGetProperty("user", out var parsedUser) ? parsedUser : default;
        var userId = userElement.ValueKind == JsonValueKind.Object
            ? TryGetString(userElement, "id")
            : null;
        var email = userElement.ValueKind == JsonValueKind.Object
            ? TryGetString(userElement, "email")
            : null;
        var (metaUsername, metaRole) = userElement.ValueKind == JsonValueKind.Object
            ? ExtractUserMetadata(userElement)
            : (null, null);

        UserProfileRow? profile = null;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            profile = await TryGetUserProfileAsync(userId, cancellationToken);
        }

        var finalEmail = profile?.Email ?? email ?? string.Empty;
        var finalUsername = profile?.Username ?? metaUsername ?? BuildUsernameFromEmail(finalEmail);
        var finalRole = profile?.Role ?? metaRole ?? "student";

        return new AuthSessionDto
        {
            AccessToken = accessToken,
            TokenType = tokenType,
            ExpiresIn = expiresIn,
            RefreshToken = refreshToken,
            User = new AuthUserDto
            {
                Id = userId ?? string.Empty,
                Email = finalEmail,
                Username = finalUsername,
                Name = finalUsername,
                Role = finalRole
            }
        };
    }

    private async Task<UserProfileRow?> TryGetUserProfileAsync(string userId, CancellationToken cancellationToken)
    {
        try
        {
            var client = await _supabaseClientFactory.GetClientAsync(cancellationToken);
            var response = await client
                .From<UserProfileRow>()
                .Where(x => x.Id == userId)
                .Get();

            return response.Models.FirstOrDefault();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to resolve user profile from users table for user {UserId}", userId);
            return null;
        }
    }

    private static void EnsureSuccess(HttpStatusCode statusCode, string payload)
    {
        if ((int)statusCode is >= 200 and < 300)
        {
            return;
        }

        var message = TryGetErrorMessage(payload);

        var (mappedStatus, code, mappedMessage) = statusCode switch
        {
            HttpStatusCode.BadRequest => (StatusCodes.Status400BadRequest, "bad_request", message),
            HttpStatusCode.Unauthorized => (StatusCodes.Status401Unauthorized, "invalid_credentials", "Invalid email or password."),
            HttpStatusCode.Forbidden => (StatusCodes.Status403Forbidden, "forbidden", message),
            HttpStatusCode.Conflict => (StatusCodes.Status409Conflict, "conflict", message),
            HttpStatusCode.TooManyRequests => (StatusCodes.Status429TooManyRequests, "too_many_requests", message),
            _ => (StatusCodes.Status502BadGateway, "auth_provider_error", message)
        };

        throw new ApiException(mappedStatus, code, mappedMessage);
    }

    private static string TryGetErrorMessage(string payload)
    {
        if (string.IsNullOrWhiteSpace(payload))
        {
            return "Authentication request failed.";
        }

        try
        {
            using var document = JsonDocument.Parse(payload);
            var root = document.RootElement;
            return TryGetString(root, "msg")
                ?? TryGetString(root, "message")
                ?? TryGetString(root, "error_description")
                ?? "Authentication request failed.";
        }
        catch
        {
            return "Authentication request failed.";
        }
    }

    private static string NormalizeUsername(string value, string email)
    {
        var cleaned = new string((value ?? string.Empty)
            .Trim()
            .ToLowerInvariant()
            .Select(ch => char.IsLetterOrDigit(ch) || ch == '_' ? ch : '_')
            .ToArray())
            .Trim('_');

        if (!string.IsNullOrWhiteSpace(cleaned))
        {
            return cleaned;
        }

        return BuildUsernameFromEmail(email);
    }

    private static string BuildUsernameFromEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return "user";
        }

        var local = email.Split('@')[0].Trim().ToLowerInvariant();
        return string.IsNullOrWhiteSpace(local) ? "user" : local;
    }

    private static (string? Username, string? Role) ExtractUserMetadata(JsonElement userElement)
    {
        if (!userElement.TryGetProperty("user_metadata", out var metadata) || metadata.ValueKind != JsonValueKind.Object)
        {
            return (null, null);
        }

        var username = TryGetString(metadata, "username") ?? TryGetString(metadata, "preferred_username");
        var role = TryGetString(metadata, "role");
        return (username, role);
    }

    private static string? TryGetString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var value))
        {
            return null;
        }

        return value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString();
    }

    private static int? TryGetInt(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var value))
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var result))
        {
            return result;
        }

        if (value.ValueKind == JsonValueKind.String && int.TryParse(value.GetString(), out result))
        {
            return result;
        }

        return null;
    }
}
