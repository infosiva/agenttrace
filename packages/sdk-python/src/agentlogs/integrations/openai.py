"""OpenAI SDK auto-instrumentation — wraps chat.completions.create to log real step data."""

import time
from typing import Any

from ..models import StepType, TraceStatus
from ..trace import Trace

try:
    import openai  # noqa: F401
except ImportError as e:
    raise ImportError(
        "wrap_openai requires the openai package. Install with: pip install agentlogs[openai]"
    ) from e


def wrap_openai(client: Any, trace: Trace) -> Any:
    """Wrap an OpenAI (or AsyncOpenAI) client so every chat.completions.create call
    is logged as a real step on `trace` — request messages/model/params in, response
    content/usage/finish_reason out.

    Usage:
        trace = await client.create_trace(name="my-agent")
        openai_client = wrap_openai(OpenAI(), trace)
        openai_client.chat.completions.create(...)  # auto-logged
    """
    original_create = client.chat.completions.create
    is_async = _is_coroutine_function(original_create)

    if is_async:
        async def create(*args: Any, **kwargs: Any) -> Any:
            start = time.time()
            try:
                response = await original_create(*args, **kwargs)
            except Exception as error:
                await trace.add_step(**_error_step(kwargs, error, start))
                raise
            await trace.add_step(**_success_step(kwargs, response, start))
            return response
    else:
        def create(*args: Any, **kwargs: Any) -> Any:
            start = time.time()
            try:
                response = original_create(*args, **kwargs)
            except Exception as error:
                _schedule(trace.add_step(**_error_step(kwargs, error, start)))
                raise
            _schedule(trace.add_step(**_success_step(kwargs, response, start)))
            return response

    client.chat.completions.create = create
    return client


def _is_coroutine_function(fn: Any) -> bool:
    import asyncio

    return asyncio.iscoroutinefunction(fn)


def _schedule(coro):
    """Fire an async add_step call from a sync call site."""
    import asyncio

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(coro)
    except RuntimeError:
        asyncio.run(coro)


def _success_step(kwargs: dict, response: Any, start: float) -> dict:
    usage = getattr(response, "usage", None)
    choice = (response.choices or [None])[0] if getattr(response, "choices", None) else None
    return {
        "name": "openai_chat_completion",
        "step_type": StepType.LLM,
        "input": {"model": kwargs.get("model"), "messages": kwargs.get("messages")},
        "output": {
            "content": getattr(choice.message, "content", None) if choice else None,
            "finish_reason": getattr(choice, "finish_reason", None) if choice else None,
        },
        "metadata": {"provider": "openai", "model": getattr(response, "model", kwargs.get("model"))},
        "tokens": getattr(usage, "total_tokens", None) if usage else None,
        "duration_ms": (time.time() - start) * 1000,
        "status": TraceStatus.SUCCESS,
    }


def _error_step(kwargs: dict, error: BaseException, start: float) -> dict:
    return {
        "name": "openai_chat_completion",
        "step_type": StepType.LLM,
        "input": {"model": kwargs.get("model"), "messages": kwargs.get("messages")},
        "metadata": {"provider": "openai"},
        "duration_ms": (time.time() - start) * 1000,
        "status": TraceStatus.ERROR,
        "error_message": str(error),
    }
