import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 }); // fail closed when unset
  }
  const rows = await db.execute(sql`
    delete from traces t using projects p, "user" u
    where t.project_id = p.id and p.user_id = u.id
      and t.created_at < now() - (case when u.plan = 'pro' then ${PLAN_LIMITS.pro.retentionDays} else ${PLAN_LIMITS.free.retentionDays} end) * interval '1 day'
    returning t.id`);
  return Response.json({ deleted: rows.length });
}
