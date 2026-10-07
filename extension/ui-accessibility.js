/* Narrow adaptations of the October 2026 ChatGPT Web UI. Native controls,
 * list items, editor state and sidebar shortcuts remain owned by the site. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.ui-accessibility.v5");
  if (window[marker]) return;
  for (const revision of ["v1", "v2", "v3", "v4"]) {
    window[Symbol.for(`chatgpt-navigation-continue.ui-accessibility.${revision}`)]?.stop();
  }
  const sidebarSelector = '#app-shell-sidebar';
  const ownedSelector = '[data-chatgpt-a11y-sidebar-open]';
  const sidebarLabel = "Afficher/Masquer la barre latérale";
  const nodeRefs = new Set(), proxyRefs = new Set();
  const changedAttributes = new WeakMap();
  let active = true;
  let pending = false;
  let proxy = null;
  let transition = null;
  let transitionTimer = null;

  function applyAttribute(node, key, value) {
    const current = node.getAttribute(key);
    let entries = changedAttributes.get(node);
    const previous = entries?.get(key);
    if (current === value) return;
    if (!entries) {
      entries = new Map(); changedAttributes.set(node, entries);
      nodeRefs.add(new WeakRef(node));
    }
    entries.set(key, { native: previous?.applied === current ? previous.native : current, applied: value });
    if (value === null) node.removeAttribute(key); else node.setAttribute(key, value);
  }
  function nativeAttribute(node, key) {
    const previous = changedAttributes.get(node)?.get(key), current = node.getAttribute(key);
    return previous?.applied === current ? previous.native : current;
  }
  function restoreAttributes(node) {
    const entries = changedAttributes.get(node);
    if (!entries) return;
    for (const [key, entry] of entries) if (node.getAttribute(key) === entry.applied) {
      if (entry.native === null) node.removeAttribute(key); else node.setAttribute(key, entry.native);
    }
    changedAttributes.delete(node);
  }
  function restoreAttribute(node, key) {
    const entries = changedAttributes.get(node), entry = entries?.get(key);
    if (!entry) return;
    if (node.getAttribute(key) === entry.applied) {
      if (entry.native === null) node.removeAttribute(key); else node.setAttribute(key, entry.native);
    }
    entries.delete(key);
    if (!entries.size) changedAttributes.delete(node);
  }
  function cleanup() {
    for (const ref of nodeRefs) { const node = ref.deref(); if (node) restoreAttributes(node); }
    nodeRefs.clear();
    for (const ref of proxyRefs) ref.deref()?.remove();
    proxyRefs.clear(); proxy = null;
    cancelTransition();
  }

  function cancelTransition() {
    transition = null;
    if (transitionTimer !== null) clearTimeout(transitionTimer);
    transitionTimer = null;
  }

  function nativeSidebarButton(sidebar) {
    return Array.from(sidebar.querySelectorAll('button[aria-controls="app-shell-sidebar"]'))
      .find(button => !button.matches(ownedSelector) &&
        !button.closest('[inert], [hidden]') &&
        nativeAttribute(button, "aria-hidden") !== "true" &&
        !button.parentElement?.closest('[aria-hidden="true"]') && button.getClientRects().length);
  }

  function sidebarButton(sidebar) {
    const content = sidebar.querySelector('[data-slate-sidebar-content]');
    const rail = sidebar.querySelector('[data-app-navigation-rail]');
    if (!content || !rail) {
      proxy?.remove(); proxy = null; cancelTransition();
      for (const button of sidebar.querySelectorAll('button[aria-controls="app-shell-sidebar"]')) {
        if (button.matches(ownedSelector)) continue;
        restoreAttribute(button, "aria-hidden");
        restoreAttribute(button, "tabindex");
      }
      return;
    }
    const expanded = !content.hasAttribute("inert");
    // Remove only previous owned versions of this exact command. React keeps
    // every native rail entry, its position and its callback.
    for (const owned of sidebar.querySelectorAll(ownedSelector)) if (owned !== proxy) owned.remove();
    if (!proxy || !sidebar.contains(proxy)) {
      proxy?.remove();
      proxy = createSidebarButton();
    }
    if (rail.lastElementChild !== proxy) rail.append(proxy);
    applyAttribute(proxy, "aria-expanded", String(expanded));
    for (const button of sidebar.querySelectorAll('button[aria-controls="app-shell-sidebar"]')) {
      if (button.matches(ownedSelector)) continue;
      applyAttribute(button, "aria-hidden", "true");
      applyAttribute(button, "tabindex", "-1");
    }
    if (transition && (transition.sidebar !== sidebar || transition.expanded !== expanded)) {
      const returnFocus = transition.sidebar === sidebar;
      cancelTransition();
      if (returnFocus && proxy.getClientRects().length) proxy.focus({ preventScroll: true });
    }
  }

  function createSidebarButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-chatgpt-a11y-sidebar-open", "true");
    button.setAttribute("aria-label", sidebarLabel);
    button.setAttribute("aria-controls", "app-shell-sidebar");
    button.title = sidebarLabel;
    button.textContent = "☰";
    button.style.cssText = "flex-shrink:0;align-self:center;width:36px;min-height:36px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:22px;cursor:pointer";
    button.addEventListener("click", () => {
      const sidebar = button.closest(sidebarSelector);
      const content = sidebar?.querySelector('[data-slate-sidebar-content]');
      if (!active || !content || !button.isConnected) return;
      cancelTransition();
      transition = { sidebar, expanded: !content.hasAttribute("inert") };
      // A failed native command must not reclaim focus after an unrelated
      // later toggle. No global focus or keyboard interception is installed.
      transitionTimer = setTimeout(cancelTransition, 1000);
      const native = nativeSidebarButton(sidebar);
      if (native) native.click();
      else {
        // Verified native shortcut when the collapsed content is inert.
        button.dispatchEvent(new KeyboardEvent("keydown", {
          key: "s", code: "KeyS", ctrlKey: true, shiftKey: true,
          bubbles: true, cancelable: true
        }));
      }
      schedule();
    });
    proxyRefs.add(new WeakRef(button));
    return button;
  }

  function normalizeSidebarLabels(sidebar) {
    for (const button of sidebar.querySelectorAll('button[aria-controls="app-shell-sidebar"]')) {
      applyAttribute(button, "aria-label", sidebarLabel);
      if (button.matches(ownedSelector)) applyAttribute(button, "title", sidebarLabel);
    }
  }

  const navigationPeekAreas = new Map([
    ["builtin:home", "home"], ["builtin:space", "space"],
    ["builtin:automations", "scheduled"], ["builtin:customize", "customize"]
  ]);
  function navigationButton(button, rail) {
    if (button.tagName !== "BUTTON" || !button.isConnected || !rail?.contains(button) ||
        !(button.getAttribute("data-sidebar-destination") || "").trim()) return false;
    const popup = (button.getAttribute("aria-haspopup") || "").trim().toLowerCase();
    if ((popup && popup !== "false") || (button.getAttribute("aria-controls") || "").trim()) return false;
    // Pins have no peek panel. Accept future destination IDs without depending
    // on names, builtins or pin order. Peek-bearing controls keep the four
    // demonstrated pairs so an unknown controlled widget is left native.
    return !button.hasAttribute("data-slate-sidebar-peek-area") ||
      navigationPeekAreas.get(button.getAttribute("data-sidebar-destination")) ===
        button.getAttribute("data-slate-sidebar-peek-area");
  }

  function normalizeRailNavigation(sidebar) {
    const rail = sidebar?.querySelector('[data-app-navigation-rail]');
    for (const ref of nodeRefs) {
      const node = ref.deref();
      if (node?.tagName === "BUTTON" && !node.matches(ownedSelector) &&
          changedAttributes.get(node)?.has("aria-expanded") && !navigationButton(node, rail)) {
        restoreAttribute(node, "aria-expanded");
      }
    }
    if (!rail) return;
    // The native destinations also expose the secondary peek
    // panel state. Keep page-current semantics, without announcing that peek
    // state as if it described whether their destination page was open.
    for (const button of rail.querySelectorAll('button[data-sidebar-destination]')) {
      if (navigationButton(button, rail)) applyAttribute(button, "aria-expanded", null);
    }
  }

  function hideRedundantHomeLink(sidebar) {
    const content = sidebar?.querySelector('[data-slate-sidebar-content]');
    const rail = sidebar?.querySelector('[data-app-navigation-rail]');
    const home = rail?.querySelector('button[data-sidebar-destination="builtin:home"][aria-current="page"]');
    const candidates = content ? Array.from(content.querySelectorAll('a[href="/"][aria-label="Accueil"]'))
      .filter(link => link.textContent.trim() === "ChatGPT" && !link.closest('[role="listitem"]')) : [];
    const redundant = window.location?.pathname === "/" && home && candidates.length === 1 ? candidates[0] : null;
    for (const ref of nodeRefs) {
      const node = ref.deref();
      if (node?.tagName === "A" && node !== redundant) {
        restoreAttribute(node, "aria-hidden");
        restoreAttribute(node, "tabindex");
      }
    }
    if (redundant) {
      applyAttribute(redundant, "aria-hidden", "true");
      applyAttribute(redundant, "tabindex", "-1");
    }
  }

  function chatLink(link) {
    const path = (link.getAttribute("href") || "").split(/[?#]/, 1)[0];
    // Native ChatGPT routes include /c/id and /g/project/c/id. Require a whole
    // /c/ segment, a following chat ID and a local path, never an external URL.
    return /^\/(?!\/)(?:[^/]+\/)*c\/[^/]+\/?$/.test(path);
  }

  function flattenChatGroups(sidebar) {
    for (const group of sidebar.querySelectorAll('[role="listitem"] > .sidebar-item')) {
      if (nativeAttribute(group, "role") !== "group") continue;
      if (!Array.from(group.querySelectorAll('a[href]')).some(chatLink) ||
          !group.querySelector('button[aria-label="Actions du chat"]')) {
        restoreAttributes(group);
        continue;
      }
      applyAttribute(group, "role", null);
      applyAttribute(group, "aria-label", null);
      applyAttribute(group, "aria-labelledby", null);
    }
  }

  function hideLastResponseHeading() {
    for (const heading of document.querySelectorAll('h4.sr-only[tabindex]')) {
      if (heading.textContent.trim() !== "Dernière réponse" ||
          heading.closest('[data-turn-key], [data-turn-id-container]')) continue;
      applyAttribute(heading, "tabindex", "-1");
      applyAttribute(heading, "aria-hidden", "true");
    }
  }

  function update() {
    pending = false;
    if (!active) return;
    if (!/^fr(?:-|$)/i.test(document.documentElement?.lang || "")) { cleanup(); return; }
    for (const ref of nodeRefs) {
      const node = ref.deref();
      if (!node || !node.isConnected) { if (node) restoreAttributes(node); nodeRefs.delete(ref); }
      else if (node.tagName === "BUTTON" && !node.matches(ownedSelector) &&
          (changedAttributes.get(node)?.has("aria-label") || changedAttributes.get(node)?.has("aria-hidden")) &&
          (!node.matches('button[aria-controls="app-shell-sidebar"]') || !node.closest(sidebarSelector))) {
        restoreAttributes(node); nodeRefs.delete(ref);
      }
    }
    const sidebar = document.querySelector(sidebarSelector);
    if (sidebar) {
      flattenChatGroups(sidebar); normalizeSidebarLabels(sidebar); sidebarButton(sidebar);
    }
    else { proxy?.remove(); proxy = null; cancelTransition(); }
    normalizeRailNavigation(sidebar); hideRedundantHomeLink(sidebar);
    hideLastResponseHeading();
  }

  function schedule() {
    if (!active || pending) return;
    pending = true;
    queueMicrotask(update);
  }

  const relevantSelector = `${sidebarSelector}, h4.sr-only[tabindex]`;
  const relevant = node => node.nodeType === 1 &&
    (changedAttributes.has(node) || node.matches(relevantSelector) || node.closest(sidebarSelector) ||
      node.querySelector(relevantSelector) || (proxy && node.contains(proxy)));
  const observer = new MutationObserver(records => {
    if (!active) return;
    if (records.some(record => record.type === "attributes" ?
      record.target === document.documentElement || relevant(record.target) :
      relevant(record.target) || Array.from(record.addedNodes).some(relevant) || Array.from(record.removedNodes).some(relevant))) schedule();
  });
  // At MAIN/document_start the HTML element may not exist yet.
  observer.observe(document, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ["lang", "role", "inert", "aria-expanded", "aria-current", "aria-label", "aria-labelledby", "aria-hidden", "tabindex", "aria-controls", "aria-haspopup", "title", "href", "class", "hidden", "id", "data-slot", "data-app-navigation-rail", "data-sidebar-destination", "data-slate-sidebar-peek-area"]
  });
  window[marker] = Object.freeze({ stop() {
    if (!active) return;
    active = false; pending = false;
    observer.disconnect();
    cleanup();
  } });
  update();
})();
