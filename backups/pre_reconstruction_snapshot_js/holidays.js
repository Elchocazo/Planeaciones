/**
 * MÓDULO DE FESTIVOS EN COLOMBIA Y CALENDARIO DE EVENTOS ESCOLARES
 * Incluye cálculo automático de festivos según la Ley Emiliani y gestión de semanas especiales
 */

const STORAGE_EVENTS_KEY = 'teacher_school_events_v1';

// Eventos institucionales y semanas especiales a partir del 1 de Septiembre
const DEFAULT_SCHOOL_EVENTS = [
  {
    id: 'evt_inicio_clases',
    name: '🎉 Inicio de Clases (Semana de Inducción y Bienvenida)',
    startDate: '2026-09-01',
    endDate: '2026-09-04',
    type: 'evento_especial',
    color: '#059669',
    description: 'Primera semana lectiva del año escolar e inducción de estudiantes'
  },
  {
    id: 'evt_oct_receso',
    name: 'Semana de Receso Escolar (Vacaciones de Octubre)',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    type: 'vacaciones',
    color: '#f59e0b',
    description: 'Semana de descanso estudiantil y desarrollo institucional'
  },
  {
    id: 'evt_examenes_cierre',
    name: 'Exámenes Finales de Periodo',
    startDate: '2026-11-23',
    endDate: '2026-11-27',
    type: 'examenes',
    color: '#db2777',
    description: 'Evaluaciones acumulativas finales'
  },
  {
    id: 'evt_dic_vacaciones',
    name: 'Vacaciones de Fin de Año y Año Nuevo',
    startDate: '2026-12-11',
    endDate: '2027-01-11',
    type: 'vacaciones',
    color: '#ea580c',
    description: 'Vacaciones de navidad y fin de año escolar'
  },
  {
    id: 'evt_semana_santa_2027',
    name: 'Semana Santa 2027',
    startDate: '2027-03-21',
    endDate: '2027-03-28',
    type: 'semana_santa',
    color: '#8b5cf6',
    description: 'Semana Mayor y receso académico'
  },
  {
    id: 'evt_semana_ciencia_2027',
    name: 'Semana de la Ciencia y Tecnología (Tentativo)',
    startDate: '2027-04-19',
    endDate: '2027-04-23',
    type: 'evento_especial',
    color: '#0284c7',
    description: 'Feria científica, proyectos de robótica e informática'
  }
];

