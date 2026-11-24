from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import current_supplier
from app.database import get_db
from app.models import Supplier
from app.schemas import MeOut, ProfileIn
from app.services import me_out

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
