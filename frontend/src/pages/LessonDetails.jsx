import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchExercisesByLessonId } from '../services/lessonService';
import { submitLessonExercise } from '../services/exerciseService';

export default function LessonDetails() {
  const { lessonId = '' } = useParams();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingId, setSubmittingId] = useState('');

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchExercisesByLessonId(lessonId);
        setExercises(data);
      } catch (err) {
        setError(err?.message ?? 'Failed to load exercises.');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      loadExercises();
    }
  }, [lessonId]);

  const handleSubmitExercise = async (exerciseId) => {
    try {
      setSubmittingId(exerciseId);
      await submitLessonExercise(exerciseId, 100);
      console.log('[LessonDetails] Exercise submitted:', exerciseId);
    } catch (err) {
      console.error('[LessonDetails] Submit failed:', err);
      setError(err?.message ?? 'Failed to submit exercise.');
    } finally {
      setSubmittingId('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Lesson Details</h1>
      <p className="text-text-muted">Lesson ID: {lessonId}</p>

      {loading && <p className="text-text-muted">Loading exercises...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="grid gap-4">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="p-5 space-y-3">
            <h2 className="text-lg font-semibold">{exercise.title}</h2>
            <p className="text-sm text-text-muted">{exercise.description}</p>
            <p className="text-sm">Points: {exercise.points}</p>
            <Button
              onClick={() => handleSubmitExercise(exercise.id)}
              disabled={submittingId === exercise.id}
            >
              {submittingId === exercise.id ? 'Submitting...' : 'Submit (score: 100)'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
