# -*- coding: utf-8 -*-
"""
Curriculum definitions for Matemáticas (2°, 3°, 7°) and Lógica (6°)
Extracted from: Mallas Manuel 2026 -2027 Matemáticas.pdf
Colegio Hogar Madre de Dios - Docente: Manuel Alejandro Muñoz Palomino
"""

math_curriculum = {
    "1°": { "Matemáticas": {}, "Lógica": {} },
    "2°": { "Matemáticas": {}, "Lógica": {} },
    "3°": { "Matemáticas": {}, "Lógica": {} },
    "4°": { "Matemáticas": {}, "Lógica": {} }
}

# =========================================================================
# LÓGICA 6°
# =========================================================================
dba_log_all = (
    "● DBA 1: Comprende y utiliza los números enteros y racionales (fracciones y decimales) con sus operaciones en diversos contextos.\n"
    "● DBA 8: Plantea y resuelve ecuaciones, describiendo verbalmente y representando situaciones de cambio cuantitativo.\n"
    "● DBA 9: Opera sobre números desconocidos para resolver problemas con cantidades inciertas usando propiedades de las operaciones.\n"
    "● DBA 10: Interpreta información estadística de diversas fuentes, analizándola para plantear hipótesis.\n"
    "● DBA 11: Compara y clasifica eventos de experimentos aleatorios y calcula probabilidad simple mediante la regla de Laplace."
)

math_curriculum["1°"]["Lógica"]["6°"] = [
    {
        "id": "log-6-1-1",
        "topic": "Lógica de conjuntos y fundamentos aritméticos: Proposiciones y conectores lógicos (enunciados, valor de verdad)",
        "dba": dba_log_all,
        "achievement": "Diferencia proposiciones de enunciados abiertos y cerrados, determinando su valor de verdad mediante tablas de verdad y conectores lógicos básicos (conjunción, disyunción, negación).",
        "suggestedSequence": "Inicio: Presentación de enunciados cotidianos para debatir cuáles pueden ser calificados como verdaderos o falsos. Desarrollo: Formalización del concepto de proposición, conectores lógicos y construcción de tablas de verdad. Cierre: Taller de formulación y análisis de proposiciones compuestas."
    },
    {
        "id": "log-6-1-2",
        "topic": "Razonamiento con conjuntos: Diagramas de Venn, relaciones de pertenencia, unión e intersección",
        "dba": dba_log_all,
        "achievement": "Emplea diagramas de Venn y operaciones entre conjuntos (unión, intersección, diferencia y complemento) para modelar y resolver situaciones cotidianas y clasificar datos numéricos.",
        "suggestedSequence": "Inicio: Ejercicio práctico de clasificación de objetos del aula según atributos compartidos. Desarrollo: Representación gráfica de conjuntos con diagramas de Venn y cálculo de operaciones de unión e intersección. Cierre: Resolución de problemas de conjuntos en equipos colaborativos."
    },
    {
        "id": "log-6-1-3",
        "topic": "Lógica numérica y divisibilidad: Números primos, compuestos, criterios de divisibilidad, MCD y MCM",
        "dba": dba_log_all,
        "achievement": "Aplica criterios de divisibilidad y la descomposición en factores primos para calcular el Máximo Común Divisor (MCD) y el Mínimo Común Múltiplo (MCM) en problemas de contexto.",
        "suggestedSequence": "Inicio: Reto de reparto de caramelos y sincronización de alarmas para deducir la necesidad del MCM y MCD. Desarrollo: Demostración de criterios de divisibilidad y factorización prima en árbol y divisiones sucesivas. Cierre: Taller aplicativo resolviendo problemas de sincronización y repartos equitativos."
    },
    {
        "id": "log-6-1-4",
        "topic": "Argumentación deductiva y validación crítica de razonamientos lógicos",
        "dba": dba_log_all,
        "achievement": "Argumenta deducciones matemáticas y valida críticamente procedimientos propios y ajenos mediante el razonamiento lógico inductivo y deductivo.",
        "suggestedSequence": "Inicio: Análisis de falacias comunes y paradojas lógicas en la comunicación diaria. Desarrollo: Estructuración de argumentos formales premisa-conclusión en problemas matemáticos. Cierre: Debate grupal sustentando soluciones y detectando errores de razonamiento."
    }
]

