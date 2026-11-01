"""Comprehensive test suite for Inventory Management System backend APIs."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app

from sqlalchemy.pool import StaticPool

# In-memory SQLite for testing with StaticPool so all connections share the same memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_category_crud():
    # 1. Create
    resp = client.post("/api/categories", json={"name": "Electronics", "description": "Tech gadgets"})
    assert resp.status_code == 201
    cat_id = resp.json()["id"]
    assert resp.json()["name"] == "Electronics"

    # 2. Read
    resp = client.get(f"/api/categories/{cat_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Electronics"

    # 3. List
    resp = client.get("/api/categories")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # 4. Update
    resp = client.put(f"/api/categories/{cat_id}", json={"name": "Consumer Electronics"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Consumer Electronics"

    # 5. Delete
    resp = client.delete(f"/api/categories/{cat_id}")
    assert resp.status_code == 200
    resp = client.get(f"/api/categories/{cat_id}")
    assert resp.status_code == 404


def test_supplier_crud():
    # 1. Create
    payload = {
        "company_name": "Apex Supplies",
        "contact_person": "John Doe",
        "email": "john@apex.com",
        "phone": "+1234567890",
        "address": "123 Business St",
    }
    resp = client.post("/api/suppliers", json=payload)
    assert resp.status_code == 201
    sup_id = resp.json()["id"]

    # 2. Read
    resp = client.get(f"/api/suppliers/{sup_id}")
    assert resp.status_code == 200
    assert resp.json()["company_name"] == "Apex Supplies"

    # 3. Update
    resp = client.put(f"/api/suppliers/{sup_id}", json={"company_name": "Apex Global Supplies"})
    assert resp.status_code == 200
    assert resp.json()["company_name"] == "Apex Global Supplies"

    # 4. Delete
    resp = client.delete(f"/api/suppliers/{sup_id}")
    assert resp.status_code == 200


def test_product_crud_and_validation():
    # Setup category & supplier
    c_res = client.post("/api/categories", json={"name": "Hardware"})
    cat_id = c_res.json()["id"]
    s_res = client.post("/api/suppliers", json={"company_name": "Tech Corp"})
    sup_id = s_res.json()["id"]

    # 1. Create Product
    product_data = {
        "name": "Wireless Mouse",
        "sku": "WM-001",
        "category_id": cat_id,
        "supplier_id": sup_id,
        "purchase_price": 15.0,
        "selling_price": 25.0,
        "quantity": 50,
        "min_stock_level": 10,
        "unit": "pcs",
        "description": "Ergonomic 2.4G mouse",
    }
    resp = client.post("/api/products", json=product_data)
    assert resp.status_code == 201
    prod = resp.json()
    prod_id = prod["id"]
    assert prod["sku"] == "WM-001"
    assert prod["stock_value"] == 50 * 15.0

    # 2. Unique SKU validation
    duplicate_sku_data = dict(product_data, name="Duplicate Mouse")
    resp_dup = client.post("/api/products", json=duplicate_sku_data)
    assert resp_dup.status_code == 400

    # 3. Read
    resp = client.get(f"/api/products/{prod_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Wireless Mouse"

    # 4. Update
    resp = client.put(f"/api/products/{prod_id}", json={"selling_price": 29.99})
    assert resp.status_code == 200
    assert resp.json()["selling_price"] == 29.99

    # 5. List with filters
    resp = client.get("/api/products?search=Wireless")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


def test_stock_operations():
    # Create product with initial 20
    p_res = client.post("/api/products", json={
        "name": "USB Cable",
        "sku": "CBL-001",
        "purchase_price": 5.0,
        "selling_price": 10.0,
        "quantity": 20,
        "min_stock_level": 5,
        "unit": "pcs",
    })
    prod_id = p_res.json()["id"]

    # 1. Stock Addition (+15 => 35)
    resp = client.post("/api/stock/update", json={
        "product_id": prod_id,
        "movement_type": "addition",
        "quantity_change": 15,
        "notes": "Restocked shipment",
    })
    assert resp.status_code == 200
    assert resp.json()["quantity_after"] == 35

    # 2. Stock Reduction (-10 => 25)
    resp = client.post("/api/stock/update", json={
        "product_id": prod_id,
        "movement_type": "reduction",
        "quantity_change": 10,
        "notes": "Sold to client",
    })
    assert resp.status_code == 200
    assert resp.json()["quantity_after"] == 25

    # 3. Stock Reduction Beyond Available (Should fail)
    resp_fail = client.post("/api/stock/update", json={
        "product_id": prod_id,
        "movement_type": "reduction",
        "quantity_change": 999,
        "notes": "Overdraw attempt",
    })
    assert resp_fail.status_code == 400

    # 4. Stock Adjustment (set to 8 => Low stock)
    resp = client.post("/api/stock/update", json={
        "product_id": prod_id,
        "movement_type": "adjustment",
        "quantity_change": 4,
        "notes": "Inventory audit",
    })
    assert resp.status_code == 200
    assert resp.json()["quantity_after"] == 4

    # Check low stock status
    p_check = client.get(f"/api/products/{prod_id}").json()
    assert p_check["is_low_stock"] is True

    # 5. Check Stock Movements history
    movements_resp = client.get(f"/api/stock/movements?product_id={prod_id}")
    assert movements_resp.status_code == 200
    assert movements_resp.json()["total"] >= 4  # Initial + addition + reduction + adjustment


def test_purchase_order_flow():
    # Setup supplier & products
    s_res = client.post("/api/suppliers", json={"company_name": "Mega Wholesale"})
    sup_id = s_res.json()["id"]

    p1 = client.post("/api/products", json={
        "name": "Keyboard", "sku": "KB-01", "purchase_price": 20.0, "quantity": 10, "min_stock_level": 5
    }).json()
    p2 = client.post("/api/products", json={
        "name": "Headphones", "sku": "HP-01", "purchase_price": 30.0, "quantity": 5, "min_stock_level": 5
    }).json()

    # 1. Create Purchase Order
    po_data = {
        "supplier_id": sup_id,
        "notes": "Bulk order Q1",
        "items": [
            {"product_id": p1["id"], "quantity": 15, "unit_price": 18.0},
            {"product_id": p2["id"], "quantity": 10, "unit_price": 28.0},
        ]
    }
    resp = client.post("/api/purchases", json=po_data)
    assert resp.status_code == 201
    po = resp.json()
    po_id = po["id"]
    assert po["status"] == "pending"
    assert po["total_amount"] == (15 * 18.0) + (10 * 28.0)

    # 2. Confirm Purchase -> Should increase product stocks
    resp = client.post(f"/api/purchases/{po_id}/confirm")
    assert resp.status_code == 200
    assert resp.json()["status"] == "confirmed"

    # Verify updated stocks
    updated_p1 = client.get(f"/api/products/{p1['id']}").json()
    updated_p2 = client.get(f"/api/products/{p2['id']}").json()
    assert updated_p1["quantity"] == 10 + 15
    assert updated_p2["quantity"] == 5 + 10


def test_reports_and_csv_export():
    # Setup some test data
    c = client.post("/api/categories", json={"name": "Office"}).json()
    s = client.post("/api/suppliers", json={"company_name": "Paper Co"}).json()
    client.post("/api/products", json={
        "name": "A4 Paper", "sku": "PAP-A4", "category_id": c["id"], "supplier_id": s["id"],
        "purchase_price": 5.0, "selling_price": 8.0, "quantity": 3, "min_stock_level": 10
    })

    # Summary
    summary = client.get("/api/reports/inventory-summary")
    assert summary.status_code == 200
    assert summary.json()["total_quantity"] == 3

    # Low stock
    low_stock = client.get("/api/reports/low-stock")
    assert low_stock.status_code == 200
    assert low_stock.json()["total"] == 1
    assert low_stock.json()["data"][0]["sku"] == "PAP-A4"

    # Valuation
    valuation = client.get("/api/reports/stock-valuation")
    assert valuation.status_code == 200
    assert valuation.json()["total_cost_value"] == 15.0

    # CSV Exports
    csv_resp = client.get("/api/reports/inventory-summary/csv")
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    assert "PAP-A4" in csv_resp.text


def test_dashboard_stats():
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    stats = resp.json()
    assert "total_products" in stats
    assert "total_stock_quantity" in stats
    assert "total_inventory_value" in stats
    assert "low_stock_products" in stats
    assert "out_of_stock_products" in stats
    assert "total_suppliers" in stats
