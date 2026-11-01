"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# ── Category Schemas ──────────────────────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    product_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ── Supplier Schemas ──────────────────────────────────────────────────────────

class SupplierBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime
    product_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ── Product Schemas ───────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=50)
    category_id: Optional[int] = None
    description: Optional[str] = None
    supplier_id: Optional[int] = None
    purchase_price: float = Field(0.0, ge=0)
    selling_price: float = Field(0.0, ge=0)
    quantity: int = Field(0, ge=0)
    min_stock_level: int = Field(10, ge=0)
    unit: str = Field("pcs", max_length=20)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    category_id: Optional[int] = None
    description: Optional[str] = None
    supplier_id: Optional[int] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = Field(None, max_length=20)


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None
    supplier_name: Optional[str] = None
    stock_value: float = 0.0
    is_low_stock: bool = False
    is_out_of_stock: bool = False

    model_config = ConfigDict(from_attributes=True)


# ── Stock Movement Schemas ────────────────────────────────────────────────────

class StockMovementBase(BaseModel):
    product_id: int
    movement_type: str = Field(..., pattern="^(addition|reduction|adjustment|purchase)$")
    quantity_change: int
    reference: Optional[str] = None
    notes: Optional[str] = None


class StockMovementCreate(BaseModel):
    product_id: int
    movement_type: str = Field(..., pattern="^(addition|reduction|adjustment)$")
    quantity_change: int = Field(..., gt=0)
    notes: Optional[str] = None


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    product_name: str = ""
    product_sku: str = ""
    movement_type: str
    quantity_change: int
    quantity_before: int
    quantity_after: int
    reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Purchase Schemas ──────────────────────────────────────────────────────────

class PurchaseItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)


class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str = ""
    product_sku: str = ""
    quantity: int
    unit_price: float
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class PurchaseCreate(BaseModel):
    supplier_id: int
    notes: Optional[str] = None
    items: List[PurchaseItemCreate] = Field(..., min_length=1)


class PurchaseResponse(BaseModel):
    id: int
    supplier_id: int
    supplier_name: str = ""
    purchase_date: datetime
    status: str
    total_amount: float
    notes: Optional[str] = None
    items: List[PurchaseItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Dashboard Schemas ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_products: int = 0
    total_stock_quantity: int = 0
    total_inventory_value: float = 0.0
    low_stock_products: int = 0
    out_of_stock_products: int = 0
    total_suppliers: int = 0
    total_categories: int = 0
    total_purchases: int = 0


class CategoryStockData(BaseModel):
    category: str
    stock: int
    value: float


class MonthlyPurchaseData(BaseModel):
    month: str
    amount: float
    count: int


class InventoryValueData(BaseModel):
    month: str
    value: float


# ── Report Schemas ────────────────────────────────────────────────────────────

class LowStockItem(BaseModel):
    id: int
    name: str
    sku: str
    quantity: int
    min_stock_level: int
    suggested_reorder: int
    category: Optional[str] = None
    supplier: Optional[str] = None
