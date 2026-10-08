const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('extension/model-accessibility.js', 'utf8');

// A small DOM with recorded mutations lets the tests assert both targeting and
// observer convergence. Chromium/JAWS reception is checked separately.
function environment(lang = 'fr-FR') {
  const records = [], microtasks = [];
  let callback, writes = 0;
  class Node {
    constructor(type) { this.nodeType = type; this.parentElement = null; this.childNodes = []; }
    get isConnected() { let n = this; while (n.parentElement) n = n.parentElement; return n === document.documentElement; }
    append(...nodes) { for (const n of nodes) { n.parentElement = this; this.childNodes.push(n); } records.push({ type: 'childList', target: this, addedNodes: nodes }); return this; }
  }
  class Text extends Node {
    constructor(value) { super(3); this.value = value; }
    get nodeValue() { return this.value; }
    set nodeValue(value) { this.value = value; writes++; records.push({ type: 'characterData', target: this }); }
  }
  class Element extends Node {
    constructor(tag, attrs = {}) { super(1); this.tag = tag; this.attrs = { ...attrs }; }
    get lang() { return this.getAttribute('lang'); }
    set lang(value) { this.setAttribute('lang', value); }
    hasAttribute(key) { return Object.hasOwn(this.attrs, key); }
    getAttribute(key) { return this.attrs[key] ?? null; }
    setAttribute(key, value) { this.attrs[key] = String(value); writes++; records.push({ type: 'attributes', target: this, attributeName: key }); }
    removeAttribute(key) { delete this.attrs[key]; writes++; records.push({ type: 'attributes', target: this, attributeName: key }); }
    matches(selector) {
      return selector.split(',').some(part => {
        part = part.trim(); const tag = /^[a-z]+/.exec(part)?.[0];
        if (tag && tag !== this.tag) return false;
        return [...part.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)].every(([, key, value]) => this.hasAttribute(key) && (value === undefined || this.getAttribute(key) === value));
      });
    }
    closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
    querySelectorAll(selector) { const out = []; const visit = n => { for (const child of n.childNodes) { if (child.nodeType === 1 && child.matches(selector)) out.push(child); visit(child); } }; visit(this); return out; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }
  const document = {
    documentElement: new Element('html', { lang }), listeners: {},
    querySelectorAll(selector) { return this.documentElement?.querySelectorAll(selector) || []; },
    getElementById(id) { return this.querySelectorAll('[id]').find(n => n.getAttribute('id') === id) || null; },
    createTreeWalker(root) { const texts = []; const visit = n => { for (const child of n.childNodes) { if (child.nodeType === 3) texts.push(child); else visit(child); } }; visit(root); let i = 0; return { nextNode: () => texts[i++] || null }; },
    addEventListener(event, listener) { this.listeners[event] = listener; },
    removeEventListener(event, listener) { if (this.listeners[event] === listener) delete this.listeners[event]; }
  };
  class MutationObserver { constructor(cb) { callback = cb; } observe(root) { assert.equal(root, document); } disconnect() { callback = null; } }
  const context = vm.createContext({ window: {}, document, MutationObserver, WeakRef, queueMicrotask: fn => microtasks.push(fn) });
  const element = (tag, attrs, text) => { const el = new Element(tag, attrs); if (text !== undefined) el.append(new Text(text)); return el; };
  const mount = (...nodes) => document.documentElement.append(...nodes);
  const flush = () => { for (let i = 0; i < 20; i++) { if (records.length && callback) callback(records.splice(0)); if (!microtasks.length) return; microtasks.splice(0).forEach(fn => fn()); } throw new Error('Mutation loop'); };
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
  return { bootWithoutHTML, document, context, element, mount, run, flush, writes: () => writes, records };
}

