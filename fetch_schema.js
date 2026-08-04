import "./backend/config/env.js";

async function fetchSchema() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL + '/rest/v1/');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  
  // Fetch the OpenAPI spec
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  
  if (!response.ok) {
    console.error("Failed:", response.status, await response.text());
    return;
  }
  
  const schema = await response.json();
  const agentsDef = schema?.definitions?.agents?.properties;
  
  if (agentsDef) {
    console.log("Agents table columns:", Object.keys(agentsDef));
  } else {
    console.log("agents definition not found in OpenAPI spec.");
    console.log("Definitions available:", Object.keys(schema?.definitions || {}));
  }
}

fetchSchema();
