import { apiRequest } from './httpClient';

export interface LessonExerciseCompletionDto {
  exerciseId: string;
  title: string;
  completed: boolean;
  score: number;
  maxPoints: number;
  submittedAt?: string | null;
}

export interface LessonCompletionDto {
  lessonId: string;
  completedExercises: number;
  totalExercises: number;
  progressPercent: number;
  isCompleted: boolean;
  exercises: LessonExerciseCompletionDto[];
}

export function getLessonCompletion(lessonId: string) {
  return apiRequest<LessonCompletionDto>(`/api/lessons/${lessonId}/completion`);
}

export function getAllLessonCompletions() {
  return apiRequest<LessonCompletionDto[]>('/api/lessons/completions/me');
}
