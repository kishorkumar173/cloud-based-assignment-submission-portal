# Cloud-Based Assignment Submission & Feedback Portal

A full-stack cloud-based platform designed to simplify the assignment submission, management, grading, and feedback process between students and teachers.

The system provides separate Student and Teacher workflows with secure authentication, cloud database storage, assignment management, file submission, grading, and feedback functionality.

---

## 🚀 Features

### 👨‍🎓 Student

* Student registration and login
* View available courses
* View assignments
* View assignment deadlines and requirements
* Upload assignment files
* Submit assignments before or after deadlines
* Track submission status
* View grades and teacher feedback
* Download submitted files

### 👨‍🏫 Teacher

* Teacher registration and login
* Create and manage courses
* Create assignments
* Configure assignment deadlines
* Define maximum marks
* Define allowed file types
* Define maximum file size
* View student submissions
* Download submitted assignments
* Grade submissions
* Provide feedback to students

### ☁️ Cloud Features

* Cloud PostgreSQL database using Supabase
* Cloud authentication using Supabase Auth
* Cloud file storage using Supabase Storage
* REST API backend using FastAPI
* Role-based access control
* Secure authentication using Bearer tokens
* Cloud-ready architecture

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Student        │
                    │      Teacher        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │      (Vite)         │
                    └──────────┬──────────┘
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │                     │
                    │ Authentication      │
                    │ Courses             │
                    │ Assignments         │
                    │ Submissions         │
                    │ Grading & Feedback  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │  Supabase   │  │  Supabase   │  │  Supabase   │
       │ PostgreSQL  │  │    Auth     │  │   Storage   │
       └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* HTML5
* CSS3

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

### Database

* PostgreSQL
* Supabase

### Authentication

* Supabase Authentication
* JWT / Bearer Token Authentication
* Role-based authorization

### Cloud Storage

* Supabase Storage

### Development Tools

* Git
* GitHub
* Visual Studio Code
* PowerShell

---

## 📁 Project Structure

```text
Cloud-Based-Assignment-Submission-Portal/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assignments.py
│   │   │   ├── auth.py
│   │   │   ├── courses.py
│   │   │   ├── dashboard.py
│   │   │   └── submissions.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth.py
│   │   │   └── storage.py
│   │   │
│   │   ├── db.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```

> Adjust the frontend folder name in this section if your actual React folder has a different name.

---

## 🔐 Environment Variables

Sensitive credentials must **never be committed to GitHub**.

Create a `.env` file locally.

Example:

```env
DATABASE_URL=your_supabase_postgresql_connection_string

APP_MODE=cloud

STORAGE_BACKEND=supabase

SUPABASE_URL=your_supabase_project_url

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

SUPABASE_BUCKET=assignments

MAX_UPLOAD_MB=50

CORS_ORIGINS=http://localhost:5173
```

### Important

Never commit:

```text
.env
```

or expose:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

in the public repository.

Use environment variables provided by the deployment platform when deploying the application.

---

## ⚙️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/cloud-based-assignment-submission-portal.git
```

### 2. Enter the project

```bash
cd cloud-based-assignment-submission-portal
```

---

## 🐍 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the environment variables in `.env`.

Start the backend:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

---

## ⚛️ Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🔑 User Roles

The application supports two primary roles:

### Student

Students can:

```text
Login
   ↓
View Courses
   ↓
View Assignments
   ↓
Submit Assignment
   ↓
Track Submission
   ↓
View Grade & Feedback
```

### Teacher

Teachers can:

```text
Login
   ↓
Create Course
   ↓
Create Assignment
   ↓
View Submissions
   ↓
Download Submission
   ↓
Grade Assignment
   ↓
Provide Feedback
```

---

## 📊 Database

The application uses PostgreSQL through Supabase.

The main entities include:

```text
Users
Courses
Assignments
Submissions
```

Relationships:

```text
Teacher
   │
   └── Courses
          │
          └── Assignments
                    │
                    └── Submissions
                              │
                              └── Student
```

---

## ☁️ Cloud Deployment

The application is designed to be deployed using cloud hosting services.

The deployment consists of:

```text
React Frontend
       │
       ▼
Frontend Hosting
       │
       ▼
FastAPI Backend
       │
       ├──────────► Supabase PostgreSQL
       │
       ├──────────► Supabase Auth
       │
       └──────────► Supabase Storage
```

Environment variables should be configured through the deployment platform rather than committed to the repository.

---

## 🔒 Security

The project implements:

* Authentication
* Bearer token authorization
* Role-based access control
* Teacher/student permission separation
* File type validation
* File size validation
* Assignment ownership validation
* Submission ownership validation
* Secure environment variable configuration

---

## 🧪 Testing

The application has been tested for the primary Student and Teacher workflows, including:

* User registration
* User login
* Course creation
* Assignment creation
* Assignment viewing
* Assignment submission
* Submission tracking
* Teacher submission management
* Assignment grading
* Feedback viewing
* File upload and download
* Cloud database connectivity

---

## 🎯 Project Objective

The objective of this project is to provide a centralized cloud-based platform for managing the complete assignment lifecycle.

Instead of relying on multiple communication channels and manual processes, the platform integrates:

```text
Assignment Creation
        ↓
Assignment Submission
        ↓
Submission Management
        ↓
Evaluation
        ↓
Feedback
        ↓
Student Tracking
```

into a single system.

---

## 🔮 Future Enhancements

Potential future improvements include:

* Email notifications
* Assignment reminder notifications
* Advanced teacher analytics
* Student performance analytics
* Plagiarism detection
* AI-assisted feedback
* Assignment recommendation system
* Automated grading for selected assignment types
* Dashboard analytics
* Mobile application
* Multi-institution support

---

## 👨‍💻 Author

**Kishor Kumar L**

BE Computer Science & Engineering – AI & ML

AMC Engineering College

---

## 📄 License

This project is developed for academic and educational purposes.
