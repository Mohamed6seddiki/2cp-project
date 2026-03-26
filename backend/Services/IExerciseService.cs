using backend.DTOs;

namespace backend.Services;

public interface IExerciseService
{
    Task<IReadOnlyList<ExerciseDto>> GetGeneralExercisesAsync(CancellationToken cancellationToken = default);

    Task<ExerciseSubmissionDto> SubmitGeneralExerciseAsync(
        string studentId,
        string accessToken,
        string exerciseId,
        int score,
        CancellationToken cancellationToken = default);

    Task<ExerciseSubmissionDto> SubmitLessonExerciseAsync(
        string studentId,
        string accessToken,
        string lessonExerciseId,
        int score,
        CancellationToken cancellationToken = default);
}
