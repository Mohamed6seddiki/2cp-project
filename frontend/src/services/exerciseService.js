import {
  submitGeneralExercise as submitGeneralExerciseApi,
  submitLessonExercise as submitLessonExerciseApi,
} from '../api/exercisesApi';
import { getMyProgress } from '../api/progressApi';

export async function submitLessonExercise(exerciseId, score) {
  try {
    return await submitLessonExerciseApi(exerciseId, { score });
  } catch (error) {
    console.error('[ExerciseService] submitLessonExercise failed:', error);
    throw error;
  }
}

export async function submitGeneralExercise(exerciseId, score) {
  try {
    return await submitGeneralExerciseApi(exerciseId, { score });
  } catch (error) {
    console.error('[ExerciseService] submitGeneralExercise failed:', error);
    throw error;
  }
}

export async function viewStudentProgress() {
  try {
    return await getMyProgress();
  } catch (error) {
    console.error('[ExerciseService] viewStudentProgress failed:', error);
    throw error;
  }
}
