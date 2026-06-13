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
        const { data: settings, error } = await supabase
            .from('settings')
            .select('*')
            .limit(1)
            .single();
            
        if (error && error.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows"
            throw error;
        }
        
        return NextResponse.json(settings || {}, { headers: corsHeaders });
    } catch (e: any) {
        console.error("GET Settings Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // We assume there's always one row, let's say ID 1
        // If it doesn't exist, upsert will create it.
        const settingsData = {
            id: 1,
            store_name: body.store_name,
            email: body.email,
            phone: body.phone,
            address: body.address,
            tax_rate: body.tax_rate,
            delivery_fee: body.delivery_fee,
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('settings')
            .upsert(settingsData)
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(data, { status: 200, headers: corsHeaders });
    } catch (e: any) {
        console.error("POST Settings Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}
