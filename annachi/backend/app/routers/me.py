from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_supplier
from app.database import get_db
from app.models import Supplier
from app.config import settings
from app.schemas import CatalogSettingsIn, MeOut, ProfileIn
from app.services import me_out, membership_active

router = APIRouter(prefix="/me", tags=["profile"])


@router.get("", response_model=MeOut)
def get_me(me: Supplier = Depends(current_supplier)) -> MeOut:
    return me_out(me)


@router.put("", response_model=MeOut)
def update_profile(body: ProfileIn, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> MeOut:
    me.business_name = body.business_name.strip()
    me.owner_name = body.owner_name.strip()
    me.gstin = body.gstin
    me.categories = ",".join(c.strip() for c in body.categories if c.strip())
    me.cities = ",".join(c.strip() for c in body.cities if c.strip())
    me.moq = body.moq.strip()
    me.language = body.language
    db.commit()
    return me_out(me)


@router.put("/catalog", response_model=MeOut)
def update_catalog(body: CatalogSettingsIn, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> MeOut:
    taken = db.scalar(select(Supplier.id).where(Supplier.slug == body.slug, Supplier.id != me.id))
    if taken is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "This link name is taken")
    if body.catalog_public and settings.catalog_requires_membership and not membership_active(me):
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, "Membership required to publish")
    if body.catalog_public and not me.business_name:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Complete your business profile first")
    me.slug = body.slug
    me.catalog_public = body.catalog_public
    me.whatsapp_phone = body.whatsapp_phone or me.phone
    db.commit()
    return me_out(me)
