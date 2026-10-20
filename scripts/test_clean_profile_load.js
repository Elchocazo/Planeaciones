const fs = require('fs');
const path = require('path');

// Simulate clean browser environment
const localStorageData = {};
global.localStorage = {
  getItem: (k) => localStorageData[k] !== undefined ? localStorageData[k] : null,
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; }
};
const sessionStorageData = {};
global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] !== undefined ? sessionStorageData[k] : null,
  setItem: (k, v) => { sessionStorageData[k] = String(v); },
  removeItem: (k) => { delete sessionStorageData[k]; }
};

global.window = global;
global.window.location = {
  protocol: 'https:',
  hostname: 'planeacionesmanuel.web.app',
  hash: '#dashboard',
  search: '',
  pathname: '/'
};
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};

global.document = {
  readyState: 'complete',
  documentElement: {
    classList: { add: (c) => console.log('html class +', c), remove: (c) => console.log('html class -', c), contains: () => false }
  },
  body: {
    classList: { add: (c) => console.log('body class +', c), remove: (c) => console.log('body class -', c), contains: () => false }
  },
  getElementById: (id) => ({
    id,
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    innerHTML: '',
    value: ''
  }),
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => []
};

// Mock firebase
global.firebase = {
  apps: [],
  initializeApp: () => ({}),
  app: () => ({}),
  firestore: () => ({
    collection: () => ({
      doc: () => ({ set: () => Promise.resolve() }),
      where: () => ({ onSnapshot: () => () => {}, get: () => Promise.resolve([]) })
    }),
    enablePersistence: () => Promise.resolve()
  }),
  auth: () => ({})
};
global.firebase.firestore.FieldValue = { serverTimestamp: () => new Date() };

// Load all scripts from index.html in order
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
    console.error('FATAL ERROR IN SCRIPT:', src, err);
    process.exit(1);
  }
}

console.log('Now testing App.init()...');
try {
  if (typeof App !== 'undefined' && App.init) {
    App.init();
    console.log('App.init() executed successfully!');
  }
} catch(err) {
  console.error('FATAL ERROR in App.init():', err);
}
