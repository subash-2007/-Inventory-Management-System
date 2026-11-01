import React, { useEffect, useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  Package,
  X,
  AlertTriangle,
  RefreshCw,
  Building,
} from 'lucide-react';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getProducts,
} from '../services/api';
import { Supplier, Product } from '../types';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Supplier Products View
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<Product[]>([]);
  const [loadingSupplierProducts, setLoadingSupplierProducts] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers(search);
      setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingSupplier(null);
    setFormData({
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setIsEditing(true);
    setEditingSupplier(sup);
    setFormData({
      company_name: sup.company_name,
      contact_person: sup.contact_person || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (isEditing && editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
      } else {
        await createSupplier(formData);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err: any) {
      setFormError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSupplier(id);
      setDeleteConfirmId(null);
      fetchSuppliers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete supplier');
    }
  };

  const handleViewProducts = async (sup: Supplier) => {
    setViewingSupplier(sup);
    try {
      setLoadingSupplierProducts(true);
      const res = await getProducts({ supplier_id: sup.id, limit: 100 });
      setSupplierProducts(res.products);
    } catch (err) {
      console.error('Error fetching supplier products:', err);
    } finally {
      setLoadingSupplierProducts(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Supplier Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain authorized procurement vendors and contact channels ({suppliers.length} active suppliers)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by company, contact person, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
            Loading suppliers...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Truck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            No suppliers found. Add a new supplier to get started.
          </div>
        ) : (
          suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Building className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      title="Edit Supplier"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(sup.id)}
                      title="Delete Supplier"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                  {sup.company_name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {sup.contact_person && (
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{sup.contact_person}</span>
                    </div>
                  )}
                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${sup.email}`} className="text-brand-600 hover:underline">
                        {sup.email}
                      </a>
                    </div>
                  )}
                  {sup.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{sup.phone}</span>
                    </div>
                  )}
                  {sup.address && (
                    <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{sup.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-slate-400" />
                  {sup.product_count} supplied items
                </span>
                <button
                  onClick={() => handleViewProducts(sup)}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  View Catalog
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Supplier' : 'Register New Supplier'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Industrial Supplies Ltd."
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sales@apex.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91-9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Office / Warehouse Address</label>
                <textarea
                  rows={2}
                  placeholder="Full physical address or warehouse logistics hub..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Update Supplier' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Supplier Confirmation */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Supplier</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this supplier? Purchase history records will remain retained.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Supplier Catalog Modal */}
      {viewingSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Products supplied by "{viewingSupplier.company_name}"
                </h3>
                <p className="text-xs text-slate-500">{supplierProducts.length} items supplied</p>
              </div>
              <button
                onClick={() => setViewingSupplier(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingSupplierProducts ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand-600" />
              </div>
            ) : supplierProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No products currently sourced from this supplier.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Available Qty</th>
                      <th className="py-2.5 px-3">Purchase Cost</th>
                      <th className="py-2.5 px-3">Selling Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplierProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {p.quantity} {p.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">₹{p.purchase_price.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-700">
                          ₹{p.selling_price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
