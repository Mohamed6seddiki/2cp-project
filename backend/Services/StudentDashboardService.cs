using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using backend.DTOs;
using backend.Middleware;
using backend.Models;
using backend.Supabase;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class StudentDashboardService : IStudentDashboardService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseOptions _supabaseOptions;

    public StudentDashboardService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseOptions> supabaseOptions)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseOptions = supabaseOptions.Value;
    }

    public async Task<DashboardDto> GetDashboardAsync(string studentId, string accessToken, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedStudentId = NormalizeStudentId(studentId);
        var client = CreateAuthenticatedClient(accessToken);

        var student = await GetStudentAsync(client, normalizedStudentId, cancellationToken);
        if (student is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "student_not_found", "Student profile was not found.");
        }

        var lessons = await GetLessonsAsync(client, cancellationToken);
        var lessonExercises = await GetLessonExercisesAsync(client, cancellationToken);
        var generalExercises = await GetGeneralExercisesAsync(client, cancellationToken);
        var lessonSubmissions = await GetLessonSubmissionsAsync(client, normalizedStudentId, cancellationToken);
        var generalSubmissions = await GetGeneralSubmissionsAsync(client, normalizedStudentId, cancellationToken);

        var lessonById = lessons.ToDictionary(item => item.Id, StringComparer.Ordinal);
        var lessonExerciseById = lessonExercises.ToDictionary(item => item.Id, StringComparer.Ordinal);
        var generalExerciseById = generalExercises.ToDictionary(item => item.Id, StringComparer.Ordinal);

        var lessonSubmissionByExerciseId = lessonSubmissions
            .GroupBy(item => item.LessonExerciseId)
            .ToDictionary(
                group => group.Key,
                group => group.OrderByDescending(item => item.SubmittedAt).First(),
                StringComparer.Ordinal);

        var generalSubmissionByExerciseId = generalSubmissions
            .GroupBy(item => item.ExerciseId)
            .ToDictionary(
                group => group.Key,
                group => group.OrderByDescending(item => item.SubmittedAt).First(),
                StringComparer.Ordinal);

        var lessonStats = lessonExercises
            .GroupBy(item => item.LessonId)
            .Select(group =>
            {
                var total = group.Count();
                var completed = group.Count(exercise =>
                    lessonSubmissionByExerciseId.TryGetValue(exercise.Id, out var submission)
                    && submission.Completed);
                var mostRecentSubmission = group
                    .Select(exercise => lessonSubmissionByExerciseId.TryGetValue(exercise.Id, out var submission)
                        ? submission.SubmittedAt
                        : DateTimeOffset.MinValue)
                    .Max();

                return new LessonProgressPoint
                {
                    LessonId = group.Key,
                    Total = total,
                    Completed = completed,
                    MostRecentSubmission = mostRecentSubmission
                };
            })
            .ToList();

        var completedLessons = lessonStats.Count(item => item.Total > 0 && item.Completed == item.Total);
        var averageScore = ComputeAverageScorePercent(lessonSubmissions, generalSubmissions, lessonExerciseById, generalExerciseById);
        var streakDays = ComputeStreakDays(
            lessonSubmissions.Select(item => item.SubmittedAt)
                .Concat(generalSubmissions.Select(item => item.SubmittedAt)));
        var practiceMinutes = ComputePracticeMinutes(lessonSubmissions.Count + generalSubmissions.Count);
        var weeklyActivity = BuildWeeklyActivity(lessonSubmissions, generalSubmissions);

        var recentActivity = BuildRecentActivity(lessonSubmissions, generalSubmissions, lessonExerciseById, generalExerciseById)
            .Take(6)
            .ToList();

        var dailyChallenge = BuildDailyChallenge(generalExercises, generalSubmissionByExerciseId);
        var continueLearning = BuildContinueLearning(lessonStats, lessonById);

        return new DashboardDto
        {
            CompletedLessons = completedLessons,
            CurrentStreakDays = streakDays,
            AverageScorePercent = averageScore,
            PracticeMinutesTotal = practiceMinutes,
            WeeklyActivity = weeklyActivity,
            RecentActivity = recentActivity,
            DailyChallenge = dailyChallenge,
            ContinueLearning = continueLearning
        };
    }

    private async Task<StudentRow?> GetStudentAsync(HttpClient client, string studentId, CancellationToken cancellationToken)
    {
        var response = await client.GetAsync(
            $"/rest/v1/students?id=eq.{Uri.EscapeDataString(studentId)}&select=id,total_score&limit=1",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload, "dashboard_fetch_failed", "Failed to read student profile.");

        return (JsonSerializer.Deserialize<List<StudentRow>>(payload, JsonOptions) ?? []).FirstOrDefault();
    }

    private async Task<List<LessonRow>> GetLessonsAsync(HttpClient client, CancellationToken cancellationToken)
    {
        var response = await client.GetAsync(
            "/rest/v1/lessons?select=id,title,difficulty,order_index&order=order_index.asc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload, "dashboard_fetch_failed", "Failed to read lessons.");

        return JsonSerializer.Deserialize<List<LessonRow>>(payload, JsonOptions) ?? [];
    }

    private async Task<List<LessonExerciseRow>> GetLessonExercisesAsync(HttpClient client, CancellationToken cancellationToken)
    {
        var response = await client.GetAsync(
            "/rest/v1/lesson_exercises?select=id,lesson_id,title,description,points,created_at&order=created_at.asc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload, "dashboard_fetch_failed", "Failed to read lesson exercises.");

        return JsonSerializer.Deserialize<List<LessonExerciseRow>>(payload, JsonOptions) ?? [];
    }

    private async Task<List<GeneralExerciseRow>> GetGeneralExercisesAsync(HttpClient client, CancellationToken cancellationToken)
    {
        var response = await client.GetAsync(
            "/rest/v1/general_exercises?select=id,title,description,difficulty,points,created_at&order=created_at.asc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload, "dashboard_fetch_failed", "Failed to read general exercises.");

        return JsonSerializer.Deserialize<List<GeneralExerciseRow>>(payload, JsonOptions) ?? [];
    }

    private async Task<List<StudentLessonExerciseSubmissionRow>> GetLessonSubmissionsAsync(
        HttpClient client,
        string studentId,
        CancellationToken cancellationToken)
    {
        var response = await client.GetAsync(
            $"/rest/v1/student_lesson_exercises?student_id=eq.{Uri.EscapeDataString(studentId)}&select=id,student_id,lesson_exercise_id,score,completed,submitted_at&order=submitted_at.desc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload, "dashboard_fetch_failed", "Failed to read lesson submissions.");

        return JsonSerializer.Deserialize<List<StudentLessonExerciseSubmissionRow>>(payload, JsonOptions) ?? [];
    }

    private async Task<List<StudentGeneralExerciseSubmissionRow>> GetGeneralSubmissionsAsync(
        HttpClient client,
        string studentId,
        CancellationToken cancellationToken)
    {
        var response = await client.GetAsync(
            $"/rest/v1/student_general_exercises?student_id=eq.{Uri.EscapeDataString(studentId)}&select=id,student_id,exercise_id,score,completed,submitted_at&order=submitted_at.desc",
            cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureReadSuccess(response.StatusCode, payload, "dashboard_fetch_failed", "Failed to read general submissions.");

        return JsonSerializer.Deserialize<List<StudentGeneralExerciseSubmissionRow>>(payload, JsonOptions) ?? [];
    }

    private static int ComputeAverageScorePercent(
        IReadOnlyList<StudentLessonExerciseSubmissionRow> lessonSubmissions,
        IReadOnlyList<StudentGeneralExerciseSubmissionRow> generalSubmissions,
        IReadOnlyDictionary<string, LessonExerciseRow> lessonExercisesById,
        IReadOnlyDictionary<string, GeneralExerciseRow> generalExercisesById)
    {
        var scored = 0;
        var possible = 0;

        foreach (var submission in lessonSubmissions)
        {
            if (!lessonExercisesById.TryGetValue(submission.LessonExerciseId, out var exercise))
            {
                continue;
            }

            var maxPoints = Math.Max(0, exercise.Points);
            possible += maxPoints;
            scored += Math.Clamp(submission.Score, 0, maxPoints);
        }

        foreach (var submission in generalSubmissions)
        {
            if (!generalExercisesById.TryGetValue(submission.ExerciseId, out var exercise))
            {
                continue;
            }

            var maxPoints = Math.Max(0, exercise.Points);
            possible += maxPoints;
            scored += Math.Clamp(submission.Score, 0, maxPoints);
        }

        if (possible <= 0)
        {
            return 0;
        }

        return (int)Math.Round((double)scored / possible * 100, MidpointRounding.AwayFromZero);
    }

    private static IEnumerable<DashboardRecentActivityDto> BuildRecentActivity(
        IReadOnlyList<StudentLessonExerciseSubmissionRow> lessonSubmissions,
        IReadOnlyList<StudentGeneralExerciseSubmissionRow> generalSubmissions,
        IReadOnlyDictionary<string, LessonExerciseRow> lessonExerciseById,
        IReadOnlyDictionary<string, GeneralExerciseRow> generalExerciseById)
    {
        var lessonEvents = lessonSubmissions.Select(item => new DashboardRecentActivityDto
        {
            Type = "lesson",
            Title = lessonExerciseById.TryGetValue(item.LessonExerciseId, out var lessonExercise)
                ? $"Completed lesson exercise: {lessonExercise.Title}"
                : "Completed lesson exercise",
            Score = item.Score,
            SubmittedAt = item.SubmittedAt
        });

        var generalEvents = generalSubmissions.Select(item => new DashboardRecentActivityDto
        {
            Type = "general",
            Title = generalExerciseById.TryGetValue(item.ExerciseId, out var generalExercise)
                ? $"Solved general exercise: {generalExercise.Title}"
                : "Solved general exercise",
            Score = item.Score,
            SubmittedAt = item.SubmittedAt
        });

        return lessonEvents
            .Concat(generalEvents)
            .OrderByDescending(item => item.SubmittedAt);
    }

    private static DashboardDailyChallengeDto BuildDailyChallenge(
        IReadOnlyList<GeneralExerciseRow> exercises,
        IReadOnlyDictionary<string, StudentGeneralExerciseSubmissionRow> submissionsByExerciseId)
    {
        var source = exercises
            .Where(exercise => !submissionsByExerciseId.TryGetValue(exercise.Id, out var submission) || !submission.Completed)
            .OrderByDescending(exercise => exercise.Points)
            .ThenBy(exercise => exercise.Title, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault()
            ?? exercises
                .OrderByDescending(exercise => exercise.Points)
                .ThenBy(exercise => exercise.Title, StringComparer.OrdinalIgnoreCase)
                .FirstOrDefault();

        if (source is null)
        {
            return new DashboardDailyChallengeDto
            {
                Id = string.Empty,
                Title = "No challenge available yet",
                Difficulty = "Beginner",
                Points = 0
            };
        }

        return new DashboardDailyChallengeDto
        {
            Id = source.Id,
            Title = source.Title,
            Difficulty = MapDifficulty(source.Difficulty),
            Points = source.Points
        };
    }

    private static DashboardContinueLearningDto? BuildContinueLearning(
        IReadOnlyList<LessonProgressPoint> lessonStats,
        IReadOnlyDictionary<string, LessonRow> lessonById)
    {
        var candidate = lessonStats
            .Where(item => item.Total > 0 && item.Completed < item.Total)
            .OrderByDescending(item => item.MostRecentSubmission)
            .ThenBy(item => lessonById.TryGetValue(item.LessonId, out var lesson) ? lesson.OrderIndex : int.MaxValue)
            .FirstOrDefault();

        if (candidate is null || !lessonById.TryGetValue(candidate.LessonId, out var lessonRow))
        {
            return null;
        }

        var progressPercent = (int)Math.Round((double)candidate.Completed / candidate.Total * 100, MidpointRounding.AwayFromZero);

        return new DashboardContinueLearningDto
        {
            LessonId = lessonRow.Id,
            LessonTitle = lessonRow.Title,
            Difficulty = MapDifficulty(lessonRow.Difficulty),
            ProgressPercent = progressPercent,
            CompletedExercises = candidate.Completed,
            TotalExercises = candidate.Total
        };
    }

    private static int ComputeStreakDays(IEnumerable<DateTimeOffset> submissionDates)
    {
        var days = submissionDates
            .Select(date => date.UtcDateTime.Date)
            .Distinct()
            .OrderByDescending(date => date)
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

    private static int ComputePracticeMinutes(int submissionCount)
    {
        return submissionCount <= 0 ? 0 : submissionCount * 12;
    }

    private static IReadOnlyList<DashboardWeeklyActivityDto> BuildWeeklyActivity(
        IReadOnlyList<StudentLessonExerciseSubmissionRow> lessonSubmissions,
        IReadOnlyList<StudentGeneralExerciseSubmissionRow> generalSubmissions)
    {
        var lessonByDay = lessonSubmissions
            .GroupBy(item => DateOnly.FromDateTime(item.SubmittedAt.UtcDateTime.Date))
            .ToDictionary(group => group.Key, group => group.Count() * 12);

        var generalByDay = generalSubmissions
            .GroupBy(item => DateOnly.FromDateTime(item.SubmittedAt.UtcDateTime.Date))
            .ToDictionary(group => group.Key, group => group.Count() * 12);

        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var start = today.AddDays(-6);

        var result = new List<DashboardWeeklyActivityDto>(7);
        for (var i = 0; i < 7; i++)
        {
            var day = start.AddDays(i);
            lessonByDay.TryGetValue(day, out var lessonMinutes);
            generalByDay.TryGetValue(day, out var generalMinutes);

            result.Add(new DashboardWeeklyActivityDto
            {
                Date = day,
                DayLabel = day.ToString("ddd"),
                Minutes = lessonMinutes + generalMinutes
            });
        }

        return result;
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

    private sealed class LessonProgressPoint
    {
        public string LessonId { get; set; } = string.Empty;

        public int Completed { get; set; }

        public int Total { get; set; }

        public DateTimeOffset MostRecentSubmission { get; set; }
    }
}
