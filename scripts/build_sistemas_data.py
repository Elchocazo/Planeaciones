# -*- coding: utf-8 -*-
"""
Module defining Sistemas / Tecnología e Informática (1° a 8°) for all 4 periods.
Source: Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf
Colegio Hogar Madre de Dios - Docente: Manuel Muñoz
"""

dba_sis_1 = (
    "• Reconoce las características y funciones de algunos objetos tecnológicos para comprender su utilidad en la vida cotidiana.\n"
    "• Identifica las partes que componen los objetos tecnológicos para desarrollar curiosidad y pensamiento analítico.\n"
    "• Explora las posibilidades de uso de programas o aplicaciones informáticas para expresar ideas y fortalecer su aprendizaje.\n"
    "• Describe las acciones que realizan los objetos tecnológicos para entender cómo contribuyen a resolver problemas.\n"
    "• Utiliza programas o aplicaciones informáticas para comunicarse y compartir información de forma segura y respetuosa."
)

dba_sis_2 = (
    "• Reconoce artefactos creados por el ser humano para satisfacer necesidades cotidianas en el hogar y la escuela.\n"
    "• Identifica la evolución histórica de herramientas cotidianas y su relación con el bienestar humano.\n"
    "• Utiliza funciones básicas del procesador de texto, explorador de archivos y periféricos del computador de forma segura y autónoma."
)

dba_sis_3 = (
    "• Reconoce y utiliza diferentes dispositivos tecnológicos para comunicarse con otras personas, teniendo en cuenta normas de uso seguro y responsable.\n"
    "• Identifica periféricos de entrada, salida y almacenamiento, comprendiendo el flujo básico de información en un sistema computacional.\n"
    "• Aplica secuencias ordenadas de pasos (algoritmos) y programas sencillos de bloques para resolver retos lógicos y expresarse creativamente."
)

dba_sis_4 = (
    "• Dominar las herramientas ofimáticas para crear documentos y presentaciones con formato profesional, estructura visual armónica y coherencia comunicativa.\n"
    "• Aplica estructuras de programación básica (secuencias, bucles y condicionales simples) para crear historias interactivas o juegos en entornos visuales.\n"
    "• Evalúa el impacto de los residuos tecnológicos en el medio ambiente y propone prácticas de uso responsable, sostenible y preventivo."
)

dba_sis_5 = (
    "• Dominar las herramientas ofimáticas avanzadas para crear reportes académicos con normas editoriales (APA), tablas dinámicas y fórmulas en hojas de cálculo.\n"
    "• Desarrolla pensamiento algorítmico modelando problemas mediante variables, operadores lógicos y funciones en programación por bloques.\n"
    "• Reconoce los principios de la ciudadanía digital, previniendo riesgos en internet (ciberacoso, pérdida de privacidad) y fomentando el trabajo colaborativo en la nube."
)

dba_sis_6 = (
    "• Reconocer y aplicar las herramientas del computador y del sistema operativo Windows para desarrollar habilidades técnicas, analíticas y creativas.\n"
    "• Utiliza hojas de cálculo para procesar datos numéricos mediante funciones condicionales y gráficos estadísticos que facilitan la toma de decisiones.\n"
    "• Produce contenidos audiovisuales y multimedia aplicando criterios de diseño gráfico y edición digital responsable.\n"
    "• Identifica los componentes fundamentales de un sistema robótico (sensores, controladores, actuadores) y simula circuitos básicos."
)

dba_sis_7 = (
    "• Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.\n"
    "• Aplica estructuras de programación estructurada en Scratch con variables, listas dinámicas y modularidad para resolver problemas y simular procesos.\n"
    "• Comprende los principios básicos de la electrónica y la interacción entre hardware y software mediante microcontroladores programables.\n"
    "• Diseña e implementa prototipos automatizados sencillos orientados a solucionar necesidades escolares o comunitarias."
)

dba_sis_8 = (
    "• Analizar elementos, procesos y servicios tecnológicos relacionados con su entorno, utilizando herramientas de diseño, telecomunicaciones y automatización.\n"
    "• Diseña y estructura páginas web básicas utilizando los estándares HTML5 y CSS3 para publicar información de interés escolar.\n"
    "• Aplica los fundamentos de la programación textual en Python (variables, condicionales, ciclos) en la resolución de problemas lógicos.\n"
    "• Comprende el funcionamiento de sistemas mecatrónicos, mecanismos de transmisión de movimiento y redes de comunicación de datos."
)

