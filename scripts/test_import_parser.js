/**
 * TEST SUITE: IMPORTADOR SEMÁNTICO INTELIGENTE (10 TESTS REQ. 124)
 */

const assert = require('assert');
const ImportParser = require('../js/services/import-parser.js');
const ImportService = require('../js/services/import-service.js');

console.log('================================================================');
console.log('TEST SUITE: IMPORTADOR INTELIGENTE (REQ. 124)');
console.log('================================================================\n');

// -------------------------------------------------------------------
// TEST 1: Texto completo exactamente como el ejemplo proporcionado (Req. 62)
// -------------------------------------------------------------------
console.log('--- TEST 1: Ejemplo Institucional Completo (Parte 1 y Parte 2) ---');
const text1 = `
PARTE 1: SECUENCIA DIDÁCTICA ESTRUCTURADA PARA FORMATO INSTITUCIONAL

INFORMACIÓN GENERAL

Asignatura: Tecnología e Informática
Grado: Segundo
Clase #: 2
Tiempo: 60 minutos
Fecha límite del periodo: 5 de noviembre
Eje temático principal: Concepto, origen y evolución de la tecnología

TEMAS DEL PRIMER PERIODO

- Concepto, origen y evolución de la tecnología.
- Impacto de la tecnología en el desarrollo humano.

DESEMPEÑOS DE APRENDIZAJE

- Reconoce la importancia de la tecnología en la vida cotidiana.
- Identifica artefactos tecnológicos del entorno.

FASE DE INICIO (15 minutos)

Saludo institucional, motivación inicial y lluvia de ideas sobre herramientas que usan en casa.

FASE DE DESARROLLO (35 minutos)

Explicación sobre la evolución de la tecnología desde la rueda hasta el computador.
Elaboración guiada de una línea de tiempo dibujada en el cuaderno.

FASE DE CIERRE (10 minutos)

Ronda de conclusiones y preguntas rápidas.

RECURSOS Y MATERIALES

Tablero, marcadores, láminas ilustrativas, cuaderno.

TAREAS / ACTIVIDADES EXTRACLASE

Recortar y pegar tres artefactos tecnológicos antiguos y tres modernos.

EVALUACIÓN FORMATIVA

Participación activa en la lluvia de ideas y revisión de la línea de tiempo.

PARTE 2: CUADERNO DEL DOCENTE / GUÍA DETALLADA DE CLASE

PLANEACIÓN DE CLASE

Pregunta problematizadora: ¿Cómo ha cambiado la vida de las personas gracias a los inventos tecnológicos?

ESTRUCTURA GENERAL DEL PRIMER PERIODO

- Eje 1: Origen de las herramientas
- Eje 2: La electricidad y los aparatos modernos

DINÁMICA DE CLASE Y REGLAS DE JUEGO

Dinámica de preguntas en cadena con la pelota preguntona.
Reglas: Respetar el turno de la palabra y cuidar los materiales del aula.

GUÍA DE CONTENIDO DETALLADA PARA EL CUADERNO DEL ESTUDIANTE

Título: ¿Qué es la tecnología?
La tecnología es el conjunto de conocimientos y herramientas que el ser humano ha creado para resolver problemas y facilitar su vida cotidiana.

TALLER / EJERCICIO PRÁCTICO DE LA CLASE

Paso 1: Escribir el concepto en el cuaderno.
Paso 2: Dibujar dos inventos que utilices a diario.
Paso 3: Explicar a tu compañero para qué sirve cada uno.
`;

const res1 = ImportParser.parse(text1);
assert.strictEqual(res1.metadata.subject, 'Tecnología e Informática');
assert.strictEqual(res1.metadata.grade, 'Segundo');
assert.strictEqual(res1.metadata.sequenceNumber, 2);
assert.strictEqual(res1.metadata.duration, 60);
assert.strictEqual(res1.curriculum.topic, 'Concepto, origen y evolución de la tecnología');
assert.strictEqual(res1.curriculum.periodTopics.length, 2);
assert.strictEqual(res1.curriculum.periodPerformances.length, 2);

