"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Product = { id: number; categoryId: number; name: string; price: number; image: string; };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getOriginalPrice = (price: number) => price * 5;

  return (
    <div className="w-full flex flex-col bg-[#FFF8F0] min-h-screen pb-24">
      <section className="pt-20 pb-12 px-4 text-center">
        <h1 className="text-5xl font-black text-gray-900 mb-4 font-display">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Products</span></h1>
        <p className="text-gray-600 max-w-lg mx-auto">Explore our wide variety of premium crackers. Ready to order? Head to the home page to fill out our quick wholesale form!</p>
      </section>

      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Loading amazing crackers...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
             <div className="text-6xl mb-4">🛒</div>
             <p className="text-lg">No products available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-orange-50 group flex flex-col">
                <div className="h-48 bg-gradient-to-br from-orange-50 to-red-50 relative flex items-center justify-center overflow-hidden">
                    {/* Dummy image or badge */}
                    <span className="absolute top-3 right-3 bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider z-10">
                      Sale
                    </span>
                    <div className="text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                      🎇
                    </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight">{product.name}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 line-through">₹{getOriginalPrice(product.price)}</span>
                      <span className="text-xl font-black text-red-600">₹{product.price}</span>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      80% OFF
                    </span>
                  </div>
                  <Link href="/" className="mt-4 w-full block text-center py-2.5 rounded-xl text-sm font-bold bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors">
                    Order Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
