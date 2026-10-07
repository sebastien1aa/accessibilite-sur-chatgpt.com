/* Native dU separates Python items from filtered dK reasoning when no streaming
 * region exists; dK also has a standalone prefix presentation. Group only those
 * verified sibling wrappers. Native nodes, handlers, identities and order stay.
 * No tool text, output, summary or conversation data is read or stored.
 */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.analysis-details.v4");
  if (window[marker]) return;
  const previous = window[Symbol.for("chatgpt-navigation-continue.analysis-details.v3")];
  if (typeof previous?.stop === "function") previous.stop();
  const turnSelector = "[data-turn-key]";
  const headerSelector = '[class~="group/activity-header"]';
  const ownedAttribute = "data-chatgpt-analysis-details";
  const states = new WeakMap(), tracked = new Set(), refusedTurns = new WeakSet();
  let route = location.pathname, timer = null, active = true;
  let rootCache = new WeakMap(), principalCache = new WeakMap(), toolCache = new WeakMap();
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");

  function committed(fiber) {
    if (!fiber) return false;
    const path = [], seen = new Set();
    let root = fiber, result = false;
    for (let depth = 0; root && depth < 512; depth++) {
      if (rootCache.has(root)) { result = rootCache.get(root); break; }
      if (seen.has(root)) break;
      seen.add(root); path.push(root);
      if (!root.return) { result = root.stateNode?.current === root; break; }
      root = root.return;
    }
    for (const node of path) rootCache.set(node, result);
    return result;
  }
  function resetCaches() { rootCache = new WeakMap(); principalCache = new WeakMap(); toolCache = new WeakMap(); }
  function hostFiber(node) {
    try {
      const key = Object.keys(node).find(key => key.startsWith("__reactFiber$"));
      const fiber = key && node[key];
      if (committed(fiber)) return fiber;
      return committed(fiber?.alternate) ? fiber.alternate : null;
    } catch { return null; }
  }
  function rendererProps(props) {
    return props && Array.isArray(props.items) && props.items.length <= 1000 &&
      Object.hasOwn(props, "completed") && Object.hasOwn(props, "hasFinalAssistantStarted") &&
      Object.hasOwn(props, "streamingParentRegion");
  }
  function eligibleRenderer(props) {
    return props.completed === true && props.hasFinalAssistantStarted === true &&
      (props.streamingParentRegion == null || props.streamingParentRegion.kind === "prefix") &&
      props.items.some(item => item?.type === "reasoning") &&
      props.items.some(item => item?.type === "chatgpt-python-execution");
  }
  function context(header, principal) {
    const cache = principal ? principalCache : toolCache;
    if (cache.has(header)) return cache.get(header);
    const result = inspectContext(header, principal);
    cache.set(header, result);
    return result;
  }
  function inspectContext(header, principal) {
    try {
      let fiber = hostFiber(header), signature = !principal, itemType = null, region, regionSeen = false;
      const renderers = new Set();
      if (!fiber) return null;
      for (let depth = 0; fiber && depth < 50; depth++, fiber = fiber.return) {
        const props = fiber.memoizedProps;
        if (principal && !signature && props && Object.hasOwn(props, "canExpand")) {
          if (props.canExpand !== true || !Object.hasOwn(props, "summary") || !Object.hasOwn(props, "shouldAnimateInitialCollapse")) return null;
          signature = true;
        }
        if (!principal && itemType === null && props && Object.hasOwn(props, "item")) {
          itemType = props.item?.type ?? "other";
          if (itemType !== "chatgpt-python-execution") return null;
        }
        if (rendererProps(props)) {
          if (!signature || props.completed !== true || props.hasFinalAssistantStarted !== true ||
              props.streamingParentRegion != null && props.streamingParentRegion.kind !== "prefix" ||
              !principal && itemType !== "chatgpt-python-execution") return null;
          // A filtered inner dK may contain reasoning/search only, while its
          // shared outer dU also contains standalone Python. Continue within
          // the same prefix object or the same no-region branch, never past
          // a contradictory phase/region. Null and undefined are equivalent
          // in the native `null != streamingParentRegion` branch test.
          const nextRegion = props.streamingParentRegion ?? null;
          if (regionSeen && region !== nextRegion) return null;
          region = nextRegion; regionSeen = true;
          if (!eligibleRenderer(props)) continue;
          if (principal) return { renderer: fiber };
          renderers.add(fiber);
        }
      }
      if (!principal && renderers.size) return { renderers };
    } catch { /* Missing or changing native context: leave the native UI. */ }
    return null;
  }
  function publicReference(button) {
    let reference = button.getAttribute("aria-labelledby");
    if (reference) return true;
    // The reasoning module may replace aria-labelledby with its action label.
    // Inspect only the same public host property, never label/summary content.
    try {
      const key = Object.keys(button).find(key => key.startsWith("__reactProps$"));
      reference = key && button[key]?.["aria-labelledby"];
      return typeof reference === "string" && reference.trim().length > 0;
    } catch { return false; }
  }
  function disclosure(header) {
    const buttons = Array.from(header.children).filter(node => node.tagName === "BUTTON" &&
      ["true", "false"].includes(node.getAttribute("aria-expanded")) && !node.hasAttribute("aria-haspopup") && publicReference(node));
    return buttons.length === 1 ? buttons[0] : null;
  }
  function toolWrapper(wrapper, turn, renderer) {
    if (wrapper.tagName !== "DIV" || wrapper.closest(turnSelector) !== turn ||
        wrapper.querySelector('h4, [data-chatgpt-agent-turn-start], [role="textbox"], form, textarea')) return false;
    const headers = wrapper.querySelectorAll(headerSelector);
    if (headers.length !== 1 || !disclosure(headers[0])) return false;
    const candidates = context(headers[0], false)?.renderers;
    if (!candidates) return false;
    return Array.from(candidates).some(candidate => sameRenderer(candidate, renderer) &&
      eligibleRenderer(candidate.memoizedProps) && eligibleRenderer(renderer.memoizedProps) &&
      (candidate.memoizedProps.streamingParentRegion ?? null) === (renderer.memoizedProps.streamingParentRegion ?? null));
  }
  function findGroup(header) {
    const turn = header.closest(turnSelector);
    if (!turn || refusedTurns.has(turn) || !turn.closest("[data-chatgpt-conversation-selection-target]")) return null;
    const button = disclosure(header), owner = context(header, true);
    if (!button || !owner) return null;
    let principalWrapper = header;
    for (let block = header.parentElement, depth = 0; block && block !== turn && depth < 12; principalWrapper = block, block = block.parentElement, depth++) {
      if (block.tagName !== "DIV") continue;
      const tools = Array.from(block.children).filter(child => child !== principalWrapper && child.getAttribute(ownedAttribute) !== "control" && toolWrapper(child, turn, owner.renderer));
      if (!tools.length) continue;
      // One principal per block; never combine another reflection/answer.
      const principals = Array.from(block.querySelectorAll(headerSelector)).filter(candidate =>
        context(candidate, true)?.renderer === owner.renderer && disclosure(candidate));
      if (principals.length !== 1 || principals[0] !== header) return null;
      return { block, turn, header, principalWrapper, button, renderer: owner.renderer, tools };
    }
    return null;
  }
  function setOwnedAttribute(node, records, key, applied) {
    const current = node.getAttribute(key), previous = records.get(key);
    if (current === applied && previous) return;
    records.set(key, { native: previous?.applied === current ? previous.native : current, applied });
    if (current === applied) return;
    if (applied === null) node.removeAttribute(key); else node.setAttribute(key, applied);
  }
  function restoreAttributes(node, records) {
    for (const [key, entry] of records) if (node.getAttribute(key) === entry.applied) {
      if (entry.native === null) node.removeAttribute(key); else node.setAttribute(key, entry.native);
    }
    records.clear();
  }
  function hideTool(node, entry) {
    setOwnedAttribute(node, entry.attributes, "hidden", "");
    setOwnedAttribute(node, entry.attributes, "inert", "");
    const value = node.style.getPropertyValue("display"), priority = node.style.getPropertyPriority("display");
    if (!entry.display || value !== entry.display.applied || priority !== entry.display.appliedPriority) {
      entry.display = { value, priority, applied: "none", appliedPriority: "important" };
    }
    if (value !== "none" || priority !== "important") node.style.setProperty("display", "none", "important");
  }
  function showTool(node, entry) {
    restoreAttributes(node, entry.attributes);
    const previous = entry.display;
    if (previous && node.style.getPropertyValue("display") === previous.applied && node.style.getPropertyPriority("display") === previous.appliedPriority) {
      if (previous.value) node.style.setProperty("display", previous.value, previous.priority); else node.style.removeProperty("display");
    }
    entry.display = null;
  }
  function cleanup(state) {
    for (const [node, entry] of state.tools) {
      showTool(node, entry);
      restoreAttributes(node, entry.marker);
    }
    state.tools.clear();
    if (state.control.contains(document.activeElement) && state.button.isConnected) state.button.focus({ preventScroll: true });
    state.control.remove();
    states.delete(state.block);
  }
  function sameRenderer(a, b) { return a === b || a?.alternate === b || b?.alternate === a; }
  function update(state, group) {
    const expected = new Set(group.tools);
    for (const [node, entry] of state.tools) if (!expected.has(node)) {
      showTool(node, entry); restoreAttributes(node, entry.marker); state.tools.delete(node);
    }
    for (const node of group.tools) if (!state.tools.has(node)) {
      const entry = { attributes: new Map(), marker: new Map(), display: null };
      setOwnedAttribute(node, entry.marker, ownedAttribute, "tool");
      state.tools.set(node, entry);
    }
    state.renderer = group.renderer;
    const outerExpanded = group.button.getAttribute("aria-expanded") === "true";
    const hide = !outerExpanded || !state.expanded;
    if (hide && group.tools.some(node => node.contains(document.activeElement)) || !outerExpanded && state.control.contains(document.activeElement)) {
      (outerExpanded ? state.control : group.button).focus({ preventScroll: true });
    }
    for (const [node, entry] of state.tools) if (hide) hideTool(node, entry); else showTool(node, entry);
    const label = state.expanded ? "Masquer les détails des analyses" : "Afficher les détails des analyses";
    if (state.control.textContent !== label) state.control.textContent = label;
    state.control.setAttribute("aria-expanded", String(state.expanded));
    state.control.hidden = !outerExpanded;
    state.control.toggleAttribute("inert", !outerExpanded);
    if (!outerExpanded) state.control.style.setProperty("display", "none", "important"); else state.control.style.removeProperty("display");
    if (state.control.parentElement !== group.block || state.control.nextSibling !== group.tools[0]) group.block.insertBefore(state.control, group.tools[0]);
  }
  function create(group) {
    const control = document.createElement("button");
    control.type = "button";
    control.setAttribute(ownedAttribute, "control");
    const state = { ...group, route: location.pathname, control, expanded: false, tools: new Map() };
    control.addEventListener("click", () => {
      if (!active) return;
      resetCaches();
      const current = findGroup(state.header);
      if (!french() || state.route !== location.pathname || !current || current.block !== state.block || !sameRenderer(current.renderer, state.renderer)) { cleanup(state); return; }
      state.expanded = !state.expanded;
      update(state, current);
    });
    states.set(group.block, state);
    if (!Array.from(tracked).some(ref => ref.deref() === group.block)) tracked.add(new WeakRef(group.block));
    return state;
  }
  function flush() {
    timer = null;
    if (!active) return;
    resetCaches();
    if (route !== location.pathname) {
      route = location.pathname;
      for (const ref of tracked) { const state = states.get(ref.deref()); if (state) { refusedTurns.add(state.turn); cleanup(state); } }
    }
    const live = new Set();
    if (french()) for (const header of document.querySelectorAll(headerSelector)) {
      const group = findGroup(header);
      if (!group) continue;
      let state = states.get(group.block);
      if (state && (state.header !== group.header || state.button !== group.button || !sameRenderer(state.renderer, group.renderer))) { cleanup(state); state = null; }
      if (!state) state = create(group);
      update(state, group); live.add(group.block);
    }
    for (const ref of tracked) {
      const block = ref.deref(), state = block && states.get(block);
      if (!block || !state) tracked.delete(ref);
      else if (!block.isConnected || !live.has(block)) { cleanup(state); tracked.delete(ref); }
    }
  }
  function schedule() { if (active && timer === null) timer = setTimeout(flush, 100); }
  const observer = new MutationObserver(records => {
    if (!active) return;
    let needed = false;
    for (const record of records) {
      if (record.target?.getAttribute?.(ownedAttribute) === "control") continue;
      if (record.attributeName === "data-turn-key") {
        const turn = record.target;
        for (const ref of tracked) { const state = states.get(ref.deref()); if (state?.turn === turn) { refusedTurns.add(turn); cleanup(state); } }
      }
      if (route !== location.pathname || record.target === document.documentElement && record.attributeName === "lang" ||
          record.target?.closest?.(turnSelector) || record.type === "childList") needed = true;
    }
    const newHeaders = records.some(record => Array.from(record.addedNodes || []).some(node =>
      node.nodeType === 1 && !node.hasAttribute(ownedAttribute) &&
      (node.matches(headerSelector) || node.querySelector(headerSelector))));
    // Newly committed groups qualify before the next task; ordinary detail
    // content/layout updates retain the existing slower batch.
    if (newHeaders) {
      if (timer !== null) clearTimeout(timer);
      flush();
    } else if (needed) schedule();
  });
  observer.observe(document, { subtree: true, childList: true, attributes: true,
    attributeFilter: ["aria-expanded", "aria-labelledby", "lang", "hidden", "inert", "style", "class", "data-turn-key"] });
  window.addEventListener("popstate", schedule);
  window.addEventListener("hashchange", schedule);
  function stop() {
    if (!active) return;
    active = false;
    observer.disconnect();
    if (timer !== null) { clearTimeout(timer); timer = null; }
    window.removeEventListener("popstate", schedule);
    window.removeEventListener("hashchange", schedule);
    for (const ref of tracked) { const state = states.get(ref.deref()); if (state) cleanup(state); }
    tracked.clear(); resetCaches();
  }
  window[marker] = Object.freeze({ stop });
  flush();
})();
