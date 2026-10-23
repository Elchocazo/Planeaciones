/**
 * Comprehensive Test: Thursday 15 Classes Flow, Seed Incorporation, and Auto-Healing
 */
const fs = require('fs');
const assert = require('assert');

console.log('--- TEST: THURSDAY 15 CLASSES FLOW & AUTO-HEALING ---');

let initialDataContent = fs.readFileSync('js/data/initial-classes-data.js', 'utf8');
initialDataContent = initialDataContent.replace('const INITIAL_CLASSES_DATA =', 'global.INITIAL_CLASSES_DATA =');
eval(initialDataContent);

const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
const listeners = {};
global.window = {
  INITIAL_CLASSES_DATA: global.INITIAL_CLASSES_DATA,
  addEventListener: (evt, fn) => {
    if (!listeners[evt]) listeners[evt] = [];
    listeners[evt].push(fn);
  },
  dispatchEvent: (evt) => {
    if (listeners[evt.type]) {
      listeners[evt.type].forEach(fn => fn(evt));
    }
  }
};
global.CustomEvent = class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } };
global.document = {
  getElementById: (id) => ({
    offsetParent: {},
    innerHTML: '',
    appendChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
  })
};

// Load modules
eval(fs.readFileSync('js/core/app-state.js', 'utf8'));
eval(fs.readFileSync('js/storage.js', 'utf8'));
eval(fs.readFileSync('js/repositories/schedule-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/class-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/sequence-repository.js', 'utf8'));
eval(fs.readFileSync('js/services/sequence-service.js', 'utf8'));
eval(fs.readFileSync('js/services/schedule-service.js', 'utf8'));
eval(fs.readFileSync('js/calendar.js', 'utf8'));
eval(fs.readFileSync('js/ui/dashboard-view.js', 'utf8'));

const AppState = window.AppState;
const ScheduleRepository = window.ScheduleRepository;
const ClassRepository = window.ClassRepository;
const ScheduleService = window.ScheduleService;
const CalendarComponent = window.CalendarComponent;
const DashboardView = window.DashboardView;
global.SequenceService = window.SequenceService;
global.ScheduleService = window.ScheduleService;
global.ClassRepository = window.ClassRepository;

AppState.set('currentUser', { id: 'usr_manuel', name: 'Manuel' });

// 1. Check Thursday 15 DayView directly
console.log('\n[TEST 1] ScheduleService.buildDayView for 2026-10-15:');
const dayView = ScheduleService.buildDayView('2026-10-15', 'usr_manuel');
assert(dayView, 'DayView must exist');
console.log(`Total items on Thursday 15: ${dayView.scheduledItems.length}`);
dayView.scheduledItems.forEach(item => {
  const s = item.slot;
  const c = item.classSession;
  console.log(`  [${s.time}] ${s.subjectName || s.subject} ${s.gradeName || s.grade} -> isPlanned: ${item.isPlanned}, isPending: ${item.isPending}, Matched: ${c ? c.id + ' (Seq #' + c.sequenceNumber + '): ' + (c.topic || '').slice(0, 35) + '...' : 'NONE'}`);
});

// Verify Matemáticas 2° Clase #9 (cls_20261015_mat2_9)
const mat2Item = dayView.scheduledItems.find(i => (i.slot.subjectName === 'Matemáticas' || i.slot.subject === 'Matemáticas') && (i.slot.gradeName === '2°' || i.slot.grade === '2'));
assert(mat2Item, 'Matemáticas 2° slot must exist on Thursday');
assert.strictEqual(mat2Item.isPlanned, true, 'Matemáticas 2° must be planned');
assert.strictEqual(mat2Item.classSession.sequenceNumber, 9, 'Matemáticas 2° must be Clase #9 (cls_20261015_mat2_9)');

