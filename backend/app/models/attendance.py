from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AttendanceRequest(BaseModel):
    timetable_id: int
    latitude: float
    longitude: float
    device_id: str

class ValidationResult(BaseModel):
    temporal_valid: bool
    spatial_valid: bool
    identity_valid: bool

class AttendanceResponse(BaseModel):
    success: bool
    status: str
    message: str
    distance_from_room: Optional[float] = None
    marked_at: Optional[str] = None
    validation: ValidationResult
