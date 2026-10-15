import Html from '../components/Html.jsx';
import { D, DEF, ICD, SB, SO, esc } from '../core/engine.js';
import injectCss from '../components/injectCss.js';

/* ---- styles for this tab ---- */
const css = String.raw`/* Add styles specific to the Settings tab here. Keep selectors scoped to this tab where possible. */
`;
injectCss('settings', css);

function vSet(){
  const inp=(p,l)=>{const k=p.split(".");const val=k.length>1?D[k[0]][k[1]]:D[p];return`<div class="f"><label>${esc(l)}</label><input data-d="${p}" value="${esc(val)}"></div>`};
  const L=DEF.labels,A=DEF.add;
  const sec=(k,t,b)=>`<details class="sd" data-sk="${k}" ${SO[k]?"open":""}><summary>${t}</summary><div class="in">${b}</div></details>`;
  return`${sec("logo","Logo",`<div class="lg-row"><div class="lgp">${D.logo?`<img src="${esc(D.logo)}" alt="Logo preview">`:"No logo"}</div><div class="sw8"><button class="btn sm" data-act="logoPick">Upload logo</button>${D.logo?'<button class="btn g sm" data-act="logoClear">Remove</button>':""}</div></div><div class="mu" style="margin-top:8px">PNG, JPG or WebP. Saved to your Supabase project with your other settings; it appears in the header after you save.</div><input type="file" id="logof" accept="image/png,image/jpeg,image/webp" hidden>`)}
  ${sec("app","App name",inp("appName","Name shown at the top"))}
  ${sec("tabs","Tab names",Object.keys(L).map(k=>inp("labels."+k,"Tab: "+L[k])).join(""))}
  ${sec("add","Add (+) button details",inp("add.title","Form title")+inp("add.btn","Save button text")+["num","name","location","contact","status","note"].map(k=>inp("add."+k,"Field: "+A[k])).join(""))}
  ${sec("sb","Supabase (cloud storage)",`<div class="mu f" id="sbst">${esc(SB.msg)}</div>
  <div class="mu f">${SB.on?"Signed in as "+esc(SB.who||"admin"):"Not signed in"}</div>
  <div class="acts"><button class="btn g sm" data-act="sbNow">Sync now</button><button class="btn g sm" data-act="sbOut">Sign out</button></div>`)}
  ${sec("bk","Backup & restore",`<div class="mu f">Download a copy of all jobs, money, invoices and activities (photos are not included).</div><div class="acts"><button class="btn sm" data-act="bkOut">Download backup</button><button class="btn g sm" data-act="bkIn">Restore</button></div><input type="file" id="bkf" accept="application/json,.json" hidden>`)}
  ${sec("cats","Money categories",D.cats.map((c,i)=>`<div class="row f" style="align-items:center"><input data-ci="${i}" value="${esc(c.n)}"><button class="ib d" data-act="delCat" data-i="${i}" title="Delete">${ICD}</button></div>`).join("")+`<div class="row" style="align-items:center"><input id="newcat" placeholder="New category"><button class="btn sm" data-act="addCat">Add</button></div>`)}
  <div class="acts"><button class="btn g" data-act="setCancel">Cancel</button><button class="btn" data-act="setSave">Save settings</button></div>`;
}

/** Settings tab (React component). */
export default function SettingsTab() {
  return <Html html={D?'<div style="max-width:720px;margin:0 auto">'+vSet()+'</div>':''} />;
}
