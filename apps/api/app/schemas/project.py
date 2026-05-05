"""Project schemas"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectCreate(BaseModel):
    """Schema for creating a project"""
    name: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    """Schema for project response"""
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
