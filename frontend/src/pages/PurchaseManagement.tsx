import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Building,
  Calendar,
  DollarSign,
  Package,
  X,
  RefreshCw,
  Clock,
} from 'lucide-react';
import {
  getPurchases,
  getPurchase,
  createPurchase,
  confirmPurchase,
  cancelPurchase,
  getSuppliers,
  getProducts,
} from '../services/api';
import { Purchase, Supplier, Product } from '../types';

export const PurchaseManagementPage: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [supplierFilter, setSupplierFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // New PO Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<
    { product_id: number; quantity: number; unit_price: number }[]
  >([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await getPurchases({
        supplier_id: supplierFilter || undefined,
        status: statusFilter || undefined,
      });
      setPurchases(res.purchases);
      setTotal(res.total);
    } catch (err) {
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [sups, prods] = await Promise.all([
        getSuppliers(),
        getProducts({ limit: 100 }),
      ]);
      setSuppliers(sups);
      setProducts(prods.products);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [supplierFilter, statusFilter]);

  const handleOpenCreate = () => {
    setSelectedSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
    setPoNotes('');
    if (products.length > 0) {
      setPoItems([
        {
          product_id: products[0].id,
          quantity: 10,
          unit_price: products[0].purchase_price,
        },
      ]);
    } else {
      setPoItems([]);
    }
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    setPoItems([
      ...poItems,
      {
        product_id: products[0].id,
        quantity: 10,
        unit_price: products[0].purchase_price,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    if (field === 'product_id') {
      const prod = products.find((p) => p.id === Number(value));
      updated[index].product_id = Number(value);
      if (prod) {
        updated[index].unit_price = prod.purchase_price;
      }
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === 'unit_price') {
      updated[index].unit_price = Math.max(0, parseFloat(value) || 0);
    }
    setPoItems(updated);
  };

  const calculateTotalOrderValue = () => {
    return poItems.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setFormError('Please select a supplier.');
      return;
    }
    if (poItems.length === 0) {
      setFormError('Please add at least one product item to the order.');
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await createPurchase({
        supplier_id: Number(selectedSupplierId),
        notes: poNotes || undefined,
        items: poItems,
      });
      setShowCreateModal(false);
      fetchPurchases();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create purchase order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPurchase = async (id: number) => {
    if (!window.confirm('Confirming this purchase order will automatically increase product inventory stocks and write audit movement logs. Proceed?')) {
      return;
    }
    try {
      setActionLoading(true);
      await confirmPurchase(id);
      fetchPurchases();
      if (viewingPurchase && viewingPurchase.id === id) {
        const updated = await getPurchase(id);
        setViewingPurchase(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to confirm purchase.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPurchase = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this purchase order?')) {
      return;
    }
    try {
      setActionLoading(true);
      await cancelPurchase(id);
      fetchPurchases();
      if (viewingPurchase && viewingPurchase.id === id) {
        const updated = await getPurchase(id);
        setViewingPurchase(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel purchase.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPurchase = async (p: Purchase) => {
    try {
      const full = await getPurchase(p.id);
      setViewingPurchase(full);
    } catch (err) {
      setViewingPurchase(p);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Purchase Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Procurement workflow: raise purchase orders, select suppliers, and receive inventory ({total} total orders)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          Create Purchase Order
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Receipt</option>
            <option value="confirmed">Confirmed & In-Stock</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {(supplierFilter || statusFilter) && (
          <button
            onClick={() => {
              setSupplierFilter('');
              setStatusFilter('');
            }}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">PO Number</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold">Order Date</th>
                <th className="py-3 px-4 font-semibold">Line Items</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Loading purchase orders...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      PO-#{p.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {p.supplier_name || 'Vendor'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.purchase_date).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.items ? p.items.length : 0} items
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      ₹{p.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {p.status === 'confirmed' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : p.status === 'pending' ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewPurchase(p)}
                          title="View PO Details"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {p.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmPurchase(p.id)}
                              disabled={actionLoading}
                              title="Confirm Receipt & Update Stock"
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleCancelPurchase(p.id)}
                              disabled={actionLoading}
                              title="Cancel Order"
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
                Create New Purchase Order
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Supplier *</label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Order Notes</label>
                  <input
                    type="text"
                    placeholder="PO reference or delivery instructions..."
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              {/* Purchase Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">Order Items *</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Another Item
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex-1 w-full sm:w-auto">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} [{p.sku}]
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-28 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-medium">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg text-center"
                        />
                      </div>

                      <div className="w-full sm:w-32 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-medium">Rate:</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg text-right"
                        />
                      </div>

                      <div className="w-full sm:w-28 text-right font-bold text-xs text-slate-800">
                        ₹{(item.quantity * item.unit_price).toLocaleString()}
                      </div>

                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800">Calculated Purchase Order Total:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Inventory will update upon receiving confirmation.</p>
                </div>
                <div className="text-xl font-black text-emerald-800">
                  ₹{calculateTotalOrderValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Generating PO...' : 'Create Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Purchase Order Drawer / Details Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Purchase Order #{viewingPurchase.id.toString().padStart(4, '0')}
                </h3>
                <p className="text-xs text-slate-500">
                  Supplier: {viewingPurchase.supplier_name} • Date:{' '}
                  {new Date(viewingPurchase.purchase_date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setViewingPurchase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold uppercase text-slate-800">{viewingPurchase.status}</span>
              </div>
              {viewingPurchase.notes && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Notes:</span>
                  <span className="text-slate-800">{viewingPurchase.notes}</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingPurchase.items?.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{it.product_name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{it.product_sku}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₹{it.unit_price.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{it.total_price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/80 font-bold text-slate-900">
                    <td colSpan={4} className="py-3 px-3 text-right">Grand Total:</td>
                    <td className="py-3 px-3 text-right text-emerald-800 text-sm">
                      ₹{viewingPurchase.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Created: {new Date(viewingPurchase.created_at).toLocaleString()}
              </span>

              {viewingPurchase.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCancelPurchase(viewingPurchase.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl"
                  >
                    Cancel Order
                  </button>
                  <button
                    onClick={() => handleConfirmPurchase(viewingPurchase.id)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                  >
                    Confirm Receipt & Restock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
