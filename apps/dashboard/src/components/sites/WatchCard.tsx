import Link from 'next/link';
import type { SiteConfig } from '@/lib/sites-registry';
import type { SiteStats, SiteHealth } from '@/lib/tracker-client';

interface WatchCardProps {
  site: SiteConfig;
  stats: SiteStats;
  health: SiteHealth;
}

export function WatchCard({ site, stats, health }: WatchCardProps) {
  return (
    <Link href={`/sites/${site.slug}`}>
      <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-4 hover:border-yellow-600 transition cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <span className="text-yellow-200 font-semibold text-sm">{site.domain}</span>
        </div>
        <p className="text-2xl font-bold text-slate-100">{stats.views.toLocaleString()}</p>
        <p className="text-xs text-slate-400">{stats.sessions} visitors</p>
        <p className="text-xs text-orange-400 mt-1">{health.reason}</p>
      </div>
    </Link>
  );
}
