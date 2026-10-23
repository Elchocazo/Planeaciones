/**
 * TEST SUITE: PREVENCIÓN DE BLOQUEOS EN ARRANQUE Y PRESERVACIÓN DE RUTA (#sequences)
 * Valida:
 * 1. Carga limpia y sin congelamiento con hash #sequences (0ms lag).
 * 2. El nav button de 'sequences' queda activo y el contenedor se muestra.
 * 3. _createPreRecoveryBackup no crea anidamiento exponencial en localStorage ni IndexedDB.
 * 4. Purgado automático de copias de pre-ejecución temporales redundantes.
 * 5. Batching de descargas de Firestore para prevenir lag en el hilo principal.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 ========================================================');
console.log('🧪 SUITE: PREVENCIÓN DE BLOQUEOS Y PRESERVACIÓN DE RUTA F5');
console.log('🧪 ========================================================');

// 1. Simular entorno de navegador en index.html#sequences
const localStorageStore = {};
global.localStorage = {
  getItem: k => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: k => delete localStorageStore[k],
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; },
  get length() { return Object.keys(localStorageStore).length; },
  key: i => Object.keys(localStorageStore)[i]
};
global.sessionStorage = global.localStorage;

// Inyectar respaldos temporales acumulados simulando múltiples F5 previos
localStorageStore['planeaciones_data_schema_version'] = '5';
localStorageStore['october_classes_rescued_flag_usr_manuel_v2'] = 'true';
localStorageStore['backup_recovery_pre_execution_usr_manuel_1001'] = JSON.stringify({ old: true });
localStorageStore['backup_recovery_pre_execution_usr_manuel_1002'] = JSON.stringify({ old: true });
localStorageStore['backup_recovery_pre_execution_usr_manuel_1003'] = JSON.stringify({ old: true });

const elements = {};
function getOrCreateElement(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      innerHTML: '',
      innerText: '',
      style: { display: id === 'dashboard-view' ? 'block' : 'none' },
      classList: {
        _classes: new Set(id === 'nav-dashboard' ? ['active'] : []),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      querySelectorAll: (sel) => {
        if (sel === '.app-nav-btn') {
          return [
            getOrCreateElement('nav-dashboard'),
            getOrCreateElement('nav-calendar'),
            getOrCreateElement('nav-sequences'),
            getOrCreateElement('nav-history'),
            getOrCreateElement('nav-recovery'),
            getOrCreateElement('nav-settings')
          ];
        }
        return [];
      },
      querySelector: () => null,
      getAttribute: (a) => {
        if (a === 'data-view') return id.replace('nav-', '');
        return null;
      },
      setAttribute: () => {},
      addEventListener: () => {}
    };
  }
  return elements[id];
}

const listeners = {};
global.document = {
  readyState: 'loading',
  getElementById: (id) => getOrCreateElement(id),
  querySelectorAll: (sel) => {
    if (sel === '.app-nav-btn') {
      return [
        getOrCreateElement('nav-dashboard'),
        getOrCreateElement('nav-calendar'),
        getOrCreateElement('nav-sequences'),
        getOrCreateElement('nav-history'),
        getOrCreateElement('nav-recovery'),
        getOrCreateElement('nav-settings')
      ];
    }
    return [];
  },
  querySelector: () => null,
  createElement: (tag) => getOrCreateElement(tag),
  body: getOrCreateElement('body'),
  documentElement: getOrCreateElement('html'),
  addEventListener: (event, handler) => {
    listeners[event] = listeners[event] || [];
    listeners[event].push(handler);
  }
};

global.window = global;
global.window.location = { protocol: 'file:', hostname: '', pathname: '/index.html', hash: '#sequences' };
global.window.addEventListener = (event, handler) => {
  listeners[event] = listeners[event] || [];
  listeners[event].push(handler);
};
global.window.dispatchEvent = (evt) => {
  const list = listeners[evt.name || evt.type] || [];
  list.forEach(h => h(evt));
};
global.window.scrollTo = () => {};
global.window.history = { replaceState: () => {}, pushState: () => {} };
global.CustomEvent = class { constructor(n, d) { this.name = n; this.detail = d; } };
global.navigator = { onLine: true };

// Mock IDBStorage
const idbStore = {};
const mockIDB = {
  isSupported: () => true,
  init: async () => true,
  get: async k => idbStore[k] || null,
  set: async (k, v) => { idbStore[k] = v; return true; },
  delete: async k => { delete idbStore[k]; return true; },
  keys: async () => Object.keys(idbStore)
};
global.IDBStorage = mockIDB;

// Cargar dependencias (excluyendo idb-storage.js para conservar el mock en entorno Node)
const scriptFiles = [
  'js/firebase-config.js',
  'js/storage.js',
  'js/holidays.js',
  'js/data/curriculum/matematicas.js',
  'js/data/curriculum/sistemas.js',
  'js/data/curriculum/robotica.js',
  'js/data/curriculum/logica.js',
  'js/data/curriculum/direccion_grupo.js',
  'js/data/curriculum-data.js',
  'js/data/initial-classes-data.js',
  'js/repositories/schedule-repository.js',
  'js/repositories/sequence-repository.js',
  'js/repositories/class-repository.js',
  'js/repositories/curriculum-repository.js',
  'js/core/app-state.js',
  'js/core/router.js',
  'js/core/pagination-engine.js',
  'js/users-service.js',
  'js/services/class-service.js',
  'js/services/sequence-service.js',
  'js/services/schedule-service.js',
  'js/services/recovery-service.js',
  'js/services/migration-manager.js',
  'js/services/backup-service.js',
  'js/services/import-parser.js',
  'js/services/import-service.js',
  'js/services/firestore-service.js',
  'js/plan-repository.js',
  'js/curriculum.js',
  'js/ui/curriculum-selector.js',
  'js/ui/import-modal.js',
  'js/ui/dashboard-view.js',
  'js/ui/class-editor-view.js',
  'js/ui/sequence-view.js',
  'js/ui/history-view.js',
  'js/ui/recovery-view.js',
  'js/notebook-editor.js',
  'js/coordinator-view.js',
  'js/ui/auth-modal.js',
  'js/calendar.js',
  'js/planner.js',
  'js/app.js'
];

for (const f of scriptFiles) {
  const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

(async () => {
  console.log('\n▶ TEST 1: Arranque con hash #sequences y preservación de ruta...');
  const t0 = Date.now();
  await global.App.init();
  const initDuration = Date.now() - t0;
  console.log(`   Arranque completado en ${initDuration} ms`);
  assert.ok(initDuration < 200, `El arranque debe ser casi instantáneo (<200ms), tomó ${initDuration}ms`);

  // Verificar que el enrutador activó sequences
  assert.strictEqual(global.AppRouter.currentView, 'sequences', 'AppRouter.currentView debe ser sequences');
  assert.strictEqual(elements['sequences-view'].style.display, 'block', 'sequences-view debe estar visible');
  assert.strictEqual(elements['dashboard-view'].style.display, 'none', 'dashboard-view debe estar oculto');
  assert.ok(elements['nav-sequences'].classList.contains('active'), 'nav-sequences debe tener clase active');
  assert.ok(!elements['nav-dashboard'].classList.contains('active'), 'nav-dashboard NO debe tener clase active');
  console.log('   ✅ Test 1 Aprobado: #sequences preservado sin congelamientos ni redirecciones espurias.');

  console.log('\n▶ TEST 2: Purgado de respaldos temporales redundantes en arranque...');
  const remainingPreBackups = Object.keys(localStorageStore).filter(k => k.startsWith('backup_recovery_pre_execution_'));
  assert.strictEqual(remainingPreBackups.length, 0, 'Los respaldos temporales redundantes deben haber sido purgados');
  console.log('   ✅ Test 2 Aprobado: localStorage limpio de copias redundantes.');

  console.log('\n▶ TEST 3: _createPreRecoveryBackup almacena en IDB y no clona otros respaldos...');
  localStorageStore['key1'] = 'val1';
  localStorageStore['backup_old'] = 'old_backup_data';
  localStorageStore['snapshot_class1'] = 'snap_data';

  await global.RecoveryService._createPreRecoveryBackup('usr_manuel');
  const allKeys = await global.IDBStorage.keys();
  const backupKey = allKeys.find(k => k.startsWith('backup_recovery_pre_execution_'));
  assert.ok(backupKey, 'El respaldo debe guardarse en IDBStorage');
  const backupData = await global.IDBStorage.get(backupKey);
  assert.strictEqual(backupData['key1'], 'val1', 'Debe respaldar claves operativas');
  assert.strictEqual(backupData['backup_old'], undefined, 'NO debe anidar otros respaldos');
  assert.strictEqual(backupData['snapshot_class1'], undefined, 'NO debe anidar snapshots');
  console.log('   ✅ Test 3 Aprobado: Respaldo limpio y seguro en IndexedDB.');

  console.log('\n▶ TEST 4: Batching en guardado de clases desde Firestore (Regla 14)...');
  let batchCalls = 0;
  const originalBatch = global.ClassRepository.saveClassesBatch;
  global.ClassRepository.saveClassesBatch = async (classes, tid, opts) => {
    batchCalls++;
    return originalBatch.call(global.ClassRepository, classes, tid, opts);
  };

  // Simular merge de plan con 5 clases
  const mockPlan = {
    date: '2026-10-25',
    classes: [
      { id: 'c1', subject: 'Matemáticas', grade: '3°', topic: 'Álgebra', sequenceNumber: 1 },
      { id: 'c2', subject: 'Matemáticas', grade: '3°', topic: 'Álgebra', sequenceNumber: 2 },
      { id: 'c3', subject: 'Matemáticas', grade: '3°', topic: 'Álgebra', sequenceNumber: 3 },
      { id: 'c4', subject: 'Matemáticas', grade: '3°', topic: 'Álgebra', sequenceNumber: 4 },
      { id: 'c5', subject: 'Matemáticas', grade: '3°', topic: 'Álgebra', sequenceNumber: 5 }
    ]
  };

  global.FirestoreService._mergeCloudPlanToLocal('usr_manuel', '2026-10-25', mockPlan);
  assert.strictEqual(batchCalls, 1, 'Debe procesar las 5 clases en exactamente 1 llamada batch');
  console.log('   ✅ Test 4 Aprobado: Clases entrantes de Firestore se procesan en lote sin sobrecarga.');

  console.log('\n========================================================');
  console.log('🎉 TODOS LOS TESTS DE PREVENCIÓN DE BLOQUEOS PASARON AL 100%');
  console.log('========================================================\n');
  process.exit(0);
})().catch(err => {
  console.error('❌ ERROR EN TEST:', err);
  process.exit(1);
});
