/**
 * PARSER SEMÁNTICO INTELIGENTE DE PLANEACIONES (ImportParser)
 * 
 * Capaz de procesar planeaciones completas pegadas como texto libre,
 * con o sin Markdown, identificando con alta flexibilidad:
 * - PARTE 1: Secuencia Didáctica Institucional (Información General, Tema, DBA, Logros, Inicio, Desarrollo, Cierre, Recursos, Evaluación, Tareas).
 * - PARTE 2: Cuaderno del Docente (Pregunta problematizadora, Estructura del período, Dinámica, Reglas, Cuaderno del Estudiante, Taller/Práctica).
 * 
 * Reglas clave:
 * 1. Cero manipulación del DOM (Pura lógica de transformación).
 * 2. Reconocimiento flexible de variantes de encabezados y duraciones (ej. "FASE DE INICIO (15 minutos)" -> duration: 15).
 * 3. Preservación intacta de listas, pasos y títulos internos ("Paso 1", "Paso 2", numeraciones).
 * 4. Almacenamiento íntegro de sourceText como salvaguarda inmutable.
 */

class ImportParserClass {
  constructor() {}

  /**
   * Despega y estructura texto plano cuando viene colapsado o sin saltos de línea (ej. copiado desde chats como Gemini o celdas de tabla)
   */
  unglueText(text) {
    if (!text || typeof text !== 'string') return '';
    let clean = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();

    // 0. Despegar uniones cuando una minúscula o cierre de paréntesis está pegada a un campo o fase institucional conocida: ej. "noviembreEje", "minutosSaludo"
    clean = clean.replace(/([a-záéíóúñ\)])(Eje\s+tem[aá]tico|Tema|Fase\s+de|Fase\s+inicial|Fase\s+central|Fase\s+final|Inicio|Desarrollo|Cierre|Recursos|Materiales|Tareas?|Compromisos?|Evaluaci[oó]n|Observaciones|Asignatura|Materia|Grado|Curso|Clase|Tiempo|Duraci[oó]n|Fecha|DBA|Logros?|Desempe[ñn]os?|Pregunta|Cuaderno|Informaci[oó]n|Secuencia|Din[aá]mica|Reglas?|Normas?)\b/g, '$1\n$2');

    // 1. Despegar uniones de siglas/mayúsculas seguidas de palabra capitalizada: ej. "GENERALAsignatura", "INSTITUCIONALAsignatura"
    clean = clean.replace(/([A-ZÁÉÍÓÚÑ]{2,})([A-ZÁÉÍÓÚÑ][a-z])/g, '$1\n$2');

    // 2. Despegar uniones de mayúsculas continuas conocidas exclusivamente en mayúsculas: ej. "INSTITUCIONALINFORMACIÓN"
    clean = clean.replace(/([A-ZÁÉÍÓÚÑ]{3,})(INFORMACI[OÓ]N|SECUENCIA|CUADERNO|FASE|RECURSOS|MATERIALES|TAREAS|EVALUACI[OÓ]N|OBSERVACIONES)/g, '$1\n\n$2');

    // 3. Despegar encabezados mayores preservando negritas **
    const majorHeadings = [
      'INFORMACI[OÓ]N\\s+GENERAL',
      'DATOS\\s+GENERALES',
      'SECUENCIA\\s+DID[AÁ]CTICA\\s+ESTRUCTURADA',
      'SECUENCIA\\s+DID[AÁ]CTICA',
      'CUADERNO\\s+DEL\\s+DOCENTE',
      'PLANEACI[OÓ]N\\s+DE\\s+CLASE',
      'FASE\\s+DE\\s+INICIO',
      'FASE\\s+DE\\s+DESARROLLO',
      'FASE\\s+DE\\s+CIERRE',
      'FASE\\s+INICIAL',
      'FASE\\s+CENTRAL',
      'FASE\\s+FINAL',
      'RECURSOS\\s+DID[AÁ]CTICOS(?:\\s*[:\\/-]?\\s*Y\\s+MATERIALES)?',
      'RECURSOS\\s+Y\\s+MATERIALES',
      'MATERIALES\\s+DID[AÁ]CTICOS',
      'TAREAS?(?:\\s*[\\/:]\\s*COMPROMISOS?)?(?:\\s*[:\\/-]?\\s*(?:Y\\s+)?ACTIVIDADES\\s+EXTRACLASE)?',
      'COMPROMISOS?(?:\\s*[:\\/-]?\\s*(?:Y\\s+)?ACTIVIDADES\\s+EXTRACLASE)?',
      'ACTIVIDADES\\s+EXTRACLASE',
      'EVALUACI[OÓ]N(?:\\s+FORMATIVA)?',
      'OBSERVACIONES\\s+PEDAG[OÓ]GICAS(?:\\s+DE\\s+LA\\s+SESI[OÓ]N)?',
      'OBSERVACIONES(?:\\s+DE\\s+LA\\s+SESI[OÓ]N)?',
      'TEMAS?\\s+(?:DEL?\\s+)?(?:PRIMER|SEGUNDO|TERCER|CUARTO|[1-4][°º]?\\s+)?PER[IÍ]ODO',
      'DESEMPE[ÑN]OS?\\s+(?:DE\\s+APRENDIZAJE|DEL?\\s+PER[IÍ]ODO)',
      'ESTRUCTURA\\s+GENERAL\\s+(?:DEL?\\s+)?(?:PRIMER|SEGUNDO|TERCER|CUARTO|[1-4][°º]?\\s+)?PER[IÍ]ODO',
      'DIN[AÁ]MICA\\s+DE\\s+CLASE',
      'REGLAS?\\s+DE\\s+JUEGO',
      'NORMAS?\\s+DE\\s+CLASE',
      'GU[IÍ]A\\s+DE\\s+CONTENIDO',
      'CONTENIDO\\s+(?:PARA\\s+EL\\s+)?(?:ESTUDIANTE|CUADERNO)',
      'CUADERNO\\s+DEL\\s+ESTUDIANTE',
      'TALLER\\s*(?:[\\/:]\\s*(?:EJERCICIO|ACTIVIDAD)\\s+PR[AÁ]CTICO(?:\\s+DE\\s+LA\\s+CLASE)?|\\s+PR[AÁ]CTICO(?:\\s+DE\\s+LA\\s+CLASE)?|\\s+DE\\s+APLICACI[OÓ]N(?:\\s+EN\\s+CLASE)?(?:\\s*#?\\s*\\d+)?|\\s+EN\\s+CLASE(?:\\s*#?\\s*\\d+)?)',
      'ACTIVIDAD\\s+PR[AÁ]CTICA(?:\\s+DE\\s+LA\\s+CLASE)?',
      'PREGUNTA\\s+(?:PROBLEMATIZADORA|ORIENTADORA|GU[IÍ]A|CLAVE)'
    ].join('|');

