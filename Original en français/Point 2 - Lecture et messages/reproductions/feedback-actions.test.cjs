const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('extension/feedback-actions.js', 'utf8');
const marker = Symbol.for('chatgpt-navigation-continue.feedback-actions.v7');

// Small deterministic DOM/event clock: Chromium's actual disabled focus loss is
// tested separately in feedback-actions.html, not inferred from this double.
function environment(early = false) {
  const listeners = new Map(), timers = new Map(), records = [];
  let nextTimer = 0, observer;
  const listen = (target, type, fn) => {
    const key = target + ':' + type;
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(fn);
  };
  class Element {
    constructor(tag, attrs = {}, text = '') { this.tagName = tag.toUpperCase(); this.attrs = {...attrs}; this.children = []; this.parentElement = null; this.ownText = text; this.style = {}; this.focusCount = 0; }
    get isConnected() { let node = this; while (node.parentElement) node = node.parentElement; return node === document.documentElement; }
    get lang() { return this.getAttribute('lang'); }
    get ariaLabel() { return this.getAttribute('aria-label'); }
    set ariaLabel(value) {value==null?this.removeAttribute('aria-label'):this.setAttribute('aria-label',`${value}`);}
    get ariaBusy() { return this.getAttribute('aria-busy'); }
    set ariaBusy(value) {value==null?this.removeAttribute('aria-busy'):this.setAttribute('aria-busy',`${value}`);}
    get ariaDisabled(){return this.getAttribute('aria-disabled');}
    set ariaDisabled(value){value==null?this.removeAttribute('aria-disabled'):this.setAttribute('aria-disabled',`${value}`);}
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(value) { value ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }
    get textContent() { return this.ownText + this.children.map(n => n.textContent).join(''); }
    set textContent(value) { this.ownText = value; this.children = []; records.push({type:'childList', target:this}); }
    getAttribute(name) { return this.attrs[name] ?? null; }
    hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
    setAttribute(name, value) { const oldValue = this.getAttribute(name); this.attrs[name] = String(value); records.push({type:'attributes', target:this, attributeName:name, oldValue}); }
    removeAttribute(name) { const oldValue = this.getAttribute(name); delete this.attrs[name]; records.push({type:'attributes', target:this, attributeName:name, oldValue}); }
    toggleAttribute(name, force) {const value=arguments.length>1?!!force:!this.hasAttribute(name);value?this.setAttribute(name,''):this.removeAttribute(name);return value;}
    matches(selector) { return selector.split(',').some(s => {
      if(s.includes(' ')) {const parts=s.trim().split(/\s+/);return this.matches(parts.pop())&&!!this.parentElement?.closest(parts.join(' '));}
      s = s.trim(); const tag = /^[a-z]+/.exec(s)?.[0];
      if (tag && tag.toUpperCase() !== this.tagName) return false;
      return [...s.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)].every(([,attr,value]) => this.hasAttribute(attr) && (value === undefined || this.getAttribute(attr) === value));
    }); }
    closest(selector) { for (let node=this; node; node=node.parentElement) if (node.matches(selector)) return node; return null; }
    contains(node) {return node===this||this.children.some(child=>child.contains(node));}
    querySelectorAll(selector) { return this.children.flatMap(node => [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    append(node) { node.remove(); this.children.push(node); node.parentElement=this; records.push({type:'childList', target:this}); }
    remove() { if (this.parentElement) { const parent=this.parentElement; parent.children=parent.children.filter(n => n !== this); this.parentElement=null; records.push({type:'childList', target:parent}); } }
    getClientRects() { return this.isConnected ? [{}] : []; }
    focus(options) { assert.equal(options.preventScroll,true); this.focusCount++; document.activeElement=this; emit('document','focusin',{target:this}); }
  }
  const element = (tag, attrs, text) => new Element(tag, attrs, text);
  const document = {
    documentElement: early ? null : element('html', {lang:'fr-FR'}), body:null, activeElement:null,
    hasFocus: () => true,
    createElement:element,
    querySelectorAll: selector => document.documentElement?.querySelectorAll(selector) || [],
    querySelector: selector => document.querySelectorAll(selector)[0] || null,
    addEventListener: (type, fn) => listen('document',type,fn),
    removeEventListener: (type, fn) => listeners.get('document:'+type)?.delete(fn)
  };
  const window = {location:{href:'https://chatgpt.com/c/fixture'},
    addEventListener: (type,fn) => listen('window',type,fn),
    removeEventListener: (type,fn) => listeners.get('window:'+type)?.delete(fn)};
  const context=vm.createContext({window,document,MutationObserver:class {
    constructor(fn) {observer=this;this.fn=fn;} observe() {this.active=true;} disconnect() {this.active=false;} takeRecords(){return records.splice(0);}
  },setTimeout:(fn,delay)=>{const id=++nextTimer;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id)});
  function flush() { for(let i=0;i<20;i++) {if(!records.length)return; const batch=records.splice(0);if(observer?.active)observer.fn(batch);}throw Error('mutation loop'); }
  function tick(delay=0) {for(const [id,timer] of [...timers])if(timer.delay===delay){timers.delete(id);timer.fn();}flush();}
  function emit(target,type,event={}) {for(const fn of listeners.get(target+':'+type) || [])fn({type,target:target==='window'?window:document,...event});}
  function body() {if(!document.documentElement)document.documentElement=element('html',{lang:'fr-FR'});document.body=element('body');document.documentElement.append(document.body);document.activeElement=document.body;flush();}
  if(!early)body();
  const run=()=>{vm.runInContext(source,context);flush();};
  const click=button=>{document.activeElement=button;emit('window','click',{target:button,button:0,preventDefault(){},stopImmediatePropagation(){}});flush();};
  const status=()=>document.querySelector('[data-chatgpt-a11y-action-status]');
  function controls() {const header=element('header'), share=element('button',{'type':'button','aria-label':'Partager'}), turn=element('article',{'data-turn-key':'one'}), copy=element('button',{'type':'button','aria-label':'Copier'});document.body.append(header);header.append(share);document.body.append(turn);turn.append(copy);flush();return{header,share,turn,copy};}
  function toast(privacy=true) {const node=element('li',{'data-sonner-toast':'','data-visible':'true'}), title=element('div',{'data-title':''},'Le lien public a été copié.'+(privacy?'Toute personne disposant du lien peut consulter cette conversation.':''));node.append(title);document.body.append(node);flush();return node;}
  function busy(button) {button.disabled=true;if(button.hasAttribute('disabled')){emit('document','focusout',{target:button});document.activeElement=document.body;}flush();}
  return{window,document,element,run,flush,tick,emit,body,click,status,controls,toast,busy,context,timers,stop:()=>window[marker].stop(),listenerCount:()=>[...listeners.values()].reduce((n,s)=>n+s.size,0)};
}

for (const initialLabel of ['Copier', 'Copier le message']) test('copy '+initialLabel+' announces only the same native successful button; native focus and labels intact', () => {
  const e=environment();const c=e.controls();c.copy.setAttribute('aria-label',initialLabel);e.run();e.click(c.copy);assert.equal(e.status().textContent,'');
  c.copy.setAttribute('aria-label','Copié');e.flush();e.tick();
  assert.equal(e.status().textContent,'');e.tick(499);assert.equal(e.status().textContent,'');e.tick(500);
  assert.equal(e.status().textContent,'Message copié');assert.equal(e.document.activeElement,c.copy);assert.equal(c.copy.focusCount,0);
  c.copy.setAttribute('aria-label',initialLabel);e.flush();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();
  assert.equal(e.status().textContent,'');e.tick(500);assert.equal(e.status().textContent,'Message copié');
});

test('no false copy confirmation for failed, stale, unrelated or newer activations', () => {
  const e=environment();const c=e.controls();e.run();
  c.copy.setAttribute('aria-label','Copié');e.flush();e.tick(500);assert.equal(e.status().textContent,'');
  c.copy.setAttribute('aria-label','Copier');e.click(c.copy);e.tick(500);assert.equal(e.status().textContent,'');
  const other=e.element('button',{'aria-label':'Autre'});e.document.body.append(other);e.click(other);
  c.copy.setAttribute('aria-label','Copié');e.flush();e.tick(500);assert.equal(e.status().textContent,'');
});

test('Share retains focus before native disabled can reach BODY, mirrors only new toast', () => {
  const e=environment();const c=e.controls();e.toast();e.run();e.click(c.share);e.busy(c.share);
  assert.equal(c.share.disabled,true);assert.equal(c.share.hasAttribute('disabled'),false);assert.equal(c.share.getAttribute('aria-disabled'),'true');assert.equal(e.document.activeElement,c.share);
  c.share.disabled=false;e.flush();assert.equal(e.document.activeElement,c.share);assert.equal(c.share.focusCount,0);
  e.tick();assert.equal(e.status().textContent,'');e.toast();e.tick();
  assert.equal(e.status().textContent,'Le lien public a été copié. Toute personne disposant du lien peut consulter cette conversation.');
  e.flush();e.tick();assert.equal(c.share.focusCount,0);
});

test('Share absent privacy stays absent; failure can retain focus without false success', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.share);e.busy(c.share);c.share.disabled=false;e.flush();e.tick();
  assert.equal(e.status().textContent,'');assert.equal(e.document.activeElement,c.share);
  e.toast(false);e.tick();assert.equal(e.status().textContent,'Le lien public a été copié.');
});

