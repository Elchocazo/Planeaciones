# Python script to enrich js/curriculum.js with all grades of Matemáticas and robust fallback
import json
import re

curriculum_math = {
    "1°": { # Period 1
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

    "2°": { # Period 2
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

    "3°": { # Period 3
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

    "4°": { # Period 4
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
    }
}

with open('js/curriculum.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace STORAGE_CURRICULUM_KEY with v5
code = code.replace("const STORAGE_CURRICULUM_KEY = 'teacher_curriculum_bank_v4';", "const STORAGE_CURRICULUM_KEY = 'teacher_curriculum_bank_v5';")

# For each period, inject the missing grades into Matemáticas
for period in ["1°", "2°", "3°", "4°"]:
    pattern = rf'("{period}":\s*\{{[\s\S]*?"Matemáticas":\s*\{{)([\s\S]*?)(\n\s*\}},\s*\n\s*"(?:Lógica|Dirección))'
    match = re.search(pattern, code)
    if match:
        prefix = match.group(1)
        existing_body = match.group(2)
        suffix = match.group(3)
        
        # Build new grade entries
        new_entries = []
        for grade, items in curriculum_math[period].items():
            # Check if this grade is already in existing_body
            if f'"{grade}":' not in existing_body:
                items_json = json.dumps(items, ensure_ascii=False, indent=8)
                # Adjust indent
                entry_str = f'\n      "{grade}": ' + items_json.strip()
                new_entries.append(entry_str)
        
        if new_entries:
            combined = existing_body + "," + ",".join(new_entries)
            code = code[:match.start()] + prefix + combined + suffix + code[match.end():]
            print(f"Added {len(new_entries)} grades to Period {period} Matemáticas")

# Also enhance getAutoCurriculumItem with the smart pedagogical fallback
old_auto_cur = """  getAutoCurriculumItem(period, subject, grade, classNum) {
    const items = this.getItems(period, subject, grade);
    if (!items || items.length === 0) return null;
    const num = Math.max(1, parseInt(classNum, 10) || 1);
    const idx = (num - 1) % items.length;
    return items[idx];
  },"""

new_auto_cur = """  getAutoCurriculumItem(period, subject, grade, classNum) {
    const items = this.getItems(period, subject, grade);
    if (items && items.length > 0) {
      const num = Math.max(1, parseInt(classNum, 10) || 1);
      const idx = (num - 1) % items.length;
      return items[idx];
    }

    // Generador pedagógico institucional de respaldo (asegura que nunca quede vacío)
    const num = Math.max(1, parseInt(classNum, 10) || 1);
    const subClean = String(subject || 'Clase').trim();
    const grdClean = String(grade || 'General').trim();
    const perClean = String(period || '1°').trim();
    return {
      id: `auto_${subClean}_${grdClean}_${perClean}_${num}`,
      topic: `${subClean} ${grdClean} - Eje Temático #${num} (${perClean} Periodo)`,
      dba: `DBA: Aplica los conceptos, modelos y competencias fundamentales de ${subClean} para ${grdClean} en la resolución de problemas durante el ${perClean} periodo.`,
      achievement: `Saber: Comprende los conceptos y estructuras clave de ${subClean} correspondientes a ${grdClean}. Hacer: Desarrolla actividades pedagógicas y talleres procedimentales con autonomía y rigor.`
    };
  },"""

if old_auto_cur in code:
    code = code.replace(old_auto_cur, new_auto_cur)
    print("Enhanced getAutoCurriculumItem with universal pedagogical fallback!")

# Enhance getItems to be resilient with grade formatting (e.g. '8' vs '8°')
old_get_items = """  getItems(period, subject, grade) {
    const all = this.getAllCurriculum();
    if (!all[period] || !all[period][subject] || !all[period][subject][grade]) {
      // Fallback a periodo 1° si no existe en ese periodo específico
      if (all["1°"] && all["1°"][subject] && all["1°"][subject][grade]) {
        return all["1°"][subject][grade];
      }
      return [];
    }
    return all[period][subject][grade] || [];
  },"""

new_get_items = """  getItems(period, subject, grade) {
    const all = this.getAllCurriculum();
    const normGrade = (g) => String(g || '').trim();
    const gKey = normGrade(grade);
    const gAlt = gKey.endsWith('°') ? gKey.slice(0, -1) : (gKey + '°');

    const findGradeItems = (perObj, sub) => {
      if (!perObj || !perObj[sub]) return null;
      if (perObj[sub][gKey]) return perObj[sub][gKey];
      if (perObj[sub][gAlt]) return perObj[sub][gAlt];
      // Búsqueda insensible a mayúsculas
      const subFound = Object.keys(perObj).find(k => k.toLowerCase() === String(sub).toLowerCase());
      if (subFound && perObj[subFound]) {
        if (perObj[subFound][gKey]) return perObj[subFound][gKey];
        if (perObj[subFound][gAlt]) return perObj[subFound][gAlt];
      }
      return null;
    };

    const direct = findGradeItems(all[period], subject);
    if (direct && direct.length > 0) return direct;

    // Fallback a periodo 1° si no existe en ese periodo específico
    const p1 = findGradeItems(all["1°"], subject);
    if (p1 && p1.length > 0) return p1;

    return [];
  },"""

if old_get_items in code:
    code = code.replace(old_get_items, new_get_items)
    print("Enhanced getItems with flexible grade normalization and case-insensitivity!")

with open('js/curriculum.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Curriculum successfully updated!")
