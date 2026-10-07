const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('extension/reasoning-accessibility.js', 'utf8');

function environment(lang = 'fr-FR') {
  const records = [], timers = [];
  const callbacks = [];
  let writes = 0;
  class Node {
    constructor(type) { this.nodeType = type; this.parentElement = null; this.childNodes = []; }
    get isConnected() { let n = this; while (n.parentElement) n = n.parentElement; return n === document.documentElement; }
    get nextSibling() { return this.parentElement?.childNodes[this.parentElement.childNodes.indexOf(this) + 1] || null; }
    remove() { if (!this.parentElement) return; const p = this.parentElement; p.childNodes.splice(p.childNodes.indexOf(this), 1); this.parentElement = null; writes++; records.push({ type: 'childList', target: p, removedNodes: [this], addedNodes: [] }); }
    appendChild(node) { return this.insertBefore(node, null); }
    insertBefore(node, sibling) { node.remove(); const index = sibling ? this.childNodes.indexOf(sibling) : this.childNodes.length; assert.ok(index >= 0); this.childNodes.splice(index, 0, node); node.parentElement = this; writes++; records.push({ type: 'childList', target: this, removedNodes: [], addedNodes: [node] }); return node; }
    append(...nodes) { nodes.forEach(node => this.appendChild(node)); return this; }
    compareDocumentPosition(other) { const all = []; const visit = n => { all.push(n); n.childNodes.forEach(visit); }; visit(document.documentElement); return all.indexOf(this) < all.indexOf(other) ? 4 : all.indexOf(this) > all.indexOf(other) ? 2 : 0; }
    get textContent() { return this.nodeType === 3 ? this.value : this.childNodes.map(node => node.textContent).join(''); }
    set textContent(value) { if (this.nodeType === 3) { this.value = value; writes++; records.push({ type: 'characterData', target: this }); return; } for (const child of [...this.childNodes]) child.remove(); if (value !== '') this.appendChild(new Text(value)); }
  }
  class Text extends Node { constructor(value) { super(3); this.value = value; } get nodeValue() { return this.value; } }
  class Element extends Node {
    constructor(tag, attrs = {}) { super(1); this.tagName = tag.toUpperCase(); this.attrs = { ...attrs }; this.style = {}; }
    get children() { return this.childNodes.filter(node => node.nodeType === 1); }
    get lang() { return this.getAttribute('lang'); } set lang(value) { this.setAttribute('lang', value); }
    get className() { return this.getAttribute('class') || ''; } set className(value) { this.setAttribute('class', value); }
    hasAttribute(key) { return Object.hasOwn(this.attrs, key); }
    getAttribute(key) { return this.attrs[key] ?? null; }
    setAttribute(key, value) { this.attrs[key] = String(value); writes++; records.push({ type: 'attributes', target: this, attributeName: key }); }
    removeAttribute(key) { delete this.attrs[key]; writes++; records.push({ type: 'attributes', target: this, attributeName: key }); }
    matches(selector) {
      return selector.split(',').some(part => {
        part = part.trim(); const tag = /^[a-z][a-z0-9]*/.exec(part)?.[0]; if (tag && tag.toUpperCase() !== this.tagName) return false;
        const className = /\.([\w-]+)/.exec(part)?.[1]; if (className && !this.className.split(/\s+/).includes(className)) return false;
        return [...part.matchAll(/\[([^=~\]]+)(~?)(?:="([^"]*)")?\]/g)].every(([, key, token, value]) => this.hasAttribute(key) && (value === undefined || (token ? this.getAttribute(key).split(/\s+/).includes(value) : this.getAttribute(key) === value)));
      });
    }
    closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
    querySelectorAll(selector) { const out = []; const visit = n => { for (const child of n.childNodes) { if (child.nodeType === 1 && child.matches(selector)) out.push(child); visit(child); } }; visit(this); return out; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }
  const document = {
    documentElement: new Element('html', { lang }), listeners: {},
    querySelectorAll(selector) { return this.documentElement?.querySelectorAll(selector) || []; },
    getElementById(id) { return this.querySelectorAll('[id]').find(node => node.getAttribute('id') === id) || null; },
    createElement(tag) { return new Element(tag); },
    addEventListener(event, listener) { this.listeners[event] = listener; },
    removeEventListener(event, listener) { if (this.listeners[event] === listener) delete this.listeners[event]; }
  };
  class MutationObserver { constructor(cb) { this.cb = cb; callbacks.push(cb); } observe(root) { assert.ok(root === document || (root && root === document.documentElement)); } disconnect() { const index = callbacks.indexOf(this.cb); if (index >= 0) callbacks.splice(index, 1); } }
  const context = vm.createContext({ window: {}, document, MutationObserver, WeakRef, clearTimeout() {}, setTimeout: (fn, delay) => { assert.equal(delay, 100); timers.push(fn); return timers.length; } });
  const element = (tag, attrs, text) => { const node = new Element(tag, attrs); if (text !== undefined) node.textContent = text; return node; };
  const flush = () => { for (let i = 0; i < 30; i++) { if (records.length && callbacks.length) { const batch = records.splice(0); callbacks.forEach(callback => callback(batch)); } if (!timers.length) return; timers.splice(0).forEach(fn => fn()); } throw new Error('Mutation loop'); };
  const observerOnly = () => { const batch = records.splice(0); callbacks.forEach(callback => callback(batch)); };
  const run = () => { vm.runInContext(source, context); flush(); };
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
  return { bootWithoutHTML, document, element, flush, observerOnly, run, context, writes: () => writes, records };
}

const owned = (turn, kind) => turn.querySelector(`[${kind === 'heading' ? 'data-chatgpt-reasoning-accessibility' : 'data-chatgpt-reasoning-accessibility-v2'}="${kind}"]`);
function computedName(button, document) {
  const references = button.getAttribute('aria-labelledby');
  // Explicitly referenced hidden content contributes to the name; it wins
  // over aria-label. This models the regression, unlike an attribute-only test.
  if (references) return references.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ');
  return button.getAttribute('aria-label') || '';
}
function phase(overrides = {}) { return { completed: false, hasFinalAssistantStarted: false, items: [{ type: 'reasoning' }], ...overrides }; }
function fibers(header, props = phase(), alternate, committed = true) {
  const state = {};
  const owner = { memoizedProps: props };
  const root = { stateNode: state };
  owner.return = root;
  const component = { memoizedProps: { canExpand: true, defaultExpanded: true, shouldAnimateInitialCollapse: false, summary: 'Native summary' }, return: owner };
  header.__reactFiber$test = { return: component };
  if (alternate) {
    const otherRoot = { stateNode: state };
    const other = { memoizedProps: alternate, return: otherRoot };
    const otherComponent = { memoizedProps: { canExpand: true, defaultExpanded: true, shouldAnimateInitialCollapse: false, summary: 'Native summary' }, return: other };
    component.alternate = otherComponent; owner.alternate = other;
    if (committed) state.current = otherRoot;
  } else if (committed) state.current = root;
  return owner;
}
function fixture(e, phaseProps = phase()) {
  const turn = e.element('article', { 'data-turn-key': 'turn' });
  const user = e.element('h4', { class: 'sr-only' }, 'Vous avez dit :');
  const assistant = e.element('div', {});
  const anchor = e.element('span', { hidden: '', 'data-chatgpt-agent-turn-start': '' });
  const group = e.element('div', {});
  const header = e.element('div', { class: 'group/activity-header' });
  const button = e.element('button', { 'aria-expanded': 'true', 'aria-labelledby': 'summary' });
  const label = e.element('span', { id: 'summary' }, 'Recherche en cours');
  const chevron = e.element('span', {}, '');
  header.append(button, label, chevron); group.append(header);
  const body = e.element('div', { class: '-ms-2 ps-2' }, 'CORPS PRIVÉ'); group.append(body);
  assistant.append(anchor, group); turn.append(user, assistant); e.document.documentElement.append(turn);
  const owner = fibers(header, phaseProps);
  return { turn, user, assistant, anchor, group, header, button, label, chevron, body, owner };
}

function regionalProps(overrides = {}) {
  return { region: { kind: 'prefix' }, completed: false, reasoningRecap: null,
    activeSummary: null, canExpand: true, hasStandaloneItems: false, hideHeader: false, ...overrides };
}
function regionalFixture(e, local = regionalProps(), global = phase()) {
  const f = fixture(e, global);
  f.component = f.header.__reactFiber$test.return;
  f.component.memoizedProps = local;
  return f;
}

test('GPT-6 prefix and suffix disclosures use their local completed state despite the global reply phase', () => {
  for (const kind of ['prefix', 'suffix']) for (const completed of [false, true]) {
    const e = environment();
    const f = regionalFixture(e, regionalProps({ region: { kind }, completed }),
      phase({ completed: false, hasFinalAssistantStarted: !completed }));
    if (completed) f.label.textContent = 'Réfléchi pendant 9 min 17 s';
    e.run();
    assert.equal(f.button.parentElement, f.header); assert.equal(f.body.parentElement, f.group);
    assert.equal(owned(f.turn, 'heading').nextSibling, f.anchor);
    if (completed) {
      assert.equal(owned(f.turn, 'summary'), null); assert.equal(owned(f.turn, 'caption'), null);
      assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
      assert.equal(computedName(f.button, e.document), 'Réfléchi pendant 9 min 17 s');
      assert.equal(f.label.hasAttribute('hidden'), false); assert.equal(f.label.getAttribute('aria-hidden'), 'true');
    } else {
      assert.equal(owned(f.turn, 'summary').textContent, 'Recherche en cours');
      assert.equal(f.group.querySelectorAll('[data-chatgpt-reasoning-accessibility-v2="summary"]').length, 1);
      assert.equal(owned(f.turn, 'summary').nextSibling, null);
      assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
      assert.equal(f.label.hasAttribute('hidden'), true); assert.equal(f.label.getAttribute('aria-hidden'), 'true');
    }
  }
});

test('GPT-6 activity can finish then resume with the native control and the status kept after all details', () => {
  for (const kind of ['prefix', 'suffix']) {
    const e = environment(); const f = regionalFixture(e, regionalProps({ region: { kind } }));
    const handler = () => 'native'; f.button.onclick = handler; f.button.setAttribute('aria-label', 'Nom natif');
    e.run(); const heading = owned(f.turn, 'heading');
    f.component.memoizedProps.completed = true; f.label.textContent = 'Réflexion terminée'; e.flush();
    assert.equal(owned(f.turn, 'summary'), null); assert.equal(owned(f.turn, 'caption'), null);
    assert.equal(f.button.getAttribute('aria-label'), 'Nom natif');
    assert.equal(computedName(f.button, e.document), 'Réflexion terminée'); assert.equal(f.label.hasAttribute('hidden'), false);
    f.owner.memoizedProps = phase({ completed: true, hasFinalAssistantStarted: true });
    f.component.memoizedProps.completed = false; f.label.textContent = 'Vérification actuelle'; e.flush();
    const summary = owned(f.turn, 'summary'); assert.equal(summary.textContent, 'Vérification actuelle');
    const detail = e.element('div', {}, 'Détail natif'); f.group.appendChild(detail); e.observerOnly();
    assert.equal(summary.nextSibling, null); assert.ok(detail.compareDocumentPosition(summary) & 4); e.flush();
    f.button.setAttribute('aria-expanded', 'false'); e.observerOnly();
    assert.equal(summary.hasAttribute('hidden'), true); assert.equal(summary.getAttribute('aria-hidden'), 'true'); e.flush();
    f.label.textContent = 'Dernier état'; e.flush(); assert.equal(summary.textContent, 'Dernier état');
    f.button.setAttribute('aria-expanded', 'true'); e.observerOnly();
    assert.equal(summary.hasAttribute('hidden'), false); assert.equal(summary.getAttribute('aria-hidden'), null); e.flush();
    assert.equal(summary.nextSibling, null); assert.equal(f.button.onclick, handler);
    assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
    assert.equal(owned(f.turn, 'heading'), heading); assert.equal(f.body.parentElement, f.group);
  }
});

test('incomplete or malformed nearest GPT-6 contracts cannot borrow an outer valid disclosure', () => {
  const invalid = [];
  for (const missing of ['region', 'completed', 'reasoningRecap', 'activeSummary', 'hasStandaloneItems', 'hideHeader']) {
    const props = regionalProps(); delete props[missing]; invalid.push(props);
  }
  for (const region of [null, 'prefix', {}, { kind: 'other' }]) invalid.push(regionalProps({ region }));
  for (const completed of [undefined, null, 'false']) invalid.push(regionalProps({ completed }));
  for (const key of ['hasStandaloneItems', 'hideHeader']) invalid.push(regionalProps({ [key]: 'false' }));
  for (const canExpand of [false, undefined, 'true']) invalid.push(regionalProps({ canExpand }));
  for (const props of invalid) {
    const e = environment(); const f = regionalFixture(e, props);
    f.component.return = { memoizedProps: regionalProps(), return: f.owner };
    e.run();
    assert.equal(owned(f.turn, 'summary'), null); assert.equal(owned(f.turn, 'caption'), null);
    assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.button.getAttribute('aria-label'), null);
    assert.equal(f.label.hasAttribute('hidden'), false); assert.equal(f.label.getAttribute('aria-hidden'), null);
  }
});

test('GPT-6 recognition still requires a committed ancestor containing reasoning items', () => {
  for (const items of [undefined, 'reasoning', [], [{ type: 'tool' }]]) {
    const e = environment(); const f = regionalFixture(e, regionalProps(), phase({ items })); e.run();
    assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.label.getAttribute('aria-hidden'), null);
  }
  const e = environment(); const f = fixture(e);
  fibers(f.header, phase(), phase({ items: [{ type: 'tool' }] }));
  f.header.__reactFiber$test.return.memoizedProps = regionalProps();
  f.header.__reactFiber$test.return.alternate.memoizedProps = regionalProps();
  e.run(); assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
});

