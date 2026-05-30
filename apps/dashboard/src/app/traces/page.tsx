import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db, projects, traces } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function TracesPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/traces');

  const params = await searchParams;
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt));

  if (userProjects.length === 0) {
    return (
      <main className="min-h-screen bg-[#020617] text-slate-100 font-mono flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No projects yet.</p>
          <Link href="/settings" className="text-green-400 hover:text-green-300 underline">Create one →</Link>
        </div>
      </main>
    );
  }

  const activeProject = (params.project && userProjects.find(p => p.id === params.project)) || userProjects[0];

  const rows = await db
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
    .limit(100);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-xs text-green-600 uppercase tracking-widest mb-2">// traces</p>
          <h1 className="text-3xl font-bold text-white">Trace explorer</h1>
          <p className="text-sm text-slate-400 mt-1">
            Project: <span className="text-green-400">{activeProject.name}</span>
          </p>
        </header>

        <div className="border border-slate-800 rounded-lg bg-slate-950/60 overflow-hidden">
          {rows.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-400 mb-4">No traces in this project yet.</p>
              <Link href="/docs" className="text-xs text-green-400 hover:text-green-300 underline">Install the SDK →</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-black/40 border-b border-slate-800">
                <tr>
                  <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Name</th>
                  <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Status</th>
                  <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Duration</th>
                  <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Tokens</th>
                  <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Cost</th>
                  <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Started</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const isLive = Date.now() - r.startedAt.getTime() < 60_000;
                  return (
                  <tr key={r.id} className="border-b border-slate-900 last:border-0 hover:bg-slate-900/50">
                    <td className="px-4 py-3 text-slate-200">
                      <span className="flex items-center gap-2">
                        {r.name}
                        {isLive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            LIVE
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                        r.status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        r.status === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{r.durationMs ? `${r.durationMs}ms` : '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{r.totalTokens ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{r.totalCost ? `$${r.totalCost.toFixed(4)}` : '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.startedAt.toLocaleString()}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
