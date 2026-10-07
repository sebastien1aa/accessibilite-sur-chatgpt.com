/* GenUI source citations navigate through their existing callbacks. Expose that
 * link function without replacing React hosts or changing the native preview. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.source-links-accessibility.v2");
  if (window[marker]?.active) return;
  window[Symbol.for("chatgpt-navigation-continue.source-links-accessibility.v1")]?.stop();
  let active = true, frame = null;
  const owned = new Map();
  const triggerSelector = 'span[data-d-component="popover-trigger"]';
  const cardSelector = 'button[data-d-component="pressable"]';
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");
  const nativeProps = node => {
    const key = Object.keys(node).find(key => key.startsWith("__reactProps$"));
    return key ? node[key] : null;
  };
  const favicon = node => !!node.querySelector('[data-d-component="favicon"] img');
  function trigger(node) {
    const props = nativeProps(node), expanded = node.getAttribute("aria-expanded");
    return node.isConnected && node.tagName === "SPAN" &&
      node.getAttribute("data-d-component") === "popover-trigger" &&
      node.hasAttribute("data-d-inline") && node.hasAttribute("data-d-inline-text") &&
      !!node.closest('[data-turn-key]') && props?.role === "button" &&
      (node.getAttribute("role") === "button" || (owned.has(node) && node.getAttribute("role") === "link")) &&
      typeof props.onClick === "function" && typeof props.onKeyDown === "function" &&
      node.getAttribute("aria-haspopup") === "dialog" &&
      (expanded === "true" || expanded === "false") &&
      node.getAttribute("tabindex") === "0" &&
      !!node.querySelector('[data-d-component="badge"]') && favicon(node) &&
      !node.querySelector('a[href], button, input, textarea, select, [contenteditable="true"]');
  }
  function card(node, controlledDialogs) {
    const props = nativeProps(node), dialog = node.closest('[role="dialog"]');
    const label = props?.["aria-label"];
    const currentLabel = node.getAttribute("aria-label"), appliedLabel = owned.get(node)?.get("aria-label");
    return node.isConnected && node.tagName === "BUTTON" &&
      node.getAttribute("data-d-component") === "pressable" &&
      props?.type === "button" && node.getAttribute("type") === "button" &&
      (props.role === undefined || props.role === "button") &&
      (node.getAttribute("role") === null || node.getAttribute("role") === "button" ||
        (owned.has(node) && node.getAttribute("role") === "link")) &&
      typeof props.onClick === "function" && typeof label === "string" &&
      /^Open\s+\S/.test(label) && !node.hasAttribute("aria-labelledby") &&
      (currentLabel === label || (appliedLabel && currentLabel === appliedLabel.applied)) &&
      !!dialog?.id && controlledDialogs.get(dialog.id) === dialog && favicon(node) &&
      !node.querySelector('a[href], button, input, textarea, select, [contenteditable="true"]') &&
      typeof node.textContent === "string" && node.textContent.trim().length > 0;
  }
  function restore(node, entry) {
    const props = nativeProps(node);
    for (const [name, saved] of entry) {
      if (node.getAttribute(name) !== saved.applied) continue;
      // A committed native property supersedes our original snapshot. A DOM
      // write different from our value is also left untouched above.
      const value = props ? (props[name] == null ? null : String(props[name])) : saved.before;
      if (value === null) node.removeAttribute(name);
      else node.setAttribute(name, value);
    }
    owned.delete(node);
  }
  function apply(node, name, value) {
    let entry = owned.get(node);
    if (!entry) { entry = new Map(); owned.set(node, entry); }
    const current = node.getAttribute(name), saved = entry.get(name);
    if (current === value) return;
    entry.set(name, { before: saved ? saved.before : current, applied: value });
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  }
  function check() {
    if (!active) return;
    if (!french()) { for (const [node, entry] of owned) restore(node, entry); return; }
    const candidates = new Map(), dialogs = new Map(), dialogTriggers = new Map(), ids = new Map();
    for (const node of document.querySelectorAll('[id]')) {
      const matches = ids.get(node.id) || [];
      matches.push(node); ids.set(node.id, matches);
    }
    const allDialogs = [...document.querySelectorAll('[role="dialog"][id]')];
    for (const node of document.querySelectorAll(triggerSelector)) {
      if (!trigger(node)) continue;
      candidates.set(node, null);
      const id = node.getAttribute("aria-controls");
      if (!id || node.getAttribute("aria-expanded") !== "true") continue;
      const matches = allDialogs.filter(dialog => dialog.id === id);
      if (matches.length === 1 && ids.get(id)?.length === 1) {
        dialogs.set(id, matches[0]); dialogTriggers.set(matches[0], node);
      }
    }
    for (const node of document.querySelectorAll(cardSelector)) {
      if (card(node, dialogs)) {
        candidates.set(node, { kind: "card" });
        const dialog = node.closest('[role="dialog"]'), props = nativeProps(dialog);
        const label = dialog.getAttribute("aria-label"), saved = owned.get(dialog)?.get("aria-label");
        if (!dialog.hasAttribute("aria-labelledby") && props?.["aria-label"] == null &&
            (label === null || (saved && label === saved.applied))) {
          const source = dialogTriggers.get(dialog)?.textContent?.trim();
          candidates.set(dialog, { kind: "dialog", label: source ? `Aperçu des sources : ${source}` : "Aperçu des sources" });
        }
      }
    }
    for (const [node, entry] of owned) if (!candidates.has(node)) restore(node, entry);
    for (const [node, info] of candidates) {
      if (info?.kind === "dialog") { apply(node, "aria-label", info.label); continue; }
      apply(node, "role", "link");
      // A short explicit name hides the title/snippet from normal link reading.
      // Let the browser derive the name from the existing visible card content.
      if (info?.kind === "card") apply(node, "aria-label", null);
    }
  }
  function relevant(node) {
    return node?.nodeType === 1 && (owned.has(node) ||
      node.matches(`${triggerSelector}, ${cardSelector}, [role="dialog"]`) ||
      !!node.querySelector(`${triggerSelector}, ${cardSelector}, [role="dialog"]`));
  }
  function schedule() {
    if (!active || frame !== null) return;
    frame = requestAnimationFrame(() => { frame = null; check(); });
  }
  const observer = new MutationObserver(records => {
    if (records.some(record => record.type === "attributes" ||
      (record.type === "characterData" && !!record.target?.parentElement?.closest(cardSelector)) ||
      (record.type === "childList" && !!record.target?.closest?.(cardSelector)) ||
      relevant(record.target) || [...record.addedNodes, ...record.removedNodes].some(relevant))) schedule();
  });
  observer.observe(document, { subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ["lang", "role", "aria-label", "aria-labelledby", "aria-haspopup", "aria-expanded", "aria-controls", "id", "type", "tabindex", "data-d-component", "data-d-inline", "data-d-inline-text", "data-turn-key"] });
  window[marker] = { version: 2, get active() { return active; }, stop() {
    if (!active) return;
    active = false; observer.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    for (const [node, entry] of owned) restore(node, entry);
  } };
  check();
})();
