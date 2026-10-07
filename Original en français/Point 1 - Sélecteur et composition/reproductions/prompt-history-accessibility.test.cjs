const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('extension/prompt-history-accessibility.js', 'utf8');
const marker = Symbol.for('chatgpt-navigation-continue.prompt-history.v1');

// Model DOM capture/target/bubble ordering, including a descendant target.
// No observer or microtask runs between mounting the composer and dispatch.
function environment(lang = 'fr-FR', rootPresent = true) {
  class Node {
    constructor(tag, attrs = {}, text = '') { this.tagName = tag; this.attrs = { ...attrs }; this.text = text; this.children = []; this.parentNode = null; this.listeners = []; }
    get isConnected() { for (let n = this; n; n = n.parentNode) if (n === document) return true; return false; }
    get lang() { return this.attrs.lang; }
    get textContent() { return this.text + this.children.map(n => n.textContent).join(''); }
    set textContent(value) { this.text = value; this.children = []; }
    getAttribute(name) { return this.attrs[name] ?? null; }
    hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
    matches(selector) { return selector.split(',').some(part => {
      part = part.trim(); const tag = /^[a-z]+/.exec(part)?.[0];
      if (tag && tag !== this.tagName || part.includes('.ProseMirror') && !(this.attrs.class || '').split(/\s+/).includes('ProseMirror')) return false;
      return [...part.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)].every(([, name, value]) => this.hasAttribute(name) && (value === undefined || this.getAttribute(name) === value));
    }); }
    contains(node) { return this === node || this.children.some(n => n.contains(node)); }
    closest(selector) { for (let n = this; n; n = n.parentNode) if (n.matches(selector)) return n; return null; }
    querySelectorAll(selector) { return this.children.flatMap(n => [...n.matches(selector) ? [n] : [], ...n.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    getClientRects() { return this.isConnected && !this.closest('[hidden]') ? [{}] : []; }
    append(node) { node.remove(); this.children.push(node); node.parentNode = this; }
    remove() { if (this.parentNode) { const p = this.parentNode; p.children.splice(p.children.indexOf(this), 1); this.parentNode = null; } }
    addEventListener(type, callback, capture = false) { this.listeners.push({ type, callback, capture }); }
    removeEventListener(type, callback, capture = false) { this.listeners = this.listeners.filter(e => e.type !== type || e.callback !== callback || e.capture !== capture); }
    dispatchEvent(event) {
      event.target = this; const path = []; for (let n = this; n; n = n.parentNode) path.push(n);
      const invoke = (node, capture, phase) => { event.currentTarget = node; event.eventPhase = phase; for (const entry of [...node.listeners]) if (entry.type === event.type && entry.capture === capture) { entry.callback(event); if (event.immediateStopped) break; } };
      for (const n of path.slice(1).reverse()) { invoke(n, true, 1); if (event.immediateStopped) return !event.defaultPrevented; }
      invoke(this, true, 2); if (!event.immediateStopped) invoke(this, false, 2);
      if (event.bubbles && !event.immediateStopped) for (const n of path.slice(1)) { invoke(n, false, 3); if (event.immediateStopped) break; }
      return !event.defaultPrevented;
    }
  }
  class KeyboardEvent {
    constructor(type, options = {}) { Object.assign(this, { type, key: 'ArrowUp', bubbles: true, defaultPrevented: false }, options); }
    preventDefault() { this.defaultPrevented = true; }
    stopImmediatePropagation() { this.immediateStopped = true; }
  }
  const document = new Node('#document'); document.activeElement = null; document.documentElement = null; document.selection = null; document.getSelection = () => document.selection;
  function root(language = lang) { const html = new Node('html', { lang: language }); document.append(html); document.documentElement = html; return html; }
  if (rootPresent) root();
  const window = {}, context = vm.createContext({ window, document });
  const element = (tag, attrs, text) => new Node(tag, attrs, text);
  function composer(parent = document.documentElement) { const editor = element('div', { class: 'ProseMirror', contenteditable: 'true', role: 'textbox' }); const child = element('p'); editor.append(child); parent.append(editor); document.activeElement = editor; return { editor, child }; }
  const key = (target, options) => { const event = new KeyboardEvent('keydown', options); target.dispatchEvent(event); return event; };
  return { document, window, element, root, composer, key, run: () => vm.runInContext(source, context), api: () => window[marker] };
}

test('the document_start guard installs without a root and captures the first composer key before native bubble or UI load', () => {
  const e = environment('fr-FR', false); let captureCalls = 0;
  e.document.addEventListener('keydown', event => { captureCalls++; assert.equal(event.eventPhase, 1); }, true);
  e.run(); assert.equal(e.document.documentElement, null); assert.equal(e.window[Symbol.for('chatgpt-navigation-continue.ui-accessibility.v2')], undefined);
  e.root(); const { editor, child } = e.composer(); let nativeCalls = 0;
  editor.addEventListener('keydown', event => { assert.equal(event.eventPhase, 3); nativeCalls++; editor.textContent = 'Synthetic history'; });
  const event = e.key(child); assert.equal(captureCalls, 1); assert.equal(nativeCalls, 0); assert.equal(editor.textContent, ''); assert.equal(event.defaultPrevented, false);
  e.api().stop(); e.key(child); assert.equal(nativeCalls, 1); assert.equal(editor.textContent, 'Synthetic history');
});

test('an editor replacement is protected immediately, with a descendant target and collapsed selection', () => {
  const e = environment(); e.run(); const first = e.composer(); first.editor.remove(); const later = e.composer(); let nativeCalls = 0;
  later.editor.addEventListener('keydown', () => nativeCalls++); e.document.selection = { rangeCount: 1, isCollapsed: true, anchorNode: later.child, focusNode: later.child };
  e.key(later.child); assert.equal(nativeCalls, 0); assert.equal(later.editor.textContent, '');
});

test('only an event inside the active connected ProseMirror textbox is guarded', () => {
  for (const change of [
    (e, f) => { f.editor.attrs.class = 'OtherEditor'; },
    (e, f) => { f.editor.attrs.role = 'searchbox'; },
    (e, f) => { f.editor.attrs.contenteditable = 'false'; },
    (e, f) => { e.document.activeElement = e.document.documentElement; },
    (e, f) => { e.composer(); },
    (e, f) => { f.editor.remove(); },
  ]) {
    const e = environment(); e.run(); const f = e.composer(); let calls = 0; f.editor.addEventListener('keydown', () => calls++); change(e, f); e.key(f.child); assert.equal(calls, 1);
  }
  const e = environment(); e.run(); e.composer(); const other = e.element('button'); e.document.documentElement.append(other); let calls = 0; other.addEventListener('keydown', () => calls++); e.key(other); assert.equal(calls, 1);
});

test('language remains an event-time French restriction, including missing language during load', () => {
  const e = environment(); e.run(); const f = e.composer(); let calls = 0; f.editor.addEventListener('keydown', () => calls++);
  for (const lang of ['', 'en', 'french']) { e.document.documentElement.attrs.lang = lang; e.key(f.child); }
  delete e.document.documentElement.attrs.lang; e.key(f.child); assert.equal(calls, 4);
  for (const lang of ['fr', 'fr-BE', 'FR-fr']) { e.document.documentElement.attrs.lang = lang; e.key(f.child); }
  assert.equal(calls, 4);
});

test('native keys, modifiers and composition remain available', () => {
  const e = environment(); e.run(); const f = e.composer(); let calls = 0; f.editor.addEventListener('keydown', () => calls++);
  const exceptions = [{ key: 'ArrowDown' }, { key: 'Enter' }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { shiftKey: true }, { isComposing: true }, { keyCode: 229 }];
  for (const options of exceptions) { const event = e.key(f.child, options); assert.equal(event.defaultPrevented, false); }
  assert.equal(calls, exceptions.length);
});

test('draft text, suggestions, nontext content and active selection remain native', () => {
  const exceptions = [
    (e, f) => { f.child.textContent = 'Synthetic draft'; },
    (e, f) => { f.editor.attrs['aria-expanded'] = 'true'; },
    (e, f) => { f.editor.attrs['aria-activedescendant'] = 'native-suggestion'; },
    ...['img', 'pre', 'table'].map(tag => (e, f) => f.child.append(e.element(tag))),
    (e, f) => f.child.append(e.element('span', { contenteditable: 'false' })),
    (e, f) => f.child.append(e.element('span', { 'data-node-view-wrapper': '' })),
    (e, f) => { e.document.selection = { rangeCount: 1, isCollapsed: false, anchorNode: f.child, focusNode: f.child }; },
    (e, f) => { e.document.selection = { rangeCount: 1, isCollapsed: true, anchorNode: e.document.documentElement, focusNode: f.child }; },
    (e, f) => { e.document.selection = { rangeCount: 1, isCollapsed: true, anchorNode: f.child, focusNode: e.document.documentElement }; },
  ];
  for (const change of exceptions) { const e = environment(); e.run(); const f = e.composer(); let calls = 0; f.editor.addEventListener('keydown', () => calls++); change(e, f); e.key(f.child); assert.equal(calls, 1); }
  const e = environment(); e.run(); const f = e.composer(); f.child.textContent = ' \n\t'; let calls = 0; f.editor.addEventListener('keydown', () => calls++); e.key(f.child); assert.equal(calls, 0); assert.equal(f.editor.textContent, ' \n\t');
});

test('an open native add menu remains usable, scoped to the form or visible fallback button', () => {
  for (const inForm of [true, false]) {
    const e = environment(); e.run(); const form = e.element('form'); e.document.documentElement.append(form); const f = e.composer(inForm ? form : e.document.documentElement);
    const add = e.element('button', { 'aria-label': 'Ajouter des fichiers et plus encore', 'aria-expanded': 'true' }); (inForm ? form : e.document.documentElement).append(add);
    let calls = 0; f.editor.addEventListener('keydown', () => calls++); e.key(f.child); assert.equal(calls, 1);
    add.attrs['aria-expanded'] = 'false'; e.key(f.child); assert.equal(calls, 1);
  }
  for (const hidden of [{ hidden: '' }, { inert: '' }, { 'aria-hidden': 'true' }]) {
    const e = environment(); e.run(); const f = e.composer(); const container = e.element('div', hidden); container.append(e.element('button', { 'aria-label': 'Ajouter des fichiers et plus encore', 'aria-expanded': 'true' })); e.document.documentElement.append(container);
    let calls = 0; f.editor.addEventListener('keydown', () => calls++); e.key(f.child); assert.equal(calls, 0);
  }
});

test('duplicate injection is inert and stop removes only this module listener, permitting restart', () => {
  const e = environment(); let nativeCapture = 0; const native = () => nativeCapture++; e.document.addEventListener('keydown', native, true); e.run(); const api = e.api(); e.run(); assert.equal(e.api(), api); assert.equal(e.document.listeners.length, 2);
  const f = e.composer(); let nativeBubble = 0; f.editor.addEventListener('keydown', () => nativeBubble++); e.key(f.child); assert.equal(nativeCapture, 1); assert.equal(nativeBubble, 0);
  api.stop(); api.stop(); assert.equal(e.document.listeners.length, 1); assert.equal(e.document.listeners[0].callback, native); e.key(f.child); assert.equal(nativeBubble, 1);
  e.run(); e.key(f.child); assert.equal(nativeBubble, 1); assert.equal(e.document.listeners.length, 2);
});
