/**
 * TEST SUITE: PROPAGACIÓN DIRECTA DEL NÚMERO DE CLASE DESDE EL EDITOR
 * Verifica que al cambiar el número en el campo y pulsar el botón 'Propagar'
 * la clase actual se actualice y las clases posteriores se acomoden consecutivamente (+1, +2, +3...)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TEST SUITE: BOTÓN PROPAGAR NÚMERO DE CLASE EN CLASSEDITORVIEW');
console.log('================================================================\n');

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
      value: '',
      offsetParent: {},
      classList: {
        _classes: new Set(),
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); }
      },
      addEventListener: () => {},
      focus: () => {},
      select: () => {},
      appendChild: function(c) { this.children = this.children || []; this.children.push(c); return c; },
      removeChild: function(c) { if (this.children) { const idx = this.children.indexOf(c); if (idx >= 0) this.children.splice(idx, 1); } return c; },
      querySelector: (sel) => {
        if (sel === '#editor-input-seq-number' || sel.includes('editor-input-seq-num')) return elements['editor-input-seq-number'];
        if (sel === '#editor-btn-propagate-seq') return elements['editor-btn-propagate-seq'];
        return null;
      },
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

// Evaluamos los scripts en orden desde index.html
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

async function runTests() {
  await App.init();

  const tid = ClassRepository._getCurrentTeacherId();
  console.log(`Profesor activo: ${tid}`);

  // Buscamos todas las clases de Sistemas 3° para probar la secuencia
  const allClasses = ClassRepository.getAllClasses(tid);
  const sistemasClasses = allClasses.filter(c => {
    return c.subjectName === 'Sistemas' && c.gradeName === '3°';
  }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  console.log(`Total clases Sistemas 3° encontradas: ${sistemasClasses.length}`);
  assert(sistemasClasses.length >= 3, 'Deben existir al menos 3 clases de Sistemas 3° para probar');

  // Tomamos la segunda clase de la serie
  const targetClass = sistemasClasses[1];
  console.log(`Clase seleccionada para modificar: ID=${targetClass.id}, Fecha=${targetClass.date}, SecuenciaOriginal=${targetClass.sequenceNumber}`);

  // Cargamos la clase en ClassEditorView
  ClassEditorView.loadClass(targetClass.id);
  assert.strictEqual(ClassEditorView.currentClass.id, targetClass.id, 'La clase debe cargarse en ClassEditorView');

  // Verificamos que el HTML contenga el input de clase y el botón 'Propagar'
  const htmlOutput = elements['class-editor-view'].innerHTML;
  assert(htmlOutput.includes('id="editor-input-seq-number"'), 'Debe existir el input editor-input-seq-number');
  assert(htmlOutput.includes('id="editor-btn-propagate-seq"'), 'Debe existir el botón editor-btn-propagate-seq');
  assert(htmlOutput.includes('Propagar'), 'Debe contener el texto Propagar');
  console.log('✅ [PASS] El control de Clase # y el botón Propagar se renderizan en el DOM');

  // Simulación del usuario: el usuario cambia el valor a 16
  const seqInput = document.getElementById('editor-input-seq-number');
  seqInput.value = '16';

  // Simulación: el usuario pincha el botón 'Propagar'
  console.log('Acción: Usuario ingresa 16 y pulsa el botón Propagar...');
  ClassEditorView.propagateCurrentSequenceNumber();

  // 1. Verificamos que la clase actual se actualizó a 16
  assert.strictEqual(ClassEditorView.currentClass.sequenceNumber, 16, 'La clase actual debe tener sequenceNumber = 16');
  assert.strictEqual(ClassEditorView.currentClass.dayNumber, '16', 'La clase actual debe tener dayNumber = 16');

  const repoClass = ClassRepository.getClass(targetClass.id, tid);
  assert.strictEqual(repoClass.sequenceNumber, 16, 'La clase en ClassRepository debe tener sequenceNumber = 16');
  console.log('✅ [PASS] La clase actual fue actualizada a #16 en memoria y en ClassRepository');

  // 2. Verificamos que las clases posteriores se acomodaron consecutivamente: 17, 18, 19...
  const updatedAll = ClassRepository.getAllClasses(tid);
  const updatedSistemas = updatedAll.filter(c => {
    return c.subjectName === 'Sistemas' && c.gradeName === '3°';
  }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  let expectedSeq = 16;
  let subsequentChecked = 0;
  for (const c of updatedSistemas) {
    if (c.date < targetClass.date) {
      // Clases anteriores no deben afectarse
      console.log(`  Clase previa (${c.date}): #${c.sequenceNumber} (intacta)`);
    } else if (c.date === targetClass.date) {
      assert.strictEqual(c.sequenceNumber, 16, 'La clase del día debe ser 16');
      console.log(`  Clase modificada (${c.date}): #${c.sequenceNumber}`);
      expectedSeq = 17;
    } else {
      assert.strictEqual(c.sequenceNumber, expectedSeq, `Clase futura (${c.date}) debió ser #${expectedSeq} pero fue #${c.sequenceNumber}`);
      console.log(`  Clase siguiente reacomodada (${c.date}): #${c.sequenceNumber} (esperada #${expectedSeq})`);
      expectedSeq++;
      subsequentChecked++;
    }
  }

  assert(subsequentChecked > 0, 'Debe haberse reacomodado al menos una clase siguiente');
  console.log(`✅ [PASS] ${subsequentChecked} clases siguientes se acomodaron consecutivamente (+1, +2...)`);

  // 3. Verificamos la persistencia en StorageService
  const allPlans = StorageService.getAllPlans();
  let plansChecked = 0;
  for (const [date, plan] of Object.entries(allPlans)) {
    if (!plan || !Array.isArray(plan.classes)) continue;
    for (const c of plan.classes) {
      if ((c.subject === 'Sistemas' || c.subjectName === 'Sistemas') && (c.grade === '3°' || c.gradeName === '3°')) {
        const repoEquiv = updatedSistemas.find(us => us.id === c.id || us.date === date);
        if (repoEquiv) {
          assert.strictEqual(c.sequenceNumber, repoEquiv.sequenceNumber, `El plan en ${date} debe coincidir con repo`);
          plansChecked++;
        }
      }
    }
  }
  console.log(`✅ [PASS] ${plansChecked} planeaciones en StorageService sincronizadas al 100%`);

  // 4. Verificamos validación con valor inválido
  seqInput.value = '-5';
  let toastShown = false;
  App.showToast = (msg, type) => {
    if (type === 'warning') toastShown = true;
  };
  ClassEditorView.propagateCurrentSequenceNumber();
  assert(toastShown, 'Debe mostrar advertencia si se ingresa número inválido');
  assert.strictEqual(ClassEditorView.currentClass.sequenceNumber, 16, 'El número no debe cambiar ante valor inválido');
  console.log('✅ [PASS] Validación de número positivo estricta y segura');

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE PROPAGACIÓN DE CLASE PASARON CON ÉXITO!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Error en test suite:', err);
  process.exit(1);
});
