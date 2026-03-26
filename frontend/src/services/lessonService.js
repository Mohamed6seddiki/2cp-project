import { getLessonById, getLessons } from '../api/lessonsApi';

export async function fetchLessons() {
  try {
    return await getLessons();
  } catch (error) {
    console.error('[LessonService] Failed to fetch lessons:', error);
    throw error;
  }
}

export async function fetchExercisesByLessonId(lessonId) {
  try {
    const lesson = await getLessonById(lessonId);
    return lesson?.exercises ?? [];
  } catch (error) {
    console.error('[LessonService] Failed to fetch lesson exercises:', error);
    throw error;
  }
}
