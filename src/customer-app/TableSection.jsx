import { useCallback, useEffect, useState } from 'react';
import Card from './Card.jsx';
import EditModal from './EditModal.jsx';
import { SPEC } from './spec.js';
import { imgUrl } from './api.js';

const money = (n) => (n || n === 0 ? '₹' + Number(n).toLocaleString('en-IN') : '');

/** Gallery, Services, Plants, Materials: card grid with edit / delete / add. */
export default function TableSection({ meta, api }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null); // {row} (row null = new)
  const bucket = SPEC[meta.table].bucket;

  const load = useCallback(async () => {
    setErr('');
    try { setRows((await api('list', { table: meta.table })).rows); }
    catch (e) { setErr(e.message); setRows([]); }
  }, [api, meta.table]);
  useEffect(() => { setRows(null); load(); }, [load]);

  async function del(row) {
    if (!window.confirm('Delete "' + (row[meta.title] || 'this item') + '" permanently?')) return;
    try { await api('delete', { table: meta.table, id: row.id }); await load(); } catch (e) { window.alert(e.message); }
  }

  return (
    <section>
      <div className="cx-head"><h2>{meta.label}</h2>
        <button type="button" className="cx-btn pri" onClick={() => setModal({ row: null })}>+ Add</button></div>
      {err && <p className="cx-err">{err}</p>}
      {rows === null ? <p className="cx-muted">Loading…</p> : !rows.length && !err ? <p className="cx-muted">Nothing here yet. Tap “+ Add”.</p> : (
        <div className="cx-grid">
          {rows.map((r) => (
            <Card key={r.id} img={imgUrl(bucket, r.image_path)} emoji={meta.emoji} title={r[meta.title]} sub={r[meta.sub]}
              extra={meta.price ? money(r.price) : ''} badge={r.is_active === false ? 'Hidden on website' : ''}
              onEdit={() => setModal({ row: r })} onDelete={() => del(r)} />
          ))}
        </div>
      )}
      {modal && (
        <EditModal table={meta.table} initial={modal.row} api={api} onClose={() => setModal(null)}
          onSubmit={async (out) => { await api('save', { table: meta.table, row: modal.row ? { id: modal.row.id, ...out } : out }); await load(); }} />
      )}
    </section>
  );
}