const HolidayService = {
  /**
   * Calcula el Domingo de Pascua (Resurrección) mediante el algoritmo de Butcher / Meeus
   */
  getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  },

  /**
   * Mueve una fecha al siguiente lunes si no cae en lunes (Ley Emiliani de Colombia)
   */
  moveToNextMonday(date) {
    const day = date.getDay();
    if (day === 1) return date; // Ya es lunes
    const diff = (8 - day) % 7;
    const nextMonday = new Date(date);
    nextMonday.setDate(date.getDate() + (diff === 0 ? 7 : diff));
    return nextMonday;
  },

  /**
   * Obtiene todos los festivos oficiales de Colombia para un año determinado
   */
  getColombianHolidays(year) {
    const holidays = [];

    const formatKey = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // 1. Festivos con fecha fija
    holidays.push({ date: `${year}-01-01`, name: 'Año Nuevo', type: 'festivo' });
    holidays.push({ date: `${year}-05-01`, name: 'Día del Trabajo', type: 'festivo' });
    holidays.push({ date: `${year}-07-20`, name: 'Día de la Independencia', type: 'festivo' });
    holidays.push({ date: `${year}-08-07`, name: 'Batalla de Boyacá', type: 'festivo' });
    holidays.push({ date: `${year}-12-08`, name: 'Inmaculada Concepción', type: 'festivo' });
    holidays.push({ date: `${year}-12-25`, name: 'Navidad', type: 'festivo' });

    // 2. Festivos con fecha que se traslada al siguiente lunes (Ley Emiliani)
    const reyes = this.moveToNextMonday(new Date(year, 0, 6));
    holidays.push({ date: formatKey(reyes), name: 'Día de los Reyes Magos', type: 'festivo' });

    const sanJose = this.moveToNextMonday(new Date(year, 2, 19));
    holidays.push({ date: formatKey(sanJose), name: 'Día de San José', type: 'festivo' });

    const sanPedro = this.moveToNextMonday(new Date(year, 5, 29));
    holidays.push({ date: formatKey(sanPedro), name: 'San Pedro y San Pablo', type: 'festivo' });

    const asuncion = this.moveToNextMonday(new Date(year, 7, 15));
    holidays.push({ date: formatKey(asuncion), name: 'Asunción de la Virgen', type: 'festivo' });

    const raza = this.moveToNextMonday(new Date(year, 9, 12));
    holidays.push({ date: formatKey(raza), name: 'Día de la Raza', type: 'festivo' });

    const todosSantos = this.moveToNextMonday(new Date(year, 10, 1));
    holidays.push({ date: formatKey(todosSantos), name: 'Día de Todos los Santos', type: 'festivo' });

    const cartagena = this.moveToNextMonday(new Date(year, 10, 11));
    holidays.push({ date: formatKey(cartagena), name: 'Independencia de Cartagena', type: 'festivo' });

    // 3. Festivos relativos a Pascua (Semana Santa y celebraciones religiosas)
    const easter = this.getEasterSunday(year);

    // Jueves Santo (-3 días de Pascua)
    const juevesSanto = new Date(easter);
    juevesSanto.setDate(easter.getDate() - 3);
    holidays.push({ date: formatKey(juevesSanto), name: 'Jueves Santo', type: 'festivo' });

    // Viernes Santo (-2 días de Pascua)
    const viernesSanto = new Date(easter);
    viernesSanto.setDate(easter.getDate() - 2);
    holidays.push({ date: formatKey(viernesSanto), name: 'Viernes Santo', type: 'festivo' });

    // Ascensión del Señor (+43 días tras Pascua trasladado a lunes = +43 días)
    const ascension = this.moveToNextMonday(new Date(easter.getTime() + 39 * 24 * 60 * 60 * 1000));
    holidays.push({ date: formatKey(ascension), name: 'Ascensión del Señor', type: 'festivo' });

    // Corpus Christi (+64 días tras Pascua trasladado a lunes = +60 días)
    const corpus = this.moveToNextMonday(new Date(easter.getTime() + 60 * 24 * 60 * 60 * 1000));
    holidays.push({ date: formatKey(corpus), name: 'Corpus Christi', type: 'festivo' });

    // Sagrado Corazón (+71 días tras Pascua trasladado a lunes = +68 días)
    const sagradoCorazon = this.moveToNextMonday(new Date(easter.getTime() + 68 * 24 * 60 * 60 * 1000));
    holidays.push({ date: formatKey(sagradoCorazon), name: 'Sagrado Corazón de Jesús', type: 'festivo' });

    return holidays;
  },

  /**
   * Obtiene la lista de eventos institucionales guardados
   */
  getSchoolEvents() {
    try {
      const data = localStorage.getItem(STORAGE_EVENTS_KEY);
      if (!data) return JSON.parse(JSON.stringify(DEFAULT_SCHOOL_EVENTS));
      const parsed = JSON.parse(data);
      if (!parsed.some(e => e.id === 'evt_inicio_clases')) {
        parsed.unshift(DEFAULT_SCHOOL_EVENTS[0]);
      }
      return parsed;
    } catch (e) {
      console.error('Error al leer eventos escolares:', e);
      return JSON.parse(JSON.stringify(DEFAULT_SCHOOL_EVENTS));
    }
  },

  /**
   * Guarda la lista de eventos institucionales
   */
  saveSchoolEvents(eventsList) {
    try {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(eventsList));
      return true;
    } catch (e) {
      console.error('Error al guardar eventos escolares:', e);
      return false;
    }
  },

  /**
   * Obtiene la información de festivos o eventos especiales para una fecha dada (YYYY-MM-DD)
   */
  getDateInformation(dateStr) {
    if (!dateStr) return { isHoliday: false, holidayName: null, events: [] };

    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);

    // 1. Revisar si es festivo colombiano
    const yearHolidays = this.getColombianHolidays(year);
    const holidayMatch = yearHolidays.find(h => h.date === dateStr);

    // 2. Revisar eventos institucionales
    const schoolEvents = this.getSchoolEvents();
    const matchingEvents = schoolEvents.filter(evt => {
      if (!evt.startDate || !evt.endDate) return false;
      return dateStr >= evt.startDate && dateStr <= evt.endDate;
    });

    return {
      isHoliday: !!holidayMatch,
      holidayName: holidayMatch ? holidayMatch.name : null,
      events: matchingEvents
    };
  }
};

