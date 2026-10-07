# agenttrace Plans (guest sandbox / Free / Pro) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make guest / Free / Pro real on agentlogs.app: a read-only sandbox for guests, enforced Free limits, Stripe-driven Pro, with tracking and a health check.

**Architecture:** One `plan` column on `user` (set only by a verified Stripe webhook). Pure limit logic in `lib/plans.ts` (testable without a DB); DB-touching helpers in `lib/plan-db.ts`. Ingest routes accept every trace and flag over-limit ones (never drop). Guest sandbox renders from a static fixture module with zero DB access.

**Tech Stack:** Next.js 15 App Router, drizzle-orm 0.45 + postgres-js, next-auth v5 beta, stripe ^22, posthog-js, `node:test` run through `tsx` (no test runner exists today).

**Spec:** `agenttrace/docs/superpowers/specs/2026-10-05-agenttrace-plans-design.md`

All paths below are relative to `agenttrace/apps/dashboard/` unless they start with `agenttrace/`.

## Global Constraints

- Starting limits are HYPOTHESES: Free 5,000 traces/mo, 7d retention, 1 project; Pro 100,000 traces/mo, 30d retention, unlimited projects; Pro price $19. They live ONLY in `src/lib/plans.ts`.
- Over-limit traces are still ACCEPTED and flagged `over_limit`; never silently dropped.
- Webhook: signature verified, FAIL CLOSED (503) if `STRIPE_WEBHOOK_SECRET` unset, idempotent by Stripe event id.
- Guest sandbox: zero DB reads or writes, no API key issuance, visibly labelled SAMPLE.
- Features that are not built (alerts, team sharing, webhook export, AI diagnosis on traces) are shown as "Planned", never as included.
- No provider SDK or raw provider fetch in feature code; AI goes through the shared free-first chain.
- No secrets in code, logs, or analytics payloads. Fallback values for secrets are `''`, never real strings.
- Free tier tooling only. No paid service enabled without owner approval.
- Commit only when the owner says so; stage files by name; git identity `Siva <info.siva@gmail.com>`.
- Pillar exemptions (record in HANDOFF.md): pillars 10-13 not built; ai-core not reachable from Vercel, so the template chain is the documented fallback; retrieval/RAG and graph retrieval do not apply (no retrieval feature in this scope); agentic retrieval = no, plain pipeline.

## Review Focus

- Webhook replay: same Stripe event id delivered twice must not change state twice. (Task 5 test)
- Webhook with missing/garbled `client_reference_id` or unknown customer must be ignored, never crash into a 500 retry storm. (Task 5 test)
- Subscription cancelled then re-subscribed: plan returns to `pro` via a new `checkout.session.completed`. (Task 5 test)
- A batch OTLP export that straddles the monthly limit: only the traces past the limit are flagged. (Task 1 test)
- Free user already at 1 project posting a second must get 402 with a stable error code, not a 500. (Task 4)
- Guest hits `/dashboard` with a stale or forged cookie: still sandbox, no redirect loop, no DB read. (Task 7 test + Playwright)

---

### Task 1: Test runner + pure plan logic

**Files:**
- Modify: `package.json` (add `tsx` devDependency and `test` script)
- Create: `src/lib/plans.ts`
- Test: `src/lib/plans.test.ts`
- Modify: `agenttrace/HANDOFF.md` (scope = plans pilot; steps from this plan; pillar exemptions from Global Constraints)

**Interfaces:**
- Produces: `type Plan = 'free'|'pro'`; `PLAN_LIMITS`; `parsePlan(v: unknown): Plan`; `isOverLimit(plan: Plan, used: number): boolean`; `overLimitFlags(plan: Plan, used: number, count: number): boolean[]`; `canCreateProject(plan: Plan, existing: number): boolean`; `monthStart(now: Date): Date`; `planFeatureLines(plan: Plan): string[]`; `PLANNED_FEATURES: string[]`.

- [ ] **Step 1: Update HANDOFF.md** (project rule: before first code). Set goal, the task list below as `- [ ]` steps, and the pillar exemptions.

- [ ] **Step 2: Install runner**

Run: `cd agenttrace && npm i -D tsx -w @agenttrace/dashboard`
Then in `package.json` scripts add: `"test": "tsx --test \"src/**/*.test.ts\""`

