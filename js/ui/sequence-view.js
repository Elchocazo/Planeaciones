/**
 * PANEL DE MATERIAS Y CLASES (SequenceView / Curricular Sequence Explorer)
 * 
 * Permite explorar y navegar de forma clara e intuitiva entre todas las materias
 * y grados que imparte el docente, mostrando para cada uno la secuencia cronológica
 * y ordenada de sus clases (Clase #1, Clase #2, Clase #3, ...):
 * - Selector de Período Escolar (1°, 2°, 3°, 4° Período).
 * - Buscador en vivo por Asignatura, Grado o Tema.
 * - Filtros rápidos: [Todas las Clases] | [○ Solo Pendientes] | [✓ Solo Planeadas].
 * - Resumen global con KPIs de cobertura pedagógica (% planeado global).
 * - Tarjetas por Asignatura y Grado con barra de progreso visual.
 * - Cuadrícula de clases consecutivas con badge, fecha, tema y accesos rápidos (Editar, Cuaderno, PDF).
 * - Creación instantánea de la siguiente clase (# max + 1) e importación contextual.
 */

class SequenceViewClass {
  constructor() {
    this.container = null;
    this.activeFilter = 'all'; // 'all' | 'pending' | 'planned'
    this.selectedPeriod = '1°';
    this.searchTerm = '';
    this.focusedSubject = null;
    this.expandedGrades = new Set();
    this.expandedSubjects = new Set();
  }

