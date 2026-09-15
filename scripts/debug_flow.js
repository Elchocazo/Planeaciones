global.window = global;
global.window.scrollTo = function() {};
global.document = {
  addEventListener(event, fn) {},
  getElementById(id) {
    console.log('[DEBUG] getElementById called with:', id);
    return {
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      addEventListener(event, fn) {},
      classList: { add() {}, remove() {}, toggle() {} },
      querySelectorAll() { return []; },
      querySelector() { return null; }
    };
  },
  querySelectorAll() { return []; },
  scrollTo() {}
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; }
};

try {
  require('../js/storage.js');
  console.log('[DEBUG] storage.js loaded');
  require('../js/export.js');
  console.log('[DEBUG] export.js loaded');
  require('../js/curriculum.js');
  console.log('[DEBUG] curriculum.js loaded');
  require('../js/calendar.js');
  console.log('[DEBUG] calendar.js loaded');
  require('../js/planner.js');
  console.log('[DEBUG] planner.js loaded');
  require('../js/app.js');
  console.log('[DEBUG] app.js loaded');

  console.log('--- Initializing App ---');
  App.init();

  console.log('--- Opening Day Planner for 2026-09-01 ---');
  App.openDayPlanner('2026-09-01');

  console.log('--- SUCCESS! NO RUNTIME CRASH ---');
} catch (e) {
  console.error('[CRASH OCCURRED]:', e);
}
