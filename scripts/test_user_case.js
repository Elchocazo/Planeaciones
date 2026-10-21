const ImportParser = require('../js/services/import-parser.js');
global.ImportParser = ImportParser;
const NotebookEditor = require('../js/notebook-editor.js');

const text = `Conceptos clave
Los números relativos son aquellos que se usan para indicar una posición o cambio con respecto a un punto de referencia.

Números relativos en la vida real
En la vida cotidiana encontramos situaciones donde se requieren números positivos y negativos, tales como temperaturas bajo cero, alturas y profundidades sobre o bajo el nivel del mar, y balances bancarios.

Positivos y negativos
Los números enteros positivos se ubican a la derecha del cero y representan ganancias, temperaturas cálidas o alturas. Los negativos se ubican a la izquierda del cero y representan pérdidas, deudas o profundidades.

Valor absoluto
El valor absoluto de un número entero es la distancia que hay entre dicho número y el cero en la recta numérica. Siempre es un valor positivo o cero.
| -5 | = 5 y | +5 | = 5.

Reglas para operar
Para sumar enteros del mismo signo, se suman sus valores absolutos y se conserva el signo común. Para sumar enteros con distinto signo, se restan sus valores absolutos y se conserva el signo del número con mayor valor absoluto.

Ley de signos
En la multiplicación y división de números enteros:
+ por + = +
- por - = +
+ por - = -
- por + = -

Jerarquía de operaciones
1. Operaciones dentro de signos de agrupación (paréntesis, corchetes, llaves).
2. Potencias y raíces.
3. Multiplicaciones y divisiones de izquierda a derecha.
4. Sumas y restas de izquierda a derecha.

Ejemplos resueltos
Ejemplo 1: (+12) + (-5) = +7
Ejemplo 2: (-8) - (-3) = -8 + 3 = -5
Ejemplo 3: (-4) * (+6) = -24

Taller de actividades
1. Resuelve las siguientes operaciones:
a) (-15) + (+7)
b) (-9) - (-12)
c) (-3) * (-8)
2. Calcula el valor absoluto de:
a) | -18 |
b) | +24 |
c) | 0 |

Solucionario del docente
1. a) -8, b) +3, c) +24
2. a) 18, b) 24, c) 0`;

console.log('=== TEST 1: Plain text with double newlines ===');
const html1 = ImportParser.formatMarkdownToHtml(text);
if (!html1.includes('Conceptos clave</h2>') || !html1.includes('(-4) * (+6) = -24') || !html1.includes('- por - = +')) {
  throw new Error('Test 1 failed: missing headings or corrupted math');
}
console.log('Test 1 PASS');

console.log('\n=== TEST 2: Plain text with SINGLE newlines (e.g. from pasted plain text / clipboard) ===');
const singleNewlineText = text.replace(/\n\n/g, '\n');
const html2 = ImportParser.formatMarkdownToHtml(singleNewlineText);
if (!html2.includes('Conceptos clave</h2>') || !html2.includes('(-4) * (+6) = -24') || !html2.includes('- por - = +')) {
  throw new Error('Test 2 failed: missing headings or corrupted math');
}
console.log('Test 2 PASS');

console.log('\n=== TEST 3: Wrapped in a single paragraph <p> (from pasted HTML or Word) ===');
const wrappedHtml = `<p>${text.replace(/\n\n/g, ' ').replace(/\n/g, ' ')}</p>`;
const html3 = NotebookEditor.formatNotebookHtml(wrappedHtml);
if (!html3.includes('Conceptos clave</h2>') || !html3.includes('(-4) * (+6) = -24')) {
  throw new Error('Test 3 failed: missing headings or corrupted math');
}
console.log('Test 3 PASS');
