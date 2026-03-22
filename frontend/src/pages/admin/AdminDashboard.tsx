import React from 'react';
import { Bell, Clock3, Search, Users, Zap, Globe2, Signal } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const AdminDashboard = () => {
  const monthlyStats = [
    {
      title: 'Total Monthly Users',
      value: '48,291',
      hint: '+8.4% vs last month',
      icon: Users,
      accent: 'text-primary',
    },
    {
      title: 'Average DAU',
      value: '12,405',
      hint: '+2.1% daily engagement',
      icon: Signal,
      accent: 'text-tertiary',
    },
    {
      title: 'Avg Session',
      value: '24m 18s',
      hint: '−0.2% stable platform time',
      icon: Clock3,
      accent: 'text-warning',
    },
    {
      title: 'Peak Time (UTC)',
      value: '14:00',
      hint: 'Highest concurrent load period',
      icon: Zap,
      accent: 'text-primary',
    },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const heatmapRows = [
    [2, 3, 5, 6, 5, 4, 3],
    [3, 4, 6, 7, 6, 5, 4],
    [2, 4, 5, 6, 7, 6, 5],
    [3, 5, 6, 5, 4, 5, 6],
  ];

  const getHeatLevelClass = (level: number) => {
    if (level > 6) return 'bg-primary';
    if (level > 4) return 'bg-[#1BAF92]';
    if (level > 2) return 'bg-[#205E6E]';
    return 'bg-[#1A2B47]';
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Matrix</h1>
          <p className="text-sm text-text-muted">System-level monitoring for platform activity and retention.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 min-w-[240px]">
            <Search size={15} className="text-text-muted" />
            <input
              className="w-full bg-transparent text-sm text-text placeholder:text-text-muted/70 focus:outline-none"
              placeholder="Query data nodes..."
            />
          </div>

          <button title="Notifications" className="relative rounded-lg border border-border bg-surface p-2.5 text-text-muted hover:text-text transition-colors">
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>

          <div className="rounded-xl border border-border bg-surface px-3 py-2">
            <p className="text-xs text-text-muted">Admin User</p>
            <p className="text-sm font-semibold">System Root</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {monthlyStats.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="mb-4 flex items-start justify-between">
              <p className="text-xs uppercase tracking-wider text-text-muted">{item.title}</p>
              <item.icon size={16} className={item.accent} />
            </div>
            <h2 className="text-3xl font-bold leading-none">{item.value}</h2>
            <div className="mt-3 flex items-center justify-between text-xs">
              <Badge variant="success">Live</Badge>
              <span className="text-text-muted">{item.hint}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Card className="xl:col-span-3 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">User Growth Dynamics</h3>
              <p className="text-sm text-text-muted">New architect registrations over the last 12-month cycle.</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button className="rounded bg-primary/20 px-2 py-1 text-primary">1Y</button>
              <button className="rounded border border-border px-2 py-1 text-text-muted">6M</button>
              <button className="rounded border border-border px-2 py-1 text-text-muted">30D</button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/30 p-4">
            <svg viewBox="0 0 820 300" className="h-[290px] w-full">
              <defs>
                <linearGradient id="glowLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00DF9A" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#00DF9A" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#4DB6AC" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path d="M20 255 C 80 240, 100 175, 170 165 C 230 155, 250 230, 310 205 C 380 170, 410 60, 475 55 C 545 58, 560 235, 625 245 C 700 240, 715 90, 790 65" fill="none" stroke="url(#glowLine)" strokeWidth="7" strokeLinecap="round" />
              <path d="M20 255 C 80 240, 100 175, 170 165 C 230 155, 250 230, 310 205 C 380 170, 410 60, 475 55 C 545 58, 560 235, 625 245 C 700 240, 715 90, 790 65" fill="none" stroke="#00DF9A" strokeOpacity="0.12" strokeWidth="18" strokeLinecap="round" />
            </svg>

            <div className="mt-2 grid grid-cols-6 gap-2 text-center text-[11px] uppercase tracking-wide text-text-muted md:grid-cols-12">
              {months.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide">Daily Active Users</h4>
              <Badge variant="success">Live</Badge>
            </div>

            <div className="space-y-2">
              {heatmapRows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7 gap-2">
                  {row.map((level, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`h-5 rounded ${getHeatLevelClass(level)}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
              <span>Activity Level</span>
              <span className="text-primary">High</span>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">Retention Metrics</h4>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-text-muted">Day 30 Retention</span>
                  <span className="font-semibold">64.2%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-hover">
                  <div className="h-full w-[64.2%] rounded-full bg-primary" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-text-muted">Gold Upgrade Rate</span>
                  <span className="font-semibold">12.8%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-hover">
                  <div className="h-full w-[12.8%] rounded-full bg-tertiary" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { region: 'US-East-1', latency: '42ms', icon: Globe2, status: 'Optimal' },
          { region: 'EU-West-2', latency: '108ms', icon: Globe2, status: 'Stable' },
          { region: 'AP-Southeast-1', latency: '84ms', icon: Globe2, status: 'Stable' },
        ].map((region) => (
          <Card key={region.region} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <region.icon size={16} />
                <span className="text-xs uppercase tracking-wide">{region.region}</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <p className="text-lg font-bold">{region.latency} Latency</p>
            <p className="mt-1 text-xs text-text-muted">Regional node health: {region.status}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">System Core Status</span>
          <span className="text-success">Operational</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-surface-hover">
          <div className="h-full w-[92%] rounded-full bg-success" />
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
