const fs = require('fs');

function formatInlineMarkdownClean(str) {
  if (!str) return '';
  let res = String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Paired bold **text**
  res = res.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Paired italic *text*
  res = res.replace(/(^|[^\*])\*([^\*]+?)\*([^\*]|$)/g, '$1<em>$2</em>$3');
  // Clean any remaining orphaned asterisks
  res = res.replace(/\*{1,3}/g, '');
  // Clean markdown links
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  if (!res.startsWith('<strong>')) {
    res = res.replace(/^([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\(\)\/]{2,45}:)\s*/, '<strong>$1</strong> ');
  }
  return res.trim();
}

function cleanTallerText(raw) {
  let clean = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 1. Quitar líneas con asteriscos huérfanos o viñetas vacías
  clean = clean.replace(/(?:^|\n)\s*(?:•\s*)?[\*•\-\–—_]{1,3}\s*(?=\n|$)/g, '\n');

  // 2. Quitar líneas con solo puntuación huérfana o cierres rotos como ',' o '**)'
  clean = clean.replace(/(?:^|\n)\s*(?:\*{0,2}[\),.;:\-]\*{0,2})\s*(?=\n|$)/g, '\n');

  // 3. Quitar asteriscos de cierre huérfanos al final de línea o tras ->
  clean = clean.replace(/\*\*\s*(?=\n|$)/gm, '');
  clean = clean.replace(/->\s*\*{1,2}\s*(?=\n|$)/gm, '-> ');
  clean = clean.replace(/([><=])\*{1,2}/g, '$1');

  // 4. Limpiar fórmulas LaTeX simples y \text{}
  clean = clean.replace(/\\text\{([^}]+)\}/g, '$1');
  clean = clean.replace(/\$([0-9\.,\s\+\-\*\/=><\w]+)\$/g, '$1');

  // 5. Separar viñetas inline tras texto
  clean = clean.replace(/([^\n])\s*(•)\s*/g, '$1\n$2 ');

  // 6. Despegar Paso \d: como bloque de encabezado independiente
  clean = clean.replace(/(?:^|\n)\s*(\*{0,2}Paso\s*[A-Z\d][^\n:•]*:?[^\n•]*?\*{0,2})\s*(?=\n|•|$)/gi, '\n\n$1\n\n');

  return clean.trim();
}

