/**
 * TEST SUITE: NAVEGACIÓN HISTÓRICA Y BOTÓN ATRÁS (ROUTER Y VISTAS)
 * Verifica:
 * 1. AppRouter registra el historial de navegación en la pila interna (historyStack) y en HTML5 History API.
 * 2. AppRouter.goBack() retrocede ordenadamente entre secciones (notebook -> editor -> calendar -> dashboard).
 * 3. AppRouter.goBack() en la vista raíz nunca se desborda ni saca al usuario de la aplicación (fallback a dashboard).
 * 4. Control de cambios sin guardar (dirty check) al navegar hacia atrás:
 *    - Si el usuario cancela, se retiene en la vista actual.
 *    - Si el usuario confirma, navega limpiamente.
 * 5. Simulación de popstate (botón físico o del navegador): restaura la vista y parámetros anteriores.
 * 6. Integración de los botones en la interfaz:
 *    - ClassEditorView (cabecera y pie) tienen onclick="ClassEditorView.goBack()" y llaman a AppRouter.goBack().
 *    - NotebookEditor back button tiene onclick="AppRouter.goBack()".
 *    - HistoryView, RecoveryView y SequenceView contienen onclick="AppRouter.goBack()".
 */

const assert = require('assert');

// 1. Mock de entorno de navegador
const memoryStore = {};
global.window = global;
global.window.scrollTo = function() {};

let popstateListeners = [];
global.window.addEventListener = function(event, cb) {
  if (event === 'popstate') popstateListeners.push(cb);
};

// Mock de HTML5 History API
let historyEntries = [];
let currentHistoryIndex = -1;
global.window.history = {
  get length() { return historyEntries.length; },
  pushState(state, title, url) {
    historyEntries = historyEntries.slice(0, currentHistoryIndex + 1);
    historyEntries.push({ state, title, url });
    currentHistoryIndex = historyEntries.length - 1;
  },
  replaceState(state, title, url) {
    if (currentHistoryIndex >= 0 && currentHistoryIndex < historyEntries.length) {
      historyEntries[currentHistoryIndex] = { state, title, url };
    } else {
      historyEntries.push({ state, title, url });
      currentHistoryIndex = 0;
    }
  },
  back() {
    if (currentHistoryIndex > 0) {
      currentHistoryIndex--;
      const entry = historyEntries[currentHistoryIndex];
      const ev = { state: entry.state };
      popstateListeners.forEach(fn => fn(ev));
    }
  }
};

global.window.location = {
  hash: '',
  href: 'http://localhost:8080/index.html'
};

global.localStorage = {
  store: memoryStore,
  getItem(k) { return this.store[k] !== undefined ? this.store[k] : null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { for (let k in this.store) delete this.store[k]; }
};

// Mock de DOM
const elements = {};
function createMockElement(id) {
  return {
    id,
    style: { display: 'none' },
    innerHTML: '',
    textContent: '',
    value: '',
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    },
    querySelectorAll() { return []; },
    querySelector() { return null; }
  };
}

global.document = {
  getElementById(id) {
    if (!elements[id]) {
      elements[id] = createMockElement(id);
    }
    return elements[id];
  },
  querySelectorAll() { return []; },
  body: {
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); }
    }
  }
};

// Mock confirm global
let mockConfirmResult = true;
global.confirm = function(msg) {
  return mockConfirmResult;
};

// Cargar módulos
const AppState = require('../js/core/app-state.js');
global.AppState = AppState;

global.ClassRepository = {
  _classes: {
    'cls_001': { id: 'cls_001', subjectName: 'Ciencias', gradeName: '5°', sequenceNumber: 1, date: '2026-09-22' },
    'cls_dirty_test': { id: 'cls_dirty_test', subjectName: 'Matemáticas', gradeName: '6°', sequenceNumber: 2, date: '2026-09-22' },
    'cls_from_cal': { id: 'cls_from_cal', subjectName: 'Historia', gradeName: '7°', sequenceNumber: 3, date: '2026-09-22' }
  },
  getClass(id) {
    return this._classes[id] || { id, subjectName: 'Materia', gradeName: 'Grado', sequenceNumber: 1, date: '2026-09-22' };
  },
  saveClass() {}
};

