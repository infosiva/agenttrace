import { NextRequest, NextResponse } from 'next/server';
import { AI_LIMITER } from '@/lib/rateLimit';
import { generateDiagnosis } from '@/lib/ai-diagnosis';
import type { SiteStats } from '@/lib/tracker-client';

const TRACKER_API = process.env.TRACKER_API_URL || 'http://31.97.56.148:3098';
const STATS_KEY = process.env.TRACKER_STATS_KEY || 'sitestats2025';

export async function GET(req: NextRequest) {
  const limited = AI_LIMITER.check(req); if (limited) return limited
  const site = new URL(req.url).searchParams.get('site');
  if (!site) return NextResponse.json({ ok: false, error: 'site required' }, { status: 400 });

  // Fetch raw stats
  const statsRes = await fetch(
    `${TRACKER_API}/stats?key=${STATS_KEY}&site=${encodeURIComponent(site)}&days=7`,
    { next: { revalidate: 3600 } } // cache 1h — diagnosis is expensive
  );
  if (!statsRes.ok) return NextResponse.json({ ok: false, error: 'stats fetch failed' }, { status: 502 });

  const raw = await statsRes.json();

  const stats: SiteStats = {
    site,
    views: raw.pageviews?.total ?? 0,
    sessions: raw.pageviews?.uniq_sessions ?? 0,
    avgSessionSecs: raw.avg_session?.duration_s ?? 0,
    avgPages: raw.avg_session?.pages ?? 0,
    topPages: raw.top_pages ?? [],
    feedbackAvgRating: raw.feedback?.summary?.avg_rating ?? null,
    feedbackCount: raw.feedback?.summary?.total ?? 0,
    recentFeedback: raw.feedback?.recent ?? [],
    topEvents: raw.top_events ?? [],
    deviceSplit: { mobile: 0, desktop: 0, bot: 0 },
    viewsTrend: null,
  };

  const diagnosis = await generateDiagnosis(site, stats);
  return NextResponse.json({ ok: true, diagnosis });
}
