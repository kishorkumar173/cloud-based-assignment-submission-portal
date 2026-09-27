from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.models import Course
from ..models.schemas import CourseCreate, CourseOut
from ..services.auth import require_role

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.post("", response_model=CourseOut)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    course = Course(course_name=payload.course_name, teacher_id=teacher.id)
    db.add(course); db.commit(); db.refresh(course)
    return course

@router.get("", response_model=list[CourseOut])
def get_courses(db: Session = Depends(get_db), user=Depends(require_role("student", "teacher"))):
    if user.role == "teacher":
        return db.query(Course).filter(Course.teacher_id == user.id).all()
    return db.query(Course).all()
