# agenttrace: design / gate record

## Production-ready gate (2026-10-07)
Declared by migration run; file evidence only, exemptions need owner review. Project type: **svc**. Backend/agent/CLI service, no end-user UI.

| # | Item | Status | Evidence / reason |
|---|---|---|---|
| 1 | Design system / theme-loader | N/A | No public UI: Backend/agent/CLI service, no end-user UI. |
| 2 | Hub control (flags, limits, GA4) | N/A | No public site to control. Config via env vars, none hardcoded (secret scan clean). |
| 3 | ai-core use | EXEMPT | No doc upload / RAG / memory feature here; any LLM call goes through the free chain (Ollama>Groq>Gemini>Cerebras). Revisit if a RAG feature is added. |
| 4 | User state | N/A | No end users. |
| 5 | Promo / trial access | N/A | Nothing to unlock; no paid tier. |
| 6 | Monitoring | EXEMPT | No public traffic; logs to stdout/files. Add health endpoint + hub usage log if exposed publicly. |
| 7 | Chatbot + Feedback | N/A | No end-user UI. |
| 8 | Landing / SEO / 404 | N/A | Not a public landing site. |
| 9 | Verify | DONE | node scripts/prod-ready-check-tools.mjs: secret scan, .env ignored+untracked, no hardcoded VPS IP, README present. Push/e2e-verify: n/a until deployed. |
| 10 | UI skill stack | N/A | No UI touched. |
| 11 | Animated demo / logo | N/A | No public product page. |
| 12 | ai-core tenant key | N/A | No ai-core feature (see 3). |
| 13 | Hub access codes | N/A | No gated feature. |
| 14 | Global design library | N/A | No design forks here. |
| 15 | Analytics floor | N/A | No public pages to instrument. |
| 16 | Document upload pipeline | N/A | No document upload feature. |
| 17 | Design pick by scope | N/A | No UI. |
| 18 | AI tooling + Python backend | EXEMPT | Uses existing stack; adopt orchestrator/ai-core when an AI feature is added. |
| 19 | UI stack evidence gate | N/A | No UI code changed. |
| 20 | Showcase-before-update | N/A | No UI/animation change. |

**VPS-IP-WAIVER:** this dir references the VPS IP http://31.97.56.148 as a fallback/default. Owner blocker (see HANDOFF 2026-10-07 #1): ufw only allows 22/80/443 and there is no HTTPS domain/proxy for :3098/:3099/:3100/:3110 yet. Replace with a domain once the proxy exists; do not change runtime defaults before that.