- [ ] **Step 3: Write the failing test** `src/lib/plans.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAN_LIMITS, parsePlan, isOverLimit, overLimitFlags, canCreateProject, monthStart, planFeatureLines } from './plans';

test('parsePlan defaults anything unknown to free', () => {
  assert.equal(parsePlan('pro'), 'pro');
  for (const v of [undefined, null, '', 'enterprise', 'PRO', 1]) assert.equal(parsePlan(v), 'free');
});

test('isOverLimit boundary: the trace that would be #limit+1 is over', () => {
  const l = PLAN_LIMITS.free.tracesPerMonth;
  assert.equal(isOverLimit('free', l - 1), false);
  assert.equal(isOverLimit('free', l), true);
});

test('overLimitFlags flags only the traces past the limit in a batch', () => {
  const l = PLAN_LIMITS.free.tracesPerMonth;
  assert.deepEqual(overLimitFlags('free', l - 2, 4), [false, false, true, true]);
  assert.deepEqual(overLimitFlags('free', 0, 0), []);
});

test('canCreateProject: free capped, pro unlimited', () => {
  assert.equal(canCreateProject('free', 0), true);
  assert.equal(canCreateProject('free', 1), false);
  assert.equal(canCreateProject('pro', 500), true);
});

test('monthStart is the first instant of the UTC month', () => {
  assert.equal(monthStart(new Date('2026-10-31T23:59:59Z')).toISOString(), '2026-10-01T00:00:00.000Z');
  assert.equal(monthStart(new Date('2026-01-01T00:00:00Z')).toISOString(), '2026-01-01T00:00:00.000Z');
});

test('planFeatureLines come from PLAN_LIMITS (copy cannot drift)', () => {
  const free = planFeatureLines('free').join('|');
  assert.ok(free.includes(PLAN_LIMITS.free.tracesPerMonth.toLocaleString('en-US')));
  assert.ok(planFeatureLines('pro').join('|').includes('Unlimited projects'));
});
```

- [ ] **Step 4: Run, expect FAIL**

Run: `cd agenttrace/apps/dashboard && npm test`
Expected: FAIL, "Cannot find module './plans'".

- [ ] **Step 5: Implement** `src/lib/plans.ts`

```ts
// Single source of truth for plan limits. Numbers are HYPOTHESES (no buyer-side evidence yet).
export type Plan = 'free' | 'pro';

export const PLAN_LIMITS = {
  free: { tracesPerMonth: 5_000, retentionDays: 7, maxProjects: 1, priceUsd: 0 },
  pro: { tracesPerMonth: 100_000, retentionDays: 30, maxProjects: Number.POSITIVE_INFINITY, priceUsd: 19 },
} as const satisfies Record<Plan, { tracesPerMonth: number; retentionDays: number; maxProjects: number; priceUsd: number }>;

// Shown on /pricing as "Planned". Move a line out of here only when the feature ships.
export const PLANNED_FEATURES = ['Alerts', 'Team sharing', 'Webhook / REST export', 'AI diagnosis on traces'];

export function parsePlan(v: unknown): Plan {
  return v === 'pro' ? 'pro' : 'free';
}

// `used` = traces already counted this month, before the one being inserted.
export function isOverLimit(plan: Plan, used: number): boolean {
  return used >= PLAN_LIMITS[plan].tracesPerMonth;
}

export function overLimitFlags(plan: Plan, used: number, count: number): boolean[] {
  return Array.from({ length: count }, (_, i) => isOverLimit(plan, used + i));
}

export function canCreateProject(plan: Plan, existing: number): boolean {
  return existing < PLAN_LIMITS[plan].maxProjects;
}

export function monthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function planFeatureLines(plan: Plan): string[] {
  const l = PLAN_LIMITS[plan];
  return [
    `${l.tracesPerMonth.toLocaleString('en-US')} traces / month`,
    `${l.retentionDays}-day retention`,
    l.maxProjects === Number.POSITIVE_INFINITY ? 'Unlimited projects' : `${l.maxProjects} project${l.maxProjects === 1 ? '' : 's'}`,
  ];
}
```

- [ ] **Step 6: Run, expect PASS**

Run: `npm test` → all 6 pass.

- [ ] **Step 7: Commit (only on owner go-ahead)**

```bash
git add apps/dashboard/package.json package-lock.json apps/dashboard/src/lib/plans.ts apps/dashboard/src/lib/plans.test.ts HANDOFF.md
git commit -m "feat(plans): plan limits config + test runner"
```

---

### Task 2: Schema columns + DB helpers

**Files:**
- Modify: `src/lib/db/schema.ts`
- Create: `src/lib/plan-db.ts`, `src/lib/track-server.ts`

