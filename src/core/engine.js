import { supabase, supabaseConfigured, isAdminUser } from "../lib/supabase.js";
const WS=["Not started","In progress","On hold","Completed"];
const IS=["Not sent","Sent – pending","Processing","Paid"];
const TERMS_SUPPLY=["Materials have been supplied as per the specifications mentioned in this invoice.","Once materials are supplied/installed, returns or replacements will not be accepted except for manufacturing defects, where applicable.","GTG Paradise will not be responsible for damage caused by improper usage, third-party work, water scarcity, heavy rain, natural calamities or unforeseen site conditions.","Payment is due upon receipt of the invoice.","Acceptance of this invoice constitutes acceptance of the above terms and conditions."];
const TERMS_WORK=["Work Completion: All work mentioned in this invoice has been completed.","Additional Work: Any new or additional work requested beyond the scope of this invoice will be charged separately.","Monthly Visits and Regular Maintenance: Monthly site visits and regular maintenance services will be charged separately at the mutually agreed rate. These charges are not included in the current invoice and will be billed separately.","Scope of Work: This invoice covers only the work specifically mentioned herein.","Workmanship: Any issues directly related to the completed work will be reviewed by GTG Paradise, and appropriate action will be taken where applicable.","Customer Approval: The customer acknowledges the completion of the work listed in this invoice.","Dispute Resolution: Any concerns regarding the invoice or completed work should be communicated to GTG Paradise for mutual resolution."];
const INVDEF={prefix:"GTG/INV/",due:"On Receipt",name:"GTG Paradise",tag:"Terrace & Home Garden Solutions | Coimbatore, Tamil Nadu",phone:"+91 8072851669",email:"gtg.roofgardens@gmail.com",web:"https://gtgparadise.github.io/GTG.Paradise/",
 pay:{name:"JAYAPRAKASH K",bank:"Indian Bank, Oddanchatram",acc:"6031048068",ifsc:"IDIB000O021 / 8072851669-2@axl"},terms:TERMS_SUPPLY};
const DEF={appName:"GTG Paradise",labels:{cust:"Customers",work:"Project",money:"Money",inv:"Invoices",act:"Project Activity",website:"Website Editor"},
 add:{title:"New project",btn:"Add project",num:"Project ID (auto)",name:"Project name",location:"Location",contact:"Mobile number",status:"Status",note:"Note"},
 mode:"light",logo:"",accent:"#0D9488",bright:100,cats:["Materials","Travel","Labour","Tools","Food","Rent","Other","Invoice payment"]};
const mergeCfg=c=>{const r={...DEF,...(c||{}),labels:{...DEF.labels,...(c&&c.labels)},add:{...DEF.add,...(c&&c.add)},cats:c&&c.cats&&c.cats.length?c.cats:[...DEF.cats]};delete r.labels.cmp;delete r.add.email;delete r.add.source;{const OLD={title:"New job",btn:"Add job",num:"Job number (auto)",name:"Job name",contact:"Contact"};Object.keys(OLD).forEach(k=>{if(r.add[k]===OLD[k]||r.add[k]==="Project number (auto)")r.add[k]=DEF.add[k]})}if(r.labels.work==="Work")r.labels.work="Project";r.mode="light";r.accent=DEF.accent;r.bright=100;{const ci=(c&&c.inv)||{};r.inv={...INVDEF,...ci,pay:{...INVDEF.pay,...ci.pay},terms:Array.isArray(ci.terms)&&ci.terms.length?ci.terms:[...INVDEF.terms]}}return r};
let S={jobs:[],customers:[],tx:[],inv:[],acts:[],mats:[],cfg:mergeCfg()},tab="cust",D=null;
const $=s=>document.querySelector(s);
const SV=p=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICP='<svg class="ic" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
const XB=`<button class="xbtn" data-act="xclose" aria-label="Close" title="Close">${SV('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button>`;
const ICE=SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),ICD=SV('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>');
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=n=>(+n||0).toLocaleString(undefined,{maximumFractionDigits:2});
const uid=()=>Math.random().toString(36).slice(2,9);
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const jn=id=>{const j=S.jobs.find(x=>x.id===id);return j?pcode(j.num)+" · "+j.name:"—"};
const pcode=n=>"PRJ-"+String(+n||0).padStart(3,"0");
const nextNum=()=>S.jobs.reduce((m,j)=>Math.max(m,+j.num||0),0)+1;
const nextCode=()=>"C"+String(S.customers.reduce((m,c)=>{const x=/^C(\d+)$/.exec(c.code||"");return x?Math.max(m,+x[1]):m},0)+1).padStart(3,"0");
function fixCodes(){S.customers.forEach(c=>{if(!c.code)c.code=nextCode()})}
function fixNums(){let m=S.jobs.reduce((a,j)=>Math.max(a,+j.num||0),0);S.jobs.forEach(j=>{if(!j.num)j.num=++m})}
const opts=(a,sel)=>a.map(x=>`<option ${x===sel?"selected":""}>${esc(x)}</option>`).join("");
const cl=t=>Array.isArray(t.cat)?t.cat:[t.cat||"Other"];
const catFallback=()=>S.cfg.cats.includes("Other")?"Other":S.cfg.cats[0];
const getChk=id=>[...document.querySelectorAll("#"+id+" input:checked")].map(i=>i.value);
function catChk(sel,id){const all=[...S.cfg.cats];sel.forEach(c=>{if(!all.includes(c))all.push(c)});
  return`<details class="dd" id="${id}"><summary>${esc(sel.join(", ")||"Select category")}</summary><div class="chk">${all.map(c=>`<label class="ck"><input type="checkbox" value="${esc(c)}" ${sel.includes(c)?"checked":""}>${esc(c)}</label>`).join("")}</div></details>`}
function updDD(dd){const a=[...dd.querySelectorAll("input:checked")].map(i=>i.value);dd.querySelector("summary").textContent=a.length?a.join(", "):"Select category"}
const jobOpts=(none,sel)=>(none?'<option value="">— none —</option>':"")+S.jobs.map(j=>`<option value="${j.id}" ${j.id===sel?"selected":""}>${pcode(j.num)} · ${esc(j.name)}</option>`).join("");
function FLD(){const A=S.cfg.add;return{
 jobs:[["name",A.name,"text"],["customer","Customer","cust"],["location",A.location,"text"],["contact",A.contact,"text"],["status",A.status,"select",WS],["next","Next visit","date"]],
 customers:[["name","Name","text"],["phone","Contact number","p91"],["whatsapp","WhatsApp number","p91"],["email","Email","email"],["address","Address","text"],["type","Customer type","select",CT],["howknown","How they know about us","hk"],["notes","Notes","area"],["active","Active customer","bool"]],
 tx:[["type","Type","select",["Expense","Income"]],["amt","Amount","number"],["cat","Category","cat"],["job","Linked job","job"],["date","Date","date"],["note","Note","text"]],
 inv:[["job","Job","jobreq"],["amt","Invoice amount","number"],["status","Status","select",IS],["ref","Invoice no. / note","text"]]}}

/* appearance */
function apply(c){const r=document.documentElement;r.dataset.mode="light";r.style.setProperty("--a",c.accent);document.title=c.appName}

/* paid invoice -> income */
function syncPaid(){
  const paid=new Map(S.inv.filter(i=>i.status==="Paid").map(i=>[i.id,i]));
  S.tx=S.tx.filter(t=>!t.inv||paid.has(t.inv));
  paid.forEach(i=>{const t=S.tx.find(x=>x.inv===i.id);
    if(!t)S.tx.push({id:uid(),type:"Income",amt:i.amt,cat:["Invoice payment"],job:i.job,date:today(),note:"Invoice "+(i.ref||"")+" paid",inv:i.id});
    else{t.amt=i.amt;t.job=i.job}});
}

/* storage */
const invMirror=()=>{try{return JSON.parse(localStorage.getItem("wmt_invd")||"{}")}catch(e){return{}}};
function save(){
  syncPaid();sbQueue();
  try{localStorage.setItem("wmt_invd",JSON.stringify(Object.fromEntries((S.inv||[]).filter(i=>i.d).map(i=>[i.id,i.d]))))}catch(e){}
  try{localStorage.setItem("wmt_mats",JSON.stringify(S.mats||[]))}catch(e){}
  if(!SB.on){try{localStorage.setItem("wmt",JSON.stringify(S))}catch(e){toast("Could not save on this device – storage may be full")}}
}
function load(){try{const d=JSON.parse(localStorage.getItem("wmt")||"null");if(d)S=Object.assign(S,d)}catch(e){}S.cfg=mergeCfg(S.cfg);S.acts=S.acts||[];S.customers=S.customers||[];S.mats=S.mats||[];if(!S.mats.length){try{S.mats=JSON.parse(localStorage.getItem("wmt_mats")||"[]")||[]}catch(e){S.mats=[]}}loadPhLocal();fixNums();fixCodes()}

/* dialogs */
function placeOv(){const h=document.querySelector(".top"),n=$("#nav"),o=$("#ov");if(!h||!n||!o)return;o.style.top=h.getBoundingClientRect().bottom+"px";o.style.bottom=Math.max(0,window.innerHeight-n.getBoundingClientRect().top)+"px"}
window.addEventListener("resize",placeOv);
function show(html){$("#box").innerHTML=html;placeOv();$("#ov").classList.add("on");$("#box").scrollTop=0;requestAnimationFrame(()=>{$("#box").scrollTop=0})}
function hide(){$("#ov").classList.remove("on")}
let busy=false,lastAdded=null;
function ask(msg,okLabel,danger){
  return new Promise(res=>{
    const o=$("#ov2");
    $("#box2").innerHTML=`<h3>Please confirm</h3><div>${esc(msg)}</div><div class="acts"><button class="btn g" id="no2">Cancel</button><button class="btn ${danger?"r":""}" id="yes2">${esc(okLabel||"Yes, continue")}</button></div>`;
    o.classList.add("on");
    $("#no2").onclick=()=>{o.classList.remove("on");res(false)};$("#yes2").onclick=()=>{o.classList.remove("on");res(true)};
  });
}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2600)}
function need(pairs){let ok=true;pairs.forEach(([id,good])=>{const el=document.getElementById(id);if(el)el.classList.toggle("bad",!good);if(!good)ok=false});if(!ok)toast("Please fill the required fields (*)");return ok}
const F=(l,h,req)=>{const m=/\bid="([^"]+)"/.exec(h);return`<div class="f"><label${m?` for="${m[1]}"`:""}>${l}${req?" *":""}</label>${h}</div>`};
async function submitAdd(kind,rec,tabName,dateVal,msg,hl){
  if(busy)return;busy=true;
  try{
    if(!await ask(msg,"Yes, add"))return;
    hide();S[kind].push(rec);save();
    if(kind==='tx'||kind==='inv')selProj=S.jobs.some(j=>j.id===rec.job)?rec.job:null;
    if(!inF(dateVal))flt={mode:"all",val:""};
    tab=tabName;lastAdded=hl||rec.id;render();
  }finally{busy=false}
}
function editForm(kind,item){
  const lock=kind==="tx"&&item.inv?["type","amt","job"]:[];
  const f=FLD()[kind].map(([k,l,t,o])=>{
    let inp;const val=item[k]??"",dis=lock.includes(k)?"disabled":"";
    if(t==="select")inp=`<select id="f_${k}" ${dis}>${opts(o,val)}</select>`;
    else if(t==="cat")inp=catChk(cl(item),"f_cat");
    else if(t==="job")inp=`<select id="f_${k}" ${dis}>${jobOpts(true,val)}</select>`;
    else if(t==="jobreq")inp=`<select id="f_${k}">${jobOpts(false,val)}</select>`;
    else if(t==="cust")inp=`<select id="f_${k}"><option value="">— none —</option>${S.customers.map(c=>`<option value="${c.id}" ${c.id===val?"selected":""}>${esc(c.name)}</option>`).join("")}</select>`;
    else if(t==="hk")inp=`<select id="f_${k}"><option value="">— select —</option>${opts(HK,val)}</select>`;
    else if(t==="area")inp=`<textarea id="f_${k}" rows="5">${esc(val)}</textarea>`;
    else if(t==="p91")inp=`<div class="p91"><span>+91</span><input id="f_${k}" type="tel" inputmode="numeric" data-p91="1" value="${esc(digits(val).slice(-10))}"></div>`;
    else if(t==="bool")inp=`<label class="ck" style="margin:0"><input id="f_${k}" type="checkbox" ${val!==false?"checked":""}> Active</label>`;
    else inp=`<input id="f_${k}" type="${t}" ${t==="number"?'inputmode="decimal" step="0.01" min="0"':""} value="${esc(val)}" ${dis}>`;
    return`<div class="f"><label>${esc(l)}</label>${inp}</div>`}).join("");
  show(`<h3>Edit</h3>${lock.length?'<div class="mu f">Linked to a paid invoice: amount, type and job follow the invoice.</div>':""}${f}<div class="acts"><button class="btn g" id="no">Cancel</button><button class="btn" id="yes">Save changes</button></div>`);
  $("#no").onclick=hide;
  $("#yes").onclick=async()=>{
    if(busy)return;
    const nv={};
    for(const [k,,t] of FLD()[kind]){const el=$("#f_"+k);if(t==="cat"){const c=getChk("f_cat");nv[k]=c.length?c:[catFallback()];continue}if(t==="bool"){nv[k]=el.checked;continue}if(t==="p91"){const p=digits(el.value);if(p&&p.length!==10){el.parentNode.classList.add("bad");return toast("Enter exactly 10 digits after +91")}nv[k]=p?"+91"+p:"";continue}if(el.disabled)continue;let x=el.value;
      if(t==="number"){x=parseFloat(x);if(!(x>=0))return toast("Enter a valid amount")}else if(t==="text"||t==="area")x=x.trim();nv[k]=x}
    if((kind==="jobs"||kind==="customers")&&!nv.name)return toast("Name is required");
    busy=true;
    try{if(await ask("Save these changes?","Yes, save")){hide();Object.assign(item,nv);save();render()}}finally{busy=false}
  };
}
function fillFromCust(id){
  const c=S.customers.find(x=>x.id===id);if(!c)return;
  const l=$("#n_location"),m=$("#n_contact");
  if(l)l.value=String(c.address||"").replace(/\s*[\r\n]+\s*/g,", ").trim();
  if(m){m.value=digits(c.phone).slice(-10);m.parentNode.classList.remove("bad")}
}
function addJobForm(custId){
  const A=S.cfg.add;
  show(`<h3>${esc(A.title)}</h3>
  ${F(esc(A.num),`<input value="${pcode(nextNum())}" readonly>`)}
  ${F(esc(A.name),'<input id="n_name">',1)}
  ${F("Customer",`<select id="n_cust"><option value="">— none —</option>${S.customers.map(c=>`<option value="${c.id}" ${c.id===custId?"selected":""}>${esc(c.name)}</option>`).join("")}</select>`)}
  ${F(esc(A.location),'<input id="n_location">')}
  ${F(esc(A.contact),P91("n_contact"))}
  <div class="acts"><button class="btn g" id="no">Cancel</button><button class="btn" id="yes">${esc(A.btn)}</button></div>`);
  if(custId)fillFromCust(custId);
  $("#no").onclick=hide;
  $("#yes").onclick=()=>{
    const g=k=>$("#n_"+k).value.trim(),p=digits(g("contact"));
    if(!need([["n_name",!!g("name")]]))return;
    if(p&&p.length!==10){$("#n_contact").parentNode.classList.add("bad");return toast("Enter exactly 10 digits after +91")}
    const job={id:uid(),num:nextNum(),name:g("name"),location:g("location"),contact:p?"+91"+p:"",email:"",source:"",status:"Not started",note:"",pending:"",next:"",customer:$("#n_cust").value};
    submitAdd("jobs",job,"work",job.next,"Add this project?");
  };
}
const projField=(id,pid)=>pid&&pid!=="__none"&&S.jobs.some(j=>j.id===pid)
  ?F("Project",`<input value="${esc(jn(pid))}" readonly><input type="hidden" id="${id}" value="${pid}">`)
  :F("Project",`<select id="${id}"><option value="">— select project —</option>${jobOpts(false)}</select>`,1);
