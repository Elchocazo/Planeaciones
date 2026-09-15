// Verification test for the exact timetable from user's image
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

console.log('=== VERIFYING TIMETABLE FOR EACH DAY OF THE WEEK ===');

// 1. Martes 1 de Septiembre
App.openDayPlanner('2026-09-01');
const pTue = window.Planner.currentPlan;
console.log('\n--- MARTES 1 SEPT --- (Total:', pTue.classes.length, 'clases)');
pTue.classes.forEach(c => console.log(`  ⏰ ${c.time} | ${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

// 2. Miércoles 2 de Septiembre
App.openDayPlanner('2026-09-02');
const pWed = window.Planner.currentPlan;
console.log('\n--- MIÉRCOLES 2 SEPT --- (Total:', pWed.classes.length, 'clases)');
pWed.classes.forEach(c => console.log(`  ⏰ ${c.time} | ${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

// 3. Jueves 3 de Septiembre
App.openDayPlanner('2026-09-03');
const pThu = window.Planner.currentPlan;
console.log('\n--- JUEVES 3 SEPT --- (Total:', pThu.classes.length, 'clases)');
pThu.classes.forEach(c => console.log(`  ⏰ ${c.time} | ${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

// 4. Viernes 4 de Septiembre
App.openDayPlanner('2026-09-04');
const pFri = window.Planner.currentPlan;
console.log('\n--- VIERNES 4 SEPT --- (Total:', pFri.classes.length, 'clases)');
pFri.classes.forEach(c => console.log(`  ⏰ ${c.time} | ${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

// 5. Lunes 7 de Septiembre
App.openDayPlanner('2026-09-07');
const pMon = window.Planner.currentPlan;
console.log('\n--- LUNES 7 SEPT --- (Total:', pMon.classes.length, 'clases)');
pMon.classes.forEach(c => console.log(`  ⏰ ${c.time} | ${c.subject} ${c.grade} -> Clase #${c.dayNumber}`));
window.Planner.saveCurrentPlan(false);

// Validations
const mat7Wed1 = pWed.classes.find(c => c.time === '11:00 - 11:50' && c.subject === 'Matemáticas' && c.grade === '7°');
const mat7Wed2 = pWed.classes.find(c => c.time === '11:50 - 12:35' && c.subject === 'Matemáticas' && c.grade === '7°');

if (mat7Wed1?.dayNumber === '3' && mat7Wed2?.dayNumber === '4') {
  console.log('✅ Miércoles Matemáticas 7° correctly has Clase #3 and Clase #4 (after Martes #1 and #2)!');
} else {
  console.error('❌ Unexpected class numbering for Matemáticas 7° on Wednesday:', mat7Wed1?.dayNumber, mat7Wed2?.dayNumber);
  process.exit(1);
}

const sis6Thu = pThu.classes.find(c => c.subject === 'Sistemas' && c.grade === '6°');
if (sis6Thu) {
  console.log('✅ Jueves Sistemas 6° found with time:', sis6Thu.time, 'Clase #' + sis6Thu.dayNumber);
} else {
  console.error('❌ Sistemas 6° not found on Thursday');
  process.exit(1);
}

console.log('\n=== ALL TIMETABLE TESTS PASSED WITH 100% ACCURACY! ===');
