/* Expose the native roles of known sortable sidebar controls and draggable chats. Deployment is
 * limited to ChatGPT by the manifest; native DnD instructions remain intact. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.sidebar-sortable.v2");
  const currentMarker = Symbol.for("chatgpt-navigation-continue.sidebar-sortable.current");
  if (window[marker]?.active) return;
  window[currentMarker]?.stop?.();
  const attribute = "aria-roledescription";
  const sidebarSelector = "#app-shell-sidebar";
  const changes = new WeakMap();
  const refs = new Set();
  const ownRemovals = new WeakMap();
  let stopped = false;

  const isFrench = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");
  function knownRole(node) {
    const role = node.getAttribute("role");
    if (role) return role === "button" || role === "link" || role === "listitem";
    return node.tagName === "BUTTON" || (node.tagName === "A" && node.hasAttribute("href"));
  }
  function inScope(node) {
    return node.isConnected && !!node.closest(sidebarSelector) && knownRole(node);
  }
  function conversationLink(node) {
    const role = node.getAttribute("role");
    if (role ? role !== "link" : node.tagName !== "A") return false;
    const href = node.getAttribute("href");
    if (!href) return false;
    try {
      const base = new URL(document.baseURI);
      const url = new URL(href, base);
      return url.origin === base.origin && /^\/(?:c\/[^/]+|g\/[^/]+\/c\/[^/]+)\/?$/.test(url.pathname);
    } catch { return false; }
  }
  function chatRole(node) {
    if (conversationLink(node)) return true;
    return node.getAttribute("role") === "listitem" &&
      Array.from(node.querySelectorAll("[href]")).some(link =>
        conversationLink(link) && link.closest('[role="listitem"]') === node);
  }
  function suppressedValue(node, value) {
    return inScope(node) && (value === "sortable" || (value === "draggable" && chatRole(node)));
  }
  function relevant(node) {
    return node?.nodeType === 1 && (changes.has(node) || !!node.closest(sidebarSelector));
  }

  // oldValue plus the following record reconstructs every intermediate native
  // value, even when React writes/removes the attribute in one delivery batch.
  // Our own removal is consumed separately and cannot become the native value.
  function readRecords(records) {
    const values = new Map();
    const currentValues = new Map();
    for (let i = records.length - 1; i >= 0; i--) {
      const record = records[i];
      if (record.type !== "attributes" || record.attributeName !== attribute) continue;
      const node = record.target;
      values.set(record, currentValues.has(node) ? currentValues.get(node) : node.getAttribute(attribute));
      currentValues.set(node, record.oldValue);
    }
    for (const record of records) {
      if (record.type !== "attributes" || record.attributeName !== attribute) continue;
      const node = record.target;
      const value = values.get(record);
      const own = ownRemovals.get(node);
      if (own?.length && record.oldValue === own[0] && value === null) {
        own.shift();
        if (!own.length) ownRemovals.delete(node);
      } else {
        const entry = changes.get(node);
        if (entry) entry.native = value;
      }
    }
  }

  function restore(node) {
    const entry = changes.get(node);
    if (!entry) return;
    // A native replacement which is already present always wins.
    if (node.getAttribute(attribute) === null && entry.native !== null) node.setAttribute(attribute, entry.native);
    changes.delete(node);
    refs.delete(entry.ref);
  }

  function suppress(node) {
    // Consume earlier native records before registering our own removal.
    readRecords(observer.takeRecords());
    const value = node.getAttribute(attribute);
    if (!suppressedValue(node, value)) return;
    let entry = changes.get(node);
    if (!entry) {
      entry = { native: value, ref: new WeakRef(node) };
      changes.set(node, entry);
      refs.add(entry.ref);
    } else entry.native = value;
    const own = ownRemovals.get(node) || [];
    own.push(value);
    ownRemovals.set(node, own);
    node.removeAttribute(attribute);
  }

  function update() {
    if (stopped) return;
    readRecords(observer.takeRecords());
    const french = isFrench();
    for (const ref of refs) {
      const node = ref.deref();
      if (!node) { refs.delete(ref); continue; }
      const entry = changes.get(node);
      const current = node.getAttribute(attribute);
      if (!french || !suppressedValue(node, entry?.native) ||
          (current !== null && !suppressedValue(node, current))) restore(node);
    }
    if (!french) return;
    for (const sidebar of document.querySelectorAll(sidebarSelector)) {
      for (const node of sidebar.querySelectorAll("[aria-roledescription]")) {
        if (suppressedValue(node, node.getAttribute(attribute))) suppress(node);
      }
    }
  }
  const observer = new MutationObserver(records => {
    if (stopped) return;
    readRecords(records);
    if (records.some(record =>
      (record.type === "attributes" && record.target === document.documentElement && record.attributeName === "lang") ||
      (record.type === "attributes" && record.attributeName === "id" && record.oldValue === "app-shell-sidebar") ||
      relevant(record.target) || Array.from(record.addedNodes || []).concat(Array.from(record.removedNodes || [])).some(node =>
        node.nodeType === 1 && (node.matches(sidebarSelector) || node.querySelector(sidebarSelector))))) update();
  });
  observer.observe(document, {
    subtree: true, childList: true, attributes: true, attributeOldValue: true,
    attributeFilter: ["lang", "id", "role", "href", attribute]
  });
  const api = { version: 2, active: true, stop() {
    if (stopped) return;
    readRecords(observer.takeRecords());
    stopped = true; api.active = false;
    observer.disconnect();
    for (const ref of refs) { const node = ref.deref(); if (node) restore(node); }
    refs.clear();
    if (window[currentMarker] === api) delete window[currentMarker];
  } };
  window[marker] = api;
  window[currentMarker] = api;
  update();
})();
