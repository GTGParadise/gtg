import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { isAdminUser } from '../lib/supabase.js';
import injectCss from '../components/injectCss.js';
import { configured, makeApi } from '../customer-app/api.js';
import { TABLE_SECTIONS } from '../customer-app/spec.js';
import TableSection from '../customer-app/TableSection.jsx';
import PackagesSection from '../customer-app/PackagesSection.jsx';
import AboutSection from '../customer-app/AboutSection.jsx';
import SettingsSection from '../customer-app/SettingsSection.jsx';

/* ---- styles for this tab ---- */
const css = String.raw`.ca-gate{max-width:380px;margin:28px auto;padding:20px;background:#fff;border:1px solid #e3e8e4;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.ca-gate h2{margin:0 0 4px;font-size:20px;color:#14532d}.ca-gate p{margin:0 0 14px;color:#64748b;font-size:13px}
.ca-gate label{display:block;margin:0 0 10px;font-size:13px;font-weight:600}
.ca-gate input{width:100%;box-sizing:border-box;margin-top:4px;padding:10px;border:1px solid #cfd8d2;border-radius:8px;font:inherit;font-size:15px}
.ca-gate .cx-btn{width:100%}
.cx{max-width:1100px;margin:0 auto}
.cx-top{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#14532d;color:#fff;border-radius:12px;padding:10px 14px;margin:0 0 10px}
.cx-top b{font-size:15px}.cx-top small{display:block;opacity:.8;font-size:11px}
.cx-chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;margin:0 0 6px}
.cx-chip{flex:0 0 auto;border:1px solid #cfd8d2;background:#fff;color:#1f6b3a;font:inherit;font-size:13px;font-weight:600;padding:7px 14px;border-radius:999px;cursor:pointer}
.cx-chip.on{background:#1f6b3a;color:#fff;border-color:#1f6b3a}
.cx-head{display:flex;align-items:center;justify-content:space-between;margin:4px 0 10px}.cx-head h2{margin:0;font-size:20px;color:#14532d}
.cx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}.cx-grid.one{grid-template-columns:minmax(220px,420px)}
.cx-card{position:relative;display:flex;flex-direction:column;background:#fff;border:1px solid #e3e8e4;border-radius:10px;overflow:hidden}
.cx-card img,.cx-ph{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}.cx-ph{display:flex;align-items:center;justify-content:center;font-size:38px;background:#eef4ef}
.cx-info{padding:8px 8px 10px;display:flex;flex-direction:column;gap:3px}.cx-info b{font-size:14px;line-height:1.25}
.cx-info span{font-size:12px;color:#4a5a50;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.cx-info .cx-price{font-size:14px;font-weight:600;color:#1f6b3a}
.cx-info em{font-style:normal;font-size:11px;color:#b45309}
.cx-tools{position:absolute;top:8px;right:8px;display:flex;gap:6px;z-index:2}
.cx-b{width:32px;height:32px;border-radius:50%;border:0;background:#fff;color:#1f6b3a;box-shadow:0 1px 6px rgba(0,0,0,.3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}.cx-b.del{color:#c62828}
.cx-btn{border:1px solid #cfd8d2;background:#fff;color:#1a2433;font:inherit;font-size:14px;padding:8px 16px;border-radius:8px;cursor:pointer}
.cx-btn.pri{background:#1f6b3a;border-color:#1f6b3a;color:#fff;font-weight:600}.cx-btn.ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.5)}.cx-btn:disabled{opacity:.6}
.cx-muted{color:#64748b;font-size:14px}.cx-err{color:#c62828;font-size:13px;margin:6px 0}.cx-ok{color:#1f6b3a;font-size:13px;margin:6px 0}
.cx-panel{background:#fff;border:1px solid #e3e8e4;border-radius:12px;padding:14px;max-width:460px}.cx-panel h4{margin:10px 0 6px;color:#14532d}.cx-panel h4:first-child{margin-top:0}
.cx-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:16px}
.cx-box{background:#fff;color:#1a2433;border-radius:12px;padding:16px;width:100%;max-width:460px;margin:auto}.cx-box h3{margin:0 0 10px;color:#1f6b3a}
.cx-f{display:block;margin:0 0 10px;font-size:13px}.cx-f>span{display:block;margin-bottom:3px;font-weight:600}
.cx-f input:not([type=checkbox]):not([type=file]),.cx-f textarea{width:100%;box-sizing:border-box;padding:8px;border:1px solid #cfd8d2;border-radius:8px;font:inherit;font-size:14px}
.cx-f.inline{display:flex;gap:8px;align-items:center}.cx-f.inline>span{margin:0}.cx-f .mono{font-family:ui-monospace,monospace;font-size:12px}
.cx-prev{width:90px;height:90px;object-fit:cover;border-radius:8px;display:block;margin-bottom:6px}
.cx-row{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}`;
injectCss('customer-app', css);

