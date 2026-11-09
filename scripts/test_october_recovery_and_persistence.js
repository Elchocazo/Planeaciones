/**
 * SUITE DE REGRESIÓN INTEGRAL:
 * Recuperación de Planeaciones de Octubre (2026-10-16 a 2026-10-26) y Blindaje de Persistencia
 *
 * Verifica:
 * 1. Presencia íntegra de las 24 clases canónicas del 16 al 26 de octubre (incluyendo Martes 20 de octubre
 *    rescatado y el Simulacro de Matemáticas 7° del 21 de octubre).
 * 2. Bug #1 (Regla 11): _hydrateSyncFromLocalStorage jamás marca _isInitialized = true ni sobreescribe
 *    IndexedDB antes de que ClassRepository.init() fusione clases locales (ej. 27–29 de octubre).
 * 3. Bug #2 y #3 (Regla 12): createClass() encola cambios a FirestoreService y el estado de sincronización
 *    inicial sobrevive incluso bajo QuotaExceededError en LocalStorage.
 * 4. Bug #6 y #7: MigrationManager.runMigration() es 100% determinista e idempotente (cero explosión de
 *    clones), descuenta clases eliminadas (tombstones) y sobrevive a QuotaExceededError.
 * 5. Bug #8 y Regla 14: Cambiar a la sesión de Coordinación (Marisol Ruiz) jamás corrompe el perfil ni el
 *    horario de Manuel Muñoz, y RecoveryService jamás desplaza fechas de clases existentes.
 */

const assert = require('assert');

// 1. Entorno simulado de navegador con soporte de cuota configurable en LocalStorage
let simulateQuotaExceeded = false;

global.window = {
  dispatchEvent() {},
  addEventListener() {}
};

global.CustomEvent = class {
  constructor(name, detail) {
    this.name = name;
    this.detail = detail;
  }
};

global.localStorage = {
  _store: {},
  get length() {
    return Object.keys(this._store).length;
  },
  key(i) {
    return Object.keys(this._store)[i] || null;
  },
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null;
  },
  setItem(k, v) {
    if (simulateQuotaExceeded) {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this._store[k] = String(v);
  },
  removeItem(k) {
    delete this._store[k];
  },
  clear() {
    this._store = {};
  }
};

