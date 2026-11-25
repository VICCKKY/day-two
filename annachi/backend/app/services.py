"""Business rules shared by routers."""
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Lead, Supplier, Unlock, utcnow
from app.schemas import LeadCard, LeadDetail, MeOut


def split(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


def membership_active(supplier: Supplier, now: datetime | None = None) -> bool:
    now = now or utcnow()
    return supplier.membership_until is not None and supplier.membership_until > now


def me_out(s: Supplier) -> MeOut:
    return MeOut(
        id=s.id, phone=s.phone, business_name=s.business_name, owner_name=s.owner_name,
        gstin=s.gstin, categories=split(s.categories), cities=split(s.cities), moq=s.moq,
        language=s.language, membership_until=s.membership_until,
        membership_active=membership_active(s), credits=s.credits,
        profile_complete=bool(s.business_name and s.categories and s.cities),
        slug=s.slug, catalog_public=s.catalog_public, whatsapp_phone=s.whatsapp_phone or s.phone,
    )


def listable_leads():
    """Shared feed: only leads our team verified AND got consent for, never a supplier's own catalogue quotes."""
    return select(Lead).where(
        Lead.is_active.is_(True),
        Lead.owner_supplier_id.is_(None),
        Lead.verified_at.is_not(None),
        Lead.consent_at.is_not(None),
        Lead.consent_source != "",
    )


def unlock_count(db: Session, lead_id: int) -> int:
    return db.scalar(select(func.count(Unlock.id)).where(Unlock.lead_id == lead_id)) or 0


def mask_phone(phone: str) -> str:
    return phone[:2] + "XXXXXX" + phone[-2:]


def mask_name(name: str) -> str:
    return " ".join(w[0] + "•" * (len(w) - 1) for w in name.split())


def to_card(db: Session, lead: Lead, own: Unlock | None) -> LeadCard:
    available = own is not None or unlock_count(db, lead.id) < settings.max_unlocks_per_lead
    return LeadCard(
        id=lead.id, product=lead.product, category=lead.category, quantity=lead.quantity,
        city=lead.city, buyer_type=lead.buyer_type, budget=lead.budget, needed_by=lead.needed_by,
        verified_at=lead.verified_at, unlocked=own is not None, available=available,
    )


def to_detail(db: Session, lead: Lead, own: Unlock | None) -> LeadDetail:
    card = to_card(db, lead, own)
    return LeadDetail(
        **card.model_dump(),
        notes=lead.notes,
        buyer_name=lead.buyer_name if own else mask_name(lead.buyer_name),
        buyer_phone=lead.buyer_phone if own else mask_phone(lead.buyer_phone),
        unlock_id=own.id if own else None,
    )