global.ClassService = {
  setCurrentEditingClass() {},
  findNextPendingClass() { return null; }
};

global.NotebookEditor = {
  openByClassId() {},
  saveCurrentNotebookContent() {}
};

global.DashboardView = { render() {} };
global.Calendar = { render() {} };
global.SequenceView = { render() {} };
global.HistoryView = { render() {} };
global.RecoveryView = { render() {} };

const AppRouter = require('../js/core/router.js');
global.AppRouter = AppRouter;

const ClassEditorView = require('../js/ui/class-editor-view.js');
global.ClassEditorView = ClassEditorView;

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    failCount++;
  }
}

console.log('================================================================');
console.log('SUITE DE PRUEBAS: NAVEGACIÓN HISTÓRICA Y BOTÓN ATRÁS');
console.log('================================================================\n');

// --- TEST 1: Inicialización de AppRouter e History API ---
console.log('--- TEST 1: Inicialización de AppRouter y estado base ---');
AppRouter.init();
test('AppRouter inicializa con currentView = dashboard', () => {
  assert.strictEqual(AppRouter.currentView, 'dashboard');
});
test('AppRouter registra el estado base en History API', () => {
  assert.strictEqual(historyEntries.length, 1);
  assert.strictEqual(historyEntries[0].state.view, 'dashboard');
  assert.strictEqual(historyEntries[0].state.historyIndex, 0);
});

// --- TEST 2: Navegación y registro en historyStack ---
console.log('\n--- TEST 2: Navegación secuencial y acumulación de historial ---');
AppRouter.navigateTo('calendar');
test('Navega a calendar y apila dashboard', () => {
  assert.strictEqual(AppRouter.currentView, 'calendar');
  assert.strictEqual(AppRouter.historyStack.length, 1);
  assert.strictEqual(AppRouter.historyStack[0].view, 'dashboard');
  assert.strictEqual(historyEntries.length, 2);
  assert.strictEqual(historyEntries[1].state.view, 'calendar');
});

AppRouter.navigateTo('editor', { classId: 'cls_001' });
test('Navega a editor con classId y apila calendar', () => {
  assert.strictEqual(AppRouter.currentView, 'editor');
  assert.strictEqual(AppRouter.historyStack.length, 2);
  assert.strictEqual(AppRouter.historyStack[1].view, 'calendar');
  assert.strictEqual(AppRouter.currentOptions.classId, 'cls_001');
});

AppRouter.navigateTo('notebook', { classId: 'cls_001' });
test('Navega a notebook y apila editor', () => {
  assert.strictEqual(AppRouter.currentView, 'notebook');
  assert.strictEqual(AppRouter.historyStack.length, 3);
  assert.strictEqual(AppRouter.historyStack[2].view, 'editor');
});

// --- TEST 3: Retroceso con AppRouter.goBack() ---
console.log('\n--- TEST 3: Retroceso fluido paso a paso con AppRouter.goBack() ---');
AppRouter.goBack();
test('Desde notebook, goBack() regresa a editor con classId preservado', () => {
  assert.strictEqual(AppRouter.currentView, 'editor');
  assert.strictEqual(AppRouter.currentOptions.classId, 'cls_001');
});

AppRouter.goBack();
test('Desde editor, goBack() regresa a calendar', () => {
  assert.strictEqual(AppRouter.currentView, 'calendar');
});

AppRouter.goBack();
test('Desde calendar, goBack() regresa a dashboard', () => {
  assert.strictEqual(AppRouter.currentView, 'dashboard');
});

AppRouter.goBack();
test('Desde dashboard sin historial, goBack() permanece seguro en dashboard sin desbordar', () => {
  assert.strictEqual(AppRouter.currentView, 'dashboard');
  assert.strictEqual(AppRouter.historyStack.length, 0);
});

