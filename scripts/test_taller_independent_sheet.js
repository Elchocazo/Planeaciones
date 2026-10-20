const assert = require('assert');
const ImportParser = require('../js/services/import-parser.js');
const ImportService = require('../js/services/import-service.js');
const NotebookEditor = require('../js/notebook-editor.js');
const { PageConfig, PaginationEngine } = require('../js/core/pagination-engine.js');

console.log('================================================================');
console.log('TEST SUITE: HOJA INDEPENDIENTE PARA TALLER / EJERCICIO PRÁCTICO');
console.log('================================================================\n');

// -------------------------------------------------------------------
// TEST 1: Detección de la etiqueta exacta "TALLER / EJERCICIO PRÁCTICO DE LA CLASE"
// -------------------------------------------------------------------
console.log('--- TEST 1: Detección exacta de "TALLER / EJERCICIO PRÁCTICO DE LA CLASE" ---');
const textWithTaller = `
ASIGNATURA: Matemáticas
GRADO: 7°A
CLASE: 5
TEMA: Multiplicación de números enteros

FASE DE INICIO (10 min)
Activación de conocimientos previos y motivación.

FASE DE DESARROLLO (35 min)
Explicación de la ley de signos para la multiplicación de enteros:
Positivo por positivo da positivo, negativo por negativo da positivo.
Ejemplos guiados en el tablero.

FASE DE CIERRE (15 min)
Síntesis de la regla de los signos y conclusiones formativas.

TALLER / EJERCICIO PRÁCTICO DE LA CLASE
1. Resuelve las siguientes multiplicaciones aplicando la ley de signos:
a) (+4) × (-6) =
b) (-8) × (-5) =
c) (-12) × (+3) =
2. Problema de aplicación: Un buzo desciende a una velocidad constante de 3 metros por minuto durante 8 minutos. ¿Cuál es su profundidad final?

OBSERVACIONES PEDAGÓGICAS
Reforzar en la próxima sesión a los alumnos con dudas en la ley de signos con más de dos factores.
`;

const parsed = ImportParser.parse(textWithTaller);

assert.strictEqual(parsed.detected.practicalActivity, true, 'Debe detectar practicalActivity como true');
assert.ok(!parsed.didacticSequence.cierre.includes('TALLER'), 'El cierre no debe tener restos de TALLER');
assert.ok(parsed.teacherNotebook.practicalActivity.includes('Resuelve las siguientes multiplicaciones'), 'Debe contener el ejercicio 1');
assert.ok(parsed.teacherNotebook.practicalActivity.includes('Problema de aplicación: Un buzo desciende'), 'Debe contener el problema 2');
console.log('  ✅ [PASS] TEST 1: Etiqueta "TALLER / EJERCICIO PRÁCTICO DE LA CLASE" parseada limpiamente.\n');

// -------------------------------------------------------------------
// TEST 2: Generación del Cuaderno con Hoja Independiente (Salto de Página + Ficha Estudiantil)
// -------------------------------------------------------------------
console.log('--- TEST 2: Generación en NotebookEditor con Hoja Independiente ---');

const classObj = {
  id: 'cls_taller_test_1',
  subject: 'Matemáticas',
  grade: '7°A',
  topic: parsed.curriculum.topic,
  didacticSequence: parsed.didacticSequence,
  teacherNotebook: parsed.teacherNotebook,
  observations: parsed.observations
};

const notebookHtml = NotebookEditor._prepareInitialHtml(classObj);

// Verificación del salto de página antes del taller
assert.ok(notebookHtml.includes('class="notebook-page-break"'), 'Debe incluir el salto de página explícito (notebook-page-break)');
assert.ok(notebookHtml.includes('Hoja Independiente: Taller / Ejercicio Práctico') || notebookHtml.includes('Taller para Estudiantes'), 'Debe indicar que es una hoja independiente');

// Verificación de la ficha institucional de encabezado para el estudiante
assert.ok(notebookHtml.includes('notebook-student-worksheet-header'), 'Debe incluir la ficha de encabezado del estudiante');
assert.ok(notebookHtml.includes('Estudiante:'), 'Debe tener campo para Nombre del Estudiante');
assert.ok(notebookHtml.includes('Fecha:'), 'Debe tener campo de Fecha');
assert.ok(notebookHtml.includes('Calificación:'), 'Debe tener campo de Calificación');
assert.ok(notebookHtml.includes('Multiplicación de números enteros'), 'Debe incluir el tema en la ficha del estudiante');

