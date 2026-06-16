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
        const { data: offers, error } = await supabase
            .from('combo_offers')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return NextResponse.json(offers, { headers: corsHeaders });
    } catch (e: any) {
        console.error("GET Combo Offers Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS).' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Handle both insert (no ID) and update (has ID)
        let query: any;
        
        if (body.id) {
             const { id, ...updateData } = body;
             query = supabase.from('combo_offers').update(updateData).eq('id', id);
        } else {
             query = supabase.from('combo_offers').insert([body]);
        }
        
        const { data, error } = await query.select().single();
            
        if (error) throw error;
        
        return NextResponse.json(data, { status: body.id ? 200 : 201, headers: corsHeaders });
    } catch (e: any) {
        console.error("POST Combo Offers Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400, headers: corsHeaders });
        
        const { error } = await supabase.from('combo_offers').delete().eq('id', id);
        if (error) throw error;
        
        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (e: any) {
        console.error("DELETE Combo Offers Error:", e);
        return NextResponse.json({ error: 'Server error', details: e?.message }, { status: 500, headers: corsHeaders });
    }
}