test('the committed GPT-6 component wins over its alternate local phase or signature', () => {
  for (const completed of [true, false]) {
    const e = environment(); const f = fixture(e); fibers(f.header, phase(), phase());
    const component = f.header.__reactFiber$test.return;
    component.memoizedProps = regionalProps({ completed: !completed });
    component.alternate.memoizedProps = regionalProps({ completed });
    e.run();
    assert.equal(!!owned(f.turn, 'summary'), !completed);
    assert.equal(f.button.getAttribute('aria-labelledby'), completed ? 'summary' : null);
  }
  const e = environment(); const f = fixture(e); fibers(f.header, phase(), phase());
  const component = f.header.__reactFiber$test.return;
  component.memoizedProps = regionalProps(); component.alternate.memoizedProps = regionalProps({ region: { kind: 'other' } });
  e.run(); assert.equal(owned(f.turn, 'summary'), null);
  const unavailable = environment(); const g = fixture(unavailable); fibers(g.header, phase(), phase(), false);
  g.header.__reactFiber$test.return.memoizedProps = regionalProps();
  g.header.__reactFiber$test.return.alternate.memoizedProps = regionalProps();
  unavailable.run(); assert.equal(owned(g.turn, 'summary'), null);
});

test('a nested tool disclosure keeps its native UI even with a complete GPT-6 component signature', () => {
  const e = environment(); const f = regionalFixture(e);
  const tool = e.element('div'); const header = e.element('div', { class: 'group/activity-header' });
  const button = e.element('button', { 'aria-expanded': 'true', 'aria-labelledby': 'regional-tool', 'aria-label': 'Outil natif' });
  const label = e.element('span', { id: 'regional-tool' }, 'Exécution du code'); const handler = () => 'tool'; button.onclick = handler;
  header.append(button, label); tool.append(header); f.body.append(tool); fibers(header);
  header.__reactFiber$test.return.memoizedProps = regionalProps(); e.run();
  assert.equal(button.getAttribute('aria-labelledby'), 'regional-tool'); assert.equal(button.getAttribute('aria-label'), 'Outil natif');
  assert.equal(button.onclick, handler); assert.equal(label.hasAttribute('hidden'), false); assert.equal(label.getAttribute('aria-hidden'), null);
  assert.equal(owned(tool, 'summary'), null); assert.equal(owned(f.group, 'summary').textContent, 'Recherche en cours');
});