function formatTallerToHtml(raw) {
  const cleaned = cleanTallerText(raw);
  const blocks = cleaned.split(/\n{2,}/);
  const htmlBlocks = [];

  for (let b of blocks) {
    const block = b.trim();
    if (!block) continue;

    // Descartar si el bloque completo es solo puntuación o asteriscos
    if (/^[\s,.;:\-–—\(\)\[\]\{\}\*•]+$/.test(block)) continue;

    // 0. Fórmula matemática LaTeX ($$formula$$)
    const mathMatch = block.match(/^\$\$([^\$]+)\$\$$/);
    if (mathMatch) {
      const formula = mathMatch[1].trim();
      if (!formula || /^[\s,.;:\-–—\(\)\[\]\{\}]+$/.test(formula) || (formula.length < 2 && !/[0-9xyzabc]/i.test(formula))) {
        continue;
      }
      htmlBlocks.push(`<div class="notebook-math-block" style="text-align:center; margin:0.6rem 0; padding:8px 12px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:6px; font-family:'Cambria Math', 'Times New Roman', serif; font-size:1.15rem; font-weight:700; color:#1e3a8a; letter-spacing:0.5px;">${formula}</div>`);
      continue;
    }

    // 1. Títulos de Paso (ej: "Paso 1: Cálculo mental...")
    const stepMatch = block.match(/^(?:\*{0,2})(Paso\s*[A-Z\d][^\n:]*:?\s*[^\n]*)\*{0,2}$/i);
    if (stepMatch) {
      const stepTitle = formatInlineMarkdownClean(stepMatch[1]);
      htmlBlocks.push(`<h3 style="color:#1d4ed8; font-weight:800; margin-top:0.7rem; margin-bottom:0.25rem; font-size:1.02rem; display:flex; align-items:center; gap:6px;">🛠️ ${stepTitle}</h3>`);
      continue;
    }

    // 2. Encabezados mayores (## o MAYÚSCULAS)
    const headingMatch = block.match(/^(?:#{1,3}\s+)(.+)$/) ||
                         block.match(/^([\p{Lu}0-9\s\/\-:\(\)]{6,}[\p{Lu}0-9\)])$/u);
    if (headingMatch) {
      const title = (headingMatch[1] || headingMatch[0]).replace(/[\*#]/g, '').trim();
      htmlBlocks.push(`<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">📌 ${title}</h2>`);
      continue;
    }

    // 3. Reglas pedagógicas de una sola línea
    const ruleMatch = block.match(/^\*{0,2}((?:Regla(?:\s+(?:fundamental|de\s+memoria\s+f[aá]cil|n[úu]mero))?|Norma\s*\d+|Lectura\s+completa|Definici[oó]n|Ejemplo(?:\s+paso\s+a\s+paso)?|Importante|Nota|Pregunta)[\s\w#º°\d\(\)]*:)\*{0,2}\s*([\s\S]+)$/i);
    if (ruleMatch) {
      const ruleLabel = ruleMatch[1].replace(/[\*#]/g, '').trim();
      const ruleBody = formatInlineMarkdownClean(ruleMatch[2]);
      htmlBlocks.push(`<p style="margin-top:0.35rem; margin-bottom:0.25rem; line-height:1.4;"><strong style="color:#1d4ed8;">${ruleLabel}</strong> ${ruleBody}</p>`);
      continue;
    }

    // 4. Bloques de viñetas (líneas que inician con •, -, *)
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const validLines = lines.filter(l => !/^[\s\*•\-\–—_]{1,3}$/.test(l));
    const isBulletList = validLines.length > 0 && validLines.every(l => /^[•\-\*]\s+/.test(l));
    if (isBulletList) {
      const listItemsHtml = validLines.map(l => {
        const content = l.replace(/^[•\-\*]\s+/, '').trim();
        if (!content || /^[\s\*•\-\–—_.]+$/.test(content)) return '';
        return `<li style="margin-bottom:0.2rem;">${formatInlineMarkdownClean(content)}</li>`;
      }).filter(Boolean).join('');
      if (listItemsHtml) {
        htmlBlocks.push(`<ul style="margin:0.35rem 0 0.5rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${listItemsHtml}</ul>`);
      }
      continue;
    }

    // 5. Viñetas intercaladas en el bloque
    if (validLines.some(l => /^[•\-\*]\s+/.test(l))) {
      let currentP = [];
      let currentList = [];
      for (const line of validLines) {
        if (/^[•\-\*]\s+/.test(line)) {
          if (currentP.length > 0) {
            htmlBlocks.push(`<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${formatInlineMarkdownClean(currentP.join(' '))}</p>`);
            currentP = [];
          }
          const c = line.replace(/^[•\-\*]\s+/, '').trim();
          if (c && !/^[\s\*•\-\–—_.]+$/.test(c)) {
            currentList.push(`<li style="margin-bottom:0.2rem;">${formatInlineMarkdownClean(c)}</li>`);
          }
        } else {
          if (currentList.length > 0) {
            htmlBlocks.push(`<ul style="margin:0.35rem 0 0.5rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${currentList.join('')}</ul>`);
            currentList = [];
          }
          currentP.push(line);
        }
      }
      if (currentP.length > 0) {
        htmlBlocks.push(`<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${formatInlineMarkdownClean(currentP.join(' '))}</p>`);
      }
      if (currentList.length > 0) {
        htmlBlocks.push(`<ul style="margin:0.35rem 0 0.5rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${currentList.join('')}</ul>`);
      }
      continue;
    }

    // Párrafo normal
    const formattedPara = formatInlineMarkdownClean(block.replace(/\n/g, ' '));
    if (formattedPara) {
      htmlBlocks.push(`<p style="margin-top:0.3rem; margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${formattedPara}</p>`);
    }
  }

  return htmlBlocks.join('\n\n');
}

const sampleTaller = `*

Paso 1: Cálculo mental y comparación relámpago (Pizarra interactiva)**
Completar con $>$, $=$
• 899.999 ___ 900.000 -> $>$** (720.000 es mayor que 705.000)
• 500.050 ___ 505.000 -> **

,

**)
• b) 803.145 ___ 830.145 (Respuesta: $<$)
• c) 999.009 ___ 999.090 (Respuesta: $<$)
• d) 4 CM + 3 C ___ 400.300 (Respuesta: $=$)
• Ejercicio B: Ordena el siguiente grupo de números de menor a mayor:
• Datos desordenados: $354.200$ , $345.900$ , $354.020$ , $345.090$
• Orden correcto: 345.090 $<$ 345.900 $<$ 354.020 $<$ 354.200

Paso 3: Reto de tablero "El número intruso"** • El docente escribe la siguiente secuencia en el tablero y los alumnos deben encontrar el único número que rompe el orden de menor a mayor: • Secuencia: $120.000 < 135.000 < 132.500 < 140.000$ • Explicación y corrección: El intruso es 132.500, porque $132.500$ es menor que $135.000$ y no puede ir después de él. La posición correcta de $132.500$ es antes de $135.000$.

Paso 4: Situación problema tipo Prueba Saber**
Una distribuidora de alimentos entregó bultos de grano con los siguientes pesos durante el mes:
• Camión 1: $128.450\\text{ kg}$
• Camión 2: $128.540\\text{ kg}$
• Camión 3: $125.840\\text{ kg}$
• *`;

const resultHtml = formatTallerToHtml(sampleTaller);
console.log('--- RESULT HTML ---');
console.log(resultHtml);
