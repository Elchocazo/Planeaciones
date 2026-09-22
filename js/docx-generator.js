/**
 * GENERADOR NATIVO DE DOCUMENTOS .DOCX BASADO EN LA PLANTILLA OFICIAL INSTITUCIONAL
 * v3.0 - Genera el cuerpo del documento completamente desde cero para prevenir
 * saltos de página al exportar a Word. Preserva header1.xml, estilos y márgenes del template.
 */

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const DocxTemplateEngine = {
  _loadingJSZip: null,

  async loadJSZip() {
    if (typeof JSZip !== 'undefined') return window.JSZip || JSZip;
    if (this._loadingJSZip) return this._loadingJSZip;
    if (typeof require !== 'undefined') {
      global.JSZip = require('jszip');
      return global.JSZip;
    }
    if (typeof document !== 'undefined') {
      this._loadingJSZip = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'js/jszip.min.js';
        script.onload = () => resolve(window.JSZip);
        script.onerror = (e) => reject(new Error('Error al cargar jszip.min.js'));
        document.head.appendChild(script);
      });
      return this._loadingJSZip;
    }
    throw new Error('JSZip no disponible');
  },

  /**
   * Genera un archivo .docx nativo.
   * Reemplaza COMPLETAMENTE el <w:body> del template con contenido generado fresco,
   * eliminando toda posibilidad de saltos de página causados por párrafos heredados del template.
   */
  async generateDocx(templateArrayBuffer, planData, profileData) {
    if (typeof JSZip === 'undefined') {
      await this.loadJSZip();
    }

    const zip = await JSZip.loadAsync(templateArrayBuffer);
    let docXml = await zip.file('word/document.xml').async('string');

    const teacherName = profileData?.name || 'Docente';
    const period = planData?.period || profileData?.period || '1°';

    const subjects = [...new Set((planData.classes || []).map(c => c.subject).filter(Boolean))];
    const grades = [...new Set((planData.classes || []).map(c => c.grade).filter(Boolean))];
    const subjectText = subjects.length > 0 ? subjects.join(' - ') : (profileData?.subjects?.[0]?.name || '');
    const gradeText = grades.length > 0 ? grades.join(', ') : (profileData?.homeroom || '');

    const weekRange = (typeof ExportService !== 'undefined' && ExportService.getWeekRange)
      ? ExportService.getWeekRange(planData.date)
      : this.getWeekRangeFallback(planData.date);

    // 0. Actualizar encabezado institucional si se ha personalizado
    const headerFile = zip.file('word/header1.xml');
    if (headerFile) {
      let headerXml = await headerFile.async('string');
      if (profileData?.institution && profileData.institution !== 'COLEGIO HOGAR MADRE DE DIOS') {
        headerXml = headerXml.replace(/COLEGIO HOGAR MADRE DE DIOS/g, escapeXml(profileData.institution));
      }
      if (profileData?.code && profileData.code !== 'F- GA') {
        headerXml = headerXml.replace(/F-\s*GA/g, escapeXml(profileData.code));
      }
      if (profileData?.version && profileData.version !== '02') {
        headerXml = headerXml.replace(/VERSION:\s*02/g, `VERSION: ${escapeXml(profileData.version)}`);
      }
      if (profileData?.formatDate && profileData.formatDate !== '31.JUL.26') {
        headerXml = headerXml.replace(/31\.JUL\.26/g, escapeXml(profileData.formatDate));
      }
      zip.file('word/header1.xml', headerXml);
    }

    // 1. Extraer sectPr del template (preserva orientación landscape y márgenes)
    const sectPrMatch = docXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
    const sectPr = sectPrMatch ? sectPrMatch[0] : this.getDefaultSectPr();

    // 2. Generar el contenido del cuerpo COMPLETAMENTE DESDE CERO
    const freshBody = this.buildFreshBody(planData, profileData, period, teacherName, subjectText, gradeText, weekRange);

    // 3. Reemplazar TODO el contenido de <w:body> preservando el XML exterior del documento
    docXml = docXml.replace(
      /<w:body>[\s\S]*<\/w:body>/,
      `<w:body>${freshBody}${sectPr}</w:body>`
    );

    zip.file('word/document.xml', docXml);

    if (typeof window !== 'undefined') {
      return await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    } else {
      return await zip.generateAsync({ type: 'nodebuffer' });
    }
  },

  getDefaultSectPr() {
    return `<w:sectPr><w:headerReference w:type="default" r:id="rId8"/><w:pgSz w:w="15842" w:h="12242" w:orient="landscape" w:code="1"/><w:pgMar w:top="3261" w:right="533" w:bottom="720" w:left="1418" w:header="2269" w:footer="709" w:gutter="0"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>`;
  },

  /**
   * Construye el cuerpo completo del documento Word desde cero.
   * - Tabla de metadatos (ASIGNATURA, GRADO, etc.)
   * - Párrafo separador mínimo (altura 0)
   * - Tabla de clases (SIN <w:tblHeader/> para evitar saltos de página)
   * - Párrafo separador mínimo
   * - Tabla de observaciones
   */
  buildFreshBody(planData, profileData, period, teacherName, subjectText, gradeText, weekRange) {
    const miniSep = `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="120" w:lineRule="exact"/><w:rPr><w:sz w:val="2"/><w:szCs w:val="2"/></w:rPr></w:pPr></w:p>`;

    const metaTable = this.buildMetaTable(subjectText, gradeText, period, teacherName, weekRange);
    const classesTable = this.buildClassesTable(planData, period);
    const obsTable = this.buildObsTable(planData);

    let coordBlock = '';
    if (planData.coordinatorReview && planData.coordinatorReview.status) {
      coordBlock = miniSep + this.buildCoordTable(planData.coordinatorReview);
    }

    return metaTable + miniSep + classesTable + miniSep + obsTable + coordBlock;
  },

  /**
   * Tabla de metadatos (ASIGNATURA / GRADO / PERIODO / DOCENTE / SEMANA DEL / AL)
   * Columnas en dxa: [1800, 4580, 1380, 2640, 1380, 2110] ≈ 13890 twips total
   */
  buildMetaTable(subjectText, gradeText, period, teacherName, weekRange) {
    const cols = [1800, 4580, 1380, 2640, 1380, 2110];

    const mkCell = (text, colIdx, alignRight = false, bold = false) => {
      const jc = alignRight ? 'right' : 'left';
      const boldTag = bold ? '<w:b/><w:bCs/>' : '';
      return `<w:tc>
  <w:tcPr><w:tcW w:w="${cols[colIdx]}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
  <w:p>
    <w:pPr>
      <w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/>
      <w:jc w:val="${jc}"/>
      <w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>${boldTag}<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>
    </w:pPr>
    <w:r>
      <w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>${boldTag}<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>
      <w:t xml:space="preserve">${escapeXml(text || '')}</w:t>
    </w:r>
  </w:p>
</w:tc>`;
    };

    return `<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="Tablaconcuadrcula"/>
    <w:tblW w:w="5000" w:type="pct"/>
    <w:tblInd w:w="-289" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblCellMar>
      <w:top w:w="55" w:type="dxa"/>
      <w:left w:w="108" w:type="dxa"/>
      <w:bottom w:w="55" w:type="dxa"/>
      <w:right w:w="108" w:type="dxa"/>
    </w:tblCellMar>
    <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
  </w:tblPr>
  <w:tblGrid>
    ${cols.map(c => `<w:gridCol w:w="${c}"/>`).join('\n    ')}
  </w:tblGrid>
  <w:tr>
    <w:trPr><w:trHeight w:val="460" w:hRule="atLeast"/></w:trPr>
    ${mkCell('ASIGNATURA:', 0, true, true)}
    ${mkCell(subjectText, 1, false, false)}
    ${mkCell('GRADO:', 2, true, true)}
    ${mkCell(gradeText, 3, false, false)}
    ${mkCell('PERIODO:', 4, true, true)}
    ${mkCell(period, 5, false, false)}
  </w:tr>
  <w:tr>
    <w:trPr><w:trHeight w:val="460" w:hRule="atLeast"/></w:trPr>
    ${mkCell('DOCENTE:', 0, true, true)}
    ${mkCell(teacherName, 1, false, false)}
    ${mkCell('SEMANA DEL', 2, true, true)}
    ${mkCell(weekRange.start, 3, false, false)}
    ${mkCell('AL', 4, true, true)}
    ${mkCell(weekRange.end, 5, false, false)}
  </w:tr>
</w:tbl>`;
  },

  /**
   * Tabla de clases.
   * IMPORTANTE: NO usa <w:tblHeader/> en la fila de encabezado.
   * Esto evita que el algoritmo de paginación de Word empuje TODA la tabla
   * a la siguiente página cuando el primer renglón de datos es muy alto.
   */
  buildClassesTable(planData, period) {
    // Anchos de columna en pct (5000 = 100%)
    const pcts = [535, 329, 338, 394, 394, 633, 2377];

    // Fila de encabezado de la tabla de clases
    // Sin <w:tblHeader/> ni <w:cantSplit/> para prevenir el salto de página
    const headerCellXml = (txt, pct, center = true) => {
      const jc = center ? 'center' : 'both';
      return `<w:tc>
  <w:tcPr><w:tcW w:w="${pct}" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>
  <w:p>
    <w:pPr>
      <w:spacing w:before="40" w:after="40" w:line="220" w:lineRule="auto"/>
      <w:jc w:val="${jc}"/>
      <w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:bCs/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
    </w:pPr>
    ${txt.split('\n').map((line, i) => `<w:r${i > 0 ? '><w:br/>' : '>'}<w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:bCs/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>`).join('')}
  </w:p>
</w:tc>`;
    };

    const headerRow = `<w:tr>
  <w:trPr><w:trHeight w:val="600" w:hRule="atLeast"/></w:trPr>
  ${headerCellXml('FECHA\nd/m/a', pcts[0])}
  ${headerCellXml('CLASE', pcts[1])}
  ${headerCellXml('DÍA', pcts[2])}
  ${headerCellXml('DBA', pcts[3])}
  ${headerCellXml('LOGRO E\nINDICADOR', pcts[4])}
  ${headerCellXml('TEMA', pcts[5])}
  ${headerCellXml('Secuencia didáctica Inicio-Desarrollo -cierre\n(Descripción del desarrollo de la clase Recursos Didácticos – Tarea – Evaluación-Talleres-Quiz)', pcts[6], false)}
</w:tr>`;

    // Función para generar párrafos dentro de una celda con formato semántico
    function cellParagraphs(text, alignMode = 'left', isBold = false) {
      let jcVal = 'left';
      if (alignMode === true || alignMode === 'center') jcVal = 'center';
      else if (alignMode === 'both' || alignMode === 'justify') jcVal = 'both';
      else if (alignMode === 'right') jcVal = 'right';

      if (!text) {
        return `<w:p><w:pPr><w:jc w:val="${jcVal}"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/></w:rPr></w:pPr></w:p>`;
      }
      const lines = String(text).split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        return `<w:p><w:pPr><w:jc w:val="${jcVal}"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/></w:rPr></w:pPr></w:p>`;
      }

      function renderInlineRuns(rawStr, forceBold = false) {
        if (!rawStr) return '';
        if (forceBold) {
          return `<w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(rawStr)}</w:t></w:r>`;
        }
        const parts = rawStr.split(/(\*\*.*?\*\*)/g);
        return parts.map(part => {
          if (!part) return '';
          const isPartBold = part.startsWith('**') && part.endsWith('**') && part.length >= 4;
          const content = isPartBold ? part.slice(2, -2) : part;
          return `<w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>${isPartBold ? '<w:b/>' : ''}<w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(content)}</w:t></w:r>`;
        }).join('');
      }

      const phasePrefixes = [
        'FASE\\s+DE\\s+(?:INICIO|DESARROLLO|CIERRE)',
        '(?<!FASE\\s+DE\\s+)(?:Inicio|Desarrollo|Cierre)',
        'Recursos(?:\\s+did[aá]cticos)?(?:\\s*[:\\/-]?\\s*(?:y\\s+)?materiales)?',
        'Evaluaci[oó]n(?:\\s+formativa)?',
        'Est[aá]ndar(?:\\s+b[aá]sico)?',
        'Pregunta\\s+problematizadora',
        'Tareas?(?:\\s*[\\/:]\\s*Compromisos?)?(?:\\s*[:\\/-]?\\s*(?:y\\s+)?actividades\\s+extraclase)?',
        'Compromisos?',
        'Eje\\s+tem[aá]tico',
        'Metodolog[íi]a',
        'Tiempo\\s+disponible'
      ].join('|');

      return lines.map((trimmed, idx) => {
        const spacingXml = idx === 0
          ? '<w:spacing w:before="20" w:after="40" w:line="240" w:lineRule="auto"/>'
          : '<w:spacing w:before="60" w:after="40" w:line="240" w:lineRule="auto"/>';

        const prefixRe = new RegExp(
          `^([●•\\s]*(?:\\*{0,2}(?:${phasePrefixes})(?:\\s*\\([^)]*\\))?\\*{0,2}):?)(.*)$`,
          'i'
        );
        const prefixMatch = trimmed.match(prefixRe);

        if (prefixMatch && !isBold) {
          let rawPrefix = prefixMatch[1].replace(/\*\*/g, '').trim();
          let rest = prefixMatch[2] || '';

          if (/^([●•\s]*)Recursos(?:\s+did[aá]cticos)?(?:\s*[:\/-]?\s*(?:y\s+)?materiales)?(?:\s*\([^)]*\))?:?$/i.test(rawPrefix)) {
            const bulletMatch = rawPrefix.match(/^([●•\s]*)/);
            const bullet = bulletMatch ? bulletMatch[1] : '';
            rawPrefix = `${bullet}Recursos didácticos y materiales:`;
            rest = rest.replace(/^(?:\s*[:\/-]?\s*(?:Y\s+)?MATERIALES\b\s*:?)/i, '');
          } else if (/^([●•\s]*)Tareas?(?:\s*[\/:]\s*Compromisos?)?(?:\s*[:\/-]?\s*(?:y\s+)?actividades\s+extraclase)?(?:\s*\([^)]*\))?:?$/i.test(rawPrefix)) {
            const bulletMatch = rawPrefix.match(/^([●•\s]*)/);
            const bullet = bulletMatch ? bulletMatch[1] : '';
            rawPrefix = `${bullet}Tareas / Compromisos:`;
            rest = rest.replace(/^(?:\s*[:\/-]?\s*(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE\b\s*:?)/i, '');
          }

          if (rest.trim()) rest = ' ' + rest.trim();
          else rest = '';

          return `<w:p>
  <w:pPr>${spacingXml}<w:jc w:val="${jcVal}"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/></w:rPr></w:pPr>
  <w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(rawPrefix)}</w:t></w:r>
  ${renderInlineRuns(rest, false)}
</w:p>`;
        }

        return `<w:p>
  <w:pPr>${spacingXml}<w:jc w:val="${jcVal}"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>${isBold ? '<w:b/>' : ''}<w:sz w:val="20"/></w:rPr></w:pPr>
  ${renderInlineRuns(trimmed, isBold)}
</w:p>`;
      }).join('');
    }

    const phasePrefixList = [
      'FASE\\s+DE\\s+(?:INICIO|DESARROLLO|CIERRE)',
      '(?<!FASE\\s+DE\\s+)(?:Inicio|Desarrollo|Cierre)',
      'Recursos(?:\\s+did[aá]cticos)?(?:\\s*[:\\/-]?\\s*(?:y\\s+)?materiales)?',
      'Evaluaci[oó]n(?:\\s+formativa)?',
      'Est[aá]ndar(?:\\s+b[aá]sico)?',
      'Pregunta\\s+problematizadora',
      'Tareas?(?:\\s*[\\/:]\\s*Compromisos?)?(?:\\s*[:\\/-]?\\s*(?:y\\s+)?actividades\\s+extraclase)?',
      'Compromisos?',
      'Eje\\s+tem[aá]tico',
      'Metodolog[íi]a',
      'Tiempo\\s+disponible'
    ].join('|');
    const phaseColonRegex = new RegExp(`(?<!^)(?<!\\()[ \\t]*(\\*{0,2}(?:${phasePrefixList})(?:[ \\t]*\\([^)]*\\))?\\*{0,2})\\s*:\\s*`, 'gi');

    const rowsXml = (planData.classes || []).map((cls, idx) => {
      const shortDate = (typeof ExportService !== 'undefined' && ExportService.formatShortDate)
        ? ExportService.formatShortDate(cls.date || planData.date)
        : (cls.date || planData.date || '');
      const classNum = cls.dayNumber ? cls.dayNumber.replace(/[^0-9]/g, '') || String(idx + 1) : String(idx + 1);
      const dayOfWeek = cls.dayOfWeek || ((typeof ExportService !== 'undefined' && ExportService.getDayOfWeekName)
        ? ExportService.getDayOfWeekName(planData.date)
        : 'Lunes');

      const isDirGroup = cls.subject && String(cls.subject).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('direccion de grupo');

      let dba = isDirGroup ? 'No aplica' : (cls.dba || '');
      let achievement = isDirGroup ? 'No aplica' : (cls.achievement || cls.performance || '');
      let topic = isDirGroup ? 'Asesoría general' : (cls.topic || '');

      if (!isDirGroup && (!dba || !topic || !achievement) && typeof CurriculumService !== 'undefined') {
        const autoCur = CurriculumService.getAutoCurriculumItem(period, cls.subject, cls.grade, cls.dayNumber || classNum);
        if (autoCur) {
          if (!dba) dba = autoCur.dba;
          if (!achievement) achievement = autoCur.achievement;
          if (!topic) topic = autoCur.topic;
        }
      }

      let descRaw = (cls.description || '');
      descRaw = descRaw
        .replace(/(?:Recursos\s+did[aá]cticos?\s*:\s*(?:Y\s+)?MATERIALES|Recursos\s+did[aá]cticos?\s+y\s+materiales\s*:?)/gi, 'Recursos didácticos y materiales:')
        .replace(/(?:Tareas?(?:\s*[\/:]\s*Compromisos?)?\s*:\s*(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE|Tareas?(?:\s*[\/:]\s*Compromisos?)?\s*y\s+actividades\s+extraclase\s*:?)/gi, 'Tareas / Compromisos:');
      descRaw = descRaw.replace(phaseColonRegex, '\n\n$1: ');
      descRaw = descRaw.replace(/\n{3,}/g, '\n\n');
      const sequence = descRaw.trim();

      return `<w:tr w:rsidR="00523ABE" w:rsidTr="00786631">
  <w:trPr><w:trHeight w:val="240"/></w:trPr>
  <w:tc><w:tcPr><w:tcW w:w="${pcts[0]}" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>${cellParagraphs(shortDate, 'center')}</w:tc>
  <w:tc><w:tcPr><w:tcW w:w="${pcts[1]}" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>${cellParagraphs(classNum, 'center', true)}</w:tc>
  <w:tc><w:tcPr><w:tcW w:w="${pcts[2]}" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>${cellParagraphs(dayOfWeek, 'center')}</w:tc>
  <w:tc><w:tcPr><w:tcW w:w="${pcts[3]}" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>${cellParagraphs(dba, 'both')}</w:tc>
  <w:tc><w:tcPr><w:tcW w:w="${pcts[4]}" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>${cellParagraphs(achievement, 'both')}</w:tc>
  <w:tc><w:tcPr><w:tcW w:w="${pcts[5]}" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>${cellParagraphs(topic, 'left', true)}</w:tc>
  <w:tc><w:tcPr><w:tcW w:w="${pcts[6]}" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>${cellParagraphs(sequence, 'both')}</w:tc>
</w:tr>`;
    }).join('');

    return `<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="Tablaconcuadrcula"/>
    <w:tblW w:w="5000" w:type="pct"/>
    <w:tblInd w:w="-289" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblCellMar>
      <w:top w:w="55" w:type="dxa"/>
      <w:left w:w="108" w:type="dxa"/>
      <w:bottom w:w="55" w:type="dxa"/>
      <w:right w:w="108" w:type="dxa"/>
    </w:tblCellMar>
    <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="1488"/>
    <w:gridCol w:w="914"/>
    <w:gridCol w:w="939"/>
    <w:gridCol w:w="1093"/>
    <w:gridCol w:w="1093"/>
    <w:gridCol w:w="1760"/>
    <w:gridCol w:w="6604"/>
  </w:tblGrid>
  ${headerRow}
  ${rowsXml}
</w:tbl>`;
  },

  /**
   * Tabla de observaciones y cuaderno
   */
  buildObsTable(planData) {
    let notesText = '';
    if (planData.classes && planData.classes.length > 0) {
      const classNotes = planData.classes
        .map((c, i) => {
          const obs = (c.observations || '').trim();
          if (!obs) return null;
          if (planData.classes.length === 1) return obs;
          const cNum = c.dayNumber ? `Clase ${String(c.dayNumber).replace(/[^0-9]/g, '') || c.dayNumber}` : `Clase ${i + 1}`;
          const cSub = c.subject ? ` (${c.subject})` : '';
          return `• ${cNum}${cSub}: ${obs}`;
        })
        .filter(Boolean);
      if (classNotes.length > 0) notesText = classNotes.join('\n');
    }
    if (!notesText && planData.generalNotes) notesText = planData.generalNotes;

    const obsParagraphs = notesText
      ? notesText.split('\n').map(line => `<w:p>
  <w:pPr><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr>
  <w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>
</w:p>`).join('')
      : `<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr></w:p>`;

    const cuadernoCell = `<w:p>
  <w:pPr><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr>
</w:p>`;

    return `<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="Tablaconcuadrcula"/>
    <w:tblW w:w="5000" w:type="pct"/>
    <w:tblInd w:w="-289" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblCellMar>
      <w:top w:w="55" w:type="dxa"/>
      <w:left w:w="108" w:type="dxa"/>
      <w:bottom w:w="55" w:type="dxa"/>
      <w:right w:w="108" w:type="dxa"/>
    </w:tblCellMar>
    <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="10418"/>
    <w:gridCol w:w="3473"/>
  </w:tblGrid>
  <w:tr>
    <w:trPr><w:trHeight w:val="300" w:hRule="atLeast"/></w:trPr>
    <w:tc>
      <w:tcPr><w:tcW w:w="3750" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>
      <w:p>
        <w:pPr>
          <w:spacing w:before="40" w:after="40"/>
          <w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:bCs/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>
        </w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:bCs/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>OBSERVACIONES:</w:t></w:r>
      </w:p>
      ${obsParagraphs}
    </w:tc>
    <w:tc>
      <w:tcPr><w:tcW w:w="1250" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>
      <w:p>
        <w:pPr>
          <w:spacing w:before="40" w:after="40"/>
          <w:jc w:val="center"/>
          <w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:bCs/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>
        </w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:bCs/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>CUADERNO</w:t></w:r>
      </w:p>
      ${cuadernoCell}
    </w:tc>
  </w:tr>
</w:tbl>`;
  },

  /**
   * Tabla de revisión de coordinación académica (opcional)
   */
  buildCoordTable(rev) {
    const statusTitle = rev.status === 'approved'
      ? 'REVISIÓN &amp; VISTO BUENO OFICIAL: APROBADO'
      : (rev.status === 'approved_with_notes' ? 'REVISIÓN DE COORDINACIÓN: APROBADO CON SUGERENCIAS' : 'REVISIÓN DE COORDINACIÓN: REQUIERE AJUSTES');
    const reviewer = escapeXml(rev.reviewerName || 'Coordinación Académica');
    const revDate = escapeXml(rev.date || '');
    const revComments = rev.comments ? escapeXml(rev.comments) : '';

    return `<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="Tablaconcuadrcula"/>
    <w:tblW w:w="5008" w:type="pct"/>
    <w:tblInd w:w="-289" w:type="dxa"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:space="0" w:color="0284C7"/>
      <w:left w:val="single" w:sz="6" w:space="0" w:color="0284C7"/>
      <w:bottom w:val="single" w:sz="6" w:space="0" w:color="0284C7"/>
      <w:right w:val="single" w:sz="6" w:space="0" w:color="0284C7"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="BAE6FD"/>
      <w:insideV w:val="none"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid><w:gridCol w:w="13892"/></w:tblGrid>
  <w:tr>
    <w:tc>
      <w:tcPr><w:tcW w:w="5008" w:type="pct"/><w:shd w:val="clear" w:color="auto" w:fill="F0F9FF"/></w:tcPr>
      <w:p><w:pPr><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:sz w:val="20"/><w:color w:val="0369A1"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:b/><w:sz w:val="20"/><w:color w:val="0369A1"/></w:rPr><w:t>${statusTitle}</w:t></w:r></w:p>
      ${revComments ? `<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:i/><w:sz w:val="18"/><w:color w:val="1E293B"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:i/><w:sz w:val="18"/><w:color w:val="1E293B"/></w:rPr><w:t xml:space="preserve">"${revComments}"</w:t></w:r></w:p>` : ''}
      <w:p><w:pPr><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t xml:space="preserve">Revisado por: ${reviewer}  •  Fecha: ${revDate}</w:t></w:r></w:p>
    </w:tc>
  </w:tr>
</w:tbl>`;
  },

  getWeekRangeFallback(dateStr) {
    if (!dateStr) return { start: '', end: '' };
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = (date.getDay() + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const formatD = (d) => {
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${day} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
    };
    return {
      start: formatD(monday),
      end: formatD(friday)
    };
  }
};

if (typeof window !== 'undefined') {
  window.DocxTemplateEngine = DocxTemplateEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DocxTemplateEngine;
}
