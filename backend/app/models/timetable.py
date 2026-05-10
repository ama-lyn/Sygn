from pydantic import BaseModel
from typing import Optional

class TimetableEntry(BaseModel):
    id: int
    unit_code: str
    unit_name: str
    room_code: str
    day_of_week: str
    start_time: str
    end_time: str
    semester: Optional[int] = None
    academic_year: Optional[str] = None
    week_number: Optional[int] = None