function selection(overrides = {}) {
  return { id: 'native-choice', model: 'native-thinking', modelLabel: '5.6', reasoningEffort: 'high', powerSettingIndex: 2, sliderLabel: 'High', ...overrides };
}
function trigger(e, effort = 'high', text = 'High') {
  return e.element('button', { 'data-codex-intelligence-trigger': '', 'data-composer-navigation-target': 'reasoning', 'data-selected-reasoning-effort': effort, 'aria-label': 'Sélectionner le modèle ChatGPT' }, text);
}
function fibers(button, selected, alternate, committed = true, depth = 27) {
  const state = {};
  const a = { memoizedProps: { selectedPowerSelection: selected, powerSelections: [selected], fallbackPowerSelection: selected } };
  const b = alternate && { memoizedProps: { selectedPowerSelection: alternate, powerSelections: [alternate], fallbackPowerSelection: alternate } };
  let cursor = a, other = b;
  const host = {};
  host.return = a;
  for (let i = 1; i < depth; i++) { cursor = cursor.return = {}; if (other) other = other.return = {}; }
  cursor.stateNode = state;
  if (other) { other.stateNode = state; a.alternate = b; }
  if (committed) state.current = alternate ? other : cursor;
  button.__reactFiber$test = host;
  return a;
}

test('French trigger announces the native accessible level; identity and settings are preserved', () => {
  const e = environment(); const button = trigger(e); const chosen = selection(); const snapshot = JSON.stringify(chosen);
  fibers(button, chosen); e.mount(button); e.run();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Élevée');
  assert.equal(button.childNodes[0].nodeValue, 'Élevée');
  assert.equal(e.document.querySelectorAll('button')[0], button);
  assert.equal(JSON.stringify(chosen), snapshot);
  const writes = e.writes(); e.document.listeners.focusin({ target: button }); e.flush(); assert.equal(e.writes(), writes);
  vm.runInContext(source, e.context); e.flush(); assert.equal(e.writes(), writes);
});

test('only the associated polite status changes; positions and instructions remain exact', () => {
  const e = environment();
  const slider = e.element('div', { 'data-reasoning-slider': '', role: 'menuitem', 'aria-label': 'Puissance', 'aria-describedby': 'position instruction' });
  const position = e.element('span', { id: 'position', role: 'status', 'aria-live': 'polite' }, 'High, 3 sur 5.');
  const instruction = e.element('span', { id: 'instruction' }, 'High : utiliser les flèches.');
  const other = e.element('span', { role: 'status', 'aria-live': 'polite' }, 'High, 3 sur 5.');
  const conversation = e.element('article', {}, 'High');
  const header = e.element('button', { 'data-model-picker-view-toggle': '', 'aria-label': 'Sélectionner le modèle' }, 'Extra High');
  e.mount(slider, position, instruction, other, conversation, header); e.run();
  assert.equal(position.childNodes[0].nodeValue, 'Élevée, 3 sur 5.');
  assert.equal(instruction.childNodes[0].nodeValue, 'High : utiliser les flèches.');
  assert.equal(other.childNodes[0].nodeValue, 'High, 3 sur 5.');
  assert.equal(conversation.childNodes[0].nodeValue, 'High');
  assert.equal(slider.getAttribute('aria-label'), 'Puissance');
  assert.equal(header.childNodes[0].nodeValue, 'Très élevé');
  assert.equal(header.getAttribute('aria-label'), 'Sélectionner le modèle');
  position.childNodes[0].nodeValue = 'Medium, 2 sur 5.'; e.flush();
  assert.equal(position.childNodes[0].nodeValue, 'Moyenne, 2 sur 5.');
});

test('effort changes refresh the button and an effort mismatch removes stale added naming', () => {
  const e = environment(); const button = trigger(e); const fiber = fibers(button, selection()); e.mount(button); e.run();
  const next = selection({ id: 'next', reasoningEffort: 'medium', sliderLabel: 'Medium', powerSettingIndex: 1 });
  fiber.memoizedProps = { selectedPowerSelection: next, powerSelections: [next] };
  button.setAttribute('data-selected-reasoning-effort', 'medium'); button.childNodes[0].nodeValue = 'Medium'; e.flush();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Moyenne');
  button.setAttribute('data-selected-reasoning-effort', 'max'); e.flush();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Moyenne');
});

test('committed alternate resolves Pro without hidden model names; ambiguity uses only the exposed caption', () => {
  const e = environment(); const button = trigger(e, 'medium', 'Pro');
  fibers(button, selection({ reasoningEffort: 'medium', sliderLabel: 'Medium' }), selection({ model: 'gpt-6-pro', modelLabel: '6', id: 'fresh', reasoningEffort: 'medium', sliderLabel: 'Pro' })); e.mount(button); e.run();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Pro');
  const ambiguous = trigger(e); fibers(ambiguous, selection(), selection({ modelLabel: 'Other', id: 'other' }), false); e.mount(ambiguous); e.flush();
  assert.equal(ambiguous.getAttribute('aria-label'), 'Modèle ChatGPT : Élevée');
});

