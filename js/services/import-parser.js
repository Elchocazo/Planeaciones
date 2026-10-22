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
   * Sanitiza y elimina artefactos técnicos de LaTeX, Markdown roto y etiquetas en cualquier texto o documento:
   * - Elimina comandos de LaTeX (\text{...}, /text{...}, \textbf{...}, \mathrm{...})
   * - Convierte operadores LaTeX a símbolos escolares legibles (×, ÷, ·, ±, ≤, ≥, ≠, ≈, a/b)
   * - Elimina signos de dólar ($ y $$)
   * - Elimina llaves huérfanas de LaTeX ({})
   * - Elimina asteriscos huérfanos (** residuales, ""**, -> **, • *)
   */
  cleanDocumentArtifacts(text) {
    if (!text || typeof text !== 'string') return '';
    // Salvaguardar imágenes para no procesar ni corromper bloques pesados de base64 con regex
    const hasImages = text.includes('<img') || text.includes('data:image/');
    let imagePlaceholders = null;
    let str = text;

    if (hasImages) {
      imagePlaceholders = [];
      str = str.replace(/<img\b[^>]*>/gi, (m) => {
        const ph = `___IMG_SHIELD_${imagePlaceholders.length}___`;
        imagePlaceholders.push(m);
        return ph;
      });
    }

    // 1 & 2. Limpiar comandos y operadores LaTeX solo si existen barras o secuencias /text
    if (str.includes('\\') || str.includes('/text') || str.includes('/Text') || str.includes('\x09ext')) {
      str = str.replace(/(?:\\[tT]ext|\/[tT]ext|\x09ext|\\textbf|\\textit|\\mathrm|\\mathbf|\\textnormal|\\mbox)\s*\{([^}]*)\}/gi, '$1');
      str = str.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1');
      str = str.replace(/\\times\b/g, '×');
      str = str.replace(/\\div\b/g, '÷');
      str = str.replace(/\\cdot\b/g, '·');
      str = str.replace(/\\pm\b/g, '±');
      str = str.replace(/\\(?:le|leq)\b/g, '≤');
      str = str.replace(/\\(?:ge|geq)\b/g, '≥');
      str = str.replace(/\\neq\b/g, '≠');
      str = str.replace(/\\approx\b/g, '≈');
      str = str.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
    }

    // 3. Limpiar signos de dólar $ y $$ que envuelven texto, números o comparaciones
    if (str.includes('$')) {
      str = str.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
      str = str.replace(/\$([^\$\n\r]+?)\$/g, '$1');
      str = str.replace(/\$/g, '');
    }

    // 4. Limpiar llaves huérfanas de LaTeX restantes sin destruir llaves de código { ... } o conjuntos matemáticos {1, 2}
    if (str.includes('{')) {
      str = str.replace(/\{([^{}\n\r]*)\}/g, (m, inside) => {
        if (/[0-9a-zA-Z_]\s*,\s*[0-9a-zA-Z_]/.test(inside) || /^(?:\s*|;|return|if|for|void|int|const|Servo)\b/.test(inside)) {
          return m;
        }
        return inside;
      });
      str = str.replace(/\{\s*\}/g, '');
    }

    // 5, 6, 7. Limpiar asteriscos huérfanos y artefactos de viñeta
    if (str.includes('*') || str.includes('->') || str.includes('\n')) {
      if (str.includes('*')) {
        str = str.replace(/""\*{1,3}/g, '"');
        str = str.replace(/''\*{1,3}/g, "'");
      }
      if (str.includes('->')) {
        str = str.replace(/->\s*\*{0,2}/g, '-> ');
      }
      if (str.includes('\n') || str.length <= 6) {
        str = str.replace(/(?:^|\n)\s*(?:•\s*)?[\*•\-\–—_]{1,3}\s*(?=\n|$)/g, '\n');
      }
      if (str.includes('*')) {
        // Proteger asteriscos aritméticos como multiplicación (ej. "(-4) * (+6)", "3 * 5")
        // SOLO si están entre operandos aritméticos o paréntesis, nunca entre asteriscos **
        const mathMults = [];
        str = str.replace(/(?<=[a-zA-Z0-9\)\%\|])\s*\*\s*(?=[a-zA-Z0-9\(\-\|])/g, (match) => {
          const ph = `___MATH_MULT_CLEAN_${mathMults.length}___`;
          mathMults.push(match);
          return ph;
        });

        str = str.replace(/(?<=[^\*\s])\*{1,3}(?=[^\*]|$)/g, '');
        str = str.replace(/\*{1,3}/g, '');
        str = str.replace(/(?<!\([^\n\)]*)\s*\*{1,2}\)\s*(?=\n|•|$)/g, '');

        if (mathMults.length > 0) {
          mathMults.forEach((multStr, idx) => {
            str = str.replace(`___MATH_MULT_CLEAN_${idx}___`, multStr);
          });
        }
      }
    }

    // 8. Limpiar artefactos de visores PDF (ej. "PDF+ 1", "PDF+ 4", "PDF+", "50 PDF")
    if (/PDF/i.test(str)) {
      str = str.replace(/\bPDF\s*\+\s*\d+\b/gi, '');
      str = str.replace(/\bPDF\+\b/gi, '');
      str = str.replace(/(?<=[0-9a-zA-Z\)\.\,\-])\s+PDF\b/gi, '');
      str = str.replace(/\bPDF\s*$/gmi, '');
    }

    // 9. Limpiar encabezados Markdown vacíos o huérfanos (ej. "##", "###")
    str = str.replace(/(?:^|\n)\s*#{1,6}\s*(?=\n|$)/g, '\n');

    // 10. Limpiar chinchetas o pines pegados en opciones múltiples (ej. "📌 C) ", "📌 A)")
    str = str.replace(/(?:^|\n)\s*📌\s*(\(?[a-dA-D][\.\)])/g, '\n$1');

    if (imagePlaceholders && imagePlaceholders.length > 0) {
      imagePlaceholders.forEach((imgTag, idx) => {
        str = str.replace(`___IMG_SHIELD_${idx}___`, imgTag);
      });
    }

    return str;
  }

  /**
   * Despega y estructura texto plano cuando viene colapsado o sin saltos de línea (ej. copiado desde chats como Gemini o celdas de tabla)
   */
  unglueText(text) {
    if (!text || typeof text !== 'string') return '';
    const hasImages = text.includes('<img') || text.includes('data:image/');
    let imagePlaceholders = null;
    let sourceText = text;
    if (hasImages) {
      imagePlaceholders = [];
      sourceText = sourceText.replace(/<img\b[^>]*>/gi, (m) => {
        const ph = `___IMG_SHIELD_${imagePlaceholders.length}___`;
        imagePlaceholders.push(m);
        return ph;
      });
    }

    let clean = this.cleanDocumentArtifacts(sourceText)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();

    // 0. Despegar uniones cuando una minúscula, dígito o cierre de paréntesis/punto está pegada a un campo o fase institucional conocida: ej. "noviembreEje", "minutosSaludo", "4Tiempo", "correspondiente.Reglas"
    clean = clean.replace(/([a-záéíóúñ0-9\)\].])(Eje\s+tem[aá]tico|Tema|Fase\s+de|Fase\s+inicial|Fase\s+central|Fase\s+final|Inicio|Desarrollo|Cierre|Recursos|Materiales|Tareas?|Compromisos?|Evaluaci[oó]n\s+formativa|Observaciones|Asignatura|Materia|Grado|Curso|Clase|Tiempo|Duraci[oó]n|Fecha|DBA|Logros?|Desempe[ñn]os?|Pregunta|Cuaderno|Informaci[oó]n|Secuencia|Din[aá]mica|Reglas?|Normas?|T[ií]tulo)\b/g, '$1\n$2');

    // 1. Despegar uniones de siglas/mayúsculas seguidas de palabra capitalizada: ej. "GENERALAsignatura", "INSTITUCIONALAsignatura", "ESTUDIANTETítulo"
    clean = clean.replace(/([A-ZÁÉÍÓÚÑ]{2,})([A-ZÁÉÍÓÚÑ][a-záéíóúñ])/g, '$1\n$2');

    // 2. Despegar uniones de mayúsculas continuas conocidas exclusivamente en mayúsculas: ej. "INSTITUCIONALINFORMACIÓN"
    clean = clean.replace(/([A-ZÁÉÍÓÚÑ]{3,})(INFORMACI[OÓ]N|SECUENCIA|CUADERNO|FASE|RECURSOS|MATERIALES|TAREAS|EVALUACI[OÓ]N|OBSERVACIONES|ASIGNATURA|GRADO|CLASE|TIEMPO|TEMA|DBA|LOGRO|DESEMPE[ÑN]O|DIN[AÁ]MICA|REGLAS|TALLER|T[IÍ]TULO)/g, (match, p1, p2) => {
      if (p1.endsWith('EXTRA') && p2 === 'CLASE') return match;
      return p1 + '\n\n' + p2;
    });

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
      'EVALUACI[OÓ]N\\s+FORMATIVA',
      'VALORACI[OÓ]N(?:\\s+Y\\s+SEGUIMIENTO)?',
      'CRITERIOS\\s+DE\\s+EVALUACI[OÓ]N',
      'EVALUACI[OÓ]N(?=\\s*[:\\/\\-\\n\\(]|\\s*$)',
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
      'TALLER(?:\\s*(?:[\\/:\\-]?\\s*(?:ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)?\\s*PR[AÁ]CTIC[OA]S?(?:\\s+DE\\s+LA\\s+CLASE)?|PR[AÁ]CTIC[OA]S?(?:\\s+DE\\s+LA\\s+CLASE)?|DE\\s+APLICACI[OÓ]N(?:\\s+EN\\s+CLASE)?(?:\\s*#?\\s*\\d+)?|EN\\s+CLASE(?:\\s*#?\\s*\\d+)?|[\\/:\\-]\\s*(?:ACTIVIDAD(?:ES)?|EJERCICIOS?|GU[IÍ]A|EVALUACI[OÓ]N)|DE\\s+EJERCICIOS|PEDAG[OÓ]GICO|FORMATIVO|INDIVIDUAL|GRUPAL))?',
      'ACTIVIDAD(?:ES)?\\s+PR[AÁ]CTIC[OA]S?(?:\\s+DE\\s+LA\\s+CLASE)?',
      'EJERCICIO(?:S)?\\s+PR[AÁ]CTIC[OA]S?(?:\\s+DE\\s+LA\\s+CLASE)?',
      'NOTAS?\\s+ADICIONALES(?:\\s+DEL\\s+DOCENTE)?',
      'OBSERVACIONES\\s+DEL\\s+DOCENTE(?:\\s+PARA\\s+LA\\s+CLASE)?',
      'PREGUNTA\\s+(?:PROBLEMATIZADORA|ORIENTADORA|GU[IÍ]A|CLAVE)'
    ].join('|');

    const headingRegex = new RegExp('([^\\n*#])[ \\t]*(\\*{0,2})(' + majorHeadings + ')(\\*{0,2})', 'gi');
    clean = clean.replace(headingRegex, (match, p1, starsBefore, p2, starsAfter, offset, fullStr) => {
      const prefixBefore = fullStr.substring(Math.max(0, offset - 80), offset + p1.length);

      // Si la coincidencia viene precedida de dos puntos (:) o forma parte de un valor tras dos puntos en la misma línea,
      // NUNCA debe separarse con salto de línea (ej. "Eje temático principal: Taller...", "Evidencias de aprendizaje: Taller...", "PARTE 1: Secuencia...")
      if (p1 === ':' || /:[^\n]*$/i.test(prefixBefore)) {
        return p1 + ' ' + (starsBefore || '') + p2 + (starsAfter || '');
      }

      if (/PARTE\s+[12]:?\s*$/i.test(prefixBefore.trim())) return p1 + ' ' + (starsBefore || '') + p2 + (starsAfter || '');
      
      // No separar si es un encabezado compuesto institucional como "RECURSOS DIDÁCTICOS: Y MATERIALES" o "TAREAS / COMPROMISOS: Y ACTIVIDADES EXTRACLASE"
      if (/(?:RECURSOS|DID[AÁ]CTICOS|TAREAS?|COMPROMISOS?)\s*[:\/-]?\s*(?:Y\s*)?$/i.test(prefixBefore)) {
        return p1 + ' ' + (starsBefore || '') + p2 + (starsAfter || '');
      }

      // No separar si la palabra está precedida por preposiciones, artículos o frases conectivas
      // (ej. "Criterios de evaluación", "Instrumentos de evaluación", "el taller práctico", "dicho taller", "tema: Evaluación")
      if (/\b(?:criterios|instrumentos|r[úu]bricas?|estrategias?|momentos?|tipos?|proceso|gu[ií]a|formato|uso|entrega|asignaci[oó]n|revisi[oó]n|an[aá]lisis|eje|tema|t[ií]tulo|principal|general|evidencias?|desarrollo|encuadre|din[aá]mica|reglas?|sobre|para|con|por|sin|hacia|mediante|seg[úu]n|de|del|la|el|los|las|un|una|unos|unas|este|esta|estos|estas|dicho|dicha|cada|su|sus|y|o|que)\s*(?:de|del|sobre|para|:)?$/i.test(prefixBefore)) {
        return p1 + ' ' + (starsBefore || '') + p2 + (starsAfter || '');
      }

      return p1 + '\n\n' + (starsBefore || '') + p2 + (starsAfter || '');
    });

    // Separar PARTE 1 / PARTE 2
    clean = clean.replace(/([^\n*])\s*(\*{0,2})(PARTE\s+[12]\s*:?)(\*{0,2})/gi, '$1\n\n$2$3$4');

    // 3b. Despegar secciones estructurales del planeador / cuaderno en mayúsculas sostenidas
    clean = clean.replace(/([^\n])\s+((?:TEMAS\s+(?:DEL\s+)?(?:PRIMER|SEGUNDO|TERCER|CUARTO|[1-4][°º]?)\s+PER[IÍ]ODO|DESEMPEÑOS?\s+DE\s+APRENDIZAJE|CRITERIOS?\s+DE\s+EVALUACI[OÓ]N|INSTRUMENTOS?\s+DE\s+EVALUACI[OÓ]N|EJES?\s+TEM[AÁ]TICOS?|ACTIVIDADES?\s+DE\s+APRENDIZAJE)\b)(?!\s*(?:principal)?[\\s:]*:)/gi, '$1\n\n## $2\n\n');

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
      'Desempeño\\s*\\/\\s*Logro(?:\\s+de\\s+aprendizaje)?',
      'Logro\\s*\\/\\s*Desempeño(?:\\s+de\\s+aprendizaje)?',
      'Logro',
      'Desempeño(?:\\s+de\\s+aprendizaje)?',
      'Indicador(?:\\s+de\\s+logro)?',
      'Título(?:\\s+del\\s+tema)?',
      'Institución'
    ].join('|');

    // Despegar campos cuando están inmediatamente unidos a texto o números previos: ej. "NovenoClase:", "4Tiempo:", "minutosEje temático:"
    const unglueFieldRegex = new RegExp('([a-záéíóúñ0-9A-ZÁÉÍÓÚÑ\\)\\]])(\\*{0,2})(' + inlineFields + ')(\\*{0,2})\\s*:', 'gi');
    clean = clean.replace(unglueFieldRegex, (match, charBefore, stars1, fieldName, stars2, offset, fullStr) => {
      const prefixBefore = fullStr.substring(Math.max(0, offset - 40), offset + charBefore.length);
      if (/(?:la|el|de|del|en|para|por|sobre|esta|cada|nuestra|durante|su|sus)\s*$/i.test(prefixBefore)) {
        return match;
      }
      return charBefore + '\n' + (stars1 || '') + fieldName + (stars2 || '') + ':';
    });

    const fieldRegex = new RegExp('(?:^|[^\\w(*áéíóúñÁÉÍÓÚÑ])(\\*{0,2})(' + inlineFields + ')(\\*{0,2})\\s*:', 'gi');
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

    // 4b. Despegar subtítulos con dos puntos dentro de párrafos monoliticos: ej. ". Correo electrónico:", ". Herramientas de chat:"
    clean = clean.replace(/(?<!\b\d)([.)])\s+([A-ZÁÉÍÓÚÑ][^:\n\r]{2,55}:)(?=\s+[A-ZÁÉÍÓÚÑa-záéíóúñ0-9«\"]|\s*$)/g, '$1\n• $2');

    // 4b2. Despegar instrucciones numeradas con dos puntos seguidas de incisos con letras (ej. "1. Resuelve las siguientes operaciones:\na)")
    clean = clean.replace(/(^|\n)(\d+[\.\)]\s+[^\n:]{2,80}:)\s*\n(?=[a-e]\))/gi, '$1$2\n\n');

    // 4b3. Despegar ítems numerados inline tras punto o paréntesis de cierre (ej. "a) ... 2. Calcula...")
    clean = clean.replace(/([.!?\)]|^)\s*(\d+[\.\)])\s+(?=[A-ZÁÉÍÓÚÑa-z¿¡|(\-])/g, (m, p1, num) => {
      return (p1 ? p1 + '\n' : '') + num + ' ';
    });

    // 4b4. Despegar "Ejemplo \d+:" inline para que cada ejemplo quede en su propio renglón
    clean = clean.replace(/([^\n])\s+(Ejemplo\s*\d+\s*:)/gi, '$1\n$2');

    // 4b5. Despegar incisos con letras inline: " a) ", " b) ", " c) "
    clean = clean.replace(/([^\n])\s+([a-e]\))\s+/g, '$1\n$2 ');

    // 4b6. Despegar operaciones de signos en línea "+ por + = + - por - = +"
    clean = clean.replace(/([=+])\s+([+-]\s+por\s+[+-]\s+=)/g, '$1\n$2');

    // 4b7. Despegar secciones universales pedagógicas conocidas si vienen inline
    const universalSections = [
      'Solucionario(?:\\s+del\\s+docente)?',
      'Ejemplos?\\s+resueltos?',
      'Jerarqu[ií]a\\s+de\\s+operaciones',
      'Conceptos?\\s+clave',
      'Ley\\s+de\\s+signos',
      'Reglas?\\s+para\\s+operar',
      'Preguntas?\\s+(?:de\\s+reflexi[oó]n|orientadoras?|gu[ií]a)',
      'Glosario(?:\\s+de\\s+t[eé]rminos)?'
    ].join('|');
    clean = clean.replace(new RegExp('([^\\n])\\s+(' + universalSections + ')(?=\\s+|$)', 'gi'), (match, charBefore, secName, offset, fullStr) => {
      const prefixBefore = fullStr.substring(Math.max(0, offset - 30), offset + charBefore.length);
      if (/(?:la|el|de|del|en|para|por|sobre|con|sin|cada|su|sus|uso)\s*$/i.test(prefixBefore)) {
        return match;
      }
      return charBefore + '\n\n' + secName + '\n\n';
    });

    // 4b8. Despegar títulos en Title Case cuando vienen en texto corrido monolítico
    const titleStarters = '(?:Los|Las|El|La|En|Para|Por|Se\\b|Son\\b|Es\\b|Un|Una|Consiste\\b|Permite\\b|Representan\\b|Cada\\b|Todo\\b|Toda\\b|Cuando\\b|Al\\b)';
    clean = clean.replace(new RegExp('(?:^|([.!?])\\s+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,15}(?:\\s+(?:(?:en|la|el|los|las|de|del|y|o|para|con|a|sobre|por)\\s+)*[A-ZÁÉÍÓÚÑa-záéíóúñ]{2,15}){0,5})\\s+(' + titleStarters + '\\s+[a-záéíóúñ])', 'gu'), (m, p1, title, next) => {
      return (p1 ? p1 + '\n\n' : '') + title + '\n\n' + next;
    });

    // 4c. Despegar oraciones de desempeños que inician con verbo de acción
    const actionVerbs = '(?:Identifica|Selecciona|Aplica|Reconoce|Comprende|Explica|Describe|Analiza|Utiliza|Propone|Evalúa|Distingue|Clasifica|Diseña|Construye|Elabora)';
    clean = clean.replace(new RegExp('([.!?])\\s*(' + actionVerbs + '\\b[^.\\n]{15,}[.!?])', 'g'), '$1\n• $2');

    // 4d. Despegar tiempo entre paréntesis seguido de título pedagógico: (Tiempo: 35 minutos) Conceptualización...
    clean = clean.replace(/([^\n#])\s*(\((?:Tiempo|Duraci[oó]n)[^)]+\))\s*([A-ZÁÉÍÓÚÑ][^:\n]+:)/gi, '$1\n\n### $2 $3\n\n');

    // 5. Separar encabezados de fase con duración del contenido inicial
    clean = clean.replace(/(\bFASE\s+DE\s+(?:INICIO|DESARROLLO|CIERRE)(?:\s*\([^)]+\))?:?)\s*([A-ZÁÉÍÓÚÑ])/gi, '$1\n\n$2');

    // 6. Separar subtítulos de pasos dentro de fases (ej. ". Revisión de la tarea extraclase:" o ") Saludo:")
    clean = clean.replace(/(?<!\b\d)([.)])\s+([A-ZÁÉÍÓÚÑ][^:\n\r]{2,60}:)(?=\s+[A-ZÁÉÍÓÚÑa-záéíóúñ0-9«"]|\s*$)/g, '$1\n\n$2');

    // 7. Despegar títulos en mayúsculas sostenidas precedidos de viñeta o al inicio (ej. "• LA IMPORTANCIA DE LA TRANSCRIPCIÓN PRECISA Transcribir...")
    clean = clean.replace(/(?:^|\n|[.!?]\s*|\s+)•\s*([\p{Lu}0-9\s\/\-:\(\)]{5,}[\p{Lu}0-9\)])(?=\s+[\p{Lu}][\p{Ll}]|\s*•|\s*$)/gu, '\n\n## $1\n\n');

    // 7b. Separar títulos en mayúsculas sostenidas seguidos directamente de texto con mayúscula inicial
    clean = clean.replace(/(?:^|\n)(##\s+)?([\p{Lu}]{2,}(?:\s+[\p{Lu}0-9\/\-]+){1,8})\s+([\p{Lu}][\p{Ll}])/gu, (match, hash, title, nextWord) => {
      return `\n\n## ${title}\n\n${nextWord}`;
    });

    // 7c. Despegar guiones accidentales entre palabras y palabras clave (ej. 'en-Regla' -> 'en -\n\nRegla')
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ])-(Regla|Paso|Norma|Ejemplo|Definici[oó]n|Importante|Nota)\b/gi, '$1 -\n\n$2');

    // 7d. Separar viñetas (•) que estén inline tras texto previo
    clean = clean.replace(/([^\n])\s*(•)\s*/g, '$1\n$2 ');

    // 7e. Despegar títulos en Title Case que terminan en paréntesis seguidos de oración (ej. "• Método... (Polinomios Aritméticos Básicos) Para resolver...")
    clean = clean.replace(/(?:^|\n)•\s*([A-ZÁÉÍÓÚÑ][^\n•\(\)]+\([^\)]+\))\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ])/gu, '\n\n## $1\n\n$2');

    // 7f. Despegar títulos en Title Case seguidos de oraciones pedagógicas (ej. "• La Sustracción de Números Enteros Restar dos...")
    const sentenceStarters = '(?:Restar|Sumar|Multiplicar|Dividir|Para agilizar|Para resolver|En la siguiente|Resolver|Consiste en|Es la|Son los|Se define|Permite)';
    clean = clean.replace(new RegExp('(?:^|\\n)•\\s*([A-ZÁÉÍÓÚÑ][^\\n•]{3,75}?)\\s+(' + sentenceStarters + '\\b)', 'gu'), '\n\n## $1\n\n$2');

    // 7g. Despegar títulos de sección aislados en viñeta (ej. "• Resumen Clave para Consignar", "• Conexión con la siguiente clase")
    clean = clean.replace(/(?:^|\n)•\s*(Resumen(?:\s+Clave)?(?:\s+para\s+Consignar)?|Conexi[oó]n\s+con\s+la\s+siguiente\s+clase)\s*(?=\n|$)/gi, '\n\n## $1\n\n');

    // 7h. Despegar conceptos clave antes de dos puntos (Regla fundamental:, Regla de memoria fácil:, Ejemplo paso a paso:)
    clean = clean.replace(/([^\n])\s*((?:Regla\s+fundamental|Regla\s+de\s+memoria\s+f[aá]cil|Ejemplo\s+paso\s+a\s+paso)\s*:)/gi, '$1\n\n$2');

    // 7i. Despegar "Ejemplos:" antes de viñetas o listas
    clean = clean.replace(/([^\n])\s*(Ejemplos?\s*:)\s*(?=[•\-\*\d]|\n)/gi, '$1\n\n**$2**\n');

    // 7j. Tratar fórmulas matemáticas LaTeX $$...$$
    // NUNCA envolver si la fórmula es solo puntuación (ej. , . ;) o vacía
    clean = clean.replace(/\$\$([\s,.;:\-–—\(\)\[\]\{\}]*)\$\$/g, '');
    clean = clean.replace(/\$\$([^\$]+)\$\$/g, (match, eq) => {
      const trimmedEq = eq.trim();
      if (!trimmedEq || /^[\s,.;:\-–—\(\)\[\]\{\}]+$/.test(trimmedEq) || (trimmedEq.length < 2 && !/[0-9xyzabc]/i.test(trimmedEq))) {
        return '';
      }
      return `\n\n$$${trimmedEq}$$\n\n`;
    });

    // 7k. Asegurar que tras un encabezado ## haya siempre salto doble
    clean = clean.replace(/(##[^\n]+)\n+(?=[•\-\*\d])/g, '$1\n\n');

    // 7l. Limpiar líneas huérfanas de asteriscos, viñetas vacías o puntuación rota
    clean = clean.replace(/(?:^|\n)\s*(?:•\s*)?[\*•\-\–—_]{1,3}\s*(?=\n|$)/g, '\n');
    clean = clean.replace(/(?:^|\n)\s*(?:\*{0,2}[\),.;:\-]\*{0,2})\s*(?=\n|$)/g, '\n');

    // 7m. Limpiar asteriscos huérfanos al final de línea o tras conectores
    clean = clean.replace(/\*\*\s*(?=\n|$)/gm, '');
    clean = clean.replace(/->\s*\*{1,2}\s*(?=\n|$)/gm, '-> ');
    clean = clean.replace(/([><=])\*{1,2}/g, '$1');

    // 7n. Limpiar sintaxis LaTeX no pedagógica en textos escolares (\text{...}, dollar signs simples)
    clean = clean.replace(/\\text\{([^}]+)\}/g, '$1');
    clean = clean.replace(/\$([0-9\.,\s\+\-\*\/=><\w]+)\$/g, '$1');

    // 7o. Despegar Paso \d: como bloque de encabezado independiente
    clean = clean.replace(/(?:^|\n)\s*(\*{0,2}Paso\s*[A-Z\d][^\n:•]*:?[^\n•]*?\*{0,2})\s*(?=\n|•|$)/gi, '\n\n$1\n\n');

    // 8. Despegar viñetas (- o *) ÚNICAMENTE si vienen tras puntuación de cierre o asteriscos (nunca separar signos de resta entre números como "= 12 + 8 - 5")
    clean = clean.replace(/([.:;\n]|\*{2})\s+([-*])\s+(?=[A-ZÁÉÍÓÚÑa-záéíóúñ¿¡"«\*\d])/g, '$1\n$2 ');

    // 9. Despegar apartados o secciones mayores numeradas antes y después (ej. "**2. LAS TRES PRIMERAS HABITACIONES**")
    clean = clean.replace(/([^\n])\s*(\*{2}\d+[\.\)]\s+[^\n*]+\*{2})/g, '$1\n\n$2');
    clean = clean.replace(/(\*{2}\d+[\.\)]\s+[^\n*]+\*{2})\s*([A-ZÁÉÍÓÚÑ¿¡•])/g, '$1\n\n$2');

    // 10. Despegar reglas, pasos, normas, notas y subtítulos con dos puntos (ej. "**Regla número 1:**", "**Lectura completa:**")
    clean = clean.replace(/([.!?:;)\]\*])\s*(\*{1,2}(?:Regla(?:\s+(?:fundamental|de\s+memoria\s+f[aá]cil|n[úu]mero))?|Paso\s*[A-Z\d]|Norma\s*\d+|Lectura\s+completa|Definici[oó]n|Ejemplo(?:\s+paso\s+a\s+paso)?|Importante|Nota|Pregunta)\b[^:\n\r]{0,50}:\*{0,2})/gi, '$1\n\n$2');

    // 10b. Aislar líneas de encabezado independientes que tengan solo un salto de línea
    const rawLines = clean.split('\n');
    const processedLines = [];
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (!line) {
        processedLines.push('');
        continue;
      }
      const isStandaloneHeading = (
        line.length >= 3 && line.length <= 75 &&
        /^[A-ZÁÉÍÓÚÑ\p{Emoji}]/u.test(line) &&
        !/[.,;?!]$/.test(line) &&
        !/^(?:En|Por|Con|Sin|Hacia|Desde|Durante|Sobre|Bajo|Entre|Ante|Tras)\s+(?:la|el|los|las|un|una|unos|unas|mi|tu|su)\b/i.test(line) &&
        !/^(?:con|sin|de|del|para|por|hacia|desde)\s+[a-z]/i.test(line) &&
        !/\.\s+[A-Z]/.test(line) &&
        !/^[•\-\*\d]/.test(line) &&
        !/[=+><]/.test(line)
      ) || /^(?:Taller|Solucionario|Ejemplos\s+resueltos|Conceptos\s+clave|Ley\s+de\s+signos|Reglas?\s+para\s+operar|Jerarqu[ií]a\s+de\s+operaciones)\b/i.test(line);

      if (isStandaloneHeading) {
        if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
          processedLines.push('');
        }
        processedLines.push(line);
        if (i + 1 < rawLines.length && rawLines[i + 1].trim() !== '') {
          processedLines.push('');
        }
      } else {
        processedLines.push(line);
      }
    }
    clean = processedLines.join('\n');

    // 11. Limpiar saltos indebidos en toda la estructura
    clean = this.cleanBrokenLinebreaks(clean);

    if (imagePlaceholders && imagePlaceholders.length > 0) {
      imagePlaceholders.forEach((imgTag, idx) => {
        clean = clean.replace(`___IMG_SHIELD_${idx}___`, imgTag);
      });
    }

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
    // Fast-path para cadenas de una sola línea sin saltos de línea
    if (!text.includes('\n') && !text.includes('\r')) {
      if (!/Criterios\s+de|Instrumentos\s+de|Recursos\s+did[aá]cticos|Tareas\s+(?:y\s+)?compromisos/i.test(text)) {
        return text.trim();
      }
    }

    const hasImages = text.includes('<img') || text.includes('data:image/');
    let imagePlaceholders = null;
    let clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    if (hasImages) {
      imagePlaceholders = [];
      clean = clean.replace(/<img\b[^>]*>/gi, (m) => {
        const ph = `___IMG_SHIELD_${imagePlaceholders.length}___`;
        imagePlaceholders.push(m);
        return ph;
      });
    }

    const hasEvalKeywords = /Criterios\s+de|Instrumentos\s+de/i.test(clean);
    const hasRecKeywords = /Recursos\s+did[aá]cticos|Tareas/i.test(clean);

    // 1. Reparar "Criterios de" e "Instrumentos de" huérfanos sin la palabra "evaluación"
    if (hasEvalKeywords) {
      clean = clean.replace(/(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi, '\nCriterios de evaluación:\n');
      clean = clean.replace(/(?:^|\n)\s*Instrumentos\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi, '\nInstrumentos de evaluación:\n');

      // 2a. Unir palabras clave partidas por salto de línea específicamente
      clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nCriterios de evaluación:');
      clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nInstrumentos de evaluación:');

      // 3a. Normalizar encabezados de subsección para que tengan dos puntos
      clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
      clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    }

    if (hasRecKeywords) {
      clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*:\s*(?:y\s+)?materiales\b/gi, '\nRecursos didácticos y materiales:');
      clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*\n+\s*(?:y\s+)?materiales(?!\s*:)/gi, '\nRecursos didácticos y materiales:');
      clean = clean.replace(/(?:^|\n)\s*(Tareas)\s*\n+\s*(?:y\s+)?compromisos(?!\s*:)/gi, '\nTareas y compromisos:');
      clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos\s+y\s+materiales)(?!\s*:)/gi, '\n$1:');
      clean = clean.replace(/(?:^|\n)\s*(Tareas\s+(?:y\s+)?compromisos)(?!\s*:)/gi, '\n$1:');
    }

    if (/TALLER/i.test(clean)) {
      clean = clean.replace(/(?:^|\n)\s*(TALLER\s*[\/:\-])\s*\n+\s*(ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)\b/gi, '\n$1 $2');
    }

    // 4. Unir saltos de línea artificiales tras comas o punto y coma dentro de una misma idea/viñeta
    // Ej: "computador,\ndatos" -> "computador, datos"
    clean = clean.replace(/([,;])\s*\n\s*(?![•\-\*\d\n\r#]|\*{1,2}[A-Z])/g, '$1 ');

    // 5. Unir oraciones partidas tras preposiciones, artículos o conjunciones (solo salto simple \n, y solo si continúa en minúscula)
    clean = clean.replace(/(?:^|[^a-záéíóúñA-ZÁÉÍÓÚÑ])(de|del|la|el|los|las|en|con|para|por|sobre|un|una|unos|unas|su|sus|sin|y|o|que|al|a|como|entre|hacia|desde|hasta|e|ni)\s*\n\s*([a-záéíóúñ0-9«"“\(\[])/g, (match, prep, nextChar) => {
      const prefix = match.slice(0, match.indexOf(prep));
      return prefix + prep + ' ' + nextChar;
    });

    // 6. Unir líneas que terminan en palabra normal y la siguiente empieza con minúscula (continuación directa de renglón tras corte suave de párrafo largo)
    // Solo si la línea es de párrafo largo (> 55 caracteres) para preservar versos líricos de poemas o estrofas cortas
    clean = clean.replace(/([^\n]{55,}[a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*([a-záéíóúñ])/g, '$1 $2');

    // 7. Unir líneas que terminan en texto y continúan con paréntesis explicativo en la línea siguiente
    // Ej: "consignado en el cuaderno\n(jerarquía..." -> "consignado en el cuaderno (jerarquía..."
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*(\([a-záéíóúñA-ZÁÉÍÓÚÑ0-9])/g, '$1 $2');

    // 8. Unir palabras con guión partidas por salto (ej. "teórico -\npráctico")
    // Se protege para que solo una si la segunda palabra inicia en minúscula y la primera no es una preposición
    if (clean.includes('-')) {
      clean = clean.replace(/(?<!\b(?:en|de|con|el|la|un|una))\b([a-záéíóúñA-ZÁÉÍÓÚÑ]+)\s*-\s*\n\s*([a-záéíóúñ]+)\b/g, '$1-$2');
    }

    // 9. Espaciado armónico: entre el final de una lista y el siguiente subtítulo ("Instrumentos de evaluación:") debe haber \n\n
    if (hasEvalKeywords) {
      clean = clean.replace(/([^\n])\n*((?:Criterios|Instrumentos)\s+de\s+evaluaci[oó]n:)/gi, '$1\n\n$2');
    }

    // 10. Eliminar saltos dobles innecesarios entre un encabezado con dos puntos (:) y su primera viñeta
    if (clean.includes(':')) {
      clean = clean.replace(/([^\n:]{1,120}:)\s*\n{2,}([•]|[-*](?!\*))/g, '$1\n$2');
    }

    // 11. Normalizar saltos triples o excesivos
    if (clean.includes('\n\n\n')) {
      clean = clean.replace(/\n{3,}/g, '\n\n');
    }

    if (imagePlaceholders && imagePlaceholders.length > 0) {
      imagePlaceholders.forEach((imgTag, idx) => {
        clean = clean.replace(`___IMG_SHIELD_${idx}___`, imgTag);
      });
    }

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

    // Eliminar cualquier otro tag HTML restante sin borrar headers C/C++ como <ESP32Servo.h> o <Wire.h>
    text = text.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, '');

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

  repairCodeFormatting(rawCode, surroundingContext = '') {
    let code = rawCode;

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

  shieldCodeBlocks(text) {
    if (!text || typeof text !== 'string') return { text, blocks: [] };
    const blocks = [];
    let shielded = text;

    // 1. Markdown fenced code blocks: ```lang ... ``` or ~~~lang ... ~~~
    shielded = shielded.replace(/(?:^|\n)(?:```|~~~)([a-zA-Z0-9_\+\-\.]*)\r?\n([\s\S]*?)(?:```|~~~)(?=\n|$)/g, (match, lang, code) => {
      const ph = `___CODE_BLOCK_SHIELD_${blocks.length}___`;
      blocks.push({
        placeholder: ph,
        language: (lang || '').trim() || 'C++ / Arduino',
        code: this.repairCodeFormatting(code.trim(), text)
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
        code: this.repairCodeFormatting(cleanCode.trim(), text)
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
          code: this.repairCodeFormatting(codeBody.trim(), text)
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
          code: this.repairCodeFormatting((firstLine + '\n' + restOfCode).trim(), text)
        });
        return `\n\n${ph}\n\n`;
      });
    }

    return { text: shielded, blocks };
  }

  shieldMathBlocks(text) {
    if (!text || typeof text !== 'string' || !text.includes('$$')) return { text, blocks: [] };
    const blocks = [];
    const shielded = text.replace(/\$\$([^\$\n\r]+?)\$\$/g, (match, formula) => {
      const trimmedFormula = formula.trim();
      if (!trimmedFormula || /^[\s,.;:\-–—\(\)\[\]\{\}]+$/.test(trimmedFormula) || (trimmedFormula.length < 2 && !/[0-9xyzabc]/i.test(trimmedFormula))) {
        return match;
      }
      const ph = `___MATH_BLOCK_SHIELD_${blocks.length}___`;
      blocks.push({ placeholder: ph, formula: trimmedFormula });
      return `\n\n${ph}\n\n`;
    });
    return { text: shielded, blocks };
  }

  renderCodeBlockHtml(block) {
    if (block.isHtml) return block.html;
    let langDisplay = (block.language || 'Código').toUpperCase();
    if (langDisplay === 'CPP' || langDisplay === 'C++') langDisplay = 'C++ / Arduino';
    else if (langDisplay === 'PY' || langDisplay === 'PYTHON') langDisplay = 'Python';
    else if (langDisplay === 'JS' || langDisplay === 'JAVASCRIPT') langDisplay = 'JavaScript';

    const escaped = this._escape(block.code);

    return `<div class="notebook-code-block" style="background:#f8fafc; border:1.5px solid #cbd5e1; border-left:4px solid #2563eb; border-radius:6px; margin:0.8rem 0; padding:10px 14px; font-family:'Consolas', 'Courier New', monospace; font-size:0.82rem; line-height:1.45; overflow-x:auto; white-space:pre-wrap; word-break:break-word; color:#0f172a; page-break-inside:avoid; break-inside:avoid;">
  <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:0.75rem; font-weight:700; color:#2563eb; text-transform:uppercase; margin-bottom:6px; border-bottom:1px solid #e2e8f0; padding-bottom:4px; letter-spacing:0.5px; user-select:none; display:flex; justify-content:space-between; align-items:center;">
    <span>💻 Código / Sketch (${langDisplay})</span>
  </div>
  <pre style="margin:0; font-family:inherit; font-size:inherit; white-space:pre-wrap; word-break:break-word; color:inherit; background:transparent; border:none; padding:0;"><code>${escaped}</code></pre>
</div>`.trim();
  }

  /**
   * Convierte texto estructurado o Markdown a HTML limpio y pedagógico para el Cuaderno / Word
   */
  formatMarkdownToHtml(content) {
    if (!content || typeof content !== 'string') return '';

    // Proteger y aislar bloques de código antes de cualquier procesamiento regex
    const { text: codeShieldedContent, blocks: codeBlocks } = this.shieldCodeBlocks(content);
    // Proteger y aislar fórmulas matemáticas LaTeX ($$formula$$)
    const { text: mathShieldedContent, blocks: mathBlocks } = this.shieldMathBlocks(codeShieldedContent);

    let trimmed = this.cleanDocumentArtifacts(mathShieldedContent.trim());
    if (!trimmed || trimmed === '<p><br/></p>' || trimmed === '<p><br></p>' || trimmed === '<br>') return '';

    // Si ya contiene etiquetas HTML estructurales Y no contiene títulos en Markdown sin renderizar ni viñetas colapsadas
    const hasRichTags = /<(?:p|h[1-6]|ul|ol|table|div|blockquote)[^>]*>/i.test(trimmed);
    const hasRawMarkdownHeadings = /\*\*\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡]|\*\*(?:Regla|Paso|Norma|Lectura|Definici[oó]n|Importante)[\s\w#º°\d]*:|\n•\s*\*\*|•\s+\*\*|##\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed);
    const bulletCount = (trimmed.match(/•/g) || []).length;
    const liCount = (trimmed.match(/<li\b/gi) || []).length;
    const hasUnstructuredBullets = (bulletCount > 0 && liCount === 0) || (bulletCount > 1 && liCount < bulletCount / 2) ||
      (/•/.test(trimmed) && (!/<li[^>]*>/i.test(trimmed) || /<(?:p|div)[^>]*>[^<]*•/i.test(trimmed)));

    // Detectar si el contenido es un párrafo monolítico sin estructurar (ej. todo el cuaderno pegado en una sola etiqueta <p>)
    const pCount = (trimmed.match(/<p\b/gi) || []).length;
    const plainTextLen = trimmed.replace(/<[^>]+>/g, '').trim().length;
    const isMonolithicParagraph = (pCount <= 2 && plainTextLen > 200) && (
      /(?:TEMAS\s+DEL|DESEMPEÑOS?\s+DE|CRITERIOS?\s+DE|Fase\s+de|Eje\s+temático|Tiempo:|Taller|Actividad|Solucionario|Ejemplos|Conceptos|Reglas|Definici[oó]n)/i.test(trimmed) ||
      /(?:[A-ZÁÉÍÓÚÑ][^:\n]{2,40}:\s+){2,}/.test(trimmed) ||
      /\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
      /[a-d]\)\s+/.test(trimmed) ||
      (plainTextLen > 400 && (trimmed.match(/\.\s+[A-ZÁÉÍÓÚÑ]/g) || []).length >= 2)
    );

    const isWordHtml = /class=["']?Mso|mso-|style=["'][^"']*mso-/i.test(trimmed) ||
      /<p[^>]*>\s*<(?:b|strong)[^>]*>[^<]{3,80}<\/(?:b|strong)>\s*<\/p>/i.test(trimmed);

    if (hasRichTags && !hasRawMarkdownHeadings && !hasUnstructuredBullets && !isMonolithicParagraph && !isWordHtml) {
      return trimmed;
    }

    let textToProcess = trimmed;
    if ((hasUnstructuredBullets || isMonolithicParagraph || isWordHtml) && /<[^>]+>/.test(trimmed)) {
      textToProcess = this.convertHtmlToFormattedText(trimmed);
    }

    let text = this.unglueText(textToProcess);

    // Asegurar que encabezados mayores como TALLER / EJERCICIO PRÁCTICO queden separados en su propio bloque independiente
    text = text.replace(/(?:^|\n)\s*((?:\*{0,2})(?:TALLER\b[^\n:]*|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?[^\n:]*|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?[^\n:]*)(?:\*{0,2}))\s*(?=\n|$)/gi, (m, p1) => `\n\n${p1}\n\n`);

    // Asegurar que fórmulas matemáticas ($$formula$$) queden aisladas en su propio bloque
    text = text.replace(/(?:\s*)(\$\$[^\$\n]+\$\$)(?:\s*)/g, '\n\n$1\n\n');

    // Colapsar saltos dobles entre opciones alfabéticas consecutivas (A) B) C) D) o a) b) c) d)) para mantenerlas en un solo bloque
    while (/((?:^|\n)[ \t]*\(?[a-dA-D][\.\)][^\n]*)\n{2,}(?=[ \t]*\(?[a-dA-D][\.\)])/.test(text)) {
      text = text.replace(/((?:^|\n)[ \t]*\(?[a-dA-D][\.\)][^\n]*)\n{2,}(?=[ \t]*\(?[a-dA-D][\.\)])/g, '$1\n');
    }

    // Dividir en bloques por dobles saltos de línea
    const blocks = text.split(/\n{2,}/);
    const htmlBlocks = [];

    for (let b of blocks) {
      const block = b.trim();
      if (!block) continue;

      // Descartar si el bloque completo es solo puntuación, asteriscos huérfanos o almohadillas (#)
      if (/^[\s,.;:\-–—\(\)\[\]\{\}\*•#]+$/.test(block)) continue;

      // Bloque de código protegido (C++, Python, Arduino, HTML, etc.)
      const codeShieldMatch = block.match(/^___CODE_BLOCK_SHIELD_(\d+)___$/);
      if (codeShieldMatch) {
        const idx = parseInt(codeShieldMatch[1], 10);
        const codeBlockData = codeBlocks && codeBlocks[idx];
        if (codeBlockData) {
          htmlBlocks.push(this.renderCodeBlockHtml(codeBlockData));
          continue;
        }
      }

      // 0a. Fórmula matemática protegida (LaTeX)
      const mathShieldMatch = block.match(/^___MATH_BLOCK_SHIELD_(\d+)___$/);
      if (mathShieldMatch) {
        const idx = parseInt(mathShieldMatch[1], 10);
        const mathData = mathBlocks && mathBlocks[idx];
        if (mathData) {
          htmlBlocks.push(`<div class="notebook-math-block" style="text-align:center; margin:0.6rem 0; padding:8px 12px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:6px; font-family:'Cambria Math', 'Times New Roman', serif; font-size:1.15rem; font-weight:700; color:#1e3a8a; letter-spacing:0.5px;">${this._escape(mathData.formula)}</div>`);
          continue;
        }
      }

      // 0. Fórmula matemática LaTeX ($$formula$$)
      const mathMatch = block.match(/^\$\$([^\$]+)\$\$$/);
      if (mathMatch) {
        const formula = mathMatch[1].trim();
        // NUNCA generar caja matemática si la fórmula está vacía, es solo puntuación (ej. ",") o no tiene contenido matemático real
        if (!formula || /^[\s,.;:\-–—\(\)\[\]\{\}]+$/.test(formula) || (formula.length < 2 && !/[0-9xyzabc]/i.test(formula))) {
          continue;
        }
        htmlBlocks.push(`<div class="notebook-math-block" style="text-align:center; margin:0.6rem 0; padding:8px 12px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:6px; font-family:'Cambria Math', 'Times New Roman', serif; font-size:1.15rem; font-weight:700; color:#1e3a8a; letter-spacing:0.5px;">${this._escape(formula)}</div>`);
        continue;
      }

      // 1. Títulos de Paso (ej: "Paso 1: Cálculo mental y comparación...")
      const stepMatch = block.match(/^(?:\*{0,2})(Paso\s*[A-Z\d][^\n:]*:?\s*[^\n]*)\*{0,2}$/i);
      if (stepMatch) {
        const stepTitle = this._formatInlineMarkdown(stepMatch[1]);
        htmlBlocks.push(`<h3 style="color:#1d4ed8; font-weight:800; margin-top:0.7rem; margin-bottom:0.25rem; font-size:1.02rem; display:flex; align-items:center; gap:6px;">🛠️ ${stepTitle}</h3>`);
        continue;
      }

      // Detectar si el bloque es una opción de pregunta (A, B, C, D o a, b, c, d)
      const isOptionLine = /^\(?[a-zA-Z][\.\)]\s+/.test(block);

      // 1b. Títulos y Encabezados mayores numerados, con ## o en MAYÚSCULAS o Títulos pedagógicos
      const isMdHeading = block.match(/^(?:#{1,3}\s+)(.+)$/);
      const isBoldHeading = block.match(/^\*{2}([^*]+?)\*{2}$/);
      const isNumberedHeading = block.match(/^(?:\*{2})(\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡][^\n*]+?)\*{2}$/) && !block.includes('\n');
      const isAllCapsHeading = !isOptionLine && !block.includes('\n') && block.length >= 4 && block.length <= 80 && /^[\p{Lu}0-9\s\/\-:\(\)]+$/u.test(block) && /[A-ZÁÉÍÓÚÑ]{3,}/.test(block);
      const isStandaloneHeading = !isOptionLine && !block.includes('\n') && block.length >= 3 && block.length <= 75 &&
        /^[A-ZÁÉÍÓÚÑ\p{Emoji}]/u.test(block) &&
        !/[.,;?!]$/.test(block) &&
        !/^(?:En|Por|Con|Sin|Hacia|Desde|Durante|Sobre|Bajo|Entre|Ante|Tras)\s+(?:la|el|los|las|un|una|unos|unas|mi|tu|su)\b/i.test(block) &&
        !/^(?:con|sin|de|del|para|por|hacia|desde)\s+[a-z]/i.test(block) &&
        !/\.\s+[A-Z]/.test(block) &&
        !/^[•\-\*\d]/.test(block) &&
        !/[=+><]/.test(block);

      if (isMdHeading || isBoldHeading || isNumberedHeading || isAllCapsHeading || isStandaloneHeading) {
        let rawTitle = (isMdHeading && isMdHeading[1]) || (isBoldHeading && isBoldHeading[1]) || (isNumberedHeading && isNumberedHeading[1]) || block || '';
        let title = rawTitle.replace(/[\*#]/g, '').trim();

        // Detección especial de TALLER / EJERCICIO PRÁCTICO: independizar en una hoja con ficha estudiantil
        const isTallerHeading = /^(?:TALLER\s*[\/:\-]\s*(?:ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)\s*PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|TALLER\s+PR[AÁ]CTIC[OA]\s+DE\s+LA\s+CLASE|TALLER\s+PR[AÁ]CTICO\s+FORMATIVO|TALLER\s+DE\s+APLICACI[OÓ]N\s+(?:EN\s+CLASE|DE\s+LA\s+CLASE)|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?\s+DE\s+LA\s+CLASE|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?\s+DE\s+LA\s+CLASE|TALLER\s+PR[AÁ]CTICO(?:\s+EN\s+CLASE)?\s*$|TALLER\s*[\/:\-]\s*(?:ACTIVIDAD|EJERCICIO)\s*$)/i.test(title) && !/^TALLER\s+PR[AÁ]CTICO\s*:\s*[A-ZÁÉÍÓÚÑ]/i.test(title);
        if (isTallerHeading) {
          const hasAlreadyWorksheetHeader = htmlBlocks.some(h => h.includes('notebook-student-worksheet-header'));
          const lastHtml = htmlBlocks[htmlBlocks.length - 1] || '';
          if (htmlBlocks.length > 0 && !lastHtml.includes('notebook-page-break') && !hasAlreadyWorksheetHeader) {
            htmlBlocks.push('<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>');
          }
          if (!hasAlreadyWorksheetHeader) {
            htmlBlocks.push(`
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc; page-break-inside:avoid; break-inside:avoid;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px;">✍️ Taller / Actividad Práctica de la Clase</h2>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px; line-height:1.4;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> ______________</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
</div>`.trim());
            continue;
          }
        }

        let icon = '';
        if (/TRANSCRIPCI[OÓ]N|PROP[OÓ]SITO|OBJETIVO|INTRODUCCI[OÓ]N/i.test(title)) icon = '🎯 ';
        else if (/PAR[AÁ]METROS|FORMATO|ESPECIFICACI/i.test(title)) icon = '📐 ';
        else if (/REGLAS|NORMAS|ESTILO|DIGITACI[OÓ]N/i.test(title)) icon = '⌨️ ';
        else if (/PROCEDIMIENTO|T[EÉ]CNICO|RESUMEN|PASO/i.test(title)) icon = '🛠️ ';
        else if (/SUSTRACCI[OÓ]N|ADICI[OÓ]N|N[UÚ]MEROS|OPERACION|MATEM[AÁ]TICA|ABSOLUTO/i.test(title)) icon = '🔢 ';
        else if (/SIGNO|PAR[EÉ]NTESIS|LEY/i.test(title)) icon = '⚡ ';
        else if (/M[EÉ]TODO|POLINOMIO|CADENA/i.test(title)) icon = '📋 ';
        else if (/CONEXI[OÓ]N|SIGUIENTE/i.test(title)) icon = '🚀 ';
        else if (/SOLUCIONARIO|RESPUESTA/i.test(title)) icon = '💡 ';
        else if (/CONCEPTOS?|IDEA|GLOSARIO/i.test(title)) icon = '💡 ';
        else if (!/^[\d\.\s\p{Emoji}]/u.test(title)) icon = '📌 ';

        htmlBlocks.push(`<h2 style="color:#1e3a8a; margin-top:1.1rem; margin-bottom:0.4rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px; letter-spacing:-0.01em;">${icon}${this._escape(title)}</h2>`);
        continue;
      }

      // Si el bloque es una opción de pregunta individual que quedó aislada
      if (isOptionLine) {
        const m = block.match(/^\(?([a-zA-Z][\.\)])\s*(.*)$/);
        if (m) {
          htmlBlocks.push(`<p class="notebook-quiz-single-option" style="margin:0.15rem 0 0.15rem 1.25rem; line-height:1.4; color:#1e293b; page-break-inside:avoid; break-inside:avoid;"><strong style="color:#1d4ed8;">${this._escape(m[1])}</strong> ${this._formatInlineMarkdown(m[2])}</p>`);
          continue;
        }
      }

      // 2. Títulos de nivel H3 (ej. "### Subtítulo")
      const subHeadingMatch = block.match(/^#{3,4}\s+(.+)$/);
      if (subHeadingMatch) {
        const subTitle = subHeadingMatch[1].replace(/[\*#]/g, '').trim();
        htmlBlocks.push(`<h3 style="color:#1e293b; margin-top:0.85rem; margin-bottom:0.3rem; font-size:1.02rem; font-weight:700;">${this._escape(subTitle)}</h3>`);
        continue;
      }

      // 3. Reglas pedagógicas, pasos, ejemplos o definiciones formateados limpiamente como párrafo con título en negrita
      const ruleMatch = block.match(/^\*{0,2}((?:Regla(?:\s+(?:fundamental|de\s+memoria\s+f[aá]cil|n[úu]mero))?|Norma\s*\d+|Lectura\s+completa|Definici[oó]n|Ejemplo(?:\s+paso\s+a\s+paso|\s*\d+)?|Importante|Nota|Pregunta)[^\n:]*:)\*{0,2}\s*([\s\S]+)$/i);
      if (ruleMatch) {
        const ruleLabel = ruleMatch[1].replace(/[\*#]/g, '').trim();
        const ruleLines = ruleMatch[2].split('\n').map(l => l.trim()).filter(Boolean);
        const ruleBody = ruleLines.map(l => this._formatInlineMarkdown(l)).join('<br/>');
        htmlBlocks.push(`<p style="margin-top:0.35rem; margin-bottom:0.25rem; line-height:1.4;"><strong style="color:#1d4ed8;">${this._escape(ruleLabel)}</strong> ${ruleBody}</p>`);
        continue;
      }

      // 4a. Bloques de lista alfabética (a) b) c) o a. b. c. o (A) (B) (C))
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const validLines = lines.filter(l => !/^[\s\*•\-\–—_]{1,3}$/.test(l));
      const isLetteredList = validLines.length > 0 && validLines.every(l => /^\(?[a-zA-Z][\.\)]\s+/.test(l));
      if (isLetteredList) {
        const listItemsHtml = validLines.map(l => {
          const m = l.match(/^\(?([a-zA-Z][\.\)])\s*(.*)$/);
          if (!m) return '';
          return `<li style="margin-bottom:0.2rem;"><strong style="color:#1d4ed8;">${this._escape(m[1])}</strong> ${this._formatInlineMarkdown(m[2])}</li>`;
        }).filter(Boolean).join('');
        if (listItemsHtml) {
          htmlBlocks.push(`<ul class="notebook-quiz-options" style="margin:0.25rem 0 0.5rem 1.25rem; list-style-type:none; padding-left:0.5rem; line-height:1.45; color:#1e293b; page-break-inside:avoid; break-inside:avoid;">${listItemsHtml}</ul>`);
        }
        continue;
      }

      // 4b. Bloques de viñetas o listas (líneas que inician con •, -, *)
      const isBulletLine = (l) => /^[•]\s+/.test(l) || (/^[\-\*]\s+/.test(l) && !/[-+]\s*(?:por|mas|más|menos|entre|[0-9\(\)\|])|=/i.test(l));
      const isBulletList = validLines.length > 0 && validLines.every(l => isBulletLine(l));
      if (isBulletList) {
        const listItemsHtml = validLines.map(l => {
          const content = l.replace(/^[•]\s+|^(?:[\-\*]\s+)/, '').trim();
          if (!content || /^[\s\*•\-\–—_.]+$/.test(content)) return '';
          return `<li style="margin-bottom:0.2rem;">${this._formatInlineMarkdown(content)}</li>`;
        }).filter(Boolean).join('');
        if (listItemsHtml) {
          htmlBlocks.push(`<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${listItemsHtml}</ul>`);
        }
        continue;
      }

      // 5. Bloques de lista numerada (1. 2. 3.)
      const isNumberedList = validLines.length > 0 && validLines.every(l => /^\d+[\.\)]\s+/.test(l));
      if (isNumberedList) {
        const listItemsHtml = validLines.map(l => {
          const content = l.replace(/^\d+[\.\)]\s+/, '').trim();
          if (!content || /^[\s\*•\-\–—_.]+$/.test(content)) return '';
          return `<li style="margin-bottom:0.2rem;">${this._formatInlineMarkdown(content)}</li>`;
        }).filter(Boolean).join('');
        if (listItemsHtml) {
          htmlBlocks.push(`<ol style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${listItemsHtml}</ol>`);
        }
        continue;
      }

      // 6. Si contiene viñetas intercaladas en el bloque
      if (validLines.some(l => isBulletLine(l))) {
        let currentP = [];
        let currentList = [];
        for (const line of validLines) {
          if (isBulletLine(line)) {
            if (currentP.length > 0) {
              htmlBlocks.push(`<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${currentP.map(l => this._formatInlineMarkdown(l)).join('<br/>')}</p>`);
              currentP = [];
            }
            const c = line.replace(/^[•]\s+|^(?:[\-\*]\s+)/, '').trim();
            if (c && !/^[\s\*•\-\–—_.]+$/.test(c)) {
              currentList.push(`<li style="margin-bottom:0.2rem;">${this._formatInlineMarkdown(c)}</li>`);
            }
          } else {
            if (currentList.length > 0) {
              htmlBlocks.push(`<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${currentList.join('')}</ul>`);
              currentList = [];
            }
            currentP.push(line);
          }
        }
        if (currentList.length > 0) {
          htmlBlocks.push(`<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${currentList.join('')}</ul>`);
        }
        if (currentP.length > 0) {
          htmlBlocks.push(`<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${currentP.map(l => this._formatInlineMarkdown(l)).join('<br/>')}</p>`);
        }
        continue;
      }

      // Párrafo estándar: si tiene múltiples líneas (ej. operaciones o pasos), preservar <br/>
      if (validLines.length > 1) {
        const formattedLines = validLines.map(l => this._formatInlineMarkdown(l));
        htmlBlocks.push(`<p style="margin-top:0.3rem; margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${formattedLines.join('<br/>')}</p>`);
      } else {
        const formattedPara = this._formatInlineMarkdown(block);
        if (formattedPara && !/^[\s\*•\-\–—_.]+$/.test(formattedPara)) {
          htmlBlocks.push(`<p style="margin-top:0.3rem; margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${formattedPara}</p>`);
        }
      }
    }

    let finalHtml = htmlBlocks.join('\n\n');
    if (codeBlocks && codeBlocks.length > 0) {
      finalHtml = finalHtml.replace(/___CODE_BLOCK_SHIELD_(\d+)___/g, (match, idx) => {
        const b = codeBlocks[parseInt(idx, 10)];
        return b ? this.renderCodeBlockHtml(b) : match;
      });
    }

    return finalHtml;
  }

  _formatInlineMarkdown(str) {
    if (!str) return '';
    let cleaned = this.cleanDocumentArtifacts(str);

    // Proteger asteriscos matemáticos como multiplicación: ej. "(-4) * (+6)", "3 * 5"
    const mathAsterisks = [];
    cleaned = cleaned.replace(/(?<=[a-zA-Z0-9\)\%\|])\s*\*\s*(?=[a-zA-Z0-9\(\-\|])/g, (match) => {
      const ph = `___MATH_MULT_${mathAsterisks.length}___`;
      mathAsterisks.push(match);
      return ph;
    });

    let res = this._escape(cleaned);
    // Pares de negrita **texto**
    res = res.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Pares de cursiva *texto* (CommonMark: el asterisco debe tocar el texto sin espacios)
    res = res.replace(/(?:^|[^\*\w])\*([^\s\*][^\*\n]*?[^\s\*])\*(?=[^\*\w]|$)/g, '$1<em>$2</em>$3');
    // Limpiar asteriscos dobles o triples huérfanos residuales (sin borrar asteriscos simples que queden)
    res = res.replace(/\*{2,}/g, '');
    // Limpiar paréntesis o corchetes de cierre huérfanos con asteriscos como **) solo si NO hay apertura '('
    if (!res.includes('(')) {
      res = res.replace(/\s*\*{1,3}\)\s*$/g, '');
    }
    // Restaurar asteriscos de multiplicación matemática protegidos
    if (mathAsterisks.length > 0) {
      mathAsterisks.forEach((multStr, idx) => {
        res = res.replace(`___MATH_MULT_${idx}___`, this._escape(multStr));
      });
    }
    // Enlaces markdown
    res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    if (!res.startsWith('<strong>') && !res.startsWith('<h') && !res.startsWith('<div')) {
      res = res.replace(/^([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\(\)\/]{2,45}:)\s*/, '<strong>$1</strong> ');
    }
    return res.trim();
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
      additionalNotes: [],
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
        // Si estamos dentro del cuaderno del estudiante o actividad práctica, NO consumir líneas de texto pedagógico
        if (currentSection === 'studentNotebook' || currentSection === 'practicalActivity') {
          if (fieldMatch.field === 'topic' && !result.curriculum.topic) {
            result.curriculum.topic = fieldMatch.value;
            result.detected.topic = true;
          }
          if (sectionBuffers[currentSection]) {
            sectionBuffers[currentSection].push(line);
          }
          continue;
        }
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

    // Blindaje de secciones pedagógicas: dentro de studentNotebook o practicalActivity,
    // solo se permite la salida ante encabezados mayores explícitos para no fragmentar por palabras coincidentes
    if (currentSection === 'studentNotebook') {
      const isExit = /^(?:TALLER\s*[\/:\-]\s*(?:ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)\s*PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|TALLER\s+PR[AÁ]CTIC[OA]\s+DE\s+LA\s+CLASE|TALLER\s+PR[AÁ]CTICO\s+FORMATIVO|TALLER\s+DE\s+APLICACI[OÓ]N\s+(?:EN\s+CLASE|DE\s+LA\s+CLASE)|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?\s+DE\s+LA\s+CLASE|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?\s+DE\s+LA\s+CLASE|TALLER\s+PR[AÁ]CTICO(?:\s+EN\s+CLASE)?\s*$|TALLER\s*[\/:\-]\s*(?:ACTIVIDAD|EJERCICIO)\s*$|NOTAS?\s+ADICIONALES|OBSERVACIONES(?:\s+PEDAG[OÓ]GICAS|\s+DEL\s+DOCENTE)?|PARTE\s+[12]|SECUENCIA\s+DID[AÁ]CTICA\s+ESTRUCTURADA|FASE\s+DE|RECURSOS|MATERIALES|EVALUACI[OÓ]N|TAREAS|COMPROMISOS)\b/i.test(upper);
      if (!isExit) {
        return null;
      }
    } else if (currentSection === 'practicalActivity') {
      const isExit = /^(?:NOTAS?\s+ADICIONALES|OBSERVACIONES(?:\s+PEDAG[OÓ]GICAS|\s+DEL\s+DOCENTE)?|PARTE\s+[12]|SECUENCIA\s+DID[AÁ]CTICA\s+ESTRUCTURADA|FASE\s+DE\s+(?:INICIO|DESARROLLO|CIERRE)|RECURSOS|MATERIALES|EVALUACI[OÓ]N|TAREAS|COMPROMISOS|INFORMACI[OÓ]N\s+GENERAL|DATOS\s+GENERALES|PLANEACI[OÓ]N\s+DE\s+CLASE|GU[IÍ]A\s+DE\s+CONTENIDO|DIN[AÁ]MICA)\b/i.test(upper);
      if (!isExit) {
        return null;
      }
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
    if (/^(?:EVALUACI[OÓ]N\s+FORMATIVA|VALORACI[OÓ]N(?:\s+Y\s+SEGUIMIENTO)?|CRITERIOS\s+DE\s+EVALUACI[OÓ]N|EVALUACI[OÓ]N\s*(?:[:\/-]|\([^)]*\)|$))\b/i.test(upper)) {
      if (!/^(?:EVALUACI[OÓ]N\s+(?:PR[AÁ]CTICA|DE\s+LABORATORIO|DIAGN[OÓ]STICA|DE\s+CIRCUITOS))\b/i.test(upper)) {
        const inline = clean.replace(/^(?:EVALUACI[OÓ]N(?:\s+FORMATIVA)?|VALORACI[OÓ]N(?:\s+Y\s+SEGUIMIENTO)?|CRITERIOS\s+DE\s+EVALUACI[OÓ]N)\s*:?\s*/i, '').trim();
        return { section: 'evaluation', inlineContent: inline || null };
      }
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

    if (/^(?:REGLAS?(?:\s+(?:DE\s+JUEGO|DEL?\s+QUIZ(?:\s+PR[AÁ]CTICO)?|DE\s+CLASE|PR[AÁ]CTICAS?))?|NORMAS?(?:\s+DE\s+CLASE)?|PACTA\s+DE\s+AULA)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:REGLAS?(?:\s+(?:DE\s+JUEGO|DEL?\s+QUIZ(?:\s+PR[AÁ]CTICO)?|DE\s+CLASE|PR[AÁ]CTICAS?))?|NORMAS?(?:\s+DE\s+CLASE)?|PACTA\s+DE\s+AULA)\s*:?\s*/i, '').trim();
      return { section: 'rules', inlineContent: inline || null };
    }

    // 12. GUÍA DE CONTENIDO PARA EL CUADERNO DEL ESTUDIANTE
    if (/^(?:GU[IÍ]A\s+DE\s+CONTENIDO\s+(?:DETALLADA\s+)?PARA\s+EL\s+CUADERNO\s+(?:DEL\s+ESTUDIANTE)?|CONTENIDO\s+(?:PARA\s+EL\s+)?(?:ESTUDIANTE|CUADERNO)|CONTENIDO\s+DEL\s+ESTUDIANTE|TEXTO\s+DEL\s+ESTUDIANTE|CUADERNO\s+DEL\s+ESTUDIANTE)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:GU[IÍ]A\s+DE\s+CONTENIDO\s+(?:DETALLADA\s+)?PARA\s+EL\s+CUADERNO\s+(?:DEL\s+ESTUDIANTE)?|CONTENIDO\s+(?:PARA\s+EL\s+)?(?:ESTUDIANTE|CUADERNO)|CONTENIDO\s+DEL\s+ESTUDIANTE|TEXTO\s+DEL\s+ESTUDIANTE|CUADERNO\s+DEL\s+ESTUDIANTE)\s*:?\s*/i, '').trim();
      return { section: 'studentNotebook', inlineContent: inline || null };
    }

    // 13. TALLER / ACTIVIDAD PRÁCTICA (Cuaderno del Docente / Guía)
    const isTallerMatch = /^(?:TALLER\b|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?)/i.test(upper);
    if (isTallerMatch) {
      if (clean.length > 90) {
        return null;
      }
      if (currentSection === 'generalInfo' || currentSection === 'periodTopics' || currentSection === 'periodPerformances') {
        return null;
      }
      const inDidactic = ['inicio', 'desarrollo', 'cierre', 'recursos', 'tareas', 'evaluation', 'observaciones'].includes(currentSection);
      const isExplicitHeading = /^(?:TALLER\s*[\/:\-]\s*(?:ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)\s*PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|TALLER\s+PR[AÁ]CTIC[OA]\s+DE\s+LA\s+CLASE|TALLER\s+PR[AÁ]CTICO\s+FORMATIVO|TALLER\s+DE\s+APLICACI[OÓ]N\s+(?:EN\s+CLASE|DE\s+LA\s+CLASE)|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|TALLER\s+PR[AÁ]CTICO(?:\s+EN\s+CLASE)?\s*$|TALLER\s*[\/:\-]\s*(?:ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A(?:S)?)\s*$|TALLER\s*(?::|\b|$))/i.test(upper);
      if (inDidactic && !isExplicitHeading) {
        return null;
      }
      if (/^TALLER\s+PR[AÁ]CTICO\s*:\s*[A-ZÁÉÍÓÚÑ]/i.test(upper)) {
        return null;
      }
      const inline = clean.replace(/^(?:TALLER(?:\s*(?:[\/:\-]\s*(?:ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)?\s*PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|DE\s+APLICACI[OÓ]N(?:\s+EN\s+CLASE)?(?:\s*#?\s*\d+)?|EN\s+CLASE(?:\s*#?\\s*\d+)?|[\/:\-]\s*(?:ACTIVIDAD(?:ES)?|EJERCICIOS?|GU[IÍ]A|EVALUACI[OÓ]N)|DE\s+EJERCICIOS|PEDAG[OÓ]GICO|FORMATIVO|INDIVIDUAL|GRUPAL))?|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?)\s*:?\s*/i, '').trim();
      return { section: 'practicalActivity', inlineContent: inline || null };
    }

    // 13b. NOTAS ADICIONALES DEL DOCENTE
    if (/^(?:NOTAS?\s+ADICIONALES(?:\s+DEL\s+DOCENTE)?|OBSERVACIONES\s+DEL\s+DOCENTE(?:\s+PARA\s+LA\s+CLASE)?|ALERTAS?\s+PEDAG[OÓ]GICAS?)\b/i.test(upper)) {
      const inline = clean.replace(/^(?:NOTAS?\s+ADICIONALES(?:\s+DEL\s+DOCENTE)?|OBSERVACIONES\s+DEL\s+DOCENTE(?:\s+PARA\s+LA\s+CLASE)?|ALERTAS?\s+PEDAG[OÓ]GICAS?)\s*:?\s*/i, '').trim();
      return { section: 'additionalNotes', inlineContent: inline || null };
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
    if (/^(?:EJE\s+TEM[AÁ]TICO\s+PRINCIPAL|EJE\s+TEM[AÁ]TICO|TEMA\s+PRINCIPAL|TEMA|T[IÍ]TULO(?:\s+DEL\s+TEMA)?)\b/i.test(cleanKey)) {
      return { field: 'topic', value };
    }
    if (/^(?:DBA|DERECHOS?\s+B[AÁ]SICOS?\s+DE\s+APRENDIZAJE)\b/i.test(cleanKey)) {
      return { field: 'dba', value };
    }
    if (/^(?:LOGRO(?:\s*\/\s*DESEMPE[ÑN]O)?|DESEMPE[ÑN]O(?:\s*\/\s*LOGRO)?(?:\s+DE\s+APRENDIZAJE)?|INDICADOR(?:\s+DE\s+LOGRO)?)\b/i.test(cleanKey)) {
      return { field: 'achievement', value };
    }
    if (/^(?:PREGUNTA(?:\s+(?:PROBLEMATIZADORA|ORIENTADORA|GU[IÍ]A|CLAVE))?)\b/i.test(cleanKey)) {
      return { field: 'question', value };
    }
    if (/^(?:CONTENIDO\s+(?:PARA\s+EL\s+)?(?:ESTUDIANTE|CUADERNO)|CONTENIDO\s+DEL\s+ESTUDIANTE|CUADERNO(?:\s+DEL\s+ESTUDIANTE)?|GU[IÍ]A\s+DEL\s+ESTUDIANTE)\b/i.test(cleanKey)) {
      return { field: 'studentNotebook', value };
    }
    if (/^(?:TALLER|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?)\b/i.test(cleanKey)) {
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

    if (!result.teacherNotebook.additionalNotes && buffers.additionalNotes && buffers.additionalNotes.length > 0) {
      result.teacherNotebook.additionalNotes = buffers.additionalNotes.join('\n').trim();
    } else if (buffers.additionalNotes && buffers.additionalNotes.length > 0) {
      result.teacherNotebook.additionalNotes += '\n' + buffers.additionalNotes.join('\n').trim();
    }
    if (result.teacherNotebook.additionalNotes) result.detected.additionalNotes = true;

    // Salvaguarda: Eliminar encabezados o prefijos truncados como "TALLER / " que hayan quedado huérfanos al final
    if (result.didacticSequence.cierre) {
      result.didacticSequence.cierre = result.didacticSequence.cierre.replace(/(?:^|\n)\s*(?:•\s*)?TALLER\s*[\/:\-]?\s*$/i, '').trim();
    }
    if (result.teacherNotebook.studentNotebookContent) {
      result.teacherNotebook.studentNotebookContent = result.teacherNotebook.studentNotebookContent.replace(/(?:^|\n)\s*(?:•\s*)?TALLER\s*[\/:\-]?\s*$/i, '').trim();
    }

    if (result.metadata.subject || result.metadata.grade || result.metadata.sequenceNumber) {
      result.detected.generalInfo = true;
    }

    result.metadata.hasPart1 = Boolean(result.detected.inicio || result.detected.desarrollo || result.detected.cierre || result.curriculum.topic);
    result.metadata.hasPart2 = Boolean(result.detected.question || result.detected.studentNotebook || result.detected.practicalActivity || result.detected.periodStructure || result.detected.additionalNotes || result.detected.dynamics);
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