**Interfaces:**
- Consumes: `parsePlan`, `monthStart`, `overLimitFlags`, `Plan` from Task 1.
- Produces: `users.plan`, `users.stripeCustomerId`, `users.planUpdatedAt`, `traces.overLimit`, table `stripeEvents`; `getPlan(userId): Promise<Plan>`; `countMonthTraces(userId, now?): Promise<number>`; `meterIngest(userId, count): Promise<boolean[]>`; `trackServer(event, distinctId, props?): void`.

- [ ] **Step 1: Edit schema.** In `users` add (inside the column object):

```ts
plan: text('plan').notNull().default('free'), // 'free' | 'pro'; validated by parsePlan (text, not pgEnum: additive, no enum migration)
stripeCustomerId: text('stripe_customer_id'),
planUpdatedAt: timestamp('plan_updated_at', { mode: 'date' }),
```
In `traces` add `overLimit: boolean('over_limit').notNull().default(false),` and add `boolean` to the `drizzle-orm/pg-core` import. Append:

```ts
export const stripeEvents = pgTable('stripe_event', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
```
Run `grep -n "onDelete" src/lib/db/schema.ts`. If `steps.traceId` / `replays` do not cascade on trace delete, add `{ onDelete: 'cascade' }` to those references (Task 6 relies on it).

- [ ] **Step 2: Create `src/lib/track-server.ts`**

```ts
// Server-side PostHog capture. No-op without the key; never throws, never blocks the request.
export function trackServer(event: string, distinctId: string, props: Record<string, unknown> = {}): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
  void fetch(`${host}/capture/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ api_key: key, event, distinct_id: distinctId, properties: props }),
  }).catch(() => {});
}
```
(If `PostHogInit.tsx` uses a different host, match it.)

- [ ] **Step 3: Create `src/lib/plan-db.ts`**

```ts
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
```

- [ ] **Step 4: Push schema to a DEV database (never prod without owner approval)**

Run: `DATABASE_URL=<dev-or-branch-url> npm run db:push` (drizzle shows the additive diff; confirm only the 4 columns + `stripe_event` table). Owner supplies the dev URL.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit` → error count must be the baseline 3 (do not add any).

- [ ] **Step 6: Commit (on owner go-ahead)** `git add` the three files + schema.

---

### Task 3: Meter both ingest routes

**Files:**
- Modify: `src/app/api/v1/traces/route.ts`, `src/app/api/v1/otel/traces/route.ts`

**Interfaces:**
- Consumes: `meterIngest` (Task 2); `ResolvedKey.userId` from `resolveApiKey`.

- [ ] **Step 1 (v1/traces).** Add `import { meterIngest } from '@/lib/plan-db';`. Before the insert:

```ts
const [overLimit] = await meterIngest(key.userId, 1);
```
Add `overLimit,` to the `.values({...})` object and `over_limit: overLimit` to the JSON response: `return NextResponse.json({ id: trace.id, started_at: trace.startedAt, over_limit: overLimit });`

- [ ] **Step 2 (otel/traces).** Same import. After `byOtelTraceId` is built and before the loop:

```ts
const overFlags = await meterIngest(key.userId, byOtelTraceId.size);
let flagIdx = 0;
```
Inside the `.values({...})` add `overLimit: overFlags[flagIdx++],`. Return the count of over-limit traces in the existing response object as `over_limit: overFlags.filter(Boolean).length` (read the end of the file first to add it to the existing JSON).

- [ ] **Step 3: Verify against the dev DB.** Start `npm run dev` with the dev `DATABASE_URL`, create a user + key, then temporarily export `PLAN_LIMITS.free.tracesPerMonth` as 2 in a local-only edit (revert after):

Run: three `curl -s -X POST localhost:3000/api/v1/traces -H "authorization: Bearer <key>" -H 'content-type: application/json' -d '{"name":"t"}'`
Expected: first two `over_limit:false`, third `over_limit:true`, and all three rows exist in `traces`. Revert the limit edit.

- [ ] **Step 4:** `npx tsc --noEmit` baseline (3). Commit on owner go-ahead.

---

### Task 4: Enforce Free project cap

**Files:**
- Modify: `src/app/api/projects/route.ts`
- Modify: `src/app/settings/SettingsClient.tsx` (around the `fetch('/api/projects'` call, line ~23)

**Interfaces:** Consumes `getPlan`, `canCreateProject`.

- [ ] **Step 1.** In `POST`, after the name check and before the insert:

