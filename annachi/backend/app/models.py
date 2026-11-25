from datetime import date, datetime, timezone

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)
    phone: Mapped[str] = mapped_column(String(15), unique=True, index=True)
    business_name: Mapped[str] = mapped_column(String(120), default="")
    owner_name: Mapped[str] = mapped_column(String(80), default="")
    gstin: Mapped[str] = mapped_column(String(15), default="")
    categories: Mapped[str] = mapped_column(String(300), default="")  # comma separated
    cities: Mapped[str] = mapped_column(String(300), default="")  # comma separated
    moq: Mapped[str] = mapped_column(String(80), default="")
    language: Mapped[str] = mapped_column(String(2), default="ta")
    membership_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    credits: Mapped[int] = mapped_column(Integer, default=0)
    slug: Mapped[str | None] = mapped_column(String(40), unique=True, nullable=True)
    catalog_public: Mapped[bool] = mapped_column(default=False)
    whatsapp_phone: Mapped[str] = mapped_column(String(15), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Product(Base):
    """A supplier's catalogue item with bulk price tiers."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    name_ta: Mapped[str] = mapped_column(String(160), default="")
    category: Mapped[str] = mapped_column(String(60))
    material: Mapped[str] = mapped_column(String(60), default="")
    size: Mapped[str] = mapped_column(String(60), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    photo_urls: Mapped[list[str]] = mapped_column(JSON, default=list)
    price_from_inr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bulk_tiers: Mapped[list[dict[str, int]]] = mapped_column(JSON, default=list)
    moq: Mapped[int] = mapped_column(Integer, default=1)
    lead_time_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class QuoteAttempt(Base):
    """Accepted catalogue quote requests, used for the spam rate limits."""

    __tablename__ = "quote_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    buyer_phone: Mapped[str] = mapped_column(String(15), index=True)
    ip: Mapped[str] = mapped_column(String(45), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)


class Lead(Base):
    """A bulk buyer our team phoned, verified and got consent from."""

    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(primary_key=True)
    product: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(60), index=True)
    quantity: Mapped[str] = mapped_column(String(60))
    city: Mapped[str] = mapped_column(String(60), index=True)
    buyer_type: Mapped[str] = mapped_column(String(30))  # distributor / wholesaler / shop / bulk_buyer
    budget: Mapped[str] = mapped_column(String(60), default="")
    needed_by: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    buyer_name: Mapped[str] = mapped_column(String(120))
    buyer_phone: Mapped[str] = mapped_column(String(15))
    verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    consent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    consent_source: Mapped[str] = mapped_column(String(120), default="")
    is_active: Mapped[bool] = mapped_column(default=True)
    # annachi_verified (shared feed) or catalog_quote (supplier's own inbound lead)
    source: Mapped[str] = mapped_column(String(20), default="annachi_verified")
    owner_supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"), nullable=True, index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    catalog_product: Mapped[Product | None] = relationship()
    unlocks: Mapped[list["Unlock"]] = relationship(back_populates="lead")


class Unlock(Base):
    """A supplier's purchased lead; also the My Leads pipeline row."""

    __tablename__ = "unlocks"
    __table_args__ = (UniqueConstraint("supplier_id", "lead_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.id"), index=True)
    status: Mapped[str] = mapped_column(String(20), default="new")
    follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    order_value_inr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    lead: Mapped[Lead] = relationship(back_populates="unlocks")
    reports: Mapped[list["BadLeadReport"]] = relationship(back_populates="unlock")


class WalletTxn(Base):
    __tablename__ = "wallet_txns"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    kind: Mapped[str] = mapped_column(String(20))  # membership / pack / unlock / refund
    credits_delta: Mapped[int] = mapped_column(Integer, default=0)
    amount_inr: Mapped[int] = mapped_column(Integer, default=0)
    reference: Mapped[str] = mapped_column(String(60), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class BadLeadReport(Base):
    __tablename__ = "bad_lead_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    unlock_id: Mapped[int] = mapped_column(ForeignKey("unlocks.id"), index=True)
    reason: Mapped[str] = mapped_column(String(20))  # wrong_number / not_business / duplicate
    details: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(10), default="pending")  # pending / approved / rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    unlock: Mapped[Unlock] = relationship(back_populates="reports")
