from sqlalchemy import Column, Integer, String, Date, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class Student(Base):
    __tablename__ = "students"
    
    student_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    roll_no = Column(Integer, nullable=False, unique=True)
    
    # Relationships
    attendance_records = relationship(
        "Attendance",
        back_populates="student",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    marks_records = relationship(
        "Marks",
        back_populates="student",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="attendance_records")

class Marks(Base):
    __tablename__ = "marks"

    marks_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    subject = Column(String, nullable=False)
    exam_name = Column(String, nullable=False)
    marks_obtained = Column(Integer, nullable=False)
    total_marks = Column(Integer, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="marks_records")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)  # Will store hashed password