for(const intent of ['external focus','Tab','h','Ctrl+L','pointerdown','blur','route','reparent','turn recycle','popup','expiry']) {
  test('pending operation respects '+intent, () => {
    const e=environment();const c=e.controls();e.run();e.click(c.share);e.busy(c.share);
    if(intent==='external focus') {const other=e.element('button');e.document.body.append(other);e.emit('document','focusin',{target:other});e.document.activeElement=e.document.body;}
    if(intent==='Tab')e.emit('window','keydown',{key:'Tab'});
    if(intent==='h')e.emit('window','keydown',{key:'h'});
    if(intent==='Ctrl+L')e.emit('window','keydown',{key:'l',ctrlKey:true});
    if(intent==='pointerdown'||intent==='blur')e.emit('window',intent);
    if(intent==='route')e.window.location.href='https://chatgpt.com/c/other';
    if(intent==='reparent'){e.document.body.append(c.share);}
    if(intent==='turn recycle'){e.click(c.copy);c.turn.setAttribute('data-turn-key','two');c.copy.setAttribute('aria-label','Copié');}
    if(intent==='popup')e.document.body.append(e.element('div',{role:'dialog'}));
    if(intent==='expiry')e.tick(15000);
    c.share.disabled=false;e.flush();e.toast();e.tick();assert.equal(c.share.focusCount,0);
    if(['route','reparent','turn recycle','expiry'].includes(intent))assert.equal(e.status().textContent,'');
  });
}

