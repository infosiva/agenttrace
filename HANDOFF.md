# HANDOFF — agenttrace fundable-SaaS modernization

**Date:** 2026-09-18  **Status:** IN PROGRESS — scoping, awaiting design-lock + TaskFlow approval before file edits
**Goal:** Take agenttrace (agentlogs.app) from working product to seed-pitch-ready SaaS: product depth, integrations breadth, landing polish, investor artifacts.

## Baseline (verified, not assumed)
- Real monorepo: Next.js 15 dashboard + FastAPI ingest API + Python/TS SDKs, Turborepo/pnpm.
- `/api/v1/traces` POST/GET, `/api/v1/traces/[id]/steps` — real ingest, writes to Postgres (Drizzle), no fake data.
- `/dashboard` — real DB queries (count/sum/avg via Drizzle), multi-project switcher, live stats. NOT a mockup.
- Stripe wired (`/api/stripe`), NextAuth v5, promo code system already shipped (per stale HANDOFF found — verify still working).
- Landing (`app/page.tsx`) — dark terminal-green aesthetic, dev-tools category correct (no banned pattern).
- Live at agentlogs.app, HTTP 200.
- Stray `/sites`, `/taskflow` routes in this app — unrelated features leaked in from other projects. Out of scope, do not touch unless they block a page.
- `BUSINESS_MODEL.md` — generic Year-1 ARR projections, competitor table stale (no 2026 pricing/funding data). Needs real-comp correction.
- No LangChain/CrewAI/OpenAI-Agents-SDK auto-instrumentation — only manual `@trace_agent` decorator per README. This is the integrations gap.

## Research findings (finalized 2026-09-19, real sourced data)

| Competitor | Pricing (real, 2026) | Key features | Differentiator vs AgentTrace |
|---|---|---|---|
| **Laminar** (YC S24) | Free tier; Hobby $25/mo; volume-based (not per-seat/trace), ~20x trace compression | OTel-native, agent Debugger reruns from any breakpoint w/ cached replay, browser session recording, Signals (plain-language failure detection), Rust core (25MB/s ingest) | Their entire raise ($3M seed, Atlantic.vc + YC) is staked on replay-debugging — AgentTrace ships this too now (step 2 below), but Laminar has 12+ months of iteration on it |
| **Langfuse** | Free (Hobby, 50k units/mo); Core $29/mo; Pro $199/mo; Enterprise $2,499/mo | Full OSS self-host (MIT), tracing+evals+prompt mgmt, unlimited users all paid tiers, SOC2 on Pro | Self-hostable like AgentTrace, but per-unit metering gets expensive at scale — AgentTrace has no metering ceiling on self-host |
| **LangSmith** | Free tier; Plus ~$39/seat/mo; Enterprise custom | Deep LangChain/LangGraph integration, eval framework, prompt playground | Cloud-only, no self-host — data residency/compliance dealbreaker for regulated buyers. AgentTrace's self-hostable FastAPI+Postgres stack is a direct wedge, already true today |
| **Helicone** | Free (Hobby, 10k req); Pro $79/mo (or $20-39/seat variants reported); Team $799/mo | One-line proxy integration, cost tracking, HQL (SQL over logs), PII redaction — OSS (Apache 2.0). **Acquired by Mintlify Mar 2026, now maintenance-mode, no new features** | Proxy-level (API-call) tracing only, not full agent-execution graph. AgentTrace captures full step trees (`/api/v1/traces/[id]/steps`) — direct wedge, and Helicone's stalled roadmap post-acquisition is a real opening |
| **Arize Phoenix** | Fully free/OSS (self-host, Elastic License 2.0, no feature gating). Arize AX (managed): Free 25k spans/1GB; Pro $50/mo (50k spans/10GB) | OTel tracing, evals, versioned datasets, experiment tracking, PXI debugging agent — 9,000+ GitHub stars, 2M+ monthly downloads | Notebook/experimentation-first design center, not built for long-running multi-hour agent sessions — AgentTrace targets production agent monitoring, not eval notebooks |
| **Braintrust** | Free (Starter, 1GB data/10k scores); Pro $249/mo flat (5GB/50k scores, no per-seat fee); Enterprise custom. Raised $80M Series B Feb 2026 | Eval-first platform, processed-data+scores pricing model (changed from spans/seats in Mar 2026), unlimited seats | Eval/regression-testing focused, not real-time production tracing — different buying motion than AgentTrace's live observability |