test('GPT-6 cleanup restores native UI on language changes and stop in active and finished phases', () => {
  for (const completed of [false, true]) {
    const e = environment(); const f = regionalFixture(e, regionalProps({ completed }));
    f.button.setAttribute('aria-label', 'Nom natif'); f.label.setAttribute('aria-hidden', 'false'); e.run();
    e.document.documentElement.lang = 'en-US'; e.flush();
    assert.equal(owned(f.turn, 'summary'), null); assert.equal(owned(f.turn, 'caption'), null); assert.equal(owned(f.turn, 'heading'), null);
    assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.button.getAttribute('aria-label'), 'Nom natif');
    assert.equal(f.label.getAttribute('aria-hidden'), 'false'); assert.equal(f.label.hasAttribute('hidden'), false);
    e.document.documentElement.lang = 'fr-BE'; e.flush(); assert.ok(owned(f.turn, 'heading')); assert.equal(!!owned(f.turn, 'summary'), !completed);
    e.context.window[Symbol.for('chatgpt-navigation-continue.reasoning-accessibility.current')].stop(); e.flush();
    assert.equal(owned(f.turn, 'heading'), null); assert.equal(owned(f.turn, 'summary'), null);
    assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.button.getAttribute('aria-label'), 'Nom natif');
    assert.equal(f.label.getAttribute('aria-hidden'), 'false'); assert.equal(f.label.hasAttribute('hidden'), false);
  }
});

test('GPT-6 recognition reads no recap, active summary, region identifier or reasoning body content', () => {
  for (const completed of [false, true]) {
    const e = environment(); const f = regionalFixture(e, regionalProps({ completed })); let reads = 0;
    const forbidden = { get() { reads++; throw new Error('private content must not be read'); } };
    for (const key of ['reasoningRecap', 'activeSummary', 'children']) Object.defineProperty(f.component.memoizedProps, key, forbidden);
    for (const key of ['id', 'prefixActivity']) Object.defineProperty(f.component.memoizedProps.region, key, forbidden);
    for (const key of ['text', 'content']) Object.defineProperty(f.owner.memoizedProps.items[0], key, forbidden);
    Object.defineProperty(f.body, 'textContent', forbidden); e.run();
    assert.equal(reads, 0); assert.equal(!!owned(f.turn, 'summary'), !completed);
    assert.equal(f.label.getAttribute('aria-hidden'), 'true');
  }
});

test('an early accessible h4 appears after the user heading, immediately before the hidden assistant anchor', () => {
  const e = environment(); const f = fixture(e); e.run(); const heading = owned(f.turn, 'heading');
  assert.equal(heading.tagName, 'H4'); assert.equal(heading.textContent, 'ChatGPT a dit :'); assert.equal(heading.className, 'sr-only');
  assert.equal(heading.nextSibling, f.anchor); assert.equal(heading.hasAttribute('hidden'), false); assert.equal(heading.getAttribute('aria-hidden'), null);
  assert.ok(f.user.compareDocumentPosition(heading) & 4); assert.equal(f.user.textContent, 'Vous avez dit :');
  assert.equal(f.anchor.parentElement, f.assistant); assert.equal(f.anchor.hasAttribute('hidden'), true);
});

test('late exact native headings are excluded without removing them, user/generated h4 headings remain unchanged', () => {
  const e = environment(); const f = fixture(e);
  const late = e.element('h4', { class: 'sr-only', tabindex: '0' }, 'ChatGPT a dit :');
  const visible = e.element('h4', {}, 'ChatGPT a dit :'); const different = e.element('h4', { class: 'sr-only' }, 'Un autre titre');
  f.assistant.append(late, visible, different); e.run();
  assert.equal(late.getAttribute('aria-hidden'), 'true'); assert.equal(late.getAttribute('tabindex'), '-1'); assert.equal(late.hasAttribute('hidden'), false);
  assert.equal(late.parentElement, f.assistant); assert.equal(visible.getAttribute('aria-hidden'), null); assert.equal(different.getAttribute('aria-hidden'), null);
  f.anchor.remove(); e.flush(); assert.equal(owned(f.turn, 'heading'), null); assert.equal(late.getAttribute('aria-hidden'), null); assert.equal(late.getAttribute('tabindex'), '0');
});

test('a native exact heading before the anchor is used and an owned heading can be replaced when native position changes', () => {
  const e = environment(); const f = fixture(e); const native = e.element('h4', { class: 'sr-only' }, 'ChatGPT a dit :');
  f.assistant.insertBefore(native, f.anchor); e.run(); assert.equal(owned(f.turn, 'heading'), null); assert.equal(native.getAttribute('aria-hidden'), null);
  f.assistant.appendChild(native); e.flush(); assert.equal(owned(f.turn, 'heading').nextSibling, f.anchor); assert.equal(native.getAttribute('aria-hidden'), 'true');
  f.assistant.insertBefore(native, f.anchor); e.flush(); assert.equal(owned(f.turn, 'heading'), null); assert.equal(native.getAttribute('aria-hidden'), null);
});

