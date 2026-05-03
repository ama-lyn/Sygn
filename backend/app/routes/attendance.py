from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, time
from typing import List
from app.database import supabase_admin
from app.utils.jwt import verify_token
from app.utils.haversine import haversine
from app.models.attendance import AttendanceRequest, AttendanceResponse, ValidationResult

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def get_student(token: dict = Depends(verify_token)) -> dict:
    auth_id = token.get("sub")
    result = supabase_admin.table("students") \
        .select("id, student_id, device_id") \
        .eq("auth_id", auth_id) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data


@router.post("/mark", response_model=AttendanceResponse)
def mark_attendance(body: AttendanceRequest, student: dict = Depends(get_student)):

    # ── Fetch timetable entry with classroom ──────────────────
    tt = supabase_admin.table("timetable") \
        .select("*, units(unit_code, unit_name), classrooms(room_code, latitude, longitude, radius_meters)") \
        .eq("id", body.timetable_id) \
        .single() \
        .execute()

    if not tt.data:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    entry = tt.data
    classroom = entry["classrooms"]
    now = datetime.now()

    # ── 1. TEMPORAL VALIDATION ────────────────────────────────
    day_map = {0:"Monday",1:"Tuesday",2:"Wednesday",3:"Thursday",4:"Friday"}
    today = day_map.get(now.weekday(), "")
    temporal_valid = False

    if entry["day_of_week"] == today:
        start = datetime.strptime(str(entry["start_time"])[:5], "%H:%M").time()
        end   = datetime.strptime(str(entry["end_time"])[:5], "%H:%M").time()
        # Allow 15 min before start and up to 30 min after end
        window_start = time(
            start.hour if start.minute >= 15 else start.hour - 1,
            (start.minute - 15) % 60
        )
        window_end = time(
            end.hour if end.minute <= 29 else end.hour + 1,
            (end.minute + 30) % 60
        )
        temporal_valid = window_start <= now.time() <= window_end

    # ── 2. SPATIAL VALIDATION ─────────────────────────────────
    spatial_valid = False
    distance = None

    if classroom:
        is_online = classroom["room_code"].lower() == "online"
        if is_online:
            spatial_valid = True
            distance = 0.0
        else:
            distance = haversine(
                body.latitude, body.longitude,
                classroom["latitude"], classroom["longitude"]
            )
            spatial_valid = distance <= classroom["radius_meters"]

    # ── 3. IDENTITY VALIDATION ────────────────────────────────
    registered_device = student.get("device_id")
    identity_valid = (registered_device == body.device_id)

    # ── Check already marked ──────────────────────────────────
    existing = supabase_admin.table("attendance_records") \
        .select("id") \
        .eq("student_id", student["id"]) \
        .eq("timetable_id", body.timetable_id) \
        .execute()

    if existing.data:
        raise HTTPException(status_code=409, detail="Attendance already marked for this class")

    # ── All 3 must pass ───────────────────────────────────────
    all_valid = temporal_valid and spatial_valid and identity_valid
    status = "present" if all_valid else "absent"

    # ── Insert record regardless (log failed attempts too) ────
    record = supabase_admin.table("attendance_records").insert({
        "student_id":         student["id"],
        "timetable_id":       body.timetable_id,
        "unit_id":            entry["unit_id"],
        "status":             status,
        "latitude":           body.latitude,
        "longitude":          body.longitude,
        "distance_from_room": round(distance, 2) if distance is not None else None,
        "device_id":          body.device_id,
        "temporal_valid":     temporal_valid,
        "spatial_valid":      spatial_valid,
        "identity_valid":     identity_valid,
    }).execute()

    if not record.data:
        raise HTTPException(status_code=500, detail="Failed to save attendance record")

    # ── Build response message ────────────────────────────────
    if all_valid:
        message = f"Attendance marked for {entry['units']['unit_code']}"
    else:
        reasons = []
        if not temporal_valid: reasons.append("outside class hours")
        if not spatial_valid:  reasons.append(f"too far from {classroom['room_code']} ({round(distance)}m away)")
        if not identity_valid: reasons.append("device not recognised")
        message = "Attendance rejected: " + ", ".join(reasons)

    return AttendanceResponse(
        success=all_valid,
        status=status,
        message=message,
        distance_from_room=round(distance, 2) if distance is not None else None,
        marked_at=record.data[0]["marked_at"],
        validation=ValidationResult(
            temporal_valid=temporal_valid,
            spatial_valid=spatial_valid,
            identity_valid=identity_valid,
        )
    )


@router.get("/history/{unit_code}")
def get_history(unit_code: str, student: dict = Depends(get_student)):
    unit = supabase_admin.table("units") \
        .select("id") \
        .eq("unit_code", unit_code) \
        .single() \
        .execute()

    if not unit.data:
        raise HTTPException(status_code=404, detail="Unit not found")

    records = supabase_admin.table("attendance_records") \
        .select("status, marked_at, distance_from_room, temporal_valid, spatial_valid, identity_valid") \
        .eq("student_id", student["id"]) \
        .eq("unit_id", unit.data["id"]) \
        .order("marked_at", desc=True) \
        .execute()

    return records.data or []
