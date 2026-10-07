const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('extension/keep-turns.js', 'utf8');

function environment() {
  class Element {
    constructor(turn = true, thread = true, id = 'message') { Object.assign(this, { turn, thread, id }); }
    matches() { return this.turn; }
    closest() { return this.thread ? {} : null; }
    getAttribute() { return this.id; }
  }
  class Entry { constructor(init) { Object.assign(this, init); } }
  class Observer {
    constructor(callback, options = {}) {
      if (typeof callback !== 'function') throw new TypeError('callback');
      this.callback = callback;
      this.rootMargin = options.rootMargin ?? '0px 0px 0px 0px';
      this.thresholds = [Math.fround(options.threshold ?? 0)];
      this.records = [];
      this.targets = new Set();
    }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); }
    takeRecords() { return this.records.splice(0); }
    emit(entries) { this.callback.call(this, entries, this); }
  }
  const window = { IntersectionObserver: Observer, IntersectionObserverEntry: Entry };
  const context = vm.createContext({ window, Element });
  vm.runInContext(source, context);
  const options = { rootMargin: '1000px 0px 1000px 0px', threshold: .01 };
  const entry = (target = new Element()) => new Entry({ target, time: 42, boundingClientRect: { x: 0, y: 8000, width: 100, height: 100 }, rootBounds: {}, intersectionRect: {}, isIntersecting: false, intersectionRatio: 0 });
  return { window, context, Observer, Element, Entry, options, entry };
}

test('offscreen turns stay intersecting; geometry/time and native instance retained', () => {
  const e = environment(); let result, self, observed;
  const observer = new e.window.IntersectionObserver(function(entries, instance) { result = entries; self = this; observed = instance; }, e.options);
  const original = e.entry(); observer.emit([original]);
  assert.equal(result[0].isIntersecting, true);
  assert.equal(result[0].intersectionRatio, 1);
  assert.equal(result[0].boundingClientRect, original.boundingClientRect);
  assert.equal(result[0].target, original.target);
  assert.equal(result[0].time, 42);
  assert.equal(result[0].rootBounds, null);
  assert.ok(result[0] instanceof e.Entry);
  assert.ok(observer instanceof e.Observer);
  assert.equal(self, observer); assert.equal(observed, observer);
  assert.equal(original.isIntersecting, false);
});
test('table of contents, lazy media, sidebar and ordinary observers unchanged', () => {
  const e = environment();
  for (const options of [{}, { rootMargin: '-49% 0px -49% 0px', threshold: 0 }, { ...e.options, threshold: .5 }]) {
    const original = e.entry();
    new e.window.IntersectionObserver(entries => assert.equal(entries[0], original), options).emit([original]);
  }
  for (const target of [new e.Element(false), new e.Element(true, false), new e.Element(true, true, 'client-created-root')]) {
    const original = e.entry(target);
    new e.window.IntersectionObserver(entries => assert.equal(entries[0], original), e.options).emit([original]);
  }
});
test('mixed batches retain native entries outside the target scope', () => {
  const e = environment(); const unrelated = e.entry(new e.Element(false));
  new e.window.IntersectionObserver(entries => { assert.equal(entries.length, 2); assert.equal(entries[1], unrelated); assert.equal(entries[0].isIntersecting, true); }, e.options).emit([e.entry(), unrelated]);
});
test('takeRecords uses the same transformation and drains native queue', () => {
  const e = environment(); const o = new e.window.IntersectionObserver(() => {}, e.options);
  o.records.push(e.entry()); assert.equal(o.takeRecords()[0].isIntersecting, true); assert.equal(o.takeRecords().length, 0);
});
test('native cleanup supports unmount, navigation and re-observation', () => {
  const e = environment(); const o = new e.window.IntersectionObserver(() => {}, e.options); const target = new e.Element();
  o.observe(target); o.unobserve(target); assert.equal(o.targets.size, 0);
  o.observe(target); o.disconnect(); assert.equal(o.targets.size, 0);
  o.observe(target); assert.equal(o.targets.size, 1);
});
test('duplicate injection is harmless and invalid callbacks still fail', () => {
  const e = environment(); const original = e.window.IntersectionObserver;
  vm.runInContext(source, e.context); assert.equal(e.window.IntersectionObserver, original);
  assert.throws(() => new original(null), TypeError);
});
test('manifest restricts scope and runs before page observers', () => {
  const m = JSON.parse(fs.readFileSync('extension/manifest.json', 'utf8'));
  assert.equal(m.manifest_version, 3); assert.equal(m.permissions, undefined);
  assert.equal(m.content_scripts[0].world, 'MAIN'); assert.equal(m.content_scripts[0].run_at, 'document_start');
  for (const item of m.content_scripts) assert.deepEqual(item.matches, ['https://chatgpt.com/*']);
});
