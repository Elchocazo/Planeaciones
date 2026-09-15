// Verify Matemáticas 8° auto-fill
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

console.log('=== TEST SCENARIO: User changes grade to 8° for Matemáticas ===');
App.openDayPlanner('2026-09-02');

// Cambiar la fila 0 a Matemáticas y grado 8°
window.Planner.onSubjectChange(0, 'Matemáticas');
window.Planner.onGradeChange(0, '8°');

const row = window.Planner.currentPlan.classes[0];
console.log('Clase cambiada a Matemáticas 8°:');
console.log('  Subject:', row.subject);
console.log('  Grade:', row.grade);
console.log('  Class #:', row.dayNumber);
console.log('  Topic:', row.topic);
console.log('  DBA:', row.dba);
console.log('  Achievement:', row.achievement);

if (!row.dba || !row.achievement || !row.topic) {
  console.error('❌ Error: DBA, logro o tema quedaron vacíos para Matemáticas 8°!');
  process.exit(1);
}

if (!row.topic.includes('reales') && !row.topic.includes('racionales')) {
  console.error('❌ Error: El tema no corresponde a Matemáticas 8°:', row.topic);
  process.exit(1);
}

console.log('✅ Matemáticas 8° cargó correctamente el DBA y Desempeño institucional!');
