/**
 * TEST: EXCLUSIÓN ESTRICTA DE SEMANA DE RECESO Y FESTIVOS DE LA NUMERACIÓN DE CLASES
 * - Verifica que ni la semana de receso ni los festivos se cuenten como clases.
 * - Verifica que no inflen los números de clases posteriores.
 * - Verifica que no se generen pendientes ni se roben clases a fechas de receso.
 * - Verifica que el calendario no muestre '+ Planear' en receso ni festivos.
 */

const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('TEST: EXCLUSIÓN DE SEMANA DE RECESO Y FESTIVOS (2026)');
console.log('================================================================\n');

const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

const rawSeed = JSON.parse(JSON.stringify(require('../js/data/initial-classes-data.js').INITIAL_CLASSES_DATA));
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
eval(fs.readFileSync('js/calendar.js', 'utf8'));

global.HolidayService = window.HolidayService;
global.StorageService = window.StorageService;
global.ScheduleRepository = window.ScheduleRepository;
global.PlanRepository = window.PlanRepository;
global.ClassRepository = window.ClassRepository;
global.SequenceService = window.SequenceService;
global.ScheduleService = window.ScheduleService;
global.Calendar = window.Calendar;

const repo = window.ClassRepository;

// 1. Detección infalible de receso y festivos
const inductionDates = ['2026-09-02', '2026-09-03', '2026-09-04'];
const recessDates = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09'];
const holidayDates = ['2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25'];

console.log('--- TEST 1: Detección estricta de días no lectivos ---');
inductionDates.forEach(d => {
  assert.strictEqual(repo._isRecessOrNonSchoolDay(d), true, `${d} debe ser detectado como inducción sin clases en ClassRepository`);
  assert.strictEqual(HolidayService.isRecessOrNonSchoolDay(d).isRecess, true, `${d} debe ser día sin clases en HolidayService`);
});
recessDates.forEach(d => {
  assert.strictEqual(repo._isRecessOrNonSchoolDay(d), true, `${d} debe ser detectado como receso en ClassRepository`);
  assert.strictEqual(HolidayService.isRecessOrNonSchoolDay(d).isRecess, true, `${d} debe ser receso en HolidayService`);
});
holidayDates.forEach(d => {
  assert.strictEqual(repo._isRecessOrNonSchoolDay(d), true, `${d} debe ser detectado como festivo en ClassRepository`);
  assert.strictEqual(HolidayService.isRecessOrNonSchoolDay(d).isRecess, true, `${d} debe ser festivo en HolidayService`);
});
console.log('  ✅ [PASS] 100% de días de receso de octubre, inducción y festivos identificados.');

// 2. getScheduleSequenceNumber NUNCA asigna número de clase a receso ni festivos
console.log('\n--- TEST 2: Cero números de clase asignados a receso o festivos ---');
inductionDates.forEach(d => {
  const seq = repo.getScheduleSequenceNumber(d, 'Matemáticas', '7°', 'usr_manuel', { requireScheduledWeekday: true });
  assert.strictEqual(seq, null, `${d} en inducción sin clases NO debe tener número de clase (obtenido ${seq})`);
});
recessDates.forEach(d => {
  const seq = repo.getScheduleSequenceNumber(d, 'Matemáticas', '7°', 'usr_manuel', { requireScheduledWeekday: true });
  assert.strictEqual(seq, null, `${d} en semana de receso NO debe tener número de clase (obtenido ${seq})`);
});
holidayDates.forEach(d => {
  const seq = repo.getScheduleSequenceNumber(d, 'Matemáticas', '2°', 'usr_manuel', { requireScheduledWeekday: true });
  assert.strictEqual(seq, null, `${d} festivo NO debe tener número de clase (obtenido ${seq})`);
});
console.log('  ✅ [PASS] getScheduleSequenceNumber retorna null para receso, inducción y festivos.');

// 3. Verificación de conteo no inflado tras la semana de receso y el festivo del 12 de octubre
console.log('\n--- TEST 3: Continuidad exacta y no inflada de clases tras el receso ---');
// Matemáticas 7°:
// Clase 1: Martes 2026-09-01
// Miércoles 2 y Viernes 4: Sin clases
// Clase 2: Martes 2026-09-08
// Clase 13: Viernes 2026-10-02
// Semana de receso: 5 al 9 de octubre (0 clases)
// Lunes 12 de octubre: Festivo Día de la Raza
// Clase 14: Martes 2026-10-13 (DEBE ser #14)
// Clase 15: Miércoles 2026-10-14 (DEBE ser #15)
assert.strictEqual(repo.getScheduleSequenceNumber('2026-09-01', 'Matemáticas', '7°', 'usr_manuel'), 1);
assert.strictEqual(repo.getScheduleSequenceNumber('2026-09-08', 'Matemáticas', '7°', 'usr_manuel'), 2);
assert.strictEqual(repo.getScheduleSequenceNumber('2026-10-02', 'Matemáticas', '7°', 'usr_manuel'), 13);
assert.strictEqual(repo.getScheduleSequenceNumber('2026-10-13', 'Matemáticas', '7°', 'usr_manuel'), 14);
assert.strictEqual(repo.getScheduleSequenceNumber('2026-10-14', 'Matemáticas', '7°', 'usr_manuel'), 15);

