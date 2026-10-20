/**
 * MÓDULO DE CALENDARIO MENSUAL (INICIO EN LUNES)
 */

class CalendarComponent {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    
    // Iniciar en el mes de la fecha activa (por defecto Octubre de 2026)
    const activeDate = (typeof AppState !== 'undefined' ? AppState.get('currentDate') : null) || 
                       (typeof localStorage !== 'undefined' ? localStorage.getItem('school_active_dashboard_date') : null) || 
                       new Date().toISOString().slice(0, 10);
    const dateParts = String(activeDate).split('-').map(Number);
    this.selectedYear = dateParts[0] || 2026;
    this.selectedMonth = (dateParts[1] ? dateParts[1] - 1 : 9); // 9 = Octubre (0-indexed)
    
    this.monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    this.init();
  }

  init() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleClassChange = () => {
        if (this.container && (this.container.offsetParent !== null || (document.getElementById('calendar-view') && document.getElementById('calendar-view').style.display !== 'none'))) {
          this.render();
        }
      };
      window.addEventListener('class_saved_locally', handleClassChange);
      window.addEventListener('class_session_saved', handleClassChange);
      window.addEventListener('class_session_deleted', handleClassChange);
      window.addEventListener('storage', handleClassChange);
    }
    this.render();
  }

  setMonth(year, month) {
    this.selectedYear = year;
    this.selectedMonth = month;
    this.render();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.render();
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.render();
  }

  goToToday() {
    const today = new Date();
    this.selectedYear = today.getFullYear();
    this.selectedMonth = today.getMonth();
    this.render();
  }

  render() {
    if (!this.container) {
      this.container = document.getElementById('calendar-mount-point');
    }
    if (!this.container) return;

    const isCoordinator = (typeof UserService !== 'undefined' && UserService.isCoordinatorActive()) ||
                          (typeof AuthModal !== 'undefined' && AuthModal.getSession()?.role === 'coordinator');

    const tid = isCoordinator ? 'usr_manuel' : ((typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : 'usr_manuel');

    let allPlans = {};
    if (typeof PlanRepository !== 'undefined' && PlanRepository.getAllPlans) {
      allPlans = PlanRepository.getAllPlans(tid);
    } else if (typeof StorageService !== 'undefined') {
      allPlans = StorageService.getAllPlans();
    }

    const profile = (typeof StorageService !== 'undefined' && StorageService.getProfile) ? StorageService.getProfile() : null;
    const workDays = profile?.workDays || ['1', '2', '3', '4', '5'];
    const academicStart = (typeof StorageService !== 'undefined' && StorageService.getAcademicStartDate) ? StorageService.getAcademicStartDate() : '2026-09-01';

    // Obtener TODAS las clases directamente desde ClassRepository (desacoplado y persistente)
    const allRepoClasses = (typeof ClassRepository !== 'undefined') ? ClassRepository.getAllClasses(tid) : [];
    const repoClassesByDate = {};
    allRepoClasses.forEach(cls => {
      if (cls.date) {
        if (!repoClassesByDate[cls.date]) repoClassesByDate[cls.date] = [];
        repoClassesByDate[cls.date].push(cls);
      }
    });

    // Primer día del mes
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 1);
    // Último día del mes
    const lastDayOfMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // En JS: 0=Domingo, 1=Lunes, ..., 6=Sábado.
    // Queremos que 0 sea Lunes y 6 sea Domingo:
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    // Días del mes anterior para rellenar
    const prevMonthLastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

    // Fecha de hoy
    const today = new Date();
    const isCurrentYearAndMonth = (today.getFullYear() === this.selectedYear && today.getMonth() === this.selectedMonth);

    let daysHtml = '';
    let monthlyPlansCount = 0;
    let monthlyClassesCount = 0;
    const monthlyEventsList = [];

    // Celdas del mes anterior
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      daysHtml += `
        <div class="calendar-day-cell other-month">
          <div class="day-cell-top">
            <span class="day-number">${dayNum}</span>
          </div>
        </div>
      `;
    }

    // Celdas del mes actual
    for (let day = 1; day <= totalDays; day++) {
      const monthFormatted = String(this.selectedMonth + 1).padStart(2, '0');
      const dayFormatted = String(day).padStart(2, '0');
      const dateStr = `${this.selectedYear}-${monthFormatted}-${dayFormatted}`;
      
      const dayDate = new Date(this.selectedYear, this.selectedMonth, day);
      const jsDay = dayDate.getDay(); // 0=Dom, 1=Lun ...
      const standardDay = jsDay === 0 ? '7' : String(jsDay); // 1=Lun ... 7=Dom
      const isWorkDay = workDays.includes(standardDay);

      const isToday = isCurrentYearAndMonth && today.getDate() === day;
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

      const repoClassesForDay = (repoClassesByDate[dateStr] || []).filter(c => !isBackupFn(c));
      const plan = allPlans[dateStr];
      const rawPlanClasses = (plan && Array.isArray(plan.classes)) ? plan.classes : [];
      const planClasses = rawPlanClasses.filter(c => !isBackupFn(c));

      // Combinar y deduplicar clases reales de este día sin respaldos ni duplicados redundantes
      const combinedDayClasses = (typeof ClassRepository !== 'undefined' && ClassRepository.deduplicateClasses)
        ? ClassRepository.deduplicateClasses([...repoClassesForDay, ...planClasses])
        : (repoClassesForDay.length > 0 ? repoClassesForDay : planClasses);

      const dayClassesCount = combinedDayClasses.length;
      const hasPlan = dayClassesCount > 0;

      if (hasPlan) {
        monthlyPlansCount++;
        monthlyClassesCount += dayClassesCount;
      }

      // Obtener festivos colombianos o eventos institucionales
      const dateInfo = (typeof HolidayService !== 'undefined')
        ? HolidayService.getDateInformation(dateStr)
        : { isHoliday: false, holidayName: null, events: [] };

      const isRecessDay = (typeof ClassRepository !== 'undefined' && typeof ClassRepository._isRecessOrNonSchoolDay === 'function')
        ? ClassRepository._isRecessOrNonSchoolDay(dateStr)
        : ((typeof HolidayService !== 'undefined') ? Boolean(HolidayService.isRecessOrNonSchoolDay(dateStr)?.isRecess) : false);

      if (dateInfo.isHoliday) {
        monthlyEventsList.push({
          date: dateStr,
          day: day,
          name: dateInfo.holidayName,
          type: 'festivo',
          color: '#ef4444'
        });
      }

      dateInfo.events.forEach(evt => {
        // Añadir a la lista mensual si no está ya
        if (!monthlyEventsList.some(e => e.id === evt.id)) {
          monthlyEventsList.push({
            id: evt.id,
            date: evt.startDate,
            day: day,
            name: evt.name,
            type: evt.type,
            color: evt.color,
            startDate: evt.startDate,
            endDate: evt.endDate
          });
        }
      });

      let eventBadgesHtml = '';
      if (dateInfo.isHoliday) {
        eventBadgesHtml += `
          <div class="day-holiday-badge" title="Festivo Oficial: ${this.escapeHtml(dateInfo.holidayName)}">
            🇨🇴 ${this.escapeHtml(dateInfo.holidayName)}
          </div>
        `;
      }

      dateInfo.events.forEach(evt => {
        const icon = typeof SchoolEventsManager !== 'undefined' ? SchoolEventsManager.getEventIcon(evt.type) : '📌';
        eventBadgesHtml += `
          <div class="day-school-event-badge" style="background-color: ${evt.color || '#8b5cf6'}18; color: ${evt.color || '#8b5cf6'}; border: 1px solid ${evt.color || '#8b5cf6'}40;" title="${this.escapeHtml(evt.name)} (${evt.startDate} al ${evt.endDate})">
            ${icon} ${this.escapeHtml(evt.name)}
          </div>
        `;
      });

      const academicStart = (typeof StorageService !== 'undefined' && StorageService.getAcademicStartDate) ? StorageService.getAcademicStartDate() : '2026-09-01';
      const isAcademicStartDay = dateStr === academicStart;
      let planBadges = '';
      if (isAcademicStartDay) {
        planBadges += `<div class="day-school-event-badge" style="background:#059669; color:#fff; font-weight:800; border:1px solid #047857;" title="Primer Día de Clases (Inicio de Consecutivo - Clase 1)">🏁 Clase 1 (Inicio)</div>`;
      }

      if (hasPlan) {
        // Mostrar hasta 2 materias combinando repo y plan sin duplicados
        const subjects = [...new Set(combinedDayClasses.map(c => c.subjectName || c.subject).filter(Boolean))];
        const displaySubjects = subjects.slice(0, 2);
        
        displaySubjects.forEach(sub => {
          planBadges += `<div class="day-subject-pill" title="${sub}">${sub}</div>`;
        });

        if (subjects.length > 2) {
          planBadges += `<div class="day-subject-pill" style="color:var(--slate-500);">+${subjects.length - 2} más</div>`;
        }
      }

      const isHolidayClass = dateInfo.isHoliday ? 'is-holiday' : (isRecessDay ? 'is-recess' : '');
      const hasEventsClass = dateInfo.events.length > 0 ? 'is-school-event' : '';

      daysHtml += `
        <div class="calendar-day-cell ${isToday ? 'is-today' : ''} ${!isWorkDay ? 'is-non-working' : ''} ${isHolidayClass} ${hasEventsClass}" 
             data-date="${dateStr}"
             onclick="window.App.openDayPlanner('${dateStr}')">
          <div class="day-cell-top">
            <span class="day-number">${day}</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${hasPlan ? `
                <button type="button" class="btn-day-quick-download" onclick="event.stopPropagation(); App.openDayDownloadModal('${dateStr}')" title="Descargar planeación de este día (Día completo o clase individual en Word/PDF)" style="background: none; border: none; cursor: pointer; padding: 0 2px; font-size: 0.82rem; line-height: 1; transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                  📥
                </button>
                <span class="day-plans-count" title="${dayClassesCount} clases registradas">${dayClassesCount} cls</span>
              ` : ''}
            </div>
          </div>
          <div class="day-cell-content">
            ${eventBadgesHtml}
            ${planBadges}
            ${isRecessDay && !hasPlan ? `
              <div style="display:flex; align-items:center; justify-content:space-between; margin-top:2px;">
                <span style="font-size:0.72rem; color:#b45309; font-weight:700;">🏖️ Sin clases</span>
                <button type="button" onclick="event.stopPropagation(); window.Calendar.toggleNonTeachingDay('${dateStr}')" style="background:#ecfdf5; border:1px solid #a7f3d0; color:#047857; font-size:0.68rem; font-weight:700; border-radius:4px; padding:1px 4px; cursor:pointer;" title="Habilitar clases en esta fecha">Activar</button>
              </div>
            ` : ''}
            ${(!hasPlan && !dateInfo.isHoliday && !isRecessDay && isWorkDay) ? `
              <div style="display:flex; align-items:center; justify-content:space-between; margin-top:2px;">
                ${isCoordinator ? '' : '<span class="day-empty-hint">+ Planear</span>'}
                <button type="button" onclick="event.stopPropagation(); window.Calendar.toggleNonTeachingDay('${dateStr}')" style="background:none; border:none; color:#94a3b8; font-size:0.68rem; cursor:pointer; padding:1px 3px; border-radius:3px;" onmouseover="this.style.color='#d97706'; this.style.background='#fffbeb';" onmouseout="this.style.color='#94a3b8'; this.style.background='none';" title="Marcar fecha como día sin clases">🚫 Sin clase</button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Celdas del mes siguiente para completar la grilla (múltiplo de 7)
    const totalCells = startDayIndex + totalDays;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      daysHtml += `
        <div class="calendar-day-cell other-month">
          <div class="day-cell-top">
            <span class="day-number">${i}</span>
          </div>
        </div>
      `;
    }

    // Construcción del HTML completo del calendario
    this.container.innerHTML = `
      ${isCoordinator ? `
        <div class="coordinator-supervision-banner" style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 12px 18px; border-radius: 12px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(37,99,235,0.25); flex-wrap: wrap; gap: 10px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="background:rgba(255,255,255,0.2); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">🎓</div>
            <div>
              <div style="font-weight:800; font-size:1.02rem;">Coordinación Académica • Marisol Ruiz</div>
              <div style="font-size:0.83rem; opacity:0.92;">Supervisando planeaciones de <strong>Manuel Muñoz</strong> — Modo Solo Lectura y Descargas (Word y PDF)</div>
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-sm" onclick="App.openDownloadCenter()" style="background:#ffffff; color:#1e40af; font-weight:700; border:none; padding:6px 14px; border-radius:8px; cursor:pointer;" title="Centro de descargas">
              📥 Descargas Semanales / Diarias
            </button>
          </div>
        </div>
      ` : ''}

      <div class="calendar-header-nav">
        <div class="calendar-title-group" style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
          <h2 class="calendar-current-month">${this.monthNames[this.selectedMonth]} ${this.selectedYear}</h2>
          <button class="btn btn-secondary btn-sm" onclick="window.Calendar.goToToday()" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
            Hoy
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.openDownloadCenter()" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 5px; color: var(--primary-700); font-weight: 600;" title="Centro de descargas: Descargar por materia a la semana, por día o semana completa en Word y PDF">
            📥 Descargas Semanales / Diarias
          </button>
          <button class="btn btn-secondary btn-sm" onclick="SchoolEventsManager.openModal(); SchoolEventsManager.switchTab('no_classes');" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 5px; font-weight: 600;" title="Gestionar días no lectivos, semanas especiales y festivos">
            🏖️ Días sin Clases
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.Calendar.realignAllClasses()" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 5px; color: #1d4ed8; font-weight: 700; background: #eff6ff; border-color: #bfdbfe;" title="Re-numerar todas las clases automáticamente según los días lectivos activos">
            ⚡ Re-numerar
          </button>
          ${isCoordinator ? `
            <div style="display:flex; align-items:center; gap:0.4rem; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:3px 8px;" title="Inicio del año lectivo del docente">
              <span style="font-size:0.75rem; font-weight:700; color:#065f46;">🏁 Inicio (Clase 1): ${academicStart}</span>
            </div>
          ` : `
            <div style="display:flex; align-items:center; gap:0.4rem; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:3px 8px;" title="Configura la fecha en que inicia el año lectivo (Clase 1)">
              <span style="font-size:0.75rem; font-weight:700; color:#065f46;">🏁 Inicio (Clase 1):</span>
              <input type="date" value="${academicStart}" style="font-size:0.78rem; font-weight:700; color:#065f46; border:none; background:transparent; cursor:pointer;" onchange="App.setAcademicStartDate(this.value)" title="Haz clic para cambiar el primer día de clases" />
            </div>
          `}
        </div>
        <div class="calendar-nav-buttons">
          <button class="calendar-nav-btn" onclick="window.Calendar.prevMonth()" title="Mes anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="calendar-nav-btn" onclick="window.Calendar.nextMonth()" title="Mes siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      <div class="calendar-weekdays-grid">
        <div class="weekday-label">Lunes</div>
        <div class="weekday-label">Martes</div>
        <div class="weekday-label">Miércoles</div>
        <div class="weekday-label">Jueves</div>
        <div class="weekday-label">Viernes</div>
        <div class="weekday-label weekend">Sábado</div>
        <div class="weekday-label weekend">Domingo</div>
      </div>

      <div class="calendar-days-grid">
        ${daysHtml}
      </div>
    `;

    // Actualizar resumen en la barra lateral si existe
    this.updateSidebarStats(monthlyPlansCount, monthlyClassesCount);
    this.updateSidebarEvents(monthlyEventsList);
  }

  updateSidebarStats(daysCount, classesCount) {
    const statsDaysEl = document.getElementById('stat-month-days');
    const statsClassesEl = document.getElementById('stat-month-classes');
    if (statsDaysEl) statsDaysEl.textContent = daysCount;
    if (statsClassesEl) statsClassesEl.textContent = classesCount;
  }

  updateSidebarEvents(eventsList) {
    const listEl = document.getElementById('sidebar-month-events-list');
    if (!listEl) return;

    if (!eventsList || eventsList.length === 0) {
      listEl.innerHTML = `<span style="font-size:0.8rem; color:var(--slate-400);">Sin festivos ni eventos especiales en este mes.</span>`;
      return;
    }

    listEl.innerHTML = eventsList.map(evt => {
      const isFestivo = evt.type === 'festivo';
      const icon = isFestivo ? '🇨🇴' : (typeof SchoolEventsManager !== 'undefined' ? SchoolEventsManager.getEventIcon(evt.type) : '📌');
      
      let dateLabel = '';
      if (evt.startDate && evt.endDate && evt.startDate !== evt.endDate) {
        const startDay = evt.startDate.split('-')[2];
        const endDay = evt.endDate.split('-')[2];
        dateLabel = `${startDay} al ${endDay}`;
      } else if (evt.day) {
        dateLabel = `Día ${evt.day}`;
      } else {
        dateLabel = evt.date;
      }

      return `
        <div style="font-size: 0.78rem; display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.5rem; background: var(--slate-50); border: 1px solid var(--slate-200); border-left: 3px solid ${evt.color || '#3b82f6'}; border-radius: 4px;">
          <div style="display:flex; align-items:center; gap:0.35rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <span>${icon}</span>
            <strong style="color: var(--slate-700);">${this.escapeHtml(evt.name)}</strong>
          </div>
          <span style="font-size: 0.72rem; color: var(--slate-500); font-weight: 600; flex-shrink: 0; margin-left: 0.35rem;">
            ${dateLabel}
          </span>
        </div>
      `;
    }).join('');
  }

  toggleNonTeachingDay(dateStr) {
    if (typeof HolidayService === 'undefined') return;
    const res = HolidayService.toggleNonTeachingDay(dateStr);
    this.render();
    if (window.DashboardView && window.DashboardView.render) window.DashboardView.render();
    if (typeof App !== 'undefined' && App.showToast) {
      if (res.isNonTeaching) {
        App.showToast(`🏖️ ${dateStr} marcado como día sin clases. Consecutivos re-numerados.`, 'success');
      } else {
        App.showToast(`📅 ${dateStr} habilitado para clases regulares. Consecutivos re-numerados.`, 'info');
      }
    }
  }

  realignAllClasses() {
    let count = 0;
    if (typeof ClassRepository !== 'undefined') {
      if (typeof ClassRepository.clearScheduleSequenceCache === 'function') {
        ClassRepository.clearScheduleSequenceCache();
      }
      if (typeof ClassRepository.realignSequenceNumbersToSchedule === 'function') {
        count = ClassRepository.realignSequenceNumbersToSchedule();
      }
    }
    this.render();
    if (window.DashboardView && window.DashboardView.render) window.DashboardView.render();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`⚡ ¡${count} clases re-numeradas automáticamente según días activos!`, 'success');
    }
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

window.CalendarComponent = CalendarComponent;
