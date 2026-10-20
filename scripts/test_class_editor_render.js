const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.scrollTo = () => {};

const elements = {};
function createEl(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      style: {},
      innerHTML: '',
      offsetParent: {},
      classList: {
        _classes: new Set(),
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); }
      },
      addEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }
  return elements[id];
}

global.document = {
  readyState: 'complete',
  documentElement: createEl('html'),
  body: createEl('body'),
  getElementById: (id) => createEl(id),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => createEl('el_' + Math.random().toString(36).substr(2, 5)),
  addEventListener: () => {}
};

const storageStore = {};
global.localStorage = {
  getItem: (k) => storageStore[k] || null,
  setItem: (k, v) => { storageStore[k] = String(v); },
  removeItem: (k) => { delete storageStore[k]; },
  clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

const sessionStore = {};
global.sessionStorage = {
  getItem: (k) => sessionStore[k] || null,
  setItem: (k, v) => { sessionStore[k] = String(v); },
  removeItem: (k) => { delete sessionStore[k]; }
};

global.location = {
  protocol: 'https:',
  hostname: 'planeacionesmanuel.web.app',
  hash: '#dashboard',
  search: ''
};
global.history = {
  pushState: () => {},
  replaceState: () => {}
};
global.navigator = { userAgent: 'test' };

// Mock firebase
global.firebase = {
  apps: [],
  initializeApp: () => ({}),
  app: () => ({}),
  firestore: () => ({
    collection: () => ({
      doc: () => ({ set: () => Promise.resolve(), get: () => Promise.resolve({ exists: false }) }),
      where: () => ({ onSnapshot: () => () => {}, get: () => Promise.resolve([]) })
    }),
    enablePersistence: () => Promise.resolve()
  }),
  auth: () => ({})
};
global.firebase.firestore.FieldValue = { serverTimestamp: () => new Date() };

// Evaluamos todos los scripts en orden
const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script\s+src=["']([^"']+)["']/g;
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  const src = m[1].split('?')[0];
  if (src.startsWith('http')) continue;
  try {
    const fullPath = path.join(__dirname, '..', src);
    const code = fs.readFileSync(fullPath, 'utf8');
    eval(code);
  } catch(err) {
    console.error('FATAL ERROR evaluating', src, err);
    process.exit(1);
  }
}

async function testSistemas3() {
  console.log('--- Initializing App ---');
  await App.init();

  // Fecha del martes donde está Sistemas 3° (ej. 2026-10-13)
  DashboardView.selectedDate = '2026-10-13'; // Martes
  DashboardView.render();

  const tid = ClassRepository._getCurrentTeacherId();
  const slots = ScheduleRepository.getSlotsForDate('2026-10-13', tid);
  console.log('Slots on 2026-10-13:', slots.map(s => `${s.time} ${s.subjectName} ${s.gradeName} (${s.id})`));

  const sistemasSlot = slots.find(s => s.subjectName === 'Sistemas' && s.gradeName === '3°');
  if (!sistemasSlot) {
    console.error('Could not find Sistemas 3° slot on Tuesday!');
    process.exit(1);
  }

  console.log('Found slot:', sistemasSlot);
  console.log('Testing openSlotForEditing...');
  try {
    DashboardView.openSlotForEditing(sistemasSlot.id);
    console.log('Current Router View:', AppRouter.currentView);
    console.log('Current Options:', AppRouter.currentOptions);
    console.log('ClassEditorView currentClass:', ClassEditorView.currentClass?.id, ClassEditorView.currentClass?.subjectName, ClassEditorView.currentClass?.gradeName);
    console.log('ClassEditorView HTML length:', ClassEditorView.container.innerHTML.length);
    console.log('Dashboard display:', elements['dashboard-view'].style.display);
    console.log('Editor display:', elements['class-editor-view'].style.display);
    console.log('SUCCESS! ClassEditorView rendered without error.');
  } catch(e) {
    console.error('ERROR in openSlotForEditing for Sistemas 3°:', e);
  }
  process.exit(0);
}

testSistemas3();
