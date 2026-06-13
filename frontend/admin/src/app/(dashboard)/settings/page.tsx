'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    email: '',
    phone: '',
    address: '',
    tax_rate: 0,
    delivery_fee: 0,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 403) {
           toast.error(err.error || 'Permission Denied', { duration: 5000 });
        } else {
           throw new Error('Failed to fetch settings');
        }
      } else {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setFormData({
            store_name: data.store_name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            tax_rate: data.tax_rate || 0,
            delivery_fee: data.delivery_fee || 0,
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 403) {
            toast.error(err.error || 'Permission Denied', { duration: 5000 });
        } else {
            throw new Error('Failed to save settings');
        }
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-up">
        <h1 className="page-title">Settings</h1>
        <div className="stat-card p-12 text-center animate-pulse">
           <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
           <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-up pb-10">
      <div className="flex justify-between items-center">
        <h1 className="page-title">General Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* General Information Section */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50/50 hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <span className="text-primary text-2xl">•</span> Store Identity
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage your store's primary details.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-600">Store Name</label>
              <input 
                type="text" 
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                placeholder="e.g. Rupika Crackers"
                className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-800 font-medium"
              />
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50/50 hover:shadow-md transition-shadow">
           <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <span className="text-blue-500 text-2xl">•</span> Contact Information
            </h2>
            <p className="text-sm text-gray-500 mt-1">How customers can reach you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-600">Support Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="support@example.com"
                className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-600">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 font-medium"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-600">Store Address</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, City, State, ZIP"
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 font-medium resize-none"
              ></textarea>
            </div>
          </div>
        </section>

        {/* E-commerce Settings Section */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50/50 hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <span className="text-green-500 text-2xl">•</span> E-Commerce Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">Configure your tax rates and delivery fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-600">Tax Rate (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-200 rounded-xl p-4 pr-10 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-gray-800 font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-600">Delivery Fee (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                <input 
                  type="number" 
                  name="delivery_fee"
                  value={formData.delivery_fee}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-200 rounded-xl p-4 pl-10 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex justify-end pt-4 sticky bottom-6 z-10">
          <button 
            type="submit" 
            disabled={saving}
            className={`px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 ${saving ? 'opacity-80 cursor-not-allowed scale-95' : 'hover:scale-105'}`}
            style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00)' }}
          >
            {saving ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Saving Changes...
               </>
            ) : (
               <>
                 Save All Settings
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
               </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
