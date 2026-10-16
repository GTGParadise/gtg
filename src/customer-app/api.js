// Talks to the `admin-bridge` Edge Function in the CUSTOMER Supabase project, using the admin's token.
const BASE = String(import.meta.env.VITE_CUSTOMER_SUPABASE_URL || '').trim().replace(/\/+$/, '');
export const configured = Boolean(BASE);
export const imgUrl = (bucket, path) => (path && bucket ? `${BASE}/storage/v1/object/public/${bucket}/${encodeURI(path)}` : '');

export function makeApi(getToken) {
  return async (op, payload = {}) => {
    const res = await fetch(`${BASE}/functions/v1/admin-bridge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
      body: JSON.stringify({ op, ...payload }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || 'Request failed (' + res.status + ')');
    return j;
  };
}
