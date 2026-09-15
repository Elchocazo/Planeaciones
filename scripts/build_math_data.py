# -*- coding: utf-8 -*-
"""
Module defining Math (7°, 3°, 2°) and Logic (6°) for all 4 periods.
Source: Mallas/Mallas Manuel 2026 -2027 Matemáticas.pdf
"""

dba_m7_all = (
    "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n"
    "● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n"
    "● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n"
    "● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n"
    "● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n"
    "● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n"
    "● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos."
)

dba_m3_all = (
    "● Interpreta, formula y resuelve problemas aditivos (composición, transformación, comparación) y multiplicativos (adición repetida, arreglos rectangulares) en contextos escolares y cotidianos.\n"
    "● Utiliza el sistema de numeración decimal para comparar, ordenar y descomponer números hasta 99.999 por su valor posicional (DM-UM-C-D-U).\n"
    "● Describe y representa formas bidimensionales y tridimensionales de acuerdo con sus propiedades geométricas (lados, vértices, caras).\n"
    "● Mide y estima magnitudes (longitud, masa, tiempo, capacidad) utilizando unidades convencionales (metro, gramo, litro, horas) y no convencionales.\n"
    "● Recolecta, clasifica y organiza datos en tablas de conteo, pictogramas y diagramas de barras, comunicando conclusiones."
)

dba_m2_all = (
    "● Compara, ordena y utiliza el Sistema de Numeración Decimal para establecer relaciones entre números hasta 9.999 y el valor posicional (UM-C-D-U).\n"
    "● Utiliza estrategias de cálculo (agrupación, descomposición) para resolver adiciones y sustracciones con y sin reagrupación, comprendiendo su relación inversa.\n"
    "● Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) en contextos de su entorno escolar y familiar.\n"
    "● Identifica patrones numéricos y utiliza propiedades de las operaciones (conmutativa, asociativa y elemento neutro) para justificar y optimizar cálculos.\n"
    "● Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.\n"
    "● Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos."
)

dba_log_all = (
    "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n"
    "● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n"
    "● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n"
    "● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n"
    "● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace."
)

