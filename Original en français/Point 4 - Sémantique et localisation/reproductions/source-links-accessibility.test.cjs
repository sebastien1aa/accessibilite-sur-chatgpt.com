const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../../../extension/source-links-accessibility.js'), 'utf8');
const marker = Symbol.for('chatgpt-navigation-continue.source-links-accessibility.v3');
const previousMarker = Symbol.for('chatgpt-navigation-continue.source-links-accessibility.v2');

// Small DOM double for ownership, native callback preservation and scheduling.
// It does not model browser accessibility trees or JAWS reception.
function environment({ noHTML = false } = {}) {
  const records = [], observers = [], frames = new Map();
  let serial = 0, scans = 0;
  class Element {
    constructor(tag, attrs = {}) { this.nodeType = 1; this.tagName = tag.toUpperCase(); this.attrs = { ...attrs }; this.children = []; this.parentElement = null; }
    get lang() { return this.getAttribute('lang') || ''; }
    get id() { return this.getAttribute('id') || ''; }
    get textContent() { return this.children.map(child => child.textContent).join(''); }
    get isConnected() { return !!document.documentElement?.contains(this); }
    getAttribute(name) { return this.attrs[name] ?? null; }
    hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
    setAttribute(name, value) { this.attrs[name] = String(value); records.push({ type: 'attributes', target: this, attributeName: name }); }
    removeAttribute(name) { delete this.attrs[name]; records.push({ type: 'attributes', target: this, attributeName: name }); }
    append(...nodes) { for (const node of nodes) { node.remove(); node.parentElement = this; this.children.push(node); } records.push({ type: 'childList', target: this, addedNodes: nodes, removedNodes: [] }); return this; }
    remove() { const parent = this.parentElement; if (!parent) return; parent.children.splice(parent.children.indexOf(this), 1); this.parentElement = null; records.push({ type: 'childList', target: parent, addedNodes: [], removedNodes: [this] }); }
    contains(node) { for (let n = node; n; n = n.parentElement) if (n === this) return true; return false; }
    matches(selector) {
      return selector.split(',').some(part => {
        const pieces = part.trim().split(/\s+(?=[a-z\[])/i);
        const simple = pieces.pop();
        const tag = /^[a-z]+/i.exec(simple)?.[0];
        if (tag && this.tagName !== tag.toUpperCase()) return false;
        if (![...simple.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)].every(([, name, value]) => this.hasAttribute(name) && (value === undefined || this.getAttribute(name) === value))) return false;
        let ancestor = this.parentElement;
        while (pieces.length) {
          const ancestorSelector = pieces.pop();
          while (ancestor && !ancestor.matches(ancestorSelector)) ancestor = ancestor.parentElement;
          if (!ancestor) return false;
          ancestor = ancestor.parentElement;
        }
        return true;
      });
    }
    closest(selector) { for (let n = this; n; n = n.parentElement) if (n.matches(selector)) return n; return null; }
    querySelectorAll(selector) { const found = []; const visit = n => { for (const child of n.children) { if (child.nodeType !== 1) continue; if (child.matches(selector)) found.push(child); visit(child); } }; visit(this); return found; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }
  class Text {
    constructor(value) { this.nodeType = 3; this.parentElement = null; this.value = value; }
    get textContent() { return this.value; }
    set data(value) { this.value = value; records.push({ type: 'characterData', target: this, addedNodes: [], removedNodes: [] }); }
    remove() { const parent = this.parentElement; if (!parent) return; parent.children.splice(parent.children.indexOf(this), 1); this.parentElement = null; records.push({ type: 'childList', target: parent, addedNodes: [], removedNodes: [this] }); }
  }
  const html = new Element('html', { lang: 'fr-FR' }), body = new Element('body'); html.append(body);
  const document = { documentElement: noHTML ? null : html, querySelectorAll(selector) { scans++; return this.documentElement?.querySelectorAll(selector) || []; } };
  const window = {};
  class MutationObserver {
    constructor(callback) { this.callback = callback; this.active = false; observers.push(this); }
    observe(root, options) { assert.equal(root, document); this.options = options; this.active = true; }
    disconnect() { this.active = false; }
  }
  const context = vm.createContext({ document, window, MutationObserver,
    requestAnimationFrame(callback) { const id = ++serial; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); } });
  function flush() {
    const pending = records.splice(0);
    for (const observer of observers) if (observer.active) {
      const filtered = pending.filter(r => r.type !== 'attributes' || observer.options.attributeFilter.includes(r.attributeName));
      if (filtered.length) observer.callback(filtered);
    }
  }
  function settle() { for (let i = 0; i < 12; i++) { flush(); if (!frames.size) return; const pending = [...frames]; frames.clear(); for (const [, callback] of pending) callback(); } throw new Error('Unbounded animation-frame loop'); }
  return { html, body, document, window, frames, observers, element: (tag, attrs) => new Element(tag, attrs), text: value => new Text(value), flush, settle,
    get scans() { return scans; }, run() { vm.runInContext(source, context); settle(); }, api: () => window[marker],
    mountHTML() { document.documentElement = html; records.push({ type: 'childList', target: document, addedNodes: [html], removedNodes: [] }); },
    textMutation(target) { records.push({ type: 'childList', target, addedNodes: [{ nodeType: 3 }], removedNodes: [] }); } };
}
function citation(e, { expanded = false, serial = 'one', label = 'Open Exemple' } = {}) {
  const turn = e.element('article', { 'data-turn-key': 'synthetic-' + serial });
  const trigger = e.element('span', { 'data-d-component': 'popover-trigger', 'data-d-inline': '', 'data-d-inline-text': '', role: 'button', tabindex: '0', 'aria-haspopup': 'dialog', 'aria-expanded': String(expanded), 'aria-controls': 'sources-' + serial });
  const badge = e.element('span', { 'data-d-component': 'badge' });
  const favicon = () => e.element('span', { 'data-d-component': 'favicon' }).append(e.element('img', { alt: '' }));
  badge.append(favicon(), e.text('Exemple')); trigger.append(badge); turn.append(trigger); e.body.append(turn);
  const dialog = e.element('div', { role: 'dialog', id: 'sources-' + serial });
  const card = e.element('button', { type: 'button', 'data-d-component': 'pressable', 'aria-label': label });
  const title = e.element('span'), excerpt = e.element('span'), titleText = e.text('Titre de la source'), excerptText = e.text(' — Extrait visible de la source.');
  title.append(titleText); excerpt.append(excerptText); card.append(favicon(), title, excerpt); dialog.append(card); e.body.append(dialog);
  const calls = { navigation: 0, preview: 0, keys: 0 };
  const click = () => { calls.navigation++; calls.preview++; trigger.setAttribute('aria-expanded', 'true'); };
  trigger.__reactProps$fixture = { role: 'button', onClick: click, onKeyDown(event) { calls.keys++; if (event.key === 'Enter' || event.key === ' ') click(); } };
  card.__reactProps$fixture = { type: 'button', 'aria-label': label, onClick() { calls.navigation++; } };
  return { turn, trigger, badge, dialog, card, titleText, excerptText, calls };
}
test('native hosts, callbacks, keyboard and popup attributes survive adaptation', () => {
  const e = environment(), f = citation(e, { expanded: true });
  const children = [...f.trigger.children], cardChildren = [...f.card.children], triggerProps = f.trigger.__reactProps$fixture, cardProps = f.card.__reactProps$fixture;
  const popup = ['aria-haspopup', 'aria-expanded', 'aria-controls', 'tabindex'].map(a => f.trigger.getAttribute(a));
  e.run(); assert.equal(f.trigger.getAttribute('role'), 'link'); assert.equal(f.card.getAttribute('role'), 'link'); assert.equal(f.card.getAttribute('aria-label'), null);
  assert.equal(f.card.textContent, 'Titre de la source — Extrait visible de la source.'); assert.equal(f.dialog.getAttribute('aria-label'), 'Aperçu des sources : Exemple');
  assert.deepEqual(f.trigger.children, children); assert.deepEqual(f.card.children, cardChildren); assert.equal(f.trigger.__reactProps$fixture, triggerProps); assert.equal(f.card.__reactProps$fixture, cardProps);
  assert.deepEqual(['aria-haspopup', 'aria-expanded', 'aria-controls', 'tabindex'].map(a => f.trigger.getAttribute(a)), popup);
  assert.deepEqual(f.calls, { navigation: 0, preview: 0, keys: 0 });
  triggerProps.onKeyDown({ key: ' ' }); cardProps.onClick(); e.settle(); assert.deepEqual(f.calls, { navigation: 2, preview: 1, keys: 1 });
  e.api().stop(); assert.equal(f.trigger.getAttribute('role'), 'button'); assert.equal(f.card.getAttribute('role'), null); assert.equal(f.card.getAttribute('aria-label'), 'Open Exemple');
  assert.equal(f.dialog.getAttribute('aria-label'), null);
});
test('single citation and +1 badge keep their existing accessible content', () => {
  const e = environment(), one = citation(e), group = citation(e, { serial: 'group' }); group.badge.setAttribute('aria-label', '+1');
  e.run(); assert.equal(one.trigger.getAttribute('role'), 'link'); assert.equal(group.trigger.getAttribute('role'), 'link'); assert.equal(group.badge.getAttribute('aria-label'), '+1');
  one.trigger.__reactProps$fixture.onClick(); group.trigger.__reactProps$fixture.onClick(); e.settle(); assert.equal(one.calls.preview, 1); assert.equal(group.calls.preview, 1);
});
test('arbitrary controls, incomplete source signatures and nested commands remain native', () => {
  for (const alter of [f => f.badge.remove(), f => f.badge.children[0].remove(), f => f.trigger.removeAttribute('data-d-inline'), f => f.trigger.removeAttribute('aria-haspopup'), f => delete f.trigger.__reactProps$fixture.onKeyDown,
    (f, e) => e.body.append(f.trigger), (f, e) => f.trigger.append(e.element('button')), (f, e) => f.trigger.append(e.element('span', { contenteditable: 'true' }))]) {
    const e = environment(), f = citation(e, { expanded: true }); alter(f, e); e.run(); assert.equal(f.trigger.getAttribute('role'), 'button'); assert.equal(f.card.getAttribute('role'), null);
  }
  const e = environment(), f = citation(e, { expanded: true }); f.card.__reactProps$fixture['aria-label'] = 'Delete Exemple'; f.card.setAttribute('aria-label', 'Delete Exemple'); e.run(); assert.equal(f.card.getAttribute('role'), null);
});
test('cards need an expanded valid trigger, one exact dialog id, and its own dialog scope', () => {
  for (const alter of [f => f.trigger.setAttribute('aria-expanded', 'false'), f => f.trigger.setAttribute('aria-controls', 'missing'), f => f.trigger.setAttribute('aria-controls', f.dialog.id + ' other'),
    (f, e) => e.body.append(e.element('div', { role: 'dialog', id: f.dialog.id })),
    (f, e) => e.body.append(e.element('section', { id: f.dialog.id })),
    (f, e) => e.body.append(f.card), (f, e) => f.card.append(e.element('a', { href: '/synthetic' })), f => f.card.setAttribute('aria-labelledby', 'foreign')]) {
    const e = environment(), f = citation(e, { expanded: true }); alter(f, e); e.run(); assert.equal(f.card.getAttribute('role'), null); assert.equal(f.card.getAttribute('aria-label'), 'Open Exemple');
  }
});
test('language and degeneration restore attributes then allow a fresh qualifying host', () => {
  const e = environment(), f = citation(e, { expanded: true }); e.run(); e.html.setAttribute('lang', 'en'); e.settle(); assert.equal(f.trigger.getAttribute('role'), 'button'); assert.equal(f.card.getAttribute('aria-label'), 'Open Exemple');
  e.html.setAttribute('lang', 'fr-BE'); e.settle(); assert.equal(f.card.getAttribute('role'), 'link');
  f.badge.remove(); e.settle(); assert.equal(f.trigger.getAttribute('role'), 'button'); assert.equal(f.card.getAttribute('role'), null);
  const replacement = citation(e, { expanded: true, serial: 'replacement' }); f.turn.remove(); f.dialog.remove(); e.settle(); assert.equal(replacement.trigger.getAttribute('role'), 'link'); assert.equal(replacement.card.getAttribute('aria-label'), null);
});
test('new native properties and foreign DOM writes supersede snapshots on stop', () => {
  const e = environment(), f = citation(e, { expanded: true }); e.run();
  f.card.__reactProps$fixture = { type: 'button', role: 'button', 'aria-label': 'Open Nouveau', onClick() {} }; f.card.setAttribute('aria-label', 'Open Nouveau'); e.settle(); assert.equal(f.card.getAttribute('aria-label'), null);
  f.trigger.setAttribute('role', 'menuitem'); e.api().stop(); assert.equal(f.trigger.getAttribute('role'), 'menuitem'); assert.equal(f.card.getAttribute('role'), 'button'); assert.equal(f.card.getAttribute('aria-label'), 'Open Nouveau');
});
test('private props inspection never traverses conversation children or unrelated node getters', () => {
  const e = environment(), f = citation(e, { expanded: true });
  f.dialog.__reactProps$fixture = {};
  for (const host of [f.trigger, f.card, f.dialog]) {
    Object.defineProperty(host.__reactProps$fixture, 'children', { get() { throw new Error('Private conversation children read'); } });
    Object.defineProperty(host, 'unrelatedSecret', { enumerable: true, get() { throw new Error('Unrelated node property read'); } });
  }
  e.run(); e.api().stop(); assert.equal(f.card.getAttribute('aria-label'), 'Open Exemple');
});
test('startup before HTML, duplicate injection and stop keep one bounded observer', () => {
  const e = environment({ noHTML: true }); e.run(); e.run(); assert.equal(e.observers.length, 1);
  const f = citation(e, { expanded: true }); e.mountHTML(); e.settle(); assert.equal(f.trigger.getAttribute('role'), 'link');
  f.trigger.setAttribute('aria-expanded', 'false'); e.flush(); assert.equal(e.frames.size, 1); e.api().stop(); assert.equal(e.frames.size, 0); assert.equal(e.observers.filter(o => o.active).length, 0); assert.equal(f.card.getAttribute('role'), null);
  e.api().stop(); e.run(); assert.equal(e.observers.filter(o => o.active).length, 1); assert.equal(f.trigger.getAttribute('role'), 'link'); assert.equal(f.card.getAttribute('role'), null);
});
test('unrelated streamed text avoids scans and a mutation burst coalesces to one frame', () => {
  const e = environment(), f = citation(e); e.run(); const paragraph = e.element('p'); e.body.append(paragraph); e.settle(); const scans = e.scans;
  for (let i = 0; i < 100; i++) e.textMutation(paragraph); e.settle(); assert.equal(e.scans, scans);
  const ordinaryText = e.text('Texte courant'); paragraph.append(ordinaryText); e.settle(); const scansBeforeText = e.scans;
  for (let i = 0; i < 100; i++) ordinaryText.data = String(i); e.settle(); assert.equal(e.scans, scansBeforeText);
  for (let i = 0; i < 100; i++) f.trigger.setAttribute('aria-expanded', String(i % 2 === 1)); e.flush(); assert.equal(e.frames.size, 1); e.settle(); assert.equal(e.frames.size, 0); assert.equal(f.card.getAttribute('role'), 'link');
});
test('empty card text restores its native label, then characterData makes it eligible again', () => {
  const e = environment(), f = citation(e, { expanded: true });
  f.titleText.data = ' '; f.excerptText.data = ''; e.run(); assert.equal(f.card.getAttribute('role'), null); assert.equal(f.card.getAttribute('aria-label'), 'Open Exemple');
  f.titleText.data = 'Titre revenu'; e.settle(); assert.equal(f.card.getAttribute('role'), 'link'); assert.equal(f.card.getAttribute('aria-label'), null);
  f.titleText.data = ''; e.settle(); assert.equal(f.card.getAttribute('role'), null); assert.equal(f.card.getAttribute('aria-label'), 'Open Exemple'); assert.equal(f.dialog.getAttribute('aria-label'), null);
});
test('dialog names provided by native DOM or props are preserved; foreign late names survive stop', () => {
  for (const name of ['aria-label', 'aria-labelledby', 'props']) {
    const e = environment(), f = citation(e, { expanded: true });
    if (name === 'props') f.dialog.__reactProps$fixture = { 'aria-label': 'Nom natif en attente' };
    else f.dialog.setAttribute(name, 'Nom natif');
    e.run(); assert.equal(f.card.getAttribute('aria-label'), null);
    assert.equal(f.dialog.getAttribute('aria-label'), name === 'aria-label' ? 'Nom natif' : null);
    if (name === 'aria-labelledby') assert.equal(f.dialog.getAttribute(name), 'Nom natif');
    e.api().stop(); assert.equal(f.dialog.getAttribute('aria-label'), name === 'aria-label' ? 'Nom natif' : null);
  }
  const e = environment(), f = citation(e, { expanded: true }); e.run(); f.dialog.setAttribute('aria-label', 'Nom natif ultérieur'); e.settle(); e.api().stop(); assert.equal(f.dialog.getAttribute('aria-label'), 'Nom natif ultérieur');
});
test('v3 stops v2 before adapting favicons and does not stack itself', () => {
  const e = environment(), f = citation(e, { expanded: true }); let oldStops = 0;
  const image = f.card.querySelector('[data-d-component="favicon"] img'); image.removeAttribute('alt');
  f.trigger.setAttribute('role', 'link'); f.card.setAttribute('role', 'link'); f.card.setAttribute('aria-label', 'Ouvrir Exemple');
  const oldFrame = 99; e.frames.set(oldFrame, () => { throw new Error('Previous adapter frame survived'); });
  const oldObserver = { active: true, options: { attributeFilter: [] }, callback() {} }; e.observers.push(oldObserver);
  e.window[previousMarker] = { active: true, stop() {
    assert.equal(image.getAttribute('alt'), null);
    oldStops++; this.active = false; oldObserver.active = false; e.frames.delete(oldFrame);
    f.trigger.setAttribute('role', 'button'); f.card.removeAttribute('role'); f.card.setAttribute('aria-label', 'Open Exemple');
  } };
  e.run(); e.run(); assert.equal(oldStops, 1); assert.equal(e.window[previousMarker].active, false); assert.equal(e.observers.filter(o => o.active).length, 1);
  assert.equal(e.api().version, 3); assert.equal(f.card.getAttribute('aria-label'), null); assert.equal(f.card.getAttribute('role'), 'link');
  assert.equal(image.getAttribute('alt'), '');
  e.api().stop(); assert.equal(f.card.getAttribute('aria-label'), 'Open Exemple'); assert.equal(image.getAttribute('alt'), null);
});

