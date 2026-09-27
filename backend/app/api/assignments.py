from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.models import Assignment, Course
from ..models.schemas import AssignmentCreate, AssignmentOut
from ..services.auth import require_role

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

@router.post("", response_model=AssignmentOut)
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    course = db.get(Course, payload.course_id)
    if not course or course.teacher_id != teacher.id:
        raise HTTPException(403, "Teacher is not assigned to this course.")
    assignment = Assignment(**payload.model_dump(), created_by=teacher.id)
    db.add(assignment); db.commit(); db.refresh(assignment)
    return assignment

@router.get("", response_model=list[AssignmentOut])
def list_assignments(db: Session = Depends(get_db), user=Depends(require_role("student", "teacher"))):
    if user.role == "teacher":
        return db.query(Assignment).filter(Assignment.created_by == user.id).all()
    return db.query(Assignment).all()

@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(assignment_id: int, db: Session = Depends(get_db), user=Depends(require_role("student", "teacher"))):
    a = db.get(Assignment, assignment_id)
    if not a:
        raise HTTPException(404, "Assignment not found.")
    if user.role == "teacher" and a.created_by != user.id:
        raise HTTPException(403, "Not your assignment.")
    return a

@router.put("/{assignment_id}", response_model=AssignmentOut)
def update_assignment(assignment_id: int, payload: AssignmentCreate, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    a = db.get(Assignment, assignment_id)
    if not a or a.created_by != teacher.id:
        raise HTTPException(404, "Assignment not found.")
    for k, v in payload.model_dump().items():
        setattr(a, k, v)
    db.commit(); db.refresh(a)
    return a

@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    a = db.get(Assignment, assignment_id)
    if not a or a.created_by != teacher.id:
        raise HTTPException(404, "Assignment not found.")
    db.delete(a); db.commit()
    return {"message": "Assignment deleted."}
