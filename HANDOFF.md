# HANDOFF — agenttrace plans pilot (Free/Pro limits + Stripe billing)
**Date:** 2026-10-05  **Status:** PAUSED — awaiting owner
**Goal:** Ship enforced Free/Pro plan limits with Stripe checkout, over-limit flagging, retention cleanup and a guest sandbox for agenttrace.

Plan: `docs/superpowers/plans/2026-10-05-agenttrace-plans.md` (branch `feat/plans-pilot`)

## Files to touch
- `apps/dashboard/src/lib/plans.ts` + `plans.test.ts` — single source of plan limits (Task 1)
- later tasks: schema, ingest routes, Stripe webhook, cron, dashboard, pricing, health (see plan)

## Steps
- [x] Task 1: Test runner + pure plan logic
- [x] Task 2: Schema columns + DB helpers
- [x] Task 3: Meter both ingest routes
- [x] Task 4: Enforce Free project cap
- [x] Task 5: Stripe checkout binding + webhook
- [x] Task 6: Retention cleanup (cron)
- [x] Task 7: Guest sandbox + limit banner on /dashboard
- [x] Task 8: Pricing page from PLAN_LIMITS + funnel events
- [x] Task 9: Health endpoint, error logging, AI via shared chain
- [~] Task 10: local gates done (tests 17/17 after fixes, tsc 3 baseline errors, build green). Owner-side pending:
  - [ ] `db:push` on dev DB
  - [ ] Stripe test-mode checkout/cancel cycle
  - [ ] CRON_SECRET set + Vercel root dir `apps/dashboard`
  - [ ] NEXT_PUBLIC_POSTHOG_KEY
  - [ ] Playwright / Lighthouse / visual-qa
  - [ ] /cso security audit
  - [ ] push approval

## Pillar exemptions (AI platform standard)
- Pillars 10-13 are not built: gap stated, not faked.
- ai-core is not reachable from Vercel, so the `ai-platform-template` free-first chain is the documented fallback.
- Retrieval/RAG and graph retrieval: N/A (no retrieval feature in this scope).
- Agentic retrieval: no, plain pipeline.

## Success criteria
- `npm test` green in apps/dashboard; each plan task's own verification passes; Task 10 E2E evidence complete.

## Resume from here if interrupted
Tasks 1-9 done and review fixes applied locally. Task 10 local gates green; waiting on owner-side E2E list above. Nothing pushed.
- Task 9: vendored src/lib/ai.ts; stubbed missing @/vertical.config as {} and ts-ignored the optional @anthropic-ai/sdk import (smaller diff than adding deps). steps/[id]/replay still calls Groq directly (out of scope).