test('v3 also stops an older v1 adapter when v2 is absent', () => {
  const e = environment(); let stops = 0;
  e.window[Symbol.for('chatgpt-navigation-continue.source-links-accessibility.v1')] = { stop() { stops++; } };
  e.run(); e.run(); assert.equal(stops, 1); assert.equal(e.api().version, 3);
});

test('only missing alternatives in recognized source favicons become decorative', () => {
  // Shape from docs/preuves/2026-10-08-retour-jaws-apercu-4.1.0.json:
  // the presentation wrapper has an IMG without alt; thumbnail already has alt="".
  const e = environment(), f = citation(e, { expanded: true });
  const triggerImage = f.trigger.querySelector('[data-d-component="favicon"] img');
  const cardImage = f.card.querySelector('[data-d-component="favicon"] img');
  for (const image of [triggerImage, cardImage]) {
    image.removeAttribute('alt'); image.setAttribute('src', '/s2/favicons');
    image.parentElement.setAttribute('role', 'presentation');
  }
  const thumbnail = e.element('img', { alt: '' }), ordinary = e.element('img', { src: '/photo.png' });
  const outside = e.element('div', { 'data-d-component': 'favicon' }).append(e.element('img'));
  f.card.append(thumbnail, ordinary); e.body.append(outside);
  const text = f.card.textContent, children = [...f.card.children];
  e.run();
  for (const image of [triggerImage, cardImage]) {
    assert.equal(image.getAttribute('alt'), ''); assert.equal(image.getAttribute('role'), null);
    assert.equal(image.getAttribute('aria-hidden'), null); assert.equal(image.getAttribute('src'), '/s2/favicons');
  }
  assert.equal(ordinary.getAttribute('alt'), null); assert.equal(outside.children[0].getAttribute('alt'), null);
  assert.equal(thumbnail.getAttribute('alt'), ''); assert.equal(f.card.textContent, text); assert.deepEqual(f.card.children, children);
  e.api().stop(); assert.equal(triggerImage.getAttribute('alt'), null); assert.equal(cardImage.getAttribute('alt'), null); assert.equal(thumbnail.getAttribute('alt'), '');
});

