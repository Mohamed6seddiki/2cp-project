using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.Text.Json.Serialization;

namespace backend.Models;

[Table("lessons")]
public sealed class LessonRow : BaseModel
{
    [PrimaryKey("id", false)]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [Column("title")]
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [Column("content")]
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [Column("difficulty")]
    [JsonPropertyName("difficulty")]
    public string Difficulty { get; set; } = "easy";

    [Column("order_index")]
    [JsonPropertyName("order_index")]
    public int OrderIndex { get; set; }
}
