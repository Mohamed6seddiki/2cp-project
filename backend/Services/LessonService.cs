using backend.DTOs;
using backend.Models;
using backend.Middleware;
using backend.Supabase;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text.Json;

namespace backend.Services;

public sealed class LessonService : ILessonService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;

    public LessonService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseOptions> supabaseOptions)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
    }

    public async Task<IReadOnlyList<LessonDto>> GetLessonsAsync(string? accessToken, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var client = CreateReadClient(accessToken);
        var response = await client.GetAsync(
            "/rest/v1/lessons?select=id,title,content,difficulty,order_index&order=order_index.asc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload);

        var lessonRows = JsonSerializer.Deserialize<List<LessonRow>>(payload, JsonOptions) ?? [];

        var items = lessonRows
            .OrderBy(x => x.OrderIndex)
            .Select(MapLesson)
            .ToList();

        return items;
    }

    public async Task<LessonDetailDto?> GetLessonByIdAsync(string lessonId, string? accessToken, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(lessonId))
        {
            return null;
        }

        var normalizedLessonId = lessonId.Trim();
        var encodedLessonId = Uri.EscapeDataString(normalizedLessonId);
        var client = CreateReadClient(accessToken);

        var lessonResponse = await client.GetAsync(
            $"/rest/v1/lessons?id=eq.{encodedLessonId}&select=id,title,content,difficulty,order_index&limit=1",
            cancellationToken);
        var lessonPayload = await lessonResponse.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(lessonResponse.StatusCode, lessonPayload);

        var lessonList = JsonSerializer.Deserialize<List<LessonRow>>(lessonPayload, JsonOptions);
        var lesson = lessonList?.FirstOrDefault();

        if (lesson is null)
        {
            return null;
        }

        var exerciseResponse = await client.GetAsync(
            $"/rest/v1/lesson_exercises?lesson_id=eq.{encodedLessonId}&select=id,lesson_id,title,description,points&order=created_at.asc",
            cancellationToken);
        var exercisePayload = await exerciseResponse.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(exerciseResponse.StatusCode, exercisePayload);
        var exerciseRows = JsonSerializer.Deserialize<List<LessonExerciseRow>>(exercisePayload, JsonOptions) ?? [];

        var lessonDetail = new LessonDetailDto
        {
            Id = lesson.Id,
            Title = lesson.Title,
            Description = lesson.Title,
            Difficulty = MapDifficulty(lesson.Difficulty),
            EstimatedMinutes = EstimateMinutes(lesson.Content),
            OrderIndex = lesson.OrderIndex,
            Content = lesson.Content,
            Exercises = exerciseRows
                .Select(MapLessonExercise)
                .ToList()
        };

        return lessonDetail;
    }

    private HttpClient CreateReadClient(string? accessToken)
    {
        var token = string.IsNullOrWhiteSpace(accessToken)
            ? _supabaseOptions.ServiceKey
            : accessToken.Trim();

        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(_supabaseOptions.Url.TrimEnd('/'));
        client.DefaultRequestHeaders.Add("apikey", _supabaseOptions.ServiceKey);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static void EnsureReadSuccess(System.Net.HttpStatusCode statusCode, string payload)
    {
        if ((int)statusCode is >= 200 and < 300)
        {
            return;
        }

        if (statusCode is System.Net.HttpStatusCode.Unauthorized or System.Net.HttpStatusCode.Forbidden)
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is invalid.");
        }

        throw new ApiException(StatusCodes.Status502BadGateway, "lesson_fetch_failed", "Failed to load lessons from data provider.");
    }

    private static LessonDto MapLesson(LessonRow row)
    {
        return new LessonDto
        {
            Id = row.Id,
            Title = row.Title,
            Description = row.Title,
            Difficulty = MapDifficulty(row.Difficulty),
            EstimatedMinutes = EstimateMinutes(row.Content),
            OrderIndex = row.OrderIndex
        };
    }

    private static ExerciseDto MapLessonExercise(LessonExerciseRow row)
    {
        return new ExerciseDto
        {
            Id = row.Id,
            LessonId = row.LessonId,
            Title = row.Title,
            Description = row.Description,
            Difficulty = "Beginner",
            Points = row.Points
        };
    }

    private static string MapDifficulty(string value)
    {
        return value.ToLowerInvariant() switch
        {
            "easy" => "Beginner",
            "medium" => "Intermediate",
            "hard" => "Advanced",
            _ => "Beginner"
        };
    }

    private static int EstimateMinutes(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return 0;
        }

        var wordCount = content
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Length;

        var minutes = (int)Math.Ceiling(wordCount / 220.0);
        return Math.Max(1, minutes);
    }
}
