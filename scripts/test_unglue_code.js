/**
 * Test ungluing collapsed code from user's screenshot
 */
const collapsedText = `🛠️ Paso 3: Carga del Código en Arduino IDE
Instalar la librería ESP32Servo desde el Gestor de Bibliotecas de Arduino IDE y cargar el siguiente sketch de control directo:
C++
#include
// Definición de pines disponibles const int pinJoystickX = 4; // Pin D4 (GPIO 4 - Entrada ADC) const int pinServo = 18; // Pin D18 (GPIO 18 - Salida PWM

// Instancia del objeto servomotor Servo servoMecanico; void setup() Serial.begin(115200); // Asignar el pin PWM al servomotor y definir rango de pulsos estándar (microsegundos) servoMecanico.setPeriodHertz(50); // Frecuencia estándar de 50Hz para servos servoMecanico.attach(pinServo, 500, 2400); // Ancho de pulso mín y máx del MG996R void loop() // 1. Leer el valor analógico crudo del joystick (0 a 4095) int valorCrudo = analogRead(pinJoystickX); // 2. Mapear el rango de 12 bits al rango angular de 0 a 180 grados int anguloDeseado = map(valorCrudo, 0, 4095, 0, 180); // 3. Escribir el ángulo al servomotor servoMecanico.write(anguloDeseado); // 4. Telemetría de verificación por puerto serial Serial.print("Lectura Joystick: "); Serial.print(valorCrudo); Serial.print(" -> Angulo Servo: "); Serial.print(anguloDeseado); Serial.println(" grados"); delay(20); // Pausa pequeña para estabilizar el tren de engranajes

🛠️ Paso 4: Calibración y Pruebas en el Banco de Trabajo
• Abrir el Monitor Serial a 115200 baudios.
• Comprobar que al tener la palanca en el centro de reposo el ángulo se aproxime a 90°.`;

function unglueCodeBlock(rawCode, surroundingContext = '') {
  let code = rawCode;

  // 1. Si falta el header en #include pero se menciona en el contexto (ej. ESP32Servo)
  if (/^#include\s*(?:\n|\/\/|\s*const|\s*$)/m.test(code)) {
    let libName = '';
    const libMatch = surroundingContext.match(/(?:librer[ií]a|biblioteca|library)\s+([A-Za-z0-9_]+)/i);
    if (libMatch) {
      libName = libMatch[1];
    } else if (/servo/i.test(code)) {
      libName = 'ESP32Servo';
    }
    if (libName) {
      code = code.replace(/#include\s*(?=\n|\/\/|\s*const|\s*$)/m, `#include <${libName}.h>\n`);
    }
  }

  // 2. Reparar paréntesis sin cerrar antes de punto y coma o al final de comentario
  // Ej: (GPIO 18 - Salida PWM -> (GPIO 18 - Salida PWM)
  code = code.replace(/(\([^)\n;]+)(?=\s*(?:\/\/|const\b|int\b|void\b|Servo\b|$))/g, (m, parenPart) => {
    if (!parenPart.includes(')')) return parenPart + ')';
    return parenPart;
  });

  // 3. Separar comentarios que están pegados a declaraciones de código
  // Ej: // Definición de pines disponibles const int -> // Definición de pines disponibles \n const int
  code = code.replace(/(\/\/[^\n;]+?)\s+(?=\b(?:const|int|float|double|char|bool|boolean|void|Servo|Serial|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|return)\b)/g, '$1\n');

  // 4. Separar declaraciones terminadas en punto y coma pegadas a la siguiente instrucción o comentario
  // Ej: pinServo = 18; // Pin D18 -> pinServo = 18;\n// Pin D18
  code = code.replace(/;\s*(?=\/\/|\b(?:const|int|float|double|char|bool|boolean|void|Servo|Serial|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|return|if|for|while)\b)/g, ';\n');

  // 5. Separar void setup() y void loop()
  code = code.replace(/(?:^|\s*)(void\s+setup\s*\(\))\s*/g, '\n\n$1 {\n  ');
  code = code.replace(/(?:^|\s*)(void\s+loop\s*\(\))\s*/g, '\n}\n\n$1 {\n  ');

  // Si se abrieron llaves para setup/loop y falta el cierre final
  if (code.includes('void loop() {') && !code.trim().endsWith('}')) {
    code = code.trim() + '\n}';
  }

  // Si void setup() se abrió con { pero no se cerró antes de void loop()
  if (code.includes('void setup() {') && !code.includes('}\n\nvoid loop() {') && code.includes('void loop() {')) {
    code = code.replace('void loop() {', '}\n\nvoid loop() {');
  }

  // 6. Indentar adecuadamente las líneas dentro de setup y loop
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('}')) indentLevel = Math.max(0, indentLevel - 1);
    const prefix = '  '.repeat(indentLevel);
    if (trimmed.endsWith('{')) indentLevel++;
    return prefix + trimmed;
  });

  return formattedLines.join('\n').trim();
}

console.log('Testing code unglue:');
const codePart = collapsedText.match(/C\+\+\s*\n([\s\S]*?)(?=\n\s*🛠️|\n\s*•|$)/i)[1];
const unglued = unglueCodeBlock(codePart, collapsedText);
console.log('--- REPAIRED CODE ---\n' + unglued);
