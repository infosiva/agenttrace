import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSiteBySlug } from '@/lib/sites-registry';
import { computeHealth } from '@/lib/tracker-client';
import type { SiteStats } from '@/lib/tracker-client';
import { DiagnosisCard } from '@/components/sites/DiagnosisCard';
import { StatusBadge } from '@/components/sites/StatusBadge';

async function fetchSiteStats(trackerSite: string): Promise<SiteStats | null> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  try {
    const res = await fetch(
      `${baseUrl}/api/sites/stats?site=${encodeURIComponent(trackerSite)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      site: trackerSite,
      views: data.pageviews?.total ?? 0,
      sessions: data.pageviews?.uniq_sessions ?? 0,
      avgSessionSecs: data.avg_session?.duration_s ?? 0,
      avgPages: data.avg_session?.pages ?? 0,
      topPages: data.top_pages ?? [],
      feedbackAvgRating: data.feedback?.summary?.avg_rating ?? null,
      feedbackCount: data.feedback?.summary?.total ?? 0,
      recentFeedback: data.feedback?.recent ?? [],
      topEvents: data.top_events ?? [],
      deviceSplit: { mobile: 0, desktop: 0, bot: 0 },
      viewsTrend: null,
    };
  } catch {
    return null;
  }
}

async function fetchDiagnosis(trackerSite: string): Promise<string> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  try {
    const res = await fetch(
      `${baseUrl}/api/sites/diagnosis?site=${encodeURIComponent(trackerSite)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return 'Diagnosis unavailable.';
    const data = await res.json();
    return data.diagnosis ?? 'No diagnosis generated.';
  } catch {
    return 'Diagnosis service unreachable.';
  }
}

export default async function SiteDetailPage({ params }: { params: { slug: string } }) {
  const site = getSiteBySlug(params.slug);
  if (!site) notFound();

  const [stats, diagnosis] = await Promise.all([
    fetchSiteStats(site.trackerSite),
    fetchDiagnosis(site.trackerSite),
  ]);

  const health = computeHealth(stats);

  const fmtTime = (s: number) => s >= 60 ? `${(s / 60).toFixed(1)} min` : `${s}s`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sites" className="text-slate-500 hover:text-slate-300 text-sm">← All Projects</Link>
        <span className="text-slate-600">/</span>
        <span className="text-sky-400 font-semibold">{site.domain}</span>
        <StatusBadge status={health.status} reason={health.reason} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DiagnosisCard diagnosis={diagnosis} />

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Views', value: stats?.views.toLocaleString() ?? '—' },
              { label: 'Visitors', value: stats?.sessions.toLocaleString() ?? '—' },
              { label: 'Avg Session', value: stats ? fmtTime(stats.avgSessionSecs) : '—' },
              { label: 'Feedback', value: stats?.feedbackAvgRating ? `★ ${stats.feedbackAvgRating.toFixed(1)}` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-bold text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          {/* Top pages */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Top Pages (7d)</h3>
            {stats?.topPages.length ? stats.topPages.map(p => (
              <div key={p.path} className="flex justify-between py-2 border-b border-slate-800 last:border-0 text-sm">
                <span className="text-sky-400 font-mono">{p.path}</span>
                <span className="text-slate-300">{p.views.toLocaleString()} views</span>
              </div>
            )) : <p className="text-slate-600 text-sm">No page data</p>}
          </div>
        </div>

        <div>
          {/* Recent feedback */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-4">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Recent Feedback</h3>
            {stats?.recentFeedback.length ? stats.recentFeedback.slice(0, 5).map((f, i) => (
              <div key={i} className="bg-slate-800 rounded p-3 mb-3 last:mb-0">
                {f.rating && <div className="text-yellow-400 text-xs mb-1">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>}
                <p className="text-slate-300 text-sm">{f.message}</p>
                {f.path && <p className="text-slate-600 text-xs mt-1">{f.path}</p>}
              </div>
            )) : <p className="text-slate-600 text-sm">No feedback yet</p>}
          </div>

          {/* Top events */}
          {stats?.topEvents.length ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Top Events</h3>
              {stats.topEvents.slice(0, 8).map(e => (
                <div key={e.name} className="flex justify-between py-1.5 text-sm border-b border-slate-800 last:border-0">
                  <span className="text-slate-300">{e.name}</span>
                  <span className="text-slate-500">{e.count}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
