from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routes import auth, timetable, attendance, progress, profile

app = FastAPI(title="Sygn API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(progress.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"status": "Sygn API is running"}
