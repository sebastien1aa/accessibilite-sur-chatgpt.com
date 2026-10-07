/* Keep documentary sidebar lists and conversation rows static during ordinary
 * navigation. Ordinary native focus and DnD retain the exact container lease.
 * An explicitly activated nested pager instead keeps focus near the old
 * footer, then continues at the first new chat. No nodes or native handlers
 * are replaced. This instance-only bridge runs in the page's MAIN world. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.sidebar-list.v3");
  const currentMarker = Symbol.for("chatgpt-navigation-continue.sidebar-list.current");
  if (window[marker]?.active) return;
  const previous = window[currentMarker];
  previous?.stop?.();
  for (const version of [1, 2]) {
    const legacy = window[Symbol.for(`chatgpt-navigation-continue.sidebar-list.v${version}`)];
    if (legacy !== previous) legacy?.stop?.();
  }
  const sidebarSelector = "#app-shell-sidebar";
  const contentSelector = "[data-slate-sidebar-content]";
  const widgetRoles = new Set(["listbox", "menu", "menubar", "tree", "treegrid", "grid", "application", "dialog", "textbox", "combobox"]);
  const entries = new WeakMap();
  const refs = new Set();
  const ownWrites = new WeakMap();
  const replacedFocus = new WeakSet();
  const pagination = new WeakMap();
  const paginationContexts = new Set();
  let stopped = false;

  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");
  function conversationRoute(link) {
    const href = (link.getAttribute("href") || "").replace(/^https:\/\/chatgpt\.com(?=\/)/, "");
    const role = link.getAttribute("role");
    return role === null || role === "link" ?
      /^(\/(?:c\/[^/?#]+|g\/[^/?#]+\/c\/[^/?#]+))\/?(?:[?#].*)?$/.exec(href)?.[1] || null : null;
  }
  function conversationRoutes(node) {
    const routes = new Set();
    for (const link of node.querySelectorAll("a[href]")) {
      // The closest row must own the link: a project title containing a nested
      // conversation list is not itself a conversation row.
      if (link.closest('[role="listitem"]') !== node) continue;
      const path = conversationRoute(link);
      if (path) routes.add(path);
    }
    return routes;
  }
  function conversationRow(node) {
    if (node.tagName !== "DIV" || node.hasAttribute("data-app-action-sidebar-project-row") ||
        !node.closest('[role="list"]')) return false;
    // A chat can repeat its native link in a preview. Only distinct conversation
    // routes make the container ambiguous, not several anchors to the same chat.
    return conversationRoutes(node).size === 1;
  }
  function inScope(node) {
    if (node?.nodeType !== 1) return false;
    const sidebar = node.closest(sidebarSelector);
    const content = node.closest(contentSelector);
    const role = node.getAttribute("role");
    if (!french() || !node.isConnected || !(role === "list" || role === "listitem" && conversationRow(node)) ||
        !sidebar || !content || !sidebar.contains(content)) return false;
    for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
      const roles = (ancestor.getAttribute("role") || "").split(/\s+/);
      const editable = ancestor.getAttribute("contenteditable");
      if (roles.some(role => widgetRoles.has(role)) || ["INPUT", "TEXTAREA", "SELECT"].includes(ancestor.tagName) ||
          editable !== null && editable.toLowerCase() !== "false") return false;
      if (ancestor === sidebar) break;
    }
    return true;
  }

  // Read only current committed host primitives. React can remove an already
  // suppressed attribute without producing a mutation record. Never retain
  // props, children, fibers or a native callback as a semantic baseline.
  function hostBranch(node) {
    try {
      const key = Object.keys(node).find(key => key.startsWith("__reactProps$"));
      if (!key) return null;
      const props = node[key];
      const fiber = node[`__reactFiber$${key.slice("__reactProps$".length)}`];
      return [fiber, fiber?.alternate].find(branch => {
        if (!branch || branch.memoizedProps !== props) return false;
        let root = branch;
        for (let depth = 0; root.return && depth < 512; depth++) root = root.return;
        return !root.return && root.stateNode?.current === root;
      }) || null;
    } catch { return null; }
  }
  function semantics(node) {
    try {
      const props = hostBranch(node)?.memoizedProps;
      if (!props) return null;
      const primitive = value => value == null ? null :
        ["string", "boolean", "number"].includes(typeof value) ? String(value) : null;
      return { role: primitive(props.role), tabindex: primitive(props.tabIndex) };
    } catch { return null; }
  }
  function refresh(node, entry) {
    const latest = semantics(node);
    if (!latest) return;
    if (!entry.semantics || latest.tabindex !== entry.semantics.tabindex) entry.native = latest.tabindex;
    entry.semantics = latest;
  }

  function visible(node) {
    if (!node?.isConnected || node.closest('[hidden], [inert], [aria-hidden="true"]') || !node.getClientRects().length) return false;
    const style = window.getComputedStyle?.(node);
    return !style || style.display !== "none" && style.visibility !== "hidden" && style.visibility !== "collapse";
  }
  function enabledButton(node) {
    return node?.tagName === "BUTTON" && visible(node) && !node.hasAttribute("disabled") &&
      node.getAttribute("aria-disabled") !== "true" && [null, "button"].includes(node.getAttribute("role"));
  }
  function paginationState(list) {
    try {
      const candidates = [];
      let branch = hostBranch(list)?.return;
      for (let depth = 0; branch && depth < 40; depth++, branch = branch.return) {
        const props = branch.memoizedProps;
        if (!props || props.paginationControlsAlignment !== "nested" ||
            ![undefined, "button"].includes(props.paginationMode) || !Array.isArray(props.items) ||
            typeof props.getKey !== "function" || typeof props.renderRow !== "function" ||
            typeof props.isLoadingMore !== "boolean" || typeof props.hasMoreItems !== "boolean" ||
            !(typeof props.onLoadMore === "function" || props.onLoadMore === undefined && props.hasMoreItems === false)) continue;
        candidates.push({ loading: props.isLoadingMore, more: props.hasMoreItems });
      }
      // The last page removes onLoadMore from the same native owner. Arming
      // still requires more=true and the callback; completion permits only
      // the observed undefined callback when more=false.
      // Only the known, current JVh owner is accepted. No callbacks, props,
      // fibers, item data or React state are retained or changed by this bridge.
      return candidates.length === 1 ? candidates[0] : null;
    } catch { return null; }
  }
  function chatRows(list) {
    return Array.from(list.querySelectorAll('[role="listitem"]')).filter(row =>
      row.closest('[role="list"]') === list && conversationRow(row) && inScope(row) && visible(row));
  }
  function primaryLink(row) {
    return Array.from(row.querySelectorAll("a[href]")).find(link =>
      link.closest('[role="listitem"]') === row && conversationRoute(link) &&
      link.getAttribute("tabindex") !== "-1" && visible(link)) || null;
  }
  function rowActions(row) {
    const buttons = Array.from(row.querySelectorAll("button")).filter(button =>
      button.closest('[role="listitem"]') === row && enabledButton(button) &&
      button.getAttribute("aria-haspopup") === "menu" && typeof hostBranch(button)?.memoizedProps.onClick === "function");
    return buttons.length === 1 ? buttons[0] : null;
  }
  function nativePager(list, moreOnly = false) {
    const buttons = Array.from(list.querySelectorAll("button")).filter(button => {
      const footer = button.closest('[role="listitem"]');
      const label = (button.getAttribute("aria-label") || button.textContent || "").replace(/\s+/g, " ").trim();
      return footer?.parentElement === list && footer === list.lastElementChild && !conversationRow(footer) &&
        button.closest('[role="list"]') === list && enabledButton(button) &&
        !button.hasAttribute("aria-haspopup") && typeof hostBranch(button)?.memoizedProps.onClick === "function" &&
        (moreOnly ? /^afficher plus$/i : /^afficher (?:plus|moins)$/i).test(label);
    });
    return buttons.length === 1 ? buttons[0] : null;
  }
  const route = () => window.location?.href || "";
  function dropPagination(context) {
    context.live = false;
    paginationContexts.delete(context);
    if (pagination.get(context.list) === context) pagination.delete(context.list);
  }
  function cancelPagination(context) {
    // Keep only a cancellation guard until the current fetch settles: an
    // already queued native M(false) must not take focus away from user input.
    if (!context.live || context.cancelled) return;
    context.cancelled = true;
    queueMicrotask(() => { if (context.live && !stopped) updatePagination(); });
  }
  function firstNewLink(context, rows) {
    const row = rows.find(row => !context.routes.has(conversationRoutes(row).values().next().value));
    return row && primaryLink(row);
  }
  function allowedPaginationFocus(context, node, pager) {
    return node === document.body || node === context.initialActive || context.source.contains(node) ||
      context.holding?.contains(node) || pager?.contains(node);
  }
  function finishPagination(context) {
    context.finishQueued = false;
    if (stopped || !context.live) return;
    if (context.cancelled) { updatePagination(); return; }
    const state = paginationState(context.list);
    if (!inScope(context.list) || route() !== context.route || !state) { dropPagination(context); return; }
    if (state.loading) { context.sawLoading = true; return; }
    const rows = chatRows(context.list);
    const newLink = firstNewLink(context, rows);
    const pager = nativePager(context.list);
    if (!allowedPaginationFocus(context, document.activeElement, pager)) { cancelPagination(context); return; }
    const target = newLink || pager || (enabledButton(context.holding) ? context.holding : null);
    dropPagination(context);
    if (target && document.activeElement !== target) target.focus({ preventScroll: true });
  }
  function updatePagination() {
    for (const context of paginationContexts) {
      const list = context.list;
      const entry = entries.get(list);
      const state = paginationState(list);
      if (stopped || !entry || entry.role !== "list" || !inScope(list) || route() !== context.route || !state) {
        dropPagination(context); continue;
      }
      if (state.loading) { context.sawLoading = true; continue; }
      if (context.cancelled) {
        if (!context.finishQueued) {
          context.finishQueued = true;
          queueMicrotask(() => {
            context.finishQueued = false;
            if (!stopped && context.live && paginationState(list)?.loading === false) dropPagination(context);
          });
        }
        continue;
      }
      const progressed = context.sawLoading || !context.source.isConnected || firstNewLink(context, chatRows(list));
      if (!progressed) continue;
      if (!context.finishQueued) {
        context.finishQueued = true;
        // Run behind the M queued by the native click. Otherwise its new pager
        // could overwrite our continuation at the first newly loaded chat.
        queueMicrotask(() => finishPagination(context));
      }
    }
  }
  function redirectPaginationFocus(list, args) {
    const context = pagination.get(list);
    const options = args[0];
    if (!context?.live || args.length !== 1 || !options || typeof options !== "object" ||
        Object.keys(options).length !== 1 || Object.getOwnPropertyDescriptor(options, "preventScroll")?.value !== true) return false;
    const state = paginationState(list);
    if (!state || route() !== context.route) { dropPagination(context); return false; }
    if (context.cancelled) return true;
    const target = context.holding;
    if (!enabledButton(target) || target.closest('[role="list"]') !== list ||
        !inScope(target.closest('[role="listitem"]'))) { dropPagination(context); return false; }
    const pager = nativePager(list);
    if (!allowedPaginationFocus(context, document.activeElement, pager)) { cancelPagination(context); return true; }
    context.sawLoading ||= state.loading;
    context.redirected = true;
    if (document.activeElement !== target) Reflect.apply(target.focus, target, args);
    return true;
  }
  function onPaginationClick(event) {
    const button = event.target?.closest?.("button");
    for (const context of paginationContexts) if (!context.source.contains(event.target)) cancelPagination(context);
    if (stopped || !button || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    const list = button.closest('[role="list"]');
    const entry = list && entries.get(list);
    drain(); if (entry) refresh(list, entry);
    if (!entry || entry.role !== "list" || !valid(list, entry) || nativePager(list, true) !== button) return;
    const current = pagination.get(list);
    if (current?.live && current.source === button) return;
    const state = paginationState(list);
    const rows = state && !state.loading && state.more ? chatRows(list) : [];
    const holding = rows.length && rowActions(rows[rows.length - 1]);
    if (!holding) return;
    if (current) dropPagination(current);
    const context = { list, source: button, holding, route: route(), initialActive: document.activeElement,
      routes: new Set(rows.map(row => conversationRoutes(row).values().next().value)),
      live: true, cancelled: false, sawLoading: false, redirected: false, finishQueued: false };
    pagination.set(list, context); paginationContexts.add(context);
    // Let the real click run exactly once; we never relay or replace onClick.
    queueMicrotask(() => {
      if (!context.live || stopped) return;
      if (event.defaultPrevented) { dropPagination(context); return; }
      updatePagination();
    });
  }
  function onPaginationFocus(event) {
    for (const context of paginationContexts) {
      if (context.cancelled || event.target === document.body || context.source.contains(event.target) ||
          context.holding?.contains(event.target) || nativePager(context.list)?.contains(event.target)) continue;
      cancelPagination(context);
    }
  }
  function onPaginationInput(event) {
    for (const context of paginationContexts) {
      if (event.type === "pointerdown" && context.source.contains(event.target)) continue;
      cancelPagination(context);
    }
  }
  function onPaginationRoute() {
    for (const context of paginationContexts) dropPagination(context);
  }

  // Reconstruct intermediate values, including native write/remove pairs in
  // one delivery. Every own transition has an oldValue and a new value; a
  // matching native value alone never makes a native write ours.
  function readRecords(records) {
    const values = new Map();
    const following = new Map();
    for (let i = records.length - 1; i >= 0; i--) {
      const record = records[i];
      if (record.type !== "attributes" || record.attributeName !== "tabindex") continue;
      const node = record.target;
      values.set(record, following.has(node) ? following.get(node) : node.getAttribute("tabindex"));
      following.set(node, record.oldValue);
    }
    for (const record of records) {
      if (record.type !== "attributes" || record.attributeName !== "tabindex") continue;
      const node = record.target;
      const value = values.get(record);
      const writes = ownWrites.get(node);
      if (writes?.length && writes[0].from === record.oldValue && writes[0].to === value) {
        writes.shift();
        if (!writes.length) ownWrites.delete(node);
      } else {
        const entry = entries.get(node);
        if (entry) entry.native = value;
      }
    }
  }
  const drain = () => readRecords(observer.takeRecords());
  function write(node, entry, value) {
    drain();
    const from = node.getAttribute("tabindex");
    entry.applied = value;
    if (from === value) return;
    // Detached nodes no longer produce records in the document observer.
    if (node.isConnected) {
      const writes = ownWrites.get(node) || [];
      writes.push({ from, to: value });
      ownWrites.set(node, writes);
    }
    if (value === null) node.removeAttribute("tabindex");
    else node.setAttribute("tabindex", value);
  }

  function ownsFocus(node, entry) {
    const descriptor = Object.getOwnPropertyDescriptor(node, "focus");
    return descriptor?.value === entry.wrapper && descriptor.configurable && descriptor.writable &&
      descriptor.enumerable === entry.enumerable;
  }
  function release(node, entry) {
    if (entries.get(node) !== entry) return;
    refresh(node, entry);
    const context = pagination.get(node);
    if (context) dropPagination(context);
    node.removeEventListener("blur", entry.blur, true);
    entries.delete(node);
    refs.delete(entry.ref);
    // The latest native value and any replacement focus property win.
    if (node.getAttribute("tabindex") === entry.applied) write(node, entry, entry.native);
    if (ownsFocus(node, entry)) {
      if (entry.descriptor) Object.defineProperty(node, "focus", entry.descriptor);
      else delete node.focus;
    } else replacedFocus.add(node);
  }
  function valid(node, entry) {
    return !stopped && entries.get(node) === entry && inScope(node) && entry.native === "-1" &&
      node.getAttribute("role") === entry.role && (!entry.semantics || entry.semantics.role === entry.role) && ownsFocus(node, entry) &&
      [null, "-1"].includes(node.getAttribute("tabindex"));
  }
  function reconcile(node, entry) {
    drain();
    refresh(node, entry);
    if (!valid(node, entry)) { release(node, entry); return; }
    // Removing tabindex from an active DIV loses Chromium focus immediately.
    // There is no timeout, delayed refocus or focus transfer to a child.
    if (document.activeElement === node) return;
    write(node, entry, null);
  }
  function install(node) {
    if (replacedFocus.has(node) || !inScope(node) || node.getAttribute("tabindex") !== "-1") return;
    const primitive = semantics(node);
    const role = node.getAttribute("role");
    if (primitive && (primitive.role !== role || primitive.tabindex !== "-1")) return;
    const descriptor = Object.getOwnPropertyDescriptor(node, "focus");
    if (descriptor && (!descriptor.configurable || !("value" in descriptor) || typeof descriptor.value !== "function")) return;
    let inherited = node;
    let resolved;
    while (inherited && !resolved) {
      resolved = Object.getOwnPropertyDescriptor(inherited, "focus");
      inherited = Object.getPrototypeOf(inherited);
    }
    if (!resolved || !("value" in resolved) || typeof resolved.value !== "function") return;
    const original = resolved.value;
    const entry = { descriptor, role, native: "-1", applied: "-1", semantics: primitive,
      enumerable: descriptor?.enumerable || false, calls: 0, ref: new WeakRef(node) };
    entry.wrapper = function (...args) {
      // Borrowing this method must behave exactly like the original method.
      if (this !== node || stopped || entries.get(node) !== entry) return Reflect.apply(original, this, args);
      drain(); refresh(node, entry);
      if (!valid(node, entry)) {
        release(node, entry);
        return Reflect.apply(original, this, args);
      }
      // Only M's fallback for an explicitly activated, known nested pager is
      // redirected. Ordinary list/row focus keeps the exact native lease.
      if (entry.role === "list" && redirectPaginationFocus(node, args)) return;
      write(node, entry, "-1");
      entry.calls++;
      try { return Reflect.apply(original, this, args); }
      finally {
        entry.calls--;
        // A focusin callback may stop us or replace/recycle the container immediately.
        if (!entry.calls && !stopped && entries.get(node) === entry) reconcile(node, entry);
      }
    };
    entry.blur = event => {
      if (event.target !== node || stopped || entries.get(node) !== entry) return;
      // Target capture blur runs before the next descendant receives focus.
      reconcile(node, entry);
    };
    try {
      Object.defineProperty(node, "focus", { configurable: true, writable: true,
        enumerable: entry.enumerable, value: entry.wrapper });
    } catch { return; }
    entries.set(node, entry); refs.add(entry.ref);
    node.addEventListener("blur", entry.blur, true);
    reconcile(node, entry);
  }
  function update() {
    if (stopped) return;
    drain();
    for (const ref of refs) {
      const node = ref.deref();
      if (!node) { refs.delete(ref); continue; }
      const entry = entries.get(node);
      if (entry) reconcile(node, entry);
    }
    if (!french()) return;
    for (const sidebar of document.querySelectorAll(sidebarSelector)) {
      for (const node of sidebar.querySelectorAll('[role="list"]')) if (!entries.has(node)) install(node);
      for (const node of sidebar.querySelectorAll('[role="listitem"]')) if (!entries.has(node)) install(node);
    }
    updatePagination();
  }
  const observer = new MutationObserver(records => {
    if (stopped) return;
    readRecords(records);
    update();
  });
  observer.observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true,
    attributeFilter: ["role", "tabindex", "href", "id", "lang", "contenteditable", "aria-disabled", "disabled", "hidden", "aria-hidden", "data-slate-sidebar-content", "data-app-action-sidebar-project-row"] });
  document.addEventListener("click", onPaginationClick, true);
  document.addEventListener("focusin", onPaginationFocus, true);
  document.addEventListener("pointerdown", onPaginationInput, true);
  document.addEventListener("input", onPaginationInput, true);
  window.addEventListener("popstate", onPaginationRoute);
  window.addEventListener("hashchange", onPaginationRoute);
  const api = { version: 3, active: true, stop() {
    if (stopped) return;
    drain();
    stopped = true; api.active = false;
    onPaginationRoute();
    document.removeEventListener("click", onPaginationClick, true);
    document.removeEventListener("focusin", onPaginationFocus, true);
    document.removeEventListener("pointerdown", onPaginationInput, true);
    document.removeEventListener("input", onPaginationInput, true);
    window.removeEventListener("popstate", onPaginationRoute);
    window.removeEventListener("hashchange", onPaginationRoute);
    observer.disconnect();
    for (const ref of refs) {
      const node = ref.deref();
      const entry = node && entries.get(node);
      if (entry) release(node, entry);
    }
    refs.clear();
    if (window[currentMarker] === api) delete window[currentMarker];
  } };
  window[marker] = api;
  window[currentMarker] = api;
  update();
})();
