"""Smallest check that wrap_openai actually records real step data."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from agentlogs.integrations.openai import wrap_openai
from agentlogs.models import StepType, TraceStatus


def _fake_response(content="hello back", model="gpt-4o-mini", total_tokens=12, finish_reason="stop"):
    return SimpleNamespace(
        model=model,
        usage=SimpleNamespace(total_tokens=total_tokens),
        choices=[SimpleNamespace(message=SimpleNamespace(content=content), finish_reason=finish_reason)],
    )


def _client_with(create_fn):
    return SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create_fn)))


@pytest.mark.asyncio
async def test_sync_create_records_real_step_data():
    trace = AsyncMock()
    client = _client_with(lambda **kwargs: _fake_response())
    wrapped = wrap_openai(client, trace)

    result = wrapped.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": "hi"}])
    await asyncio.sleep(0)  # let the scheduled task run

    assert result.choices[0].message.content == "hello back"
    trace.add_step.assert_awaited_once()
    _, kwargs = trace.add_step.call_args
    assert kwargs["step_type"] == StepType.LLM
    assert kwargs["status"] == TraceStatus.SUCCESS
    assert kwargs["metadata"]["model"] == "gpt-4o-mini"
    assert kwargs["tokens"] == 12
    assert kwargs["input"]["messages"][0]["content"] == "hi"
    assert kwargs["output"]["content"] == "hello back"
    assert kwargs["output"]["finish_reason"] == "stop"


@pytest.mark.asyncio
async def test_sync_create_error_records_error_step():
    trace = AsyncMock()

    def raise_error(**kwargs):
        raise RuntimeError("rate limited")

    client = _client_with(raise_error)
    wrapped = wrap_openai(client, trace)

    with pytest.raises(RuntimeError):
        wrapped.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": "hi"}])
    await asyncio.sleep(0)

    trace.add_step.assert_awaited_once()
    _, kwargs = trace.add_step.call_args
    assert kwargs["status"] == TraceStatus.ERROR
    assert kwargs["error_message"] == "rate limited"


@pytest.mark.asyncio
async def test_async_create_records_real_step_data():
    trace = AsyncMock()

    async def create(**kwargs):
        return _fake_response(content="async hi back", total_tokens=7)

    client = _client_with(create)
    wrapped = wrap_openai(client, trace)

    result = await wrapped.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": "yo"}])

    assert result.choices[0].message.content == "async hi back"
    trace.add_step.assert_awaited_once()
    _, kwargs = trace.add_step.call_args
    assert kwargs["status"] == TraceStatus.SUCCESS
    assert kwargs["tokens"] == 7
    assert kwargs["input"]["messages"][0]["content"] == "yo"
