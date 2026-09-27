import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL is not configured")

print("Testing database connection...")

engine = create_engine(
    database_url,
    pool_pre_ping=True,
)

with engine.connect() as connection:
    result = connection.execute(
        text("SELECT 1")
    )

    print("Database response:", result.scalar())

print("Cloud database connection successful!")