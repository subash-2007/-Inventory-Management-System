import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  lowStockProducts: Product[];
  onRefresh?: () => void;
  onNavigate: (page: string) => void;
  onQuickAddProduct?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  lowStockProducts,
  onRefresh,
  onNavigate,
  onQuickAddProduct,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const totalAlerts = lowStockProducts.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Title & Context */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Actions & Notifications */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {/* Low Stock Alert Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg relative transition-colors ${
              totalAlerts > 0
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title={`${totalAlerts} inventory alerts`}
          >
            <Bell className="h-4.5 w-4.5" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Inventory Alerts ({totalAlerts})
                </span>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('reports');
                  }}
                  className="text-[11px] text-brand-600 hover:underline font-medium"
                >
                  View Report
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {totalAlerts === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    All inventory levels are healthy!
                  </div>
                ) : (
                  lowStockProducts.slice(0, 5).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('products');
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{prod.name}</p>
                          <p className="text-[11px] text-slate-500">SKU: {prod.sku}</p>
                        </div>
                        {prod.quantity === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                            <XCircle className="h-3 w-3" /> Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                            <AlertTriangle className="h-3 w-3" /> {prod.quantity} {prod.unit}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        Min stock level: {prod.min_stock_level} {prod.unit}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {totalAlerts > 5 && (
                <div className="p-2 text-center border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('products');
                    }}
                    className="text-xs text-slate-600 hover:text-brand-600 font-medium"
                  >
                    +{totalAlerts - 5} more items
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Add Product Button */}
        {onQuickAddProduct && (
          <button
            onClick={onQuickAddProduct}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-brand-600/30 transition-all hover:shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>
    </header>
  );
};
