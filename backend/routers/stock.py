"""Stock Management API routes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from schemas import StockMovementCreate, StockMovementResponse
import crud

router = APIRouter(prefix="/api/stock", tags=["Stock"])


def _movement_to_response(movement) -> StockMovementResponse:
    return StockMovementResponse(
        id=movement.id,
        product_id=movement.product_id,
        product_name=movement.product.name if movement.product else "",
        product_sku=movement.product.sku if movement.product else "",
        movement_type=movement.movement_type,
        quantity_change=movement.quantity_change,
        quantity_before=movement.quantity_before,
        quantity_after=movement.quantity_after,
        reference=movement.reference,
        notes=movement.notes,
        created_at=movement.created_at,
    )


@router.post("/update", response_model=StockMovementResponse)
def update_stock(data: StockMovementCreate, db: Session = Depends(get_db)):
    movement, error = crud.update_stock(db, data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return _movement_to_response(movement)


@router.get("/movements")
def list_movements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    product_id: Optional[int] = Query(None),
    movement_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    movements, total = crud.get_stock_movements(
        db, skip=skip, limit=limit,
        product_id=product_id, movement_type=movement_type,
    )
    return {
        "movements": [_movement_to_response(m) for m in movements],
        "total": total,
    }
