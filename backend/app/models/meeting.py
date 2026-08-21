import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from app.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    relationship_id = Column(String, ForeignKey("relationships.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False, index=True)
    time = Column(String, default="", nullable=False)
    location = Column(String, default="", nullable=False)
    notes = Column(Text, default="", nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