```ts
const plan = await getPlan(session.user.id);
const existing = await db.select({ id: projects.id }).from(projects).where(eq(projects.userId, session.user.id));
if (!canCreateProject(plan, existing.length)) {
  return NextResponse.json({ error: 'project_limit_reached', plan, upgrade_url: '/pricing' }, { status: 402 });
}
```
with imports `getPlan` from `@/lib/plan-db` and `canCreateProject` from `@/lib/plans`.

- [ ] **Step 2.** In `SettingsClient.tsx`, where the create response is handled, if `res.status === 402` show the message "Free plan includes 1 project. Upgrade to Pro for unlimited." with a link to `/pricing` and `trackEvent('limit_reached', { kind: 'projects' })` (import `trackEvent` from `'../PostHogInit'`). Read the surrounding lines first and follow the existing error-state pattern.

- [ ] **Step 3: Verify.** Dev server, Free user with 1 project: `curl -s -o /dev/null -w "%{http_code}" -X POST localhost:3000/api/projects ...` with a session cookie → `402`; Pro user (set `plan='pro'` in dev DB) → `200`.

- [ ] **Step 4:** tsc baseline; commit on go-ahead.

---

### Task 5: Stripe checkout binding + webhook

**Files:**
- Modify: `src/app/api/stripe/checkout/route.ts`
- Create: `src/lib/stripe-events.ts`, `src/app/api/stripe/webhook/route.ts`
- Test: `src/lib/stripe-events.test.ts`

**Interfaces:**
- Consumes: `Plan`, `trackServer`, `users`, `stripeEvents`.
- Produces: `applyStripeEvent(ev: StripeEventLike, deps: PlanDeps): Promise<'applied'|'duplicate'|'ignored'>`.

- [ ] **Step 1: Failing test** `src/lib/stripe-events.test.ts` (pure, in-memory deps)

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyStripeEvent, type PlanDeps } from './stripe-events';

function deps() {
  const seen = new Set<string>();
  const state = { userPlan: new Map<string, string>(), customer: new Map<string, string>(), tracked: [] as string[] };
  const d: PlanDeps = {
    hasSeen: async id => seen.has(id),
    markSeen: async id => { seen.add(id); },
    setPlanByUser: async (u, p, c) => { state.userPlan.set(u, p); state.customer.set(c, u); },
    setPlanByCustomer: async (c, p) => { const u = state.customer.get(c); if (!u) return false; state.userPlan.set(u, p); return true; },
    track: e => { state.tracked.push(e); },
  };
  return { d, state };
}
const completed = (id: string, ref: string | null, cus = 'cus_1') =>
  ({ id, type: 'checkout.session.completed', data: { object: { client_reference_id: ref, customer: cus } } });

test('checkout completed -> pro, tracks checkout_completed', async () => {
  const { d, state } = deps();
  assert.equal(await applyStripeEvent(completed('evt_1', 'u1'), d), 'applied');
  assert.equal(state.userPlan.get('u1'), 'pro');
  assert.deepEqual(state.tracked, ['checkout_completed']);
});

test('same event id twice applies once', async () => {
  const { d, state } = deps();
  await applyStripeEvent(completed('evt_1', 'u1'), d);
  assert.equal(await applyStripeEvent(completed('evt_1', 'u1'), d), 'duplicate');
  assert.equal(state.tracked.length, 1);
});

test('missing client_reference_id is ignored, not thrown', async () => {
  const { d } = deps();
  assert.equal(await applyStripeEvent(completed('evt_2', null), d), 'ignored');
});

test('subscription deleted -> free; unknown customer ignored', async () => {
  const { d, state } = deps();
  await applyStripeEvent(completed('evt_1', 'u1'), d);
  assert.equal(await applyStripeEvent({ id: 'evt_3', type: 'customer.subscription.deleted', data: { object: { customer: 'cus_1' } } }, d), 'applied');
  assert.equal(state.userPlan.get('u1'), 'free');
  assert.equal(await applyStripeEvent({ id: 'evt_4', type: 'customer.subscription.deleted', data: { object: { customer: 'cus_zzz' } } }, d), 'ignored');
});

test('cancel then re-subscribe returns to pro', async () => {
  const { d, state } = deps();
  await applyStripeEvent(completed('evt_1', 'u1'), d);
  await applyStripeEvent({ id: 'evt_3', type: 'customer.subscription.deleted', data: { object: { customer: 'cus_1' } } }, d);
  await applyStripeEvent(completed('evt_5', 'u1'), d);
  assert.equal(state.userPlan.get('u1'), 'pro');
});

