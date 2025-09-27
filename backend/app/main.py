from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn

from .database import get_db, engine
import os
from .models import Base
from .routers import auth, students, attendance, marks, reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduTrack API", version="1.0.0")

# CORS middleware
origins_env = os.getenv("FRONTEND_ORIGINS", "*")
allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()] if origins_env else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
app.include_router(marks.router, prefix="/marks", tags=["marks"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "EduTrack API is running!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/test")
async def test_endpoint():
    return {"message": "Test endpoint working", "cors": "enabled"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
