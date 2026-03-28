import { apiRequest } from './httpClient';

export type AdminDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type AdminRole = 'admin' | 'student';

export interface AdminLesson {
  id: string;
  title: string;
  content: string;
  difficulty: AdminDifficulty;
  orderIndex: number;
  createdAt: string;
}

export interface AdminLessonUpsertRequest {
  title: string;
  content: string;
  difficulty: AdminDifficulty;
  orderIndex: number;
}

export interface AdminLessonExercise {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  points: number;
  createdAt: string;
}

export interface AdminLessonExerciseUpsertRequest {
  title: string;
  description: string;
  points: number;
}

export interface AdminGeneralExercise {
  id: string;
  title: string;
  description: string;
  difficulty: AdminDifficulty;
  points: number;
  createdAt: string;
}

export interface AdminGeneralExerciseUpsertRequest {
  title: string;
  description: string;
  difficulty: AdminDifficulty;
  points: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: AdminRole;
  createdAt: string;
}

export interface AdminUserRoleUpdateRequest {
  role: AdminRole;
}

export function getAdminLessons() {
  return apiRequest<AdminLesson[]>('/api/admin/lessons');
}

export function createAdminLesson(payload: AdminLessonUpsertRequest) {
  return apiRequest<AdminLesson>('/api/admin/lessons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminLesson(lessonId: string, payload: AdminLessonUpsertRequest) {
  return apiRequest<AdminLesson>(`/api/admin/lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminLesson(lessonId: string) {
  return apiRequest<void>(`/api/admin/lessons/${lessonId}`, {
    method: 'DELETE',
  });
}

export function getAdminLessonExercises(lessonId: string) {
  return apiRequest<AdminLessonExercise[]>(`/api/admin/lessons/${lessonId}/exercises`);
}

export function createAdminLessonExercise(lessonId: string, payload: AdminLessonExerciseUpsertRequest) {
  return apiRequest<AdminLessonExercise>(`/api/admin/lessons/${lessonId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminLessonExercise(exerciseId: string, payload: AdminLessonExerciseUpsertRequest) {
  return apiRequest<AdminLessonExercise>(`/api/admin/lessons/exercises/${exerciseId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminLessonExercise(exerciseId: string) {
  return apiRequest<void>(`/api/admin/lessons/exercises/${exerciseId}`, {
    method: 'DELETE',
  });
}

export function getAdminGeneralExercises() {
  return apiRequest<AdminGeneralExercise[]>('/api/admin/exercises/general');
}

export function createAdminGeneralExercise(payload: AdminGeneralExerciseUpsertRequest) {
  return apiRequest<AdminGeneralExercise>('/api/admin/exercises/general', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminGeneralExercise(exerciseId: string, payload: AdminGeneralExerciseUpsertRequest) {
  return apiRequest<AdminGeneralExercise>(`/api/admin/exercises/general/${exerciseId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminGeneralExercise(exerciseId: string) {
  return apiRequest<void>(`/api/admin/exercises/general/${exerciseId}`, {
    method: 'DELETE',
  });
}

export function getAdminUsers() {
  return apiRequest<AdminUser[]>('/api/admin/users');
}

export function updateAdminUserRole(userId: string, payload: AdminUserRoleUpdateRequest) {
  return apiRequest<AdminUser>(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