test('native labels supply names for different models and Pro without fixed model or slider positions', () => {
  for (const [chosen, expected] of [
    [selection({ model: 'new-native-model', modelLabel: 'Natif 9', sliderLabel: 'Extra High', powerSettingIndex: 13 }), 'Très élevé'],
    [selection({ model: 'gpt-6-pro', modelLabel: '6', sliderLabel: 'Pro', reasoningEffort: 'medium', powerSettingIndex: 4 }), 'Pro'],
    [selection({ model: 'future-native-pro', modelLabel: 'Natif Pro', sliderLabel: 'Pro' }), 'Pro'],
    [selection({ model: 'native-instant', sliderLabel: 'Instant', reasoningEffort: 'none', powerSettingIndex: 0 }), 'Instantané']
  ]) {
    const e = environment(); const button = trigger(e, chosen.reasoningEffort, chosen.sliderLabel); fibers(button, chosen); e.mount(button); e.run();
    assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : ' + expected);
  }
});

test('unavailable, malformed, unknown or unlisted selections never fabricate a model name', () => {
  for (const chosen of [null, selection({ modelLabel: '' }), selection({ sliderLabel: 'Future level' }), selection({ powerSettingIndex: -1 }), selection({ reasoningEffort: 'medium' })]) {
    const e = environment(); const button = trigger(e); fibers(button, chosen); e.mount(button); e.run();
    assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Élevée');
  }
  const e = environment(); const absent = trigger(e); const unlisted = trigger(e); const f = fibers(unlisted, selection()); f.memoizedProps.powerSelections = [];
  const inaccessible = trigger(e); Object.defineProperty(inaccessible, '__reactFiber$throws', { enumerable: true, get() { throw new Error('unavailable'); } });
  const unrelated = e.element('button', { 'aria-label': 'Sélectionner le modèle ChatGPT' }, 'High');
  e.mount(absent, unlisted, inaccessible, unrelated); e.run();
  for (const button of [absent, unlisted, inaccessible]) assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Élevée');
  assert.equal(unrelated.getAttribute('aria-label'), 'Sélectionner le modèle ChatGPT');
  assert.equal(unrelated.childNodes[0].nodeValue, 'High');
});

test('other languages are unchanged, French corrections restore on a language switch', () => {
  const e = environment('en-US'); const button = trigger(e); fibers(button, selection()); e.mount(button); e.run();
  assert.equal(button.childNodes[0].nodeValue, 'High'); assert.equal(button.getAttribute('aria-label'), 'Sélectionner le modèle ChatGPT');
  e.document.documentElement.lang = 'fr-BE'; e.flush(); assert.equal(button.childNodes[0].nodeValue, 'Élevée');
  e.document.documentElement.lang = 'en-US'; e.flush(); assert.equal(button.childNodes[0].nodeValue, 'High'); assert.equal(button.getAttribute('aria-label'), 'Sélectionner le modèle ChatGPT');
});

test('native French forms are preserved, unknown levels and arbitrary status sentences are preserved', () => {
  const e = environment(); const button = trigger(e, 'high', 'Élevée'); fibers(button, selection({ sliderLabel: 'Élevée' }));
  const slider = e.element('div', { 'data-reasoning-slider': '', 'aria-describedby': 'status' });
  const status = e.element('span', { id: 'status', role: 'status', 'aria-live': 'polite' }, 'Très élevée, 5 sur 7.');
  e.mount(button, slider, status); e.run(); assert.equal(button.childNodes[0].nodeValue, 'Élevée'); assert.equal(status.childNodes[0].nodeValue, 'Très élevée, 5 sur 7.');
  status.childNodes[0].nodeValue = 'Unknown, 1 sur 7.'; e.flush(); assert.equal(status.childNodes[0].nodeValue, 'Unknown, 1 sur 7.');
  status.childNodes[0].nodeValue = 'High, conserver les détails.'; e.flush(); assert.equal(status.childNodes[0].nodeValue, 'High, conserver les détails.');
});