test('early startup, language change, idempotence and stop leave no tasks/listeners/status', () => {
  const e=environment(true);e.run();assert.equal(e.status(),null);e.body();const c=e.controls();const status=e.status();e.run();assert.equal(e.status(),status);
  e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();e.stop();e.tick();assert.equal(e.status(),null);assert.equal(e.timers.size,0);assert.equal(e.listenerCount(),0);
  e.run();e.document.documentElement.setAttribute('lang','en');e.flush();assert.equal(e.status(),null);
});

test('copy inside a dialog, message Share and ordinary Ctrl+C remain native', () => {
  const e=environment();const c=e.controls();e.run();
  const messageShare=e.element('button',{'aria-label':'Partager'});c.turn.append(messageShare);e.click(messageShare);e.busy(messageShare);messageShare.disabled=false;e.toast();e.tick();assert.equal(e.status().textContent,'');assert.equal(messageShare.focusCount,0);
  const dialog=e.element('div',{role:'dialog'});c.turn.append(dialog);dialog.append(c.copy);e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();e.tick(500);assert.equal(e.status().textContent,'');
  const event={key:'c',ctrlKey:true,defaultPrevented:false};e.emit('window','keydown',event);assert.equal(event.defaultPrevented,false);assert.equal(e.listenerCount(),4);
});

test('non-header Share and an activation that did not own focus cannot steal focus', () => {
  const e=environment();const c=e.controls();e.run();
  e.emit('window','click',{target:c.share,button:0});e.busy(c.share);c.share.disabled=false;e.flush();assert.equal(c.share.focusCount,0);
  e.document.body.append(c.share);e.click(c.share);e.busy(c.share);c.share.disabled=false;e.flush();e.toast();e.tick();assert.equal(c.share.focusCount,0);assert.equal(e.status().textContent,'');
});

test('same URL history event cancels queued feedback before delivery', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();e.emit('window','popstate');e.tick(500);assert.equal(e.status().textContent,'');
});

test('busy Share blocks repeated activation without cancelling its announcement', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.share);e.busy(c.share);
  let prevented=false,stopped=false;
  const event={target:c.share,button:0,preventDefault(){prevented=true;},stopImmediatePropagation(){stopped=true;}};e.emit('window','click',event);
  assert.equal(prevented,true);assert.equal(stopped,true);assert.equal(c.share.disabled,true);
  c.share.removeAttribute('disabled');e.flush();e.toast();e.tick();assert.ok(e.status().textContent.includes('Le lien public a été copié.'));
});

test('other activation and announcement expiry do not release a busy focus guard', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.share);c.share.setAttribute('disabled','false');e.flush();
  e.tick(15000);assert.equal(c.share.hasAttribute('disabled'),false);assert.equal(e.document.activeElement,c.share);
  e.click(c.copy);assert.equal(c.share.hasAttribute('disabled'),false);assert.equal(c.share.disabled,true);
  c.share.removeAttribute('disabled');e.flush();assert.equal(c.share.disabled,false);assert.equal(e.document.activeElement,c.copy);assert.equal(Object.hasOwn(c.share,'disabled'),false);
});

