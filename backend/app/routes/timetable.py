from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from app.database import supabase_admin
from app.utils.jwt import verify_token
from app.models.timetable import TimetableEntry

router = APIRouter(prefix="/timetable", tags=["Timetable"])

DAY_MAP = {
    0: "Monday", 1: "Tuesday", 2: "Wednesday",
    3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday"
}

def get_student_id(token: dict = Depends(verify_token)) -> int:
    auth_id = token.get("sub")
    result = supabase_admin.table("students") \
        .select("id") \
        .eq("auth_id", auth_id) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data["id"]

def fetch_timetable(student_id: int, day: str = None) -> List[dict]:
    enrollments = supabase_admin.table("enrollments") \
        .select("unit_id") \
        .eq("student_id", student_id) \
        .execute()

    if not enrollments.data:
        return []

    unit_ids = [e["unit_id"] for e in enrollments.data]

    # Join timetable → rooms (room_code) → units (unit_code, unit_name)
    query = supabase_admin.table("timetable") \
        .select("*, units(unit_code, unit_name), rooms(room_code)") \
        .in_("unit_id", unit_ids)

    if day:
        query = query.eq("day_of_week", day)

    result = query.order("start_time").execute()
    return result.data or []

def format_entry(row: dict) -> dict:
    return {
        "id":            row["id"],
        "unit_code":     row["units"]["unit_code"],
        "unit_name":     row["units"]["unit_name"],
        "room_code":     row["rooms"]["room_code"] if row.get("rooms") else "Online",
        "day_of_week":   row["day_of_week"],
        "start_time":    str(row["start_time"]),
        "end_time":      str(row["end_time"]),
        "semester":      row.get("semester"),
        "academic_year": row.get("academic_year"),
        "week_number":   row.get("week_number"),
    }


@router.get("/today", response_model=List[TimetableEntry])
def get_today(student_id: int = Depends(get_student_id)):
    today = DAY_MAP[datetime.now().weekday()]
    rows = fetch_timetable(student_id, day=today)
    return [format_entry(r) for r in rows]


@router.get("/week", response_model=List[TimetableEntry])
def get_week(student_id: int = Depends(get_student_id)):
    rows = fetch_timetable(student_id)
    return [format_entry(r) for r in rows]


@router.get("/day/{day_name}", response_model=List[TimetableEntry])
def get_by_day(day_name: str, student_id: int = Depends(get_student_id)):
    day = day_name.capitalize()
    if day not in DAY_MAP.values():
        raise HTTPException(status_code=400, detail=f"Invalid day. Use Monday–Friday")
    rows = fetch_timetable(student_id, day=day)
    return [format_entry(r) for r in rows]
