import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Edit, Layers3, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import {
  createAdminLesson,
  createAdminLessonExercise,
  deleteAdminLesson,
  deleteAdminLessonExercise,
  getAdminLessonExercises,
  getAdminLessons,
  type AdminDifficulty,
  type AdminLesson,
  type AdminLessonExercise,
  updateAdminLesson,
  updateAdminLessonExercise,
} from '../../api/adminApi';

type LessonFormState = {
  title: string;
  content: string;
  difficulty: AdminDifficulty;
  orderIndex: number;
};

type LessonExerciseFormState = {
  title: string;
  description: string;
  points: number;
};

const EMPTY_LESSON_FORM: LessonFormState = {
  title: '',
  content: '',
  difficulty: 'Beginner',
  orderIndex: 1,
};

const EMPTY_LESSON_EXERCISE_FORM: LessonExerciseFormState = {
  title: '',
  description: '',
  points: 0,
};

const getDifficultyBadgeVariant = (difficulty: AdminDifficulty): 'success' | 'warning' | 'danger' => {
  if (difficulty === 'Beginner') return 'success';
  if (difficulty === 'Intermediate') return 'warning';
  return 'danger';
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

const ManageLessons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [lessonsError, setLessonsError] = useState('');
  const [lessonsNotice, setLessonsNotice] = useState('');

  const [lessonForm, setLessonForm] = useState<LessonFormState>(EMPTY_LESSON_FORM);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [submittingLesson, setSubmittingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const [lessonExercises, setLessonExercises] = useState<AdminLessonExercise[]>([]);
  const [loadingLessonExercises, setLoadingLessonExercises] = useState(false);
  const [lessonExercisesError, setLessonExercisesError] = useState('');
  const [lessonExercisesNotice, setLessonExercisesNotice] = useState('');
  const [exerciseForm, setExerciseForm] = useState<LessonExerciseFormState>(EMPTY_LESSON_EXERCISE_FORM);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );

  const filteredLessons = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return lessons;
    }

    return lessons.filter((lesson) => `${lesson.title} ${lesson.content}`.toLowerCase().includes(normalizedSearch));
  }, [lessons, searchTerm]);

  const loadLessons = useCallback(async () => {
    try {
      setLoadingLessons(true);
      setLessonsError('');
      const data = await getAdminLessons();
      setLessons(data);
    } catch (error) {
      setLessonsError(getErrorMessage(error, 'Failed to load lessons.'));
    } finally {
      setLoadingLessons(false);
    }
  }, []);

  const loadLessonExercises = useCallback(async (lessonId: string) => {
    try {
      setLoadingLessonExercises(true);
      setLessonExercisesError('');
      const data = await getAdminLessonExercises(lessonId);
      setLessonExercises(data);
    } catch (error) {
      setLessonExercisesError(getErrorMessage(error, 'Failed to load lesson exercises.'));
      setLessonExercises([]);
    } finally {
      setLoadingLessonExercises(false);
    }
  }, []);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

  useEffect(() => {
    if (!selectedLessonId) {
      return;
    }

    if (!lessons.some((lesson) => lesson.id === selectedLessonId)) {
      setSelectedLessonId(null);
      setLessonExercises([]);
      setExerciseForm(EMPTY_LESSON_EXERCISE_FORM);
      setEditingExerciseId(null);
    }
  }, [lessons, selectedLessonId]);

  const handleLessonSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmittingLesson(true);
      setLessonsError('');
      setLessonsNotice('');

      const payload = {
        title: lessonForm.title.trim(),
        content: lessonForm.content.trim(),
        difficulty: lessonForm.difficulty,
        orderIndex: lessonForm.orderIndex,
      };

      if (editingLessonId) {
        await updateAdminLesson(editingLessonId, payload);
        setLessonsNotice('Lesson updated successfully.');
      } else {
        await createAdminLesson(payload);
        setLessonsNotice('Lesson created successfully.');
      }

      setLessonForm(EMPTY_LESSON_FORM);
      setEditingLessonId(null);
      await loadLessons();
    } catch (error) {
      setLessonsError(getErrorMessage(error, 'Failed to save lesson.'));
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleEditLesson = (lesson: AdminLesson) => {
    setLessonForm({
      title: lesson.title,
      content: lesson.content,
      difficulty: lesson.difficulty,
      orderIndex: lesson.orderIndex,
    });
    setEditingLessonId(lesson.id);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Delete this lesson? This also removes linked lesson exercises and submissions.')) {
      return;
    }

    try {
      setDeletingLessonId(lessonId);
      setLessonsError('');
      setLessonsNotice('');

      await deleteAdminLesson(lessonId);
      setLessonsNotice('Lesson deleted.');

      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null);
        setLessonExercises([]);
        setEditingExerciseId(null);
        setExerciseForm(EMPTY_LESSON_EXERCISE_FORM);
      }

      await loadLessons();
    } catch (error) {
      setLessonsError(getErrorMessage(error, 'Failed to delete lesson.'));
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleSelectLesson = async (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setLessonExercisesNotice('');
    setLessonExercisesError('');
    setEditingExerciseId(null);
    setExerciseForm(EMPTY_LESSON_EXERCISE_FORM);
    await loadLessonExercises(lessonId);
  };

  const handleExerciseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLessonId) {
      setLessonExercisesError('Choose a lesson first.');
      return;
    }

    try {
      setSubmittingExercise(true);
      setLessonExercisesError('');
      setLessonExercisesNotice('');

      const payload = {
        title: exerciseForm.title.trim(),
        description: exerciseForm.description.trim(),
        points: exerciseForm.points,
      };

      if (editingExerciseId) {
        await updateAdminLessonExercise(editingExerciseId, payload);
        setLessonExercisesNotice('Lesson exercise updated successfully.');
      } else {
        await createAdminLessonExercise(selectedLessonId, payload);
        setLessonExercisesNotice('Lesson exercise created successfully.');
      }

      setExerciseForm(EMPTY_LESSON_EXERCISE_FORM);
      setEditingExerciseId(null);
      await loadLessonExercises(selectedLessonId);
    } catch (error) {
      setLessonExercisesError(getErrorMessage(error, 'Failed to save lesson exercise.'));
    } finally {
      setSubmittingExercise(false);
    }
  };

  const handleEditLessonExercise = (exercise: AdminLessonExercise) => {
    setExerciseForm({
      title: exercise.title,
      description: exercise.description,
      points: exercise.points,
    });
    setEditingExerciseId(exercise.id);
  };

  const handleDeleteLessonExercise = async (exerciseId: string) => {
    if (!selectedLessonId) {
      return;
    }

    if (!window.confirm('Delete this lesson exercise?')) {
      return;
    }

    try {
      setDeletingExerciseId(exerciseId);
      setLessonExercisesError('');
      setLessonExercisesNotice('');

      await deleteAdminLessonExercise(exerciseId);
      setLessonExercisesNotice('Lesson exercise deleted.');
      await loadLessonExercises(selectedLessonId);
    } catch (error) {
      setLessonExercisesError(getErrorMessage(error, 'Failed to delete lesson exercise.'));
    } finally {
      setDeletingExerciseId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Lessons</h1>
          <p className="text-text-muted">Create and maintain lesson content with linked lesson exercises.</p>
        </div>
        <Button
          variant="secondary"
          className="gap-2 shrink-0"
          onClick={() => {
            setEditingLessonId(null);
            setLessonForm(EMPTY_LESSON_FORM);
            void loadLessons();
          }}
        >
          <RefreshCcw size={16} /> Refresh
        </Button>
      </div>

      {lessonsError && <p className="text-danger text-sm">{lessonsError}</p>}
      {lessonsNotice && <p className="text-success text-sm">{lessonsNotice}</p>}

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{editingLessonId ? 'Edit Lesson' : 'Create Lesson'}</h2>
          {editingLessonId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingLessonId(null);
                setLessonForm(EMPTY_LESSON_FORM);
              }}
            >
              Cancel Edit
            </Button>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleLessonSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Title"
              placeholder="Lesson title"
              value={lessonForm.title}
              onChange={(event) => setLessonForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-text-muted">Difficulty</label>
              <select
                title="Select lesson difficulty"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-primary"
                value={lessonForm.difficulty}
                onChange={(event) => setLessonForm((prev) => ({
                  ...prev,
                  difficulty: event.target.value as AdminDifficulty,
                }))}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <Input
              label="Order Index"
              type="number"
              min={1}
              value={lessonForm.orderIndex}
              onChange={(event) => setLessonForm((prev) => ({
                ...prev,
                orderIndex: Number(event.target.value) || 1,
              }))}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Content</label>
            <textarea
              value={lessonForm.content}
              onChange={(event) => setLessonForm((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Write lesson content"
              className="w-full min-h-32 bg-background border border-border rounded-md px-3 py-2 text-text placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <Button type="submit" className="gap-2" disabled={submittingLesson}>
            <Plus size={16} />
            {submittingLesson
              ? (editingLessonId ? 'Updating Lesson...' : 'Creating Lesson...')
              : (editingLessonId ? 'Update Lesson' : 'Create Lesson')}
          </Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-surface flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Search size={18} />
            </div>
            <Input
              placeholder="Search lessons by title or content..."
              className="pl-10 h-10 w-full"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">{filteredLessons.length} lessons</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-surface-hover text-text-muted text-sm border-b border-border">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Difficulty</th>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium text-right w-64">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loadingLessons && (
                <tr>
                  <td className="p-4 text-text-muted" colSpan={5}>Loading lessons...</td>
                </tr>
              )}

              {!loadingLessons && filteredLessons.length === 0 && (
                <tr>
                  <td className="p-4 text-text-muted" colSpan={5}>No lessons found.</td>
                </tr>
              )}

              {!loadingLessons && filteredLessons.map((lesson) => {
                const isSelected = selectedLessonId === lesson.id;

                return (
                  <tr key={lesson.id} className={`border-b border-border transition-colors last:border-0 ${isSelected ? 'bg-primary/5' : 'hover:bg-surface-hover/50'}`}>
                    <td className="p-4">
                      <div className="font-bold text-text">{lesson.title}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getDifficultyBadgeVariant(lesson.difficulty)}>{lesson.difficulty}</Badge>
                    </td>
                    <td className="p-4 text-text-muted">{lesson.orderIndex}</td>
                    <td className="p-4 text-text-muted">{formatDate(lesson.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className={`p-1.5 rounded transition-colors ${isSelected ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary hover:bg-primary/10'}`}
                          title="Manage lesson exercises"
                          onClick={() => {
                            void handleSelectLesson(lesson.id);
                          }}
                        >
                          <Layers3 size={16} />
                        </button>
                        <button
                          className="p-1.5 text-text-muted hover:text-tertiary hover:bg-tertiary/10 rounded transition-colors"
                          title="Edit lesson"
                          onClick={() => handleEditLesson(lesson)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          title="Delete lesson"
                          onClick={() => {
                            void handleDeleteLesson(lesson.id);
                          }}
                          disabled={deletingLessonId === lesson.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedLesson && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Lesson Exercises</h2>
              <p className="text-text-muted text-sm">{selectedLesson.title}</p>
            </div>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => {
                void loadLessonExercises(selectedLesson.id);
              }}
            >
              <RefreshCcw size={16} /> Refresh Exercises
            </Button>
          </div>

          {lessonExercisesError && <p className="text-danger text-sm">{lessonExercisesError}</p>}
          {lessonExercisesNotice && <p className="text-success text-sm">{lessonExercisesNotice}</p>}

          <form className="space-y-4" onSubmit={handleExerciseSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Title"
                placeholder="Exercise title"
                value={exerciseForm.title}
                onChange={(event) => setExerciseForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
              <Input
                label="Points"
                type="number"
                min={0}
                value={exerciseForm.points}
                onChange={(event) => setExerciseForm((prev) => ({
                  ...prev,
                  points: Number(event.target.value) || 0,
                }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">Description</label>
              <textarea
                value={exerciseForm.description}
                onChange={(event) => setExerciseForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Exercise prompt"
                className="w-full min-h-24 bg-background border border-border rounded-md px-3 py-2 text-text placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="gap-2" disabled={submittingExercise}>
                <Plus size={16} />
                {submittingExercise
                  ? (editingExerciseId ? 'Updating Exercise...' : 'Creating Exercise...')
                  : (editingExerciseId ? 'Update Exercise' : 'Create Exercise')}
              </Button>
              {editingExerciseId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingExerciseId(null);
                    setExerciseForm(EMPTY_LESSON_EXERCISE_FORM);
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-hover text-text-muted text-sm border-b border-border">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Points</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loadingLessonExercises && (
                  <tr>
                    <td className="p-4 text-text-muted" colSpan={4}>Loading exercises...</td>
                  </tr>
                )}

                {!loadingLessonExercises && lessonExercises.length === 0 && (
                  <tr>
                    <td className="p-4 text-text-muted" colSpan={4}>No exercises for this lesson yet.</td>
                  </tr>
                )}

                {!loadingLessonExercises && lessonExercises.map((exercise) => (
                  <tr key={exercise.id} className="border-b border-border hover:bg-surface-hover/50 transition-colors last:border-0">
                    <td className="p-4">
                      <div className="font-semibold text-text">{exercise.title}</div>
                      <div className="text-xs text-text-muted mt-1">{exercise.description}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="primary">{exercise.points} pts</Badge>
                    </td>
                    <td className="p-4 text-text-muted">{formatDate(exercise.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 text-text-muted hover:text-tertiary hover:bg-tertiary/10 rounded transition-colors"
                          title="Edit exercise"
                          onClick={() => handleEditLessonExercise(exercise)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          title="Delete exercise"
                          onClick={() => {
                            void handleDeleteLessonExercise(exercise.id);
                          }}
                          disabled={deletingExerciseId === exercise.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManageLessons;
