const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.document = {
  readyState: 'complete',
  documentElement: {
    classList: { add: () => {}, remove: () => {}, contains: () => false }
  },
  body: {
    classList: { add: () => {}, remove: () => {}, contains: () => false }
  },
  getElementById: (id) => ({
    id,
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false }
  }),
  addEventListener: () => {}
};
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.location = {
  protocol: 'https:',
  hostname: 'planeacionesmanuel.web.app',
  hash: '#dashboard',
  search: ''
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
    console.log('Successfully evaluated:', src);
  } catch(err) {
    console.error('FATAL ERROR evaluating', src, err);
    process.exit(1);
  }
}
console.log('ALL SCRIPTS EVALUATED WITHOUT ERRORS!');
process.exit(0);
