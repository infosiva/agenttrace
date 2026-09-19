"""Smallest check that AgentLogsCallbackHandler actually records real step data."""

import asyncio
from unittest.mock import AsyncMock

import pytest
from langchain_core.outputs import LLMResult, Generation
from langchain_core.messages import HumanMessage

from agentlogs.integrations.langchain import AgentLogsCallbackHandler
from agentlogs.models import StepType, TraceStatus


@pytest.mark.asyncio
async def test_llm_call_records_real_step_data():
    trace = AsyncMock()
    handler = AgentLogsCallbackHandler(trace)

    run_id = "11111111-1111-1111-1111-111111111111"
    handler.on_chat_model_start(
        {}, [[HumanMessage(content="hi")]], run_id=run_id
    )
    handler.on_llm_end(
        LLMResult(
            generations=[[Generation(text="hello back")]],
            llm_output={"model_name": "gpt-4o-mini", "token_usage": {"total_tokens": 12}},
        ),
        run_id=run_id,
    )

    await asyncio.sleep(0)  # let the scheduled task run

    trace.add_step.assert_awaited_once()
    _, kwargs = trace.add_step.call_args
    assert kwargs["step_type"] == StepType.LLM
    assert kwargs["status"] == TraceStatus.SUCCESS
    assert kwargs["metadata"]["model"] == "gpt-4o-mini"
    assert kwargs["tokens"] == 12
    assert kwargs["input"]["messages"][0][0]["content"] == "hi"
    assert kwargs["output"]["generations"] == [["hello back"]]


@pytest.mark.asyncio
async def test_llm_error_records_error_step():
    trace = AsyncMock()
    handler = AgentLogsCallbackHandler(trace)

    run_id = "22222222-2222-2222-2222-222222222222"
    handler.on_llm_start({}, ["hi"], run_id=run_id)
    handler.on_llm_error(RuntimeError("rate limited"), run_id=run_id)

    await asyncio.sleep(0)

    trace.add_step.assert_awaited_once()
    _, kwargs = trace.add_step.call_args
    assert kwargs["status"] == TraceStatus.ERROR
    assert kwargs["error_message"] == "rate limited"
