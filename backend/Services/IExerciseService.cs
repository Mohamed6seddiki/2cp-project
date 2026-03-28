using backend.DTOs;
using backend.Models;

namespace backend.Services;

public interface IExerciseService
{
    Task<IReadOnlyList<ExerciseDto>> GetGeneralExercisesAsync(string? accessToken, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<GeneralExerciseRow>> GetGeneralExerciseRowsAsync(string? accessToken, CancellationToken cancellationToken = default);

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
