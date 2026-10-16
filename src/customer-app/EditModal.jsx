import { useState } from 'react';
import { SPEC } from './spec.js';
import { imgUrl } from './api.js';

const toForm = (fields, row) => Object.fromEntries(fields.map(([k, , t, d]) => [k,
  t === 'lines' ? (Array.isArray(row?.[k]) ? row[k].join('\n') : '')
  : t === 'json' ? JSON.stringify(row?.[k] ?? [], null, 1)
  : t === 'check' ? (row ? (row[k] ?? d) : d)
  : row?.[k] ?? '']));

const readB64 = (file) => new Promise((res, rej) => {
  const r = new FileReader(); r.onerror = rej; r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(file);
});

/** Add / edit form for one record. onSubmit(values) saves; the dialog closes when it succeeds. */
export default function EditModal({ table, initial, api, onSubmit, onClose }) {
  const spec = SPEC[table];
  const [f, setF] = useState(() => toForm(spec.fields, initial));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  async function pick(k, file) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return setErr('Image is larger than 4 MB.');
    setBusy(true); setErr('');
    try {
      const r = await api('upload', { bucket: spec.bucket, name: file.name, type: file.type, data: await readB64(file) });
      set(k, r.path);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const out = {};
    try {
      for (const [k, , t] of spec.fields) {
        let v = f[k];
        if (t === 'number') v = v === '' || v == null ? null : Number(v);
        else if (t === 'lines') v = String(v).split('\n').map((s) => s.trim()).filter(Boolean);
        else if (t === 'json') v = JSON.parse(v || '[]');
        else if (t !== 'check' && typeof v === 'string') v = v.trim();
        out[k] = v;
      }
    } catch { return setErr('One of the fields is not valid (check the JSON).'); }
    setBusy(true); setErr('');
    try { await onSubmit(out); onClose(); } catch (x) { setErr(x.message); setBusy(false); }
  }

  return (
    <div className="cx-bg" onClick={onClose}>
      <form className="cx-box" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{initial ? 'Edit' : 'Add'} {spec.title.toLowerCase()}</h3>
        {spec.fields.map(([k, label, t]) => (
          <label key={k} className={'cx-f' + (t === 'check' ? ' inline' : '')}>
            <span>{label}</span>
            {t === 'textarea' || t === 'lines' ? <textarea rows={t === 'lines' ? 5 : 3} value={f[k]} onChange={(e) => set(k, e.target.value)} />
              : t === 'json' ? <textarea rows={4} className="mono" value={f[k]} onChange={(e) => set(k, e.target.value)} />
              : t === 'check' ? <input type="checkbox" checked={!!f[k]} onChange={(e) => set(k, e.target.checked)} />
              : t === 'image' ? (<>
                  {f[k] && <img className="cx-prev" src={imgUrl(spec.bucket, f[k])} alt="" />}
                  <input type="file" accept="image/*" onChange={(e) => pick(k, e.target.files[0])} />
                </>)
              : <input type={t === 'number' ? 'number' : 'text'} step={t === 'number' ? 'any' : undefined} value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} />}
          </label>
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
