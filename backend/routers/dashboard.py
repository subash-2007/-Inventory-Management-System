"""Dashboard API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)


@router.get("/category-stock")
def get_category_stock(db: Session = Depends(get_db)):
    return crud.get_category_stock_data(db)


@router.get("/monthly-purchases")
def get_monthly_purchases(db: Session = Depends(get_db)):
    return crud.get_monthly_purchase_data(db)


@router.get("/inventory-value")
def get_inventory_value(db: Session = Depends(get_db)):
    return crud.get_inventory_value_data(db)


@router.get("/recent-movements")
def get_recent_movements(db: Session = Depends(get_db)):
    movements = crud.get_recent_movements(db, limit=10)
    return [
        {
            "id": m.id,
            "product_name": m.product.name if m.product else "",
            "product_sku": m.product.sku if m.product else "",
            "movement_type": m.movement_type,
            "quantity_change": m.quantity_change,
            "quantity_before": m.quantity_before,
            "quantity_after": m.quantity_after,
            "reference": m.reference,
            "notes": m.notes,
            "created_at": m.created_at.isoformat(),
        }
        for m in movements
    ]
