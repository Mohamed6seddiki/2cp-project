import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const ManageLessons = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const lessons = [
    { id: 1, title: 'Introduction to Algorithms', category: 'Basics', difficulty: 'Beginner', status: 'Published', views: '12.4k' },
    { id: 2, title: 'Big O Notation', category: 'Complexity', difficulty: 'Beginner', status: 'Published', views: '10.2k' },
    { id: 3, title: 'Binary Search', category: 'Searching', difficulty: 'Intermediate', status: 'Published', views: '8.1k' },
    { id: 4, title: 'Dijkstra\'s Algorithm', category: 'Graphs', difficulty: 'Advanced', status: 'Draft', views: '-' },
    { id: 5, title: 'Dynamic Programming intro', category: 'Advanced', difficulty: 'Advanced', status: 'Review', views: '-' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Lessons</h1>
          <p className="text-text-muted">Create, edit, and publish platform content.</p>
        </div>
        <Button className="gap-2 shrink-0 shadow-glow"><Plus size={18} /> Create Lesson</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border bg-surface flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-72">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
               <Search size={18} />
             </div>
             <Input 
               placeholder="Search lessons by title..." 
               className="pl-10 h-10 w-full"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="px-3 gap-2">
              <Filter size={18} /> Filter
            </Button>
            <Button variant="secondary" className="px-3">
              Bulk Actions
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-hover text-text-muted text-sm border-b border-border">
                <th className="p-4 font-medium w-12"><input title="Select all lessons" type="checkbox" className="rounded border-border focus:ring-primary/50 text-primary bg-background" /></th>
                <th className="p-4 font-medium">Title & Category</th>
                <th className="p-4 font-medium">Difficulty</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Views</th>
                <th className="p-4 font-medium text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-border hover:bg-surface-hover/50 transition-colors last:border-0 group">
                   <td className="p-4"><input title={`Select lesson ${lesson.title}`} type="checkbox" className="rounded border-border focus:ring-primary/50 text-primary bg-background" /></td>
                   <td className="p-4">
                     <div className="font-bold text-text group-hover:text-primary transition-colors cursor-pointer">{lesson.title}</div>
                     <div className="text-xs text-text-muted mt-1">{lesson.category}</div>
                   </td>
                   <td className="p-4">
                     <Badge variant={lesson.difficulty === 'Beginner' ? 'success' : lesson.difficulty === 'Intermediate' ? 'warning' : 'danger'}>
                       {lesson.difficulty}
                     </Badge>
                   </td>
                   <td className="p-4">
                     <Badge variant={lesson.status === 'Published' ? 'primary' : lesson.status === 'Draft' ? 'default' : 'warning'}>
                       {lesson.status}
                     </Badge>
                   </td>
                   <td className="p-4 text-right text-text-muted">{lesson.views}</td>
                   <td className="p-4 font-medium">
                     <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                       <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Preview"><Eye size={16} /></button>
                       <button className="p-1.5 text-text-muted hover:text-tertiary hover:bg-tertiary/10 rounded transition-colors" title="Edit"><Edit size={16} /></button>
                       <button className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted bg-surface">
           <span>Showing 1 to 5 of 64 entries</span>
           <div className="flex gap-1">
             <Button variant="ghost" size="sm" disabled>Previous</Button>
             <Button variant="primary" size="sm" className="px-3">1</Button>
             <Button variant="ghost" size="sm" className="px-3">2</Button>
             <Button variant="ghost" size="sm" className="px-3">3</Button>
             <span className="px-2 self-center">...</span>
             <Button variant="ghost" size="sm">Next</Button>
           </div>
        </div>
      </Card>
    </div>
  );
};

export default ManageLessons;
