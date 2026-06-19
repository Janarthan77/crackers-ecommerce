import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: Request) {
    try {
        const { ids } = await request.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status:  });
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .in('id', ids);

        if (error) throw error;

        return NextResponse.json({ message: 'Products deleted successfully' });
    } catch (e: any) {
        console.error("Bulk Delete Products Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}
