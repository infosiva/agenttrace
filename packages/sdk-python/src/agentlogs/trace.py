"""Trace context management."""

import time
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, TYPE_CHECKING

from .models import AddStepRequest, UpdateTraceRequest, TraceStatus, StepType

if TYPE_CHECKING:
    from .client import AgentLogs


class TraceStep:
    """Context manager for a single step inside a trace."""

    def __init__(self, trace: "Trace", name: str, step_type: StepType = StepType.OTHER):
        self.trace = trace
        self.name = name
        self.step_type = step_type
        self.start_time = time.time()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (time.time() - self.start_time) * 1000
        if exc_type is not None:
            await self.trace.add_step(
                name=self.name, step_type=self.step_type,
                status=TraceStatus.ERROR, error_message=str(exc_val), duration_ms=duration_ms,
            )
        else:
            await self.trace.add_step(
                name=self.name, step_type=self.step_type,
                status=TraceStatus.SUCCESS, duration_ms=duration_ms,
            )


class Trace:
    """A trace context for one agent execution run."""

    def __init__(self, client: "AgentLogs", trace_id: str, name: str, project: str):
        self.client = client
        self.trace_id = trace_id
        self.name = name
        self.project = project
        self.start_time = time.time()
        self._completed = False

    @asynccontextmanager
    async def step(self, name: str, step_type: StepType = StepType.OTHER):
        """Open a step context. Records on exit with success/error status."""
        s = TraceStep(self, name, step_type)
        try:
            yield s
        finally:
            pass  # exit handled by TraceStep.__aexit__

    async def add_step(
        self,
        name: str,
        step_type: StepType = StepType.OTHER,
        input: Optional[Dict[str, Any]] = None,
        output: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tokens: Optional[int] = None,
        cost: Optional[float] = None,
        duration_ms: Optional[float] = None,
        status: TraceStatus = TraceStatus.SUCCESS,
        error_message: Optional[str] = None,
        sequence: Optional[int] = None,
    ):
        """Append a step to this trace.

        Args:
            name: Step name (e.g. "openai_call", "search_tool")
            step_type: llm | tool | function | other
            input: Step inputs (any JSON-serializable dict)
            output: Step outputs
            metadata: Free-form metadata (model name, provider, etc.)
            tokens: Total tokens consumed
            cost: Cost in USD
            duration_ms: Step duration in milliseconds
            status: success | error
            error_message: Error message if status=error
            sequence: Optional ordering hint
        """
        if not self.client.config.enabled or self.trace_id in ("disabled", "error"):
            return

        request = AddStepRequest(
            name=name, type=step_type, status=status,
            input=input, output=output, metadata=metadata,
            tokens=tokens, cost=cost, duration_ms=duration_ms,
            error_message=error_message, sequence=sequence,
        )

        try:
            response = await self.client.client.post(
                f"/api/v1/traces/{self.trace_id}/steps",
                json=request.model_dump(exclude_none=True, by_alias=True),
            )
            response.raise_for_status()
        except Exception as e:
            print(f"AgentLogs error: Failed to add step: {e}")

    async def complete(
        self,
        output_data: Optional[Dict[str, Any]] = None,
        status: TraceStatus = TraceStatus.SUCCESS,
        error_message: Optional[str] = None,
        total_tokens: Optional[int] = None,
        total_cost: Optional[float] = None,
    ):
        """Finalize the trace.

        Args:
            output_data: Final output payload
            status: success | error
            error_message: Error message if status=error
            total_tokens: Aggregate tokens for the run
            total_cost: Aggregate cost in USD
        """
        if self._completed or not self.client.config.enabled or self.trace_id in ("disabled", "error"):
            return

        duration_ms = (time.time() - self.start_time) * 1000

        request = UpdateTraceRequest(
            status=status,
            output_data=output_data,
            error_message=error_message,
            duration_ms=duration_ms,
            total_tokens=total_tokens,
            total_cost=total_cost,
        )

        try:
            response = await self.client.client.patch(
                f"/api/v1/traces/{self.trace_id}",
                json=request.model_dump(exclude_none=True, by_alias=True),
            )
            response.raise_for_status()
            self._completed = True
        except Exception as e:
            print(f"AgentLogs error: Failed to complete trace: {e}")

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            await self.complete(status=TraceStatus.ERROR, error_message=str(exc_val))
        else:
            await self.complete(status=TraceStatus.SUCCESS)
