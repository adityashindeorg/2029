from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class RelationshipUpdate(BaseModel):
    partner1Name: Optional[str] = Field(None, validation_alias="partner1_name", serialization_alias="partner1Name")
    partner2Name: Optional[str] = Field(None, validation_alias="partner2_name", serialization_alias="partner2Name")
    startDate: Optional[str] = Field(None, validation_alias="start_date", serialization_alias="startDate")
    marriageDate: Optional[str] = Field(None, validation_alias="marriage_date", serialization_alias="marriageDate")

    class Config:
        from_attributes = True
        populate_by_name = True

class RelationshipResponse(BaseModel):
    id: str
    partner1Id: Optional[str] = Field(None, validation_alias="partner1_id", serialization_alias="partner1Id")
    partner2Id: Optional[str] = Field(None, validation_alias="partner2_id", serialization_alias="partner2Id")
    partner1Name: str = Field(..., validation_alias="partner1_name", serialization_alias="partner1Name")
    partner2Name: str = Field(..., validation_alias="partner2_name", serialization_alias="partner2Name")
    startDate: str = Field(..., validation_alias="start_date", serialization_alias="startDate")
    marriageDate: str = Field(..., validation_alias="marriage_date", serialization_alias="marriageDate")
    createdAt: datetime = Field(..., validation_alias="created_at", serialization_alias="createdAt")
    updatedAt: datetime = Field(..., validation_alias="updated_at", serialization_alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
