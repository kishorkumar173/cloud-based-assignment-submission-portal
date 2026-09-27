"""Create dummy teacher/student/course data for a local demo.

Run from the repository root:
    python backend/seed_demo.py
"""
import os
os.environ.setdefault("DATABASE_URL", "sqlite:///./portal.db")
os.environ.setdefault("APP_MODE", "local")
os.environ.setdefault("STORAGE_BACKEND", "local")
os.environ.setdefault("UPLOAD_DIR", "./uploads")
os.environ.setdefault("JWT_SECRET", "change-this-development-secret")

from app.db import SessionLocal, Base, engine
from app.models.models import User, Course
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

teacher = db.query(User).filter(User.email == "teacher@example.com").first()
if not teacher:
    teacher = User(
        auth_uid="demo-teacher-001",
        password_hash=hash_password("Teacher@123"),
        name="Demo Teacher",
        email="teacher@example.com",
        role="teacher",
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

student = db.query(User).filter(User.email == "student@example.com").first()
if not student:
    student = User(
        auth_uid="demo-student-001",
        password_hash=hash_password("Student@123"),
        name="Demo Student",
        email="student@example.com",
        role="student",
    )
    db.add(student)
    db.commit()

course = db.query(Course).filter(Course.course_name == "Cloud Computing").first()
if not course:
    db.add(Course(course_name="Cloud Computing", teacher_id=teacher.id))
    db.commit()

print("Demo data ready.")
print("Teacher: teacher@example.com / Teacher@123")
print("Student: student@example.com / Student@123")
print("Course: Cloud Computing")
