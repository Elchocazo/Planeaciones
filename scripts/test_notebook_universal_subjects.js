const assert = require('assert');
const ImportParser = require('../js/services/import-parser.js');
global.ImportParser = ImportParser;
const NotebookEditor = require('../js/notebook-editor.js');

console.log('================================================================');
console.log('  TEST SUITE: FORMATEO UNIVERSAL DEL CUADERNO PEDAGÓGICO');
console.log('================================================================\n');

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`        ${err.message}`);
    failedCount++;
  }
}

// -------------------------------------------------------------
// CASO A: MATEMÁTICAS (Operaciones, signos, ejemplos, solucionario)
// -------------------------------------------------------------
runTest('Caso A: Matemáticas - Ley de signos, jerarquía, ejemplos con *, taller', () => {
  const mathText = `Conceptos clave
Los números relativos son aquellos que se usan para indicar una posición o cambio con respecto a un punto de referencia.

Números relativos en la vida real
En la vida cotidiana encontramos situaciones donde se requieren números positivos y negativos.

Valor absoluto
El valor absoluto de un número entero es la distancia al cero.
| -5 | = 5 y | +5 | = 5.

Ley de signos
En la multiplicación y división de números enteros:
+ por + = +
- por - = +
+ por - = -
- por + = -

Jerarquía de operaciones
1. Operaciones dentro de paréntesis.
2. Potencias y raíces.
3. Multiplicaciones y divisiones.
4. Sumas y restas.

Ejemplos resueltos
Ejemplo 1: (+12) + (-5) = +7
Ejemplo 2: (-8) - (-3) = -8 + 3 = -5
Ejemplo 3: (-4) * (+6) = -24

Taller de actividades
1. Resuelve las siguientes operaciones:
a) (-15) + (+7)
b) (-9) - (-12)
c) (-3) * (-8)

Solucionario del docente
1. a) -8, b) +3, c) +24`;

  const html = ImportParser.formatMarkdownToHtml(mathText);

  // 1. Títulos reconocidos como H2 con iconos
  assert.ok(html.includes('<h2'), 'Debe generar encabezados H2');
  assert.ok(html.includes('Conceptos clave</h2>'), 'Debe reconocer Conceptos clave como H2');
  assert.ok(html.includes('Números relativos en la vida real</h2>'), 'Debe reconocer Números relativos como H2');
  assert.ok(html.includes('Ley de signos</h2>'), 'Debe reconocer Ley de signos como H2');
  assert.ok(html.includes('Jerarquía de operaciones</h2>'), 'Debe reconocer Jerarquía de operaciones como H2');
  assert.ok(html.includes('Ejemplos resueltos</h2>'), 'Debe reconocer Ejemplos resueltos como H2');

  // 2. Conservación del signo menos en la ley de signos (sin stripping de viñeta)
  assert.ok(html.includes('- por - = +'), 'Debe conservar el signo menos (-) en "- por - = +"');
  assert.ok(html.includes('- por + = -'), 'Debe conservar el signo menos (-) en "- por + = -"');

  // 3. Conservación del operador de multiplicación *
  assert.ok(html.includes('(-4) * (+6) = -24'), 'Debe conservar el asterisco de multiplicación (*) sin convertirlo en cursiva');

  // 4. Jerarquía como lista ordenada <ol>
  assert.ok(html.includes('<ol'), 'Debe estructurar la jerarquía de operaciones como lista <ol>');
  assert.ok(html.includes('Operaciones dentro de paréntesis.'), 'Debe incluir ítem de lista');

  // 5. Ejemplos resueltos con saltos de línea y etiquetas resaltadas
  assert.ok(html.includes('Ejemplo 1:</strong>'), 'Debe resaltar Ejemplo 1:');
  assert.ok(html.includes('Ejemplo 2:</strong>') || html.includes('<strong>Ejemplo 2:</strong>'), 'Debe resaltar Ejemplo 2:');
  assert.ok(html.includes('Ejemplo 3:</strong>') || html.includes('<strong>Ejemplo 3:</strong>'), 'Debe resaltar Ejemplo 3:');
});

