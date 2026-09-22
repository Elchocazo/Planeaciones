const assert = require('assert');
const ImportParser = require('../js/services/import-parser.js');
const NotebookEditor = require('../js/notebook-editor.js');

console.log('================================================================');
console.log('TEST SUITE: CORRECCIÓN Y PREVENCIÓN DE TRUNCAMIENTO DE TALLER');
console.log('================================================================\n');

// -------------------------------------------------------------------
// TEST 1: Caso exacto del usuario (del pantallazo media_1790050540553.png)
// -------------------------------------------------------------------
console.log('--- TEST 1: Texto exacto del usuario con TALLER / ACTIVIDAD PRÁCTICA ---');
const userText = `
ASIGNATURA: Matemáticas
GRADO: Séptimo
CLASE: 3
TEMA: Sustracción de números enteros

FASE DE INICIO (15 min)
Saludo y activación de conocimientos previos.

FASE DE DESARROLLO (30 min)
Explicación detallada sobre la regla de la resta de enteros y su equivalencia con la suma del opuesto.

FASE DE CIERRE (15 min)
• Síntesis y balance formativo de la sesión.
• Conexión con la siguiente clase: En la próxima clase aprenderemos la sustracción (resta) de números enteros y comprenderemos por qué restar un número equivale a sumar su opuesto, abriendo el camino para resolver polinomios aritméticos sencillos.

TALLER / ACTIVIDAD PRÁCTICA DE LA CLASE
1. Resuelve las siguientes operaciones paso a paso:
a) (+15) - (-8) =
b) (-20) - (+14) =
2. Situación problémica: La temperatura a las 6 a.m. era de -3°C y al mediodía subió a 12°C. Calcula la variación térmica.

OBSERVACIONES PEDAGÓGICAS
El quizz inicial debe ser ágil, puntual y sin ambigüedades técnicas para no restar tiempo a la presentación del nuevo tema. En caso de detectar vacíos conceptuales en el quizz sobre el manejo de signos externos en el valor absoluto, programar una cápsula de refuerzo de 5 minutos al iniciar la siguiente clase.
`;

const parsed1 = ImportParser.parse(userText);

// Verificación 1.1: Cierre no tiene "TALLER /"
assert.ok(!parsed1.didacticSequence.cierre.includes('TALLER'), 'Cierre no debe contener TALLER');
assert.ok(parsed1.didacticSequence.cierre.includes('polinomios aritméticos sencillos'), 'Cierre conserva todo su texto final');

// Verificación 1.2: practicalActivity detectado y completo
assert.strictEqual(parsed1.detected.practicalActivity, true, 'Actividad práctica debe detectarse como true');
assert.ok(parsed1.teacherNotebook.practicalActivity.includes('Resuelve las siguientes operaciones'), 'practicalActivity contiene el ejercicio 1');
assert.ok(parsed1.teacherNotebook.practicalActivity.includes('Situación problémica'), 'practicalActivity contiene el ejercicio 2');

// Verificación 1.3: Observaciones intactas
assert.ok(parsed1.observations.includes('El quizz inicial debe ser ágil'), 'Observaciones pedagógicas preservadas íntegras');

console.log('  ✅ [PASS] TEST 1: Parseo semántico separa limpiamente cierre, taller y observaciones.\n');

// -------------------------------------------------------------------
// TEST 2: Renderizado en el Cuaderno Docente (NotebookEditor._prepareInitialHtml)
// -------------------------------------------------------------------
console.log('--- TEST 2: Renderizado en NotebookEditor para la clase importada ---');
const classData1 = {
  id: 'cls_test_taller_1',
  subject: 'Matemáticas',
  grade: 'Séptimo',
  topic: parsed1.curriculum.topic,
  didacticSequence: parsed1.didacticSequence,
  teacherNotebook: parsed1.teacherNotebook,
  observations: parsed1.observations
};

const notebookHtml1 = NotebookEditor._prepareInitialHtml(classData1);
assert.ok(notebookHtml1.includes('Taller / Actividad Práctica'), 'El Cuaderno debe incluir el encabezado del taller');
assert.ok(notebookHtml1.includes('Resuelve las siguientes operaciones'), 'El Cuaderno incluye los ejercicios del taller');
assert.ok(notebookHtml1.includes('Situación problémica'), 'El Cuaderno incluye los problemas de aplicación');
assert.ok(!notebookHtml1.includes('TALLER /<') && !notebookHtml1.endsWith('TALLER /'), 'No hay remanentes truncados TALLER /');

