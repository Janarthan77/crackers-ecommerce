'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function RevenueChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full min-h-[300px] bg-gray-50/50 rounded-2xl animate-pulse" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E8192C" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#E8192C" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#9B7E6A', fontWeight: 600 }}
          dy={10}
        />
        <YAxis 
          yAxisId="left"
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#9B7E6A', fontWeight: 600 }}
          tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#9B7E6A', fontWeight: 600 }}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '16px', 
            border: 'none', 
            boxShadow: '0 8px 32px rgba(232,25,44,0.1)',
            fontWeight: 'bold',
            fontFamily: "'Poppins', sans-serif"
          }} 
          itemStyle={{ fontWeight: 600 }}
          formatter={(value: any, name: any) => {
            if (name === 'revenue' && value !== undefined) return [`₹${Number(value).toLocaleString()}`, 'Revenue'];
            return [value, 'Orders'];
          }}
          labelStyle={{ color: '#1A0A00', marginBottom: '8px' }}
        />
        <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-sm font-semibold text-gray-700 capitalize">{value}</span>}
        />
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey="revenue" 
          name="revenue"
          stroke="#E8192C" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
          activeDot={{ r: 6, fill: '#E8192C', stroke: '#fff', strokeWidth: 2 }}
        />
        <Area 
          yAxisId="right"
          type="monotone" 
          dataKey="orders" 
          name="orders"
          stroke="#16A34A" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorOrders)" 
          activeDot={{ r: 6, fill: '#16A34A', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
