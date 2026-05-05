"""Trace schemas"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class TraceCreate(BaseModel):
    """Schema for creating a trace"""
    project: str
    name: str
    input_data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class TraceUpdate(BaseModel):
    """Schema for updating a trace"""
    output_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    error: Optional[str] = None
    duration_ms: Optional[float] = None
    total_tokens_input: Optional[int] = None
    total_tokens_output: Optional[int] = None
    total_cost_usd: Optional[float] = None


class TraceStepCreate(BaseModel):
    """Schema for creating a trace step"""
    name: str
    type: str = "custom"
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    tokens_input: Optional[int] = None
    tokens_output: Optional[int] = None
    cost_usd: Optional[float] = None
    duration_ms: Optional[float] = None
    status: str = "success"
    error: Optional[str] = None


class TraceStepResponse(BaseModel):
    """Schema for trace step response"""
    id: str
    trace_id: str
    name: str
    type: str
    input_data: Optional[Dict[str, Any]]
    output_data: Optional[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]]
    tokens_input: Optional[int]
    tokens_output: Optional[int]
    cost_usd: Optional[float]
    started_at: datetime
    ended_at: Optional[datetime]
    duration_ms: Optional[float]
    error: Optional[str]
    status: str

    class Config:
        from_attributes = True


class TraceResponse(BaseModel):
    """Schema for trace response"""
    id: str
    project: str
    name: str
    input_data: Optional[Dict[str, Any]]
    output_data: Optional[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]]
    total_tokens_input: int
    total_tokens_output: int
    total_cost_usd: float
    started_at: datetime
    ended_at: Optional[datetime]
    duration_ms: Optional[float]
    error: Optional[str]
    status: str
    tags: Optional[List[str]]

    class Config:
        from_attributes = True
