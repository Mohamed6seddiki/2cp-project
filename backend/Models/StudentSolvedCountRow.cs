using System.Text.Json.Serialization;

namespace backend.Models;

public sealed class StudentSolvedCountRow
{
    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("solved_count")]
    public int SolvedCount { get; set; }
}
