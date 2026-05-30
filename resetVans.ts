import * as dotenv from 'dotenv';
dotenv.config();

// mock import.meta for vite env vars before importing supabase if needed
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rzrbtxegqlyhiltgvfpr.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(supabaseUrl, supabaseKey!);

async function resetVans() {
    console.log("Resetting vans...");
    const { data: vans, error } = await supabase.from('charging_vans').select('*');
    if (vans) {
       for (const van of vans) {
           await supabase.from('charging_vans').update({
               current_status: 'available',
               active_booking_id: null,
               telemetry_status: 'online',
               safety_status: 'safe',
               thermal_status: 'normal',
               current_energy_level: 100,
               sessions_completed_today: 0
           }).eq('id', van.id);
       }
    }
    console.log("Error:", error);
    console.log("Vans reset");
}

resetVans();
