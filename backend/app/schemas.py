from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date
from .models import AttendanceStatus

# User schemas
class UserCreate(BaseModel):
    username: str
    password: str
    
    def __init__(self, **data):
        super().__init__(**data)
        if len(self.password) > 72:
            raise ValueError("Password cannot be longer than 72 characters")

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Student schemas
class StudentBase(BaseModel):
    name: str
    class_name: str
    roll_no: int

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    class_name: Optional[str] = None
    roll_no: Optional[int] = None

class Student(StudentBase):
    student_id: int
    
    class Config:
        from_attributes = True

# Attendance schemas
class AttendanceBase(BaseModel):
    student_id: int
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    attendance_id: int
    
    class Config:
        from_attributes = True

# Marks schemas
class MarksBase(BaseModel):
    student_id: int
    subject: str
    exam_name: str
    marks_obtained: int
    total_marks: int

class MarksCreate(MarksBase):
    pass

class Marks(MarksBase):
    marks_id: int
    
    class Config:
        from_attributes = True

# Report schemas
class StudentReport(BaseModel):
    student: Student
    attendance_summary: dict
    marks_summary: List[Marks]
    attendance_percentage: float
