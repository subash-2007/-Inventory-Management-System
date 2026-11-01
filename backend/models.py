"""SQLAlchemy ORM models for the Inventory Management System."""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Index,
    CheckConstraint, UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(200), nullable=False)
    contact_person = Column(String(150), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = relationship("Product", back_populates="supplier")
    purchases = relationship("Purchase", back_populates="supplier")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="check_quantity_non_negative"),
        CheckConstraint("purchase_price >= 0", name="check_purchase_price_non_negative"),
        CheckConstraint("selling_price >= 0", name="check_selling_price_non_negative"),
        CheckConstraint("min_stock_level >= 0", name="check_min_stock_non_negative"),
        Index("ix_products_sku", "sku", unique=True),
        Index("ix_products_category", "category_id"),
        Index("ix_products_supplier", "supplier_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(50), nullable=False, unique=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    description = Column(Text, nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    purchase_price = Column(Float, nullable=False, default=0.0)
    selling_price = Column(Float, nullable=False, default=0.0)
    quantity = Column(Integer, nullable=False, default=0)
    min_stock_level = Column(Integer, nullable=False, default=10)
    unit = Column(String(20), nullable=False, default="pcs")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    stock_movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")
    purchase_items = relationship("PurchaseItem", back_populates="product")

    @property
    def stock_value(self) -> float:
        return self.quantity * self.purchase_price

    @property
    def is_low_stock(self) -> bool:
        return 0 < self.quantity <= self.min_stock_level

    @property
    def is_out_of_stock(self) -> bool:
        return self.quantity == 0


class Purchase(Base):
    __tablename__ = "purchases"
    __table_args__ = (
        Index("ix_purchases_supplier", "supplier_id"),
        Index("ix_purchases_status", "status"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), nullable=False, default="pending")  # pending, confirmed, cancelled
    total_amount = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    supplier = relationship("Supplier", back_populates="purchases")
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")


class PurchaseItem(Base):
    __tablename__ = "purchase_items"
    __table_args__ = (
        Index("ix_purchase_items_purchase", "purchase_id"),
        Index("ix_purchase_items_product", "product_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    # Relationships
    purchase = relationship("Purchase", back_populates="items")
    product = relationship("Product", back_populates="purchase_items")


class StockMovement(Base):
    __tablename__ = "stock_movements"
    __table_args__ = (
        Index("ix_stock_movements_product", "product_id"),
        Index("ix_stock_movements_type", "movement_type"),
        Index("ix_stock_movements_date", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    movement_type = Column(String(20), nullable=False)  # addition, reduction, adjustment, purchase
    quantity_change = Column(Integer, nullable=False)
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    reference = Column(String(200), nullable=True)  # e.g., "Purchase #5"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="stock_movements")
