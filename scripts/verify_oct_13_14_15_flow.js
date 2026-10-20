const fs = require('fs');
const assert = require('assert');

let initialDataContent = fs.readFileSync('js/data/initial-classes-data.js', 'utf8');
initialDataContent = initialDataContent.replace('const INITIAL_CLASSES_DATA =', 'global.INITIAL_CLASSES_DATA =');
eval(initialDataContent);

const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
global.window = { INITIAL_CLASSES_DATA: global.INITIAL_CLASSES_DATA, addEventListener: () => {}, dispatchEvent: () => {} };
global.document = { getElementById: () => ({ offsetParent: {}, innerHTML: '', appendChild: () => {}, querySelector: () => null, querySelectorAll: () => [] }) };

eval(fs.readFileSync('js/core/app-state.js', 'utf8'));
eval(fs.readFileSync('js/storage.js', 'utf8'));
eval(fs.readFileSync('js/repositories/schedule-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/class-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/sequence-repository.js', 'utf8'));
eval(fs.readFileSync('js/services/sequence-service.js', 'utf8'));
eval(fs.readFileSync('js/services/schedule-service.js', 'utf8'));

global.ScheduleRepository = window.ScheduleRepository;
global.ClassRepository = window.ClassRepository;
global.ScheduleService = window.ScheduleService;

ClassRepository.init('usr_manuel');

console.log('====================================');
console.log('MARTES 13 DE OCTUBRE:');
console.log('====================================');
const d13 = ScheduleService.buildDayView('2026-10-13', 'usr_manuel');
d13.scheduledItems.forEach(i => {
  console.log(`[${i.slot.time}] ${i.slot.subjectName} ${i.slot.gradeName} -> isPlanned: ${i.isPlanned}, Seq #${i.classSession?.sequenceNumber}, Topic: ${i.classSession?.topic?.slice(0, 45)}`);
});
assert.strictEqual(d13.scheduledItems.filter(i => i.isPlanned).length, 5, 'Martes 13 debe tener sus 5 clases planeadas');

console.log('\n====================================');
console.log('MIÉRCOLES 14 DE OCTUBRE:');
console.log('====================================');
const d14 = ScheduleService.buildDayView('2026-10-14', 'usr_manuel');
d14.scheduledItems.forEach(i => {
  console.log(`[${i.slot.time}] ${i.slot.subjectName} ${i.slot.gradeName} -> isPlanned: ${i.isPlanned}, Seq #${i.classSession?.sequenceNumber}, Topic: ${i.classSession?.topic?.slice(0, 45)}`);
});
assert.strictEqual(d14.scheduledItems.filter(i => i.isPlanned).length, 3, 'Miércoles 14 debe tener sus 3 clases planeadas');

console.log('\n====================================');
console.log('JUEVES 15 DE OCTUBRE:');
console.log('====================================');
const d15 = ScheduleService.buildDayView('2026-10-15', 'usr_manuel');
d15.scheduledItems.forEach(i => {
  console.log(`[${i.slot.time}] ${i.slot.subjectName} ${i.slot.gradeName} -> isPlanned: ${i.isPlanned}, Seq #${i.classSession?.sequenceNumber}, Topic: ${i.classSession?.topic?.slice(0, 45)}`);
});
assert.strictEqual(d15.scheduledItems.filter(i => i.isPlanned).length, 3, 'Jueves 15 debe tener sus 3 clases planeadas');

console.log('\n✓ RE-VERIFICACIÓN DE MARTES 13 Y MIÉRCOLES 14 TRAS NAVEGACIÓN COMPLETA...');
const d13_again = ScheduleService.buildDayView('2026-10-13', 'usr_manuel');
assert.strictEqual(d13_again.scheduledItems.filter(i => i.isPlanned).length, 5, 'Martes 13 permanece 100% intacto');
const d14_again = ScheduleService.buildDayView('2026-10-14', 'usr_manuel');
assert.strictEqual(d14_again.scheduledItems.filter(i => i.isPlanned).length, 3, 'Miércoles 14 permanece 100% intacto');

console.log('\n¡TODAS LAS VERIFICACIONES DE OCTUBRE 13, 14 Y 15 HAN PASADO AL 100%!');
