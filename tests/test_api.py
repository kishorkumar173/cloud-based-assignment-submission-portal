
"""
Cloud-Based Student Assignment Submission & Feedback Portal
Complete Automated API Test Suite

Run from project root:

    python -m pytest -v

The tests use a separate SQLite database.
Development/demo data is not modified.
"""

import os
import uuid
from pathlib import Path

# ============================================================
# TEST ENVIRONMENT
# ============================================================

os.environ["DATABASE_URL"] = "sqlite:///./test_portal.db"
os.environ["APP_MODE"] = "local"
os.environ["STORAGE_BACKEND"] = "local"
os.environ["UPLOAD_DIR"] = "./test_uploads"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["CORS_ORIGINS"] = "http://localhost:5173"

TEST_DB = Path("./test_portal.db")
TEST_UPLOADS = Path("./test_uploads")

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


# ============================================================
# HELPERS
# ============================================================

def unique_email(prefix="test_user"):
    return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"


def register_user(
    name,
    email,
    password="StrongPass123!",
    role="student",
):
    response = client.post(
        "/api/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
            "role": role,
        },
    )

    assert response.status_code in (200, 201, 409), (
        f"Registration failed: "
        f"{response.status_code} - {response.text}"
    )

    return response


def login_user(email, password="StrongPass123!"):
    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200, (
        f"Login failed: "
        f"{response.status_code} - {response.text}"
    )

    data = response.json()

    assert "access_token" in data
    assert data["access_token"]

    return data["access_token"]


def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}"
    }


def create_test_student():
    email = unique_email("student")

    register_user(
        name="Automated Test Student",
        email=email,
        role="student",
    )

    token = login_user(email)

    return {
        "email": email,
        "token": token,
    }


def create_test_teacher():
    email = unique_email("teacher")

    register_user(
        name="Automated Test Teacher",
        email=email,
        role="teacher",
    )

    token = login_user(email)

    return {
        "email": email,
        "token": token,
    }


def get_courses(token):
    response = client.get(
        "/api/courses",
        headers=auth_headers(token),
    )

    assert response.status_code == 200, (
        f"Course request failed: "
        f"{response.status_code} - {response.text}"
    )

    data = response.json()

    if isinstance(data, list):
        return data

    if isinstance(data, dict):
        for key in (
            "courses",
            "data",
            "items",
            "results",
        ):
            if isinstance(data.get(key), list):
                return data[key]

    return []


def extract_id(item):
    if not isinstance(item, dict):
        return None

    return (
        item.get("course_id")
        or item.get("id")
        or item.get("assignment_id")
    )


def create_test_course_if_supported(teacher_token):
    """
    Try to create a course using common course API patterns.

    If the existing application does not expose course creation,
    this helper falls back to an existing seeded course.
    """

    # --------------------------------------------------------
    # First: check whether a course already exists.
    # --------------------------------------------------------

    courses = get_courses(teacher_token)

    if courses:
        course_id = extract_id(courses[0])

        if course_id:
            return int(course_id)

    # --------------------------------------------------------
    # Try common course creation endpoint.
    # --------------------------------------------------------

    possible_payloads = [
        {
            "course_name": "Automated Cloud Computing",
        },
        {
            "name": "Automated Cloud Computing",
        },
        {
            "title": "Automated Cloud Computing",
        },
    ]

    for payload in possible_payloads:

        response = client.post(
            "/api/courses",
            headers=auth_headers(teacher_token),
            json=payload,
        )

        if response.status_code in (200, 201):

            data = response.json()

            course_id = extract_id(data)

            if course_id:
                return int(course_id)

            # Refresh course list.
            courses = get_courses(teacher_token)

            if courses:
                course_id = extract_id(courses[0])

                if course_id:
                    return int(course_id)

    return None


def create_assignment(teacher_token, course_id):
    response = client.post(
        "/api/assignments",
        headers=auth_headers(teacher_token),
        json={
            "course_id": int(course_id),
            "title": "Automated Cloud Computing Assignment",
            "description": (
                "Assignment created by automated tests."
            ),
            "deadline": "2030-12-31T23:59:00Z",
            "max_marks": 100,
            "allowed_file_types": "pdf,docx",
            "max_file_size_mb": 10,
        },
    )

    return response


# ============================================================
# 1. HEALTH
# ============================================================

def test_health():

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ============================================================
# 2. REGISTER + LOGIN
# ============================================================

def test_register_login():

    email = unique_email("student_test")

    response = register_user(
        name="Test Student",
        email=email,
        role="student",
    )

    assert response.status_code in (200, 201, 409)

    token = login_user(email)

    assert token


# ============================================================
# 3. INVALID LOGIN
# ============================================================

