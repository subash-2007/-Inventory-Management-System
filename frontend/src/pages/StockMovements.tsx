import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  MinusCircle,
  SlidersHorizontal,
  ShoppingCart,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  getStockMovements,
  getProducts,
  downloadReportCsv,
} from '../services/api';
import { StockMovement, Product } from '../types';

export const StockMovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [productFilter, setProductFilter] = useState<number | ''>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await getStockMovements({
        product_id: productFilter || undefined,
        movement_type: typeFilter || undefined,
        limit: 100,
      });
      setMovements(res.movements);
      setTotal(res.total);
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.products);
    } catch (err) {
      console.error('Error loading products list:', err);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [productFilter, typeFilter]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Stock Movements Log</h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable audit record of every item received, issued, reconciled, or purchased ({total} total movements)
          </p>
        </div>
        <button
          onClick={() => downloadReportCsv('stock-movements')}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-102"
        >
          <Download className="h-4 w-4" />
          Export Movements CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.sku}]
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">All Movement Types</option>
            <option value="addition">Addition (Manual)</option>
            <option value="reduction">Reduction (Issued/Sold)</option>
            <option value="adjustment">Adjustment (Audit)</option>
            <option value="purchase">Purchase (PO Confirmed)</option>
          </select>
        </div>

        {(productFilter || typeFilter) && (
          <button
            onClick={() => {
              setProductFilter('');
              setTypeFilter('');
            }}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Movement ID</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Quantity Delta</th>
                <th className="py-3 px-4 font-semibold">Balance Transition</th>
                <th className="py-3 px-4 font-semibold">Reference / Reason</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Loading movement logs...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <History className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No stock movements matched your filters.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isPositive = m.quantity_change > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        #{m.id.toString().padStart(5, '0')}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{m.product_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{m.product_sku}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            m.movement_type === 'addition'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : m.movement_type === 'purchase'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.movement_type === 'reduction'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {m.movement_type === 'addition' && <PlusCircle className="h-3 w-3" />}
                          {m.movement_type === 'purchase' && <ShoppingCart className="h-3 w-3" />}
                          {m.movement_type === 'reduction' && <MinusCircle className="h-3 w-3" />}
                          {m.movement_type === 'adjustment' && <SlidersHorizontal className="h-3 w-3" />}
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-sm">
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-600'
                              : m.quantity_change < 0
                              ? 'text-rose-600'
                              : 'text-slate-600'
                          }
                        >
                          {isPositive ? `+${m.quantity_change}` : m.quantity_change}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {m.quantity_before} → <span className="font-bold text-slate-900">{m.quantity_after}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {m.reference && <span className="font-semibold text-slate-800">{m.reference}</span>}
                        {m.notes && <span className="block text-[11px] text-slate-400">{m.notes}</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