function addTxForm(pid){
  if(!S.jobs.length)return toast("Add a "+S.cfg.labels.work.toLowerCase()+" first");
  show(`<h3>New money entry</h3>
  ${projField("m_job",pid)}
  ${F("Type",'<select id="m_type"><option>Expense</option><option>Income</option></select>')}
  ${F("Amount",'<input id="m_amt" type="number" inputmode="decimal" min="0" step="0.01">',1)}
  ${F("Category (edit list in ⚙ Settings)",catChk([],"m_cat"),1)}
  ${F("Date",`<input id="m_date" type="date" value="${today()}">`,1)}
  ${F("Note",'<input id="m_note">')}
  <div class="acts"><button class="btn g" id="no">Cancel</button><button class="btn" id="yes">Add entry</button></div>`);
  $("#no").onclick=hide;
  $("#yes").onclick=()=>{
    const a=parseFloat(v("m_amt")),c=getChk("m_cat"),d=v("m_date"),job=v("m_job");
    if(!need([["m_job",!!job],["m_amt",a>0],["m_cat",c.length>0],["m_date",!!d]]))return;
    submitAdd("tx",{id:uid(),type:v("m_type"),amt:a,cat:c,job,date:d,note:v("m_note").trim()},"money",d,"Add this entry?");
  };
}
function addInvForm(pid){ivOpen(pid)}
/* project activity */
const AST=["Completed","In progress","Planned","Pending"];
let selAct=null,tmpPh=[],curPh=[],remPh=[];
const PH={},phReq=new Set(),PHP={},UPQ=[];
function loadPhLocal(){try{Object.assign(PH,JSON.parse(localStorage.getItem("wmt_ph")||"{}"))}catch(e){}}
function savePhLocal(){if(SB.on)return;try{localStorage.setItem("wmt_ph",JSON.stringify(PH))}catch(e){toast("Device storage is full – a photo may not be kept offline")}}
function cloudPhSet(id,d,aid){if(SB.on)sbUpload(id,d,aid)}
function cloudPhDel(id){try{if(SB.on&&PHP[id]){SB.client.storage.from(BUCKET).remove([PHP[id]]).catch(()=>{});delete PHP[id]}}catch(e){}}
function needPh(id){if(PH[id]||phReq.has(id))return;
  if(SB.on&&PHP[id]){phReq.add(id);SB.client.storage.from(BUCKET).createSignedUrl(PHP[id],21600).then(r=>{if(r&&r.data){PH[id]=r.data.signedUrl;render()}else phReq.delete(id)}).catch(()=>phReq.delete(id));}
}
function readImg(file){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;
  im.onload=()=>{const k=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.6))};im.src=r.result};r.readAsDataURL(file)})}
async function addPhotos(inp){
  const files=[...inp.files].slice(0,10);inp.value="";
  for(const f of files){if(curPh.length+tmpPh.length>=10){toast("Maximum 10 photos");break}
    try{tmpPh.push(await readImg(f))}catch(e){toast("Could not read a photo")}}
  drawPrev();
}
function drawPrev(){const el=$("#a_prev");if(!el)return;
  el.innerHTML=curPh.map((id,i)=>`<div class="th">${PH[id]?`<img src="${PH[id]}">`:'<span class="th0">…</span>'}<button class="x" data-act="rmcur" data-i="${i}">✕</button></div>`).join("")
   +tmpPh.map((d,i)=>`<div class="th"><img src="${d}"><button class="x" data-act="rmtmp" data-i="${i}">✕</button></div>`).join("")}
const gv=id=>{const e=document.getElementById(id);return e?e.value.trim():""};
function addActForm(pid,rec){
  if(!S.jobs.length)return toast("Add a "+S.cfg.labels.work.toLowerCase()+" first");
  tmpPh=[];curPh=rec?[...(rec.photos||[])]:[];remPh=[];curPh.forEach(needPh);
  show(`<h3>${rec?"Edit activity":"Add activity"}</h3>
  ${projField("a_job",rec?rec.job:pid)}
  ${F("Work / task",`<input id="a_title" value="${esc(rec?rec.title:"")}">`,1)}
  ${F("Date",`<input id="a_date" type="date" value="${esc(rec?rec.date:today())}">`,1)}
  ${F("Status",`<select id="a_status">${opts(AST,rec?rec.status:"Completed")}</select><div class="mu" style="margin-top:3px">Completed = past work · In progress = current · Planned = next · Pending = still to do</div>`,1)}
  ${F("Notes",`<textarea id="a_notes" rows="4">${esc(rec?rec.notes:"")}</textarea>`)}
  ${F("Photos",'<input id="a_ph" type="file" accept="image/*" multiple><div class="ths" id="a_prev"></div>')}
  ${rec?"":F("Next plan (optional)",'<input id="a_next" placeholder="What will be done next?">')+F("Planned date",'<input id="a_nd" type="date">')}
  <div class="acts"><button class="btn g" id="no">Cancel</button><button class="btn" id="yes">${rec?"Save changes":"Add activity"}</button></div>`);
  drawPrev();
  $("#no").onclick=hide;
  $("#yes").onclick=()=>saveAct(rec);
}
async function saveAct(rec){
  if(busy)return;
  const title=gv("a_title"),d=gv("a_date"),job=gv("a_job"),nxt=gv("a_next"),nd=gv("a_nd");
  if(!need([["a_job",!!job],["a_title",!!title],["a_date",!!d],...(nxt?[["a_nd",!!nd]]:[])]))return;
  busy=true;
  try{
    if(!await ask(rec?"Save changes to this activity?":"Add this activity?",rec?"Yes, save":"Yes, add"))return;
    hide();
    const ids=[],aid=rec?rec.id:uid();
    tmpPh.forEach(x=>{const id=uid()+uid();PH[id]=x;ids.push(id);cloudPhSet(id,x,aid)});
    remPh.forEach(id=>{delete PH[id];cloudPhDel(id)});
    if(tmpPh.length||remPh.length)savePhLocal();
    const fields={job,title,date:d,status:gv("a_status"),notes:gv("a_notes"),photos:[...curPh,...ids]};
    if(rec)Object.assign(rec,fields);
    else{rec={id:aid,...fields,created:Date.now()};S.acts.push(rec);
      if(nxt&&nd){const PJ=S.jobs.find(j=>j.id===job);if(PJ)PJ.next=nd}
      if(nxt)S.acts.push({id:uid(),job,title:nxt,date:nd,status:"Planned",notes:"",photos:[],created:Date.now(),from:rec.id})}
    tmpPh=[];remPh=[];save();selAct=job;tab="act";lastAdded=rec.id;render();
  }finally{busy=false}
}
const jobsSorted=()=>[...S.jobs].sort((a,b)=>(+a.num||0)-(+b.num||0));
function aStat(id){const a=S.acts.filter(x=>x.job===id),done=a.filter(x=>x.status==="Completed").length,c=st=>a.filter(x=>x.status===st).length;
  return{a,done,tot:a.length,pct:a.length?Math.round(done/a.length*100):0,cur:c("In progress"),nxt:c("Planned"),pen:c("Pending")}}
const stCls=s=>s==="Completed"?"gr":s==="On hold"?"am":"";
function aTile(j,click){const f=aStat(j.id);
  return`<div class="pc ${click?"click":""}" ${click?`data-act="asel" data-pid="${j.id}"`:""}>
  <div class="L"><span class="pill">${esc(pcode(j.num))}</span><b class="pn" title="${esc(j.name)}">${esc(j.name)}</b><span class="bdg ${stCls(j.status)}">${esc(j.status)}</span></div>
  <div class="R"><div class="ac"><button class="ib" data-act="aadd" data-pid="${j.id}" title="Add activity">＋</button></div><b>${f.pct}%</b><div class="bar" style="width:100%"><i style="width:${f.pct}%"></i></div><div class="mu">${f.done} of ${f.tot} done</div></div>
  <div class="mu full">Current ${f.cur} · Next ${f.nxt} · Pending ${f.pen}</div><div class="mu full">Next visit: <b>${esc(j.next)||"—"}</b></div></div>`}
const ths=ids=>ids&&ids.length?`<div class="ths">${ids.map(id=>{needPh(id);return PH[id]?`<img src="${PH[id]}" data-act="ph" data-id="${id}">`:'<span class="th0">…</span>'}).join("")}</div>`:"";

/* ===== Supabase ===== */
const BUCKET="project-photos";
const SB={noMatPh:false,noInvD:false,noHK:false,noTime:false,noAmt:false,noMat:false,who:"",on:false,client:supabase,uid:null,last:null,lastCfg:"",dirty:false,busy:false,timer:null,retry:0,loading:false,msg:"Supabase not connected"};
const SBT=["customers","projects","invoices","activities","money_transactions","activity_photos","project_materials"];
const isMissingTable=e=>/PGRST205|42P01|Could not find the table|does not exist/.test(((e&&e.code)||"")+" "+((e&&e.message)||""));
function setStatus(m){SB.msg=m;const f=$("#foot");if(f)f.textContent=m;const e=$("#sbst");if(e)e.textContent=m}
const okDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||"")?d:null;
const pk=id=>known(id)?id:null;
function rowsOf(){
  const m=Object.fromEntries(SBT.map(t=>[t,new Map()]));
  S.customers.forEach(c=>m.customers.set(c.id,{id:c.id,code:c.code||null,name:c.name||"Unnamed",phone:c.phone||"",whatsapp:c.whatsapp||"",email:c.email||"",address:c.address||"",customer_type:CT.includes(c.type)?c.type:"Home",notes:c.notes||"",is_active:c.active!==false,...(SB.noHK?{}:{how_known:c.howknown||""})}));
  S.jobs.forEach(j=>m.projects.set(j.id,{id:j.id,num:Math.max(1,+j.num||1),name:j.name||"Untitled",location:j.location||"",contact:j.contact||"",email:j.email||"",source:j.source||"",status:WS.includes(j.status)?j.status:"Not started",pending:j.pending||"",next_visit:okDate(j.next),note:j.note||"",customer_id:S.customers.some(c=>c.id===j.customer)?j.customer:null}));
  S.inv.forEach(i=>m.invoices.set(i.id,{id:i.id,project_id:pk(i.job),amount:Math.max(0,+i.amt||0),status:IS.includes(i.status)?i.status:"Not sent",ref:i.ref||"",invoice_date:okDate(i.date)||today(),...(SB.noInvD?{}:{details:i.d||null})}));
  S.acts.forEach(a=>{m.activities.set(a.id,{id:a.id,project_id:pk(a.job),title:a.title||"Untitled",activity_date:okDate(a.date)||today(),status:AST.includes(a.status)?a.status:"Pending",notes:a.notes||"",from_activity:a.from||null,...(SB.noTime?{}:{time_in:a.tin||"",time_out:a.tout||""}),...(SB.noAmt?{}:{amount_spent:Math.max(0,+a.cost||0)})});
    (a.photos||[]).forEach((pid,n)=>m.activity_photos.set(pid,{id:pid,activity_id:a.id,project_id:pk(a.job),storage_path:PHP[pid]||`${SB.uid}/${a.id}/${pid}.jpg`,position:n}))});
  S.tx.forEach(t=>m.money_transactions.set(t.id,{id:t.id,project_id:pk(t.job),invoice_id:t.inv&&m.invoices.has(t.inv)?t.inv:null,type:t.type==="Income"?"Income":"Expense",amount:Math.max(0,+t.amt||0),categories:cl(t),tx_date:okDate(t.date)||today(),note:t.note||""}));
  (S.mats||[]).forEach(x=>m.project_materials.set(x.id,{id:x.id,project_id:pk(x.job),material:x.name||"Material",amount:Math.max(0,+x.amt||0),quantity:x.qty||"",bought_on:okDate(x.date)||today(),bought_by:x.who||"",...(SB.noMatPh?{}:{photos:(x.photos||[]).map(id=>({id,path:PHP[id]||`${SB.uid}/mat-${x.id}/${id}.jpg`}))})}));
  return m}
const lastOf=m=>Object.fromEntries(SBT.map(t=>[t,new Map([...m[t]].map(([id,r])=>[id,JSON.stringify(r)]))]));
function dataToBlob(d){const [h,b]=d.split(","),mt=/data:(.*?);/.exec(h)[1],bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:mt})}
function sbUpload(id,d,aid){
  const path=`${SB.uid}/${aid}/${id}.jpg`;PHP[id]=path;
  const p=SB.client.storage.from(BUCKET).upload(path,dataToBlob(d),{contentType:"image/jpeg",upsert:true})
    .then(r=>{if(r.error)throw r.error}).catch(e=>{setStatus("⚠ Photo upload failed: "+(e.message||e));toast("Photo upload failed")});
  UPQ.push(p);return p}
