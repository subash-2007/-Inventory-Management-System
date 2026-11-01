"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import categories, suppliers, products, stock, purchases, dashboard, reports

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory Management System",
    description="Professional Inventory Management System API for Auspify Technologies",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router)
app.include_router(categories.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(stock.router)
app.include_router(purchases.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "name": "Inventory Management System",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}
