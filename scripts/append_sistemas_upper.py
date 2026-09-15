# -*- coding: utf-8 -*-
"""
Helper to append Sistemas 5°, 6°, 7°, 8° to build_sistemas_data.py
"""

upper_sistemas_code = '''
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
'''

with open('scripts/build_sistemas_data.py', 'r', encoding='utf-8') as f:
    current = f.read()

# Replace the end print with upper grades then print
replacement = upper_sistemas_code + '\n    print("Sistemas 1° a 8° fully populated.")\n'
new_content = current.replace('    print("Sistemas 1° a 4° populated.")', replacement)

with open('scripts/build_sistemas_data.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Upper sistemas appended successfully.")
