"""Data models for AgentLogs SDK — mirror server API contract."""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class TraceStatus(str, Enum):
    RUNNING = "running"
    SUCCESS = "success"
    ERROR = "error"


class StepType(str, Enum):
    LLM = "llm"
    TOOL = "tool"
    FUNCTION = "function"
    OTHER = "other"
    # Back-compat aliases (deprecated):
    LLM_CALL = "llm"
    TOOL_USE = "tool"
    REASONING = "function"
    CUSTOM = "other"


class CreateTraceRequest(BaseModel):
    name: str
    input_data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class UpdateTraceRequest(BaseModel):
    status: Optional[TraceStatus] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = Field(default=None, alias="error_message")
    duration_ms: Optional[float] = None
    total_tokens: Optional[int] = None
    total_cost: Optional[float] = None

    class Config:
        populate_by_name = True


class AddStepRequest(BaseModel):
    name: str
    type: StepType = StepType.OTHER
    status: TraceStatus = TraceStatus.SUCCESS
    input: Optional[Dict[str, Any]] = None
    output: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    tokens: Optional[int] = None
    cost: Optional[float] = None
    duration_ms: Optional[float] = None
    error_message: Optional[str] = None
    sequence: Optional[int] = None
