using backend.DTOs;
using backend.Middleware;
using backend.Models;
using backend.Supabase;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace backend.Services;

public sealed class ExerciseService : IExerciseService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;

    public ExerciseService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseOptions> supabaseOptions)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
    }

    public async Task<IReadOnlyList<ExerciseDto>> GetGeneralExercisesAsync(string? accessToken, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var rows = await GetGeneralExerciseRowsAsync(accessToken, cancellationToken);

        var exercises = rows
            .Select(row => new ExerciseDto
            {
                Id = row.Id,
                LessonId = null,
                Title = row.Title,
                Description = row.Description,
                Difficulty = MapDifficulty(row.Difficulty),
                Points = row.Points
            })
            .ToList();

        return exercises;
    }

    public async Task<IReadOnlyList<GeneralExerciseRow>> GetGeneralExerciseRowsAsync(string? accessToken, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var client = CreateReadClient(accessToken);
        var response = await client.GetAsync(
            "/rest/v1/general_exercises?select=id,title,description,difficulty,points,created_at&order=created_at.asc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload);

        return JsonSerializer.Deserialize<List<GeneralExerciseRow>>(payload, JsonOptions) ?? [];
    }

    public async Task<ExerciseSubmissionDto> SubmitGeneralExerciseAsync(
        string studentId,
        string accessToken,
        string exerciseId,
        int score,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(studentId))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication is required.");
        }

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is missing.");
        }

        var normalizedExerciseId = exerciseId?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalizedExerciseId))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", "Exercise id is required.");
        }

        if (score < 0)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", "Score must be greater than or equal to 0.");
        }

        var maxPoints = await GetGeneralExerciseMaxPointsAsync(accessToken, normalizedExerciseId, cancellationToken);
        if (maxPoints is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "exercise_not_found", $"Exercise '{normalizedExerciseId}' was not found.");
        }

        if (score > maxPoints.Value)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "score_exceeds_max_points", $"Score cannot exceed {maxPoints.Value} points.");
        }

        var row = await SubmitGeneralExerciseRpcAsync(accessToken, normalizedExerciseId, score, cancellationToken);

        return new ExerciseSubmissionDto
        {
            SubmissionId = row.Id,
            ExerciseId = row.ExerciseId,
            Score = row.Score,
            Completed = row.Completed,
            SubmittedAt = row.SubmittedAt
        };
    }

    public async Task<ExerciseSubmissionDto> SubmitLessonExerciseAsync(
        string studentId,
        string accessToken,
        string lessonExerciseId,
        int score,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(studentId))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication is required.");
        }

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is missing.");
        }

        var normalizedExerciseId = lessonExerciseId?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalizedExerciseId))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", "Exercise id is required.");
        }

        if (score < 0)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "validation_failed", "Score must be greater than or equal to 0.");
        }

        var maxPoints = await GetLessonExerciseMaxPointsAsync(accessToken, normalizedExerciseId, cancellationToken);
        if (maxPoints is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "lesson_exercise_not_found", $"Lesson exercise '{normalizedExerciseId}' was not found.");
        }

        if (score > maxPoints.Value)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "score_exceeds_max_points", $"Score cannot exceed {maxPoints.Value} points.");
        }

        var row = await SubmitLessonExerciseRpcAsync(accessToken, normalizedExerciseId, score, cancellationToken);

        return new ExerciseSubmissionDto
        {
            SubmissionId = row.Id,
            ExerciseId = row.LessonExerciseId,
            Score = row.Score,
            Completed = row.Completed,
            SubmittedAt = row.SubmittedAt
        };
    }

    private async Task<int?> GetGeneralExerciseMaxPointsAsync(string accessToken, string exerciseId, CancellationToken cancellationToken)
    {
        var client = CreateAuthenticatedClient(accessToken);
        var encodedExerciseId = Uri.EscapeDataString(exerciseId);
        var response = await client.GetAsync(
            $"/rest/v1/general_exercises?id=eq.{encodedExerciseId}&select=points&limit=1",
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload);

        var rows = JsonSerializer.Deserialize<List<ExercisePointsRow>>(payload, JsonOptions);
        return rows?.FirstOrDefault()?.Points;
    }

    private async Task<int?> GetLessonExerciseMaxPointsAsync(string accessToken, string exerciseId, CancellationToken cancellationToken)
    {
        var client = CreateAuthenticatedClient(accessToken);
        var encodedExerciseId = Uri.EscapeDataString(exerciseId);
        var response = await client.GetAsync(
            $"/rest/v1/lesson_exercises?id=eq.{encodedExerciseId}&select=points&limit=1",
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload);

        var rows = JsonSerializer.Deserialize<List<ExercisePointsRow>>(payload, JsonOptions);
        return rows?.FirstOrDefault()?.Points;
    }

    private async Task<StudentGeneralExerciseSubmissionRow> SubmitGeneralExerciseRpcAsync(
        string accessToken,
        string exerciseId,
        int score,
        CancellationToken cancellationToken)
    {
        var client = CreateRpcClient(accessToken);
        var response = await client.PostAsJsonAsync(
            "/rest/v1/rpc/submit_general_exercise",
            new
            {
                p_exercise_id = exerciseId,
                p_score = score
            },
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureRpcSuccess(response.StatusCode, payload);

        var row = JsonSerializer.Deserialize<StudentGeneralExerciseSubmissionRow>(payload, JsonOptions);
        return row ?? throw new ApiException(StatusCodes.Status502BadGateway, "invalid_rpc_response", "Unexpected response from submission service.");
    }

    private async Task<StudentLessonExerciseSubmissionRow> SubmitLessonExerciseRpcAsync(
        string accessToken,
        string lessonExerciseId,
        int score,
        CancellationToken cancellationToken)
    {
        var client = CreateRpcClient(accessToken);
        var response = await client.PostAsJsonAsync(
            "/rest/v1/rpc/submit_lesson_exercise",
            new
            {
                p_lesson_exercise_id = lessonExerciseId,
                p_score = score
            },
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureRpcSuccess(response.StatusCode, payload);

        var row = JsonSerializer.Deserialize<StudentLessonExerciseSubmissionRow>(payload, JsonOptions);
        return row ?? throw new ApiException(StatusCodes.Status502BadGateway, "invalid_rpc_response", "Unexpected response from submission service.");
    }

    private HttpClient CreateRpcClient(string accessToken)
    {
        return CreateAuthenticatedClient(accessToken);
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

    private HttpClient CreateAuthenticatedClient(string accessToken)
    {
        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(_supabaseOptions.Url.TrimEnd('/'));
        client.DefaultRequestHeaders.Add("apikey", _supabaseOptions.ServiceKey);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return client;
    }

    private static void EnsureRpcSuccess(System.Net.HttpStatusCode statusCode, string payload)
    {
        if ((int)statusCode is >= 200 and < 300)
        {
            return;
        }

        if (statusCode is System.Net.HttpStatusCode.Unauthorized or System.Net.HttpStatusCode.Forbidden)
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "unauthorized", "Authentication token is invalid.");
        }

        var mappedMessage = statusCode == System.Net.HttpStatusCode.NotFound
            ? "Requested resource was not found."
            : "Exercise submission failed.";

        throw new ApiException(StatusCodes.Status502BadGateway, "submission_failed", mappedMessage);
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

        throw new ApiException(StatusCodes.Status502BadGateway, "exercise_lookup_failed", "Failed to read exercise details.");
    }

    private sealed class ExercisePointsRow
    {
        public int Points { get; set; }
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
}
