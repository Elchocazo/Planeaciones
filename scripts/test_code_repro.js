const ImportParser = require('../js/services/import-parser.js');

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

const collapsedUserScreenshotText = `🛠️ Paso 3: Carga del Código en Arduino IDE
Instalar la librería ESP32Servo desde el Gestor de Bibliotecas de Arduino IDE y cargar el siguiente sketch de control directo:
C++
#include
// Definición de pines disponibles const int pinJoystickX = 4; // Pin D4 (GPIO 4 - Entrada ADC) const int pinServo = 18; // Pin D18 (GPIO 18 - Salida PWM

// Instancia del objeto servomotor Servo servoMecanico; void setup() Serial.begin(115200); // Asignar el pin PWM al servomotor y definir rango de pulsos estándar (microsegundos) servoMecanico.setPeriodHertz(50); // Frecuencia estándar de 50Hz para servos servoMecanico.attach(pinServo, 500, 2400); // Ancho de pulso mín y máx del MG996R void loop() // 1. Leer el valor analógico crudo del joystick (0 a 4095) int valorCrudo = analogRead(pinJoystickX); // 2. Mapear el rango de 12 bits al rango angular de 0 a 180 grados int anguloDeseado = map(valorCrudo, 0, 4095, 0, 180); // 3. Escribir el ángulo al servomotor servoMecanico.write(anguloDeseado); // 4. Telemetría de verificación por puerto serial Serial.print("Lectura Joystick: "); Serial.print(valorCrudo); Serial.print(" -> Angulo Servo: "); Serial.print(anguloDeseado); Serial.println(" grados"); delay(20); // Pausa pequeña para estabilizar el tren de engranajes

🛠️ Paso 4: Calibración y Pruebas en el Banco de Trabajo
• Abrir el Monitor Serial a 115200 baudios.
• Comprobar que al tener la palanca en el centro de reposo el ángulo se aproxime a 90°.`;

console.log('=== TEST 1: Fresh copy-paste ===');
const result1 = ImportParser.formatMarkdownToHtml(sampleCodeText);
console.log('Has <ESP32Servo.h>:', result1.includes('ESP32Servo.h'));
console.log('Has {}:', result1.includes('{') && result1.includes('}'));
console.log('Has code block:', result1.includes('notebook-code-block'));

console.log('\n=== TEST 2: Collapsed code from screenshot ===');
const result2 = ImportParser.formatMarkdownToHtml(collapsedUserScreenshotText);
console.log('Has <ESP32Servo.h>:', result2.includes('ESP32Servo.h'));
console.log('Has {}:', result2.includes('{') && result2.includes('}'));
console.log('Has code block:', result2.includes('notebook-code-block'));
console.log('Has closing paren (Salida PWM):', result2.includes('Salida PWM)'));
