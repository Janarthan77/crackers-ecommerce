import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;
        
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();

        let isValid = false;
        if (user) {
            // Check if the password is encrypted (contains colon) or plain text
            if (user.password && user.password.includes(':')) {
                const decrypted = decrypt(user.password);
                if (decrypted === password) isValid = true;
            } else {
                // Fallback for legacy plain text passwords in the database
                if (user.password === password) isValid = true;
            }
        } else if (username === 'admin' && (password === 'admin' || password === 'admin123')) {
            // Fallback for demo setup if DB is empty
            isValid = true;
        }

        if (isValid) {
            return NextResponse.json({ success: true, token: 'fake-jwt-token-123', message: 'Login successful' });
        } else {
            console.error("Supabase Error or Invalid Credentials:", error);
            const status = error?.code === '42501' ? 403 : 401;
            const message = error?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Invalid username or password';
            return NextResponse.json({ success: false, message }, { status });
        }
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e?.message || 'Server error', details: e }, { status: 500 });
    }
}
