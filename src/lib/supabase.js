import { createClient } from '@supabase/supabase-js';

const url = String(import.meta.env.VITE_ADMIN_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const key = String(import.meta.env.VITE_ADMIN_SUPABASE_ANON_KEY || '').trim();

export const supabaseConfigured = Boolean(url && key);

export const supabase = supabaseConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// Optional comma-separated allow-list, e.g. VITE_ADMIN_EMAILS=me@gmail.com,partner@gmail.com
const adminEmails = String(import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * A user is an admin when their app_metadata.role is "admin" (only settable from the
 * Supabase dashboard / service role, never by the user) or their email is in VITE_ADMIN_EMAILS.
 * This only decides what the UI shows; real protection must come from RLS (see supabase/admin-rls.sql).
 */
export function isAdminUser(user) {
  if (!user) return false;
  if (user.app_metadata && user.app_metadata.role === 'admin') return true;
  return adminEmails.includes(String(user.email || '').toLowerCase());
}
