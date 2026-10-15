/** Adds a <style> block to <head> once (safe to call again, e.g. during hot reload). */
export default function injectCss(id, css) {
  const key = 'css-' + id;
  let el = document.head.querySelector(`style[data-css="${key}"]`);
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-css', key);
    document.head.appendChild(el);
  }
  el.textContent = css;
}
