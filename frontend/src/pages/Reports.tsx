import React, { useEffect, useState } from 'react';
import {
  FileBarChart2,
  Download,
  DollarSign,
  AlertTriangle,
  XCircle,
  Truck,
  ShoppingCart,
  Boxes,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  getInventorySummaryReport,
  getStockValuationReport,
  getLowStockReport,
  getPurchaseReport,
  getSupplierReport,
  getStockMovementReport,
  downloadReportCsv,
} from '../services/api';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'valuation' | 'low-stock' | 'out-of-stock' | 'purchases' | 'suppliers' | 'movements'
  >('summary');

  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchActiveReport = async () => {
    try {
      setLoading(true);
      if (activeTab === 'summary') {
        const res = await getInventorySummaryReport();
        setData(res.data);
        setMeta({ total_value: res.total_value, total_quantity: res.total_quantity });
      } else if (activeTab === 'valuation') {
        const res = await getStockValuationReport();
        setData(res.data);
        setMeta({
          cost: res.total_cost_value,
          retail: res.total_retail_value,
          profit: res.total_potential_profit,
        });
      } else if (activeTab === 'low-stock') {
        const res = await getLowStockReport();
        // Low stock only (qty > 0)
        setData(res.data.filter((d: any) => d.quantity > 0));
        setMeta({ total: res.data.filter((d: any) => d.quantity > 0).length });
      } else if (activeTab === 'out-of-stock') {
        const res = await getLowStockReport();
        // Out of stock only (qty == 0)
        setData(res.data.filter((d: any) => d.quantity === 0));
        setMeta({ total: res.data.filter((d: any) => d.quantity === 0).length });
      } else if (activeTab === 'purchases') {
        const res = await getPurchaseReport();
        setData(res.data);
        setMeta({ total_amount: res.total_amount, total: res.total });
      } else if (activeTab === 'suppliers') {
        const res = await getSupplierReport();
        setData(res.data);
        setMeta({ total: res.total });
      } else if (activeTab === 'movements') {
        const res = await getStockMovementReport();
        setData(res.data);
        setMeta({ total: res.total });
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveReport();
  }, [activeTab]);

  const handleExportCsv = () => {
    let reportKey: string = activeTab;
    if (activeTab === 'summary') reportKey = 'inventory-summary';
    else if (activeTab === 'valuation') reportKey = 'stock-valuation';
    else if (activeTab === 'low-stock' || activeTab === 'out-of-stock') reportKey = 'low-stock';
    else if (activeTab === 'movements') reportKey = 'stock-movements';

    downloadReportCsv(reportKey);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Business Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business intelligence, stock valuation models, and exportable financial data
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all hover:scale-102"
        >
          <Download className="h-4 w-4" />
          Export Current Report to CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-1.5">
        {[
          { id: 'summary', label: 'Inventory Summary', icon: Boxes },
          { id: 'valuation', label: 'Stock Valuation & Margins', icon: DollarSign },
          { id: 'low-stock', label: 'Low Stock Alerts', icon: AlertTriangle },
          { id: 'out-of-stock', label: 'Out of Stock Items', icon: XCircle },
          { id: 'purchases', label: 'Purchase History', icon: ShoppingCart },
          { id: 'suppliers', label: 'Supplier Performance', icon: Truck },
          { id: 'movements', label: 'Movement Audit Log', icon: FileBarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Summary Cards Banner */}
      {activeTab === 'summary' && meta.total_value !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Catalog Stock Valuation</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{meta.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Units in Storage</span>
            <div className="text-2xl font-black text-brand-600 mt-1">
              {meta.total_quantity?.toLocaleString()} Units
            </div>
          </div>
        </div>
      )}

      {activeTab === 'valuation' && meta.cost !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Inventory Cost</span>
            <div className="text-2xl font-black text-slate-800 mt-1">
              ₹{meta.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">At acquisition price</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Retail Value</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">
              ₹{meta.retail.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">At current selling price</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Potential Gross Profit</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₹{meta.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Margin: {meta.retail ? ((meta.profit / meta.retail) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Main Report Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
              Generating report data...
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No data records found for this report.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                {activeTab === 'summary' && (
                  <tr>
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold">SKU</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Supplier</th>
                    <th className="py-3 px-4 font-semibold">Quantity</th>
                    <th className="py-3 px-4 font-semibold">Cost Price</th>
                    <th className="py-3 px-4 font-semibold">Sell Price</th>
                    <th className="py-3 px-4 font-semibold">Stock Valuation</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                )}
                {activeTab === 'valuation' && (
                  <tr>
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold">SKU</th>
                    <th className="py-3 px-4 font-semibold">In Stock</th>
                    <th className="py-3 px-4 font-semibold">Cost / Unit</th>
                    <th className="py-3 px-4 font-semibold">Sell / Unit</th>
                    <th className="py-3 px-4 font-semibold">Total Cost Value</th>
                    <th className="py-3 px-4 font-semibold">Total Retail Value</th>
                    <th className="py-3 px-4 font-semibold">Projected Profit</th>
                  </tr>
                )}
                {(activeTab === 'low-stock' || activeTab === 'out-of-stock') && (
                  <tr>
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold">SKU</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Supplier</th>
                    <th className="py-3 px-4 font-semibold">Current Qty</th>
                    <th className="py-3 px-4 font-semibold">Min Level</th>
                    <th className="py-3 px-4 font-semibold">Suggested Reorder</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                )}
                {activeTab === 'purchases' && (
                  <tr>
                    <th className="py-3 px-4 font-semibold">PO #</th>
                    <th className="py-3 px-4 font-semibold">Supplier</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Line Items</th>
                    <th className="py-3 px-4 font-semibold">Total Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                )}
                {activeTab === 'suppliers' && (
                  <tr>
                    <th className="py-3 px-4 font-semibold">Company Name</th>
                    <th className="py-3 px-4 font-semibold">Contact Person</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Phone</th>
                    <th className="py-3 px-4 font-semibold">Supplied Items</th>
                    <th className="py-3 px-4 font-semibold">Total Procured</th>
                  </tr>
                )}
                {activeTab === 'movements' && (
                  <tr>
                    <th className="py-3 px-4 font-semibold">ID</th>
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold">SKU</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Delta</th>
                    <th className="py-3 px-4 font-semibold">Balance</th>
                    <th className="py-3 px-4 font-semibold">Reference</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'summary' &&
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.sku}</td>
                      <td className="py-3 px-4 text-slate-600">{row.category}</td>
                      <td className="py-3 px-4 text-slate-600">{row.supplier}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.quantity} {row.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-700">₹{row.purchase_price.toLocaleString()}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">₹{row.selling_price.toLocaleString()}</td>
                      <td className="py-3 px-4 font-black text-slate-900">₹{row.stock_value.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === 'Out of Stock'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : row.status === 'Low Stock'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'valuation' &&
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.sku}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.quantity}</td>
                      <td className="py-3 px-4 text-slate-600">₹{row.purchase_price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">₹{row.selling_price.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">₹{row.cost_value.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-indigo-700">₹{row.retail_value.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">₹{row.potential_profit.toLocaleString()}</td>
                    </tr>
                  ))}

                {(activeTab === 'low-stock' || activeTab === 'out-of-stock') &&
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.sku}</td>
                      <td className="py-3 px-4 text-slate-600">{row.category}</td>
                      <td className="py-3 px-4 text-slate-600">{row.supplier}</td>
                      <td className="py-3 px-4 font-black text-rose-600 text-sm">{row.quantity}</td>
                      <td className="py-3 px-4 text-slate-500">{row.min_stock_level}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        +{row.suggested_reorder} units suggested
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === 'Out of Stock'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'purchases' &&
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">PO-#{row.id.toString().padStart(4, '0')}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{row.supplier}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-600">{row.items_count} items</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{row.total_amount.toLocaleString()}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold">{row.status}</td>
                    </tr>
                  ))}

                {activeTab === 'suppliers' &&
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.company_name}</td>
                      <td className="py-3 px-4 text-slate-700">{row.contact_person}</td>
                      <td className="py-3 px-4 text-brand-600">{row.email}</td>
                      <td className="py-3 px-4 text-slate-600">{row.phone}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.products_count} items</td>
                      <td className="py-3 px-4 font-black text-slate-900">₹{row.total_purchases.toLocaleString()}</td>
                    </tr>
                  ))}

                {activeTab === 'movements' &&
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-400">#{row.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.product_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.product_sku}</td>
                      <td className="py-3 px-4 capitalize font-semibold">{row.movement_type}</td>
                      <td className="py-3 px-4 font-bold">
                        {row.quantity_change > 0 ? `+${row.quantity_change}` : row.quantity_change}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {row.quantity_before} → {row.quantity_after}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{row.reference}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(row.date).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
