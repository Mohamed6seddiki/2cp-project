namespace backend.DTOs;

public sealed class DashboardDto
{
    public int CompletedLessons { get; set; }

    public int CurrentStreakDays { get; set; }

    public int AverageScorePercent { get; set; }

    public int PracticeMinutesTotal { get; set; }

    public IReadOnlyList<DashboardWeeklyActivityDto> WeeklyActivity { get; set; } = [];

    public IReadOnlyList<DashboardRecentActivityDto> RecentActivity { get; set; } = [];

    public DashboardDailyChallengeDto DailyChallenge { get; set; } = new();

    public DashboardContinueLearningDto? ContinueLearning { get; set; }
}

public sealed class DashboardWeeklyActivityDto
{
    public string DayLabel { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public int Minutes { get; set; }
}

public sealed class DashboardRecentActivityDto
{
    public string Type { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public int Score { get; set; }

    public DateTimeOffset SubmittedAt { get; set; }
}

public sealed class DashboardDailyChallengeDto
{
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "Beginner";

    public int Points { get; set; }
}

public sealed class DashboardContinueLearningDto
{
    public string LessonId { get; set; } = string.Empty;

    public string LessonTitle { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "Beginner";

    public int ProgressPercent { get; set; }

    public int CompletedExercises { get; set; }

    public int TotalExercises { get; set; }
}
