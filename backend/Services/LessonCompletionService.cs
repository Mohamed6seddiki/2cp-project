using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using backend.DTOs;
using backend.Middleware;
using backend.Models;
using backend.Supabase;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class LessonCompletionService : ILessonCompletionService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;

    public LessonCompletionService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseOptions> supabaseOptions)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
    }

    public async Task<LessonCompletionDto?> GetLessonCompletionAsync(
        string studentId,
        string lessonId,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedStudentId = NormalizeRequiredText(studentId, "Authentication is required.");
        var normalizedLessonId = NormalizeRequiredText(lessonId, "Lesson id is required.");
        var client = CreateAuthenticatedClient(accessToken);

        var lessonExists = await LessonExistsAsync(client, normalizedLessonId, cancellationToken);
        if (!lessonExists)
        {
            return null;
        }

        var response = await client.GetAsync(
            $"/rest/v1/lesson_exercises?lesson_id=eq.{Uri.EscapeDataString(normalizedLessonId)}&select=id,title,points,student_lesson_exercises!left(score,completed,submitted_at,student_id)&order=created_at.asc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureReadSuccess(response.StatusCode, payload, "lesson_completion_fetch_failed", "Failed to load lesson completion.");

        var rows = JsonSerializer.Deserialize<List<LessonExerciseCompletionQueryRow>>(payload, JsonOptions) ?? [];

        var exercises = rows
            .Select(row =>
            {
                var submission = row.StudentSubmissions?
                    .FirstOrDefault(item => item.StudentId == normalizedStudentId);

                return new LessonExerciseCompletionDto
                {
                    ExerciseId = row.Id,
                    Title = row.Title,
                    MaxPoints = Math.Max(0, row.Points),
                    Completed = submission?.Completed == true,
                    Score = Math.Max(0, submission?.Score ?? 0),
                    SubmittedAt = submission?.SubmittedAt
                };
            })
            .ToList();

        var completedCount = exercises.Count(item => item.Completed);
        var totalCount = exercises.Count;
        var progressPercent = totalCount == 0
            ? 0
            : (int)Math.Round((double)completedCount / totalCount * 100, MidpointRounding.AwayFromZero);

        return new LessonCompletionDto
        {
            LessonId = normalizedLessonId,
            CompletedExercises = completedCount,
            TotalExercises = totalCount,
            ProgressPercent = progressPercent,
            IsCompleted = totalCount > 0 && completedCount == totalCount,
            Exercises = exercises
        };
    }

    public async Task<IReadOnlyList<LessonCompletionDto>> GetAllLessonCompletionsAsync(
        string studentId,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedStudentId = NormalizeRequiredText(studentId, "Authentication is required.");
        var client = CreateAuthenticatedClient(accessToken);

        var lessonsResponse = await client.GetAsync(
            "/rest/v1/lessons?select=id&order=order_index.asc",
            cancellationToken);
        var lessonsPayload = await lessonsResponse.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(lessonsResponse.StatusCode, lessonsPayload, "lesson_completion_fetch_failed", "Failed to read lessons.");

        var lessons = JsonSerializer.Deserialize<List<LessonReferenceRow>>(lessonsPayload, JsonOptions) ?? [];
        var results = new List<LessonCompletionDto>(lessons.Count);

        foreach (var lesson in lessons)
        {
            var completion = await GetLessonCompletionAsync(
                normalizedStudentId,
                lesson.Id,
                accessToken,
                cancellationToken);

            if (completion is not null)
            {
                results.Add(completion);
            }
        }

        return results;
    }

    private async Task<bool> LessonExistsAsync(HttpClient client, string lessonId, CancellationToken cancellationToken)
    {
        var response = await client.GetAsync(
            $"/rest/v1/lessons?id=eq.{Uri.EscapeDataString(lessonId)}&select=id&limit=1",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload, "lesson_completion_fetch_failed", "Failed to load lesson details.");

        var rows = JsonSerializer.Deserialize<List<LessonReferenceRow>>(payload, JsonOptions) ?? [];
        return rows.Count > 0;
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

    private static string NormalizeRequiredText(string value, string fallbackError)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", fallbackError);
        }

        return normalized;
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
