using backend.DTOs;
using backend.Models;
using backend.Supabase;
using Supabase.Postgrest.Exceptions;

namespace backend.Services;

public sealed class LessonService : ILessonService
{
    private readonly ISupabaseClientFactory _supabaseClientFactory;

    public LessonService(ISupabaseClientFactory supabaseClientFactory)
    {
        _supabaseClientFactory = supabaseClientFactory;
    }

    public async Task<IReadOnlyList<LessonDto>> GetLessonsAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var client = await _supabaseClientFactory.GetClientAsync(cancellationToken);
        var lessonRows = await client.From<LessonRow>().Get();

        var items = lessonRows.Models
            .OrderBy(x => x.OrderIndex)
            .Select(MapLesson)
            .ToList();

        return items;
    }

    public async Task<LessonDetailDto?> GetLessonByIdAsync(string lessonId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(lessonId))
        {
            return null;
        }

        var client = await _supabaseClientFactory.GetClientAsync(cancellationToken);

        LessonRow? lesson;
        try
        {
            lesson = await client
                .From<LessonRow>()
                .Where(x => x.Id == lessonId)
                .Single();
        }
        catch (PostgrestException ex) when (ex.Response?.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }

        if (lesson is null)
        {
            return null;
        }

        var exerciseRows = await client
            .From<LessonExerciseRow>()
            .Where(x => x.LessonId == lessonId)
            .Get();

        var lessonDetail = new LessonDetailDto
        {
            Id = lesson.Id,
            Title = lesson.Title,
            Description = lesson.Title,
            Difficulty = MapDifficulty(lesson.Difficulty),
            EstimatedMinutes = EstimateMinutes(lesson.Content),
            OrderIndex = lesson.OrderIndex,
            Content = lesson.Content,
            Exercises = exerciseRows.Models
                .Select(MapLessonExercise)
                .ToList()
        };

        return lessonDetail;
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
