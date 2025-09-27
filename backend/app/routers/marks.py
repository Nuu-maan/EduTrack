from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import Marks as MarksSchema, MarksCreate
from ..crud import get_marks_by_student, create_marks, get_marks_by_subject
from .auth import get_current_user
from ..models import User, Student

router = APIRouter()

@router.get("/student/{student_id}", response_model=List[MarksSchema])
def get_student_marks(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    marks_records = get_marks_by_student(db, student_id=student_id)
    return marks_records

@router.get("/student/{student_id}/subject/{subject}", response_model=List[MarksSchema])
def get_student_marks_by_subject(student_id: int, subject: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    marks_records = get_marks_by_subject(db, student_id=student_id, subject=subject)
    return marks_records

@router.post("/", response_model=MarksSchema)
def add_marks(marks: MarksCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == marks.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Validate marks
    if marks.marks_obtained < 0 or marks.total_marks < 0:
        raise HTTPException(status_code=400, detail="Marks cannot be negative")
    
    if marks.marks_obtained > marks.total_marks:
        raise HTTPException(status_code=400, detail="Marks obtained cannot be greater than total marks")
    
    return create_marks(db=db, marks=marks)

@router.post("/bulk", response_model=List[MarksSchema])
def add_bulk_marks(marks_list: List[MarksCreate], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    created_marks = []
    
    for marks in marks_list:
        # Verify student exists
        student = db.query(Student).filter(Student.student_id == marks.student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail=f"Student with ID {marks.student_id} not found")
        
        # Validate marks
        if marks.marks_obtained < 0 or marks.total_marks < 0:
            raise HTTPException(status_code=400, detail="Marks cannot be negative")
        
        if marks.marks_obtained > marks.total_marks:
            raise HTTPException(status_code=400, detail="Marks obtained cannot be greater than total marks")
        
        created_marks.append(create_marks(db=db, marks=marks))
    
    return created_marks
