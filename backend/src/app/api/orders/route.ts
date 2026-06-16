import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

async function sendTelegramNotification(orderData: any, orderId: number) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn('Telegram notifications are not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID).');
        return;
    }

    const message = `
🛍️ <b>NEW ORDER RECEIVED!</b> 🛍️
━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID</b>: #${orderId}
👤 <b>Customer</b>: ${orderData.name}
📱 <b>Mobile</b>: ${orderData.mobile}
📍 <b>Location</b>: ${orderData.city}, ${orderData.state}
━━━━━━━━━━━━━━━━━━
💰 <b>Gross Total</b>: ₹${orderData.net_total}
📉 <b>Discount</b>: -₹${orderData.discount_total}
💳 <b>Net Payable</b>: ₹${orderData.overall_total}
━━━━━━━━━━━━━━━━━━
📦 <b>Total Items</b>: ${orderData.items ? orderData.items.length : 0}
`.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401) {
                console.warn('Telegram notification skipped: TELEGRAM_BOT_TOKEN is unauthorized or invalid (401).');
            } else if (response.status === 400 && (errorText.includes('chat not found') || errorText.includes('invalid chat'))) {
                console.warn('Telegram notification skipped: TELEGRAM_CHAT_ID is invalid or not found.');
            } else {
                console.error('Failed to send Telegram notification:', errorText);
            }
        } else {
            console.log('Telegram notification sent successfully for Order #', orderId);
        }
    } catch (err) {
        console.warn('Error connecting to Telegram API:', err);
    }
}

export async function GET() {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        // Format to match old structure
        const formattedOrders = orders.map((o: any) => ({
            id: o.id,
            name: o.name,
            mobile: o.mobile,
            state: o.state,
            city: o.city,
            netTotal: o.net_total,
            discountTotal: o.discount_total,
            overallTotal: o.overall_total,
            createdAt: o.created_at,
            status: o.status,
            items: o.items || []
        }));

        return NextResponse.json(formattedOrders, { headers: corsHeaders });
    } catch (e: any) {
        console.error("GET Orders Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS). Please check your service role key.' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Fetch the max ID currently in the table to fix any sequence synchronization issues
        const { data: maxOrderData } = await supabase
            .from('orders')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();

        const nextId = (maxOrderData?.id || 0) + 1;

        const newOrderData = {
            id: nextId,
            name: body.name,
            mobile: body.mobile,
            state: body.state,
            city: body.city,
            net_total: body.netTotal,
            discount_total: body.discountTotal,
            overall_total: body.overallTotal,
            created_at: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'pending',
            items: body.items || []
        };

        const { data: newOrder, error } = await supabase
            .from('orders')
            .insert([newOrderData])
            .select()
            .single();

        if (error) throw error;

        // Send a Telegram notification in the background
        sendTelegramNotification(newOrderData, newOrder.id).catch(console.error);

        return NextResponse.json(newOrder, { status: 201, headers: corsHeaders });
    } catch (e: any) {
        console.error("POST Orders Error:", e);
        const status = e?.code === '42501' ? 403 : 500;
        const message = e?.code === '42501' ? 'Supabase Permission Denied (RLS)' : 'Server error';
        return NextResponse.json({ error: message, details: e?.message || String(e) }, { status, headers: corsHeaders });
    }
}