async function sbPush(){
  const cur=rowsOf(),c=SB.client;
  await Promise.allSettled(UPQ.splice(0));
  for(const t of SBT){if(t==="project_materials"&&SB.noMat)continue;const up=[];cur[t].forEach((r,id)=>{if(SB.last[t].get(id)!==JSON.stringify(r))up.push(r)});
    for(let k=0;k<up.length;k+=500){let ch=up.slice(k,k+500),{error}=await c.from(t).upsert(ch,{onConflict:"id"});
      if(error&&t==="customers"&&/how_known/.test(error.message||"")){SB.noHK=true;toast("Run in Supabase SQL: alter table customers add column how_known text;");ch=ch.map(r=>{const o={...r};delete o.how_known;return o});({error}=await c.from(t).upsert(ch,{onConflict:"id"}))}
      if(error&&t==="invoices"&&/details/.test(error.message||"")){if(!SB.noInvD)toast("Run in Supabase SQL: alter table invoices add column details jsonb;");SB.noInvD=true;ch=ch.map(r=>{const o={...r};delete o.details;return o});({error}=await c.from(t).upsert(ch,{onConflict:"id"}))}
      for(let n=0;n<2&&error&&t==="activities";n++){const msg=error.message||"";
        if(/amount_spent/.test(msg)){if(!SB.noAmt)toast("Run in Supabase SQL: alter table activities add column amount_spent numeric default 0;");SB.noAmt=true;ch=ch.map(r=>{const o={...r};delete o.amount_spent;return o})}
        else if(/time_in|time_out/.test(msg)){if(!SB.noTime)toast("Run in Supabase SQL: alter table activities add column time_in text, add column time_out text;");SB.noTime=true;ch=ch.map(r=>{const o={...r};delete o.time_in;delete o.time_out;return o})}
        else break;
        ({error}=await c.from(t).upsert(ch,{onConflict:"id"}))}
      if(error&&t==="project_materials"&&/photos/.test(error.message||"")&&!isMissingTable(error)){if(!SB.noMatPh)toast("Run in Supabase SQL: alter table project_materials add column photos jsonb;");SB.noMatPh=true;ch=ch.map(r=>{const o={...r};delete o.photos;return o});({error}=await c.from(t).upsert(ch,{onConflict:"id"}))}
      if(error&&t==="project_materials"&&isMissingTable(error)){SB.noMat=true;toast("Materials table missing in Supabase – saved on this device only until the setup SQL is run");break}
      if(error)throw error}}
  for(const t of [...SBT].reverse()){if(t==="project_materials"&&SB.noMat)continue;const del=[];SB.last[t].forEach((j,id)=>{if(!cur[t].has(id))del.push(id)});
    for(let k=0;k<del.length;k+=200){const {error}=await c.from(t).delete().in("id",del.slice(k,k+200));if(error)throw error}}
  const cj=JSON.stringify(S.cfg);
  if(cj!==SB.lastCfg){const {error}=await c.from("app_settings").upsert({user_id:SB.uid,data:S.cfg,updated_at:new Date().toISOString()},{onConflict:"user_id"});if(error)throw error;SB.lastCfg=cj}
  SB.last=lastOf(cur);
}
function sbQueue(){if(!SB.on||SB.loading)return;SB.dirty=true;clearTimeout(SB.timer);SB.timer=setTimeout(sbRun,600)}
async function sbRun(){
  if(SB.busy||!SB.on)return;SB.busy=true;
  try{while(SB.dirty){SB.dirty=false;setStatus("☁ Saving to Supabase…");await sbPush()}
    SB.retry=0;setStatus("☁ Saved to Supabase")}
  catch(e){SB.dirty=true;SB.retry++;setStatus("⚠ Not saved to Supabase yet: "+(e.message||e)+" (retrying)");if(SB.retry===1)toast("Supabase save failed – will retry");
    clearTimeout(SB.timer);SB.timer=setTimeout(sbRun,Math.min(30000,2000*SB.retry))}
  finally{SB.busy=false}
}
async function fetchAll(t){let out=[],from=0;for(;;){const {data,error}=await SB.client.from(t).select("*").order("id").range(from,from+999);if(error){if(t==="project_materials"&&isMissingTable(error)){SB.noMat=true;return[]}throw error}out=out.concat(data||[]);if(!data||data.length<1000)break;from+=1000}return out}
async function sbFetch(){
  const [cu,pj,iv,ac,tx,ph,mt]=await Promise.all(SBT.map(fetchAll));
  const st=await SB.client.from("app_settings").select("data").maybeSingle();if(st.error)throw st.error;
  const php={},byAct={};mt.forEach(r=>(r.photos||[]).forEach(p=>{if(p&&p.id&&p.path)php[p.id]=p.path}));ph.sort((a,b)=>a.position-b.position).forEach(r=>{php[r.id]=r.storage_path;(byAct[r.activity_id]=byAct[r.activity_id]||[]).push(r.id)});
  return{php,cfg:st.data?st.data.data:null,
    customers:cu.filter(r=>!r.merged_into).map(r=>({id:r.id,code:r.code||"",name:r.name,phone:r.phone||"",whatsapp:r.whatsapp||"",email:r.email||"",address:r.address||"",type:r.customer_type||"Home",howknown:r.how_known||"",notes:r.notes||"",active:r.is_active!==false})),
    jobs:pj.map(r=>({id:r.id,num:r.num,name:r.name,location:r.location,contact:r.contact,email:r.email,source:r.source,status:r.status,pending:r.pending,next:r.next_visit||"",note:r.note,customer:r.customer_id||""})),
    inv:iv.map(r=>{const o={id:r.id,job:r.project_id||"",amt:+r.amount,status:r.status,ref:r.ref,date:r.invoice_date},d=r.details||invMirror()[r.id];if(d)o.d=d;return o}),
    acts:ac.map(r=>({id:r.id,job:r.project_id||"",title:r.title,date:r.activity_date,status:r.status,notes:r.notes,tin:r.time_in||"",tout:r.time_out||"",cost:+r.amount_spent||0,photos:byAct[r.id]||[],created:Date.parse(r.created_at)||0,...(r.from_activity?{from:r.from_activity}:{})})),
    mats:mt.map(r=>({id:r.id,job:r.project_id||"",name:r.material||"",amt:+r.amount||0,qty:r.quantity||"",date:r.bought_on||"",who:r.bought_by||"",photos:(r.photos||[]).map(p=>p.id),created:Date.parse(r.created_at)||0})),
    tx:tx.map(r=>({id:r.id,type:r.type,amt:+r.amount,cat:r.categories&&r.categories.length?r.categories:["Other"],job:r.project_id||"",date:r.tx_date,note:r.note,...(r.invoice_id?{inv:r.invoice_id}:{})}))};
}
async function sbStart(session){
  if(!isAdminUser(session.user))return sbDeny();
  SB.uid=session.user.id;{const u=session.user||{},md=u.user_metadata||{};SB.who=md.full_name||md.name||u.email||""}SB.noMat=false;SB.loading=true;
  try{
    setStatus("☁ Loading from Supabase…");
    const cl2=await sbFetch();
    const mir=S.mats||[];let pushMats=false;
    if(SB.noMat)cl2.mats=mir;else if(!cl2.mats.length&&mir.length){cl2.mats=mir;pushMats=true}
    const hasCloud=cl2.customers.length||cl2.jobs.length||cl2.tx.length||cl2.inv.length||cl2.acts.length;
    const hasLocal=S.customers.length||S.jobs.length||S.tx.length||S.inv.length||S.acts.length;
    if(!hasCloud&&hasLocal){
      SB.last=Object.fromEntries(SBT.map(t=>[t,new Map()]));SB.lastCfg="";
      S.acts.forEach(a=>(a.photos||[]).forEach(id=>{if(String(PH[id]||"").startsWith("data:")&&!PHP[id])sbUpload(id,PH[id],a.id)}));
    }else{
      if(hasLocal&&hasCloud)try{localStorage.setItem("wmt_local_backup",JSON.stringify(S))}catch(e){}
      S={customers:cl2.customers,jobs:cl2.jobs,tx:cl2.tx,inv:cl2.inv,acts:cl2.acts,mats:cl2.mats,cfg:cl2.cfg?mergeCfg(cl2.cfg):S.cfg};
      Object.keys(PHP).forEach(k=>delete PHP[k]);Object.assign(PHP,cl2.php);
      fixNums();apply(S.cfg);
      SB.last=lastOf(rowsOf());if(pushMats)SB.last.project_materials=new Map();fixCodes();SB.lastCfg=cl2.cfg?JSON.stringify(S.cfg):"";
    }
    SB.on=true;SB.loading=false;hide();render();sbWatch();
    SB.dirty=true;await sbRun();
    if(!SB.dirty&&!SB.retry){try{localStorage.removeItem("wmt")}catch(e){}}
  }catch(e){SB.loading=false;SB.on=false;setStatus("⚠ Could not load from Supabase: "+(e.message||e)+" — working locally");toast("Supabase load failed")}
}
/* next-visit sync: one field (projects.next_visit) is the single source of truth for the Project page and the Activity page */
function sbApplyNext(id,val){
  const j=S.jobs.find(x=>x.id===id);if(!j)return;
  val=val||"";if((j.next||"")===val)return;
  j.next=val;
  if(SB.last&&SB.last.projects){const r=rowsOf().projects.get(id);if(r)SB.last.projects.set(id,JSON.stringify(r))}
  const ae=document.activeElement,typing=ae&&/^(INPUT|SELECT|TEXTAREA)$/.test(ae.tagName);
  if(!typing&&!$("#ov").classList.contains("on")&&!$("#ov2").classList.contains("on")&&(tab==="work"||tab==="act"))renderView();
}
async function sbPullNext(){
  if(!SB.on||SB.dirty||SB.busy||SB.loading||document.hidden)return;
  try{const {data,error}=await SB.client.from("projects").select("id,next_visit");if(error)throw error;
    if(SB.dirty||SB.busy)return;(data||[]).forEach(r=>sbApplyNext(r.id,r.next_visit))}catch(e){}
}
function sbWatch(){
  if(SB.ch||!SB.client)return;
  try{SB.ch=SB.client.channel("wmt-next-visit").on("postgres_changes",{event:"*",schema:"public",table:"projects"},p=>{
    if(SB.dirty||SB.busy||SB.loading||!p.new||!p.new.id)return;sbApplyNext(p.new.id,p.new.next_visit)}).subscribe()}catch(e){}
  document.addEventListener("visibilitychange",sbPullNext);
  setInterval(sbPullNext,30000);
}
async function initSB(){
  try{
    setStatus("☁ Connecting to Supabase…");
    SB.client.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT"&&SB.on){SB.on=false;SB.uid=null;setStatus("Signed out");sbLoginForm()}});
    const r=await SB.client.auth.getSession();if(r.error)throw r.error;
    if(r.data.session)await sbStart(r.data.session);else sbLoginForm();
  }catch(e){setStatus("⚠ Supabase unavailable: "+(e.message||e));sbLoginForm("Could not reach Supabase: "+(e.message||e))}
}
async function sbDeny(){try{await SB.client.auth.signOut()}catch(e){}SB.on=false;SB.uid=null;sbLoginForm("This account is not an admin of this app.")}
function sbLoginForm(msg){
  show(`<span id="sbin-form"></span><h3>Admin sign in</h3>${msg?`<div class="rd f">${esc(msg)}</div>`:'<div class="mu f">Sign in with your admin Supabase account. Your data is protected by Row Level Security.</div>'}
  ${F("Email",'<input id="sb_email" type="email" autocomplete="username">')}${F("Password",'<input id="sb_pass" type="password" autocomplete="current-password">')}
  <div class="acts"><button class="btn" id="sbin">Sign in</button></div>`);
  const submit=async()=>{const email=gv("sb_email").trim(),password=$("#sb_pass").value;
    if(!email||!password)return sbLoginForm("Enter your email and password");
    const btn=$("#sbin");btn.disabled=true;btn.textContent="Signing in…";
    const r=await SB.client.auth.signInWithPassword({email,password});
    if(r.error)return sbLoginForm(r.error.message);
    await sbStart(r.data.session)};
  $("#sbin").onclick=submit;
  $("#sb_pass").onkeydown=e=>{if(e.key==="Enter")submit()};
}
function sbMissingConfig(){
  show(`<span id="sbsetup"></span><h3>Supabase is not configured</h3><div class="mu f">Set VITE_ADMIN_SUPABASE_URL and VITE_ADMIN_SUPABASE_ANON_KEY (Admin Supabase project only) in .env.local, or in your Vercel project settings, then redeploy.</div>`);
  setStatus("Supabase not configured");
}
/* settings */
let settingsReturnTab=null;function openSettings(){settingsReturnTab=tab==="settings"?(settingsReturnTab||"work"):tab;D=JSON.parse(JSON.stringify(S.cfg));D.cats=D.cats.map(c=>({o:c,n:c}));tab="settings";render()}
function closeSettings(){apply(S.cfg);D=null;tab=settingsReturnTab||"work";settingsReturnTab=null;render()}
function setPath(o,p,v){const k=p.split(".");let x=o;while(k.length>1)x=x[k.shift()];x[k[0]]=v}
const SO={};
document.addEventListener("toggle",e=>{const d=e.target;if(d.dataset&&d.dataset.sk)SO[d.dataset.sk]=d.open},true);

async function saveSettings(){
  const w=k=>(D.labels[k]||"").trim()||DEF.labels[k];
  const seen=new Set(),cats=[];
  D.cats.forEach(c=>{const n=c.n.trim();if(n&&!seen.has(n)){seen.add(n);cats.push(n)}});
  if(!cats.length)return toast("Keep at least one category");
  if(!await ask("Save these settings?","Yes, save"))return;
  D.cats.forEach(c=>{const n=c.n.trim();if(c.o&&n&&c.o!==n)S.tx.forEach(t=>{const a=cl(t);if(a.includes(c.o))t.cat=a.map(x=>x===c.o?n:x)})});
  const add={};Object.keys(DEF.add).forEach(k=>add[k]=(D.add[k]||"").trim()||DEF.add[k]);
  S.cfg={appName:(D.appName||"").trim()||DEF.appName,labels:{cust:w("cust"),work:w("work"),money:w("money"),inv:w("inv"),act:w("act"),website:w("website")},add,logo:D.logo||"",mode:"light",accent:DEF.accent,bright:100,cats};
  save();closeSettings();
}

