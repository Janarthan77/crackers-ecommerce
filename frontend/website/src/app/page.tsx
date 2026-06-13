"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: '🛡️', title: 'ISI Certified', desc: 'All products meet India safety standards' },
  { icon: '🚚', title: '2-Day Delivery', desc: 'Fast, secure delivery to your door' },
  { icon: '💰', title: 'Wholesale Rates', desc: 'Up to 40% discount on bulk orders' },
  { icon: '🏭', title: 'Sivakasi Direct', desc: 'Sourced from top factories' },
];

const SLIDER_IMAGES = [
  `${process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL}/slider_image/banner_image_1.gif`, // Diwali Diya Festival image
  `${process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL}/slider_image/banner_image_2.gif`, // Static image 2 (User liked)
  `${process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL}/slider_image/banner_image_3.jpg` // Diwali sparkler celebration
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Quick Order State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [customer, setCustomer] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlogs(data.filter(b => b.is_published).slice(0, 3));
        }
      })
      .catch(console.error);

    // Fetch products and categories for Quick Order
    Promise.all([
      fetch('http://localhost:5000/api/products'),
      fetch('http://localhost:5000/api/categories')
    ]).then(async ([pr, cr]) => {
      if (pr.ok) setProducts(await pr.json());
      if (cr.ok) setCategories(await cr.json());
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
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData),
      });
      if (res.ok) {
        toast.success('Order placed successfully! We will contact you soon.');
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

  return (
    <div className="flex flex-col w-full">

      {/* ═══════ HERO SLIDER ═══════ */}
      <section className="relative w-full h-[88vh] overflow-hidden bg-black flex items-center justify-center">
        {SLIDER_IMAGES.map((src, index) => (
          <div
            key={index}
            className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: currentSlide === index ? 1 : 0,
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ))}

        <div className="relative z-10 text-center px-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6 bg-orange-500/20 text-orange-400 border border-orange-500/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse inline-block" />
            Diwali 2025 Special Collection
          </div>

          <h1 className="font-display font-black leading-tight mb-6 text-white" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
            The Biggest<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">DIWALI</span><br />
            <span className="text-white text-5xl">Sale Is Here!</span>
          </h1>

          <p className="text-lg text-gray-200 mb-8 max-w-xl mx-auto">
            Light up your celebrations with India&apos;s finest crackers.{' '}
            <strong className="text-orange-400">Up to 40% OFF</strong> on all premium products!
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#quick-order" className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-3.5 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
              Shop Now
            </a>
            <Link href="/contact" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold hover:bg-white/20 transition-all">
              Get A Quote
            </Link>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {SLIDER_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-orange-500 scale-125' : 'bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════ FEATURES STRIP ═══════ */}
      <section className="py-6 px-4 md:px-8 bg-white border-y border-orange-50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-orange-50">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3 px-6 py-4">
              <span className="text-2xl flex-shrink-0">{f.icon}</span>
              <div>
                <div className="font-bold text-sm text-gray-800">{f.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ PROMO BANNER ═══════ */}
      <section className="py-14 px-4 md:px-8 relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500">
        <div className="max-w-2xl mx-auto text-center relative z-10 text-white">
          <h2 className="font-display font-black mb-3 text-4xl">Special Combo Offer!</h2>
          <p className="text-base text-white/90 mb-7 leading-relaxed">
            Order above <span className="font-black text-yellow-200">₹2,000</span> and get{' '}
            <span className="font-black text-yellow-200">FREE Delivery</span> +{' '}
            <span className="font-black text-yellow-200">5% Extra Discount</span> on your cart!
          </p>
          <a href="#quick-order" className="inline-block bg-white text-red-600 px-8 py-3.5 rounded-full font-black text-sm hover:scale-105 shadow-xl transition-transform">
            Shop & Save Now
          </a>
        </div>
      </section>

      {/* ═══════ QUICK ORDER SECTION ═══════ */}
      <section id="quick-order" className="py-16 px-2 md:px-6 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="text-orange-600 font-bold tracking-widest uppercase text-xs mb-2 inline-block">Wholesale Rates</span>
            <h2 className="text-4xl font-black text-gray-900">Quick <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Order</span></h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">Loading wholesale catalog...</div>
          ) : (
            <>
              <div className="bg-white border-2 overflow-hidden shadow-lg rounded-t-xl border-orange-200">

                {/* Top Header */}
                <div className="grid grid-cols-2 p-3 font-bold text-sm md:text-base border-b-2 bg-gradient-to-r from-red-600 to-orange-500 text-white border-orange-200">
                  <div>Total Products : {products.length}</div>
                  <div className="text-right">Overall Total : ₹{overallTotal.toFixed(2)}</div>
                </div>

                {/* Categories & Products */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse text-sm text-center text-gray-800">
                    <tbody>
                      {categories.map((category) => {
                        const catProducts = products.filter(p => String(p.categoryId) === String(category.id));
                        if (catProducts.length === 0) return null;

                        return (
                          <React.Fragment key={`cat-${category.id}`}>
                            <tr className="bg-orange-100 border-b border-orange-200 text-orange-900">
                              <td colSpan={5} className="py-2.5 font-bold tracking-widest uppercase text-left pl-6">
                                {category.name}
                              </td>
                            </tr>

                            {/* Products in this category */}
                            {catProducts.map((product, idx) => {
                              const isEven = idx % 2 === 0;
                              const rowBg = isEven ? 'bg-white' : 'bg-orange-50/50';
                              const qty = quantities[product.id] || '';
                              const rowTotal = (quantities[product.id] || 0) * getSellingPrice(product);

                              return (
                                <tr key={product.id} className={`border-b border-orange-100 ${rowBg}`}>
                                  <td className="w-16 p-2 border-r border-orange-100">
                                    <div className="w-10 h-10 mx-auto flex items-center justify-center text-xl bg-white border border-orange-100 shadow-sm rounded overflow-hidden">
                                      {product.image ? (
                                        <img src={product.image.startsWith('http') ? product.image : `/images/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                      ) : (
                                        '🎇'
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2 border-r border-orange-100 font-semibold text-left pl-4">{product.name}</td>
                                  <td className="w-32 p-2 border-r border-orange-100 font-bold">
                                    <span className="line-through text-red-600 mr-2 text-xs">₹{product.price}</span>
                                    <span className="text-green-700">₹{getSellingPrice(product).toFixed(2)}</span>
                                  </td>
                                  <td className="w-32 p-2 border-r border-orange-100">
                                    <input
                                      type="number"
                                      min="0"
                                      value={qty}
                                      onChange={(e) => handleQtyChange(product.id, e.target.value)}
                                      placeholder="Qty"
                                      className="w-20 p-1.5 text-center border border-orange-200 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
                                    />
                                  </td>
                                  <td className="w-32 p-2 font-black text-green-700">
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
                <div className="flex flex-col border-t-2 border-orange-200 text-sm md:text-base font-bold text-gray-800">
                  <div className="flex w-full border-b border-orange-100 bg-orange-50/30">
                    <div className="flex-1 text-right p-3 border-r border-orange-100">Sub Total :</div>
                    <div className="w-32 p-3 text-center text-lg text-gray-900">₹{overallTotal.toFixed(2)}</div>
                  </div>
                  <div className="flex w-full border-b-2 border-orange-200 bg-orange-100">
                    <div className="flex-1 text-right p-3 border-r border-orange-200 text-orange-900">Overall Total :</div>
                    <div className="w-32 p-3 text-center text-red-600 font-black text-xl">₹{overallTotal.toFixed(2)}</div>
                  </div>
                </div>

              </div>

              {/* Customer Booking Form */}
              <div className="mt-8 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-center uppercase tracking-widest text-[#1E3A8A]">Customer Details</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Name (*)</label>
                    <input required type="text" name="name" value={customer.name} onChange={handleCustomerChange} placeholder="Enter your full name" className="border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-start-1">
                    <label className="text-sm font-semibold text-gray-700">Mobile Number (*)</label>
                    <input required type="tel" name="mobile" value={customer.mobile} onChange={handleCustomerChange} placeholder="10-digit mobile number" className="border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <input type="email" name="email" value={customer.email} onChange={handleCustomerChange} placeholder="Optional email address" className="border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Delivery Address (*)</label>
                    <input required type="text" name="address" value={customer.address} onChange={handleCustomerChange} placeholder="Full street address" className="border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">City (*)</label>
                    <input required type="text" name="city" value={customer.city} onChange={handleCustomerChange} placeholder="City name" className="border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">State</label>
                    <input type="text" name="state" value={customer.state} onChange={handleCustomerChange} placeholder="State name" className="border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>

                  <div className="md:col-span-2 flex justify-center mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-black text-lg py-4 px-12 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-70"
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

      {/* ═══════ LATEST BLOGS ═══════ */}
      <section className="py-16 px-4 md:px-8 bg-white border-t border-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-600 font-bold tracking-widest uppercase text-xs mb-2 inline-block">News & Updates</span>
            <h2 className="text-4xl font-black text-gray-900">Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Blogs</span></h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-10">Loading latest blogs...</div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-orange-50 flex flex-col">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {blog.image_url ? (
                      <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center text-4xl">📝</div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-orange-500 font-bold mb-2">{new Date(blog.created_at).toLocaleDateString()} • By {blog.author}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-600 mb-5 line-clamp-3 flex-1">
                      {blog.content.replace(/<[^>]*>?/gm, '')}
                    </p>
                    <Link href={`/blogs`} className="text-orange-600 font-bold text-sm hover:underline mt-auto flex items-center gap-1">
                      Read Full Blog <span className="text-lg">→</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link href="/blogs" className="bg-white border-2 border-orange-500 text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition-colors">
              View All Posts
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
