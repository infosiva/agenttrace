# HANDOFF — agenttrace plans pilot (Free/Pro limits + Stripe billing)
**Date:** 2026-10-05  **Status:** IN PROGRESS
**Goal:** Ship enforced Free/Pro plan limits with Stripe checkout, over-limit flagging, retention cleanup and a guest sandbox for agenttrace.

Plan: `docs/superpowers/plans/2026-10-05-agenttrace-plans.md` (branch `feat/plans-pilot`)

## Files to touch
- `apps/dashboard/src/lib/plans.ts` + `plans.test.ts` — single source of plan limits (Task 1)
- later tasks: schema, ingest routes, Stripe webhook, cron, dashboard, pricing, health (see plan)

## Steps
- [x] Task 1: Test runner + pure plan logic
- [ ] Task 2: Schema columns + DB helpers
- [ ] Task 3: Meter both ingest routes
- [ ] Task 4: Enforce Free project cap
- [ ] Task 5: Stripe checkout binding + webhook
- [ ] Task 6: Retention cleanup (cron)
- [ ] Task 7: Guest sandbox + limit banner on /dashboard
- [ ] Task 8: Pricing page from PLAN_LIMITS + funnel events
- [ ] Task 9: Health endpoint, error logging, AI via shared chain
- [ ] Task 10: Full E2E definition of done (evidence required for each)

## Pillar exemptions (AI platform standard)
- Pillars 10-13 are not built: gap stated, not faked.
- ai-core is not reachable from Vercel, so the `ai-platform-template` free-first chain is the documented fallback.
- Retrieval/RAG and graph retrieval: N/A (no retrieval feature in this scope).
- Agentic retrieval: no, plain pipeline.

## Success criteria
- `npm test` green in apps/dashboard; each plan task's own verification passes; Task 10 E2E evidence complete.

## Resume from here if interrupted
Task 1 done locally (plans.ts + 6 tests green). Next: Task 2.
