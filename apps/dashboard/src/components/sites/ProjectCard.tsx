import Link from 'next/link';
import type { SiteConfig } from '@/lib/sites-registry';
import type { SiteStats } from '@/lib/tracker-client';

interface ProjectCardProps {
  site: SiteConfig;
  stats: SiteStats;
}

function trendColor(trend: number | null) {
  if (trend === null) return 'text-slate-500';
  if (trend > 0) return 'text-green-400';
  return 'text-red-400';
}

function trendLabel(trend: number | null) {
  if (trend === null) return '';
  return `${trend > 0 ? '+' : ''}${trend.toFixed(0)}%`;
}

export function ProjectCard({ site, stats }: ProjectCardProps) {
  return (
    <Link href={`/sites/${site.slug}`}>
      <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-4 hover:border-green-700 transition cursor-pointer flex justify-between items-center">
        <div>
          <p className="text-green-300 font-semibold text-sm">{site.domain}</p>
          <p className="text-slate-400 text-xs mt-0.5">{stats.sessions} visitors</p>
        </div>
        <div className="text-right">
          <p className="text-slate-100 font-bold">{stats.views.toLocaleString()}</p>
          <p className={`text-xs ${trendColor(stats.viewsTrend)}`}>{trendLabel(stats.viewsTrend)}</p>
        </div>
      </div>
    </Link>
  );
}
