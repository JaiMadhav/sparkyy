
import { createClient } from "@supabase/supabase-js";

// ------------------------------------------------------------------
// REPLACE THESE VARIABLES WITH YOUR OWN SUPABASE PROJECT DETAILS
// ------------------------------------------------------------------

const SUPABASE_URL = "https://rzrbtxegqlyhiltgvfpr.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_EX9w3B7LkgJdzOOSq7SMrg_cV__V8Bu";

// ------------------------------------------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
