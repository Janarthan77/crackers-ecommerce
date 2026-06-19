import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { categoryId, name, price, discount, image, stock } = body;
        
        const { data, error } = await supabase
            .from('products')
            .update({ category: categoryId, name, price, discount: discount || 0, image_url: image, stock: stock || 0 })
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(data);
    } catch (e: any) {
        console.error("PUT Error:", e);
        return NextResponse.json({ error: 'Server error', details: e?.message || e }, { status:  });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("DELETE Error:", e);
        return NextResponse.json({ error: 'Server error', details: e?.message || e }, { status:  });
    }
}
