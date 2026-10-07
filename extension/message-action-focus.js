/* Return from cancelled native message sharing/editing to its exact opener.
 * No Escape is consumed and no message/draft text is inspected or retained. */
(() => {
  'use strict';
  const marker = Symbol.for('chatgpt-navigation-continue.message-action-focus.v1');
  if (window[marker]?.active) return;
  const labels = ['Partager', 'Partager le prompt', 'Modifier le message'];
  const modalSelector = '[role="dialog"][aria-modal="true"]';
  const nestedSelector = '[role="dialog"], [role="menu"], [role="listbox"]';
  const editorSelector = '[role="textbox"][contenteditable="true"][aria-label="Modifier le message"]';
  let active = true, context = null, pending = null, ownFocus = false;
  const timers = new Set();
  const french = () => /^fr(?:-|$)/i.test(document.documentElement?.lang || '');
  const name = node => node?.getAttribute('aria-label');
  const hidden = node => !node?.isConnected || !!node.closest('[hidden], [inert], [aria-hidden="true"]') || !node.getClientRects().length;
  function later(fn, delay = 0) {
    const timer = setTimeout(() => { timers.delete(timer); if (active) fn(); }, delay);
    timers.add(timer); return timer;
  }
  function forget() {
    context = pending = null;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  }
  function valid(entry) {
    return active && french() && window.location.href === entry.route && entry.turn.isConnected &&
      entry.turn.getAttribute('data-turn-key') === entry.turnKey;
  }
  function matchingButton(button, entry) {
    return button?.tagName === 'BUTTON' && button.isConnected && button.getAttribute('type') === 'button' &&
      name(button) === entry.label && button.closest('[data-turn-key]') === entry.turn && !button.disabled;
  }
  function returnButton(entry) {
    if (entry.button.isConnected) return matchingButton(entry.button, entry) &&
      entry.button.parentElement === entry.parent ? entry.button : null;
    if (!entry.edit) return null;
    const matches = [...entry.turn.querySelectorAll('button[aria-label="Modifier le message"]')]
      .filter(button => matchingButton(button, entry));
    return matches.length === 1 ? matches[0] : null;
  }
  function associate() {
    const entry = context;
    if (!entry || entry.surface) return;
    if (!valid(entry)) { forget(); return; }
    if (entry.edit) {
      const candidates = [...entry.turn.querySelectorAll(editorSelector)].filter(editor =>
        editor.closest('[data-turn-key]') === entry.turn && !entry.previousEditors.has(editor) && !hidden(editor));
      if (candidates.length === 1) {
        const editor = candidates[0], form = editor.closest('form');
        if (form && !entry.previousForms.has(form) && form.closest('[data-turn-key]') === entry.turn &&
            form.querySelector('button[type="submit"]') && [...form.querySelectorAll('button[type="button"]')]
              .some(button => button.textContent.trim() === 'Annuler')) {
          entry.surface = form; entry.editor = editor;
        }
      }
    } else {
      const candidates = [...document.querySelectorAll(modalSelector)]
        .filter(modal => !entry.previousModals.has(modal) && !hidden(modal));
      if (candidates.length === 1 && candidates[0].contains(document.activeElement)) entry.surface = candidates[0];
    }
    if (entry.surface) { clearTimeout(entry.openTimer); timers.delete(entry.openTimer); }
  }
  function closed(entry) {
    return hidden(entry.surface) || (entry.edit && hidden(entry.editor));
  }
  function restore(entry) {
    if (pending !== entry || !active) return;
    if (!valid(entry)) { forget(); return; }
    if (!closed(entry)) return;
    const button = returnButton(entry);
    // Closing a Radix modal may unhide the background after removing its panel.
    if (!button || hidden(button)) return;
    const focused = document.activeElement;
    if (focused !== button && focused !== document.body && focused !== document.documentElement &&
        !(entry.surface.contains(focused) && closed(entry))) { forget(); return; }
    if (focused !== button) {
      ownFocus = true;
      try { button.focus({ preventScroll: true }); }
      finally { ownFocus = false; }
    }
    entry.restored = true;
  }
  function check() {
    const entry = pending;
    if (!entry || entry.queued) return;
    entry.queued = true;
    later(() => { entry.queued = false; restore(entry); });
  }
  function click(event) {
    const button = event.target?.closest?.('button');
    if (context?.surface?.contains(event.target)) { if (pending) forget(); return; }
    forget();
    if (!french() || event.defaultPrevented || event.button > 0 || event.ctrlKey || event.altKey ||
        event.metaKey || event.shiftKey || !button || button.getAttribute('type') !== 'button' ||
        !labels.includes(name(button)) || button.disabled || hidden(button) || button.closest(nestedSelector)) return;
    const turn = button.closest('[data-turn-key]');
    if (!turn) return;
    context = { button, parent: button.parentElement, turn, turnKey: turn.getAttribute('data-turn-key'),
      label: name(button), edit: name(button) === 'Modifier le message', route: window.location.href,
      previousModals: new Set(document.querySelectorAll(modalSelector)),
      previousEditors: new Set(turn.querySelectorAll(editorSelector)), previousForms: new Set(turn.querySelectorAll('form')),
      surface: null, restored: false };
    const entry = context;
    entry.openTimer = later(() => { if (context === entry && !entry.surface) forget(); }, 750);
  }
  function keydown(event) {
    if (pending) { if (event.key === 'Escape' && event.repeat) return; forget(); return; }
    associate();
    const entry = context;
    if (!entry?.surface || !valid(entry) || closed(entry) || event.key !== 'Escape' || event.repeat ||
        event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    const focused = document.activeElement, target = event.target;
    if (!entry.surface.contains(focused)) return;
    const inner = focused?.closest?.(nestedSelector) || target?.closest?.(nestedSelector);
    if (inner && inner !== entry.surface) return;
    if (!entry.surface.contains(target) && target !== document.body && target !== document.documentElement) return;
    pending = entry;
    later(() => {
      restore(entry);
      if (pending !== entry) return;
      if (valid(entry) && !closed(entry)) {
        // A consumed Escape is not a dismissal. Keep the same proven surface
        // for a later attempt, but let this short focus lease expire.
        pending = null;
        for (const timer of timers) clearTimeout(timer);
        timers.clear();
      } else forget();
    }, 150);
  }
  function focusin(event) {
    if (ownFocus || !context) return;
    associate();
    const entry = context;
    if (!entry) return;
    if (pending) {
      const button = returnButton(entry);
      if (event.target !== button && event.target !== document.body && event.target !== document.documentElement &&
          !entry.surface.contains(event.target)) forget();
      else check();
    } else if (entry.surface && !closed(entry) && event.target !== document.body &&
        !entry.surface.contains(event.target)) forget();
  }
  function focusout() { if (pending && !ownFocus) check(); }
  function inspect() {
    if (!context) return;
    if (!valid(context)) { forget(); return; }
    associate();
    if (pending) { if (!pending.restored) restore(pending); else check(); }
    else if (context?.surface && closed(context)) forget();
  }
  const observer = new MutationObserver(inspect);
  observer.observe(document, { subtree: true, childList: true, attributes: true,
    attributeFilter: ['aria-hidden', 'aria-modal', 'aria-label', 'role', 'hidden', 'inert', 'style', 'class',
      'disabled', 'data-turn-key', 'contenteditable', 'type', 'lang'] });
  window.addEventListener('click', click, true);
  window.addEventListener('keydown', keydown, true);
  document.addEventListener('focusin', focusin, true);
  document.addEventListener('focusout', focusout, true);
  function pointerdown(event) { if (pending || (context?.surface && !context.surface.contains(event.target))) forget(); }
  document.addEventListener('pointerdown', pointerdown, true);
  window.addEventListener('popstate', forget);
  window.addEventListener('hashchange', forget);
  window.addEventListener('pagehide', forget);
  window[marker] = { get active() { return active; }, stop() {
    if (!active) return;
    active = false; forget(); observer.disconnect();
    window.removeEventListener('click', click, true);
    window.removeEventListener('keydown', keydown, true);
    document.removeEventListener('focusin', focusin, true);
    document.removeEventListener('focusout', focusout, true);
    document.removeEventListener('pointerdown', pointerdown, true);
    window.removeEventListener('popstate', forget);
    window.removeEventListener('hashchange', forget);
    window.removeEventListener('pagehide', forget);
    delete window[marker];
  } };
})();
