# HANDOFF — agenttrace pre-marketing optimisation (pilot)
**Date:** 2026-10-05  **Status:** IN PROGRESS (paused at design-lock review)
**Goal:** Make agenttrace (agentlogs.app) honest, tracked and polished before marketing it.

## Files to touch
- `apps/dashboard/src/app/page.tsx` — landing copy (4 claim fixes DONE), later UX polish
- `apps/dashboard/src/app/PostHogInit.tsx` — tracking (read OK; needs key in prod env)
- `apps/dashboard/src/app/layout.tsx` — mounts PostHogInit + Plausible
- `LICENSE` — NOT created, owner decision (pyproject says MIT)

## Design lock (DRAFT, awaiting owner review before any visual code)
- Palette: KEEP. bg `#0c111a`, primary `#22d3ee`, accent `#67e8f9` (MASTER.md line 275, ASSIGNED, no collision).
- Layout: keep terminal/dev-tool hero. No re-theme. Scope = UX polish only:
  motion (emil-design-eng/animate), accessibility pass, trust row, real (not sample) proof once data exists.
- Logo/favicon: icon.tsx exists; not reviewed yet.

## Steps
- [x] Fix fake LIVE feed label -> SAMPLE
- [x] Fix TypeScript SDK claim, framework claim (page.tsx, 4 lines)
- [x] Audit tracking wiring (Plausible tag present; PostHog code present, trackEvent on 4 CTAs)
- [ ] Confirm NEXT_PUBLIC_POSTHOG_KEY set in Vercel prod (local .env.local has none) — owner
- [ ] Add funnel events: signup, first trace received, pricing view, docs view
- [ ] Verify events fire in browser network tab
- [ ] Owner approves design lock
- [ ] UI pass: ui-ux-pro-max, taste-skill, emil-design-eng, animate, fixing-accessibility
- [ ] Playwright 375+1280 screenshots read; visual-qa.mjs; Lighthouse
- [ ] npm run build green
- [ ] Owner decisions: LICENSE, TS SDK planned?, pricing checkout real?, Docker/demo test

## Success criteria
- build exit 0; tsc errors not above baseline (3 pre-existing, none in page.tsx)
- PostHog + Plausible events visible in network tab on CTA click
- 375px and 1280px screenshots read, no overflow

## Known baseline
- tsc: 3 errors (.next/types sites/[slug]/page.ts, src/lib/auth/index.ts x2). Not compared against clean checkout.

## Resume from here if interrupted
Copy fixes done, tracking audited. Next: owner answers on prod PostHog key + design lock, then add funnel events.

## Files changed so far
- `apps/dashboard/src/app/page.tsx` (+4/-4)
- sibling repos (uncommitted): worldtrends, myvitals, aicoachlab layout.tsx Plausible tags. neuralos blocked by permission classifier.


## Design lock (2026-10-05, design-system pass)
- Archetype: saas-dashboard-landing (pickArchetype, avoid list applied). Left-aligned split hero + trace panel, vertical feature list, no centered icon-card grid.
- Palette: bg #0c111a, accent #22d3ee (already in tokens/palette-registry.json; checker reports a self-collision with agenttrace = false positive). Secondary signal colour #fb7185 (logo end node).
- Logo: apps/dashboard/src/components/Logo.tsx, app/icon.svg, app/apple-icon.tsx. Old app/icon.tsx renamed to icon.tsx.bak (dead, safe to delete).
- Theme: src/lib/theme-loader.ts (fetch-based Edge Config read, @vercel/edge-config is not a dependency); layout wires loadSiteTheme/buildThemeStyleTag/buildGa4Snippet; GA4 off unless hub sets analytics.ga4Id.
- Honesty: fake metrics, competitor price table, "Most popular", $19 Pro removed; Pro shown as Planned. Insecure http://31.97.56.148:3098 tracker removed (needs https TRACKER_API_URL, else 503). Original home page saved in session scratchpad only.
- Dead/unused: plausible.io script removed from layout; Stripe checkout route and promo code still exist but are no longer linked from home/pricing.

## Runtime-switch + telemetry retrofit (2026-10-06) - files only, nothing committed
- apps/dashboard: added lib/telemetry.ts, app/api/usage/route.ts (204, JSON-line log, no PII), components/AnimatedBg.tsx, components/CookieConsent.tsx (consent banner + window error/unhandledrejection logging); layout.tsx now sets data-layout, --bg/--accent vars, AnimatedBg (falls back to old aurora when hub bgAnimation unset); globals.css has [data-layout] variants + reduced-motion. `next build` rc=0.
- Not verified: screenshots 375/1280, live hub theme switching, existing Plausible/PostHog/Vercel Analytics are not consent-gated (left unchanged).


## ANIMATED SCOPE (recorded 2026-10-09 sweep)
- What moves: CSS keyframes already shipped: aurora-drift, blink-cursor, demo-blink, demo-fade, ds-float, ds-shift, fw-spin, grain-shift, matrixRain, pulse-ring, scanline, slideDown.
- Why: ambient background + entry/press feedback on the product's core action; no motion carries information alone.
- Trigger: page load (ambient/entry), user press/hover (feedback).
- Reduced-motion: `prefers-reduced-motion` handling present in the project's styles (verified by scan 2026-10-09).
- Still open: `/review-animations` run (needs a running app, one at a time).