test('stop busy materializes the last exact native disabled request and restores ARIA/methods', () => {
  const e=environment();const c=e.controls();c.share.setAttribute('aria-disabled','false');e.run();const set=c.share.setAttribute,remove=c.share.removeAttribute;
  e.click(c.share);c.share.setAttribute('disabled','false');e.flush();assert.equal(c.share.getAttribute('aria-disabled'),'true');
  e.stop();assert.equal(c.share.getAttribute('disabled'),'false');assert.equal(c.share.getAttribute('aria-disabled'),'false');assert.equal(c.share.setAttribute,set);assert.equal(c.share.removeAttribute,remove);assert.equal(Object.hasOwn(c.share,'disabled'),false);
});

test('foreign instance hooks and non-extensible buttons are untouched', () => {
  for(const foreign of [true,false]) {const e=environment();const c=e.controls();if(foreign)c.share.setAttribute=function(name,value){this.attrs[name]=String(value);};else Object.preventExtensions(c.share);e.run();const original=c.share.setAttribute;e.click(c.share);assert.equal(c.share.setAttribute,original);assert.equal(Object.hasOwn(c.share,'disabled'),false);}
});

test('toggle/property/foreign attributes and borrowed receivers retain native semantics', () => {
  const e=environment();const c=e.controls();e.run();const other=e.element('button');e.document.body.append(other);e.click(c.share);
  const borrowed=c.share.setAttribute;borrowed.call(other,'disabled','');assert.equal(other.hasAttribute('disabled'),true);assert.equal(c.share.disabled,false);
  c.share.setAttribute('title','native title');assert.equal(c.share.getAttribute('title'),'native title');
  assert.equal(c.share.toggleAttribute('DISABLED'),true);assert.equal(c.share.disabled,true);assert.equal(c.share.hasAttribute('disabled'),false);
  assert.equal(c.share.toggleAttribute('disabled',false),false);assert.equal(c.share.disabled,false);assert.equal(Object.hasOwn(c.share,'toggleAttribute'),false);
});

test('later foreign descriptor or ARIA write is not overwritten by stop', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.share);e.busy(c.share);
  const foreign=()=>false;Object.defineProperty(c.share,'disabled',{get:foreign,configurable:true});c.share.setAttribute('aria-disabled','mixed');e.stop();
  assert.equal(Object.getOwnPropertyDescriptor(c.share,'disabled').get,foreign);assert.equal(c.share.getAttribute('aria-disabled'),'mixed');assert.equal(c.share.hasAttribute('disabled'),false);
});

test('detached or relabelled button releases instance hooks and preserves latest disabled', () => {
  for(const detached of [true,false]) {const e=environment();const c=e.controls();e.run();e.click(c.share);e.busy(c.share);detached?c.share.remove():c.share.setAttribute('aria-label','Autre');e.flush();assert.equal(Object.hasOwn(c.share,'disabled'),false);assert.equal(c.share.hasAttribute('disabled'),true);assert.equal(c.share.focusCount,0);}
});

test('stop completes if a third party makes our descriptor non-configurable', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.share);e.busy(c.share);Object.defineProperty(c.share,'disabled',{configurable:false});
  e.stop();assert.equal(e.listenerCount(),0);assert.equal(e.status(),null);assert.equal(c.share.hasAttribute('disabled'),true);assert.equal(c.share.disabled,true);
});

test('foreign ARIA change then native re-enable never materializes old busy disabled', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.share);e.busy(c.share);
  const recorded=[];const attrs=c.share.attrs;c.share.attrs=new Proxy(attrs,{set(object,key,value){recorded.push(key);object[key]=value;return true;}});
  c.share.setAttribute('aria-disabled','false');c.share.removeAttribute('disabled');e.flush();assert.equal(recorded.includes('disabled'),false);assert.equal(c.share.disabled,false);assert.equal(e.document.activeElement,c.share);
});

test('expiry removes idle instance hooks if native action never became busy', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.share);assert.equal(Object.hasOwn(c.share,'disabled'),true);e.tick(15000);assert.equal(Object.hasOwn(c.share,'disabled'),false);assert.equal(c.share.hasAttribute('disabled'),false);assert.equal(e.document.activeElement,c.share);
});

for (const initial of ['Copier','Copier le message']) test('native '+initial+' success retains accessible name with no secondary DOM signal', () => {
  const e=environment();const c=e.controls();c.copy.setAttribute('aria-label',initial);e.run();e.click(c.copy);
  const original=c.copy.attrs;const names=[];c.copy.attrs=new Proxy(original,{set(object,key,value){if(key==='aria-label')names.push(value);object[key]=value;return true;}});
  c.copy.setAttribute('aria-label','Copié');assert.equal(c.copy.getAttribute('aria-label'),initial);assert.equal(c.copy.ariaLabel,initial);assert.deepEqual(names,[]);
  e.tick(500);assert.equal(e.status().textContent,'Message copié');assert.equal(e.document.activeElement,c.copy);assert.equal(c.copy.focusCount,0);
  c.copy.setAttribute('aria-label',initial);e.flush();assert.equal(Object.hasOwn(c.copy,'setAttribute'),false);assert.equal(c.copy.getAttribute('aria-label'),initial);
});

