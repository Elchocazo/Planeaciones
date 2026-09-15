# -*- coding: utf-8 -*-
"""
Module defining Robótica (9°, 10°, 11°) and Dirección de Grupo (7°) for all 4 periods.
Source: Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf
Colegio Hogar Madre de Dios - Docente: Manuel Muñoz
"""

dba_rob_9 = (
    "• Reconoce la robótica como disciplina interdisciplinaria que integra mecánica, electrónica y programación.\n"
    "• Explica el funcionamiento de los sistemas de control para comprender la interacción entre hardware y software.\n"
    "• Diseña y construye prototipos robóticos móviles aplicando criterios de estabilidad estructural, tracción y navegación autónoma.\n"
    "• Integra sensores y actuadores en sistemas mecatrónicos programando respuestas reactivas en tiempo real."
)

dba_rob_10 = (
    "• Diseñar, construir y programar prototipos robóticos y sistemas automáticos que resuelvan problemas del entorno escolar o comunitario.\n"
    "• Aplica conceptos de cinemática directa e inversa en el dimensionamiento y control angular de brazos robóticos articulados.\n"
    "• Desarrolla interfaces de control manual y telemétrico inalámbrico (Bluetooth, Wi-Fi, WebSockets) para operar robots a distancia.\n"
    "• Implementa soluciones de automatización basadas en Internet de las Cosas (IoT) y visión artificial básica."
)

dba_rob_11 = (
    "• Diseñar, construir y programar prototipos robóticos avanzados aplicando metodologías formales de ingeniería mecatrónica.\n"
    "• Aplica algoritmos de control en lazo cerrado (control proporcional, integral y derivativo - PID) para optimizar la respuesta dinámica de sistemas robóticos.\n"
    "• Integra sistemas ciberfísicos complejos combinando microcontroladores, computadores monoplaca (Linux/Raspberry Pi) y visión por computador.\n"
    "• Documenta rigurosamente el proceso mediante artículos científicos, memorias técnicas y patenta soluciones viables para el desarrollo social y tecnológico."
)

dba_dir_grupo = (
    "• Competencias Ciudadanas: Convivencia y Paz, Participación y Responsabilidad Democrática, Pluralidad e Identidad.\n"
    "• Reconoce que las emociones influyen en las relaciones interpersonales y aplica estrategias de autorregulación y diálogo asertivo.\n"
    "• Participa activamente en la construcción y cumplimiento de acuerdos de aula orientados al bien común y al respeto mutuo."
)