test('ordinary conversation mutations cause no label writes and newly mounted controls are discovered', () => {
  const e = environment(); const conversation = e.element('article', {}, 'Text'); e.mount(conversation); e.run();
  const count = e.writes(); conversation.childNodes[0].nodeValue = 'High'; e.flush(); assert.equal(e.writes(), count + 1);
  const button = trigger(e); fibers(button, selection()); e.mount(button); e.flush(); assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Élevée');
});

test('status text split across native children keeps the position nodes and markup', () => {
  const e = environment(); const slider = e.element('div', { 'data-reasoning-slider': '', 'aria-describedby': 'status' });
  const status = e.element('span', { id: 'status', role: 'status', 'aria-live': 'polite' });
  const label = e.element('strong', {}, 'Extra '); const labelEnd = e.element('span', {}, 'High'); const numbers = e.element('span', {}, ', 4 sur 5.');
  status.append(label, labelEnd, numbers); e.mount(slider, status); e.run();
  assert.equal(label.childNodes[0].nodeValue, 'Très élevé'); assert.equal(labelEnd.childNodes[0].nodeValue, '');
  assert.equal(numbers.childNodes[0].nodeValue, ', 4 sur 5.'); assert.equal(status.childNodes[2], numbers);
});

test('fiber traversal is bounded and unrelated native aria labels are respected', () => {
  const e = environment(); const tooDeep = trigger(e); fibers(tooDeep, selection(), null, true, 41);
  // Put the selection beyond the 40 inspected ancestors, rather than the root.
  let owner = tooDeep.__reactFiber$test.return;
  const props = owner.memoizedProps; owner.memoizedProps = {};
  for (let i = 0; i < 40; i++) owner = owner.return;
  owner.memoizedProps = props;
  const custom = trigger(e); fibers(custom, selection()); custom.setAttribute('aria-label', 'Nom natif différent');
  e.mount(tooDeep, custom); e.run();
  assert.equal(tooDeep.getAttribute('aria-label'), 'Modèle ChatGPT : Élevée');
  assert.equal(custom.getAttribute('aria-label'), 'Nom natif différent');
});

test('exposed model names are preserved and hidden measurement captions are excluded', () => {
  const e = environment(); const button = trigger(e, 'high', '');
  button.append(e.element('span', { 'aria-hidden': 'true' }, 'Effort de réflexion'));
  button.append(e.element('span', {}, 'Astra'), e.element('span', {}, 'High'));
  fibers(button, selection({ modelLabel: 'Astra' })); e.mount(button); e.run();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Astra Élevée');
});

test('temporary legacy naming converges to the requested caption, including after native reset', () => {
  const e = environment(); const button = trigger(e, 'medium', 'Pro');
  fibers(button, selection({ model: 'gpt-6-pro', modelLabel: '6', reasoningEffort: 'medium', sliderLabel: 'Pro' }));
  e.context.window[Symbol.for('chatgpt-navigation-continue.model-labels.v1')] = true;
  button.setAttribute('aria-label', 'Sélectionner le modèle ChatGPT : 6 Pro, Pro'); e.mount(button); e.run();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Pro');
  button.setAttribute('aria-label', 'Sélectionner le modèle ChatGPT'); e.flush();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Pro');
});

test('native feminine Medium labels and preset props are preserved in button, slider and header', () => {
  const e = environment(); const button = trigger(e, 'medium', 'Moyenne'); const chosen = selection({ reasoningEffort: 'medium', sliderLabel: 'Moyenne', powerSettingIndex: 1 });
  fibers(button, chosen); const slider = e.element('div', { 'data-reasoning-slider': '', 'aria-label': 'Puissance' }, 'Moyenne'); const header = e.element('button', { 'data-model-picker-view-toggle': '' }, 'Moyenne');
  const outside = e.element('button', { 'aria-label': 'Moyenne' }, 'Moyenne'); const conversation = e.element('article', {}, 'Moyenne'); e.mount(button, slider, header, outside, conversation); e.run();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Moyenne'); assert.equal(button.childNodes[0].nodeValue, 'Moyenne'); assert.equal(slider.childNodes[0].nodeValue, 'Moyenne'); assert.equal(header.childNodes[0].nodeValue, 'Moyenne');
  assert.equal(slider.getAttribute('aria-label'), 'Puissance'); assert.equal(chosen.sliderLabel, 'Moyenne'); assert.equal(chosen.modelLabel, '5.6');
  assert.equal(outside.getAttribute('aria-label'), 'Moyenne'); assert.equal(outside.childNodes[0].nodeValue, 'Moyenne'); assert.equal(conversation.childNodes[0].nodeValue, 'Moyenne');
});

