/* Restore ordinary page selection and protect wide copies crossing runtime
 * data. Outside an explicit copy only the two public speaker captions are read.
 * Selection, focus, native headings, timestamps and editors are preserved. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.page-selection.v2");
  const current = Symbol.for("chatgpt-navigation-continue.page-selection.current");
  if (window[marker]?.active) return;
  window[current]?.stop?.();
  const pageAttribute = "data-chatgpt-page-selection";
  const speakerAttribute = "data-chatgpt-selectable-speaker";
  const speakerSelector = "h4.sr-only";
  const captions = new Set(["Vous avez dit :", "ChatGPT a dit :"]);
  const original = new WeakMap();
  const tracked = new Set();
  let active = true;
  let appliedRoot = null;
  let pageOriginal = null;

  function copyRendered(event) {
    if (!active || !appliedRoot || appliedRoot.getAttribute(pageAttribute) !== "active" ||
        !/^fr(?:-|$)/i.test(appliedRoot.getAttribute("lang") || "") ||
        !event.cancelable || event.defaultPrevented || !event.clipboardData || event.clipboardData.types.length) return;
    let selection, range, text;
    try {
      const elementOf = node => node?.nodeType === 1 ? node : node?.parentElement;
      const formControl = node => elementOf(node)?.closest('input, textarea, select');
      let focused = document.activeElement;
      while (focused?.shadowRoot?.activeElement) focused = focused.shadowRoot.activeElement;
      if (formControl(focused) || formControl(event.target) || event.composedPath?.().some(formControl)) return;
      selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount !== 1) return;
      const editable = node => elementOf(node)?.isContentEditable || formControl(node);
      if (editable(selection.anchorNode) || editable(selection.focusNode)) return;
      // JAWS can select document text while the DOM focus remains in the DIV
      // composer. Its focus alone must not override these actual endpoints.
      range = selection.getRangeAt(0);
      if (!appliedRoot.contains(range.startContainer) || !appliedRoot.contains(range.endContainer)) return;
      if (![...appliedRoot.querySelectorAll("script, style, template")].some(node => range.intersectsNode(node))) return;
      text = selection.toString();
      if (!text) return;
    } catch { return; }
    // The raw Range and native HTML can contain non-rendered hydration data.
    // For this case both formats contain the same rendered text. Do not clone
    // raw markup or filter words: visible PRE/CODE examples must remain exact.
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    try {
      event.clipboardData.setData("text/plain", text);
      event.clipboardData.setData("text/html", `<pre style="white-space: pre-wrap;"><span>${escaped}</span></pre>`);
    } catch {
      try { event.clipboardData.clearData(); } catch { /* Keep native fallback. */ }
      return;
    }
    event.preventDefault();
  }
  // Bubble after document/React handlers; a native/custom copy wins if it has
  // already supplied data. No keyboard event, selection or focus is changed.
  window.addEventListener("copy", copyRendered);

  function restore(node) {
    if (!original.has(node)) return;
    if (node.getAttribute(speakerAttribute) === "active") {
      const value = original.get(node);
      if (value === null) node.removeAttribute(speakerAttribute);
      else node.setAttribute(speakerAttribute, value);
    }
    original.delete(node);
  }

  function inspect(node) {
    if (!node?.matches) return;
    const eligible = appliedRoot?.contains(node) && node.matches(speakerSelector) && node.closest("[data-turn-key]") &&
      !node.closest('[hidden], [aria-hidden="true"], [inert]') &&
      !node.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') &&
      captions.has(node.textContent.trim());
    if (!eligible) { restore(node); return; }
    if (!original.has(node)) {
      original.set(node, node.getAttribute(speakerAttribute));
      tracked.add(new WeakRef(node));
    }
    if (node.getAttribute(speakerAttribute) !== "active") node.setAttribute(speakerAttribute, "active");
  }

  function discover(node) {
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    if (!element) return;
    inspect(element);
    for (const heading of element.querySelectorAll(`${speakerSelector}, [${speakerAttribute}]`)) inspect(heading);
  }

  function restorePage() {
    for (const ref of tracked) { const node = ref.deref(); if (node) restore(node); }
    tracked.clear();
    if (appliedRoot?.getAttribute(pageAttribute) === "active") {
      if (pageOriginal === null) appliedRoot.removeAttribute(pageAttribute);
      else appliedRoot.setAttribute(pageAttribute, pageOriginal);
    }
    appliedRoot = null;
    pageOriginal = null;
  }

  function updateRoot() {
    const root = document.documentElement;
    const next = /^fr(?:-|$)/i.test(root?.getAttribute("lang") || "") ? root : null;
    if (next === appliedRoot) return;
    restorePage();
    if (!next) return;
    appliedRoot = next;
    pageOriginal = next.getAttribute(pageAttribute);
    next.setAttribute(pageAttribute, "active");
    discover(next);
  }

  const observer = new MutationObserver(records => {
    if (!active) return;
    updateRoot();
    if (!appliedRoot) return;
    for (const record of records) {
      if (record.type === "attributes") discover(record.target);
      // Native headings can be recycled by React. Recheck only the enclosing
      // caption when its text changes; never read streamed message text.
      else if (record.type === "characterData") inspect(record.target.parentElement?.closest(`${speakerSelector}, [${speakerAttribute}]`));
      else {
        inspect(record.target);
        for (const node of record.addedNodes || []) discover(node);
        for (const node of record.removedNodes || []) {
          if (node.nodeType !== 1 || node.isConnected) continue;
          restore(node);
          for (const heading of node.querySelectorAll(`[${speakerAttribute}]`)) restore(heading);
        }
      }
    }
    for (const ref of tracked) if (!ref.deref() || !original.has(ref.deref())) tracked.delete(ref);
  });
  // At document_start HTML may not exist yet. Watching the document also
  // follows later root replacement and a language change without reloading.
  observer.observe(document, {
    childList: true, subtree: true, attributes: true, characterData: true,
    attributeFilter: ["lang", "class", "hidden", "aria-hidden", "inert", "contenteditable", "data-turn-key"]
  });
  const api = {
    get active() { return active; },
    stop() {
      if (!active) return;
      active = false;
      observer.disconnect();
      window.removeEventListener("copy", copyRendered);
      restorePage();
    }
  };
  window[marker] = api;
  window[current] = api;
  updateRoot();
})();
