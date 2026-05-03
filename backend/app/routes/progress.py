from fastapi import APIRouter, Depends, HTTPException
from app.database import supabase_admin
from app.utils.jwt import verify_token

router = APIRouter(prefix="/progress", tags=["Progress"])


def get_student(token: dict = Depends(verify_token)) -> dict:
    auth_id = token.get("sub")
    result = supabase_admin.table("students") \
        .select("id, student_id, full_name, streak") \
        .eq("auth_id", auth_id) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data


@router.get("/stats")
def get_stats(student: dict = Depends(get_student)):
    # Get all enrolled units
    enrollments = supabase_admin.table("enrollments") \
        .select("unit_id, units(unit_code, unit_name)") \
        .eq("student_id", student["id"]) \
        .execute()

    if not enrollments.data:
        return {"overall_percentage": 0, "units": [], "streak": student["streak"]}

    unit_stats = []
    total_attended = 0
    total_classes = 0

    for e in enrollments.data:
        unit_id = e["unit_id"]
        unit_code = e["units"]["unit_code"]
        unit_name = e["units"]["unit_name"]

        # Count total timetable entries for this unit
        tt_count = supabase_admin.table("timetable") \
            .select("id", count="exact") \
            .eq("unit_id", unit_id) \
            .execute()

        # Count attended records for this student + unit
        attended_count = supabase_admin.table("attendance_records") \
            .select("id", count="exact") \
            .eq("student_id", student["id"]) \
            .eq("unit_id", unit_id) \
            .eq("status", "present") \
            .execute()

        total = tt_count.count or 0
        attended = attended_count.count or 0
        percentage = round((attended / total) * 100) if total > 0 else 0

        total_classes += total
        total_attended += attended

        unit_stats.append({
            "unit_code":   unit_code,
            "unit_name":   unit_name,
            "attended":    attended,
            "total":       total,
            "percentage":  percentage,
            "color":       "#4CAF50" if percentage >= 80 else "#FFC107" if percentage >= 60 else "#FF5252",
        })

    overall = round((total_attended / total_classes) * 100) if total_classes > 0 else 0

    # Build alert for any unit below 80%
    alerts = [
        f"You're at {u['percentage']}% in {u['unit_name']}. "
        f"Attend the next {max(1, round((total_classes * 0.8 - total_attended)))} classes to reach 80%."
        for u in unit_stats if u["percentage"] < 80
    ]

    return {
        "overall_percentage": overall,
        "total_attended":     total_attended,
        "total_classes":      total_classes,
        "streak":             student["streak"],
        "units":              unit_stats,
        "alerts":             alerts,
    }
