"""Projects API endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import Project
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter()


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new project"""
    # Check if project already exists
    result = await db.execute(
        select(Project).where(Project.name == project_data.name)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Project already exists")

    project = Project(
        name=project_data.name,
        description=project_data.description,
    )

    db.add(project)
    await db.commit()
    await db.refresh(project)

    return project


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
):
    """List all projects"""
    result = await db.execute(select(Project))
    projects = result.scalars().all()

    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific project"""
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project
