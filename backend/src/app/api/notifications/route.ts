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
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return NextResponse.json(notifications || [], { headers: corsHeaders });
    } catch (e: any) {
        console.error("GET Notifications Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, message } = body;
        
        const { data: newNotification, error } = await supabase
            .from('notifications')
            .insert([{ 
                title, 
                message, 
                is_read: false,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(newNotification, { status: 201, headers: corsHeaders });
    } catch (e: any) {
        console.error("POST Notifications Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const msg = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: msg, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}
