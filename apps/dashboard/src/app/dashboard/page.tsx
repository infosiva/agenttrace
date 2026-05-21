import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db, projects, traces } from '@/lib/db';
import { eq, desc, count, sum, avg, sql } from 'drizzle-orm';
import { Activity, Clock, DollarSign, TrendingUp, AlertCircle, FolderPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard');

  const params = await searchParams;
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt));

  if (userProjects.length === 0) return <NoProjectsState />;

  const activeProject = (params.project && userProjects.find(p => p.id === params.project)) || userProjects[0];

  const [stats] = await db
    .select({
      total: count(traces.id),
      errors: sql<number>`count(*) filter (where ${traces.status} = 'error')`.mapWith(Number),
      avgDuration: avg(traces.durationMs).mapWith(Number),
      totalCost: sum(traces.totalCost).mapWith(Number),
      totalTokens: sum(traces.totalTokens).mapWith(Number),
    })
    .from(traces)
    .where(eq(traces.projectId, activeProject.id));

  const recent = await db
    .select({
      id: traces.id,
      name: traces.name,
      status: traces.status,
      durationMs: traces.durationMs,
      totalCost: traces.totalCost,
      totalTokens: traces.totalTokens,
      startedAt: traces.startedAt,
    })
    .from(traces)
    .where(eq(traces.projectId, activeProject.id))
    .orderBy(desc(traces.startedAt))
    .limit(10);

  const errorRate = stats.total > 0 ? ((stats.errors / stats.total) * 100).toFixed(1) : '0.0';

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-green-600 uppercase tracking-widest mb-2">// project: {activeProject.slug}</p>
            <h1 className="text-3xl font-bold text-white">{activeProject.name}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Logged in as <span className="text-green-400">{session.user.email}</span>
            </p>
          </div>
          {userProjects.length > 1 && (
            <select
              defaultValue={activeProject.id}
              className="bg-slate-950 border border-slate-700 text-sm text-slate-200 px-3 py-2 rounded"
              onChange={e => { window.location.href = `/dashboard?project=${e.target.value}`; }}
            >
              {userProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Metric icon={Activity} label="Total traces" value={stats.total.toLocaleString()} accent="text-green-400" />
          <Metric icon={Clock} label="Avg duration" value={stats.avgDuration ? `${Math.round(stats.avgDuration)}ms` : '—'} accent="text-cyan-400" />
          <Metric icon={DollarSign} label="Total cost" value={stats.totalCost ? `$${stats.totalCost.toFixed(3)}` : '$0'} accent="text-yellow-400" />
          <Metric icon={AlertCircle} label="Error rate" value={`${errorRate}%`} accent={stats.errors > 0 ? 'text-red-400' : 'text-green-400'} />
        </section>

        <section className="border border-slate-800 rounded-lg bg-slate-950/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Recent traces</h2>
            <Link href="/traces" className="text-xs text-green-400 hover:text-green-300">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <FirstTraceEmptyState />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-black/40 border-b border-slate-800">
                <tr>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2 font-semibold">Name</th>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2 font-semibold">Status</th>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2 font-semibold">Duration</th>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2 font-semibold">Tokens</th>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2 font-semibold">Cost</th>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(t => (
                  <tr key={t.id} className="border-b border-slate-900 last:border-0">
                    <td className="px-4 py-3 text-slate-200">{t.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-slate-400">{t.durationMs ? `${t.durationMs}ms` : '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{t.totalTokens ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{t.totalCost ? `$${t.totalCost.toFixed(4)}` : '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{relativeTime(t.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: typeof Activity; label: string; value: string; accent: string }) {
  return (
    <div className="border border-slate-800 bg-slate-950/60 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 uppercase tracking-widest">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-green-500/10 text-green-400 border-green-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    running: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status] ?? styles.running}`}>
      {status}
    </span>
  );
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NoProjectsState() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30">
          <FolderPlus className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to AgentLogs</h1>
          <p className="text-sm text-slate-400">Create your first project to start tracing AI agents.</p>
        </div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold text-sm px-5 py-2.5 rounded"
        >
          Create project →
        </Link>
      </div>
    </main>
  );
}

function FirstTraceEmptyState() {
  return (
    <div className="p-12 text-center">
      <TrendingUp className="w-8 h-8 text-slate-700 mx-auto mb-3" />
      <p className="text-sm text-slate-400 mb-2">No traces yet.</p>
      <p className="text-xs text-slate-500 mb-6">Install the SDK and send your first trace.</p>
      <Link href="/docs" className="text-xs text-green-400 hover:text-green-300 underline">View quickstart →</Link>
    </div>
  );
}
