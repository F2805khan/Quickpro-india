import "./backend/config/env.js";

async function fetchSchema() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL + '/rest/v1/';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  
  const response = await fetch(url, {
    method: 'OPTIONS',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  
  if (!response.ok) {
    console.error("Failed to fetch schema:", response.status, response.statusText);
    return;
  }
  
  const schema = await response.json();
  const agentsProps = schema?.definitions?.agents?.properties;
  
  if (agentsProps) {
    console.log("agents table columns:", Object.keys(agentsProps));
  } else {
    console.log("Could not find agents definition in schema.");
  }
}

fetchSchema();
