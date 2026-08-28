"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { FaStar } from 'react-icons/fa';

const FireworksCanvas = dynamic(() => import('@/components/FireworksCanvas'), { ssr: false });

const FEATURES = [
  { icon: '🚚', title: '2-Day Delivery', desc: 'Fast, secure delivery to your door' },
  { icon: '💰', title: 'Wholesale Rates', desc: 'Up to 80% discount on bulk orders' },
  { icon: '🏭', title: 'Sivakasi Direct', desc: 'Sourced from top factories' },
];

interface HomeClientProps {
  initialBlogs: any[];
  initialComboOffers: any[];
  initialFeedbacks: any[];
  initialProducts: any[];
  initialCategories: any[];
}

export default function HomeClient({
  initialBlogs,
  initialComboOffers,
  initialFeedbacks,
  initialProducts,
  initialCategories,
}: HomeClientProps) {
  const [blogs, setBlogs] = useState<any[]>(initialBlogs);
  const [comboOffers, setComboOffers] = useState<any[]>(initialComboOffers);
  const [feedbacks, setFeedbacks] = useState<any[]>(initialFeedbacks);
  const feedbackScrollRef = useRef<HTMLDivElement>(null);

  // Quick Order State
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [categories, setCategories] = useState<any[]>(initialCategories);

  // Sequential code (1, 2, 3... N) for each product based on master catalog
  const productCodeMap = useMemo(() => {
    const map = new Map<number, number>();
    products.forEach((p, idx) => {
      map.set(p.id, idx + 1);
    });
    return map;
  }, [products]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [customer, setCustomer] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Combo Offer Order State
  const [selectedComboOffer, setSelectedComboOffer] = useState<any>(null);
  const [selectedComboBanner, setSelectedComboBanner] = useState<{ id: number; title: string; price: number; itemsCount: number } | null>(null);
  const [comboCustomer, setComboCustomer] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '' });
  const [isComboSubmitting, setIsComboSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const comboScrollRef = useRef<HTMLDivElement>(null);

  const parseComboDescription = (descString: string) => {
    if (!descString) return { text: '', items: [] };
    try {
      const json = JSON.parse(descString);
      if (json && typeof json === 'object') {
        return {
          text: json.text || '',
          items: Array.isArray(json.items) ? json.items : []
        };
      }
    } catch (e) {}
    return { text: descString, items: [] };
  };

  const handleSelectComboOffer = (offer: any) => {
    const parsed = parseComboDescription(offer.description);
    
    if (parsed.items && parsed.items.length > 0) {
      // Clear previous quantities so ONLY this combo's items are loaded
      const newQtyMap: Record<number, number> = {};
      let matchedCount = 0;

      parsed.items.forEach((item: any) => {
        const itemProdName = (item.productName || '').trim().toLowerCase();
        const matched = products.find((p: any) => 
          p.id === item.productId && (p.name || '').trim().toLowerCase() === itemProdName
        ) || products.find((p: any) => 
          (p.name || '').trim().toLowerCase() === itemProdName
        ) || products.find((p: any) => 
          p.id === item.productId
        );

        if (matched) {
          newQtyMap[matched.id] = (newQtyMap[matched.id] || 0) + (Number(item.qty) || 1);
          matchedCount++;
        }
      });

      setQuantities(newQtyMap);
      try {
        localStorage.setItem('cart_quantities', JSON.stringify(newQtyMap));
      } catch (e) {
        console.error('Failed to save cart quantities to local storage', e);
      }
      
      const cleanTitle = offer.title.replace(/\s*-\s*₹\s*[\d,]+/, '');
      setSelectedComboBanner({
        id: offer.id,
        title: cleanTitle,
        price: offer.discounted_price,
        itemsCount: matchedCount
      });

      toast.success(`🎉 ${cleanTitle} loaded into order sheet!`);
    } else {
      setSelectedComboOffer(offer);
      toast.success(`Selected ${offer.title}`);
    }

    setTimeout(() => {
      const orderFormEl = document.getElementById('order-form') || document.getElementById('quick-order');
      if (orderFormEl) {
        orderFormEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          const nameInput = document.getElementById('customer-name-input') as HTMLInputElement;
          if (nameInput) {
            nameInput.focus();
          }
        }, 350);
      }
    }, 150);
  };

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
    try {
      const savedQuantities = localStorage.getItem('cart_quantities');
      if (savedQuantities) {
        setQuantities(JSON.parse(savedQuantities));
      }
    } catch (e) {
      console.error('Failed to parse cart quantities from local storage', e);
    }
  }, []);

  const handleQtyChange = (productId: number, qtyString: string) => {
    const val = parseInt(qtyString, 10);
    setQuantities(prev => {
      const newQuantities = { ...prev, [productId]: isNaN(val) || val < 0 ? 0 : val };
      localStorage.setItem('cart_quantities', JSON.stringify(newQuantities));
      return newQuantities;
    });
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const totalProductsCount = Object.values(quantities).reduce((sum, q) => sum + (q || 0), 0);
  const getSellingPrice = (p: any) => p.price - (p.price * (p.discount || 0) / 100);
  const totalOriginalPrice = products.reduce((sum, p) => sum + (p.price * (quantities[p.id] || 0)), 0);
  const overallTotal = products.reduce((sum, p) => sum + (getSellingPrice(p) * (quantities[p.id] || 0)), 0);

  const generatePDF = async (orderData: any) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const orderId = orderData.order_id || `ORDER_${Math.floor(100000 + Math.random() * 900000)}`;

    // Outer Border
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Header 1: Enquiry No, Estimate, Date
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Order No : ${orderId}`, 8, 10);
    doc.text('ESTIMATE / INVOICE', pageWidth / 2, 10, { align: 'center' });
    doc.text(`Date : ${new Date().toLocaleDateString()}`, pageWidth - 8, 10, { align: 'right' });

    // Line separator
    doc.setLineWidth(0.2);
    doc.line(5, 12, pageWidth - 5, 12);

    // Header 2: Contact and Email
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Mobile : +91 9994090969, 99430 98749`, 8, 16);
    doc.text(`E-mail : rrvcrackers@gmail.com`, pageWidth - 8, 16, { align: 'right' });

    // Line separator
    doc.line(5, 18, pageWidth - 5, 18);

    // Left side: Company Logo and Details
    try {
      const logoImg = new window.Image();
      logoImg.src = '/brand_logo.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      doc.addImage(logoImg, 'PNG', 8, 20, 24, 12);
    } catch (e) {
      // Ignore if logo fails to load
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('RRV Crackers', 35, 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Sivakasi, Tamil Nadu - 626123', 35, 30);

    // Right side: Customer Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', pageWidth - 8, 23, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${orderData.name}`, pageWidth - 8, 28, { align: 'right' });
    doc.text(`${orderData.mobile}`, pageWidth - 8, 32, { align: 'right' });
    const splitAddress = doc.splitTextToSize(`${orderData.address}, ${orderData.city}`, 70);
    doc.text(splitAddress, pageWidth - 8, 36, { align: 'right' });

    // Line separator before table
    doc.line(5, 42, pageWidth - 5, 42);

    // Table
    const tableColumn = ["S.No", "Product Name", "Qty", "Original Rate", "Discounted Rate", "Amount (Rs)"];
    const tableRows = orderData.items.map((item: any, index: number) => [
      index + 1,
      item.name,
      item.quantity,
      item.originalPrice.toFixed(2),
      item.price.toFixed(2),
      (item.price * item.quantity).toFixed(2)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.2 },
      bodyStyles: { textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
      styles: { cellPadding: 2, fontSize: 9 },
      margin: { left: 5, right: 5 }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 42;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Net Total: Rs. ${orderData.netTotal.toFixed(2)}`, pageWidth - 8, finalY + 8, { align: 'right' });
    doc.text(`Total Savings: Rs. ${orderData.discountTotal.toFixed(2)}`, pageWidth - 8, finalY + 14, { align: 'right' });

    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text(`Overall Total: Rs. ${orderData.overallTotal.toFixed(2)}`, pageWidth - 8, finalY + 22, { align: 'right' });

    doc.save(`Order_${orderId}.pdf`);
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
        const createdOrder = await res.json();
        toast.success('Order placed successfully! We will contact you soon.');
        setShowSuccessPopup(true);
        await generatePDF({ ...orderData, order_id: createdOrder.order_id });
        setQuantities({});
        setSelectedComboBanner(null);
        try {
          localStorage.removeItem('cart_quantities');
        } catch (e) {}
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
        const createdOrder = await res.json();
        toast.success('Combo Offer claimed successfully! We will contact you soon.');
        setShowSuccessPopup(true);
        await generatePDF({ ...orderData, order_id: createdOrder.order_id });
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
            <strong className="text-[#D4AF37]">Up to 80% OFF</strong> on all premium products!
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
        <section className="py-16 px-4 md:px-8 relative overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#101C40] to-[#0A1128] border-y border-[#D4AF37]/20">
          <div className="max-w-7xl mx-auto text-center mb-10">
            <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 inline-block">Exclusive Festival Savings</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#E5E5E5] font-display">Special Combo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F9DF9F] via-[#D4AF37] to-[#AA8222]">Packs</span></h2>
            <p className="text-gray-300 text-sm max-w-xl mx-auto mt-2">Choose your preferred celebration pack below. Clicking a pack auto-loads all included products into your order sheet!</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4AF37] to-[#AA8222] mx-auto mt-4 rounded-full" />
          </div>

          <div ref={comboScrollRef} className={`max-w-7xl mx-auto flex flex-row gap-8 overflow-x-auto snap-x pb-8 pt-4 hide-scrollbar ${comboOffers.length === 1 ? 'justify-center' : ''}`}>
            {comboOffers.map((offer, index) => {
              const cleanTitle = offer.title.replace(/\s*-\s*₹\s*[\d,]+/, '');
              const parsed = parseComboDescription(offer.description);
              const isPopular = index === 1 || comboOffers.length === 1;

              return (
                <div 
                  key={offer.id} 
                  className={`min-w-[320px] md:min-w-[380px] lg:min-w-[400px] ${comboOffers.length === 1 ? 'max-w-md w-full mx-auto' : 'flex-1'} bg-gradient-to-b from-[#162248] via-[#101C40] to-[#0A1128] border ${isPopular ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-[0_15px_40px_rgba(212,175,55,0.25)]' : 'border-[#D4AF37]/30'} rounded-3xl p-6 md:p-8 flex flex-col items-center text-center snap-center shrink-0 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(212,175,55,0.3)] hover:border-[#D4AF37] transition-all duration-500 relative overflow-hidden group`}
                >
                  {/* Top Accent Line */}
                  <div className={`absolute top-0 left-0 w-full ${isPopular ? 'h-2 bg-gradient-to-r from-[#F9DF9F] via-[#D4AF37] to-[#AA8222]' : 'h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8222]'}`} />

                  {/* Popular Banner */}
                  {isPopular && (
                    <div className="absolute top-0 right-1/2 translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-[#0A1128] text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-b-xl shadow-md z-20">
                      🔥 MOST POPULAR
                    </div>
                  )}

                  {/* Badges Bar */}
                  <div className="w-full flex items-center justify-center gap-2 mt-2 mb-4">
                    <span className="bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                      Limited Offer
                    </span>
                  </div>

                  {/* Image / Logo Container */}
                  <div className="w-32 h-32 md:w-36 md:h-36 relative rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)] border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37] group-hover:scale-105 transition-all duration-500 bg-[#0A1128]/80 p-3 flex items-center justify-center mb-5">
                    <img
                      src={offer.image_url || '/brand_logo.png'}
                      alt={cleanTitle}
                      className={`w-full h-full ${offer.image_url ? 'object-cover rounded-2xl' : 'object-contain p-1'}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/brand_logo.png';
                        e.currentTarget.className = 'w-full h-full object-contain p-1';
                      }}
                    />
                  </div>

                  {/* Content Block */}
                  <div className="flex-1 flex flex-col items-center w-full">
                    <h3 className="font-display font-black text-2xl md:text-3xl text-white mb-3 leading-tight tracking-tight drop-shadow-sm">
                      {cleanTitle}
                    </h3>

                    {/* Price Card */}
                    <div className="bg-[#0A1128]/80 border border-[#D4AF37]/30 rounded-2xl p-4 w-full flex items-center justify-center mb-4 shadow-inner">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-extrabold mb-0.5">Offer Price</span>
                        <span className="font-black text-[#D4AF37] text-3xl md:text-4xl leading-none drop-shadow-md">
                          ₹{offer.discounted_price}
                        </span>
                      </div>
                    </div>

                    {/* Description Text */}
                    {parsed.text && (
                      <p className="text-xs text-gray-300 leading-relaxed mb-4 font-medium px-1">
                        {parsed.text}
                      </p>
                    )}

                    {/* Included Items Box */}
                    {parsed.items && parsed.items.length > 0 && (
                      <div className="w-full bg-[#080E21] border border-[#D4AF37]/25 rounded-2xl p-4 my-2 text-left shadow-inner">
                        <div className="text-[11px] font-black text-[#D4AF37] uppercase tracking-wider mb-2.5 flex items-center justify-between border-b border-[#D4AF37]/15 pb-2">
                          <span className="flex items-center gap-1.5">📦 Included Products ({parsed.items.length}):</span>
                          <span className="text-[10px] text-gray-400 font-bold">Auto-fills sheet</span>
                        </div>
                        <ul className="text-xs text-gray-200 space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                          {parsed.items.map((item: any, idx: number) => (
                            <li key={idx} className="flex justify-between items-center py-1 border-b border-[#D4AF37]/10 last:border-0">
                              <span className="font-semibold text-gray-200 truncate max-w-[210px]">{item.productName}</span>
                              <span className="bg-[#D4AF37]/20 text-[#D4AF37] font-black px-2 py-0.5 rounded-full text-[10px] border border-[#D4AF37]/30">x{item.qty}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectComboOffer(offer)}
                      className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F9DF9F] to-[#AA8222] hover:from-[#F9DF9F] hover:to-[#D4AF37] text-[#0A1128] py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.6)] hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mt-5 border border-[#FFF8DC]/40 cursor-pointer"
                    >
                      <span>⚡ Select Pack & Order</span>
                      <span className="text-lg">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════ QUICK ORDER SECTION ═══════ */}
      <section id="quick-order" className="py-16 px-2 md:px-6 bg-[#0A1128]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 inline-block">Wholesale Rates</span>
            <h2 className="text-4xl font-black text-[#E5E5E5]">Quick <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Order</span></h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
          </div>

          {selectedComboBanner && (
            <div className="mb-8 bg-gradient-to-r from-[#101C40] to-[#1A2859] border-2 border-[#D4AF37] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fade-up">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-2xl flex-shrink-0">
                  🎉
                </div>
                <div>
                  <div className="font-black text-[#D4AF37] text-lg sm:text-xl">
                    Loaded Combo: {selectedComboBanner.title} (₹{Number(selectedComboBanner.price).toLocaleString('en-IN')})
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {selectedComboBanner.itemsCount} products have been auto-selected in your order sheet below. You can adjust quantities or add extra products before ordering!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedComboBanner(null);
                  setQuantities({});
                  try {
                    localStorage.removeItem('cart_quantities');
                  } catch (e) {}
                  toast.success('Combo selection cleared');
                }}
                className="px-4 py-2 bg-[#0A1128] hover:bg-red-950/40 border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37] hover:text-red-400 rounded-xl transition-all whitespace-nowrap cursor-pointer"
              >
                ✕ Clear Combo Selection
              </button>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400 animate-pulse">Loading wholesale catalog...</div>
          ) : (
            <>
              <div className="bg-[#1A2859] border-2 shadow-[0_0_30px_rgba(212,175,55,0.15)] rounded-t-xl border-[#D4AF37]/30">

                {/* Sticky Header Section */}
                <div className="sticky top-[80px] z-40 shadow-xl rounded-t-xl overflow-hidden">
                  {/* Top Header */}
                  <div className="grid grid-cols-2 p-3 font-bold text-sm md:text-base border-b-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-[#0A1128] border-[#D4AF37]/20">
                    <div>Total Products : {products.length}</div>
                    <div className="text-right">Overall Total : ₹{overallTotal.toFixed(2)}</div>
                  </div>

                  {/* Search Filter */}
                  <div className="p-4 bg-[#101C40] border-b-2 border-[#D4AF37]/20">
                    <input
                      type="text"
                      aria-label="Search products"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full max-w-md border border-[#D4AF37]/30 rounded-xl p-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-[#1A2859] text-[#E5E5E5]"
                    />
                  </div>
                </div>

                {/* ═══════ 1. DESKTOP VIEW TABLE (Image 1 Style with Dark & Gold Theme) ═══════ */}
                <div className="hidden md:block w-full overflow-x-auto bg-[#0A1128]">
                  <table className="w-full border-collapse text-center text-[#E5E5E5]">
                    <thead>
                      <tr className="bg-[#101C40] text-[#D4AF37] font-black uppercase text-xs md:text-sm tracking-wider border-b-2 border-[#D4AF37]/30">
                        <th className="p-3 border-r border-[#D4AF37]/20 w-16 text-center">Img</th>
                        <th className="p-3 border-r border-[#D4AF37]/20 w-16 text-center">Code</th>
                        <th className="p-3 border-r border-[#D4AF37]/20 text-left pl-4">Product</th>
                        <th className="p-3 border-r border-[#D4AF37]/20 w-44 text-center">Price (₹)</th>
                        <th className="p-3 border-r border-[#D4AF37]/20 w-28 text-center">Qty</th>
                        <th className="p-3 w-32 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => {
                        const catProducts = products.filter(p =>
                          String(p.categoryId) === String(category.id) &&
                          p.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        if (catProducts.length === 0) return null;

                        return (
                          <React.Fragment key={`desktop-cat-${category.id}`}>
                            {/* Category Header Row */}
                            <tr className="bg-[#0C1530] border-y border-[#D4AF37]/30">
                              <td colSpan={6} className="py-2.5 px-6 font-black uppercase tracking-wider text-left text-sm md:text-base text-[#D4AF37] border-b border-[#D4AF37]/20">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block animate-pulse" />
                                    {category.name}
                                  </span>
                                  <span className="text-xs font-semibold text-gray-400 normal-case">
                                    {catProducts.length} items
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Product Rows */}
                            {catProducts.map((product, idx) => {
                              const isEven = idx % 2 === 0;
                              const rowBg = isEven ? 'bg-[#1A2859]' : 'bg-[#101C40]';
                              const qty = quantities[product.id] || '';
                              const rowTotal = (quantities[product.id] || 0) * getSellingPrice(product);
                              const imgPath = product.image ? (product.image.startsWith('http') ? product.image : `/images/${product.image}`) : '/brand_logo.png';
                              const code = productCodeMap.get(product.id) || idx + 1;

                              return (
                                <tr
                                  key={`desktop-prod-${product.id}`}
                                  className={`${rowBg} hover:bg-[#D4AF37]/15 transition-colors duration-200 border-b border-[#D4AF37]/10 text-[#E5E5E5]`}
                                >
                                  {/* 1. Img */}
                                  <td className="p-2 border-r border-[#D4AF37]/10 text-center align-middle w-16">
                                    <div
                                      className="w-11 h-11 mx-auto relative flex items-center justify-center bg-[#0A1128] border border-[#D4AF37]/30 shadow-sm rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37] hover:scale-105 transition-all p-0.5"
                                      onClick={() => setPreviewImage(imgPath)}
                                      title="Click to view full image"
                                    >
                                      <img
                                        src={imgPath}
                                        alt={product.name}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = '/brand_logo.png';
                                          e.currentTarget.className = 'w-full h-full object-contain p-0.5';
                                        }}
                                      />
                                    </div>
                                  </td>

                                  {/* 2. Code */}
                                  <td className="p-2 border-r border-[#D4AF37]/10 text-center align-middle font-black text-gray-300 text-xs md:text-sm w-16">
                                    {code}
                                  </td>

                                  {/* 3. Product Name */}
                                  <td className="p-2.5 pl-4 border-r border-[#D4AF37]/10 text-left align-middle font-bold text-xs sm:text-sm md:text-base text-[#E5E5E5]">
                                    {product.name}
                                  </td>

                                  {/* 4. Price (₹) */}
                                  <td className="p-2 border-r border-[#D4AF37]/10 text-center align-middle whitespace-nowrap w-44">
                                    <div className="flex items-center justify-center gap-2">
                                      {product.price > getSellingPrice(product) && (
                                        <span className="line-through text-gray-400 text-xs sm:text-sm">
                                          ₹{product.price}
                                        </span>
                                      )}
                                      <span className="text-xs sm:text-sm md:text-base font-black text-[#D4AF37]">
                                        ₹{getSellingPrice(product).toFixed(2)}
                                      </span>
                                    </div>
                                  </td>

                                  {/* 5. Qty Input */}
                                  <td className="p-2 border-r border-[#D4AF37]/10 text-center align-middle w-28">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="0"
                                      value={qty}
                                      onChange={(e) => handleQtyChange(product.id, e.target.value)}
                                      className="w-20 h-8 mx-auto block text-center font-black text-xs sm:text-sm md:text-base border border-[#D4AF37]/40 rounded-xl bg-[#0A1128] text-[#E5E5E5] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                  </td>

                                  {/* 6. Total Box */}
                                  <td className="p-2 text-center align-middle w-32">
                                    <div className="w-24 h-8 mx-auto flex items-center justify-center font-black text-xs sm:text-sm md:text-base text-[#D4AF37]">
                                      {rowTotal > 0 ? `₹${rowTotal.toFixed(2)}` : <span className="text-gray-500 font-normal text-xs">₹0.00</span>}
                                    </div>
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

                {/* ═══════ 2. MOBILE VIEW (Current Card Layout with Steppers) ═══════ */}
                <div className="block md:hidden w-full">
                  {categories.map((category) => {
                    const catProducts = products.filter(p =>
                      String(p.categoryId) === String(category.id) &&
                      p.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    if (catProducts.length === 0) return null;

                    return (
                      <div key={`mobile-cat-${category.id}`} className="border-b border-[#D4AF37]/20 last:border-b-0">
                        {/* Category Header */}
                        <div className="bg-[#101C40] px-4 py-2.5 font-black tracking-wider uppercase text-left text-xs sm:text-sm text-[#D4AF37] border-b border-[#D4AF37]/20 flex items-center justify-between">
                          <span>{category.name}</span>
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-400 normal-case">
                            {catProducts.length} items
                          </span>
                        </div>

                        {/* Products List for Mobile */}
                        <div className="divide-y divide-[#D4AF37]/10">
                          {catProducts.map((product, idx) => {
                            const isEven = idx % 2 === 0;
                            const rowBg = isEven ? 'bg-[#1A2859]' : 'bg-[#101C40]';
                            const qty = quantities[product.id] || '';
                            const rowTotal = (quantities[product.id] || 0) * getSellingPrice(product);
                            const imgPath = product.image ? (product.image.startsWith('http') ? product.image : `/images/${product.image}`) : '/brand_logo.png';

                            return (
                              <div
                                key={`mobile-prod-${product.id}`}
                                className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-3 hover:bg-[#D4AF37]/10 transition-colors duration-200 ${rowBg}`}
                              >
                                {/* 1. Product Image Thumbnail */}
                                <div
                                  className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative flex items-center justify-center bg-[#0A1128] border border-[#D4AF37]/30 shadow-sm rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37] hover:scale-105 transition-all p-0.5"
                                  onClick={() => setPreviewImage(imgPath)}
                                  title="Click to view full image"
                                >
                                  <img
                                    src={imgPath}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = '/brand_logo.png';
                                      e.currentTarget.className = 'w-full h-full object-contain p-0.5';
                                    }}
                                  />
                                </div>

                                {/* 2. Product Name & Price Info */}
                                <div className="flex-1 min-w-0 pr-1">
                                  <div className="font-bold text-xs sm:text-sm text-[#E5E5E5] leading-snug line-clamp-2">
                                    {product.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                    {product.price > getSellingPrice(product) && (
                                      <span className="line-through text-gray-400 text-[10px] sm:text-xs">
                                        ₹{product.price}
                                      </span>
                                    )}
                                    <span className="text-xs sm:text-sm font-black text-[#D4AF37]">
                                      ₹{getSellingPrice(product).toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                {/* 3. Quantity Controls & Row Total */}
                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 flex-shrink-0">
                                  {/* Stepper Input */}
                                  <div className="flex items-center border border-[#D4AF37]/40 rounded-xl bg-[#0A1128] shadow-inner overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleQtyChange(product.id, String(Math.max(0, (quantities[product.id] || 0) - 1)))}
                                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 font-black text-sm sm:text-base active:scale-90 transition-all select-none cursor-pointer"
                                      aria-label={`Decrease ${product.name}`}
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      aria-label={`Quantity for ${product.name}`}
                                      value={qty}
                                      onChange={(e) => handleQtyChange(product.id, e.target.value)}
                                      placeholder="0"
                                      className="w-10 sm:w-16 h-7 sm:h-8 text-center font-black text-xs sm:text-sm bg-transparent text-[#E5E5E5] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleQtyChange(product.id, String((quantities[product.id] || 0) + 1))}
                                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 font-black text-sm sm:text-base active:scale-90 transition-all select-none cursor-pointer"
                                      aria-label={`Increase ${product.name}`}
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Line Total */}
                                  <div className="w-14 sm:w-24 text-right">
                                    {rowTotal > 0 ? (
                                      <span className="font-black text-[11px] sm:text-sm text-[#D4AF37] tracking-tight">
                                        ₹{rowTotal.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="hidden sm:inline-block text-xs text-gray-500 font-medium">
                                        ₹0.00
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Totals */}
                <div className="flex flex-col border-t-2 border-[#D4AF37]/20 text-sm md:text-base font-bold text-[#E5E5E5]">
                  <div className="flex w-full border-b border-[#D4AF37]/10 bg-[#1A2859] px-4 py-3 justify-between items-center">
                    <span className="text-gray-300">Sub Total:</span>
                    <span className="text-lg text-[#E5E5E5]">₹{overallTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex w-full bg-[#101C40] px-4 py-3.5 justify-between items-center rounded-b-xl">
                    <span className="text-[#D4AF37] text-base md:text-lg uppercase tracking-wider font-extrabold">Overall Total:</span>
                    <span className="text-[#D4AF37] font-black text-xl md:text-2xl">₹{overallTotal.toFixed(2)}</span>
                  </div>
                </div>

              </div>

              {/* Customer Booking Form */}
              <div id="order-form" className="mt-8 bg-gradient-to-br from-[#101C40] to-[#1A2859] p-6 md:p-10 rounded-2xl shadow-xl border border-[#D4AF37]/20 scroll-mt-24">
                <h2 className="text-3xl font-black mb-8 border-b border-[#D4AF37]/20 pb-4 text-center uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Customer Details</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#E5E5E5]">Name (*)</label>
                    <input id="customer-name-input" required type="text" name="name" value={customer.name} onChange={handleCustomerChange} placeholder="Enter your full name" className="border border-[#D4AF37]/30 p-3 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-[#101C40] text-[#E5E5E5]" />
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
                <div className="text-sm text-gray-300 mt-1">{f.desc}</div>
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
                    <h3 className="text-[#E5E5E5] font-bold tracking-wide uppercase text-sm flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs font-black">{fb.name?.charAt(0)}</div>
                      {fb.name}
                    </h3>
                    <span className="text-xs text-gray-400 ml-8">{new Date(fb.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ LATEST BLOGS ═══════ */}
      {blogs && blogs.length > 0 && (
        <section className="py-16 px-4 md:px-8 bg-[#101C40] border-t border-[#D4AF37]/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 inline-block">News & Updates</span>
              <h2 className="text-4xl font-black text-[#E5E5E5]">Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Blogs</span></h2>
              <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-[#1A2859] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-[#D4AF37]/20 flex flex-col group cursor-pointer">
                  <div className="h-48 bg-[#0A1128] relative overflow-hidden">
                    <img
                      src={blog.image_url || '/brand_logo.png'}
                      alt={blog.title}
                      className={`w-full h-full ${blog.image_url ? 'object-cover' : 'object-contain p-4'} transition-transform hover:scale-105 duration-500`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/brand_logo.png';
                        e.currentTarget.className = 'w-full h-full object-contain p-4 transition-transform hover:scale-105 duration-500';
                      }}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-[#D4AF37] font-bold mb-2">{new Date(blog.created_at).toLocaleDateString('en-IN')} • By {blog.author}</div>
                    <h3 className="text-xl font-bold text-[#E5E5E5] mb-3 line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-300 mb-5 line-clamp-3 flex-1">
                      {blog.content.replace(/<[^>]*>?/gm, '')}
                    </p>
                    <Link href={`/blogs`} className="text-[#D4AF37] font-bold text-sm hover:underline mt-auto flex items-center gap-1">
                      Read Full Blog <span className="text-lg">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/blogs" className="bg-[#0A1128] border-2 border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded-full font-bold hover:bg-[#D4AF37]/10 transition-colors">
                View All Posts
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full h-[80vh] flex items-center justify-center animate-fade-up">
            <button
              aria-label="Close preview"
              className="absolute -top-12 right-0 text-white hover:text-orange-400 text-3xl font-black bg-black/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
            >
              &times;
            </button>
            <Image src={previewImage} alt="Product Preview" fill className="rounded-xl shadow-2xl object-contain border-4 border-white/10" />
          </div>
        </div>
      )}

      {/* Combo Offer Order Modal */}
      {selectedComboOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#101C40] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative animate-in fade-in zoom-in-95 duration-200 border border-[#D4AF37]/30">
            <button
              aria-label="Close offer modal"
              onClick={() => setSelectedComboOffer(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 p-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="p-6 md:p-10">
              <div className="text-center mb-8">
                <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 inline-block px-3 py-1 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30">Exclusive Deal</span>
                <h2 className="text-3xl font-black text-[#E5E5E5] tracking-tight">Claim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Offer</span></h2>
              </div>

              <div className="bg-gradient-to-r from-[#1A2859] to-[#101C40] rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center gap-5 border border-[#D4AF37]/20 shadow-inner">
                <div className="w-24 h-24 relative flex-shrink-0 flex items-center justify-center bg-[#0A1128]/50 rounded-xl overflow-hidden shadow-md border-2 border-[#D4AF37]/30 p-1">
                  <img
                    src={selectedComboOffer.image_url || '/brand_logo.png'}
                    alt={selectedComboOffer.title}
                    className={`w-full h-full ${selectedComboOffer.image_url ? 'object-cover' : 'object-contain p-1'}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/brand_logo.png';
                      e.currentTarget.className = 'w-full h-full object-contain p-1';
                    }}
                  />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="font-black text-xl text-[#E5E5E5] leading-tight mb-1">{selectedComboOffer.title}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-2 bg-[#0A1128]/60 inline-flex px-3 py-1.5 rounded-lg border border-[#D4AF37]/30">
                    <span className="line-through text-gray-300 text-sm font-semibold">₹{selectedComboOffer.original_price}</span>
                    <span className="font-black text-[#D4AF37] text-2xl">₹{selectedComboOffer.discounted_price}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleComboSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Name <span className="text-[#D4AF37]">*</span></label>
                  <input required type="text" name="name" value={comboCustomer.name} onChange={handleComboCustomerChange} placeholder="Full name" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Mobile <span className="text-[#D4AF37]">*</span></label>
                  <input required type="tel" name="mobile" value={comboCustomer.mobile} onChange={handleComboCustomerChange} placeholder="10-digit number" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Email</label>
                  <input type="email" name="email" value={comboCustomer.email} onChange={handleComboCustomerChange} placeholder="Optional email" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Address <span className="text-[#D4AF37]">*</span></label>
                  <input required type="text" name="address" value={comboCustomer.address} onChange={handleComboCustomerChange} placeholder="Full delivery address" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">City <span className="text-[#D4AF37]">*</span></label>
                  <input required type="text" name="city" value={comboCustomer.city} onChange={handleComboCustomerChange} placeholder="City name" className="border border-[#D4AF37]/30 bg-[#101C40] text-[#E5E5E5] p-3.5 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">State</label>
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
                  <p className="text-center text-xs text-gray-400 font-medium mt-4 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Cash on Delivery Available • Secure Checkout
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl transform scale-100 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Order Confirmed!</h2>
            <p className="text-gray-400 text-sm mb-8 font-medium">Thank you for shopping with RRV Crackers. Your order has been placed successfully and we will contact you shortly.</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-green-500/30"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
