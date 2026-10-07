/* Keyboard access to the native composer add menu. Native buttons and their
 * click handlers are preserved; composer contents are never read or changed. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.add-menu.v2");
  if (window[marker]) return;

  const triggerSelector = 'button[aria-label="Ajouter des fichiers et plus encore"]';
  const sectionSelector = '[data-mention-section-id="chatgpt-actions"]';
  const itemSelector = 'button[data-list-navigation-item="true"]';
  const editorSelector = '.ProseMirror[role="textbox"]';
  let session = null;
  let pending = false;
  let serial = 0;
  let active = true;
  const triggerChanges = { changes: new Map() };

  function findMenu() {
    const trigger = Array.from(document.querySelectorAll(`${triggerSelector}[aria-expanded="true"]`))
      .find(button => button.isConnected && button.getClientRects().length &&
        !button.closest('[hidden], [inert], [aria-hidden="true"]'));
    if (!trigger?.isConnected) return null;
    for (const section of document.querySelectorAll(sectionSelector)) {
      const scroll = section.closest('[data-mention-list-scroll-area]');
      const root = scroll?.parentElement;
      if (root?.isConnected && root.tagName === "DIV" &&
        !root.closest('[hidden], [inert], [aria-hidden="true"]') &&
        root.getClientRects().length && scroll.querySelector(itemSelector)) {
        return { trigger, scroll, root };
      }
    }
    return null;
  }

  const enabled = item => !item.disabled && !item.matches(':disabled') &&
    item.getAttribute("aria-disabled") !== "true" &&
    item.getClientRects().length &&
    !item.closest('[hidden], [inert], [aria-hidden="true"]');
  const items = menu => Array.from(menu.scroll.querySelectorAll(itemSelector)).filter(enabled);
  const sameMenu = (a, b) => a && b && a.trigger === b.trigger && a.root === b.root && a.scroll === b.scroll;

  function setAttribute(menu, node, name, value) {
    const current = node.getAttribute(name);
    if (current === value) return;
    let attributes = menu.changes.get(node);
    if (!attributes) { attributes = new Map(); menu.changes.set(node, attributes); }
    const previous = attributes.get(name);
    attributes.set(name, { original: previous?.applied === current ? previous.original : current, applied: value });
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  }

  function restoreNode(menu, node) {
    const attributes = menu.changes.get(node);
    if (!attributes) return;
    for (const [name, change] of attributes) {
      if (node.getAttribute(name) !== change.applied) continue;
      if (change.original === null) node.removeAttribute(name);
      else node.setAttribute(name, change.original);
    }
    menu.changes.delete(node);
  }

  function restore(menu) {
    if (!menu) return;
    for (const node of menu.changes.keys()) restoreNode(menu, node);
  }

  function focusItem(menu, item) {
    for (const button of menu.scroll.querySelectorAll(itemSelector)) {
      setAttribute(menu, button, "tabindex", button === item ? "0" : "-1");
    }
    item.focus({ preventScroll: true });
  }

  function reconcile() {
    pending = false;
    if (!active) return;
    for (const trigger of triggerChanges.changes.keys()) if (!trigger.isConnected) restoreNode(triggerChanges, trigger);
    // The trigger announces a menu even before its popup exists. This property
    // belongs to the native trigger, independently of a particular opening.
    for (const trigger of document.querySelectorAll(triggerSelector)) {
      setAttribute(triggerChanges, trigger, "aria-haspopup", "menu");
    }
    const found = findMenu();
    if (!sameMenu(session, found)) {
      restore(session);
      session = found ? { ...found, changes: new Map(), focused: false } : null;
    }
    if (!session) return;
    const menu = session;
    const id = menu.root.id || `chatgpt-accessibility-add-menu-${++serial}`;
    setAttribute(menu, menu.root, "id", id);
    setAttribute(menu, menu.root, "role", "menu");
    if (!menu.root.getAttribute("aria-label")?.trim() && !menu.root.getAttribute("aria-labelledby")?.trim()) {
      setAttribute(menu, menu.root, "aria-label", menu.trigger.getAttribute("aria-label"));
    }
    setAttribute(menu, menu.trigger, "aria-controls", id);
    const available = items(menu);
    const focused = document.activeElement;
    for (const button of menu.scroll.querySelectorAll(itemSelector)) {
      setAttribute(menu, button, "role", "menuitem");
      // The native mouse highlight exposes "current" on an action. It does
      // not represent the focused menu choice or a current destination.
      setAttribute(menu, button, "aria-current", null);
      setAttribute(menu, button, "tabindex", button === focused && enabled(button) ? "0" : "-1");
    }
    if (!menu.focused && available.length) {
      menu.focused = true;
      if (focused === menu.trigger || focused === document.body || focused?.matches(editorSelector) || menu.root.contains(focused)) {
        focusItem(menu, available[0]);
      }
    } else if (menu.root.contains(focused) && focused?.matches(itemSelector) && !enabled(focused) && available.length) {
      focusItem(menu, available[0]);
    }
  }

  function schedule() {
    if (!active || pending) return;
    pending = true;
    queueMicrotask(reconcile);
  }

  // The native composer blur plugin dismisses suggestions as focus leaves the
  // editor. Suppress only that transition into this particular open menu.
  function guardBlur(event) {
    if (!active) return;
    if (!event.target?.matches?.(editorSelector)) return;
    const menu = findMenu();
    if (menu && event.relatedTarget?.matches?.(itemSelector) && menu.scroll.contains(event.relatedTarget)) {
      event.stopImmediatePropagation();
    }
  }
  document.addEventListener("blur", guardBlur, true);

  function buttonFromEvent(event, menu) {
    const target = event.target;
    const button = target?.closest?.(itemSelector);
    if (!button || !menu.scroll.contains(button)) return null;
    // An embedded input, link, or other control retains its own keyboard path.
    const control = target.closest('button, input, textarea, select, a[href], [contenteditable="true"], [role="textbox"]');
    return control === button ? button : null;
  }

  function close(menu) {
    menu.trigger.click();
    if (menu.trigger.isConnected) menu.trigger.focus({ preventScroll: true });
    schedule();
  }

  // Installed before menu opening, ahead of the native window handler, whose
  // highlighted index otherwise differs from the actually focused button.
  function handleKeydown(event) {
    if (!active) return;
    if (event.isComposing || event.keyCode === 229 || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.shiftKey && event.key !== "Tab") return;
    const found = findMenu();
    if (!found) return;
    const button = buttonFromEvent(event, found);
    if (!button) return;
    const key = event.key;
    if (!["Enter", " ", "Spacebar", "ArrowDown", "ArrowUp", "Home", "End", "Escape", "Tab"].includes(key)) return;
    if (key !== "Tab") event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat) return;
    if (key === "Tab" || key === "Escape") { close(found); return; }
    if (key === "Enter" || key === " " || key === "Spacebar") {
      if (enabled(button)) button.click();
      schedule();
      return;
    }
    reconcile();
    if (!sameMenu(session, found)) return;
    const available = items(session);
    if (!available.length) return;
    const current = available.indexOf(button);
    let index;
    if (key === "Home") index = 0;
    else if (key === "End") index = available.length - 1;
    else if (key === "ArrowDown") index = (current + 1) % available.length;
    else index = current < 0 ? available.length - 1 : (current - 1 + available.length) % available.length;
    focusItem(session, available[index]);
  }
  window.addEventListener("keydown", handleKeydown, true);

  const relevantNode = node => node.nodeType === 1 &&
    (node.matches(`${triggerSelector}, ${sectionSelector}`) || node.querySelector(`${triggerSelector}, ${sectionSelector}`));
  const observer = new MutationObserver(records => {
    if (!active) return;
    if (records.some(record => {
      if (session && (!session.root.isConnected || !session.trigger.isConnected || session.root.contains(record.target) || record.target === session.trigger)) return true;
      if (record.type === "attributes") return record.target.matches(`${triggerSelector}, ${sectionSelector}`);
      return Array.from(record.addedNodes).some(relevantNode) || Array.from(record.removedNodes).some(relevantNode);
    })) schedule();
  });
  observer.observe(document, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ["aria-expanded", "aria-label", "aria-current", "aria-haspopup", "data-mention-section-id", "data-list-navigation-item", "disabled", "aria-disabled", "hidden", "inert", "aria-hidden"]
  });
  const api = { stop() {
    if (!active) return;
    active = false; pending = false;
    observer.disconnect();
    document.removeEventListener("blur", guardBlur, true);
    window.removeEventListener("keydown", handleKeydown, true);
    restore(session); session = null;
    restore(triggerChanges);
    if (window[marker] === api) delete window[marker];
  } };
  window[marker] = api;
  reconcile();
})();
