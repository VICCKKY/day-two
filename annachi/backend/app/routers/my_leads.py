from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_supplier
from app.config import settings
from app.database import get_db
from app.models import BadLeadReport, Supplier, Unlock, utcnow
from app.schemas import FunnelOut, MyLeadOut, MyLeadUpdate, ReportIn, ReportOut
from app.services import to_detail

router = APIRouter(prefix="/my-leads", tags=["my leads"])


def _out(db: Session, u: Unlock) -> MyLeadOut:
    report = u.reports[-1].status if u.reports else None
    return MyLeadOut(
        unlock_id=u.id, lead=to_detail(db, u.lead, u), status=u.status, follow_up_date=u.follow_up_date,
        notes=u.notes, order_value_inr=u.order_value_inr, report_status=report, created_at=u.created_at,
    )


def _own(db: Session, me: Supplier, unlock_id: int) -> Unlock:
    u = db.get(Unlock, unlock_id)
    if u is None or u.supplier_id != me.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    return u


@router.get("", response_model=list[MyLeadOut])
def list_my_leads(me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> list[MyLeadOut]:
    rows = db.scalars(select(Unlock).where(Unlock.supplier_id == me.id).order_by(Unlock.updated_at.desc()))
    return [_out(db, u) for u in rows]


@router.get("/funnel", response_model=FunnelOut)
def funnel(me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> FunnelOut:
    """The decided success metric: unlocked → called → ... → won."""
    statuses = [u.status for u in db.scalars(select(Unlock).where(Unlock.supplier_id == me.id))]
    won_value = db.scalars(
        select(Unlock.order_value_inr).where(Unlock.supplier_id == me.id, Unlock.status == "won")
    )

    def count(*stages: str) -> int:
        return sum(1 for s in statuses if s in stages)

    return FunnelOut(
        unlocked=len(statuses),
        called=count("called", "interested", "quote_sent", "won", "lost"),
        interested=count("interested", "quote_sent", "won"),
        quote_sent=count("quote_sent", "won"),
        won=count("won"),
        lost=count("lost"),
        won_value_inr=sum(v or 0 for v in won_value),
    )


@router.patch("/{unlock_id}", response_model=MyLeadOut)
def update(unlock_id: int, body: MyLeadUpdate, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> MyLeadOut:
    u = _own(db, me, unlock_id)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(u, field, value)
    db.commit()
    return _out(db, u)


@router.post("/{unlock_id}/report", response_model=ReportOut)
def report(unlock_id: int, body: ReportIn, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> ReportOut:
    u = _own(db, me, unlock_id)
    if utcnow() - u.created_at > timedelta(days=settings.report_window_days):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Reports allowed within {settings.report_window_days} days")
    if any(r.status in ("pending", "approved") for r in u.reports):
        raise HTTPException(status.HTTP_409_CONFLICT, "Already reported")
    r = BadLeadReport(unlock_id=u.id, reason=body.reason, details=body.details)
    db.add(r)
    db.commit()
    return ReportOut.model_validate(r, from_attributes=True)
