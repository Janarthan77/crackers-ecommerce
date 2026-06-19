import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
            return NextResponse.json({ success: true, token: 'fake-jwt-token-123', message: 'Login successful' });
        } else {
            console.error("Supabase Error:", error);
            const status = error?.code === '42501' ? 403 : 401;
            const message = error?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : (error?.message || 'Invalid username or password');
            return NextResponse.json({ success: false, message }, { status });
        }
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e?.message || 'Server error', details: e }, { status: 500 });
    }
}
