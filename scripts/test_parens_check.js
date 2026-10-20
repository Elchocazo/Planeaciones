const ImportParser = require('../js/services/import-parser.js');

// Test 1: Fresh copy-paste
const sampleCodeText = `🛠️ Paso 3: Carga del Código en Arduino IDE
Instalar la librería ESP32Servo desde el Gestor de Bibliotecas de Arduino IDE y cargar el siguiente sketch de control directo:
C++
#include <ESP32Servo.h>

// Definición de pines disponibles
const int pinJoystickX = 4; // Pin D4 (GPIO 4 - Entrada ADC)
const int pinServo = 18; // Pin D18 (GPIO 18 - Salida PWM)

// Instancia del objeto servomotor
Servo servoMecanico;

void setup() {
  Serial.begin(115200);
  // Asignar el pin PWM al servomotor y definir rango de pulsos estándar (microsegundos)
  servoMecanico.setPeriodHertz(50); // Frecuencia estándar de 50Hz para servos
  servoMecanico.attach(pinServo, 500, 2400); // Ancho de pulso mín y máx del MG996R
}

void loop() {
  // 1. Leer el valor analógico crudo del joystick (0 a 4095)
  int valorCrudo = analogRead(pinJoystickX);
  // 2. Mapear el rango de 12 bits al rango angular de 0 a 180 grados
  int anguloDeseado = map(valorCrudo, 0, 4095, 0, 180);
  // 3. Escribir el ángulo al servomotor
  servoMecanico.write(anguloDeseado);
  // 4. Telemetría de verificación por puerto serial
  Serial.print("Lectura Joystick: ");
  Serial.print(valorCrudo);
  Serial.print(" -> Angulo Servo: ");
  Serial.print(anguloDeseado);
  Serial.println(" grados");
  delay(20); // Pausa pequeña para estabilizar el tren de engranajes
}

🛠️ Paso 4: Calibración y Pruebas en el Banco de Trabajo
• Abrir el Monitor Serial a 115200 baudios.
• Comprobar que al tener la palanca en el centro de reposo el ángulo se aproxime a 90°.`;

// Test 2: Collapsed text from screenshot
const collapsedUserScreenshotText = `🛠️ Paso 3: Carga del Código en Arduino IDE
Instalar la librería ESP32Servo desde el Gestor de Bibliotecas de Arduino IDE y cargar el siguiente sketch de control directo:
C++
#include
// Definición de pines disponibles const int pinJoystickX = 4; // Pin D4 (GPIO 4 - Entrada ADC) const int pinServo = 18; // Pin D18 (GPIO 18 - Salida PWM

// Instancia del objeto servomotor Servo servoMecanico; void setup() Serial.begin(115200); // Asignar el pin PWM al servomotor y definir rango de pulsos estándar (microsegundos) servoMecanico.setPeriodHertz(50); // Frecuencia estándar de 50Hz para servos servoMecanico.attach(pinServo, 500, 2400); // Ancho de pulso mín y máx del MG996R void loop() // 1. Leer el valor analógico crudo del joystick (0 a 4095) int valorCrudo = analogRead(pinJoystickX); // 2. Mapear el rango de 12 bits al rango angular de 0 a 180 grados int anguloDeseado = map(valorCrudo, 0, 4095, 0, 180); // 3. Escribir el ángulo al servomotor servoMecanico.write(anguloDeseado); // 4. Telemetría de verificación por puerto serial Serial.print("Lectura Joystick: "); Serial.print(valorCrudo); Serial.print(" -> Angulo Servo: "); Serial.print(anguloDeseado); Serial.println(" grados"); delay(20); // Pausa pequeña para estabilizar el tren de engranajes

🛠️ Paso 4: Calibración y Pruebas en el Banco de Trabajo
• Abrir el Monitor Serial a 115200 baudios.
• Comprobar que al tener la palanca en el centro de reposo el ángulo se aproxime a 90°.`;

console.log('Testing parenthetical check in _formatInlineMarkdown:');
console.log('Case A (Pin D18 (GPIO 18 - Salida PWM)):', ImportParser._formatInlineMarkdown('Pin D18 (GPIO 18 - Salida PWM)'));
console.log('Case B (void loop()):', ImportParser._formatInlineMarkdown('void loop()'));
console.log('Case C (delay(20)):', ImportParser._formatInlineMarkdown('delay(20)'));