assert.strictEqual(res1.didacticSequence.durations.inicio, 15);
assert.strictEqual(res1.didacticSequence.durations.desarrollo, 35);
assert.strictEqual(res1.didacticSequence.durations.cierre, 10);
assert.ok(res1.didacticSequence.inicio.includes('Saludo institucional'));
assert.ok(res1.didacticSequence.desarrollo.includes('Explicación sobre la evolución'));
assert.ok(res1.didacticSequence.cierre.includes('Ronda de conclusiones'));
assert.ok(res1.didacticSequence.recursos.includes('Tablero'));
assert.ok(res1.didacticSequence.tareas.includes('Recortar y pegar'));
assert.ok(res1.didacticSequence.evaluation.includes('Participación activa'));

// Parte 2
assert.ok(res1.teacherNotebook.question.includes('¿Cómo ha cambiado la vida'));
assert.strictEqual(res1.teacherNotebook.periodStructure.length, 2);
assert.ok(res1.teacherNotebook.dynamics.includes('pelota preguntona'));
assert.ok(res1.teacherNotebook.studentNotebookContent.includes('Título: ¿Qué es la tecnología?'));
assert.ok(res1.teacherNotebook.practicalActivity.includes('Paso 1: Escribir'));
assert.ok(res1.teacherNotebook.sourceText === text1);
console.log('  ✅ [PASS] TEST 1: Analiza exitosamente las dos partes completas.\n');

// -------------------------------------------------------------------
// TEST 2: Texto sin Markdown
// -------------------------------------------------------------------
console.log('--- TEST 2: Texto plano sin formato Markdown ---');
const text2 = `
INFORMACION GENERAL
Asignatura: Matematicas
Grado: 4A
Clase: 5
TEMA: Fracciones equivalentes

INICIO
Repaso de la pizza y partes iguales.

DESARROLLO
Uso de regletas de Cuisenaire y ejercicios en el tablero.

CIERRE
Evaluacion oral rapida.
`;
const res2 = ImportParser.parse(text2);
assert.strictEqual(res2.metadata.subject, 'Matematicas');
assert.strictEqual(res2.metadata.grade, '4A');
assert.strictEqual(res2.metadata.sequenceNumber, 5);
assert.strictEqual(res2.curriculum.topic, 'Fracciones equivalentes');
assert.ok(res2.didacticSequence.inicio.includes('Repaso de la pizza'));
assert.ok(res2.didacticSequence.desarrollo.includes('regletas'));
console.log('  ✅ [PASS] TEST 2: Parser interpreta texto plano sin formato Markdown.\n');

// -------------------------------------------------------------------
// TEST 3: Texto con fuerte formato Markdown (**negritas**, viñetas, almohadillas)
// -------------------------------------------------------------------
console.log('--- TEST 3: Texto con Markdown agresivo ---');
const text3 = `
# **PARTE 1: SECUENCIA DIDÁCTICA**

**INFORMACIÓN GENERAL**
* **Asignatura:** **Robótica**
* **Grado:** **10°**
* **Clase #:** **7**
* **Tema:** **Servomotores y Control PWM**

### **FASE DE INICIO (20 minutos)**
**Conexión de saberes previos** sobre motores DC vs Servomotores.

### **FASE DE DESARROLLO (40 minutos)**
* Práctica en protoboard con Arduino.
* Código en C++ usando servo.write().

### **FASE DE CIERRE (10 minutos)**
Verificación de los grados de giro de cada equipo.
`;
const res3 = ImportParser.parse(text3);
assert.strictEqual(res3.metadata.subject, 'Robótica');
assert.strictEqual(res3.metadata.grade, '10°');
assert.strictEqual(res3.metadata.sequenceNumber, 7);
assert.strictEqual(res3.curriculum.topic, 'Servomotores y Control PWM');
assert.strictEqual(res3.didacticSequence.durations.inicio, 20);
assert.strictEqual(res3.didacticSequence.durations.desarrollo, 40);
assert.ok(res3.didacticSequence.desarrollo.includes('Práctica en protoboard'));
console.log('  ✅ [PASS] TEST 3: Maneja Markdown sin romper datos ni encabezados.\n');