test('feminine Medium status variants retain their original positions, whitespace, punctuation and split nodes', () => {
  for (const text of ['Moyenne, 2 sur 5.', ' Moyenne, 2 sur 5 ', 'Moyenne,\u00a02\u00a0sur\u00a05.']) {
    const e = environment(); const slider = e.element('div', { 'data-reasoning-slider': '', 'aria-describedby': 'status instructions' }); const status = e.element('span', { id: 'status', role: 'status', 'aria-live': 'polite' }, text);
    const instructions = e.element('span', { id: 'instructions' }, 'Moyenne, utilise les flèches.'); e.mount(slider, status, instructions); e.run();
    assert.equal(status.childNodes[0].nodeValue, text.replace('Moyenne', 'Moyenne')); assert.equal(instructions.childNodes[0].nodeValue, 'Moyenne, utilise les flèches.');
  }
  const e = environment(); const slider = e.element('div', { 'data-reasoning-slider': '', 'aria-describedby': 'status' }); const status = e.element('span', { id: 'status', role: 'status', 'aria-live': 'polite' });
  const level = e.element('span', {}, 'Moyenne'); const position = e.element('span', {}, ', 2 sur 5.'); status.append(level, position); e.mount(slider, status); e.run();
  assert.equal(level.childNodes[0].nodeValue, 'Moyenne'); assert.equal(position.childNodes[0].nodeValue, ', 2 sur 5.'); assert.equal(status.childNodes[1], position);
});

test('native French labels survive updates but never rewrites arbitrary French sentences or other languages', () => {
  const e = environment(); const button = trigger(e, 'medium', 'Medium'); fibers(button, selection({ reasoningEffort: 'medium', sliderLabel: 'Medium' }));
  const slider = e.element('div', { 'data-reasoning-slider': '', 'aria-describedby': 'status' }); const status = e.element('span', { id: 'status', role: 'status', 'aria-live': 'polite' }, 'Medium, 2 sur 5.'); e.mount(button, slider, status); e.run();
  button.childNodes[0].nodeValue = 'Moyenne'; status.childNodes[0].nodeValue = 'Moyenne, 2 sur 5.'; e.flush(); assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Moyenne'); assert.equal(status.childNodes[0].nodeValue, 'Moyenne, 2 sur 5.');
  status.childNodes[0].nodeValue = 'Moyenne, conserver les résultats.'; e.flush(); assert.equal(status.childNodes[0].nodeValue, 'Moyenne, conserver les résultats.');
  e.document.documentElement.lang = 'en-US'; e.flush(); assert.equal(button.childNodes[0].nodeValue, 'Medium'); assert.equal(status.childNodes[0].nodeValue, 'Moyenne, conserver les résultats.');
});

test('model label stop restores native feminine strings and cancels queued work without changing settings', () => {
  const e = environment(); const button = trigger(e, 'medium', 'Moyenne'); const chosen = selection({ reasoningEffort: 'medium', sliderLabel: 'Moyenne' }); fibers(button, chosen); e.mount(button); e.run();
  const api = e.context.window[Symbol.for('chatgpt-navigation-continue.model-labels.current')]; assert.equal(api.version, 4); e.document.listeners.focusin({ target: button }); api.stop(); e.flush();
  assert.equal(api.active, false); assert.equal(button.childNodes[0].nodeValue, 'Moyenne'); assert.equal(button.getAttribute('aria-label'), 'Sélectionner le modèle ChatGPT'); assert.equal(chosen.sliderLabel, 'Moyenne'); assert.equal(e.document.listeners.focusin, undefined);
  e.run(); assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Moyenne');
});


