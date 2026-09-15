// Test First Period (1° Periodo) as Default
global.window = global;
global.window.scrollTo = function() {};
global.confirm = () => true;
global.alert = () => {};

let mountedHtml = '';

global.document = {
  addEventListener(event, fn) {},
  getElementById(id) {
    return {
      style: {},
      get innerHTML() { return mountedHtml; },
      set innerHTML(val) { mountedHtml = val; },
      textContent: '',
      value: '',
      addEventListener() {},
      appendChild() {},
      removeChild() {},
      classList: { add() {}, remove() {}, toggle() {} },
      querySelectorAll() { return []; },
      querySelector() { return null; }
    };
  },
  body: { appendChild(el) {} },
  createElement(tag) {
    return { style: {}, innerHTML: '', classList: { add() {}, remove() {} } };
  },
  querySelectorAll() { return []; }
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; }
};

require('../js/users-service.js');
require('../js/storage.js');
require('../js/docx-generator.js');
require('../js/curriculum.js');
require('../js/holidays.js');
require('../js/export.js');
require('../js/notebook-editor.js');
require('../js/coordinator-view.js');
require('../js/calendar.js');
require('../js/planner.js');
require('../js/app.js');

App.init();
UserService.setCurrentUser('usr_manuel');

console.log('=== TEST 1: Profile Default Period ===');
const profile = StorageService.getProfile();
console.log('Profile period is:', profile.period);
if (profile.period === '1°') {
  console.log('✅ Profile period is 1° Periodo!');
} else {
  console.error('❌ Expected 1°, got:', profile.period);
  process.exit(1);
}

console.log('=== TEST 2: Planner Day Initial Period ===');
App.openDayPlanner('2026-09-01');
const plan = window.Planner.currentPlan;
console.log('Planner day period is:', plan.period);
if (plan.period === '1°') {
  console.log('✅ Planner opened with 1° Periodo!');
} else {
  console.error('❌ Expected 1°, got:', plan.period);
  process.exit(1);
}

console.log('=== TEST 3: Curriculum Items in 1° Periodo ===');
const curItems = CurriculumService.getItems('1°', 'Matemáticas', '7°');
console.log('Curriculum items for 1° Periodo Matemáticas 7°:', curItems.map(i => i.topic));
if (curItems.length > 0) {
  console.log('✅ 1° Periodo has loaded curriculum items!');
} else {
  console.error('❌ 1° Periodo has no curriculum items');
  process.exit(1);
}

console.log('=== TEST 4: Export Format Period ===');
const htmlSheet = ExportService.generateHtmlSheet(plan, profile);
if (htmlSheet.includes('PERIODO: 1°') || htmlSheet.includes('1°')) {
  console.log('✅ Export sheet displays 1° Periodo!');
} else {
  console.error('❌ Missing 1° Period in export sheet');
  process.exit(1);
}

console.log('=== ALL FIRST PERIOD (1°) TESTS PASSED 100% SUCCESSFULLY! ===');
