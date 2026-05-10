import { NextRequest, NextResponse } from 'next/server';
import { SITES } from '@/lib/sites-registry';

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('site');
  const site = SITES.find(s => s.slug === slug);
  if (!site) return NextResponse.json({ ok: false, error: 'site not found' }, { status: 404 });

  const snippet = `<script>
// tracker-api analytics — auto-installed by agentlogs.app
(function() {
  const SITE = '${site.trackerSite}';
  const API  = 'http://31.97.56.148:3098';
  let sid = sessionStorage.getItem('_sid');
  if (!sid) { sid = Math.random().toString(36).slice(2); sessionStorage.setItem('_sid', sid); }
  const t0 = Date.now();
  fetch(API + '/track', { method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ site: SITE, path: location.pathname, referrer: document.referrer, session_id: sid })
  });
  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon(API + '/session', JSON.stringify({
      site: SITE, session_id: sid, duration_s: Math.round((Date.now()-t0)/1000), pages: window._pageCount || 1
    }));
  });
})();
</script>`;

  return new NextResponse(snippet, { headers: { 'Content-Type': 'text/plain' } });
}
