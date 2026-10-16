import { S, openRec, selIn } from '../core/engine.js';
import { changeStatus, useInbox } from '../inboxStore.js';
import injectCss from '../components/injectCss.js';

injectCss('inbox', `
.ib-back{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--bd);background:#fff;color:var(--brand,#14532d);border-radius:999px;padding:8px 14px;font-weight:700;font-size:13px;margin:2px 0 6px}
.ib-hero{display:flex;gap:12px;align-items:center}
.ib-ic{width:46px;height:46px;border-radius:14px;background:#ecfdf3;display:grid;place-items:center;font-size:24px;flex:none}
.ib-hero h2{margin:0;font-size:18px;color:var(--brand,#14532d);line-height:1.25}
.ib-hero small{color:var(--mu)}
.ib-kv{display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px 12px;margin-top:12px;font-size:13.5px}
.ib-kv span{color:var(--mu)}.ib-kv b{font-weight:600;overflow-wrap:anywhere}
.ib-list{margin:6px 0 0;padding-left:18px;font-size:13.5px}
.ib-tl{margin-top:8px}
.ib-st{display:flex;gap:12px}
.ib-dotc{display:flex;flex-direction:column;align-items:center}
.ib-dot{width:12px;height:12px;border-radius:50%;background:#15803d;margin-top:4px;flex:none}
.ib-line{width:2px;flex:1;background:#bbf7d0;min-height:18px}
.ib-st div:last-child{padding-bottom:12px;font-size:13px}
.ib-st small{display:block;color:var(--mu)}
.ib-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.ib-acts a,.ib-acts button{flex:1 1 140px;text-align:center;text-decoration:none;border-radius:10px;padding:11px 12px;font-weight:700;font-size:13.5px;min-height:44px;border:1.5px solid var(--brand,#14532d);background:#fff;color:var(--brand,#14532d)}
.ib-acts .wa{background:#25D366;border-color:#25D366;color:#fff}
.ib-sel{width:100%;padding:11px 12px;border-radius:10px;font-size:15px;border:1.5px solid var(--bd);background:#fff;margin-top:6px}
`);

const ago = (t) => (t ? new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
const stage = (st) => (st === 'pending' ? 'Placed' : cap(st));
const last10 = (x) => String(x || '').replace(/\D/g, '').slice(-10);
const wa = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length === 10 ? '91' + d : d; };
const LIST = {
  order: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
  subscription: ['pending', 'confirmed', 'active', 'paused', 'cancelled'],
  enquiry: ['pending', 'confirmed', 'completed', 'cancelled'],
};
export const labelOf = (i) => (i.kind === 'subscription' ? `${i.planName} subscription`
  : i.kind === 'enquiry' ? i.title : `Order #${String(i.ref).slice(-6)}`);
export const iconOf = (i) => (i.kind === 'subscription' ? '🌱' : i.kind === 'enquiry' ? (i.type === 'package' ? '📦' : '📅') : '🛒');
const pageName = (i) => (i.kind === 'subscription' ? 'Plan request' : i.kind === 'enquiry' ? (i.type === 'package' ? 'Package request' : 'Visit booking') : 'Order');

/** Full page for one customer-app order / booking / plan. Header, tab bar and footer stay as on every other page. */
export default function InboxTab() {
  const { items, loaded } = useInbox();
  const it = selIn && items.find((x) => x.kind === selIn.kind && x.ref === selIn.ref);
  const back = () => history.back();

  if (!it) {
    return (
      <>
        <button className="ib-back" onClick={back}>← Back</button>
        <div className="card" style={{ textAlign: 'center', color: 'var(--mu)', padding: 24 }}>{loaded ? 'This item is no longer available.' : 'Loading…'}</div>
      </>
    );
  }
  const steps = it.history && it.history.length ? it.history : [{ status: 'pending', at: it.createdAt }];
  const list = it.items || [];
  const p10 = last10(it.phone);
  const cust = p10.length === 10 ? S.customers.find((c) => last10(c.phone) === p10 || last10(c.whatsapp) === p10) : null;
  const job = it.kind === 'subscription' ? S.jobs.find((j) => j.source === 'app:sub:' + it.ref) : null;

  return (
    <>
      <button className="ib-back" onClick={back}>← Back</button>
      <div className="card">
        <div className="ib-hero">
          <div className="ib-ic" aria-hidden="true">{iconOf(it)}</div>
          <div><small>{pageName(it)}</small><h2>{labelOf(it)}</h2></div>
        </div>
        <div className="ib-kv">
          <span>Customer</span><b>{it.name || 'Customer'}</b>
          {it.phone && <><span>Phone</span><b>{it.phone}</b></>}
          {it.email && <><span>Email</span><b>{it.email}</b></>}
          {it.location && <><span>Location</span><b>{it.location}</b></>}
          <span>Placed</span><b>{ago(it.createdAt)}</b>
          {it.when && <><span>Visit</span><b>{it.when}</b></>}
          {Number(it.amount) > 0 && <><span>Amount</span><b>₹{Number(it.amount).toLocaleString('en-IN')}{it.period ? ` / ${it.period}` : ''}</b></>}
        </div>
        {list.length > 0 && (<>
          <div className="sh" style={{ marginTop: 14 }}>{it.kind === 'subscription' ? 'Plants chosen' : 'Items'} ({list.length})</div>
          <ul className="ib-list">{list.map((x, n) => <li key={n}>{x}</li>)}</ul>
        </>)}
        <div className="sh" style={{ marginTop: 14 }}>Status</div>
        <select className="ib-sel" value={it.status} aria-label="Status" onChange={(e) => changeStatus(it, e.target.value)}>
          {LIST[it.kind].map((s) => <option key={s} value={s}>{cap(s)}</option>)}
          {!LIST[it.kind].includes(it.status) && <option value={it.status}>{it.status}</option>}
        </select>
        <div className="ib-acts">
          {wa(it.phone) && <a className="wa" href={`https://wa.me/${wa(it.phone)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          {cust && <button onClick={() => openRec('cust', cust.id)}>Open customer</button>}
          {job && <button onClick={() => openRec('work', job.id)}>Open project</button>}
        </div>
      </div>
      <div className="card">
        <div className="sh" style={{ marginTop: 0 }}>Progress</div>
        <div className="ib-tl">
          {steps.map((h, n) => (
            <div className="ib-st" key={n}>
              <div className="ib-dotc"><span className="ib-dot" />{n < steps.length - 1 && <span className="ib-line" />}</div>
              <div><b>{stage(h.status)}</b><small>{ago(h.at)}</small></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
