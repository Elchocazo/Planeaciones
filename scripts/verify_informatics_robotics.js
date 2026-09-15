// Test Verification for Informatics, Technology and Robotics Curriculums
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

console.log('=== TEST 1: SISTEMAS / INFORMÁTICA 7° (1° Periodo - Ofimática & Nube) ===');
const sis7_1 = CurriculumService.getItems('1°', 'Sistemas', '7°');
console.log('Temas 1° Periodo:', sis7_1.map(i => `\n  📌 ${i.topic}\n     Logro: ${i.achievement}`));
if (sis7_1.length >= 5) {
  console.log('✅ Sistemas 7° (1° Periodo) cargado correctamente!');
} else {
  console.error('❌ Error en Sistemas 7° 1° Periodo');
  process.exit(1);
}

console.log('\n=== TEST 2: SISTEMAS / INFORMÁTICA 7° (2° Periodo - Scratch & Algoritmos) ===');
const sis7_2 = CurriculumService.getItems('2°', 'Sistemas', '7°');
console.log('Temas 2° Periodo:', sis7_2.map(i => `\n  📌 ${i.topic}\n     Logro: ${i.achievement}`));
if (sis7_2.length >= 5) {
  console.log('✅ Sistemas 7° (2° Periodo) cargado correctamente!');
} else {
  console.error('❌ Error en Sistemas 7° 2° Periodo');
  process.exit(1);
}

console.log('\n=== TEST 3: SISTEMAS / TECNOLOGÍA 7° (3° Periodo - Electrónica & Ley de Ohm) ===');
const sis7_3 = CurriculumService.getItems('3°', 'Sistemas', '7°');
console.log('Temas 3° Periodo:', sis7_3.map(i => `\n  📌 ${i.topic}\n     Logro: ${i.achievement}`));
if (sis7_3.length >= 5) {
  console.log('✅ Sistemas 7° (3° Periodo) cargado correctamente!');
} else {
  console.error('❌ Error en Sistemas 7° 3° Periodo');
  process.exit(1);
}

console.log('\n=== TEST 4: SISTEMAS / ROBÓTICA 7° (4° Periodo - Robótica & Automatización) ===');
const sis7_4 = CurriculumService.getItems('4°', 'Sistemas', '7°');
console.log('Temas 4° Periodo:', sis7_4.map(i => `\n  📌 ${i.topic}\n     Logro: ${i.achievement}`));
if (sis7_4.length >= 5) {
  console.log('✅ Sistemas 7° (4° Periodo) cargado correctamente!');
} else {
  console.error('❌ Error en Sistemas 7° 4° Periodo');
  process.exit(1);
}

console.log('\n=== TEST 5: ROBÓTICA 9° y 10° ===');
const rob9 = CurriculumService.getItems('1°', 'Robótica', '9°');
const rob10 = CurriculumService.getItems('1°', 'Robótica', '10°');
console.log('Robótica 9°:', rob9.map(i => i.topic));
console.log('Robótica 10°:', rob10.map(i => i.topic));
if (rob9.length > 0 && rob10.length > 0) {
  console.log('✅ Robótica 9° y 10° cargados correctamente!');
} else {
  console.error('❌ Error en Robótica');
  process.exit(1);
}

console.log('\n=== ALL INFORMATICS AND ROBOTICS TESTS PASSED 100% PERFECTLY! ===');
