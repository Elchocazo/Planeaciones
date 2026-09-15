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
            <button type="button" class="btn btn-secondary btn-sm" onclick="UserManagerModal.open()" title="Crear y administrar perfiles de docentes">
              👥 Administrar Docentes
            </button>

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
    const summary = UserService.getAllTeachersAuditSummary(this.selectedPeriod);

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
                    const plan = plans[dateStr];
                    const count = plan.classes ? plan.classes.length : 0;
                    const review = plan.coordinatorReview;
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
   */
  inspectPlan(teacherId, dateStr) {
    const teacher = UserService.getUserById(teacherId);
    const plans = UserService.getTeacherPlans(teacherId);
    const plan = plans[dateStr];

    if (!plan || !plan.classes || plan.classes.length === 0) {
      alert('Esta fecha no contiene clases registradas.');
      return;
    }

    const htmlSheet = ExportService.generateHtmlSheet(plan, teacher);

    const inspectModal = document.createElement('div');
    inspectModal.className = 'coordinator-modal-backdrop active';
    inspectModal.style.zIndex = '3000';
    inspectModal.innerHTML = `
      <div class="coordinator-modal-card" style="max-width:980px; height:92vh;">
        <div class="coordinator-modal-header">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.2rem;">👁️</span>
            <div>
              <h3 style="margin:0; font-size:1.1rem; color:var(--slate-900);">
                Preparador Oficial: ${teacher.name}
              </h3>
              <div style="font-size:0.8rem; color:var(--slate-500);">
                Fecha: ${dateStr} • Periodo: ${plan.period || '3°'}
              </div>
            </div>
          </div>

          <div style="display:flex; gap:0.5rem;">
            <button type="button" class="btn btn-primary btn-sm" onclick="CoordinatorView.downloadTeacherDocx('${teacherId}', '${dateStr}')">
              📄 Descargar Word (.docx)
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.downloadTeacherPdf('${teacherId}', '${dateStr}')">
              🖨️ Imprimir / PDF
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="CoordinatorView.openFeedbackModal('${teacherId}', '${dateStr}'); this.closest('.coordinator-modal-backdrop').remove();">
              ✍️ Visto Bueno
            </button>
            <button type="button" class="btn-close-modal" onclick="this.closest('.coordinator-modal-backdrop').remove()">&times;</button>
          </div>
        </div>

        <div style="flex:1; overflow-y:auto; background:#f1f5f9; padding:1.5rem; display:flex; justify-content:center;">
          <div style="background:#fff; width:100%; max-width:850px; padding:2rem; box-shadow:0 4px 15px rgba(0,0,0,0.1); border-radius:4px;">
            ${htmlSheet}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(inspectModal);
  },

  /**
   * Descarga la planeación de un docente en Word (.docx)
   */
  async downloadTeacherDocx(teacherId, dateStr) {
    const teacher = UserService.getUserById(teacherId);
    const plans = UserService.getTeacherPlans(teacherId);
    const plan = plans[dateStr];

    if (!plan || !plan.classes || plan.classes.length === 0) {
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
  downloadTeacherPdf(teacherId, dateStr) {
    const teacher = UserService.getUserById(teacherId);
    const plans = UserService.getTeacherPlans(teacherId);
    const plan = plans[dateStr];

    if (!plan || !plan.classes || plan.classes.length === 0) {
      alert('Esta fecha no contiene clases registradas para imprimir.');
      return;
    }

    const htmlSheet = ExportService.generateHtmlSheet(plan, teacher);
    const printContainer = document.getElementById('printable-report');
    if (printContainer) {
      printContainer.innerHTML = htmlSheet;
      setTimeout(() => window.print(), 250);
    }
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