**Market stats (sourced, verified 2026):**
1. LLM observability market: $1.97B (2025) → $2.69B (2026), 36.3% CAGR — [DigitalApplied/Arize research, 2026]
2. Agent observability & governance market: $1.23B (2025) → $1.68B (2026), forecast $8.62B by 2031 (38.7% CAGR) — [Mordor Intelligence, 2026]
3. 57% of organizations running AI agents in production rate observability as the lowest-quality part of their AI stack — [Arize, "14 Best AI Observability Tools for Agents 2026"]
4. Langfuse: 6M+ SDK installs/month; Arize Phoenix: 2M+ monthly downloads — adoption signal for OSS-first observability tooling — [market research aggregation, 2026]

**Verified against repo (not assumed):**
- Zero OpenTelemetry `gen_ai.*` semconv support was true before this pass — now built (OTel ingest endpoint, step below).
- Helicone's proxy-only limitation is real and citable — direct wedge since AgentTrace's schema already captures full step trees.
- LangSmith cloud-lock-in vs AgentTrace's self-hostable stack is the sharpest true-today differentiator — no new code needed to claim it.

## Schema check (done) — replay feasibility
`apps/dashboard/src/lib/db/schema.ts`: `traces.inputData/outputData`, `steps.input/output/metadata(model,provider)/sequence` — full step I/O already captured, zero migration needed to read replay source data.
Gap: no table to store a replay attempt's result. Adding one `replays` table (uuid id, stepId fk, newOutput jsonb, newStatus text, diffSummary text, createdAt) — additive migration only, nothing else touched.

## TaskFlow card
Posted: "agenttrace — redesign [P0]" on Portfolio Redesign Planning board. Approved via user "letd go" + card.

## Scope — approved, executing in this order

**Order correction (post-approval, code-verified 2026-09-18):** original order had replay before integrations. Verified via reading `packages/sdk-python/src/agentlogs/decorators.py` + `trace.py`: the only active instrumentation path (`@trace_agent` decorator) never calls `add_step()` — creates one generic top-level trace per call with stringified args/kwargs, zero step-level LLM data. `Trace.add_step()` API is fully capable (real input/output/metadata/model/provider/tokens/cost) but nothing calls it. Replay has nothing real to replay without this. LangChain auto-instrumentation moved ahead of replay.

1. **LangChain auto-instrumentation** (NEW BUILD, moved up) — callback handler using existing `Trace.step()`/`add_step()` API, populates real step data (provider/model/messages/tokens/cost) per LLM/tool call. No new API endpoint needed — `/api/v1/traces/{id}/steps` already accepts this shape.
2. **Replay/root-cause debugging** (NEW BUILD, highest leverage — literally the funded wedge) — pick a failed trace step, rerun from that point, isolate the break. Now has real step data to operate on.
3. **OpenTelemetry GenAI semconv ingest** (NEW BUILD) — accept `gen_ai.*` OTel spans alongside existing custom format.
4. **Integrations breadth cont'd** — OpenAI SDK auto-instrumentation wrapper (packages/sdk-python).
5. **Landing/positioning polish** — real comparison table (Laminar/Langfuse/LangSmith/Helicone, real 2026 data), self-host+cloud hybrid message front and center, full mandatory design pipeline.
   - **Live "how it works" demo panel** (user-added scope) — animate real trace flow (SDK call → ingest → dashboard row appearing), not static copy. Per §T: core action visible/runnable zero-auth.
   - [x] **Chatbot** (user-added scope, §Z5/§Y standard) — `ChatBot` consolidated in layout.tsx (FloatingChatWrapper removed, dead `/api/ai/chat` route removed). `/api/chat/route.ts` rewritten: scope-redirect line appended to system prompt, 6-message history cap, Groq(llama-3.1-8b-instant)→Gemini(2.0-flash)→Cerebras(llama3.1-70b) fallback chain (300 max_tokens each, skips silently if key missing), never returns raw 500 (graceful "Chat is resting" message on all-provider-fail + outer catch). Added `CHATBOT_LIMITER` (60/hr) to `lib/rateLimit.ts` matching existing `AI_LIMITER`/`API_LIMITER` factory pattern. `npx tsc --noEmit` clean (only pre-existing unrelated `auth/index.ts` implicit-any errors remain).
