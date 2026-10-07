/* ChatGPT Navigation continue — no network, storage, DOM copies or React internals.
 * Runs BEFORE ChatGPT creates its IntersectionObservers (MAIN, document_start).
 * See ../docs/DIAGNOSTIC.md for the exact observed virtualization signature.
 */
(() => {
  "use strict";
  const NativeObserver = window.IntersectionObserver;
  const installed = Symbol.for("chatgpt-navigation-continue.v1");
  if (!NativeObserver || NativeObserver[installed]) return;

  function isTurn(entry) {
    const target = entry.target;
    return target instanceof Element &&
      target.matches("div[data-turn-id-container][data-is-intersecting]") &&
      target.getAttribute("data-turn-id-container") !== "client-created-root" &&
      target.closest("#thread") !== null;
  }

  function isVirtualizer(observer) {
    // The table of contents observes the SAME nodes with a DIFFERENT margin.
    // Do not alter it, the bottom sentinel, lazy media or the sidebar observers.
    return observer.rootMargin === "1000px 0px 1000px 0px" &&
      observer.thresholds.length === 1 && Math.abs(observer.thresholds[0] - 0.01) < 1e-8;
  }

  function keep(entry, observer) {
    if (!isVirtualizer(observer) || !isTurn(entry)) return entry;
    // IntersectionObserverEntry is an illegal constructor in Chromium.
    // Forward getters with the native entry as receiver (WebIDL brand checks).
    return new Proxy(entry, {
      get(target, property) {
        if (property === "isIntersecting") return true;
        if (property === "intersectionRatio") return 1;
        if (property === "intersectionRect") return target.boundingClientRect;
        // Synthetic rendering notification, not a real viewport crossing:
        // null prevents ChatGPT's virtualization scroll compensation.
        if (property === "rootBounds") return null;
        return Reflect.get(target, property, target);
      }
    });
  }

  class ContinuousObserver extends NativeObserver {
    constructor(callback, options) {
      // Preserve native validation of non-callable callbacks.
      if (typeof callback !== "function") {
        super(callback, options);
        return;
      }
      super(function (entries, observer) {
        callback.call(this, entries.map(entry => keep(entry, observer)), observer);
      }, options);
    }

    takeRecords() {
      return super.takeRecords().map(entry => keep(entry, this));
    }
  }
  Object.defineProperty(ContinuousObserver, installed, { value: true });
  window.IntersectionObserver = ContinuousObserver;
})();