/* actions */
const v=id=>document.getElementById(id).value;
const actions={
  bkOut(){const b=new Blob([JSON.stringify(S,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="tracker-backup-"+today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)},
  bkIn(){$("#bkf").click()},
  addProj(){addJobForm()},
  addCust(){addCustForm()},
  wfilt(el){wf=el.dataset.v;render()},
  ivfilt(el){ivf=el.dataset.v;render()},
  csel(el){selCust=el.dataset.id||null;render()},
  cview(el){cview=el.dataset.v;render()},
  cjob(el){addJobForm(el.dataset.id)},
  logoPick(){$("#logof").click()},
  logoClear(){D.logo="";render()},
  sbNow(){if(!SB.on)return toast("Not connected to Supabase");SB.dirty=true;sbRun()},
  async sbOut(){if(!SB.client||!SB.on)return toast("Not signed in");
    if(SB.busy||SB.dirty)return toast("Wait for the sync to finish, then sign out");
    if(!await ask("Sign out? The copy on this device is cleared; your data stays safe in Supabase.","Yes, sign out"))return;
    await SB.client.auth.signOut();SB.on=false;SB.uid=null;
    S={jobs:[],customers:[],tx:[],inv:[],acts:[],mats:[],cfg:mergeCfg()};SB.who="";[PH,PHP].forEach(o=>Object.keys(o).forEach(k=>delete o[k]));
    try{localStorage.removeItem("wmt");localStorage.removeItem("wmt_ph");localStorage.removeItem("wmt_mats");localStorage.removeItem("wmt_invd")}catch(e){}
    apply(S.cfg);tab="cust";D=null;render();sbLoginForm()},
  asel(el){selAct=el.dataset.pid||null;render()},
  aadd(el){addActForm(el.dataset.pid)},
  wopen(el){selWork=el.dataset.pid||null;wtab="tasks";wInfo=false;render();window.scrollTo(0,0)},
  winfo(){wInfo=!wInfo;render()},
  wclear(){wq="";const i=$("#wq");if(i){i.value="";i.focus()}const c=$(".wclr");if(c)c.hidden=true;const b=$("#wbody");if(b)b.innerHTML=workBody()},
  medit(el){const m=S.mats.find(x=>x.id===el.dataset.id);if(m)addMatForm(m.job,m)},
  async mdel(el){const m=S.mats.find(x=>x.id===el.dataset.id);if(!m)return;
    if(!await ask("Delete this material?","Yes, delete",true))return;
    (m.photos||[]).forEach(id=>{delete PH[id];cloudPhDel(id)});savePhLocal();
    S.mats=S.mats.filter(x=>x.id!==m.id);save();render()},
  xclose(){if(tab==="work"){selWork=null;wInfo=false}else if(tab==="money"||tab==="inv")selProj=null;else if(tab==="act")selAct=null;else if(tab==="cust")selCust=null;render();window.scrollTo(0,0)},
  wtb(el){wtab=el.dataset.t==="mats"?"mats":"tasks";render()},
  wback(){selWork=null;wInfo=false;render();window.scrollTo(0,0)},
  async wdone(el){const J=S.jobs.find(j=>j.id===el.dataset.pid);if(!J||busy)return;
    const to=el.dataset.to;
    busy=true;
    try{if(await ask(to==="Completed"?"Mark this project as completed?":"Reopen this project?",to==="Completed"?"Yes, complete":"Yes, reopen")){J.status=to;save();render()}}finally{busy=false}},
  tadd(el){addTaskForm(el.dataset.pid)},
  tedit(el){const a=S.acts.find(x=>x.id===el.dataset.id);if(a)addTaskForm(a.job,a)},
  async tdel(el){const a=S.acts.find(x=>x.id===el.dataset.id);if(!a)return;
    if(!await ask("Delete this task?","Yes, delete",true))return;
    (a.photos||[]).forEach(id=>{delete PH[id];cloudPhDel(id)});savePhLocal();
    S.acts=S.acts.filter(x=>x.id!==a.id);save();render()},
  aedit(el){const a=S.acts.find(x=>x.id===el.dataset.id);if(a)addActForm(a.job,a)},
  async adel(el){const a=S.acts.find(x=>x.id===el.dataset.id);if(!a)return;
    if(!await ask("Delete this activity and its photos?","Yes, delete",true))return;
    (a.photos||[]).forEach(id=>{delete PH[id];cloudPhDel(id)});savePhLocal();
    S.acts=S.acts.filter(x=>x.id!==a.id);save();render()},
  rmcur(el){const i=+el.dataset.i;remPh.push(curPh[i]);curPh.splice(i,1);drawPrev()},
  rmtmp(el){tmpPh.splice(+el.dataset.i,1);drawPrev()},
  ph(el){const d=PH[el.dataset.id];if(!d)return;show(`<img src="${d}" style="width:100%;border-radius:8px"><div class="acts"><button class="btn g" id="no">Close</button></div>`);$("#no").onclick=hide},
  selp(el){selProj=el.dataset.pid||null;render()},
  padd(el){const f={money:addTxForm,inv:addInvForm}[tab];if(f)f(el.dataset.pid==='__none'?undefined:el.dataset.pid)},
  edit(el){const it=S[el.dataset.k].find(x=>x.id===el.dataset.id);if(!it)return;if(el.dataset.k==="inv"){if(isUp(it))ivUpForm(it.job,null,it);else ivOpen(it.job,it)}else editForm(el.dataset.k,it)},
  async del(el){const k=el.dataset.k;
    const m=k==="jobs"?"Delete this project? Its expenses and invoices stay but lose the job link, and its activities stay saved but are hidden.":k==="inv"?(isUp(S.inv.find(x=>x.id===el.dataset.id))?"Delete this uploaded invoice and its PDF? ":"Delete this invoice? ")+"Any income created from it will be removed.":k==="customers"?"Delete this customer? Their projects stay but lose the customer link.":"Delete this item permanently?";
    if(!await ask(m,"Yes, delete",true))return;
    if(k==="inv")ivUpClean(S.inv.find(x=>x.id===el.dataset.id));
    S[k]=S[k].filter(x=>x.id!==el.dataset.id);if(k==="jobs")S.mats=S.mats.filter(x=>x.job!==el.dataset.id);save();render()},
  delCat(el){D.cats.splice(+el.dataset.i,1);render()},
  addCat(){const n=v("newcat").trim();if(!n||D.cats.some(c=>c.n.trim()===n))return;D.cats.push({o:null,n});render()},
  setSave:saveSettings,setCancel:closeSettings
};
document.addEventListener("click",e=>{
  document.querySelectorAll("details.dd[open]").forEach(d=>{if(!d.contains(e.target))d.open=false});
  const t=e.target.closest("[data-act]");if(t){if(t.dataset.act==="wopen"&&e.target.closest("input,select,label,button,.nv2"))return;actions[t.dataset.act](t);return}
  const n=e.target.closest("[data-tab]");if(n){if($("#ov2").classList.contains("on"))$("#no2").click();if(!$("#sbin,#sbsetup"))hide();if(tab==="settings"){apply(S.cfg);D=null}tab=n.dataset.tab;selCust=selProj=selAct=selWork=null;wtab="tasks";wInfo=false;wq="";cview="active";cq="";render();window.scrollTo(0,0)}
});
document.addEventListener("input",e=>{
  const t=e.target;if(t.classList)t.classList.remove("bad");
  if(t.id==="wq"){wq=t.value;const c=$(".wclr");if(c)c.hidden=!wq;const b=$("#wbody");if(b)b.innerHTML=workBody();return}
  if(t.id==="cq"){cq=t.value;const l=$("#clist");if(l)l.innerHTML=custList();return}
  if(t.dataset.p91){const d=digits(t.value).slice(0,10);if(t.value!==d)t.value=d;t.parentNode.classList.remove("bad");return}
  if(t.dataset.ci!==undefined){D.cats[+t.dataset.ci].n=t.value;return}
  if(t.dataset.d)setPath(D,t.dataset.d,t.value)
});
async function restoreBackup(inp){
  const f=inp.files[0];inp.value="";if(!f)return;
  try{const d=JSON.parse(await f.text());if(!Array.isArray(d.jobs)||!Array.isArray(d.tx)||!Array.isArray(d.inv))throw 0;
    if(!await ask("Replace all current data with this backup?","Yes, restore",true))return;
    S={customers:d.customers||[],jobs:d.jobs,tx:d.tx,inv:d.inv,acts:d.acts||[],mats:d.mats||[],cfg:mergeCfg(d.cfg)};fixNums();fixCodes();save();closeSettings();toast("Backup restored")}
  catch(e){toast("That file is not a valid backup")}
}
document.addEventListener("focusin",e=>{if(e.target.id==="wq"){const i=e.target;setTimeout(()=>i.select(),0)}});
document.addEventListener("click",e=>{if(e.target.id==="wq")e.target.select()});
document.addEventListener("keydown",e=>{
  if(e.key!=="Escape")return;
  if($("#ov2").classList.contains("on")){$("#no2").click();return}
  if($("#ivp").classList.contains("on")){ivPrevClose();return}
  if($("#iv").classList.contains("on")){ivClose();return}
  if($("#ov").classList.contains("on")&&!$("#sbin,#sbsetup"))hide();
});
document.addEventListener("change",async e=>{
  const t=e.target;
  if(t.id==="bkf"){restoreBackup(t);return}
  if(t.id==="n_cust"){fillFromCust(t.value);return}
  if(t.id==="c_same"){$("#c_wawrap").style.display=t.checked?"none":"";return}
  if(t.id==="logof"){const f=t.files[0];t.value="";if(f&&D)readLogo(f).then(d=>{D.logo=d;render()}).catch(()=>toast("Could not read that image"));return}
  const dd=t.closest&&t.closest("details.dd");if(dd){updDD(dd);dd.classList.remove("bad");return}
  if(t.id==="asw"){selAct=t.value||null;render();return}
  if(t.id==="a_ph"){addPhotos(t);return}
  if(t.id==="psw"){selProj=t.value||null;render();return}
  if(!t.dataset.set)return;
  const it=S[t.dataset.k].find(x=>x.id===t.dataset.id);if(!it)return;
  if(await ask("Change "+t.dataset.set+" to “"+t.value+"”?","Yes, change")){it[t.dataset.set]=t.value;save()}
  render();
});

/* ================= invoices: editor, PDF preview, download ================= */
const nf=n=>(+n||0).toLocaleString("en-IN",{maximumFractionDigits:2});
const nr=n=>{n=+n||0;return n.toLocaleString("en-IN",{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2})};
function inWords(n){
  n=Math.round((+n||0)*100)/100;const r=Math.floor(n),ps=Math.round((n-r)*100);
  const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],b=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const two=x=>x<20?a[x]:b[Math.floor(x/10)]+(x%10?"-"+a[x%10]:"");
  const three=x=>(x>=100?a[Math.floor(x/100)]+" Hundred"+(x%100?" and ":""):"")+(x%100?two(x%100):"");
  const cr=Math.floor(r/1e7),lk=Math.floor(r/1e5)%100,th=Math.floor(r/1e3)%100,h=r%1000,p=[];
  if(cr)p.push(two(cr%100)+" Crore");if(lk)p.push(two(lk)+" Lakh");if(th)p.push(two(th)+" Thousand");
  if(h)p.push((p.length&&h<100?"and ":"")+three(h));
  let w=p.length?p.join(" "):"Zero";
  return"Rupees "+w+(ps?" and "+two(ps)+" Paise":"")+" Only."}
const escRe=x=>x.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&");
function nextInvNo(date,exceptId){
  const pre=S.cfg.inv.prefix||"INV/",yy=String(date||today()).slice(2,4),re=new RegExp("^"+escRe(pre+yy)+"(\\d+)$");
  let mx=0;S.inv.forEach(i=>{if(i.id===exceptId||(i.d&&i.d.up))return;const m=re.exec((i.d&&i.d.no)||i.ref||"");if(m)mx=Math.max(mx,+m[1])});
  return pre+yy+String(mx+1).padStart(2,"0")}
const bizOf=()=>{const c=S.cfg.inv;return{name:c.name||S.cfg.appName,tag:c.tag,phone:c.phone,email:c.email,web:c.web}};
function autoOf(jid){const J=S.jobs.find(j=>j.id===jid)||{},C=S.customers.find(c=>c.id===J.customer)||{};return{cust:C.name||"",addr:C.address||"",site:J.location||"",title:J.name||""}}
function invD(i){
  if(i.d)return i.d;const c=S.cfg.inv,au=autoOf(i.job);
  return{no:i.ref||"—",date:i.date,due:c.due,quote:"",...au,items:[{desc:"Services",spec:"",qty:"",rate:"",amt:+i.amt||0}],total:+i.amt||0,terms:[...c.terms],pay:{...c.pay},biz:bizOf()}}
const longDate=d=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d||"");if(!m)return"";return new Date(+m[1],+m[2]-1,+m[3]).toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})};
function invHTML(d){
  const b=d.biz||{},p=d.pay||{},it=d.items||[],spec=it.some(x=>x.spec),qr=it.some(x=>+x.qty||+x.rate),total=+d.total||it.reduce((t,x)=>t+(+x.amt||0),0);
  const meta=(l,v)=>v?`<div class="im"><span>${l}</span><b>${esc(v)}</b></div>`:"";
  const contact=[b.phone&&"Phone: "+esc(b.phone),b.email&&"Email: "+esc(b.email),b.web&&"Website: "+esc(b.web)].filter(Boolean).join("&nbsp;&nbsp;&nbsp;&nbsp;");
  const cols=`<col style="width:8%"><col>${spec?'<col style="width:17%">':""}${qr?'<col style="width:9%"><col style="width:15%">':""}<col style="width:15%">`;
  const rows=it.map((x,k)=>`<tr><td class="c">${String(k+1).padStart(2,"0")}</td><td>${esc(x.desc)}</td>${spec?`<td>${esc(x.spec)||""}</td>`:""}${qr?`<td class="c">${/^[\d.,]+$/.test(String(x.qty||"").trim())&&x.qty!==""?nf(String(x.qty).replace(/,/g,"")):esc(x.qty)}</td><td class="c">${+x.rate?nr(x.rate):""}</td>`:""}<td class="c">${nf(x.amt)}</td></tr>`).join("");
  const terms=(d.terms||[]).map(t=>{const m=/^([A-Z][^:.]{2,40}):\s+(.+)$/.exec(t);return`<li>${m?`<b>${esc(m[1])}:</b> ${esc(m[2])}`:esc(t)}</li>`}).join("");
  return`<div class="isheet"><div class="ihd">${S.cfg.logo?`<img class="ilogo" src="${esc(S.cfg.logo)}" alt="">`:""}<div class="itx"><div class="inm">${esc(b.name)}</div><div class="itg">${esc(b.tag)}</div></div></div>
  <div class="icn">${contact}</div><div class="irule"></div><div class="ittl">INVOICE</div>
  <div class="imr">${meta("INVOICE NO.",d.no)}${meta("INVOICE DATE",longDate(d.date))}${meta("PAYMENT DUE",d.due)}${meta("AGAINST QUOTATION",d.quote)}</div>
  <div class="imr">${meta("CUSTOMER NAME",d.cust)}${meta("SITE LOCATION",d.site)}</div>
  ${d.addr?`<div class="ilb">BILLING ADDRESS:</div><div class="ilv">${esc(d.addr)}</div>`:""}
  ${d.title?`<div class="ilb">PROJECT:</div><div class="ilv">${esc(d.title)}</div>`:""}
  <table class="itb"><colgroup>${cols}</colgroup><thead><tr><th>S.No</th><th class="l">Description</th>${spec?'<th class="l">Specification</th>':""}${qr?"<th>Qty</th><th>Unit Price (₹)</th>":""}<th>Amount (₹)</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="itot"><span>Total Invoice Value</span><b>₹${nf(total)}</b></div><div class="iw">Amount in Words: ${esc(inWords(total))}</div>
  ${terms?`<div class="ish">TERMS &amp; CONDITIONS</div><ul class="itm2">${terms}</ul>`:""}
  <div class="ish n">Payment Details</div><div class="ipg"><div><span>ACCOUNT NAME</span>${esc(p.name)}</div><div><span>BANK &amp; BRANCH</span>${esc(p.bank)}</div><div><span>ACCOUNT NO.</span>${esc(p.acc)}</div><div><span>IFSC / UPI</span>${esc(p.ifsc)}</div></div>
  <div class="ifoot"><div class="isg"><div><b>${esc(d.cust)}</b><small>(Received By / Signature)</small></div><div class="r"><b>For ${esc(b.name)}</b><small>(Authorized Signatory)</small></div></div>
  <div class="ithx">— Thank you for choosing ${esc(b.name)} —</div></div></div>`}

/* ---- PDF ---- */
const H2P="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
const loadH2P=()=>new Promise((res,rej)=>{if(window.html2pdf)return res();const x=document.createElement("script");x.src=H2P;x.onload=res;x.onerror=()=>rej(new Error("could not load the PDF library"));document.head.appendChild(x)});
const ivFile=d=>"Invoice_"+String(d.no||"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"")+(d.cust?"_"+d.cust.replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,""):"")+".pdf";
async function ivPdf(d){
  await loadH2P();
  const host=document.createElement("div");host.style.cssText="position:fixed;left:-12000px;top:0;width:794px;background:#fff";host.innerHTML=invHTML(d);document.body.appendChild(host);
  try{await Promise.all([...host.querySelectorAll("img")].map(im=>im.complete?1:new Promise(r=>{im.onload=im.onerror=r})));
    return await window.html2pdf().set({margin:0,image:{type:"jpeg",quality:.96},html2canvas:{scale:2.5,useCORS:true,backgroundColor:"#ffffff",windowWidth:794},jsPDF:{unit:"pt",format:"a4",orientation:"portrait"},pagebreak:{mode:["css"]}}).from(host.firstElementChild).outputPdf("blob")}
  finally{host.remove()}}
async function ivDownload(d,share){
  toast("Preparing PDF…");
  try{const blob=await ivPdf(d),name=ivFile(d);
    if(share&&navigator.canShare){const f=new File([blob],name,{type:"application/pdf"});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return}}
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},5000);toast("PDF downloaded")}
  catch(e){if(e&&e.name==="AbortError")return;toast("Could not create the PDF – check your internet and try again")}}

/* ---- preview ---- */
let PVD=null;
function ivPrevOpen(d){
  PVD=d;const o=$("#ivp");
  o.innerHTML=`<div class="ivh"><button class="hb" data-act="ivpx" aria-label="Close preview">${SV('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button><h2>${esc(d.no||"Invoice")}</h2>${navigator.canShare?`<button class="hb" data-act="ivpsh" aria-label="Share PDF" title="Share">${SV('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>')}</button>`:""}<button class="sv" data-act="ivpdl">${ICDL} Download</button></div><div class="ivpb" id="ivpb">${invHTML(d)}</div>`;
  o.classList.add("on");ivFit();history.pushState(navSnap(),"")}
function ivFit(){const b=$("#ivpb"),sh=b&&b.firstElementChild;if(!sh)return;sh.style.zoom=Math.min(1.2,(b.clientWidth-16)/794)}
window.addEventListener("resize",ivFit);
function ivPrevClose(){$("#ivp").classList.remove("on");$("#ivp").innerHTML="";PVD=null}

/* ---- editor ---- */
let IV=null;
const IVBLANK=()=>({desc:"",spec:"",qty:"",rate:"",amt:""});
function ivOpen(pid,inv){
  if(!S.jobs.length)return toast("Add a "+S.cfg.labels.work.toLowerCase()+" first");
  const c=S.cfg.inv,job=inv?inv.job:(pid&&known(pid)?pid:"");
  if(inv){const d=invD(inv),au=autoOf(inv.job);
    IV={id:inv.id,legacy:!inv.d,job:inv.job,status:inv.status||"Not sent",no:d.no,date:d.date||today(),due:d.due||"",quote:d.quote||"",cust:d.cust||"",addr:d.addr||"",site:d.site||"",title:d.title||"",auto:au,
      items:(d.items&&d.items.length?d.items:[IVBLANK()]).map(x=>({desc:x.desc||"",spec:x.spec||"",qty:x.qty===undefined?"":String(x.qty),rate:x.rate===undefined?"":String(x.rate),amt:x.amt===undefined?"":String(x.amt)})),
      pay:{...(d.pay||c.pay)},biz:{...(d.biz||bizOf())},terms:(d.terms||c.terms).join("\n"),dflt:false,dirty:false}}
  else{const au=autoOf(job);
    IV={id:null,legacy:false,job,status:"Not sent",no:nextInvNo(today()),date:today(),due:c.due||"",quote:"",...au,auto:au,items:[IVBLANK()],pay:{...c.pay},biz:bizOf(),terms:c.terms.join("\n"),dflt:false,dirty:false}}
  ivRender(0);$("#iv").classList.add("on");history.pushState(navSnap(),"")}
