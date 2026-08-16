import { Agent } from "./models/index.js";
import { supabase } from "./config/supabase.js";

async function test() {
  console.log("Fetching agents...");
  const agents = await Agent.findAll({ limit: 1 });
  console.log("First agent:", agents[0]);
  
  if (agents.length > 0) {
    const id = agents[0]._id || agents[0].id;
    console.log("Fetching agent with ID:", id);
    const agent = await Agent.findByPk(id);
    console.log("findByPk result:", agent);
    
    const { data, error } = await supabase.from("agents").select("*").eq("id", id);
    console.log("Direct supabase result:", data, error);
  }
  process.exit(0);
}

test().catch(console.error);
