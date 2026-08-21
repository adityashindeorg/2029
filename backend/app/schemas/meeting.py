from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MeetingCreate(BaseModel):
    title: str
    date: str
    time: Optional[str] = ""
    location: Optional[str] = ""
    notes: Optional[str] = ""

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    completed: Optional[bool] = None

class MeetingToggle(BaseModel):
    completed: bool

class MeetingResponse(BaseModel):
    id: str
    relationshipId: str = Field(..., validation_alias="relationship_id", serialization_alias="relationshipId")
    title: str
    date: str
    time: str
    location: str
    notes: str
    completed: bool
    createdBy: str = Field(..., validation_alias="created_by", serialization_alias="createdBy")
    createdAt: datetime = Field(..., validation_alias="created_at", serialization_alias="createdAt")
    updatedAt: datetime = Field(..., validation_alias="updated_at", serialization_alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
