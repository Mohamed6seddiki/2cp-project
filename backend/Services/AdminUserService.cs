using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using backend.DTOs.Admin;
using backend.Middleware;
using backend.Models;
using backend.Supabase;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class AdminUserService : IAdminUserService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;

    public AdminUserService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseOptions> supabaseOptions)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
    }

    public async Task<IReadOnlyList<AdminUserDto>> GetUsersAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        var client = CreateAdminClient(accessToken);
        var response = await client.GetAsync(
            "/rest/v1/users?select=id,email,username,role,created_at&order=created_at.desc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "users_fetch_failed", "Failed to load users.");

        var rows = JsonSerializer.Deserialize<List<AdminUserRow>>(payload, JsonOptions) ?? [];
        return rows.Select(MapUser).ToList();
    }

    public async Task<AdminUserDto?> UpdateUserRoleAsync(
        string userId,
        string role,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        var normalizedUserId = NormalizeId(userId, "User id is required.");
        var normalizedRole = NormalizeRole(role);

        var client = CreateAdminClient(accessToken);
        var updateResponse = await client.PostAsJsonAsync(
            "/rest/v1/rpc/manage_user_role",
            new
            {
                p_user_id = normalizedUserId,
                p_new_role = normalizedRole
            },
            cancellationToken);

        var updatePayload = await updateResponse.Content.ReadAsStringAsync(cancellationToken);
        EnsureRestSuccess(updateResponse.StatusCode, updatePayload, "user_role_update_failed", "Failed to update user role.");

        var fetchResponse = await client.GetAsync(
            $"/rest/v1/users?id=eq.{Uri.EscapeDataString(normalizedUserId)}&select=id,email,username,role,created_at&limit=1",
            cancellationToken);
        var fetchPayload = await fetchResponse.Content.ReadAsStringAsync(cancellationToken);
        EnsureRestSuccess(fetchResponse.StatusCode, fetchPayload, "users_fetch_failed", "Failed to load updated user.");

        var row = (JsonSerializer.Deserialize<List<AdminUserRow>>(fetchPayload, JsonOptions) ?? []).FirstOrDefault();
        return row is null ? null : MapUser(row);
    }

    private HttpClient CreateAdminClient(string accessToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is required.");
        }

        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(_supabaseOptions.Url.TrimEnd('/'));
        client.DefaultRequestHeaders.Add("apikey", _supabaseOptions.ServiceKey);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.Trim());
        return client;
    }

    private static string NormalizeId(string value, string errorMessage)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", errorMessage);
        }

        return normalized;
    }

    private static string NormalizeRole(string role)
    {
        var normalized = role?.Trim().ToLowerInvariant() ?? string.Empty;
        return normalized switch
        {
            "admin" => "admin",
            "student" => "student",
            _ => throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", "Role must be admin or student.")
        };
    }

    private static void EnsureRestSuccess(HttpStatusCode statusCode, string payload, string errorCode, string fallbackMessage)
    {
        if ((int)statusCode is >= 200 and < 300)
        {
            return;
        }

        if (statusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is invalid.");
        }

        var providerMessage = TryReadProviderMessage(payload);

        if (statusCode is HttpStatusCode.BadRequest or HttpStatusCode.UnprocessableEntity)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", providerMessage ?? fallbackMessage);
        }

        if (statusCode == HttpStatusCode.Conflict)
        {
            throw new ApiException(StatusCodes.Status409Conflict, "conflict", providerMessage ?? fallbackMessage);
        }

        throw new ApiException(StatusCodes.Status502BadGateway, errorCode, providerMessage ?? fallbackMessage);
    }

    private static string? TryReadProviderMessage(string payload)
    {
        if (string.IsNullOrWhiteSpace(payload))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(payload);
            var root = document.RootElement;
            return ReadString(root, "message")
                ?? ReadString(root, "hint")
                ?? ReadString(root, "details");
        }
        catch
        {
            return null;
        }
    }

    private static string? ReadString(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var value))
        {
            return null;
        }

        return value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString();
    }

    private static AdminUserDto MapUser(AdminUserRow row)
    {
        return new AdminUserDto
        {
            Id = row.Id,
            Email = row.Email,
            Username = row.Username,
            Role = row.Role.ToLowerInvariant() switch
            {
                "admin" => "admin",
                _ => "student"
            },
            CreatedAt = row.CreatedAt
        };
    }
}
