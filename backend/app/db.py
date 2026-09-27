import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


# ---------------------------------------------------------
# Load .env from the project root
# Project structure:
#
# Cloud-Based-Assignment-Submission-Portal/
# ├── .env
# ├── backend/
# │   └── app/
# │       └── db.py
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


# ---------------------------------------------------------
# Database configuration
# ---------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./portal.db"
    print("WARNING: DATABASE_URL not found. Using local SQLite database.")
else:
    print("DATABASE: Cloud database configuration loaded.")


# SQLite requires this option.
# PostgreSQL/Supabase does not.
connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)


# ---------------------------------------------------------
# SQLAlchemy engine
# ---------------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)


# ---------------------------------------------------------
# Database session
# ---------------------------------------------------------

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


# ---------------------------------------------------------
# Base model
# ---------------------------------------------------------

class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------
# FastAPI database dependency
# ---------------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()