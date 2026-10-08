const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('extension/analysis-details-accessibility.js', 'utf8');
const attribute = 'data-chatgpt-analysis-details';

function environment(lang = 'fr-FR') {
  const records = [], timers = new Map(), observers = [], windowEvents = new Map();
  let nextTimer = 1;
  let writes = 0;
  class Node {
    constructor(type) { this.nodeType = type; this.parentElement = null; this.childNodes = []; }
    get isConnected() { let node = this; while (node.parentElement) node = node.parentElement; return node === document.documentElement; }
    get nextSibling() { return this.parentElement?.childNodes[this.parentElement.childNodes.indexOf(this) + 1] ?? null; }
    get textContent() { return this.childNodes.map(node => node.textContent).join(''); }
    set textContent(value) { for (const child of [...this.childNodes]) child.remove(); if (value) this.appendChild(new Text(value)); }
    remove() { if (!this.parentElement) return; const parent = this.parentElement; parent.childNodes.splice(parent.childNodes.indexOf(this), 1); this.parentElement = null; records.push({ type: 'childList', target: parent, removedNodes: [this], addedNodes: [] }); writes++; }
    appendChild(node) { return this.insertBefore(node, null); }
    insertBefore(node, sibling) { node.remove(); const index = sibling ? this.childNodes.indexOf(sibling) : this.childNodes.length; assert.ok(index >= 0); this.childNodes.splice(index, 0, node); node.parentElement = this; records.push({ type: 'childList', target: this, addedNodes: [node], removedNodes: [] }); writes++; return node; }
    append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
    contains(node) { return this === node || this.childNodes.some(child => child.contains(node)); }
  }
  class Text extends Node {
    constructor(value) { super(3); this.value = value; }
    get textContent() { return this.value; }
    contains(node) { return this === node; }
  }
  class Element extends Node {
    constructor(tag, attrs = {}) {
      super(1); this.tagName = tag.toUpperCase(); this.attrs = { ...attrs }; this.listeners = new Map();
      const values = new Map(), priorities = new Map();
      this.style = {
        getPropertyValue: name => values.get(name) ?? '', getPropertyPriority: name => priorities.get(name) ?? '',
        setProperty: (name, value, priority = '') => { if (values.get(name) === value && (priorities.get(name) ?? '') === priority) return; values.set(name, value); priorities.set(name, priority); records.push({ type: 'attributes', target: this, attributeName: 'style' }); writes++; },
        removeProperty: name => { if (!values.has(name)) return ''; const before = values.get(name); values.delete(name); priorities.delete(name); records.push({ type: 'attributes', target: this, attributeName: 'style' }); writes++; return before; }
      };
    }
    get children() { return this.childNodes.filter(node => node.nodeType === 1); }
    get lang() { return this.getAttribute('lang'); } set lang(value) { this.setAttribute('lang', value); }
    get hidden() { return this.hasAttribute('hidden'); } set hidden(value) { this.toggleAttribute('hidden', value); }
    hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
    getAttribute(name) { return this.attrs[name] ?? null; }
    setAttribute(name, value) { value = String(value); if (this.attrs[name] === value) return; this.attrs[name] = value; records.push({ type: 'attributes', target: this, attributeName: name }); writes++; }
    removeAttribute(name) { if (!this.hasAttribute(name)) return; delete this.attrs[name]; records.push({ type: 'attributes', target: this, attributeName: name }); writes++; }
    toggleAttribute(name, force) { const add = force ?? !this.hasAttribute(name); if (add) this.setAttribute(name, ''); else this.removeAttribute(name); return add; }
    matches(selector) {
      return selector.split(',').some(part => {
        part = part.trim(); const tag = /^[a-z][a-z0-9]*/.exec(part)?.[0]; if (tag && tag.toUpperCase() !== this.tagName) return false;
        return [...part.matchAll(/\[([^=~\]]+)(~?)(?:="([^"]*)")?\]/g)].every(([, name, token, value]) => this.hasAttribute(name) && (value === undefined || (token ? this.getAttribute(name).split(/\s+/).includes(value) : this.getAttribute(name) === value)));
      });
    }
    closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
    querySelectorAll(selector) { const result = []; const visit = node => { for (const child of node.childNodes) { if (child.nodeType === 1 && child.matches(selector)) result.push(child); visit(child); } }; visit(this); return result; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(callback); }
    click() { for (const callback of this.listeners.get('click') ?? []) callback({ target: this, currentTarget: this }); }
    focus(options) { assert.equal(options.preventScroll, true); document.activeElement = this; }
  }
  const document = { documentElement: new Element('html', { lang }), activeElement: null, querySelectorAll(selector) { return this.documentElement?.querySelectorAll(selector) || []; }, createElement: tag => new Element(tag) };
  const location = { pathname: '/c/fixture' };
  class MutationObserver { constructor(callback) { this.callback = callback; this.active = false; observers.push(this); } observe(root) { assert.equal(root, document); this.active = true; } disconnect() { this.active = false; } }
  const window = { addEventListener(type, callback) { windowEvents.set(type, callback); }, removeEventListener(type, callback) { if (windowEvents.get(type) === callback) windowEvents.delete(type); } };
  const context = vm.createContext({ window, document, location, MutationObserver, WeakRef, setTimeout(callback, delay) { assert.equal(delay, 100); const id = nextTimer++; timers.set(id, callback); return id; }, clearTimeout(id) { timers.delete(id); } });
  function flush() {
    for (let index = 0; index < 40; index++) {
      if (records.length && observers.length) { const batch = records.splice(0); for (const observer of observers) if (observer.active) observer.callback(batch); }
      if (!timers.size) return;
      const callbacks = [...timers.values()]; timers.clear(); for (const callback of callbacks) callback();
    }
    throw new Error('Mutation loop');
  }
  const element = (tag, attrs, text) => { const node = new Element(tag, attrs); if (text !== undefined) node.textContent = text; return node; };
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
  return { bootWithoutHTML, document, location, windowEvents, element, flush, context, timers, observers, run() { vm.runInContext(source, context); flush(); }, api() { return window[Symbol.for('chatgpt-navigation-continue.analysis-details.v4')]; }, writes: () => writes };
}

function fixture(e, overrides = {}, count = 3) {
  const root = e.element('div', { 'data-chatgpt-conversation-selection-target': '' });
  const turn = e.element('div', { 'data-turn-key': 'PRIVATE_KEY' });
  const block = e.element('div', { class: 'block-BQZwFn' });
  root.append(turn); turn.append(block); e.document.documentElement.append(root);
  const renderer = { memoizedProps: { completed: true, hasFinalAssistantStarted: true, streamingParentRegion: { kind: 'prefix' }, items: [{ type: 'reasoning' }, { type: 'web-search' }, { type: 'chatgpt-python-execution' }], ...overrides } };
  const fiberRoot = { stateNode: {} }; fiberRoot.stateNode.current = fiberRoot; renderer.return = fiberRoot;
  const principal = e.element('div');
  const header = e.element('div', { class: 'group/activity-header' });
  const button = e.element('button', { 'aria-expanded': 'false', 'aria-labelledby': 'PRIVATE_SUMMARY_ID' });
  header.append(button); principal.append(header, e.element('div', {}, 'PRIVATE_REFLECTION_BODY')); block.append(principal);
  const principalComponent = { memoizedProps: { canExpand: true, shouldAnimateInitialCollapse: false, summary: 'PRIVATE_SUMMARY' }, return: renderer };
  header.__reactFiber$test = { return: principalComponent };
  const tools = [], toolHeaders = [], toolButtons = [], itemFibers = [];
  for (let index = 0; index < count; index++) {
    const wrapper = e.element('div', { class: 'native-tool' });
    const toolHeader = e.element('div', { class: 'group/activity-header' });
    const toolButton = e.element('button', { 'aria-expanded': 'false', 'aria-labelledby': 'PRIVATE_TOOL_LABEL' });
    toolHeader.append(toolButton); wrapper.append(toolHeader, e.element('pre', {}, `PRIVATE_TOOL_OUTPUT_${index}`)); block.append(wrapper);
    const itemFiber = { memoizedProps: { item: { type: 'chatgpt-python-execution' } }, return: renderer };
    toolHeader.__reactFiber$test = { return: itemFiber };
    tools.push(wrapper); toolHeaders.push(toolHeader); toolButtons.push(toolButton); itemFibers.push(itemFiber);
  }
  const response = e.element('div', {}, 'PRIVATE_FINAL_RESPONSE'); block.append(response);
  return { root, turn, block, renderer, fiberRoot, principalComponent, principal, header, button, tools, toolHeaders, toolButtons, itemFibers, response };
}
const control = f => f.block.querySelector(`[${attribute}="control"]`);
const isHidden = node => node.hasAttribute('hidden') && node.hasAttribute('inert') && node.style.getPropertyValue('display') === 'none' && node.style.getPropertyPriority('display') === 'important';

test('one analysis disclosure controls only the native Python siblings and follows the outer reflection', () => {
  const e = environment(), f = fixture(e, {}, 43); const originals = [...f.block.children];
  let nativeCalls = 0;
  for (const nativeButton of f.toolButtons) nativeButton.addEventListener('click', () => { nativeCalls++; });
  e.run();
  const button = control(f); assert.ok(button); assert.equal(button.textContent, 'Afficher les détails des analyses'); assert.equal(button.getAttribute('aria-expanded'), 'false'); assert.equal(button.hidden, true);
  assert.ok(f.tools.every(isHidden)); assert.equal(f.response.hidden, false);
  assert.equal(button.nextSibling, f.tools[0]);
  assert.deepEqual(f.block.children.filter(node => node !== button), originals);
  f.button.setAttribute('aria-expanded', 'true'); e.flush(); assert.equal(button.hidden, false); assert.ok(f.tools.every(isHidden));
  button.click(); e.flush(); assert.equal(button.getAttribute('aria-expanded'), 'true'); assert.equal(button.textContent, 'Masquer les détails des analyses'); assert.ok(f.tools.every(node => !node.hidden && !node.hasAttribute('inert') && !node.style.getPropertyValue('display')));
  assert.equal(nativeCalls, 0); f.toolButtons[0].click(); assert.equal(nativeCalls, 1);
  f.button.setAttribute('aria-expanded', 'false'); e.flush(); assert.equal(button.hidden, true); assert.ok(f.tools.every(isHidden));
  f.button.setAttribute('aria-expanded', 'true'); e.flush(); assert.equal(button.hidden, false); assert.ok(f.tools.every(node => !node.hidden));
  assert.deepEqual(f.block.children.filter(node => node !== button), originals);
  assert.ok(f.toolButtons.every(node => node.getAttribute('aria-expanded') === 'false' && node.getAttribute('aria-labelledby') === 'PRIVATE_TOOL_LABEL'));
});

test('unfinished, suffix, missing reasoning, malformed phase and unrelated item contexts are untouched', () => {
  for (const overrides of [{ completed: false }, { hasFinalAssistantStarted: false }, { streamingParentRegion: { kind: 'suffix' } }, { streamingParentRegion: { kind: 'unknown' } }, { items: [{ type: 'chatgpt-python-execution' }] }, { items: [{ type: 'reasoning' }] }]) {
    const e = environment(), f = fixture(e, overrides); e.run(); assert.equal(control(f), null); assert.ok(f.tools.every(node => !node.hidden));
  }
  const e = environment(), f = fixture(e); f.principalComponent.memoizedProps.canExpand = false; e.run(); assert.equal(control(f), null);
});

test('requires the same committed renderer and nearest Python item, never groups another response or form', () => {
  const e = environment(), f = fixture(e);
  f.itemFibers[0].memoizedProps.item.type = 'web-search';
  const otherRenderer = { memoizedProps: f.renderer.memoizedProps, return: f.fiberRoot };
  f.itemFibers[1].return = otherRenderer;
  f.tools[2].append(e.element('form'));
  e.run(); assert.equal(control(f), null); assert.ok(f.tools.every(node => !node.hidden));
  const other = environment(), g = fixture(other);
  g.tools[0].append(other.element('h4', {}, 'PRIVATE_RESPONSE')); g.tools[1].append(other.element('div', { role: 'textbox' })); g.tools[2].append(other.element('span', { 'data-chatgpt-agent-turn-start': '' }));
  other.run(); assert.equal(control(g), null);
});

test('public aria host props fallback works without reading any native summary or body content', () => {
  const e = environment(), f = fixture(e);
  f.button.removeAttribute('aria-labelledby'); f.button.__reactProps$test = { 'aria-labelledby': 'PRIVATE_SUMMARY_ID' };
  for (const node of [f.principal, f.header, ...f.tools, ...f.toolHeaders, ...f.toolButtons]) Object.defineProperty(node, 'textContent', { get() { throw new Error('Native text must not be read'); } });
  Object.defineProperty(f.principalComponent.memoizedProps, 'summary', { get() { throw new Error('Native summary must not be read'); } });
  for (const item of f.renderer.memoizedProps.items) Object.defineProperty(item, 'content', { get() { throw new Error('Item content must not be read'); } });
  e.run(); assert.ok(control(f)); assert.ok(f.tools.every(isHidden));
});

test('collapse returns focus to its visible control, global collapse returns it to the native principal', () => {
  const e = environment(), f = fixture(e); f.button.setAttribute('aria-expanded', 'true'); e.run(); const button = control(f);
  button.click(); e.flush(); e.document.activeElement = f.toolButtons[0]; button.click(); e.flush(); assert.equal(e.document.activeElement, button); assert.ok(f.tools.every(isHidden));
  button.click(); e.flush(); e.document.activeElement = f.toolButtons[1]; f.button.setAttribute('aria-expanded', 'false'); e.flush(); assert.equal(e.document.activeElement, f.button); assert.equal(button.hidden, true);
});

test('language, route, unmount and changed native context restore owned visibility without overwriting native updates', () => {
  for (const change of ['language', 'route', 'unmount', 'context', 'turn-key']) {
    const e = environment(), f = fixture(e);
    f.tools[0].style.setProperty('display', 'flex'); f.tools[1].setAttribute('inert', ''); f.tools[1].setAttribute('hidden', 'native'); e.run();
    f.tools[2].style.setProperty('display', 'grid'); e.flush(); assert.ok(f.tools.every(isHidden));
    if (change === 'language') e.document.documentElement.lang = 'en-US';
    if (change === 'route') { e.location.pathname = '/c/other'; e.windowEvents.get('popstate')(); }
    if (change === 'unmount') f.turn.remove();
    if (change === 'context') { f.renderer.memoizedProps.completed = false; f.button.setAttribute('aria-expanded', 'true'); }
    if (change === 'turn-key') f.turn.setAttribute('data-turn-key', 'NEW_PRIVATE_KEY');
    e.flush(); assert.equal(control(f), null);
    assert.equal(f.tools[0].style.getPropertyValue('display'), 'flex');
    assert.equal(f.tools[1].hasAttribute('inert'), true); assert.equal(f.tools[1].getAttribute('hidden'), 'native');
    assert.equal(f.tools[2].style.getPropertyValue('display'), 'grid');
    assert.ok(f.tools.every(node => !node.hasAttribute(attribute)));
  }
});

test('unknown or stale React roots fail closed; duplicate injection and settled observers are inert', () => {
  const e = environment(), f = fixture(e); f.fiberRoot.stateNode.current = {}; e.run(); assert.equal(control(f), null);
  f.fiberRoot.stateNode.current = f.fiberRoot; f.button.setAttribute('aria-expanded', 'true'); e.flush(); assert.ok(control(f));
  const writes = e.writes(); e.flush(); assert.equal(e.writes(), writes); vm.runInContext(source, e.context); e.flush(); assert.equal(e.writes(), writes);
  const before = [...f.block.children]; e.flush(); assert.deepEqual(f.block.children, before);
});

test('a committed alternate is used consistently and keeps the same analysis control state', () => {
  const e = environment(), f = fixture(e); f.button.setAttribute('aria-expanded', 'true'); e.run();
  const button = control(f); button.click(); e.flush(); assert.ok(f.tools.every(node => !node.hidden));
  const nextRoot = { stateNode: f.fiberRoot.stateNode }, nextRenderer = { memoizedProps: f.renderer.memoizedProps, return: nextRoot, alternate: f.renderer };
  f.renderer.alternate = nextRenderer; nextRoot.stateNode.current = nextRoot;
  const principalHost = f.header.__reactFiber$test;
  principalHost.alternate = { return: { memoizedProps: f.principalComponent.memoizedProps, return: nextRenderer } };
  for (const header of f.toolHeaders) header.__reactFiber$test.alternate = { return: { memoizedProps: { item: { type: 'chatgpt-python-execution' } }, return: nextRenderer } };
  f.header.setAttribute('class', 'group/activity-header next-native-class'); e.flush();
  assert.equal(control(f), button); assert.equal(button.getAttribute('aria-expanded'), 'true'); assert.ok(f.tools.every(node => !node.hidden));
});

test('new and removed native Python wrappers are grouped and restored without retaining removed tools', () => {
  const e = environment(), f = fixture(e); e.run(); const removed = f.tools[0]; removed.remove(); e.flush();
  assert.equal(removed.hidden, false); assert.equal(removed.hasAttribute('inert'), false); assert.equal(removed.hasAttribute(attribute), false); assert.equal(control(f).nextSibling, f.tools[1]);
  const wrapper = e.element('div'), header = e.element('div', { class: 'group/activity-header' }), button = e.element('button', { 'aria-expanded': 'false', 'aria-labelledby': 'PRIVATE_NEW_LABEL' });
  header.append(button); wrapper.append(header); header.__reactFiber$test = { return: { memoizedProps: { item: { type: 'chatgpt-python-execution' } }, return: f.renderer } };
  f.block.insertBefore(wrapper, f.tools[1]); e.flush(); assert.ok(isHidden(wrapper)); assert.equal(control(f).nextSibling, wrapper);
});

test('committed roots at depth 295 work without repeating full root walks for all 43 tools', () => {
  const e = environment(), f = fixture(e, {}, 43);
  let parent = f.fiberRoot, reads = 0;
  for (let index = 0; index < 292; index++) {
    const next = parent;
    parent = { get return() { reads++; return next; } };
  }
  f.renderer.return = parent;
  e.run(); assert.ok(control(f)); assert.ok(f.tools.every(isHidden));
  assert.ok(reads < 10000, `Root paths should be cached, reads=${reads}`);
});

test('filtered inner reasoning and tool renderers share the nearest eligible outer prefix renderer', () => {
  const e = environment(), f = fixture(e, {}, 43);
  const region = f.renderer.memoizedProps.streamingParentRegion;
  const innerPrincipal = { memoizedProps: { ...f.renderer.memoizedProps, streamingParentRegion: region, items: [{ type: 'reasoning' }, { type: 'web-search' }] }, return: f.renderer };
  const innerTools = { memoizedProps: { ...f.renderer.memoizedProps, streamingParentRegion: region }, return: f.renderer };
  f.principalComponent.return = innerPrincipal;
  for (const item of f.itemFibers) item.return = innerTools;
  e.run(); assert.ok(control(f)); assert.ok(f.tools.every(isHidden));
  f.button.setAttribute('aria-expanded', 'true'); e.flush(); control(f).click(); e.flush(); assert.ok(f.tools.every(node => !node.hidden));
});

test('the actual no-region dU split groups 43 Python siblings beside its filtered dK reasoning child', () => {
  for (const region of [undefined, null]) {
    const e = environment(), f = fixture(e, { streamingParentRegion: region }, 43);
    const filtered = { memoizedProps: { ...f.renderer.memoizedProps, items: [{ type: 'reasoning' }, { type: 'web-search' }] }, return: f.renderer };
    f.principalComponent.return = filtered;
    // dU maps each native Python item directly; no inner dK tool renderer.
    assert.ok(Object.hasOwn(f.renderer.memoizedProps, 'streamingParentRegion'));
    e.run(); const button = control(f); assert.ok(button); assert.ok(f.tools.every(isHidden));
    assert.equal(f.response.hidden, false); f.button.setAttribute('aria-expanded', 'true'); e.flush(); button.click(); e.flush();
    assert.ok(f.tools.every(node => !node.hidden)); assert.equal(button.getAttribute('aria-expanded'), 'true');
  }
});

test('an unfinished or contradictory inner region cannot be bypassed via an eligible ancestor', () => {
  for (const variation of ['unfinished', 'not-final', 'other-region']) {
    const e = environment(), f = fixture(e);
    const innerProps = { ...f.renderer.memoizedProps, items: [{ type: 'reasoning' }, { type: 'web-search' }] };
    if (variation === 'unfinished') innerProps.completed = false;
    if (variation === 'not-final') innerProps.hasFinalAssistantStarted = false;
    if (variation === 'other-region') innerProps.streamingParentRegion = { kind: 'prefix' };
    f.principalComponent.return = { memoizedProps: innerProps, return: f.renderer };
    e.run(); assert.equal(control(f), null); assert.ok(f.tools.every(node => !node.hidden));
  }
});

test('stop is idempotent, restores all wrappers and cancels observers, listeners and pending work', () => {
  const e = environment(), f = fixture(e); e.run(); const api = e.api(); assert.equal(typeof api.stop, 'function');
  f.button.setAttribute('aria-expanded', 'true'); e.windowEvents.get('popstate')(); assert.ok(e.timers.size);
  api.stop(); api.stop(); assert.equal(control(f), null); assert.ok(f.tools.every(node => !node.hidden && !node.hasAttribute('inert') && !node.style.getPropertyValue('display') && !node.hasAttribute(attribute)));
  assert.equal(e.timers.size, 0); assert.equal(e.windowEvents.size, 0); assert.ok(e.observers.every(observer => !observer.active));
  const writes = e.writes(); e.flush(); assert.equal(e.writes(), writes);
  e.run(); assert.equal(e.api(), api); assert.equal(control(f), null); assert.equal(e.observers.length, 1);
});

test('v4 stops a previous v3 controller before installation and does not repeat migration on reinjection', () => {
  const e = environment(), f = fixture(e); let stops = 0;
  e.context.window[Symbol.for('chatgpt-navigation-continue.analysis-details.v3')] = { stop() { stops++; } };
  e.run(); assert.equal(stops, 1); assert.ok(control(f));
  e.run(); assert.equal(stops, 1); assert.equal(f.block.querySelectorAll(`[${attribute}="control"]`).length, 1);
});

test('all 43 tools are grouped when 15 current root paths use the eligible common owner alternate', () => {
  const e = environment(), f = fixture(e, { streamingParentRegion: undefined }, 43);
  const alternate = { memoizedProps: { ...f.renderer.memoizedProps }, return: f.fiberRoot, alternate: f.renderer };
  f.renderer.alternate = alternate;
  for (const item of f.itemFibers.slice(28)) item.return = alternate;
  e.run(); const button = control(f); assert.ok(button);
  assert.equal(f.tools.filter(isHidden).length, 43);
  assert.equal(f.tools.filter(node => node.getAttribute(attribute) === 'tool').length, 43);
  assert.equal(button.getAttribute('aria-expanded'), 'false'); assert.equal(e.document.activeElement, null);
  f.button.setAttribute('aria-expanded', 'true'); e.flush(); button.click(); e.flush();
  assert.ok(f.tools.every(node => !node.hidden)); assert.equal(e.document.activeElement, null);
});

test('an alternate owner with a contradictory phase or region cannot join the principal owner', () => {
  for (const change of ['unfinished', 'not-final', 'other-region']) {
    const e = environment(), f = fixture(e, { streamingParentRegion: undefined }, 43);
    const props = { ...f.renderer.memoizedProps };
    if (change === 'unfinished') props.completed = false;
    if (change === 'not-final') props.hasFinalAssistantStarted = false;
    if (change === 'other-region') props.streamingParentRegion = { kind: 'prefix' };
    const alternate = { memoizedProps: props, return: f.fiberRoot, alternate: f.renderer };
    f.renderer.alternate = alternate;
    for (const item of f.itemFibers.slice(28)) item.return = alternate;
    e.run(); assert.ok(control(f)); assert.equal(f.tools.slice(0, 28).filter(isHidden).length, 28);
    assert.ok(f.tools.slice(28).every(node => !node.hidden && !node.hasAttribute(attribute)));
  }
});

test('cyclic or excessively deep React paths remain bounded and leave the native wrappers alone', () => {
  for (const variation of ['cycle', 'deep']) {
    const e = environment(), f = fixture(e);
    if (variation === 'cycle') f.renderer.return = f.renderer;
    else { let parent = f.fiberRoot; for (let index = 0; index < 600; index++) parent = { return: parent }; f.renderer.return = parent; }
    e.run(); assert.equal(control(f), null); assert.ok(f.tools.every(node => !node.hidden));
  }
});


test('document_start boots before HTML and adapts later native widgets without a load event', () => {
  const e = environment(); e.bootWithoutHTML(); const f = fixture(e);
  assert.equal(control(f), null);
  for (const observer of e.observers) if (observer.active) observer.callback([{ type: 'childList', target: e.document.documentElement, addedNodes: [f.root], removedNodes: [] }]);
  assert.ok(control(f)); assert.ok(f.tools.every(isHidden));
  e.api().stop(); assert.equal(control(f), null); assert.ok(f.tools.every(node => !node.hidden));
});


test('already present eligible analyses are grouped at injection before any timer runs', () => {
  const e = environment(); const f = fixture(e);
  vm.runInContext(source, e.context);
  assert.ok(control(f)); assert.ok(f.tools.every(isHidden));
  assert.equal(e.timers.size, 0);
});
