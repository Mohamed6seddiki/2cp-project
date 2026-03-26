import { apiRequest } from './httpClient';
import type { ExerciseDto } from './lessonsApi';

export interface ExerciseSubmissionRequestDto {
  score: number;
}

export interface ExerciseSubmissionDto {
  submissionId: string;
  exerciseId: string;
  score: number;
  completed: boolean;
  submittedAt: string;
}

export function getGeneralExercises() {
  return apiRequest<ExerciseDto[]>('/api/exercises/general');
}

export function submitGeneralExercise(exerciseId: string, payload: ExerciseSubmissionRequestDto) {
  return apiRequest<ExerciseSubmissionDto>(`/api/exercises/${exerciseId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function submitLessonExercise(exerciseId: string, payload: ExerciseSubmissionRequestDto) {
  return apiRequest<ExerciseSubmissionDto>(`/api/lessons/exercises/${exerciseId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
