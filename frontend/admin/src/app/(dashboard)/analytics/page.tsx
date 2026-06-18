'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-6 text-center animate-pulse">Loading analytics...</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <h1 className="page-title">Analytics Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="stat-card p-6 flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-m)' }}>Total Revenue</span>
          <span className="text-3xl font-bold" style={{ color: 'var(--text-h)' }}>
            ₹{stats?.revenue?.toLocaleString() || 0}
          </span>
        </div>

        <div className="stat-card p-6 flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-m)' }}>Total Orders</span>
          <span className="text-3xl font-bold" style={{ color: 'var(--text-h)' }}>
            {stats?.totalOrders || 0}
          </span>
        </div>

        <div className="stat-card p-6 flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-m)' }}>Total Products</span>
          <span className="text-3xl font-bold" style={{ color: 'var(--text-h)' }}>
            {stats?.totalProducts || 0}
          </span>
        </div>

        <div className="stat-card p-6 flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-m)' }}>Total Categories</span>
          <span className="text-3xl font-bold" style={{ color: 'var(--text-h)' }}>
            {stats?.totalCategories || 0}
          </span>
        </div>

      </div>
    </div>
  );
}
