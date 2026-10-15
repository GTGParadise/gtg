import { createRoot } from 'react-dom/client';
import './tabs/index.js'; // loads each tab's own CSS first, so base.css still wins the cascade as before
import './styles/base.css';
import './styles/visual-refresh.css';
import App from './app.jsx';

createRoot(document.getElementById('root')).render(<App />);
