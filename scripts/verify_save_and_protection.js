// Verification Script for Data Protection & Immediate Auto-Save
global.window = global;
global.window.addEventListener = () => {};
global.window.scrollTo = () => {};
global.confirm = () => true;
global.alert = () => {};

let store = {};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; },
  removeItem(k) { delete this.store[k]; }
};
global.sessionStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; },
  removeItem(k) { delete this.store[k]; }
};

let mountedHtml = '';
global.document = {
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

App.init();

console.log('================================================================');
console.log('TEST 1: Verify loadDate does NOT overwrite custom DBA, Topic, Sequence');
console.log('================================================================');

const testDate = '2026-09-09'; // Miércoles
const customPlan = {
  date: testDate,
  period: '1°',
  classes: [
    {
      dayNumber: '2',
      dayOfWeek: 'Jueves', // Different day label as in user screenshot
      subject: 'Matemáticas',
      grade: '2°',
      dba: 'Texto propio de DBA pegado por el docente sin viñetas especiales',
      achievement: 'Logro e indicador personalizado escrito por el profesor',
      topic: 'Mi tema personalizado de matemáticas',
      description: 'Clase: Clase #2\n\nTiempo: 2 horas de clase (120 minutos)\n\nInicio: Actividad personalizada.',
      observations: 'Observaciones escritas a mano por el docente',
      notebookContent: 'Contenido extenso de cuaderno',
      attachments: []
    }
  ]
};

StorageService.savePlan(testDate, customPlan);
window.Planner.loadDate(testDate);

const loadedClass = window.Planner.currentPlan.classes[0];
console.log('Loaded DBA:', loadedClass.dba);
console.log('Loaded Topic:', loadedClass.topic);
console.log('Loaded Sequence:', loadedClass.description.slice(0, 40) + '...');

if (loadedClass.dba !== customPlan.classes[0].dba) {
  console.error('❌ FAILURE: DBA was overwritten!');
  process.exit(1);
}
if (loadedClass.topic !== customPlan.classes[0].topic) {
  console.error('❌ FAILURE: Topic was overwritten!');
  process.exit(1);
}
if (loadedClass.description !== customPlan.classes[0].description) {
  console.error('❌ FAILURE: Description was overwritten!');
  process.exit(1);
}
console.log('✅ PASS: loadDate preserves 100% of user-written DBA, Topic and Sequence!');

console.log('\n================================================================');
console.log('TEST 2: Verify fixDayLabelOnly() preserves all classes & updates day');
console.log('================================================================');

window.Planner.fixDayLabelOnly();
const fixedClass = window.Planner.currentPlan.classes[0];
console.log('Updated dayOfWeek:', fixedClass.dayOfWeek);
console.log('Preserved DBA:', fixedClass.dba);
console.log('Preserved Topic:', fixedClass.topic);

if (fixedClass.dayOfWeek !== 'Miércoles') {
  console.error('❌ FAILURE: dayOfWeek was not updated to Miércoles!');
  process.exit(1);
}
if (fixedClass.topic !== customPlan.classes[0].topic || fixedClass.dba !== customPlan.classes[0].dba) {
  console.error('❌ FAILURE: Class content was modified during day adjustment!');
  process.exit(1);
}
console.log('✅ PASS: fixDayLabelOnly updated dayOfWeek while keeping content 100% intact!');

console.log('\n================================================================');
console.log('TEST 3: Verify applyOfficialSchedule() SMART MERGE protects written content');
console.log('================================================================');

// Ensure user has Wednesday weekly schedule with Matemáticas 2° or other classes
const prof = StorageService.getProfile();
prof.weeklySchedule = prof.weeklySchedule || {};
prof.weeklySchedule["3"] = [
  { time: "7:00 - 8:40", subject: "Matemáticas", grade: "2°" },
  { time: "8:40 - 9:30", subject: "Sistemas", grade: "3°" }
];
StorageService.saveProfile(prof);

window.Planner.applyOfficialSchedule();

const mergedMatClass = window.Planner.currentPlan.classes.find(c => c.subject === 'Matemáticas' && c.grade === '2°');
console.log('After smart merge, Matemáticas 2° found:', !!mergedMatClass);
console.log('Merged DBA:', mergedMatClass?.dba);
console.log('Merged Topic:', mergedMatClass?.topic);
console.log('Merged Description:', mergedMatClass?.description?.slice(0, 40) + '...');
console.log('Merged Observations:', mergedMatClass?.observations);

if (!mergedMatClass) {
  console.error('❌ FAILURE: Matemáticas 2° missing after applyOfficialSchedule!');
  process.exit(1);
}
if (mergedMatClass.dba !== customPlan.classes[0].dba) {
  console.error('❌ FAILURE: Written DBA was wiped during applyOfficialSchedule!');
  process.exit(1);
}
if (mergedMatClass.topic !== customPlan.classes[0].topic) {
  console.error('❌ FAILURE: Written Topic was wiped during applyOfficialSchedule!');
  process.exit(1);
}
if (mergedMatClass.description !== customPlan.classes[0].description) {
  console.error('❌ FAILURE: Written Sequence was wiped during applyOfficialSchedule!');
  process.exit(1);
}
console.log('✅ PASS: Smart merge preserved 100% of teacher-written work for matching classes!');

console.log('\n================================================================');
console.log('TEST 4: Verify undoLastScheduleAction() restores previous state');
console.log('================================================================');

window.Planner.undoLastScheduleAction();
console.log('Restored classes count:', window.Planner.currentPlan.classes.length);
console.log('Restored dayOfWeek of class 0:', window.Planner.currentPlan.classes[0].dayOfWeek);
console.log('Restored DBA:', window.Planner.currentPlan.classes[0].dba);

if (window.Planner.currentPlan.classes[0].dba !== customPlan.classes[0].dba) {
  console.error('❌ FAILURE: Undo did not restore original DBA!');
  process.exit(1);
}
console.log('✅ PASS: Undo successfully recovered previous plan!');

console.log('\n================================================================');
console.log('TEST 5: Verify immediate save on input / paste');
console.log('================================================================');

window.Planner.currentPlan.classes[0].topic = 'Tema recién pegado por el usuario';
window.Planner.currentPlan.classes[0].description = 'Secuencia pegada con Ctrl+V';
window.Planner.handleInputChange(true); // immediate

const savedImmediately = StorageService.getPlanByDate(testDate);
console.log('Immediately saved topic:', savedImmediately.classes[0].topic);
console.log('Immediately saved description:', savedImmediately.classes[0].description);

if (savedImmediately.classes[0].topic !== 'Tema recién pegado por el usuario') {
  console.error('❌ FAILURE: Immediate save did not persist topic!');
  process.exit(1);
}
if (savedImmediately.classes[0].description !== 'Secuencia pegada con Ctrl+V') {
  console.error('❌ FAILURE: Immediate save did not persist description!');
  process.exit(1);
}
console.log('✅ PASS: Immediate save persisted edited/pasted content instantly!');

console.log('\n================================================================');
console.log('🎉 ALL 5 VERIFICATION TESTS PASSED 100% SUCCESSFULLY!');
console.log('================================================================');
