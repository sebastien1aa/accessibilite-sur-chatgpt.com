/* Repair Escape focus loss for exactly associated native menus/popovers.
 * Native keyboard handlers close the popup; their events are never cancelled. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.sidebar-menu-focus.v4");
  const currentMarker = Symbol.for("chatgpt-navigation-continue.sidebar-menu-focus.current");
  if (window[marker]?.active) return;
  window[currentMarker]?.stop?.();
  window[Symbol.for("chatgpt-navigation-continue.sidebar-menu-focus.v2")]?.stop?.();
  window[Symbol.for("chatgpt-navigation-continue.sidebar-menu-focus.v1")]?.stop?.();
  const popupSelector = '[role="menu"], [role="dialog"]';
  const triggerSelector = 'button[aria-haspopup="menu"], button[aria-haspopup="dialog"]';
  let stopped = false;
  let pending = null;
  let ownFocus = false;
  const timers = new Set();

  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");
  const route = () => window.location.href;
  const popupHints = new Map();
  function explorerButton(node) {
    return node?.tagName === 'BUTTON' && node.closest('[data-app-navigation-rail]') &&
      node.getAttribute('data-slot') === 'popover-trigger' &&
      (node.getAttribute('aria-label') || node.textContent.trim()) === 'Explorer';
  }
  function popupValue(node) {
    const entry = popupHints.get(node), current = node.getAttribute('aria-haspopup');
    return entry && current === null && explorerButton(node) && node.parentElement === entry.parent ? entry.native : current;
  }
  function restoreHints() {
    for (const [node, entry] of popupHints) if (node.getAttribute('aria-haspopup') === null) node.setAttribute('aria-haspopup', entry.native);
    popupHints.clear();
  }
  function maintainHints() {
    for (const [node, entry] of popupHints) {
      const value = node.getAttribute('aria-haspopup');
      if (!node.isConnected || !french() || !explorerButton(node) || node.parentElement !== entry.parent || node.getAttribute('aria-expanded') !== 'false') {
        if (value === null) node.setAttribute('aria-haspopup', entry.native);
        popupHints.delete(node);
      } else if (value !== null) {
        // An explicit foreign type wins; only the same native dialog hint is
        // suppressed again while this exact closed button remains owned.
        if (value === 'dialog') { entry.native = value; node.removeAttribute('aria-haspopup'); }
        else popupHints.delete(node);
      }
    }
  }
  function suppressExplorerHint(entry) {
    const node = entry.trigger;
    if (entry.popupRole !== 'dialog' || !explorerButton(node) ||
        !entry.menu.matches('[role="dialog"][data-slot="popover-content"][aria-label="Explorer"]') ||
        node.getAttribute('aria-expanded') !== 'false' || popupValue(node) !== 'dialog') return;
    if (!popupHints.has(node)) popupHints.set(node, { native: 'dialog', parent: node.parentElement });
    if (node.getAttribute('aria-haspopup') === 'dialog') node.removeAttribute('aria-haspopup');
  }
  function hidden(node) {
    if (!node?.isConnected || node.closest('[hidden], [inert], [aria-hidden="true"]')) return true;
    // data-state=closed is also on visible triggers and exit-animation popups.
    // Wait for removal or actual inaccessibility, not that state alone.
    return typeof node.getClientRects === "function" && node.getClientRects().length === 0;
  }
  function triggerInScope(node) {
    return node?.tagName === "BUTTON" && node.isConnected &&
      ["menu", "dialog"].includes(popupValue(node)) &&
      !node.disabled && !hidden(node);
  }
  function controls(node, id) {
    return !!id && (node.getAttribute("aria-controls") || "").split(/\s+/).includes(id);
  }
  function identity(node) {
    const owner = node.closest('[data-app-action-sidebar-project-row], [role="listitem"]');
    const turn = node.closest('[data-turn-key]');
    const routes = new Set();
    if (owner) for (const link of owner.querySelectorAll("a[href]")) {
      if (link.closest('[data-app-action-sidebar-project-row], [role="listitem"]') !== owner) continue;
      try {
        const base = new URL(document.baseURI || window.location.href);
        const url = new URL(link.getAttribute("href"), base);
        if (url.origin === base.origin && /^\/(?:c\/[^/]+|g\/[^/]+\/c\/[^/]+|g\/[^/]+\/project)\/?$/.test(url.pathname)) {
          routes.add(url.pathname.replace(/\/$/, ""));
        }
      } catch { /* Unknown links cannot establish a conversation identity. */ }
    }
    // These primitives live only in the pending Escape lease (at most 150 ms).
    // Never retain a conversation label, React props or a native callback.
    return { parent: node.parentElement, owner, turn,
      signature: JSON.stringify([node.id, node.getAttribute("aria-label"), node.getAttribute("aria-labelledby"),
        turn?.getAttribute('data-turn-key'),
        owner?.getAttribute("data-app-action-sidebar-project-id"),
        owner?.getAttribute("data-app-action-sidebar-project-label"), Array.from(routes).sort()]) };
  }
  function associatedTrigger(menu) {
    if (!menu.id || Array.from(document.querySelectorAll(popupSelector)).filter(node => node.id === menu.id).length !== 1) return null;
    const matches = [];
    for (const node of document.querySelectorAll(triggerSelector)) {
      const labelledBy = !!node.id && (menu.getAttribute("aria-labelledby") || "").split(/\s+/).includes(node.id) &&
        Array.from(document.querySelectorAll('[id]')).filter(other => other.id === node.id).length === 1;
      if (triggerInScope(node) && popupValue(node) === menu.getAttribute("role") &&
          node.getAttribute("aria-expanded") !== "false" &&
          (node.hasAttribute("aria-controls") ? controls(node, menu.id) : labelledBy)) matches.push(node);
    }
    return matches.length === 1 ? matches[0] : null;
  }
  function cancel() {
    pending = null;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  }
  function later(callback, delay = 0) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!stopped) callback();
    }, delay);
    timers.add(timer);
  }
  function eligibleFocus(entry) {
    const active = document.activeElement;
    return !active || active === document.body || active === document.documentElement ||
      (entry.menu.contains(active) && hidden(entry.menu));
  }
  function restore(entry) {
    if (pending !== entry || stopped) return;
    if (!french() || route() !== entry.route) { cancel(); return; }
    const trigger = entry.trigger;
    const currentIdentity = identity(trigger);
    // Radix removes aria-controls when open becomes false. The association was
    // established on Escape; a different explicit association still cancels it.
    if (!triggerInScope(trigger) || currentIdentity.parent !== entry.identity.parent ||
        currentIdentity.owner !== entry.identity.owner || currentIdentity.turn !== entry.identity.turn || currentIdentity.signature !== entry.identity.signature || entry.menu.id !== entry.menuId ||
        popupValue(trigger) !== entry.popupRole || entry.menu.getAttribute("role") !== entry.popupRole ||
        (trigger.hasAttribute("aria-controls") && !controls(trigger, entry.menuId))) { cancel(); return; }
    if (trigger.getAttribute("aria-expanded") === "true" || !hidden(entry.menu)) return;
    if (document.activeElement !== trigger && !eligibleFocus(entry)) { cancel(); return; }
    if (document.activeElement !== trigger) {
      suppressExplorerHint(entry);
      ownFocus = true;
      try { trigger.focus({ preventScroll: true }); }
      finally { ownFocus = false; }
    }
    entry.restored = true;
    // Keep the bounded lease: a native unmount task may run after this repair.
    // Focus events/mutations and the final deadline check observe that loss.
  }
  function requestCheck() {
    const entry = pending;
    if (!entry || entry.checkQueued) return;
    entry.checkQueued = true;
    later(() => { entry.checkQueued = false; restore(entry); });
  }
  function keydown(event) {
    if (stopped) return;
    if (pending && event.key === "Escape" && event.repeat) return;
    restoreHints();
    cancel();
    if (!french() || event.key !== "Escape" || event.repeat || event.defaultPrevented ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    const active = document.activeElement;
    if (target?.nodeType !== 1) return;
    const menu = active?.closest?.(popupSelector) || target.closest(popupSelector);
    if (!menu || hidden(menu) || menu.getAttribute("data-state") === "closed") return;
    const trigger = associatedTrigger(menu);
    if (!trigger) return;
    const focusedInside = menu.contains(active);
    const targetedInside = menu.contains(target) || target.closest(popupSelector)?.contains(menu);
    if (!(focusedInside && (targetedInside || target === document.body || target === document.documentElement || target === trigger)) &&
        !(active === trigger && targetedInside)) return;
    pending = { trigger, identity: identity(trigger), menu, menuId: menu.id, popupRole: menu.getAttribute("role"), route: route(), checkQueued: false, restored: false };
    const entry = pending;
    // An Escape which does not close this menu expires without changing focus.
    later(() => { restore(entry); if (pending === entry) cancel(); }, 150);
  }
  function focusin(event) {
    if (!pending || ownFocus) return;
    const target = event.target;
    if (target !== pending.trigger && target !== document.body && target !== document.documentElement &&
        !pending.menu.contains(target)) cancel();
    else requestCheck();
  }
  function focusout(event) {
    if (pending && !ownFocus && (event.target === pending.trigger || pending.menu.contains(event.target))) requestCheck();
  }
  const observer = new MutationObserver(() => {
    if (!stopped) maintainHints();
    // The first restoration belongs to this mutation delivery. Adding a task
    // here leaves the removed menu at BODY until after native unmount cleanup.
    if (!stopped && pending) {
      if (!pending.restored) restore(pending);
      else requestCheck();
    }
  });
  // Observing Document works at document_start before an HTML element exists.
  observer.observe(document, { subtree: true, childList: true, attributes: true,
    attributeFilter: ["aria-expanded", "aria-controls", "aria-haspopup", "aria-label", "aria-labelledby", "aria-hidden", "role", "data-state", "data-slot", "data-app-navigation-rail", "hidden", "inert", "style", "class", "disabled", "lang", "id", "href", "data-turn-key", "data-app-action-sidebar-project-id", "data-app-action-sidebar-project-label"] });
  window.addEventListener("keydown", keydown, true);
  window.addEventListener("click", restoreHints, true);
  document.addEventListener("pointerdown", restoreHints, true);
  window.addEventListener("popstate", restoreHints, true);
  window.addEventListener("hashchange", restoreHints, true);
  document.addEventListener("focusin", focusin, true);
  document.addEventListener("focusout", focusout, true);
  document.addEventListener("pointerdown", cancel, true);
  document.addEventListener("click", cancel, true);
  window.addEventListener("pagehide", cancel, true);
  window.addEventListener("popstate", cancel, true);
  window.addEventListener("hashchange", cancel, true);
  const api = { version: 4, active: true, get suppressedCount() { return popupHints.size; }, stop() {
    if (stopped) return;
    stopped = true; api.active = false;
    cancel(); observer.disconnect(); restoreHints();
    window.removeEventListener("click", restoreHints, true);
    document.removeEventListener("pointerdown", restoreHints, true);
    window.removeEventListener("popstate", restoreHints, true);
    window.removeEventListener("hashchange", restoreHints, true);
    window.removeEventListener("keydown", keydown, true);
    document.removeEventListener("focusin", focusin, true);
    document.removeEventListener("focusout", focusout, true);
    document.removeEventListener("pointerdown", cancel, true);
    document.removeEventListener("click", cancel, true);
    window.removeEventListener("pagehide", cancel, true);
    window.removeEventListener("popstate", cancel, true);
    window.removeEventListener("hashchange", cancel, true);
    if (window[currentMarker] === api) delete window[currentMarker];
  } };
  window[marker] = api;
  window[currentMarker] = api;
})();
