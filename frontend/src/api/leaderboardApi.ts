import { apiRequest } from './httpClient';

export interface LeaderboardEntryDto {
  studentId: string;
  username: string;
  totalScore: number;
  streakDays: number;
  solvedCount: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface LeaderboardDto {
  entries: LeaderboardEntryDto[];
  me?: LeaderboardEntryDto | null;
}

export function getLeaderboard() {
  return apiRequest<LeaderboardDto>('/api/leaderboard');
}
