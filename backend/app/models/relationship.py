from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.database import Base

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(String, primary_key=True, default="default_relationship")
    partner1_id = Column(String, ForeignKey("users.id"), nullable=True)
    partner2_id = Column(String, ForeignKey("users.id"), nullable=True)
    partner1_name = Column(String, default="Partner 1", nullable=False)
    partner2_name = Column(String, default="Partner 2", nullable=False)
    start_date = Column(String, default="2020-01-01", nullable=False)
    marriage_date = Column(String, default="2029-01-01", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
