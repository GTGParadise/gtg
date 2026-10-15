import { useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import * as engine from './core/engine.js';
import { useEngine } from './useEngine.js';
import Nav from './components/Nav.jsx';
import TABS from './tabs/index.js';

/** Active tab. Remounted on every engine render so DOM state resets exactly like the old innerHTML render. */
function View() {
  const rev = useEngine();
  const Tab = TABS[engine.tab] || TABS.cust;
  useLayoutEffect(() => { engine.afterCommit(); }, [rev]);
  return <div id="view" key={rev}><Tab /></div>;
}

export default function App() {
  useEffect(() => {
    engine.setFlush(flushSync); // keep render() synchronous for code that reads the DOM right after it
    engine.boot();
  }, []);

  return (
    <>
      <header className="top"><div className="topin"><div className="hd">
        <div className="brand">
          <span className="logo" />
          <div className="bt"><h1 id="ttl" /><div className="tag" id="welcome">Welcome back!</div></div>
        </div>
        <div className="hr">
          <button className="gear" id="gear" aria-label="Settings">⚙</button>
          <button className="signout" id="signout" data-act="sbOut" aria-label="Sign out" title="Sign out" hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div></div></header>
      <nav id="nav" aria-label="Main sections"><Nav /></nav>
      <main>
        <div className="flt" id="flt" />
        <View />
        <div className="note" id="foot" style={{ textAlign: 'center', marginTop: 16 }} />
      </main>
      <button className="fab" id="fab" aria-label="Add new project">+</button>
      <div id="ov" role="dialog" aria-modal="true" aria-label="Form"><div id="box" /></div>
      <div id="iv" role="dialog" aria-modal="true" aria-label="Invoice" />
      <div id="ivp" role="dialog" aria-modal="true" aria-label="Invoice preview" />
      <div id="ov2" role="alertdialog" aria-modal="true" aria-label="Confirmation"><div id="box2" /></div>
      <div id="toast" />
    </>
  );
}
