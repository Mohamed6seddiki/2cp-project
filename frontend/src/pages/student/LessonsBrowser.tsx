import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Clock, BookOpen } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { getLessons, type LessonDto } from '../../api/lessonsApi';
import { getAllLessonCompletions, type LessonCompletionDto } from '../../api/lessonCompletionApi';

const LessonsBrowser = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [lessonCompletions, setLessonCompletions] = useState<Record<string, LessonCompletionDto>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [data, completions] = await Promise.all([
          getLessons(),
          getAllLessonCompletions().catch(() => [] as LessonCompletionDto[]),
        ]);

        setLessons(data);
        setLessonCompletions(
          completions.reduce<Record<string, LessonCompletionDto>>((accumulator, completion) => {
            accumulator[completion.lessonId] = completion;
            return accumulator;
          }, {}),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lessons.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredLessons = useMemo(() => lessons.filter((lesson) => {
    const matchesSearch = `${lesson.title} ${lesson.description}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    return lesson.difficulty === activeFilter;
  }), [activeFilter, lessons, searchQuery]);

  const badgeByDifficulty: Record<LessonDto['difficulty'], 'success' | 'warning' | 'danger'> = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger',
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Curriculum</h1>
          <p className="text-text-muted">Master computer science concepts step by step.</p>
        </div>
        
        <div className="w-full md:w-auto flex gap-4">
          <div className="relative w-full md:w-64">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
               <Search size={18} />
             </div>
             <Input
               type="text"
               placeholder="Search lessons..."
               className="pl-10 h-10"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <Button
            variant="secondary"
            className="px-3"
            aria-label="Clear filters"
            onClick={() => {
              setActiveFilter('All');
              setSearchQuery('');
            }}
          >
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === cat 
                ? 'bg-primary text-secondary' 
                : 'bg-surface border border-border text-text hover:border-primary/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p className="text-text-muted">Loading lessons...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
        {filteredLessons.map((lesson) => (
          <Card key={lesson.id} hoverable className="flex flex-col h-full overflow-hidden">
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={badgeByDifficulty[lesson.difficulty]}>
                    {lesson.difficulty}
                  </Badge>
                  {lessonCompletions[lesson.id] && (
                    <Badge variant={lessonCompletions[lesson.id].isCompleted ? 'success' : 'warning'}>
                      {lessonCompletions[lesson.id].progressPercent}%
                    </Badge>
                  )}
                </div>
              
              <h3 className="text-xl font-bold mb-2 leading-tight">{lesson.title}</h3>
              <p className="text-text-muted text-sm mb-6 flex-1">{lesson.description}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-text-muted mt-auto mb-4">
                <span className="flex items-center gap-1"><Clock size={14} /> {lesson.estimatedMinutes} min</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> Theory + Practice</span>
              </div>

              <Button
                variant="primary"
                fullWidth 
                className="gap-2 mt-auto"
                to={`/lesson/${lesson.id}`}
              >
                Open Lesson
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {!loading && filteredLessons.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No lessons found</h3>
          <p className="text-text-muted mb-4">
            Try another search term or reset filters.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setActiveFilter('All');
              setSearchQuery('');
            }}
          >
            Reset filters
          </Button>
        </Card>
      )}
    </div>
  );
};

export default LessonsBrowser;
