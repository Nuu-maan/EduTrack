from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import date, timedelta

from ..database import get_db
from ..schemas import StudentReport, Student, Marks
from ..crud import get_student, get_attendance_by_student, get_marks_by_student, get_student_attendance_percentage
from .auth import get_current_user
from ..models import User, AttendanceStatus

router = APIRouter()

@router.get("/student/{student_id}", response_model=StudentReport)
def get_student_report(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get student details
    student = get_student(db, student_id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get attendance records
    attendance_records = get_attendance_by_student(db, student_id=student_id)
    
    # Calculate attendance summary
    total_days = len(attendance_records)
    present_days = sum(1 for record in attendance_records if record.status == AttendanceStatus.PRESENT)
    absent_days = total_days - present_days
    attendance_percentage = get_student_attendance_percentage(db, student_id=student_id)
    
    attendance_summary = {
        "total_days": total_days,
        "present_days": present_days,
        "absent_days": absent_days,
        "attendance_percentage": round(attendance_percentage, 2)
    }
    
    # Get marks records
    marks_records = get_marks_by_student(db, student_id=student_id)
    
    return StudentReport(
        student=student,
        attendance_summary=attendance_summary,
        marks_summary=marks_records,
        attendance_percentage=attendance_percentage
    )

@router.get("/class/{class_name}/attendance")
def get_class_attendance_summary(class_name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from ..models import Student
    
    # Get all students in the class
    students = db.query(Student).filter(Student.class_name == class_name).all()
    
    if not students:
        raise HTTPException(status_code=404, detail="No students found in this class")
    
    class_summary = []
    
    for student in students:
        attendance_records = get_attendance_by_student(db, student_id=student.student_id)
        total_days = len(attendance_records)
        present_days = sum(1 for record in attendance_records if record.status == AttendanceStatus.PRESENT)
        attendance_percentage = get_student_attendance_percentage(db, student_id=student.student_id)
        
        class_summary.append({
            "student_id": student.student_id,
            "name": student.name,
            "roll_no": student.roll_no,
            "total_days": total_days,
            "present_days": present_days,
            "attendance_percentage": round(attendance_percentage, 2)
        })
    
    return {
        "class_name": class_name,
        "total_students": len(students),
        "students": class_summary
    }

@router.get("/class/{class_name}/marks")
def get_class_marks_summary(class_name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from ..models import Student
    
    # Get all students in the class
    students = db.query(Student).filter(Student.class_name == class_name).all()
    
    if not students:
        raise HTTPException(status_code=404, detail="No students found in this class")
    
    class_marks = []
    
    for student in students:
        marks_records = get_marks_by_student(db, student_id=student.student_id)
        
        # Calculate average marks by subject
        subject_averages = {}
        for marks in marks_records:
            if marks.subject not in subject_averages:
                subject_averages[marks.subject] = []
            subject_averages[marks.subject].append((marks.marks_obtained / marks.total_marks) * 100)
        
        # Calculate overall average
        overall_average = 0
        if marks_records:
            total_marks_obtained = sum(marks.marks_obtained for marks in marks_records)
            total_marks_possible = sum(marks.total_marks for marks in marks_records)
            overall_average = (total_marks_obtained / total_marks_possible) * 100 if total_marks_possible > 0 else 0
        
        class_marks.append({
            "student_id": student.student_id,
            "name": student.name,
            "roll_no": student.roll_no,
            "overall_average": round(overall_average, 2),
            "subject_averages": {subject: round(sum(scores) / len(scores), 2) for subject, scores in subject_averages.items()},
            "total_exams": len(marks_records)
        })
    
    return {
        "class_name": class_name,
        "total_students": len(students),
        "students": class_marks
    }

# New: Recommendations and Rankings

@router.get("/recommendations")
def get_recommendations(
    class_name: Optional[str] = None,
    window_days: int = 60,
    attendance_threshold: float = 75.0,
    marks_threshold: float = 50.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from ..models import Student

    q = db.query(Student)
    if class_name:
        q = q.filter(Student.class_name == class_name)
    students = q.all()

    start = date.today() - timedelta(days=window_days)

    recs: List[Dict[str, Any]] = []
    for s in students:
        att_pct = get_student_attendance_percentage(db, student_id=s.student_id)
        reasons = []
        if att_pct < attendance_threshold:
            reasons.append({"type": "attendance", "value": round(att_pct, 2), "threshold": attendance_threshold})

        marks_records = get_marks_by_student(db, student_id=s.student_id)
        avg_marks = 0.0
        if marks_records:
            total_mo = sum(m.marks_obtained for m in marks_records)
            total_tm = sum(m.total_marks for m in marks_records)
            avg_marks = (total_mo / total_tm) * 100 if total_tm > 0 else 0.0
        if avg_marks < marks_threshold:
            reasons.append({"type": "marks", "value": round(avg_marks, 2), "threshold": marks_threshold})

        if reasons:
            recs.append({
                "student_id": s.student_id,
                "name": s.name,
                "class_name": s.class_name,
                "reasons": reasons,
            })

    return {"window_days": window_days, "count": len(recs), "recommendations": recs}


@router.get("/rank/attendance")
def rank_attendance(
    class_name: Optional[str] = None,
    window_days: int = 60,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from ..models import Student
    q = db.query(Student)
    if class_name:
        q = q.filter(Student.class_name == class_name)
    students = q.all()

    ranking = []
    for s in students:
        pct = get_student_attendance_percentage(db, student_id=s.student_id)
        ranking.append({"student_id": s.student_id, "name": s.name, "class_name": s.class_name, "attendance_pct": round(pct, 2)})
    ranking.sort(key=lambda x: x["attendance_pct"], reverse=True)
    return {"total": len(ranking), "students": ranking}


@router.get("/rank/marks")
def rank_marks(
    class_name: Optional[str] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from ..models import Student
    q = db.query(Student)
    if class_name:
        q = q.filter(Student.class_name == class_name)
    students = q.all()

    ranking = []
    for s in students:
        marks_records = get_marks_by_student(db, student_id=s.student_id)
        if subject:
            marks_records = [m for m in marks_records if m.subject == subject]
        avg = 0.0
        if marks_records:
            total_mo = sum(m.marks_obtained for m in marks_records)
            total_tm = sum(m.total_marks for m in marks_records)
            avg = (total_mo / total_tm) * 100 if total_tm > 0 else 0.0
        ranking.append({"student_id": s.student_id, "name": s.name, "class_name": s.class_name, "avg_marks": round(avg, 2)})
    ranking.sort(key=lambda x: x["avg_marks"], reverse=True)
    return {"total": len(ranking), "students": ranking}


@router.get("/overview")
def class_overview(
    class_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from ..models import Student
    q = db.query(Student)
    if class_name:
        q = q.filter(Student.class_name == class_name)
    students = q.all()

    rows = []
    for s in students:
        att_pct = get_student_attendance_percentage(db, student_id=s.student_id)
        marks_records = get_marks_by_student(db, student_id=s.student_id)
        avg_marks = 0.0
        if marks_records:
            total_mo = sum(m.marks_obtained for m in marks_records)
            total_tm = sum(m.total_marks for m in marks_records)
            avg_marks = (total_mo / total_tm) * 100 if total_tm > 0 else 0.0
        rows.append({
            "student_id": s.student_id,
            "name": s.name,
            "class_name": s.class_name,
            "attendance_pct": round(att_pct, 2),
            "avg_marks": round(avg_marks, 2),
        })

    # compute ranks locally
    att_sorted = sorted(rows, key=lambda r: r["attendance_pct"], reverse=True)
    marks_sorted = sorted(rows, key=lambda r: r["avg_marks"], reverse=True)
    att_rank = {r["student_id"]: i + 1 for i, r in enumerate(att_sorted)}
    marks_rank = {r["student_id"]: i + 1 for i, r in enumerate(marks_sorted)}

    for r in rows:
        r["rank_attendance"] = att_rank.get(r["student_id"]) 
        r["rank_marks"] = marks_rank.get(r["student_id"]) 

    return {"total": len(rows), "students": rows}
