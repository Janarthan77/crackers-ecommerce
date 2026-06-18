'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit, Trash2, X, PackageOpen, UploadCloud } from 'lucide-react';

interface Product {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  discount?: number;
  image: string;
  stock: number;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ categoryId: '', name: '', price: '', discount: '', image: '', stock: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/products`),
        fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/categories`)
      ]);
      
      if (!prodRes.ok || !catRes.ok) throw new Error('Failed to fetch data');
      
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.price) {
      return toast.error('Please fill all required fields');
    }

    try {
      setIsUploading(true);
      let finalImageUrl = formData.image;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/upload`, {
          method: 'POST',
          body: uploadData,
        });

        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const uploadResult = await uploadRes.json();
        finalImageUrl = uploadResult.url;
      }

      const url = editingProduct 
        ? `${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/products/${editingProduct.id}` 
        : `${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        image: finalImageUrl || ''
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      toast.success(editingProduct ? 'Product updated' : 'Product added');
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ categoryId: '', name: '', price: '', discount: '', image: '', stock: '' });
      setImageFile(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/products/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Products deleted successfully');
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete products');
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

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({ 
      categoryId: product.categoryId?.toString() || '', 
      name: product.name, 
      price: product.price?.toString() || '', 
      discount: product.discount?.toString() || '',
      image: product.image || '',
      stock: product.stock?.toString() || '0'
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ categoryId: '', name: '', price: '', discount: '', image: '', stock: '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const getCategoryName = (id: any) => {
    return categories.find(c => Number(c.id) === Number(id))?.name || 'Unknown';
  };

  if (loading) return <div className="p-6 text-center animate-pulse">Loading products...</div>;

  return (
    <>
      <div className="flex flex-col gap-6 animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h1 className="page-title text-xl md:text-2xl">Product Management</h1>
          <button 
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00)' }}
          >
            + Add Product
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-gray-500">🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
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
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 w-12 border-r border-gray-100"></th>
                <th className="p-4 font-semibold text-sm text-gray-500">Image</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Product Name</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Category</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Price</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Discount</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Stock</th>
                <th className="p-4 font-semibold text-sm text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredProducts = products.filter(p => 
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  p.id.toString().includes(searchQuery)
                );
                const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
                const paginatedProducts = filteredProducts.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                );

                return (
                  <>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <td className="p-2 pl-4 border-r border-gray-100 text-center">
                        <input type="checkbox" 
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                          onChange={(e) => handleSelectAll(e, paginatedProducts)} 
                          checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id))} 
                        />
                      </td>
                      <td colSpan={6} className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Select All on this page</td>
                    </tr>
                    {paginatedProducts.map((prod) => (
                      <tr key={prod.id} className={`border-b border-gray-50 transition-colors ${selectedIds.includes(prod.id) ? 'bg-orange-50/50' : 'hover:bg-orange-50/30'}`}>
                  <td className="p-4 border-r border-gray-50 text-center">
                    <input type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                      checked={selectedIds.includes(prod.id)}
                      onChange={() => handleSelectItem(prod.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {prod.image ? (
                        <img src={prod.image.startsWith('http') ? prod.image : `/images/${prod.image}`} alt={prod.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold" style={{ color: 'var(--text-h)' }}>{prod.name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-semibold">{getCategoryName(prod.categoryId)}</span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-green-600">
                    {prod.discount && prod.discount > 0 ? (
                      <div className="flex flex-col">
                        <span className="line-through text-gray-400 text-xs">₹{prod.price}</span>
                        <span>₹{(prod.price - (prod.price * prod.discount / 100)).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span>₹{prod.price}</span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-semibold text-orange-500">
                    {prod.discount && prod.discount > 0 ? `${prod.discount}%` : '-'}
                  </td>
                  <td className="p-4 text-sm font-semibold">
                    <span className={`px-2 py-1 rounded-lg text-xs ${prod.stock > 10 ? 'bg-green-100 text-green-700' : prod.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.stock || 0} in stock
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right space-x-2">
                    <button onClick={() => openEditModal(prod)} className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors" title="Edit">
                      <Edit size={16} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => handleDelete(prod.id)} className="inline-flex p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </td>
                    </tr>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">No products found.</td>
                    </tr>
                  )}
                </>
              );})()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls inside stat-card footer */}
        {(() => {
          const filteredCount = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toString().includes(searchQuery)).length;
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

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden my-auto transform transition-all scale-100">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-orange-600">
                  <PackageOpen size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">
                    {editingProduct ? 'Update your product details below.' : 'Fill in the details to add a new product to your catalog.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Product Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all font-medium"
                  placeholder="e.g. Premium Sparklers"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all font-medium cursor-pointer"
                    >
                      <option value="" disabled>Select category...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Price (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">₹</span>
                    </div>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-8 pr-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Discount (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all font-medium"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Stock Quantity</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="1"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all font-medium"
                      placeholder="e.g. 50"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">units</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Product Image</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      } else {
                        setImageFile(null);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed rounded-xl p-3.5 flex items-center justify-center gap-3 transition-all ${imageFile || formData.image ? 'border-orange-500 bg-orange-50/30 text-orange-600' : 'border-gray-200 bg-gray-50 text-gray-500 group-hover:border-orange-300 group-hover:bg-orange-50/10'}`}>
                    <UploadCloud size={20} className={imageFile || formData.image ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-400 transition-colors'} />
                    <span className="font-semibold text-sm truncate max-w-[200px]">
                      {imageFile ? imageFile.name : (formData.image ? formData.image.split('/').pop() : 'Choose an image file...')}
                    </span>
                  </div>
                </div>
                {(formData.image || imageFile) && (
                  <p className="text-xs font-semibold text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    Image attached
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="px-8 py-3 rounded-xl text-white font-bold shadow-[0_8px_20px_-6px_rgba(232,25,44,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(232,25,44,0.6)] hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00)' }}
                >
                  <span className={`flex items-center gap-2 ${isUploading ? 'opacity-0' : 'opacity-100'}`}>
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                  {isUploading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
