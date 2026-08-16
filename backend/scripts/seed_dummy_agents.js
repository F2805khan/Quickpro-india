import { config } from 'dotenv';
config({ path: 'D:/quickpro india/backend/.env' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const dummyAgents = [
  {
    name: "Rajesh Kumar",
    phone: "+919876543211",
    email: "rajesh.kumar@quickpro.in",
    service_category: "Cleaning",
    sub_services: "Deep Cleaning, Sofa Cleaning",
    is_online: true,
    verification_status: "verified",
    skills: "Cleaning, Repairs",
    rating: 4.8,
    completed_jobs_count: 24,
    earnings: 8500,
    latitude: "19.0760",
    longitude: "72.8777",
    dob: "1990-05-14",
    gender: "Male",
    address: "12, Shanti Nagar, Andheri East, Mumbai",
    pincode: "400069",
    pan_card: "ABCDE1234F",
    experience_years: 5,
    languages: "Hindi, Marathi, English",
    service_area_pincodes: "400069, 400070, 400093",
    availability: "Mon-Sat, 9 AM - 6 PM",
    job_radius_km: 10,
    bank_account: "123456789012",
    ifsc_code: "HDFC0001234",
    account_holder_name: "Rajesh Kumar",
    upi_id: "rajeshkumar@upi",
    vehicle_type: "Two Wheeler",
    vehicle_number: "MH-02-AB-1234",
    accept_terms: true,
    consent_background_check: true,
    emergency_contact_name: "Sunita Kumar",
    emergency_contact_phone: "+919876543210"
  },
  {
    name: "Amit Singh",
    phone: "+919876543212",
    email: "amit.singh@quickpro.in",
    service_category: "Electrician",
    sub_services: "Wiring, Appliance Repair, Installation",
    is_online: true,
    verification_status: "verified",
    skills: "Maintenance, Repairs",
    rating: 4.6,
    completed_jobs_count: 18,
    earnings: 6200,
    latitude: "19.0820",
    longitude: "72.8811",
    dob: "1988-11-20",
    gender: "Male",
    address: "B-45, Vasant Vihar, Thane West",
    pincode: "400601",
    pan_card: "VWXYZ9876Q",
    experience_years: 8,
    languages: "Hindi, English",
    service_area_pincodes: "400601, 400602, 400603",
    availability: "Mon-Sun, 10 AM - 8 PM",
    job_radius_km: 15,
    bank_account: "987654321098",
    ifsc_code: "SBIN0009876",
    account_holder_name: "Amit Singh",
    upi_id: "amitsingh@sbi",
    vehicle_type: "Two Wheeler",
    vehicle_number: "MH-04-XY-9876",
    accept_terms: true,
    consent_background_check: true,
    emergency_contact_name: "Neha Singh",
    emergency_contact_phone: "+919988776655"
  },
  {
    name: "Sunita Sharma",
    phone: "+919876543213",
    email: "sunita.sharma@quickpro.in",
    service_category: "Beauty Salon",
    sub_services: "Hair Styling, Makeup, Facial",
    is_online: true,
    verification_status: "verified",
    skills: "Beauty, Grooming",
    rating: 4.9,
    completed_jobs_count: 35,
    earnings: 12400,
    latitude: "19.0712",
    longitude: "72.8584",
    dob: "1995-03-10",
    gender: "Female",
    address: "7th Cross, Bandra West, Mumbai",
    pincode: "400050",
    pan_card: "JKLMN4567P",
    experience_years: 4,
    languages: "English, Hindi, Marathi",
    service_area_pincodes: "400050, 400051, 400052",
    availability: "Tue-Sun, 11 AM - 7 PM",
    job_radius_km: 8,
    bank_account: "555566667777",
    ifsc_code: "ICIC0005555",
    account_holder_name: "Sunita Sharma",
    upi_id: "sunita.s@icici",
    vehicle_type: "None",
    vehicle_number: "",
    accept_terms: true,
    consent_background_check: true,
    emergency_contact_name: "Ramesh Sharma",
    emergency_contact_phone: "+918877665544"
  },
  {
    name: "Vijay Yadav",
    phone: "+919876543214",
    email: "vijay.yadav@quickpro.in",
    service_category: "Plumber",
    sub_services: "Pipe Fitting, Leak Repair",
    is_online: false,
    verification_status: "verified",
    skills: "Plumbing, Repairs",
    rating: 4.5,
    completed_jobs_count: 12,
    earnings: 4500,
    latitude: "19.0998",
    longitude: "72.8990",
    dob: "1985-08-25",
    gender: "Male",
    address: "G-12, Kurla East, Mumbai",
    pincode: "400024",
    pan_card: "QRSTU3456K",
    experience_years: 12,
    languages: "Hindi, Marathi",
    service_area_pincodes: "400024, 400070",
    availability: "Mon-Fri, 9 AM - 5 PM",
    job_radius_km: 5,
    bank_account: "112233445566",
    ifsc_code: "BOFA0001122",
    account_holder_name: "Vijay Yadav",
    upi_id: "vijayyadav@bofa",
    vehicle_type: "Two Wheeler",
    vehicle_number: "MH-01-ZA-1111",
    accept_terms: true,
    consent_background_check: true,
    emergency_contact_name: "Pooja Yadav",
    emergency_contact_phone: "+917766554433"
  },
  {
    name: "Pooja Patel",
    phone: "+919876543215",
    email: "pooja.patel@quickpro.in",
    service_category: "Cleaning",
    sub_services: "Bathroom Cleaning, Kitchen Cleaning",
    is_online: true,
    verification_status: "under_review",
    skills: "Cleaning, Maintenance",
    rating: 4.7,
    completed_jobs_count: 29,
    earnings: 9800,
    latitude: "19.0550",
    longitude: "72.8300",
    dob: "1992-12-05",
    gender: "Female",
    address: "Flat 402, Vashi Sector 17, Navi Mumbai",
    pincode: "400703",
    pan_card: "LMNOP2345J",
    experience_years: 6,
    languages: "Gujarati, Hindi, English",
    service_area_pincodes: "400703, 400704, 400705",
    availability: "Mon-Sat, 8 AM - 4 PM",
    job_radius_km: 12,
    bank_account: "998877665544",
    ifsc_code: "AXIS0009988",
    account_holder_name: "Pooja Patel",
    upi_id: "poojapatel@axis",
    vehicle_type: "Two Wheeler",
    vehicle_number: "MH-43-PQ-9988",
    accept_terms: true,
    consent_background_check: true,
    emergency_contact_name: "Karan Patel",
    emergency_contact_phone: "+916655443322"
  }
];

async function seed() {
  console.log("Starting to seed dummy agents with updated columns...");
  for (const agent of dummyAgents) {
    try {
      // Check if agent already exists by phone
      const { data: existing, error: checkError } = await supabase
        .from('agents')
        .select('*')
        .eq('phone', agent.phone)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking agent ${agent.name}:`, checkError.message);
        continue;
      }

      if (existing) {
        console.log(`Agent with phone ${agent.phone} already exists (${existing.name}). Updating...`);
        const { error: updateError } = await supabase
          .from('agents')
          .update(agent)
          .eq('phone', agent.phone);
        
        if (updateError) {
          console.error(`Failed to update agent ${agent.name}:`, updateError.message);
        } else {
          console.log(`Successfully updated agent: ${agent.name}`);
        }
      } else {
        const { error: insertError } = await supabase
          .from('agents')
          .insert(agent);

        if (insertError) {
          console.error(`Failed to insert agent ${agent.name}:`, insertError.message);
        } else {
          console.log(`Successfully seeded agent: ${agent.name}`);
        }
      }
    } catch (err) {
      console.error(`Unexpected error for agent ${agent.name}:`, err);
    }
  }
  console.log("Seeding process completed!");
  process.exit(0);
}

seed();
