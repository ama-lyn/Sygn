from fastapi import APIRouter, HTTPException, status
from app.models.auth import RegisterRequest, LoginRequest, TokenResponse
from app.database import supabase, supabase_admin
from app.utils.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest):
    # 1. Create user in Supabase Auth
    try:
        auth_res = supabase_admin.auth.admin.create_user({
            "email": body.email,
            "password": body.password,
            "email_confirm": True,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Auth error: {str(e)}")

    auth_id = auth_res.user.id

    # 2. Check student_id not already registered
    existing = supabase_admin.table("students") \
        .select("id") \
        .eq("student_id", body.student_id) \
        .execute()

    if existing.data:
        raise HTTPException(status_code=400, detail="Student ID already registered")

    # 3. Insert into students table
    student = supabase_admin.table("students").insert({
        "auth_id":    auth_id,
        "student_id": body.student_id,
        "full_name":  body.full_name,
        "email":      body.email,
        "year":       body.year,
        "course":     body.course,
        "device_id":  body.device_id,
        "streak":     0,
    }).execute()

    if not student.data:
        raise HTTPException(status_code=500, detail="Failed to create student profile")

    # 4. Auto-enroll in all units (for now enroll in all — adjust later)
    units = supabase_admin.table("units").select("id").execute()
    enrollments = [
        {
            "student_id":    student.data[0]["id"],
            "unit_id":       u["id"],
            "semester":      2,
            "academic_year": "2026",
        }
        for u in units.data
    ]
    supabase_admin.table("enrollments").insert(enrollments).execute()

    # 5. Return token
    token = create_access_token({
        "sub":        str(auth_id),
        "student_id": body.student_id,
        "full_name":  body.full_name,
    })

    return TokenResponse(
        access_token=token,
        student_id=body.student_id,
        full_name=body.full_name,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    # 1. Sign in via Supabase Auth
    try:
        auth_res = supabase.auth.sign_in_with_password({
            "email":    body.email,
            "password": body.password,
        })
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    auth_id = auth_res.user.id

    # 2. Fetch student profile
    student = supabase_admin.table("students") \
        .select("*") \
        .eq("auth_id", str(auth_id)) \
        .single() \
        .execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 3. Device binding check
    registered_device = student.data.get("device_id")
    if registered_device and registered_device != body.device_id:
        raise HTTPException(status_code=403, detail="Device not recognised. Contact admin.")

    # 4. If no device bound yet, bind it now
    if not registered_device:
        supabase_admin.table("students") \
            .update({"device_id": body.device_id}) \
            .eq("id", student.data["id"]) \
            .execute()

    # 5. Return token
    token = create_access_token({
        "sub":        str(auth_id),
        "student_id": student.data["student_id"],
        "full_name":  student.data["full_name"],
    })

    return TokenResponse(
        access_token=token,
        student_id=student.data["student_id"],
        full_name=student.data["full_name"],
    )