const SchoolEventsManager = {
  activeTab: 'events', // 'events' | 'holidays'

  openModal() {
    let modal = document.getElementById('school-events-modal-backdrop');
    if (!modal) {
      this.createModalDOM();
      modal = document.getElementById('school-events-modal-backdrop');
    }
    if (modal) {
      this.renderModalContent();
      modal.classList.add('active');
    }
  },

  closeModal() {
    const modal = document.getElementById('school-events-modal-backdrop');
    if (modal) modal.classList.remove('active');
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.renderModalContent();
  },

  createModalDOM() {
    const div = document.createElement('div');
    div.id = 'school-events-modal-backdrop';
    div.className = 'modal-backdrop';
    div.innerHTML = `
      <div class="modal-card" style="max-width: 900px; max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <h2 style="margin:0; font-size:1.25rem;">Calendario Escolar: Festivos y Eventos Especiales</h2>
          </div>
          <button type="button" class="btn-close-modal" onclick="SchoolEventsManager.closeModal()">&times;</button>
        </div>
        
        <div class="settings-tabs-nav" style="padding: 0.75rem 1.5rem 0; border-bottom: 1px solid var(--slate-200);">
          <button class="settings-tab-btn" id="tab-btn-school-events" onclick="SchoolEventsManager.switchTab('events')">
            🏖️ Semanas Especiales, Vacaciones y Exámenes
          </button>
          <button class="settings-tab-btn" id="tab-btn-colombia-holidays" onclick="SchoolEventsManager.switchTab('holidays')">
            🇨🇴 Festivos Oficiales Colombia
          </button>
        </div>

        <div class="modal-body" id="school-events-modal-body" style="padding: 1.5rem; overflow-y: auto; flex: 1;">
          <!-- Contenido generado dinámicamente -->
        </div>

        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="btn btn-secondary" onclick="SchoolEventsManager.restoreDefaults()">
            Restablecer Fechas por Defecto
          </button>
          <div style="display:flex; gap:0.5rem;">
            <button type="button" class="btn btn-secondary" onclick="SchoolEventsManager.closeModal()">Cerrar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  },

  renderModalContent() {
    const body = document.getElementById('school-events-modal-body');
    if (!body) return;

    // Actualizar estados de pestañas
    const tabEvents = document.getElementById('tab-btn-school-events');
    const tabHolidays = document.getElementById('tab-btn-colombia-holidays');
    if (tabEvents) tabEvents.classList.toggle('active', this.activeTab === 'events');
    if (tabHolidays) tabHolidays.classList.toggle('active', this.activeTab === 'holidays');

    if (this.activeTab === 'events') {
      const events = HolidayService.getSchoolEvents();

      body.innerHTML = `
        <div style="margin-bottom: 1.25rem;">
          <p style="font-size:0.9rem; color:var(--slate-600); margin:0 0 1rem;">
            Personaliza las fechas de <strong>vacaciones, semana santa, semana de la ciencia y exámenes de periodo</strong>. Aparecerán resaltadas en el calendario con colores distintivos.
          </p>

          <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
            <button class="btn btn-primary btn-sm" onclick="SchoolEventsManager.promptAddEvent()">
              + Agregar Nuevo Evento / Semana Especial
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${events.map((evt, idx) => `
              <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-left: 5px solid ${evt.color || '#3b82f6'}; border-radius: var(--radius-md); padding: 1rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
                <div style="flex: 1; min-width: 250px;">
                  <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                    <span style="font-size: 1rem;">${this.getEventIcon(evt.type)}</span>
                    <strong style="font-size: 0.95rem; color: var(--slate-800);">${this.escapeHtml(evt.name)}</strong>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--slate-500);">${this.escapeHtml(evt.description || '')}</div>
                </div>

                <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap: wrap;">
                  <div style="display:flex; align-items:center; gap:0.35rem;">
                    <label style="font-size:0.75rem; color:var(--slate-500); font-weight:600;">Desde:</label>
                    <input type="date" value="${evt.startDate}" class="form-input" style="width:140px; padding:0.25rem 0.5rem; font-size:0.85rem;" onchange="SchoolEventsManager.updateEvent(${idx}, 'startDate', this.value)" />
                  </div>

                  <div style="display:flex; align-items:center; gap:0.35rem;">
                    <label style="font-size:0.75rem; color:var(--slate-500); font-weight:600;">Hasta:</label>
                    <input type="date" value="${evt.endDate}" class="form-input" style="width:140px; padding:0.25rem 0.5rem; font-size:0.85rem;" onchange="SchoolEventsManager.updateEvent(${idx}, 'endDate', this.value)" />
                  </div>

                  <input type="color" value="${evt.color || '#3b82f6'}" title="Color del distintivo" style="width:34px; height:34px; border:none; border-radius:4px; cursor:pointer;" onchange="SchoolEventsManager.updateEvent(${idx}, 'color', this.value)" />

                  <button class="btn-table-action delete" onclick="SchoolEventsManager.deleteEvent(${idx})" title="Eliminar este evento">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // Pestaña: Festivos Oficiales Colombia
      const currentYear = new Date().getFullYear();
      const years = [currentYear, currentYear + 1];

      let holidaysHtml = '';
      years.forEach(yr => {
        const holidays = HolidayService.getColombianHolidays(yr);
        holidaysHtml += `
          <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.75rem; color: var(--primary-800); display: flex; align-items: center; gap: 0.5rem;">
              <span>🇨🇴</span> Festivos Oficiales en Colombia (${yr})
              <span class="role-badge" style="font-size:0.75rem;">${holidays.length} días festivos</span>
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.6rem;">
              ${holidays.map(h => {
                const parts = h.date.split('-');
                const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' });
                const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
                
                return `
                  <div style="background: #fff; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: var(--radius-sm); padding: 0.6rem 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong style="font-size:0.85rem; color: #991b1b; display:block;">${h.name}</strong>
                      <span style="font-size:0.75rem; color: #64748b; text-transform: capitalize;">${dayName}</span>
                    </div>
                    <div style="text-align:right;">
                      <span style="font-weight:700; font-size:1rem; color:#dc2626;">${parts[2]}</span>
                      <span style="font-size:0.75rem; color:#64748b; text-transform: uppercase;"> ${monthName}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      });

      body.innerHTML = `
        <div>
          <p style="font-size:0.88rem; color:var(--slate-600); margin-bottom:1.25rem;">
            Los festivos en Colombia se calculan automáticamente según la <strong>Ley Emiliani (Ley 51 de 1983)</strong> y los días santos relativos a la Pascua. Se marcan en rojo en tu calendario.
          </p>
          ${holidaysHtml}
        </div>
      `;
    }
  },

  updateEvent(index, field, value) {
    const events = HolidayService.getSchoolEvents();
    if (events[index]) {
      events[index][field] = value;
      HolidayService.saveSchoolEvents(events);
      if (window.Calendar) window.Calendar.render();
      App.showToast('Evento actualizado en el calendario', 'success');
    }
  },

  deleteEvent(index) {
    if (!confirm('¿Deseas eliminar este evento especial del calendario?')) return;
    const events = HolidayService.getSchoolEvents();
    events.splice(index, 1);
    HolidayService.saveSchoolEvents(events);
    this.renderModalContent();
    if (window.Calendar) window.Calendar.render();
    App.showToast('Evento eliminado', 'info');
  },

  promptAddEvent() {
    const name = prompt('Nombre del nuevo evento o semana especial:\n(Ej. "Día de la Familia", "Día del Idioma", "Semana Cultural")');
    if (!name || !name.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newEvent = {
      id: 'evt_custom_' + Date.now(),
      name: name.trim(),
      startDate: todayStr,
      endDate: todayStr,
      type: 'evento_especial',
      color: '#8b5cf6',
      description: 'Evento institucional personalizado'
    };

    const events = HolidayService.getSchoolEvents();
    events.push(newEvent);
    HolidayService.saveSchoolEvents(events);
    this.renderModalContent();
    if (window.Calendar) window.Calendar.render();
    App.showToast(`Evento "${name}" agregado`, 'success');
  },

  restoreDefaults() {
    if (!confirm('¿Deseas restablecer las fechas por defecto de vacaciones, exámenes y semana santa?')) return;
    HolidayService.saveSchoolEvents(DEFAULT_SCHOOL_EVENTS);
    this.renderModalContent();
    if (window.Calendar) window.Calendar.render();
    App.showToast('Fechas restablecidas a los valores por defecto', 'info');
  },

  getEventIcon(type) {
    switch (type) {
      case 'vacaciones': return '🏖️';
      case 'semana_santa': return '✝️';
      case 'examenes': return '📝';
      case 'evento_especial': return '🔬';
      default: return '📌';
    }
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

window.HolidayService = HolidayService;
window.SchoolEventsManager = SchoolEventsManager;

