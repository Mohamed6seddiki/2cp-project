namespace backend.Models;

public sealed class MyAlgoOptions
{
    public const string SectionName = "MyAlgo";

    public string CliPath { get; set; } = string.Empty;

    public int TimeoutMs { get; set; } = 10000;
}
