const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('extension/add-menu-accessibility.js', 'utf8');

// Event phases include the native editor blur dismissal and the native window
// key handler installed on opening. Physical Chromium/JAWS reception is separate.
function environment() {
  const microtasks = [], records = [], windowListeners = new Map(), documentListeners = new Map();
  let observer, observerOptions, nativeWindowKeydown, nativeBlur, writes = 0;
  function emit(listeners, event) {
    for (const listener of listeners.get(event.type) || []) {
      listener(event); if (event.stopped) break;
    }
  }
  function event(type, target, options = {}) {
    return { type, target, defaultPrevented: false, stopped: false, ...options,
      preventDefault() { this.defaultPrevented = true; },
      stopImmediatePropagation() { this.stopped = true; } };
  }
  class Element {
    constructor(tag, attrs = {}) { this.tagName = tag.toUpperCase(); this.attrs = { ...attrs }; this.children = []; this.parentElement = null; this.nodeType = 1; this.clicks = 0; this.textContent = ''; }
    get isConnected() { let node = this; while (node.parentElement) node = node.parentElement; return node === document.documentElement; }
    get disabled() { return this.hasAttribute('disabled'); }
    get id() { return this.getAttribute('id') || ''; }
    getClientRects() { return this.cssHidden ? [] : [{}]; }
    getAttribute(name) { return this.attrs[name] ?? null; }
    hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
    setAttribute(name, value) { this.attrs[name] = String(value); writes++; records.push({ type: 'attributes', target: this, attributeName: name }); }
    removeAttribute(name) { delete this.attrs[name]; writes++; records.push({ type: 'attributes', target: this, attributeName: name }); }
    append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } records.push({ type: 'childList', target: this, addedNodes: nodes, removedNodes: [] }); return this; }
    remove() { const parent = this.parentElement; if (!parent) return; parent.children.splice(parent.children.indexOf(this), 1); this.parentElement = null; records.push({ type: 'childList', target: parent, addedNodes: [], removedNodes: [this] }); }
    contains(node) { for (; node; node = node.parentElement) if (node === this) return true; return false; }
    matches(selector) {
      return selector.split(',').some(part => {
        part = part.trim();
        if (part === ':disabled') return this.disabled;
        const tag = /^[a-z]+/.exec(part)?.[0];
        if (tag && tag.toUpperCase() !== this.tagName) return false;
        const cls = /\.([\w-]+)/.exec(part)?.[1];
        if (cls && !(this.getAttribute('class') || '').split(/\s+/).includes(cls)) return false;
        return [...part.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)].every(([, key, value]) => this.hasAttribute(key) && (value === undefined || this.getAttribute(key) === value));
      });
    }
    closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
    querySelectorAll(selector) { const out = []; const visit = node => { for (const child of node.children) { if (child.matches(selector)) out.push(child); visit(child); } }; visit(this); return out; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    focus() {
      if (this.disabled || this === document.activeElement) return;
      const old = document.activeElement;
      if (old) {
        const blur = event('blur', old, { relatedTarget: this });
        emit(documentListeners, blur);
        if (!blur.stopped) nativeBlur?.(blur);
      }
      document.activeElement = this;
    }
    click() { if (!this.disabled) { this.clicks++; this.onClick?.(); } }
  }
  const document = {
    documentElement: new Element('html'), activeElement: null,
    querySelector(selector) { return this.documentElement?.querySelector(selector) || null; },
    querySelectorAll(selector) { return this.documentElement?.querySelectorAll(selector) || []; },
    addEventListener(type, listener, capture) { assert.equal(capture, true); const list = documentListeners.get(type) || []; list.push(listener); documentListeners.set(type, list); },
    removeEventListener(type, listener, capture) { assert.equal(capture, true); documentListeners.set(type, (documentListeners.get(type) || []).filter(value => value !== listener)); }
  };
  document.body = new Element('body'); document.documentElement.append(document.body); document.activeElement = document.body;
  const window = { addEventListener(type, listener, capture) { assert.equal(capture, true); const list = windowListeners.get(type) || []; list.push(listener); windowListeners.set(type, list); },
    removeEventListener(type, listener, capture) { assert.equal(capture, true); windowListeners.set(type, (windowListeners.get(type) || []).filter(value => value !== listener)); } };
  class MutationObserver { constructor(callback) { observer = callback; } observe(root, options) { assert.equal(root, document); observerOptions = options; } disconnect() { observer = null; } }
  const context = vm.createContext({ window, document, MutationObserver, queueMicrotask: fn => microtasks.push(fn) });
  const element = (tag, attrs) => new Element(tag, attrs);
  const mount = (...nodes) => document.body.append(...nodes);
  const flush = () => {
    for (let i = 0; i < 30; i++) {
      const batch = records.splice(0).filter(record => record.type !== 'attributes' || observerOptions?.attributeFilter.includes(record.attributeName));
      if (batch.length && observer) observer(batch);
      if (!microtasks.length) return;
      microtasks.splice(0).forEach(fn => fn());
    }
    throw new Error('Observer did not converge');
  };
  const run = () => { vm.runInContext(source, context); flush(); };
  const key = (target, key, options = {}) => {
    const e = event('keydown', target, { key, ...options }); emit(windowListeners, e);
    if (!e.stopped) nativeWindowKeydown?.(e);
    if (!e.defaultPrevented && (key === 'Enter' || key === ' ')) target.click();
    if (!e.defaultPrevented && key === 'Tab') options.tabDestination?.focus();
    flush(); return e;
  };
  function composer() {
    const editor = element('div', { class: 'ProseMirror', role: 'textbox', contenteditable: 'true' });
    editor.textContent = 'Une rédaction conservée, sans envoi.';
    const trigger = element('button', { 'aria-label': 'Ajouter des fichiers et plus encore', 'aria-expanded': 'false' });
    mount(editor, trigger); editor.focus();
    let popup = null, nativeKeyCalls = 0, nativeBlurCalls = 0;
    const close = () => { trigger.setAttribute('aria-expanded', 'false'); popup?.root.remove(); nativeWindowKeydown = null; };
    const open = (attrs = [], rootAttrs = {}) => {
      const root = element('div', rootAttrs); const scroll = element('div', { 'data-mention-list-scroll-area': '' });
      const section = element('div', { 'data-mention-section-id': 'chatgpt-actions' });
      const buttons = [element('button', { 'data-list-navigation-item': 'true', ...(attrs[0] || {}) }), element('button', { 'data-list-navigation-item': 'true', ...(attrs[1] || {}) })];
      section.append(...buttons); scroll.append(section);
      const apps = element('div', { 'data-mention-section-id': 'apps' });
      const app = element('button', { 'data-list-navigation-item': 'true' }); apps.append(app); scroll.append(apps); buttons.push(app);
      root.append(scroll); mount(root); popup = { root, scroll, section, buttons };
      trigger.setAttribute('aria-expanded', 'true');
      // The native index deliberately targets the last button, exposing a
      // wrong-action or double-action regression if capture ordering fails.
      nativeWindowKeydown = e => { nativeKeyCalls++; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); buttons.at(-1).click(); } };
      nativeBlur = e => { if (e.target === editor) { nativeBlurCalls++; close(); } };
      flush(); return popup;
    };
    trigger.onClick = () => trigger.getAttribute('aria-expanded') === 'true' ? close() : open();
    return { editor, trigger, open, close, nativeKeyCalls: () => nativeKeyCalls, nativeBlurCalls: () => nativeBlurCalls };
  }
  function bootWithoutHTML() {
    const html = document.documentElement;
    document.documentElement = null;
    vm.runInContext(source, context);
    flush();
    document.documentElement = html;
    const change = { type: 'childList', target: document, addedNodes: [html], removedNodes: [] };
    records.push(change);
    flush();
  }
  return { bootWithoutHTML, document, window, context, element, mount, flush, run, key, composer, writes: () => writes, listeners: () => ({ windowListeners, documentListeners }), observer: () => observer, api: () => window[Symbol.for('chatgpt-navigation-continue.add-menu.v2')] };
}

