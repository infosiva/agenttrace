# HANDOFF — agenttrace: demo page + dashboard default view + fix fake integration statuses

**Date:** 2026-09-19  **Status:** IN PROGRESS
**Goal:** Build a real "how it works" demo page (any agent framework, real differentiator vs LangSmith/Langfuse/Helicone/Arize), improve default dashboard view, remove fabricated "Available" statuses on unshipped integrations.

## Design lock (existing tokens reused, no redesign — dev-tools dark navy already correct per DESIGN-STANDARD.md)
- bg: `#0b1120`-class dark navy (existing `--background: 222.2 84% 4.9%` HSL)
- accent: cyan `#22d3ee` / `#06b6d4` (existing `--brand-accent`)
- Layout: new `/demo` page uses same shell as landing hero demo panel (terminal-style live trace card) — extend, don't invent new archetype
- Logo: existing AgentTrace mark (navbar) — reuse, no change needed

## Research (background agent, not yet returned)
Competitor gap research dispatched — LangSmith/Langfuse/Helicone/Arize/Braintrust/W&B Weave/Portkey: auto-instrumentation coverage, replay/root-cause support, default dashboard view, pricing, real gaps from dev complaints (Reddit/HN/G2). **Do not write "no one offers this" copy until this returns with real citations** — zero-fake-data rule applies to marketing claims same as UI stats.

## Files to touch
- `apps/dashboard/src/app/demo/page.tsx` — NEW: how-it-works explainer + live interactive trace demo (any framework: LangChain/CrewAI/OpenAI SDK/raw)
- `apps/dashboard/src/app/integrations/page.tsx` — fix fake "Available" tags: only LangChain + OpenAI SDK are actually shipped (per sdk-python integrations/). Mark rest "Coming soon" or remove.
- `apps/dashboard/src/app/dashboard/page.tsx` (or wherever default view renders) — improve default landing view for a fresh/first-login dashboard (currently check what it shows)
- `apps/dashboard/src/app/layout.tsx` — add `/demo` to nav if warranted
- `apps/dashboard/src/app/sitemap.ts` — add `/demo` route

## Steps
- [x] Competitor research dispatched (background) — **failed with rate-limit error, not re-dispatched.** No citations obtained → differentiator section uses factual-only product-capability claims, zero competitor names, zero "no one offers this" copy.
- [x] Read current dashboard default view — identified dead-end empty states
- [x] Fix `/integrations` fake statuses — only LangChain + OpenAI SDK marked "Available", rest "Coming Soon"
- [x] Improve dashboard default/empty state — `NoProjectsState` gets "See how it works" CTA → `/demo`; `FirstTraceEmptyState` replaced with quickstart panel (install cmds, code snippets, links to `/demo` + `/docs`)
- [x] Build `/demo` page: hero + 4-step flow + framework tabs (OpenAI SDK/LangChain/Raw HTTP, all real/shipped — CrewAI excluded, not shipped) + animated live trace panel (extends `AnimatedHeroGuide.tsx` visual language, explicitly labeled "Simulated for this demo") + factual "What tracing gives you" section (no competitor claims)
- [x] Add `/demo` to nav — `site-header.tsx` (desktop + mobile), not `layout.tsx` (nav lives in site-header.tsx)
- [x] Add `/demo` to `sitemap.ts`
- [x] `npm run build` — 0 errors, exit 0
- [x] visual-qa + Playwright 375/1280 + full-page — read all 3 screenshots, clean (fade-in animation caught mid-transition on first shot was a false alarm — re-shot with 2s wait, fully rendered and readable, good contrast)
- [ ] commit, push, verify Vercel green, e2e-verify live

## Success criteria
- `/demo` explains product to a cold visitor in <1 scroll, shows real trace flow for at least 2 frameworks
- Zero fabricated integration statuses or competitor claims
- Default dashboard view isn't a dead empty state
- 10/10 e2e-verify live

## Resume from here if interrupted
Waiting on background research agent (agentId internal). Nothing built yet — starting with dashboard default view read.
