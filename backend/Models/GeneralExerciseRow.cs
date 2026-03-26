using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models;

[Table("general_exercises")]
public sealed class GeneralExerciseRow : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = string.Empty;

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("difficulty")]
    public string Difficulty { get; set; } = "easy";

    [Column("points")]
    public int Points { get; set; }
}