// -------------------------------------------------------------
// CASO B: LENGUA CASTELLANA / LITERATURA (Poema, estrofas, rima)
// -------------------------------------------------------------
runTest('Caso B: Lengua Castellana - Poema, estrofas y análisis literario', () => {
  const spanishText = `El género lírico y la poesía
La poesía es una manifestación de la belleza o del sentimiento estético por medio de la palabra en verso o en prosa.

Soneto de la esperanza
En la tarde serena y perfumada
se escucha el canto dulce de un jilguero,
mientras camina lento el marinero
hacia la playa limpia y desolada.

Estructura formal del poema
• Número de estrofas: Una estrofa cuarteto.
• Métrica: Versos endecasílabos (11 sílabas).
• Tipo de rima: Rima consonante (perfumada / desolada, jilguero / marinero).

Actividad de interpretación
1. ¿Cuál es el sentimiento predominante en los versos?
2. Identifica dos figuras literarias presentes en el texto:
a) Metáfora
b) Personificación`;

  const html = ImportParser.formatMarkdownToHtml(spanishText);

  // Título principal reconocido
  assert.ok(html.includes('El género lírico y la poesía</h2>'), 'Debe reconocer el título de Lengua');
  assert.ok(html.includes('Soneto de la esperanza</h2>'), 'Debe reconocer el título del poema');

  // Estrofas preservadas con saltos de renglón <br/> sin fusionarse en una línea corrida
  assert.ok(html.includes('En la tarde serena y perfumada<br/>se escucha el canto dulce de un jilguero'), 'Debe preservar los versos del poema con <br/>');

  // Viñetas de análisis estructuradas
  assert.ok(html.includes('<ul'), 'Debe estructurar las viñetas de análisis métrico');
  assert.ok(html.includes('Número de estrofas:'), 'Debe contener los ítems de métrica');

  // Sub-incisos a) y b) estructurados
  assert.ok(html.includes('a)</strong>') || html.includes('a)'), 'Debe incluir incisos con letras');
});

// -------------------------------------------------------------
// CASO C: CIENCIAS NATURALES / BIOLOGÍA (Célula, orgánulos, funciones)
// -------------------------------------------------------------
runTest('Caso C: Ciencias Naturales - Estructura celular y orgánulos', () => {
  const scienceText = `La célula eucariota y sus funciones
La célula es la unidad fundamental de los seres vivos capaz de realizar todas las funciones vitales.

Orgánulos principales
• Membrana plasmática: Bicapa lipídica que regula el paso de sustancias.
• Núcleo celular: Contiene el material genético (ADN) y dirige las actividades celulares.
• Mitocondrias: Responsables de la respiración celular y producción de energía (ATP).
• Cloroplastos: Presentes en células vegetales para la fotosíntesis.

Diferencias clave entre célula animal y vegetal
1. La célula vegetal posee pared celular de celulosa y cloroplastos.
2. La célula animal posee centríolos y vacuolas de menor tamaño.

Preguntas de autoevaluación
1. ¿Cuál es la función principal de la mitocondria?
2. Explica qué ocurriría si la membrana celular perdiera su permeabilidad selectiva.`;

  const html = ImportParser.formatMarkdownToHtml(scienceText);

  assert.ok(html.includes('La célula eucariota y sus funciones</h2>'), 'Debe reconocer título de Biología');
  assert.ok(html.includes('Orgánulos principales</h2>'), 'Debe reconocer Orgánulos como H2');
  assert.ok(html.includes('Diferencias clave entre célula animal y vegetal</h2>'), 'Debe reconocer Diferencias clave como H2');
  assert.ok(html.includes('<ul'), 'Debe formatear orgánulos como lista <ul>');
  assert.ok(html.includes('Membrana plasmática:</strong>') || html.includes('Membrana plasmática:'), 'Debe resaltar orgánulos');
  assert.ok(html.includes('<ol'), 'Debe formatear lista numerada');
});