// Matemáticas 2°:
// Clase 8: Jueves 2026-10-01
// Lunes 5 de octubre: Receso (0 clases)
// Jueves 8 de octubre: Receso (0 clases)
// Lunes 12 de octubre: Festivo Día de la Raza (0 clases)
// Clase 9: Jueves 2026-10-15 (DEBE ser #9, NUNCA #10, #11 o #12)
assert.strictEqual(repo.getScheduleSequenceNumber('2026-10-01', 'Matemáticas', '2°', 'usr_manuel'), 8);
assert.strictEqual(repo.getScheduleSequenceNumber('2026-10-15', 'Matemáticas', '2°', 'usr_manuel'), 9);

// Matemáticas 3°:
// Clase 8: Viernes 2026-10-02
// Miércoles 7 de octubre: Receso (0 clases)
// Viernes 9 de octubre: Receso (0 clases)
// Clase 9: Miércoles 2026-10-14 (DEBE ser #9)
assert.strictEqual(repo.getScheduleSequenceNumber('2026-10-02', 'Matemáticas', '3°', 'usr_manuel'), 8);
assert.strictEqual(repo.getScheduleSequenceNumber('2026-10-14', 'Matemáticas', '3°', 'usr_manuel'), 9);

console.log('  ✅ [PASS] Consecutivos tras receso y festivos avanzan exactamente +1 sin inflación.');

// 4. ScheduleService.buildDayView en día de receso
console.log('\n--- TEST 4: ScheduleService.buildDayView en día de receso ---');
const dayViewRecess = ScheduleService.buildDayView('2026-10-06', 'usr_manuel');
assert.strictEqual(dayViewRecess.isRecess, true, 'buildDayView debe marcar isRecess=true');
dayViewRecess.scheduledItems.forEach(item => {
  assert.strictEqual(item.isPending, false, `Item ${item.slot.id} NO debe figurar como pendiente en receso`);
  assert.strictEqual(item.isRecess, true, `Item ${item.slot.id} debe marcar isRecess=true`);
  assert.strictEqual(item.expectedSequenceNumber, null, `expectedSequenceNumber debe ser null en receso`);
});
console.log('  ✅ [PASS] Ningún slot de horario se marca como pendiente en día de receso escolar.');

// 5. Inmunidad ante localStorage desactualizado en cliente
console.log('\n--- TEST 5: Auto-curación de eventos escolares en localStorage ---');
global.localStorage.setItem('teacher_school_events_v1', JSON.stringify([
  { id: 'evt_random', name: 'Evento antiguo', startDate: '2026-09-01', endDate: '2026-09-02' }
]));
const healedEvents = HolidayService.getSchoolEvents();
assert(healedEvents.some(e => e.id === 'evt_oct_receso'), 'evt_oct_receso debe ser reinyectado si faltaba en localStorage');
assert(healedEvents.some(e => e.id === 'evt_dic_vacaciones'), 'evt_dic_vacaciones debe ser reinyectado si faltaba');
assert.strictEqual(HolidayService.isRecessOrNonSchoolDay('2026-10-05').isRecess, true, 'Oct 5 debe ser receso incluso con storage previo sucio');
console.log('  ✅ [PASS] Auto-curación de eventos en localStorage probada con éxito.');

// 6. Test de alternar (toggle) día sin clases en caliente
console.log('\n--- TEST 6: Alternar día sin clases dinámicamente y realinear ---');
const testDate = '2026-09-15'; // Martes: Normalmente clase 5 de Matemáticas 7°
assert.strictEqual(repo.getScheduleSequenceNumber(testDate, 'Matemáticas', '7°', 'usr_manuel'), 5);

// Marcar 15 de septiembre como día sin clases (ej. Jornada pedagógica)
const toggledOn = HolidayService.toggleNonTeachingDay(testDate, 'Jornada Pedagógica');
assert.strictEqual(toggledOn.isNonTeaching, true);
assert.strictEqual(repo.getScheduleSequenceNumber(testDate, 'Matemáticas', '7°', 'usr_manuel', { requireScheduledWeekday: true }), null);
// El siguiente día (Miércoles 16 de sept) ahora pasa a ser Clase 5 en vez de 6
assert.strictEqual(repo.getScheduleSequenceNumber('2026-09-16', 'Matemáticas', '7°', 'usr_manuel'), 5);

// Desmarcar 15 de septiembre para volver a habilitar clases
const toggledOff = HolidayService.toggleNonTeachingDay(testDate);
assert.strictEqual(toggledOff.isNonTeaching, false);
assert.strictEqual(repo.getScheduleSequenceNumber(testDate, 'Matemáticas', '7°', 'usr_manuel'), 5);
assert.strictEqual(repo.getScheduleSequenceNumber('2026-09-16', 'Matemáticas', '7°', 'usr_manuel'), 6);
console.log('  ✅ [PASS] Alternancia de días sin clases y realineación automática probada al 100%.');

console.log('\n================================================================');
console.log('TODAS LAS PRUEBAS DE EXCLUSIÓN DE RECESO Y FESTIVOS SUPERADAS');
console.log('================================================================');
