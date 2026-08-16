import { config } from 'dotenv';
config({ path: 'D:/quickpro india/backend/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const { data, error } = await supabase.from('agents').insert({ name: 'Test Temporary Agent', phone: '0000000000' }).select();
  if (error) {
    console.error("Error inserting/inspecting:", error);
  } else {
    console.log("Agents table columns:", Object.keys(data[0]));
    // Clean up
    await supabase.from('agents').delete().eq('id', data[0].id);
  }
}
inspect();