// -------------------------------------------------------------
// CASO D: CIENCIAS SOCIALES / HISTORIA (Revolución Industrial)
// -------------------------------------------------------------
runTest('Caso D: Ciencias Sociales - Revolución Industrial y consecuencias', () => {
  const historyText = `La Primera Revolución Industrial
Proceso de transformación económica, social y tecnológica que se inició en la segunda mitad del siglo XVIII en el Reino de Gran Bretaña.

Causas del fenómeno
• Crecimiento demográfico en las ciudades.
• Invención de la máquina de vapor de James Watt (1769).
• Abundancia de carbón y mineral de hierro.
• Expansión del comercio colonial británico.

Consecuencias socioeconómicas
1. Surgimiento de la clase obrera (proletariado).
2. Urbanización acelerada y precarización laboral.
3. Consolidación del modelo económico capitalista industrial.

Taller práctico formativo
1. Elabora una línea de tiempo entre 1750 y 1850.
2. Responde las siguientes preguntas analíticas:
a) ¿Cómo influyó la máquina de vapor en el transporte marítimo?
b) ¿Cuáles fueron las condiciones laborales de las mujeres y los niños?`;

  const html = ImportParser.formatMarkdownToHtml(historyText);

  assert.ok(html.includes('La Primera Revolución Industrial</h2>'), 'Debe reconocer título histórico');
  assert.ok(html.includes('Causas del fenómeno</h2>'), 'Debe reconocer Causas como H2');
  assert.ok(html.includes('Consecuencias socioeconómicas</h2>'), 'Debe reconocer Consecuencias como H2');
  assert.ok(html.includes('notebook-page-break') || html.includes('notebook-student-worksheet-header'), 'Debe generar hoja independiente para taller formativo');
});

// -------------------------------------------------------------
// CASO E: TECNOLOGÍA / ROBÓTICA / PROGRAMACIÓN (C++/Arduino)
// -------------------------------------------------------------
runTest('Caso E: Robótica / Tecnología - Código Arduino y diagrama', () => {
  const techText = `Control de Servomotor con potenciómetro
En este proyecto aprenderemos a controlar el ángulo de giro de un micro servomotor SG90 mediante un potenciómetro análogo conectado al pin A0 de una placa Arduino Uno.

Materiales necesarios
• 1 Placa Arduino Uno R3 con cable USB.
• 1 Servomotor SG90 (0 a 180 grados).
• 1 Potenciómetro lineal de 10k ohmios.
• Cables jumpers macho-macho y protoboard.

Código fuente del programa
\`\`\`cpp
#include <Servo.h>

Servo miServo;
const int potPin = A0;
int valorPot = 0;
int angulo = 0;

void setup() {
  miServo.attach(9);
  Serial.begin(9600);
}

void loop() {
  valorPot = analogRead(potPin);
  angulo = map(valorPot, 0, 1023, 0, 180);
  miServo.write(angulo);
  delay(15);
}
\`\`\`

Pasos para el montaje
Paso 1: Conecta el cable marrón del servo a GND y el rojo a 5V.
Paso 2: Conecta el cable naranja de señal del servo al pin digital 9.
Paso 3: Conecta los extremos del potenciómetro a 5V y GND, y el pin central a A0.`;

  const html = ImportParser.formatMarkdownToHtml(techText);

  assert.ok(html.includes('Control de Servomotor con potenciómetro</h2>'), 'Debe reconocer título de tecnología');
  assert.ok(html.includes('notebook-code-block'), 'Debe renderizar bloque de código estructurado');
  assert.ok(html.includes('&lt;Servo.h&gt;'), 'Debe escapar e incluir librería Servo.h sin mutilar');
  assert.ok(html.includes('void setup()'), 'Debe incluir funciones de setup y loop íntegras');
  assert.ok(html.includes('🛠️'), 'Debe incluir iconos en títulos de Paso');
});

// -------------------------------------------------------------
// CASO F: TEXTO MONOLÍTICO PEGADO SIN SALTOS (Run-on text)
// -------------------------------------------------------------
runTest('Caso F: Despegado de párrafo monolítico sin saltos de línea', () => {
  const runOn = `Conceptos clave Los números relativos son aquellos que se usan para indicar una posición o cambio con respecto a un punto de referencia. Números relativos en la vida real En la vida cotidiana encontramos situaciones donde se requieren números positivos y negativos. Positivos y negativos Los números enteros positivos se ubican a la derecha del cero y representan ganancias. Valor absoluto El valor absoluto de un número entero es la distancia que hay entre dicho número y el cero en la recta numérica. Ley de signos En la multiplicación y división de números enteros: + por + = + - por - = + + por - = - - por + = - Jerarquía de operaciones 1. Operaciones dentro de signos de agrupación. 2. Potencias y raíces. 3. Multiplicaciones y divisiones. 4. Sumas y restas. Ejemplos resueltos Ejemplo 1: (+12) + (-5) = +7 Ejemplo 2: (-8) - (-3) = -8 + 3 = -5 Ejemplo 3: (-4) * (+6) = -24 Taller de actividades 1. Resuelve las siguientes operaciones: a) (-15) + (+7) b) (-9) - (-12) c) (-3) * (-8)`;

  const unglued = ImportParser.unglueText(runOn);
  const blocks = unglued.split(/\n{2,}/);

  assert.ok(blocks.length >= 8, `El texto monolítico debe fragmentarse en al menos 8 bloques pedagógicos (se obtuvieron ${blocks.length})`);
  assert.ok(unglued.includes('Conceptos clave'), 'Debe contener Conceptos clave');
  assert.ok(unglued.includes('Ley de signos'), 'Debe contener Ley de signos');
  assert.ok(unglued.includes('Jerarquía de operaciones'), 'Debe contener Jerarquía de operaciones');
  assert.ok(unglued.includes('Ejemplos resueltos'), 'Debe contener Ejemplos resueltos');
  assert.ok(unglued.includes('Taller de actividades'), 'Debe contener Taller de actividades');
});

