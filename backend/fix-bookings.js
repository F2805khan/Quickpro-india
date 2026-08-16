import { supabase } from "./config/supabase.js";

async function checkBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_status")
    .eq("booking_status", "Professional Assigned");
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Bookings with 'Professional Assigned':", data);
    
    if (data.length > 0) {
      // Let's fix them
      for (const b of data) {
        const { error: updErr } = await supabase
          .from("bookings")
          .update({ booking_status: "Assigned" })
          .eq("id", b.id);
        if (updErr) console.error("Update error for", b.id, updErr);
        else console.log("Fixed", b.id);
      }
    }
  }
  process.exit(0);
}

checkBookings();