test('unrelated event types are ignored', async () => {
  const { d } = deps();
  assert.equal(await applyStripeEvent({ id: 'evt_9', type: 'invoice.paid', data: { object: {} } }, d), 'ignored');
});
```

- [ ] **Step 2: Run, expect FAIL** (`npm test`, module not found).

- [ ] **Step 3: Implement** `src/lib/stripe-events.ts`

```ts
import type { Plan } from './plans';

export type StripeEventLike = { id: string; type: string; data: { object: Record<string, any> } }; // eslint-disable-line @typescript-eslint/no-explicit-any
export type PlanDeps = {
  hasSeen(id: string): Promise<boolean>;
  markSeen(id: string): Promise<void>;
  setPlanByUser(userId: string, plan: Plan, customerId: string): Promise<void>;
  setPlanByCustomer(customerId: string, plan: Plan): Promise<boolean>;
  track(event: string, userId: string): void;
};

// Apply first, mark seen after: a crash in between means Stripe's retry re-applies (harmless, setting a plan is idempotent).
export async function applyStripeEvent(ev: StripeEventLike, deps: PlanDeps): Promise<'applied' | 'duplicate' | 'ignored'> {
  if (await deps.hasSeen(ev.id)) return 'duplicate';
  const o = ev.data.object;
  let result: 'applied' | 'ignored' = 'ignored';

  if (ev.type === 'checkout.session.completed') {
    const userId = typeof o.client_reference_id === 'string' ? o.client_reference_id : null;
    const customerId = typeof o.customer === 'string' ? o.customer : null;
    if (userId && customerId) {
      await deps.setPlanByUser(userId, 'pro', customerId);
      deps.track('checkout_completed', userId);
      result = 'applied';
    }
  } else if (ev.type === 'customer.subscription.deleted') {
    const customerId = typeof o.customer === 'string' ? o.customer : null;
    if (customerId && (await deps.setPlanByCustomer(customerId, 'free'))) result = 'applied';
  }

  await deps.markSeen(ev.id);
  return result;
}
```

- [ ] **Step 4: Run, expect PASS** (6 tests in this file).

- [ ] **Step 5: Webhook route** `src/app/api/stripe/webhook/route.ts`

```ts
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db, users, stripeEvents } from '@/lib/db';
import { applyStripeEvent, type PlanDeps } from '@/lib/stripe-events';
import { trackServer } from '@/lib/track-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const deps: PlanDeps = {
  hasSeen: async id => (await db.select({ id: stripeEvents.id }).from(stripeEvents).where(eq(stripeEvents.id, id))).length > 0,
  markSeen: async id => { await db.insert(stripeEvents).values({ id }).onConflictDoNothing(); },
  setPlanByUser: async (userId, plan, customerId) => {
    await db.update(users).set({ plan, stripeCustomerId: customerId, planUpdatedAt: new Date() }).where(eq(users.id, userId));
  },
  setPlanByCustomer: async (customerId, plan) => {
    const rows = await db.update(users).set({ plan, planUpdatedAt: new Date() }).where(eq(users.stripeCustomerId, customerId)).returning({ id: users.id });
    return rows.length > 0;
  },
  track: (event, userId) => trackServer(event, userId),
};

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return Response.json({ error: 'webhook_not_configured' }, { status: 503 }); // fail closed
  const sig = req.headers.get('stripe-signature');
  if (!sig) return Response.json({ error: 'missing_signature' }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event = new Stripe(key, { apiVersion: '2026-04-22.dahlia' as any }).webhooks.constructEvent(raw, sig, secret);
  } catch {
    return Response.json({ error: 'invalid_signature' }, { status: 400 });
  }
  const result = await applyStripeEvent(event as never, deps);
  return Response.json({ received: true, result });
}
```
Add `stripeEvents` is already exported via `export * from './schema'`.

- [ ] **Step 6: Bind checkout to the user.** In `checkout/route.ts` import `auth` from `@/lib/auth`; at the top of `POST` after the config check:

```ts
const session0 = await auth();
if (!session0?.user?.id) return Response.json({ error: 'unauthorized' }, { status: 401 });
```
and add to the `sessions.create` call: `client_reference_id: session0.user.id, customer_email: session0.user.email ?? undefined,` and metadata `{ product: 'agenttrace', user_id: session0.user.id }`. Change `success_url` to `${origin}/dashboard?upgraded=1`.

- [ ] **Step 7: Stripe test-mode run (needs owner's test keys).** With `stripe listen --forward-to localhost:3000/api/stripe/webhook` (Stripe CLI prints the `whsec_` secret into local `.env.local`, never chat): complete a test checkout → dev DB `user.plan='pro'`; replay the same event with `stripe events resend <id>` → state unchanged, response `duplicate`; cancel the subscription in the test dashboard → `plan='free'`. Also `curl -X POST .../webhook -d '{}'` with no signature → 400; unset the secret → 503.

- [ ] **Step 8:** tsc baseline; commit on go-ahead.

---

### Task 6: Retention cleanup (cron)

**Files:**
- Create: `src/app/api/cron/retention/route.ts`, `vercel.json` (in `apps/dashboard/`)

**Interfaces:** Consumes `PLAN_LIMITS`; relies on trace-delete cascade (Task 2 Step 1).

- [ ] **Step 1: Route**

```ts
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
```

- [ ] **Step 2: `vercel.json`**: `{ "crons": [{ "path": "/api/cron/retention", "schedule": "17 3 * * *" }] }`. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically once `CRON_SECRET` is set in project env (owner sets it).

- [ ] **Step 3: Verify on the dev DB.** Insert one free-user trace with `created_at = now() - interval '8 days'` and one pro-user trace at `'8 days'`, call `curl -H "authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/retention` → `deleted: 1` (free one gone, pro one kept, its steps gone too). Without header → 401.