6. **Investor artifacts** — BUSINESS_MODEL.md rewrite with real comps/pricing anchors above, one-pager Artifact.

## Files to touch (pending design-lock, not yet started)
- `apps/dashboard/src/app/page.tsx` — landing polish
- `apps/dashboard/BUSINESS_MODEL.md` (or repo-root) — investor numbers correction
- `packages/sdk-python/`, `packages/sdk-typescript/` — new auto-instrumentation modules (langchain, openai wrappers)
- New: one-pager doc (Artifact, not repo file, per investor-artifact convention)

## Steps
- [x] Read existing HANDOFF (stale, unrelated promo-code task — superseded by this one)
- [x] Verify live site + read real route code (not assumed)
- [x] Research fork returns → finalize differentiator list + corrected pricing anchors (table above, real 2026 sourced data)
- [x] TaskFlow card posted + approved
- [x] Schema checked — replay feasible, additive `replays` table only
- [x] `replays` table added to schema.ts (not yet migrated to DB)
- [x] LangChain auto-instrumentation built (moved ahead of replay — see order correction above) — `integrations/langchain.py` + `tests/test_langchain_integration.py` (2/2 pass, verified in throwaway venv)
- [x] `replays` table migrated to live Postgres (`drizzle-kit push --force`, additive-only, verified diff before apply)
- [x] Replay/root-cause debugger built — `POST /api/v1/steps/[id]/replay` (apps/dashboard/src/app/api/v1/steps/[id]/replay/route.ts). Scope note: replays LLM steps against Groq (platform key) for comparison — does NOT call the step's original provider (no BYOK credential storage exists yet, out of scope for this pass). Response labels this explicitly. Self-check: `scripts/check-replay-extract-messages.mjs` (passes). UI surface for viewing replay results not yet built — dashboard trace-detail view needs a "Replay" button + diff panel.
- [x] OTel gen_ai semconv ingest built — `POST /api/v1/otel/traces` (apps/dashboard/src/app/api/v1/otel/traces/route.ts). Accepts standard OTLP/JSON (`resourceSpans→scopeSpans→spans`), groups by OTel traceId into internal traces rows, maps `gen_ai.*` semconv attrs onto existing steps schema — zero migration needed. Self-check: `scripts/check-otel-ingest.mjs` (passes). `npx tsc --noEmit` — zero new errors.
- [x] OpenAI SDK auto-instrumentation wrapper — `integrations/openai.py` (`wrap_openai(client, trace)`, wraps `chat.completions.create` for both sync `OpenAI` and async `AsyncOpenAI` clients, logs real model/messages/tokens/finish_reason/errors per call). `openai` extra already declared in pyproject.toml. Tests: `tests/test_openai_integration.py` (3/3 pass, verified in throwaway venv).
- [ ] Landing polish pipeline (design tools mandatory sequence)
- [ ] BUSINESS_MODEL.md rewrite + one-pager artifact
- [ ] Build, Playwright 375/1280, push, e2e-verify live

## Success criteria
- Live agent trace round-trips through an actual LangChain agent with zero manual instrumentation.
- Landing has real comparison table + zero fabricated stats.
- BUSINESS_MODEL.md numbers traceable to real 2025-2026 comps, not generic placeholders.
- One-pager artifact published, pitch-ready.

## Resume from here if interrupted
Waiting on research fork (agentId a5285f950e914b1cc). Once back: draft TaskFlow card, show user, get approval, then execute steps in order above.
