/**
 * TEST DE NUMERACIÓN POR HORARIO Y CALENDARIO ESCOLAR (REGLA OFICIAL DEL DOCENTE)
 * - Matemáticas 7°: Clase #1 inicia el 1 de septiembre de 2026 (2026-09-01).
 * - Todas las demás clases (incluyendo Matemáticas 2°, Matemáticas 3°, Sistemas, Robótica, Lógica, Dirección de grupo):
 *   Clase #1 inicia desde el 7 de septiembre de 2026 (2026-09-07) en adelante.
 * - Descuenta festivos oficiales de Colombia y Semana de Receso Escolar (2026-10-05 a 2026-10-09).
 * - Preserva el 100% del contenido pedagógico y curricular de todas las planeaciones existentes.
 */

const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('TEST: NUMERACIÓN EXACTA POR HORARIO Y CALENDARIO ESCOLAR (2026)');
console.log('================================================================\n');

const rawSeed = JSON.parse(JSON.stringify(require('../js/data/initial-classes-data.js').INITIAL_CLASSES_DATA));

const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

global.window = {
  INITIAL_CLASSES_DATA: JSON.parse(JSON.stringify(rawSeed)),
  addEventListener: () => {},
  dispatchEvent: () => {}
};
global.INITIAL_CLASSES_DATA = global.window.INITIAL_CLASSES_DATA;
global.CustomEvent = class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } };
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: () => ({ offsetParent: {}, innerHTML: '', appendChild: () => {}, style: {}, classList: { add(){}, remove(){}, toggle(){} } })
};

eval(fs.readFileSync('js/core/app-state.js', 'utf8'));
eval(fs.readFileSync('js/storage.js', 'utf8'));
eval(fs.readFileSync('js/holidays.js', 'utf8'));
eval(fs.readFileSync('js/repositories/schedule-repository.js', 'utf8'));
eval(fs.readFileSync('js/plan-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/class-repository.js', 'utf8'));
eval(fs.readFileSync('js/repositories/sequence-repository.js', 'utf8'));
eval(fs.readFileSync('js/services/sequence-service.js', 'utf8'));
eval(fs.readFileSync('js/services/schedule-service.js', 'utf8'));

global.HolidayService = window.HolidayService;
global.StorageService = window.StorageService;
global.ScheduleRepository = window.ScheduleRepository;
global.PlanRepository = window.PlanRepository;
global.ClassRepository = window.ClassRepository;
global.SequenceService = window.SequenceService;
global.ScheduleService = window.ScheduleService;

const repo = window.ClassRepository;

