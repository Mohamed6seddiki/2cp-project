import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { getGeneralExercises } from '../../api/exercisesApi';
import type { ExerciseDto } from '../../api/lessonsApi';

const ExercisesPage = () => {
  const [query, setQuery] = useState('');
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getGeneralExercises();
        setExercises(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exercises.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => exercises.filter((exercise) => {
    const search = `${exercise.title} ${exercise.description}`.toLowerCase();
    return search.includes(query.toLowerCase().trim());
  }), [exercises, query]);

  const badgeVariant = (difficulty: ExerciseDto['difficulty']) => {
    if (difficulty === 'Beginner') return 'success';
    if (difficulty === 'Intermediate') return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold">General Exercises</h1>
        <p className="text-text-muted mt-1">Practice independent challenges from the API.</p>
      </div>

      <Input
        placeholder="Search exercises..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {loading && <p className="text-text-muted">Loading exercises...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!loading && filtered.map((exercise) => (
          <Card key={exercise.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={badgeVariant(exercise.difficulty)}>{exercise.difficulty}</Badge>
              <Badge variant="primary">{exercise.points} pts</Badge>
            </div>
            <h2 className="text-lg font-semibold">{exercise.title}</h2>
            <p className="text-sm text-text-muted">{exercise.description}</p>
          </Card>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-text-muted">No exercises found.</p>
        </Card>
      )}
    </div>
  );
};

export default ExercisesPage;
