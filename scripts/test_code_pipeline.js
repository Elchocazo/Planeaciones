const fs = require('fs');

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

// Also test the ALREADY COLLAPSED version from user's screen
const collapsedUserScreenshotText = `🛠️ Paso 3: Carga del Código en Arduino IDE
Instalar la librería ESP32Servo desde el Gestor de Bibliotecas de Arduino IDE y cargar el siguiente sketch de control directo:
C++
#include
// Definición de pines disponibles const int pinJoystickX = 4; // Pin D4 (GPIO 4 - Entrada ADC) const int pinServo = 18; // Pin D18 (GPIO 18 - Salida PWM

// Instancia del objeto servomotor Servo servoMecanico; void setup() Serial.begin(115200); // Asignar el pin PWM al servomotor y definir rango de pulsos estándar (microsegundos) servoMecanico.setPeriodHertz(50); // Frecuencia estándar de 50Hz para servos servoMecanico.attach(pinServo, 500, 2400); // Ancho de pulso mín y máx del MG996R void loop() // 1. Leer el valor analógico crudo del joystick (0 a 4095) int valorCrudo = analogRead(pinJoystickX); // 2. Mapear el rango de 12 bits al rango angular de 0 a 180 grados int anguloDeseado = map(valorCrudo, 0, 4095, 0, 180); // 3. Escribir el ángulo al servomotor servoMecanico.write(anguloDeseado); // 4. Telemetría de verificación por puerto serial Serial.print("Lectura Joystick: "); Serial.print(valorCrudo); Serial.print(" -> Angulo Servo: "); Serial.print(anguloDeseado); Serial.println(" grados"); delay(20); // Pausa pequeña para estabilizar el tren de engranajes

🛠️ Paso 4: Calibración y Pruebas en el Banco de Trabajo
• Abrir el Monitor Serial a 115200 baudios.
• Comprobar que al tener la palanca en el centro de reposo el ángulo se aproxime a 90°.`;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function repairCodeFormatting(rawCode, surroundingContext = '') {
  let code = rawCode;

  // Si ya tiene una buena cantidad de saltos de línea y llaves, no forzar división agresiva
  const lineCount = (code.match(/\n/g) || []).length;
  const isCollapsed = lineCount < 4 && (code.includes(';') || code.includes('void setup'));

  // 1. Restaurar include si se perdió el header
  if (/^#include\s*(?:\n|\/\/|\s*const|\s*$)/m.test(code)) {
    let libName = '';
    const libMatch = surroundingContext.match(/(?:librer[ií]a|biblioteca|library)\s+([A-Za-z0-9_]+)/i);
    if (libMatch) {
      libName = libMatch[1];
    } else if (/servo/i.test(code) || /servo/i.test(surroundingContext)) {
      libName = 'ESP32Servo';
    }
    if (libName) {
      code = code.replace(/#include\s*(?=\n|\/\/|\s*const|\s*$)/m, `#include <${libName}.h>\n`);
    }
  }

  // 2. Solo si está colapsado en pocas líneas o le faltan saltos de línea evidentes:
  if (isCollapsed || code.includes('void setup() Serial') || /;\s*(?:const|int|void|Servo)\b/.test(code)) {
    // Separar declaraciones pegadas tras punto y coma
    code = code.replace(/;\s*(?=\/\/|\b(?:const|int|float|double|char|bool|boolean|void|Servo|Serial|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|return|if|for|while)\b)/g, ';\n');

    // Separar comentarios pegados a código siguiente
    code = code.replace(/(\/\/[^\n;{}]+?)\s+(?=\b(?:const|int|float|double|char|bool|boolean|void|Servo|Serial|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|return)\b|[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)/g, '$1\n');

    // Restaurar void setup() y void loop() con llaves si no las tienen
    code = code.replace(/(?:^|\s*)(void\s+setup\s*\(\))\s*(?![\s\n]*\{)/g, '\n\n$1 {\n  ');
    code = code.replace(/(?:^|\s*)(void\s+loop\s*\(\))\s*(?![\s\n]*\{)/g, '\n}\n\n$1 {\n  ');

    if (code.includes('void loop() {') && !code.trim().endsWith('}')) {
      code = code.trim() + '\n}';
    }
  }

  // Reparar líneas que terminan en paréntesis abierto sin cerrar (ej: "(GPIO 18 - Salida PWM")
  code = code.replace(/\(([^\)\n]+)$/gm, (match, inside) => {
    return '(' + inside + ')';
  });

  // Indentar adecuadamente
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

function shieldCodeBlocks(text) {
  if (!text || typeof text !== 'string') return { text, blocks: [] };
  const blocks = [];
  let shielded = text;

  // 1. Markdown fenced code blocks: ```lang ... ``` or ~~~lang ... ~~~
  shielded = shielded.replace(/(?:^|\n)(?:```|~~~)([a-zA-Z0-9_\+\-\.]*)\r?\n([\s\S]*?)(?:```|~~~)(?=\n|$)/g, (match, lang, code) => {
    const ph = `___CODE_BLOCK_SHIELD_${blocks.length}___`;
    blocks.push({
      placeholder: ph,
      language: (lang || '').trim() || 'C++ / Arduino',
      code: repairCodeFormatting(code.trim(), text)
    });
    return `\n\n${ph}\n\n`;
  });

  // 2. Existing HTML code containers
  shielded = shielded.replace(/(?:^|\n)<div class="notebook-code-block"[^>]*>([\s\S]*?)<\/div>(?=\n|$)/gi, (match) => {
    const ph = `___CODE_BLOCK_SHIELD_${blocks.length}___`;
    blocks.push({
      placeholder: ph,
      isHtml: true,
      html: match
    });
    return `\n\n${ph}\n\n`;
  });

  shielded = shielded.replace(/(?:^|\n)<pre\b[^>]*>([\s\S]*?)<\/pre>(?=\n|$)/gi, (match, inner) => {
    const ph = `___CODE_BLOCK_SHIELD_${blocks.length}___`;
    const cleanCode = inner.replace(/<\/?code\b[^>]*>/gi, '');
    blocks.push({
      placeholder: ph,
      language: 'C++ / Arduino',
      code: repairCodeFormatting(cleanCode.trim(), text)
    });
    return `\n\n${ph}\n\n`;
  });

  // 3. Unfenced code blocks preceded by language marker like "C++", "Arduino", "Python"
  const langHeaderRegex = /(?:^|\n)\s*(C\+\+|cpp|c|arduino|python|py|javascript|js|html|css|sql|bash|java)\s*\n\s*(#include\b|import\b|def\b|void\b|int\b|const\b|class\b|function\b|\/\/|<!DOCTYPE|<html)/i;
  
  if (langHeaderRegex.test(shielded)) {
    shielded = shielded.replace(/(?:^|\n)\s*(C\+\+|cpp|c|arduino|python|py|javascript|js|html|css|sql|bash|java)\s*\n([\s\S]*?)(?=(?:\n\s*(?:🛠️|📌|✍️|🏠|Paso\s*\d+|##|\*{1,2}Paso|FASE\s+DE|\*{1,2}[A-ZÁÉÍÓÚÑ¿¡][^\n:]*:))|$)/i, (match, lang, codeBody) => {
      const ph = `___CODE_BLOCK_SHIELD_${blocks.length}___`;
      blocks.push({
        placeholder: ph,
        language: lang.trim(),
        code: repairCodeFormatting(codeBody.trim(), text)
      });
      return `\n\n${ph}\n\n`;
    });
  }

  // 4. Code block starting with "#include <...>" or "void setup()" without language header
  const rawCodeSignatureRegex = /(?:^|\n)\s*(#include\s*<[a-zA-Z0-9_\.\-]+>|#include\s*(?:\n|\/\/)|void\s+(?:setup|loop)\s*\(\))\s*\n([\s\S]*?)(?=(?:\n\s*(?:🛠️|📌|✍️|🏠|Paso\s*\d+|##|\*{1,2}Paso|FASE\s+DE|\*{1,2}[A-ZÁÉÍÓÚÑ¿¡][^\n:]*:))|$)/i;
  if (rawCodeSignatureRegex.test(shielded)) {
    shielded = shielded.replace(rawCodeSignatureRegex, (match, firstLine, restOfCode) => {
      const ph = `___CODE_BLOCK_SHIELD_${blocks.length}___`;
      blocks.push({
        placeholder: ph,
        language: 'C++ / Arduino',
        code: repairCodeFormatting((firstLine + '\n' + restOfCode).trim(), text)
      });
      return `\n\n${ph}\n\n`;
    });
  }

  return { text: shielded, blocks };
}

function renderCodeBlockHtml(block) {
  if (block.isHtml) return block.html;
  let langDisplay = (block.language || 'Código').toUpperCase();
  if (langDisplay === 'CPP' || langDisplay === 'C++') langDisplay = 'C++ / Arduino';
  else if (langDisplay === 'PY' || langDisplay === 'PYTHON') langDisplay = 'Python';
  else if (langDisplay === 'JS' || langDisplay === 'JAVASCRIPT') langDisplay = 'JavaScript';

  const escaped = escapeHtml(block.code);

  return `<div class="notebook-code-block" style="background:#f8fafc; border:1.5px solid #cbd5e1; border-left:4px solid #2563eb; border-radius:6px; margin:0.8rem 0; padding:10px 14px; font-family:'Consolas', 'Courier New', monospace; font-size:0.82rem; line-height:1.45; overflow-x:auto; white-space:pre-wrap; word-break:break-word; color:#0f172a; page-break-inside:avoid; break-inside:avoid;">
  <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:0.75rem; font-weight:700; color:#2563eb; text-transform:uppercase; margin-bottom:6px; border-bottom:1px solid #e2e8f0; padding-bottom:4px; letter-spacing:0.5px; user-select:none; display:flex; justify-content:space-between; align-items:center;">
    <span>💻 Código / Sketch (${langDisplay})</span>
  </div>
  <pre style="margin:0; font-family:inherit; font-size:inherit; white-space:pre-wrap; word-break:break-word; color:inherit; background:transparent; border:none; padding:0;"><code>${escaped}</code></pre>
</div>`.trim();
}

console.log('=== TEST 1: Fresh copy-paste with C++ and #include <ESP32Servo.h> ===');
const res1 = shieldCodeBlocks(sampleCodeText);
console.log('Found blocks:', res1.blocks.length);
if (res1.blocks.length > 0) {
  console.log(renderCodeBlockHtml(res1.blocks[0]));
}

console.log('\n=== TEST 2: Already collapsed user screenshot text ===');
const res2 = shieldCodeBlocks(collapsedUserScreenshotText);
console.log('Found blocks:', res2.blocks.length);
if (res2.blocks.length > 0) {
  console.log(renderCodeBlockHtml(res2.blocks[0]));
}
