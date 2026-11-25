from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

BuyerType = Literal["distributor", "wholesaler", "shop", "bulk_buyer"]
LeadStatus = Literal["new", "called", "interested", "quote_sent", "won", "lost"]
ReportReason = Literal["wrong_number", "not_business", "duplicate"]


class OtpRequest(BaseModel):
    phone: str = Field(pattern=r"^[6-9]\d{9}$", description="10-digit Indian mobile, without +91")


class OtpRequestOut(BaseModel):
    sent: bool
    demo_otp: str | None = None


class OtpVerify(OtpRequest):
    otp: str = Field(pattern=r"^\d{6}$")


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new: bool


class ProfileIn(BaseModel):
    business_name: str = Field(min_length=2, max_length=120)
    owner_name: str = Field(min_length=2, max_length=80)
    gstin: str = Field(default="", pattern=r"^$|^[0-9A-Z]{15}$")
    categories: list[str] = Field(min_length=1)
    cities: list[str] = Field(min_length=1)
    moq: str = Field(default="", max_length=80)
    language: Literal["ta", "en"] = "ta"


class MeOut(BaseModel):
    id: int
    phone: str
    business_name: str
    owner_name: str
    gstin: str
    categories: list[str]
    cities: list[str]
    moq: str
    language: str
    membership_until: datetime | None
    membership_active: bool
    credits: int
    profile_complete: bool
    slug: str | None
    catalog_public: bool
    whatsapp_phone: str


class LeadCard(BaseModel):
    id: int
    product: str
    category: str
    quantity: str
    city: str
    buyer_type: BuyerType
    budget: str
    needed_by: date | None
    verified_at: datetime | None  # None only for unconfirmed catalogue quotes
    unlocked: bool
    available: bool  # false when another supplier already took an exclusive lead


class LeadDetail(LeadCard):
    notes: str
    buyer_name: str  # masked until unlocked
    buyer_phone: str  # masked until unlocked
    unlock_id: int | None


class PackOut(BaseModel):
    code: str
    credits: int
    price_inr: int


class WalletOut(BaseModel):
    credits: int
    membership_until: datetime | None
    membership_active: bool
    membership_price_inr: int
    packs: list[PackOut]
    history: list["TxnOut"]
    demo_payments: bool


class TxnOut(BaseModel):
    id: int
    kind: str
    credits_delta: int
    amount_inr: int
    reference: str
    created_at: datetime


class MyLeadOut(BaseModel):
    unlock_id: int
    lead: LeadDetail
    status: LeadStatus
    follow_up_date: date | None
    notes: str
    order_value_inr: int | None
    report_status: str | None
    created_at: datetime
    source: str
    product_id: int | None
    product_name: str | None
    is_verified: bool


class MyLeadUpdate(BaseModel):
    status: LeadStatus | None = None
    follow_up_date: date | None = None
    notes: str | None = Field(default=None, max_length=2000)
    order_value_inr: int | None = Field(default=None, ge=0)


class ReportIn(BaseModel):
    reason: ReportReason
    details: str = Field(default="", max_length=500)


class ReportOut(BaseModel):
    id: int
    unlock_id: int
    reason: str
    details: str
    status: str
    created_at: datetime


class AdminLeadIn(BaseModel):
    product: str = Field(min_length=2)
    category: str = Field(min_length=2)
    quantity: str = Field(min_length=1)
    city: str = Field(min_length=2)
    buyer_type: BuyerType
    budget: str = ""
    needed_by: date | None = None
    notes: str = ""
    buyer_name: str = Field(min_length=2)
    buyer_phone: str = Field(pattern=r"^[6-9]\d{9}$")
    verified_at: datetime
    consent_at: datetime
    consent_source: str = Field(min_length=3, description="How consent was taken, e.g. 'phone call by Angeline'")


class FunnelOut(BaseModel):
    unlocked: int
    called: int
    interested: int
    quote_sent: int
    won: int
    lost: int
    won_value_inr: int
    by_source: dict[str, int]


# ---------- Module 11: catalogue + bulk quote ----------

SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
PHONE_PATTERN = r"^[6-9]\d{9}$"


class BulkTier(BaseModel):
    min_qty: int = Field(ge=1)
    price_per_piece_inr: int = Field(ge=1)


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    name_ta: str = Field(default="", max_length=160)
    category: str = Field(min_length=2, max_length=60)
    material: str = Field(default="", max_length=60)
    size: str = Field(default="", max_length=60)
    description: str = Field(default="", max_length=2000)
    photo_urls: list[str] = Field(default_factory=list, max_length=5)
    price_from_inr: int | None = Field(default=None, ge=1)
    bulk_tiers: list[BulkTier] = Field(default_factory=list, max_length=10)
    moq: int = Field(default=1, ge=1)
    lead_time_days: int | None = Field(default=None, ge=0, le=365)
    is_active: bool = True

    @field_validator("photo_urls")
    @classmethod
    def _https_urls(cls, urls: list[str]) -> list[str]:
        for u in urls:
            if not u.startswith(("https://", "http://")):
                raise ValueError("Photo URLs must start with http:// or https://")
        return urls

    @model_validator(mode="after")
    def _tiers_sorted(self) -> "ProductIn":
        tiers = self.bulk_tiers
        for prev, cur in zip(tiers, tiers[1:]):
            if cur.min_qty <= prev.min_qty:
                raise ValueError("Bulk tiers must be sorted by quantity, smallest first, without repeats")
            if cur.price_per_piece_inr > prev.price_per_piece_inr:
                raise ValueError("A bigger quantity cannot have a higher price per piece")
        return self


class ProductOut(ProductIn):
    id: int
    created_at: datetime
    updated_at: datetime


class CatalogSettingsIn(BaseModel):
    slug: str = Field(min_length=3, max_length=40, pattern=SLUG_PATTERN)
    catalog_public: bool
    whatsapp_phone: str = Field(default="", pattern=r"^$|^[6-9]\d{9}$")


class PublicProduct(BaseModel):
    id: int
    name: str
    name_ta: str
    category: str
    material: str
    size: str
    description: str
    photo_urls: list[str]
    price_from_inr: int | None
    bulk_tiers: list[BulkTier]
    moq: int
    lead_time_days: int | None


class PublicCatalog(BaseModel):
    slug: str
    business_name: str
    cities: list[str]
    moq: str
    whatsapp_phone: str
    products: list[PublicProduct]


class QuoteIn(BaseModel):
    product_id: int
    buyer_name: str = Field(min_length=2, max_length=120)
    buyer_phone: str = Field(pattern=PHONE_PATTERN)
    city: str = Field(min_length=2, max_length=60)
    buyer_type: BuyerType
    quantity: int = Field(ge=1, le=10_000_000)
    needed_by: date | None = None
    message: str = Field(default="", max_length=500)
    consent: bool
    website: str = Field(default="", max_length=0, description="Honeypot: must stay empty")

    @field_validator("consent")
    @classmethod
    def _must_consent(cls, v: bool) -> bool:
        if v is not True:
            raise ValueError("Consent is required to send a quote request")
        return v
