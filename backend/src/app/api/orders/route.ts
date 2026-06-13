import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('id', { ascending: false });
            
        if (error) throw error;
        
        // Format to match old structure
        const formattedOrders = orders.map((o: any) => ({
            id: o.id,
            name: o.name,
            mobile: o.mobile,
            state: o.state,
            city: o.city,
            netTotal: o.net_total,
            discountTotal: o.discount_total,
            overallTotal: o.overall_total,
            createdAt: o.created_at,
            status: o.status,
            items: o.items || []
        }));
        
        return NextResponse.json(formattedOrders, { headers: corsHeaders });
    } catch (e: any) {
        console.error("GET Orders Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const newOrderData = {
            name: body.name,
            mobile: body.mobile,
            state: body.state,
            city: body.city,
            net_total: body.netTotal,
            discount_total: body.discountTotal,
            overall_total: body.overallTotal,
            created_at: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'pending',
            items: body.items || []
        };
        
        const { data: newOrder, error } = await supabase
            .from('orders')
            .insert([newOrderData])
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(newOrder, { status: 201, headers: corsHeaders });
    } catch (e: any) {
        console.error("POST Orders Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}
