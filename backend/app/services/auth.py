import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.models import User

security = HTTPBearer(auto_error=False)


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )

    token = credentials.credentials

    print("\n========== AUTH DEBUG ==========")
    print("APP_MODE:", os.getenv("APP_MODE", "local"))
    print("TOKEN RECEIVED:", bool(token))
    print("TOKEN LENGTH:", len(token))

    if os.getenv("APP_MODE", "local") == "cloud":

        try:
            from supabase import create_client
            from ..core.config import (
                SUPABASE_URL,
                SUPABASE_SERVICE_ROLE_KEY,
            )

            print("SUPABASE URL:", SUPABASE_URL)
            print(
                "SERVICE KEY PRESENT:",
                bool(SUPABASE_SERVICE_ROLE_KEY)
            )

            client = create_client(
                SUPABASE_URL,
                SUPABASE_SERVICE_ROLE_KEY
            )

            print("Calling Supabase get_user()...")

            result = client.auth.get_user(token)

            auth_user = result.user

            print("SUPABASE USER:", auth_user)

            if not auth_user:
                print("ERROR: Supabase returned no user")
                raise HTTPException(
                    status_code=401,
                    detail="Supabase did not return a user."
                )

            print("SUPABASE AUTH UID:", auth_user.id)

            user = (
                db.query(User)
                .filter(User.auth_uid == auth_user.id)
                .first()
            )

            print("LOCAL USER:", user)

            if not user:
                print(
                    "ERROR: No local User found for auth_uid:",
                    auth_user.id
                )

                raise HTTPException(
                    status_code=401,
                    detail="User profile not found."
                )

            print("LOCAL USER ID:", user.id)
            print("LOCAL USER ROLE:", user.role)
            print("========== AUTH SUCCESS ==========\n")

            return user

        except HTTPException:
            raise

        except Exception as exc:
            print("\n========== AUTH ERROR ==========")
            print("ERROR TYPE:", type(exc).__name__)
            print("ERROR:", repr(exc))
            print("========== END AUTH ERROR ==========\n")

            raise HTTPException(
                status_code=401,
                detail=f"Authentication failed: {str(exc)}"
            )

    # LOCAL MODE
    from ..core.security import decode_token

    uid = decode_token(token)

    if not uid:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token."
        )

    user = (
        db.query(User)
        .filter(User.auth_uid == uid)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found."
        )

    return user


def require_role(*roles):
    def dependency(user=Depends(current_user)):
        if user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission for this action."
            )
        return user

    return dependency