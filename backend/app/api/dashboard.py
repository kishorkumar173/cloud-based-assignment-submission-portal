from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.models import Assignment, Submission, Course
from ..services.auth import require_role

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/student")
def student_dashboard(db: Session = Depends(get_db), student=Depends(require_role("student"))):
    assignments = db.query(Assignment).all()
    submissions = db.query(Submission).filter(Submission.student_id == student.id).all()
    submitted_ids = {s.assignment_id for s in submissions}
    now = datetime.now(timezone.utc)
    return {
        "total_assignments": len(assignments),
        "pending_assignments": sum(1 for a in assignments if a.id not in submitted_ids),
        "submitted_assignments": sum(1 for s in submissions if s.submission_status in ("SUBMITTED", "LATE")),
        "late_assignments": sum(1 for s in submissions if s.submission_status == "LATE"),
        "graded_assignments": sum(1 for s in submissions if s.submission_status == "GRADED"),
        "upcoming_deadlines": sum(1 for a in assignments if a.deadline >= now),
        "recent_feedback": [
            {"assignment_id": s.assignment_id, "marks": s.marks, "feedback": s.feedback}
            for s in sorted(submissions, key=lambda x: x.submitted_at, reverse=True)[:5]
            if s.feedback
        ],
    }

@router.get("/teacher")
def teacher_dashboard(db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    assignments = db.query(Assignment).filter(Assignment.created_by == teacher.id).all()
    assignment_ids = [a.id for a in assignments]
    submissions = db.query(Submission).filter(Submission.assignment_id.in_(assignment_ids)).all() if assignment_ids else []
    return {
        "total_assignments": len(assignments),
        "total_students": len({s.student_id for s in submissions}),
        "total_submissions": len(submissions),
        "pending_reviews": sum(1 for s in submissions if s.marks is None),
        "late_submissions": sum(1 for s in submissions if s.submission_status == "LATE"),
        "graded_submissions": sum(1 for s in submissions if s.submission_status == "GRADED"),
        "recent_uploads": [
            {"submission_id": s.id, "file_name": s.file_name, "student_id": s.student_id}
            for s in sorted(submissions, key=lambda x: x.submitted_at, reverse=True)[:10]
        ],
    }
