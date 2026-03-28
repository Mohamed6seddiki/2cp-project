namespace backend.DTOs;

public sealed class LeaderboardDto
{
    public IReadOnlyList<LeaderboardEntryDto> Entries { get; set; } = [];

    public LeaderboardEntryDto? Me { get; set; }
}

public sealed class LeaderboardEntryDto
{
    public string StudentId { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public int TotalScore { get; set; }

    public int StreakDays { get; set; }

    public int SolvedCount { get; set; }

    public int Rank { get; set; }

    public bool IsCurrentUser { get; set; }
}
