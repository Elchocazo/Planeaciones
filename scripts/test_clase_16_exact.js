const assert = require('assert');
const ImportParser = require('../js/services/import-parser.js');

const sampleClase16 = `PARTE 1: SECUENCIA DIDÁCTICA ESTRUCTURADA PARA FORMATO INSTITUCIONAL

INFORMACIÓN GENERAL

Asignatura: Matemáticas
Grado: 3°
Clase #: 16
Tiempo: 60 minutos
Eje temático principal: Apertura del Segundo Período: socialización de temáticas y adición con reagrupación
DBA: Interpreta, formula y resuelve problemas aditivos.
Desempeño / Logro: Resuelve adiciones con reagrupación.

FASE DE INICIO (15 minutos)
Saludo y motivación.

FASE DE DESARROLLO (35 minutos)
Explicación.

FASE DE CIERRE (10 minutos)
Cierre.

RECURSOS Y MATERIALES
Tablero.

EVALUACIÓN FORMATIVA
Cuaderno.

TAREAS / ACTIVIDADES EXTRACLASE
No aplica.

OBSERVACIONES PEDAGÓGICAS
Acompañar a estudiantes.

PARTE 2: CUADERNO DEL DOCENTE / GUÍA DETALLADA DE CLASE

PLANEACIÓN DE CLASE

Pregunta problematizadora: ¿Cómo sumar números grandes?

DINÁMICA DE CLASE Y REGLAS DE JUEGO
Reglas del aula.

GUÍA DE CONTENIDO PARA EL CUADERNO DEL ESTUDIANTE
SEGUNDO PERÍODO ACADÉMICO: MATEMÁTICAS

Estructura curricular del período:
• Ejes temáticos:
• Algoritmos de suma y resta con números hasta el 999.999 (agrupando y desagrupando).
• Resolución de problemas aditivos contextualizados (cambio, combinación y comparación).
• Concepto de multiplicación como suma repetida.
• Patrones numéricos y construcción de secuencias multiplicativas.
• Propiedades de la multiplicación (conmutativa, asociativa y distributiva).
• Noción intuitiva de división como reparto equitativo y restas sucesivas.
• Relaciones entre operaciones (inversa entre adición/sustracción y multiplicación/división).
• Desempeños esperados:
• Aplica los algoritmos de adición y sustracción con números hasta de seis cifras en la resolución de problemas cotidianos.
• Reconoce y utiliza la suma repetida para construir el concepto de multiplicación y anticipar resultados.
• Identifica regularidades y patrones numéricos para estructurar secuencias y tablas de multiplicar.
• Comprende la noción de división como reparto equitativo en situaciones concretas.
• Justifica sus procedimientos con argumentos numéricos para comunicar con claridad su razonamiento matemático y validar sus resultados.
• Primer tema: La Adición con números hasta 999.999 agrupando (reagrupación):
• Definición: La adición es una operación básica que nos permite juntar, agregar o combinar dos o más cantidades (sumandos) para obtener un valor final (suma o total).
• La Reagrupación: Ocurre cuando al sumar los dígitos de una misma columna posicional el total es igual o mayor a 10 unidades. Como en cada casilla solo cabe un dígito (del 0 al 9), anotamos la unidad en el resultado y trasladamos ("llevamos") la decena a la columna inmediatamente ubicada a la izquierda para sumarla con las cifras de ese orden.
• Pasos para realizar la adición de números de hasta seis cifras:
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

TALLER / ACTIVIDAD PRÁCTICA DE LA CLASE
Paso 1: Consignación institucional en el cuaderno
• Diseñar la portada de "Segundo Período" y transcribir con letra clara, regla y colores los ejes temáticos, los desempeños de aprendizaje y la pregunta problematizadora de la malla curricular.
Paso 2: Ejercicios guiados de adición vertical con reagrupación en el cuaderno
Ubicar en columnas verticales, trazar la línea horizontal con regla, anotar en rojo las cifras de reserva y resolver:
• a) 478.652 + 346.589
• Proceso de reagrupación:
• U: 2 + 9 = 11 (escribo 1, llevo 1)
• D: 5 + 8 + 1 = 14 (escribo 4, llevo 1)
• C: 6 + 5 + 1 = 12 (escribo 2, llevo 1)
• UM: 8 + 6 + 1 = 15 (escribo 5, llevo 1)
• DM: 7 + 4 + 1 = 12 (escribo 2, llevo 1)
• CM: 4 + 3 + 1 = 8
• Total: 825.241 (Se lee: Ochocientos veinticinco mil doscientos cuarenta y uno).
• b) 629.475 + 183.648
• Total: 813.123 (Se lee: Ochocientos trece mil ciento veintitrés).
• c) 508.934 + 291.086
• Total: 800.020 (Se lee: Ochocientos mil veinte).
Paso 3: Reto de aplicación y pensamiento crítico en el aula
Analizar y resolver en el cuaderno la siguiente situación contextualizada:
• Enunciado: La cooperativa escolar invirtió 385.600 en uniformes deportivos y 468.750 en instrumentos musicales para la banda de paz. ¿Cuál fue el valor total de la inversión realizada por la institución?
• Procedimiento obligatorio:
• Identificación de datos numéricos.
• Alineación vertical de la adición:
385.600 + 468.750
• Cálculo paso a paso con reagrupación:
385.600 + 468.750 = 854.350
• Respuesta redactada formalmente: "El valor total de la inversión realizada por la cooperativa escolar fue de ochocientos cincuenta y cuatro mil trescientos cincuenta pesos (854.350)".

NOTAS ADICIONALES DEL DOCENTE
Para estudiantes que presenten dificultades espaciales al alinear cantidades de seis dígitos, exigir el trazado previo de la tabla posicional con regla.`;