math_curriculum["2°"]["Lógica"]["6°"] = [
    {
        "id": "log-6-2-1",
        "topic": "Patrones numéricos, secuencias lógicas y regularidades en situaciones del entorno",
        "dba": dba_log_all,
        "achievement": "Identifica, formula y generaliza patrones y regularidades numéricas y geométricas para predecir términos futuros en secuencias lógicas.",
        "suggestedSequence": "Inicio: Observación de secuencias visuales y numéricas incompletas para descubrir la regla oculta. Desarrollo: Expresión verbal y gráfica de patrones aritméticos crecientes y decrecientes. Cierre: Creación de secuencias lógicas individuales y desafío a los compañeros para resolverlas."
    },
    {
        "id": "log-6-2-2",
        "topic": "Introducción al pensamiento variacional: Constantes, variables y traducción de enunciados a expresiones algebraicas",
        "dba": dba_log_all,
        "achievement": "Traduce enunciados del lenguaje natural al lenguaje algebraico básico reconociendo el significado de variables e incógnitas.",
        "suggestedSequence": "Inicio: Adivinanzas numéricas del tipo 'pienso en un número y le sumo 7...'. Desarrollo: Asignación de letras a cantidades desconocidas y escritura de expresiones algebraicas elementales. Cierre: Guía de traducción bidireccional entre lenguaje cotidiano y simbólico."
    },
    {
        "id": "log-6-2-3",
        "topic": "Ecuaciones lineales básicas con números enteros y racionales: Modelo de balanza y operaciones inversas",
        "dba": dba_log_all,
        "achievement": "Plantea y resuelve ecuaciones lineales de primer grado sencillas aplicando propiedades de igualdad y operaciones inversas.",
        "suggestedSequence": "Inicio: Simulación de una balanza en equilibrio para comprender que lo que se agrega o quita a un lado debe hacerse al otro. Desarrollo: Algoritmo de transposición de términos y operaciones inversas para despejar incógnitas. Cierre: Resolución de problemas cotidianos de compras y repartos mediante ecuaciones."
    },
    {
        "id": "log-6-2-4",
        "topic": "Estrategias de verificación, análisis de coherencia y justificación de respuestas",
        "dba": dba_log_all,
        "achievement": "Verifica la plausibilidad y coherencia de las soluciones numéricas obtenidas sustituyendo valores en la ecuación original.",
        "suggestedSequence": "Inicio: Presentación de soluciones erróneas para que los estudiantes descubran la falla. Desarrollo: Procedimiento de comprobación formal sustituyendo la incógnita por el valor hallado. Cierre: Taller de autoevaluación y corrección entre pares con rúbrica de verificación."
    }
]

math_curriculum["3°"]["Lógica"]["6°"] = [
    {
        "id": "log-6-3-1",
        "topic": "Lógica espacial y razonamiento geométrico: Puntos, rectas, segmentos, semirrectas y ángulos",
        "dba": dba_log_all,
        "achievement": "Conceptualiza elementos geométricos fundamentales y clasifica ángulos según su medida y posición en el plano.",
        "suggestedSequence": "Inicio: Identificación de puntos, rectas y planos en la infraestructura del salón de clases. Desarrollo: Clasificación de ángulos (agudo, recto, obtuso, llano) y medición con transportador. Cierre: Taller de dibujo geométrico utilizando regla, compás y transportador."
    },
    {
        "id": "log-6-3-2",
        "topic": "Clasificación y propiedades de polígonos: Triángulos, cuadriláteros y polígonos regulares",
        "dba": dba_log_all,
        "achievement": "Clasifica polígonos regulares e irregulares analizando el número de lados, vértices y la suma de sus ángulos interiores.",
        "suggestedSequence": "Inicio: Observación de señales de tránsito y azulejos para identificar polígonos regulares e irregulares. Desarrollo: Demostración empírica de que la suma de ángulos de un triángulo es 180°. Cierre: Construcción de figuras poligonales con geoplano y cálculo de sus elementos."
    },
    {
        "id": "log-6-3-3",
        "topic": "Transformaciones en el plano cartesiano: Traslación, rotación, reflexión y simetría",
        "dba": dba_log_all,
        "achievement": "Aplica traslaciones, rotaciones y reflexiones sobre figuras bidimensionales en el plano cartesiano identificando ejes de simetría.",
        "suggestedSequence": "Inicio: Juego del espejo y huellas de pasos para introducir la reflexión y traslación. Desarrollo: Ubicación de pares ordenados (x,y) en el plano cartesiano y aplicación de transformaciones rígidas. Cierre: Creación de un teselado o mosaico artístico aplicando simetrías en papel milimetrado."
    },
    {
        "id": "log-6-3-4",
        "topic": "Cálculo y estimación de perímetro y área en polígonos en contextos reales",
        "dba": dba_log_all,
        "achievement": "Calcula el perímetro y el área de rectángulos, triángulos y figuras compuestas aplicando fórmulas en situaciones prácticas de diseño y medición.",
        "suggestedSequence": "Inicio: Medición del contorno y superficie del pupitre y la cancha escolar. Desarrollo: Deducción de las fórmulas de área para cuadriláteros y triángulos y resolución de problemas de embaldosado y cercado. Cierre: Taller de cálculo de áreas y perímetros de figuras irregulares por descomposición."
    }
]

