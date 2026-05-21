"""Decorators for automatic tracing"""

import functools
from typing import Optional, Dict, Any, Callable, TypeVar, ParamSpec
from .client import AgentLogs
from .models import TraceStatus

P = ParamSpec("P")
R = TypeVar("R")


def trace_agent(
    project: Optional[str] = None,
    name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    client: Optional[AgentLogs] = None,
) -> Callable[[Callable[P, R]], Callable[P, R]]:
    """Decorator to automatically trace an agent function

    Usage:
        @trace_agent(project="my-project")
        async def my_agent(query: str):
            return await llm.generate(query)

    Args:
        project: Project name (defaults to configured project)
        name: Agent name (defaults to function name)
        metadata: Additional metadata to attach to trace
        client: Custom AgentLogs client (creates default if not provided)
    """

    def decorator(func: Callable[P, R]) -> Callable[P, R]:
        agent_name = name or func.__name__

        @functools.wraps(func)
        async def async_wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            nonlocal client
            if client is None:
                client = AgentLogs()

            # Prepare input data
            input_data = {
                "args": [str(arg) for arg in args],
                "kwargs": {k: str(v) for k, v in kwargs.items()},
            }

            # Create trace
            trace = await client.create_trace(
                name=agent_name,
                project=project,
                input_data=input_data,
                metadata=metadata,
            )

            try:
                # Execute function
                result = await func(*args, **kwargs)

                # Complete trace
                await trace.complete(
                    output_data={"result": str(result)},
                    status=TraceStatus.SUCCESS,
                )

                return result
            except Exception as e:
                # Complete trace with error
                await trace.complete(
                    status=TraceStatus.ERROR,
                    error_message=str(e),
                )
                raise

        @functools.wraps(func)
        def sync_wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            raise NotImplementedError(
                "trace_agent currently only supports async functions. "
                "Please make your function async or use manual tracing."
            )

        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper  # type: ignore
        else:
            return sync_wrapper  # type: ignore

    return decorator
