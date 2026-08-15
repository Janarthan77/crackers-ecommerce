import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      env[key] = val;
    }
  }
}

const serviceSupabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY']);
const anonSupabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']);

async function test() {
  console.log('Testing with SERVICE ROLE KEY:');
  let query = serviceSupabase.from('products').select('*').order('id');
  query = query.not('is_paused', 'eq', true);
  const { data: sData, error: sErr } = await query;
  console.log('Products count (service role):', sData ? sData.length : null, 'Error:', sErr);

  console.log('\nTesting with ANON / PUBLISHABLE KEY:');
  const { data: aData, error: aErr } = await anonSupabase.from('products').select('*');
  console.log('Products count (anon key):', aData ? aData.length : null, 'Error:', aErr);

  const { data: cData, error: cErr } = await anonSupabase.from('categories').select('*');
  console.log('Categories count (anon key):', cData ? cData.length : null, 'Error:', cErr);
}

test();
