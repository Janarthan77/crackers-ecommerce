import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('id');

        if (error) throw error;

        return NextResponse.json(categories || []);
    } catch (e: any) {
        console.error("GET Categories Error:", e.message);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        const { data: newCategory, error } = await supabase
            .from('categories')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(newCategory, { status: 201 });
    } catch (e: any) {
        console.error("POST Categories Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}