// Verificación de que el desarrollo teórico y los ejercicios coexisten en orden
const breakPos = notebookHtml.indexOf('notebook-page-break');
const theoryPos = notebookHtml.indexOf('Explicación de la ley de signos');
const exercisePos = notebookHtml.indexOf('Resuelve las siguientes multiplicaciones');

assert.ok(theoryPos !== -1 && theoryPos < breakPos, 'La teoría debe estar antes del salto de página');
assert.ok(exercisePos !== -1 && exercisePos > breakPos, 'Los ejercicios del taller deben estar después del salto de página en la nueva hoja');

console.log('  ✅ [PASS] TEST 2: Cuaderno genera el desarrollo en Hoja 1 y el Taller en Hoja 2 con ficha estudiantil.\n');

// -------------------------------------------------------------------
// TEST 3: Paginación real en PaginationEngine
// -------------------------------------------------------------------
console.log('--- TEST 3: Validación matemática con PaginationEngine ---');

// Mock DOM para PaginationEngine en Node
function createMockBlock(tag, text, height, isManualBreak = false) {
  const isBreak = isManualBreak || tag === 'div.notebook-page-break';
  return {
    nodeType: 1,
    tagName: tag.toUpperCase().split('.')[0],
    offsetHeight: height,
    textContent: text,
    classList: {
      contains: (cls) => isBreak && cls === 'notebook-page-break'
    },
    getAttribute: () => null,
    parentNode: null
  };
}

const b1 = createMockBlock('h2', 'Multiplicación de enteros', 45);
const b2 = createMockBlock('p', 'Explicación teórica...', 80);
const bBreak = createMockBlock('div.notebook-page-break', 'Salto', 0, true);
const bSheetHeader = createMockBlock('div', 'Ficha Estudiante', 110);
const bExercise = createMockBlock('p', '1. Resuelve las operaciones...', 60);

const mockEditor = {
  id: 'notebook-single-editor',
  isConnected: true,
  children: [b1, b2, bBreak, bSheetHeader, bExercise],
  querySelectorAll: () => [],
  querySelector: () => null
};
mockEditor.children.forEach(c => { c.parentNode = mockEditor; });

const mockPaperContainer = {
  style: {},
  querySelector: () => null,
  querySelectorAll: () => []
};

const result = PaginationEngine.paginate(mockPaperContainer, mockEditor);
assert.ok(result.totalPages >= 2, `Debe paginar en al menos 2 hojas. Total hojas: ${result.totalPages}`);
assert.ok(result.breaks.some(b => b.isManual), 'Debe registrar un salto manual para la hoja del taller');
console.log(`  ✅ [PASS] TEST 3: PaginationEngine divide el documento en ${result.totalPages} hojas con salto manual detectado.\n`);

// -------------------------------------------------------------------
// TEST 4: Auto-formato en texto plano y Markdown
// -------------------------------------------------------------------
console.log('--- TEST 4: Auto-formato con formatMarkdownToHtml ---');
const rawNotes = `
INTRODUCCIÓN A LA FÍSICA
La física estudia las propiedades de la materia y la energía.

TALLER / EJERCICIO PRÁCTICO DE LA CLASE
1. Responde falso o verdadero a las siguientes afirmaciones:
a) La velocidad es una magnitud escalar.
b) La aceleración de la gravedad en la Tierra es aproximadamente 9.8 m/s².
`;

const formattedNotes = ImportParser.formatMarkdownToHtml(rawNotes);
assert.ok(formattedNotes.includes('notebook-page-break'), 'formatMarkdownToHtml debe insertar salto de página antes del taller');
assert.ok(formattedNotes.includes('notebook-student-worksheet-header'), 'formatMarkdownToHtml debe insertar encabezado estudiantil');
assert.ok(formattedNotes.includes('Estudiante:'), 'Debe contener campo Estudiante');
assert.ok(formattedNotes.includes('La física estudia'), 'Debe conservar la teoría previa');
console.log('  ✅ [PASS] TEST 4: formatMarkdownToHtml organiza texto plano con hoja independiente de taller.\n');

console.log('================================================================');
console.log('TODAS LAS PRUEBAS DE HOJA INDEPENDIENTE SUPERADAS (100% PASS)');
console.log('================================================================\n');