test('opening keeps the native menu through editor blur, announces it, and preserves draft and button identity', () => {
  const e = environment(); const c = e.composer(); e.run(); const p = c.open();
  assert.equal(e.document.activeElement, p.buttons[0]);
  assert.equal(c.nativeBlurCalls(), 0); assert.equal(p.root.isConnected, true);
  assert.equal(p.root.getAttribute('role'), 'menu'); assert.equal(c.trigger.getAttribute('aria-haspopup'), 'menu');
  assert.equal(p.root.getAttribute('aria-label'), 'Ajouter des fichiers et plus encore');
  assert.equal(c.trigger.getAttribute('aria-controls'), p.root.id);
  for (const button of p.buttons) { assert.equal(button.getAttribute('role'), 'menuitem'); assert.equal(button.getAttribute('aria-current'), null); }
  assert.equal(p.section.children[0], p.buttons[0]); assert.equal(c.editor.textContent, 'Une rédaction conservée, sans envoi.');
  assert.deepEqual([...e.listeners().documentListeners.keys()], ['blur']);
  const writes = e.writes(); e.flush(); vm.runInContext(source, e.context); e.flush(); assert.equal(e.writes(), writes);
});

test('Enter and Space activate the actually focused native button once, ahead of the native highlighted index', () => {
  for (const key of ['Enter', ' ', 'Spacebar']) {
    const e = environment(); const c = e.composer(); e.run(); const p = c.open();
    let activated = 0; p.buttons[1].onClick = () => { activated++; c.close(); };
    e.key(p.buttons[0], 'ArrowDown'); assert.equal(e.document.activeElement, p.buttons[1]);
    const event = e.key(p.buttons[1], key);
    assert.equal(event.defaultPrevented, true); assert.equal(activated, 1); assert.equal(p.buttons[1].clicks, 1);
    assert.equal(p.buttons[0].clicks, 0); assert.equal(p.buttons[2].clicks, 0); assert.equal(c.nativeKeyCalls(), 0);
    assert.equal(p.root.isConnected, false); assert.equal(c.editor.textContent, 'Une rédaction conservée, sans envoi.');
  }
});

