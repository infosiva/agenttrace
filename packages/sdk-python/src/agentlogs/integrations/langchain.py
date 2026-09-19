"""LangChain auto-instrumentation — captures real per-call step data with zero manual tracing."""

import asyncio
import time
from typing import Any, Dict, List, Optional
from uuid import UUID

from ..models import StepType, TraceStatus
from ..trace import Trace

try:
    from langchain_core.callbacks import BaseCallbackHandler
    from langchain_core.outputs import LLMResult
    from langchain_core.messages import BaseMessage
except ImportError as e:
    raise ImportError(
        "AgentLogsCallbackHandler requires langchain-core. Install with: pip install agentlogs[langchain]"
    ) from e


def _schedule(coro):
    """Fire an async add_step call from LangChain's sync callback hooks."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(coro)
    except RuntimeError:
        asyncio.run(coro)


class AgentLogsCallbackHandler(BaseCallbackHandler):
    """LangChain callback handler that logs each LLM/tool/chain call as a real step.

    Usage:
        trace = await client.create_trace(name="my-agent")
        handler = AgentLogsCallbackHandler(trace)
        llm.invoke(messages, config={"callbacks": [handler]})
    """

    def __init__(self, trace: Trace):
        self.trace = trace
        self._start_times: Dict[UUID, float] = {}
        self._sequence = 0

    def _next_sequence(self) -> int:
        self._sequence += 1
        return self._sequence

    @staticmethod
    def _serialize_messages(messages: List[List["BaseMessage"]]) -> Dict[str, Any]:
        return {
            "messages": [
                [{"role": m.type, "content": m.content} for m in batch]
                for batch in messages
            ]
        }

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], *, run_id: UUID, **kwargs: Any
    ) -> None:
        self._start_times[run_id] = time.time()

    def on_chat_model_start(
        self,
        serialized: Dict[str, Any],
        messages: List[List["BaseMessage"]],
        *,
        run_id: UUID,
        **kwargs: Any,
    ) -> None:
        self._start_times[run_id] = time.time()
        self._pending_input = self._serialize_messages(messages)

    def on_llm_end(self, response: "LLMResult", *, run_id: UUID, **kwargs: Any) -> None:
        duration_ms = (time.time() - self._start_times.pop(run_id, time.time())) * 1000
        model = (response.llm_output or {}).get("model_name")
        token_usage = (response.llm_output or {}).get("token_usage", {}) or {}
        output = {
            "generations": [
                [g.text for g in batch] for batch in response.generations
            ]
        }
        _schedule(
            self.trace.add_step(
                name="llm_call",
                step_type=StepType.LLM,
                input=getattr(self, "_pending_input", None),
                output=output,
                metadata={"model": model, "provider": "langchain"},
                tokens=token_usage.get("total_tokens"),
                duration_ms=duration_ms,
                status=TraceStatus.SUCCESS,
                sequence=self._next_sequence(),
            )
        )

    def on_llm_error(self, error: BaseException, *, run_id: UUID, **kwargs: Any) -> None:
        duration_ms = (time.time() - self._start_times.pop(run_id, time.time())) * 1000
        _schedule(
            self.trace.add_step(
                name="llm_call",
                step_type=StepType.LLM,
                input=getattr(self, "_pending_input", None),
                metadata={"provider": "langchain"},
                duration_ms=duration_ms,
                status=TraceStatus.ERROR,
                error_message=str(error),
                sequence=self._next_sequence(),
            )
        )

    def on_tool_start(
        self, serialized: Dict[str, Any], input_str: str, *, run_id: UUID, **kwargs: Any
    ) -> None:
        self._start_times[run_id] = time.time()
        tool_name = serialized.get("name", "tool")
        self._pending_tool_input = {"input": input_str}
        self._pending_tool_name = tool_name

    def on_tool_end(self, output: Any, *, run_id: UUID, **kwargs: Any) -> None:
        duration_ms = (time.time() - self._start_times.pop(run_id, time.time())) * 1000
        _schedule(
            self.trace.add_step(
                name=getattr(self, "_pending_tool_name", "tool"),
                step_type=StepType.TOOL,
                input=getattr(self, "_pending_tool_input", None),
                output={"output": str(output)},
                duration_ms=duration_ms,
                status=TraceStatus.SUCCESS,
                sequence=self._next_sequence(),
            )
        )

    def on_tool_error(self, error: BaseException, *, run_id: UUID, **kwargs: Any) -> None:
        duration_ms = (time.time() - self._start_times.pop(run_id, time.time())) * 1000
        _schedule(
            self.trace.add_step(
                name=getattr(self, "_pending_tool_name", "tool"),
                step_type=StepType.TOOL,
                input=getattr(self, "_pending_tool_input", None),
                duration_ms=duration_ms,
                status=TraceStatus.ERROR,
                error_message=str(error),
                sequence=self._next_sequence(),
            )
        )
