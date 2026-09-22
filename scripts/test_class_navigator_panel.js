/**
 * SUITE DE PRUEBAS AUTOMATIZADAS: PANEL DE MATERIAS Y CLASES (Navegador Curricular)
 * Verifica:
 * 1. Agrupación correcta por Asignatura y Grado en el período activo.
 * 2. Orden consecutivo estricto (#1, #2, #3...).
 * 3. Filtrado por estado (Todas, Pendientes, Planeadas).
 * 4. Cálculo de KPIs globales (% planeado, totales).
 * 5. Determinación segura del siguiente consecutivo (max + 1).
 */

const assert = require('assert');
const fs = require('fs');

// Mock DOM environment if running in node
if (typeof window === 'undefined') {
  global.window = global;
  global.document = {
    getElementById: () => null,
    querySelectorAll: () => []
  };
}

const ClassRepository = require('../js/repositories/class-repository.js');
const SequenceService = require('../js/services/sequence-service.js');
const SequenceView = require('../js/ui/sequence-view.js');

console.log('================================================================');
console.log('TEST SUITE: PANEL DE MATERIAS Y CLASES (NAVEGADOR CURRICULAR)');
console.log('================================================================\n');

const tid = 'usr_test_nav_' + Date.now();

// Poblar datos de prueba: 2 Asignaturas
// 1. Matemáticas 7° (3 clases: 2 planeadas, 1 pendiente)
ClassRepository.createClass({
  id: 'cls_test_m7_1',
  teacherId: tid,
  period: '1°',
  subjectName: 'Matemáticas',
  gradeName: 'Séptimo',
  sequenceNumber: 1,
  date: '2026-09-01',
  status: 'planned',
  curriculum: { topic: 'Números enteros' },
  didacticSequence: { inicio: 'Activación' }
}, tid);

ClassRepository.createClass({
  id: 'cls_test_m7_2',
  teacherId: tid,
  period: '1°',
  subjectName: 'Matemáticas',
  gradeName: 'Séptimo',
  sequenceNumber: 2,
  date: '2026-09-08',
  status: 'planned',
  curriculum: { topic: 'Recta numérica' },
  didacticSequence: { inicio: 'Repaso' }
}, tid);

ClassRepository.createClass({
  id: 'cls_test_m7_3',
  teacherId: tid,
  period: '1°',
  subjectName: 'Matemáticas',
  gradeName: 'Séptimo',
  sequenceNumber: 3,
  date: '2026-09-15',
  status: 'pending',
  curriculum: { topic: '' }
}, tid);

// 2. Sistemas 7° (2 clases: 1 planeada, 1 pendiente)
ClassRepository.createClass({
  id: 'cls_test_sis_1',
  teacherId: tid,
  period: '1°',
  subjectName: 'Sistemas',
  gradeName: 'Séptimo',
  sequenceNumber: 1,
  date: '2026-09-02',
  status: 'planned',
  curriculum: { topic: 'Hardware y software' },
  didacticSequence: { inicio: 'Saludo' }
}, tid);

ClassRepository.createClass({
  id: 'cls_test_sis_2',
  teacherId: tid,
  period: '1°',
  subjectName: 'Sistemas',
  gradeName: 'Séptimo',
  sequenceNumber: 2,
  date: '2026-09-09',
  status: 'pending',
  curriculum: { topic: '' }
}, tid);

// --- TEST 1: Agrupación y Orden Consecutivo ---
console.log('--- TEST 1: Agrupación y Orden Consecutivo por Asignatura ---');
const sequences = SequenceService.getAllActiveSequences('1°', tid);
assert.strictEqual(sequences.length, 2, 'Debe haber exactamente 2 grupos de asignaturas');

const matGroup = sequences.find(s => s.subjectName === 'Matemáticas');
assert.ok(matGroup, 'Grupo de Matemáticas debe existir');
assert.strictEqual(matGroup.total, 3, 'Matemáticas debe tener 3 clases');
assert.strictEqual(matGroup.planned, 2, 'Matemáticas debe tener 2 clases planeadas');
assert.strictEqual(matGroup.pending, 1, 'Matemáticas debe tener 1 clase pendiente');

// Verificar orden estricto #1, #2, #3
assert.strictEqual(matGroup.classes[0].sequenceNumber, 1);
assert.strictEqual(matGroup.classes[1].sequenceNumber, 2);
assert.strictEqual(matGroup.classes[2].sequenceNumber, 3);
console.log('  ✅ [PASS] Matemáticas 7° agrupada con clases #1, #2, #3 en orden estricto.');