const fld=(l,h,req)=>`<div class="f"><label>${l}${req?" *":""}</label>${h}</div>`;
const tin=(k,v,ph,id,ro)=>`<input ${id?`id="${id}"`:""} data-iv="${k}" value="${esc(v)}" ${ph?`placeholder="${esc(ph)}"`:""} ${ro?"readonly":""} autocomplete="off">`;
function ivRender(keep){
  const o=$("#iv"),old=o.querySelector(".ivb"),top=keep&&old?old.scrollTop:0,tot=IV.items.reduce((t,x)=>t+(parseFloat(x.amt)||0),0),c=IV;
  const jopt='<option value="">— select project —</option>'+S.jobs.map(j=>`<option value="${j.id}" ${j.id===c.job?"selected":""}>${esc(pcode(j.num))} · ${esc(j.name)}</option>`).join("");
  o.innerHTML=`<div class="ivh"><button class="hb" data-act="ivx" aria-label="Close">${SV('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button><h2>${c.id?"Edit invoice":"New invoice"}<small id="ivhn">${esc(c.no)}</small></h2><button class="hb" data-act="ivprev" aria-label="View as PDF" title="View as PDF">${ICV}</button><button class="sv" data-act="ivsave">Save</button></div>
  <div class="ivb">
   <div class="ivs"><h3>Invoice</h3>
    ${fld("Project",`<select id="iv_job" data-iv="job">${jopt}</select>`,1)}
    <div class="t2">${fld("Invoice no. (auto)",tin("no",c.no,"","ivno",!c.legacy))}${fld("Date",`<input id="iv_date" type="date" data-iv="date" value="${esc(c.date)}">`,1)}</div>
    <div class="t2">${fld("Status",`<select data-iv="status">${opts(IS,c.status)}</select>`)}${fld("Payment due",tin("due",c.due,"e.g. On Receipt"))}</div>
    ${fld("Against quotation (optional)",tin("quote",c.quote,"e.g. GTG/QTN/2601"))}</div>
   <div class="ivs"><h3>Customer &amp; site</h3>
    ${fld("Customer name",tin("cust",c.cust,"","iv_cust"),1)}
    ${fld("Billing address",`<textarea data-iv="addr" rows="2">${esc(c.addr)}</textarea>`)}
    ${fld("Site location",tin("site",c.site))}${fld("Project / work title",tin("title",c.title))}</div>
   <div class="ivs"><h3>Items</h3>
    ${c.items.map((x,i)=>`<div class="itm"><div class="itr"><b>Item ${i+1}</b>${c.items.length>1?`<button class="ib d" data-act="ivrm" data-i="${i}" title="Remove item">${ICD}</button>`:""}</div>
      <div class="f"><label>Description *</label><input data-i="${i}" data-f="desc" value="${esc(x.desc)}" autocomplete="off"></div>
      <div class="f"><label>Specification (optional)</label><input data-i="${i}" data-f="spec" value="${esc(x.spec)}" autocomplete="off"></div>
      <div class="g3"><div class="f"><label>Qty</label><input data-i="${i}" data-f="qty" inputmode="decimal" value="${esc(x.qty)}"></div><div class="f"><label>Unit price</label><input data-i="${i}" data-f="rate" inputmode="decimal" value="${esc(x.rate)}"></div><div class="f"><label>Amount *</label><input data-i="${i}" data-f="amt" inputmode="decimal" value="${esc(x.amt)}"></div></div></div>`).join("")}
    <button class="btn g full" data-act="ivadd">＋ Add item</button>
    <div class="ivtot"><span>Total</span><b id="ivtot">₹${nf(tot)}</b></div><div class="mu">Qty × unit price fills the amount; you can still change the amount.</div></div>
   <div class="ivs"><details><summary>Payment details <small>${esc(c.pay.name)} · ${esc(c.pay.bank)}</small></summary>
    ${fld("Account name",`<input data-pay="name" value="${esc(c.pay.name)}">`)}${fld("Bank &amp; branch",`<input data-pay="bank" value="${esc(c.pay.bank)}">`)}${fld("Account no.",`<input data-pay="acc" value="${esc(c.pay.acc)}">`)}${fld("IFSC / UPI",`<input data-pay="ifsc" value="${esc(c.pay.ifsc)}">`)}</details></div>
   <div class="ivs"><details><summary>Terms &amp; conditions <small>${c.terms.split("\n").filter(x=>x.trim()).length} points</small></summary>
    ${fld("Load a template",`<select data-act-change="ivtpl"><option value="">Choose…</option><option value="supply">Material supply</option><option value="work">Work / service completed</option></select>`)}
    ${fld("One point per line",`<textarea id="ivterms" rows="10">${esc(c.terms)}</textarea>`)}</details></div>
   <div class="ivs"><details><summary>Invoice header <small>${esc(c.biz.name)}</small></summary>
    ${fld("Business name",`<input data-biz="name" value="${esc(c.biz.name)}">`)}${fld("Tagline",`<input data-biz="tag" value="${esc(c.biz.tag)}">`)}${fld("Phone",`<input data-biz="phone" value="${esc(c.biz.phone)}">`)}${fld("Email",`<input data-biz="email" value="${esc(c.biz.email)}">`)}${fld("Website",`<input data-biz="web" value="${esc(c.biz.web)}">`)}</details></div>
   <label class="ck ivdf"><input type="checkbox" id="ivdflt" ${c.dflt?"checked":""}> Use these payment details, terms and header as the default for new invoices</label>
   <button class="btn full" data-act="ivsave" style="margin-top:10px">Save invoice</button></div>`;
  const nb=o.querySelector(".ivb");if(nb)nb.scrollTop=top}
function ivBuild(){
  const items=IV.items.filter(x=>x.desc.trim()||parseFloat(x.amt)).map(x=>({desc:x.desc.trim(),spec:x.spec.trim(),qty:x.qty.trim(),rate:x.rate.trim(),amt:parseFloat(x.amt)||0}));
  return{no:IV.no,date:IV.date,due:IV.due.trim(),quote:IV.quote.trim(),cust:IV.cust.trim(),addr:IV.addr.trim(),site:IV.site.trim(),title:IV.title.trim(),items,total:Math.round(items.reduce((t,x)=>t+x.amt,0)*100)/100,
    terms:IV.terms.split("\n").map(x=>x.trim()).filter(Boolean),pay:{...IV.pay},biz:{...IV.biz}}}
async function ivClose(force){
  if(!force&&IV&&IV.dirty&&!await ask("Discard this invoice? Your changes will be lost.","Yes, discard",true))return;
  $("#iv").classList.remove("on");$("#iv").innerHTML="";IV=null}
function ivSave(){
  const d=ivBuild();
  if(!need([["iv_job",!!IV.job],["iv_date",!!IV.date],["iv_cust",!!d.cust]]))return;
  if(!d.items.length||d.total<=0)return toast("Add at least one item with an amount");
  if(d.items.some(x=>!x.desc))return toast("Every item needs a description");
  const rec={id:IV.id||uid(),job:IV.job,amt:d.total,status:IV.status,ref:d.no,date:d.date,d};
  if(IV.id){const i=S.inv.find(x=>x.id===IV.id);if(i)Object.assign(i,rec);else S.inv.push(rec)}else S.inv.push(rec);
  if(IV.dflt)S.cfg.inv={...S.cfg.inv,...d.biz,pay:{...d.pay},terms:[...d.terms]};
  save();selProj=IV.job;tab="inv";const first=!IV.id;ivClose(true);render();toast(first?"Invoice saved":"Invoice updated")}
document.addEventListener("input",e=>{
  const t=e.target;if(!IV||!t.closest||!t.closest("#iv"))return;IV.dirty=true;
  if(t.dataset.iv){const k=t.dataset.iv;IV[k]=t.value;if(k==="date"&&!IV.id&&!IV.legacy){IV.no=nextInvNo(t.value);const n=$("#ivno");if(n)n.value=IV.no;const h=$("#ivhn");if(h)h.textContent=IV.no}return}
  if(t.dataset.f){const r=IV.items[+t.dataset.i];r[t.dataset.f]=t.value;
    if(t.dataset.f==="qty"||t.dataset.f==="rate"){const q=parseFloat(r.qty),u=parseFloat(r.rate);if(q>0&&u>0){r.amt=String(Math.round(q*u*100)/100);const a=t.closest(".itm").querySelector('[data-f="amt"]');if(a)a.value=r.amt}}
    const tot=IV.items.reduce((x,y)=>x+(parseFloat(y.amt)||0),0);$("#ivtot").textContent="₹"+nf(tot);return}
  if(t.dataset.pay){IV.pay[t.dataset.pay]=t.value;return}
  if(t.dataset.biz){IV.biz[t.dataset.biz]=t.value;return}
  if(t.id==="ivterms")IV.terms=t.value});
document.addEventListener("change",e=>{
  const t=e.target;if(!IV||!t.closest||!t.closest("#iv"))return;
  if(t.id==="ivdflt"){IV.dflt=t.checked;return}
  if(t.dataset.iv==="job"){IV.dirty=true;const n=autoOf(t.value);["cust","addr","site","title"].forEach(k=>{if(!IV[k]||IV[k]===IV.auto[k])IV[k]=n[k]});IV.auto=n;IV.job=t.value;ivRender(1);return}
  if(t.dataset.actChange==="ivtpl"&&t.value){IV.dirty=true;IV.terms=(t.value==="work"?TERMS_WORK:TERMS_SUPPLY).join("\n");ivRender(1);const d=$("#iv").querySelectorAll("details");d[1]&&(d[1].open=true)}});
Object.assign(actions,{
  ivx(){ivClose()},ivsave(){ivSave()},
  ivprev(){const d=ivBuild();if(!d.items.length&&!d.cust)toast("Fill in the invoice details to preview");ivPrevOpen(d)},
  ivadd(){IV.dirty=true;IV.items.push(IVBLANK());ivRender(1);const b=$("#iv .ivb");b.scrollTop=b.scrollHeight},
  ivrm(el){IV.dirty=true;IV.items.splice(+el.dataset.i,1);ivRender(1)},
  ivpx(){ivPrevClose()},ivpdl(){if(PVD)ivDownload(PVD)},ivpsh(){if(PVD)ivDownload(PVD,true)},
  ivview(el){const i=S.inv.find(x=>x.id===el.dataset.id);if(i){if(isUp(i))ivUpOpen(i);else ivPrevOpen(invD(i))}},
  ivdl(el){const i=S.inv.find(x=>x.id===el.dataset.id);if(i){if(isUp(i))ivUpOpen(i,true);else ivDownload(invD(i))}}});

/* ================= upload your own invoice (PDF) – only inside a project ================= */
const upBar=()=>`<div class="upl"><div><b>Upload your own invoice</b><div class="mu">Add a PDF to this project only</div></div><button class="btn sm" data-act="ivup">Upload PDF</button><input type="file" id="ivfile" accept="application/pdf,.pdf" hidden></div>`;
const isUp=i=>!!(i&&i.d&&i.d.up);
const UPK=id=>"ivpdf-"+id;
const fsize=b=>b<1048576?Math.max(1,Math.round(b/1024))+" KB":(b/1048576).toFixed(1)+" MB";
const pdfLimit=()=>SB.on?10*1048576:2*1048576;
let UPL=null;
function askHTML(html,okLabel,noLabel){
  return new Promise(res=>{const o=$("#ov2");
    $("#box2").innerHTML=`${html}<div class="acts"><button class="btn g" id="no2">${esc(noLabel||"Cancel")}</button><button class="btn" id="yes2">${esc(okLabel||"Yes, continue")}</button></div>`;
    o.classList.add("on");
    $("#no2").onclick=()=>{o.classList.remove("on");res(false)};$("#yes2").onclick=()=>{o.classList.remove("on");res(true)}})}

/* ---- read the text inside an uploaded PDF (pdf.js) and pre-fill the form ---- */
const PDFJS="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",PDFW="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
let pdfReady=null;
const loadPdfJs=()=>pdfReady||(pdfReady=new Promise((res,rej)=>{
  const done=async()=>{try{if(!window.pdfjsLib.GlobalWorkerOptions.workerSrc){try{const t=await (await fetch(PDFW)).text();window.pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([t],{type:"text/javascript"}))}catch(e){window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFW}}res(window.pdfjsLib)}catch(e){rej(e)}};
  if(window.pdfjsLib)return done();
  const x=document.createElement("script");x.src=PDFJS;x.onload=done;x.onerror=()=>{pdfReady=null;rej(new Error("could not load the PDF reader"))};document.head.appendChild(x)}));
async function pdfText(file){
  const lib=await loadPdfJs(),pdf=await lib.getDocument({data:await file.arrayBuffer()}).promise;let out="";
  for(let n=1;n<=Math.min(pdf.numPages,30);n++){const c=await (await pdf.getPage(n)).getTextContent();
    let px=null,py=null,pe=0,line="";
    for(const t of c.items){if(!t.str&&!t.hasEOL)continue;
      const x=t.transform[4],y=t.transform[5],h=Math.abs(t.transform[0])||t.height||10;
      if(py!==null){
        if(Math.abs(y-py)>h*.5){out+=line+"\n";line=""}
        else if(x-pe>h*.18)line+=" "}
      line+=t.str;px=x;py=y;pe=x+(t.width||0);
      if(t.hasEOL){out+=line+"\n";line="";py=null}}
    out+=line+"\n\n"}
  return out.replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim()}
