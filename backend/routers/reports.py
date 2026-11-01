"""Reports API routes with CSV export."""

import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Product, Category, Supplier, Purchase, PurchaseItem, StockMovement
import crud

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def _generate_csv(headers: list, rows: list) -> StreamingResponse:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=report.csv"},
    )


@router.get("/inventory-summary")
def inventory_summary(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.name).all()
    data = []
    for p in products:
        data.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category.name if p.category else "N/A",
            "supplier": p.supplier.company_name if p.supplier else "N/A",
            "quantity": p.quantity,
            "purchase_price": p.purchase_price,
            "selling_price": p.selling_price,
            "stock_value": round(p.quantity * p.purchase_price, 2),
            "unit": p.unit,
            "status": "Out of Stock" if p.quantity == 0 else ("Low Stock" if p.quantity <= p.min_stock_level else "In Stock"),
        })
    total_value = sum(d["stock_value"] for d in data)
    total_quantity = sum(d["quantity"] for d in data)
    return {"data": data, "total_value": round(total_value, 2), "total_quantity": total_quantity}


@router.get("/inventory-summary/csv")
def inventory_summary_csv(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.name).all()
    headers = ["ID", "Name", "SKU", "Category", "Supplier", "Qty", "Purchase Price", "Selling Price", "Stock Value", "Unit", "Status"]
    rows = []
    for p in products:
        status = "Out of Stock" if p.quantity == 0 else ("Low Stock" if p.quantity <= p.min_stock_level else "In Stock")
        rows.append([
            p.id, p.name, p.sku,
            p.category.name if p.category else "N/A",
            p.supplier.company_name if p.supplier else "N/A",
            p.quantity, p.purchase_price, p.selling_price,
            round(p.quantity * p.purchase_price, 2), p.unit, status,
        ])
    return _generate_csv(headers, rows)


@router.get("/stock-valuation")
def stock_valuation(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.quantity > 0).order_by(Product.name).all()
    data = []
    for p in products:
        data.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "quantity": p.quantity,
            "purchase_price": p.purchase_price,
            "selling_price": p.selling_price,
            "cost_value": round(p.quantity * p.purchase_price, 2),
            "retail_value": round(p.quantity * p.selling_price, 2),
            "potential_profit": round(p.quantity * (p.selling_price - p.purchase_price), 2),
        })
    total_cost = sum(d["cost_value"] for d in data)
    total_retail = sum(d["retail_value"] for d in data)
    total_profit = sum(d["potential_profit"] for d in data)
    return {
        "data": data,
        "total_cost_value": round(total_cost, 2),
        "total_retail_value": round(total_retail, 2),
        "total_potential_profit": round(total_profit, 2),
    }


@router.get("/stock-valuation/csv")
def stock_valuation_csv(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.quantity > 0).order_by(Product.name).all()
    headers = ["ID", "Name", "SKU", "Qty", "Purchase Price", "Selling Price", "Cost Value", "Retail Value", "Potential Profit"]
    rows = []
    for p in products:
        rows.append([
            p.id, p.name, p.sku, p.quantity, p.purchase_price, p.selling_price,
            round(p.quantity * p.purchase_price, 2),
            round(p.quantity * p.selling_price, 2),
            round(p.quantity * (p.selling_price - p.purchase_price), 2),
        ])
    return _generate_csv(headers, rows)


@router.get("/low-stock")
def low_stock_report(db: Session = Depends(get_db)):
    products = crud.get_low_stock_products(db)
    data = []
    for p in products:
        suggested = max(p.min_stock_level * 2 - p.quantity, 0)
        data.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category.name if p.category else "N/A",
            "supplier": p.supplier.company_name if p.supplier else "N/A",
            "quantity": p.quantity,
            "min_stock_level": p.min_stock_level,
            "suggested_reorder": suggested,
            "status": "Out of Stock" if p.quantity == 0 else "Low Stock",
        })
    return {"data": data, "total": len(data)}


