from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import current_supplier
from app.config import settings
from app.database import get_db
from app.models import Lead, Supplier, Unlock, WalletTxn
from app.schemas import LeadCard, LeadDetail
from app.services import listable_leads, membership_active, split, to_card, to_detail, unlock_count

router = APIRouter(prefix="/leads", tags=["leads"])


def _own_unlocks(db: Session, supplier_id: int) -> dict[int, Unlock]:
    rows = db.scalars(select(Unlock).where(Unlock.supplier_id == supplier_id))
    return {u.lead_id: u for u in rows}


@router.get("", response_model=list[LeadCard])
def feed(
    q: str = "",
    category: str = "",
    city: str = "",
    mine_only: bool = Query(False, description="Only my profile's categories and cities"),
    me: Supplier = Depends(current_supplier),
    db: Session = Depends(get_db),
) -> list[LeadCard]:
    stmt = listable_leads()
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Lead.product.ilike(like), Lead.category.ilike(like), Lead.city.ilike(like)))
    if category:
        stmt = stmt.where(Lead.category == category)
    if city:
        stmt = stmt.where(Lead.city == city)
    if mine_only:
        if cats := split(me.categories):
            stmt = stmt.where(Lead.category.in_(cats))
        if cities := split(me.cities):
            stmt = stmt.where(Lead.city.in_(cities))
    own = _own_unlocks(db, me.id)
    cards = [to_card(db, lead, own.get(lead.id)) for lead in db.scalars(stmt.order_by(Lead.verified_at.desc()))]
    # Leads someone else already took exclusively are hidden, not shown as "sold out" bait.
    return [c for c in cards if c.available]


def _get_listable(db: Session, lead_id: int) -> Lead:
    lead = db.scalar(listable_leads().where(Lead.id == lead_id))
    if lead is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lead not found")
    return lead


@router.get("/{lead_id}", response_model=LeadDetail)
def detail(lead_id: int, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> LeadDetail:
    lead = _get_listable(db, lead_id)
    own = db.scalar(select(Unlock).where(Unlock.supplier_id == me.id, Unlock.lead_id == lead_id))
    out = to_detail(db, lead, own)
    if not out.available:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lead not found")
    return out


@router.post("/{lead_id}/unlock", response_model=LeadDetail)
def unlock(lead_id: int, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> LeadDetail:
    lead = _get_listable(db, lead_id)
    own = db.scalar(select(Unlock).where(Unlock.supplier_id == me.id, Unlock.lead_id == lead_id))
    if own is not None:
        return to_detail(db, lead, own)  # never charge twice
    if not membership_active(me):
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, "Membership required")
    if me.credits < 1:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, "Not enough credits")
    if unlock_count(db, lead_id) >= settings.max_unlocks_per_lead:
        raise HTTPException(status.HTTP_409_CONFLICT, "Lead no longer available")
    own = Unlock(supplier_id=me.id, lead_id=lead_id)
    me.credits -= 1
    db.add(own)
    db.add(WalletTxn(supplier_id=me.id, kind="unlock", credits_delta=-1, reference=f"lead-{lead_id}"))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Already unlocked")
    return to_detail(db, lead, own)