const ADMIN_URL = String(import.meta.env.VITE_ADMIN_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const ADMIN_KEY = String(import.meta.env.VITE_ADMIN_SUPABASE_ANON_KEY || '').trim();
const TABS = [...TABLE_SECTIONS.map((s) => [s.key, s.label]), ['packages', 'Packages'], ['about', 'About'], ['settings', 'Settings']];

/**
 * Customer App tab. Asks for the admin login (checked against the ADMIN database), then shows an editor for the
 * customer app's content. Every read/write goes through the `admin-bridge` Edge Function in the customer
 * project, which re-checks this admin token. The login lives in memory only: leaving the tab locks it again.
 */
export default function CustomerAppTab() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sec, setSec] = useState('gallery');
  const client = useRef(null);
  const tokenRef = useRef('');
  tokenRef.current = token;
  const api = useCallback(makeApi(() => tokenRef.current), []);

  useEffect(() => () => {
    const c = client.current;
    if (c) { c.auth.stopAutoRefresh(); c.auth.signOut({ scope: 'local' }).catch(() => {}); }
  }, []);

  async function unlock(e) {
    e.preventDefault();
    if (!ADMIN_URL || !ADMIN_KEY) return setErr('The admin database is not configured (VITE_ADMIN_SUPABASE_URL / _ANON_KEY).');
    setBusy(true); setErr('');
    try {
      // separate client, never stored: it must not touch the main app session
      const c = createClient(ADMIN_URL, ADMIN_KEY, { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'gtg-customer-editor' } });
      const { data, error } = await c.auth.signInWithPassword({ email: email.trim(), password: pw });
      if (error) throw error;
      if (!isAdminUser(data.user)) { await c.auth.signOut({ scope: 'local' }); throw new Error('This account is not an admin.'); }
      c.auth.onAuthStateChange((ev, s) => { if (ev === 'TOKEN_REFRESHED' && s) setToken(s.access_token); });
      client.current = c;
      setPw('');
      setToken(data.session.access_token);
    } catch (x) {
      setErr(x.message === 'Invalid login credentials' ? 'Wrong email or password.' : x.message || 'Could not sign in.');
    }
    setBusy(false);
  }

  function lock() {
    const c = client.current;
    if (c) { c.auth.stopAutoRefresh(); c.auth.signOut({ scope: 'local' }).catch(() => {}); client.current = null; }
    setToken('');
  }

  if (!configured) {
    return <div className="ca-gate"><h2>Customer App</h2><p>Set <b>VITE_CUSTOMER_SUPABASE_URL</b> (your customer project's URL) and rebuild. See SETUP.md.</p></div>;
  }

  if (!token) {
    return (
      <form className="ca-gate" onSubmit={unlock}>
        <h2>Customer App</h2>
        <p>Sign in with your admin account to edit the customer app.</p>
        <label>Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></label>
        {err && <div className="cx-err">{err}</div>}
        <button className="cx-btn pri" disabled={busy}>{busy ? 'Checking…' : 'Open editor'}</button>
      </form>
    );
  }

  const meta = TABLE_SECTIONS.find((s) => s.key === sec);
  return (
    <div className="cx">
      <div className="cx-top"><div><b>GTG Paradise: Customer App</b><small>Changes are saved to the live customer app</small></div>
        <button className="cx-btn ghost" onClick={lock}>Lock</button></div>
      <div className="cx-chips">{TABS.map(([k, l]) => <button key={k} className={'cx-chip' + (sec === k ? ' on' : '')} onClick={() => setSec(k)}>{l}</button>)}</div>
      {meta ? <TableSection key={meta.key} meta={meta} api={api} />
        : sec === 'packages' ? <PackagesSection api={api} />
        : sec === 'about' ? <AboutSection api={api} />
        : <SettingsSection api={api} />}
    </div>
  );
}
