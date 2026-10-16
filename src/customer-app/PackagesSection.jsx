import { useCallback, useEffect, useState } from 'react';
import Card from './Card.jsx';
import EditModal from './EditModal.jsx';

/** Maintenance packages live in one config row (a list), so every change rewrites the list. */
export default function PackagesSection({ api }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null); // {index} (index -1 = new)

  const load = useCallback(async () => {
    setErr('');
    try { const v = (await api('config_get', { id: 'packages' })).value; setList(Array.isArray(v) ? v : []); }
    catch (e) { setErr(e.message); setList([]); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const save = async (next) => { await api('config', { id: 'packages', value: next }); await load(); };
  async function del(i) {
    if (!window.confirm('Delete "' + (list[i].name || 'this package') + '" permanently?')) return;
    try { await save(list.filter((_, j) => j !== i)); } catch (e) { window.alert(e.message); }
  }

  return (
    <section>
      <div className="cx-head"><h2>Packages</h2><button type="button" className="cx-btn pri" onClick={() => setModal({ index: -1 })}>+ Add</button></div>
      {err && <p className="cx-err">{err}</p>}
      {list === null ? <p className="cx-muted">Loading…</p> : !list.length && !err ? <p className="cx-muted">No saved packages, so the website shows its built-in defaults. Add one to replace them.</p> : (
        <div className="cx-grid">
          {list.map((p, i) => (
            <Card key={p.id || i} emoji="📦" title={p.name} sub={(p.features || []).slice(0, 3).join(' · ')}
              extra={p.price != null && p.price !== '' ? '₹' + Number(p.price).toLocaleString('en-IN') + ' ' + (p.period || '') : ''}
              badge={p.featured ? 'Most popular' : ''} onEdit={() => setModal({ index: i })} onDelete={() => del(i)} />
          ))}
        </div>
      )}
      {modal && (
        <EditModal table="packages" initial={modal.index >= 0 ? list[modal.index] : null} api={api} onClose={() => setModal(null)}
          onSubmit={(out) => save(modal.index >= 0 ? list.map((p, i) => (i === modal.index ? { ...p, ...out } : p)) : [...list, { id: 'pkg-' + Date.now(), ...out }])} />
      )}
    </section>
  );
}