def populate_sistemas(all_data):
    # Ensure subjects exist in all periods
    for p in ["1°", "2°", "3°", "4°"]:
        if "Sistemas" not in all_data[p]:
            all_data[p]["Sistemas"] = {}

    # =========================================================================
    # SISTEMAS 1°
    # =========================================================================
    all_data["1°"]["Sistemas"]["1°"] = [
        {
            "id": "sis-1-1-1",
            "topic": "Los objetos que nos rodean y los artefactos tecnológicos del hogar y la escuela",
            "dba": dba_sis_1,
            "achievement": "Identifica objetos tecnológicos en su entorno cotidiano y describe la función que cumplen para facilitar las actividades diarias.",
            "suggestedSequence": "Inicio: Recorrido de observación por el aula identificando objetos creados por el ser humano. Desarrollo: Clasificación de artefactos según el lugar donde se usan (cocina, aula, transporte). Cierre: Dibujo en el cuaderno de su artefacto tecnológico favorito explicando para qué sirve."
        },
        {
            "id": "sis-1-1-2",
            "topic": "¿Qué es la tecnología? Necesidades humanas que satisface",
            "dba": dba_sis_1,
            "achievement": "Reconoce que la tecnología surge del ingenio humano para resolver problemas y mejorar la calidad de vida de las personas.",
            "suggestedSequence": "Inicio: Cuento infantil sobre la invención de la rueda y las herramientas de los primeros humanos. Desarrollo: Diálogo guiado comparando cómo se hacían las tareas antes y cómo se hacen ahora con la tecnología. Cierre: Modelado con plastilina de una herramienta inventada por el estudiante."
        },
        {
            "id": "sis-1-1-3",
            "topic": "Cuidado y uso responsable de nuestros útiles escolares y dispositivos electrónicos",
            "dba": dba_sis_1,
            "achievement": "Aplica normas de cuidado, orden y respeto al manipular materiales escolares y aparatos tecnológicos.",
            "suggestedSequence": "Inicio: Conversación sobre qué le pasa a los objetos si no los cuidamos o se caen al suelo. Desarrollo: Elaboración conjunta del decálogo de cuidado de los dispositivos y útiles del salón. Cierre: Compromiso individual firmado con huella dactilar para el buen uso de los recursos."
        },
        {
            "id": "sis-1-1-4",
            "topic": "Diferencias entre objetos naturales y objetos artificiales (creados por el hombre)",
            "dba": dba_sis_1,
            "achievement": "Distingue elementos de la naturaleza de artefactos artificiales elaborados por el ser humano mediante comparación directa.",
            "suggestedSequence": "Inicio: Exploración en el patio recolectando hojas, piedras y comparándolas con lápices y tijeras. Desarrollo: Tabla comparativa de dos columnas clasificando elementos naturales vs. artificiales. Cierre: Taller de recorte y pegado de imágenes en la categoría correcta."
        }
    ]

    all_data["2°"]["Sistemas"]["1°"] = [
        {
            "id": "sis-1-2-1",
            "topic": "El computador como herramienta de trabajo, aprendizaje y juego",
            "dba": dba_sis_1,
            "achievement": "Reconoce el computador como un artefacto electrónico que procesa información y apoya el aprendizaje escolar.",
            "suggestedSequence": "Inicio: Visita guiada a la sala de sistemas observando los computadores encendidos. Desarrollo: Explicación de los usos del computador en escuelas, hospitales, bancos y hogares. Cierre: Identificación oral de las actividades que les gustaría realizar en el computador."
        },
        {
            "id": "sis-1-2-2",
            "topic": "Procedimiento seguro de encendido y apagado del computador",
            "dba": dba_sis_1,
            "achievement": "Sigue los pasos secuenciales correctos para encender y apagar el computador sin dañar los componentes.",
            "suggestedSequence": "Inicio: Explicación de por qué no se debe desconectar directamente el cable de energía. Desarrollo: Práctica guiada presionando el botón Power y usando la opción Inicio -> Apagar en Windows. Cierre: Lista de chequeo donde cada niño demuestra que sabe encender y apagar su equipo."
        },
        {
            "id": "sis-1-2-3",
            "topic": "Partes principales del computador: Monitor (pantalla), teclado, mouse (ratón) y CPU",
            "dba": dba_sis_1,
            "achievement": "Identifica y nombra las partes físicas fundamentales del computador describiendo la función de cada una.",
            "suggestedSequence": "Inicio: Canción infantil sobre las partes del computador y señalización en el equipo real. Desarrollo: Asociación: el monitor muestra imágenes, el teclado escribe, el mouse señala y la CPU piensa. Cierre: Coloreado y rotulación de una ficha gráfica con las partes del computador."
        },
        {
            "id": "sis-1-2-4",
            "topic": "Manejo del mouse: Clic, doble clic, arrastre y coordinación visomotriz",
            "dba": dba_sis_1,
            "achievement": "Desarrolla destreza en el agarre del mouse ejecutando clics, doble clic y arrastre en actividades interactivas.",
            "suggestedSequence": "Inicio: Postura ergonómica de la mano sobre el mouse y explicación de los botones izquierdo y derecho. Desarrollo: Juegos interactivos de puntería, reventar burbujas y arrastrar piezas de rompecabezas. Cierre: Observación formativa del dominio motriz fino al interactuar con el puntero."
        },
        {
            "id": "sis-1-2-5",
            "topic": "Normas de convivencia y cuidado en la sala de sistemas",
            "dba": dba_sis_1,
            "achievement": "Cumple las normas de aseo, orden, silencio y no ingreso de alimentos a la sala de cómputo.",
            "suggestedSequence": "Inicio: Dramatización sobre qué ocurre si se derrama líquido sobre un teclado. Desarrollo: Socialización de las reglas de oro de la sala de sistemas (manos limpias, orden, respeto). Cierre: Elaboración de carteles ilustrados con las normas para decorar la sala."
        }
    ]

    all_data["3°"]["Sistemas"]["1°"] = [
        {
            "id": "sis-1-3-1",
            "topic": "Explorando el programa Paint: El lienzo digital y la barra de herramientas",
            "dba": dba_sis_1,
            "achievement": "Reconoce la interfaz del programa de dibujo Paint identificando el área de trabajo y la barra de opciones.",
            "suggestedSequence": "Inicio: Apertura del programa Paint desde el menú de inicio guiados por el docente. Desarrollo: Exploración libre de la ventana: barra de título, lienzo en blanco y paleta de colores. Cierre: Realización del primer trazo libre en la pantalla y cambio de color."
        },
        {
            "id": "sis-1-3-2",
            "topic": "Herramientas de dibujo en Paint: Lápiz, pinceles, borrador y figuras geométricas básicas",
            "dba": dba_sis_1,
            "achievement": "Utiliza herramientas de lápiz, pincel, borrador y figuras geométricas para crear composiciones gráficas sencillas.",
            "suggestedSequence": "Inicio: Demostración del uso de formas geométricas (círculo, cuadrado, triángulo) para dibujar una casa. Desarrollo: Práctica guiada combinando formas y usando el bote de pintura para rellenar con color. Cierre: Exposición en pantalla de los dibujos de casas y paisajes creados por los estudiantes."
        },
        {
            "id": "sis-1-3-3",
            "topic": "El teclado: Reconocimiento de letras, números, barra espaciadora y tecla Enter",
            "dba": dba_sis_1,
            "achievement": "Localiza en el teclado las letras de su nombre, los dígitos numéricos, el espaciador y el salto de línea.",
            "suggestedSequence": "Inicio: Búsqueda tipo 'caza del tesoro' de las vocales en el teclado del computador. Desarrollo: Identificación de la barra espaciadora para separar palabras y la tecla Enter para bajar de renglón. Cierre: Escritura de su nombre completo y edad en el procesador de notas infantiles."
        },
        {
            "id": "sis-1-3-4",
            "topic": "Creación y guardado de dibujos digitales expresando ideas y emociones",
            "dba": dba_sis_1,
            "achievement": "Diseña ilustraciones digitales creativas y aprende los pasos guiados para guardar su trabajo en el computador.",
            "suggestedSequence": "Inicio: Diálogo sobre cómo se sienten hoy y qué dibujo representa su emoción. Desarrollo: Creación del dibujo en Paint y práctica del comando Archivo -> Guardar con ayuda del docente. Cierre: Portafolio digital de dibujos proyectados para la retroalimentación grupal."
        }
    ]

    all_data["4°"]["Sistemas"]["1°"] = [
        {
            "id": "sis-1-4-1",
            "topic": "¿Qué es internet y para qué sirve? La red que conecta al mundo",
            "dba": dba_sis_1,
            "achievement": "Comprende de manera intuitiva que internet es una red mundial que permite consultar información y comunicarse.",
            "suggestedSequence": "Inicio: Metáfora de una gran telaraña invisible o biblioteca gigante que conecta a las personas. Desarrollo: Visualización de un mapa mundial interactivo mostrando conexiones y fotos de diferentes países. Cierre: Preguntas reflexivas: ¿A quién te gustaría escribirle o qué te gustaría aprender en internet?"
        },
        {
            "id": "sis-1-4-2",
            "topic": "Navegación básica en entornos educativos guiados y portales infantiles",
            "dba": dba_sis_1,
            "achievement": "Navega por sitios web infantiles educativos utilizando enlaces, botones y flechas de avance y retroceso.",
            "suggestedSequence": "Inicio: Reconocimiento del ícono del navegador web (Google Chrome / Edge) y su función. Desarrollo: Navegación supervisada por plataformas educativas (Árbol ABC / Mundo Primaria). Cierre: Práctica haciendo clic en botones interactivos de actividades didácticas."
        },
        {
            "id": "sis-1-4-3",
            "topic": "Reglas de oro para el uso seguro de internet y protección de datos",
            "dba": dba_sis_1,
            "achievement": "Aplica pautas de seguridad digital como no compartir contraseñas, no hablar con extraños y pedir ayuda a un adulto.",
            "suggestedSequence": "Inicio: Cuento infantil sobre la privacidad y los secretos seguros en internet. Desarrollo: Análisis de situaciones de riesgo: qué hacer si aparece una ventana extraña o alguien pide fotos. Cierre: Creación del escudo protector de internet con las 3 reglas de oro."
        },
        {
            "id": "sis-1-4-4",
            "topic": "Juegos de aprendizaje digital y cierre del año tecnológico",
            "dba": dba_sis_1,
            "achievement": "Desarrolla habilidades cognitivas y de razonamiento lógico a través de videojuegos educativos supervisados.",
            "suggestedSequence": "Inicio: Ronda de retos de memoria y emparejamiento de figuras en la plataforma educativa. Desarrollo: Competencia sana individual resolviendo puzzles matemáticos y de lenguaje. Cierre: Balance de los aprendizajes del año y entrega simbólica del diploma de explorador digital."
        }
    ]

    # =========================================================================
    # SISTEMAS 2°
    # =========================================================================
    all_data["1°"]["Sistemas"]["2°"] = [
        {
            "id": "sis-2-1-1",
            "topic": "Concepto, origen y evolución histórica de los objetos tecnológicos cotidianos",
            "dba": dba_sis_2,
            "achievement": "Reconoce la evolución histórica de artefactos cotidianos y cómo han transformado la vida del ser humano.",
            "suggestedSequence": "Inicio: Comparación entre la vela, la lámpara de aceite y la bombilla eléctrica. Desarrollo: Línea de tiempo sencilla mostrando la evolución de artefactos de comunicación y transporte. Cierre: Taller de ilustración comparando un objeto antiguo con su versión moderna."
        },
        {
            "id": "sis-2-1-2",
            "topic": "Impacto de la tecnología en la comunicación, el transporte y el hogar",
            "dba": dba_sis_2,
            "achievement": "Describe los beneficios y desafíos que genera la tecnología en las actividades cotidianas de su comunidad.",
            "suggestedSequence": "Inicio: Pregunta problematizadora: ¿Cómo se comunicaban las personas antes de que existieran los celulares? Desarrollo: Análisis de los cambios positivos en la medicina, educación y transporte gracias a la tecnología. Cierre: Taller de redacción de oraciones sobre el beneficio de un invento tecnológico."
        },
        {
            "id": "sis-2-1-3",
            "topic": "Uso responsable, sostenible y reciclaje de materiales y artefactos tecnológicos",
            "dba": dba_sis_2,
            "achievement": "Propone acciones para el cuidado del medio ambiente frente a los residuos electrónicos y el ahorro de energía.",
            "suggestedSequence": "Inicio: Observación de imágenes sobre la basura tecnológica (pilas, cables rotos). Desarrollo: Pautas de ahorro de energía (apagar monitores) y reciclaje adecuado de pilas y aparatos en desuso. Cierre: Elaboración de afiches promoviendo el reciclaje tecnológico en el colegio."
        }
    ]

    all_data["2°"]["Sistemas"]["2°"] = [
        {
            "id": "sis-2-2-1",
            "topic": "Estructura y bloques del teclado: Teclas alfanuméricas, numéricas, de función y control",
            "dba": dba_sis_2,
            "achievement": "Identifica las zonas del teclado (alfanumérica, numérica, de navegación y control) y su función específica.",
            "suggestedSequence": "Inicio: Observación de un teclado gigante en pantalla reconociendo los diferentes colores por bloques. Desarrollo: Uso de teclas especiales: Bloq Mayús, Retroceso (borrar), Supr, flechas de dirección y Shift. Cierre: Práctica guiada escribiendo oraciones combinando mayúsculas, minúsculas y números."
        },
        {
            "id": "sis-2-2-2",
            "topic": "Posición correcta de las manos y ergonomía frente al computador",
            "dba": dba_sis_2,
            "achievement": "Adopta una postura corporal adecuada frente al computador y ubica las manos correctamente sobre el teclado.",
            "suggestedSequence": "Inicio: Dinámica de pausas activas y estiramiento de muñecas y espalda. Desarrollo: Explicación de la postura correcta: espalda recta, pies apoyados y vista al nivel de la pantalla. Cierre: Práctica de digitación usando ambas manos sin encorvar la espalda."
        },
        {
            "id": "sis-2-2-3",
            "topic": "Concepto de archivo y carpeta en el explorador de Windows",
            "dba": dba_sis_2,
            "achievement": "Comprende la diferencia entre un archivo (documento, foto) y una carpeta como contenedor de información.",
            "suggestedSequence": "Inicio: Metáfora de la mochila escolar: los cuadernos son archivos y los bolsillos son carpetas. Desarrollo: Navegación por el explorador de Windows reconociendo íconos de documentos y carpetas amarillas. Cierre: Creación de una carpeta personal con su nombre en la ubicación indicada."
        }
    ]

    all_data["3°"]["Sistemas"]["2°"] = [
        {
            "id": "sis-2-3-1",
            "topic": "Introducción al procesador de textos (Word / WordPad): Entorno de trabajo y escritura básica",
            "dba": dba_sis_2,
            "achievement": "Reconoce la ventana del procesador de textos y escribe párrafos cortos aplicando signos de puntuación.",
            "suggestedSequence": "Inicio: Comparación entre escribir a mano en una hoja y escribir en la pantalla de Word. Desarrollo: Reconocimiento del cursor parpadeante, barra de herramientas y hoja en blanco de trabajo. Cierre: Redacción de una pequeña anécdota personal de tres renglones."
        },
        {
            "id": "sis-2-3-2",
            "topic": "Edición y formato de texto: Tipo de letra (fuente), tamaño, color, negrita, cursiva y subrayado",
            "dba": dba_sis_2,
            "achievement": "Modifica la apariencia del texto seleccionado cambiando fuente, tamaño, estilo y color de manera armónica.",
            "suggestedSequence": "Inicio: Observación de titulares de revistas con diferentes tipografías llamativas. Desarrollo: Selección de texto con el mouse y aplicación de botones: Negrita (N), Cursiva (K), Subrayado (S) y colores. Cierre: Ejercicio de personalización de un poema escolar con distintos formatos."
        },
        {
            "id": "sis-2-3-3",
            "topic": "Alineación de párrafos e inserción de imágenes sencillas",
            "dba": dba_sis_2,
            "achievement": "Aplica alineaciones (izquierda, centrada, derecha) e inserta imágenes ilustrativas en sus escritos.",
            "suggestedSequence": "Inicio: Explicación de por qué los títulos van centrados y los textos a la izquierda. Desarrollo: Práctica de alineación y uso del menú Insertar -> Imágenes para acompañar la redacción. Cierre: Creación de una tarjeta de felicitación con título centrado, mensaje e imagen decorativa."
        }
    ]

    all_data["4°"]["Sistemas"]["2°"] = [
        {
            "id": "sis-2-4-1",
            "topic": "Motores de búsqueda para niños y navegadores web seguros",
            "dba": dba_sis_2,
            "achievement": "Utiliza buscadores infantiles seguros para encontrar información confiable sobre temas de clase.",
            "suggestedSequence": "Inicio: ¿Cómo sabe Google la respuesta a nuestras preguntas? Introducción a las palabras clave. Desarrollo: Búsqueda guiada en buscadores seguros (Kiddle / Google SafeSearch) sobre animales en peligro. Cierre: Selección de la información más clara y pertinente para compartir en clase."
        },
        {
            "id": "sis-2-4-2",
            "topic": "Netiqueta básica: Cortesía, respeto y buen trato en entornos digitales",
            "dba": dba_sis_2,
            "achievement": "Reconoce y aplica normas de cortesía, amabilidad y respeto al comunicarse mediante medios digitales.",
            "suggestedSequence": "Inicio: Debate sobre cómo nos sentimos cuando alguien nos envía un mensaje grosero o en mayúsculas sostenidas. Desarrollo: Construcción del decálogo de la Netiqueta escolar: saludar, pedir por favor y agradecer en línea. Cierre: Simulación de redacción de mensajes respetuosos a profesores y compañeros."
        },
        {
            "id": "sis-2-4-3",
            "topic": "Ciberseguridad infantil: Prevención ante extraños y cuidado de contraseñas",
            "dba": dba_sis_2,
            "achievement": "Identifica medidas de autoprotección en internet evitando compartir datos privados y contraseñas.",
            "suggestedSequence": "Inicio: Juego de roles sobre qué hacer si alguien desconocido intenta chatear en un juego en línea. Desarrollo: Definición de datos personales secretos (nombre completo, dirección, colegio, contraseñas). Cierre: Elaboración de una contraseña segura y fácil de recordar con símbolos y números."
        }
    ]

    # =========================================================================
    # SISTEMAS 3°
    # =========================================================================
    all_data["1°"]["Sistemas"]["3°"] = [
        {
            "id": "sis-3-1-1",
            "topic": "Periféricos de entrada, salida y almacenamiento en los sistemas de cómputo",
            "dba": dba_sis_3,
            "achievement": "Clasifica periféricos del computador en dispositivos de entrada, salida y almacenamiento según el flujo de datos.",
            "suggestedSequence": "Inicio: Pregunta problematizadora: ¿Por dónde entra la información al computador y por dónde sale? Desarrollo: Diagrama de flujo de datos clasificando teclado/mouse (entrada), monitor/parlantes (salida) y USB/disco (almacenamiento). Cierre: Taller de asociación y emparejamiento de periféricos con su categoría."
        },
        {
            "id": "sis-3-1-2",
            "topic": "Evolución histórica de los medios de comunicación y telecomunicaciones",
            "dba": dba_sis_3,
            "achievement": "Reconoce los hitos en la evolución de las telecomunicaciones desde el telégrafo hasta los teléfonos inteligentes.",
            "suggestedSequence": "Inicio: Línea del tiempo de la comunicación humana: señales de humo, cartas, telégrafo, teléfono y satélites. Desarrollo: Comparación de la velocidad y alcance de la información en el siglo XIX vs. siglo XXI. Cierre: Elaboración de una historieta gráfica que ilustre la transformación de la comunicación."
        },
        {
            "id": "sis-3-1-3",
            "topic": "Ergonomía digital y salud física en el uso de tecnologías",
            "dba": dba_sis_3,
            "achievement": "Aplica pautas ergonómicas de postura, distancia visual y pausas activas para evitar fatiga física.",
            "suggestedSequence": "Inicio: Explicación de las consecuencias de la mala postura y el uso excesivo de pantallas en los ojos y cuello. Desarrollo: Rutina de ejercicios de relajación visual (regla 20-20-20) y estiramiento de extremidades. Cierre: Creación de una lista de verificación ergonómica para aplicar en casa y en el aula."
        }
    ]

    all_data["2°"]["Sistemas"]["3°"] = [
        {
            "id": "sis-3-2-1",
            "topic": "Procesamiento de textos en Word: Interlineado, márgenes, sangrías y viñetas",
            "dba": dba_sis_3,
            "achievement": "Organiza documentos de texto aplicando interlineado adecuado, listas numeradas y viñetas temáticas.",
            "suggestedSequence": "Inicio: Observación de un texto desordenado vs. un texto con listas claras y buen espaciado. Desarrollo: Práctica guiada configurando márgenes normales, interlineado de 1.5 y viñetas personalizadas. Cierre: Creación de un recetario escolar o lista de normas aplicando listas con viñetas."
        },
        {
            "id": "sis-3-2-2",
            "topic": "Creación y formato de tablas para organizar información escolar",
            "dba": dba_sis_3,
            "achievement": "Inserta y personaliza tablas con filas y columnas aplicando bordes y sombreados de color.",
            "suggestedSequence": "Inicio: Necesidad de organizar el horario semanal de clases de forma clara y visual. Desarrollo: Uso del menú Insertar -> Tabla, ajuste del ancho de columnas y aplicación de estilos de tabla. Cierre: Elaboración del horario escolar personal con colores para cada asignatura."
        },
        {
            "id": "sis-3-2-3",
            "topic": "Introducción a presentaciones multimedia en PowerPoint: Diapositivas, títulos y diseño",
            "dba": dba_sis_3,
            "achievement": "Crea presentaciones digitales sencillas con diapositivas estructuradas combinando títulos, texto e imágenes.",
            "suggestedSequence": "Inicio: ¿Qué es una presentación y para qué se usa en conferencias y clases? Desarrollo: Creación de diapositiva de título y diapositivas de contenido aplicando temas y plantillas de diseño. Cierre: Exposición grupal de una presentación de 3 diapositivas sobre su animal preferido."
        }
    ]

    all_data["3°"]["Sistemas"]["3°"] = [
        {
            "id": "sis-3-3-1",
            "topic": "Pensamiento computacional: Concepto de algoritmo en la vida diaria (pasos ordenados)",
            "dba": dba_sis_3,
            "achievement": "Identifica que un algoritmo es una secuencia lógica de pasos finitos y ordenados para resolver un problema.",
            "suggestedSequence": "Inicio: Instrucciones para cepillarse los dientes o preparar un sándwich de mermelada paso a paso. Desarrollo: Descomposición de tareas cotidianas en instrucciones secuenciales precisas sin omitir detalles. Cierre: Juego de 'robot humano': un estudiante da órdenes exactas a otro para cruzar un camino con obstáculos."
        },
        {
            "id": "sis-3-3-2",
            "topic": "Programación por bloques con Scratch / Code.org: Entorno, personajes (sprites) y movimiento",
            "dba": dba_sis_3,
            "achievement": "Reconoce la interfaz de Scratch y programa el desplazamiento y cambio de apariencia de personajes.",
            "suggestedSequence": "Inicio: Presentación del gato de Scratch y del escenario interactivo. Desarrollo: Arrastre y encaje de bloques de movimiento (mover 10 pasos, girar 15 grados) y apariencia (cambiar disfraz). Cierre: Programación de un personaje que camina por el escenario de un extremo a otro."
        },
        {
            "id": "sis-3-3-3",
            "topic": "Eventos y sonido en la programación: Al presionar bandera verde y teclas",
            "dba": dba_sis_3,
            "achievement": "Utiliza bloques de eventos para iniciar programas y reproducir efectos de sonido sincronizados.",
            "suggestedSequence": "Inicio: Explicación de cómo responde un videojuego cuando oprimimos un botón en el control. Desarrollo: Uso de eventos 'al presionar bandera verde' y 'al presionar tecla espacio' con bloques de sonido. Cierre: Creación de una pequeña animación musical donde los personajes bailan y emiten sonidos."
        }
    ]

    all_data["4°"]["Sistemas"]["3°"] = [
        {
            "id": "sis-3-4-1",
            "topic": "Redes locales e internet: Cómo viaja la información en el mundo digital",
            "dba": dba_sis_3,
            "achievement": "Comprende los conceptos básicos de red, conexión por cable Wi-Fi y transmisión de paquetes de datos.",
            "suggestedSequence": "Inicio: Metáfora del cartero y las cartas postales para entender el envío de mensajes por internet. Desarrollo: Identificación de equipos de red en el colegio (router, cables de red, antenas Wi-Fi). Cierre: Esquema ilustrado del camino que recorre un mensaje desde el computador local hasta otro equipo."
        },
        {
            "id": "sis-3-4-2",
            "topic": "Derechos de autor en entornos digitales: Honestidad académica y citación básica",
            "dba": dba_sis_3,
            "achievement": "Reconoce la propiedad intelectual y la importancia de dar crédito a los autores de imágenes y textos de internet.",
            "suggestedSequence": "Inicio: Debate reflexivo: ¿Cómo te sentirías si alguien presenta tu dibujo como si fuera de él? Desarrollo: Explicación del plagio escolar y pautas para incluir la fuente de donde se tomaron las fotos o textos. Cierre: Taller de elaboración de una ficha informativa agregando el crédito del autor consultado."
        },
        {
            "id": "sis-3-4-3",
            "topic": "Huella digital y privacidad: Cuidado de fotos e información compartida",
            "dba": dba_sis_3,
            "achievement": "Identifica los riesgos de publicar información personal en internet y toma decisiones seguras de privacidad.",
            "suggestedSequence": "Inicio: Dinámica de la huella en la arena vs. la huella en internet que nunca se borra. Desarrollo: Análisis de casos sobre publicaciones en redes sociales y configuración de privacidad. Cierre: Proyecto final de grado: revista digital con los mejores aprendizajes tecnológicos del año."
        }
    ]

    # =========================================================================
    # SISTEMAS 4° (Mapeado a 4°, 4°A y 4°B)
    # =========================================================================
    all_data["1°"]["Sistemas"]["4°"] = [
        {
            "id": "sis-4-1-1",
            "topic": "Procesador de texto avanzado: Estilos rápidos de título, jerarquía visual y márgenes normalizados",
            "dba": dba_sis_4,
            "achievement": "Diseña y estructura documentos escritos aplicando estilos de encabezado, jerarquía visual y márgenes adecuados.",
            "suggestedSequence": "Inicio: Comparación entre un documento plano y un informe profesional estructurado con títulos y subtítulos. Desarrollo: Aplicación de estilos de Word (Título 1, Título 2, Normal) y configuración de márgenes en centímetros. Cierre: Maquetación de un informe científico escolar con portada y estructura formal."
        },
        {
            "id": "sis-4-1-2",
            "topic": "Tablas complejas con bordes, sombreados y fórmulas básicas de suma en Word",
            "dba": dba_sis_4,
            "achievement": "Organiza datos en tablas complejas combinando celdas, aplicando sombreados y alineaciones numéricas.",
            "suggestedSequence": "Inicio: Creación de una factura de compras escolar para simular un presupuesto. Desarrollo: Combinar y dividir celdas, aplicar sombreado alternado y fórmulas de suma rápida en tablas de Word. Cierre: Taller de diseño de un cuadro comparativo de ventajas y desventajas tecnológicas."
        },
        {
            "id": "sis-4-1-3",
            "topic": "Inserción y ajuste de imágenes, formas SmartArt y gráficos informativos",
            "dba": dba_sis_4,
            "achievement": "Enriquece documentos escritos integrando gráficos SmartArt e imágenes con ajuste de texto adecuado (cuadrado, estrecho).",
            "suggestedSequence": "Inicio: Cómo hacer que una imagen no descuadre los párrafos al moverla en la página. Desarrollo: Uso de opciones de ajuste de texto, formatos de imagen (recorte, bordes) y organigramas SmartArt. Cierre: Creación de un folleto o tríptico informativo con ilustraciones organizadas."
        }
    ]

    all_data["2°"]["Sistemas"]["4°"] = [
        {
            "id": "sis-4-2-1",
            "topic": "Diseño de presentaciones multimedia de alto impacto: Estructura narrativa y balance visual",
            "dba": dba_sis_4,
            "achievement": "Diseña diapositivas con balance adecuado entre texto e imagen evitando la sobrecarga informativa.",
            "suggestedSequence": "Inicio: La regla de oro en presentaciones: 'menos texto y más ideas visuales'. Desarrollo: Selección de paletas de color armónicas, contraste de fuentes y distribución espacial de elementos. Cierre: Diseño de una presentación de 4 diapositivas sobre un destino turístico de Colombia."
        },
        {
            "id": "sis-4-2-2",
            "topic": "Animaciones de entrada, énfasis y salida, y transiciones entre diapositivas",
            "dba": dba_sis_4,
            "achievement": "Aplica efectos de animación y transición con criterio estético para guiar la atención del público durante una exposición.",
            "suggestedSequence": "Inicio: Demostración de cómo las animaciones excesivas distraen en vez de ayudar. Desarrollo: Configuración de animaciones ordenadas por clic o automáticas, y transiciones suaves de diapositiva. Cierre: Taller de temporización y prueba de la presentación en modo pantalla completa."
        },
        {
            "id": "sis-4-2-3",
            "topic": "Inserción de audios, narraciones de voz y videos en presentaciones digitales",
            "dba": dba_sis_4,
            "achievement": "Integra elementos sonoros y audiovisuales en presentaciones multimedia enriqueciendo la comunicación oral.",
            "suggestedSequence": "Inicio: Grabación de una narración de voz con micrófono para acompañar una imagen. Desarrollo: Inserción de videos educativos cortos y configuración de reproducción automática en PowerPoint. Cierre: Exposición oral grupal apoyada en las diapositivas multimedia creadas."
        }
    ]

    all_data["3°"]["Sistemas"]["4°"] = [
        {
            "id": "sis-4-3-1",
            "topic": "Estructuras de repetición (bucles 'por siempre' y 'repetir N veces') en Scratch",
            "dba": dba_sis_4,
            "achievement": "Utiliza bucles y estructuras repetitivas para optimizar algoritmos y crear movimientos continuos en personajes.",
            "suggestedSequence": "Inicio: Comparar dar 10 órdenes repetidas vs. decir 'repite esto 10 veces'. Desarrollo: Programación de ciclos 'repetir 10' y 'por siempre' en Scratch para animar caminatas y patrullajes. Cierre: Creación de un personaje que patrulla una zona rebotando si toca el borde."
        },
        {
            "id": "sis-4-3-2",
            "topic": "Condicionales simples ('si... entonces') y detección de sensores en programación",
            "dba": dba_sis_4,
            "achievement": "Implementa condicionales y sensores de contacto o color para programar la toma de decisiones en un videojuego.",
            "suggestedSequence": "Inicio: Lógica de la vida: 'Si llueve llevo paraguas, si no, salgo sin él'. Desarrollo: Uso del bloque 'si <tocando color/objeto> entonces' para simular colisiones y rebotes. Cierre: Programación de un juego interactivo donde un pez come comida y suma puntos."
        },
        {
            "id": "sis-4-3-3",
            "topic": "Variables de juego: Creación de puntaje, cronómetro y vidas",
            "dba": dba_sis_4,
            "achievement": "Crea y manipula variables numéricas en Scratch para registrar el avance y puntaje de un juego interactivo.",
            "suggestedSequence": "Inicio: ¿Cómo sabe un juego cuántas monedas hemos recogido o cuánto tiempo nos queda? Desarrollo: Creación de variables 'Puntos' y 'Vidas' con bloques de inicialización y cambio de valor (+1, -1). Cierre: Juego interactivo completo con pantalla de 'Ganaste' o 'Fin del juego'."
        }
    ]

    all_data["4°"]["Sistemas"]["4°"] = [
        {
            "id": "sis-4-4-1",
            "topic": "Basura electrónica (e-waste): Causas, consecuencias y reciclaje responsable",
            "dba": dba_sis_4,
            "achievement": "Analiza la problemática ambiental provocada por los desechos tecnológicos y propone alternativas de reciclaje.",
            "suggestedSequence": "Inicio: Video documental sobre qué pasa con los computadores y celulares viejos en el mundo. Desarrollo: Identificación de metales pesados contaminantes (plomo, mercurio) y centros de acopio certificados. Cierre: Redacción de una propuesta escolar para recolectar pilas usadas en el colegio."
        },
        {
            "id": "sis-4-4-2",
            "topic": "Consumo eficiente de energía y sostenibilidad en el uso de dispositivos digitales",
            "dba": dba_sis_4,
            "achievement": "Aplica hábitos de eficiencia energética y optimización del rendimiento en computadores y dispositivos móviles.",
            "suggestedSequence": "Inicio: Comparación del consumo de energía en modo suspensión vs. apagado total. Desarrollo: Ajustes de brillo de pantalla, desconexión de cargadores y optimización de batería. Cierre: Taller de compromisos familiares para reducir el consumo eléctrico de aparatos."
        },
        {
            "id": "sis-4-4-3",
            "topic": "Seguridad informática básica: Prevención contra malware, virus y correos trampa",
            "dba": dba_sis_4,
            "achievement": "Reconoce amenazas digitales como virus y estafas en línea, aplicando medidas preventivas de navegación.",
            "suggestedSequence": "Inicio: ¿Qué es un virus informático y cómo puede dañar los archivos del computador? Desarrollo: Reglas para no abrir enlaces sospechosos ni descargar archivos desconocidos. Cierre: Exposición comunitaria en la feria digital escolar mostrando los proyectos del año."
        }
    ]

    # Replicar Grado 4° a 4°A y 4°B en todos los periodos
    for p in ["1°", "2°", "3°", "4°"]:
        all_data[p]["Sistemas"]["4°A"] = all_data[p]["Sistemas"]["4°"]
        all_data[p]["Sistemas"]["4°B"] = all_data[p]["Sistemas"]["4°"]


    # =========================================================================
    # SISTEMAS 5°
    # =========================================================================
    all_data["1°"]["Sistemas"]["5°"] = [
        {
            "id": "sis-5-1-1",
            "topic": "Estilos y formato editorial: Normas APA básicas (portada, márgenes, interlineado y sangría)",
            "dba": dba_sis_5,
            "achievement": "Aplica normas de presentación formal (APA básicas) en la elaboración de informes y trabajos académicos.",
            "suggestedSequence": "Inicio: Comparación de un trabajo escolar sin normas vs. un trabajo formal con normas APA. Desarrollo: Configuración de portada institucional, fuente legible (Times New Roman / Arial 12), interlineado y sangría de primera línea. Cierre: Redacción y maquetación de la portada y primer capítulo de una monografía escolar."
        },
        {
            "id": "sis-5-1-2",
            "topic": "Generación automática de tablas de contenido (índices) mediante niveles de título",
            "dba": dba_sis_5,
            "achievement": "Organiza documentos extensos mediante estilos de título para generar tablas de contenido automáticas.",
            "suggestedSequence": "Inicio: ¿Por qué es un error hacer un índice escribiendo puntos manualmente? Demostración en proyector. Desarrollo: Jerarquización con Título 1, Título 2 y uso del menú Referencias -> Tabla de contenido automática. Cierre: Actualización dinámica de números de página al modificar el texto de un documento."
        },
        {
            "id": "sis-5-1-3",
            "topic": "Secciones de documento, saltos de página y numeración diferenciada",
            "dba": dba_sis_5,
            "achievement": "Utiliza saltos de sección para desvincular encabezados y aplicar numeración a partir de páginas específicas.",
            "suggestedSequence": "Inicio: Problema común: cómo no numerar la portada pero sí empezar a numerar desde la introducción. Desarrollo: Inserción de saltos de sección de página siguiente y desvinculación de encabezado/pie de página. Cierre: Taller práctico entregando un documento con páginas preliminares sin número e inicio numerado."
        }
    ]

    all_data["2°"]["Sistemas"]["5°"] = [
        {
            "id": "sis-5-2-1",
            "topic": "Introducción a Excel: Filas, columnas, celdas y tipos de datos (texto, número, fecha)",
            "dba": dba_sis_5,
            "achievement": "Reconoce la estructura de la hoja de cálculo y manipula datos alfanuméricos en celdas organizadas.",
            "suggestedSequence": "Inicio: Presentación de una cuadrícula gigante: concepto de coordenada (columna letra, fila número). Desarrollo: Ingreso y formateo de datos: moneda, porcentaje, fecha corta y texto; autoajuste de columnas. Cierre: Creación de una lista de compras con descripción, cantidad y valor unitario."
        },
        {
            "id": "sis-5-2-2",
            "topic": "Operaciones aritméticas básicas en celdas (+, -, *, /) y estructura de fórmulas",
            "dba": dba_sis_5,
            "achievement": "Construye fórmulas matemáticas directas utilizando el signo igual (=) y operadores aritméticos elementales.",
            "suggestedSequence": "Inicio: El signo '=' como activador de cálculo en la hoja de cálculo. Desarrollo: Fórmulas de multiplicación (precio * cantidad) y cálculo de totales y vueltas. Cierre: Taller de cálculo automatizado de una factura comercial escolar."
        },
        {
            "id": "sis-5-2-3",
            "topic": "Funciones estadísticas elementales: SUMA, PROMEDIO, MAX y MIN, y gráficos",
            "dba": dba_sis_5,
            "achievement": "Aplica funciones automáticas para analizar conjuntos de datos numéricos y genera gráficos estadísticos vinculados.",
            "suggestedSequence": "Inicio: Calcular el promedio de notas de 10 estudiantes manualmente vs. con la función PROMEDIO. Desarrollo: Uso del asistente de funciones para SUMA, PROMEDIO, MAX y MIN, e inserción de gráficos de columnas. Cierre: Informe analítico interpretando las notas más altas, más bajas y el promedio grupal."
        }
    ]

    all_data["3°"]["Sistemas"]["5°"] = [
        {
            "id": "sis-5-3-1",
            "topic": "Variables y listas en programación por bloques: Acumuladores y contadores",
            "dba": dba_sis_5,
            "achievement": "Utiliza variables y listas para almacenar y procesar datos dinámicos en algoritmos de Scratch.",
            "suggestedSequence": "Inicio: ¿Cómo guarda un programa el nombre del jugador o el inventario de objetos en un juego? Desarrollo: Creación de listas de elementos y manipulación con bloques de añadir, eliminar y consultar longitud. Cierre: Programación de un juego de preguntas y respuestas que registra el nombre y puntaje acumulado."
        },
        {
            "id": "sis-5-3-2",
            "topic": "Operadores matemáticos y lógicos (Y, O, NO, >, <, =) en algoritmos",
            "dba": dba_sis_5,
            "achievement": "Construye condiciones compuestas utilizando operadores booleanos y comparadores en la toma de decisiones.",
            "suggestedSequence": "Inicio: Ejemplos de condiciones dobles: 'Si tienes más de 10 años Y tienes el boleto, puedes entrar'. Desarrollo: Uso de operadores verdes en Scratch combinando comparaciones (<, >, =) con operadores lógicos. Cierre: Creación de un algoritmo de validación de contraseña con múltiples requisitos."
        },
        {
            "id": "sis-5-3-3",
            "topic": "Mensajes entre personajes y sincronización de escenas interactivas",
            "dba": dba_sis_5,
            "achievement": "Sincroniza acciones y cambios de escenario mediante el envío y recepción de mensajes de difusión.",
            "suggestedSequence": "Inicio: Metáfora de una obra de teatro: un actor entra cuando otro le da el pie (mensaje). Desarrollo: Uso de bloques 'enviar mensaje [evento]' y 'al recibir [evento]' para coordinar diálogos y fondos. Cierre: Proyecto de animación de una fábula con dos personajes dialogando en diferentes escenarios."
        }
    ]

    all_data["4°"]["Sistemas"]["5°"] = [
        {
            "id": "sis-5-4-1",
            "topic": "Ciberacoso (ciberbullying y grooming): Identificación, prevención y rutas de reporte",
            "dba": dba_sis_5,
            "achievement": "Reconoce situaciones de agresión o manipulación en redes sociales y aplica protocolos escolares de denuncia.",
            "suggestedSequence": "Inicio: Video reflexivo sobre el impacto emocional de las burlas en grupos de mensajería (WhatsApp). Desarrollo: Identificación de señales de alerta de ciberacoso y canales de ayuda (Te Protejo / orientación escolar). Cierre: Redacción grupal de un manifiesto de convivencia pacífica en los grupos digitales de clase."
        },
        {
            "id": "sis-5-4-2",
            "topic": "Protección de la identidad digital y pensamiento crítico frente a noticias falsas (fake news)",
            "dba": dba_sis_5,
            "achievement": "Evalúa críticamente la información en internet contrastando fuentes y protegiendo su reputación digital.",
            "suggestedSequence": "Inicio: Análisis de una noticia viral falsa para descubrir por qué la gente la creyó y compartió. Desarrollo: Criterios para verificar noticias: autor, fecha, dominio web y fuentes oficiales. Cierre: Taller 'cazadores de noticias falsas' analizando publicaciones de internet."
        },
        {
            "id": "sis-5-4-3",
            "topic": "Trabajo colaborativo en la nube: Documentos compartidos y cierre anual",
            "dba": dba_sis_5,
            "achievement": "Colabora en tiempo real en la edición de documentos en la nube respetando el trabajo de sus compañeros.",
            "suggestedSequence": "Inicio: Creación de un documento colaborativo en Google Drive compartido con todo el grupo. Desarrollo: Edición simultánea de párrafos, asignación de comentarios y revisión de historial de versiones. Cierre: Consolidación del portafolio digital anual con los mejores trabajos de cada periodo."
        }
    ]

    # =========================================================================
    # SISTEMAS 6°
    # =========================================================================
    all_data["1°"]["Sistemas"]["6°"] = [
        {
            "id": "sis-6-1-1",
            "topic": "Arquitectura de hardware: Componentes internos del computador (procesador, tarjeta madre, memoria RAM)",
            "dba": dba_sis_6,
            "achievement": "Identifica los componentes internos de la CPU describiendo la función de la placa base, procesador, memoria RAM y disco.",
            "suggestedSequence": "Inicio: Desarme pedagógico de una torre de computador para observar los componentes físicos. Desarrollo: Funciones de la tarjeta madre, zócalo del procesador, módulos de memoria RAM, fuente y discos duros. Cierre: Diagrama esquemático rotulado identificando los componentes internos y su interconexión."
        },
        {
            "id": "sis-6-1-2",
            "topic": "Software de sistema vs. software de aplicación y licenciamiento (libre vs. privativo)",
            "dba": dba_sis_6,
            "achievement": "Diferencia sistemas operativos de programas de aplicación y comprende conceptos de licencias y software libre.",
            "suggestedSequence": "Inicio: Comparación entre Windows, Linux, Android e iOS: ¿Por qué son sistemas operativos? Desarrollo: Clasificación de software (sistema, desarrollo, aplicación) y tipos de licencia (Creative Commons, GNU, comercial). Cierre: Cuadro comparativo analizando ventajas del software libre frente al software privativo."
        },
        {
            "id": "sis-6-1-3",
            "topic": "Administración del sistema operativo Windows: Cuentas, compresión de archivos y copias de seguridad",
            "dba": dba_sis_6,
            "achievement": "Administra archivos y carpetas eficientemente utilizando herramientas de compresión (ZIP), respaldo y configuración básica.",
            "suggestedSequence": "Inicio: ¿Qué hacer cuando un archivo es demasiado pesado para enviarse por correo? Desarrollo: Uso de utilidades de compresión ZIP/RAR, creación de puntos de restauración y copias de respaldo. Cierre: Taller práctico de organización de carpetas, compresión y verificación de espacio en disco."
        }
    ]

    all_data["2°"]["Sistemas"]["6°"] = [
        {
            "id": "sis-6-2-1",
            "topic": "Hojas de cálculo avanzadas: Fórmulas con referencias relativas, absolutas ($A$1) y mixtas",
            "dba": dba_sis_6,
            "achievement": "Utiliza referencias absolutas y relativas en Excel para automatizar cálculos repetitivos sin errores de arrastre.",
            "suggestedSequence": "Inicio: Demostración de qué pasa al arrastrar una fórmula si no se fija la celda del IVA o tasa de cambio. Desarrollo: Uso del símbolo '$' para bloquear filas y columnas ($B$1) y aplicación en tablas de conversión monetaria. Cierre: Taller de cálculo de precios con descuentos fijos utilizando referencias absolutas."
        },
        {
            "id": "sis-6-2-2",
            "topic": "Funciones lógicas: Función SI sencilla y anidada para evaluación de criterios",
            "dba": dba_sis_6,
            "achievement": "Aplica la función condicional SI para emitir resultados automáticos según se cumplan condiciones numéricas o de texto.",
            "suggestedSequence": "Inicio: Lógica escolar: Si nota >= 3.0 entonces 'Aprobó', sino 'Reprobó'. Desarrollo: Estructura de la función =SI(prueba_lógica; valor_si_verdadero; valor_si_falso) y anidamientos. Cierre: Elaboración de un boletín de calificaciones automatizado con mensajes de aprobación y nivelación."
        },
        {
            "id": "sis-6-2-3",
            "topic": "Funciones de conteo condicional: CONTAR.SI y SUMAR.SI en presupuestos escolares",
            "dba": dba_sis_6,
            "achievement": "Procesa bases de datos escolares aplicando filtros automáticos y funciones condicionales de resumen.",
            "suggestedSequence": "Inicio: Contar cuántos estudiantes sacaron más de 4.0 en una lista de 50 alumnos sin hacerlo a mano. Desarrollo: Sintaxis y aplicación de CONTAR.SI(rango; criterio) y SUMAR.SI(rango; criterio; rango_suma). Cierre: Modelo de presupuesto para un evento escolar con subtotales por categoría de gasto."
        }
    ]

    all_data["3°"]["Sistemas"]["6°"] = [
        {
            "id": "sis-6-3-1",
            "topic": "Principios del diseño gráfico digital: Teoría del color, tipografía y composición visual",
            "dba": dba_sis_6,
            "achievement": "Aplica principios de contraste, jerarquía visual y psicología del color en la creación de piezas gráficas.",
            "suggestedSequence": "Inicio: Análisis de afiches publicitarios profesionales: qué colores llaman la atención y qué fuentes son legibles. Desarrollo: Círculo cromático, colores complementarios, fuentes sans-serif vs. serif y retículas de composición. Cierre: Diseño de un póster publicitario o banner escolar aplicando Canva o software gráfico."
        },
        {
            "id": "sis-6-3-2",
            "topic": "Edición de audio digital con Audacity: Grabación de voz, efectos y mezcla de pistas",
            "dba": dba_sis_6,
            "achievement": "Graba y edita pistas de audio digital aplicando recortes, normalización, reducción de ruido y música de fondo.",
            "suggestedSequence": "Inicio: Escucha de un podcast profesional identificando la locución limpia y la música de fondo. Desarrollo: Grabación de locución en Audacity, eliminación de ruido de fondo, fade in / fade out y exportación a MP3. Cierre: Producción en parejas de una cápsula radial escolar de 2 minutos sobre un tema pedagógico."
        },
        {
            "id": "sis-6-3-3",
            "topic": "Montaje y edición de video con Clipchamp / CapCut: Línea de tiempo, transiciones y títulos",
            "dba": dba_sis_6,
            "achievement": "Produce piezas audiovisuales cortas integrando clips de video, audios, títulos animados y transiciones.",
            "suggestedSequence": "Inicio: Concepto de guión técnico y línea de tiempo (timeline) en la producción audiovisual. Desarrollo: Importación de clips, corte de secuencias innecesarias, inserción de títulos y renderizado final. Cierre: Proyección y retroalimentación colectiva de los videos educativos creados."
        }
    ]

    all_data["4°"]["Sistemas"]["6°"] = [
        {
            "id": "sis-6-4-1",
            "topic": "Introducción a la robótica y la automatización: Máquinas automáticas vs. robots",
            "dba": dba_sis_6,
            "achievement": "Diferencia una máquina automática de un robot reconociendo las tres etapas: sensórica, procesamiento y actuación.",
            "suggestedSequence": "Inicio: Debate: ¿Una lavadora o una puerta de centro comercial es un robot? ¿Qué define a un robot? Desarrollo: Estructura básica de un sistema automatizado: entrada (sensores), proceso (cerebro/micro) y salida (motores/luces). Cierre: Elaboración de un mapa conceptual diferenciando mecanismos, automatismos y robots."
        },
        {
            "id": "sis-6-4-2",
            "topic": "Simulación de circuitos eléctricos y robóticos en Tinkercad Circuits",
            "dba": dba_sis_6,
            "achievement": "Diseña y simula circuitos eléctricos básicos con fuentes de energía, resistencias e interruptores en entornos virtuales.",
            "suggestedSequence": "Inicio: Riesgos de cortocircuito y por qué es seguro simular antes de conectar físicamente. Desarrollo: Conexión virtual de una batería de 9V, una resistencia limitadora y un LED en la protoboard de Tinkercad. Cierre: Simulación exitosa del encendido de luces y verificación de la ley de Ohm elemental."
        },
        {
            "id": "sis-6-4-3",
            "topic": "Sensores básicos (fotoresistencia LDR, pulsadores) y actuadores en sistemas automáticos",
            "dba": dba_sis_6,
            "achievement": "Integra sensores de luz y pulsadores para activar automáticamente luces o alarmas sonoras en simulaciones.",
            "suggestedSequence": "Inicio: ¿Cómo se prenden solas las luces del alumbrado público cuando oscurece? Desarrollo: Conexión de un sensor de luz LDR (resistencia dependiente de la luz) para encender un foco cuando hay sombra. Cierre: Presentación del proyecto de alumbrado público automatizado simulado."
        }
    ]

    # =========================================================================
    # SISTEMAS 7°
    # =========================================================================
    all_data["1°"]["Sistemas"]["7°"] = [
        {
            "id": "sis-7-1-1",
            "topic": "Procesadores de texto: Aplicación de estilos, tablas y diseño editorial básico",
            "dba": dba_sis_7,
            "achievement": "Gestiona documentos complejos con estilos definidos, para comunicar información con claridad y presentación profesional.",
            "suggestedSequence": "Inicio: Análisis de un artículo de revista digital identificando columnas, capitulares y tipografía editorial. Desarrollo: Configuración avanzada de formatos de párrafo, sangrías francesas, tablas con estilos personalizados y saltos. Cierre: Creación de una página de revista editorial aplicando criterios visuales profesionales."
        },
        {
            "id": "sis-7-1-2",
            "topic": "Normas de presentación y formato digital institucional",
            "dba": dba_sis_7,
            "achievement": "Aplica rigurosamente las pautas de formato institucional en la entrega de reportes e investigaciones escolares.",
            "suggestedSequence": "Inicio: Revisión del manual de estilo institucional del Colegio Hogar Madre de Dios. Desarrollo: Ajuste de márgenes, encabezados con membrete institucional, pie de página y citas bibliográficas. Cierre: Entrega formal de un informe maquetado conforme al estándar institucional."
        },
        {
            "id": "sis-7-1-3",
            "topic": "Hojas de cálculo: Uso de fórmulas avanzadas y gráficos estadísticos explicativos",
            "dba": dba_sis_7,
            "achievement": "Automatiza cálculos mediante funciones avanzadas, para analizar datos y tomar decisiones informadas en contextos académicos.",
            "suggestedSequence": "Inicio: Análisis de un conjunto masivo de datos de asistencia y rendimiento escolar. Desarrollo: Fórmulas estadísticas, porcentajes automáticos y generación de gráficos dinámicos con etiquetas de datos. Cierre: Presentación ejecutiva de conclusiones numéricas apoyada en los gráficos elaborados."
        },
        {
            "id": "sis-7-1-4",
            "topic": "Presentaciones interactivas: Integración de elementos multimedia, animaciones y diseño coherente",
            "dba": dba_sis_7,
            "achievement": "Crea presentaciones digitales interactivas, para expresar ideas de forma visual y atractiva que capte la atención del público.",
            "suggestedSequence": "Inicio: Comparación entre diapositivas estáticas vs. presentaciones con botones interactivos e hipervínculos. Desarrollo: Uso de botones de acción, menús de navegación no lineal e incrustación de videos y animaciones. Cierre: Demostración interactiva navegando por la presentación ante los compañeros."
        },
        {
            "id": "sis-7-1-5",
            "topic": "Creación y edición de contenido digital: Grabación y producción de video con criterios técnicos",
            "dba": dba_sis_7,
            "achievement": "Edita y graba videos con criterios técnicos y narrativos, para producir materiales audiovisuales que comuniquen proyectos con impacto.",
            "suggestedSequence": "Inicio: Pautas básicas de encuadre (regla de los tercios), iluminación frontal y captura de audio nítido. Desarrollo: Grabación de una cápsula informativa y edición en software (Clipchamp / CapCut) con transiciones y música libre. Cierre: Publicación en el canal educativo del aula y evaluación formativa con rúbrica audiovisual."
        }
    ]

    all_data["2°"]["Sistemas"]["7°"] = [
        {
            "id": "sis-7-2-1",
            "topic": "Programación estructurada en Scratch: Variables dinámicas, acumuladores y listas",
            "dba": dba_sis_7,
            "achievement": "Aplica estructuras de datos (listas y variables dinámicas) para almacenar y gestionar información en algoritmos complejos.",
            "suggestedSequence": "Inicio: Cómo almacenar múltiples puntuaciones o nombres de inventario en un programa sin crear decenas de variables. Desarrollo: Creación y manipulación de listas en Scratch: inserción, búsqueda de elementos y recorrido con bucles. Cierre: Programación de un sistema de registro de usuarios y puntuaciones máximas."
        },
        {
            "id": "sis-7-2-2",
            "topic": "Condicionales múltiples y anidados en algoritmos interactivos",
            "dba": dba_sis_7,
            "achievement": "Estructura árboles de decisión mediante condicionales anidados (si... si no...) evaluando múltiples escenarios.",
            "suggestedSequence": "Inicio: Ejercicio de diagramación de decisiones complejas en un mapa de flujo. Desarrollo: Programación de condicionales anidados en Scratch para responder a diferentes niveles de dificultad en un juego. Cierre: Prueba y depuración de la lógica de toma de decisiones en diferentes casos extremos."
        },
        {
            "id": "sis-7-2-3",
            "topic": "Modularidad y funciones: Creación de bloques personalizados reutilizables",
            "dba": dba_sis_7,
            "achievement": "Diseña bloques personalizados (funciones con parámetros) para simplificar el código y promover la reutilización.",
            "suggestedSequence": "Inicio: Principio DRY (Don't Repeat Yourself): por qué no debemos duplicar el mismo bloque de código. Desarrollo: Creación de bloques propios en Scratch con entradas numéricas (ej. dibujar_poligono(lados, longitud)). Cierre: Taller de refactorización de código largo reemplazándolo por funciones modulares."
        },
        {
            "id": "sis-7-2-4",
            "topic": "Física en videojuegos: Simulación de gravedad, saltos, velocidad y rozamiento",
            "dba": dba_sis_7,
            "achievement": "Modela principios físicos elementales (gravedad, fricción y rebote) en videojuegos de plataformas.",
            "suggestedSequence": "Inicio: ¿Cómo sabe Mario Bros cuándo caer y con qué velocidad aterriza en el suelo? Desarrollo: Algoritmo de velocidad en Y, aceleración de gravedad (-1) y detección del suelo para simular saltos realistas. Cierre: Proyecto de videojuego de plataformas funcional con física de salto y obstáculos."
        }
    ]

    all_data["3°"]["Sistemas"]["7°"] = [
        {
            "id": "sis-7-3-1",
            "topic": "Fundamentos de electricidad y electrónica: Voltaje, corriente, resistencia y ley de Ohm",
            "dba": dba_sis_7,
            "achievement": "Calcula magnitudes eléctricas básicas aplicando la ley de Ohm (V = I * R) y reconoce su aplicación en circuitos.",
            "suggestedSequence": "Inicio: Analogía hidráulica: el voltaje como presión de agua, la corriente como caudal y la resistencia como estrechamiento. Desarrollo: Fórmulas de la ley de Ohm y cálculo del resistor adecuado para no quemar un diodo LED. Cierre: Resolución de problemas numéricos de circuitos simples y verificación con multímetro virtual."
        },
        {
            "id": "sis-7-3-2",
            "topic": "Introducción a placas controladoras programables: Arquitectura de Arduino / micro:bit",
            "dba": dba_sis_7,
            "achievement": "Identifica los pines digitales, analógicos y de alimentación en placas microcontroladoras programables.",
            "suggestedSequence": "Inicio: El microcontrolador como cerebro programable que conecta el mundo digital con el mundo real. Desarrollo: Entorno de programación por bloques y texto; estructura de un programa: configuración inicial (setup) y bucle infinito (loop). Cierre: Conexión y programación de un parpadeo de LED (Blink) modificando tiempos de retardo."
        },
        {
            "id": "sis-7-3-3",
            "topic": "Control de actuadores: Servomotores, motores DC y zumbadores (buzzers)",
            "dba": dba_sis_7,
            "achievement": "Programa actuadores electromecánicos para generar movimientos angulares precisos y alertas sonoras.",
            "suggestedSequence": "Inicio: ¿Cómo se mueve el timón de un barco o la barrera de un estacionamiento? Introducción al servomotor. Desarrollo: Control angular de servomotores (0° a 180°) y modulación PWM para variar tonos en un buzzer. Cierre: Montaje y programación de una talanquera automática que pita y se levanta al presionar un botón."
        },
        {
            "id": "sis-7-3-4",
            "topic": "Integración de sensores de luz, temperatura y distancia ultrasónica (HC-SR04)",
            "dba": dba_sis_7,
            "achievement": "Lee e interpreta datos de sensores ultrasónicos y de luz para programar respuestas automáticas del sistema.",
            "suggestedSequence": "Inicio: Principio de ecolocalización de los murciélagos para entender el sensor ultrasónico HC-SR04. Desarrollo: Cálculo de distancia por tiempo de eco (d = v * t / 2) y programación de umbrales de proximidad. Cierre: Prototipo de sensor de reversa vehicular con advertencia de luz y sonido según la cercanía."
        }
    ]

    all_data["4°"]["Sistemas"]["7°"] = [
        {
            "id": "sis-7-4-1",
            "topic": "Metodología de diseño de proyectos tecnológicos (Design Thinking) y modelado 3D",
            "dba": dba_sis_7,
            "achievement": "Aplica fases de empatía, definición, ideación y prototipado 3D en Tinkercad para resolver problemas reales.",
            "suggestedSequence": "Inicio: Detección de una necesidad en el colegio (ej. dispensador de alcohol o control de entrada). Desarrollo: Modelado 3D de la carcasa o soporte del proyecto en Tinkercad combinando formas sólidas y huecas. Cierre: Exportación de archivos STL listos para impresión 3D o fabricación digital."
        },
        {
            "id": "sis-7-4-2",
            "topic": "Ensamble e integración de un sistema domótico escolar automatizado",
            "dba": dba_sis_7,
            "achievement": "Integra hardware, sensórica y código en un prototipo funcional que responde a estímulos del entorno.",
            "suggestedSequence": "Inicio: Definición del diagrama de conexiones eléctricas y asignación de pines del proyecto. Desarrollo: Ensamble del circuito en protoboard, carga del programa en el microcontrolador y pruebas de campo. Cierre: Depuración de fallas mecánicas y electrónicas optimizando la respuesta del sistema."
        },
        {
            "id": "sis-7-4-3",
            "topic": "Documentación técnica, bitácora de ingeniería y sustentación pública",
            "dba": dba_sis_7,
            "achievement": "Elabora la memoria técnica del proyecto y sustenta con claridad su funcionamiento y aporte comunitario.",
            "suggestedSequence": "Inicio: Pautas para la redacción de la bitácora técnica: objetivos, lista de materiales, costos y diagrama esquemático. Desarrollo: Preparación de la presentación final y del póster científico para la feria tecnológica. Cierre: Sustentación pública y evaluación formativa mediante rúbrica de innovación y funcionalidad."
        }
    ]

    # =========================================================================
    # SISTEMAS 8°
    # =========================================================================
    all_data["1°"]["Sistemas"]["8°"] = [
        {
            "id": "sis-8-1-1",
            "topic": "Historia y evolución de las redes de comunicación: De ARPANET a las redes 5G y fibra óptica",
            "dba": dba_sis_8,
            "achievement": "Analiza la evolución de las redes de transmisión de datos reconociendo el impacto social de la conectividad global.",
            "suggestedSequence": "Inicio: ¿Qué ocurrió en 1969 con el primer mensaje enviado entre dos computadores a kilómetros de distancia? Desarrollo: Evolución de las telecomunicaciones, conmutación de paquetes, cableado submarino y redes móviles. Cierre: Línea de tiempo interactiva ilustrando los saltos tecnológicos en conectividad."
        },
        {
            "id": "sis-8-1-2",
            "topic": "Modelos de redes, topologías (estrella, malla, bus) y direccionamiento IP / DNS",
            "dba": dba_sis_8,
            "achievement": "Comprende la estructura de las redes informáticas, identificando topologías físicas y la función del protocolo IP.",
            "suggestedSequence": "Inicio: Analogía postal: la dirección de tu casa como dirección IP y la guía telefónica como servidor DNS. Desarrollo: Topologías de red (estrella, bus, anillo, malla) y funcionamiento de direcciones IPv4 y máscaras de subred. Cierre: Simulación de una red en Cisco Packet Tracer conectando terminales a un switch."
        },
        {
            "id": "sis-8-1-3",
            "topic": "Dispositivos de red (routers, switches, módems) y seguridad inalámbrica Wi-Fi",
            "dba": dba_sis_8,
            "achievement": "Configura parámetros básicos de seguridad en redes Wi-Fi (WPA2/WPA3) y comprende el rol de cada equipo.",
            "suggestedSequence": "Inicio: ¿Por qué no debemos conectarnos a redes Wi-Fi públicas abiertas sin protección? Desarrollo: Diferencias funcionales entre módem, router y switch; protocolos de cifrado y filtrado MAC. Cierre: Práctica guiada verificando la configuración de red y pruebas de conectividad (ping y traceroute)."
        }
    ]

    all_data["2°"]["Sistemas"]["8°"] = [
        {
            "id": "sis-8-2-1",
            "topic": "Fundamentos del desarrollo web: Arquitectura cliente-servidor y estructura básica de HTML5",
            "dba": dba_sis_8,
            "achievement": "Comprende el modelo web cliente-servidor y escribe la estructura semántica fundamental de una página en HTML5.",
            "suggestedSequence": "Inicio: Inspeccionar el código fuente de una página web en el navegador: 'detrás de la pantalla'. Desarrollo: Etiquetas estructurales obligatorias: <!DOCTYPE html>, <html>, <head>, <title>, <body>, encabezados y párrafos. Cierre: Creación de la primera página web personal 'index.html' visualizada en el navegador local."
        },
        {
            "id": "sis-8-2-2",
            "topic": "Maquetación y estilo con CSS3: Selectores, colores, tipografías y el modelo de caja",
            "dba": dba_sis_8,
            "achievement": "Aplica hojas de estilo en cascada (CSS) para dar diseño visual, armonía y estructura espacial a la página web.",
            "suggestedSequence": "Inicio: Comparación entre un HTML sin estilos vs. un sitio maquetado con CSS3 profesional. Desarrollo: Selectores de etiqueta, clase e ID; propiedades de color, fuentes, márgenes (margin), relleno (padding) y bordes. Cierre: Vinculación del archivo 'styles.css' a la página web mejorando su estética visual."
        },
        {
            "id": "sis-8-2-3",
            "topic": "Enlaces, imágenes, tablas y diseño web responsivo (Responsive Design)",
            "dba": dba_sis_8,
            "achievement": "Integra elementos multimedia, navegación entre páginas e implementa diseño adaptable a pantallas móviles.",
            "suggestedSequence": "Inicio: Demostración de cómo se deforma un sitio no adaptable cuando se abre en un celular. Desarrollo: Uso de enlaces (<a href>), imágenes (<img src>), contenedores flexibles (Flexbox) y reglas @media. Cierre: Publicación del sitio web escolar completo en una plataforma gratuita (GitHub Pages)."
        }
    ]

    all_data["3°"]["Sistemas"]["8°"] = [
        {
            "id": "sis-8-3-1",
            "topic": "Introducción a la programación textual en Python: Sintaxis, variables y tipos de datos",
            "dba": dba_sis_8,
            "achievement": "Escribe programas estructurados en Python utilizando variables tipadas, operadores y funciones de entrada/salida.",
            "suggestedSequence": "Inicio: Transición del código en bloques de Scratch al código textual en Python: ventajas y legibilidad. Desarrollo: Instalación de entorno (Thonny / VS Code), tipos de datos (int, float, str, bool), print() e input(). Cierre: Programa interactivo que solicita datos al usuario, realiza cálculos y muestra el resultado formateado."
        },
        {
            "id": "sis-8-3-2",
            "topic": "Estructuras condicionales en Python (if, elif, else) aplicadas a la toma de decisiones",
            "dba": dba_sis_8,
            "achievement": "Implementa bifurcaciones lógicas complejas con if-elif-else respetando la indentación obligatoria de Python.",
            "suggestedSequence": "Inicio: La importancia de la indentación (sangría) en Python como delimitador de bloques de código. Desarrollo: Operadores relacionales y lógicos (and, or, not) evaluando condiciones múltiples en situaciones reales. Cierre: Algoritmo de clasificación de notas académicas y recomendaciones personalizadas."
        },
        {
            "id": "sis-8-3-3",
            "topic": "Estructuras cíclicas (bucles while y for) y procesamiento de listas de datos",
            "dba": dba_sis_8,
            "achievement": "Automatiza tareas repetitivas mediante ciclos while y bucles for con la función range() y listas.",
            "suggestedSequence": "Inicio: ¿Cómo imprimir los números del 1 al 1000 en 3 líneas de código? Introducción a los bucles. Desarrollo: Sintaxis de for i in range(inicio, fin, paso) y bucle while con condición de parada para evitar ciclos infinitos. Cierre: Programa que calcula la media y varianza de una lista de datos numéricos ingresados por el usuario."
        }
    ]

    all_data["4°"]["Sistemas"]["8°"] = [
        {
            "id": "sis-8-4-1",
            "topic": "Mecanismos de transmisión de movimiento: Engranajes, poleas, correas, levas y bielas",
            "dba": dba_sis_8,
            "achievement": "Calcula relaciones de transmisión mecánica en trenes de engranajes y poleas analizando velocidad y fuerza.",
            "suggestedSequence": "Inicio: Análisis de los cambios de una bicicleta: ¿Por qué en subida ponemos el piñón más grande? Desarrollo: Ley de palancas, cálculo de relación de transmisión (i = N1/N2 = w2/w1) y tipos de engranajes (rectos, cónicos). Cierre: Ensamble y prueba de un mecanismo reductor de velocidad con maquetas de engranajes."
        },
        {
            "id": "sis-8-4-2",
            "topic": "Sistemas mecatrónicos y automatización de potencia mediante relevadores (relés)",
            "dba": dba_sis_8,
            "achievement": "Comprende el funcionamiento del relé electromecánico para controlar cargas eléctricas de alta potencia de forma segura.",
            "suggestedSequence": "Inicio: ¿Cómo un circuito de 5V en una computadora puede encender un motor de 110V sin quemarse? Desarrollo: Principio del electroimán y contactos normalmente abierto (NA) y cerrado (NC) en módulos de relé. Cierre: Simulación y conexión de un sistema de encendido automático de electrodomésticos."
        },
        {
            "id": "sis-8-4-3",
            "topic": "Ciberseguridad avanzada y protección contra amenazas digitales en la sociedad actual",
            "dba": dba_sis_8,
            "achievement": "Evalúa riesgos de ciberseguridad industrial y personal, adoptando protocolos de autenticación y respaldo seguro.",
            "suggestedSequence": "Inicio: Casos reales de ataques de Ransomware y suplantación de identidad en empresas e instituciones. Desarrollo: Principios de criptografía simétrica y asimétrica, autenticación en dos factores (2FA) y gestión de contraseñas. Cierre: Proyecto final de síntesis tecnológica y balance de competencias del grado octavo."
        }
    ]

    print("Sistemas 1° a 8° fully populated.")


