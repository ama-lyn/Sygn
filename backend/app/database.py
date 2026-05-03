import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

# Anon client — respects RLS, used for student/lecturer actions
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Service client — bypasses RLS, used only for admin operations in FastAPI
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
