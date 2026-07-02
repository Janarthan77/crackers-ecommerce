"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard',          path: '/',               icon: '📊', color: '#E8192C' },
  { name: 'Analytics',          path: '/analytics',      icon: '📈', color: '#DB2777' },
  { name: 'Combo Offers',        path: '/combo-offers',   icon: '🎁', color: '#F59E0B' },
  { name: 'Category Management', path: '/categories',    icon: '📂', color: '#FF6B00' },
  { name: 'Product Management',  path: '/products',      icon: '📦', color: '#7C3AED' },
  { name: 'Orders Management',   path: '/orders',        icon: '🛒', color: '#16A34A' },
  { name: 'Blogs Management',    path: '/blogs',         icon: '📝', color: '#0EA5E9' },
  { name: 'Customer Responses',  path: '/feedback',      icon: '💬', color: '#14B8A6' },
  { name: 'Settings',            path: '/settings',      icon: '⚙️',  color: '#1D4ED8' },
  { name: 'Change Password',     path: '/change-password', icon: '🔑', color: '#B45309' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={onClose}
        />
      )}
      
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col min-h-screen bg-white transition-transform duration-300 transform md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          borderRight: '1px solid rgba(255,107,0,0.1)',
          boxShadow: '4px 0 24px rgba(232,25,44,0.04)',
        }}
      >
      {/* Brand */}
      <div
        className="p-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,107,0,0.1)' }}
      >
        <img
          src="https://pub-c9de055708fa4822887d1db91f66e351.r2.dev/brand_logo.png"
          alt="Rupika Crackers Logo"
          className="w-10 h-10 object-contain flex-shrink-0 select-none"
        />
        <div className="flex flex-col leading-tight">
          <span
            className="font-black text-sm"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: 'linear-gradient(135deg, #E8192C, #FF6B00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >Rupika Crackers</span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-orange-400">Admin Panel</span>
        </div>
      </div>

      {/* Admin info */}
      <div
        className="mx-4 my-4 p-3 rounded-2xl flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #FFF3E0, #FFE8D0)', border: '1px solid rgba(255,107,0,0.15)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00)' }}
        >A</div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm" style={{ color: '#1A0A00' }}>Admin</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px]" style={{ color: '#9B7E6A' }}>Online</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 mb-2" style={{ color: '#C4A882' }}>Main Menu</p>
        <ul className="flex flex-col gap-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                  style={isActive
                    ? {
                        background: 'linear-gradient(135deg, #E8192C, #FF6B00)',
                        boxShadow: '0 4px 16px rgba(232,25,44,0.25)',
                      }
                    : {}
                  }
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,0,0.07)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  onClick={onClose}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={isActive
                      ? { background: 'rgba(255,255,255,0.2)' }
                      : { background: `${item.color}12` }
                    }
                  >{item.icon}</div>
                  <span
                    className="text-sm font-semibold"
                    style={isActive ? { color: '#fff' } : { color: '#4A3728' }}
                  >{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer help card */}
      <div
        className="m-4 p-4 rounded-2xl text-center"
        style={{ background: 'linear-gradient(135deg, #FFF3E0, #FFE8D0)', border: '1px solid rgba(255,107,0,0.15)' }}
      >
        <div className="text-2xl mb-1">📧</div>
        <p className="text-xs font-semibold" style={{ color: '#4A3728' }}>Need Help?</p>
        <p className="text-[10px] mt-0.5" style={{ color: '#9B7E6A' }}>rupikacrackers@gmail.com</p>
      </div>
    </aside>
    </>
  );
}
