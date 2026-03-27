using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using backend.DTOs;
using backend.Middleware;
using backend.Models;
using backend.Supabase;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class LeaderboardService : ILeaderboardService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;

    public LeaderboardService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseOptions> supabaseOptions)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
    }

    public async Task<LeaderboardDto> GetLeaderboardAsync(string studentId, string accessToken, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedStudentId = NormalizeStudentId(studentId);
        var client = CreateAuthenticatedClient(accessToken);

        var response = await client.PostAsJsonAsync(
            "/rest/v1/rpc/get_leaderboard_snapshot",
            new { p_limit = 100 },
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureReadSuccess(response.StatusCode, payload, "leaderboard_fetch_failed", "Failed to load leaderboard.");

        var rows = JsonSerializer.Deserialize<List<LeaderboardSnapshotRow>>(payload, JsonOptions) ?? [];
        var sortedRows = rows
            .OrderByDescending(row => row.TotalScore)
            .ThenByDescending(row => row.SolvedCount)
            .ThenBy(row => row.Username, StringComparer.OrdinalIgnoreCase)
            .Take(50)
            .ToList();

        var entries = sortedRows
            .Select((row, index) => new LeaderboardEntryDto
            {
                StudentId = row.StudentId,
                Username = string.IsNullOrWhiteSpace(row.Username) ? "Learner" : row.Username,
                TotalScore = row.TotalScore,
                SolvedCount = row.SolvedCount,
                StreakDays = ComputeStreakDays(row.ActivityDays ?? []),
                Rank = index + 1,
                IsCurrentUser = row.StudentId == normalizedStudentId
            })
            .ToList();

        var me = entries.FirstOrDefault(entry => entry.IsCurrentUser);

        if (me is null)
        {
            var meRow = rows.FirstOrDefault(row => row.StudentId == normalizedStudentId);
            if (meRow is not null)
            {
                var rank = rows
                    .OrderByDescending(row => row.TotalScore)
                    .ThenByDescending(row => row.SolvedCount)
                    .ThenBy(row => row.Username, StringComparer.OrdinalIgnoreCase)
                    .Select((row, index) => new { row.StudentId, Rank = index + 1 })
                    .FirstOrDefault(item => item.StudentId == normalizedStudentId)?.Rank ?? rows.Count;

                me = new LeaderboardEntryDto
                {
                    StudentId = meRow.StudentId,
                    Username = string.IsNullOrWhiteSpace(meRow.Username) ? "Learner" : meRow.Username,
                    TotalScore = meRow.TotalScore,
                    SolvedCount = meRow.SolvedCount,
                    StreakDays = ComputeStreakDays(meRow.ActivityDays ?? []),
                    Rank = rank,
                    IsCurrentUser = true
                };
            }
        }

        return new LeaderboardDto
        {
            Entries = entries,
            Me = me
        };
    }

    private HttpClient CreateAuthenticatedClient(string accessToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is missing.");
        }

        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(_supabaseOptions.Url.TrimEnd('/'));
        client.DefaultRequestHeaders.Add("apikey", _supabaseOptions.ServiceKey);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.Trim());
        return client;
    }

    private static void EnsureReadSuccess(HttpStatusCode statusCode, string payload, string errorCode, string fallbackMessage)
    {
        if ((int)statusCode is >= 200 and < 300)
        {
            return;
        }

        if (statusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is invalid.");
        }

        throw new ApiException(StatusCodes.Status502BadGateway, errorCode, TryReadProviderMessage(payload) ?? fallbackMessage);
    }

    private static string NormalizeStudentId(string studentId)
    {
        var normalized = studentId?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication is required.");
        }

        return normalized;
    }

    private static int ComputeStreakDays(IReadOnlyList<string> activityDays)
    {
        var days = activityDays
            .Select(ParseDay)
            .Where(day => day.HasValue)
            .Select(day => day!.Value)
            .Distinct()
            .OrderByDescending(day => day)
            .ToList();

        if (days.Count == 0)
        {
            return 0;
        }

        var today = DateTime.UtcNow.Date;
        var pointer = days[0];

        if (pointer != today && pointer != today.AddDays(-1))
        {
            return 0;
        }

        var streak = 1;
        for (var index = 1; index < days.Count; index++)
        {
            if (days[index] == pointer.AddDays(-1))
            {
                streak++;
                pointer = days[index];
                continue;
            }

            break;
        }

        return streak;
    }

    private static DateTime? ParseDay(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return DateTime.TryParse(value, out var parsed)
            ? parsed.Date
            : null;
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
}
