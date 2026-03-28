import { apiRequest } from './httpClient';

export interface DashboardWeeklyActivityDto {
  dayLabel: string;
  date: string;
  minutes: number;
}

export interface DashboardRecentActivityDto {
  type: 'lesson' | 'general';
  title: string;
  score: number;
  submittedAt: string;
}

export interface DashboardDailyChallengeDto {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
}

export interface DashboardContinueLearningDto {
  lessonId: string;
  lessonTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progressPercent: number;
  completedExercises: number;
  totalExercises: number;
}

export interface DashboardDto {
  completedLessons: number;
  currentStreakDays: number;
  averageScorePercent: number;
  practiceMinutesTotal: number;
  weeklyActivity: DashboardWeeklyActivityDto[];
  recentActivity: DashboardRecentActivityDto[];
  dailyChallenge: DashboardDailyChallengeDto;
  continueLearning?: DashboardContinueLearningDto | null;
}

export function getMyDashboard() {
  return apiRequest<DashboardDto>('/api/dashboard/me');
}
