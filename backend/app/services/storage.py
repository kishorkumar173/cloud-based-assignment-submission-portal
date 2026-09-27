import os
from pathlib import Path
from fastapi import UploadFile, HTTPException
from ..core.config import STORAGE_BACKEND, UPLOAD_DIR, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET

ALLOWED = {"pdf", "docx", "doc", "zip", "png", "jpg", "jpeg"}

def validate_file(upload: UploadFile, max_mb: int, allowed_csv: str):
    ext = Path(upload.filename or "").suffix.lower().lstrip(".")
    allowed = {x.strip().lower().lstrip(".") for x in allowed_csv.split(",") if x.strip()}
    allowed = allowed or ALLOWED
    if ext not in allowed:
        raise HTTPException(400, f"File type .{ext} is not allowed.")
    if not upload.filename:
        raise HTTPException(400, "Filename is required.")
    return ext

async def save_upload(upload: UploadFile, path: str, max_mb: int) -> str:
    max_bytes = max_mb * 1024 * 1024
    data = await upload.read()
    if len(data) > max_bytes:
        raise HTTPException(413, f"File exceeds {max_mb} MB.")
    if STORAGE_BACKEND == "local":
        target = Path(UPLOAD_DIR) / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        return str(target)
    try:
        from supabase import create_client
        client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        client.storage.from_(SUPABASE_BUCKET).upload(
            path, data, {"content-type": upload.content_type or "application/octet-stream", "upsert": "true"}
        )
        return path
    except Exception as exc:
        raise HTTPException(503, f"Cloud storage upload failed: {exc}")

def read_file(path: str) -> tuple[bytes, str]:
    if STORAGE_BACKEND == "local":
        p = Path(path)
        if not p.exists():
            raise HTTPException(404, "Stored file not found.")
        return p.read_bytes(), p.name
    try:
        from supabase import create_client
        client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        data = client.storage.from_(SUPABASE_BUCKET).download(path)
        return data, Path(path).name
    except Exception as exc:
        raise HTTPException(503, f"Cloud storage download failed: {exc}")

def delete_file(path: str):
    if STORAGE_BACKEND == "local":
        p = Path(path)
        if p.exists():
            p.unlink()
        return
    try:
        from supabase import create_client
        client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        client.storage.from_(SUPABASE_BUCKET).remove([path])
    except Exception:
        pass