test('document_start boots before HTML and adapts later native widgets without a load event', () => {
  const e = environment(); e.bootWithoutHTML();
  const button = trigger(e); fibers(button, selection()); e.mount(button); e.flush();
  assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : Élevée');
  e.context.window[Symbol.for('chatgpt-navigation-continue.model-labels.current')].stop();
  assert.equal(button.getAttribute('aria-label'), 'Sélectionner le modèle ChatGPT');
});

test('Work keeps native masculine captions while the closed trigger matches its feminine accessible status', () => {
  for (const [caption, statusLabel, effort] of [['Moyen', 'Moyenne', 'medium'], ['Élevé', 'Élevée', 'high']]) {
    const e = environment(); const chosen = selection({ sliderLabel: caption, reasoningEffort: effort });
    const button = trigger(e, effort, caption); fibers(button, chosen);
    const slider = e.element('div', { 'data-reasoning-slider': '', 'aria-describedby': 'status' });
    const status = e.element('span', { id: 'status', role: 'status', 'aria-live': 'polite' }, statusLabel + ', 2 sur 6.');
    const header = e.element('button', { 'data-model-picker-view-toggle': '' }, caption);
    const explicitModel = trigger(e, effort, ''); fibers(explicitModel, chosen);
    explicitModel.append(e.element('span', {}, chosen.modelLabel), e.element('span', {}, caption));
    e.mount(button, slider, status, header, explicitModel); e.run();
    assert.equal(button.getAttribute('aria-label'), 'Modèle ChatGPT : ' + statusLabel);
    assert.equal(explicitModel.getAttribute('aria-label'), 'Modèle ChatGPT : ' + chosen.modelLabel + ' ' + statusLabel);
    assert.equal(explicitModel.childNodes[2].childNodes[0].nodeValue, caption);
    assert.equal(button.childNodes[0].nodeValue, caption); assert.equal(header.childNodes[0].nodeValue, caption);
    assert.equal(status.childNodes[0].nodeValue, statusLabel + ', 2 sur 6.'); assert.equal(chosen.sliderLabel, caption);
    const before = e.writes(); e.document.listeners.focusin({ target: button }); e.flush(); assert.equal(e.writes(), before);
    e.context.window[Symbol.for('chatgpt-navigation-continue.model-labels.current')].stop();
    assert.equal(button.childNodes[0].nodeValue, caption); assert.equal(status.childNodes[0].nodeValue, statusLabel + ', 2 sur 6.');
  }
});


test('GPT-6 keeps its native effort-only caption instead of announcing a hidden model', () => {
 const e=environment(), button=trigger(e,'high','Élevée');
 const chosen=selection({id:'gpt-6-thinking:extended',model:'gpt-6-thinking',modelLabel:'GPT-6',sliderLabel:'Élevée'});
 fibers(button,chosen); const snapshot=JSON.stringify(chosen); e.mount(button); e.run();
 assert.equal(button.getAttribute('aria-label'),'Modèle ChatGPT : Élevée');
 assert.equal(button.childNodes[0].nodeValue,'Élevée');assert.equal(JSON.stringify(chosen),snapshot);
 e.context.window[Symbol.for('chatgpt-navigation-continue.model-labels.current')].stop();
 assert.equal(button.getAttribute('aria-label'),'Sélectionner le modèle ChatGPT');
});

test('new prefix stops the previous runtime without changing native choices', () => {
 const e=environment(),b=trigger(e); fibers(b,selection());e.mount(b);
 let stopped=0;e.context.window[Symbol.for('chatgpt-navigation-continue.model-labels.current')]={active:true,stop(){stopped++;}};
 e.run();assert.equal(stopped,1);assert.equal(b.getAttribute('aria-label'),'Modèle ChatGPT : Élevée');
});

test('abbreviated native visible model caption survives a fuller selection label', () => {
  const e=environment(),button=trigger(e,'high','5.6 Élevé');
  fibers(button,selection({modelLabel:'GPT-5.6 Sol',sliderLabel:'Élevé'}));
  e.mount(button);e.run();
  assert.equal(button.getAttribute('aria-label'),'Modèle ChatGPT : 5.6 Élevée');
  assert.equal(button.childNodes[0].nodeValue,'5.6 Élevé');
});
