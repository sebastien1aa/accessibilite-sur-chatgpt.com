/* Preserve the native disclosure and reasoning DOM. Only static headings and
 * a copy of the native activity caption are added; reasoning bodies are never
 * read, cloned, logged or stored. React properties are read only. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.reasoning-accessibility.v6");
  const currentMarker = Symbol.for("chatgpt-navigation-continue.reasoning-accessibility.current");
  if (window[marker]?.active) return;
  window[currentMarker]?.stop?.();
  const turnSelector = "[data-turn-key]";
  const anchorSelector = "[data-chatgpt-agent-turn-start]";
  const headerSelector = '[class~="group/activity-header"]';
  const discoveredSelector = `${turnSelector}, ${anchorSelector}, ${headerSelector}, h4.sr-only`;
  const ownedAttribute = "data-chatgpt-reasoning-accessibility";
  const ownedV2Attribute = "data-chatgpt-reasoning-accessibility-v2";
  const headingName = "ChatGPT a dit :";
  const disclosureName = "Afficher/Masquer les détails du raisonnement";
  const states = new WeakMap();
  const tracked = new Set();
  const attributes = new WeakMap();
  const controls = new WeakMap();
  const labels = new WeakMap();
  let watched = new WeakSet();
  let queued = new WeakSet();
  let dirty = [];
  let timer = null;
  let stopped = false;
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");
  const owned = node => !!(node?.nodeType === 1 ? node : node?.parentElement)?.closest(`[${ownedAttribute}], [${ownedV2Attribute}]`);

  function setAttribute(node, key, value) {
    const current = node.getAttribute(key);
    if (current === value) return;
    let entries = attributes.get(node);
    if (!entries) { entries = new Map(); attributes.set(node, entries); }
    const previous = entries.get(key);
    entries.set(key, { native: previous?.applied === current ? previous.native : current, applied: value });
    if (value === null) node.removeAttribute(key);
    else node.setAttribute(key, value);
  }

  function restore(node, key) {
    const entries = attributes.get(node);
    const previous = entries?.get(key);
    if (!previous) return;
    if (node.getAttribute(key) === previous.applied) {
      if (previous.native === null) node.removeAttribute(key);
      else node.setAttribute(key, previous.native);
    }
    entries.delete(key);
  }

  function nativeAttribute(node, key) {
    const previous = attributes.get(node)?.get(key);
    const value = node.getAttribute(key);
    return previous?.applied === value ? previous.native : value;
  }

  function current(fiber, cache) {
    if (cache.has(fiber)) return cache.get(fiber);
    let root = fiber;
    let count = 0;
    const path = [];
    while (root?.return && count++ < 512) {
      if (cache.has(root)) {
        const result = cache.get(root);
        for (const node of path) cache.set(node, result);
        return result;
      }
      path.push(root);
      root = root.return;
    }
    const result = root?.return || !root?.stateNode?.current ? null : root.stateNode.current === root;
    for (const node of path) cache.set(node, result);
    if (root) cache.set(root, result);
    return result;
  }

  function reflectionPhase(header) {
    try {
      const key = Object.keys(header).find(key => key.startsWith("__reactFiber$"));
      if (!key) return "invalid";
      const committed = new WeakMap();
      let fiber = header[key];
      let groupFound = false;
      let principalGroup = false;
      let defaultMissing = false;
      let reasoningSeen = false;
      const phases = new Set();
      for (let depth = 0; fiber && depth < 40; depth++, fiber = fiber.return) {
        const disclosureCandidates = [];
        for (const branch of [fiber, fiber.alternate]) {
          if (!branch || current(branch, committed) !== true) continue;
          const props = branch.memoizedProps;
          if (!groupFound && props && Object.hasOwn(props, "canExpand")) {
            // Stop at the nearest disclosure component. An outer reflection
            // group must never confer its identity on a nested tool control.
            disclosureCandidates.push({ valid: props.canExpand === true &&
              (!Object.hasOwn(props, "defaultExpanded") || typeof props.defaultExpanded === "boolean") &&
              Object.hasOwn(props, "shouldAnimateInitialCollapse") && Object.hasOwn(props, "summary"),
              missing: !Object.hasOwn(props, "defaultExpanded") });
          }
          if (!Array.isArray(props?.items) || props.items.length > 1000) continue;
          // The only item field examined is its native activity type enum.
          const reasoning = props.items.some(item => item?.type === "reasoning");
          // Filtered tool/web-only item lists do not describe a reflection's
          // lifecycle and cannot contradict its actual reasoning context.
          if (!reasoning) continue;
          reasoningSeen = true;
          if (props.completed === true || props.hasFinalAssistantStarted === true) phases.add("finished");
          else if (props.completed === false && props.hasFinalAssistantStarted === false) phases.add("active");
          else phases.add("unknown");
        }
        if (!groupFound && disclosureCandidates.length) {
          groupFound = true;
          principalGroup = disclosureCandidates.every(candidate => candidate.valid);
          defaultMissing = disclosureCandidates.some(candidate => candidate.missing);
        }
      }
      if (!principalGroup || !reasoningSeen) return "invalid";
      if (phases.has("finished")) return "finished";
      if (defaultMissing) return "invalid";
      if (phases.has("active")) return "active";
      return "unknown";
    } catch { return "invalid"; }
  }

  function create(tag, kind, text) {
    const node = document.createElement(tag);
    node.setAttribute(kind === "heading" ? ownedAttribute : ownedV2Attribute, kind);
    node.textContent = text;
    return node;
  }

  function captionText(root) {
    // The root is hidden by this extension, but its native descendants retain
    // their own accessibility semantics (notably the shimmer sweep duplicate).
    const stack = Array.from(root.childNodes).reverse();
    const pieces = [];
    while (stack.length) {
      const node = stack.pop();
      if (node.nodeType === 3) pieces.push(node.nodeValue);
      else if (node.nodeType === 1 && !node.hasAttribute("hidden") && node.getAttribute("aria-hidden") !== "true") {
        stack.push(...Array.from(node.childNodes).reverse());
      }
    }
    return pieces.join("");
  }

  function cleanupGroup(state) {
    restore(state.button, "aria-label");
    restore(state.button, "aria-labelledby");
    restore(state.label, "aria-hidden");
    restore(state.label, "hidden");
    state.caption?.remove();
    state.summary?.remove();
    if (controls.get(state.button) === state) controls.delete(state.button);
    if (labels.get(state.label) === state) labels.delete(state.label);
  }

  function summaryVisibility(state) {
    const summary = state.summary;
    if (!summary) return;
    if (state.button.getAttribute("aria-expanded") === "true") {
      if (summary.hasAttribute("hidden")) summary.removeAttribute("hidden");
      if (summary.hasAttribute("aria-hidden")) summary.removeAttribute("aria-hidden");
      if (summary.style.display !== "") summary.style.display = "";
    } else {
      if (!summary.hasAttribute("hidden")) summary.setAttribute("hidden", "");
      if (summary.getAttribute("aria-hidden") !== "true") summary.setAttribute("aria-hidden", "true");
      if (summary.style.display !== "none") summary.style.display = "none";
    }
    if (summary.parentElement !== state.group || summary.nextSibling) state.group.appendChild(summary);
  }

  function cleanupTurn(state) {
    state.heading?.remove();
    state.heading = null;
    for (const ref of state.duplicates) {
      const node = ref.deref();
      if (node) { restore(node, "aria-hidden"); restore(node, "tabindex"); }
    }
    state.duplicates.clear();
    for (const [ref, groupState] of state.groups) { cleanupGroup(groupState); state.groups.delete(ref); }
  }

  function nativeHeading(node) {
    if (owned(node) || node.textContent.trim() !== headingName || node.hasAttribute("hidden") || nativeAttribute(node, "aria-hidden") === "true") return false;
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      if (parent.hasAttribute("hidden") || parent.getAttribute("aria-hidden") === "true") return false;
      if (parent.matches(turnSelector)) break;
    }
    return true;
  }

  function updateHeading(turn, anchor, state) {
    const native = Array.from(turn.querySelectorAll("h4.sr-only")).filter(node => node.closest(turnSelector) === turn && nativeHeading(node));
    const before = native.find(node => node.compareDocumentPosition(anchor) & 4 /* FOLLOWING */);
    const suppress = new Set();
    if (before) {
      state.heading?.remove();
      state.heading = null;
    } else {
      if (!state.heading) {
        // The live v1 observer already owns this stable heading. Share its node
        // during migration instead of inserting a second assistant repère.
        state.heading = Array.from(turn.querySelectorAll(`h4[${ownedAttribute}="heading"]`)).find(node =>
          node.closest(turnSelector) === turn && node.textContent === headingName) || create("h4", "heading", headingName);
        state.heading.className = "sr-only";
      }
      if (state.heading.nextSibling !== anchor || state.heading.parentElement !== anchor.parentElement) anchor.parentElement.insertBefore(state.heading, anchor);
    }
    for (const node of native) {
      if (node === before || (!before && !(anchor.compareDocumentPosition(node) & 4))) continue;
      suppress.add(node);
      setAttribute(node, "aria-hidden", "true");
      const tabIndex = nativeAttribute(node, "tabindex");
      if (tabIndex !== null && Number.isFinite(Number(tabIndex)) && Number(tabIndex) >= 0) setAttribute(node, "tabindex", "-1");
    }
    for (const ref of state.duplicates) {
      const node = ref.deref();
      if (!node || !suppress.has(node)) {
        if (node) { restore(node, "aria-hidden"); restore(node, "tabindex"); }
        state.duplicates.delete(ref);
      } else suppress.delete(node);
    }
    for (const node of suppress) state.duplicates.add(new WeakRef(node));
  }

  function labelReference(button) {
    let reference = nativeAttribute(button, "aria-labelledby");
    if (reference) return reference;
    // Host props contain the same public ARIA reference, never conversation
    // content. This fallback also recovers it after a live legacy cleanup.
    try {
      const key = Object.keys(button).find(key => key.startsWith("__reactProps$"));
      reference = key && button[key]?.["aria-labelledby"];
      if (typeof reference !== "string" || !reference.trim()) return null;
      let entries = attributes.get(button);
      if (!entries) { entries = new Map(); attributes.set(button, entries); }
      if (!entries.has("aria-labelledby")) entries.set("aria-labelledby", { native: reference, applied: button.getAttribute("aria-labelledby") });
      return reference;
    } catch { return null; }
  }

  function groupParts(header, turn) {
    if (header.closest(turnSelector) !== turn || header.tagName !== "DIV") return null;
    const buttons = Array.from(header.children).filter(node => node.tagName === "BUTTON" && node.hasAttribute("aria-expanded") && labelReference(node));
    if (buttons.length !== 1 || !["true", "false"].includes(buttons[0].getAttribute("aria-expanded"))) return null;
    const ids = labelReference(buttons[0]).trim().split(/\s+/);
    if (ids.length !== 1) return null;
    const label = document.getElementById(ids[0]);
    const group = header.parentElement;
    if (label?.tagName !== "SPAN" || label.closest(headerSelector) !== header || label.closest("button") || group?.tagName !== "DIV") return null;
    // A header nested in the details branch of another native disclosure is
    // a tool/code control, even if its ancestor fiber also owns reasoning.
    let child = group;
    for (let parent = group.parentElement; parent && parent !== turn; child = parent, parent = parent.parentElement) {
      const outerHeader = Array.from(parent.children).find(node => node !== header && node.matches(headerSelector) &&
        Array.from(node.children).some(button => button.tagName === "BUTTON" && button.hasAttribute("aria-expanded") && labelReference(button)));
      if (outerHeader && child !== outerHeader) return null;
    }
    return { button: buttons[0], label, group };
  }

  function updateTurn(turn) {
    const anchor = turn.querySelector(anchorSelector);
    let state = states.get(turn);
    if (!anchor || !french() || anchor.closest(turnSelector) !== turn) {
      if (state) cleanupTurn(state);
      return;
    }
    if (!state) {
      state = { heading: null, duplicates: new Set(), groups: new Map() };
      states.set(turn, state);
      tracked.add(new WeakRef(turn));
    }
    watched.add(turn);
    watched.add(anchor.parentElement);
    updateHeading(turn, anchor, state);
    const active = new Set();
    for (const header of turn.querySelectorAll(headerSelector)) {
      const parts = groupParts(header, turn);
      if (!parts) continue;
      watched.add(header); watched.add(parts.group); watched.add(parts.label); watched.add(parts.button);
      let entry = Array.from(state.groups).find(([ref]) => ref.deref() === header);
      const same = entry && entry[1].button === parts.button && entry[1].label === parts.label &&
        entry[1].group === parts.group && entry[1].anchor === anchor;
      let phase = reflectionPhase(header);
      if (phase === "unknown" && same) phase = entry[1].mode;
      if (phase === "unknown" || phase === "invalid") continue;
      const legacyWidgets = [...header.querySelectorAll(`[${ownedAttribute}="caption"]`), ...parts.group.querySelectorAll(`[${ownedAttribute}="summary"]`)];
      if (phase === "active" && legacyWidgets.length) {
        // v1 qualifies groups through the actual aria-labelledby attribute.
        // Removing it lets that observer restore its native attributes and
        // retire its widgets before v2 records fresh restoration baselines.
        setAttribute(parts.button, "aria-labelledby", null);
        continue;
      }
      active.add(header);
      if (entry && (!same || entry[1].mode !== phase)) {
        cleanupGroup(entry[1]); state.groups.delete(entry[0]); entry = null;
      }
      let groupState = entry?.[1];
      const action = disclosureName;
      if (!groupState) {
        groupState = { ...parts, turn, header, anchor, mode: phase,
          caption: phase === "active" ? create("span", "caption", action) : null,
          summary: phase === "active" ? create("div", "summary", "") : null };
        if (groupState.caption) {
          groupState.caption.style.fontSize = "0.875rem";
          groupState.caption.style.pointerEvents = "none";
          groupState.caption.setAttribute("aria-hidden", "true");
          groupState.summary.style.marginTop = "0.25rem";
        }
        state.groups.set(new WeakRef(header), groupState);
        controls.set(parts.button, groupState);
        labels.set(parts.label, groupState);
      }
      if (phase === "finished") {
        // An explicit aria-labelledby reference still supplies the native
        // button's name. Hide only the duplicate standalone caption from AX;
        // preserve its visual rendering and every native button attribute.
        setAttribute(parts.label, "aria-hidden", "true");
        continue;
      }
      // aria-labelledby has precedence over aria-label, including references
      // to hidden labels. Remove it while the explicit action name is owned.
      setAttribute(parts.button, "aria-labelledby", null);
      setAttribute(parts.button, "aria-label", action);
      if (groupState.caption.textContent !== action) groupState.caption.textContent = action;
      setAttribute(parts.label, "aria-hidden", "true");
      setAttribute(parts.label, "hidden", "");
      if (groupState.caption.parentElement !== header) header.appendChild(groupState.caption);
      // Read only the explicit native label, never the body or a fiber summary.
      const text = captionText(parts.label);
      if (groupState.summary.textContent !== text) groupState.summary.textContent = text;
      summaryVisibility(groupState);
    }
    for (const [ref, groupState] of state.groups) {
      if (!active.has(ref.deref())) { cleanupGroup(groupState); state.groups.delete(ref); }
    }
  }

  function retireGroup(state) {
    cleanupGroup(state);
    const turnState = states.get(state.turn);
    for (const [ref, value] of turnState?.groups || []) if (value === state) turnState.groups.delete(ref);
  }

  function repairControl(state) {
    if (controls.get(state.button) !== state) return;
    const turn = state.turn;
    if (!french() || !turn.isConnected || turn.querySelector(anchorSelector) !== state.anchor) { retireGroup(state); return; }
    const parts = groupParts(state.header, turn);
    if (!parts || parts.button !== state.button || parts.label !== state.label || parts.group !== state.group) {
      retireGroup(state);
      if (parts) updateTurn(turn);
      return;
    }
    let phase = reflectionPhase(state.header);
    if (phase === "unknown") phase = state.mode;
    if (phase === "invalid") { retireGroup(state); return; }
    if (phase !== state.mode) { updateTurn(turn); return; }
    if (phase === "active") {
      setAttribute(state.button, "aria-labelledby", null);
      setAttribute(state.button, "aria-label", disclosureName);
      setAttribute(state.label, "hidden", "");
      summaryVisibility(state);
    }
    setAttribute(state.label, "aria-hidden", "true");
  }

  function queueTurn(turn) {
    if (stopped || !turn || queued.has(turn)) return;
    queued.add(turn);
    dirty.push(new WeakRef(turn));
    schedule();
  }

  function schedule() {
    if (!stopped && timer === null) timer = setTimeout(flush, 100);
  }

  function flush() {
    timer = null;
    if (stopped) return;
    for (const ref of tracked) {
      const turn = ref.deref();
      if (!turn || !turn.isConnected) {
        if (turn) cleanupTurn(states.get(turn));
        tracked.delete(ref);
      } else if (!french()) cleanupTurn(states.get(turn));
    }
    const batch = dirty.splice(0, 50);
    for (const ref of batch) {
      const turn = ref.deref();
      if (!turn) continue;
      queued.delete(turn);
      if (turn.isConnected) updateTurn(turn);
    }
    if (dirty.length) schedule();
  }

  function discover(node, immediate = false) {
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    if (!element || owned(element)) return;
    const turn = element.closest(turnSelector);
    const turns = new Set(turn ? [turn] : []);
    for (const child of element.querySelectorAll(discoveredSelector)) {
      if (!owned(child) && child.closest(turnSelector)) turns.add(child.closest(turnSelector));
    }
    for (const candidate of turns) {
      if (immediate) { if (candidate.isConnected) updateTurn(candidate); }
      else queueTurn(candidate);
    }
  }

  function structuralTurns(records) {
    const turns = new Set();
    const inspectHeader = header => {
      if (!header || owned(header)) return;
      const turn = header.closest(turnSelector);
      if (!turn) return;
      const previous = Array.from(states.get(turn)?.groups || []).find(([, state]) => state.header === header)?.[1];
      const parts = groupParts(header, turn);
      if (previous) {
        if (!parts || previous.button !== parts.button || previous.label !== parts.label || previous.group !== parts.group) turns.add(turn);
      } else if (parts && ["active", "finished"].includes(reflectionPhase(header))) turns.add(turn);
    };
    for (const record of records) {
      if (owned(record.target)) continue;
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (record.type !== "childList") {
        // A new control may commit before its props/reference are ready. The
        // next relevant native attribute can qualify it in this microtask.
        if (record.type === "attributes" && ["class", "aria-expanded", "aria-label", "aria-labelledby"].includes(record.attributeName)) inspectHeader(target?.closest(headerSelector));
        continue;
      }
      inspectHeader(target?.closest(headerSelector));
      if (watched.has(target)) {
        const turn = target.closest(turnSelector);
        const outOfOrder = Array.from(states.get(turn)?.groups || []).some(([, state]) =>
          state.group === target && state.mode === "active" && state.summary?.nextSibling);
        if (outOfOrder) turns.add(turn);
      }
      for (const node of record.addedNodes || []) {
        if (node.nodeType !== 1 || owned(node)) continue;
        if (node.matches(headerSelector)) inspectHeader(node);
        for (const header of node.querySelectorAll(headerSelector)) inspectHeader(header);
      }
      for (const node of record.removedNodes || []) {
        if (node.nodeType !== 1 || owned(node)) continue;
        const state = controls.get(node) || labels.get(node);
        if (state) turns.add(state.turn);
        const removedHeaders = node.matches(headerSelector) ? [node] : node.querySelectorAll(headerSelector);
        for (const header of removedHeaders) {
          // Only already-owned main groups count here. Removed tool headers
          // inside streamed details must not initiate a whole-turn update.
          const previous = Array.from(header.children).map(child => controls.get(child)).find(Boolean);
          if (previous) turns.add(previous.turn);
        }
      }
    }
    return turns;
  }

  const observer = new MutationObserver(records => {
    if (stopped) return;
    // MutationObserver runs in a microtask: naming repairs must happen now,
    // before the slower layout/summary batch and before the next user focus.
    const repairs = new Set();
    for (const record of records) {
      if (record.type !== "attributes" || !["aria-label", "aria-labelledby", "aria-hidden", "hidden", "aria-expanded"].includes(record.attributeName)) continue;
      const state = controls.get(record.target) || labels.get(record.target);
      if (state) repairs.add(state);
    }
    for (const state of repairs) repairControl(state);
    // New native buttons/label wrappers must acquire their name in this same
    // observer microtask. Plain body text and unchanged caption descendants
    // keep the regular batch and never trigger this structural path.
    for (const turn of structuralTurns(records)) if (turn.isConnected) updateTurn(turn);
    for (const record of records) {
      if (owned(record.target)) continue;
      if (record.target === document.documentElement && record.attributeName === "lang") {
        for (const turn of document.querySelectorAll(turnSelector)) queueTurn(turn);
      } else {
        const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
        if (watched.has(target) || target?.closest(headerSelector)) queueTurn(target.closest(turnSelector));
        else if (record.type === "attributes" && target?.matches(discoveredSelector)) discover(target);
        for (const node of record.addedNodes || []) {
          if (owned(node)) continue;
          const element = node.nodeType === 1 ? node : null;
          if (element?.matches(discoveredSelector) || element?.querySelector(discoveredSelector)) discover(element, true);
        }
        if (Array.from(record.removedNodes || []).some(node => node.nodeType === 1 &&
            (node.matches(turnSelector) || node.querySelector(turnSelector)))) schedule();
      }
    }
  });
  observer.observe(document, { subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ["lang", "aria-expanded", "aria-label", "aria-labelledby", "aria-hidden", "hidden", "data-turn-key", "data-chatgpt-agent-turn-start", "class"] });
  const nativeEvent = event => {
    if (stopped) return;
    if (owned(event.target)) return;
    const header = event.target?.closest?.(headerSelector);
    if (header) queueTurn(header.closest(turnSelector));
  };
  const events = ["click", "focusin", "change"];
  for (const event of events) document.addEventListener(event, nativeEvent, true);
  const api = { version: 6, active: true, stop() {
    if (stopped) return;
    stopped = true;
    api.active = false;
    observer.disconnect();
    if (timer !== null) clearTimeout(timer);
    timer = null;
    dirty = [];
    queued = new WeakSet();
    for (const event of events) document.removeEventListener(event, nativeEvent, true);
    for (const ref of tracked) {
      const turn = ref.deref();
      if (turn) cleanupTurn(states.get(turn));
    }
    tracked.clear();
    if (window[currentMarker] === api) delete window[currentMarker];
  } };
  window[marker] = api;
  window[currentMarker] = api;
  for (const turn of document.querySelectorAll(turnSelector)) updateTurn(turn);
})();
