"""Purchase Management API routes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from schemas import PurchaseCreate, PurchaseResponse, PurchaseItemResponse
import crud

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])


def _purchase_to_response(purchase) -> PurchaseResponse:
    items = []
    for item in purchase.items:
        items.append(PurchaseItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name if item.product else "",
            product_sku=item.product.sku if item.product else "",
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
        ))
    return PurchaseResponse(
        id=purchase.id,
        supplier_id=purchase.supplier_id,
        supplier_name=purchase.supplier.company_name if purchase.supplier else "",
        purchase_date=purchase.purchase_date,
        status=purchase.status,
        total_amount=purchase.total_amount,
        notes=purchase.notes,
        items=items,
        created_at=purchase.created_at,
        updated_at=purchase.updated_at,
    )


@router.get("")
def list_purchases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    supplier_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    purchases, total = crud.get_purchases(
        db, skip=skip, limit=limit,
        supplier_id=supplier_id, status=status,
    )
    return {
        "purchases": [_purchase_to_response(p) for p in purchases],
        "total": total,
    }


@router.get("/{purchase_id}", response_model=PurchaseResponse)
def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase = crud.get_purchase(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return _purchase_to_response(purchase)


@router.post("", response_model=PurchaseResponse, status_code=201)
def create_purchase(data: PurchaseCreate, db: Session = Depends(get_db)):
    purchase, error = crud.create_purchase(db, data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return _purchase_to_response(purchase)


@router.post("/{purchase_id}/confirm", response_model=PurchaseResponse)
def confirm_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase, error = crud.confirm_purchase(db, purchase_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return _purchase_to_response(purchase)


@router.post("/{purchase_id}/cancel", response_model=PurchaseResponse)
def cancel_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase, error = crud.cancel_purchase(db, purchase_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return _purchase_to_response(purchase)
