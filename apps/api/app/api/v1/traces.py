"""Traces API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Trace, TraceStep
from app.schemas.trace import (
    TraceCreate,
    TraceUpdate,
    TraceResponse,
    TraceStepCreate,
    TraceStepResponse,
)

router = APIRouter()


@router.post("", response_model=TraceResponse, status_code=201)
async def create_trace(
    trace_data: TraceCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new trace"""
    trace = Trace(
        project=trace_data.project,
        name=trace_data.name,
        input_data=trace_data.input_data,
        metadata=trace_data.metadata,
        tags=trace_data.tags or [],
        status="running",
    )

    db.add(trace)
    await db.commit()
    await db.refresh(trace)

    return trace


@router.get("/{trace_id}", response_model=TraceResponse)
async def get_trace(
    trace_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific trace by ID"""
    result = await db.execute(
        select(Trace).where(Trace.id == trace_id)
    )
    trace = result.scalar_one_or_none()

    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    return trace


@router.get("", response_model=List[TraceResponse])
async def list_traces(
    project: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List traces with optional filtering"""
    query = select(Trace)

    if project:
        query = query.where(Trace.project == project)
    if status:
        query = query.where(Trace.status == status)

    query = query.order_by(desc(Trace.started_at)).limit(limit).offset(offset)

    result = await db.execute(query)
    traces = result.scalars().all()

    return traces


@router.patch("/{trace_id}", response_model=TraceResponse)
async def update_trace(
    trace_id: str,
    trace_data: TraceUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a trace (typically to mark as completed)"""
    result = await db.execute(
        select(Trace).where(Trace.id == trace_id)
    )
    trace = result.scalar_one_or_none()

    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    # Update fields
    if trace_data.output_data is not None:
        trace.output_data = trace_data.output_data
    if trace_data.status is not None:
        trace.status = trace_data.status
    if trace_data.error is not None:
        trace.error = trace_data.error
    if trace_data.duration_ms is not None:
        trace.duration_ms = trace_data.duration_ms
        trace.ended_at = datetime.utcnow()
    if trace_data.total_tokens_input is not None:
        trace.total_tokens_input = trace_data.total_tokens_input
    if trace_data.total_tokens_output is not None:
        trace.total_tokens_output = trace_data.total_tokens_output
    if trace_data.total_cost_usd is not None:
        trace.total_cost_usd = trace_data.total_cost_usd

    await db.commit()
    await db.refresh(trace)

    return trace


@router.post("/{trace_id}/steps", response_model=TraceStepResponse, status_code=201)
async def add_trace_step(
    trace_id: str,
    step_data: TraceStepCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a step to a trace"""
    # Verify trace exists
    result = await db.execute(
        select(Trace).where(Trace.id == trace_id)
    )
    trace = result.scalar_one_or_none()

    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    # Create step
    step = TraceStep(
        trace_id=trace_id,
        name=step_data.name,
        type=step_data.type,
        input_data=step_data.input_data,
        output_data=step_data.output_data,
        metadata=step_data.metadata,
        tokens_input=step_data.tokens_input,
        tokens_output=step_data.tokens_output,
        cost_usd=step_data.cost_usd,
        duration_ms=step_data.duration_ms,
        status=step_data.status,
        error=step_data.error,
    )

    # Update trace totals
    if step_data.tokens_input:
        trace.total_tokens_input += step_data.tokens_input
    if step_data.tokens_output:
        trace.total_tokens_output += step_data.tokens_output
    if step_data.cost_usd:
        trace.total_cost_usd += step_data.cost_usd

    db.add(step)
    await db.commit()
    await db.refresh(step)

    return step


@router.get("/{trace_id}/steps", response_model=List[TraceStepResponse])
async def get_trace_steps(
    trace_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all steps for a trace"""
    result = await db.execute(
        select(TraceStep)
        .where(TraceStep.trace_id == trace_id)
        .order_by(TraceStep.started_at)
    )
    steps = result.scalars().all()

    return steps


@router.delete("/{trace_id}", status_code=204)
async def delete_trace(
    trace_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a trace"""
    result = await db.execute(
        select(Trace).where(Trace.id == trace_id)
    )
    trace = result.scalar_one_or_none()

    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    await db.delete(trace)
    await db.commit()

    return None
