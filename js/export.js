/**
 * MÓDULO DE EXPORTACIÓN Y VISTA PREVIA INSTITUCIONAL
 * Reproduce exactamente el formato oficial "PREPARADOR DE CLASES - COLEGIO HOGAR MADRE DE DIOS"
 * Integrado con el motor de plantilla nativa .DOCX (Preparador.docx)
 */

const ExportService = {
  /**
   * Obtiene el rango de la semana (Lunes a Viernes) para una fecha dada
   */
  getWeekRange(dateStr) {
    if (!dateStr) return { start: '', end: '' };
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    
    const dayOfWeek = (date.getDay() + 6) % 7; // 0=Lunes, 4=Viernes
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
  },

  /**
   * Obtiene la lista de fechas YYYY-MM-DD de Lunes a Viernes de la semana
   */
  getWeekDates(dateStr) {
    if (!dateStr) return [];
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = (date.getDay() + 6) % 7; // 0=Lunes
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek);

    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${day}`);
    }
    return dates;
  },

  /**
   * Formatea una fecha YYYY-MM-DD a formato corto d/m/a (ej. 17/08/2026)
   */
  formatShortDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  },

  /**
   * Formatea una fecha YYYY-MM-DD a formato largo (ej. 17 de Agosto de 2026)
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const d = parseInt(parts[2], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[0], 10);
    return `${d} de ${months[m]} de ${y}`;
  },

  /**
   * Genera el HTML exacto de la hoja "PREPARADOR DE CLASES" como se ve en la imagen
   */
  generatePreparadorHTML(planData, profileData) {
    const institution = profileData?.institution || 'COLEGIO HOGAR MADRE DE DIOS';
    const code = profileData?.code || 'F- GA';
    const version = profileData?.version || '02';
    const formatDate = profileData?.formatDate || '31.JUL.26';
    const teacherName = profileData?.name || 'Docente';
    const period = planData?.period || profileData?.period || '1°';

    const subjects = [...new Set(planData.classes.map(c => c.subject).filter(Boolean))];
    const grades = [...new Set(planData.classes.map(c => c.grade).filter(Boolean))];
    const subjectText = subjects.length > 0 ? subjects.join(' - ') : (profileData?.subjects?.[0]?.name || '');
    const gradeText = grades.length > 0 ? grades.join(', ') : (profileData?.homeroom || '');

    const weekRange = this.getWeekRange(planData.date);

    // Filas de la tabla de clases
    const rowsHtml = planData.classes.map((cls, idx) => {
      const formatCellText = (txt) => {
        if (!txt) return '';
        const lines = String(txt).split('\n');
        const paragraphs = [];
        let currentP = [];

        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) {
            if (currentP.length > 0) {
              paragraphs.push(currentP.join('<br/>'));
              currentP = [];
            }
          } else {
            currentP.push(trimmed);
          }
        });
        if (currentP.length > 0) {
          paragraphs.push(currentP.join('<br/>'));
        }

        return paragraphs.map(pText => {
          let escaped = this.escapeHtml(pText);
          escaped = escaped.replace(/&lt;br\/&gt;/g, '<br/>');

          // Soporte nativo para negritas markdown **texto**
          escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

          // Resaltar prefijos y títulos de fases pedagógicas
          escaped = escaped.replace(/^([●•\s]*(?:(?:<strong>)?FASE\s+DE\s+(?:INICIO|DESARROLLO|CIERRE)(?:<\/strong>)?|(?:Fase\s+de\s+)?(?:Inicio|Desarrollo|Cierre)|Recursos(?:\s+did[aá]cticos)?(?:\s*[:\/-]?\s*(?:y\s+)?materiales)?|Evaluaci[oó]n(?: formativa)?|Estándar|Pregunta problematizadora|Tareas?(?:\s*[\/:]\s*Compromisos?)?(?:\s*[:\/-]?\s*(?:y\s+)?actividades\s+extraclase)?|Eje\s+temático|Metodología|Tiempo\s+disponible|Clase)(?:\s*\([^)]*\))?:?)/i, (m) => {
            let norm = m.replace(/<\/?strong>/g, '');
            if (/Recursos/i.test(norm)) {
              const bullet = norm.match(/^[●•\s]*/)[0] || '';
              return `<strong>${bullet}Recursos didácticos y materiales:</strong>`;
            }
            if (/Tareas/i.test(norm)) {
              const bullet = norm.match(/^[●•\s]*/)[0] || '';
              return `<strong>${bullet}Tareas / Compromisos:</strong>`;
            }
            return `<strong>${norm}</strong>`;
          });
          escaped = escaped
            .replace(/(<strong>[●•\s]*Recursos didácticos y materiales:<\/strong>)\s*(?:[:\/-]?\s*(?:Y\s+)?MATERIALES\b\s*:?)/gi, '$1 ')
            .replace(/(<strong>[●•\s]*Tareas \/ Compromisos:<\/strong>)\s*(?:[:\/-]?\s*(?:Y\s+)?ACTIVIDADES EXTRACLASE\b\s*:?)/gi, '$1 ');
          escaped = escaped.replace(/<strong><strong>(.*?)<\/strong><\/strong>/g, '<strong>$1</strong>');

          const isPhase = /^(?:<strong>)?\s*(?:FASE\s+DE\s+(?:INICIO|DESARROLLO|CIERRE)|(?:Fase\s+de\s+)?(?:Inicio|Desarrollo|Cierre)):?/i.test(escaped);
          if (isPhase) {
            return `<div class="preparador-cell-p preparador-phase-title" style="text-align: justify; text-justify: inter-word;">${escaped}</div>`;
          }
          return `<div class="preparador-cell-p" style="text-align: justify; text-justify: inter-word;">${escaped}</div>`;
        }).join('');
      };

      const shortDate = this.formatShortDate(cls.date || planData.date);
      const classNum = cls.dayNumber ? cls.dayNumber.replace(/[^0-9]/g, '') || String(idx + 1) : String(idx + 1);
      const dayOfWeek = cls.dayOfWeek || this.getDayOfWeekName(planData.date);

      const isDirGroup = cls.subject && String(cls.subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');

      let dbaRaw = isDirGroup ? '' : (cls.dba || '');
      let achievementRaw = isDirGroup ? '' : (cls.achievement || cls.performance || '');
      let topicRaw = isDirGroup ? '' : (cls.topic || '');

      if (!isDirGroup && (!dbaRaw || !topicRaw || !achievementRaw) && typeof CurriculumService !== 'undefined') {
        const autoCur = CurriculumService.getAutoCurriculumItem(period, cls.subject, cls.grade, cls.dayNumber || classNum);
        if (autoCur) {
          if (!dbaRaw) dbaRaw = autoCur.dba;
          if (!achievementRaw) achievementRaw = autoCur.achievement;
          if (!topicRaw) topicRaw = autoCur.topic;
        }
      }

      const dba = isDirGroup ? '<span style="color:#64748b; font-style:italic;">No aplica</span>' : formatCellText(dbaRaw);
      const achievement = isDirGroup ? '<span style="color:#64748b; font-style:italic;">No aplica</span>' : formatCellText(achievementRaw);
      const topic = isDirGroup ? '<span style="color:#64748b; font-style:italic;">Asesoría general</span>' : this.escapeHtml(topicRaw);
      const phasePrefixes = [
        'FASE\\s+DE\\s+(?:INICIO|DESARROLLO|CIERRE)',
        '(?<!FASE\\s+DE\\s+)(?:Inicio|Desarrollo|Cierre)',
        'Recursos(?:\\s+did[aá]cticos)?(?:\\s*[:\\/-]?\\s*(?:y\\s+)?materiales)?',
        'Evaluaci[oó]n(?:\\s+formativa)?',
        'Estándar(?:\\s+básico)?',
        'Pregunta\\s+problematizadora',
        'Tareas?(?:\\s*[\/:]\\s*Compromisos?)?(?:\\s*[:\\/-]?\\s*(?:y\\s+)?actividades\\s+extraclase)?',
        'Compromisos?',
        'Eje\\s+temático',
        'Metodología',
        'Tiempo\\s+disponible'
      ].join('|');
      const phaseColonRegex = new RegExp(`(?<!^)(?<!\\()[ \\t]*(\\*{0,2}(?:${phasePrefixes})(?:[ \\t]*\\([^)]*\\))?\\*{0,2})\\s*:\\s*`, 'gi');

      let descFormatted = (cls.description || '')
        .replace(/(?:Recursos\s+did[aá]cticos?\s*:\s*(?:Y\s+)?MATERIALES|Recursos\s+did[aá]cticos?\s+y\s+materiales\s*:?)/gi, 'Recursos didácticos y materiales:')
        .replace(/(?:Tareas?(?:\s*[\/:]\s*Compromisos?)?\s*:\s*(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE|Tareas?(?:\s*[\/:]\s*Compromisos?)?\s*y\s+actividades\s+extraclase\s*:?)/gi, 'Tareas / Compromisos:')
        .replace(phaseColonRegex, '\n\n$1: ')
        .replace(/\n{3,}/g, '\n\n');
      const sequence = formatCellText(descFormatted.trim());




      return `
        <tr>
          <td style="text-align: center; vertical-align: middle; padding: 4px; font-size: 8pt;">${shortDate}</td>
          <td style="text-align: center; vertical-align: middle; padding: 4px; font-size: 8.5pt; font-weight: bold;">${classNum}</td>
          <td style="text-align: center; vertical-align: middle; padding: 4px; font-size: 8pt;">${this.escapeHtml(dayOfWeek)}</td>
          <td style="vertical-align: top; padding: 4px; font-size: 8pt; line-height: 1.25; text-align: justify; text-justify: inter-word;">${dba}</td>
          <td style="vertical-align: top; padding: 4px; font-size: 8pt; line-height: 1.25; text-align: justify; text-justify: inter-word;">${achievement}</td>
          <td style="vertical-align: top; padding: 4px; font-size: 8pt; font-weight: 500; line-height: 1.25;">${topic}</td>
          <td style="vertical-align: top; padding: 4px; font-size: 8pt; line-height: 1.25; text-align: justify; text-justify: inter-word;">${sequence}</td>
        </tr>
      `;
    }).join('');

    let notesText = '';
    if (planData.classes && planData.classes.length > 0) {
      const classNotes = planData.classes
        .map((c, i) => {
          const obs = (c.observations || '').trim();
          if (!obs) return null;
          if (planData.classes.length === 1) return this.escapeHtml(obs);
          const cNum = c.dayNumber ? `Clase ${String(c.dayNumber).replace(/[^0-9]/g, '') || c.dayNumber}` : `Clase ${i + 1}`;
          const cSub = c.subject ? ` (${c.subject})` : '';
          return `• ${cNum}${cSub}: ${this.escapeHtml(obs)}`;
        })
        .filter(Boolean);
      if (classNotes.length > 0) {
        notesText = classNotes.join('\n');
      }
    }
    if (!notesText && planData.generalNotes) {
      notesText = this.escapeHtml(planData.generalNotes);
    }

    const noteLines = notesText ? notesText.split('\n') : [];
    while (noteLines.length < 3) {
      noteLines.push('');
    }
    const obsLinesHtml = noteLines.map(line => `<div class="obs-line">${line}</div>`).join('');

    return `
      <div class="preparador-sheet-wrapper">
        <!-- 1. ENCABEZADO INSTITUCIONAL EN CUADRÍCULA EXACTA -->
        <table class="preparador-header-table">
          <tr>
            <td class="header-logo-cell">
              <img src="img/logo_colegio.png" alt="Escudo Oficial" style="max-height:58px; max-width:75px; object-fit:contain; display:block; margin:0 auto;" onerror="this.outerHTML='<div style=\\'font-size:9pt;font-weight:bold;color:#1e3a8a;\\'>[ESCUDO]</div>'" />
            </td>
            <td class="header-title-cell">
              <div class="inst-name">${this.escapeHtml(institution)}</div>
              <div class="doc-title">PREPARADOR DE CLASES</div>
            </td>
            <td class="header-meta-cell">
              <div class="meta-row"><strong>CODIGO:</strong> ${this.escapeHtml(code)}</div>
              <div class="meta-row"><strong>VERSION:</strong> ${this.escapeHtml(version)}</div>
              <div class="meta-row" style="border-bottom:none;">${this.escapeHtml(formatDate)}</div>
            </td>
          </tr>
        </table>

        <!-- 2. TABLA DE METADATOS (NUEVO FORMATO OFICIAL 2x6) -->
        <table class="preparador-meta-table">
          <tr>
            <td class="meta-lbl" style="width: 13%;">ASIGNATURA:</td>
            <td class="meta-val" style="width: 33%;">${this.escapeHtml(subjectText)}</td>
            <td class="meta-lbl" style="width: 11%;">GRADO:</td>
            <td class="meta-val" style="width: 19%;">${this.escapeHtml(gradeText)}</td>
            <td class="meta-lbl" style="width: 11%;">PERIODO:</td>
            <td class="meta-val text-center" style="width: 13%;">${this.escapeHtml(period)}</td>
          </tr>
          <tr>
            <td class="meta-lbl">DOCENTE:</td>
            <td class="meta-val">${this.escapeHtml(teacherName)}</td>
            <td class="meta-lbl">SEMANA DEL</td>
            <td class="meta-val">${weekRange.start}</td>
            <td class="meta-lbl text-center">AL</td>
            <td class="meta-val">${weekRange.end}</td>
          </tr>
        </table>

        <!-- 3. TABLA PRINCIPAL DE CLASES -->
        <table class="preparador-main-table">
          <thead>
            <tr>
              <th style="width: 10.7%;">FECHA<br/><small>d/m/a</small></th>
              <th style="width: 6.6%;">CLASE</th>
              <th style="width: 6.8%;">DÍA</th>
              <th style="width: 7.9%;">DBA</th>
              <th style="width: 7.9%;">LOGRO E<br/>INDICADOR</th>
              <th style="width: 12.6%;">TEMA</th>
              <th style="width: 47.5%;">
                Secuencia didáctica Inicio-Desarrollo -cierre<br/>
                <span style="font-weight:normal; font-size:7.5pt;">(Descripción del desarrollo de la clase Recursos Didácticos – Tarea – Evaluación-Talleres-Quiz)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- 4. SECCIÓN DE OBSERVACIONES ESTRUCTURADA (NUEVO FORMATO OFICIAL) -->
        <table class="preparador-obs-table">
          <tr>
            <td class="obs-lbl"><strong>OBSERVACIONES:</strong></td>
            <td class="obs-content-cell" style="text-align: justify; text-justify: inter-word;">
              ${notesText ? notesText.split('\n').map(l => `<div class="obs-text-line" style="text-align: justify; text-justify: inter-word;">${l}</div>`).join('') : '<div class="obs-empty-line">&nbsp;</div>'}
            </td>
          </tr>
        </table>

        ${planData.coordinatorReview && planData.coordinatorReview.status ? `
        <!-- 5. SELLO Y VISTO BUENO DE COORDINACIÓN ACADÉMICA -->
        <div style="margin-top: 8px; border: 1.5px dashed #0284c7; background: #f0f9ff; padding: 7px 12px; font-size: 8.5pt; border-radius: 4px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #bae6fd; padding-bottom: 4px; margin-bottom: 4px;">
            <strong style="color: #0369a1;">🎓 REVISIÓN & VISTO BUENO DE COORDINACIÓN ACADÉMICA</strong>
            <span style="font-weight: 800; text-transform: uppercase; color: ${planData.coordinatorReview.status === 'approved' ? '#059669' : (planData.coordinatorReview.status === 'approved_with_notes' ? '#d97706' : '#dc2626')};">
              ${planData.coordinatorReview.status === 'approved' ? '✅ Aprobado / Visto Bueno Oficial' : (planData.coordinatorReview.status === 'approved_with_notes' ? '⚠️ Aprobado con Sugerencias' : '❌ Requiere Ajustes')}
            </span>
          </div>
          ${planData.coordinatorReview.comments ? `<div style="font-style: italic; color: #1e293b; margin-top: 3px;">"${this.escapeHtml(planData.coordinatorReview.comments)}"</div>` : ''}
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 4px; text-align: right;">
            Revisado por: <strong>${this.escapeHtml(planData.coordinatorReview.reviewerName || 'Coordinación Académica')}</strong> • Fecha: ${planData.coordinatorReview.date || ''}
          </div>
        </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Abre el Modal interactivo de Vista Previa idéntica a la hoja impresa
   */
  openLivePreview(planData, profileData) {
    if (!planData || !planData.classes || planData.classes.length === 0) {
      alert('No hay clases registradas para previsualizar en esta fecha.');
      return;
    }

    const modalBackdrop = document.getElementById('sheet-preview-modal-backdrop');
    const container = document.getElementById('sheet-preview-content');

    if (modalBackdrop && container) {
      container.innerHTML = this.generatePreparadorHTML(planData, profileData);
      modalBackdrop.classList.add('active');
    }
  },

  /**
   * Exporta a Word utilizando la plantilla oficial nativa .DOCX (Preparador.docx)
   */
  async exportToWord(planData, profileData) {
    if (!planData || !planData.classes || planData.classes.length === 0) {
      alert('No hay clases registradas para exportar en esta fecha.');
      return;
    }

    const teacherName = profileData?.name || 'Docente';
    const cleanTeacherName = teacherName.replace(/\s+/g, '_');
    let fileName = `Preparador_${cleanTeacherName}_${planData.date || 'clases'}.docx`;

    if (planData.customFileName) {
      fileName = planData.customFileName.endsWith('.docx') ? planData.customFileName : `${planData.customFileName}.docx`;
    } else if (planData.classes.length === 1) {
      const single = planData.classes[0];
      const subClean = (single.subject || 'Clase').replace(/\s+/g, '_');
      const grdClean = (single.grade || '').replace(/\s+/g, '_');
      const numClean = single.dayNumber ? `Clase${String(single.dayNumber).replace(/[^0-9]/g, '') || single.dayNumber}` : 'Clase1';
      fileName = `Preparador_${cleanTeacherName}_${subClean}_${grdClean}_${numClean}_${planData.date || 'clase'}.docx`;
    }

    try {
      App.showToast('Generando documento oficial de Word...', 'info');

      // Intentar cargar la plantilla nativa oficial Preparador.docx
      // Cache-buster para garantizar que se use siempre la versión más reciente
      const response = await fetch('Preparador.docx?v=' + Date.now());
      if (!response.ok) throw new Error('No se pudo cargar la plantilla Preparador.docx');
      
      const templateBuffer = await response.arrayBuffer();
      const docxBlob = await DocxTemplateEngine.generateDocx(templateBuffer, planData, profileData);

      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      App.showToast('¡Documento Word (.docx) descargado con éxito!', 'success');
    } catch (err) {
      console.warn('Fallback a exportación estándar:', err);
      this.exportToWordFallback(planData, profileData);
    }
  },

  /**
   * Fallback de exportación a Word si no se puede cargar el archivo .docx por red
   */
  exportToWordFallback(planData, profileData) {
    const institution = profileData?.institution || 'COLEGIO HOGAR MADRE DE DIOS';
    const teacherName = profileData?.name || 'Docente';
    const htmlContent = this.generatePreparadorHTML(planData, profileData);

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Preparador de Clases - ${institution}</title>
        <style>
          @page { size: letter landscape; margin: 0.6cm 0.8cm; mso-page-orientation: landscape; }
          body { font-family: Arial, sans-serif; font-size: 8.5pt; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #000; padding: 4px; font-size: 8pt; }
          .preparador-cell-p { text-align: justify; text-justify: inter-word; }
          .preparador-main-table td:nth-child(4),
          .preparador-main-table td:nth-child(5),
          .preparador-main-table td:nth-child(7) { text-align: justify; text-justify: inter-word; }
          .preparador-obs-table .obs-content-cell { text-align: justify; text-justify: inter-word; }
        </style>
      </head>
      <body>${htmlContent}</body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword;charset=utf-8' });
    let fileName = `Preparador_${teacherName.replace(/\s+/g, '_')}_${planData.date || 'clases'}.doc`;
    if (planData.customFileName) {
      fileName = planData.customFileName.endsWith('.doc') ? planData.customFileName : `${planData.customFileName}.doc`;
    } else if (planData.classes.length === 1) {
      const single = planData.classes[0];
      const subClean = (single.subject || 'Clase').replace(/\s+/g, '_');
      const grdClean = (single.grade || '').replace(/\s+/g, '_');
      const numClean = single.dayNumber ? `Clase${String(single.dayNumber).replace(/[^0-9]/g, '') || single.dayNumber}` : 'Clase1';
      fileName = `Preparador_${teacherName.replace(/\s+/g, '_')}_${subClean}_${grdClean}_${numClean}_${planData.date || 'clase'}.doc`;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    App.showToast('Descargando documento Word (.doc)...', 'info');
  },

  /**
   * Exporta las planeaciones de una materia específica durante toda la semana
   * @param {string} weekDateStr - Cualquier fecha de la semana
   * @param {string} subject - Asignatura a filtrar
   * @param {string} grade - Grado a filtrar (opcional)
   * @param {string} format - 'docx' | 'pdf' | 'preview'
   */
  exportWeekBySubject(weekDateStr, subject, grade, format = 'docx') {
    const dates = this.getWeekDates(weekDateStr);
    const profile = StorageService.getProfile();
    const matchedClasses = [];
    let period = profile?.period || '1°';

    dates.forEach(dateStr => {
      const plan = StorageService.getPlanByDate(dateStr);
      if (plan && plan.classes) {
        if (plan.period) period = plan.period;
        plan.classes.forEach(cls => {
          const matchSub = (cls.subject || '').trim().toLowerCase() === (subject || '').trim().toLowerCase();
          const matchGrd = !grade || (cls.grade || '').trim().toLowerCase() === (grade || '').trim().toLowerCase();
          if (matchSub && matchGrd) {
            matchedClasses.push({
              ...cls,
              date: cls.date || dateStr,
              dayOfWeek: cls.dayOfWeek || this.getDayOfWeekName(dateStr)
            });
          }
        });
      }
    });

    if (matchedClasses.length === 0) {
      alert(`No se encontraron clases registradas de ${subject} ${grade || ''} en esta semana.`);
      return;
    }

    const mondayDate = dates[0];
    const teacherClean = (profile?.name || 'Docente').replace(/\s+/g, '_');
    const subClean = (subject || 'Materia').replace(/\s+/g, '_');
    const grdClean = (grade || '').replace(/\s+/g, '_');
    const customFileName = `Preparador_${teacherClean}_Semanal_${subClean}_${grdClean}_${mondayDate}`;

    const planData = {
      date: mondayDate,
      period: period,
      classes: matchedClasses,
      customFileName: customFileName
    };

    if (format === 'preview') {
      this.openLivePreview(planData, profile);
    } else if (format === 'pdf') {
      this.exportToPdf(planData, profile);
    } else {
      this.exportToWord(planData, profile);
    }
  },

  /**
   * Exporta el consolidado semanal con todas las clases de la semana
   * @param {string} weekDateStr - Cualquier fecha de la semana
   * @param {string} format - 'docx' | 'pdf' | 'preview'
   */
  exportFullWeek(weekDateStr, format = 'docx') {
    const dates = this.getWeekDates(weekDateStr);
    const profile = StorageService.getProfile();
    const allClasses = [];
    let period = profile?.period || '1°';

    dates.forEach(dateStr => {
      const plan = StorageService.getPlanByDate(dateStr);
      if (plan && plan.classes) {
        if (plan.period) period = plan.period;
        plan.classes.forEach(cls => {
          allClasses.push({
            ...cls,
            date: cls.date || dateStr,
            dayOfWeek: cls.dayOfWeek || this.getDayOfWeekName(dateStr)
          });
        });
      }
    });

    if (allClasses.length === 0) {
      alert('No hay clases registradas en ninguno de los días de esta semana.');
      return;
    }

    const mondayDate = dates[0];
    const teacherClean = (profile?.name || 'Docente').replace(/\s+/g, '_');
    const customFileName = `Preparador_${teacherClean}_Semana_Completa_${mondayDate}`;

    const planData = {
      date: mondayDate,
      period: period,
      classes: allClasses,
      customFileName: customFileName
    };

    if (format === 'preview') {
      this.openLivePreview(planData, profile);
    } else if (format === 'pdf') {
      this.exportToPdf(planData, profile);
    } else {
      this.exportToWord(planData, profile);
    }
  },

  /**
   * Exporta una única clase recuperándola directamente por su ID permanente (Req. 89)
   * OPERACIÓN PURA DE SOLO LECTURA: Jamás modifica la clase ni el estado persistido.
   */
  exportClassById(classId, format = 'pdf') {
    if (!classId) return;
    let cls = null;
    if (typeof ClassRepository !== 'undefined' && ClassRepository.getClass) {
      cls = ClassRepository.getClass(classId);
    }
    if (!cls) {
      alert('No se encontró la clase especificada para exportar.');
      return;
    }

    const profile = typeof StorageService !== 'undefined' ? StorageService.getProfile() : null;
    const planData = typeof ExportAdapter !== 'undefined'
      ? ExportAdapter.fromClass(cls, profile)
      : {
          date: cls.date,
          period: cls.period || '1°',
          classes: [cls]
        };

    if (format === 'preview') {
      this.openLivePreview(planData, profile);
    } else if (format === 'pdf') {
      this.exportToPdf(planData, profile);
    } else {
      this.exportToWord(planData, profile);
    }
  },

  /**
   * Exporta o previsualiza de manera individual una única clase de un día determinado
   * @param {Object} planData - Datos de la planeación
   * @param {Object} profileData - Perfil del docente
   * @param {number} classIndex - Índice de la clase a exportar
   * @param {string} format - 'docx' | 'pdf' | 'preview'
   */
  exportSingleClass(planData, profileData, classIndex, format = 'docx') {
    if (!planData || !planData.classes || !planData.classes[classIndex]) {
      alert('La clase seleccionada no existe o no tiene datos.');
      return;
    }

    const cls = planData.classes[classIndex];
    const singlePlanData = {
      ...planData,
      classes: [JSON.parse(JSON.stringify(cls))],
      generalNotes: planData.generalNotes || ''
    };

    if (format === 'preview') {
      this.openLivePreview(singlePlanData, profileData);
    } else if (format === 'pdf') {
      this.exportToPdf(singlePlanData, profileData);
    } else {
      this.exportToWord(singlePlanData, profileData);
    }
  },

  /**
   * Prepara la hoja exacta para imprimir o guardar como PDF
   */
  exportToPdf(planData, profileData) {
    if (!planData || !planData.classes || planData.classes.length === 0) {
      alert('No hay clases registradas para exportar en esta fecha.');
      return;
    }

    const printContainer = document.getElementById('printable-report');
    if (!printContainer) return;

    printContainer.innerHTML = this.generatePreparadorHTML(planData, profileData);
    window.print();
  },

  getDayOfWeekName(dateStr) {
    if (!dateStr) return 'Lunes';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return 'Lunes';
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  generateHtmlSheet(planData, profileData) {
    return this.generatePreparadorHTML(planData, profileData);
  }
};

if (typeof window !== 'undefined') {
  window.ExportService = ExportService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportService;
}