// -------------------------------------------------------------------
// TEST 4: Títulos con ligeras variaciones
// -------------------------------------------------------------------
console.log('--- TEST 4: Títulos con variaciones semánticas ---');
const text4 = `
Materia: Ciencias Naturales
Curso: Quinto
Sesion #: 12
Eje Tematico: La Celula Animal y Vegetal

FASE INICIAL (10 min)
Video corto de comparacion.

DESARROLLO DE LA CLASE (30 min)
Observacion en microscopio de muestras de cebolla.

CIERRE DE LA CLASE (10 min)
Dibujo comparativo en el cuaderno.

MATERIALES DIDACTICOS
Microscopio, laminas portaobjetos, cebolla.

COMPROMISOS
Consultar sobre las mitocondrias.
`;
const res4 = ImportParser.parse(text4);
assert.strictEqual(res4.metadata.subject, 'Ciencias Naturales');
assert.strictEqual(res4.metadata.grade, 'Quinto');
assert.strictEqual(res4.metadata.sequenceNumber, 12);
assert.strictEqual(res4.curriculum.topic, 'La Celula Animal y Vegetal');
assert.strictEqual(res4.didacticSequence.durations.inicio, 10);
assert.strictEqual(res4.didacticSequence.durations.desarrollo, 30);
assert.ok(res4.didacticSequence.recursos.includes('Microscopio'));
assert.ok(res4.didacticSequence.tareas.includes('mitocondrias'));
console.log('  ✅ [PASS] TEST 4: Variaciones de nombres reconocidas con éxito.\n');

// -------------------------------------------------------------------
// TEST 5: Texto sin DBA (Preservación de DBA existente)
// -------------------------------------------------------------------
console.log('--- TEST 5: Texto sin DBA (Merge inteligente) ---');
const text5 = `
Tema: Ecosistemas Terrestres
Inicio: Pregunta inicial.
Desarrollo: Lectura de texto.
Cierre: Reflexion.
`;
const res5 = ImportParser.parse(text5);
assert.strictEqual(res5.curriculum.dba, '');
assert.ok(res5.warnings.some(w => w.includes('DBA')));

// Probar merge con clase existente que ya tenía DBA
const existingClass = {
  id: 'cls_test_5',
  teacherId: 'usr_manuel',
  sequenceNumber: 3,
  curriculum: {
    topic: 'Tema Antiguo',
    dba: 'DBA 4 - Explica la estructura de los ecosistemas.',
    achievement: 'Logro antiguo'
  },
  didacticSequence: {
    inicio: 'Inicio viejo',
    desarrollo: 'Desarrollo viejo'
  },
  teacherNotebook: {}
};

const applied = ImportService.applyToExistingClass(existingClass, res5);
assert.strictEqual(applied.curriculum.topic, 'Ecosistemas Terrestres'); // Actualizado
assert.strictEqual(applied.curriculum.dba, 'DBA 4 - Explica la estructura de los ecosistemas.'); // PRESERVADO
console.log('  ✅ [PASS] TEST 5: Merge inteligente preserva DBA preexistente.\n');

// -------------------------------------------------------------------
// TEST 6: Texto sin tareas
// -------------------------------------------------------------------
console.log('--- TEST 6: Texto sin tareas ---');
const text6 = `
Tema: Multiplicación por dos cifras
Inicio: Calentamiento de tablas.
Desarrollo: Ejercicios guiados.
Cierre: Resumen.
`;
const res6 = ImportParser.parse(text6);
assert.strictEqual(res6.didacticSequence.tareas, '');
assert.ok(res6.detected.topic);
console.log('  ✅ [PASS] TEST 6: Texto sin tareas procesado sin errores.\n');

// -------------------------------------------------------------------
// TEST 7: Texto con contenido muy extenso
// -------------------------------------------------------------------
console.log('--- TEST 7: Texto muy extenso (resistencia a volumen) ---');
const longParagraph = 'Este es un párrafo de desarrollo detallado con amplia explicación conceptual. '.repeat(100);
const text7 = `
Tema: Historia de la Informática
Inicio: Introducción rápida.
Desarrollo:
${longParagraph}
Cierre: Conclusiones.
`;
const res7 = ImportParser.parse(text7);
assert.ok(res7.didacticSequence.desarrollo.length > 5000);
console.log('  ✅ [PASS] TEST 7: Contenido extenso conservado en su totalidad.\n');

