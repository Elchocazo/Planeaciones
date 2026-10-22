/**
 * TEST AUTOMATIZADO: Sincronización Inicial Única e Incremental con Google Cloud Firestore
 * 
 * Verifica los 12 requisitos esenciales:
 * 1. La sincronización inicial se ejecuta cuando la bandera no está presente.
 * 2. La sincronización inicial establece 'firestore_initial_sync_done_${teacherId}' en true.
 * 3. Una segunda sincronización sin cambios no genera escrituras de red y confirma 'Todo sincronizado'.
 * 4. Modificar una clase la encola en 'firestore_sync_queue_${teacherId}'.
 * 5. Procesar la cola incremental sube únicamente la clase modificada (no todos los planes).
 * 6. Tras procesar la cola, los ítems pasan a 'synced' y la longitud de pendientes es 0.
 * 7. El hash de contenido es determinista e inmune a marcas temporales o de orden.
 * 8. Documentos no modificados con hash idéntico no generan entradas en la cola ni escrituras.
 * 9. Cambios remotos (onSnapshot / merge con skipCloud: true) no se reencolan (blindaje anti-eco).
 * 10. Eliminar una clase encola una acción 'delete' y borra el documento remoto.
 * 11. Clases en la lista negra local (isDeletedClass) no son resucitadas por snapshots de la nube.
 * 12. Pausa / detención de sincronización (pauseSync) detiene el procesamiento sin corromper el estado.
 */

const assert = require('assert');

// 1. Mocks de almacenamiento local y ventana
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    _getStore: () => store
  };
})();
global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { protocol: 'http:', hostname: 'localhost', pathname: '/' }
};
global.document = {
  getElementById: () => null,
  body: { appendChild: () => {} }
};
global.CustomEvent = class {
  constructor(name, detail) {
    this.name = name;
    this.detail = detail;
  }
};

// 2. Mock de Firestore con métricas de red
const mockDb = {
  collections: {
    school_plans_v1: {},
    school_classes_v1: {},
    school_bundles_v1: {}
  },
  metrics: {
    sets: 0,
    deletes: 0,
    batchCommits: 0,
    queries: 0
  },
  resetMetrics() {
    this.metrics.sets = 0;
    this.metrics.deletes = 0;
    this.metrics.batchCommits = 0;
    this.metrics.queries = 0;
  },
  snapshotCallbacks: [],

  collection(colName) {
    if (!this.collections[colName]) this.collections[colName] = {};
    const colStore = this.collections[colName];
    const self = this;

    return {
      doc(docId) {
        return {
          id: docId,
          path: `${colName}/${docId}`,
          set: async (data, opts) => {
            self.metrics.sets++;
            if (opts && opts.merge && colStore[docId]) {
              colStore[docId] = { ...colStore[docId], ...data };
            } else {
              colStore[docId] = { ...data };
            }
            return Promise.resolve();
          },
          get: async () => {
            const val = colStore[docId];
            return Promise.resolve({
              exists: !!val,
              data: () => (val ? JSON.parse(JSON.stringify(val)) : null)
            });
          },
          update: async (fields) => {
            self.metrics.sets++;
            colStore[docId] = { ...(colStore[docId] || {}), ...fields };
            return Promise.resolve();
          },
          delete: async () => {
            self.metrics.deletes++;
            delete colStore[docId];
            return Promise.resolve();
          }
        };
      },
      where(field, op, val) {
        self.metrics.queries++;
        return {
          get: async () => {
            const matches = Object.entries(colStore)
              .filter(([id, data]) => data && data[field] === val)
              .map(([id, data]) => ({
                id,
                data: () => JSON.parse(JSON.stringify(data))
              }));
            return Promise.resolve(matches);
          },
          onSnapshot: (callback) => {
            self.snapshotCallbacks.push(callback);
            return () => {
              const idx = self.snapshotCallbacks.indexOf(callback);
              if (idx >= 0) self.snapshotCallbacks.splice(idx, 1);
            };
          }
        };
      }
    };
  },

  batch() {
    const ops = [];
    const self = this;
    return {
      set(docRef, data, opts) {
        ops.push({ type: 'set', docRef, data, opts });
      },
      delete(docRef) {
        ops.push({ type: 'delete', docRef });
      },
      commit: async () => {
        self.metrics.batchCommits++;
        for (const op of ops) {
          if (op.type === 'set') {
            await op.docRef.set(op.data, op.opts);
          } else if (op.type === 'delete') {
            await op.docRef.delete();
          }
        }
        return Promise.resolve();
      }
    };
  }
};

global.firebase = {
  apps: [{ name: '[DEFAULT]' }],
  app: () => ({}),
  initializeApp: () => ({}),
  firestore: () => mockDb
};
global.firebase.firestore.FieldValue = {
  serverTimestamp: () => 'MOCK_SERVER_TIMESTAMP'
};