- [ ] **Step 4:** tsc baseline; commit on go-ahead.

---

### Task 7: Guest sandbox + limit banner on /dashboard

**Files:**
- Create: `src/lib/sandbox-fixtures.ts`, `src/components/SandboxDashboard.tsx`
- Test: `src/lib/sandbox-fixtures.test.ts`
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:** Consumes `getPlan`, `countMonthTraces`, `PLAN_LIMITS`, `trackEvent`.
Produces `SANDBOX_TRACES: { id: string; name: string; status: 'success'|'error'|'running'; durationMs: number; tokens: number; costUsd: number; minutesAgo: number }[]`.

- [ ] **Step 1: Failing test**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SANDBOX_TRACES } from './sandbox-fixtures';

test('fixtures cover success and error so the demo is meaningful', () => {
  assert.ok(SANDBOX_TRACES.length >= 6);
  assert.ok(SANDBOX_TRACES.some(t => t.status === 'error'));
  assert.ok(SANDBOX_TRACES.some(t => t.status === 'success'));
});

test('sandbox modules never touch the database or auth', () => {
  for (const f of ['./sandbox-fixtures.ts', '../components/SandboxDashboard.tsx']) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.ok(!/@\/lib\/db|from '\.\/db|@\/lib\/auth|drizzle/.test(src), `${f} imports db/auth`);
  }
});
```
Run → FAIL (module missing).

- [ ] **Step 2: Fixtures** `src/lib/sandbox-fixtures.ts` (static, clearly sample; no DB):

```ts
// Static SAMPLE data for the guest sandbox. Never read from or written to the database.
export const SANDBOX_TRACES = [
  { id: 's1', name: 'support-agent: refund request', status: 'success', durationMs: 2140, tokens: 1830, costUsd: 0.0041, minutesAgo: 3 },
  { id: 's2', name: 'support-agent: order lookup', status: 'success', durationMs: 980, tokens: 760, costUsd: 0.0017, minutesAgo: 9 },
  { id: 's3', name: 'research-agent: web summary', status: 'error', durationMs: 8120, tokens: 5210, costUsd: 0.0123, minutesAgo: 14 },
  { id: 's4', name: 'code-review-agent: PR #482', status: 'success', durationMs: 5630, tokens: 4400, costUsd: 0.0098, minutesAgo: 27 },
  { id: 's5', name: 'support-agent: cancel subscription', status: 'running', durationMs: 0, tokens: 210, costUsd: 0.0004, minutesAgo: 1 },
  { id: 's6', name: 'research-agent: competitor scan', status: 'error', durationMs: 12040, tokens: 7010, costUsd: 0.0161, minutesAgo: 41 },
  { id: 's7', name: 'code-review-agent: PR #479', status: 'success', durationMs: 4380, tokens: 3620, costUsd: 0.0077, minutesAgo: 58 },
] as const satisfies readonly { id: string; name: string; status: 'success' | 'error' | 'running'; durationMs: number; tokens: number; costUsd: number; minutesAgo: number }[];
```

- [ ] **Step 3: Component** `src/components/SandboxDashboard.tsx`: `'use client'`; on mount `trackEvent('guest_sandbox_viewed')` (import from `'@/app/PostHogInit'`); renders, in the dashboard's existing look (bg `#020617`, cyan accent, font-mono, set its OWN background per the BG-contrast rule): a sticky top bar with a `SAMPLE DATA` badge and the CTA `<Link href="/login">Sign up free to send your own traces</Link>`; four metric tiles computed from `SANDBOX_TRACES` (traces, error count, avg duration of non-running, total tokens); and a table of the traces (name, status badge, duration, tokens, cost, relative time from `minutesAgo`). Copy the `Metric` / `StatusBadge` look from `dashboard/page.tsx` rather than importing server-only helpers. Each locked item uses a lock icon + "Pro" tag only for things that exist (retention beyond 7 days, more projects).

