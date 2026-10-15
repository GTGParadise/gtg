import Html from '../components/Html.jsx';
import { actions, esc, toast, v } from '../core/engine.js';
import injectCss from '../components/injectCss.js';

/* ---- styles for this tab ---- */
const css = String.raw`.we-editor{max-width:1080px;margin:18px auto 48px;padding:0 2px;color:#17231b}.we-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin:0 0 18px}.we-heading h2{font-size:26px;line-height:1.2;margin:5px 0 7px;color:#14532d}.we-heading p,.we-muted{color:#64748b;font-size:13px;line-height:1.55;margin:0 0 12px}.we-eyebrow{font-size:11px;font-weight:800;letter-spacing:.13em;color:#65a30d}.we-draft-badge,.we-preview-label{border-radius:999px;padding:7px 11px;background:#ecfdf5;color:#166534;font-size:11px;font-weight:800;white-space:nowrap}.we-notice{padding:13px 15px;border:1px solid #d7e8ce;border-radius:12px;background:#f4fbef;color:#35503a;font-size:13px;line-height:1.55;margin-bottom:15px}.we-card{background:#fff;border:1px solid #e2e8df;border-radius:15px;padding:18px;margin:0 0 15px;box-shadow:0 4px 18px rgba(20,83,45,.045)}.we-card h3{margin:0 0 13px;font-size:16px;color:#14532d}.we-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.we-field{display:flex;flex-direction:column;gap:6px;min-width:0;margin:0 0 14px}.we-field label{font-size:12px;font-weight:700;color:#334155}.we-field input,.we-field textarea{box-sizing:border-box;width:100%;max-width:100%;border:1px solid #d7e0d5;border-radius:9px;padding:10px 11px;background:#fcfdfb;color:#1f2937;font:inherit;font-size:13px}.we-field textarea{resize:vertical;min-height:84px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.5}.we-field small{font-size:11px;color:#64748b}.we-field .bad{border-color:#dc2626!important}.we-wide{grid-column:1/-1}.we-colors{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.we-color{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #e2e8df;border-radius:10px;font-size:12px;font-weight:700}.we-color input{width:34px;height:30px;padding:2px;border:0;background:transparent}.we-color code{margin-left:auto;color:#64748b;font-size:11px}.we-section-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.we-toggle{display:flex;gap:9px;align-items:center;border:1px solid #e2e8df;border-radius:9px;padding:10px;font-size:12px;color:#334155}.we-toggle input{accent-color:#166534}.we-actions{display:flex;gap:9px;flex-wrap:wrap;margin:17px 0}.we-actions button{min-height:40px}.we-preview-card{overflow:hidden}.we-preview-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.we-preview{border:1px solid #dce7d7;border-radius:13px;overflow:hidden;background:var(--we-bg,#f8faf5);color:#1f2937}.we-preview-hero{padding:30px 24px;background:linear-gradient(135deg,rgba(20,83,45,.1),transparent),var(--we-bg,#f8faf5);border-bottom:1px solid #e2e8df}.we-preview-brand{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--we-primary,#14532d)}.we-preview-hero h2{font-size:clamp(22px,4vw,36px);line-height:1.1;margin:15px 0 9px;color:var(--we-primary,#14532d)}.we-preview-hero p{font-size:13px;line-height:1.6;max-width:560px;color:#475569}.we-preview-cta{display:inline-block;margin-top:6px;background:var(--we-accent,#65a30d);color:#fff;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:800}.we-preview-sections{display:flex;flex-wrap:wrap;gap:8px;padding:17px}.we-preview-sections span{padding:8px 10px;border-radius:8px;background:#fff;border:1px solid #e2e8df;font-size:11px;color:var(--we-primary,#14532d)}.we-preview-contact{padding:13px 17px;background:#fff;border-top:1px solid #e2e8df;color:#64748b;font-size:11px;overflow-wrap:anywhere}@media(max-width:640px){.we-editor{margin-top:12px}.we-heading{flex-direction:column}.we-heading h2{font-size:23px}.we-card{padding:14px}.we-grid,.we-colors{grid-template-columns:1fr}.we-section-list{grid-template-columns:repeat(2,minmax(0,1fr))}.we-actions{display:grid;grid-template-columns:1fr 1fr}.we-actions button{width:100%;padding-left:8px;padding-right:8px}.we-color code{font-size:10px}}
`;
injectCss('website-editor', css);

