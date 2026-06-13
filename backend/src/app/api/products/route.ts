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
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('id');
            
        if (error) throw error;
        
        // Map from the user's custom Supabase columns back to what the frontend expects
        const formattedProducts = products.map((p: any) => ({
            id: p.id,
            categoryId: parseInt(p.category) || p.category, // using 'category' based on user's table
            name: p.name,
            price: p.price,
            discount: p.discount || 0,
            image: p.image_url,
            stock: p.stock || 0
        }));
        
        return NextResponse.json(formattedProducts, { headers: corsHeaders });
    } catch (e: any) {
        console.error("GET Products Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryId, name, price, discount, image, stock } = body;
        
        const { data: newProduct, error } = await supabase
            .from('products')
            .insert([{ category: categoryId, name, price, discount: discount || 0, image_url: image, stock: stock || 0 }])
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(newProduct, { status: 201, headers: corsHeaders });
    } catch (e: any) {
        console.error("POST Products Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}

