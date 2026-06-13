'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name is required');

    try {
      const url = editingCategory 
        ? `http://localhost:5000/api/categories/${editingCategory.id}` 
        : `http://localhost:5000/api/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      toast.success(editingCategory ? 'Category updated' : 'Category added');
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '' });
      fetchCategories();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/categories/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Categories deleted successfully');
      setSelectedIds([]);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete categories');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>, paginatedItems: any[]) => {
    if (e.target.checked) {
      const newIds = paginatedItems.map(item => item.id);
      setSelectedIds([...new Set([...selectedIds, ...newIds])]);
    } else {
      const paginatedIds = paginatedItems.map(item => item.id);
      setSelectedIds(selectedIds.filter(id => !paginatedIds.includes(id)));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-6 text-center animate-pulse">Loading categories...</div>;

  return (
    <>
      <div className="flex flex-col gap-6 animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h1 className="page-title text-xl md:text-2xl">Category Management</h1>
          <button 
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00)' }}
          >
            + Add Category
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-gray-500">🔍</span>
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full sm:w-64 outline-none text-sm"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-end">
            <span>Show:</span>
            <select 
              className="border border-gray-200 rounded-lg px-2 py-1 outline-none"
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex justify-between items-center animate-fade-up">
          <span className="text-red-700 font-semibold">{selectedIds.length} items selected</span>
          <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
            Delete Selected
          </button>
        </div>
      )}

      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 w-12 border-r border-gray-100"></th>
              <th className="p-4 font-semibold text-sm text-gray-500">ID</th>
              <th className="p-4 font-semibold text-sm text-gray-500">Category Name</th>
              <th className="p-4 font-semibold text-sm text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredCategories = categories.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                c.id.toString().includes(searchQuery)
              );
              const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
              const paginatedCategories = filteredCategories.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              );

              return (
                <>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <td className="p-2 pl-4 border-r border-gray-100 text-center">
                      <input type="checkbox" 
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                        onChange={(e) => handleSelectAll(e, paginatedCategories)} 
                        checked={paginatedCategories.length > 0 && paginatedCategories.every(c => selectedIds.includes(c.id))} 
                      />
                    </td>
                    <td colSpan={3} className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Select All on this page</td>
                  </tr>
                  {paginatedCategories.map((cat) => (
                    <tr key={cat.id} className={`border-b border-gray-50 transition-colors ${selectedIds.includes(cat.id) ? 'bg-orange-50/50' : 'hover:bg-orange-50/30'}`}>
                <td className="p-4 border-r border-gray-50 text-center">
                  <input type="checkbox"
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                    checked={selectedIds.includes(cat.id)}
                    onChange={() => handleSelectItem(cat.id)}
                  />
                </td>
                <td className="p-4 text-sm font-medium text-gray-600">#{cat.id}</td>
                <td className="p-4 text-sm font-bold" style={{ color: 'var(--text-h)' }}>{cat.name}</td>
                  <td className="p-4 text-sm text-right space-x-2">
                    <button onClick={() => openEditModal(cat)} className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors" title="Edit">
                      <Edit size={16} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="inline-flex p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">No categories found.</td>
                </tr>
              )}
              </>
            );})()}
          </tbody>
        </table>
        </div>
        
        {/* Pagination controls inside stat-card footer */}
        {(() => {
          const filteredCount = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toString().includes(searchQuery)).length;
          const totalPages = Math.ceil(filteredCount / itemsPerPage);
          return (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 gap-4 bg-white text-sm">
              <div className="text-gray-500">
                Showing {filteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCount)} of {filteredCount} entries
              </div>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 font-semibold transition-colors">Previous</button>
                <span className="font-semibold text-gray-700 px-2">Page {currentPage} of {totalPages || 1}</span>
                <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 font-semibold transition-colors">Next</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 my-auto">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-h)' }}>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-m)' }}>Category Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  placeholder="e.g. Sparklers"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl text-white font-semibold shadow-md hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00)' }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
