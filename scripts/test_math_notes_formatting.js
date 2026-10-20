const assert = require('assert');
const ImportParser = require('../js/services/import-parser.js');
const NotebookEditor = require('../js/notebook-editor.js');

console.log('================================================================');
console.log('TEST SUITE: FORMATEO PEDAGÓGICO DE APUNTES MATEMÁTICOS');
console.log('================================================================\n');

const userNotes = `• La Sustracción de Números Enteros Restar dos números enteros significa encontrar la diferencia entre ellos. Regla fundamental: La resta se define como la suma del opuesto del segundo número (el sustraendo). $$a - b = a + (-b)$$ Ejemplos: • (+9) - (+4) equivale a (+9) + (-4) = +5 • (+6) - (-5) equivale a (+6) + (+5) = +11 • (-8) - (+3) equivale a (-8) + (-3) = -11 • (-10) - (-7) equivale a (-10) + (+7) = -3 • Uso de la Ley de Signos para Eliminar Paréntesis Rápidamente Para agilizar los cálculos y no escribir tantos paréntesis ni signos repetidos, usamos la regla de interacción de dos signos consecutivos: • +(+) se convierte en + • -(-) se convierte en + (quitar una deuda equivale a tener saldo a favor) • +(-) se convierte en - • -(+) se convierte en-Regla de memoria fácil: • Signos consecutivos IGUALES se reemplazan por un signo MÁS (+). • Signos consecutivos DIFERENTES se reemplazan por un signo MENOS (-). • Método Rápido para Resolver Cadenas de Operaciones (Polinomios Aritméticos Básicos) Para resolver una expresión larga con sumas y restas, seguimos estos tres pasos ordenados: • Paso A: Eliminar todos los paréntesis usando la regla de los signos dobles. • Paso B: Agrupar por separado todos los números positivos y todos los números negativos. • Paso C: Sumar cada grupo y hacer la resta final, conservando el signo del número con mayor valor absoluto. Ejemplo paso a paso: Resolver la expresión: (+12) - (-8) + (-5) - (+7) + (-3) • Paso A (Eliminar paréntesis): = 12 + 8 - 5 - 7 - 3 • Paso B (Agrupar positivos y negativos): Positivos: 12 + 8 = +20 Negativos: -5 - 7 - 3 = -15 (se suman las deudas) • Paso C (Resta final): = +20 - 15 = +5 • Resumen Clave para Consignar • Restar es lo mismo que sumar el número opuesto. • -(-) siempre se cambia por +. • +(-) o -(+) siempre se cambia por -. • Una vez quitados los paréntesis, agrupamos positivos por un lado y negativos por el otro para hacer una sola resta final. • Conexión con la siguiente clase En la siguiente clase abordaremos problemas contextualizados de balances contables y variaciones extremas de temperatura aplicando este método simplificado, preparando el camino hacia la multiplicación formal de enteros.`;

console.log('--- TEST 1: Formateo desde texto plano/Markdown ---');
const html1 = ImportParser.formatMarkdownToHtml(userNotes);

assert.ok(html1.includes('La Sustracción de Números Enteros'), 'Debe contener título 1');
assert.ok(html1.includes('Uso de la Ley de Signos para Eliminar Paréntesis Rápidamente'), 'Debe contener título 2');
assert.ok(html1.includes('Método Rápido para Resolver Cadenas de Operaciones (Polinomios Aritméticos Básicos)'), 'Debe contener título 3');
assert.ok(html1.includes('Resumen Clave para Consignar'), 'Debe contener título 4');
assert.ok(html1.includes('Conexión con la siguiente clase'), 'Debe contener título 5');
assert.ok(html1.includes('notebook-math-block'), 'Debe contener bloque de fórmula matemática');
assert.ok(html1.includes('a - b = a + (-b)'), 'Fórmula matemática intacta');
assert.ok(html1.includes('Regla fundamental:'), 'Debe contener caja de Regla fundamental');
assert.ok(html1.includes('Regla de memoria fácil:'), 'Debe contener caja de Regla de memoria fácil');
assert.ok(html1.includes('Ejemplo paso a paso:'), 'Debe contener caja de Ejemplo paso a paso');
assert.ok(!html1.includes('en-Regla'), 'No debe quedar la errata en-Regla');
assert.ok(html1.includes('<ul') && html1.includes('<li'), 'Debe estructurar listas viñeteadas');

console.log('  ✅ [PASS] TEST 1: Texto plano transformado en HTML enriquecido con títulos, cajas y matemáticas.\n');

console.log('--- TEST 2: Formateo desde HTML envuelto en párrafo único (<p>...</p>) ---');
const wrappedHtml = `<p>${userNotes}</p>`;
const html2 = NotebookEditor.formatNotebookHtml(wrappedHtml);

assert.ok(html2.includes('La Sustracción de Números Enteros'), 'Cuaderno detecta y desempaca títulos en HTML');
assert.ok(html2.includes('notebook-math-block'), 'Cuaderno crea bloque matemático');
assert.ok(html2.includes('<ul') && html2.includes('<li'), 'Cuaderno desempaca viñetas inline en <ul><li>');
assert.ok(!html2.includes('en-Regla'), 'Cuaderno corrige guión accidental');

console.log('  ✅ [PASS] TEST 2: Cuaderno docente desempaca párrafos colapsados con viñetas múltiples.\n');

console.log('--- TEST 3: Preparación inicial de clase con apuntes desorganizados ---');
const mockClass = {
  id: 'cls_test_math_notes',
  subject: 'Matemáticas',
  grade: '7°',
  topic: 'Sustracción de números enteros',
  notebookContent: wrappedHtml
};

const initialHtml = NotebookEditor._prepareInitialHtml(mockClass);
assert.ok(initialHtml.includes('<h2'), 'Debe incluir etiquetas de encabezado H2');
assert.ok(initialHtml.includes('notebook-math-block'), 'Debe incluir bloques matemáticos');

console.log('  ✅ [PASS] TEST 3: _prepareInitialHtml auto-organiza la clase al abrir el cuaderno.\n');

console.log('--- TEST 4: Prevención y desarmado de cuadros azules automáticos al pegar ---');
const sampleWithEjemplo = `La resta NO es asociativa: No se puede cambiar la forma de agrupar.

Ejemplo:
*

[(+8) - (+5)] - (+2) = +1
`;

const formattedNoCallout = NotebookEditor.formatNotebookHtml(sampleWithEjemplo, true);
assert.ok(!formattedNoCallout.includes('notebook-callout concept'), 'No debe generar cuadros azules para Ejemplo:');
assert.ok(formattedNoCallout.includes('Ejemplo:'), 'Debe conservar el texto Ejemplo:');

const calloutHtmlBroken = `<div class="notebook-callout concept"><strong style="color:#1d4ed8;">Ejemplo:</strong> *</div>`;
const unwrapped = NotebookEditor._cleanAutoCallouts(calloutHtmlBroken);
assert.ok(!unwrapped.includes('notebook-callout'), '_cleanAutoCallouts debe desenvolver cuadros azules automáticos');
assert.ok(unwrapped.includes('Ejemplo:'), 'Debe preservar el contenido del ejemplo como párrafo');

console.log('  ✅ [PASS] TEST 4: Cero cuadros azules conflictivos en Ejemplo/Paso/Regla; se desenvuelven como párrafos limpios.\n');

console.log('================================================================');
console.log('RESULTADO FINAL: TODAS LAS PRUEBAS DE APUNTES MATEMÁTICOS SUPERADAS');
console.log('================================================================\n');
