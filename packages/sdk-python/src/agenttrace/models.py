"""Data models for AgentTrace"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class TraceStatus(str, Enum):
    """Status of a trace"""
    RUNNING = "running"
    SUCCESS = "success"
    ERROR = "error"


class StepType(str, Enum):
    """Type of trace step"""
    LLM_CALL = "llm_call"
    TOOL_USE = "tool_use"
    REASONING = "reasoning"
    CUSTOM = "custom"


class TraceStepData(BaseModel):
    """Data for a single step in a trace"""

    id: str = Field(description="Unique step ID")
    trace_id: str = Field(description="Parent trace ID")
    name: str = Field(description="Step name")
    type: StepType = Field(default=StepType.CUSTOM)

    input_data: Optional[Dict[str, Any]] = Field(default=None)
    output_data: Optional[Dict[str, Any]] = Field(default=None)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    tokens_input: Optional[int] = Field(default=None)
    tokens_output: Optional[int] = Field(default=None)
    cost_usd: Optional[float] = Field(default=None)

    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = Field(default=None)
    duration_ms: Optional[float] = Field(default=None)

    error: Optional[str] = Field(default=None)
    status: TraceStatus = Field(default=TraceStatus.RUNNING)


class TraceData(BaseModel):
    """Data for a complete trace"""

    id: str = Field(description="Unique trace ID")
    project: str = Field(description="Project name")
    name: str = Field(description="Agent/trace name")

    input_data: Optional[Dict[str, Any]] = Field(default=None)
    output_data: Optional[Dict[str, Any]] = Field(default=None)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    steps: List[TraceStepData] = Field(default_factory=list)

    total_tokens_input: int = Field(default=0)
    total_tokens_output: int = Field(default=0)
    total_cost_usd: float = Field(default=0.0)

    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = Field(default=None)
    duration_ms: Optional[float] = Field(default=None)

    error: Optional[str] = Field(default=None)
    status: TraceStatus = Field(default=TraceStatus.RUNNING)

    tags: List[str] = Field(default_factory=list)


class CreateTraceRequest(BaseModel):
    """Request to create a new trace"""
    project: str
    name: str
    input_data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class UpdateTraceRequest(BaseModel):
    """Request to update a trace"""
    output_data: Optional[Dict[str, Any]] = None
    status: Optional[TraceStatus] = None
    error: Optional[str] = None
    duration_ms: Optional[float] = None
    total_tokens_input: Optional[int] = None
    total_tokens_output: Optional[int] = None
    total_cost_usd: Optional[float] = None


class AddStepRequest(BaseModel):
    """Request to add a step to a trace"""
    name: str
    type: StepType = StepType.CUSTOM
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    tokens_input: Optional[int] = None
    tokens_output: Optional[int] = None
    cost_usd: Optional[float] = None
    duration_ms: Optional[float] = None
    status: TraceStatus = TraceStatus.SUCCESS
    error: Optional[str] = None
