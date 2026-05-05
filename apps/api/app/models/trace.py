"""Trace database models"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Trace(Base):
    """Trace model"""

    __tablename__ = "traces"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)

    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)

    total_tokens_input = Column(Integer, default=0)
    total_tokens_output = Column(Integer, default=0)
    total_cost_usd = Column(Float, default=0.0)

    started_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Float, nullable=True)

    error = Column(Text, nullable=True)
    status = Column(String, default="running", index=True)

    tags = Column(JSON, nullable=True)

    # Relationships
    steps = relationship("TraceStep", back_populates="trace", cascade="all, delete-orphan")

    # Indexes for common queries
    __table_args__ = (
        Index("idx_project_started", "project", "started_at"),
        Index("idx_project_status", "project", "status"),
    )


class TraceStep(Base):
    """Trace step model"""

    __tablename__ = "trace_steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String, ForeignKey("traces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    type = Column(String, default="custom")

    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)

    tokens_input = Column(Integer, nullable=True)
    tokens_output = Column(Integer, nullable=True)
    cost_usd = Column(Float, nullable=True)

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Float, nullable=True)

    error = Column(Text, nullable=True)
    status = Column(String, default="running")

    # Relationships
    trace = relationship("Trace", back_populates="steps")
