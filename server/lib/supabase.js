import { createClient } from '@supabase/supabase-js';

const url  = process.env.SUPABASE_URL;
const key  = process.env.SUPABASE_SERVICE_KEY;

/**
 * Supabase client — null if env vars are not set (falls back to in-memory data).
 */
export const supabase = url && key ? createClient(url, key) : null;

export const isSupabaseReady = () => !!supabase;
