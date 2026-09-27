import os

APP_MODE = os.getenv("APP_MODE", "local")  # local | cloud
STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "local")  # local | supabase
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "50"))
CORS_ORIGINS = [x.strip() for x in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173"
).split(",") if x.strip()]

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "assignments")
