import { useEffect, useRef } from 'react';
import { legacyMarkup } from './legacyMarkup.js';
import { legacyScript } from './legacy.js';
import CustomersCode from './pages/Customers.js?raw';
import ProjectsCode from './pages/Projects.js?raw';
import MoneyCode from './pages/Money.js?raw';
import InvoicesCode from './pages/Invoices.js?raw';
import ActivityCode from './pages/Activity.js?raw';
import SettingsCode from './pages/Settings.js?raw';
import WebsiteEditorCode from './pages/WebsiteEditor.js?raw';
import './styles/website-editor.css';
import './styles/customers.css';
import './styles/projects.css';
import './styles/money.css';
import './styles/invoices.css';
import './styles/activity.css';
import './styles/settings.css';
import './legacy.css';
import './styles/visual-refresh.css';

const tabOverrides = [
  CustomersCode,
  ProjectsCode,
  MoneyCode,
  InvoicesCode,
  ActivityCode,
  SettingsCode,
  WebsiteEditorCode
].join('\n');
// Existing data and interactions remain shared. Each tab renderer is editable separately.
export default function App() {
  const hostRef = useRef(null);
  useEffect(() => {
    const baseScript = document.createElement('script');
    const adminSupabaseConfig = {
      url: import.meta.env.VITE_ADMIN_SUPABASE_URL || '',
      key: import.meta.env.VITE_ADMIN_SUPABASE_ANON_KEY || ''
    };
    baseScript.textContent = 'window.__GTG_ADMIN_SUPABASE_CONFIG__ = ' + JSON.stringify(adminSupabaseConfig) + ';\\n' + legacyScript;
    hostRef.current?.appendChild(baseScript);
    const pageScript = document.createElement('script');
    pageScript.textContent = tabOverrides + '\nrender();';
    hostRef.current?.appendChild(pageScript);
    return () => { baseScript.remove(); pageScript.remove(); };
  }, []);
  return <div id="gtg-legacy-root" ref={hostRef} dangerouslySetInnerHTML={{ __html: legacyMarkup }} />;
}