const MON={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
function isoD(y,m,d){y=+y;m=+m;d=+d;if(y<100)y+=2000;if(!(y>1999&&y<2100&&m>=1&&m<=12&&d>=1&&d<=31))return"";return y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0")}
function findDate(t){
  let m;
  if(m=t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/))return isoD(m[1],m[2],m[3]);
  if(m=t.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/))return isoD(m[3],m[2],m[1]);
  m=t.match(/(\d{1,2})(?:st|nd|rd|th)?[\s\-,]+([A-Za-z]{3})[A-Za-z]*\.?[\s\-,]+(\d{2,4})/);if(m&&MON[m[2].toLowerCase()])return isoD(m[3],MON[m[2].toLowerCase()],m[1]);
  m=t.match(/([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);if(m&&MON[m[1].toLowerCase()])return isoD(m[3],MON[m[1].toLowerCase()],m[2]);
  return""}
function parseInv(raw){
  /* repair numbers/ids that got split into pieces: "7 , 884" -> "7,884", "₹ 38" -> "₹38", "Valu e" */
  let t=raw.replace(/\s+/g," ").replace(/(\d)\s*([,.])\s*(\d)/g,"$1$2$3").replace(/(₹|rs\.?|inr)\s+(?=\d)/ig,"$1").replace(/\bTotal Invoice Valu e\b/ig,"Total Invoice Value");
  const r={text:raw.slice(0,20000),no:"",date:"",due:"",amt:0};let m,re;
  /* invoice number: first label match whose value contains a digit; ids may be split by a space ("GTG/INV/26 02") */
  re=/\binvoice\s*(?:no\.?|number|num|#)\s*[:\-#]?\s*([A-Za-z0-9][A-Za-z0-9\/\-_]*(?:\s[A-Za-z0-9\/\-_]{1,3}(?=\s|$))*)/ig;
  while(m=re.exec(t)){const v=m[1].replace(/\s+/g,"").slice(0,30);if(/\d/.test(v)&&!/^(date|due)/i.test(v)){r.no=v;break}}
  /* dates: try every labelled spot until one really parses */
  const dateOf=pats=>{for(const p of pats){const rx=new RegExp(p+"\\s*[:\\-]?\\s*(.{6,24})","ig");let x;while(x=rx.exec(t)){const d=findDate(x[1]);if(d)return d}}return ""};
  r.date=dateOf(["\\binvoice\\s*date\\b","\\bdate\\s*of\\s*issue\\b","\\bissue\\s*date\\b","\\bissued\\s*(?:on|date)\\b","\\bdated\\b","\\bdate\\b"]);
  r.due=dateOf(["\\bpayment\\s*due(?:\\s*date)?\\b","\\bdue\\s*date\\b","\\bdue\\s*(?:on|by)\\b"]);
  if(!r.date){const d=findDate(t);if(d)r.date=d}
  const num=s=>{const v=parseFloat(String(s).replace(/,/g,""));return isFinite(v)?v:0};
  const L=["total\\s*invoice\\s*valu\\s?e","grand\\s*total","total\\s*amount(?:\\s*payable)?","net\\s*payable","amount\\s*(?:due|payable)","balance\\s*due","invoice\\s*(?:total|amount)","total"];
  for(const l of L){const rx=new RegExp("\\b"+l+"\\s*(?:\\(.*?\\))?\\s*[:\\-]?\\s*(?:₹|rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d{1,2})?)","ig");let best=0,x;while(x=rx.exec(t)){const v=num(x[1]);if(v>0)best=v}if(best){r.amt=best;break}}
  if(!r.amt){const rx=/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/ig;let x,mx=0;while(x=rx.exec(t))mx=Math.max(mx,num(x[1]));r.amt=mx}
  /* customer, address, work title, site, line items – read line by line */
  const fx=x=>x.replace(/(\d)\s*([,.])\s*(\d)/g,"$1$2$3").replace(/(₹|rs\.?|inr)\s+(?=\d)/ig,"$1");
  const ln=raw.split("\n").map(x=>fx(x.replace(/\s+/g," ").trim())).filter(Boolean);
  const val=re=>{for(let i=0;i<ln.length;i++){const k=ln[i].match(re);if(!k)continue;const rest=ln[i].slice(k.index+k[0].length).replace(/^[\s:\-]+/,"");if(rest)return rest;if(ln[i+1])return ln[i+1]}return ""};
  r.cust=val(/^(?:customer\s*name|bill(?:ed)?\s*to|customer)\b\s*:?/i);
  r.site=val(/^site\s*(?:location|address)?\s*:?/i);
  r.title=val(/^(?:project\s*\/\s*work\s*title|project|work\s*title|subject)\s*:?/i);
  for(let i=0;i<ln.length;i++){if(/^bill(?:ing)?\s*address\b/i.test(ln[i])){const first=ln[i].replace(/^bill(?:ing)?\s*address\s*:?\s*/i,"");const a=first?[first]:[];
    for(let j=i+1;j<ln.length&&a.length<4;j++){if(/^(project|site|s\.?\s*no|description|invoice|customer)\b/i.test(ln[j]))break;a.push(ln[j])}r.addr=a.join(", ");break}}
  r.items=[];let inT=false;
  for(const l of ln){
    if(!inT){if(/^(?:s\.?\s*no\.?\s+)?(?:description|particulars|item)\b.*(?:amount|total|₹)/i.test(l))inT=true;continue}
    if(/^(?:sub\s*total|total|grand\s*total|amount\s*in\s*words)/i.test(l))break;
    const k=l.match(/^(?:\d{1,3}[.)]?\s+)?(.+?)\s+((?:[\d,]+(?:\.\d+)?\s+){0,2}[\d,]+(?:\.\d+)?)$/);if(!k)continue;
    const nums=k[2].split(/\s+/).map(num);let it={desc:k[1].replace(/\s*[₹]$/,"").trim(),amt:nums[nums.length-1]};
    if(nums.length===3&&Math.abs(nums[0]*nums[1]-nums[2])<.5){it.qty=nums[0];it.rate=nums[1]}
    else if(nums.length>1){it.desc=(k[1]+" "+nums.slice(0,-1).join(" ")).trim()}
    if(it.desc&&it.amt>0)r.items.push(it)}
  return r}
async function ivUpPick(file,pid){
  if(!file)return;
  if(!S.jobs.some(j=>j.id===pid))return toast("Open a project first – invoices can only be uploaded inside a project");
  if(!(file.type==="application/pdf"||/\.pdf$/i.test(file.name)))return toast("Please choose a PDF file");
  if(!file.size)return toast("This file is empty");
  if(file.size>pdfLimit())return toast("PDF is too large – maximum "+fsize(pdfLimit()));
  try{if((await file.slice(0,5).text())!=="%PDF-")return toast("This doesn't look like a valid PDF file")}catch(e){}
  let ex=null;
  try{toast("Reading PDF…");const raw=await pdfText(file);
    if(raw.length>10)ex=parseInv(raw);else toast("No text found in this PDF (scanned image?) – please fill the details manually")}
  catch(e){toast("Couldn't read the PDF text – please fill the details manually")}
  if(S.jobs.some(j=>j.id===pid))ivUpForm(pid,file,null,ex)}
function ivUpDone(){if(UPL&&UPL.url)URL.revokeObjectURL(UPL.url);UPL=null}
function ivUpForm(pid,file,rec,ex){
  if(!S.jobs.some(j=>j.id===pid))return;
  ivUpDone();
  const d=rec?rec.d:{},f=file?{name:file.name,size:file.size}:d.file,au0=autoOf(pid);
  const itTxt=(d.items&&d.items.length?d.items:(ex&&ex.items)||[]).map(x=>x.desc+" | "+x.amt).join("\n");
  UPL={pid,file,rec,busy:false,text:(ex?ex.text:(rec&&rec.d.text))||"",url:file?URL.createObjectURL(file):""};
  show(`<h3>${rec?"Edit uploaded invoice":"Upload invoice PDF"}</h3>
  ${F("Project",`<input value="${esc(jn(pid))}" readonly>`)}
  <div class="f"><label>PDF file</label><div class="upf"><span class="upi">PDF</span><div class="upn"><b>${esc(f.name)}</b><div class="mu">${fsize(f.size)}</div></div>${file?`<a class="btn g sm" href="${UPL.url}" target="_blank" rel="noopener">Preview</a>`:""}</div></div>
  ${ex&&(ex.no||ex.amt||ex.date)?'<div class="mu f">✓ Details were read from the PDF – please check them before uploading.</div>':""}
  ${F("Customer name",`<input id="up_cust" value="${esc(d.cust||(ex&&ex.cust)||au0.cust||"")}" autocomplete="off">`)}
  ${F("Billing address",`<textarea id="up_addr" rows="2">${esc(d.addr||(ex&&ex.addr)||au0.addr||"")}</textarea>`)}
  ${F("Project / work title",`<input id="up_title" value="${esc(d.title||(ex&&ex.title)||au0.title||"")}" autocomplete="off">`)}
  ${F("Invoice number",`<input id="up_no" value="${esc(rec?rec.ref:(ex&&ex.no)||"")}" autocomplete="off">`,1)}
  <div class="t2">${F("Invoice date",`<input id="up_date" type="date" value="${esc(rec?rec.date:(ex&&ex.date)||today())}">`,1)}${F("Due date",`<input id="up_due" type="date" value="${esc(d.dueDate||(ex&&ex.due)||"")}">`)}</div>
  ${F("Invoice amount (₹)",`<input id="up_amt" type="number" inputmode="decimal" min="0" step="any" value="${rec?esc(rec.amt):(ex&&ex.amt?esc(ex.amt):"")}">`,1)}
  ${F("Status",`<select id="up_st">${opts(IS,rec?rec.status:"Not sent")}</select>`)}
  ${F("Line items (one per line: description | amount)",`<textarea id="up_items" rows="4" placeholder="e.g. Ploughing | 2000">${esc(itTxt)}</textarea>`)}
  ${F("Notes",`<textarea id="up_notes" rows="3">${esc(d.notes||"")}</textarea>`)}
  ${UPL.text?`<details class="ext"><summary>Text read from PDF (saved with this invoice)</summary><textarea readonly>${esc(UPL.text)}</textarea></details>`:""}
  <div class="mu f">This invoice is saved only in this project. When it is marked Paid, its amount is added to ${esc(S.cfg.labels.money)} as income.</div>
  <div class="acts"><button class="btn g" id="no">Cancel</button><button class="btn" id="yes">${rec?"Save changes":"Review &amp; upload"}</button></div>`);
  $("#no").onclick=()=>{hide();ivUpDone()};
  $("#yes").onclick=ivUpReview}
async function ivUpReview(){
  if(!UPL||UPL.busy)return;
  const no=gv("up_no"),date=gv("up_date"),due=gv("up_due"),amt=parseFloat(gv("up_amt")),st=gv("up_st"),notes=gv("up_notes"),cust=gv("up_cust"),addr=gv("up_addr"),title=gv("up_title");
  const items=gv("up_items").split("\n").map(l=>{const i=l.lastIndexOf("|");if(i<0)return null;const a=parseFloat(l.slice(i+1).replace(/[,₹\s]/g,""));const ds=l.slice(0,i).trim();return ds&&isFinite(a)?{desc:ds,amt:a}:null}).filter(Boolean);
  if(!need([["up_no",!!no],["up_date",!!date],["up_amt",amt>0]]))return;
  if(due&&due<date)return toast("Due date can't be before the invoice date");
  const {pid,rec,file,text}=UPL,amt2=Math.round(amt*100)/100;
  if(rec){
    Object.assign(rec,{amt:amt2,status:st,ref:no,date});Object.assign(rec.d,{no,date,dueDate:due,notes,cust,addr,title,items});
    save();hide();ivUpDone();render();toast("Invoice updated");return}
  const dup=S.inv.some(i=>i.job===pid&&String(i.ref||"").trim().toLowerCase()===no.toLowerCase());
  const row=(l,v)=>`<div><span>${esc(l)}</span><b>${esc(v)}</b></div>`;
  const ok=await askHTML(`<h3>Confirm upload</h3><div class="mu f">Please check the details before this invoice is added to the project.</div>
    <div class="cfm">${row("Project",jn(pid))}${row("File",file.name+" ("+fsize(file.size)+")")}${row("Customer",cust||"—")}${row("Work",title||"—")}${row("Invoice no.",no)}${row("Invoice date",fdate(date))}${row("Due date",due?fdate(due):"—")}${row("Amount","₹"+nf(amt2))}${row("Status",st)}${row("Items",items.length?items.length+" line"+(items.length>1?"s":""):"—")}${row("Notes",notes||"—")}</div>
    ${dup?`<div class="rd f">⚠ An invoice numbered ${esc(no)} already exists in this project.</div>`:""}`,dup?"Add anyway":"Yes, upload","Go back");
  if(!ok||!UPL)return;
  UPL.busy=true;const b=$("#yes");if(b){b.disabled=true;b.textContent="Uploading…"}
  const id=uid(),safe=(file.name.replace(/[^A-Za-z0-9._-]+/g,"_").slice(-80)||"invoice.pdf"),path=SB.on?`${SB.uid}/inv-${id}/${safe}`:"";
  const fi={name:file.name,size:file.size,path,key:UPK(id)};
  try{
    if(SB.on){const r=await SB.client.storage.from(BUCKET).upload(path,file,{contentType:"application/pdf",upsert:true});if(r.error)throw r.error}
    else{const du=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(file)});PH[fi.key]=du;savePhLocal();cloudPhSet(fi.key,du,id)}
  }catch(e){
    if(UPL)UPL.busy=false;if(b){b.disabled=false;b.textContent="Review & upload"}
    const m=(e&&e.message)||String(e);
    const msg=/mime|not allowed|unsupported/i.test(m)?"Storage rejects PDFs – in Supabase SQL run: update storage.buckets set allowed_mime_types = null where id = 'project-photos';":"Upload failed: "+m;
    setStatus("⚠ "+msg);toast(msg);return}
  const au=autoOf(pid);
  S.inv.push({id,job:pid,amt:amt2,status:st,ref:no,date,d:{up:1,no,date,dueDate:due,notes,text:text||"",cust:cust||au.cust,addr:addr||au.addr,title:title||au.title,items,file:fi}});
  save();hide();ivUpDone();selProj=pid;tab="inv";lastAdded=id;render();toast("Invoice uploaded to this project")}
async function ivUpOpen(i,dl){
  const f=i.d.file;let w=null;
  try{
    if(SB.on&&f.path){
      if(!dl)w=window.open("","_blank");
      const r=await SB.client.storage.from(BUCKET).createSignedUrl(f.path,600,dl?{download:f.name}:undefined);
      if(r.error||!r.data)throw r.error||new Error("File not found");
      if(w&&!dl){w.location.href=r.data.signedUrl;return}
      const a=document.createElement("a");a.href=r.data.signedUrl;if(dl)a.download=f.name;else a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();return}
    const du=PH[f.key];
    if(!du){needPh(f.key);return toast("Loading PDF… tap again in a moment")}
    const url=URL.createObjectURL(dataToBlob(du));
    if(dl){const a=document.createElement("a");a.href=url;a.download=f.name;document.body.appendChild(a);a.click();a.remove()}
    else{const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()}
    setTimeout(()=>URL.revokeObjectURL(url),60000)
  }catch(e){if(w)w.close();toast("Could not open the PDF"+(e&&e.message?": "+e.message:""))}}
function ivUpClean(i){
  const f=i&&i.d&&i.d.file;if(!f)return;
  try{if(SB.on&&f.path)SB.client.storage.from(BUCKET).remove([f.path]).catch(()=>{});else cloudPhDel(f.key)}catch(e){}
  delete PH[f.key];savePhLocal()}
Object.assign(actions,{ivup(){const i=$("#ivfile");if(i)i.click()}});
document.addEventListener("change",e=>{const t=e.target;if(!t||t.id!=="ivfile")return;const f=t.files&&t.files[0],pid=selProj;t.value="";if(f)ivUpPick(f,pid)});

/* views */
let flt={mode:"all",val:""};
const inF=d=>flt.mode==="all"||!flt.val||String(d||"").startsWith(flt.val);
function dueTag(d,st){
  if(!d||st==="Completed")return"";
  const diff=Math.round((new Date(d)-new Date(today()))/864e5);
  const c=diff<0?"rd":diff<=2?"am":"mu";
  const l=diff<0?`overdue ${-diff}d`:diff===0?"today":diff===1?"tomorrow":`in ${diff}d`;
  return`<span class="${c}" style="font-size:11px;margin-left:6px">${l}</span>`;
}
const stat=(b,l,c,k)=>`<div class="stat ${k||(c?"s-"+c:"")}"><b class="${c||""}">${b}</b><span>${l}</span></div>`;
const th=h=>h.map(([l,c])=>`<th class="${c||""}">${esc(l)}</th>`).join("");
const tbl=(head,rows,minw,empty,cls)=>`<div class="tw"><table class="dt ${cls||""}" style="min-width:${minw}px"><thead><tr>${th(head)}</tr></thead><tbody>${rows||`<tr><td class="none" colspan="${head.length}">${empty}</td></tr>`}</tbody></table></div>`;
let selProj=null;
const known=id=>S.jobs.some(j=>j.id===id);
const sumA=a=>a.reduce((s,x)=>s+x.amt,0);
const col=n=>n>0?"gr":n<0?"rd":"";
const sgn=n=>(n>0?"+":n<0?"−":"")+num(Math.abs(n));
const mrow=(l,val,c)=>`<div class="m"><span>${l}</span><b class="${c||""}">${val}</b></div>`;
function projs(){const a=[...S.jobs].sort((x,y)=>(+x.num||0)-(+y.num||0));
  if(S.inv.some(i=>!known(i.job)))a.push({id:"__none",num:"–",name:"Unassigned"});return a}
