from fastapi import APIRouter, Depends, HTTPException
from app.database import supabase_admin
from app.utils.jwt import verify_token

router = APIRouter(prefix="/profile", tags=["Profile"])


def get_student(token: dict = Depends(verify_token)) -> dict:
    auth_id = token.get("sub")
    result = supabase_admin.table("students") \
        .select("*") \
        .eq("auth_id", auth_id) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data


@router.get("/me")
def get_profile(student: dict = Depends(get_student)):
    # Get enrolled classes
    enrollments = supabase_admin.table("enrollments") \
        .select("unit_id, units(unit_code, unit_name)") \
        .eq("student_id", student["id"]) \
        .execute()

    classes = [
        {"unit_code": e["units"]["unit_code"], "unit_name": e["units"]["unit_name"]}
        for e in (enrollments.data or [])
    ]

    # Overall attendance count
    total_classes = supabase_admin.table("timetable") \
        .select("id", count="exact") \
        .in_("unit_id", [e["unit_id"] for e in (enrollments.data or [])]) \
        .execute()

    attended = supabase_admin.table("attendance_records") \
        .select("id", count="exact") \
        .eq("student_id", student["id"]) \
        .eq("status", "present") \
        .execute()

    total = total_classes.count or 0
    present = attended.count or 0
    percentage = round((present / total) * 100) if total > 0 else 0

    return {
        "student_id":  student["student_id"],
        "full_name":   student["full_name"],
        "email":       student["email"],
        "year":        student["year"],
        "course":      student["course"],
        "streak":      student["streak"],
        "stats": {
            "enrolled_count":    len(classes),
            "attendance_percentage": percentage,
        },
        "enrolled_classes": classes,
    }


@router.patch("/device")
def update_device(device_id: str, student: dict = Depends(get_student)):
    """Update bound device — only used if student changes phone"""
    supabase_admin.table("students") \
        .update({"device_id": device_id}) \
        .eq("id", student["id"]) \
        .execute()
    return {"message": "Device updated successfully"}
