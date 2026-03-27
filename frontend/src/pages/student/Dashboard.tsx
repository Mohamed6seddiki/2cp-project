import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen as BookOpenIcon,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  PlayCircle,
  Target,
  Trophy,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { getMyDashboard, type DashboardDailyChallengeDto, type DashboardDto } from '../../api/dashboardApi';

const challengeBadgeVariant = (difficulty: DashboardDailyChallengeDto['difficulty']): 'success' | 'warning' | 'danger' => {
  if (difficulty === 'Beginner') return 'success';
  if (difficulty === 'Intermediate') return 'warning';
  return 'danger';
};

const activityIconClass = (type: 'lesson' | 'general') => (type === 'lesson' ? 'text-success' : 'text-primary');

const activityIcon = (type: 'lesson' | 'general') => (type === 'lesson' ? CheckCircle2 : Code2);

const formatSubmittedTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'recently';
  }

  const deltaMs = Date.now() - parsed.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (deltaMs < minute) return 'just now';
  if (deltaMs < hour) return `${Math.max(1, Math.floor(deltaMs / minute))} min ago`;
  if (deltaMs < day) return `${Math.max(1, Math.floor(deltaMs / hour))}h ago`;
  if (deltaMs < 7 * day) return `${Math.max(1, Math.floor(deltaMs / day))}d ago`;
  return parsed.toLocaleDateString();
};

const toKey = (value: string) => value;

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyDashboard();
        setDashboard(data);
      } catch (err) {
        setDashboard(null);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const weeklyBars = useMemo(() => {
    const items = dashboard?.weeklyActivity ?? [];
    const maxMinutes = Math.max(1, ...items.map((item) => item.minutes));

    return items.map((item) => {
      const percent = Math.max(8, Math.round((item.minutes / maxMinutes) * 100));
      return {
        ...item,
        percent,
      };
    });
  }, [dashboard]);

  const practiceHours = useMemo(() => {
    const minutes = dashboard?.practiceMinutesTotal ?? 0;
    if (minutes <= 0) {
      return '0 hrs';
    }

    return `${(minutes / 60).toFixed(1)} hrs`;
  }, [dashboard]);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name ?? 'Learner'}!</h1>
          <p className="text-text-muted">Keep momentum and push your ranking higher today.</p>
        </div>
        <Button className="gap-2 shadow-glow" to="/practice">
          <Code2 size={18} /> Quick Practice
        </Button>
      </div>

      {loading && <p className="text-text-muted">Loading dashboard...</p>}
      {!loading && error && <p className="text-danger">{error}</p>}

      {!loading && !error && dashboard && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Trophy, label: 'Completed Lessons', value: `${dashboard.completedLessons}`, color: 'text-primary' },
              { icon: Flame, label: 'Current Streak', value: `${dashboard.currentStreakDays} Days`, color: 'text-danger' },
              { icon: Target, label: 'Average Score', value: `${dashboard.averageScorePercent}%`, color: 'text-success' },
              { icon: Clock, label: 'Practice Time', value: practiceHours, color: 'text-warning' },
            ].map((stat) => (
              <Card key={stat.label} className="p-5 flex items-center gap-4 hoverable">
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
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Continue Learning</h2>
                  <Link to="/lessons" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1">
                    View All <ArrowRight size={16} />
                  </Link>
                </div>

                <Card className="p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

                  {dashboard.continueLearning ? (
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="w-full md:w-32 h-24 bg-surface-hover rounded-lg border border-border flex items-center justify-center shrink-0 text-primary">
                        <BookOpenIcon strokeWidth={1.5} size={40} />
                      </div>
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <Badge variant={challengeBadgeVariant(dashboard.continueLearning.difficulty)}>{dashboard.continueLearning.difficulty}</Badge>
                          <Badge>{dashboard.continueLearning.completedExercises}/{dashboard.continueLearning.totalExercises} done</Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{dashboard.continueLearning.lessonTitle}</h3>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-text-muted">Progress</span>
                            <span className="font-medium">{dashboard.continueLearning.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-surface-hover rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${dashboard.continueLearning.progressPercent}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-auto mt-4 md:mt-0">
                        <Button fullWidth className="gap-2" to={`/lesson/${dashboard.continueLearning.lessonId}`}>
                          <PlayCircle size={18} /> Continue
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold">You are all caught up</h3>
                      <p className="text-text-muted text-sm">Great work. Pick a new lesson to continue improving.</p>
                      <Button className="gap-2" to="/lessons">
                        Browse Lessons <ArrowRight size={16} />
                      </Button>
                    </div>
                  )}
                </Card>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">Weekly Activity</h2>
                <Card className="p-6 h-64 flex flex-col justify-end gap-2 text-xs text-text-muted pb-8 border-b-0 rounded-b-none border-x-0 bg-transparent shadow-none px-0">
                  <div className="flex items-end justify-between h-full px-4 border-b border-border pb-2">
                    {weeklyBars.map((item) => (
                      <div
                        key={toKey(item.date)}
                        className="w-12 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group cursor-pointer"
                        style={{ height: `${item.percent}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-text px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-border whitespace-nowrap z-10">
                          {item.minutes} mins
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between px-6 font-medium">
                    {weeklyBars.map((item) => (
                      <span key={`${toKey(item.date)}-label`}>{item.dayLabel}</span>
                    ))}
                  </div>
                </Card>
              </section>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Target size={18} className="text-warning" /> Daily Challenge
                </h3>
                <p className="text-sm font-medium mb-3">{dashboard.dailyChallenge.title}</p>
                <div className="flex gap-2 mb-4">
                  <Badge variant={challengeBadgeVariant(dashboard.dailyChallenge.difficulty)}>{dashboard.dailyChallenge.difficulty}</Badge>
                  <Badge>{dashboard.dailyChallenge.points} pts</Badge>
                </div>
                <Button variant="ghost" className="w-full border border-border text-sm py-1.5 h-auto" to="/practice">
                  Solve Challenge
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-4">Recent Activity</h3>
                {dashboard.recentActivity.length === 0 ? (
                  <p className="text-sm text-text-muted">No activity yet. Start with a lesson or challenge.</p>
                ) : (
                  <div className="space-y-4">
                    {dashboard.recentActivity.map((activity, index) => {
                      const IconComponent = activityIcon(activity.type);

                      return (
                        <div key={`${activity.submittedAt}-${index}`} className="flex gap-3 items-start">
                          <div className={`mt-0.5 ${activityIconClass(activity.type)}`}>
                            <IconComponent size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {activity.score} pts · {formatSubmittedTime(activity.submittedAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button variant="ghost" fullWidth className="mt-4 text-xs h-auto py-2 border-t border-border rounded-none rounded-b-lg" to="/progress">
                  View All Activity
                </Button>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
