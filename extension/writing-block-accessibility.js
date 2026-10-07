/* Exclude the native editor's invisible, inactive table handles. Keep the
 * editable document, copy controls and active table operations unchanged. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.writing-block.v1");
  const current = Symbol.for("chatgpt-navigation-continue.writing-block.current");
  if (window[marker]?.active) return;
  window[current]?.stop?.();
  const selector = "button[data-writing-block-table-grab-handle]";
  const entries = new WeakMap(), writes = new WeakMap(), refs = new Set();
  let active = true;
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");

  function handle(node) {
    const kind = node?.getAttribute?.("data-writing-block-table-grab-handle");
    return node?.tagName === "BUTTON" && node.parentElement === document.body &&
      ["row", "column"].includes(kind) && node.getAttribute("type") === "button" &&
      node.getAttribute("contenteditable") === "false" &&
      [null, "button"].includes(node.getAttribute("role")) &&
      node.classList.contains("writing-block-table-grab-handle") &&
      node.classList.contains(`writing-block-table-grab-handle-${kind}`) &&
      node.textContent.trim() === "⋮⋮" && "inert" in node;
  }
  function inactive(node) {
    if (!french() || !node.isConnected || !handle(node) || document.activeElement === node) return false;
    const style = getComputedStyle(node);
    return style.opacity === "0" && style.pointerEvents === "none";
  }
  function records(batch) {
    const following = new Map(), values = new Map();
    for (let i = batch.length - 1; i >= 0; i--) {
      const r = batch[i];
      if (r.type !== "attributes" || r.attributeName !== "inert") continue;
      values.set(r, following.has(r.target) ? following.get(r.target) : r.target.getAttribute("inert"));
      following.set(r.target, r.oldValue);
    }
    for (const r of batch) {
      if (r.type !== "attributes" || r.attributeName !== "inert") continue;
      const own = writes.get(r.target), value = values.get(r);
      if (own?.length && own[0].from === r.oldValue && own[0].to === value) {
        own.shift(); if (!own.length) writes.delete(r.target);
      } else {
        const entry = entries.get(r.target);
        if (entry) entry.native = value;
      }
    }
  }
  function write(node, value) {
    const from = node.getAttribute("inert");
    if (from === value) return;
    if (node.isConnected) {
      const queue = writes.get(node) || []; queue.push({ from, to: value }); writes.set(node, queue);
    }
    if (value === null) node.removeAttribute("inert"); else node.setAttribute("inert", value);
  }
  function restore(node) {
    const entry = entries.get(node);
    if (!entry) return;
    if (node.getAttribute("inert") === "") write(node, entry.native);
    entries.delete(node);
  }
  function update(batch = []) {
    if (!active) return;
    records(batch);
    for (const ref of refs) {
      const node = ref.deref();
      if (!node || !inactive(node)) { if (node) restore(node); refs.delete(ref); }
    }
    if (!french()) return;
    for (const node of document.querySelectorAll(selector)) {
      if (!inactive(node)) continue;
      if (!entries.has(node)) {
        if (node.hasAttribute("inert")) continue;
        entries.set(node, { native: null }); refs.add(new WeakRef(node));
      }
      write(node, "");
    }
  }
  const relevant = node => node.nodeType === 1 &&
    (entries.has(node) || node.matches(selector) || node.querySelector(selector));
  const observer = new MutationObserver(batch => {
    if (!active) return;
    records(batch);
    if (batch.some(r => r.type === "attributes" ? r.target === document.documentElement || relevant(r.target) :
      relevant(r.target) || [...r.addedNodes, ...r.removedNodes].some(relevant))) update();
  });
  // The document and its HTML/body can arrive after document_start.
  observer.observe(document, { childList: true, subtree: true, attributes: true, attributeOldValue: true,
    attributeFilter: ["lang", "inert", "style", "class", "role", "type", "contenteditable", "data-writing-block-table-grab-handle"] });
  const onBlur = event => { if (handle(event.target)) queueMicrotask(() => update()); };
  document.addEventListener("focusout", onBlur, true);
  const api = Object.freeze({ get active() { return active; }, stop() {
    if (!active) return;
    records(observer.takeRecords()); active = false; observer.disconnect();
    document.removeEventListener("focusout", onBlur, true);
    for (const ref of refs) { const node = ref.deref(); if (node) restore(node); } refs.clear();
  } });
  window[marker] = api; window[current] = api;
  update();
})();
