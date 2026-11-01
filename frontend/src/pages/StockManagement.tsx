import React, { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  SlidersHorizontal,
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import {
  getProducts,
  updateStock,
  getStockMovements,
} from '../services/api';
import { Product, StockMovement } from '../types';

export const StockManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<'addition' | 'reduction' | 'adjustment'>('addition');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Recent movements preview
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, moveRes] = await Promise.all([
        getProducts({ limit: 100, sort_by: 'name' }),
        getStockMovements({ limit: 8 }),
      ]);
      setProducts(prodRes.products);
      if (prodRes.products.length > 0 && !selectedProductId) {
        setSelectedProductId(prodRes.products[0].id);
      }
      setRecentMovements(moveRes.movements);
    } catch (err) {
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setMessage(null);
    setSubmitting(true);

    try {
      const result = await updateStock({
        product_id: Number(selectedProductId),
        movement_type: movementType,
        quantity_change: Number(quantityInput),
        notes: notes || undefined,
      });

      setMessage({
        text: `Stock successfully updated! New quantity: ${result.quantity_after} units.`,
        type: 'success',
      });

      setNotes('');
      // Refresh products and recent movements
      const [prodRes, moveRes] = await Promise.all([
        getProducts({ limit: 100, sort_by: 'name' }),
        getStockMovements({ limit: 8 }),
      ]);
      setProducts(prodRes.products);
      setRecentMovements(moveRes.movements);
    } catch (err: any) {
      setMessage({
        text: err.message || 'Stock operation failed.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Stock Management</h2>
        <p className="text-xs text-slate-500 mt-1">
          Perform controlled stock additions, issues/reductions, and physical inventory reconciliations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Operation Form Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-brand-600" />
              Stock Transaction Form
            </h3>
            <span className="text-xs text-slate-400">Strict Audit Log Enforced</span>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleStockSubmit} className="space-y-4">
            {/* 1. Select Operation Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Operation Type *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMovementType('addition')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    movementType === 'addition'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="h-5 w-5 text-blue-600" />
                  <span>Stock Addition</span>
                  <span className="text-[10px] font-normal text-slate-400">(Inward / Restock)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('reduction')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    movementType === 'reduction'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MinusCircle className="h-5 w-5 text-rose-600" />
                  <span>Stock Reduction</span>
                  <span className="text-[10px] font-normal text-slate-400">(Outward / Issue)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('adjustment')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    movementType === 'adjustment'
                      ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="h-5 w-5 text-purple-600" />
                  <span>Stock Adjustment</span>
                  <span className="text-[10px] font-normal text-slate-400">(Reconcile Count)</span>
                </button>
              </div>
            </div>

            {/* 2. Select Product */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.sku}] — Current Stock: {p.quantity} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Quantity Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {movementType === 'addition'
                  ? 'Quantity to Add *'
                  : movementType === 'reduction'
                  ? 'Quantity to Deduct *'
                  : 'New Reconciled Stock Quantity *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={movementType === 'adjustment' ? 0 : 1}
                  required
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 font-bold text-slate-900"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  {selectedProduct?.unit || 'units'}
                </span>
              </div>
              {movementType === 'reduction' && selectedProduct && quantityInput > selectedProduct.quantity && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Error: Cannot deduct {quantityInput} units (Only {selectedProduct.quantity} available).
                </p>
              )}
            </div>

            {/* 4. Notes & Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason / Reference Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Dispatched to regional office, annual audit adjustment, damaged in transit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || (movementType === 'reduction' && selectedProduct && quantityInput > selectedProduct.quantity)}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Applying Transaction...' : 'Apply Stock Transaction'}
            </button>
          </form>
        </div>

        {/* Live Product Status Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-600" />
              Live Product Balance Preview
            </h3>

            {selectedProduct ? (
              <div className="mt-4 space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Selected Product</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedProduct.name}</p>
                  <p className="font-mono text-slate-500 text-[11px]">SKU: {selectedProduct.sku}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Stock:</span>
                    <span className="font-bold text-slate-900">
                      {selectedProduct.quantity} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Min Alert Threshold:</span>
                    <span className="text-slate-700 font-medium">
                      {selectedProduct.min_stock_level} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost Valuation:</span>
                    <span className="font-semibold text-brand-700">
                      ₹{(selectedProduct.quantity * selectedProduct.purchase_price).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Calculation Projection */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200/60">
                  <span className="text-[10px] uppercase font-bold text-brand-700 tracking-wider">
                    Projected Balance After Transaction
                  </span>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-slate-600">Projected Quantity:</span>
                    <span className="text-base font-extrabold text-brand-900">
                      {movementType === 'addition'
                        ? selectedProduct.quantity + Number(quantityInput)
                        : movementType === 'reduction'
                        ? Math.max(0, selectedProduct.quantity - Number(quantityInput))
                        : Number(quantityInput)}{' '}
                      {selectedProduct.unit}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Select a product from the left to view balance.
              </div>
            )}
          </div>

          {/* Quick Recent Activity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-slate-400" />
              Latest Stock Updates
            </h4>
            <div className="space-y-2.5">
              {recentMovements.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{m.product_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{m.movement_type} • {m.quantity_before} → {m.quantity_after}</p>
                  </div>
                  <span className={`font-bold shrink-0 text-xs ${m.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
