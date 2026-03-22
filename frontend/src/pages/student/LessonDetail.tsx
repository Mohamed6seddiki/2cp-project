import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Play, MessageSquare, ChevronLeft, CheckCircle2, Bookmark, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const LessonDetail = () => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { id } = useParams();

  const lessonById: Record<string, { title: string; level: 'Beginner' | 'Intermediate' | 'Advanced'; readTime: string }> = {
    intro: { title: 'Introduction to Algorithms', level: 'Beginner', readTime: '10 min read' },
    'big-o': { title: 'Big O Notation', level: 'Beginner', readTime: '15 min read' },
    'arrays-strings': { title: 'Arrays & Strings', level: 'Beginner', readTime: '20 min read' },
    'binary-search': { title: 'Binary Search', level: 'Intermediate', readTime: '25 min read' },
    'two-pointers': { title: 'Two Pointers Technique', level: 'Intermediate', readTime: '30 min read' },
    'dynamic-programming': { title: 'Dynamic Programming', level: 'Advanced', readTime: '45 min read' },
    dijkstra: { title: "Dijkstra's Shortest Path Algorithm", level: 'Intermediate', readTime: '25 min read' },
  };
  const lesson = lessonById[id ?? ''] ?? lessonById.dijkstra;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 relative">
      
      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        
        {/* Breadcrumb & Header */}
        <div>
          <Link to="/lessons" className="text-sm font-medium text-text-muted hover:text-text flex items-center gap-1 mb-4 transition-colors">
            <ChevronLeft size={16} /> Back to Lessons
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{lesson.title}</h1>
            <Button 
              variant="ghost" 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={isBookmarked ? 'text-primary hover:text-primary-hover bg-primary/10' : ''}
              aria-label="Bookmark lesson"
            >
              <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="primary">{lesson.level}</Badge>
            <span className="text-text-muted flex items-center gap-1.5"><CheckCircle2 size={16} className="text-success" /> Prerequisites: Arrays & Lists</span>
            <span className="text-text-muted">• {lesson.readTime}</span>
          </div>
        </div>

        {/* Lesson Theory Content */}
        <div className="prose prose-invert prose-headings:text-text-heading prose-a:text-primary prose-img:rounded-xl max-w-none text-text leading-relaxed">
          <p className="text-lg text-text-muted">
            Graphs are fundamental structures used to model pairwise relations between objects. From social networks to routing algorithms in maps, graphs are everywhere in computer science.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 border-b border-border pb-2">What is a Graph?</h2>
          <p>
            A graph <code>G</code> is simply a set of <strong>Vertices</strong> (or nodes) <code>V</code> and a set of <strong>Edges</strong> <code>E</code> that connect these vertices.
          </p>

          <Card className="p-6 my-8 bg-surface-hover/50 border-primary/20 flex flex-col items-center justify-center py-12">
            <div className="text-text-muted flex items-center justify-center font-mono opacity-50 space-x-2 w-full max-w-md bg-background py-8 rounded border border-border">
              <span>(A)</span><span className="px-4 text-primary">----</span><span>(B)</span>
            </div>
            <p className="text-sm text-text-muted mt-4 text-center italic">Figure 1. A simple undirected graph with nodes A and B connected by an edge.</p>
          </Card>

          <h3 className="text-xl font-bold mt-8 mb-3">Key Terminology</h3>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-4">
              <div className="bg-primary/20 text-primary rounded w-8 h-8 flex items-center justify-center mt-1 shrink-0 font-bold border border-primary/40">1</div>
              <div>
                <strong>Directed vs Undirected:</strong> If edges have a direction (like a one-way street), it's a directed graph. Otherwise, it's undirected.
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-primary/20 text-primary rounded w-8 h-8 flex items-center justify-center mt-1 shrink-0 font-bold border border-primary/40">2</div>
              <div>
                <strong>Weighted vs Unweighted:</strong> If edges have a cost or distance associated with them (like hours of travel between cities), the graph is weighted.
              </div>
            </li>
          </ul>

          <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden my-8">
            <div className="absolute top-0 left-0 w-1 h-full bg-tertiary"></div>
            <h4 className="font-bold text-lg mb-2 text-tertiary flex items-center gap-2">
              <Sparkles size={18} /> Important concept
            </h4>
            <p className="text-text-muted m-0">
              When storing graphs in memory, we typically use either an Adjacency Matrix (a 2D array) or an Adjacency List (an array of lists). For sparse graphs, Adjacency Lists save massive amounts of memory!
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 border-b border-border pb-2">Try it out</h2>
          <p>
            Before we move on to Graph Traversals (BFS and DFS), let's implement a simple Adjacency List using MyAlgo in the practice workspace.
          </p>
        </div>

        {/* Action Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="ghost" className="gap-2">
            Mark as Complete <CheckCircle2 size={18} />
          </Button>
          <Button size="lg" className="px-8 font-bold gap-2" to="/practice">
            Start Practice Exercise <Play size={18} />
          </Button>
        </div>

      </div>

      {/* Right Sidebar Utility Panel */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        
        <Card className="p-6 sticky top-24">
          <h3 className="font-bold mb-4">Lesson Progress</h3>
          <div className="w-full bg-surface-hover rounded-full h-2 mb-2">
            <div className="bg-primary h-2 rounded-full w-[60%]"></div>
          </div>
          <p className="text-sm text-text-muted text-right mb-6">60% Completed</p>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
             {/* Simple timeline for lesson sections */}
             {[
               { title: 'What is a Graph?', active: false, done: true },
               { title: 'Graph Types', active: false, done: true },
               { title: 'Representation', active: true, done: false },
               { title: 'Implementation', active: false, done: false },
             ].map((section, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${section.done ? 'bg-primary border-primary' : section.active ? 'bg-background border-primary' : 'bg-surface border-border'} text-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                     {section.done && <CheckCircle2 size={12} className="text-secondary" />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] text-sm ${section.active ? 'font-bold text-primary' : section.done ? 'text-text' : 'text-text-muted'}`}>
                     {section.title}
                  </div>
                </div>
             ))}
          </div>

          <hr className="border-border my-6" />

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 text-primary/20 group-hover:scale-110 transition-transform"><MessageSquare size={64} /></div>
            <h4 className="font-bold text-primary mb-1 relative z-10 flex items-center gap-2"><Sparkles size={16}/> Contextual AI Help</h4>
            <p className="text-xs text-text-muted relative z-10">Confused about directed vs undirected graphs? Use the Open Chat button to ask the AI.</p>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default LessonDetail;
