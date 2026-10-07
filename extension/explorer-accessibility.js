/* Enter Explorer through its first native destination on ordinary activation.
 * Native roles, keyboard handlers and Escape restoration are preserved. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.explorer-accessibility.v1");
  if (window[marker]?.active) return;
  window[Symbol.for("chatgpt-a11y.explorer-entry-focus-experiment")]?.stop();
  let active = true, pending = null, deadline = null;
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");
  const trigger = () => [...document.querySelectorAll('[data-app-navigation-rail] button[data-slot="popover-trigger"]')]
    .filter(node => node.getAttribute("aria-haspopup") === "dialog" && node.textContent.trim() === "Explorer");
  const hidden = node => !node?.isConnected || node.closest('[hidden], [inert], [aria-hidden="true"]') || !node.getClientRects().length;
  function cancel() {
    pending = null;
    if (deadline !== null) clearTimeout(deadline);
    deadline = null;
  }
  function check() {
    const entry = pending;
    if (!active || !entry) return;
    const button = entry.button;
    const candidates = trigger();
    if (!french() || window.location.href !== entry.route || candidates.length !== 1 || candidates[0] !== button ||
        button.parentElement !== entry.parent || button.disabled || hidden(button)) { cancel(); return; }
    if (button.getAttribute("aria-expanded") !== "true") {
      if (entry.opened) cancel();
      return;
    }
    entry.opened = true;
    const id = button.getAttribute("aria-controls");
    const panel = id ? document.getElementById(id) : null;
    if (!panel || [...document.querySelectorAll('[id]')].filter(node => node.id === id).length !== 1 ||
        !panel.matches('[role="dialog"][data-slot="popover-content"][aria-label="Explorer"]') || hidden(panel)) { cancel(); return; }
    const focused = document.activeElement;
    // Do not steal a native destination focus or an unrelated user's focus.
    if (focused !== panel) {
      if (focused !== button && focused !== document.body && focused !== document.documentElement) cancel();
      return;
    }
    const group = panel.querySelector('[role="group"]');
    const destination = group?.firstElementChild;
    // Exact first destination observed in both native opening paths. Unknown
    // layouts fail closed instead of focusing a pin button or another widget.
    if (destination?.tagName !== "BUTTON" || destination.textContent.trim() !== "Projets" ||
        destination.disabled || hidden(destination)) { cancel(); return; }
    cancel();
    destination.focus({ preventScroll: true });
  }
  function click(event) {
    cancel();
    if (!active || !french() || event.defaultPrevented || event.button > 0 ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const candidates = trigger();
    const button = event.target?.closest?.("button");
    if (candidates.length !== 1 || candidates[0] !== button || button.disabled || hidden(button) ||
        button.getAttribute("aria-expanded") !== "false") return;
    pending = { button, parent: button.parentElement, route: window.location.href, opened: false };
    deadline = setTimeout(cancel, 2000);
  }
  function focusin() { if (pending) queueMicrotask(check); }
  const observer = new MutationObserver(check);
  observer.observe(document, { subtree: true, childList: true, attributes: true,
    attributeFilter: ["aria-expanded", "aria-controls", "aria-haspopup", "aria-label", "role", "data-slot", "hidden", "inert", "aria-hidden", "style", "class", "lang"] });
  window.addEventListener("click", click, true);
  window.addEventListener("keydown", cancel, true);
  document.addEventListener("pointerdown", cancel, true);
  document.addEventListener("focusin", focusin, true);
  window.addEventListener("pagehide", cancel, true);
  window.addEventListener("popstate", cancel, true);
  window.addEventListener("hashchange", cancel, true);
  const api = { version: 1, get active() { return active; }, stop() {
    if (!active) return;
    active = false; cancel(); observer.disconnect();
    window.removeEventListener("click", click, true);
    window.removeEventListener("keydown", cancel, true);
    document.removeEventListener("pointerdown", cancel, true);
    document.removeEventListener("focusin", focusin, true);
    window.removeEventListener("pagehide", cancel, true);
    window.removeEventListener("popstate", cancel, true);
    window.removeEventListener("hashchange", cancel, true);
  } };
  window[marker] = api;
})();
