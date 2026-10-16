import { useCallback, useEffect, useState } from 'react';

const SECTIONS = [['hero', 'Hero banner'], ['gallery', 'Gallery'], ['services', 'Services'], ['subscriptions', 'Subscription plans'], ['packages', 'Maintenance packages'],
  ['booking', 'Book a visit'], ['about', 'About'], ['plants', 'Plants menu'], ['materials', 'Materials menu']];
const readB64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onerror = rej; r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(file); });

/** Show / hide website sections (config row "site") and change the hero background photo. */
export default function SettingsSection({ api }) {
  const [site, setSite] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setSite((await api('config_get', { id: 'site' })).value || {}); } catch (e) { setErr(e.message); setSite({}); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn, ok) => { setBusy(true); setErr(''); setMsg(''); try { await fn(); setMsg(ok); await load(); } catch (e) { setErr(e.message); } setBusy(false); };
  const sec = (site && site.sections) || {};
  const toggle = (k, on) => run(() => api('config', { id: 'site', value: { ...site, sections: { ...sec, [k]: on } } }), 'Saved.');
  const hero = (file) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return setErr('Image is larger than 4 MB.');
    run(async () => api('upload', { bucket: 'home-page-bg', name: file.name, type: file.type, data: await readB64(file) }), 'Hero photo updated (the newest photo is used).');
  };

  return (
    <section>
      <div className="cx-head"><h2>Page settings</h2></div>
      {site === null ? <p className="cx-muted">Loading…</p> : (
        <div className="cx-panel">
          <h4>Sections shown on the website</h4>
          {SECTIONS.map(([k, l]) => (
            <label key={k} className="cx-f inline"><input type="checkbox" checked={sec[k] !== false} disabled={busy} onChange={(e) => toggle(k, e.target.checked)} /><span>{l}</span></label>
          ))}
          <h4>Hero background photo</h4>
          <input type="file" accept="image/*" disabled={busy} onChange={(e) => hero(e.target.files[0])} />
          {msg && <p className="cx-ok">{msg}</p>}
          {err && <p className="cx-err">{err}</p>}
        </div>
      )}
    </section>
  );
}
