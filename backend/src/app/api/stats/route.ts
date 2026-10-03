import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminIdParam = searchParams.get('admin_id');

        let ordersQuery = supabase.from('orders').select('*', { count: 'exact', head: true });
        let revenueQuery = supabase.from('orders').select('overall_total, created_at');

        if (adminIdParam) {
            const adminId = Number(adminIdParam);
            if (adminId === 1) {
                ordersQuery = ordersQuery.or('admin_id.eq.1,admin_id.is.null');
                revenueQuery = revenueQuery.or('admin_id.eq.1,admin_id.is.null');
            } else {
                ordersQuery = ordersQuery.eq('admin_id', adminId);
                revenueQuery = revenueQuery.eq('admin_id', adminId);
            }
        }

        const [ordersRes, productsRes, categoriesRes, revenueRes] = await Promise.all([
            ordersQuery,
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            revenueQuery
        ]);
        
        let ordersCount = ordersRes.count || 0;
        let orders = revenueRes.data || [];

        // Handle fallback if admin_id column doesn't exist yet
        if (ordersRes.error && ordersRes.error.code === '42703') {
            if (adminIdParam && Number(adminIdParam) !== 1) {
                ordersCount = 0;
                orders = [];
            } else {
                const [fbOrders, fbRev] = await Promise.all([
                    supabase.from('orders').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('overall_total, created_at')
                ]);
                ordersCount = fbOrders.count || 0;
                orders = fbRev.data || [];
            }
        } else {
            if (ordersRes.error) throw ordersRes.error;
            if (revenueRes.error) throw revenueRes.error;
        }

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        
        const { count: productsCount } = productsRes;
        const { count: categoriesCount } = categoriesRes;
        
        let revenue = 0;
        
        // Initialize last 6 months
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyStatsObj: Record<string, { name: string; revenue: number; orders: number }> = {};
        
        const d = new Date();
        for (let i = 5; i >= 0; i--) {
            const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
            const key = `${pastDate.getFullYear()}-${pastDate.getMonth()}`;
            monthlyStatsObj[key] = {
                name: monthNames[pastDate.getMonth()],
                revenue: 0,
                orders: 0
            };
        }

        if (orders) {
            orders.forEach((order: any) => {
                const total = order.overall_total || 0;
                revenue += total;
                
                if (order.created_at) {
                    const orderDate = new Date(order.created_at);
                    const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
                    if (monthlyStatsObj[key]) {
                        monthlyStatsObj[key].revenue += total;
                        monthlyStatsObj[key].orders += 1;
                    }
                }
            });
        }
        
        const monthlyStats = Object.values(monthlyStatsObj);
        
        return NextResponse.json({
            totalOrders: ordersCount || 0,
            totalProducts: productsCount || 0,
            totalCategories: categoriesCount || 0,
            revenue: revenue,
            monthlyStats: monthlyStats
        });
    } catch (e: any) {
        console.error("Stats API Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}
