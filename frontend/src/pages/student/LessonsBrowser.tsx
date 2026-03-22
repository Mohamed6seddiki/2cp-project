import React, { useState } from 'react';
import { Search, Filter, Clock, BookOpen, CheckCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const LessonsBrowser = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'In Progress', 'Beginner', 'Intermediate', 'Advanced', 'Completed'];

  const lessons = [
    { id: 'intro', title: 'Introduction to Algorithms', desc: 'Learn what algorithms are and why they matter.', diff: 'Beginner', time: '10 min', status: 'Completed', progress: 100 },
    { id: 'big-o', title: 'Big O Notation', desc: 'Understand time and space complexity with simple analogies.', diff: 'Beginner', time: '15 min', status: 'Completed', progress: 100 },
    { id: 'arrays-strings', title: 'Arrays & Strings', desc: 'Master the fundamental data structures used everywhere.', diff: 'Beginner', time: '20 min', status: 'In Progress', progress: 40 },
    { id: 'binary-search', title: 'Binary Search', desc: 'Find elements in O(log N) time on sorted collections.', diff: 'Intermediate', time: '25 min', status: 'Not Started', progress: 0 },
    { id: 'two-pointers', title: 'Two Pointers Technique', desc: 'Optimize array iterations with this powerful pattern.', diff: 'Intermediate', time: '30 min', status: 'Not Started', progress: 0 },
    { id: 'dynamic-programming', title: 'Dynamic Programming', desc: 'Solve complex problems by breaking them down.', diff: 'Advanced', time: '45 min', status: 'Not Started', progress: 0 },
  ];

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = `${lesson.title} ${lesson.desc}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Completed') return lesson.status === 'Completed';
    if (activeFilter === 'In Progress') return lesson.status === 'In Progress';
    return lesson.diff === activeFilter;
  });

  const progressWidths: Record<number, string> = {
    0: 'w-0',
    40: 'w-[40%]',
    100: 'w-full',
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

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
        {filteredLessons.map((lesson) => (
          <Card key={lesson.id} hoverable className="flex flex-col h-full overflow-hidden">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={
                  lesson.diff === 'Beginner' ? 'success' : 
                  lesson.diff === 'Intermediate' ? 'warning' : 'danger'
                }>
                  {lesson.diff}
                </Badge>
                {lesson.status === 'Completed' && <CheckCircle size={20} className="text-success" />}
              </div>
              
              <h3 className="text-xl font-bold mb-2 leading-tight">{lesson.title}</h3>
              <p className="text-text-muted text-sm mb-6 flex-1">{lesson.desc}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-text-muted mt-auto mb-4">
                <span className="flex items-center gap-1"><Clock size={14} /> {lesson.time}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> Theory + Practice</span>
              </div>
              
              {lesson.status !== 'Completed' && (
                <div className="w-full bg-surface-hover rounded-full h-1.5 mb-4 overflow-hidden">
                  <div className={`bg-primary h-1.5 rounded-full ${progressWidths[lesson.progress] ?? 'w-0'}`}></div>
                </div>
              )}

              <Button
                variant={lesson.status === 'Completed' ? 'secondary' : 'primary'} 
                fullWidth 
                className="gap-2 mt-auto"
                to={`/lesson/${lesson.id}`}
              >
                {lesson.status === 'Completed' ? 'Review Lesson' : 
                 lesson.status === 'In Progress' ? 'Continue Learning' : 'Start Lesson'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {filteredLessons.length === 0 && (
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
