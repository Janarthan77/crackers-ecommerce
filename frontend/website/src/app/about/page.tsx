import FireworksCanvas from '@/components/FireworksCanvas';

export default function About() {
  return (
    <div className="flex-1 w-full" style={{ background: 'var(--bg-page)' }}>

      {/* Page hero */}
      <div
        className="relative py-28 px-4 text-center overflow-hidden flex flex-col items-center justify-center rounded-b-[3rem] shadow-2xl mb-8"
        style={{ 
          backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1498864758509-f64bd08df48b?q=80&w=2000&auto=format&fit=crop")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <FireworksCanvas className="absolute inset-0 pointer-events-none z-0" />
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.4), transparent 70%)' }}
        />
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="absolute text-orange-400 animate-sparkle-float"
            style={{
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 80 + 10}%`,
              fontSize: `${12 + (i % 3) * 8}px`,
              animationDelay: `${i * 0.3}s`,
              filter: 'drop-shadow(0 0 10px rgba(255,165,0,0.8))'
            }}
          >✦</span>
        ))}

        <div className="relative z-10 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6 bg-orange-500/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block" />
            Our Journey
          </span>
          <h1
            className="font-display font-black mb-4 drop-shadow-lg"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#ffffff' }}
          >
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">RRV Crackers</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-gray-200 drop-shadow-md">
            Two decades of bringing joy, light and sparkle to millions of families across India.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 flex flex-col gap-14">

        {/* Story */}
        <div className="card p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-shrink-0 text-center">
            <div className="text-8xl" style={{ filter: 'drop-shadow(0 8px 24px rgba(255,107,0,0.35))' }}>🪔</div>
            <div className="mt-3 text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--brand-orange)' }}>Est. 2005</div>
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl mb-4" style={{ color: 'var(--text-heading)' }}>Our Story</h2>
            <p className="leading-loose mb-4" style={{ color: 'var(--text-body)' }}>
              Welcome to <strong style={{ color: 'var(--brand-orange)' }}>RRV Crackers</strong> — one of Tamil Nadu&apos;s most trusted wholesale and retail fireworks dealers. For over two decades, we&apos;ve been lighting up celebrations with premium, safe, and spectacular fireworks for families across India.
            </p>
            <p className="leading-loose" style={{ color: 'var(--text-muted)' }}>
              Based in <strong style={{ color: 'var(--brand-red)' }}>Sivakasi</strong> — India&apos;s fireworks capital — we source directly from certified manufacturers, cutting out middlemen to give you factory-fresh quality at wholesale prices.
            </p>
          </div>
        </div>

        {/* Value cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '💯', color: '#FF6B00', title: 'Quality Assured', desc: 'Every product is ISI-certified and rigorously tested for safety and brilliance.' },
            { emoji: '🚚', color: '#1D4ED8', title: 'Fast Delivery', desc: 'Secure packaging with 2–4 day delivery anywhere in India.' },
            { emoji: '💰', color: '#16A34A', title: 'Best Prices', desc: 'Wholesale pricing for everyone — bulk orders get up to 40% discount.' },
          ].map((v) => (
            <div key={v.title} className="card p-8 flex flex-col items-center text-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: `${v.color}12`, border: `2px solid ${v.color}25` }}
              >{v.emoji}</div>
              <h3 className="font-bold text-lg" style={{ color: v.color }}>{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className="rounded-3xl p-10 grid grid-cols-2 gap-8 text-center"
          style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00, #FFB300)', boxShadow: '0 16px 48px rgba(232,25,44,0.25)' }}
        >
          {[
            // ['20+', 'Years Experience'],
            ['100+', 'Products'],
            // ['10,000+', 'Happy Customers'],
            ['24/7', 'Support'],
          ].map(([n, l]) => (
            <div key={l} className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{n}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/80">{l}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
