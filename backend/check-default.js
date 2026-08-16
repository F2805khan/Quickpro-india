import { supabase } from "./config/supabase.js";

async function checkDefault() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'bookings' });
  console.log("RPC Error:", error);
  process.exit(0);
}

checkDefault();