// -------------------------------------------------------------------
// TEST 8: Listas estructuradas
// -------------------------------------------------------------------
console.log('--- TEST 8: Listas estructuradas preservadas ---');
const text8 = `
TEMAS DEL PERIODO
• Elemento 1: Algoritmos
• Elemento 2: Diagramas de Flujo
• Elemento 3: Variables y Constantes
`;
const res8 = ImportParser.parse(text8);
assert.strictEqual(res8.curriculum.periodTopics.length, 3);
assert.strictEqual(res8.curriculum.periodTopics[0], 'Elemento 1: Algoritmos');
console.log('  ✅ [PASS] TEST 8: Viñetas extraídas como elementos limpios de lista.\n');

// -------------------------------------------------------------------
// TEST 9: Números de pasos en la actividad práctica
// -------------------------------------------------------------------
console.log('--- TEST 9: Números de pasos preservados en Actividad Práctica ---');
const text9 = `
TALLER / EJERCICIO PRÁCTICO
Paso 1: Abrir el entorno Scratch.
Paso 2: Crear un nuevo sprite.
Paso 3: Programar el bloque 'Al presionar bandera verde'.
`;
const res9 = ImportParser.parse(text9);
assert.ok(res9.teacherNotebook.practicalActivity.includes('Paso 1: Abrir'));
assert.ok(res9.teacherNotebook.practicalActivity.includes('Paso 2: Crear'));
assert.ok(res9.teacherNotebook.practicalActivity.includes('Paso 3: Programar'));
console.log('  ✅ [PASS] TEST 9: Pasos secuenciales intactos sin alteración.\n');

// -------------------------------------------------------------------
// TEST 10: Emojis y caracteres especiales
// -------------------------------------------------------------------
console.log('--- TEST 10: Emojis y caracteres especiales ---');
const text10 = `
Tema: Programación Divertida 🚀💻✨
Inicio: Saludo con entusiasmo 😊 y dinámica de aplausos 👏
Desarrollo: Configuración de variables (x = 10, y ≤ 20, a ≠ b & c > 5).
Cierre: ¡Meta cumplida! 🏆
`;
const res10 = ImportParser.parse(text10);
assert.ok(res10.curriculum.topic.includes('🚀💻✨'));
assert.ok(res10.didacticSequence.inicio.includes('😊'));
assert.ok(res10.didacticSequence.desarrollo.includes('x = 10, y ≤ 20, a ≠ b & c > 5'));
console.log('  ✅ [PASS] TEST 10: Emojis y caracteres especiales preservados 100%.\n');

// -------------------------------------------------------------------
// TEST 11 (BONUS): Regla de Identidad (Clase #7 vs Clase #2)
// -------------------------------------------------------------------
console.log('--- TEST 11 (BONUS): Regla de Identidad y Protección de Consecutivo ---');
const targetCls7 = {
  id: 'cls_target_7',
  teacherId: 'usr_manuel',
  sequenceNumber: 7,
  gradeName: 'Tercero',
  date: '2026-09-20'
};

const parsedCls2 = ImportParser.parse(`
Clase #: 2
Grado: Segundo
Tema: Nuevo Tema
Inicio: Inicio
Desarrollo: Desarrollo
Cierre: Cierre
`);

const prep = ImportService.prepareImport(`Clase #: 2\nGrado: Segundo\nTema: Nuevo Tema`, targetCls7);
assert.strictEqual(prep.hasConflicts, true);
assert.ok(prep.conflicts.some(c => c.type === 'sequenceNumber'));
assert.ok(prep.conflicts.some(c => c.type === 'grade'));

// Aplicar sin decisiones explicitas -> Debe conservar la identidad por defecto (Clase #7 y Tercero)
const appliedDefault = ImportService.applyToExistingClass(targetCls7, parsedCls2);
assert.strictEqual(appliedDefault.sequenceNumber, 7); // Conservó #7
assert.strictEqual(appliedDefault.gradeName, 'Tercero'); // Conservó Tercero
assert.strictEqual(appliedDefault.curriculum.topic, 'Nuevo Tema'); // Incorporó contenido

console.log('  ✅ [PASS] TEST 11: Regla de identidad protegió el número y grado de la clase actual.\n');

console.log('================================================================');
console.log('TODAS LAS 11 PRUEBAS DEL IMPORTADOR SUPERADAS AL 100% (PASS)');
console.log('================================================================');