test('active summary follows the details while the same native disclosure stays above them with a fixed label', () => {
  const e = environment(); const f = fixture(e);
  // The body accessor must never be used, even to construct a caption.
  Object.defineProperty(f.body, 'textContent', { get() { throw new Error('body must not be read'); } });
  Object.defineProperty(f.owner.memoizedProps.items[0], 'content', { get() { throw new Error('fiber body must not be read'); } });
  Object.defineProperty(f.owner.memoizedProps, 'activeReasoning', { get() { throw new Error('activeReasoning body must not be read'); } });
  e.run(); const summary = owned(f.turn, 'summary');
  assert.equal(f.header.children[0], f.button); assert.equal(f.button.parentElement, f.header); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  assert.equal(f.button.getAttribute('aria-labelledby'), null); assert.equal(f.button.getAttribute('aria-expanded'), 'true');
  assert.equal(f.label.parentElement, f.header); assert.equal(f.label.getAttribute('aria-hidden'), 'true'); assert.equal(f.label.hasAttribute('hidden'), true);
  assert.equal(owned(f.turn, 'caption').textContent, 'Afficher/Masquer les détails du raisonnement'); assert.equal(summary.textContent, 'Recherche en cours');
  assert.equal(owned(f.turn, 'caption').style.pointerEvents, 'none'); assert.equal(owned(f.turn, 'caption').getAttribute('aria-hidden'), 'true');
  assert.equal(summary.parentElement, f.group); assert.equal(summary.nextSibling, null); assert.ok(f.body.compareDocumentPosition(summary) & 4);
  assert.equal(summary.getAttribute('aria-live'), null); assert.equal(summary.getAttribute('role'), null);
  f.label.textContent = 'Vérification des sources'; e.flush(); assert.equal(summary.textContent, 'Vérification des sources');
});

test('new native detail children stay before the owned summary, expanding changes no native identity or body content', () => {
  const e = environment(); const f = fixture(e); f.body.remove(); f.button.setAttribute('aria-expanded', 'false'); e.run();
  const summary = owned(f.turn, 'summary'); f.group.appendChild(f.body); f.button.setAttribute('aria-expanded', 'true'); e.flush();
  assert.equal(summary.nextSibling, null); assert.ok(f.body.compareDocumentPosition(summary) & 4); assert.equal(f.body.textContent, 'CORPS PRIVÉ'); assert.equal(f.body.parentElement, f.group);
  assert.equal(f.button.parentElement, f.header); assert.equal(f.label.parentElement, f.header);
});

test('completion restores native disclosure names and visual captions, hiding only the duplicate external AX caption', () => {
  for (const end of [{ completed: true }, { hasFinalAssistantStarted: true }]) {
    const e = environment(); const f = fixture(e); f.button.setAttribute('aria-label', 'Nom original'); f.label.setAttribute('aria-hidden', 'false'); e.run();
    const heading = owned(f.turn, 'heading'); f.owner.memoizedProps = phase(end); f.label.textContent = 'Réflexion terminée'; e.flush();
    assert.equal(computedName(f.button, e.document), 'Réflexion terminée'); assert.equal(f.label.getAttribute('aria-hidden'), 'true'); assert.equal(f.label.hasAttribute('hidden'), false);
    assert.equal(owned(f.turn, 'summary'), null); assert.equal(owned(f.turn, 'caption'), null); assert.equal(owned(f.turn, 'heading'), heading);
    assert.equal(f.button.getAttribute('aria-label'), 'Nom original'); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
    assert.equal(f.button.parentElement, f.header); assert.equal(f.label.textContent, 'Réflexion terminée');
    const body = f.body; const link = e.element('a', { href: 'https://example.test/source' }, 'Lien natif'); body.append(link);
    f.button.setAttribute('aria-expanded', 'false'); e.flush(); assert.equal(computedName(f.button, e.document), 'Réflexion terminée');
    f.button.setAttribute('aria-expanded', 'true'); e.flush(); assert.equal(computedName(f.button, e.document), 'Réflexion terminée');
    assert.equal(f.body, body); assert.equal(link.parentElement, body); assert.equal(link.getAttribute('href'), 'https://example.test/source');
    e.document.documentElement.lang = 'en-US'; e.flush(); assert.equal(f.button.getAttribute('aria-label'), 'Nom original'); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.label.getAttribute('aria-hidden'), 'false');
  }
});

test('committed React reasoning contexts win; contradictory or unavailable contexts preserve native activity UI', () => {
  const e = environment(); const f = fixture(e); fibers(f.header, phase(), phase({ items: [{ type: 'tool' }] })); e.run(); assert.equal(owned(f.turn, 'summary'), null);
  fibers(f.header, phase({ completed: true }), phase()); e.document.listeners.click({ target: f.button }); e.flush(); assert.equal(owned(f.turn, 'summary').textContent, 'Recherche en cours');
  fibers(f.header, phase(), phase({ items: [{ type: 'tool' }] }), false); e.document.listeners.click({ target: f.button }); e.flush(); assert.equal(owned(f.turn, 'summary'), null);
  delete f.header.__reactFiber$test; e.document.listeners.focusin({ target: f.button }); e.flush(); assert.equal(owned(f.turn, 'summary'), null);
});

test('unrelated activity, missing disclosure or malformed native label relationship are not changed', () => {
  for (const variation of ['tool', 'no-button', 'outside-label', 'can-not-expand', 'malformed-phase']) {
    const e = environment(); const f = fixture(e);
    if (variation === 'tool') f.owner.memoizedProps.items = [{ type: 'tool' }];
    if (variation === 'no-button') f.button.remove();
    if (variation === 'outside-label') f.group.appendChild(f.label);
    if (variation === 'can-not-expand') f.header.__reactFiber$test.return.memoizedProps.canExpand = false;
    if (variation === 'malformed-phase') f.owner.memoizedProps.items = 'reasoning';
    e.run(); assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.label.hasAttribute('hidden'), false); assert.equal(f.button.getAttribute('aria-label'), null);
  }
});

test('other languages, route removal and language switches clean up only owned UI and restore native labels', () => {
  const e = environment('en-US'); const f = fixture(e); e.run(); assert.equal(owned(f.turn, 'heading'), null); assert.equal(owned(f.turn, 'summary'), null);
  e.document.documentElement.lang = 'fr-BE'; e.flush(); assert.ok(owned(f.turn, 'heading')); assert.ok(owned(f.turn, 'summary'));
  e.document.documentElement.lang = 'en-US'; e.flush(); assert.equal(owned(f.turn, 'heading'), null); assert.equal(f.label.hasAttribute('hidden'), false); assert.equal(f.button.getAttribute('aria-label'), null);
  e.document.documentElement.lang = 'fr-FR'; e.flush(); f.turn.remove(); e.flush(); assert.equal(owned(f.turn, 'heading'), null); assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.label.hasAttribute('hidden'), false);
});

test('observer settles, duplicate injection is inert, body streaming does not trigger any extension writes', () => {
  const e = environment(); const f = fixture(e); e.run(); const writes = e.writes(); e.flush(); assert.equal(e.writes(), writes);
  vm.runInContext(source, e.context); e.flush(); assert.equal(e.writes(), writes);
  f.body.childNodes[0].textContent = 'Une suite du corps'; const nativeWrites = e.writes(); e.flush(); assert.equal(e.writes(), nativeWrites);
});

test('newly mounted turns and newly appearing anchors are handled without inventing disclosures', () => {
  const e = environment(); e.run(); const f = fixture(e); e.flush(); assert.ok(owned(f.turn, 'heading'));
  const next = e.element('article', { 'data-turn-key': 'next' }); const holder = e.element('div', {}); const anchor = e.element('span', { hidden: '' }); holder.append(anchor); next.append(holder); e.document.documentElement.append(next); e.flush(); assert.equal(owned(next, 'heading'), null);
  anchor.setAttribute('data-chatgpt-agent-turn-start', ''); e.flush(); assert.equal(owned(next, 'heading').nextSibling, anchor); assert.equal(owned(next, 'summary'), null);
});

