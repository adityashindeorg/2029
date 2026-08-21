from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    date: str

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None

class MilestoneResponse(BaseModel):
    id: str
    relationshipId: str = Field(..., validation_alias="relationship_id", serialization_alias="relationshipId")
    title: str
    description: str
    date: str
    createdBy: str = Field(..., validation_alias="created_by", serialization_alias="createdBy")
    createdAt: datetime = Field(..., validation_alias="created_at", serialization_alias="createdAt")
    updatedAt: datetime = Field(..., validation_alias="updated_at", serialization_alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
