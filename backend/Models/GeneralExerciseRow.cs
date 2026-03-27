using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.Text.Json.Serialization;

namespace backend.Models;

[Table("general_exercises")]
public sealed class GeneralExerciseRow : BaseModel
{
    [PrimaryKey("id", false)]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [Column("title")]
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [Column("difficulty")]
    [JsonPropertyName("difficulty")]
    public string Difficulty { get; set; } = "easy";

    [Column("points")]
    [JsonPropertyName("points")]
    public int Points { get; set; }
}