test('an accessible native heading before the anchor supplies the unique repère and hidden headings cannot replace it', () => {
  const e = environment(); const f = fixture(e);
  const before = e.element('h4', { class: 'sr-only' }, 'ChatGPT a dit :'); const late = e.element('h4', { class: 'sr-only' }, 'ChatGPT a dit :');
  f.assistant.insertBefore(before, f.anchor); f.assistant.append(late); e.run();
  assert.equal(owned(f.turn, 'heading'), null); assert.equal(before.getAttribute('aria-hidden'), null); assert.equal(late.getAttribute('aria-hidden'), 'true');
  before.setAttribute('hidden', ''); e.flush(); assert.ok(owned(f.turn, 'heading')); assert.equal(before.getAttribute('aria-hidden'), null);
});

test('native attribute updates during activity are restored instead of an outdated initial value', () => {
  const e = environment(); const f = fixture(e); e.run();
  f.button.setAttribute('aria-label', 'Nouveau nom natif'); e.flush(); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  f.owner.memoizedProps = phase({ completed: true }); f.label.textContent = 'Fin'; e.flush(); assert.equal(computedName(f.button, e.document), 'Fin'); assert.equal(f.button.getAttribute('aria-label'), 'Nouveau nom natif');
  e.document.documentElement.lang = 'en-US'; e.flush(); assert.equal(f.button.getAttribute('aria-label'), 'Nouveau nom natif'); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
});

test('nested native tool disclosures inside reflection details keep their label, handler and summary', () => {
  const e = environment(); const f = fixture(e);
  const tool = e.element('div', {}); const header = e.element('div', { class: 'group/activity-header' });
  const button = e.element('button', { 'aria-expanded': 'true', 'aria-labelledby': 'tool-label', 'aria-label': 'Détails du code' });
  const label = e.element('span', { id: 'tool-label' }, 'Exécution du code'); const handler = () => 'native'; button.onclick = handler;
  header.append(button, label); tool.append(header, e.element('div', {}, 'Sortie du code')); f.body.append(tool);
  // Even the full principal signature is insufficient inside another body's
  // details: the DOM nesting guard protects the control.
  fibers(header); e.run();
  assert.equal(button.getAttribute('aria-label'), 'Détails du code'); assert.equal(button.onclick, handler); assert.equal(label.textContent, 'Exécution du code');
  assert.equal(label.hasAttribute('hidden'), false); assert.equal(label.getAttribute('aria-hidden'), null); assert.equal(owned(tool, 'summary'), null);
  assert.equal(owned(f.group, 'summary').textContent, 'Recherche en cours');
});

test('a non-expandable nearest group cannot borrow an outer reasoning group signature', () => {
  const e = environment(); const f = fixture(e); const component = f.header.__reactFiber$test.return;
  component.memoizedProps.canExpand = false;
  const outer = { memoizedProps: { canExpand: true, defaultExpanded: true, shouldAnimateInitialCollapse: true, summary: 'Outer summary' }, return: component.return };
  component.return = outer;
  const handler = () => 'tool'; f.button.onclick = handler; e.run();
  assert.equal(f.button.getAttribute('aria-label'), null); assert.equal(f.button.onclick, handler); assert.equal(f.label.hasAttribute('hidden'), false); assert.equal(owned(f.turn, 'summary'), null);
});

test('the nearest disclosure needs the full native signature and a user collapse keeps the lower summary', () => {
  for (const missing of ['defaultExpanded', 'shouldAnimateInitialCollapse', 'summary']) {
    const e = environment(); const f = fixture(e); delete f.header.__reactFiber$test.return.memoizedProps[missing]; e.run();
    assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.button.getAttribute('aria-label'), null);
  }
  const e = environment(); const f = fixture(e);
  Object.defineProperty(f.header.__reactFiber$test.return.memoizedProps, 'summary', { get() { throw new Error('fiber summary is not read'); } });
  e.run(); const summary = owned(f.turn, 'summary'); f.body.remove(); f.button.setAttribute('aria-expanded', 'false'); e.document.listeners.click({ target: f.button }); e.flush();
  assert.equal(owned(f.turn, 'summary'), summary); assert.equal(summary.nextSibling, null); assert.equal(summary.textContent, 'Recherche en cours'); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
});

test('native shimmer duplicates hidden to accessibility are omitted while the extension-hidden root is still read', () => {
  const e = environment(); const f = fixture(e); f.label.textContent = '';
  const accessible = e.element('span', { class: 'cadencedShimmer' }, 'Réflexion en cours');
  const sweep = e.element('span', { class: 'cadencedShimmerSweep', 'aria-hidden': 'true' });
  sweep.append(e.element('span', { class: 'highlight' }, 'Réflexion en cours'));
  const hidden = e.element('span', { hidden: '' }, 'Texte caché');
  f.label.append(accessible, sweep, hidden); const handler = () => 'native'; f.button.onclick = handler; e.run();
  assert.equal(f.label.hasAttribute('hidden'), true); assert.equal(f.label.getAttribute('aria-hidden'), 'true');
  assert.equal(owned(f.turn, 'summary').textContent, 'Réflexion en cours');
  assert.equal(sweep.textContent, 'Réflexion en cours'); assert.equal(sweep.parentElement, f.label); assert.equal(f.button.onclick, handler);
  assert.equal(owned(f.turn, 'caption').style.pointerEvents, 'none'); assert.equal(owned(f.turn, 'caption').getAttribute('aria-hidden'), 'true');
  accessible.textContent = 'Vérification'; sweep.children[0].textContent = 'Vérification'; e.flush();
  assert.equal(owned(f.turn, 'summary').textContent, 'Vérification');
  accessible.setAttribute('aria-hidden', 'true'); const screenReader = e.element('span', { class: 'sr-only' }, 'Version accessible'); f.label.append(screenReader); e.flush();
  assert.equal(owned(f.turn, 'summary').textContent, 'Version accessible');
});

test('computed name ignores the double hidden labelled-by caption because its reference is removed during adaptation', () => {
  const e = environment(); const f = fixture(e); f.label.textContent = '';
  f.label.append(e.element('span', {}, 'Réflexion en cours'), e.element('span', { 'aria-hidden': 'true' }, 'Réflexion en cours'));
  f.button.setAttribute('aria-label', 'Nom initial');
  assert.equal(computedName(f.button, e.document), 'Réflexion en coursRéflexion en cours');
  e.run(); assert.equal(f.button.getAttribute('aria-labelledby'), null); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  assert.equal(owned(f.turn, 'summary').textContent, 'Réflexion en cours');
  f.button.setAttribute('aria-expanded', 'false'); e.flush(); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  f.turn.remove(); e.flush(); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.button.getAttribute('aria-label'), 'Nom initial');
});

test('native boolean defaults are accepted only with strictly active committed generation booleans', () => {
  for (const value of [true, false]) {
    const e = environment(); const f = fixture(e); f.header.__reactFiber$test.return.memoizedProps.defaultExpanded = value;
    e.run(); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  }
  const e = environment(); const f = fixture(e); f.header.__reactFiber$test.return.memoizedProps.defaultExpanded = 'false'; e.run(); assert.equal(owned(f.turn, 'summary'), null);
  for (const incomplete of [{ completed: undefined }, { hasFinalAssistantStarted: undefined }, { completed: 'false' }, { hasFinalAssistantStarted: 'false' }]) {
    const e = environment(); const f = fixture(e, phase(incomplete)); e.run(); assert.equal(owned(f.turn, 'summary'), null);
  }
});

