import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Collegamento a Supabase. URL e chiave "anon" sono pubbliche per progetto (sicure da mettere nel sito):
 * a proteggere i dati sono le regole di accesso in supabase/schema.sql.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Supabase la chiama "publishable key" (le vecchie "anon key" funzionano uguale).
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseConfigurato = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;

/** Il client (uno solo), oppure null se Supabase non è ancora collegato. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigurato) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, detectSessionInUrl: true } });
  return client;
}

export const BUCKET_FOTO = "capi";