@router.get("/low-stock/csv")
def low_stock_csv(db: Session = Depends(get_db)):
    products = crud.get_low_stock_products(db)
    headers = ["ID", "Name", "SKU", "Category", "Supplier", "Qty", "Min Stock", "Suggested Reorder", "Status"]
    rows = []
    for p in products:
        suggested = max(p.min_stock_level * 2 - p.quantity, 0)
        status = "Out of Stock" if p.quantity == 0 else "Low Stock"
        rows.append([
            p.id, p.name, p.sku,
            p.category.name if p.category else "N/A",
            p.supplier.company_name if p.supplier else "N/A",
            p.quantity, p.min_stock_level, suggested, status,
        ])
    return _generate_csv(headers, rows)


@router.get("/purchases")
def purchase_report(
    supplier_id: int = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db),
):
    purchases, total = crud.get_purchases(db, supplier_id=supplier_id, status=status, limit=500)
    data = []
    for p in purchases:
        data.append({
            "id": p.id,
            "supplier": p.supplier.company_name if p.supplier else "N/A",
            "date": p.purchase_date.isoformat(),
            "status": p.status,
            "total_amount": p.total_amount,
            "items_count": len(p.items),
        })
    total_amount = sum(d["total_amount"] for d in data)
    return {"data": data, "total": total, "total_amount": round(total_amount, 2)}


@router.get("/purchases/csv")
def purchase_report_csv(db: Session = Depends(get_db)):
    purchases, _ = crud.get_purchases(db, limit=500)
    headers = ["ID", "Supplier", "Date", "Status", "Total Amount", "Items Count"]
    rows = []
    for p in purchases:
        rows.append([
            p.id,
            p.supplier.company_name if p.supplier else "N/A",
            p.purchase_date.strftime("%Y-%m-%d"),
            p.status, p.total_amount, len(p.items),
        ])
    return _generate_csv(headers, rows)


@router.get("/suppliers")
def supplier_report(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).order_by(Supplier.company_name).all()
    data = []
    for s in suppliers:
        total_purchases = sum(
            p.total_amount for p in s.purchases if p.status == "confirmed"
        )
        data.append({
            "id": s.id,
            "company_name": s.company_name,
            "contact_person": s.contact_person or "N/A",
            "email": s.email or "N/A",
            "phone": s.phone or "N/A",
            "products_count": len(s.products),
            "total_purchases": round(total_purchases, 2),
        })
    return {"data": data, "total": len(data)}


@router.get("/suppliers/csv")
def supplier_report_csv(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).order_by(Supplier.company_name).all()
    headers = ["ID", "Company Name", "Contact Person", "Email", "Phone", "Products", "Total Purchases"]
    rows = []
    for s in suppliers:
        total_purchases = sum(
            p.total_amount for p in s.purchases if p.status == "confirmed"
        )
        rows.append([
            s.id, s.company_name, s.contact_person or "N/A",
            s.email or "N/A", s.phone or "N/A",
            len(s.products), round(total_purchases, 2),
        ])
    return _generate_csv(headers, rows)


@router.get("/stock-movements")
def stock_movement_report(
    product_id: int = Query(None),
    movement_type: str = Query(None),
    db: Session = Depends(get_db),
):
    movements, total = crud.get_stock_movements(
        db, product_id=product_id, movement_type=movement_type, limit=500
    )
    data = []
    for m in movements:
        data.append({
            "id": m.id,
            "product_name": m.product.name if m.product else "",
            "product_sku": m.product.sku if m.product else "",
            "movement_type": m.movement_type,
            "quantity_change": m.quantity_change,
            "quantity_before": m.quantity_before,
            "quantity_after": m.quantity_after,
            "reference": m.reference or "",
            "notes": m.notes or "",
            "date": m.created_at.isoformat(),
        })
    return {"data": data, "total": total}


@router.get("/stock-movements/csv")
def stock_movement_csv(db: Session = Depends(get_db)):
    movements, _ = crud.get_stock_movements(db, limit=500)
    headers = ["ID", "Product", "SKU", "Type", "Change", "Before", "After", "Reference", "Notes", "Date"]
    rows = []
    for m in movements:
        rows.append([
            m.id,
            m.product.name if m.product else "",
            m.product.sku if m.product else "",
            m.movement_type, m.quantity_change,
            m.quantity_before, m.quantity_after,
            m.reference or "", m.notes or "",
            m.created_at.strftime("%Y-%m-%d %H:%M"),
        ])
    return _generate_csv(headers, rows)
