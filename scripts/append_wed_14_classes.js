const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../js/data/initial-classes-data.js');
let content = fs.readFileSync(filePath, 'utf8');

const wed14Classes = [
  {
    id: "cls_20261014_mat3_11",
    date: "2026-10-14",
    teacherId: "usr_manuel",
    subjectName: "Matemáticas",
    subjectId: "matematicas",
    gradeName: "3°",
    gradeId: "3",
    group: "3°",
    time: "7:50 - 9:30",
    startTime: "7:50",
    endTime: "9:30",
    dayOfWeek: "Miércoles",
    dayNumber: "11",
    sequenceNumber: 11,
    status: "planned",
    topic: "Propiedades de la adición (conmutativa, asociativa y modulativa) y resolución de problemas aditivos contextualizados",
    curriculum: {
      topic: "Propiedades de la adición (conmutativa, asociativa y modulativa) y resolución de problemas aditivos contextualizados",
      dba: "DBA 1: Interpreta y formula problemas aditivos de composición, transformación y comparación en diferentes contextos.",
      achievement: "Aplica las propiedades de la adición en el cálculo mental y resuelve problemas cotidianos con números naturales de hasta cinco cifras."
    },
    didacticSequence: {
      inicio: "Saludo institucional y bienvenida al aula. Activación de saberes previos: cálculo mental rápido en parejas con sumas de dos y tres cifras.",
      desarrollo: "Explicación y modelado docente en tablero de las propiedades conmutativa, asociativa y modulativa. Demostración práctica de cómo facilitan el cálculo mental rápido. Trabajo guiado: resolución de situaciones problema en el cuaderno aplicando las propiedades.",
      cierre: "Socialización en el tablero por parte de los estudiantes. Preguntas de consolidación y firma de cuadernos con los ejercicios consignados.",
      recursos: "Tablero acrílico, marcadores borrables, cuaderno cuadriculado de Matemáticas, regla y lápiz.",
      evaluation: "Criterios: Identificación y aplicación correcta de las propiedades de la adición. Procedimiento ordenado y resolución acertada de problemas aditivos.",
      tareas: "No aplica para esta sesión.",
      durations: { inicio: 15, desarrollo: 70, cierre: 15 }
    },
    teacherNotebook: {
      question: "¿Cómo nos ayudan las propiedades de la suma a calcular más rápido mentalmente y resolver problemas de compras escolares?",
      dynamics: "Dinámica del 'Calculista Veloz': agrupar números que sumen decenas o centenas exactas para facilitar la suma mental.",
      studentNotebookContent: "<p><strong>TEMA:</strong> PROPIEDADES DE LA ADICIÓN</p><p>La adición cumple con propiedades que facilitan el cálculo: Conmutativa, Asociativa y Modulativa.</p>",
      practicalActivity: "Taller práctico: Resolver problemas de aplicación en el cuaderno.",
      additionalNotes: "Enfatizar el valor de posición al sumar números de varias cifras."
    },
    scheduleSlotId: "slot_usr_manuel_w3_i0_matematicas_3",
    attachments: []
  },
  {
    id: "cls_20261014_sis5_11",
    date: "2026-10-14",
    teacherId: "usr_manuel",
    subjectName: "Sistemas",
    subjectId: "sistemas",
    gradeName: "5°",
    gradeId: "5",
    group: "5°",
    time: "10:10 - 11:00",
    startTime: "10:10",
    endTime: "11:00",
    dayOfWeek: "Miércoles",
    dayNumber: "11",
    sequenceNumber: 11,
    status: "planned",
    topic: "Estructuración y diseño de tablas de datos en procesadores de texto para la organización de información académica",
    curriculum: {
      topic: "Estructuración y diseño de tablas de datos en procesadores de texto para la organización de información académica",
      dba: "DBA 2: Organiza y representa información utilizando tablas y gráficos en herramientas ofimáticas.",
      achievement: "Inserta, redimensiona y formatea tablas en documentos digitales aplicando estilos de celda y bordes de manera estética y ordenada."
    },
    didacticSequence: {
      inicio: "Saludo institucional e ingreso ordenado a la sala de sistemas. Postura ergonómica y activación de saberes previos sobre filas, columnas y celdas.",
      desarrollo: "Demostración guiada en pantalla: inserción de tablas (Insertar > Tabla), ajuste de ancho de columnas, combinación de celdas y sombreado de encabezados. Práctica individual en Word/Docs: construcción de un cuadro comparativo escolar.",
      cierre: "Guardado del archivo en la carpeta personal de clase. Revisión directa en pantalla de los documentos terminados y balance del trabajo práctico.",
      recursos: "Computadores de la sala de sistemas, software ofimático (Word / Google Docs), proyector.",
      evaluation: "Criterios: Precisión en la creación y formato de tablas, aplicación de encabezados destacados y uso responsable de los equipos.",
      tareas: "No aplica para esta sesión.",
      durations: { inicio: 10, desarrollo: 30, cierre: 10 }
    },
    teacherNotebook: {
      question: "¿Por qué una tabla es la forma más clara de presentar datos comparativos frente a un texto continuo?",
      dynamics: "Diseño guiado paso a paso con teclas de acceso rápido (Tabulador para avanzar celdas).",
      studentNotebookContent: "<p><strong>TEMA:</strong> TABLAS EN PROCESADORES DE TEXTO</p><p>Una tabla está compuesta por columnas (verticales), filas (horizontales) y celdas.</p>",
      practicalActivity: "Construcción digital de una tabla de 4 columnas por 6 filas en el procesador de texto.",
      additionalNotes: "Vigilar el cuidado de los periféricos y el guardado periódico del archivo."
    },
    scheduleSlotId: "slot_usr_manuel_w3_i1_sistemas_5",
    attachments: []
  },
  {
    id: "cls_20261014_mat7_17",
    date: "2026-10-14",
    teacherId: "usr_manuel",
    subjectName: "Matemáticas",
    subjectId: "matematicas",
    gradeName: "7°",
    gradeId: "7",
    group: "7°",
    time: "11:00 - 12:35",
    startTime: "11:00",
    endTime: "12:35",
    dayOfWeek: "Miércoles",
    dayNumber: "17",
    sequenceNumber: 17,
    status: "planned",
    topic: "RESOLUCIÓN DE POLINOMIOS ARITMÉTICOS CON SIGNOS DE AGRUPACIÓN Y LAS CUATRO OPERACIONES BÁSICAS",
    curriculum: {
      topic: "RESOLUCIÓN DE POLINOMIOS ARITMÉTICOS CON SIGNOS DE AGRUPACIÓN Y LAS CUATRO OPERACIONES BÁSICAS",
      dba: "DBA 1: Utiliza las propiedades de los números enteros y sus operaciones para proponer estrategias y resolver situaciones problema en contextos matemáticos y de la vida diaria.",
      achievement: "Resuelve polinomios aritméticos que contienen signos de agrupación anidados (paréntesis, corchetes y llaves) suprimiéndolos ordenadamente de adentro hacia afuera y aplicando con rigor la jerarquía de las operaciones y la ley de signos."
    },
    didacticSequence: {
      inicio: "Saludo institucional y organización del salón de clase.\n\nActivación de saberes previos: Repaso relámpago en el tablero de las reglas de jerarquía operacional y supresión de signos de agrupación (paréntesis, corchetes y llaves) de adentro hacia afuera.\n\nPregunta detonante: En una expresión matemática combinada que contiene las cuatro operaciones básicas y signos de agrupación, ¿cuál es el paso a paso exacto para resolverla sin cometer errores de signos ni alterar el resultado?",
      desarrollo: "Explicación conceptual y modelado docente en el tablero:\n• Jerarquía formal de las operaciones en Z: 1) Operaciones dentro de signos de agrupación de adentro hacia afuera. 2) Multiplicaciones y divisiones de izquierda a derecha. 3) Sumas y restas finales agrupando términos positivos y negativos.\n• Modelado guiado de ejercicios de polinomios aritméticos combinados con signos de agrupación anidados.\n• Aplicación de la ley de signos en la supresión de paréntesis, corchetes y llaves.\n• Trabajo práctico guiado: Resolución por pasos en el cuaderno con supervisión docente, exigiendo el desarrollo vertical renglón a renglón.",
      cierre: "Socialización en el tablero por parte de los estudiantes explicando el procedimiento aplicado paso a paso.\n\nPreguntas de consolidación y balance: ¿Qué operación tiene prioridad cuando encontramos una multiplicación y una división seguidas? ¿Cómo afecta un signo menos exterior al contenido de un corchete?\n\nRevisión y firma de cuadernos con los ejercicios resueltos.",
      recursos: "Tablero acrílico, marcadores borrables de colores, cuaderno cuadriculado de Matemáticas, regla, lápiz y borrador.",
      evaluation: "Criterios de evaluación: Respeto estricto del orden de jerarquía operativa y de adentro hacia afuera en signos de agrupación. Aplicación rigurosa de la ley de signos en números enteros. Desarrollo ordenado y vertical en el cuaderno.\n\nInstrumento: Rúbrica formativa y seguimiento de trabajo en clase.",
      tareas: "No aplica para esta sesión. Se afianzará en la próxima clase con problemas de aplicación.",
      durations: { inicio: 15, desarrollo: 75, cierre: 15 }
    },
    teacherNotebook: {
      question: "¿Cómo desarmar una expresión matemática compleja con signos de agrupación y operaciones combinadas garantizando el resultado correcto?",
      dynamics: "Estrategia de resolución capa por capa: resolver primero las operaciones más internas antes de suprimir cualquier signo de agrupación. Desarrollo vertical obligatorio hacia abajo.",
      studentNotebookContent: `<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;"><strong>TEMA:</strong> RESOLUCIÓN DE POLINOMIOS ARITMÉTICOS CON SIGNOS DE AGRUPACIÓN EN Z</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">📌 Regla de Oro: Destrucción de Adentro hacia Afuera</h2>
<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">Para resolver polinomios con signos anidados, se sigue un orden estricto de capas:</p>
<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.2rem;"><strong>1° Capa (Interna):</strong> Se resuelven las operaciones contenidas dentro de los paréntesis ( ).</li>
<li style="margin-bottom:0.2rem;"><strong>2° Capa (Intermedia):</strong> Se resuelven las operaciones contenidas dentro de los corchetes [ ].</li>
<li style="margin-bottom:0.2rem;"><strong>3° Capa (Externa):</strong> Se resuelven las operaciones contenidas dentro de las llaves { }.</li>
</ul>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">⚡ Jerarquía de Operaciones</h2>
<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.2rem;">1. Operaciones dentro de signos de agrupación.</li>
<li style="margin-bottom:0.2rem;">2. Multiplicaciones y Divisiones de izquierda a derecha.</li>
<li style="margin-bottom:0.2rem;">3. Sumas y Restas finales agrupando positivos y negativos.</li>
</ul>
<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase;">✍️ Taller / Actividad Práctica de la Clase</h2>
    <span style="font-size:0.85rem; font-weight:700; color:#475569;">Matemáticas - Grado 7°</span>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> 14/10/2026</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
  <div style="margin-top:6px; font-size:0.82rem; color:#1e293b; border-top:1px dashed #e2e8f0; padding-top:4px;"><strong>Tema:</strong> Resolución de polinomios aritméticos con signos de agrupación y operaciones básicas</div>
</div>
<h3 style="color:#1d4ed8; font-weight:800; margin-top:0.7rem; margin-bottom:0.25rem; font-size:1.02rem;">🛠️ Ejercicios para resolver paso a paso en el cuaderno:</h3>
<ol style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.3rem;">15 - (6 - 14) =</li>
<li style="margin-bottom:0.3rem;">-8 + [ 12 - (-5 + 3) ] =</li>
<li style="margin-bottom:0.3rem;">20 - [ -4 + (7 - 15) ] =</li>
<li style="margin-bottom:0.3rem;">-2 · [ 5 - (3 - 8) ] + 10 =</li>
<li style="margin-bottom:0.3rem;">14 - { -6 + [ 8 - (12 - 4) ] } =</li>
<li style="margin-bottom:0.3rem;">3 · [ -4 + 2 · (6 - 9) ] - 18 ÷ (-3) =</li>
<li style="margin-bottom:0.3rem;">-[ -5 + (-3 · 4 + 2) ] - [ 8 ÷ (-2) - 1 ] =</li>
<li style="margin-bottom:0.3rem;">10 - { -2 + [ -8 - 4 · (5 - 7) ] - (-6) } =</li>
</ol>`,
      practicalActivity: `BLOQUE DE POLINOMIOS ARITMÉTICOS CON SIGNOS DE AGRUPACIÓN
Instrucciones: Escribe todo el desarrollo ordenado paso a paso, renglón por renglón hacia abajo.
1. 15 - (6 - 14) =
2. -8 + [ 12 - (-5 + 3) ] =
3. 20 - [ -4 + (7 - 15) ] =
4. -2 · [ 5 - (3 - 8) ] + 10 =
5. 14 - { -6 + [ 8 - (12 - 4) ] } =
6. 3 · [ -4 + 2 · (6 - 9) ] - 18 ÷ (-3) =
7. -[ -5 + (-3 · 4 + 2) ] - [ 8 ÷ (-2) - 1 ] =
8. 10 - { -2 + [ -8 - 4 · (5 - 7) ] - (-6) } =`,
      additionalNotes: `Solucionario para verificación:
1. 15 - (-8) = 15 + 8 = 23
2. -8 + [ 12 - (-2) ] = -8 + 14 = 6
3. 20 - [ -4 - 8 ] = 20 - (-12) = 32
4. -2 · [ 5 - (-5) ] + 10 = -2 · 10 + 10 = -10
5. 14 - { -6 + [ 8 - 8 ] } = 14 - (-6) = 20
6. 3 · [ -4 - 6 ] - (-6) = -30 + 6 = -24
7. -[ -5 + (-10) ] - [ -4 - 1 ] = 15 + 5 = 20
8. 10 - { -2 + [ -8 + 8 ] + 6 } = 10 - 4 = 6`
    },
    scheduleSlotId: "slot_usr_manuel_w3_i2_matematicas_7",
    attachments: []
  }
];

const targetPattern = '  }\n];';
const jsonString = wed14Classes.map(c => '  ,\n' + JSON.stringify(c, null, 2).replace(/^/gm, '  ')).join('');
const lastBraceIdx = content.lastIndexOf('  }\n];');

if (lastBraceIdx !== -1) {
  const insertPos = lastBraceIdx + '  }'.length;
  const newContent = content.slice(0, insertPos) + jsonString + content.slice(insertPos);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully appended Wednesday 14 classes to initial-classes-data.js!');
} else {
  console.error('Could not find insertion point!');
  process.exit(1);
}
