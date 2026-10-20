/**
 * Test: Slot Matching, Status Promotion, and Dashboard Registration
 */
const fs = require('fs');
const assert = require('assert');

console.log('--- TEST: SLOT MATCHING & DASHBOARD REGISTRATION ---');

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
    appendChild: () => {}
  })
};

// Load dependencies
eval(fs.readFileSync('js/core/app-state.js', 'utf8'));
eval(fs.readFileSync('js/storage.js', 'utf8'));
eval(fs.readFileSync('js/repositories/schedule-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/class-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/sequence-repository.js', 'utf8'));
eval(fs.readFileSync('js/services/schedule-service.js', 'utf8'));

const AppState = window.AppState;
const ScheduleRepository = window.ScheduleRepository;
const ClassRepository = window.ClassRepository;
const ScheduleService = window.ScheduleService;

AppState.set('currentUser', { id: 'usr_manuel', name: 'Manuel' });

// 1. Check Thursday slots for usr_manuel
const thursSlots = ScheduleRepository.getSlotsByWeekday(4, 'usr_manuel');
console.log(`Found ${thursSlots.length} slots for Thursday:`);
thursSlots.forEach(s => console.log(`  - ${s.time} | ${s.subjectName || s.subject} | Grade: ${s.gradeName || s.grade} | id: ${s.id}`));

const slot1 = thursSlots.find(s => (s.gradeName === '1°' || s.gradeName === '1' || s.grade === '1') && (s.subjectName || s.subject || '').toLowerCase().includes('sistemas'));
assert(slot1, 'Should find slot for Sistemas 1 on Thursday');
console.log('Target slot:', slot1.time, slot1.subjectName, slot1.gradeName, slot1.id);

// 2. Test saving a class with grade "1°" and subject "Tecnología e Informática" (alias)
const targetDate = '2026-10-15'; // Thursday
const newClass = {
  id: 'test_cls_sistemas_1_5',
  teacherId: 'usr_manuel',
  date: targetDate,
  sequenceNumber: 5,
  subject: 'Tecnología e Informática',
  grade: '1°',
  group: '1°',
  title: 'El Computador y sus Partes',
  topic: 'Hardware y Periféricos',
  pedagogy: {
    faseInicio: 'Activación con juego de adivinanzas de computadores...',
    faseDesarrollo: 'Identificación visual de pantalla, teclado y mouse...',
    faseCierre: 'Dibujo guiado del computador'
  },
  status: 'pending' // Even if incoming is pending, repository must auto-promote
};

const saved = ClassRepository.saveClass(newClass);
console.log('Saved class status:', saved.status);
assert.strictEqual(saved.status, 'planned', 'Class with topic & pedagogy must be auto-promoted to planned');

// 3. Test ScheduleService.buildDayView for this Thursday
const dayView = ScheduleService.buildDayView(targetDate, 'usr_manuel');
assert(dayView, 'dayView must be returned');

console.log(`DayView has ${dayView.scheduledItems.length} items:`);
dayView.scheduledItems.forEach(item => {
  const s = item.slot;
  const c = item.classSession;
  console.log(`  [${s.time}] ${s.subjectName || s.subject} ${s.gradeName || s.grade} -> isPlanned: ${item.isPlanned}, isPending: ${item.isPending}, matchedClass: ${c ? c.id + ' (# ' + c.sequenceNumber + ')' : 'NONE'}`);
});

const matchedSistemasItem = dayView.scheduledItems.find(item => item.slot.id === slot1.id);
assert(matchedSistemasItem, 'Matched Sistemas item must exist in dayView');
assert.strictEqual(matchedSistemasItem.isPlanned, true, 'Slot must be marked as planned');
assert.strictEqual(matchedSistemasItem.isPending, false, 'Slot must NOT be marked as pending');
assert(matchedSistemasItem.classSession, 'classSession must not be null');
assert.strictEqual(matchedSistemasItem.classSession.sequenceNumber, 5, 'Must have sequenceNumber 5');
assert.strictEqual(matchedSistemasItem.classSession.scheduleSlotId, slot1.id, 'scheduleSlotId must be anchored');
assert.strictEqual(matchedSistemasItem.classSession.time, slot1.time, 'time must be anchored');

console.log('✓ TEST PASSED: Slot matching, alias resolution, status promotion, and dayView registration 100% verified!');
