/* Expose the demonstrated native evaluation menu on its existing button.
 * The site retains children, callbacks, keyboard handling and popup focus. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.evaluation-menu-accessibility.v1");
  if (window[marker]?.active) return;
  let active = true;
  const owned = new Map();
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");

  function restoreAttribute(button, entry, name) {
    const applied = entry.attributes.get(name);
    if (applied === undefined) return;
    // Only originally absent attributes are supplied. A later native write wins.
    if (button.getAttribute(name) === applied) button.removeAttribute(name);
    entry.attributes.delete(name);
  }
  function restore(button, entry) {
    for (const name of [...entry.attributes.keys()]) restoreAttribute(button, entry, name);
    owned.delete(button);
  }
  function supply(button, entry, name, value) {
    const current = button.getAttribute(name), previous = entry.attributes.get(name);
    if (previous !== undefined && current !== previous) entry.attributes.delete(name);
    if (value === null) { restoreAttribute(button, entry, name); return; }
    if (current !== null && current !== previous) return;
    if (current !== value) {
      entry.attributes.set(name, value);
      button.setAttribute(name, value);
    }
  }
  function candidate(button, ids) {
    if (!button.isConnected || button.tagName !== "BUTTON" ||
        button.getAttribute("type") !== "button" || button.getAttribute("aria-label") !== "Évaluer la réponse" ||
        button.hasAttribute("aria-labelledby") || (button.hasAttribute("role") && button.getAttribute("role") !== "button")) return null;
    const wrapper = button.parentElement, turn = button.closest('[data-turn-key]');
    const key = turn?.getAttribute("data-turn-key");
    if (!key || wrapper?.tagName !== "SPAN" || wrapper.getAttribute("type") !== "button" ||
        !wrapper.id || ids.get(wrapper.id)?.length !== 1 || wrapper.getAttribute("aria-haspopup") !== "menu" ||
        wrapper.querySelectorAll("button").length !== 1 || wrapper.closest('[data-turn-key]') !== turn) return null;
    const expanded = wrapper.getAttribute("aria-expanded"), state = wrapper.getAttribute("data-state");
    if (!((expanded === "false" && state === "closed") || (expanded === "true" && state === "open"))) return null;
    return { wrapper, turn, key, id: wrapper.id, expanded };
  }
  function associatedMenu(info, menus, ids) {
    if (info.expanded !== "true") return null;
    // Radix may expose aria-controls only on the wrapper. Without it, the
    // single menu labelled by that exact wrapper still proves the relationship.
    const matches = menus.filter(menu => (menu.getAttribute("aria-labelledby") || "").trim() === info.id);
    if (matches.length !== 1) return null;
    const menu = matches[0], controls = info.wrapper.getAttribute("aria-controls");
    if (!menu.id || ids.get(menu.id)?.length !== 1 || (controls !== null && controls !== menu.id)) return null;
    return menu.id;
  }
  function check() {
    if (!active) return;
    if (!french()) { for (const [button, entry] of owned) restore(button, entry); return; }
    const ids = new Map();
    for (const node of document.querySelectorAll('[id]')) {
      const nodes = ids.get(node.id) || []; nodes.push(node); ids.set(node.id, nodes);
    }
    const candidates = new Map();
    for (const button of document.querySelectorAll('button[aria-label="Évaluer la réponse"]')) {
      const info = candidate(button, ids); if (info) candidates.set(button, info);
    }
    for (const [button, entry] of owned) {
      const info = candidates.get(button);
      if (!info || info.wrapper !== entry.wrapper || info.turn !== entry.turn || info.key !== entry.key || info.id !== entry.id) restore(button, entry);
    }
    const menus = [...document.querySelectorAll('[role="menu"]')];
    for (const [button, info] of candidates) {
      let entry = owned.get(button);
      if (!entry) { entry = { ...info, attributes: new Map() }; owned.set(button, entry); }
      supply(button, entry, "aria-haspopup", "menu");
      supply(button, entry, "aria-expanded", info.expanded);
      supply(button, entry, "aria-controls", associatedMenu(info, menus, ids));
    }
  }
  function relevantNode(node) {
    if (node?.nodeType !== 1) return false;
    return owned.has(node) || node.matches('[id], button[aria-label="Évaluer la réponse"], [role="menu"]') ||
      node.querySelectorAll('[id], button[aria-label="Évaluer la réponse"], [role="menu"]').length > 0;
  }
  const observer = new MutationObserver(records => {
    // Streaming message text adds text nodes continuously. Such mutations do
    // not change a trigger or its popup relationship and need no document scan.
    if (records.some(record => record.type === "attributes" ||
        (record.target?.nodeType === 1 && (owned.has(record.target) || record.target.matches('span[type="button"][aria-haspopup="menu"], [role="menu"]'))) ||
        [...record.addedNodes, ...record.removedNodes].some(relevantNode))) check();
  });
  // Document is available before HTML at document_start; one mutation delivery
  // updates semantics after native opening and closing in the same task.
  observer.observe(document, { subtree: true, childList: true, attributes: true,
    attributeFilter: ["lang", "type", "role", "id", "aria-label", "aria-labelledby", "aria-haspopup", "aria-expanded", "aria-controls", "data-state", "data-turn-key"] });
  const api = { version: 1, get active() { return active; }, stop() {
    if (!active) return;
    active = false; observer.disconnect();
    for (const [button, entry] of owned) restore(button, entry);
  } };
  window[marker] = api;
  check();
})();