test('the public host props reference recovers a missing label reference and is restored on cleanup', () => {
  const e = environment(); const f = fixture(e); f.button.removeAttribute('aria-labelledby');
  f.button.__reactProps$test = { 'aria-labelledby': 'summary' };
  Object.defineProperty(f.button.__reactProps$test, 'children', { get() { throw new Error('host children are not inspected'); } });
  e.run(); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement'); assert.equal(f.button.getAttribute('aria-labelledby'), null);
  e.document.documentElement.lang = 'en-US'; e.flush(); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
});

test('live v1 migration adopts the same early h4, lets legacy cleanup retire widgets and records original restoration attributes', () => {
  const e = environment(); const f = fixture(e);
  const heading = e.element('h4', { class: 'sr-only', 'data-chatgpt-reasoning-accessibility': 'heading' }, 'ChatGPT a dit :');
  f.assistant.insertBefore(heading, f.anchor);
  const caption = e.element('span', { 'data-chatgpt-reasoning-accessibility': 'caption' }, 'Détails de la réflexion');
  const summary = e.element('div', { 'data-chatgpt-reasoning-accessibility': 'summary' }, 'Recherche en cours');
  f.header.append(caption); f.group.append(summary); f.button.setAttribute('aria-label', 'Détails de la réflexion'); f.label.setAttribute('aria-hidden', 'true'); f.label.setAttribute('hidden', '');
  e.context.legacy = { button: f.button, label: f.label, caption, summary };
  // Simulate only v1's proved cleanup contract: actual aria-labelledby absent
  // makes its group unqualified, restoring original attributes and widgets.
  vm.runInContext(`
    window[Symbol.for('chatgpt-navigation-continue.reasoning-accessibility.v1')] = true;
    window[Symbol.for('chatgpt-navigation-continue.reasoning-accessibility.v2')] = true;
    let pendingLegacy = false, retiredLegacy = false;
    new MutationObserver(() => {
      if (pendingLegacy || retiredLegacy || legacy.button.hasAttribute('aria-labelledby')) return;
      pendingLegacy = true;
      setTimeout(() => {
        retiredLegacy = true;
        legacy.button.removeAttribute('aria-label');
        legacy.label.removeAttribute('aria-hidden'); legacy.label.removeAttribute('hidden');
        legacy.caption.remove(); legacy.summary.remove();
      }, 100);
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true });
  `, e.context);
  e.run();
  assert.equal(owned(f.turn, 'heading'), heading); assert.equal(f.turn.querySelectorAll('h4[data-chatgpt-reasoning-accessibility="heading"]').length, 1);
  assert.equal(caption.isConnected, false); assert.equal(summary.isConnected, false); assert.equal(owned(f.turn, 'summary').textContent, 'Recherche en cours');
  assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement'); assert.equal(f.label.hasAttribute('hidden'), true);
  e.document.documentElement.lang = 'en-US'; e.flush();
  assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.button.getAttribute('aria-label'), null);
  assert.equal(f.label.getAttribute('aria-hidden'), null); assert.equal(f.label.hasAttribute('hidden'), false);
});

test('finished groups lacking defaultExpanded preserve native names and visuals, unknown active defaults are not guessed', () => {
  for (const completed of [true, false, undefined]) {
    const e = environment(); const f = fixture(e, phase({ completed, items: [{ type: 'reasoning' }, { type: 'mcp' }] }));
    delete f.header.__reactFiber$test.return.memoizedProps.defaultExpanded; e.run();
    assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.label.hasAttribute('hidden'), false);
    assert.equal(f.label.getAttribute('aria-hidden'), completed === true ? 'true' : null);
  }
});

test('completed groups without a default cannot qualify a nested tool disclosure inside native reasoning details', () => {
  const e = environment(); const f = fixture(e, phase({ completed: true })); delete f.header.__reactFiber$test.return.memoizedProps.defaultExpanded;
  const tool = e.element('div', {}); const header = e.element('div', { class: 'group/activity-header' });
  const button = e.element('button', { 'aria-expanded': 'true', 'aria-labelledby': 'nested-tool', 'aria-label': 'Code' }); const handler = () => 'native code'; button.onclick = handler;
  const label = e.element('span', { id: 'nested-tool' }, 'Sortie du code'); header.append(button, label); tool.append(header); f.body.append(tool);
  fibers(header, phase({ completed: true })); delete header.__reactFiber$test.return.memoizedProps.defaultExpanded;
  e.run(); assert.equal(computedName(f.button, e.document), 'Recherche en cours');
  assert.equal(button.getAttribute('aria-labelledby'), 'nested-tool'); assert.equal(button.getAttribute('aria-label'), 'Code'); assert.equal(button.onclick, handler);
  assert.equal(label.hasAttribute('hidden'), false); assert.equal(owned(tool, 'summary'), null);
});

test('the referenced caption may be inside a native header icon wrapper but never inside a button or a details body', () => {
  const e = environment(); const f = fixture(e); const wrapper = e.element('span', {}); const icon = e.element('span', { 'aria-hidden': 'true' }, '');
  f.header.insertBefore(wrapper, f.label); wrapper.append(icon, f.label); e.run();
  assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement'); assert.equal(owned(f.turn, 'summary').textContent, 'Recherche en cours');
  assert.equal(icon.parentElement, wrapper); assert.equal(f.label.parentElement, wrapper);
  f.button.appendChild(f.label); e.flush(); assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.label.hasAttribute('hidden'), false);
});

test('stop disconnects observation and handlers, cancels pending work, restores native state and permits a fresh injection', () => {
  const e = environment(); const f = fixture(e); const late = e.element('h4', { class: 'sr-only' }, 'ChatGPT a dit :'); f.assistant.append(late); e.run();
  const api = e.context.window[Symbol.for('chatgpt-navigation-continue.reasoning-accessibility.current')];
  assert.equal(api.version, 7); assert.equal(api.active, true); e.document.listeners.click({ target: f.button });
  api.stop(); api.stop(); e.flush(); assert.equal(api.active, false); assert.equal(owned(f.turn, 'heading'), null); assert.equal(owned(f.turn, 'summary'), null);
  assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.button.getAttribute('aria-label'), null); assert.equal(f.label.hasAttribute('hidden'), false); assert.equal(late.getAttribute('aria-hidden'), null);
  assert.equal(e.document.listeners.click, undefined); const writes = e.writes(); f.body.childNodes[0].textContent = 'Suite'; e.flush(); assert.equal(e.writes(), writes + 1);
  e.run(); const next = e.context.window[Symbol.for('chatgpt-navigation-continue.reasoning-accessibility.current')]; assert.notEqual(next, api); assert.equal(next.active, true); assert.ok(owned(f.turn, 'summary'));
});

test('deep native roots confirm committed phase data at depth 295 without accepting unavailable roots', () => {
  const e = environment(); const f = fixture(e); let root = f.owner.return;
  const state = root.stateNode;
  delete root.stateNode;
  for (let i = 0; i < 295; i++) root = root.return = {};
  root.stateNode = state; state.current = root;
  e.run(); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  delete root.stateNode; f.label.textContent = 'Autre phase'; e.flush(); assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
});

