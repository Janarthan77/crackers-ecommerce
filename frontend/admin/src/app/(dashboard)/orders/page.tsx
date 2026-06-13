'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  name: string;
  mobile: string;
  state: string;
  city: string;
  netTotal: number;
  discountTotal: number;
  overallTotal: number;
  createdAt: string;
  status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} orders?`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/orders/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Orders deleted successfully');
      setSelectedIds([]);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to delete orders');
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

  if (loading) return <div className="p-6 text-center animate-pulse">Loading orders...</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="page-title text-xl md:text-2xl">Order Management</h1>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search orders..." 
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
        <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex justify-between items-center animate-fade-up">
          <span className="text-red-700 font-semibold">{selectedIds.length} items selected</span>
          <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
            Delete Selected
          </button>
        </div>
      )}

      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 w-12 border-r border-gray-100"></th>
                <th className="p-4 font-semibold text-sm text-gray-500">Order ID</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Date</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Customer Details</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Total Amount</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredOrders = orders.filter(o => 
                  o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  o.mobile.includes(searchQuery) ||
                  o.id.toString().includes(searchQuery)
                );
                const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
                const paginatedOrders = filteredOrders.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                );

                return (
                  <>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <td className="p-2 pl-4 border-r border-gray-100 text-center">
                        <input type="checkbox" 
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                          onChange={(e) => handleSelectAll(e, paginatedOrders)} 
                          checked={paginatedOrders.length > 0 && paginatedOrders.every(o => selectedIds.includes(o.id))} 
                        />
                      </td>
                      <td colSpan={5} className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Select All on this page</td>
                    </tr>
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className={`border-b border-gray-50 transition-colors ${selectedIds.includes(order.id) ? 'bg-orange-50/50' : 'hover:bg-orange-50/30'}`}>
                  <td className="p-4 border-r border-gray-50 text-center">
                    <input type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => handleSelectItem(order.id)}
                    />
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600">#{order.id}</td>
                  <td className="p-4 text-sm text-gray-600">{order.createdAt}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-h)' }}>{order.name}</span>
                      <span className="text-xs text-gray-500">{order.mobile}</span>
                      <span className="text-xs text-gray-400">{order.city}, {order.state}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-green-600">₹{order.overallTotal}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-sm font-semibold rounded-full px-3 py-1 border outline-none cursor-pointer transition-colors
                        ${order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-yellow-50 text-yellow-700 border-yellow-200'}
                      `}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No orders found.</td>
                </tr>
              )}
              </>
            );})()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls inside stat-card footer */}
        {(() => {
          const filteredCount = orders.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.mobile.includes(searchQuery) || o.id.toString().includes(searchQuery)).length;
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
  );
}