const parsed = ImportParser.parse(sampleClase16);
const studentHtml = ImportParser.formatMarkdownToHtml(parsed.teacherNotebook.studentNotebookContent);
const tallerHtml = ImportParser.formatMarkdownToHtml(parsed.teacherNotebook.practicalActivity);

console.log('--- STUDENT HTML ---');
console.log('Includes Primer orphan?:', studentHtml.includes('Primer</li>') || studentHtml.includes('Primer</p>'));
console.log('Includes Primer tema?:', studentHtml.includes('Primer tema:'));
console.log('Includes arrow →?:', studentHtml.includes('→'));
console.log('Includes \\rightarrow?:', studentHtml.includes('\\rightarrow'));

console.log('--- TALLER HTML ---');
console.log('Taller splits ejes tematicos?:', tallerHtml.includes('ejes temáticos</h3>') || tallerHtml.includes('ejes temáticos</h2>'));
console.log('Taller Paso 1 intact?:', tallerHtml.includes('colores los ejes temáticos, los desempeños de aprendizaje'));
console.log('Taller Paso 2 is H3?:', /<h3[^>]*>[^<]*(?:<strong>)?Paso 2:/.test(tallerHtml));
console.log('Taller Paso 3 is H3?:', /<h3[^>]*>[^<]*(?:<strong>)?Paso 3:/.test(tallerHtml));

assert.ok(!studentHtml.includes('Primer</li>'), 'Student HTML no debe tener Primer orphan');
assert.ok(studentHtml.includes('Primer tema:'), 'Student HTML debe tener Primer tema unido');
assert.ok(studentHtml.includes('→'), 'Student HTML debe tener flechas →');
assert.ok(!tallerHtml.includes('ejes temáticos</h2>'), 'Taller HTML no debe partir ejes tematicos en h2');
assert.ok(tallerHtml.includes('colores los ejes temáticos, los desempeños de aprendizaje'), 'Taller Paso 1 intact');

console.log('✅ ALL PARSING ASSERTIONS FOR CLASE 16 PASS!');
