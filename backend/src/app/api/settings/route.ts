import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminId = Number(searchParams.get('admin_id')) || 1;

        const { data: settings, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', adminId)
            .maybeSingle();
            
        if (error) {
            throw error;
        }

        if (!settings) {
            // Default fallback if row does not exist yet
            const defaultSettings = adminId === 2 ? {
                id: 2,
                store_name: 'RJ Crackers',
                email: 'rjcrackers@gmail.com',
                phone: '',
                address: 'Sivakasi, Tamil Nadu',
                tax_rate: 0,
                delivery_fee: 0
            } : {
                id: 1,
                store_name: 'RRV crackers',
                email: 'rajeshoffical13@gmail.com',
                phone: '8072083862',
                address: '1 vkm street sivakasi',
                tax_rate: 20,
                delivery_fee: 100
            };
            return NextResponse.json(defaultSettings);
        }
        
        return NextResponse.json(settings);
    } catch (e: any) {
        console.error("GET Settings Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const adminId = Number(body.admin_id) || Number(body.id) || 1;
        
        const settingsData = {
            id: adminId,
            store_name: body.store_name,
            email: body.email,
            phone: body.phone,
            address: body.address,
            tax_rate: body.tax_rate,
            delivery_fee: body.delivery_fee,
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('settings')
            .upsert(settingsData)
            .select()
            .single();
            
        if (error) throw error;
        
        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        console.error("POST Settings Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status });
    }
}
