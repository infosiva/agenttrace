// src/app/sites/page.tsx
import { SITES } from '@/lib/sites-registry';
import { computeHealth } from '@/lib/tracker-client';
import type { SiteStats } from '@/lib/tracker-client';
import { HeroMetrics } from '@/components/sites/HeroMetrics';
import { AttentionCard } from '@/components/sites/AttentionCard';
import { WatchCard } from '@/components/sites/WatchCard';
import { ProjectCard } from '@/components/sites/ProjectCard';

async function fetchAllStats(): Promise<Record<string, SiteStats | null>> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/sites/stats`, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    const data = await res.json();

    // Build per-site map from by_site array
    const map: Record<string, SiteStats | null> = {};
    for (const row of (data.by_site ?? [])) {
      map[row.site] = {
        site: row.site,
        views: row.views,
        sessions: row.sessions,
        avgSessionSecs: 0,
        avgPages: 0,
        topPages: [],
        feedbackAvgRating: null,
        feedbackCount: 0,
        recentFeedback: [],
        topEvents: [],
        deviceSplit: { mobile: 0, desktop: 0, bot: 0 },
        viewsTrend: null,
      };
    }
    return map;
  } catch {
    return {};
  }
}

export default async function SitesPage() {
  const statsMap = await fetchAllStats();

  const sitesWithHealth = SITES.map(site => {
    const stats = statsMap[site.trackerSite] ?? null;
    const health = computeHealth(stats);
    return { site, stats, health };
  });

  const red    = sitesWithHealth.filter(s => s.health.status === 'red' || s.health.status === 'unknown');
  const yellow = sitesWithHealth.filter(s => s.health.status === 'yellow');
  const green  = sitesWithHealth.filter(s => s.health.status === 'green').sort((a, b) => (b.stats?.views ?? 0) - (a.stats?.views ?? 0));

  const totalViews    = sitesWithHealth.reduce((sum, s) => sum + (s.stats?.views ?? 0), 0);
  const totalVisitors = sitesWithHealth.reduce((sum, s) => sum + (s.stats?.sessions ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Portfolio Monitor</h1>
      <p className="text-slate-400 text-sm mb-6">All {SITES.length} projects · 7-day window · auto-refreshes every 5 min</p>

      <HeroMetrics
        totalViews={totalViews}
        totalVisitors={totalVisitors}
        redCount={red.length}
        greenCount={green.length}
      />

      {red.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">🔴 Needs Attention ({red.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {red.map(({ site, stats, health }) => (
              <AttentionCard key={site.slug} site={site} health={health} views={stats?.views ?? 0} />
            ))}
          </div>
        </section>
      )}

      {yellow.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">🟡 Watch ({yellow.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {yellow.map(({ site, stats, health }) => (
              stats && <WatchCard key={site.slug} site={site} stats={stats} health={health} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">🟢 Healthy ({green.length}) — sorted by traffic</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {green.map(({ site, stats }) => (
            stats && <ProjectCard key={site.slug} site={site} stats={stats} />
          ))}
        </div>
      </section>
    </div>
  );
}
