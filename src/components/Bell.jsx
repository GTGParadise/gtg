import { useCallback, useEffect, useRef, useState } from 'react';
import { SB, ingestAppSubmissions, toast } from '../core/engine.js';
import { useEngine } from '../useEngine.js';
import { configured, makeApi } from '../customer-app/api.js';
import injectCss from './injectCss.js';

injectCss('bell', `
.bellw{position:relative}
.bellb{border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:5px 9px;line-height:0;position:relative}
.bell-dot{position:absolute;top:3px;right:4px;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid #14532d;animation:belldot 1.8s ease-out infinite}
@keyframes belldot{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}100%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
.bell-bg{position:fixed;inset:0;z-index:40;background:rgba(0,10,40,.45);display:flex;justify-content:center;align-items:flex-start;padding:calc(64px + env(safe-area-inset-top,0px)) 12px 12px}
.bell-pn{background:#fff;color:#12302e;border-radius:14px;width:100%;max-width:430px;max-height:calc(100vh - 90px);display:flex;flex-direction:column;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.bell-h{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #d8e6dc}.bell-h b{font-size:15px}
.bell-x{border:0;background:none;font-size:18px;color:#5b7774}
.bell-l{overflow:auto;padding:4px 12px 12px}
.bell-i{position:relative;padding:10px 0 10px 18px;border-bottom:1px solid #e6efe9}.bell-i:last-child{border-bottom:0}
.bell-i.n::before{content:"";position:absolute;left:2px;top:15px;width:9px;height:9px;border-radius:50%;background:#22c55e}
.bell-t{font-weight:700;font-size:13.5px}.bell-s{font-size:12px;color:#5b7774;margin-top:1px}.bell-it{font-size:12px;margin-top:4px}
.bell-r{display:flex;gap:8px;align-items:center;margin-top:7px;flex-wrap:wrap}
.bell-r select{width:auto;padding:4px 6px;font-size:12px;border-radius:8px}.bell-r a{font-size:12px;color:#0f766e;font-weight:600}
.bell-e{padding:22px 8px;text-align:center;color:#5b7774}
.bell-f{padding:8px 14px;border-top:1px solid #d8e6dc;font-size:11px;color:#5b7774}
`);

const ORDER = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const SUB = ['pending', 'confirmed', 'active', 'paused', 'cancelled'];
const SEEN_KEY = 'gtg_inbox_seen';
const readSeen = () => { try { return localStorage.getItem(SEEN_KEY) || ''; } catch { return ''; } };
const ago = (t) => (t ? new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '');
const wa = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length === 10 ? '91' + d : d; };

async function token() {
  const { data } = await SB.client.auth.getSession();
  return data.session?.access_token || '';
}
const call = (() => { let t = ''; const api = makeApi(() => t, 'admin-inbox'); return async (op, p) => { t = await token(); return api(op, p); }; })();

export default function Bell() {
  const rev = useEngine(); // SB.on flips after sign-in, which triggers an engine render
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(readSeen);
  const [err, setErr] = useState('');
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (!configured || !SB.on || busy.current || document.hidden) return;
    busy.current = true;
    try {
      const { orders, subscriptions } = await call('inbox_list');
      const all = [...(orders || []), ...(subscriptions || [])].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      setItems(all); setErr('');
      ingestAppSubmissions(all); // customer + project, only for things the customer really submitted
    } catch (e) { setErr(e.message || 'Could not load'); }
    busy.current = false;
  }, []);

  useEffect(() => {
    if (!SB.on) { setItems([]); return; }
    refresh();
    const id = setInterval(refresh, 20000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', refresh); };
  }, [rev, refresh]);

  const unread = items.filter((i) => i.status === 'pending' && String(i.createdAt) > seen);
  const dot = unread.length > 0;

  function openPanel() {
    setOpen(true);
    refresh();
  }
  function closePanel() {
    setOpen(false);
    const now = new Date().toISOString();
    try { localStorage.setItem(SEEN_KEY, now); } catch { /* ignore */ }
    setSeen(now);
    const refs = items.filter((i) => i.kind === 'order' && !i.seen).map((i) => i.ref);
    if (refs.length) call('mark_seen', { refs }).catch(() => {});
  }
  async function setStatus(it, status) {
    const prev = items;
    setItems((l) => l.map((x) => (x.kind === it.kind && x.ref === it.ref ? { ...x, status } : x)));
    try { await call('set_status', { kind: it.kind, ref: it.ref, status }); toast('Status updated. The customer has been notified.'); }
    catch (e) { setItems(prev); toast(e.message || 'Could not update'); }
  }

  if (!configured || !SB.on) return null;
  return (
    <div className="bellw">
      <button className="bellb" aria-label={dot ? `Notifications, ${unread.length} new` : 'Notifications'} onClick={openPanel}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {dot && <span className="bell-dot" aria-hidden="true" />}
      </button>
      {open && (
        <div className="bell-bg" onClick={closePanel}>
          <div className="bell-pn" role="dialog" aria-label="Customer app activity" onClick={(e) => e.stopPropagation()}>
            <div className="bell-h"><b>Customer app activity</b><button className="bell-x" onClick={closePanel} aria-label="Close">✕</button></div>
            <div className="bell-l">
              {err && <div className="bell-e" style={{ color: '#b91c1c' }}>{err}</div>}
              {!err && !items.length && <div className="bell-e">No orders or subscriptions yet.</div>}
              {items.map((i) => {
                const isNew = i.status === 'pending' && String(i.createdAt) > seen;
                const sub = i.kind === 'subscription';
                const list = i.items || [];
                return (
                  <div key={i.kind + i.ref} className={'bell-i' + (isNew ? ' n' : '')}>
                    <div className="bell-t">{sub ? `🌱 ${i.planName} subscription` : `🛒 Order #${i.ref.slice(-6)}`}</div>
                    <div className="bell-s">{i.name || 'Customer'}{i.phone ? ' · ' + i.phone : ''} · {ago(i.createdAt)}</div>
                    {list.length > 0 && <div className="bell-it">{list.slice(0, 3).join(', ')}{list.length > 3 ? ` +${list.length - 3} more` : ''}</div>}
                    {i.amount != null && i.amount !== '' && <div className="bell-it"><b>₹{Number(i.amount).toLocaleString('en-IN')}</b>{i.period ? ` / ${i.period}` : ''}</div>}
                    <div className="bell-r">
                      <select value={i.status} aria-label="Status" onChange={(e) => setStatus(i, e.target.value)}>
                        {(sub ? SUB : ORDER).map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                        {![...(sub ? SUB : ORDER)].includes(i.status) && <option value={i.status}>{i.status}</option>}
                      </select>
                      {wa(i.phone) && <a href={`https://wa.me/${wa(i.phone)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bell-f">New submissions add the customer{' '}(and a project for subscriptions) automatically. Changing a status notifies the customer.</div>
          </div>
        </div>
      )}
    </div>
  );
}
