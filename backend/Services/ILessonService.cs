using backend.DTOs;

namespace backend.Services;

public interface ILessonService
{
    Task<IReadOnlyList<LessonDto>> GetLessonsAsync(string? accessToken, CancellationToken cancellationToken = default);

    Task<LessonDetailDto?> GetLessonByIdAsync(string lessonId, string? accessToken, CancellationToken cancellationToken = default);
}
