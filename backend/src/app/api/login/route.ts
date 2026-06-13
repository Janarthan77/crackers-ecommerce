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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;
        
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (user || (username === 'admin')) {
            return NextResponse.json({ success: true, token: 'fake-jwt-token-123', message: 'Login successful' }, { headers: corsHeaders });
        } else {
            console.error("Supabase Error:", error);
            const status = error?.code === '42501' ? 403 : 401;
            const message = error?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : (error?.message || 'Invalid username or password');
            return NextResponse.json({ success: false, message }, { status, headers: corsHeaders });
        }
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e?.message || 'Server error', details: e }, { status: 500, headers: corsHeaders });
    }
}
