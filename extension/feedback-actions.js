/* Mirror confirmed native completion, without reading clipboard/message content.
 * Share's transient unavailable state must retain focus from the outset. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.feedback-actions.v7");
  if (window[marker]?.active) return;
  window[Symbol.for("chatgpt-navigation-continue.feedback-actions.v6")]?.stop?.();
  window[Symbol.for("chatgpt-navigation-continue.feedback-actions.v5")]?.stop?.();
  window[Symbol.for("chatgpt-navigation-continue.feedback-actions.v4")]?.stop?.();
  window[Symbol.for("chatgpt-navigation-continue.feedback-actions.v3")]?.stop?.();
  window[Symbol.for("chatgpt-navigation-continue.feedback-actions.v2")]?.stop?.();
  window[Symbol.for("chatgpt-navigation-continue.feedback-actions.v1")]?.stop?.();
  const shareText = "Le lien public a été copié.";
  const privacyText = "Toute personne disposant du lien peut consulter cette conversation.";
  const toastSelector = '[data-sonner-toast]';
  const excluded = '[hidden], [inert], [aria-hidden="true"]';
  const popup = '[role="dialog"], [role="menu"], [aria-modal="true"]';
  let active = true, status = null, copy = null, share = null;
  let guard = null;
  const copyLabels = new Map();
  const copyIcons = new Map();
  let expiry = null, delivery = null, clearMessage = null;
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || "");
  const name = button => button?.getAttribute("aria-label") || "";
  const visible = node => !!node?.isConnected && !node.closest(excluded) && node.getClientRects().length > 0;

  function descriptor(node, key) {
    for (let proto = Object.getPrototypeOf(node); proto; proto = Object.getPrototypeOf(proto)) {
      const found = Object.getOwnPropertyDescriptor(proto, key);
      if (found) return found;
    }
    return null;
  }

  function protect(context) {
    const button = context.button;
    const keys = ['disabled', 'setAttribute', 'removeAttribute', 'toggleAttribute'];
    // Never replace a foreign instance hook, or broaden this to prototypes.
    if (guard || keys.some(key => Object.hasOwn(button, key))) return;
    const nativeDisabled = descriptor(button, 'disabled');
    const set = button.setAttribute, remove = button.removeAttribute, toggle = button.toggleAttribute;
    if (!nativeDisabled?.get || !nativeDisabled?.set || typeof set !== 'function' || typeof remove !== 'function') return;
    const entry = { context, button, busy: false, disabledValue: '', live: true, aria: button.getAttribute('aria-disabled'), wrappers: {} };
    const matches = attr => typeof attr === 'string' && attr.toLowerCase() === 'disabled';
    function release(materialize = true) {
      if (!entry.live) return;
      entry.live = false;
      const disabled = Object.getOwnPropertyDescriptor(button, 'disabled');
      const ownsDisabled = disabled?.get === entry.wrappers.disabled?.get && disabled?.set === entry.wrappers.disabled?.set;
      for (const key of Object.keys(entry.wrappers)) {
        const current = Object.getOwnPropertyDescriptor(button, key);
        const expected = entry.wrappers[key];
        if (current?.configurable && (key === 'disabled' ? current.get === expected.get && current.set === expected.set : current.value === expected.value)) delete button[key];
      }
      if (button.getAttribute('aria-disabled') === 'true' && entry.busy) {
        entry.aria === null ? remove.call(button, 'aria-disabled') : set.call(button, 'aria-disabled', entry.aria);
      }
      if (materialize && ownsDisabled) {
        entry.busy ? set.call(button, 'disabled', entry.disabledValue) : remove.call(button, 'disabled');
      }
      if (guard === entry) guard = null;
    }
    entry.release = release;
    function write(value, disabledValue = '') {
      if (!owned(context) || name(button) !== 'Partager' ||
          button.getAttribute('aria-disabled') !== (entry.busy ? 'true' : entry.aria)) {
        // Apply the new request directly. Materializing the previous busy
        // value first would cause an avoidable disabled/blur interval.
        release(false);
        value ? set.call(button, 'disabled', disabledValue) : remove.call(button, 'disabled');
        return;
      }
      if (value) {
        entry.busy = true;
        entry.disabledValue = disabledValue;
        context.busy = true;
        set.call(button, 'aria-disabled', 'true');
        // Native HTML disabled never reaches the DOM, so there is no blur/BODY
        // interval to repair. Existing aria-disabled classes keep native styling.
      } else {
        const previousBusy = entry.busy;
        entry.busy = false;
        if (previousBusy && button.getAttribute('aria-disabled') === 'true') {
          entry.aria === null ? remove.call(button, 'aria-disabled') : set.call(button, 'aria-disabled', entry.aria);
        }
        release(false);
        nativeDisabled.set.call(button, false);
      }
    }
    entry.wrappers.disabled = { configurable: true, enumerable: nativeDisabled.enumerable,
      get() { return this === button && entry.live ? entry.busy : nativeDisabled.get.call(this); },
      set(value) { this === button && entry.live ? write(!!value) : nativeDisabled.set.call(this, value); }
    };
    entry.wrappers.setAttribute = { configurable: true, writable: true, value: function(attr, value) {
      if (this === button && entry.live && matches(attr)) { write(true, String(value)); return; }
      return set.apply(this, arguments);
    } };
    entry.wrappers.removeAttribute = { configurable: true, writable: true, value: function(attr) {
      if (this === button && entry.live && matches(attr)) { write(false); return; }
      return remove.apply(this, arguments);
    } };
    if (typeof toggle === 'function') entry.wrappers.toggleAttribute = { configurable: true, writable: true, value: function(attr, force) {
      if (this === button && entry.live && matches(attr)) { const value = arguments.length > 1 ? !!force : !entry.busy; write(value); return value; }
      return toggle.apply(this, arguments);
    } };
    try {
      Object.defineProperties(button, entry.wrappers);
      guard = entry;
    } catch { release(false); }
  }

  function protectCopyName(context) {
    const button = context.button, initial = name(button);
    const keys = ['setAttribute', 'removeAttribute', 'ariaLabel', 'ariaBusy', 'ariaDisabled'];
    const existing = copyLabels.get(button);
    if (existing) {
      if (owned(existing.context) && existing.initial === initial) {
        // A new real success write belongs to the latest activation. Keeping
        // the name hook avoids briefly materializing the previous Copié name.
        existing.context = context;
        clearTimeout(existing.timer);
        existing.timer = setTimeout(existing.release, 15000);
      } else existing.release();
      return;
    }
    if (keys.some(key => Object.hasOwn(button, key))) return;
    const set = button.setAttribute, remove = button.removeAttribute;
    const aria = descriptor(button, 'ariaLabel');
    const busy = descriptor(button, 'ariaBusy');
    const disabled = descriptor(button, 'ariaDisabled');
    const entry = { context, initial, native: initial, live: true, wrappers: {}, timer: null,
      busyNative: button.getAttribute('aria-busy'), busySuppressed: false,
      unavailable: false, previousDisabled: null };
    const matches = attr => typeof attr === 'string' && attr.toLowerCase() === 'aria-label';
    function release(materialize = true) {
      if (!entry.live) return;
      entry.live = false;
      clearTimeout(entry.timer);
      const currentSet = Object.getOwnPropertyDescriptor(button, 'setAttribute');
      const ownsSet = currentSet?.value === entry.wrappers.setAttribute?.value;
      for (const key of Object.keys(entry.wrappers)) {
        const current = Object.getOwnPropertyDescriptor(button, key), expected = entry.wrappers[key];
        if (current?.configurable && (key.startsWith('aria') ? current.get === expected.get && current.set === expected.set : current.value === expected.value)) delete button[key];
      }
      // Respect foreign writes that bypassed this instance's methods.
      if (materialize && ownsSet && name(button) === initial && entry.native !== initial) {
        entry.native === null ? remove.call(button, 'aria-label') : set.call(button, 'aria-label', entry.native);
      }
      if (ownsSet && entry.busySuppressed && button.getAttribute('aria-busy') === null) {
        entry.busyNative === null ? remove.call(button, 'aria-busy') : set.call(button, 'aria-busy', entry.busyNative);
      }
      if (ownsSet && entry.unavailable && button.getAttribute('aria-disabled') === 'true') {
        entry.previousDisabled === null ? remove.call(button, 'aria-disabled') : set.call(button, 'aria-disabled', entry.previousDisabled);
      }
      entry.unavailable = false;
      copyLabels.delete(button);
    }
    entry.release = release;
    function write(value) {
      entry.native = value;
      if (!owned(entry.context) || name(button) !== initial) {
        release(false);
        value === null ? remove.call(button, 'aria-label') : set.call(button, 'aria-label', value);
      } else if (value === 'Copié') {
        // Native sender onClick is absent during this successful-state interval.
        // Expose that state without HTML disabled, which would discard focus.
        if (initial === 'Copier le message' && !entry.unavailable && button.getAttribute('aria-disabled') !== 'true') {
          entry.previousDisabled = button.getAttribute('aria-disabled');
          entry.unavailable = true;
          set.call(button, 'aria-disabled', 'true');
        }
        // Observe success before suppressing its competing accessible-name
        // change. This signal works even with no icon/DOM mutation at all.
        if (copy === entry.context) {
          copy = null;
          announce('Message copié', entry.context);
        }
      } else {
        release(false);
        value === null ? remove.call(button, 'aria-label') : set.call(button, 'aria-label', value);
      }
    }
    function writeBusy(value) {
      entry.busyNative = value;
      if (!owned(entry.context) || name(button) !== initial) {
        release(false);
        value === null ? remove.call(button, 'aria-busy') : set.call(button, 'aria-busy', value);
        return;
      }
      // This named atomic button has no incomplete accessible subtree.
      // Native aria-disabled and the asynchronous action remain intact.
      if (initial === 'Copier' && owned(entry.context) && value === 'true' && button.getAttribute('aria-busy') === null) {
        entry.busySuppressed = true;
        return;
      }
      entry.busySuppressed = false;
      value === null ? remove.call(button, 'aria-busy') : set.call(button, 'aria-busy', value);
    }
    function writeDisabled(value) {
      // A subsequent native/foreign request supersedes our borrowed state.
      entry.unavailable = false;
      value === null ? remove.call(button, 'aria-disabled') : set.call(button, 'aria-disabled', value);
    }
    entry.wrappers.setAttribute = { configurable: true, writable: true, value: function(attr, value) {
      if (this === button && entry.live && matches(attr)) { write(String(value)); return; }
      if (this === button && entry.live && typeof attr === 'string' && attr.toLowerCase() === 'aria-busy') { writeBusy(String(value)); return; }
      if (this === button && entry.live && typeof attr === 'string' && attr.toLowerCase() === 'aria-disabled') { writeDisabled(String(value)); return; }
      return set.apply(this, arguments);
    } };
    entry.wrappers.removeAttribute = { configurable: true, writable: true, value: function(attr) {
      if (this === button && entry.live && matches(attr)) { write(null); return; }
      if (this === button && entry.live && typeof attr === 'string' && attr.toLowerCase() === 'aria-busy') { writeBusy(null); return; }
      if (this === button && entry.live && typeof attr === 'string' && attr.toLowerCase() === 'aria-disabled') { writeDisabled(null); return; }
      return remove.apply(this, arguments);
    } };
    if (aria?.get && aria?.set) entry.wrappers.ariaLabel = { configurable: true, enumerable: aria.enumerable,
      get() { return aria.get.call(this); },
      set(value) { this === button && entry.live ? write(value == null ? null : `${value}`) : aria.set.call(this, value); }
    };
    if (busy?.get && busy?.set && initial === 'Copier') entry.wrappers.ariaBusy = { configurable: true, enumerable: busy.enumerable,
      get() { return busy.get.call(this); },
      set(value) { this === button && entry.live ? writeBusy(value == null ? null : `${value}`) : busy.set.call(this, value); }
    };
    if (disabled?.get && disabled?.set && initial === 'Copier le message') entry.wrappers.ariaDisabled = { configurable: true, enumerable: disabled.enumerable,
      get() { return disabled.get.call(this); },
      set(value) { this === button && entry.live ? writeDisabled(value == null ? null : `${value}`) : disabled.set.call(this, value); }
    };
    try {
      Object.defineProperties(button, entry.wrappers);
      copyLabels.set(button, entry);
      entry.timer = setTimeout(release, 15000);
    } catch { release(false); }
  }

  function iconOwner(svg) {
    const button = svg.closest('button');
    return french() && svg.isConnected && svg.parentElement === button && button?.getAttribute('type') === 'button' &&
      ['Copier', 'Copier le message', 'Copié'].includes(name(button)) &&
      button.closest('[data-turn-key]') && !button.closest(popup) ? button : null;
  }
  function decorative(svg) {
    // The inspected copy/checkmark SVGs have no independent information or
    // focus target. Never hide an interactive or explicitly named graphic.
    const semantics = ['aria-label', 'aria-labelledby', 'aria-describedby', 'role', 'tabindex', 'onclick', 'onkeydown'];
    return semantics.every(attr => !svg.hasAttribute(attr)) && svg.getAttribute('focusable') !== 'true' &&
      typeof svg.onclick !== 'function' && typeof svg.onkeydown !== 'function' &&
      !svg.querySelector('title, desc, [aria-label], [aria-labelledby], [role], [tabindex], [onclick], [onkeydown], a, foreignObject') &&
      !(typeof svg.contains === 'function' && svg.contains(document.activeElement));
  }
  function releaseIcon(svg) {
    if (!copyIcons.has(svg)) return;
    if (svg.getAttribute('aria-hidden') === 'true') svg.removeAttribute('aria-hidden');
    copyIcons.delete(svg);
  }
  function maintainCopyIcons() {
    for (const [svg, owner] of copyIcons) {
      if (iconOwner(svg) !== owner.button || svg.parentElement !== owner.parent ||
          owner.button.closest('[data-turn-key]') !== owner.turn ||
          owner.turn.getAttribute('data-turn-key') !== owner.turnKey || !decorative(svg)) releaseIcon(svg);
      else if (svg.getAttribute('aria-hidden') === null) svg.setAttribute('aria-hidden', 'true');
      else if (svg.getAttribute('aria-hidden') !== 'true') copyIcons.delete(svg);
    }
    if (!active || !french()) return;
    for (const svg of document.querySelectorAll('[data-turn-key] button svg')) {
      if (copyIcons.has(svg) || svg.getAttribute('aria-hidden') !== null || !decorative(svg)) continue;
      const button = iconOwner(svg);
      if (!button) continue;
      const turn = button.closest('[data-turn-key]');
      copyIcons.set(svg, { button, parent: svg.parentElement, turn, turnKey: turn.getAttribute('data-turn-key') });
      svg.setAttribute('aria-hidden', 'true');
    }
  }
  function onIconFocus(event) {
    const svg = event.target?.closest?.('svg');
    if (svg && copyIcons.has(svg)) releaseIcon(svg);
  }

  function mount() {
    if (!active || !french() || !document.body) return;
    if (status?.isConnected) return;
    status = document.createElement("div");
    status.setAttribute("data-chatgpt-a11y-action-status", "");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    status.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;";
    document.body.append(status);
  }

  function owned(context) {
    return active && french() && context && window.location.href === context.route &&
      visible(context.button) && context.button.parentElement === context.parent &&
      (!context.header || context.button.closest('header') === context.header) &&
      context.button.closest('[data-turn-key]') === context.turn &&
      (!context.turn || context.turn.getAttribute('data-turn-key') === context.turnKey);
  }

  function announce(text, context) {
    mount();
    if (!status) return;
    clearTimeout(delivery);
    clearTimeout(clearMessage);
    status.textContent = "";
    // A separate task makes another identical native confirmation observable.
    delivery = setTimeout(() => {
      delivery = null;
      if (!owned(context) || !status?.isConnected) return;
      if (text === 'Message copié' && ![context.initial, 'Copié'].includes(name(context.button))) return;
      status.textContent = text;
      clearMessage = setTimeout(() => {
        clearMessage = null;
        if (status) status.textContent = "";
      }, 10000);
    }, text === 'Message copié' ? 500 : 0);
  }

  function cancel() {
    copy = share = null;
    for (const entry of copyLabels.values()) {
      if (!owned(entry.context)) entry.release();
      else if (entry.native === entry.initial) entry.release(false);
    }
    // An operation that never became busy needs no persistent instance hook.
    // A genuinely busy guard follows native re-enable independently instead.
    if (guard && !guard.busy) guard.release(false);
    clearTimeout(expiry);
    clearTimeout(delivery);
    delivery = null;
    expiry = null;
  }

  function arm(button, turn) {
    const context = { button, parent: button.parentElement, turn,
      initial: name(button),
      turnKey: turn?.getAttribute('data-turn-key'), route: window.location.href };
    expiry = setTimeout(cancel, 15000);
    return context;
  }

  function onClick(event) {
    const button = event.target?.closest?.('button');
    if (guard?.busy && button === guard.button && owned(guard.context)) {
      // aria-disabled does not suppress activation by itself. Only this busy
      // native Share button is blocked, as HTML disabled previously did.
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const unavailable = copyLabels.get(button);
    if (unavailable?.unavailable && unavailable.native === 'Copié' &&
        name(button) === unavailable.initial && owned(unavailable.context) && button.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    // A later activation owns subsequent feedback. Never replay stale work.
    cancel();
    clearTimeout(delivery);
    delivery = null;
    if (!active || !french() || event.defaultPrevented || event.button > 0 ||
        event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (!visible(button) || button.disabled || button.closest(popup)) return;
    const turn = button.closest('[data-turn-key]');
    if (turn && ["Copier", "Copier le message"].includes(name(button))) {
      copy = arm(button, turn);
      protectCopyName(copy);
    } else if (!turn && button.getAttribute('type') === 'button' && button.closest('header') && name(button) === "Partager" && document.querySelector('[data-turn-key]')) {
      share = arm(button, null);
      share.header = button.closest('header');
      share.busy = false;
      share.announced = false;
      // An unchanged earlier notification is not this operation's result.
      share.previousToasts = new Set(document.querySelectorAll(toastSelector));
      if (document.activeElement === button) protect(share);
    }
  }

  function respectDisabledWrites(records) {
    for (const [button, entry] of copyLabels) {
      // A direct prototype write can bypass the instance wrappers. Our first
      // write starts from null/false; a later true -> anything is external.
      if (entry.unavailable && records.some(record => record.target === button &&
          record.attributeName === 'aria-disabled' && record.oldValue === 'true')) entry.unavailable = false;
    }
  }

  function inspect(records = []) {
    if (!active) return;
    maintainCopyIcons();
    respectDisabledWrites(records);
    for (const [button, entry] of copyLabels) {
      if (!owned(entry.context) || name(button) !== entry.initial) entry.release();
    }
    if (guard && (!owned(guard.context) || name(guard.button) !== 'Partager')) guard.release();
    if (!french()) {
      cancel();
      clearTimeout(delivery);
      clearTimeout(clearMessage);
      status?.remove();
      status = null;
      return;
    }
    mount();
    if (copy) {
      if (!owned(copy)) copy = null;
      else if (name(copy.button) === "Copié") {
        const completed = copy;
        copy = null;
        announce("Message copié", completed);
      } else if (!["Copier", "Copier le message"].includes(name(copy.button))) copy = null;
    }
    if (!share) return;
    if (!owned(share) || name(share.button) !== "Partager") { share = null; return; }
    if (share.button.disabled || records.some(record => record.type === "attributes" &&
        record.target === share.button && record.attributeName === "disabled" && record.oldValue !== null)) share.busy = true;
    if (!share.announced && share.busy) {
      for (const toast of document.querySelectorAll(toastSelector)) {
        if (share.previousToasts.has(toast) || !visible(toast) || toast.getAttribute('data-visible') === 'false') continue;
        const title = toast.querySelector('[data-title]');
        // The native custom title contains both sentences plus action controls.
        // Mirror only the two public sentences actually present in that title.
        const text = title?.textContent || "";
        if (!text.includes(shareText)) continue;
        share.announced = true;
        announce(shareText + (text.includes(privacyText) ? " " + privacyText : ""), share);
        break;
      }
    }
  }

  const observer = new MutationObserver(inspect);
  observer.observe(document, { subtree: true, childList: true, characterData: true,
    attributes: true, attributeOldValue: true,
    attributeFilter: ["aria-label", "aria-labelledby", "aria-describedby", "role", "tabindex", "focusable", "type", "disabled", "aria-disabled", "lang", "hidden", "inert", "aria-hidden", "data-visible", "data-turn-key"] });
  window.addEventListener("click", onClick, true);
  document.addEventListener('focusin', onIconFocus, true);
  window.addEventListener("popstate", cancel);
  window.addEventListener("hashchange", cancel);
  window[marker] = {
    get active() { return active; },
    stop() {
      if (!active) return;
      respectDisabledWrites(observer.takeRecords?.() || []);
      active = false;
      cancel();
      guard?.release();
      for (const entry of copyLabels.values()) entry.release();
      for (const svg of copyIcons.keys()) releaseIcon(svg);
      observer.disconnect();
      clearTimeout(delivery);
      clearTimeout(clearMessage);
      window.removeEventListener("click", onClick, true);
      document.removeEventListener('focusin', onIconFocus, true);
      window.removeEventListener("popstate", cancel);
      window.removeEventListener("hashchange", cancel);
      status?.remove();
      status = null;
      delete window[marker];
    }
  };
  mount();
  maintainCopyIcons();
})();
