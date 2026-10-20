/**
 * VISTA DASHBOARD / INICIO (DashboardView)
 * Pantalla principal del docente conectada al horario y secuencia pedagógica.
 * Muestra:
 * - "HOY" con fecha completa, próxima clase destacada y estado de planeaciones.
 * - Lista de clases del día con botones individuales [Editar], [Guardar], [PDF].
 * - Indicadores de progreso por Asignatura y Grado.
 * - Operación 100% de LECTURA PURA.
 */

class DashboardViewClass {
  constructor() {
    this.container = null;
    this.selectedDate = new Date().toISOString().slice(0, 10);
  }

  init() {
    this.container = document.getElementById('dashboard-view');
    if (typeof window !== 'undefined' && !this._eventsBound) {
      this._eventsBound = true;

      const handleClassChange = (e) => {
        const cls = e?.detail?.classSession;
        if (cls && cls.date && cls.date !== this.selectedDate) {
          this._needsRender = true;
          return;
        }
        this.requestRender();
      };

      window.addEventListener('class_session_cache_hydrated', () => this.requestRender());
      window.addEventListener('class_saved_locally', handleClassChange);
      window.addEventListener('class_session_saved', () => this.requestRender());
      window.addEventListener('plan_saved', () => this.requestRender());
      window.addEventListener('storage', (e) => {
        if (e.key && (e.key.includes('class_sessions') || e.key.includes('plans'))) {
          this.requestRender();
        }
      });
    }
  }

  _isDashboardVisible() {
    if (!this.container) return false;
    if (this.container.style.display === 'none') return false;
    if (typeof AppRouter !== 'undefined' && AppRouter.currentView && AppRouter.currentView !== 'dashboard') return false;
    return this.container.offsetParent !== null;
  }

  requestRender() {
    if (this._renderRafId) return;
    const schedule = (typeof window !== 'undefined' && window.requestAnimationFrame) ? window.requestAnimationFrame : setTimeout;
    this._renderRafId = schedule(() => {
      this._renderRafId = null;
      if (this._isDashboardVisible()) {
        this.render();
      } else {
        this._needsRender = true;
      }
    });
  }

  _isCoordinator() {
    return Boolean(
      (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) ||
      (typeof AuthModal !== 'undefined' && AuthModal.getSession()?.role === 'coordinator')
    );
  }

