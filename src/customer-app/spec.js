// Editable fields: [column, label, type, default]. Types: text, textarea, number, lines, json, check, image.
// Column names must match the customer tables and the allow-list in supabase/functions/admin-bridge/index.ts.
const photo = ['image_path', 'Photo', 'image'];
export const SPEC = {
  gallery_photos: { title: 'Gallery photo', bucket: 'gallery', fields: [
    ['title', 'Title'], ['description', 'Description', 'textarea'], ['location', 'Location'], ['sort_order', 'Sort order (lowest first)', 'number'], photo] },
  services: { title: 'Service', bucket: 'services', fields: [
    ['title', 'Title'], ['description', 'Description', 'textarea'], ['sort_order', 'Sort order (lowest first)', 'number'], photo] },
  plants: { title: 'Plant', bucket: 'plants', fields: [
    ['name', 'Name'], ['tamil_name', 'Scientific / Tamil name'], ['category', 'Category'], ['price', 'Price (₹)', 'number'], ['stock_status', 'Stock status'],
    ['description', 'Description', 'textarea'], ['features', 'Features (one per line)', 'lines'], photo, ['is_active', 'Show on website', 'check', true]] },
  materials: { title: 'Material', bucket: 'materials', fields: [
    ['name', 'Name'], ['category', 'Category'], ['price', 'Price (₹)', 'number'], ['description', 'Description', 'textarea'], photo,
    ['is_active', 'Show on website', 'check', true]] },
  about_content: { title: 'About section', fields: [
    ['title', 'Title'], ['subtitle', 'Subtitle'], ['body', 'Text (new line = new paragraph)', 'textarea'], ['points', 'Key points (one per line)', 'lines'],
    ['stats', 'Stats as JSON, e.g. [{"value":"500+","label":"Gardens"}]', 'json'], ['image_url', 'Image URL'], ['address', 'Address'], ['email', 'Email'],
    ['phone', 'Phone (10 digits)'], ['whatsapp', 'WhatsApp number'], ['instagram_url', 'Instagram URL'], ['facebook_url', 'Facebook URL'], ['youtube_url', 'YouTube URL']] },
  subscription_plans: { title: 'Plan', fields: [] },
  plant_types: { title: 'Category', fields: [
    ['key', 'Key (must match the plant category exactly)'], ['label', 'Display name'], ['sort_order', 'Sort order (lowest first)', 'number'],
    ['is_active', 'Show on website', 'check', true]] },
  packages: { title: 'Package', fields: [
    ['name', 'Name'], ['price', 'Price (₹)', 'number'], ['period', 'Period, e.g. /month'], ['features', 'Features (one per line)', 'lines'],
    ['featured', 'Mark as most popular', 'check', false]] },
};

// Sections that are plain database tables (shown as a card grid)
export const TABLE_SECTIONS = [
  { key: 'gallery', label: 'Gallery', table: 'gallery_photos', title: 'title', sub: 'description', emoji: '🌿' },
  { key: 'services', label: 'Services', table: 'services', title: 'title', sub: 'description', emoji: '🛠️' },
  { key: 'plants', label: 'Plants', table: 'plants', title: 'name', sub: 'category', price: true, emoji: '🪴' },
  { key: 'materials', label: 'Materials', table: 'materials', title: 'name', sub: 'category', price: true, emoji: '🧰' },
  { key: 'plant_types', label: 'Categories', table: 'plant_types', title: 'label', sub: 'key', emoji: '🗂️' },
];
