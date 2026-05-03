from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    student_id: str        # e.g. SCM211-0696/2022
    full_name: str
    email: EmailStr
    password: str
    year: int
    course: str
    device_id: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    device_id: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    student_id: str
    full_name: str
