// Editable renderer extracted from the original GTG app.
function vInv(){
  const P=projs().find(p=>p.id===selProj),note=`<div class="note">When an invoice is marked Paid, its amount is added to ${esc(S.cfg.labels.money)} as income.</div>`;
  if(P){const f=pFin(P.id);
    return projHead()+`<div class="pgrid">${pTile(P,"inv",false)}</div>${S.jobs.some(j=>j.id===P.id)?upBar():""}<div class="sh">Invoices (${f.inv.length})</div>${grid([...f.inv].sort((x,y)=>(y.date||"").localeCompare(x.date||"")||0),invTile,NONE)}`+note}
  const P2=projs().filter(p=>p.id==="__none"?ivf==="all":pfOk((S.jobs.find(j=>j.id===p.id)||{}).status,ivf));
  return`${chips(ivf,"ivfilt")}${P2.length?`<div class="pgrid">${P2.map(p=>pTile(p,"inv",true)).join("")}</div>`:ES("Nothing here","No projects match this filter.")}`+note;
}
