import { Booking } from "./models/index.js";
import { supabase } from "./config/supabase.js";

async function test() {
  const { data, error } = await supabase.from('bookings').select('booking_status').limit(10);
  console.log("Existing statuses:", data);
  process.exit(0);
}

test();
