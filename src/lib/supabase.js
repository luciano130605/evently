import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isTest = import.meta.env.MODE === "test";

export const supabase =
    !isTest && supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

export const hasSupabaseConfig = Boolean(!isTest && supabaseUrl && supabaseAnonKey);