test('copy ariaLabel reflection also signals confirmed success without changing the name', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.copy);c.copy.ariaLabel='Copié';e.tick(500);assert.equal(c.copy.ariaLabel,'Copier');assert.equal(e.status().textContent,'Message copié');c.copy.ariaLabel='Copier';assert.equal(Object.hasOwn(c.copy,'ariaLabel'),false);
});

test('copy stop during confirmation restores last native label and cancels delivery', () => {
  const e=environment();const c=e.controls();e.run();const nativeSet=c.copy.setAttribute;e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.stop();e.tick();assert.equal(c.copy.getAttribute('aria-label'),'Copié');assert.equal(c.copy.setAttribute,nativeSet);assert.equal(e.status(),null);assert.equal(e.timers.size,0);
});

test('copy name protection outlives cancel, releases on native reset, avoids stale speech', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.emit('window','click',{target:c.share,button:0});e.tick(500);assert.equal(e.status().textContent,'');assert.equal(c.copy.getAttribute('aria-label'),'Copier');assert.equal(Object.hasOwn(c.copy,'setAttribute'),true);
  c.copy.setAttribute('aria-label','Copier');assert.equal(Object.hasOwn(c.copy,'setAttribute'),false);
});

test('unknown native copy name and aria-label removal are forwarded and stop protection', () => {
  for (const remove of [true,false]) {const e=environment();const c=e.controls();e.run();e.click(c.copy);remove?c.copy.removeAttribute('aria-label'):c.copy.setAttribute('aria-label','Autre');e.flush();e.tick();assert.equal(Object.hasOwn(c.copy,'setAttribute'),false);assert.equal(c.copy.getAttribute('aria-label'),remove?null:'Autre');assert.equal(e.status().textContent,'');}
});

test('copy expiry restores last native name without changing focus or leaving hooks', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.tick(15000);assert.equal(c.copy.getAttribute('aria-label'),'Copié');assert.equal(Object.hasOwn(c.copy,'setAttribute'),false);assert.equal(e.document.activeElement,c.copy);assert.equal(c.copy.focusCount,0);
});

test('copy label hook respects foreign writes and borrowed receivers', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.copy);const borrowed=c.copy.setAttribute;borrowed.call(c.share,'aria-label','Autre partage');assert.equal(c.share.getAttribute('aria-label'),'Autre partage');c.copy.setAttribute('title','Native');assert.equal(c.copy.getAttribute('title'),'Native');
  c.copy.setAttribute('aria-label','Copié');c.copy.attrs['aria-label']='Nom externe';e.stop();assert.equal(c.copy.getAttribute('aria-label'),'Nom externe');
});

test('copy protection fails closed with foreign instance hook, leaves native confirmation observable', () => {
  const e=environment();const c=e.controls();const native=c.copy.setAttribute;c.copy.setAttribute=function(name,value){return native.call(this,name,value);};e.run();const foreign=c.copy.setAttribute;e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();e.tick(500);assert.equal(c.copy.setAttribute,foreign);assert.equal(c.copy.getAttribute('aria-label'),'Copié');assert.equal(e.status().textContent,'Message copié');
});

test('copy stop cleans even if a third party locks a retained wrapper', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');Object.defineProperty(c.copy,'setAttribute',{configurable:false});e.stop();assert.equal(e.listenerCount(),0);assert.equal(e.timers.size,0);assert.equal(c.copy.getAttribute('aria-label'),'Copié');c.copy.setAttribute('title','Still native');assert.equal(c.copy.getAttribute('title'),'Still native');
});

test('copy recycled turn restores native label but does not deliver old success', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');c.turn.setAttribute('data-turn-key','recycled');e.flush();e.tick(500);assert.equal(e.status().textContent,'');assert.equal(c.copy.getAttribute('aria-label'),'Copié');assert.equal(Object.hasOwn(c.copy,'setAttribute'),false);
});

for (const initial of ['Copier']) test('second '+initial+' success before native reset reuses name hook for current activation only', () => {
  const e=environment();const c=e.controls();c.copy.setAttribute('aria-label',initial);e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.tick(500);assert.equal(e.status().textContent,'Message copié');
  const hook=c.copy.setAttribute;e.click(c.copy);assert.equal(c.copy.setAttribute,hook);c.copy.setAttribute('aria-label','Copié');assert.equal(e.status().textContent,'');e.tick(500);assert.equal(e.status().textContent,'Message copié');assert.equal(c.copy.getAttribute('aria-label'),initial);
});

