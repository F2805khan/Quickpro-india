import { config } from 'dotenv';
config({path: 'D:/quickpro india/backend/.env'});
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const servicesToSeed = [
  { service_name: "Women's Salon Package", category: "Salon at Home", description: "Haircut, threading, and waxing services at home.", price: 799, duration: "60 mins", image_url: "/images/site/beauty-salon.jpg", is_active: true },
  { service_name: "Relaxing Spa at Home", category: "Spa at Home", description: "Deep tissue massage and relaxation therapy.", price: 1299, duration: "90 mins", image_url: "/images/site/beauty-facial.jpg", is_active: true },
  { service_name: "AC Service & Repair", category: "AC Repairing", description: "Filter cleaning, gas checking, and deep cleaning.", price: 499, duration: "45 mins", image_url: "/images/site/ac-maintenance.jpg", is_active: true },
  { service_name: "Washing Machine Servicing", category: "Appliance Repair", description: "Front-load and top-load washing machine repairs.", price: 399, duration: "60 mins", image_url: "/images/site/appliance-repair.jpg", is_active: true },
  { service_name: "Cockroach & Ant Control", category: "Pest Control", description: "Odorless pest control treatment for your home.", price: 899, duration: "45 mins", image_url: "/images/site/pest-control.jpg", is_active: true },
  { service_name: "Switchboard & Wiring Repair", category: "Electrician", description: "Fixing switches, wiring issues, and MCB trips.", price: 199, duration: "30 mins", image_url: "/images/site/electrician.jpg", is_active: true },
  { service_name: "Tap & Pipe Leak Repair", category: "Plumbing", description: "Fixing leaking taps, pipes, and flush tanks.", price: 249, duration: "40 mins", image_url: "/images/site/electrician.jpg", is_active: true },
  { service_name: "Furniture Assembly & Repair", category: "Carpentry", description: "Assembling new furniture and fixing hinges/locks.", price: 299, duration: "60 mins", image_url: "/images/site/painting.jpg", is_active: true },
  { service_name: "Interior Room Painting", category: "Painting", description: "Professional painting services for single or multiple rooms.", price: 2999, duration: "Visit required", image_url: "/images/site/painting.jpg", is_active: true }
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
