/**
 * GENERADOR NATIVO DE DOCUMENTOS .DOCX BASADO EN LA PLANTILLA OFICIAL INSTITUCIONAL
 * Adaptado al nuevo formato oficial "F-GA PREPARADOR DE CLASE COLEGIO HOGAR" (Ejemplopreparador)
 * Preserva al 100% encabezado nativo, márgenes, tablas estructuradas, anclajes y fuentes oficiales.
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
  /**
   * Genera un archivo .docx nativo inyectando los datos de la planeación in-situ
   * @param {ArrayBuffer|Buffer} templateArrayBuffer
   * @param {Object} planData
   * @param {Object} profileData
   * @returns {Promise<Blob|Buffer>}
   */
  async generateDocx(templateArrayBuffer, planData, profileData) {
    if (typeof JSZip === 'undefined' && typeof require !== 'undefined') {
      global.JSZip = require('jszip');
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

    // 0. Actualizar encabezado institucional si se ha personalizado en el perfil
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

    // 1. Reemplazar valores en la Tabla de Metadatos (Tabla 0)
    // Soportar tanto placeholders explícitos como patrones de plantillas heredadas
    docXml = docXml
      .replace(/{{ASIGNATURA}}/g, escapeXml(subjectText))
      .replace(/{{GRADO}}/g, escapeXml(gradeText))
      .replace(/{{PERIODO}}/g, escapeXml(period))
      .replace(/{{DOCENTE}}/g, escapeXml(teacherName))
      .replace(/{{SEMANA_DEL}}/g, escapeXml(weekRange.start))
      .replace(/{{SEMANA_AL}}/g, escapeXml(weekRange.end));

    // Compatibilidad retroactiva con plantilla antigua si se pasara como buffer
    docXml = docXml.replace(
      /<w:t>_{5,}<\/w:t>/,
      `<w:t xml:space="preserve">${escapeXml(subjectText)}   </w:t>`
    );
    docXml = docXml.replace(
      /<w:t xml:space="preserve">_{4,}\s*<\/w:t>/,
      `<w:t xml:space="preserve">${escapeXml(gradeText)}   </w:t>`
    );
    docXml = docXml.replace(
      /<w:t xml:space="preserve">\s*_{4,}<\/w:t>/,
      `<w:t xml:space="preserve">${escapeXml(period)}   </w:t>`
    );
    docXml = docXml.replace(
      /<w:t xml:space="preserve">\s*_{5,}<\/w:t>/,
      `<w:t xml:space="preserve">${escapeXml(teacherName)}</w:t>`
    );
    docXml = docXml.replace(
      /<w:t xml:space="preserve">\s*_{10,}<\/w:t>/,
      `<w:t xml:space="preserve"> ${escapeXml(weekRange.start)} </w:t>`
    );
    docXml = docXml.replace(
      /<w:t>_ AL<\/w:t>/,
      `<w:t> AL</w:t>`
    );
    docXml = docXml.replace(
      /<w:t xml:space="preserve">\s*_{10,}<\/w:t>/,
      `<w:t xml:space="preserve"> ${escapeXml(weekRange.end)}</w:t>`
    );

    // 2. Localizar y Reemplazar filas de la Tabla de Clases
    const tables = docXml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g);
    let classesTable = null;

    if (tables && tables.length > 0) {
      // Buscar la tabla que contenga el encabezado de clases
      classesTable = tables.find(t => t.includes('CLASE') && (t.includes('FECHA') || t.includes('FECHAd/m/a'))) || (tables.length > 1 ? tables[1] : tables[0]);
    }

    if (classesTable) {
      const headerRow = classesTable.match(/<w:tr[\s\S]*?<\/w:tr>/)[0];
      const tPrMatch = classesTable.match(/<w:tblPr[\s\S]*?<\/w:tblPr>/);
      const tGridMatch = classesTable.match(/<w:tblGrid[\s\S]*?<\/w:tblGrid>/);
      const tPr = tPrMatch ? tPrMatch[0] : '';
      const tGrid = tGridMatch ? tGridMatch[0] : '';

      // Asegurar que el encabezado de la tabla se repita en la siguiente página si la planeación es extensa
      let styledHeaderRow = headerRow;
      if (!styledHeaderRow.includes('<w:tblHeader')) {
        styledHeaderRow = styledHeaderRow.replace(/<w:trPr>/, '<w:trPr><w:tblHeader/><w:cantSplit/>');
      }

      function cellParagraphs(text, isCentered = false, isBold = false) {
        if (!text) {
          return '<w:p><w:pPr><w:jc w:val="' + (isCentered ? 'center' : 'left') + '"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/></w:rPr></w:pPr></w:p>';
        }
        const lines = String(text).split('\n');

        function renderInlineRuns(rawStr, forceBold = false) {
          if (!rawStr) return '';
          if (forceBold) {
            return `
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                  <w:b/>
                  <w:sz w:val="20"/>
                </w:rPr>
                <w:t xml:space="preserve">${escapeXml(rawStr)}</w:t>
              </w:r>
            `;
          }

          const parts = rawStr.split(/(\*\*.*?\*\*)/g);
          return parts.map(part => {
            if (!part) return '';
            const isPartBold = part.startsWith('**') && part.endsWith('**') && part.length >= 4;
            const content = isPartBold ? part.slice(2, -2) : part;
            return `
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                  ${isPartBold ? '<w:b/>' : ''}
                  <w:sz w:val="20"/>
                </w:rPr>
                <w:t xml:space="preserve">${escapeXml(content)}</w:t>
              </w:r>
            `;
          }).join('');
        }

        return lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) {
            return '<w:p><w:pPr><w:jc w:val="' + (isCentered ? 'center' : 'left') + '"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/></w:rPr></w:pPr></w:p>';
          }

          const prefixMatch = trimmed.match(/^([●•\s]*(?:\*{0,2}(?:FASE\s+DE\s+(?:INICIO|DESARROLLO|CIERRE)|(?:Fase\s+de\s+)?(?:Inicio|Desarrollo|Cierre)|Recursos(?: didácticos)?|Evaluaci[oó]n(?: formativa)?|Estándar|Pregunta problematizadora|Tareas?(?:\s*\/\s*Compromisos?)?|Eje\s+temático|Metodología|Tiempo\s+disponible|Clase)(?:\s*\([^)]*\))?\*{0,2}):?)(.*)$/i);

          if (prefixMatch && !isBold) {
            let prefix = prefixMatch[1].replace(/\*\*/g, '');
            const rest = prefixMatch[2];
            return `
              <w:p>
                <w:pPr>
                  <w:jc w:val="${isCentered ? 'center' : 'left'}"/>
                  <w:rPr>
                    <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                    <w:sz w:val="20"/>
                  </w:rPr>
                </w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                    <w:b/>
                    <w:sz w:val="20"/>
                  </w:rPr>
                  <w:t xml:space="preserve">${escapeXml(prefix)}</w:t>
                </w:r>
                ${renderInlineRuns(rest, false)}
              </w:p>
            `;
          }

          return `
            <w:p>
              <w:pPr>
                <w:jc w:val="${isCentered ? 'center' : 'left'}"/>
                <w:rPr>
                  <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                  ${isBold ? '<w:b/>' : ''}
                  <w:sz w:val="20"/>
                </w:rPr>
              </w:pPr>
              ${renderInlineRuns(trimmed, isBold)}
            </w:p>
          `;
        }).join('');
      }

      const rowsXml = (planData.classes || []).map((cls, idx) => {
        const shortDate = (typeof ExportService !== 'undefined' && ExportService.formatShortDate)
          ? ExportService.formatShortDate(cls.date || planData.date)
          : (cls.date || planData.date || '');
        const classNum = cls.dayNumber ? cls.dayNumber.replace(/[^0-9]/g, '') || String(idx + 1) : String(idx + 1);
        const dayOfWeek = cls.dayOfWeek || ((typeof ExportService !== 'undefined' && ExportService.getDayOfWeekName)
          ? ExportService.getDayOfWeekName(planData.date)
          : 'Lunes');

        const isDirGroup = cls.subject && String(cls.subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');

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
        descRaw = descRaw.replace(/(?<!^)(?<!\()[ \t]*(\*{0,2}(?:FASE\s+DE\s+(?:INICIO|DESARROLLO|CIERRE)|(?:Fase\s+de\s+)?(?:Inicio|Desarrollo|Cierre)|Recursos(?: didácticos)?|Evaluaci[oó]n(?: formativa)?|Estándar|Pregunta problematizadora|Tareas?(?:\s*\/\s*Compromisos?)?)\*{0,2})\s*:\s*/gi, '\n\n$1: ');
        descRaw = descRaw.replace(/(?<!^)[ \t]*(\*{0,2}(?:FASE\s+DE\s+(?:INICIO|DESARROLLO|CIERRE))(?:[ \t]*\([^)]*\))?\*{0,2})(?=\n|$|[ \t]+[A-ZÁÉÍÓÚ])/gi, '\n\n$1\n\n');
        const sequence = descRaw.trim();

        return `
          <w:tr w:rsidR="00523ABE" w:rsidTr="00786631">
            <w:trPr>
              <w:trHeight w:val="240"/>
              <w:cantSplit/>
            </w:trPr>
            <w:tc><w:tcPr><w:tcW w:w="535" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>${cellParagraphs(shortDate, true)}</w:tc>
            <w:tc><w:tcPr><w:tcW w:w="329" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>${cellParagraphs(classNum, true, true)}</w:tc>
            <w:tc><w:tcPr><w:tcW w:w="338" w:type="pct"/><w:vAlign w:val="center"/></w:tcPr>${cellParagraphs(dayOfWeek, true)}</w:tc>
            <w:tc><w:tcPr><w:tcW w:w="394" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>${cellParagraphs(dba)}</w:tc>
            <w:tc><w:tcPr><w:tcW w:w="394" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>${cellParagraphs(achievement)}</w:tc>
            <w:tc><w:tcPr><w:tcW w:w="633" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>${cellParagraphs(topic, false, true)}</w:tc>
            <w:tc><w:tcPr><w:tcW w:w="2377" w:type="pct"/><w:vAlign w:val="top"/></w:tcPr>${cellParagraphs(sequence)}</w:tc>
          </w:tr>
        `;
      }).join('');

      const newTable1 = `<w:tbl>${tPr}${tGrid}${styledHeaderRow}${rowsXml}</w:tbl>`;
      docXml = docXml.replace(classesTable, newTable1);
    }

    // 3. Reemplazar Observaciones en la Tabla de Observaciones (Tabla 2)
    let notesText = '';
    if (planData.classes && planData.classes.length > 0) {
      const classNotes = planData.classes
        .map((c, i) => {
          const obs = (c.observations || '').trim();
          if (!obs) return null;
          if (planData.classes.length === 1) return escapeXml(obs);
          const cNum = c.dayNumber ? `Clase ${String(c.dayNumber).replace(/[^0-9]/g, '') || c.dayNumber}` : `Clase ${i + 1}`;
          const cSub = c.subject ? ` (${c.subject})` : '';
          return `• ${cNum}${cSub}: ${escapeXml(obs)}`;
        })
        .filter(Boolean);
      if (classNotes.length > 0) {
        notesText = classNotes.join('\n');
      }
    }
    if (!notesText && planData.generalNotes) {
      notesText = escapeXml(planData.generalNotes);
    }

    // Inyectar en la tabla de observaciones
    if (docXml.includes('{{OBSERVACIONES}}')) {
      let obsXmlParagraphs = '';
      if (notesText) {
        const obsLines = notesText.split('\n');
        obsXmlParagraphs = obsLines.map(line => `
          <w:p>
            <w:pPr>
              <w:rPr>
                <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                <w:sz w:val="20"/>
                <w:szCs w:val="20"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                <w:sz w:val="20"/>
                <w:szCs w:val="20"/>
              </w:rPr>
              <w:t xml:space="preserve">${escapeXml(line)}</w:t>
            </w:r>
          </w:p>
        `).join('');
      } else {
        obsXmlParagraphs = `
          <w:p>
            <w:pPr>
              <w:rPr>
                <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                <w:sz w:val="20"/>
                <w:szCs w:val="20"/>
              </w:rPr>
            </w:pPr>
          </w:p>
        `;
      }

      // Reemplazar el párrafo que contiene {{OBSERVACIONES}} dentro de su celda
      docXml = docXml.replace(
        /<w:p\b[^>]*>(?:(?!<w:p\b)[\s\S])*?{{OBSERVACIONES}}[\s\S]*?<\/w:p>/,
        obsXmlParagraphs
      );
      // Fallback si quedó como texto suelto
      docXml = docXml.replace(/{{OBSERVACIONES}}/g, escapeXml(notesText || ''));
    } else if (notesText) {
      docXml = docXml.replace(
        /<w:t>_{50,}<\/w:t>/,
        `<w:t xml:space="preserve">${notesText}</w:t>`
      );
    }

    // 4. Inyectar Sello y Visto Bueno de Coordinación Académica si existe
    if (planData.coordinatorReview && planData.coordinatorReview.status) {
      const rev = planData.coordinatorReview;
      const statusTitle = rev.status === 'approved' 
        ? 'REVISIÓN &amp; VISTO BUENO OFICIAL: APROBADO' 
        : (rev.status === 'approved_with_notes' ? 'REVISIÓN DE COORDINACIÓN: APROBADO CON SUGERENCIAS' : 'REVISIÓN DE COORDINACIÓN: REQUIERE AJUSTES');
      const reviewer = escapeXml(rev.reviewerName || 'Coordinación Académica');
      const revDate = escapeXml(rev.date || '');
      const revComments = rev.comments ? escapeXml(rev.comments) : '';

      const coordinatorTableXml = `
        <w:tbl>
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
          <w:tblGrid>
            <w:gridCol w:w="13892"/>
          </w:tblGrid>
          <w:tr>
            <w:trPr><w:cantSplit/></w:trPr>
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="5008" w:type="pct"/>
                <w:shd w:val="clear" w:color="auto" w:fill="F0F9FF"/>
              </w:tcPr>
              <w:p>
                <w:pPr>
                  <w:rPr>
                    <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                    <w:b/>
                    <w:sz w:val="20"/>
                    <w:color w:val="0369A1"/>
                  </w:rPr>
                </w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                    <w:b/>
                    <w:sz w:val="20"/>
                    <w:color w:val="0369A1"/>
                  </w:rPr>
                  <w:t>${statusTitle}</w:t>
                </w:r>
              </w:p>
              ${revComments ? `
              <w:p>
                <w:pPr>
                  <w:rPr>
                    <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                    <w:i/>
                    <w:sz w:val="18"/>
                    <w:color w:val="1E293B"/>
                  </w:rPr>
                </w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                    <w:i/>
                    <w:sz w:val="18"/>
                    <w:color w:val="1E293B"/>
                  </w:rPr>
                  <w:t xml:space="preserve">"${revComments}"</w:t>
                </w:r>
              </w:p>` : ''}
              <w:p>
                <w:pPr>
                  <w:jc w:val="right"/>
                  <w:rPr>
                    <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                    <w:sz w:val="16"/>
                    <w:color w:val="64748B"/>
                  </w:rPr>
                </w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>
                    <w:sz w:val="16"/>
                    <w:color w:val="64748B"/>
                  </w:rPr>
                  <w:t xml:space="preserve">Revisado por: ${reviewer}  •  Fecha: ${revDate}</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      // Insertar antes de sectPr
      docXml = docXml.replace(/(<w:sectPr[\s\S]*?<\/w:sectPr>)/, `${coordinatorTableXml}<w:p/>$1`);
    }

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
