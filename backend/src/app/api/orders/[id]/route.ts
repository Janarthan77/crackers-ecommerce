import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;
        
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(data);
    } catch (e: any) {
        console.error("PUT Orders Error:", e);
        return NextResponse.json({ error: 'Server error', details: e?.message || e }, { status:  });
    }
}
