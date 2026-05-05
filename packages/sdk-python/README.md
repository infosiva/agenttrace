# AgentTrace Python SDK

Python SDK for tracing AI agents with AgentTrace.

## Installation

```bash
pip install agenttrace-sdk
```

## Quick Start

```python
from agenttrace import AgentTrace, trace_agent
import os

# Initialize the client
trace = AgentTrace(
    api_key=os.getenv("AGENTTRACE_API_KEY"),
    api_url=os.getenv("AGENTTRACE_API_URL", "https://api.agenttrace.io")
)

# Option 1: Use decorator
@trace_agent(project="my-agent")
async def my_agent(query: str):
    response = await llm.generate(query)
    return response

# Option 2: Manual tracing
async def manual_example():
    with trace.start_trace(name="custom-agent") as t:
        t.add_step("reasoning", {"thought": "analyzing query"})
        result = await some_operation()
        t.add_step("response", {"result": result})
        return result
```

## Features

- Automatic tracing with decorators
- Manual step-by-step tracing
- Token and cost tracking
- Error capturing
- Integration with LangChain, OpenAI, Anthropic

## Advanced Usage

### LangChain Integration

```python
from agenttrace.integrations.langchain import TracedLangChain

chain = TracedLangChain(llm_chain, project="my-langchain-app")
result = await chain.run("What is AI?")
```

### Custom Metadata

```python
@trace_agent(project="my-agent", metadata={"version": "1.0", "env": "prod"})
async def my_agent(query: str):
    return await process(query)
```

## Configuration

Set environment variables:

```bash
export AGENTTRACE_API_KEY="your-api-key"
export AGENTTRACE_API_URL="https://api.agenttrace.io"  # optional
```

Or configure in code:

```python
from agenttrace import configure

configure(
    api_key="your-api-key",
    api_url="https://api.agenttrace.io",
    project="default-project"
)
```
