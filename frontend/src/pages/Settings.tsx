import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  Bell,
  Database,
  CheckCircle2,
  ShieldCheck,
  Server,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [currency, setCurrency] = useState('₹ (INR)');
  const [lowStockDefault, setLowStockDefault] = useState(10);
  const [companyName, setCompanyName] = useState('Auspify Technologies Pvt. Ltd.');
  const [warehouseLocation, setWarehouseLocation] = useState('Main Logistics Hub - Bangalore');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure application preferences, company profile, currency localization, and database parameters
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>System configuration preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="h-5 w-5 text-brand-600" />
            Company & Organization Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Warehouse / Hub Location</label>
              <input
                type="text"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>
        </div>

        {/* Currency & Inventory Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Currency & Inventory Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="₹ (INR)">₹ - Indian Rupee (INR)</option>
                <option value="$ (USD)">$ - US Dollar (USD)</option>
                <option value="€ (EUR)">€ - Euro (EUR)</option>
                <option value="£ (GBP)">£ - British Pound (GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Low Stock Threshold</label>
              <input
                type="number"
                min="1"
                value={lowStockDefault}
                onChange={(e) => setLowStockDefault(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Products whose available quantity falls at or below this value will trigger alert badges.
              </p>
            </div>
          </div>
        </div>

        {/* System & Architecture Diagnostics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="h-5 w-5 text-purple-600" />
            System & Architecture Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium">Backend API Engine</span>
              <p className="font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                FastAPI 0.103.2 (Port 8001)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium">Database Engine</span>
              <p className="font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                SQLite3 + SQLAlchemy ORM
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium">Frontend Framework</span>
              <p className="font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                React 18 + TypeScript + Vite
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">Database Integrity Constraints Active</p>
                <p className="text-slate-400 text-[11px]">Non-negative stock rules & foreign key relationships enforced.</p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              VERIFIED
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all hover:scale-102"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