// Website Editor — local draft editor for the GTG Paradise customer website.
// This page intentionally saves drafts locally. Live publishing needs a protected
// write path to the customer site's Supabase project; never put a service-role key here.
const GTG_WEBSITE_DEFAULT = {
  brand: "GTG Paradise",
  heroTitle: "Grow to Green",
  heroSubtitle: "Create a greener home with thoughtful garden design, plants and ongoing care.",
  primary: "#14532D",
  accent: "#65A30D",
  background: "#F8FAF5",
  sections: { hero: true, gallery: true, services: true, plants: true, materials: true, packages: true, subscriptions: true, booking: true, about: true, contact: true },
  gallery: [
    { title: "Terrace garden", image: "" },
    { title: "Balcony garden", image: "" },
    { title: "Home garden", image: "" }
  ],
  services: [
    { title: "Home Gardening", description: "Plants, planters and care plans for home gardens and compounds." },
    { title: "Terrace Gardening", description: "Terrace garden design and setup with beds, drainage and plant selection." },
    { title: "Balcony Gardening", description: "Space-saving balcony gardens with vertical and railing planters." },
    { title: "Landscaping", description: "Landscape planning and installation for outdoor spaces." },
    { title: "Garden Maintenance", description: "Scheduled visits for pruning, feeding, pest care and plant replacement." }
  ],
  plants: [],
  materials: [],
  packages: [],
  contact: { phone: "+91 8072851669", email: "gtg.roofgardens@gmail.com", location: "Coimbatore, Tamil Nadu" }
};
function gtgWebsiteDraftLoad() {
  try { return { ...JSON.parse(JSON.stringify(GTG_WEBSITE_DEFAULT)), ...JSON.parse(localStorage.getItem("gtg_website_draft") || "{}") }; }
  catch (e) { return JSON.parse(JSON.stringify(GTG_WEBSITE_DEFAULT)); }
}
let GTG_WEBSITE_DRAFT = gtgWebsiteDraftLoad();
function gtgJsonField(key, title, hint) {
  return '<div class="we-field"><label for="we-' + key + '">' + esc(title) + '</label><textarea id="we-' + key + '" data-we-json="' + key + '" rows="7" spellcheck="false">' +
    esc(JSON.stringify(GTG_WEBSITE_DRAFT[key] ?? [], null, 2)) + '</textarea><small>' + esc(hint || "Edit valid JSON. Keep the brackets and commas.") + '</small></div>';
}
function vWebsiteEditor() {
  const d = GTG_WEBSITE_DRAFT, sections = Object.entries(d.sections || {});
  return '<div class="we-editor">' +
    '<div class="we-heading"><div><div class="we-eyebrow">GTG PARADISE · CUSTOMER APP CONTROL</div><h2>Customer App</h2><p>Prepare customer app content and design settings in one place.</p></div><span class="we-draft-badge">Draft mode</span></div>' +
    '<div class="we-notice"><b>Drafts are safe.</b> Save and preview your edits here first. Live publishing is not enabled yet because the customer website uses a separate Supabase project.</div>' +
    '<section class="we-card"><h3>Brand and home page</h3><div class="we-grid">' +
    '<div class="we-field"><label for="we-brand">Website / brand name</label><input id="we-brand" data-we-field="brand" value="' + esc(d.brand || "") + '"></div>' +
    '<div class="we-field"><label for="we-title">Main heading</label><input id="we-title" data-we-field="heroTitle" value="' + esc(d.heroTitle || "") + '"></div>' +
    '<div class="we-field we-wide"><label for="we-subtitle">Short description</label><textarea id="we-subtitle" data-we-field="heroSubtitle" rows="3">' + esc(d.heroSubtitle || "") + '</textarea></div>' +
    '<div class="we-field"><label for="we-phone">Contact phone</label><input id="we-phone" data-we-contact="phone" value="' + esc((d.contact || {}).phone || "") + '"></div>' +
    '<div class="we-field"><label for="we-email">Contact email</label><input id="we-email" data-we-contact="email" value="' + esc((d.contact || {}).email || "") + '"></div>' +
    '<div class="we-field we-wide"><label for="we-location">Location text</label><input id="we-location" data-we-contact="location" value="' + esc((d.contact || {}).location || "") + '"></div>' +
    '</div></section>' +
    '<section class="we-card"><h3>Brand colors</h3><p class="we-muted">Choose colors for the preview. Applying them to the live customer site requires the customer app to read the published settings.</p><div class="we-colors">' +
    [['primary','Forest green'],['accent','Fresh green'],['background','Soft background']].map(([k,l]) => '<label class="we-color" for="we-' + k + '"><span>' + l + '</span><input id="we-' + k + '" type="color" data-we-field="' + k + '" value="' + esc(d[k] || "#14532D") + '"><code>' + esc(d[k] || "") + '</code></label>').join('') +
    '</div></section>' +
    '<section class="we-card"><h3>Show or hide customer app sections</h3><div class="we-section-list">' + sections.map(([k,v]) => '<label class="we-toggle"><input type="checkbox" data-we-section="' + esc(k) + '" ' + (v ? "checked" : "") + '><span>' + esc(k.replace(/([A-Z])/g, " $1").replace(/^./, c=>c.toUpperCase())) + '</span></label>').join('') + '</div></section>' +
    '<section class="we-card"><h3>Customer app content collections</h3><p class="we-muted">Edit the gallery, services, plants, materials and packages as JSON. Image fields should contain public image URLs. These drafts do not change the customer site until publishing is connected.</p>' +
    gtgJsonField("gallery","Gallery images","Each item can have a title and an image URL.") +
    gtgJsonField("services","Services","Each item should include title and description.") +
    gtgJsonField("plants","Plants","Use the plant fields expected by your customer site, such as name, image, price and description.") +
    gtgJsonField("materials","Materials","Use the materials fields expected by your customer site.") +
    gtgJsonField("packages","Packages","Use the package fields expected by your customer site.") +
    '</section>' +
    '<div class="we-actions"><button class="btn" data-act="websiteSave">Save draft</button><button class="btn g" data-act="websitePreview">Update preview</button><button class="btn g" data-act="websiteExport">Export JSON</button><button class="btn" data-act="websitePublish">Publish to customer app</button></div>' +
    '<section class="we-card we-preview-card"><div class="we-preview-head"><div><h3>Live-style preview</h3><p class="we-muted">Preview of your draft, not the published customer website.</p></div><span class="we-preview-label">PREVIEW</span></div>' +
    '<div id="we-preview" class="we-preview" style="--we-primary:' + esc(d.primary || "#14532D") + ';--we-accent:' + esc(d.accent || "#65A30D") + ';--we-bg:' + esc(d.background || "#F8FAF5") + '">' + gtgWebsitePreviewHtml(d) + '</div></section>' +
    '</div>';
}
function gtgWebsitePreviewHtml(d) {
  const s = d.sections || {};
  const on = k => s[k] !== false;
  return (on("hero") ? '<div class="we-preview-hero"><span class="we-preview-brand">' + esc(d.brand || "GTG Paradise") + '</span><h2>' + esc(d.heroTitle || "") + '</h2><p>' + esc(d.heroSubtitle || "") + '</p><span class="we-preview-cta">Explore our gardens</span></div>' : '') +
    '<div class="we-preview-sections">' + ["gallery","services","plants","materials","packages","subscriptions","booking","about","contact"].filter(on).map(k => '<span>' + esc(k.charAt(0).toUpperCase()+k.slice(1)) + '</span>').join('') + '</div>' +
    '<div class="we-preview-contact">' + esc((d.contact||{}).phone||"") + ' · ' + esc((d.contact||{}).email||"") + ' · ' + esc((d.contact||{}).location||"") + '</div>';
}
function gtgWebsiteCollectDraft() {
  const root = document.querySelector(".we-editor");
  if (!root) return false;
  root.querySelectorAll("[data-we-field]").forEach(el => { GTG_WEBSITE_DRAFT[el.dataset.weField] = el.value; });
  GTG_WEBSITE_DRAFT.contact = GTG_WEBSITE_DRAFT.contact || {};
  root.querySelectorAll("[data-we-contact]").forEach(el => { GTG_WEBSITE_DRAFT.contact[el.dataset.weContact] = el.value; });
  GTG_WEBSITE_DRAFT.sections = GTG_WEBSITE_DRAFT.sections || {};
  root.querySelectorAll("[data-we-section]").forEach(el => { GTG_WEBSITE_DRAFT.sections[el.dataset.weSection] = el.checked; });
  for (const el of root.querySelectorAll("[data-we-json]")) {
    try { GTG_WEBSITE_DRAFT[el.dataset.weJson] = JSON.parse(el.value); }
    catch (e) { el.classList.add("bad"); toast("Fix invalid JSON in " + el.dataset.weJson + " before saving."); el.focus(); return false; }
    el.classList.remove("bad");
  }
  return true;
}
function gtgWebsiteRenderPreview() {
  const p = document.getElementById("we-preview");
  if (!p) return;
  p.style.setProperty("--we-primary", GTG_WEBSITE_DRAFT.primary || "#14532D");
  p.style.setProperty("--we-accent", GTG_WEBSITE_DRAFT.accent || "#65A30D");
  p.style.setProperty("--we-bg", GTG_WEBSITE_DRAFT.background || "#F8FAF5");
  p.innerHTML = gtgWebsitePreviewHtml(GTG_WEBSITE_DRAFT);
}
actions.websiteSave = function() {
  if (!gtgWebsiteCollectDraft()) return;
  try { localStorage.setItem("gtg_website_draft", JSON.stringify(GTG_WEBSITE_DRAFT)); toast("Website draft saved on this device."); }
  catch (e) { toast("Could not save draft on this device."); }
  gtgWebsiteRenderPreview();
};
actions.websitePreview = function() {
  if (!gtgWebsiteCollectDraft()) return;
  gtgWebsiteRenderPreview();
  toast("Preview updated. Remember to save your draft.");
};
actions.websiteExport = function() {
  if (!gtgWebsiteCollectDraft()) return;
  const blob = new Blob([JSON.stringify(GTG_WEBSITE_DRAFT, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "gtg-website-draft.json"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Draft JSON exported.");
};
actions.websitePublish = function() {
  if (!gtgWebsiteCollectDraft()) return;
  try { localStorage.setItem("gtg_website_draft", JSON.stringify(GTG_WEBSITE_DRAFT)); } catch (e) {}
  toast("Draft saved only. Live publishing needs a secure connection to the customer website Supabase project.");
};
document.addEventListener("input", e => {
  const el = e.target;
  if (!el.matches || !el.matches("[data-we-field],[data-we-contact]")) return;
  const preview = document.getElementById("we-preview");
  if (preview) {
    if (el.dataset.weField) GTG_WEBSITE_DRAFT[el.dataset.weField] = el.value;
    if (el.dataset.weContact) { GTG_WEBSITE_DRAFT.contact = GTG_WEBSITE_DRAFT.contact || {}; GTG_WEBSITE_DRAFT.contact[el.dataset.weContact] = el.value; }
    gtgWebsiteRenderPreview();
  }
});

/** WebsiteEditor tab (React component). */
export default function WebsiteEditorTab() {
  return <Html html={vWebsiteEditor()} />;
}
