import { config } from 'dotenv';
config({path: 'D:/quickpro india/backend/.env'});
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const servicesToSeed = [
  { service_name: "Microwave Repair", category: "Repairs", description: "Fix heating issues, display errors, and keypad problems.", price: 299, duration: "45 mins", image_url: "/images/site/appliance-repair.jpg", is_active: true },
  { service_name: "Full Home Painting", category: "Maintenance", description: "Complete interior and exterior painting services.", price: 9999, duration: "Visit required", image_url: "/images/site/painting.jpg", is_active: true },
  { service_name: "Termite Control", category: "Cleaning", description: "Anti-termite treatment for wood and walls.", price: 1499, duration: "3 hrs", image_url: "/images/site/pest-control.jpg", is_active: true },
  { service_name: "Water Tank Cleaning", category: "Cleaning", description: "Mechanized deep cleaning of overhead water tanks.", price: 799, duration: "90 mins", image_url: "/images/site/deep-clean.jpg", is_active: true },
  { service_name: "Fan Repair & Install", category: "Repairs", description: "Fix noise issues, regulator problems, and new installs.", price: 199, duration: "30 mins", image_url: "/images/site/electrician.jpg", is_active: true },
  { service_name: "AC Gas Refill", category: "Maintenance", description: "Thorough leak check and complete refrigerant refill.", price: 2499, duration: "90 mins", image_url: "/images/site/ac-maintenance.jpg", is_active: true },
  { service_name: "Modular Kitchen Clean", category: "Cleaning", description: "Detailed cleaning of modular cabinets and appliances.", price: 1299, duration: "3 hrs", image_url: "/images/site/fridge-clean.jpg", is_active: true },
  { service_name: "Washing Machine Repair", category: "Repairs", description: "Fix drum issues, water leakage, and motor problems.", price: 449, duration: "60 mins", image_url: "/images/site/appliance-repair.jpg", is_active: true },
  { service_name: "Fridge Gas Refill", category: "Repairs", description: "Refrigerant refill and cooling coil inspection.", price: 1899, duration: "90 mins", image_url: "/images/site/fridge-clean.jpg", is_active: true },
  { service_name: "Chimney Deep Clean", category: "Cleaning", description: "Dismantling and chemical wash of chimney filters.", price: 699, duration: "60 mins", image_url: "/images/site/home-care.jpg", is_active: true }
];

async function run() {
  for (const s of servicesToSeed) {
    try {
      const { data: existing } = await supabase.from('services').select('*').eq('service_name', s.service_name).single();
      if (!existing) {
        const { error } = await supabase.from('services').insert(s);
        if (error) {
           console.error("Failed to insert", s.service_name, error.message);
        } else {
           console.log("Inserted:", s.service_name);
        }
      } else {
        console.log("Already exists:", s.service_name);
      }
    } catch (err) {
      console.error("Failed to check", s.service_name, err.message);
    }
  }
  process.exit(0);
}
run();
