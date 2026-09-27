import os, uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.models import User
from ..models.schemas import RegisterRequest, LoginRequest, AuthResponse, UserOut
from ..core.security import hash_password, verify_password, create_token
from ..core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(409, "Email already registered.")

    if os.getenv("APP_MODE", "local") == "cloud":
        try:
            from supabase import create_client
            client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            res = client.auth.admin.create_user({
                "email": payload.email.lower(),
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {"name": payload.name, "role": payload.role},
            })
            auth_user = res.user
            if not auth_user:
                raise Exception("Could not create authentication user.")
            uid = auth_user.id
            login = client.auth.sign_in_with_password({
                "email": payload.email.lower(),
                "password": payload.password
            })
            token = login.session.access_token
        except Exception as exc:
            raise HTTPException(400, f"Cloud authentication registration failed: {exc}")
    else:
        uid = str(uuid.uuid4())
        token = create_token(uid)

    user = User(
        auth_uid=uid,
        name=payload.name,
        email=payload.email.lower(),
        role=payload.role,
        password_hash=None if os.getenv("APP_MODE", "local") == "cloud" else hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(access_token=token, user=user)

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(401, "Invalid email or password.")

    if os.getenv("APP_MODE", "local") == "cloud":
        try:
            from supabase import create_client
            client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            login = client.auth.sign_in_with_password({
                "email": payload.email.lower(),
                "password": payload.password
            })
            token = login.session.access_token
        except Exception:
            raise HTTPException(401, "Invalid email or password.")
    else:
        if not user.password_hash or not verify_password(payload.password, user.password_hash):
            raise HTTPException(401, "Invalid email or password.")
        token = create_token(user.auth_uid)

    return AuthResponse(access_token=token, user=user)
