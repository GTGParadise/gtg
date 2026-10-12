// Editable renderer extracted from the original GTG app.
function vWork(){
  {const W=S.jobs.find(j=>j.id===selWork);if(W)return vWorkOne(W)}
  return`<div class="wsearch"><input id="wq" type="text" inputmode="search" autocomplete="off" placeholder="Search project name or ID" value="${esc(wq)}" aria-label="Search projects"><button class="wclr" data-act="wclear" aria-label="Clear search" ${wq?"":"hidden"}>✕</button></div><div id="wbody">${workBody()}</div>`;
}
