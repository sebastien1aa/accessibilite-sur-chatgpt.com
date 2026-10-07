/* ChatGPT's September 2026 virtual list exposes retainedTurnKeys. Use that
 * mechanism so React owns every real row, including its actions and updates.
 * Each export-discovery window ends after 60 seconds. A later internal
 * navigation reopens it before the site's lazy conversation module loads.
 * No conversation contents are retained by the extension.
 */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.retained-turns.v1");
  if (window[marker]) return;
  const state = { revision: 2, status: "waiting", calls: 0, count: 0, attempts: 0, stop };
  window[marker] = state;
  const nativeDefine = Object.defineProperty;
  const functionSource = Function.prototype.toString;
  let timer;
  let stopped = false;
  let countRoot;
  const navigation = window.navigation;

  function restore() {
    if (Object.defineProperty === captureExport) Object.defineProperty = nativeDefine;
    clearTimeout(timer);
    timer = undefined;
  }

  function removeListeners() {
    document.removeEventListener("click", beforeLink, true);
    window.removeEventListener("popstate", beforeHistory, true);
    navigation?.removeEventListener?.("navigate", beforeNavigate);
  }

  function clearCount() {
    if (countRoot?.getAttribute("data-chatgpt-continuous-turn-count") === String(state.count)) {
      countRoot.removeAttribute("data-chatgpt-continuous-turn-count");
    }
    countRoot = undefined;
    state.count = 0;
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    restore();
    removeListeners();
    clearCount();
    state.status = "stopped";
  }

  function arm() {
    if (stopped || state.status === "active" || Object.defineProperty === captureExport) return;
    // A later owner's wrapper may itself forward to captureExport. Wrapping
    // that owner would create a cycle; leave its contract intact instead.
    if (Object.defineProperty !== nativeDefine) return;
    Object.defineProperty = captureExport;
    state.status = "waiting";
    state.attempts += 1;
    timer = setTimeout(() => {
      restore();
      if (!stopped && state.status === "waiting") state.status = "not-found";
    }, 60000);
  }

  function internalDestination(href) {
    try {
      const destination = new URL(href, window.location.href);
      const current = new URL(window.location.href);
      return destination.origin === current.origin &&
        (destination.pathname !== current.pathname || destination.search !== current.search);
    } catch { return false; }
  }

  function beforeLink(event) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey ||
        event.shiftKey || event.defaultPrevented) return;
    const link = event.target?.closest?.("a[href]");
    if (!link || link.hasAttribute("download") ||
        (link.target && link.target !== "_self")) return;
    if (internalDestination(link.href)) arm();
  }

  function beforeNavigate(event) {
    if (!event.hashChange && internalDestination(event.destination?.url)) arm();
  }

  function beforeHistory() {
    arm();
  }

  function matches(component) {
    if (typeof component !== "function") return false;
    const source = functionSource.call(component);
    return source.includes("retainedTurnKeys:") &&
      source.includes("synchronousMeasurementTurnKey:") &&
      source.includes("getPendingRestoreScrollDistanceFromBottomPx:") &&
      source.includes("RowComponent:");
  }

  function captureExport(target, key, descriptor) {
    // Only the site's simple module export getters; never evaluate arbitrary
    // property getters or change ordinary value/property definitions.
    if (state.status === "waiting" && key === "a" && descriptor?.enumerable === true &&
        typeof descriptor.get === "function" &&
        /^\(\)=>[\w$]+$/.test(functionSource.call(descriptor.get))) {
      let component;
      // Modules may register a getter before initializing its lexical value.
      // Reading such an export must never break module loading.
      try { component = descriptor.get(); }
      catch { return nativeDefine(target, key, descriptor); }
      if (matches(component)) {
        function ContinuousTurns(props) {
          const entries = props?.entries;
          if (!stopped && Array.isArray(entries) && entries.length > 0 &&
              Array.isArray(props.retainedTurnKeys) &&
              typeof props.RowComponent === "function" &&
              entries.every(entry => entry != null && typeof entry.turnKey === "string" &&
                typeof entry.conversationId === "string" && entry.turn != null) &&
              entries.every(entry => entry.conversationId === entries[0].conversationId)) {
            const keys = [...new Set([...props.retainedTurnKeys, ...entries.map(entry => entry.turnKey)])];
            state.calls += 1;
            state.count = entries.length;
            countRoot = document.documentElement;
            countRoot?.setAttribute("data-chatgpt-continuous-turn-count", String(entries.length));
            return component.call(this, { ...props, retainedTurnKeys: keys });
          }
          clearCount();
          return component.call(this, props);
        }
        const result = nativeDefine(target, key, { ...descriptor, get: () => ContinuousTurns });
        state.status = "active";
        restore();
        removeListeners();
        return result;
      }
    }
    return nativeDefine(target, key, descriptor);
  }

  // Capture precedes React's link handler; Navigation covers push/replace and
  // history traversal. Neither listener cancels or redirects a navigation.
  document.addEventListener("click", beforeLink, true);
  window.addEventListener("popstate", beforeHistory, true);
  navigation?.addEventListener?.("navigate", beforeNavigate);
  arm();
})();
