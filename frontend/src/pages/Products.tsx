import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Building2,
  Tag,
  DollarSign,
  Layers,
} from 'lucide-react';
import {
  getProducts,
  getCategories,
  getSuppliers,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/api';
import { Product, Category, Supplier } from '../types';

interface ProductsPageProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [supplierFilter, setSupplierFilter] = useState<number | ''>('');
  const [stockStatus, setStockStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '' as number | '',
    supplier_id: '' as number | '',
    purchase_price: 0,
    selling_price: 0,
    quantity: 0,
    min_stock_level: 10,
    unit: 'pcs',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load products and dropdown options
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        search,
        category_id: categoryFilter,
        supplier_id: supplierFilter,
        stock_status: stockStatus,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setProducts(res.products);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [cats, sups] = await Promise.all([getCategories(), getSuppliers()]);
      setCategories(cats);
      setSuppliers(sups);
    } catch (err) {
      console.error('Error fetching categories/suppliers:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, supplierFilter, stockStatus, sortBy, sortOrder]);

  // Sync external add modal trigger
  useEffect(() => {
    if (isAddModalOpen) {
      handleOpenCreate();
    }
  }, [isAddModalOpen]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      sku: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      supplier_id: suppliers.length > 0 ? suppliers[0].id : '',
      purchase_price: 0,
      selling_price: 0,
      quantity: 0,
      min_stock_level: 10,
      unit: 'pcs',
      description: '',
    });
    setFormError(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || '',
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      quantity: product.quantity,
      min_stock_level: product.min_stock_level,
      unit: product.unit,
      description: product.description || '',
    });
    setFormError(null);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleOpenView = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('view');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        sku: formData.sku.trim().toUpperCase(),
        category_id: formData.category_id ? Number(formData.category_id) : null,
        supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
        purchase_price: Number(formData.purchase_price),
        selling_price: Number(formData.selling_price),
        min_stock_level: Number(formData.min_stock_level),
        unit: formData.unit || 'pcs',
        description: formData.description,
      };

      if (modalMode === 'create') {
        payload.quantity = Number(formData.quantity);
        await createProduct(payload);
      } else if (modalMode === 'edit' && selectedProduct) {
        await updateProduct(selectedProduct.id, payload);
      }

      setShowModal(false);
      if (onCloseAddModal) onCloseAddModal();
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Product Catalog</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your inventory items, pricing, SKU codes, and suppliers ({total} total products)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-800"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div className="md:col-span-3">
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-700"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="md:col-span-2">
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-700"
            >
              <option value="">All Stock Status</option>
              <option value="in">In Stock (Healthy)</option>
              <option value="low">Low Stock (Alert)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">Sort by:</span>
            {['name', 'quantity', 'purchase_price', 'selling_price', 'created_at'].map((col) => (
              <button
                key={col}
                onClick={() => {
                  if (sortBy === col) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(col);
                    setSortOrder('asc');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium capitalize transition-all ${
                  sortBy === col
                    ? 'bg-brand-50 text-brand-600 border-brand-200 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {col.replace('_', ' ')} {sortBy === col && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            ))}
          </div>

          {(search || categoryFilter || supplierFilter || stockStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setSupplierFilter('');
                setStockStatus('');
              }}
              className="text-brand-600 hover:text-brand-700 text-xs font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU / Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold">Cost / Sell Price</th>
                <th className="py-3 px-4 font-semibold">Stock Qty</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Inventory Value</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.category_name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {p.category_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {p.supplier_name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">₹{p.selling_price.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-400">Cost: ₹{p.purchase_price.toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {p.quantity} <span className="text-[11px] font-normal text-slate-500">{p.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {p.min_stock_level}</div>
                      </td>
                      <td className="py-3 px-4">
                        {p.quantity === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="h-3 w-3" /> Out of Stock
                          </span>
                        ) : p.quantity <= p.min_stock_level ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        ₹{(p.quantity * p.purchase_price).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(p)}
                            title="View Details"
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Product"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Product</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this product? All related stock history records will also be removed.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form / Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-600" />
                {modalMode === 'create'
                  ? 'Add New Product'
                  : modalMode === 'edit'
                  ? `Edit Product: ${selectedProduct?.name}`
                  : `Product Details: ${selectedProduct?.name}`}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {modalMode === 'view' && selectedProduct ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Product Name</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">SKU Code</span>
                    <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Category</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedProduct.category_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Supplier</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedProduct.supplier_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Purchase Cost</span>
                    <p className="font-semibold text-slate-800 mt-0.5">₹{selectedProduct.purchase_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Selling Price</span>
                    <p className="font-semibold text-emerald-700 mt-0.5">₹{selectedProduct.selling_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Current Quantity</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedProduct.quantity} {selectedProduct.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Min Stock Level</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedProduct.min_stock_level} {selectedProduct.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Stock Valuation</span>
                    <p className="font-bold text-brand-700 text-sm mt-0.5">
                      ₹{(selectedProduct.quantity * selectedProduct.purchase_price).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Created Date</span>
                    <p className="text-slate-600 mt-0.5">
                      {new Date(selectedProduct.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Description</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl mt-1 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleOpenEdit(selectedProduct)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl"
                  >
                    Edit This Product
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dell UltraSharp 27 Monitor"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code * (Unique)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ELEC-MON-007"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value ? Number(e.target.value) : '',
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
                    <select
                      value={formData.supplier_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplier_id: e.target.value ? Number(e.target.value) : '',
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Cost (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.purchase_price}
                      onChange={(e) =>
                        setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.selling_price}
                      onChange={(e) =>
                        setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>

                  {modalMode === 'create' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Quantity</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Min Stock Level (Alert threshold)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.min_stock_level}
                      onChange={(e) =>
                        setFormData({ ...formData, min_stock_level: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measurement</label>
                    <input
                      type="text"
                      placeholder="pcs, reams, boxes, kits..."
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Technical specifications, model notes, or usage details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      if (onCloseAddModal) onCloseAddModal();
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
