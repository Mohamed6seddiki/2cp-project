import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Code2, Edit, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import {
  createAdminGeneralExercise,
  deleteAdminGeneralExercise,
  getAdminGeneralExercises,
  type AdminDifficulty,
  type AdminGeneralExercise,
  updateAdminGeneralExercise,
} from '../../api/adminApi';

type PracticeFormState = {
  title: string;
  description: string;
  difficulty: AdminDifficulty;
  points: number;
};

const EMPTY_FORM: PracticeFormState = {
  title: '',
  description: '',
  difficulty: 'Beginner',
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

const ManagePractice = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [practices, setPractices] = useState<AdminGeneralExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState<PracticeFormState>(EMPTY_FORM);
  const [editingPracticeId, setEditingPracticeId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingPracticeId, setDeletingPracticeId] = useState<string | null>(null);

  const filteredPractices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return practices;
    }

    return practices.filter((practice) => `${practice.title} ${practice.description}`.toLowerCase().includes(normalizedSearch));
  }, [practices, searchTerm]);

  const loadPractices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminGeneralExercises();
      setPractices(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load general exercises.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPractices();
  }, [loadPractices]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      setNotice('');

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        points: form.points,
      };

      if (editingPracticeId) {
        await updateAdminGeneralExercise(editingPracticeId, payload);
        setNotice('General exercise updated successfully.');
      } else {
        await createAdminGeneralExercise(payload);
        setNotice('General exercise created successfully.');
      }

      setForm(EMPTY_FORM);
      setEditingPracticeId(null);
      await loadPractices();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Failed to save general exercise.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (exercise: AdminGeneralExercise) => {
    setForm({
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      points: exercise.points,
    });
    setEditingPracticeId(exercise.id);
  };

  const handleDelete = async (exerciseId: string) => {
    if (!window.confirm('Delete this general exercise?')) {
      return;
    }

    try {
      setDeletingPracticeId(exerciseId);
      setError('');
      setNotice('');

      await deleteAdminGeneralExercise(exerciseId);
      setNotice('General exercise deleted.');
      await loadPractices();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Failed to delete general exercise.'));
    } finally {
      setDeletingPracticeId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Practice</h1>
          <p className="text-text-muted">Create and maintain general coding practice exercises.</p>
        </div>
        <Button
          variant="secondary"
          className="gap-2 shrink-0"
          onClick={() => {
            setEditingPracticeId(null);
            setForm(EMPTY_FORM);
            void loadPractices();
          }}
        >
          <RefreshCcw size={16} /> Refresh
        </Button>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}
      {notice && <p className="text-success text-sm">{notice}</p>}

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{editingPracticeId ? 'Edit General Exercise' : 'Create General Exercise'}</h2>
          {editingPracticeId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingPracticeId(null);
                setForm(EMPTY_FORM);
              }}
            >
              Cancel Edit
            </Button>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Title"
              placeholder="Exercise title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-text-muted">Difficulty</label>
              <select
                title="Select exercise difficulty"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.difficulty}
                onChange={(event) => setForm((prev) => ({
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
              label="Points"
              type="number"
              min={0}
              value={form.points}
              onChange={(event) => setForm((prev) => ({
                ...prev,
                points: Number(event.target.value) || 0,
              }))}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Exercise description"
              className="w-full min-h-24 bg-background border border-border rounded-md px-3 py-2 text-text placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <Button type="submit" className="gap-2" disabled={submitting}>
            <Plus size={16} />
            {submitting
              ? (editingPracticeId ? 'Updating Exercise...' : 'Creating Exercise...')
              : (editingPracticeId ? 'Update Exercise' : 'Create Exercise')}
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
              placeholder="Search practice by title..."
              className="pl-10 h-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">{filteredPractices.length} exercises</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-surface-hover text-text-muted text-sm border-b border-border">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Difficulty</th>
                <th className="p-4 font-medium">Points</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr>
                  <td className="p-4 text-text-muted" colSpan={5}>Loading general exercises...</td>
                </tr>
              )}

              {!loading && filteredPractices.length === 0 && (
                <tr>
                  <td className="p-4 text-text-muted" colSpan={5}>No general exercises found.</td>
                </tr>
              )}

              {!loading && filteredPractices.map((practice) => (
                <tr key={practice.id} className="border-b border-border hover:bg-surface-hover/50 transition-colors last:border-0 group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Code2 size={16} className="text-primary shrink-0" />
                      <div>
                        <div className="font-bold text-text group-hover:text-primary transition-colors cursor-pointer">{practice.title}</div>
                        <div className="text-xs text-text-muted mt-1">{practice.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={getDifficultyBadgeVariant(practice.difficulty)}>{practice.difficulty}</Badge>
                  </td>
                  <td className="p-4 text-text-muted">{practice.points}</td>
                  <td className="p-4 text-text-muted">{formatDate(practice.createdAt)}</td>
                  <td className="p-4 font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1.5 text-text-muted hover:text-tertiary hover:bg-tertiary/10 rounded transition-colors"
                        title="Edit"
                        onClick={() => handleEdit(practice)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                        title="Delete"
                        onClick={() => {
                          void handleDelete(practice.id);
                        }}
                        disabled={deletingPracticeId === practice.id}
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
    </div>
  );
};

export default ManagePractice;
