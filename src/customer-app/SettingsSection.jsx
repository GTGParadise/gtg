import { useCallback, useEffect, useState } from 'react';

// Shrinks a picked logo to at most 256 px and returns it as a small PNG data URL (kept inside the site settings row).
const toLogo = (file) => new Promise((res, rej) => {
  const img = new Image(); const url = URL.createObjectURL(file);
  img.onload = () => {
    const k = Math.min(1, 256 / Math.max(img.width, img.height)); const c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/png'));
  };
  img.onerror = () => rej(new Error('Could not read that image.')); img.src = url;
});

const SECTIONS = [['hero', 'Hero banner'], ['gallery', 'Gallery'], ['services', 'Services'], ['subscriptions', 'Subscription plans'], ['packages', 'Maintenance packages'],
  ['booking', 'Book a visit'], ['about', 'About'], ['plants', 'Plants menu'], ['materials', 'Materials menu']];
const readB64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onerror = rej; r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(file); });

/** Show / hide website sections (config row "site") and change the hero background photo. */
export default function SettingsSection({ api }) {
  const [site, setSite] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [brand, setBrand] = useState({ name: '', tagline: '', logo: '' });

  const load = useCallback(async () => {
    try { setSite((await api('config_get', { id: 'site' })).value || {}); } catch (e) { setErr(e.message); setSite({}); }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  const loaded = site !== null;
  useEffect(() => { if (site) { const b = site.brand || {}; setBrand({ name: b.name || '', tagline: b.tagline ?? (site.brand ? '' : 'Grow to Green'), logo: b.logo || '' }); } }, [loaded]); // eslint-disable-line
  async function pickLogo(file) {
    if (!file) return;
    try { const logo = await toLogo(file); setBrand((b) => ({ ...b, logo })); setErr(''); setMsg('Logo chosen. Tap “Save brand” to publish it.'); } catch (e) { setErr(e.message); }
  }

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
          <h4>Brand (top bar and footer)</h4>
          <label className="cx-f"><span>Brand name</span><input type="text" value={brand.name} placeholder="GTG Paradise" onChange={(e) => setBrand((b) => ({ ...b, name: e.target.value }))} /></label>
          <label className="cx-f"><span>Tagline (leave empty to hide)</span><input type="text" value={brand.tagline} placeholder="Grow to Green" onChange={(e) => setBrand((b) => ({ ...b, tagline: e.target.value }))} /></label>
          <label className="cx-f"><span>Logo (PNG with transparent background works best)</span>
            {brand.logo && <img className="cx-prev" style={{ objectFit: 'contain', background: '#f1f5f2' }} src={brand.logo} alt="" />}
            <input type="file" accept="image/*" disabled={busy} onChange={(e) => pickLogo(e.target.files[0])} /></label>
          <div className="cx-row" style={{ justifyContent: 'flex-start', margin: '0 0 8px' }}>
            <button type="button" className="cx-btn pri" disabled={busy} onClick={() => run(() => api('config', { id: 'site', value: { ...site, brand } }), 'Brand saved.')}>Save brand</button>
            {brand.logo && <button type="button" className="cx-btn" disabled={busy} onClick={() => setBrand((b) => ({ ...b, logo: '' }))}>Remove logo</button>}
          </div>
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
