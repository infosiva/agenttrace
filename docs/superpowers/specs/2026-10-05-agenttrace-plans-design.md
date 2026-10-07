# agenttrace: guest / Free / Pro plans + dashboard (pilot)

**Date:** 2026-10-05  **Status:** DRAFT, awaiting owner review  **Scope:** agenttrace (agentlogs.app) pilot; repeat per site after.

## Intent (owner-approved in chat)
Make tiers real and differentiated: guest sees a sandbox, logged-in Free gets real use with limits, Pro gets higher limits AND gated features. Every change follows the full E2E definition of done (see bottom).

## Decisions made
- Guest = read-only seeded sandbox dashboard, labelled SAMPLE, zero auth, no DB writes, no API key.
- Free->Pro gate = BOTH volume/retention limits AND feature gates.
- Approach A: one `plan` column on `user`, set by Stripe webhook; single `getPlan()` + `PLAN_LIMITS` config; all gates call it.

## Verified current state (read-only audit 2026-10-05)
- Tiers on /pricing: Free $0, Pro $19, Self-hosted.
- Stripe: `api/stripe/checkout` only (21 lines). NO webhook -> paid state never stored.
- Schema tables: user, session, projects, api_keys, traces, steps, replays. NO plan / stripe / usage columns.
- /dashboard requires login. No guest mode.
- AI diagnosis: `lib/ai-diagnosis.ts` used only by `api/sites/diagnosis`. NOT verified to work on agent traces.
- Alerts, team sharing, retention: appear ONLY in marketing copy (page.tsx, pricing/page.tsx). NOT implemented.
- Monitoring: no Sentry, no health endpoint. Tracking: PostHog key missing in prod (events no-op).

## Pro features: what may be sold
| Feature | Exists? | Rule |
|---|---|---|
| Higher volume / retention | No (no metering) | Build metering; then sell |
| AI diagnosis on traces | Partial (sites only) | Verify on traces; else mark "coming" |
| Alerts | No | Do not sell until built; pricing page says "planned" |
| Team sharing | No | Same |
Anything not built is shown as "planned", never as included.

## Design
1. **Plan source of truth:** `user.plan` enum(free,pro) default free, `user.stripe_customer_id`, `user.plan_updated_at`. Migration is additive.
2. **Webhook:** `api/stripe/webhook` verifies signature (secret from env, fail closed if unset), handles `checkout.session.completed` -> pro, `customer.subscription.deleted` -> free. Idempotent by event id.
3. **Limits config:** `lib/plans.ts` exports `PLAN_LIMITS` + `getPlan(userId)`. Numbers are HYPOTHESES (no buyer-side evidence); one file so they are cheap to change. Starting guess: free 5k traces/mo, 7d retention, 1 project; pro 100k, 30d, unlimited.
4. **Metering:** monthly trace counter per user, incremented on ingest (`api/v1/traces`). Over limit: still ACCEPT trace, set `over_limit` flag, dashboard banner "limit reached, upgrade". Never silently drop data.
5. **Retention:** scheduled cleanup deletes traces older than plan retention.
6. **Guest sandbox:** `/dashboard` for no session renders fixtures (static module), SAMPLE badge, sticky "Sign up to send your own traces". No DB reads/writes, no key issuance.
7. **Locked features:** shown with lock + upgrade prompt, not hidden. Only for features that exist.
8. **Pricing page:** table generated from `PLAN_LIMITS` so copy cannot drift from enforcement.
9. **Model router / ai-core:** AI diagnosis calls go through the shared free-first chain (`ai-platform-template/lib/ai.ts`), no provider SDK in feature code. ai-core unreachable from Vercel until the tunnel exists: documented fallback = the template chain.

## Tracking + monitoring (prerequisites, currently missing)
- Owner sets `NEXT_PUBLIC_POSTHOG_KEY` in Vercel prod; redeploy.
- Events: `signup_email_sent` (done), `guest_sandbox_viewed`, `signup_completed`, `first_trace_received` (server-side), `pricing_viewed`, `upgrade_clicked`, `checkout_completed` (from webhook), `limit_reached`.
- Add error tracking (free tier) + `/api/health` + uptime ping; log AI cost/latency per diagnosis call.

## Out of scope (YAGNI)
Entitlements table, per-seat billing, annual plans, usage-based billing, building alerts/team (separate specs).

## Risks / not known
- Pricing numbers and $19 are unvalidated. Cheapest test: N outreach messages, count replies; go/no-go threshold set by owner.
- Webhook needs Stripe test-mode end-to-end run before any live use.
- Metering counter adds a write per ingest; fine at pilot scale, revisit if throughput matters.

## Definition of done (every item needs evidence)
1. build + tsc vs baseline (3) green; tests for `getPlan`, limit enforcement, webhook signature + idempotency
2. Stripe test-mode: checkout -> webhook -> plan=pro -> gates unlock -> cancel -> back to free
3. Guest sandbox: zero DB writes (verified), SAMPLE visible
4. Design stack run; Playwright 375+1280 screenshots READ; Lighthouse; visual-qa; no fake data; SEO/CRO
5. PostHog events seen in network tab; Plausible domain registered
6. Error tracking + health + uptime live
7. Security gate (touches auth/payments/schema -> full /cso audit before push)
8. Push -> Vercel green -> e2e-verify on live URL
Owner approval needed for: commit, push, deploy, Stripe live keys, any spend.
