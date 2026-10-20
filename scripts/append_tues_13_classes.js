const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../js/data/initial-classes-data.js');
let content = fs.readFileSync(filePath, 'utf8');

const tues13Classes = [
  {
    id: "cls_20261013_sis3_5",
    date: "2026-10-13",
    teacherId: "usr_manuel",
    subjectName: "Sistemas",
    subjectId: "sistemas",
    gradeName: "3°",
    gradeId: "3",
    group: "3°",
    time: "7:00 - 7:50",
    startTime: "7:00",
    endTime: "7:50",
    dayOfWeek: "Martes",
    dayNumber: "5",
    sequenceNumber: 5,
    status: "planned",
    topic: "Periféricos de entrada, salida y almacenamiento en los sistemas de cómputo",
    curriculum: {
      topic: "Periféricos de entrada, salida y almacenamiento en los sistemas de cómputo",
      dba: "• Identifica y describe la función de los principales periféricos del computador (teclado, mouse, monitor, impresora, memoria USB).\n• Reconoce la importancia del cuidado y uso adecuado de los equipos en la sala de informática.",
      achievement: "Clasifica y manipula adecuadamente periféricos de entrada, salida y almacenamiento reconociendo su utilidad en el procesamiento de información."
    },
    didacticSequence: {
      inicio: "Saludo institucional y bienvenida a la sala de informática. Verificación de postura ergonómica y activación de saberes previos: ¿Cómo entra la información a la computadora y por qué medios podemos verla o escucharla?",
      desarrollo: "Explicación conceptual y modelado en la sala: diferenciación clara entre periféricos de entrada (teclado, mouse, cámara, micrófono), periféricos de salida (pantalla, parlantes, impresora) y dispositivos de almacenamiento (memoria USB, disco duro). Identificación física de cada elemento conectado a las estaciones de trabajo y consignación guiada en el cuaderno.",
      cierre: "Dinámica relámpago de preguntas de consolidación: clasificar objetos mostrados en tarjetas. Firma y sellado de cuadernos con los esquemas completados.",
      recursos: "Computadores de la sala de sistemas, periféricos físicos de muestra (teclado, mouse, audífonos, memoria USB), tablero acrílico y cuaderno de Sistemas.",
      evaluation: "Criterios: Clasificación acertada de los periféricos según su flujo de información, cuidado responsable de los equipos en el aula y orden en los apuntes del cuaderno.",
      tareas: "No aplica para esta sesión.",
      durations: { inicio: 10, desarrollo: 30, cierre: 10 }
    },
    teacherNotebook: {
      question: "¿De qué manera los periféricos permiten que las personas nos comuniquemos con las computadoras y conservemos nuestros trabajos escolares?",
      dynamics: "Dinámica 'El Semáforo de Periféricos': El docente nombra un dispositivo y los estudiantes señalan con tarjetas de colores si es de Entrada (Azul), Salida (Verde) o Almacenamiento (Amarillo).",
      studentNotebookContent: `<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;"><strong>TEMA:</strong> PERIFÉRICOS DE ENTRADA, SALIDA Y ALMACENAMIENTO</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">📌 ¿Qué es un Periférico?</h2>
<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">Son todos los dispositivos externos conectados a la torre o unidad central de la computadora que permiten ingresar, visualizar o almacenar información.</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">💻 Clasificación de los Periféricos</h2>
<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.25rem;"><strong>1. Periféricos de Entrada:</strong> Permiten ingresar datos e instrucciones a la computadora. Ejemplos: Teclado, mouse (ratón), micrófono, cámara web y escáner.</li>
<li style="margin-bottom:0.25rem;"><strong>2. Periféricos de Salida:</strong> Muestran o reproducen los resultados del procesamiento. Ejemplos: Monitor (pantalla), parlantes, audífonos e impresora.</li>
<li style="margin-bottom:0.25rem;"><strong>3. Dispositivos de Almacenamiento:</strong> Guardan y conservan la información para usarla después. Ejemplos: Memoria USB (pendrive), disco duro y tarjeta de memoria.</li>
</ul>
<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase;">✍️ Taller Práctico de Informática</h2>
    <span style="font-size:0.85rem; font-weight:700; color:#475569;">Sistemas - Grado 3°</span>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> 13/10/2026</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
  <div style="margin-top:6px; font-size:0.82rem; color:#1e293b; border-top:1px dashed #e2e8f0; padding-top:4px;"><strong>Tema:</strong> Clasificación de periféricos de entrada, salida y almacenamiento</div>
</div>
<h3 style="color:#1d4ed8; font-weight:800; margin-top:0.7rem; margin-bottom:0.25rem; font-size:1.02rem;">🛠️ Actividades para desarrollar en el cuaderno:</h3>
<ol style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.3rem;">Escribe al frente de cada elemento si es de <strong>ENTRADA</strong>, <strong>SALIDA</strong> o <strong>ALMACENAMIENTO</strong>:
  <ul style="margin-top:4px;">
    <li>a) Micrófono: ______________________</li>
    <li>b) Impresora: ______________________</li>
    <li>c) Memoria USB: ______________________</li>
    <li>d) Teclado: ______________________</li>
    <li>e) Pantalla: ______________________</li>
  </ul>
</li>
<li style="margin-bottom:0.3rem;">Dibuja en tu cuaderno tu periférico de entrada favorito y escribe qué función realiza cuando usas el computador.</li>
<li style="margin-bottom:0.3rem;">Explica por qué no debemos desconectar una memoria USB mientras se están guardando archivos.</li>
</ol>`,
      practicalActivity: `TALLER FORMATIVO DE CLASIFICACIÓN DE PERIFÉRICOS
1. Clasificación directa:
- Teclado -> Entrada
- Monitor -> Salida
- Mouse -> Entrada
- Parlantes -> Salida
- Memoria USB -> Almacenamiento
- Disco Duro -> Almacenamiento
2. Dibujo y rotulado de periféricos en el cuaderno.
3. Normas de uso seguro y cuidado en la sala de informática.`,
      additionalNotes: "Monitorear la postura corporal de los niños frente al monitor y la distancia visual recomendada."
    },
    scheduleSlotId: "slot_usr_manuel_w2_i0_sistemas_3",
    attachments: []
  },
  {
    id: "cls_20261013_mat7_15",
    date: "2026-10-13",
    teacherId: "usr_manuel",
    subjectName: "Matemáticas",
    subjectId: "matematicas",
    gradeName: "7°",
    gradeId: "7",
    group: "7°",
    time: "7:50 - 9:30",
    startTime: "7:50",
    endTime: "9:30",
    dayOfWeek: "Martes",
    dayNumber: "15",
    sequenceNumber: 15,
    status: "planned",
    topic: "Polinomios aritméticos con signos de agrupación: Eliminación de paréntesis y corchetes con números enteros",
    curriculum: {
      topic: "Polinomios aritméticos con signos de agrupación: Eliminación de paréntesis y corchetes con números enteros",
      dba: "DBA 1: Utiliza las propiedades de los números enteros y sus operaciones para proponer estrategias y resolver situaciones problema en contextos matemáticos y de la vida diaria.",
      achievement: "Aplica de manera sistemática la técnica de supresión de signos de agrupación anidados (paréntesis y corchetes) respetando la jerarquía de las operaciones y la ley de signos en {Z}."
    },
    didacticSequence: {
      inicio: "Saludo institucional y organización del salón de clase. Activación de saberes previos: Repaso relámpago en el tablero de las reglas de signos: efecto de un signo negativo precediendo un signo de agrupación y jerarquía operacional estándar.",
      desarrollo: "Explicación y modelado docente en el tablero: Procedimiento sistemático para suprimir primero paréntesis circulares ( ) y luego corchetes rectangulares [ ]. Énfasis en el desarrollo vertical estricto: no omitir pasos ni calcular de memoria renglones intermedios. Trabajo práctico guiado en parejas resolviendo ejercicios seleccionados del taller formativo.",
      cierre: "Puesta en común en el tablero: Estudiantes voluntarios resuelven los ejercicios 3 y 5 justificando el procedimiento. Preguntas de consolidación, revisión y firma de cuadernos.",
      recursos: "Tablero acrílico, marcadores borrables de colores (azul y verde), cuaderno cuadriculado de Matemáticas, regla y lápiz.",
      evaluation: "Criterios: Supresión rigurosa de adentro hacia afuera, aplicación exacta de la ley de signos en la adición y sustracción de enteros y desarrollo vertical ordenado.",
      tareas: "No aplica para esta sesión. Se complementará en la clase del miércoles.",
      durations: { inicio: 15, desarrollo: 70, cierre: 15 }
    },
    teacherNotebook: {
      question: "¿Por qué el orden en que eliminamos los signos de agrupación altera por completo el resultado final de una operación matemática?",
      dynamics: "Metodología de las 'Cajas Anidadas': Para abrir una caja grande (corchete), primero debemos desarmar y resolver la cajita interna (paréntesis).",
      studentNotebookContent: `<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;"><strong>TEMA:</strong> POLINOMIOS ARITMÉTICOS CON PARÉNTESIS Y CORCHETES EN {Z}</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">📌 Reglas Fundamentales de Supresión</h2>
<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.25rem;"><strong>1. De adentro hacia afuera:</strong> Se resuelven primero todas las operaciones dentro de los paréntesis circulares ( ).</li>
<li style="margin-bottom:0.25rem;"><strong>2. Supresión de corchetes:</strong> Una vez resuelto y suprimido el paréntesis, se procede a resolver el interior de los corchetes [ ].</li>
<li style="margin-bottom:0.25rem;"><strong>3. Efecto del signo exterior:</strong> Si el signo antes del paréntesis o corchete es positivo (+), los números interiores conservan su signo. Si es negativo (-), todos los signos interiores cambian.</li>
</ul>
<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase;">✍️ Taller de Polinomios Aritméticos</h2>
    <span style="font-size:0.85rem; font-weight:700; color:#475569;">Matemáticas - Grado 7°</span>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> 13/10/2026</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
  <div style="margin-top:6px; font-size:0.82rem; color:#1e293b; border-top:1px dashed #e2e8f0; padding-top:4px;"><strong>Tema:</strong> Supresión de paréntesis y corchetes en números enteros</div>
</div>
<h3 style="color:#1d4ed8; font-weight:800; margin-top:0.7rem; margin-bottom:0.25rem; font-size:1.02rem;">🛠️ Resuelve paso a paso en tu cuaderno con procedimiento vertical:</h3>
<ol style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.3rem;">9 - (5 - 12) =</li>
<li style="margin-bottom:0.3rem;">-14 + [ 8 - (-3 + 7) ] =</li>
<li style="margin-bottom:0.3rem;">18 - [ -6 + (9 - 14) ] =</li>
<li style="margin-bottom:0.3rem;">-3 · [ 4 - (2 - 7) ] + 8 =</li>
<li style="margin-bottom:0.3rem;">25 + [ -10 - (8 - 15) ] - 12 =</li>
<li style="margin-bottom:0.3rem;">-[ -8 + (6 - 11) ] + [ -4 - (-9) ] =</li>
</ol>`,
      practicalActivity: `TALLER EN CLASE: SUPRESIÓN ORDENADA DE SIGNOS EN Z
1. 9 - (5 - 12) = 9 - (-7) = 9 + 7 = 16
2. -14 + [ 8 - 4 ] = -14 + 4 = -10
3. 18 - [ -6 - 5 ] = 18 - (-11) = 29
4. -3 · [ 4 - (-5) ] + 8 = -3 · (9) + 8 = -27 + 8 = -19
5. 25 + [ -10 - (-7) ] - 12 = 25 + [ -3 ] - 12 = 10
6. -[ -8 - 5 ] + [ -4 + 9 ] = -(-13) + 5 = 13 + 5 = 18`,
      additionalNotes: "Hacer hincapié en que un signo negativo antes de un corchete invierte el resultado del corchete completo."
    },
    scheduleSlotId: "slot_usr_manuel_w2_i1_matematicas_7",
    attachments: []
  },
  {
    id: "cls_20261013_sis8_5",
    date: "2026-10-13",
    teacherId: "usr_manuel",
    subjectName: "Sistemas",
    subjectId: "sistemas",
    gradeName: "8°",
    gradeId: "8",
    group: "8°",
    time: "10:10 - 11:00",
    startTime: "10:10",
    endTime: "11:00",
    dayOfWeek: "Martes",
    dayNumber: "5",
    sequenceNumber: 5,
    status: "planned",
    topic: "Historia y evolución de las redes de comunicación: De ARPANET a las redes 5G y fibra óptica",
    curriculum: {
      topic: "Historia y evolución de las redes de comunicación: De ARPANET a las redes 5G y fibra óptica",
      dba: "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Comprende la arquitectura fundamental de las redes de datos y la transmisión de información.",
      achievement: "Analiza la evolución histórica de las redes de datos desde ARPANET hasta la infraestructura moderna de fibra óptica y conectividad móvil 5G."
    },
    didacticSequence: {
      inicio: "Saludo institucional e ingreso ordenado a la sala. Pregunta detonante: ¿Cómo viaja un mensaje de WhatsApp o un video de YouTube desde un servidor al otro lado del planeta hasta nuestro celular en fracciones de segundo?",
      desarrollo: "Exposición temática y proyección audiovisual: Los orígenes de las redes de computadoras (ARPANET, conmutación de paquetes frente a conmutación de circuitos). Evolución histórica: nacimiento de la World Wide Web, protocolos TCP/IP, infraestructura física submarina de fibra óptica y generaciones móviles (1G a 5G). Construcción de un mapa conceptual cronológico en el cuaderno.",
      cierre: "Síntesis grupal: ¿Por qué la fibra óptica es inmune a las interferencias electromagnéticas? Revisión y firma de cuadernos.",
      recursos: "Sala de informática, proyector, video documental sobre cables submarinos y cuaderno de Sistemas.",
      evaluation: "Criterios: Comprensión de los hitos tecnológicos de las redes, identificación de medios de transmisión física y calidad en la síntesis del cuaderno.",
      tareas: "No aplica para esta sesión.",
      durations: { inicio: 10, desarrollo: 30, cierre: 10 }
    },
    teacherNotebook: {
      question: "¿Cómo transformó la invención de la conmutación de paquetes en ARPANET la manera en que la humanidad comparte conocimiento y se comunica globalmente?",
      dynamics: "Dinámica 'La Ruta del Paquete': Tres estudiantes representan emisor, enrutador y receptor para ilustrar cómo los paquetes de datos viajan por caminos diferentes y se ordenan al llegar.",
      studentNotebookContent: `<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;"><strong>TEMA:</strong> HISTORIA Y EVOLUCIÓN DE LAS REDES DE COMUNICACIÓN</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">🌐 Hitos Históricos de las Redes</h2>
<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.25rem;"><strong>1969 - ARPANET:</strong> Primera red interconectada entre cuatro universidades en EE.UU. Introdujo la conmutación de paquetes.</li>
<li style="margin-bottom:0.25rem;"><strong>1983 - TCP/IP:</strong> Adopción del protocolo estándar de Internet que permite interconectar redes heterogéneas.</li>
<li style="margin-bottom:0.25rem;"><strong>1991 - World Wide Web (WWW):</strong> Tim Berners-Lee crea el sistema de hipertexto que popularizó el acceso a Internet.</li>
<li style="margin-bottom:0.25rem;"><strong>Era Moderna:</strong> Despliegue global de cables submarinos de fibra óptica y redes móviles 5G de ultrabaja latencia.</li>
</ul>
<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase;">✍️ Taller de Redes y Telecomunicaciones</h2>
    <span style="font-size:0.85rem; font-weight:700; color:#475569;">Sistemas - Grado 8°</span>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> 13/10/2026</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
  <div style="margin-top:6px; font-size:0.82rem; color:#1e293b; border-top:1px dashed #e2e8f0; padding-top:4px;"><strong>Tema:</strong> Evolución histórica de las redes de datos y medios de transmisión</div>
</div>
<h3 style="color:#1d4ed8; font-weight:800; margin-top:0.7rem; margin-bottom:0.25rem; font-size:1.02rem;">🛠️ Actividades de análisis y conceptualización:</h3>
<ol style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.3rem;">Explica con tus propias palabras qué diferencia existe entre la <strong>conmutación de circuitos</strong> (líneas telefónicas antiguas) y la <strong>conmutación de paquetes</strong> (Internet actual).</li>
<li style="margin-bottom:0.3rem;">Completa el cuadro comparativo entre cable de cobre (UTP) y cable de fibra óptica indicando velocidad, distancia y susceptibilidad al ruido electromagnético.</li>
<li style="margin-bottom:0.3rem;">¿Qué papel cumplen los cables submarinos interoceánicos en la conectividad de Colombia con el resto del mundo?</li>
</ol>`,
      practicalActivity: `ACTIVIDAD PRÁCTICA: MAPA CONCEPTUAL Y CUESTIONARIO DE REDES
1. Elaboración de línea de tiempo comparativa: 1G, 2G, 3G, 4G, 5G.
2. Análisis de medios de transmisión: Par trenzado (Cat 6), Fibra óptica monomodo y multimodo.
3. Síntesis de protocolos fundamentales: IP, TCP, UDP y DNS.`,
      additionalNotes: "Destacar el impacto de las telecomunicaciones en el teletrabajo y la educación virtual."
    },
    scheduleSlotId: "slot_usr_manuel_w2_i2_sistemas_8",
    attachments: []
  },
  {
    id: "cls_20261013_log6_5",
    date: "2026-10-13",
    teacherId: "usr_manuel",
    subjectName: "Lógica",
    subjectId: "logica",
    gradeName: "6°",
    gradeId: "6",
    group: "6°",
    time: "11:00 - 11:50",
    startTime: "11:00",
    endTime: "11:50",
    dayOfWeek: "Martes",
    dayNumber: "5",
    sequenceNumber: 5,
    status: "planned",
    topic: "Conectores Lógicos Proposicionales: La Conjunción (Operador Y / AND) y construcción de tablas de verdad",
    curriculum: {
      topic: "Conectores Lógicos Proposicionales: La Conjunción (Operador Y / AND) y construcción de tablas de verdad",
      dba: "• Comprende y utiliza conectores lógicos para formar proposiciones compuestas y determinar su valor de verdad.\n• Argumenta y valida razonamientos lógicos deductivos en situaciones formales y cotidianas.",
      achievement: "Construye y analiza la tabla de verdad del operador de conjunción (p ∧ q), determinando con precisión su valor de verdad en proposiciones compuestas."
    },
    didacticSequence: {
      inicio: "Saludo institucional y bienvenida. Activación de saberes previos: Repaso del concepto de proposición lógica (enunciado que solo puede ser Verdadero o Falso) y el operador de negación visto en la sesión previa.",
      desarrollo: "Presentación formal del conector 'Y' (conjunción, símbolo ∧). Regla lógica fundamental: Una proposición conjuntiva (p ∧ q) es VERDADERA únicamente cuando AMBAS proposiciones simples son simultáneamente verdaderas; si al menos una es falsa, toda la conjunción es falsa. Modelado en el tablero de la tabla de verdad estándar de 4 combinaciones. Ejemplificación con situaciones de la vida cotidiana y condiciones computacionales.",
      cierre: "Evaluación formativa rápida: Los estudiantes responden oralmente el valor de verdad de oraciones compuestas propuestas por el docente. Firma y revisión de cuadernos.",
      recursos: "Tablero acrílico, marcadores borrables, cuaderno de Lógica y fichas didácticas de verdadero/falso.",
      evaluation: "Criterios: Construcción correcta de la tabla de verdad de 4 filas, comprensión de la regla de la conjunción y aplicación acertada a enunciados del lenguaje natural.",
      tareas: "No aplica para esta sesión.",
      durations: { inicio: 10, desarrollo: 30, cierre: 10 }
    },
    teacherNotebook: {
      question: "En un contrato o en un semáforo inteligente, ¿por qué es indispensable que todas las condiciones se cumplan simultáneamente para que la acción sea válida?",
      dynamics: "Juego 'El Guardián del Puente': Para cruzar el puente se requieren dos llaves: 'Tener permiso firmado' Y 'Tener el carnet escolar'. Si falta una, el paso es denegado.",
      studentNotebookContent: `<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;"><strong>TEMA:</strong> LA CONJUNCIÓN LÓGICA (OPERADOR Y / AND)</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">📌 Definición y Símbolo</h2>
<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">La conjunción es un conector lógico que une dos proposiciones simples <strong>p</strong> y <strong>q</strong> mediante la palabra <strong>\"y\"</strong>, representada matemáticamente con el símbolo <strong>∧</strong>.</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">⚡ Regla de Verdad de la Conjunción</h2>
<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">Una conjunción <strong>p ∧ q</strong> es <strong>VERDADERA (V)</strong> únicamente cuando <strong>ambas proposiciones son verdaderas</strong>. En cualquier otro caso, es <strong>FALSA (F)</strong>.</p>
<table style="width:100%; border-collapse:collapse; margin:0.8rem 0; font-size:0.9rem; text-align:center;">
  <thead>
    <tr style="background:#1e3a8a; color:#ffffff;">
      <th style="padding:6px; border:1px solid #cbd5e1;">p</th>
      <th style="padding:6px; border:1px solid #cbd5e1;">q</th>
      <th style="padding:6px; border:1px solid #cbd5e1;">p ∧ q</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:5px; border:1px solid #cbd5e1;">V</td><td style="padding:5px; border:1px solid #cbd5e1;">V</td><td style="padding:5px; border:1px solid #cbd5e1; font-weight:bold; color:#15803d;">V</td></tr>
    <tr><td style="padding:5px; border:1px solid #cbd5e1;">V</td><td style="padding:5px; border:1px solid #cbd5e1;">F</td><td style="padding:5px; border:1px solid #cbd5e1; font-weight:bold; color:#b91c1c;">F</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:5px; border:1px solid #cbd5e1;">F</td><td style="padding:5px; border:1px solid #cbd5e1;">V</td><td style="padding:5px; border:1px solid #cbd5e1; font-weight:bold; color:#b91c1c;">F</td></tr>
    <tr><td style="padding:5px; border:1px solid #cbd5e1;">F</td><td style="padding:5px; border:1px solid #cbd5e1;">F</td><td style="padding:5px; border:1px solid #cbd5e1; font-weight:bold; color:#b91c1c;">F</td></tr>
  </tbody>
</table>
<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase;">✍️ Taller de Lógica Proposicional</h2>
    <span style="font-size:0.85rem; font-weight:700; color:#475569;">Lógica - Grado 6°</span>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> 13/10/2026</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
  <div style="margin-top:6px; font-size:0.82rem; color:#1e293b; border-top:1px dashed #e2e8f0; padding-top:4px;"><strong>Tema:</strong> Valor de verdad del conector de conjunción (p ∧ q)</div>
</div>
<h3 style="color:#1d4ed8; font-weight:800; margin-top:0.7rem; margin-bottom:0.25rem; font-size:1.02rem;">🛠️ Determina el valor de verdad (V o F) de las siguientes proposiciones compuestas:</h3>
<ol style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.3rem;">\"Bogotá es la capital de Colombia\" (p) Y \"El número 7 es par\" (q). Valor: [ ___ ]</li>
<li style="margin-bottom:0.3rem;">\"El triángulo tiene 3 lados\" (p) Y \"5 + 3 = 8\" (q). Valor: [ ___ ]</li>
<li style="margin-bottom:0.3rem;">\"El agua hierve a 0°C\" (p) Y \"El Sol es una estrella\" (q). Valor: [ ___ ]</li>
<li style="margin-bottom:0.3rem;">\"Un minuto tiene 60 segundos\" (p) Y \"El año tiene 12 meses\" (q). Valor: [ ___ ]</li>
<li style="margin-bottom:0.3rem;">\"10 es menor que 4\" (p) Y \"Los gatos son mamíferos\" (q). Valor: [ ___ ]</li>
</ol>`,
      practicalActivity: `EJERCITACIÓN PRÁCTICA DE TABLAS DE VERDAD
1. Análisis de enunciados:
- Enunciado 1: V ∧ F = F
- Enunciado 2: V ∧ V = V
- Enunciado 3: F ∧ V = F
- Enunciado 4: V ∧ V = V
- Enunciado 5: F ∧ V = F
2. Simulación de compuertas lógicas AND en diagramas de circuitos.`,
      additionalNotes: "Conectar el concepto de conjunción con las condiciones lógicas if (condicion1 && condicion2) de la programación."
    },
    scheduleSlotId: "slot_usr_manuel_w2_i3_logica_6",
    attachments: []
  },
  {
    id: "cls_20261013_rob10_5",
    date: "2026-10-13",
    teacherId: "usr_manuel",
    subjectName: "Robótica",
    subjectId: "robotica",
    gradeName: "10°",
    gradeId: "10",
    group: "10°",
    time: "12:35 - 2:00",
    startTime: "12:35",
    endTime: "2:00",
    dayOfWeek: "Martes",
    dayNumber: "5",
    sequenceNumber: 5,
    status: "planned",
    topic: "Servomotores de alto torque (MG995 / MG996R) y dimensionamiento de fuentes de alimentación desacopladas para brazos robóticos",
    curriculum: {
      topic: "Servomotores de alto torque (MG995 / MG996R) y dimensionamiento de fuentes de alimentación desacopladas para brazos robóticos",
      dba: "• Fundamentos de cinemática de manipuladores: Articulaciones rotacionales y grados de libertad (DOF).\n• Dimensiona componentes electromecánicos y fuentes de potencia desacopladas en proyectos de automatización con microcontroladores.",
      achievement: "Conecta y programa servomotores de alto torque implementando aislamiento eléctrico y fuente desacoplada para prevenir caídas de tensión (brownout) en el microcontrolador."
    },
    didacticSequence: {
      inicio: "Saludo institucional y medidas de seguridad eléctrica en el taller de robótica. Pregunta problematizadora: ¿Por qué cuando conectamos más de dos servomotores MG996R directamente al pin de 5V de un Arduino o ESP32 el microcontrolador se reinicia repentinamente al intentar mover el brazo robótico?",
      desarrollo: "Explicación técnica en tablero y laboratorio: Consumo de corriente de actuadores inductivos (corriente en reposo vs. corriente pico bajo carga o 'stall current' de hasta 2.5A). Necesidad ineludible de fuente de alimentación externa independiente (5V-6V a 3A/5A) desacoplada del riel lógico del microcontrolador, compartiendo masa común (GND común). Diagramado esquemático en la pizarra y conexión en protoboard. Montaje del script en C++ utilizando la biblioteca ESP32Servo.h (protegida con clase notebook-code-block según Regla 9 de GEMINI.md).",
      cierre: "Pruebas prácticas de accionamiento con barridos angulares suaves (0° a 180°) y monitoreo térmico del regulador. Revisión y firma de guías técnicas de laboratorio.",
      recursos: "Protoboard, microcontroladores ESP32, servomotores metálicos MG996R, fuente conmutada desacoplada de 5V/5A, multímetro y osciloscopio.",
      evaluation: "Criterios: Conexión segura de la fuente desacoplada compartiendo tierra común (GND), comprensión del cálculo de demanda de corriente y correcta implementación del código de control.",
      tareas: "No aplica para esta sesión.",
      durations: { inicio: 15, desarrollo: 55, cierre: 15 }
    },
    teacherNotebook: {
      question: "¿Por qué alimentar actuadores de alto consumo directamente desde el regulador del microcontrolador provoca reinicios intempestivos y cómo lo soluciona una fuente desacoplada con tierra común?",
      dynamics: "Taller experimental de diagnóstico: Medición con multímetro de la caída de voltaje (drop voltage) con y sin fuente desacoplada durante la activación simultánea de los actuadores.",
      studentNotebookContent: `<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;"><strong>TEMA:</strong> ALIMENTACIÓN DESACOPLADA Y CONTROL DE SERVOMOTORES MG996R</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">⚙️ El Problema del Brownout en Microcontroladores</h2>
<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">Un servomotor de piñonería metálica como el <strong>MG996R</strong> puede consumir hasta <strong>2.5 Amperios</strong> cuando está bajo carga máxima. Si se alimenta directamente del regulador de 5V de la placa de desarrollo (Arduino o ESP32), el voltaje cae abruptamente por debajo del umbral mínimo de operación, provocando un reinicio continuo por bajo voltaje (Brownout Reset).</p>
<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">🔌 Reglas de Conexión de Fuente Externa</h2>
<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.25rem;"><strong>1. Riel de Potencia Separado:</strong> El positivo (+) de los servos va directo al positivo de la fuente externa de 5V/6V.</li>
<li style="margin-bottom:0.25rem;"><strong>2. Tierra Común (GND Común):</strong> El negativo (-) de la fuente externa DEBE conectarse obligatoriamente con el pin GND del microcontrolador para establecer una referencia de voltaje compartida para la señal PWM.</li>
<li style="margin-bottom:0.25rem;"><strong>3. Pines de Señal:</strong> La línea de control (naranja/amarillo) va directo a los pines GPIO habilitados para modulación por ancho de pulsos.</li>
</ul>
<div class="notebook-code-block" style="background:#0f172a; color:#f8fafc; border-radius:6px; padding:12px 16px; margin:0.8rem 0; font-family:Consolas, monospace; font-size:0.84rem; line-height:1.45; page-break-inside:avoid;">
<div style="color:#94a3b8; border-bottom:1px solid #334155; padding-bottom:4px; margin-bottom:8px; font-weight:bold;">// Control Servo MG996R con ESP32 y Fuente Externa</div>
<pre style="margin:0; font-family:inherit;">#include &lt;ESP32Servo.h&gt;

Servo servoBase;
const int pinServo = 18;

void setup() {
  servoBase.setPeriodHertz(50); // Frecuencia estándar de 50Hz
  servoBase.attach(pinServo, 500, 2400); // Ancho de pulso min y max en microsegundos
}

void loop() {
  // Barrido suave de 0 a 180 grados
  for (int pos = 0; pos &lt;= 180; pos += 5) {
    servoBase.write(pos);
    delay(30);
  }
  delay(500);
  for (int pos = 180; pos &gt;= 0; pos -= 5) {
    servoBase.write(pos);
    delay(30);
  }
  delay(500);
}</pre>
</div>
<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase;">✍️ Guía de Laboratorio de Robótica</h2>
    <span style="font-size:0.85rem; font-weight:700; color:#475569;">Robótica - Grado 10°</span>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> 13/10/2026</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
  <div style="margin-top:6px; font-size:0.82rem; color:#1e293b; border-top:1px dashed #e2e8f0; padding-top:4px;"><strong>Tema:</strong> Conexión de actuadores de potencia con fuente desacoplada y control PWM</div>
</div>
<h3 style="color:#1d4ed8; font-weight:800; margin-top:0.7rem; margin-bottom:0.25rem; font-size:1.02rem;">🛠️ Verificación experimental de laboratorio:</h3>
<ol style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">
<li style="margin-bottom:0.3rem;">Dibuja el diagrama esquemático indicando claramente la conexión de: Microcontrolador, Fuente de alimentación externa, Servomotor MG996R y la línea de unión de tierras (GND común).</li>
<li style="margin-bottom:0.3rem;">¿Qué sucedería con la señal PWM si olvidamos unir la tierra de la fuente externa con la tierra del microcontrolador? Justifica tu respuesta físicamente.</li>
<li style="margin-bottom:0.3rem;">Calcula la corriente total necesaria para alimentar un brazo robótico de 4 servomotores si cada uno puede demandar hasta 2.0 A en condiciones de bloqueo o carga elevada.</li>
</ol>`,
      practicalActivity: `PRÁCTICA DE LABORATORIO: CONEXIÓN Y BARRIDO ANGULAR DE SERVOS DE ALTO TORQUE
1. Montaje del circuito en protoboard con riel de alimentación desacoplado.
2. Comprobación de continuidad de tierra común con multímetro antes de energizar.
3. Carga y ejecución del código de barrido suave (sweep).
4. Verificación de ausencia de reinicios o fluctuaciones en el puerto serie.`,
      additionalNotes: "Enfatizar que jamás se deben forzar los engranajes metálicos con la mano cuando el servomotor esté energizado."
    },
    scheduleSlotId: "slot_usr_manuel_w2_i4_robotica_10",
    attachments: []
  }
];

// Comprobar si ya existen para evitar duplicación
const existingIds = new Set();
try {
  eval(content.replace('const INITIAL_CLASSES_DATA =', 'global.EXISTING_SEED ='));
  if (Array.isArray(global.EXISTING_SEED)) {
    global.EXISTING_SEED.forEach(c => {
      if (c && c.id) existingIds.add(c.id);
    });
  }
} catch (e) {}

const toAppend = tues13Classes.filter(c => !existingIds.has(c.id));

if (toAppend.length === 0) {
  console.log('All Tuesday 13 classes already exist in initial-classes-data.js. No change needed.');
  process.exit(0);
}

const jsonString = toAppend.map(c => '  ,\n' + JSON.stringify(c, null, 2).replace(/^/gm, '  ')).join('');
const lastBraceIdx = content.lastIndexOf('  }\n];');

if (lastBraceIdx !== -1) {
  const insertPos = lastBraceIdx + '  }'.length;
  const newContent = content.slice(0, insertPos) + jsonString + content.slice(insertPos);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully appended ${toAppend.length} Tuesday 13 classes to initial-classes-data.js!`);
} else {
  console.error('Could not find insertion point in initial-classes-data.js!');
  process.exit(1);
}
