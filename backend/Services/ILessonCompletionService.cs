using backend.DTOs;

namespace backend.Services;

public interface ILessonCompletionService
{
    Task<LessonCompletionDto?> GetLessonCompletionAsync(string studentId, string lessonId, string accessToken, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LessonCompletionDto>> GetAllLessonCompletionsAsync(string studentId, string accessToken, CancellationToken cancellationToken = default);
}
