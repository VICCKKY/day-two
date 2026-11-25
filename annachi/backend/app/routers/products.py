from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import current_supplier
from app.config import settings
from app.database import get_db
from app.models import Product, Supplier
from app.schemas import ProductIn, ProductOut

router = APIRouter(prefix="/my-products", tags=["catalogue"])


def to_out(p: Product) -> ProductOut:
    return ProductOut.model_validate(p, from_attributes=True)


def _apply(p: Product, body: ProductIn) -> None:
    data = body.model_dump()
    data["bulk_tiers"] = [t.model_dump() for t in body.bulk_tiers]
    for k, v in data.items():
        setattr(p, k, v)


def _own(db: Session, me: Supplier, product_id: int) -> Product:
    p = db.get(Product, product_id)
    if p is None or p.supplier_id != me.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return p


@router.get("", response_model=list[ProductOut])
def list_products(me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> list[ProductOut]:
    rows = db.scalars(select(Product).where(Product.supplier_id == me.id).order_by(Product.id))
    return [to_out(p) for p in rows]


@router.post("", response_model=ProductOut, status_code=201)
def create(body: ProductIn, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> ProductOut:
    count = db.scalar(select(func.count(Product.id)).where(Product.supplier_id == me.id)) or 0
    if count >= settings.max_products_per_supplier:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Limit is {settings.max_products_per_supplier} products")
    p = Product(supplier_id=me.id)
    _apply(p, body)
    db.add(p)
    db.commit()
    return to_out(p)


@router.put("/{product_id}", response_model=ProductOut)
def update(product_id: int, body: ProductIn, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> ProductOut:
    p = _own(db, me, product_id)
    _apply(p, body)
    db.commit()
    return to_out(p)


@router.delete("/{product_id}", response_model=ProductOut)
def soft_delete(product_id: int, me: Supplier = Depends(current_supplier), db: Session = Depends(get_db)) -> ProductOut:
    p = _own(db, me, product_id)
    p.is_active = False
    db.commit()
    return to_out(p)
