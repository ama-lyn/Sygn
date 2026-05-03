from pydantic import BaseModel
from typing import Optional

class ClassroomOut(BaseModel):
    room_code: str
    latitude: float
    longitude: float
    radius_meters: int

class TimetableEntry(BaseModel):
    id: int
    unit_code: str
    unit_name: str
    room_code: str
    day_of_week: str
    start_time: str
    end_time: str
    semester: int
    academic_year: str
    week_number: int
    classroom: Optional[ClassroomOut] = None
