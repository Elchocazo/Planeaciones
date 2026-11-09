/**
 * Test verifying:
 * 1. Removal of stray pagination artifacts ("Hoja 2", "Margen 1.27 cm", etc.)
 * 2. Proper conversion of LaTeX arrows (\rightarrow, /right, etc.) into '→'
 * 3. Prevention of false step splitting for "Ejemplo resuelto paso a paso:"
 */
const assert = require('assert');
const ImportParser = require('../js/services/import-parser.js');

const rawInput = `📌 Hoja 2
• Margen 1.27 cm
• Paso 1 (Alineación): Escribir los sumandos verticalmente haciendo coincidir con exactitud Unidades bajo Unidades (U), Decenas bajo Decenas (D), Centenas bajo Centenas (C), Unidades de Mil bajo Unidades de Mil (UM), Decenas de Mil bajo Decenas de Mil (DM) y Centenas de Mil bajo Centenas de Mil (CM). El punto de separación de mil debe formar una línea vertical perfecta.
• Paso 2 (Dirección): Comenzar a sumar siempre de derecha a izquierda, empezando por las unidades simples (U).
• Paso 3 (Reagrupación visual): Anotar con color rojo la cifra que se reagrupa en la parte superior de la siguiente columna para no olvidar sumarla.
• Paso 4 (Continuidad): Repetir el proceso columna por columna hasta llegar a las Centenas de Mil (CM).
• Ejemplo resuelto paso a paso:
Operación: 538.746 + 284.585
• Columna U: 6 + 5 = 11 \\rightarrow Escribo 1 en el total y reagrupo 1 en las decenas.
• Columna D: 4 + 8 = 12, más 1 que llevaba = 13 \\rightarrow Escribo 3 en el total y reagrupo 1 en las centenas.
• Columna C: 7 + 5 = 12, más 1 que llevaba = 13 \\rightarrow Escribo 3 en el total y reagrupo 1 en las unidades de mil.
• Columna UM: 8 + 4 = 12, más 1 que llevaba = 13 \\rightarrow Escribo 3 en el total y reagrupo 1 en las decenas de mil.
• Columna DM: 3 + 8 = 11, más 1 que llevaba = 12 \\rightarrow Escribo 2 en el total y reagrupo 1 en las centenas de mil.
• Columna CM: 5 + 2 = 7, más 1 que llevaba = 8 \\rightarrow Escribo 8 en el total.
• Resultado final: 823.331 (Se lee: Ochocientos veintitrés mil trescientos treinta y uno).
• Conexión con la clase siguiente:
Habiendo consolidado el algoritmo formal de la suma agrupando con números de hasta seis cifras, en la clase 17 avanzaremos hacia la resolución de problemas aditivos contextualizados de cambio y combinación en compras y finanzas del entorno.
📌 Hoja 3
• Margen 1.27 cm`;

const cleanedText = ImportParser.cleanDocumentArtifacts(rawInput);
console.log('--- CLEANED TEXT ---\n' + cleanedText + '\n');

const html = ImportParser.formatMarkdownToHtml(rawInput);
console.log('--- GENERATED HTML ---\n' + html + '\n');

// 1. No stray Hoja or Margen
assert.ok(!/Hoja\s+[23]/i.test(html), 'No debe contener Hoja 2 ni Hoja 3');
assert.ok(!/Margen\s+1\.27/i.test(html), 'No debe contener Margen 1.27 cm');

// 2. LaTeX arrows must become real arrows →
assert.ok(!/\\rightarrow|\\to|\/right/i.test(html), 'No debe quedar \\rightarrow');
assert.ok(html.includes('→'), 'Debe incluir flecha → real');

// 3. "paso a paso:" must NOT become 🛠️ paso a paso:
assert.ok(!/<h3[^>]*>[^<]*paso a paso/i.test(html), 'paso a paso no debe ser un h3 con martillo');
assert.ok(html.includes('Ejemplo resuelto paso a paso:'), 'Debe conservar "Ejemplo resuelto paso a paso:" unido');

console.log('✅ TEST REPORTADO: Todos los errores corregidos.');
