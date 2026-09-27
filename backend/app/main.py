import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .db import Base, engine
from .core.config import CORS_ORIGINS
from .api import auth, courses, assignments, submissions, dashboard

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud Assignment Submission & Feedback Portal",
    version="1.0.0",
    description="Industry-oriented cloud computing course project."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(assignments.router)
app.include_router(submissions.router)
app.include_router(dashboard.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "assignment-portal-api"}