- [ ] **Step 4: Run tests, expect PASS.**

- [ ] **Step 5: Edit `dashboard/page.tsx`.** Replace `redirect('/login?callbackUrl=/dashboard')` for the no-session case with `return <SandboxDashboard />;`. For signed-in users, after loading the session add:

```ts
const [plan, used] = await Promise.all([getPlan(session.user.id), countMonthTraces(session.user.id)]);
const limit = PLAN_LIMITS[plan].tracesPerMonth;
```
and render above the metrics, when `used >= limit`: a banner "You've used {used.toLocaleString()} of {limit.toLocaleString()} traces this month. New traces are still being saved; upgrade to Pro for {PLAN_LIMITS.pro.tracesPerMonth.toLocaleString()}." linking to `/pricing`, with its own explicit background. Also render a small plan badge ("Free" / "Pro") next to the page title. Remove the now-unused `redirect` import only if nothing else uses it.

- [ ] **Step 6: Verify guest has no DB access.** Run dev server with `DATABASE_URL` deliberately unset and an invalid cookie: `curl -s localhost:3000/dashboard | grep -c "SAMPLE"` must be ≥ 1 and the response 200 (guest path must not import `db` at request time, so check that `page.tsx` imports of `plan-db` are only reached after the session check; if the build fails for guests without a DB, move the signed-in branch into a separate server component file). Then re-run with the DB set and query logging on: zero queries for a guest request.

- [ ] **Step 7:** tsc baseline; commit on go-ahead.

---

### Task 8: Pricing page from PLAN_LIMITS + funnel events

**Files:**
- Modify: `src/app/pricing/page.tsx`

**Interfaces:** Consumes `planFeatureLines`, `PLAN_LIMITS`, `PLANNED_FEATURES`, `trackEvent`.

- [ ] **Step 1.** Read the file. Replace the hard-coded feature arrays of the `FREE` and `PRO` objects with `planFeatureLines('free')` / `planFeatureLines('pro')`; use `PLAN_LIMITS.pro.priceUsd` for the Pro price. Delete the claims for unbuilt features (team seats, webhook/REST export, 24h SLA email support) and the "1,000,000 events" / "10,000 events" copy. Add a "Planned" block under the table listing `PLANNED_FEATURES` with a "Planned, not available yet" label. Keep the Self-host tier but confirm the "MIT licensed" claim against the repo `LICENSE` file; if no LICENSE exists, remove the claim until the owner decides.

- [ ] **Step 2: Events.** `useEffect(() => trackEvent('pricing_viewed'), [])`; in `upgrade()` call `trackEvent('upgrade_clicked')` first; replace `alert()` on error with inline error text, and on a 401 response `window.location.href = '/login?callbackUrl=/pricing'`.

- [ ] **Step 3: Verify** by grepping the page: `grep -nE "1,000,000|10,000 events|Team seats|SLA" src/app/pricing/page.tsx` → no output.

- [ ] **Step 4:** tsc baseline; commit on go-ahead.

---

### Task 9: Health endpoint, error logging, AI via shared chain

**Files:**
- Create: `src/app/api/health/route.ts`, `src/instrumentation.ts`, `src/lib/ai.ts` (vendored copy)
- Modify: `src/lib/ai-diagnosis.ts`

- [ ] **Step 1: Health** `src/app/api/health/route.ts`

```ts
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: 'up' });
  } catch {
    return Response.json({ ok: false, db: 'down' }, { status: 503 });
  }
}
```
No secrets, no error text in the body.

- [ ] **Step 2: `src/instrumentation.ts`**

```ts
// Structured server error log (Vercel log drain / future Sentry hook). Sentry is deferred until the owner decides.
export async function onRequestError(err: unknown, request: { path: string; method: string }) {
  const e = err as { message?: string; digest?: string };
  console.error(JSON.stringify({ level: 'error', path: request.path, method: request.method, message: e?.message, digest: e?.digest }));
}
```

