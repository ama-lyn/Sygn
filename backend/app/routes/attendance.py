from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from typing import List
from app.database import supabase_admin
from app.utils.jwt import verify_token
from app.models.attendance import AttendanceRequest, AttendanceResponse, ValidationResult

router = APIRouter(prefix="/attendance", tags=["Attendance"])

EAT = timezone(timedelta(hours=3))  # East Africa Time


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

    # ── Fetch timetable entry with room ───────────────────────
    tt = supabase_admin.table("timetable") \
        .select("*, units(unit_code, unit_name), rooms(id, room_code, building_id)") \
        .eq("id", body.timetable_id) \
        .single() \
        .execute()

    if not tt.data:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    entry = tt.data
    room = entry.get("rooms")
    now = datetime.now(EAT)  # Use EAT timezone

    # ── 1. TEMPORAL VALIDATION ────────────────────────────────
    day_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday"}
    today = day_map.get(now.weekday(), "")
    temporal_valid = False

    if entry["day_of_week"] == today:
        start = datetime.strptime(str(entry["start_time"])[:5], "%H:%M").time()
        end   = datetime.strptime(str(entry["end_time"])[:5], "%H:%M").time()
        now_time = now.time().replace(tzinfo=None)
        temporal_valid = start <= now_time <= end

    # ── 2. SPATIAL VALIDATION — PostGIS polygon check ─────────
    spatial_valid = False
    is_online = not room or room.get("room_code", "").lower() == "online" or room.get("building_id") is None

    if is_online:
        spatial_valid = True
    else:
        # ST_Covers(building polygon, student point) via Supabase RPC
        geo_result = supabase_admin.rpc("check_student_inside_building", {
            "p_room_id": room["id"],
            "p_lat":     body.latitude,
            "p_lng":     body.longitude,
        }).execute()

        spatial_valid = bool(geo_result.data)

    # ── 3. IDENTITY VALIDATION ────────────────────────────────
    identity_valid = student.get("device_id") == body.device_id

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

    record = supabase_admin.table("attendance_records").insert({
        "student_id":   student["id"],
        "timetable_id": body.timetable_id,
        "unit_id":      entry["unit_id"],
        "status":       status,
        "latitude":     body.latitude,
        "longitude":    body.longitude,
        "device_id":    body.device_id,
        "temporal_valid":  temporal_valid,
        "spatial_valid":   spatial_valid,
        "identity_valid":  identity_valid,
    }).execute()

    if not record.data:
        raise HTTPException(status_code=500, detail="Failed to save attendance record")

    if all_valid:
        message = f"Attendance marked for {entry['units']['unit_code']}"
    else:
        reasons = []
        if not temporal_valid: reasons.append("outside class hours")
        if not spatial_valid:  reasons.append(f"not inside {room['room_code'] if room else 'classroom'}")
        if not identity_valid: reasons.append("device not recognised")
        message = "Attendance rejected: " + ", ".join(reasons)

    return AttendanceResponse(
        success=all_valid,
        status=status,
        message=message,
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
        .select("status, marked_at, temporal_valid, spatial_valid, identity_valid") \
        .eq("student_id", student["id"]) \
        .eq("unit_id", unit.data["id"]) \
        .order("marked_at", desc=True) \
        .execute()

    return records.data or []
