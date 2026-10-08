const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('extension/keep-modern-turns.js', 'utf8');
function setup({ navigation = true } = {}) {
  let nextTimer = 0;
  const timers = new Map();
  const scheduled = [];
  const context = vm.createContext({ URL,
    setTimeout(fn, delay) {
      const id = ++nextTimer;
      scheduled.push({ id, delay });
      timers.set(id, fn);
      context.expire = () => { timers.delete(id); fn(); };
      return id;
    },
    clearTimeout(id) { timers.delete(id); }
  });
  context.timers = timers;
  context.scheduled = scheduled;
  vm.runInContext(`
    function eventTarget(target) {
      const listeners = new Map();
      target.addEventListener = function(type, fn, options) {
        const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
        const current = listeners.get(type) || [];
        if (!current.some(item => item.fn === fn && item.capture === capture)) current.push({fn,capture});
        listeners.set(type,current);
      };
      target.removeEventListener = function(type, fn, options) {
        const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
        listeners.set(type,(listeners.get(type)||[]).filter(item => item.fn !== fn || item.capture !== capture));
      };
      target.emit = function(type,event={}) {
        for (const item of [...(listeners.get(type)||[])]) item.fn.call(target,event);
      };
      target.listenerCount = function(type) { return (listeners.get(type)||[]).length; };
      target.captureCount = function(type) { return (listeners.get(type)||[]).filter(item=>item.capture).length; };
      return target;
    }
    window=eventTarget(globalThis);
    location=new URL('https://chatgpt.com/settings/general');
    const rootAttributes=new Map();
    document=eventTarget({documentElement:{
      setAttribute(name,value){rootAttributes.set(name,String(value))},
      getAttribute(name){return rootAttributes.has(name)?rootAttributes.get(name):null},
      removeAttribute(name){rootAttributes.delete(name)}
    }});
    ${navigation ? 'window.navigation=eventTarget({});' : ''}
    function internalClick(href='/c/later',overrides={}) {
      const link={tagName:'A',href,target:'',download:false,
        getAttribute(name){return name==='href'?href:name==='download'?null:name==='target'?'':null},
        hasAttribute(){return false},closest(){return this}};
      const event={button:0,ctrlKey:false,metaKey:false,shiftKey:false,altKey:false,
        defaultPrevented:false,target:{closest(){return link}},
        preventDefault(){this.defaultPrevented=true},...overrides};
      document.emit('click',event);
      return event;
    }
    nativeDefine=Object.defineProperty;
    marker=Symbol.for('chatgpt-navigation-continue.retained-turns.v1');
  `, context);
  vm.runInContext(source, context);
  return context;
}
function state(c, expression) { return vm.runInContext(`window[marker]${expression ? '.' + expression : ''}`, c); }
const component = `function List(props) {
  const {retainedTurnKeys: keys, synchronousMeasurementTurnKey: synchronous,
    getPendingRestoreScrollDistanceFromBottomPx: restore, RowComponent: Row} = props;
  return props;
}`;
const install = `${component}; exports={}; Object.defineProperty(exports,'a',{enumerable:true,get:()=>List});`;
test('the verified export is wrapped and the global hook restored immediately', () => {
  const c = setup(); vm.runInContext(install, c);
  assert.equal(vm.runInContext('Object.defineProperty===nativeDefine', c), true);
  assert.equal(vm.runInContext('exports.a===List', c), false);
  assert.equal(vm.runInContext('Object.getOwnPropertyDescriptor(exports,"a").configurable', c), false);
  assert.equal(state(c, 'revision'), 2);
  assert.equal(state(c, 'status'), 'active');
  assert.equal(state(c, 'attempts'), 1);
  assert.equal(c.timers.size, 0);
  assert.equal(vm.runInContext('document.listenerCount("click")+window.listenerCount("popstate")+navigation.listenerCount("navigate")', c), 0);
});
test('all current conversation rows are retained without mutating incoming props or entries', () => {
  const c = setup(); vm.runInContext(install + `
    props={entries:[{turnKey:'one',conversationId:'chat',turn:{}},{turnKey:'two',conversationId:'chat',turn:{}}],retainedTurnKeys:['one'],RowComponent(){},onScroll(){},onKeyDown(){},style:{height:100},synchronousMeasurementTurnKey:'two',getPendingRestoreScrollDistanceFromBottomPx(){return 20}};
    result=exports.a(props);`, c);
  assert.equal(vm.runInContext('result.retainedTurnKeys.join(",")', c), 'one,two');
  assert.equal(vm.runInContext('props.retainedTurnKeys.join(",")', c), 'one');
  assert.equal(vm.runInContext('result.entries===props.entries && result.RowComponent===props.RowComponent', c), true);
  assert.equal(vm.runInContext('Object.keys(props).every(key=>key==="retainedTurnKeys" || result[key]===props[key])', c), true);
  assert.equal(state(c, 'calls'), 1);
  assert.equal(state(c, 'count'), 2);
  vm.runInContext(`next={...props,entries:[{turnKey:'new',conversationId:'other',turn:{}}],retainedTurnKeys:[]}; nextResult=exports.a(next);`, c);
  assert.equal(vm.runInContext('nextResult.retainedTurnKeys.join(",")', c), 'new');
});
test('unrelated lists, mixed conversations and empty entries pass through unchanged', () => {
  const c = setup(); vm.runInContext(install, c);
  for (const expression of [
    `({entries:[],retainedTurnKeys:[],RowComponent(){}})`,
    `({entries:[null],retainedTurnKeys:[],RowComponent(){}})`,
    `({entries:[undefined],retainedTurnKeys:[],RowComponent(){}})`,
    `({entries:[{turnKey:'one'}],retainedTurnKeys:[],RowComponent(){}})`,
    `({entries:[{turnKey:'one',conversationId:'a',turn:{}},{turnKey:'two',conversationId:'b',turn:{}}],retainedTurnKeys:[],RowComponent(){}})`
  ]) assert.equal(vm.runInContext(`props=${expression}; exports.a(props)===props`, c), true);
});
test('ordinary getters are not invoked and nonmatching exports remain native', () => {
  const c = setup();
  vm.runInContext(`called=0; target={}; Object.defineProperty(target,'a',{enumerable:true,get(){called++;return 1}}); function Other(){}; other={};Object.defineProperty(other,'a',{enumerable:true,get:()=>Other});`, c);
  assert.equal(c.called, 0);
  assert.equal(vm.runInContext('other.a===Other', c), true);
});
