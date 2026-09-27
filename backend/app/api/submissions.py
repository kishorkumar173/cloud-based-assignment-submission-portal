from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db import get_db
from ..models.models import Assignment, Submission, Course
from ..models.schemas import SubmissionOut, GradeRequest
from ..services.auth import require_role
from ..services.storage import validate_file, save_upload, read_file
from ..core.config import MAX_UPLOAD_MB

router = APIRouter(prefix="/api", tags=["Submissions"])

@router.post("/assignments/{assignment_id}/submit", response_model=SubmissionOut)
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    student=Depends(require_role("student")),
):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(404, "Assignment not found.")

    now = datetime.now(timezone.utc)
    deadline = assignment.deadline
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    previous = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.student_id == student.id
    ).order_by(desc(Submission.version)).first()

    if previous:
        version = previous.version + 1
        if previous.marks is not None:
            raise HTTPException(409, "A graded submission cannot be resubmitted.")
    else:
        version = 1

    validate_file(file, min(assignment.max_file_size_mb, MAX_UPLOAD_MB), assignment.allowed_file_types)
    status = "SUBMITTED" if now <= deadline else "LATE"
    safe_name = Path(file.filename).name
    storage_path = f"assignments/assignment_{assignment.id}/student_{student.id}/v{version}_{safe_name}"

    await save_upload(file, storage_path, min(assignment.max_file_size_mb, MAX_UPLOAD_MB))

    submission = Submission(
        assignment_id=assignment.id,
        student_id=student.id,
        file_name=safe_name,
        storage_path=storage_path,
        submitted_at=now,
        submission_status=status,
        version=version,
    )
    db.add(submission); db.commit(); db.refresh(submission)
    return submission

@router.get("/submissions/me", response_model=list[SubmissionOut])
def my_submissions(db: Session = Depends(get_db), student=Depends(require_role("student"))):
    return db.query(Submission).filter(Submission.student_id == student.id).order_by(desc(Submission.submitted_at)).all()

@router.get("/assignments/{assignment_id}/submissions", response_model=list[SubmissionOut])
def assignment_submissions(assignment_id: int, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    assignment = db.get(Assignment, assignment_id)
    if not assignment or assignment.created_by != teacher.id:
        raise HTTPException(403, "Not authorized.")
    return db.query(Submission).filter(Submission.assignment_id == assignment_id).order_by(desc(Submission.submitted_at)).all()

@router.get("/submissions/{submission_id}", response_model=SubmissionOut)
def get_submission(submission_id: int, db: Session = Depends(get_db), user=Depends(require_role("student", "teacher"))):
    s = db.get(Submission, submission_id)
    if not s:
        raise HTTPException(404, "Submission not found.")
    if user.role == "student" and s.student_id != user.id:
        raise HTTPException(403, "You can only view your own submission.")
    if user.role == "teacher" and s.assignment.created_by != user.id:
        raise HTTPException(403, "Not authorized.")
    return s

@router.get("/submissions/{submission_id}/download")
def download_submission(submission_id: int, db: Session = Depends(get_db), user=Depends(require_role("student", "teacher"))):
    s = db.get(Submission, submission_id)
    if not s:
        raise HTTPException(404, "Submission not found.")
    if user.role == "student" and s.student_id != user.id:
        raise HTTPException(403, "You can only download your own submission.")
    if user.role == "teacher" and s.assignment.created_by != user.id:
        raise HTTPException(403, "Not authorized.")
    data, filename = read_file(s.storage_path)
    return Response(content=data, media_type="application/octet-stream",
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})

@router.post("/submissions/{submission_id}/grade", response_model=SubmissionOut)
def grade_submission(submission_id: int, payload: GradeRequest, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    s = db.get(Submission, submission_id)
    if not s or s.assignment.created_by != teacher.id:
        raise HTTPException(404, "Submission not found.")
    if payload.marks > s.assignment.max_marks:
        raise HTTPException(422, f"Marks cannot exceed {s.assignment.max_marks}.")
    s.marks = payload.marks
    s.feedback = payload.feedback
    s.graded_at = datetime.now(timezone.utc)
    s.submission_status = "GRADED"
    db.commit(); db.refresh(s)
    return s

@router.get("/submissions/{submission_id}/feedback")
def get_feedback(submission_id: int, db: Session = Depends(get_db), student=Depends(require_role("student"))):
    s = db.get(Submission, submission_id)
    if not s or s.student_id != student.id:
        raise HTTPException(403, "Not authorized.")
    return {"marks": s.marks, "feedback": s.feedback, "graded_at": s.graded_at}
