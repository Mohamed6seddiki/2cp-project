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

public sealed class AdminLessonService : IAdminLessonService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;

    public AdminLessonService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseOptions> supabaseOptions)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
    }

    public async Task<IReadOnlyList<AdminLessonDto>> GetLessonsAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        var client = CreateAdminClient(accessToken);
        var response = await client.GetAsync(
            "/rest/v1/lessons?select=id,title,content,difficulty,order_index,created_at&order=order_index.asc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "lessons_fetch_failed", "Failed to load lessons.");

        var rows = JsonSerializer.Deserialize<List<AdminLessonRow>>(payload, JsonOptions) ?? [];
        return rows.Select(MapLesson).ToList();
    }

    public async Task<AdminLessonDto> CreateLessonAsync(
        AdminLessonUpsertRequestDto request,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        var title = NormalizeRequiredText(request.Title, "Title is required.");
        var content = NormalizeRequiredText(request.Content, "Content is required.");
        var difficulty = NormalizeDifficultyForDatabase(request.Difficulty);
        var orderIndex = NormalizeOrderIndex(request.OrderIndex);

        var client = CreateAdminClient(accessToken);

        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/rest/v1/lessons")
        {
            Content = JsonContent.Create(new
            {
                title,
                content,
                difficulty,
                order_index = orderIndex
            })
        };
        requestMessage.Headers.TryAddWithoutValidation("Prefer", "return=representation");

        var response = await client.SendAsync(requestMessage, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "lesson_create_failed", "Failed to create lesson.");

        var row = (JsonSerializer.Deserialize<List<AdminLessonRow>>(payload, JsonOptions) ?? []).FirstOrDefault();
        return row is null
            ? throw new ApiException(StatusCodes.Status502BadGateway, "invalid_provider_response", "Lesson provider returned an unexpected response.")
            : MapLesson(row);
    }

    public async Task<AdminLessonDto?> UpdateLessonAsync(
        string lessonId,
        AdminLessonUpsertRequestDto request,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        var normalizedLessonId = NormalizeId(lessonId, "Lesson id is required.");
        var title = NormalizeRequiredText(request.Title, "Title is required.");
        var content = NormalizeRequiredText(request.Content, "Content is required.");
        var difficulty = NormalizeDifficultyForDatabase(request.Difficulty);
        var orderIndex = NormalizeOrderIndex(request.OrderIndex);

        var client = CreateAdminClient(accessToken);

        using var requestMessage = new HttpRequestMessage(
            HttpMethod.Patch,
            $"/rest/v1/lessons?id=eq.{Uri.EscapeDataString(normalizedLessonId)}")
        {
            Content = JsonContent.Create(new
            {
                title,
                content,
                difficulty,
                order_index = orderIndex
            })
        };
        requestMessage.Headers.TryAddWithoutValidation("Prefer", "return=representation");

        var response = await client.SendAsync(requestMessage, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "lesson_update_failed", "Failed to update lesson.");

        var row = (JsonSerializer.Deserialize<List<AdminLessonRow>>(payload, JsonOptions) ?? []).FirstOrDefault();
        return row is null ? null : MapLesson(row);
    }

    public async Task<bool> DeleteLessonAsync(string lessonId, string accessToken, CancellationToken cancellationToken = default)
    {
        var normalizedLessonId = NormalizeId(lessonId, "Lesson id is required.");
        var client = CreateAdminClient(accessToken);

        using var requestMessage = new HttpRequestMessage(
            HttpMethod.Delete,
            $"/rest/v1/lessons?id=eq.{Uri.EscapeDataString(normalizedLessonId)}");
        requestMessage.Headers.TryAddWithoutValidation("Prefer", "return=representation");

        var response = await client.SendAsync(requestMessage, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "lesson_delete_failed", "Failed to delete lesson.");

        var rows = JsonSerializer.Deserialize<List<AdminLessonRow>>(payload, JsonOptions) ?? [];
        return rows.Count > 0;
    }

    public async Task<IReadOnlyList<AdminLessonExerciseDto>> GetLessonExercisesAsync(
        string lessonId,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        var normalizedLessonId = NormalizeId(lessonId, "Lesson id is required.");
        var client = CreateAdminClient(accessToken);

        var response = await client.GetAsync(
            $"/rest/v1/lesson_exercises?lesson_id=eq.{Uri.EscapeDataString(normalizedLessonId)}&select=id,lesson_id,title,description,points,created_at&order=created_at.asc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "lesson_exercises_fetch_failed", "Failed to load lesson exercises.");

        var rows = JsonSerializer.Deserialize<List<AdminLessonExerciseRow>>(payload, JsonOptions) ?? [];
        return rows.Select(MapLessonExercise).ToList();
    }

    public async Task<AdminLessonExerciseDto> CreateLessonExerciseAsync(
        string lessonId,
        AdminLessonExerciseUpsertRequestDto request,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        var normalizedLessonId = NormalizeId(lessonId, "Lesson id is required.");
        var title = NormalizeRequiredText(request.Title, "Title is required.");
        var description = NormalizeRequiredText(request.Description, "Description is required.");
        var points = NormalizePoints(request.Points);

        var client = CreateAdminClient(accessToken);

        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/rest/v1/lesson_exercises")
        {
            Content = JsonContent.Create(new
            {
                lesson_id = normalizedLessonId,
                title,
                description,
                points
            })
        };
        requestMessage.Headers.TryAddWithoutValidation("Prefer", "return=representation");

        var response = await client.SendAsync(requestMessage, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "lesson_exercise_create_failed", "Failed to create lesson exercise.");

        var row = (JsonSerializer.Deserialize<List<AdminLessonExerciseRow>>(payload, JsonOptions) ?? []).FirstOrDefault();
        return row is null
            ? throw new ApiException(StatusCodes.Status502BadGateway, "invalid_provider_response", "Lesson exercise provider returned an unexpected response.")
            : MapLessonExercise(row);
    }

    public async Task<AdminLessonExerciseDto?> UpdateLessonExerciseAsync(
        string lessonExerciseId,
        AdminLessonExerciseUpsertRequestDto request,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        var normalizedExerciseId = NormalizeId(lessonExerciseId, "Lesson exercise id is required.");
        var title = NormalizeRequiredText(request.Title, "Title is required.");
        var description = NormalizeRequiredText(request.Description, "Description is required.");
        var points = NormalizePoints(request.Points);

        var client = CreateAdminClient(accessToken);

        using var requestMessage = new HttpRequestMessage(
            HttpMethod.Patch,
            $"/rest/v1/lesson_exercises?id=eq.{Uri.EscapeDataString(normalizedExerciseId)}")
        {
            Content = JsonContent.Create(new
            {
                title,
                description,
                points
            })
        };
        requestMessage.Headers.TryAddWithoutValidation("Prefer", "return=representation");

        var response = await client.SendAsync(requestMessage, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "lesson_exercise_update_failed", "Failed to update lesson exercise.");

        var row = (JsonSerializer.Deserialize<List<AdminLessonExerciseRow>>(payload, JsonOptions) ?? []).FirstOrDefault();
        return row is null ? null : MapLessonExercise(row);
    }

    public async Task<bool> DeleteLessonExerciseAsync(string lessonExerciseId, string accessToken, CancellationToken cancellationToken = default)
    {
        var normalizedExerciseId = NormalizeId(lessonExerciseId, "Lesson exercise id is required.");
        var client = CreateAdminClient(accessToken);

        using var requestMessage = new HttpRequestMessage(
            HttpMethod.Delete,
            $"/rest/v1/lesson_exercises?id=eq.{Uri.EscapeDataString(normalizedExerciseId)}");
        requestMessage.Headers.TryAddWithoutValidation("Prefer", "return=representation");

        var response = await client.SendAsync(requestMessage, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        EnsureRestSuccess(response.StatusCode, payload, "lesson_exercise_delete_failed", "Failed to delete lesson exercise.");

        var rows = JsonSerializer.Deserialize<List<AdminLessonExerciseRow>>(payload, JsonOptions) ?? [];
        return rows.Count > 0;
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

    private static string NormalizeId(string value, string errorMessage)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", errorMessage);
        }

        return normalized;
    }

    private static string NormalizeRequiredText(string value, string errorMessage)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", errorMessage);
        }

        return normalized;
    }

    private static int NormalizeOrderIndex(int orderIndex)
    {
        if (orderIndex <= 0)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", "Order index must be greater than 0.");
        }

        return orderIndex;
    }

    private static int NormalizePoints(int points)
    {
        if (points < 0)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", "Points must be greater than or equal to 0.");
        }

        return points;
    }

    private static string NormalizeDifficultyForDatabase(string difficulty)
    {
        return difficulty.Trim().ToLowerInvariant() switch
        {
            "beginner" or "easy" => "easy",
            "intermediate" or "medium" => "medium",
            "advanced" or "hard" => "hard",
            _ => throw new ApiException(
                StatusCodes.Status400BadRequest,
                "validation_failed",
                "Difficulty must be Beginner, Intermediate, or Advanced.")
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

    private static AdminLessonDto MapLesson(AdminLessonRow row)
    {
        return new AdminLessonDto
        {
            Id = row.Id,
            Title = row.Title,
            Content = row.Content,
            Difficulty = MapDifficulty(row.Difficulty),
            OrderIndex = row.OrderIndex,
            CreatedAt = row.CreatedAt
        };
    }

    private static AdminLessonExerciseDto MapLessonExercise(AdminLessonExerciseRow row)
    {
        return new AdminLessonExerciseDto
        {
            Id = row.Id,
            LessonId = row.LessonId,
            Title = row.Title,
            Description = row.Description,
            Points = row.Points,
            CreatedAt = row.CreatedAt
        };
    }
}
