"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFacebook, FaInstagram, FaYoutube, FaClock, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState<{ phone: string; email: string }>({ phone: 'Loading...', email: 'Loading...' });
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({ phone: data.phone || '9994090969, 99430', email: data.email || 'rrvcrackers@gmail.com' });
        }
      })
      .catch(console.error);

    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/products', label: 'Products' },
    { href: '/blogs', label: 'Blogs' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Top announcement bar */}
      <div
        className="w-full text-white text-xs font-semibold text-center py-1 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #E8192C, #FF6B00, #FFB300, #FF6B00, #E8192C)',
          backgroundSize: '300% auto',
          animation: 'shimmer 4s linear infinite',
        }}
      >
        ★ BIGGEST DIWALI SALE — Upto 40% OFF on All Crackers! ★
      </div>

      {/* Info bar */}
      <div className="hidden md:flex w-full bg-white border-b border-orange-100 px-8 py-1 justify-between items-center text-xs text-gray-600">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><FaClock className="text-orange-500" /> Mon–Sun, 24 Hours Open</span>
          <span className="flex items-center gap-1.5"><FaPhoneAlt className="text-orange-500" /> {settings.phone}</span>
          <span className="flex items-center gap-1.5"><FaEnvelope className="text-orange-500" /> {settings.email}</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'fb', icon: <FaFacebook size={12} /> },
            { id: 'ig', icon: <FaInstagram size={12} /> },
            { id: 'yt', icon: <FaYoutube size={12} /> }
          ].map((s) => (
            <button key={s.id} className="w-6 h-6 rounded-full bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors text-orange-600">
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-400 ${scrolled ? 'shadow-lg' : 'shadow-sm'
          }`}
        style={{
          background: scrolled
            ? 'rgba(255,255,255,0.97)'
            : 'rgba(255,255,255,1)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,107,0,0.12)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="https://pub-c9de055708fa4822887d1db91f66e351.r2.dev/brand_logo.png"
              alt="RRV Crackers Logo"
              className="w-auto h-16 object-contain transition-transform group-hover:scale-110 select-none"
            />
            {/* <div className="flex flex-col leading-tight">
              <span
                className="text-lg font-black tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #E8192C, #FF6B00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                RRV Crackers
              </span>
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-orange-400">Premium Fireworks</span>
            </div> */}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${active
                    ? 'text-orange-600'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                >
                  {active && (
                    <span
                      className="absolute inset-x-2 bottom-1 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #E8192C, #FF6B00)' }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/contact" className="btn-primary text-sm py-2.5 px-6">
              Get A Quote
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-orange-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span className={`h-0.5 rounded-full bg-gray-700 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 rounded-full bg-gray-700 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 rounded-full bg-gray-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 border-t border-orange-100 ${menuOpen ? 'max-h-80' : 'max-h-0'}`}
          style={{ background: '#fff' }}
        >
          <nav className="flex flex-col p-4 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact" className="btn-primary text-center text-sm mt-3" onClick={() => setMenuOpen(false)}>
              Get A Quote
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
