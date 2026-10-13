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
    '<div class="we-heading"><div><div class="we-eyebrow">GTG PARADISE · WEBSITE CONTROL</div><h2>Website Editor</h2><p>Prepare website content and design settings in one place.</p></div><span class="we-draft-badge">Draft mode</span></div>' +
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
    '<section class="we-card"><h3>Show or hide website sections</h3><div class="we-section-list">' + sections.map(([k,v]) => '<label class="we-toggle"><input type="checkbox" data-we-section="' + esc(k) + '" ' + (v ? "checked" : "") + '><span>' + esc(k.replace(/([A-Z])/g, " $1").replace(/^./, c=>c.toUpperCase())) + '</span></label>').join('') + '</div></section>' +
    '<section class="we-card"><h3>Website content collections</h3><p class="we-muted">Edit the gallery, services, plants, materials and packages as JSON. Image fields should contain public image URLs. These drafts do not change the customer site until publishing is connected.</p>' +
    gtgJsonField("gallery","Gallery images","Each item can have a title and an image URL.") +
    gtgJsonField("services","Services","Each item should include title and description.") +
    gtgJsonField("plants","Plants","Use the plant fields expected by your customer site, such as name, image, price and description.") +
    gtgJsonField("materials","Materials","Use the materials fields expected by your customer site.") +
    gtgJsonField("packages","Packages","Use the package fields expected by your customer site.") +
    '</section>' +
    '<div class="we-actions"><button class="btn" data-act="websiteSave">Save draft</button><button class="btn g" data-act="websitePreview">Update preview</button><button class="btn g" data-act="websiteExport">Export JSON</button><button class="btn" data-act="websitePublish">Publish to website</button></div>' +
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
