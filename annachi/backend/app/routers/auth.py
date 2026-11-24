import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import create_token
from app.config import settings
from app.database import get_db
from app.models import Supplier
from app.schemas import OtpRequest, OtpRequestOut, OtpVerify, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])
log = logging.getLogger(__name__)


@router.post("/otp/request", response_model=OtpRequestOut)
def request_otp(body: OtpRequest) -> OtpRequestOut:
    if not settings.demo_mode:
        # Real SMS provider (e.g. MSG91 / Firebase Auth) goes here.
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "SMS OTP not configured")
    log.info("Demo OTP requested for %s", body.phone[-4:])
    return OtpRequestOut(sent=True, demo_otp=settings.demo_otp)


@router.post("/otp/verify", response_model=TokenOut)
def verify_otp(body: OtpVerify, db: Session = Depends(get_db)) -> TokenOut:
    if not settings.demo_mode or body.otp != settings.demo_otp:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Wrong OTP")
    supplier = db.scalar(select(Supplier).where(Supplier.phone == body.phone))
    is_new = supplier is None
    if supplier is None:
        supplier = Supplier(phone=body.phone)
        db.add(supplier)
        db.commit()
    return TokenOut(access_token=create_token(supplier.id), is_new=is_new)
