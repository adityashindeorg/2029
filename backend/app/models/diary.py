import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from app.database import Base

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    relationship_id = Column(String, ForeignKey("relationships.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    date = Column(String, nullable=False, index=True)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
