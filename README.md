# AgentTrace.io

> AI Agent Observability Platform - Trace, debug, and monitor AI agents in production

## What is AgentTrace?

AgentTrace is an **AI Agent Observability Platform** that helps developers understand what their AI agents are doing in production.

**How it works**:
1. You host AgentTrace (dashboard + API) on your infrastructure
2. Developers install your SDK in their agent projects
3. SDK sends traces to your hosted AgentTrace API
4. Developers view traces in your multi-tenant dashboard

**Features**:
- Multi-step reasoning chains
- Token usage and costs
- Error patterns and failures
- Performance bottlenecks
- Real-time execution traces

**Deployment Options**:
- **SaaS Model**: Host on Vercel + Railway, charge $49-499/month per team
- **Open Source**: Let developers self-host for free
- **Hybrid**: Free self-hosted + premium managed version

## Features

- **Real-time Tracing**: Watch your agents think in real-time
- **Multi-Framework Support**: Works with LangChain, CrewAI, AutoGPT, or custom agents
- **Cost Analytics**: Track token usage and API costs across all your agents
- **Error Detection**: Automatically identify and categorize agent failures
- **Team Collaboration**: Share traces and debug sessions with your team

## Quick Start

### Install the SDK

```bash
# Python
pip install agenttrace-sdk

# TypeScript/JavaScript (coming soon)
npm install @agenttrace/sdk
```

### Instrument Your Agent

```python
from agenttrace import trace_agent

@trace_agent(project="my-agent")
async def my_agent(query: str):
    # Your agent logic here
    response = await llm.generate(query)
    return response
```

### View in Dashboard

Navigate to [http://localhost:3000](http://localhost:3000) to see your traces.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   SDK       │────▶│   API       │────▶│  Database    │
│ (Py/TS/JS)  │     │  (FastAPI)  │     │ (PostgreSQL) │
└─────────────┘     └─────────────┘     └──────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Dashboard  │
                    │  (Next.js)  │
                    └─────────────┘
```

## Development

This is a monorepo managed with Turborepo and pnpm.

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Build all apps
pnpm build
```

## Project Structure

```
agenttrace/
├── apps/
│   ├── dashboard/      # Next.js dashboard
│   └── api/            # FastAPI backend
├── packages/
│   ├── sdk-python/     # Python SDK
│   ├── sdk-typescript/ # TypeScript/JS SDK
│   ├── database/       # Database schemas
│   └── ui/             # Shared UI components
└── docs/               # Documentation
```

## License

MIT

## Domain

Suggested domain: **agenttrace.io**

Check availability at [Namecheap](https://www.namecheap.com) or [Cloudflare Domains](https://www.cloudflare.com/products/registrar/)