test('arrows, Home and End wrap across native action and app sections while skipping disabled and hidden items', () => {
  const e = environment(); const c = e.composer(); e.run(); const p = c.open([{ disabled: '' }]);
  assert.equal(e.document.activeElement, p.buttons[1]);
  e.key(p.buttons[1], 'ArrowUp'); assert.equal(e.document.activeElement, p.buttons[2]);
  e.key(p.buttons[2], 'Home'); assert.equal(e.document.activeElement, p.buttons[1]);
  e.key(p.buttons[1], 'End'); assert.equal(e.document.activeElement, p.buttons[2]);
  e.key(p.buttons[2], 'ArrowDown'); assert.equal(e.document.activeElement, p.buttons[1]);
  p.buttons[1].setAttribute('aria-disabled', 'true'); e.flush(); assert.equal(e.document.activeElement, p.buttons[2]);
  p.buttons[2].setAttribute('hidden', ''); e.flush(); e.key(p.buttons[1], 'Enter'); assert.equal(p.buttons[1].clicks, 0);
});

test('Escape closes through the native trigger and restores its focus; Tab preserves forward and backward default traversal', () => {
  for (const key of ['Escape', 'Tab']) for (const shiftKey of key === 'Tab' ? [false, true] : [false]) {
    const e = environment(); const c = e.composer(); const destination = e.element('button'); e.mount(destination); e.run(); const p = c.open();
    const event = e.key(p.buttons[0], key, { shiftKey, tabDestination: destination });
    assert.equal(c.trigger.clicks, 1); assert.equal(c.trigger.getAttribute('aria-expanded'), 'false'); assert.equal(p.root.isConnected, false);
    assert.equal(e.document.activeElement, key === 'Tab' ? destination : c.trigger);
    assert.equal(event.defaultPrevented, key === 'Escape');
    assert.equal(c.trigger.getAttribute('aria-controls'), null); assert.equal(p.buttons[0].getAttribute('role'), null); assert.equal(p.buttons[0].getAttribute('tabindex'), null);
    assert.equal(c.trigger.getAttribute('aria-haspopup'), 'menu'); assert.equal(p.root.getAttribute('aria-label'), null);
  }
});

