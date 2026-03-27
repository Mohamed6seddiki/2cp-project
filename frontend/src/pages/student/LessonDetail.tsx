import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Play, ChevronLeft, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { getLessonById, type LessonDetailDto } from '../../api/lessonsApi';
import { getLessonCompletion, type LessonCompletionDto } from '../../api/lessonCompletionApi';

const getCompletionState = (completion: LessonCompletionDto | null, exerciseId: string) => {
  if (!completion) {
    return null;
  }

  return completion.exercises.find((item) => item.exerciseId === exerciseId) ?? null;
};

const LessonDetail = () => {
  const { id = '' } = useParams();
  const [lesson, setLesson] = useState<LessonDetailDto | null>(null);
  const [completion, setCompletion] = useState<LessonCompletionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const lessonData = await getLessonById(id);
        setLesson(lessonData);

        try {
          const completionData = await getLessonCompletion(id);
          setCompletion(completionData);
        } catch {
          setCompletion(null);
        }
      } catch (err) {
        setLesson(null);
        setCompletion(null);
        setError(err instanceof Error ? err.message : 'Failed to load lesson details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    } else {
      setLoading(false);
      setError('Invalid lesson identifier.');
    }
  }, [id]);

  const badgeVariant = useMemo(() => {
    if (!lesson) return 'default' as const;
    if (lesson.difficulty === 'Beginner') return 'success' as const;
    if (lesson.difficulty === 'Intermediate') return 'warning' as const;
    return 'danger' as const;
  }, [lesson]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <Link to="/lessons" className="text-sm font-medium text-text-muted hover:text-text flex items-center gap-1 mb-4 transition-colors">
          <ChevronLeft size={16} /> Back to Lessons
        </Link>
      </div>

      {loading && <p className="text-text-muted">Loading lesson details...</p>}

      {!loading && error && (
        <Card className="p-6 border-danger/40">
          <p className="text-danger flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </p>
        </Card>
      )}

      {!loading && !error && lesson && (
        <>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{lesson.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant={badgeVariant}>{lesson.difficulty}</Badge>
              <span className="text-text-muted">{lesson.estimatedMinutes} min read</span>
              {completion && (
                <Badge variant={completion.isCompleted ? 'success' : 'warning'}>
                  {completion.progressPercent}% complete
                </Badge>
              )}
            </div>
            <p className="text-text-muted">{lesson.description}</p>
          </div>

          {completion && (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Completion Progress</h2>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">
                  {completion.completedExercises}/{completion.totalExercises} exercises completed
                </span>
                <span className="font-semibold">{completion.progressPercent}%</span>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${completion.progressPercent}%` }} />
              </div>
            </Card>
          )}

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Lesson Content</h2>
            <pre className="whitespace-pre-wrap text-sm text-text-muted leading-relaxed font-sans">{lesson.content}</pre>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Exercises</h2>
            {lesson.exercises.length === 0 && <p className="text-text-muted">No exercises yet for this lesson.</p>}
            <div className="grid md:grid-cols-2 gap-4">
              {lesson.exercises.map((exercise) => {
                const exerciseCompletion = getCompletionState(completion, exercise.id);

                return (
                  <Card key={exercise.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{exercise.title}</h3>
                      <Badge variant="primary">{exercise.points} pts</Badge>
                    </div>
                    {exerciseCompletion && (
                      <Badge variant={exerciseCompletion.completed ? 'success' : 'default'}>
                        {exerciseCompletion.completed
                          ? `Completed (${exerciseCompletion.score}/${exerciseCompletion.maxPoints})`
                          : 'Not completed'}
                      </Badge>
                    )}
                    <p className="text-sm text-text-muted">{exercise.description}</p>
                  </Card>
                );
              })}
            </div>
          </Card>

          <div className="mt-2">
            <Button size="lg" className="px-8 font-bold gap-2" to="/practice">
              Start Practice Exercise <Play size={18} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default LessonDetail;
