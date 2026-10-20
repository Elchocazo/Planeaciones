function cleanAllDocumentArtifacts(text) {
  if (!text || typeof text !== 'string') return '';
  let str = text;

  // 1. Limpiar comandos LaTeX comunes de texto y formato (\text{...}, /text{...}, \textbf{...}, etc.)
  str = str.replace(/(?:\\[tT]ext|\/[tT]ext|\x09ext|\\textbf|\\textit|\\mathrm|\\mathbf|\\textnormal|\\mbox)\s*\{([^}]*)\}/gi, '$1');
  
  // Limpiar cualquier otro comando \tag{...} genérico de LaTeX
  str = str.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1');

  // 2. Operadores matemáticos LaTeX comunes a caracteres unicode legibles
  str = str.replace(/\\times\b/g, '×');
  str = str.replace(/\\div\b/g, '÷');
  str = str.replace(/\\cdot\b/g, '·');
  str = str.replace(/\\pm\b/g, '±');
  str = str.replace(/\\(?:le|leq)\b/g, '≤');
  str = str.replace(/\\(?:ge|geq)\b/g, '≥');
  str = str.replace(/\\neq\b/g, '≠');
  str = str.replace(/\\approx\b/g, '≈');
  str = str.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');

  // 3. Limpiar signos de dólar $ y $$ que envuelven texto, números o comparaciones
  str = str.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  str = str.replace(/\$([^\$\n\r]+?)\$/g, '$1');
  str = str.replace(/\$/g, '');

  // 4. Limpiar llaves huérfanas de LaTeX restantes
  str = str.replace(/\{([^{}\n\r]*)\}/g, '$1');
  str = str.replace(/[{}]/g, '');

  // 5. Limpiar dobles comillas accidentales con asteriscos (""** -> ")
  str = str.replace(/""\*{1,3}/g, '"');
  str = str.replace(/''\*{1,3}/g, "'");
  str = str.replace(/->\s*\*{0,2}/g, '-> ');
  str = str.replace(/(?:^|\n)\s*(?:•\s*)?[\*•\-\–—_]{1,3}\s*(?=\n|$)/g, '\n');

  // 6. Limpiar asteriscos huérfanos antes de etiquetas o al final de palabras (ej: intruso** -> intruso)
  str = str.replace(/(?<=[^\*\s])\*{1,3}(?=[^\*]|$)/g, '');
  str = str.replace(/\*{1,3}/g, '');

  // 7. Limpiar cierres de paréntesis huérfanos con asteriscos como **) o *)
  str = str.replace(/\s*\*{0,2}\)\s*(?=\n|•|$)/g, '');

  return str;
}

const htmlSample = `<div class="notebook-callout"><p><strong style="color:#1d4ed8;">Paso 3:</strong> Reto de tablero "El número intruso""** • El docente escribe la siguiente secuencia en el tablero y los alumnos deben encontrar el único número que rompe el orden de menor a mayor: • Secuencia: $120.000 < 135.000 < 132.500 < 140.000$ • Explicación y corrección: El intruso es 132.500, porque $132.500$ es menor que $135.000$ y no puede ir después de él. La posición correcta de $132.500$ es antes de $135.000$.</p><p><strong style="color:#1d4ed8;">Paso 4:</strong> Situación problema tipo Prueba Saber</p><p>Una distribuidora de alimentos entregó bultos de grano con los siguientes pesos durante el mes:</p><ul><li>Camión 1: $128.450\\text{ kg}$</li><li>Camión 2: $128.540/text{ kg}$</li><li>Camión 3: $125.840\\text{ kg}$</li></ul></div>`;

const cleanedHtml = cleanAllDocumentArtifacts(htmlSample);
console.log('--- CLEANED HTML ---');
console.log(cleanedHtml);
