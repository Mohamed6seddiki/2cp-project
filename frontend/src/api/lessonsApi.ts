import { apiRequest } from './httpClient';

export interface LessonDto {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  orderIndex: number;
}

export interface ExerciseDto {
  id: string;
  lessonId: string | null;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
}

export interface LessonDetailDto extends LessonDto {
  content: string;
  exercises: ExerciseDto[];
}

export function getLessons() {
  return apiRequest<LessonDto[]>('/api/lessons');
}

export function getLessonById(id: string) {
  return apiRequest<LessonDetailDto>(`/api/lessons/${id}`);
}