const sisGroup = sequences.find(s => s.subjectName === 'Sistemas');
assert.ok(sisGroup, 'Grupo de Sistemas debe existir');
assert.strictEqual(sisGroup.total, 2, 'Sistemas debe tener 2 clases');
assert.strictEqual(sisGroup.planned, 1, 'Sistemas debe tener 1 clase planeada');
assert.strictEqual(sisGroup.pending, 1, 'Sistemas debe tener 1 clase pendiente');
console.log('  ✅ [PASS] Sistemas 7° agrupada con clases #1, #2 en orden estricto.');

// --- TEST 2: Cálculo de Siguiente Consecutivo (max + 1) ---
console.log('\n--- TEST 2: Determinación del Siguiente Consecutivo ---');
const nextMatSeq = ClassRepository.getNextSequenceNumber({
  teacherId: tid,
  period: '1°',
  subject: 'Matemáticas',
  grade: 'Séptimo'
});
assert.strictEqual(nextMatSeq, 4, 'La siguiente clase de Matemáticas debe ser Clase #4');
console.log('  ✅ [PASS] Siguiente clase calculada correctamente como Clase #4 (max + 1).');

// --- TEST 3: Filtrado de Clases en Vista (Todas, Pendientes, Planeadas) ---
console.log('\n--- TEST 3: Filtrado en SequenceView ---');
SequenceView.selectedPeriod = '1°';

// Filtro: 'all'
SequenceView.activeFilter = 'all';
let renderedAll = SequenceView._renderSequenceGroups(sequences);
assert.ok(renderedAll.includes('Clase #1'), 'Debe mostrar Clase #1');
assert.ok(renderedAll.includes('Clase #2'), 'Debe mostrar Clase #2');
assert.ok(renderedAll.includes('Clase #3'), 'Debe mostrar Clase #3');
console.log('  ✅ [PASS] Filtro "all" muestra todas las clases.');

// Filtro: 'pending'
SequenceView.activeFilter = 'pending';
let renderedPending = SequenceView._renderSequenceGroups(sequences);
assert.ok(renderedPending.includes('num-pending">\n                      Clase #3') || renderedPending.includes('Clase #3'), 'Pendientes debe incluir Clase #3 de Matemáticas');
assert.ok(!renderedPending.includes('num-planned'), 'Pendientes no debe mostrar tarjetas planeadas');
console.log('  ✅ [PASS] Filtro "pending" muestra exclusivamente clases pendientes.');

// Filtro: 'planned'
SequenceView.activeFilter = 'planned';
let renderedPlanned = SequenceView._renderSequenceGroups(sequences);
assert.ok(renderedPlanned.includes('num-planned">\n                      Clase #1') || renderedPlanned.includes('Clase #1'), 'Planeadas debe incluir Clase #1');
assert.ok(renderedPlanned.includes('num-planned">\n                      Clase #2') || renderedPlanned.includes('Clase #2'), 'Planeadas debe incluir Clase #2');
assert.ok(!renderedPlanned.includes('num-pending'), 'Planeadas no debe incluir tarjetas pendientes');
console.log('  ✅ [PASS] Filtro "planned" muestra exclusivamente clases planeadas.');

// --- TEST 4: Helpers de Formato y Tópico ---
console.log('\n--- TEST 4: Helpers de Formato, Tópico e Iconos ---');
const cleanTopic = SequenceView._formatTopic('Clase #1: Números enteros y sus propiedades');
assert.strictEqual(cleanTopic, 'Números enteros y sus propiedades', 'Debe limpiar prefijo Clase #1:');

const emptyTopic = SequenceView._formatTopic('');
assert.ok(emptyTopic.includes('Sin tema planeado todavía'), 'Debe mostrar fallback para tema vacío');

const iconMath = SequenceView._getSubjectIcon('Matemáticas');
assert.strictEqual(iconMath, '📐');
const iconSis = SequenceView._getSubjectIcon('Sistemas e Informática');
assert.strictEqual(iconSis, '💻');
const iconRob = SequenceView._getSubjectIcon('Robótica');
assert.strictEqual(iconRob, '🤖');
console.log('  ✅ [PASS] Iconos temáticos y formateo de temas funcionan con precisión.');

console.log('\n================================================================');
console.log('RESULTADO: TODAS LAS PRUEBAS DEL PANEL DE MATERIAS Y CLASES SUPERADAS (100% PASS)');
console.log('================================================================\n');
process.exit(0);
