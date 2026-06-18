"use client";

import { useState, useEffect } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState({ phone: 'Loading...', email: 'Loading...', address: 'Loading...' });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || ''
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex-1 w-full" style={{ background: 'var(--bg-page)' }}>

      {/* Banner */}
      <div
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D0 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(232,25,44,0.1), transparent 60%)' }} />
        <span className="subheading-label mb-3 inline-block">We&apos;re Here to Help</span>
        <h1 className="font-display font-black mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-heading)' }}>
          Contact <span className="heading-gradient">Us</span>
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Form */}
          <div className="lg:col-span-3 card p-8 md:p-10">
            <h2 className="font-bold text-xl mb-7 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <span className="text-2xl">✉️</span> Send Us a Message
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center text-center py-10 gap-4">
                <div className="text-6xl animate-bounce-in">🎇</div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-muted)' }}>We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary text-sm mt-2">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { key: 'name',  label: 'Full Name',    type: 'text',  placeholder: 'Your full name' },
                    { key: 'phone', label: 'Phone Number', type: 'tel',   placeholder: '+91 99999 99999' },
                  ].map((f) => (
                    <div key={f.key} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                        style={{ border: '1.5px solid rgba(255,107,0,0.2)', background: '#FFF8F0', color: 'var(--text-heading)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--brand-orange)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,107,0,0.2)')}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ border: '1.5px solid rgba(255,107,0,0.2)', background: '#FFF8F0', color: 'var(--text-heading)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--brand-orange)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,107,0,0.2)')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Message</label>
                  <textarea
                    rows={5}
                    placeholder="Your requirements or questions..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                    style={{ border: '1.5px solid rgba(255,107,0,0.2)', background: '#FFF8F0', color: 'var(--text-heading)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--brand-orange)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,107,0,0.2)')}
                  />
                </div>
                <button type="submit" className="btn-primary text-sm justify-center mt-1">
                  🚀 Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {[
              { emoji: '📍', title: 'Address',       color: '#FF6B00', info: settings.address },
              { emoji: '📞', title: 'Phone',         color: '#E8192C', info: settings.phone },
              { emoji: '✉️', title: 'Email',         color: '#7C3AED', info: settings.email },
              { emoji: '🕒', title: 'Working Hours', color: '#16A34A', info: 'Monday – Sunday\n24 Hours Open' },
            ].map((item) => (
              <div key={item.title} className="card p-5 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${item.color}10`, border: `1.5px solid ${item.color}25` }}
                >{item.emoji}</div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1" style={{ color: item.color }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{item.info}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