// Verify Sistemas 4°B Clase #5 (starts 2026-09-07)
const sis4bItem = dayView.scheduledItems.find(i => (i.slot.subjectName === 'Sistemas' || i.slot.subject === 'Sistemas') && (i.slot.gradeName === '4°B' || i.slot.grade === '4B'));
assert(sis4bItem, 'Sistemas 4°B slot must exist on Thursday');
assert.strictEqual(sis4bItem.isPlanned, true, 'Sistemas 4°B must be planned');
assert.strictEqual(sis4bItem.classSession.sequenceNumber, 5, 'Sistemas 4°B must be Clase #5');

// Verify Sistemas 1° Clase #5 (starts 2026-09-07)
const sis1Item = dayView.scheduledItems.find(i => (i.slot.subjectName === 'Sistemas' || i.slot.subject === 'Sistemas') && (i.slot.gradeName === '1°' || i.slot.grade === '1'));
assert(sis1Item, 'Sistemas 1° slot must exist on Thursday');
assert.strictEqual(sis1Item.isPlanned, true, 'Sistemas 1° must be planned');
assert.strictEqual(sis1Item.classSession.sequenceNumber, 5, 'Sistemas 1° must be Clase #5');

console.log('✓ TEST 1 PASSED: All 3 planned classes for Thursday 15 appear verified!');

// 2. Test auto-healing of a class saved with date 2026-10-14
console.log('\n[TEST 2] Auto-healing of misaligned dates:');
const misalignedClass = {
  id: 'custom_sis6_user_created',
  teacherId: 'usr_manuel',
  date: '2026-10-14', // Saved accidentally on Wed 14
  sequenceNumber: 5,
  subject: 'Sistemas',
  grade: '6°',
  group: '6°',
  title: 'Tablas en Word',
  topic: 'Diseño avanzado de tablas',
  pedagogy: { inicio: 'Activación con juego de roles', desarrollo: 'Diseño en computador', cierre: 'Socialización' },
  status: 'planned'
};
ClassRepository.saveClass(misalignedClass, 'usr_manuel');

// Regla 14: buildDayView es de estricta lectura. NUNCA debe alterar la fecha de clases de otros días.
const dayViewWithHeal = ScheduleService.buildDayView('2026-10-15', 'usr_manuel');
const sis6Item = dayViewWithHeal.scheduledItems.find(i => (i.slot.gradeName === '6°' || i.slot.grade === '6'));
assert(sis6Item, 'Sistemas 6° slot must exist');
assert.strictEqual(sis6Item.isPlanned, false, 'Sistemas 6° slot is pending because class is on 2026-10-14');
const savedSis6 = ClassRepository.getClass('custom_sis6_user_created', 'usr_manuel');
assert.strictEqual(savedSis6.date, '2026-10-14', 'Class on 2026-10-14 must retain its date inalterable (0 auto-rescate de fechas)');
console.log('✓ TEST 2 PASSED: buildDayView preserves strict date immutability (Rule 14)!');

// 3. Test Calendar month initialization
console.log('\n[TEST 3] Calendar month initialization:');
const cal = new CalendarComponent('test-mount');
console.log(`Calendar initialized to year: ${cal.selectedYear}, month: ${cal.selectedMonth} (${cal.monthNames[cal.selectedMonth]})`);
assert.strictEqual(cal.selectedMonth, 9, 'Calendar must open in October (month index 9)');
console.log('✓ TEST 3 PASSED: Calendar opens in October 2026!');

// 4. Test DashboardView date persistence
console.log('\n[TEST 4] DashboardView date persistence:');
DashboardView.setDate('2026-10-15');
assert.strictEqual(DashboardView.selectedDate, '2026-10-15', 'selectedDate must be 2026-10-15');
assert.strictEqual(store['school_active_dashboard_date'], '2026-10-15', 'Must persist in localStorage');

// Simulate fresh instance of DashboardView
const newDash = new (DashboardView.constructor)();
newDash.render();
assert.strictEqual(newDash.selectedDate, '2026-10-15', 'Must restore persisted 2026-10-15 date on reload');
console.log('✓ TEST 4 PASSED: DashboardView maintains 2026-10-15 across page reloads!');

console.log('\n========================================');
console.log('ALL THURSDAY 15 TESTS PASSED SUCCESSFULLY! (100%)');
console.log('========================================');
