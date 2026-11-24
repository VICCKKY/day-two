from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

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


class LeadCard(BaseModel):
    id: int
    product: str
    category: str
    quantity: str
    city: str
    buyer_type: BuyerType
    budget: str
    needed_by: date | None
    verified_at: datetime
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
