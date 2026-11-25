from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import BadLeadReport, Lead, Supplier, WalletTxn, utcnow
from app.schemas import AdminLeadIn, ReportOut

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/leads", status_code=201)
def add_lead(body: AdminLeadIn, db: Session = Depends(get_db)) -> dict[str, int]:
    """Only leads with a verification date AND recorded consent can be added (DPDP)."""
    lead = Lead(**body.model_dump())
    db.add(lead)
    db.commit()
    return {"id": lead.id}


@router.get("/reports", response_model=list[ReportOut])
def pending_reports(db: Session = Depends(get_db)) -> list[ReportOut]:
    rows = db.scalars(select(BadLeadReport).where(BadLeadReport.status == "pending").order_by(BadLeadReport.id))
    return [ReportOut.model_validate(r, from_attributes=True) for r in rows]


@router.post("/reports/{report_id}/{decision}", response_model=ReportOut)
def resolve(report_id: int, decision: str, db: Session = Depends(get_db)) -> ReportOut:
    if decision not in ("approve", "reject"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown decision")
    r = db.get(BadLeadReport, report_id)
    if r is None or r.status != "pending":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No pending report")
    r.status = "approved" if decision == "approve" else "rejected"
    r.resolved_at = utcnow()
    if r.status == "approved":
        if r.unlock.lead.source != "catalog_quote":  # catalogue quotes cost 0 credits, nothing to return
            supplier = db.get(Supplier, r.unlock.supplier_id)
            supplier.credits += 1
            db.add(WalletTxn(supplier_id=supplier.id, kind="refund", credits_delta=1, reference=f"report-{r.id}"))
        r.unlock.lead.is_active = False  # a bad lead leaves the feed
    db.commit()
    return ReportOut.model_validate(r, from_attributes=True)
