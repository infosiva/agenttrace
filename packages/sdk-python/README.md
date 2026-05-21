# AgentLogs SDK (Python)

Open-source observability for AI agents. Trace every LLM call, tool use, error, and cost.

```bash
pip install agentlogs-sdk
```

## Quickstart

```python
import asyncio
from agentlogs import AgentLogs, StepType

async def main():
    # Reads AGENTLOGS_API_KEY from env, defaults to https://agentlogs.app
    client = AgentLogs()

    async with await client.create_trace(name="research-agent") as trace:
        async with trace.step("search", step_type=StepType.TOOL) as s:
            # ... your tool call
            pass

        await trace.add_step(
            name="gpt-4o",
            step_type=StepType.LLM,
            metadata={"model": "gpt-4o", "provider": "openai"},
            tokens=1234,
            cost=0.012,
        )

asyncio.run(main())
```

## Configuration

```python
from agentlogs import configure

configure(
    api_key="al_...",                  # or set AGENTLOGS_API_KEY
    api_url="https://agentlogs.app",   # default
    project="my-agent",
)
```

Env vars:
- `AGENTLOGS_API_KEY` — get one from https://agentlogs.app/settings
- `AGENTLOGS_API_URL` — override for self-hosted instances
- `AGENTLOGS_PROJECT` — default project name

## Decorator API

```python
from agentlogs import trace_agent

@trace_agent()
async def my_agent(query: str):
    return await llm.generate(query)
```

## Self-hosting

Point the SDK at your own deployment:

```python
configure(api_url="https://logs.your-company.com")
```

## Links

- Website: https://agentlogs.app
- Docs: https://agentlogs.app/docs
- Source: https://github.com/infosiva/agenttrace

MIT licensed.
