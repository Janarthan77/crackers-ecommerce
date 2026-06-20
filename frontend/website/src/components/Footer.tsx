"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const [settings, setSettings] = useState({
    phone: '9994090969, 99430',
    email: 'rrvcrackers@gmail.com',
    address: 'Sivakasi, Tamil Nadu — 626123'
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            phone: data.phone || '9994090969, 99430',
            email: data.email || 'rrvcrackers@gmail.com',
            address: data.address || 'Sivakasi, Tamil Nadu — 626123'
          });
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="w-full" style={{ background: 'linear-gradient(180deg, #fff8f0 0%, #FFF1E6 100%)', borderTop: '1px solid rgba(255,107,0,0.12)' }}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-3 mb-4 cursor-pointer w-fit">
            <img
              src="https://pub-c9de055708fa4822887d1db91f66e351.r2.dev/brand_logo.png"
              alt="RRV Crackers Logo"
              className="w-auto h-14 object-contain select-none"
            />
          </Link>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-muted)' }}>
            India&apos;s most trusted fireworks brand. Sourced directly from Sivakasi — bringing joy, safety and sparkle to every celebration.
          </p>
          <div className="flex gap-3 mt-5">
            {[
              { icon: <FaFacebook size={18} className="text-[#1877F2]" />, bg: '#E8F0FE', label: 'Facebook' },
              { icon: <FaInstagram size={18} className="text-[#E4405F]" />, bg: '#FCE4EC', label: 'Instagram' },
              { icon: <FaYoutube size={18} className="text-[#FF0000]" />, bg: '#FFEBEE', label: 'YouTube' },
            ].map((s) => (
              <button
                key={s.label}
                title={s.label}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: s.bg }}
              >{s.icon}</button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-sm tracking-widest uppercase mb-4" style={{ color: 'var(--brand-orange)' }}>Navigation</h4>
          <ul className="flex flex-col gap-2.5">
            {[['/', 'Home'], ['/about', 'About Us'], ['/products', 'Products'], ['/blogs', 'Blogs'], ['/contact', 'Contact']].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm flex items-center gap-2 group w-fit"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span
                    className="w-3 h-px group-hover:w-5 transition-all duration-300 rounded-full"
                    style={{ background: 'var(--brand-orange)' }}
                  />
                  <span className="group-hover:text-orange-600 transition-colors">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-sm tracking-widest uppercase mb-4" style={{ color: 'var(--brand-orange)' }}>Contact</h4>
          <ul className="flex flex-col gap-3">
            {[
              { icon: '📍', text: settings.address },
              { icon: '📞', text: settings.phone },
              { icon: '✉️', text: settings.email },
              { icon: '🕒', text: 'Mon–Sun, Open 24 Hours' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-2.5">
                <span className="text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
                <span className="text-sm leading-snug" style={{ color: 'var(--text-muted)' }}>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t py-5 px-4 text-center text-xs"
        style={{ borderColor: 'rgba(255,107,0,0.1)', color: 'var(--text-muted)' }}
      >
        &copy; {new Date().getFullYear()} RRV Crackers. All rights reserved. &nbsp;|&nbsp; Made with ❤️ for a Dazzling Diwali
      </div>
    </footer>
  );
}
