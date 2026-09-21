import { NextRequest, NextResponse } from 'next/server';
import { API_LIMITER } from '@/lib/rateLimit';

const TRACKER_API = process.env.TRACKER_API_URL || 'http://31.97.56.148:3098';
const STATS_KEY = process.env.TRACKER_STATS_KEY;

export async function GET(req: NextRequest) {
  const limited = API_LIMITER.check(req); if (limited) return limited
  if (!STATS_KEY) return NextResponse.json({ ok: false, error: 'tracker not configured' }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const site = searchParams.get('site') || '';
  const days = searchParams.get('days') || '7';

  const params = new URLSearchParams({ key: STATS_KEY, days });
  if (site) params.set('site', site);

  try {
    const res = await fetch(`${TRACKER_API}/stats?${params}`, {
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: 'tracker-api error' }, { status: 502 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'tracker-api unreachable' }, { status: 503 });
  }
}
