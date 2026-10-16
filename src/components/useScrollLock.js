import { useEffect } from 'react';

/**
 * Stops the page behind an open panel from scrolling, without touching overflow styles
 * (so the sticky header never jumps). Anything inside the panel that can scroll still works.
 */
const canScroll = (el, dy) => {
  for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) {
      if (dy === undefined) return true;
      const atTop = el.scrollTop <= 0, atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if (!((dy < 0 && atTop) || (dy > 0 && atEnd))) return true;
    }
  }
  return false;
};

export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    let y = 0;
    const start = (e) => { y = e.touches[0].clientY; };
    const touch = (e) => { if (!canScroll(e.target, y - e.touches[0].clientY)) e.preventDefault(); };
    const wheel = (e) => { if (!canScroll(e.target, e.deltaY)) e.preventDefault(); };
    document.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('touchmove', touch, { passive: false });
    document.addEventListener('wheel', wheel, { passive: false });
    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('touchmove', touch);
      document.removeEventListener('wheel', wheel);
    };
  }, [active]);
}
