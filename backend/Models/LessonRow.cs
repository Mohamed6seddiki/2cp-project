using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models;

[Table("lessons")]
public sealed class LessonRow : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = string.Empty;

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("content")]
    public string Content { get; set; } = string.Empty;

    [Column("difficulty")]
    public string Difficulty { get; set; } = "easy";

    [Column("order_index")]
    public int OrderIndex { get; set; }
}
