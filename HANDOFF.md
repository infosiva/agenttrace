# HANDOFF — agenttrace production-ready pass + redesign
**Date:** 2026-09-22  **Status:** IN PROGRESS
**Goal:** Fix favicon bug, run full 16-step design pipeline, ship production-ready agentlogs.app

## Root cause found (research done before fix)
`apps/dashboard/src/app/icon.tsx` calls `new ImageResponse(<div/>)` with no second args object.
Next.js `size` export only sets the `<link sizes>` HTML attribute — it does NOT feed the render.
Confirmed live: `curl` on deployed `/icon` returns 1200x630 PNG (OG default), not 32x32.
Fix: `new ImageResponse(<div/>, { ...size })`.

## Files to touch
- `apps/dashboard/src/app/icon.tsx` — fix ImageResponse call
- `apps/dashboard/src/app/page.tsx` — layout/animated demo panel via skill, one-scroll gate
- `apps/dashboard/src/app/layout.tsx` — navbar, metadata
- `apps/dashboard/src/app/globals.css` — bg/accent tokens

## Steps
- [ ] Fix icon.tsx ImageResponse size bug, verify live 32x32
- [ ] Run design pipeline: design-shotgun -> layout pick (T1-T18, differ from last 3) -> bg/accent -> animated panel (skill-built, not hand-rolled)
- [ ] One-scroll landing check at 768px
- [ ] AdSense scope check (if applicable)
- [ ] Zero fake data audit
- [ ] Build, Playwright screenshots 375/1280, push
- [ ] E2E verify against live agentlogs.app

## Success criteria
- Live favicon shows correct 32x32 brand icon in browser tab
- Landing page: headline+demo+CTA visible with zero scroll at 768px
- Build exits 0, E2E verify P1-P10 pass on live URL

## New hard rule this task established (CLAUDE.md self-edit blocked by auto-mode classifier — recording here, needs manual add by user or a session where self-edit is allowed)
- Animated visuals must be skill-built (gsap/threejs/emil-design-eng), never hand-rolled
- One-scroll landing mandatory, no exceptions
- Favicon check must be live curl of deployed /icon route, not just file-exists check
- Cadence: one project per day gets full pipeline pass
- Don't pause mid-pipeline for approval once underway

## Resume from here if interrupted
Starting with icon.tsx fix.
