const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Simulate DOM and Browser environment
const localStorageStore = {};
global.localStorage = {
  getItem: k => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: k => delete localStorageStore[k],
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; }
};

const sessionStorageStore = {};
global.sessionStorage = {
  getItem: k => sessionStorageStore[k] || null,
  setItem: (k, v) => { sessionStorageStore[k] = String(v); },
  removeItem: k => delete sessionStorageStore[k],
  clear: () => { for (const k in sessionStorageStore) delete sessionStorageStore[k]; }
};

const elements = {};
function getOrCreateElement(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      innerHTML: '',
      innerText: '',
      value: '',
      style: {},
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      getAttribute: () => null,
      setAttribute: () => {},
      querySelectorAll: () => [],
      querySelector: () => null,
      focus: () => {}
    };
  }
  return elements[id];
}

const listeners = {};
global.document = {
  readyState: 'loading',
  getElementById: (id) => getOrCreateElement(id),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => ({
    tagName: tag,
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    appendChild: () => {},
    addEventListener: () => {}
  }),
  body: getOrCreateElement('body'),
  documentElement: getOrCreateElement('html'),
  addEventListener: (event, handler) => {
    listeners[event] = listeners[event] || [];
    listeners[event].push(handler);
  }
};

global.window = global;
global.window.location = { protocol: 'http:', hostname: 'planeacionesmanuel.web.app', pathname: '/', hash: '' };
global.window.addEventListener = (event, handler) => {
  listeners[event] = listeners[event] || [];
  listeners[event].push(handler);
};
global.window.dispatchEvent = (evt) => {
  const list = listeners[evt.name || evt.type] || [];
  list.forEach(h => h(evt));
};
global.window.scrollTo = () => {};
global.window.history = {
  replaceState: () => {},
  pushState: () => {}
};

global.CustomEvent = class {
  constructor(name, detail) {
    this.name = name;
    this.type = name;
    this.detail = detail;
  }
};

global.navigator = { onLine: true };

// Mock Firebase SDK
const mockDb = {
  collection: (name) => ({
    doc: (id) => ({
      id,
      path: `${name}/${id}`,
      get: async () => ({ exists: false, data: () => null }),
      set: async () => {},
      delete: async () => {}
    }),
    where: () => ({
      get: async () => [],
      onSnapshot: () => () => {}
    })
  }),
  settings: () => {},
  enablePersistence: async () => {}
};

global.firebase = {
  apps: [],
  initializeApp: () => ({}),
  app: () => ({}),
  firestore: () => mockDb
};
global.firebase.firestore.FieldValue = {
  serverTimestamp: () => 'SERVER_TIMESTAMP'
};

const scriptFiles = [
  'js/firebase-config.js',
  'js/idb-storage.js',
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

async function testInit() {
  console.log('Executing scripts in browser context...');
  for (const f of scriptFiles) {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    vm.runInThisContext(code, { filename: f });
  }

  console.log('\nTriggering DOMContentLoaded...');
  const domHandlers = listeners['DOMContentLoaded'] || [];
  console.log(`Found ${domHandlers.length} DOMContentLoaded handlers.`);
  for (let i = 0; i < domHandlers.length; i++) {
    console.log(`Executing handler ${i + 1}...`);
    const start = Date.now();
    await domHandlers[i]();
    console.log(`Handler ${i + 1} took ${Date.now() - start}ms.`);
  }

  console.log('\nApp state after DOMContentLoaded:');
  console.log('- AppRouter.currentView:', global.AppRouter ? global.AppRouter.currentView : 'undefined');
  console.log('- FirestoreService.status:', global.FirestoreService ? global.FirestoreService.status : 'undefined');
  console.log('- FirestoreService.statusMessage:', global.FirestoreService ? global.FirestoreService.statusMessage : 'undefined');
  console.log('- ClassRepository initialized:', global.ClassRepository ? global.ClassRepository._isInitialized : 'undefined');
  console.log('- PlanRepository initialized:', global.PlanRepository ? global.PlanRepository._isInitialized : 'undefined');

  console.log('\nTesting AppRouter.navigateTo("calendar")...');
  const navRes = global.AppRouter.navigateTo('calendar');
  console.log('Navigate result:', navRes);
  console.log('AppRouter.currentView now:', global.AppRouter.currentView);
  console.log('\n✅ BROWSER LOAD AND NAVIGATION SIMULATION COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

testInit().catch(err => {
  console.error('CRASH DURING INIT:', err);
});
