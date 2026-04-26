import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../config/supabaseConfig";

/**
 * Normalize config URL to the Supabase project base URL.
 * Accepts accidental "/rest/v1" suffixes and trailing whitespace.
 */
function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  return trimmed.replace(/\/rest\/v1\/?$/i, "");
}

const supabaseUrl = normalizeSupabaseUrl(supabaseConfig.url);
const supabaseAnonKey = supabaseConfig.anonKey.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase config is missing. Check app/config/supabaseConfig.ts");
}

/**
 * Global Supabase client for Expo/React Native.
 * - Persists auth session in AsyncStorage
 * - Auto-refreshes tokens
 * - Disables URL session detection (not needed in native app flow)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
