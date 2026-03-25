import { supabase } from '../lib/supabaseClient';

export async function fetchLessons() {
  try {
    const { data, error } = await supabase.from('lessons').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[LessonService] Failed to fetch lessons:', error);
    throw error;
  }
}

export async function fetchExercisesByLessonId(lessonId) {
  try {
    const { data, error } = await supabase
      .from('lesson_exercises')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[LessonService] Failed to fetch lesson exercises:', error);
    throw error;
  }
}
