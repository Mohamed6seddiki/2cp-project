using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.Text.Json.Serialization;

namespace backend.Models;

[Table("lesson_exercises")]
public sealed class LessonExerciseRow : BaseModel
{
    [PrimaryKey("id", false)]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [Column("lesson_id")]
    [JsonPropertyName("lesson_id")]
    public string LessonId { get; set; } = string.Empty;

    [Column("title")]
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [Column("points")]
    [JsonPropertyName("points")]
    public int Points { get; set; }
}
