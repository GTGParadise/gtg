import { useCallback, useEffect, useState } from 'react';
import Card from './Card.jsx';

const money = (n) => (n || n === 0 ? '₹' + Number(n).toLocaleString('en-IN') : 'Price on request');

/** Subscription plans: name, price, features, and how many plants of each category the customer may pick. */
export default function PlansSection({ api }) {
  const [data, setData] = useState(null); // { plans, allowances, types }
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null); // { plan } (plan null = new)

  const load = useCallback(async () => {
    setErr('');
    try { setData(await api('plans_full')); } catch (e) { setErr(e.message); setData({ plans: [], allowances: [], types: [] }); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const summary = (plan) => {
    const rows = data.allowances.filter((a) => a.plan_id === plan.id);
    const label = (id) => (data.types.find((t) => t.id === id) || {}).label || '?';
    const total = rows.reduce((s, a) => s + (a.plant_types_count || 0), 0);
    return rows.length ? total + ' varieties: ' + rows.map((a) => a.plant_types_count + ' × ' + label(a.plant_type_id)).join(', ') : 'No categories set';
  };

  async function del(plan) {
    if (!window.confirm('Delete plan "' + (plan.name || 'this plan') + '" permanently?')) return;
    try { await api('delete', { table: 'subscription_plans', id: plan.id }); await load(); } catch (e) { window.alert(e.message); }
  }

  return (
    <section>
      <div className="cx-head"><h2>Subscription plans</h2>
        <button type="button" className="cx-btn pri" onClick={() => setModal({ plan: null })}>+ Add</button></div>
      {err && <p className="cx-err">{err}</p>}
      {data === null ? <p className="cx-muted">Loading…</p> : !data.plans.length && !err ? <p className="cx-muted">No plans yet. Tap “+ Add”.</p> : (
        <div className="cx-grid">
          {data.plans.map((p) => (
            <Card key={p.id} emoji="📦" title={p.name} sub={summary(p)}
              extra={money(p.price) + (p.period ? ' / ' + p.period : '')}
              badge={p.is_active === false ? 'Hidden on website' : p.is_featured ? 'Most popular' : ''}
              onEdit={() => setModal({ plan: p })} onDelete={() => del(p)} />
          ))}
        </div>
      )}
      {modal && data && <PlanModal plan={modal.plan} data={data} api={api} onClose={() => setModal(null)} onSaved={load} />}
    </section>
  );
}

function PlanModal({ plan, data, api, onClose, onSaved }) {
  const [f, setF] = useState({
    name: plan?.name || '', price: plan?.price ?? '', period: plan?.period || '', sort_order: plan?.sort_order ?? '',
    features: Array.isArray(plan?.features) ? plan.features.join('\n') : '',
    is_featured: !!plan?.is_featured, is_active: plan ? plan.is_active !== false : true,
  });
  const [counts, setCounts] = useState(() => Object.fromEntries(data.types.map((t) => {
    const a = plan && data.allowances.find((x) => x.plan_id === plan.id && x.plant_type_id === t.id);
    return [t.id, a ? String(a.plant_types_count) : ''];
  })));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (!f.name.trim()) return setErr('Enter a plan name.');
    const row = {
      name: f.name.trim(), period: f.period.trim(),
      features: f.features.split('\n').map((s) => s.trim()).filter(Boolean),
      is_featured: f.is_featured, is_active: f.is_active,
    };
    if (f.price !== '') row.price = Number(f.price); else if (plan) row.price = null;
    if (f.sort_order !== '') row.sort_order = Number(f.sort_order);
    setBusy(true); setErr('');
    try {
      const r = await api('save', { table: 'subscription_plans', row: plan ? { id: plan.id, ...row } : row });
      const id = plan ? plan.id : r.row && r.row.id;
      if (id == null) throw new Error('The plan was saved but its id was not returned. Reopen it to set categories.');
      await api('allowances_set', { plan_id: id, items: data.types.map((t) => ({ plant_type_id: t.id, count: counts[t.id] })) });
      await onSaved(); onClose();
    } catch (x) { setErr(x.message); setBusy(false); }
  }

  return (
    <div className="cx-bg" onClick={onClose}>
      <form className="cx-box" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{plan ? 'Edit' : 'Add'} plan</h3>
        <label className="cx-f"><span>Name</span><input type="text" value={f.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label className="cx-f"><span>Price (₹), leave empty for “on request”</span><input type="number" step="any" value={f.price} onChange={(e) => set('price', e.target.value)} /></label>
        <label className="cx-f"><span>Period, e.g. month</span><input type="text" value={f.period} onChange={(e) => set('period', e.target.value)} /></label>
        <label className="cx-f"><span>Features (one per line)</span><textarea rows={4} value={f.features} onChange={(e) => set('features', e.target.value)} /></label>
        <label className="cx-f"><span>Sort order (lowest first)</span><input type="number" value={f.sort_order} onChange={(e) => set('sort_order', e.target.value)} /></label>
        <label className="cx-f inline"><input type="checkbox" checked={f.is_featured} onChange={(e) => set('is_featured', e.target.checked)} /><span>Mark as most popular</span></label>
        <label className="cx-f inline"><input type="checkbox" checked={f.is_active} onChange={(e) => set('is_active', e.target.checked)} /><span>Show on website</span></label>
        <h4 style={{ margin: '12px 0 6px', color: '#14532d' }}>How many varieties the customer can pick, per category</h4>
        {!data.types.length && <p className="cx-muted">No categories yet. Add them in the Categories tab first.</p>}
        {data.types.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 6px' }}>
            <span style={{ flex: 1, fontSize: 14 }}>{t.label || t.key}{t.is_active === false ? ' (hidden)' : ''}</span>
            <input type="number" min="0" placeholder="0" value={counts[t.id]} onChange={(e) => setCounts((p) => ({ ...p, [t.id]: e.target.value }))}
              style={{ width: 70, padding: 6, border: '1px solid #cfd8d2', borderRadius: 8, font: 'inherit' }} />
          </div>
        ))}
        {err && <p className="cx-err">{err}</p>}
        <div className="cx-row">
          <button type="button" className="cx-btn" onClick={onClose}>Cancel</button>
          <button className="cx-btn pri" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