console.log('  ✅ [PASS] TEST 2: Cuaderno docente integra armónicamente la actividad práctica sin truncar.\n');

// -------------------------------------------------------------------
// TEST 3: Reparación automática de clases previamente truncadas en base de datos
// -------------------------------------------------------------------
console.log('--- TEST 3: Reparación en vivo de clase previamente guardada con truncamiento ---');
const legacyTruncatedClass = {
  id: 'cls_legacy_truncated',
  notebookContent: '<p>• Conexión con la siguiente clase: En la próxima clase aprenderemos la sustracción (resta) de números enteros y comprenderemos por qué restar un número equivale a sumar su opuesto, abriendo el camino para resolver polinomios aritméticos sencillos.</p><p>TALLER / </p>',
  teacherNotebook: {
    studentNotebookContent: '<p>• Conexión con la siguiente clase: En la próxima clase aprenderemos la sustracción (resta) de números enteros y comprenderemos por qué restar un número equivale a sumar su opuesto, abriendo el camino para resolver polinomios aritméticos sencillos.</p><p>TALLER / </p>',
    practicalActivity: '1. Ejercicio de prueba recuperado.\n2. Segundo ejercicio recuperado.'
  },
  observations: 'El quizz inicial debe ser ágil'
};

const repairedHtml = NotebookEditor._prepareInitialHtml(legacyTruncatedClass);
assert.ok(!repairedHtml.includes('TALLER / </p>'), 'Remanente truncado eliminado');
assert.ok(repairedHtml.includes('Ejercicio de prueba recuperado'), 'Actividad práctica anexada exitosamente');
assert.ok(repairedHtml.includes('Segundo ejercicio recuperado'), 'Segundo ejercicio anexado exitosamente');

console.log('  ✅ [PASS] TEST 3: Clases previamente truncadas se autoreparan limpiamente al abrir el cuaderno.\n');

// -------------------------------------------------------------------
// TEST 4: Múltiples variantes de encabezados sin truncamiento
// -------------------------------------------------------------------
console.log('--- TEST 4: Resistencia a múltiples variantes léxicas de Taller ---');
const variants = [
  'TALLER / ACTIVIDAD PRÁCTICA',
  'TALLER / ACTIVIDAD PRÁCTICA DE LA CLASE',
  'TALLER / ACTIVIDADES PRÁCTICAS',
  'TALLER / EJERCICIO PRÁCTICO',
  'TALLER / EJERCICIO PRÁCTICO DE LA CLASE',
  'TALLER / EJERCICIOS',
  'TALLER / GUÍA PRÁCTICA',
  'TALLER PRÁCTICO',
  'TALLER EN CLASE',
  'TALLER DE APLICACIÓN EN CLASE',
  'TALLER:',
  'TALLER',
  'ACTIVIDAD PRÁCTICA',
  'ACTIVIDAD PRÁCTICA DE LA CLASE'
];

for (const v of variants) {
  const textVariant = `
FASE DE CIERRE (10 min)
• Conexión con el tema futuro.

${v}
1. Ejercicio único para ${v}.

OBSERVACIONES
Observación de prueba.
`;
  const p = ImportParser.parse(textVariant);
  assert.ok(!p.didacticSequence.cierre.includes('TALLER'), `Cierre no debe contener TALLER en variante: ${v}`);
  assert.strictEqual(p.detected.practicalActivity, true, `Debe detectarse practicalActivity en variante: ${v}`);
  assert.ok(p.teacherNotebook.practicalActivity.includes('Ejercicio único'), `Debe incluir ejercicio en variante: ${v}`);
}

console.log('  ✅ [PASS] TEST 4: Las 14 variantes léxicas de Taller fueron reconocidas e integradas al 100%.\n');

console.log('================================================================');
console.log('TODAS LAS PRUEBAS DE TALLER SUPERADAS EXITOSAMENTE (100% PASS)');
console.log('================================================================');
