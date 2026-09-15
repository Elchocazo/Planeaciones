// Test Per-Subject Consecutive Numbering
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
  body: {
    appendChild(el) {}
  },
  createElement(tag) {
    return {
      style: {},
      innerHTML: '',
      classList: { add() {}, remove() {} }
    };
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

console.log('=== STEP 1: Martes 1 de Septiembre de 2026 ===');
App.openDayPlanner('2026-09-01');
const p1 = window.Planner.currentPlan;
console.log('Martes 1 clases:', p1.classes.map(c => `${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

console.log('=== STEP 2: Miércoles 2 de Septiembre de 2026 ===');
App.openDayPlanner('2026-09-02');
const p2 = window.Planner.currentPlan;
console.log('Miércoles 2 clases:', p2.classes.map(c => `${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

const mat7Wed = p2.classes.find(c => c.subject === 'Matemáticas' && c.grade === '7°');
if (mat7Wed && mat7Wed.dayNumber === '2') {
  console.log('✅ Miércoles Matemáticas 7° is correctly Clase #2!');
} else {
  console.error('❌ Expected Miércoles Matemáticas 7° to be Clase #2, got:', mat7Wed?.dayNumber);
  process.exit(1);
}

console.log('=== STEP 3: Jueves 3 de Septiembre de 2026 ===');
App.openDayPlanner('2026-09-03');
const p3 = window.Planner.currentPlan;
console.log('Jueves 3 clases:', p3.classes.map(c => `${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

const sis6Thu = p3.classes.find(c => c.subject === 'Sistemas' && c.grade === '6°');
if (sis6Thu && sis6Thu.dayNumber === '2') {
  console.log('✅ Jueves Sistemas 6° is correctly Clase #2 (since it was taught Tuesday)!');
} else {
  console.error('❌ Expected Jueves Sistemas 6° to be Clase #2, got:', sis6Thu?.dayNumber);
  process.exit(1);
}

console.log('=== STEP 4: Viernes 4 de Septiembre de 2026 ===');
App.openDayPlanner('2026-09-04');
const p4 = window.Planner.currentPlan;
console.log('Viernes 4 clases:', p4.classes.map(c => `${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

const mat7Fri = p4.classes.find(c => c.subject === 'Matemáticas' && c.grade === '7°');
if (mat7Fri && mat7Fri.dayNumber === '3') {
  console.log('✅ Viernes Matemáticas 7° is correctly Clase #3 (taught Tuesday #1, Wednesday #2)!');
} else {
  console.error('❌ Expected Viernes Matemáticas 7° to be Clase #3, got:', mat7Fri?.dayNumber);
  process.exit(1);
}

console.log('=== STEP 5: Lunes 7 de Septiembre de 2026 ===');
App.openDayPlanner('2026-09-07');
const p5 = window.Planner.currentPlan;
console.log('Lunes 7 clases:', p5.classes.map(c => `${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

const mat7Mon = p5.classes.find(c => c.subject === 'Matemáticas' && c.grade === '7°');
const mat2Mon = p5.classes.find(c => c.subject === 'Matemáticas' && c.grade === '2°');
const rob9Mon = p5.classes.find(c => c.subject === 'Robótica' && c.grade === '9°');

if (mat7Mon && mat7Mon.dayNumber === '4') {
  console.log('✅ Lunes Matemáticas 7° is correctly Clase #4!');
} else {
  console.error('❌ Expected Lunes Matemáticas 7° to be Clase #4, got:', mat7Mon?.dayNumber);
  process.exit(1);
}

if (mat2Mon && mat2Mon.dayNumber === '2') {
  console.log('✅ Lunes Matemáticas 2° is correctly Clase #2 (first taught Thursday)!');
} else {
  console.error('❌ Expected Lunes Matemáticas 2° to be Clase #2, got:', mat2Mon?.dayNumber);
  process.exit(1);
}

if (rob9Mon && rob9Mon.dayNumber === '1') {
  console.log('✅ Lunes Robótica 9° is correctly Clase #1!');
} else {
  console.error('❌ Expected Lunes Robótica 9° to be Clase #1, got:', rob9Mon?.dayNumber);
  process.exit(1);
}

console.log('=== ALL PER-SUBJECT CONSECUTIVE TESTS PASSED 100% PERFECTLY! ===');
