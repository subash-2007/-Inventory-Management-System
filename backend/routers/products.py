"""Product API routes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from schemas import ProductCreate, ProductUpdate, ProductResponse
import crud

router = APIRouter(prefix="/api/products", tags=["Products"])


def _product_to_response(product) -> ProductResponse:
    return ProductResponse(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category_id=product.category_id,
        description=product.description,
        supplier_id=product.supplier_id,
        purchase_price=product.purchase_price,
        selling_price=product.selling_price,
        quantity=product.quantity,
        min_stock_level=product.min_stock_level,
        unit=product.unit,
        created_at=product.created_at,
        updated_at=product.updated_at,
        category_name=product.category.name if product.category else None,
        supplier_name=product.supplier.company_name if product.supplier else None,
        stock_value=round(product.quantity * product.purchase_price, 2),
        is_low_stock=0 < product.quantity <= product.min_stock_level,
        is_out_of_stock=product.quantity == 0,
    )


@router.get("")
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str = Query(""),
    category_id: Optional[int] = Query(None),
    supplier_id: Optional[int] = Query(None),
    stock_status: Optional[str] = Query(None),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc"),
    db: Session = Depends(get_db),
):
    products, total = crud.get_products(
        db, skip=skip, limit=limit, search=search,
        category_id=category_id, supplier_id=supplier_id,
        stock_status=stock_status, sort_by=sort_by, sort_order=sort_order,
    )
    return {
        "products": [_product_to_response(p) for p in products],
        "total": total,
    }


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _product_to_response(product)


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    # Check unique SKU
    existing = crud.get_product_by_sku(db, data.sku)
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{data.sku}' already exists")
    try:
        product = crud.create_product(db, data)
        return _product_to_response(product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    # Check SKU uniqueness if updating
    if data.sku:
        existing = crud.get_product_by_sku(db, data.sku)
        if existing and existing.id != product_id:
            raise HTTPException(status_code=400, detail=f"SKU '{data.sku}' already exists")
    product = crud.update_product(db, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _product_to_response(product)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    if not crud.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
