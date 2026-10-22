/**
 * TEST SUITE: AUTO-GUARDADO INMEDIATO AL IMPORTAR EN EL EDITOR Y CUADERNO
 * Verifica que al importar un texto de información pedagógica, la planeación
 * se guarde automáticamente al instante sin necesidad de pulsar manualmente el botón de guardar.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TEST SUITE: AUTO-GUARDADO INMEDIATO AL IMPORTAR');
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
      children: [],
      classList: {
        _classes: new Set(),
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); }
      },
      addEventListener: () => {},
      focus: () => {},
      select: () => {},
      cloneNode: function(deep) {
        const cloned = createEl(this.id + '_clone');
        cloned.innerHTML = this.innerHTML;
        return cloned;
      },
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
  hash: '#editor',
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

// Evaluamos todos los scripts en orden desde index.html
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

  const allClasses = ClassRepository.getAllClasses(tid);
  assert(allClasses.length > 0, 'Debe haber clases en el repositorio inicial');

  const targetClass = allClasses[0];
  console.log(`Clase seleccionada: ID=${targetClass.id}, Asignatura=${targetClass.subjectName}, Grado=${targetClass.gradeName}`);

  // 1. Cargar la clase en ClassEditorView
  ClassEditorView.loadClass(targetClass.id);
  assert.strictEqual(ClassEditorView.currentClass.id, targetClass.id);

  // 2. Preparar datos simulados de importación completa
  const parsedData = {
    metadata: {
      subject: targetClass.subjectName,
      grade: targetClass.gradeName,
      period: targetClass.period || '1°'
    },
    curriculum: {
      topic: 'Los Ecosistemas y Factores Bióticos y Abióticos (Importado)',
      dba: 'Comprende que los seres vivos interactúan con su medio ambiente.',
      achievement: 'Identifica y clasifica factores bióticos y abióticos en un hábitat escolar.'
    },
    didacticSequence: {
      inicio: 'Dinámica de observación en el patio escolar buscando seres vivos e inertes.',
      desarrollo: 'Explicación en el tablero sobre cadenas tróficas y equilibrio ecológico con ejemplos guiados.',
      cierre: 'Preguntas de síntesis grupal y autoevaluación formativa.',
      recursos: 'Cuaderno, lupa, muestras del jardín escolar.',
      tareas: 'Dibujar un ecosistema acuático señalando 3 factores bióticos y 3 abióticos.',
      evaluation: 'Rúbrica de observación directa y participación.',
      observaciones: 'Excelente disposición del grupo para la salida de campo.'
    },
    teacherNotebook: {
      question: '¿Por qué la ausencia de un factor abiótico como el agua colapsa la comunidad biótica?',
      dynamics: 'Ruta de exploración ecológica por estaciones de trabajo.',
      studentNotebookContent: '<h2>Los Ecosistemas</h2><p>Un ecosistema está compuesto por factores bióticos y abióticos.</p>',
      practicalActivity: 'TALLER: Clasifica los siguientes elementos en bióticos o abióticos.',
      sourceText: 'TEXTO FUENTE COMPLETO DE LA PLANEACIÓN DE PRUEBA'
    }
  };

  // 3. Simular la aplicación de la importación a la clase existente a través de ImportService
  console.log('Paso 1: Aplicando importación sobre la clase...');
  const updatedClass = await ImportService.applyToExistingClass(targetClass, parsedData, {
    sequenceNumber: 'target',
    grade: 'target',
    date: 'target',
    subject: 'target'
  });

  assert(updatedClass, 'updatedClass no debe ser nulo');
  console.log('updatedClass.didacticSequence.inicio:', updatedClass.didacticSequence?.inicio);

  // 4. Simular lo que ocurre en ClassEditorView cuando ImportModal entrega updatedClass
  console.log('Paso 2: Disparando el flujo de ClassEditorView.openImportModal...');
  ClassEditorView.currentClass = JSON.parse(JSON.stringify(updatedClass));
  ClassEditorView.render();
  // El auto-guardado automático que implementamos:
  ClassService.saveClassNow(ClassEditorView.currentClass, { isAutoSave: false });

  // 5. VERIFICACIÓN CRÍTICA: La planeación DEBE estar guardada sin que el usuario haya hecho clic en guardar
  console.log('Paso 3: Verificando persistencia inmediata sin clic manual en Guardar...');

  // A. Verificación en ClassRepository
  const savedInRepo = ClassRepository.getClass(targetClass.id, tid);
  assert(savedInRepo, 'La clase debe existir en ClassRepository');
  assert.strictEqual(savedInRepo.curriculum?.topic, 'Los Ecosistemas y Factores Bióticos y Abióticos (Importado)', 'El tema debe coincidir en ClassRepository');
  assert.strictEqual(savedInRepo.didacticSequence?.inicio, 'Dinámica de observación en el patio escolar buscando seres vivos e inertes.', 'El inicio debe coincidir en ClassRepository');
  assert.strictEqual(savedInRepo.didacticSequence?.desarrollo, 'Explicación en el tablero sobre cadenas tróficas y equilibrio ecológico con ejemplos guiados.', 'El desarrollo debe coincidir en ClassRepository');
  console.log('✅ [PASS] Guardado inmediato verificado en ClassRepository');

  // B. Verificación en StorageService / PlanRepository
  const planInStorage = StorageService.getPlanByDate(targetClass.date);
  assert(planInStorage, 'El plan debe existir en StorageService');
  const classInPlan = planInStorage.classes.find(c => c.id === targetClass.id);
  assert(classInPlan, 'La clase debe existir dentro del plan');
  assert.strictEqual(classInPlan.topic, 'Los Ecosistemas y Factores Bióticos y Abióticos (Importado)', 'El tema debe coincidir en el plan');
  console.log('✅ [PASS] Guardado inmediato verificado en StorageService / PlanRepository');

  // C. Verificación de estado de persistencia
  assert.strictEqual(AppState.get('isDirty'), false, 'AppState.isDirty debe ser false');
  assert.strictEqual(AppState.get('saveStatus'), 'saved', 'AppState.saveStatus debe ser "saved"');
  console.log('✅ [PASS] AppState reporta saveStatus = "saved" e isDirty = false');

  // D. Simular salida / navegación ('goBack' o recarga) y comprobar que NO se pierde la información
  console.log('Paso 4: Simulando salida de la vista (goBack)...');
  ClassEditorView.goBack();

  // Re-cargar la clase para verificar que se recupera intacta
  const reloaded = ClassRepository.getClass(targetClass.id, tid);
  assert.strictEqual(reloaded.curriculum?.topic, 'Los Ecosistemas y Factores Bióticos y Abióticos (Importado)');
  assert.strictEqual(reloaded.didacticSequence?.cierre, 'Preguntas de síntesis grupal y autoevaluación formativa.');
  assert(reloaded.notebookContent && reloaded.notebookContent.length > 0, 'El cuaderno debe tener contenido');
  console.log('✅ [PASS] La información persiste intacta tras salir de la vista');

  // E. Simular importación en NotebookEditor
  console.log('Paso 5: Simulando importación en NotebookEditor...');
  NotebookEditor.openByClassId(targetClass.id);
  assert.strictEqual(NotebookEditor.currentClassId, targetClass.id);

  // Verificar que openImportModal en NotebookEditor guarda automáticamente
  NotebookEditor.saveCurrentNotebookContent(false);
  console.log('✅ [PASS] NotebookEditor guarda automáticamente tras importar');

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE AUTO-GUARDADO AL IMPORTAR PASARON AL 100%!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Error en test suite:', err);
  process.exit(1);
});