test('changed route with history event releases copy hook without DOM mutation', () => {
  const e=environment();const c=e.controls();e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.window.location.href='https://chatgpt.com/c/other';e.emit('window','popstate');assert.equal(Object.hasOwn(c.copy,'setAttribute'),false);e.tick(500);assert.equal(e.status().textContent,'');
});

for (const label of ['Copier','Copier le message']) test('decorative '+label+' SVG is hidden before navigation, replacement and return remain native', () => {
  const e=environment();const c=e.controls();c.copy.setAttribute('aria-label',label);const first=e.element('svg'),path=e.element('path',{d:'M0 0L1 1'});first.append(path);c.copy.append(first);const nativeSet=c.copy.setAttribute;
  e.run();assert.equal(first.getAttribute('aria-hidden'),'true');assert.equal(c.copy.getAttribute('aria-hidden'),null);assert.equal(c.copy.setAttribute,nativeSet);assert.equal(path.getAttribute('d'),'M0 0L1 1');
  e.click(c.copy);c.copy.setAttribute('aria-label','Copié');const check=e.element('svg');first.remove();c.copy.append(check);e.flush();e.tick();
  assert.equal(e.status().textContent,'');e.tick(500);
  assert.equal(first.getAttribute('aria-hidden'),null);assert.equal(check.getAttribute('aria-hidden'),'true');assert.equal(e.status().textContent,'Message copié');assert.equal(c.copy.getAttribute('aria-label'),label);
  c.copy.setAttribute('aria-label',label);check.remove();c.copy.append(first);e.flush();assert.equal(check.getAttribute('aria-hidden'),null);assert.equal(first.getAttribute('aria-hidden'),'true');assert.equal(e.document.activeElement,c.copy);assert.equal(c.copy.focusCount,0);
  e.stop();assert.equal(first.getAttribute('aria-hidden'),null);assert.equal(e.listenerCount(),0);
});

test('decorative icon scope excludes Share, outside turns, dialogs, other buttons and submit', () => {
  const e=environment();const c=e.controls();const buttons=[c.share,e.element('button',{'aria-label':'Copier',type:'button'}),e.element('button',{'aria-label':'Autre',type:'button'}),e.element('button',{'aria-label':'Copier',type:'submit'})];e.document.body.append(buttons[1]);c.turn.append(buttons[2]);c.turn.append(buttons[3]);const dialog=e.element('div',{role:'dialog'});c.turn.append(dialog);const dc=e.element('button',{'aria-label':'Copier',type:'button'});dialog.append(dc);buttons.push(dc);const svgs=buttons.map(b=>{const s=e.element('svg');b.append(s);return s;});e.run();assert.ok(svgs.every(s=>s.getAttribute('aria-hidden')===null));
});

for (const semantics of ['aria-label','aria-labelledby','aria-describedby','role','tabindex','focusable','title','desc','interactive child','foreign hidden']) test('copy SVG '+semantics+' is preserved', () => {
  const e=environment();const c=e.controls();const svg=e.element('svg');
  if(['aria-label','aria-labelledby','aria-describedby','role','tabindex'].includes(semantics))svg.setAttribute(semantics,semantics==='tabindex'?'0':'value');
  if(semantics==='focusable')svg.setAttribute('focusable','true');
  if(['title','desc'].includes(semantics))svg.append(e.element(semantics,{},'Specific information'));
  if(semantics==='interactive child')svg.append(e.element('a',{href:'#'}));
  if(semantics==='foreign hidden')svg.setAttribute('aria-hidden','false');
  c.copy.append(svg);e.run();assert.equal(svg.getAttribute('aria-hidden'),semantics==='foreign hidden'?'false':null);
});

test('foreign SVG hidden state, changed copy name and recycled turn are respected', () => {
  const e=environment();const c=e.controls();const svg=e.element('svg');c.copy.append(svg);e.run();svg.setAttribute('aria-hidden','false');e.flush();e.stop();assert.equal(svg.getAttribute('aria-hidden'),'false');
  svg.removeAttribute('aria-hidden');e.run();assert.equal(svg.getAttribute('aria-hidden'),'true');c.copy.setAttribute('aria-label','Autre');e.flush();assert.equal(svg.getAttribute('aria-hidden'),null);
});

test('copy icon startup without HTML, language change and native already-hidden icon restore only own changes', () => {
  const e=environment(true);e.run();e.body();const c=e.controls(),svg=e.element('svg'),hidden=e.element('svg',{'aria-hidden':'true'});c.copy.append(svg);c.copy.append(hidden);e.flush();assert.equal(svg.getAttribute('aria-hidden'),'true');e.document.documentElement.setAttribute('lang','en');e.flush();assert.equal(svg.getAttribute('aria-hidden'),null);assert.equal(hidden.getAttribute('aria-hidden'),'true');e.stop();
});

