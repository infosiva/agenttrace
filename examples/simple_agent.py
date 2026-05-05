"""
Simple example showing how to use AgentTrace to trace an AI agent

This example shows:
1. Basic tracing with decorator
2. Manual step-by-step tracing
3. Error handling
"""

import asyncio
import os
import sys

# Add parent directory to path for local development
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../packages/sdk-python/src"))

from agenttrace import AgentTrace, trace_agent, configure
from agenttrace.models import StepType, TraceStatus


# Configure AgentTrace
configure(
    api_key="demo-key",  # In production, use environment variable
    api_url="http://localhost:8000/v1",
    project="demo-project",
)


# Example 1: Using decorator for automatic tracing
@trace_agent(project="simple-agent", name="greeting-agent")
async def greeting_agent(name: str) -> str:
    """A simple agent that generates a greeting"""
    await asyncio.sleep(0.5)  # Simulate processing
    return f"Hello, {name}! Welcome to AgentTrace."


# Example 2: Manual tracing with steps
async def analysis_agent(query: str) -> dict:
    """An agent that analyzes a query with multiple steps"""

    async with AgentTrace() as client:
        # Create trace
        trace = await client.create_trace(
            name="analysis-agent",
            input_data={"query": query},
            metadata={"version": "1.0", "env": "demo"},
            tags=["analysis", "demo"],
        )

        try:
            # Step 1: Understanding
            async with trace.step("understanding", StepType.REASONING):
                await asyncio.sleep(0.3)
                await trace.add_step(
                    name="understanding",
                    step_type=StepType.REASONING,
                    input_data={"query": query},
                    output_data={"intent": "information_request"},
                    duration_ms=300,
                )

            # Step 2: Research
            async with trace.step("research", StepType.TOOL_USE):
                await asyncio.sleep(0.5)
                await trace.add_step(
                    name="research",
                    step_type=StepType.TOOL_USE,
                    input_data={"search_query": query},
                    output_data={"results": ["result1", "result2"]},
                    duration_ms=500,
                )

            # Step 3: Response generation (simulated LLM call)
            async with trace.step("generation", StepType.LLM_CALL):
                await asyncio.sleep(0.4)
                result = {
                    "answer": f"Based on your query '{query}', here's what I found...",
                    "confidence": 0.95,
                }
                await trace.add_step(
                    name="generation",
                    step_type=StepType.LLM_CALL,
                    input_data={"prompt": query},
                    output_data=result,
                    tokens_input=50,
                    tokens_output=120,
                    cost_usd=0.0024,
                    duration_ms=400,
                )

            # Complete trace
            await trace.complete(
                output_data=result,
                status=TraceStatus.SUCCESS,
            )

            return result

        except Exception as e:
            # Complete trace with error
            await trace.complete(
                status=TraceStatus.ERROR,
                error=str(e),
            )
            raise


# Example 3: Error handling
@trace_agent(project="simple-agent", name="error-agent")
async def error_agent(should_fail: bool) -> str:
    """An agent that demonstrates error tracing"""
    if should_fail:
        raise ValueError("Intentional error for demo purposes")
    return "Success!"


async def main():
    """Run all examples"""

    print("🚀 AgentTrace Demo\n")
    print("=" * 50)

    # Example 1: Simple greeting agent
    print("\n1. Running greeting agent...")
    result = await greeting_agent("Alice")
    print(f"   Result: {result}")

    # Example 2: Multi-step analysis agent
    print("\n2. Running analysis agent...")
    result = await analysis_agent("What is AI agent observability?")
    print(f"   Result: {result['answer'][:60]}...")

    # Example 3: Success case
    print("\n3. Running error agent (success case)...")
    result = await error_agent(should_fail=False)
    print(f"   Result: {result}")

    # Example 4: Error case
    print("\n4. Running error agent (error case)...")
    try:
        await error_agent(should_fail=True)
    except ValueError as e:
        print(f"   Caught error: {e}")

    print("\n" + "=" * 50)
    print("\n✅ All examples completed!")
    print("\nView your traces at: http://localhost:3000/dashboard")
    print("\nAPI docs at: http://localhost:8000/docs")


if __name__ == "__main__":
    asyncio.run(main())
