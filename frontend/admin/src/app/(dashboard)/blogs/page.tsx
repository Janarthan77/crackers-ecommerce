'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit, Trash2 } from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  content: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', image_url: '', is_published: true });
  const [isUploading, setIsUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/blogs`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch');
      }
      const data = await res.json();
      setBlogs(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setFormData({ ...formData, image_url: data.url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Title is required');

    try {
      const url = editingBlog
        ? `${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/blogs/${editingBlog.id}`
        : `${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/blogs`;

      const method = editingBlog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast.success(editingBlog ? 'Blog updated' : 'Blog published');
      setIsModalOpen(false);
      setEditingBlog(null);
      setFormData({ title: '', content: '', image_url: '', is_published: false });
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save blog');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      toast.success('Blog deleted');
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete blog');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} blogs?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/blogs/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Blogs deleted successfully');
      setSelectedIds([]);
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to delete blogs');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>, paginatedItems: any[]) => {
    if (e.target.checked) {
      const newIds = paginatedItems.map(item => item.id);
      setSelectedIds([...new Set([...selectedIds, ...newIds])]);
    } else {
      const paginatedIds = paginatedItems.map(item => item.id);
      setSelectedIds(selectedIds.filter(id => !paginatedIds.includes(id)));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content || '',
      image_url: blog.image_url || '',
      is_published: blog.is_published
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingBlog(null);
    setFormData({ title: '', content: '', image_url: '', is_published: true });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-up">
        <h1 className="page-title">Blogs Management</h1>
        <div className="stat-card p-12 text-center animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 animate-fade-up pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="page-title text-xl md:text-2xl mb-0">Blogs Management</h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage your articles.</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #2563EB)' }}
          >
            + Create Blog
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search blogs..."
              className="w-full sm:w-64 outline-none text-sm"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-end">
            <span>Show:</span>
            <select
              className="border border-gray-200 rounded-lg px-2 py-1 outline-none"
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex justify-between items-center animate-fade-up mt-4">
            <span className="text-red-700 font-semibold">{selectedIds.length} items selected</span>
            <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
              Delete Selected
            </button>
          </div>
        )}

        <div className="stat-card overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="p-4 w-12 border-r border-gray-100"></th>
                  <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider w-16">ID</th>
                  <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider w-32 text-center">Status</th>
                  <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider w-40">Created</th>
                  <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredBlogs = blogs.filter(b =>
                    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.id.toString().includes(searchQuery)
                  );
                  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
                  const paginatedBlogs = filteredBlogs.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  );

                  return (
                    <>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <td className="p-2 pl-4 border-r border-gray-100 text-center">
                          <input type="checkbox"
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                            onChange={(e) => handleSelectAll(e, paginatedBlogs)}
                            checked={paginatedBlogs.length > 0 && paginatedBlogs.every(b => selectedIds.includes(b.id))}
                          />
                        </td>
                        <td colSpan={5} className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Select All on this page</td>
                      </tr>
                      {paginatedBlogs.map((blog) => (
                        <tr key={blog.id} className={`border-b border-gray-50 transition-colors ${selectedIds.includes(blog.id) ? 'bg-orange-50/50' : 'hover:bg-blue-50/30'}`}>
                          <td className="p-4 border-r border-gray-50 text-center">
                            <input type="checkbox"
                              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                              checked={selectedIds.includes(blog.id)}
                              onChange={() => handleSelectItem(blog.id)}
                            />
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-500">#{blog.id}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {blog.image_url ? (
                                <img src={blog.image_url} alt={blog.title} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                              )}
                              <span className="text-sm font-bold text-gray-800">{blog.title}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${blog.is_published ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                              {blog.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(blog.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm text-right space-x-2">
                            <button onClick={() => openEditModal(blog)} className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors" title="Edit">
                              <Edit size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => handleDelete(blog.id)} className="inline-flex p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paginatedBlogs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-gray-400">
                            <div className="text-4xl mb-3">📝</div>
                            <p>No blogs found.</p>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>

          {/* Pagination controls inside stat-card footer */}
          {(() => {
            const filteredCount = blogs.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toString().includes(searchQuery)).length;
            const totalPages = Math.ceil(filteredCount / itemsPerPage);
            return (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 gap-4 bg-white text-sm">
                <div className="text-gray-500">
                  Showing {filteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCount)} of {filteredCount} entries
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 font-semibold transition-colors">Previous</button>
                  <span className="font-semibold text-gray-700 px-2">Page {currentPage} of {totalPages || 1}</span>
                  <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 font-semibold transition-colors">Next</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-8 animate-fade-up my-auto h-max">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingBlog ? 'Edit Blog' : 'Create New Blog'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Blog Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 font-medium"
                  placeholder="e.g. Top 10 Crackers for Diwali"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Image</label>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="w-full border border-gray-200 rounded-xl p-2 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {isUploading && (
                    <div className="flex items-center justify-center px-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                {formData.image_url && (
                  <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 font-medium resize-none min-h-[150px]"
                  placeholder="Write your amazing content here..."
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_published" className="text-sm font-bold text-gray-700 cursor-pointer">
                  Publish immediately?
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-100 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ background: 'linear-gradient(135deg, #0EA5E9, #2563EB)' }}
                >
                  {editingBlog ? 'Update Blog' : 'Publish Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
