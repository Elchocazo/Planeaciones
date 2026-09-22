/**
 * MÓDULO DE CALENDARIO MENSUAL (INICIO EN LUNES)
 */

class CalendarComponent {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    
    // Iniciar directamente en Septiembre de 2026 (mes oficial de inicio de clases)
    this.selectedYear = 2026;
    this.selectedMonth = 8; // 8 = Septiembre (0-indexed)
    
    this.monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    this.init();
  }

  init() {
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

    const allPlans = StorageService.getAllPlans();
    const profile = StorageService.getProfile();
    const workDays = profile?.workDays || ['1', '2', '3', '4', '5'];

    // Obtener TODAS las clases directamente desde ClassRepository (desacoplado y persistente)
    const tid = (typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : null;
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
      const repoClassesForDay = repoClassesByDate[dateStr] || [];
      const plan = allPlans[dateStr];
      const planClasses = plan && plan.classes ? plan.classes : [];
      const dayClassesCount = Math.max(repoClassesForDay.length, planClasses.length);
      const hasPlan = dayClassesCount > 0;

      if (hasPlan) {
        monthlyPlansCount++;
        monthlyClassesCount += dayClassesCount;
      }

      // Obtener festivos colombianos o eventos institucionales
      const dateInfo = (typeof HolidayService !== 'undefined')
        ? HolidayService.getDateInformation(dateStr)
        : { isHoliday: false, holidayName: null, events: [] };

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

      const isAcademicStartDay = dateStr === StorageService.getAcademicStartDate();
      let planBadges = '';
      if (isAcademicStartDay) {
        planBadges += `<div class="day-school-event-badge" style="background:#059669; color:#fff; font-weight:800; border:1px solid #047857;" title="Primer Día de Clases (Inicio de Consecutivo - Clase 1)">🏁 Clase 1 (Inicio)</div>`;
      }

      if (hasPlan) {
        // Mostrar hasta 2 materias combinando repo y plan
        const subjectsFromRepo = repoClassesForDay.map(c => c.subjectName || c.subject).filter(Boolean);
        const subjectsFromPlan = planClasses.map(c => c.subject).filter(Boolean);
        const subjects = [...new Set([...subjectsFromRepo, ...subjectsFromPlan])];
        const displaySubjects = subjects.slice(0, 2);
        
        displaySubjects.forEach(sub => {
          planBadges += `<div class="day-subject-pill" title="${sub}">${sub}</div>`;
        });

        if (subjects.length > 2) {
          planBadges += `<div class="day-subject-pill" style="color:var(--slate-500);">+${subjects.length - 2} más</div>`;
        }
      }

      const isHolidayClass = dateInfo.isHoliday ? 'is-holiday' : '';
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
            ${(!hasPlan && !dateInfo.isHoliday) ? `<span class="day-empty-hint">+ Planear</span>` : ''}
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
      <div class="calendar-header-nav">
        <div class="calendar-title-group" style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
          <h2 class="calendar-current-month">${this.monthNames[this.selectedMonth]} ${this.selectedYear}</h2>
          <button class="btn btn-secondary btn-sm" onclick="window.Calendar.goToToday()" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
            Hoy
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.openDownloadCenter()" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 5px; color: var(--primary-700); font-weight: 600;" title="Centro de descargas: Descargar por materia a la semana, por día o semana completa en Word y PDF">
            📥 Descargas Semanales / Diarias
          </button>
          <div style="display:flex; align-items:center; gap:0.4rem; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:3px 8px;" title="Configura la fecha en que inicia el año lectivo (Clase 1)">
            <span style="font-size:0.75rem; font-weight:700; color:#065f46;">🏁 Inicio (Clase 1):</span>
            <input type="date" value="${StorageService.getAcademicStartDate()}" style="font-size:0.78rem; font-weight:700; color:#065f46; border:none; background:transparent; cursor:pointer;" onchange="App.setAcademicStartDate(this.value)" title="Haz clic para cambiar el primer día de clases" />
          </div>
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
