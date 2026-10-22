const assert = require('assert');

// Mock localStorage and sessionStorage
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

// Mock window and document
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

// Load repositories
const ClassRepository = require('../js/repositories/class-repository.js');
const PlanRepository = require('../js/plan-repository.js');
const RecoveryService = require('../js/services/recovery-service.js');

global.ClassRepository = ClassRepository;
global.PlanRepository = PlanRepository;
global.RecoveryService = RecoveryService;

async function testAll() {
  console.log('--- STARTING ANTI-RESURRECTION AND 7° INTRUDER TESTS ---');

  const tid = 'usr_manuel';

  // 1. Setup a test math class and test deleting it
  const testClass = {
    id: 'cls_test_to_delete',
    teacherId: tid,
    date: '2026-09-22',
    subject: 'Matemáticas',
    subjectName: 'Matemáticas',
    grade: '7°',
    gradeName: '7°',
    topic: 'Test class to delete',
    sequenceNumber: 10
  };

  ClassRepository.saveClass(testClass, tid);
  assert(ClassRepository.getClass('cls_test_to_delete', tid) !== null, 'Class should exist initially');

  // Delete the class
  ClassRepository.deleteClass('cls_test_to_delete', tid, { date: '2026-09-22' });
  assert(ClassRepository.getClass('cls_test_to_delete', tid) === null, 'Class should be null after delete');
  assert(ClassRepository.isDeletedClass('cls_test_to_delete', tid) === true, 'Class should be marked deleted');

  // Verify tombstone in localStorage
  const rawDeleted = localStorage.getItem('school_deleted_classes_' + tid);
  assert(rawDeleted !== null, 'Deleted set should be stored in localStorage');
  const deletedArray = JSON.parse(rawDeleted);
  assert(deletedArray.includes('cls_test_to_delete'), 'cls_test_to_delete should be in deleted array');

  console.log('✓ Test 1: Deletion and Tombstoning verified');

  // 2. Simulate historical snapshot in localStorage that contains the deleted class
  const snapshotData = {
    date: '2026-09-22',
    classes: [
      {
        id: 'cls_test_to_delete',
        date: '2026-09-22',
        subject: 'Matemáticas',
        grade: '7°',
        topic: 'Test class to delete'
      },
      {
        id: 'cls_legit_to_rescue',
        date: '2026-09-22',
        subject: 'Matemáticas',
        grade: '7°',
        topic: 'Legitimate class that was not deleted'
      }
    ]
  };
  localStorage.setItem('snapshot_usr_manuel_test_snap', JSON.stringify(snapshotData));

  // Run audit and recovery
  const auditReport = await RecoveryService.runAudit(tid);
  const foundDeleted = auditReport.classes.find(c => c.id === 'cls_test_to_delete');
  assert(!foundDeleted, 'RecoveryService.runAudit must NOT include deleted class');

  const foundLegit = auditReport.classes.find(c => c.id === 'cls_legit_to_rescue');
  assert(foundLegit, 'RecoveryService.runAudit SHOULD include legitimate class');

  await RecoveryService.executeSafeRecovery(tid);
  assert(ClassRepository.getClass('cls_test_to_delete', tid) === null, 'Deleted class must NOT resurrect in ClassRepository');
  assert(ClassRepository.getClass('cls_legit_to_rescue', tid) !== null, 'Legit class should be rescued');

  console.log('✓ Test 2: RecoveryService Anti-Resurrection verified');

  // 3. Test PlanRepository anti-resurrection
  PlanRepository._cache[tid] = {
    '2026-09-22': {
      date: '2026-09-22',
      classes: [
        { id: 'cls_test_to_delete', subject: 'Matemáticas', grade: '7°' },
        { id: 'cls_legit_to_rescue', subject: 'Matemáticas', grade: '7°' }
      ]
    }
  };
  const plan = PlanRepository.getPlan(tid, '2026-09-22');
  assert(plan.classes.length === 1, 'PlanRepository must strip out deleted classes');
  assert(plan.classes[0].id === 'cls_legit_to_rescue', 'PlanRepository keeps only non-deleted classes');

  console.log('✓ Test 3: PlanRepository Anti-Resurrection verified');

  // 4. Test 7° Intruder detection and cleanup
  // Add an imposter class in Matemáticas 7° on Monday 14 Sep with Sistemas topic
  const intruderMath1 = {
    id: 'cls_intruder_math_1',
    teacherId: tid,
    date: '2026-09-14',
    time: '7:50 - 9:30',
    subject: 'Matemáticas',
    subjectName: 'Matemáticas',
    grade: '7°',
    gradeName: '7°',
    topic: 'Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico',
    curriculum: {
      topic: 'Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico'
    }
  };
  const legitimateSistemas7 = {
    id: 'cls_mu6xgnn9_d1wm71p',
    teacherId: tid,
    date: '2026-09-14',
    time: '7:50 - 8:40',
    subject: 'Sistemas',
    subjectName: 'Sistemas',
    grade: '7°',
    gradeName: '7°',
    topic: 'Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico',
    curriculum: {
      topic: 'Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico'
    }
  };
  const legitimateMath7 = {
    id: 'cls_legit_math_7',
    teacherId: tid,
    date: '2026-09-15', // Tuesday (legitimate math day)
    time: '7:50 - 9:30',
    subject: 'Matemáticas',
    subjectName: 'Matemáticas',
    grade: '7°',
    gradeName: '7°',
    topic: 'OPERACIONES CON NÚMEROS ENTEROS (Z)',
    curriculum: {
      topic: 'OPERACIONES CON NÚMEROS ENTEROS (Z)'
    }
  };

  ClassRepository.saveClass(intruderMath1, tid, { allowUndelete: true });
  ClassRepository.saveClass(legitimateSistemas7, tid, { allowUndelete: true });
  ClassRepository.saveClass(legitimateMath7, tid, { allowUndelete: true });

  const purged = ClassRepository.cleanMismatchedGrade7Classes(tid);
  assert(purged >= 1, 'cleanMismatchedGrade7Classes should purge at least 1 intruder');

  // Intruder math class must be deleted and tombstoned
  assert(ClassRepository.getClass('cls_intruder_math_1', tid) === null, 'Intruder math class must be removed');
  assert(ClassRepository.isDeletedClass('cls_intruder_math_1', tid) === true, 'Intruder math class must be tombstoned');

  // Legitimate classes must remain intact
  assert(ClassRepository.getClass('cls_mu6xgnn9_d1wm71p', tid) !== null, 'Legitimate Sistemas 7° must remain intact');
  assert(ClassRepository.getClass('cls_legit_math_7', tid) !== null, 'Legitimate Matemáticas 7° must remain intact');

  console.log('✓ Test 4: 7° Intruder detection, cleanup and permanent tombstone verified');

  console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
}

testAll().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
