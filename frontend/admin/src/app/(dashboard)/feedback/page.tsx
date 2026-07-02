'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Feedback {
  id: number;
  name: string;
  rating: number;
  message: string;
  created_at: string;
}

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENTPOINT}/api/feedback`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      toast.error('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) return <div className="p-6 text-center animate-pulse">Loading responses...</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="page-title text-xl md:text-2xl">Customer Responses</h1>
      </div>

      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-sm text-gray-500">Date</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Customer Name</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Rating</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Message</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">No responses found.</td>
                </tr>
              ) : (
                feedbacks.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(f.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-bold" style={{ color: 'var(--text-h)' }}>
                      {f.name}
                    </td>
                    <td className="p-4 text-sm font-semibold text-orange-500">
                      {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                    </td>
                    <td className="p-4 text-sm text-gray-700 min-w-[300px]">
                      {f.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
