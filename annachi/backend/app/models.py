from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
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
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


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
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

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
