using backend.DTOs.Admin;

namespace backend.Services;

public interface IAdminExerciseService
{
    Task<IReadOnlyList<AdminGeneralExerciseDto>> GetGeneralExercisesAsync(string accessToken, CancellationToken cancellationToken = default);

    Task<AdminGeneralExerciseDto> CreateGeneralExerciseAsync(AdminGeneralExerciseUpsertRequestDto request, string accessToken, CancellationToken cancellationToken = default);

    Task<AdminGeneralExerciseDto?> UpdateGeneralExerciseAsync(string exerciseId, AdminGeneralExerciseUpsertRequestDto request, string accessToken, CancellationToken cancellationToken = default);

    Task<bool> DeleteGeneralExerciseAsync(string exerciseId, string accessToken, CancellationToken cancellationToken = default);
}
