import { and, eq, gte, sql } from 'drizzle-orm';
import { db, users, projects, traces } from './db';
import { monthStart, overLimitFlags, parsePlan, PLAN_LIMITS, type Plan } from './plans';
import { trackServer } from './track-server';

export async function getPlan(userId: string): Promise<Plan> {
  const [row] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
  return parsePlan(row?.plan);
}

export async function countMonthTraces(userId: string, now = new Date()): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(traces)
    .innerJoin(projects, eq(traces.projectId, projects.id))
    .where(and(eq(projects.userId, userId), gte(traces.createdAt, monthStart(now))));
  return row?.n ?? 0;
}

// Returns one over-limit flag per trace about to be inserted. Not atomic:
// ponytail: concurrent ingests can overshoot the limit by a few traces; fine for a soft limit, use a counter row if it matters.
export async function meterIngest(userId: string, count: number): Promise<boolean[]> {
  const [plan, used] = await Promise.all([getPlan(userId), countMonthTraces(userId)]);
  const flags = overLimitFlags(plan, used, count);
  if (used === 0 && count > 0) trackServer('first_trace_received', userId, { plan });
  if (used < PLAN_LIMITS[plan].tracesPerMonth && flags.some(Boolean)) trackServer('limit_reached', userId, { plan });
  return flags;
}