test('repeat cannot cause another activation; IME, modifiers, nested controls and outside keys retain native behavior', () => {
  const e = environment(); const c = e.composer(); e.run(); const p = c.open();
  e.key(p.buttons[0], 'Enter', { repeat: true }); assert.equal(p.buttons[0].clicks, 0); assert.equal(c.nativeKeyCalls(), 0);
  for (const options of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { shiftKey: true }]) {
    const event = e.key(p.buttons[0], 'ArrowDown', options); assert.equal(event.stopped, false); assert.equal(event.defaultPrevented, false);
  }
  const input = e.element('input'); p.buttons[0].append(input); e.flush();
  assert.equal(e.key(input, 'ArrowDown').stopped, false);
  const outside = e.element('button', { 'data-list-navigation-item': 'true' }); e.mount(outside); e.flush();
  assert.equal(e.key(outside, 'ArrowDown').stopped, false);
  const editor = c.editor; outside.focus(); editor.focus(); outside.focus(); assert.equal(c.nativeBlurCalls(), 1);
  const event = e.key(outside, 'Enter'); assert.equal(event.stopped, false); assert.equal(outside.clicks, 1);
});

test('later popup rendering and route replacement use only fresh connected nodes', () => {
  const e = environment(); const c = e.composer(); e.run();
  c.trigger.setAttribute('aria-expanded', 'true'); e.flush(); assert.equal(e.document.activeElement, c.editor);
  const first = c.open(); const firstId = first.root.id;
  first.root.remove(); c.trigger.remove(); c.editor.remove(); e.flush();
  const replacement = e.composer(); const second = replacement.open();
  assert.equal(e.document.activeElement, second.buttons[0]); assert.notEqual(second.root.id, firstId);
  assert.equal(first.root.getAttribute('role'), null); assert.equal(first.buttons[0].clicks, 0);
  e.key(first.buttons[0], 'ArrowDown'); assert.equal(e.document.activeElement, second.buttons[0]);
  e.key(second.buttons[0], 'Enter'); assert.equal(second.buttons[0].clicks, 1); assert.equal(first.buttons[0].clicks, 0);
});

test('unrelated DOM mutations converge without rewriting attributes or focusing an independent control', () => {
  const e = environment(); const c = e.composer(); const outside = e.element('button'); e.mount(outside); e.run(); outside.focus();
  const p = c.open(); assert.equal(e.document.activeElement, outside);
  const writes = e.writes(); const unrelated = e.element('article'); e.mount(unrelated); e.flush();
  assert.equal(e.writes(), writes); assert.equal(e.document.activeElement, outside);
  unrelated.setAttribute('aria-label', 'autre'); e.flush(); assert.equal(e.writes(), writes + 1);
  assert.equal(p.buttons[0].getAttribute('role'), 'menuitem');
});

test('a retained but hidden popup cannot be reused for a fresh opening', () => {
  const e = environment(); const c = e.composer(); e.run(); const old = c.open();
  c.trigger.setAttribute('aria-expanded', 'false'); e.flush(); old.root.cssHidden = true;
  c.editor.focus(); const fresh = c.open();
  assert.equal(e.document.activeElement, fresh.buttons[0]);
  assert.equal(old.root.getAttribute('role'), null); assert.equal(fresh.root.getAttribute('role'), 'menu');
  const event = e.key(old.buttons[0], 'Enter'); assert.equal(event.stopped, false);
});

