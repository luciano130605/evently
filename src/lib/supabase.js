import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://tmpwfusuzrmycmwuuotk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcHdmdXN1enJteWNtd3V1b3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjIyMTQsImV4cCI6MjEwMzc5ODIxNH0.PxZnMKoHYZ9BELOGUqQGBPmd4sLNw0qSZHg8NfHVzC0';
const isTest = import.meta.env.MODE === "test";

export const supabase =
    !isTest && supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

export const hasSupabaseConfig = Boolean(!isTest && supabaseUrl && supabaseAnonKey);
