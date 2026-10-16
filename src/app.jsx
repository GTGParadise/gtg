import { useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import * as engine from './core/engine.js';
import { useEngine } from './useEngine.js';
import Nav from './components/Nav.jsx';
import TABS from './tabs/index.js';
import injectCss from './components/injectCss.js';

/** Active tab. Remounted on every engine render so DOM state resets exactly like the old innerHTML render. */
function View() {
  const rev = useEngine();
  const Tab = TABS[engine.tab] || TABS.cust;
  useLayoutEffect(() => { engine.afterCommit(); }, [rev]);
  // the Customer App tab keeps its login and iframe across engine renders
  return <div id="view" key={engine.tab === 'website' ? 'website' : rev}><Tab /></div>;
}

export default function App() {
  useEffect(() => {
    engine.setFlush(flushSync); // keep render() synchronous for code that reads the DOM right after it
    engine.boot();
  }, []);

  return (
    <>
      <header className="top"><div className="topin"><div className="hd">
        <div className="brand">
          <span className="logo" />
          <div className="bt"><h1 id="ttl" /><div className="tag" id="welcome">Welcome back!</div></div>
        </div>
        <div className="hr">
          <button className="gear" id="gear" aria-label="Settings">⚙</button>
          <button className="signout" id="signout" data-act="sbOut" aria-label="Sign out" title="Sign out" hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div></div></header>
      <nav id="nav" aria-label="Main sections"><Nav /></nav>
      <main>
        <div className="flt" id="flt" />
        <View />
        <div className="note" id="foot" style={{ textAlign: 'center', marginTop: 16 }} />
      </main>
      <button className="fab" id="fab" aria-label="Add new project">+</button>
      <div id="ov" role="dialog" aria-modal="true" aria-label="Form"><div id="box" /></div>
      <div id="iv" role="dialog" aria-modal="true" aria-label="Invoice" />
      <div id="ivp" role="dialog" aria-modal="true" aria-label="Invoice preview" />
      <div id="ov2" role="alertdialog" aria-modal="true" aria-label="Confirmation"><div id="box2" /></div>
      <div id="toast" />
    </>
  );
}

/* ---- shared styles (injected after the tab styles, as before: tabs -> base -> visual refresh) ---- */
const BASE_CSS = String.raw`
:root{--a:#0f766e;--card:#fff;--tx:#12302e;--mu:#5b7774;--bd:#cfe3e0;--fi:#f1f8f7;--gr:#15803d;--rd:#dc2626;--am:#b45309;
--ac:var(--a);--bg1:var(--a);--bg2:color-mix(in srgb,var(--a) 55%,#000);
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
*{box-sizing:border-box}html{scroll-padding-top:env(safe-area-inset-top,0px);background:var(--bg2)}
body{margin:0;min-height:100vh;background:linear-gradient(160deg,color-mix(in srgb,var(--bg1) 60%,transparent) 0%,color-mix(in srgb,var(--bg2) 82%,transparent) 100%) fixed,var(--bg2);color:var(--tx);font:13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:980px;margin:0 auto;padding:12px 12px 90px}
.hd{display:flex;align-items:center;justify-content:space-between;gap:8px}
h1{font-size:17px;margin:6px 0 10px;color:#fff;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hr{display:flex;align-items:center;gap:6px;flex:none}
.gear{border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.15);color:#fff;border-radius:10px;font-size:18px;padding:4px 10px}
nav{display:flex;gap:6px;position:sticky;top:env(safe-area-inset-top,0px);padding:6px 0;z-index:2;background:color-mix(in srgb,var(--bg1) 90%,transparent)}
nav button{flex:1;padding:9px 4px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff;border-radius:10px;font-size:12px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis}
nav button.on{background:var(--card);color:var(--ac);border-color:var(--card)}
.card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:12px;margin:10px 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.grid .full{grid-column:1/-1}
input,select,textarea{width:100%;padding:9px;border:1px solid var(--bd);border-radius:8px;background:var(--fi);color:var(--tx);font-size:13px;min-width:0}
input[type=color]{padding:2px;height:38px}input[type=range]{padding:0}
label{font-size:11px;color:var(--mu);display:block;margin-bottom:2px}
.btn{padding:10px;border:0;border-radius:8px;background:var(--ac);color:#fff;font-weight:600;font-size:13px}
.btn.full{width:100%}.btn.g{background:color-mix(in srgb,var(--ac) 14%,var(--card));color:var(--tx)}.btn.r{background:var(--rd);color:#fff}
.btn.sm{padding:8px 12px}.btn.sel{outline:3px solid var(--ac);outline-offset:1px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.stat{background:var(--card);border-radius:12px;padding:10px;text-align:center}
.stat b{display:block;font-size:15px}.stat span{font-size:10px;color:var(--mu)}
.row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.mu{color:var(--mu);font-size:12px}
.ib{border:0;background:none;font-size:15px;padding:0 5px;color:var(--ac)}.ib.d{color:var(--rd)}
.pill{display:inline-block;font-size:10px;padding:2px 8px;border-radius:99px;border:1px solid var(--bd);color:var(--mu)}
.gr{color:var(--gr)}.rd{color:var(--rd)}.am{color:var(--am)}
.bar{height:8px;background:var(--bd);border-radius:4px;overflow:hidden;margin-top:3px}.bar i{display:block;height:100%;background:var(--ac)}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{padding:7px 4px;text-align:right;border-bottom:1px solid var(--bd);white-space:nowrap}th:first-child,td:first-child{text-align:left}
.empty{text-align:center;color:#fff;padding:18px;opacity:.85}
.note{color:#fff;opacity:.9;font-size:12px}
.fab{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));width:58px;height:58px;border-radius:50%;border:0;background:var(--card);color:var(--ac);font-size:34px;line-height:1;box-shadow:0 4px 14px rgba(0,0,0,.35);z-index:5}
#ov{position:fixed;inset:0;background:rgba(0,10,40,.6);display:none;align-items:center;justify-content:center;padding:16px;z-index:10}
#ov.on{display:flex}#box{background:var(--card);border-radius:14px;padding:16px;width:100%;max-width:380px;max-height:85vh;overflow:auto}
#box h3{margin:0 0 10px;font-size:15px}.acts{display:flex;gap:8px;margin-top:14px}.acts button{flex:1}
.sw8{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
h2{font-size:13px;margin:0 0 8px}.f{margin-bottom:8px}
.k textarea,textarea{resize:vertical;min-height:110px;font-family:inherit;line-height:1.4}
.flt{display:flex;gap:6px;margin:6px 0}.mini{width:auto;padding:5px 8px;font-size:12px;border-radius:8px;background:var(--card)}
.k{display:flex;gap:10px;align-items:flex-start;padding:5px 0;border-top:1px solid var(--bd);min-width:0;word-break:break-word}
.k>span{flex:0 0 84px;font-size:11px;color:var(--mu);padding-top:3px}.k>div{flex:1;min-width:0}
.k select,.k input{padding:4px 6px;font-size:12px;width:auto;max-width:100%}.pre{white-space:pre-wrap}.t{font-size:14px}
input[type=checkbox]{width:auto;padding:0}.chk{display:flex;flex-wrap:wrap;gap:6px}
label.ck{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--tx);background:var(--fi);border:1px solid var(--bd);border-radius:8px;padding:4px 8px;margin:0}
#ov2{position:fixed;inset:0;background:rgba(0,10,40,.6);display:none;align-items:center;justify-content:center;padding:16px;z-index:20}
#ov2.on{display:flex}#box2{background:var(--card);border-radius:14px;padding:16px;width:100%;max-width:380px}#box2 h3{margin:0 0 10px;font-size:15px}
#toast{position:fixed;left:50%;transform:translateX(-50%);bottom:90px;background:#111;color:#fff;padding:8px 14px;border-radius:99px;font-size:12px;z-index:60;opacity:0;pointer-events:none;transition:opacity .2s;max-width:90%;text-align:center}#toast.on{opacity:1}
.bad{border-color:var(--rd)!important}
.dd{border:1px solid var(--bd);border-radius:8px;background:var(--fi)}.dd summary{padding:9px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:6px;font-size:13px}
.dd summary::-webkit-details-marker{display:none}.dd summary::after{content:"▾"}.dd[open] summary::after{content:"▴"}
.dd .chk{flex-direction:column;gap:4px;padding:8px;border-top:1px solid var(--bd);max-height:180px;overflow:auto}.dd label.ck{width:100%;background:var(--card)}
.tw{overflow-x:auto;background:var(--card);border:1px solid var(--bd);border-radius:12px;margin:10px 0;-webkit-overflow-scrolling:touch}
table.dt{width:100%;border-collapse:collapse;font-size:12px}
.dt th{background:color-mix(in srgb,var(--ac) 12%,var(--card));color:var(--tx);text-align:left;font-weight:600;font-size:11px;padding:0 10px;height:36px;border-bottom:1px solid var(--bd);white-space:nowrap}
.dt td{padding:0 10px;height:40px;border-bottom:1px solid var(--bd);white-space:nowrap;vertical-align:middle;background:var(--card)}
.dt tbody tr:last-child td{border-bottom:0}.dt tbody tr:hover td{background:var(--fi)}
.dt .r{text-align:right}.dt .c{text-align:center}.dt .ell{max-width:160px;overflow:hidden;text-overflow:ellipsis}
.dt th.act,.dt td.act{position:sticky;right:0;text-align:center;width:76px;box-shadow:-1px 0 0 var(--bd)}
.dt th.act{background:color-mix(in srgb,var(--ac) 12%,var(--card))}
.dt td.none{text-align:center;color:var(--mu);height:56px}
.dt.cp{font-size:11px}.dt.cp th{padding:0 6px;height:28px;font-size:10.5px;white-space:normal;line-height:1.1}
.dt.cp td{padding:2px 6px;height:auto;min-height:30px}.dt.cp td.wrap{min-width:100px;max-width:200px;padding-top:3px;padding-bottom:3px;line-height:1.25}
.dt.cp .clamp{font-size:10.5px;-webkit-line-clamp:2}.dt.cp td{text-align:left}.dt.cp td.act{text-align:center}
.dt.cp select,.dt.cp input[type=date]{height:24px;padding:1px 3px;font-size:11px;border-radius:6px}
.dt.cp input[type=date]{width:104px}.dt.cp select{max-width:96px}
.dt.cp th.act,.dt.cp td.act{width:48px;padding:0 2px}.dt.cp .ib{font-size:14px;padding:0 3px}
@media(max-width:520px){.dt.cp th,.dt.cp td{padding-left:4px;padding-right:4px}.dt.cp td.wrap{min-width:64px;max-width:150px}
.dt.cp input[type=date]{width:84px;font-size:10.5px;padding:1px 2px}.dt.cp input[type=date]::-webkit-calendar-picker-indicator{display:none}
.dt.cp select{max-width:80px;font-size:10.5px;padding:1px 1px}.dt.cp th.act,.dt.cp td.act{width:38px}.dt.cp .ib{padding:0 1px}}
.dt select,.dt input[type=date]{height:28px;padding:2px 6px;font-size:12px;width:auto}
@keyframes hl{from{background:color-mix(in srgb,var(--ac) 35%,var(--card))}to{background:var(--card)}}.dt tr.new td{animation:hl 2.6s ease-out}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:8px;margin:10px 0}
.pc{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:3px;min-width:0}
.pc .pn{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pc .ell2{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pc .nv{margin-top:4px;padding-top:6px;border-top:1px solid var(--bd);display:flex;align-items:center;gap:6px;flex-wrap:wrap}.pc .nv label{margin:0}
.pc .nv input{width:auto;height:28px;padding:2px 6px;font-size:12px}
@keyframes hl2{from{background:color-mix(in srgb,var(--ac) 35%,var(--card))}to{background:var(--card)}}.pc.new{animation:hl2 2.6s ease-out}
.sd{background:var(--card);border:1px solid var(--bd);border-radius:12px;margin:8px 0}
.sd summary{padding:11px 12px;font-weight:600;font-size:13px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}
.sd summary::-webkit-details-marker{display:none}.sd summary::after{content:"▾";color:var(--mu)}.sd[open] summary::after{content:"▴"}
.sd .in{padding:0 12px 12px;border-top:1px solid var(--bd);padding-top:10px}
.pc{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:6px 10px;align-content:start}
.pc .L,.pc .R{min-width:0;display:flex;flex-direction:column;gap:3px}.pc .R{align-items:flex-end;text-align:right}
.pc .L>.pill,.pc .L>.bdg{align-self:flex-start}.pc .ell2{max-width:100%}
.pc .ac{white-space:nowrap}.pc .m{display:flex;justify-content:space-between;gap:8px;width:100%;font-size:12px}.pc .m span{color:var(--mu)}
.pc.click{cursor:pointer}.pc.click:hover{border-color:var(--ac)}
.pc .nv2{display:flex;flex-direction:column;align-items:flex-end;gap:2px;max-width:100%}.pc .nv2 label{margin:0}
.pc .nv2 input,.pc .R select{width:auto;max-width:100%;height:28px;padding:2px 6px;font-size:12px}
.bdg{display:inline-block;font-size:10px;font-weight:600;padding:2px 8px;border-radius:99px;border:1px solid currentColor;width:fit-content}
.pill.gr,.pill.rd{border-color:currentColor}.sh{color:#fff;font-size:12px;font-weight:600;margin:12px 2px 4px}
nav{gap:4px;overflow:visible}nav button{flex:1 1 0;min-width:0;padding:5px 2px;font-size:11px;line-height:1.15;white-space:normal;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center;min-height:34px;border-radius:8px}
@media(min-width:640px){nav button{font-size:13px;padding:8px 6px;min-height:36px}}
@media(max-width:520px){main{padding:8px 8px 84px}h1{font-size:15px;margin:4px 0 6px}.stats{gap:6px}.stat{padding:8px 4px}.card{margin:8px 0;padding:10px}.pgrid{gap:6px;margin:8px 0}}
.dt td.wrap{white-space:normal;min-width:150px;max-width:260px;padding-top:6px;padding-bottom:6px}.dt td.wrap .clamp{margin-top:2px}
.pc .full{grid-column:1/-1}.clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap}
.ths{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}.ths img{width:64px;height:64px;object-fit:cover;border-radius:8px;cursor:pointer;border:1px solid var(--bd)}
.th{position:relative}.th .x{position:absolute;top:-6px;right:-6px;border:0;border-radius:50%;width:18px;height:18px;background:var(--rd);color:#fff;font-size:10px;padding:0;line-height:18px}
.th0{width:64px;height:64px;border-radius:8px;background:var(--fi);display:flex;align-items:center;justify-content:center;color:var(--mu)}
.an .pre{margin-top:4px}.bdg.am{color:var(--am)}
button{font-family:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
nav button:focus-visible,.gear:focus-visible{outline-color:#fff}
.ib{min-width:30px;min-height:30px}
@media(max-width:520px){#box input,#box select,#box textarea,#box2 input{font-size:16px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
/* ===== GTG Paradise design system ===== */
:root{--brand:#14532D;--a:#0D9488;--ad:#0F766E;--soft:#F0FDF4;--card:#fff;--tx:#1F2937;--mu:#4B5563;--bd:#D8E6DC;--fi:#F8FCF9;--gr:#15803D;--rd:#B91C1C;--am:#B45309;--ac:var(--a);--shadow:0 1px 2px rgba(20,83,45,.06),0 4px 14px rgba(20,83,45,.06);--r:14px;padding-top:0}
html{background:var(--soft)}
body{background:var(--soft);color:var(--tx);font:14px/1.45 -apple-system,"Segoe UI",Roboto,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:1040px;padding:16px 14px 96px}
.top{position:sticky;top:0;z-index:8;background:linear-gradient(rgba(20,83,45,.93),rgba(20,83,45,.9)),var(--brand);padding:calc(14px + env(safe-area-inset-top,0px)) 14px 16px;color:#fff}
.topin{max-width:1040px;margin:0 auto}
.brand{display:flex;align-items:center;gap:12px;min-width:0;flex:1}
.logo{flex:none;width:44px;height:44px;border-radius:12px;background:#fff;color:var(--brand);display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.bt{min-width:0}
h1{font-size:19px;font-weight:700;letter-spacing:.2px;margin:0;color:#fff}
.tag{font-size:11.5px;color:#D1FAE5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.gear{width:44px;height:44px;display:grid;place-items:center;padding:0;border-radius:12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);font-size:22px;line-height:1}
.gear:hover{background:rgba(255,255,255,.22)}
#nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:6;display:flex;gap:6px;padding:8px max(12px,calc((100% - 1040px)/2 + 14px));background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--bd)}
#nav button{flex:1 1 0;min-width:0;min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 4px;border:1px solid transparent;border-radius:12px;background:transparent;color:var(--mu);font-size:11.5px;font-weight:600;line-height:1.15;text-align:center;white-space:normal;transition:background .15s,color .15s}
#nav button svg{width:20px;height:20px;flex:none}
#nav button span{overflow-wrap:break-word}
#nav button:hover{background:var(--soft);color:var(--brand)}
#nav button.on{background:var(--a);color:#fff;box-shadow:0 2px 8px rgba(13,148,136,.35)}
@media(min-width:640px){#nav button{flex-direction:row;gap:8px;min-height:46px;font-size:14px}}
.flt{display:flex;align-items:center;gap:8px;margin:2px 0 14px;flex-wrap:wrap}
.mini{background-color:#fff;border:1px solid var(--bd);border-radius:10px;min-height:40px;padding:6px 12px;font-size:14px;font-weight:500;color:var(--tx);box-shadow:var(--shadow)}
select,select.mini{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%234B5563' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;background-size:14px}
select.mini,.dt select,.dt.cp select,.pc .R select{padding-right:28px}
.dt.cp select{max-width:112px}
.card,.pc,.stat,.tw,.sd{background:var(--card);border:1px solid var(--bd);border-radius:var(--r);box-shadow:var(--shadow)}
.stats{gap:10px;margin-bottom:14px}
.stat{display:flex;flex-direction:column-reverse;align-items:flex-start;text-align:left;padding:14px;border-left:4px solid var(--bd)}
.stat b{font-size:26px;line-height:1.1;font-weight:700;color:var(--brand);font-variant-numeric:tabular-nums}
.stat span{font-size:11.5px;font-weight:600;color:var(--mu);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px}
.stat b.gr{color:var(--gr)}.stat b.rd{color:var(--rd)}.stat b.am{color:var(--am)}
.stat.tot{border-left-color:var(--brand)}.stat.opn{border-left-color:var(--a)}.stat.dn,.stat.s-gr{border-left-color:var(--gr)}.stat.s-rd{border-left-color:var(--rd)}.stat.s-am{border-left-color:var(--am)}
.pc{padding:14px;gap:8px 12px;transition:box-shadow .15s,border-color .15s}
.pc.click:hover{border-color:var(--a);box-shadow:0 2px 4px rgba(20,83,45,.08),0 8px 20px rgba(20,83,45,.1)}
.pc .pn{font-size:15px;font-weight:700;color:var(--brand)}
.pc .pn.gr{color:var(--gr)}.pc .pn.rd{color:var(--rd)}
.pill{background:var(--soft);color:var(--brand);border-color:var(--bd);font-weight:600;padding:2px 9px}
.pill.gr{background:#DCFCE7;color:var(--gr);border-color:#BBF7D0}.pill.rd{background:#FEE2E2;color:var(--rd);border-color:#FECACA}
.bdg{background:#fff;padding:2px 10px}
.bar{background:#DCEFE3}.bar i{background:var(--a)}
.btn{min-height:44px;padding:10px 16px;border-radius:12px;background:var(--a);color:#fff;font-size:14px;font-weight:600;transition:background .15s}
.btn:hover{background:var(--ad)}
.btn.g{background:var(--soft);color:var(--brand);border:1px solid var(--bd)}.btn.g:hover{background:#DCFCE7}
.btn.r{background:var(--rd)}.btn.r:hover{background:#991B1B}
.btn.sm{min-height:40px;padding:8px 14px}
.ib{color:var(--ad)}.ib.d{color:var(--rd)}
input,select,textarea{border-radius:10px;border:1px solid #C9DACF;background-color:var(--fi);color:var(--tx);font-size:14px}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--a);box-shadow:0 0 0 3px rgba(13,148,136,.2)}
label{font-size:12px;font-weight:600;color:var(--mu)}
#box input:not([type=checkbox]),#box select,#box2 input{min-height:44px}
#ov,#ov2{background:rgba(20,83,45,.45);backdrop-filter:blur(2px)}
#box,#box2{border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,.25);padding:20px;max-width:420px}
#box h3,#box2 h3{font-size:17px;color:var(--brand)}
.sh{color:var(--brand);font-size:13px;text-transform:uppercase;letter-spacing:.5px;margin:18px 2px 8px}
.note{color:var(--mu);opacity:1}
.sd summary{color:var(--brand);min-height:48px;font-size:14px}
.dt th,.dt th.act{background:var(--soft)}.dt th{color:var(--brand);text-transform:uppercase;letter-spacing:.3px;font-size:11px}
.dt tbody tr:hover td{background:var(--soft)}
.fab{width:60px;height:60px;background:var(--a);color:#fff;font-size:32px;font-weight:300;box-shadow:0 6px 18px rgba(13,148,136,.45),0 2px 4px rgba(0,0,0,.15);transition:transform .15s,background .15s}
.fab:hover{background:var(--ad);transform:translateY(-2px)}.fab:active{transform:scale(.95)}
#toast{background:var(--tx)}
.empty{color:var(--mu);background:#fff;border:1px dashed #B7D3C0;border-radius:var(--r);padding:20px;opacity:1}
.es{background:#fff;border:1px solid var(--bd);border-radius:18px;box-shadow:var(--shadow);padding:32px 20px 28px;text-align:center;margin:8px auto;max-width:460px}
.es svg{width:132px;height:112px;margin-bottom:6px}
.es h3{margin:6px 0;font-size:18px;color:var(--brand)}
.es p{margin:0 auto 18px;max-width:340px;color:var(--mu);font-size:14px}
@media(max-width:520px){main{padding:12px 12px 96px}.top{padding-left:12px;padding-right:12px}.stat{padding:10px}.stat b{font-size:21px}.stat span{font-size:10px}
#ov{padding:12px}#box{max-width:none;border-radius:18px;max-height:100%;padding-bottom:20px}}
.logo{width:48px;height:48px;overflow:hidden}
.logo img{width:100%;height:100%;object-fit:cover;padding:0;border-radius:inherit;display:block}
.lg-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.lgp{width:72px;height:72px;border:1px dashed #B7D3C0;border-radius:14px;background:var(--soft);display:grid;place-items:center;color:var(--mu);font-size:11px;overflow:hidden}
.lgp img{width:100%;height:100%;object-fit:cover;display:block}
.flt:empty{display:none}
/* bottom tab bar (compact) */
#nav{position:fixed;top:auto;bottom:0;left:0;right:0;z-index:6;gap:2px;padding:3px max(6px,calc((100% - 1040px)/2 + 6px)) calc(3px + env(safe-area-inset-bottom,0px));border-bottom:0;border-top:1px solid var(--bd);box-shadow:0 -2px 10px rgba(0,0,0,.08)}
#nav button{min-height:38px;flex-direction:column;gap:1px;padding:3px 2px;font-size:9.5px;border-radius:8px}
#nav button svg{width:16px;height:16px}
@media(min-width:640px){#nav button{flex-direction:row;gap:6px;min-height:34px;font-size:12px;padding:4px 8px}#nav button svg{width:16px;height:16px}}
main{padding-bottom:calc(120px + env(safe-area-inset-bottom,0px))}
.fab{bottom:calc(64px + env(safe-area-inset-bottom,0px))}
#toast{bottom:calc(130px + env(safe-area-inset-bottom,0px))}
#ov{align-items:center;padding:12px}#box{max-height:100%}
.ic{vertical-align:-2px;margin-right:3px;flex:none}
.ib{display:inline-flex;align-items:center;justify-content:center}.ib svg{display:block}
.seg{display:flex;gap:6px;margin-bottom:8px}.seg button{flex:1;min-height:40px;border:1px solid var(--bd);border-radius:10px;background:var(--soft);color:var(--brand);font-weight:600;font-size:13px}.seg button.on{background:var(--a);border-color:var(--a);color:#fff}
.p91{display:flex;align-items:stretch}.p91 span{display:grid;place-items:center;padding:0 12px;background:var(--soft);border:1px solid #C9DACF;border-right:0;border-radius:10px 0 0 10px;font-weight:600;color:var(--brand)}.p91 input{border-radius:0 10px 10px 0;min-width:0}.p91.bad span,.p91.bad input{border-color:var(--rd)}

/* compact stat filter buttons */
.stats.fb{display:flex;gap:6px;margin-bottom:8px}
.fbtn{display:inline-flex;align-items:baseline;gap:6px;padding:4px 11px;border:1px solid var(--bd);border-radius:99px;background:#fff;color:var(--mu);font-size:12px;font-weight:600;min-height:28px;box-shadow:none}
.fbtn b{font-size:14px;color:var(--brand);font-variant-numeric:tabular-nums}
.fbtn.on{background:var(--a);border-color:var(--a);color:#fff}.fbtn.on b{color:#fff}
/* compact project rows */
.pgrid.cm{gap:6px;margin:6px 0}
.pc.cm{padding:7px 12px;gap:2px 8px;align-items:center}
.pc.cm .L{gap:1px}.pc.cm .nm{display:flex;align-items:center;gap:6px;min-width:0}
.pc.cm .pn{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pc.cm .nv2{flex-direction:row;align-items:center;gap:6px}.pc.cm .nv2 label{font-size:11px}
.pc.cm .nv2 input{height:26px;font-size:12px}.pc.cm .R{gap:1px}
.ell1{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pc.click .nv2{cursor:default}
.wbar{display:flex;align-items:center;justify-content:space-between;gap:8px}
.wbar .ac{display:flex;gap:4px}.wbar .ib{border:1px solid var(--bd);border-radius:8px;padding:6px 9px;background:var(--fi)}
.wbar .ib.d{border-color:color-mix(in srgb,var(--rd) 35%,var(--bd))}
.wd .L .loc{display:flex;align-items:center;gap:4px}
.wd .R .vc{font-size:12px;color:var(--mu)}.wd .R .vc b{color:var(--tx);font-size:14px}
.addt{margin:8px 0}
.wd .L .st{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px}
.btn.xs{padding:5px 10px;font-size:12px}
.wd .st{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.wd select.stsel{appearance:none;-webkit-appearance:none;width:auto;height:auto;font-size:12px;font-weight:700;padding:4px 26px 4px 12px;border:1px solid currentColor;border-radius:99px;color:var(--tx);background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23555' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 9px center}
.wd select.stsel.gr{color:var(--gr)}.wd select.stsel.am{color:var(--am)}
.wd .tot{font-size:13px;color:var(--mu)}.wd .tot b{color:var(--tx);font-size:15px}
.wtabs{display:flex;gap:8px;margin:14px 0 8px}
.wtabs button{flex:1;border:1px solid var(--bd);background:#fff;color:var(--tx);border-radius:10px;padding:10px 8px;font-weight:700;font-size:13px;cursor:pointer}
.wtabs button.on{background:var(--ac);border-color:var(--ac);color:#fff}
@media(max-width:480px){.dt.cp.tk td{font-size:10.5px}.dt.cp.tk th{font-size:9px;letter-spacing:0}.dt.cp.tk th,.dt.cp.tk td{padding-left:2px;padding-right:2px}.dt.cp.tk td.vn,.dt.cp.tk th.vn{width:38px}.dt.cp.tk td.wrap{min-width:48px}.dt.cp.tk td.tm{white-space:normal}}
.dt.cp.tk td.any{word-break:break-all;min-width:70px}
.wsum{font-size:12px;color:var(--mu);margin:6px 4px}.wsum b{color:var(--tx);font-size:13px}
.t12{display:flex;gap:6px}.t12 select{flex:1;min-width:0;padding-right:18px}
.dt.cp.tk th,.dt.cp.tk td{padding-left:3px;padding-right:3px}
.dt.cp.tk td.wrap{min-width:60px;max-width:140px;overflow-wrap:break-word}
.wd .L .btn.xs{padding:5px 12px;font-size:12px;line-height:1.2;height:auto;min-height:0;width:auto;flex:none}
.dt.cp td.vn{text-align:center;font-weight:700;width:60px}.dt.cp th.vn{text-align:center}
.dt.cp td.tm{white-space:nowrap}

/* project card (collapsible) + one-line time */
.pc.wd2{display:block;padding:0}
.wd2 .whd{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:12px 14px;cursor:pointer;min-height:48px}
.wd2 .wl{display:flex;align-items:center;gap:6px;min-width:0;flex:1}
.wd2 .wl .pn{white-space:normal;overflow-wrap:anywhere}
.wd2 .chev{color:var(--mu);font-size:12px;flex:none}
.wd2 .wr{text-align:right;flex:none}
.wd2 .wdate{font-weight:700;font-size:14px;color:var(--tx);font-variant-numeric:tabular-nums}
.wd2 .wr .dtag{margin-top:1px}.wd2 .wr .dtag span{margin-left:0!important}
.wd2 .wbody{padding:0 14px 6px;border-top:1px solid var(--bd)}
.wd2 .kv .ac{display:flex;gap:4px}.wd2 .kv .ib{border:1px solid var(--bd);border-radius:8px;padding:6px 9px;background:var(--fi)}
.wd2 .kv{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:7px 0;border-bottom:1px solid var(--bd);font-size:13px}
.wd2 .kv span{color:var(--mu);flex:none}
.wd2 .kv b{text-align:right;min-width:0;overflow-wrap:anywhere;font-weight:600}
.wd2 .kv input[type=date]{width:auto;height:30px;padding:2px 6px;font-size:12px}
.wd2 .st1{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;padding:0 14px 12px;font-size:12px;color:var(--mu);white-space:nowrap}
.wd2 .st1 b{color:var(--tx);font-size:13px}
.wd2 .st1 select.stsel{padding:3px 22px 3px 9px;font-size:12px}
.t2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.t2 .f{min-width:0}.t2 .t12{gap:3px}
#box .t2 select{padding:6px 10px 6px 4px;font-size:14px;background-position:right 2px center;background-size:9px;min-width:0}

/* project list rows + search */
.wsearch{position:relative;margin:0 0 10px}
.wsearch input{padding-right:42px;min-height:44px;background:#fff;box-shadow:var(--shadow)}
.wclr{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:var(--mu);font-size:16px}
.wclr[hidden]{display:none}
.pc.wrow{grid-template-columns:minmax(0,1fr) auto;padding:9px 12px;gap:2px 10px;align-items:center}
.wrow .wL{min-width:0;display:flex;flex-direction:column;gap:3px}
.wrow .wr1{display:flex;align-items:center;gap:8px;min-width:0}
.wrow .wr1 .pill{flex:none}
.wrow .wr1 .pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.wrow .wr2{display:flex;align-items:center;gap:10px;min-width:0;font-size:12px}
.wrow .wr2 .ell1{flex:1 1 auto;min-width:0}.wrow .wr2 .ph{flex:none}
.wrow .wR{text-align:right;align-self:start}
.wrow .wdt{font-weight:700;font-size:13px;white-space:nowrap;font-variant-numeric:tabular-nums}
.wrow .wR span{margin-left:0!important}

/* professional dropdown */
.pc.wd2{overflow:hidden}
.wd2 .whd:hover{background:var(--fi)}
.wd2 .chev{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--soft);color:var(--brand);flex:none}
.wd2 .chev svg{width:16px;height:16px;transition:transform .2s}.wd2 .chev.up svg{transform:rotate(180deg)}
.wd2 .wbody{padding:12px 14px 14px;border-top:1px solid var(--bd);background:var(--fi)}
.wd2 .ig{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}
.wd2 .it{min-width:0;display:flex;flex-direction:column;gap:3px}.wd2 .it.full{grid-column:1/-1}
.wd2 .it .k{font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--mu)}
.wd2 .it b{font-size:14px;font-weight:600;color:var(--tx);overflow-wrap:anywhere}
.wd2 .it a{color:var(--ad);text-decoration:none;font-weight:700}
.wd2 .it input[type=date]{width:auto;max-width:190px;height:36px;padding:4px 10px;font-size:13px;background:#fff}
.wd2 .wfoot{display:flex;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid var(--bd)}
.wd2 .ab{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;border-radius:10px;border:1px solid var(--bd);background:#fff;color:var(--brand);font-weight:700;font-size:13px}
.wd2 .ab:hover{background:var(--soft)}
.wd2 .ab.d{color:var(--rd);border-color:color-mix(in srgb,var(--rd) 35%,var(--bd))}.wd2 .ab.d:hover{background:#FEF2F2}
.wd2 .ab svg{width:16px;height:16px}
.dt.cp.tk th.act,.dt.cp.tk td.act{width:66px;padding:0 2px;white-space:nowrap}
.dt.cp.tk td.act .ib{min-width:28px}

.xbar{display:flex;justify-content:flex-end;margin:0 0 8px}
.xbtn{flex:none;width:36px;height:36px;border-radius:50%;border:1px solid var(--bd);background:#fff;color:var(--mu);display:grid;place-items:center;padding:0;box-shadow:var(--shadow)}
.xbtn svg{width:18px;height:18px}.xbtn:hover{background:var(--soft);color:var(--brand)}
.card .row .mini{flex:1;min-width:0}
.card .row{gap:10px}

/* invoice editor + preview */
#ov2{z-index:50}
#iv,#ivp{position:fixed;inset:0;z-index:30;background:var(--soft);display:none;flex-direction:column}
#ivp{z-index:35;background:#d1d5db}#iv.on,#ivp.on{display:flex}
.ivh{display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:var(--brand);color:#fff;flex:none}
.ivh h2{flex:1;margin:0;font-size:16px;font-weight:700;min-width:0;display:flex;flex-direction:column;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ivh h2 small{font-size:11px;font-weight:500;opacity:.8}
.ivh .hb{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;display:grid;place-items:center;padding:0}
.ivh .hb svg{width:20px;height:20px}
.ivh .sv{flex:none;height:40px;padding:0 16px;border-radius:99px;border:0;background:#fff;color:var(--brand);font-weight:700;font-size:14px;display:inline-flex;align-items:center;gap:6px}
.ivh .sv svg{width:16px;height:16px}
.ivb{flex:1;overflow:auto;padding:12px 12px 40px;width:100%;max-width:720px;margin:0 auto;-webkit-overflow-scrolling:touch}
.ivs{background:#fff;border:1px solid var(--bd);border-radius:14px;padding:14px;margin-bottom:12px}
.ivs h3{font-size:11.5px;letter-spacing:.7px;text-transform:uppercase;color:var(--brand);margin:0 0 10px}
.ivs summary{font-weight:700;color:var(--brand);cursor:pointer;display:flex;flex-direction:column;gap:2px;margin:-2px 0 2px}.ivs summary small{font-weight:500;color:var(--mu);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ivs details[open] summary{margin-bottom:10px}
.itm{border:1px solid var(--bd);border-radius:12px;padding:10px;margin-bottom:10px;background:var(--fi)}.itr{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;color:var(--brand)}
.itm .g3{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px}.itm .f{margin-bottom:6px}
.ivtot{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:10px 12px;border-radius:10px;background:var(--soft);border:1px solid var(--bd)}.ivtot b{font-size:18px;color:var(--brand)}
.ivdf{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:var(--mu)}.ivdf input{width:auto;margin-top:2px}
.ivc .R .ac{display:flex;gap:2px}
/* uploaded invoice PDF */
.upl{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff;border:1px dashed var(--brand);border-radius:14px;padding:12px 14px;margin:10px 0}
.upl b{font-size:13px;color:var(--brand)}.upl .btn{flex:none}
.upf{display:flex;align-items:center;gap:10px;border:1px solid var(--bd);border-radius:12px;padding:10px;background:var(--fi)}
.upi{flex:none;width:38px;height:44px;border-radius:6px;background:#FEE2E2;color:var(--rd);font-weight:800;font-size:11px;display:grid;place-items:center}
.upn{flex:1;min-width:0}.upn b{display:block;font-size:13px;word-break:break-all}
.upf .btn{flex:none;display:grid;place-items:center;text-decoration:none}
.ext{border:1px solid var(--bd);border-radius:12px;padding:8px 10px;margin:0 0 10px;background:var(--fi)}.ext summary{font-size:13px;font-weight:600;cursor:pointer}.ext textarea{width:100%;margin-top:8px;font-size:12px;min-height:140px}
.cfm{border:1px solid var(--bd);border-radius:12px;overflow:hidden;margin:0 0 10px}
.cfm div{display:flex;gap:10px;justify-content:space-between;padding:7px 10px;font-size:13px;border-bottom:1px solid var(--bd)}.cfm div:last-child{border:0}
.cfm span{color:var(--mu);flex:none}.cfm b{text-align:right;word-break:break-word;min-width:0}
#box2{max-height:90vh;overflow:auto}
.ivpb{flex:1;overflow:auto;padding:8px;-webkit-overflow-scrolling:touch}
.ivpb .isheet{margin:0 auto;box-shadow:0 2px 14px rgba(0,0,0,.25)}
/* the invoice sheet (A4 @ 794px) */
.isheet{width:794px;min-height:1100px;box-sizing:border-box;background:#fff;color:#222;padding:36px 52px 30px;text-align:left;font:12.5px/1.38 "Times New Roman",Times,"Noto Serif",Georgia,serif;position:relative}
.isheet *{box-sizing:border-box}
.ihd{display:flex;align-items:center;gap:20px;min-height:80px}.ilogo{width:80px;height:80px;object-fit:contain;flex:none}
.itx{flex:1;text-align:center;padding-right:80px}.ihd:not(:has(.ilogo)) .itx{padding-right:0}
.inm{font-size:25px;font-weight:700;color:#1E6B2E;letter-spacing:.5px;text-transform:uppercase}.itg{font-size:12.5px;font-style:italic;color:#666;margin-top:3px}
.icn{text-align:center;font-size:12px;margin-top:6px;color:#222}
.irule{height:2px;background:#1E6B2E;margin:10px 0 10px}
.ittl{text-align:center;font-size:26px;font-weight:700;color:#1E6B2E;margin-bottom:12px}
.imr{display:flex;gap:12px;margin-bottom:8px}.im{flex:1;min-width:0}.im span{display:block;font-size:10.5px;font-weight:700;color:#1E6B2E;letter-spacing:.4px}.im b{font-weight:400;font-size:13px;overflow-wrap:anywhere}
.ilb{font-size:13px;font-weight:700;color:#1E6B2E;margin-top:4px}.ilv{font-size:12.5px;margin-bottom:5px;overflow-wrap:anywhere}
.itb{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:10px;font-size:12.5px}
.itb th{background:#1E6B2E;color:#fff;padding:7px 8px;text-align:center;font-weight:700;border-right:1px solid rgba(255,255,255,.5)}.itb th.l{text-align:left}
.itb td{padding:6px 8px;text-align:left;border:1px solid #cfcfcf;vertical-align:middle;overflow-wrap:anywhere}.itb td.c{text-align:center}.itb th.l{text-align:left}
.itb tbody tr:nth-child(odd) td{background:#E8F4EA}.itb tr{page-break-inside:avoid}
.itot{display:flex;justify-content:flex-end;align-items:stretch;margin-top:20px;gap:0}.itot span{align-self:center;padding-right:12px;font-weight:700;color:#1E6B2E;font-size:15px}
.itot b{min-width:200px;text-align:center;padding:7px 14px;background:#E8F4EA;border:1px solid #cfcfcf;font-size:16px}
.iw{font-style:italic;font-size:12px;margin-top:6px;color:#333}
.ish{font-size:14px;font-weight:700;color:#1E6B2E;margin:16px 0 6px;text-transform:uppercase}.ish.n{text-transform:none}
.itm2{margin:0;padding-left:20px;font-size:12px}.itm2 li{margin-bottom:3px;padding-left:2px}
.ipg{display:flex;gap:12px;font-size:12.5px}.ipg div{flex:1;min-width:0;overflow-wrap:anywhere}.ipg span{display:block;font-size:10.5px;font-weight:700;color:#1E6B2E;margin-bottom:3px}
.ifoot{page-break-inside:avoid;break-inside:avoid}.isg{display:flex;justify-content:space-between;margin-top:26px;gap:12px}.isg b{display:block;font-size:12.5px}.isg small{color:#888;font-size:11px}.isg .r{text-align:right}
.ithx{text-align:center;font-style:italic;color:#1E6B2E;font-size:12px;margin-top:22px}

/* small status filter chips */
.fchips{display:flex;gap:6px;margin:0 0 10px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}.fchips::-webkit-scrollbar{display:none}
.fc{flex:none;min-height:30px;padding:4px 12px;border-radius:99px;border:1px solid var(--bd);background:#fff;color:var(--mu);font-size:12px;font-weight:600;line-height:1.2}
.fc.on{background:var(--a);border-color:var(--a);color:#fff}
.dt .ths{gap:4px;margin-top:4px}.dt .ths img{width:36px;height:36px;border-radius:6px}.dt .th .x{width:16px;height:16px;line-height:16px;font-size:9px}
`;
injectCss('base', BASE_CSS);

const REFRESH_CSS = String.raw`/* GTG visual refresh — presentation only. No business logic or data behavior. */
#gtg-legacy-root{
  --gtg-forest:#164e35;
  --gtg-forest-deep:#103d2a;
  --gtg-leaf:#16845b;
  --gtg-mint:#e8f5ec;
  --gtg-line:#dce9df;
  --gtg-ink:#172b22;
  --gtg-muted:#63766a;
}
#gtg-legacy-root{color:var(--gtg-ink)}
body{background:radial-gradient(ellipse at 8% 0%,#e3f3e7 0,transparent 42%),#f5f8f5!important}
#gtg-legacy-root .top{background:linear-gradient(120deg,var(--gtg-forest-deep),var(--gtg-forest) 62%,#216b48);box-shadow:0 5px 18px rgba(16,61,42,.14)}
#gtg-legacy-root .logo{border-radius:15px;background:#f5fff7;color:var(--gtg-forest);box-shadow:0 4px 12px rgba(0,0,0,.12)}
#gtg-legacy-root .tag{color:#d9f3e1;letter-spacing:.1px}
#gtg-legacy-root #nav{border-bottom-color:rgba(220,233,223,.9);box-shadow:0 4px 16px rgba(22,78,53,.04)}
#gtg-legacy-root #nav button{border-radius:12px;transition:background .18s ease,color .18s ease,transform .18s ease}
#gtg-legacy-root #nav button.on{background:var(--gtg-forest);box-shadow:0 4px 12px rgba(22,78,53,.2)}
#gtg-legacy-root #nav button:hover{transform:translateY(-1px)}
#gtg-legacy-root main{max-width:1160px;padding-top:20px}
#gtg-legacy-root .card,
#gtg-legacy-root .pc,
#gtg-legacy-root .stat,
#gtg-legacy-root .tw,
#gtg-legacy-root .sd{border-color:var(--gtg-line);box-shadow:0 2px 5px rgba(23,43,34,.025),0 8px 24px rgba(23,43,34,.035)}
#gtg-legacy-root .card{border-radius:16px;padding:16px}
#gtg-legacy-root .sh{color:var(--gtg-forest);font-size:12px;letter-spacing:.8px}
#gtg-legacy-root h2{color:var(--gtg-forest);font-size:14px;font-weight:750;letter-spacing:.05px}
#gtg-legacy-root .stat{border-radius:16px;padding:16px;border-left-width:4px}
#gtg-legacy-root .stat b{color:var(--gtg-forest);font-size:clamp(20px,2.4vw,28px);letter-spacing:-.5px}
#gtg-legacy-root .stat span{letter-spacing:.65px}
#gtg-legacy-root .pc{border-radius:16px}
#gtg-legacy-root .pc .pn{color:var(--gtg-forest);font-weight:750}
#gtg-legacy-root .pill{background:#f1f8f2}
#gtg-legacy-root .btn{background:var(--gtg-leaf);box-shadow:0 2px 4px rgba(22,132,91,.12)}
#gtg-legacy-root .btn:hover{background:#116b49}
#gtg-legacy-root .btn.g{background:#edf7ef;color:var(--gtg-forest);border:1px solid #d4e8d8;box-shadow:none}
#gtg-legacy-root .btn.g:hover{background:#e0f1e4}
#gtg-legacy-root .btn.r{background:#b42332}
#gtg-legacy-root input:not([type=checkbox]):not([type=radio]),
#gtg-legacy-root select,
#gtg-legacy-root textarea{border-color:#cfdfd3;background-color:#fbfdfb;border-radius:11px}
#gtg-legacy-root input:focus,
#gtg-legacy-root select:focus,
#gtg-legacy-root textarea:focus{border-color:var(--gtg-leaf);box-shadow:0 0 0 3px rgba(22,132,91,.13)}
#gtg-legacy-root .mini{border-color:var(--gtg-line);border-radius:11px}
#gtg-legacy-root .dt th,
#gtg-legacy-root .dt th.act{background:#edf6ef;color:var(--gtg-forest)}
#gtg-legacy-root .dt tbody tr:hover td{background:#f3faf4}
#gtg-legacy-root .bar{background:#e2eee5}
#gtg-legacy-root .bar i{background:linear-gradient(90deg,#16845b,#46a66e)}
#gtg-legacy-root .fab{background:var(--gtg-forest);box-shadow:0 8px 20px rgba(22,78,53,.24)}
#gtg-legacy-root .fab:hover{background:var(--gtg-forest-deep)}
#gtg-legacy-root #box,
#gtg-legacy-root #box2{border:1px solid var(--gtg-line)}
#gtg-legacy-root .empty{background:#fbfdfb;border-color:#cbded0}
#gtg-legacy-root .note{color:var(--gtg-muted)}
@media(min-width:900px){
  #gtg-legacy-root main{padding-left:22px;padding-right:22px}
  #gtg-legacy-root .stats{gap:14px}
  #gtg-legacy-root .card{padding:20px}
}
@media(max-width:520px){
  #gtg-legacy-root main{padding:12px 10px calc(120px + env(safe-area-inset-bottom,0px))}
  #gtg-legacy-root .card{padding:13px;border-radius:14px}
  #gtg-legacy-root .stat{padding:11px 9px;border-radius:13px}
  #gtg-legacy-root .stat b{font-size:clamp(17px,5vw,23px)}
  #gtg-legacy-root .stat span{font-size:10px;letter-spacing:.25px}
}
@media(prefers-reduced-motion:reduce){
  #gtg-legacy-root #nav button{transition:none}
}

/* Professional header sign-out action — presentation only */
#gtg-legacy-root .hr{display:flex;align-items:center;gap:8px}
#gtg-legacy-root #signout{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  min-height:40px;padding:0 14px;margin-left:2px;border:1px solid rgba(255,255,255,.34);
  border-radius:12px;background:rgba(255,255,255,.10);color:#f7fff9;
  font-family:inherit;font-size:13px;font-weight:600;line-height:1.1;letter-spacing:.1px;white-space:nowrap;
  box-shadow:0 2px 8px rgba(0,0,0,.08);cursor:pointer;
  transition:background .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease;
}
#gtg-legacy-root #signout svg{flex:0 0 auto}
#gtg-legacy-root #signout span{display:inline}
#gtg-legacy-root #signout:hover{background:rgba(255,255,255,.20);border-color:rgba(255,255,255,.58);box-shadow:0 4px 12px rgba(0,0,0,.12);transform:translateY(-1px)}
#gtg-legacy-root #signout:focus-visible{outline:3px solid #c6f6d5;outline-offset:3px}
#gtg-legacy-root #signout:active{transform:translateY(0)}
#gtg-legacy-root #signout[hidden]{display:none!important}
@media(max-width:520px){
  #gtg-legacy-root .hr{gap:6px}
  #gtg-legacy-root #signout{width:40px;min-width:40px;height:40px;padding:0;border-radius:12px}
  #gtg-legacy-root #signout span{display:none}
}
@media(prefers-reduced-motion:reduce){#gtg-legacy-root #signout{transition:none}}

/* Signed-in greeting replaces the former tagline */
#gtg-legacy-root .tag{font-size:13px;font-weight:600;color:#e2f7e8;letter-spacing:.1px}
`;
injectCss('visual-refresh', REFRESH_CSS);