def populate_robotica(all_data):
    for p in ["1°", "2°", "3°", "4°"]:
        if "Robótica" not in all_data[p]:
            all_data[p]["Robótica"] = {}
        if "Dirección de grupo" not in all_data[p]:
            all_data[p]["Dirección de grupo"] = {}

    # =========================================================================
    # ROBÓTICA 9°
    # =========================================================================
    all_data["1°"]["Robótica"]["9°"] = [
        {
            "id": "rob-9-1-1",
            "topic": "Fundamentos y clasificación de la robótica: De autómatas históricos a robots autónomos",
            "dba": dba_rob_9,
            "achievement": "Clasifica sistemas robóticos según su morfología (móviles, brazos manipuladores, androides) e identifica su campo de aplicación.",
            "suggestedSequence": "Inicio: Evolución histórica desde los autómatas de reloj hasta los robots de exploración espacial (Perseverance). Desarrollo: Clasificación taxonómica: grados de libertad (DOF), tipo de locomoción (ruedas, orugas, patas) y entorno de operación. Cierre: Elaboración de un cuadro comparativo seleccionando el tipo de robot más idóneo para un rescate."
        },
        {
            "id": "rob-9-1-2",
            "topic": "Cinemática y estática de robots móviles: Centro de gravedad, balance y estabilidad estructural",
            "dba": dba_rob_9,
            "achievement": "Calcula la posición del centro de masa de una estructura robótica móvil para asegurar estabilidad y evitar volcamientos.",
            "suggestedSequence": "Inicio: ¿Por qué los autos de carreras y los robots de combate son bajos y anchos? Análisis del centro de gravedad. Desarrollo: Principios de palanca, momento de inercia y distribución de peso de baterías y motores en el chasis. Cierre: Práctica experimental inclinando maquetas sobre rampas para medir el ángulo crítico de vuelco."
        },
        {
            "id": "rob-9-1-3",
            "topic": "Transmisión mecánica en robótica: Cálculo de relación de transmisión (i), torque y velocidad",
            "dba": dba_rob_9,
            "achievement": "Determina las relaciones de reducción mecánica en trenes de engranajes optimizando el compromiso entre fuerza y rapidez.",
            "suggestedSequence": "Inicio: Desarme de un servomotor o motorreductor amarillo para observar su tren interno de piñones. Desarrollo: Fórmula de relación de transmisión (i = Z2/Z1) y cálculo del torque resultante en el eje motriz. Cierre: Taller de cálculo de relaciones mecánicas para trepar rampas de 30 grados sin que el motor se detenga."
        },
        {
            "id": "rob-9-1-4",
            "topic": "Ensamble electromecánico de chasis robótico diferencial y pruebas de rodamiento",
            "dba": dba_rob_9,
            "achievement": "Ensambla la estructura mecánica de un robot de tracción diferencial verificando alineación de ejes y balance de masa.",
            "suggestedSequence": "Inicio: Pautas de seguridad en el uso de destornilladores, tornillería métrica y herramientas de corte. Desarrollo: Montaje de motores DC con reductores, rueda loca de apoyo (caster wheel) y portabaterías en el chasis. Cierre: Prueba de desplazamiento en línea recta sin derivas causadas por desalineación mecánica."
        }
    ]

    all_data["2°"]["Robótica"]["9°"] = [
        {
            "id": "rob-9-2-1",
            "topic": "Sensores para robótica móvil: Sensores infrarrojos reflectivos (CNY70 / TCRT5000) y acondicionamiento",
            "dba": dba_rob_9,
            "achievement": "Calibra sensores ópticos infrarrojos para distinguir superficies blancas y negras en pistas de prueba.",
            "suggestedSequence": "Inicio: Principio de absorción y reflexión de la luz infrarroja según el color de la superficie. Desarrollo: Conexión de sensores de línea con amplificadores operacionales en modo comparador (LM393) y ajuste de potenciómetro. Cierre: Prueba de lectura digital en el monitor serie verificando cambios de 0 a 1 al pasar sobre cinta negra."
        },
        {
            "id": "rob-9-2-2",
            "topic": "Control de potencia de motores DC: Drivers de potencia puente H (L298N / TB6612FNG) y modulación PWM",
            "dba": dba_rob_9,
            "achievement": "Controla el sentido de giro y la velocidad de motores de corriente continua mediante señales de modulación PWM.",
            "suggestedSequence": "Inicio: ¿Por qué no se puede conectar un motor directamente al microcontrolador? Límite de corriente de pines. Desarrollo: Diagrama de funcionamiento del puente H con transistores MOSFET y modulación de ancho de pulso (0 a 255 en Arduino). Cierre: Montaje y prueba de aceleración progresiva y giros controlados de un robot móvil."
        },
        {
            "id": "rob-9-2-3",
            "topic": "Algoritmos de navegación reactiva: Robot seguidor de línea recta y curvas suaves",
            "dba": dba_rob_9,
            "achievement": "Programa la lógica de seguimiento de línea mediante algoritmos condicionales reactivos de corrección de trayectoria.",
            "suggestedSequence": "Inicio: Análisis lógico de casos: si sensor izquierdo negro gira izquierda; si derecho negro gira derecha; si ambos blancos avanza. Desarrollo: Programación del bucle principal de control en C++ / bloques y ajuste de velocidades de giro. Cierre: Pruebas en pista cerrada de 2 metros cronometrando el tiempo de vuelta sin salirse."
        },
        {
            "id": "rob-9-2-4",
            "topic": "Sensor ultrasónico y evasión inteligente de obstáculos con mapeo angular",
            "dba": dba_rob_9,
            "achievement": "Integra sensores de distancia ultrasónicos para detener o redirigir el robot ante la presencia de obstáculos imprevistos.",
            "suggestedSequence": "Inicio: Montaje del sensor ultrasónico HC-SR04 sobre un miniservo para escanear a la izquierda y derecha. Desarrollo: Algoritmo de decisión: ante un obstáculo a menos de 20 cm, detenerse, escanear ambos lados y girar hacia el lado más despejado. Cierre: Recorrido autónomo en un laberinto sencillo esquivando cajas y paredes."
        }
    ]

    all_data["3°"]["Robótica"]["9°"] = [
        {
            "id": "rob-9-3-1",
            "topic": "Protocolos de comunicación inalámbrica y módulos de radiofrecuencia (Bluetooth HC-05 / HC-06)",
            "dba": dba_rob_9,
            "achievement": "Configura módulos de comunicación serie inalámbrica Bluetooth mediante comandos AT estableciendo enlace seguro.",
            "suggestedSequence": "Inicio: ¿Cómo se empareja un teléfono con un parlante o un robot? Introducción a los perfiles Bluetooth (SPP). Desarrollo: Configuración de velocidad en baudios (9600 bps), nombre y clave del módulo Bluetooth con terminal serie. Cierre: Prueba de envío de caracteres de prueba desde el PC al microcontrolador de forma inalámbrica."
        },
        {
            "id": "rob-9-3-2",
            "topic": "Desarrollo de aplicaciones móviles de control robótico en MIT App Inventor",
            "dba": dba_rob_9,
            "achievement": "Diseña la interfaz gráfica y programa la lógica de eventos de una app móvil para teledirigir un prototipo robótico.",
            "suggestedSequence": "Inicio: Creación de la cuenta en App Inventor y diseño visual del panel de control con botones direccionales y slider de velocidad. Desarrollo: Programación por bloques en la app: conexión con el cliente Bluetooth y envío de comandos ('F', 'B', 'L', 'R', 'S'). Cierre: Instalación del archivo APK en el teléfono móvil y vinculación con el módulo Bluetooth."
        },
        {
            "id": "rob-9-3-3",
            "topic": "Transmisión de telemetría bidireccional: Lectura de sensores en la pantalla del celular",
            "dba": dba_rob_9,
            "achievement": "Muestra en la pantalla del dispositivo móvil datos en tiempo real de voltaje de batería y distancia de sensores.",
            "suggestedSequence": "Inicio: Importancia de la telemetría en vehículos de exploración como los drones o autos autónomos. Desarrollo: Estructuración de tramas de datos separadas por comas (CSV) enviadas desde el robot a la app móvil. Cierre: Visualización de un indicador gráfico en el celular alertando batería baja o cercanía de obstáculos."
        },
        {
            "id": "rob-9-3-4",
            "topic": "Circuito de obstáculos y maniobras de precisión con control telemétrico",
            "dba": dba_rob_9,
            "achievement": "Demuestra destreza en el pilotaje remoto y seguridad en la parada de emergencia en pistas con restricciones espaciales.",
            "suggestedSequence": "Inicio: Protocolos de seguridad: parada de emergencia instantánea si se pierde la conexión de radio. Desarrollo: Pruebas contrarreloj en un circuito de conos y rampas manejando el robot con el celular. Cierre: Evaluación formativa de la precisión de maniobra y estabilidad del enlace de comunicación."
        }
    ]

    all_data["4°"]["Robótica"]["9°"] = [
        {
            "id": "rob-9-4-1",
            "topic": "Robótica de servicio, efectores finales y diseño de pinzas mecánicas servocontroladas",
            "dba": dba_rob_9,
            "achievement": "Diseña y monta pinzas robóticas de sujeción (grippers) adaptadas al chasis móvil para labores de rescate.",
            "suggestedSequence": "Inicio: Análisis de las pinzas mecánicas de robots industriales para sujetar objetos de diferentes geometrías. Desarrollo: Mecanismo de cuatro barras articuladas accionadas por servomotor para abrir y cerrar la pinza. Cierre: Montaje de la pinza en la parte frontal del robot y calibración de la fuerza de apriete sin romper los objetos."
        },
        {
            "id": "rob-9-4-2",
            "topic": "Integración total de sistemas: Mecánica, electrónica de potencia y software reactivo",
            "dba": dba_rob_9,
            "achievement": "Integra todos los módulos en un prototipo robusto con cableado ordenado, fuentes desacopladas y código modular.",
            "suggestedSequence": "Inicio: Detección de interferencias electromagnéticas: por qué los motores pueden reiniciar el microcontrolador. Desarrollo: Instalación de condensadores de desacoplo, baterías separadas para lógica y potencia, y peinado de cables. Cierre: Prueba de esfuerzo continuo de 10 minutos verificando que no existan recalentamientos."
        },
        {
            "id": "rob-9-4-3",
            "topic": "Torneo institucional de robótica: Prueba de habilidades, sustentación y bitácora técnica",
            "dba": dba_rob_9,
            "achievement": "Participa en el torneo escolar de robótica defendiendo la ingeniería de su prototipo y entregando la bitácora técnica.",
            "suggestedSequence": "Inicio: Organización de la pista de competencia del torneo: reto de traslado de piezas y seguimiento de línea. Desarrollo: Rondas eliminatorias de la competencia evaluando tiempos, autonomía y efectividad de agarre. Cierre: Sustentación oral final ante los jurados y entrega de la memoria técnica documentada."
        }
    ]

    # =========================================================================
    # ROBÓTICA 10°
    # =========================================================================
    all_data["1°"]["Robótica"]["10°"] = [
        {
            "id": "rob-10-1-1",
            "topic": "Fundamentos de cinemática de manipuladores: Articulaciones rotacionales y grados de libertad (DOF)",
            "dba": dba_rob_10,
            "achievement": "Analiza la cinemática directa de un brazo robótico de 3 grados de libertad determinando su espacio de trabajo.",
            "suggestedSequence": "Inicio: Análisis de la movilidad del brazo humano (hombro, codo, muñeca) y su equivalencia en robots articulados. Desarrollo: Representación geométrica de eslabones y articulaciones rotacionales, y cálculo de coordenadas del efector final. Cierre: Simulación del alcance tridimensional del brazo en software de geometría dinámica."
        },
        {
            "id": "rob-10-1-2",
            "topic": "Diseño y modelado CAD 3D de eslabones, base giratoria y gripper en Tinkercad / Fusion 360",
            "dba": dba_rob_10,
            "achievement": "Modela paramétricamente las piezas estructurales de un brazo robótico considerando tolerancias de ensamble y rodamientos.",
            "suggestedSequence": "Inicio: Pautas de diseño para fabricación digital: tolerancias de ajuste para tornillería M3 y servomotores. Desarrollo: Modelado de la base giratoria, eslabón primario, secundario y pinza mecánica en CAD 3D. Cierre: Verificación virtual del ensamble de las piezas comprobando que no existan colisiones entre partes móviles."
        },
        {
            "id": "rob-10-1-3",
            "topic": "Servomotores de alto torque (MG995 / MG996R) y dimensionamiento de fuentes de alimentación desacopladas",
            "dba": dba_rob_10,
            "achievement": "Calcula los torques requeridos en cada articulación y dimensiona la fuente eléctrica independiente para servomotores metálicos.",
            "suggestedSequence": "Inicio: ¿Por qué un servomotor SG90 no puede levantar el peso de un brazo robótico? Torque = Fuerza x Distancia. Desarrollo: Cálculo del torque estático en la peor posición (brazo extendido horizontalmente) y selección de servomotores metálicos. Cierre: Conexión de una fuente externa de 5V/6V con corriente suficiente (5A) uniendo tierras comunes (GND)."
        },
        {
            "id": "rob-10-1-4",
            "topic": "Programación de trayectorias suaves en microcontroladores y reducción de vibraciones",
            "dba": dba_rob_10,
            "achievement": "Programa rutinas de movimiento progresivo interpolado evitando aceleraciones bruscas que descalibren la estructura.",
            "suggestedSequence": "Inicio: Demostración de cómo los movimientos a máxima velocidad hacen vibrar la estructura del robot. Desarrollo: Algoritmo de incremento angular paso a paso con temporizadores milimétricos (curvas de aceleración trapezoidal). Cierre: Pruebas de movimiento suave y continuo entre dos puntos espaciales predeterminados."
        },
        {
            "id": "rob-10-1-5",
            "topic": "Calibración de rutinas Pick & Place y precisión en la repetibilidad de posición",
            "dba": dba_rob_10,
            "achievement": "Programa y calibra ciclos industriales de toma y colocación de objetos (Pick & Place) con alta repetibilidad.",
            "suggestedSequence": "Inicio: Análisis del trabajo de robots en líneas de ensamblaje automotriz y empacado de alimentos. Desarrollo: Registro de coordenadas angulares para aproximación, descenso, sujeción, elevación, traslado y liberación de piezas. Cierre: Reto funcional de trasladar 5 cilindros de una bandeja a otra sin fallos en 2 minutos."
        }
    ]

    all_data["2°"]["Robótica"]["10°"] = [
        {
            "id": "rob-10-2-1",
            "topic": "Interfaces de control analógico: Lectura multieje de Joysticks analógicos y potenciómetros",
            "dba": dba_rob_10,
            "achievement": "Lee y escala señales analógicas de 10 bits de potenciómetros para controlar la posición angular de articulaciones robóticas.",
            "suggestedSequence": "Inicio: Principio del divisor de voltaje dentro de los joysticks analógicos y rango del conversor ADC (0 a 1023). Desarrollo: Función map() en programación para convertir lecturas de 0-1023 a ángulos de servomotor de 0 a 180 grados. Cierre: Control directo en tiempo real de dos articulaciones mediante el movimiento de un joystick."
        },
        {
            "id": "rob-10-2-2",
            "topic": "Filtrado de ruido analógico y definición de zona muerta (deadband) en el software de control",
            "dba": dba_rob_10,
            "achievement": "Aplica filtros de software (promedio móvil) y zonas muertas para eliminar temblores indeseados en los actuadores.",
            "suggestedSequence": "Inicio: ¿Por qué los servos vibran cuando el joystick está en el centro? Detección de fluctuaciones eléctricas en el monitor serie. Desarrollo: Implementación de una zona muerta central (deadband) y filtro de promedio de 5 lecturas consecutivas. Cierre: Comprobación de la total estabilidad del brazo robótico en reposo sin vibraciones ni zumbidos."
        },
        {
            "id": "rob-10-2-3",
            "topic": "Memorización de coordenadas y programación de rutinas de autoaprendizaje (Teach & Repeat)",
            "dba": dba_rob_10,
            "achievement": "Desarrolla algoritmos de aprendizaje por demostración donde el operario graba posiciones que el robot repite automáticamente.",
            "suggestedSequence": "Inicio: Metodología industrial de 'Teach Pendant': enseñar la trayectoria moviendo el robot manualmente y grabando puntos. Desarrollo: Almacenamiento de arreglos de coordenadas angulares en la memoria EEPROM / Flash del microcontrolador. Cierre: Demostración de reproducción automática y en bucle de la trayectoria previamente grabada por el usuario."
        },
        {
            "id": "rob-10-2-4",
            "topic": "Servidor web embebido en ESP32 para teleoperación inalámbrica mediante WebSockets",
            "dba": dba_rob_10,
            "achievement": "Configura un microcontrolador ESP32 como punto de acceso Wi-Fi y aloja una página web para teledirigir el robot.",
            "suggestedSequence": "Inicio: Control de robots sin necesidad de instalar aplicaciones móviles: el navegador web como interfaz universal. Desarrollo: Programación del servidor web asíncrono en ESP32 con controles HTML/JavaScript comunicados por WebSockets. Cierre: Control remoto del brazo robótico desde cualquier teléfono o computador conectado a la red Wi-Fi del robot."
        }
    ]

    all_data["3°"]["Robótica"]["10°"] = [
        {
            "id": "rob-10-3-1",
            "topic": "Arquitectura de sistemas IoT (Internet of Things): Protocolos MQTT y plataformas Cloud",
            "dba": dba_rob_10,
            "achievement": "Comprende la arquitectura de soluciones IoT y publica datos de telemetría hacia plataformas en la nube mediante protocolo MQTT.",
            "suggestedSequence": "Inicio: ¿Cómo se comunica una estación meteorológica o un reloj inteligente con internet? El paradigma IoT. Desarrollo: Creación de cuenta en brokers IoT (Adafruit IO / ThingSpeak) y publicación de datos vía Wi-Fi con ESP32. Cierre: Visualización en tiempo real de gráficas dinámicas de datos subidos a la nube desde el colegio."
        },
        {
            "id": "rob-10-3-2",
            "topic": "Sensores ambientales y de proceso: Calidad del aire, humedad/temperatura (DHT22) y nivel de líquidos",
            "dba": dba_rob_10,
            "achievement": "Conecta y calibra sensores de precisión para el monitoreo automatizado de variables físicas y ambientales.",
            "suggestedSequence": "Inicio: Medición del confort ambiental en el aula: temperatura, humedad relativa y calidad del aire. Desarrollo: Protocolo de comunicación digital de un solo hilo con el sensor DHT22 y calibración de umbrales de alerta. Cierre: Sistema de monitoreo que dispara alertas cuando la temperatura o humedad supera niveles seguros."
        },
        {
            "id": "rob-10-3-3",
            "topic": "Actuadores de potencia para domótica e IoT: Relés de estado sólido y cargas de corriente alterna",
            "dba": dba_rob_10,
            "achievement": "Diseña circuitos de conmutación de potencia con optoacoplamiento para controlar iluminación y ventiladores de 110V AC.",
            "suggestedSequence": "Inicio: Precauciones críticas al trabajar con corriente alterna domiciliaria (110V) vs. corriente directa (5V). Desarrollo: Principio de aislamiento óptico mediante optoacopladores y accionamiento de relés de estado sólido sin chispas. Cierre: Prototipo de encendido remoto de una lámpara de 110V desde un botón digital en la plataforma IoT."
        },
        {
            "id": "rob-10-3-4",
            "topic": "Automatización de un sistema ciberfísico: Invernadero inteligente o aula automatizada",
            "dba": dba_rob_10,
            "achievement": "Integra sensores, microcontroladores y actuadores en un sistema inteligente con retroalimentación en lazo cerrado.",
            "suggestedSequence": "Inicio: Planteamiento del reto: mantener una planta en condiciones óptimas de humedad y luz automáticamente. Desarrollo: Algoritmo de control: si la humedad del suelo cae por debajo del 30%, activar la bomba de riego por 5 segundos. Cierre: Presentación del prototipo a escala de invernadero automatizado con registro en la nube."
        }
    ]

    all_data["4°"]["Robótica"]["10°"] = [
        {
            "id": "rob-10-4-1",
            "topic": "Introducción a TinyML y Machine Learning en microcontroladores (Edge AI)",
            "dba": dba_rob_10,
            "achievement": "Comprende los fundamentos de la inteligencia artificial en el borde (Edge AI) para clasificación de patrones en dispositivos embebidos.",
            "suggestedSequence": "Inicio: ¿Cómo sabe un asistente de voz cuándo decimos su nombre sin enviar audio a internet? Procesamiento en el borde. Desarrollo: Entrenamiento de un modelo de clasificación simple en Edge Impulse utilizando datos de acelerómetros o sensores. Cierre: Despliegue del modelo entrenado en una placa ESP32 para clasificar gestos físicos."
        },
        {
            "id": "rob-10-4-2",
            "topic": "Visión por computador básica con cámaras inteligentes (ESP32-CAM): Detección de color y formas",
            "dba": dba_rob_10,
            "achievement": "Configura módulos de cámara ESP32-CAM para capturar imágenes y segmentar objetos por color y forma.",
            "suggestedSequence": "Inicio: Principio de la visión digital: cómo el computador ve una imagen como una matriz de píxeles RGB. Desarrollo: Algoritmo de filtrado por espacio de color HSV para aislar objetos rojos, azules o verdes en el encuadre. Cierre: Sistema de clasificación automática de tapas plásticas por color en una rampa transportadora."
        },
        {
            "id": "rob-10-4-3",
            "topic": "Servocontrol de seguimiento visual (Tracking) y ética de la inteligencia artificial",
            "dba": dba_rob_10,
            "achievement": "Implementa algoritmos de seguimiento donde una cámara montada en servos sigue automáticamente un objetivo en movimiento.",
            "suggestedSequence": "Inicio: Cálculo del error de centrado: diferencia entre el centro de la imagen y la posición del objeto detectado. Desarrollo: Algoritmo proporcional para mover los servomotores en pan y tilt hacia el centro del objeto. Cierre: Debate reflexivo sobre el impacto ético de la vigilancia automatizada y el reemplazo laboral por robots."
        },
        {
            "id": "rob-10-4-4",
            "topic": "Feria de innovación tecnológica y defensa del proyecto integrador",
            "dba": dba_rob_10,
            "achievement": "Sustenta públicamente el proyecto mecatrónico desarrollado demostrando dominio técnico, analítico y ético.",
            "suggestedSequence": "Inicio: Preparación del stand de exhibición con póster científico, prototipo funcional y computadores de demostración. Desarrollo: Defensa del proyecto ante jurados evaluadores explicando arquitectura de hardware y algoritmos. Cierre: Evaluación formativa y balance de las competencias de ingeniería adquiridas durante el año."
        }
    ]

    # =========================================================================
    # ROBÓTICA 11°
    # =========================================================================
    all_data["1°"]["Robótica"]["11°"] = [
        {
            "id": "rob-11-1-1",
            "topic": "Metodología de ingeniería de proyectos mecatrónicos: Requerimientos y matriz morfológica",
            "dba": dba_rob_11,
            "achievement": "Formula proyectos tecnológicos de alta complejidad aplicando matrices de decisión morfológica y especificaciones técnicas.",
            "suggestedSequence": "Inicio: Ciclo de vida de un proyecto de ingeniería: desde la detección de la necesidad hasta el prototipo funcional. Desarrollo: Levantamiento de requisitos técnicos (velocidad, peso, autonomía) y selección de conceptos con matrices morfológicas. Cierre: Documento formal de propuesta de proyecto de grado con cronograma y presupuesto detallado."
        },
        {
            "id": "rob-11-1-2",
            "topic": "Diseño paramétrico avanzado en CAD 3D y análisis de esfuerzos mecánicos",
            "dba": dba_rob_11,
            "achievement": "Modela mecanismos complejos con relaciones de posición geométricas y simula resistencias mecánicas por elementos finitos.",
            "suggestedSequence": "Inicio: Importancia del diseño paramétrico: cambiar una dimensión y que todo el ensamblaje se ajuste automáticamente. Desarrollo: Modelado de piezas en Fusion 360 / SolidWorks y simulación básica de esfuerzos mecánicos en zonas críticas. Cierre: Planos técnicos normalizados con cotas, vistas y tolerancias dimensionales."
        },
        {
            "id": "rob-11-1-3",
            "topic": "Diseño y ruteo de circuitos impresos (PCB) profesionales con software EDA (EasyEDA / KiCad)",
            "dba": dba_rob_11,
            "achievement": "Diseña esquemáticos electrónicos y rutea placas de circuito impreso (PCB) de doble capa aplicando normas de fabricación.",
            "suggestedSequence": "Inicio: ¿Por qué los cables en protoboard fallan en competencias de robótica? La necesidad del PCB soldado. Desarrollo: Creación del diagrama esquemático, selección de huellas (footprints) y ruteo manual de pistas respetando anchos de corriente. Cierre: Generación y verificación de archivos de fabricación Gerber listos para producción industrial."
        },
        {
            "id": "rob-11-1-4",
            "topic": "Fabricación digital: Parámetros de impresión 3D FDM avanzada y mecanizado CNC",
            "dba": dba_rob_11,
            "achievement": "Configura parámetros de laminación (slicing) en impresión 3D optimizando resistencia mecánica, orientación y tiempos.",
            "suggestedSequence": "Inicio: Análisis de las propiedades de filamentos técnicos: PLA, PETG, ABS y fibra de carbono. Desarrollo: Configuración en laminadores (Cura / PrusaSlicer): altura de capa, porcentaje de relleno (infill), paredes y soportes. Cierre: Impresión y postprocesado de las piezas mecánicas estructurales del prototipo de graduación."
        }
    ]

    all_data["2°"]["Robótica"]["11°"] = [
        {
            "id": "rob-11-2-1",
            "topic": "Teoría de sistemas de control en lazo cerrado: Planta, sensor, comparador y señal de error",
            "dba": dba_rob_11,
            "achievement": "Modela sistemas dinámicos identificando la función de transferencia intuitiva y la retroalimentación en tiempo real.",
            "suggestedSequence": "Inicio: Diferencia fundamental entre lazo abierto (tostadora sin sensor) vs. lazo cerrado (control de crucero de un auto). Desarrollo: Diagrama de bloques de control: setpoint (consigna), error (e = setpoint - variable), controlador y planta. Cierre: Simulación matemática de la respuesta temporal de un sistema de primer y segundo orden."
        },
        {
            "id": "rob-11-2-2",
            "topic": "Algoritmo de control Proporcional, Integral y Derivativo (PID): Fundamentos matemáticos",
            "dba": dba_rob_11,
            "achievement": "Comprende la función matemática del término proporcional (Kp), integral (Ki) y derivativo (Kd) en la estabilidad del sistema.",
            "suggestedSequence": "Inicio: Análisis visual: el término P corrige el presente, el I elimina el error acumulado del pasado, y el D frena anticipando el futuro. Desarrollo: Ecuación matemática del control PID continuo y su discretización para programación en microcontroladores. Cierre: Taller de cálculo manual de la salida del controlador ante diferentes curvas de error."
        },
        {
            "id": "rob-11-2-3",
            "topic": "Programación de bajo nivel en C++ con interrupciones por hardware (Timers e Interrupts externas)",
            "dba": dba_rob_11,
            "achievement": "Programa rutinas de interrupción periódica para garantizar un tiempo de muestreo (Ts) estrictamente constante en el control PID.",
            "suggestedSequence": "Inicio: ¿Por qué la función delay() destruye el control en tiempo real? Introducción a las interrupciones por hardware. Desarrollo: Configuración de registros de timers internos para disparar la rutina de control exactamente cada 1 milisegundo. Cierre: Medición con osciloscopio de la periodicidad y tiempo de ejecución del algoritmo de control."
        },
        {
            "id": "rob-11-2-4",
            "topic": "Robots velocistas seguidores de línea de alta velocidad: Sintonización empírica de ganancias PID",
            "dba": dba_rob_11,
            "achievement": "Sintoniza las constantes Kp, Ki y Kd en un robot seguidor de línea de alta velocidad logrando estabilidad a más de 2 m/s.",
            "suggestedSequence": "Inicio: Método de Ziegler-Nichols y sintonización manual: subir Kp hasta oscilar, agregar Kd para amortiguar y ajustar Ki. Desarrollo: Pruebas dinámicas en pista de alta velocidad registrando tiempos y telemetría de error. Cierre: Competencia de robots velocistas premiando la menor oscilación y mayor velocidad en curvas complejas."
        }
    ]

    all_data["3°"]["Robótica"]["11°"] = [
        {
            "id": "rob-11-3-1",
            "topic": "Sistemas embebidos basados en Linux: Configuración de Raspberry Pi y entorno de desarrollo",
            "dba": dba_rob_11,
            "achievement": "Configura ordenadores monoplaca con sistema operativo Linux para ejecutar tareas de procesamiento masivo en robótica.",
            "suggestedSequence": "Inicio: Diferencias entre un microcontrolador (microsegundos, tiempo real) vs. computador monoplaca (gigahertz, sistema operativo). Desarrollo: Instalación de Raspberry Pi OS, conexión por SSH sin monitor (headless), comandos bash y entorno Python. Cierre: Control de pines GPIO desde scripts de Python interactuando con sensores y actuadores."
        },
        {
            "id": "rob-11-3-2",
            "topic": "Procesamiento y visión artificial avanzada con OpenCV en Python",
            "dba": dba_rob_11,
            "achievement": "Aplica algoritmos de filtrado espacial, detección de bordes (Canny) y reconocimiento de contornos en flujos de video.",
            "suggestedSequence": "Inicio: Flujo de procesamiento de imágenes: captura de frame, escala de grises, desenfoque gaussiano y binarización. Desarrollo: Uso de la librería OpenCV para detectar contornos geométricos, calcular centroides y calcular orientación angular. Cierre: Script en tiempo real que identifica y marca con cajas delimitadoras señales de tráfico u objetos específicos."
        },
        {
            "id": "rob-11-3-3",
            "topic": "Comunicación serial entre microcontroladores de tiempo real y computadores monoplaca",
            "dba": dba_rob_11,
            "achievement": "Estructura protocolos de comunicación robustos por puerto serie / UART entre el procesador Linux y la placa motriz.",
            "suggestedSequence": "Inicio: División de tareas: la Raspberry Pi procesa visión y la placa controladora maneja motores y lazo PID. Desarrollo: Protocolo de comunicación con bytes de inicio (header), comando, datos y suma de verificación (checksum). Cierre: Transmisión continua de vectores de velocidad desde el algoritmo de visión hacia los motores."
        },
        {
            "id": "rob-11-3-4",
            "topic": "Navegación autónoma guiada por visión artificial y telemetría en la nube",
            "dba": dba_rob_11,
            "achievement": "Implementa navegación autónoma en un vehículo robótico que toma decisiones de ruta guiado por su cámara frontal.",
            "suggestedSequence": "Inicio: Simulación de vehículos autónomos (Tesla / Waymo): detección del carril y de obstáculos en la vía. Desarrollo: Integración de detección de carril con corrección proporcional en la dirección del vehículo móvil. Cierre: Prueba autónoma en circuito cerrado esquivando señales de pare y siguiendo marcas viales."
        }
    ]

    all_data["4°"]["Robótica"]["11°"] = [
        {
            "id": "rob-11-4-1",
            "topic": "Validación experimental y pruebas de confiabilidad en condiciones operativas extremas (MTBF)",
            "dba": dba_rob_11,
            "achievement": "Ejecuta protocolos de prueba de fatiga mecánica, autonomía energética y temperatura para certificar confiabilidad.",
            "suggestedSequence": "Inicio: Conceptos de confiabilidad en ingeniería: Tiempo Medio Entre Fallos (MTBF) y análisis de modos de falla (FMEA). Desarrollo: Batería de pruebas de esfuerzo continuo, ciclos de recarga de baterías y resistencia a vibraciones. Cierre: Informe técnico de confiabilidad identificando mejoras de diseño implementadas."
        },
        {
            "id": "rob-11-4-2",
            "topic": "Modelos de transferencia tecnológica, patentes, propiedad intelectual y pitch de innovación",
            "dba": dba_rob_11,
            "achievement": "Comprende los mecanismos de protección intelectual y estructura una propuesta de valor técnico-económica de su proyecto.",
            "suggestedSequence": "Inicio: ¿Cómo convertir un proyecto de aula en un producto tecnológico o emprendimiento social viable? Desarrollo: Búsqueda en bases de patentes (Superintendencia de Industria y Comercio / Google Patents) y elaboración del Lean Canvas. Cierre: Presentación en formato Elevator Pitch de 3 minutos defendiendo la viabilidad e impacto de su prototipo."
        },
        {
            "id": "rob-11-4-3",
            "topic": "Redacción de la memoria técnica de ingeniería institucional y artículo científico",
            "dba": dba_rob_11,
            "achievement": "Redacta el informe final de grado y el artículo científico con rigor metodológico, análisis de resultados y bibliografía APA.",
            "suggestedSequence": "Inicio: Estructura del artículo científico IMRyD: Introducción, Metodología, Resultados y Discusión. Desarrollo: Redacción técnica de resultados con tablas, gráficas de rendimiento, esquemas eléctricos y discusión teórica. Cierre: Consolidación final del documento de grado y aprobación del asesor pedagógico."
        },
        {
            "id": "rob-11-4-4",
            "topic": "Sustentación pública de grado: Defensa del prototipo robótico funcional y entrega de bitácora",
            "dba": dba_rob_11,
            "achievement": "Sustenta con solvencia y rigor científico el prototipo robótico ante el comité de evaluación de la institución.",
            "suggestedSequence": "Inicio: Instalación de la mesa de sustentación pública con el robot en funcionamiento en vivo. Desarrollo: Exposición de 15 minutos ante docentes y jurados externos respondiendo preguntas técnicas y pedagógicas. Cierre: Calificación final, deliberación y entrega simbólica de la mención de honor en robótica."
        }
    ]

    # =========================================================================
    # DIRECCIÓN DE GRUPO 7° (Transversal)
    # =========================================================================
    all_data["1°"]["Dirección de grupo"]["7°"] = [
        {
            "id": "dir-7-1-1",
            "topic": "Acuerdos de convivencia escolar, inducción institucional y sentido de pertenencia",
            "dba": dba_dir_grupo,
            "achievement": "Participa activamente en la construcción concertada del manual de convivencia del aula y asume compromisos colectivos.",
            "suggestedSequence": "Inicio: Dinámica de integración 'La telaraña de compromisos' reconociendo cualidades de cada compañero. Desarrollo: Debate reflexivo sobre las normas necesarias para un ambiente de aprendizaje armónico y respetuoso. Cierre: Firma solemne del pacto de aula y publicación en la cartelera del salón."
        },
        {
            "id": "dir-7-1-2",
            "topic": "Hábitos de estudio, gestión del tiempo y organización académica escolar",
            "dba": dba_dir_grupo,
            "achievement": "Organiza un horario de estudio personal equilibrando deberes escolares, descanso y actividades familiares.",
            "suggestedSequence": "Inicio: Reflexión sobre la procrastinación y el uso excesivo de pantallas en los tiempos de estudio. Desarrollo: Diseño de un planificador semanal de tareas y técnicas de estudio eficaz (Pomodoro, resúmenes). Cierre: Compromiso de seguimiento semanal en la libreta escolar."
        },
        {
            "id": "dir-7-1-3",
            "topic": "Fortalecimiento de la empatía, el valor del respeto y la inclusión en el grupo",
            "dba": dba_dir_grupo,
            "achievement": "Valora la diversidad de opiniones y estilos de aprendizaje de sus pares, rechazando cualquier forma de discriminación.",
            "suggestedSequence": "Inicio: Lectura y análisis de un dilema moral sobre la inclusión y el compañerismo. Desarrollo: Ejercicio de 'ponerse en los zapatos del otro' compartiendo historias personales de superación. Cierre: Creación del mural de la empatía con mensajes positivos para cada estudiante."
        }
    ]

    all_data["2°"]["Dirección de grupo"]["7°"] = [
        {
            "id": "dir-7-2-1",
            "topic": "Inteligencia emocional: Reconocimiento y autorregulación de emociones en situaciones de conflicto",
            "dba": dba_dir_grupo,
            "achievement": "Identifica sus estados emocionales (ira, tristeza, ansiedad) y aplica técnicas de respiración y pausa para autorregularse.",
            "suggestedSequence": "Inicio: El semáforo de las emociones: parar (rojo), pensar (amarillo) y actuar con calma (verde). Desarrollo: Taller vivencial identificando situaciones que detonan el enojo y buscando alternativas pacíficas. Cierre: Diario reflexivo de emociones con registro semanal de logros en autorregulación."
        },
        {
            "id": "dir-7-2-2",
            "topic": "Prevención del maltrato entre pares, acoso escolar (bullying) y cultura del buen trato",
            "dba": dba_dir_grupo,
            "achievement": "Reconoce conductas de intimidación o exclusión y actúa con solidaridad protegiendo a sus compañeros y buscando mediación.",
            "suggestedSequence": "Inicio: Cineforo con un cortometraje sobre el rol de los espectadores en situaciones de acoso. Desarrollo: Identificación de la diferencia entre broma y maltrato continuado, y rutas de apoyo escolar. Cierre: Campaña 'Cero Bullying en 7°' elaborando afiches y cartas de apoyo entre pares."
        },
        {
            "id": "dir-7-2-3",
            "topic": "Comunicación asertiva y resolución dialogada de desacuerdos cotidianos",
            "dba": dba_dir_grupo,
            "achievement": "Expresa sus puntos de vista con claridad y firmeza sin recurrir a la agresión ni a la sumisión.",
            "suggestedSequence": "Inicio: Dramatización de tres estilos de comunicación: pasivo, agresivo y asertivo ante un reclamo. Desarrollo: Práctica de la técnica del mensaje en primera persona ('Yo me siento... cuando tú... porque...'). Cierre: Mesa redonda de mediación de conflictos reales del aula aplicando la escucha activa."
        }
    ]

    all_data["3°"]["Dirección de grupo"]["7°"] = [
        {
            "id": "dir-7-3-1",
            "topic": "Liderazgo estudiantil, participación democrática y representación escolar",
            "dba": dba_dir_grupo,
            "achievement": "Participa con responsabilidad en la elección de voceros del curso y apoya iniciativas del gobierno escolar.",
            "suggestedSequence": "Inicio: Cualidades de un buen líder: servicio, escucha, honestidad y compromiso con el grupo. Desarrollo: Asamblea de grado para evaluar el cumplimiento de compromisos y proponer mejoras al colegio. Cierre: Plan de acción del comité estudiantil de grado para el tercer periodo."
        },
        {
            "id": "dir-7-3-2",
            "topic": "Trabajo colaborativo, cohesión grupal y superación de dificultades académicas",
            "dba": dba_dir_grupo,
            "achievement": "Participa en redes de apoyo solidario entre compañeros para nivelar materias y superar retos académicos.",
            "suggestedSequence": "Inicio: Dinámica de confianza grupal 'Construyendo el puente' que requiere la ayuda de todos. Desarrollo: Creación de grupos de tutoría entre pares (los más fuertes en una materia apoyan a quienes lo necesitan). Cierre: Balance de metas alcanzadas y reconocimiento al esfuerzo y la perseverancia."
        },
        {
            "id": "dir-7-3-3",
            "topic": "Uso consciente de redes sociales y desconexión digital saludable",
            "dba": dba_dir_grupo,
            "achievement": "Reflexiona sobre el tiempo invertido en pantallas y fomenta actividades deportivas, artísticas y de lectura.",
            "suggestedSequence": "Inicio: Registro de tiempo en pantalla del celular: ¿Cuántas horas dedicamos a redes vs. a vivir la realidad? Desarrollo: Debate sobre la influencia de los algoritmos y la necesidad del descanso mental y visual. Cierre: Reto 'Un día de desconexión' compartiendo planes al aire libre con la familia."
        }
    ]

    all_data["4°"]["Dirección de grupo"]["7°"] = [
        {
            "id": "dir-7-4-1",
            "topic": "Proyecto de vida: Metas personales, valores familiares y proyección vocacional temprana",
            "dba": dba_dir_grupo,
            "achievement": "Identifica sus fortalezas, talentos e intereses formulando metas a corto y mediano plazo para su vida.",
            "suggestedSequence": "Inicio: Ejercicio reflexivo 'Mi árbol de vida': raíces (familia), tronco (fortalezas), flores (sueños) y frutos (logros). Desarrollo: Redacción de una carta a sí mismo en el futuro definiendo metas para los próximos tres años. Cierre: Construcción del mapa de los sueños personal en collage creativo."
        },
        {
            "id": "dir-7-4-2",
            "topic": "Pluralidad, valoración de las diferencias y gratitud comunitaria",
            "dba": dba_dir_grupo,
            "achievement": "Reconoce el valor de convivir con personas de diversos orígenes y expresa gratitud hacia quienes han apoyado su formación.",
            "suggestedSequence": "Inicio: Ronda de agradecimientos: cada estudiante reconoce el apoyo recibido de un docente o compañero. Desarrollo: Reflexión sobre la riqueza de las diferencias individuales en la convivencia armónica. Cierre: Elaboración de cartas de gratitud para las familias y personal de apoyo del colegio."
        },
        {
            "id": "dir-7-4-3",
            "topic": "Balance del año escolar, cierre de ciclo y celebración de logros compartidos",
            "dba": dba_dir_grupo,
            "achievement": "Evalúa su crecimiento personal, académico y socioemocional a lo largo del año lectivo reconociendo aprendizajes.",
            "suggestedSequence": "Inicio: Proyección de fotos y videos de las actividades y momentos significativos del año escolar. Desarrollo: Autoevaluación guiada: ¿Qué aprendí este año? ¿En qué mejoré como persona? ¿Qué debo corregir? Cierre: Círculo de despedida del año lectivo y entrega de reconocimientos al compañerismo."
        }
    ]

    print("Robótica y Dirección de grupo fully populated.")
