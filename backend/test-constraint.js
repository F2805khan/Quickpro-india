import { supabase } from "./config/supabase.js";

async function checkConstraint() {
  const { data, error } = await supabase.rpc('query_constraints', {});
  console.log(data, error);
}

checkConstraint();
