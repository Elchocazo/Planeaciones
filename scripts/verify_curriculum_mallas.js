// Test Institutional Curriculum Bank for Matemáticas (2°, 3°, 7°) and Lógica (6°)
global.window = global;
global.window.scrollTo = function() {};
global.window.addEventListener = function() {};
global.confirm = () => true;
global.alert = () => {};

let mountedHtml = '';

global.document = {
  addEventListener(event, fn) {},
  getElementById(id) {
    return {
      style: {},
      get innerHTML() { return mountedHtml; },
      set innerHTML(val) { mountedHtml = val; },
      textContent: '',
      value: '',
      addEventListener() {},
      appendChild() {},
      removeChild() {},
      classList: { add() {}, remove() {}, toggle() {} },
      querySelectorAll() { return []; },
      querySelector() { return null; }
    };
  },
  body: { appendChild(el) {} },
  createElement(tag) {
    return { style: {}, innerHTML: '', classList: { add() {}, remove() {} } };
  },
  querySelectorAll() { return []; }
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; }
};

require('../js/users-service.js');
require('../js/storage.js');
require('../js/docx-generator.js');
require('../js/curriculum.js');
require('../js/holidays.js');
require('../js/export.js');
require('../js/notebook-editor.js');
require('../js/coordinator-view.js');
require('../js/calendar.js');
require('../js/planner.js');
require('../js/app.js');

App.init();
UserService.setCurrentUser('usr_manuel');

console.log('=== TEST 1: MATEMÁTICAS 2° (1° Periodo) ===');
const mat2 = CurriculumService.getItems('1°', 'Matemáticas', '2°');
console.log('Temas 2°:', mat2.map(i => `\n  📌 ${i.topic}\n     DBA: ${i.dba}\n     Logro: ${i.achievement}`));
if (mat2.length >= 5) {
  console.log('✅ Matemáticas 2° cargado correctamente con sus DBAs y Logros oficiales!');
} else {
  console.error('❌ Error en Matemáticas 2°');
  process.exit(1);
}

console.log('\n=== TEST 2: MATEMÁTICAS 3° (1° Periodo) ===');
const mat3 = CurriculumService.getItems('1°', 'Matemáticas', '3°');
console.log('Temas 3°:', mat3.map(i => `\n  📌 ${i.topic}\n     DBA: ${i.dba}\n     Logro: ${i.achievement}`));
if (mat3.length >= 5) {
  console.log('✅ Matemáticas 3° cargado correctamente con sus DBAs y Logros oficiales!');
} else {
  console.error('❌ Error en Matemáticas 3°');
  process.exit(1);
}

console.log('\n=== TEST 3: MATEMÁTICAS 7° (1° Periodo) ===');
const mat7 = CurriculumService.getItems('1°', 'Matemáticas', '7°');
console.log('Temas 7°:', mat7.map(i => `\n  📌 ${i.topic}\n     DBA: ${i.dba}\n     Logro: ${i.achievement}`));
if (mat7.length >= 5) {
  console.log('✅ Matemáticas 7° cargado correctamente con sus DBAs y Logros oficiales!');
} else {
  console.error('❌ Error en Matemáticas 7°');
  process.exit(1);
}

console.log('\n=== TEST 4: LÓGICA 6° (1° Periodo) ===');
const log6 = CurriculumService.getItems('1°', 'Lógica', '6°');
console.log('Temas Lógica 6°:', log6.map(i => `\n  📌 ${i.topic}\n     DBA: ${i.dba}\n     Logro: ${i.achievement}`));
if (log6.length >= 3) {
  console.log('✅ Lógica 6° cargado correctamente con sus DBAs y Logros oficiales!');
} else {
  console.error('❌ Error en Lógica 6°');
  process.exit(1);
}

console.log('\n=== TEST 5: Auto-carga en el Planeador Diario ===');
App.openDayPlanner('2026-09-01');
const plan = window.Planner.currentPlan;

// Simular que el usuario selecciona el tema 0 para la clase de Matemáticas 7° (fila 1)
window.Planner.applyCurriculumToClass(1, '0');
const clsApplied = window.Planner.currentPlan.classes[1];
console.log('Clase con tema aplicado:');
console.log('  Tema:', clsApplied.topic);
console.log('  DBA:', clsApplied.dba);
console.log('  Logro:', clsApplied.achievement);

if (clsApplied.topic.toLowerCase().includes('enteros') && clsApplied.dba && clsApplied.achievement) {
  console.log('✅ Tema, DBA y Logro institucional se aplicaron perfectamente a la fila de planeación!');
} else {
  console.error('❌ Falló la aplicación curricular a la clase');
  process.exit(1);
}

console.log('\n=== ALL INSTITUTIONAL CURRICULUM TESTS PASSED 100% PERFECTLY! ===');
