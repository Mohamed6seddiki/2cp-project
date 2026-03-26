using backend.DTOs;

namespace backend.Services;

public interface ILessonService
{
    Task<IReadOnlyList<LessonDto>> GetLessonsAsync(CancellationToken cancellationToken = default);

    Task<LessonDetailDto?> GetLessonByIdAsync(string lessonId, CancellationToken cancellationToken = default);
}
