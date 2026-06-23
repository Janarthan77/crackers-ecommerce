"use client";

import { useEffect, useState } from 'react';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

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
    <div className="w-full flex flex-col bg-[#111111] min-h-screen">
      
      {/* Header */}
      <section className="pt-20 pb-12 px-4 text-center">
        <h1 className="text-5xl font-black text-[#E5E5E5] mb-4 font-display">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA8222]">Blogs</span></h1>
        <p className="text-gray-400 max-w-lg mx-auto">Stay up to date with the latest news, festival tips, and announcements from RRV Crackers.</p>
      </section>

      {/* Blogs Grid */}
      <section className="pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-[#D4AF37] animate-pulse">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
               <div className="text-6xl mb-4">📝</div>
               <p className="text-lg">No blogs found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {blogs.map((blog) => (
                <article key={blog.id} className="bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)] transition-all duration-500 border border-[#D4AF37]/20 flex flex-col group hover:-translate-y-2 cursor-pointer" onClick={() => setSelectedBlog(blog)}>
                  <div className="h-64 bg-[#0A0A0A] relative overflow-hidden border-b border-[#D4AF37]/10">
                    {blog.image_url ? (
                        <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0A0A0A] to-[#111111] flex items-center justify-center text-5xl opacity-50 group-hover:opacity-100 transition-opacity">📝</div>
                    )}
                    <div className="absolute top-4 right-4 bg-[#0A0A0A]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold tracking-widest uppercase shadow-lg">
                      {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1 relative bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A]">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-widest uppercase text-gray-500">
                      <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">{blog.author?.charAt(0) || 'A'}</span>
                      <span>By {blog.author || 'Admin'}</span>
                    </div>
                    
                    <h2 className="text-2xl font-black text-[#E5E5E5] mb-4 leading-tight group-hover:text-[#D4AF37] transition-colors line-clamp-2">{blog.title}</h2>
                    
                    <div className="text-gray-400 mb-8 text-sm leading-relaxed line-clamp-4 prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
                    
                    <div className="mt-auto border-t border-[#D4AF37]/10 pt-5">
                      <span className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase group-hover:text-white transition-colors flex items-center gap-2">
                        Read Full Blog <span className="text-lg group-hover:translate-x-2 transition-transform">→</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setSelectedBlog(null)}>
          <div 
            className="bg-[#111111] rounded-3xl w-full max-w-4xl min-h-[50vh] max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#D4AF37]/30 relative animate-fade-up my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-[#D4AF37] hover:text-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20 hover:border-[#D4AF37]"
            >
              &times;
            </button>

            {selectedBlog.image_url && (
              <div className="w-full h-80 relative border-b border-[#D4AF37]/20">
                <img src={selectedBlog.image_url} alt={selectedBlog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"></div>
              </div>
            )}

            <div className={`p-8 md:p-12 ${!selectedBlog.image_url ? 'pt-16' : ''}`}>
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-bold tracking-widest uppercase text-[#D4AF37]">
                <span>{new Date(selectedBlog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50"></span>
                <span>By {selectedBlog.author || 'Admin'}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-[#E5E5E5] mb-10 leading-tight font-display">{selectedBlog.title}</h1>
              
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-[#D4AF37] prose-a:text-[#D4AF37] text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