  init() {
    this.container = document.getElementById('sequences-view');
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('class_session_deleted', () => {
        if (this.container && this.container.offsetParent !== null) {
          this.render();
        }
      });
      window.addEventListener('class_session_remote_delete', () => {
        if (this.container && this.container.offsetParent !== null) {
          this.render();
        }
      });
    }
  }

  setFilter(filterName) {
    this.activeFilter = filterName;
    this.render();
  }

  setPeriod(period) {
    this.selectedPeriod = period;
    if (typeof AppState !== 'undefined' && AppState.set) {
      AppState.set('currentPeriod', period);
    }
    this.render();
  }

  onSearch(query) {
    this.searchTerm = String(query || '').trim().toLowerCase();
    this.render();
  }

  clearSearch() {
    this.searchTerm = '';
    const input = document.getElementById('seq-search-input');
    if (input) input.value = '';
    this.render();
  }

  clearFilters() {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.focusedSubject = null;
    this.render();
  }

  toggleGrade(gradeKey) {
    if (this.expandedGrades.has(gradeKey)) {
      this.expandedGrades.delete(gradeKey);
    } else {
      this.expandedGrades.add(gradeKey);
    }
    const card = document.getElementById(`seq-grade-card-${gradeKey}`);
    const body = document.getElementById(`seq-grade-body-${gradeKey}`);
    if (card && body) {
      const isOpen = this.expandedGrades.has(gradeKey);
      if (isOpen) {
        card.classList.add('is-open');
        body.style.display = 'flex';
      } else {
        card.classList.remove('is-open');
        body.style.display = 'none';
      }
    } else {
      this.render();
    }
  }

  toggleSubject(subjKey) {
    if (this.expandedSubjects.has(subjKey)) {
      this.expandedSubjects.delete(subjKey);
    } else {
      this.expandedSubjects.add(subjKey);
    }
    const item = document.getElementById(`seq-subj-item-${subjKey}`);
    const body = document.getElementById(`seq-subj-body-${subjKey}`);
    if (item && body) {
      const isOpen = this.expandedSubjects.has(subjKey);
      if (isOpen) {
        item.classList.add('is-open');
        body.style.display = 'block';
      } else {
        item.classList.remove('is-open');
        body.style.display = 'none';
      }
    } else {
      this.render();
    }
  }

  createNewClassInGroup(subjectName, gradeName, groupName) {
    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId
      ? ClassRepository._getCurrentTeacherId()
      : 'usr_manuel';

    const repo = ClassRepository;

    // 1. Obtener clases existentes para este grupo para garantizar consecutividad inmutable
    const existingClasses = repo.getClasses({
      teacherId: tid,
      period: this.selectedPeriod,
      subject: subjectName,
      grade: gradeName
    }, tid);

    const maxExisting = existingClasses.length > 0
      ? Math.max(...existingClasses.map(c => parseInt(c.sequenceNumber, 10) || 0))
      : 0;

    // 2. Resolver horario oficial desde ScheduleRepository para asignar día, hora y slotId
    let slot = null;
    if (typeof ScheduleRepository !== 'undefined' && ScheduleRepository.getAllSlots) {
      const allSlots = ScheduleRepository.getAllSlots(tid) || [];
      const sNorm = repo._norm(subjectName);
      const gNorm = repo._normGrade ? repo._normGrade(gradeName) : repo._norm(gradeName);
      slot = allSlots.find(s => {
        const subMatch = repo._norm(s.subjectName || s.subject) === sNorm;
        const grdMatch = (repo._normGrade ? repo._normGrade(s.gradeName || s.grade) : repo._norm(s.gradeName || s.grade)) === gNorm;
        return subMatch && grdMatch && s.active !== false;
      });
    }

    // 3. Determinar fecha del calendario acorde al horario de la materia
    let targetDate = new Date().toISOString().slice(0, 10);
    const activeDate = (typeof AppState !== 'undefined' ? AppState.get('currentDate') : null) || 
                       (typeof DashboardView !== 'undefined' ? DashboardView.selectedDate : null);

    let assignedFromActive = false;
    if (activeDate && slot && slot.weekday) {
      const parts = activeDate.split('-').map(Number);
      const testD = new Date(parts[0], parts[1] - 1, parts[2]);
      if (testD.getDay() === slot.weekday) {
        const isRecess = (typeof HolidayService !== 'undefined') ? HolidayService.isRecessOrNonSchoolDay(activeDate)?.isRecess : false;
        const alreadyHasClass = existingClasses.some(c => c.date === activeDate);
        if (!isRecess && !alreadyHasClass) {
          targetDate = activeDate;
          assignedFromActive = true;
        }
      }
    }

    if (!assignedFromActive && slot && slot.weekday) {
      const validDates = existingClasses
        .map(c => c.date)
        .filter(d => d && /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort();
      const lastDateStr = validDates.length > 0 ? validDates[validDates.length - 1] : null;

      let cursor;
      if (lastDateStr) {
        const parts = lastDateStr.split('-').map(Number);
        cursor = new Date(parts[0], parts[1] - 1, parts[2]);
        cursor.setDate(cursor.getDate() + 1);
      } else {
        const subNorm = repo._normSubjectForSchedule ? repo._normSubjectForSchedule(subjectName) : repo._norm(subjectName);
        const startStr = (subNorm === 'matematicas' && gNorm === '7') ? '2026-09-01' : '2026-09-07';
        const parts = startStr.split('-').map(Number);
        cursor = new Date(parts[0], parts[1] - 1, parts[2]);
      }

      let attempts = 0;
      while (attempts < 60) {
        attempts++;
        const jsDay = cursor.getDay();
        if (jsDay === slot.weekday) {
          const y = cursor.getFullYear();
          const m = String(cursor.getMonth() + 1).padStart(2, '0');
          const d = String(cursor.getDate()).padStart(2, '0');
          const checkDate = `${y}-${m}-${d}`;

          const isRecess = repo._isRecessOrNonSchoolDay ? repo._isRecessOrNonSchoolDay(checkDate) : ((typeof HolidayService !== 'undefined') ? HolidayService.isRecessOrNonSchoolDay(checkDate)?.isRecess : false);
          if (!isRecess || attempts > 28) {
            targetDate = checkDate;
            break;
          }
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    const schedSeq = repo.getScheduleSequenceNumber
      ? repo.getScheduleSequenceNumber(targetDate, subjectName, gradeName, tid)
      : null;

    const repoNext = repo.getNextSequenceNumber({
      teacherId: tid,
      period: this.selectedPeriod,
      subject: subjectName,
      grade: gradeName,
      group: groupName || gradeName
    });

    const nextSeq = (schedSeq !== null && schedSeq > 0)
      ? Math.max(schedSeq, maxExisting + 1)
      : Math.max(repoNext, maxExisting + 1);

    // Auto-heredar contenido si la clase espejo ya fue planeada (ej: crear en 4°B cuando 4°A ya está planeada)
    let initialCurriculum = null;
    let initialPedagogy = null;
    let initialNotebook = null;
    let initialStatus = 'pending';

    const mirrorInfo = (repo.getMirrorGradeInfo) ? repo.getMirrorGradeInfo(gradeName, groupName, subjectName) : null;
    if (mirrorInfo) {
      const mirrorTarget = mirrorInfo.targetClean || `${mirrorInfo.gradeNum}${mirrorInfo.targetSection}`.toLowerCase();
      const existingMirror = existingClasses.find(c => {
        const cGrd = String(c.gradeName || c.grade || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
        const cGrp = String(c.group || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
        return (cGrd === mirrorTarget || cGrp === mirrorTarget) && parseInt(c.sequenceNumber, 10) === nextSeq;
      });

      if (existingMirror && (existingMirror.status === 'planned' || existingMirror.status === 'completed')) {
        initialCurriculum = JSON.parse(JSON.stringify(existingMirror.curriculum || {}));
        initialPedagogy = JSON.parse(JSON.stringify(existingMirror.didacticSequence || existingMirror.pedagogy || {}));
        initialNotebook = JSON.parse(JSON.stringify(existingMirror.teacherNotebook || {}));
        initialStatus = 'planned';
      }
    }

    const newClass = repo.createClass({
      teacherId: tid,
      period: this.selectedPeriod,
      subjectName: subjectName,
      gradeName: gradeName,
      group: groupName || gradeName,
      sequenceNumber: nextSeq,
      date: targetDate,
      time: slot ? slot.time : '',
      startTime: slot ? slot.startTime : '',
      endTime: slot ? slot.endTime : '',
      scheduleSlotId: slot ? slot.id : null,
      dayOfWeek: slot ? (typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(targetDate) : '') : '',
      status: initialStatus,
      curriculum: initialCurriculum || undefined,
      didacticSequence: initialPedagogy || undefined,
      teacherNotebook: initialNotebook || undefined
    }, tid);

    if (newClass) {
      const extraMsg = initialStatus === 'planned' ? ' (contenido vinculado desde clase espejo)' : '';
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`✓ Creada nueva Clase #${newClass.sequenceNumber} de ${subjectName} (${gradeName})${extraMsg}`, 'success');
      }
      AppRouter.navigateTo('editor', { classId: newClass.id });
    }
  }

  openImportForGroup(subjectName, gradeName, groupName) {
    if (typeof ImportModal !== 'undefined' && ImportModal.open) {
      const tid = ClassRepository._getCurrentTeacherId();
      const existing = ClassRepository.getClasses({
        teacherId: tid,
        period: this.selectedPeriod,
        subject: subjectName,
        grade: gradeName
      }, tid);
      const targetClass = existing.length > 0 ? existing[existing.length - 1] : null;

      ImportModal.open(targetClass, () => {
        this.render();
      });
    }
  }

  render(options = {}) {
    if (!this.container) {
      this.container = document.getElementById('sequences-view');
    }
    if (!this.container) return;

    // Sincronizar período activo si se proporciona en options o AppState
    if (options.period) {
      this.selectedPeriod = options.period;
    } else if (typeof AppState !== 'undefined' && AppState.get) {
      this.selectedPeriod = AppState.get('currentPeriod') || this.selectedPeriod || '1°';
    }

    if (options.subject) {
      this.searchTerm = String(options.subject).toLowerCase();
    }

    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId
      ? ClassRepository._getCurrentTeacherId()
      : 'usr_manuel';

    const sequences = SequenceService.getAllActiveSequences(this.selectedPeriod, tid);

    // Métricas globales
    let totalSubjects = sequences.length;
    let totalClasses = 0;
    let totalPlanned = 0;
    let totalPending = 0;

    sequences.forEach(g => {
      totalClasses += g.total;
      totalPlanned += g.planned;
      totalPending += g.pending;
    });

    const overallPercentage = totalClasses > 0 ? Math.round((totalPlanned / totalClasses) * 100) : 0;

    // Filtrar por término de búsqueda si existe
    let displayedSequences = sequences;
    if (this.searchTerm) {
      displayedSequences = sequences.filter(g => {
        const subMatch = g.subjectName.toLowerCase().includes(this.searchTerm);
        const grdMatch = g.gradeName.toLowerCase().includes(this.searchTerm);
        const topicMatch = g.classes.some(c => (c.curriculum?.topic || '').toLowerCase().includes(this.searchTerm));
        return subMatch || grdMatch || topicMatch;
      });
    }

    const isCoord = this._isCoordinator();

    this.container.innerHTML = `
      <div class="sequences-page-layout">
        <!-- Tarjeta Principal de Encabezado y Navegación Curricular -->
        <div class="sequences-header-card">
          <div class="seq-header-top-row">
            <div class="header-title-group" style="display:flex; align-items:center; gap:14px;">
              <span class="seq-header-icon" style="font-size:1.8rem; width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:#eff6ff; border:1px solid #bfdbfe;">📚</span>
              <div>
                <h2 style="margin:0; font-size:1.4rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:8px;">
                  Panel de Materias y Clases
                </h2>
                <p class="header-sub" style="margin:4px 0 0; font-size:0.86rem; color:#64748b;">
                  Explora las secuencias curriculares organizadas por <strong>Grado</strong> y <strong>Materia</strong> para el ciclo lectivo
                </p>
              </div>
            </div>

            <!-- Selector de Período Académico -->
            <div class="seq-period-selector-box" style="display:flex; align-items:center; gap:10px; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 14px; border-radius:12px;">
              <span class="seq-period-label" style="font-size:0.75rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.04em;">Período:</span>
              <div class="seq-period-pills" style="display:flex; gap:4px; background:#e2e8f0; padding:3px; border-radius:8px;">
                ${['1°', '2°', '3°', '4°'].map(p => `
                  <button type="button" 
                    class="seq-period-pill ${this.selectedPeriod === p ? 'active' : ''}" 
                    onclick="SequenceView.setPeriod('${p}')"
                    title="Ver planeaciones del ${p} Período"
                    style="border:none; padding:4px 12px; border-radius:6px; font-weight:700; font-size:0.85rem; cursor:pointer;">
                    ${p}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Resumen Global de KPIs -->
          <div class="seq-kpi-summary-bar">
            <div class="seq-kpi-item">
              <div class="kpi-icon">📚</div>
              <div class="kpi-data">
                <div class="kpi-value">${totalSubjects}</div>
                <div class="kpi-label">Asignaturas</div>
              </div>
            </div>
            <div class="seq-kpi-item">
              <div class="kpi-icon">🎯</div>
              <div class="kpi-data">
                <div class="kpi-value">${totalClasses}</div>
                <div class="kpi-label">Clases Totales</div>
              </div>
            </div>
            <div class="seq-kpi-item">
              <div class="kpi-icon">✅</div>
              <div class="kpi-data">
                <div class="kpi-value text-emerald-600">${totalPlanned}</div>
                <div class="kpi-label">Planeadas</div>
              </div>
            </div>
            <div class="seq-kpi-item">
              <div class="kpi-icon">⏳</div>
              <div class="kpi-data">
                <div class="kpi-value ${totalPending > 0 ? 'text-amber-600' : 'text-slate-500'}">${totalPending}</div>
                <div class="kpi-label">Pendientes</div>
              </div>
            </div>
            <div class="seq-kpi-progress-col">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; font-weight:700; margin-bottom:6px; color:#334155;">
                <span>Progreso General (${this.selectedPeriod} Período)</span>
                <span style="color:#2563eb; font-weight:800; font-size:0.9rem;">${overallPercentage}%</span>
              </div>
              <div class="seq-progress-track">
                <div class="seq-progress-fill" style="width: ${overallPercentage}%;"></div>
              </div>
            </div>
          </div>

          <!-- Barra de Controles: Búsqueda y Filtros de Estado -->
          <div class="seq-controls-bar">
            <div class="seq-search-box">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" 
                id="seq-search-input" 
                class="seq-search-input" 
                placeholder="Buscar por asignatura, grado o tema de clase..." 
                value="${this._escapeHtml(this.searchTerm)}" 
                oninput="SequenceView.onSearch(this.value)" />
              ${this.searchTerm ? `
                <button type="button" class="seq-search-clear" onclick="SequenceView.clearSearch()" title="Borrar búsqueda">&times;</button>
              ` : ''}
            </div>

            <div class="seq-filter-pills">
              <button type="button" 
                class="seq-filter-pill ${this.activeFilter === 'all' ? 'active' : ''}" 
                onclick="SequenceView.setFilter('all')">
                Todas las Clases (${totalClasses})
              </button>
              <button type="button" 
                class="seq-filter-pill ${this.activeFilter === 'pending' ? 'active' : ''}" 
                onclick="SequenceView.setFilter('pending')">
                ○ Solo Pendientes (${totalPending})
              </button>
              <button type="button" 
                class="seq-filter-pill ${this.activeFilter === 'planned' ? 'active' : ''}" 
                onclick="SequenceView.setFilter('planned')">
                ✓ Solo Planeadas (${totalPlanned})
              </button>
            </div>

            <div style="margin-left:auto; display:flex; gap:8px;">
              ${isCoord ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="AppRouter.navigateTo('calendar')" title="Ir al Calendario de Supervisión" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; padding:7px 16px; border-radius:10px; background:#eff6ff; color:#1d4ed8; border:1.5px solid #bfdbfe; box-shadow:0 1px 3px rgba(0,0,0,0.05); cursor:pointer;">
                  <span>📅</span> Ir al Calendario
                </button>
              ` : `
                <button type="button" class="btn btn-secondary btn-sm" onclick="AppRouter.navigateTo('dashboard')" title="Regresar al Inicio" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; padding:7px 16px; border-radius:10px; background:#ffffff; color:#334155; border:1.5px solid #cbd5e1; box-shadow:0 1px 3px rgba(0,0,0,0.05); cursor:pointer;">
                  <span>←</span> Volver al Inicio
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- Lista de Grupos de Materias y Grados -->
        <div class="sequences-list-container">
          ${this._renderSequenceGroups(displayedSequences)}
        </div>
      </div>
    `;
  }

  _renderSequenceGroups(sequences) {
    const isCoord = this._isCoordinator();
    if (!sequences || sequences.length === 0) {
      return `
        <div class="empty-state-card" style="padding:2.5rem; text-align:center; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; margin-top:1rem;">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">🔍</div>
          <h3 style="margin:0 0 0.5rem; color:#334155;">No se encontraron materias o clases</h3>
          <p style="color:#64748b; font-size:0.9rem; margin-bottom:1.25rem;">
            ${this.searchTerm 
              ? `No hay coincidencias para "<strong>${this._escapeHtml(this.searchTerm)}</strong>" en el ${this.selectedPeriod} Período.` 
              : `No hay clases registradas aún para el ${this.selectedPeriod} Período académico.`}
          </p>
          <div style="display:flex; justify-content:center; gap:10px;">
            ${this.searchTerm ? `
              <button type="button" class="btn btn-secondary" onclick="SequenceView.clearSearch()">
                Limpiar búsqueda
              </button>
            ` : ''}
            <button type="button" class="btn btn-primary" onclick="AppRouter.navigateTo('${isCoord ? 'calendar' : 'dashboard'}')">
              ${isCoord ? '📅 Ir al Calendario' : '← Volver al Inicio'}
            </button>
          </div>
        </div>
      `;
    }

    // 1. Agrupar las secuencias por Grado escolar
    const gradeGroupsMap = {};
    sequences.forEach(seq => {
      const gName = String(seq.gradeName || 'General').trim();
      const gKey = gName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (!gradeGroupsMap[gKey]) {
        gradeGroupsMap[gKey] = {
          gradeKey: gKey,
          gradeName: gName,
          subjects: [],
          totalClasses: 0,
          totalPlanned: 0,
          totalPending: 0
        };
      }
      gradeGroupsMap[gKey].subjects.push(seq);
      gradeGroupsMap[gKey].totalClasses += seq.total;
      gradeGroupsMap[gKey].totalPlanned += seq.planned;
      gradeGroupsMap[gKey].totalPending += seq.pending;
    });

    const gradeGroups = Object.values(gradeGroupsMap).sort((a, b) => {
      // Orden natural por grado escolar (ej: 2°, 3°, 4°, etc.)
      const numA = parseInt(a.gradeName.replace(/[^0-9]/g, ''), 10) || 999;
      const numB = parseInt(b.gradeName.replace(/[^0-9]/g, ''), 10) || 999;
      if (numA !== numB) return numA - numB;
      return a.gradeName.localeCompare(b.gradeName);
    });

    // Si hay un término de búsqueda activo, expandir automáticamente todos los grados y materias que coincidan
    const isSearching = Boolean(this.searchTerm);

    return gradeGroups.map(gradeGroup => {
      const gKey = gradeGroup.gradeKey;
      const isGradeOpen = isSearching || this.expandedGrades.has(gKey);
      const gradePct = gradeGroup.totalClasses > 0 ? Math.round((gradeGroup.totalPlanned / gradeGroup.totalClasses) * 100) : 0;

      return `
        <div class="seq-grade-accordion-card ${isGradeOpen ? 'is-open' : ''}" id="seq-grade-card-${gKey}">
          <!-- Cabecera Nivel 1: GRADO -->
          <div class="seq-grade-header" onclick="SequenceView.toggleGrade('${gKey}')">
            <div class="seq-grade-header-left">
              <span class="seq-grade-badge-lg">
                🎓 Grado ${this._escapeHtml(gradeGroup.gradeName)}
              </span>
              <div>
                <h3 class="seq-grade-title">Grado ${this._escapeHtml(gradeGroup.gradeName)}</h3>
                <div class="seq-grade-meta">
                  ${gradeGroup.subjects.length} asignatura(s) • ${gradeGroup.totalPlanned} de ${gradeGroup.totalClasses} clases planeadas (${gradeGroup.totalPending} pendientes)
                </div>
              </div>
            </div>

            <div class="seq-grade-header-right">
              <div class="seq-group-progress-wrap" style="display:flex; align-items:center; gap:8px;">
                <span class="seq-group-pct-text">${gradePct}%</span>
                <div class="seq-group-progress-bar" style="width: 80px;">
                  <div class="seq-group-progress-fill" style="width: ${gradePct}%;"></div>
                </div>
              </div>
              <span class="seq-chevron-icon">▼</span>
            </div>
          </div>

          <!-- Contenido Nivel 1: Lista de Materias dentro de este Grado -->
          <div class="seq-grade-body" id="seq-grade-body-${gKey}" style="display: ${isGradeOpen ? 'flex' : 'none'};">
            ${gradeGroup.subjects.map(group => {
              const sKey = `${gKey}__${group.subjectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
              const isSubjOpen = isSearching || this.expandedSubjects.has(sKey);

              let filteredClasses = group.classes;
              if (this.activeFilter === 'pending') {
                filteredClasses = filteredClasses.filter(c => c.status === 'pending' || c.status === 'draft');
              } else if (this.activeFilter === 'planned') {
                filteredClasses = filteredClasses.filter(c => c.status === 'planned' || c.status === 'completed');
              }

              const icon = this._getSubjectIcon(group.subjectName);
              const nextSequenceNum = (group.classes.length > 0) 
                ? Math.max(...group.classes.map(c => parseInt(c.sequenceNumber, 10) || 0)) + 1 
                : 1;

              return `
                <div class="seq-subj-accordion-item ${isSubjOpen ? 'is-open' : ''}" id="seq-subj-item-${sKey}">
                  <!-- Cabecera Nivel 2: MATERIA -->
                  <div class="seq-subj-header" onclick="SequenceView.toggleSubject('${sKey}')">
                    <div class="seq-subj-header-left">
                      <div class="seq-subj-icon-box" style="width: 36px; height: 36px; font-size: 1.25rem;">${icon}</div>
                      <div>
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                          <h4 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;">${this._escapeHtml(group.subjectName)}</h4>
                          <span class="seq-period-mini-tag">${group.period} Período</span>
                          ${group.mirrorInfo ? `
                            <span class="seq-mirror-badge" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; padding:1px 6px; border-radius:10px; font-size:0.72rem; font-weight:700;" title="Clases ligadas con ${group.mirrorInfo.targetGradeName}">
                              🔗 Ligada con ${group.mirrorInfo.targetGradeName}
                            </span>
                          ` : ''}
                        </div>
                        <div class="seq-group-meta" style="margin-top:2px; font-size:0.78rem;">
                          ${group.planned} de ${group.total} clases planeadas • ${group.percentage}% de cobertura
                        </div>
                      </div>
                    </div>

                    <div class="seq-group-actions-col" style="gap:10px;">
                      <div class="seq-group-progress-wrap">
                        <span class="seq-group-pct-text">${group.percentage}%</span>
                        <div class="seq-group-progress-bar" style="width: 70px;">
                          <div class="seq-group-progress-fill" style="width: ${group.percentage}%;"></div>
                        </div>
                      </div>

                      <div class="seq-group-btns" onclick="event.stopPropagation();">
                        ${!isCoord && group.hasDuplicateNumbers ? `
                          <button type="button" 
                            class="btn btn-warning btn-sm btn-fix-seq" 
                            onclick="SequenceView.autoFixGroupSequence('${this._escapeJs(group.subjectName)}', '${this._escapeJs(group.gradeName)}', '${group.period}', '${this._escapeJs(group.group)}')" 
                            title="Detectamos clases con números duplicados. Haga clic para renumerar consecutivamente por fecha (1, 2, 3...)"
                            style="background:#fef3c7; color:#92400e; border-color:#fcd34d; font-weight:700; padding:3px 8px; font-size:0.75rem;">
                            ⚡ Renumerar por Fecha
                          </button>
                        ` : ''}
                        ${!isCoord && group.mirrorInfo ? `
                          <button type="button" 
                            class="btn btn-secondary btn-sm btn-sync-mirror" 
                            onclick="SequenceView.syncMirrorGroup('${this._escapeJs(group.subjectName)}', '${group.period}', '${group.mirrorInfo.targetGradeName}')" 
                            title="Sincronizar clases ligadas con ${group.mirrorInfo.targetGradeName}"
                            style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0; font-weight:700; padding:3px 8px; font-size:0.75rem;">
                            🔗 Sincronizar
                          </button>
                        ` : ''}
                        ${!isCoord ? `
                          <button type="button" 
                            class="btn btn-secondary btn-sm" 
                            onclick="SequenceView.openImportForGroup('${this._escapeJs(group.subjectName)}', '${this._escapeJs(group.gradeName)}', '${this._escapeJs(group.group)}')" 
                            title="Importar planeación para ${group.subjectName} (${group.gradeName})"
                            style="padding:3px 8px; font-size:0.75rem;">
                            📥 Importar
                          </button>
                          <button type="button" 
                            class="btn btn-primary btn-sm" 
                            onclick="SequenceView.createNewClassInGroup('${this._escapeJs(group.subjectName)}', '${this._escapeJs(group.gradeName)}', '${this._escapeJs(group.group)}')" 
                            title="Crear nueva Clase #${nextSequenceNum} en esta materia"
                            style="padding:3px 10px; font-size:0.78rem;">
                            ➕ Clase #${nextSequenceNum}
                          </button>
                        ` : `
                          <span style="font-size:0.75rem; font-weight:700; color:#1d4ed8; background:#eff6ff; border:1px solid #bfdbfe; padding:4px 12px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                            🎓 Supervisión Curricular
                          </span>
                        `}
                      </div>

                      <span class="seq-chevron-icon" style="margin-left: 4px;">▼</span>
                    </div>
                  </div>

                  <!-- Contenido Nivel 3: Cuadrícula de Clases de esta Materia -->
                  <div class="seq-subj-body" id="seq-subj-body-${sKey}" style="display: ${isSubjOpen ? 'block' : 'none'};">
                    <div class="seq-classes-grid">
                      ${filteredClasses.length > 0 ? filteredClasses.map(cls => {
                        const isPlanned = (cls.status === 'planned' || cls.status === 'completed');
                        const topicRaw = cls.curriculum?.topic || cls.topic || '';
                        const topicText = this._formatTopic(topicRaw);
                        const formattedDate = this._formatDate(cls.date);
                        const hasNotebook = Boolean(cls.notebookContent || cls.teacherNotebook?.studentNotebookContent);
                        const hasObs = Boolean(cls.observations && cls.observations.trim().length > 0);
                        const hasAttachments = Boolean(cls.attachments && cls.attachments.length > 0);

                        return `
                          <div class="seq-class-card ${isPlanned ? 'card-planned' : 'card-pending'}" id="seq-card-${cls.id}" ${isCoord ? `onclick="CoordinatorView.inspectPlan('${cls.teacherId || 'usr_manuel'}', '${cls.date || ''}', '${cls.id}')" style="cursor:pointer;"` : ''}>
                            <div class="seq-class-card-top">
                              <div class="seq-class-num-badge ${isPlanned ? 'num-planned' : 'num-pending'}" 
                                ${!isCoord ? `onclick="event.stopPropagation(); SequenceView.quickEditNumber('${cls.id}', ${cls.sequenceNumber}, '${this._escapeJs(group.subjectName)}', '${this._escapeJs(group.gradeName)}')" title="Haga clic para modificar el número de clase rápidamente" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px; user-select:none;"` : `style="user-select:none; display:inline-flex; align-items:center; gap:4px;"`}>
                                <span>Clase #${cls.sequenceNumber}</span>
                                ${!isCoord ? `<span style="font-size:0.7rem; opacity:0.85;" title="Modificar número">✏️</span>` : ''}
                              </div>
                              <div class="seq-class-top-right">
                                <span class="seq-class-status-text ${isPlanned ? 'status-planned' : 'status-pending'}">
                                  ${isPlanned ? '✓ Planeada' : '○ Pendiente'}
                                </span>
                                ${!isCoord ? `
                                  <button type="button" 
                                    class="seq-class-delete-btn" 
                                    onclick="event.stopPropagation(); SequenceView.deleteClass('${cls.id}', '${cls.sequenceNumber}', '${this._escapeJs(group.subjectName)}', '${this._escapeJs(group.gradeName)}', '${cls.date || ''}')" 
                                    title="Eliminar Clase #${cls.sequenceNumber}">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      <line x1="10" y1="11" x2="10" y2="17"></line>
                                      <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                  </button>
                                ` : ''}
                              </div>
                            </div>

                            <div class="seq-class-date-row">
                              <span>📅 ${formattedDate}</span>
                              ${cls.time ? `<span>⏰ ${cls.time}</span>` : ''}
                            </div>

                            <div class="seq-class-topic-box" title="${this._escapeHtml(topicRaw)}">
                              <strong>Tema:</strong> ${topicText}
                            </div>

                            <!-- Insignias de características -->
                            <div class="seq-class-features-row">
                              ${hasNotebook ? `<span class="feat-tag feat-notebook" title="Tiene contenido estructurado para el Cuaderno">📓 Cuaderno</span>` : ''}
                              ${hasObs ? `<span class="feat-tag feat-obs" title="Tiene observaciones registradas">📝 Obs</span>` : ''}
                              ${hasAttachments ? `<span class="feat-tag feat-att" style="cursor:pointer;" onclick="event.stopPropagation(); SequenceView.showClassAttachments('${cls.id}')" title="${cls.attachments.length} archivo(s) anexo(s) - Clic para ver y gestionar">📎 ${cls.attachments.length}</span>` : ''}
                            </div>

                            <!-- Botones de Acción Directa -->
                            <div class="seq-class-actions" onclick="event.stopPropagation();">
                              ${isCoord ? `
                                <button type="button" 
                                  class="btn btn-primary btn-sm btn-action-plan" 
                                  onclick="CoordinatorView.inspectPlan('${cls.teacherId || 'usr_manuel'}', '${cls.date || ''}', '${cls.id}')" 
                                  title="Ver tabla oficial de la planeación de Clase #${cls.sequenceNumber}"
                                  style="font-weight:700; display:inline-flex; align-items:center; gap:5px; background:#0f766e; border-color:#0f766e; color:#ffffff;">
                                  📋 Ver Planeación
                                </button>
                                <button type="button" 
                                  class="btn btn-secondary btn-sm" 
                                  onclick="AppRouter.navigateTo('notebook', { classId: '${cls.id}' })" 
                                  title="Ver Cuaderno Pedagógico de Clase #${cls.sequenceNumber}"
                                  style="font-weight:700; display:inline-flex; align-items:center; gap:5px; color:#1e40af; background:#eff6ff; border-color:#bfdbfe;">
                                  📓 Cuaderno
                                </button>
                                <button type="button" 
                                  class="btn btn-secondary btn-sm" 
                                  onclick="CoordinatorView.downloadTeacherDocx('${cls.teacherId || 'usr_manuel'}', '${cls.date || ''}', '${cls.id}')" 
                                  title="Descargar tabla Word (.docx) de Clase #${cls.sequenceNumber}"
                                  style="font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                  📄 Word
                                </button>
                                <button type="button" 
                                  class="btn btn-secondary btn-sm btn-icon-square" 
                                  onclick="CoordinatorView.downloadTeacherPdf('${cls.teacherId || 'usr_manuel'}', '${cls.date || ''}', '${cls.id}')" 
                                  title="Imprimir / Descargar PDF de esta clase">
                                  🖨️
                                </button>
                              ` : `
                                <button type="button" 
                                  class="btn btn-primary btn-sm btn-action-plan" 
                                  onclick="AppRouter.navigateTo('editor', { classId: '${cls.id}' })" 
                                  title="Editar planeación de Clase #${cls.sequenceNumber}">
                                  ✏️ ${isPlanned ? 'Editar' : 'Planear'}
                                </button>
                                ${group.mirrorInfo ? `
                                  <button type="button" 
                                    class="btn btn-secondary btn-sm btn-mirror-copy" 
                                    onclick="SequenceView.duplicateClassToMirror('${cls.id}')" 
                                    title="Duplicar o sincronizar esta clase directamente en ${group.mirrorInfo.targetGradeName}"
                                    style="color:#15803d; border-color:#bbf7d0; background:#f0fdf4; font-weight:700;">
                                    🔗 ${group.mirrorInfo.targetGradeName}
                                  </button>
                                ` : ''}
                                <button type="button" 
                                  class="btn btn-secondary btn-sm btn-icon-square" 
                                  onclick="AppRouter.navigateTo('notebook', { classId: '${cls.id}' })" 
                                  title="Ver Cuaderno del Docente / Guía">
                                  📓
                                </button>
                                <button type="button" 
                                  class="btn btn-secondary btn-sm btn-icon-square" 
                                  onclick="ExportService.exportClassById('${cls.id}', 'pdf')" 
                                  title="Descargar PDF de esta clase">
                                  📄
                                </button>
                              `}
                            </div>
                          </div>
                        `;
                      }).join('') : `
                        <div class="seq-empty-filter-note">
                          No hay clases ${this.activeFilter === 'pending' ? 'pendientes' : 'planeadas'} registradas en esta materia.
                        </div>
                      `}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  _formatTopic(topic) {
    if (!topic || !String(topic).trim() || String(topic).trim() === 'Sin tema planeado todavía') {
      return '<em style="color:#94a3b8;">Sin tema planeado todavía</em>';
    }
    let clean = String(topic).trim()
      .replace(/^[\s\*#_]+/, '')
      .replace(/[\s\*#_]+$/, '')
      .replace(/^Clase\s*#?\s*\d+\s*[:\-]?\s*/i, '');
    if (clean.length > 80) {
      clean = clean.slice(0, 77) + '...';
    }
    return this._escapeHtml(clean);
  }

  _formatDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return 'Sin fecha';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parts[0];
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d} ${months[m] || ''} ${y}`;
  }

  _getSubjectIcon(subjectName) {
    const s = String(subjectName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (s.includes('matematica') || s.includes('aritmetica') || s.includes('geometria') || s.includes('algebra')) return '📐';
    if (s.includes('sistema') || s.includes('informatica') || s.includes('comput')) return '💻';
    if (s.includes('robotica') || s.includes('tecnologia')) return '🤖';
    if (s.includes('ciencia') || s.includes('biologia') || s.includes('quimica') || s.includes('fisica')) return '🔬';
    if (s.includes('espanol') || s.includes('lengua') || s.includes('literatura') || s.includes('humanidad')) return '📖';
    if (s.includes('social') || s.includes('historia') || s.includes('geografia')) return '🌍';
    if (s.includes('ingles') || s.includes('idioma')) return '🗣️';
    if (s.includes('artistica') || s.includes('arte') || s.includes('dibujo')) return '🎨';
    if (s.includes('educacion fisica') || s.includes('deporte')) return '🏃';
    if (s.includes('etica') || s.includes('religion') || s.includes('valores')) return '🕊️';
    if (s.includes('direccion de grupo')) return '👥';
    return '📚';
  }

  _escape(str) {
    return this._escapeHtml(str);
  }

  _escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  _escapeJs(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'");
  }

  _isCoordinator() {
    return Boolean(
      (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) ||
      (typeof AuthModal !== 'undefined' && AuthModal.getSession()?.role === 'coordinator')
    );
  }

  deleteClass(classId, sequenceNumber, subjectName, gradeName, date) {
    if (this._isCoordinator()) return;
    if (!classId && !date) return;

    const seqLabel = sequenceNumber ? `Clase #${sequenceNumber}` : 'esta clase';
    const subLabel = subjectName ? ` de ${subjectName}` : '';
    const grdLabel = gradeName ? ` (${gradeName})` : '';
    const msg = `¿Deseas eliminar la ${seqLabel}${subLabel}${grdLabel}?\n\nEsta acción quitará esta clase sin afectar las demás planeaciones.`;

    if (!confirm(msg)) {
      return;
    }

    // Respuesta instantánea en UI: ocultar la tarjeta del DOM de inmediato
    const cardEl = document.getElementById(`seq-card-${classId}`);
    if (cardEl) {
      cardEl.style.transition = 'all 0.2s ease-out';
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'scale(0.92)';
    }

    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId
      ? ClassRepository._getCurrentTeacherId()
      : 'usr_manuel';

    const fallbackOptions = {
      date: date || undefined,
      sequenceNumber: sequenceNumber ? parseInt(sequenceNumber, 10) : undefined,
      subjectName: subjectName || undefined,
      gradeName: gradeName || undefined
    };

    const success = typeof ClassRepository !== 'undefined' && ClassRepository.deleteClass
      ? ClassRepository.deleteClass(classId, tid, fallbackOptions)
      : false;

    if (success) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`✓ ${seqLabel} eliminada correctamente`, 'success');
      } else if (typeof NotificationService !== 'undefined' && NotificationService.show) {
        NotificationService.show(`${seqLabel} eliminada correctamente`, 'success');
      }
      this.render();
    } else {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`No se pudo eliminar la clase`, 'error');
      }
      this.render();
    }
  }

  syncMirrorGroup(subjectName, period, targetGradeName) {
    if (this._isCoordinator()) return;
    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId
      ? ClassRepository._getCurrentTeacherId()
      : 'usr_manuel';

    if (typeof ClassRepository !== 'undefined' && ClassRepository.syncAllMirrorClasses) {
      const count = ClassRepository.syncAllMirrorClasses(subjectName, period, tid);
      if (count > 0) {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`✓ Clases de ${subjectName} sincronizadas entre cursos ligados (${count} sincronizaciones)`, 'success');
        } else if (typeof NotificationService !== 'undefined' && NotificationService.show) {
          NotificationService.show(`✓ Clases ligadas sincronizadas con éxito`, 'success');
        }
      } else {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`Las clases de ${subjectName} ya se encuentran sincronizadas`, 'info');
        }
      }
      this.render();
    }
  }

  duplicateClassToMirror(classId) {
    if (this._isCoordinator()) return;
    if (!classId) return;

    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId
      ? ClassRepository._getCurrentTeacherId()
      : 'usr_manuel';

    if (typeof ClassRepository !== 'undefined' && ClassRepository.duplicateClassToMirror) {
      const duplicated = ClassRepository.duplicateClassToMirror(classId, tid);
      if (duplicated) {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`✓ Clase #${duplicated.sequenceNumber} duplicada en ${duplicated.gradeName} exitosamente`, 'success');
        } else if (typeof NotificationService !== 'undefined' && NotificationService.show) {
          NotificationService.show(`✓ Clase duplicada en ${duplicated.gradeName} exitosamente`, 'success');
        }
        this.render();
      } else {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('No se pudo duplicar la clase al grado espejo', 'error');
        }
      }
    }
  }

  autoFixGroupSequence(subjectName, gradeName, period, groupName) {
    if (this._isCoordinator()) return;
    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId
      ? ClassRepository._getCurrentTeacherId()
      : 'usr_manuel';

    const confirmed = confirm(
      `¿Deseas renumerar automáticamente todas las clases de ${subjectName} (${gradeName}) para el ${period} Período?\n\n` +
      `Se ordenarán cronológicamente por fecha (de la más antigua a la más reciente) y se les asignará la secuencia consecutiva: #1, #2, #3...`
    );
    if (!confirmed) return;

    const allClasses = ClassRepository.getClasses({ teacherId: tid, period: period, subject: subjectName }, tid);
    const targetGrdNorm = String(gradeName || '').toLowerCase().replace(/[^0-9a-z]/gi, '').trim();

    // Filtrar clases de este grado específico
    const groupClasses = allClasses.filter(c => {
      const cGrd = String(c.gradeName || c.grade || '').toLowerCase().replace(/[^0-9a-z]/gi, '').trim();
      return cGrd === targetGrdNorm;
    });

    // Filtrar estrictamente clases vigentes (no eliminadas ni tombstones)
    const validGroupClasses = groupClasses.filter(c => c && c.id && !ClassRepository.isDeletedClass(c.id, tid));

    if (validGroupClasses.length === 0) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('No se encontraron clases para renumerar', 'info');
      return;
    }

    // Ordenar estrictamente por fecha cronológica y hora
    validGroupClasses.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const timeA = a.startTime || a.time || '';
      const timeB = b.startTime || b.time || '';
      return timeA.localeCompare(timeB);
    });

    let currentNum = 1;
    validGroupClasses.forEach(c => {
      const schedNum = (typeof ClassRepository !== 'undefined' && ClassRepository.getScheduleSequenceNumber)
        ? ClassRepository.getScheduleSequenceNumber(c.date, subjectName, gradeName, tid, { requireScheduledWeekday: true })
        : null;
      const assignedNum = (schedNum !== null && schedNum > 0) ? schedNum : currentNum;
      c.sequenceNumber = assignedNum;
      c.dayNumber = String(assignedNum);
      currentNum = assignedNum + 1;
      // Pasar isMirrorSync: true para evitar cascadas o resurrección de clases eliminadas en paralelos
      ClassRepository.saveClass(c, tid, { isMirrorSync: true });
    });

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`✓ ${validGroupClasses.length} clases numeradas según horario y calendario escolar`, 'success');
    }
    this.render();
  }

  quickEditNumber(classId, currentNum, subjectName, gradeName) {
    if (this._isCoordinator()) return;
    if (!classId) return;

    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId
      ? ClassRepository._getCurrentTeacherId()
      : 'usr_manuel';

    const input = prompt(`Modificar número de clase para:\n${subjectName} — ${gradeName}\n\nIngresa el nuevo número de clase:`, currentNum);
    if (input === null) return;

    const newNum = parseInt(String(input).trim(), 10);
    if (isNaN(newNum) || newNum <= 0) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Ingresa un número válido mayor a 0', 'warning');
      return;
    }

    const cls = ClassRepository.getClass(classId, tid);
    if (!cls) return;

    const shouldPropagate = confirm(`¿Deseas continuar la secuencia numérica (+1, +2, +3...) en las clases posteriores a ${cls.date}?`);

    cls.sequenceNumber = newNum;
    cls.dayNumber = String(newNum);
    ClassRepository.saveClass(cls, tid, { isMirrorSync: true });

    if (shouldPropagate) {
      const targetSub = String(cls.subjectName || cls.subject || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const targetGrd = String(cls.gradeName || cls.grade || '').toLowerCase().replace(/[^0-9a-z]/gi, '').trim();
      const curPeriod = String(cls.period || '1°').trim();

      const allClasses = ClassRepository.getAllClasses(tid);
      const futureClasses = allClasses.filter(c => {
        if (!c.date) return false;
        if (ClassRepository.isDeletedClass(c.id, tid)) return false;
        if (c.date < cls.date) return false;
        if (c.date === cls.date && c.id === cls.id) return false;
        if (curPeriod && String(c.period || '1°').trim() !== curPeriod) return false;
        const sub = String(c.subjectName || c.subject || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const grd = String(c.gradeName || c.grade || '').toLowerCase().replace(/[^0-9a-z]/gi, '').trim();
        return sub === targetSub && grd === targetGrd;
      }).sort((a, b) => {
        if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
        return (parseInt(a.sequenceNumber, 10) || 0) - (parseInt(b.sequenceNumber, 10) || 0);
      });

      let nextSeq = newNum + 1;
      futureClasses.forEach(fc => {
        fc.sequenceNumber = nextSeq;
        fc.dayNumber = String(nextSeq);
        nextSeq++;
        ClassRepository.saveClass(fc, tid, { isMirrorSync: true });
      });
    }

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`✓ Clase actualizada a #${newNum}${shouldPropagate ? ' y secuencia continuada' : ''}`, 'success');
    }
    this.render();
  }

  showClassAttachments(classId) {
    if (!classId) return;
    if (typeof Planner !== 'undefined' && typeof Planner.openClassAttachmentsModalById === 'function') {
      Planner.openClassAttachmentsModalById(classId);
    } else if (typeof AppRouter !== 'undefined' && AppRouter.navigateTo) {
      AppRouter.navigateTo('class-editor', { id: classId });
      setTimeout(() => {
        if (typeof ClassEditorView !== 'undefined' && ClassEditorView.scrollToAttachments) {
          ClassEditorView.scrollToAttachments();
        }
      }, 250);
    }
  }
}

const SequenceView = new SequenceViewClass();

if (typeof window !== 'undefined') {
  window.SequenceView = SequenceView;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SequenceView;
}
