"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Product = { id: number; categoryId: number; name: string; price: number; image: string; };

type Category = { id: number; name: string; };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(10000);
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(10000);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/products`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/categories`).then(res => res.json())
    ])
      .then(([prodData, catData]) => {
        if (Array.isArray(prodData)) {
          setProducts(prodData);
          if (prodData.length > 0) {
            const maxP = Math.max(...prodData.map(p => p.price));
            setMaxPriceLimit(maxP);
            setCurrentMaxPrice(maxP);
          }
        }
        if (Array.isArray(catData)) {
          setCategories(catData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, currentMaxPrice]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.categoryId.toString() === selectedCategory;
    const matchesPrice = p.price <= currentMaxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const getOriginalPrice = (price: number) => price * 5;

  return (
    <div className="w-full flex flex-col bg-[#FFF8F0] min-h-screen pb-24">
      <section className="pt-20 pb-12 px-4 text-center">
        <h1 className="text-5xl font-black text-gray-900 mb-4 font-display">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Products</span></h1>
        <p className="text-gray-600 max-w-lg mx-auto">Explore our wide variety of premium crackers. Ready to order? Head to the home page to fill out our quick wholesale form!</p>
      </section>

      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-50 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2">Search Products</label>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Max Price: ₹{currentMaxPrice}
            </label>
            <input 
              type="range" 
              min="0" 
              max={maxPriceLimit} 
              value={currentMaxPrice}
              onChange={(e) => setCurrentMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Loading amazing crackers...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-lg">No products found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-orange-50 group flex flex-col">
                <div className="h-48 bg-gradient-to-br from-orange-50 to-red-50 relative flex items-center justify-center overflow-hidden">
                  {/* Dummy image or badge */}
                  <span className="absolute top-3 right-3 bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider z-10">
                    Sale
                  </span>
                  {product.image ? (
                    <img
                      src={product.image.startsWith('http') ? product.image : `/images/${product.image}`}
                      alt={product.name}
                      className="w-auto h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                      🧨
                    </div>
                  )}
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

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 rounded-xl border border-orange-200 font-bold text-orange-600 disabled:opacity-50 hover:bg-orange-50 transition-colors"
            >
              Previous
            </button>
            <span className="font-semibold text-gray-700 mx-4">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 rounded-xl border border-orange-200 font-bold text-orange-600 disabled:opacity-50 hover:bg-orange-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
