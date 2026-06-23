import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: feedbacks, error } = await supabase
            .from('feedbacks')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return NextResponse.json(feedbacks);
    } catch (e: any) {
        console.error("GET Feedbacks Error:", e);
        return NextResponse.json({ error: 'Server error', details: e?.message || String(e) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, rating, message } = body;
        
        if (!name || !rating || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: newFeedback, error } = await supabase
            .from('feedbacks')
            .insert([{ name, rating, message }])
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(newFeedback, { status: 201 });
    } catch (e: any) {
        console.error("POST Feedback Error:", e);
        return NextResponse.json({ error: 'Server error', details: e?.message || String(e) }, { status: 500 });
    }
}
