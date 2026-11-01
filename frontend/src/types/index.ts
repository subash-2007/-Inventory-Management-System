export interface Category {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  product_count: number;
}

export interface Supplier {
  id: number;
  company_name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
  product_count: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category_id?: number | null;
  description?: string | null;
  supplier_id?: number | null;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  min_stock_level: number;
  unit: string;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  supplier_name?: string | null;
  stock_value: number;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  movement_type: 'addition' | 'reduction' | 'adjustment' | 'purchase';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface PurchaseItem {
  id?: number;
  product_id: number;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Purchase {
  id: number;
  supplier_id: number;
  supplier_name: string;
  purchase_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount: number;
  notes?: string | null;
  items: PurchaseItem[];
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_products: number;
  total_stock_quantity: number;
  total_inventory_value: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_suppliers: number;
  total_categories: number;
  total_purchases: number;
}

export interface CategoryStockData {
  category: string;
  stock: number;
  value: number;
}

export interface MonthlyPurchaseData {
  month: string;
  amount: number;
  count: number;
}

export interface InventoryValueData {
  month: string;
  value: number;
}

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  min_stock_level: number;
  suggested_reorder: number;
  status: string;
}