test('meaningful image attributes and React alternatives remain native', () => {
  for (const name of ['alt', 'title', 'aria-label', 'aria-labelledby', 'aria-describedby', 'role', 'tabindex']) {
    for (const viaProps of [false, true]) {
      const e = environment(), f = citation(e, { expanded: true });
      const image = f.card.querySelector('[data-d-component="favicon"] img'); image.removeAttribute('alt');
      const value = name === 'role' ? 'img' : name === 'tabindex' ? '0' : 'Description native';
      if (viaProps) image.__reactProps$fixture = { [name === 'tabindex' ? 'tabIndex' : name]: value };
      else image.setAttribute(name, value);
      e.run(); assert.equal(image.getAttribute('alt'), !viaProps && name === 'alt' ? value : null);
      e.api().stop(); assert.equal(image.getAttribute('alt'), !viaProps && name === 'alt' ? value : null);
    }
  }
});

test('favicons in rejected hosts stay native and late source images are discovered', () => {
  const e = environment(), rejected = citation(e, { expanded: true });
  rejected.trigger.removeAttribute('data-d-inline');
  const rejectedImage = rejected.card.querySelector('[data-d-component="favicon"] img'); rejectedImage.removeAttribute('alt');
  const f = citation(e, { expanded: true, serial: 'late' }); e.run();
  assert.equal(rejectedImage.getAttribute('alt'), null);
  for (const host of [f.trigger, f.card]) {
    const wrapper = host.querySelector('[data-d-component="favicon"]');
    const image = e.element('img', { src: '/s2/favicons' }); wrapper.append(image); e.settle();
    assert.equal(image.getAttribute('alt'), '');
  }
});

