using System.Text.Json.Serialization;

namespace backend.Models;

public sealed class LeaderboardSnapshotRow
{
    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("total_score")]
    public int TotalScore { get; set; }

    [JsonPropertyName("solved_count")]
    public int SolvedCount { get; set; }

    [JsonPropertyName("activity_days")]
    public List<string>? ActivityDays { get; set; }
}
