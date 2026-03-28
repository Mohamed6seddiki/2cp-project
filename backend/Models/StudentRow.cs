using System.Text.Json.Serialization;

namespace backend.Models;

public sealed class StudentRow
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("total_score")]
    public int TotalScore { get; set; }
}
