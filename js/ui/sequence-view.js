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
  }

  init() {
    this.container = document.getElementById('sequences-view');
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

  createNewClassInGroup(subjectName, gradeName, groupName) {
    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId
      ? ClassRepository._getCurrentTeacherId()
      : 'usr_manuel';

    const repo = ClassRepository;
    const nextSeq = repo.getNextSequenceNumber({
      teacherId: tid,
      period: this.selectedPeriod,
      subject: subjectName,
      grade: gradeName,
      group: groupName || gradeName
    });

    const newClass = repo.createClass({
      teacherId: tid,
      period: this.selectedPeriod,
      subjectName: subjectName,
      gradeName: gradeName,
      group: groupName || gradeName,
      sequenceNumber: nextSeq,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending'
    }, tid);

    if (newClass) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`✓ Creada nueva Clase #${newClass.sequenceNumber} de ${subjectName} (${gradeName})`, 'success');
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

    this.container.innerHTML = `
      <div class="sequences-page-layout">
        <!-- Tarjeta Principal de Encabezado y Navegación Curricular -->
        <div class="sequences-header-card">
          <div class="seq-header-top-row">
            <div class="header-title-group">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="seq-header-icon">📚</span>
                <div>
                  <h2 style="margin:0; font-size:1.35rem; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:8px;">
                    Panel de Materias y Clases
                  </h2>
                  <p class="header-sub" style="margin:2px 0 0; font-size:0.85rem; color:#64748b;">
                    Secuencia curricular organizada clase por clase (<strong>Clase #1</strong>, <strong>Clase #2</strong>, ...) para cada asignatura y grado
                  </p>
                </div>
              </div>
            </div>

            <!-- Selector de Período Académico -->
            <div class="seq-period-selector-box">
              <span class="seq-period-label">Período:</span>
              <div class="seq-period-pills">
                ${['1°', '2°', '3°', '4°'].map(p => `
                  <button type="button" 
                    class="seq-period-pill ${this.selectedPeriod === p ? 'active' : ''}" 
                    onclick="SequenceView.setPeriod('${p}')"
                    title="Ver planeaciones del ${p} Período">
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
                <div class="kpi-value text-amber-600">${totalPending}</div>
                <div class="kpi-label">Pendientes</div>
              </div>
            </div>
            <div class="seq-kpi-progress-col">
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:4px; color:#334155;">
                <span>Progreso General del ${this.selectedPeriod} Período</span>
                <span style="color:#2563eb;">${overallPercentage}%</span>
              </div>
              <div class="seq-progress-track">
                <div class="seq-progress-fill" style="width: ${overallPercentage}%;"></div>
              </div>
            </div>
          </div>

          <!-- Barra de Controles: Búsqueda y Filtros de Estado -->
          <div class="seq-controls-bar">
            <div class="seq-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" 
                id="seq-search-input" 
                class="seq-search-input" 
                placeholder="Buscar por asignatura, grado o tema..." 
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
              <button type="button" class="btn btn-secondary btn-sm" onclick="AppRouter.goBack()" title="Regresar a la pantalla anterior">
                ← Volver
              </button>
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
            <button type="button" class="btn btn-primary" onclick="AppRouter.navigateTo('dashboard')">
              ← Volver al Inicio
            </button>
          </div>
        </div>
      `;
    }

    return sequences.map(group => {
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
        <div class="seq-group-card">
          <!-- Cabecera de la Materia -->
          <div class="seq-group-header">
            <div class="seq-group-info">
              <div class="seq-subj-icon-box">${icon}</div>
              <div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <h3 class="seq-group-title">${this._escapeHtml(group.subjectName)}</h3>
                  <span class="seq-grade-badge">${this._escapeHtml(group.gradeName)}</span>
                  <span class="seq-period-mini-tag">${group.period} Período</span>
                </div>
                <div class="seq-group-meta">
                  <strong>${group.planned}</strong> de <strong>${group.total}</strong> clases planeadas • ${group.percentage}% de cobertura
                </div>
              </div>
            </div>

            <div class="seq-group-actions-col">
              <div class="seq-group-progress-wrap">
                <span class="seq-group-pct-text">${group.percentage}%</span>
                <div class="seq-group-progress-bar">
                  <div class="seq-group-progress-fill" style="width: ${group.percentage}%;"></div>
                </div>
              </div>

              <div class="seq-group-btns">
                <button type="button" 
                  class="btn btn-secondary btn-sm" 
                  onclick="SequenceView.openImportForGroup('${this._escapeJs(group.subjectName)}', '${this._escapeJs(group.gradeName)}', '${this._escapeJs(group.group)}')" 
                  title="Importar planeación para ${group.subjectName} (${group.gradeName})">
                  📥 Importar
                </button>
                <button type="button" 
                  class="btn btn-primary btn-sm" 
                  onclick="SequenceView.createNewClassInGroup('${this._escapeJs(group.subjectName)}', '${this._escapeJs(group.gradeName)}', '${this._escapeJs(group.group)}')" 
                  title="Crear nueva Clase #${nextSequenceNum} en esta materia">
                  ➕ Clase #${nextSequenceNum}
                </button>
              </div>
            </div>
          </div>

          <!-- Cuadrícula Secuencial de Clases (#1, #2, #3...) -->
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
                <div class="seq-class-card ${isPlanned ? 'card-planned' : 'card-pending'}">
                  <div class="seq-class-card-top">
                    <div class="seq-class-num-badge ${isPlanned ? 'num-planned' : 'num-pending'}">
                      Clase #${cls.sequenceNumber}
                    </div>
                    <span class="seq-class-status-text ${isPlanned ? 'status-planned' : 'status-pending'}">
                      ${isPlanned ? '✓ Planeada' : '○ Pendiente'}
                    </span>
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
                    ${hasAttachments ? `<span class="feat-tag feat-att" title="${cls.attachments.length} archivo(s) anexo(s)">📎 ${cls.attachments.length}</span>` : ''}
                  </div>

                  <!-- Botones de Acción Directa -->
                  <div class="seq-class-actions">
                    <button type="button" 
                      class="btn btn-primary btn-sm btn-action-plan" 
                      onclick="AppRouter.navigateTo('editor', { classId: '${cls.id}' })" 
                      title="Editar planeación de Clase #${cls.sequenceNumber}">
                      ✏️ ${isPlanned ? 'Editar' : 'Planear'}
                    </button>
                    <button type="button" 
                      class="btn btn-secondary btn-sm" 
                      onclick="AppRouter.navigateTo('notebook', { classId: '${cls.id}' })" 
                      title="Ver Cuaderno del Docente / Guía">
                      📓
                    </button>
                    <button type="button" 
                      class="btn btn-secondary btn-sm" 
                      onclick="ExportService.exportClassById('${cls.id}', 'pdf')" 
                      title="Descargar PDF de esta clase">
                      📄
                    </button>
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
}

const SequenceView = new SequenceViewClass();

if (typeof window !== 'undefined') {
  window.SequenceView = SequenceView;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SequenceView;
}
