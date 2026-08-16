import { Booking, File } from "./models/index.js";
import { supabase } from "./config/supabase.js";

async function test() {
  console.log("Testing relations...");
  const id = '1c9c34c9-9b5f-4768-9db1-d89b27174341'; // From previous test
  
  try {
    console.log("Fetching documents...");
    const docs = await File.findAll({
      where: { ownerId: id, ownerType: 'agent' }
    });
    console.log("Docs:", docs);
    
    console.log("Fetching jobs...");
    const jobs = await Booking.findAll({
      where: { providerId: id }
    });
    console.log("Jobs:", jobs);
  } catch(e) {
    console.error("FAILED!", e);
  }
  
  process.exit(0);
}

test().catch(console.error);
