import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminIdParam = searchParams.get('admin_id');

        let query = supabase
            .from('combo_offers')
            .select('*')
            .order('created_at', { ascending: false });

        if (adminIdParam) {
            const adminId = Number(adminIdParam);
            if (adminId === 1) {
                query = query.or('admin_id.eq.1,admin_id.is.null');
            } else {
                query = query.eq('admin_id', adminId);
            }
        }

        let { data: offers, error } = await query;

        // If error is code 42703 (admin_id column does not exist yet), fallback safely
        if (error && error.code === '42703') {
            if (adminIdParam && Number(adminIdParam) !== 1) {
                return NextResponse.json([]);
            }
            const fallback = await supabase
                .from('combo_offers')
                .select('*')
                .order('created_at', { ascending: false });
            offers = fallback.data;
            error = fallback.error;
        }
            
        if (error) throw error;
        
        return NextResponse.json(offers || []);
    } catch (e: any) {
        console.error("GET Combo Offers Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS).' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const adminId = Number(body.admin_id) || 1;
        
        // Handle both insert (no ID) and update (has ID)
        let query: any;
        const payload = { ...body, admin_id: adminId };
        
        if (body.id) {
             const { id, ...updateData } = payload;
             query = supabase.from('combo_offers').update(updateData).eq('id', id);
        } else {
             query = supabase.from('combo_offers').insert([payload]);
        }
        
        let { data, error } = await query.select().single();

        // If error 42703 (admin_id column not added yet), retry without admin_id
        if (error && error.code === '42703') {
            if (body.id) {
                const { id, admin_id: _, ...updateData } = payload;
                query = supabase.from('combo_offers').update(updateData).eq('id', id);
            } else {
                const { admin_id: _, ...insertData } = payload;
                query = supabase.from('combo_offers').insert([insertData]);
            }
            const retry = await query.select().single();
            data = retry.data;
            error = retry.error;
        }
            
        if (error) throw error;
        
        return NextResponse.json(data, { status: body.id ? 200 : 201 });
    } catch (e: any) {
        console.error("POST Combo Offers Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        
        const { error } = await supabase.from('combo_offers').delete().eq('id', id);
        if (error) throw error;
        
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("DELETE Combo Offers Error:", e);
        return NextResponse.json({ error: 'Server error', details: e?.message }, { status: 500 });
    }
}
