import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  ArrowLeftRight,
  ShoppingCart,
  History,
  FileBarChart2,
  Settings,
  Boxes,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  lowStockCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined, badgeColor: 'bg-amber-500' },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'stock', label: 'Stock Management', icon: ArrowLeftRight },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'movements', label: 'Stock Movements', icon: History },
    { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              Auspify IMS
              <span className="text-[10px] font-medium bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded border border-brand-500/30">PRO</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Inventory System</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-700/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Transactions & Insights
        </div>
        {navItems.slice(5).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-700/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Auspify Internship Footer Card */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-800/30 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 text-brand-400 font-semibold mb-1">
          <Sparkles className="h-4 w-4" />
          <span>Auspify Technologies</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Software Development Internship Project • 2026
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            FastAPI Live
          </span>
          <span className="font-mono text-slate-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