    const headingRegex = new RegExp('([^\\n*])\\s*(\\*{0,2})(' + majorHeadings + ')(\\*{0,2})', 'gi');
    clean = clean.replace(headingRegex, (match, p1, starsBefore, p2, starsAfter, offset, fullStr) => {
      if (/PARTE\s+[12]:?\s*$/i.test(p1)) return p1 + ' ' + (starsBefore || '') + p2 + (starsAfter || '');
      
      const prefixBefore = fullStr.substring(Math.max(0, offset - 80), offset + p1.length);
      
      // No separar si es un encabezado compuesto institucional como "RECURSOS DIDÁCTICOS: Y MATERIALES" o "TAREAS / COMPROMISOS: Y ACTIVIDADES EXTRACLASE"
      if (/(?:RECURSOS|DID[AÁ]CTICOS|TAREAS?|COMPROMISOS?)\s*[:\/-]?\s*(?:Y\s*)?$/i.test(prefixBefore)) {
        return p1 + ' ' + (starsBefore || '') + p2 + (starsAfter || '');
      }

      // No separar si la palabra está precedida por preposiciones, artículos o frases conectivas
      // (ej. "Criterios de evaluación", "Instrumentos de evaluación", "el taller práctico", "dicho taller")
      if (/\b(?:criterios|instrumentos|r[úu]bricas?|estrategias?|momentos?|tipos?|proceso|gu[ií]a|formato|uso|entrega|asignaci[oó]n|revisi[oó]n|an[aá]lisis|sobre|para|con|por|sin|hacia|mediante|seg[úu]n|de|del|la|el|los|las|un|una|unos|unas|este|esta|estos|estas|dicho|dicha|cada|su|sus|y|o|que)\s*(?:de|del|sobre|para)?$/i.test(prefixBefore)) {
        return p1 + ' ' + (starsBefore || '') + p2 + (starsAfter || '');
      }

      return p1 + '\n\n' + (starsBefore || '') + p2 + (starsAfter || '');
    });

    // Separar PARTE 1 / PARTE 2
    clean = clean.replace(/([^\n*])\s*(\*{0,2})(PARTE\s+[12]\s*:?)(\*{0,2})/gi, '$1\n\n$2$3$4');

    // 4. Despegar campos clave-valor conocidos preservando negritas **
    const inlineFields = [
      'Asignatura',
      'Materia',
      'Área',
      'Grado',
      'Curso',
      'Clase\\s*(?:#|N[°º])?',
      'Sesión\\s*(?:#|N[°º]|de\\s+clase\\s*#?)?\\s*\\d+',
      'Tiempo(?:\\s+disponible)?',
      'Duración',
      'Fecha(?:\\s+límite(?:\\s+(?:de\\s+finalización\\s+)?del\\s+periodo)?)?',
      'Eje\\s+temático(?:\\s+principal)?',
      'Tema(?:\\s+principal)?',
      'DBA',
      'Derechos?\\s+Básicos?\\s+de\\s+Aprendizaje',
      'Logro',
      'Desempeño(?:\\s+de\\s+aprendizaje)?',
      'Institución'
    ].join('|');

    const fieldRegex = new RegExp('(?:^|[^\\w(*])(\\*{0,2})(' + inlineFields + ')(\\*{0,2})\\s*:', 'gi');
    clean = clean.replace(fieldRegex, (match, starsBefore, fieldName, starsAfter, offset, fullStr) => {
      const prefixBefore = fullStr.substring(Math.max(0, offset - 40), offset);
      // No separar si viene precedido por preposiciones, artículos o pronombres ("de la sesión:", "durante la sesión:")
      if (/(?:la|el|de|del|en|para|por|sobre|esta|cada|nuestra|durante|su|sus)\s*$/i.test(prefixBefore)) {
        return match;
      }
      const charBefore = offset > 0 ? fullStr[offset - 1] : '\n';
      const prefix = (charBefore === '\n') ? '' : '\n';
      return prefix + (starsBefore || '') + fieldName + (starsAfter || '') + ':';
    });

