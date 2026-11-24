from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Supplier

_bearer = HTTPBearer(auto_error=False)


def create_token(supplier_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_minutes)
    return jwt.encode({"sub": str(supplier_id), "exp": exp}, settings.secret_key, algorithm="HS256")


def current_supplier(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Supplier:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login required")
    try:
        payload = jwt.decode(creds.credentials, settings.secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    supplier = db.get(Supplier, int(payload["sub"]))
    if supplier is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Account not found")
    return supplier


def require_admin(x_admin_token: str = Header(default="")) -> None:
    if x_admin_token != settings.admin_token:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin token required")
