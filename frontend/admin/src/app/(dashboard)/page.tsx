import RevenueChart from '@/components/RevenueChart';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let statsData: any = {
    totalOrders: 124,
    revenue: 452300,
    totalProducts: 45,
    totalCategories: 12,
    monthlyStats: [
      { name: 'Jan', revenue: 4000, orders: 24 },
      { name: 'Feb', revenue: 3000, orders: 13 },
      { name: 'Mar', revenue: 2000, orders: 98 },
      { name: 'Apr', revenue: 2780, orders: 39 },
      { name: 'May', revenue: 1890, orders: 48 },
      { name: 'Jun', revenue: 2390, orders: 38 },
    ]
  };

  let recentOrders = [
    { id: 1, name: 'Ganesan',  mobile: '9944696046', city: 'Kuduvancheri', overallTotal: 8806,  status: 'completed' },
    { id: 2, name: 'Prabhu',   mobile: '9952727788', city: 'Ramnadu',      overallTotal: 5064,  status: 'completed' },
    { id: 3, name: 'Sathish',  mobile: '9655443328', city: 'Ramnadu',      overallTotal: 6605,  status: 'completed' },
    { id: 4, name: 'Karthik',  mobile: '9942311555', city: 'Tamilnadu',    overallTotal: 9364,  status: 'pending'   },
  ];

  try {
    const statsRes = await fetch('http://localhost:5000/api/stats', { cache: 'no-store' });
    if (statsRes.ok) {
      const data = await statsRes.json();
      if (!data.error) statsData = data;
    }
    
    const ordersRes = await fetch('http://localhost:5000/api/orders', { cache: 'no-store' });
    if (ordersRes.ok) {
      const data = await ordersRes.json();
      if (!data.error && Array.isArray(data)) recentOrders = data.slice(0, 4);
    }
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
  }

  const stats = [
    { label: 'Total Orders',    value: statsData.totalOrders?.toString() || '0',        icon: '🛒', color: '#E8192C', bg: '#FFE4E6', trend: 'Live' },
    { label: 'Total Revenue',   value: `₹${(statsData.revenue || 0).toLocaleString()}`, icon: '💰', color: '#16A34A', bg: '#DCFCE7', trend: 'Live' },
    { label: 'Active Products', value: statsData.totalProducts?.toString() || '0',      icon: '📦', color: '#7C3AED', bg: '#F5F3FF', trend: 'Live' },
    { label: 'Categories',      value: statsData.totalCategories?.toString() || '0',    icon: '📁', color: '#1D4ED8', bg: '#DBEAFE', trend: 'Live' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">

      {/* Greeting banner */}
      <div
        className="rounded-3xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #E8192C 0%, #FF6B00 60%, #FFB300 100%)', boxShadow: '0 8px 32px rgba(232,25,44,0.3)' }}
      >
        <div className="absolute right-6 top-2 text-5xl opacity-20 select-none">🎇</div>
        <div>
          <h1 className="font-black text-2xl text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome back, Admin! 👋</h1>
          <p className="text-white/80 text-sm mt-1">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <div className="hidden md:flex flex-col items-end text-white/80 text-xs gap-1">
          <span suppressHydrationWarning>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="font-bold text-white text-sm">🚀 Diwali Season Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card p-6" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: s.bg }}
              >{s.icon}</div>
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: s.bg, color: s.color }}
              >{s.trend}</span>
            </div>

            <div className="font-black text-2xl" style={{ color: s.color, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
            <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-m)' }}>{s.label}</div>
            {/* Progress bar decoration */}
            <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: s.bg }}>
              <div className="h-full rounded-full" style={{ background: s.color, width: '65%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div 
        className="rounded-3xl p-6 bg-white overflow-hidden relative"
        style={{ border: '1px solid rgba(255,107,0,0.08)', boxShadow: '0 2px 12px rgba(232,25,44,0.06)' }}
      >
        <div className="mb-6">
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-h)' }}>Revenue Overview</h2>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-m)' }}>Monthly order details and total revenue</p>
        </div>
        <div className="h-[300px] w-full">
           <RevenueChart data={statsData.monthlyStats || []} />
        </div>
      </div>

      {/* Recent Orders table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid rgba(255,107,0,0.08)', boxShadow: '0 2px 12px rgba(232,25,44,0.06)' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,107,0,0.08)' }}
        >
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-h)' }}>Recent Orders</h2>
            <p className="text-xs" style={{ color: 'var(--text-m)' }}>Last 4 transactions</p>
          </div>
          <a href="/orders" className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80" style={{ background: '#FFE4E6', color: '#E8192C' }}>View All →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => (
                <tr key={o.id}>
                  <td className="font-medium" style={{ color: 'var(--text-m)' }}>{i + 1}</td>
                  <td className="font-semibold" style={{ color: 'var(--text-h)' }}>{o.name}</td>
                  <td>{o.mobile}</td>
                  <td>{o.city}</td>
                  <td className="font-bold" style={{ color: '#E8192C' }}>₹{((o as any).overallTotal || (o as any).total || 0).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${o.status}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