test('the closed native trigger announces a menu idempotently before rendering, after closure, and on route replacement', () => {
  const e = environment(); const c = e.composer(); e.run();
  assert.equal(c.trigger.getAttribute('aria-expanded'), 'false'); assert.equal(c.trigger.getAttribute('aria-haspopup'), 'menu');
  assert.equal(c.trigger.getAttribute('aria-controls'), null);
  const writes = e.writes(); e.flush(); vm.runInContext(source, e.context); e.flush(); assert.equal(e.writes(), writes);
  c.open(); c.close(); e.flush(); assert.equal(c.trigger.getAttribute('aria-haspopup'), 'menu');
  c.trigger.remove(); c.editor.remove(); const fresh = e.composer(); e.flush();
  assert.equal(fresh.trigger.getAttribute('aria-expanded'), 'false'); assert.equal(fresh.trigger.getAttribute('aria-haspopup'), 'menu');
});

test('existing native popup names are preserved, and a temporary accessible name restores its original empty value', () => {
  for (const attrs of [{ 'aria-label': 'Fonctionnalités du composeur' }, { 'aria-labelledby': 'native-menu-heading' }, { 'aria-label': '' }]) {
    const e = environment(); const c = e.composer(); e.run(); const p = c.open([], attrs);
    if (attrs['aria-label'] !== '') {
      for (const [name, value] of Object.entries(attrs)) assert.equal(p.root.getAttribute(name), value);
      if (attrs['aria-labelledby']) assert.equal(p.root.getAttribute('aria-label'), null);
    } else assert.equal(p.root.getAttribute('aria-label'), 'Ajouter des fichiers et plus encore');
    c.close(); e.flush();
    for (const [name, value] of Object.entries(attrs)) assert.equal(p.root.getAttribute(name), value);
  }
});

test('a retained hidden expanded composer never receives closure or focus intended for the visible composer', () => {
  const e = environment(); const old = e.composer(); e.run(); const oldPopup = old.open();
  old.trigger.cssHidden = true; oldPopup.root.cssHidden = true;
  const fresh = e.composer(); const popup = fresh.open();
  assert.equal(e.document.activeElement, popup.buttons[0]);
  e.key(popup.buttons[0], 'Escape');
  assert.equal(fresh.trigger.clicks, 1);
  assert.equal(old.trigger.clicks, 0);
  assert.equal(e.document.activeElement, fresh.trigger);
  assert.equal(old.trigger.getAttribute('aria-expanded'), 'true');
});

test('current announcements are removed only from identified native items and restored on closure', () => {
  const e = environment(), c = e.composer();
  const otherRoot = e.element('div', { role: 'menu' }), otherSection = e.element('div', { 'data-mention-section-id': 'other-actions' });
  const other = e.element('button', { 'data-list-navigation-item': 'true', 'aria-current': 'page' }); otherSection.append(other); otherRoot.append(otherSection); e.mount(otherRoot);
  e.run(); const p = c.open([{ 'aria-current': 'true' }, { 'aria-current': 'false' }]);
  assert.equal(p.buttons[0].getAttribute('aria-current'), null); assert.equal(p.buttons[1].getAttribute('aria-current'), null); assert.equal(p.buttons[2].getAttribute('aria-current'), null);
  assert.equal(other.getAttribute('aria-current'), 'page');
  c.close(); e.flush(); assert.equal(p.buttons[0].getAttribute('aria-current'), 'true'); assert.equal(p.buttons[1].getAttribute('aria-current'), 'false'); assert.equal(other.getAttribute('aria-current'), 'page');
  assert.equal(p.buttons[0].getAttribute('role'), null); assert.equal(p.buttons[0].getAttribute('tabindex'), null);
});

test('native current updates are suppressed during the opening and the latest native value restores', () => {
  const e = environment(), c = e.composer(); e.run(); const p = c.open([{ 'aria-current': 'true' }]);
  p.buttons[0].setAttribute('aria-current', 'step'); e.flush(); assert.equal(p.buttons[0].getAttribute('aria-current'), null);
  p.buttons[1].setAttribute('aria-current', 'true'); e.flush(); assert.equal(p.buttons[1].getAttribute('aria-current'), null);
  const writes = e.writes(); e.flush(); assert.equal(e.writes(), writes);
  c.close(); e.flush(); assert.equal(p.buttons[0].getAttribute('aria-current'), 'step'); assert.equal(p.buttons[1].getAttribute('aria-current'), 'true');
});

