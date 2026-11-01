import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  X,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
} from '../services/api';
import { Category, Product } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // View Category Products Drawer/Modal
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories(search);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingCategory(null);
    setName('');
    setDescription('');
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setIsEditing(true);
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (isEditing && editingCategory) {
        await updateCategory(editingCategory.id, { name, description });
      } else {
        await createCategory({ name, description });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleViewProducts = async (cat: Category) => {
    setViewingCategory(cat);
    try {
      setLoadingCategoryProducts(true);
      const res = await getProducts({ category_id: cat.id, limit: 100 });
      setCategoryProducts(res.products);
    } catch (err) {
      console.error('Error fetching category products:', err);
    } finally {
      setLoadingCategoryProducts(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Category Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize inventory items into logical classification tiers ({categories.length} total categories)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Layers className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            No categories found. Create your first category above.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit Category"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(cat.id)}
                      title="Delete Category"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-slate-400" />
                  {cat.product_count} products
                </span>
                <button
                  onClick={() => handleViewProducts(cat)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <FolderOpen className="h-3.5 w-3.5" /> View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Category' : 'Create New Category'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telecommunications, Hardware..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Classification details and product grouping scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  {submitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Category</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this category? Associated products may be unassigned.
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

      {/* View Products By Category Drawer/Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Products in "{viewingCategory.name}"
                </h3>
                <p className="text-xs text-slate-500">{categoryProducts.length} items cataloged</p>
              </div>
              <button
                onClick={() => setViewingCategory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingCategoryProducts ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand-600" />
              </div>
            ) : categoryProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No products currently registered under this category.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Stock Quantity</th>
                      <th className="py-2.5 px-3">Selling Price</th>
                      <th className="py-2.5 px-3">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categoryProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {p.quantity} {p.unit}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          ₹{p.selling_price.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{p.supplier_name || 'N/A'}</td>
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
