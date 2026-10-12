import { useEffect, useRef } from 'react';
import { legacyMarkup } from './legacyMarkup.js';
import { legacyScript } from './legacy.js';
import CustomersCode from './pages/Customers.js?raw';
import ProjectsCode from './pages/Projects.js?raw';
import MoneyCode from './pages/Money.js?raw';
import InvoicesCode from './pages/Invoices.js?raw';
import ActivityCode from './pages/Activity.js?raw';
import SettingsCode from './pages/Settings.js?raw';
import './styles/customers.css';
import './styles/projects.css';
import './styles/money.css';
import './styles/invoices.css';
import './styles/activity.css';
import './styles/settings.css';
import './legacy.css';

const tabOverrides = [
  CustomersCode,
  ProjectsCode,
  MoneyCode,
  InvoicesCode,
  ActivityCode,
  SettingsCode
].join('\n');

// Existing data and interactions remain shared. Each tab renderer is editable separately.
export default function App() {
  const hostRef = useRef(null);
  useEffect(() => {
    const baseScript = document.createElement('script');
    baseScript.textContent = legacyScript;
    hostRef.current?.appendChild(baseScript);
    const pageScript = document.createElement('script');
    pageScript.textContent = tabOverrides + '\nrender();';
    hostRef.current?.appendChild(pageScript);
    return () => { baseScript.remove(); pageScript.remove(); };
  }, []);
  return <div id="gtg-legacy-root" ref={hostRef} dangerouslySetInnerHTML={{ __html: legacyMarkup }} />;
}
