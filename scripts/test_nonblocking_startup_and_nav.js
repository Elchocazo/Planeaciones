/**
 * TEST AUTOMATIZADO: Regla 13 - Desacoplamiento de Firestore, Arranque No Bloqueante y Navegación Fluida
 */

const assert = require('assert');

// Mocks de entorno DOM y navegador
const elementsMap = {};
function createMockElement(id) {
  return {
    id,
    style: { display: 'none' },
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    },
    innerHTML: '',
    textContent: '',
    querySelectorAll: () => [],
    querySelector: () => null,
    offsetParent: {},
    appendChild: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {}
  };
}

['dashboard-view', 'calendar-view', 'class-editor-view', 'planner-view', 
 'sequences-view', 'history-view', 'recovery-view', 'notebook-view',
 'settings-modal-backdrop', 'firestore-cloud-status-badge', 'main-app-nav'].forEach(id => {
  elementsMap[id] = createMockElement(id);
});

global.document = {
  getElementById: (id) => elementsMap[id] || null,
  querySelectorAll: () => [],
  querySelector: () => null,
  body: createMockElement('body'),
  documentElement: createMockElement('html'),
  addEventListener: () => {}
};

const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; }
};
global.sessionStorage = global.localStorage;

global.window = {
  location: { hash: '#dashboard', protocol: 'http:', hostname: 'localhost', pathname: '/' },
  history: {
    replaceState: () => {},
    pushState: () => {}
  },
  scrollTo: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {}
};

// Cargar AppRouter
const AppRouter = require('../js/core/router.js');

console.log('🧪 ========================================================');
console.log('🧪 SUITE: ARRANQUE NO BLOQUEANTE Y NAVEGACIÓN FLUIDA (REGLA 13)');
console.log('🧪 ========================================================');

// TEST 1: AppRouter se inicializa y vincula contenedores correctamente
console.log('\n▶ TEST 1: Inicialización de AppRouter y vinculación de contenedores...');
AppRouter.init();
assert.strictEqual(AppRouter.currentView, 'dashboard', 'La vista inicial debe ser dashboard');
assert.ok(AppRouter.viewContainers.calendar, 'El contenedor de calendar debe estar vinculado');
assert.ok(AppRouter.viewContainers.sequences, 'El contenedor de sequences debe estar vinculado');
console.log('   ✅ Test 1 Aprobado: Contenedores vinculados e inicializados.');

// TEST 2: Navegación instantánea a todas las secciones principales
console.log('\n▶ TEST 2: Navegación fluida a todas las secciones sin bloqueo...');
const navTargets = ['calendar', 'sequences', 'history', 'recovery', 'dashboard'];
for (const target of navTargets) {
  const navigated = AppRouter.navigateTo(target);
  assert.ok(navigated, `Debe permitir navegar a ${target}`);
  assert.strictEqual(AppRouter.currentView, target, `currentView debe ser ${target}`);
  assert.ok(elementsMap[`${target}-view`].style.display !== 'none', `El contenedor ${target}-view debe mostrarse`);
}
console.log('   ✅ Test 2 Aprobado: Navegación fluida y visibilidad correcta para todas las vistas.');

// TEST 3: Mutex de FirestoreService.init() previene llamadas concurrentes múltiples
console.log('\n▶ TEST 3: Mutex y singleton en FirestoreService.init()...');
global.firebase = {
  apps: [],
  initializeApp: () => ({ name: '[DEFAULT]' }),
  app: () => ({ name: '[DEFAULT]' }),
  firestore: () => ({
    settings: () => {},
    enablePersistence: async () => new Promise(res => setTimeout(res, 50)),
    collection: () => ({
      where: () => ({
        onSnapshot: () => () => {}
      }),
      doc: () => ({
        get: async () => ({ exists: false }),
        set: async () => {},
        delete: async () => {}
      })
    })
  })
};
global.FirebaseConfigManager = {
  getConfig: () => ({ projectId: 'test-project-123' })
};

const FirestoreService = require('../js/services/firestore-service.js');
const p1 = FirestoreService.init();
const p2 = FirestoreService.init();
const p3 = FirestoreService.init();

assert.strictEqual(p1, p2, 'La segunda llamada a init() debe retornar exactamente la misma promesa');
assert.strictEqual(p2, p3, 'La tercera llamada a init() debe retornar exactamente la misma promesa');
console.log('   ✅ Test 3 Aprobado: Mutex _initPromise previene ejecuciones concurrentes y carreras.');

// TEST 4: Inicialización asíncrona desacoplada resuelve sin bloquear
(async () => {
  const result = await p1;
  assert.strictEqual(result, true, 'FirestoreService debe inicializarse exitosamente');
  assert.strictEqual(FirestoreService.isReady(), true, 'FirestoreService debe reportar isReady() === true');
  console.log('   ✅ Test 4 Aprobado: FirestoreService conectado con éxito sin bloquear navegación.');

  // TEST 5: Navegación sigue 100% activa después de conectar Firestore
  console.log('\n▶ TEST 5: Navegación post-conexión de Firestore...');
  AppRouter.navigateTo('calendar');
  assert.strictEqual(AppRouter.currentView, 'calendar');
  AppRouter.navigateTo('dashboard');
  assert.strictEqual(AppRouter.currentView, 'dashboard');
  console.log('   ✅ Test 5 Aprobado: Navegación continúa operativa al 100% con Firestore conectado.');

  console.log('\n========================================================');
  console.log('🎉 TODOS LOS TESTS DE ARRANQUE Y NAVEGACIÓN PASARON AL 100%');
  console.log('========================================================\n');
})();
