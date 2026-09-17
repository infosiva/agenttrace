# HANDOFF — agenttrace promo code system

**Status:** IN PROGRESS — 2026-09-17. Autonomous portfolio gap-fix sweep (user: "dont wait for me to say if there is gap lets getfixed and pushed").

## Gap found
Re-audit of agenttrace (`apps/dashboard`) confirmed no promo-code system exists — no `lib/promoCode.ts`, no `api/promo` route, no promo UI. All other §R/§Z5/§D monetization items (chatbot, feedback, AdSense) already present and verified. Project is a genuine Stripe-based paid SaaS (Free/Pro/Self-host tiers per `src/app/pricing/page.tsx`) — promo code should unlock a timed Pro trial, same pattern as draftcal/trackwealth/roamplan/nammatamil.

## Plan
1. `src/lib/promoCode.ts` — canonical §R pattern: `PROMO_CODES` env var (JSON array of `{code, daysUnlocked, feature}`), `getPromoCodes()`, `validatePromoCode()`.
2. `src/app/api/promo/route.ts` — POST endpoint, validates code, sets `promo_unlocked` cookie (JSON: `{daysUnlocked, activatedAt}`, maxAge = daysUnlocked*86400).
3. `src/hooks/usePromo.ts` — client hook reading the cookie, computing `isUnlocked`/`daysLeft`.
4. Wire into `src/app/pricing/page.tsx` — small promo code input under Pro tier; on success shows "Pro trial active, N days left" banner.
5. Build, Playwright screenshots (375px + 1280px), push to infosiva-scoped Vercel, E2E-verify against agentlogs.app.

## Reference implementation
`draftcal/src/lib/promoCode.ts` + `draftcal/src/app/api/promo/route.ts` + `draftcal/src/hooks/usePromo.ts` — canonical pattern, reused verbatim with agenttrace's cookie name/paths adjusted only if needed.

## Not in scope
- flighttracker (separate, larger remediation — all of promo/chat/feedback/adsense missing — tracked separately)
- resumevault chatwidget — false negative, already fully wired via `ChatBot` component, no fix needed
- auditpilot / ai-platform-template — unmodified `create-next-app` scaffolds, never deployed, exempt from monetization gates