- [ ] **Step 3: Shared chain.** `cp ../../../ai-platform-template/lib/ai.ts src/lib/ai.ts`. Then rewrite the Groq `fetch` in `ai-diagnosis.ts` to:

```ts
import { callAI } from './ai';
// ...inside generateDiagnosis, replace the GROQ_KEY check + fetch with:
const t0 = Date.now();
const res = await callAI(SYSTEM_PROMPT, [{ role: 'user', content: prompt }], 300, 'fast');
console.log(JSON.stringify({ evt: 'ai_diagnosis', provider: res.provider, model: res.model, ms: Date.now() - t0 }));
return res.text;
```
where `SYSTEM_PROMPT` and `prompt` are the existing strings from the current function (read it first and keep its wording). If `Msg` in the vendored file is not `{ role, content }`, adapt to its actual type. If the vendored file's imports (`@vercel/edge-config`, etc.) are missing from this package, either add them with `npm i` (free) or stub `getEdgeConfig` to return `{}`; pick the smaller diff and note it in HANDOFF.

- [ ] **Step 4: Verify.** `curl -s localhost:3000/api/health` → `{"ok":true,"db":"up"}`; with a wrong `DATABASE_URL` → 503. `grep -n "api.groq.com" src` → no matches. Hit `/api/sites/diagnosis` once and see the `ai_diagnosis` log line with a provider.

- [ ] **Step 5:** tsc baseline; commit on go-ahead.

---

### Task 10: Full E2E definition of done (evidence required for each)

- [ ] `npm test` all green; `npm run build` exit 0; `npx tsc --noEmit` == baseline 3.
- [ ] Stripe test-mode cycle (Task 5 Step 7) evidence saved in HANDOFF.md.
- [ ] Design stack on touched UI (`/ui-ux-pro-max` first, then the §0 pipeline); Playwright 1280x800 and 375x812 screenshots of `/dashboard` (guest and signed-in), `/pricing`, `/settings` READ; `scripts/visual-qa.mjs` clean; Lighthouse run; no fake data outside the SAMPLE-labelled sandbox; SEO/CRO checklist.
- [ ] Network tab shows PostHog events: `guest_sandbox_viewed`, `pricing_viewed`, `upgrade_clicked`, `signup_email_sent` (needs owner's `NEXT_PUBLIC_POSTHOG_KEY` in Vercel + redeploy); `first_trace_received`, `checkout_completed`, `limit_reached` seen server-side.
- [ ] Security gate: diff touches auth/payments/schema, so run full `/cso` (OWASP/STRIPE), then `SECURITY_GATE_ACK=1 git push` only after owner approval.
- [ ] Owner approves push; Vercel green; `node agents/scripts/e2e-verify.mjs --project agenttrace --url https://agentlogs.app` exit 0; uptime ping on `/api/health` configured.
- [ ] Update memory topic file + MEMORY.md pointer; HANDOFF.md to COMPLETE with files-changed list.

---

## Self-review

- **Spec coverage:** plan columns (T2), webhook + idempotency (T5), PLAN_LIMITS/getPlan (T1/T2), metering both ingest paths (T3), retention (T6), guest sandbox (T7), locked/limit UI (T7, T4), pricing generated + unbuilt shown as planned (T8), tracking events (T2/T5/T7/T8; `signup_completed` NOT covered, see below), health + error log + uptime (T9/T10), shared AI chain (T9), DoD (T10).
- **Deliberate deviations from the spec:** usage is a `count(*)` over this month's traces instead of a separate counter table (no extra write per ingest; revisit if it gets slow); `plan` is `text` validated by `parsePlan`, not a pgEnum (additive, no enum migration); error tracking is a structured log, not Sentry (owner decision pending).
- **Gap:** `signup_completed` is not wired. It needs a hook on first session creation (next-auth `events.createUser`); add it as a one-line `trackServer('signup_completed', user.id)` in `lib/auth/index.ts` `events: { createUser }` if the owner wants it before launch.
- **Placeholder scan:** Task 7 Step 3 and Task 8 Step 1 describe UI edits in prose because the target files' exact markup was not captured; the executor must read the file first. All logic, SQL, routes and tests are given in full.
- **Type consistency:** `Plan`, `overLimitFlags`, `meterIngest`, `PlanDeps`, `applyStripeEvent`, `SANDBOX_TRACES` names match across tasks.
