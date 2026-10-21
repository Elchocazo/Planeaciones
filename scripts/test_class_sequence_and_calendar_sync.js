const fs = require('fs');
const assert = require('assert');

console.log('--- TEST: CLASS SEQUENCE AND CALENDAR SYNCHRONIZATION ---');

// 1. Setup environment and mock browser globals
let initialDataContent = fs.readFileSync('js/data/initial-classes-data.js', 'utf8');
initialDataContent = initialDataContent.replace('const INITIAL_CLASSES_DATA =', 'global.INITIAL_CLASSES_DATA =');
eval(initialDataContent);

const storageStore = {};
global.localStorage = {
  getItem: (k) => storageStore[k] || null,
  setItem: (k, v) => { storageStore[k] = String(v); },
  removeItem: (k) => { delete storageStore[k]; }
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
global.CustomEvent = class {
  constructor(type, detail) {
    this.type = type;
    this.detail = detail;
  }
};

global.document = {
  getElementById: (id) => ({
    offsetParent: {},
    innerHTML: '',
    appendChild: () => {}
  })
};

// Load codebases
eval(fs.readFileSync('js/storage.js', 'utf8'));
eval(fs.readFileSync('js/repositories/schedule-repository.js', 'utf8'));
eval(fs.readFileSync('js/plan-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/class-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/sequence-repository.js', 'utf8'));
eval(fs.readFileSync('js/calendar.js', 'utf8'));
eval(fs.readFileSync('js/services/sequence-service.js', 'utf8'));
eval(fs.readFileSync('js/ui/sequence-view.js', 'utf8'));

global.ClassRepository = window.ClassRepository;
global.ScheduleRepository = window.ScheduleRepository;
global.PlanRepository = window.PlanRepository;
global.SequenceRepository = window.SequenceRepository;
global.CalendarComponent = window.CalendarComponent;
global.SequenceView = window.SequenceView;
global.StorageService = window.StorageService;

const repo = window.ClassRepository;
const planRepo = window.PlanRepository;
const schedRepo = window.ScheduleRepository;

// TEST 1: Consecutivity and sequence number safety
console.log('\n[TEST 1] Consecutivity determination and anti-16 fix:');

const seqEmpty = repo.getNextSequenceNumber({});
console.log('Empty scope getNextSequenceNumber ->', seqEmpty);
assert.strictEqual(seqEmpty, 1, 'Empty scope must return 1, never global max 16');

const seqSisObj = repo.getNextSequenceNumber({ period: '1°', subject: 'Sistemas', grade: '1°', group: '1°' });
console.log('Sistemas 1° (object) ->', seqSisObj);
assert.strictEqual(seqSisObj, 6, 'Sistemas 1° should be next sequence #6 (since #1..#5 exist in seed)');

const seqSisNoGroup = repo.getNextSequenceNumber({ period: '1°', subject: 'Sistemas', grade: '1°' });
console.log('Sistemas 1° (no group) ->', seqSisNoGroup);
assert.strictEqual(seqSisNoGroup, 6, 'Sistemas 1° without group should be next sequence #6');

const seqSisGradeNumber = repo.getNextSequenceNumber({ period: '1°', subject: 'Sistemas', grade: '1' });
console.log('Sistemas 1 (grade as "1") ->', seqSisGradeNumber);
assert.strictEqual(seqSisGradeNumber, 6, 'Sistemas 1 with grade as "1" should match 1° and be sequence #6');

const seqSisPositional = repo.getNextSequenceNumber('1°', 'Sistemas', '1°');
console.log('Sistemas 1° (positional "1°", "Sistemas", "1°") ->', seqSisPositional);
assert.strictEqual(seqSisPositional, 6, 'Positional period, subject, grade should return #6');

const seqSisSwapped = repo.getNextSequenceNumber('Sistemas', '1°');
console.log('Sistemas 1° (positional "Sistemas", "1°") ->', seqSisSwapped);
assert.strictEqual(seqSisSwapped, 6, 'Permuted subject, grade should return #6');

const seqMat7 = repo.getNextSequenceNumber({ period: '1°', subject: 'Matemáticas', grade: '7°' });
console.log('Matemáticas 7° ->', seqMat7);
assert.strictEqual(seqMat7, 16, 'Matemáticas 7° correctly has consecutive #16 because it has up to #15 on 2026-10-14');

console.log('✓ TEST 1 PASSED: Consecutivity logic verified 100%');

// TEST 2: Creation of next class in SequenceView with schedule slot and date resolution
console.log('\n[TEST 2] SequenceView.createNewClassInGroup:');

global.AppRouter = {
  navigateTo: (view, opts) => {
    console.log(`[AppRouter] Navigated to ${view} with`, opts);
  }
};
global.App = {
  showToast: (msg) => console.log(`[Toast] ${msg}`)
};

const seqView = window.SequenceView;
seqView.selectedPeriod = '1°';

// Call createNewClassInGroup for Sistemas 1°
seqView.createNewClassInGroup('Sistemas', '1°', '1°');

const allSis1Classes = repo.getClasses({ teacherId: 'usr_manuel', period: '1°', subject: 'Sistemas', grade: '1°' });
console.log('Total Sistemas 1° classes now:', allSis1Classes.length);
assert.strictEqual(allSis1Classes.length, 6, 'Should now have 6 classes for Sistemas 1°');

const class6 = allSis1Classes.find(c => c.sequenceNumber === 6);
assert.ok(class6, 'Clase #6 must exist');
console.log('Created Clase #6 details:', {
  id: class6.id,
  seq: class6.sequenceNumber,
  date: class6.date,
  time: class6.time,
  slotId: class6.scheduleSlotId
});

assert.strictEqual(class6.sequenceNumber, 6, 'Clase must be #6');
assert.strictEqual(class6.date, '2026-10-22', 'Clase #6 must be on Thursday 2026-10-22');
assert.strictEqual(class6.time, '10:10 - 11:00', 'Clase #6 must match the official weekly schedule time');
assert.strictEqual(class6.scheduleSlotId, 'slot_usr_manuel_w4_i2_sistemas_1', 'Must link to official slot');

console.log('✓ TEST 2 PASSED: SequenceView created Clase #6 with exact consecutive number and official schedule slot');

// TEST 3: Calendar and PlanRepository two-way synchronization
console.log('\n[TEST 3] Calendar & PlanRepository two-way synchronization:');

// Check that PlanRepository immediately has class6 for its date
const planForClass5Date = planRepo.getPlan('usr_manuel', class6.date);
assert.ok(planForClass5Date, `Plan for ${class6.date} must exist in PlanRepository`);
const foundInPlan = planForClass5Date.classes.find(c => c.id === class6.id || c.classId === class6.id);
assert.ok(foundInPlan, 'Clase #6 must be present in PlanRepository classes array');
assert.strictEqual(foundInPlan.sequenceNumber, 6, 'Plan class must have sequenceNumber 6');

// Check that StorageService.getPlanByDate returns the class
const storagePlan = StorageService.getPlanByDate(class6.date);
assert.ok(storagePlan, 'StorageService.getPlanByDate must return the plan');
const foundInStoragePlan = storagePlan.classes.find(c => c.id === class6.id || c.classId === class6.id);
assert.ok(foundInStoragePlan, 'Clase #6 must be present in StorageService.getPlanByDate');

// Check that CalendarComponent renders the class badge for that date
let renderCount = 0;
const cal = new CalendarComponent();
cal.container = { offsetParent: {} }; // simulate visible
cal.render = () => {
  renderCount++;
  console.log(`[Calendar] render() called (count: ${renderCount})`);
};

// Dispatch a save event and verify calendar renders
window.dispatchEvent(new CustomEvent('class_saved_locally', { detail: { classSession: class6 } }));
assert.ok(renderCount > 0, 'Calendar must re-render automatically when class_saved_locally fires');

console.log('✓ TEST 3 PASSED: Calendar and PlanRepository 100% synchronized and reactive');

console.log('\n========================================');
console.log('ALL TESTS PASSED SUCCESSFULLY! (100%)');
console.log('========================================\n');
