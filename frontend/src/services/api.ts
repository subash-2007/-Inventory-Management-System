import {
  Category,
  Supplier,
  Product,
  StockMovement,
  Purchase,
  DashboardStats,
  CategoryStockData,
  MonthlyPurchaseData,
  InventoryValueData,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = `Request failed: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' 
          ? errorJson.detail 
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// ── Dashboard APIs ────────────────────────────────────────────────────────────

export const getDashboardStats = () => request<DashboardStats>('/dashboard/stats');
export const getCategoryStock = () => request<CategoryStockData[]>('/dashboard/category-stock');
export const getMonthlyPurchases = () => request<MonthlyPurchaseData[]>('/dashboard/monthly-purchases');
export const getInventoryValue = () => request<InventoryValueData[]>('/dashboard/inventory-value');
export const getRecentMovements = () => request<StockMovement[]>('/dashboard/recent-movements');

// ── Product APIs ──────────────────────────────────────────────────────────────

export interface ProductFilters {
  skip?: number;
  limit?: number;
  search?: string;
  category_id?: number | '';
  supplier_id?: number | '';
  stock_status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const getProducts = (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.category_id) params.append('category_id', filters.category_id.toString());
  if (filters.supplier_id) params.append('supplier_id', filters.supplier_id.toString());
  if (filters.stock_status) params.append('stock_status', filters.stock_status);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.sort_order) params.append('sort_order', filters.sort_order);

  return request<{ products: Product[]; total: number }>(`/products?${params.toString()}`);
};

export const getProduct = (id: number) => request<Product>(`/products/${id}`);

export const createProduct = (data: Partial<Product>) =>
  request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProduct = (id: number, data: Partial<Product>) =>
  request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProduct = (id: number) =>
  request<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  });

// ── Category APIs ─────────────────────────────────────────────────────────────

export const getCategories = (search: string = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request<Category[]>(`/categories${query}`);
};

export const createCategory = (data: { name: string; description?: string }) =>
  request<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateCategory = (id: number, data: { name: string; description?: string }) =>
  request<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteCategory = (id: number) =>
  request<{ message: string }>(`/categories/${id}`, {
    method: 'DELETE',
  });

// ── Supplier APIs ─────────────────────────────────────────────────────────────

export const getSuppliers = (search: string = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request<Supplier[]>(`/suppliers${query}`);
};

export const createSupplier = (data: Partial<Supplier>) =>
  request<Supplier>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSupplier = (id: number, data: Partial<Supplier>) =>
  request<Supplier>(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteSupplier = (id: number) =>
  request<{ message: string }>(`/suppliers/${id}`, {
    method: 'DELETE',
  });

// ── Stock Management APIs ────────────────────────────────────────────────────

export interface StockUpdateRequest {
  product_id: number;
  movement_type: 'addition' | 'reduction' | 'adjustment';
  quantity_change: number;
  notes?: string;
}

export const updateStock = (data: StockUpdateRequest) =>
  request<StockMovement>('/stock/update', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getStockMovements = (filters: { product_id?: number; movement_type?: string; limit?: number; skip?: number } = {}) => {
  const params = new URLSearchParams();
  if (filters.product_id) params.append('product_id', filters.product_id.toString());
  if (filters.movement_type) params.append('movement_type', filters.movement_type);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.skip) params.append('skip', filters.skip.toString());
  return request<{ movements: StockMovement[]; total: number }>(`/stock/movements?${params.toString()}`);
};

// ── Purchase Management APIs ──────────────────────────────────────────────────

export interface CreatePurchaseData {
  supplier_id: number;
  notes?: string;
  items: { product_id: number; quantity: number; unit_price: number }[];
}

export const getPurchases = (filters: { supplier_id?: number; status?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.supplier_id) params.append('supplier_id', filters.supplier_id.toString());
  if (filters.status) params.append('status', filters.status);
  return request<{ purchases: Purchase[]; total: number }>(`/purchases?${params.toString()}`);
};

export const getPurchase = (id: number) => request<Purchase>(`/purchases/${id}`);

export const createPurchase = (data: CreatePurchaseData) =>
  request<Purchase>('/purchases', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const confirmPurchase = (id: number) =>
  request<Purchase>(`/purchases/${id}/confirm`, {
    method: 'POST',
  });

export const cancelPurchase = (id: number) =>
  request<Purchase>(`/purchases/${id}/cancel`, {
    method: 'POST',
  });

// ── Reports APIs ─────────────────────────────────────────────────────────────

export const getInventorySummaryReport = () =>
  request<{ data: any[]; total_value: number; total_quantity: number }>('/reports/inventory-summary');

export const getStockValuationReport = () =>
  request<{ data: any[]; total_cost_value: number; total_retail_value: number; total_potential_profit: number }>('/reports/stock-valuation');

export const getLowStockReport = () =>
  request<{ data: any[]; total: number }>('/reports/low-stock');

export const getPurchaseReport = (supplier_id?: number, status?: string) => {
  const params = new URLSearchParams();
  if (supplier_id) params.append('supplier_id', supplier_id.toString());
  if (status) params.append('status', status);
  return request<{ data: any[]; total: number; total_amount: number }>(`/reports/purchases?${params.toString()}`);
};

export const getSupplierReport = () =>
  request<{ data: any[]; total: number }>('/reports/suppliers');

export const getStockMovementReport = (product_id?: number, movement_type?: string) => {
  const params = new URLSearchParams();
  if (product_id) params.append('product_id', product_id.toString());
  if (movement_type) params.append('movement_type', movement_type);
  return request<{ data: any[]; total: number }>(`/reports/stock-movements?${params.toString()}`);
};

// CSV Export Trigger
export const downloadReportCsv = (reportType: string) => {
  const url = `${API_BASE}/reports/${reportType}/csv`;
  window.open(url, '_blank');
};
