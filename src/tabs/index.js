import CustomersTab from './CustomersTab.jsx';
import ProjectsTab from './ProjectsTab.jsx';
import MoneyTab from './MoneyTab.jsx';
import InvoicesTab from './InvoicesTab.jsx';
import ActivityTab from './ActivityTab.jsx';
import SettingsTab from './SettingsTab.jsx';
import CustomerAppTab from './CustomerAppTab.jsx';

/** tab key (engine `tab`) -> component */
export default {
  cust: CustomersTab,
  work: ProjectsTab,
  money: MoneyTab,
  inv: InvoicesTab,
  act: ActivityTab,
  settings: SettingsTab,
  website: CustomerAppTab
};
