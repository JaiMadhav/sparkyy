
import { createClient } from "@supabase/supabase-js";

// ------------------------------------------------------------------
// REPLACE THESE VARIABLES WITH YOUR OWN SUPABASE PROJECT DETAILS
// ------------------------------------------------------------------

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || "https://rzrbtxegqlyhiltgvfpr.supabase.co").trim().replace(/^["']|["']$/g, '');
if (rawUrl && !rawUrl.startsWith('http')) {
  rawUrl = 'https://' + rawUrl;
}
let SUPABASE_URL = rawUrl;
try {
  SUPABASE_URL = new URL(rawUrl).origin;
} catch (e) {
  // If parsing fails, fall back to string manipulation or default
  console.error("Invalid Supabase URL format:", rawUrl);
  SUPABASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
}

let SUPABASE_PUBLIC_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_EX9w3B7LkgJdzOOSq7SMrg_cV__V8Bu").trim().replace(/^["']|["']$/g, '');

if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY || SUPABASE_PUBLIC_KEY.startsWith('sb_')) {
  console.warn("Supabase configuration might be incomplete or using an invalid key format (sb_ is usually Stripe). Please check your .env or secrets.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
