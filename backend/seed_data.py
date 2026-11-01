"""Seed the database with sample inventory data."""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
import random
from database import SessionLocal, engine, Base
from models import Category, Supplier, Product, Purchase, PurchaseItem, StockMovement

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()


def seed():
    # Check if data already exists
    if db.query(Category).count() > 0:
        print("Database already seeded. Skipping.")
        return

    print("Seeding database...")

    # ── Categories ────────────────────────────────────────────────────────────
    categories_data = [
        {"name": "Electronics", "description": "Electronic devices and components"},
        {"name": "Office Supplies", "description": "Stationery, paper, pens, and office essentials"},
        {"name": "Furniture", "description": "Desks, chairs, shelves, and office furniture"},
        {"name": "Computer Hardware", "description": "CPUs, RAM, storage, and peripherals"},
        {"name": "Networking", "description": "Routers, switches, cables, and networking equipment"},
        {"name": "Software", "description": "Licensed software and subscriptions"},
        {"name": "Cleaning Supplies", "description": "Cleaning products and janitorial supplies"},
        {"name": "Safety Equipment", "description": "First aid, fire extinguishers, and safety gear"},
    ]
    categories = []
    for data in categories_data:
        cat = Category(**data)
        db.add(cat)
        categories.append(cat)
    db.flush()
    print(f"  Created {len(categories)} categories")

    # ── Suppliers ─────────────────────────────────────────────────────────────
    suppliers_data = [
        {
            "company_name": "TechVision Distributors",
            "contact_person": "Rajesh Kumar",
            "email": "rajesh@techvision.com",
            "phone": "+91-9876543210",
            "address": "42 Tech Park, Bangalore, Karnataka 560001",
        },
        {
            "company_name": "Office World Supplies",
            "contact_person": "Priya Sharma",
            "email": "priya@officeworld.in",
            "phone": "+91-9876543211",
            "address": "15 MG Road, Mumbai, Maharashtra 400001",
        },
        {
            "company_name": "Global Hardware Solutions",
            "contact_person": "Amit Patel",
            "email": "amit@globalhw.com",
            "phone": "+91-9876543212",
            "address": "78 Industrial Estate, Pune, Maharashtra 411001",
        },
        {
            "company_name": "NetConnect Systems",
            "contact_person": "Sneha Reddy",
            "email": "sneha@netconnect.in",
            "phone": "+91-9876543213",
            "address": "23 IT Corridor, Hyderabad, Telangana 500032",
        },
        {
            "company_name": "Furniture Plus",
            "contact_person": "Vikram Singh",
            "email": "vikram@furnitureplus.com",
            "phone": "+91-9876543214",
            "address": "56 Sector 18, Noida, UP 201301",
        },
        {
            "company_name": "SafeGuard Enterprises",
            "contact_person": "Deepa Iyer",
            "email": "deepa@safeguard.in",
            "phone": "+91-9876543215",
            "address": "90 Anna Nagar, Chennai, Tamil Nadu 600040",
        },
    ]
    suppliers = []
    for data in suppliers_data:
        sup = Supplier(**data)
        db.add(sup)
        suppliers.append(sup)
    db.flush()
    print(f"  Created {len(suppliers)} suppliers")

    # ── Products ──────────────────────────────────────────────────────────────
    products_data = [
        # Electronics
        {"name": "Dell Monitor 24 inch", "sku": "ELEC-MON-001", "category_id": categories[0].id, "supplier_id": suppliers[0].id, "purchase_price": 12500, "selling_price": 15999, "quantity": 45, "min_stock_level": 10, "unit": "pcs", "description": "Dell 24-inch Full HD IPS Monitor"},
        {"name": "Logitech Wireless Mouse", "sku": "ELEC-MOU-002", "category_id": categories[0].id, "supplier_id": suppliers[0].id, "purchase_price": 800, "selling_price": 1299, "quantity": 120, "min_stock_level": 20, "unit": "pcs", "description": "Logitech M235 Wireless Mouse"},
        {"name": "HP Wired Keyboard", "sku": "ELEC-KEY-003", "category_id": categories[0].id, "supplier_id": suppliers[0].id, "purchase_price": 450, "selling_price": 699, "quantity": 85, "min_stock_level": 15, "unit": "pcs", "description": "HP K1500 USB Wired Keyboard"},
        {"name": "USB-C Hub 7-in-1", "sku": "ELEC-HUB-004", "category_id": categories[0].id, "supplier_id": suppliers[0].id, "purchase_price": 1800, "selling_price": 2499, "quantity": 30, "min_stock_level": 10, "unit": "pcs", "description": "7-in-1 USB-C Hub with HDMI, USB 3.0, SD Card"},
        {"name": "Webcam HD 1080p", "sku": "ELEC-CAM-005", "category_id": categories[0].id, "supplier_id": suppliers[0].id, "purchase_price": 2200, "selling_price": 2999, "quantity": 8, "min_stock_level": 10, "unit": "pcs", "description": "Logitech C920 HD Pro Webcam"},

        # Office Supplies
        {"name": "A4 Copy Paper (Ream)", "sku": "OFF-PAP-001", "category_id": categories[1].id, "supplier_id": suppliers[1].id, "purchase_price": 250, "selling_price": 350, "quantity": 500, "min_stock_level": 100, "unit": "reams", "description": "75 GSM A4 White Copy Paper, 500 sheets per ream"},
        {"name": "Ballpoint Pens (Box of 50)", "sku": "OFF-PEN-002", "category_id": categories[1].id, "supplier_id": suppliers[1].id, "purchase_price": 180, "selling_price": 299, "quantity": 60, "min_stock_level": 15, "unit": "boxes", "description": "Blue ballpoint pens, box of 50"},
        {"name": "Stapler Heavy Duty", "sku": "OFF-STP-003", "category_id": categories[1].id, "supplier_id": suppliers[1].id, "purchase_price": 350, "selling_price": 499, "quantity": 25, "min_stock_level": 5, "unit": "pcs", "description": "Heavy duty stapler, 100 sheet capacity"},
        {"name": "Whiteboard Markers (Set of 8)", "sku": "OFF-MRK-004", "category_id": categories[1].id, "supplier_id": suppliers[1].id, "purchase_price": 220, "selling_price": 349, "quantity": 40, "min_stock_level": 10, "unit": "sets", "description": "Assorted color whiteboard markers"},
        {"name": "File Folders (Pack of 10)", "sku": "OFF-FLD-005", "category_id": categories[1].id, "supplier_id": suppliers[1].id, "purchase_price": 150, "selling_price": 249, "quantity": 0, "min_stock_level": 20, "unit": "packs", "description": "Cardboard file folders, assorted colors"},

        # Furniture
        {"name": "Ergonomic Office Chair", "sku": "FUR-CHR-001", "category_id": categories[2].id, "supplier_id": suppliers[4].id, "purchase_price": 8500, "selling_price": 12999, "quantity": 15, "min_stock_level": 5, "unit": "pcs", "description": "Adjustable ergonomic office chair with lumbar support"},
        {"name": "Standing Desk 140cm", "sku": "FUR-DSK-002", "category_id": categories[2].id, "supplier_id": suppliers[4].id, "purchase_price": 15000, "selling_price": 21999, "quantity": 8, "min_stock_level": 3, "unit": "pcs", "description": "Electric height adjustable standing desk"},
        {"name": "Metal Bookshelf 5-Tier", "sku": "FUR-SHF-003", "category_id": categories[2].id, "supplier_id": suppliers[4].id, "purchase_price": 3500, "selling_price": 4999, "quantity": 12, "min_stock_level": 4, "unit": "pcs", "description": "5-tier heavy duty metal bookshelf"},
        {"name": "Conference Table 8-Seater", "sku": "FUR-TBL-004", "category_id": categories[2].id, "supplier_id": suppliers[4].id, "purchase_price": 25000, "selling_price": 35999, "quantity": 2, "min_stock_level": 2, "unit": "pcs", "description": "Oval conference table for 8 people"},

        # Computer Hardware
        {"name": "16GB DDR4 RAM", "sku": "HW-RAM-001", "category_id": categories[3].id, "supplier_id": suppliers[2].id, "purchase_price": 3200, "selling_price": 4499, "quantity": 50, "min_stock_level": 15, "unit": "pcs", "description": "16GB DDR4 3200MHz Desktop RAM Module"},
        {"name": "512GB NVMe SSD", "sku": "HW-SSD-002", "category_id": categories[3].id, "supplier_id": suppliers[2].id, "purchase_price": 3800, "selling_price": 5299, "quantity": 35, "min_stock_level": 10, "unit": "pcs", "description": "512GB NVMe M.2 SSD, Read 3500MB/s"},
        {"name": "1TB External HDD", "sku": "HW-HDD-003", "category_id": categories[3].id, "supplier_id": suppliers[2].id, "purchase_price": 3500, "selling_price": 4799, "quantity": 0, "min_stock_level": 10, "unit": "pcs", "description": "1TB USB 3.0 Portable External Hard Drive"},
        {"name": "Graphics Card RTX 4060", "sku": "HW-GPU-004", "category_id": categories[3].id, "supplier_id": suppliers[2].id, "purchase_price": 28000, "selling_price": 34999, "quantity": 5, "min_stock_level": 3, "unit": "pcs", "description": "NVIDIA RTX 4060 8GB GDDR6 Graphics Card"},
        {"name": "Intel Core i7 Processor", "sku": "HW-CPU-005", "category_id": categories[3].id, "supplier_id": suppliers[2].id, "purchase_price": 25000, "selling_price": 32999, "quantity": 3, "min_stock_level": 5, "unit": "pcs", "description": "Intel Core i7-13700K 16-Core Processor"},

        # Networking
        {"name": "Cat6 Ethernet Cable 3m", "sku": "NET-CBL-001", "category_id": categories[4].id, "supplier_id": suppliers[3].id, "purchase_price": 150, "selling_price": 249, "quantity": 200, "min_stock_level": 50, "unit": "pcs", "description": "Cat6 RJ45 Ethernet Patch Cable, 3 meters"},
        {"name": "TP-Link 8-Port Switch", "sku": "NET-SWT-002", "category_id": categories[4].id, "supplier_id": suppliers[3].id, "purchase_price": 1200, "selling_price": 1799, "quantity": 18, "min_stock_level": 5, "unit": "pcs", "description": "TP-Link 8-Port Gigabit Ethernet Switch"},
        {"name": "WiFi 6 Router", "sku": "NET-RTR-003", "category_id": categories[4].id, "supplier_id": suppliers[3].id, "purchase_price": 3500, "selling_price": 4999, "quantity": 7, "min_stock_level": 5, "unit": "pcs", "description": "Dual-band WiFi 6 Router AX1800"},
        {"name": "RJ45 Connectors (Pack of 100)", "sku": "NET-CON-004", "category_id": categories[4].id, "supplier_id": suppliers[3].id, "purchase_price": 250, "selling_price": 399, "quantity": 35, "min_stock_level": 10, "unit": "packs", "description": "Gold-plated Cat6 RJ45 Connectors"},

        # Software
        {"name": "Microsoft 365 Business License", "sku": "SW-MS365-001", "category_id": categories[5].id, "supplier_id": suppliers[0].id, "purchase_price": 6500, "selling_price": 8499, "quantity": 25, "min_stock_level": 5, "unit": "licenses", "description": "Annual Microsoft 365 Business Standard License"},
        {"name": "Antivirus Suite (3-Year)", "sku": "SW-AV-002", "category_id": categories[5].id, "supplier_id": suppliers[0].id, "purchase_price": 2000, "selling_price": 2999, "quantity": 0, "min_stock_level": 10, "unit": "licenses", "description": "3-Year Enterprise Antivirus License"},

        # Cleaning Supplies
        {"name": "Disinfectant Spray (500ml)", "sku": "CLN-SPR-001", "category_id": categories[6].id, "supplier_id": suppliers[5].id, "purchase_price": 180, "selling_price": 279, "quantity": 60, "min_stock_level": 20, "unit": "bottles", "description": "Surface disinfectant spray"},
        {"name": "Microfiber Cleaning Cloth (Pack of 5)", "sku": "CLN-CLT-002", "category_id": categories[6].id, "supplier_id": suppliers[5].id, "purchase_price": 120, "selling_price": 199, "quantity": 40, "min_stock_level": 10, "unit": "packs", "description": "Premium microfiber cleaning cloths"},

        # Safety Equipment
        {"name": "Fire Extinguisher 2kg", "sku": "SAF-FEX-001", "category_id": categories[7].id, "supplier_id": suppliers[5].id, "purchase_price": 1200, "selling_price": 1799, "quantity": 10, "min_stock_level": 5, "unit": "pcs", "description": "ABC type dry chemical fire extinguisher"},
        {"name": "First Aid Kit (Office)", "sku": "SAF-FAK-002", "category_id": categories[7].id, "supplier_id": suppliers[5].id, "purchase_price": 800, "selling_price": 1199, "quantity": 6, "min_stock_level": 3, "unit": "kits", "description": "Comprehensive office first aid kit, 100 pieces"},
    ]

    products = []
    for data in products_data:
        product = Product(**data)
        db.add(product)
        products.append(product)
    db.flush()
    print(f"  Created {len(products)} products")

    # ── Stock Movements (initial stock) ───────────────────────────────────────
    for product in products:
        if product.quantity > 0:
            movement = StockMovement(
                product_id=product.id,
                movement_type="addition",
                quantity_change=product.quantity,
                quantity_before=0,
                quantity_after=product.quantity,
                reference="Initial stock",
                notes="Stock added during database seeding",
                created_at=datetime.utcnow() - timedelta(days=random.randint(10, 60)),
            )
            db.add(movement)

    # ── Sample Purchases ──────────────────────────────────────────────────────
    purchase_dates = [
        datetime.utcnow() - timedelta(days=90),
        datetime.utcnow() - timedelta(days=75),
        datetime.utcnow() - timedelta(days=60),
        datetime.utcnow() - timedelta(days=45),
        datetime.utcnow() - timedelta(days=30),
        datetime.utcnow() - timedelta(days=15),
        datetime.utcnow() - timedelta(days=7),
        datetime.utcnow() - timedelta(days=2),
    ]

    purchases_data = [
        {
            "supplier_id": suppliers[0].id,
            "status": "confirmed",
            "date": purchase_dates[0],
            "items": [
                {"product": products[0], "quantity": 20, "unit_price": 12500},
                {"product": products[1], "quantity": 50, "unit_price": 800},
            ]
        },
        {
            "supplier_id": suppliers[1].id,
            "status": "confirmed",
            "date": purchase_dates[1],
            "items": [
                {"product": products[5], "quantity": 200, "unit_price": 250},
                {"product": products[6], "quantity": 30, "unit_price": 180},
            ]
        },
        {
            "supplier_id": suppliers[2].id,
            "status": "confirmed",
            "date": purchase_dates[2],
            "items": [
                {"product": products[14], "quantity": 30, "unit_price": 3200},
                {"product": products[15], "quantity": 20, "unit_price": 3800},
            ]
        },
        {
            "supplier_id": suppliers[3].id,
            "status": "confirmed",
            "date": purchase_dates[3],
            "items": [
                {"product": products[19], "quantity": 100, "unit_price": 150},
                {"product": products[20], "quantity": 10, "unit_price": 1200},
            ]
        },
        {
            "supplier_id": suppliers[4].id,
            "status": "confirmed",
            "date": purchase_dates[4],
            "items": [
                {"product": products[10], "quantity": 10, "unit_price": 8500},
                {"product": products[11], "quantity": 5, "unit_price": 15000},
            ]
        },
        {
            "supplier_id": suppliers[0].id,
            "status": "confirmed",
            "date": purchase_dates[5],
            "items": [
                {"product": products[2], "quantity": 40, "unit_price": 450},
                {"product": products[3], "quantity": 15, "unit_price": 1800},
            ]
        },
        {
            "supplier_id": suppliers[2].id,
            "status": "confirmed",
            "date": purchase_dates[6],
            "items": [
                {"product": products[17], "quantity": 3, "unit_price": 28000},
                {"product": products[18], "quantity": 2, "unit_price": 25000},
            ]
        },
        {
            "supplier_id": suppliers[5].id,
            "status": "pending",
            "date": purchase_dates[7],
            "items": [
                {"product": products[25], "quantity": 30, "unit_price": 180},
                {"product": products[27], "quantity": 5, "unit_price": 1200},
            ]
        },
    ]

    for pdata in purchases_data:
        total_amount = sum(item["quantity"] * item["unit_price"] for item in pdata["items"])
        purchase = Purchase(
            supplier_id=pdata["supplier_id"],
            purchase_date=pdata["date"],
            status=pdata["status"],
            total_amount=total_amount,
            notes=f"Regular procurement order",
            created_at=pdata["date"],
        )
        db.add(purchase)
        db.flush()

        for item_data in pdata["items"]:
            purchase_item = PurchaseItem(
                purchase_id=purchase.id,
                product_id=item_data["product"].id,
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["quantity"] * item_data["unit_price"],
            )
            db.add(purchase_item)

            # Add purchase stock movement for confirmed purchases
            if pdata["status"] == "confirmed":
                movement = StockMovement(
                    product_id=item_data["product"].id,
                    movement_type="purchase",
                    quantity_change=item_data["quantity"],
                    quantity_before=item_data["product"].quantity - item_data["quantity"],
                    quantity_after=item_data["product"].quantity,
                    reference=f"Purchase #{purchase.id}",
                    notes="Stock from confirmed purchase",
                    created_at=pdata["date"] + timedelta(hours=1),
                )
                db.add(movement)

    # ── Additional Stock Movements ────────────────────────────────────────────
    additional_movements = [
        {"product": products[1], "type": "reduction", "change": -10, "ref": "Manual reduction", "notes": "Distributed to team", "days_ago": 20},
        {"product": products[5], "type": "reduction", "change": -50, "ref": "Manual reduction", "notes": "Monthly supply to departments", "days_ago": 15},
        {"product": products[14], "type": "adjustment", "change": 0, "ref": "Stock count adjustment", "notes": "Physical count reconciliation", "days_ago": 10},
        {"product": products[0], "type": "reduction", "change": -5, "ref": "Manual reduction", "notes": "Allocated to new employees", "days_ago": 5},
        {"product": products[19], "type": "reduction", "change": -20, "ref": "Manual reduction", "notes": "Used for network setup", "days_ago": 3},
    ]

    for m in additional_movements:
        p = m["product"]
        movement = StockMovement(
            product_id=p.id,
            movement_type=m["type"],
            quantity_change=m["change"],
            quantity_before=p.quantity - m["change"] if m["type"] != "adjustment" else p.quantity,
            quantity_after=p.quantity,
            reference=m["ref"],
            notes=m["notes"],
            created_at=datetime.utcnow() - timedelta(days=m["days_ago"]),
        )
        db.add(movement)

    db.commit()
    print(f"  Created {len(purchases_data)} purchases")
    print("  Created stock movement records")
    print("\nDatabase seeded successfully!")


if __name__ == "__main__":
    seed()
    db.close()
