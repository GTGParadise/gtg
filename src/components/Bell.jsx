import { useCallback, useEffect, useRef, useState } from 'react';
import { SB, ingestAppSubmissions, openInbox, toast } from '../core/engine.js';
import { registerStatusChanger, setInbox } from '../inboxStore.js';
import useScrollLock from './useScrollLock.js';
import { useEngine } from '../useEngine.js';
import { configured, makeApi } from '../customer-app/api.js';
import injectCss from './injectCss.js';

injectCss('bell', `
.bellw{position:relative}
.bellb{border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:5px 9px;line-height:0;position:relative}
.bell-dot{position:absolute;top:3px;right:4px;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid #14532d;animation:belldot 1.8s ease-out infinite}
@keyframes belldot{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}100%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
.bell-bg{position:fixed;inset:0;z-index:40;background:rgba(0,10,40,.5);display:flex;justify-content:center;align-items:flex-start;padding:calc(64px + env(safe-area-inset-top,0px)) 12px 12px;overscroll-behavior:contain;touch-action:none}
.bell-pn{background:#f6faf7;color:#12302e;border-radius:18px;width:100%;max-width:440px;max-height:calc(100dvh - 90px - env(safe-area-inset-top,0px));display:flex;flex-direction:column;box-shadow:0 14px 40px rgba(0,0,0,.4);overflow:hidden;touch-action:auto}
.bell-h{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#fff;border-bottom:1px solid #d8e6dc}.bell-h b{font-size:16px;color:#14532d}
.bell-h small{display:block;font-size:11.5px;color:#5b7774;font-weight:500;margin-top:1px}
.bell-x{border:0;background:#eef5f0;width:34px;height:34px;border-radius:50%;font-size:16px;color:#14532d;display:grid;place-items:center}
.bell-l{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:10px;display:flex;flex-direction:column;gap:8px}
.bell-i{position:relative;display:flex;gap:11px;align-items:flex-start;background:#fff;border:1px solid #dbe8df;border-radius:14px;padding:11px 12px;cursor:pointer;text-align:left;width:100%;font:inherit;color:inherit}
.bell-i:active{background:#f0f8f2}
.bell-i.n{border-color:#86efac;box-shadow:0 0 0 2px rgba(34,197,94,.14)}
.bell-ic{width:38px;height:38px;border-radius:12px;background:#ecfdf3;display:grid;place-items:center;font-size:20px;flex:none}
.bell-bd{min-width:0;flex:1}
.bell-t{font-weight:700;font-size:14px;color:#14532d;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.bell-nw{font-size:10px;font-weight:800;letter-spacing:.04em;background:#22c55e;color:#fff;border-radius:999px;padding:1px 7px}
.bell-s{font-size:12px;color:#5b7774;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bell-it{font-size:12.5px;margin-top:4px;color:#27403d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bell-m{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px}
.bell-pill{font-size:11.5px;font-weight:700;border-radius:999px;padding:2px 10px;background:#fef3c7;color:#92400e;text-transform:capitalize}
.bell-pill.ok{background:#dcfce7;color:#14532d}.bell-pill.bad{background:#fee2e2;color:#991b1b}
.bell-go{color:#9ab3ad;font-size:20px;line-height:1;align-self:center}
.bell-e{padding:26px 8px;text-align:center;color:#5b7774}
.bell-f{padding:9px 14px;border-top:1px solid #d8e6dc;background:#fff;font-size:11px;color:#5b7774}
`);

const ORDER = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const SUB = ['pending', 'confirmed', 'active', 'paused', 'cancelled'];
const ENQ = ['pending', 'confirmed', 'completed', 'cancelled'];
const LIST = { order: ORDER, subscription: SUB, enquiry: ENQ };
const stage = (st) => (st === 'pending' ? 'Placed' : st ? st[0].toUpperCase() + st.slice(1) : '');
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
  useScrollLock(open);

  const refresh = useCallback(async () => {
    if (!configured || !SB.on || busy.current || document.hidden) return;
    busy.current = true;
    try {
      const { orders, subscriptions, bookings } = await call('inbox_list');
      const all = [...(orders || []), ...(subscriptions || []), ...(bookings || [])].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      setItems(all); setErr(''); setInbox({ items: all, err: '', loaded: true });
      ingestAppSubmissions(all); // customer + project, only for things the customer really submitted
    } catch (e) { setErr(e.message || 'Could not load'); setInbox({ err: e.message || 'Could not load', loaded: true }); }
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
  function openItem(it) {
    closePanel();
    openInbox(it.kind, it.ref);
  }
  async function setStatus(it, status) {
    const prev = items;
    const next = (l) => l.map((x) => (x.kind === it.kind && x.ref === it.ref ? { ...x, status } : x));
    setItems(next); setInbox({ items: next(items) });
    try { await call('set_status', { kind: it.kind, ref: it.ref, status }); toast('Status updated. The customer has been notified.'); refresh(); }
    catch (e) { setItems(prev); setInbox({ items: prev }); toast(e.message || 'Could not update'); }
  }
  const statusRef = useRef(setStatus);
  statusRef.current = setStatus;
  useEffect(() => { registerStatusChanger((it, st) => statusRef.current(it, st)); }, []);

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
            <div className="bell-h"><div><b>Customer app activity</b><small>Tap an item to open it</small></div><button className="bell-x" onClick={closePanel} aria-label="Close">✕</button></div>
            <div className="bell-l">
              {err && <div className="bell-e" style={{ color: '#b91c1c' }}>{err}</div>}
              {!err && !items.length && <div className="bell-e">No orders or subscriptions yet.</div>}
              {items.map((i) => {
                const isNew = i.status === 'pending' && String(i.createdAt) > seen;
                const sub = i.kind === 'subscription';
                const list = i.items || [];
                const icon = sub ? '🌱' : i.kind === 'enquiry' ? (i.type === 'package' ? '📦' : '📅') : '🛒';
                const title = sub ? `${i.planName} subscription` : i.kind === 'enquiry' ? i.title : `Order #${String(i.ref).slice(-6)}`;
                const tone = ['confirmed', 'active', 'completed', 'delivered'].includes(i.status) ? ' ok' : i.status === 'cancelled' ? ' bad' : '';
                return (
                  <button key={i.kind + i.ref} type="button" className={'bell-i' + (isNew ? ' n' : '')} onClick={() => openItem(i)}>
                    <span className="bell-ic" aria-hidden="true">{icon}</span>
                    <span className="bell-bd">
                      <span className="bell-t">{title}{isNew && <span className="bell-nw">NEW</span>}</span>
                      <div className="bell-s">{i.name || 'Customer'}{i.phone ? ' · ' + i.phone : ''}</div>
                      {i.when && <div className="bell-it">Visit: <b>{i.when}</b></div>}
                      {list.length > 0 && <div className="bell-it">{list.slice(0, 3).join(', ')}{list.length > 3 ? ` +${list.length - 3} more` : ''}</div>}
                      <div className="bell-m">
                        <span className={'bell-pill' + tone}>{i.status === 'pending' ? 'Placed' : i.status}</span>
                        <span className="bell-s" style={{ margin: 0 }}>{ago(i.createdAt)}{Number(i.amount) > 0 ? ` · ₹${Number(i.amount).toLocaleString('en-IN')}` : ''}</span>
                      </div>
                    </span>
                    <span className="bell-go" aria-hidden="true">›</span>
                  </button>
                );
              })}
            </div>
            <div className="bell-f">New submissions add the customer (and a project for subscriptions) automatically. Change a status on the item's page; the customer is notified.</div>
          </div>
        </div>
      )}
    </div>
  );
}
