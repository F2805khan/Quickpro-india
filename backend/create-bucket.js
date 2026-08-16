import { supabase } from "./config/supabase.js";

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('agent_documents', {
    public: false,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf'],
    fileSizeLimit: 5242880
  });
  if (error) {
    console.error("Error creating bucket:", error);
  } else {
    console.log("Bucket created successfully:", data);
  }
  process.exit(0);
}

createBucket();
