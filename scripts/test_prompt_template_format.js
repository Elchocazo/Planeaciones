/**
 * REGRESIÓN OBLIGATORIA (Regla 16 de GEMINI.md): formato del cuaderno generado
 * a partir de la PLANTILLA OFICIAL del prompt de planeación (PARTE 1 / PARTE 2).
 */
const assert = require('assert');
const lsStore = {};
global.localStorage = { getItem: (k) => lsStore[k] || null, setItem: (k, v) => { lsStore[k] = String(v); }, removeItem: (k) => { delete lsStore[k]; }, clear: () => {} };
const ImportParser = require('../js/services/import-parser.js');

const stripTags = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const sample = `PARTE 1: SECUENCIA DIDÁCTICA ESTRUCTURADA PARA FORMATO INSTITUCIONAL

INFORMACIÓN GENERAL

Asignatura: Matemáticas
Grado: 3°
Clase #: 2
Tiempo: 60 minutos
Eje temático principal: Apertura del Segundo Período: socialización de temáticas y adición con reagrupación
DBA: Interpreta, formula y resuelve problemas aditivos de composición y transformación.
Desempeño / Logro: Resuelve adiciones con reagrupación de números hasta 999.999.

FASE DE INICIO (15 minutos)
Saludo institucional y presentación de los ejes temáticos del segundo período.

FASE DE DESARROLLO (35 minutos)
Explicación dialogada de la adición con reagrupación.

FASE DE CIERRE (10 minutos)
Síntesis grupal.

RECURSOS Y MATERIALES
Tablero, marcadores, cuaderno.

EVALUACIÓN FORMATIVA
Revisión del cuaderno.

TAREAS / ACTIVIDADES EXTRACLASE
No aplica para esta sesión.

OBSERVACIONES PEDAGÓGICAS
Acompañar a estudiantes con ritmo más lento.

PARTE 2: CUADERNO DEL DOCENTE / GUÍA DETALLADA DE CLASE

PLANEACIÓN DE CLASE

Pregunta problematizadora: ¿Cómo podemos juntar cantidades grandes sin equivocarnos?

DINÁMICA DE CLASE Y REGLAS DE JUEGO
Juego del mercado: los estudiantes compran y venden con billetes didácticos.

GUÍA DE CONTENIDO PARA EL CUADERNO DEL ESTUDIANTE
SEGUNDO PERÍODO: PENSAMIENTO NUMÉRICO
Ejes temáticos del período:
• Adición y sustracción con reagrupación.
• Noción de multiplicación y división.
Desempeños de aprendizaje:
• Identifica regularidades y patrones numéricos para estructurar secuencias y tablas de multiplicar.
• Comprende la noción de división como reparto equitativo en situaciones concretas.
• Justifica sus procedimientos con argumentos numéricos para comunicar con claridad su razonamiento matemático y validar sus resultados.
Primer tema: La Adición con números hasta 999.999 agrupando (reagrupación):
• Definición: La adición es una operación básica que nos permite juntar, agregar o combinar dos o más cantidades (sumandos) para obtener un valor final (suma o total).
• La Reagrupación: Ocurre cuando al sumar los dígitos de una misma columna posicional el total es igual o mayor a 10 unidades.
• Pasos para realizar la adición de números de hasta seis cifras:
1. Ubicar los números en columnas.
2. Sumar de derecha a izquierda.

TALLER / ACTIVIDAD PRÁCTICA DE LA CLASE
Paso 1: Consignación institucional en el cuaderno
• Diseñar la portada de "Segundo Período" y transcribir con letra clara, regla y colores los ejes temáticos, los desempeños de aprendizaje y la pregunta problematizadora de la malla curricular.
Paso 2: Ejercicios guiados de adición vertical con reagrupación en el cuaderno
Ubicar en columnas verticales, trazar la línea horizontal con regla, anotar en rojo las cifras de reserva y resolver:
• a) 478.652 + 346.589
• Total: 825.241
Paso 3: Socialización de resultados en el tablero.

NOTAS ADICIONALES DEL DOCENTE
En la siguiente clase se trabajará la sustracción con desagrupación.
`;

const parsed = ImportParser.parse(sample);
const nb = parsed.teacherNotebook.studentNotebookContent || '';
const taller = parsed.teacherNotebook.practicalActivity || '';
const nbHtml = ImportParser.formatMarkdownToHtml(nb);
const tallerHtml = ImportParser.formatMarkdownToHtml(taller);

console.log('--- CUADERNO HTML ---\n' + nbHtml + '\n');
console.log('--- TALLER HTML ---\n' + tallerHtml + '\n');

// 1. "Primer tema:" jamás se parte en "Primer" + "tema:"
assert.ok(!/<li[^>]*>\s*Primer\s*<\/li>/i.test(nbHtml), '"Primer" no debe quedar como viñeta huérfana');
assert.ok(!/>\s*tema:\s*</.test(nbHtml) && !/<strong>tema:<\/strong>/.test(nbHtml), '"tema:" no debe quedar separado de "Primer"');
assert.ok(/Primer tema:?\s*(?:<\/strong>)?\s*La Adición/i.test(nbHtml), 'Debe conservar "Primer tema: La Adición..." unido');

// 2. Frases en minúscula dentro de un paso del taller NO se convierten en títulos
assert.ok(!/<h[1-6][^>]*>[^<]*ejes temáticos[^<]*<\/h[1-6]>/i.test(tallerHtml), '"ejes temáticos" no debe ser título dentro del taller');
assert.ok(!/<h[1-6][^>]*>[^<]*desempeños de aprendizaje[^<]*<\/h[1-6]>/i.test(tallerHtml), '"desempeños de aprendizaje" no debe ser título dentro del taller');
assert.ok(stripTags(tallerHtml).includes('colores los ejes temáticos, los desempeños de aprendizaje y la pregunta problematizadora'), 'La frase del Paso 1 debe quedar íntegra');
assert.ok(/<h3[^>]*>[^<]*(?:<strong>)?Paso 2:/.test(tallerHtml), 'Paso 2 debe ser encabezado de paso, no viñeta');
assert.ok(/<h3[^>]*>[^<]*(?:<strong>)?Paso 3:/.test(tallerHtml), 'Paso 3 debe ser encabezado de paso');

// 3. El taller nunca contiene los títulos curriculares de la Parte 1
assert.ok(!/EJES TEM[AÁ]TICOS|DESEMPEÑOS DE APRENDIZAJE/.test(tallerHtml), 'El taller no debe contener secciones curriculares');

// 4. Los encabezados reales de la plantilla en MAYÚSCULAS sí se reconocen
assert.ok(/<h2[^>]*>[^<]*SEGUNDO PERÍODO: PENSAMIENTO NUMÉRICO<\/h2>/.test(nbHtml), 'Título en mayúsculas del cuaderno debe ser h2');

console.log('✅ PLANTILLA OFICIAL: formato del cuaderno y taller correcto');
