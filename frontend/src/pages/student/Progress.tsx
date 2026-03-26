import React, { useEffect, useMemo, useState } from 'react';
import { Target, Award, Code2, BookOpen, TrendingUp, Calendar, Zap, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { getMyProgress, type ProgressDto } from '../../api/progressApi';

const Progress = () => {
  const [progress, setProgress] = useState<ProgressDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const skillWidths: Record<number, string> = {
    15: 'w-[15%]',
    40: 'w-[40%]',
    60: 'w-[60%]',
    85: 'w-[85%]',
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyProgress();
        setProgress(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress.');
        setProgress(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const lessonExercisesCount = progress?.lessonExercises?.length ?? 0;
  const generalExercisesCount = progress?.generalExercises?.length ?? 0;
  const totalExercises = lessonExercisesCount + generalExercisesCount;
  const completedCount = useMemo(
    () => (progress?.lessonExercises ?? []).filter((x) => x.completed).length
      + (progress?.generalExercises ?? []).filter((x) => x.completed).length,
    [progress],
  );
  const accuracy = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const overallMastery = Math.min(100, Math.round((progress?.totalScore ?? 0) / 10));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learning Progress</h1>
          <p className="text-text-muted">Track your achievements and identify areas for improvement.</p>
        </div>
        <div className="bg-surface border border-border rounded-lg px-4 py-2 flex items-center gap-3">
          <TrendingUp className="text-primary" size={20} />
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Overall Mastery</p>
            <p className="text-xl font-bold">{overallMastery}%</p>
          </div>
        </div>
      </div>

      {loading && <p className="text-text-muted">Loading progress...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Lesson Exercises', value: `${lessonExercisesCount}`, total: '', color: 'text-primary', badge: 'Submitted' },
          { icon: Code2, label: 'General Exercises', value: `${generalExercisesCount}`, total: '', color: 'text-tertiary', badge: 'Submitted' },
          { icon: Target, label: 'Completion', value: `${accuracy}`, total: '%', color: 'text-success', badge: 'Completion Rate' },
          { icon: Clock, label: 'Total Score', value: `${progress?.totalScore ?? 0}`, total: 'pts', color: 'text-warning', badge: 'Current' }
        ].map((stat, i) => (
          <Card key={i} className="p-5 flex flex-col hoverable relative overflow-hidden group">
            <div className={`absolute -right-6 -bottom-6 opacity-5 group-hover:scale-125 transition-transform duration-500 ${stat.color}`}>
               <stat.icon size={100} />
            </div>
            <div className={`w-10 h-10 rounded bg-surface-hover flex items-center justify-center mb-4 ${stat.color} border border-border`}>
              <stat.icon size={20} />
            </div>
            <h3 className="text-text-muted text-sm font-medium mb-1">{stat.label}</h3>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className="text-text-muted font-medium">{stat.total}</span>
            </div>
            <Badge variant="default" className="w-fit mt-auto border-transparent">{stat.badge}</Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Heatmap & Charts */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="p-6">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><Calendar size={20} className="text-text-muted" /> Activity Heatmap</h3>
                <span className="text-sm text-text-muted">Last 3 Months</span>
             </div>
             <div className="flex gap-1 overflow-x-auto pb-4">
               {/* Generative Mock Heatmap */}
               <div className="flex gap-1">
                 {[...Array(12)].map((_, colIndex) => (
                   <div key={colIndex} className="flex flex-col gap-1">
                     {[...Array(7)].map((_, rowIndex) => {
                       // Random intensity for mock
                       const intensity = Math.random();
                       let bgClass = 'bg-surface-hover';
                       if (intensity > 0.8) bgClass = 'bg-primary border-primary';
                       else if (intensity > 0.5) bgClass = 'bg-primary/60 border-primary/60';
                       else if (intensity > 0.2) bgClass = 'bg-primary/30 border-primary/30';
                       
                       return (
                         <div 
                           key={rowIndex} 
                           className={`w-4 h-4 rounded-sm border border-transparent ${bgClass} transition-colors hover:border-text`} 
                           title={`${Math.floor(intensity * 10)} contributions`}
                         />
                       );
                     })}
                   </div>
                 ))}
               </div>
             </div>
             <div className="flex items-center justify-end gap-2 text-xs text-text-muted mt-2">
               <span>Less</span>
               <div className="flex gap-1">
                 <div className="w-3 h-3 rounded-sm bg-surface-hover"></div>
                 <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
                 <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
                 <div className="w-3 h-3 rounded-sm bg-primary"></div>
               </div>
               <span>More</span>
             </div>
           </Card>

           <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Knowledge Areas</h3>
              <div className="space-y-6">
                {[
                  { name: 'Data Structures', progress: 85, color: 'bg-primary' },
                  { name: 'Sorting & Searching', progress: 60, color: 'bg-tertiary' },
                  { name: 'Dynamic Programming', progress: 15, color: 'bg-warning' },
                  { name: 'Graph Theory', progress: 40, color: 'bg-danger' },
                ].map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-text-muted">{skill.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-hover rounded-full h-2">
                      <div className={`h-2 rounded-full ${skill.color} ${skillWidths[skill.progress] ?? 'w-0'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
           </Card>
        </div>

        {/* Milestones & Badges */}
        <div className="space-y-6">
           <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award size={20} className="text-warning" /> Milestones
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-border">
                 {[
                   { title: 'First Submission', desc: 'Submit your first exercise', done: totalExercises >= 1 },
                   { title: 'Consistent Solver', desc: 'Submit 10 exercises', done: totalExercises >= 10 },
                   { title: 'Point Collector', desc: 'Reach 100 total points', done: (progress?.totalScore ?? 0) >= 100, active: (progress?.totalScore ?? 0) < 100 },
                   { title: 'Mastery Rising', desc: 'Reach 50% overall mastery', done: overallMastery >= 50 },
                 ].map((ms, i) => (
                   <div key={i} className="relative flex items-start gap-4 pb-4">
                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${ms.done ? 'bg-warning border-warning text-surface' : ms.active ? 'bg-background border-warning' : 'bg-surface border-border text-transparent'}`}>
                        <Zap size={12} className={ms.active && !ms.done ? 'text-warning fill-warning' : ''} />
                     </div>
                     <div>
                       <p className={`font-bold text-sm ${ms.done ? 'text-text' : ms.active ? 'text-warning' : 'text-text-muted'}`}>{ms.title}</p>
                       <p className="text-xs text-text-muted mt-1">{ms.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Progress;
