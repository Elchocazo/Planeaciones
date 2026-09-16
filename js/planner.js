/**
 * MÓDULO DE EDICIÓN DE PLANEACIÓN DIARIA
 * Adaptado a los campos del Preparador de Clases Institucional (DBA, Logro e Indicador, Tema, Secuencia Didáctica)
 */

class PlannerComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentDateStr = null;
    this.currentPlan = null;
    this.autoSaveTimer = null;
    this._dismissedDayBanners = {};
    this._hasUnsavedChanges = false;
    this._setupMultiTabSync();
  }

  formatFullDate(dateStr) {
    if (typeof ExportService !== 'undefined' && ExportService.formatDate) {
      return ExportService.formatDate(dateStr);
    }
    return dateStr || '';
  }

  isDirectionOfGroup(subject) {
    if (!subject) return false;
    return String(subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
  }

  flushPendingSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    if (this.currentDateStr && this.currentPlan) {
      this.collectDataFromDOM(this.currentDateStr);
      StorageService.savePlan(this.currentDateStr, this.currentPlan);
      this._hasUnsavedChanges = false;
    }
  }

  loadDate(dateStr, bypassUnsavedCheck = false) {
    if (!this.container) {
      this.container = document.getElementById('planner-mount-point');
    }

    // Advertencia de cambios sin guardar al cambiar de día
    if (!bypassUnsavedCheck && this.currentDateStr && this.currentDateStr !== dateStr && this.hasUnsavedChanges()) {
      this.promptNavigateIfUnsaved(() => {
        this.loadDate(dateStr, true);
      });
      return;
    }

    // Vaciar y guardar cualquier cambio pendiente del día anterior de forma aislada
    if (this.currentDateStr && this.currentDateStr !== dateStr) {
      this.flushPendingSave();
    }
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    this.currentDateStr = dateStr;
    this._hasUnsavedChanges = false;

    try {
      const profile = StorageService.getProfile();
      const existingPlan = StorageService.getPlanByDate(dateStr);

      if (existingPlan) {
        this.currentPlan = JSON.parse(JSON.stringify(existingPlan));
        if (!this.currentPlan.attachments) this.currentPlan.attachments = [];
        if (!this.currentPlan.period) this.currentPlan.period = profile?.period || '1°';

        // Asegurar que cada clase tenga id permanente y sequenceNumber
        if (Array.isArray(this.currentPlan.classes)) {
          this.currentPlan.classes.forEach((cls, idx) => {
            if (!cls.id) {
              cls.id = cls.classId || (typeof PlanRepository !== 'undefined' ? PlanRepository.generateClassId(this.currentPlan.id) : `cls_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`);
            }
            if (!cls.classId) cls.classId = cls.id;
            if (!cls.sequenceNumber) cls.sequenceNumber = parseInt(cls.dayNumber, 10) || (idx + 1);
          });
        }
        if (!this.currentPlan.period) this.currentPlan.period = profile?.period || '1°';

        // Consolidar únicamente en memoria clases contiguas de 2 horas si existen
        if (typeof StorageService !== 'undefined' && StorageService.consolidateClasses) {
          this.currentPlan.classes = StorageService.consolidateClasses(this.currentPlan.classes);
        }

        // Cargar espejos en memoria únicamente si la clase está completamente vacía
        if (typeof StorageService !== 'undefined' && StorageService.getParallelClassContent) {
          this.currentPlan.classes.forEach(cls => {
            if (StorageService.getParallelGrade(cls.subject, cls.grade)) {
              const isEmpty = (!cls.topic || !cls.topic.trim()) && (!cls.description || !cls.description.trim());
              if (isEmpty) {
                const mirrorContent = StorageService.getParallelClassContent(cls.subject, cls.grade, cls.dayNumber);
                if (mirrorContent) {
                  cls.topic = mirrorContent.topic;
                  cls.dba = mirrorContent.dba;
                  cls.achievement = mirrorContent.achievement;
                  cls.description = mirrorContent.description;
                  cls.observations = mirrorContent.observations;
                  cls.notebookContent = mirrorContent.notebookContent;
                  cls.attachments = mirrorContent.attachments || [];
                }
              }
            }
          });
        }

        // Limpiar dirección de grupo si tenía campos curriculares
        this.currentPlan.classes.forEach(cls => {
          if (this.isDirectionOfGroup(cls.subject)) {
            cls.topic = '';
            cls.dba = '';
            cls.achievement = '';
            cls.performance = '';
          }
        });
        // NUNCA auto-guardar ni sobreescribir textos durante la simple navegación/revisión
      } else {
        const dayOfWeek = ExportService.getDayOfWeekName(dateStr);
        const targetPeriod = profile?.period || '1°';
        
        // Obtener el día de la semana (1=Lunes ... 5=Viernes)
        const dateParts = dateStr.split('-');
        const dateObj = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
        const dayIndex = dateObj.getDay();
        
        // Cargar horario oficial configurado para este día
        const weeklySchedule = profile?.weeklySchedule || window.DEFAULT_WEEKLY_SCHEDULE || {};
        const rawSchedule = weeklySchedule[String(dayIndex)] || [];
        const daySchedule = typeof StorageService !== 'undefined' && StorageService.consolidateSchedule
          ? StorageService.consolidateSchedule(rawSchedule)
          : rawSchedule;
        const initialClasses = [];

        if (daySchedule.length > 0) {
          // Horario específico de este día de la semana con consecutividad por asignatura y grado
          daySchedule.forEach((schedItem, i) => {
            const classNum = StorageService.getNextClassNumber(dateStr, schedItem.subject, schedItem.grade, i, initialClasses);
            const isDirGroup = this.isDirectionOfGroup(schedItem.subject);
            const mirrorContent = (!isDirGroup && typeof StorageService !== 'undefined' && StorageService.getParallelClassContent)
              ? StorageService.getParallelClassContent(schedItem.subject, schedItem.grade, classNum)
              : null;
            const autoCur = (!isDirGroup && typeof CurriculumService !== 'undefined') 
              ? CurriculumService.getAutoCurriculumItem(targetPeriod, schedItem.subject, schedItem.grade, classNum)
              : null;
            const classId = typeof PlanRepository !== 'undefined'
              ? PlanRepository.generateClassId()
              : `cls_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;

            initialClasses.push({
              id: classId,
              classId: classId,
              date: dateStr,
              time: schedItem.time || '',
              dayNumber: `${classNum}`,
              sequenceNumber: parseInt(classNum, 10) || (i + 1),
              dayOfWeek: dayOfWeek,
              subject: schedItem.subject,
              grade: schedItem.grade,
              dba: isDirGroup ? '' : (mirrorContent?.dba || autoCur?.dba || ''),
              achievement: isDirGroup ? '' : (mirrorContent?.achievement || autoCur?.achievement || ''),
              topic: isDirGroup ? '' : (mirrorContent?.topic || autoCur?.topic || ''),
              description: mirrorContent?.description || autoCur?.suggestedSequence || '',
              observations: mirrorContent?.observations || '',
              notebookContent: mirrorContent?.notebookContent || '',
              attachments: mirrorContent?.attachments || []
            });
          });
        } else {
          // Fallback por defecto si es fin de semana o no tiene horario configurado
          const dailyHours = parseInt(profile?.dailyHours || 5, 10);
          const defaultSubject = profile?.subjects?.[0]?.name || 'Matemáticas';
          const defaultGrade = profile?.homeroom || '7°';

          for (let i = 0; i < dailyHours; i++) {
            const classNum = StorageService.getNextClassNumber(dateStr, defaultSubject, defaultGrade, i, initialClasses);
            const mirrorContent = typeof StorageService !== 'undefined' && StorageService.getParallelClassContent
              ? StorageService.getParallelClassContent(defaultSubject, defaultGrade, classNum)
              : null;
            const autoCur = typeof CurriculumService !== 'undefined'
              ? CurriculumService.getAutoCurriculumItem(targetPeriod, defaultSubject, defaultGrade, classNum)
              : null;
            const classId = typeof PlanRepository !== 'undefined'
              ? PlanRepository.generateClassId()
              : `cls_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;

            initialClasses.push({
              id: classId,
              classId: classId,
              date: dateStr,
              dayNumber: `${classNum}`,
              sequenceNumber: parseInt(classNum, 10) || (i + 1),
              dayOfWeek: dayOfWeek,
              subject: defaultSubject,
              grade: defaultGrade,
              dba: mirrorContent?.dba || autoCur?.dba || '',
              achievement: mirrorContent?.achievement || autoCur?.achievement || '',
              topic: mirrorContent?.topic || autoCur?.topic || '',
              description: mirrorContent?.description || autoCur?.suggestedSequence || '',
              observations: mirrorContent?.observations || '',
              notebookContent: mirrorContent?.notebookContent || '',
              attachments: mirrorContent?.attachments || []
            });
          }
        }

        this.currentPlan = {
          id: (typeof PlanRepository !== 'undefined' ? PlanRepository.generatePlanId(null, dateStr) : 'plan_' + dateStr),
          date: dateStr,
          period: targetPeriod,
          classes: initialClasses,
          attachments: [],
          generalNotes: ''
        };
        // CERO GUARDADO FANTASMA: Se inicializa en memoria y solo se guarda cuando el docente edita o guarda.
      }

      this.render();
    } catch (e) {
      console.error('Error al inicializar planeación:', e);
      if (this.container) {
        this.container.innerHTML = `<div style="padding:2rem; text-align:center;"><h3>Ocurrió un error cargando el planeador</h3><button class="btn btn-primary" onclick="App.showCalendarView()">Volver al Calendario</button></div>`;
      }
    }
  }

  render() {
    if (!this.container) {
      this.container = document.getElementById('planner-mount-point');
    }
    if (!this.container || !this.currentPlan) return;

    const profile = StorageService.getProfile();
    const formattedDate = this.formatFullDate(this.currentDateStr);
    const dayOfWeek = ExportService.getDayOfWeekName(this.currentDateStr);
    const weekRange = ExportService.getWeekRange(this.currentDateStr);

    const subjectsList = profile?.subjects || [];
    const gradesList = profile?.grades || ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

    const rowsHtml = this.currentPlan.classes.map((cls, idx) => {
      // Opciones de materias
      const subjectOptions = subjectsList.map(subObj => {
        const subName = typeof subObj === 'string' ? subObj : subObj.name;
        return `
          <option value="${this.escapeHtml(subName)}" ${cls.subject === subName ? 'selected' : ''}>
            ${this.escapeHtml(subName)}
          </option>
        `;
      }).join('');

      // Grados disponibles
      const currentSubjectObj = subjectsList.find(s => (typeof s === 'object' ? s.name : s) === cls.subject);
      const subjectGrades = currentSubjectObj && currentSubjectObj.grades ? currentSubjectObj.grades : gradesList;

      const gradeOptions = gradesList.map(grd => {
        const isAssigned = subjectGrades.includes(grd);
        const label = isAssigned ? `${grd}` : `${grd} (otro)`;
        return `
          <option value="${this.escapeHtml(grd)}" ${cls.grade === grd ? 'selected' : ''}>
            ${this.escapeHtml(label)}
          </option>
        `;
      }).join('');

      const shortDate = ExportService.formatShortDate(cls.date || this.currentDateStr);
      const defaultDayOfWeek = cls.dayOfWeek || dayOfWeek;

      // Obtener temas preconfigurados de la malla para este periodo, materia y grado
      const period = this.currentPlan.period || profile.period || '1°';
      const curItems = typeof CurriculumService !== 'undefined' ? CurriculumService.getItems(period, cls.subject, cls.grade) : [];
      const isDirGroup = this.isDirectionOfGroup(cls.subject);

      const curPickerHtml = isDirGroup ? `
        <div style="margin-top: 5px; font-size: 0.72rem; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 6px; text-align: center; font-weight: 600;">
          👥 Asesoría de Grupo
        </div>
      ` : (curItems.length > 0 ? `
        <div style="margin-top: 6px;">
          <select class="table-select" style="font-size:0.75rem; background:#f0fdf4; border-color:#86efac; color:#166534; font-weight:600; padding: 3px 6px;" onchange="Planner.applyCurriculumToClass(${idx}, this.value)" title="Cargar tema, logro y DBA preconfigurados para este periodo">
            <option value="">⚡ Cargar Tema del ${period} Periodo...</option>
            ${curItems.map((cIt, cIdx) => `<option value="${cIdx}">📌 ${this.escapeHtml(cIt.topic || 'Tema ' + (cIdx+1))}</option>`).join('')}
          </select>
        </div>
      ` : `
        <div style="margin-top: 4px;">
          <button type="button" class="btn btn-secondary" style="font-size:0.7rem; padding:2px 5px; width:100%; border-style:dashed;" onclick="CurriculumManager.openModal('${period}', '${cls.subject}', '${cls.grade}')" title="Configurar temas y logros para ${cls.subject} en ${cls.grade}">
            📖 Configurar Malla ${period}
          </button>
        </div>
      `);

      const isTwoHours = (timeStr) => {
        if (!timeStr) return false;
        if (timeStr.includes('(2h)') || timeStr.includes('2 horas')) return true;
        const parts = timeStr.split('-').map(s => s.trim());
        if (parts.length === 2) {
          const toMins = (t) => {
            const m = t.match(/(\d+):(\d+)/);
            if (!m) return 0;
            let h = parseInt(m[1], 10);
            const min = parseInt(m[2], 10);
            if (h < 7) h += 12;
            return h * 60 + min;
          };
          const diff = toMins(parts[1]) - toMins(parts[0]);
          return diff >= 70;
        }
        return false;
      };

      return `
        <tr class="planning-row" data-class-id="${this.escapeHtml(cls.id || '')}" data-row-idx="${idx}">
          <!-- Columna 1: Fecha (d/m/a) y Horario -->
          <td class="col-date" style="vertical-align: middle; text-align: center;">
            <input type="text" class="table-input" value="${this.escapeHtml(shortDate)}" style="font-size: 0.8rem; text-align: center; padding: 0.4rem 0.2rem;" readonly />
            ${cls.time ? `
              <div style="font-size: 0.7rem; color: var(--primary-700); font-weight: 700; margin-top: 3px; background: var(--primary-50); border: 1px solid var(--primary-200); border-radius: 4px; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" title="Franja horaria oficial de la clase">
                <span>⏰ ${this.escapeHtml(cls.time)}</span>
                ${isTwoHours(cls.time) ? `<span style="background:var(--primary-600); color:#fff; border-radius:3px; padding:0.5px 3.5px; font-size:0.62rem; font-weight:800;" title="Bloque unificado de 2 horas seguidas de clase">2h</span>` : ''}
              </div>
            ` : ''}
          </td>

          <!-- Columna 2: # Clase (Consecutivo Inteligente) -->
          <td class="col-day-num" style="vertical-align: middle; text-align: center;">
            <input type="text" class="table-input cls-day-number" value="${this.escapeHtml(cls.dayNumber || String(idx + 1))}" style="font-size: 0.95rem; font-weight: bold; text-align: center; color: var(--primary-700); padding: 0.4rem 0.2rem;" onchange="Planner.onClassNumberChange(${idx}, this.value); Planner.handleInputChange(true);" oninput="Planner.handleInputChange()" onblur="Planner.handleInputChange(true)" title="Número de clase consecutivo. Al cambiarlo, las siguientes clases se ajustan en secuencia." />
          </td>

          <!-- Columna 3: Día de la Semana -->
          <td class="col-day-name" style="vertical-align: middle; text-align: center;">
            <input type="text" class="table-input cls-day-of-week" value="${this.escapeHtml(cls.dayOfWeek || defaultDayOfWeek)}" oninput="Planner.handleInputChange()" onchange="Planner.handleInputChange(true)" onblur="Planner.handleInputChange(true)" style="font-size: 0.8rem; text-align: center; padding: 0.4rem 0.2rem;" />
          </td>

          <!-- Columna 4: Asignatura y Grado -->
          <td class="col-subject-grade" style="vertical-align: top;">
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <select class="table-select cls-subject" onchange="Planner.onSubjectChange(${idx}, this.value)">
                ${subjectOptions}
              </select>
              <select class="table-select cls-grade" onchange="Planner.onGradeChange(${idx}, this.value)">
                ${gradeOptions}
              </select>
              ${(() => {
                const mirrorGrade = typeof StorageService !== 'undefined' && StorageService.getParallelGrade
                  ? StorageService.getParallelGrade(cls.subject, cls.grade)
                  : null;
                return mirrorGrade ? `
                  <div style="font-size:0.68rem; color:#0369a1; background:#e0f2fe; border:1px solid #bae6fd; border-radius:4px; padding:2px 5px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:3px;" title="Clase espejo: Se sincroniza automáticamente con ${mirrorGrade}">
                    <span>🔗 Espejo con ${mirrorGrade}</span>
                  </div>
                ` : '';
              })()}
              ${curPickerHtml}
            </div>
          </td>

          <!-- Columna 5: DBA -->
          <td class="col-dba" style="vertical-align: top;">
            ${isDirGroup ? `
              <div style="font-size: 0.76rem; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 14px 6px; text-align: center; line-height: 1.35;" title="En Dirección de Grupo se asesora en asuntos generales">
                <span style="font-weight: 700; color: #475569;">No aplica</span><br>
                <span style="font-size: 0.68rem; color: #94a3b8;">(Asesoría general)</span>
              </div>
              <textarea class="table-textarea cls-dba" style="display:none;"></textarea>
            ` : `
              <textarea class="table-textarea cls-dba" rows="4" oninput="Planner.handleInputChange()" onchange="Planner.handleInputChange(true)" onblur="Planner.handleInputChange(true)" onpaste="Planner.handlePaste(event)" placeholder="Derechos Básicos de Aprendizaje (DBA)...">${this.escapeHtml(cls.dba || '')}</textarea>
            `}
          </td>

          <!-- Columna 6: Logro e Indicador -->
          <td class="col-perf" style="vertical-align: top;">
            ${isDirGroup ? `
              <div style="font-size: 0.76rem; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 14px 6px; text-align: center; line-height: 1.35;" title="En Dirección de Grupo se asesora en asuntos generales">
                <span style="font-weight: 700; color: #475569;">No aplica</span><br>
                <span style="font-size: 0.68rem; color: #94a3b8;">(Asesoría general)</span>
              </div>
              <textarea class="table-textarea cls-achievement" style="display:none;"></textarea>
            ` : `
              <textarea class="table-textarea cls-achievement" rows="4" oninput="Planner.handleInputChange()" onchange="Planner.handleInputChange(true)" onblur="Planner.handleInputChange(true)" onpaste="Planner.handlePaste(event)" placeholder="Logros e Indicadores de desempeño...">${this.escapeHtml(cls.achievement || cls.performance || '')}</textarea>
            `}
          </td>

          <!-- Columna 7: Tema -->
          <td class="col-topic" style="vertical-align: top;">
            ${isDirGroup ? `
              <div style="font-size: 0.76rem; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 14px 6px; text-align: center; line-height: 1.35;" title="En Dirección de Grupo se asesora en asuntos generales">
                <span style="font-weight: 700; color: #475569;">No aplica</span><br>
                <span style="font-size: 0.68rem; color: #94a3b8;">(Asesoría general)</span>
              </div>
              <textarea class="table-textarea cls-topic" style="display:none;"></textarea>
            ` : `
              <textarea class="table-textarea cls-topic" rows="4" oninput="Planner.handleInputChange()" onchange="Planner.handleInputChange(true)" onblur="Planner.handleInputChange(true)" onpaste="Planner.handlePaste(event)" placeholder="Tema o Eje Temático de la sesión...">${this.escapeHtml(cls.topic || '')}</textarea>
            `}
          </td>

          <!-- Columna 8: Secuencia Didáctica, Observaciones, Cuaderno y Anexos -->
          <td class="col-desc" style="vertical-align: top;">
            <textarea class="table-textarea cls-description" rows="5" oninput="Planner.handleInputChange(); Planner.autoResizeTextarea(this);" onchange="Planner.handleInputChange(true)" onblur="Planner.handleInputChange(true)" onpaste="Planner.handlePaste(event)" placeholder="${isDirGroup ? 'Asuntos generales tratados con el grupo, compromisos y orientación escolar...' : 'Inicio:\nDesarrollo:\nCierre:\nRecursos, tareas, evaluación...'}">${this.escapeHtml(cls.description || '')}</textarea>

            <!-- Observaciones Pedagógicas Específicas de esta Clase -->
            <div class="class-obs-box" style="margin-top: 5px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 4px 7px;">
              <label style="font-size: 0.72rem; font-weight: 700; color: #92400e; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                📝 Observaciones de la clase:
              </label>
              <textarea class="table-textarea cls-observations" rows="2" style="font-size: 0.78rem; background: #ffffff; border-color: #fde68a; width: 100%; box-sizing: border-box; border-radius: 4px; padding: 3px 6px;" oninput="Planner.handleInputChange()" onchange="Planner.handleInputChange(true)" onblur="Planner.handleInputChange(true)" onpaste="Planner.handlePaste(event)" placeholder="Observaciones pedagógicas específicas para esta sesión...">${this.escapeHtml(cls.observations || '')}</textarea>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; flex-wrap:wrap; gap:4px;">
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:3px 8px; color:var(--primary-700); border-color:var(--primary-300); background:var(--primary-50);" onclick="App.openNotebookEditorView(${idx})" title="Abrir página completa de edición para organizar el contenido del cuaderno">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:3px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  📖 Editor de Cuaderno
                </button>
                <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:3px 6px; color:var(--slate-600);" onclick="NotebookEditor.openInNewTab(${idx})" title="Abrir en una pestaña nueva separada del navegador">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </button>
                <button type="button" class="btn btn-secondary btn-sm btn-class-att" style="font-size:0.75rem; padding:3px 8px; color:#4338ca; border-color:#c7d2fe; background:#eef2ff;" onclick="Planner.openClassAttachmentsModal(${idx})" title="Adjuntar guías en PDF o imágenes directamente a esta clase">
                  📎 Anexos (${(cls.attachments || []).length})
                </button>
                <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:3px 8px; color:#0f766e; border-color:#99f6e4; background:#f0fdfa;" onclick="Planner.formatSequenceText(${idx})" title="Añadir saltos de línea automáticos y separar párrafos para que no se vea apretado">
                  ✨ Espaciar Párrafos
                </button>
              </div>
              <div style="display:flex; align-items:center; gap:4px;">
                ${(cls.attachments && cls.attachments.length > 0) ? `<span style="font-size:0.68rem; background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; padding:1px 6px; border-radius:10px; font-weight:600;">📎 ${cls.attachments.length} archivo(s)</span>` : ''}
                ${(window.NotebookEditor && window.NotebookEditor.hasNotebookContent ? window.NotebookEditor.hasNotebookContent(cls) : (cls.notebookContent && cls.notebookContent.trim() && cls.notebookContent !== '<p><br/></p>' && cls.notebookContent !== '<p><br></p>')) ? `<span style="font-size:0.7rem; background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; padding:1px 6px; border-radius:10px; font-weight:600;" title="Esta clase tiene contenido detallado en su cuaderno">✨ Cuaderno guardado</span>` : ''}
              </div>
            </div>
          </td>

          <!-- Acciones de Fila: Guardar clase, Descarga directa y Eliminar -->
          <td class="col-action" style="vertical-align: middle; text-align: center;">
            <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; width: 100%;">
              <button type="button" class="btn btn-sm btn-save-class" onclick="Planner.saveSingleClass(${idx})" title="Guardar únicamente los datos de esta clase" id="btn-save-class-${idx}" style="font-size: 0.72rem; font-weight: 700; color: #065f46; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; padding: 3px 5px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 3px; cursor: pointer; white-space: nowrap;">
                💾 Guardar
              </button>
              <div id="class-save-indicator-${idx}" style="font-size: 0.65rem; font-weight: 600; color: #059669; display: none; line-height: 1.1;"></div>
              <button type="button" class="btn btn-sm" onclick="Planner.exportSingleClass(${idx}, 'pdf')" title="Descargar / Imprimir PDF oficial de esta sola clase" style="font-size: 0.72rem; font-weight: 700; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 2px 4px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 2px; cursor: pointer; white-space: nowrap;">
                📑 PDF
              </button>
              <button type="button" class="btn btn-sm" onclick="Planner.exportSingleClass(${idx}, 'docx')" title="Descargar únicamente esta clase en Word (.docx) oficial" style="font-size: 0.72rem; font-weight: 700; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 2px 4px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 2px; cursor: pointer; white-space: nowrap;">
                📄 Word
              </button>
              <button type="button" class="btn-table-action delete" onclick="Planner.removeRow(${idx})" title="Eliminar esta fila" style="margin-top: 1px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Anexos con soporte avanzado para imprimir PDFs
    const attachments = this.currentPlan.attachments || [];
    const attachmentsCardsHtml = attachments.map((att, attIdx) => {
      const isImg = att.type && att.type.startsWith('image/');
      const isPdf = att.type === 'application/pdf' || (att.name && att.name.toLowerCase().endsWith('.pdf'));

      return `
        <div class="attachment-card">
          <div class="attachment-preview-box">
            ${isImg 
              ? `<img src="${att.dataUrl}" alt="Anexo" onclick="Planner.previewImage('${att.dataUrl}', '${this.escapeHtml(att.name)}')" style="cursor:pointer;" />`
              : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>`
            }
          </div>
          <div class="attachment-info">
            <div class="attachment-name" title="${this.escapeHtml(att.name)}">${this.escapeHtml(att.name)}</div>
            <div class="attachment-meta">
              <span class="role-badge" style="font-size:0.65rem; padding:0.1rem 0.4rem; ${isPdf ? 'background:#fee2e2; color:#b91c1c; border-color:#fca5a5;' : ''}">
                ${isPdf ? 'PDF' : 'IMAGEN'}
              </span>
              <span>${att.sizeText || 'Archivo'}</span>
            </div>
          </div>
          <div class="attachment-actions">
            ${isPdf 
              ? `<button type="button" class="btn btn-secondary" style="padding:0.3rem 0.5rem; font-size:0.75rem;" onclick="Planner.printPdfDocument('${att.dataUrl}', '${this.escapeHtml(att.name)}')" title="Imprimir este documento PDF"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Imprimir</button>
                 <button type="button" class="btn-attachment-action" onclick="Planner.openPdfAttachment('${att.dataUrl}')" title="Ver PDF"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`
              : `<button type="button" class="btn-attachment-action" onclick="Planner.previewImage('${att.dataUrl}', '${this.escapeHtml(att.name)}')" title="Ver imagen"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>`
            }
            <button type="button" class="btn-attachment-action delete" onclick="Planner.deleteAttachment(${attIdx})" title="Eliminar anexo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="planner-view-container">
        <!-- Barra Superior con Fecha y Periodo -->
        <div class="planner-top-bar">
          <div class="planner-date-title">
            <button class="btn-back" onclick="App.showCalendarView()" title="Volver al Calendario">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="date-info">
              <h2>
                ${formattedDate}
                <span class="academic-week-pill">
                  Semana del ${weekRange.start.split(' de ')[0]} al ${weekRange.end}
                </span>
              </h2>
              <div style="display:flex; align-items:center; gap:0.75rem; margin-top:0.25rem; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <span style="font-size:0.85rem; color:var(--slate-600); font-weight:600;">Periodo Académico:</span>
                  <select id="planner-period-select" class="form-select" style="width:auto; padding:0.2rem 0.6rem; font-size:0.85rem; font-weight:700; height:30px;" onchange="Planner.handlePeriodChange(this.value)">
                    <option value="1°" ${this.currentPlan.period === '1°' ? 'selected' : ''}>1° Periodo</option>
                    <option value="2°" ${this.currentPlan.period === '2°' ? 'selected' : ''}>2° Periodo</option>
                    <option value="3°" ${this.currentPlan.period === '3°' ? 'selected' : ''}>3° Periodo</option>
                    <option value="4°" ${this.currentPlan.period === '4°' ? 'selected' : ''}>4° Periodo</option>
                  </select>
                </div>

                ${this.currentDateStr === StorageService.getAcademicStartDate() ? `
                  <span style="font-size:0.78rem; background:#ecfdf5; color:#065f46; border:1px solid #10b981; padding:3px 10px; border-radius:12px; font-weight:700; display:inline-flex; align-items:center; gap:4px;" title="Esta fecha es el Primer Día de Clases oficial (Clase 1)">
                    🏁 Primer Día de Clases (Clase 1)
                  </span>
                ` : `
                  <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.76rem; font-weight:700; color:#047857; border-color:#86efac; background:#f0fdf4; padding:3px 10px; border-radius:6px;" onclick="Planner.setAsFirstDayOfClasses()" title="Configurar esta fecha como el Primer Día de Clases (Clase 1) y cargar automáticamente todos los datos del curso">
                    🏁 Iniciar Clase 1 Aquí
                  </button>
                `}
              </div>
            </div>
          </div>

          <div class="planner-action-bar">
            <!-- Botón Vista Previa Exacta -->
            <button class="btn btn-primary" onclick="Planner.openSheetPreview()" title="Ver la hoja exacta como se imprimirá">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Vista Previa Hoja Oficial
            </button>

            <!-- Botón Folleto de Cuadernos del Día -->
            <button class="btn btn-secondary" onclick="NotebookEditor.openAllNotebooksForDay()" title="Ver e imprimir todos los cuadernos y guías pedagógicas del día como un folleto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              📚 Cuadernos del Día
            </button>

            <!-- Botón Sincronizar Malla Oficial -->
            <button class="btn btn-secondary" onclick="Planner.syncAllClassesWithCurriculum(true)" title="Cargar y sincronizar automáticamente los DBA, temas y logros oficiales de la malla curricular del periodo para todas las clases">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              🔄 Sincronizar Malla Oficial
            </button>

            <!-- Botón Aplicar Horario Oficial de este Día -->
            <button class="btn btn-secondary" onclick="Planner.applyOfficialSchedule()" title="Restablecer materias y grados al horario oficial que corresponde a este día">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              🔄 Horario Oficial
            </button>

            <!-- Botón Centro de Descargas (Semana / Día / Materia) -->
            <button type="button" class="btn btn-secondary" onclick="App.openDownloadCenter(Planner.currentDateStr)" title="Centro de descargas: Descargar por materia a la semana, por día o semana completa en Word y PDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              📥 Descargar Planeadores
            </button>

            <!-- Menú Desplegable de Exportación Rápida -->
            <div class="dropdown">
              <button class="btn btn-secondary" onclick="Planner.toggleExportDropdown(event)" id="btn-export-dropdown">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Exportar Formato
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="dropdown-menu" id="export-dropdown-menu">
                <button class="dropdown-item" onclick="App.openDownloadCenter(Planner.currentDateStr, 'subject')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  Por Materia a la Semana (Word / PDF)...
                </button>
                <button class="dropdown-item" onclick="App.openDownloadCenter(Planner.currentDateStr, 'day')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M8 2v4M16 2v4M3 10h18"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect></svg>
                  Por Día de la Semana (Word / PDF)...
                </button>
                <button class="dropdown-item" onclick="App.downloadFullWeek('docx')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Semana Completa a Word (.docx)
                </button>
                <div style="border-top: 1px solid var(--slate-100); margin: 4px 0;"></div>
                <button class="dropdown-item" onclick="Planner.exportWord()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  Día Actual a Word (.docx)
                </button>
                <button class="dropdown-item" onclick="Planner.exportPdf()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                  Día Actual a PDF / Imprimir
                </button>
              </div>
            </div>

            <!-- Botón Guardar -->
            <button class="btn btn-secondary" onclick="Planner.saveCurrentPlan(true)" title="Guardar cambios">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Guardar
            </button>

            <!-- Botón Duplicar -->
            <button class="btn btn-secondary btn-icon" onclick="Planner.promptDuplicatePlan()" title="Copiar planeación de otra fecha">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>

          </div>
        </div>

        <!-- Tabla Pedagógica de Planeación -->
        <div class="planning-table-container">
          <div class="planning-table-header-info">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Preparador de Clases Diario
              </h3>
              ${(typeof StorageService !== 'undefined' && StorageService.hasPlanSnapshot && StorageService.hasPlanSnapshot(this.currentDateStr)) ? `
                <button type="button" class="btn btn-secondary btn-sm" style="background:#fef3c7; color:#92400e; border-color:#fde68a; font-weight:700; display:inline-flex; align-items:center; gap:4px; padding:3px 9px; font-size:0.75rem; border-radius:12px; cursor:pointer;" onclick="Planner.undoLastScheduleAction()" title="Restaurar el estado anterior de tus clases antes del último cambio">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                  ↩ Deshacer cambio de horario
                </button>
              ` : ''}
            </div>
            <div id="planner-save-indicator" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 10px; border-radius: 20px; transition: all 0.2s ease;">
              <span style="font-size: 0.95rem;">✓</span>
              <span>Guardado al instante</span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="planner-table">
              <thead>
                <tr>
                  <th class="col-date">FECHA<br/><small>d/m/a</small></th>
                  <th class="col-day-num">
                    CLASE
                    <button type="button" class="btn btn-secondary" style="font-size:0.65rem; padding:1px 4px; margin-top:2px; display:block; width:100%;" onclick="Planner.autoRenumberSequence()" title="Recalcular consecutivo desde planeaciones anteriores">⚡ Consecutivo</button>
                  </th>
                  <th class="col-day-name">DÍA</th>
                  <th class="col-subject-grade">ASIGNATURA Y GRADO</th>
                  <th class="col-dba">DBA</th>
                  <th class="col-perf">LOGRO E INDICADOR</th>
                  <th class="col-topic">TEMA</th>
                  <th class="col-desc">Secuencia didáctica (Inicio, Desarrollo, Cierre, Recursos, Tareas, Evaluación)</th>
                  <th class="col-action" style="font-size:0.72rem;">Descargar</th>
                </tr>
              </thead>
              <tbody id="planner-table-body">
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div class="table-footer-actions">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-secondary" onclick="Planner.addRow()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Añadir otra clase / hora
              </button>

              <button class="btn btn-secondary" onclick="Planner.applyOfficialSchedule()" title="Restablecer las clases según el horario oficial del colegio para este día">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                🔄 Aplicar Horario Oficial de este Día
              </button>
            </div>

            <button class="btn btn-danger-subtle" onclick="Planner.clearAllRows()">
              Limpiar planeación del día
            </button>
          </div>
        </div>

        <!-- SECCIÓN: ANEXOS Y RECURSOS -->
        <div class="attachments-card">
          <div class="attachments-card-header">
            <h4>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              Anexos y Recursos Adjuntos (Imágenes y PDFs)
            </h4>
            <label class="btn btn-secondary" style="font-size:0.8rem; cursor:pointer; padding:0.45rem 0.85rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Subir Archivo
              <input type="file" id="attachment-file-input" accept="image/*,application/pdf" multiple style="display:none;" onchange="Planner.handleFileUpload(event)" />
            </label>
          </div>

          <div class="attachments-dropzone" onclick="document.getElementById('attachment-file-input').click()">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <p style="font-size:0.85rem; font-weight:600; color:var(--slate-700); margin:0;">Arrastra o haz clic para adjuntar imágenes o guías en PDF</p>
            <span style="font-size:0.75rem; color:var(--slate-400);">Archivos vinculados a la planeación del día</span>
          </div>

          ${attachments.length > 0 ? `<div class="attachments-grid">${attachmentsCardsHtml}</div>` : ''}
        </div>

        <!-- Observaciones Generales -->
        <div class="general-notes-card">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate-700)" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            OBSERVACIONES:
          </h4>
          <textarea class="notes-textarea" id="planner-general-notes" placeholder="Escribe aquí las observaciones pedagógicas que aparecerán en las líneas inferiores del formato..." oninput="Planner.handleInputChange()" onchange="Planner.handleInputChange(true)" onblur="Planner.handleInputChange(true)" onpaste="Planner.handlePaste(event)">${this.escapeHtml(this.currentPlan.generalNotes || '')}</textarea>
        </div>
      </div>
    `;

    this.bindInputEvents();
    setTimeout(() => this.autoResizeAllDescriptions(), 30);
  }

  bindInputEvents() {
    if (!this.container || this._inputEventsBound) return;
    this._inputEventsBound = true;
    this.container.addEventListener('input', () => {
      this.handleInputChange(false);
    });
    this.container.addEventListener('change', () => {
      this.handleInputChange(true);
    });
    this.container.addEventListener('paste', () => {
      setTimeout(() => this.handleInputChange(true), 35);
    });
    this.container.addEventListener('focusout', (e) => {
      if (e.target && (e.target.matches('input, textarea, select') || e.target.closest('input, textarea, select'))) {
        this.handleInputChange(true);
      }
    });
  }

  handlePeriodChange(newPeriod) {
    this.collectDataFromDOM();
    this.currentPlan.period = newPeriod;

    // Actualizar automáticamente los DBAs y desempeños de aprendizaje para el nuevo periodo
    if (typeof CurriculumService !== 'undefined') {
      this.currentPlan.classes.forEach(cls => {
        const autoCur = CurriculumService.getAutoCurriculumItem(newPeriod, cls.subject, cls.grade, cls.dayNumber);
        if (autoCur) {
          cls.topic = autoCur.topic;
          cls.dba = autoCur.dba;
          cls.achievement = autoCur.achievement;
        }
      });
    }

    this.render();
    this.saveCurrentPlan(false);
    App.showToast(`¡DBAs y desempeños actualizados al ${newPeriod} Periodo!`, 'info');
  }

  setAsFirstDayOfClasses() {
    const formatted = this.formatFullDate(this.currentDateStr);
    if (!confirm(`¿Deseas fijar el día "${formatted}" como el PRIMER DÍA DE CLASES (Clase 1)?\n\n- Se iniciará la numeración consecutiva desde este día (Clase 1, 2...).\n- Se cargarán automáticamente los temas, DBAs y desempeños del curso.`)) {
      return;
    }

    StorageService.setAcademicStartDate(this.currentDateStr);
    this.loadDate(this.currentDateStr);
    App.showToast(`🎉 ¡${formatted} fijado como Primer Día de Clases (Clase 1)! Datos del curso cargados.`, 'success');

    if (window.Calendar && window.Calendar.render) {
      window.Calendar.render();
    }
  }

  handleSubjectChange(rowIndex, newSubject) {
    this.collectDataFromDOM();
    const profile = StorageService.getProfile();
    const subObj = (profile.subjects || []).find(s => (typeof s === 'object' ? s.name : s) === newSubject);
    
    if (subObj && subObj.grades && subObj.grades.length > 0) {
      if (!subObj.grades.includes(this.currentPlan.classes[rowIndex].grade)) {
        this.currentPlan.classes[rowIndex].grade = subObj.grades[0];
      }
    }

    this.render();
    this.saveCurrentPlan(false);
  }

  openClassAttachmentsModal(classIdx) {
    this.collectDataFromDOM();
    if (!this.currentPlan || !this.currentPlan.classes || !this.currentPlan.classes[classIdx]) {
      alert('La clase no existe.');
      return;
    }
    this.activeClassAttachmentIndex = classIdx;
    this.renderClassAttachmentsModal();
    const modal = document.getElementById('class-attachments-modal-backdrop');
    if (modal) modal.classList.add('active');
  }

  closeClassAttachmentsModal() {
    const modal = document.getElementById('class-attachments-modal-backdrop');
    if (modal) modal.classList.remove('active');
    this.activeClassAttachmentIndex = null;
    this.render(); // Refrescar contador de anexos en la tabla
  }

  renderClassAttachmentsModal() {
    const classIdx = this.activeClassAttachmentIndex;
    if (classIdx === null || !this.currentPlan || !this.currentPlan.classes[classIdx]) return;

    const cls = this.currentPlan.classes[classIdx];
    if (!cls.attachments) cls.attachments = [];

    const classNum = cls.dayNumber ? `Clase ${cls.dayNumber}` : `Clase ${classIdx + 1}`;
    const titleEl = document.getElementById('class-attachments-modal-title');
    if (titleEl) {
      titleEl.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
        Archivos y Guías - ${this.escapeHtml(classNum)}: ${this.escapeHtml(cls.subject || 'Materia')} (${this.escapeHtml(cls.grade || '')})
      `;
    }

    const bodyEl = document.getElementById('class-attachments-modal-body');
    if (!bodyEl) return;

    const cardsHtml = cls.attachments.map((att, attIdx) => {
      const isImg = att.type && att.type.startsWith('image/');
      const isPdf = att.type === 'application/pdf' || (att.name && att.name.toLowerCase().endsWith('.pdf'));

      return `
        <div class="attachment-card" style="border: 1px solid var(--slate-200); border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: space-between; background: #fff; margin-bottom: 8px; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
            <div class="attachment-preview-box" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--slate-100); border-radius: 6px; overflow: hidden; flex-shrink: 0;">
              ${isImg 
                ? `<img src="${att.dataUrl}" alt="Anexo" onclick="Planner.previewImage('${att.dataUrl}', '${this.escapeHtml(att.name)}')" style="cursor:pointer; max-width: 100%; max-height: 100%; object-fit: cover;" />`
                : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>`
              }
            </div>
            <div style="min-width: 0; flex: 1;">
              <div class="attachment-name" style="font-weight: 700; font-size: 0.88rem; color: var(--slate-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this.escapeHtml(att.name)}">
                ${this.escapeHtml(att.name)}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                <span class="role-badge" style="font-size: 0.65rem; padding: 1px 6px; ${isPdf ? 'background:#fee2e2; color:#b91c1c; border: 1px solid #fca5a5;' : 'background:#e0f2fe; color:#0369a1; border: 1px solid #bae6fd;'}">
                  ${isPdf ? 'DOCUMENTO PDF' : 'IMAGEN'}
                </span>
                <span style="font-size: 0.75rem; color: var(--slate-500);">${att.sizeText || 'Archivo'}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${isPdf 
              ? `<button type="button" class="btn btn-secondary btn-sm" onclick="Planner.printPdfDocument('${att.dataUrl}', '${this.escapeHtml(att.name)}')" title="Imprimir PDF"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg></button>
                 <button type="button" class="btn btn-secondary btn-sm" onclick="Planner.openPdfAttachment('${att.dataUrl}')" title="Ver PDF en pantalla completa"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`
              : `<button type="button" class="btn btn-secondary btn-sm" onclick="Planner.previewImage('${att.dataUrl}', '${this.escapeHtml(att.name)}')" title="Ver imagen"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>`
            }
            <a href="${att.dataUrl}" download="${this.escapeHtml(att.name)}" class="btn btn-secondary btn-sm" title="Descargar archivo a tu computador" style="display: inline-flex; align-items: center; padding: 4px 8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
            <button type="button" class="btn btn-danger-subtle btn-sm" onclick="Planner.deleteClassAttachment(${attIdx})" title="Eliminar este anexo de la clase">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    bodyEl.innerHTML = `
      <div style="background: var(--primary-50); border: 1px solid var(--primary-200); border-radius: 8px; padding: 10px 14px; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-weight: 800; color: var(--primary-950); font-size: 0.95rem;">
              📌 ${this.escapeHtml(cls.topic || 'Sin tema asignado')}
            </div>
            <div style="font-size: 0.8rem; color: var(--slate-600); margin-top: 2px;">
              Los archivos que adjuntes aquí quedan vinculados <strong>exclusivamente a esta clase</strong>.
            </div>
          </div>
          <label class="btn btn-primary btn-sm" style="cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Subir Archivo a esta Clase
            <input type="file" id="class-attachment-file-input" accept="image/*,application/pdf" multiple style="display:none;" onchange="Planner.handleClassFileUpload(event)" />
          </label>
        </div>
      </div>

      <div class="attachments-dropzone" onclick="document.getElementById('class-attachment-file-input').click()" style="margin-bottom: 1.25rem;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <p style="font-size:0.85rem; font-weight:600; color:var(--slate-700); margin:0;">Arrastra o haz clic para adjuntar guías PDF, talleres o imágenes</p>
        <span style="font-size:0.75rem; color:var(--slate-400);">Archivos vinculados a la ${classNum}</span>
      </div>

      <div style="margin-top: 0.5rem;">
        <h4 style="font-size: 0.88rem; color: var(--slate-700); margin: 0 0 8px 0; font-weight: 700;">
          Archivos Adjuntos (${cls.attachments.length}):
        </h4>
        ${cls.attachments.length > 0 
          ? `<div style="max-height: 280px; overflow-y: auto;">${cardsHtml}</div>`
          : `<p style="font-size: 0.82rem; color: var(--slate-400); font-style: italic; margin: 0;">Esta clase aún no tiene archivos adjuntos. Usa el botón superior para agregar una guía o imagen.</p>`
        }
      </div>
    `;
  }

  handleClassFileUpload(event) {
    const classIdx = this.activeClassAttachmentIndex;
    if (classIdx === null || !this.currentPlan || !this.currentPlan.classes[classIdx]) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const cls = this.currentPlan.classes[classIdx];
    if (!cls.attachments) cls.attachments = [];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      if (!isImg && !isPdf) {
        alert(`El archivo ${file.name} no es una imagen ni un PDF admitido.`);
        return;
      }

      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const sizeText = file.size > 1024 * 1024 
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : (file.size / 1024).toFixed(0) + ' KB';

        cls.attachments.push({
          name: file.name,
          type: file.type,
          sizeText: sizeText,
          dataUrl: dataUrl
        });

        this.renderClassAttachmentsModal();
        this.saveCurrentPlan(true);
        App.showToast(`Anexo agregado a la clase: ${file.name}`, 'success');
      };

      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }

  deleteClassAttachment(attIdx) {
    const classIdx = this.activeClassAttachmentIndex;
    if (classIdx === null || !this.currentPlan || !this.currentPlan.classes[classIdx]) return;

    if (!confirm('¿Deseas eliminar este archivo adjunto de esta clase?')) return;
    this.currentPlan.classes[classIdx].attachments.splice(attIdx, 1);
    this.renderClassAttachmentsModal();
    this.saveCurrentPlan(false);
    App.showToast('Anexo eliminado de la clase', 'info');
  }

  handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      if (!isImg && !isPdf) {
        alert(`El archivo ${file.name} no es una imagen ni un PDF admitido.`);
        return;
      }

      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const sizeText = file.size > 1024 * 1024 
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : (file.size / 1024).toFixed(0) + ' KB';

        if (!this.currentPlan.attachments) this.currentPlan.attachments = [];
        this.currentPlan.attachments.push({
          name: file.name,
          type: file.type,
          sizeText: sizeText,
          dataUrl: dataUrl
        });

        this.render();
        this.saveCurrentPlan(true);
        App.showToast(`Anexo agregado: ${file.name}`, 'success');
      };

      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }

  deleteAttachment(index) {
    if (!confirm('¿Deseas eliminar este archivo adjunto?')) return;
    this.currentPlan.attachments.splice(index, 1);
    this.render();
    this.saveCurrentPlan(false);
    App.showToast('Anexo eliminado', 'info');
  }

  previewImage(dataUrl, name) {
    const modalBackdrop = document.getElementById('image-preview-modal-backdrop');
    const modalImg = document.getElementById('preview-modal-image-tag');
    const modalTitle = document.getElementById('preview-modal-title');
    if (modalBackdrop && modalImg) {
      modalImg.src = dataUrl;
      if (modalTitle) modalTitle.textContent = name;
      modalBackdrop.classList.add('active');
    }
  }

  openPdfAttachment(dataUrl) {
    const win = window.open();
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Visor de Documento PDF</title>
            <style>
              body { margin:0; padding:0; height:100vh; overflow:hidden; background:#1e293b; }
              iframe { border:none; width:100%; height:100%; }
            </style>
          </head>
          <body>
            <iframe src="${dataUrl}"></iframe>
          </body>
        </html>
      `);
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'documento_anexo.pdf';
      link.click();
    }
  }

  printPdfDocument(dataUrl, name) {
    App.showToast(`Preparando impresión de: ${name || 'PDF'}...`, 'info');
    
    let printIframe = document.getElementById('hidden-pdf-print-frame');
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'hidden-pdf-print-frame';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);
    }

    printIframe.src = dataUrl;
    printIframe.onload = function() {
      try {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } catch (e) {
        window.open(dataUrl, '_blank');
      }
    };
  }

  onSubjectChange(idx, newSubject) {
    this.collectDataFromDOM();
    if (this.currentPlan.classes[idx]) {
      this.currentPlan.classes[idx].subject = newSubject;
      const profile = StorageService.getProfile();
      const subObj = (profile.subjects || []).find(s => (typeof s === 'string' ? s : s.name) === newSubject);
      const grades = subObj && subObj.grades && subObj.grades.length > 0 ? subObj.grades : (profile.grades || ['1°']);
      if (!grades.includes(this.currentPlan.classes[idx].grade) && grades.length > 0) {
        this.currentPlan.classes[idx].grade = grades[0];
      }

      // Recalcular consecutivo por materia y grado
      const newNum = StorageService.getNextClassNumber(
        this.currentDateStr,
        this.currentPlan.classes[idx].subject,
        this.currentPlan.classes[idx].grade,
        idx,
        this.currentPlan.classes
      );
      this.currentPlan.classes[idx].dayNumber = String(newNum);

      // Auto-llenar desde clase espejo si existe, o desde la malla curricular
      if (this.isDirectionOfGroup(this.currentPlan.classes[idx].subject)) {
        this.currentPlan.classes[idx].topic = '';
        this.currentPlan.classes[idx].dba = '';
        this.currentPlan.classes[idx].achievement = '';
        this.currentPlan.classes[idx].performance = '';
      } else {
        const mirrorContent = typeof StorageService !== 'undefined' && StorageService.getParallelClassContent
          ? StorageService.getParallelClassContent(this.currentPlan.classes[idx].subject, this.currentPlan.classes[idx].grade, newNum)
          : null;

        if (mirrorContent) {
          this.currentPlan.classes[idx].topic = mirrorContent.topic;
          this.currentPlan.classes[idx].dba = mirrorContent.dba;
          this.currentPlan.classes[idx].achievement = mirrorContent.achievement;
          this.currentPlan.classes[idx].description = mirrorContent.description;
          this.currentPlan.classes[idx].observations = mirrorContent.observations;
          this.currentPlan.classes[idx].notebookContent = mirrorContent.notebookContent;
          this.currentPlan.classes[idx].attachments = mirrorContent.attachments || [];
        } else if (typeof CurriculumService !== 'undefined') {
          const period = this.currentPlan.period || profile.period || '1°';
          const autoCur = CurriculumService.getAutoCurriculumItem(period, this.currentPlan.classes[idx].subject, this.currentPlan.classes[idx].grade, newNum);
          if (autoCur) {
            this.currentPlan.classes[idx].topic = autoCur.topic;
            this.currentPlan.classes[idx].dba = autoCur.dba;
            this.currentPlan.classes[idx].achievement = autoCur.achievement;
            if (autoCur.suggestedSequence && (!this.currentPlan.classes[idx].description || this.currentPlan.classes[idx].description.trim() === '')) {
              this.currentPlan.classes[idx].description = autoCur.suggestedSequence;
            }
          }
        }
      }
    }
    this.render();
    this.saveCurrentPlan(false);
  }

  onGradeChange(idx, newGrade) {
    this.collectDataFromDOM();
    if (this.currentPlan.classes[idx]) {
      this.currentPlan.classes[idx].grade = newGrade;

      // Recalcular consecutivo por materia y nuevo grado
      const newNum = StorageService.getNextClassNumber(
        this.currentDateStr,
        this.currentPlan.classes[idx].subject,
        this.currentPlan.classes[idx].grade,
        idx,
        this.currentPlan.classes
      );
      this.currentPlan.classes[idx].dayNumber = String(newNum);

      // Auto-llenar desde clase espejo si existe, o desde la malla curricular
      if (this.isDirectionOfGroup(this.currentPlan.classes[idx].subject)) {
        this.currentPlan.classes[idx].topic = '';
        this.currentPlan.classes[idx].dba = '';
        this.currentPlan.classes[idx].achievement = '';
        this.currentPlan.classes[idx].performance = '';
      } else {
        const mirrorContent = typeof StorageService !== 'undefined' && StorageService.getParallelClassContent
          ? StorageService.getParallelClassContent(this.currentPlan.classes[idx].subject, this.currentPlan.classes[idx].grade, newNum)
          : null;

        if (mirrorContent) {
          this.currentPlan.classes[idx].topic = mirrorContent.topic;
          this.currentPlan.classes[idx].dba = mirrorContent.dba;
          this.currentPlan.classes[idx].achievement = mirrorContent.achievement;
          this.currentPlan.classes[idx].description = mirrorContent.description;
          this.currentPlan.classes[idx].observations = mirrorContent.observations;
          this.currentPlan.classes[idx].notebookContent = mirrorContent.notebookContent;
          this.currentPlan.classes[idx].attachments = mirrorContent.attachments || [];
        } else if (typeof CurriculumService !== 'undefined') {
          const profile = StorageService.getProfile();
          const period = this.currentPlan.period || profile?.period || '1°';
          const autoCur = CurriculumService.getAutoCurriculumItem(period, this.currentPlan.classes[idx].subject, this.currentPlan.classes[idx].grade, newNum);
          if (autoCur) {
            this.currentPlan.classes[idx].topic = autoCur.topic;
            this.currentPlan.classes[idx].dba = autoCur.dba;
            this.currentPlan.classes[idx].achievement = autoCur.achievement;
            if (autoCur.suggestedSequence && (!this.currentPlan.classes[idx].description || this.currentPlan.classes[idx].description.trim() === '')) {
              this.currentPlan.classes[idx].description = autoCur.suggestedSequence;
            }
          }
        }
      }
    }
    this.render();
    this.saveCurrentPlan(false);
  }

  removeRow(idx) {
    this.deleteRow(idx);
  }

  applyCurriculumToClass(classIdx, itemIdxStr) {
    if (itemIdxStr === '') return;
    const itemIdx = parseInt(itemIdxStr, 10);
    this.collectDataFromDOM();

    const cls = this.currentPlan.classes[classIdx];
    if (!cls) return;

    const profile = StorageService.getProfile();
    const period = this.currentPlan.period || profile?.period || '1°';
    const items = CurriculumService.getItems(period, cls.subject, cls.grade);

    if (items && items[itemIdx]) {
      const item = items[itemIdx];
      cls.topic = item.topic || '';
      cls.achievement = item.achievement || '';
      cls.dba = item.dba || '';
      if (item.suggestedSequence && (!cls.description || cls.description.trim() === '')) {
        cls.description = item.suggestedSequence;
      }
      
      this.render();
      App.showToast(`¡Cargado: "${item.topic}"!`, 'success');
      this.saveCurrentPlan(false);
    }
  }

  syncAllClassesWithCurriculum(force = true) {
    if (!this.currentPlan || !this.currentPlan.classes) return;
    this.collectDataFromDOM();

    const profile = StorageService.getProfile();
    const period = this.currentPlan.period || profile?.period || '1°';

    let updatedCount = 0;
    this.currentPlan.classes.forEach(cls => {
      const autoCur = CurriculumService.getAutoCurriculumItem(period, cls.subject, cls.grade, cls.dayNumber);
      if (autoCur) {
        cls.dba = autoCur.dba;
        cls.achievement = autoCur.achievement;
        if (force || !cls.topic) cls.topic = autoCur.topic;
        if (!cls.description && autoCur.suggestedSequence) {
          cls.description = autoCur.suggestedSequence;
        }
        updatedCount++;
      }
    });

    this.render();
    this.saveCurrentPlan(true);
    App.showToast(`¡Malla Curricular del ${period} Periodo sincronizada con éxito (${updatedCount} clases actualizadas)!`, 'success');
  }

  openSheetPreview() {
    this.saveCurrentPlan(false);
    const profile = StorageService.getProfile();
    ExportService.openLivePreview(this.currentPlan, profile);
  }

  toggleExportDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById('export-dropdown-menu');
    if (menu) {
      menu.classList.toggle('show');
    }
  }

  collectDataFromDOM(targetDate = null) {
    const effectiveDate = targetDate || this.currentDateStr;
    const tableBody = document.getElementById('planner-table-body');
    const rows = tableBody ? tableBody.querySelectorAll('tr') : [];
    if (!rows || rows.length === 0) return;

    const storedPlan = StorageService.getPlanByDate ? StorageService.getPlanByDate(effectiveDate) : StorageService.getPlan(effectiveDate);
    const classes = [];

    rows.forEach((row, idx) => {
      const date = effectiveDate;
      const dayNumber = (row.querySelector('input.cls-day-number, input.col-daynumber')?.value || `${idx + 1}`).trim();
      const dayOfWeek = (row.querySelector('input.cls-day-of-week, input.col-dayofweek')?.value || ExportService.getDayOfWeekName(effectiveDate)).trim();
      const subject = (row.querySelector('select.cls-subject, select.col-subject')?.value || '').trim();
      const grade = (row.querySelector('select.cls-grade, select.col-grade')?.value || '').trim();
      const dba = (row.querySelector('textarea.cls-dba, textarea.col-dba')?.value || '').trim();
      const achievement = (row.querySelector('textarea.cls-achievement, textarea.col-achievement')?.value || '').trim();
      const topic = (row.querySelector('textarea.cls-topic, textarea.col-topic')?.value || '').trim();
      const description = (row.querySelector('textarea.cls-description, textarea.col-description')?.value || '').trim();
      const observations = (row.querySelector('textarea.cls-observations')?.value || '').trim();

      const storedClass = storedPlan?.classes?.[idx];
      const prevClass = this.currentPlan?.classes?.[idx];

      // Identidad estable para la clase
      const planId = this.currentPlan?.id || (typeof PlanRepository !== 'undefined' ? PlanRepository.generatePlanId(null, effectiveDate) : 'plan_' + effectiveDate);
      const classId = prevClass?.id || storedClass?.id || (typeof PlanRepository !== 'undefined' ? PlanRepository.generateClassId(planId, idx, subject, grade) : 'class_' + idx);

      let prevNotebookContent = prevClass?.notebookContent || storedClass?.notebookContent || '';
      // Protección: si el índice no coincide por reordenamiento, buscar cuaderno por materia y grado
      if (!prevNotebookContent && this.currentPlan?.classes) {
        const matchSubGrd = this.currentPlan.classes.find(c =>
          String(c.subject || '').toLowerCase().trim() === subject.toLowerCase().trim() &&
          String(c.grade || '').toLowerCase().trim() === grade.toLowerCase().trim() &&
          c.notebookContent && c.notebookContent.trim().length > 0
        );
        if (matchSubGrd) prevNotebookContent = matchSubGrd.notebookContent;
      }

      const prevTime = prevClass?.time || storedClass?.time || '';
      const prevAttachments = (prevClass?.attachments && prevClass.attachments.length > 0)
        ? prevClass.attachments
        : (storedClass?.attachments || []);

      // Regla anti-vacíos: si el textarea en DOM vino vacío pero había texto previo, preservar
      const safeDba = (dba || (!dba && storedClass?.dba ? storedClass.dba : ''));
      const safeAchievement = (achievement || (!achievement && storedClass?.achievement ? storedClass.achievement : ''));
      const safeTopic = (topic || (!topic && storedClass?.topic ? storedClass.topic : ''));
      const safeDescription = (description || (!description && storedClass?.description ? storedClass.description : ''));
      const safeObservations = (observations || (!observations && storedClass?.observations ? storedClass.observations : ''));

      classes.push({
        id: classId,
        planId: planId,
        date: effectiveDate, // INMUTABLE
        time: prevTime,
        dayNumber,
        dayOfWeek,
        subject,
        grade,
        dba: safeDba,
        achievement: safeAchievement,
        topic: safeTopic,
        description: safeDescription,
        observations: safeObservations,
        attachments: prevAttachments,
        notebookContent: prevNotebookContent
      });
    });

    const generalNotes = document.getElementById('planner-general-notes')?.value ?? (this.currentPlan?.generalNotes || '');
    const period = document.getElementById('planner-period-select')?.value || this.currentPlan?.period || '1°';
    const planId = this.currentPlan?.id || (typeof PlanRepository !== 'undefined' ? PlanRepository.generatePlanId(null, effectiveDate) : 'plan_' + effectiveDate);

    this.currentPlan = {
      ...(this.currentPlan || {}),
      id: planId,
      date: effectiveDate, // INMUTABLE
      period,
      classes,
      generalNotes
    };
  }

  updateSaveIndicator(status = 'saved') {
    const el = document.getElementById('planner-save-indicator');
    if (!el) return;
    if (status === 'saving') {
      el.style.color = '#b45309';
      el.style.background = '#fffbeb';
      el.style.borderColor = '#fde68a';
      el.innerHTML = '<span style="display:inline-block; font-size:0.9rem;">⏳</span> <span>Guardando cambios...</span>';
    } else {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      el.style.color = '#059669';
      el.style.background = '#ecfdf5';
      el.style.borderColor = '#a7f3d0';
      el.innerHTML = `<span style="font-size:0.95rem;">✓</span> <span>Guardado (${timeStr})</span>`;
    }
  }

  _setupMultiTabSync() {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      this._syncChannel = new BroadcastChannel('planeaciones_repo_channel');
      this._syncChannel.onmessage = (event) => {
        const msg = event?.data;
        if (!msg) return;
        if (msg.type === 'CLASS_SAVED' && msg.date === this.currentDateStr) {
          const classIdx = this.currentPlan?.classes?.findIndex(c => c.id === msg.classId || c.classId === msg.classId);
          if (classIdx !== -1 && classIdx !== undefined) {
            console.warn(`[Multi-pestaña] Clase ${msg.classId} actualizada en otra ventana.`);
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast(`⚠️ La clase #${classIdx + 1} fue actualizada en otra pestaña`, 'info');
            }
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel no soportado:', e);
    }
  }

  hasUnsavedChanges() {
    return Boolean(this._hasUnsavedChanges);
  }

  setUnsavedChanges(val = true) {
    this._hasUnsavedChanges = Boolean(val);
    const el = document.getElementById('planner-save-indicator');
    if (el && val) {
      el.style.color = '#b45309';
      el.style.background = '#fffbeb';
      el.style.borderColor = '#fde68a';
      el.innerHTML = '<span style="font-size:0.95rem;">●</span> <span>Cambios sin guardar</span>';
    }
  }

  promptNavigateIfUnsaved(onProceed) {
    if (!this.hasUnsavedChanges()) {
      if (typeof onProceed === 'function') onProceed();
      return;
    }

    const existing = document.getElementById('unsaved-changes-modal');
    if (existing) existing.remove();

    const modalHtml = `
      <div id="unsaved-changes-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.65); backdrop-filter:blur(2px); display:flex; align-items:center; justify-content:center; z-index:99999;">
        <div style="background:#ffffff; border-radius:14px; padding:24px; max-width:440px; width:92%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); font-family:inherit;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="width:40px; height:40px; border-radius:10px; background:#fef3c7; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
              ⚠️
            </div>
            <div>
              <h3 style="margin:0; font-size:1.15rem; color:#1e293b; font-weight:700;">Cambios sin guardar</h3>
              <p style="margin:2px 0 0 0; font-size:0.8rem; color:#64748b;">Hay modificaciones pendientes en esta planeación</p>
            </div>
          </div>
          <p style="margin:14px 0 20px 0; font-size:0.9rem; color:#334155; line-height:1.5;">
            ¿Deseas guardar los cambios antes de continuar a otra vista o fecha?
          </p>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <button id="btn-unsaved-save" style="background:#059669; color:white; border:none; padding:11px 16px; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.92rem; display:flex; align-items:center; justify-content:center; gap:6px;">
              💾 Guardar y salir
            </button>
            <button id="btn-unsaved-discard" style="background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; padding:10px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.88rem; display:flex; align-items:center; justify-content:center; gap:6px;">
              🏃 Salir sin guardar
            </button>
            <button id="btn-unsaved-cancel" style="background:transparent; color:#64748b; border:1px solid #cbd5e1; padding:9px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.85rem;">
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById('unsaved-changes-modal');
    const closeModal = () => { if (modalEl) modalEl.remove(); };

    document.getElementById('btn-unsaved-save')?.addEventListener('click', () => {
      closeModal();
      this.saveCurrentPlan(false);
      this._hasUnsavedChanges = false;
      if (typeof onProceed === 'function') onProceed();
    });

    document.getElementById('btn-unsaved-discard')?.addEventListener('click', () => {
      closeModal();
      this._hasUnsavedChanges = false;
      if (typeof onProceed === 'function') onProceed();
    });

    document.getElementById('btn-unsaved-cancel')?.addEventListener('click', () => {
      closeModal();
    });
  }

  saveSingleClass(rowIndex, showFeedback = true) {
    if (!this.currentPlan || !Array.isArray(this.currentPlan.classes) || !this.currentPlan.classes[rowIndex]) {
      if (showFeedback && typeof App !== 'undefined' && App.showToast) {
        App.showToast('No se encontró la clase especificada', 'error');
      }
      return false;
    }

    const tableBody = document.getElementById('planner-table-body');
    const rows = tableBody ? tableBody.querySelectorAll('tr') : [];
    const rowEl = rows[rowIndex];

    const currentCls = this.currentPlan.classes[rowIndex];
    const classId = currentCls.id || (typeof PlanRepository !== 'undefined' ? PlanRepository.generateClassId(this.currentPlan.id) : `cls_${Date.now()}_${rowIndex}`);
    currentCls.id = classId;
    currentCls.classId = classId;

    let classData = { ...currentCls };
    if (rowEl) {
      const dayNumber = (rowEl.querySelector('input.cls-day-number, input.col-daynumber')?.value || currentCls.dayNumber || `${rowIndex + 1}`).trim();
      const dayOfWeek = (rowEl.querySelector('input.cls-day-of-week, input.col-dayofweek')?.value || currentCls.dayOfWeek || ExportService.getDayOfWeekName(this.currentDateStr)).trim();
      const subject = (rowEl.querySelector('select.cls-subject, select.col-subject')?.value || currentCls.subject || '').trim();
      const grade = (rowEl.querySelector('select.cls-grade, select.col-grade')?.value || currentCls.grade || '').trim();
      const dba = (rowEl.querySelector('textarea.cls-dba, textarea.col-dba')?.value || '').trim();
      const achievement = (rowEl.querySelector('textarea.cls-achievement, textarea.col-achievement')?.value || '').trim();
      const topic = (rowEl.querySelector('textarea.cls-topic, textarea.col-topic')?.value || '').trim();
      const description = (rowEl.querySelector('textarea.cls-description, textarea.col-description')?.value || '').trim();
      const observations = (rowEl.querySelector('textarea.cls-observations')?.value || '').trim();

      classData.dayNumber = dayNumber;
      classData.sequenceNumber = parseInt(dayNumber, 10) || currentCls.sequenceNumber || (rowIndex + 1);
      classData.dayOfWeek = dayOfWeek;
      classData.subject = subject;
      classData.grade = grade;
      classData.dba = dba || (!dba && currentCls.dba ? currentCls.dba : '');
      classData.achievement = achievement || (!achievement && currentCls.achievement ? currentCls.achievement : '');
      classData.topic = topic || (!topic && currentCls.topic ? currentCls.topic : '');
      classData.description = description || (!description && currentCls.description ? currentCls.description : '');
      classData.observations = observations || (!observations && currentCls.observations ? currentCls.observations : '');
    }

    let success = false;
    if (typeof PlanRepository !== 'undefined' && PlanRepository.saveClass) {
      const teacherId = (typeof UserService !== 'undefined' && UserService.getCurrentTeacherId) ? UserService.getCurrentTeacherId() : null;
      const res = PlanRepository.saveClass(teacherId, this.currentDateStr, classId, classData);
      success = Boolean(res && (res.id || res.classId));
      if (success) {
        this.currentPlan.classes[rowIndex] = res;
      }
    } else if (typeof StorageService !== 'undefined' && StorageService.saveClass) {
      const res = StorageService.saveClass(this.currentDateStr, classId, classData);
      success = Boolean(res && (res.id || res.classId));
      if (success) {
        this.currentPlan.classes[rowIndex] = res;
      }
    } else {
      this.currentPlan.classes[rowIndex] = classData;
      success = StorageService.savePlan(this.currentDateStr, this.currentPlan);
    }

    const indicator = document.getElementById(`class-save-indicator-${rowIndex}`);
    const btn = document.getElementById(`btn-save-class-${rowIndex}`);
    if (indicator) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      indicator.innerHTML = `✓ Guardada<br><span style="font-size:0.6rem; color:#64748b;">${timeStr}</span>`;
      indicator.style.display = 'block';
    }
    if (btn) {
      btn.style.background = '#d1fae5';
      btn.style.borderColor = '#34d399';
      setTimeout(() => {
        if (btn) {
          btn.style.background = '#ecfdf5';
          btn.style.borderColor = '#a7f3d0';
        }
      }, 1500);
    }

    if (showFeedback && typeof App !== 'undefined' && App.showToast) {
      if (success) {
        App.showToast(`✓ Clase de ${classData.subject} (${classData.grade}) guardada individualmente`, 'success');
      } else {
        App.showToast('Error al guardar la clase', 'warning');
      }
    }

    if (window.Calendar && typeof window.Calendar.updateDayIndicators === 'function') {
      window.Calendar.updateDayIndicators();
    }

    return success;
  }

  formatSequenceSpacing(text, rawHtml = '') {
    let str = (typeof text === 'string') ? text : '';
    const html = (typeof rawHtml === 'string') ? rawHtml : '';

    // Si viene HTML con etiquetas de párrafo o marcas de negrita (Word, Docs, ChatGPT)
    if (html && (html.includes('<p') || html.includes('<br') || html.includes('<div') || html.includes('<strong>') || html.includes('<b>') || html.includes('<li'))) {
      try {
        let h = html
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<br\s*[\/]?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<\/div>/gi, '\n\n')
          .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n\n')
          .replace(/<[^>]+>/g, '');

        h = h.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"');

        if (!str.trim() || h.trim().length >= str.trim().length * 0.7) {
          str = h;
        }
      } catch (e) {}
    }

    if (!str || !str.trim()) return '';

    str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Quitar marcas de encabezados markdown (###, ##, #) al inicio de línea
    str = str.replace(/^[ \t]*#{1,6}[ \t]+/gm, '');

    // 2. Prefijos de fases docentes conocidos (NO deben coincidir si están entre paréntesis como "(Tiempo: 10 min)")
    const phasePrefixes = [
      'FASE\\s+DE\\s+(?:INICIO|DESARROLLO|CIERRE)',
      '(?:Fase\\s+de\\s+)?(?:Inicio|Desarrollo|Cierre)',
      'Recursos(?:\\s+didácticos)?',
      'Evaluaci[oó]n(?:\\s+formativa)?',
      'Tareas?(?:\\s*\\/\\s*Compromisos?)?',
      'Compromisos?',
      'Eje\\s+temático(?:\\s+principal)?',
      'Metodolog[ií]a',
      'Tiempo(?:\\s+disponible)?',
      'Pregunta\\s+problematizadora',
      'Estándar(?:\\s+básico)?',
      'Paso\\s+\\d+'
    ].join('|');

    // Caso A: Títulos con dos puntos que NO estén entre paréntesis
    const phaseColonRegex = new RegExp(`(?<!^)(?<!\\()[ \\t]*(\\*{0,2}(?:${phasePrefixes})(?:[ \\t]*\\([^)]*\\))?\\*{0,2})\\s*:\\s*`, 'gi');
    str = str.replace(phaseColonRegex, '\n\n$1: ');

    // Caso B: Títulos de fase principales como "FASE DE INICIO (Tiempo: 10 minutos)" o "FASE DE DESARROLLO"
    const phaseHeadingRegex = new RegExp(`(?<!^)[ \\t]*(\\*{0,2}(?:FASE\\s+DE\\s+(?:INICIO|DESARROLLO|CIERRE))(?:[ \\t]*\\([^)]*\\))?\\*{0,2})(?=\\n|$|[ \\t]+[A-ZÁÉÍÓÚ])`, 'gi');
    str = str.replace(phaseHeadingRegex, '\n\n$1\n\n');

    // 3. Dividir en líneas, recortar espacios
    const lines = str.split('\n').map(l => l.trim());

    // 4. Agrupar en párrafos con doble salto (\n\n) para evitar que quede apretado
    const paragraphs = [];
    lines.forEach(line => {
      if (line) {
        paragraphs.push(line);
      }
    });

    return paragraphs.join('\n\n');
  }

  autoResizeTextarea(el) {
    if (!el || !el.style) return;
    el.style.height = 'auto';
    const newHeight = Math.max(150, el.scrollHeight + 4);
    el.style.height = newHeight + 'px';
  }

  autoResizeAllDescriptions() {
    if (!this.container) return;
    const areas = this.container.querySelectorAll('.table-textarea.cls-description');
    areas.forEach(el => this.autoResizeTextarea(el));
  }

  formatSequenceText(rowIndex) {
    const tableBody = document.getElementById('planner-table-body');
    const rows = tableBody ? tableBody.querySelectorAll('tr') : [];
    const rowEl = rows[rowIndex];
    const textarea = rowEl?.querySelector('textarea.cls-description, textarea.col-description');
    if (!textarea) return;

    const currentVal = textarea.value || '';
    if (!currentVal.trim()) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('El campo de secuencia didáctica está vacío', 'info');
      }
      return;
    }

    const formatted = this.formatSequenceSpacing(currentVal);
    textarea.value = formatted;
    this.autoResizeTextarea(textarea);

    this.saveSingleClass(rowIndex);

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`✨ Clase #${rowIndex + 1}: Saltos de línea y párrafos espaciados correctamente`, 'success');
    }
  }

  handlePaste(event) {
    const target = event?.target;
    const clipboardData = event?.clipboardData || (typeof window !== 'undefined' ? window.clipboardData : null);

    if (target && target.tagName === 'TEXTAREA' && clipboardData) {
      const rawText = clipboardData.getData ? clipboardData.getData('text/plain') : '';
      const rawHtml = clipboardData.getData ? clipboardData.getData('text/html') : '';

      // Si es la celda de descripción / secuencia didáctica u observaciones generales, aplicar espaciado inteligente
      if (target.classList?.contains('cls-description') || target.classList?.contains('desc-field') || target.id === 'planner-general-notes') {
        const formatted = this.formatSequenceSpacing(rawText, rawHtml);
        if (formatted) {
          if (event.preventDefault) event.preventDefault();

          if (typeof document !== 'undefined' && document.execCommand && document.execCommand('insertText', false, formatted)) {
            // Inserción nativa con soporte de Ctrl+Z
          } else {
            const start = target.selectionStart ?? 0;
            const end = target.selectionEnd ?? 0;
            const val = target.value || '';
            target.value = val.substring(0, start) + formatted + val.substring(end);
            target.selectionStart = target.selectionEnd = start + formatted.length;
          }

          this.autoResizeTextarea(target);
          this.setUnsavedChanges(true);
          this.updateSaveIndicator('saving');
          this.handleInputChange(true);
          return;
        }
      }
    }

    this.setUnsavedChanges(true);
    this.updateSaveIndicator('saving');
    setTimeout(() => {
      if (target && target.tagName === 'TEXTAREA') {
        this.autoResizeTextarea(target);
      }
      this.handleInputChange(true);
      this.updateSaveIndicator('saved');
    }, 40);
  }

  handleInputChange(immediate = false) {
    this.setUnsavedChanges(true);
    clearTimeout(this.autoSaveTimer);
    this.updateSaveIndicator('saving');
    if (immediate) {
      this.saveCurrentPlan(false);
      this._hasUnsavedChanges = false;
      this.updateSaveIndicator('saved');
      return;
    }
    this.autoSaveTimer = setTimeout(() => {
      this.saveCurrentPlan(false);
      this._hasUnsavedChanges = false;
      this.updateSaveIndicator('saved');
    }, 400);
  }

  saveCurrentPlan(showFeedback = true, targetDate = null) {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    const saveDate = targetDate || this.currentDateStr;
    this.collectDataFromDOM(saveDate);
    if (!this.currentPlan || !saveDate) return false;

    const success = StorageService.savePlan(saveDate, this.currentPlan);
    if (success) {
      this._hasUnsavedChanges = false;
    }
    this.updateSaveIndicator(success ? 'saved' : 'saving');

    if (window.Calendar && typeof window.Calendar.updateDayIndicators === 'function') {
      window.Calendar.updateDayIndicators();
    }
    if (showFeedback) {
      if (success) {
        const hasMirror = Array.isArray(this.currentPlan?.classes) && this.currentPlan.classes.some(cls => 
          typeof StorageService !== 'undefined' && StorageService.getParallelGrade && StorageService.getParallelGrade(cls.subject, cls.grade)
        );
        if (hasMirror) {
          App.showToast('Planeación guardada y sincronizada con grado espejo (4°A / 4°B)', 'success');
        } else {
          App.showToast('Planeación guardada con éxito', 'success');
        }
      } else {
        App.showToast('Error al guardar planeación', 'warning');
      }
    }
    return success;
  }

  onClassNumberChange(idx, val) {
    this.collectDataFromDOM();
    const startNum = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(startNum) && this.currentPlan.classes[idx]) {
      this.currentPlan.classes[idx].dayNumber = String(startNum);
      this.currentPlan.classes[idx].sequenceNumber = startNum;
      const targetSub = String(this.currentPlan.classes[idx].subject || '').toLowerCase().trim();
      const targetGrd = String(this.currentPlan.classes[idx].grade || '').toLowerCase().trim();

      // Si hay clases posteriores de la misma materia y grado en el mismo día, secuenciarlas
      let offset = 1;
      for (let i = idx + 1; i < this.currentPlan.classes.length; i++) {
        const sub = String(this.currentPlan.classes[i].subject || '').toLowerCase().trim();
        const grd = String(this.currentPlan.classes[i].grade || '').toLowerCase().trim();
        if (sub === targetSub && grd === targetGrd) {
          this.currentPlan.classes[i].dayNumber = String(startNum + offset);
          this.currentPlan.classes[i].sequenceNumber = startNum + offset;
          offset++;
        }
      }
      this.render();
      this.saveCurrentPlan(false);
      App.showToast(`Consecutivo de ${this.currentPlan.classes[idx].subject} ${this.currentPlan.classes[idx].grade} fijado en #${startNum}`, 'info');
    }
  }

  autoRenumberSequence() {
    this.collectDataFromDOM();
    this.currentPlan.classes.forEach((cls, i) => {
      const nextNum = StorageService.getNextClassNumber(this.currentDateStr, cls.subject, cls.grade, i, this.currentPlan.classes);
      cls.dayNumber = String(nextNum);
      cls.sequenceNumber = parseInt(nextNum, 10) || (i + 1);
    });
    this.render();
    this.saveCurrentPlan(true);
    App.showToast('¡Consecutivos sincronizados por materia y grado!', 'success');
  }

  addRow() {
    this.collectDataFromDOM();
    const profile = StorageService.getProfile();
    const dayOfWeek = ExportService.getDayOfWeekName(this.currentDateStr);
    const defaultSubject = profile?.subjects?.[0]?.name || (typeof profile?.subjects?.[0] === 'string' ? profile?.subjects?.[0] : 'Matemáticas');
    const defaultGrade = profile?.homeroom || profile?.grades?.[0] || '7°';

    const nextClassNum = StorageService.getNextClassNumber(
      this.currentDateStr,
      defaultSubject,
      defaultGrade,
      this.currentPlan.classes.length,
      this.currentPlan.classes
    );

    const targetPeriod = this.currentPlan.period || profile?.period || '1°';
    const autoCur = typeof CurriculumService !== 'undefined'
      ? CurriculumService.getAutoCurriculumItem(targetPeriod, defaultSubject, defaultGrade, nextClassNum)
      : null;

    const classId = typeof PlanRepository !== 'undefined'
      ? PlanRepository.generateClassId()
      : `cls_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    this.currentPlan.classes.push({
      id: classId,
      classId: classId,
      date: this.currentDateStr,
      dayNumber: `${nextClassNum}`,
      sequenceNumber: parseInt(nextClassNum, 10) || (this.currentPlan.classes.length + 1),
      dayOfWeek: dayOfWeek,
      subject: defaultSubject,
      grade: defaultGrade,
      dba: autoCur?.dba || '',
      achievement: autoCur?.achievement || '',
      topic: autoCur?.topic || '',
      description: '',
      observations: '',
      notebookContent: '',
      attachments: []
    });

    this.render();
    this.saveCurrentPlan(false);
  }

  deleteRow(index) {
    this.collectDataFromDOM();
    if (!this.currentPlan || !Array.isArray(this.currentPlan.classes) || !this.currentPlan.classes[index]) return;

    if (this.currentPlan.classes.length <= 1) {
      if (!confirm('¿Deseas eliminar la única clase registrada para este día?')) return;
    }

    const targetClass = this.currentPlan.classes[index];
    const classId = targetClass.id || targetClass.classId;

    // Guardar snapshot de respaldo antes de eliminar
    if (typeof StorageService !== 'undefined' && StorageService.savePlanSnapshot) {
      StorageService.savePlanSnapshot(this.currentDateStr, this.currentPlan);
    }

    if (classId && typeof PlanRepository !== 'undefined' && PlanRepository.deleteClass) {
      const teacherId = (typeof UserService !== 'undefined' && UserService.getCurrentTeacherId) ? UserService.getCurrentTeacherId() : null;
      PlanRepository.deleteClass(teacherId, this.currentDateStr, classId);
      this.currentPlan.classes.splice(index, 1);
    } else {
      this.currentPlan.classes.splice(index, 1);
      this.saveCurrentPlan(false);
    }

    this.render();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('Clase eliminada. Se creó un respaldo automático.', 'info');
    }
  }

  clearAllRows() {
    if (!confirm('¿Estás seguro de que deseas limpiar todas las clases de este día?')) return;
    this.currentPlan.classes = [];
    this.currentPlan.generalNotes = '';
    this.render();
    this.saveCurrentPlan(true);
  }

  dismissMismatchBanner() {
    if (!this._dismissedDayBanners) this._dismissedDayBanners = {};
    this._dismissedDayBanners[this.currentDateStr] = true;
    this.render();
  }

  fixDayLabelOnly() {
    this.collectDataFromDOM();
    const expectedDay = ExportService.getDayOfWeekName(this.currentDateStr);
    
    // Guardar snapshot de respaldo antes de ajustar
    if (typeof StorageService !== 'undefined' && StorageService.savePlanSnapshot) {
      StorageService.savePlanSnapshot(this.currentDateStr, this.currentPlan);
    }

    if (Array.isArray(this.currentPlan.classes)) {
      this.currentPlan.classes.forEach(c => {
        c.dayOfWeek = expectedDay;
      });
    }

    if (!this._dismissedDayBanners) this._dismissedDayBanners = {};
    this._dismissedDayBanners[this.currentDateStr] = true;

    this.render();
    this.saveCurrentPlan(false);
    App.showToast(`✓ Día actualizado a ${expectedDay}. Todas tus planeaciones y materias se conservaron intactas.`, 'success');
  }

  undoLastScheduleAction() {
    if (typeof StorageService === 'undefined' || !StorageService.restorePlanSnapshot) return;
    const restored = StorageService.restorePlanSnapshot(this.currentDateStr);
    if (restored) {
      if (this._dismissedDayBanners) delete this._dismissedDayBanners[this.currentDateStr];
      this.currentPlan = JSON.parse(JSON.stringify(restored));
      this.render();
      this.saveCurrentPlan(false);
      App.showToast('↩ Planeación y textos anteriores restaurados con éxito.', 'success');
    } else {
      App.showToast('No hay una versión previa disponible para deshacer.', 'info');
    }
  }

  swapWithDate(targetDate) {
    if (!targetDate) return;
    const targetFormatted = this.formatFullDate(targetDate);
    const currentFormatted = this.formatFullDate(this.currentDateStr);

    if (typeof StorageService === 'undefined' || !StorageService.swapDayPlans) return;
    const success = StorageService.swapDayPlans(this.currentDateStr, targetDate);
    if (success) {
      this.loadDate(this.currentDateStr);
      App.showToast(`🔄 ¡Planeaciones intercambiadas entre ${currentFormatted} y ${targetFormatted}! Todo tu trabajo se conservó intacto.`, 'success', 7000);
      if (window.Calendar && window.Calendar.render) {
        window.Calendar.render();
      }
    } else {
      App.showToast('No se pudo intercambiar la planeación.', 'error');
    }
  }

  promptSwapPlan() {
    const allPlans = StorageService.getAllPlans();
    const datesWithPlans = Object.keys(allPlans).filter(d => d !== this.currentDateStr && allPlans[d]?.classes?.length > 0);

    if (datesWithPlans.length === 0) {
      alert('Aún no tienes planeaciones en otras fechas para intercambiar.');
      return;
    }

    const modalBackdrop = document.getElementById('swap-modal-backdrop');
    const select = document.getElementById('swap-target-date');
    if (modalBackdrop && select) {
      select.innerHTML = datesWithPlans.sort().reverse().map(d => `
        <option value="${d}">${this.formatFullDate(d)} (${allPlans[d].classes.length} clases)</option>
      `).join('');
      modalBackdrop.classList.add('active');
    }
  }

  applyOfficialSchedule() {
    this.collectDataFromDOM();
    const profile = StorageService.getProfile();
    const dayOfWeek = ExportService.getDayOfWeekName(this.currentDateStr);
    
    const dateParts = this.currentDateStr.split('-');
    const dateObj = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
    const dayIndex = dateObj.getDay();
    
    const weeklySchedule = profile?.weeklySchedule || window.DEFAULT_WEEKLY_SCHEDULE || {};
    const rawSchedule = weeklySchedule[String(dayIndex)] || [];
    const daySchedule = typeof StorageService !== 'undefined' && StorageService.consolidateSchedule
      ? StorageService.consolidateSchedule(rawSchedule)
      : rawSchedule;

    if (daySchedule.length === 0) {
      App.showToast('No hay horario configurado para este día', 'info');
      return;
    }

    const targetPeriod = this.currentPlan.period || profile?.period || '1°';
    const existingClasses = JSON.parse(JSON.stringify(this.currentPlan.classes || []));

    // Determinar si hay trabajo redactado por el docente
    const hasCustomContent = (c) => Boolean(
      (c.topic && c.topic.trim().length > 0) ||
      (c.description && c.description.trim().length > 0) ||
      (c.notebookContent && c.notebookContent.trim().length > 0) ||
      (c.observations && c.observations.trim().length > 0) ||
      (Array.isArray(c.attachments) && c.attachments.length > 0)
    );
    const writtenClassesCount = existingClasses.filter(hasCustomContent).length;

    if (writtenClassesCount > 0) {
      const confirmProceed = confirm(
        `Tienes ${writtenClassesCount} clase(s) con contenidos redactados.\n\n` +
        `¿Deseas sincronizar con el horario oficial conservando todo lo que ya escribiste?\n\n` +
        `✓ Tus temas, secuencias didácticas, observaciones y cuadernos se conservarán y fusionarán intactos.\n` +
        `✓ Podrás usar el botón "Deshacer" si deseas volver al estado anterior en cualquier momento.\n\n` +
        `Presiona [Aceptar] para continuar conservando tus textos, o [Cancelar] para no modificar nada.`
      );
      if (!confirmProceed) return;
    }

    // Respaldar antes de cualquier modificación
    if (typeof StorageService !== 'undefined' && StorageService.savePlanSnapshot) {
      StorageService.savePlanSnapshot(this.currentDateStr, this.currentPlan);
    }

    const newClasses = [];
    const remainingExisting = [...existingClasses];

    daySchedule.forEach((schedItem, i) => {
      const classNum = StorageService.getNextClassNumber(this.currentDateStr, schedItem.subject, schedItem.grade, i, newClasses);
      const isDirGroup = this.isDirectionOfGroup(schedItem.subject);

      // 1. Buscar clase existente coincidente por Asignatura y Grado para PRESERVAR sus textos
      let matchIdx = remainingExisting.findIndex(c =>
        String(c.subject || '').toLowerCase().trim() === String(schedItem.subject || '').toLowerCase().trim() &&
        String(c.grade || '').toLowerCase().trim() === String(schedItem.grade || '').toLowerCase().trim()
      );
      let existingMatch = null;
      if (matchIdx !== -1) {
        existingMatch = remainingExisting.splice(matchIdx, 1)[0];
      } else if (remainingExisting.length > 0) {
        // 2. Si no hay coincidencia exacta de materia/grado, tomar la clase existente en orden/posición para que su contenido redactado NO se pierda
        existingMatch = remainingExisting.shift();
      }

      const mirrorContent = (!isDirGroup && typeof StorageService !== 'undefined' && StorageService.getParallelClassContent)
        ? StorageService.getParallelClassContent(schedItem.subject, schedItem.grade, classNum)
        : null;
      const autoCur = (!isDirGroup && typeof CurriculumService !== 'undefined')
        ? CurriculumService.getAutoCurriculumItem(targetPeriod, schedItem.subject, schedItem.grade, classNum)
        : null;

      // Fusión inteligente: si el profesor ya redactó, se respeta el 100% de su texto
      const dba = (existingMatch && existingMatch.dba && existingMatch.dba.trim())
        ? existingMatch.dba
        : (isDirGroup ? '' : (mirrorContent?.dba || autoCur?.dba || ''));

      const achievement = (existingMatch && existingMatch.achievement && existingMatch.achievement.trim())
        ? existingMatch.achievement
        : (isDirGroup ? '' : (mirrorContent?.achievement || autoCur?.achievement || ''));

      const topic = (existingMatch && existingMatch.topic && existingMatch.topic.trim())
        ? existingMatch.topic
        : (isDirGroup ? '' : (mirrorContent?.topic || autoCur?.topic || ''));

      const description = (existingMatch && existingMatch.description && existingMatch.description.trim())
        ? existingMatch.description
        : (mirrorContent?.description || autoCur?.suggestedSequence || '');

      const observations = (existingMatch && existingMatch.observations)
        ? existingMatch.observations
        : '';

      const notebookContent = (existingMatch && existingMatch.notebookContent && existingMatch.notebookContent.trim())
        ? existingMatch.notebookContent
        : (mirrorContent?.notebookContent || '');

      const attachments = (existingMatch && Array.isArray(existingMatch.attachments) && existingMatch.attachments.length > 0)
        ? existingMatch.attachments
        : [];

      newClasses.push({
        date: this.currentDateStr,
        time: schedItem.time || existingMatch?.time || '',
        dayNumber: `${classNum}`,
        dayOfWeek: dayOfWeek,
        subject: schedItem.subject,
        grade: schedItem.grade,
        dba,
        achievement,
        topic,
        description,
        observations,
        notebookContent,
        attachments
      });
    });

    // Si habían clases existentes adicionales con contenido redactado que no estaban en el horario oficial, CONSERVARLAS al final
    remainingExisting.forEach(remClass => {
      if (hasCustomContent(remClass)) {
        remClass.date = this.currentDateStr;
        remClass.dayOfWeek = dayOfWeek;
        newClasses.push(remClass);
      }
    });

    this.currentPlan.classes = newClasses;

    if (!this._dismissedDayBanners) this._dismissedDayBanners = {};
    this._dismissedDayBanners[this.currentDateStr] = true;

    this.render();
    this.saveCurrentPlan(true);
    App.showToast(`¡Horario oficial de ${dayOfWeek} aplicado protegiendo todas tus planeaciones!`, 'success');
  }

  promptDuplicatePlan() {
    const allPlans = StorageService.getAllPlans();
    const datesWithPlans = Object.keys(allPlans).filter(d => d !== this.currentDateStr && allPlans[d].classes?.length > 0);

    if (datesWithPlans.length === 0) {
      alert('Aún no tienes planeaciones en otras fechas para duplicar.');
      return;
    }

    const modalBackdrop = document.getElementById('duplicate-modal-backdrop');
    const select = document.getElementById('duplicate-source-date');
    if (modalBackdrop && select) {
      select.innerHTML = datesWithPlans.sort().reverse().map(d => `
        <option value="${d}">${this.formatFullDate(d)} (${allPlans[d].classes.length} clases)</option>
      `).join('');
      modalBackdrop.classList.add('active');
    }
  }

  applyDuplicate(sourceDate) {
    const sourcePlan = StorageService.getPlanByDate(sourceDate);
    if (!sourcePlan) return;

    this.collectDataFromDOM();
    const currentDayOfWeek = ExportService.getDayOfWeekName(this.currentDateStr);

    this.currentPlan.classes = sourcePlan.classes.map(c => ({
      ...c,
      date: this.currentDateStr,
      dayOfWeek: currentDayOfWeek
    }));
    this.currentPlan.generalNotes = sourcePlan.generalNotes || '';
    if (sourcePlan.period) this.currentPlan.period = sourcePlan.period;

    this.render();
    this.saveCurrentPlan(true);
    App.showToast(`Planeación copiada desde ${sourceDate}`, 'info');
  }

  exportWord() {
    this.saveCurrentPlan(false);
    const profile = StorageService.getProfile();
    const menu = document.getElementById('export-dropdown-menu');
    if (menu) menu.classList.remove('show');
    ExportService.exportToWord(this.currentPlan, profile);
  }

  exportPdf() {
    this.saveCurrentPlan(false);
    const profile = StorageService.getProfile();
    const menu = document.getElementById('export-dropdown-menu');
    if (menu) menu.classList.remove('show');
    ExportService.exportToPdf(this.currentPlan, profile);
  }

  exportSingleClass(classIdx, format = 'docx') {
    this.saveCurrentPlan(false);
    const profile = StorageService.getProfile();
    const menu = document.getElementById(`row-export-menu-${classIdx}`);
    if (menu) menu.classList.remove('show');
    ExportService.exportSingleClass(this.currentPlan, profile, classIdx, format);
  }

  toggleRowExportDropdown(classIdx, event) {
    if (event) event.stopPropagation();
    document.querySelectorAll('.dropdown-menu.show').forEach(el => {
      if (el.id !== `row-export-menu-${classIdx}`) el.classList.remove('show');
    });
    const menu = document.getElementById(`row-export-menu-${classIdx}`);
    if (menu) {
      menu.classList.toggle('show');
    }
  }

  formatFullDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.PlannerComponent = PlannerComponent;

// Auto-guardado de seguridad inmediato antes de cerrar la ventana o cambiar de pestaña
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('beforeunload', () => {
    if (window.Planner && typeof window.Planner.saveCurrentPlan === 'function') {
      window.Planner.saveCurrentPlan(false);
    }
  });

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && window.Planner && typeof window.Planner.saveCurrentPlan === 'function') {
        window.Planner.saveCurrentPlan(false);
      }
    });
  }
}