    // 5. Separar encabezados de fase con duración del contenido inicial
    clean = clean.replace(/(\bFASE\s+DE\s+(?:INICIO|DESARROLLO|CIERRE)(?:\s*\([^)]+\))?:?)\s*([A-ZÁÉÍÓÚÑ])/gi, '$1\n\n$2');

    // 6. Separar subtítulos de pasos dentro de fases (ej. ". Revisión de la tarea extraclase:" o ") Saludo:")
    clean = clean.replace(/([.)])\s+([A-ZÁÉÍÓÚÑ][^:\n\r]{2,60}:)(?=\s+[A-ZÁÉÍÓÚÑa-záéíóúñ0-9«"]|\s*$)/g, '$1\n\n$2');

    // 7. Separar viñetas (•) que estén inline tras texto previo
    clean = clean.replace(/([^\n])\s+(•)\s+/g, '$1\n$2 ');

    // 8. Despegar viñetas (- o *) ÚNICAMENTE si vienen tras puntuación de cierre o asteriscos (nunca separar guiones entre palabras como "teórico - práctico")
    clean = clean.replace(/([.:;\n]|\*{2})\s+([-*])\s+(?=[A-ZÁÉÍÓÚÑa-záéíóúñ0-9¿¡"«\*\d])/g, '$1\n$2 ');

    // 9. Despegar apartados o secciones mayores numeradas antes y después (ej. "**2. LAS TRES PRIMERAS HABITACIONES**")
    clean = clean.replace(/([^\n])\s*(\*{2}\d+[\.\)]\s+[^\n*]+\*{2})/g, '$1\n\n$2');
    clean = clean.replace(/(\*{2}\d+[\.\)]\s+[^\n*]+\*{2})\s*([A-ZÁÉÍÓÚÑ¿¡•])/g, '$1\n\n$2');

    // 10. Despegar reglas, pasos, normas, notas y subtítulos con dos puntos (ej. "**Regla número 1:**", "**Lectura completa:**")
    clean = clean.replace(/([.!?:;)\]\*])\s*(\*{1,2}(?:Regla(?:\s+n[úu]mero)?\s*\d+|Paso\s*\d+|Norma\s*\d+|Lectura\s+completa|Definici[oó]n|Ejemplo|Importante|Nota|Pregunta)\b[^:\n\r]{0,50}:\*{0,2})/gi, '$1\n\n$2');

    // 11. Limpiar saltos indebidos en toda la estructura
    clean = this.cleanBrokenLinebreaks(clean);

    return clean;
  }

  /**
   * Corrige en toda la aplicación saltos de línea donde no correspondan:
   * - Restaura encabezados cortados ("Criterios de" -> "Criterios de evaluación:", "Instrumentos de" -> "Instrumentos de evaluación:")
   * - Une oraciones partidas a la mitad por saltos tras preposiciones o artículos ("de\ncomputador" -> "de computador")
   * - Elimina saltos dobles innecesarios entre encabezados con dos puntos y sus viñetas ("Encabezado:\n\n•" -> "Encabezado:\n•")
   * - Preserva listas, párrafos y estructura institucional armónica.
   */
  cleanBrokenLinebreaks(text) {
    if (!text || typeof text !== 'string') return '';
    let clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Reparar "Criterios de" e "Instrumentos de" huérfanos sin la palabra "evaluación"
    clean = clean.replace(/(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi, '\nCriterios de evaluación:\n');
    clean = clean.replace(/(?:^|\n)\s*Instrumentos\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi, '\nInstrumentos de evaluación:\n');

    // 2. Unir palabras clave partidas por salto de línea específicamente
    clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nCriterios de evaluación:');
    clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nInstrumentos de evaluación:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*:\s*(?:y\s+)?materiales\b/gi, '\nRecursos didácticos y materiales:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*\n+\s*(?:y\s+)?materiales(?!\s*:)/gi, '\nRecursos didácticos y materiales:');
    clean = clean.replace(/(?:^|\n)\s*(Tareas)\s*\n+\s*(?:y\s+)?compromisos(?!\s*:)/gi, '\nTareas y compromisos:');

    // 3. Normalizar encabezados de subsección para que tengan dos puntos
    clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos\s+y\s+materiales)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Tareas\s+(?:y\s+)?compromisos)(?!\s*:)/gi, '\n$1:');

    // 4. Unir saltos de línea artificiales tras comas o punto y coma dentro de una misma idea/viñeta
    // Ej: "computador,\ndatos" -> "computador, datos"
    clean = clean.replace(/([,;])\s*\n\s*(?![•\-\*\d\n\r#]|\*{1,2}[A-Z])/g, '$1 ');

    // 5. Unir oraciones partidas tras preposiciones, artículos o conjunciones (solo salto simple \n, y solo si continúa en minúscula)
    clean = clean.replace(/(?:^|[^a-záéíóúñA-ZÁÉÍÓÚÑ])(de|del|la|el|los|las|en|con|para|por|sobre|un|una|unos|unas|su|sus|sin|y|o|que|al|a|como|entre|hacia|desde|hasta|e|ni)\s*\n\s*([a-záéíóúñ0-9«"“\(\[])/g, (match, prep, nextChar) => {
      const prefix = match.slice(0, match.indexOf(prep));
      return prefix + prep + ' ' + nextChar;
    });

    // 6. Unir líneas que terminan en palabra normal y la siguiente empieza con minúscula (continuación directa de renglón tras corte suave)
    // Ej: "...del\nmapa conceptual" -> "...del mapa conceptual"
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*([a-záéíóúñ])/g, '$1 $2');

    // 7. Unir líneas que terminan en texto y continúan con paréntesis explicativo en la línea siguiente
    // Ej: "consignado en el cuaderno\n(jerarquía..." -> "consignado en el cuaderno (jerarquía..."
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*(\([a-záéíóúñA-ZÁÉÍÓÚÑ0-9])/g, '$1 $2');

    // 8. Unir palabras con guión partidas por salto (ej. "teórico -\npráctico")
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ])\s*-\s*\n\s*([a-záéíóúñA-ZÁÉÍÓÚÑ])/g, '$1-$2');

    // 9. Espaciado armónico: entre el final de una lista y el siguiente subtítulo ("Instrumentos de evaluación:") debe haber \n\n
    clean = clean.replace(/([^\n])\n*((?:Criterios|Instrumentos)\s+de\s+evaluaci[oó]n:)/gi, '$1\n\n$2');

    // 10. Eliminar saltos dobles innecesarios entre un encabezado con dos puntos (:) y su primera viñeta
    clean = clean.replace(/([^\n:]+:)\s*\n{2,}([•]|[-*](?!\*))/g, '$1\n$2');

    // 11. Normalizar saltos triples o excesivos
    clean = clean.replace(/\n{3,}/g, '\n\n');

    return clean.trim();
  }

  /**
   * Convierte contenido HTML (copiado de Gemini, ChatGPT, Word o web) a texto formateado en Markdown,
   * preservando saltos de línea (\n\n), negritas (**...**) y viñetas (•).
   */
  convertHtmlToFormattedText(html) {
    if (!html || typeof html !== 'string') return '';

    let text = html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<meta[\s\S]*?>/gi, '');

    // Reemplazar saltos y párrafos
    text = text.replace(/<br\s*[\/]?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<\/h[1-6]>/gi, '\n\n');
    text = text.replace(/<h[1-6][^>]*>/gi, '\n\n### ');
    text = text.replace(/<li[^>]*>/gi, '\n• ');
    text = text.replace(/<\/li>/gi, '');
    text = text.replace(/<\/(?:ul|ol)>/gi, '\n\n');
    text = text.replace(/<\/tr>/gi, '\n');
    text = text.replace(/<\/(?:td|th)>/gi, '  ');

    // Preservar negritas como Markdown **
    text = text.replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gi, '**$1**');
    // Preservar cursivas como Markdown *
    text = text.replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gi, '*$1*');

    // Eliminar cualquier otro tag HTML restante
    text = text.replace(/<[^>]+>/g, '');

    // Decodificar entidades HTML comunes
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&laquo;/g, '«')
      .replace(/&raquo;/g, '»');

    // Aplicar despegado para garantizar que campos visuales queden en líneas propias
    return this.unglueText(text);
  }

  /**
   * Normaliza texto crudo eliminando anomalías y despegando campos colapsados sin destruir listas ni markdown interno
   */
  normalizeImportedText(text) {
    if (!text || typeof text !== 'string') return '';
    return this.unglueText(text);
  }

  /**
   * Convierte texto estructurado o Markdown a HTML limpio y pedagógico para el Cuaderno / Word
   */
  formatMarkdownToHtml(content) {
    if (!content || typeof content !== 'string') return '';
    const trimmed = content.trim();
    if (!trimmed || trimmed === '<p><br/></p>' || trimmed === '<p><br></p>' || trimmed === '<br>') return '';

    // Si ya contiene etiquetas HTML estructurales Y no contiene títulos en Markdown sin renderizar
    const hasRichTags = /<(?:p|h[1-6]|ul|ol|table|div|blockquote)[^>]*>/i.test(trimmed);
    const hasRawMarkdownHeadings = /\*\*\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡]|\*\*(?:Regla|Paso|Norma|Lectura|Definici[oó]n|Importante)[\s\w#º°\d]*:|\n•\s*\*\*|•\s+\*\*/.test(trimmed);
    
    if (hasRichTags && !hasRawMarkdownHeadings) {
      return trimmed;
    }

    let text = this.unglueText(trimmed);

    // Dividir en bloques por dobles saltos de línea
    const blocks = text.split(/\n{2,}/);
    const htmlBlocks = [];

    for (let b of blocks) {
      const block = b.trim();
      if (!block) continue;

      // 1. Títulos y Encabezados mayores numerados o con ### (ej. "**1. LA HISTORIA...**", "### 2. ...")
      const headingMatch = block.match(/^(?:#{1,3}\s+|\*{0,2})(\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡][^\n*]+?)\*{0,2}$/);
      if (headingMatch) {
        const title = headingMatch[1].replace(/[\*#]/g, '').trim();
        htmlBlocks.push(`<h2 style="color:#1e3a8a; margin-top:1.4rem; margin-bottom:0.6rem; font-size:1.18rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px; letter-spacing:-0.01em;">${this._escape(title)}</h2>`);
        continue;
      }

      // 2. Títulos de nivel H3 (ej. "### Subtítulo")
      const subHeadingMatch = block.match(/^#{3,4}\s+(.+)$/);
      if (subHeadingMatch) {
        const subTitle = subHeadingMatch[1].replace(/[\*#]/g, '').trim();
        htmlBlocks.push(`<h3 style="color:#1e293b; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.05rem; font-weight:700;">${this._escape(subTitle)}</h3>`);
        continue;
      }

      // 3. Reglas pedagógicas o Normas en caja destacada (Callout)
      // Ej: "**Regla número 1:** En cada habitación..."
      const ruleMatch = block.match(/^\*{0,2}((?:Regla(?:\s+n[úu]mero)?\s*\d+|Norma\s*\d+|Paso\s*\d+|Importante|Nota|Definici[oó]n)[\s\w#º°\d]*:)\*{0,2}\s*([\s\S]+)$/i);
      if (ruleMatch) {
        const ruleLabel = ruleMatch[1].replace(/[\*#]/g, '').trim();
        const ruleBody = this._formatInlineMarkdown(ruleMatch[2]);
        htmlBlocks.push(`<div class="notebook-callout concept" style="margin:0.8rem 0; padding:10px 14px; background:#eff6ff; border-left:4px solid #3b82f6; border-radius:4px; font-size:0.95rem; line-height:1.6;"><strong style="color:#1d4ed8;">${this._escape(ruleLabel)}</strong> ${ruleBody}</div>`);
        continue;
      }

      // 4. Bloques de viñetas o listas (líneas que inician con •, -, *)
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const isBulletList = lines.length > 0 && lines.every(l => /^[•\-\*]\s+/.test(l));
      if (isBulletList) {
        const listItemsHtml = lines.map(l => {
          const content = l.replace(/^[•\-\*]\s+/, '').trim();
          return `<li style="margin-bottom:0.35rem;">${this._formatInlineMarkdown(content)}</li>`;
        }).join('');
        htmlBlocks.push(`<ul style="margin:0.5rem 0 0.8rem 1.25rem; padding-left:1rem; line-height:1.6; color:#1e293b;">${listItemsHtml}</ul>`);
        continue;
      }

      // 5. Bloques de lista numerada (1. 2. 3.)
      const isNumberedList = lines.length > 0 && lines.every(l => /^\d+[\.\)]\s+/.test(l));
      if (isNumberedList) {
        const listItemsHtml = lines.map(l => {
          const content = l.replace(/^\d+[\.\)]\s+/, '').trim();
          return `<li style="margin-bottom:0.35rem;">${this._formatInlineMarkdown(content)}</li>`;
        }).join('');
        htmlBlocks.push(`<ol style="margin:0.5rem 0 0.8rem 1.25rem; padding-left:1rem; line-height:1.6; color:#1e293b;">${listItemsHtml}</ol>`);
        continue;
      }

      // 6. Si contiene viñetas intercaladas en el bloque
      if (lines.some(l => /^[•\-\*]\s+/.test(l))) {
        let currentP = [];
        let currentList = [];
        for (const line of lines) {
          if (/^[•\-\*]\s+/.test(line)) {
            if (currentP.length > 0) {
              htmlBlocks.push(`<p style="margin-bottom:0.6rem; line-height:1.6; text-align:justify;">${this._formatInlineMarkdown(currentP.join(' '))}</p>`);
              currentP = [];
            }
            const c = line.replace(/^[•\-\*]\s+/, '').trim();
            currentList.push(`<li style="margin-bottom:0.35rem;">${this._formatInlineMarkdown(c)}</li>`);
          } else {
            if (currentList.length > 0) {
              htmlBlocks.push(`<ul style="margin:0.5rem 0 0.8rem 1.25rem; padding-left:1rem; line-height:1.6; color:#1e293b;">${currentList.join('')}</ul>`);
              currentList = [];
            }
            currentP.push(line);
          }
        }
        if (currentList.length > 0) {
          htmlBlocks.push(`<ul style="margin:0.5rem 0 0.8rem 1.25rem; padding-left:1rem; line-height:1.6; color:#1e293b;">${currentList.join('')}</ul>`);
        }
        if (currentP.length > 0) {
          htmlBlocks.push(`<p style="margin-bottom:0.8rem; line-height:1.6; text-align:justify;">${this._formatInlineMarkdown(currentP.join(' '))}</p>`);
        }
        continue;
      }

      // Párrafo estándar
      const formattedPara = this._formatInlineMarkdown(block.replace(/\n/g, ' '));
      htmlBlocks.push(`<p style="margin-bottom:0.8rem; line-height:1.6; text-align:justify;">${formattedPara}</p>`);
    }

    return htmlBlocks.join('\n\n');
  }

  _formatInlineMarkdown(str) {
    if (!str) return '';
    let res = this._escape(str);
    res = res.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    res = res.replace(/(^|[^\*])\*([^\*]+?)\*([^\*]|$)/g, '$1<em>$2</em>$3');
    res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return res;
  }

  _escape(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Analiza un texto completo de planeación y devuelve una estructura semántica enriquecida
   */
  parse(rawText) {
    const text = this.normalizeImportedText(rawText);
    const result = {
      metadata: {
        subject: '',
        grade: '',
        sequenceNumber: null,
        duration: null,
        date: '',
        period: ''
      },
      curriculum: {
        topic: '',
        dba: '',
        achievement: '',
        periodTopics: [],
        periodPerformances: []
      },
      didacticSequence: {
        inicio: '',
        desarrollo: '',
        cierre: '',
        recursos: '',
        tareas: '',
        evaluation: '',
        durations: {}
      },
      teacherNotebook: {
        question: '',
        periodStructure: [],
        dynamics: '',
        rules: [],
        detailedContent: '',
        studentNotebookContent: '',
        practicalActivity: '',
        additionalNotes: '',
        sourceText: rawText || ''
      },
      detected: {
        generalInfo: false,
        topic: false,
        dba: false,
        achievement: false,
        periodTopics: false,
        periodPerformances: false,
        inicio: false,
        desarrollo: false,
        cierre: false,
        recursos: false,
        tareas: false,
        evaluation: false,
        observaciones: false,
        question: false,
        periodStructure: false,
        dynamics: false,
        rules: false,
        studentNotebook: false,
        practicalActivity: false
      },
      warnings: []
    };

    if (!text) {
      result.warnings.push('El texto pegado está vacío.');
      return result;
    }

    const lines = text.split('\n');
    let currentSection = null;
    const sectionBuffers = {
      generalInfo: [],
      periodTopics: [],
      periodPerformances: [],
      inicio: [],
      desarrollo: [],
      cierre: [],
      recursos: [],
      tareas: [],
      evaluation: [],
      observaciones: [],
      question: [],
      periodStructure: [],
      dynamics: [],
      rules: [],
      studentNotebook: [],
      practicalActivity: [],
      other: []
    };

    // Recorrido línea por línea
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const headingMatch = this.detectHeading(trimmed, currentSection);

      if (headingMatch) {
        currentSection = headingMatch.section;
        if (headingMatch.duration && headingMatch.sectionType) {
          result.didacticSequence.durations[headingMatch.sectionType] = headingMatch.duration;
        }
        // Si el encabezado traía contenido inline tras dos puntos
        if (headingMatch.inlineContent) {
          if (sectionBuffers[currentSection]) {
            sectionBuffers[currentSection].push(headingMatch.inlineContent);
          }
        }
        continue;
      }

      // Si no es un encabezado de sección mayor, verificar si es un campo de clave-valor (ej. Asignatura: Sistemas)
      const fieldMatch = this.detectInlineField(trimmed);
      if (fieldMatch) {
        this._applyInlineField(fieldMatch, result, currentSection);
        continue;
      }

      // Añadir línea al buffer de la sección activa actual
      if (currentSection && sectionBuffers[currentSection]) {
        sectionBuffers[currentSection].push(line);
      } else {
        sectionBuffers.other.push(line);
      }
    }

    // Consolidar buffers en resultado estructurado
    this._finalizeBuffers(sectionBuffers, result);

    // Generar advertencias amigables para campos no detectados
    this._generateWarnings(result);

    return result;
  }

  /**
   * Detecta si una línea corresponde a un encabezado de sección principal
   */
  detectHeading(line, currentSection = null) {
    if (!line) return null;
    const clean = line.replace(/^\s*[\*#\-•\d\.\s]+\s*/, '').replace(/[\*#_]/g, '').trim();
    const upper = clean.toUpperCase();

    // Extraer duración entre paréntesis si existe (ej. "(Tiempo: 20 minutos)", "(15 minutos)", "(35 min)")
    let duration = null;
    const durMatch = clean.match(/\((?:(?:Tiempo|Duración)[\s:]*)?(\d+)\s*(?:minutos?|mins?|m\b)?\)/i);
    if (durMatch) {
      duration = parseInt(durMatch[1], 10);
    }

    // 1. FASE DE INICIO
    if (/^(?:FASE\s+DE\s+INICIO|FASE\s+INICIAL|INICIO\s+DE\s+LA\s+CLASE|INICIO)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:FASE\s+DE\s+INICIO|FASE\s+INICIAL|INICIO\s+DE\s+LA\s+CLASE|INICIO)(?:\s*\([^)]*\))?\s*:?\s*/i, '').trim();
      return { section: 'inicio', sectionType: 'inicio', duration, inlineContent: inline || null };
    }

    // 2. FASE DE DESARROLLO
    if (/^(?:FASE\s+DE\s+DESARROLLO|DESARROLLO\s+DE\s+LA\s+CLASE|DESARROLLO|ACTIVIDADES\s+CENTRALES)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:FASE\s+DE\s+DESARROLLO|DESARROLLO\s+DE\s+LA\s+CLASE|DESARROLLO|ACTIVIDADES\s+CENTRALES)(?:\s*\([^)]*\))?\s*:?\s*/i, '').trim();
      return { section: 'desarrollo', sectionType: 'desarrollo', duration, inlineContent: inline || null };
    }

    // 3. FASE DE CIERRE
    if (/^(?:FASE\s+DE\s+CIERRE|CIERRE\s+DE\s+LA\s+CLASE|CIERRE|S[IÍ]NTESIS)\b/i.test(upper)) {
      if (currentSection === 'cierre') {
        if (/^CIERRE\s+Y\s+BALANCE\b/i.test(upper) || /^[•\-\*]/.test(line)) {
          return null;
        }
      }
      const inline = clean.replace(/^(?:FASE\s+DE\s+CIERRE|CIERRE\s+DE\s+LA\s+CLASE|CIERRE|S[IÍ]NTESIS)(?:\s*\([^)]*\))?\s*:?\s*/i, '').trim();
      return { section: 'cierre', sectionType: 'cierre', duration, inlineContent: inline || null };
    }

    // 4. TEMAS DEL PERIODO
    if (/^(?:TEMAS?\s+(?:DEL?\s+)?(?:(?:PRIMER|SEGUNDO|TERCER|CUARTO|[1-4][°º]?)\s+)?PER[IÍ]ODO|EJES?\s+TEM[AÁ]TICOS?\s+(?:DEL?\s+)?PER[IÍ]ODO)\b/i.test(upper)) {
      return { section: 'periodTopics' };
    }

    // 5. DESEMPEÑOS DEL PERIODO / APRENDIZAJE
    if (/^(?:DESEMPE[ÑN]OS?\s+(?:DE\s+APRENDIZAJE|DEL?\s+PER[IÍ]ODO)?|LOGROS?\s+(?:DEL?\s+)?PER[IÍ]ODO|INDICADORES?\s+DE\s+LOGRO)\b/i.test(upper)) {
      return { section: 'periodPerformances' };
    }

    // 6. RECURSOS DIDÁCTICOS Y MATERIALES
    if (/^(?:(?:RECURSOS\s+)?DID[AÁ]CTICOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|(?:RECURSOS\s+DID[AÁ]CTICOS|RECURSOS\s+Y\s+MATERIALES|MATERIALES\s+DID[AÁ]CTICOS|RECURSOS|MATERIALES))\b/i.test(upper)) {
      const inline = clean.replace(/^(?:(?:RECURSOS\s+)?DID[AÁ]CTICOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|(?:RECURSOS\s+DID[AÁ]CTICOS|RECURSOS\s+Y\s+MATERIALES|MATERIALES\s+DID[AÁ]CTICOS|RECURSOS|MATERIALES))\s*:?\s*/i, '').trim();
      return { section: 'recursos', inlineContent: inline || null };
    }

    // 7. TAREAS / COMPROMISOS / ACTIVIDADES EXTRACLASE
    if (/^(?:(?:TAREAS?(?:\s*[\/:]\s*COMPROMISOS?)?|\bCOMPROMISOS?)\s*[:\/-]?\s*(?:(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)?|ACTIVIDADES\s+EXTRACLASE|TRABAJO\s+EN\s+CASA)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:(?:TAREAS?(?:\s*[\/:]\s*COMPROMISOS?)?|\bCOMPROMISOS?)\s*[:\/-]?\s*(?:(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)?|ACTIVIDADES\s+EXTRACLASE|TRABAJO\s+EN\s+CASA)\s*:?\s*/i, '').trim();
      return { section: 'tareas', inlineContent: inline || null };
    }

    // OBSERVACIONES PEDAGÓGICAS
    if (/^(?:OBSERVACIONES\s+PEDAG[OÓ]GICAS(?:\s+DE\s+LA\s+SESI[OÓ]N)?|OBSERVACIONES(?:\s+DE\s+LA\s+SESI[OÓ]N)?)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:OBSERVACIONES\s+PEDAG[OÓ]GICAS(?:\s+DE\s+LA\s+SESI[OÓ]N)?|OBSERVACIONES(?:\s+DE\s+LA\s+SESI[OÓ]N)?)\s*:?\s*/i, '').trim();
      return { section: 'observaciones', inlineContent: inline || null };
    }

    // 8. EVALUACIÓN FORMATIVA
    // Si la línea es "Criterios de evaluación:" o "Instrumentos de evaluación:" dentro de la sección de evaluación, es contenido interno, NUNCA debe descartarse
    if (/^(?:CRITERIOS\s+DE\s+EVALUACI[OÓ]N|INSTRUMENTOS\s+DE\s+EVALUACI[OÓ]N)\b/i.test(upper)) {
      if (currentSection === 'evaluation') {
        return null;
      }
    }
    if (/^(?:EVALUACI[OÓ]N(?:\s+FORMATIVA)?|VALORACI[OÓ]N(?:\s+Y\s+SEGUIMIENTO)?|CRITERIOS\s+DE\s+EVALUACI[OÓ]N)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:EVALUACI[OÓ]N(?:\s+FORMATIVA)?|VALORACI[OÓ]N(?:\s+Y\s+SEGUIMIENTO)?|CRITERIOS\s+DE\s+EVALUACI[OÓ]N)\s*:?\s*/i, '').trim();
      return { section: 'evaluation', inlineContent: inline || null };
    }

    // 9. PREGUNTA PROBLEMATIZADORA / ORIENTADORA / GUÍA / PREGUNTA
    if (/^(?:PREGUNTA(?:\s+(?:PROBLEMATIZADORA|ORIENTADORA|GU[IÍ]A|CLAVE))?)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:PREGUNTA(?:\s+(?:PROBLEMATIZADORA|ORIENTADORA|GU[IÍ]A|CLAVE))?)\s*:?\s*/i, '').trim();
      return { section: 'question', inlineContent: inline || null };
    }

    // 10. ESTRUCTURA GENERAL DEL PERIODO
    if (/^(?:ESTRUCTURA\s+GENERAL\s+(?:DEL?\s+)?(?:(?:PRIMER|SEGUNDO|TERCER|CUARTO|[1-4][°º]?)\s+)?PER[IÍ]ODO|ESTRUCTURA\s+DEL?\s+PER[IÍ]ODO|TEMAS?\s+A\s+DESARROLLAR\s+POR\s+EJES?)\b/i.test(upper)) {
      return { section: 'periodStructure' };
    }

    // 11. DINÁMICA DE CLASE Y REGLAS
    if (/^(?:DIN[AÁ]MICA\s+DE\s+CLASE(?:\s+Y\s+REGLAS?(?:\s+DE\s+JUEGO)?)?|DIN[AÁ]MICA|METODOLOG[IÍ]A\s+DE\s+CLASE)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:DIN[AÁ]MICA\s+DE\s+CLASE(?:\s+Y\s+REGLAS?(?:\s+DE\s+JUEGO)?)?|DIN[AÁ]MICA|METODOLOG[IÍ]A\s+DE\s+CLASE)\s*:?\s*/i, '').trim();
      return { section: 'dynamics', inlineContent: inline || null };
    }

    if (/^(?:REGLAS?\s+DE\s+JUEGO|NORMAS?\s+DE\s+CLASE|PACTA\s+DE\s+AULA|NORMAS?)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:REGLAS?\s+DE\s+JUEGO|NORMAS?\s+DE\s+CLASE|PACTA\s+DE\s+AULA|NORMAS?)\s*:?\s*/i, '').trim();
      return { section: 'rules', inlineContent: inline || null };
    }

    // 12. GUÍA DE CONTENIDO PARA EL CUADERNO DEL ESTUDIANTE
    if (/^(?:GU[IÍ]A\s+DE\s+CONTENIDO\s+(?:DETALLADA\s+)?PARA\s+EL\s+CUADERNO\s+(?:DEL\s+ESTUDIANTE)?|CONTENIDO\s+(?:PARA\s+EL\s+)?(?:ESTUDIANTE|CUADERNO)|CONTENIDO\s+DEL\s+ESTUDIANTE|TEXTO\s+DEL\s+ESTUDIANTE|CUADERNO\s+DEL\s+ESTUDIANTE)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:GU[IÍ]A\s+DE\s+CONTENIDO\s+(?:DETALLADA\s+)?PARA\s+EL\s+CUADERNO\s+(?:DEL\s+ESTUDIANTE)?|CONTENIDO\s+(?:PARA\s+EL\s+)?(?:ESTUDIANTE|CUADERNO)|CONTENIDO\s+DEL\s+ESTUDIANTE|TEXTO\s+DEL\s+ESTUDIANTE|CUADERNO\s+DEL\s+ESTUDIANTE)\s*:?\s*/i, '').trim();
      return { section: 'studentNotebook', inlineContent: inline || null };
    }

    // 13. TALLER / ACTIVIDAD PRÁCTICA (Cuaderno del Docente / Guía)
    if (/^(?:TALLER\s*(?:[\/:]\s*(?:ACTIVIDAD|EJERCICIO)\s+PR[AÁ]CTICO(?:\s+DE\s+LA\s+CLASE)?|\s+PR[AÁ]CTICO(?:\s+DE\s+LA\s+CLASE)?|\s+DE\s+APLICACI[OÓ]N(?:\s+EN\s+CLASE)?(?:\s*#?\s*\d+)?|\s+EN\s+CLASE(?:\s*#?\s*\d+)?)|\bACTIVIDAD\s+PR[AÁ]CTICA(?:\s+DE\s+LA\s+CLASE)?|\bEJERCICIO\s+PR[AÁ]CTICO)\b/i.test(upper)) {
      const inDidactic = ['inicio', 'desarrollo', 'cierre', 'recursos', 'tareas', 'evaluation', 'observaciones'].includes(currentSection);
      const isExplicitHeading = /^(?:TALLER\s*[\/:]\s*ACTIVIDAD|ACTIVIDAD\s+PR[AÁ]CTICA\s+DE\s+LA\s+CLASE|TALLER\s+DE\s+APLICACI[OÓ]N\s+EN\s+CLASE)/i.test(upper) || /PARTE\s+2/i.test(upper);
      if (inDidactic && !isExplicitHeading) {
        return null;
      }
      const inline = clean.replace(/^(?:TALLER(?:\s*[\/:]\s*(?:ACTIVIDAD|EJERCICIO)\s+PR[AÁ]CTICO(?:\s+DE\s+LA\s+CLASE)?)?|ACTIVIDAD\s+PR[AÁ]CTICA(?:\s+DE\s+LA\s+CLASE)?|EJERCICIO\s+PR[AÁ]CTICO|TALLER\s+EN\s+CLASE(?:\s*#?\s*\d+)?|TALLER\s+DE\s+APLICACI[OÓ]N(?:\s+EN\s+CLASE)?(?:\s*#?\s*\d+)?)\s*:?\s*/i, '').trim();
      return { section: 'practicalActivity', inlineContent: inline || null };
    }

    // 14. ENCABEZADOS DE PARTE O INFORMACIÓN GENERAL
    if (/^(?:PARTE\s+1|INFORMACI[OÓ]N\s+GENERAL|DATOS\s+GENERALES)\b/i.test(upper)) {
      return { section: 'generalInfo' };
    }

    if (/^(?:PARTE\s+2|CUADERNO\s+DEL\s+DOCENTE|GU[IÍ]A\s+DETALLADA(?:\s+DE\s+CLASE)?|PLANEACI[OÓ]N\s+DE\s+CLASE)\b/i.test(upper)) {
      return { section: 'other' };
    }

    return null;
  }

  /**
   * Detecta campos estructurados clave: valor en una sola línea (Asignatura: ..., Grado: ...)
   */
  detectInlineField(line) {
    if (!line || !line.includes(':')) return null;
    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) return null;

    const rawKey = trimmed.substring(0, colonIdx);
    const cleanKey = rawKey.replace(/^[\s\*#\-•]+/, '').replace(/[\*#_]/g, '').trim().toUpperCase();
    const rawValue = trimmed.substring(colonIdx + 1).trim();
    // Limpiar asteriscos de negrita al inicio y final del valor si la clave tenía formato **Clave:** **Valor**
    const value = rawValue.replace(/^[\s\*#_]+/, '').replace(/[\s\*#_]+$/, '').trim();

    if (/^(?:ASIGNATURA|MATERIA|ÁREA)\b/i.test(cleanKey)) {
      return { field: 'subject', value };
    }
    if (/^(?:GRADO|CURSO)\b/i.test(cleanKey)) {
      return { field: 'grade', value };
    }
    if (/^(?:CLASE\s*#?|CLASE\s+N[°º]|SESI[OÓ]N\s*(?:#|N[°º])?)\b/i.test(cleanKey)) {
      const hasNum = /\d+/.test(cleanKey) || /\d+/.test(value);
      if (!hasNum) return null;
      return { field: 'sequenceNumber', value };
    }
    if (/^(?:TIEMPO(?:\s+DISPONIBLE)?|DURACI[OÓ]N)\b/i.test(cleanKey)) {
      return { field: 'duration', value };
    }
    if (/^(?:FECHA\s+L[IÍ]MITE(?:\s+(?:DE\s+FINALIZACI[OÓ]N\s+)?DEL\s+PERIODO)?|FECHA)\b/i.test(cleanKey)) {
      return { field: 'date', value };
    }
    if (/^(?:EJE\s+TEM[AÁ]TICO\s+PRINCIPAL|EJE\s+TEM[AÁ]TICO|TEMA\s+PRINCIPAL|TEMA)\b/i.test(cleanKey)) {
      return { field: 'topic', value };
    }
    if (/^(?:DBA|DERECHOS?\s+B[AÁ]SICOS?\s+DE\s+APRENDIZAJE)\b/i.test(cleanKey)) {
      return { field: 'dba', value };
    }
    if (/^(?:LOGRO|DESEMPE[ÑN]O(?:\s+DE\s+APRENDIZAJE)?|INDICADOR(?:\s+DE\s+LOGRO)?)\b/i.test(cleanKey)) {
      return { field: 'achievement', value };
    }
    if (/^(?:PREGUNTA(?:\s+(?:PROBLEMATIZADORA|ORIENTADORA|GU[IÍ]A|CLAVE))?)\b/i.test(cleanKey)) {
      return { field: 'question', value };
    }
    if (/^(?:CONTENIDO\s+(?:PARA\s+EL\s+)?(?:ESTUDIANTE|CUADERNO)|CONTENIDO\s+DEL\s+ESTUDIANTE|CUADERNO(?:\s+DEL\s+ESTUDIANTE)?|GU[IÍ]A\s+DEL\s+ESTUDIANTE)\b/i.test(cleanKey)) {
      return { field: 'studentNotebook', value };
    }
    if (/^(?:TALLER|ACTIVIDAD\s+PR[AÁ]CTICA|EJERCICIO\s+PR[AÁ]CTICO)\b/i.test(cleanKey)) {
      return { field: 'practicalActivity', value };
    }
    if (/^(?:(?:RECURSOS\s+)?DID[AÁ]CTICOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|(?:RECURSOS\s+DID[AÁ]CTICOS|RECURSOS\s+Y\s+MATERIALES|MATERIALES\s+DID[AÁ]CTICOS|RECURSOS|MATERIALES))\b/i.test(cleanKey)) {
      return { field: 'recursos', value };
    }
    if (/^(?:(?:TAREAS?(?:\s*[\/:]\s*COMPROMISOS?)?|\bCOMPROMISOS?)\s*[:\/-]?\s*(?:(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)?|ACTIVIDADES\s+EXTRACLASE|TRABAJO\s+EN\s+CASA)\b/i.test(cleanKey)) {
      return { field: 'tareas', value };
    }

    return null;
  }

  _applyInlineField(fieldMatch, result, currentSection = null) {
    const val = fieldMatch.value;
    switch (fieldMatch.field) {
      case 'subject':
        result.metadata.subject = val;
        break;
      case 'grade':
        result.metadata.grade = val;
        break;
      case 'sequenceNumber': {
        // No sobreescribir si ya fue extraído en información general o si estamos en una sección didáctica
        if (result.metadata.sequenceNumber !== null && currentSection && currentSection !== 'generalInfo') {
          break;
        }
        const numMatch = val.match(/(?:#|N[°º]|clase\s*#?)?\s*(\d+)/i);
        const num = numMatch ? parseInt(numMatch[1], 10) : parseInt(val.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num)) result.metadata.sequenceNumber = num;
        break;
      }
      case 'duration': {
        const minMatch = val.match(/(\d+)\s*(?:minutos?|mins?|m\b)/i);
        const hourMatch = val.match(/(\d+)\s*(?:horas?|hrs?|h\b)/i);
        let num = NaN;
        if (minMatch) {
          num = parseInt(minMatch[1], 10);
        } else if (hourMatch) {
          num = parseInt(hourMatch[1], 10) * 60;
        } else {
          num = parseInt(val.replace(/[^0-9]/g, ''), 10);
        }
        if (!isNaN(num)) result.metadata.duration = num;
        break;
      }
      case 'date': {
        const trimmedVal = val.trim();
        const isPlaceholder = /^\[.*\]$/.test(trimmedVal) || /^(escribir|fecha|sesi[oó]n|dd|mm|aaaa)/i.test(trimmedVal);
        result.metadata.date = isPlaceholder ? '' : trimmedVal;
        break;
      }
      case 'topic':
        result.curriculum.topic = val;
        result.detected.topic = true;
        break;
      case 'dba':
        result.curriculum.dba = val;
        result.detected.dba = true;
        break;
      case 'achievement':
        result.curriculum.achievement = val;
        result.detected.achievement = true;
        break;
      case 'question':
        result.teacherNotebook.question = val;
        result.detected.question = true;
        break;
      case 'studentNotebook':
        result.teacherNotebook.studentNotebookContent = val;
        result.detected.studentNotebook = true;
        break;
      case 'practicalActivity':
        result.teacherNotebook.practicalActivity = val;
        result.detected.practicalActivity = true;
        break;
      case 'recursos': {
        const cleaned = val.replace(/^(?:(?:RECURSOS\s+)?DID[AÁ]CTICOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|(?:RECURSOS\s+DID[AÁ]CTICOS|RECURSOS\s+Y\s+MATERIALES|MATERIALES\s+DID[AÁ]CTICOS|RECURSOS|MATERIALES))\s*:?\s*/i, '').trim();
        result.didacticSequence.recursos = cleaned;
        result.detected.recursos = true;
        break;
      }
      case 'tareas': {
        const cleaned = val.replace(/^(?:(?:TAREAS?(?:\s*[\/:]\s*COMPROMISOS?)?|\bCOMPROMISOS?)\s*[:\/-]?\s*(?:(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)?|ACTIVIDADES\s+EXTRACLASE|TRABAJO\s+EN\s+CASA)\s*:?\s*/i, '').trim();
        result.didacticSequence.tareas = cleaned;
        result.detected.tareas = true;
        break;
      }
    }
  }

  _finalizeBuffers(buffers, result) {
    // Listas como arrays limpios (viñetas •, -, *)
    result.curriculum.periodTopics = this.extractListItems(buffers.periodTopics);
    if (result.curriculum.periodTopics.length > 0) result.detected.periodTopics = true;

    result.curriculum.periodPerformances = this.extractListItems(buffers.periodPerformances);
    if (result.curriculum.periodPerformances.length > 0) result.detected.periodPerformances = true;

    result.teacherNotebook.periodStructure = this.extractListItems(buffers.periodStructure);
    if (result.teacherNotebook.periodStructure.length > 0) result.detected.periodStructure = true;

    result.teacherNotebook.rules = this.extractListItems(buffers.rules);
    if (result.teacherNotebook.rules.length > 0) result.detected.rules = true;

    // Fases didácticas como texto estructurado multilínea
    result.didacticSequence.inicio = this.cleanBrokenLinebreaks(buffers.inicio.join('\n'));
    if (result.didacticSequence.inicio) result.detected.inicio = true;

    result.didacticSequence.desarrollo = this.cleanBrokenLinebreaks(buffers.desarrollo.join('\n'));
    if (result.didacticSequence.desarrollo) result.detected.desarrollo = true;

    result.didacticSequence.cierre = this.cleanBrokenLinebreaks(buffers.cierre.join('\n'));
    if (result.didacticSequence.cierre) result.detected.cierre = true;

    result.didacticSequence.recursos = this.cleanBrokenLinebreaks(buffers.recursos.join('\n')
      .replace(/^(?:(?:RECURSOS\s+)?DID[AÁ]CTICOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|RECURSOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|(?:Y\s+)?MATERIALES(?:\s+DID[AÁ]CTICOS)?)\s*:?\s*/i, ''));
    if (result.didacticSequence.recursos) result.detected.recursos = true;

    result.didacticSequence.tareas = this.cleanBrokenLinebreaks(buffers.tareas.join('\n')
      .replace(/^(?:(?:TAREAS?(?:\s*[\/:]\s*COMPROMISOS?)?|\bCOMPROMISOS?)\s*[:\/-]?\s*(?:(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)?|[\/:]?\s*(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)\s*:?\s*/i, ''));
    if (result.didacticSequence.tareas) result.detected.tareas = true;

    result.didacticSequence.evaluation = this.cleanBrokenLinebreaks(buffers.evaluation.join('\n'));
    if (result.didacticSequence.evaluation) result.detected.evaluation = true;

    result.didacticSequence.observaciones = this.cleanBrokenLinebreaks((buffers.observaciones || []).join('\n')
      .replace(/^(?:OBSERVACIONES\s+PEDAG[OÓ]GICAS(?:\s+DE\s+LA\s+SESI[OÓ]N)?|OBSERVACIONES(?:\s+DE\s+LA\s+SESI[OÓ]N)?)\s*:?\s*/i, ''));
    if (result.didacticSequence.observaciones) {
      result.observations = result.didacticSequence.observaciones;
      result.detected.observaciones = true;
    }

    // Cuaderno del docente
    if (!result.teacherNotebook.question && buffers.question.length > 0) {
      result.teacherNotebook.question = buffers.question.join('\n').trim();
    }
    if (result.teacherNotebook.question) result.detected.question = true;

    result.teacherNotebook.dynamics = buffers.dynamics.join('\n').trim();
    if (result.teacherNotebook.dynamics) result.detected.dynamics = true;

    if (!result.teacherNotebook.studentNotebookContent && buffers.studentNotebook.length > 0) {
      result.teacherNotebook.studentNotebookContent = buffers.studentNotebook.join('\n').trim();
    } else if (buffers.studentNotebook.length > 0) {
      result.teacherNotebook.studentNotebookContent += '\n' + buffers.studentNotebook.join('\n').trim();
    }
    if (result.teacherNotebook.studentNotebookContent) result.detected.studentNotebook = true;

    if (!result.teacherNotebook.practicalActivity && buffers.practicalActivity.length > 0) {
      result.teacherNotebook.practicalActivity = buffers.practicalActivity.join('\n').trim();
    } else if (buffers.practicalActivity.length > 0) {
      result.teacherNotebook.practicalActivity += '\n' + buffers.practicalActivity.join('\n').trim();
    }
    if (result.teacherNotebook.practicalActivity) result.detected.practicalActivity = true;

    if (result.metadata.subject || result.metadata.grade || result.metadata.sequenceNumber) {
      result.detected.generalInfo = true;
    }

    result.metadata.hasPart1 = Boolean(result.detected.inicio || result.detected.desarrollo || result.detected.cierre || result.curriculum.topic);
    result.metadata.hasPart2 = Boolean(result.detected.question || result.detected.studentNotebook || result.detected.practicalActivity || result.detected.periodStructure);
    result.general = result.metadata; // Alias de compatibilidad total
  }

  /**
   * Extrae elementos de lista respetando números de pasos ("Paso 1", "1.", "-")
   */
  extractListItems(linesArray) {
    if (!Array.isArray(linesArray) || linesArray.length === 0) return [];
    const items = [];
    let currentItem = '';

    linesArray.forEach(l => {
      const trimmed = l.trim();
      if (!trimmed) return;

      const isBullet = /^[•\-\*\+]\s+/.test(trimmed);
      const isNumbered = /^\d+[\.\)]\s+/.test(trimmed);
      const isStep = /^Paso\s+\d+[:\.]/i.test(trimmed);

      if (isBullet || isNumbered || isStep) {
        if (currentItem) items.push(currentItem);
        currentItem = trimmed.replace(/^[•\-\*\+]\s+/, '').trim();
      } else {
        if (currentItem) {
          currentItem += '\n' + trimmed;
        } else {
          currentItem = trimmed;
        }
      }
    });

    if (currentItem) items.push(currentItem);
    return items;
  }

  _generateWarnings(result) {
    if (!result.detected.topic) {
      result.warnings.push('No se detectó un Eje Temático o Tema principal de la clase.');
    }
    if (!result.detected.inicio) {
      result.warnings.push('No se detectó la Fase de Inicio.');
    }
    if (!result.detected.desarrollo) {
      result.warnings.push('No se detectó la Fase de Desarrollo.');
    }
    if (!result.detected.cierre) {
      result.warnings.push('No se detectó la Fase de Cierre.');
    }
    if (!result.detected.dba) {
      result.warnings.push('No se detectó un DBA específico (se conservará el actual si existe).');
    }
    if (!result.detected.achievement) {
      result.warnings.push('No se detectó un Logro / Desempeño (se conservará el actual si existe).');
    }
  }
}

const ImportParser = new ImportParserClass();

if (typeof window !== 'undefined') {
  window.ImportParser = ImportParser;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImportParser;
}
