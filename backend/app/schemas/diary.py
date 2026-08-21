from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class DiaryCreate(BaseModel):
    title: str
    content: str
    date: str

class DiaryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    date: Optional[str] = None

class DiaryResponse(BaseModel):
    id: str
    relationshipId: str = Field(..., validation_alias="relationship_id", serialization_alias="relationshipId")
    title: str
    content: str
    date: str
    createdBy: str = Field(..., validation_alias="created_by", serialization_alias="createdBy")
    createdAt: datetime = Field(..., validation_alias="created_at", serialization_alias="createdAt")
    updatedAt: datetime = Field(..., validation_alias="updated_at", serialization_alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
