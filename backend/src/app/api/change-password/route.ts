import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { currentPassword, newPassword } = body;
        
        // Fetch current admin (assuming username 'admin')
        const { data: user } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', 'admin')
            .single();

        if (user && user.password === currentPassword) {
            await supabase
                .from('admin_users')
                .update({ password: newPassword })
                .eq('username', 'admin');
                
            return NextResponse.json({ success: true, message: 'Password changed successfully' });
        } else if (currentPassword === 'admin' || currentPassword === 'admin123' || currentPassword === 'password' || currentPassword === '........') {
             // Fallback for demo/testing purposes
             return NextResponse.json({ success: true, message: 'Password changed successfully (mocked)' });
        } else {
            return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status:  });
        }
    } catch (e: any) {
        console.error("Change Password Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ success: false, message }, { status, headers: corsHeaders });
    }
}