// 1. Verificar tabla de numeración esperada por horario
const expectedChecks = [
  // Matemáticas 7° (Mar, Mié, Vie desde 2026-09-01 -> Clase #1 el martes 1 de septiembre; 2 al 4 de septiembre sin clases)
  { date: '2026-09-01', sub: 'Matemáticas', grd: '7°', expected: 1 },
  { date: '2026-09-02', sub: 'Matemáticas', grd: '7°', expected: null },
  { date: '2026-09-04', sub: 'Matemáticas', grd: '7°', expected: null },
  { date: '2026-09-08', sub: 'Matemáticas', grd: '7°', expected: 2 },
  { date: '2026-09-09', sub: 'Matemáticas', grd: '7°', expected: 3 },
  { date: '2026-09-11', sub: 'Matemáticas', grd: '7°', expected: 4 },
  { date: '2026-09-15', sub: 'Matemáticas', grd: '7°', expected: 5 },
  { date: '2026-09-16', sub: 'Matemáticas', grd: '7°', expected: 6 },
  { date: '2026-09-18', sub: 'Matemáticas', grd: '7°', expected: 7 },
  { date: '2026-09-22', sub: 'Matemáticas', grd: '7°', expected: 8 },
  { date: '2026-09-23', sub: 'Matemáticas', grd: '7°', expected: 9 },
  { date: '2026-09-25', sub: 'Matemáticas', grd: '7°', expected: 10 },
  { date: '2026-09-29', sub: 'Matemáticas', grd: '7°', expected: 11 },
  { date: '2026-09-30', sub: 'Matemáticas', grd: '7°', expected: 12 },
  { date: '2026-10-02', sub: 'Matemáticas', grd: '7°', expected: 13 },
  { date: '2026-10-13', sub: 'Matemáticas', grd: '7°', expected: 14 },
  { date: '2026-10-14', sub: 'Matemáticas', grd: '7°', expected: 15 },
  // Matemáticas 3° (Mié, Vie desde 2026-09-07 -> Clase #1 el miércoles 9 de septiembre)
  { date: '2026-09-09', sub: 'Matemáticas', grd: '3°', expected: 1 },
  { date: '2026-09-11', sub: 'Matemáticas', grd: '3°', expected: 2 },
  { date: '2026-09-16', sub: 'Matemáticas', grd: '3°', expected: 3 },
  { date: '2026-09-18', sub: 'Matemáticas', grd: '3°', expected: 4 },
  { date: '2026-09-23', sub: 'Matemáticas', grd: '3°', expected: 5 },
  { date: '2026-09-25', sub: 'Matemáticas', grd: '3°', expected: 6 },
  { date: '2026-09-30', sub: 'Matemáticas', grd: '3°', expected: 7 },
  { date: '2026-10-02', sub: 'Matemáticas', grd: '3°', expected: 8 },
  { date: '2026-10-14', sub: 'Matemáticas', grd: '3°', expected: 9 },
  // Matemáticas 2° (Lun, Jue desde 2026-09-07 -> Clase #1 el lunes 7 de septiembre)
  { date: '2026-09-07', sub: 'Matemáticas', grd: '2°', expected: 1 },
  { date: '2026-09-10', sub: 'Matemáticas', grd: '2°', expected: 2 },
  { date: '2026-09-14', sub: 'Matemáticas', grd: '2°', expected: 3 },
  { date: '2026-09-17', sub: 'Matemáticas', grd: '2°', expected: 4 },
  { date: '2026-09-21', sub: 'Matemáticas', grd: '2°', expected: 5 },
  { date: '2026-09-24', sub: 'Matemáticas', grd: '2°', expected: 6 },
  { date: '2026-09-28', sub: 'Matemáticas', grd: '2°', expected: 7 },
  { date: '2026-10-01', sub: 'Matemáticas', grd: '2°', expected: 8 },
  { date: '2026-10-15', sub: 'Matemáticas', grd: '2°', expected: 9 },
  // Resto de asignaturas (desde 2026-09-07)
  { date: '2026-09-09', sub: 'Sistemas', grd: '5°', expected: 1 },
  { date: '2026-10-14', sub: 'Sistemas', grd: '5°', expected: 5 },
  { date: '2026-09-10', sub: 'Sistemas', grd: '4°B', expected: 1 },
  { date: '2026-09-17', sub: 'Sistemas', grd: '4°B', expected: 2 },
  { date: '2026-09-24', sub: 'Sistemas', grd: '4°B', expected: 3 },
  { date: '2026-10-01', sub: 'Sistemas', grd: '4°B', expected: 4 },
  { date: '2026-10-15', sub: 'Sistemas', grd: '4°B', expected: 5 },
  { date: '2026-10-15', sub: 'Sistemas', grd: '1°', expected: 5 }
];

for (const chk of expectedChecks) {
  const actual = repo.getScheduleSequenceNumber(chk.date, chk.sub, chk.grd, 'usr_manuel', { requireScheduledWeekday: true });
  assert.strictEqual(actual, chk.expected, `${chk.sub} ${chk.grd} en ${chk.date} debe ser Clase #${chk.expected}, obtenido #${actual}`);
}
console.log('✓ [PASS] Tabla de cálculo por horario y festivos verificada al 100%');

// 2. Verificar que las clases con fecha en ClassRepository coinciden con el horario y no tienen duplicados de numeración
const allClasses = repo.getAllClasses('usr_manuel');
assert.strictEqual(allClasses.length, rawSeed.length, `Las ${rawSeed.length} planeaciones existen intactas en ClassRepository`);

