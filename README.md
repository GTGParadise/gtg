# GTG Paradise React app — tab files separated

This incremental modularization keeps the supplied app's existing UI and shared logic, while placing each main tab renderer in its own editable file.

## Tab files
- `src/pages/Customers.js` + `src/styles/customers.css`
- `src/pages/Projects.js` + `src/styles/projects.css`
- `src/pages/Money.js` + `src/styles/money.css`
- `src/pages/Invoices.js` + `src/styles/invoices.css`
- `src/pages/Activity.js` + `src/styles/activity.css`
- `src/pages/Settings.js` + `src/styles/settings.css`

The tab renderer files override the matching render functions in `src/legacy.js`. Shared data, helper functions, event handling, and original styles remain in `src/legacy.js` and `src/legacy.css`; changing shared logic may affect multiple tabs. This is not yet a complete component-by-component React rewrite.

## Run
1. Install Node.js 18+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Run `npm run build` for a production build.

Test all workflows before deploying, especially forms, invoice actions, and Supabase sync.
