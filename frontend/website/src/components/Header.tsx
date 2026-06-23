"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFacebook, FaInstagram, FaYoutube, FaClock, FaPhoneAlt, FaEnvelope, FaHome, FaInfoCircle, FaBoxOpen, FaBookOpen, FaAddressBook } from 'react-icons/fa';

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
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/about', label: 'About', icon: FaInfoCircle },
    { href: '/products', label: 'Products', icon: FaBoxOpen },
    { href: '/blogs', label: 'Blogs', icon: FaBookOpen },
    { href: '/contact', label: 'Contact', icon: FaAddressBook },
  ];

  return (
    <>
      {/* Top announcement bar */}
      <div
        className="w-full text-[#0A1128] text-xs font-bold text-center py-1 px-4 overflow-hidden flex items-center"
        style={{
          background: 'linear-gradient(90deg, #D4AF37, #AA8222, #F9DF9F, #AA8222, #D4AF37)',
          backgroundSize: '300% auto',
          animation: 'shimmer 4s linear infinite',
        }}
      >
        <marquee behavior="scroll" direction="left" scrollamount="8" className="w-full">
          ★ RRV Crackers: BIGGEST DIWALI SALE — Upto 40% OFF on All Crackers! ★
        </marquee>
      </div>

      {/* Info bar */}
      <div className="hidden md:flex w-full px-8 py-1 justify-between items-center text-xs text-gray-300" style={{ background: '#0A1128', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><FaClock className="text-[#D4AF37]" /> Mon–Sun, 24 Hours Open</span>
          <span className="flex items-center gap-1.5"><FaPhoneAlt className="text-[#D4AF37]" /> {settings.phone}</span>
          <span className="flex items-center gap-1.5"><FaEnvelope className="text-[#D4AF37]" /> {settings.email}</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'fb', icon: <FaFacebook size={12} /> },
            { id: 'ig', icon: <FaInstagram size={12} /> },
            { id: 'yt', icon: <FaYoutube size={12} /> }
          ].map((s) => (
            <button key={s.id} className="w-6 h-6 rounded-full flex items-center justify-center transition-colors text-[#D4AF37] hover:text-white" style={{ background: 'rgba(212,175,55,0.1)' }}>
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
            ? 'rgba(10,17,40,0.97)'
            : 'rgba(10,17,40,1)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(212,175,55,0.12)',
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
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-1 flex items-center gap-2 ${active
                    ? 'text-[#D4AF37]'
                    : 'text-[#E5E5E5] hover:text-[#D4AF37]'
                    }`}
                >
                  <link.icon className="text-base" />
                  {link.label}
                  {active && (
                    <span
                      className="absolute inset-x-2 bottom-1 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #D4AF37, #AA8222)' }}
                    />
                  )}
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
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ background: 'rgba(212,175,55,0.1)' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span className={`h-0.5 rounded-full bg-[#E5E5E5] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 rounded-full bg-[#E5E5E5] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 rounded-full bg-[#E5E5E5] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-80' : 'max-h-0'}`}
          style={{ background: '#101C40', borderTop: '1px solid rgba(212,175,55,0.2)' }}
        >
          <nav className="flex flex-col p-4 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-[#E5E5E5] hover:bg-[#1A2859] hover:text-[#D4AF37] transition-colors flex items-center gap-3"
                onClick={() => setMenuOpen(false)}
              >
                <link.icon className="text-lg text-[#D4AF37]" />
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