global.sessionStorage = {
  _store: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

global.IDBStorage = {
  _store: {},
  isSupported: () => true,
  async init() { return true; },
  async reconnect() { return true; },
  async keys() { return Object.keys(this._store); },
  async get(k) {
    return Object.prototype.hasOwnProperty.call(this._store, k)
      ? JSON.parse(JSON.stringify(this._store[k]))
      : null;
  },
  async set(k, v) {
    this._store[k] = JSON.parse(JSON.stringify(v));
    return true;
  },
  async delete(k) {
    delete this._store[k];
    return true;
  }
};

// 2. Cargar módulos del sistema
const { INITIAL_CLASSES_DATA } = require('../js/data/initial-classes-data.js');
global.INITIAL_CLASSES_DATA = INITIAL_CLASSES_DATA;
global.window.INITIAL_CLASSES_DATA = INITIAL_CLASSES_DATA;

const StorageService = require('../js/storage.js');
const UserService = require('../js/users-service.js');
const SequenceRepository = require('../js/repositories/sequence-repository.js');
const ClassRepository = require('../js/repositories/class-repository.js');
const PlanRepository = require('../js/plan-repository.js');
const RecoveryService = require('../js/services/recovery-service.js');
const MigrationManager = require('../js/services/migration-manager.js');
const FirestoreService = require('../js/services/firestore-service.js');

global.StorageService = StorageService;
global.UserService = UserService;
global.SequenceRepository = SequenceRepository;
global.ClassRepository = ClassRepository;
global.PlanRepository = PlanRepository;
global.RecoveryService = RecoveryService;
global.MigrationManager = MigrationManager;
global.FirestoreService = FirestoreService;

async function runSuite() {
  console.log('🚀 Iniciando Suite de Regresión: Recuperación de Octubre y Persistencia Multinivel...\n');
  const tid = 'usr_manuel';

  // =========================================================================
  // PRUEBA 1: Banco semilla y las 24 clases recuperadas (16 al 26 de octubre)
  // =========================================================================
  console.log('1. Verificando banco semilla y clases recuperadas del 16 al 26 de octubre...');
  assert.strictEqual(INITIAL_CLASSES_DATA.length, 122, 'INITIAL_CLASSES_DATA debe contener exactamente 122 clases canónicas');

  await ClassRepository.init(tid, { force: true });
  await PlanRepository.init();

  const expectedCountsByDate = {
    '2026-10-16': 5,
    '2026-10-19': 3,
    '2026-10-20': 5,
    '2026-10-21': 4,
    '2026-10-22': 5,
    '2026-10-23': 1,
    '2026-10-26': 1
  };

  let totalOct16To26 = 0;
  for (const [dateStr, expectedCount] of Object.entries(expectedCountsByDate)) {
    const classesForDay = ClassRepository.getClassesByDate(dateStr, tid);
    assert.strictEqual(
      classesForDay.length,
      expectedCount,
      `La fecha ${dateStr} debe tener exactamente ${expectedCount} clases visibles (obtenidas: ${classesForDay.length})`
    );
    totalOct16To26 += classesForDay.length;
  }
  assert.strictEqual(totalOct16To26, 24, 'Deben existir las 24 clases recuperadas entre el 16 y el 26 de octubre');

  // Verificar rescate específico del Martes 20 de octubre
  const oct20Ids = ClassRepository.getClassesByDate('2026-10-20', tid).map(c => c.id).sort();
  assert.deepStrictEqual(
    oct20Ids,
    ['cls_20261020_log6_6', 'cls_20261020_mat7_18', 'cls_20261020_rob10_6', 'cls_20261020_sis3_6', 'cls_20261020_sis8_6'],
    'El martes 2026-10-20 debe conservar sus 5 clases con IDs estables libres de colisión'
  );

  // Verificar integridad de cuadernos extensos (Simulacro Mat 7° del 21-oct y Mapa Números Gigantes Mat 2° del 26-oct)
  const mat7Simulacro = ClassRepository.getClassById('cls_mveilo1g_7x799z3', tid);
  assert(mat7Simulacro, 'Debe existir el Simulacro de Matemáticas 7° en 2026-10-21');
  const simulacroNb = mat7Simulacro.teacherNotebook?.studentNotebookContent || mat7Simulacro.notebookContent || '';
  assert(simulacroNb.length > 20000, `El cuaderno del Simulacro de 7° debe estar íntegro (>20k chars, actual: ${simulacroNb.length})`);

  const mat2Oct26 = ClassRepository.getClassById('cls_mv82tqf9_bqb9uge', tid);
  assert(mat2Oct26 && mat2Oct26.date === '2026-10-26', 'Debe existir Matemáticas 2° #13 en 2026-10-26');
  const mat2Nb = mat2Oct26.teacherNotebook?.studentNotebookContent || mat2Oct26.notebookContent || '';
  assert(mat2Nb.length > 18000, `El cuaderno del 2026-10-26 debe estar íntegro (>18k chars, actual: ${mat2Nb.length})`);
  console.log('   ✅ Las 24 clases del 16 al 26 de octubre están 100% íntegras con sus secuencias y cuadernos.');

  // =========================================================================
  // PRUEBA 2: Bug #1 — Pre-hidratación sincrónica NO sobreescribe IndexedDB
  // =========================================================================
  console.log('2. Verificando inmunidad de IndexedDB ante recarga con LocalStorage vacío (Bug #1)...');
  const keyV4 = ClassRepository.getStorageKey(tid);
  const idbOnlyClassId = 'cls_local_oct28_test';
  const existingIdbMap = (await global.IDBStorage.get(keyV4)) || {};
  existingIdbMap[idbOnlyClassId] = {
    id: idbOnlyClassId,
    teacherId: tid,
    date: '2026-10-28',
    subject: 'Robótica',
    subjectName: 'Robótica',
    grade: '10°',
    gradeName: '10°',
    sequenceNumber: 7,
    topic: 'Control PID en puente H y telemetría serial',
    description: 'Clase creada localmente en IndexedDB después del corte de LocalStorage.',
    notebookContent: '<h2>Control PID</h2><p>Apuntes completos en IndexedDB.</p>',
    period: '1°',
    updatedAt: '2026-10-28T14:00:00.000Z',
    version: 2
  };
  await global.IDBStorage.set(keyV4, existingIdbMap);

  // Simular arranque en frío con LocalStorage vacío (ej. tras purga o cuota llena)
  global.localStorage.clear();
  ClassRepository._cache = {};
  ClassRepository._isInitialized = false;
  ClassRepository._initPromise = null;

  // Ejecutar pre-hidratación sincrónica antes de init()
  ClassRepository._hydrateSyncFromLocalStorage(tid);
  assert.strictEqual(ClassRepository._isInitialized, false, '_hydrateSyncFromLocalStorage NUNCA debe fijar _isInitialized = true');

  const idbBeforeInit = await global.IDBStorage.get(keyV4);
  assert(idbBeforeInit[idbOnlyClassId], 'La pre-hidratación sincrónica NO debe borrar ni pisar IndexedDB');

  // Ahora completar init() asíncrono y comprobar fusión
  await ClassRepository.init(tid);
  const rescuedOct28 = ClassRepository.getClassById(idbOnlyClassId, tid);
  assert(rescuedOct28, 'ClassRepository.init() debe rescatar y fusionar clases alojadas únicamente en IndexedDB');
  assert.strictEqual(rescuedOct28.date, '2026-10-28');
  assert.strictEqual(rescuedOct28.topic, 'Control PID en puente H y telemetría serial');

  // Limpiar clase sintética de prueba para las siguientes aserciones
  ClassRepository.deleteClass(idbOnlyClassId, tid, { skipCloud: true });
  ClassRepository.unmarkClassDeleted(idbOnlyClassId, tid);
  ClassRepository.unmarkSlotDeleted('2026-10-28', 'Robótica', '10°', 7, tid);
  console.log('   ✅ Bug #1 resuelto: IndexedDB jamás es pisado por la pre-hidratación sincrónica.');

  // =========================================================================
  // PRUEBA 3: Bug #2 y #3 — createClass encola a Firestore y bandera sobrevive cuota llena
  // =========================================================================
  console.log('3. Verificando encolado de createClass() en Firestore y resistencia a cuota llena (Bugs #2 y #3)...');
  const enqueuedPayloads = [];
  const origEnqueue = FirestoreService.enqueueChange.bind(FirestoreService);
  FirestoreService.enqueueChange = (teacherIdArg, change) => {
    enqueuedPayloads.push({ teacherId: teacherIdArg, change });
  };

  const created = ClassRepository.createClass({
    teacherId: tid,
    date: '2026-10-27',
    subject: 'Sistemas',
    subjectName: 'Sistemas',
    grade: '7°',
    gradeName: '7°',
    sequenceNumber: 6,
    topic: 'Funciones lógicas SI anidadas en hojas de cálculo'
  });

  const classUpsert = enqueuedPayloads.find(
    e => e.change && e.change.entityType === 'class' && e.change.entityId === created.id && e.change.action === 'upsert'
  );
  assert(classUpsert, 'ClassRepository.createClass() DEBE encolar upsert en school_classes_v1');
  FirestoreService.enqueueChange = origEnqueue;

  // Limpiar clase temporal de prueba
  ClassRepository.deleteClass(created.id, tid, { skipCloud: true });
  ClassRepository.unmarkClassDeleted(created.id, tid);
  ClassRepository.unmarkSlotDeleted('2026-10-27', 'Sistemas', '7°', 6, tid);

  // Verificar bandera isInitialSyncDone bajo QuotaExceededError
  simulateQuotaExceeded = true;
  try {
    FirestoreService._initialSyncDoneMem = {};
    FirestoreService.setInitialSyncDone('usr_quota_test', true);
    assert.strictEqual(
      FirestoreService.isInitialSyncDone('usr_quota_test'),
      true,
      'isInitialSyncDone debe mantenerse verdadero en memoria e IndexedDB aunque LocalStorage lance QuotaExceededError'
    );
  } finally {
    simulateQuotaExceeded = false;
  }
  console.log('   ✅ Bugs #2 y #3 resueltos: createClass sincroniza a la nube y setInitialSyncDone resiste QuotaExceededError.');

  // =========================================================================
  // PRUEBA 4: Bug #6 y #7 — MigrationManager idempotente, sin explosión de clones y tolerante a cuota
  // =========================================================================
  console.log('4. Verificando idempotencia de MigrationManager ante IDs repetidos, tombstones y cuota llena (Bugs #6 y #7)...');
  const migTid = 'usr_mig_test';
  ClassRepository.markClassDeleted('cls_deleted_legacy', migTid);

  global.localStorage.setItem(
    'teacher_planner_plans_' + migTid + '_v3',
    JSON.stringify({
      '2026-10-15': {
        period: '1°',
        classes: [
          { id: 'cls_shared_dup', subject: 'Sistemas', grade: '1°', sequenceNumber: 5, topic: 'Teclado básico', description: 'Inicio: A\nDesarrollo: B\nCierre: C' },
          { id: 'cls_deleted_legacy', subject: 'Sistemas', grade: '2°', sequenceNumber: 5, topic: 'Clase borrada', description: 'No debe migrar' }
        ]
      },
      '2026-10-22': {
        period: '1°',
        classes: [
          { id: 'cls_shared_dup', subject: 'Sistemas', grade: '1°', sequenceNumber: 6, topic: 'Práctica de escritura', description: 'Inicio: D\nDesarrollo: E\nCierre: F' }
        ]
      }
    })
  );

  // Resetear versión de esquema y activar fallo de cuota en LocalStorage durante la migración
  global.localStorage.removeItem(MigrationManager.SCHEMA_KEY);
  await global.IDBStorage.delete(MigrationManager.SCHEMA_KEY);
  MigrationManager._schemaVersionMem = 0;

  simulateQuotaExceeded = true;
  let migRes1;
  try {
    migRes1 = await MigrationManager.runMigration(migTid);
  } finally {
    simulateQuotaExceeded = false;
  }

  assert.strictEqual(migRes1.success, true, `runMigration debe completarse aún con QuotaExceededError (${migRes1.error || ''})`);
  assert.strictEqual(migRes1.migratedCount, 2, 'Deben migrarse exactamente las 2 clases válidas ignorando el tombstone');

  const migMapAfter1 = Object.keys(ClassRepository._getAllMap(migTid)).filter(id => id.startsWith('cls_shared_dup'));
  assert.deepStrictEqual(
    migMapAfter1.sort(),
    ['cls_shared_dup', 'cls_shared_dup_20261022'],
    'El ID desambiguado por fecha debe ser 100% determinista'
  );

  // Segunda ejecución inmediata: debe ser no-op (v5 ya registrado en memoria e IndexedDB)
  const migRes2 = await MigrationManager.runMigration(migTid);
  assert.strictEqual(migRes2.success, true);
  const migMapAfter2 = Object.keys(ClassRepository._getAllMap(migTid)).filter(id => id.startsWith('cls_shared_dup'));
  assert.strictEqual(migMapAfter2.length, 2, 'Cero clones adicionales en ejecuciones repetidas de MigrationManager');
  console.log('   ✅ Bugs #6 y #7 resueltos: Cero explosión de clones y migración resiliente ante QuotaExceededError.');

  // =========================================================================
  // PRUEBA 5: Bug #8 y Regla 14 — Aislamiento Coordinadora Marisol y cero desplazamiento de fechas
  // =========================================================================
  console.log('5. Verificando aislamiento de perfil de Coordinación (Bug #8) e inmutabilidad de fechas (Regla 14)...');
  const manuelSchedule = {
    Lunes: [{ time: '07:00 - 08:30', subject: 'Sistemas', grade: '7°' }],
    Martes: [{ time: '07:00 - 08:30', subject: 'Sistemas', grade: '3°' }]
  };
  UserService.setCurrentUser('usr_manuel');
  StorageService.saveProfile({
    id: 'usr_manuel',
    name: 'Manuel Muñoz',
    role: 'teacher',
    homeroom: 'Séptimo (7°)',
    weeklySchedule: manuelSchedule
  });

  // Iniciar sesión como Coordinadora Marisol Ruiz
  UserService.setCurrentUser('usr_coordinacion');
  assert.strictEqual(UserService.isCoordinatorActive(), true);

  const allUsers = UserService.getAllUsers();
  const manuelAfterCoord = allUsers.find(u => u.id === 'usr_manuel');
  assert.strictEqual(manuelAfterCoord.name, 'Manuel Muñoz', 'El nombre de Manuel Muñoz jamás debe sobrescribirse con Marisol Ruiz');
  assert.strictEqual(manuelAfterCoord.homeroom, 'Séptimo (7°)', 'La dirección de grupo de Manuel debe permanecer intacta');

  const storedProfile = StorageService.getProfile();
  assert.strictEqual(storedProfile.name, 'Manuel Muñoz', 'teacher_planner_profile_v1 debe seguir perteneciendo al docente titular');
  assert(storedProfile.weeklySchedule && storedProfile.weeklySchedule.Martes, 'El horario semanal del docente debe permanecer intacto');

  // Coordinadora Marisol debe ver las 5 clases del Martes 20 de octubre y las 4 del Miércoles 21 de octubre
  assert.strictEqual(ClassRepository.getClassesByDate('2026-10-20', 'usr_coordinacion').length, 5);
  assert.strictEqual(ClassRepository.getClassesByDate('2026-10-21', 'usr_coordinacion').length, 4);

  // Regla 14: RecoveryService jamás debe desplazar clases del 14 o 15 de octubre hacia el 21 o 22 de octubre
  UserService.setCurrentUser('usr_manuel');
  const sis1Oct15Before = ClassRepository.getClassById('cls_20261015_sis1_5', tid);
  assert.strictEqual(sis1Oct15Before.date, '2026-10-15');
  await RecoveryService.rescueDisplacedOctoberClasses(tid);
  const sis1Oct15After = ClassRepository.getClassById('cls_20261015_sis1_5', tid);
  assert.strictEqual(sis1Oct15After.date, '2026-10-15', 'Regla 14: RecoveryService jamás debe mutar la fecha 2026-10-15 a 2026-10-22');
  console.log('   ✅ Bug #8 y Regla 14 verificados: Perfil de Manuel intacto y fechas 100% inmutables.');

  // =========================================================================
  // PRUEBA 6: Rescate Forense Profundo (executeDeepSnapshotRescue) para Oct 26–29
  // =========================================================================
  console.log('6. Verificando rescate forense profundo de IndexedDB (snapshot_history, class_v*, backup_recovery, notebook_history)...');
  await global.IDBStorage.set('snapshot_usr_manuel_history', [
    {
      timestamp: '2026-10-29T12:00:00.000Z',
      summary: 'Snapshot vacío tras corte',
      data: { plans: {} }
    },
    {
      timestamp: '2026-10-28T18:30:00.000Z',
      summary: 'Respaldo previo con clases del 26 y 27 de octubre',
      data: {
        plans: {
          '2026-10-26': {
            period: '1°',
            classes: [
              { id: 'cls_oct26_sis7_6', date: '2026-10-26', subject: 'Sistemas', grade: '7°', sequenceNumber: 6, topic: 'Encabezados y pies de página avanzados', description: 'Inicio: A\nDesarrollo: B\nCierre: C' }
            ]
          },
          '2026-10-27': {
            period: '1°',
            classes: [
              { id: 'cls_oct27_log6_7', date: '2026-10-27', subject: 'Lógica', grade: '6°', sequenceNumber: 7, topic: 'Disyunción inclusiva y tablas de verdad', description: 'Inicio: X\nDesarrollo: Y\nCierre: Z' }
            ]
          }
        }
      }
    }
  ]);

  await global.IDBStorage.set('snapshot_usr_manuel_class_cls_oct28_mat3_14_v2', {
    id: 'cls_oct28_mat3_14',
    teacherId: tid,
    date: '2026-10-28',
    subjectName: 'Matemáticas',
    gradeName: '3°',
    sequenceNumber: 14,
    curriculum: { topic: 'Problemas multiplicativos en situaciones cotidianas' },
    didacticSequence: { inicio: 'I', desarrollo: 'Desarrollo completo de 3°', cierre: 'C' }
  });

  await global.IDBStorage.set('notebook_history_2026-10-28_cls_oct28_mat3_14', [
    {
      version: 2,
      timestamp: '2026-10-28T20:00:00.000Z',
      html: '<h2>📌 TEMA: PROBLEMAS MULTIPLICATIVOS</h2><p>Apuntes completos rescatados del historial de cuaderno en IndexedDB.</p>'
    }
  ]);

  await global.IDBStorage.set('backup_recovery_pre_execution_usr_manuel_1793000000', {
    teacher_class_sessions_usr_manuel_v4: JSON.stringify({
      cls_oct29_rob11_7: {
        id: 'cls_oct29_rob11_7',
        teacherId: tid,
        date: '2026-10-29',
        subjectName: 'Robótica',
        gradeName: '11°',
        sequenceNumber: 7,
        topic: 'Ensamblaje mecánico y pruebas de carga en prototipo CAD',
        description: 'Sesión práctica de laboratorio 11°'
      }
    })
  });

  const deepRes = await RecoveryService.executeDeepSnapshotRescue(tid);
  assert(deepRes.rescued >= 4, `Deben rescatarse las 4 clases de Oct 26–29 desde los 4 formatos de IndexedDB (rescatadas: ${deepRes.rescued})`);
  assert(ClassRepository.getClassById('cls_oct26_sis7_6', tid), 'Rescatada clase 26 oct desde snapshot_usr_manuel_history[1]');
  assert(ClassRepository.getClassById('cls_oct27_log6_7', tid), 'Rescatada clase 27 oct desde snapshot_usr_manuel_history[1]');
  const oct28Mat3 = ClassRepository.getClassById('cls_oct28_mat3_14', tid);
  assert(oct28Mat3, 'Rescatada clase 28 oct desde snapshot_usr_manuel_class_*');
  assert((oct28Mat3.teacherNotebook?.studentNotebookContent || '').includes('PROBLEMAS MULTIPLICATIVOS'), 'Enriquecido cuaderno desde notebook_history_*');
  assert(ClassRepository.getClassById('cls_oct29_rob11_7', tid), 'Rescatada clase 29 oct desde backup_recovery_pre_execution_* stringificado');
  console.log('   ✅ Rescate forense profundo de IndexedDB verificado al 100%.\n');

  console.log('🎉 ¡TODAS LAS PRUEBAS DE RECUPERACIÓN DE OCTUBRE Y PERSISTENCIA PASARON AL 100%!');
}

runSuite().catch(err => {
  console.error('❌ FALLO EN SUITE DE REGRESIÓN:', err);
  process.exit(1);
});
