import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('health_check').select('*');
  if (error) {
    console.error('Error:', error.message);
    const { data: d2, error: e2 } = await supabase.from('healthcheck').select('*');
    if (e2) console.error('Error healthcheck:', e2.message);
    else console.log('Data healthcheck:', d2);
  } else {
    console.log('Data health_check:', data);
  }
}
check();
