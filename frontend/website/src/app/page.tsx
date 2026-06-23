"use client";

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import FireworksCanvas from '@/components/FireworksCanvas';
import { FaStar } from 'react-icons/fa';

const FEATURES = [
  { icon: '🚚', title: '2-Day Delivery', desc: 'Fast, secure delivery to your door' },
  { icon: '💰', title: 'Wholesale Rates', desc: 'Up to 40% discount on bulk orders' },
  { icon: '🏭', title: 'Sivakasi Direct', desc: 'Sourced from top factories' },
];

const SLIDER_IMAGES = [
  `${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_URL}/slider_images/banner_image_1.gif`, // Diwali Diya Festival image
  `${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_URL}/slider_images/banner_image_2.gif`, // Static image 2 (User liked)
  `${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_URL}/slider_images/banner_image_3.jpg` // Diwali sparkler celebration
];

export default function HomePage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [comboOffers, setComboOffers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const feedbackScrollRef = useRef<HTMLDivElement>(null);

  // Quick Order State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [customer, setCustomer] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Combo Offer Order State
  const [selectedComboOffer, setSelectedComboOffer] = useState<any>(null);
  const [comboCustomer, setComboCustomer] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '' });
  const [isComboSubmitting, setIsComboSubmitting] = useState(false);
  const comboScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comboOffers.length >= 3) {
      const interval = setInterval(() => {
        if (comboScrollRef.current) {
          const el = comboScrollRef.current;
          const maxScroll = el.scrollWidth - el.clientWidth;
          if (maxScroll <= 0) return;

          if (el.scrollLeft >= maxScroll - 10) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            el.scrollTo({ left: el.scrollLeft + 350, behavior: 'smooth' });
          }
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [comboOffers]);

  // Auto-scroll for Feedback
  useEffect(() => {
    if (feedbacks.length > 3) {
      const interval = setInterval(() => {
        if (feedbackScrollRef.current) {
          const el = feedbackScrollRef.current;
          const maxScroll = el.scrollWidth - el.clientWidth;
          if (maxScroll <= 0) return;

          if (el.scrollLeft >= maxScroll - 10) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            el.scrollTo({ left: el.scrollLeft + 320, behavior: 'smooth' });
          }
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [feedbacks]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/blogs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlogs(data.filter(b => b.is_published).slice(0, 3));
        }
      })
      .catch(console.error);

    // Fetch feedbacks
    fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/feedback`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeedbacks(data);
        }
      })
      .catch(console.error);

    // Fetch products and categories for Quick Order
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/products`),
      fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/categories`),
      fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/combo-offers`)
    ]).then(async ([pr, cr, co]) => {
      if (pr.ok) setProducts(await pr.json());
      if (cr.ok) setCategories(await cr.json());
      if (co.ok) {
        const offers = await co.json();
        setComboOffers(offers.filter((o: any) => o.is_active));
      }
    }).catch(console.error);
  }, []);

  const handleQtyChange = (productId: number, qtyString: string) => {
    const val = parseInt(qtyString, 10);
    setQuantities(prev => ({ ...prev, [productId]: isNaN(val) || val < 0 ? 0 : val }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const totalProductsCount = Object.values(quantities).reduce((sum, q) => sum + (q || 0), 0);
  const getSellingPrice = (p: any) => p.price - (p.price * (p.discount || 0) / 100);
  const totalOriginalPrice = products.reduce((sum, p) => sum + (p.price * (quantities[p.id] || 0)), 0);
  const overallTotal = products.reduce((sum, p) => sum + (getSellingPrice(p) * (quantities[p.id] || 0)), 0);

  const generatePDF = (orderData: any) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38);
    doc.text('Invoice / Order Details', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Customer Name: ${orderData.name}`, 14, 36);
    doc.text(`Mobile: ${orderData.mobile}`, 14, 42);
    doc.text(`Address: ${orderData.address}, ${orderData.city}`, 14, 48);

    const tableColumn = ["Item", "Qty", "Original Price", "Discounted Price", "Total"];
    const tableRows = orderData.items.map((item: any) => [
      item.name,
      item.quantity,
      `Rs. ${item.originalPrice.toFixed(2)}`,
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 55;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Net Total: Rs. ${orderData.netTotal.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Savings: Rs. ${orderData.discountTotal.toFixed(2)}`, 14, finalY + 18);

    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(`Overall Total: Rs. ${orderData.overallTotal.toFixed(2)}`, 14, finalY + 28);

    doc.save(`Order_${orderData.mobile}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalProductsCount === 0) {
      toast.error('Please add at least one product to your order.');
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData = {
        name: customer.name, mobile: customer.mobile, email: customer.email,
        address: customer.address, city: customer.city, state: customer.state,
        netTotal: totalOriginalPrice,
        discountTotal: totalOriginalPrice - overallTotal,
        overallTotal: overallTotal,
        items: products.filter(p => (quantities[p.id] || 0) > 0).map(p => ({
          productId: p.id, name: p.name, price: getSellingPrice(p), originalPrice: p.price, quantity: quantities[p.id]
        }))
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData),
      });
      if (res.ok) {
        toast.success('Order placed successfully! We will contact you soon.');
        generatePDF(orderData);
        setQuantities({});
        setCustomer({ name: '', mobile: '', email: '', address: '', city: '', state: '' });
      } else {
        toast.error('Failed to submit order.');
      }
    } catch (err) {
      toast.error('Network error. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComboCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setComboCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComboOffer) return;

    setIsComboSubmitting(true);
    try {
      const orderData = {
        name: comboCustomer.name, mobile: comboCustomer.mobile, email: comboCustomer.email,
        address: comboCustomer.address, city: comboCustomer.city, state: comboCustomer.state,
        netTotal: selectedComboOffer.original_price,
        discountTotal: selectedComboOffer.original_price - selectedComboOffer.discounted_price,
        overallTotal: selectedComboOffer.discounted_price,
        items: [{
          productId: `combo-${selectedComboOffer.id}`,
          name: `🎁 Combo Offer: ${selectedComboOffer.title}`,
          price: selectedComboOffer.discounted_price,
          originalPrice: selectedComboOffer.original_price,
          quantity: 1
        }]
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData),
      });
      if (res.ok) {
        toast.success('Combo Offer claimed successfully! We will contact you soon.');
        generatePDF(orderData);
        setComboCustomer({ name: '', mobile: '', email: '', address: '', city: '', state: '' });
        setSelectedComboOffer(null);
      } else {
        toast.error('Failed to submit combo order.');
      }
    } catch (err) {
      toast.error('Network error. Try again.');
    } finally {
      setIsComboSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative w-full h-[88vh] overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#0A1128] via-[#1A2859] to-[#0A1128]">
        <FireworksCanvas className="absolute inset-0 pointer-events-none z-10" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.15), transparent 70%)' }}
        />

        <div className="relative z-20 text-center px-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 backdrop-blur-sm shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse inline-block" />
            Diwali {new Date().getFullYear()} Special Collection
          </div>

          <h1 className="font-display font-black leading-tight mb-6 text-white drop-shadow-2xl" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
            The Biggest <span className="text-transparent bg-clip-text drop-shadow-md" style={{ backgroundImage: 'linear-gradient(to bottom, var(--brand-yellow) 30%, var(--brand-orange) 100%)' }}>RRV Crackers</span><br />
            <span className="inline-flex gap-1 md:gap-2 filter drop-shadow-lg py-4">
              {['D', 'I', 'W', 'A', 'L', 'I', '\u00A0', 'S', 'A', 'L', 'E'].map((char, i) => (
                <span key={i} className={char === '\u00A0' ? 'w-2 md:w-6' : 'animate-bounce text-transparent bg-clip-text bg-gradient-to-br from-[#F9DF9F] to-[#AA8222]'} style={{ animationDelay: `${i * 0.1}s` }}>
                  {char}
                </span>
              ))}
            </span><br />
            <span className="text-white text-5xl drop-shadow-xl">Is Here!</span>
          </h1>

          <p className="text-lg text-gray-200 mb-8 max-w-xl mx-auto drop-shadow-md">
            Light up your celebrations with India&apos;s finest crackers.{' '}
            <strong className="text-[#D4AF37]">Up to 40% OFF</strong> on all premium products!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/products" className="bg-gradient-to-r from-[#D4AF37] to-[#AA8222] hover:from-[#AA8222] hover:to-[#D4AF37] text-[#0A0A0A] font-black px-8 py-4 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 hover:scale-110 active:scale-95">
              Shop Now
            </Link>
            <Link href="/contact" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95">
              Get A Quote
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ PROMO BANNER ═══════ */}
      {comboOffers.length > 0 && (
        <section className="py-16 px-4 md:px-8 relative overflow-hidden bg-gradient-to-br from-[#101C40] via-[#1A2859] to-[#101C40] border-y border-[#D4AF37]/20">
          <div ref={comboScrollRef} className={`max-w-7xl mx-auto flex flex-row gap-8 overflow-x-auto snap-x pb-8 pt-4 hide-scrollbar ${comboOffers.length === 1 ? 'justify-center' : ''}`}>
            {comboOffers.map((offer) => (
              <div key={offer.id} className={`min-w-[320px] md:min-w-[420px] ${comboOffers.length === 1 ? 'max-w-md w-full mx-auto' : 'flex-1'} bg-gradient-to-b from-[#1A2859] to-[#0A1128] border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center gap-6 snap-center shrink-0 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] transition-all duration-500 relative overflow-hidden group`}>
                
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8222]" />
                
                {/* Badge */}
                <div className="absolute top-5 left-5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                  Limited Offer
                </div>

                {/* Image */}
                {offer.image_url && (
                  <div className="w-40 h-40 md:w-48 md:h-48 mt-6 rounded-2xl overflow-hidden shadow-2xl border-4 border-[#101C40] ring-2 ring-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-700">
                    <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 flex flex-col items-center w-full">
                  <h2 className="font-display font-black text-2xl md:text-3xl text-[#E5E5E5] mb-4 leading-tight">{offer.title}</h2>
                  
                  <div className="flex items-end justify-center gap-4 mb-6 py-4 border-y border-[#D4AF37]/10 w-full">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-[-2px]">M.R.P</span>
                      <span className="line-through text-gray-400 text-xl font-semibold">₹{offer.original_price}</span>
                    </div>
                    <div className="w-px h-10 bg-[#D4AF37]/20"></div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-[-2px]">Offer Price</span>
                      <span className="font-black text-[#D4AF37] text-4xl leading-none drop-shadow-md">₹{offer.discounted_price}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-8 line-clamp-4 hover:line-clamp-none transition-all cursor-pointer whitespace-pre-line px-2">
                    {offer.description}
                  </p>

                  <button
                    onClick={() => setSelectedComboOffer(offer)}
                    className="mt-auto w-full max-w-[260px] bg-gradient-to-r from-[#D4AF37] to-[#AA8222] hover:from-[#AA8222] hover:to-[#D4AF37] text-[#0A1128] py-3.5 rounded-full font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 transition-all active:scale-95"
                  >
                    Claim Offer Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ QUICK ORDER SECTION ═══════ */}
      <section id="quick-order" className="py-16 px-2 md:px-6 bg-[#101C40]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 inline-block">Wholesale Rates</span>
            <h2 className="text-4xl font-black text-[#E5E5E5]">Quick <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Order</span></h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">Loading wholesale catalog...</div>
          ) : (
            <>
              <div className="bg-[#1A2859] border-2 overflow-hidden shadow-lg rounded-t-xl border-[#D4AF37]/20">

                {/* Top Header */}
                <div className="grid grid-cols-2 p-3 font-bold text-sm md:text-base border-b-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-[#0A1128] border-[#D4AF37]/20">
                  <div>Total Products : {products.length}</div>
                  <div className="text-right">Overall Total : ₹{overallTotal.toFixed(2)}</div>
                </div>

                {/* Search Filter */}
                <div className="p-4 bg-[#101C40] border-b-2 border-[#D4AF37]/20">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md border border-[#D4AF37]/30 rounded-xl p-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-[#1A2859] text-[#E5E5E5]"
                  />
                </div>

                {/* Categories & Products */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse text-sm text-center text-[#E5E5E5]">
                    <tbody>
                      {categories.map((category) => {
                        const catProducts = products.filter(p =>
                          String(p.categoryId) === String(category.id) &&
                          p.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        if (catProducts.length === 0) return null;

                        return (
                          <React.Fragment key={`cat-${category.id}`}>
                            <tr className="bg-[#101C40] border-b border-[#D4AF37]/20 text-[#D4AF37]">
                              <td colSpan={5} className="py-2.5 font-bold tracking-widest uppercase text-left pl-6">
                                {category.name}
                              </td>
                            </tr>

                            {/* Products in this category */}
                            {catProducts.map((product, idx) => {
                              const isEven = idx % 2 === 0;
                              const rowBg = isEven ? 'bg-[#1A2859]' : 'bg-[#101C40]';
                              const qty = quantities[product.id] || '';
                              const rowTotal = (quantities[product.id] || 0) * getSellingPrice(product);

                              return (
                                <tr key={product.id} className={`border-b border-[#D4AF37]/10 last:border-0 hover:bg-[#D4AF37]/10 transition-colors duration-300 ${rowBg}`}>
                                  <td className="w-16 p-2 border-r border-[#D4AF37]/10">
                                    <div
                                      className="w-10 h-10 mx-auto flex items-center justify-center text-xl bg-[#101C40] border border-[#D4AF37]/20 shadow-sm rounded overflow-hidden cursor-pointer hover:border-[#D4AF37] hover:shadow-md transition-all"
                                      onClick={() => product.image && setPreviewImage(product.image.startsWith('http') ? product.image : `/images/${product.image}`)}
                                    >
                                      {product.image ? (
                                        <img src={product.image.startsWith('http') ? product.image : `/images/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                      ) : (
                                        '🎇'
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2 border-r border-[#D4AF37]/10 font-semibold text-left pl-4 text-[#E5E5E5]">{product.name}</td>
                                  <td className="w-32 p-2 border-r border-[#D4AF37]/10 font-bold">
                                    <span className="line-through text-gray-500 mr-2 text-xs">₹{product.price}</span>
                                    <span className="text-[#D4AF37]">₹{getSellingPrice(product).toFixed(2)}</span>
                                  </td>
                                  <td className="w-32 p-2 border-r border-[#D4AF37]/10">
                                    <input
                                      type="number"
                                      min="0"
                                      value={qty}
                                      onChange={(e) => handleQtyChange(product.id, e.target.value)}
                                      placeholder="Qty"
                                      className="w-20 p-1.5 text-center border border-[#D4AF37]/30 rounded focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-[#101C40] text-[#E5E5E5]"
                                    />
                                  </td>
                                  <td className="w-32 p-2 font-black text-[#D4AF37]">
                                    {rowTotal > 0 ? `₹${rowTotal.toFixed(2)}` : ''}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Totals */}
                <div className="flex flex-col border-t-2 border-[#D4AF37]/20 text-sm md:text-base font-bold text-[#E5E5E5]">
                  <div className="flex w-full border-b border-[#D4AF37]/10 bg-[#1A2859]">
                    <div className="flex-1 text-right p-3 border-r border-[#D4AF37]/10">Sub Total :</div>
                    <div className="w-32 p-3 text-center text-lg text-[#E5E5E5]">₹{overallTotal.toFixed(2)}</div>
                  </div>
                  <div className="flex w-full border-b-2 border-[#D4AF37]/20 bg-[#101C40]">
                    <div className="flex-1 text-right p-3 border-r border-[#D4AF37]/20 text-[#D4AF37]">Overall Total :</div>
                    <div className="w-32 p-3 text-center text-[#D4AF37] font-black text-xl">₹{overallTotal.toFixed(2)}</div>
                  </div>
                </div>

              </div>

              {/* Customer Booking Form */}
              <div className="mt-8 bg-gradient-to-br from-[#101C40] to-[#1A2859] p-6 md:p-10 rounded-2xl shadow-xl border border-[#D4AF37]/20">
                <h2 className="text-3xl font-black mb-8 border-b border-[#D4AF37]/20 pb-4 text-center uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Customer Details</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#E5E5E5]">Name (*)</label>
                    <input required type="text" name="name" value={customer.name} onChange={handleCustomerChange} placeholder="Enter your full name" className="border border-[#D4AF37]/30 p-3 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-[#101C40] text-[#E5E5E5]" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-start-1">
                    <label className="text-sm font-semibold text-[#E5E5E5]">Mobile Number (*)</label>
                    <input required type="tel" name="mobile" value={customer.mobile} onChange={handleCustomerChange} placeholder="10-digit mobile number" className="border border-[#D4AF37]/30 p-3 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-[#101C40] text-[#E5E5E5]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#E5E5E5]">Email</label>
                    <input type="email" name="email" value={customer.email} onChange={handleCustomerChange} placeholder="Optional email address" className="border border-[#D4AF37]/30 p-3 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-[#101C40] text-[#E5E5E5]" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-[#E5E5E5]">Delivery Address (*)</label>
                    <input required type="text" name="address" value={customer.address} onChange={handleCustomerChange} placeholder="Full street address" className="border border-[#D4AF37]/30 p-3 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-[#101C40] text-[#E5E5E5]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#E5E5E5]">City (*)</label>
                    <input required type="text" name="city" value={customer.city} onChange={handleCustomerChange} placeholder="City name" className="border border-[#D4AF37]/30 p-3 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-[#101C40] text-[#E5E5E5]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#E5E5E5]">State</label>
                    <input type="text" name="state" value={customer.state} onChange={handleCustomerChange} placeholder="State name" className="border border-[#D4AF37]/30 p-3 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-[#101C40] text-[#E5E5E5]" />
                  </div>

                  <div className="md:col-span-2 flex justify-center mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-[#D4AF37] to-[#AA8222] hover:from-[#AA8222] hover:to-[#D4AF37] text-[#0A1128] font-black text-lg py-4 px-12 rounded-full shadow-[0_8px_20px_-6px_rgba(212,175,55,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(212,175,55,0.6)] hover:-translate-y-1 transition-all disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/30"
                    >
                      {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════ FEATURES STRIP ═══════ */}
      <section className="py-10 px-4 md:px-8 bg-[#0A1128] border-y border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-x divide-[#D4AF37]/20">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-5 px-6 py-6 md:py-4">
              <span className="text-4xl md:text-5xl flex-shrink-0 drop-shadow-sm">{f.icon}</span>
              <div>
                <div className="font-bold text-base md:text-lg text-[#E5E5E5]">{f.title}</div>
                <div className="text-sm text-gray-400 mt-1">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ CUSTOMER FEEDBACK SLIDER ═══════ */}
      {feedbacks.length > 0 && (
        <section className="py-16 px-4 md:px-8 bg-[#101C40] border-t border-[#D4AF37]/20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 100%, rgba(212,175,55,0.05), transparent 60%)' }} />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 inline-block">What They Say</span>
              <h2 className="text-4xl font-black text-[#E5E5E5]">Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Feedback</span></h2>
              <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
            </div>

            <div ref={feedbackScrollRef} className="flex gap-6 overflow-x-auto snap-x pb-8 hide-scrollbar px-2">
              {feedbacks.map((fb, idx) => (
                <div key={fb.id || idx} className="min-w-[300px] max-w-[350px] flex-1 bg-gradient-to-br from-[#1A2859] to-[#0A1128] rounded-2xl p-6 border border-[#D4AF37]/20 shadow-lg snap-center shrink-0 flex flex-col hover:-translate-y-2 hover:border-[#D4AF37]/50 transition-all duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className={star <= (fb.rating || 5) ? 'text-[#D4AF37]' : 'text-gray-700'} />
                    ))}
                  </div>
                  <p className="text-gray-300 italic text-sm mb-6 flex-1 relative">
                    <span className="absolute -top-3 -left-2 text-4xl text-[#D4AF37]/20 font-serif">&quot;</span>
                    {fb.message}
                    <span className="absolute -bottom-4 right-0 text-4xl text-[#D4AF37]/20 font-serif leading-none">&quot;</span>
                  </p>
                  <div className="border-t border-[#D4AF37]/10 pt-4 mt-auto">
                    <h4 className="text-[#E5E5E5] font-bold tracking-wide uppercase text-sm flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs font-black">{fb.name?.charAt(0)}</div>
                      {fb.name}
                    </h4>
                    <span className="text-xs text-gray-500 ml-8">{new Date(fb.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ LATEST BLOGS ═══════ */}
      <section className="py-16 px-4 md:px-8 bg-[#101C40] border-t border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 inline-block">News & Updates</span>
            <h2 className="text-4xl font-black text-[#E5E5E5]">Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Blogs</span></h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-10">Loading latest blogs...</div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="bg-[#1A2859] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-[#D4AF37]/20 flex flex-col group cursor-pointer">
                  <div className="h-48 bg-[#0A1128] relative overflow-hidden">
                    {blog.image_url ? (
                      <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1A2859] to-[#101C40] flex items-center justify-center text-4xl">📝</div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-[#D4AF37] font-bold mb-2">{new Date(blog.created_at).toLocaleDateString()} • By {blog.author}</div>
                    <h3 className="text-xl font-bold text-[#E5E5E5] mb-3 line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-400 mb-5 line-clamp-3 flex-1">
                      {blog.content.replace(/<[^>]*>?/gm, '')}
                    </p>
                    <Link href={`/blogs`} className="text-[#D4AF37] font-bold text-sm hover:underline mt-auto flex items-center gap-1">
                      Read Full Blog <span className="text-lg">→</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link href="/blogs" className="bg-[#0A1128] border-2 border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded-full font-bold hover:bg-[#D4AF37]/10 transition-colors">
              View All Posts
            </Link>
          </div>
        </div>
      </section>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full flex items-center justify-center animate-fade-up">
            <button
              className="absolute -top-12 right-0 text-white hover:text-orange-400 text-3xl font-black bg-black/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
            >
              &times;
            </button>
            <img src={previewImage} alt="Product Preview" className="max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain border-4 border-white/10" />
          </div>
        </div>
      )}

      {/* Combo Offer Order Modal */}
      {selectedComboOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#101C40] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative animate-in fade-in zoom-in-95 duration-200 border border-[#D4AF37]/30">
            <button
              onClick={() => setSelectedComboOffer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 p-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="p-6 md:p-10">
              <div className="text-center mb-8">
                <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 inline-block px-3 py-1 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30">Exclusive Deal</span>
                <h2 className="text-3xl font-black text-[#E5E5E5] tracking-tight">Claim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Offer</span></h2>
              </div>

              <div className="bg-gradient-to-r from-[#1A2859] to-[#101C40] rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center gap-5 border border-[#D4AF37]/20 shadow-inner">
                {selectedComboOffer.image_url && (
                  <img src={selectedComboOffer.image_url} alt={selectedComboOffer.title} className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-[#D4AF37]/30" />
                )}
                <div className="text-center md:text-left flex-1">
                  <h3 className="font-black text-xl text-[#E5E5E5] leading-tight mb-1">{selectedComboOffer.title}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-2 bg-[#0A1128]/60 inline-flex px-3 py-1.5 rounded-lg border border-[#D4AF37]/30">
                    <span className="line-through text-gray-400 text-sm font-semibold">₹{selectedComboOffer.original_price}</span>
                    <span className="font-black text-[#D4AF37] text-2xl">₹{selectedComboOffer.discounted_price}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleComboSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Name <span className="text-[#D4AF37]">*</span></label>
                  <input required type="text" name="name" value={comboCustomer.name} onChange={handleComboCustomerChange} placeholder="Full name" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mobile <span className="text-[#D4AF37]">*</span></label>
                  <input required type="tel" name="mobile" value={comboCustomer.mobile} onChange={handleComboCustomerChange} placeholder="10-digit number" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email</label>
                  <input type="email" name="email" value={comboCustomer.email} onChange={handleComboCustomerChange} placeholder="Optional email" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Address <span className="text-[#D4AF37]">*</span></label>
                  <input required type="text" name="address" value={comboCustomer.address} onChange={handleComboCustomerChange} placeholder="Full delivery address" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">City <span className="text-[#D4AF37]">*</span></label>
                  <input required type="text" name="city" value={comboCustomer.city} onChange={handleComboCustomerChange} placeholder="City name" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">State</label>
                  <input type="text" name="state" value={comboCustomer.state} onChange={handleComboCustomerChange} placeholder="State name" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>

                <div className="md:col-span-2 mt-6">
                  <button
                    type="submit"
                    disabled={isComboSubmitting}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA8222] hover:from-[#AA8222] hover:to-[#D4AF37] text-[#0A1128] font-black text-lg py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(212,175,55,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/30 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isComboSubmitting ? 'Processing...' : 'Confirm Order & Claim Now'}
                  </button>
                  <p className="text-center text-xs text-gray-500 font-medium mt-4 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Cash on Delivery Available • Secure Checkout
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