  setDate(dateStr) {
    if (!dateStr) return;
    this.selectedDate = dateStr;
    if (typeof AppState !== 'undefined') {
      AppState.set('currentDate', dateStr);
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('school_active_dashboard_date', dateStr);
      } catch (e) {}
    }
    const layout = this.container ? this.container.querySelector('.dashboard-page-layout') : null;
    if (layout) {
      this._updateDaySectionOnly();
    } else {
      this.render();
    }
  }

  _updateDaySectionOnly() {
    if (!this.container) return;
    const tid = (typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : 'usr_manuel';
    const dateStr = this.selectedDate;

    // Obtener vista del día de forma 100% de lectura (READ-ONLY)
    const dayView = ScheduleService.buildDayView(dateStr, tid);
    const dayOfWeekName = typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(dateStr) : 'Lunes';
    const formattedDate = typeof ExportService !== 'undefined' ? ExportService.formatDate(dateStr) : dateStr;

    const todayStr = new Date().toISOString().slice(0, 10);
    const isToday = (dateStr === todayStr);

    let nextPendingItem = null;
    if (dayView && dayView.scheduledItems) {
      nextPendingItem = dayView.scheduledItems.find(item => item.isPending);
    }

    // 1. Actualizar badge y título de fecha
    const badge = this.container.querySelector('.dashboard-badge-today');
    if (badge) badge.textContent = isToday ? '🌟 HOY' : '📅 FECHA SELECCIONADA';
    const title = this.container.querySelector('.dashboard-date-title');
    if (title) title.textContent = `${dayOfWeekName.toUpperCase()}, ${formattedDate.toUpperCase()}`;

    // 2. Actualizar input de fecha y botón "Ir a Hoy"
    const dateInput = this.container.querySelector('.dashboard-date-input');
    if (dateInput) dateInput.value = dateStr;

    const nav = this.container.querySelector('.dashboard-date-nav');
    if (nav) {
      const existingTodayBtn = nav.querySelector('.btn-today-nav');
      if (!isToday && !existingTodayBtn) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary btn-sm btn-today-nav';
        btn.textContent = 'Ir a Hoy';
        btn.onclick = () => DashboardView.setDate(todayStr);
        nav.appendChild(btn);
      } else if (isToday && existingTodayBtn) {
        existingTodayBtn.remove();
      }
    }

    // 3. Actualizar stats row
    const statsRow = this.container.querySelector('.dashboard-stats-row');
    if (statsRow) {
      if (dayView?.isRecess) {
        statsRow.innerHTML = `
          <div class="stat-pill" style="background:#fef3c7; color:#92400e; border-color:#fde68a;">
            <span class="stat-num" style="color:#b45309;">🏖️</span>
            <span class="stat-desc" style="color:#92400e; font-weight:700;">${this._escape(dayView.recessInfo?.name || 'Receso')}</span>
          </div>
          <div class="stat-pill success">
            <span class="stat-num">${dayView?.scheduledItems?.filter(i => i.isPlanned).length || 0}</span>
            <span class="stat-desc">Planeadas</span>
          </div>
          <div class="stat-pill" style="background:#f1f5f9; color:#64748b; border-color:#e2e8f0;">
            <span class="stat-num" style="color:#64748b;">0</span>
            <span class="stat-desc">Pendientes</span>
          </div>
          ${dayView?.additionalClasses?.length > 0 ? `
            <div class="stat-pill" style="background:#f3e8ff; color:#6b21a8; border-color:#e9d5ff; cursor:pointer;" onclick="DashboardView.toggleAdditionals()" title="Ver planeaciones históricas o adicionales en esta fecha">
              <span class="stat-num" style="color:#6b21a8;">${dayView.additionalClasses.length}</span>
              <span class="stat-desc" style="color:#7e22ce;">Históricas</span>
            </div>
          ` : ''}
        `;
      } else {
        statsRow.innerHTML = `
          <div class="stat-pill">
            <span class="stat-num">${dayView?.scheduledItems?.length || 0}</span>
            <span class="stat-desc">Clases hoy</span>
          </div>
          <div class="stat-pill success">
            <span class="stat-num">${dayView?.scheduledItems?.filter(i => i.isPlanned).length || 0}</span>
            <span class="stat-desc">Planeadas</span>
          </div>
          <div class="stat-pill warning">
            <span class="stat-num">${dayView?.scheduledItems?.filter(i => i.isPending).length || 0}</span>
            <span class="stat-desc">Pendientes</span>
          </div>
          ${dayView?.additionalClasses?.length > 0 ? `
            <div class="stat-pill" style="background:#f3e8ff; color:#6b21a8; border-color:#e9d5ff; cursor:pointer;" onclick="DashboardView.toggleAdditionals()" title="Ver planeaciones históricas o adicionales en esta fecha">
              <span class="stat-num" style="color:#6b21a8;">${dayView.additionalClasses.length}</span>
              <span class="stat-desc" style="color:#7e22ce;">Históricas</span>
            </div>
          ` : ''}
        `;
      }
    }

    // 4. Actualizar hero banner
    const heroMount = this.container.querySelector('#dashboard-hero-banner-mount');
    if (heroMount) {
      heroMount.innerHTML = this._renderHeroBanner(nextPendingItem, dayView);
    }

    // 5. Actualizar lista de clases
    const classesList = this.container.querySelector('.dashboard-classes-list');
    if (classesList) {
      classesList.innerHTML = this._renderClassesList(dayView);
    }

    // 6. Actualizar adicionales
    const additionalsMount = this.container.querySelector('#dashboard-additionals-mount');
    if (additionalsMount) {
      additionalsMount.innerHTML = this._renderAdditionalsSection(dayView);
    }

    // 7. Actualizar botón de descargas rápidas
    const dlBtn = this.container.querySelector('#btn-dashboard-download-day');
    if (dlBtn) {
      dlBtn.setAttribute('onclick', `App.openDayDownloadModal('${dateStr}')`);
    }
  }

  _renderHeroBanner(nextPendingItem, dayView) {
    if (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) {
      return '';
    }
    // Si la fecha corresponde a receso escolar o día festivo/no lectivo
    if (dayView?.isRecess) {
      const rName = dayView.recessInfo?.name || 'Semana de Receso Escolar';
      const rDesc = dayView.recessInfo?.description || 'Periodo de receso académico institucional. No se requiere realizar planeaciones pedagógicas para esta fecha.';
      const isCustomRecess = Boolean(dayView.recessInfo?.event?.id && String(dayView.recessInfo.event.id).startsWith('evt_receso_'));
      return `
        <div class="dashboard-hero-banner" style="background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 2px solid #fde68a; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.12);">
          <div class="hero-left">
            <span class="hero-tag" style="background: #f59e0b; color: #ffffff; font-weight: 800;">🏖️ ${this._escape(rName.toUpperCase())}</span>
            <h3 class="hero-subject" style="color: #92400e;">No se requieren planeaciones para esta fecha</h3>
            <p class="hero-meta" style="color: #b45309;">
              ${this._escape(rDesc)}
            </p>
          </div>
          <div class="hero-right" style="display:flex; gap:8px; align-items:center;">
            <button type="button" class="btn btn-secondary btn-md" onclick="DashboardView.openRecessModal('${this.selectedDate}')" style="background:#ffffff; color:#b45309; border-color:#fcd34d; font-weight:700;">
              ⚙️ Configurar Receso
            </button>
            ${isCustomRecess ? `
              <button type="button" class="btn btn-secondary btn-md" onclick="DashboardView.removeRecess('${this.selectedDate}')" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5; font-weight:700;" title="Quitar estado de receso para volver a planear">
                ❌ Quitar Receso
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }
    if (nextPendingItem) {
      return `
        <div class="dashboard-hero-banner">
          <div class="hero-left">
            <span class="hero-tag">⚡ PRÓXIMA CLASE PENDIENTE</span>
            <h3 class="hero-subject">${this._escape(nextPendingItem.slot.subjectName)} — ${this._escape(nextPendingItem.slot.gradeName)}</h3>
            <p class="hero-meta">
              ⏰ ${this._escape(nextPendingItem.slot.time || 'Horario asignado')} 
              ${nextPendingItem.classSession ? `• Clase #${nextPendingItem.classSession.sequenceNumber}` : '• Nueva sesión'}
            </p>
          </div>
          <div class="hero-right">
            <button type="button" class="btn btn-primary btn-lg" onclick="DashboardView.openSlotForEditing('${nextPendingItem.slot.id}')">
              ✏️ Continuar planeación
            </button>
          </div>
        </div>
      `;
    }
    return `
      <div class="dashboard-hero-banner completed">
        <div class="hero-left">
          <span class="hero-tag">✅ DÍA AL DÍA</span>
          <h3 class="hero-subject">Todas las clases de este día están planeadas</h3>
          <p class="hero-meta">Puedes revisar o descargar los preparadores institucionales a continuación.</p>
        </div>
      </div>
    `;
  }

  _formatSnippet(text, maxLen = 110) {
    if (!text || typeof text !== 'string') return '';
    // 1. Quitar etiquetas HTML
    let clean = text.replace(/<[^>]+>/g, ' ');
    // 2. Quitar negritas y cursivas Markdown (**texto**, *texto*, __texto__, _texto_)
    clean = clean.replace(/(\*\*|__)(.*?)\1/g, '$2');
    clean = clean.replace(/(\*|_)(.*?)\1/g, '$2');
    // 3. Quitar viñetas iniciales y símbolos de lista (•, -, *, 1., 2.)
    clean = clean.replace(/^[\s•\-\*]+/, '');
    clean = clean.replace(/\s*[•\-\*]\s+/g, ', ');
    // 4. Quitar asteriscos o almohadillas sueltas
    clean = clean.replace(/[\*#]+/g, '');
    // 5. Colapsar espacios y saltos de línea
    clean = clean.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLen) return clean;
    // Truncar en límite de palabra
    const truncated = clean.slice(0, maxLen);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLen * 0.7) {
      return truncated.slice(0, lastSpace).trim() + '...';
    }
    return truncated.trim() + '...';
  }

  _formatTopic(topicText) {
    if (!topicText || typeof topicText !== 'string') return 'Sin tema planeado todavía';
    let clean = String(topicText).trim();
    // Quitar asteriscos envolventes (**Tema**)
    clean = clean.replace(/^\*+|\*+$/g, '').trim();
    // Quitar prefijo redundante "Clase #1:", "Clase 1 -", etc.
    clean = clean.replace(/^(?:clase\s*#?\s*\d+\s*[:\.\-]\s*)/i, '').trim();
    // Quitar comillas envolventes
    clean = clean.replace(/^["'«“](.*)["'»”]$/, '$1').trim();
    return clean || 'Sin tema planeado todavía';
  }

  render(options = {}) {
    if (!this.container) {
      this.container = document.getElementById('dashboard-view');
    }
    if (!this.container) return;
    this._needsRender = false;

    if (options && options.date) {
      this.selectedDate = options.date;
      if (typeof localStorage !== 'undefined') {
        try { localStorage.setItem('school_active_dashboard_date', options.date); } catch (e) {}
      }
    } else {
      const persisted = (typeof localStorage !== 'undefined') ? localStorage.getItem('school_active_dashboard_date') : null;
      const fromState = (typeof AppState !== 'undefined') ? AppState.get('currentDate') : null;
      if (persisted && /^\d{4}-\d{2}-\d{2}$/.test(persisted)) {
        this.selectedDate = persisted;
      } else if (fromState && /^\d{4}-\d{2}-\d{2}$/.test(fromState)) {
        this.selectedDate = fromState;
      } else if (!this.selectedDate) {
        this.selectedDate = new Date().toISOString().slice(0, 10);
      }
    }

    // Protección anti-parpadeo: si ClassRepository todavía está inicializándose asíncronamente,
    // esperar su resolución antes de construir la vista del día para evitar mostrar un estado vacío efímero.
    if (typeof ClassRepository !== 'undefined' && !ClassRepository._isInitialized && ClassRepository._initPromise) {
      ClassRepository._initPromise.then(() => {
        this.render();
      });
      return;
    }

    const tid = (typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : 'usr_manuel';
    const dateStr = this.selectedDate;
    const isCoord = this._isCoordinator();

    // Obtener vista del día de forma 100% de lectura (READ-ONLY)
    const dayView = ScheduleService.buildDayView(dateStr, tid);
    const dayOfWeekName = typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(dateStr) : 'Lunes';
    const formattedDate = typeof ExportService !== 'undefined' ? ExportService.formatDate(dateStr) : dateStr;

    // Detectar si hoy es la fecha seleccionada
    const todayStr = new Date().toISOString().slice(0, 10);
    const isToday = (dateStr === todayStr);

    // Buscar próxima clase pendiente
    let nextPendingItem = null;
    if (dayView && dayView.scheduledItems) {
      nextPendingItem = dayView.scheduledItems.find(item => item.isPending);
    }

    // Progreso curricular del periodo activo
    const currentPeriod = (typeof AppState !== 'undefined' && AppState.get('currentPeriod')) || '1°';
    const activeSequences = SequenceService.getAllActiveSequences(currentPeriod, tid);

    // Planeaciones huérfanas o recuperadas
    const orphanedClasses = (typeof ClassRepository !== 'undefined' && ClassRepository.getOrphanedClasses)
      ? ClassRepository.getOrphanedClasses(tid)
      : [];

    // Planeaciones recientes
    const allTeacherClasses = (typeof ClassRepository !== 'undefined') ? ClassRepository.getAllClasses(tid) : [];
    const recentClasses = allTeacherClasses
      .filter(c => c.status === 'planned' || (c.curriculum && c.curriculum.topic))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 4);

    this.container.innerHTML = `
      <div class="dashboard-page-layout">
        ${isCoord ? `
          <div class="coordinator-supervision-banner" style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 12px 18px; border-radius: 12px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(37,99,235,0.25); flex-wrap: wrap; gap: 10px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="background:rgba(255,255,255,0.2); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">🎓</div>
              <div>
                <div style="font-weight:800; font-size:1.02rem;">Coordinación Académica • Marisol Ruiz</div>
                <div style="font-size:0.83rem; opacity:0.92;">Supervisión pedagógica de las clases de <strong>Manuel Muñoz</strong></div>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-sm" onclick="AppRouter.navigateTo('calendar')" style="background:#ffffff; color:#1e40af; font-weight:700; border:none; padding:6px 14px; border-radius:8px; cursor:pointer;" title="Volver al calendario">
                📅 Ver Calendario
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Banner de Alerta de Planeaciones Recuperadas (Req. 136-141) -->
        ${(orphanedClasses.length > 0 && !isCoord) ? `
          <div class="recovery-banner-alert">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.3rem;">⚠️</span>
              <span>
                <strong>Atención: Hay ${orphanedClasses.length} planeaciones recuperadas</strong> que se rescataron de almacenamientos anteriores y están disponibles para revisión o vinculación.
              </span>
            </div>
            <button type="button" class="btn btn-warning btn-sm" onclick="AppRouter.navigateTo('recovery')" style="background:#f59e0b; color:#fff; border:none; font-weight:700; padding:6px 14px; border-radius:6px; cursor:pointer;">
              Ver planeaciones recuperadas →
            </button>
          </div>
        ` : ''}

        <!-- Barra Superior del Dashboard -->
        <div class="dashboard-header-card">
          <div class="dashboard-header-left">
            <span class="dashboard-badge-today">${isToday ? '🌟 HOY' : '📅 FECHA SELECCIONADA'}</span>
            <h2 class="dashboard-date-title">${dayOfWeekName.toUpperCase()}, ${formattedDate.toUpperCase()}</h2>
            <div class="dashboard-date-nav">
              <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.navigateDay(-1)" title="Día anterior">
                ◀ Anterior
              </button>
              <input type="date" value="${dateStr}" class="dashboard-date-input" onchange="DashboardView.setDate(this.value)" />
              <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.navigateDay(1)" title="Día siguiente">
                Siguiente ▶
              </button>
              ${!isToday ? `<button type="button" class="btn btn-secondary btn-sm btn-today-nav" onclick="DashboardView.setDate('${todayStr}')">Ir a Hoy</button>` : ''}
            </div>
          </div>
          <div class="dashboard-header-right">
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px; justify-content:flex-end; flex-wrap:wrap;">
              ${!isCoord ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.toggleDayTeaching('${dateStr}')" style="background:${dayView?.isRecess ? '#ecfdf5' : '#fffbeb'}; color:${dayView?.isRecess ? '#047857' : '#b45309'}; border-color:${dayView?.isRecess ? '#6ee7b7' : '#fde68a'}; font-weight:700;" title="${dayView?.isRecess ? 'Habilitar clases regulares en esta fecha' : 'Marcar esta fecha como sin clases / no lectivo'}">
                  ${dayView?.isRecess ? '📅 Habilitar clases' : '🏖️ Marcar sin clases'}
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.realignSequences()" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700;" title="Re-numerar todas las clases automáticamente según los días lectivos activos">
                  ⚡ Re-numerar
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.openRecessModal('${dateStr}')" style="background:#f8fafc; color:#475569; border-color:#cbd5e1; font-weight:700;" title="Opciones avanzadas de semana de receso o vacaciones">
                  🏖️ Opciones Receso
                </button>
              ` : ''}
              ${isCoord ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.openDayDownloadModal('${dateStr}')" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700; padding:6px 14px; border-radius:8px;">
                  📥 Descargas Word / PDF de este Día
                </button>
              ` : `
                <button type="button" class="btn btn-primary" onclick="ImportModal.open(null, () => DashboardView.render())" title="Importar planeación inteligente desde texto o portapapeles">
                  📥 Importar planeación
                </button>
              `}
            </div>
            <div class="dashboard-stats-row">
              ${dayView?.isRecess ? `
                <div class="stat-pill" style="background:#fef3c7; color:#92400e; border-color:#fde68a;">
                  <span class="stat-num" style="color:#b45309;">🏖️</span>
                  <span class="stat-desc" style="color:#92400e; font-weight:700;">${this._escape(dayView.recessInfo?.name || 'Receso')}</span>
                </div>
                <div class="stat-pill success">
                  <span class="stat-num">${dayView?.scheduledItems?.filter(i => i.isPlanned).length || 0}</span>
                  <span class="stat-desc">Planeadas</span>
                </div>
                <div class="stat-pill" style="background:#f1f5f9; color:#64748b; border-color:#e2e8f0;">
                  <span class="stat-num" style="color:#64748b;">0</span>
                  <span class="stat-desc">Pendientes</span>
                </div>
              ` : `
                <div class="stat-pill">
                  <span class="stat-num">${dayView?.scheduledItems?.length || 0}</span>
                  <span class="stat-desc">Clases hoy</span>
                </div>
                <div class="stat-pill success">
                  <span class="stat-num">${dayView?.scheduledItems?.filter(i => i.isPlanned).length || 0}</span>
                  <span class="stat-desc">Planeadas</span>
                </div>
                <div class="stat-pill warning">
                  <span class="stat-num">${dayView?.scheduledItems?.filter(i => i.isPending).length || 0}</span>
                  <span class="stat-desc">Pendientes</span>
                </div>
              `}
              ${dayView?.additionalClasses?.length > 0 ? `
                <div class="stat-pill" style="background:#f3e8ff; color:#6b21a8; border-color:#e9d5ff; cursor:pointer;" onclick="DashboardView.toggleAdditionals()" title="Ver planeaciones históricas o adicionales en esta fecha">
                  <span class="stat-num" style="color:#6b21a8;">${dayView.additionalClasses.length}</span>
                  <span class="stat-desc" style="color:#7e22ce;">Históricas</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Banner de Próxima Clase Pendiente o Receso Escolar -->
        <div id="dashboard-hero-banner-mount">
          ${this._renderHeroBanner(nextPendingItem, dayView)}
        </div>

        <div class="dashboard-main-columns">
          <!-- Columna Principal: Clases del Día -->
          <section class="dashboard-classes-section">
            <div class="section-title-row">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Horario y Sesiones de Clase del Día
              </h3>
              <div style="display:flex; gap:6px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="AppRouter.navigateTo('calendar')">
                  📅 Calendario
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="AppRouter.navigateTo('history')">
                  🕒 Historial
                </button>
              </div>
            </div>

            <div class="dashboard-classes-list">
              ${this._renderClassesList(dayView)}
            </div>

            <div id="dashboard-additionals-mount">
              ${this._renderAdditionalsSection(dayView)}
            </div>
          </section>

          <!-- Columna Lateral: Progreso y Recientes -->
          <aside class="dashboard-progress-sidebar">
            <div class="section-title-row">
              <h3 style="font-size: 0.95rem; line-height: 1.3;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Progreso por Asignatura (${currentPeriod} Período)
              </h3>
            </div>

            <div class="dashboard-progress-list">
              ${this._renderProgressList(activeSequences)}
            </div>

            <!-- Planeaciones Recientes -->
            ${recentClasses.length > 0 ? `
              <div class="dashboard-quick-actions-card" style="margin-top:1rem; padding:12px;">
                <h4 style="margin:0 0 8px; font-size:0.85rem; color:#334155;">Planeaciones Recientes</h4>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${recentClasses.map(rc => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0; font-size:0.8rem;">
                      <div>
                        <strong>${rc.subjectName} (${rc.gradeName})</strong>
                        <div style="font-size:0.72rem; color:#64748b;">Clase #${rc.sequenceNumber} • ${rc.date}</div>
                      </div>
                      <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.openClassForEditing('${rc.id}')" style="padding:2px 8px; font-size:0.75rem;">
                        ✏️
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="dashboard-quick-actions-card" style="margin-top:1rem;">
              <h4>Acciones Rápidas</h4>
              <button type="button" class="btn btn-secondary btn-block" onclick="ImportModal.open(null, () => DashboardView.render())" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700;">
                📥 Importar planeación
              </button>
              <button type="button" class="btn btn-secondary btn-block" onclick="AppRouter.navigateTo('sequences')" title="Ver todas las materias, cursos y clases consecutivas">
                📚 Explorar Materias & Clases
              </button>
              <button type="button" class="btn btn-secondary btn-block" onclick="AppRouter.navigateTo('history')">
                🕒 Historial de Planeaciones
              </button>
              <button type="button" class="btn btn-secondary btn-block" id="btn-dashboard-download-day" onclick="App.openDayDownloadModal('${dateStr}')">
                📥 Descargas de la Semana / Día
              </button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  _renderClassesList(dayView) {
    const isCoord = this._isCoordinator();
    const scheduled = dayView?.scheduledItems || [];

    if (scheduled.length === 0) {
      return `
        <div class="empty-state-card">
          <p>No hay clases asignadas en el horario escolar para este día.</p>
        </div>
      `;
    }

    return scheduled.map(item => {
      const slot = item.slot;
      const cls = item.classSession;
      const isPlanned = item.isPlanned;

      const seqNum = cls ? cls.sequenceNumber : (item.expectedSequenceNumber || '—');
      const topic = this._formatTopic(cls?.curriculum?.topic);
      const rawInicio = cls?.didacticSequence?.inicio || cls?.pedagogy?.inicio;
      const snippet = this._formatSnippet(rawInicio);

      // Si es día de receso y este slot no tiene planeación creada o con contenido
      if (dayView?.isRecess && !isPlanned) {
        return `
          <div class="class-schedule-card" style="opacity: 0.88; background: #fffdf5; border: 1.5px dashed #fcd34d;">
            <div class="class-card-time">
              <span class="card-time-str">${slot.time || 'Horario'}</span>
              <span class="card-homeroom-tag ${slot.subjectType === 'homeroom' ? 'tag-homeroom' : ''}">
                ${slot.subjectType === 'homeroom' ? 'Dirección de grupo' : slot.gradeName}
              </span>
            </div>

            <div class="class-card-content">
              <div class="class-card-header">
                <h4 class="class-subject-title" style="color: #92400e;">${slot.subjectName} — ${slot.gradeName}</h4>
                <span class="class-status-badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a;">
                  🏖️ Receso Escolar
                </span>
              </div>

              <p class="class-topic-preview" style="color: #a16207; font-style: italic;">
                Día no lectivo / receso institucional. No requiere planeación pedagógica obligatoria.
              </p>
            </div>

            <div class="class-card-actions">
              ${!isCoord ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); DashboardView.openSlotForEditing('${slot.id}', '${this._escape(slot.subjectName)}', '${this._escape(slot.gradeName)}', '${slot.time || ''}')" title="Planear de manera extraordinaria si se realizó clase este día" style="background:#ffffff; color:#b45309; border-color:#fde68a; font-size:0.78rem;">
                  + Planear sesión extra
                </button>
              ` : `
                <span style="font-size:0.8rem; color:#b45309; font-style:italic; padding:4px 8px;">Receso</span>
              `}
            </div>
          </div>
        `;
      }

      return `
        <div class="class-schedule-card ${isPlanned ? 'status-planned' : 'status-pending'}">
          <div class="class-card-time">
            <span class="card-time-str">${slot.time || 'Horario'}</span>
            <span class="card-homeroom-tag ${slot.subjectType === 'homeroom' ? 'tag-homeroom' : ''}">
              ${slot.subjectType === 'homeroom' ? 'Dirección de grupo' : slot.gradeName}
            </span>
          </div>

          <div class="class-card-content">
            <div class="class-card-header">
              <h4 class="class-subject-title">${slot.subjectName} — ${slot.gradeName}</h4>
              <span class="class-seq-badge">Clase #${seqNum}</span>
              <span class="class-status-badge ${isPlanned ? 'badge-planned' : 'badge-pending'}">
                ${isPlanned ? '✓ Planeada' : '○ Pendiente'}
              </span>
            </div>

            <p class="class-topic-preview">
              <strong>Tema:</strong> ${topic}
            </p>

            ${snippet ? `
              <p class="class-pedagogy-snippet">
                <strong>Inicio:</strong> ${snippet}
              </p>
            ` : ''}
          </div>

          <div class="class-card-actions">
            ${cls ? (isCoord ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); DashboardView.openNotebookForClass('${cls.id}')" title="Revisar Cuaderno del Docente" style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0; font-weight:700;">
                📓 Cuaderno
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); ExportService.exportClassById('${cls.id}', 'docx')" title="Descargar Word de esta clase" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700;">
                📝 Word
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); ExportService.exportClassById('${cls.id}', 'pdf')" title="Descargar PDF institucional de esta clase" style="background:#f8fafc; color:#1e293b; border-color:#cbd5e1; font-weight:700;">
                📄 PDF
              </button>
            ` : `
              <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); DashboardView.openNotebookForClass('${cls.id}')" title="Abrir Cuaderno del Docente tipo Word" style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0; font-weight:600;">
                📓 Cuaderno
              </button>
              <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); DashboardView.openClassForEditing('${cls.id}')" title="Abrir y editar planeación">
                ✏️ Editar
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); ExportService.exportClassById('${cls.id}', 'pdf')" title="Descargar PDF institucional de esta clase" style="background:#f8fafc; color:#1e293b; border-color:#cbd5e1; font-weight:600;">
                📄 PDF
              </button>
            `) : (isCoord ? `
              <span style="font-size:0.8rem; color:#94a3b8; font-style:italic; padding:4px 8px;">Sin planeación</span>
            ` : `
              <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); DashboardView.openSlotForEditing('${slot.id}', '${this._escape(slot.subjectName)}', '${this._escape(slot.gradeName)}', '${slot.time || ''}')" title="Crear y planear esta clase">
                + Planear
              </button>
            `)}
          </div>
        </div>
      `;
    }).join('');
  }

  _renderAdditionalsSection(dayView) {
    const isCoord = this._isCoordinator();
    const additionals = dayView?.additionalClasses || [];
    if (additionals.length === 0) return '';

    return `
      <div class="dashboard-additionals-card" style="margin-top: 1.5rem; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 14px 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="DashboardView.toggleAdditionals()">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.3rem;">📂</span>
            <div>
              <h4 style="margin: 0; font-size: 0.95rem; color: #6b21a8; font-weight: 700;">
                Planeaciones Históricas / Adicionales en esta Fecha (${additionals.length})
              </h4>
              <p style="margin: 2px 0 0; font-size: 0.78rem; color: #7e22ce;">
                Sesiones registradas con esta fecha que están fuera del horario regular del día (recuperadas de versiones anteriores o duplicados).
              </p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-toggle-additionals" style="border-color: #d8b4fe; color: #6b21a8; background: #fff; font-weight: 600; font-size: 0.8rem; padding: 4px 12px;">
              Mostrar (${additionals.length}) ▼
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); AppRouter.navigateTo('history')" title="Ver todas en Historial completo" style="border-color: #d8b4fe; color: #6b21a8; background: #fff; font-size: 0.8rem; padding: 4px 12px;">
              🕒 Historial
            </button>
          </div>
        </div>

        <div id="dashboard-additionals-content" data-count="${additionals.length}" style="display: none; margin-top: 14px; flex-direction: column; gap: 10px;">
          ${additionals.map(cls => {
            const hasContent = Boolean(
              (cls.curriculum?.topic && String(cls.curriculum.topic).trim().length > 0 && String(cls.curriculum.topic).trim() !== 'Sin tema planeado todavía') ||
              (cls.didacticSequence?.inicio && String(cls.didacticSequence.inicio).trim().length > 0) ||
              (cls.didacticSequence?.desarrollo && String(cls.didacticSequence.desarrollo).trim().length > 0) ||
              (cls.pedagogy?.inicio && String(cls.pedagogy.inicio).trim().length > 0) ||
              (cls.pedagogy?.desarrollo && String(cls.pedagogy.desarrollo).trim().length > 0) ||
              (cls.teacherNotebook?.studentNotebookContent && String(cls.teacherNotebook.studentNotebookContent).trim().length > 0)
            );
            const isPlanned = (cls.status === 'planned' || cls.status === 'completed') && hasContent;
            const topic = this._formatTopic(cls.curriculum?.topic || cls.topic);
            const rawInicio = cls.didacticSequence?.inicio || cls.pedagogy?.inicio;
            const snippet = this._formatSnippet(rawInicio);

            return `
              <div class="class-schedule-card ${isPlanned ? 'status-planned' : 'status-pending'}" style="border-left: 4px solid #8b5cf6; background: #ffffff;">
                <div class="class-card-time">
                  <span class="card-time-str">${cls.time || 'Histórica'}</span>
                  <span class="card-homeroom-tag" style="background:#f3e8ff; color:#7e22ce;">${cls.gradeName}</span>
                </div>

                <div class="class-card-content">
                  <div class="class-card-header">
                    <h4 class="class-subject-title">${cls.subjectName} — ${cls.gradeName}</h4>
                    <span class="class-seq-badge">Clase #${cls.sequenceNumber}</span>
                    <span class="class-status-badge badge-planned" style="background:#f3e8ff; color:#6b21a8;">
                      🌟 Registrada
                    </span>
                  </div>

                  <p class="class-topic-preview">
                    <strong>Tema:</strong> ${topic}
                  </p>

                  ${snippet ? `
                    <p class="class-pedagogy-snippet">
                      <strong>Inicio:</strong> ${snippet}
                    </p>
                  ` : ''}
                </div>

                <div class="class-card-actions">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.openNotebookForClass('${cls.id}')" title="Revisar Cuaderno del Docente" style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0; font-weight:700;">
                    📓 Cuaderno
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="ExportService.exportClassById('${cls.id}', 'docx')" title="Descargar Word" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700;">
                    📝 Word
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="ExportService.exportClassById('${cls.id}', 'pdf')" title="Descargar PDF institucional de esta clase" style="background:#f8fafc; color:#1e293b; border-color:#cbd5e1; font-weight:700;">
                    📄 PDF
                  </button>
                  ${!isCoord ? `
                    <button type="button" class="btn btn-primary btn-sm" onclick="DashboardView.openClassForEditing('${cls.id}')" title="Abrir y editar planeación">
                      ✏️ Editar
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.deleteAdditionalClass('${cls.id}')" title="Eliminar este registro adicional" style="color:#ef4444; border-color:#fca5a5;">
                      🗑️
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  _renderProgressList(activeSequences) {
    if (!activeSequences || activeSequences.length === 0) {
      return `<p style="font-size:0.8rem; color:#64748b;">No hay clases registradas en este período todavía.</p>`;
    }

    return activeSequences.map(seq => {
      return `
        <div class="progress-item-box" style="cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease;" onclick="AppRouter.navigateTo('sequences', { subject: '${this._escape(seq.subjectName)}', grade: '${this._escape(seq.gradeName)}' })" title="Ver todas las clases de ${this._escape(seq.subjectName)} (${this._escape(seq.gradeName)})">
          <div class="progress-title-row">
            <span class="prog-subj"><strong>${seq.subjectName}</strong> (${seq.gradeName})</span>
            <span class="prog-pct">${seq.percentage}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${seq.percentage}%;"></div>
          </div>
          <div class="progress-sub-text" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${seq.planned} de ${seq.total} planeadas (${seq.pending} pend.)</span>
            <span style="color:var(--primary-600); font-weight:700; font-size:0.75rem;">Ver clases →</span>
          </div>
        </div>
      `;
    }).join('');
  }

  navigateDay(delta) {
    const parts = this.selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + delta);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    this.setDate(`${yyyy}-${mm}-${dd}`);
  }

  openClassForEditing(classId) {
    if (!classId) return;
    if (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) {
      this.openNotebookForClass(classId);
      return;
    }
    AppRouter.navigateTo('editor', { classId, force: true });
  }

  openNotebookForClass(classId) {
    if (!classId) return;
    AppRouter.navigateTo('notebook', { classId, force: true });
  }

  openSlotForEditing(slotId, fallbackSubject, fallbackGrade, fallbackTime) {
    try {
      if (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) {
        if (typeof NotificationService !== 'undefined' && NotificationService.show) {
          NotificationService.show('El perfil de coordinación tiene acceso en modo de lectura y supervisión.', 'info');
        }
        return;
      }
      const tid = (typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : 'usr_manuel';
      let slot = null;

      // 1. Buscar en ScheduleRepository por ID exacto o derivado
      if (typeof ScheduleRepository !== 'undefined') {
        slot = ScheduleRepository.getSlotById(slotId, tid);

        // 2. Si no se halló por ID, buscar en slots del día actual
        if (!slot) {
          const slotsForDay = ScheduleRepository.getSlotsForDate(this.selectedDate, tid);
          slot = slotsForDay.find(s => s.id === slotId);

          // Coincidencia por asignatura y grado en el día
          if (!slot && fallbackSubject && fallbackGrade) {
            const sSub = String(fallbackSubject).toLowerCase().trim();
            const sGrd = String(fallbackGrade).toLowerCase().trim();
            slot = slotsForDay.find(s =>
              String(s.subjectName || s.subject || '').toLowerCase().trim() === sSub &&
              String(s.gradeName || s.grade || '').toLowerCase().trim() === sGrd
            );
          }
        }

        // 3. Si aún no se halló, buscar en todos los slots del docente
        if (!slot && (fallbackSubject || slotId)) {
          const allSlots = ScheduleRepository.getAllSlots(tid);
          slot = allSlots.find(s => s.id === slotId) ||
                 allSlots.find(s => fallbackSubject && fallbackGrade &&
                   String(s.subjectName || s.subject || '').toLowerCase().trim() === String(fallbackSubject).toLowerCase().trim() &&
                   String(s.gradeName || s.grade || '').toLowerCase().trim() === String(fallbackGrade).toLowerCase().trim()
                 );
        }
      }

      // 4. Si aún no existe entidad slot formal, construir una de contingencia válida
      if (!slot && (fallbackSubject || slotId)) {
        const subject = fallbackSubject || 'Sistemas';
        const grade = fallbackGrade || '3°';
        const time = fallbackTime || '7:00 - 7:50';
        let startTime = '';
        let endTime = '';
        if (time.includes('-')) {
          const parts = time.split('-').map(s => s.trim());
          startTime = parts[0] || '';
          endTime = parts[1] || '';
        }
        slot = {
          id: slotId || `slot_dyn_${Date.now()}`,
          teacherId: tid,
          subjectName: subject,
          gradeName: grade,
          group: grade,
          time: time,
          startTime: startTime,
          endTime: endTime,
          subjectType: subject.toLowerCase().includes('direccion') ? 'homeroom' : 'academic',
          active: true
        };
      }

      if (!slot) {
        console.error('[DashboardView] No se pudo resolver el slot escolar para planear:', slotId);
        alert('No se pudo identificar el horario de la clase seleccionada.');
        return;
      }

      // 5. Crear la clase para este slot en la fecha seleccionada
      let newClass = null;
      if (typeof ClassService !== 'undefined' && ClassService.createClassFromSlot) {
        newClass = ClassService.createClassFromSlot(slot, this.selectedDate, tid);
      }

      // Si ClassService falló, crear directamente sesión en ClassRepository
      if (!newClass && typeof ClassRepository !== 'undefined') {
        const nextSeq = ClassRepository.getNextSequenceNumber({
          teacherId: tid,
          period: '1°',
          subject: slot.subjectName || slot.subject,
          grade: slot.gradeName || slot.grade,
          group: slot.group,
          date: this.selectedDate
        });
        newClass = ClassRepository.createClass({
          teacherId: tid,
          date: this.selectedDate,
          time: slot.time || '',
          startTime: slot.startTime || '',
          endTime: slot.endTime || '',
          subjectName: slot.subjectName || slot.subject || 'Sistemas',
          gradeName: slot.gradeName || slot.grade || '3°',
          group: slot.group || slot.gradeName || '3°',
          period: '1°',
          sequenceNumber: nextSeq,
          status: 'pending'
        }, tid);
      }

      if (newClass && newClass.id) {
        this.openClassForEditing(newClass.id);
      } else {
        console.error('[DashboardView] Falló la creación de la clase:', slot);
        alert('Hubo un inconveniente al crear la sesión de clase. Inténtalo nuevamente.');
      }
    } catch (err) {
      console.error('[DashboardView] Error en openSlotForEditing:', err);
      alert('Error al abrir la planeación: ' + (err.message || err));
    }
  }

  toggleAdditionals() {
    const el = document.getElementById('dashboard-additionals-content');
    const btn = document.getElementById('btn-toggle-additionals');
    if (!el) return;
    const isHidden = (el.style.display === 'none' || !el.style.display);
    el.style.display = isHidden ? 'flex' : 'none';
    if (btn) {
      const count = el.dataset.count || '';
      btn.innerText = isHidden ? 'Ocultar ▲' : `Mostrar (${count}) ▼`;
    }
  }

  deleteAdditionalClass(classId) {
    if (!confirm('¿Deseas eliminar esta planeación adicional/histórica? Esta acción quitará este duplicado de forma segura sin afectar las demás clases.')) {
      return;
    }
    const tid = ClassRepository._getCurrentTeacherId();
    const success = ClassRepository.deleteClass(classId, tid);
    if (success) {
      if (typeof NotificationService !== 'undefined' && NotificationService.show) {
        NotificationService.show('Planeación eliminada correctamente', 'success');
      }
      this.render();
    }
  }

  openRecessModal(targetDate) {
    const dateStr = targetDate || this.selectedDate;
    if (typeof HolidayService === 'undefined') return;
    const { mondayStr, fridayStr } = HolidayService.getWeekRange(dateStr);
    const recessInfo = HolidayService.isRecessOrNonSchoolDay(dateStr);

    let modal = document.getElementById('modal-recess-manager');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-recess-manager';
      modal.className = 'modal-overlay';
      modal.style.zIndex = '99999';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 520px; width: 92%; padding: 24px; border-radius: 14px; box-shadow: 0 20px 40px rgba(0,0,0,0.22); background: #ffffff;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <h3 style="margin:0; font-size: 1.25rem; display:flex; align-items:center; gap: 8px; color:#1e293b;">
            <span>🏖️</span> Gestión de Receso y Vacaciones
          </h3>
          <button type="button" class="btn-close" onclick="DashboardView.closeRecessModal()" style="border:none; background:transparent; font-size:1.5rem; cursor:pointer; color:#64748b;">×</button>
        </div>

        <p style="font-size: 0.9rem; color: #475569; margin-bottom: 18px; line-height: 1.45;">
          Indica si esta semana o fecha corresponde a receso escolar o vacaciones. Al marcarlo, el sistema sabrá que <strong>no se requieren planeaciones</strong> y no las contará como pendientes.
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:0.88rem;">
          <div style="margin-bottom:6px;"><strong>Fecha actual:</strong> ${dateStr}</div>
          <div style="margin-bottom:6px;"><strong>Semana completa:</strong> Del ${mondayStr} al ${fridayStr}</div>
          <div><strong>Estado:</strong> ${recessInfo.isRecess ? `<span style="color:#b45309; font-weight:700;">🏖️ ${recessInfo.name}</span>` : '<span style="color:#16a549; font-weight:700;">Semana lectiva ordinaria</span>'}</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <button type="button" class="btn btn-primary" onclick="DashboardView.setWeekRecess('${dateStr}')" style="background:#f59e0b; border-color:#d97706; padding:10px 16px; font-weight:700; font-size:0.95rem; justify-content:center;">
            🏖️ Marcar TODA la semana como Receso (${mondayStr} a ${fridayStr})
          </button>
          <button type="button" class="btn btn-secondary" onclick="DashboardView.setDayRecess('${dateStr}')" style="padding:10px 16px; font-weight:600; font-size:0.92rem; justify-content:center;">
            📅 Marcar solo este día (${dateStr}) como No Lectivo
          </button>
          ${recessInfo.isRecess ? `
            <button type="button" class="btn btn-secondary" onclick="DashboardView.removeRecess('${dateStr}')" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5; padding:8px 16px; font-weight:700; font-size:0.9rem; justify-content:center; margin-top:6px;">
              ❌ Quitar Receso / Reanudar Planeaciones Normales
            </button>
          ` : ''}
        </div>

        <div style="margin-top: 20px; text-align: right;">
          <button type="button" class="btn btn-secondary" onclick="DashboardView.closeRecessModal()">
            Cerrar
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  toggleDayTeaching(dateStr) {
    const targetDate = dateStr || this.selectedDate;
    if (typeof HolidayService === 'undefined') return;
    const res = HolidayService.toggleNonTeachingDay(targetDate);
    this.setDate(targetDate);
    if (window.Calendar && window.Calendar.render) window.Calendar.render();
    if (typeof App !== 'undefined' && App.showToast) {
      if (res.isNonTeaching) {
        App.showToast(`🏖️ ${targetDate} marcado como día sin clases. Clases re-numeradas.`, 'success');
      } else {
        App.showToast(`📅 ${targetDate} habilitado para clases regulares. Clases re-numeradas.`, 'info');
      }
    }
  }

  realignSequences() {
    let count = 0;
    if (typeof ClassRepository !== 'undefined') {
      if (typeof ClassRepository.clearScheduleSequenceCache === 'function') {
        ClassRepository.clearScheduleSequenceCache();
      }
      if (typeof ClassRepository.realignSequenceNumbersToSchedule === 'function') {
        count = ClassRepository.realignSequenceNumbersToSchedule();
      }
    }
    this.setDate(this.selectedDate);
    if (window.Calendar && window.Calendar.render) window.Calendar.render();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`⚡ ¡${count} clases re-numeradas según el horario escolar!`, 'success');
    }
  }

  closeRecessModal() {
    const modal = document.getElementById('modal-recess-manager');
    if (modal) modal.style.display = 'none';
  }

  setWeekRecess(dateStr) {
    if (typeof HolidayService === 'undefined') return;
    HolidayService.setRecessForWeek(dateStr, 'Semana de Receso Escolar');
    this.closeRecessModal();
    if (typeof NotificationService !== 'undefined' && NotificationService.show) {
      NotificationService.show('Semana marcada como Receso Escolar. No se requerirán planeaciones.', 'success');
    }
    this.setDate(dateStr);
  }

  setDayRecess(dateStr) {
    if (typeof HolidayService === 'undefined') return;
    HolidayService.setRecessForSingleDay(dateStr, 'Día de Receso / No Lectivo');
    this.closeRecessModal();
    if (typeof NotificationService !== 'undefined' && NotificationService.show) {
      NotificationService.show('Día marcado como No Lectivo.', 'success');
    }
    this.setDate(dateStr);
  }

  removeRecess(dateStr) {
    if (typeof HolidayService === 'undefined') return;
    HolidayService.removeRecessForDate(dateStr);
    this.closeRecessModal();
    if (typeof NotificationService !== 'undefined' && NotificationService.show) {
      NotificationService.show('Receso eliminado. Se han reanudado las planeaciones normales para esta fecha.', 'info');
    }
    this.setDate(dateStr);
  }

  _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

const DashboardView = new DashboardViewClass();

if (typeof window !== 'undefined') {
  window.DashboardView = DashboardView;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardView;
}
