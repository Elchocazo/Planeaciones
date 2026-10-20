const assert = require('assert');
const fs = require('fs');

// Cargar servicios en entorno Node
const importParserCode = fs.readFileSync('js/services/import-parser.js', 'utf8');
eval(importParserCode.replace(/const\s+ImportParser\s*=/, 'global.ImportParser ='));

console.log('================================================================');
console.log('TEST SUITE: LIMPIEZA UNIVERSAL DE ARTEFACTOS EN TODA LA APP');
console.log('================================================================\n');

// 1. Prueba de comandos LaTeX \text, /text y llaves
const t1 = '• Camión 1: $128.450\\text{ kg}$ y Camión 2: $128.540/text{ kg}$';
const c1 = ImportParser.cleanDocumentArtifacts(t1);
console.log('TEST 1:', c1);
assert.ok(!c1.includes('$'), 'No debe contener signos $');
assert.ok(!c1.includes('\\text'), 'No debe contener \\text');
assert.ok(!c1.includes('/text'), 'No debe contener /text');
assert.ok(!c1.includes('{'), 'No debe contener {');
assert.ok(!c1.includes('}'), 'No debe contener }');
assert.ok(c1.includes('128.450 kg'), 'Debe contener "128.450 kg"');
assert.ok(c1.includes('128.540 kg'), 'Debe contener "128.540 kg"');
console.log('  ✅ [PASS] TEST 1: Comandos \\text, /text, signos $ y llaves {} eliminados.');

// 2. Prueba de comparaciones matemáticas con $ y <>
const t2 = '• Secuencia: $120.000 < 135.000 < 132.500 < 140.000$';
const c2 = ImportParser.cleanDocumentArtifacts(t2);
console.log('TEST 2:', c2);
assert.ok(!c2.includes('$'), 'No debe contener $');
assert.strictEqual(c2, '• Secuencia: 120.000 < 135.000 < 132.500 < 140.000');
console.log('  ✅ [PASS] TEST 2: Secuencias matemáticas con $ saneadas a texto limpio.');

// 3. Prueba de comillas dobles y asteriscos (""** -> ")
const t3 = 'Paso 3: Reto de tablero "El número intruso""**';
const c3 = ImportParser.cleanDocumentArtifacts(t3);
console.log('TEST 3:', c3);
assert.ok(!c3.includes('*'), 'No debe contener asteriscos');
assert.ok(!c3.includes('""'), 'No debe contener comillas dobles pegadas');
assert.strictEqual(c3, 'Paso 3: Reto de tablero "El número intruso"');
console.log('  ✅ [PASS] TEST 3: Asteriscos y comillas dobles accidentales reparadas.');

// 4. Prueba del ejemplo completo del usuario pasando por formatMarkdownToHtml
const sampleUser = `Paso 3: Reto de tablero "El número intruso""** • El docente escribe la siguiente secuencia en el tablero y los alumnos deben encontrar el único número que rompe el orden de menor a mayor: • Secuencia: $120.000 < 135.000 < 132.500 < 140.000$ • Explicación y corrección: El intruso es 132.500, porque $132.500$ es menor que $135.000$ y no puede ir después de él. La posición correcta de $132.500$ es antes de $135.000$.

Paso 4: Situación problema tipo Prueba Saber

Una distribuidora de alimentos entregó bultos de grano con los siguientes pesos durante el mes:
• Camión 1: $128.450\\text{ kg}$
• Camión 2: $128.540\\text{ kg}$
• Camión 3: $125.840\\text{ kg}$`;

const htmlRes = ImportParser.formatMarkdownToHtml(sampleUser);
console.log('\n--- HTML GENERADO PARA EL CUADERNO ---');
console.log(htmlRes);

assert.ok(!htmlRes.includes('$'), 'El HTML no debe contener signos $');
assert.ok(!htmlRes.includes('\\text'), 'El HTML no debe contener \\text');
assert.ok(!htmlRes.includes('/text'), 'El HTML no debe contener /text');
assert.ok(!htmlRes.includes('{'), 'El HTML no debe contener {');
assert.ok(!htmlRes.includes('}'), 'El HTML no debe contener }');
assert.ok(!htmlRes.includes('""**'), 'El HTML no debe contener ""**');
assert.ok(htmlRes.includes('128.450 kg'), 'Debe contener 128.450 kg');
assert.ok(htmlRes.includes('128.540 kg'), 'Debe contener 128.540 kg');
assert.ok(htmlRes.includes('125.840 kg'), 'Debe contener 125.840 kg');
console.log('  ✅ [PASS] TEST 4: Documento completo procesado y estructurado con cero artefactos.');

console.log('\n================================================================');
console.log('TODAS LAS PRUEBAS DE LIMPIEZA UNIVERSAL SUPERADAS CON ÉXITO');
console.log('================================================================');
