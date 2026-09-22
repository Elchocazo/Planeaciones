/**
 * VISTA HISTORIAL GLOBAL DE PLANEACIONES (HistoryView)
 * 
 * Ofrece al docente un inventario centralizado de todas sus clases y planeaciones:
 * - Filtros por Período, Asignatura, Grado y Estado.
 * - Búsqueda en tiempo real por tema, número de clase, fecha o palabras clave.
 * - Indicador de completitud curricular y pedagógica.
 * - Acciones directas: Editar, Descargar PDF/Word institucional, Duplicar.
 */

class HistoryViewClass {
  constructor() {
    this.container = null;
    this.searchQuery = '';
    this.selectedPeriod = 'all';
    this.selectedSubject = 'all';
    this.selectedGrade = 'all';
    this.selectedStatus = 'all';
  }

  init() {
    this.container = document.getElementById('history-view');
  }

  render() {
    if (!this.container) {
      this.container = document.getElementById('history-view');
    }
    if (!this.container) return;

    const tid = (typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : null;
    const allClasses = (typeof ClassRepository !== 'undefined') ? ClassRepository.getAllClasses(tid) : [];

    // Extraer listas únicas para filtros
    const subjects = [...new Set(allClasses.map(c => c.subjectName || c.subject).filter(Boolean))].sort();
    const grades = [...new Set(allClasses.map(c => c.gradeName || c.grade).filter(Boolean))].sort();

    // Filtrar clases
    const filtered = allClasses.filter(cls => {
      // Filtro Período
      if (this.selectedPeriod !== 'all' && cls.period !== this.selectedPeriod) {
        return false;
      }
      // Filtro Asignatura
      const sub = cls.subjectName || cls.subject || '';
      if (this.selectedSubject !== 'all' && sub !== this.selectedSubject) {
        return false;
      }
      // Filtro Grado
      const grd = cls.gradeName || cls.grade || '';
      if (this.selectedGrade !== 'all' && grd !== this.selectedGrade) {
        return false;
      }
      // Filtro Estado
      if (this.selectedStatus === 'planned' && cls.status !== 'planned') return false;
      if (this.selectedStatus === 'pending' && cls.status !== 'pending') return false;
      if (this.selectedStatus === 'orphaned' && !cls.isOrphaned) return false;

      // Filtro de búsqueda por texto
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        const textToSearch = [
          cls.subjectName,
          cls.gradeName,
          cls.date,
          `clase ${cls.sequenceNumber}`,
          `clase #${cls.sequenceNumber}`,
          `#${cls.sequenceNumber}`,
          cls.curriculum?.topic,
          cls.curriculum?.dba,
          cls.didacticSequence?.inicio,
          cls.didacticSequence?.desarrollo,
          cls.didacticSequence?.cierre,
          cls.pedagogy?.inicio,
          cls.pedagogy?.desarrollo,
          cls.teacherNotebook?.question,
          cls.teacherNotebook?.studentNotebookContent
        ].filter(Boolean).join(' ').toLowerCase();

        if (!textToSearch.includes(q)) return false;
      }

      return true;
    });

    // Ordenar por fecha desc, luego por secuencia desc
    filtered.sort((a, b) => {
      if (a.date && b.date && a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.sequenceNumber || 0) - (a.sequenceNumber || 0);
    });

    this.container.innerHTML = `
      <div class="history-page-layout">
        <!-- Encabezado de la Vista -->
        <div class="section-title-row" style="margin-bottom:1.25rem;">
          <div>
            <h2 style="font-size:1.4rem; font-weight:800; color:var(--slate-800); margin:0 0 4px;">
              🕒 Historial General de Planeaciones
            </h2>
            <p style="font-size:0.85rem; color:var(--slate-500); margin:0;">
              Consulta, busca y descarga todas las clases registradas en el sistema. Total: <strong>${allClasses.length}</strong> clases.
            </p>
          </div>

          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-secondary" onclick="AppRouter.goBack()" title="Volver a la sección anterior">
              ← Volver
            </button>
            <button type="button" class="btn btn-primary" onclick="ImportModal.open(null, () => HistoryView.render())">
              📥 Importar planeación
            </button>
          </div>
        </div>

        <!-- Barra de Filtros y Búsqueda -->
        <div class="history-filters-bar">
          <input 
            type="text" 
            class="form-input history-search-input" 
            placeholder="🔍 Buscar por tema, clase #, fecha, conceptos clave..." 
            value="${this._escape(this.searchQuery)}"
            oninput="HistoryView.onSearchInput(this.value)"
          />

          <select class="history-filter-select" onchange="HistoryView.onPeriodFilter(this.value)">
            <option value="all" ${this.selectedPeriod === 'all' ? 'selected' : ''}>Todos los Períodos</option>
            <option value="1°" ${this.selectedPeriod === '1°' ? 'selected' : ''}>1° Período</option>
            <option value="2°" ${this.selectedPeriod === '2°' ? 'selected' : ''}>2° Período</option>
            <option value="3°" ${this.selectedPeriod === '3°' ? 'selected' : ''}>3° Período</option>
            <option value="4°" ${this.selectedPeriod === '4°' ? 'selected' : ''}>4° Período</option>
          </select>

          <select class="history-filter-select" onchange="HistoryView.onSubjectFilter(this.value)">
            <option value="all" ${this.selectedSubject === 'all' ? 'selected' : ''}>Todas las Materias</option>
            ${subjects.map(s => `
              <option value="${this._escape(s)}" ${this.selectedSubject === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>

          <select class="history-filter-select" onchange="HistoryView.onGradeFilter(this.value)">
            <option value="all" ${this.selectedGrade === 'all' ? 'selected' : ''}>Todos los Grados</option>
            ${grades.map(g => `
              <option value="${this._escape(g)}" ${this.selectedGrade === g ? 'selected' : ''}>${g}</option>
            `).join('')}
          </select>

          <select class="history-filter-select" onchange="HistoryView.onStatusFilter(this.value)">
            <option value="all" ${this.selectedStatus === 'all' ? 'selected' : ''}>Todos los Estados</option>
            <option value="planned" ${this.selectedStatus === 'planned' ? 'selected' : ''}>✓ Planeadas</option>
            <option value="pending" ${this.selectedStatus === 'pending' ? 'selected' : ''}>○ Pendientes</option>
            <option value="orphaned" ${this.selectedStatus === 'orphaned' ? 'selected' : ''}>⚠️ Recuperadas</option>
          </select>

          ${(this.searchQuery || this.selectedPeriod !== 'all' || this.selectedSubject !== 'all' || this.selectedGrade !== 'all' || this.selectedStatus !== 'all') ? `
            <button type="button" class="btn btn-secondary btn-sm" onclick="HistoryView.clearFilters()">
              Limpiar filtros
            </button>
          ` : ''}
        </div>

        <!-- Tabla de Resultados -->
        ${filtered.length > 0 ? `
          <div style="overflow-x:auto;">
            <table class="history-table">
              <thead>
                <tr>
                  <th style="width:110px;">Fecha</th>
                  <th style="width:85px;">Clase #</th>
                  <th style="width:160px;">Materia</th>
                  <th style="width:100px;">Grado</th>
                  <th style="width:75px;">Período</th>
                  <th>Tema / Eje Temático</th>
                  <th style="width:105px;">Estado</th>
                  <th style="width:170px; text-align:right;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(cls => {
                  const isPlanned = cls.status === 'planned' || Boolean(cls.curriculum?.topic);
                  const completeness = (typeof ClassRepository !== 'undefined') ? ClassRepository.getPlanningCompleteness(cls) : { percent: 0 };
                  const topic = cls.curriculum?.topic || cls.topic || '<em style="color:#94a3b8;">Sin tema registrado</em>';

                  return `
                    <tr>
                      <td style="font-weight:600; font-size:0.82rem;">
                        ${cls.date || '<span style="color:#f59e0b;">Sin fecha</span>'}
                      </td>
                      <td>
                        <span class="class-seq-badge">#${cls.sequenceNumber}</span>
                      </td>
                      <td>
                        <strong>${cls.subjectName || cls.subject || '—'}</strong>
                      </td>
                      <td>
                        <span class="card-homeroom-tag">${cls.gradeName || cls.grade || '—'}</span>
                      </td>
                      <td style="text-align:center;">
                        ${cls.period || '1°'}
                      </td>
                      <td>
                        <div>${topic}</div>
                        <div style="font-size:0.72rem; color:#64748b; margin-top:2px;">
                          Completitud: <strong>${completeness.percent}%</strong>
                        </div>
                      </td>
                      <td>
                        ${cls.isOrphaned ? `
                          <span class="badge-pending" style="background:#fef3c7; color:#92400e; font-size:0.75rem; padding:2px 8px; border-radius:12px;">⚠️ Recuperada</span>
                        ` : isPlanned ? `
                          <span class="badge-planned" style="font-size:0.75rem; padding:2px 8px; border-radius:12px;">✓ Planeada</span>
                        ` : `
                          <span class="badge-pending" style="font-size:0.75rem; padding:2px 8px; border-radius:12px;">○ Pendiente</span>
                        `}
                      </td>
                      <td style="text-align:right;">
                        <div style="display:inline-flex; gap:4px;">
                          <button type="button" class="btn btn-primary btn-sm" onclick="AppRouter.navigateTo('class-editor', { classId: '${cls.id}' })" title="Editar planeación">
                            ✏️
                          </button>
                          <button type="button" class="btn btn-secondary btn-sm" onclick="ExportService.exportClassById('${cls.id}', 'pdf')" title="Descargar PDF">
                            📄
                          </button>
                          <button type="button" class="btn btn-secondary btn-sm" onclick="ExportService.exportClassById('${cls.id}', 'docx')" title="Descargar Word">
                            📝
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state-card" style="text-align:center; padding:3rem 1rem;">
            <p style="font-size:1.1rem; color:#64748b; margin-bottom:1rem;">
              No se encontraron planeaciones con los filtros seleccionados.
            </p>
            <button type="button" class="btn btn-secondary" onclick="HistoryView.clearFilters()">
              Restablecer filtros
            </button>
          </div>
        `}
      </div>
    `;
  }

  onSearchInput(val) {
    this.searchQuery = val;
    this.render();
  }

  onPeriodFilter(val) {
    this.selectedPeriod = val;
    this.render();
  }

  onSubjectFilter(val) {
    this.selectedSubject = val;
    this.render();
  }

  onGradeFilter(val) {
    this.selectedGrade = val;
    this.render();
  }

  onStatusFilter(val) {
    this.selectedStatus = val;
    this.render();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedPeriod = 'all';
    this.selectedSubject = 'all';
    this.selectedGrade = 'all';
    this.selectedStatus = 'all';
    this.render();
  }

  _escape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

const HistoryView = new HistoryViewClass();

if (typeof window !== 'undefined') {
  window.HistoryView = HistoryView;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HistoryView;
}
