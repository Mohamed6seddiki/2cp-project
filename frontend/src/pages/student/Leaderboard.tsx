import { useEffect, useMemo, useState } from 'react';
import { Crown, Flame, Medal, Star, Trophy } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { getLeaderboard, type LeaderboardEntryDto } from '../../api/leaderboardApi';

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown size={18} className="text-warning" />;
  if (rank === 2) return <Medal size={18} className="text-text" />;
  if (rank === 3) return <Trophy size={18} className="text-tertiary" />;
  return <span className="text-sm font-semibold text-text-muted">#{rank}</span>;
};

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([]);
  const [me, setMe] = useState<LeaderboardEntryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getLeaderboard();
        setEntries(data.entries);
        setMe(data.me ?? null);
      } catch (err) {
        setEntries([]);
        setMe(null);
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const topEntry = useMemo(() => entries[0] ?? null, [entries]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-text-muted">See top learners and track your current ranking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="px-3 py-1">Live Rankings</Badge>
          <Badge variant="success" className="px-3 py-1">Updated</Badge>
        </div>
      </div>

      {loading && <p className="text-text-muted">Loading leaderboard...</p>}
      {!loading && error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2 text-warning">
                <Crown size={18} />
                <span className="text-sm font-semibold">Your Rank</span>
              </div>
              <p className="text-3xl font-bold">#{me?.rank ?? '-'}</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2 text-success">
                <Flame size={18} />
                <span className="text-sm font-semibold">Your Streak</span>
              </div>
              <p className="text-3xl font-bold">{me?.streakDays ?? 0} days</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2 text-primary">
                <Star size={18} />
                <span className="text-sm font-semibold">Your Score</span>
              </div>
              <p className="text-3xl font-bold">{(me?.totalScore ?? 0).toLocaleString()}</p>
            </Card>
          </div>

          {topEntry && (
            <Card className="p-5 border-warning/30 bg-warning/5">
              <p className="text-sm text-text-muted">Top learner right now</p>
              <p className="text-lg font-bold mt-1">#{topEntry.rank} {topEntry.username}</p>
              <p className="text-sm text-text-muted mt-1">{topEntry.totalScore.toLocaleString()} pts · {topEntry.solvedCount} solved</p>
            </Card>
          )}

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
                  </tr>
                </thead>

                <tbody>
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-text-muted">No leaderboard data yet.</td>
                    </tr>
                  )}

                  {entries.map((row) => (
                    <tr
                      key={row.studentId}
                      className={`border-b border-border last:border-0 ${row.isCurrentUser ? 'bg-primary/5' : 'hover:bg-surface-hover/40'} transition-colors`}
                    >
                      <td className="p-4">{rankIcon(row.rank)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-primary">
                            {row.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{row.username}</span>
                            {row.isCurrentUser && <Badge variant="primary">You</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold">{row.totalScore.toLocaleString()}</td>
                      <td className="p-4 text-right text-text-muted">{row.solvedCount}</td>
                      <td className="p-4 text-right text-text-muted">{row.streakDays}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
