using backend.DTOs.Admin;

namespace backend.Services;

public interface IAdminLessonService
{
    Task<IReadOnlyList<AdminLessonDto>> GetLessonsAsync(string accessToken, CancellationToken cancellationToken = default);

    Task<AdminLessonDto> CreateLessonAsync(AdminLessonUpsertRequestDto request, string accessToken, CancellationToken cancellationToken = default);

    Task<AdminLessonDto?> UpdateLessonAsync(string lessonId, AdminLessonUpsertRequestDto request, string accessToken, CancellationToken cancellationToken = default);

    Task<bool> DeleteLessonAsync(string lessonId, string accessToken, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminLessonExerciseDto>> GetLessonExercisesAsync(string lessonId, string accessToken, CancellationToken cancellationToken = default);

    Task<AdminLessonExerciseDto> CreateLessonExerciseAsync(string lessonId, AdminLessonExerciseUpsertRequestDto request, string accessToken, CancellationToken cancellationToken = default);

    Task<AdminLessonExerciseDto?> UpdateLessonExerciseAsync(string lessonExerciseId, AdminLessonExerciseUpsertRequestDto request, string accessToken, CancellationToken cancellationToken = default);

    Task<bool> DeleteLessonExerciseAsync(string lessonExerciseId, string accessToken, CancellationToken cancellationToken = default);
}
