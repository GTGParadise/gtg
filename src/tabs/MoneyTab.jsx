import '../styles/money.css';
import Html from '../components/Html.jsx';
import { col, esc, fdate, num, overview, pFin, pTile, projHead, projs, selProj, sgn, stat, tbl } from '../core/engine.js';

function vMoney(){
  const P=projs().find(p=>p.id===selProj);
  if(P){const f=pFin(P.id);
    const trs=f.tx.map(e=>`<tr data-rid="${e.id}"><td class="tm">${fdate(e.date)}</td><td class="wrap"><b>${esc(e.what)}</b><div class="mu">${esc(e.src)}</div></td><td class="wrap">${esc(e.who)||"—"}</td><td class="tm"><b class="rd">${num(e.amt)}</b></td></tr>`).join("");
    const irs=f.inc.map(i=>`<tr data-rid="${i.id}"><td class="tm">${fdate(i.date)}</td><td class="wrap">${esc(i.ref)||"Invoice"}</td><td class="tm"><b class="gr">${num(i.amt)}</b></td></tr>`).join("");
    return projHead()+`<div class="pgrid">${pTile(P,"money",false)}</div>`
      +`<div class="sh">Expenses (${f.tx.length})</div>${tbl([["Date"],["What"],["Who"],["Amount"]],trs,0,"No expenses yet. Tasks with an amount and raw materials in the Project tab appear here.","cp")}<div class="wsum">Total expenses: <b>${num(f.exp)}</b></div>`
      +`<div class="sh">Income – paid invoices (${f.inc.length})</div>${tbl([["Date"],["Invoice"],["Amount"]],irs,0,"No paid invoices yet.","cp")}<div class="wsum">Total income: <b>${num(f.income)}</b></div>`}
  let inc=0,exp=0;projs().forEach(p=>{const f=pFin(p.id);inc+=f.income;exp+=f.exp});
  return`<div class="stats">${stat(num(inc),"Income","gr")}${stat(num(exp),"Expenses","rd")}${stat(sgn(inc-exp),"Net",col(inc-exp))}</div>${overview("money")}`;
}

/** Money tab (React component). */
export default function MoneyTab() {
  return <Html html={vMoney()} />;
}
