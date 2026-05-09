import Link from 'next/link';
import type { SiteConfig } from '@/lib/sites-registry';
import type { SiteHealth } from '@/lib/tracker-client';

interface AttentionCardProps {
  site: SiteConfig;
  health: SiteHealth;
  views: number;
}

export function AttentionCard({ site, health, views }: AttentionCardProps) {
  return (
    <Link href={`/sites/${site.slug}`}>
      <div className="bg-red-950 border border-red-800 rounded-lg p-4 hover:border-red-600 transition cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <span className="text-red-300 font-semibold text-sm">{site.domain}</span>
          <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded">
            {views === 0 ? 'ZERO TRAFFIC' : health.reason.toUpperCase()}
          </span>
        </div>
        <p className="text-slate-500 text-xs">{health.reason}</p>
        {views > 0 && <p className="text-red-400 font-bold mt-2">{views.toLocaleString()} views</p>}
        {health.status === 'unknown' && (
          <a
            href={`/api/sites/snippet?site=${site.slug}`}
            target="_blank"
            className="text-xs text-blue-400 hover:underline mt-2 inline-block"
            onClick={e => e.stopPropagation()}
          >
            Copy tracker snippet →
          </a>
        )}
      </div>
    </Link>
  );
}