function mEntries(pid){
  const mine=x=>pid==="__none"?!known(x.job):x.job===pid,e=[];
  S.acts.filter(a=>mine(a)&&known(a.job)&&a.status==="Completed"&&+a.cost>0).forEach(a=>e.push({id:a.id,date:a.date,what:a.title,who:"",src:"Task",amt:+a.cost}));
  (S.mats||[]).filter(m=>mine(m)&&known(m.job)).forEach(m=>e.push({id:m.id,date:m.date,what:m.name+(m.qty?" ("+m.qty+")":""),who:m.who||"",src:"Raw material",amt:+m.amt||0}));
  return e.filter(x=>inF(x.date)).sort((x,y)=>(x.date||"").localeCompare(y.date||""));
}
function pFin(pid){
  const mine=x=>pid==="__none"?!known(x.job):x.job===pid;
  const tx=mEntries(pid),inv=S.inv.filter(i=>mine(i)&&inF(i.date)),inc=inv.filter(i=>i.status==="Paid");
  const income=sumA(inc),exp=sumA(tx),invd=sumA(inv);
  return{tx,inc,inv,income,exp,net:income-exp,invd,paid:income,pend:invd-income,diff:invd-exp};
}
const acBtns=(k,id,noDel)=>`<div class="ac"><button class="ib" data-act="edit" data-k="${k}" data-id="${id}" title="Edit">${ICE}</button>${noDel?"":`<button class="ib d" data-act="del" data-k="${k}" data-id="${id}" title="Delete">${ICD}</button>`}</div>`;
let wf="all",ivf="all",selWork=null,wtab="tasks",wInfo=false;
let wq="";
const todayS=()=>today();
const PFL=[["all","All"],["started","Started"],["prog","In progress"],["done","Completed"]];
const pfOk=(st,f)=>f==="done"?st==="Completed":f==="started"?st==="Not started":f==="prog"?st==="In progress":st!=="Completed";
const chips=(cur,act)=>`<div class="fchips" role="group" aria-label="Filter by status">${PFL.map(([v,l])=>`<button class="fc ${cur===v?"on":""}" data-act="${act}" data-v="${v}" aria-pressed="${cur===v}">${l}</button>`).join("")}</div>`;
function workBody(){
  const q=wq.trim().toLowerCase(),qc=q.replace(/[\s-]/g,""),t=todayS();
  const base=S.jobs.filter(j=>inF(j.next)).filter(j=>!q||String(j.name||"").toLowerCase().includes(q)||pcode(j.num).toLowerCase().replace("-","").includes(qc)||pcode(j.num).toLowerCase().includes(q));
  const grp=j=>!j.next?2:j.next>=t?0:1;
  const list=base.filter(j=>pfOk(j.status,wf))
    .sort((a,b)=>grp(a)-grp(b)||(grp(a)===1?(b.next||"").localeCompare(a.next||""):(a.next||"").localeCompare(b.next||""))||(+a.num||0)-(+b.num||0));
  const cards=list.map(j=>{const C=S.customers.find(c=>c.id===j.customer),mob=j.contact||(C&&C.phone)||"",due=dueTag(j.next,j.status);
    return`<div class="pc wrow click" data-rid="${j.id}" data-act="wopen" data-pid="${j.id}" title="Open project">
  <div class="wL"><div class="wr1"><span class="pill">${esc(pcode(j.num))}</span><b class="pn" title="${esc(j.name)}">${esc(j.name)}</b></div>
  <div class="wr2 mu"><span class="ell1" title="${esc(j.location)}">${ICP}${esc(j.location)||"—"}</span><span class="ph">${mob?"📞 "+esc(mob):""}</span></div></div>
  <div class="wR"><div class="wdt">${fdate(j.next)}</div>${due}</div></div>`}).join("");
  return`${chips(wf,"wfilt")}
  ${cards?`<div class="pgrid cm">${cards}</div>`:(S.jobs.length?ES("Nothing here","No projects match this filter or search."):ES("No "+S.cfg.labels.work.toLowerCase()+"s yet","Add your first landscaping, home garden or rooftop garden to start tracking work, payments and invoices.",1))}`;
}

/* project page: tasks done, with auto visit count */
const stLbl=s=>s==="Not started"?"Start":s;
const T12=(id,v)=>{let h="",m="00",p="AM";if(v){const [H,M]=String(v).split(":").map(Number);if(!isNaN(H)&&!isNaN(M)){p=H<12?"AM":"PM";h=String(H%12||12);m=String(M).padStart(2,"0")}}
  return`<div class="t12"><select id="${id}_h" aria-label="Hour"><option value="">--</option>${[...Array(12)].map((_,i)=>`<option ${String(i+1)===h?"selected":""}>${i+1}</option>`).join("")}</select><select id="${id}_m" aria-label="Minute">${[...Array(60)].map((_,i)=>{const x=String(i).padStart(2,"0");return`<option ${x===m?"selected":""}>${x}</option>`}).join("")}</select><select id="${id}_p" aria-label="AM or PM"><option ${p==="AM"?"selected":""}>AM</option><option ${p==="PM"?"selected":""}>PM</option></select></div>`};
const gT12=id=>{const h=+gv(id+"_h");if(!h)return"";const m=+gv(id+"_m"),pm=gv(id+"_p")==="PM";return String((h%12)+(pm?12:0)).padStart(2,"0")+":"+String(m).padStart(2,"0")};
const fdate=d=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d||""))return"—";const [y,m,dd]=d.split("-").map(Number);return dd+"/"+m+"/"+String(y).slice(-2)};
const tfmt=t=>{if(!t)return"—";const [h,m]=String(t).split(":").map(Number);if(isNaN(h)||isNaN(m))return esc(t);return(h%12||12)+":"+String(m).padStart(2,"0")+" "+(h<12?"AM":"PM")};
const taskRows=id=>S.acts.filter(a=>a.job===id&&a.status==="Completed")
  .sort((x,y)=>(x.date||"").localeCompare(y.date||"")||(x.tin||"").localeCompare(y.tin||"")||(x.created||0)-(y.created||0));
const matRows=id=>(S.mats||[]).filter(m=>m.job===id).sort((x,y)=>(x.date||"").localeCompare(y.date||"")||(x.created||0)-(y.created||0));
function vWorkOne(J){
  const rows=taskRows(J.id),mats=matRows(J.id);
  const tSum=rows.reduce((t,a)=>t+(+a.cost||0),0),mSum=mats.reduce((t,x)=>t+(+x.amt||0),0);
  const trs=rows.map((a,i)=>`<tr data-rid="${a.id}"><td class="vn">${i+1}</td>
    <td class="wrap"><b>${esc(a.title)}</b></td>
    <td class="tm">${tfmt(a.tin)}</td><td class="tm">${tfmt(a.tout)}</td>
    <td class="tm">${fdate(a.date)}</td>
    <td class="tm">${+a.cost>0?num(a.cost):"—"}</td>
    <td class="wrap">${a.notes?`<div class="pre">${esc(a.notes)}</div>`:(a.photos&&a.photos.length?"":"—")}${ths(a.photos)}</td>
    <td class="act"><button class="ib" data-act="tedit" data-id="${a.id}" title="Edit task">${ICE}</button><button class="ib d" data-act="tdel" data-id="${a.id}" title="Delete task">${ICD}</button></td></tr>`).join("");
  const mrs=mats.map(x=>`<tr data-rid="${x.id}"><td class="wrap"><b>${esc(x.name)}</b>${ths(x.photos)}</td><td class="tm">${num(x.amt)}</td><td class="wrap">${esc(x.qty)||"—"}</td><td class="tm">${fdate(x.date)}</td><td class="wrap any">${esc(x.who)||"—"}</td><td class="act"><button class="ib" data-act="medit" data-id="${x.id}" title="Edit material">${ICE}</button><button class="ib d" data-act="mdel" data-id="${x.id}" title="Delete material">${ICD}</button></td></tr>`).join("");
  const headT=[["Visit count","vn"],["Task name"],["In time"],["Out time"],["Visit date"],["Amount"],["Notes"],["Actions","act"]];
  const headM=[["Material"],["Amount"],["Quantity"],["Bought on"],["Who"],["Actions","act"]];
  const stOpts=["Not started","In progress","Completed"];if(!stOpts.includes(J.status))stOpts.push(J.status);
  const onT=wtab!=="mats";
  const C=S.customers.find(c=>c.id===J.customer),mob=J.contact||(C&&C.phone)||"";
  const due=dueTag(J.next,J.status);
  return`<div class="pgrid"><div class="pc wd wd2${wInfo?" open":""}">
    <div class="whd" data-act="winfo" role="button" tabindex="0" aria-expanded="${wInfo}">
      <div class="wl"><b class="pn" title="${esc(J.name)}">${esc(J.name)}</b><span class="chev${wInfo?" up":""}">${SV('<path d="m6 9 6 6 6-6"/>')}</span></div>
      <div class="wr"><div class="wdate">${fdate(J.next)}</div>${due?`<div class="dtag">${due}</div>`:""}</div>
    </div>
    <div class="st1"><select class="stsel ${stCls(J.status)}" data-k="jobs" data-id="${J.id}" data-set="status" aria-label="Status">${stOpts.map(o=>`<option value="${esc(o)}"${o===J.status?" selected":""}>${esc(stLbl(o))}</option>`).join("")}</select>
        <span>Total visits: <b>${rows.length}</b></span><span>Total amount: <b>${num(tSum+mSum)}</b></span></div>
    ${wInfo?`<div class="wbody">
      <div class="ig">
        <div class="it"><span class="k">Client</span><b>${esc(C&&C.name)||"—"}</b></div>
        <div class="it"><span class="k">Mobile</span><b>${mob?`<a href="tel:${esc(mob)}">${esc(mob)}</a>`:"—"}</b></div>
        <div class="it full"><span class="k">Location</span><b>${esc(J.location)||"—"}</b></div>
        <div class="it full"><span class="k">Next visit</span><input type="date" value="${esc(J.next)}" data-k="jobs" data-id="${J.id}" data-set="next"></div>
      </div>
      <div class="wfoot"><button class="ab" data-act="edit" data-k="jobs" data-id="${J.id}">${ICE}Edit project</button><button class="ab d" data-act="del" data-k="jobs" data-id="${J.id}">${ICD}Delete</button></div>
    </div>`:""}
  </div></div>
  <div class="wtabs"><button class="${onT?"on":""}" data-act="wtb" data-t="tasks">Tasks done (${rows.length})</button><button class="${onT?"":"on"}" data-act="wtb" data-t="mats">Raw materials (${mats.length})</button></div>
  ${onT?tbl(headT,trs,0,"No tasks yet. Tap + to add one.","cp tk")+`<div class="wsum">Task total: <b>${num(tSum)}</b></div>`
       :tbl(headM,mrs,0,"No materials yet. Tap + to add one.","cp tk")+`<div class="wsum">Materials total: <b>${num(mSum)}</b></div>`}`;
}
function addTaskForm(pid,rec){
  if(!S.jobs.some(j=>j.id===pid))return;
  tmpPh=[];curPh=rec?[...(rec.photos||[])]:[];remPh=[];curPh.forEach(needPh);
  show(`<h3>${rec?"Edit task":"Add task"}</h3>
  ${F("Project",`<input value="${esc(jn(pid))}" readonly>`)}
  ${F("Task name",`<input id="t_title" value="${esc(rec?rec.title:"")}">`,1)}
  <div class="t2"><div class="f"><label>In time</label>${T12("t_in",rec&&rec.tin)}</div><div class="f"><label>Out time</label>${T12("t_out",rec&&rec.tout)}</div></div>
  ${F("Visit date",`<input id="t_date" type="date" value="${esc(rec?rec.date:today())}">`,1)}
  ${F("Amount spent",`<input id="t_amt" type="number" inputmode="decimal" min="0" step="any" value="${rec&&+rec.cost>0?esc(rec.cost):""}">`)}
  ${F("Notes",`<textarea id="t_notes" rows="4">${esc(rec?rec.notes:"")}</textarea>`)}
  ${F("Photos",'<input id="a_ph" type="file" accept="image/*" multiple><div class="ths" id="a_prev"></div>')}
  <div class="mu f">Visit count is calculated automatically from the visit dates.</div>
  <div class="acts"><button class="btn g" id="no">Cancel</button><button class="btn" id="yes">${rec?"Save changes":"Add task"}</button></div>`);
  drawPrev();
  $("#no").onclick=hide;
  $("#yes").onclick=()=>saveTask(pid,rec);
}
async function saveTask(pid,rec){
  if(busy)return;
  const title=gv("t_title"),d=gv("t_date"),tin=gT12("t_in"),tout=gT12("t_out"),notes=gv("t_notes"),amt=gv("t_amt");
  if(!need([["t_title",!!title],["t_date",!!d],["t_amt",amt===""||+amt>=0]]))return;
  if(tin&&tout&&tout<tin){$("#t_out_h").classList.add("bad");return toast("Out time must be after the in time")}
  const cost=Math.max(0,+amt||0);
  busy=true;
  try{
    if(!await ask(rec?"Save changes to this task?":"Add this task?",rec?"Yes, save":"Yes, add"))return;
    hide();
    const aid=rec?rec.id:uid(),ids=[];
    tmpPh.forEach(x=>{const id=uid()+uid();PH[id]=x;ids.push(id);cloudPhSet(id,x,aid)});
    remPh.forEach(id=>{delete PH[id];cloudPhDel(id)});
    if(tmpPh.length||remPh.length)savePhLocal();
    const photos=[...curPh,...ids];tmpPh=[];remPh=[];
    if(rec)Object.assign(rec,{title,date:d,tin,tout,notes,cost,photos});
    else{rec={id:aid,job:pid,title,date:d,status:"Completed",notes,photos,tin,tout,cost,created:Date.now()};S.acts.push(rec);
      const PJ=S.jobs.find(j=>j.id===pid);if(PJ&&PJ.status==="Not started")PJ.status="In progress"}
    wtab="tasks";save();lastAdded=rec.id;render();
  }finally{busy=false}
}
function addMatForm(pid,rec){
  if(!S.jobs.some(j=>j.id===pid))return;
  tmpPh=[];curPh=rec?[...(rec.photos||[])]:[];remPh=[];curPh.forEach(needPh);
  show(`<h3>${rec?"Edit raw material":"Add raw material"}</h3>
  ${F("Project",`<input value="${esc(jn(pid))}" readonly>`)}
  ${F("Material",`<input id="m_name" value="${esc(rec?rec.name:"")}">`,1)}
  ${F("Amount",`<input id="m_amt" type="number" inputmode="decimal" min="0" step="any" value="${rec?esc(rec.amt):""}">`,1)}
  ${F("Quantity",`<input id="m_qty" placeholder="e.g. 20 bags, 5 kg" value="${esc(rec?rec.qty:"")}">`)}
  ${F("Bought on",`<input id="m_date" type="date" value="${esc(rec?rec.date:today())}">`,1)}
  ${F("Who",`<input id="m_who" value="${esc(rec?rec.who:(SB.who||""))}">`)}
  ${F("Photos",'<input id="a_ph" type="file" accept="image/*" multiple><div class="ths" id="a_prev"></div>')}
  <div class="acts"><button class="btn g" id="no">Cancel</button><button class="btn" id="yes">${rec?"Save changes":"Add material"}</button></div>`);
  drawPrev();
  $("#no").onclick=hide;
  $("#yes").onclick=()=>saveMat(pid,rec);
}
async function saveMat(pid,rec){
  if(busy)return;
  const name=gv("m_name"),amt=gv("m_amt"),qty=gv("m_qty"),d=gv("m_date"),who=gv("m_who");
  if(!need([["m_name",!!name],["m_amt",amt!==""&&+amt>=0],["m_date",!!d]]))return;
  busy=true;
  try{
    if(!await ask(rec?"Save changes to this material?":"Add this material?",rec?"Yes, save":"Yes, add"))return;
    hide();
    const mid=rec?rec.id:uid(),ids=[];
    tmpPh.forEach(x=>{const id=uid()+uid();PH[id]=x;ids.push(id);cloudPhSet(id,x,"mat-"+mid)});
    remPh.forEach(id=>{delete PH[id];cloudPhDel(id)});
    if(tmpPh.length||remPh.length)savePhLocal();
    const photos=[...curPh,...ids];tmpPh=[];remPh=[];
    if(rec)Object.assign(rec,{name,amt:+amt,qty,date:d,who,photos});
    else{rec={id:mid,job:pid,name,amt:+amt,qty,date:d,who,photos,created:Date.now()};S.mats.push(rec)}
    wtab="mats";save();lastAdded=rec.id;render();
  }finally{busy=false}
}
/* project tile used on Money and Invoices */
function pTile(p,mode,click){
  const f=pFin(p.id),n=mode==="inv"?f.inv.length:mode==="money"?f.tx.length:f.tx.length+f.inv.length;
  let left=`<span class="pill">${p.id==="__none"?"No project":esc(pcode(p.num))}</span><b class="pn" title="${esc(p.name)}">${esc(p.name)}</b><div class="mu">${n} record${n===1?"":"s"}</div>`,right;
  if(mode==="money")right=mrow("Income",num(f.income),"gr")+mrow("Expenses",num(f.exp),"rd")+mrow("Net",sgn(f.net),col(f.net));
  else if(mode==="inv")right=mrow("Invoiced",num(f.invd))+mrow("Paid",num(f.paid),"gr")+mrow("Pending",num(f.pend),"am");
  else{
    const w=f.net>0?"Profit":f.net<0?"Loss":"Break-even";
    left+=`<span class="bdg ${col(f.net)}">${w}</span><div class="mu">Invoiced: ${num(f.invd)}</div><div class="mu">Invoiced − expenses: <b class="${col(f.diff)}">${sgn(f.diff)}</b></div>`;
    right=mrow("Income",num(f.income),"gr")+mrow("Expenses",num(f.exp),"rd")+mrow("Net "+w.toLowerCase(),num(Math.abs(f.net)),col(f.net));
  }
  return`<div class="pc ${click?"click":""}" ${click?`data-act="selp" data-pid="${p.id}"`:""}><div class="L">${left}</div><div class="R">${right}</div></div>`;
}
function txTile(t){const i=t.type==="Income",nt=cl(t).join(", ");
  return`<div class="pc" data-rid="${t.id}"><div class="L"><span class="pill ${i?"gr":"rd"}">${esc(t.type)}</span><b class="pn ${i?"gr":"rd"}">${i?"+":"−"}${num(t.amt)}</b><div class="mu ell2" title="${esc(nt)}">${esc(nt)}</div></div>
  <div class="R">${acBtns("tx",t.id,!!t.inv)}<div class="mu">${esc(t.date)}</div>${t.note?`<div class="mu ell2" title="${esc(t.note)}">${esc(t.note)}</div>`:""}${t.inv?'<div class="mu">🔗 Paid invoice</div>':""}</div></div>`}
