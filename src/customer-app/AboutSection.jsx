import { useCallback, useEffect, useState } from 'react';
import Card from './Card.jsx';
import EditModal from './EditModal.jsx';

/** The single About record (about_content, id 1). */
export default function AboutSection({ api }) {
  const [row, setRow] = useState(undefined); // undefined = loading, null = none
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(false);

  const load = useCallback(async () => {
    setErr('');
    try { setRow((await api('list', { table: 'about_content' })).rows[0] || null); }
    catch (e) { setErr(e.message); setRow(null); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  async function del() {
    if (!window.confirm('Delete the About section permanently?')) return;
    try { await api('delete', { table: 'about_content', id: row.id }); await load(); } catch (e) { window.alert(e.message); }
  }

  return (
    <section>
      <div className="cx-head"><h2>About</h2>{row === null && <button type="button" className="cx-btn pri" onClick={() => setModal(true)}>+ Add</button>}</div>
      {err && <p className="cx-err">{err}</p>}
      {row === undefined ? <p className="cx-muted">Loading…</p> : row === null ? <p className="cx-muted">No About content yet.</p> : (
        <div className="cx-grid one">
          <Card emoji="ℹ️" title={row.title} sub={[row.subtitle, row.phone, row.email, row.address].filter(Boolean).join(' · ')}
            onEdit={() => setModal(true)} onDelete={del} />
        </div>
      )}
      {modal && (
        <EditModal table="about_content" initial={row} api={api} onClose={() => setModal(false)}
          onSubmit={async (out) => { await api('save', { table: 'about_content', row: out }); await load(); }} />
      )}
    </section>
  );
}