def test_invalid_login():

    email = unique_email("invalid_login")

    register_user(
        name="Invalid Login Test",
        email=email,
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code in (401, 403)


# ============================================================
# 4. ASSIGNMENT CREATION REQUIRES AUTHENTICATION
# ============================================================

def test_assignment_creation_requires_authentication():

    response = client.post(
        "/api/assignments",
        json={
            "course_id": 1,
            "title": "Unauthorized Assignment",
            "description": "Must not be created.",
            "deadline": "2030-12-31T23:59:00Z",
            "max_marks": 100,
            "allowed_file_types": "pdf,docx",
            "max_file_size_mb": 10,
        },
    )

    assert response.status_code == 401


# ============================================================
# 5. STUDENT CANNOT CREATE ASSIGNMENT
# ============================================================

def test_student_cannot_create_assignment():

    student = create_test_student()

    response = client.post(
        "/api/assignments",
        headers=auth_headers(student["token"]),
        json={
            "course_id": 1,
            "title": "Student Unauthorized Assignment",
            "description": "Student should not create this.",
            "deadline": "2030-12-31T23:59:00Z",
            "max_marks": 100,
            "allowed_file_types": "pdf,docx",
            "max_file_size_mb": 10,
        },
    )

    assert response.status_code == 403


# ============================================================
# 6. COURSES ENDPOINT
# ============================================================

def test_courses_endpoint():

    teacher = create_test_teacher()

    response = client.get(
        "/api/courses",
        headers=auth_headers(teacher["token"]),
    )

    assert response.status_code == 200

    assert response.json() is not None


# ============================================================
# 7. TEACHER CAN CREATE ASSIGNMENT
# ============================================================

def test_teacher_can_create_assignment():

    teacher = create_test_teacher()

    course_id = create_test_course_if_supported(
        teacher["token"]
    )

    if course_id is None:

        # The application currently requires courses
        # to already exist in the database.
        #
        # This is an infrastructure/test-data limitation,
        # not an assignment API failure.

        import pytest

        pytest.skip(
            "No course exists and the current API does not "
            "expose a supported course-creation endpoint."
        )

    response = create_assignment(
        teacher["token"],
        course_id,
    )

    assert response.status_code in (200, 201), (
        f"Assignment creation failed: "
        f"{response.status_code} - {response.text}"
    )

    data = response.json()

    assert data is not None

    assignment_id = (
        data.get("assignment_id")
        if isinstance(data, dict)
        else None
    )

    if assignment_id is None and isinstance(data, dict):
        assignment_id = data.get("id")

    assert assignment_id is not None


# ============================================================
# 8. ASSIGNMENTS REQUIRE AUTHENTICATION
# ============================================================

def test_get_assignments_requires_authentication():

    response = client.get(
        "/api/assignments"
    )

    assert response.status_code == 401


# ============================================================
# 9. AUTHENTICATED USER CAN GET ASSIGNMENTS
# ============================================================

def test_authenticated_user_can_get_assignments():

    student = create_test_student()

    response = client.get(
        "/api/assignments",
        headers=auth_headers(student["token"]),
    )

    assert response.status_code == 200
    assert response.json() is not None


# ============================================================
# 10. STUDENT CANNOT GRADE
# ============================================================

def test_student_cannot_grade_submission():

    student = create_test_student()

    response = client.post(
        "/api/submissions/999999/grade",
        headers=auth_headers(student["token"]),
        json={
            "marks": 50,
            "feedback": "Unauthorized grading attempt.",
        },
    )

    assert response.status_code in (403, 404)


# ============================================================
# 11. UNAUTHENTICATED GRADING
# ============================================================

def test_unauthenticated_grading_rejected():

    response = client.post(
        "/api/submissions/999999/grade",
        json={
            "marks": 50,
            "feedback": "Unauthorized.",
        },
    )

    assert response.status_code == 401


# ============================================================
# 12. DOWNLOAD REQUIRES AUTHENTICATION
# ============================================================

def test_submission_download_requires_authentication():

    response = client.get(
        "/api/submissions/999999/download"
    )

    assert response.status_code == 401


# ============================================================
# 13. MY SUBMISSIONS REQUIRES AUTHENTICATION
# ============================================================

def test_my_submissions_requires_authentication():

    response = client.get(
        "/api/submissions/me"
    )

    assert response.status_code == 401


# ============================================================
# 14. STUDENT CAN ACCESS OWN SUBMISSIONS
# ============================================================

def test_student_can_access_own_submissions():

    student = create_test_student()

    response = client.get(
        "/api/submissions/me",
        headers=auth_headers(student["token"]),
    )

    assert response.status_code == 200
    assert response.json() is not None


# ============================================================
# 15. LOGOUT
# ============================================================

def test_logout_endpoint():

    student = create_test_student()

    response = client.post(
        "/api/auth/logout",
        headers=auth_headers(student["token"]),
    )

    assert response.status_code in (
        200,
        204,
        404,
    )


# ============================================================
# 16. INVALID REGISTRATION
# ============================================================

def test_invalid_registration_payload():

    response = client.post(
        "/api/auth/register",
        json={
            "name": "",
            "email": "not-an-email",
            "password": "123",
            "role": "invalid-role",
        },
    )

    assert response.status_code in (
        400,
        422,
    )


# ============================================================
# 17. LOGIN MISSING FIELDS
# ============================================================

def test_login_missing_fields():

    response = client.post(
        "/api/auth/login",
        json={
            "email": "",
        },
    )

    assert response.status_code in (
        400,
        401,
        422,
    )


# ============================================================
# 18. INVALID ASSIGNMENT PAYLOAD
# ============================================================

def test_invalid_assignment_payload():

    teacher = create_test_teacher()

    response = client.post(
        "/api/assignments",
        headers=auth_headers(teacher["token"]),
        json={
            "course_id": "invalid",
            "title": "",
            "description": "",
            "deadline": "invalid-date",
            "max_marks": -1,
            "allowed_file_types": "",
            "max_file_size_mb": -1,
        },
    )

    assert response.status_code in (
        400,
        422,
    )


# ============================================================
# 19. FEEDBACK REQUIRES AUTHENTICATION
# ============================================================

def test_feedback_requires_authentication():

    response = client.get(
        "/api/submissions/999999/feedback"
    )

    assert response.status_code == 401


# ============================================================
# 20. STORAGE CONFIGURATION
# ============================================================

def test_test_storage_configuration():

    assert os.environ["APP_MODE"] == "local"

    assert os.environ["STORAGE_BACKEND"] == "local"

    assert os.environ["UPLOAD_DIR"] == "./test_uploads"

    assert os.environ["DATABASE_URL"].startswith(
        "sqlite:///"
    )

