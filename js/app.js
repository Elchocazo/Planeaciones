/**
 * CONTROLADOR PRINCIPAL DE LA APLICACIÓN
 * Maneja navegación, onboarding, panel detallado de asignación académica (Materias vs Grados al frente) y modales
 */

const App = {
  activeView: 'calendar', // 'calendar' | 'planner'
  currentProfile: null,
  activeSettingsTab: 'matrix', // 'matrix' | 'profile' | 'grades'
  tempSubjectsList: [],
  tempGradesList: [],

  init() {
    this.currentProfile = StorageService.getProfile();

    // Limpieza y actualización al nuevo horario semanal oficial, 1° Periodo y mallas curriculares
    if (!localStorage.getItem('schedule_official_updated_v5')) {
      if (typeof UserService !== 'undefined') {
        const u = UserService.getUserById('usr_manuel');
        if (u) {
          u.period = '1°';
          u.weeklySchedule = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
          u.subjects = [
            { name: 'Matemáticas', grades: ['2°', '3°', '7°'] },
            { name: 'Sistemas', grades: ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°'] },
            { name: 'Lógica', grades: ['6°'] },
            { name: 'Robótica', grades: ['9°', '10°', '11°'] },
            { name: 'Dirección de grupo', grades: ['7°'] }
          ];
          UserService.saveUser(u);
        }
      }
      StorageService.saveProfile(DEFAULT_PROFILE);
      localStorage.setItem('schedule_official_updated_v5', 'true');
    }

    // Actualización oficial inmediata de la Malla Curricular de Robótica 10° (Pinza con Joystick)
    if (!localStorage.getItem('robotics_10_curriculum_updated_v1')) {
      if (typeof CurriculumService !== 'undefined') {
        const all = CurriculumService.getAllCurriculum();
        if (!all["1°"]) all["1°"] = {};
        if (!all["1°"]["Robótica"]) all["1°"]["Robótica"] = {};
        all["1°"]["Robótica"]["10°"] = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM["1°"]["Robótica"]["10°"]));
        CurriculumService.saveAllCurriculum(all);
      }
      localStorage.setItem('robotics_10_curriculum_updated_v1', 'true');
    }

    // Sincronización oficial de las mallas curriculares completas de todas las materias y periodos (1° a 4°)
    if (!localStorage.getItem('mallas_official_folder_synced_v13')) {
      if (typeof CurriculumService !== 'undefined') {
        CurriculumService.saveAllCurriculum(JSON.parse(JSON.stringify(DEFAULT_CURRICULUM)));
      }
      localStorage.setItem('mallas_official_folder_synced_v13', 'true');
    }

    // Unificación de bloques de 2 horas continuas de clase en una sola planeación (eliminación de redundancias)
    if (!localStorage.getItem('schedule_merge_consecutive_v2')) {
      if (typeof UserService !== 'undefined') {
        const u = UserService.getUserById('usr_manuel');
        if (u) {
          u.weeklySchedule = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
          UserService.saveUser(u);
        }
      }
      const prof = StorageService.getProfile();
      prof.weeklySchedule = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
      StorageService.saveProfile(prof);

      // Consolidar planeaciones existentes y re-secuenciar consecutivos
      if (typeof StorageService !== 'undefined') {
        const allPlans = StorageService.getAllPlans();
        let changed = false;
        Object.keys(allPlans).forEach(d => {
          const plan = allPlans[d];
          if (plan && Array.isArray(plan.classes)) {
            const beforeLen = plan.classes.length;
            plan.classes = StorageService.consolidateClasses(plan.classes);
            if (plan.classes.length !== beforeLen) changed = true;
          }
        });
        if (changed) {
          StorageService.saveAllPlans(allPlans);
          const startDate = StorageService.getAcademicStartDate();
          StorageService.syncAndLoadClassesFromStartDate(startDate);
        }
      }
      localStorage.setItem('schedule_merge_consecutive_v2', 'true');
    }

    // Intercambio de días manual: No ejecutar swapDayPlans automático en segundo plano
    // para respetar al 100% las ediciones manuales y la autonomía del docente sin alterar sus fechas.

    // Calibración y corroboración oficial del horario semanal (según imagen oficial)
    if (!localStorage.getItem('schedule_official_calibrated_v4')) {
      if (typeof UserService !== 'undefined') {
        const u = UserService.getUserById('usr_manuel');
        if (u) {
          u.weeklySchedule = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
          UserService.saveUser(u);
        }
      }
      const prof = StorageService.getProfile();
      prof.weeklySchedule = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
      StorageService.saveProfile(prof);

      // 2. Calibración y corroboración de etiquetas sin sobreescrituras destructivas
      if (typeof StorageService !== 'undefined') {
        const allPlans = StorageService.getAllPlans();
        let changed = false;
        Object.keys(allPlans).forEach(d => {
          const plan = allPlans[d];
          if (plan && Array.isArray(plan.classes)) {
            const dateParts = d.split('-').map(Number);
            const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const dayIndex = dateObj.getDay();

            // Corrección de Robótica 10° vs 11°
            plan.classes.forEach(cls => {
              if (cls.subject === 'Robótica') {
                if (dayIndex === 2 && cls.grade === '11°') {
                  cls.grade = '10°';
                  changed = true;
                } else if (dayIndex === 4 && cls.grade === '10°') {
                  cls.grade = '11°';
                  changed = true;
                }
              }
            });

            // Corrección de etiqueta dayOfWeek para que coincida con la fecha si no es un día cruzado
            const expectedDayName = (typeof ExportService !== 'undefined' && ExportService.getDayOfWeekName)
              ? ExportService.getDayOfWeekName(d)
              : '';
            const actualDays = [...new Set(plan.classes.map(c => c.dayOfWeek).filter(Boolean))];
            const hasClonedOtherDay = actualDays.length > 0 && expectedDayName && actualDays.every(day => day.toLowerCase() !== expectedDayName.toLowerCase());

            if (hasClonedOtherDay) {
              plan.classes.forEach(c => {
                c.dayOfWeek = expectedDayName;
                c.date = d;
              });
              changed = true;
            }
          }
        });
        if (changed) {
          StorageService.saveAllPlans(allPlans);
          const startDate = StorageService.getAcademicStartDate();
          StorageService.syncAndLoadClassesFromStartDate(startDate);
        }
      }
      localStorage.setItem('schedule_official_calibrated_v4', 'true');
    }

    // Inicializar componentes
    window.Calendar = new CalendarComponent('calendar-mount-point');
    window.Planner = new PlannerComponent('planner-mount-point');

    this.bindEvents();
    this.checkProfileOrOnboarding();
  },

  checkProfileOrOnboarding() {
    if (!this.currentProfile || !this.currentProfile.name) {
      this.openSettingsModal('profile', true); // Primer ingreso
    } else {
      this.renderHeaderProfile();
      this.showCalendarView();
    }
  },

  renderHeaderProfile() {
    const profile = StorageService.getProfile();
    if (!profile) return;

    this.currentProfile = profile;

    const teacherNameEl = document.getElementById('header-teacher-name');
    const teacherRoleEl = document.getElementById('header-teacher-role');
    const teacherHomeroomEl = document.getElementById('header-teacher-homeroom');
    const teacherHoursEl = document.getElementById('header-teacher-hours');
    const teacherAvatarEl = document.getElementById('header-teacher-avatar');
    const sidebarSubjectsListEl = document.getElementById('sidebar-subjects-list');

    if (teacherNameEl) teacherNameEl.textContent = profile.name || 'Docente';
    
    // Badge de rol
    if (teacherRoleEl) {
      if (profile.role === 'admin_teacher') {
        teacherRoleEl.className = 'role-badge badge-role-admin';
        teacherRoleEl.textContent = '👑 Admin / Docente';
      } else if (profile.role === 'coordinator') {
        teacherRoleEl.className = 'role-badge badge-role-coordinator';
        teacherRoleEl.textContent = '🎓 Coordinación';
      } else {
        teacherRoleEl.className = 'role-badge badge-role-teacher';
        teacherRoleEl.textContent = '👨‍🏫 Docente';
      }
    }

    if (teacherHomeroomEl) teacherHomeroomEl.textContent = profile.homeroom || 'Sin asignar';
    if (teacherHoursEl) teacherHoursEl.textContent = `${profile.dailyHours || 5} horas/día`;

    if (teacherAvatarEl) {
      const initials = (profile.name || 'D')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');
      teacherAvatarEl.textContent = initials || 'D';
    }

    // Visibilidad de botones según rol
    const btnCoord = document.getElementById('btn-coordinator-panel');
    const btnManageUsers = document.getElementById('btn-manage-users-header');

    if (btnCoord) {
      btnCoord.style.display = (profile.role === 'admin_teacher' || profile.role === 'coordinator') ? 'inline-flex' : 'none';
    }

    if (btnManageUsers) {
      btnManageUsers.style.display = (profile.role === 'admin_teacher') ? 'inline-flex' : 'none';
    }

    // Renderizar materias en la barra lateral
    if (sidebarSubjectsListEl) {
      if (profile.subjects && profile.subjects.length > 0) {
        sidebarSubjectsListEl.innerHTML = profile.subjects.map(subObj => {
          const name = typeof subObj === 'string' ? subObj : subObj.name;
          const grades = typeof subObj === 'object' && subObj.grades ? subObj.grades : [];
          const gradesPills = grades.length > 0
            ? grades.map(g => `<span>${this.escapeHtml(g)}</span>`).join('')
            : '<span style="color:var(--slate-400);">Ninguno</span>';

          return `
            <div class="subject-item-card">
              <div class="subject-item-name">
                <span class="subject-tag-dot"></span>
                ${this.escapeHtml(name)}
              </div>
              <div class="subject-item-grades">
                Grados: ${gradesPills}
              </div>
            </div>
          `;
        }).join('');
      } else {
        sidebarSubjectsListEl.innerHTML = `
          <div style="font-size:0.8rem; color:var(--slate-400); font-style:italic; padding:0.5rem 0;">
            ${profile.role === 'coordinator' ? 'Coordinación supervisa todas las asignaturas de la institución.' : 'Sin asignaturas asignadas.'}
          </div>
        `;
      }
    }
  },

  toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('user-switcher-dropdown');
    if (!menu) return;

    const isOpen = menu.classList.contains('show');
    if (isOpen) {
      menu.classList.remove('show');
      return;
    }

    const users = UserService.getAllUsers();
    const currentId = UserService.getCurrentUserId();

    menu.innerHTML = `
      <div style="padding:0.5rem 0.75rem; border-bottom:1px solid var(--slate-100); font-size:0.75rem; font-weight:700; color:var(--slate-400); text-transform:uppercase; letter-spacing:0.5px;">
        Cambiar Usuario / Rol Activo
      </div>
      <div style="max-height:280px; overflow-y:auto; padding:0.25rem 0;">
        ${users.map(u => {
          const isCurrent = u.id === currentId;
          let roleTag = '<span class="badge-role-teacher" style="font-size:0.68rem;">Docente</span>';
          if (u.role === 'admin_teacher') roleTag = '<span class="badge-role-admin" style="font-size:0.68rem;">Admin</span>';
          if (u.role === 'coordinator') roleTag = '<span class="badge-role-coordinator" style="font-size:0.68rem;">Coordinación</span>';

          return `
            <button type="button" class="dropdown-item ${isCurrent ? 'active-user-item' : ''}" onclick="App.switchUser('${u.id}')" style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; padding:0.5rem 0.75rem; width:100%; text-align:left;">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <div class="teacher-avatar" style="width:28px; height:28px; font-size:0.75rem; background:var(--primary-600); color:#fff;">
                  ${u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style="font-weight:700; font-size:0.85rem; color:var(--slate-800);">${u.name}</div>
                  <div style="font-size:0.72rem; color:var(--slate-400);">${u.homeroom || ''}</div>
                </div>
              </div>
              <div>${roleTag}</div>
            </button>
          `;
        }).join('')}
      </div>
      ${UserService.getCurrentUser().role === 'admin_teacher' ? `
        <div style="border-top:1px solid var(--slate-100); padding:0.4rem 0.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" style="width:100%; font-size:0.78rem; justify-content:center;" onclick="UserManagerModal.open(); document.getElementById('user-switcher-dropdown').classList.remove('show');">
            👥 Administrar Docentes & Roles
          </button>
        </div>
      ` : ''}
    `;

    menu.classList.add('show');
  },

  switchUser(userId) {
    if (this.activeView === 'planner' && window.Planner) {
      window.Planner.saveCurrentPlan(false);
    }
    UserService.setCurrentUser(userId);
    const menu = document.getElementById('user-switcher-dropdown');
    if (menu) menu.classList.remove('show');

    this.renderHeaderProfile();
    const user = UserService.getCurrentUser();
    this.showToast(`Has ingresado como: ${user.name}`, 'success');

    if (user.role === 'coordinator') {
      CoordinatorView.openDashboard();
    } else {
      this.showCalendarView();
    }
  },

  showCalendarView() {
    if (this.activeView === 'planner' && window.Planner && typeof window.Planner.flushPendingSave === 'function') {
      window.Planner.flushPendingSave();
    }
    if (this.activeView === 'notebook' && window.NotebookEditor) {
      window.NotebookEditor.saveCurrentNotebookContent(false);
    }
    this.activeView = 'calendar';
    const calendarViewEl = document.getElementById('calendar-view');
    const plannerViewEl = document.getElementById('planner-view');
    const notebookViewEl = document.getElementById('notebook-view');
    const mainHeaderEl = document.getElementById('app-main-header');

    if (calendarViewEl) calendarViewEl.style.display = 'grid';
    if (plannerViewEl) plannerViewEl.style.display = 'none';
    if (notebookViewEl) notebookViewEl.style.display = 'none';
    if (mainHeaderEl) mainHeaderEl.style.display = '';
    if (document?.body?.classList) document.body.classList.remove('notebook-mode');

    window.Calendar.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showPlannerView() {
    if (this.activeView === 'notebook' && window.NotebookEditor) {
      window.NotebookEditor.saveCurrentNotebookContent(false);
    }
    this.activeView = 'planner';
    const calendarViewEl = document.getElementById('calendar-view');
    const plannerViewEl = document.getElementById('planner-view');
    const notebookViewEl = document.getElementById('notebook-view');
    const mainHeaderEl = document.getElementById('app-main-header');

    if (calendarViewEl) calendarViewEl.style.display = 'none';
    if (notebookViewEl) notebookViewEl.style.display = 'none';
    if (plannerViewEl) plannerViewEl.style.display = 'block';
    if (mainHeaderEl) mainHeaderEl.style.display = '';
    if (document?.body?.classList) document.body.classList.remove('notebook-mode');

    if (window.Planner) {
      if (window.Planner.currentDateStr) {
        const freshPlan = StorageService.getPlanByDate ? StorageService.getPlanByDate(window.Planner.currentDateStr) : StorageService.getPlan(window.Planner.currentDateStr);
        if (freshPlan) {
          window.Planner.currentPlan = freshPlan;
        }
      }
      window.Planner.render();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openDayPlanner(dateStr) {
    if (window.Planner && typeof window.Planner.flushPendingSave === 'function') {
      window.Planner.flushPendingSave();
    }
    if (this.activeView === 'notebook' && window.NotebookEditor) {
      window.NotebookEditor.saveCurrentNotebookContent(false);
    }
    this.activeView = 'planner';
    const calendarViewEl = document.getElementById('calendar-view');
    const plannerViewEl = document.getElementById('planner-view');
    const notebookViewEl = document.getElementById('notebook-view');
    const mainHeaderEl = document.getElementById('app-main-header');

    if (calendarViewEl) calendarViewEl.style.display = 'none';
    if (notebookViewEl) notebookViewEl.style.display = 'none';
    if (plannerViewEl) plannerViewEl.style.display = 'block';
    if (mainHeaderEl) mainHeaderEl.style.display = '';
    if (document?.body?.classList) document.body.classList.remove('notebook-mode');

    window.Planner.loadDate(dateStr);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openNotebookEditorView(classIndex) {
    if (window.Planner && typeof window.Planner.flushPendingSave === 'function') {
      window.Planner.flushPendingSave();
    }
    this.activeView = 'notebook';
    const calendarViewEl = document.getElementById('calendar-view');
    const plannerViewEl = document.getElementById('planner-view');
    const notebookViewEl = document.getElementById('notebook-view');
    const mainHeaderEl = document.getElementById('app-main-header');

    if (calendarViewEl) calendarViewEl.style.display = 'none';
    if (plannerViewEl) plannerViewEl.style.display = 'none';
    if (notebookViewEl) notebookViewEl.style.display = 'block';
    if (mainHeaderEl) mainHeaderEl.style.display = 'none';
    document.body.classList.add('notebook-mode');

    if (window.NotebookEditor) {
      window.NotebookEditor.openInPage(classIndex);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  // =========================================================================
  // MODAL PRINCIPAL DE CONFIGURACIONES Y ASIGNACIÓN DE MATERIAS VS GRADOS
  // =========================================================================
  openSettingsModal(defaultTab = 'matrix', isOnboarding = false) {
    const profile = StorageService.getProfile();
    this.tempSubjectsList = JSON.parse(JSON.stringify(profile.subjects || []));
    this.tempGradesList = JSON.parse(JSON.stringify(profile.grades || ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°']));

    const modalBackdrop = document.getElementById('settings-modal-backdrop');
    const closeBtn = document.getElementById('btn-close-settings-modal');
    const titleEl = document.getElementById('settings-modal-title');

    if (closeBtn) closeBtn.style.display = isOnboarding ? 'none' : 'block';
    if (titleEl) {
      titleEl.textContent = isOnboarding 
        ? '¡Bienvenido(a)! Configuración Inicial del Docente'
        : 'Configuración y Asignación de Materias por Grado';
    }

    // Cargar datos de perfil general
    document.getElementById('input-profile-name').value = profile.name || '';
    document.getElementById('input-profile-institution').value = profile.institution || '';
    document.getElementById('input-profile-hours').value = profile.dailyHours || 5;
    const startDateInput = document.getElementById('input-profile-start-date');
    if (startDateInput) {
      startDateInput.value = profile.academicStartDate || StorageService.getAcademicStartDate();
    }

    // Selector de Dirección de Grupo
    this.updateHomeroomDropdown(profile.homeroom);

    // Días de la semana
    const dayCheckboxes = document.querySelectorAll('.profile-workday-cb');
    dayCheckboxes.forEach(cb => {
      cb.checked = (profile.workDays || []).includes(cb.value);
    });

    this.switchSettingsTab(defaultTab);
    if (modalBackdrop) modalBackdrop.classList.add('active');
  },

  closeSettingsModal() {
    const modalBackdrop = document.getElementById('settings-modal-backdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  },

  switchSettingsTab(tabName) {
    this.activeSettingsTab = tabName;

    // Actualizar botones de pestaña
    document.querySelectorAll('.modal-nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Actualizar paneles
    document.getElementById('tab-panel-matrix').style.display = tabName === 'matrix' ? 'block' : 'none';
    document.getElementById('tab-panel-profile').style.display = tabName === 'profile' ? 'block' : 'none';
    document.getElementById('tab-panel-grades').style.display = tabName === 'grades' ? 'block' : 'none';

    if (tabName === 'matrix') this.renderMatrixPanel();
    if (tabName === 'grades') this.renderGradesManagementPanel();
  },

  updateHomeroomDropdown(selectedVal = '') {
    const select = document.getElementById('input-profile-homeroom');
    if (!select) return;

    select.innerHTML = `
      <option value="">Sin asignar / No aplica</option>
      ${this.tempGradesList.map(g => `<option value="${g}" ${g === selectedVal ? 'selected' : ''}>${g}</option>`).join('')}
    `;
  },

  // =========================================================================
  // RENDERIZADO DEL PANEL MATRICIAL: MATERIA (IZQUIERDA) VS GRADOS (AL FRENTE)
  // =========================================================================
  renderMatrixPanel() {
    const container = document.getElementById('matrix-table-body');
    if (!container) return;

    if (this.tempSubjectsList.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center; padding:2rem; color:var(--slate-400);">
            No tienes materias configuradas. Agrega una nueva materia abajo.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = this.tempSubjectsList.map((sub, sIdx) => {
      const subName = typeof sub === 'string' ? sub : sub.name;
      const assignedGrades = typeof sub === 'object' && sub.grades ? sub.grades : [];
      const count = assignedGrades.length;
      const countLabel = count === 1 ? '1 grado asignado' : `${count} grados asignados`;

      // Cuadrícula de chips de grados al frente
      const gradesChipsHtml = this.tempGradesList.map(grd => {
        const isSelected = assignedGrades.includes(grd);
        return `
          <button type="button" 
                  class="matrix-grade-chip ${isSelected ? 'active' : ''}" 
                  onclick="App.toggleMatrixGrade(${sIdx}, '${grd}')"
                  title="${isSelected ? 'Quitar ' + grd : 'Asignar ' + grd}">
            ${this.escapeHtml(grd)}
          </button>
        `;
      }).join('');

      return `
        <tr class="matrix-row">
          <!-- Columna Izquierda: Materia -->
          <td class="matrix-subject-cell">
            <div class="matrix-subject-header">
              <input type="text" 
                     class="matrix-subject-input" 
                     value="${this.escapeHtml(subName)}" 
                     placeholder="Nombre de la materia"
                     onchange="App.updateMatrixSubjectName(${sIdx}, this.value)" />
            </div>
            <div class="matrix-subject-meta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>${countLabel}</span>
            </div>
          </td>

          <!-- Columna Al Frente: Selector visual de Grados -->
          <td class="matrix-grades-cell">
            <div class="matrix-quick-actions">
              <span style="font-size:0.75rem; font-weight:700; color:var(--slate-500); margin-right:0.25rem;">Atajos:</span>
              <button type="button" class="btn-quick-grade" onclick="App.setGradesPreset(${sIdx}, 'all')">Todos</button>
              <button type="button" class="btn-quick-grade" onclick="App.setGradesPreset(${sIdx}, 'primary')">Primaria (1°-5°)</button>
              <button type="button" class="btn-quick-grade" onclick="App.setGradesPreset(${sIdx}, 'secondary')">Secundaria (6°-9°)</button>
              <button type="button" class="btn-quick-grade" onclick="App.setGradesPreset(${sIdx}, 'high')">Media (10°-11°)</button>
              <button type="button" class="btn-quick-grade" onclick="App.setGradesPreset(${sIdx}, 'none')">Limpiar</button>
            </div>
            <div class="matrix-grades-grid">
              ${gradesChipsHtml}
            </div>
          </td>

          <!-- Columna Acciones -->
          <td class="matrix-action-cell">
            <button type="button" class="btn-table-action" onclick="App.deleteMatrixSubject(${sIdx})" title="Eliminar materia">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateMatrixSubjectName(index, newName) {
    const val = newName.trim();
    if (!val) return;
    if (typeof this.tempSubjectsList[index] === 'string') {
      this.tempSubjectsList[index] = { name: val, grades: [...this.tempGradesList] };
    } else {
      this.tempSubjectsList[index].name = val;
    }
    this.renderMatrixPanel();
  },

  toggleMatrixGrade(subjectIndex, grade) {
    let sub = this.tempSubjectsList[subjectIndex];
    if (typeof sub === 'string') {
      sub = { name: sub, grades: [] };
      this.tempSubjectsList[subjectIndex] = sub;
    }
    if (!sub.grades) sub.grades = [];

    if (sub.grades.includes(grade)) {
      sub.grades = sub.grades.filter(g => g !== grade);
    } else {
      sub.grades.push(grade);
    }

    this.renderMatrixPanel();
  },

  setGradesPreset(subjectIndex, preset) {
    let sub = this.tempSubjectsList[subjectIndex];
    if (typeof sub === 'string') {
      sub = { name: sub, grades: [] };
      this.tempSubjectsList[subjectIndex] = sub;
    }

    if (preset === 'all') {
      sub.grades = [...this.tempGradesList];
    } else if (preset === 'none') {
      sub.grades = [];
    } else if (preset === 'primary') {
      sub.grades = this.tempGradesList.filter(g => ['1', '2', '3', '4', '5'].some(p => g.startsWith(p)));
    } else if (preset === 'secondary') {
      sub.grades = this.tempGradesList.filter(g => ['6', '7', '8', '9'].some(p => g.startsWith(p)));
    } else if (preset === 'high') {
      sub.grades = this.tempGradesList.filter(g => ['10', '11'].some(p => g.startsWith(p)));
    }

    this.renderMatrixPanel();
  },

  addNewMatrixSubject() {
    const input = document.getElementById('input-new-matrix-subject');
    if (!input) return;
    const val = input.value.trim();
    if (!val) {
      alert('Por favor ingresa un nombre para la nueva materia.');
      return;
    }

    this.tempSubjectsList.push({
      name: val,
      grades: [...this.tempGradesList]
    });

    input.value = '';
    this.renderMatrixPanel();
  },

  deleteMatrixSubject(index) {
    const subName = typeof this.tempSubjectsList[index] === 'string' ? this.tempSubjectsList[index] : this.tempSubjectsList[index].name;
    if (!confirm(`¿Seguro que deseas eliminar la materia "${subName}"?`)) return;
    this.tempSubjectsList.splice(index, 1);
    this.renderMatrixPanel();
  },

  // =========================================================================
  // GESTIÓN DE GRADOS INSTITUCIONALES
  // =========================================================================
  renderGradesManagementPanel() {
    const container = document.getElementById('grades-tags-container');
    if (!container) return;

    container.innerHTML = this.tempGradesList.map((grd, idx) => `
      <span class="tag-badge" style="font-size:0.95rem; padding:0.45rem 0.85rem; font-weight:700;">
        ${this.escapeHtml(grd)}
        <span class="btn-remove-tag" onclick="App.deleteInstitutionalGrade(${idx})" title="Eliminar grado">&times;</span>
      </span>
    `).join('');
  },

  addNewInstitutionalGrade() {
    const input = document.getElementById('input-new-grade-item');
    if (!input) return;
    const val = input.value.trim();
    if (!val) {
      alert('Ingresa el nombre o número del grado (ej. 4A, Transición, Jardín o 12°).');
      return;
    }

    if (!this.tempGradesList.includes(val)) {
      this.tempGradesList.push(val);
      this.updateHomeroomDropdown(document.getElementById('input-profile-homeroom')?.value);
    }

    input.value = '';
    this.renderGradesManagementPanel();
  },

  deleteInstitutionalGrade(index) {
    const gradeName = this.tempGradesList[index];
    if (!confirm(`¿Eliminar el grado "${gradeName}" de la lista institucional?`)) return;
    this.tempGradesList.splice(index, 1);

    // Quitar de las asignaciones de materias
    this.tempSubjectsList.forEach(sub => {
      if (sub.grades) {
        sub.grades = sub.grades.filter(g => g !== gradeName);
      }
    });

    this.updateHomeroomDropdown(document.getElementById('input-profile-homeroom')?.value);
    this.renderGradesManagementPanel();
  },

  // =========================================================================
  // GUARDAR TODAS LAS CONFIGURACIONES
  // =========================================================================
  saveAllSettings() {
    const name = document.getElementById('input-profile-name').value.trim();
    const institution = document.getElementById('input-profile-institution').value.trim();
    const homeroom = document.getElementById('input-profile-homeroom').value;
    const dailyHours = parseInt(document.getElementById('input-profile-hours').value, 10) || 5;

    if (!name) {
      alert('Por favor ingresa tu nombre completo en la pestaña de Perfil Docente.');
      this.switchSettingsTab('profile');
      return;
    }

    if (this.tempSubjectsList.length === 0) {
      alert('Por favor agrega al menos una materia.');
      this.switchSettingsTab('matrix');
      return;
    }

    const selectedDays = [];
    document.querySelectorAll('.profile-workday-cb:checked').forEach(cb => {
      selectedDays.push(cb.value);
    });

    if (selectedDays.length === 0) {
      alert('Por favor selecciona al menos un día laboral.');
      this.switchSettingsTab('profile');
      return;
    }

    const currentProf = StorageService.getProfile();
    const startDateEl = document.getElementById('input-profile-start-date');
    const academicStartDate = startDateEl && startDateEl.value ? startDateEl.value : (currentProf.academicStartDate || '2026-09-01');

    const profileData = {
      ...currentProf,
      name,
      role: 'Docente',
      institution,
      homeroom,
      academicStartDate,
      subjects: this.tempSubjectsList,
      grades: this.tempGradesList,
      workDays: selectedDays,
      dailyHours
    };

    StorageService.saveProfile(profileData);
    StorageService.setAcademicStartDate(academicStartDate);
    this.currentProfile = StorageService.getProfile();

    this.renderHeaderProfile();
    this.closeSettingsModal();

    if (this.activeView === 'planner' && window.Planner.currentDateStr) {
      window.Planner.loadDate(window.Planner.currentDateStr);
    } else {
      window.Calendar.render();
    }

    this.showToast('Configuraciones y materias guardadas con éxito', 'success');
  },

  setAcademicStartDate(dateStr) {
    if (!dateStr) return;
    StorageService.setAcademicStartDate(dateStr);
    this.currentProfile = StorageService.getProfile();
    this.showToast(`¡Primer Día de Clases (Clase 1) configurado en ${dateStr}!`, 'success');
    if (window.Calendar && window.Calendar.render) {
      window.Calendar.render();
    }
    if (this.activeView === 'planner' && window.Planner && window.Planner.currentDateStr) {
      window.Planner.loadDate(window.Planner.currentDateStr);
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => {
        if (typeof toast.remove === 'function') {
          toast.remove();
        } else if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2800);
  },

  bindEvents() {
    const importInput = document.getElementById('import-backup-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const success = StorageService.importBackup(evt.target.result);
          if (success) {
            this.showToast('Copia de seguridad restaurada con éxito', 'success');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            alert('Error al leer el archivo de respaldo. Asegúrate de que sea un JSON válido.');
          }
        };
        reader.readAsText(file);
      });
    }

    const newSubjectInput = document.getElementById('input-new-matrix-subject');
    if (newSubjectInput) {
      newSubjectInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addNewMatrixSubject();
        }
      });
    }

    const newGradeInput = document.getElementById('input-new-grade-item');
    if (newGradeInput) {
      newGradeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addNewInstitutionalGrade();
        }
      });
    }

    // Auto-guardado de seguridad al cerrar o recargar la pestaña
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('beforeunload', () => {
        if (this.activeView === 'planner' && window.Planner) {
          window.Planner.saveCurrentPlan(false);
        }
      });
      window.addEventListener('pagehide', () => {
        if (this.activeView === 'planner' && window.Planner) {
          window.Planner.saveCurrentPlan(false);
        }
      });
    }
  },

  // =========================================================================
  // CENTRO DE DESCARGAS SEMANALES Y DIARIAS (POR MATERIA, POR DÍA, CONSOLIDADO)
  // =========================================================================
  currentDownloadDate: '',
  currentDownloadTab: 'subject',

  openDownloadCenter(dateStr, initialTab = 'subject') {
    if (!dateStr) {
      dateStr = (window.Planner && window.Planner.currentDateStr) ? window.Planner.currentDateStr : new Date().toISOString().split('T')[0];
    }
    this.currentDownloadDate = dateStr;
    this.currentDownloadTab = initialTab || 'subject';

    const modal = document.getElementById('day-download-modal-backdrop');
    const datePicker = document.getElementById('day-download-date-picker');
    if (datePicker) {
      datePicker.value = dateStr;
    }
    this.renderDayDownloadContent();
    if (modal) modal.classList.add('active');
  },

  openDayDownloadModal(dateStr) {
    this.openDownloadCenter(dateStr, 'subject');
  },

  closeDayDownloadModal() {
    const modal = document.getElementById('day-download-modal-backdrop');
    if (modal) modal.classList.remove('active');
  },

  navigateDownloadWeek(direction) {
    const parts = (this.currentDownloadDate || new Date().toISOString().split('T')[0]).split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + (direction * 7));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this.currentDownloadDate = `${y}-${m}-${day}`;
    const datePicker = document.getElementById('day-download-date-picker');
    if (datePicker) {
      datePicker.value = this.currentDownloadDate;
    }
    this.renderDayDownloadContent();
  },

  switchDownloadTab(tabName) {
    this.currentDownloadTab = tabName;
    this.renderDayDownloadContent();
  },

  onDayDownloadDateChange(newDateStr) {
    if (!newDateStr) return;
    this.currentDownloadDate = newDateStr;
    this.renderDayDownloadContent();
  },

  openPlannerForDownloadDate() {
    const dateStr = this.currentDownloadDate;
    this.closeDayDownloadModal();
    this.openDayPlanner(dateStr);
  },

  renderDayDownloadContent() {
    const container = document.getElementById('day-download-content-area');
    const titleEl = document.getElementById('day-download-date-title');
    if (!container) return;

    const activeDate = this.currentDownloadDate;
    const weekDates = ExportService.getWeekDates ? ExportService.getWeekDates(activeDate) : [];
    const weekRange = ExportService.getWeekRange(activeDate);
    const dayOfWeek = ExportService.getDayOfWeekName(activeDate);
    const formattedDate = ExportService.formatDate(activeDate);

    if (titleEl) {
      titleEl.innerHTML = `
        <span style="display:inline-block;">📅 <strong>Semana:</strong> ${weekRange.start.split(' de ')[0]} al ${weekRange.end}</span>
        <span style="font-size:0.75rem; color:var(--slate-500); display:block;">Día activo: ${dayOfWeek}, ${formattedDate}</span>
      `;
    }

    // Actualizar botones de pestañas
    const tabSubjectBtn = document.getElementById('tab-btn-by-subject');
    const tabDayBtn = document.getElementById('tab-btn-by-day');
    const tabClassesBtn = document.getElementById('tab-btn-all-classes');

    if (tabSubjectBtn) tabSubjectBtn.classList.toggle('active', this.currentDownloadTab === 'subject');
    if (tabDayBtn) tabDayBtn.classList.toggle('active', this.currentDownloadTab === 'day');
    if (tabClassesBtn) tabClassesBtn.classList.toggle('active', this.currentDownloadTab === 'classes');

    // Cargar todas las clases de la semana de lunes a viernes
    const weekData = [];
    let totalWeekClasses = 0;

    weekDates.forEach(dStr => {
      const p = StorageService.getPlanByDate(dStr);
      const clsList = (p && p.classes) ? p.classes.map(c => ({
        ...c,
        date: c.date || dStr,
        dayOfWeek: c.dayOfWeek || ExportService.getDayOfWeekName(dStr)
      })) : [];
      totalWeekClasses += clsList.length;
      weekData.push({
        date: dStr,
        dayOfWeek: ExportService.getDayOfWeekName(dStr),
        plan: p,
        classes: clsList
      });
    });

    // Banner Superior: Consolidado Semanal Completo
    const weekBannerHtml = `
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #fff; border-radius: 8px; padding: 0.9rem 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 2px 8px rgba(37,99,235,0.2);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #bfdbfe; font-weight: 700;">Consolidado Institucional</div>
            <h3 style="margin: 2px 0 0 0; font-size: 1.05rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 6px;">
              🌟 Semana Completa de Clases (${totalWeekClasses} ${totalWeekClasses === 1 ? 'clase planeada' : 'clases planeadas'})
            </h3>
            <div style="font-size: 0.78rem; color: #e0f2fe; margin-top: 2px;">
              Descarga en un único documento oficial todas las asignaturas y sesiones de la semana (Lunes a Viernes).
            </div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn" onclick="App.downloadFullWeek('docx')" style="font-size: 0.82rem; font-weight: 700; background: #ffffff; color: #1e3a8a; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Semana a Word (.docx)
            </button>
            <button type="button" class="btn" onclick="App.downloadFullWeek('pdf')" style="font-size: 0.82rem; font-weight: 700; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.4); padding: 6px 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              PDF
            </button>
            <button type="button" class="btn" onclick="App.downloadFullWeek('preview')" style="font-size: 0.82rem; font-weight: 700; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.4); padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Vista previa de la hoja oficial">
              👁️
            </button>
          </div>
        </div>
      </div>
    `;

    // CONTENIDO SEGÚN PESTAÑA:
    let tabContentHtml = '';

    if (this.currentDownloadTab === 'subject') {
      // 1. Agrupar por Materia y Grado
      const subjectMap = {};
      weekData.forEach(wDay => {
        wDay.classes.forEach(c => {
          const key = `${(c.subject || 'Sin Asignatura').trim()}___${(c.grade || '').trim()}`;
          if (!subjectMap[key]) {
            subjectMap[key] = {
              subject: (c.subject || 'Sin Asignatura').trim(),
              grade: (c.grade || '').trim(),
              classes: []
            };
          }
          subjectMap[key].classes.push(c);
        });
      });

      const subjects = Object.values(subjectMap);

      if (subjects.length === 0) {
        tabContentHtml = `
          <div style="text-align: center; padding: 2.5rem 1rem; background: var(--slate-50); border: 1.5px dashed var(--slate-300); border-radius: 8px;">
            <div style="font-size: 2rem; margin-bottom: 0.4rem;">📚</div>
            <h4 style="color: var(--slate-700); margin-bottom: 0.3rem;">No hay clases registradas en esta semana</h4>
            <p style="font-size: 0.85rem; color: var(--slate-500); margin: 0 auto 1rem auto; max-width: 480px;">
              Aún no tienes planeaciones guardadas para los días de esta semana. Puedes ingresar al planeador para crear tus sesiones.
            </p>
            <button type="button" class="btn btn-primary btn-sm" onclick="App.openPlannerForDownloadDate()">
              ➕ Planear Clases de esta Semana
            </button>
          </div>
        `;
      } else {
        const subjectCards = subjects.map(subGroup => {
          const classItemsHtml = subGroup.classes.map((cls, cIdx) => {
            const cNum = cls.dayNumber ? `Clase ${cls.dayNumber}` : `Sesión ${cIdx + 1}`;
            const shortD = ExportService.formatShortDate(cls.date);
            const attsCount = (cls.attachments || []).length;
            const hasObs = cls.observations && cls.observations.trim();

            return `
              <div style="padding: 6px 10px; background: #fff; border: 1px solid var(--slate-200); border-radius: 6px; margin-bottom: 5px; font-size: 0.8rem; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-weight: 800; color: var(--primary-800); background: var(--primary-100); padding: 1px 6px; border-radius: 4px; font-size: 0.72rem;">${this.escapeHtml(cNum)}</span>
                    <strong style="color: var(--slate-700);">${this.escapeHtml(cls.dayOfWeek || '')} ${shortD}</strong>
                    ${cls.time ? `<span style="font-size: 0.72rem; color: var(--slate-500);">⏰ ${this.escapeHtml(cls.time)}</span>` : ''}
                  </div>
                  <div style="color: var(--slate-600); margin-top: 2px; line-height: 1.25;">
                    📌 ${this.escapeHtml(cls.topic || 'Sin tema')}
                  </div>
                  ${hasObs ? `<div style="font-size: 0.72rem; color: #92400e; margin-top: 2px;">📝 <em>${this.escapeHtml(cls.observations)}</em></div>` : ''}
                </div>
                ${attsCount > 0 ? `
                  <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    ${cls.attachments.map(att => `
                      <a href="${att.dataUrl}" download="${this.escapeHtml(att.name)}" class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 2px 6px; background: #f0fdf4; border-color: #86efac; color: #166534;" title="Descargar anexo: ${this.escapeHtml(att.name)}">
                        📎 ${this.escapeHtml(att.name.length > 15 ? att.name.substring(0,12) + '...' : att.name)}
                      </a>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('');

          return `
            <div style="background: #ffffff; border: 1.5px solid var(--primary-200); border-radius: 8px; padding: 1rem 1.1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; border-bottom: 1px solid var(--slate-100); padding-bottom: 6px;">
                <div>
                  <h4 style="margin: 0; color: var(--primary-900); font-size: 0.98rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                    📖 ${this.escapeHtml(subGroup.subject)}
                    ${subGroup.grade ? `<span style="font-size: 0.8rem; font-weight: 700; color: #4338ca; background: #eef2ff; border: 1px solid #c7d2fe; padding: 1px 7px; border-radius: 4px;">${this.escapeHtml(subGroup.grade)}</span>` : ''}
                    <span style="font-size: 0.75rem; font-weight: 600; color: var(--slate-500);">(${subGroup.classes.length} ${subGroup.classes.length === 1 ? 'sesión en la semana' : 'sesiones en la semana'})</span>
                  </h4>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <button type="button" class="btn btn-primary btn-sm" onclick="App.downloadWeekBySubject('${encodeURIComponent(subGroup.subject)}', '${encodeURIComponent(subGroup.grade)}', 'docx')" style="font-size: 0.78rem; padding: 4px 10px;" title="Descargar las clases de esta materia durante la semana en formato oficial Word">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    Word (.docx)
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="App.downloadWeekBySubject('${encodeURIComponent(subGroup.subject)}', '${encodeURIComponent(subGroup.grade)}', 'pdf')" style="font-size: 0.78rem; padding: 4px 10px;" title="Descargar o imprimir las clases de esta materia en PDF">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    PDF
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="App.downloadWeekBySubject('${encodeURIComponent(subGroup.subject)}', '${encodeURIComponent(subGroup.grade)}', 'preview')" style="font-size: 0.78rem; padding: 4px 8px;" title="Ver vista previa de la hoja oficial">
                    👁️
                  </button>
                </div>
              </div>
              <div>${classItemsHtml}</div>
            </div>
          `;
        }).join('');

        tabContentHtml = `
          <div style="margin-bottom: 0.75rem;">
            <p style="font-size: 0.82rem; color: var(--slate-600); margin: 0 0 8px 0;">
              Descarga la planeación semanal agrupada por <strong>asignatura</strong> (recomendado para entregar a coordinaciones o jefes de área):
            </p>
            <div style="max-height: 380px; overflow-y: auto; padding-right: 4px;">
              ${subjectCards}
            </div>
          </div>
        `;
      }
    } else if (this.currentDownloadTab === 'day') {
      // 2. Agrupar por Día de la Semana
      const dayCards = weekData.map(wDay => {
        const hasClasses = wDay.classes.length > 0;
        const shortD = ExportService.formatShortDate(wDay.date);

        const topicsList = hasClasses 
          ? wDay.classes.map(c => `• ${c.subject || 'Clase'} (${c.grade || ''}): ${c.topic || 'Sin tema'}`).slice(0, 3).join('<br/>')
          : '<em style="color:var(--slate-400);">Sin clases planificadas en este día</em>';

        return `
          <div style="background: ${hasClasses ? '#ffffff' : '#f8fafc'}; border: 1.5px solid ${hasClasses ? 'var(--primary-200)' : 'var(--slate-200)'}; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 220px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="color: var(--primary-900); font-size: 0.92rem;">
                  📅 ${this.escapeHtml(wDay.dayOfWeek)}, ${shortD}
                </strong>
                <span style="font-size: 0.75rem; font-weight: 700; background: ${hasClasses ? '#dcfce7' : '#f1f5f9'}; color: ${hasClasses ? '#15803d' : '#64748b'}; border: 1px solid ${hasClasses ? '#86efac' : '#cbd5e1'}; padding: 1px 7px; border-radius: 12px;">
                  ${wDay.classes.length} ${wDay.classes.length === 1 ? 'clase' : 'clases'}
                </span>
              </div>
              <div style="font-size: 0.78rem; color: var(--slate-600); margin-top: 4px; line-height: 1.3;">
                ${topicsList}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
              ${hasClasses ? `
                <button type="button" class="btn btn-primary btn-sm" onclick="App.downloadWeekByDay('${wDay.date}', 'docx')" style="font-size: 0.78rem; padding: 4px 10px;" title="Descargar todas las clases de este día en Word (.docx)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  Word
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.downloadWeekByDay('${wDay.date}', 'pdf')" style="font-size: 0.78rem; padding: 4px 10px;" title="Descargar o imprimir PDF oficial de este día">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                  PDF
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.downloadWeekByDay('${wDay.date}', 'preview')" style="font-size: 0.78rem; padding: 4px 8px;" title="Ver vista previa de la hoja oficial">
                  👁️
                </button>
              ` : `
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.closeDayDownloadModal(); App.openDayPlanner('${wDay.date}');" style="font-size: 0.75rem; color: #047857;">
                  ➕ Planear este día
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');

      tabContentHtml = `
        <div style="margin-bottom: 0.75rem;">
          <p style="font-size: 0.82rem; color: var(--slate-600); margin: 0 0 8px 0;">
            Descarga la planeación diaria correspondiente a cada jornada de la semana:
          </p>
          <div style="max-height: 380px; overflow-y: auto; padding-right: 4px;">
            ${dayCards}
          </div>
        </div>
      `;
    } else {
      // 3. Clases Individuales y Guías
      const activePlan = StorageService.getPlanByDate(activeDate);
      const activeClasses = (activePlan && activePlan.classes) ? activePlan.classes : [];

      if (activeClasses.length === 0) {
        tabContentHtml = `
          <div style="text-align: center; padding: 2.5rem 1rem; background: var(--slate-50); border: 1.5px dashed var(--slate-300); border-radius: 8px;">
            <div style="font-size: 2rem; margin-bottom: 0.4rem;">🎯</div>
            <h4 style="color: var(--slate-700); margin-bottom: 0.3rem;">No hay clases en la fecha seleccionada (${activeDate})</h4>
            <p style="font-size: 0.85rem; color: var(--slate-500); margin: 0 auto 1rem auto; max-width: 480px;">
              Selecciona otra fecha en el calendario o abre el planeador para añadir clases y guías a este día.
            </p>
            <button type="button" class="btn btn-primary btn-sm" onclick="App.openPlannerForDownloadDate()">
              ➕ Planear Clases para este Día
            </button>
          </div>
        `;
      } else {
        const classItems = activeClasses.map((cls, idx) => {
          const classNum = cls.dayNumber ? `Clase ${cls.dayNumber}` : `Clase ${idx + 1}`;
          const atts = cls.attachments || [];

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #fff; border: 1px solid var(--slate-200); border-radius: 8px; margin-bottom: 8px; gap: 10px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 240px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
                  <span style="font-size: 0.78rem; font-weight: 800; background: var(--primary-100); color: var(--primary-800); padding: 2px 8px; border-radius: 12px;">
                    ${this.escapeHtml(classNum)}
                  </span>
                  <strong style="color: var(--slate-800); font-size: 0.9rem;">
                    ${this.escapeHtml(cls.subject || 'Asignatura')}
                  </strong>
                  <span style="font-size: 0.8rem; font-weight: 600; color: var(--slate-500); background: var(--slate-100); padding: 1px 6px; border-radius: 4px;">
                    ${this.escapeHtml(cls.grade || '')}
                  </span>
                  ${cls.time ? `<span style="font-size: 0.75rem; color: var(--primary-700); font-weight: 600;">⏰ ${this.escapeHtml(cls.time)}</span>` : ''}
                </div>
                <div style="font-size: 0.8rem; color: var(--slate-600); line-height: 1.3;" title="${this.escapeHtml(cls.topic || '')}">
                  📌 ${this.escapeHtml(cls.topic || 'Sin tema')}
                </div>
                ${cls.observations ? `<div style="font-size: 0.72rem; color: #92400e; margin-top: 3px;">📝 <strong>Obs:</strong> ${this.escapeHtml(cls.observations)}</div>` : ''}
                
                ${atts.length > 0 ? `
                  <div style="margin-top: 6px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: #047857;">📎 Guías y Anexos:</span>
                    ${atts.map(att => `
                      <a href="${att.dataUrl}" download="${this.escapeHtml(att.name)}" class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 1px 6px; background: #ecfdf5; border-color: #a7f3d0; color: #065f46;" title="Descargar anexo">
                        📥 ${this.escapeHtml(att.name)}
                      </a>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.downloadSingleClassFromModal(${idx}, 'docx')" title="Descargar esta clase en Word (.docx) oficial" style="font-size: 0.78rem; padding: 4px 9px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  Word
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.downloadSingleClassFromModal(${idx}, 'pdf')" title="Descargar / Imprimir esta clase en PDF" style="font-size: 0.78rem; padding: 4px 9px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                  PDF
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.downloadSingleClassFromModal(${idx}, 'preview')" title="Ver vista previa de la hoja oficial" style="font-size: 0.78rem; padding: 4px 7px;">
                  👁️
                </button>
              </div>
            </div>
          `;
        }).join('');

        tabContentHtml = `
          <div style="margin-bottom: 0.75rem;">
            <p style="font-size: 0.82rem; color: var(--slate-600); margin: 0 0 8px 0;">
              Descarga o visualiza individualmente cada clase y sus guías adjuntas para <strong>${dayOfWeek}, ${formattedDate}</strong>:
            </p>
            <div style="max-height: 380px; overflow-y: auto; padding-right: 4px;">
              ${classItems}
            </div>
          </div>
        `;
      }
    }

    container.innerHTML = `
      ${weekBannerHtml}
      ${tabContentHtml}
    `;
  },

  downloadFullWeek(format = 'docx') {
    ExportService.exportFullWeek(this.currentDownloadDate, format);
  },

  downloadWeekBySubject(encodedSubject, encodedGrade, format = 'docx') {
    const subject = decodeURIComponent(encodedSubject);
    const grade = decodeURIComponent(encodedGrade);
    ExportService.exportWeekBySubject(this.currentDownloadDate, subject, grade, format);
  },

  downloadWeekByDay(dateStr, format = 'docx') {
    const plan = StorageService.getPlanByDate(dateStr);
    const profile = StorageService.getProfile();
    if (!plan || !plan.classes || plan.classes.length === 0) {
      alert('No hay clases registradas para este día.');
      return;
    }
    if (format === 'preview') {
      ExportService.openLivePreview(plan, profile);
    } else if (format === 'pdf') {
      ExportService.exportToPdf(plan, profile);
    } else {
      ExportService.exportToWord(plan, profile);
    }
  },

  downloadSelectedDay(format = 'docx') {
    this.downloadWeekByDay(this.currentDownloadDate, format);
  },

  downloadSingleClassFromModal(classIdx, format = 'docx') {
    const dateStr = this.currentDownloadDate;
    const plan = StorageService.getPlanByDate(dateStr);
    const profile = StorageService.getProfile();
    if (!plan || !plan.classes || !plan.classes[classIdx]) {
      alert('La clase seleccionada no existe o no tiene datos.');
      return;
    }

    ExportService.exportSingleClass(plan, profile, classIdx, format);
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
