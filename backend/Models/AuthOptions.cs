namespace backend.Models;

public sealed class AuthOptions
{
    public const string SectionName = "Auth";

    public string JwtAudience { get; set; } = "authenticated";
}
