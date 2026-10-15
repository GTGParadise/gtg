import '../styles/activity.css';
import Html from '../components/Html.jsx';
import { AST, ES, ICD, ICE, S, XB, aStat, aTile, dueTag, esc, jobsSorted, opts, pcode, selAct, tbl, ths } from '../core/engine.js';

function vAct(){
  if(!S.jobs.length)return ES("Add a project first","Money, invoices and activity are tracked for each project.",1);
  const J=S.jobs.find(j=>j.id===selAct);
  if(!J)return`<div class="pgrid">${jobsSorted().map(j=>aTile(j,true)).join("")}</div>`;
  const f=aStat(J.id);
  const rows=[...f.a].sort((x,y)=>(x.date||"").localeCompare(y.date||"")||(x.created||0)-(y.created||0));
  const kid=id=>f.a.find(x=>x.from===id);
  const trs=rows.map(a=>{const k=kid(a.id),np=(a.photos||[]).length;
    return`<tr data-rid="${a.id}"><td><input type="date" value="${esc(a.date)}" data-k="acts" data-id="${a.id}" data-set="date"></td>
    <td class="wrap"><b>${esc(a.title)}</b>${np?` <span class="mu">📷${np}</span>`:""}${a.notes?`<div class="mu clamp">${esc(a.notes)}</div>`:""}</td>
    <td><select data-k="acts" data-id="${a.id}" data-set="status">${opts(AST,a.status)}</select></td>
    <td class="wrap">${k?`${esc(k.title)} <span class="mu">${esc(k.date)}</span>`:"—"}</td>
    <td class="act"><button class="ib" data-act="aedit" data-id="${a.id}" title="Edit">${ICE}</button><button class="ib d" data-act="adel" data-id="${a.id}" title="Delete">${ICD}</button></td></tr>`}).join("");
  const head=[["Date"],["Work completed / task"],["Status"],["Next planned work"],["Actions","act"]];
  const pn=f.a.filter(x=>x.notes||(x.photos||[]).length).sort((x,y)=>(y.date||"").localeCompare(x.date||""));
  const cards=(J.note?`<div class="card an"><div class="mu">Project note</div><div class="pre">${esc(J.note)}</div></div>`:"")
    +pn.map(a=>`<div class="card an"><div class="row"><b>${esc(a.title)}</b><span class="mu">${esc(a.date)}</span></div>${a.notes?`<div class="pre">${esc(a.notes)}</div>`:""}${ths(a.photos)}</div>`).join("");
  const head0=`<div class="card" style="padding:8px"><div class="row" style="align-items:center"><select id="asw" class="mini">${jobsSorted().map(j=>`<option value="${j.id}" ${j.id===selAct?"selected":""}>${esc(pcode(j.num)+" · "+j.name)}</option>`).join("")}</select>${XB}</div></div>`;
  return head0+`<div class="pgrid">${aTile(J,false)}</div>`
    +`<div class="card" style="padding:8px 10px"><div class="row" style="align-items:center;justify-content:flex-start;flex-wrap:wrap"><b>Next visit</b><input type="date" class="mini" value="${esc(J.next)}" data-k="jobs" data-id="${J.id}" data-set="next">${dueTag(J.next,J.status)}</div></div>`
    +`<div class="sh">Timetable (${rows.length})</div>${tbl(head,trs,0,"No activities yet. Tap + to add one.","cp")}`
    +`<div class="sh">Photos &amp; Notes</div>${cards?`<div class="pgrid">${cards}</div>`:'<div class="empty" style="padding:8px">No photos or notes yet.</div>'}`;
}

/** Activity tab (React component). */
export default function ActivityTab() {
  return <Html html={vAct()} />;
}
