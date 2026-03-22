import React from 'react';
import { Crown, Medal, Trophy, TrendingUp, Flame, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const leaderboardRows = [
  { name: 'Nina Algo', score: 12840, streak: 21, solved: 214, trend: '+6%', me: false },
  { name: 'Yassine Graph', score: 12120, streak: 16, solved: 201, trend: '+4%', me: false },
  { name: 'Alex Student', score: 11895, streak: 12, solved: 194, trend: '+3%', me: true },
  { name: 'Sara DP', score: 11350, streak: 9, solved: 188, trend: '+2%', me: false },
  { name: 'Riad Queue', score: 10890, streak: 7, solved: 174, trend: '+1%', me: false },
  { name: 'Maya Trees', score: 10340, streak: 11, solved: 169, trend: '+2%', me: false },
  { name: 'Omar Sort', score: 9960, streak: 5, solved: 155, trend: '+1%', me: false },
  { name: 'Lina Search', score: 9450, streak: 6, solved: 149, trend: '+2%', me: false },
];

const rankIcon = (index: number) => {
  if (index === 0) return <Crown size={18} className="text-warning" />;
  if (index === 1) return <Medal size={18} className="text-text" />;
  if (index === 2) return <Trophy size={18} className="text-tertiary" />;
  return <span className="text-sm font-semibold text-text-muted">#{index + 1}</span>;
};

const Leaderboard = () => {
  const myRow = leaderboardRows.find((row) => row.me);
  const myRank = leaderboardRows.findIndex((row) => row.me) + 1;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-text-muted">Track top performers and your current ranking across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="px-3 py-1">Weekly Season</Badge>
          <Badge variant="success" className="px-3 py-1">Live</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2 text-warning">
            <Crown size={18} />
            <span className="text-sm font-semibold">Your Rank</span>
          </div>
          <p className="text-3xl font-bold">#{myRank}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2 text-success">
            <Flame size={18} />
            <span className="text-sm font-semibold">Your Streak</span>
          </div>
          <p className="text-3xl font-bold">{myRow?.streak ?? 0} days</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Star size={18} />
            <span className="text-sm font-semibold">Your Score</span>
          </div>
          <p className="text-3xl font-bold">{myRow?.score.toLocaleString() ?? 0}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[760px]">
            <thead>
              <tr className="bg-surface-hover border-b border-border text-text-muted">
                <th className="text-left p-4 font-medium">Rank</th>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-right p-4 font-medium">Score</th>
                <th className="text-right p-4 font-medium">Solved</th>
                <th className="text-right p-4 font-medium">Streak</th>
                <th className="text-right p-4 font-medium">Trend</th>
              </tr>
            </thead>

            <tbody>
              {leaderboardRows.map((row, index) => (
                <tr
                  key={row.name}
                  className={`border-b border-border last:border-0 ${row.me ? 'bg-primary/5' : 'hover:bg-surface-hover/40'} transition-colors`}
                >
                  <td className="p-4">{rankIcon(index)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-primary">
                        {row.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{row.name}</span>
                        {row.me && <Badge variant="primary">You</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold">{row.score.toLocaleString()}</td>
                  <td className="p-4 text-right text-text-muted">{row.solved}</td>
                  <td className="p-4 text-right text-text-muted">{row.streak}d</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1 text-success font-semibold">
                      <TrendingUp size={14} />
                      {row.trend}
                    </span>
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

export default Leaderboard;
