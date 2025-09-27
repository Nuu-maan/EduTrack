from sqlalchemy.orm import Session
from sqlalchemy import and_
from .models import Student, Attendance, Marks, User, AttendanceStatus
from .schemas import StudentCreate, StudentUpdate, AttendanceCreate, MarksCreate
from passlib.context import CryptContext
from typing import List, Optional
from datetime import date

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User CRUD operations
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, username: str, password: str):
    hashed_password = pwd_context.hash(password)
    db_user = User(username=username, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Student CRUD operations
def get_student(db: Session, student_id: int):
    return db.query(Student).filter(Student.student_id == student_id).first()

def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Student).offset(skip).limit(limit).all()

def create_student(db: Session, student: StudentCreate):
    db_student = Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student_update: StudentUpdate):
    db_student = get_student(db, student_id)
    if db_student:
        update_data = student_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_student, field, value)
        db.commit()
        db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int):
    db_student = get_student(db, student_id)
    if db_student:
        # Fallback cleanup: explicitly delete dependent rows in case DB-level cascades are not active
        db.query(Attendance).filter(Attendance.student_id == student_id).delete(synchronize_session=False)
        db.query(Marks).filter(Marks.student_id == student_id).delete(synchronize_session=False)
        db.delete(db_student)
        db.commit()
    return db_student

# Attendance CRUD operations
def get_attendance_by_student(db: Session, student_id: int, start_date: date = None, end_date: date = None):
    query = db.query(Attendance).filter(Attendance.student_id == student_id)
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    return query.all()

def create_attendance(db: Session, attendance: AttendanceCreate):
    db_attendance = Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_attendance_by_date(db: Session, date: date):
    return db.query(Attendance).filter(Attendance.date == date).all()

# Marks CRUD operations
def get_marks_by_student(db: Session, student_id: int):
    return db.query(Marks).filter(Marks.student_id == student_id).all()

def create_marks(db: Session, marks: MarksCreate):
    db_marks = Marks(**marks.dict())
    db.add(db_marks)
    db.commit()
    db.refresh(db_marks)
    return db_marks

def get_marks_by_subject(db: Session, student_id: int, subject: str):
    return db.query(Marks).filter(
        and_(Marks.student_id == student_id, Marks.subject == subject)
    ).all()

# Report functions
def get_student_attendance_percentage(db: Session, student_id: int):
    attendance_records = get_attendance_by_student(db, student_id)
    if not attendance_records:
        return 0.0
    
    present_count = sum(1 for record in attendance_records if record.status == AttendanceStatus.PRESENT)
    total_count = len(attendance_records)
    return (present_count / total_count) * 100 if total_count > 0 else 0.0
