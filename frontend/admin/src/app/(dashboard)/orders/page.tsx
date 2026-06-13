'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Eye, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  originalPrice?: number;
}

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
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [selectedOrderView, setSelectedOrderView] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openOrderModal = (order: Order) => {
    setSelectedOrderView(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrderView(null);
    setIsModalOpen(false);
  };

  const generateInvoicePDF = (order: Order) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(234, 88, 12); // Orange
    doc.text('Rupika Crackers', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Invoice / Bill of Supply', 14, 28);
    doc.text(`Order ID: #${order.id}`, 14, 34);
    doc.text(`Date: ${order.createdAt}`, 14, 40);

    // Customer Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Bill To:', 14, 55);
    doc.setFontSize(10);
    doc.text(`Name: ${order.name}`, 14, 62);
    doc.text(`Mobile: ${order.mobile}`, 14, 68);
    doc.text(`Address: ${order.city}, ${order.state}`, 14, 74);

    // Items Table
    const tableColumn = ["Item", "Unit Price", "Qty", "Total"];
    const tableRows: any[] = [];

    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const itemData = [
          item.name,
          `Rs. ${item.price}`,
          item.quantity.toString(),
          `Rs. ${item.price * item.quantity}`
        ];
        tableRows.push(itemData);
      });
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12] }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 85;

    // Totals
    doc.setFontSize(10);
    doc.text(`Total Amount: Rs. ${order.netTotal}`, 140, finalY + 10);
    doc.text(`Discount: Rs. ${order.discountTotal}`, 140, finalY + 16);
    doc.setFontSize(12);
    doc.setFont('', 'bold');
    doc.text(`Net Payable: Rs. ${order.overallTotal}`, 140, finalY + 24);

    doc.save(`Invoice_Order_${order.id}.pdf`);
  };

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
    <>
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
                  <th className="p-4 font-semibold text-sm text-gray-500 text-center">Action</th>
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
                        <td colSpan={6} className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Select All on this page</td>
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
                                    order.status === 'processing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                      'bg-gray-50 text-gray-500 border-gray-300'
                                }
                              `}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => openOrderModal(order)} className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                                <Eye className="w-4 h-4" /> View
                              </button>
                              <button onClick={() => generateInvoicePDF(order)} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                                <FileText className="w-4 h-4" /> PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400">No orders found.</td>
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

        {/* End of animate-fade-up wrapper */}
      </div>

      {isModalOpen && selectedOrderView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] shadow-2xl flex flex-col overflow-hidden animate-fade-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h2 className="text-2xl font-black text-gray-800">Order Details #{selectedOrderView.id}</h2>
              <button onClick={closeOrderModal} className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-10 flex-1 overflow-y-auto space-y-8 bg-gray-50/30">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="block text-gray-500 mb-1 font-semibold uppercase tracking-wider text-xs">Customer Name</span>
                  <strong className="text-gray-900 text-lg">{selectedOrderView.name}</strong>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1 font-semibold uppercase tracking-wider text-xs">Mobile</span>
                  <strong className="text-gray-900 text-lg">{selectedOrderView.mobile}</strong>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-gray-500 mb-1 font-semibold uppercase tracking-wider text-xs">Delivery Address</span>
                  <strong className="text-gray-900 text-base">{selectedOrderView.city}, {selectedOrderView.state}</strong>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-3 text-lg flex items-center gap-2">
                  <span className="text-orange-500">🛒</span> Order Items
                </h3>
                {selectedOrderView.items && selectedOrderView.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-y border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                          <th className="p-3 font-bold rounded-tl-lg">Item Name</th>
                          <th className="p-3 font-bold text-center">Unit Price</th>
                          <th className="p-3 font-bold text-center">Quantity</th>
                          <th className="p-3 font-bold text-right rounded-tr-lg">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrderView.items.map((item, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                            <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                            <td className="p-4 text-center text-gray-600">₹{item.price}</td>
                            <td className="p-4 text-center font-bold text-gray-800">{item.quantity}</td>
                            <td className="p-4 text-right font-bold text-green-700">₹{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <div className="text-4xl mb-3 opacity-50">📦</div>
                    No items found for this order
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-end">
                <div className="flex flex-col items-end gap-3 text-sm w-full max-w-sm">
                  <div className="w-full flex justify-between items-center">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Gross Total</span>
                    <strong className="text-gray-800 text-base">₹{selectedOrderView.netTotal}</strong>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Discount</span>
                    <strong className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md">- ₹{selectedOrderView.discountTotal}</strong>
                  </div>
                  <div className="w-full flex justify-between items-center mt-3 pt-3 border-t-2 border-gray-100 border-dashed">
                    <span className="font-black text-gray-800 uppercase tracking-widest">Net Payable</span>
                    <strong className="text-red-600 text-2xl font-black">₹{selectedOrderView.overallTotal}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-4 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={() => generateInvoicePDF(selectedOrderView)} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <Download className="w-4 h-4" /> Download PDF Invoice
              </button>
              <button onClick={closeOrderModal} className="px-6 py-2.5 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