test('finished native duration stays in the computed button name once, and its external caption is AX-hidden without CSS hiding', () => {
  const e = environment(); const f = fixture(e, phase({ completed: true })); delete f.header.__reactFiber$test.return.memoizedProps.defaultExpanded;
  f.button.setAttribute('aria-expanded', 'false'); f.button.setAttribute('aria-label', 'Nom secondaire natif'); f.label.textContent = 'Réflexion durant 15 secondes'; e.run();
  assert.equal(computedName(f.button, e.document), 'Réflexion durant 15 secondes'); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.button.getAttribute('aria-label'), 'Nom secondaire natif');
  assert.equal(f.label.getAttribute('aria-hidden'), 'true'); assert.equal(f.label.hasAttribute('hidden'), false); assert.equal(f.label.style.display, undefined);
  assert.equal(owned(f.turn, 'summary'), null); assert.equal(owned(f.turn, 'caption'), null);
  f.label.setAttribute('aria-hidden', 'false'); e.observerOnly(); assert.equal(f.label.getAttribute('aria-hidden'), 'true'); assert.equal(computedName(f.button, e.document), 'Réflexion durant 15 secondes');
  e.context.window[Symbol.for('chatgpt-navigation-continue.reasoning-accessibility.current')].stop(); e.flush(); assert.equal(f.label.getAttribute('aria-hidden'), 'false'); assert.equal(f.label.hasAttribute('hidden'), false);
});

test('React resets of an owned active name are repaired in the observer microtask before any 100ms batch', () => {
  const e = environment(); const f = fixture(e); e.run();
  f.button.setAttribute('aria-label', 'État natif temporaire'); f.button.setAttribute('aria-labelledby', 'summary'); f.label.setAttribute('aria-hidden', 'false'); f.label.removeAttribute('hidden');
  e.observerOnly();
  assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement'); assert.equal(f.button.getAttribute('aria-labelledby'), null); assert.equal(f.label.getAttribute('aria-hidden'), 'true'); assert.equal(f.label.hasAttribute('hidden'), true);
  e.flush(); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
});

test('filtered tool-only and web-only contexts never contradict the lifecycle of actual reasoning items', () => {
  const e = environment(); const f = fixture(e); f.owner.return.memoizedProps = phase({ items: [{ type: 'web' }, { type: 'mcp' }], completed: true, hasFinalAssistantStarted: true }); e.run();
  assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  f.owner.memoizedProps = phase({ completed: true }); f.label.textContent = 'Réflexion terminée'; e.flush(); assert.equal(computedName(f.button, e.document), 'Réflexion terminée'); assert.equal(owned(f.turn, 'summary'), null);
});

test('unknown reasoning flags latch a known phase only for the same committed native group, positive completion ends it', () => {
  const e = environment(); const f = fixture(e); e.run(); const summary = owned(f.turn, 'summary');
  f.owner.memoizedProps = phase({ completed: undefined, hasFinalAssistantStarted: undefined }); f.button.setAttribute('aria-labelledby', 'summary'); e.observerOnly();
  assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement'); e.flush(); assert.equal(owned(f.turn, 'summary'), summary);
  f.owner.memoizedProps = phase({ completed: true, hasFinalAssistantStarted: undefined }); f.button.setAttribute('aria-labelledby', 'summary'); e.observerOnly();
  assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.label.hasAttribute('hidden'), false); assert.equal(f.label.getAttribute('aria-hidden'), 'true');
});

test('an unknown phase cannot latch after label replacement or when the principal signature is lost', () => {
  const e = environment(); const f = fixture(e); e.run();
  f.owner.memoizedProps = phase({ completed: undefined }); const nextLabel = e.element('span', { id: 'summary' }, 'Nouveau résumé'); f.label.remove(); f.header.append(nextLabel); f.button.setAttribute('aria-labelledby', 'summary'); e.observerOnly();
  assert.equal(owned(f.turn, 'summary'), null); assert.equal(nextLabel.hasAttribute('hidden'), false); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
  f.owner.memoizedProps = phase(); f.header.setAttribute('class', 'group/activity-header'); e.flush(); assert.ok(owned(f.turn, 'summary'));
  f.header.__reactFiber$test.return.memoizedProps.canExpand = false; f.button.setAttribute('aria-labelledby', 'summary'); e.observerOnly(); assert.equal(owned(f.turn, 'summary'), null); assert.equal(nextLabel.hasAttribute('hidden'), false);
});

test('completed label replacement removes active owned UI immediately and hides only the fresh referenced native caption', () => {
  const e = environment(); const f = fixture(e); e.run(); f.owner.memoizedProps = phase({ completed: true });
  const nextLabel = e.element('span', { id: 'summary' }, 'Durée finale'); f.label.remove(); f.header.append(nextLabel); f.button.setAttribute('aria-labelledby', 'summary'); e.observerOnly();
  assert.equal(owned(f.turn, 'summary'), null); assert.equal(owned(f.turn, 'caption'), null); assert.equal(computedName(f.button, e.document), 'Durée finale');
  assert.equal(nextLabel.getAttribute('aria-hidden'), 'true'); assert.equal(nextLabel.hasAttribute('hidden'), false); assert.equal(f.label.hasAttribute('hidden'), false);
});

test('only committed alternates can end or latch a phase; an unconfirmed root restores native UI', () => {
  const e = environment(); const f = fixture(e); const old = fibers(f.header, phase({ completed: true }), phase()); e.run(); assert.ok(owned(f.turn, 'summary'));
  old.alternate.memoizedProps = phase({ completed: undefined }); f.button.setAttribute('aria-labelledby', 'summary'); e.observerOnly(); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  fibers(f.header, phase(), phase({ completed: true }), false); f.button.setAttribute('aria-labelledby', 'summary'); e.observerOnly(); assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
});

test('a latched active state is discarded when the native group moves to another turn with an unknown phase', () => {
  const e = environment(); const f = fixture(e); e.run(); f.owner.memoizedProps = phase({ completed: undefined });
  const turn = e.element('article', { 'data-turn-key': 'other' }); const anchor = e.element('span', { hidden: '', 'data-chatgpt-agent-turn-start': '' }); turn.append(anchor, f.group); e.document.documentElement.append(turn);
  f.button.setAttribute('aria-labelledby', 'summary'); e.observerOnly(); e.flush();
  assert.equal(owned(turn, 'summary'), null); assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.label.hasAttribute('hidden'), false);
});

test('a freshly replaced native active header gets its action name before the timer batch, retiring all old widgets', () => {
  const e = environment(); const f = fixture(e); e.run(); const oldCaption = owned(f.turn, 'caption'); const oldSummary = owned(f.turn, 'summary');
  const header = e.element('div', { class: 'group/activity-header' }); const button = e.element('button', { 'aria-expanded': 'true', 'aria-labelledby': 'new-summary' });
  const label = e.element('span', { id: 'new-summary' }, 'Nouvelle étape'); header.append(button, label); fibers(header); f.header.remove(); f.group.insertBefore(header, f.body);
  e.observerOnly();
  assert.equal(computedName(button, e.document), 'Afficher/Masquer les détails du raisonnement'); assert.equal(button.getAttribute('aria-labelledby'), null);
  assert.equal(oldCaption.isConnected, false); assert.equal(oldSummary.isConnected, false); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary'); assert.equal(f.label.hasAttribute('hidden'), false);
  assert.equal(f.turn.querySelectorAll('[data-chatgpt-reasoning-accessibility-v2="caption"]').length, 1); assert.equal(owned(f.turn, 'summary').textContent, 'Nouvelle étape');
  assert.equal(f.body.parentElement, f.group); e.flush(); assert.equal(computedName(button, e.document), 'Afficher/Masquer les détails du raisonnement');
});