math_curriculum["4°"]["Lógica"]["6°"] = [
    {
        "id": "log-6-4-1",
        "topic": "Análisis crítico de datos y detección de sesgos o falacias estadísticas en medios de comunicación",
        "dba": dba_log_all,
        "achievement": "Analiza información estadística presentada en noticias y gráficos publicitarios detectando posibles sesgos, escalas engañosas y falacias de interpretación.",
        "suggestedSequence": "Inicio: Proyección de gráficas publicitarias reales con escalas distorsionadas para debatir su intención. Desarrollo: Criterios para identificar sesgos estadísticos, muestras no representativas y correlaciones falsas. Cierre: Análisis en equipos de artículos de periódicos o redes sociales identificando la veracidad de los datos."
    },
    {
        "id": "log-6-4-2",
        "topic": "Tablas de frecuencia y representación gráfica: Barras, sectores circulares y pictogramas",
        "dba": dba_log_all,
        "achievement": "Organiza conjuntos de datos en tablas de frecuencia absoluta y relativa, representándolos en diagramas de barras y circulares con precisión.",
        "suggestedSequence": "Inicio: Encuesta rápida en el aula sobre hábitos alimenticios o uso de tiempo libre. Desarrollo: Tabulación formal de datos, cálculo de porcentajes y trazado de diagramas de barras y circulares. Cierre: Socialización de las gráficas construidas y formulación de conclusiones cuantitativas."
    },
    {
        "id": "log-6-4-3",
        "topic": "Medidas de tendencia central: Media aritmética, mediana y moda en la toma de decisiones fundamentadas",
        "dba": dba_log_all,
        "achievement": "Calcula e interpreta la media, la mediana y la moda de un conjunto de datos para describir el comportamiento de una población.",
        "suggestedSequence": "Inicio: Análisis de calificaciones escolares y sueldos para cuestionar si el promedio siempre refleja la realidad. Desarrollo: Algoritmos de cálculo de media, mediana y moda con datos discretos y comparación de su utilidad. Cierre: Resolución de casos de toma de decisiones empresariales o deportivas fundamentadas en las medidas de centralización."
    },
    {
        "id": "log-6-4-4",
        "topic": "Lógica probabilística: Eventos seguros, posibles e imposibles, espacio muestral y regla de Laplace",
        "dba": dba_log_all,
        "achievement": "Determina el espacio muestral de un experimento aleatorio y calcula la probabilidad clásica de ocurrencia mediante la regla de Laplace.",
        "suggestedSequence": "Inicio: Lanzamiento de monedas y dados registrando frecuencias relativas de los resultados. Desarrollo: Definición formal de espacio muestral, eventos y formulación de la regla de Laplace P(A)=Casos favorables / Casos posibles. Cierre: Taller de cálculo de probabilidades en juegos de mesa, loterías y pronósticos del clima."
    }
]

print("Lógica 6° loaded.")
