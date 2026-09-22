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
  }

  setDate(dateStr) {
    this.selectedDate = dateStr;
    if (typeof AppState !== 'undefined') {
      AppState.set('currentDate', dateStr);
    }
    this.render();
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

  render() {
    if (!this.container) {
      this.container = document.getElementById('dashboard-view');
    }
    if (!this.container) return;

    const tid = ClassRepository._getCurrentTeacherId();
    const dateStr = this.selectedDate;

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
        <!-- Banner de Alerta de Planeaciones Recuperadas (Req. 136-141) -->
        ${orphanedClasses.length > 0 ? `
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
              ${!isToday ? `<button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.setDate('${todayStr}')">Ir a Hoy</button>` : ''}
            </div>
          </div>
          <div class="dashboard-header-right">
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px; justify-content:flex-end;">
              <button type="button" class="btn btn-primary" onclick="ImportModal.open(null, () => DashboardView.render())" title="Importar planeación inteligente desde texto o portapapeles">
                📥 Importar planeación
              </button>
            </div>
            <div class="dashboard-stats-row">
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
            </div>
          </div>
        </div>

        <!-- Banner de Próxima Clase Pendiente -->
        ${nextPendingItem ? `
          <div class="dashboard-hero-banner">
            <div class="hero-left">
              <span class="hero-tag">⚡ PRÓXIMA CLASE PENDIENTE</span>
              <h3 class="hero-subject">${nextPendingItem.slot.subjectName} — ${nextPendingItem.slot.gradeName}</h3>
              <p class="hero-meta">
                ⏰ ${nextPendingItem.slot.time || 'Horario asignado'} 
                ${nextPendingItem.classSession ? `• Clase #${nextPendingItem.classSession.sequenceNumber}` : '• Nueva sesión'}
              </p>
            </div>
            <div class="hero-right">
              <button type="button" class="btn btn-primary btn-lg" onclick="DashboardView.openSlotForEditing('${nextPendingItem.slot.id}')">
                ✏️ Continuar planeación
              </button>
            </div>
          </div>
        ` : `
          <div class="dashboard-hero-banner completed">
            <div class="hero-left">
              <span class="hero-tag">✅ DÍA AL DÍA</span>
              <h3 class="hero-subject">Todas las clases de este día están planeadas</h3>
              <p class="hero-meta">Puedes revisar o descargar los preparadores institucionales a continuación.</p>
            </div>
          </div>
        `}

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

            ${this._renderAdditionalsSection(dayView)}
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
              <button type="button" class="btn btn-secondary btn-block" onclick="App.openDayDownloadModal('${dateStr}')">
                📥 Descargas de la Semana / Día
              </button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  _renderClassesList(dayView) {
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

      const seqNum = cls ? cls.sequenceNumber : '—';
      const topic = this._formatTopic(cls?.curriculum?.topic);
      const rawInicio = cls?.didacticSequence?.inicio || cls?.pedagogy?.inicio;
      const snippet = this._formatSnippet(rawInicio);

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
            ${cls ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.openNotebookForClass('${cls.id}')" title="Abrir Cuaderno del Docente tipo Word" style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0; font-weight:600;">
                📓 Cuaderno
              </button>
              <button type="button" class="btn btn-primary btn-sm" onclick="DashboardView.openClassForEditing('${cls.id}')" title="Abrir y editar planeación">
                ✏️ Editar
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="ExportService.exportClassById('${cls.id}', 'pdf')" title="Descargar PDF institucional de esta clase" style="background:#f8fafc; color:#1e293b; border-color:#cbd5e1; font-weight:600;">
                📄 PDF
              </button>
            ` : `
              <button type="button" class="btn btn-primary btn-sm" onclick="DashboardView.openSlotForEditing('${slot.id}')" title="Crear y planear esta clase">
                + Planear
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  _renderAdditionalsSection(dayView) {
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
                  <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.openNotebookForClass('${cls.id}')" title="Abrir Cuaderno del Docente tipo Word" style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0; font-weight:600;">
                    📓 Cuaderno
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" onclick="DashboardView.openClassForEditing('${cls.id}')" title="Abrir y editar planeación">
                    ✏️ Editar
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="ExportService.exportClassById('${cls.id}', 'pdf')" title="Descargar PDF institucional de esta clase" style="background:#f8fafc; color:#1e293b; border-color:#cbd5e1; font-weight:600;">
                    📄 PDF
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="DashboardView.deleteAdditionalClass('${cls.id}')" title="Eliminar este registro adicional" style="color:#ef4444; border-color:#fca5a5;">
                    🗑️
                  </button>
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
    AppRouter.navigateTo('editor', { classId });
  }

  openNotebookForClass(classId) {
    if (!classId) return;
    AppRouter.navigateTo('notebook', { classId });
  }

  openSlotForEditing(slotId) {
    const tid = ClassRepository._getCurrentTeacherId();
    const slot = ScheduleRepository.getSlotById(slotId, tid);
    if (!slot) return;

    // Crear la clase para este slot en la fecha seleccionada
    const newClass = ClassService.createClassFromSlot(slot, this.selectedDate, tid);
    if (newClass) {
      this.openClassForEditing(newClass.id);
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
