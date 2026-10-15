# GTG Paradise Admin — React + Vite

## Structure
- `src/main.jsx` — entry (styles + React root)
- `src/app.jsx` — React shell (header, nav, active tab, FAB, dialogs) and engine boot
- `src/tabs/` — one React component per tab: `CustomersTab`, `ProjectsTab`, `MoneyTab`, `InvoicesTab`, `ActivityTab`, `SettingsTab`, `CustomerAppTab` (+ `index.js` tab map)
- `src/components/` — `Nav.jsx`, `Html.jsx`
- `src/core/engine.js` — shared state, helpers, forms, invoices, Supabase sync, event handling (the former `app.js` minus the tab renderers)
- `src/lib/supabase.js`, `src/styles/*`

## How it fits together
The engine calls `render()` after every change; that notifies React (`useEngine`), which re-renders the nav and the active tab. Tab bodies are still HTML-string templates (`vCust()`, `vMoney()`, …) wrapped by `<Html>`, with the engine's delegated `data-act` handlers. Convert a tab to real JSX one at a time by replacing its template and moving its handlers into the component.

## Run
`npm install` → `npm run dev` → `npm run build`. Env vars: see `.env.example`.
