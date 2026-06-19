import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: blogs, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return NextResponse.json(blogs || []);
    } catch (e: any) {
        console.error("GET Blogs Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, image_url, is_published } = body;
        
        const { data: newBlog, error } = await supabase
            .from('blogs')
            .insert([{ 
                title, 
                content, 
                image_url, 
                is_published: is_published || false,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(newBlog, { status: 201 });
    } catch (e: any) {
        console.error("POST Blogs Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}
