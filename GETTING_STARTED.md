# Getting Started with AgentTrace

Welcome to **AgentTrace** - the AI Agent Observability Platform! This guide will help you get up and running quickly.

## What You're Building

AgentTrace is a platform that lets developers trace and debug their AI agents in production. Think of it as "Sentry for AI Agents" or "Datadog for LLMs".

## Prerequisites

- **Node.js** 20+ and **pnpm** 9+
- **Python** 3.9+
- **Docker** and **Docker Compose** (for local development)
- **PostgreSQL** 14+ (or use Docker)

## Quick Start (5 minutes)

### 1. Clone and Setup

```bash
cd /Users/sivaprakasam/projects/agents/agenttrace

# Install dependencies
pnpm install

# Install Python SDK dependencies
cd packages/sdk-python
pip install -e .
cd ../..
```

### 2. Start Infrastructure with Docker

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready (takes ~10 seconds)
docker-compose ps
```

### 3. Initialize Database

```bash
cd apps/api

# Create database tables
python -c "
from app.database import engine, Base
from app.models import Trace, TraceStep, Project, APIKey
import asyncio

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✅ Database initialized!')

asyncio.run(init_db())
"

cd ../..
```

### 4. Start the API

```bash
cd apps/api

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/agenttrace"
export REDIS_URL="redis://localhost:6379/0"

# Start API server
uvicorn app.main:app --reload

# API will be available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 5. Start the Dashboard

In a new terminal:

```bash
cd apps/dashboard

# Install dependencies
pnpm install

# Start dashboard
pnpm dev

# Dashboard will be available at http://localhost:3000
```

### 6. Run Example Agent

In a new terminal:

```bash
cd examples

# Install dependencies
pip install -r requirements.txt

# Run the example
python simple_agent.py
```

### 7. View Traces

Open your browser:
- **Dashboard**: http://localhost:3000/dashboard
- **API Docs**: http://localhost:8000/docs

You should see traces from the example agent!

## Project Structure

```
agenttrace/
├── apps/
│   ├── dashboard/          # Next.js dashboard (TypeScript)
│   └── api/                # FastAPI backend (Python)
├── packages/
│   ├── sdk-python/         # Python SDK for tracing
│   ├── sdk-typescript/     # TypeScript/JS SDK (coming soon)
│   ├── database/           # Shared database schemas
│   └── ui/                 # Shared UI components
├── examples/               # Example agents
└── docs/                   # Documentation
```

## Next Steps

1. **Instrument Your Own Agent**
   - See `examples/simple_agent.py` for examples
   - Read the Python SDK docs in `packages/sdk-python/README.md`

2. **Customize the Dashboard**
   - Modify `apps/dashboard/src/app/dashboard/page.tsx`
   - Add new visualization components

3. **Deploy to Production**
   - See `DEPLOYMENT.md` for deployment guides
   - Configure environment variables
   - Set up proper authentication

4. **Integrate with Your Stack**
   - LangChain integration (coming soon)
   - OpenAI integration (coming soon)
   - Custom integrations

## Common Issues

### Database Connection Error

If you see `database "agenttrace" does not exist`:

```bash
docker-compose exec postgres createdb -U postgres agenttrace
```

### Port Already in Use

If port 3000, 8000, 5432, or 6379 is already in use:

```bash
# Stop existing services
docker-compose down

# Or change ports in docker-compose.yml
```

### Python Import Errors

Make sure you installed the SDK:

```bash
cd packages/sdk-python
pip install -e .
```

## Development Workflow

### Making Changes

1. **Frontend changes**: Edit files in `apps/dashboard/src/`, hot-reload is enabled
2. **Backend changes**: Edit files in `apps/api/app/`, auto-reload is enabled
3. **SDK changes**: Edit files in `packages/sdk-python/src/`

### Running Tests

```bash
# Python tests
cd apps/api
pytest

# TypeScript tests
cd apps/dashboard
pnpm test
```

### Code Formatting

```bash
# Format Python code
cd apps/api
black .
ruff check .

# Format TypeScript code
cd apps/dashboard
pnpm format
```

## Need Help?

- 📖 Read the full documentation in `/docs`
- 🐛 Report issues on GitHub
- 💬 Join our Discord community (coming soon)

## What's Next?

Check out `DEPLOYMENT.md` to learn how to:
- Deploy to production
- Set up authentication
- Configure monitoring
- Scale the platform
