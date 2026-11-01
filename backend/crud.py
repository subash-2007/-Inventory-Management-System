"""CRUD operations for the Inventory Management System."""

from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from models import Product, Category, Supplier, Purchase, PurchaseItem, StockMovement
from schemas import (
    CategoryCreate, CategoryUpdate,
    SupplierCreate, SupplierUpdate,
    ProductCreate, ProductUpdate,
    StockMovementCreate,
    PurchaseCreate,
)


# ── Category CRUD ─────────────────────────────────────────────────────────────

def get_categories(db: Session, skip: int = 0, limit: int = 100, search: str = ""):
    query = db.query(Category)
    if search:
        query = query.filter(Category.name.ilike(f"%{search}%"))
    return query.order_by(Category.name).offset(skip).limit(limit).all()


def get_category(db: Session, category_id: int):
    return db.query(Category).filter(Category.id == category_id).first()


def create_category(db: Session, data: CategoryCreate):
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, data: CategoryUpdate):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    category.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True


# ── Supplier CRUD ─────────────────────────────────────────────────────────────

def get_suppliers(db: Session, skip: int = 0, limit: int = 100, search: str = ""):
    query = db.query(Supplier)
    if search:
        query = query.filter(
            (Supplier.company_name.ilike(f"%{search}%")) |
            (Supplier.contact_person.ilike(f"%{search}%")) |
            (Supplier.email.ilike(f"%{search}%"))
        )
    return query.order_by(Supplier.company_name).offset(skip).limit(limit).all()


def get_supplier(db: Session, supplier_id: int):
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()


def create_supplier(db: Session, data: SupplierCreate):
    supplier = Supplier(**data.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def update_supplier(db: Session, supplier_id: int, data: SupplierUpdate):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(supplier, key, value)
    supplier.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(supplier)
    return supplier


def delete_supplier(db: Session, supplier_id: int):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        return False
    db.delete(supplier)
    db.commit()
    return True


# ── Product CRUD ──────────────────────────────────────────────────────────────

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str = "",
    category_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
    stock_status: Optional[str] = None,
    sort_by: str = "name",
    sort_order: str = "asc",
):
    query = db.query(Product)

    # Search filter
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.sku.ilike(f"%{search}%")) |
            (Product.description.ilike(f"%{search}%"))
        )

    # Category filter
    if category_id:
        query = query.filter(Product.category_id == category_id)

    # Supplier filter
    if supplier_id:
        query = query.filter(Product.supplier_id == supplier_id)

    # Stock status filter
    if stock_status == "low":
        query = query.filter(Product.quantity > 0, Product.quantity <= Product.min_stock_level)
    elif stock_status == "out":
        query = query.filter(Product.quantity == 0)
    elif stock_status == "in":
        query = query.filter(Product.quantity > Product.min_stock_level)

    # Sorting
    sort_column = getattr(Product, sort_by, Product.name)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    total = query.count()
    products = query.offset(skip).limit(limit).all()
    return products, total


def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()


def get_product_by_sku(db: Session, sku: str):
    return db.query(Product).filter(Product.sku == sku).first()


def create_product(db: Session, data: ProductCreate):
    # Create product
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)

    # Record initial stock movement if quantity > 0
    if product.quantity > 0:
        movement = StockMovement(
            product_id=product.id,
            movement_type="addition",
            quantity_change=product.quantity,
            quantity_before=0,
            quantity_after=product.quantity,
            reference="Initial stock",
            notes="Stock added during product creation",
        )
        db.add(movement)
        db.commit()

    return product


def update_product(db: Session, product_id: int, data: ProductUpdate):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return False
    db.delete(product)
    db.commit()
    return True


# ── Stock Operations ──────────────────────────────────────────────────────────

def update_stock(db: Session, data: StockMovementCreate):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        return None, "Product not found"

    quantity_before = product.quantity

    if data.movement_type == "addition":
        product.quantity += data.quantity_change
    elif data.movement_type == "reduction":
        if product.quantity < data.quantity_change:
            return None, f"Insufficient stock. Available: {product.quantity}"
        product.quantity -= data.quantity_change
    elif data.movement_type == "adjustment":
        product.quantity = data.quantity_change

    quantity_after = product.quantity
    actual_change = quantity_after - quantity_before

    # Record stock movement
    movement = StockMovement(
        product_id=data.product_id,
        movement_type=data.movement_type,
        quantity_change=actual_change,
        quantity_before=quantity_before,
        quantity_after=quantity_after,
        reference=f"Manual {data.movement_type}",
        notes=data.notes,
    )
    db.add(movement)
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    db.refresh(movement)

    return movement, None


def get_stock_movements(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    product_id: Optional[int] = None,
    movement_type: Optional[str] = None,
):
    query = db.query(StockMovement)
    if product_id:
        query = query.filter(StockMovement.product_id == product_id)
    if movement_type:
        query = query.filter(StockMovement.movement_type == movement_type)
    total = query.count()
    movements = query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()
    return movements, total


# ── Purchase Operations ───────────────────────────────────────────────────────

def get_purchases(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    supplier_id: Optional[int] = None,
    status: Optional[str] = None,
):
    query = db.query(Purchase)
    if supplier_id:
        query = query.filter(Purchase.supplier_id == supplier_id)
    if status:
        query = query.filter(Purchase.status == status)
    total = query.count()
    purchases = query.order_by(Purchase.created_at.desc()).offset(skip).limit(limit).all()
    return purchases, total


