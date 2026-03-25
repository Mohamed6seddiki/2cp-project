import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchLessons } from '../services/lessonService';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchLessons();
        setLessons(data);
      } catch (err) {
        setError(err?.message ?? 'Failed to load lessons.');
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-text-muted">
            Welcome {user?.username || user?.name || user?.email || 'Student'}
          </p>
        </div>
        <Button variant="danger" onClick={logout}>
          Logout
        </Button>
      </div>

      {loading && <p className="text-text-muted">Loading lessons...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="p-5 space-y-3">
            <h2 className="font-semibold text-lg">{lesson.title}</h2>
            <p className="text-sm text-text-muted line-clamp-3">{lesson.content}</p>
            <Link className="text-primary hover:text-primary-hover" to={`/lessons/${lesson.id}`}>
              View lesson details
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
