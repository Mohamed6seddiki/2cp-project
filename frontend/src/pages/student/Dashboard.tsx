import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, Code2, Trophy, Flame, Target,
  ArrowRight, Clock, CheckCircle2, BookOpen as BookOpenIcon
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const weeklyHeights = [
    'h-[40%]',
    'h-[70%]',
    'h-[45%]',
    'h-[90%]',
    'h-[60%]',
    'h-[20%]',
    'h-[80%]',
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name ?? 'Learner'}! 👋</h1>
          <p className="text-text-muted">You're making great progress. Ready to conquer more algorithms?</p>
        </div>
        <Button className="gap-2 shadow-glow" to="/practice">
          <Code2 size={18} /> Quick Practice
        </Button>
      </div>

      {/* Progress Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Trophy, label: 'Completed Lessons', value: '12', color: 'text-primary' },
          { icon: Flame, label: 'Current Streak', value: '5 Days', color: 'text-danger' },
          { icon: Target, label: 'Average Score', value: '92%', color: 'text-success' },
          { icon: Clock, label: 'Practice Time', value: '14 hrs', color: 'text-warning' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 flex items-center gap-4 hoverable">
            <div className={`w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center ${stat.color} border border-border`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area: Continue & Recommended */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Learning */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Continue Learning</h2>
              <Link to="/lessons" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            <Card className="p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-full md:w-32 h-24 bg-surface-hover rounded-lg border border-border flex items-center justify-center shrink-0 text-primary">
                  <BookOpenIcon strokeWidth={1.5} size={40} />
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="primary">Intermediate</Badge>
                    <Badge>Graph Theory</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dijkstra's Shortest Path Algorithm</h3>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-muted">Progress</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="w-full bg-surface-hover rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[65%]"></div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto mt-4 md:mt-0">
                  <Button fullWidth className="gap-2" to="/lesson/dijkstra">
                    <PlayCircle size={18} /> Continue
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Activity / visual chart placeholder */}
          <section>
             <h2 className="text-xl font-bold mb-4">Weekly Activity</h2>
             <Card className="p-6 h-64 flex flex-col justify-end gap-2 text-xs text-text-muted pb-8 border-b-0 rounded-b-none border-x-0 bg-transparent shadow-none px-0">
                <div className="flex items-end justify-between h-full px-4 border-b border-border pb-2">
                   {[40, 70, 45, 90, 60, 20, 80].map((h, i) => (
                     <div key={i} className={`w-12 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group cursor-pointer ${weeklyHeights[i]}`}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-text px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-border whitespace-nowrap z-10">
                            {h} mins
                         </div>
                      </div>
                   ))}
                </div>
                <div className="flex justify-between px-6 font-medium">
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
             </Card>
          </section>

        </div>

        {/* Sidebar Area: AI, Mini Challenge, Activity */}
        <div className="space-y-6">
          
          {/* Quick AI Help 
            <Card className="p-6 bg-gradient-to-b from-surface to-surface-hover border-t-2 border-t-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-tertiary/20 rounded-lg text-tertiary">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold">Need Help?</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Stuck on a concept or getting an error in your code? Our AI is ready to explain in simple terms.
            </p>
            <Button variant="secondary" fullWidth className="gap-2 hover:border-tertiary hover:text-tertiary" to="/assistant">
              <MessageSquareIcon size={16} /> Ask AI Assistant
            </Button>
          </Card>
          
          
          
          
          */}
          

          {/* Mini Challenge */}
          <Card className="p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Target size={18} className="text-warning" /> Daily Challenge
            </h3>
            <p className="text-sm font-medium mb-3">Reverse a Linked List in O(N)</p>
            <div className="flex gap-2 mb-4">
              <Badge variant="warning">Arrays & Strings</Badge>
              <Badge>+50 xp</Badge>
            </div>
            <Button variant="ghost" className="w-full border border-border text-sm py-1.5 h-auto" to="/practice">Solve Challenge</Button>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { icon: CheckCircle2, title: 'Completed Quiz: Big O', time: '2 hours ago', color: 'text-success' },
                { icon: Code2, title: 'Practiced: Binary Search', time: 'Yesterday', color: 'text-primary' },
                { icon: Trophy, title: 'Earned Badge: Fast Learner', time: '2 days ago', color: 'text-warning' }
              ].map((act, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`mt-0.5 ${act.color}`}><act.icon size={16} /></div>
                  <div>
                    <p className="text-sm font-medium">{act.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" fullWidth className="mt-4 text-xs h-auto py-2 border-t border-border rounded-none rounded-b-lg" to="/progress">
              View All Activity
            </Button>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