def get_purchase(db: Session, purchase_id: int):
    return db.query(Purchase).filter(Purchase.id == purchase_id).first()


def create_purchase(db: Session, data: PurchaseCreate):
    # Calculate total amount
    total_amount = 0.0
    items_data = []
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            return None, f"Product ID {item.product_id} not found"
        total_price = item.quantity * item.unit_price
        total_amount += total_price
        items_data.append((item, total_price, product))

    # Create purchase
    purchase = Purchase(
        supplier_id=data.supplier_id,
        status="pending",
        total_amount=total_amount,
        notes=data.notes,
    )
    db.add(purchase)
    db.flush()

    # Create purchase items
    for item_data, total_price, product in items_data:
        purchase_item = PurchaseItem(
            purchase_id=purchase.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=total_price,
        )
        db.add(purchase_item)

    db.commit()
    db.refresh(purchase)
    return purchase, None


def confirm_purchase(db: Session, purchase_id: int):
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        return None, "Purchase not found"
    if purchase.status != "pending":
        return None, f"Purchase is already {purchase.status}"

    # Update stock for each item
    for item in purchase.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            quantity_before = product.quantity
            product.quantity += item.quantity
            product.updated_at = datetime.utcnow()

            # Record stock movement
            movement = StockMovement(
                product_id=product.id,
                movement_type="purchase",
                quantity_change=item.quantity,
                quantity_before=quantity_before,
                quantity_after=product.quantity,
                reference=f"Purchase #{purchase.id}",
                notes=f"Purchase confirmation",
            )
            db.add(movement)

    purchase.status = "confirmed"
    purchase.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(purchase)
    return purchase, None


def cancel_purchase(db: Session, purchase_id: int):
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        return None, "Purchase not found"
    if purchase.status != "pending":
        return None, f"Purchase is already {purchase.status}"

    purchase.status = "cancelled"
    purchase.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(purchase)
    return purchase, None


# ── Dashboard & Reports ───────────────────────────────────────────────────────

def get_dashboard_stats(db: Session):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_stock = db.query(func.sum(Product.quantity)).scalar() or 0
    total_value = db.query(func.sum(Product.quantity * Product.purchase_price)).scalar() or 0.0
    low_stock = db.query(func.count(Product.id)).filter(
        Product.quantity > 0, Product.quantity <= Product.min_stock_level
    ).scalar() or 0
    out_of_stock = db.query(func.count(Product.id)).filter(Product.quantity == 0).scalar() or 0
    total_suppliers = db.query(func.count(Supplier.id)).scalar() or 0
    total_categories = db.query(func.count(Category.id)).scalar() or 0
    total_purchases = db.query(func.count(Purchase.id)).filter(Purchase.status == "confirmed").scalar() or 0

    return {
        "total_products": total_products,
        "total_stock_quantity": total_stock,
        "total_inventory_value": round(total_value, 2),
        "low_stock_products": low_stock,
        "out_of_stock_products": out_of_stock,
        "total_suppliers": total_suppliers,
        "total_categories": total_categories,
        "total_purchases": total_purchases,
    }


def get_category_stock_data(db: Session):
    results = (
        db.query(
            Category.name,
            func.coalesce(func.sum(Product.quantity), 0).label("stock"),
            func.coalesce(func.sum(Product.quantity * Product.purchase_price), 0).label("value"),
        )
        .outerjoin(Product, Product.category_id == Category.id)
        .group_by(Category.id, Category.name)
        .all()
    )
    return [{"category": r[0], "stock": int(r[1]), "value": round(float(r[2]), 2)} for r in results]


def get_monthly_purchase_data(db: Session):
    results = (
        db.query(
            func.strftime("%Y-%m", Purchase.purchase_date).label("month"),
            func.sum(Purchase.total_amount).label("amount"),
            func.count(Purchase.id).label("count"),
        )
        .filter(Purchase.status == "confirmed")
        .group_by(func.strftime("%Y-%m", Purchase.purchase_date))
        .order_by(func.strftime("%Y-%m", Purchase.purchase_date))
        .limit(12)
        .all()
    )
    return [{"month": r[0], "amount": round(float(r[1]), 2), "count": int(r[2])} for r in results]


def get_recent_movements(db: Session, limit: int = 10):
    return (
        db.query(StockMovement)
        .order_by(StockMovement.created_at.desc())
        .limit(limit)
        .all()
    )


def get_low_stock_products(db: Session):
    products = (
        db.query(Product)
        .filter(Product.quantity <= Product.min_stock_level)
        .order_by(Product.quantity.asc())
        .all()
    )
    return products


def get_inventory_value_data(db: Session):
    """Get inventory value trends from confirmed purchase history."""
    results = (
        db.query(
            func.strftime("%Y-%m", StockMovement.created_at).label("month"),
            func.sum(
                case(
                    (StockMovement.quantity_change > 0, StockMovement.quantity_change * Product.purchase_price),
                    else_=-StockMovement.quantity_change * Product.purchase_price,
                )
            ).label("value"),
        )
        .join(Product, StockMovement.product_id == Product.id)
        .group_by(func.strftime("%Y-%m", StockMovement.created_at))
        .order_by(func.strftime("%Y-%m", StockMovement.created_at))
        .limit(12)
        .all()
    )
    return [{"month": r[0], "value": round(float(r[1] or 0), 2)} for r in results]
