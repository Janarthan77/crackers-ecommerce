'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit, Trash2, X, PackageOpen, UploadCloud, Plus, PackageCheck } from 'lucide-react';

interface ComboItem {
  productId: number;
  productName: string;
  qty: number;
  price: number;
}

interface ComboOffer {
  id: number;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  discount?: number;
}

export default function ComboOffersPage() {
  const [offers, setOffers] = useState<ComboOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ComboOffer | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', original_price: '', discounted_price: '', image_url: '', is_active: true });
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    try {
      const [offersRes, prodsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/combo-offers`),
        fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/products?admin=true`)
      ]);
      
      if (!offersRes.ok) throw new Error('Failed to fetch combo offers');
      const offersData = await offersRes.json();
      setOffers(offersData);

      if (prodsRes.ok) {
        const prodsData = await prodsRes.json();
        setProducts(prodsData);
      }
    } catch (err) {
      toast.error('Failed to load combo offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseDescription = (descString: string) => {
    if (!descString) return { text: '', items: [] };
    try {
      const json = JSON.parse(descString);
      if (json && typeof json === 'object') {
        return {
          text: json.text || '',
          items: Array.isArray(json.items) ? json.items : []
        };
      }
    } catch (e) {}
    return { text: descString, items: [] };
  };

  const handleAddProductToCombo = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    if (comboItems.some(i => i.productId === prod.id)) {
      return toast.error('Product already added to combo');
    }

    const sellingPrice = prod.price - (prod.price * (prod.discount || 0) / 100);
    setComboItems([
      ...comboItems,
      {
        productId: prod.id,
        productName: prod.name,
        qty: 1,
        price: sellingPrice
      }
    ]);
    setSelectedProductId('');
  };

  const handleItemQtyChange = (productId: number, qtyStr: string) => {
    const qty = Math.max(1, parseInt(qtyStr) || 1);
    setComboItems(prev => prev.map(item => item.productId === productId ? { ...item, qty } : item));
  };

  const handleRemoveComboItem = (productId: number) => {
    setComboItems(prev => prev.filter(item => item.productId !== productId));
  };

  const calculatedItemsTotal = comboItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.original_price || !formData.discounted_price) {
      return toast.error('Please fill all required fields');
    }

    try {
      setIsUploading(true);
      let finalImageUrl = formData.image_url;

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

      const finalDescription = JSON.stringify({
        text: formData.description,
        items: comboItems
      });

      const payload = {
        ...(editingOffer ? { id: editingOffer.id } : {}),
        title: formData.title,
        description: finalDescription,
        original_price: parseFloat(formData.original_price),
        discounted_price: parseFloat(formData.discounted_price),
        image_url: finalImageUrl || '',
        is_active: formData.is_active
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/combo-offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      toast.success(editingOffer ? 'Combo offer updated' : 'Combo offer added');
      setIsModalOpen(false);
      setEditingOffer(null);
      setFormData({ title: '', description: '', original_price: '', discounted_price: '', image_url: '', is_active: true });
      setComboItems([]);
      setImageFile(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save combo offer');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this combo offer?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/combo-offers?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Combo offer deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete combo offer');
    }
  };

  const openEditModal = (offer: ComboOffer) => {
    setEditingOffer(offer);
    const parsedDesc = parseDescription(offer.description);
    setFormData({ 
      title: offer.title, 
      description: parsedDesc.text, 
      original_price: offer.original_price.toString(), 
      discounted_price: offer.discounted_price.toString(),
      image_url: offer.image_url || '',
      is_active: offer.is_active
    });
    setComboItems(parsedDesc.items);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingOffer(null);
    setFormData({ title: '', description: '', original_price: '', discounted_price: '', image_url: '', is_active: true });
    setComboItems([]);
    setImageFile(null);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-6 text-center animate-pulse">Loading combo offers...</div>;

  return (
    <>
      <div className="flex flex-col gap-6 animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="page-title text-xl md:text-2xl">Combo Offers Management</h1>
            <p className="text-xs text-gray-500 mt-1">Configure packages (e.g. ₹3000, ₹7000, ₹10000) and specify included products for auto-filling customer order sheets.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            + Add Combo Offer
          </button>
        </div>

        <div className="stat-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-sm text-gray-500">Image</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Title</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Original Price</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Offer Price</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Included Products</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const parsed = parseDescription(offer.description);
                  return (
                    <tr key={offer.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className="p-4">
                        <div className="w-16 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden p-1">
                          <img 
                            src={offer.image_url || '/brand_logo.png'} 
                            alt={offer.title} 
                            className={`w-full h-full ${offer.image_url ? 'object-cover' : 'object-contain'}`} 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/brand_logo.png';
                              e.currentTarget.className = 'w-full h-full object-contain';
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-800">{offer.title}</td>
                      <td className="p-4 text-sm font-semibold line-through text-gray-400">₹{offer.original_price}</td>
                      <td className="p-4 text-sm font-semibold text-green-600">₹{offer.discounted_price}</td>
                      <td className="p-4 text-sm">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                          <PackageCheck size={14} />
                          {parsed.items.length} Products
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${offer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {offer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right space-x-2">
                        <button onClick={() => openEditModal(offer)} className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => handleDelete(offer.id)} className="inline-flex p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {offers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No combo offers found. Create one!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="relative bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-orange-600">
                  <PackageOpen size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                    {editingOffer ? 'Edit Combo Offer' : 'Add New Combo Offer'}
                  </h2>
                  <p className="text-xs text-gray-500">Configure offer title, price, and select included products.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Offer Title <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Budget Family Pack - ₹3,000" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Description / Highlights</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[80px] text-sm" placeholder="Offer details & highlights..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Original Price / M.R.P (₹) <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" step="0.01" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm" placeholder="e.g. 5000" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Offer / Discounted Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" step="0.01" value={formData.discounted_price} onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm text-green-700" placeholder="e.g. 3000" />
                </div>
              </div>

              {/* Product Mapping Section */}
              <div className="border border-orange-200/80 bg-orange-50/30 rounded-2xl p-4 md:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200/60 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                      <PackageCheck size={18} className="text-orange-600" />
                      Included Products in this Combo ({comboItems.length})
                    </h3>
                    <p className="text-xs text-gray-500">Pick products to auto-fill into customer order forms when they choose this combo.</p>
                  </div>
                  {comboItems.length > 0 && (
                    <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg">
                      Est. Value: ₹{calculatedItemsTotal.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Add product bar */}
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedProductId} 
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-orange-500"
                  >
                    <option value="">Select product to add...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price - (p.price * (p.discount || 0) / 100)})
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={handleAddProductToCombo}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                {/* Items List */}
                {comboItems.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="p-2.5 font-bold text-gray-500">Product Name</th>
                          <th className="p-2.5 font-bold text-gray-500 w-20">Price</th>
                          <th className="p-2.5 font-bold text-gray-500 w-24">Qty</th>
                          <th className="p-2.5 font-bold text-gray-500 w-24">Total</th>
                          <th className="p-2.5 font-bold text-gray-500 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {comboItems.map((item) => (
                          <tr key={item.productId} className="hover:bg-gray-50/80">
                            <td className="p-2.5 font-semibold text-gray-800">{item.productName}</td>
                            <td className="p-2.5 font-medium text-gray-600">₹{item.price}</td>
                            <td className="p-2.5">
                              <input 
                                type="number" 
                                min="1" 
                                value={item.qty} 
                                onChange={(e) => handleItemQtyChange(item.productId, e.target.value)}
                                className="w-16 border border-gray-300 rounded px-2 py-1 text-center font-bold text-gray-800"
                              />
                            </td>
                            <td className="p-2.5 font-bold text-orange-600">₹{(item.price * item.qty).toFixed(2)}</td>
                            <td className="p-2.5 text-center">
                              <button 
                                type="button" 
                                onClick={() => handleRemoveComboItem(item.productId)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-gray-400 bg-white/60 rounded-xl border border-dashed border-gray-200">
                    No products added yet. Pick products above to include them in this combo offer.
                  </div>
                )}
              </div>

              <div className="space-y-1.5 flex items-center gap-3">
                <label className="block text-sm font-bold text-gray-700">Is Active</label>
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Offer Banner Image</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`w-full border-2 border-dashed rounded-xl p-3.5 flex items-center justify-center gap-3 transition-all ${imageFile || formData.image_url ? 'border-orange-500 bg-orange-50/30 text-orange-600' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                    <UploadCloud size={20} className={imageFile || formData.image_url ? 'text-orange-500' : 'text-gray-400'} />
                    <span className="font-semibold text-sm truncate max-w-[200px]">
                      {imageFile ? imageFile.name : (formData.image_url ? 'Image attached' : 'Choose an image file...')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 flex-shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-gray-600 bg-gray-100 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-8 py-3 rounded-xl text-white font-bold bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg">
                  {isUploading ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