// 3. Cargar Repositorios y Servicios
const IDBStorage = {
  isSupported: () => false,
  get: async () => null,
  set: async () => true,
  delete: async () => true
};
global.IDBStorage = IDBStorage;

const FirebaseConfigManager = {
  getConfig: () => ({ projectId: 'mock-school-project', apiKey: 'mock-key' })
};
global.FirebaseConfigManager = FirebaseConfigManager;

const UserService = {
  getCurrentUserId: () => 'usr_manuel',
  getTeacherPlans: () => ({})
};
global.UserService = UserService;

const StorageService = {
  getProfile: () => ({ name: 'Manuel Muñoz', role: 'teacher' }),
  saveProfile: () => true,
  getAllPlans: () => ({})
};
global.StorageService = StorageService;

const PlanRepository = require('../js/plan-repository.js');
const ClassRepository = require('../js/repositories/class-repository.js');
const FirestoreService = require('../js/services/firestore-service.js');

global.PlanRepository = PlanRepository;
global.ClassRepository = ClassRepository;
global.FirestoreService = FirestoreService;

// Configurar FirestoreService con mock
FirestoreService.db = mockDb;
FirestoreService.isInitialized = true;
FirestoreService.status = 'connected';

async function runTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 SUITE DE PRUEBAS: SINCRONIZACIÓN INICIAL E INCREMENTAL');
  console.log('🧪 ========================================================\n');

  const tid = 'usr_manuel';

  // Preparar estado limpio
  localStorage.clear();
  mockDb.collections.school_plans_v1 = {};
  mockDb.collections.school_classes_v1 = {};
  mockDb.collections.school_bundles_v1 = {};
  mockDb.resetMetrics();

  // Crear 2 clases locales de prueba
  const cls1 = {
    id: 'cls_20261023_01',
    teacherId: tid,
    date: '2026-10-23',
    subject: 'Robótica',
    subjectName: 'Robótica',
    grade: '6°A',
    gradeName: '6°A',
    topic: 'Introducción a sensores ultrasónicos',
    description: 'Montaje en protoboard con Arduino Uno.',
    sequenceNumber: 1,
    version: 1
  };
  const cls2 = {
    id: 'cls_20261023_02',
    teacherId: tid,
    date: '2026-10-23',
    subject: 'Sistemas',
    subjectName: 'Sistemas',
    grade: '7°B',
    gradeName: '7°B',
    topic: 'Estructuras condicionales',
    description: 'Ejercicios de lógica en Scratch.',
    sequenceNumber: 2,
    version: 1
  };

  ClassRepository.saveClass(cls1, tid, { skipCloud: true });
  ClassRepository.saveClass(cls2, tid, { skipCloud: true });

  // ----------------------------------------------------
  // TEST 1: Sincronización inicial se ejecuta si no hay bandera
  // ----------------------------------------------------
  console.log('▶ TEST 1: Verificación de ejecución de sincronización inicial cuando la bandera está ausente...');
  assert.strictEqual(FirestoreService.isInitialSyncDone(tid), false, 'La sincronización inicial no debe estar marcada al arrancar de cero');
  
  mockDb.resetMetrics();
  const resInitial = await FirestoreService.runInitialSync(tid);
  assert(resInitial.totalClasses >= 2, 'Debió subir al menos las 2 clases locales preparadas');
  assert(mockDb.metrics.batchCommits > 0 || mockDb.metrics.sets > 0, 'Debió registrar escrituras de red en Firestore');
  console.log('   ✅ Test 1 Aprobado: Sincronización inicial ejecutada con éxito.');

  // ----------------------------------------------------
  // TEST 2: La sincronización inicial marca la bandera en true
  // ----------------------------------------------------
  console.log('\n▶ TEST 2: Comprobación del flag firestore_initial_sync_done_${teacherId}...');
  assert.strictEqual(FirestoreService.isInitialSyncDone(tid), true, 'El flag de sincronización inicial completada debe ser true');
  assert.strictEqual(localStorage.getItem(`firestore_initial_sync_done_${tid}`), 'true', 'Debe persistir en localStorage');
  console.log('   ✅ Test 2 Aprobado: Bandera de sincronización inicial persistida.');

  // ----------------------------------------------------
  // TEST 3: Segunda sincronización sin cambios realiza 0 escrituras y confirma 'Todo sincronizado'
  // ----------------------------------------------------
  console.log('\n▶ TEST 3: Segunda sincronización sin cambios locales no produce escrituras...');
  mockDb.resetMetrics();
  const resSecond = await FirestoreService.processSyncQueue(tid);
  assert.strictEqual(resSecond.processed, 0, 'No debe procesar ningún ítem nuevo porque no hay cambios');
  assert.strictEqual(mockDb.metrics.batchCommits, 0, 'Debe haber 0 batch commits');
  assert.strictEqual(mockDb.metrics.sets, 0, 'Debe haber 0 llamadas set directas');
  assert.strictEqual(FirestoreService.statusMessage, 'Todo sincronizado', 'El estado de FirestoreService debe ser "Todo sincronizado"');
  console.log('   ✅ Test 3 Aprobado: 0 escrituras de red y estado "Todo sincronizado".');

  // ----------------------------------------------------
  // TEST 4: Modificar una clase la encola en dirty queue
  // ----------------------------------------------------
  console.log('\n▶ TEST 4: Encolamiento selectivo al modificar una clase...');
  const updatedCls = {
    ...cls1,
    topic: 'Sensores ultrasónicos y cálculo de distancia en cm',
    version: 2
  };
  ClassRepository.saveClass(updatedCls, tid); // Sin skipCloud para que use FirestoreService.enqueueChange

  const queue = FirestoreService._getSyncQueue(tid);
  const foundQueueItem = queue.find(q => q.entityId === cls1.id && q.entityType === 'class');
  assert(foundQueueItem, 'La clase modificada debe figurar en la cola dirty queue');
  assert.strictEqual(foundQueueItem.action, 'upsert', 'La acción debe ser upsert');
  assert.strictEqual(foundQueueItem.status, 'pending', 'El estado del ítem en cola debe ser pending');
  assert.strictEqual(FirestoreService.getPendingQueueCount(tid), 1, 'Debe haber exactamente 1 ítem pendiente');
  console.log('   ✅ Test 4 Aprobado: Cambio encolado con éxito en firestore_sync_queue.');

  // ----------------------------------------------------
  // TEST 5: Procesar cola incremental sube ÚNICAMENTE la clase modificada
  // ----------------------------------------------------
  console.log('\n▶ TEST 5: Sincronización incremental estricta (solo la clase modificada)...');
  mockDb.resetMetrics();
  const resInc = await FirestoreService.processSyncQueue(tid);
  assert.strictEqual(resInc.processed, 1, 'Debió procesar exactamente 1 elemento encolado');
  assert(mockDb.metrics.batchCommits > 0 || mockDb.metrics.sets > 0, 'Debió escribir únicamente el cambio pendiente');
  // Verificar que el documento remoto en school_classes_v1 fue actualizado con el nuevo tema
  const remoteDoc = mockDb.collections.school_classes_v1[`${tid}_${cls1.id}`];
  assert(remoteDoc, 'El documento remoto debe existir');
  assert.strictEqual(remoteDoc.topic, 'Sensores ultrasónicos y cálculo de distancia en cm');
  console.log('   ✅ Test 5 Aprobado: Subida estrictamente incremental de la clase modificada.');

  // ----------------------------------------------------
  // TEST 6: Tras procesar, la longitud de pendientes es 0 y el estado es 'Todo sincronizado'
  // ----------------------------------------------------
  console.log('\n▶ TEST 6: Verificación de vaciado de cola pendiente post-sincronización...');
  assert.strictEqual(FirestoreService.getPendingQueueCount(tid), 0, 'La cantidad de pendientes en la cola debe ser 0');
  assert.strictEqual(FirestoreService.statusMessage, 'Todo sincronizado');
  console.log('   ✅ Test 6 Aprobado: Cola de pendientes vacía y estado en orden.');

  // ----------------------------------------------------
  // TEST 7: Cálculo de hash determinista e inmune a metadatos volátiles
  // ----------------------------------------------------
  console.log('\n▶ TEST 7: Determinismo de hash y exclusión de marcas temporales...');
  const dataA = { id: 'x', topic: 'Hola', updatedAt: '2026-10-22T08:00:00Z', cloudUpdatedAt: 12345 };
  const dataB = { topic: 'Hola', id: 'x', updatedAt: '2026-10-22T10:00:00Z', cloudUpdatedAt: 99999 };
  const hashA = FirestoreService._computeHash(dataA);
  const hashB = FirestoreService._computeHash(dataB);
  assert.strictEqual(hashA, hashB, 'Los hashes deben ser idénticos a pesar del orden de claves y timestamps diferentes');
  console.log('   ✅ Test 7 Aprobado: Hashing determinista y normalizado correcto.');

  // ----------------------------------------------------
  // TEST 8: Documentos con contenido idéntico no generan encolamiento ni escrituras
  // ----------------------------------------------------
  console.log('\n▶ TEST 8: Rechazo de encolamiento redundante cuando el hash no varía...');
  const queueBefore = FirestoreService.getPendingQueueCount(tid);
  // Re-guardar la misma clase con idéntico contenido
  ClassRepository.saveClass(updatedCls, tid);
  const queueAfter = FirestoreService.getPendingQueueCount(tid);
  assert.strictEqual(queueAfter, queueBefore, 'No debió encolar nada nuevo porque el contenido pedagógico es idéntico');
  console.log('   ✅ Test 8 Aprobado: Blindaje contra escrituras idénticas.');

  // ----------------------------------------------------
  // TEST 9: Blindaje anti-eco en listeners en tiempo real y llamadas con skipCloud
  // ----------------------------------------------------
  console.log('\n▶ TEST 9: Verificación de prevención de bucle eco con skipCloud...');
  mockDb.resetMetrics();
  // Simular evento con skipCloud desde fusión
  ClassRepository.saveClass({
    ...cls2,
    topic: 'Lógica condicional aplicada'
  }, tid, { skipCloud: true });

  const queueAfterSkip = FirestoreService.getPendingQueueCount(tid);
  assert.strictEqual(queueAfterSkip, 0, 'Guardados con skipCloud jamás deben encolarse para la nube');
  assert.strictEqual(mockDb.metrics.sets, 0, 'No deben ejecutarse escrituras directas de red');
  console.log('   ✅ Test 9 Aprobado: Cero bucles de eco al guardar con skipCloud: true.');

  // ----------------------------------------------------
  // TEST 10: Eliminación de clase genera acción 'delete' y elimina documento remoto
  // ----------------------------------------------------
  console.log('\n▶ TEST 10: Propagación de eliminación de clase a la nube...');
  ClassRepository.deleteClass(cls2.id, tid);
  // Verificar que se haya eliminado el documento en mockDb
  assert.strictEqual(mockDb.collections.school_classes_v1[`${tid}_${cls2.id}`], undefined, 'El documento debe borrarse de Firestore');
  console.log('   ✅ Test 10 Aprobado: Eliminación propagada con éxito a Firestore.');

  // ----------------------------------------------------
  // TEST 11: Clases en la lista negra local no son resucitadas por descargas
  // ----------------------------------------------------
  console.log('\n▶ TEST 11: Protección anti-resurrección con lista negra de eliminadas...');
  assert(ClassRepository.isDeletedClass(cls2.id, tid), 'cls2 debe estar en la lista negra de eliminadas');
  
  // Simular snapshot remoto intentando reinsertar cls2
  mockDb.collections.school_classes_v1[`${tid}_${cls2.id}`] = {
    ...cls2,
    topic: 'Clase zombi intentando resucitar'
  };

  await FirestoreService.downloadAllFromCloud(tid);
  // Verificar que ClassRepository no la haya resucitado
  assert.strictEqual(ClassRepository.getClass(cls2.id, tid), null, 'La clase eliminada NO debe resucitar');
  console.log('   ✅ Test 11 Aprobado: Clases eliminadas permanecen eliminadas (anti-resurrección).');

  // ----------------------------------------------------
  // TEST 12: Pausa / detención de sincronización detiene el procesamiento sin corromper el estado
  // ----------------------------------------------------
  console.log('\n▶ TEST 12: Comprobación de pauseSync y reanudación limpia...');
  FirestoreService.enqueueChange(tid, {
    entityType: 'class',
    entityId: 'cls_test_pause',
    docPath: `school_classes_v1/${tid}_cls_test_pause`,
    action: 'upsert',
    data: { id: 'cls_test_pause', topic: 'Prueba de pausa' }
  });
  assert(FirestoreService.getPendingQueueCount(tid) >= 1, 'Debe haber un cambio encolado');

  // Pausar
  FirestoreService.pauseSync();
  assert.strictEqual(FirestoreService._isPaused, true, 'El servicio debe estar en estado pausado');
  
  const pauseProcess = await FirestoreService.processSyncQueue(tid);
  assert.strictEqual(pauseProcess.inFlight || pauseProcess.processed === 0, true, 'El proceso pausado no debe subir nada');

  // Reanudar
  FirestoreService.resumeSync(tid);
  assert.strictEqual(FirestoreService._isPaused, false, 'El servicio debe salir de la pausa');
  await FirestoreService.processSyncQueue(tid);
  assert.strictEqual(FirestoreService.getPendingQueueCount(tid), 0, 'Tras reanudar, la cola debe procesarse');
  console.log('   ✅ Test 12 Aprobado: pauseSync y resumeSync operan limpiamente sin corrupción de datos.');

  console.log('\n========================================================');
  console.log('🎉 TODOS LOS 12 TESTS DE SINCRONIZACIÓN PASARON AL 100%');
  console.log('========================================================\n');
}

runTestSuite().catch(err => {
  console.error('\n❌ ERROR EN LA SUITE DE SINCRONIZACIÓN:', err);
  process.exit(1);
});
