/**
 * MÓDULO DE GESTIÓN DE ROLES, USUARIOS Y PANEL DE COORDINACIÓN ACADÉMICA
 * Permite:
 * 1. Al Administrador: Crear, editar y administrar perfiles de docentes y coordinadores.
 * 2. Al Coordinador / Administrador: Supervisar, revisar y descargar las planeaciones de todos los docentes,
 *    así como emitir visto bueno pedagógico y observaciones oficiales.
 */

const CoordinatorView = {
  selectedTeacherId: null,
  selectedPeriod: '1°',

  /**
   * Abre el Panel de Supervisión de Coordinación
   */
  openDashboard(defaultTeacherId = null) {
    this.selectedTeacherId = defaultTeacherId;
    let modal = document.getElementById('coordinator-dashboard-modal');
    if (!modal) {
      this.createDashboardDOM();
      modal = document.getElementById('coordinator-dashboard-modal');
    }
    
    this.renderDashboard();
    modal.classList.add('active');
  },

  closeDashboard() {
    const modal = document.getElementById('coordinator-dashboard-modal');
    if (modal) modal.classList.remove('active');
  },

  createDashboardDOM() {
    const div = document.createElement('div');
    div.id = 'coordinator-dashboard-modal';
    div.className = 'coordinator-modal-backdrop';
    div.innerHTML = `
      <div class="coordinator-modal-card">
        <!-- Encabezado del Panel -->
        <div class="coordinator-modal-header">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="coordinator-icon-badge">🎓</div>
            <div>
              <h2 style="margin:0; font-size:1.25rem; font-weight:800; color:var(--slate-900);">
                Panel de Coordinación Académica & Supervisión
              </h2>
              <div style="font-size:0.82rem; color:var(--slate-500); margin-top:2px;">
                Revisión pedagógica, seguimiento de planeaciones y descarga oficial de preparadores
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.6rem;">
            <!-- Selector de Periodo -->
            <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.85rem; font-weight:600;">
              <span>Periodo:</span>
              <select id="coord-period-filter" class="form-select" style="width:auto; padding:0.25rem 0.6rem; font-size:0.85rem; font-weight:700; height:32px;" onchange="CoordinatorView.handlePeriodFilterChange(this.value)">
                <option value="1°" selected>1° Periodo</option>
                <option value="2°">2° Periodo</option>
                <option value="3°">3° Periodo</option>
                <option value="4°">4° Periodo</option>
              </select>
            </div>

            <!-- Botón Gestión de Docentes (si es admin) -->
            ${(typeof UserService !== 'undefined' && UserService.getCurrentUser().role === 'admin_teacher') ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="UserManagerModal.open()" title="Crear y administrar perfiles de docentes">
                👥 Administrar Docentes
              </button>
            ` : ''}

            <!-- Cerrar -->
            <button type="button" class="btn-close-modal" onclick="CoordinatorView.closeDashboard()" title="Cerrar">&times;</button>
          </div>
        </div>

        <!-- Contenedor de contenido dinámico -->
        <div class="coordinator-dashboard-body" id="coordinator-dashboard-content">
          <!-- Renderizado dinámicamente -->
        </div>
      </div>
    `;
    document.body.appendChild(div);
  },

  handlePeriodFilterChange(period) {
    this.selectedPeriod = period;
    this.renderDashboard();
  },

  renderDashboard() {
    const container = document.getElementById('coordinator-dashboard-content');
    if (!container) return;

    const allUsers = UserService.getAllUsers();
    const teachers = allUsers.filter(u => u.role !== 'coordinator');
    let summary = UserService.getAllTeachersAuditSummary(this.selectedPeriod);
    const isMarisol = (typeof UserService !== 'undefined' && UserService.isCoordinatorActive());

    // Priorizar siempre a Manuel Muñoz al tope de la lista
    summary.sort((a, b) => {
      if (a.user.id === 'usr_manuel') return -1;
      if (b.user.id === 'usr_manuel') return 1;
      return (a.user.name || '').localeCompare(b.user.name || '');
    });

    // Calcular métricas globales
    let totalClasses = 0;
    let totalApproved = 0;
    let totalPending = 0;

    summary.forEach(s => {
      totalClasses += s.totalClassesPlanned;
      totalApproved += s.totalReviewed;
      totalPending += s.pendingRevision;
    });

    container.innerHTML = `
      ${isMarisol ? `
        <!-- Banner de Supervisión Oficial: Marisol Ruiz -->
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:0.9rem 1.25rem; margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="font-size:2rem; background:#dbeafe; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center;">🎓</div>
            <div>
              <div style="font-weight:800; font-size:1.05rem; color:#1e3a8a;">
                Sesión Oficial: Marisol Ruiz — Coordinación Académica
              </div>
              <div style="font-size:0.82rem; color:#2563eb; margin-top:2px;">
                Revisión pedagógica, visto bueno oficial y descarga de planeaciones de <strong>Manuel Muñoz</strong>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="AuthModal.logout()" style="font-size:0.8rem; padding:0.35rem 0.75rem; color:#dc2626; border-color:#fca5a5; background:#fef2f2; font-weight:700;">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 1. Tarjetas de Resumen Global -->
      <div class="coord-stats-grid">
        <div class="coord-stat-card">
          <div class="stat-icon" style="background:#eff6ff; color:#2563eb;">👨‍🏫</div>
          <div>
            <div class="stat-value">${teachers.length}</div>
            <div class="stat-label">Docentes Registrados</div>
          </div>
        </div>

        <div class="coord-stat-card">
          <div class="stat-icon" style="background:#f5f3ff; color:#7c3aed;">📚</div>
          <div>
            <div class="stat-value">${totalClasses}</div>
            <div class="stat-label">Sesiones de Clase Planeadas</div>
          </div>
        </div>

        <div class="coord-stat-card">
          <div class="stat-icon" style="background:#ecfdf5; color:#059669;">✅</div>
          <div>
            <div class="stat-value">${totalApproved}</div>
            <div class="stat-label">Planeaciones con Visto Bueno</div>
          </div>
        </div>

        <div class="coord-stat-card">
          <div class="stat-icon" style="background:#fffbeb; color:#d97706;">⏳</div>
          <div>
            <div class="stat-value">${totalPending}</div>
            <div class="stat-label">Pendientes de Revisión</div>
          </div>
        </div>
      </div>

      <!-- 2. Filtro y Lista de Docentes -->
      <div style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
        <h3 style="margin:0; font-size:1.1rem; color:var(--slate-800); font-weight:700;">
          Seguimiento y Auditoría por Docente
        </h3>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="text" id="coord-search-teacher" class="form-input" placeholder="🔍 Buscar docente o materia..." style="width:240px; padding:0.35rem 0.75rem; font-size:0.85rem;" oninput="CoordinatorView.filterTeachersList(this.value)" />
        </div>
      </div>

      <!-- 3. Tabla / Tarjetas de Docentes -->
      <div class="coord-teachers-list" id="coord-teachers-container">
        ${summary.map(item => this.renderTeacherCard(item)).join('')}
      </div>
    `;
  },

  renderTeacherCard(item) {
    const user = item.user;
    const subjectsText = (user.subjects && user.subjects.length > 0)
      ? user.subjects.map(s => s.name).join(', ')
      : 'Materias generales';
    
    const gradesText = (user.grades && user.grades.length > 0)
      ? user.grades.join(', ')
      : 'Grados asignados';

    const plans = UserService.getTeacherPlans(user.id);
    const dates = Object.keys(plans).sort();

    return `
      <div class="coord-teacher-card" data-teacher-name="${user.name.toLowerCase()}" data-teacher-subjects="${subjectsText.toLowerCase()}">
        <div class="coord-teacher-header">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="teacher-avatar" style="width:44px; height:44px; font-size:1.1rem; background:var(--primary-600); color:#fff;">
              ${user.name ? user.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <h4 style="margin:0; font-size:1rem; font-weight:700; color:var(--slate-900);">
                ${user.name}
                ${user.role === 'admin_teacher' ? '<span class="badge-role-admin" style="font-size:0.7rem; margin-left:4px;">👑 Admin / Docente</span>' : ''}
              </h4>
              <div style="font-size:0.8rem; color:var(--slate-500); margin-top:2px;">
                Dir. Grupo: <strong>${user.homeroom || 'Sin asignar'}</strong> • ${subjectsText} (${gradesText})
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="badge ${item.totalClassesPlanned > 0 ? 'badge-success' : 'badge-warning'}" style="font-size:0.75rem; padding:0.25rem 0.65rem;">
              ${item.totalClassesPlanned} clases registradas
            </span>
            <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.8rem; padding:0.35rem 0.75rem;" onclick="CoordinatorView.viewTeacherCalendar('${user.id}')" title="Ver el calendario y planeaciones de este docente">
              📅 Ver Calendario
            </button>
          </div>
        </div>

        <!-- Lista de Fechas Planeadas por el Docente -->
        <div class="coord-teacher-dates-wrapper">
          ${dates.length === 0 ? `
            <div style="font-size:0.82rem; color:var(--slate-400); font-style:italic; padding:0.5rem 0;">
              No hay planeaciones registradas para este periodo aún.
            </div>
          ` : `
            <div class="coord-dates-table-container">
              <table class="coord-dates-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Día</th>
                    <th>Clases</th>
                    <th>Estado de Revisión</th>
                    <th style="text-align:center;">Acciones de Coordinación</th>
                  </tr>
                </thead>
                <tbody>
                  ${dates.map(dateStr => {
                    const { plan, classes: validClasses } = CoordinatorView._getPlanAndClasses(user.id, dateStr);
                    const count = validClasses ? validClasses.length : 0;
                    const review = plan?.coordinatorReview;
                    const dayName = ExportService.getDayOfWeekName(dateStr);

                    let statusBadge = `<span class="badge-review pending">⏳ Pendiente de Visto Bueno</span>`;
                    if (review && review.status === 'approved') {
                      statusBadge = `<span class="badge-review approved" title="Revisado por ${review.reviewerName} el ${review.date}">✅ Visto Bueno Aprobado</span>`;
                    } else if (review && review.status === 'approved_with_notes') {
                      statusBadge = `<span class="badge-review notes" title="Observación: ${review.comments}">⚠️ Aprobado con Sugerencias</span>`;
                    } else if (review && review.status === 'needs_revision') {
                      statusBadge = `<span class="badge-review warning" title="Requiere corrección: ${review.comments}">❌ Requiere Ajustes</span>`;
                    }

                    return `
                      <tr>
                        <td style="font-weight:700; color:var(--slate-800); font-size:0.85rem;">
                          ${dateStr}
                        </td>
                        <td style="font-size:0.82rem; color:var(--slate-600);">${dayName}</td>
                        <td style="font-size:0.82rem;">
                          <span class="badge" style="background:#f1f5f9; color:#334155; font-size:0.75rem;">${count} clases</span>
                        </td>
                        <td>${statusBadge}</td>
                        <td>
                          <div style="display:flex; justify-content:center; align-items:center; gap:0.4rem;">
                            <!-- Botón Inspeccionar -->
                            <button type="button" class="btn-coord-action view" onclick="CoordinatorView.inspectPlan('${user.id}', '${dateStr}')" title="Inspeccionar hoja oficial de planeación">
                              👁️ Ver
                            </button>
                            <!-- Botón Descargar Word -->
                            <button type="button" class="btn-coord-action docx" onclick="CoordinatorView.downloadTeacherDocx('${user.id}', '${dateStr}')" title="Descargar en Word (.docx) con membrete oficial">
                              📄 Word
                            </button>
                            <!-- Botón Descargar PDF -->
                            <button type="button" class="btn-coord-action pdf" onclick="CoordinatorView.downloadTeacherPdf('${user.id}', '${dateStr}')" title="Descargar o Imprimir PDF">
                              🖨️ PDF
                            </button>
                            <!-- Botón Dar Visto Bueno -->
                            <button type="button" class="btn-coord-action stamp" onclick="CoordinatorView.openFeedbackModal('${user.id}', '${dateStr}')" title="Emitir visto bueno y observaciones pedagógicas">
                              ✍️ Visto Bueno
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  },

  filterTeachersList(query) {
    const term = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.coord-teacher-card');
    cards.forEach(card => {
      const name = card.getAttribute('data-teacher-name') || '';
      const subjects = card.getAttribute('data-teacher-subjects') || '';
      if (!term || name.includes(term) || subjects.includes(term)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  },

  /**
   * Cambia temporalmente la vista activa al calendario del docente seleccionado
   */
  viewTeacherCalendar(teacherId) {
    UserService.setCurrentUser(teacherId);
    App.renderHeaderProfile();
    this.closeDashboard();
    App.showCalendarView();
    App.showToast(`Visualizando el espacio del docente: ${UserService.getCurrentUser().name}`, 'info');
  },

  /**
   * Inspecciona en pantalla completa la planeación oficial de un docente
   * @param {string} teacherId - ID del docente
   * @param {string} dateStr - Fecha en formato YYYY-MM-DD
   * @param {string|null} classId - ID único de la clase a mostrar (o null para ver todas)
   */
  inspectPlan(teacherId, dateStr, classIndexOrId = null) {
    const tid = teacherId || 'usr_manuel';
    const teacher = (typeof UserService !== 'undefined' && UserService.getUserById) 
      ? (UserService.getUserById(tid) || { name: 'Manuel Muñoz' }) 
      : { name: 'Manuel Muñoz' };

    // Si se especificó un ID de clase explícito, intentar resolver directamente desde ClassRepository
    let directClass = null;
    if (classIndexOrId && typeof classIndexOrId === 'string' && typeof ClassRepository !== 'undefined') {
      directClass = ClassRepository.getClass(classIndexOrId, tid);
      if (directClass) {
        if (!dateStr || dateStr !== directClass.date) {
          dateStr = directClass.date || dateStr || new Date().toISOString().split('T')[0];
        }
      }
    }

    const { plan, classes } = this._getPlanAndClasses(tid, dateStr);

    if (directClass && !classes.find(c => c.id === directClass.id)) {
      classes.push(directClass);
    }

    if ((!classes || classes.length === 0) && !directClass) {
      alert('Esta fecha o clase no contiene planeaciones registradas.');
      return;
    }

    // Remover modal previo si ya estuviera abierto
    const existing = document.getElementById('coordinator-inspect-plan-modal');
    if (existing) existing.remove();

    // BUG FIX 1: Ocultar el modal de clases para que el inspect quede al frente
    const dayClassesModal = document.getElementById('coordinator-day-classes-modal');
    if (dayClassesModal) dayClassesModal.style.display = 'none';

    let planToRender = plan;
    let subtitleText = `Fecha: ${dateStr} • Periodo: ${plan.period || '1°'}`;
    let singleClassFound = directClass || null;

    if (!singleClassFound && classIndexOrId !== null && classIndexOrId !== undefined && classIndexOrId !== 'null') {
      // 1. Prioridad: acceso directo por índice numérico (infalible)
      if (!isNaN(Number(classIndexOrId))) {
        const numIdx = Number(classIndexOrId);
        if (numIdx >= 0 && numIdx < classes.length) {
          singleClassFound = classes[numIdx];
        }
      }

      // 2. Búsqueda por ID único de clase
      if (!singleClassFound) {
        singleClassFound = classes.find(c =>
          c.id === classIndexOrId || c._id === classIndexOrId || String(c.id) === String(classIndexOrId)
        );
      }

      // 3. Fallback usando el mapa global __classIdMap
      if (!singleClassFound && window.__classIdMap && typeof window.__classIdMap[classIndexOrId] !== 'undefined') {
        const idx = window.__classIdMap[classIndexOrId];
        singleClassFound = classes[idx];
      }
    }

    if (singleClassFound) {
      // Normalizar campos subject y grade para garantizar que ExportService los lea sin caer al perfil
      let finalSubject = singleClassFound.subject || singleClassFound.subjectName || singleClassFound.subjectId || '';
      let finalGrade = singleClassFound.grade || singleClassFound.gradeName || singleClassFound.gradeId || '';

      if (!finalSubject) {
        const m = ((singleClassFound.description || '') + ' ' + (singleClassFound.sequence || '') + ' ' + (singleClassFound.topic || '')).match(/Asignatura\s*:\s*([^\n\r<•]+)/i);
        if (m) finalSubject = m[1].trim();
      }
      if (!finalGrade) {
        const m = ((singleClassFound.description || '') + ' ' + (singleClassFound.sequence || '') + ' ' + (singleClassFound.topic || '')).match(/Grado\s*:\s*([^\n\r<•]+)/i);
        if (m) finalGrade = m[1].trim();
      }

      finalSubject = finalSubject || 'Asignatura';
      finalGrade = finalGrade || '';

      const normalizedClass = {
        ...singleClassFound,
        date: singleClassFound.date || dateStr,
        subject: finalSubject,
        subjectName: finalSubject,
        grade: finalGrade,
        gradeName: finalGrade
      };

      planToRender = {
        ...plan,
        date: dateStr,
        subject: finalSubject,
        subjectName: finalSubject,
        grade: finalGrade,
        gradeName: finalGrade,
        classes: [normalizedClass]
      };
      subtitleText = `Secuencia Didáctica: <strong>${finalSubject} ${finalGrade}</strong> • Fecha: ${dateStr}`;
    }

    const htmlSheet = ExportService.generateHtmlSheet(planToRender, teacher);

    const inspectModal = document.createElement('div');
    inspectModal.id = 'coordinator-inspect-plan-modal';
    inspectModal.className = 'coordinator-modal-backdrop active';
    inspectModal.style.zIndex = '3700'; // AL FRENTE DE TODO

    // Función de cierre: elimina inspectModal y restaura el modal de clases
    const closeInspectAndRestore = `document.getElementById('coordinator-inspect-plan-modal')?.remove(); var _dcm=document.getElementById('coordinator-day-classes-modal'); if(_dcm)_dcm.style.display=''`;


    inspectModal.innerHTML = `
      <div class="coordinator-modal-card" style="max-width:1020px; height:94vh; display:flex; flex-direction:column; box-shadow:0 25px 60px rgba(0,0,0,0.5);">
        <div class="coordinator-modal-header" style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:1rem 1.5rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.4rem;">📋</span>
            <div>
              <h3 style="margin:0; font-size:1.15rem; color:var(--slate-900); font-weight:800;">
                Tabla de Secuencia Didáctica Oficial
              </h3>
              <div style="font-size:0.82rem; color:var(--slate-600); margin-top:2px;">
                Docente: <strong>${teacher.name}</strong> • ${subtitleText}
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            ${(singleClassFound && classes.length > 1) ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.inspectPlan('${tid}', '${dateStr}', null)" style="font-weight:700; color:#1e40af; background:#eff6ff; border-color:#bfdbfe;" title="Ver todas las clases del día">
                📑 Ver Todas las Clases (${classes.length})
              </button>
            ` : (classes.length > 1 ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.inspectPlan('${tid}', '${dateStr}', '${classes[0].id || '0'}')" style="font-weight:700; color:#0f766e; background:#f0fdfa; border-color:#99f6e4;" title="Ver solo la primera clase">
                🔍 Ver Clase Individual
              </button>
            ` : '')}

            <button type="button" class="btn btn-primary btn-sm" onclick="CoordinatorView.downloadTeacherDocx('${tid}', '${dateStr}', '${(singleClassFound?.id || classIndexOrId || '')}')" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
              📄 Descargar Word (.docx)
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.downloadTeacherPdf('${tid}', '${dateStr}', '${(singleClassFound?.id || classIndexOrId || '')}')" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
              🖨️ Imprimir / PDF
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.openFeedbackModal('${tid}', '${dateStr}'); ${closeInspectAndRestore};" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
              ✍️ Visto Bueno
            </button>
            <button type="button" class="btn-close-modal" onclick="${closeInspectAndRestore}" title="Cerrar tabla y volver a las clases">&times;</button>
          </div>
        </div>

        <div style="flex:1; overflow-y:auto; background:#f1f5f9; padding:1.5rem; display:flex; justify-content:center;">
          <div style="background:#fff; width:100%; max-width:880px; padding:2rem; box-shadow:0 4px 15px rgba(0,0,0,0.1); border-radius:6px;">
            ${htmlSheet}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(inspectModal);
  },


  /**
   * Obtiene la planeación y las clases de un docente para una fecha combinando todas las fuentes de almacenamiento
   */
  _getPlanAndClasses(teacherId, dateStr) {
    const tid = teacherId || 'usr_manuel';
    let classes = [];

    // 1. Obtener desde ClassRepository
    if (typeof ClassRepository !== 'undefined') {
      if (typeof ClassRepository.getByDate === 'function') {
        classes = ClassRepository.getByDate(dateStr, tid) || [];
      } else if (typeof ClassRepository.getClasses === 'function') {
        classes = ClassRepository.getClasses({ date: dateStr }, tid) || [];
      }
    }

    // 2. Obtener desde PlanRepository o StorageService o UserService
    let plan = null;
    if (typeof PlanRepository !== 'undefined' && PlanRepository.getPlan) {
      plan = PlanRepository.getPlan(tid, dateStr);
    }
    if (!plan && typeof StorageService !== 'undefined' && StorageService.getPlan) {
      plan = StorageService.getPlan(dateStr);
    }
    if (!plan && typeof StorageService !== 'undefined' && StorageService.getPlanByDate) {
      plan = StorageService.getPlanByDate(dateStr);
    }
    if (!plan && typeof UserService !== 'undefined' && UserService.getTeacherPlans) {
      const plans = UserService.getTeacherPlans(tid);
      plan = plans ? plans[dateStr] : null;
    }

    // 3. Cruzar datos si uno de los dos está vacío
    if ((!classes || classes.length === 0) && plan && Array.isArray(plan.classes)) {
      classes = plan.classes;
    }

    const isBackupFn = (typeof ClassRepository !== 'undefined' && ClassRepository.isBackupClass)
      ? (c) => ClassRepository.isBackupClass(c)
      : (c) => {
          if (!c) return false;
          if (c.isBackup || c.backup || c.isSnapshot || c.snapshot || c.isRespaldo || c.respaldo) return true;
          const st = String(c.status || '').toLowerCase().trim();
          if (st === 'backup' || st === 'respaldo' || st === 'snapshot' || st === 'orphaned') return true;
          const src = String(c._source || c.source || '').toLowerCase().trim();
          return (src.includes('backup') || src.includes('respaldo') || src.includes('snapshot')) && (!c.date || (!c.subjectName && !c.subject));
        };

    // 4. Filtrar rigurosamente clases marcadas como respaldo
    classes = classes.filter(c => !isBackupFn(c));

    // 5. Deduplicar copias redundantes generadas por importaciones repetidas de respaldo
    if (typeof ClassRepository !== 'undefined' && ClassRepository.deduplicateClasses) {
      classes = ClassRepository.deduplicateClasses(classes);
    }

    if (!plan) {
      plan = { date: dateStr, classes: classes, period: '1°' };
    } else {
      plan = JSON.parse(JSON.stringify(plan));
      plan.classes = classes;
    }

    return { plan, classes, teacherId: tid };
  },

  /**
   * Vista Exclusiva de Coordinación: Revisión de clases del día con cuaderno, tabla y descargas
   */
  openDayClassesReview(dateStr, teacherId = 'usr_manuel') {
    const tid = teacherId || 'usr_manuel';
    const teacher = (typeof UserService !== 'undefined' && UserService.getUserById) 
      ? (UserService.getUserById(tid) || { name: 'Manuel Muñoz' }) 
      : { name: 'Manuel Muñoz' };

    const { plan, classes } = this._getPlanAndClasses(tid, dateStr);

    const dayName = (typeof ExportService !== 'undefined' && ExportService.getDayOfWeekName) 
      ? ExportService.getDayOfWeekName(dateStr) 
      : '';
    const formattedDate = (typeof ExportService !== 'undefined' && ExportService.formatDate) 
      ? ExportService.formatDate(dateStr) 
      : dateStr;

    // Remover modal previo si existe
    const existing = document.getElementById('coordinator-day-classes-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'coordinator-day-classes-modal';
    modal.className = 'coordinator-modal-backdrop active';
    modal.style.zIndex = '3100';

    let classesHtml = '';
    if (!classes || classes.length === 0) {
      classesHtml = `
        <div style="text-align:center; padding:3rem 1.5rem; color:var(--slate-500); background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">📅</div>
          <h4 style="margin:0 0 0.5rem 0; font-size:1.1rem; color:var(--slate-700); font-weight:700;">No hay clases programadas</h4>
          <p style="margin:0; font-size:0.88rem;">El docente ${teacher.name} no tiene secuencias didácticas registradas para esta fecha.</p>
        </div>
      `;
    } else {
      classesHtml = classes.map((cls, idx) => {
        const topic = cls.topic || cls.curriculum?.topic || 'Sin tema registrado';
        const achievement = cls.achievement || cls.curriculum?.achievement || '';
        const dba = cls.dba || cls.curriculum?.dba || '';
        const subject = cls.subject || cls.subjectName || 'Asignatura';
        const grade = cls.grade || cls.gradeName || '';
        const time = cls.time || `${cls.startTime || ''} - ${cls.endTime || ''}`.trim() || 'Horario regular';
        // Generar ID estable si no existe: combina fecha, materia, grado y índice
        const clsId = cls.id || cls._id || `${dateStr.replace(/-/g,'')}_${subject.replace(/\s+/g,'')}_${grade.replace(/\s+/g,'')}_${idx}`;
        cls.id = clsId;
        window.__classIdMap = window.__classIdMap || {};
        window.__classIdMap[clsId] = idx;


        return `
          <div class="coord-class-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1rem; box-shadow:0 2px 4px rgba(0,0,0,0.04);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem; flex-wrap:wrap; gap:8px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="background:#eff6ff; color:#1d4ed8; font-weight:800; font-size:0.95rem; padding:3px 10px; border-radius:6px; border:1px solid #bfdbfe;">
                    ${subject} ${grade}
                  </span>
                  <span style="font-size:0.83rem; font-weight:700; color:#64748b;">
                    ⏰ ${time}
                  </span>
                  ${cls.dayNumber ? `<span style="font-size:0.8rem; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:4px; font-weight:600;">Clase #${cls.dayNumber}</span>` : ''}
                </div>
                <h4 style="margin:0.5rem 0 0.25rem 0; font-size:1.02rem; font-weight:800; color:#0f172a;">
                  ${topic}
                </h4>
                ${achievement ? `
                  <div style="font-size:0.84rem; color:#334155; margin-top:4px; line-height:1.4;">
                    <strong>Desempeño:</strong> ${achievement}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Acciones requeridas por Coordinación: Ver Cuaderno, Ver Tabla de Secuencia, Descargar -->
            <div style="display:flex; flex-wrap:wrap; gap:0.6rem; margin-top:1rem; padding-top:0.85rem; border-top:1px solid #f1f5f9;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.openClassNotebookReader('${tid}', '${dateStr}', ${idx})" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; color:#1e40af; background:#eff6ff; border-color:#bfdbfe;">
                📖 Ver Cuaderno Docente
              </button>

              <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.inspectPlan('${tid}', '${dateStr}', ${idx})" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; color:#0f766e; background:#f0fdfa; border-color:#99f6e4;">
                📋 Ver Tabla de Secuencia Didáctica
              </button>

              <button type="button" class="btn btn-primary btn-sm" onclick="CoordinatorView.downloadTeacherDocx('${tid}', '${dateStr}')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
                📄 Descargar Word (.docx)
              </button>

              <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.downloadTeacherPdf('${tid}', '${dateStr}')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
                🖨️ Descargar PDF
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    const review = plan?.coordinatorReview || {};

    modal.innerHTML = `
      <div class="coordinator-modal-card" style="max-width:850px; max-height:92vh; display:flex; flex-direction:column;">
        <div class="coordinator-modal-header" style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:1.25rem 1.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:42px; height:42px; border-radius:50%; background:#eff6ff; color:#1d4ed8; display:flex; align-items:center; justify-content:center; font-size:1.3rem; border:1px solid #bfdbfe;">
              🎓
            </div>
            <div>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#0f172a;">
                Planeaciones del Día: ${dayName}, ${formattedDate}
              </h3>
              <div style="font-size:0.83rem; color:#64748b; margin-top:2px;">
                Docente titular: <strong>${teacher.name}</strong> • ${classes.length} clase(s) programada(s)
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button type="button" class="btn-close-modal" onclick="document.getElementById('coordinator-day-classes-modal')?.remove()">&times;</button>
          </div>
        </div>

        <div style="flex:1; overflow-y:auto; padding:1.5rem; background:#f8fafc;">
          ${classesHtml}

          <!-- Sección de Visto Bueno y Observaciones de Coordinación -->
          <div style="background:#ffffff; border:1.5px solid #bbf7d0; border-radius:12px; padding:1.25rem; margin-top:1.25rem;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:0.75rem;">
              <span style="font-size:1.2rem;">✍️</span>
              <h4 style="margin:0; font-size:0.95rem; font-weight:800; color:#166534;">
                Visto Bueno Pedagógico & Observaciones de Coordinación
              </h4>
            </div>

            <textarea id="coord-day-notes" class="form-input" rows="3" placeholder="Escribe aquí tus observaciones pedagógicas o recomendaciones para el docente..." style="width:100%; box-sizing:border-box; font-size:0.88rem; line-height:1.45; border-radius:8px; margin-bottom:0.75rem;">${review.notes || ''}</textarea>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <div style="font-size:0.8rem; color:#64748b;">
                ${review.status === 'approved' ? `✅ Visto Bueno emitido el ${new Date(review.reviewedAt || Date.now()).toLocaleDateString()}` : 'Aún sin visto bueno oficial'}
              </div>

              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.saveDayReview('${tid}', '${dateStr}', 'needs_review')" style="font-weight:700; color:#b45309; border-color:#fde68a; background:#fffbeb;">
                  ⚠️ Solicitar Ajuste
                </button>
                <button type="button" class="btn btn-primary btn-sm" onclick="CoordinatorView.saveDayReview('${tid}', '${dateStr}', 'approved')" style="font-weight:700; background:#059669; border-color:#059669;">
                  ✅ Emitir Visto Bueno Oficial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  /**
   * Visor de lectura limpio del Cuaderno Docente para Coordinación (Solo Lectura)
   */
  openClassNotebookReader(teacherId, dateStr, classIndex) {
    const tid = teacherId || 'usr_manuel';
    const { classes } = this._getPlanAndClasses(tid, dateStr);
    const cls = classes[classIndex] || {};
    const subject = cls.subject || cls.subjectName || 'Clase';
    const grade = cls.grade || cls.gradeName || '';
    const topic = cls.topic || cls.curriculum?.topic || 'Sin tema';

    let contentHtml = cls.notebookContent;
    if (!contentHtml || contentHtml.trim().length < 20) {
      const ped = cls.pedagogy || {};
      contentHtml = `
        <div style="font-family:'Segoe UI', sans-serif; padding:1.5rem; line-height:1.6; color:#1e293b;">
          <h3 style="color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:6px; margin-top:0;">1. Fase de Inicio / Saberes Previos</h3>
          <p>${ped.inicio || 'No especificado'}</p>
          <h3 style="color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:6px; margin-top:1.5rem;">2. Fase de Desarrollo / Conceptualización</h3>
          <p>${ped.desarrollo || 'No especificado'}</p>
          <h3 style="color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:6px; margin-top:1.5rem;">3. Fase de Cierre / Evaluación Formativa</h3>
          <p>${ped.cierre || 'No especificado'}</p>
          ${ped.recursos ? `<h3 style="color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:6px; margin-top:1.5rem;">Recursos Didácticos</h3><p>${ped.recursos}</p>` : ''}
        </div>
      `;
    }

    const existing = document.getElementById('coordinator-notebook-reader-modal');
    if (existing) existing.remove();

    const readerModal = document.createElement('div');
    readerModal.id = 'coordinator-notebook-reader-modal';
    readerModal.className = 'coordinator-modal-backdrop active';
    readerModal.style.zIndex = '3700'; // AL FRENTE (Por encima del modal de clases en 3100)
    readerModal.innerHTML = `
      <div class="coordinator-modal-card" style="max-width:920px; height:92vh; display:flex; flex-direction:column; box-shadow:0 25px 60px rgba(0,0,0,0.5);">
        <div class="coordinator-modal-header" style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:1rem 1.5rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.3rem;">📖</span>
            <div>
              <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:#0f172a;">
                Cuaderno Pedagógico: ${subject} ${grade}
              </h3>
              <div style="font-size:0.8rem; color:#64748b;">
                ${dateStr} • Tema: ${topic}
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button type="button" class="btn btn-primary btn-sm" onclick="CoordinatorView.downloadTeacherDocx('${tid}', '${dateStr}')">
              📄 Descargar Word
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.downloadTeacherPdf('${tid}', '${dateStr}')">
              🖨️ Descargar PDF
            </button>
            <button type="button" class="btn-close-modal" onclick="document.getElementById('coordinator-notebook-reader-modal')?.remove()" title="Cerrar cuaderno y volver">&times;</button>
          </div>
        </div>

        <div style="flex:1; overflow-y:auto; padding:2rem; background:#cbd5e1; display:flex; justify-content:center;">
          <div style="background:#ffffff; width:100%; max-width:820px; min-height:100%; box-shadow:0 8px 25px rgba(0,0,0,0.15); border-radius:4px; padding:2.5rem; box-sizing:border-box;">
            ${contentHtml}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(readerModal);
  },

  /**
   * Guarda y sincroniza el Visto Bueno oficial de Coordinación
   */
  async saveDayReview(teacherId, dateStr, status = 'approved') {
    const notes = document.getElementById('coord-day-notes')?.value.trim() || '';
    const reviewData = {
      status,
      notes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Marisol Ruiz'
    };

    if (typeof UserService !== 'undefined' && UserService.saveCoordinatorReview) {
      UserService.saveCoordinatorReview(teacherId, dateStr, reviewData);
    }
    if (typeof PlanRepository !== 'undefined') {
      const plan = PlanRepository.getPlan(teacherId, dateStr) || { date: dateStr, classes: [] };
      plan.coordinatorReview = reviewData;
      PlanRepository.savePlan(teacherId, dateStr, plan, { skipBroadcast: true });
    }

    if (typeof FirestoreService !== 'undefined' && FirestoreService.isReady()) {
      await FirestoreService.savePlanToCloud(teacherId, dateStr, { coordinatorReview: reviewData }).catch(() => {});
    }

    if (typeof App !== 'undefined') {
      App.showToast(status === 'approved' ? '¡Visto Bueno oficial emitido y sincronizado!' : 'Observación guardada con éxito.', 'success');
    }

    const modal = document.getElementById('coordinator-day-classes-modal');
    if (modal) modal.remove();
  },

  /**
   * Descarga la planeación de un docente en Word (.docx)
   */
  async downloadTeacherDocx(teacherId, dateStr, classIndexOrId = null) {
    const tid = teacherId || 'usr_manuel';
    const teacher = (typeof UserService !== 'undefined' && UserService.getUserById) 
      ? (UserService.getUserById(tid) || { name: 'Manuel Muñoz' }) 
      : { name: 'Manuel Muñoz' };

    let directClass = null;
    if (classIndexOrId && typeof classIndexOrId === 'string' && typeof ClassRepository !== 'undefined') {
      directClass = ClassRepository.getClass(classIndexOrId, tid);
      if (directClass) {
        if (!dateStr || dateStr !== directClass.date) {
          dateStr = directClass.date || dateStr || new Date().toISOString().split('T')[0];
        }
      }
    }

    let { plan, classes } = this._getPlanAndClasses(tid, dateStr);

    if (directClass) {
      const normClass = {
        ...directClass,
        date: directClass.date || dateStr,
        subject: directClass.subject || directClass.subjectName || 'Asignatura',
        grade: directClass.grade || directClass.gradeName || ''
      };
      plan = {
        ...plan,
        date: dateStr,
        subject: normClass.subject,
        grade: normClass.grade,
        classes: [normClass]
      };
      classes = [normClass];
    } else if (classIndexOrId !== null && classIndexOrId !== undefined && classIndexOrId !== '') {
      let found = null;
      if (!isNaN(Number(classIndexOrId))) {
        found = classes[Number(classIndexOrId)];
      } else {
        found = classes.find(c => c.id === classIndexOrId || c._id === classIndexOrId);
      }
      if (found) {
        plan = { ...plan, classes: [found] };
        classes = [found];
      }
    }

    if (!classes || classes.length === 0) {
      alert('Esta fecha no contiene clases registradas para exportar.');
      return;
    }

    try {
      App.showToast(`Generando Word oficial para ${teacher.name}...`, 'info');
      await DocxGenerator.downloadDocx(plan, teacher);
      App.showToast('¡Archivo Word (.docx) descargado exitosamente!', 'success');
    } catch (e) {
      console.error('Error al generar DOCX:', e);
      // Fallback HTML Word
      ExportService.exportToWord(plan, teacher);
    }
  },

  /**
   * Descarga o imprime la planeación de un docente en PDF
   */
  downloadTeacherPdf(teacherId, dateStr, classIndexOrId = null) {
    const tid = teacherId || 'usr_manuel';
    const teacher = (typeof UserService !== 'undefined' && UserService.getUserById) 
      ? (UserService.getUserById(tid) || { name: 'Manuel Muñoz' }) 
      : { name: 'Manuel Muñoz' };

    let directClass = null;
    if (classIndexOrId && typeof classIndexOrId === 'string' && typeof ClassRepository !== 'undefined') {
      directClass = ClassRepository.getClass(classIndexOrId, tid);
      if (directClass) {
        if (!dateStr || dateStr !== directClass.date) {
          dateStr = directClass.date || dateStr || new Date().toISOString().split('T')[0];
        }
      }
    }

    let { plan, classes } = this._getPlanAndClasses(tid, dateStr);

    if (directClass) {
      const normClass = {
        ...directClass,
        date: directClass.date || dateStr,
        subject: directClass.subject || directClass.subjectName || 'Asignatura',
        grade: directClass.grade || directClass.gradeName || ''
      };
      plan = {
        ...plan,
        date: dateStr,
        subject: normClass.subject,
        grade: normClass.grade,
        classes: [normClass]
      };
      classes = [normClass];
    } else if (classIndexOrId !== null && classIndexOrId !== undefined && classIndexOrId !== '') {
      let found = null;
      if (!isNaN(Number(classIndexOrId))) {
        found = classes[Number(classIndexOrId)];
      } else {
        found = classes.find(c => c.id === classIndexOrId || c._id === classIndexOrId);
      }
      if (found) {
        plan = { ...plan, classes: [found] };
        classes = [found];
      }
    }

    if (!classes || classes.length === 0) {
      alert('Esta fecha no contiene clases registradas para imprimir.');
      return;
    }

    ExportService.exportToPdf(plan, teacher);
  },

  /**
   * Modal de Retroalimentación y Visto Bueno Pedagógico de Coordinación
   */
  openFeedbackModal(teacherId, dateStr) {
    const teacher = UserService.getUserById(teacherId);
    const plans = UserService.getTeacherPlans(teacherId);
    const plan = plans[dateStr] || {};
    const currentReview = plan.coordinatorReview || {};

    const modal = document.createElement('div');
    modal.className = 'coordinator-modal-backdrop active';
    modal.style.zIndex = '3500';
    modal.innerHTML = `
      <div class="coordinator-modal-card" style="max-width:560px;">
        <div class="coordinator-modal-header">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.3rem;">✍️</span>
            <div>
              <h3 style="margin:0; font-size:1.1rem; color:var(--slate-900);">
                Visto Bueno Pedagógico & Retroalimentación
              </h3>
              <div style="font-size:0.8rem; color:var(--slate-500);">
                Docente: <strong>${teacher.name}</strong> • Fecha: <strong>${dateStr}</strong>
              </div>
            </div>
          </div>
          <button type="button" class="btn-close-modal" onclick="this.closest('.coordinator-modal-backdrop').remove()">&times;</button>
        </div>

        <div style="padding:1.25rem 1.5rem;">
          <form id="coord-feedback-form" onsubmit="CoordinatorView.handleSaveFeedback(event, '${teacherId}', '${dateStr}')">
            <!-- Estado de la Planeación -->
            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-weight:700; color:var(--slate-800);">Concepto de Coordinación Académica:</label>
              <select id="coord-feedback-status" class="form-select" style="font-weight:600;">
                <option value="approved" ${currentReview.status === 'approved' ? 'selected' : ''}>✅ Aprobado / Visto Bueno Oficial</option>
                <option value="approved_with_notes" ${currentReview.status === 'approved_with_notes' ? 'selected' : ''}>⚠️ Aprobado con Observaciones y Recomendaciones</option>
                <option value="needs_revision" ${currentReview.status === 'needs_revision' ? 'selected' : ''}>❌ Requiere Ajustes / Corrección de Planeación</option>
              </select>
            </div>

            <!-- Observaciones Pedagógicas -->
            <div class="form-group" style="margin-bottom:1.25rem;">
              <label class="form-label" style="font-weight:700; color:var(--slate-800);">Observaciones y Recomendaciones Pedagógicas:</label>
              <textarea id="coord-feedback-comments" class="form-textarea" rows="4" placeholder="Escribe aquí la retroalimentación de la sesión (ej. Excelente articulación con los DBAs, reforzar la actividad de cierre, etc.)...">${currentReview.comments || ''}</textarea>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:0.75rem; font-size:0.78rem; color:#64748b; margin-bottom:1.25rem;">
              ℹ️ Este concepto y retroalimentación quedarán registrados con la firma digital de Coordinación y aparecerán estampados en el preparador oficial y las exportaciones a Word y PDF.
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.6rem;">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.coordinator-modal-backdrop').remove()">Cancelar</button>
              <button type="submit" class="btn btn-primary">💾 Guardar Visto Bueno</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  handleSaveFeedback(event, teacherId, dateStr) {
    event.preventDefault();
    const status = document.getElementById('coord-feedback-status')?.value || 'approved';
    const comments = document.getElementById('coord-feedback-comments')?.value || '';

    UserService.saveCoordinatorReview(teacherId, dateStr, { status, comments });
    
    // Cerrar modal
    const modal = event.target.closest('.coordinator-modal-backdrop');
    if (modal) modal.remove();

    App.showToast('¡Visto bueno y retroalimentación guardados con éxito!', 'success');
    this.renderDashboard();
  }
};

/**
 * MODAL DE GESTIÓN Y CREACIÓN DE USUARIOS / DOCENTES / COORDINADORES
 */
const UserManagerModal = {
  open() {
    let modal = document.getElementById('user-manager-modal');
    if (!modal) {
      this.createModalDOM();
      modal = document.getElementById('user-manager-modal');
    }
    this.renderUsersList();
    modal.classList.add('active');
  },

  close() {
    const modal = document.getElementById('user-manager-modal');
    if (modal) modal.classList.remove('active');
  },

  createModalDOM() {
    const div = document.createElement('div');
    div.id = 'user-manager-modal';
    div.className = 'coordinator-modal-backdrop';
    div.innerHTML = `
      <div class="coordinator-modal-card" style="max-width:820px;">
        <div class="coordinator-modal-header">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.3rem;">👥</span>
            <div>
              <h3 style="margin:0; font-size:1.15rem; color:var(--slate-900); font-weight:800;">
                Gestión de Docentes y Roles Institucionales
              </h3>
              <div style="font-size:0.8rem; color:var(--slate-500);">
                Crea y administra los perfiles de los docentes y del equipo de coordinación
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.6rem;">
            <button type="button" class="btn btn-primary btn-sm" onclick="UserManagerModal.openUserForm(null)">
              ➕ Nuevo Usuario
            </button>
            <button type="button" class="btn-close-modal" onclick="UserManagerModal.close()">&times;</button>
          </div>
        </div>

        <div style="padding:1.25rem 1.5rem; max-height:calc(92vh - 120px); overflow-y:auto;" id="user-manager-content">
          <!-- Renderizado dinámicamente -->
        </div>
      </div>
    `;
    document.body.appendChild(div);
  },

  renderUsersList() {
    const container = document.getElementById('user-manager-content');
    if (!container) return;

    const users = UserService.getAllUsers();
    const currentId = UserService.getCurrentUserId();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        ${users.map(u => {
          let roleBadge = '<span class="badge-role-teacher">👨‍🏫 Docente</span>';
          if (u.role === 'admin_teacher') roleBadge = '<span class="badge-role-admin">👑 Administrador / Docente</span>';
          if (u.role === 'coordinator') roleBadge = '<span class="badge-role-coordinator">🎓 Coordinación Académica</span>';

          const isCurrent = u.id === currentId;
          const subjects = (u.subjects && u.subjects.length > 0) ? u.subjects.map(s => s.name).join(', ') : 'Sin materias configuradas';

          return `
            <div class="user-item-row ${isCurrent ? 'is-active-user' : ''}">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div class="teacher-avatar" style="width:40px; height:40px; font-size:1rem; background:var(--primary-600); color:#fff;">
                  ${u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style="font-weight:700; font-size:0.95rem; color:var(--slate-900); display:flex; align-items:center; gap:6px;">
                    ${u.name}
                    ${roleBadge}
                    ${isCurrent ? '<span style="font-size:0.7rem; background:#ecfdf5; color:#065f46; padding:1px 6px; border-radius:10px; font-weight:700;">Sesión Activa</span>' : ''}
                  </div>
                  <div style="font-size:0.8rem; color:var(--slate-500); margin-top:2px;">
                    ${u.email || 'Sin correo'} • Dir. Grupo: <strong>${u.homeroom || 'Sin asignar'}</strong> • Materias: ${subjects}
                  </div>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:0.4rem;">
                ${!isCurrent ? `
                  <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:0.3rem 0.6rem;" onclick="UserManagerModal.switchActiveUser('${u.id}')" title="Iniciar sesión con este perfil">
                    🔄 Cambiar a este perfil
                  </button>
                ` : ''}
                <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:0.3rem 0.6rem;" onclick="UserManagerModal.openUserForm('${u.id}')" title="Editar perfil">
                  ✏️ Editar
                </button>
                ${u.id !== 'usr_manuel' ? `
                  <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:0.3rem 0.6rem; color:#dc2626;" onclick="UserManagerModal.deleteUser('${u.id}')" title="Eliminar usuario">
                    🗑️
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  switchActiveUser(userId) {
    UserService.setCurrentUser(userId);
    App.renderHeaderProfile();
    App.showToast(`Perfil cambiado a: ${UserService.getCurrentUser().name}`, 'success');
    this.close();
    // Actualizar vista
    if (UserService.getCurrentUser().role === 'coordinator') {
      CoordinatorView.openDashboard();
    } else {
      App.showCalendarView();
    }
  },

  deleteUser(userId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    UserService.deleteUser(userId);
    this.renderUsersList();
    App.showToast('Usuario eliminado', 'info');
  },

  openUserForm(userId = null) {
    const user = userId ? UserService.getUserById(userId) : {
      id: '',
      name: '',
      role: 'teacher',
      email: '',
      homeroom: '7°',
      institution: 'COLEGIO HOGAR MADRE DE DIOS',
      subjects: [{ name: 'Matemáticas', grades: ['7°'] }],
      grades: ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°'],
      weeklySchedule: {}
    };

    const isEdit = !!userId;

    const formModal = document.createElement('div');
    formModal.className = 'coordinator-modal-backdrop active';
    formModal.style.zIndex = '3600';
    formModal.innerHTML = `
      <div class="coordinator-modal-card" style="max-width:600px;">
        <div class="coordinator-modal-header">
          <h3 style="margin:0; font-size:1.1rem; color:var(--slate-900); font-weight:800;">
            ${isEdit ? 'Editar Perfil de Usuario' : '➕ Crear Nuevo Docente / Coordinador'}
          </h3>
          <button type="button" class="btn-close-modal" onclick="this.closest('.coordinator-modal-backdrop').remove()">&times;</button>
        </div>

        <div style="padding:1.25rem 1.5rem;">
          <form id="user-edit-form" onsubmit="UserManagerModal.handleSaveUser(event, '${user.id}')">
            <!-- Nombre Completo -->
            <div class="form-group" style="margin-bottom:0.9rem;">
              <label class="form-label" style="font-weight:700;">Nombre Completo del Docente / Funcionario:</label>
              <input type="text" id="form-user-name" class="form-input" value="${user.name || ''}" placeholder="Ej. Prof. María Rodríguez" required />
            </div>

            <!-- Rol Institucional -->
            <div class="form-group" style="margin-bottom:0.9rem;">
              <label class="form-label" style="font-weight:700;">Rol en la Institución:</label>
              <select id="form-user-role" class="form-select" style="font-weight:600;">
                <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>👨‍🏫 Docente (Planeación y Aula)</option>
                <option value="coordinator" ${user.role === 'coordinator' ? 'selected' : ''}>🎓 Coordinación Académica (Supervisión, Visto Bueno y Descarga)</option>
                <option value="admin_teacher" ${user.role === 'admin_teacher' ? 'selected' : ''}>👑 Administrador / Docente (Acceso Total)</option>
              </select>
            </div>

            <!-- Correo Institucional -->
            <div class="form-group" style="margin-bottom:0.9rem;">
              <label class="form-label" style="font-weight:700;">Correo Institucional:</label>
              <input type="email" id="form-user-email" class="form-input" value="${user.email || ''}" placeholder="usuario@hogarmadrededios.edu.co" />
            </div>

            <!-- Dirección de Grupo -->
            <div class="form-group" style="margin-bottom:0.9rem;">
              <label class="form-label" style="font-weight:700;">Dirección de Grupo (Homeroom):</label>
              <select id="form-user-homeroom" class="form-select">
                <option value="Sin dirección" ${user.homeroom === 'Sin dirección' ? 'selected' : ''}>Sin dirección de grupo</option>
                <option value="1°" ${user.homeroom === '1°' ? 'selected' : ''}>Grado 1°</option>
                <option value="2°" ${user.homeroom === '2°' ? 'selected' : ''}>Grado 2°</option>
                <option value="3°" ${user.homeroom === '3°' ? 'selected' : ''}>Grado 3°</option>
                <option value="4°A" ${user.homeroom === '4°A' ? 'selected' : ''}>Grado 4°A</option>
                <option value="4°B" ${user.homeroom === '4°B' ? 'selected' : ''}>Grado 4°B</option>
                <option value="5°" ${user.homeroom === '5°' ? 'selected' : ''}>Grado 5°</option>
                <option value="6°" ${user.homeroom === '6°' ? 'selected' : ''}>Grado 6°</option>
                <option value="7°" ${user.homeroom === '7°' ? 'selected' : ''}>Grado 7°</option>
                <option value="8°" ${user.homeroom === '8°' ? 'selected' : ''}>Grado 8°</option>
                <option value="9°" ${user.homeroom === '9°' ? 'selected' : ''}>Grado 9°</option>
                <option value="10°" ${user.homeroom === '10°' ? 'selected' : ''}>Grado 10°</option>
                <option value="11°" ${user.homeroom === '11°' ? 'selected' : ''}>Grado 11°</option>
                <option value="Supervisión General" ${user.homeroom === 'Supervisión General' ? 'selected' : ''}>Supervisión General (Coordinación)</option>
              </select>
            </div>

            <!-- Materias Principales (Texto separado por comas para rapidez) -->
            <div class="form-group" style="margin-bottom:1.25rem;">
              <label class="form-label" style="font-weight:700;">Materias que Imparte (separadas por coma):</label>
              <input type="text" id="form-user-subjects-str" class="form-input" value="${(user.subjects || []).map(s => s.name).join(', ')}" placeholder="Ej. Matemáticas, Geometría, Estadística" />
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.6rem;">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.coordinator-modal-backdrop').remove()">Cancelar</button>
              <button type="submit" class="btn btn-primary">💾 Guardar Perfil</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(formModal);
  },

  handleSaveUser(event, existingId) {
    event.preventDefault();
    const name = document.getElementById('form-user-name')?.value.trim();
    const role = document.getElementById('form-user-role')?.value || 'teacher';
    const email = document.getElementById('form-user-email')?.value.trim();
    const homeroom = document.getElementById('form-user-homeroom')?.value;
    const subjectsStr = document.getElementById('form-user-subjects-str')?.value.trim();

    if (!name) {
      alert('Por favor ingresa el nombre del docente.');
      return;
    }

    const subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean).map(s => ({
      name: s,
      grades: ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°']
    }));

    const existingUser = existingId ? UserService.getUserById(existingId) : {};

    const userData = {
      ...existingUser,
      id: existingId || ('usr_' + Date.now()),
      name,
      role,
      email,
      homeroom,
      institution: 'COLEGIO HOGAR MADRE DE DIOS',
      subjects: subjects.length > 0 ? subjects : (existingUser.subjects || []),
      grades: existingUser.grades || ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°'],
      weeklySchedule: existingUser.weeklySchedule || {}
    };

    UserService.saveUser(userData);

    const formModal = event.target.closest('.coordinator-modal-backdrop');
    if (formModal) formModal.remove();

    this.renderUsersList();
    App.renderHeaderProfile();
    App.showToast(`Usuario ${name} guardado correctamente`, 'success');
  }
};

window.CoordinatorView = CoordinatorView;
window.UserManagerModal = UserManagerModal;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoordinatorView;
}
