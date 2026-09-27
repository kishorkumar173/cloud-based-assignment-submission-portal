# REST API

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| POST | /api/auth/register | Public | Register |
| POST | /api/auth/login | Public | Login |
| GET | /api/courses | Student/Teacher | List courses |
| POST | /api/courses | Teacher | Create course |
| POST | /api/assignments | Teacher | Create assignment |
| GET | /api/assignments | Student/Teacher | List assignments |
| GET | /api/assignments/{id} | Student/Teacher | Assignment detail |
| PUT | /api/assignments/{id} | Teacher | Update |
| DELETE | /api/assignments/{id} | Teacher | Delete |
| POST | /api/assignments/{id}/submit | Student | Upload |
| GET | /api/submissions/me | Student | Own submissions |
| GET | /api/assignments/{id}/submissions | Teacher | Review submissions |
| GET | /api/submissions/{id}/download | Authorized | Secure download |
| POST | /api/submissions/{id}/grade | Teacher | Grade |
| GET | /api/submissions/{id}/feedback | Student | Feedback |
| GET | /api/dashboard/student | Student | Dashboard metrics |
| GET | /api/dashboard/teacher | Teacher | Dashboard metrics |