// -------------------------------------------------------------
// CASO G: HTML PROVENIENTE DE WORD / NAVEGADOR
// -------------------------------------------------------------
runTest('Caso G: HTML estructurado pegado desde Word / Portapapeles', () => {
  const wordHtml = `
    <div style="mso-element:para">
      <p class="MsoNormal"><b><span style="font-size:14pt">Dilemas éticos y valores ciudadanos</span></b></p>
      <p class="MsoNormal">Un dilema moral es una narración breve en la que se plantea una situación posible en el ámbito de la realidad pero conflictiva a nivel moral.</p>
      <p class="MsoNormal"><b>Principios de la bioética</b></p>
      <p class="MsoListParagraph">1. Principio de no maleficencia.</p>
      <p class="MsoListParagraph">2. Principio de beneficencia.</p>
      <p class="MsoListParagraph">3. Principio de autonomía.</p>
      <p class="MsoListParagraph">4. Principio de justicia.</p>
    </div>
  `;

  const formatted = NotebookEditor.formatNotebookHtml(wordHtml);

  assert.ok(formatted.includes('<h2'), 'Debe convertir títulos de Word en H2 estilizados');
  assert.ok(formatted.includes('Dilemas éticos y valores ciudadanos</h2>'), 'Debe reconocer título principal');
  assert.ok(formatted.includes('Principios de la bioética</h2>') || formatted.includes('<strong>Principios de la bioética</strong>'), 'Debe estructurar subtítulo de Word');
  assert.ok(formatted.includes('<ol'), 'Debe estructurar lista numerada de Word');
});

// -------------------------------------------------------------
// CASO H: COMPATIBILIDAD CON PLANES EXISTENTES / LEGACY
// -------------------------------------------------------------
runTest('Caso H: Planes legacy preservados y no corrompidos', () => {
  const legacyClass = {
    id: 'class_legacy_001',
    subject: 'Matemáticas',
    grade: '7°',
    topic: 'Números Enteros',
    teacherNotebook: '<p>Conceptos clave Los números relativos son aquellos que se usan para indicar una posición o cambio con respecto a un punto de referencia. Ley de signos En la multiplicación: + por + = + - por - = + Jerarquía de operaciones 1. Paréntesis 2. Potencias Ejemplos resueltos Ejemplo 1: (+12) + (-5) = +7 Ejemplo 2: (-4) * (+6) = -24 Taller de actividades 1. Resuelve operaciones a) (-15) + (+7) b) (-9) - (-12)</p>'
  };

  const processed = NotebookEditor.formatNotebookHtml(legacyClass.teacherNotebook);

  // Comprobar que no arrojó error y que ahora está estructurado
  assert.ok(processed.includes('<h2'), 'Plan legacy monolítico debe haber sido transformado a estructurado con H2');
  assert.ok(processed.includes('(-4) * (+6) = -24'), 'Plan legacy debe preservar multiplicación con asterisco');
  assert.ok(!processed.includes('___IMG_SHIELD'), 'No deben quedar marcadores de imágenes');
  assert.ok(!processed.includes('___CODE_BLOCK_SHIELD'), 'No deben quedar marcadores de código');
});

console.log('\n================================================================');
console.log(`  RESULTADOS: ${passedCount} APROBADAS | ${failedCount} FALLIDAS`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
