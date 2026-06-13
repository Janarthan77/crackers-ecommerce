import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://etnmihghnjdshsjbsbnj.supabase.co';
const supabaseKey = 'sb_publishable_L8wUbijRD_eC7A_fi1DKdw_N0MHi4XY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('admin_users').select('*');
    console.log('Data:', data);
    console.log('Error:', error);
}

test();