// --- TEST 4: Simulación de botón Atrás del navegador (evento popstate) ---
console.log('\n--- TEST 4: Simulación de botón Atrás del navegador (popstate) ---');
AppRouter.navigateTo('sequences');
AppRouter.navigateTo('history');
test('Navegó a sequences y luego history', () => {
  assert.strictEqual(AppRouter.currentView, 'history');
});

// Simular el clic en el botón Atrás del navegador invocando history.back()
window.history.back();
test('Al presionar botón Atrás del navegador, popstate restaura la vista sequences', () => {
  assert.strictEqual(AppRouter.currentView, 'sequences');
});

window.history.back();
test('Al presionar botón Atrás nuevamente, restaura la vista dashboard', () => {
  assert.strictEqual(AppRouter.currentView, 'dashboard');
});

// --- TEST 5: Protección de cambios sin guardar (dirty check) al retroceder ---
console.log('\n--- TEST 5: Dirty check al retroceder con cambios sin guardar ---');
AppRouter.navigateTo('editor', { classId: 'cls_dirty_test' });
AppState.set('isDirty', true);

mockConfirmResult = false; // El usuario cancela ("No salir")
const backResultCancelled = AppRouter.goBack();
test('Si el usuario cancela la confirmación, goBack retorna false y se queda en editor', () => {
  assert.strictEqual(backResultCancelled, false);
  assert.strictEqual(AppRouter.currentView, 'editor');
  assert.strictEqual(AppState.get('isDirty'), true);
});

mockConfirmResult = true; // El usuario confirma ("Salir sin guardar")
const backResultConfirmed = AppRouter.goBack();
test('Si el usuario confirma la salida, navega a la sección anterior y limpia isDirty', () => {
  assert.strictEqual(backResultConfirmed, true);
  assert.strictEqual(AppRouter.currentView, 'dashboard');
  assert.strictEqual(AppState.get('isDirty'), false);
});

// --- TEST 6: Delegación de ClassEditorView.goBack() ---
console.log('\n--- TEST 6: ClassEditorView.goBack() delega en AppRouter.goBack() ---');
AppRouter.navigateTo('calendar');
AppRouter.navigateTo('editor', { classId: 'cls_from_cal' });

ClassEditorView.goBack();
test('ClassEditorView.goBack() regresa exactamente a calendar', () => {
  assert.strictEqual(AppRouter.currentView, 'calendar');
});

// --- TEST 7: Verificación estática de los botones en el código fuente ---
console.log('\n--- TEST 7: Verificación estática de los botones "Volver" en código fuente ---');
const fs = require('fs');
const editorCode = fs.readFileSync('js/ui/class-editor-view.js', 'utf8');
const notebookCode = fs.readFileSync('js/notebook-editor.js', 'utf8');
const historyCode = fs.readFileSync('js/ui/history-view.js', 'utf8');
const recoveryCode = fs.readFileSync('js/ui/recovery-view.js', 'utf8');
const sequenceCode = fs.readFileSync('js/ui/sequence-view.js', 'utf8');

test('ClassEditorView contiene llamadas a ClassEditorView.goBack()', () => {
  assert(editorCode.includes('ClassEditorView.goBack()'));
  assert(editorCode.includes('AppRouter.goBack()'));
});

test('NotebookEditor contiene llamadas a AppRouter.goBack()', () => {
  assert(notebookCode.includes('AppRouter.goBack()'));
});

test('HistoryView contiene botón con AppRouter.goBack()', () => {
  assert(historyCode.includes('AppRouter.goBack()'));
  assert(historyCode.includes('← Volver'));
});

test('RecoveryView contiene botón con AppRouter.goBack()', () => {
  assert(recoveryCode.includes('AppRouter.goBack()'));
  assert(recoveryCode.includes('← Volver'));
});

test('SequenceView contiene botón con AppRouter.goBack()', () => {
  assert(sequenceCode.includes('AppRouter.goBack()'));
  assert(sequenceCode.includes('← Volver'));
});

console.log('\n================================================================');
console.log(`RESULTADO DE PRUEBAS: ${passCount} superadas, ${failCount} fallidas`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
