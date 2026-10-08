/* French labels for the native model/power controls. React settings are read
 * only; no model choice, conversation content, or native handler is changed. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.model-labels.v5");
  const currentMarker = Symbol.for("chatgpt-navigation-continue.model-labels.current");
  if (window[marker]?.active) return;
  window[currentMarker]?.stop?.();
  const triggerSelector = 'button[data-codex-intelligence-trigger][data-composer-navigation-target="reasoning"]';
  const controlSelector = `${triggerSelector}, [data-reasoning-slider], [data-model-picker-view-toggle]`;
  const baseName = "Sélectionner le modèle ChatGPT";
  const reasoningName = "Niveau de raisonnement";
  const choiceName = "Raisonnement";
  const labels = new Map([
    ["Instant", "Instantané"], ["Minimal", "Minimal"], ["Medium", "Moyenne"], ["High", "Élevée"],
    ["Extra High", "Très élevé"], ["Pro", "Pro"],
    ["Instantané", "Instantané"], ["Moyen", "Moyen"], ["Moyenne", "Moyenne"], ["Élevé", "Élevé"],
    ["Très élevé", "Très élevé"], ["Élevée", "Élevée"],
    ["Très élevée", "Très élevée"], ["très élevée", "très élevée"]
  ]);
  // Work captions use Moyen/Élevé, while the native accessible power status
  // uses Moyenne/Élevée. Keep French captions intact; name the closed trigger
  // with the same level wording as that accessible status.
  const accessibleLevels = new Map([["Moyen", "Moyenne"], ["Élevé", "Élevée"]]);
  const accessibleLevel = value => accessibleLevels.get(value) || labels.get(value);
  const changes = new WeakMap();
  const changedRefs = new Set();
  let watched = new WeakSet();
  let pending = false;
  let stopped = false;
  const isFrench = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");
  const read = (node, attribute) => attribute === null ? node.nodeValue : node.getAttribute(attribute);
  const write = (node, attribute, value) => {
    if (attribute === null) node.nodeValue = value;
    else if (value === null) node.removeAttribute(attribute);
    else node.setAttribute(attribute, value);
  };

  function replace(node, attribute, value) {
    const current = read(node, attribute);
    if (current === value) return;
    let entries = changes.get(node);
    if (!entries) {
      entries = new Map();
      changes.set(node, entries);
      changedRefs.add(new WeakRef(node));
    }
    const previous = entries.get(attribute);
    entries.set(attribute, { native: previous?.applied === current ? previous.native : current, applied: value });
    write(node, attribute, value);
  }

  function restore(node, attribute) {
    const entries = changes.get(node);
    const previous = entries?.get(attribute);
    if (!previous) return;
    if (read(node, attribute) === previous.applied) write(node, attribute, previous.native);
    entries.delete(attribute);
  }

  function restoreAll() {
    for (const ref of changedRefs) {
      const node = ref.deref();
      if (!node?.isConnected) { changedRefs.delete(ref); continue; }
      for (const attribute of changes.get(node)?.keys() || []) restore(node, attribute);
    }
  }

  function translateText(root, status = false) {
    watched.add(root);
    const walker = document.createTreeWalker(root, 4 /* SHOW_TEXT */);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      watched.add(node);
      for (let parent = node.parentElement; parent && parent !== root; parent = parent.parentElement) watched.add(parent);
      nodes.push(node);
    }
    if (status) {
      const text = nodes.map(node => node.nodeValue).join("");
      const match = /^(\s*)([^,]+)(,\s*\d+\s+sur\s+\d+\.?\s*)$/.exec(text);
      if (!match || !labels.has(match[2]) || labels.get(match[2]) === match[2]) return;
      const start = match[1].length;
      const end = start + match[2].length;
      let offset = 0;
      for (const node of nodes) {
        const value = node.nodeValue;
        const next = offset + value.length;
        if (offset < end && next > start) {
          const before = value.slice(0, Math.max(0, start - offset));
          const after = value.slice(Math.min(value.length, end - offset));
          replace(node, null, before + (offset <= start ? labels.get(match[2]) : "") + after);
        }
        offset = next;
      }
      return;
    }
    for (const node of nodes) {
      const text = node.nodeValue;
      // Preserve punctuation, whitespace, positions and all native instructions.
      const match = /^(\s*)(.*?)(\s*)$/.exec(text);
      if (!match || !labels.has(match[2])) continue;
      replace(node, null, match[1] + labels.get(match[2]) + match[3]);
    }
  }

  function validSelection(value) {
    return value && typeof value === "object" &&
      ["id", "model", "modelLabel", "reasoningEffort", "sliderLabel"].every(key =>
        typeof value[key] === "string" && value[key].trim() === value[key] && value[key].length > 0 && value[key].length <= 160) &&
      Number.isInteger(value.powerSettingIndex) && value.powerSettingIndex >= 0;
  }

  function exposedLabel(control) {
    const walker = document.createTreeWalker(control, 4 /* SHOW_TEXT */);
    const parts = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('[aria-hidden="true"], [hidden], [inert]')) continue;
      const value = node.nodeValue.trim();
      if (value) parts.push(value);
    }
    return parts.join(" ");
  }

  function sameSelection(a, b) {
    return ["id", "model", "modelLabel", "reasoningEffort", "sliderLabel", "powerSettingIndex"].every(key => a[key] === b[key]);
  }

  function isCurrent(fiber) {
    let root = fiber;
    let depth = 0;
    while (root?.return && depth++ < 80) root = root.return;
    if (root?.return || !root?.stateNode?.current) return null;
    return root.stateNode.current === root;
  }

  function selectedModel(button) {
    try {
      const key = Object.keys(button).find(name => name.startsWith("__reactFiber$"));
      if (!key) return null;
      const effort = button.getAttribute("data-selected-reasoning-effort");
      if (!effort) return null;
      const candidates = [];
      let fiber = button[key];
      for (let depth = 0; fiber && depth < 40; depth++, fiber = fiber.return) {
        for (const branch of [fiber, fiber.alternate]) {
          if (!branch || isCurrent(branch) === false) continue;
          const props = branch.memoizedProps;
          const selected = props?.selectedPowerSelection;
          if (!validSelection(selected) || selected.reasoningEffort !== effort ||
              !Array.isArray(props.powerSelections) || props.powerSelections.length > 100 ||
              !props.powerSelections.some(item => validSelection(item) && sameSelection(item, selected))) continue;
          if (!candidates.some(item => sameSelection(item, selected))) candidates.push(selected);
        }
      }
      // Without an identifiable committed branch, contradictory choices are
      // deliberately left to the native control rather than announcing a guess.
      return candidates.length === 1 ? candidates[0] : null;
    } catch { return null; }
  }

  function update() {
    pending = false;
    if (stopped) return;
    for (const ref of changedRefs) if (!ref.deref()?.isConnected) changedRefs.delete(ref);
    watched = new WeakSet();
    if (!isFrench()) { restoreAll(); return; }
    for (const control of document.querySelectorAll(controlSelector)) {
      watched.add(control);
      if (control.matches(triggerSelector)) {
        translateText(control);
        const selected = selectedModel(control);
        const level = accessibleLevel(selected?.sliderLabel);
        const exposed = exposedLabel(control);
        const name = control.getAttribute("aria-label");
        const previous = changes.get(control)?.get("aria-label");
        let choice = null;
        if (selected && level) {
          // Keep a model only when its native visible caption includes it.
          // GPT-6 and Pro can expose just a preset caption; do not supplement
          // it with a model identity that sighted users cannot see here.
          // A visible model caption can abbreviate the public modelLabel
          // (e.g. 5.6 versus GPT-5.6 Sol). Preserve that caption verbatim,
          // instead of requiring it to repeat the internal public label.
          choice = exposed && exposed !== "Effort de réflexion" && exposed.length <= 200 && !labels.has(exposed) ? exposed : level;
          const captionLevel = labels.get(selected.sliderLabel);
          if (captionLevel && captionLevel !== level && choice.endsWith(` ${captionLevel}`)) {
            choice = choice.slice(0, -captionLevel.length) + level;
          }
        } else if (exposed && exposed !== "Effort de réflexion" &&
                   exposed.length <= 200 && control.getAttribute("aria-expanded") !== "true") {
          choice = accessibleLevel(exposed) || exposed;
        }
        const legacy = window[Symbol.for("chatgpt-navigation-continue.model-labels.v1")] && name?.startsWith(`${baseName} : `);
        if (choice && (name === baseName || name === previous?.applied || name?.startsWith(`${reasoningName} : `) || legacy)) {
          replace(control, "aria-label", `${choiceName} : ${choice}`);
        } else restore(control, "aria-label");
      } else if (control.hasAttribute("data-model-picker-view-toggle")) {
        translateText(control);
      } else {
        // The native slider also renders its preset captions inside the
        // targeted control. Correct exact known labels, never surrounding prose.
        translateText(control);
        for (const id of (control.getAttribute("aria-describedby") || "").split(/\s+/)) {
          const status = id ? document.getElementById(id) : null;
          if (status?.matches('[role="status"][aria-live="polite"]')) translateText(status, true);
        }
      }
    }
  }

  function schedule() {
    if (stopped || pending) return;
    pending = true;
    queueMicrotask(update);
  }

  function relevant(node) {
    if (watched.has(node)) return true;
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    return !!element?.closest(controlSelector);
  }

  const observer = new MutationObserver(records => {
    if (stopped) return;
    if (records.some(record =>
      (record.type === "attributes" && record.target === document.documentElement && record.attributeName === "lang") ||
      relevant(record.target) || Array.from(record.addedNodes || []).some(node =>
        relevant(node) || (node.nodeType === 1 && node.querySelector(controlSelector))))) schedule();
  });
  observer.observe(document, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ["lang", "aria-label", "aria-describedby", "data-selected-reasoning-effort", "data-codex-intelligence-trigger", "data-composer-navigation-target", "data-reasoning-slider", "data-model-picker-view-toggle"]
  });
  const nativeEvent = event => {
    if (relevant(event.target)) schedule();
  };
  const events = ["focusin", "click", "change"];
  for (const event of events) document.addEventListener(event, nativeEvent, true);
  const api = { version: 5, active: true, stop() {
    if (stopped) return;
    stopped = true; api.active = false; pending = false;
    observer.disconnect();
    for (const event of events) document.removeEventListener(event, nativeEvent, true);
    for (const ref of changedRefs) {
      const node = ref.deref();
      if (node) for (const attribute of changes.get(node)?.keys() || []) restore(node, attribute);
    }
    changedRefs.clear();
    if (window[currentMarker] === api) delete window[currentMarker];
  } };
  window[marker] = api;
  window[currentMarker] = api;
  update();
})();
