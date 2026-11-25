"""Public catalogue pages. No login. Never returns buyer data (rule 10)."""
import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Lead, Product, QuoteAttempt, Supplier, Unlock, utcnow
from app.schemas import BulkTier, PublicCatalog, PublicProduct, QuoteIn
from app.services import membership_active, split

router = APIRouter(prefix="/public/catalog", tags=["public catalogue"])
log = logging.getLogger(__name__)


def _published(db: Session, slug: str) -> Supplier:
    s = db.scalar(select(Supplier).where(Supplier.slug == slug))
    if s is None or not s.catalog_public:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Catalogue not found")
    if settings.catalog_requires_membership and not membership_active(s):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Catalogue not found")
    return s


def _active_product(db: Session, s: Supplier, product_id: int) -> Product:
    p = db.get(Product, product_id)
    if p is None or p.supplier_id != s.id or not p.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return p


def _public(p: Product) -> PublicProduct:
    return PublicProduct(
        id=p.id, name=p.name, name_ta=p.name_ta, category=p.category, material=p.material, size=p.size,
        description=p.description, photo_urls=p.photo_urls or [], price_from_inr=p.price_from_inr,
        bulk_tiers=[BulkTier(**t) for t in (p.bulk_tiers or [])], moq=p.moq, lead_time_days=p.lead_time_days,
    )


@router.get("/{slug}", response_model=PublicCatalog)
def catalog(slug: str, db: Session = Depends(get_db)) -> PublicCatalog:
    s = _published(db, slug)
    products = db.scalars(
        select(Product).where(Product.supplier_id == s.id, Product.is_active.is_(True)).order_by(Product.id)
    )
    return PublicCatalog(
        slug=slug, business_name=s.business_name, cities=split(s.cities), moq=s.moq,
        whatsapp_phone=s.whatsapp_phone or s.phone, products=[_public(p) for p in products],
    )


@router.get("/{slug}/products/{product_id}", response_model=PublicProduct)
def product(slug: str, product_id: int, db: Session = Depends(get_db)) -> PublicProduct:
    s = _published(db, slug)
    return _public(_active_product(db, s, product_id))


@router.post("/{slug}/quote")
def quote(slug: str, body: QuoteIn, request: Request, db: Session = Depends(get_db)) -> dict[str, bool]:
    s = _published(db, slug)
    p = _active_product(db, s, body.product_id)
    now = utcnow()
    ip = request.client.host if request.client else "unknown"

    per_phone = db.scalar(
        select(func.count(QuoteAttempt.id)).where(
            QuoteAttempt.supplier_id == s.id, QuoteAttempt.buyer_phone == body.buyer_phone,
            QuoteAttempt.created_at > now - timedelta(hours=24),
        )
    ) or 0
    per_ip = db.scalar(
        select(func.count(QuoteAttempt.id)).where(QuoteAttempt.ip == ip, QuoteAttempt.created_at > now - timedelta(hours=1))
    ) or 0
    if per_phone >= settings.quote_limit_per_phone_24h or per_ip >= settings.quote_limit_per_ip_1h:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests. Please try again later or WhatsApp the supplier.")

    lead = Lead(
        product=f"{p.name}", category=p.category, quantity=f"{body.quantity} pcs", city=body.city.strip(),
        buyer_type=body.buyer_type, budget="", needed_by=body.needed_by, notes=body.message.strip(),
        buyer_name=body.buyer_name.strip(), buyer_phone=body.buyer_phone,
        verified_at=None,  # rule 4: unverified until the supplier calls
        consent_at=now, consent_source="catalogue quote form",
        source="catalog_quote", owner_supplier_id=s.id, product_id=p.id,
    )
    db.add(lead)
    db.flush()
    db.add(Unlock(supplier_id=s.id, lead_id=lead.id, status="new"))  # 0 credits (rule 2)
    db.add(QuoteAttempt(supplier_id=s.id, buyer_phone=body.buyer_phone, ip=ip))
    db.commit()
    log.info("Catalogue quote for supplier %s product %s", s.id, p.id)
    return {"ok": True}