test('native button and label child-list replacements are repaired in the same microtask without resetting their identity', () => {
  const e = environment(); const f = fixture(e); e.run(); const label = e.element('span', { id: 'summary' }, 'Résumé remplacé'); f.label.remove(); f.header.append(label);
  e.observerOnly(); assert.equal(label.hasAttribute('hidden'), true); assert.equal(label.getAttribute('aria-hidden'), 'true'); assert.equal(owned(f.turn, 'summary').textContent, 'Résumé remplacé'); assert.equal(f.label.hasAttribute('hidden'), false);
  const button = e.element('button', { 'aria-expanded': 'false', 'aria-labelledby': 'summary' }); f.button.remove(); f.header.insertBefore(button, label); e.observerOnly();
  assert.equal(computedName(button, e.document), 'Afficher/Masquer les détails du raisonnement'); assert.equal(button.parentElement, f.header); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
  assert.equal(f.turn.querySelectorAll('[data-chatgpt-reasoning-accessibility-v2="summary"]').length, 1); e.flush();
});

test('new headers with unavailable committed props fail closed and acquire names once a relevant attribute changes after props become ready', () => {
  const e = environment(); const f = fixture(e); e.run(); const header = e.element('div', { class: 'group/activity-header' }); const label = e.element('span', { id: 'pending-summary' }, 'Attente');
  const button = e.element('button', { 'aria-expanded': 'true', 'aria-labelledby': 'pending-summary' }); header.append(button, label); f.header.remove(); f.group.insertBefore(header, f.body); e.observerOnly();
  assert.equal(button.getAttribute('aria-labelledby'), 'pending-summary'); assert.equal(label.hasAttribute('hidden'), false); assert.equal(owned(f.turn, 'summary'), null);
  fibers(header); header.setAttribute('class', 'group/activity-header ready'); e.observerOnly(); assert.equal(computedName(button, e.document), 'Afficher/Masquer les détails du raisonnement'); e.flush();
});

test('streamed body paragraphs and nested tool headers do not cause extension writes during structural observer handling', () => {
  const e = environment(); const f = fixture(e); e.run(); const paragraph = e.element('p', {}, 'Texte du corps'); f.body.append(paragraph); const writes = e.writes(); e.observerOnly(); assert.equal(e.writes(), writes);
  paragraph.textContent = 'Suite du corps'; const nextWrites = e.writes(); e.observerOnly(); assert.equal(e.writes(), nextWrites);
  const tool = e.element('div', {}); const header = e.element('div', { class: 'group/activity-header' }); const button = e.element('button', { 'aria-expanded': 'true', 'aria-labelledby': 'stream-tool' });
  header.append(button, e.element('span', { id: 'stream-tool' }, 'Code')); tool.append(header); fibers(header); f.body.append(tool); const toolWrites = e.writes(); e.observerOnly(); assert.equal(e.writes(), toolWrites);
  assert.equal(button.getAttribute('aria-labelledby'), 'stream-tool'); tool.remove(); const removalWrites = e.writes(); e.observerOnly(); assert.equal(e.writes(), removalWrites);
  e.flush(); assert.equal(owned(f.turn, 'summary').textContent, 'Recherche en cours');
});

test('active status is visible only at the end of open details and remains AX-hidden while collapsed without changing the button name', () => {
  const e = environment(); const f = fixture(e); e.run(); const summary = owned(f.turn, 'summary');
  assert.equal(summary.nextSibling, null); assert.ok(f.body.compareDocumentPosition(summary) & 4); assert.equal(summary.hasAttribute('hidden'), false); assert.equal(summary.getAttribute('aria-hidden'), null);
  f.button.setAttribute('aria-expanded', 'false'); e.observerOnly();
  assert.equal(owned(f.turn, 'summary'), summary); assert.equal(summary.hasAttribute('hidden'), true); assert.equal(summary.getAttribute('aria-hidden'), 'true'); assert.equal(summary.style.display, 'none');
  assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement'); assert.equal(summary.nextSibling, null);
  e.flush();
  f.label.textContent = 'Vérification actuelle'; e.flush(); assert.equal(summary.textContent, 'Vérification actuelle'); assert.equal(summary.getAttribute('aria-hidden'), 'true');
  f.button.setAttribute('aria-expanded', 'true'); e.observerOnly(); assert.equal(summary.hasAttribute('hidden'), false); assert.equal(summary.getAttribute('aria-hidden'), null); assert.equal(summary.style.display, ''); e.flush();
  assert.equal(summary.textContent, 'Vérification actuelle'); assert.ok(f.body.compareDocumentPosition(summary) & 4); assert.equal(summary.nextSibling, null);
  assert.equal(f.body.parentElement, f.group); assert.equal(f.button.parentElement, f.header); assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
});

test('a native details body appended after the owned status is followed by the status in the same observer microtask', () => {
  const e = environment(); const f = fixture(e); f.body.remove(); e.run(); const summary = owned(f.turn, 'summary');
  f.group.appendChild(f.body); e.observerOnly(); assert.equal(summary.nextSibling, null); assert.ok(f.body.compareDocumentPosition(summary) & 4); assert.equal(f.body.parentElement, f.group);
  e.flush(); assert.equal(owned(f.turn, 'summary'), summary);
});


test('document_start boots before HTML and adapts later native widgets without a load event', () => {
  const e = environment(); e.bootWithoutHTML(); const f = fixture(e);
  assert.equal(owned(f.turn, 'heading'), null);
  e.observerOnly();
  assert.equal(owned(f.turn, 'heading').nextSibling, f.anchor);
  assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
  e.context.window[Symbol.for('chatgpt-navigation-continue.reasoning-accessibility.current')].stop();
  assert.equal(owned(f.turn, 'heading'), null);
});


test('a late assistant anchor creates its heading in the observer delivery without any native disclosure', () => {
  const e = environment(); e.bootWithoutHTML();
  const turn = e.element('article', { 'data-turn-key': 'early-turn' });
  const assistant = e.element('div');
  turn.append(e.element('h4', { class: 'sr-only' }, 'Vous avez dit :'), assistant);
  e.document.documentElement.append(turn); e.observerOnly();
  assert.equal(owned(turn, 'heading'), null);
  const anchor = e.element('span', { hidden: '', 'data-chatgpt-agent-turn-start': '' });
  assistant.append(anchor); e.observerOnly();
  assert.equal(owned(turn, 'heading').nextSibling, anchor);
  assert.equal(owned(turn, 'caption'), null); assert.equal(owned(turn, 'summary'), null);
});

test('already present reasoning acquires its heading at injection before any timer runs', () => {
  const e = environment(); const f = fixture(e);
  vm.runInContext(source, e.context);
  assert.equal(owned(f.turn, 'heading').nextSibling, f.anchor);
  assert.equal(computedName(f.button, e.document), 'Afficher/Masquer les détails du raisonnement');
});


test('a turn mounted then removed before the observer delivery never gains owned reasoning UI', () => {
  const e = environment(); e.bootWithoutHTML(); const f = fixture(e);
  f.turn.remove(); e.observerOnly();
  assert.equal(owned(f.turn, 'heading'), null); assert.equal(owned(f.turn, 'caption'), null);
  assert.equal(owned(f.turn, 'summary'), null); assert.equal(f.button.getAttribute('aria-labelledby'), 'summary');
});
