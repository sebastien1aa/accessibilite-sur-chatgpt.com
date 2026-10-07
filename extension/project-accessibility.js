/* Use the sidebar's current native project-form callback. No project is
 * created or submitted here, and React state/handlers remain unchanged. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.project-accessibility.v3");
  const currentMarker = Symbol.for("chatgpt-navigation-continue.project-accessibility.current");
  if (window[marker]?.active && window[marker]?.separateToggle) return;
  const previous = window[currentMarker];
  previous?.stop?.();
  const legacy = window[Symbol.for("chatgpt-navigation-continue.project-accessibility.v1")];
  if (legacy !== previous) legacy?.stop?.();
  const v2 = window[Symbol.for("chatgpt-navigation-continue.project-accessibility.v2")];
  if (v2 !== previous) v2?.stop?.();
  const sidebarSelector = "#app-shell-sidebar";
  const contentSelector = "[data-slate-sidebar-content]";
  const optionsSelector = 'button[aria-label="Options de la barre latérale de Chat"]';
  const nativeCreateSelector = "[data-app-action-sidebar-project-create]";
  const ownedSelector = "[data-chatgpt-a11y-project-create]";
  const projectRowSelector = "[data-app-action-sidebar-project-row]";
  const projectIdAttribute = "data-app-action-sidebar-project-id";
  const projectLabelAttribute = "data-app-action-sidebar-project-label";
  const rowStates = new WeakMap();
  const rowRefs = new Set();
  const rowTracked = new WeakSet();
  const rowPatches = new WeakMap();
  const name = "Ajouter un projet";
  const translated = new WeakMap();
  const changedRefs = new Set();
  let timer = null;
  let stopped = false;
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");

  function visible(node) {
    if (!node?.isConnected || node.closest('[hidden], [inert], [aria-hidden="true"]') || !node.getClientRects().length) return false;
    const style = window.getComputedStyle?.(node);
    return !style || (style.display !== "none" && style.visibility !== "hidden" && style.visibility !== "collapse");
  }

  function current(fiber, cache) {
    if (cache.has(fiber)) return cache.get(fiber);
    let root = fiber;
    let depth = 0;
    const path = [];
    while (root?.return && depth++ < 512) {
      if (cache.has(root)) {
        const result = cache.get(root);
        for (const node of path) cache.set(node, result);
        return result;
      }
      path.push(root); root = root.return;
    }
    const result = root?.return || !root?.stateNode?.current ? null : root.stateNode.current === root;
    for (const node of path) cache.set(node, result);
    if (root) cache.set(root, result);
    return result;
  }

  function sourceFor(sidebar, content, options) {
    try {
      const candidates = [];
      const committed = new WeakMap();
      const section = options.closest('[class~="group/nav-section"]');
      const scope = section && content.contains(section) ? section : content;
      const controls = root => Array.from(root.querySelectorAll("button, a, nav")).filter(node => !node.matches(ownedSelector)).slice(0, 24);
      const inspect = nodes => { for (const node of nodes) {
        const key = Object.keys(node).find(key => key.startsWith("__reactFiber$"));
        let fiber = key && node[key];
        for (let depth = 0; fiber && depth < 45; depth++, fiber = fiber.return) {
          for (const branch of [fiber, fiber.alternate]) {
            if (!branch || current(branch, committed) !== true) continue;
            const props = branch.memoizedProps;
            const source = props?.chatGptSource;
            if (props?.mode !== "list" || !source || typeof source.handleCreateProjectOpen !== "function") continue;
            const callback = source.handleCreateProjectOpen;
            // Native hA may recompose source wrappers while keeping the exact
            // same native callback. Only callback unanimity matters here.
            if (!candidates.some(item => item.callback === callback)) candidates.push({ source, callback, mode: "list" });
          }
        }
      } };
      inspect([options, content, sidebar, ...controls(scope)]);
      if (candidates.length === 0 && scope !== content) inspect(controls(content));
      return candidates.length === 1 ? candidates[0] : null;
    } catch { return null; }
  }

  function parts(sidebar) {
    if (!french() || !visible(sidebar)) return null;
    const content = sidebar.querySelector(contentSelector);
    if (!visible(content)) return null;
    if (Array.from(sidebar.querySelectorAll(nativeCreateSelector)).some(visible)) return null;
    const options = Array.from(content.querySelectorAll(optionsSelector)).find(visible);
    if (!options?.parentElement || !visible(options.parentElement)) return null;
    const source = sourceFor(sidebar, content, options);
    return source ? { content, options, source } : null;
  }

  function updateSidebar() {
    const sidebar = document.querySelector(sidebarSelector);
    const info = sidebar && parts(sidebar);
    for (const button of document.querySelectorAll(ownedSelector)) {
      if (!info || button.closest(sidebarSelector) !== sidebar || button.parentElement !== info.options.parentElement) button.remove();
    }
    if (!info || sidebar.querySelector(ownedSelector)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-chatgpt-a11y-project-create", "true");
    button.setAttribute("aria-label", name);
    button.title = name;
    button.textContent = name;
    button.style.cssText = "flex-shrink:0;min-height:32px;padding:4px 8px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer";
    button.addEventListener("click", () => {
      // Re-read current committed props on every explicit click. Never retain
      // a source callback across a render, a mode change or an unmount.
      if (stopped || !button.isConnected || !visible(button)) return;
      const liveSidebar = document.querySelector(sidebarSelector);
      if (liveSidebar !== sidebar || button.closest(sidebarSelector) !== liveSidebar) return;
      const latest = parts(liveSidebar);
      if (!latest || button.parentElement !== latest.options.parentElement) { schedule(); return; }
      latest.source.callback.call(latest.source.source);
      schedule();
    });
    info.options.parentElement.insertBefore(button, info.options.nextSibling);
  }

  function nativeRowAttribute(node, key) {
    const previous = rowPatches.get(node)?.get(key);
    const value = node.getAttribute(key);
    return previous?.applied === value ? previous.native : value;
  }

  function patchRowAttribute(node, key, value) {
    const current = node.getAttribute(key);
    if (current === value) return;
    let entries = rowPatches.get(node);
    if (!entries) { entries = new Map(); rowPatches.set(node, entries); }
    const previous = entries.get(key);
    entries.set(key, { native: previous?.applied === current ? previous.native : current, applied: value });
    if (value === null) node.removeAttribute(key);
    else node.setAttribute(key, value);
  }

  function restoreRowAttributes(node) {
    const entries = rowPatches.get(node);
    if (!entries) return;
    for (const [key, previous] of entries) {
      if (node.getAttribute(key) !== previous.applied) continue;
      if (previous.native === null) node.removeAttribute(key);
      else node.setAttribute(key, previous.native);
    }
    rowPatches.delete(node);
  }

  function hostProps(node) {
    try {
      const key = Object.keys(node).find(key => key.startsWith("__reactProps$"));
      if (!key) return null;
      const props = node[key];
      const fiber = node[`__reactFiber$${key.slice("__reactProps$".length)}`];
      const committed = new WeakMap();
      return [fiber, fiber?.alternate].some(branch => branch && current(branch, committed) === true && branch.memoizedProps === props) ? props : null;
    } catch { return null; }
  }

  function rowSemantics(props) {
    const fields = { role: "role", tabindex: "tabIndex", "aria-label": "aria-label",
      "aria-labelledby": "aria-labelledby", "aria-expanded": "aria-expanded" };
    const values = {};
    for (const [attribute, key] of Object.entries(fields)) {
      const value = props[key];
      values[attribute] = value == null ? null : ["string", "boolean", "number"].includes(typeof value) ? String(value) : null;
    }
    return values;
  }

  function refreshRowSemantics(row, props) {
    const state = rowStates.get(row);
    if (!state || !props) return;
    const latest = rowSemantics(props);
    const entries = rowPatches.get(row);
    // Removing an attribute already removed by us may produce no DOM mutation.
    // Compare only current committed primitive semantics, never React children.
    for (const [key, value] of Object.entries(latest)) {
      if (value !== state.semantics[key] && entries?.has(key)) entries.get(key).native = value;
    }
    state.semantics = latest;
  }

  function nativeRowParts(row) {
    if (!french() || location.origin !== "https://chatgpt.com" || !visible(row) ||
        !visible(row.closest(sidebarSelector)) || !visible(row.closest("[data-slate-sidebar-content]"))) return null;
    const props = hostProps(row);
    refreshRowSemantics(row, props);
    const id = row.getAttribute(projectIdAttribute);
    const label = row.getAttribute(projectLabelAttribute);
    if (!props || props.role !== "button" || props.href != null || typeof props.onClick !== "function" ||
        typeof props.onKeyDown !== "function" || !id || props[projectIdAttribute] !== id || !label ||
        nativeRowAttribute(row, "role") !== "button" || ![true, false, "true", "false"].includes(props["aria-expanded"]) ||
        !["true", "false"].includes(nativeRowAttribute(row, "aria-expanded"))) return null;
    // Presentational rows must not retain global ARIA, which can cause browsers
    // to ignore role=none. Move only the demonstrated name/expansion fields.
    if (row.getAttributeNames().some(key => key.startsWith("aria-") && !["aria-label", "aria-labelledby", "aria-expanded"].includes(key))) return null;
    const children = Array.from(row.children).filter(child => child !== rowStates.get(row)?.toggle);
    if (children.length !== 2 || children.some(child => child.tagName !== "DIV")) return null;
    const [caption, actions] = children;
    const captionRole = nativeRowAttribute(caption, "role");
    if (captionRole !== null && captionRole !== "none" && captionRole !== "presentation") return null;
    if (!visible(caption) || caption.querySelector('button, a[href], input, textarea, select, [contenteditable="true"], [role="button"], [role="link"], [role="checkbox"], [role="combobox"], [role="menuitem"], [tabindex]')) return null;
    if (caption.querySelector('button[aria-haspopup="menu"]') || actions.querySelectorAll('button[aria-haspopup="menu"]').length !== 1) return null;
    const captionPropsKey = Object.keys(caption).find(key => key.startsWith("__reactProps$"));
    if (captionPropsKey && (typeof caption[captionPropsKey]?.onClick === "function" || typeof caption[captionPropsKey]?.onKeyDown === "function")) return null;
    return { caption, actions, semantics: rowSemantics(props), label: nativeRowAttribute(row, "aria-label") || label,
      labelledBy: nativeRowAttribute(row, "aria-labelledby"), expanded: nativeRowAttribute(row, "aria-expanded") };
  }

  function cleanupNativeRow(row, state) {
    refreshRowSemantics(row, hostProps(row));
    row.removeEventListener("click", state.guardClick, true);
    state.toggle.removeEventListener("click", state.toggleClick);
    state.toggle.removeEventListener("keydown", state.guardKey);
    state.toggle.removeEventListener("keyup", state.guardKey);
    state.toggle.remove();
    if (state.chevron) restoreRowAttributes(state.chevron);
    restoreRowAttributes(state.caption);
    restoreRowAttributes(row);
    rowStates.delete(row);
  }

  function updateNativeRows() {
    for (const ref of rowRefs) {
      const row = ref.deref();
      if (!row?.isConnected) {
        if (row && rowStates.has(row)) cleanupNativeRow(row, rowStates.get(row));
        if (row) rowTracked.delete(row);
        rowRefs.delete(ref);
      }
    }
    const sidebar = document.querySelector(sidebarSelector);
    const rows = sidebar ? sidebar.querySelectorAll(projectRowSelector) : [];
    const eligible = new Set();
    for (const row of rows) {
      let state = rowStates.get(row);
      const parts = nativeRowParts(row);
      if (!parts) { if (state) cleanupNativeRow(row, state); continue; }
      if (state && (state.caption !== parts.caption || state.actions !== parts.actions || state.toggle.parentElement !== row)) { cleanupNativeRow(row, state); state = null; }
      if (!state) {
        const caption = parts.caption;
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.setAttribute("data-chatgpt-a11y-project-toggle", "true");
        toggle.style.cssText = "flex-shrink:0;width:28px;min-height:28px;padding:0;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer";
        // Keep the activation/default keyboard path of a real HTML button.
        // Do not let ancestor drag/press handlers interpret its keys as theirs.
        const guardKey = event => {
          if (stopped || event.target !== toggle || event.currentTarget !== toggle ||
              !["Enter", " "].includes(event.key) || event.isComposing || event.keyCode === 229 ||
              event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
          event.stopPropagation();
          if (event.repeat) event.preventDefault();
        };
        const toggleClick = event => {
          event.stopPropagation();
          if (stopped || event.defaultPrevented || event.button !== 0 ||
              event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
          const latest = nativeRowParts(row);
          const owned = rowStates.get(row);
          if (!latest || latest.caption !== caption || owned?.toggle !== toggle) {
            const stale = rowStates.get(row);
            if (stale) cleanupNativeRow(row, stale);
            schedule(); return;
          }
          // Use the verified native ROW click contract, without changing props,
          // creating a chat or shifting focus to the now-static caption.
          owned.relay = true;
          try { row.click(); } finally { owned.relay = false; }
          updateNativeRows();
          schedule();
        };
        const guardClick = event => {
          const owned = rowStates.get(row);
          if (stopped || !owned || owned.relay && event.target === row) return;
          const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
          if (target && owned.actions.contains(target) && target.closest('button, a[href], input, select, textarea, [role="button"], [role="link"]')) return;
          // Caption and row background are no longer disclosure controls.
          if (target !== toggle && !toggle.contains(target)) event.stopPropagation();
        };
        const icon = caption.firstElementChild;
        const chevron = icon?.tagName === "DIV" && !icon.textContent.trim() &&
          icon.querySelectorAll("svg").length === 1 ? icon : null;
        state = { caption, actions: parts.actions, toggle, toggleClick, guardKey, guardClick, chevron, relay: false, semantics: parts.semantics };
        rowStates.set(row, state);
        row.addEventListener("click", guardClick, true);
        toggle.addEventListener("click", toggleClick);
        toggle.addEventListener("keydown", guardKey);
        toggle.addEventListener("keyup", guardKey);
        row.appendChild(toggle);
        if (!rowTracked.has(row)) { rowTracked.add(row); rowRefs.add(new WeakRef(row)); }
      }
      eligible.add(row);
      patchRowAttribute(parts.caption, "role", null);
      patchRowAttribute(parts.caption, "tabindex", null);
      patchRowAttribute(parts.caption, "aria-label", null);
      patchRowAttribute(parts.caption, "aria-labelledby", null);
      patchRowAttribute(parts.caption, "aria-expanded", null);
      const expanded = parts.expanded === "true";
      const toggleName = `${expanded ? "Masquer" : "Afficher"} les chats du projet`;
      if (state.toggle.getAttribute("aria-label") !== toggleName) state.toggle.setAttribute("aria-label", toggleName);
      if (state.toggle.getAttribute("aria-expanded") !== parts.expanded) state.toggle.setAttribute("aria-expanded", parts.expanded);
      if (state.toggle.title !== toggleName) state.toggle.title = toggleName;
      const glyph = expanded ? "▾" : "▸";
      if (state.toggle.textContent !== glyph) state.toggle.textContent = glyph;
      if (state.chevron) {
        const original = nativeRowAttribute(state.chevron, "style") || "";
        patchRowAttribute(state.chevron, "style", `${original};display:none`);
      }
      patchRowAttribute(row, "role", "none");
      patchRowAttribute(row, "tabindex", null);
      patchRowAttribute(row, "aria-label", null);
      patchRowAttribute(row, "aria-labelledby", null);
      patchRowAttribute(row, "aria-expanded", null);
    }
    for (const ref of rowRefs) {
      const row = ref.deref();
      if (row && !eligible.has(row) && rowStates.has(row)) cleanupNativeRow(row, rowStates.get(row));
    }
  }

  function replace(node, key, value) {
    const current = node.getAttribute(key);
    if (current === value) return;
    let entries = translated.get(node);
    if (!entries) { entries = new Map(); translated.set(node, entries); changedRefs.add(new WeakRef(node)); }
    const previous = entries.get(key);
    entries.set(key, { native: previous?.applied === current ? previous.native : current, applied: value });
    node.setAttribute(key, value);
  }

  function restore(node, key) {
    const entries = translated.get(node);
    const previous = entries?.get(key);
    if (!previous) return;
    if (node.getAttribute(key) === previous.applied) {
      if (previous.native === null) node.removeAttribute(key);
      else node.setAttribute(key, previous.native);
    }
    entries.delete(key);
  }

  function updatePins() {
    const scope = french() && location.pathname === "/projects";
    for (const ref of changedRefs) {
      const node = ref.deref();
      if (!node?.isConnected) { changedRefs.delete(ref); continue; }
      if (!scope || !node.closest('main, [role="main"]')) { restore(node, "aria-label"); restore(node, "title"); }
    }
    if (!scope) return;
    for (const button of document.querySelectorAll('main button[aria-label], [role="main"] button[aria-label]')) {
      const label = button.getAttribute("aria-label");
      const translation = label === "Pin project" ? "Épingler le projet" : label === "Unpin project" ? "Désépingler le projet" : null;
      if (!translation) continue;
      replace(button, "aria-label", translation);
      if (button.getAttribute("title") === label) replace(button, "title", translation);
    }
  }

  function update() { timer = null; if (stopped) return; updateSidebar(); updateNativeRows(); updatePins(); }
  function schedule() { if (!stopped && timer === null) timer = setTimeout(update, 100); }
  const relevant = node => {
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    return element && (element.matches(`${sidebarSelector}, ${ownedSelector}`) || element.closest(sidebarSelector) ||
      element.querySelector(`${sidebarSelector}, ${ownedSelector}`) ||
      (location.pathname === "/projects" && (element.closest('main, [role="main"]') || element.querySelector('main, [role="main"]'))));
  };
  const observer = new MutationObserver(records => {
    if (stopped) return;
    // Native expansion/name commits should update the transferred semantics in
    // the observer microtask, before the normal sidebar layout batch.
    if (records.some(record => record.target === document.documentElement && record.attributeName === "lang" ||
      (record.type === "attributes" && record.target.nodeType === 1 && record.target.matches(projectRowSelector)) ||
      (record.type === "childList" && record.target.nodeType === 1 && record.target.closest(projectRowSelector)))) updateNativeRows();
    // Newly mounted sidebar/project widgets qualify in this observer delivery;
    // subsequent layout, route and click refreshes retain their batching.
    if (records.some(record => Array.from(record.addedNodes || []).some(relevant))) {
      if (timer !== null) clearTimeout(timer);
      update();
    } else if (records.some(record => record.target === document.documentElement || relevant(record.target) ||
      Array.from(record.removedNodes || []).some(relevant))) schedule();
  });
  // Observe row metadata additions too: any newly introduced global ARIA must
  // restore the native row immediately, rather than invalidate role=none.
  observer.observe(document, { childList: true, subtree: true, attributes: true });
  window.addEventListener("popstate", schedule);
  window.addEventListener("hashchange", schedule);
  const linkClick = event => {
    if (event.target?.closest?.("a[href]")) schedule();
  };
  document.addEventListener("click", linkClick, true);
  const api = { version: 3, nativeRows: true, separateToggle: true, active: true, stop() {
    if (stopped) return;
    stopped = true; api.active = false;
    observer.disconnect();
    if (timer !== null) clearTimeout(timer);
    timer = null;
    window.removeEventListener("popstate", schedule);
    window.removeEventListener("hashchange", schedule);
    document.removeEventListener("click", linkClick, true);
    for (const button of document.querySelectorAll(ownedSelector)) button.remove();
    for (const ref of rowRefs) {
      const row = ref.deref();
      if (row && rowStates.has(row)) cleanupNativeRow(row, rowStates.get(row));
    }
    rowRefs.clear();
    for (const ref of changedRefs) {
      const node = ref.deref();
      if (node) { restore(node, "aria-label"); restore(node, "title"); }
    }
    changedRefs.clear();
    if (window[currentMarker] === api) delete window[currentMarker];
  } };
  window[marker] = api;
  window[currentMarker] = api;
  update();
})();
