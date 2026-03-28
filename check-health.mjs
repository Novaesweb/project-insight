import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mvxlbvfryzmocrafhfjp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eGxidmZyeXptb2NyYWZoZmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTgwOTMsImV4cCI6MjA4OTQ5NDA5M30.l3vZib37kooIIMUSdW7dybSYr-4-OsCnq9l0ezyJ2oQ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking health_check...');
  const { data, error } = await supabase.from('health_check').select('*');
  if (error) {
    console.error('Error health_check:', error.message);
  } else {
    console.log('Data health_check:', data);
  }

  console.log('Checking healthcheck...');
  const { data: d2, error: e2 } = await supabase.from('healthcheck').select('*');
  if (e2) {
    console.error('Error healthcheck:', e2.message);
  } else {
    console.log('Data healthcheck:', d2);
  }
}
check();