const ICV=SV('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),ICDL=SV('<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/>');
function invTile(i){
  const d=invD(i);
  return`<div class="pc ivc" data-rid="${i.id}"><div class="L"><span class="pill">${esc(d.no||i.ref||"Invoice")}</span><b class="pn">${num(i.amt)}</b>${d.up?`<div class="mu ell2" title="${esc(d.file.name)}">📎 ${esc(d.file.name)}</div>`:`<div class="mu ell2" title="${esc(d.title)}">${esc(d.title||d.cust)||"—"}</div>`}</div>
  <div class="R"><div class="ac"><button class="ib" data-act="ivview" data-id="${i.id}" title="View PDF">${ICV}</button><button class="ib" data-act="ivdl" data-id="${i.id}" title="Download PDF">${ICDL}</button><button class="ib" data-act="edit" data-k="inv" data-id="${i.id}" title="Edit">${ICE}</button><button class="ib d" data-act="del" data-k="inv" data-id="${i.id}" title="Delete">${ICD}</button></div><div class="mu">${fdate(i.date)}</div><select data-k="inv" data-id="${i.id}" data-set="status">${opts(IS,i.status)}</select></div></div>`}
function projHead(){return`<div class="xbar">${XB}</div>`}
const grid=(a,fn,empty)=>a.length?`<div class="pgrid">${a.map(fn).join("")}</div>`:`<div class="empty">${empty}</div>`;
const NONE="No records found. Tap + to add one.";
const CT=["Home","Rooftop","Commercial","Other"];
const HK=["Referral","Website","Social media","Walk-in","Phone call","Other"];
let selCust=null,cq="";
const digits=x=>String(x||"").replace(/\D/g,"");
const AS='style="flex:1;display:grid;place-items:center;text-align:center;text-decoration:none;min-height:40px"';
const custJobs=id=>S.jobs.filter(j=>j.customer===id);
function custFin(id){const js=custJobs(id),ids=new Set(js.map(j=>j.id)),iv=S.inv.filter(i=>ids.has(i.job)),t=sumA(iv),p=sumA(iv.filter(i=>i.status==="Paid"));return{n:js.length,t,due:t-p}}
function dupOf(r){return S.customers.find(c=>c.id!==r.id&&((digits(r.phone).length>=7&&digits(c.phone)===digits(r.phone))||(r.email&&c.email&&c.email.toLowerCase()===r.email.toLowerCase())))}
let cview="active";
const isAct=c=>c.active!==false;
function custList(){
  const q=cq.trim().toLowerCase(),qd=digits(cq);
  if(!S.customers.length)return ES("No customers yet","Add your customers once, then link every project, invoice and visit to them.","cust");
  const a=S.customers.filter(c=>isAct(c)===(cview==="active")).filter(c=>!q||[c.name,c.code,c.email,c.address].some(x=>String(x||"").toLowerCase().includes(q))||(qd&&digits(c.phone).includes(qd))||S.jobs.some(j=>j.customer===c.id&&String(j.location||"").toLowerCase().includes(q))).sort((x,y)=>x.name.localeCompare(y.name));
  return a.length?`<div class="pgrid">${a.map(c=>`<div class="pc click" data-act="csel" data-id="${c.id}" data-rid="${c.id}">
  <div class="L"><span class="pill">${esc(c.code||c.type)}</span><b class="pn" title="${esc(c.name)}">${esc(c.name)}</b><div class="mu ell2" title="${esc(c.address)}">${ICP}${esc(c.address)||"—"}</div></div>
  <div class="R">${acBtns("customers",c.id)}<div class="mu ell2" title="${esc(c.phone)}">📞 ${esc(c.phone)||"—"}</div></div></div>`).join("")}</div>`:`<div class="empty">${q?"No customer matches your search.":"No "+cview+" customers."}</div>`;
}

const P91=(id)=>`<div class="p91"><span>+91</span><input id="${id}" type="tel" inputmode="numeric" data-p91="1" placeholder="10-digit number" autocomplete="off"></div>`;
function addCustForm(){
  show(`<h3>New customer</h3>${F("Name",'<input id="c_name">',1)}${F("Contact number",P91("c_phone"))}
  <label class="ck" style="margin:2px 0 10px"><input type="checkbox" id="c_same" checked> WhatsApp number is same as contact number</label>
  <div id="c_wawrap" style="display:none">${F("WhatsApp number",P91("c_wa"))}</div>
  ${F("Email",'<input id="c_email" type="email">')}${F("Address",'<input id="c_addr">')}${F("Customer type",`<select id="c_type">${opts(CT)}</select>`)}${F("How they know about us",`<select id="c_hk"><option value="">— select —</option>${opts(HK)}</select>`)}${F("Notes",'<textarea id="c_notes" rows="3"></textarea>')}
  <div class="acts"><button class="btn g" id="no">Cancel</button><button class="btn" id="yes">Add customer</button></div>`);
  $("#no").onclick=hide;
  $("#yes").onclick=async()=>{
    if(busy)return;const name=gv("c_name"),same=$("#c_same").checked,p=digits(gv("c_phone")),w=same?p:digits(gv("c_wa"));
    if(!need([["c_name",!!name]]))return;
    if(p&&p.length!==10||!same&&w&&w.length!==10){[["c_phone",p],["c_wa",w]].forEach(([id,x])=>{const el=document.getElementById(id);if(el&&x&&x.length!==10)el.parentNode.classList.add("bad")});return toast("Enter exactly 10 digits after +91")}
    const rec={id:uid(),code:nextCode(),name,phone:p?"+91"+p:"",whatsapp:w?"+91"+w:"",email:gv("c_email"),address:gv("c_addr"),type:gv("c_type"),howknown:gv("c_hk"),notes:gv("c_notes"),active:true};
    busy=true;
    try{const d=dupOf(rec);if(d&&!await ask("This looks like an existing customer: "+d.name+". Add a new record anyway?","Add anyway"))return;
      hide();S.customers.push(rec);save();selCust=rec.id;cview="active";tab="cust";lastAdded=rec.id;render()}finally{busy=false}
  };
}
const LOGO0='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.5 6-7"/></svg>';
function readLogo(file){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;
  im.onload=()=>{const k=Math.min(1,256/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);let d=c.toDataURL("image/png");if(d.length>250000)d=c.toDataURL("image/jpeg",.85);res(d)};im.src=r.result};r.readAsDataURL(file)})}
const IC={cust:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',work:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.5 6-7"/>',
 money:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
 inv:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
 act:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',website:'<path d="M3 3h18v18H3z"/><path d="M3 9h18M9 3v18"/>'};
const ES=(t,m,btn)=>`<div class="es"><svg viewBox="0 0 132 112" aria-hidden="true"><circle cx="66" cy="58" r="46" fill="#F0FDF4"/><path d="M66 78V48" stroke="#14532D" stroke-width="3" stroke-linecap="round"/><path d="M66 56C66 44 56 36 44 38c0 12 8 20 22 18Z" fill="#0D9488"/><path d="M66 48C66 34 78 26 92 29c0 14-10 22-26 19Z" fill="#14532D"/><path d="M46 78h40l-4 22a4 4 0 0 1-4 3H54a4 4 0 0 1-4-3Z" fill="#14532D"/><rect x="43" y="73" width="46" height="8" rx="3" fill="#166534"/><path d="M24 104h84" stroke="#BBF7D0" stroke-width="3" stroke-linecap="round"/></svg><h3>${t}</h3><p>${m}</p>${btn?`<button class="btn" data-act="${btn==="cust"?"addCust":"addProj"}">${btn==="cust"?"+ Add Customer":"+ Add "+esc(S.cfg.labels.work)}</button>`:""}</div>`;
function overview(mode){const P=projs();return P.length?`<div class="pgrid">${P.map(p=>pTile(p,mode,true)).join("")}</div>`: ES("Add a project first","Money, invoices and activity are tracked for each project.",1)}


function renderFlt(){$("#flt").innerHTML=""}
function renderView(){
  if(selProj&&!projs().some(p=>p.id===selProj))selProj=null;
  if(selAct&&!known(selAct))selAct=null;
  if(selWork&&!known(selWork))selWork=null;
  if(selCust&&!S.customers.some(c=>c.id===selCust))selCust=null;
  notify();
}
function hlRow(){if(!lastAdded)return;const r=document.querySelector(`[data-rid="${lastAdded}"]`);lastAdded=null;if(r){r.classList.add("new");r.scrollIntoView({block:"center",behavior:"smooth"})}}
function render(){
  const L=S.cfg.labels;
  $("#ttl").textContent=S.cfg.appName;
  const welcome=$("#welcome");if(welcome){const raw=String(SB.who||"").trim();const name=raw.includes("@")?raw.split("@")[0].replace(/[._-]+/g," ").trim().split(/\s+/)[0]:raw.split(/\s+/)[0];welcome.textContent=SB.on&&name?"Welcome back, "+name.charAt(0).toUpperCase()+name.slice(1)+"!":"Welcome back!";}
  const signoutBtn=$("#signout");if(signoutBtn)signoutBtn.hidden=!SB.on;
  $(".logo").innerHTML=S.cfg.logo?`<img src="${esc(S.cfg.logo)}" alt="">`:LOGO0;
  $("#fab").style.display=tab==="settings"||tab==="money"||tab==="act"?"none":"";
  $("#fab").setAttribute("aria-label",{work:selWork?(wtab==="mats"?"Add material":"Add task"):"Add project",money:"Add money entry",inv:"Add invoice",act:"Add activity",cust:"Add customer"}[tab]||"Add");
  renderFlt();renderView();
  navSync();
}
/* browser / phone back button: step back through app pages instead of leaving */
const navSnap=()=>({tab,selCust,selProj,selAct,selWork,cview});
let navKey=null,popping=false;
function navSync(){
  const s=navSnap(),k=JSON.stringify(s);
  if(navKey===null){history.replaceState(s,"")}
  else if(k!==navKey&&!popping){history.pushState(s,"")}
  navKey=k;
}
window.addEventListener("popstate",e=>{
  if($("#ivp").classList.contains("on")&&!$("#ov2").classList.contains("on")){ivPrevClose();history.pushState(navSnap(),"");return}
  if($("#iv").classList.contains("on")&&!$("#ov2").classList.contains("on")){ivClose();history.pushState(navSnap(),"");return}
  const ov2=$("#ov2").classList.contains("on"),ov=$("#ov").classList.contains("on");
  if(ov2||ov){
    if(ov2)$("#no2").click();else if(!$("#sbin,#sbsetup"))hide();
    history.pushState(navSnap(),"");return;
  }
  const s=e.state;if(!s||!s.tab)return;
  if(tab==="settings"){apply(S.cfg);D=null}
  popping=true;
  try{
    if(s.tab==="settings"){openSettings()}
    else{tab=s.tab;selCust=s.selCust;selProj=s.selProj;selAct=s.selAct;selWork=s.selWork||null;cview=s.cview||"active";cq="";render()}
  }finally{popping=false}
  window.scrollTo(0,0);
});
function wireShell(){$("#fab").onclick=()=>{const pid=selProj&&selProj!=="__none"?selProj:undefined;({work:()=>selWork&&known(selWork)?(wtab==="mats"?addMatForm(selWork):addTaskForm(selWork)):addJobForm(),money:()=>addTxForm(pid),inv:()=>addInvForm(pid),act:()=>addActForm(selAct||undefined),cust:()=>addCustForm()}[tab]||(()=>{}))()};$("#gear").onclick=openSettings;}
/* ---- React bridge: tabs are React components that re-render when render() calls notify() ---- */
const subs=new Set();let rev=0,flush=null,booting=false;
function notify(){const run=()=>{rev++;subs.forEach(f=>f())};booting||!flush?run():flush(run)}
const subscribe=f=>{subs.add(f);return()=>subs.delete(f)};
const getRev=()=>rev;
const setFlush=f=>{flush=f};
function afterCommit(){hlRow();document.querySelectorAll("button[title]:not([aria-label])").forEach(b=>b.setAttribute("aria-label",b.title));if(tab==="settings")window.scrollTo(0,0)}
load();apply(S.cfg);
let booted=false;
function boot(){if(booted)return;booted=true;wireShell();booting=true;try{render()}finally{booting=false}if(supabaseConfigured)initSB();else sbMissingConfig()}
export { $, AS, AST, BUCKET, CT, D, DEF, ES, F, FLD, H2P, HK, IC, ICD, ICDL, ICE, ICP, ICV, INVDEF, IS, IV, IVBLANK, LOGO0, MON, NONE, P91, PDFJS, PDFW, PFL, PH, PHP, PVD, S, SB, SBT, SO, SV, T12, TERMS_SUPPLY, TERMS_WORK, UPK, UPL, UPQ, WS, XB, aStat, aTile, acBtns, actions, addActForm, addCustForm, addInvForm, addJobForm, addMatForm, addPhotos, addTaskForm, addTxForm, apply, ask, askHTML, autoOf, bizOf, busy, catChk, catFallback, chips, cl, closeSettings, cloudPhDel, cloudPhSet, col, cq, curPh, custFin, custJobs, custList, cview, dataToBlob, digits, drawPrev, dueTag, dupOf, editForm, esc, escRe, fdate, fetchAll, fillFromCust, findDate, fixCodes, fixNums, fld, flt, fsize, gT12, getChk, grid, gv, hide, hlRow, inF, inWords, initSB, invD, invHTML, invMirror, invTile, isAct, isMissingTable, isUp, isoD, ivBuild, ivClose, ivDownload, ivFile, ivFit, ivOpen, ivPdf, ivPrevClose, ivPrevOpen, ivRender, ivSave, ivUpClean, ivUpDone, ivUpForm, ivUpOpen, ivUpPick, ivUpReview, ivf, jn, jobOpts, jobsSorted, known, lastAdded, lastOf, load, loadH2P, loadPdfJs, loadPhLocal, longDate, mEntries, matRows, mergeCfg, mrow, navKey, navSnap, navSync, need, needPh, nextCode, nextInvNo, nextNum, nf, nr, num, okDate, openSettings, opts, overview, pFin, pTile, parseInv, pcode, pdfLimit, pdfReady, pdfText, pfOk, phReq, pk, placeOv, popping, projField, projHead, projs, readImg, readLogo, remPh, render, renderFlt, renderView, restoreBackup, rowsOf, save, saveAct, saveMat, savePhLocal, saveSettings, saveTask, sbApplyNext, sbDeny, sbFetch, sbLoginForm, sbMissingConfig, sbPullNext, sbPush, sbQueue, sbRun, sbStart, sbUpload, sbWatch, selAct, selCust, selProj, selWork, setPath, setStatus, settingsReturnTab, sgn, show, stCls, stLbl, stat, submitAdd, sumA, syncPaid, tab, taskRows, tbl, tfmt, th, ths, tin, tmpPh, toast, today, todayS, txTile, uid, upBar, updDD, v, vWorkOne, wInfo, wf, wireShell, workBody, wq, wtab, notify, subscribe, getRev, setFlush, afterCommit, boot };