test('fresh reopenings keep separate current baselines and preserve actual native keyboard activation', () => {
  const e = environment(), c = e.composer(); e.run(); const first = c.open([{ 'aria-current': 'true' }]); c.close(); e.flush(); assert.equal(first.buttons[0].getAttribute('aria-current'), 'true');
  c.editor.focus(); const second = c.open([{ 'aria-current': 'false' }]); assert.equal(second.buttons[0].getAttribute('aria-current'), null);
  let activations = 0; second.buttons[0].onClick = () => { activations++; c.close(); };
  e.key(second.buttons[0], 'Enter'); assert.equal(activations, 1); assert.equal(c.nativeKeyCalls(), 0);
  assert.equal(second.buttons[0].getAttribute('aria-current'), 'false'); assert.equal(first.buttons[0].getAttribute('aria-current'), 'true');
});

test('v2 stop restores trigger and popup attributes, removes only its listeners and cancels queued reconciliation', () => {
  const e = environment(), c = e.composer(); c.trigger.setAttribute('aria-haspopup', 'dialog');
  const foreignWindow = () => {}, foreignBlur = () => {};
  e.window.addEventListener('keydown', foreignWindow, true); e.document.addEventListener('blur', foreignBlur, true);
  e.run(); const p = c.open([{ 'aria-current': 'true', role: 'button', tabindex: '3' }]); const api = e.api(); assert.equal(typeof api.stop, 'function');
  c.trigger.setAttribute('aria-haspopup', 'true'); e.flush(); assert.equal(c.trigger.getAttribute('aria-haspopup'), 'menu');
  // A native update after our last reconciliation must survive cleanup.
  p.buttons[0].setAttribute('aria-current', 'location');
  api.stop(); api.stop(); e.flush();
  assert.equal(e.observer(), null); assert.equal(c.trigger.getAttribute('aria-haspopup'), 'true'); assert.equal(c.trigger.getAttribute('aria-controls'), null);
  assert.equal(p.root.getAttribute('role'), null); assert.equal(p.root.id, ''); assert.equal(p.root.getAttribute('aria-label'), null);
  assert.equal(p.buttons[0].getAttribute('aria-current'), 'location'); assert.equal(p.buttons[0].getAttribute('role'), 'button'); assert.equal(p.buttons[0].getAttribute('tabindex'), '3');
  assert.deepEqual(e.listeners().windowListeners.get('keydown'), [foreignWindow]); assert.deepEqual(e.listeners().documentListeners.get('blur'), [foreignBlur]);
  assert.equal(e.api(), undefined); const nativeBefore = c.nativeKeyCalls(); e.key(p.buttons[0], 'Enter'); assert.equal(c.nativeKeyCalls(), nativeBefore + 1); assert.equal(p.buttons[2].clicks, 1);
});

test('stopping a closed trigger restores its native semantics and permits a fresh v2 installation', () => {
  const e = environment(), c = e.composer(); e.run(); assert.equal(c.trigger.getAttribute('aria-haspopup'), 'menu');
  const old = e.api(); old.stop(); e.flush(); assert.equal(c.trigger.getAttribute('aria-haspopup'), null); assert.equal(e.api(), undefined);
  e.run(); assert.notEqual(e.api(), old); assert.equal(c.trigger.getAttribute('aria-haspopup'), 'menu');
  const p = c.open([{ 'aria-current': 'true' }]); assert.equal(p.buttons[0].getAttribute('aria-current'), null); e.api().stop(); e.flush(); assert.equal(p.buttons[0].getAttribute('aria-current'), 'true');
});


test('document_start boots before HTML and adapts later native widgets without a load event', () => {
  const e = environment(); e.bootWithoutHTML(); const c = e.composer(); e.flush();
  assert.equal(c.trigger.getAttribute('aria-haspopup'), 'menu');
  const p = c.open(); assert.equal(p.root.getAttribute('role'), 'menu');
  assert.equal(e.document.activeElement, p.buttons[0]);
  e.api().stop(); assert.equal(c.trigger.getAttribute('aria-haspopup'), null);
});
