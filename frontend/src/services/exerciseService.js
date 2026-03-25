import { supabase } from '../lib/supabaseClient';

export async function submitLessonExercise(exerciseId, score) {
  try {
    const { data, error } = await supabase.rpc('submit_lesson_exercise', {
      p_lesson_exercise_id: exerciseId,
      p_score: score,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[ExerciseService] submitLessonExercise failed:', error);
    throw error;
  }
}

export async function submitGeneralExercise(exerciseId, score) {
  try {
    const { data, error } = await supabase.rpc('submit_general_exercise', {
      p_exercise_id: exerciseId,
      p_score: score,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[ExerciseService] submitGeneralExercise failed:', error);
    throw error;
  }
}

export async function viewStudentProgress() {
  try {
    const { data, error } = await supabase.rpc('view_student_progress');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[ExerciseService] viewStudentProgress failed:', error);
    throw error;
  }
}
