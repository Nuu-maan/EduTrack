from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import date, datetime, timedelta

from ..database import get_db
from ..schemas import Attendance as AttendanceSchema, AttendanceCreate
from ..crud import get_attendance_by_student, create_attendance, get_attendance_by_date
from .auth import get_current_user
from ..models import User, Student

router = APIRouter()

@router.get("/student/{student_id}", response_model=List[AttendanceSchema])
def get_student_attendance(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    attendance_records = get_attendance_by_student(db, student_id=student_id)
    return attendance_records

@router.get("/date/{attendance_date}", response_model=List[AttendanceSchema])
def get_attendance_by_date_endpoint(attendance_date: date, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attendance_records = get_attendance_by_date(db, date=attendance_date)
    return attendance_records

@router.post("/", response_model=AttendanceSchema)
def mark_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Upsert behavior: if existing record for student/date, update status instead of erroring
    from ..models import Attendance
    existing_attendance = db.query(Attendance).filter(
        Attendance.student_id == attendance.student_id,
        Attendance.date == attendance.date
    ).first()

    if existing_attendance:
        existing_attendance.status = attendance.status
        db.commit()
        db.refresh(existing_attendance)
        return existing_attendance

    return create_attendance(db=db, attendance=attendance)

@router.post("/bulk", response_model=List[AttendanceSchema])
def mark_bulk_attendance(attendance_list: List[AttendanceCreate], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results: List[AttendanceSchema] = []
    from ..models import Attendance as AttendanceModel

    for item in attendance_list:
        # Verify student exists
        student = db.query(Student).filter(Student.student_id == item.student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail=f"Student with ID {item.student_id} not found")

        existing = db.query(AttendanceModel).filter(
            AttendanceModel.student_id == item.student_id,
            AttendanceModel.date == item.date,
        ).first()

        if existing:
            existing.status = item.status
            db.commit()
            db.refresh(existing)
            results.append(existing)
        else:
            created = create_attendance(db=db, attendance=item)
            results.append(created)

    return results


# Summaries for heatmaps
@router.get("/summary/calendar")
def calendar_summary(student_id: int, start: date, end: date, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Dict[str, str]:
    """Return a mapping of ISO date string to status for a given student in the date range."""
    records = get_attendance_by_student(db, student_id=student_id)
    # Index by date
    by_date: Dict[str, str] = {}
    for r in records:
        if start <= r.date <= end:
            by_date[r.date.isoformat()] = r.status.value if hasattr(r.status, "value") else str(r.status)
    return by_date


@router.get("/summary/class")
def class_summary(class_name: str, start: date, end: date, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return per-day summary counts for a class in a date range."""
    # Get students in class
    students = db.query(Student).filter(Student.class_name == class_name).all()
    student_ids = [s.student_id for s in students]

    from ..models import Attendance as AttendanceModel, AttendanceStatus
    q = db.query(AttendanceModel).filter(AttendanceModel.date >= start, AttendanceModel.date <= end)
    if student_ids:
        q = q.filter(AttendanceModel.student_id.in_(student_ids))
    rows = q.all()

    summary: Dict[str, Dict[str, int]] = {}
    for r in rows:
        d = r.date.isoformat()
        if d not in summary:
            summary[d] = {"present": 0, "absent": 0, "total": 0}
        if r.status == AttendanceStatus.PRESENT:
            summary[d]["present"] += 1
        elif r.status == AttendanceStatus.ABSENT:
            summary[d]["absent"] += 1
        summary[d]["total"] += 1

    # Return as array sorted by date
    result = [
        {"date": k, **v}
        for k, v in sorted(summary.items(), key=lambda kv: kv[0])
    ]
    return {"class_name": class_name, "days": result}