test('focused SVG is not hidden; later meaningful descendant restores accessibility', () => {
  const e=environment();const c=e.controls(),svg=e.element('svg');c.copy.append(svg);e.document.activeElement=svg;e.run();assert.equal(svg.getAttribute('aria-hidden'),null);e.document.activeElement=c.copy;c.copy.setAttribute('title','Native');e.flush();assert.equal(svg.getAttribute('aria-hidden'),'true');svg.append(e.element('title',{},'Now meaningful'));e.flush();assert.equal(svg.getAttribute('aria-hidden'),null);
});

test('model pending is still unavailable with unchanged native callback and focus', () => {
  const e=environment(), c=e.controls(); const handler=()=>{};c.copy.onclick=handler;e.run();e.click(c.copy);
  c.copy.setAttribute('aria-busy','true');c.copy.setAttribute('aria-disabled','true');e.flush();
  assert.equal(c.copy.getAttribute('aria-busy'),null);assert.equal(c.copy.getAttribute('aria-disabled'),'true');
  assert.equal(c.copy.onclick,handler);assert.equal(e.document.activeElement,c.copy);assert.equal(c.copy.focusCount,0);
  c.copy.removeAttribute('aria-busy');c.copy.removeAttribute('aria-disabled');c.copy.setAttribute('aria-label','Copié');e.tick(500);
  assert.equal(e.status().textContent,'Message copié');assert.equal(c.copy.getAttribute('aria-disabled'),null);
});

test('busy reflection is scoped, preserves borrowed receivers and restores pending state on stop', () => {
  const e=environment(),c=e.controls();e.run();e.click(c.copy);c.copy.ariaBusy='true';assert.equal(c.copy.ariaBusy,null);
  c.copy.setAttribute.call(c.share,'aria-busy','true');assert.equal(c.share.getAttribute('aria-busy'),'true');
  e.stop();assert.equal(c.copy.ariaBusy,'true');assert.equal(Object.hasOwn(c.copy,'ariaBusy'),false);
});

test('existing native busy and foreign busy changes are not erased', () => {
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-busy','true');e.run();e.click(c.copy);c.copy.setAttribute('aria-busy','true');assert.equal(c.copy.getAttribute('aria-busy'),'true');e.stop();assert.equal(c.copy.getAttribute('aria-busy'),'true');
  e.run();c.copy.removeAttribute('aria-busy');e.click(c.copy);c.copy.setAttribute('aria-busy','true');c.copy.attrs['aria-busy']='false';e.stop();assert.equal(c.copy.getAttribute('aria-busy'),'false');
});

test('busy nullable reflection and a synchronous foreign rename keep native semantics',()=>{
  const e=environment(),c=e.controls();e.run();e.click(c.copy);c.copy.ariaBusy='true';c.copy.ariaBusy=undefined;assert.equal(c.copy.getAttribute('aria-busy'),null);assert.throws(()=>{c.copy.ariaBusy=Symbol('busy');}, /Symbol/);
  c.copy.attrs['aria-label']='Other native action';c.copy.setAttribute('aria-busy','true');assert.equal(c.copy.getAttribute('aria-busy'),'true');assert.equal(Object.hasOwn(c.copy,'setAttribute'),false);
});

for(const label of ['Copier','Copier le message'])test(label+' confirms 500ms after success before native reset',()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label',label);e.run();e.click(c.copy);
  c.copy.setAttribute('aria-label',label);e.tick(500);assert.equal(e.status().textContent,'');
  e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.tick();e.tick(499);assert.equal(e.status().textContent,'');
  e.tick(500);assert.equal(e.status().textContent,'Message copié');assert.equal(c.copy.getAttribute('aria-label'),label);
  c.copy.setAttribute('aria-label',label);e.tick(500);assert.equal(e.status().textContent,'Message copié');
});

for(const interruption of ['other click','route','stop','recycled turn'])test('sender delayed confirmation cancelled by '+interruption,()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');c.copy.setAttribute('aria-label','Copier le message');
  if(interruption==='other click')e.click(c.share);
  if(interruption==='route'){e.window.location.href+='other';e.emit('window','popstate');}
  if(interruption==='stop')e.stop();
  if(interruption==='recycled turn')c.turn.setAttribute('data-turn-key','recycled');
  e.tick(500);assert.equal(e.status()?.textContent||'','');
});

