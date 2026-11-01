import React, { useEffect, useState } from 'react';
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  XCircle,
  Truck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  ShoppingCart,
  Clock,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getDashboardStats,
  getCategoryStock,
  getMonthlyPurchases,
  getInventoryValue,
  getRecentMovements,
} from '../services/api';
import {
  DashboardStats,
  CategoryStockData,
  MonthlyPurchaseData,
  InventoryValueData,
  StockMovement,
} from '../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenAddProduct: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenAddProduct,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryStockData[]>([]);
  const [monthlyPurchases, setMonthlyPurchases] = useState<MonthlyPurchaseData[]>([]);
  const [inventoryValueData, setInventoryValueData] = useState<InventoryValueData[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [s, c, m, v, r] = await Promise.all([
        getDashboardStats(),
        getCategoryStock(),
        getMonthlyPurchases(),
        getInventoryValue(),
        getRecentMovements(),
      ]);
      setStats(s);
      setCategoryData(c);
      setMonthlyPurchases(m);
      setInventoryValueData(v);
      setRecentMovements(r);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Dashboard Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Auspify Technologies • Internship Project
          </span>
          <h2 className="text-2xl font-bold mt-2 tracking-tight">
            Inventory Overview & Analytics
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Real-time tracking of stock levels, procurement valuation, supplier metrics, and inventory movements.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-102"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
          <button
            onClick={() => onNavigate('stock')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowUpRight className="h-4 w-4" />
            Stock Adjust
          </button>
          <button
            onClick={() => onNavigate('purchases')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
          >
            <ShoppingCart className="h-4 w-4" />
            New Purchase
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-brand-300"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Products</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.total_products ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>In {stats?.total_categories ?? 0} categories</span>
          </div>
        </div>

        {/* Total Stock Quantity */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-brand-300"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Stock</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.total_stock_quantity.toLocaleString() ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available Units</div>
        </div>

        {/* Total Inventory Value */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Value</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{stats?.total_inventory_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Based on purchase cost</div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-amber-300"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats?.low_stock_products ?? 0}</div>
          <div className="text-[11px] text-amber-700/80 font-medium mt-1">Below minimum level</div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-rose-300"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Out of Stock</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats?.out_of_stock_products ?? 0}</div>
          <div className="text-[11px] text-rose-700/80 font-medium mt-1">Requires reorder</div>
        </div>

        {/* Total Suppliers */}
        <div
          onClick={() => onNavigate('suppliers')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-purple-300"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Suppliers</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.total_suppliers ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active vendor network</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-wise Stock Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Category-wise Stock Levels</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quantity of available products per category</p>
            </div>
            <span className="p-2 rounded-lg bg-slate-50 text-slate-500">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} units`, 'Stock']}
                />
                <Bar dataKey="stock" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Purchases Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Monthly Purchase Volume</h3>
              <p className="text-xs text-slate-500 mt-0.5">Procurement spend (INR) over recent months</p>
            </div>
            <span className="p-2 rounded-lg bg-slate-50 text-slate-500">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPurchases} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Total Purchased']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purchaseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Stock Activities Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-slate-400" />
              Recent Stock Activities
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time inventory audit logs and transactions</p>
          </div>
          <button
            onClick={() => onNavigate('movements')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All Movements <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {recentMovements.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No stock movements recorded yet.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-[11px] pb-2">
                  <th className="py-2.5 font-semibold">Product</th>
                  <th className="py-2.5 font-semibold">SKU</th>
                  <th className="py-2.5 font-semibold">Activity Type</th>
                  <th className="py-2.5 font-semibold">Change</th>
                  <th className="py-2.5 font-semibold">Balance</th>
                  <th className="py-2.5 font-semibold">Reference / Notes</th>
                  <th className="py-2.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentMovements.map((m) => {
                  const isPositive = m.quantity_change > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">{m.product_name}</td>
                      <td className="py-3 font-mono text-slate-500">{m.product_sku}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            m.movement_type === 'addition'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : m.movement_type === 'purchase'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.movement_type === 'reduction'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="py-3 font-bold">
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
                      <td className="py-3 font-medium text-slate-600">
                        {m.quantity_before} → <span className="font-bold text-slate-900">{m.quantity_after}</span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {m.reference && <span className="font-medium text-slate-700">{m.reference}</span>}
                        {m.notes && <span className="text-[11px] block text-slate-400">{m.notes}</span>}
                      </td>
                      <td className="py-3 text-slate-400 text-[11px]">
                        {new Date(m.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