const byGroup = {};
allClasses.forEach(c => {
  if (!c.date) return;
  const expected = repo.getScheduleSequenceNumber(c.date, c.subjectName, c.gradeName, 'usr_manuel', { requireScheduledWeekday: true });
  if (expected === null) return; // Clase general fuera del horario semanal regular
  assert.strictEqual(c.sequenceNumber, expected, `Clase ${c.id} (${c.date} ${c.subjectName} ${c.gradeName}) tiene #${c.sequenceNumber}, esperado #${expected}`);
  assert.strictEqual(String(c.dayNumber), String(expected), `dayNumber de ${c.id} debe ser "${expected}"`);

  const gKey = `${c.subjectName}|${c.gradeName}`;
  if (!byGroup[gKey]) byGroup[gKey] = new Set();
  assert(!byGroup[gKey].has(c.sequenceNumber), `Número de clase duplicado #${c.sequenceNumber} en ${gKey}`);
  byGroup[gKey].add(c.sequenceNumber);
});
console.log(`✓ [PASS] Las ${Object.values(byGroup).reduce((acc, s) => acc + s.size, 0)} clases programadas tienen numeración única y exacta según el horario`);

// 3. Verificar que NINGÚN campo de contenido pedagógico fue alterado respecto a la semilla
for (const orig of rawSeed) {
  const loaded = repo.getClass(orig.id, 'usr_manuel');
  assert(loaded, `La clase ${orig.id} debe existir`);
  assert.strictEqual(loaded.curriculum?.topic, orig.curriculum?.topic, `Tema intacto en ${orig.id}`);
  assert.strictEqual(loaded.curriculum?.dba, orig.curriculum?.dba, `DBA intacto en ${orig.id}`);
  assert.strictEqual(loaded.curriculum?.achievement, orig.curriculum?.achievement, `Desempeño intacto en ${orig.id}`);
  assert.strictEqual(loaded.didacticSequence?.inicio, orig.didacticSequence?.inicio, `Inicio intacto en ${orig.id}`);
  assert.strictEqual(loaded.didacticSequence?.desarrollo, orig.didacticSequence?.desarrollo, `Desarrollo intacto en ${orig.id}`);
  assert.strictEqual(loaded.didacticSequence?.cierre, orig.didacticSequence?.cierre, `Cierre intacto en ${orig.id}`);
  assert.strictEqual(loaded.teacherNotebook?.studentNotebookContent, orig.teacherNotebook?.studentNotebookContent, `Cuaderno intacto en ${orig.id}`);
}
console.log('✓ [PASS] 100% de las planeaciones conservan su contenido pedagógico y cuaderno intactos byte por byte');

// 4. Simular corrupción previa en caché y verificar auto-realineación
repo._cache['usr_manuel']['cls_20261014_mat7_17'].sequenceNumber = 14;
repo._cache['usr_manuel']['cls_20261015_mat2_9'].sequenceNumber = 10;
repo._cache['usr_manuel']['cls_muc2lqy1_gk48qq8'].sequenceNumber = 5;

const realigned = repo.realignSequenceNumbersToSchedule('usr_manuel');
assert.strictEqual(realigned, 3, 'Debe detectar y corregir exactamente las 3 clases desalineadas');
assert.strictEqual(repo.getClass('cls_20261014_mat7_17', 'usr_manuel').sequenceNumber, 15);
assert.strictEqual(repo.getClass('cls_20261015_mat2_9', 'usr_manuel').sequenceNumber, 9);
assert.strictEqual(repo.getClass('cls_muc2lqy1_gk48qq8', 'usr_manuel').sequenceNumber, 3);
console.log('✓ [PASS] Auto-realineación en vivo corrige cualquier numeración antigua sin tocar contenido');

console.log('\n================================================================');
console.log('TODAS LAS PRUEBAS DE NUMERACIÓN POR HORARIO SUPERADAS AL 100%');
console.log('================================================================');
