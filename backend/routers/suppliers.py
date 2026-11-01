"""Supplier API routes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import SupplierCreate, SupplierUpdate, SupplierResponse
import crud

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


@router.get("", response_model=List[SupplierResponse])
def list_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str = Query(""),
    db: Session = Depends(get_db),
):
    suppliers = crud.get_suppliers(db, skip=skip, limit=limit, search=search)
    result = []
    for sup in suppliers:
        result.append(SupplierResponse(
            id=sup.id,
            company_name=sup.company_name,
            contact_person=sup.contact_person,
            email=sup.email,
            phone=sup.phone,
            address=sup.address,
            created_at=sup.created_at,
            updated_at=sup.updated_at,
            product_count=len(sup.products),
        ))
    return result


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = crud.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierResponse(
        id=supplier.id,
        company_name=supplier.company_name,
        contact_person=supplier.contact_person,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        created_at=supplier.created_at,
        updated_at=supplier.updated_at,
        product_count=len(supplier.products),
    )


@router.post("", response_model=SupplierResponse, status_code=201)
def create_supplier(data: SupplierCreate, db: Session = Depends(get_db)):
    try:
        supplier = crud.create_supplier(db, data)
        return SupplierResponse(
            id=supplier.id,
            company_name=supplier.company_name,
            contact_person=supplier.contact_person,
            email=supplier.email,
            phone=supplier.phone,
            address=supplier.address,
            created_at=supplier.created_at,
            updated_at=supplier.updated_at,
            product_count=0,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: int, data: SupplierUpdate, db: Session = Depends(get_db)):
    supplier = crud.update_supplier(db, supplier_id, data)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierResponse(
        id=supplier.id,
        company_name=supplier.company_name,
        contact_person=supplier.contact_person,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        created_at=supplier.created_at,
        updated_at=supplier.updated_at,
        product_count=len(supplier.products),
    )


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    if not crud.delete_supplier(db, supplier_id):
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted successfully"}
