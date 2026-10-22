const assert = require('assert');

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] || null,
    _getStore: () => store
  };
})();
global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.CustomEvent = class {
  constructor(name, detail) {
    this.name = name;
    this.detail = detail;
  }
};

const ClassRepository = require('../js/repositories/class-repository.js');
const PlanRepository = require('../js/plan-repository.js');
const RecoveryService = require('../js/services/recovery-service.js');

global.ClassRepository = ClassRepository;
global.PlanRepository = PlanRepository;
global.RecoveryService = RecoveryService;

async function runScenario() {
  console.log('--- SIMULATING USER EXACT SCENARIO ---');
  const tid = 'usr_manuel';

  // Seed with user's classes:
  // Legitimate math classes
  const mathSep1 = {
    id: 'cls_20260901_mat7_1',
    date: '2026-09-01',
    subject: 'Matemáticas',
    subjectName: 'Matemáticas',
    grade: '7°',
    gradeName: '7°',
    topic: 'DIAGNÓSTICO Y NIVELACIÓN PEDAGÓGICA',
    time: '7:50 - 9:30'
  };
  const mathSep2 = {
    id: 'cls_20260902_mat7_2',
    date: '2026-09-02',
    subject: 'Matemáticas',
    subjectName: 'Matemáticas',
    grade: '7°',
    gradeName: '7°',
    topic: 'NÚMEROS ENTEROS (Z)',
    time: '10:00 - 11:40'
  };

  // The 2 intruders in Matemáticas 7° shown in user screenshot
  const intruder1 = {
    id: 'cls_intruder_sep14_card2',
    date: '2026-09-14',
    time: '7:50 - 9:30',
    subject: 'Matemáticas',
    subjectName: 'Matemáticas',
    grade: '7°',
    gradeName: '7°',
    topic: 'Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico'
  };
  const intruder2 = {
    id: 'cls_intruder_sep14_card7',
    date: '2026-09-14',
    time: '7:50 - 9:30',
    subject: 'Matemáticas',
    subjectName: 'Matemáticas',
    grade: '7°',
    gradeName: '7°',
    topic: 'Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico'
  };

  // Legitimate Sistemas 7° class
  const legitSistemas7 = {
    id: 'cls_mu6xgnn9_d1wm71p',
    date: '2026-09-14',
    time: '7:50 - 8:40',
    subject: 'Sistemas',
    subjectName: 'Sistemas',
    grade: '7°',
    gradeName: '7°',
    topic: 'Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico'
  };

  ClassRepository.saveClass(mathSep1, tid);
  ClassRepository.saveClass(mathSep2, tid);
  ClassRepository.saveClass(intruder1, tid);
  ClassRepository.saveClass(intruder2, tid);
  ClassRepository.saveClass(legitSistemas7, tid);

  // Also save snapshots in localStorage simulating prior saves
  localStorage.setItem('snapshot_usr_manuel_day_2026-09-14', JSON.stringify({
    date: '2026-09-14',
    classes: [intruder1, intruder2, legitSistemas7]
  }));

  console.log('1. User sees grid with 2 intruders:');
  let mathClasses = ClassRepository.getClasses({ subject: 'Matemáticas', grade: '7°' }, tid);
  console.log('   Total Matemáticas 7° before cleanup:', mathClasses.length);
  assert(mathClasses.length === 4, 'Should have 4 classes before delete/cleanup');

  // User deletes intruder1 manually
  console.log('2. User clicks Delete on Card 2 (intruder 1)...');
  ClassRepository.deleteClass('cls_intruder_sep14_card2', tid, { date: '2026-09-14' });

  // Now simulate page reload (F5):
  console.log('3. User presses F5 (reloads app)...');
  // RecoveryService runs on App.init()
  await RecoveryService.executeSafeRecovery(tid);
  // Saneamiento runs on App.init()
  ClassRepository.cleanMismatchedGrade7Classes(tid);
  ClassRepository.realignSequenceNumbersToSchedule(tid);

  mathClasses = ClassRepository.getClasses({ subject: 'Matemáticas', grade: '7°' }, tid);
  console.log('   Total Matemáticas 7° after reload & cleanup:', mathClasses.length);

  // Verify:
  // Both intruders must be GONE from Matemáticas 7°!
  const hasIntruder1 = mathClasses.some(c => c.id === 'cls_intruder_sep14_card2');
  const hasIntruder2 = mathClasses.some(c => c.id === 'cls_intruder_sep14_card7');
  const hasSistemasTopic = mathClasses.some(c => (c.topic || '').includes('Procesadores de texto'));

  assert(!hasIntruder1, 'Intruder 1 must NEVER resurrect');
  assert(!hasIntruder2, 'Intruder 2 must be purged by cleanMismatchedGrade7Classes');
  assert(!hasSistemasTopic, 'Matemáticas 7° must NOT contain any Sistemas topic');

  // Verify legitimate math classes are intact
  assert(mathClasses.some(c => c.id === 'cls_20260901_mat7_1'), 'Math Sep 1 must remain intact');
  assert(mathClasses.some(c => c.id === 'cls_20260902_mat7_2'), 'Math Sep 2 must remain intact');

  // Verify Sistemas 7° has its legitimate session
  const sisClasses = ClassRepository.getClasses({ subject: 'Sistemas', grade: '7°' }, tid);
  assert(sisClasses.some(c => c.id === 'cls_mu6xgnn9_d1wm71p'), 'Sistemas 7° legitimate session must remain intact');

  console.log('✓ Scenario successfully passed! 0 resurrections, 0 intruders, 100% legitimate classes preserved.');
}

runScenario().catch(err => {
  console.error('SCENARIO FAILED:', err);
  process.exit(1);
});
