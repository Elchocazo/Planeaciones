// Debug HTML generation
global.window = global;
global.window.scrollTo = function() {};

let mountedPlannerHtml = '';

global.document = {
  addEventListener(event, fn) {},
  getElementById(id) {
    if (id === 'planner-mount-point') {
      return {
        style: {},
        get innerHTML() { return mountedPlannerHtml; },
        set innerHTML(val) { mountedPlannerHtml = val; },
        textContent: '',
        value: '',
        addEventListener() {},
        classList: { add() {}, remove() {}, toggle() {} },
        querySelectorAll() { return []; },
        querySelector() { return null; }
      };
    }
    return {
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      addEventListener() {},
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

require('../js/storage.js');
require('../js/export.js');
require('../js/curriculum.js');
require('../js/calendar.js');
require('../js/planner.js');
require('../js/app.js');

App.init();
App.openDayPlanner('2026-09-01');

console.log('--- MOUNTED PLANNER HTML LENGTH:', mountedPlannerHtml.length);
console.log('--- PREVIEW OF MOUNTED HTML (first 500 chars):');
console.log(mountedPlannerHtml.substring(0, 500));
