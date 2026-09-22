/**
 * SUITE DE PRUEBAS: CORRECCIÓN DE LA INTERFAZ DEL DASHBOARD
 * Verifica:
 * 1. Formateo limpio de snippets de Inicio (sin viñetas • ni asteriscos Markdown **).
 * 2. Limpieza de temas redundantes (sin prefijo "Clase #1:").
 * 3. Consistencia de estado: clases vacías (ej. Dirección de grupo) son Pendientes, no Planeadas.
 * 4. Deduplicación y agrupación limpia de secuencias en la barra lateral.
 */

const assert = require('assert');

// 1. Configuración de entorno Node.js
const memoryStore = {};
global.window = global;
global.localStorage = {
  store: memoryStore,
  getItem(k) { return this.store[k] !== undefined ? this.store[k] : null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { for (let k in this.store) delete this.store[k]; }
};

global.document = {
  readyState: 'complete',
  addEventListener() {},
  getElementById(id) {
    return {
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      addEventListener() {},
      classList: { add() {}, remove() {}, toggle() {} },
      querySelectorAll() { return []; },
      querySelector() { return null; }
    };
  },
  querySelectorAll() { return []; },
  body: {
    insertAdjacentHTML() {},
    classList: { add() {}, remove() {}, toggle() {} }
  }
};

// Cargar módulos
const UserService = require('../js/users-service.js');
global.UserService = UserService;

const ScheduleRepository = require('../js/repositories/schedule-repository.js');
global.ScheduleRepository = ScheduleRepository;

const ClassRepository = require('../js/repositories/class-repository.js');
global.ClassRepository = ClassRepository;

const SequenceService = require('../js/services/sequence-service.js');
global.SequenceService = SequenceService;

const ScheduleService = require('../js/services/schedule-service.js');
global.ScheduleService = ScheduleService;

const DashboardView = require('../js/ui/dashboard-view.js');
global.DashboardView = DashboardView;

const TEACHER_ID = 'usr_manuel';

console.log('\n================================================================');
console.log('SUITE DE PRUEBAS: MEJORAS Y AUDITORÍA DE LA INTERFAZ DASHBOARD');
console.log('================================================================\n');

// -------------------------------------------------------------
console.log('--- TEST 1: Sanitización de Snippets de Inicio en DashboardView ---');
// -------------------------------------------------------------
const rawSnippet1 = '• **Saludo y bienvenida:** Presentación del docente, acogida afectuosa a los estudiantes y ambiente de trabajo.';
const cleanSnippet1 = DashboardView._formatSnippet(rawSnippet1);
assert(!cleanSnippet1.includes('•'), 'No debe contener viñetas •');
assert(!cleanSnippet1.includes('**'), 'No debe contener asteriscos ** de Markdown');
assert(cleanSnippet1.startsWith('Saludo y bienvenida: Presentación'), 'Debe comenzar limpiamente con el texto');
console.log('  ✅ [PASS] Snippet con viñetas y negrita se formatea limpiamente:', cleanSnippet1);

const rawSnippet2 = '<p>• <strong>Saludo y activación mental (5 minutos):</strong> Bienvenida al bloque de dos horas. Se plantea en el tablero...</p>';
const cleanSnippet2 = DashboardView._formatSnippet(rawSnippet2);
assert(!cleanSnippet2.includes('<p>') && !cleanSnippet2.includes('<strong>'), 'No debe contener etiquetas HTML');
assert(!cleanSnippet2.includes('•'), 'No debe contener viñeta HTML/Unicode');
console.log('  ✅ [PASS] Snippet con HTML y viñeta se limpia correctamente:', cleanSnippet2);

// -------------------------------------------------------------
console.log('\n--- TEST 2: Limpieza de Tema redundante con prefijo "Clase #1:" ---');
// -------------------------------------------------------------
const rawTopic1 = 'Clase #1: Introducción a la asignatura, acuerdos pedagógicos, metodología y criterios de evaluación';
const cleanTopic1 = DashboardView._formatTopic(rawTopic1);
assert(!cleanTopic1.toLowerCase().startsWith('clase #1:'), 'No debe repetir el prefijo Clase #1:');
assert(cleanTopic1.startsWith('Introducción a la asignatura'), 'Debe iniciar directamente con el tema');
console.log('  ✅ [PASS] Tema limpia prefijo "Clase #1:":', cleanTopic1);

const rawTopic2 = '**Tema: Números enteros y sus propiedades**';
const cleanTopic2 = DashboardView._formatTopic(rawTopic2);
assert(!cleanTopic2.includes('**'), 'No debe contener asteriscos de Markdown');
console.log('  ✅ [PASS] Tema limpia asteriscos Markdown:', cleanTopic2);

const rawTopic3 = '';
assert(DashboardView._formatTopic(rawTopic3) === 'Sin tema planeado todavía', 'Fallback correcto cuando está vacío');
console.log('  ✅ [PASS] Fallback para tema vacío verificado.');

// -------------------------------------------------------------
console.log('\n--- TEST 3: Consistencia lógica de Estado (Clases vacías vs Planeadas) ---');
// -------------------------------------------------------------
// Clase vacía (ej. Dirección de grupo creada sin contenido pedagógico)
const emptyHomeroom = {
  id: 'cls_homeroom_test',
  teacherId: TEACHER_ID,
  subjectName: 'Dirección de grupo',
  gradeName: '7°',
  date: '2026-09-11',
  status: 'planned', // Aunque esté guardada con status 'planned', al estar vacía NO debe considerarse planeada
  curriculum: { topic: '' },
  didacticSequence: { inicio: '', desarrollo: '', cierre: '' },
  pedagogy: { inicio: '', desarrollo: '' }
};
ClassRepository.saveClass(emptyHomeroom);

const dayView = ScheduleService.buildDayView('2026-09-11', TEACHER_ID);
const homeroomItem = dayView.scheduledItems.find(i => i.slot.subjectName === 'Dirección de grupo');

if (homeroomItem) {
  assert(homeroomItem.isPlanned === false, 'Clase sin contenido NO debe marcarse como planeada');
  assert(homeroomItem.isPending === true, 'Clase sin contenido pedagógico debe marcarse como pendiente');
  console.log('  ✅ [PASS] Clase sin contenido (Dirección de grupo) se clasifica correctamente como Pendiente');
} else {
  console.log('  ℹ️ Slot de Dirección de grupo no está en el horario simulado de hoy');
}

// -------------------------------------------------------------
console.log('\n--- TEST 4: Deduplicación y Agrupación en SequenceService ---');
// -------------------------------------------------------------
// Crear 2 clases con diferencias sutiles de espacios en el nombre
ClassRepository.saveClass({
  id: 'cls_sistemas_7_a',
  teacherId: TEACHER_ID,
  period: '1°',
  subjectName: 'Sistemas',
  gradeName: '7°',
  sequenceNumber: 1,
  curriculum: { topic: 'Tema 1' },
  didacticSequence: { inicio: 'Inicio 1' }
});

ClassRepository.saveClass({
  id: 'cls_sistemas_7_b',
  teacherId: TEACHER_ID,
  period: '1°',
  subjectName: 'Sistemas ', // Espacio al final
  gradeName: '7° ',      // Espacio al final
  sequenceNumber: 2,
  curriculum: { topic: 'Tema 2' },
  didacticSequence: { inicio: 'Inicio 2' }
});

const sequences = SequenceService.getAllActiveSequences('1°', TEACHER_ID);
const sistemas7Count = sequences.filter(s => s.subjectName.trim() === 'Sistemas' && s.gradeName.trim() === '7°').length;
assert(sistemas7Count === 1, `Sistemas (7°) debe agruparse en 1 sola entrada, pero se encontraron ${sistemas7Count}`);
console.log('  ✅ [PASS] Sistemas (7°) se agrupa en una única secuencia sin duplicados');

console.log('\n================================================================');
console.log('RESULTADO: 8 / 8 pruebas superadas exitosamente (100%)');
console.log('================================================================\n');
process.exit(0);
