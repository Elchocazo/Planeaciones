// Verification test for configurable first day of classes (Clase 1)
global.window = global;
global.window.scrollTo = function() {};
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

console.log('=== TEST 1: Default Start Date (2026-09-01) ===');
const currentStart = StorageService.getAcademicStartDate();
console.log('Fecha de inicio actual:', currentStart);
if (currentStart !== '2026-09-01') {
  console.error('❌ Fecha de inicio esperada 2026-09-01 pero fue:', currentStart);
  process.exit(1);
}

// Abrir 2026-09-01 (Martes: Sistemas 3°, Mat 7°, Mat 7°, Sis 8°, Lógica 6°, Rob 10°, Rob 10°)
App.openDayPlanner('2026-09-01');
const plan1 = window.Planner.currentPlan;
console.log(`Clases en 2026-09-01 (${plan1.classes.length}):`);
plan1.classes.forEach(c => {
  console.log(`  - ${c.subject} (${c.grade}): Clase #${c.dayNumber} | Tema: "${c.topic.substring(0, 30)}..." | DBA: "${c.dba.substring(0, 25)}..."`);
  if (!c.dba || !c.achievement || !c.topic) {
    console.error(`❌ Clase ${c.subject} sin datos cargados`);
    process.exit(1);
  }
});

// Comprobar que en el primer día, la primera clase de cada materia/curso sea Clase #1
const sis3 = plan1.classes.find(c => c.subject === 'Sistemas' && c.grade === '3°');
if (sis3.dayNumber !== '1') {
  console.error('❌ Sistemas 3° debería ser Clase #1 pero es:', sis3.dayNumber);
  process.exit(1);
}
const mat7_1 = plan1.classes.filter(c => c.subject === 'Matemáticas' && c.grade === '7°')[0];
const mat7_2 = plan1.classes.filter(c => c.subject === 'Matemáticas' && c.grade === '7°')[1];
if (mat7_1.dayNumber !== '1' || mat7_2.dayNumber !== '2') {
  console.error('❌ Bloque doble de Matemáticas 7° debería ser Clase #1 y #2 pero es:', mat7_1.dayNumber, mat7_2.dayNumber);
  process.exit(1);
}
console.log('✅ Consecutivos y datos de clase 1 cargados perfectamente para 2026-09-01!');

console.log('\n=== TEST 2: Reconfigurar Primer Día de Clases a otra fecha elegida (ej. 2026-09-08) ===');
// El usuario cambia el inicio de clases a 2026-09-08
App.setAcademicStartDate('2026-09-08');
if (StorageService.getAcademicStartDate() !== '2026-09-08') {
  console.error('❌ No se actualizó la fecha de inicio a 2026-09-08');
  process.exit(1);
}

// Abrir 2026-09-08
App.openDayPlanner('2026-09-08');
const planNewStart = window.Planner.currentPlan;
console.log(`Clases en la nueva fecha de inicio 2026-09-08 (${planNewStart.classes.length}):`);
planNewStart.classes.forEach(c => {
  console.log(`  - ${c.subject} (${c.grade}): Clase #${c.dayNumber} | Tema: "${c.topic.substring(0, 30)}..."`);
  if (!c.dba || !c.achievement || !c.topic) {
    console.error(`❌ Clase ${c.subject} sin datos cargados en nueva fecha`);
    process.exit(1);
  }
});

const newSis3 = planNewStart.classes.find(c => c.subject === 'Sistemas' && c.grade === '3°');
if (newSis3.dayNumber !== '1') {
  console.error('❌ En 2026-09-08, Sistemas 3° debería iniciar en Clase #1 pero es:', newSis3.dayNumber);
  process.exit(1);
}
console.log('✅ La nueva fecha inicia exitosamente en Clase #1 y con todos los datos del curso cargados!');

console.log('\n=== TEST 3: Siguiente día de clases (2026-09-09) continúa el consecutivo ===');
App.openDayPlanner('2026-09-09'); // Miércoles: Mat 3°, Mat 3°, Sis 5°, Mat 7°, Mat 7°
const planNext = window.Planner.currentPlan;
console.log(`Clases en 2026-09-09 (${planNext.classes.length}):`);
planNext.classes.forEach(c => {
  console.log(`  - ${c.subject} (${c.grade}): Clase #${c.dayNumber} | Tema: "${c.topic.substring(0, 30)}..."`);
});

// Mat 7° tuvo clases #1 y #2 el 2026-09-08, por lo que el 2026-09-09 debe ser #3 y #4
const mat7_next1 = planNext.classes.filter(c => c.subject === 'Matemáticas' && c.grade === '7°')[0];
const mat7_next2 = planNext.classes.filter(c => c.subject === 'Matemáticas' && c.grade === '7°')[1];
console.log(`Matemáticas 7° el 09-Sep: #${mat7_next1.dayNumber} y #${mat7_next2.dayNumber}`);
if (mat7_next1.dayNumber !== '3' || mat7_next2.dayNumber !== '4') {
  console.error('❌ Matemáticas 7° debería ser Clase #3 y #4 pero es:', mat7_next1.dayNumber, mat7_next2.dayNumber);
  process.exit(1);
}
console.log('✅ Consecutivo continúa correctamente a Clase #3 y #4 en el día siguiente!');

console.log('\n=== ALL START DATE & CONSECUTIVE TESTS PASSED 100% PERFECTLY! ===');
