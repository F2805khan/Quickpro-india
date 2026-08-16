import { AgentStats } from "./models/index.js";
import { supabase } from "./config/supabase.js";

async function test() {
  console.log("Testing AgentStats...");
  const id = '1c9c34c9-9b5f-4768-9db1-d89b27174341'; // From previous test
  
  try {
    console.log("Fetching stats...");
    const stats = await AgentStats.findByPk(id);
    console.log("Stats:", stats);
  } catch(e) {
    console.error("FAILED TO FETCH STATS:", e);
  }
  
  try {
    const { data, error } = await supabase.from('agent_stats').select('*').eq('agent_id', id);
    console.log("Direct supabase fetch:", { data, error });
  } catch(e) {
    console.error("Direct fetch failed:", e);
  }
  
  process.exit(0);
}

test().catch(console.error);
