"use client";

import { useEffect, useState } from 'react';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/blogs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlogs(data.filter(b => b.is_published));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full flex flex-col bg-[#FFF8F0] min-h-screen">
      
      {/* Header */}
      <section className="pt-20 pb-12 px-4 text-center">
        <h1 className="text-5xl font-black text-gray-900 mb-4 font-display">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Blogs</span></h1>
        <p className="text-gray-600 max-w-lg mx-auto">Stay up to date with the latest news, festival tips, and announcements from RRV Crackers.</p>
      </section>

      {/* Blogs Grid */}
      <section className="pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
               <div className="text-6xl mb-4">📝</div>
               <p className="text-lg">No blogs found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article key={blog.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-orange-50 flex flex-col group">
                  <div className="h-64 bg-gray-200 relative overflow-hidden">
                    {blog.image_url ? (
                        <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center text-5xl">📝</div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3 text-xs font-bold tracking-widest uppercase">
                        <span className="text-orange-500">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-gray-400">By {blog.author}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-snug">{blog.title}</h2>
                    <div className="text-gray-600 mb-6 flex-1 text-sm leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
