import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL is missing from .env")

print("Testing Supabase PostgreSQL connection...")

engine = create_engine(database_url, pool_pre_ping=True)

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Database response:", result.scalar())
        print("Cloud database connection successful!")

except Exception as e:
    print("Cloud database connection FAILED!")
    print(type(e).__name__, ":", e)
    
