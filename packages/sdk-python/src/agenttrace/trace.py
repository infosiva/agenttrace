"""Trace context management"""

import time
from typing import Optional, Dict, Any, TYPE_CHECKING
from contextlib import asynccontextmanager
from .models import AddStepRequest, UpdateTraceRequest, TraceStatus, StepType

if TYPE_CHECKING:
    from .client import AgentTrace


class TraceStep:
    """Represents a single step in a trace"""

    def __init__(
        self,
        trace: "Trace",
        name: str,
        step_type: StepType = StepType.CUSTOM,
    ):
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
                name=self.name,
                step_type=self.step_type,
                status=TraceStatus.ERROR,
                error=str(exc_val),
                duration_ms=duration_ms,
            )
        else:
            await self.trace.add_step(
                name=self.name,
                step_type=self.step_type,
                status=TraceStatus.SUCCESS,
                duration_ms=duration_ms,
            )


class Trace:
    """Represents a trace context for an agent execution"""

    def __init__(
        self,
        client: "AgentTrace",
        trace_id: str,
        name: str,
        project: str,
    ):
        self.client = client
        self.trace_id = trace_id
        self.name = name
        self.project = project
        self.start_time = time.time()
        self._completed = False

    @asynccontextmanager
    async def step(
        self,
        name: str,
        step_type: StepType = StepType.CUSTOM,
    ):
        """Create a traced step context

        Usage:
            async with trace.step("reasoning") as step:
                result = await do_something()
        """
        step = TraceStep(self, name, step_type)
        try:
            yield step
        finally:
            pass  # Exit handled by TraceStep.__aexit__

    async def add_step(
        self,
        name: str,
        step_type: StepType = StepType.CUSTOM,
        input_data: Optional[Dict[str, Any]] = None,
        output_data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tokens_input: Optional[int] = None,
        tokens_output: Optional[int] = None,
        cost_usd: Optional[float] = None,
        duration_ms: Optional[float] = None,
        status: TraceStatus = TraceStatus.SUCCESS,
        error: Optional[str] = None,
    ):
        """Add a step to the trace

        Args:
            name: Step name
            step_type: Type of step (llm_call, tool_use, reasoning, custom)
            input_data: Input data for the step
            output_data: Output data from the step
            metadata: Additional metadata
            tokens_input: Number of input tokens used
            tokens_output: Number of output tokens generated
            cost_usd: Cost in USD
            duration_ms: Duration in milliseconds
            status: Step status
            error: Error message if failed
        """
        if not self.client.config.enabled or self.trace_id in ("disabled", "error"):
            return

        request = AddStepRequest(
            name=name,
            type=step_type,
            input_data=input_data,
            output_data=output_data,
            metadata=metadata,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            cost_usd=cost_usd,
            duration_ms=duration_ms,
            status=status,
            error=error,
        )

        try:
            response = await self.client.client.post(
                f"/v1/traces/{self.trace_id}/steps",
                json=request.model_dump(exclude_none=True),
            )
            response.raise_for_status()
        except Exception as e:
            print(f"AgentTrace error: Failed to add step: {e}")

    async def complete(
        self,
        output_data: Optional[Dict[str, Any]] = None,
        status: TraceStatus = TraceStatus.SUCCESS,
        error: Optional[str] = None,
    ):
        """Complete the trace

        Args:
            output_data: Final output data
            status: Final status
            error: Error message if failed
        """
        if self._completed or not self.client.config.enabled or self.trace_id in ("disabled", "error"):
            return

        duration_ms = (time.time() - self.start_time) * 1000

        request = UpdateTraceRequest(
            output_data=output_data,
            status=status,
            error=error,
            duration_ms=duration_ms,
        )

        try:
            response = await self.client.client.patch(
                f"/v1/traces/{self.trace_id}",
                json=request.model_dump(exclude_none=True),
            )
            response.raise_for_status()
            self._completed = True
        except Exception as e:
            print(f"AgentTrace error: Failed to complete trace: {e}")

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            await self.complete(status=TraceStatus.ERROR, error=str(exc_val))
        else:
            await self.complete(status=TraceStatus.SUCCESS)
