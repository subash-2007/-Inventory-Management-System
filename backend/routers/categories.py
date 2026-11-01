"""Category API routes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import CategoryCreate, CategoryUpdate, CategoryResponse
import crud

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str = Query(""),
    db: Session = Depends(get_db),
):
    categories = crud.get_categories(db, skip=skip, limit=limit, search=search)
    result = []
    for cat in categories:
        result.append(CategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            created_at=cat.created_at,
            updated_at=cat.updated_at,
            product_count=len(cat.products),
        ))
    return result


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse(
        id=category.id,
        name=category.name,
        description=category.description,
        created_at=category.created_at,
        updated_at=category.updated_at,
        product_count=len(category.products),
    )


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    try:
        category = crud.create_category(db, data)
        return CategoryResponse(
            id=category.id,
            name=category.name,
            description=category.description,
            created_at=category.created_at,
            updated_at=category.updated_at,
            product_count=0,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)):
    category = crud.update_category(db, category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse(
        id=category.id,
        name=category.name,
        description=category.description,
        created_at=category.created_at,
        updated_at=category.updated_at,
        product_count=len(category.products),
    )


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
