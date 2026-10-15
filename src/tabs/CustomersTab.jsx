import '../styles/customers.css';
import Html from '../components/Html.jsx';
import { AS, ICP, S, XB, acBtns, cq, custFin, custJobs, custList, cview, digits, esc, grid, isAct, num, pcode, selCust, stCls, stat } from '../core/engine.js';

function vCust(){
  const C=S.customers.find(c=>c.id===selCust);
  if(!C){const na=S.customers.filter(isAct).length,ni=S.customers.length-na;
    return`<div class="card" style="padding:8px">${S.customers.length?`<div class="seg"><button class="${cview==="active"?"on":""}" data-act="cview" data-v="active">Active (${na})</button><button class="${cview==="inactive"?"on":""}" data-act="cview" data-v="inactive">Inactive (${ni})</button></div>`:""}<input id="cq" class="mini" style="width:100%" type="search" placeholder="Search name, phone, ID or address" value="${esc(cq)}"></div><div id="clist">${custList()}</div>`}
  const f=custFin(C.id),js=custJobs(C.id).sort((a,b)=>(+b.num||0)-(+a.num||0)),wa=digits(C.whatsapp||C.phone);
  return`<div class="xbar">${XB}</div><div class="card"><div class="row"><div><span class="pill">${esc(C.code||"New")}</span> <span class="pill">${esc(C.type)}</span>${isAct(C)?"":' <span class="pill rd">Inactive</span>'}<h2 style="font-size:18px;margin:8px 0 4px;color:var(--brand)">${esc(C.name)}</h2></div>${acBtns("customers",C.id)}</div>
  <div class="mu">📞 ${esc(C.phone)||"—"} · ✉ ${esc(C.email)||"—"}</div><div class="mu ell1" title="${esc(C.address)}">${ICP}${esc(C.address)||"—"}</div>${C.howknown?`<div class="mu">Heard about us via: <b>${esc(C.howknown)}</b></div>`:""}${C.notes?`<div class="pre" style="margin-top:6px">${esc(C.notes)}</div>`:""}
  <div class="acts">${C.phone?`<a class="btn sm" ${AS} href="tel:${esc(C.phone)}">Call</a>`:""}${wa?`<a class="btn g sm" ${AS} href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>`:""}<button class="btn g sm" data-act="cjob" data-id="${C.id}">+ ${esc(S.cfg.labels.work)}</button></div></div>
  <div class="stats">${stat(f.n,"Projects","","tot")}${stat(num(f.t),"Invoiced")}${stat(num(f.due),"Outstanding",f.due>0?"am":"","opn")}</div>
  <div class="sh">${esc(S.cfg.labels.work)}s (${js.length})</div>${grid(js,j=>`<div class="pc"><div class="L"><span class="pill">${esc(pcode(j.num))}</span><b class="pn">${esc(j.name)}</b><span class="bdg ${stCls(j.status)}">${esc(j.status)}</span></div><div class="R"><div class="mu ell2">${ICP}${esc(j.location)||"—"}</div><div class="mu">Next visit: ${esc(j.next)||"—"}</div></div></div>`,"No projects yet for this customer.")}`;
}

/** Customers tab (React component). */
export default function CustomersTab() {
  return <Html html={vCust()} />;
}
