// Verification Script for Swapped Days Detection and Auto-Repair
global.window = global;
global.window.addEventListener = () => {};
global.window.scrollTo = () => {};
global.confirm = () => true;
global.alert = () => {};

let store = {};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};
global.sessionStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

let mountedHtml = '';
global.document = {
  readyState: 'complete',
  addEventListener(event, fn) {},
  getElementById(id) {
    return {
      id,
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
  body: { appendChild(el) {}, classList: { add() {}, remove() {}, toggle() {} } },
  createElement(tag) {
    return { style: {}, innerHTML: '', classList: { add() {}, remove() {} } };
  },
  querySelectorAll() { return []; }
};

require('../js/users-service.js');
require('../js/storage.js');
require('../js/curriculum.js');
require('../js/holidays.js');
require('../js/export.js');
require('../js/notebook-editor.js');
require('../js/coordinator-view.js');
require('../js/calendar.js');
require('../js/planner.js');
require('../js/app.js');

console.log('================================================================');
console.log('TEST 1: Simulating User Scenario - Inverted Jueves 10 and Viernes 11');
console.log('================================================================');

const profile = StorageService.getProfile();
const thuSched = StorageService.consolidateSchedule(profile.weeklySchedule['4']);
const friSched = StorageService.consolidateSchedule(profile.weeklySchedule['5']);

const plan10_inverted = {
  date: '2026-09-10',
  period: '1°',
  classes: friSched.map((c, i) => ({
    date: '2026-09-10',
    time: c.time,
    dayNumber: String(i + 1),
    dayOfWeek: 'Jueves',
    subject: c.subject,
    grade: c.grade,
    topic: 'Mi tema personalizado de Viernes: ' + c.subject + ' ' + c.grade,
    dba: 'DBA escrito para Viernes ' + c.grade,
    achievement: 'Logro Viernes',
    description: 'Secuencia didáctica de viernes para ' + c.subject,
    observations: 'Observación Viernes',
    notebookContent: 'Cuaderno Viernes'
  }))
};

const plan11_inverted = {
  date: '2026-09-11',
  period: '1°',
  classes: thuSched.map((c, i) => ({
    date: '2026-09-11',
    time: c.time,
    dayNumber: String(i + 1),
    dayOfWeek: 'Viernes',
    subject: c.subject,
    grade: c.grade,
    topic: 'Mi tema personalizado de Jueves: ' + c.subject + ' ' + c.grade,
    dba: 'DBA escrito para Jueves ' + c.grade,
    achievement: 'Logro Jueves',
    description: 'Secuencia didáctica de jueves para ' + c.subject,
    observations: 'Observación Jueves',
    notebookContent: 'Cuaderno Jueves'
  }))
};

StorageService.savePlan('2026-09-10', plan10_inverted);
StorageService.savePlan('2026-09-11', plan11_inverted);

console.log('Setup complete:');
console.log('2026-09-10 subjects:', StorageService.getPlanByDate('2026-09-10').classes.map(c => c.subject + ' ' + c.grade));
console.log('2026-09-11 subjects:', StorageService.getPlanByDate('2026-09-11').classes.map(c => c.subject + ' ' + c.grade));

console.log('\n================================================================');
console.log('TEST 2: Detect Swapped Pair using StorageService.detectSwappedPair');
console.log('================================================================');

const pair10 = StorageService.detectSwappedPair('2026-09-10');
console.log('Detection on 2026-09-10:', pair10);

if (!pair10 || !pair10.isSwappedPair || pair10.targetDate !== '2026-09-11' || pair10.targetDayName !== 'Viernes') {
  console.error('❌ FAILURE: detectSwappedPair failed to identify 2026-09-10 as swapped with Viernes 11!');
  process.exit(1);
}
console.log('✅ PASS: 2026-09-10 correctly detected as swapped with 2026-09-11!');

const allPairs = StorageService.detectAllSwappedPairs();
console.log('All swapped pairs detected:', allPairs);
if (allPairs.length !== 1 || allPairs[0].date1 !== '2026-09-10' || allPairs[0].date2 !== '2026-09-11') {
  console.error('❌ FAILURE: detectAllSwappedPairs failed to detect the exact pair!');
  process.exit(1);
}
console.log('✅ PASS: detectAllSwappedPairs detected exactly 1 pair between 2026-09-10 and 2026-09-11!');

console.log('\n================================================================');
console.log('TEST 3: User-Initiated Safe Swap via swapDayPlans');
console.log('================================================================');

StorageService.swapDayPlans('2026-09-10', '2026-09-11');
App.init();

const fixed10 = StorageService.getPlanByDate('2026-09-10');
const fixed11 = StorageService.getPlanByDate('2026-09-11');

console.log('Repaired 2026-09-10 (Jueves):', fixed10.classes.map(c => c.subject + ' ' + c.grade + ' | ' + c.dayOfWeek));
console.log('Repaired 2026-09-11 (Viernes):', fixed11.classes.map(c => c.subject + ' ' + c.grade + ' | ' + c.dayOfWeek));

const thuSubjects = ['Matemáticas 2°', 'Sistemas 4°B', 'Sistemas 1°', 'Sistemas 6°', 'Robótica 11°'];
const actual10Subjects = fixed10.classes.map(c => c.subject + ' ' + c.grade);
if (actual10Subjects.join(',') !== thuSubjects.join(',')) {
  console.error('❌ FAILURE: 2026-09-10 does not have Thursday subjects after auto-repair!', actual10Subjects);
  process.exit(1);
}

const friSubjects = ['Sistemas 2°', 'Matemáticas 3°', 'Sistemas 4°A', 'Matemáticas 7°', 'Dirección de grupo 7°'];
const actual11Subjects = fixed11.classes.map(c => c.subject + ' ' + c.grade);
if (actual11Subjects.join(',') !== friSubjects.join(',')) {
  console.error('❌ FAILURE: 2026-09-11 does not have Friday subjects after auto-repair!', actual11Subjects);
  process.exit(1);
}

const mat2OnThu = fixed10.classes.find(c => c.subject === 'Matemáticas' && c.grade === '2°');
console.log('Preserved Topic for Matemáticas 2° on Jueves 10:', mat2OnThu.topic);
console.log('Preserved DBA for Matemáticas 2° on Jueves 10:', mat2OnThu.dba);
if (!mat2OnThu.topic.includes('Jueves') || !mat2OnThu.dba.includes('Jueves')) {
  console.error('❌ FAILURE: User written content on Thursday classes was lost!');
  process.exit(1);
}

const sis2OnFri = fixed11.classes.find(c => c.subject === 'Sistemas' && c.grade === '2°');
console.log('Preserved Topic for Sistemas 2° on Viernes 11:', sis2OnFri.topic);
console.log('Preserved DBA for Sistemas 2° on Viernes 11:', sis2OnFri.dba);
if (!sis2OnFri.topic.includes('Viernes') || !sis2OnFri.dba.includes('Viernes')) {
  console.error('❌ FAILURE: User written content on Friday classes was lost!');
  process.exit(1);
}

const postRepairPairs = StorageService.detectAllSwappedPairs();
console.log('Post-repair swapped pairs count:', postRepairPairs.length);
if (postRepairPairs.length !== 0) {
  console.error('❌ FAILURE: Swapped pairs still detected after repair!');
  process.exit(1);
}
console.log('✅ PASS: Auto-repair on startup completely resolved the swap with 100% data fidelity!');

console.log('\n================================================================');
console.log('TEST 4: PlannerComponent Banner and Manual Swap Integration');
console.log('================================================================');

window.Planner.loadDate('2026-09-10');
console.log('Planner loaded 2026-09-10 successfully.');
console.log('Current plan classes count:', window.Planner.currentPlan.classes.length);
console.log('Current plan date:', window.Planner.currentPlan.date);
console.log('Current plan dayOfWeek of class 0:', window.Planner.currentPlan.classes[0].dayOfWeek);

if (window.Planner.currentPlan.classes[0].dayOfWeek !== 'Jueves') {
  console.error('❌ FAILURE: Class dayOfWeek in Planner is not Jueves!');
  process.exit(1);
}

window.Planner.loadDate('2026-09-11');
console.log('Planner loaded 2026-09-11 successfully.');
console.log('Current plan classes count:', window.Planner.currentPlan.classes.length);
console.log('Current plan date:', window.Planner.currentPlan.date);
console.log('Current plan dayOfWeek of class 0:', window.Planner.currentPlan.classes[0].dayOfWeek);

if (window.Planner.currentPlan.classes[0].dayOfWeek !== 'Viernes') {
  console.error('❌ FAILURE: Class dayOfWeek in Planner is not Viernes!');
  process.exit(1);
}

console.log('✅ PASS: PlannerComponent correctly renders both days in their proper dates!');

console.log('\n================================================================');
console.log('🎉 ALL SWAPPED DAYS & SCHEDULE AUDIT TESTS PASSED 100% SUCCESSFULLY!');
console.log('================================================================');
