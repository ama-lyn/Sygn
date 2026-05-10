import os
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Force HTTP/1.1 — prevents RemoteProtocolError on Render when HTTP/2 drops mid-stream
# We must preserve the base_url the postgrest client already has, just swap the transport
supabase.postgrest.session = httpx.Client(
    base_url=supabase.postgrest.session.base_url,
    headers=dict(supabase.postgrest.session.headers),
    http2=False,
)
supabase_admin.postgrest.session = httpx.Client(
    base_url=supabase_admin.postgrest.session.base_url,
    headers=dict(supabase_admin.postgrest.session.headers),
    http2=False,
)