test('language, removed source scope, and stop restore owned missing alt', () => {
  for (const action of ['language', 'scope', 'detach', 'stop']) {
    const e = environment(), f = citation(e, { expanded: true });
    const image = f.card.querySelector('[data-d-component="favicon"] img'); image.removeAttribute('alt');
    e.run(); assert.equal(image.getAttribute('alt'), '');
    if (action === 'language') e.html.setAttribute('lang', 'en');
    if (action === 'scope') f.trigger.setAttribute('aria-expanded', 'false');
    if (action === 'detach') image.remove();
    if (action === 'stop') e.api().stop(); else e.settle();
    assert.equal(image.getAttribute('alt'), null);
  }
});

test('late native image alternatives and foreign writes supersede owned alt', () => {
  for (const name of ['alt', 'title', 'aria-label', 'role']) {
    const e = environment(), f = citation(e, { expanded: true });
    const image = f.card.querySelector('[data-d-component="favicon"] img'); image.removeAttribute('alt'); image.__reactProps$fixture = {};
    e.run(); assert.equal(image.getAttribute('alt'), '');
    const value = name === 'role' ? 'img' : 'Description ultérieure';
    image.__reactProps$fixture = { [name]: value };
    // The native property must win even if stop precedes the next observer frame.
    if (name === 'alt') { e.api().stop(); assert.equal(image.getAttribute('alt'), value); }
    else { image.setAttribute(name, value); e.settle(); assert.equal(image.getAttribute('alt'), null); e.api().stop(); assert.equal(image.getAttribute(name), value); }
  }
  const e = environment(), f = citation(e, { expanded: true });
  const image = f.card.querySelector('[data-d-component="favicon"] img'); image.removeAttribute('alt'); e.run();
  image.setAttribute('alt', 'Nom écrit par le site'); e.settle(); e.api().stop(); assert.equal(image.getAttribute('alt'), 'Nom écrit par le site');
  const removed = environment(), other = citation(removed, { expanded: true });
  const otherImage = other.card.querySelector('[data-d-component="favicon"] img'); otherImage.removeAttribute('alt'); removed.run();
  otherImage.removeAttribute('alt'); removed.settle(); other.card.setAttribute('title', 'Mutation ultérieure'); removed.settle();
  assert.equal(otherImage.getAttribute('alt'), null); removed.api().stop(); assert.equal(otherImage.getAttribute('alt'), null);
});
