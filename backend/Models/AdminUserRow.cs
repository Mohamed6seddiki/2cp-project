using System.Text.Json.Serialization;

namespace backend.Models;

public sealed class AdminUserRow
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = "student";

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}
