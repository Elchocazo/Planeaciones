// Comprehensive verification test for automatic DBA and Desempeños in Planner
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

console.log('=== TEST 1: Automatic DBA & Desempeño when Opening Day Plan ===');
App.openDayPlanner('2026-09-01'); // Martes: Sistemas 3°, Mat 7°, Mat 7°, Sis 8°, Lógica 6°, Robótica 10°, Robótica 10°
const plan = window.Planner.currentPlan;

console.log(`Clases en la fecha (${plan.classes.length}):`);
plan.classes.forEach((c, idx) => {
  console.log(`  [${idx}] ${c.subject} (${c.grade}) - Clase #${c.dayNumber}:`);
  console.log(`      Tema: ${c.topic}`);
  console.log(`      DBA: ${c.dba}`);
  console.log(`      Desempeño: ${c.achievement}`);

  if (!c.dba || !c.achievement || !c.topic) {
    console.error(`❌ Clase [${idx}] no tiene DBA, Desempeño o Tema auto-llenado!`);
    process.exit(1);
  }
});
console.log('✅ Todas las clases se auto-llenaron con DBA y Desempeños automáticamente!');

console.log('\n=== TEST 2: Automatic update when changing Period (1° -> 2°) ===');
window.Planner.handlePeriodChange('2°');
const planP2 = window.Planner.currentPlan;
const sis3P2 = planP2.classes[0];
console.log(`Sistemas 3° en 2° Periodo:`);
console.log(`  Tema: ${sis3P2.topic}`);
console.log(`  DBA: ${sis3P2.dba}`);
console.log(`  Desempeño: ${sis3P2.achievement}`);

if (!sis3P2.topic.toLowerCase().includes('imágenes') && !sis3P2.topic.toLowerCase().includes('imagen')) {
  console.error('❌ No se actualizó automáticamente el tema para Sistemas 3° Periodo 2:', sis3P2.topic);
  process.exit(1);
}
console.log('✅ Cambio de periodo actualizó automáticamente DBA y Desempeños!');

console.log('\n=== TEST 3: Automatic update when changing Subject in a row ===');
window.Planner.onSubjectChange(0, 'Robótica');
const row0 = window.Planner.currentPlan.classes[0];
console.log(`Fila cambiada a Robótica:`);
console.log(`  Materia: ${row0.subject}, Grado: ${row0.grade}`);
console.log(`  Tema: ${row0.topic}`);
console.log(`  DBA: ${row0.dba}`);
console.log(`  Desempeño: ${row0.achievement}`);

if (!row0.dba || !row0.achievement || row0.subject !== 'Robótica') {
  console.error('❌ Error en auto-completado al cambiar materia');
  process.exit(1);
}
console.log('✅ Cambio de asignatura auto-llenó DBA y Desempeños automáticamente!');

console.log('\n=== TEST 4: Automatic update when changing Grade in a row ===');
window.Planner.onGradeChange(0, '11°');
const row0_11 = window.Planner.currentPlan.classes[0];
console.log(`Fila cambiada a Grado 11°:`);
console.log(`  Materia: ${row0_11.subject}, Grado: ${row0_11.grade}`);
console.log(`  Tema: ${row0_11.topic}`);
console.log(`  DBA: ${row0_11.dba}`);
console.log(`  Desempeño: ${row0_11.achievement}`);

if (!row0_11.topic.toLowerCase().includes('microcontroladores') && !row0_11.topic.toLowerCase().includes('sensores')) {
  console.error('❌ Error en auto-completado al cambiar grado para Robótica 11°');
  process.exit(1);
}
console.log('✅ Cambio de grado auto-llenó DBA y Desempeños automáticamente!');

console.log('\n=== TEST 5: Verify all Sistemas (1°-8°) and Robótica (9°-11°) in Curriculum Bank ===');
const gradesSis = ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°'];
const periods = ['1°', '2°', '3°', '4°'];

gradesSis.forEach(g => {
  periods.forEach(p => {
    const items = CurriculumService.getItems(p, 'Sistemas', g);
    if (!items || items.length === 0) {
      console.error(`❌ Falta malla para Sistemas ${g} en periodo ${p}`);
      process.exit(1);
    }
  });
});
console.log('✅ Sistemas (1° a 8°) 100% verificado en todos los 4 periodos!');

const gradesRob = ['9°', '10°', '11°'];
gradesRob.forEach(g => {
  periods.forEach(p => {
    const items = CurriculumService.getItems(p, 'Robótica', g);
    if (!items || items.length === 0) {
      console.error(`❌ Falta malla para Robótica ${g} en periodo ${p}`);
      process.exit(1);
    }
  });
});
console.log('✅ Robótica (9°, 10°, 11°) 100% verificado en todos los 4 periodos!');

console.log('\n=== ALL AUTOMATIC CURRICULUM TESTS PASSED 100% PERFECTLY! ===');
