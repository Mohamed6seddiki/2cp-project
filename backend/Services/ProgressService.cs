using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using backend.DTOs;
using backend.Middleware;
using backend.Models;
using backend.Supabase;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class ProgressService : IProgressService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;

    public ProgressService(IHttpClientFactory httpClientFactory, IOptions<SupabaseOptions> supabaseOptions)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
    }

    public async Task<ProgressDto> GetStudentProgressAsync(string studentId, string accessToken, CancellationToken cancellationToken = default)
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

        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(_supabaseOptions.Url.TrimEnd('/'));
        client.DefaultRequestHeaders.Add("apikey", _supabaseOptions.ServiceKey);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.PostAsJsonAsync(
            "/rest/v1/rpc/view_student_progress",
            new { p_student_id = studentId },
            cancellationToken);

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new ApiException(StatusCodes.Status502BadGateway, "progress_fetch_failed", "Failed to load student progress.");
        }

        var rpcResult = JsonSerializer.Deserialize<ProgressRpcResult>(payload, JsonOptions);
        if (rpcResult is null || string.IsNullOrWhiteSpace(rpcResult.StudentId))
        {
            throw new ApiException(StatusCodes.Status502BadGateway, "invalid_rpc_response", "Unexpected response from progress service.");
        }

        return new ProgressDto
        {
            StudentId = rpcResult.StudentId,
            TotalScore = rpcResult.TotalScore,
            LessonExercises = (rpcResult.LessonExercises ?? [])
                .Select(MapItem)
                .ToList(),
            GeneralExercises = (rpcResult.GeneralExercises ?? [])
                .Select(MapItem)
                .ToList()
        };
    }

    private static ProgressExerciseItemDto MapItem(ProgressExerciseRpcItem item)
    {
        return new ProgressExerciseItemDto
        {
            ExerciseId = item.ExerciseId,
            Title = item.Title,
            Score = item.Score,
            Completed = item.Completed,
            SubmittedAt = item.SubmittedAt
        };
    }
}
