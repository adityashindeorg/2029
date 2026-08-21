from datetime import datetime
from pydantic import BaseModel

class LoginRequest(BaseModel):
    identifier: str
    code: str

class UserResponse(BaseModel):
    id: str
    uid: str
    email: str
    name: str
    displayName: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
