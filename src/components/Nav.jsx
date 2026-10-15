import { S, tab, IC } from '../core/engine.js';
import { useEngine } from '../useEngine.js';

const KEYS = ['cust', 'work', 'money', 'inv', 'act', 'website'];

/** Bottom/top tab bar. Clicks are handled by the engine's delegated [data-tab] handler. */
export default function Nav() {
  useEngine();
  const labels = S.cfg.labels;
  return KEYS.filter((k) => k in labels).map((k) => (
    <button key={k} data-tab={k} className={k === tab ? 'on' : ''} aria-current={k === tab ? 'page' : undefined}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: IC[k] || '' }} />
      <span>{labels[k]}</span>
    </button>
  ));
}
