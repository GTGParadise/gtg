import Html from '../components/Html.jsx';
import { S, esc, selWork, vWorkOne, workBody, wq } from '../core/engine.js';
import injectCss from '../components/injectCss.js';

/* ---- styles for this tab ---- */
const css = String.raw`/* Add styles specific to the Projects tab here. Keep selectors scoped to this tab where possible. */
`;
injectCss('projects', css);

function vWork(){
  {const W=S.jobs.find(j=>j.id===selWork);if(W)return vWorkOne(W)}
  return`<div class="wsearch"><input id="wq" type="text" inputmode="search" autocomplete="off" placeholder="Search project name or ID" value="${esc(wq)}" aria-label="Search projects"><button class="wclr" data-act="wclear" aria-label="Clear search" ${wq?"":"hidden"}>✕</button></div><div id="wbody">${workBody()}</div>`;
}

/** Projects tab (React component). */
export default function ProjectsTab() {
  return <Html html={vWork()} />;
}
