'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LogOut } from 'lucide-react';
import { getAdminUser, clearAdminUser, AdminUser } from '@/lib/auth';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser>({ id: 1, username: 'rrvcrackers' });

  useEffect(() => {
    setUser(getAdminUser());
  }, []);

  const handleLogout = () => {
    clearAdminUser();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50/30">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0 z-40"
          style={{
            background: 'rgba(255,255,255,0.97)',
            borderBottom: '1px solid rgba(255,107,0,0.1)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 12px rgba(232,25,44,0.04)',
          }}
        >
          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-orange-50 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <div className="flex flex-col gap-1.5 w-5">
                <span className="h-0.5 rounded-full bg-gray-700" />
                <span className="h-0.5 rounded-full bg-gray-700" />
                <span className="h-0.5 rounded-full bg-gray-700" />
              </div>
            </button>
            <div className="hidden md:flex w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #E8192C, #FF6B00)' }} />
            <span className="font-bold text-sm md:text-base" style={{ color: 'var(--text-h)' }}>Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-105 uppercase"
                style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00)' }}
              >
                {user.username.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-sm font-bold" style={{ color: 'var(--text-h)' }}>{user.username}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-m)' }}>Administrator (ID: {user.id})</span>
              </div>
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ background: '#FFE4E6', color: '#E8192C', border: '1px solid rgba(232,25,44,0.2)' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
