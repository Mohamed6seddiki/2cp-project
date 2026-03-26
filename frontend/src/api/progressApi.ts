import { apiRequest } from './httpClient';

export interface ProgressExerciseItemDto {
  exerciseId: string;
  title: string;
  score: number;
  completed: boolean;
  submittedAt: string;
}

export interface ProgressDto {
  studentId: string;
  totalScore: number;
  lessonExercises: ProgressExerciseItemDto[];
  generalExercises: ProgressExerciseItemDto[];
}

export function getMyProgress() {
  return apiRequest<ProgressDto>('/api/progress/me');
}
