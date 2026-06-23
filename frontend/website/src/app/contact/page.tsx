"use client";

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', rating: 5, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', rating: 5, message: '' });
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full" style={{ background: 'var(--bg-page)' }}>

      {/* Banner */}
      <div
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.15), transparent 60%)' }} />
        <span className="subheading-label mb-3 inline-block">We Value Your Opinion</span>
        <h1 className="font-display font-black mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-heading)' }}>
          Share Your <span className="heading-gradient">Feedback</span>
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Form */}
          <div className="lg:col-span-3 card p-8 md:p-10">
            <h2 className="font-bold text-xl mb-7 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <FaStar className="text-[#D4AF37] text-2xl" /> Tell Us How We Did
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center text-center py-10 gap-4">
                <div className="text-6xl animate-bounce-in">🎉</div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Thank You!</h3>
                <p style={{ color: 'var(--text-muted)' }}>We appreciate your valuable feedback.</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary text-sm mt-2">Submit Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{ border: '1.5px solid rgba(212,175,55,0.2)', background: 'var(--bg-section-alt)', color: 'var(--text-heading)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--brand-red)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Rate Your Experience</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className={`text-3xl transition-all duration-200 hover:scale-110 focus:outline-none ${form.rating >= star ? 'text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'text-gray-600'}`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Feedback Message</label>
                  <textarea
                    rows={5}
                    placeholder="What did you like? How can we improve?"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                    style={{ border: '1.5px solid rgba(212,175,55,0.2)', background: 'var(--bg-section-alt)', color: 'var(--text-heading)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--brand-red)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')}
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary text-sm justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Submitting...' : <><FaPaperPlane /> Submit Feedback</>}
                </button>
              </form>
            )}
          </div>

          {/* Info cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {[
              { icon: <FaMapMarkerAlt />, title: 'Address',       color: '#D4AF37', info: settings.address },
              { icon: <FaPhoneAlt />,     title: 'Phone',         color: '#D4AF37', info: settings.phone },
              { icon: <FaEnvelope />,     title: 'Email',         color: '#D4AF37', info: settings.email },
              { icon: <FaClock />,        title: 'Working Hours', color: '#D4AF37', info: 'Monday – Sunday\n24 Hours Open' },
            ].map((item) => (
              <div key={item.title} className="card p-5 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${item.color}10`, border: `1.5px solid ${item.color}25`, color: item.color }}
                >{item.icon}</div>
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

