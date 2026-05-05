"""API Key database model"""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base
import uuid


class APIKey(Base):
    """API Key model for authentication"""

    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key_hash = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    project = Column(String, nullable=False, index=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
