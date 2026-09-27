from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str
    password: str = Field(min_length=8)
    role: str = Field(pattern="^(student|teacher)$")

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    auth_uid: str
    name: str
    email: str
    role: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class AssignmentCreate(BaseModel):
    course_id: int
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    deadline: datetime
    max_marks: int = Field(gt=0, le=1000)
    allowed_file_types: str = "pdf,docx"
    max_file_size_mb: int = Field(gt=0, le=50)

class AssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_id: int
    title: str
    description: str
    deadline: datetime
    max_marks: int
    allowed_file_types: str
    max_file_size_mb: int

class CourseCreate(BaseModel):
    course_name: str = Field(min_length=2, max_length=150)

class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_name: str
    teacher_id: int

class GradeRequest(BaseModel):
    marks: int = Field(ge=0)
    feedback: str = Field(default="", max_length=5000)

class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    assignment_id: int
    student_id: int
    file_name: str
    storage_path: str
    submitted_at: datetime
    submission_status: str
    marks: int | None
    feedback: str | None
    graded_at: datetime | None
    version: int
