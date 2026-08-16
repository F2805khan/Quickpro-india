import { supabase } from "./config/supabase.js";

async function testUpdate() {
  const { data: bookings } = await supabase.from('bookings').select('booking_number').limit(1);
  if (!bookings || !bookings.length) return console.log("No bookings found");
  
  const bn = bookings[0].booking_number;
  
  const statuses = [
    "Confirmed",
    "Professional Assigned",
    "Professional assigned",
    "professional_assigned",
    "Assigned",
    "assigned",
    "On The Way",
    "on_the_way",
    "Service In Progress",
    "in_progress",
    "Completed",
    "Cancelled",
    "Pending",
    "pending"
  ];
  
  for (const status of statuses) {
    const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('booking_number', bn);
    if (error) {
      if (error.message.includes('check constraint')) {
        console.log(`❌ FAILED (Constraint): ${status}`);
      } else {
        console.log(`❓ FAILED (Other error for ${status}):`, error.message);
      }
    } else {
      console.log(`✅ SUCCESS: ${status}`);
    }
  }
  process.exit(0);
}

testUpdate();