def populate_math(all_data):
    # =========================================================================
    # LÓGICA 6°
    # =========================================================================
    all_data["1°"]["Lógica"]["6°"] = [
        {
            "id": "log-6-1-1",
            "topic": "Lógica de conjuntos y fundamentos aritméticos: Proposiciones y conectores lógicos (enunciados, valor verdad, conectores)",
            "dba": dba_log_all,
            "achievement": "Diferencia proposiciones de enunciados abiertos y cerrados, determinando su valor de verdad mediante tablas de verdad y conectores lógicos básicos.",
            "suggestedSequence": "Inicio: Análisis de enunciados del lenguaje cotidiano para determinar cuáles pueden evaluarse como verdaderos o falsos. Desarrollo: Formalización de proposiciones simples y compuestas con conectores lógicos (conjunción, disyunción, negación). Cierre: Taller aplicativo construyendo tablas de verdad y evaluando razonamientos."
        },
        {
            "id": "log-6-1-2",
            "topic": "Razonamiento con conjuntos: Diagramas de Venn, relaciones de pertenencia, unión, intersección y diferencia",
            "dba": dba_log_all,
            "achievement": "Emplea diagramas de Venn y operaciones entre conjuntos para modelar situaciones problema y clasificar datos numéricos del entorno.",
            "suggestedSequence": "Inicio: Dinámica grupal de clasificación de estudiantes por preferencias para visualizar intersecciones. Desarrollo: Operaciones formales de unión, intersección y complemento entre conjuntos numéricos. Cierre: Resolución de problemas cuantitativos contextualizados con diagramas de Venn."
        },
        {
            "id": "log-6-1-3",
            "topic": "Lógica numérica y divisibilidad: Números primos, compuestos, criterios de divisibilidad, MCD y MCM",
            "dba": dba_log_all,
            "achievement": "Aplica criterios de divisibilidad y descomposición en factores primos para calcular el MCD y MCM en la resolución de problemas de sincronización y repartos.",
            "suggestedSequence": "Inicio: Reto de reparto equitativo y coincidencias de tiempo que ilustran el MCD y el MCM. Desarrollo: Descomposición factorial simultánea y aplicación de criterios de divisibilidad del 2 al 11. Cierre: Taller de problemas prácticos de horarios y empaquetado verificando respuestas."
        },
        {
            "id": "log-6-1-4",
            "topic": "Argumentación deductiva y validación crítica de razonamientos lógicos",
            "dba": dba_log_all,
            "achievement": "Argumenta deducciones matemáticas y valida críticamente procedimientos propios y ajenos mediante el razonamiento lógico formal.",
            "suggestedSequence": "Inicio: Presentación de paradojas lógicas y acertijos para estimular el debate reflexivo. Desarrollo: Estructuración formal de silogismos y argumentos premisa-conclusión en matemáticas. Cierre: Evaluación formativa mediante coevaluación de argumentos y detección de falacias."
        }
    ]

    all_data["2°"]["Lógica"]["6°"] = [
        {
            "id": "log-6-2-1",
            "topic": "Patrones numéricos, secuencias lógicas y regularidades en el entorno",
            "dba": dba_log_all,
            "achievement": "Identifica, formula y generaliza patrones y regularidades numéricas y geométricas para predecir términos futuros en secuencias lógicas.",
            "suggestedSequence": "Inicio: Observación de series visuales incompletas para descubrir la regla de formación. Desarrollo: Representación verbal y matemática de secuencias crecientes y decrecientes. Cierre: Creación y resolución de desafíos de secuencias lógicas en parejas."
        },
        {
            "id": "log-6-2-2",
            "topic": "Introducción al pensamiento variacional: Constantes, variables y traducción de enunciados a expresiones algebraicas",
            "dba": dba_log_all,
            "achievement": "Traduce enunciados del lenguaje natural al lenguaje algebraico básico reconociendo el papel de las variables e incógnitas.",
            "suggestedSequence": "Inicio: Adivinanzas de números ('Pienso un número, le sumo 8 y obtengo 20...'). Desarrollo: Asignación de literales a cantidades desconocidas y escritura de expresiones algebraicas. Cierre: Guía de traducción bidireccional entre lenguaje cotidiano y simbólico."
        },
        {
            "id": "log-6-2-3",
            "topic": "Ecuaciones lineales básicas con enteros y racionales: Modelo de balanza y operaciones inversas",
            "dba": dba_log_all,
            "achievement": "Plantea y resuelve ecuaciones lineales de primer grado sencillas aplicando propiedades de igualdad y operaciones inversas.",
            "suggestedSequence": "Inicio: Uso del modelo visual de una balanza en equilibrio para comprender la igualdad. Desarrollo: Procedimiento de transposición de términos y despeje ordenado de incógnitas. Cierre: Resolución de problemas cotidianos modelados con ecuaciones de primer grado."
        },
        {
            "id": "log-6-2-4",
            "topic": "Estrategias de verificación, análisis de coherencia y justificación de respuestas",
            "dba": dba_log_all,
            "achievement": "Verifica la plausibilidad y coherencia de las soluciones obtenidas sustituyendo valores en la expresión original.",
            "suggestedSequence": "Inicio: Análisis de casos con respuestas numéricas absurdas para fomentar el sentido crítico. Desarrollo: Verificación formal sustituyendo la incógnita hallada en la ecuación original. Cierre: Taller de autoevaluación con lista de chequeo de rigor procedimental."
        }
    ]

    all_data["3°"]["Lógica"]["6°"] = [
        {
            "id": "log-6-3-1",
            "topic": "Lógica espacial y razonamiento geométrico: Puntos, rectas, planos y medición de ángulos",
            "dba": dba_log_all,
            "achievement": "Conceptualiza elementos geométricos fundamentales y clasifica ángulos según su medida y posición en el espacio.",
            "suggestedSequence": "Inicio: Rastreo de elementos geométricos en la arquitectura del colegio. Desarrollo: Medición y construcción de ángulos (agudo, recto, obtuso, llano) con transportador y regla. Cierre: Taller de dibujo geométrico con precisión y rotulación correcta."
        },
        {
            "id": "log-6-3-2",
            "topic": "Clasificación y propiedades de polígonos: Triángulos, cuadriláteros y polígonos regulares",
            "dba": dba_log_all,
            "achievement": "Clasifica polígonos regulares e irregulares analizando lados, vértices y la suma de sus ángulos interiores.",
            "suggestedSequence": "Inicio: Clasificación de figuras geométricas a partir de imágenes del entorno. Desarrollo: Demostración práctica de la suma de ángulos internos en triángulos y cuadriláteros. Cierre: Construcción de figuras poligonales en geoplano o papel milimetrado."
        },
        {
            "id": "log-6-3-3",
            "topic": "Transformaciones en el plano cartesiano: Traslación, rotación, reflexión y simetría",
            "dba": dba_log_all,
            "achievement": "Aplica traslaciones, rotaciones y reflexiones sobre figuras bidimensionales en el plano cartesiano identificando ejes de simetría.",
            "suggestedSequence": "Inicio: Dinámica de movimientos corporales reflejados en espejo para introducir la simetría. Desarrollo: Ubicación de pares ordenados (x,y) y aplicación de transformaciones rígidas a polígonos. Cierre: Diseño de un mosaico o teselado artístico aplicando simetría axial y central."
        },
        {
            "id": "log-6-3-4",
            "topic": "Cálculo y estimación de perímetro y área en polígonos en contextos reales",
            "dba": dba_log_all,
            "achievement": "Calcula el perímetro y el área de figuras compuestas aplicando fórmulas en situaciones prácticas de diseño y medición.",
            "suggestedSequence": "Inicio: Medición del perímetro y área del salón de clases para calcular materiales de pintura o baldosa. Desarrollo: Fórmulas de área para cuadriláteros y triángulos, y descomposición de polígonos complejos. Cierre: Taller aplicativo resolviendo problemas de optimización de espacio."
        }
    ]

    all_data["4°"]["Lógica"]["6°"] = [
        {
            "id": "log-6-4-1",
            "topic": "Análisis crítico de datos y detección de sesgos o falacias estadísticas en medios",
            "dba": dba_log_all,
            "achievement": "Analiza información estadística presentada en noticias y publicidad detectando sesgos, escalas distorsionadas y falacias.",
            "suggestedSequence": "Inicio: Exposición de gráficas publicitarias engañosas para debatir su impacto en el consumidor. Desarrollo: Identificación de muestras no representativas, correlaciones espurias y escalas truncadas. Cierre: Redacción de un informe crítico analizando una noticia con datos estadísticos."
        },
        {
            "id": "log-6-4-2",
            "topic": "Tablas de frecuencia y representación gráfica: Diagramas de barras, circulares y pictogramas",
            "dba": dba_log_all,
            "achievement": "Organiza datos en tablas de frecuencias absolutas y relativas, elaborando gráficos pertinentes para comunicar resultados.",
            "suggestedSequence": "Inicio: Realización de una encuesta rápida en el aula sobre hábitos escolares. Desarrollo: Construcción de tablas de distribución de frecuencias y diagramas de barras y sectores. Cierre: Exposición oral de las conclusiones derivadas de los gráficos construidos."
        },
        {
            "id": "log-6-4-3",
            "topic": "Medidas de tendencia central: Media aritmética, mediana y moda en toma de decisiones",
            "dba": dba_log_all,
            "achievement": "Calcula e interpreta la media, la mediana y la moda de un conjunto de datos para fundamentar decisiones objetivas.",
            "suggestedSequence": "Inicio: Análisis comparativo de promedios de calificaciones para evaluar el rendimiento grupal. Desarrollo: Procedimientos de cálculo para media, mediana y moda diferenciando su aplicabilidad. Cierre: Resolución de situaciones problema empresariales eligiendo la medida más representativa."
        },
        {
            "id": "log-6-4-4",
            "topic": "Lógica probabilística: Eventos seguros, posibles e imposibles, espacio muestral y regla de Laplace",
            "dba": dba_log_all,
            "achievement": "Determina el espacio muestral de un experimento aleatorio y calcula la probabilidad clásica mediante la regla de Laplace.",
            "suggestedSequence": "Inicio: Experimentos prácticos con monedas, dados y ruletas registrando frecuencias relativas. Desarrollo: Formalización del espacio muestral y cálculo de probabilidades simples P(A) = favorables / posibles. Cierre: Taller de cálculo de probabilidades aplicadas a juegos de azar y pronósticos cotidianos."
        }
    ]

    # =========================================================================
    # MATEMÁTICAS 7°
    # =========================================================================
    all_data["1°"]["Matemáticas"]["7°"] = [
        {
            "id": "mat-7-1-1",
            "topic": "El conjunto de los Números Enteros {Z}: Necesidad histórica y números relativos con signo",
            "dba": dba_m7_all,
            "achievement": "Reconoce y conceptualiza el conjunto de los números enteros {Z}, su necesidad histórica y su utilidad para modelar temperaturas, altitudes y balances financieros.",
            "suggestedSequence": "Inicio: Reflexión sobre situaciones donde los números naturales son insuficientes (temperaturas bajo cero, saldos en contra). Desarrollo: Definición formal del conjunto {Z} = Z- U {0} U Z+ y representación de números relativos. Cierre: Taller de clasificación y modelación de situaciones reales con números con signo."
        },
        {
            "id": "mat-7-1-2",
            "topic": "Representación de números enteros en la recta numérica, orden y valor absoluto",
            "dba": dba_m7_all,
            "achievement": "Ubica números enteros en la recta numérica, establece relaciones de orden (<, >, =) y calcula el valor absoluto como distancia geométrica al origen.",
            "suggestedSequence": "Inicio: Noción geométrica de distancia y simetría en la recta numérica. Desarrollo: Formalización del valor absoluto |a| y criterios de ordenación en {Z}. Cierre: Ejercicios de ubicación en la recta numérica y comparación de enteros."
        },
        {
            "id": "mat-7-1-3",
            "topic": "Operaciones aditivas en {Z} (adición y sustracción): Algoritmo, ley de signos y problemas del entorno",
            "dba": dba_m7_all,
            "achievement": "Aplica los algoritmos de adición y sustracción de números enteros utilizando la ley de signos para resolver problemas contextualizados.",
            "suggestedSequence": "Inicio: Dinámica de ganancias y pérdidas financieras para ilustrar la suma y resta de enteros. Desarrollo: Reglas de signos para la suma y eliminación de paréntesis precedidos de signo negativo. Cierre: Resolución de problemas contextualizados de variación térmica y estados de cuenta."
        },
        {
            "id": "mat-7-1-4",
            "topic": "Operaciones multiplicativas en {Z} (multiplicación y división exacta): Ley de signos y aplicaciones",
            "dba": dba_m7_all,
            "achievement": "Resuelve multiplicaciones y divisiones exactas en {Z} aplicando con exactitud la ley de signos en operaciones directas y combinadas.",
            "suggestedSequence": "Inicio: Demostración intuitiva de por qué 'menos por menos da más' usando secuencias y patrones. Desarrollo: Algoritmos de multiplicación y división exacta con números enteros signados. Cierre: Taller de ejercitación y cálculo mental rápido con la ley de signos."
        },
        {
            "id": "mat-7-1-5",
            "topic": "Propiedades de las operaciones en {Z} (conmutativa, asociativa, distributiva)",
            "dba": dba_m7_all,
            "achievement": "Justifica procedimientos aritméticos aplicando las propiedades conmutativa, asociativa y distributiva para simplificar cálculos.",
            "suggestedSequence": "Inicio: Verificación empírica de si alterar el orden o agrupar modifica el resultado al operar enteros. Desarrollo: Formalización de las propiedades conmutativa, asociativa, elemento neutro y distributiva. Cierre: Ejercicios de simplificación de cálculos aplicando la propiedad distributiva."
        },
        {
            "id": "mat-7-1-6",
            "topic": "Potenciación y radicación de enteros: Propiedades y cálculo en contextos significativos",
            "dba": dba_m7_all,
            "achievement": "Calcula potencias y raíces exactas de números enteros determinando el signo del resultado según la paridad del exponente.",
            "suggestedSequence": "Inicio: Análisis de casos de bases negativas elevadas a exponentes pares e impares. Desarrollo: Propiedades de la potenciación (producto de bases iguales, potencia de potencia) y radicación exacta. Cierre: Taller de cálculo y resolución de problemas de crecimiento potencial."
        },
        {
            "id": "mat-7-1-7",
            "topic": "Jerarquía de las operaciones y polinomios aritméticos con signos de agrupación",
            "dba": dba_m7_all,
            "achievement": "Resuelve polinomios aritméticos con enteros respetando el orden jerárquico de las operaciones y la eliminación ordenada de signos de agrupación.",
            "suggestedSequence": "Inicio: Análisis de una expresión ambigua para debatir el orden obligatorio de cálculo. Desarrollo: Jerarquía de operaciones: signos de agrupación (paréntesis, corchetes, llaves), potencias/raíces, productos/cocientes, sumas/restas. Cierre: Taller en parejas resolviendo polinomios aritméticos verificando paso a paso."
        },
        {
            "id": "mat-7-1-8",
            "topic": "Introducción al lenguaje algebraico en {Z}: Incógnitas, relaciones y traducción de enunciados",
            "dba": dba_m7_all,
            "achievement": "Traduce enunciados verbales de situaciones cotidianas al lenguaje algebraico simbólico identificando incógnitas y relaciones de equivalencia.",
            "suggestedSequence": "Inicio: Retos de pensamiento numérico expresados en lenguaje cotidiano. Desarrollo: Asignación de variables literales y modelación simbólica de frases matemáticas. Cierre: Ejercicios de traducción bidireccional entre lenguaje natural y algebraico."
        },
        {
            "id": "mat-7-1-9",
            "topic": "Ecuaciones lineales básicas en {Z} aplicadas a la solución de problemas",
            "dba": dba_m7_all,
            "achievement": "Formula y resuelve ecuaciones lineales de la forma x + a = b y ax = b en el conjunto de los enteros para responder interrogantes prácticos.",
            "suggestedSequence": "Inicio: Modelo de balanza equilibrada para plantear ecuaciones de primer grado. Desarrollo: Métodos de transposición de términos y operaciones inversas para despejar la variable. Cierre: Planteamiento y solución de problemas cotidianos verificando la validez de la respuesta."
        }
    ]

    all_data["2°"]["Matemáticas"]["7°"] = [
        {
            "id": "mat-7-2-1",
            "topic": "Conjunto de números racionales (Q): Necesidad histórica y relación con los números enteros",
            "dba": dba_m7_all,
            "achievement": "Comprende el origen y la necesidad de los números racionales (Q) como cociente de dos enteros con denominador no nulo.",
            "suggestedSequence": "Inicio: Situaciones de medición y repartos que no tienen solución en {Z} (dividir 5 panes entre 4 personas). Desarrollo: Definición formal de {Q} = {a/b | a,b en Z, b != 0} y fracciones equivalentes. Cierre: Taller de simplificación y amplificación de fracciones racionales."
        },
        {
            "id": "mat-7-2-2",
            "topic": "Representación de los racionales en forma fraccionaria, decimal y porcentual",
            "dba": dba_m7_all,
            "achievement": "Convierte números racionales entre sus representaciones fraccionaria, decimal (exacta, periódica pura y mixta) y porcentual.",
            "suggestedSequence": "Inicio: Análisis de ofertas comerciales (1/2 precio, 50% de descuento, 0.5 de rebaja). Desarrollo: Algoritmos de conversión de fracción a decimal y clasificación de decimales finitos y periódicos. Cierre: Tabla de equivalencias entre fracción, decimal y porcentaje en contextos de compras."
        },
        {
            "id": "mat-7-2-3",
            "topic": "Ubicación de números racionales en la recta numérica y comparación de magnitudes",
            "dba": dba_m7_all,
            "achievement": "Ubica racionales en la recta numérica dividiendo la unidad en partes iguales y establece relaciones de orden entre fracciones y decimales.",
            "suggestedSequence": "Inicio: División geométrica de segmentos unitarios en partes iguales en la pizarra. Desarrollo: Métodos para comparar racionales (productos cruzados, común denominador y forma decimal). Cierre: Ejercicios de ordenación de menor a mayor con racionales positivos y negativos."
        },
        {
            "id": "mat-7-2-4",
            "topic": "Operaciones con números racionales: Adición y sustracción (fracciones homogéneas y heterogéneas)",
            "dba": dba_m7_all,
            "achievement": "Ejecuta adiciones y sustracciones de fracciones homogéneas y heterogéneas y números decimales utilizando el mínimo común múltiplo.",
            "suggestedSequence": "Inicio: Problemas de recetas culinarias y mezclas de ingredientes que requieren sumar fracciones. Desarrollo: Algoritmo formal del MCM para sumar y restar fracciones heterogéneas y regla de signos. Cierre: Resolución de problemas contextualizados de longitudes y pesos con fracciones."
        },
        {
            "id": "mat-7-2-5",
            "topic": "Operaciones con números racionales: Multiplicación y división (fracción recíproca)",
            "dba": dba_m7_all,
            "achievement": "Aplica algoritmos de multiplicación y división de números racionales simplificando resultados antes y después de operar.",
            "suggestedSequence": "Inicio: Interpretación gráfica de la fracción de una fracción (ej. la mitad de un cuarto). Desarrollo: Producto directo numerador por numerador y división multiplicando por la fracción recíproca. Cierre: Taller de cálculo y simplificación de operaciones multiplicativas con racionales."
        },
        {
            "id": "mat-7-2-6",
            "topic": "Potenciación y radicación en números racionales y estrategias de simplificación",
            "dba": dba_m7_all,
            "achievement": "Aplica las propiedades de la potenciación y radicación de fracciones distribuyendo exponentes y raíces en numerador y denominador.",
            "suggestedSequence": "Inicio: Cálculo de áreas de cuadrados con lados fraccionarios. Desarrollo: Propiedades de la potencia de una fracción y radicación distributiva en Q. Cierre: Ejercicios de operaciones combinadas con potencias y raíces de racionales."
        },
        {
            "id": "mat-7-2-7",
            "topic": "Aplicación de números racionales en contextos reales (recetas, mezclas, escalas y tasas de cambio)",
            "dba": dba_m7_all,
            "achievement": "Resuelve problemas complejos de la vida diaria que involucran números racionales modelando situaciones de cambio y proporción.",
            "suggestedSequence": "Inicio: Análisis de planos a escala y conversión de divisas internacionales. Desarrollo: Modelación matemática de situaciones de repartos proporcionales y tasas de consumo. Cierre: Taller en equipos de formulación y resolución de problemas del entorno escolar."
        },
        {
            "id": "mat-7-2-8",
            "topic": "Razones y proporciones: Regla de tres simple (directa e inversa)",
            "dba": dba_m7_all,
            "achievement": "Distingue magnitudes directa e inversamente proporcionales y aplica la regla de tres simple para hallar valores desconocidos.",
            "suggestedSequence": "Inicio: Comparación entre situaciones: más horas trabajadas = más dinero (directa) vs. más obreros = menos tiempo (inversa). Desarrollo: Planteamiento formal de proporciones a/b = c/d y algoritmo de regla de tres directa e inversa. Cierre: Taller de problemas prácticos de velocidad, tiempo, costos y rendimientos."
        },
        {
            "id": "mat-7-2-9",
            "topic": "Cálculo de porcentajes, variaciones porcentuales y modelación de proporcionalidad",
            "dba": dba_m7_all,
            "achievement": "Calcula porcentajes de cantidades, aumentos, descuentos e IVA en contextos de finanzas personales y comercio.",
            "suggestedSequence": "Inicio: Análisis de facturas comerciales identificando subtotal, IVA y descuentos. Desarrollo: Métodos de cálculo de porcentaje como fracción decimal y regla de tres. Cierre: Simulación de compras y ventas con cálculo de variaciones porcentuales."
        }
    ]

    all_data["3°"]["Matemáticas"]["7°"] = [
        {
            "id": "mat-7-3-1",
            "topic": "Lenguaje algebraico y representación simbólica: Constantes, variables y términos algebraicos",
            "dba": dba_m7_all,
            "achievement": "Identifica los elementos de un término algebraico (signo, coeficiente, parte literal y exponente) y traduce enunciados al lenguaje simbólico.",
            "suggestedSequence": "Inicio: Debate sobre la necesidad del álgebra para generalizar propiedades aritméticas. Desarrollo: Definición de monomio, grado absoluto y relativo, y valor numérico de expresiones algebraicas. Cierre: Taller de cálculo del valor numérico sustituyendo variables por números enteros."
        },
        {
            "id": "mat-7-3-2",
            "topic": "Identificación de patrones numéricos y relaciones funcionales",
            "dba": dba_m7_all,
            "achievement": "Generaliza patrones y regularidades formulando expresiones algebraicas que predicen el comportamiento de una secuencia.",
            "suggestedSequence": "Inicio: Exploración de secuencias geométricas y tablas de números para encontrar la regla general. Desarrollo: Deducción de fórmulas del término n-ésimo (ej. 2n + 1) para secuencias aritméticas. Cierre: Ejercicios de predicción de términos lejanos en secuencias lógicas."
        },
        {
            "id": "mat-7-3-3",
            "topic": "Planteamiento y solución de ecuaciones de primer grado con una incógnita",
            "dba": dba_m7_all,
            "achievement": "Resuelve ecuaciones lineales de primer grado con una incógnita aplicando propiedades de igualdad y transposición de términos.",
            "suggestedSequence": "Inicio: Retos lógicos de balanzas para deducir el principio de equivalencia. Desarrollo: Algoritmo de resolución para ecuaciones de la forma ax + b = c y ax + b = cx + d. Cierre: Taller individual de resolución de ecuaciones lineales con verificación."
        },
        {
            "id": "mat-7-3-4",
            "topic": "Uso de propiedades de igualdad y operaciones inversas en ecuaciones",
            "dba": dba_m7_all,
            "achievement": "Justifica cada paso en la solución de una ecuación mediante las propiedades uniforme, conmutativa y distributiva.",
            "suggestedSequence": "Inicio: Análisis de errores frecuentes al despejar variables para comprender el rigor matemático. Desarrollo: Demostración de cómo las operaciones inversas anulan términos en ambos miembros de la ecuación. Cierre: Taller de sustentación oral explicando los pasos de resolución de una ecuación."
        },
        {
            "id": "mat-7-3-5",
            "topic": "Verificación de soluciones y análisis de coherencia en situaciones reales",
            "dba": dba_m7_all,
            "achievement": "Comprueba las soluciones halladas reemplazando valores en la ecuación original y analiza si la respuesta tiene sentido en el contexto.",
            "suggestedSequence": "Inicio: Discusión sobre por qué una solución numérica negativa puede no ser válida para edades o distancias. Desarrollo: Procedimiento formal de verificación por sustitución directa en ambos miembros. Cierre: Resolución de problemas con análisis crítico de la validez física o económica del resultado."
        },
        {
            "id": "mat-7-3-6",
            "topic": "Aplicación de ecuaciones en contextos cotidianos (repartos, precios, distancias, mezclas, balances)",
            "dba": dba_m7_all,
            "achievement": "Modela y resuelve problemas del entorno escolar y social formulando ecuaciones lineales con rigor conceptual.",
            "suggestedSequence": "Inicio: Planteamiento de un problema de reparto de presupuesto para una excursión escolar. Desarrollo: Paso a paso para resolver problemas: comprender el enunciado, definir la incógnita, plantear la ecuación, resolver y verificar. Cierre: Taller en equipos formulando y resolviendo problemas reales del colegio."
        },
        {
            "id": "mat-7-3-7",
            "topic": "Construcción de tablas y gráficas para representar relaciones entre variables",
            "dba": dba_m7_all,
            "achievement": "Construye tablas de valores y gráficas en el plano cartesiano para representar relaciones lineales entre variables dependientes e independientes.",
            "suggestedSequence": "Inicio: Relación entre tiempo de llamada y costo total para introducir la noción de función. Desarrollo: Tabla de pares ordenados (x,y) y trazado de la recta correspondiente en el plano cartesiano. Cierre: Interpretación de la pendiente de la recta y comparación visual entre funciones."
        },
        {
            "id": "mat-7-3-8",
            "topic": "Interpretación de tendencias y relaciones de cambio en problemas del entorno",
            "dba": dba_m7_all,
            "achievement": "Interpreta gráficas de relaciones de cambio continuas y discretas reconociendo crecimientos, decrecimientos y constantes.",
            "suggestedSequence": "Inicio: Lectura de gráficas de llenado de recipientes y velocidad vs. tiempo. Desarrollo: Análisis cualitativo y cuantitativo de pendientes y puntos de corte con los ejes. Cierre: Redacción de conclusiones a partir de gráficas extraídas de artículos científicos o económicos."
        }
    ]

    all_data["4°"]["Matemáticas"]["7°"] = [
        {
            "id": "mat-7-4-1",
            "topic": "Recolección y organización de datos: Tipos de datos cualitativos y cuantitativos",
            "dba": dba_m7_all,
            "achievement": "Clasifica variables estadísticas en cualitativas (nominales, ordinales) y cuantitativas (discretas, continuas) diseñando instrumentos de recolección.",
            "suggestedSequence": "Inicio: Lluvia de ideas sobre variables escolares (estatura, color favorito, estrato, notas). Desarrollo: Clasificación formal de tipos de variables y diseño de una encuesta estructurada. Cierre: Aplicación de la encuesta diseñada a una muestra representativa de compañeros."
        },
        {
            "id": "mat-7-4-2",
            "topic": "Tablas de frecuencia y representación gráfica: Barras, sectores circulares y pictogramas",
            "dba": dba_m7_all,
            "achievement": "Construye tablas de frecuencias absolutas, relativas y acumuladas, elaborando diagramas de barras y circulares con escala correcta.",
            "suggestedSequence": "Inicio: Tabulación manual de los datos recolectados en la encuesta de aula. Desarrollo: Cálculo de frecuencias relativas, porcentajes y ángulos para diagramas de sectores (f * 360° / N). Cierre: Elaboración precisa de diagramas circulares y de barras con rotulación completa."
        },
        {
            "id": "mat-7-4-3",
            "topic": "Uso de herramientas digitales para organizar información estadística",
            "dba": dba_m7_all,
            "achievement": "Utiliza hojas de cálculo digitales para tabular datos, aplicar fórmulas estadísticas y generar gráficos dinámicos.",
            "suggestedSequence": "Inicio: Demostración en proyector de ingreso de datos en Excel / Google Sheets. Desarrollo: Creación de tablas de frecuencias automáticas y generación de gráficos con software. Cierre: Práctica individual en computadores organizando y graficando un conjunto de datos."
        },
        {
            "id": "mat-7-4-4",
            "topic": "Identificación de errores y sesgos en la recolección y lectura de datos",
            "dba": dba_m7_all,
            "achievement": "Evalúa críticamente estudios estadísticos reconociendo sesgos muestrales, preguntas tendenciosas y distorsiones visuales en gráficos.",
            "suggestedSequence": "Inicio: Comparación entre dos encuestas sobre el mismo tema con resultados contradictorios. Desarrollo: Criterios de representatividad de la muestra y tamaño muestral adecuado. Cierre: Debate grupal sobre la ética en el manejo y divulgación de información estadística."
        },
        {
            "id": "mat-7-4-5",
            "topic": "Medidas de tendencia central: Media aritmética, mediana y moda en toma de decisiones",
            "dba": dba_m7_all,
            "achievement": "Calcula e interpreta la media, la mediana y la moda para datos no agrupados, justificando cuál es la más apropiada según la distribución.",
            "suggestedSequence": "Inicio: Caso de estudio con valores atípicos (outliers) que distorsionan el promedio. Desarrollo: Algoritmos de cálculo de media, ordenamiento para mediana y frecuencia máxima para moda. Cierre: Taller de toma de decisiones comparando las tres medidas en situaciones del colegio."
        },
        {
            "id": "mat-7-4-6",
            "topic": "Lectura e interpretación crítica de gráficos y tablas de información",
            "dba": dba_m7_all,
            "achievement": "Interpreta y comunica conclusiones cuantitativas a partir del análisis de tablas y gráficas estadísticas en informes académicos.",
            "suggestedSequence": "Inicio: Presentación de informes reales del DANE o del sector salud. Desarrollo: Formulación de hipótesis, tendencias y predicciones fundamentadas en las gráficas. Cierre: Elaboración de un informe escrito individual sintetizando las conclusiones del estudio."
        },
        {
            "id": "mat-7-4-7",
            "topic": "Concepto de evento, espacio muestral y tipos de sucesos aleatorios",
            "dba": dba_m7_all,
            "achievement": "Distingue entre experimentos deterministas y aleatorios, determinando el espacio muestral y clasificando eventos en seguros, probables e imposibles.",
            "suggestedSequence": "Inicio: Comparación entre soltar una piedra (determinista) y lanzar un dado (aleatorio). Desarrollo: Diagramas de árbol y listas para determinar todos los resultados posibles (espacio muestral S). Cierre: Clasificación de eventos propuestos por los estudiantes justificando su categorización."
        },
        {
            "id": "mat-7-4-8",
            "topic": "Cálculo de probabilidades simples mediante la regla de Laplace",
            "dba": dba_m7_all,
            "achievement": "Aplica la regla de Laplace para calcular la probabilidad teórica de eventos simples y la expresa en forma de fracción, decimal y porcentaje.",
            "suggestedSequence": "Inicio: Juego con barajas y urnas con balotas de colores. Desarrollo: Formalización de la fórmula P(A) = número de casos favorables / número de casos posibles. Cierre: Taller aplicativo resolviendo problemas de probabilidad en juegos de mesa y rifas."
        },
        {
            "id": "mat-7-4-9",
            "topic": "Estimación, predicción y relación entre frecuencia relativa y probabilidad",
            "dba": dba_m7_all,
            "achievement": "Comprende la ley de los grandes números comprobando que a mayor número de ensayos la frecuencia relativa se aproxima a la probabilidad teórica.",
            "suggestedSequence": "Inicio: Registro acumulado de 100 lanzamientos de moneda entre todos los estudiantes. Desarrollo: Gráfica de convergencia de la frecuencia relativa hacia el valor teórico 0.5. Cierre: Taller de síntesis sobre el papel de la probabilidad en la ciencia y la vida diaria."
        }
    ]

    # =========================================================================
    # MATEMÁTICAS 3°
    # =========================================================================
    all_data["1°"]["Matemáticas"]["3°"] = [
        {
            "id": "mat-3-1-1",
            "topic": "Números naturales hasta 99.999: Lectura, escritura y representación en el ábaco",
            "dba": dba_m3_all,
            "achievement": "Lee, escribe y descompone números de hasta cinco cifras relacionando unidades, decenas, centenas y unidades de mil.",
            "suggestedSequence": "Inicio: Manipulación de ábaco y bloques multibase para representar cantidades de 4 y 5 cifras. Desarrollo: Lectura y escritura formal de números hasta 99.999 en el cuaderno. Cierre: Juego de dictado y formación de números con tarjetas de valor posicional."
        },
        {
            "id": "mat-3-1-2",
            "topic": "Valor posicional (DM, UM, C, D, U), descomposición y comparación con signos >, <, =",
            "dba": dba_m3_all,
            "achievement": "Compara y ordena números naturales hasta 99.999 según el valor posicional de sus cifras usando los signos de ordenación.",
            "suggestedSequence": "Inicio: Comparación de precios de electrodomésticos en folletos publicitarios. Desarrollo: Descomposición aditiva en DM, UM, C, D, U y comparación cifra por cifra de izquierda a derecha. Cierre: Ejercicios de ordenación ascendente y descendente en el tablero."
        },
        {
            "id": "mat-3-1-3",
            "topic": "Adición y sustracción con y sin reagrupación (algoritmos formales y estimación)",
            "dba": dba_m3_all,
            "achievement": "Resuelve sumas y restas con números de hasta cinco cifras con reagrupación aplicando el algoritmo convencional con precisión.",
            "suggestedSequence": "Inicio: Planteamiento de compras en un supermercado sumando varios artículos. Desarrollo: Práctica guiada del algoritmo de suma llevando y resta prestando hasta de 5 dígitos. Cierre: Taller de ejercitación individual y corrección conjunta de errores comunes."
        },
        {
            "id": "mat-3-1-4",
            "topic": "Propiedades de la adición: Conmutativa, asociativa y elemento neutro",
            "dba": dba_m3_all,
            "achievement": "Aplica las propiedades conmutativa y asociativa de la adición para agilizar el cálculo mental y verificar operaciones.",
            "suggestedSequence": "Inicio: Comprobación con material concreto de si cambiar el orden de los sumandos altera el total. Desarrollo: Demostración formal de propiedades conmutativa, asociativa y elemento neutro (el cero). Cierre: Taller de cálculo mental rápido aplicando asociaciones convenientes."
        },
        {
            "id": "mat-3-1-5",
            "topic": "Problemas aditivos de composición, transformación y comparación en el entorno escolar y familiar",
            "dba": dba_m3_all,
            "achievement": "Propone y resuelve problemas cotidianos que requieren adición y sustracción, explicando el procedimiento seguido.",
            "suggestedSequence": "Inicio: Lectura compartida de una situación problemática sobre ahorros familiares. Desarrollo: Pasos para resolver problemas: subrayar datos, identificar la operación y redactar la respuesta. Cierre: Creación de problemas matemáticos propios por parte de los estudiantes."
        },
        {
            "id": "mat-3-1-6",
            "topic": "Estrategias de cálculo mental y redondeo a la decena y centena más cercana",
            "dba": dba_m3_all,
            "achievement": "Aplica técnicas de aproximación y redondeo para estimar resultados de sumas y restas valorando su razonabilidad.",
            "suggestedSequence": "Inicio: Estimación rápida del costo total de una lista de útiles escolares. Desarrollo: Reglas para redondear a la decena, centena y millar más cercano en la recta numérica. Cierre: Dinámica de cálculo mental cronometrado en equipos."
        }
    ]

    all_data["2°"]["Matemáticas"]["3°"] = [
        {
            "id": "mat-3-2-1",
            "topic": "Concepto de multiplicación como adición repetida y arreglos rectangulares",
            "dba": dba_m3_all,
            "achievement": "Modela la multiplicación como sumas de sumandos iguales y mediante cuadrículas o arreglos rectangulares.",
            "suggestedSequence": "Inicio: Agrupación de tapitas y fichas en montones con la misma cantidad de elementos. Desarrollo: Representación en cuadrículas (filas x columnas) y traducción a la expresión matemática a * b. Cierre: Taller gráfico relacionando adiciones reiteradas con multiplicaciones."
        },
        {
            "id": "mat-3-2-2",
            "topic": "Tablas de multiplicar, patrones numéricos y propiedades multiplicativas (conmutativa y distributiva)",
            "dba": dba_m3_all,
            "achievement": "Construye y memoriza comprensivamente las tablas de multiplicar del 1 al 10 identificando regularidades numéricas.",
            "suggestedSequence": "Inicio: Descubrimiento de patrones en la tabla pitagórica (números pares, dobles, simetría). Desarrollo: Demostración de las propiedades conmutativa y distributiva de la multiplicación. Cierre: Juego interactivo de preguntas rápidas con la tabla pitagórica."
        },
        {
            "id": "mat-3-2-3",
            "topic": "Multiplicación por una y dos cifras con situaciones contextualizadas",
            "dba": dba_m3_all,
            "achievement": "Ejecuta multiplicaciones de números de varias cifras por factores de una y dos cifras resolviendo situaciones de compra y producción.",
            "suggestedSequence": "Inicio: Problema sobre calcular cuántos refrescos hay en varias cajas con paquetes iguales. Desarrollo: Algoritmo paso a paso de la multiplicación por una y dos cifras con reagrupación. Cierre: Taller de aplicación con situaciones de compras y medidas."
        },
        {
            "id": "mat-3-2-4",
            "topic": "Concepto de división como repartos y agrupaciones equitativas (términos de la división)",
            "dba": dba_m3_all,
            "achievement": "Comprende el significado de la división como reparto equitativo e identifica dividendo, divisor, cociente y residuo.",
            "suggestedSequence": "Inicio: Reparto equitativo de caramelos entre estudiantes garantizando que a todos les toque igual. Desarrollo: Definición formal de los términos de la división y diferencia entre división exacta e inexacta. Cierre: Taller práctico con material concreto repartiendo colecciones de objetos."
        },
        {
            "id": "mat-3-2-5",
            "topic": "Relación inversa entre multiplicación y división (operaciones recíprocas)",
            "dba": dba_m3_all,
            "achievement": "Reconoce que la división es la operación inversa de la multiplicación y la utiliza para comprobar resultados.",
            "suggestedSequence": "Inicio: Familias de operaciones (ej. 4 * 5 = 20, 20 / 4 = 5, 20 / 5 = 4). Desarrollo: Uso de la prueba de la división (Dividendo = divisor * cociente + residuo). Cierre: Ejercicios de cálculo de términos faltantes en multiplicaciones y divisiones."
        },
        {
            "id": "mat-3-2-6",
            "topic": "Resolución y formulación de problemas multiplicativos y de reparto equitativo",
            "dba": dba_m3_all,
            "achievement": "Formula y soluciona problemas multiplicativos diferenciando cuándo aplicar la multiplicación o la división.",
            "suggestedSequence": "Inicio: Análisis de dos enunciados similares para determinar cuál se multiplica y cuál se divide. Desarrollo: Resolución estructurada de problemas con enunciado, datos, operación y respuesta completa. Cierre: Evaluación formativa mediante creación de problemas por parejas."
        }
    ]

    all_data["3°"]["Matemáticas"]["3°"] = [
        {
            "id": "mat-3-3-1",
            "topic": "Noción de fracción: Numerador, denominador y representación gráfica de partes de la unidad",
            "dba": dba_m3_all,
            "achievement": "Reconoce la fracción como parte de una unidad dividida en partes iguales, identificando el rol del numerador y denominador.",
            "suggestedSequence": "Inicio: División de figuras de plastilina y pasteles en partes exactamente iguales. Desarrollo: Representación gráfica y simbólica de fracciones (medios, tercios, cuartos, sextos, octavos). Cierre: Taller de sombreado y escritura de fracciones a partir de modelos geométricos."
        },
        {
            "id": "mat-3-3-2",
            "topic": "Fracciones propias, impropias y fracciones equivalentes mediante modelos visuales",
            "dba": dba_m3_all,
            "achievement": "Clasifica fracciones en propias e impropias y reconoce fracciones equivalentes mediante modelos visuales continuos.",
            "suggestedSequence": "Inicio: Comparación de franjas de papel plegadas en 2, 4 y 8 partes para ver que 1/2 = 2/4 = 4/8. Desarrollo: Definición de fracción propia (< 1), impropia (> 1) y regla de productos cruzados. Cierre: Ejercicios de identificación y emparejamiento de fracciones equivalentes."
        },
        {
            "id": "mat-3-3-3",
            "topic": "Fracción de un conjunto y situaciones cotidianas de partición",
            "dba": dba_m3_all,
            "achievement": "Calcula la fracción de un conjunto discreto de objetos en problemas de reparto cotidiano.",
            "suggestedSequence": "Inicio: Reto: ¿Cuántos son 2/3 de un grupo de 12 balones? Desarrollo: Procedimiento: dividir la cantidad total entre el denominador y multiplicar por el numerador. Cierre: Resolución de problemas de reparto de colecciones en el aula."
        },
        {
            "id": "mat-3-3-4",
            "topic": "Geometría: Líneas rectas, semirrectas, segmentos, paralelas y perpendiculares",
            "dba": dba_m3_all,
            "achievement": "Identifica y traza rectas paralelas y perpendiculares utilizando regla y escuadra en figuras del entorno.",
            "suggestedSequence": "Inicio: Observación de rieles de tren (paralelas) y esquinas de ventanas (perpendiculares). Desarrollo: Definición de recta, semirrecta y segmento; trazado con regla y escuadra. Cierre: Identificación de rectas paralelas y perpendiculares en el plano del colegio."
        },
        {
            "id": "mat-3-3-5",
            "topic": "Figuras geométricas bidimensionales (triángulos, cuadriláteros) y sus elementos",
            "dba": dba_m3_all,
            "achievement": "Clasifica polígonos según el número de lados y vértices, distinguiendo triángulos y tipos de cuadriláteros.",
            "suggestedSequence": "Inicio: Búsqueda de figuras planas en objetos cotidianos del aula. Desarrollo: Elementos de una figura: lados, vértices y ángulos; clasificación de triángulos por sus lados. Cierre: Construcción de figuras poligonales con palillos y plastilina."
        },
        {
            "id": "mat-3-3-6",
            "topic": "Cuerpos geométricos (cubo, prisma, cilindro, esfera) y sus características en el entorno",
            "dba": dba_m3_all,
            "achievement": "Distingue cuerpos redondos y poliedros reconociendo caras, aristas y vértices en objetos tridimensionales.",
            "suggestedSequence": "Inicio: Manipulación de cajas, pelotas y latas para comparar superficies planas y curvas. Desarrollo: Identificación de caras, aristas y vértices en cubos, prismas y pirámides. Cierre: Armado de cuerpos geométricos a partir de plantillas recortables."
        }
    ]

    all_data["4°"]["Matemáticas"]["3°"] = [
        {
            "id": "mat-3-4-1",
            "topic": "Unidades de medida de longitud: El metro, centímetro y milímetro (medición y estimación)",
            "dba": dba_m3_all,
            "achievement": "Realiza mediciones y estimaciones de longitud utilizando el metro, decímetro y centímetro con instrumentos adecuados.",
            "suggestedSequence": "Inicio: Medición con la palma de la mano vs. la cinta métrica para evidenciar la necesidad de medidas universales. Desarrollo: Equivalencias básicas (1 m = 100 cm, 1 cm = 10 mm) y uso correcto de la regla. Cierre: Taller de medición de objetos del aula registrando datos en tablas."
        },
        {
            "id": "mat-3-4-2",
            "topic": "Medición de masa y peso (kilogramo, gramo) y capacidad (litro, medio litro)",
            "dba": dba_m3_all,
            "achievement": "Compara masas y volúmenes utilizando balanzas, jarras graduadas y recipientes en situaciones de la vida diaria.",
            "suggestedSequence": "Inicio: Sopesar objetos de diferente tamaño para cuestionar si lo más grande siempre es lo más pesado. Desarrollo: Unidades de masa (kg, g) y de capacidad (litro, medio litro, cuarto de litro). Cierre: Práctica experimental trasvasando agua en recipientes graduados."
        },
        {
            "id": "mat-3-4-3",
            "topic": "El tiempo: Lectura del reloj análogo y digital, horas, minutos y calendario (días, meses, años)",
            "dba": dba_m3_all,
            "achievement": "Lee la hora en relojes análogos y digitales y calcula duraciones de eventos utilizando el calendario escolar.",
            "suggestedSequence": "Inicio: Fabricación de un reloj de cartón con manecillas móviles de horario y minutero. Desarrollo: Lectura de la hora en punto, y media, y cuarto y menos cuarto; equivalencias (1 h = 60 min). Cierre: Resolución de situaciones problema sobre horarios de salida, recreo y transporte."
        },
        {
            "id": "mat-3-4-4",
            "topic": "Noción de perímetro en figuras planas sencillas",
            "dba": dba_m3_all,
            "achievement": "Calcula el perímetro de polígonos sumando las longitudes de sus lados en contextos de cercado y enmarcado.",
            "suggestedSequence": "Inicio: Recorrido caminando por el borde de la cancha de microfútbol contando pasos. Desarrollo: Definición formal de perímetro como la suma de las longitudes de todos los lados. Cierre: Taller de cálculo de perímetros de figuras poligonales en papel cuadriculado."
        },
        {
            "id": "mat-3-4-5",
            "topic": "Recolección, clasificación y organización de datos en tablas de conteo",
            "dba": dba_m3_all,
            "achievement": "Recolecta información de su grupo escolar y la organiza en tablas de conteo con marcas y totales numéricos.",
            "suggestedSequence": "Inicio: Votación en el aula para elegir la actividad deportiva preferida. Desarrollo: Registro de datos en una tabla de conteo utilizando rayas y frecuencias numéricas. Cierre: Lectura e interpretación de los datos tabulados respondiendo preguntas clave."
        },
        {
            "id": "mat-3-4-6",
            "topic": "Construcción e interpretación de pictogramas y diagramas de barras con escala",
            "dba": dba_m3_all,
            "achievement": "Construye e interpreta pictogramas y gráficos de barras asignando valores a cada símbolo o unidad de escala.",
            "suggestedSequence": "Inicio: Explicación de pictogramas donde un dibujo representa más de una unidad (ej. un libro = 5 lecturas). Desarrollo: Trazado de diagramas de barras verticales y horizontales con escala definida. Cierre: Taller de interpretación de gráficas y redacción de conclusiones sencillas."
        },
        {
            "id": "mat-3-4-7",
            "topic": "Nociones básicas de probabilidad: Eventos seguros, posibles e imposibles",
            "dba": dba_m3_all,
            "achievement": "Distingue situaciones aleatorias clasificando eventos en seguros, posibles o imposibles según el contexto.",
            "suggestedSequence": "Inicio: Preguntas sobre el clima y juegos: ¿Es seguro que mañana llueva? ¿Es posible sacar un 7 en un dado? Desarrollo: Conceptualización de sucesos seguros, probables e imposibles con ejemplos concretos. Cierre: Clasificación de enunciados y juegos con fichas de colores en bolsas oscuras."
        }
    ]

    # =========================================================================
    # MATEMÁTICAS 2°
    # =========================================================================
    all_data["1°"]["Matemáticas"]["2°"] = [
        {
            "id": "mat-2-1-1",
            "topic": "Lectura, escritura y valor posicional (unidades de mil, centenas, decenas, unidades) hasta 9.999",
            "dba": dba_m2_all,
            "achievement": "Lee, escribe y descompone números hasta 9.999 identificando el valor posicional de cada dígito en UM-C-D-U.",
            "suggestedSequence": "Inicio: Representación de cantidades con bloques de base diez y ábacos de 4 varillas. Desarrollo: Lectura, escritura y descomposición aditiva de números hasta 9.999. Cierre: Dictado de números y juego de armado de cantidades con tarjetas numéricas."
        },
        {
            "id": "mat-2-1-2",
            "topic": "Descomposición aditiva, comparación y ordenación de números con signos >, <, =",
            "dba": dba_m2_all,
            "achievement": "Compara números hasta 9.999 estableciendo relaciones de mayor que, menor que e igual que a partir de sus cifras.",
            "suggestedSequence": "Inicio: Uso del cocodrilo comilón para recordar la orientación de los signos > y <. Desarrollo: Comparación cifra por cifra empezando por las unidades de mil y ordenación de listas numéricas. Cierre: Taller de ordenar cantidades de menor a mayor y de mayor a menor."
        },
        {
            "id": "mat-2-1-3",
            "topic": "Algoritmo formal de la adición y la sustracción con y sin reagrupación (llevando y prestando)",
            "dba": dba_m2_all,
            "achievement": "Resuelve adiciones y sustracciones con números de hasta cuatro cifras aplicando algoritmos con y sin reagrupación.",
            "suggestedSequence": "Inicio: Simulación de compras en la tienda escolar calculando costos y vueltas. Desarrollo: Práctica guiada del algoritmo de suma llevando y resta prestando con material concreto y cuaderno. Cierre: Taller de ejercitación individual con revisión y corrección paso a paso."
        },
        {
            "id": "mat-2-1-4",
            "topic": "Propiedades de la adición: Conmutativa, asociativa y elemento neutro",
            "dba": dba_m2_all,
            "achievement": "Reconoce que el orden de los sumandos no altera el resultado y aplica el cero como elemento neutro.",
            "suggestedSequence": "Inicio: Demostración con fichas de que 15 + 7 es igual a 7 + 15. Desarrollo: Ejercicios de agrupación con paréntesis para verificar la propiedad asociativa y el neutro. Cierre: Juegos de cálculo mental rápido aplicando propiedades para facilitar sumas."
        },
        {
            "id": "mat-2-1-5",
            "topic": "Planteamiento y resolución de problemas aditivos de composición, transformación y comparación",
            "dba": dba_m2_all,
            "achievement": "Interpreta y resuelve problemas aditivos sencillos del entorno escolar y familiar, registrando la operación y la respuesta.",
            "suggestedSequence": "Inicio: Lectura guiada de un cuento matemático sobre animales en una granja. Desarrollo: Identificación de la pregunta, datos numéricos y selección de la operación correcta (+ o -). Cierre: Socialización de las respuestas redactadas en el cuaderno."
        },
        {
            "id": "mat-2-1-6",
            "topic": "Cálculo mental rápido y secuencias numéricas ascendentes y descendentes",
            "dba": dba_m2_all,
            "achievement": "Identifica patrones numéricos y completa secuencias sumando o restando de 2 en 2, 5 en 5, 10 en 10 y 100 en 100.",
            "suggestedSequence": "Inicio: Juego de conteo rítmico con palmadas de 10 en 10 hasta 1.000. Desarrollo: Identificación del patrón de cambio en secuencias numéricas en la recta. Cierre: Desafío de completar laberintos numéricos siguiendo la secuencia correcta."
        }
    ]

    all_data["2°"]["Matemáticas"]["2°"] = [
        {
            "id": "mat-2-2-1",
            "topic": "Noción de multiplicación: Adición repetida de sumandos iguales y arreglos rectangulares",
            "dba": dba_m2_all,
            "achievement": "Comprende la multiplicación como la suma reiterada de cantidades iguales y la representa gráficamente.",
            "suggestedSequence": "Inicio: Agrupación de botones en parejas y tríos: ¿Cuántos hay en 4 grupos de 3? Desarrollo: Traducción de '4 veces 3' a la expresión matemática '4 x 3 = 12'. Cierre: Dibujo de arreglos de puntos y cuadrículas representando multiplicaciones."
        },
        {
            "id": "mat-2-2-2",
            "topic": "Construcción y memorización comprensiva de las tablas del 2, 3, 4 y 5",
            "dba": dba_m2_all,
            "achievement": "Construye las tablas del 2, 3, 4 y 5 mediante saltos en la recta numérica y conteo salteado.",
            "suggestedSequence": "Inicio: Ranas saltarinas en la recta numérica dando saltos de 2, 3, 4 y 5 unidades. Desarrollo: Construcción de las tablas en una tabla pitagórica destacando los resultados. Cierre: Canciones y rimas para afianzar la memoria comprensiva de las tablas."
        },
        {
            "id": "mat-2-2-3",
            "topic": "Propiedad conmutativa de la multiplicación (el orden de los factores no altera el producto)",
            "dba": dba_m2_all,
            "achievement": "Aplica la propiedad conmutativa verificando que expresiones como 3 x 4 y 4 x 3 dan el mismo resultado.",
            "suggestedSequence": "Inicio: Rotación de una bandeja con chocolates (3 filas de 4 vs. 4 filas de 3). Desarrollo: Demostración visual de que el producto es idéntico aunque cambie el orden. Cierre: Taller de completar operaciones aplicando la conmutatividad."
        },
        {
            "id": "mat-2-2-4",
            "topic": "Multiplicación de números de dos y tres cifras por un dígito sin y con reagrupación",
            "dba": dba_m2_all,
            "achievement": "Aplica el algoritmo formal de la multiplicación por una cifra multiplicando primero unidades y luego decenas.",
            "suggestedSequence": "Inicio: Planteamiento de situaciones como comprar 3 cuadernos de $2.300 cada uno. Desarrollo: Algoritmo paso a paso de la multiplicación vertical cuidando el valor posicional. Cierre: Taller de resolución de multiplicaciones con acompañamiento individual."
        },
        {
            "id": "mat-2-2-5",
            "topic": "Situaciones problemáticas cotidianas que involucran agrupaciones, dobles y triples",
            "dba": dba_m2_all,
            "achievement": "Calcula el doble y el triple de una cantidad resolviendo problemas de la vida cotidiana.",
            "suggestedSequence": "Inicio: Juegos con espejos y figuras dobles: si yo tengo 4 fichas, el doble es... Desarrollo: Concepto de doble (x2) y triple (x3) aplicado a problemas de recetas y compras. Cierre: Taller de situaciones problema calculando dobles y triples."
        },
        {
            "id": "mat-2-2-6",
            "topic": "Patrones multiplicativos y juegos numéricos de cálculo ágil",
            "dba": dba_m2_all,
            "achievement": "Descubre patrones multiplicativos y aplica estrategias de cálculo mental en juegos didácticos.",
            "suggestedSequence": "Inicio: Dinámica 'bingo multiplicativo' con las tablas aprendidas. Desarrollo: Reconocimiento de que multiplicar por 10 es agregar un cero al final. Cierre: Evaluación formativa lúdica mediante concurso de cálculo mental por equipos."
        }
    ]

    all_data["3°"]["Matemáticas"]["2°"] = [
        {
            "id": "mat-2-3-1",
            "topic": "Líneas rectas, curvas, abiertas y cerradas; nociones de horizontal y vertical",
            "dba": dba_m2_all,
            "achievement": "Diferencia y dibuja líneas rectas y curvas, abiertas y cerradas, identificando posiciones horizontales y verticales.",
            "suggestedSequence": "Inicio: Trazado de huellas en el patio con lana y tiza identificando trayectorias rectas y curvas. Desarrollo: Dibujo de líneas con regla y a mano alzada clasificándolas según su forma y orientación. Cierre: Creación de un paisaje utilizando únicamente líneas horizontales, verticales y curvas."
        },
        {
            "id": "mat-2-3-2",
            "topic": "Figuras geométricas planas: Círculo, cuadrado, rectángulo, triángulo (lados y vértices)",
            "dba": dba_m2_all,
            "achievement": "Identifica y describe figuras geométricas planas reconociendo el número de lados rectos, curvos y vértices.",
            "suggestedSequence": "Inicio: Clasificación de figuras de madera y plástico por tacto con los ojos vendados. Desarrollo: Conteo formal de lados y vértices en triángulos, cuadrados, rectángulos y círculos. Cierre: Construcción de figuras con plastilina y palillos contando los vértices."
        },
        {
            "id": "mat-2-3-3",
            "topic": "Cuerpos geométricos en los objetos cotidianos: Cubo, esfera, cilindro, cono",
            "dba": dba_m2_all,
            "achievement": "Asocia objetos de su entorno con cuerpos geométricos tridimensionales (cajas con cubos, pelotas con esferas, latas con cilindros).",
            "suggestedSequence": "Inicio: Exploración de juguetes y envases traídos de casa clasificándolos por su forma 3D. Desarrollo: Características de los cuerpos geométricos: caras planas, caras curvas y capacidad de rodar. Cierre: Armado de maquetas sencillas con cuerpos geométricos reciclados."
        },
        {
            "id": "mat-2-3-4",
            "topic": "Noción de longitud: Medidas arbitrarias (palmo, paso, pie) y uso de la regla (centímetro)",
            "dba": dba_m2_all,
            "achievement": "Mide longitudes utilizando partes de su cuerpo e instrumentos estandarizados como la regla graduada en centímetros.",
            "suggestedSequence": "Inicio: Medir el largo del salón con pasos de diferentes estudiantes para ver por qué cambian las medidas. Desarrollo: Introducción del centímetro y uso correcto de la regla desde el número 0. Cierre: Taller de medición de lápices, cuadernos y borradores registrando medidas exactas."
        },
        {
            "id": "mat-2-3-5",
            "topic": "Noción de masa y capacidad: Pesado/liviano, lleno/vacío",
            "dba": dba_m2_all,
            "achievement": "Compara el peso y la capacidad de recipientes usando términos como más pesado que, más liviano que, lleno y vacío.",
            "suggestedSequence": "Inicio: Experimento con una balanza de dos platillos comparando frutas y piedras. Desarrollo: Clasificación de objetos según su masa y experimentación con vasos de agua de diferentes tamaños. Cierre: Registro ilustrado en el cuaderno de comparaciones de peso y capacidad."
        },
        {
            "id": "mat-2-3-6",
            "topic": "Nociones temporales: El reloj (hora en punto y media hora), días de la semana y meses del año",
            "dba": dba_m2_all,
            "achievement": "Identifica la hora en punto y la media hora en relojes analógicos y organiza actividades en el calendario escolar.",
            "suggestedSequence": "Inicio: Canción de los días de la semana y los doce meses del año. Desarrollo: Lectura del reloj con manecillas: el minutero en las 12 (en punto) y en las 6 (y media). Cierre: Elaboración de un horario ilustrado de su rutina diaria con horas específicas."
        }
    ]

    all_data["4°"]["Matemáticas"]["2°"] = [
        {
            "id": "mat-2-4-1",
            "topic": "Noción de reparto equitativo y división como distribución en partes iguales",
            "dba": dba_m2_all,
            "achievement": "Comprende el sentido de la división como un reparto en cantidades exactamente iguales sin que sobre nada.",
            "suggestedSequence": "Inicio: Reparto vivencial de galletas o fichas entre dos, tres o cuatro estudiantes equitativamente. Desarrollo: Representación gráfica de repartos y traducción a la idea de 'cuántas veces cabe'. Cierre: Taller de dibujo repartiendo colecciones de objetos en cajas o canastas."
        },
        {
            "id": "mat-2-4-2",
            "topic": "Mitad, tercera y cuarta parte de una cantidad o conjunto",
            "dba": dba_m2_all,
            "achievement": "Calcula la mitad, tercera y cuarta parte de colecciones pequeñas de objetos mediante división en grupos iguales.",
            "suggestedSequence": "Inicio: Plegado de papel en 2 y 4 partes iguales para observar mitades y cuartas partes. Desarrollo: Cálculo de la mitad (dividir entre 2) y la tercera parte (dividir entre 3) de números pares y múltiplos. Cierre: Ejercicios aplicativos de reparto de frutas y caramelos en el cuaderno."
        },
        {
            "id": "mat-2-4-3",
            "topic": "Problemas sencillos de reparto sin residuo en situaciones familiares y de aula",
            "dba": dba_m2_all,
            "achievement": "Resuelve situaciones problemáticas de reparto equitativo explicando el procedimiento utilizado.",
            "suggestedSequence": "Inicio: Planteamiento de una situación de juego en equipos iguales para el recreo. Desarrollo: Paso a paso para repartir cantidades exactas verificando que todos tengan lo mismo. Cierre: Redacción de respuestas a problemas de reparto en equipos colaborativos."
        },
        {
            "id": "mat-2-4-4",
            "topic": "Recolección y registro de información mediante encuestas sencillas",
            "dba": dba_m2_all,
            "achievement": "Formula preguntas sencillas para recoger datos de interés entre sus compañeros de clase.",
            "suggestedSequence": "Inicio: Elección del color favorito del grupo para ambientar el aula. Desarrollo: Registro de respuestas en una lista ordenada anotando los nombres o marcas. Cierre: Conteo del total de participantes de la encuesta."
        },
        {
            "id": "mat-2-4-5",
            "topic": "Organización de datos en tablas de conteo y frecuencias simples",
            "dba": dba_m2_all,
            "achievement": "Organiza datos recolectados en tablas de conteo utilizando marcas y totales numéricos comprensibles.",
            "suggestedSequence": "Inicio: Agrupación de marcas de conteo en grupos de 5 (cuatro palitos y uno cruzado). Desarrollo: Construcción de la tabla de frecuencias con columna de variable, conteo y total. Cierre: Taller de tabulación de datos sobre animales preferidos o deportes."
        },
        {
            "id": "mat-2-4-6",
            "topic": "Lectura y elaboración de pictogramas y gráficos de barras elementales",
            "dba": dba_m2_all,
            "achievement": "Interpreta y dibuja pictogramas y diagramas de barras sencillos para comunicar la información recopilada.",
            "suggestedSequence": "Inicio: Observación de un pictograma de soles y nubes para registrar el clima de la semana. Desarrollo: Coloreado de barras en papel cuadriculado donde cada cuadrito representa una persona. Cierre: Formulación de preguntas a partir de la gráfica: ¿Cuál tuvo más? ¿Cuál tuvo menos?"
        },
        {
            "id": "mat-2-4-7",
            "topic": "Nociones de eventos posibles e imposibles en el juego y la cotidianidad",
            "dba": dba_m2_all,
            "achievement": "Distingue acontecimientos posibles e imposibles en juegos y situaciones cotidianas.",
            "suggestedSequence": "Inicio: Diálogo reflexivo: ¿Es posible que un pez vuele? ¿Es posible que mañana salga el sol? Desarrollo: Clasificación de situaciones en tarjetas con las palabras 'posible' e 'imposible'. Cierre: Evaluación formativa mediante dramatizaciones cortas de situaciones lógicas."
        }
    ]

print("Math module populated successfully.")
