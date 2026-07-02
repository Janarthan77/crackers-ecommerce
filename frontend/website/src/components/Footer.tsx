"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaHome, FaInfoCircle, FaBoxOpen, FaBookOpen, FaAddressBook } from 'react-icons/fa';
import FireworksCanvas from '@/components/FireworksCanvas';

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
    <footer className="w-full relative overflow-hidden bg-[#101C40] border-t border-[#D4AF37]/20">

      <FireworksCanvas className="absolute inset-0 pointer-events-none z-0 opacity-40" style={{ mixBlendMode: 'screen' }} />

      {/* Animated Sparkles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle moving radial gradient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(212,175,55,0.05),_transparent_60%)] animate-pulse" style={{ animationDuration: '4s' }} />

        {/* Floating Sparkles */}
        {[...Array(24)].map((_, i) => (
          <span
            key={i}
            className="absolute text-[#D4AF37]/30 animate-sparkle-float"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              fontSize: `${10 + (i % 5) * 4}px`,
              animationDelay: `${(i % 3) * 0.5}s`,
              animationDuration: `${3 + (i % 4)}s`
            }}
          >✦</span>
        ))}
      </div>
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
          <p className="text-sm leading-relaxed max-w-xs text-gray-400">
            India&apos;s most trusted fireworks brand. Sourced directly from Sivakasi — bringing joy, safety and sparkle to every celebration.
          </p>
          <div className="flex gap-3 mt-5">
            {[
              { icon: <FaFacebook size={18} className="text-[#D4AF37]" />, bg: 'rgba(212,175,55,0.1)', label: 'Facebook' },
              { icon: <FaInstagram size={18} className="text-[#D4AF37]" />, bg: 'rgba(212,175,55,0.1)', label: 'Instagram' },
              { icon: <FaYoutube size={18} className="text-[#D4AF37]" />, bg: 'rgba(212,175,55,0.1)', label: 'YouTube' },
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
          <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-[#D4AF37]">Navigation</h4>
          <ul className="flex flex-col gap-3">
            {[
              { href: '/', label: 'Home', icon: FaHome },
              { href: '/about', label: 'About Us', icon: FaInfoCircle },
              { href: '/products', label: 'Products', icon: FaBoxOpen },
              { href: '/blogs', label: 'Blogs', icon: FaBookOpen },
              { href: '/contact', label: 'Contact', icon: FaAddressBook }
            ].map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm flex items-center gap-2.5 group w-fit text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <span className="text-[#D4AF37]/80 group-hover:text-[#D4AF37] transition-colors duration-300">
                      <Icon className="text-base transition-transform duration-300 group-hover:scale-110" />
                    </span>
                    <span className="group-hover:text-[#D4AF37] transition-colors duration-300">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-[#D4AF37]">Contact</h4>
          <ul className="flex flex-col gap-3">
            {[
              { icon: <FaMapMarkerAlt />, text: settings.address },
              { icon: <FaPhoneAlt />, text: settings.phone },
              { icon: <FaEnvelope />, text: settings.email },
              { icon: <FaClock />, text: 'Mon–Sun, Open 24 Hours' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-2.5">
                <span className="text-lg mt-0.5 flex-shrink-0 text-[#D4AF37]">{item.icon}</span>
                <span className="text-sm leading-snug text-gray-400">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 px-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} RRV Crackers. All rights reserved. &nbsp;|&nbsp; Made with ❤️ for a Dazzling Diwali
      </div>
    </footer>
  );
}
