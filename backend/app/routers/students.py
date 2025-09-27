from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import Student as StudentSchema, StudentCreate, StudentUpdate
from ..crud import get_student, get_students, create_student, update_student, delete_student
from .auth import get_current_user
from ..models import User, Student

router = APIRouter()

@router.get("/", response_model=List[StudentSchema])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    students = get_students(db, skip=skip, limit=limit)
    return students

@router.get("/{student_id}", response_model=StudentSchema)
def read_student(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_student = get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return db_student

@router.post("/", response_model=StudentSchema)
def create_student_endpoint(student: StudentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if roll number already exists
    existing_student = db.query(Student).filter(Student.roll_no == student.roll_no).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Roll number already exists")
    
    return create_student(db=db, student=student)

@router.put("/{student_id}", response_model=StudentSchema)
def update_student_endpoint(student_id: int, student_update: StudentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_student = update_student(db, student_id=student_id, student_update=student_update)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return db_student

@router.delete("/{student_id}")
def delete_student_endpoint(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_student = delete_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}
