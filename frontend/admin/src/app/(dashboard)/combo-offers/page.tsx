'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit, Trash2, X, PackageOpen, UploadCloud } from 'lucide-react';

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

export default function ComboOffersPage() {
  const [offers, setOffers] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ComboOffer | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', original_price: '', discounted_price: '', image_url: '', is_active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/combo-offers`);
      if (!res.ok) throw new Error('Failed to fetch combo offers');
      const data = await res.json();
      setOffers(data);
    } catch (err) {
      toast.error('Failed to load combo offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

      const payload = {
        ...(editingOffer ? { id: editingOffer.id } : {}),
        title: formData.title,
        description: formData.description,
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
    setFormData({ 
      title: offer.title, 
      description: offer.description || '', 
      original_price: offer.original_price.toString(), 
      discounted_price: offer.discounted_price.toString(),
      image_url: offer.image_url || '',
      is_active: offer.is_active
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingOffer(null);
    setFormData({ title: '', description: '', original_price: '', discounted_price: '', image_url: '', is_active: true });
    setImageFile(null);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-6 text-center animate-pulse">Loading combo offers...</div>;

  return (
    <>
      <div className="flex flex-col gap-6 animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h1 className="page-title text-xl md:text-2xl">Combo Offers Management</h1>
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
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-sm text-gray-500">Image</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Title</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Original Price</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Discounted Price</th>
                  <th className="p-4 font-semibold text-sm text-gray-500">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {offer.image_url ? (
                          <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800">{offer.title}</td>
                    <td className="p-4 text-sm font-semibold line-through text-gray-400">₹{offer.original_price}</td>
                    <td className="p-4 text-sm font-semibold text-green-600">₹{offer.discounted_price}</td>
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
                ))}
                {offers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No combo offers found. Create one!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden my-auto">
            <div className="relative bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-orange-600">
                  <PackageOpen size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                    {editingOffer ? 'Edit Combo Offer' : 'Add New Combo Offer'}
                  </h2>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Offer Title <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" placeholder="e.g. Diwali Mega Pack" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[100px]" placeholder="Offer details..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Original Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" step="0.01" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Discounted Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" step="0.01" value={formData.discounted_price} onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" />
                </div>
              </div>

              <div className="space-y-1.5 flex items-center gap-3">
                <label className="block text-sm font-bold text-gray-700">Is Active</label>
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 text-orange-500" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Offer Banner Image</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`w-full border-2 border-dashed rounded-xl p-3.5 flex items-center justify-center gap-3 transition-all ${imageFile || formData.image_url ? 'border-orange-500 bg-orange-50/30 text-orange-600' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                    <UploadCloud size={20} className={imageFile || formData.image_url ? 'text-orange-500' : 'text-gray-400'} />
                    <span className="font-semibold text-sm truncate max-w-[200px]">
                      {imageFile ? imageFile.name : (formData.image_url ? 'Image selected' : 'Choose an image file...')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-gray-600 bg-gray-100 font-bold">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-8 py-3 rounded-xl text-white font-bold bg-orange-500">
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
