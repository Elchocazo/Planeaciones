const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../js/data/initial-classes-data.js');
let content = fs.readFileSync(filePath, 'utf8');

const thurs15Classes = [
  {
    id: "cls_20261015_mat2_9",
    date: "2026-10-15",
    teacherId: "usr_manuel",
    subjectName: "Matemáticas",
    subjectId: "matematicas",
    gradeName: "2°",
    gradeId: "2",
    group: "2°",
    time: "7:00 - 8:40",
    startTime: "7:00",
    endTime: "8:40",
    dayOfWeek: "Jueves",
    dayNumber: "9",
    sequenceNumber: 9,
    status: "planned",
    topic: "Taller práctico impreso de aplicación y afianzamiento: valor posicional (UM, C, D, U), descomposición y relaciones de orden ascendente y descendente mediante representaciones gráficas y dibujos estructurados.",
    curriculum: {
      topic: "Taller práctico impreso de aplicación y afianzamiento: valor posicional (UM, C, D, U), descomposición y relaciones de orden ascendente y descendente mediante representaciones gráficas y dibujos estructurados.",
      dba: "DBA 1: Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 999 (ampliado progresivamente a cantidades de cuatro cifras).",
      achievement: "Aplica el concepto de valor posicional y los criterios de orden ascendente y descendente en la resolución de situaciones prácticas y trazados gráficos, con el fin de organizar, comparar y representar cantidades numéricas de hasta cuatro cifras en su contexto escolar."
    },
    didacticSequence: {
      inicio: "Saludo institucional y bienvenida al aula. Dinámica de activación motriz y espacial 'Escalando la montaña numérica': las estudiantes simulan escalar una montaña dando pasos firmes mientras cuentan en coro de 1.000 en 1.000 de forma ascendente (1.000, 2.000, 3.000... hasta 9.000); luego simulan descender en paracaídas contando hacia atrás de forma descendente (9.000, 8.000, 7.000... hasta 1.000). Activación de saberes previos mediante preguntas orientadoras: '¿Qué habitación de la casa revisamos primero para saber cuál número es más grande? ¿Cómo representamos en un dibujo una Unidad de Mil frente a una simple Unidad?'. Presentación del propósito pedagógico de la jornada: desarrollar un taller práctico integral donde cada estudiante será la arquitecta de sus números, dibujando esquemas, casas de valores y escaleras ordenadas con el uso indispensable de la regla plástica.",
      desarrollo: "Encuadre del taller y modelado docente: El docente explica en el tablero los criterios de trabajo para el taller de dos horas: precisión en el uso de la regla, diferenciación cromática con lápiz rojo para el punto de mil y casillas divisorias, y concentración individual. Repaso conceptual activo: Recordatorio guiado del valor de cada habitación (UM = 1.000, C = 100, D = 10, U = 1) y de la dirección de los dos órdenes matemáticos (ascendente: de menor a mayor / descendente: de mayor a menor). Desarrollo guiado y autónomo del taller práctico: Las estudiantes abren sus cuadernos y consignan la guía conceptual breve de repaso y proceden a resolver los puntos del taller, los cuales integran retos de dibujo técnico infantil (dibujar la escalera ascendente, el tren descendente, las casas de valor posicional y la representación de cantidades). Acompañamiento personalizado: El docente recorre puesto por puesto verificando la correcta postura de la mano al sujetar la regla, la alineación en la cuadrícula y aclarando dudas específicas sobre números con cifras intermedias en cero.",
      cierre: "Socialización colectiva en el tablero: Estudiantes voluntarias pasan a dibujar en la pizarra una de las escaleras de ordenación y una casa de valor posicional resuelta del taller para comparar procedimientos con el grupo. Retroalimentación formativa inmediata, destacando la pulcritud en los dibujos geométricos y la exactitud matemática. Preguntas de metacognición: '¿Qué dibujo les ayudó más a entender cuándo un número sube o baja? ¿Por qué es más fácil comparar números si los ubicamos dentro de sus habitaciones?'. Recolección y firma de cuadernos para valoración formativa.",
      recursos: "Tablero acrílico, regla larga para pizarra y marcadores borrables de colores (negro, azul, verde y rojo). Cuaderno cuadriculado de matemáticas, lápiz negro con punta fina, lápiz rojo, borrador de nata, sacapuntas con depósito, caja de lápices de colores y regla plástica transparente de 20 o 30 cm.",
      evaluation: "Criterios de evaluación: Ubica con precisión cantidades de cuatro cifras en esquemas dibujados de valor posicional; ordena con exactitud listas numéricas tanto en orden ascendente como descendente; emplea la regla plástica para trazar diagramas y dibujos limpios; descompone y compone cantidades identificando el valor real de cada dígito.\nInstrumento: Rúbrica analítica breve de taller práctico (criterios: corrección conceptual numérica, trazado con regla y pulcritud gráfica, autonomía y seguimiento de instrucciones).\nEvidencias de aprendizaje: Taller gráfico y numérico de 5 puntos completamente resuelto y coloreado en el cuaderno de apuntes.",
      tareas: "1. Dibuja en tu cuaderno una escalera de 4 escalones con tu regla y acomoda de forma ascendente (de menor a mayor) los siguientes precios: 5.600, 1.200, 8.900, 3.400.\n2. Dibuja una casa de números con sus cuatro cuartos (UM, C, D, U), aloja dentro al número 7.042 y escribe al frente cuántas unidades vale el dígito 7.",
      durations: { inicio: 20, desarrollo: 75, cierre: 25 }
    },
    teacherNotebook: {
      question: "¿Cómo utilizamos los números hasta 9.999 y las operaciones básicas para resolver situaciones de nuestro entorno escolar y familiar?",
      dynamics: "Dinámica 'El taller de las maestras constructoras': Se declara el salón de clases como una 'Oficina de Arquitectura Numérica'. Cada estudiante asume el rol de arquitecta jefa de su propio cuaderno. Para que una construcción no se caiga ni se confunda, debe cumplir los tres decretos de la constructora:\n1. Ninguna pared se traza chueca: toda línea recta debe ser apoyada con la regla plástica firme.\n2. Cada habitación tiene su placa oficial: el punto de mil va pintado de rojo entre las Centenas y las Unidades de Mil.\n3. Coloreamos con cariño y suavidad sin salirnos de los bordes trazados.",
      studentNotebookContent: `<p><strong>TÍTULO: TALLER PRÁCTICO: EL MAPA DE LOS NÚMEROS GIGANTES</strong></p>
<p><strong>REPASO: ¿QUÉ ES EL VALOR POSICIONAL?</strong><br>
El valor posicional es el valor que tiene cada dígito dependiendo de la habitación donde duerme dentro de un número.<br>
• Una misma cifra cambia de tamaño según su lugar: no es lo mismo tener un 3 en las Unidades que tener un 3 en las Unidades de Mil.<br>
• Las habitaciones crecen de diez en diez de derecha a izquierda.</p>
<p><strong>LAS CUATRO HABITACIONES Y SUS VALORES</strong><br>
• Habitación de las Unidades (U): Vale 1 unidad por cada habitante.<br>
• Habitación de las Decenas (D): Vale 10 unidades por cada habitante.<br>
• Habitación de las Centenas (C): Vale 100 unidades por cada habitante.<br>
• Habitación de las Unidades de Mil (UM): Vale 1.000 unidades por cada habitante.<br>
• El punto de mil (.): Se dibuja en la base a la izquierda de las Centenas y se lee diciendo en voz alta '¡MIL!'.</p>
<p><strong>LAS DOS DIRECCIONES DEL ORDEN NUMÉRICO</strong><br>
• ORDEN ASCENDENTE: Significa ordenar desde el número MENOR hasta el número MAYOR (subir la escalera de números).<br>
Ejemplo: 1.500 &lt; 2.500 &lt; 3.500 &lt; 4.500.<br>
• ORDEN DESCENDENTE: Significa ordenar desde el número MAYOR hasta el número MENOR (bajar la escalera de números).<br>
Ejemplo: 4.500 &gt; 3.500 &gt; 2.500 &gt; 1.500.</p>`,
      practicalActivity: `TALLER / ACTIVIDAD PRÁCTICA DE LA CLASE:
Paso 1: Dibujar y resolver la escalera ascendente (De menor a mayor)
Traza una escalera de cuatro escalones hacia la derecha. Ordena de menor a mayor: 2.100 < 4.300 < 6.400 < 8.500.
Paso 2: Dibujar y resolver la cascada descendente (De mayor a menor)
Dibuja cuatro vagones de tren y ordena de mayor a menor con el signo >: 9.100 > 5.800 > 3.250 > 1.900.
Paso 3: Construcción de las casas de valor posicional
Traza casas de cuatro cuartos (UM, C, D, U) con punto rojo de mil y aloja los números asignados.`,
      additionalNotes: "Para las estudiantes con ritmo de trabajo más pausado o debilidad motriz fina, se facilitará una plantilla de apoyo con la silueta de los rectángulos o se permitirá trazar escalones de 2 cuadritos de altura por 3 de ancho para evitar fatiga en la mano."
    },
    scheduleSlotId: "slot_usr_manuel_w4_i0_matematicas_2",
    attachments: []
  },
  {
    id: "cls_20261015_sis4b_15",
    date: "2026-10-15",
    teacherId: "usr_manuel",
    subjectName: "Sistemas",
    subjectId: "sistemas",
    gradeName: "4°B",
    gradeId: "4_b",
    group: "4B",
    time: "8:40 - 9:30",
    startTime: "8:40",
    endTime: "9:30",
    dayOfWeek: "Jueves",
    dayNumber: "15",
    sequenceNumber: 15,
    status: "planned",
    topic: "Aplicación práctica y diseño de tablas en Word / Docs para la estructuración y organización de reportajes y datos visuales.",
    curriculum: {
      topic: "Aplicación práctica y diseño de tablas en Word / Docs para la estructuración y organización de reportajes y datos visuales.",
      dba: "DBA 2: Utiliza procesadores de texto y herramientas ofimáticas para diseñar documentos estructurados con tablas, columnas e imágenes.",
      achievement: "Inserta, redimensiona y formatea tablas complejas en procesadores de texto, aplicando sombreado de celdas, bordes y tipografías jerarquizadas de forma ordenada."
    },
    didacticSequence: {
      inicio: "Saludo institucional, ingreso en orden a la sala de informática. Verificación de postura ergonómica y activación de saberes previos: ¿Cómo organizamos información en filas y columnas para que sea fácil de leer?",
      desarrollo: "Demostración docente en proyector: inserción de tablas avanzadas, modificación del ancho de columnas con los nodos de redimensión, sombreado de fila de encabezados y bordes personalizados. Práctica individual en computador: diseño de una tabla para juego de palabras 'Stop' con 7 columnas (Letra, Nombre, Apellido, Ciudad/País, Animal, Cosa/Fruta, Puntos) y dos rondas de datos.",
      cierre: "Guardado del documento en la carpeta de grado 4°B. Socialización y revisión rápida en pantalla. Verificación del apagado correcto de monitores y orden en los puestos.",
      recursos: "Sala de informática, computadores con procesador de texto (Microsoft Word / Google Docs), proyector multimedia.",
      evaluation: "Criterios: Precisión en la creación y formato de la tabla, aplicación correcta de estilos en los encabezados, ortografía y uso responsable de los equipos.",
      tareas: "No aplica para esta sesión.",
      durations: { inicio: 10, desarrollo: 30, cierre: 10 }
    },
    teacherNotebook: {
      question: "¿Por qué las tablas son el formato preferido para registrar y comparar resultados ordenados en documentos digitales?",
      dynamics: "Diseño paso a paso con teclas de desplazamiento y atajos para saltar entre celdas (Tabulador).",
      studentNotebookContent: `<p><strong>TEMA: APLICACIÓN PRÁCTICA DE TABLAS EN PROCESADORES DE TEXTO</strong></p>
<p>Una <strong>tabla</strong> es una cuadrícula compuesta por:</p>
<ul>
<li><strong>Filas:</strong> Conjuntos de celdas dispuestas en sentido horizontal.</li>
<li><strong>Columnas:</strong> Conjuntos de celdas dispuestas en sentido vertical.</li>
<li><strong>Celdas:</strong> La intersección entre una fila y una columna donde escribimos texto o números.</li>
</ul>
<p><strong>ESTRUCTURACIÓN DE ENCABEZADOS:</strong> La primera fila siempre debe diferenciarse visualmente usando negrita y sombreado de fondo.</p>`,
      practicalActivity: `Práctica de tabla en Word / Docs:
Crear una tabla de 7 columnas por 4 filas con los siguientes encabezados:
[ Letra | Nombre | Apellido | Ciudad/País | Animal | Cosa/Fruta | Puntos ]
Llenar dos rondas completas de datos y aplicar color de fondo a la primera fila.`,
      additionalNotes: "Enfatizar el uso de los controles de redimensión para ajustar el ancho de cada columna según el tamaño del texto."
    },
    scheduleSlotId: "slot_usr_manuel_w4_i1_sistemas_4_b",
    attachments: []
  },
  {
    id: "cls_20261015_sis1_5",
    date: "2026-10-15",
    teacherId: "usr_manuel",
    subjectName: "Sistemas",
    subjectId: "sistemas",
    gradeName: "1°",
    gradeId: "1",
    group: "1°",
    time: "10:10 - 11:00",
    startTime: "10:10",
    endTime: "11:00",
    dayOfWeek: "Jueves",
    dayNumber: "5",
    sequenceNumber: 5,
    status: "planned",
    topic: "Diferencias entre objetos naturales y artificiales y su utilización en el entorno escolar y cotidiano.",
    curriculum: {
      topic: "Diferencias entre objetos naturales y artificiales y su utilización en el entorno escolar y cotidiano.",
      dba: "DBA 1: Reconoce artefactos creados por el ser humano para satisfacer necesidades y los diferencia de los elementos de la naturaleza.",
      achievement: "Identifica y clasifica objetos de su entorno diario en naturales y artificiales, reconociendo el propósito de las herramientas y artefactos tecnológicos."
    },
    didacticSequence: {
      inicio: "Saludo institucional y bienvenida al aula. Dinámica interactiva de exploración sensorial: las estudiantes observan los elementos del salón y de la ventana para clasificarlos en voz alta según hayan sido creados por la naturaleza o por personas.",
      desarrollo: "Presentación guiada con imágenes impresas y proyector de objetos naturales (árboles, ríos, piedras, frutas) vs objetos artificiales (lápiz, cuaderno, silla, computador, tijeras). Actividad en el cuaderno: trazo de una tabla de dos columnas rotuladas 'Natural' y 'Artificial'. Dibujo y coloreado de tres elementos representativos en cada lado.",
      cierre: "Puesta en común voluntaria: varias estudiantes muestran sus dibujos y explican qué necesidad satisface el objeto artificial que dibujaron. Firma formativa de cuadernos.",
      recursos: "Tablero, marcadores, láminas ilustrativas, cuaderno cuadriculado de tecnología, lápices y colores.",
      evaluation: "Criterios: Clasificación acertada de elementos naturales y artefactos, creatividad en los dibujos y seguimiento de instrucciones.",
      tareas: "Recortar y pegar en el cuaderno 2 elementos de la naturaleza y 2 objetos inventados por las personas.",
      durations: { inicio: 10, desarrollo: 30, cierre: 10 }
    },
    teacherNotebook: {
      question: "¿Qué cosas nos da la naturaleza tal como son y qué cosas tuvieron que inventar los seres humanos?",
      dynamics: "Juego 'Veo Veo Tecnológico': señalar artefactos útiles que nos rodean y decir para qué nos sirven.",
      studentNotebookContent: `<p><strong>TEMA: OBJETOS NATURALES Y OBJETOS ARTIFICIALES</strong></p>
<p>• <strong>Objetos Naturales:</strong> Son los que nacen de la naturaleza sin que las personas los fabriquen.<br>
<em>Ejemplos:</em> Plantas, rocas, agua, animales, frutas.</p>
<p>• <strong>Objetos Artificiales (Artefactos):</strong> Son creados por el ser humano para solucionar necesidades y hacer la vida más fácil.<br>
<em>Ejemplos:</em> Cuaderno, lápiz, regla, tijeras, computador.</p>`,
      practicalActivity: `Taller en el cuaderno:
1. Traza una línea al medio de tu página.
2. A la izquierda escribe NATURAL y dibuja un árbol y una fruta.
3. A la derecha escribe ARTIFICIAL y dibuja un lápiz y un computador.
4. Colorea con suavidad sin salirte de las líneas.`,
      additionalNotes: "Reforzar el concepto de artefacto como creación humana para el bienestar y el estudio."
    },
    scheduleSlotId: "slot_usr_manuel_w4_i2_sistemas_1",
    attachments: []
  }
];

// Check if any of these IDs already exist in content
const hasMat2 = content.includes('cls_20261015_mat2_9');
const hasSis4b = content.includes('cls_20261015_sis4b_15');
const hasSis1 = content.includes('cls_20261015_sis1_5');

if (hasMat2 || hasSis4b || hasSis1) {
  console.log('Thursday 15 classes already present in file, skipping append.');
  process.exit(0);
}

const jsonString = thurs15Classes.map(c => '  ,\n' + JSON.stringify(c, null, 2).replace(/^/gm, '  ')).join('');
const lastBraceIdx = content.lastIndexOf('  }\n];');

if (lastBraceIdx !== -1) {
  const insertPos = lastBraceIdx + '  }'.length;
  const newContent = content.slice(0, insertPos) + jsonString + content.slice(insertPos);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully appended Thursday 15 classes to initial-classes-data.js!');
} else {
  console.error('Could not find insertion point!');
  process.exit(1);
}