test('sender unavailable repeat is blocked and preserves confirmed feedback',()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');const hook=c.copy.setAttribute;
  let prevented=false;e.emit('window','click',{target:c.copy,button:0,preventDefault(){prevented=true;},stopImmediatePropagation(){}});assert.equal(prevented,true);assert.equal(c.copy.setAttribute,hook);
  c.copy.setAttribute('aria-label','Copier le message');e.tick(500);assert.equal(e.status().textContent,'Message copié');
});

test('sender relabelled during settling does not announce stale success',()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');c.copy.setAttribute('aria-label','Copier le message');c.copy.setAttribute('aria-label','Autre action');e.tick(500);assert.equal(e.status().textContent,'');
});

test('sender with foreign method confirms observed success without waiting for reset',()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');const set=c.copy.setAttribute;c.copy.setAttribute=function(...a){return set.apply(this,a);};e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();e.tick();assert.equal(e.status().textContent,'');e.tick(500);assert.equal(e.status().textContent,'Message copié');
});

test('non-direct SVG, anchor without href and independent icon handler are untouched', () => {
  const e=environment();const c=e.controls(),wrap=e.element('span'),nested=e.element('svg'),anchor=e.element('svg'),handled=e.element('svg');wrap.append(nested);c.copy.append(wrap);anchor.append(e.element('a'));c.copy.append(anchor);handled.onclick=()=>{};c.copy.append(handled);e.run();assert.ok([nested,anchor,handled].every(svg=>svg.getAttribute('aria-hidden')===null));
});

for(const original of [null,'false','true'])test('sender unavailable success and reset preserve original ARIA '+original,()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');if(original!==null)c.copy.setAttribute('aria-disabled',original);e.run();const handler=()=>{};c.copy.onclick=handler;e.click(c.copy);assert.equal(c.copy.getAttribute('aria-disabled'),original);
  c.copy.setAttribute('aria-label','Copié');e.flush();assert.equal(c.copy.getAttribute('aria-disabled'),'true');assert.equal(c.copy.hasAttribute('disabled'),false);assert.equal(e.document.activeElement,c.copy);assert.equal(c.copy.onclick,handler);e.tick(500);assert.equal(e.status().textContent,'Message copié');
  c.copy.setAttribute('aria-label','Copier le message');e.flush();assert.equal(c.copy.getAttribute('aria-disabled'),original);assert.equal(c.copy.focusCount,0);
});

for(const end of ['stop','expiry','route','rename','recycle'])test('sender unavailable cleaned on '+end,()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();
  if(end==='stop')e.stop();if(end==='expiry')e.tick(15000);if(end==='route'){e.window.location.href+='other';e.emit('window','popstate');}if(end==='rename')Object.getPrototypeOf(c.copy).setAttribute.call(c.copy,'aria-label','Foreign action');if(end==='recycle')c.turn.setAttribute('data-turn-key','new');e.flush();
  assert.equal(c.copy.getAttribute('aria-disabled'),null);assert.equal(Object.hasOwn(c.copy,'ariaDisabled'),false);e.tick(500);assert.equal(e.status()?.textContent||'','');
});

for(const write of ['method','reflection','prototype'])test('sender unavailable respects later foreign '+write+' write',()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();
  if(write==='method')c.copy.setAttribute('aria-disabled','true');if(write==='reflection')c.copy.ariaDisabled='true';if(write==='prototype')Object.getPrototypeOf(c.copy).setAttribute.call(c.copy,'aria-disabled','true');e.flush();e.stop();assert.equal(c.copy.getAttribute('aria-disabled'),'true');
});

test('sender unavailable is absent after failed copy, other controls stay activatable',()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');e.run();e.click(c.copy);e.tick(500);assert.equal(c.copy.getAttribute('aria-disabled'),null);assert.equal(e.status().textContent,'');
  c.copy.setAttribute('aria-label','Copié');e.flush();let blocked=false;e.emit('window','click',{target:c.share,button:0,preventDefault(){blocked=true;},stopImmediatePropagation(){}});assert.equal(blocked,false);assert.equal(c.copy.getAttribute('aria-disabled'),'true');c.copy.setAttribute('aria-label','Copier le message');e.flush();assert.equal(c.copy.getAttribute('aria-disabled'),null);
});

for(const foreign of ['replacement hook','pending prototype write'])test('sender stop preserves '+foreign+' before observer delivery',()=>{
  const e=environment(),c=e.controls();c.copy.setAttribute('aria-label','Copier le message');e.run();e.click(c.copy);c.copy.setAttribute('aria-label','Copié');e.flush();const native=Object.getPrototypeOf(c.copy).setAttribute;
  if(foreign==='replacement hook')c.copy.setAttribute=function(...args){return native.apply(this,args);};
  native.call(c.copy,'aria-disabled','true');e.stop();assert.equal(c.copy.getAttribute('aria-disabled'),'true');assert.equal(e.timers.size,0);
});
