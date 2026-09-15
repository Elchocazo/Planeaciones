/**
 * MÓDULO DE GESTIÓN DEL BANCO CURRICULAR POR PERIODO (MALLA DE TEMAS, LOGROS Y DBA)
 * Malla Curricular Oficial Institucional - Colegio Hogar Madre de Dios
 * Docente: Manuel Alejandro Muñoz Palomino / Manuel Muñoz
 * 
 * Basado estrictamente en los documentos oficiales de la carpeta 'Mallas/':
 * - Mallas Manuel 2026 -2027 Matemáticas.pdf
 * - Mallas curriculares Sistemas 1-11.docx (1).pdf
 * 
 * Asignaturas y Grados oficiales completos:
 * - Matemáticas (2°, 3°, 7° y banco de apoyo)
 * - Lógica (6°)
 * - Sistemas / Tecnología e Informática (1° a 8°, con 4°A y 4°B)
 * - Robótica (9°, 10°, 11°)
 * - Dirección de Grupo (7°)
 * Para los 4 periodos académicos (1°, 2°, 3°, 4°).
 */

const STORAGE_CURRICULUM_KEY = 'teacher_curriculum_bank_v13';

const DEFAULT_CURRICULUM = {
  "1°": {
    "Matemáticas": {
      "7°": [
        {
          "id": "mat-7-1-1",
          "topic": "El conjunto de los Números Enteros {Z}: Necesidad histórica y números relativos con signo",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Reconoce y conceptualiza el conjunto de los números enteros {Z}, su necesidad histórica y su utilidad para modelar temperaturas, altitudes y balances financieros.",
          "suggestedSequence": "Inicio: Reflexión sobre situaciones donde los números naturales son insuficientes (temperaturas bajo cero, saldos en contra). Desarrollo: Definición formal del conjunto {Z} = Z- U {0} U Z+ y representación de números relativos. Cierre: Taller de clasificación y modelación de situaciones reales con números con signo."
        },
        {
          "id": "mat-7-1-2",
          "topic": "Representación de números enteros en la recta numérica, orden y valor absoluto",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Ubica números enteros en la recta numérica, establece relaciones de orden (<, >, =) y calcula el valor absoluto como distancia geométrica al origen.",
          "suggestedSequence": "Inicio: Noción geométrica de distancia y simetría en la recta numérica. Desarrollo: Formalización del valor absoluto |a| y criterios de ordenación en {Z}. Cierre: Ejercicios de ubicación en la recta numérica y comparación de enteros."
        },
        {
          "id": "mat-7-1-3",
          "topic": "Operaciones aditivas en {Z} (adición y sustracción): Algoritmo, ley de signos y problemas del entorno",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Aplica los algoritmos de adición y sustracción de números enteros utilizando la ley de signos para resolver problemas contextualizados.",
          "suggestedSequence": "Inicio: Dinámica de ganancias y pérdidas financieras para ilustrar la suma y resta de enteros. Desarrollo: Reglas de signos para la suma y eliminación de paréntesis precedidos de signo negativo. Cierre: Resolución de problemas contextualizados de variación térmica y estados de cuenta."
        },
        {
          "id": "mat-7-1-4",
          "topic": "Operaciones multiplicativas en {Z} (multiplicación y división exacta): Ley de signos y aplicaciones",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Resuelve multiplicaciones y divisiones exactas en {Z} aplicando con exactitud la ley de signos en operaciones directas y combinadas.",
          "suggestedSequence": "Inicio: Demostración intuitiva de por qué 'menos por menos da más' usando secuencias y patrones. Desarrollo: Algoritmos de multiplicación y división exacta con números enteros signados. Cierre: Taller de ejercitación y cálculo mental rápido con la ley de signos."
        },
        {
          "id": "mat-7-1-5",
          "topic": "Propiedades de las operaciones en {Z} (conmutativa, asociativa, distributiva)",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Justifica procedimientos aritméticos aplicando las propiedades conmutativa, asociativa y distributiva para simplificar cálculos.",
          "suggestedSequence": "Inicio: Verificación empírica de si alterar el orden o agrupar modifica el resultado al operar enteros. Desarrollo: Formalización de las propiedades conmutativa, asociativa, elemento neutro y distributiva. Cierre: Ejercicios de simplificación de cálculos aplicando la propiedad distributiva."
        },
        {
          "id": "mat-7-1-6",
          "topic": "Potenciación y radicación de enteros: Propiedades y cálculo en contextos significativos",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Calcula potencias y raíces exactas de números enteros determinando el signo del resultado según la paridad del exponente.",
          "suggestedSequence": "Inicio: Análisis de casos de bases negativas elevadas a exponentes pares e impares. Desarrollo: Propiedades de la potenciación (producto de bases iguales, potencia de potencia) y radicación exacta. Cierre: Taller de cálculo y resolución de problemas de crecimiento potencial."
        },
        {
          "id": "mat-7-1-7",
          "topic": "Jerarquía de las operaciones y polinomios aritméticos con signos de agrupación",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Resuelve polinomios aritméticos con enteros respetando el orden jerárquico de las operaciones y la eliminación ordenada de signos de agrupación.",
          "suggestedSequence": "Inicio: Análisis de una expresión ambigua para debatir el orden obligatorio de cálculo. Desarrollo: Jerarquía de operaciones: signos de agrupación (paréntesis, corchetes, llaves), potencias/raíces, productos/cocientes, sumas/restas. Cierre: Taller en parejas resolviendo polinomios aritméticos verificando paso a paso."
        },
        {
          "id": "mat-7-1-8",
          "topic": "Introducción al lenguaje algebraico en {Z}: Incógnitas, relaciones y traducción de enunciados",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Traduce enunciados verbales de situaciones cotidianas al lenguaje algebraico simbólico identificando incógnitas y relaciones de equivalencia.",
          "suggestedSequence": "Inicio: Retos de pensamiento numérico expresados en lenguaje cotidiano. Desarrollo: Asignación de variables literales y modelación simbólica de frases matemáticas. Cierre: Ejercicios de traducción bidireccional entre lenguaje natural y algebraico."
        },
        {
          "id": "mat-7-1-9",
          "topic": "Ecuaciones lineales básicas en {Z} aplicadas a la solución de problemas",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Formula y resuelve ecuaciones lineales de la forma x + a = b y ax = b en el conjunto de los enteros para responder interrogantes prácticos.",
          "suggestedSequence": "Inicio: Modelo de balanza equilibrada para plantear ecuaciones de primer grado. Desarrollo: Métodos de transposición de términos y operaciones inversas para despejar la variable. Cierre: Planteamiento y solución de problemas cotidianos verificando la validez de la respuesta."
        }
      ],
      "3°": [
        {
          "id": "mat-3-1-1",
          "topic": "Números naturales hasta 99.999: Lectura, escritura y representación en el ábaco",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Lee, escribe y descompone números de hasta cinco cifras relacionando unidades, decenas, centenas y unidades de mil.",
          "suggestedSequence": "Inicio: Manipulación de ábaco y bloques multibase para representar cantidades de 4 y 5 cifras. Desarrollo: Lectura y escritura formal de números hasta 99.999 en el cuaderno. Cierre: Juego de dictado y formación de números con tarjetas de valor posicional."
        },
        {
          "id": "mat-3-1-2",
          "topic": "Valor posicional (DM, UM, C, D, U), descomposición y comparación con signos >, <, =",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Compara y ordena números naturales hasta 99.999 según el valor posicional de sus cifras usando los signos de ordenación.",
          "suggestedSequence": "Inicio: Comparación de precios de electrodomésticos en folletos publicitarios. Desarrollo: Descomposición aditiva en DM, UM, C, D, U y comparación cifra por cifra de izquierda a derecha. Cierre: Ejercicios de ordenación ascendente y descendente en el tablero."
        },
        {
          "id": "mat-3-1-3",
          "topic": "Adición y sustracción con y sin reagrupación (algoritmos formales y estimación)",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Resuelve sumas y restas con números de hasta cinco cifras con reagrupación aplicando el algoritmo convencional con precisión.",
          "suggestedSequence": "Inicio: Planteamiento de compras en un supermercado sumando varios artículos. Desarrollo: Práctica guiada del algoritmo de suma llevando y resta prestando hasta de 5 dígitos. Cierre: Taller de ejercitación individual y corrección conjunta de errores comunes."
        },
        {
          "id": "mat-3-1-4",
          "topic": "Propiedades de la adición: Conmutativa, asociativa y elemento neutro",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Aplica las propiedades conmutativa y asociativa de la adición para agilizar el cálculo mental y verificar operaciones.",
          "suggestedSequence": "Inicio: Comprobación con material concreto de si cambiar el orden de los sumandos altera el total. Desarrollo: Demostración formal de propiedades conmutativa, asociativa y elemento neutro (el cero). Cierre: Taller de cálculo mental rápido aplicando asociaciones convenientes."
        },
        {
          "id": "mat-3-1-5",
          "topic": "Problemas aditivos de composición, transformación y comparación en el entorno escolar y familiar",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Propone y resuelve problemas cotidianos que requieren adición y sustracción, explicando el procedimiento seguido.",
          "suggestedSequence": "Inicio: Lectura compartida de una situación problemática sobre ahorros familiares. Desarrollo: Pasos para resolver problemas: subrayar datos, identificar la operación y redactar la respuesta. Cierre: Creación de problemas matemáticos propios por parte de los estudiantes."
        },
        {
          "id": "mat-3-1-6",
          "topic": "Estrategias de cálculo mental y redondeo a la decena y centena más cercana",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Aplica técnicas de aproximación y redondeo para estimar resultados de sumas y restas valorando su razonabilidad.",
          "suggestedSequence": "Inicio: Estimación rápida del costo total de una lista de útiles escolares. Desarrollo: Reglas para redondear a la decena, centena y millar más cercano en la recta numérica. Cierre: Dinámica de cálculo mental cronometrado en equipos."
        }
      ],
      "2°": [
        {
          "id": "mat-2-1-1",
          "topic": "Lectura, escritura y valor posicional (unidades de mil, centenas, decenas, unidades) hasta 9.999",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Lee, escribe y descompone números hasta 9.999 identificando el valor posicional de cada dígito en UM-C-D-U.",
          "suggestedSequence": "Inicio: Representación de cantidades con bloques de base diez y ábacos de 4 varillas. Desarrollo: Lectura, escritura y descomposición aditiva de números hasta 9.999. Cierre: Dictado de números y juego de armado de cantidades con tarjetas numéricas."
        },
        {
          "id": "mat-2-1-2",
          "topic": "Descomposición aditiva, comparación y ordenación de números con signos >, <, =",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Compara números hasta 9.999 estableciendo relaciones de mayor que, menor que e igual que a partir de sus cifras.",
          "suggestedSequence": "Inicio: Uso del cocodrilo comilón para recordar la orientación de los signos > y <. Desarrollo: Comparación cifra por cifra empezando por las unidades de mil y ordenación de listas numéricas. Cierre: Taller de ordenar cantidades de menor a mayor y de mayor a menor."
        },
        {
          "id": "mat-2-1-3",
          "topic": "Algoritmo formal de la adición y la sustracción con y sin reagrupación (llevando y prestando)",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Resuelve adiciones y sustracciones con números de hasta cuatro cifras aplicando algoritmos con y sin reagrupación.",
          "suggestedSequence": "Inicio: Simulación de compras en la tienda escolar calculando costos y vueltas. Desarrollo: Práctica guiada del algoritmo de suma llevando y resta prestando con material concreto y cuaderno. Cierre: Taller de ejercitación individual con revisión y corrección paso a paso."
        },
        {
          "id": "mat-2-1-4",
          "topic": "Propiedades de la adición: Conmutativa, asociativa y elemento neutro",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Reconoce que el orden de los sumandos no altera el resultado y aplica el cero como elemento neutro.",
          "suggestedSequence": "Inicio: Demostración con fichas de que 15 + 7 es igual a 7 + 15. Desarrollo: Ejercicios de agrupación con paréntesis para verificar la propiedad asociativa y el neutro. Cierre: Juegos de cálculo mental rápido aplicando propiedades para facilitar sumas."
        },
        {
          "id": "mat-2-1-5",
          "topic": "Planteamiento y resolución de problemas aditivos de composición, transformación y comparación",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Interpreta y resuelve problemas aditivos sencillos del entorno escolar y familiar, registrando la operación y la respuesta.",
          "suggestedSequence": "Inicio: Lectura guiada de un cuento matemático sobre animales en una granja. Desarrollo: Identificación de la pregunta, datos numéricos y selección de la operación correcta (+ o -). Cierre: Socialización de las respuestas redactadas en el cuaderno."
        },
        {
          "id": "mat-2-1-6",
          "topic": "Cálculo mental rápido y secuencias numéricas ascendentes y descendentes",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Identifica patrones numéricos y completa secuencias sumando o restando de 2 en 2, 5 en 5, 10 en 10 y 100 en 100.",
          "suggestedSequence": "Inicio: Juego de conteo rítmico con palmadas de 10 en 10 hasta 1.000. Desarrollo: Identificación del patrón de cambio en secuencias numéricas en la recta. Cierre: Desafío de completar laberintos numéricos siguiendo la secuencia correcta."
        }
      ],
      "1°": [
        {
          "id": "mat-1-1-1",
          "topic": "Nociones espaciales (arriba/abajo, dentro/fuera) y conceptos de conjunto",
          "dba": "DBA: Describe y representa la posición y trayectoria de objetos con respecto a sí mismo.",
          "achievement": "Reconoce relaciones espaciales y clasifica elementos en colecciones según atributos comunes."
        },
        {
          "id": "mat-1-1-2",
          "topic": "Números del 0 al 9: conteo, lectura, escritura y relaciones de orden (mayor, menor, igual)",
          "dba": "DBA: Utiliza los números naturales del 0 al 9 para contar, comparar y ordenar cantidades.",
          "achievement": "Lee, escribe y ordena números del 0 al 9 asociándolos con cantidades reales de objetos."
        },
        {
          "id": "mat-1-1-3",
          "topic": "La decena (grupo de 10) y descomposición de cantidades",
          "dba": "DBA: Comprende la noción de decena como agrupación de diez unidades en el sistema decimal.",
          "achievement": "Agrupa colecciones de 10 elementos e identifica la decena como unidad de orden superior."
        }
      ],
      "4°": [
        {
          "id": "mat-4-1-1",
          "topic": "Sistema de numeración decimal hasta millones: lectura, escritura y valor posicional",
          "dba": "DBA: Interpreta y utiliza los números naturales hasta el orden de los millones en diversos contextos.",
          "achievement": "Descompone números de más de seis cifras según su valor posicional en unidades, decenas, centenas y millones."
        },
        {
          "id": "mat-4-1-2",
          "topic": "Operaciones aditivas (suma y resta) con números grandes y resolución de problemas",
          "dba": "DBA: Formula y resuelve problemas aditivos que involucran cantidades de varias cifras.",
          "achievement": "Aplica con precisión algoritmos de adición y sustracción verificando la lógica de la respuesta en situaciones cotidianas."
        },
        {
          "id": "mat-4-1-3",
          "topic": "Multiplicación por dos y tres cifras y propiedades operativas",
          "dba": "DBA: Utiliza la multiplicación para resolver situaciones de conteo y proporcionalidad directa.",
          "achievement": "Multiplica eficazmente números de varias cifras aplicando propiedades conmutativa, asociativa y distributiva."
        }
      ],
      "5°": [
        {
          "id": "mat-5-1-1",
          "topic": "Operaciones combinadas con números naturales y jerarquía de las operaciones",
          "dba": "DBA: Interpreta y aplica la jerarquía de las operaciones y el uso de paréntesis en problemas complejos.",
          "achievement": "Resuelve expresiones aritméticas combinadas respetando los signos de agrupación y el orden jerárquico."
        },
        {
          "id": "mat-5-1-2",
          "topic": "Potenciación, radicación y logaritmación de números naturales",
          "dba": "DBA: Identifica y utiliza la potenciación, radicación y logaritmación para representar y resolver problemas.",
          "achievement": "Calcula potencias, raíces y logaritmos sencillos explicando sus relaciones mutuas como operaciones inversas."
        },
        {
          "id": "mat-5-1-3",
          "topic": "Teoría de números: múltiplos, divisores, números primos, compuestos, MCM y MCD",
          "dba": "DBA: Justifica relaciones de divisibilidad y calcula el mínimo común múltiplo y máximo común divisor.",
          "achievement": "Aplica criterios de divisibilidad y descompone en factores primos para hallar el MCM y MCD en situaciones prácticas."
        }
      ],
      "6°": [
        {
          "id": "mat-6-1-1",
          "topic": "Estructura del conjunto de los números naturales (N) y propiedades operacionales",
          "dba": "DBA: Utiliza las propiedades de los números naturales para formular y resolver problemas aritméticos.",
          "achievement": "Explica las propiedades de clausura, conmutatividad, asociatividad y distributividad en los números naturales."
        },
        {
          "id": "mat-6-1-2",
          "topic": "Sistemas de numeración posicionales y no posicionales (Decimal, Binario, Romano)",
          "dba": "DBA: Compara y convierte números entre el sistema decimal y otros sistemas de numeración.",
          "achievement": "Realiza conversiones entre el sistema decimal, binario y romano comprendiendo la base de cada uno."
        },
        {
          "id": "mat-6-1-3",
          "topic": "Geometría básica: conceptos de punto, recta, plano, segmentos y medición de ángulos",
          "dba": "DBA: Reconoce y clasifica ángulos y elementos geométricos en figuras planas y en el espacio.",
          "achievement": "Construye y clasifica ángulos (agudo, recto, obtuso, llano) utilizando transportador y regla."
        }
      ],
      "8°": [
        {
          "id": "mat-8-1-1",
          "topic": "Conjunto de los números reales (R) y racionales (Q): ubicación en la recta y orden",
          "dba": "DBA: Construye representaciones de los números reales en la recta numérica y reconoce relaciones de orden.",
          "achievement": "Saber: Clasifica y ubica números racionales e irracionales en la recta. Hacer: Resuelve operaciones básicas con números reales."
        },
        {
          "id": "mat-8-1-2",
          "topic": "Expresiones algebraicas: clasificación en monomios, binomios, polinomios y valor numérico",
          "dba": "DBA: Construye expresiones algebraicas equivalentes y utiliza el lenguaje algebraico para modelar situaciones.",
          "achievement": "Saber: Identifica el grado, coeficiente y parte literal de monomios y polinomios. Hacer: Calcula el valor numérico sustituyendo variables."
        },
        {
          "id": "mat-8-1-3",
          "topic": "Operaciones con expresiones algebraicas: adición y sustracción de polinomios con reducción de términos",
          "dba": "DBA: Aplica procesos inductivos y reglas algebraicas para reducir términos semejantes y operar polinomios.",
          "achievement": "Saber: Explica qué son términos semejantes. Hacer: Suma y resta polinomios ordenándolos de forma ascendente o descendente."
        },
        {
          "id": "mat-8-1-4",
          "topic": "Geometría: Polígonos, clasificación, suma de ángulos interiores y criterios de congruencia de triángulos",
          "dba": "DBA: Reconoce y contrasta propiedades y relaciones geométricas utilizadas en la congruencia de triángulos.",
          "achievement": "Saber: Enuncia los criterios LAL, ALA, LLL de congruencia. Hacer: Resuelve ejercicios de polígonos y congruencia demostrando relaciones métricas."
        }
      ],
      "9°": [
        {
          "id": "mat-9-1-1",
          "topic": "Números reales, números irracionales y notación científica",
          "dba": "DBA: Utiliza números reales en sus diferentes representaciones y la notación científica para magnitudes físicas.",
          "achievement": "Saber: Distingue números racionales e irracionales. Hacer: Expresa cantidades grandes y pequeñas en notación científica."
        },
        {
          "id": "mat-9-1-2",
          "topic": "Radicales, simplificación y operaciones con expresiones radicales",
          "dba": "DBA: Simplifica y opera con expresiones que contienen radicales aplicando propiedades de la potenciación.",
          "achievement": "Saber: Conoce las propiedades de los radicales. Hacer: Realiza adiciones, multiplicaciones y racionalizaciones de denominadores."
        }
      ],
      "10°": [
        {
          "id": "mat-10-1-1",
          "topic": "Trigonometría: Ángulos, sistemas de medición angular (grados sexagesimales y radianes) y conversiones",
          "dba": "DBA: Comprende la noción de radián y realiza conversiones entre grados y radianes en la circunferencia.",
          "achievement": "Saber: Define el radián y el grado. Hacer: Convierte medidas angulares y resuelve problemas de longitud de arco."
        },
        {
          "id": "mat-10-1-2",
          "topic": "Razones trigonométricas en el triángulo rectángulo (Seno, Coseno, Tangente, Cotangente, Secante, Cosecante)",
          "dba": "DBA: Aplica las razones trigonométricas fundamentales para resolver triángulos rectángulos en situaciones reales.",
          "achievement": "Saber: Enuncia las seis razones trigonométricas. Hacer: Calcula lados y ángulos desconocidos en triángulos rectángulos."
        }
      ],
      "11°": [
        {
          "id": "mat-11-1-1",
          "topic": "Desigualdades e inecuaciones lineales y cuadráticas en una variable",
          "dba": "DBA: Utiliza las propiedades de las desigualdades para resolver inecuaciones e interpretar intervalos de solución.",
          "achievement": "Saber: Identifica intervalos abiertos, cerrados y semiabiertos. Hacer: Resuelve inecuaciones y grafica el conjunto solución."
        },
        {
          "id": "mat-11-1-2",
          "topic": "Funciones reales: concepto de función, dominio, rango y representaciones gráficas",
          "dba": "DBA: Analiza y modela fenómenos de cambio a través de funciones algebraicas y trascendentes.",
          "achievement": "Saber: Determina el dominio y rango de funciones. Hacer: Grafica e interpreta funciones polinómicas, racionales y radicales."
        }
      ]
    },
    "Lógica": {
      "6°": [
        {
          "id": "log-6-1-1",
          "topic": "Lógica de conjuntos y fundamentos aritméticos: Proposiciones y conectores lógicos (enunciados, valor verdad, conectores)",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Diferencia proposiciones de enunciados abiertos y cerrados, determinando su valor de verdad mediante tablas de verdad y conectores lógicos básicos.",
          "suggestedSequence": "Inicio: Análisis de enunciados del lenguaje cotidiano para determinar cuáles pueden evaluarse como verdaderos o falsos. Desarrollo: Formalización de proposiciones simples y compuestas con conectores lógicos (conjunción, disyunción, negación). Cierre: Taller aplicativo construyendo tablas de verdad y evaluando razonamientos."
        },
        {
          "id": "log-6-1-2",
          "topic": "Razonamiento con conjuntos: Diagramas de Venn, relaciones de pertenencia, unión, intersección y diferencia",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Emplea diagramas de Venn y operaciones entre conjuntos para modelar situaciones problema y clasificar datos numéricos del entorno.",
          "suggestedSequence": "Inicio: Dinámica grupal de clasificación de estudiantes por preferencias para visualizar intersecciones. Desarrollo: Operaciones formales de unión, intersección y complemento entre conjuntos numéricos. Cierre: Resolución de problemas cuantitativos contextualizados con diagramas de Venn."
        },
        {
          "id": "log-6-1-3",
          "topic": "Lógica numérica y divisibilidad: Números primos, compuestos, criterios de divisibilidad, MCD y MCM",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Aplica criterios de divisibilidad y descomposición en factores primos para calcular el MCD y MCM en la resolución de problemas de sincronización y repartos.",
          "suggestedSequence": "Inicio: Reto de reparto equitativo y coincidencias de tiempo que ilustran el MCD y el MCM. Desarrollo: Descomposición factorial simultánea y aplicación de criterios de divisibilidad del 2 al 11. Cierre: Taller de problemas prácticos de horarios y empaquetado verificando respuestas."
        },
        {
          "id": "log-6-1-4",
          "topic": "Argumentación deductiva y validación crítica de razonamientos lógicos",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Argumenta deducciones matemáticas y valida críticamente procedimientos propios y ajenos mediante el razonamiento lógico formal.",
          "suggestedSequence": "Inicio: Presentación de paradojas lógicas y acertijos para estimular el debate reflexivo. Desarrollo: Estructuración formal de silogismos y argumentos premisa-conclusión en matemáticas. Cierre: Evaluación formativa mediante coevaluación de argumentos y detección de falacias."
        }
      ]
    },
    "Sistemas": {
      "1°": [
        {
          "id": "sis-1-1-1",
          "topic": "Los objetos que nos rodean y los artefactos tecnológicos del hogar y la escuela",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Identifica objetos tecnológicos en su entorno cotidiano y describe la función que cumplen para facilitar las actividades diarias.",
          "suggestedSequence": "Inicio: Recorrido de observación por el aula identificando objetos creados por el ser humano. Desarrollo: Clasificación de artefactos según el lugar donde se usan (cocina, aula, transporte). Cierre: Dibujo en el cuaderno de su artefacto tecnológico favorito explicando para qué sirve."
        },
        {
          "id": "sis-1-1-2",
          "topic": "¿Qué es la tecnología? Necesidades humanas que satisface",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce que la tecnología surge del ingenio humano para resolver problemas y mejorar la calidad de vida de las personas.",
          "suggestedSequence": "Inicio: Cuento infantil sobre la invención de la rueda y las herramientas de los primeros humanos. Desarrollo: Diálogo guiado comparando cómo se hacían las tareas antes y cómo se hacen ahora con la tecnología. Cierre: Modelado con plastilina de una herramienta inventada por el estudiante."
        },
        {
          "id": "sis-1-1-3",
          "topic": "Cuidado y uso responsable de nuestros útiles escolares y dispositivos electrónicos",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Aplica normas de cuidado, orden y respeto al manipular materiales escolares y aparatos tecnológicos.",
          "suggestedSequence": "Inicio: Conversación sobre qué le pasa a los objetos si no los cuidamos o se caen al suelo. Desarrollo: Elaboración conjunta del decálogo de cuidado de los dispositivos y útiles del salón. Cierre: Compromiso individual firmado con huella dactilar para el buen uso de los recursos."
        },
        {
          "id": "sis-1-1-4",
          "topic": "Diferencias entre objetos naturales y objetos artificiales (creados por el hombre)",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Distingue elementos de la naturaleza de artefactos artificiales elaborados por el ser humano mediante comparación directa.",
          "suggestedSequence": "Inicio: Exploración en el patio recolectando hojas, piedras y comparándolas con lápices y tijeras. Desarrollo: Tabla comparativa de dos columnas clasificando elementos naturales vs. artificiales. Cierre: Taller de recorte y pegado de imágenes en la categoría correcta."
        }
      ],
      "2°": [
        {
          "id": "sis-2-1-1",
          "topic": "Concepto, origen y evolución histórica de los objetos tecnológicos cotidianos",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce la evolución histórica de artefactos cotidianos y cómo han transformado la vida del ser humano.",
          "suggestedSequence": "Inicio: Comparación entre la vela, la lámpara de aceite y la bombilla eléctrica. Desarrollo: Línea de tiempo sencilla mostrando la evolución de artefactos de comunicación y transporte. Cierre: Taller de ilustración comparando un objeto antiguo con su versión moderna."
        },
        {
          "id": "sis-2-1-2",
          "topic": "Impacto de la tecnología en la comunicación, el transporte y el hogar",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Describe los beneficios y desafíos que genera la tecnología en las actividades cotidianas de su comunidad.",
          "suggestedSequence": "Inicio: Pregunta problematizadora: ¿Cómo se comunicaban las personas antes de que existieran los celulares? Desarrollo: Análisis de los cambios positivos en la medicina, educación y transporte gracias a la tecnología. Cierre: Taller de redacción de oraciones sobre el beneficio de un invento tecnológico."
        },
        {
          "id": "sis-2-1-3",
          "topic": "Uso responsable, sostenible y reciclaje de materiales y artefactos tecnológicos",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Propone acciones para el cuidado del medio ambiente frente a los residuos electrónicos y el ahorro de energía.",
          "suggestedSequence": "Inicio: Observación de imágenes sobre la basura tecnológica (pilas, cables rotos). Desarrollo: Pautas de ahorro de energía (apagar monitores) y reciclaje adecuado de pilas y aparatos en desuso. Cierre: Elaboración de afiches promoviendo el reciclaje tecnológico en el colegio."
        }
      ],
      "3°": [
        {
          "id": "sis-3-1-1",
          "topic": "Periféricos de entrada, salida y almacenamiento en los sistemas de cómputo",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Clasifica periféricos del computador en dispositivos de entrada, salida y almacenamiento según el flujo de datos.",
          "suggestedSequence": "Inicio: Pregunta problematizadora: ¿Por dónde entra la información al computador y por dónde sale? Desarrollo: Diagrama de flujo de datos clasificando teclado/mouse (entrada), monitor/parlantes (salida) y USB/disco (almacenamiento). Cierre: Taller de asociación y emparejamiento de periféricos con su categoría."
        },
        {
          "id": "sis-3-1-2",
          "topic": "Evolución histórica de los medios de comunicación y telecomunicaciones",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce los hitos en la evolución de las telecomunicaciones desde el telégrafo hasta los teléfonos inteligentes.",
          "suggestedSequence": "Inicio: Línea del tiempo de la comunicación humana: señales de humo, cartas, telégrafo, teléfono y satélites. Desarrollo: Comparación de la velocidad y alcance de la información en el siglo XIX vs. siglo XXI. Cierre: Elaboración de una historieta gráfica que ilustre la transformación de la comunicación."
        },
        {
          "id": "sis-3-1-3",
          "topic": "Ergonomía digital y salud física en el uso de tecnologías",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Aplica pautas ergonómicas de postura, distancia visual y pausas activas para evitar fatiga física.",
          "suggestedSequence": "Inicio: Explicación de las consecuencias de la mala postura y el uso excesivo de pantallas en los ojos y cuello. Desarrollo: Rutina de ejercicios de relajación visual (regla 20-20-20) y estiramiento de extremidades. Cierre: Creación de una lista de verificación ergonómica para aplicar en casa y en el aula."
        }
      ],
      "4°": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "5°": [
        {
          "id": "sis-5-1-1",
          "topic": "Estilos y formato editorial: Normas APA básicas (portada, márgenes, interlineado y sangría)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Aplica normas de presentación formal (APA básicas) en la elaboración de informes y trabajos académicos.",
          "suggestedSequence": "Inicio: Comparación de un trabajo escolar sin normas vs. un trabajo formal con normas APA. Desarrollo: Configuración de portada institucional, fuente legible (Times New Roman / Arial 12), interlineado y sangría de primera línea. Cierre: Redacción y maquetación de la portada y primer capítulo de una monografía escolar."
        },
        {
          "id": "sis-5-1-2",
          "topic": "Generación automática de tablas de contenido (índices) mediante niveles de título",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Organiza documentos extensos mediante estilos de título para generar tablas de contenido automáticas.",
          "suggestedSequence": "Inicio: ¿Por qué es un error hacer un índice escribiendo puntos manualmente? Demostración en proyector. Desarrollo: Jerarquización con Título 1, Título 2 y uso del menú Referencias -> Tabla de contenido automática. Cierre: Actualización dinámica de números de página al modificar el texto de un documento."
        },
        {
          "id": "sis-5-1-3",
          "topic": "Secciones de documento, saltos de página y numeración diferenciada",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Utiliza saltos de sección para desvincular encabezados y aplicar numeración a partir de páginas específicas.",
          "suggestedSequence": "Inicio: Problema común: cómo no numerar la portada pero sí empezar a numerar desde la introducción. Desarrollo: Inserción de saltos de sección de página siguiente y desvinculación de encabezado/pie de página. Cierre: Taller práctico entregando un documento con páginas preliminares sin número e inicio numerado."
        }
      ],
      "6°": [
        {
          "id": "sis-6-1-1",
          "topic": "Arquitectura de hardware: Componentes internos del computador (procesador, tarjeta madre, memoria RAM)",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Identifica los componentes internos de la CPU describiendo la función de la placa base, procesador, memoria RAM y disco.",
          "suggestedSequence": "Inicio: Desarme pedagógico de una torre de computador para observar los componentes físicos. Desarrollo: Funciones de la tarjeta madre, zócalo del procesador, módulos de memoria RAM, fuente y discos duros. Cierre: Diagrama esquemático rotulado identificando los componentes internos y su interconexión."
        },
        {
          "id": "sis-6-1-2",
          "topic": "Software de sistema vs. software de aplicación y licenciamiento (libre vs. privativo)",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diferencia sistemas operativos de programas de aplicación y comprende conceptos de licencias y software libre.",
          "suggestedSequence": "Inicio: Comparación entre Windows, Linux, Android e iOS: ¿Por qué son sistemas operativos? Desarrollo: Clasificación de software (sistema, desarrollo, aplicación) y tipos de licencia (Creative Commons, GNU, comercial). Cierre: Cuadro comparativo analizando ventajas del software libre frente al software privativo."
        },
        {
          "id": "sis-6-1-3",
          "topic": "Administración del sistema operativo Windows: Cuentas, compresión de archivos y copias de seguridad",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Administra archivos y carpetas eficientemente utilizando herramientas de compresión (ZIP), respaldo y configuración básica.",
          "suggestedSequence": "Inicio: ¿Qué hacer cuando un archivo es demasiado pesado para enviarse por correo? Desarrollo: Uso de utilidades de compresión ZIP/RAR, creación de puntos de restauración y copias de respaldo. Cierre: Taller práctico de organización de carpetas, compresión y verificación de espacio en disco."
        }
      ],
      "7°": [
        {
          "id": "sis-7-1-1",
          "topic": "Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Gestiona documentos complejos con estilos definidos, para comunicar información con claridad y presentación profesional.",
          "suggestedSequence": "Inicio: Análisis de un artículo de revista digital identificando columnas, capitulares y tipografía editorial. Desarrollo: Configuración avanzada de formatos de párrafo, sangrías francesas, tablas con estilos personalizados y saltos. Cierre: Creación de una página de revista editorial aplicando criterios visuales profesionales."
        },
        {
          "id": "sis-7-1-2",
          "topic": "Normas de presentación y formato digital institucional",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica rigurosamente las pautas de formato institucional en la entrega de reportes e investigaciones escolares.",
          "suggestedSequence": "Inicio: Revisión del manual de estilo institucional del Colegio Hogar Madre de Dios. Desarrollo: Ajuste de márgenes, encabezados con membrete institucional, pie de página y citas bibliográficas. Cierre: Entrega formal de un informe maquetado conforme al estándar institucional."
        },
        {
          "id": "sis-7-1-3",
          "topic": "Hojas de cálculo: Uso de fórmulas avanzadas y gráficos estadísticos explicativos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Automatiza cálculos mediante funciones avanzadas, para analizar datos y tomar decisiones informadas en contextos académicos.",
          "suggestedSequence": "Inicio: Análisis de un conjunto masivo de datos de asistencia y rendimiento escolar. Desarrollo: Fórmulas estadísticas, porcentajes automáticos y generación de gráficos dinámicos con etiquetas de datos. Cierre: Presentación ejecutiva de conclusiones numéricas apoyada en los gráficos elaborados."
        },
        {
          "id": "sis-7-1-4",
          "topic": "Presentaciones interactivas: Integración de elementos multimedia, animaciones y diseño coherente",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Crea presentaciones digitales interactivas, para expresar ideas de forma visual y atractiva que capte la atención del público.",
          "suggestedSequence": "Inicio: Comparación entre diapositivas estáticas vs. presentaciones con botones interactivos e hipervínculos. Desarrollo: Uso de botones de acción, menús de navegación no lineal e incrustación de videos y animaciones. Cierre: Demostración interactiva navegando por la presentación ante los compañeros."
        },
        {
          "id": "sis-7-1-5",
          "topic": "Creación y edición de contenido digital: Grabación y producción de video con criterios técnicos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Edita y graba videos con criterios técnicos y narrativos, para producir materiales audiovisuales que comuniquen proyectos con impacto.",
          "suggestedSequence": "Inicio: Pautas básicas de encuadre (regla de los tercios), iluminación frontal y captura de audio nítido. Desarrollo: Grabación de una cápsula informativa y edición en software (Clipchamp / CapCut) con transiciones y música libre. Cierre: Publicación en el canal educativo del aula y evaluación formativa con rúbrica audiovisual."
        }
      ],
      "8°": [
        {
          "id": "sis-8-1-1",
          "topic": "Historia y evolución de las redes de comunicación: De ARPANET a las redes 5G y fibra óptica",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Analiza la evolución de las redes de transmisión de datos reconociendo el impacto social de la conectividad global.",
          "suggestedSequence": "Inicio: ¿Qué ocurrió en 1969 con el primer mensaje enviado entre dos computadores a kilómetros de distancia? Desarrollo: Evolución de las telecomunicaciones, conmutación de paquetes, cableado submarino y redes móviles. Cierre: Línea de tiempo interactiva ilustrando los saltos tecnológicos en conectividad."
        },
        {
          "id": "sis-8-1-2",
          "topic": "Modelos de redes, topologías (estrella, malla, bus) y direccionamiento IP / DNS",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende la estructura de las redes informáticas, identificando topologías físicas y la función del protocolo IP.",
          "suggestedSequence": "Inicio: Analogía postal: la dirección de tu casa como dirección IP y la guía telefónica como servidor DNS. Desarrollo: Topologías de red (estrella, bus, anillo, malla) y funcionamiento de direcciones IPv4 y máscaras de subred. Cierre: Simulación de una red en Cisco Packet Tracer conectando terminales a un switch."
        },
        {
          "id": "sis-8-1-3",
          "topic": "Dispositivos de red (routers, switches, módems) y seguridad inalámbrica Wi-Fi",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Configura parámetros básicos de seguridad en redes Wi-Fi (WPA2/WPA3) y comprende el rol de cada equipo.",
          "suggestedSequence": "Inicio: ¿Por qué no debemos conectarnos a redes Wi-Fi públicas abiertas sin protección? Desarrollo: Diferencias funcionales entre módem, router y switch; protocolos de cifrado y filtrado MAC. Cierre: Práctica guiada verificando la configuración de red y pruebas de conectividad (ping y traceroute)."
        }
      ]
    },
    "Robótica": {
      "9°": [
        {
          "id": "rob-9-1-1",
          "topic": "Fundamentos y clasificación de la robótica: De autómatas históricos a robots autónomos",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Clasifica sistemas robóticos según su morfología (móviles, brazos manipuladores, androides) e identifica su campo de aplicación.",
          "suggestedSequence": "Inicio: Evolución histórica desde los autómatas de reloj hasta los robots de exploración espacial (Perseverance). Desarrollo: Clasificación taxonómica: grados de libertad (DOF), tipo de locomoción (ruedas, orugas, patas) y entorno de operación. Cierre: Elaboración de un cuadro comparativo seleccionando el tipo de robot más idóneo para un rescate."
        },
        {
          "id": "rob-9-1-2",
          "topic": "Cinemática y estática de robots móviles: Centro de gravedad, balance y estabilidad estructural",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Calcula la posición del centro de masa de una estructura robótica móvil para asegurar estabilidad y evitar volcamientos.",
          "suggestedSequence": "Inicio: ¿Por qué los autos de carreras y los robots de combate son bajos y anchos? Análisis del centro de gravedad. Desarrollo: Principios de palanca, momento de inercia y distribución de peso de baterías y motores en el chasis. Cierre: Práctica experimental inclinando maquetas sobre rampas para medir el ángulo crítico de vuelco."
        },
        {
          "id": "rob-9-1-3",
          "topic": "Transmisión mecánica en robótica: Cálculo de relación de transmisión (i), torque y velocidad",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Determina las relaciones de reducción mecánica en trenes de engranajes optimizando el compromiso entre fuerza y rapidez.",
          "suggestedSequence": "Inicio: Desarme de un servomotor o motorreductor amarillo para observar su tren interno de piñones. Desarrollo: Fórmula de relación de transmisión (i = Z2/Z1) y cálculo del torque resultante en el eje motriz. Cierre: Taller de cálculo de relaciones mecánicas para trepar rampas de 30 grados sin que el motor se detenga."
        },
        {
          "id": "rob-9-1-4",
          "topic": "Ensamble electromecánico de chasis robótico diferencial y pruebas de rodamiento",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Ensambla la estructura mecánica de un robot de tracción diferencial verificando alineación de ejes y balance de masa.",
          "suggestedSequence": "Inicio: Pautas de seguridad en el uso de destornilladores, tornillería métrica y herramientas de corte. Desarrollo: Montaje de motores DC con reductores, rueda loca de apoyo (caster wheel) y portabaterías en el chasis. Cierre: Prueba de desplazamiento en línea recta sin derivas causadas por desalineación mecánica."
        }
      ],
      "10°": [
        {
          "id": "rob-10-1-1",
          "topic": "Fundamentos de cinemática de manipuladores: Articulaciones rotacionales y grados de libertad (DOF)",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Analiza la cinemática directa de un brazo robótico de 3 grados de libertad determinando su espacio de trabajo.",
          "suggestedSequence": "Inicio: Análisis de la movilidad del brazo humano (hombro, codo, muñeca) y su equivalencia en robots articulados. Desarrollo: Representación geométrica de eslabones y articulaciones rotacionales, y cálculo de coordenadas del efector final. Cierre: Simulación del alcance tridimensional del brazo en software de geometría dinámica."
        },
        {
          "id": "rob-10-1-2",
          "topic": "Diseño y modelado CAD 3D de eslabones, base giratoria y gripper en Tinkercad / Fusion 360",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Modela paramétricamente las piezas estructurales de un brazo robótico considerando tolerancias de ensamble y rodamientos.",
          "suggestedSequence": "Inicio: Pautas de diseño para fabricación digital: tolerancias de ajuste para tornillería M3 y servomotores. Desarrollo: Modelado de la base giratoria, eslabón primario, secundario y pinza mecánica en CAD 3D. Cierre: Verificación virtual del ensamble de las piezas comprobando que no existan colisiones entre partes móviles."
        },
        {
          "id": "rob-10-1-3",
          "topic": "Servomotores de alto torque (MG995 / MG996R) y dimensionamiento de fuentes de alimentación desacopladas",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Calcula los torques requeridos en cada articulación y dimensiona la fuente eléctrica independiente para servomotores metálicos.",
          "suggestedSequence": "Inicio: ¿Por qué un servomotor SG90 no puede levantar el peso de un brazo robótico? Torque = Fuerza x Distancia. Desarrollo: Cálculo del torque estático en la peor posición (brazo extendido horizontalmente) y selección de servomotores metálicos. Cierre: Conexión de una fuente externa de 5V/6V con corriente suficiente (5A) uniendo tierras comunes (GND)."
        },
        {
          "id": "rob-10-1-4",
          "topic": "Programación de trayectorias suaves en microcontroladores y reducción de vibraciones",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Programa rutinas de movimiento progresivo interpolado evitando aceleraciones bruscas que descalibren la estructura.",
          "suggestedSequence": "Inicio: Demostración de cómo los movimientos a máxima velocidad hacen vibrar la estructura del robot. Desarrollo: Algoritmo de incremento angular paso a paso con temporizadores milimétricos (curvas de aceleración trapezoidal). Cierre: Pruebas de movimiento suave y continuo entre dos puntos espaciales predeterminados."
        },
        {
          "id": "rob-10-1-5",
          "topic": "Calibración de rutinas Pick & Place y precisión en la repetibilidad de posición",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Programa y calibra ciclos industriales de toma y colocación de objetos (Pick & Place) con alta repetibilidad.",
          "suggestedSequence": "Inicio: Análisis del trabajo de robots en líneas de ensamblaje automotriz y empacado de alimentos. Desarrollo: Registro de coordenadas angulares para aproximación, descenso, sujeción, elevación, traslado y liberación de piezas. Cierre: Reto funcional de trasladar 5 cilindros de una bandeja a otra sin fallos en 2 minutos."
        }
      ],
      "11°": [
        {
          "id": "rob-11-1-1",
          "topic": "Metodología de ingeniería de proyectos mecatrónicos: Requerimientos y matriz morfológica",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Formula proyectos tecnológicos de alta complejidad aplicando matrices de decisión morfológica y especificaciones técnicas.",
          "suggestedSequence": "Inicio: Ciclo de vida de un proyecto de ingeniería: desde la detección de la necesidad hasta el prototipo funcional. Desarrollo: Levantamiento de requisitos técnicos (velocidad, peso, autonomía) y selección de conceptos con matrices morfológicas. Cierre: Documento formal de propuesta de proyecto de grado con cronograma y presupuesto detallado."
        },
        {
          "id": "rob-11-1-2",
          "topic": "Diseño paramétrico avanzado en CAD 3D y análisis de esfuerzos mecánicos",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Modela mecanismos complejos con relaciones de posición geométricas y simula resistencias mecánicas por elementos finitos.",
          "suggestedSequence": "Inicio: Importancia del diseño paramétrico: cambiar una dimensión y que todo el ensamblaje se ajuste automáticamente. Desarrollo: Modelado de piezas en Fusion 360 / SolidWorks y simulación básica de esfuerzos mecánicos en zonas críticas. Cierre: Planos técnicos normalizados con cotas, vistas y tolerancias dimensionales."
        },
        {
          "id": "rob-11-1-3",
          "topic": "Diseño y ruteo de circuitos impresos (PCB) profesionales con software EDA (EasyEDA / KiCad)",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Diseña esquemáticos electrónicos y rutea placas de circuito impreso (PCB) de doble capa aplicando normas de fabricación.",
          "suggestedSequence": "Inicio: ¿Por qué los cables en protoboard fallan en competencias de robótica? La necesidad del PCB soldado. Desarrollo: Creación del diagrama esquemático, selección de huellas (footprints) y ruteo manual de pistas respetando anchos de corriente. Cierre: Generación y verificación de archivos de fabricación Gerber listos para producción industrial."
        },
        {
          "id": "rob-11-1-4",
          "topic": "Fabricación digital: Parámetros de impresión 3D FDM avanzada y mecanizado CNC",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Configura parámetros de laminación (slicing) en impresión 3D optimizando resistencia mecánica, orientación y tiempos.",
          "suggestedSequence": "Inicio: Análisis de las propiedades de filamentos técnicos: PLA, PETG, ABS y fibra de carbono. Desarrollo: Configuración en laminadores (Cura / PrusaSlicer): altura de capa, porcentaje de relleno (infill), paredes y soportes. Cierre: Impresión y postprocesado de las piezas mecánicas estructurales del prototipo de graduación."
        }
      ]
    },
    "Dirección de grupo": {
      "7°": [
        {
          "id": "dir-7-1-1",
          "topic": "Acuerdos de convivencia escolar, inducción institucional y sentido de pertenencia",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Participa activamente en la construcción concertada del manual de convivencia del aula y asume compromisos colectivos.",
          "suggestedSequence": "Inicio: Dinámica de integración 'La telaraña de compromisos' reconociendo cualidades de cada compañero. Desarrollo: Debate reflexivo sobre las normas necesarias para un ambiente de aprendizaje armónico y respetuoso. Cierre: Firma solemne del pacto de aula y publicación en la cartelera del salón."
        },
        {
          "id": "dir-7-1-2",
          "topic": "Hábitos de estudio, gestión del tiempo y organización académica escolar",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Organiza un horario de estudio personal equilibrando deberes escolares, descanso y actividades familiares.",
          "suggestedSequence": "Inicio: Reflexión sobre la procrastinación y el uso excesivo de pantallas en los tiempos de estudio. Desarrollo: Diseño de un planificador semanal de tareas y técnicas de estudio eficaz (Pomodoro, resúmenes). Cierre: Compromiso de seguimiento semanal en la libreta escolar."
        },
        {
          "id": "dir-7-1-3",
          "topic": "Fortalecimiento de la empatía, el valor del respeto y la inclusión en el grupo",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Valora la diversidad de opiniones y estilos de aprendizaje de sus pares, rechazando cualquier forma de discriminación.",
          "suggestedSequence": "Inicio: Lectura y análisis de un dilema moral sobre la inclusión y el compañerismo. Desarrollo: Ejercicio de 'ponerse en los zapatos del otro' compartiendo historias personales de superación. Cierre: Creación del mural de la empatía con mensajes positivos para cada estudiante."
        }
      ]
    },
    "Tecnología e Informática": {
      "1°": [
        {
          "id": "sis-1-1-1",
          "topic": "Los objetos que nos rodean y los artefactos tecnológicos del hogar y la escuela",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Identifica objetos tecnológicos en su entorno cotidiano y describe la función que cumplen para facilitar las actividades diarias.",
          "suggestedSequence": "Inicio: Recorrido de observación por el aula identificando objetos creados por el ser humano. Desarrollo: Clasificación de artefactos según el lugar donde se usan (cocina, aula, transporte). Cierre: Dibujo en el cuaderno de su artefacto tecnológico favorito explicando para qué sirve."
        },
        {
          "id": "sis-1-1-2",
          "topic": "¿Qué es la tecnología? Necesidades humanas que satisface",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce que la tecnología surge del ingenio humano para resolver problemas y mejorar la calidad de vida de las personas.",
          "suggestedSequence": "Inicio: Cuento infantil sobre la invención de la rueda y las herramientas de los primeros humanos. Desarrollo: Diálogo guiado comparando cómo se hacían las tareas antes y cómo se hacen ahora con la tecnología. Cierre: Modelado con plastilina de una herramienta inventada por el estudiante."
        },
        {
          "id": "sis-1-1-3",
          "topic": "Cuidado y uso responsable de nuestros útiles escolares y dispositivos electrónicos",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Aplica normas de cuidado, orden y respeto al manipular materiales escolares y aparatos tecnológicos.",
          "suggestedSequence": "Inicio: Conversación sobre qué le pasa a los objetos si no los cuidamos o se caen al suelo. Desarrollo: Elaboración conjunta del decálogo de cuidado de los dispositivos y útiles del salón. Cierre: Compromiso individual firmado con huella dactilar para el buen uso de los recursos."
        },
        {
          "id": "sis-1-1-4",
          "topic": "Diferencias entre objetos naturales y objetos artificiales (creados por el hombre)",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Distingue elementos de la naturaleza de artefactos artificiales elaborados por el ser humano mediante comparación directa.",
          "suggestedSequence": "Inicio: Exploración en el patio recolectando hojas, piedras y comparándolas con lápices y tijeras. Desarrollo: Tabla comparativa de dos columnas clasificando elementos naturales vs. artificiales. Cierre: Taller de recorte y pegado de imágenes en la categoría correcta."
        }
      ],
      "2°": [
        {
          "id": "sis-2-1-1",
          "topic": "Concepto, origen y evolución histórica de los objetos tecnológicos cotidianos",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce la evolución histórica de artefactos cotidianos y cómo han transformado la vida del ser humano.",
          "suggestedSequence": "Inicio: Comparación entre la vela, la lámpara de aceite y la bombilla eléctrica. Desarrollo: Línea de tiempo sencilla mostrando la evolución de artefactos de comunicación y transporte. Cierre: Taller de ilustración comparando un objeto antiguo con su versión moderna."
        },
        {
          "id": "sis-2-1-2",
          "topic": "Impacto de la tecnología en la comunicación, el transporte y el hogar",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Describe los beneficios y desafíos que genera la tecnología en las actividades cotidianas de su comunidad.",
          "suggestedSequence": "Inicio: Pregunta problematizadora: ¿Cómo se comunicaban las personas antes de que existieran los celulares? Desarrollo: Análisis de los cambios positivos en la medicina, educación y transporte gracias a la tecnología. Cierre: Taller de redacción de oraciones sobre el beneficio de un invento tecnológico."
        },
        {
          "id": "sis-2-1-3",
          "topic": "Uso responsable, sostenible y reciclaje de materiales y artefactos tecnológicos",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Propone acciones para el cuidado del medio ambiente frente a los residuos electrónicos y el ahorro de energía.",
          "suggestedSequence": "Inicio: Observación de imágenes sobre la basura tecnológica (pilas, cables rotos). Desarrollo: Pautas de ahorro de energía (apagar monitores) y reciclaje adecuado de pilas y aparatos en desuso. Cierre: Elaboración de afiches promoviendo el reciclaje tecnológico en el colegio."
        }
      ],
      "3°": [
        {
          "id": "sis-3-1-1",
          "topic": "Periféricos de entrada, salida y almacenamiento en los sistemas de cómputo",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Clasifica periféricos del computador en dispositivos de entrada, salida y almacenamiento según el flujo de datos.",
          "suggestedSequence": "Inicio: Pregunta problematizadora: ¿Por dónde entra la información al computador y por dónde sale? Desarrollo: Diagrama de flujo de datos clasificando teclado/mouse (entrada), monitor/parlantes (salida) y USB/disco (almacenamiento). Cierre: Taller de asociación y emparejamiento de periféricos con su categoría."
        },
        {
          "id": "sis-3-1-2",
          "topic": "Evolución histórica de los medios de comunicación y telecomunicaciones",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce los hitos en la evolución de las telecomunicaciones desde el telégrafo hasta los teléfonos inteligentes.",
          "suggestedSequence": "Inicio: Línea del tiempo de la comunicación humana: señales de humo, cartas, telégrafo, teléfono y satélites. Desarrollo: Comparación de la velocidad y alcance de la información en el siglo XIX vs. siglo XXI. Cierre: Elaboración de una historieta gráfica que ilustre la transformación de la comunicación."
        },
        {
          "id": "sis-3-1-3",
          "topic": "Ergonomía digital y salud física en el uso de tecnologías",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Aplica pautas ergonómicas de postura, distancia visual y pausas activas para evitar fatiga física.",
          "suggestedSequence": "Inicio: Explicación de las consecuencias de la mala postura y el uso excesivo de pantallas en los ojos y cuello. Desarrollo: Rutina de ejercicios de relajación visual (regla 20-20-20) y estiramiento de extremidades. Cierre: Creación de una lista de verificación ergonómica para aplicar en casa y en el aula."
        }
      ],
      "4°": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "5°": [
        {
          "id": "sis-5-1-1",
          "topic": "Estilos y formato editorial: Normas APA básicas (portada, márgenes, interlineado y sangría)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Aplica normas de presentación formal (APA básicas) en la elaboración de informes y trabajos académicos.",
          "suggestedSequence": "Inicio: Comparación de un trabajo escolar sin normas vs. un trabajo formal con normas APA. Desarrollo: Configuración de portada institucional, fuente legible (Times New Roman / Arial 12), interlineado y sangría de primera línea. Cierre: Redacción y maquetación de la portada y primer capítulo de una monografía escolar."
        },
        {
          "id": "sis-5-1-2",
          "topic": "Generación automática de tablas de contenido (índices) mediante niveles de título",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Organiza documentos extensos mediante estilos de título para generar tablas de contenido automáticas.",
          "suggestedSequence": "Inicio: ¿Por qué es un error hacer un índice escribiendo puntos manualmente? Demostración en proyector. Desarrollo: Jerarquización con Título 1, Título 2 y uso del menú Referencias -> Tabla de contenido automática. Cierre: Actualización dinámica de números de página al modificar el texto de un documento."
        },
        {
          "id": "sis-5-1-3",
          "topic": "Secciones de documento, saltos de página y numeración diferenciada",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Utiliza saltos de sección para desvincular encabezados y aplicar numeración a partir de páginas específicas.",
          "suggestedSequence": "Inicio: Problema común: cómo no numerar la portada pero sí empezar a numerar desde la introducción. Desarrollo: Inserción de saltos de sección de página siguiente y desvinculación de encabezado/pie de página. Cierre: Taller práctico entregando un documento con páginas preliminares sin número e inicio numerado."
        }
      ],
      "6°": [
        {
          "id": "sis-6-1-1",
          "topic": "Arquitectura de hardware: Componentes internos del computador (procesador, tarjeta madre, memoria RAM)",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Identifica los componentes internos de la CPU describiendo la función de la placa base, procesador, memoria RAM y disco.",
          "suggestedSequence": "Inicio: Desarme pedagógico de una torre de computador para observar los componentes físicos. Desarrollo: Funciones de la tarjeta madre, zócalo del procesador, módulos de memoria RAM, fuente y discos duros. Cierre: Diagrama esquemático rotulado identificando los componentes internos y su interconexión."
        },
        {
          "id": "sis-6-1-2",
          "topic": "Software de sistema vs. software de aplicación y licenciamiento (libre vs. privativo)",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diferencia sistemas operativos de programas de aplicación y comprende conceptos de licencias y software libre.",
          "suggestedSequence": "Inicio: Comparación entre Windows, Linux, Android e iOS: ¿Por qué son sistemas operativos? Desarrollo: Clasificación de software (sistema, desarrollo, aplicación) y tipos de licencia (Creative Commons, GNU, comercial). Cierre: Cuadro comparativo analizando ventajas del software libre frente al software privativo."
        },
        {
          "id": "sis-6-1-3",
          "topic": "Administración del sistema operativo Windows: Cuentas, compresión de archivos y copias de seguridad",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Administra archivos y carpetas eficientemente utilizando herramientas de compresión (ZIP), respaldo y configuración básica.",
          "suggestedSequence": "Inicio: ¿Qué hacer cuando un archivo es demasiado pesado para enviarse por correo? Desarrollo: Uso de utilidades de compresión ZIP/RAR, creación de puntos de restauración y copias de respaldo. Cierre: Taller práctico de organización de carpetas, compresión y verificación de espacio en disco."
        }
      ],
      "7°": [
        {
          "id": "sis-7-1-1",
          "topic": "Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Gestiona documentos complejos con estilos definidos, para comunicar información con claridad y presentación profesional.",
          "suggestedSequence": "Inicio: Análisis de un artículo de revista digital identificando columnas, capitulares y tipografía editorial. Desarrollo: Configuración avanzada de formatos de párrafo, sangrías francesas, tablas con estilos personalizados y saltos. Cierre: Creación de una página de revista editorial aplicando criterios visuales profesionales."
        },
        {
          "id": "sis-7-1-2",
          "topic": "Normas de presentación y formato digital institucional",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica rigurosamente las pautas de formato institucional en la entrega de reportes e investigaciones escolares.",
          "suggestedSequence": "Inicio: Revisión del manual de estilo institucional del Colegio Hogar Madre de Dios. Desarrollo: Ajuste de márgenes, encabezados con membrete institucional, pie de página y citas bibliográficas. Cierre: Entrega formal de un informe maquetado conforme al estándar institucional."
        },
        {
          "id": "sis-7-1-3",
          "topic": "Hojas de cálculo: Uso de fórmulas avanzadas y gráficos estadísticos explicativos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Automatiza cálculos mediante funciones avanzadas, para analizar datos y tomar decisiones informadas en contextos académicos.",
          "suggestedSequence": "Inicio: Análisis de un conjunto masivo de datos de asistencia y rendimiento escolar. Desarrollo: Fórmulas estadísticas, porcentajes automáticos y generación de gráficos dinámicos con etiquetas de datos. Cierre: Presentación ejecutiva de conclusiones numéricas apoyada en los gráficos elaborados."
        },
        {
          "id": "sis-7-1-4",
          "topic": "Presentaciones interactivas: Integración de elementos multimedia, animaciones y diseño coherente",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Crea presentaciones digitales interactivas, para expresar ideas de forma visual y atractiva que capte la atención del público.",
          "suggestedSequence": "Inicio: Comparación entre diapositivas estáticas vs. presentaciones con botones interactivos e hipervínculos. Desarrollo: Uso de botones de acción, menús de navegación no lineal e incrustación de videos y animaciones. Cierre: Demostración interactiva navegando por la presentación ante los compañeros."
        },
        {
          "id": "sis-7-1-5",
          "topic": "Creación y edición de contenido digital: Grabación y producción de video con criterios técnicos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Edita y graba videos con criterios técnicos y narrativos, para producir materiales audiovisuales que comuniquen proyectos con impacto.",
          "suggestedSequence": "Inicio: Pautas básicas de encuadre (regla de los tercios), iluminación frontal y captura de audio nítido. Desarrollo: Grabación de una cápsula informativa y edición en software (Clipchamp / CapCut) con transiciones y música libre. Cierre: Publicación en el canal educativo del aula y evaluación formativa con rúbrica audiovisual."
        }
      ],
      "8°": [
        {
          "id": "sis-8-1-1",
          "topic": "Historia y evolución de las redes de comunicación: De ARPANET a las redes 5G y fibra óptica",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Analiza la evolución de las redes de transmisión de datos reconociendo el impacto social de la conectividad global.",
          "suggestedSequence": "Inicio: ¿Qué ocurrió en 1969 con el primer mensaje enviado entre dos computadores a kilómetros de distancia? Desarrollo: Evolución de las telecomunicaciones, conmutación de paquetes, cableado submarino y redes móviles. Cierre: Línea de tiempo interactiva ilustrando los saltos tecnológicos en conectividad."
        },
        {
          "id": "sis-8-1-2",
          "topic": "Modelos de redes, topologías (estrella, malla, bus) y direccionamiento IP / DNS",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende la estructura de las redes informáticas, identificando topologías físicas y la función del protocolo IP.",
          "suggestedSequence": "Inicio: Analogía postal: la dirección de tu casa como dirección IP y la guía telefónica como servidor DNS. Desarrollo: Topologías de red (estrella, bus, anillo, malla) y funcionamiento de direcciones IPv4 y máscaras de subred. Cierre: Simulación de una red en Cisco Packet Tracer conectando terminales a un switch."
        },
        {
          "id": "sis-8-1-3",
          "topic": "Dispositivos de red (routers, switches, módems) y seguridad inalámbrica Wi-Fi",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Configura parámetros básicos de seguridad en redes Wi-Fi (WPA2/WPA3) y comprende el rol de cada equipo.",
          "suggestedSequence": "Inicio: ¿Por qué no debemos conectarnos a redes Wi-Fi públicas abiertas sin protección? Desarrollo: Diferencias funcionales entre módem, router y switch; protocolos de cifrado y filtrado MAC. Cierre: Práctica guiada verificando la configuración de red y pruebas de conectividad (ping y traceroute)."
        }
      ]
    },
    "Tecnología": {
      "1°": [
        {
          "id": "sis-1-1-1",
          "topic": "Los objetos que nos rodean y los artefactos tecnológicos del hogar y la escuela",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Identifica objetos tecnológicos en su entorno cotidiano y describe la función que cumplen para facilitar las actividades diarias.",
          "suggestedSequence": "Inicio: Recorrido de observación por el aula identificando objetos creados por el ser humano. Desarrollo: Clasificación de artefactos según el lugar donde se usan (cocina, aula, transporte). Cierre: Dibujo en el cuaderno de su artefacto tecnológico favorito explicando para qué sirve."
        },
        {
          "id": "sis-1-1-2",
          "topic": "¿Qué es la tecnología? Necesidades humanas que satisface",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce que la tecnología surge del ingenio humano para resolver problemas y mejorar la calidad de vida de las personas.",
          "suggestedSequence": "Inicio: Cuento infantil sobre la invención de la rueda y las herramientas de los primeros humanos. Desarrollo: Diálogo guiado comparando cómo se hacían las tareas antes y cómo se hacen ahora con la tecnología. Cierre: Modelado con plastilina de una herramienta inventada por el estudiante."
        },
        {
          "id": "sis-1-1-3",
          "topic": "Cuidado y uso responsable de nuestros útiles escolares y dispositivos electrónicos",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Aplica normas de cuidado, orden y respeto al manipular materiales escolares y aparatos tecnológicos.",
          "suggestedSequence": "Inicio: Conversación sobre qué le pasa a los objetos si no los cuidamos o se caen al suelo. Desarrollo: Elaboración conjunta del decálogo de cuidado de los dispositivos y útiles del salón. Cierre: Compromiso individual firmado con huella dactilar para el buen uso de los recursos."
        },
        {
          "id": "sis-1-1-4",
          "topic": "Diferencias entre objetos naturales y objetos artificiales (creados por el hombre)",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Distingue elementos de la naturaleza de artefactos artificiales elaborados por el ser humano mediante comparación directa.",
          "suggestedSequence": "Inicio: Exploración en el patio recolectando hojas, piedras y comparándolas con lápices y tijeras. Desarrollo: Tabla comparativa de dos columnas clasificando elementos naturales vs. artificiales. Cierre: Taller de recorte y pegado de imágenes en la categoría correcta."
        }
      ],
      "2°": [
        {
          "id": "sis-2-1-1",
          "topic": "Concepto, origen y evolución histórica de los objetos tecnológicos cotidianos",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce la evolución histórica de artefactos cotidianos y cómo han transformado la vida del ser humano.",
          "suggestedSequence": "Inicio: Comparación entre la vela, la lámpara de aceite y la bombilla eléctrica. Desarrollo: Línea de tiempo sencilla mostrando la evolución de artefactos de comunicación y transporte. Cierre: Taller de ilustración comparando un objeto antiguo con su versión moderna."
        },
        {
          "id": "sis-2-1-2",
          "topic": "Impacto de la tecnología en la comunicación, el transporte y el hogar",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Describe los beneficios y desafíos que genera la tecnología en las actividades cotidianas de su comunidad.",
          "suggestedSequence": "Inicio: Pregunta problematizadora: ¿Cómo se comunicaban las personas antes de que existieran los celulares? Desarrollo: Análisis de los cambios positivos en la medicina, educación y transporte gracias a la tecnología. Cierre: Taller de redacción de oraciones sobre el beneficio de un invento tecnológico."
        },
        {
          "id": "sis-2-1-3",
          "topic": "Uso responsable, sostenible y reciclaje de materiales y artefactos tecnológicos",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Propone acciones para el cuidado del medio ambiente frente a los residuos electrónicos y el ahorro de energía.",
          "suggestedSequence": "Inicio: Observación de imágenes sobre la basura tecnológica (pilas, cables rotos). Desarrollo: Pautas de ahorro de energía (apagar monitores) y reciclaje adecuado de pilas y aparatos en desuso. Cierre: Elaboración de afiches promoviendo el reciclaje tecnológico en el colegio."
        }
      ],
      "3°": [
        {
          "id": "sis-3-1-1",
          "topic": "Periféricos de entrada, salida y almacenamiento en los sistemas de cómputo",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Clasifica periféricos del computador en dispositivos de entrada, salida y almacenamiento según el flujo de datos.",
          "suggestedSequence": "Inicio: Pregunta problematizadora: ¿Por dónde entra la información al computador y por dónde sale? Desarrollo: Diagrama de flujo de datos clasificando teclado/mouse (entrada), monitor/parlantes (salida) y USB/disco (almacenamiento). Cierre: Taller de asociación y emparejamiento de periféricos con su categoría."
        },
        {
          "id": "sis-3-1-2",
          "topic": "Evolución histórica de los medios de comunicación y telecomunicaciones",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce los hitos en la evolución de las telecomunicaciones desde el telégrafo hasta los teléfonos inteligentes.",
          "suggestedSequence": "Inicio: Línea del tiempo de la comunicación humana: señales de humo, cartas, telégrafo, teléfono y satélites. Desarrollo: Comparación de la velocidad y alcance de la información en el siglo XIX vs. siglo XXI. Cierre: Elaboración de una historieta gráfica que ilustre la transformación de la comunicación."
        },
        {
          "id": "sis-3-1-3",
          "topic": "Ergonomía digital y salud física en el uso de tecnologías",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Aplica pautas ergonómicas de postura, distancia visual y pausas activas para evitar fatiga física.",
          "suggestedSequence": "Inicio: Explicación de las consecuencias de la mala postura y el uso excesivo de pantallas en los ojos y cuello. Desarrollo: Rutina de ejercicios de relajación visual (regla 20-20-20) y estiramiento de extremidades. Cierre: Creación de una lista de verificación ergonómica para aplicar en casa y en el aula."
        }
      ],
      "4°": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-1-1",
          "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
          "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
          "id": "sis-4-1-2",
          "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
          "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
          "id": "sis-4-1-3",
          "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
          "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
      ],
      "5°": [
        {
          "id": "sis-5-1-1",
          "topic": "Estilos y formato editorial: Normas APA básicas (portada, márgenes, interlineado y sangría)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Aplica normas de presentación formal (APA básicas) en la elaboración de informes y trabajos académicos.",
          "suggestedSequence": "Inicio: Comparación de un trabajo escolar sin normas vs. un trabajo formal con normas APA. Desarrollo: Configuración de portada institucional, fuente legible (Times New Roman / Arial 12), interlineado y sangría de primera línea. Cierre: Redacción y maquetación de la portada y primer capítulo de una monografía escolar."
        },
        {
          "id": "sis-5-1-2",
          "topic": "Generación automática de tablas de contenido (índices) mediante niveles de título",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Organiza documentos extensos mediante estilos de título para generar tablas de contenido automáticas.",
          "suggestedSequence": "Inicio: ¿Por qué es un error hacer un índice escribiendo puntos manualmente? Demostración en proyector. Desarrollo: Jerarquización con Título 1, Título 2 y uso del menú Referencias -> Tabla de contenido automática. Cierre: Actualización dinámica de números de página al modificar el texto de un documento."
        },
        {
          "id": "sis-5-1-3",
          "topic": "Secciones de documento, saltos de página y numeración diferenciada",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Utiliza saltos de sección para desvincular encabezados y aplicar numeración a partir de páginas específicas.",
          "suggestedSequence": "Inicio: Problema común: cómo no numerar la portada pero sí empezar a numerar desde la introducción. Desarrollo: Inserción de saltos de sección de página siguiente y desvinculación de encabezado/pie de página. Cierre: Taller práctico entregando un documento con páginas preliminares sin número e inicio numerado."
        }
      ],
      "6°": [
        {
          "id": "sis-6-1-1",
          "topic": "Arquitectura de hardware: Componentes internos del computador (procesador, tarjeta madre, memoria RAM)",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Identifica los componentes internos de la CPU describiendo la función de la placa base, procesador, memoria RAM y disco.",
          "suggestedSequence": "Inicio: Desarme pedagógico de una torre de computador para observar los componentes físicos. Desarrollo: Funciones de la tarjeta madre, zócalo del procesador, módulos de memoria RAM, fuente y discos duros. Cierre: Diagrama esquemático rotulado identificando los componentes internos y su interconexión."
        },
        {
          "id": "sis-6-1-2",
          "topic": "Software de sistema vs. software de aplicación y licenciamiento (libre vs. privativo)",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diferencia sistemas operativos de programas de aplicación y comprende conceptos de licencias y software libre.",
          "suggestedSequence": "Inicio: Comparación entre Windows, Linux, Android e iOS: ¿Por qué son sistemas operativos? Desarrollo: Clasificación de software (sistema, desarrollo, aplicación) y tipos de licencia (Creative Commons, GNU, comercial). Cierre: Cuadro comparativo analizando ventajas del software libre frente al software privativo."
        },
        {
          "id": "sis-6-1-3",
          "topic": "Administración del sistema operativo Windows: Cuentas, compresión de archivos y copias de seguridad",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Administra archivos y carpetas eficientemente utilizando herramientas de compresión (ZIP), respaldo y configuración básica.",
          "suggestedSequence": "Inicio: ¿Qué hacer cuando un archivo es demasiado pesado para enviarse por correo? Desarrollo: Uso de utilidades de compresión ZIP/RAR, creación de puntos de restauración y copias de respaldo. Cierre: Taller práctico de organización de carpetas, compresión y verificación de espacio en disco."
        }
      ],
      "7°": [
        {
          "id": "sis-7-1-1",
          "topic": "Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Gestiona documentos complejos con estilos definidos, para comunicar información con claridad y presentación profesional.",
          "suggestedSequence": "Inicio: Análisis de un artículo de revista digital identificando columnas, capitulares y tipografía editorial. Desarrollo: Configuración avanzada de formatos de párrafo, sangrías francesas, tablas con estilos personalizados y saltos. Cierre: Creación de una página de revista editorial aplicando criterios visuales profesionales."
        },
        {
          "id": "sis-7-1-2",
          "topic": "Normas de presentación y formato digital institucional",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica rigurosamente las pautas de formato institucional en la entrega de reportes e investigaciones escolares.",
          "suggestedSequence": "Inicio: Revisión del manual de estilo institucional del Colegio Hogar Madre de Dios. Desarrollo: Ajuste de márgenes, encabezados con membrete institucional, pie de página y citas bibliográficas. Cierre: Entrega formal de un informe maquetado conforme al estándar institucional."
        },
        {
          "id": "sis-7-1-3",
          "topic": "Hojas de cálculo: Uso de fórmulas avanzadas y gráficos estadísticos explicativos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Automatiza cálculos mediante funciones avanzadas, para analizar datos y tomar decisiones informadas en contextos académicos.",
          "suggestedSequence": "Inicio: Análisis de un conjunto masivo de datos de asistencia y rendimiento escolar. Desarrollo: Fórmulas estadísticas, porcentajes automáticos y generación de gráficos dinámicos con etiquetas de datos. Cierre: Presentación ejecutiva de conclusiones numéricas apoyada en los gráficos elaborados."
        },
        {
          "id": "sis-7-1-4",
          "topic": "Presentaciones interactivas: Integración de elementos multimedia, animaciones y diseño coherente",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Crea presentaciones digitales interactivas, para expresar ideas de forma visual y atractiva que capte la atención del público.",
          "suggestedSequence": "Inicio: Comparación entre diapositivas estáticas vs. presentaciones con botones interactivos e hipervínculos. Desarrollo: Uso de botones de acción, menús de navegación no lineal e incrustación de videos y animaciones. Cierre: Demostración interactiva navegando por la presentación ante los compañeros."
        },
        {
          "id": "sis-7-1-5",
          "topic": "Creación y edición de contenido digital: Grabación y producción de video con criterios técnicos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Edita y graba videos con criterios técnicos y narrativos, para producir materiales audiovisuales que comuniquen proyectos con impacto.",
          "suggestedSequence": "Inicio: Pautas básicas de encuadre (regla de los tercios), iluminación frontal y captura de audio nítido. Desarrollo: Grabación de una cápsula informativa y edición en software (Clipchamp / CapCut) con transiciones y música libre. Cierre: Publicación en el canal educativo del aula y evaluación formativa con rúbrica audiovisual."
        }
      ],
      "8°": [
        {
          "id": "sis-8-1-1",
          "topic": "Historia y evolución de las redes de comunicación: De ARPANET a las redes 5G y fibra óptica",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Analiza la evolución de las redes de transmisión de datos reconociendo el impacto social de la conectividad global.",
          "suggestedSequence": "Inicio: ¿Qué ocurrió en 1969 con el primer mensaje enviado entre dos computadores a kilómetros de distancia? Desarrollo: Evolución de las telecomunicaciones, conmutación de paquetes, cableado submarino y redes móviles. Cierre: Línea de tiempo interactiva ilustrando los saltos tecnológicos en conectividad."
        },
        {
          "id": "sis-8-1-2",
          "topic": "Modelos de redes, topologías (estrella, malla, bus) y direccionamiento IP / DNS",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende la estructura de las redes informáticas, identificando topologías físicas y la función del protocolo IP.",
          "suggestedSequence": "Inicio: Analogía postal: la dirección de tu casa como dirección IP y la guía telefónica como servidor DNS. Desarrollo: Topologías de red (estrella, bus, anillo, malla) y funcionamiento de direcciones IPv4 y máscaras de subred. Cierre: Simulación de una red en Cisco Packet Tracer conectando terminales a un switch."
        },
        {
          "id": "sis-8-1-3",
          "topic": "Dispositivos de red (routers, switches, módems) y seguridad inalámbrica Wi-Fi",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Configura parámetros básicos de seguridad en redes Wi-Fi (WPA2/WPA3) y comprende el rol de cada equipo.",
          "suggestedSequence": "Inicio: ¿Por qué no debemos conectarnos a redes Wi-Fi públicas abiertas sin protección? Desarrollo: Diferencias funcionales entre módem, router y switch; protocolos de cifrado y filtrado MAC. Cierre: Práctica guiada verificando la configuración de red y pruebas de conectividad (ping y traceroute)."
        }
      ]
    }
  },
  "2°": {
    "Matemáticas": {
      "7°": [
        {
          "id": "mat-7-2-1",
          "topic": "Conjunto de números racionales (Q): Necesidad histórica y relación con los números enteros",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Comprende el origen y la necesidad de los números racionales (Q) como cociente de dos enteros con denominador no nulo.",
          "suggestedSequence": "Inicio: Situaciones de medición y repartos que no tienen solución en {Z} (dividir 5 panes entre 4 personas). Desarrollo: Definición formal de {Q} = {a/b | a,b en Z, b != 0} y fracciones equivalentes. Cierre: Taller de simplificación y amplificación de fracciones racionales."
        },
        {
          "id": "mat-7-2-2",
          "topic": "Representación de los racionales en forma fraccionaria, decimal y porcentual",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Convierte números racionales entre sus representaciones fraccionaria, decimal (exacta, periódica pura y mixta) y porcentual.",
          "suggestedSequence": "Inicio: Análisis de ofertas comerciales (1/2 precio, 50% de descuento, 0.5 de rebaja). Desarrollo: Algoritmos de conversión de fracción a decimal y clasificación de decimales finitos y periódicos. Cierre: Tabla de equivalencias entre fracción, decimal y porcentaje en contextos de compras."
        },
        {
          "id": "mat-7-2-3",
          "topic": "Ubicación de números racionales en la recta numérica y comparación de magnitudes",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Ubica racionales en la recta numérica dividiendo la unidad en partes iguales y establece relaciones de orden entre fracciones y decimales.",
          "suggestedSequence": "Inicio: División geométrica de segmentos unitarios en partes iguales en la pizarra. Desarrollo: Métodos para comparar racionales (productos cruzados, común denominador y forma decimal). Cierre: Ejercicios de ordenación de menor a mayor con racionales positivos y negativos."
        },
        {
          "id": "mat-7-2-4",
          "topic": "Operaciones con números racionales: Adición y sustracción (fracciones homogéneas y heterogéneas)",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Ejecuta adiciones y sustracciones de fracciones homogéneas y heterogéneas y números decimales utilizando el mínimo común múltiplo.",
          "suggestedSequence": "Inicio: Problemas de recetas culinarias y mezclas de ingredientes que requieren sumar fracciones. Desarrollo: Algoritmo formal del MCM para sumar y restar fracciones heterogéneas y regla de signos. Cierre: Resolución de problemas contextualizados de longitudes y pesos con fracciones."
        },
        {
          "id": "mat-7-2-5",
          "topic": "Operaciones con números racionales: Multiplicación y división (fracción recíproca)",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Aplica algoritmos de multiplicación y división de números racionales simplificando resultados antes y después de operar.",
          "suggestedSequence": "Inicio: Interpretación gráfica de la fracción de una fracción (ej. la mitad de un cuarto). Desarrollo: Producto directo numerador por numerador y división multiplicando por la fracción recíproca. Cierre: Taller de cálculo y simplificación de operaciones multiplicativas con racionales."
        },
        {
          "id": "mat-7-2-6",
          "topic": "Potenciación y radicación en números racionales y estrategias de simplificación",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Aplica las propiedades de la potenciación y radicación de fracciones distribuyendo exponentes y raíces en numerador y denominador.",
          "suggestedSequence": "Inicio: Cálculo de áreas de cuadrados con lados fraccionarios. Desarrollo: Propiedades de la potencia de una fracción y radicación distributiva en Q. Cierre: Ejercicios de operaciones combinadas con potencias y raíces de racionales."
        },
        {
          "id": "mat-7-2-7",
          "topic": "Aplicación de números racionales en contextos reales (recetas, mezclas, escalas y tasas de cambio)",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Resuelve problemas complejos de la vida diaria que involucran números racionales modelando situaciones de cambio y proporción.",
          "suggestedSequence": "Inicio: Análisis de planos a escala y conversión de divisas internacionales. Desarrollo: Modelación matemática de situaciones de repartos proporcionales y tasas de consumo. Cierre: Taller en equipos de formulación y resolución de problemas del entorno escolar."
        },
        {
          "id": "mat-7-2-8",
          "topic": "Razones y proporciones: Regla de tres simple (directa e inversa)",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Distingue magnitudes directa e inversamente proporcionales y aplica la regla de tres simple para hallar valores desconocidos.",
          "suggestedSequence": "Inicio: Comparación entre situaciones: más horas trabajadas = más dinero (directa) vs. más obreros = menos tiempo (inversa). Desarrollo: Planteamiento formal de proporciones a/b = c/d y algoritmo de regla de tres directa e inversa. Cierre: Taller de problemas prácticos de velocidad, tiempo, costos y rendimientos."
        },
        {
          "id": "mat-7-2-9",
          "topic": "Cálculo de porcentajes, variaciones porcentuales y modelación de proporcionalidad",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Calcula porcentajes de cantidades, aumentos, descuentos e IVA en contextos de finanzas personales y comercio.",
          "suggestedSequence": "Inicio: Análisis de facturas comerciales identificando subtotal, IVA y descuentos. Desarrollo: Métodos de cálculo de porcentaje como fracción decimal y regla de tres. Cierre: Simulación de compras y ventas con cálculo de variaciones porcentuales."
        }
      ],
      "3°": [
        {
          "id": "mat-3-2-1",
          "topic": "Concepto de multiplicación como adición repetida y arreglos rectangulares",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Modela la multiplicación como sumas de sumandos iguales y mediante cuadrículas o arreglos rectangulares.",
          "suggestedSequence": "Inicio: Agrupación de tapitas y fichas en montones con la misma cantidad de elementos. Desarrollo: Representación en cuadrículas (filas x columnas) y traducción a la expresión matemática a * b. Cierre: Taller gráfico relacionando adiciones reiteradas con multiplicaciones."
        },
        {
          "id": "mat-3-2-2",
          "topic": "Tablas de multiplicar, patrones numéricos y propiedades multiplicativas (conmutativa y distributiva)",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Construye y memoriza comprensivamente las tablas de multiplicar del 1 al 10 identificando regularidades numéricas.",
          "suggestedSequence": "Inicio: Descubrimiento de patrones en la tabla pitagórica (números pares, dobles, simetría). Desarrollo: Demostración de las propiedades conmutativa y distributiva de la multiplicación. Cierre: Juego interactivo de preguntas rápidas con la tabla pitagórica."
        },
        {
          "id": "mat-3-2-3",
          "topic": "Multiplicación por una y dos cifras con situaciones contextualizadas",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Ejecuta multiplicaciones de números de varias cifras por factores de una y dos cifras resolviendo situaciones de compra y producción.",
          "suggestedSequence": "Inicio: Problema sobre calcular cuántos refrescos hay en varias cajas con paquetes iguales. Desarrollo: Algoritmo paso a paso de la multiplicación por una y dos cifras con reagrupación. Cierre: Taller de aplicación con situaciones de compras y medidas."
        },
        {
          "id": "mat-3-2-4",
          "topic": "Concepto de división como repartos y agrupaciones equitativas (términos de la división)",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Comprende el significado de la división como reparto equitativo e identifica dividendo, divisor, cociente y residuo.",
          "suggestedSequence": "Inicio: Reparto equitativo de caramelos entre estudiantes garantizando que a todos les toque igual. Desarrollo: Definición formal de los términos de la división y diferencia entre división exacta e inexacta. Cierre: Taller práctico con material concreto repartiendo colecciones de objetos."
        },
        {
          "id": "mat-3-2-5",
          "topic": "Relación inversa entre multiplicación y división (operaciones recíprocas)",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Reconoce que la división es la operación inversa de la multiplicación y la utiliza para comprobar resultados.",
          "suggestedSequence": "Inicio: Familias de operaciones (ej. 4 * 5 = 20, 20 / 4 = 5, 20 / 5 = 4). Desarrollo: Uso de la prueba de la división (Dividendo = divisor * cociente + residuo). Cierre: Ejercicios de cálculo de términos faltantes en multiplicaciones y divisiones."
        },
        {
          "id": "mat-3-2-6",
          "topic": "Resolución y formulación de problemas multiplicativos y de reparto equitativo",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Formula y soluciona problemas multiplicativos diferenciando cuándo aplicar la multiplicación o la división.",
          "suggestedSequence": "Inicio: Análisis de dos enunciados similares para determinar cuál se multiplica y cuál se divide. Desarrollo: Resolución estructurada de problemas con enunciado, datos, operación y respuesta completa. Cierre: Evaluación formativa mediante creación de problemas por parejas."
        }
      ],
      "2°": [
        {
          "id": "mat-2-2-1",
          "topic": "Noción de multiplicación: Adición repetida de sumandos iguales y arreglos rectangulares",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Comprende la multiplicación como la suma reiterada de cantidades iguales y la representa gráficamente.",
          "suggestedSequence": "Inicio: Agrupación de botones en parejas y tríos: ¿Cuántos hay en 4 grupos de 3? Desarrollo: Traducción de '4 veces 3' a la expresión matemática '4 x 3 = 12'. Cierre: Dibujo de arreglos de puntos y cuadrículas representando multiplicaciones."
        },
        {
          "id": "mat-2-2-2",
          "topic": "Construcción y memorización comprensiva de las tablas del 2, 3, 4 y 5",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Construye las tablas del 2, 3, 4 y 5 mediante saltos en la recta numérica y conteo salteado.",
          "suggestedSequence": "Inicio: Ranas saltarinas en la recta numérica dando saltos de 2, 3, 4 y 5 unidades. Desarrollo: Construcción de las tablas en una tabla pitagórica destacando los resultados. Cierre: Canciones y rimas para afianzar la memoria comprensiva de las tablas."
        },
        {
          "id": "mat-2-2-3",
          "topic": "Propiedad conmutativa de la multiplicación (el orden de los factores no altera el producto)",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Aplica la propiedad conmutativa verificando que expresiones como 3 x 4 y 4 x 3 dan el mismo resultado.",
          "suggestedSequence": "Inicio: Rotación de una bandeja con chocolates (3 filas de 4 vs. 4 filas de 3). Desarrollo: Demostración visual de que el producto es idéntico aunque cambie el orden. Cierre: Taller de completar operaciones aplicando la conmutatividad."
        },
        {
          "id": "mat-2-2-4",
          "topic": "Multiplicación de números de dos y tres cifras por un dígito sin y con reagrupación",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Aplica el algoritmo formal de la multiplicación por una cifra multiplicando primero unidades y luego decenas.",
          "suggestedSequence": "Inicio: Planteamiento de situaciones como comprar 3 cuadernos de $2.300 cada uno. Desarrollo: Algoritmo paso a paso de la multiplicación vertical cuidando el valor posicional. Cierre: Taller de resolución de multiplicaciones con acompañamiento individual."
        },
        {
          "id": "mat-2-2-5",
          "topic": "Situaciones problemáticas cotidianas que involucran agrupaciones, dobles y triples",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Calcula el doble y el triple de una cantidad resolviendo problemas de la vida cotidiana.",
          "suggestedSequence": "Inicio: Juegos con espejos y figuras dobles: si yo tengo 4 fichas, el doble es... Desarrollo: Concepto de doble (x2) y triple (x3) aplicado a problemas de recetas y compras. Cierre: Taller de situaciones problema calculando dobles y triples."
        },
        {
          "id": "mat-2-2-6",
          "topic": "Patrones multiplicativos y juegos numéricos de cálculo ágil",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Descubre patrones multiplicativos y aplica estrategias de cálculo mental en juegos didácticos.",
          "suggestedSequence": "Inicio: Dinámica 'bingo multiplicativo' con las tablas aprendidas. Desarrollo: Reconocimiento de que multiplicar por 10 es agregar un cero al final. Cierre: Evaluación formativa lúdica mediante concurso de cálculo mental por equipos."
        }
      ],
      "1°": [
        {
          "id": "mat-1-2-1",
          "topic": "La decena y números hasta el 50: lectura, escritura y comparación",
          "dba": "DBA: Reconoce y construye números de dos cifras identificando unidades y decenas.",
          "achievement": "Representa cantidades hasta 50 utilizando ábacos y material concreto en problemas de conteo."
        },
        {
          "id": "mat-1-2-2",
          "topic": "Adición sencilla sin reagrupación y cálculo mental",
          "dba": "DBA: Usa el algoritmo de la adición sin reagrupación para resolver problemas cotidianos.",
          "achievement": "Calcula sumas de dos cifras en forma vertical y horizontal resolviendo situaciones aditivas de cambio."
        }
      ],
      "4°": [
        {
          "id": "mat-4-2-1",
          "topic": "División por dos y tres cifras en el divisor y resolución de problemas",
          "dba": "DBA: Aplica el algoritmo de la división para resolver situaciones de reparto y agrupamiento.",
          "achievement": "Divide con exactitud y verifica el cociente y residuo justificando la relación dividendo = divisor x cociente + residuo."
        },
        {
          "id": "mat-4-2-2",
          "topic": "Múltiplos, divisores y criterios de divisibilidad del 2, 3, 5 y 10",
          "dba": "DBA: Identifica regularidades numéricas para hallar múltiplos y divisores.",
          "achievement": "Determina con facilidad los divisores y múltiplos de un número y clasifica números en primos o compuestos."
        }
      ],
      "5°": [
        {
          "id": "mat-5-2-1",
          "topic": "Fracciones: concepto, clases de fracciones (propias, impropias, mixtas) y fracciones equivalentes",
          "dba": "DBA: Interpreta y utiliza las fracciones como parte-todo, cociente y razón en diferentes contextos.",
          "achievement": "Representa y simplifica fracciones hallando equivalencias mediante amplificación y simplificación."
        },
        {
          "id": "mat-5-2-2",
          "topic": "Operaciones con fracciones heterogéneas (suma, resta, multiplicación y división)",
          "dba": "DBA: Resuelve problemas aditivos y multiplicativos con fracciones heterogéneas.",
          "achievement": "Calcula operaciones con fracciones aplicando el MCM en denominadores y simplificando el resultado."
        }
      ],
      "6°": [
        {
          "id": "mat-6-2-1",
          "topic": "Conjunto de los números enteros (Z): números relativos, recta numérica y valor absoluto",
          "dba": "DBA: Comprende la necesidad de los números enteros para representar pérdidas, deudas y temperaturas.",
          "achievement": "Ubica enteros positivos y negativos en la recta numérica y calcula su valor absoluto estableciendo relaciones de orden."
        },
        {
          "id": "mat-6-2-2",
          "topic": "Adición y sustracción de números enteros y resolución de problemas cotidianos",
          "dba": "DBA: Opera con números enteros reconociendo el significado de los signos positivos y negativos.",
          "achievement": "Resuelve sumas y restas de números enteros aplicando la ley de signos con precisión."
        }
      ],
      "8°": [
        {
          "id": "mat-8-2-1",
          "topic": "Multiplicación y división de polinomios algebraicos (ley de signos y leyes de exponentes)",
          "dba": "DBA: Propone, compara y explica procedimientos para multiplicar y dividir expresiones algebraicas.",
          "achievement": "Saber: Aplica las leyes de exponentes en el producto y cociente. Hacer: Multiplica monomios y polinomios con exactitud."
        },
        {
          "id": "mat-8-2-2",
          "topic": "Productos notables: cuadrado de un binomio, producto de la suma por la diferencia (conjugados) y binomios con término común",
          "dba": "DBA: Identifica patrones geométricos y algebraicos para calcular productos notables sin efectuar la multiplicación término a término.",
          "achievement": "Saber: Reconoce la fórmula de los productos notables. Hacer: Desarrolla binomios al cuadrado y conjugados de forma directa."
        },
        {
          "id": "mat-8-2-3",
          "topic": "Factorización: Factor común monomio y factor común por agrupación de términos",
          "dba": "DBA: Comprende la factorización como el proceso inverso de los productos notables para simplificar expresiones.",
          "achievement": "Saber: Identifica el máximo factor común numérico y literal. Hacer: Factoriza polinomios por agrupación de términos."
        },
        {
          "id": "mat-8-2-4",
          "topic": "Geometría: Teorema de Pitágoras y resolución de triángulos rectángulos",
          "dba": "DBA: Aplica el Teorema de Pitágoras para resolver problemas geométricos en dos dimensiones.",
          "achievement": "Saber: Enuncia el Teorema de Pitágoras (a^2 + b^2 = c^2). Hacer: Calcula hipotenusas y catetos en figuras y contextos reales."
        }
      ],
      "9°": [
        {
          "id": "mat-9-2-1",
          "topic": "Sistemas de ecuaciones lineales 2x2: Métodos de sustitución, igualación y reducción",
          "dba": "DBA: Resuelve sistemas de dos ecuaciones lineales con dos incógnitas utilizando métodos analíticos.",
          "achievement": "Saber: Explica los métodos de resolución de sistemas 2x2. Hacer: Determina el punto de intersección y solución única."
        },
        {
          "id": "mat-9-2-2",
          "topic": "Resolución de problemas del entorno modelados con sistemas de ecuaciones 2x2",
          "dba": "DBA: Modela situaciones cotidianas de costo, mezcla y movimiento mediante sistemas de ecuaciones.",
          "achievement": "Saber: Traduce el lenguaje natural al lenguaje algebraico. Hacer: Resuelve e interpreta las soluciones del sistema."
        }
      ],
      "10°": [
        {
          "id": "mat-10-2-1",
          "topic": "Funciones trigonométricas (seno, coseno, tangente): gráficas, amplitud, periodo y desfase",
          "dba": "DBA: Modela fenómenos periódicos utilizando las funciones trigonométricas y analiza sus características gráficas.",
          "achievement": "Saber: Identifica periodo y amplitud. Hacer: Traza la gráfica de las funciones seno y coseno reconociendo asíntotas y ceros."
        },
        {
          "id": "mat-10-2-2",
          "topic": "Identidades trigonométricas fundamentales (pitagóricas, cociente y recíprocas)",
          "dba": "DBA: Demuestra identidades trigonométricas mediante la aplicación de propiedades algebraicas.",
          "achievement": "Saber: Reconoce identidades básicas como sen^2(x)+cos^2(x)=1. Hacer: Simplifica y demuestra identidades trigonométricas."
        }
      ],
      "11°": [
        {
          "id": "mat-11-2-1",
          "topic": "Límites de funciones: concepto intuitivo de límite, límites laterales y cálculo algebraico",
          "dba": "DBA: Interpreta el concepto de límite para describir el comportamiento de una función cerca de un punto.",
          "achievement": "Saber: Explica la noción de aproximación de una función. Hacer: Calcula límites sustituyendo valores y evaluando límites laterales."
        },
        {
          "id": "mat-11-2-2",
          "topic": "Indeterminaciones algebraicas del tipo 0/0 y límites al infinito",
          "dba": "DBA: Aplica factorización y racionalización para eliminar indeterminaciones en el cálculo de límites.",
          "achievement": "Saber: Reconoce límites indeterminados. Hacer: Factoriza o racionaliza expresiones para calcular el valor exacto del límite."
        }
      ]
    },
    "Lógica": {
      "6°": [
        {
          "id": "log-6-2-1",
          "topic": "Patrones numéricos, secuencias lógicas y regularidades en el entorno",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Identifica, formula y generaliza patrones y regularidades numéricas y geométricas para predecir términos futuros en secuencias lógicas.",
          "suggestedSequence": "Inicio: Observación de series visuales incompletas para descubrir la regla de formación. Desarrollo: Representación verbal y matemática de secuencias crecientes y decrecientes. Cierre: Creación y resolución de desafíos de secuencias lógicas en parejas."
        },
        {
          "id": "log-6-2-2",
          "topic": "Introducción al pensamiento variacional: Constantes, variables y traducción de enunciados a expresiones algebraicas",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Traduce enunciados del lenguaje natural al lenguaje algebraico básico reconociendo el papel de las variables e incógnitas.",
          "suggestedSequence": "Inicio: Adivinanzas de números ('Pienso un número, le sumo 8 y obtengo 20...'). Desarrollo: Asignación de literales a cantidades desconocidas y escritura de expresiones algebraicas. Cierre: Guía de traducción bidireccional entre lenguaje cotidiano y simbólico."
        },
        {
          "id": "log-6-2-3",
          "topic": "Ecuaciones lineales básicas con enteros y racionales: Modelo de balanza y operaciones inversas",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Plantea y resuelve ecuaciones lineales de primer grado sencillas aplicando propiedades de igualdad y operaciones inversas.",
          "suggestedSequence": "Inicio: Uso del modelo visual de una balanza en equilibrio para comprender la igualdad. Desarrollo: Procedimiento de transposición de términos y despeje ordenado de incógnitas. Cierre: Resolución de problemas cotidianos modelados con ecuaciones de primer grado."
        },
        {
          "id": "log-6-2-4",
          "topic": "Estrategias de verificación, análisis de coherencia y justificación de respuestas",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Verifica la plausibilidad y coherencia de las soluciones obtenidas sustituyendo valores en la expresión original.",
          "suggestedSequence": "Inicio: Análisis de casos con respuestas numéricas absurdas para fomentar el sentido crítico. Desarrollo: Verificación formal sustituyendo la incógnita hallada en la ecuación original. Cierre: Taller de autoevaluación con lista de chequeo de rigor procedimental."
        }
      ]
    },
    "Sistemas": {
      "1°": [
        {
          "id": "sis-1-2-1",
          "topic": "El computador como herramienta de trabajo, aprendizaje y juego",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce el computador como un artefacto electrónico que procesa información y apoya el aprendizaje escolar.",
          "suggestedSequence": "Inicio: Visita guiada a la sala de sistemas observando los computadores encendidos. Desarrollo: Explicación de los usos del computador en escuelas, hospitales, bancos y hogares. Cierre: Identificación oral de las actividades que les gustaría realizar en el computador."
        },
        {
          "id": "sis-1-2-2",
          "topic": "Procedimiento seguro de encendido y apagado del computador",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Sigue los pasos secuenciales correctos para encender y apagar el computador sin dañar los componentes.",
          "suggestedSequence": "Inicio: Explicación de por qué no se debe desconectar directamente el cable de energía. Desarrollo: Práctica guiada presionando el botón Power y usando la opción Inicio -> Apagar en Windows. Cierre: Lista de chequeo donde cada niño demuestra que sabe encender y apagar su equipo."
        },
        {
          "id": "sis-1-2-3",
          "topic": "Partes principales del computador: Monitor (pantalla), teclado, mouse (ratón) y CPU",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Identifica y nombra las partes físicas fundamentales del computador describiendo la función de cada una.",
          "suggestedSequence": "Inicio: Canción infantil sobre las partes del computador y señalización en el equipo real. Desarrollo: Asociación: el monitor muestra imágenes, el teclado escribe, el mouse señala y la CPU piensa. Cierre: Coloreado y rotulación de una ficha gráfica con las partes del computador."
        },
        {
          "id": "sis-1-2-4",
          "topic": "Manejo del mouse: Clic, doble clic, arrastre y coordinación visomotriz",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Desarrolla destreza en el agarre del mouse ejecutando clics, doble clic y arrastre en actividades interactivas.",
          "suggestedSequence": "Inicio: Postura ergonómica de la mano sobre el mouse y explicación de los botones izquierdo y derecho. Desarrollo: Juegos interactivos de puntería, reventar burbujas y arrastrar piezas de rompecabezas. Cierre: Observación formativa del dominio motriz fino al interactuar con el puntero."
        },
        {
          "id": "sis-1-2-5",
          "topic": "Normas de convivencia y cuidado en la sala de sistemas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Cumple las normas de aseo, orden, silencio y no ingreso de alimentos a la sala de cómputo.",
          "suggestedSequence": "Inicio: Dramatización sobre qué ocurre si se derrama líquido sobre un teclado. Desarrollo: Socialización de las reglas de oro de la sala de sistemas (manos limpias, orden, respeto). Cierre: Elaboración de carteles ilustrados con las normas para decorar la sala."
        }
      ],
      "2°": [
        {
          "id": "sis-2-2-1",
          "topic": "Estructura y bloques del teclado: Teclas alfanuméricas, numéricas, de función y control",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Identifica las zonas del teclado (alfanumérica, numérica, de navegación y control) y su función específica.",
          "suggestedSequence": "Inicio: Observación de un teclado gigante en pantalla reconociendo los diferentes colores por bloques. Desarrollo: Uso de teclas especiales: Bloq Mayús, Retroceso (borrar), Supr, flechas de dirección y Shift. Cierre: Práctica guiada escribiendo oraciones combinando mayúsculas, minúsculas y números."
        },
        {
          "id": "sis-2-2-2",
          "topic": "Posición correcta de las manos y ergonomía frente al computador",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Adopta una postura corporal adecuada frente al computador y ubica las manos correctamente sobre el teclado.",
          "suggestedSequence": "Inicio: Dinámica de pausas activas y estiramiento de muñecas y espalda. Desarrollo: Explicación de la postura correcta: espalda recta, pies apoyados y vista al nivel de la pantalla. Cierre: Práctica de digitación usando ambas manos sin encorvar la espalda."
        },
        {
          "id": "sis-2-2-3",
          "topic": "Concepto de archivo y carpeta en el explorador de Windows",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Comprende la diferencia entre un archivo (documento, foto) y una carpeta como contenedor de información.",
          "suggestedSequence": "Inicio: Metáfora de la mochila escolar: los cuadernos son archivos y los bolsillos son carpetas. Desarrollo: Navegación por el explorador de Windows reconociendo íconos de documentos y carpetas amarillas. Cierre: Creación de una carpeta personal con su nombre en la ubicación indicada."
        }
      ],
      "3°": [
        {
          "id": "sis-3-2-1",
          "topic": "Procesamiento de textos en Word: Interlineado, márgenes, sangrías y viñetas",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Organiza documentos de texto aplicando interlineado adecuado, listas numeradas y viñetas temáticas.",
          "suggestedSequence": "Inicio: Observación de un texto desordenado vs. un texto con listas claras y buen espaciado. Desarrollo: Práctica guiada configurando márgenes normales, interlineado de 1.5 y viñetas personalizadas. Cierre: Creación de un recetario escolar o lista de normas aplicando listas con viñetas."
        },
        {
          "id": "sis-3-2-2",
          "topic": "Creación y formato de tablas para organizar información escolar",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Inserta y personaliza tablas con filas y columnas aplicando bordes y sombreados de color.",
          "suggestedSequence": "Inicio: Necesidad de organizar el horario semanal de clases de forma clara y visual. Desarrollo: Uso del menú Insertar -> Tabla, ajuste del ancho de columnas y aplicación de estilos de tabla. Cierre: Elaboración del horario escolar personal con colores para cada asignatura."
        },
        {
          "id": "sis-3-2-3",
          "topic": "Introducción a presentaciones multimedia en PowerPoint: Diapositivas, títulos y diseño",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Crea presentaciones digitales sencillas con diapositivas estructuradas combinando títulos, texto e imágenes.",
          "suggestedSequence": "Inicio: ¿Qué es una presentación y para qué se usa en conferencias y clases? Desarrollo: Creación de diapositiva de título y diapositivas de contenido aplicando temas y plantillas de diseño. Cierre: Exposición grupal de una presentación de 3 diapositivas sobre su animal preferido."
        }
      ],
      "4°": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "5°": [
        {
          "id": "sis-5-2-1",
          "topic": "Introducción a Excel: Filas, columnas, celdas y tipos de datos (texto, número, fecha)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Reconoce la estructura de la hoja de cálculo y manipula datos alfanuméricos en celdas organizadas.",
          "suggestedSequence": "Inicio: Presentación de una cuadrícula gigante: concepto de coordenada (columna letra, fila número). Desarrollo: Ingreso y formateo de datos: moneda, porcentaje, fecha corta y texto; autoajuste de columnas. Cierre: Creación de una lista de compras con descripción, cantidad y valor unitario."
        },
        {
          "id": "sis-5-2-2",
          "topic": "Operaciones aritméticas básicas en celdas (+, -, *, /) y estructura de fórmulas",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Construye fórmulas matemáticas directas utilizando el signo igual (=) y operadores aritméticos elementales.",
          "suggestedSequence": "Inicio: El signo '=' como activador de cálculo en la hoja de cálculo. Desarrollo: Fórmulas de multiplicación (precio * cantidad) y cálculo de totales y vueltas. Cierre: Taller de cálculo automatizado de una factura comercial escolar."
        },
        {
          "id": "sis-5-2-3",
          "topic": "Funciones estadísticas elementales: SUMA, PROMEDIO, MAX y MIN, y gráficos",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Aplica funciones automáticas para analizar conjuntos de datos numéricos y genera gráficos estadísticos vinculados.",
          "suggestedSequence": "Inicio: Calcular el promedio de notas de 10 estudiantes manualmente vs. con la función PROMEDIO. Desarrollo: Uso del asistente de funciones para SUMA, PROMEDIO, MAX y MIN, e inserción de gráficos de columnas. Cierre: Informe analítico interpretando las notas más altas, más bajas y el promedio grupal."
        }
      ],
      "6°": [
        {
          "id": "sis-6-2-1",
          "topic": "Hojas de cálculo avanzadas: Fórmulas con referencias relativas, absolutas ($A$1) y mixtas",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Utiliza referencias absolutas y relativas en Excel para automatizar cálculos repetitivos sin errores de arrastre.",
          "suggestedSequence": "Inicio: Demostración de qué pasa al arrastrar una fórmula si no se fija la celda del IVA o tasa de cambio. Desarrollo: Uso del símbolo '$' para bloquear filas y columnas ($B$1) y aplicación en tablas de conversión monetaria. Cierre: Taller de cálculo de precios con descuentos fijos utilizando referencias absolutas."
        },
        {
          "id": "sis-6-2-2",
          "topic": "Funciones lógicas: Función SI sencilla y anidada para evaluación de criterios",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Aplica la función condicional SI para emitir resultados automáticos según se cumplan condiciones numéricas o de texto.",
          "suggestedSequence": "Inicio: Lógica escolar: Si nota >= 3.0 entonces 'Aprobó', sino 'Reprobó'. Desarrollo: Estructura de la función =SI(prueba_lógica; valor_si_verdadero; valor_si_falso) y anidamientos. Cierre: Elaboración de un boletín de calificaciones automatizado con mensajes de aprobación y nivelación."
        },
        {
          "id": "sis-6-2-3",
          "topic": "Funciones de conteo condicional: CONTAR.SI y SUMAR.SI en presupuestos escolares",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Procesa bases de datos escolares aplicando filtros automáticos y funciones condicionales de resumen.",
          "suggestedSequence": "Inicio: Contar cuántos estudiantes sacaron más de 4.0 en una lista de 50 alumnos sin hacerlo a mano. Desarrollo: Sintaxis y aplicación de CONTAR.SI(rango; criterio) y SUMAR.SI(rango; criterio; rango_suma). Cierre: Modelo de presupuesto para un evento escolar con subtotales por categoría de gasto."
        }
      ],
      "7°": [
        {
          "id": "sis-7-2-1",
          "topic": "Programación estructurada en Scratch: Variables dinámicas, acumuladores y listas",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica estructuras de datos (listas y variables dinámicas) para almacenar y gestionar información en algoritmos complejos.",
          "suggestedSequence": "Inicio: Cómo almacenar múltiples puntuaciones o nombres de inventario en un programa sin crear decenas de variables. Desarrollo: Creación y manipulación de listas en Scratch: inserción, búsqueda de elementos y recorrido con bucles. Cierre: Programación de un sistema de registro de usuarios y puntuaciones máximas."
        },
        {
          "id": "sis-7-2-2",
          "topic": "Condicionales múltiples y anidados en algoritmos interactivos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Estructura árboles de decisión mediante condicionales anidados (si... si no...) evaluando múltiples escenarios.",
          "suggestedSequence": "Inicio: Ejercicio de diagramación de decisiones complejas en un mapa de flujo. Desarrollo: Programación de condicionales anidados en Scratch para responder a diferentes niveles de dificultad en un juego. Cierre: Prueba y depuración de la lógica de toma de decisiones en diferentes casos extremos."
        },
        {
          "id": "sis-7-2-3",
          "topic": "Modularidad y funciones: Creación de bloques personalizados reutilizables",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Diseña bloques personalizados (funciones con parámetros) para simplificar el código y promover la reutilización.",
          "suggestedSequence": "Inicio: Principio DRY (Don't Repeat Yourself): por qué no debemos duplicar el mismo bloque de código. Desarrollo: Creación de bloques propios en Scratch con entradas numéricas (ej. dibujar_poligono(lados, longitud)). Cierre: Taller de refactorización de código largo reemplazándolo por funciones modulares."
        },
        {
          "id": "sis-7-2-4",
          "topic": "Física en videojuegos: Simulación de gravedad, saltos, velocidad y rozamiento",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Modela principios físicos elementales (gravedad, fricción y rebote) en videojuegos de plataformas.",
          "suggestedSequence": "Inicio: ¿Cómo sabe Mario Bros cuándo caer y con qué velocidad aterriza en el suelo? Desarrollo: Algoritmo de velocidad en Y, aceleración de gravedad (-1) y detección del suelo para simular saltos realistas. Cierre: Proyecto de videojuego de plataformas funcional con física de salto y obstáculos."
        }
      ],
      "8°": [
        {
          "id": "sis-8-2-1",
          "topic": "Fundamentos del desarrollo web: Arquitectura cliente-servidor y estructura básica de HTML5",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende el modelo web cliente-servidor y escribe la estructura semántica fundamental de una página en HTML5.",
          "suggestedSequence": "Inicio: Inspeccionar el código fuente de una página web en el navegador: 'detrás de la pantalla'. Desarrollo: Etiquetas estructurales obligatorias: <!DOCTYPE html>, <html>, <head>, <title>, <body>, encabezados y párrafos. Cierre: Creación de la primera página web personal 'index.html' visualizada en el navegador local."
        },
        {
          "id": "sis-8-2-2",
          "topic": "Maquetación y estilo con CSS3: Selectores, colores, tipografías y el modelo de caja",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Aplica hojas de estilo en cascada (CSS) para dar diseño visual, armonía y estructura espacial a la página web.",
          "suggestedSequence": "Inicio: Comparación entre un HTML sin estilos vs. un sitio maquetado con CSS3 profesional. Desarrollo: Selectores de etiqueta, clase e ID; propiedades de color, fuentes, márgenes (margin), relleno (padding) y bordes. Cierre: Vinculación del archivo 'styles.css' a la página web mejorando su estética visual."
        },
        {
          "id": "sis-8-2-3",
          "topic": "Enlaces, imágenes, tablas y diseño web responsivo (Responsive Design)",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Integra elementos multimedia, navegación entre páginas e implementa diseño adaptable a pantallas móviles.",
          "suggestedSequence": "Inicio: Demostración de cómo se deforma un sitio no adaptable cuando se abre en un celular. Desarrollo: Uso de enlaces (<a href>), imágenes (<img src>), contenedores flexibles (Flexbox) y reglas @media. Cierre: Publicación del sitio web escolar completo en una plataforma gratuita (GitHub Pages)."
        }
      ]
    },
    "Robótica": {
      "9°": [
        {
          "id": "rob-9-2-1",
          "topic": "Sensores para robótica móvil: Sensores infrarrojos reflectivos (CNY70 / TCRT5000) y acondicionamiento",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Calibra sensores ópticos infrarrojos para distinguir superficies blancas y negras en pistas de prueba.",
          "suggestedSequence": "Inicio: Principio de absorción y reflexión de la luz infrarroja según el color de la superficie. Desarrollo: Conexión de sensores de línea con amplificadores operacionales en modo comparador (LM393) y ajuste de potenciómetro. Cierre: Prueba de lectura digital en el monitor serie verificando cambios de 0 a 1 al pasar sobre cinta negra."
        },
        {
          "id": "rob-9-2-2",
          "topic": "Control de potencia de motores DC: Drivers de potencia puente H (L298N / TB6612FNG) y modulación PWM",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Controla el sentido de giro y la velocidad de motores de corriente continua mediante señales de modulación PWM.",
          "suggestedSequence": "Inicio: ¿Por qué no se puede conectar un motor directamente al microcontrolador? Límite de corriente de pines. Desarrollo: Diagrama de funcionamiento del puente H con transistores MOSFET y modulación de ancho de pulso (0 a 255 en Arduino). Cierre: Montaje y prueba de aceleración progresiva y giros controlados de un robot móvil."
        },
        {
          "id": "rob-9-2-3",
          "topic": "Algoritmos de navegación reactiva: Robot seguidor de línea recta y curvas suaves",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Programa la lógica de seguimiento de línea mediante algoritmos condicionales reactivos de corrección de trayectoria.",
          "suggestedSequence": "Inicio: Análisis lógico de casos: si sensor izquierdo negro gira izquierda; si derecho negro gira derecha; si ambos blancos avanza. Desarrollo: Programación del bucle principal de control en C++ / bloques y ajuste de velocidades de giro. Cierre: Pruebas en pista cerrada de 2 metros cronometrando el tiempo de vuelta sin salirse."
        },
        {
          "id": "rob-9-2-4",
          "topic": "Sensor ultrasónico y evasión inteligente de obstáculos con mapeo angular",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Integra sensores de distancia ultrasónicos para detener o redirigir el robot ante la presencia de obstáculos imprevistos.",
          "suggestedSequence": "Inicio: Montaje del sensor ultrasónico HC-SR04 sobre un miniservo para escanear a la izquierda y derecha. Desarrollo: Algoritmo de decisión: ante un obstáculo a menos de 20 cm, detenerse, escanear ambos lados y girar hacia el lado más despejado. Cierre: Recorrido autónomo en un laberinto sencillo esquivando cajas y paredes."
        }
      ],
      "10°": [
        {
          "id": "rob-10-2-1",
          "topic": "Interfaces de control analógico: Lectura multieje de Joysticks analógicos y potenciómetros",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Lee y escala señales analógicas de 10 bits de potenciómetros para controlar la posición angular de articulaciones robóticas.",
          "suggestedSequence": "Inicio: Principio del divisor de voltaje dentro de los joysticks analógicos y rango del conversor ADC (0 a 1023). Desarrollo: Función map() en programación para convertir lecturas de 0-1023 a ángulos de servomotor de 0 a 180 grados. Cierre: Control directo en tiempo real de dos articulaciones mediante el movimiento de un joystick."
        },
        {
          "id": "rob-10-2-2",
          "topic": "Filtrado de ruido analógico y definición de zona muerta (deadband) en el software de control",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Aplica filtros de software (promedio móvil) y zonas muertas para eliminar temblores indeseados en los actuadores.",
          "suggestedSequence": "Inicio: ¿Por qué los servos vibran cuando el joystick está en el centro? Detección de fluctuaciones eléctricas en el monitor serie. Desarrollo: Implementación de una zona muerta central (deadband) y filtro de promedio de 5 lecturas consecutivas. Cierre: Comprobación de la total estabilidad del brazo robótico en reposo sin vibraciones ni zumbidos."
        },
        {
          "id": "rob-10-2-3",
          "topic": "Memorización de coordenadas y programación de rutinas de autoaprendizaje (Teach & Repeat)",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Desarrolla algoritmos de aprendizaje por demostración donde el operario graba posiciones que el robot repite automáticamente.",
          "suggestedSequence": "Inicio: Metodología industrial de 'Teach Pendant': enseñar la trayectoria moviendo el robot manualmente y grabando puntos. Desarrollo: Almacenamiento de arreglos de coordenadas angulares en la memoria EEPROM / Flash del microcontrolador. Cierre: Demostración de reproducción automática y en bucle de la trayectoria previamente grabada por el usuario."
        },
        {
          "id": "rob-10-2-4",
          "topic": "Servidor web embebido en ESP32 para teleoperación inalámbrica mediante WebSockets",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Configura un microcontrolador ESP32 como punto de acceso Wi-Fi y aloja una página web para teledirigir el robot.",
          "suggestedSequence": "Inicio: Control de robots sin necesidad de instalar aplicaciones móviles: el navegador web como interfaz universal. Desarrollo: Programación del servidor web asíncrono en ESP32 con controles HTML/JavaScript comunicados por WebSockets. Cierre: Control remoto del brazo robótico desde cualquier teléfono o computador conectado a la red Wi-Fi del robot."
        }
      ],
      "11°": [
        {
          "id": "rob-11-2-1",
          "topic": "Teoría de sistemas de control en lazo cerrado: Planta, sensor, comparador y señal de error",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Modela sistemas dinámicos identificando la función de transferencia intuitiva y la retroalimentación en tiempo real.",
          "suggestedSequence": "Inicio: Diferencia fundamental entre lazo abierto (tostadora sin sensor) vs. lazo cerrado (control de crucero de un auto). Desarrollo: Diagrama de bloques de control: setpoint (consigna), error (e = setpoint - variable), controlador y planta. Cierre: Simulación matemática de la respuesta temporal de un sistema de primer y segundo orden."
        },
        {
          "id": "rob-11-2-2",
          "topic": "Algoritmo de control Proporcional, Integral y Derivativo (PID): Fundamentos matemáticos",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Comprende la función matemática del término proporcional (Kp), integral (Ki) y derivativo (Kd) en la estabilidad del sistema.",
          "suggestedSequence": "Inicio: Análisis visual: el término P corrige el presente, el I elimina el error acumulado del pasado, y el D frena anticipando el futuro. Desarrollo: Ecuación matemática del control PID continuo y su discretización para programación en microcontroladores. Cierre: Taller de cálculo manual de la salida del controlador ante diferentes curvas de error."
        },
        {
          "id": "rob-11-2-3",
          "topic": "Programación de bajo nivel en C++ con interrupciones por hardware (Timers e Interrupts externas)",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Programa rutinas de interrupción periódica para garantizar un tiempo de muestreo (Ts) estrictamente constante en el control PID.",
          "suggestedSequence": "Inicio: ¿Por qué la función delay() destruye el control en tiempo real? Introducción a las interrupciones por hardware. Desarrollo: Configuración de registros de timers internos para disparar la rutina de control exactamente cada 1 milisegundo. Cierre: Medición con osciloscopio de la periodicidad y tiempo de ejecución del algoritmo de control."
        },
        {
          "id": "rob-11-2-4",
          "topic": "Robots velocistas seguidores de línea de alta velocidad: Sintonización empírica de ganancias PID",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Sintoniza las constantes Kp, Ki y Kd en un robot seguidor de línea de alta velocidad logrando estabilidad a más de 2 m/s.",
          "suggestedSequence": "Inicio: Método de Ziegler-Nichols y sintonización manual: subir Kp hasta oscilar, agregar Kd para amortiguar y ajustar Ki. Desarrollo: Pruebas dinámicas en pista de alta velocidad registrando tiempos y telemetría de error. Cierre: Competencia de robots velocistas premiando la menor oscilación y mayor velocidad en curvas complejas."
        }
      ]
    },
    "Dirección de grupo": {
      "7°": [
        {
          "id": "dir-7-2-1",
          "topic": "Inteligencia emocional: Reconocimiento y autorregulación de emociones en situaciones de conflicto",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Identifica sus estados emocionales (ira, tristeza, ansiedad) y aplica técnicas de respiración y pausa para autorregularse.",
          "suggestedSequence": "Inicio: El semáforo de las emociones: parar (rojo), pensar (amarillo) y actuar con calma (verde). Desarrollo: Taller vivencial identificando situaciones que detonan el enojo y buscando alternativas pacíficas. Cierre: Diario reflexivo de emociones con registro semanal de logros en autorregulación."
        },
        {
          "id": "dir-7-2-2",
          "topic": "Prevención del maltrato entre pares, acoso escolar (bullying) y cultura del buen trato",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Reconoce conductas de intimidación o exclusión y actúa con solidaridad protegiendo a sus compañeros y buscando mediación.",
          "suggestedSequence": "Inicio: Cineforo con un cortometraje sobre el rol de los espectadores en situaciones de acoso. Desarrollo: Identificación de la diferencia entre broma y maltrato continuado, y rutas de apoyo escolar. Cierre: Campaña 'Cero Bullying en 7°' elaborando afiches y cartas de apoyo entre pares."
        },
        {
          "id": "dir-7-2-3",
          "topic": "Comunicación asertiva y resolución dialogada de desacuerdos cotidianos",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Expresa sus puntos de vista con claridad y firmeza sin recurrir a la agresión ni a la sumisión.",
          "suggestedSequence": "Inicio: Dramatización de tres estilos de comunicación: pasivo, agresivo y asertivo ante un reclamo. Desarrollo: Práctica de la técnica del mensaje en primera persona ('Yo me siento... cuando tú... porque...'). Cierre: Mesa redonda de mediación de conflictos reales del aula aplicando la escucha activa."
        }
      ]
    },
    "Tecnología e Informática": {
      "1°": [
        {
          "id": "sis-1-2-1",
          "topic": "El computador como herramienta de trabajo, aprendizaje y juego",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce el computador como un artefacto electrónico que procesa información y apoya el aprendizaje escolar.",
          "suggestedSequence": "Inicio: Visita guiada a la sala de sistemas observando los computadores encendidos. Desarrollo: Explicación de los usos del computador en escuelas, hospitales, bancos y hogares. Cierre: Identificación oral de las actividades que les gustaría realizar en el computador."
        },
        {
          "id": "sis-1-2-2",
          "topic": "Procedimiento seguro de encendido y apagado del computador",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Sigue los pasos secuenciales correctos para encender y apagar el computador sin dañar los componentes.",
          "suggestedSequence": "Inicio: Explicación de por qué no se debe desconectar directamente el cable de energía. Desarrollo: Práctica guiada presionando el botón Power y usando la opción Inicio -> Apagar en Windows. Cierre: Lista de chequeo donde cada niño demuestra que sabe encender y apagar su equipo."
        },
        {
          "id": "sis-1-2-3",
          "topic": "Partes principales del computador: Monitor (pantalla), teclado, mouse (ratón) y CPU",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Identifica y nombra las partes físicas fundamentales del computador describiendo la función de cada una.",
          "suggestedSequence": "Inicio: Canción infantil sobre las partes del computador y señalización en el equipo real. Desarrollo: Asociación: el monitor muestra imágenes, el teclado escribe, el mouse señala y la CPU piensa. Cierre: Coloreado y rotulación de una ficha gráfica con las partes del computador."
        },
        {
          "id": "sis-1-2-4",
          "topic": "Manejo del mouse: Clic, doble clic, arrastre y coordinación visomotriz",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Desarrolla destreza en el agarre del mouse ejecutando clics, doble clic y arrastre en actividades interactivas.",
          "suggestedSequence": "Inicio: Postura ergonómica de la mano sobre el mouse y explicación de los botones izquierdo y derecho. Desarrollo: Juegos interactivos de puntería, reventar burbujas y arrastrar piezas de rompecabezas. Cierre: Observación formativa del dominio motriz fino al interactuar con el puntero."
        },
        {
          "id": "sis-1-2-5",
          "topic": "Normas de convivencia y cuidado en la sala de sistemas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Cumple las normas de aseo, orden, silencio y no ingreso de alimentos a la sala de cómputo.",
          "suggestedSequence": "Inicio: Dramatización sobre qué ocurre si se derrama líquido sobre un teclado. Desarrollo: Socialización de las reglas de oro de la sala de sistemas (manos limpias, orden, respeto). Cierre: Elaboración de carteles ilustrados con las normas para decorar la sala."
        }
      ],
      "2°": [
        {
          "id": "sis-2-2-1",
          "topic": "Estructura y bloques del teclado: Teclas alfanuméricas, numéricas, de función y control",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Identifica las zonas del teclado (alfanumérica, numérica, de navegación y control) y su función específica.",
          "suggestedSequence": "Inicio: Observación de un teclado gigante en pantalla reconociendo los diferentes colores por bloques. Desarrollo: Uso de teclas especiales: Bloq Mayús, Retroceso (borrar), Supr, flechas de dirección y Shift. Cierre: Práctica guiada escribiendo oraciones combinando mayúsculas, minúsculas y números."
        },
        {
          "id": "sis-2-2-2",
          "topic": "Posición correcta de las manos y ergonomía frente al computador",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Adopta una postura corporal adecuada frente al computador y ubica las manos correctamente sobre el teclado.",
          "suggestedSequence": "Inicio: Dinámica de pausas activas y estiramiento de muñecas y espalda. Desarrollo: Explicación de la postura correcta: espalda recta, pies apoyados y vista al nivel de la pantalla. Cierre: Práctica de digitación usando ambas manos sin encorvar la espalda."
        },
        {
          "id": "sis-2-2-3",
          "topic": "Concepto de archivo y carpeta en el explorador de Windows",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Comprende la diferencia entre un archivo (documento, foto) y una carpeta como contenedor de información.",
          "suggestedSequence": "Inicio: Metáfora de la mochila escolar: los cuadernos son archivos y los bolsillos son carpetas. Desarrollo: Navegación por el explorador de Windows reconociendo íconos de documentos y carpetas amarillas. Cierre: Creación de una carpeta personal con su nombre en la ubicación indicada."
        }
      ],
      "3°": [
        {
          "id": "sis-3-2-1",
          "topic": "Procesamiento de textos en Word: Interlineado, márgenes, sangrías y viñetas",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Organiza documentos de texto aplicando interlineado adecuado, listas numeradas y viñetas temáticas.",
          "suggestedSequence": "Inicio: Observación de un texto desordenado vs. un texto con listas claras y buen espaciado. Desarrollo: Práctica guiada configurando márgenes normales, interlineado de 1.5 y viñetas personalizadas. Cierre: Creación de un recetario escolar o lista de normas aplicando listas con viñetas."
        },
        {
          "id": "sis-3-2-2",
          "topic": "Creación y formato de tablas para organizar información escolar",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Inserta y personaliza tablas con filas y columnas aplicando bordes y sombreados de color.",
          "suggestedSequence": "Inicio: Necesidad de organizar el horario semanal de clases de forma clara y visual. Desarrollo: Uso del menú Insertar -> Tabla, ajuste del ancho de columnas y aplicación de estilos de tabla. Cierre: Elaboración del horario escolar personal con colores para cada asignatura."
        },
        {
          "id": "sis-3-2-3",
          "topic": "Introducción a presentaciones multimedia en PowerPoint: Diapositivas, títulos y diseño",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Crea presentaciones digitales sencillas con diapositivas estructuradas combinando títulos, texto e imágenes.",
          "suggestedSequence": "Inicio: ¿Qué es una presentación y para qué se usa en conferencias y clases? Desarrollo: Creación de diapositiva de título y diapositivas de contenido aplicando temas y plantillas de diseño. Cierre: Exposición grupal de una presentación de 3 diapositivas sobre su animal preferido."
        }
      ],
      "4°": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "5°": [
        {
          "id": "sis-5-2-1",
          "topic": "Introducción a Excel: Filas, columnas, celdas y tipos de datos (texto, número, fecha)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Reconoce la estructura de la hoja de cálculo y manipula datos alfanuméricos en celdas organizadas.",
          "suggestedSequence": "Inicio: Presentación de una cuadrícula gigante: concepto de coordenada (columna letra, fila número). Desarrollo: Ingreso y formateo de datos: moneda, porcentaje, fecha corta y texto; autoajuste de columnas. Cierre: Creación de una lista de compras con descripción, cantidad y valor unitario."
        },
        {
          "id": "sis-5-2-2",
          "topic": "Operaciones aritméticas básicas en celdas (+, -, *, /) y estructura de fórmulas",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Construye fórmulas matemáticas directas utilizando el signo igual (=) y operadores aritméticos elementales.",
          "suggestedSequence": "Inicio: El signo '=' como activador de cálculo en la hoja de cálculo. Desarrollo: Fórmulas de multiplicación (precio * cantidad) y cálculo de totales y vueltas. Cierre: Taller de cálculo automatizado de una factura comercial escolar."
        },
        {
          "id": "sis-5-2-3",
          "topic": "Funciones estadísticas elementales: SUMA, PROMEDIO, MAX y MIN, y gráficos",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Aplica funciones automáticas para analizar conjuntos de datos numéricos y genera gráficos estadísticos vinculados.",
          "suggestedSequence": "Inicio: Calcular el promedio de notas de 10 estudiantes manualmente vs. con la función PROMEDIO. Desarrollo: Uso del asistente de funciones para SUMA, PROMEDIO, MAX y MIN, e inserción de gráficos de columnas. Cierre: Informe analítico interpretando las notas más altas, más bajas y el promedio grupal."
        }
      ],
      "6°": [
        {
          "id": "sis-6-2-1",
          "topic": "Hojas de cálculo avanzadas: Fórmulas con referencias relativas, absolutas ($A$1) y mixtas",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Utiliza referencias absolutas y relativas en Excel para automatizar cálculos repetitivos sin errores de arrastre.",
          "suggestedSequence": "Inicio: Demostración de qué pasa al arrastrar una fórmula si no se fija la celda del IVA o tasa de cambio. Desarrollo: Uso del símbolo '$' para bloquear filas y columnas ($B$1) y aplicación en tablas de conversión monetaria. Cierre: Taller de cálculo de precios con descuentos fijos utilizando referencias absolutas."
        },
        {
          "id": "sis-6-2-2",
          "topic": "Funciones lógicas: Función SI sencilla y anidada para evaluación de criterios",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Aplica la función condicional SI para emitir resultados automáticos según se cumplan condiciones numéricas o de texto.",
          "suggestedSequence": "Inicio: Lógica escolar: Si nota >= 3.0 entonces 'Aprobó', sino 'Reprobó'. Desarrollo: Estructura de la función =SI(prueba_lógica; valor_si_verdadero; valor_si_falso) y anidamientos. Cierre: Elaboración de un boletín de calificaciones automatizado con mensajes de aprobación y nivelación."
        },
        {
          "id": "sis-6-2-3",
          "topic": "Funciones de conteo condicional: CONTAR.SI y SUMAR.SI en presupuestos escolares",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Procesa bases de datos escolares aplicando filtros automáticos y funciones condicionales de resumen.",
          "suggestedSequence": "Inicio: Contar cuántos estudiantes sacaron más de 4.0 en una lista de 50 alumnos sin hacerlo a mano. Desarrollo: Sintaxis y aplicación de CONTAR.SI(rango; criterio) y SUMAR.SI(rango; criterio; rango_suma). Cierre: Modelo de presupuesto para un evento escolar con subtotales por categoría de gasto."
        }
      ],
      "7°": [
        {
          "id": "sis-7-2-1",
          "topic": "Programación estructurada en Scratch: Variables dinámicas, acumuladores y listas",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica estructuras de datos (listas y variables dinámicas) para almacenar y gestionar información en algoritmos complejos.",
          "suggestedSequence": "Inicio: Cómo almacenar múltiples puntuaciones o nombres de inventario en un programa sin crear decenas de variables. Desarrollo: Creación y manipulación de listas en Scratch: inserción, búsqueda de elementos y recorrido con bucles. Cierre: Programación de un sistema de registro de usuarios y puntuaciones máximas."
        },
        {
          "id": "sis-7-2-2",
          "topic": "Condicionales múltiples y anidados en algoritmos interactivos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Estructura árboles de decisión mediante condicionales anidados (si... si no...) evaluando múltiples escenarios.",
          "suggestedSequence": "Inicio: Ejercicio de diagramación de decisiones complejas en un mapa de flujo. Desarrollo: Programación de condicionales anidados en Scratch para responder a diferentes niveles de dificultad en un juego. Cierre: Prueba y depuración de la lógica de toma de decisiones en diferentes casos extremos."
        },
        {
          "id": "sis-7-2-3",
          "topic": "Modularidad y funciones: Creación de bloques personalizados reutilizables",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Diseña bloques personalizados (funciones con parámetros) para simplificar el código y promover la reutilización.",
          "suggestedSequence": "Inicio: Principio DRY (Don't Repeat Yourself): por qué no debemos duplicar el mismo bloque de código. Desarrollo: Creación de bloques propios en Scratch con entradas numéricas (ej. dibujar_poligono(lados, longitud)). Cierre: Taller de refactorización de código largo reemplazándolo por funciones modulares."
        },
        {
          "id": "sis-7-2-4",
          "topic": "Física en videojuegos: Simulación de gravedad, saltos, velocidad y rozamiento",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Modela principios físicos elementales (gravedad, fricción y rebote) en videojuegos de plataformas.",
          "suggestedSequence": "Inicio: ¿Cómo sabe Mario Bros cuándo caer y con qué velocidad aterriza en el suelo? Desarrollo: Algoritmo de velocidad en Y, aceleración de gravedad (-1) y detección del suelo para simular saltos realistas. Cierre: Proyecto de videojuego de plataformas funcional con física de salto y obstáculos."
        }
      ],
      "8°": [
        {
          "id": "sis-8-2-1",
          "topic": "Fundamentos del desarrollo web: Arquitectura cliente-servidor y estructura básica de HTML5",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende el modelo web cliente-servidor y escribe la estructura semántica fundamental de una página en HTML5.",
          "suggestedSequence": "Inicio: Inspeccionar el código fuente de una página web en el navegador: 'detrás de la pantalla'. Desarrollo: Etiquetas estructurales obligatorias: <!DOCTYPE html>, <html>, <head>, <title>, <body>, encabezados y párrafos. Cierre: Creación de la primera página web personal 'index.html' visualizada en el navegador local."
        },
        {
          "id": "sis-8-2-2",
          "topic": "Maquetación y estilo con CSS3: Selectores, colores, tipografías y el modelo de caja",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Aplica hojas de estilo en cascada (CSS) para dar diseño visual, armonía y estructura espacial a la página web.",
          "suggestedSequence": "Inicio: Comparación entre un HTML sin estilos vs. un sitio maquetado con CSS3 profesional. Desarrollo: Selectores de etiqueta, clase e ID; propiedades de color, fuentes, márgenes (margin), relleno (padding) y bordes. Cierre: Vinculación del archivo 'styles.css' a la página web mejorando su estética visual."
        },
        {
          "id": "sis-8-2-3",
          "topic": "Enlaces, imágenes, tablas y diseño web responsivo (Responsive Design)",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Integra elementos multimedia, navegación entre páginas e implementa diseño adaptable a pantallas móviles.",
          "suggestedSequence": "Inicio: Demostración de cómo se deforma un sitio no adaptable cuando se abre en un celular. Desarrollo: Uso de enlaces (<a href>), imágenes (<img src>), contenedores flexibles (Flexbox) y reglas @media. Cierre: Publicación del sitio web escolar completo en una plataforma gratuita (GitHub Pages)."
        }
      ]
    },
    "Tecnología": {
      "1°": [
        {
          "id": "sis-1-2-1",
          "topic": "El computador como herramienta de trabajo, aprendizaje y juego",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce el computador como un artefacto electrónico que procesa información y apoya el aprendizaje escolar.",
          "suggestedSequence": "Inicio: Visita guiada a la sala de sistemas observando los computadores encendidos. Desarrollo: Explicación de los usos del computador en escuelas, hospitales, bancos y hogares. Cierre: Identificación oral de las actividades que les gustaría realizar en el computador."
        },
        {
          "id": "sis-1-2-2",
          "topic": "Procedimiento seguro de encendido y apagado del computador",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Sigue los pasos secuenciales correctos para encender y apagar el computador sin dañar los componentes.",
          "suggestedSequence": "Inicio: Explicación de por qué no se debe desconectar directamente el cable de energía. Desarrollo: Práctica guiada presionando el botón Power y usando la opción Inicio -> Apagar en Windows. Cierre: Lista de chequeo donde cada niño demuestra que sabe encender y apagar su equipo."
        },
        {
          "id": "sis-1-2-3",
          "topic": "Partes principales del computador: Monitor (pantalla), teclado, mouse (ratón) y CPU",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Identifica y nombra las partes físicas fundamentales del computador describiendo la función de cada una.",
          "suggestedSequence": "Inicio: Canción infantil sobre las partes del computador y señalización en el equipo real. Desarrollo: Asociación: el monitor muestra imágenes, el teclado escribe, el mouse señala y la CPU piensa. Cierre: Coloreado y rotulación de una ficha gráfica con las partes del computador."
        },
        {
          "id": "sis-1-2-4",
          "topic": "Manejo del mouse: Clic, doble clic, arrastre y coordinación visomotriz",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Desarrolla destreza en el agarre del mouse ejecutando clics, doble clic y arrastre en actividades interactivas.",
          "suggestedSequence": "Inicio: Postura ergonómica de la mano sobre el mouse y explicación de los botones izquierdo y derecho. Desarrollo: Juegos interactivos de puntería, reventar burbujas y arrastrar piezas de rompecabezas. Cierre: Observación formativa del dominio motriz fino al interactuar con el puntero."
        },
        {
          "id": "sis-1-2-5",
          "topic": "Normas de convivencia y cuidado en la sala de sistemas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Cumple las normas de aseo, orden, silencio y no ingreso de alimentos a la sala de cómputo.",
          "suggestedSequence": "Inicio: Dramatización sobre qué ocurre si se derrama líquido sobre un teclado. Desarrollo: Socialización de las reglas de oro de la sala de sistemas (manos limpias, orden, respeto). Cierre: Elaboración de carteles ilustrados con las normas para decorar la sala."
        }
      ],
      "2°": [
        {
          "id": "sis-2-2-1",
          "topic": "Estructura y bloques del teclado: Teclas alfanuméricas, numéricas, de función y control",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Identifica las zonas del teclado (alfanumérica, numérica, de navegación y control) y su función específica.",
          "suggestedSequence": "Inicio: Observación de un teclado gigante en pantalla reconociendo los diferentes colores por bloques. Desarrollo: Uso de teclas especiales: Bloq Mayús, Retroceso (borrar), Supr, flechas de dirección y Shift. Cierre: Práctica guiada escribiendo oraciones combinando mayúsculas, minúsculas y números."
        },
        {
          "id": "sis-2-2-2",
          "topic": "Posición correcta de las manos y ergonomía frente al computador",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Adopta una postura corporal adecuada frente al computador y ubica las manos correctamente sobre el teclado.",
          "suggestedSequence": "Inicio: Dinámica de pausas activas y estiramiento de muñecas y espalda. Desarrollo: Explicación de la postura correcta: espalda recta, pies apoyados y vista al nivel de la pantalla. Cierre: Práctica de digitación usando ambas manos sin encorvar la espalda."
        },
        {
          "id": "sis-2-2-3",
          "topic": "Concepto de archivo y carpeta en el explorador de Windows",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Comprende la diferencia entre un archivo (documento, foto) y una carpeta como contenedor de información.",
          "suggestedSequence": "Inicio: Metáfora de la mochila escolar: los cuadernos son archivos y los bolsillos son carpetas. Desarrollo: Navegación por el explorador de Windows reconociendo íconos de documentos y carpetas amarillas. Cierre: Creación de una carpeta personal con su nombre en la ubicación indicada."
        }
      ],
      "3°": [
        {
          "id": "sis-3-2-1",
          "topic": "Procesamiento de textos en Word: Interlineado, márgenes, sangrías y viñetas",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Organiza documentos de texto aplicando interlineado adecuado, listas numeradas y viñetas temáticas.",
          "suggestedSequence": "Inicio: Observación de un texto desordenado vs. un texto con listas claras y buen espaciado. Desarrollo: Práctica guiada configurando márgenes normales, interlineado de 1.5 y viñetas personalizadas. Cierre: Creación de un recetario escolar o lista de normas aplicando listas con viñetas."
        },
        {
          "id": "sis-3-2-2",
          "topic": "Creación y formato de tablas para organizar información escolar",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Inserta y personaliza tablas con filas y columnas aplicando bordes y sombreados de color.",
          "suggestedSequence": "Inicio: Necesidad de organizar el horario semanal de clases de forma clara y visual. Desarrollo: Uso del menú Insertar -> Tabla, ajuste del ancho de columnas y aplicación de estilos de tabla. Cierre: Elaboración del horario escolar personal con colores para cada asignatura."
        },
        {
          "id": "sis-3-2-3",
          "topic": "Introducción a presentaciones multimedia en PowerPoint: Diapositivas, títulos y diseño",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Crea presentaciones digitales sencillas con diapositivas estructuradas combinando títulos, texto e imágenes.",
          "suggestedSequence": "Inicio: ¿Qué es una presentación y para qué se usa en conferencias y clases? Desarrollo: Creación de diapositiva de título y diapositivas de contenido aplicando temas y plantillas de diseño. Cierre: Exposición grupal de una presentación de 3 diapositivas sobre su animal preferido."
        }
      ],
      "4°": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-2-1",
          "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
          "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
          "id": "sis-4-2-2",
          "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
          "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
          "id": "sis-4-2-3",
          "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
          "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
      ],
      "5°": [
        {
          "id": "sis-5-2-1",
          "topic": "Introducción a Excel: Filas, columnas, celdas y tipos de datos (texto, número, fecha)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Reconoce la estructura de la hoja de cálculo y manipula datos alfanuméricos en celdas organizadas.",
          "suggestedSequence": "Inicio: Presentación de una cuadrícula gigante: concepto de coordenada (columna letra, fila número). Desarrollo: Ingreso y formateo de datos: moneda, porcentaje, fecha corta y texto; autoajuste de columnas. Cierre: Creación de una lista de compras con descripción, cantidad y valor unitario."
        },
        {
          "id": "sis-5-2-2",
          "topic": "Operaciones aritméticas básicas en celdas (+, -, *, /) y estructura de fórmulas",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Construye fórmulas matemáticas directas utilizando el signo igual (=) y operadores aritméticos elementales.",
          "suggestedSequence": "Inicio: El signo '=' como activador de cálculo en la hoja de cálculo. Desarrollo: Fórmulas de multiplicación (precio * cantidad) y cálculo de totales y vueltas. Cierre: Taller de cálculo automatizado de una factura comercial escolar."
        },
        {
          "id": "sis-5-2-3",
          "topic": "Funciones estadísticas elementales: SUMA, PROMEDIO, MAX y MIN, y gráficos",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Aplica funciones automáticas para analizar conjuntos de datos numéricos y genera gráficos estadísticos vinculados.",
          "suggestedSequence": "Inicio: Calcular el promedio de notas de 10 estudiantes manualmente vs. con la función PROMEDIO. Desarrollo: Uso del asistente de funciones para SUMA, PROMEDIO, MAX y MIN, e inserción de gráficos de columnas. Cierre: Informe analítico interpretando las notas más altas, más bajas y el promedio grupal."
        }
      ],
      "6°": [
        {
          "id": "sis-6-2-1",
          "topic": "Hojas de cálculo avanzadas: Fórmulas con referencias relativas, absolutas ($A$1) y mixtas",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Utiliza referencias absolutas y relativas en Excel para automatizar cálculos repetitivos sin errores de arrastre.",
          "suggestedSequence": "Inicio: Demostración de qué pasa al arrastrar una fórmula si no se fija la celda del IVA o tasa de cambio. Desarrollo: Uso del símbolo '$' para bloquear filas y columnas ($B$1) y aplicación en tablas de conversión monetaria. Cierre: Taller de cálculo de precios con descuentos fijos utilizando referencias absolutas."
        },
        {
          "id": "sis-6-2-2",
          "topic": "Funciones lógicas: Función SI sencilla y anidada para evaluación de criterios",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Aplica la función condicional SI para emitir resultados automáticos según se cumplan condiciones numéricas o de texto.",
          "suggestedSequence": "Inicio: Lógica escolar: Si nota >= 3.0 entonces 'Aprobó', sino 'Reprobó'. Desarrollo: Estructura de la función =SI(prueba_lógica; valor_si_verdadero; valor_si_falso) y anidamientos. Cierre: Elaboración de un boletín de calificaciones automatizado con mensajes de aprobación y nivelación."
        },
        {
          "id": "sis-6-2-3",
          "topic": "Funciones de conteo condicional: CONTAR.SI y SUMAR.SI en presupuestos escolares",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Procesa bases de datos escolares aplicando filtros automáticos y funciones condicionales de resumen.",
          "suggestedSequence": "Inicio: Contar cuántos estudiantes sacaron más de 4.0 en una lista de 50 alumnos sin hacerlo a mano. Desarrollo: Sintaxis y aplicación de CONTAR.SI(rango; criterio) y SUMAR.SI(rango; criterio; rango_suma). Cierre: Modelo de presupuesto para un evento escolar con subtotales por categoría de gasto."
        }
      ],
      "7°": [
        {
          "id": "sis-7-2-1",
          "topic": "Programación estructurada en Scratch: Variables dinámicas, acumuladores y listas",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica estructuras de datos (listas y variables dinámicas) para almacenar y gestionar información en algoritmos complejos.",
          "suggestedSequence": "Inicio: Cómo almacenar múltiples puntuaciones o nombres de inventario en un programa sin crear decenas de variables. Desarrollo: Creación y manipulación de listas en Scratch: inserción, búsqueda de elementos y recorrido con bucles. Cierre: Programación de un sistema de registro de usuarios y puntuaciones máximas."
        },
        {
          "id": "sis-7-2-2",
          "topic": "Condicionales múltiples y anidados en algoritmos interactivos",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Estructura árboles de decisión mediante condicionales anidados (si... si no...) evaluando múltiples escenarios.",
          "suggestedSequence": "Inicio: Ejercicio de diagramación de decisiones complejas en un mapa de flujo. Desarrollo: Programación de condicionales anidados en Scratch para responder a diferentes niveles de dificultad en un juego. Cierre: Prueba y depuración de la lógica de toma de decisiones en diferentes casos extremos."
        },
        {
          "id": "sis-7-2-3",
          "topic": "Modularidad y funciones: Creación de bloques personalizados reutilizables",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Diseña bloques personalizados (funciones con parámetros) para simplificar el código y promover la reutilización.",
          "suggestedSequence": "Inicio: Principio DRY (Don't Repeat Yourself): por qué no debemos duplicar el mismo bloque de código. Desarrollo: Creación de bloques propios en Scratch con entradas numéricas (ej. dibujar_poligono(lados, longitud)). Cierre: Taller de refactorización de código largo reemplazándolo por funciones modulares."
        },
        {
          "id": "sis-7-2-4",
          "topic": "Física en videojuegos: Simulación de gravedad, saltos, velocidad y rozamiento",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Modela principios físicos elementales (gravedad, fricción y rebote) en videojuegos de plataformas.",
          "suggestedSequence": "Inicio: ¿Cómo sabe Mario Bros cuándo caer y con qué velocidad aterriza en el suelo? Desarrollo: Algoritmo de velocidad en Y, aceleración de gravedad (-1) y detección del suelo para simular saltos realistas. Cierre: Proyecto de videojuego de plataformas funcional con física de salto y obstáculos."
        }
      ],
      "8°": [
        {
          "id": "sis-8-2-1",
          "topic": "Fundamentos del desarrollo web: Arquitectura cliente-servidor y estructura básica de HTML5",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende el modelo web cliente-servidor y escribe la estructura semántica fundamental de una página en HTML5.",
          "suggestedSequence": "Inicio: Inspeccionar el código fuente de una página web en el navegador: 'detrás de la pantalla'. Desarrollo: Etiquetas estructurales obligatorias: <!DOCTYPE html>, <html>, <head>, <title>, <body>, encabezados y párrafos. Cierre: Creación de la primera página web personal 'index.html' visualizada en el navegador local."
        },
        {
          "id": "sis-8-2-2",
          "topic": "Maquetación y estilo con CSS3: Selectores, colores, tipografías y el modelo de caja",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Aplica hojas de estilo en cascada (CSS) para dar diseño visual, armonía y estructura espacial a la página web.",
          "suggestedSequence": "Inicio: Comparación entre un HTML sin estilos vs. un sitio maquetado con CSS3 profesional. Desarrollo: Selectores de etiqueta, clase e ID; propiedades de color, fuentes, márgenes (margin), relleno (padding) y bordes. Cierre: Vinculación del archivo 'styles.css' a la página web mejorando su estética visual."
        },
        {
          "id": "sis-8-2-3",
          "topic": "Enlaces, imágenes, tablas y diseño web responsivo (Responsive Design)",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Integra elementos multimedia, navegación entre páginas e implementa diseño adaptable a pantallas móviles.",
          "suggestedSequence": "Inicio: Demostración de cómo se deforma un sitio no adaptable cuando se abre en un celular. Desarrollo: Uso de enlaces (<a href>), imágenes (<img src>), contenedores flexibles (Flexbox) y reglas @media. Cierre: Publicación del sitio web escolar completo en una plataforma gratuita (GitHub Pages)."
        }
      ]
    }
  },
  "3°": {
    "Matemáticas": {
      "7°": [
        {
          "id": "mat-7-3-1",
          "topic": "Lenguaje algebraico y representación simbólica: Constantes, variables y términos algebraicos",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Identifica los elementos de un término algebraico (signo, coeficiente, parte literal y exponente) y traduce enunciados al lenguaje simbólico.",
          "suggestedSequence": "Inicio: Debate sobre la necesidad del álgebra para generalizar propiedades aritméticas. Desarrollo: Definición de monomio, grado absoluto y relativo, y valor numérico de expresiones algebraicas. Cierre: Taller de cálculo del valor numérico sustituyendo variables por números enteros."
        },
        {
          "id": "mat-7-3-2",
          "topic": "Identificación de patrones numéricos y relaciones funcionales",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Generaliza patrones y regularidades formulando expresiones algebraicas que predicen el comportamiento de una secuencia.",
          "suggestedSequence": "Inicio: Exploración de secuencias geométricas y tablas de números para encontrar la regla general. Desarrollo: Deducción de fórmulas del término n-ésimo (ej. 2n + 1) para secuencias aritméticas. Cierre: Ejercicios de predicción de términos lejanos en secuencias lógicas."
        },
        {
          "id": "mat-7-3-3",
          "topic": "Planteamiento y solución de ecuaciones de primer grado con una incógnita",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Resuelve ecuaciones lineales de primer grado con una incógnita aplicando propiedades de igualdad y transposición de términos.",
          "suggestedSequence": "Inicio: Retos lógicos de balanzas para deducir el principio de equivalencia. Desarrollo: Algoritmo de resolución para ecuaciones de la forma ax + b = c y ax + b = cx + d. Cierre: Taller individual de resolución de ecuaciones lineales con verificación."
        },
        {
          "id": "mat-7-3-4",
          "topic": "Uso de propiedades de igualdad y operaciones inversas en ecuaciones",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Justifica cada paso en la solución de una ecuación mediante las propiedades uniforme, conmutativa y distributiva.",
          "suggestedSequence": "Inicio: Análisis de errores frecuentes al despejar variables para comprender el rigor matemático. Desarrollo: Demostración de cómo las operaciones inversas anulan términos en ambos miembros de la ecuación. Cierre: Taller de sustentación oral explicando los pasos de resolución de una ecuación."
        },
        {
          "id": "mat-7-3-5",
          "topic": "Verificación de soluciones y análisis de coherencia en situaciones reales",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Comprueba las soluciones halladas reemplazando valores en la ecuación original y analiza si la respuesta tiene sentido en el contexto.",
          "suggestedSequence": "Inicio: Discusión sobre por qué una solución numérica negativa puede no ser válida para edades o distancias. Desarrollo: Procedimiento formal de verificación por sustitución directa en ambos miembros. Cierre: Resolución de problemas con análisis crítico de la validez física o económica del resultado."
        },
        {
          "id": "mat-7-3-6",
          "topic": "Aplicación de ecuaciones en contextos cotidianos (repartos, precios, distancias, mezclas, balances)",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Modela y resuelve problemas del entorno escolar y social formulando ecuaciones lineales con rigor conceptual.",
          "suggestedSequence": "Inicio: Planteamiento de un problema de reparto de presupuesto para una excursión escolar. Desarrollo: Paso a paso para resolver problemas: comprender el enunciado, definir la incógnita, plantear la ecuación, resolver y verificar. Cierre: Taller en equipos formulando y resolviendo problemas reales del colegio."
        },
        {
          "id": "mat-7-3-7",
          "topic": "Construcción de tablas y gráficas para representar relaciones entre variables",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Construye tablas de valores y gráficas en el plano cartesiano para representar relaciones lineales entre variables dependientes e independientes.",
          "suggestedSequence": "Inicio: Relación entre tiempo de llamada y costo total para introducir la noción de función. Desarrollo: Tabla de pares ordenados (x,y) y trazado de la recta correspondiente en el plano cartesiano. Cierre: Interpretación de la pendiente de la recta y comparación visual entre funciones."
        },
        {
          "id": "mat-7-3-8",
          "topic": "Interpretación de tendencias y relaciones de cambio en problemas del entorno",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Interpreta gráficas de relaciones de cambio continuas y discretas reconociendo crecimientos, decrecimientos y constantes.",
          "suggestedSequence": "Inicio: Lectura de gráficas de llenado de recipientes y velocidad vs. tiempo. Desarrollo: Análisis cualitativo y cuantitativo de pendientes y puntos de corte con los ejes. Cierre: Redacción de conclusiones a partir de gráficas extraídas de artículos científicos o económicos."
        }
      ],
      "3°": [
        {
          "id": "mat-3-3-1",
          "topic": "Noción de fracción: Numerador, denominador y representación gráfica de partes de la unidad",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Reconoce la fracción como parte de una unidad dividida en partes iguales, identificando el rol del numerador y denominador.",
          "suggestedSequence": "Inicio: División de figuras de plastilina y pasteles en partes exactamente iguales. Desarrollo: Representación gráfica y simbólica de fracciones (medios, tercios, cuartos, sextos, octavos). Cierre: Taller de sombreado y escritura de fracciones a partir de modelos geométricos."
        },
        {
          "id": "mat-3-3-2",
          "topic": "Fracciones propias, impropias y fracciones equivalentes mediante modelos visuales",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Clasifica fracciones en propias e impropias y reconoce fracciones equivalentes mediante modelos visuales continuos.",
          "suggestedSequence": "Inicio: Comparación de franjas de papel plegadas en 2, 4 y 8 partes para ver que 1/2 = 2/4 = 4/8. Desarrollo: Definición de fracción propia (< 1), impropia (> 1) y regla de productos cruzados. Cierre: Ejercicios de identificación y emparejamiento de fracciones equivalentes."
        },
        {
          "id": "mat-3-3-3",
          "topic": "Fracción de un conjunto y situaciones cotidianas de partición",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Calcula la fracción de un conjunto discreto de objetos en problemas de reparto cotidiano.",
          "suggestedSequence": "Inicio: Reto: ¿Cuántos son 2/3 de un grupo de 12 balones? Desarrollo: Procedimiento: dividir la cantidad total entre el denominador y multiplicar por el numerador. Cierre: Resolución de problemas de reparto de colecciones en el aula."
        },
        {
          "id": "mat-3-3-4",
          "topic": "Geometría: Líneas rectas, semirrectas, segmentos, paralelas y perpendiculares",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Identifica y traza rectas paralelas y perpendiculares utilizando regla y escuadra en figuras del entorno.",
          "suggestedSequence": "Inicio: Observación de rieles de tren (paralelas) y esquinas de ventanas (perpendiculares). Desarrollo: Definición de recta, semirrecta y segmento; trazado con regla y escuadra. Cierre: Identificación de rectas paralelas y perpendiculares en el plano del colegio."
        },
        {
          "id": "mat-3-3-5",
          "topic": "Figuras geométricas bidimensionales (triángulos, cuadriláteros) y sus elementos",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Clasifica polígonos según el número de lados y vértices, distinguiendo triángulos y tipos de cuadriláteros.",
          "suggestedSequence": "Inicio: Búsqueda de figuras planas en objetos cotidianos del aula. Desarrollo: Elementos de una figura: lados, vértices y ángulos; clasificación de triángulos por sus lados. Cierre: Construcción de figuras poligonales con palillos y plastilina."
        },
        {
          "id": "mat-3-3-6",
          "topic": "Cuerpos geométricos (cubo, prisma, cilindro, esfera) y sus características en el entorno",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Distingue cuerpos redondos y poliedros reconociendo caras, aristas y vértices en objetos tridimensionales.",
          "suggestedSequence": "Inicio: Manipulación de cajas, pelotas y latas para comparar superficies planas y curvas. Desarrollo: Identificación de caras, aristas y vértices en cubos, prismas y pirámides. Cierre: Armado de cuerpos geométricos a partir de plantillas recortables."
        }
      ],
      "2°": [
        {
          "id": "mat-2-3-1",
          "topic": "Líneas rectas, curvas, abiertas y cerradas; nociones de horizontal y vertical",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Diferencia y dibuja líneas rectas y curvas, abiertas y cerradas, identificando posiciones horizontales y verticales.",
          "suggestedSequence": "Inicio: Trazado de huellas en el patio con lana y tiza identificando trayectorias rectas y curvas. Desarrollo: Dibujo de líneas con regla y a mano alzada clasificándolas según su forma y orientación. Cierre: Creación de un paisaje utilizando únicamente líneas horizontales, verticales y curvas."
        },
        {
          "id": "mat-2-3-2",
          "topic": "Figuras geométricas planas: Círculo, cuadrado, rectángulo, triángulo (lados y vértices)",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Identifica y describe figuras geométricas planas reconociendo el número de lados rectos, curvos y vértices.",
          "suggestedSequence": "Inicio: Clasificación de figuras de madera y plástico por tacto con los ojos vendados. Desarrollo: Conteo formal de lados y vértices en triángulos, cuadrados, rectángulos y círculos. Cierre: Construcción de figuras con plastilina y palillos contando los vértices."
        },
        {
          "id": "mat-2-3-3",
          "topic": "Cuerpos geométricos en los objetos cotidianos: Cubo, esfera, cilindro, cono",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Asocia objetos de su entorno con cuerpos geométricos tridimensionales (cajas con cubos, pelotas con esferas, latas con cilindros).",
          "suggestedSequence": "Inicio: Exploración de juguetes y envases traídos de casa clasificándolos por su forma 3D. Desarrollo: Características de los cuerpos geométricos: caras planas, caras curvas y capacidad de rodar. Cierre: Armado de maquetas sencillas con cuerpos geométricos reciclados."
        },
        {
          "id": "mat-2-3-4",
          "topic": "Noción de longitud: Medidas arbitrarias (palmo, paso, pie) y uso de la regla (centímetro)",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Mide longitudes utilizando partes de su cuerpo e instrumentos estandarizados como la regla graduada en centímetros.",
          "suggestedSequence": "Inicio: Medir el largo del salón con pasos de diferentes estudiantes para ver por qué cambian las medidas. Desarrollo: Introducción del centímetro y uso correcto de la regla desde el número 0. Cierre: Taller de medición de lápices, cuadernos y borradores registrando medidas exactas."
        },
        {
          "id": "mat-2-3-5",
          "topic": "Noción de masa y capacidad: Pesado/liviano, lleno/vacío",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Compara el peso y la capacidad de recipientes usando términos como más pesado que, más liviano que, lleno y vacío.",
          "suggestedSequence": "Inicio: Experimento con una balanza de dos platillos comparando frutas y piedras. Desarrollo: Clasificación de objetos según su masa y experimentación con vasos de agua de diferentes tamaños. Cierre: Registro ilustrado en el cuaderno de comparaciones de peso y capacidad."
        },
        {
          "id": "mat-2-3-6",
          "topic": "Nociones temporales: El reloj (hora en punto y media hora), días de la semana y meses del año",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Identifica la hora en punto y la media hora en relojes analógicos y organiza actividades en el calendario escolar.",
          "suggestedSequence": "Inicio: Canción de los días de la semana y los doce meses del año. Desarrollo: Lectura del reloj con manecillas: el minutero en las 12 (en punto) y en las 6 (y media). Cierre: Elaboración de un horario ilustrado de su rutina diaria con horas específicas."
        }
      ],
      "1°": [
        {
          "id": "mat-1-3-1",
          "topic": "Números hasta el 99 y descomposición en decenas y unidades",
          "dba": "DBA: Cuenta, lee, escribe y descompone números hasta 99 reconociendo patrones del sistema decimal.",
          "achievement": "Identifica secuencias numéricas y descompone números en decenas y unidades con seguridad."
        },
        {
          "id": "mat-1-3-2",
          "topic": "Sustracción sin desagrupación y problemas de combinación y comparación",
          "dba": "DBA: Resuelve problemas aditivos de cambio y comparación utilizando la resta.",
          "achievement": "Aplica la sustracción en problemas cotidianos reconociendo términos como minuendo, sustraendo y diferencia."
        }
      ],
      "4°": [
        {
          "id": "mat-4-3-1",
          "topic": "Fracciones: concepto, representación gráfica y lectura de fracciones",
          "dba": "DBA: Interpreta y utiliza fracciones homogéneas para representar partes de una unidad y conjuntos.",
          "achievement": "Representa fracciones propias e impropias en gráficos continuos y discretos con claridad."
        },
        {
          "id": "mat-4-3-2",
          "topic": "Operaciones aditivas con fracciones homogéneas y resolución de problemas",
          "dba": "DBA: Resuelve y formula problemas que requieren la suma y resta de fracciones de igual denominador.",
          "achievement": "Realiza sumas y restas de fracciones homogéneas simplificando la fracción resultante."
        }
      ],
      "5°": [
        {
          "id": "mat-5-3-1",
          "topic": "Números decimales: décimas, centésimas, milésimas y operaciones de suma y resta",
          "dba": "DBA: Interpreta y opera con números decimales estableciendo relaciones con las fracciones decimales.",
          "achievement": "Ubica decimales en la recta numérica y opera aditivamente alineando la coma decimal."
        },
        {
          "id": "mat-5-3-2",
          "topic": "Multiplicación y división de números decimales y proporcionalidad directa",
          "dba": "DBA: Resuelve problemas de proporcionalidad y variación aplicando operaciones con números decimales.",
          "achievement": "Multiplica y divide decimales por potencias de 10 y entre números naturales resolviendo problemas prácticos."
        }
      ],
      "6°": [
        {
          "id": "mat-6-3-1",
          "topic": "Multiplicación y división de números enteros y ley de signos",
          "dba": "DBA: Opera multiplicativamente con números enteros aplicando de forma correcta la ley de signos.",
          "achievement": "Calcula productos y cocientes de enteros respetando los signos positivos y negativos."
        },
        {
          "id": "mat-6-3-2",
          "topic": "Polinomios aritméticos con números enteros y signos de agrupación",
          "dba": "DBA: Simplifica polinomios aritméticos que contienen enteros y respeta la jerarquía de las operaciones.",
          "achievement": "Resuelve expresiones complejas eliminando paréntesis, corchetes y llaves de forma ordenada."
        }
      ],
      "8°": [
        {
          "id": "mat-8-3-1",
          "topic": "Factorización de trinomios: Trinomio cuadrado perfecto y trinomios de la forma x^2 + bx + c",
          "dba": "DBA: Identifica y utiliza diferentes casos de factorización de trinomios para simplificar expresiones.",
          "achievement": "Saber: Reconoce la estructura de trinomios factorizables. Hacer: Factoriza trinomios cuadrados perfectos y de la forma x^2+bx+c."
        },
        {
          "id": "mat-8-3-2",
          "topic": "Factorización de trinomios de la forma ax^2 + bx + c y método de aspa o tijeras",
          "dba": "DBA: Aplica métodos eficientes de factorización en trinomios con coeficiente principal distinto de 1.",
          "achievement": "Saber: Explica la técnica de descomposición de términos. Hacer: Factoriza trinomios de la forma ax^2+bx+c verificando el resultado."
        },
        {
          "id": "mat-8-3-3",
          "topic": "Factorización de diferencia de cuadrados perfectos y suma/diferencia de cubos perfectos",
          "dba": "DBA: Reconoce y factoriza binomios notables aplicándolos a la resolución de problemas geométricos y de volumen.",
          "achievement": "Saber: Identifica raíces cuadradas y cúbicas exactas. Hacer: Factoriza a^2 - b^2 y a^3 ± b^3 con precisión."
        },
        {
          "id": "mat-8-3-4",
          "topic": "Geometría: La circunferencia, rectas tangentes, secantes, cuerdas, arcos y ángulos centrales e inscritos",
          "dba": "DBA: Reconoce y contrasta propiedades de la circunferencia, arcos, cuerdas y sus relaciones angulares.",
          "achievement": "Saber: Define cuerda, arco, tangente y secante. Hacer: Calcula longitudes y medidas de ángulos inscritos y centrales."
        }
      ],
      "9°": [
        {
          "id": "mat-9-3-1",
          "topic": "Función cuadrática: representación gráfica, vértice, eje de simetría y concavidad",
          "dba": "DBA: Analiza las características gráficas y algebraicas de la función cuadrática en situaciones de tiro parabólico.",
          "achievement": "Saber: Define el vértice y discriminante. Hacer: Grafica parábolas identificando puntos de corte con los ejes."
        },
        {
          "id": "mat-9-3-2",
          "topic": "Ecuaciones cuadráticas: solución por factorización y por fórmula general cuadrática",
          "dba": "DBA: Resuelve ecuaciones de segundo grado eligiendo el método más adecuado y analiza la naturaleza de las raíces.",
          "achievement": "Saber: Conoce la fórmula cuadrática general. Hacer: Calcula soluciones reales y complejas de ecuaciones cuadráticas."
        }
      ],
      "10°": [
        {
          "id": "mat-10-3-1",
          "topic": "Ecuaciones trigonométricas y Teorema del Seno y del Coseno",
          "dba": "DBA: Resuelve triángulos oblicuángulos y ecuaciones trigonométricas aplicando leyes trigonométricas.",
          "achievement": "Saber: Enuncia la Ley del Seno y Ley del Coseno. Hacer: Resuelve triángulos cualesquiera en problemas de navegación y topografía."
        },
        {
          "id": "mat-10-3-2",
          "topic": "Geometría analítica: La recta (pendiente, ecuación canónica y general) y la circunferencia",
          "dba": "DBA: Deduce las ecuaciones de la recta y la circunferencia determinando centro, radio y pendientes.",
          "achievement": "Saber: Identifica la ecuación de la circunferencia (x-h)^2 + (y-k)^2 = r^2. Hacer: Grafica y calcula elementos de la circunferencia."
        }
      ],
      "11°": [
        {
          "id": "mat-11-3-1",
          "topic": "Cálculo diferencial: Concepto intuitivo de derivada como razón de cambio y pendiente de la recta tangente",
          "dba": "DBA: Interpreta la derivada de una función como la pendiente de la tangente y velocidad instantánea.",
          "achievement": "Saber: Explica el límite del cociente incremental. Hacer: Calcula derivadas básicas por definición geométrica y algebraica."
        },
        {
          "id": "mat-11-3-2",
          "topic": "Reglas de derivación: derivada de una constante, potencia, suma, producto, cociente y regla de la cadena",
          "dba": "DBA: Aplica las reglas formales de derivación para calcular derivadas de funciones polinómicas, racionales y compuestas.",
          "achievement": "Saber: Conoce las tablas de derivadas básicas. Hacer: Deriva funciones complejas aplicando la regla de la cadena."
        }
      ]
    },
    "Lógica": {
      "6°": [
        {
          "id": "log-6-3-1",
          "topic": "Lógica espacial y razonamiento geométrico: Puntos, rectas, planos y medición de ángulos",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Conceptualiza elementos geométricos fundamentales y clasifica ángulos según su medida y posición en el espacio.",
          "suggestedSequence": "Inicio: Rastreo de elementos geométricos en la arquitectura del colegio. Desarrollo: Medición y construcción de ángulos (agudo, recto, obtuso, llano) con transportador y regla. Cierre: Taller de dibujo geométrico con precisión y rotulación correcta."
        },
        {
          "id": "log-6-3-2",
          "topic": "Clasificación y propiedades de polígonos: Triángulos, cuadriláteros y polígonos regulares",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Clasifica polígonos regulares e irregulares analizando lados, vértices y la suma de sus ángulos interiores.",
          "suggestedSequence": "Inicio: Clasificación de figuras geométricas a partir de imágenes del entorno. Desarrollo: Demostración práctica de la suma de ángulos internos en triángulos y cuadriláteros. Cierre: Construcción de figuras poligonales en geoplano o papel milimetrado."
        },
        {
          "id": "log-6-3-3",
          "topic": "Transformaciones en el plano cartesiano: Traslación, rotación, reflexión y simetría",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Aplica traslaciones, rotaciones y reflexiones sobre figuras bidimensionales en el plano cartesiano identificando ejes de simetría.",
          "suggestedSequence": "Inicio: Dinámica de movimientos corporales reflejados en espejo para introducir la simetría. Desarrollo: Ubicación de pares ordenados (x,y) y aplicación de transformaciones rígidas a polígonos. Cierre: Diseño de un mosaico o teselado artístico aplicando simetría axial y central."
        },
        {
          "id": "log-6-3-4",
          "topic": "Cálculo y estimación de perímetro y área en polígonos en contextos reales",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Calcula el perímetro y el área de figuras compuestas aplicando fórmulas en situaciones prácticas de diseño y medición.",
          "suggestedSequence": "Inicio: Medición del perímetro y área del salón de clases para calcular materiales de pintura o baldosa. Desarrollo: Fórmulas de área para cuadriláteros y triángulos, y descomposición de polígonos complejos. Cierre: Taller aplicativo resolviendo problemas de optimización de espacio."
        }
      ]
    },
    "Sistemas": {
      "1°": [
        {
          "id": "sis-1-3-1",
          "topic": "Explorando el programa Paint: El lienzo digital y la barra de herramientas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce la interfaz del programa de dibujo Paint identificando el área de trabajo y la barra de opciones.",
          "suggestedSequence": "Inicio: Apertura del programa Paint desde el menú de inicio guiados por el docente. Desarrollo: Exploración libre de la ventana: barra de título, lienzo en blanco y paleta de colores. Cierre: Realización del primer trazo libre en la pantalla y cambio de color."
        },
        {
          "id": "sis-1-3-2",
          "topic": "Herramientas de dibujo en Paint: Lápiz, pinceles, borrador y figuras geométricas básicas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Utiliza herramientas de lápiz, pincel, borrador y figuras geométricas para crear composiciones gráficas sencillas.",
          "suggestedSequence": "Inicio: Demostración del uso de formas geométricas (círculo, cuadrado, triángulo) para dibujar una casa. Desarrollo: Práctica guiada combinando formas y usando el bote de pintura para rellenar con color. Cierre: Exposición en pantalla de los dibujos de casas y paisajes creados por los estudiantes."
        },
        {
          "id": "sis-1-3-3",
          "topic": "El teclado: Reconocimiento de letras, números, barra espaciadora y tecla Enter",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Localiza en el teclado las letras de su nombre, los dígitos numéricos, el espaciador y el salto de línea.",
          "suggestedSequence": "Inicio: Búsqueda tipo 'caza del tesoro' de las vocales en el teclado del computador. Desarrollo: Identificación de la barra espaciadora para separar palabras y la tecla Enter para bajar de renglón. Cierre: Escritura de su nombre completo y edad en el procesador de notas infantiles."
        },
        {
          "id": "sis-1-3-4",
          "topic": "Creación y guardado de dibujos digitales expresando ideas y emociones",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Diseña ilustraciones digitales creativas y aprende los pasos guiados para guardar su trabajo en el computador.",
          "suggestedSequence": "Inicio: Diálogo sobre cómo se sienten hoy y qué dibujo representa su emoción. Desarrollo: Creación del dibujo en Paint y práctica del comando Archivo -> Guardar con ayuda del docente. Cierre: Portafolio digital de dibujos proyectados para la retroalimentación grupal."
        }
      ],
      "2°": [
        {
          "id": "sis-2-3-1",
          "topic": "Introducción al procesador de textos (Word / WordPad): Entorno de trabajo y escritura básica",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce la ventana del procesador de textos y escribe párrafos cortos aplicando signos de puntuación.",
          "suggestedSequence": "Inicio: Comparación entre escribir a mano en una hoja y escribir en la pantalla de Word. Desarrollo: Reconocimiento del cursor parpadeante, barra de herramientas y hoja en blanco de trabajo. Cierre: Redacción de una pequeña anécdota personal de tres renglones."
        },
        {
          "id": "sis-2-3-2",
          "topic": "Edición y formato de texto: Tipo de letra (fuente), tamaño, color, negrita, cursiva y subrayado",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Modifica la apariencia del texto seleccionado cambiando fuente, tamaño, estilo y color de manera armónica.",
          "suggestedSequence": "Inicio: Observación de titulares de revistas con diferentes tipografías llamativas. Desarrollo: Selección de texto con el mouse y aplicación de botones: Negrita (N), Cursiva (K), Subrayado (S) y colores. Cierre: Ejercicio de personalización de un poema escolar con distintos formatos."
        },
        {
          "id": "sis-2-3-3",
          "topic": "Alineación de párrafos e inserción de imágenes sencillas",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Aplica alineaciones (izquierda, centrada, derecha) e inserta imágenes ilustrativas en sus escritos.",
          "suggestedSequence": "Inicio: Explicación de por qué los títulos van centrados y los textos a la izquierda. Desarrollo: Práctica de alineación y uso del menú Insertar -> Imágenes para acompañar la redacción. Cierre: Creación de una tarjeta de felicitación con título centrado, mensaje e imagen decorativa."
        }
      ],
      "3°": [
        {
          "id": "sis-3-3-1",
          "topic": "Pensamiento computacional: Concepto de algoritmo en la vida diaria (pasos ordenados)",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Identifica que un algoritmo es una secuencia lógica de pasos finitos y ordenados para resolver un problema.",
          "suggestedSequence": "Inicio: Instrucciones para cepillarse los dientes o preparar un sándwich de mermelada paso a paso. Desarrollo: Descomposición de tareas cotidianas en instrucciones secuenciales precisas sin omitir detalles. Cierre: Juego de 'robot humano': un estudiante da órdenes exactas a otro para cruzar un camino con obstáculos."
        },
        {
          "id": "sis-3-3-2",
          "topic": "Programación por bloques con Scratch / Code.org: Entorno, personajes (sprites) y movimiento",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce la interfaz de Scratch y programa el desplazamiento y cambio de apariencia de personajes.",
          "suggestedSequence": "Inicio: Presentación del gato de Scratch y del escenario interactivo. Desarrollo: Arrastre y encaje de bloques de movimiento (mover 10 pasos, girar 15 grados) y apariencia (cambiar disfraz). Cierre: Programación de un personaje que camina por el escenario de un extremo a otro."
        },
        {
          "id": "sis-3-3-3",
          "topic": "Eventos y sonido en la programación: Al presionar bandera verde y teclas",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Utiliza bloques de eventos para iniciar programas y reproducir efectos de sonido sincronizados.",
          "suggestedSequence": "Inicio: Explicación de cómo responde un videojuego cuando oprimimos un botón en el control. Desarrollo: Uso de eventos 'al presionar bandera verde' y 'al presionar tecla espacio' con bloques de sonido. Cierre: Creación de una pequeña animación musical donde los personajes bailan y emiten sonidos."
        }
      ],
      "4°": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "5°": [
        {
          "id": "sis-5-3-1",
          "topic": "Variables y listas en programación por bloques: Acumuladores y contadores",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Utiliza variables y listas para almacenar y procesar datos dinámicos en algoritmos de Scratch.",
          "suggestedSequence": "Inicio: ¿Cómo guarda un programa el nombre del jugador o el inventario de objetos en un juego? Desarrollo: Creación de listas de elementos y manipulación con bloques de añadir, eliminar y consultar longitud. Cierre: Programación de un juego de preguntas y respuestas que registra el nombre y puntaje acumulado."
        },
        {
          "id": "sis-5-3-2",
          "topic": "Operadores matemáticos y lógicos (Y, O, NO, >, <, =) en algoritmos",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Construye condiciones compuestas utilizando operadores booleanos y comparadores en la toma de decisiones.",
          "suggestedSequence": "Inicio: Ejemplos de condiciones dobles: 'Si tienes más de 10 años Y tienes el boleto, puedes entrar'. Desarrollo: Uso de operadores verdes en Scratch combinando comparaciones (<, >, =) con operadores lógicos. Cierre: Creación de un algoritmo de validación de contraseña con múltiples requisitos."
        },
        {
          "id": "sis-5-3-3",
          "topic": "Mensajes entre personajes y sincronización de escenas interactivas",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Sincroniza acciones y cambios de escenario mediante el envío y recepción de mensajes de difusión.",
          "suggestedSequence": "Inicio: Metáfora de una obra de teatro: un actor entra cuando otro le da el pie (mensaje). Desarrollo: Uso de bloques 'enviar mensaje [evento]' y 'al recibir [evento]' para coordinar diálogos y fondos. Cierre: Proyecto de animación de una fábula con dos personajes dialogando en diferentes escenarios."
        }
      ],
      "6°": [
        {
          "id": "sis-6-3-1",
          "topic": "Principios del diseño gráfico digital: Teoría del color, tipografía y composición visual",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Aplica principios de contraste, jerarquía visual y psicología del color en la creación de piezas gráficas.",
          "suggestedSequence": "Inicio: Análisis de afiches publicitarios profesionales: qué colores llaman la atención y qué fuentes son legibles. Desarrollo: Círculo cromático, colores complementarios, fuentes sans-serif vs. serif y retículas de composición. Cierre: Diseño de un póster publicitario o banner escolar aplicando Canva o software gráfico."
        },
        {
          "id": "sis-6-3-2",
          "topic": "Edición de audio digital con Audacity: Grabación de voz, efectos y mezcla de pistas",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Graba y edita pistas de audio digital aplicando recortes, normalización, reducción de ruido y música de fondo.",
          "suggestedSequence": "Inicio: Escucha de un podcast profesional identificando la locución limpia y la música de fondo. Desarrollo: Grabación de locución en Audacity, eliminación de ruido de fondo, fade in / fade out y exportación a MP3. Cierre: Producción en parejas de una cápsula radial escolar de 2 minutos sobre un tema pedagógico."
        },
        {
          "id": "sis-6-3-3",
          "topic": "Montaje y edición de video con Clipchamp / CapCut: Línea de tiempo, transiciones y títulos",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Produce piezas audiovisuales cortas integrando clips de video, audios, títulos animados y transiciones.",
          "suggestedSequence": "Inicio: Concepto de guión técnico y línea de tiempo (timeline) en la producción audiovisual. Desarrollo: Importación de clips, corte de secuencias innecesarias, inserción de títulos y renderizado final. Cierre: Proyección y retroalimentación colectiva de los videos educativos creados."
        }
      ],
      "7°": [
        {
          "id": "sis-7-3-1",
          "topic": "Fundamentos de electricidad y electrónica: Voltaje, corriente, resistencia y ley de Ohm",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Calcula magnitudes eléctricas básicas aplicando la ley de Ohm (V = I * R) y reconoce su aplicación en circuitos.",
          "suggestedSequence": "Inicio: Analogía hidráulica: el voltaje como presión de agua, la corriente como caudal y la resistencia como estrechamiento. Desarrollo: Fórmulas de la ley de Ohm y cálculo del resistor adecuado para no quemar un diodo LED. Cierre: Resolución de problemas numéricos de circuitos simples y verificación con multímetro virtual."
        },
        {
          "id": "sis-7-3-2",
          "topic": "Introducción a placas controladoras programables: Arquitectura de Arduino / micro:bit",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Identifica los pines digitales, analógicos y de alimentación en placas microcontroladoras programables.",
          "suggestedSequence": "Inicio: El microcontrolador como cerebro programable que conecta el mundo digital con el mundo real. Desarrollo: Entorno de programación por bloques y texto; estructura de un programa: configuración inicial (setup) y bucle infinito (loop). Cierre: Conexión y programación de un parpadeo de LED (Blink) modificando tiempos de retardo."
        },
        {
          "id": "sis-7-3-3",
          "topic": "Control de actuadores: Servomotores, motores DC y zumbadores (buzzers)",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Programa actuadores electromecánicos para generar movimientos angulares precisos y alertas sonoras.",
          "suggestedSequence": "Inicio: ¿Cómo se mueve el timón de un barco o la barrera de un estacionamiento? Introducción al servomotor. Desarrollo: Control angular de servomotores (0° a 180°) y modulación PWM para variar tonos en un buzzer. Cierre: Montaje y programación de una talanquera automática que pita y se levanta al presionar un botón."
        },
        {
          "id": "sis-7-3-4",
          "topic": "Integración de sensores de luz, temperatura y distancia ultrasónica (HC-SR04)",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Lee e interpreta datos de sensores ultrasónicos y de luz para programar respuestas automáticas del sistema.",
          "suggestedSequence": "Inicio: Principio de ecolocalización de los murciélagos para entender el sensor ultrasónico HC-SR04. Desarrollo: Cálculo de distancia por tiempo de eco (d = v * t / 2) y programación de umbrales de proximidad. Cierre: Prototipo de sensor de reversa vehicular con advertencia de luz y sonido según la cercanía."
        }
      ],
      "8°": [
        {
          "id": "sis-8-3-1",
          "topic": "Introducción a la programación textual en Python: Sintaxis, variables y tipos de datos",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Escribe programas estructurados en Python utilizando variables tipadas, operadores y funciones de entrada/salida.",
          "suggestedSequence": "Inicio: Transición del código en bloques de Scratch al código textual en Python: ventajas y legibilidad. Desarrollo: Instalación de entorno (Thonny / VS Code), tipos de datos (int, float, str, bool), print() e input(). Cierre: Programa interactivo que solicita datos al usuario, realiza cálculos y muestra el resultado formateado."
        },
        {
          "id": "sis-8-3-2",
          "topic": "Estructuras condicionales en Python (if, elif, else) aplicadas a la toma de decisiones",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Implementa bifurcaciones lógicas complejas con if-elif-else respetando la indentación obligatoria de Python.",
          "suggestedSequence": "Inicio: La importancia de la indentación (sangría) en Python como delimitador de bloques de código. Desarrollo: Operadores relacionales y lógicos (and, or, not) evaluando condiciones múltiples en situaciones reales. Cierre: Algoritmo de clasificación de notas académicas y recomendaciones personalizadas."
        },
        {
          "id": "sis-8-3-3",
          "topic": "Estructuras cíclicas (bucles while y for) y procesamiento de listas de datos",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Automatiza tareas repetitivas mediante ciclos while y bucles for con la función range() y listas.",
          "suggestedSequence": "Inicio: ¿Cómo imprimir los números del 1 al 1000 en 3 líneas de código? Introducción a los bucles. Desarrollo: Sintaxis de for i in range(inicio, fin, paso) y bucle while con condición de parada para evitar ciclos infinitos. Cierre: Programa que calcula la media y varianza de una lista de datos numéricos ingresados por el usuario."
        }
      ]
    },
    "Robótica": {
      "9°": [
        {
          "id": "rob-9-3-1",
          "topic": "Protocolos de comunicación inalámbrica y módulos de radiofrecuencia (Bluetooth HC-05 / HC-06)",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Configura módulos de comunicación serie inalámbrica Bluetooth mediante comandos AT estableciendo enlace seguro.",
          "suggestedSequence": "Inicio: ¿Cómo se empareja un teléfono con un parlante o un robot? Introducción a los perfiles Bluetooth (SPP). Desarrollo: Configuración de velocidad en baudios (9600 bps), nombre y clave del módulo Bluetooth con terminal serie. Cierre: Prueba de envío de caracteres de prueba desde el PC al microcontrolador de forma inalámbrica."
        },
        {
          "id": "rob-9-3-2",
          "topic": "Desarrollo de aplicaciones móviles de control robótico en MIT App Inventor",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Diseña la interfaz gráfica y programa la lógica de eventos de una app móvil para teledirigir un prototipo robótico.",
          "suggestedSequence": "Inicio: Creación de la cuenta en App Inventor y diseño visual del panel de control con botones direccionales y slider de velocidad. Desarrollo: Programación por bloques en la app: conexión con el cliente Bluetooth y envío de comandos ('F', 'B', 'L', 'R', 'S'). Cierre: Instalación del archivo APK en el teléfono móvil y vinculación con el módulo Bluetooth."
        },
        {
          "id": "rob-9-3-3",
          "topic": "Transmisión de telemetría bidireccional: Lectura de sensores en la pantalla del celular",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Muestra en la pantalla del dispositivo móvil datos en tiempo real de voltaje de batería y distancia de sensores.",
          "suggestedSequence": "Inicio: Importancia de la telemetría en vehículos de exploración como los drones o autos autónomos. Desarrollo: Estructuración de tramas de datos separadas por comas (CSV) enviadas desde el robot a la app móvil. Cierre: Visualización de un indicador gráfico en el celular alertando batería baja o cercanía de obstáculos."
        },
        {
          "id": "rob-9-3-4",
          "topic": "Circuito de obstáculos y maniobras de precisión con control telemétrico",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Demuestra destreza en el pilotaje remoto y seguridad en la parada de emergencia en pistas con restricciones espaciales.",
          "suggestedSequence": "Inicio: Protocolos de seguridad: parada de emergencia instantánea si se pierde la conexión de radio. Desarrollo: Pruebas contrarreloj en un circuito de conos y rampas manejando el robot con el celular. Cierre: Evaluación formativa de la precisión de maniobra y estabilidad del enlace de comunicación."
        }
      ],
      "10°": [
        {
          "id": "rob-10-3-1",
          "topic": "Arquitectura de sistemas IoT (Internet of Things): Protocolos MQTT y plataformas Cloud",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Comprende la arquitectura de soluciones IoT y publica datos de telemetría hacia plataformas en la nube mediante protocolo MQTT.",
          "suggestedSequence": "Inicio: ¿Cómo se comunica una estación meteorológica o un reloj inteligente con internet? El paradigma IoT. Desarrollo: Creación de cuenta en brokers IoT (Adafruit IO / ThingSpeak) y publicación de datos vía Wi-Fi con ESP32. Cierre: Visualización en tiempo real de gráficas dinámicas de datos subidos a la nube desde el colegio."
        },
        {
          "id": "rob-10-3-2",
          "topic": "Sensores ambientales y de proceso: Calidad del aire, humedad/temperatura (DHT22) y nivel de líquidos",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Conecta y calibra sensores de precisión para el monitoreo automatizado de variables físicas y ambientales.",
          "suggestedSequence": "Inicio: Medición del confort ambiental en el aula: temperatura, humedad relativa y calidad del aire. Desarrollo: Protocolo de comunicación digital de un solo hilo con el sensor DHT22 y calibración de umbrales de alerta. Cierre: Sistema de monitoreo que dispara alertas cuando la temperatura o humedad supera niveles seguros."
        },
        {
          "id": "rob-10-3-3",
          "topic": "Actuadores de potencia para domótica e IoT: Relés de estado sólido y cargas de corriente alterna",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Diseña circuitos de conmutación de potencia con optoacoplamiento para controlar iluminación y ventiladores de 110V AC.",
          "suggestedSequence": "Inicio: Precauciones críticas al trabajar con corriente alterna domiciliaria (110V) vs. corriente directa (5V). Desarrollo: Principio de aislamiento óptico mediante optoacopladores y accionamiento de relés de estado sólido sin chispas. Cierre: Prototipo de encendido remoto de una lámpara de 110V desde un botón digital en la plataforma IoT."
        },
        {
          "id": "rob-10-3-4",
          "topic": "Automatización de un sistema ciberfísico: Invernadero inteligente o aula automatizada",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Integra sensores, microcontroladores y actuadores en un sistema inteligente con retroalimentación en lazo cerrado.",
          "suggestedSequence": "Inicio: Planteamiento del reto: mantener una planta en condiciones óptimas de humedad y luz automáticamente. Desarrollo: Algoritmo de control: si la humedad del suelo cae por debajo del 30%, activar la bomba de riego por 5 segundos. Cierre: Presentación del prototipo a escala de invernadero automatizado con registro en la nube."
        }
      ],
      "11°": [
        {
          "id": "rob-11-3-1",
          "topic": "Sistemas embebidos basados en Linux: Configuración de Raspberry Pi y entorno de desarrollo",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Configura ordenadores monoplaca con sistema operativo Linux para ejecutar tareas de procesamiento masivo en robótica.",
          "suggestedSequence": "Inicio: Diferencias entre un microcontrolador (microsegundos, tiempo real) vs. computador monoplaca (gigahertz, sistema operativo). Desarrollo: Instalación de Raspberry Pi OS, conexión por SSH sin monitor (headless), comandos bash y entorno Python. Cierre: Control de pines GPIO desde scripts de Python interactuando con sensores y actuadores."
        },
        {
          "id": "rob-11-3-2",
          "topic": "Procesamiento y visión artificial avanzada con OpenCV en Python",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Aplica algoritmos de filtrado espacial, detección de bordes (Canny) y reconocimiento de contornos en flujos de video.",
          "suggestedSequence": "Inicio: Flujo de procesamiento de imágenes: captura de frame, escala de grises, desenfoque gaussiano y binarización. Desarrollo: Uso de la librería OpenCV para detectar contornos geométricos, calcular centroides y calcular orientación angular. Cierre: Script en tiempo real que identifica y marca con cajas delimitadoras señales de tráfico u objetos específicos."
        },
        {
          "id": "rob-11-3-3",
          "topic": "Comunicación serial entre microcontroladores de tiempo real y computadores monoplaca",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Estructura protocolos de comunicación robustos por puerto serie / UART entre el procesador Linux y la placa motriz.",
          "suggestedSequence": "Inicio: División de tareas: la Raspberry Pi procesa visión y la placa controladora maneja motores y lazo PID. Desarrollo: Protocolo de comunicación con bytes de inicio (header), comando, datos y suma de verificación (checksum). Cierre: Transmisión continua de vectores de velocidad desde el algoritmo de visión hacia los motores."
        },
        {
          "id": "rob-11-3-4",
          "topic": "Navegación autónoma guiada por visión artificial y telemetría en la nube",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Implementa navegación autónoma en un vehículo robótico que toma decisiones de ruta guiado por su cámara frontal.",
          "suggestedSequence": "Inicio: Simulación de vehículos autónomos (Tesla / Waymo): detección del carril y de obstáculos en la vía. Desarrollo: Integración de detección de carril con corrección proporcional en la dirección del vehículo móvil. Cierre: Prueba autónoma en circuito cerrado esquivando señales de pare y siguiendo marcas viales."
        }
      ]
    },
    "Dirección de grupo": {
      "7°": [
        {
          "id": "dir-7-3-1",
          "topic": "Liderazgo estudiantil, participación democrática y representación escolar",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Participa con responsabilidad en la elección de voceros del curso y apoya iniciativas del gobierno escolar.",
          "suggestedSequence": "Inicio: Cualidades de un buen líder: servicio, escucha, honestidad y compromiso con el grupo. Desarrollo: Asamblea de grado para evaluar el cumplimiento de compromisos y proponer mejoras al colegio. Cierre: Plan de acción del comité estudiantil de grado para el tercer periodo."
        },
        {
          "id": "dir-7-3-2",
          "topic": "Trabajo colaborativo, cohesión grupal y superación de dificultades académicas",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Participa en redes de apoyo solidario entre compañeros para nivelar materias y superar retos académicos.",
          "suggestedSequence": "Inicio: Dinámica de confianza grupal 'Construyendo el puente' que requiere la ayuda de todos. Desarrollo: Creación de grupos de tutoría entre pares (los más fuertes en una materia apoyan a quienes lo necesitan). Cierre: Balance de metas alcanzadas y reconocimiento al esfuerzo y la perseverancia."
        },
        {
          "id": "dir-7-3-3",
          "topic": "Uso consciente de redes sociales y desconexión digital saludable",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Reflexiona sobre el tiempo invertido en pantallas y fomenta actividades deportivas, artísticas y de lectura.",
          "suggestedSequence": "Inicio: Registro de tiempo en pantalla del celular: ¿Cuántas horas dedicamos a redes vs. a vivir la realidad? Desarrollo: Debate sobre la influencia de los algoritmos y la necesidad del descanso mental y visual. Cierre: Reto 'Un día de desconexión' compartiendo planes al aire libre con la familia."
        }
      ]
    },
    "Tecnología e Informática": {
      "1°": [
        {
          "id": "sis-1-3-1",
          "topic": "Explorando el programa Paint: El lienzo digital y la barra de herramientas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce la interfaz del programa de dibujo Paint identificando el área de trabajo y la barra de opciones.",
          "suggestedSequence": "Inicio: Apertura del programa Paint desde el menú de inicio guiados por el docente. Desarrollo: Exploración libre de la ventana: barra de título, lienzo en blanco y paleta de colores. Cierre: Realización del primer trazo libre en la pantalla y cambio de color."
        },
        {
          "id": "sis-1-3-2",
          "topic": "Herramientas de dibujo en Paint: Lápiz, pinceles, borrador y figuras geométricas básicas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Utiliza herramientas de lápiz, pincel, borrador y figuras geométricas para crear composiciones gráficas sencillas.",
          "suggestedSequence": "Inicio: Demostración del uso de formas geométricas (círculo, cuadrado, triángulo) para dibujar una casa. Desarrollo: Práctica guiada combinando formas y usando el bote de pintura para rellenar con color. Cierre: Exposición en pantalla de los dibujos de casas y paisajes creados por los estudiantes."
        },
        {
          "id": "sis-1-3-3",
          "topic": "El teclado: Reconocimiento de letras, números, barra espaciadora y tecla Enter",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Localiza en el teclado las letras de su nombre, los dígitos numéricos, el espaciador y el salto de línea.",
          "suggestedSequence": "Inicio: Búsqueda tipo 'caza del tesoro' de las vocales en el teclado del computador. Desarrollo: Identificación de la barra espaciadora para separar palabras y la tecla Enter para bajar de renglón. Cierre: Escritura de su nombre completo y edad en el procesador de notas infantiles."
        },
        {
          "id": "sis-1-3-4",
          "topic": "Creación y guardado de dibujos digitales expresando ideas y emociones",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Diseña ilustraciones digitales creativas y aprende los pasos guiados para guardar su trabajo en el computador.",
          "suggestedSequence": "Inicio: Diálogo sobre cómo se sienten hoy y qué dibujo representa su emoción. Desarrollo: Creación del dibujo en Paint y práctica del comando Archivo -> Guardar con ayuda del docente. Cierre: Portafolio digital de dibujos proyectados para la retroalimentación grupal."
        }
      ],
      "2°": [
        {
          "id": "sis-2-3-1",
          "topic": "Introducción al procesador de textos (Word / WordPad): Entorno de trabajo y escritura básica",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce la ventana del procesador de textos y escribe párrafos cortos aplicando signos de puntuación.",
          "suggestedSequence": "Inicio: Comparación entre escribir a mano en una hoja y escribir en la pantalla de Word. Desarrollo: Reconocimiento del cursor parpadeante, barra de herramientas y hoja en blanco de trabajo. Cierre: Redacción de una pequeña anécdota personal de tres renglones."
        },
        {
          "id": "sis-2-3-2",
          "topic": "Edición y formato de texto: Tipo de letra (fuente), tamaño, color, negrita, cursiva y subrayado",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Modifica la apariencia del texto seleccionado cambiando fuente, tamaño, estilo y color de manera armónica.",
          "suggestedSequence": "Inicio: Observación de titulares de revistas con diferentes tipografías llamativas. Desarrollo: Selección de texto con el mouse y aplicación de botones: Negrita (N), Cursiva (K), Subrayado (S) y colores. Cierre: Ejercicio de personalización de un poema escolar con distintos formatos."
        },
        {
          "id": "sis-2-3-3",
          "topic": "Alineación de párrafos e inserción de imágenes sencillas",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Aplica alineaciones (izquierda, centrada, derecha) e inserta imágenes ilustrativas en sus escritos.",
          "suggestedSequence": "Inicio: Explicación de por qué los títulos van centrados y los textos a la izquierda. Desarrollo: Práctica de alineación y uso del menú Insertar -> Imágenes para acompañar la redacción. Cierre: Creación de una tarjeta de felicitación con título centrado, mensaje e imagen decorativa."
        }
      ],
      "3°": [
        {
          "id": "sis-3-3-1",
          "topic": "Pensamiento computacional: Concepto de algoritmo en la vida diaria (pasos ordenados)",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Identifica que un algoritmo es una secuencia lógica de pasos finitos y ordenados para resolver un problema.",
          "suggestedSequence": "Inicio: Instrucciones para cepillarse los dientes o preparar un sándwich de mermelada paso a paso. Desarrollo: Descomposición de tareas cotidianas en instrucciones secuenciales precisas sin omitir detalles. Cierre: Juego de 'robot humano': un estudiante da órdenes exactas a otro para cruzar un camino con obstáculos."
        },
        {
          "id": "sis-3-3-2",
          "topic": "Programación por bloques con Scratch / Code.org: Entorno, personajes (sprites) y movimiento",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce la interfaz de Scratch y programa el desplazamiento y cambio de apariencia de personajes.",
          "suggestedSequence": "Inicio: Presentación del gato de Scratch y del escenario interactivo. Desarrollo: Arrastre y encaje de bloques de movimiento (mover 10 pasos, girar 15 grados) y apariencia (cambiar disfraz). Cierre: Programación de un personaje que camina por el escenario de un extremo a otro."
        },
        {
          "id": "sis-3-3-3",
          "topic": "Eventos y sonido en la programación: Al presionar bandera verde y teclas",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Utiliza bloques de eventos para iniciar programas y reproducir efectos de sonido sincronizados.",
          "suggestedSequence": "Inicio: Explicación de cómo responde un videojuego cuando oprimimos un botón en el control. Desarrollo: Uso de eventos 'al presionar bandera verde' y 'al presionar tecla espacio' con bloques de sonido. Cierre: Creación de una pequeña animación musical donde los personajes bailan y emiten sonidos."
        }
      ],
      "4°": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "5°": [
        {
          "id": "sis-5-3-1",
          "topic": "Variables y listas en programación por bloques: Acumuladores y contadores",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Utiliza variables y listas para almacenar y procesar datos dinámicos en algoritmos de Scratch.",
          "suggestedSequence": "Inicio: ¿Cómo guarda un programa el nombre del jugador o el inventario de objetos en un juego? Desarrollo: Creación de listas de elementos y manipulación con bloques de añadir, eliminar y consultar longitud. Cierre: Programación de un juego de preguntas y respuestas que registra el nombre y puntaje acumulado."
        },
        {
          "id": "sis-5-3-2",
          "topic": "Operadores matemáticos y lógicos (Y, O, NO, >, <, =) en algoritmos",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Construye condiciones compuestas utilizando operadores booleanos y comparadores en la toma de decisiones.",
          "suggestedSequence": "Inicio: Ejemplos de condiciones dobles: 'Si tienes más de 10 años Y tienes el boleto, puedes entrar'. Desarrollo: Uso de operadores verdes en Scratch combinando comparaciones (<, >, =) con operadores lógicos. Cierre: Creación de un algoritmo de validación de contraseña con múltiples requisitos."
        },
        {
          "id": "sis-5-3-3",
          "topic": "Mensajes entre personajes y sincronización de escenas interactivas",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Sincroniza acciones y cambios de escenario mediante el envío y recepción de mensajes de difusión.",
          "suggestedSequence": "Inicio: Metáfora de una obra de teatro: un actor entra cuando otro le da el pie (mensaje). Desarrollo: Uso de bloques 'enviar mensaje [evento]' y 'al recibir [evento]' para coordinar diálogos y fondos. Cierre: Proyecto de animación de una fábula con dos personajes dialogando en diferentes escenarios."
        }
      ],
      "6°": [
        {
          "id": "sis-6-3-1",
          "topic": "Principios del diseño gráfico digital: Teoría del color, tipografía y composición visual",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Aplica principios de contraste, jerarquía visual y psicología del color en la creación de piezas gráficas.",
          "suggestedSequence": "Inicio: Análisis de afiches publicitarios profesionales: qué colores llaman la atención y qué fuentes son legibles. Desarrollo: Círculo cromático, colores complementarios, fuentes sans-serif vs. serif y retículas de composición. Cierre: Diseño de un póster publicitario o banner escolar aplicando Canva o software gráfico."
        },
        {
          "id": "sis-6-3-2",
          "topic": "Edición de audio digital con Audacity: Grabación de voz, efectos y mezcla de pistas",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Graba y edita pistas de audio digital aplicando recortes, normalización, reducción de ruido y música de fondo.",
          "suggestedSequence": "Inicio: Escucha de un podcast profesional identificando la locución limpia y la música de fondo. Desarrollo: Grabación de locución en Audacity, eliminación de ruido de fondo, fade in / fade out y exportación a MP3. Cierre: Producción en parejas de una cápsula radial escolar de 2 minutos sobre un tema pedagógico."
        },
        {
          "id": "sis-6-3-3",
          "topic": "Montaje y edición de video con Clipchamp / CapCut: Línea de tiempo, transiciones y títulos",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Produce piezas audiovisuales cortas integrando clips de video, audios, títulos animados y transiciones.",
          "suggestedSequence": "Inicio: Concepto de guión técnico y línea de tiempo (timeline) en la producción audiovisual. Desarrollo: Importación de clips, corte de secuencias innecesarias, inserción de títulos y renderizado final. Cierre: Proyección y retroalimentación colectiva de los videos educativos creados."
        }
      ],
      "7°": [
        {
          "id": "sis-7-3-1",
          "topic": "Fundamentos de electricidad y electrónica: Voltaje, corriente, resistencia y ley de Ohm",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Calcula magnitudes eléctricas básicas aplicando la ley de Ohm (V = I * R) y reconoce su aplicación en circuitos.",
          "suggestedSequence": "Inicio: Analogía hidráulica: el voltaje como presión de agua, la corriente como caudal y la resistencia como estrechamiento. Desarrollo: Fórmulas de la ley de Ohm y cálculo del resistor adecuado para no quemar un diodo LED. Cierre: Resolución de problemas numéricos de circuitos simples y verificación con multímetro virtual."
        },
        {
          "id": "sis-7-3-2",
          "topic": "Introducción a placas controladoras programables: Arquitectura de Arduino / micro:bit",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Identifica los pines digitales, analógicos y de alimentación en placas microcontroladoras programables.",
          "suggestedSequence": "Inicio: El microcontrolador como cerebro programable que conecta el mundo digital con el mundo real. Desarrollo: Entorno de programación por bloques y texto; estructura de un programa: configuración inicial (setup) y bucle infinito (loop). Cierre: Conexión y programación de un parpadeo de LED (Blink) modificando tiempos de retardo."
        },
        {
          "id": "sis-7-3-3",
          "topic": "Control de actuadores: Servomotores, motores DC y zumbadores (buzzers)",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Programa actuadores electromecánicos para generar movimientos angulares precisos y alertas sonoras.",
          "suggestedSequence": "Inicio: ¿Cómo se mueve el timón de un barco o la barrera de un estacionamiento? Introducción al servomotor. Desarrollo: Control angular de servomotores (0° a 180°) y modulación PWM para variar tonos en un buzzer. Cierre: Montaje y programación de una talanquera automática que pita y se levanta al presionar un botón."
        },
        {
          "id": "sis-7-3-4",
          "topic": "Integración de sensores de luz, temperatura y distancia ultrasónica (HC-SR04)",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Lee e interpreta datos de sensores ultrasónicos y de luz para programar respuestas automáticas del sistema.",
          "suggestedSequence": "Inicio: Principio de ecolocalización de los murciélagos para entender el sensor ultrasónico HC-SR04. Desarrollo: Cálculo de distancia por tiempo de eco (d = v * t / 2) y programación de umbrales de proximidad. Cierre: Prototipo de sensor de reversa vehicular con advertencia de luz y sonido según la cercanía."
        }
      ],
      "8°": [
        {
          "id": "sis-8-3-1",
          "topic": "Introducción a la programación textual en Python: Sintaxis, variables y tipos de datos",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Escribe programas estructurados en Python utilizando variables tipadas, operadores y funciones de entrada/salida.",
          "suggestedSequence": "Inicio: Transición del código en bloques de Scratch al código textual en Python: ventajas y legibilidad. Desarrollo: Instalación de entorno (Thonny / VS Code), tipos de datos (int, float, str, bool), print() e input(). Cierre: Programa interactivo que solicita datos al usuario, realiza cálculos y muestra el resultado formateado."
        },
        {
          "id": "sis-8-3-2",
          "topic": "Estructuras condicionales en Python (if, elif, else) aplicadas a la toma de decisiones",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Implementa bifurcaciones lógicas complejas con if-elif-else respetando la indentación obligatoria de Python.",
          "suggestedSequence": "Inicio: La importancia de la indentación (sangría) en Python como delimitador de bloques de código. Desarrollo: Operadores relacionales y lógicos (and, or, not) evaluando condiciones múltiples en situaciones reales. Cierre: Algoritmo de clasificación de notas académicas y recomendaciones personalizadas."
        },
        {
          "id": "sis-8-3-3",
          "topic": "Estructuras cíclicas (bucles while y for) y procesamiento de listas de datos",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Automatiza tareas repetitivas mediante ciclos while y bucles for con la función range() y listas.",
          "suggestedSequence": "Inicio: ¿Cómo imprimir los números del 1 al 1000 en 3 líneas de código? Introducción a los bucles. Desarrollo: Sintaxis de for i in range(inicio, fin, paso) y bucle while con condición de parada para evitar ciclos infinitos. Cierre: Programa que calcula la media y varianza de una lista de datos numéricos ingresados por el usuario."
        }
      ]
    },
    "Tecnología": {
      "1°": [
        {
          "id": "sis-1-3-1",
          "topic": "Explorando el programa Paint: El lienzo digital y la barra de herramientas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Reconoce la interfaz del programa de dibujo Paint identificando el área de trabajo y la barra de opciones.",
          "suggestedSequence": "Inicio: Apertura del programa Paint desde el menú de inicio guiados por el docente. Desarrollo: Exploración libre de la ventana: barra de título, lienzo en blanco y paleta de colores. Cierre: Realización del primer trazo libre en la pantalla y cambio de color."
        },
        {
          "id": "sis-1-3-2",
          "topic": "Herramientas de dibujo en Paint: Lápiz, pinceles, borrador y figuras geométricas básicas",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Utiliza herramientas de lápiz, pincel, borrador y figuras geométricas para crear composiciones gráficas sencillas.",
          "suggestedSequence": "Inicio: Demostración del uso de formas geométricas (círculo, cuadrado, triángulo) para dibujar una casa. Desarrollo: Práctica guiada combinando formas y usando el bote de pintura para rellenar con color. Cierre: Exposición en pantalla de los dibujos de casas y paisajes creados por los estudiantes."
        },
        {
          "id": "sis-1-3-3",
          "topic": "El teclado: Reconocimiento de letras, números, barra espaciadora y tecla Enter",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Localiza en el teclado las letras de su nombre, los dígitos numéricos, el espaciador y el salto de línea.",
          "suggestedSequence": "Inicio: Búsqueda tipo 'caza del tesoro' de las vocales en el teclado del computador. Desarrollo: Identificación de la barra espaciadora para separar palabras y la tecla Enter para bajar de renglón. Cierre: Escritura de su nombre completo y edad en el procesador de notas infantiles."
        },
        {
          "id": "sis-1-3-4",
          "topic": "Creación y guardado de dibujos digitales expresando ideas y emociones",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Diseña ilustraciones digitales creativas y aprende los pasos guiados para guardar su trabajo en el computador.",
          "suggestedSequence": "Inicio: Diálogo sobre cómo se sienten hoy y qué dibujo representa su emoción. Desarrollo: Creación del dibujo en Paint y práctica del comando Archivo -> Guardar con ayuda del docente. Cierre: Portafolio digital de dibujos proyectados para la retroalimentación grupal."
        }
      ],
      "2°": [
        {
          "id": "sis-2-3-1",
          "topic": "Introducción al procesador de textos (Word / WordPad): Entorno de trabajo y escritura básica",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce la ventana del procesador de textos y escribe párrafos cortos aplicando signos de puntuación.",
          "suggestedSequence": "Inicio: Comparación entre escribir a mano en una hoja y escribir en la pantalla de Word. Desarrollo: Reconocimiento del cursor parpadeante, barra de herramientas y hoja en blanco de trabajo. Cierre: Redacción de una pequeña anécdota personal de tres renglones."
        },
        {
          "id": "sis-2-3-2",
          "topic": "Edición y formato de texto: Tipo de letra (fuente), tamaño, color, negrita, cursiva y subrayado",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Modifica la apariencia del texto seleccionado cambiando fuente, tamaño, estilo y color de manera armónica.",
          "suggestedSequence": "Inicio: Observación de titulares de revistas con diferentes tipografías llamativas. Desarrollo: Selección de texto con el mouse y aplicación de botones: Negrita (N), Cursiva (K), Subrayado (S) y colores. Cierre: Ejercicio de personalización de un poema escolar con distintos formatos."
        },
        {
          "id": "sis-2-3-3",
          "topic": "Alineación de párrafos e inserción de imágenes sencillas",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Aplica alineaciones (izquierda, centrada, derecha) e inserta imágenes ilustrativas en sus escritos.",
          "suggestedSequence": "Inicio: Explicación de por qué los títulos van centrados y los textos a la izquierda. Desarrollo: Práctica de alineación y uso del menú Insertar -> Imágenes para acompañar la redacción. Cierre: Creación de una tarjeta de felicitación con título centrado, mensaje e imagen decorativa."
        }
      ],
      "3°": [
        {
          "id": "sis-3-3-1",
          "topic": "Pensamiento computacional: Concepto de algoritmo en la vida diaria (pasos ordenados)",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Identifica que un algoritmo es una secuencia lógica de pasos finitos y ordenados para resolver un problema.",
          "suggestedSequence": "Inicio: Instrucciones para cepillarse los dientes o preparar un sándwich de mermelada paso a paso. Desarrollo: Descomposición de tareas cotidianas en instrucciones secuenciales precisas sin omitir detalles. Cierre: Juego de 'robot humano': un estudiante da órdenes exactas a otro para cruzar un camino con obstáculos."
        },
        {
          "id": "sis-3-3-2",
          "topic": "Programación por bloques con Scratch / Code.org: Entorno, personajes (sprites) y movimiento",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce la interfaz de Scratch y programa el desplazamiento y cambio de apariencia de personajes.",
          "suggestedSequence": "Inicio: Presentación del gato de Scratch y del escenario interactivo. Desarrollo: Arrastre y encaje de bloques de movimiento (mover 10 pasos, girar 15 grados) y apariencia (cambiar disfraz). Cierre: Programación de un personaje que camina por el escenario de un extremo a otro."
        },
        {
          "id": "sis-3-3-3",
          "topic": "Eventos y sonido en la programación: Al presionar bandera verde y teclas",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Utiliza bloques de eventos para iniciar programas y reproducir efectos de sonido sincronizados.",
          "suggestedSequence": "Inicio: Explicación de cómo responde un videojuego cuando oprimimos un botón en el control. Desarrollo: Uso de eventos 'al presionar bandera verde' y 'al presionar tecla espacio' con bloques de sonido. Cierre: Creación de una pequeña animación musical donde los personajes bailan y emiten sonidos."
        }
      ],
      "4°": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-3-1",
          "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
          "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
          "id": "sis-4-3-2",
          "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
          "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
          "id": "sis-4-3-3",
          "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
      ],
      "5°": [
        {
          "id": "sis-5-3-1",
          "topic": "Variables y listas en programación por bloques: Acumuladores y contadores",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Utiliza variables y listas para almacenar y procesar datos dinámicos en algoritmos de Scratch.",
          "suggestedSequence": "Inicio: ¿Cómo guarda un programa el nombre del jugador o el inventario de objetos en un juego? Desarrollo: Creación de listas de elementos y manipulación con bloques de añadir, eliminar y consultar longitud. Cierre: Programación de un juego de preguntas y respuestas que registra el nombre y puntaje acumulado."
        },
        {
          "id": "sis-5-3-2",
          "topic": "Operadores matemáticos y lógicos (Y, O, NO, >, <, =) en algoritmos",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Construye condiciones compuestas utilizando operadores booleanos y comparadores en la toma de decisiones.",
          "suggestedSequence": "Inicio: Ejemplos de condiciones dobles: 'Si tienes más de 10 años Y tienes el boleto, puedes entrar'. Desarrollo: Uso de operadores verdes en Scratch combinando comparaciones (<, >, =) con operadores lógicos. Cierre: Creación de un algoritmo de validación de contraseña con múltiples requisitos."
        },
        {
          "id": "sis-5-3-3",
          "topic": "Mensajes entre personajes y sincronización de escenas interactivas",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Sincroniza acciones y cambios de escenario mediante el envío y recepción de mensajes de difusión.",
          "suggestedSequence": "Inicio: Metáfora de una obra de teatro: un actor entra cuando otro le da el pie (mensaje). Desarrollo: Uso de bloques 'enviar mensaje [evento]' y 'al recibir [evento]' para coordinar diálogos y fondos. Cierre: Proyecto de animación de una fábula con dos personajes dialogando en diferentes escenarios."
        }
      ],
      "6°": [
        {
          "id": "sis-6-3-1",
          "topic": "Principios del diseño gráfico digital: Teoría del color, tipografía y composición visual",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Aplica principios de contraste, jerarquía visual y psicología del color en la creación de piezas gráficas.",
          "suggestedSequence": "Inicio: Análisis de afiches publicitarios profesionales: qué colores llaman la atención y qué fuentes son legibles. Desarrollo: Círculo cromático, colores complementarios, fuentes sans-serif vs. serif y retículas de composición. Cierre: Diseño de un póster publicitario o banner escolar aplicando Canva o software gráfico."
        },
        {
          "id": "sis-6-3-2",
          "topic": "Edición de audio digital con Audacity: Grabación de voz, efectos y mezcla de pistas",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Graba y edita pistas de audio digital aplicando recortes, normalización, reducción de ruido y música de fondo.",
          "suggestedSequence": "Inicio: Escucha de un podcast profesional identificando la locución limpia y la música de fondo. Desarrollo: Grabación de locución en Audacity, eliminación de ruido de fondo, fade in / fade out y exportación a MP3. Cierre: Producción en parejas de una cápsula radial escolar de 2 minutos sobre un tema pedagógico."
        },
        {
          "id": "sis-6-3-3",
          "topic": "Montaje y edición de video con Clipchamp / CapCut: Línea de tiempo, transiciones y títulos",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Produce piezas audiovisuales cortas integrando clips de video, audios, títulos animados y transiciones.",
          "suggestedSequence": "Inicio: Concepto de guión técnico y línea de tiempo (timeline) en la producción audiovisual. Desarrollo: Importación de clips, corte de secuencias innecesarias, inserción de títulos y renderizado final. Cierre: Proyección y retroalimentación colectiva de los videos educativos creados."
        }
      ],
      "7°": [
        {
          "id": "sis-7-3-1",
          "topic": "Fundamentos de electricidad y electrónica: Voltaje, corriente, resistencia y ley de Ohm",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Calcula magnitudes eléctricas básicas aplicando la ley de Ohm (V = I * R) y reconoce su aplicación en circuitos.",
          "suggestedSequence": "Inicio: Analogía hidráulica: el voltaje como presión de agua, la corriente como caudal y la resistencia como estrechamiento. Desarrollo: Fórmulas de la ley de Ohm y cálculo del resistor adecuado para no quemar un diodo LED. Cierre: Resolución de problemas numéricos de circuitos simples y verificación con multímetro virtual."
        },
        {
          "id": "sis-7-3-2",
          "topic": "Introducción a placas controladoras programables: Arquitectura de Arduino / micro:bit",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Identifica los pines digitales, analógicos y de alimentación en placas microcontroladoras programables.",
          "suggestedSequence": "Inicio: El microcontrolador como cerebro programable que conecta el mundo digital con el mundo real. Desarrollo: Entorno de programación por bloques y texto; estructura de un programa: configuración inicial (setup) y bucle infinito (loop). Cierre: Conexión y programación de un parpadeo de LED (Blink) modificando tiempos de retardo."
        },
        {
          "id": "sis-7-3-3",
          "topic": "Control de actuadores: Servomotores, motores DC y zumbadores (buzzers)",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Programa actuadores electromecánicos para generar movimientos angulares precisos y alertas sonoras.",
          "suggestedSequence": "Inicio: ¿Cómo se mueve el timón de un barco o la barrera de un estacionamiento? Introducción al servomotor. Desarrollo: Control angular de servomotores (0° a 180°) y modulación PWM para variar tonos en un buzzer. Cierre: Montaje y programación de una talanquera automática que pita y se levanta al presionar un botón."
        },
        {
          "id": "sis-7-3-4",
          "topic": "Integración de sensores de luz, temperatura y distancia ultrasónica (HC-SR04)",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Lee e interpreta datos de sensores ultrasónicos y de luz para programar respuestas automáticas del sistema.",
          "suggestedSequence": "Inicio: Principio de ecolocalización de los murciélagos para entender el sensor ultrasónico HC-SR04. Desarrollo: Cálculo de distancia por tiempo de eco (d = v * t / 2) y programación de umbrales de proximidad. Cierre: Prototipo de sensor de reversa vehicular con advertencia de luz y sonido según la cercanía."
        }
      ],
      "8°": [
        {
          "id": "sis-8-3-1",
          "topic": "Introducción a la programación textual en Python: Sintaxis, variables y tipos de datos",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Escribe programas estructurados en Python utilizando variables tipadas, operadores y funciones de entrada/salida.",
          "suggestedSequence": "Inicio: Transición del código en bloques de Scratch al código textual en Python: ventajas y legibilidad. Desarrollo: Instalación de entorno (Thonny / VS Code), tipos de datos (int, float, str, bool), print() e input(). Cierre: Programa interactivo que solicita datos al usuario, realiza cálculos y muestra el resultado formateado."
        },
        {
          "id": "sis-8-3-2",
          "topic": "Estructuras condicionales en Python (if, elif, else) aplicadas a la toma de decisiones",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Implementa bifurcaciones lógicas complejas con if-elif-else respetando la indentación obligatoria de Python.",
          "suggestedSequence": "Inicio: La importancia de la indentación (sangría) en Python como delimitador de bloques de código. Desarrollo: Operadores relacionales y lógicos (and, or, not) evaluando condiciones múltiples en situaciones reales. Cierre: Algoritmo de clasificación de notas académicas y recomendaciones personalizadas."
        },
        {
          "id": "sis-8-3-3",
          "topic": "Estructuras cíclicas (bucles while y for) y procesamiento de listas de datos",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Automatiza tareas repetitivas mediante ciclos while y bucles for con la función range() y listas.",
          "suggestedSequence": "Inicio: ¿Cómo imprimir los números del 1 al 1000 en 3 líneas de código? Introducción a los bucles. Desarrollo: Sintaxis de for i in range(inicio, fin, paso) y bucle while con condición de parada para evitar ciclos infinitos. Cierre: Programa que calcula la media y varianza de una lista de datos numéricos ingresados por el usuario."
        }
      ]
    }
  },
  "4°": {
    "Matemáticas": {
      "7°": [
        {
          "id": "mat-7-4-1",
          "topic": "Recolección y organización de datos: Tipos de datos cualitativos y cuantitativos",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Clasifica variables estadísticas en cualitativas (nominales, ordinales) y cuantitativas (discretas, continuas) diseñando instrumentos de recolección.",
          "suggestedSequence": "Inicio: Lluvia de ideas sobre variables escolares (estatura, color favorito, estrato, notas). Desarrollo: Clasificación formal de tipos de variables y diseño de una encuesta estructurada. Cierre: Aplicación de la encuesta diseñada a una muestra representativa de compañeros."
        },
        {
          "id": "mat-7-4-2",
          "topic": "Tablas de frecuencia y representación gráfica: Barras, sectores circulares y pictogramas",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Construye tablas de frecuencias absolutas, relativas y acumuladas, elaborando diagramas de barras y circulares con escala correcta.",
          "suggestedSequence": "Inicio: Tabulación manual de los datos recolectados en la encuesta de aula. Desarrollo: Cálculo de frecuencias relativas, porcentajes y ángulos para diagramas de sectores (f * 360° / N). Cierre: Elaboración precisa de diagramas circulares y de barras con rotulación completa."
        },
        {
          "id": "mat-7-4-3",
          "topic": "Uso de herramientas digitales para organizar información estadística",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Utiliza hojas de cálculo digitales para tabular datos, aplicar fórmulas estadísticas y generar gráficos dinámicos.",
          "suggestedSequence": "Inicio: Demostración en proyector de ingreso de datos en Excel / Google Sheets. Desarrollo: Creación de tablas de frecuencias automáticas y generación de gráficos con software. Cierre: Práctica individual en computadores organizando y graficando un conjunto de datos."
        },
        {
          "id": "mat-7-4-4",
          "topic": "Identificación de errores y sesgos en la recolección y lectura de datos",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Evalúa críticamente estudios estadísticos reconociendo sesgos muestrales, preguntas tendenciosas y distorsiones visuales en gráficos.",
          "suggestedSequence": "Inicio: Comparación entre dos encuestas sobre el mismo tema con resultados contradictorios. Desarrollo: Criterios de representatividad de la muestra y tamaño muestral adecuado. Cierre: Debate grupal sobre la ética en el manejo y divulgación de información estadística."
        },
        {
          "id": "mat-7-4-5",
          "topic": "Medidas de tendencia central: Media aritmética, mediana y moda en toma de decisiones",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Calcula e interpreta la media, la mediana y la moda para datos no agrupados, justificando cuál es la más apropiada según la distribución.",
          "suggestedSequence": "Inicio: Caso de estudio con valores atípicos (outliers) que distorsionan el promedio. Desarrollo: Algoritmos de cálculo de media, ordenamiento para mediana y frecuencia máxima para moda. Cierre: Taller de toma de decisiones comparando las tres medidas en situaciones del colegio."
        },
        {
          "id": "mat-7-4-6",
          "topic": "Lectura e interpretación crítica de gráficos y tablas de información",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Interpreta y comunica conclusiones cuantitativas a partir del análisis de tablas y gráficas estadísticas en informes académicos.",
          "suggestedSequence": "Inicio: Presentación de informes reales del DANE o del sector salud. Desarrollo: Formulación de hipótesis, tendencias y predicciones fundamentadas en las gráficas. Cierre: Elaboración de un informe escrito individual sintetizando las conclusiones del estudio."
        },
        {
          "id": "mat-7-4-7",
          "topic": "Concepto de evento, espacio muestral y tipos de sucesos aleatorios",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Distingue entre experimentos deterministas y aleatorios, determinando el espacio muestral y clasificando eventos en seguros, probables e imposibles.",
          "suggestedSequence": "Inicio: Comparación entre soltar una piedra (determinista) y lanzar un dado (aleatorio). Desarrollo: Diagramas de árbol y listas para determinar todos los resultados posibles (espacio muestral S). Cierre: Clasificación de eventos propuestos por los estudiantes justificando su categorización."
        },
        {
          "id": "mat-7-4-8",
          "topic": "Cálculo de probabilidades simples mediante la regla de Laplace",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Aplica la regla de Laplace para calcular la probabilidad teórica de eventos simples y la expresa en forma de fracción, decimal y porcentaje.",
          "suggestedSequence": "Inicio: Juego con barajas y urnas con balotas de colores. Desarrollo: Formalización de la fórmula P(A) = número de casos favorables / número de casos posibles. Cierre: Taller aplicativo resolviendo problemas de probabilidad en juegos de mesa y rifas."
        },
        {
          "id": "mat-7-4-9",
          "topic": "Estimación, predicción y relación entre frecuencia relativa y probabilidad",
          "dba": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
          "achievement": "Comprende la ley de los grandes números comprobando que a mayor número de ensayos la frecuencia relativa se aproxima a la probabilidad teórica.",
          "suggestedSequence": "Inicio: Registro acumulado de 100 lanzamientos de moneda entre todos los estudiantes. Desarrollo: Gráfica de convergencia de la frecuencia relativa hacia el valor teórico 0.5. Cierre: Taller de síntesis sobre el papel de la probabilidad en la ciencia y la vida diaria."
        }
      ],
      "3°": [
        {
          "id": "mat-3-4-1",
          "topic": "Unidades de medida de longitud: El metro, centímetro y milímetro (medición y estimación)",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Realiza mediciones y estimaciones de longitud utilizando el metro, decímetro y centímetro con instrumentos adecuados.",
          "suggestedSequence": "Inicio: Medición con la palma de la mano vs. la cinta métrica para evidenciar la necesidad de medidas universales. Desarrollo: Equivalencias básicas (1 m = 100 cm, 1 cm = 10 mm) y uso correcto de la regla. Cierre: Taller de medición de objetos del aula registrando datos en tablas."
        },
        {
          "id": "mat-3-4-2",
          "topic": "Medición de masa y peso (kilogramo, gramo) y capacidad (litro, medio litro)",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Compara masas y volúmenes utilizando balanzas, jarras graduadas y recipientes en situaciones de la vida diaria.",
          "suggestedSequence": "Inicio: Sopesar objetos de diferente tamaño para cuestionar si lo más grande siempre es lo más pesado. Desarrollo: Unidades de masa (kg, g) y de capacidad (litro, medio litro, cuarto de litro). Cierre: Práctica experimental trasvasando agua en recipientes graduados."
        },
        {
          "id": "mat-3-4-3",
          "topic": "El tiempo: Lectura del reloj análogo y digital, horas, minutos y calendario (días, meses, años)",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Lee la hora en relojes análogos y digitales y calcula duraciones de eventos utilizando el calendario escolar.",
          "suggestedSequence": "Inicio: Fabricación de un reloj de cartón con manecillas móviles de horario y minutero. Desarrollo: Lectura de la hora en punto, y media, y cuarto y menos cuarto; equivalencias (1 h = 60 min). Cierre: Resolución de situaciones problema sobre horarios de salida, recreo y transporte."
        },
        {
          "id": "mat-3-4-4",
          "topic": "Noción de perímetro en figuras planas sencillas",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Calcula el perímetro de polígonos sumando las longitudes de sus lados en contextos de cercado y enmarcado.",
          "suggestedSequence": "Inicio: Recorrido caminando por el borde de la cancha de microfútbol contando pasos. Desarrollo: Definición formal de perímetro como la suma de las longitudes de todos los lados. Cierre: Taller de cálculo de perímetros de figuras poligonales en papel cuadriculado."
        },
        {
          "id": "mat-3-4-5",
          "topic": "Recolección, clasificación y organización de datos en tablas de conteo",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Recolecta información de su grupo escolar y la organiza en tablas de conteo con marcas y totales numéricos.",
          "suggestedSequence": "Inicio: Votación en el aula para elegir la actividad deportiva preferida. Desarrollo: Registro de datos en una tabla de conteo utilizando rayas y frecuencias numéricas. Cierre: Lectura e interpretación de los datos tabulados respondiendo preguntas clave."
        },
        {
          "id": "mat-3-4-6",
          "topic": "Construcción e interpretación de pictogramas y diagramas de barras con escala",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Construye e interpreta pictogramas y gráficos de barras asignando valores a cada símbolo o unidad de escala.",
          "suggestedSequence": "Inicio: Explicación de pictogramas donde un dibujo representa más de una unidad (ej. un libro = 5 lecturas). Desarrollo: Trazado de diagramas de barras verticales y horizontales con escala definida. Cierre: Taller de interpretación de gráficas y redacción de conclusiones sencillas."
        },
        {
          "id": "mat-3-4-7",
          "topic": "Nociones básicas de probabilidad: Eventos seguros, posibles e imposibles",
          "dba": "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones.",
          "achievement": "Distingue situaciones aleatorias clasificando eventos en seguros, posibles o imposibles según el contexto.",
          "suggestedSequence": "Inicio: Preguntas sobre el clima y juegos: ¿Es seguro que mañana llueva? ¿Es posible sacar un 7 en un dado? Desarrollo: Conceptualización de sucesos seguros, probables e imposibles con ejemplos concretos. Cierre: Clasificación de enunciados y juegos con fichas de colores en bolsas oscuras."
        }
      ],
      "2°": [
        {
          "id": "mat-2-4-1",
          "topic": "Noción de reparto equitativo y división como distribución en partes iguales",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Comprende el sentido de la división como un reparto en cantidades exactamente iguales sin que sobre nada.",
          "suggestedSequence": "Inicio: Reparto vivencial de galletas o fichas entre dos, tres o cuatro estudiantes equitativamente. Desarrollo: Representación gráfica de repartos y traducción a la idea de 'cuántas veces cabe'. Cierre: Taller de dibujo repartiendo colecciones de objetos en cajas o canastas."
        },
        {
          "id": "mat-2-4-2",
          "topic": "Mitad, tercera y cuarta parte de una cantidad o conjunto",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Calcula la mitad, tercera y cuarta parte de colecciones pequeñas de objetos mediante división en grupos iguales.",
          "suggestedSequence": "Inicio: Plegado de papel en 2 y 4 partes iguales para observar mitades y cuartas partes. Desarrollo: Cálculo de la mitad (dividir entre 2) y la tercera parte (dividir entre 3) de números pares y múltiplos. Cierre: Ejercicios aplicativos de reparto de frutas y caramelos en el cuaderno."
        },
        {
          "id": "mat-2-4-3",
          "topic": "Problemas sencillos de reparto sin residuo en situaciones familiares y de aula",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Resuelve situaciones problemáticas de reparto equitativo explicando el procedimiento utilizado.",
          "suggestedSequence": "Inicio: Planteamiento de una situación de juego en equipos iguales para el recreo. Desarrollo: Paso a paso para repartir cantidades exactas verificando que todos tengan lo mismo. Cierre: Redacción de respuestas a problemas de reparto en equipos colaborativos."
        },
        {
          "id": "mat-2-4-4",
          "topic": "Recolección y registro de información mediante encuestas sencillas",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Formula preguntas sencillas para recoger datos de interés entre sus compañeros de clase.",
          "suggestedSequence": "Inicio: Elección del color favorito del grupo para ambientar el aula. Desarrollo: Registro de respuestas en una lista ordenada anotando los nombres o marcas. Cierre: Conteo del total de participantes de la encuesta."
        },
        {
          "id": "mat-2-4-5",
          "topic": "Organización de datos en tablas de conteo y frecuencias simples",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Organiza datos recolectados en tablas de conteo utilizando marcas y totales numéricos comprensibles.",
          "suggestedSequence": "Inicio: Agrupación de marcas de conteo en grupos de 5 (cuatro palitos y uno cruzado). Desarrollo: Construcción de la tabla de frecuencias con columna de variable, conteo y total. Cierre: Taller de tabulación de datos sobre animales preferidos o deportes."
        },
        {
          "id": "mat-2-4-6",
          "topic": "Lectura y elaboración de pictogramas y gráficos de barras elementales",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Interpreta y dibuja pictogramas y diagramas de barras sencillos para comunicar la información recopilada.",
          "suggestedSequence": "Inicio: Observación de un pictograma de soles y nubes para registrar el clima de la semana. Desarrollo: Coloreado de barras en papel cuadriculado donde cada cuadrito representa una persona. Cierre: Formulación de preguntas a partir de la gráfica: ¿Cuál tuvo más? ¿Cuál tuvo menos?"
        },
        {
          "id": "mat-2-4-7",
          "topic": "Nociones de eventos posibles e imposibles en el juego y la cotidianidad",
          "dba": "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.",
          "achievement": "Distingue acontecimientos posibles e imposibles en juegos y situaciones cotidianas.",
          "suggestedSequence": "Inicio: Diálogo reflexivo: ¿Es posible que un pez vuele? ¿Es posible que mañana salga el sol? Desarrollo: Clasificación de situaciones en tarjetas con las palabras 'posible' e 'imposible'. Cierre: Evaluación formativa mediante dramatizaciones cortas de situaciones lógicas."
        }
      ],
      "1°": [
        {
          "id": "mat-1-4-1",
          "topic": "La centena y números hasta el 999: lectura, escritura y valor posicional",
          "dba": "DBA: Comprende la centena como diez decenas y lee números de tres cifras.",
          "achievement": "Descompone números de tres cifras y realiza adiciones y sustracciones básicas con centenas."
        },
        {
          "id": "mat-1-4-2",
          "topic": "Geometría: Figuras geométricas bidimensionales (círculo, cuadrado, triángulo, rectángulo) y medición",
          "dba": "DBA: Clasifica y describe figuras geométricas según sus características básicas y mide longitudes con patrones sencillos.",
          "achievement": "Identifica formas geométricas en su entorno y compara longitudes utilizando patrones arbitrarios y estándar."
        }
      ],
      "4°": [
        {
          "id": "mat-4-4-1",
          "topic": "Números decimales: décimas y centésimas, lectura y comparación",
          "dba": "DBA: Comprende la relación entre fracciones decimales y números decimales en contextos monetarios y de medida.",
          "achievement": "Lee, escribe y ordena números decimales sencillos resolviendo problemas aditivos contextualizados."
        },
        {
          "id": "mat-4-4-2",
          "topic": "Medición y Geometría: Perímetro y área de rectángulos, cuadrados y triángulos",
          "dba": "DBA: Calcula el perímetro y el área de figuras geométricas utilizando unidades cuadradas.",
          "achievement": "Aplica fórmulas básicas de área y perímetro en la resolución de problemas de diseño y superficies."
        }
      ],
      "5°": [
        {
          "id": "mat-5-4-1",
          "topic": "Medidas de área, volumen, capacidad y masa: conversiones de unidades en el sistema métrico",
          "dba": "DBA: Selecciona y utiliza unidades apropiadas para medir volúmenes, capacidades y áreas.",
          "achievement": "Realiza conversiones entre múltiplos y submúltiplos del metro y calcula áreas y volúmenes de prismas rectos."
        },
        {
          "id": "mat-5-4-2",
          "topic": "Estadística y probabilidad: Lectura de diagramas de barras, circulares y medidas de tendencia central (media, moda)",
          "dba": "DBA: Interpreta información presentada en tablas y gráficos estadísticos y calcula la media y la moda.",
          "achievement": "Organiza datos en tablas de frecuencia y calcula la media aritmética y moda para formular conclusiones."
        }
      ],
      "6°": [
        {
          "id": "mat-6-4-1",
          "topic": "Números racionales (Q): fracciones y decimales positivos y negativos en la recta numérica",
          "dba": "DBA: Representa y opera con números racionales comprendiendo la relación entre fracciones y decimales.",
          "achievement": "Ubica racionales en la recta y resuelve problemas aditivos y multiplicativos con fracciones y decimales."
        },
        {
          "id": "mat-6-4-2",
          "topic": "Geometría: Rectas paralelas, perpendiculares y cálculo de perímetro y área de polígonos",
          "dba": "DBA: Clasifica polígonos regulares y calcula su perímetro y área justificando procedimientos.",
          "achievement": "Traza rectas paralelas y perpendiculares y calcula áreas de triángulos y cuadriláteros con precisión."
        }
      ],
      "8°": [
        {
          "id": "mat-8-4-1",
          "topic": "Máximo común divisor (MCD) y mínimo común múltiplo (MCM) de expresiones algebraicas",
          "dba": "DBA: Aplica la factorización para hallar el MCD y MCM en la simplificación de expresiones algebraicas.",
          "achievement": "Saber: Explica cómo obtener el MCD y MCM algebraico. Hacer: Descompone polinomios y halla múltiplos y divisores comunes."
        },
        {
          "id": "mat-8-4-2",
          "topic": "Fracciones algebraicas: simplificación y operaciones fundamentales (suma, resta, multiplicación y división)",
          "dba": "DBA: Opera con fracciones algebraicas aplicando factorización y propiedades de los números reales.",
          "achievement": "Saber: Reconoce fracciones homogéneas y heterogéneas. Hacer: Realiza adiciones y multiplicaciones de fracciones simplificando al máximo."
        },
        {
          "id": "mat-8-4-3",
          "topic": "Ecuaciones fraccionarias y despejes en situaciones modeladas",
          "dba": "DBA: Resuelve ecuaciones que involucran fracciones algebraicas interpretando la validez del dominio.",
          "achievement": "Saber: Identifica restricciones en los denominadores. Hacer: Despeja incógnitas en ecuaciones algebraicas complejas."
        },
        {
          "id": "mat-8-4-4",
          "topic": "Introducción a funciones lineales y afines (pendiente e intercepto) y cálculo de áreas sombreadas",
          "dba": "DBA: Describe y modela fenómenos mediante el uso de relaciones y funciones lineales y calcula áreas de figuras compuestas.",
          "achievement": "Saber: Identifica la pendiente y corte con el eje Y. Hacer: Grafica funciones lineales y calcula el área de regiones poligonales y circulares sombreadas."
        }
      ],
      "9°": [
        {
          "id": "mat-9-4-1",
          "topic": "Geometría: Teorema de Tales, semejanza de triángulos y áreas/volúmenes de cuerpos redondos",
          "dba": "DBA: Aplica criterios de semejanza de triángulos y calcula áreas y volúmenes de prismas, pirámides, cilindros y esferas.",
          "achievement": "Saber: Enuncia el Teorema de Tales. Hacer: Calcula volúmenes de cuerpos geométricos tridimensionales."
        },
        {
          "id": "mat-9-4-2",
          "topic": "Probabilidad: Espacio muestral, eventos simples, regla de Laplace y probabilidad compuesta",
          "dba": "DBA: Calcula la probabilidad de eventos simples y compuestos en experimentos aleatorios.",
          "achievement": "Saber: Define probabilidad clásica y espacio muestral. Hacer: Resuelve problemas de azar aplicando la regla de Laplace."
        }
      ],
      "10°": [
        {
          "id": "mat-10-4-1",
          "topic": "Secciones cónicas: La parábola y la elipse (ecuaciones canónicas, foco, directriz y vértices)",
          "dba": "DBA: Deduce las ecuaciones de la parábola y elipse a partir de su definición como lugar geométrico.",
          "achievement": "Saber: Identifica los elementos de una cónica. Hacer: Grafica parábolas y elipses a partir de su ecuación canónica."
        },
        {
          "id": "mat-10-4-2",
          "topic": "Secciones cónicas: La hipérbola y análisis combinatorio (permutaciones y combinaciones)",
          "dba": "DBA: Modela situaciones y resuelve problemas combinatorios distinguiendo entre permutación y combinación.",
          "achievement": "Saber: Aplica principios de conteo. Hacer: Calcula combinaciones y permutaciones en problemas de probabilidad."
        }
      ],
      "11°": [
        {
          "id": "mat-11-4-1",
          "topic": "Aplicaciones de la derivada: Criterio de la primera y segunda derivada, máximos, mínimos y puntos de inflexión",
          "dba": "DBA: Utiliza la derivada para optimizar funciones reales y determinar puntos críticos en situaciones de costo y volumen.",
          "achievement": "Saber: Explica qué es un máximo y mínimo local. Hacer: Resuelve problemas de optimización calculando derivadas sucesivas."
        },
        {
          "id": "mat-11-4-2",
          "topic": "Introducción al cálculo integral: Antiderivada, integral indefinida y área bajo la curva",
          "dba": "DBA: Comprende la integración como proceso inverso de la derivación para calcular acumulaciones y áreas.",
          "achievement": "Saber: Conoce las integrales inmediatas fundamentales. Hacer: Calcula antiderivadas básicas e interpreta el área bajo la curva."
        }
      ]
    },
    "Lógica": {
      "6°": [
        {
          "id": "log-6-4-1",
          "topic": "Análisis crítico de datos y detección de sesgos o falacias estadísticas en medios",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Analiza información estadística presentada en noticias y publicidad detectando sesgos, escalas distorsionadas y falacias.",
          "suggestedSequence": "Inicio: Exposición de gráficas publicitarias engañosas para debatir su impacto en el consumidor. Desarrollo: Identificación de muestras no representativas, correlaciones espurias y escalas truncadas. Cierre: Redacción de un informe crítico analizando una noticia con datos estadísticos."
        },
        {
          "id": "log-6-4-2",
          "topic": "Tablas de frecuencia y representación gráfica: Diagramas de barras, circulares y pictogramas",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Organiza datos en tablas de frecuencias absolutas y relativas, elaborando gráficos pertinentes para comunicar resultados.",
          "suggestedSequence": "Inicio: Realización de una encuesta rápida en el aula sobre hábitos escolares. Desarrollo: Construcción de tablas de distribución de frecuencias y diagramas de barras y sectores. Cierre: Exposición oral de las conclusiones derivadas de los gráficos construidos."
        },
        {
          "id": "log-6-4-3",
          "topic": "Medidas de tendencia central: Media aritmética, mediana y moda en toma de decisiones",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Calcula e interpreta la media, la mediana y la moda de un conjunto de datos para fundamentar decisiones objetivas.",
          "suggestedSequence": "Inicio: Análisis comparativo de promedios de calificaciones para evaluar el rendimiento grupal. Desarrollo: Procedimientos de cálculo para media, mediana y moda diferenciando su aplicabilidad. Cierre: Resolución de situaciones problema empresariales eligiendo la medida más representativa."
        },
        {
          "id": "log-6-4-4",
          "topic": "Lógica probabilística: Eventos seguros, posibles e imposibles, espacio muestral y regla de Laplace",
          "dba": "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace.",
          "achievement": "Determina el espacio muestral de un experimento aleatorio y calcula la probabilidad clásica mediante la regla de Laplace.",
          "suggestedSequence": "Inicio: Experimentos prácticos con monedas, dados y ruletas registrando frecuencias relativas. Desarrollo: Formalización del espacio muestral y cálculo de probabilidades simples P(A) = favorables / posibles. Cierre: Taller de cálculo de probabilidades aplicadas a juegos de azar y pronósticos cotidianos."
        }
      ]
    },
    "Sistemas": {
      "1°": [
        {
          "id": "sis-1-4-1",
          "topic": "¿Qué es internet y para qué sirve? La red que conecta al mundo",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Comprende de manera intuitiva que internet es una red mundial que permite consultar información y comunicarse.",
          "suggestedSequence": "Inicio: Metáfora de una gran telaraña invisible o biblioteca gigante que conecta a las personas. Desarrollo: Visualización de un mapa mundial interactivo mostrando conexiones y fotos de diferentes países. Cierre: Preguntas reflexivas: ¿A quién te gustaría escribirle o qué te gustaría aprender en internet?"
        },
        {
          "id": "sis-1-4-2",
          "topic": "Navegación básica en entornos educativos guiados y portales infantiles",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Navega por sitios web infantiles educativos utilizando enlaces, botones y flechas de avance y retroceso.",
          "suggestedSequence": "Inicio: Reconocimiento del ícono del navegador web (Google Chrome / Edge) y su función. Desarrollo: Navegación supervisada por plataformas educativas (Árbol ABC / Mundo Primaria). Cierre: Práctica haciendo clic en botones interactivos de actividades didácticas."
        },
        {
          "id": "sis-1-4-3",
          "topic": "Reglas de oro para el uso seguro de internet y protección de datos",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Aplica pautas de seguridad digital como no compartir contraseñas, no hablar con extraños y pedir ayuda a un adulto.",
          "suggestedSequence": "Inicio: Cuento infantil sobre la privacidad y los secretos seguros en internet. Desarrollo: Análisis de situaciones de riesgo: qué hacer si aparece una ventana extraña o alguien pide fotos. Cierre: Creación del escudo protector de internet con las 3 reglas de oro."
        },
        {
          "id": "sis-1-4-4",
          "topic": "Juegos de aprendizaje digital y cierre del año tecnológico",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Desarrolla habilidades cognitivas y de razonamiento lógico a través de videojuegos educativos supervisados.",
          "suggestedSequence": "Inicio: Ronda de retos de memoria y emparejamiento de figuras en la plataforma educativa. Desarrollo: Competencia sana individual resolviendo puzzles matemáticos y de lenguaje. Cierre: Balance de los aprendizajes del año y entrega simbólica del diploma de explorador digital."
        }
      ],
      "2°": [
        {
          "id": "sis-2-4-1",
          "topic": "Motores de búsqueda para niños y navegadores web seguros",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Utiliza buscadores infantiles seguros para encontrar información confiable sobre temas de clase.",
          "suggestedSequence": "Inicio: ¿Cómo sabe Google la respuesta a nuestras preguntas? Introducción a las palabras clave. Desarrollo: Búsqueda guiada en buscadores seguros (Kiddle / Google SafeSearch) sobre animales en peligro. Cierre: Selección de la información más clara y pertinente para compartir en clase."
        },
        {
          "id": "sis-2-4-2",
          "topic": "Netiqueta básica: Cortesía, respeto y buen trato en entornos digitales",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce y aplica normas de cortesía, amabilidad y respeto al comunicarse mediante medios digitales.",
          "suggestedSequence": "Inicio: Debate sobre cómo nos sentimos cuando alguien nos envía un mensaje grosero o en mayúsculas sostenidas. Desarrollo: Construcción del decálogo de la Netiqueta escolar: saludar, pedir por favor y agradecer en línea. Cierre: Simulación de redacción de mensajes respetuosos a profesores y compañeros."
        },
        {
          "id": "sis-2-4-3",
          "topic": "Ciberseguridad infantil: Prevención ante extraños y cuidado de contraseñas",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Identifica medidas de autoprotección en internet evitando compartir datos privados y contraseñas.",
          "suggestedSequence": "Inicio: Juego de roles sobre qué hacer si alguien desconocido intenta chatear en un juego en línea. Desarrollo: Definición de datos personales secretos (nombre completo, dirección, colegio, contraseñas). Cierre: Elaboración de una contraseña segura y fácil de recordar con símbolos y números."
        }
      ],
      "3°": [
        {
          "id": "sis-3-4-1",
          "topic": "Redes locales e internet: Cómo viaja la información en el mundo digital",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Comprende los conceptos básicos de red, conexión por cable Wi-Fi y transmisión de paquetes de datos.",
          "suggestedSequence": "Inicio: Metáfora del cartero y las cartas postales para entender el envío de mensajes por internet. Desarrollo: Identificación de equipos de red en el colegio (router, cables de red, antenas Wi-Fi). Cierre: Esquema ilustrado del camino que recorre un mensaje desde el computador local hasta otro equipo."
        },
        {
          "id": "sis-3-4-2",
          "topic": "Derechos de autor en entornos digitales: Honestidad académica y citación básica",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce la propiedad intelectual y la importancia de dar crédito a los autores de imágenes y textos de internet.",
          "suggestedSequence": "Inicio: Debate reflexivo: ¿Cómo te sentirías si alguien presenta tu dibujo como si fuera de él? Desarrollo: Explicación del plagio escolar y pautas para incluir la fuente de donde se tomaron las fotos o textos. Cierre: Taller de elaboración de una ficha informativa agregando el crédito del autor consultado."
        },
        {
          "id": "sis-3-4-3",
          "topic": "Huella digital y privacidad: Cuidado de fotos e información compartida",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Identifica los riesgos de publicar información personal en internet y toma decisiones seguras de privacidad.",
          "suggestedSequence": "Inicio: Dinámica de la huella en la arena vs. la huella en internet que nunca se borra. Desarrollo: Análisis de casos sobre publicaciones en redes sociales y configuración de privacidad. Cierre: Proyecto final de grado: revista digital con los mejores aprendizajes tecnológicos del año."
        }
      ],
      "4°": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "5°": [
        {
          "id": "sis-5-4-1",
          "topic": "Ciberacoso (ciberbullying y grooming): Identificación, prevención y rutas de reporte",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Reconoce situaciones de agresión o manipulación en redes sociales y aplica protocolos escolares de denuncia.",
          "suggestedSequence": "Inicio: Video reflexivo sobre el impacto emocional de las burlas en grupos de mensajería (WhatsApp). Desarrollo: Identificación de señales de alerta de ciberacoso y canales de ayuda (Te Protejo / orientación escolar). Cierre: Redacción grupal de un manifiesto de convivencia pacífica en los grupos digitales de clase."
        },
        {
          "id": "sis-5-4-2",
          "topic": "Protección de la identidad digital y pensamiento crítico frente a noticias falsas (fake news)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Evalúa críticamente la información en internet contrastando fuentes y protegiendo su reputación digital.",
          "suggestedSequence": "Inicio: Análisis de una noticia viral falsa para descubrir por qué la gente la creyó y compartió. Desarrollo: Criterios para verificar noticias: autor, fecha, dominio web y fuentes oficiales. Cierre: Taller 'cazadores de noticias falsas' analizando publicaciones de internet."
        },
        {
          "id": "sis-5-4-3",
          "topic": "Trabajo colaborativo en la nube: Documentos compartidos y cierre anual",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Colabora en tiempo real en la edición de documentos en la nube respetando el trabajo de sus compañeros.",
          "suggestedSequence": "Inicio: Creación de un documento colaborativo en Google Drive compartido con todo el grupo. Desarrollo: Edición simultánea de párrafos, asignación de comentarios y revisión de historial de versiones. Cierre: Consolidación del portafolio digital anual con los mejores trabajos de cada periodo."
        }
      ],
      "6°": [
        {
          "id": "sis-6-4-1",
          "topic": "Introducción a la robótica y la automatización: Máquinas automáticas vs. robots",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diferencia una máquina automática de un robot reconociendo las tres etapas: sensórica, procesamiento y actuación.",
          "suggestedSequence": "Inicio: Debate: ¿Una lavadora o una puerta de centro comercial es un robot? ¿Qué define a un robot? Desarrollo: Estructura básica de un sistema automatizado: entrada (sensores), proceso (cerebro/micro) y salida (motores/luces). Cierre: Elaboración de un mapa conceptual diferenciando mecanismos, automatismos y robots."
        },
        {
          "id": "sis-6-4-2",
          "topic": "Simulación de circuitos eléctricos y robóticos en Tinkercad Circuits",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diseña y simula circuitos eléctricos básicos con fuentes de energía, resistencias e interruptores en entornos virtuales.",
          "suggestedSequence": "Inicio: Riesgos de cortocircuito y por qué es seguro simular antes de conectar físicamente. Desarrollo: Conexión virtual de una batería de 9V, una resistencia limitadora y un LED en la protoboard de Tinkercad. Cierre: Simulación exitosa del encendido de luces y verificación de la ley de Ohm elemental."
        },
        {
          "id": "sis-6-4-3",
          "topic": "Sensores básicos (fotoresistencia LDR, pulsadores) y actuadores en sistemas automáticos",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Integra sensores de luz y pulsadores para activar automáticamente luces o alarmas sonoras en simulaciones.",
          "suggestedSequence": "Inicio: ¿Cómo se prenden solas las luces del alumbrado público cuando oscurece? Desarrollo: Conexión de un sensor de luz LDR (resistencia dependiente de la luz) para encender un foco cuando hay sombra. Cierre: Presentación del proyecto de alumbrado público automatizado simulado."
        }
      ],
      "7°": [
        {
          "id": "sis-7-4-1",
          "topic": "Metodología de diseño de proyectos tecnológicos (Design Thinking) y modelado 3D",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica fases de empatía, definición, ideación y prototipado 3D en Tinkercad para resolver problemas reales.",
          "suggestedSequence": "Inicio: Detección de una necesidad en el colegio (ej. dispensador de alcohol o control de entrada). Desarrollo: Modelado 3D de la carcasa o soporte del proyecto en Tinkercad combinando formas sólidas y huecas. Cierre: Exportación de archivos STL listos para impresión 3D o fabricación digital."
        },
        {
          "id": "sis-7-4-2",
          "topic": "Ensamble e integración de un sistema domótico escolar automatizado",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Integra hardware, sensórica y código en un prototipo funcional que responde a estímulos del entorno.",
          "suggestedSequence": "Inicio: Definición del diagrama de conexiones eléctricas y asignación de pines del proyecto. Desarrollo: Ensamble del circuito en protoboard, carga del programa en el microcontrolador y pruebas de campo. Cierre: Depuración de fallas mecánicas y electrónicas optimizando la respuesta del sistema."
        },
        {
          "id": "sis-7-4-3",
          "topic": "Documentación técnica, bitácora de ingeniería y sustentación pública",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Elabora la memoria técnica del proyecto y sustenta con claridad su funcionamiento y aporte comunitario.",
          "suggestedSequence": "Inicio: Pautas para la redacción de la bitácora técnica: objetivos, lista de materiales, costos y diagrama esquemático. Desarrollo: Preparación de la presentación final y del póster científico para la feria tecnológica. Cierre: Sustentación pública y evaluación formativa mediante rúbrica de innovación y funcionalidad."
        }
      ],
      "8°": [
        {
          "id": "sis-8-4-1",
          "topic": "Mecanismos de transmisión de movimiento: Engranajes, poleas, correas, levas y bielas",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Calcula relaciones de transmisión mecánica en trenes de engranajes y poleas analizando velocidad y fuerza.",
          "suggestedSequence": "Inicio: Análisis de los cambios de una bicicleta: ¿Por qué en subida ponemos el piñón más grande? Desarrollo: Ley de palancas, cálculo de relación de transmisión (i = N1/N2 = w2/w1) y tipos de engranajes (rectos, cónicos). Cierre: Ensamble y prueba de un mecanismo reductor de velocidad con maquetas de engranajes."
        },
        {
          "id": "sis-8-4-2",
          "topic": "Sistemas mecatrónicos y automatización de potencia mediante relevadores (relés)",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende el funcionamiento del relé electromecánico para controlar cargas eléctricas de alta potencia de forma segura.",
          "suggestedSequence": "Inicio: ¿Cómo un circuito de 5V en una computadora puede encender un motor de 110V sin quemarse? Desarrollo: Principio del electroimán y contactos normalmente abierto (NA) y cerrado (NC) en módulos de relé. Cierre: Simulación y conexión de un sistema de encendido automático de electrodomésticos."
        },
        {
          "id": "sis-8-4-3",
          "topic": "Ciberseguridad avanzada y protección contra amenazas digitales en la sociedad actual",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Evalúa riesgos de ciberseguridad industrial y personal, adoptando protocolos de autenticación y respaldo seguro.",
          "suggestedSequence": "Inicio: Casos reales de ataques de Ransomware y suplantación de identidad en empresas e instituciones. Desarrollo: Principios de criptografía simétrica y asimétrica, autenticación en dos factores (2FA) y gestión de contraseñas. Cierre: Proyecto final de síntesis tecnológica y balance de competencias del grado octavo."
        }
      ]
    },
    "Robótica": {
      "9°": [
        {
          "id": "rob-9-4-1",
          "topic": "Robótica de servicio, efectores finales y diseño de pinzas mecánicas servocontroladas",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Diseña y monta pinzas robóticas de sujeción (grippers) adaptadas al chasis móvil para labores de rescate.",
          "suggestedSequence": "Inicio: Análisis de las pinzas mecánicas de robots industriales para sujetar objetos de diferentes geometrías. Desarrollo: Mecanismo de cuatro barras articuladas accionadas por servomotor para abrir y cerrar la pinza. Cierre: Montaje de la pinza en la parte frontal del robot y calibración de la fuerza de apriete sin romper los objetos."
        },
        {
          "id": "rob-9-4-2",
          "topic": "Integración total de sistemas: Mecánica, electrónica de potencia y software reactivo",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Integra todos los módulos en un prototipo robusto con cableado ordenado, fuentes desacopladas y código modular.",
          "suggestedSequence": "Inicio: Detección de interferencias electromagnéticas: por qué los motores pueden reiniciar el microcontrolador. Desarrollo: Instalación de condensadores de desacoplo, baterías separadas para lógica y potencia, y peinado de cables. Cierre: Prueba de esfuerzo continuo de 10 minutos verificando que no existan recalentamientos."
        },
        {
          "id": "rob-9-4-3",
          "topic": "Torneo institucional de robótica: Prueba de habilidades, sustentación y bitácora técnica",
          "dba": "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real.",
          "achievement": "Participa en el torneo escolar de robótica defendiendo la ingeniería de su prototipo y entregando la bitácora técnica.",
          "suggestedSequence": "Inicio: Organización de la pista de competencia del torneo: reto de traslado de piezas y seguimiento de línea. Desarrollo: Rondas eliminatorias de la competencia evaluando tiempos, autonomía y efectividad de agarre. Cierre: Sustentación oral final ante los jurados y entrega de la memoria técnica documentada."
        }
      ],
      "10°": [
        {
          "id": "rob-10-4-1",
          "topic": "Introducción a TinyML y Machine Learning en microcontroladores (Edge AI)",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Comprende los fundamentos de la inteligencia artificial en el borde (Edge AI) para clasificación de patrones en dispositivos embebidos.",
          "suggestedSequence": "Inicio: ¿Cómo sabe un asistente de voz cuándo decimos su nombre sin enviar audio a internet? Procesamiento en el borde. Desarrollo: Entrenamiento de un modelo de clasificación simple en Edge Impulse utilizando datos de acelerómetros o sensores. Cierre: Despliegue del modelo entrenado en una placa ESP32 para clasificar gestos físicos."
        },
        {
          "id": "rob-10-4-2",
          "topic": "Visión por computador básica con cámaras inteligentes (ESP32-CAM): Detección de color y formas",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Configura módulos de cámara ESP32-CAM para capturar imágenes y segmentar objetos por color y forma.",
          "suggestedSequence": "Inicio: Principio de la visión digital: cómo el computador ve una imagen como una matriz de píxeles RGB. Desarrollo: Algoritmo de filtrado por espacio de color HSV para aislar objetos rojos, azules o verdes en el encuadre. Cierre: Sistema de clasificación automática de tapas plásticas por color en una rampa transportadora."
        },
        {
          "id": "rob-10-4-3",
          "topic": "Servocontrol de seguimiento visual (Tracking) y ética de la inteligencia artificial",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Implementa algoritmos de seguimiento donde una cámara montada en servos sigue automáticamente un objetivo en movimiento.",
          "suggestedSequence": "Inicio: Cálculo del error de centrado: diferencia entre el centro de la imagen y la posición del objeto detectado. Desarrollo: Algoritmo proporcional para mover los servomotores en pan y tilt hacia el centro del objeto. Cierre: Debate reflexivo sobre el impacto ético de la vigilancia automatizada y el reemplazo laboral por robots."
        },
        {
          "id": "rob-10-4-4",
          "topic": "Feria de innovación tecnológica y defensa del proyecto integrador",
          "dba": "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica.",
          "achievement": "Sustenta públicamente el proyecto mecatrónico desarrollado demostrando dominio técnico, analítico y ético.",
          "suggestedSequence": "Inicio: Preparación del stand de exhibición con póster científico, prototipo funcional y computadores de demostración. Desarrollo: Defensa del proyecto ante jurados evaluadores explicando arquitectura de hardware y algoritmos. Cierre: Evaluación formativa y balance de las competencias de ingeniería adquiridas durante el año."
        }
      ],
      "11°": [
        {
          "id": "rob-11-4-1",
          "topic": "Validación experimental y pruebas de confiabilidad en condiciones operativas extremas (MTBF)",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Ejecuta protocolos de prueba de fatiga mecánica, autonomía energética y temperatura para certificar confiabilidad.",
          "suggestedSequence": "Inicio: Conceptos de confiabilidad en ingeniería: Tiempo Medio Entre Fallos (MTBF) y análisis de modos de falla (FMEA). Desarrollo: Batería de pruebas de esfuerzo continuo, ciclos de recarga de baterías y resistencia a vibraciones. Cierre: Informe técnico de confiabilidad identificando mejoras de diseño implementadas."
        },
        {
          "id": "rob-11-4-2",
          "topic": "Modelos de transferencia tecnológica, patentes, propiedad intelectual y pitch de innovación",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Comprende los mecanismos de protección intelectual y estructura una propuesta de valor técnico-económica de su proyecto.",
          "suggestedSequence": "Inicio: ¿Cómo convertir un proyecto de aula en un producto tecnológico o emprendimiento social viable? Desarrollo: Búsqueda en bases de patentes (Superintendencia de Industria y Comercio / Google Patents) y elaboración del Lean Canvas. Cierre: Presentación en formato Elevator Pitch de 3 minutos defendiendo la viabilidad e impacto de su prototipo."
        },
        {
          "id": "rob-11-4-3",
          "topic": "Redacción de la memoria técnica de ingeniería institucional y artículo científico",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Redacta el informe final de grado y el artículo científico con rigor metodológico, análisis de resultados y bibliografía APA.",
          "suggestedSequence": "Inicio: Estructura del artículo científico IMRyD: Introducción, Metodología, Resultados y Discusión. Desarrollo: Redacción técnica de resultados con tablas, gráficas de rendimiento, esquemas eléctricos y discusión teórica. Cierre: Consolidación final del documento de grado y aprobación del asesor pedagógico."
        },
        {
          "id": "rob-11-4-4",
          "topic": "Sustentación pública de grado: Defensa del prototipo robótico funcional y entrega de bitácora",
          "dba": "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico.",
          "achievement": "Sustenta con solvencia y rigor científico el prototipo robótico ante el comité de evaluación de la institución.",
          "suggestedSequence": "Inicio: Instalación de la mesa de sustentación pública con el robot en funcionamiento en vivo. Desarrollo: Exposición de 15 minutos ante docentes y jurados externos respondiendo preguntas técnicas y pedagógicas. Cierre: Calificación final, deliberación y entrega simbólica de la mención de honor en robótica."
        }
      ]
    },
    "Dirección de grupo": {
      "7°": [
        {
          "id": "dir-7-4-1",
          "topic": "Proyecto de vida: Metas personales, valores familiares y proyección vocacional temprana",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Identifica sus fortalezas, talentos e intereses formulando metas a corto y mediano plazo para su vida.",
          "suggestedSequence": "Inicio: Ejercicio reflexivo 'Mi árbol de vida': raíces (familia), tronco (fortalezas), flores (sueños) y frutos (logros). Desarrollo: Redacción de una carta a sí mismo en el futuro definiendo metas para los próximos tres años. Cierre: Construcción del mapa de los sueños personal en collage creativo."
        },
        {
          "id": "dir-7-4-2",
          "topic": "Pluralidad, valoración de las diferencias y gratitud comunitaria",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Reconoce el valor de convivir con personas de diversos orígenes y expresa gratitud hacia quienes han apoyado su formación.",
          "suggestedSequence": "Inicio: Ronda de agradecimientos: cada estudiante reconoce el apoyo recibido de un docente o compañero. Desarrollo: Reflexión sobre la riqueza de las diferencias individuales en la convivencia armónica. Cierre: Elaboración de cartas de gratitud para las familias y personal de apoyo del colegio."
        },
        {
          "id": "dir-7-4-3",
          "topic": "Balance del año escolar, cierre de ciclo y celebración de logros compartidos",
          "dba": "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo.",
          "achievement": "Evalúa su crecimiento personal, académico y socioemocional a lo largo del año lectivo reconociendo aprendizajes.",
          "suggestedSequence": "Inicio: Proyección de fotos y videos de las actividades y momentos significativos del año escolar. Desarrollo: Autoevaluación guiada: ¿Qué aprendí este año? ¿En qué mejoré como persona? ¿Qué debo corregir? Cierre: Círculo de despedida del año lectivo y entrega de reconocimientos al compañerismo."
        }
      ]
    },
    "Tecnología e Informática": {
      "1°": [
        {
          "id": "sis-1-4-1",
          "topic": "¿Qué es internet y para qué sirve? La red que conecta al mundo",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Comprende de manera intuitiva que internet es una red mundial que permite consultar información y comunicarse.",
          "suggestedSequence": "Inicio: Metáfora de una gran telaraña invisible o biblioteca gigante que conecta a las personas. Desarrollo: Visualización de un mapa mundial interactivo mostrando conexiones y fotos de diferentes países. Cierre: Preguntas reflexivas: ¿A quién te gustaría escribirle o qué te gustaría aprender en internet?"
        },
        {
          "id": "sis-1-4-2",
          "topic": "Navegación básica en entornos educativos guiados y portales infantiles",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Navega por sitios web infantiles educativos utilizando enlaces, botones y flechas de avance y retroceso.",
          "suggestedSequence": "Inicio: Reconocimiento del ícono del navegador web (Google Chrome / Edge) y su función. Desarrollo: Navegación supervisada por plataformas educativas (Árbol ABC / Mundo Primaria). Cierre: Práctica haciendo clic en botones interactivos de actividades didácticas."
        },
        {
          "id": "sis-1-4-3",
          "topic": "Reglas de oro para el uso seguro de internet y protección de datos",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Aplica pautas de seguridad digital como no compartir contraseñas, no hablar con extraños y pedir ayuda a un adulto.",
          "suggestedSequence": "Inicio: Cuento infantil sobre la privacidad y los secretos seguros en internet. Desarrollo: Análisis de situaciones de riesgo: qué hacer si aparece una ventana extraña o alguien pide fotos. Cierre: Creación del escudo protector de internet con las 3 reglas de oro."
        },
        {
          "id": "sis-1-4-4",
          "topic": "Juegos de aprendizaje digital y cierre del año tecnológico",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Desarrolla habilidades cognitivas y de razonamiento lógico a través de videojuegos educativos supervisados.",
          "suggestedSequence": "Inicio: Ronda de retos de memoria y emparejamiento de figuras en la plataforma educativa. Desarrollo: Competencia sana individual resolviendo puzzles matemáticos y de lenguaje. Cierre: Balance de los aprendizajes del año y entrega simbólica del diploma de explorador digital."
        }
      ],
      "2°": [
        {
          "id": "sis-2-4-1",
          "topic": "Motores de búsqueda para niños y navegadores web seguros",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Utiliza buscadores infantiles seguros para encontrar información confiable sobre temas de clase.",
          "suggestedSequence": "Inicio: ¿Cómo sabe Google la respuesta a nuestras preguntas? Introducción a las palabras clave. Desarrollo: Búsqueda guiada en buscadores seguros (Kiddle / Google SafeSearch) sobre animales en peligro. Cierre: Selección de la información más clara y pertinente para compartir en clase."
        },
        {
          "id": "sis-2-4-2",
          "topic": "Netiqueta básica: Cortesía, respeto y buen trato en entornos digitales",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce y aplica normas de cortesía, amabilidad y respeto al comunicarse mediante medios digitales.",
          "suggestedSequence": "Inicio: Debate sobre cómo nos sentimos cuando alguien nos envía un mensaje grosero o en mayúsculas sostenidas. Desarrollo: Construcción del decálogo de la Netiqueta escolar: saludar, pedir por favor y agradecer en línea. Cierre: Simulación de redacción de mensajes respetuosos a profesores y compañeros."
        },
        {
          "id": "sis-2-4-3",
          "topic": "Ciberseguridad infantil: Prevención ante extraños y cuidado de contraseñas",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Identifica medidas de autoprotección en internet evitando compartir datos privados y contraseñas.",
          "suggestedSequence": "Inicio: Juego de roles sobre qué hacer si alguien desconocido intenta chatear en un juego en línea. Desarrollo: Definición de datos personales secretos (nombre completo, dirección, colegio, contraseñas). Cierre: Elaboración de una contraseña segura y fácil de recordar con símbolos y números."
        }
      ],
      "3°": [
        {
          "id": "sis-3-4-1",
          "topic": "Redes locales e internet: Cómo viaja la información en el mundo digital",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Comprende los conceptos básicos de red, conexión por cable Wi-Fi y transmisión de paquetes de datos.",
          "suggestedSequence": "Inicio: Metáfora del cartero y las cartas postales para entender el envío de mensajes por internet. Desarrollo: Identificación de equipos de red en el colegio (router, cables de red, antenas Wi-Fi). Cierre: Esquema ilustrado del camino que recorre un mensaje desde el computador local hasta otro equipo."
        },
        {
          "id": "sis-3-4-2",
          "topic": "Derechos de autor en entornos digitales: Honestidad académica y citación básica",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce la propiedad intelectual y la importancia de dar crédito a los autores de imágenes y textos de internet.",
          "suggestedSequence": "Inicio: Debate reflexivo: ¿Cómo te sentirías si alguien presenta tu dibujo como si fuera de él? Desarrollo: Explicación del plagio escolar y pautas para incluir la fuente de donde se tomaron las fotos o textos. Cierre: Taller de elaboración de una ficha informativa agregando el crédito del autor consultado."
        },
        {
          "id": "sis-3-4-3",
          "topic": "Huella digital y privacidad: Cuidado de fotos e información compartida",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Identifica los riesgos de publicar información personal en internet y toma decisiones seguras de privacidad.",
          "suggestedSequence": "Inicio: Dinámica de la huella en la arena vs. la huella en internet que nunca se borra. Desarrollo: Análisis de casos sobre publicaciones en redes sociales y configuración de privacidad. Cierre: Proyecto final de grado: revista digital con los mejores aprendizajes tecnológicos del año."
        }
      ],
      "4°": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "5°": [
        {
          "id": "sis-5-4-1",
          "topic": "Ciberacoso (ciberbullying y grooming): Identificación, prevención y rutas de reporte",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Reconoce situaciones de agresión o manipulación en redes sociales y aplica protocolos escolares de denuncia.",
          "suggestedSequence": "Inicio: Video reflexivo sobre el impacto emocional de las burlas en grupos de mensajería (WhatsApp). Desarrollo: Identificación de señales de alerta de ciberacoso y canales de ayuda (Te Protejo / orientación escolar). Cierre: Redacción grupal de un manifiesto de convivencia pacífica en los grupos digitales de clase."
        },
        {
          "id": "sis-5-4-2",
          "topic": "Protección de la identidad digital y pensamiento crítico frente a noticias falsas (fake news)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Evalúa críticamente la información en internet contrastando fuentes y protegiendo su reputación digital.",
          "suggestedSequence": "Inicio: Análisis de una noticia viral falsa para descubrir por qué la gente la creyó y compartió. Desarrollo: Criterios para verificar noticias: autor, fecha, dominio web y fuentes oficiales. Cierre: Taller 'cazadores de noticias falsas' analizando publicaciones de internet."
        },
        {
          "id": "sis-5-4-3",
          "topic": "Trabajo colaborativo en la nube: Documentos compartidos y cierre anual",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Colabora en tiempo real en la edición de documentos en la nube respetando el trabajo de sus compañeros.",
          "suggestedSequence": "Inicio: Creación de un documento colaborativo en Google Drive compartido con todo el grupo. Desarrollo: Edición simultánea de párrafos, asignación de comentarios y revisión de historial de versiones. Cierre: Consolidación del portafolio digital anual con los mejores trabajos de cada periodo."
        }
      ],
      "6°": [
        {
          "id": "sis-6-4-1",
          "topic": "Introducción a la robótica y la automatización: Máquinas automáticas vs. robots",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diferencia una máquina automática de un robot reconociendo las tres etapas: sensórica, procesamiento y actuación.",
          "suggestedSequence": "Inicio: Debate: ¿Una lavadora o una puerta de centro comercial es un robot? ¿Qué define a un robot? Desarrollo: Estructura básica de un sistema automatizado: entrada (sensores), proceso (cerebro/micro) y salida (motores/luces). Cierre: Elaboración de un mapa conceptual diferenciando mecanismos, automatismos y robots."
        },
        {
          "id": "sis-6-4-2",
          "topic": "Simulación de circuitos eléctricos y robóticos en Tinkercad Circuits",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diseña y simula circuitos eléctricos básicos con fuentes de energía, resistencias e interruptores en entornos virtuales.",
          "suggestedSequence": "Inicio: Riesgos de cortocircuito y por qué es seguro simular antes de conectar físicamente. Desarrollo: Conexión virtual de una batería de 9V, una resistencia limitadora y un LED en la protoboard de Tinkercad. Cierre: Simulación exitosa del encendido de luces y verificación de la ley de Ohm elemental."
        },
        {
          "id": "sis-6-4-3",
          "topic": "Sensores básicos (fotoresistencia LDR, pulsadores) y actuadores en sistemas automáticos",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Integra sensores de luz y pulsadores para activar automáticamente luces o alarmas sonoras en simulaciones.",
          "suggestedSequence": "Inicio: ¿Cómo se prenden solas las luces del alumbrado público cuando oscurece? Desarrollo: Conexión de un sensor de luz LDR (resistencia dependiente de la luz) para encender un foco cuando hay sombra. Cierre: Presentación del proyecto de alumbrado público automatizado simulado."
        }
      ],
      "7°": [
        {
          "id": "sis-7-4-1",
          "topic": "Metodología de diseño de proyectos tecnológicos (Design Thinking) y modelado 3D",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica fases de empatía, definición, ideación y prototipado 3D en Tinkercad para resolver problemas reales.",
          "suggestedSequence": "Inicio: Detección de una necesidad en el colegio (ej. dispensador de alcohol o control de entrada). Desarrollo: Modelado 3D de la carcasa o soporte del proyecto en Tinkercad combinando formas sólidas y huecas. Cierre: Exportación de archivos STL listos para impresión 3D o fabricación digital."
        },
        {
          "id": "sis-7-4-2",
          "topic": "Ensamble e integración de un sistema domótico escolar automatizado",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Integra hardware, sensórica y código en un prototipo funcional que responde a estímulos del entorno.",
          "suggestedSequence": "Inicio: Definición del diagrama de conexiones eléctricas y asignación de pines del proyecto. Desarrollo: Ensamble del circuito en protoboard, carga del programa en el microcontrolador y pruebas de campo. Cierre: Depuración de fallas mecánicas y electrónicas optimizando la respuesta del sistema."
        },
        {
          "id": "sis-7-4-3",
          "topic": "Documentación técnica, bitácora de ingeniería y sustentación pública",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Elabora la memoria técnica del proyecto y sustenta con claridad su funcionamiento y aporte comunitario.",
          "suggestedSequence": "Inicio: Pautas para la redacción de la bitácora técnica: objetivos, lista de materiales, costos y diagrama esquemático. Desarrollo: Preparación de la presentación final y del póster científico para la feria tecnológica. Cierre: Sustentación pública y evaluación formativa mediante rúbrica de innovación y funcionalidad."
        }
      ],
      "8°": [
        {
          "id": "sis-8-4-1",
          "topic": "Mecanismos de transmisión de movimiento: Engranajes, poleas, correas, levas y bielas",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Calcula relaciones de transmisión mecánica en trenes de engranajes y poleas analizando velocidad y fuerza.",
          "suggestedSequence": "Inicio: Análisis de los cambios de una bicicleta: ¿Por qué en subida ponemos el piñón más grande? Desarrollo: Ley de palancas, cálculo de relación de transmisión (i = N1/N2 = w2/w1) y tipos de engranajes (rectos, cónicos). Cierre: Ensamble y prueba de un mecanismo reductor de velocidad con maquetas de engranajes."
        },
        {
          "id": "sis-8-4-2",
          "topic": "Sistemas mecatrónicos y automatización de potencia mediante relevadores (relés)",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende el funcionamiento del relé electromecánico para controlar cargas eléctricas de alta potencia de forma segura.",
          "suggestedSequence": "Inicio: ¿Cómo un circuito de 5V en una computadora puede encender un motor de 110V sin quemarse? Desarrollo: Principio del electroimán y contactos normalmente abierto (NA) y cerrado (NC) en módulos de relé. Cierre: Simulación y conexión de un sistema de encendido automático de electrodomésticos."
        },
        {
          "id": "sis-8-4-3",
          "topic": "Ciberseguridad avanzada y protección contra amenazas digitales en la sociedad actual",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Evalúa riesgos de ciberseguridad industrial y personal, adoptando protocolos de autenticación y respaldo seguro.",
          "suggestedSequence": "Inicio: Casos reales de ataques de Ransomware y suplantación de identidad en empresas e instituciones. Desarrollo: Principios de criptografía simétrica y asimétrica, autenticación en dos factores (2FA) y gestión de contraseñas. Cierre: Proyecto final de síntesis tecnológica y balance de competencias del grado octavo."
        }
      ]
    },
    "Tecnología": {
      "1°": [
        {
          "id": "sis-1-4-1",
          "topic": "¿Qué es internet y para qué sirve? La red que conecta al mundo",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Comprende de manera intuitiva que internet es una red mundial que permite consultar información y comunicarse.",
          "suggestedSequence": "Inicio: Metáfora de una gran telaraña invisible o biblioteca gigante que conecta a las personas. Desarrollo: Visualización de un mapa mundial interactivo mostrando conexiones y fotos de diferentes países. Cierre: Preguntas reflexivas: ¿A quién te gustaría escribirle o qué te gustaría aprender en internet?"
        },
        {
          "id": "sis-1-4-2",
          "topic": "Navegación básica en entornos educativos guiados y portales infantiles",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Navega por sitios web infantiles educativos utilizando enlaces, botones y flechas de avance y retroceso.",
          "suggestedSequence": "Inicio: Reconocimiento del ícono del navegador web (Google Chrome / Edge) y su función. Desarrollo: Navegación supervisada por plataformas educativas (Árbol ABC / Mundo Primaria). Cierre: Práctica haciendo clic en botones interactivos de actividades didácticas."
        },
        {
          "id": "sis-1-4-3",
          "topic": "Reglas de oro para el uso seguro de internet y protección de datos",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Aplica pautas de seguridad digital como no compartir contraseñas, no hablar con extraños y pedir ayuda a un adulto.",
          "suggestedSequence": "Inicio: Cuento infantil sobre la privacidad y los secretos seguros en internet. Desarrollo: Análisis de situaciones de riesgo: qué hacer si aparece una ventana extraña o alguien pide fotos. Cierre: Creación del escudo protector de internet con las 3 reglas de oro."
        },
        {
          "id": "sis-1-4-4",
          "topic": "Juegos de aprendizaje digital y cierre del año tecnológico",
          "dba": "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa.",
          "achievement": "Desarrolla habilidades cognitivas y de razonamiento lógico a través de videojuegos educativos supervisados.",
          "suggestedSequence": "Inicio: Ronda de retos de memoria y emparejamiento de figuras en la plataforma educativa. Desarrollo: Competencia sana individual resolviendo puzzles matemáticos y de lenguaje. Cierre: Balance de los aprendizajes del año y entrega simbólica del diploma de explorador digital."
        }
      ],
      "2°": [
        {
          "id": "sis-2-4-1",
          "topic": "Motores de búsqueda para niños y navegadores web seguros",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Utiliza buscadores infantiles seguros para encontrar información confiable sobre temas de clase.",
          "suggestedSequence": "Inicio: ¿Cómo sabe Google la respuesta a nuestras preguntas? Introducción a las palabras clave. Desarrollo: Búsqueda guiada en buscadores seguros (Kiddle / Google SafeSearch) sobre animales en peligro. Cierre: Selección de la información más clara y pertinente para compartir en clase."
        },
        {
          "id": "sis-2-4-2",
          "topic": "Netiqueta básica: Cortesía, respeto y buen trato en entornos digitales",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Reconoce y aplica normas de cortesía, amabilidad y respeto al comunicarse mediante medios digitales.",
          "suggestedSequence": "Inicio: Debate sobre cómo nos sentimos cuando alguien nos envía un mensaje grosero o en mayúsculas sostenidas. Desarrollo: Construcción del decálogo de la Netiqueta escolar: saludar, pedir por favor y agradecer en línea. Cierre: Simulación de redacción de mensajes respetuosos a profesores y compañeros."
        },
        {
          "id": "sis-2-4-3",
          "topic": "Ciberseguridad infantil: Prevención ante extraños y cuidado de contraseñas",
          "dba": "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma.",
          "achievement": "Identifica medidas de autoprotección en internet evitando compartir datos privados y contraseñas.",
          "suggestedSequence": "Inicio: Juego de roles sobre qué hacer si alguien desconocido intenta chatear en un juego en línea. Desarrollo: Definición de datos personales secretos (nombre completo, dirección, colegio, contraseñas). Cierre: Elaboración de una contraseña segura y fácil de recordar con símbolos y números."
        }
      ],
      "3°": [
        {
          "id": "sis-3-4-1",
          "topic": "Redes locales e internet: Cómo viaja la información en el mundo digital",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Comprende los conceptos básicos de red, conexión por cable Wi-Fi y transmisión de paquetes de datos.",
          "suggestedSequence": "Inicio: Metáfora del cartero y las cartas postales para entender el envío de mensajes por internet. Desarrollo: Identificación de equipos de red en el colegio (router, cables de red, antenas Wi-Fi). Cierre: Esquema ilustrado del camino que recorre un mensaje desde el computador local hasta otro equipo."
        },
        {
          "id": "sis-3-4-2",
          "topic": "Derechos de autor en entornos digitales: Honestidad académica y citación básica",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Reconoce la propiedad intelectual y la importancia de dar crédito a los autores de imágenes y textos de internet.",
          "suggestedSequence": "Inicio: Debate reflexivo: ¿Cómo te sentirías si alguien presenta tu dibujo como si fuera de él? Desarrollo: Explicación del plagio escolar y pautas para incluir la fuente de donde se tomaron las fotos o textos. Cierre: Taller de elaboración de una ficha informativa agregando el crédito del autor consultado."
        },
        {
          "id": "sis-3-4-3",
          "topic": "Huella digital y privacidad: Cuidado de fotos e información compartida",
          "dba": "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente.",
          "achievement": "Identifica los riesgos de publicar información personal en internet y toma decisiones seguras de privacidad.",
          "suggestedSequence": "Inicio: Dinámica de la huella en la arena vs. la huella en internet que nunca se borra. Desarrollo: Análisis de casos sobre publicaciones en redes sociales y configuración de privacidad. Cierre: Proyecto final de grado: revista digital con los mejores aprendizajes tecnológicos del año."
        }
      ],
      "4°": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "4°A": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "4°B": [
        {
          "id": "sis-4-4-1",
          "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
          "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
          "id": "sis-4-4-2",
          "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
          "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
          "id": "sis-4-4-3",
          "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
          "dba": "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo.",
          "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
          "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
      ],
      "5°": [
        {
          "id": "sis-5-4-1",
          "topic": "Ciberacoso (ciberbullying y grooming): Identificación, prevención y rutas de reporte",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Reconoce situaciones de agresión o manipulación en redes sociales y aplica protocolos escolares de denuncia.",
          "suggestedSequence": "Inicio: Video reflexivo sobre el impacto emocional de las burlas en grupos de mensajería (WhatsApp). Desarrollo: Identificación de señales de alerta de ciberacoso y canales de ayuda (Te Protejo / orientación escolar). Cierre: Redacción grupal de un manifiesto de convivencia pacífica en los grupos digitales de clase."
        },
        {
          "id": "sis-5-4-2",
          "topic": "Protección de la identidad digital y pensamiento crítico frente a noticias falsas (fake news)",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Evalúa críticamente la información en internet contrastando fuentes y protegiendo su reputación digital.",
          "suggestedSequence": "Inicio: Análisis de una noticia viral falsa para descubrir por qué la gente la creyó y compartió. Desarrollo: Criterios para verificar noticias: autor, fecha, dominio web y fuentes oficiales. Cierre: Taller 'cazadores de noticias falsas' analizando publicaciones de internet."
        },
        {
          "id": "sis-5-4-3",
          "topic": "Trabajo colaborativo en la nube: Documentos compartidos y cierre anual",
          "dba": "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube.",
          "achievement": "Colabora en tiempo real en la edición de documentos en la nube respetando el trabajo de sus compañeros.",
          "suggestedSequence": "Inicio: Creación de un documento colaborativo en Google Drive compartido con todo el grupo. Desarrollo: Edición simultánea de párrafos, asignación de comentarios y revisión de historial de versiones. Cierre: Consolidación del portafolio digital anual con los mejores trabajos de cada periodo."
        }
      ],
      "6°": [
        {
          "id": "sis-6-4-1",
          "topic": "Introducción a la robótica y la automatización: Máquinas automáticas vs. robots",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diferencia una máquina automática de un robot reconociendo las tres etapas: sensórica, procesamiento y actuación.",
          "suggestedSequence": "Inicio: Debate: ¿Una lavadora o una puerta de centro comercial es un robot? ¿Qué define a un robot? Desarrollo: Estructura básica de un sistema automatizado: entrada (sensores), proceso (cerebro/micro) y salida (motores/luces). Cierre: Elaboración de un mapa conceptual diferenciando mecanismos, automatismos y robots."
        },
        {
          "id": "sis-6-4-2",
          "topic": "Simulación de circuitos eléctricos y robóticos en Tinkercad Circuits",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Diseña y simula circuitos eléctricos básicos con fuentes de energía, resistencias e interruptores en entornos virtuales.",
          "suggestedSequence": "Inicio: Riesgos de cortocircuito y por qué es seguro simular antes de conectar físicamente. Desarrollo: Conexión virtual de una batería de 9V, una resistencia limitadora y un LED en la protoboard de Tinkercad. Cierre: Simulación exitosa del encendido de luces y verificación de la ley de Ohm elemental."
        },
        {
          "id": "sis-6-4-3",
          "topic": "Sensores básicos (fotoresistencia LDR, pulsadores) y actuadores en sistemas automáticos",
          "dba": "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos.",
          "achievement": "Integra sensores de luz y pulsadores para activar automáticamente luces o alarmas sonoras en simulaciones.",
          "suggestedSequence": "Inicio: ¿Cómo se prenden solas las luces del alumbrado público cuando oscurece? Desarrollo: Conexión de un sensor de luz LDR (resistencia dependiente de la luz) para encender un foco cuando hay sombra. Cierre: Presentación del proyecto de alumbrado público automatizado simulado."
        }
      ],
      "7°": [
        {
          "id": "sis-7-4-1",
          "topic": "Metodología de diseño de proyectos tecnológicos (Design Thinking) y modelado 3D",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Aplica fases de empatía, definición, ideación y prototipado 3D en Tinkercad para resolver problemas reales.",
          "suggestedSequence": "Inicio: Detección de una necesidad en el colegio (ej. dispensador de alcohol o control de entrada). Desarrollo: Modelado 3D de la carcasa o soporte del proyecto en Tinkercad combinando formas sólidas y huecas. Cierre: Exportación de archivos STL listos para impresión 3D o fabricación digital."
        },
        {
          "id": "sis-7-4-2",
          "topic": "Ensamble e integración de un sistema domótico escolar automatizado",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Integra hardware, sensórica y código en un prototipo funcional que responde a estímulos del entorno.",
          "suggestedSequence": "Inicio: Definición del diagrama de conexiones eléctricas y asignación de pines del proyecto. Desarrollo: Ensamble del circuito en protoboard, carga del programa en el microcontrolador y pruebas de campo. Cierre: Depuración de fallas mecánicas y electrónicas optimizando la respuesta del sistema."
        },
        {
          "id": "sis-7-4-3",
          "topic": "Documentación técnica, bitácora de ingeniería y sustentación pública",
          "dba": "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias.",
          "achievement": "Elabora la memoria técnica del proyecto y sustenta con claridad su funcionamiento y aporte comunitario.",
          "suggestedSequence": "Inicio: Pautas para la redacción de la bitácora técnica: objetivos, lista de materiales, costos y diagrama esquemático. Desarrollo: Preparación de la presentación final y del póster científico para la feria tecnológica. Cierre: Sustentación pública y evaluación formativa mediante rúbrica de innovación y funcionalidad."
        }
      ],
      "8°": [
        {
          "id": "sis-8-4-1",
          "topic": "Mecanismos de transmisión de movimiento: Engranajes, poleas, correas, levas y bielas",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Calcula relaciones de transmisión mecánica en trenes de engranajes y poleas analizando velocidad y fuerza.",
          "suggestedSequence": "Inicio: Análisis de los cambios de una bicicleta: ¿Por qué en subida ponemos el piñón más grande? Desarrollo: Ley de palancas, cálculo de relación de transmisión (i = N1/N2 = w2/w1) y tipos de engranajes (rectos, cónicos). Cierre: Ensamble y prueba de un mecanismo reductor de velocidad con maquetas de engranajes."
        },
        {
          "id": "sis-8-4-2",
          "topic": "Sistemas mecatrónicos y automatización de potencia mediante relevadores (relés)",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Comprende el funcionamiento del relé electromecánico para controlar cargas eléctricas de alta potencia de forma segura.",
          "suggestedSequence": "Inicio: ¿Cómo un circuito de 5V en una computadora puede encender un motor de 110V sin quemarse? Desarrollo: Principio del electroimán y contactos normalmente abierto (NA) y cerrado (NC) en módulos de relé. Cierre: Simulación y conexión de un sistema de encendido automático de electrodomésticos."
        },
        {
          "id": "sis-8-4-3",
          "topic": "Ciberseguridad avanzada y protección contra amenazas digitales en la sociedad actual",
          "dba": "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos.",
          "achievement": "Evalúa riesgos de ciberseguridad industrial y personal, adoptando protocolos de autenticación y respaldo seguro.",
          "suggestedSequence": "Inicio: Casos reales de ataques de Ransomware y suplantación de identidad en empresas e instituciones. Desarrollo: Principios de criptografía simétrica y asimétrica, autenticación en dos factores (2FA) y gestión de contraseñas. Cierre: Proyecto final de síntesis tecnológica y balance de competencias del grado octavo."
        }
      ]
    }
  }
};

// Equivalencia completa entre Sistemas y Tecnología e Informática para todos los periodos
['1°', '2°', '3°', '4°'].forEach(p => {
  if (DEFAULT_CURRICULUM[p] && DEFAULT_CURRICULUM[p]['Sistemas']) {
    DEFAULT_CURRICULUM[p]['Tecnología e Informática'] = DEFAULT_CURRICULUM[p]['Sistemas'];
    DEFAULT_CURRICULUM[p]['Tecnología'] = DEFAULT_CURRICULUM[p]['Sistemas'];
  }
});

const CurriculumService = {
  getDefaultCurriculum() {
    return DEFAULT_CURRICULUM;
  },

  /**
   * Genera el ítem curricular oficial estandarizado para la Clase #1 (Introducción)
   * Válido para todas las asignaturas y grados de la institución.
   */
  getIntroClassItem(period = '1°', subject = 'Asignatura', grade = 'General', baseStandard = '') {
    const subClean = String(subject || 'Asignatura').trim();
    const grdClean = String(grade || '').trim();
    const perClean = String(period || '1°').trim();
    const gradeLabel = grdClean ? ` (${grdClean})` : '';

    return {
      id: `intro_${subClean}_${grdClean}_${perClean}`.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      topic: "Clase #1: Introducción a la asignatura, acuerdos pedagógicos, metodología y criterios de evaluación",
      dba: baseStandard || `Reconoce los propósitos formativos, ejes temáticos, indicadores de desempeño y criterios de evaluación del ${perClean} periodo en ${subClean}${gradeLabel}, concertando los acuerdos pedagógicos y normas de convivencia del aula.`,
      achievement: `● Conoce y comprende los temas, indicadores de desempeño y metodología de trabajo del ${perClean} periodo.\n● Participa activamente en la concertación de acuerdos pedagógicos, normas de aula y criterios de evaluación formativa.\n● Asume una actitud de responsabilidad, escucha respetuosa y compromiso ético frente a las actividades de aprendizaje.`,
      suggestedSequence: "Inicio: Saludo de bienvenida, motivación inicial y socialización del encuadre pedagógico del periodo. Desarrollo: Presentación detallada de la malla curricular, ejes temáticos, indicadores de desempeño y criterios de evaluación institucional; concertación del pacto pedagógico de aula y normas de convivencia. Cierre: Registro de temas e indicadores en el cuaderno pedagógico por parte de los estudiantes y resolución de inquietudes."
    };
  },

  /**
   * Determina si un tema corresponde a la clase de introducción pedagógica institucional
   */
  isIntroTopic(topicStr) {
    const s = String(topicStr || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return s.includes('introduccion a la clase') ||
           s.includes('introduccion a la asignatura') ||
           s.includes('acuerdos pedagogicos') ||
           s.includes('clase #1') ||
           (s.includes('temas') && s.includes('indicadores'));
  },

  getAllCurriculum() {
    try {
      const data = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_CURRICULUM_KEY) : null;
      let parsed = data ? JSON.parse(data) : JSON.parse(JSON.stringify(DEFAULT_CURRICULUM));

      if (parsed && (!parsed["1°"] || !parsed["1°"]["Robótica"] || !parsed["1°"]["Robótica"]["10°"] || parsed["1°"]["Robótica"]["10°"].length < 5)) {
        if (!parsed["1°"]) parsed["1°"] = {};
        if (!parsed["1°"]["Robótica"]) parsed["1°"]["Robótica"] = {};
        parsed["1°"]["Robótica"]["10°"] = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM["1°"]["Robótica"]["10°"]));
      }

      // Sincronización oficial de 7° Sistemas / Tecnología e Informática con los estándares institucionales
      if (parsed && (!parsed["1°"] || !parsed["1°"]["Sistemas"] || !parsed["1°"]["Sistemas"]["7°"] || !parsed["1°"]["Sistemas"]["7°"][0] || !parsed["1°"]["Sistemas"]["7°"][0].dba || !parsed["1°"]["Sistemas"]["7°"][0].dba.includes('Apropiación y uso responsable'))) {
        if (!parsed["1°"]) parsed["1°"] = {};
        if (!parsed["1°"]["Sistemas"]) parsed["1°"]["Sistemas"] = {};
        parsed["1°"]["Sistemas"]["7°"] = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM["1°"]["Sistemas"]["7°"]));
        if (!parsed["1°"]["Tecnología e Informática"]) parsed["1°"]["Tecnología e Informática"] = {};
        parsed["1°"]["Tecnología e Informática"]["7°"] = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM["1°"]["Sistemas"]["7°"]));
      }

      // REGLA OBLIGATORIA: Para TODAS las materias y grados en todos los periodos, la Clase 1 siempre es la Introducción
      let hasIntroUpdates = false;
      for (const p of Object.keys(parsed)) {
        if (!parsed[p] || typeof parsed[p] !== 'object') continue;
        for (const s of Object.keys(parsed[p])) {
          if (!parsed[p][s] || typeof parsed[p][s] !== 'object') continue;
          for (const g of Object.keys(parsed[p][s])) {
            const list = parsed[p][s][g];
            if (Array.isArray(list) && list.length > 0) {
              if (!this.isIntroTopic(list[0]?.topic)) {
                const baseStd = list[0]?.dba || '';
                list.unshift(this.getIntroClassItem(p, s, g, baseStd));
                hasIntroUpdates = true;
              }
            }
          }
        }
      }

      if ((hasIntroUpdates || !data) && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_CURRICULUM_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.error('Error al leer banco curricular:', e);
      return JSON.parse(JSON.stringify(DEFAULT_CURRICULUM));
    }
  },

  saveAllCurriculum(curriculumData) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_CURRICULUM_KEY, JSON.stringify(curriculumData));
      }
      return true;
    } catch (e) {
      console.error('Error al guardar banco curricular:', e);
      return false;
    }
  },

  getItems(period, subject, grade) {
    const isDirGroup = subject && String(subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
    if (isDirGroup) {
      return [];
    }

    const all = this.getAllCurriculum();
    const normGrade = (g) => String(g || '').trim();
    const gKey = normGrade(grade);
    const gAlt = gKey.endsWith('°') ? gKey.slice(0, -1) : (gKey + '°');

    const normalize = (s) => String(s || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    const getSubjectAliases = (sub) => {
      const norm = normalize(sub);
      const aliases = [norm];
      if (norm.includes('sistema') || norm.includes('tecnolog') || norm.includes('informatic')) {
        ['sistemas', 'tecnologia e informatica', 'tecnologia', 'informatica'].forEach(a => {
          if (!aliases.includes(a)) aliases.push(a);
        });
      }
      if (norm.includes('logica')) {
        ['logica', 'logica matematica', 'lógica', 'lógica matemática'].forEach(a => {
          const na = normalize(a);
          if (!aliases.includes(na)) aliases.push(na);
        });
      }
      return aliases;
    };

    const findGradeItems = (perObj, sub) => {
      if (!perObj) return null;
      const aliases = getSubjectAliases(sub);
      for (const alias of aliases) {
        const subFound = Object.keys(perObj).find(k => normalize(k) === alias);
        if (subFound && perObj[subFound]) {
          if (perObj[subFound][gKey]) return perObj[subFound][gKey];
          if (perObj[subFound][gAlt]) return perObj[subFound][gAlt];
          const gNorm = normalize(gKey);
          const gFound = Object.keys(perObj[subFound]).find(k => normalize(k) === gNorm);
          if (gFound && perObj[subFound][gFound]) return perObj[subFound][gFound];
        }
      }
      return null;
    };

    let items = findGradeItems(all[period], subject);
    if (!items || items.length === 0) {
      // Fallback a periodo 1° si no existe en ese periodo específico
      items = findGradeItems(all["1°"], subject);
    }

    if (!items || items.length === 0) {
      return [this.getIntroClassItem(period, subject, grade)];
    }

    // Regla obligatoria: La Clase 1 SIEMPRE debe ser Introducción a la clase
    if (!this.isIntroTopic(items[0]?.topic)) {
      const baseStd = items[0]?.dba || '';
      items.unshift(this.getIntroClassItem(period, subject, grade, baseStd));
    }

    return items;
  },

  /**
   * Obtiene automáticamente el tema, DBA y desempeño correspondiente
   * para un periodo, asignatura, grado y número correlativo de clase.
   */
  getAutoCurriculumItem(period, subject, grade, classNum) {
    const isDirGroup = subject && String(subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
    if (isDirGroup) {
      return {
        id: '',
        topic: '',
        dba: '',
        achievement: '',
        suggestedSequence: ''
      };
    }

    const num = Math.max(1, parseInt(classNum, 10) || 1);
    
    // Regla de Clase 1: Siempre es Introducción oficial
    if (num === 1) {
      const items = this.getItems(period, subject, grade);
      if (items && items.length > 0 && this.isIntroTopic(items[0]?.topic)) {
        return items[0];
      }
      return this.getIntroClassItem(period, subject, grade);
    }

    const items = this.getItems(period, subject, grade);
    if (items && items.length > 0) {
      const idx = (num - 1) % items.length;
      return items[idx];
    }

    // Generador pedagógico institucional de respaldo (asegura que nunca quede vacío)
    const subClean = String(subject || 'Clase').trim();
    const grdClean = String(grade || 'General').trim();
    const perClean = String(period || '1°').trim();
    return {
      id: `auto_${subClean}_${grdClean}_${perClean}_${num}`,
      topic: `${subClean} ${grdClean} - Eje Temático #${num} (${perClean} Periodo)`,
      dba: `DBA: Aplica los conceptos, modelos y competencias fundamentales de ${subClean} para ${grdClean} en la resolución de problemas durante el ${perClean} periodo.`,
      achievement: `Saber: Comprende los conceptos y estructuras clave de ${subClean} correspondientes a ${grdClean}. Hacer: Desarrolla actividades pedagógicas y talleres procedimentales con autonomía y rigor.`
    };
  },

  saveItems(period, subject, grade, items) {
    const all = this.getAllCurriculum();
    if (!all[period]) all[period] = {};
    if (!all[period][subject]) all[period][subject] = {};
    all[period][subject][grade] = items;
    return this.saveAllCurriculum(all);
  }
};

const CurriculumManager = {
  selectedPeriod: '1°',
  selectedSubject: '',
  selectedGrade: '',
  currentItems: [],

  init() {
    const profile = StorageService.getProfile();
    this.selectedPeriod = profile.period || '1°';
    
    // Asignatura por defecto
    const subjects = profile.subjects || [];
    if (subjects.length > 0) {
      this.selectedSubject = typeof subjects[0] === 'string' ? subjects[0] : subjects[0].name;
      const grades = this.getGradesForSubject(this.selectedSubject);
      this.selectedGrade = grades.length > 0 ? grades[0] : (profile.homeroom || '1°');
    }

    this.loadCurrentItems();
  },

  getGradesForSubject(subjectName) {
    const profile = StorageService.getProfile();
    const subObj = (profile.subjects || []).find(s => (typeof s === 'string' ? s : s.name) === subjectName);
    if (subObj && typeof subObj === 'object' && Array.isArray(subObj.grades) && subObj.grades.length > 0) {
      return subObj.grades;
    }
    return profile.grades || ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
  },

  openModal(period, subject, grade) {
    if (period) this.selectedPeriod = period;
    if (subject) this.selectedSubject = subject;
    if (grade) this.selectedGrade = grade;

    if (!this.selectedSubject) {
      this.init();
    } else {
      this.loadCurrentItems();
    }

    this.render();
    const modal = document.getElementById('curriculum-modal-backdrop');
    if (modal) modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('curriculum-modal-backdrop');
    if (modal) modal.classList.remove('active');
  },

  loadCurrentItems() {
    this.currentItems = CurriculumService.getItems(this.selectedPeriod, this.selectedSubject, this.selectedGrade);
  },

  onPeriodChange(val) {
    this.selectedPeriod = val;
    this.loadCurrentItems();
    this.render();
  },

  onSubjectChange(val) {
    this.selectedSubject = val;
    const grades = this.getGradesForSubject(val);
    if (!grades.includes(this.selectedGrade) && grades.length > 0) {
      this.selectedGrade = grades[0];
    }
    this.loadCurrentItems();
    this.render();
  },

  onGradeChange(val) {
    this.selectedGrade = val;
    this.loadCurrentItems();
    this.render();
  },

  addNewRow() {
    this.collectFromDOM();
    this.currentItems.push({
      id: 'cur_' + Date.now(),
      topic: '',
      dba: '',
      achievement: ''
    });
    this.render();
  },

  deleteRow(idx) {
    this.collectFromDOM();
    if (!confirm('¿Deseas eliminar este tema del banco curricular?')) return;
    this.currentItems.splice(idx, 1);
    this.render();
    this.saveData();
  },

  collectFromDOM() {
    const rows = document.querySelectorAll('.curriculum-row');
    const items = [];
    rows.forEach((row, idx) => {
      const topic = row.querySelector('.cur-input-topic')?.value || '';
      const dba = row.querySelector('.cur-input-dba')?.value || '';
      const achievement = row.querySelector('.cur-input-achievement')?.value || '';
      const id = this.currentItems[idx]?.id || ('cur_' + Date.now() + '_' + idx);

      if (topic.trim() || dba.trim() || achievement.trim()) {
        items.push({ id, topic, dba, achievement });
      }
    });
    this.currentItems = items;
  },

  saveData() {
    this.collectFromDOM();
    CurriculumService.saveItems(this.selectedPeriod, this.selectedSubject, this.selectedGrade, this.currentItems);
    App.showToast(`Malla de ${this.selectedSubject} (${this.selectedGrade}) - ${this.selectedPeriod} guardada`, 'success');
    this.closeModal();

    // Re-renderizar planeador si está activo para que se actualicen los selectores de temas
    if (window.Planner && window.Planner.render) {
      window.Planner.render();
    }
  },

  render() {
    const profile = StorageService.getProfile();
    const subjects = profile.subjects || [];
    const availableGrades = this.getGradesForSubject(this.selectedSubject);

    const subjectOptions = subjects.map(s => {
      const name = typeof s === 'string' ? s : s.name;
      return `<option value="${name}" ${this.selectedSubject === name ? 'selected' : ''}>${name}</option>`;
    }).join('');

    const gradeOptions = availableGrades.map(g => {
      return `<option value="${g}" ${this.selectedGrade === g ? 'selected' : ''}>${g}</option>`;
    }).join('');

    const rowsHtml = this.currentItems.map((item, idx) => `
      <tr class="curriculum-row" style="border-bottom: 1px solid var(--slate-200);">
        <td style="padding: 8px; vertical-align: top; width: 5%; text-align: center; font-weight: bold; color: var(--slate-500);">
          ${idx + 1}
        </td>
        <td style="padding: 8px; vertical-align: top; width: 28%;">
          <textarea class="form-control cur-input-topic" rows="2" style="font-size: 0.82rem; resize: vertical;" placeholder="Nombre o eje temático...">${this.escapeHtml(item.topic || '')}</textarea>
        </td>
        <td style="padding: 8px; vertical-align: top; width: 32%;">
          <textarea class="form-control cur-input-dba" rows="2" style="font-size: 0.82rem; resize: vertical;" placeholder="DBA asociado...">${this.escapeHtml(item.dba || '')}</textarea>
        </td>
        <td style="padding: 8px; vertical-align: top; width: 30%;">
          <textarea class="form-control cur-input-achievement" rows="2" style="font-size: 0.82rem; resize: vertical;" placeholder="Logro e Indicador de desempeño...">${this.escapeHtml(item.achievement || '')}</textarea>
        </td>
        <td style="padding: 8px; vertical-align: middle; width: 5%; text-align: center;">
          <button type="button" class="btn btn-danger-subtle btn-icon" onclick="CurriculumManager.deleteRow(${idx})" title="Eliminar tema">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');

    let container = document.getElementById('curriculum-modal-backdrop');
    if (!container) {
      container = document.createElement('div');
      container.id = 'curriculum-modal-backdrop';
      container.className = 'modal-backdrop';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="modal-card" style="max-width: 900px; width: 95%;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="background: var(--primary-100); color: var(--primary-700); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">📖</div>
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--slate-900);">Malla Curricular Institucional (Temas, Logros y DBAs)</h3>
              <p style="margin: 0; font-size: 0.8rem; color: var(--slate-500);">Configura los temas que aparecerán automáticamente en el planeador para cada clase</p>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-icon" onclick="CurriculumManager.closeModal()" title="Cerrar">✕</button>
        </div>

        <div class="modal-body" style="padding: 1rem 1.25rem;">
          <!-- Filtros de selección rápida -->
          <div style="display: flex; gap: 1rem; background: var(--slate-50); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--slate-200); margin-bottom: 1rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 140px;">
              <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Periodo:</label>
              <select class="form-select" onchange="CurriculumManager.onPeriodChange(this.value)">
                <option value="1°" ${this.selectedPeriod === '1°' ? 'selected' : ''}>1° Periodo</option>
                <option value="2°" ${this.selectedPeriod === '2°' ? 'selected' : ''}>2° Periodo</option>
                <option value="3°" ${this.selectedPeriod === '3°' ? 'selected' : ''}>3° Periodo</option>
                <option value="4°" ${this.selectedPeriod === '4°' ? 'selected' : ''}>4° Periodo</option>
              </select>
            </div>

            <div style="flex: 1.5; min-width: 180px;">
              <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Asignatura:</label>
              <select class="form-select" onchange="CurriculumManager.onSubjectChange(this.value)">
                ${subjectOptions}
              </select>
            </div>

            <div style="flex: 1; min-width: 120px;">
              <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Grado / Curso:</label>
              <select class="form-select" onchange="CurriculumManager.onGradeChange(this.value)">
                ${gradeOptions}
              </select>
            </div>
          </div>

          <!-- Tabla de temas -->
          <div style="max-height: 50vh; overflow-y: auto; border: 1px solid var(--slate-200); border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; background: #fff;">
              <thead style="background: var(--slate-100); position: sticky; top: 0; z-index: 1;">
                <tr>
                  <th style="padding: 8px; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-600); width: 5%;">#</th>
                  <th style="padding: 8px; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-600); width: 28%;">Eje Temático / Tema</th>
                  <th style="padding: 8px; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-600); width: 32%;">DBA (Derecho Básico)</th>
                  <th style="padding: 8px; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-600); width: 30%;">Logro e Indicador</th>
                  <th style="padding: 8px; width: 5%;"></th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml.length > 0 ? rowsHtml : `
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--slate-400); font-size: 0.85rem;">
                      No hay temas registrados para ${this.selectedSubject} en ${this.selectedGrade} (${this.selectedPeriod} Periodo).<br/>
                      Haz clic en <strong>"+ Añadir Tema"</strong> para registrar el primero.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
            <button type="button" class="btn btn-secondary" style="font-size: 0.82rem;" onclick="CurriculumManager.addNewRow()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Añadir Tema
            </button>
            <span style="font-size: 0.78rem; color: var(--slate-500);">Total temas en esta malla: <strong>${this.currentItems.length}</strong></span>
          </div>
        </div>

        <div class="modal-footer" style="padding: 0.75rem 1.25rem; background: var(--slate-50); border-top: 1px solid var(--slate-200); display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="CurriculumManager.closeModal()">Cancelar</button>
          <button type="button" class="btn btn-primary" onclick="CurriculumManager.saveData()">💾 Guardar Malla</button>
        </div>
      </div>
    `;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

CurriculumManager.save = function() {
  this.saveData();
};

CurriculumService.mallaSeptimoMatematicas = {
  "subject": "Matemáticas",
  "grade": "7°",
  "teachers": [
    "Manuel Alejandro Muñoz Palomino"
  ],
  "weeklyHours": "5H",
  "courseObjective": "Comprender y utilizar diferentes formas de representar números enteros, fraccionarios y decimales, aplicando la estructura del sistema de numeración decimal y los algoritmos para operar con ellos. Emplear estrategias de estimación, modelación simbólica y lenguaje algebraico para resolver y verificar problemas numéricos, variacionales y aleatorios, analizando situaciones de cambio y de incertidumbre en contextos reales.",
  "allPeriodsDBA": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
  "competencies": {
    "mathematical": [
      "Razonamiento y demostración",
      "Modelación",
      "Comunicación",
      "Resolución de problemas"
    ],
    "thoughts": [
      "Pensamiento Numérico y Sistemas Numéricos",
      "Pensamiento Espacial y Sistemas Geométricos",
      "Pensamiento Métrico y Sistemas de Medidas",
      "Pensamiento Aleatorio y Sistemas de Datos",
      "Pensamiento Variacional y Sistemas Algebraicos y Analíticos"
    ],
    "citizenship": [
      "Competencias Ciudadanas, Convivencia y Paz, Participación y Pluralidad: Practico el respeto, manejo mis emociones, cumplo normas y valoro las diferencias."
    ]
  },
  "periods": {
    "1°": {
      "name": "Primer Periodo: Pensamiento Numérico (Números Enteros)",
      "standard": "Justifico procedimientos aritméticos y aplico las propiedades de las operaciones con números enteros para modelar situaciones de la vida cotidiana (temperaturas, niveles, deudas, ganancias).",
      "problemQuestion": "¿Cómo profundizamos en el uso de los números enteros (Z) y sus operaciones para modelar y resolver situaciones de nuestro entorno, como temperaturas, deudas y niveles?",
      "topics": [
        "El conjunto de los Números Enteros {Z}: Necesidad histórica y números relativos con signo",
        "Representación de números enteros en la recta numérica, orden y valor absoluto",
        "Operaciones aditivas en {Z} (adición y sustracción): algoritmo, ley de signos y problemas del entorno",
        "Operaciones multiplicativas en {Z} (multiplicación y división exacta): ley de signos y aplicaciones",
        "Propiedades de las operaciones en {Z} (conmutativa, asociativa, distributiva)",
        "Potenciación y radicación de enteros: propiedades y cálculo en contextos significativos",
        "Jerarquía de las operaciones y polinomios aritméticos con signos de agrupación",
        "Introducción al lenguaje algebraico en {Z}: incógnitas, relaciones y traducción de enunciados",
        "Ecuaciones lineales básicas en {Z} aplicadas a la solución de problemas"
      ],
      "achievement": "● Reconoce y conceptualiza el conjunto de los números enteros {Z}, su representación en la recta numérica y las relaciones de orden y valor absoluto, con el propósito de modelar cuantitativamente fenómenos del entorno físico y socioeconómico donde los números naturales resultan insuficientes (tales como balances financieros, temperaturas extremas y altitudes geográficas).\n● Aplica con exactitud los algoritmos de adición, sustracción, multiplicación, división, potencias y polinomios aritméticos en {Z}, con la finalidad de estructurar estrategias de solución a problemas cotidianos y plantear ecuaciones lineales sencillas que permitan tomar decisiones fundamentadas.\n● Desarrolla el razonamiento lógico, el rigor matemático y el hábito de verificar los procedimientos propios y ajenos, con el fin de formular argumentos sólidos, emitir juicios críticos ante situaciones problema y afrontar con seguridad desafíos académicos y pruebas estandarizadas.",
      "resources": "TICs, cuaderno, aplicaciones educativas, material concreto.",
      "evaluation": "Observación y registro continuo, rúbricas analíticas, autoevaluación, coevaluación y retroalimentación formativa."
    },
    "2°": {
      "name": "Segundo Periodo: Pensamiento Numérico y Variacional (Racionales y Proporcionalidad)",
      "standard": "Resuelvo y formulo problemas que implican la potenciación, radicación y aplicación de razones y proporciones con números racionales, utilizando diferentes representaciones (fracción, decimal, porcentaje) para interpretar y comunicar situaciones de la vida cotidiana.",
      "problemQuestion": "¿De qué manera los números racionales (Q) y las relaciones de proporcionalidad nos permiten modelar situaciones de reparto, cambio y comparación en contextos cotidianos como descuentos, mezclas o escalas?",
      "topics": [
        "Conjunto de números racionales (Q): Necesidad histórica y relación con los números enteros",
        "Representación de los racionales en forma fraccionaria, decimal y porcentual",
        "Ubicación de números racionales en la recta numérica y comparación de magnitudes",
        "Operaciones con números racionales: Adición y sustracción (fracciones homogéneas y heterogéneas)",
        "Operaciones con números racionales: Multiplicación y división (fracción recíproca)",
        "Potenciación y radicación en números racionales y estrategias de simplificación",
        "Aplicación de números racionales en contextos reales (recetas, mezclas, escalas y tasas de cambio)",
        "Razones y proporciones: Regla de tres simple (directa e inversa)",
        "Cálculo de porcentajes, variaciones porcentuales y modelación de proporcionalidad"
      ],
      "achievement": "● Representa números racionales en diferentes formas y los ubica en la recta numérica, para reconocer equivalencias y relaciones entre fracciones, decimales y porcentajes en contextos reales.\n● Aplica algoritmos de operaciones con números racionales en la resolución de problemas contextualizados, para fortalecer la precisión y la coherencia en el razonamiento matemático.\n● Argumenta y justifica procedimientos de cálculo y simplificación, para comunicar con claridad sus estrategias y validar sus resultados ante sus pares.\n● Modela situaciones de proporcionalidad directa e inversa utilizando la regla de tres y porcentajes, para interpretar fenómenos cotidianos como repartos, descuentos o escalas.\n● Interpreta resultados y comunica conclusiones con lenguaje matemático adecuado, para expresar ideas cuantitativas con rigor y comprensión conceptual.",
      "resources": "TICs, cuaderno, material concreto y manipulativo, aplicaciones interactivas y trabajo colaborativo.",
      "evaluation": "Observación y registro continuo, rúbricas analíticas, autoevaluación, coevaluación y retroalimentación formativa."
    },
    "3°": {
      "name": "Tercer Periodo: Pensamiento Variacional y Espacial (Álgebra y Geometría)",
      "standard": "Formulo, represento y resuelvo problemas que involucran ecuaciones y expresiones algebraicas, aplicando propiedades de las operaciones y del orden para interpretar relaciones de variación y comunicar resultados con precisión.",
      "problemQuestion": "¿Cómo podemos usar el lenguaje algebraico y las ecuaciones para representar, analizar y resolver situaciones de cambio y relaciones entre cantidades en la vida cotidiana?",
      "topics": [
        "Lenguaje algebraico y representación simbólica: Concepto de variable, constante y término algebraico",
        "Traducción de situaciones cotidianas al lenguaje algebraico",
        "Evaluación y simplificación de expresiones algebraicas (términos semejantes y valor numérico)",
        "Identificación de patrones numéricos y relaciones funcionales",
        "Ecuaciones de primer grado con una incógnita: Planteamiento y propiedades de la igualdad",
        "Resolución de ecuaciones lineales y verificación de soluciones",
        "Aplicación de ecuaciones en contextos reales (repartos, precios, distancias, mezclas y balances)",
        "Representación y análisis de relaciones de cambio: Construcción de tablas y gráficas",
        "Interpretación de tendencias, dependencias y comunicación de resultados"
      ],
      "achievement": "● Identifica variables y constantes en expresiones algebraicas, para comprender cómo se representan relaciones de cambio y patrones en diferentes contextos.\n● Traduce situaciones cotidianas al lenguaje algebraico, para modelar fenómenos y resolver problemas con mayor precisión y claridad.\n● Resuelve ecuaciones de primer grado aplicando propiedades de igualdad y operaciones inversas, para determinar valores desconocidos y verificar la validez de sus soluciones.\n● Analiza y comunica resultados obtenidos en la resolución de ecuaciones, para fortalecer la argumentación y la interpretación matemática.\n● Representa relaciones de cambio mediante tablas y gráficas, para visualizar dependencias entre variables y comunicar tendencias de manera efectiva.\n● Argumenta sus procedimientos y resultados, para consolidar la comprensión conceptual y la comunicación matemática.",
      "resources": "Material concreto y manipulativo (tarjetas algebraicas, regletas, balanzas de ecuaciones), TICs y aplicaciones interactivas.",
      "evaluation": "Observación y registro continuo, rúbricas analíticas, autoevaluación, coevaluación y retroalimentación formativa."
    },
    "4°": {
      "name": "Cuarto Periodo: Pensamiento Aleatorio (Estadística)",
      "standard": "Recojo, organizo, analizo e interpreto datos de diferentes fuentes para describir fenómenos y tomar decisiones fundamentadas, aplicando conceptos básicos de probabilidad y medidas estadísticas.",
      "problemQuestion": "¿Cómo podemos usar la estadística y la probabilidad para interpretar información, tomar decisiones y comunicar resultados sobre situaciones reales en nuestro entorno?",
      "topics": [
        "Recolección y organización de datos: Tipos de variables (cualitativas y cuantitativas)",
        "Tablas de frecuencias (absoluta, relativa y porcentual) para datos no agrupados",
        "Representación gráfica de datos: Diagramas de barras, sectores circulares y pictogramas",
        "Uso de herramientas digitales para organizar información e identificación de sesgos",
        "Medidas de tendencia central: Media aritmética (cálculo e interpretación)",
        "Medidas de tendencia central: Mediana y Moda en conjuntos de datos",
        "Comparación de conjuntos de datos y formulación de conclusiones basadas en evidencia",
        "Introducción a la probabilidad: Concepto de experimento aleatorio, evento y espacio muestral",
        "Cálculo de probabilidades simples (Regla de Laplace) y estimación de la incertidumbre"
      ],
      "achievement": "● Recolecta y organiza datos en tablas y gráficos, para representar información de manera clara y facilitar su análisis.\n● Calcula medidas de tendencia central (media, mediana y moda), para resumir y comparar conjuntos de datos de forma significativa.\n● Interpreta gráficos y tablas de frecuencia, para comunicar conclusiones y tomar decisiones basadas en evidencia.\n● Aplica conceptos básicos de probabilidad en situaciones cotidianas, para estimar resultados posibles y comprender la incertidumbre.",
      "resources": "TICs, cuaderno, material concreto y manipulativo (dados, fichas, encuestas), aplicaciones interactivas y proyectos prácticos.",
      "evaluation": "Observación y registro continuo, rúbricas analíticas, autoevaluación, coevaluación y retroalimentación formativa."
    }
  }
};


CurriculumService.mallaDecimoRobotica = {
  subject: "Robótica",
  grade: "10°",
  weeklyHours: "2H (Jueves)",
  teachers: ["Manuel Muñoz"],
  courseObjective: "Diseñar, ensamblar, cablear y programar una pinza robótica articulada mediante modelado digital CAD (Tinkercad), corte de precisión en acrílico/MDF y control electrónico con Arduino y servomotores, traduciendo señales analógicas de un joystick en trayectorias mecánicas angulares con la asistencia crítica de herramientas de Inteligencia Artificial.",
  problemQuestion: "¿Cómo transformar señales analógicas de un módulo joystick en trayectorias mecánicas angulares para accionar una pinza robótica articulada mediante servomotores y engranajes?",
  standard: "Analizo y seleccionar componentes electrónicos, sistemas de modelado digital y estructuras de control por software para integrarlos en un prototipo mecatrónico funcional.",
  thematicAxes: [
    {
      num: 1,
      title: "Electrónica y Potencia del Robot",
      weeks: "Semanas 1 a 2",
      topics: [
        "Señales analógicas vs. digitales: principio del joystick (potenciómetros de 2 ejes X/Y y botón Z).",
        "Actuadores angulares: servomotor (MG995 / MG996R o SG90), principio de modulación PWM y torque.",
        "Gestión de potencia: alimentación externa independiente (pack de baterías), masa común (GND) y protección del microcontrolador."
      ]
    },
    {
      num: 2,
      title: "Diseño CAD y Fabricación Mecánica",
      weeks: "Semanas 3 a 5",
      topics: [
        "Interpretación de planos técnicos CNC a escala 1:1 (piezas 18 a 27).",
        "Modelado paramétrico en CAD (Tinkercad): simulación 3D de eslabones articulados.",
        "Ensamble estructural: calado/corte de piezas (acrílico/MDF) y reducción de fricción con arandelas.",
        "Sincronización de engranajes 19 y 20 y fijación del cero mecánico en el chasis (pieza 18)."
      ]
    },
    {
      num: 3,
      title: "Programación y Control en Arduino asistido por IA",
      weeks: "Semanas 6 a 8",
      topics: [
        "Prompting técnico: formulación de instrucciones precisas a herramientas de IA para generar la plantilla base del código en C++ (Arduino IDE).",
        "Interpretación y lectura crítica de código.",
        "Estructura del sketch de Arduino, lectura analógica del pin del joystick y calibración del mapeo map(valor, 0, 1023, min_ang, max_ang) para no forzar los dientes del acrílico."
      ]
    },
    {
      num: 4,
      title: "Funcionamiento, Calibración e Integración",
      weeks: "Semanas 9 a 10",
      topics: [
        "Acople físico: fijación del servomotor al chasis (pieza 18) y calibración del cero mecánico.",
        "Pruebas de cinemática: apertura y cierre simétrico en lazo abierto mediante mando por joystick.",
        "Desafío 'Pick & Place' en equipos de 3: prueba de carga, sujeción y traslado de objetos."
      ]
    }
  ],
  performanceIndicators: {
    saber: "Comprende cómo la variación de voltaje del joystick se traduce en movimiento angular y es capaz de explicar la función de cada línea del código de Arduino generado con asistencia de IA.",
    hacer: "Ensambla la estructura según los planos técnicos CNC, cablea el circuito en protoboard y adapta el código generado por IA configurando los pines y límites de giro correctos.",
    ser: "Cumple de manera responsable con su rol en el equipo de 3 estudiantes, cuida las herramientas y asume una postura ética y analítica ante la IA (usándola como apoyo y no como reemplazo de su comprensión).",
    prototipado: "Utiliza el prototipado rápido como herramienta para la resolución de problemas mecatrónicos."
  },
  resources: [
    "Planos técnicos CNC descargables a escala 1:1 (piezas 18 a 27).",
    "Esquema eléctrico oficial de conexión (Arduino, Joystick, Servo y Baterías).",
    "Guía de prompting para programación en Arduino con IA.",
    "Impresoras 3D, cortadoras láser y herramientas de prototipado rápido."
  ],
  formativeEvaluation: [
    "Diagnóstica/Proceso: Pruebas semanales de lectura del joystick en el Monitor Serial y simulación en Tinkercad Circuits.",
    "Sustentación de Código (Interpretación de IA): Evaluación oral individual o grupal donde las estudiantes explican qué hace cada bloque del código sugerido por la IA y cómo modificaron los parámetros clave.",
    "Revisión Mecánica: Movimiento suave y sincronizado de los engranajes 19 y 20 sin atascos.",
    "Reto Funcional Pick & Place: Eficacia de la pinza al sujetar y trasladar piezas sin que el motor vibre ni pierda posición.",
    "Bitácora y Coevaluación: Registro grupal del prompt usado, código final comentado, diagrama de conexiones y evaluación interna entre pares."
  ]
};


CurriculumService.mallaSeptimoSistemas = {
  subject: "Tecnología e Informática / Sistemas",
  grade: "7°",
  period: "1°",
  weeklyHours: "1H (Lunes)",
  teachers: ["Manuel Alejandro Muñoz Palomino"],
  courseObjective: "Apropiar y utilizar responsablemente las herramientas ofimáticas y de creación de contenidos digitales para comunicar ideas, analizar datos y producir piezas audiovisuales e interactivas con calidad profesional y creatividad.",
  standard: "Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.",
  problemQuestion: "¿Cómo utilizar las herramientas de ofimática y creación de contenido digital para comunicar ideas con calidad profesional y creatividad?",
  thematicAxes: [
    {
      num: 1,
      title: "Procesadores de texto",
      topics: [
        "Aplicación de estilos, tablas y diseño editorial básico.",
        "Normas de presentación y formato digital."
      ]
    },
    {
      num: 2,
      title: "Hojas de cálculo",
      topics: [
        "Uso de fórmulas avanzadas y gráficos.",
        "Automatización de cálculos y análisis de datos."
      ]
    },
    {
      num: 3,
      title: "Presentaciones interactivas",
      topics: [
        "Integración de elementos multimedia y animaciones.",
        "Diseño visual coherente y atractivo."
      ]
    },
    {
      num: 4,
      title: "Creación y edición de contenido digital",
      topics: [
        "Edición y grabación de video con criterios estéticos y técnicos.",
        "Producción de piezas digitales (texto, imagen, audio o video) con propósito comunicativo."
      ]
    }
  ],
  performanceIndicators: [
    "Gestiona documentos complejos con estilos definidos, para comunicar información con claridad y presentación profesional.",
    "Automatiza cálculos mediante funciones avanzadas, para analizar datos y tomar decisiones informadas en contextos académicos o cotidianos.",
    "Crea presentaciones digitales interactivas, para expresar ideas de forma visual y atractiva que capte la atención del público.",
    "Diseña piezas de contenido digital (texto, imagen, audio o video), para transmitir mensajes con coherencia estética y técnica.",
    "Edita y graba videos con criterios técnicos y narrativos, para producir materiales audiovisuales que comuniquen ideas o proyectos escolares con impacto.",
    "Evalúa la pertinencia y calidad de los contenidos digitales creados, para mejorar continuamente sus producciones y fortalecer su pensamiento crítico."
  ],
  resources: [
    "Computadores, tabletas y celulares disponibles en aula o hogar.",
    "Software de edición de video (Clip Champ, Canva, Cap Cut, Movie Maker).",
    "Plataformas colaborativas y almacenamiento en la nube.",
    "Tutoriales, guías interactivas y recursos multimedia creados por los estudiantes."
  ],
  formativeEvaluation: [
    "Rúbrica de proyectos ofimáticos y audiovisuales.",
    "Portafolio digital con evidencias de progreso.",
    "Observación del trabajo en la nube y del proceso de edición.",
    "Producto final: video o presentación multimedia con propósito educativo o social."
  ],
  supportStrategies: [
    "Talleres prácticos de nivelación guiada en sala de sistemas para afianzar el uso de fórmulas y estilos.",
    "Acompañamiento personalizado entre pares para el montaje y exportación de proyectos audiovisuales.",
    "Guías paso a paso y videotutoriales de apoyo alojados en la nube para consulta asincrónica."
  ]
};

CurriculumService.mallaSeptimoTecnologia = CurriculumService.mallaSeptimoSistemas;

if (typeof window !== 'undefined') {
  window.CurriculumService = CurriculumService;
  window.CurriculumManager = CurriculumManager;
  window.DEFAULT_CURRICULUM = DEFAULT_CURRICULUM;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CurriculumService;
}

