import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_supplier
from app.config import LEAD_PACKS, settings
from app.database import get_db
from app.models import Supplier, WalletTxn, utcnow
from app.schemas import PackOut, TxnOut, WalletOut
from app.services import membership_active

router = APIRouter(prefix="/wallet", tags=["wallet"])


def _demo_ref() -> str:
    return "DEMO-" + uuid.uuid4().hex[:10].upper()


def _require_demo() -> None:
    if not settings.demo_mode:
        # Razorpay order + webhook verification replaces this before real money moves.
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "Payment gateway not configured")


def _wallet(db: Session, me: Supplier) -> WalletOut:
    txns = db.scalars(
        select(WalletTxn).where(WalletTxn.supplier_id == me.id).order_by(WalletTxn.id.desc()).limit(50)
    )
    return WalletOut(
        credits=me.credits,
        membership_until=me.membership_until,
        membership_active=membership_active(me),
        membership_price_inr=settings.membership_price_inr,
        packs=[PackOut(code=k, credits=c, price_inr=p) for k, (c, p) in LEAD_PACKS.items()],
        history=[TxnOut.model_validate(t, from_attributes=True) for t in txns],
        demo_payments=settings.demo_mode,
    )


@router.get("", response_model=WalletOut)
def get_wallet(me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> WalletOut:
    return _wallet(db, me)


@router.post("/membership", response_model=WalletOut)
def buy_membership(me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> WalletOut:
    _require_demo()
    now = utcnow()
    start = me.membership_until if membership_active(me, now) else now
    me.membership_until = start + timedelta(days=settings.membership_days)
    db.add(WalletTxn(supplier_id=me.id, kind="membership", amount_inr=settings.membership_price_inr, reference=_demo_ref()))
    db.commit()
    return _wallet(db, me)


@router.post("/packs/{code}", response_model=WalletOut)
def buy_pack(code: str, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> WalletOut:
    _require_demo()
    if code not in LEAD_PACKS:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown pack")
    if not membership_active(me):
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, "Membership required")
    credits, price = LEAD_PACKS[code]
    me.credits += credits
    db.add(WalletTxn(supplier_id=me.id, kind="pack", credits_delta=credits, amount_inr=price, reference=_demo_ref()))
    db.commit()
    return _wallet(db, me)
