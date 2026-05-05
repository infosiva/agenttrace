"""API v1 router"""

from fastapi import APIRouter
from app.api.v1 import traces, projects

api_router = APIRouter()

api_router.include_router(traces.router, prefix="/traces", tags=["traces"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
