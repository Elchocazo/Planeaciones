const fs = require('fs');
const ipCode = fs.readFileSync('js/services/import-parser.js', 'utf8');
const vm = require('vm');
const sandbox = { console: console, window: {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(ipCode, sandbox);
const parser = sandbox.ImportParser || sandbox.window.ImportParser;

const sample = `Asignatura: Tecnología e Informática Grado: Tercero Clase: #1 Tiempo disponible: 1 hora de clase (60 minutos) Fecha límite de finalización del periodo: (Ajustar según calendario institucional) Eje temático principal: Dispositivos tecnológicos de comunicación y medios digitales TEMAS DEL PRIMER PERIODO Dispositivos de comunicación: Computadores personales (PC), tabletas y teléfonos celulares; características y funciones. Correo electrónico: Concepto básico, funcionamiento, estructura de un mensaje y envío/recepción. Herramientas de chat y videoconferencia: Canales de mensajería instantánea y reuniones virtuales para el aprendizaje. Redes sociales educativas y normas de seguridad digital: Cuidado de los equipos, convivencia escolar en línea, netiqueta y protección de información personal. DESEMPEÑOS DE APRENDIZAJE Identifica y clasifica los diversos dispositivos tecnológicos de comunicación (computador, tablet y celular) reconociendo su uso cotidiano y escolar. Selecciona la herramienta digital adecuada (correo, chat o videollamada) según el propósito de la comunicación y el destinatario. Aplica normas de cuidado físico y seguridad digital al interactuar con dispositivos tecnológicos dentro y fuera del aula. Reconoce la importancia del respeto y la sana convivencia digital (etiqueta digital) al enviar mensajes o comunicarse con compañeros y docentes. (Tiempo: 35 minutos) Conceptualización sobre dispositivos: Explicación de los tres dispositivos centrales (computador de escritorio o portátil, tableta y celular inteligente), sus características físicas, parecidos y diferencias de uso en la vida diaria y escolar. Introducción a las vías de comunicación digital: Explicación sencilla sobre el correo electrónico (como carta digital formal), el chat (mensajes breves al instante) y las videoconferencias (llamadas con audio y video en vivo). Pacto de cuidado y netiqueta: Reflexión sobre la importancia de proteger datos privados (claves, dirección o teléfonos) y mantener un trato respetuoso y amable al escribir en internet. Registro pedagógico en el cuaderno: Consignación en el cuaderno de apuntes del título del periodo, lista resumida de temas y desempeños, y un esquema gráfico simple de los tres dispositivos tecnológicos.`;

function formatPedagogicalNotebookText(text) {
  let clean = text;

  // 1. Separar secciones en mayúsculas sostenidas tipo TEMAS DEL PRIMER PERIODO, DESEMPEÑOS DE APRENDIZAJE
  clean = clean.replace(/([^\n])\s+((?:TEMAS\s+(?:DEL\s+)?(?:PRIMER|SEGUNDO|TERCER|CUARTO|[1-4][°º]?)\s+PER[IÍ]ODO|DESEMPEÑOS?\s+DE\s+APRENDIZAJE|CRITERIOS?\s+DE\s+EVALUACI[OÓ]N|INSTRUMENTOS?\s+DE\s+EVALUACI[OÓ]N|EJES?\s+TEM[AÁ]TICOS?)\b)/gi, '$1\n\n## $2\n\n');

  // 2. Despegar subtítulos con dos puntos dentro de párrafos o tras punto (ej. "Dispositivos de comunicación:", "Correo electrónico:", etc.)
  clean = clean.replace(/([.!?])\s+([A-ZÁÉÍÓÚÑ][^:\n\r]{2,60}:)(?=\s+[A-ZÁÉÍÓÚÑa-záéíóúñ0-9«\"]|\s*$)/g, '$1\n\n• **$2**');

  // 3. Despegar oraciones de desempeños pedagógicos
  const actionVerbs = '(?:Identifica|Selecciona|Aplica|Reconoce|Comprende|Explica|Describe|Analiza|Utiliza|Propone|Evalúa|Distingue|Clasifica|Diseña|Construye|Elabora)';
  clean = clean.replace(new RegExp('([.!?]|##\\s+DESEMPEÑOS?\\s+DE\\s+APRENDIZAJE(?:\\n+)?)\\s*(' + actionVerbs + '\\b[^.\\n]+[.!?])', 'g'), '$1\n• $2');

  // 4. Despegar duración entre paréntesis seguida de título (Tiempo: 35 minutos) Conceptualización...
  clean = clean.replace(/([^\n])\s*(\((?:Tiempo|Duraci[oó]n)[^)]+\))\s*([A-ZÁÉÍÓÚÑ][^:\n]+:)/gi, '$1\n\n### $2 $3\n\n');

  // 5. Aplicar parser.unglueText
  clean = parser.unglueText(clean);

  // 6. Eliminar marcas ## vacías
  clean = clean.replace(/(?:^|\n)\s*##\s*(?=\n|$)/g, '\n');

  return clean;
}

const cleaned = formatPedagogicalNotebookText(sample);
console.log('=== CLEANED TEXT ===\n', cleaned);

const html = parser.formatMarkdownToHtml(cleaned);
console.log('=== FORMATTED HTML ===\n', html);
