/**
 * VISTA EDITOR DE CLASE (ClassEditorView)
 * Editor pedagógico atómico individual para una sesión de clase.
 *
 * Características principales:
 * - Guardado atómico exclusivo: [Guardar clase] y [Descargar PDF] juntos (Req. 15, 88).
 * - Indicador de estado de persistencia real: ✓ Guardado | ● Cambios sin guardar | Guardando... | Error (Req. 16).
 * - Autoguardado con debounce (1,000 ms) exclusivo sobre esta clase (Req. 17).
 * - Campos pedagógicos separados: Inicio, Desarrollo, Cierre, Recursos, Evaluación, Tareas, Observaciones (Req. 34-41).
 * - Modos de edición: [Planeación Rápida] vs [Planeación Detallada] (Req. 53, 54).
 * - Selector curricular desde la Malla con Snapshot inmutable (Req. 43, 44).
 * - Botones pedagógicos: [Continuar con la siguiente →] y [Duplicar como siguiente] (Req. 30, 31).
 */

class ClassEditorViewClass {
  constructor() {
    this.container = null;
    this.currentClass = null;
    this.editorMode = 'detailed'; // 'detailed' | 'quick'
    this.activeTab = 'secuencia'; // 'secuencia' | 'cuaderno'
  }

  init() {
    this.container = document.getElementById('class-editor-view');

    // Suscribirse al estado global para actualizar badges de guardado
    if (typeof AppState !== 'undefined') {
      AppState.subscribe((state, key) => {
        if (key === 'saveStatus' || key === 'isDirty') {
          this._updateSaveStatusBadge(state.saveStatus, state.isDirty);
        }
      });
    }

    // Auto-redimensionamiento dinámico en tiempo real ante escritura o pegado
    if (this.container) {
      this.container.addEventListener('input', (e) => {
        if (e.target && e.target.tagName === 'TEXTAREA') {
          this.autoResizeTextarea(e.target);
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        if (this.container && this.container.offsetParent !== null) {
          this.autoResizeAllTextareas();
        }
      });
    }
  }

  loadClass(classId) {
    if (!this.container) {
      this.container = document.getElementById('class-editor-view');
    }
    if (!this.container) return;

    // Obtener la clase de forma aislada desde ClassRepository
    const cls = ClassRepository.getClass(classId);
    if (!cls) {
      alert('No se encontró la sesión de clase solicitada.');
      AppRouter.navigateTo('dashboard');
      return;
    }

    this.currentClass = JSON.parse(JSON.stringify(cls));
    this.activeTab = 'secuencia';
    ClassService.setCurrentEditingClass(cls.id);

    this.render();
  }

  setEditorMode(mode) {
    this._syncFromDomToCurrentClass();
    this.editorMode = mode;
    this.render();
  }

  switchTab(tab) {
    if (this.activeTab === tab) return;
    this._syncFromDomToCurrentClass();
    this.activeTab = tab;
    this.render();
  }

  openImportModal() {
    this._syncFromDomToCurrentClass();
    if (typeof ImportModal !== 'undefined') {
      ImportModal.open(this.currentClass, (updatedClass) => {
        this.currentClass = JSON.parse(JSON.stringify(updatedClass));
        this.render();
      });
    } else {
      alert('El módulo de importación no está disponible.');
    }
  }

  openNotebookEditor() {
    this._syncFromDomToCurrentClass();
    if (this.currentClass && this.currentClass.id) {
      if (typeof ClassService !== 'undefined' && ClassService.saveClass) {
        ClassService.saveClass(this.currentClass);
      }
      if (typeof AppRouter !== 'undefined') {
        AppRouter.navigateTo('notebook', { classId: this.currentClass.id });
      }
    }
  }

  _hasNotebookContent() {
    if (!this.currentClass) return false;
    const nb = this.currentClass.teacherNotebook || {};
    return Boolean(
      (nb.question && nb.question.trim()) ||
      (nb.dynamics && nb.dynamics.trim()) ||
      (nb.studentNotebookContent && nb.studentNotebookContent.trim()) ||
      (nb.practicalActivity && nb.practicalActivity.trim()) ||
      (nb.detailedContent && nb.detailedContent.trim()) ||
      (nb.sourceText && nb.sourceText.trim()) ||
      (this.currentClass.notebookContent && this.currentClass.notebookContent.trim())
    );
  }

  render() {
    if (!this.container || !this.currentClass) return;

    const cls = this.currentClass;
    const dayName = cls.dayOfWeek || (typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(cls.date) : 'Día');
    const formattedDate = typeof ExportService !== 'undefined' ? ExportService.formatDate(cls.date) : cls.date;
    const timeStr = cls.time || (cls.startTime && cls.endTime ? `${cls.startTime} - ${cls.endTime}` : 'Horario escolar');

    const ped = cls.didacticSequence || cls.pedagogy || {
      inicio: '', desarrollo: cls.description || '', cierre: '', recursos: '', evaluation: '', tareas: '', durations: {}
    };
    const cur = cls.curriculum || {
      topic: cls.topic || '', dba: cls.dba || '', achievement: cls.achievement || ''
    };
    const nb = cls.teacherNotebook || {
      question: '', dynamics: '', studentNotebookContent: cls.notebookContent || '', practicalActivity: '', additionalNotes: '', sourceText: ''
    };

    const durations = ped.durations || {};
    const isDirGroup = (cls.subjectType === 'homeroom');

    this.container.innerHTML = `
      <div class="class-editor-layout">
        <!-- 1. CABECERA LIMPIA DEL EDITOR (Req. 32) -->
        <header class="class-editor-header">
          <div class="header-left">
            <button type="button" class="btn btn-secondary btn-sm" onclick="ClassEditorView.goBack()" title="Volver a la sección anterior">
              ← Volver
            </button>
            <div class="class-title-meta">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <h2 class="class-title-subject" style="margin:0;">
                  ${cls.subjectName} — ${cls.gradeName}
                </h2>
                <!-- Botón / Badge Interactivo para Modificar el # de Clase -->
                <button type="button" class="class-header-seq-btn" onclick="ClassEditorView.openChangeNumberModal()" style="display:inline-flex; align-items:center; gap:5px; background:var(--primary-600); color:#ffffff; border:none; padding:4px 10px; border-radius:14px; font-size:0.85rem; font-weight:700; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.1); transition:all 0.15s ease;" title="Haga clic para modificar el número de clase y continuar el conteo">
                  <span>Clase #${cls.sequenceNumber}</span>
                  <span style="font-size:0.75rem; background:rgba(255,255,255,0.22); padding:1px 6px; border-radius:8px;">✏️ Cambiar #</span>
                </button>
              </div>

              <div style="display:flex; align-items:center; gap:8px; margin-top:5px; flex-wrap:wrap;">
                <span class="class-header-sub" style="display:inline-flex; align-items:center; gap:5px;">
                  <span>📅 <strong>${dayName}</strong>, ${formattedDate}</span>
                </span>
                <!-- Botón Prominente para Modificar el Día / Fecha de la Clase -->
                <button type="button" class="btn btn-secondary btn-sm" onclick="ClassEditorView.openChangeDateModal()" style="font-size:0.75rem; font-weight:700; padding:2px 9px; border-radius:12px; color:var(--primary-700); background:#eef2ff; border:1px solid #c7d2fe; cursor:pointer; display:inline-flex; align-items:center; gap:3px;" title="Cambiar la fecha o día de la semana de esta clase">
                  📅 Modificar día / fecha
                </button>
                <span style="color:var(--slate-300);">•</span>
                <span class="class-header-sub">⏰ ${timeStr}</span>
                <span style="color:var(--slate-300);">•</span>
                <span class="class-header-sub">${cls.period} Período</span>
              </div>
            </div>
          </div>

          <div class="header-center">
            <!-- Estado de Guardado en Tiempo Real (Req. 16) -->
            <div id="editor-save-badge" class="editor-save-badge status-saved" title="Estado de persistencia">
              ✓ Guardado
            </div>
          </div>

          <div class="header-right">
            <!-- BOTÓN IMPORTAR Y GUARDAR CLASE AL LADO DE DESCARGAR PDF (Req. 15, 88, 117) -->
            <button type="button" class="btn btn-secondary" onclick="ClassEditorView.openNotebookEditor()" title="Abrir Cuaderno del Docente en editor tipo Word" style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0; font-weight:600;">
              📓 Cuaderno
            </button>
            <button type="button" class="btn btn-secondary" onclick="ClassEditorView.openImportModal()" title="Importar planeación inteligente desde texto o portapapeles">
              📥 Importar
            </button>
            <button type="button" class="btn btn-success btn-save-main" onclick="ClassEditorView.saveCurrentClass()" title="Guardar exclusivamente esta clase">
              💾 Guardar clase
            </button>
            <button type="button" class="btn btn-primary" onclick="ExportService.exportClassById('${cls.id}', 'pdf')" title="Descargar PDF institucional oficial">
              📄 Descargar PDF
            </button>
            <button type="button" class="btn btn-secondary" onclick="ExportService.exportClassById('${cls.id}', 'docx')" title="Descargar Word institucional (.docx)">
              📝 Word
            </button>
          </div>
        </header>

        <!-- Barra de Acciones y Navegación entre Clases (Req. 30, 31, 95, 96, 97) -->
        <div class="class-editor-subbar">
          <div class="subbar-nav">
            <button type="button" class="btn btn-secondary btn-sm" onclick="ClassEditorView.navigateToPreviousClass()" title="Ir a la clase anterior de esta asignatura">
              ◀ Clase anterior
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="ClassEditorView.navigateToNextClass()" title="Ir a la siguiente clase de esta asignatura">
              Siguiente clase ▶
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="ClassEditorView.openClassNavigatorModal()" style="background:#f0f9ff; color:#0369a1; border-color:#bae6fd; font-weight:700;" title="Ver y saltar a cualquier clase (#1, #2, #3...) de esta u otra materia">
              🧭 Todas las Clases (#1, #2...)
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="ClassEditorView.duplicateAsNextClass()" title="Duplicar contenido pedagógico como una NUEVA clase (max + 1) independiente">
              📋 Duplicar como siguiente
            </button>
          </div>

          <div class="subbar-modes">
            <button type="button" class="btn btn-sm ${this.editorMode === 'quick' ? 'btn-primary' : 'btn-secondary'}" onclick="ClassEditorView.setEditorMode('quick')">
              ⚡ Planeación Rápida
            </button>
            <button type="button" class="btn btn-sm ${this.editorMode === 'detailed' ? 'btn-primary' : 'btn-secondary'}" onclick="ClassEditorView.setEditorMode('detailed')">
              📑 Planeación Detallada
            </button>
          </div>
        </div>

        <!-- PESTAÑAS DUALES: SECUENCIA DIDÁCTICA vs CUADERNO DEL DOCENTE (Req. 18, 28, 29) -->
        <div class="editor-dual-tabs-bar">
          <button type="button" class="editor-dual-tab-btn ${this.activeTab === 'secuencia' ? 'active' : ''}" onclick="ClassEditorView.switchTab('secuencia')">
            📑 Secuencia Didáctica Institucional
            <span class="tab-badge">Oficial</span>
          </button>
          <button type="button" class="editor-dual-tab-btn ${this.activeTab === 'cuaderno' ? 'active' : ''}" onclick="ClassEditorView.switchTab('cuaderno')">
            📖 Cuaderno del Docente
            <span class="tab-badge">${this._hasNotebookContent() ? 'Con notas' : 'Opcional'}</span>
          </button>
        </div>

        <div class="class-editor-body">
          ${this.activeTab === 'secuencia' ? `
            <!-- TAB 1: SECUENCIA DIDÁCTICA INSTITUCIONAL -->
            <!-- 2. INFORMACIÓN CURRICULAR CON SNAPSHOT INMUTABLE (Req. 33, 43, 44) -->
            <section class="editor-section curriculum-box">
              <div class="section-header-bar">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                  Contenido Curricular (Malla Institucional)
                </h3>
                ${!isDirGroup ? `
                  <button type="button" class="btn btn-secondary btn-sm" onclick="CurriculumSelectorModal.openSelector()" title="Abrir selector de la Malla Institucional para importar Tema, DBA y Logro">
                    📚 Cambiar desde la malla
                  </button>
                ` : ''}
              </div>

              <div class="curriculum-grid">
                <div class="form-group full-width">
                  <label class="form-label">TEMA O EJE TEMÁTICO *</label>
                  <input type="text" id="editor-input-topic" class="form-input font-bold" style="width:100%; box-sizing:border-box;" value="${this._escape(cur.topic)}" oninput="ClassEditorView.onFieldInput(event)" placeholder="Ej. La división por una cifra / El conjunto de los números enteros..." />
                </div>

                ${!isDirGroup ? `
                  <div class="form-group half-width" style="width:100%; box-sizing:border-box;">
                    <label class="form-label">DERECHOS BÁSICOS DE APRENDIZAJE (DBA)</label>
                    <textarea id="editor-input-dba" class="form-textarea" rows="4" style="width:100%; min-height:120px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="DBAs asociados a la sesión...">${this._escape(cur.dba)}</textarea>
                  </div>

                  <div class="form-group half-width" style="width:100%; box-sizing:border-box;">
                    <label class="form-label">LOGRO / DESEMPEÑO</label>
                    <textarea id="editor-input-achievement" class="form-textarea" rows="4" style="width:100%; min-height:120px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Logros e indicadores de desempeño esperados...">${this._escape(cur.achievement)}</textarea>
                  </div>
                ` : `
                  <div class="form-group full-width" style="background:#f8fafc; padding:10px; border-radius:6px; font-size:0.82rem; color:#64748b;">
                    <em>En Dirección de Grupo se orienta la formación general, pactos de convivencia y seguimiento tutorial.</em>
                  </div>
                `}
              </div>
            </section>

            <!-- 3. ESTRUCTURA PEDAGÓGICA MODULAR (Req. 34-41) -->
            <section class="editor-section pedagogy-box">
              <div class="section-header-bar">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Secuencia Didáctica y Metodología Pedagógica
                </h3>
              </div>

              <!-- FASE DE INICIO (Req. 35) -->
              <div class="pedagogy-block block-inicio">
                <label class="pedagogy-label">
                  <span class="phase-badge badge-inicio">1. INICIO</span>
                  ${durations.inicio ? `<span class="phase-duration-badge">⏱️ ${durations.inicio} min</span>` : ''}
                  Motivación, saberes previos, encuadre pedagógico y propósito de la clase:
                </label>
                <textarea id="editor-input-inicio" class="form-textarea pedagogy-textarea" rows="4" style="width:100%; min-height:135px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Describe cómo iniciará la clase: preguntas orientadoras, motivación, activación de saberes previos...">${this._escape(this.cleanBrokenLinebreaks(ped.inicio))}</textarea>
              </div>

              <!-- FASE DE DESARROLLO (Req. 36) -->
              <div class="pedagogy-block block-desarrollo">
                <label class="pedagogy-label">
                  <span class="phase-badge badge-desarrollo">2. DESARROLLO</span>
                  ${durations.desarrollo ? `<span class="phase-duration-badge">⏱️ ${durations.desarrollo} min</span>` : ''}
                  Conceptualización, explicación, actividades guiadas, talleres y ejercicios:
                </label>
                <textarea id="editor-input-desarrollo" class="form-textarea pedagogy-textarea" rows="7" style="width:100%; min-height:220px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Describe las actividades centrales: explicación del tema, resolución guiada de problemas, trabajo en equipos...">${this._escape(this.cleanBrokenLinebreaks(ped.desarrollo))}</textarea>
              </div>

              <!-- FASE DE CIERRE (Req. 37) -->
              <div class="pedagogy-block block-cierre">
                <label class="pedagogy-label">
                  <span class="phase-badge badge-cierre">3. CIERRE</span>
                  ${durations.cierre ? `<span class="phase-duration-badge">⏱️ ${durations.cierre} min</span>` : ''}
                  Síntesis, conclusiones, retroalimentación y verificación de aprendizajes:
                </label>
                <textarea id="editor-input-cierre" class="form-textarea pedagogy-textarea" rows="4" style="width:100%; min-height:135px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Describe el cierre pedagógico: síntesis de conclusiones, resolución de dudas, balance de lo aprendido...">${this._escape(this.cleanBrokenLinebreaks(ped.cierre))}</textarea>
              </div>

              <!-- CAMPOS DE PLANEACIÓN DETALLADA (Req. 38, 39, 40, 41, 54) -->
              ${this.editorMode === 'detailed' ? `
                <div class="detailed-pedagogy-grid">
                  <!-- RECURSOS (Req. 38) -->
                  <div class="form-group half-width" style="width:100%; box-sizing:border-box;">
                    <label class="form-label">🛠️ RECURSOS DIDÁCTICOS Y MATERIALES</label>
                    <textarea id="editor-input-recursos" class="form-textarea" rows="3" style="width:100%; min-height:100px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Tablero, guías impresas, computadores, calculadora, materiales...">${this._escape(this.cleanBrokenLinebreaks(ped.recursos))}</textarea>
                  </div>

                  <!-- EVALUACIÓN (Req. 39) -->
                  <div class="form-group half-width" style="width:100%; box-sizing:border-box;">
                    <label class="form-label">📊 EVALUACIÓN FORMATIVA</label>
                    <textarea id="editor-input-evaluacion" class="form-textarea" rows="3" style="width:100%; min-height:100px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Criterios e instrumentos de evaluación (rúbrica, participación, taller, quiz)...">${this._escape(this.cleanBrokenLinebreaks(ped.evaluation || ped.evaluacion || ''))}</textarea>
                  </div>

                  <!-- TAREAS / COMPROMISOS (Req. 40) -->
                  <div class="form-group half-width" style="width:100%; box-sizing:border-box;">
                    <label class="form-label">📝 TAREAS / COMPROMISOS</label>
                    <textarea id="editor-input-tareas" class="form-textarea" rows="3" style="width:100%; min-height:100px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Compromisos académicos o consultas para la siguiente sesión...">${this._escape(this.cleanBrokenLinebreaks(ped.tareas))}</textarea>
                  </div>

                  <!-- OBSERVACIONES (Req. 41) -->
                  <div class="form-group half-width" style="width:100%; box-sizing:border-box;">
                    <label class="form-label">🔍 OBSERVACIONES PEDAGÓGICAS DE LA SESIÓN</label>
                    <textarea id="editor-input-observaciones" class="form-textarea" rows="3" style="width:100%; min-height:100px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Observaciones particulares sobre el ritmo del grupo, ajustes curriculares...">${this._escape(this.cleanBrokenLinebreaks(cls.observations))}</textarea>
                  </div>
                </div>
              ` : ''}
            </section>
          ` : `
            <!-- TAB 2: CUADERNO DEL DOCENTE (Segunda Capa de Información) -->
            <section class="editor-section notebook-box">
              <div class="section-header-bar">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  Cuaderno de Apoyo del Docente
                </h3>
                <span style="font-size:0.8rem; color:#64748b;">Información interna para el desarrollo de la clase</span>
              </div>

              <!-- Banner de Acceso al Editor Tipo Word -->
              <div style="background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border:1px solid #86efac; border-radius:8px; padding:12px 16px; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; gap:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:1.5rem;">📓</span>
                  <div>
                    <strong style="color:#166534; font-size:0.95rem;">Editor Completo de Cuaderno y Guía Pedagógica</strong>
                    <p style="margin:2px 0 0; font-size:0.8rem; color:#15803d;">Redacta con formato enriquecido tipo Word/Docs, imágenes, tablas, fórmulas, cuadros didácticos y exporta a .doc o PDF.</p>
                  </div>
                </div>
                <button type="button" class="btn btn-sm" onclick="ClassEditorView.openNotebookEditor()" style="background:#16a34a; color:#fff; border:none; font-weight:700; padding:7px 16px; white-space:nowrap; cursor:pointer; border-radius:6px;">
                  Abrir en Editor Tipo Word ↗️
                </button>
              </div>

              <!-- PREGUNTA PROBLEMATIZADORA -->
              <div class="form-group">
                <label class="form-label">❓ PREGUNTA ORIENTADORA / PROBLEMATIZADORA</label>
                <textarea id="editor-input-nb-question" class="form-textarea" rows="2" style="width:100%; min-height:58px; box-sizing:border-box; font-weight:600;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Ej. ¿Cómo la tecnología ha transformado los objetos que usamos y qué impacto tiene en nuestra vida diaria?">${this._escape(this.cleanBrokenLinebreaks(nb.question || ''))}</textarea>
              </div>

              <!-- DINÁMICA DE CLASE -->
              <div class="form-group">
                <label class="form-label">🎲 DINÁMICA DE LA CLASE / METODOLOGÍA ACTIVA</label>
                <textarea id="editor-input-nb-dynamics" class="form-textarea" rows="6" style="width:100%; min-height:180px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Describe la lúdica, roles de estudiantes, juegos didácticos o metodología activa para la sesión...">${this._escape(this.cleanBrokenLinebreaks(nb.dynamics || ''))}</textarea>
              </div>

              <!-- CONTENIDO PARA EL CUADERNO DEL ESTUDIANTE -->
              <div class="form-group">
                <label class="form-label">📖 CONTENIDO PARA EL CUADERNO DEL ESTUDIANTE (CONSIGNAR)</label>
                <textarea id="editor-input-nb-student-content" class="form-textarea" rows="8" style="width:100%; min-height:220px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Texto conceptual, definiciones, mapas conceptuales o resumen que los alumnos registrarán en sus cuadernos...">${this._escape(this.cleanBrokenLinebreaks(nb.studentNotebookContent || cls.notebookContent || ''))}</textarea>
              </div>

              <!-- TALLER / ACTIVIDAD PRÁCTICA -->
              <div class="form-group">
                <label class="form-label">🛠️ TALLER O ACTIVIDAD PRÁCTICA (PASO A PASO)</label>
                <textarea id="editor-input-nb-practical-activity" class="form-textarea" rows="7" style="width:100%; min-height:200px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Ejercicios detallados, problemas a resolver o guía paso a paso para los estudiantes...">${this._escape(this.cleanBrokenLinebreaks(nb.practicalActivity || ''))}</textarea>
              </div>

              <!-- NOTAS ADICIONALES -->
              <div class="form-group">
                <label class="form-label">📝 NOTAS ADICIONALES DEL DOCENTE</label>
                <textarea id="editor-input-nb-notes" class="form-textarea" rows="3" style="width:100%; min-height:110px; box-sizing:border-box;" oninput="ClassEditorView.onFieldInput(event)" placeholder="Recordatorios, adaptaciones para estudiantes con NEE, observaciones privadas...">${this._escape(this.cleanBrokenLinebreaks(nb.additionalNotes || ''))}</textarea>
              </div>

              <!-- VISOR DE TEXTO FUENTE ORIGINAL SI EXISTE -->
              ${nb.sourceText ? `
                <div class="source-text-accordion" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin-top:1.25rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:0.82rem; color:#334155;">📄 Texto Original Importado (Fuente)</strong>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(nb.sourceText)}')); App.showToast('Texto copiado al portapapeles', 'info');">
                      📋 Copiar texto original
                    </button>
                  </div>
                  <pre style="margin-top:8px; max-height:180px; overflow-y:auto; font-size:0.75rem; background:#fff; padding:8px; border-radius:4px; border:1px solid #e2e8f0; white-space:pre-wrap;">${this._escape(nb.sourceText)}</pre>
                </div>
              ` : ''}
            </section>
          `}

          <!-- Barra de Pie con Botón Guardar y Continuar -->
          <div class="editor-bottom-bar">
            <button type="button" class="btn btn-secondary" onclick="ClassEditorView.goBack()" title="Volver a la sección anterior">
              ← Volver
            </button>

            <div class="bottom-right-actions">
              <button type="button" class="btn btn-secondary" onclick="ClassEditorView.openImportModal()" title="Importar planeación sobre esta clase">
                📥 Importar
              </button>
              <button type="button" class="btn btn-success btn-lg" onclick="ClassEditorView.saveCurrentClass()">
                💾 Guardar clase
              </button>
              <button type="button" class="btn btn-primary btn-lg" onclick="ClassEditorView.saveAndContinue()">
                Guardar y continuar con la siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Auto-ajustar alturas amplias y dinámicas de todos los cuadros de texto sin layout thrashing
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => this.autoResizeAllTextareas());
    } else {
      this.autoResizeAllTextareas();
    }
  }

  onFieldInput(event) {
    if (typeof AppState !== 'undefined') {
      AppState.set('isDirty', true);
      AppState.set('saveStatus', 'dirty');
    }

    const target = (event && event.target) || (typeof document !== 'undefined' && document.activeElement);
    if (target && target.tagName === 'TEXTAREA') {
      this.autoResizeTextarea(target);
    }

    // Sincronizar campos del DOM a memoria
    this._syncFromDomToCurrentClass();
    ClassService.scheduleAutoSave(this.currentClass);
  }

  _syncFromDomToCurrentClass() {
    if (!this.currentClass) return;

    // Campos curriculares
    const topicEl = document.getElementById('editor-input-topic');
    if (topicEl) {
      if (!this.currentClass.curriculum) this.currentClass.curriculum = {};
      this.currentClass.curriculum.topic = topicEl.value.trim();
      this.currentClass.topic = topicEl.value.trim();
    }
    const dbaEl = document.getElementById('editor-input-dba');
    if (dbaEl) {
      if (!this.currentClass.curriculum) this.currentClass.curriculum = {};
      this.currentClass.curriculum.dba = dbaEl.value.trim();
      this.currentClass.dba = dbaEl.value.trim();
    }
    const achEl = document.getElementById('editor-input-achievement');
    if (achEl) {
      if (!this.currentClass.curriculum) this.currentClass.curriculum = {};
      this.currentClass.curriculum.achievement = achEl.value.trim();
      this.currentClass.achievement = achEl.value.trim();
    }

    // Campos de Secuencia Didáctica
    if (this.activeTab === 'secuencia') {
      if (!this.currentClass.didacticSequence) this.currentClass.didacticSequence = {};
      if (!this.currentClass.pedagogy) this.currentClass.pedagogy = {};

      const inicioEl = document.getElementById('editor-input-inicio');
      if (inicioEl) {
        this.currentClass.didacticSequence.inicio = this.cleanBrokenLinebreaks(inicioEl.value.trim());
        this.currentClass.pedagogy.inicio = this.currentClass.didacticSequence.inicio;
      }
      const desEl = document.getElementById('editor-input-desarrollo');
      if (desEl) {
        this.currentClass.didacticSequence.desarrollo = this.cleanBrokenLinebreaks(desEl.value.trim());
        this.currentClass.pedagogy.desarrollo = this.currentClass.didacticSequence.desarrollo;
      }
      const cierreEl = document.getElementById('editor-input-cierre');
      if (cierreEl) {
        this.currentClass.didacticSequence.cierre = this.cleanBrokenLinebreaks(cierreEl.value.trim());
        this.currentClass.pedagogy.cierre = this.currentClass.didacticSequence.cierre;
      }
      const recEl = document.getElementById('editor-input-recursos');
      if (recEl) {
        this.currentClass.didacticSequence.recursos = this.cleanBrokenLinebreaks(recEl.value.trim());
        this.currentClass.pedagogy.recursos = this.currentClass.didacticSequence.recursos;
      }
      const evalEl = document.getElementById('editor-input-evaluacion');
      if (evalEl) {
        this.currentClass.didacticSequence.evaluation = this.cleanBrokenLinebreaks(evalEl.value.trim());
        this.currentClass.pedagogy.evaluacion = this.currentClass.didacticSequence.evaluation;
      }
      const tareasEl = document.getElementById('editor-input-tareas');
      if (tareasEl) {
        this.currentClass.didacticSequence.tareas = this.cleanBrokenLinebreaks(tareasEl.value.trim());
        this.currentClass.pedagogy.tareas = this.currentClass.didacticSequence.tareas;
      }
      const obsEl = document.getElementById('editor-input-observaciones');
      if (obsEl) {
        this.currentClass.observations = this.cleanBrokenLinebreaks(obsEl.value.trim());
        this.currentClass.pedagogy.observaciones = this.currentClass.observations;
      }
    }

    // Campos de Cuaderno del Docente
    if (this.activeTab === 'cuaderno') {
      if (!this.currentClass.teacherNotebook) this.currentClass.teacherNotebook = {};

      const qEl = document.getElementById('editor-input-nb-question');
      if (qEl) this.currentClass.teacherNotebook.question = this.cleanBrokenLinebreaks(qEl.value.trim());

      const dynEl = document.getElementById('editor-input-nb-dynamics');
      if (dynEl) this.currentClass.teacherNotebook.dynamics = this.cleanBrokenLinebreaks(dynEl.value.trim());

      const studEl = document.getElementById('editor-input-nb-student-content');
      if (studEl) {
        const cleaned = this.cleanBrokenLinebreaks(studEl.value.trim());
        this.currentClass.teacherNotebook.studentNotebookContent = cleaned;
        this.currentClass.notebookContent = cleaned;
      }

      const actEl = document.getElementById('editor-input-nb-practical-activity');
      if (actEl) this.currentClass.teacherNotebook.practicalActivity = this.cleanBrokenLinebreaks(actEl.value.trim());

      const notesEl = document.getElementById('editor-input-nb-notes');
      if (notesEl) this.currentClass.teacherNotebook.additionalNotes = this.cleanBrokenLinebreaks(notesEl.value.trim());
    }
  }

  _collectFormValues() {
    if (!this.currentClass) return null;
    this._syncFromDomToCurrentClass();
    return JSON.parse(JSON.stringify(this.currentClass));
  }

  saveCurrentClass(showFeedback = true) {
    const data = this._collectFormValues();
    if (!data) return false;

    const saved = ClassService.saveClassNow(data, { isAutoSave: false });
    if (saved) {
      this.currentClass = saved;
      if (showFeedback && typeof App !== 'undefined' && App.showToast) {
        App.showToast(`✓ Clase #${saved.sequenceNumber} guardada exitosamente`, 'success');
      }
      return true;
    } else {
      if (showFeedback && typeof App !== 'undefined' && App.showToast) {
        App.showToast('No se pudo guardar la clase. La información local sigue disponible.', 'error');
      }
      return false;
    }
  }

  saveAndContinue() {
    const success = this.saveCurrentClass(false);
    if (!success) return;

    // Buscar la siguiente clase pendiente real (Req. 30)
    const nextClass = ClassService.findNextPendingClass(this.currentClass);
    if (nextClass) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`Abriendo siguiente clase pendiente: ${nextClass.subjectName} (#${nextClass.sequenceNumber})`, 'info');
      }
      this.loadClass(nextClass.id);
    } else {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('¡No hay más clases pendientes en esta secuencia para hoy!', 'success');
      }
      AppRouter.navigateTo('dashboard');
    }
  }

  duplicateAsNextClass() {
    if (!this.currentClass) return;
    const current = this.currentClass;

    const confirmed = confirm(`¿Deseas duplicar el contenido pedagógico de esta clase como una NUEVA clase de ${current.subjectName} (${current.gradeName})?`);
    if (!confirmed) return;

    const duplicated = ClassRepository.duplicateClass(current.id, {
      period: current.period,
      targetDate: current.date
    });

    if (duplicated) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`✓ Creada nueva Clase #${duplicated.sequenceNumber} como entidad independiente`, 'success');
      }
      this.loadClass(duplicated.id);
    }
  }

  navigateToPreviousClass() {
    this._syncFromDomToCurrentClass();
    if (typeof ClassService !== 'undefined' && ClassService.cancelPendingAutoSave) {
      ClassService.cancelPendingAutoSave();
    }
    const prev = ClassService.findPreviousClassInSequence(this.currentClass);
    if (prev) {
      this.loadClass(prev.id);
    } else {
      alert('No hay clases anteriores registradas en esta secuencia.');
    }
  }

  navigateToNextClass() {
    this._syncFromDomToCurrentClass();
    if (typeof ClassService !== 'undefined' && ClassService.cancelPendingAutoSave) {
      ClassService.cancelPendingAutoSave();
    }
    const next = ClassService.findNextPendingClass(this.currentClass);
    if (next) {
      this.loadClass(next.id);
    } else {
      alert('No se encontraron más clases en esta secuencia.');
    }
  }

  openNotebookEditor() {
    this.saveCurrentClass(false);
    AppRouter.navigateTo('notebook');
  }

  // =========================================================================
  // MODIFICACIÓN DE DÍA / FECHA DE LA CLASE
  // =========================================================================

  openChangeDateModal() {
    if (!this.currentClass) return;

    let backdrop = document.getElementById('change-class-date-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.id = 'change-class-date-modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal-card" style="max-width: 480px;">
          <div class="modal-header">
            <h2 style="display:flex; align-items:center; gap:8px; font-size:1.15rem; color:var(--slate-800);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Cambiar Día / Fecha de la Clase
            </h2>
            <button type="button" class="btn-close-modal" onclick="ClassEditorView.closeChangeDateModal()">&times;</button>
          </div>
          <div class="modal-body" id="change-class-date-modal-body" style="padding: 1.25rem;"></div>
          <div class="modal-footer" style="justify-content: flex-end; gap: 0.5rem;">
            <button type="button" class="btn btn-secondary" onclick="ClassEditorView.closeChangeDateModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="ClassEditorView.applyChangeDateFromModal()" id="btn-apply-class-date">
              Guardar y Mover Clase
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.closeChangeDateModal();
    };

    this.renderChangeDateModalContent();
    backdrop.classList.add('active');

    setTimeout(() => {
      const input = document.getElementById('modal-class-date-input');
      if (input) input.focus();
    }, 100);
  }

  closeChangeDateModal() {
    const backdrop = document.getElementById('change-class-date-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  renderChangeDateModalContent() {
    const body = document.getElementById('change-class-date-modal-body');
    if (!body || !this.currentClass) return;

    const cls = this.currentClass;
    const currentDate = cls.date || new Date().toISOString().slice(0, 10);
    const dayName = cls.dayOfWeek || (typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(currentDate) : 'Día');
    const formattedDate = typeof ExportService !== 'undefined' ? ExportService.formatDate(currentDate) : currentDate;

    body.innerHTML = `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem;">
        <div style="font-size: 0.78rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Clase actual</div>
        <div style="font-size: 1rem; font-weight: 700; color: var(--slate-800); margin-top: 2px;">
          ${this._escape(cls.subjectName || cls.subject)} — ${this._escape(cls.gradeName || cls.grade)}
          <span style="font-size: 0.85rem; color: var(--primary-700); font-weight: 800; margin-left: 6px;">Clase #${cls.sequenceNumber || cls.dayNumber}</span>
        </div>
        <div style="font-size: 0.82rem; color: var(--slate-600); margin-top: 4px;">
          Fecha actual: <strong>${dayName}, ${formattedDate}</strong>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label" for="modal-class-date-input" style="font-weight: 700; color: var(--slate-700); font-size: 0.92rem;">
          Selecciona el nuevo día / fecha para esta clase:
        </label>
        <input type="date" id="modal-class-date-input" class="form-input" value="${currentDate}" style="font-size: 1.1rem; font-weight: 700; padding: 0.6rem 0.8rem; border: 2px solid var(--primary-300); border-radius: 8px; width: 100%; box-sizing: border-box;" onchange="ClassEditorView.onDateInputChange(this.value)" />
        <div id="modal-date-preview" style="font-size: 0.85rem; color: var(--primary-700); font-weight: 600; margin-top: 6px;">
          Día correspondiente: <strong>${dayName}</strong>
        </div>
      </div>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; margin-top: 1rem;">
        <div style="font-size: 0.8rem; color: #1e40af; line-height: 1.4;">
          💡 <strong>Nota:</strong> Al mover la clase a otra fecha, todo su contenido pedagógico (secuencia didáctica, temas, logros y cuaderno) se trasladará íntegramente a ese nuevo día.
        </div>
      </div>
    `;
  }

  onDateInputChange(newDateStr) {
    const preview = document.getElementById('modal-date-preview');
    if (preview && newDateStr) {
      const dayName = typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(newDateStr) : '';
      const formatted = typeof ExportService !== 'undefined' ? ExportService.formatDate(newDateStr) : newDateStr;
      preview.innerHTML = `Día correspondiente: <strong>${dayName}</strong> (${formatted})`;
    }
  }

  applyChangeDateFromModal() {
    if (!this.currentClass) return;
    const input = document.getElementById('modal-class-date-input');
    if (!input || !input.value) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Por favor selecciona una fecha válida', 'warning');
      }
      return;
    }

    const newDate = input.value.trim();
    const oldDate = this.currentClass.date;

    if (newDate === oldDate) {
      this.closeChangeDateModal();
      return;
    }

    const newDayName = typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(newDate) : '';

    // 1. Sincronizar DOM antes de mover
    this._syncFromDomToCurrentClass();

    // 2. Actualizar fecha en currentClass
    this.currentClass.date = newDate;
    this.currentClass.dayOfWeek = newDayName;

    // 3. Guardar en ClassRepository
    if (typeof ClassRepository !== 'undefined' && ClassRepository.saveClass) {
      ClassRepository.saveClass(this.currentClass);
    }

    // 4. Mover la clase entre los planes guardados en StorageService / PlanRepository
    try {
      if (typeof StorageService !== 'undefined') {
        const oldPlan = StorageService.getPlan(oldDate);
        if (oldPlan && Array.isArray(oldPlan.classes)) {
          oldPlan.classes = oldPlan.classes.filter(c => c.id !== this.currentClass.id);
          StorageService.savePlan(oldDate, oldPlan);
        }

        let newPlan = StorageService.getPlan(newDate);
        if (!newPlan) {
          newPlan = {
            date: newDate,
            period: this.currentClass.period || '1°',
            classes: [],
            attachments: [],
            generalNotes: ''
          };
        }
        if (!Array.isArray(newPlan.classes)) newPlan.classes = [];

        const existingIdx = newPlan.classes.findIndex(c => c.id === this.currentClass.id);
        const planClassObj = {
          id: this.currentClass.id,
          classId: this.currentClass.id,
          date: newDate,
          dayOfWeek: newDayName,
          dayNumber: String(this.currentClass.sequenceNumber || this.currentClass.dayNumber || '1'),
          sequenceNumber: this.currentClass.sequenceNumber || 1,
          time: this.currentClass.time || '',
          subject: this.currentClass.subjectName || this.currentClass.subject,
          grade: this.currentClass.gradeName || this.currentClass.grade,
          dba: this.currentClass.curriculum?.dba || this.currentClass.dba || '',
          achievement: this.currentClass.curriculum?.achievement || this.currentClass.achievement || '',
          topic: this.currentClass.curriculum?.topic || this.currentClass.topic || '',
          description: this.currentClass.description || '',
          observations: this.currentClass.observations || '',
          notebookContent: this.currentClass.notebookContent || '',
          attachments: this.currentClass.attachments || []
        };

        if (existingIdx >= 0) {
          newPlan.classes[existingIdx] = planClassObj;
        } else {
          newPlan.classes.push(planClassObj);
        }

        StorageService.savePlan(newDate, newPlan);
      }
    } catch (e) {
      console.warn('Error moviendo clase en StorageService:', e);
    }

    this.closeChangeDateModal();
    this.render();

    const formatted = typeof ExportService !== 'undefined' ? ExportService.formatDate(newDate) : newDate;
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`✓ Clase movida exitosamente al ${newDayName}, ${formatted}`, 'success');
    }
  }

  // =========================================================================
  // MODIFICACIÓN DE NÚMERO (#) DE CLASE CON CONTEO HACIA ADELANTE
  // =========================================================================

  openChangeNumberModal() {
    if (!this.currentClass) return;

    let backdrop = document.getElementById('editor-change-class-number-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.id = 'editor-change-class-number-modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal-card" style="max-width: 500px;">
          <div class="modal-header">
            <h2 style="display:flex; align-items:center; gap:8px; font-size:1.15rem; color:var(--slate-800);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Modificar Número de Clase
            </h2>
            <button type="button" class="btn-close-modal" onclick="ClassEditorView.closeChangeNumberModal()">&times;</button>
          </div>
          <div class="modal-body" id="editor-change-class-number-modal-body" style="padding: 1.25rem;"></div>
          <div class="modal-footer" style="justify-content: flex-end; gap: 0.5rem;">
            <button type="button" class="btn btn-secondary" onclick="ClassEditorView.closeChangeNumberModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="ClassEditorView.applyChangeNumberFromModal()" id="btn-apply-editor-class-number">
              Guardar y Actualizar Conteo
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.closeChangeNumberModal();
    };

    this.renderChangeNumberModalContent();
    backdrop.classList.add('active');

    setTimeout(() => {
      const input = document.getElementById('modal-editor-new-number-input');
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  closeChangeNumberModal() {
    const backdrop = document.getElementById('editor-change-class-number-modal-backdrop') || document.getElementById('change-class-number-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  renderChangeNumberModalContent() {
    const body = document.getElementById('editor-change-class-number-modal-body') || document.getElementById('change-class-number-modal-body');
    if (!body || !this.currentClass) return;

    const cls = this.currentClass;
    const currentNum = parseInt(String(cls.sequenceNumber || cls.dayNumber || 1), 10);
    const subName = cls.subjectName || cls.subject || 'Asignatura';
    const grdName = cls.gradeName || cls.grade || '';

    body.innerHTML = `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 0.78rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Asignatura y Curso</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--slate-800);">${this._escape(subName)} — ${this._escape(grdName)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.78rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Número Actual</div>
          <span style="display: inline-block; background: var(--primary-100); color: var(--primary-800); font-weight: 800; font-size: 1rem; padding: 2px 10px; border-radius: 12px;">#${currentNum}</span>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label" for="modal-editor-new-number-input" style="font-weight: 700; color: var(--slate-700); font-size: 0.92rem;">
          Nuevo número de clase:
        </label>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="number" min="1" max="999" id="modal-editor-new-number-input" class="form-input" value="${currentNum}" style="font-size: 1.35rem; font-weight: 800; text-align: center; color: var(--primary-700); padding: 0.5rem; max-width: 140px; border: 2px solid var(--primary-400); border-radius: 8px;" onkeydown="if(event.key==='Enter'){ ClassEditorView.applyChangeNumberFromModal(); }" />
          <span style="font-size: 0.85rem; color: var(--slate-500); line-height: 1.3;">
            Ingresa el número consecutivo deseado para esta clase.
          </span>
        </div>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 14px; margin-top: 1rem;">
        <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; user-select: none;">
          <input type="checkbox" id="modal-editor-propagate-forward" checked style="margin-top: 3px; accent-color: #16a34a; width: 18px; height: 18px; cursor: pointer;" />
          <div style="font-size: 0.88rem; color: #166534; line-height: 1.35;">
            <strong style="display: block; font-weight: 700; margin-bottom: 2px;">Continuar el conteo automáticamente hacia adelante</strong>
            <span style="font-size: 0.78rem; font-weight: 400; color: #15803d;">
              Las clases siguientes de <strong>${this._escape(subName)} ${this._escape(grdName)}</strong> en fechas posteriores continuarán secuencialmente (+1, +2, +3...).
            </span>
          </div>
        </label>
      </div>
    `;

    const saveBtn = document.getElementById('btn-apply-editor-class-number');
    if (saveBtn) {
      saveBtn.onclick = () => ClassEditorView.applyChangeNumberFromModal();
    }
  }

  applyChangeNumberFromModal() {
    if (!this.currentClass) return;
    const input = document.getElementById('modal-editor-new-number-input') || document.getElementById('modal-new-number-input');
    const propagateBox = document.getElementById('modal-editor-propagate-forward') || document.getElementById('modal-propagate-forward');
    if (!input) return;

    const newNum = parseInt(input.value.trim(), 10);
    if (isNaN(newNum) || newNum <= 0) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Ingresa un número de clase válido mayor a 0', 'warning');
      }
      input.focus();
      return;
    }

    const propagate = propagateBox ? propagateBox.checked : true;
    this.closeChangeNumberModal();

    this._syncFromDomToCurrentClass();

    const targetSub = String(this.currentClass.subjectName || this.currentClass.subject || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const targetGrd = String(this.currentClass.gradeName || this.currentClass.grade || '').toLowerCase().replace(/[^0-9a-z]/gi, '').trim();

    this.currentClass.sequenceNumber = newNum;
    this.currentClass.dayNumber = String(newNum);

    if (typeof ClassRepository !== 'undefined' && ClassRepository.saveClass) {
      ClassRepository.saveClass(this.currentClass);
    }

    let nextNum = newNum + 1;

    if (propagate) {
      try {
        const tid = (typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId) ? ClassRepository._getCurrentTeacherId() : 'usr_manuel';
        const currentDate = this.currentClass.date;

        if (typeof ClassRepository !== 'undefined' && ClassRepository.getAllClasses) {
          const allClasses = ClassRepository.getAllClasses(tid);
          const futureClasses = allClasses.filter(c => {
            if (!c.date) return false;
            if (c.date < currentDate) return false;
            if (c.date === currentDate && c.id === this.currentClass.id) return false;
            const sub = String(c.subjectName || c.subject || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const grd = String(c.gradeName || c.grade || '').toLowerCase().replace(/[^0-9a-z]/gi, '').trim();
            return sub === targetSub && grd === targetGrd;
          }).sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
          });

          futureClasses.forEach(fc => {
            fc.sequenceNumber = nextNum;
            fc.dayNumber = String(nextNum);
            nextNum++;
            ClassRepository.saveClass(fc, tid);
          });
        }

        if (typeof StorageService !== 'undefined') {
          const allPlans = StorageService.getAllPlans();
          const futureDates = Object.keys(allPlans).filter(d => d >= currentDate).sort();

          let runningNum = newNum;
          for (const d of futureDates) {
            const plan = allPlans[d];
            if (!plan || !Array.isArray(plan.classes)) continue;

            let planMod = false;
            for (const c of plan.classes) {
              const sub = String(c.subject || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
              const grd = String(c.grade || '').toLowerCase().replace(/[^0-9a-z]/gi, '').trim();
              if (sub === targetSub && grd === targetGrd) {
                if (d === currentDate && c.id === this.currentClass.id) {
                  c.dayNumber = String(newNum);
                  c.sequenceNumber = newNum;
                  runningNum = newNum + 1;
                } else if (d > currentDate || (d === currentDate && c.id !== this.currentClass.id)) {
                  c.dayNumber = String(runningNum);
                  c.sequenceNumber = runningNum;
                  runningNum++;
                }
                planMod = true;
              }
            }
            if (planMod) {
              StorageService.savePlan(d, plan);
            }
          }
        }
      } catch (e) {
        console.warn('Error propagando número de clase:', e);
      }
    } else {
      try {
        if (typeof StorageService !== 'undefined') {
          const plan = StorageService.getPlan(this.currentClass.date);
          if (plan && Array.isArray(plan.classes)) {
            const cMatch = plan.classes.find(c => c.id === this.currentClass.id);
            if (cMatch) {
              cMatch.dayNumber = String(newNum);
              cMatch.sequenceNumber = newNum;
              StorageService.savePlan(this.currentClass.date, plan);
            }
          }
        }
      } catch (e) {}
    }

    this.render();

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`✓ Número de clase cambiado a #${newNum}. ${propagate ? 'Secuencia continuada hacia adelante.' : ''}`, 'success');
    }
  }

  goBack() {
    if (typeof AppRouter !== 'undefined' && AppRouter.goBack) {
      AppRouter.goBack();
    } else {
      if (typeof AppState !== 'undefined' && AppState.get('isDirty')) {
        const leave = confirm('Tienes cambios sin guardar. ¿Deseas salir?');
        if (!leave) return;
        AppState.set('isDirty', false);
      }
      if (typeof AppRouter !== 'undefined') {
        AppRouter.navigateTo('dashboard');
      }
    }
  }

  openClassNavigatorModal(selectedSubjectKey = null, filter = 'all') {
    if (!this.currentClass) return;
    let backdrop = document.getElementById('class-navigator-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.id = 'class-navigator-modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal-card modal-large" style="max-width: 860px;">
          <div class="modal-header">
            <h2 style="display:flex; align-items:center; gap:8px; font-size:1.15rem; color:var(--slate-800);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              Explorador Rápido de Clases por Materia
            </h2>
            <button type="button" class="btn-close-modal" onclick="ClassEditorView.closeClassNavigatorModal()">&times;</button>
          </div>
          <div class="modal-body" id="class-navigator-modal-body" style="padding: 1.25rem; max-height: 72vh; overflow-y: auto;"></div>
          <div class="modal-footer" style="justify-content: flex-end; gap: 0.5rem;">
            <button type="button" class="btn btn-secondary" onclick="ClassEditorView.closeClassNavigatorModal()">Cerrar</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.closeClassNavigatorModal();
    };

    // Guardado silencioso de cambios pendientes para no perder nada
    this.saveCurrentClass(false);

    this.renderClassNavigatorModalContent(selectedSubjectKey, filter);
    backdrop.classList.add('active');
  }

  closeClassNavigatorModal() {
    const backdrop = document.getElementById('class-navigator-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  renderClassNavigatorModalContent(selectedSubjectKey = null, filter = 'all') {
    const body = document.getElementById('class-navigator-modal-body');
    if (!body || !this.currentClass) return;

    const tid = (typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId) 
      ? ClassRepository._getCurrentTeacherId() 
      : 'usr_manuel';

    const period = this.currentClass.period || '1°';
    const sequences = (typeof SequenceService !== 'undefined' && SequenceService.getAllActiveSequences)
      ? SequenceService.getAllActiveSequences(period, tid)
      : [];

    if (sequences.length === 0) {
      body.innerHTML = `
        <div style="text-align:center; padding:2rem; color:#64748b;">
          <p>No se encontraron secuencias activas en el ${period} Período.</p>
        </div>
      `;
      return;
    }

    // Determinar la clave de la secuencia activa por defecto (la materia de la clase actual)
    const currentSubNorm = String(this.currentClass.subjectName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const currentGrdNorm = String(this.currentClass.gradeName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    let activeSeq = sequences.find(s => {
      const sNorm = s.subjectName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const gNorm = s.gradeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (selectedSubjectKey) {
        return `${sNorm}__${gNorm}` === selectedSubjectKey;
      }
      return sNorm === currentSubNorm && gNorm === currentGrdNorm;
    }) || sequences[0];

    // Clases filtradas
    let classesToDisplay = activeSeq.classes || [];
    if (filter === 'pending') {
      classesToDisplay = classesToDisplay.filter(c => c.status === 'pending' || c.status === 'draft');
    } else if (filter === 'planned') {
      classesToDisplay = classesToDisplay.filter(c => c.status === 'planned' || c.status === 'completed');
    }

    const currentKey = `${activeSeq.subjectName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()}__${activeSeq.gradeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()}`;

    body.innerHTML = `
      <div class="navigator-modal-container">
        <!-- Barra de selección de Asignatura y Filtro -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:240px;">
              <label for="nav-modal-subject-select" style="font-size:0.85rem; font-weight:700; color:#334155; margin:0;">
                Materia / Curso:
              </label>
              <select id="nav-modal-subject-select" class="form-input" style="font-weight:700; font-size:0.9rem; padding:6px 10px; cursor:pointer;" onchange="ClassEditorView.renderClassNavigatorModalContent(this.value, '${filter}')">
                ${sequences.map(s => {
                  const key = `${s.subjectName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()}__${s.gradeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()}`;
                  const isSelected = key === currentKey;
                  return `
                    <option value="${key}" ${isSelected ? 'selected' : ''}>
                      ${this._escape(s.subjectName)} — ${this._escape(s.gradeName)} (${s.planned}/${s.total} planeadas)
                    </option>
                  `;
                }).join('')}
              </select>
            </div>

            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="ClassEditorView.renderClassNavigatorModalContent('${currentKey}', 'all')" style="font-size:0.78rem; padding:4px 10px;">
                Todas (${activeSeq.total})
              </button>
              <button type="button" class="btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}" onclick="ClassEditorView.renderClassNavigatorModalContent('${currentKey}', 'pending')" style="font-size:0.78rem; padding:4px 10px;">
                ○ Pendientes (${activeSeq.pending})
              </button>
              <button type="button" class="btn btn-sm ${filter === 'planned' ? 'btn-primary' : 'btn-secondary'}" onclick="ClassEditorView.renderClassNavigatorModalContent('${currentKey}', 'planned')" style="font-size:0.78rem; padding:4px 10px;">
                ✓ Planeadas (${activeSeq.planned})
              </button>
            </div>
          </div>

          <!-- Barra de Progreso de la Materia -->
          <div style="margin-top:10px; display:flex; align-items:center; gap:12px;">
            <div style="flex:1; background:#e2e8f0; height:8px; border-radius:4px; overflow:hidden;">
              <div style="background:#2563eb; height:100%; width:${activeSeq.percentage}%; transition:width 0.3s ease;"></div>
            </div>
            <span style="font-size:0.8rem; font-weight:700; color:#475569;">
              ${activeSeq.planned} de ${activeSeq.total} clases planeadas (${activeSeq.percentage}%)
            </span>
          </div>
        </div>

        <!-- Listado de Clases Secuenciales (#1, #2, #3...) -->
        <div class="nav-modal-classes-list" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:10px; max-height:48vh; overflow-y:auto; padding:2px;">
          ${classesToDisplay.length > 0 ? classesToDisplay.map(cls => {
            const isCurrent = cls.id === this.currentClass.id;
            const isPlanned = cls.status === 'planned' || cls.status === 'completed';
            const topicText = cls.curriculum?.topic || cls.topic || 'Sin tema planeado todavía';
            const dateFmt = this._formatDate(cls.date);

            return `
              <div class="nav-class-card ${isCurrent ? 'is-current-editing' : ''} ${isPlanned ? 'is-planned' : 'is-pending'}" 
                onclick="ClassEditorView.navigateToClassFromNavigator('${cls.id}')"
                style="background:${isCurrent ? '#eff6ff' : '#ffffff'}; border:2px solid ${isCurrent ? '#3b82f6' : (isPlanned ? '#bbf7d0' : '#fde68a')}; border-radius:10px; padding:10px 12px; cursor:pointer; transition:all 0.15s ease; position:relative; box-shadow:0 1px 3px rgba(0,0,0,0.05);"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.08)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';"
                title="Hacer clic para abrir Clase #${cls.sequenceNumber}">
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-weight:800; font-size:0.88rem; background:${isPlanned ? '#dcfce7' : '#fef3c7'}; color:${isPlanned ? '#166534' : '#92400e'}; padding:2px 8px; border-radius:6px;">
                    Clase #${cls.sequenceNumber}
                  </span>
                  ${isCurrent ? `
                    <span style="font-size:0.72rem; font-weight:800; background:#2563eb; color:#ffffff; padding:2px 6px; border-radius:4px;">
                      📍 En edición
                    </span>
                  ` : `
                    <span style="font-size:0.75rem; font-weight:700; color:${isPlanned ? '#16a34a' : '#d97706'};">
                      ${isPlanned ? '✓ Planeada' : '○ Pendiente'}
                    </span>
                  `}
                </div>

                <div style="font-size:0.75rem; color:#64748b; margin-bottom:4px;">
                  📅 ${dateFmt} ${cls.time ? `• ⏰ ${cls.time}` : ''}
                </div>

                <div style="font-size:0.82rem; color:#1e293b; line-height:1.3; max-height:2.6em; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                  <strong>Tema:</strong> ${this._escape(topicText)}
                </div>

                <div style="margin-top:8px; padding-top:6px; border-top:1px dashed #e2e8f0; display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:#2563eb; font-weight:700;">
                  <span>${isCurrent ? 'Editando actualmente' : '👉 Ir a esta clase'}</span>
                  <span>${cls.notebookContent ? '📓' : ''} ${cls.observations ? '📝' : ''}</span>
                </div>
              </div>
            `;
          }).join('') : `
            <div style="grid-column: 1/-1; text-align:center; padding:1.5rem; color:#94a3b8; font-style:italic;">
              No hay clases ${filter === 'pending' ? 'pendientes' : 'planeadas'} en esta materia.
            </div>
          `}
        </div>
      </div>
    `;
  }

  navigateToClassFromNavigator(classId) {
    if (!classId) return;
    if (this.currentClass && this.currentClass.id === classId) {
      this.closeClassNavigatorModal();
      return;
    }

    this.closeClassNavigatorModal();
    this.loadClass(classId);

    if (typeof App !== 'undefined' && App.showToast) {
      const cls = (typeof ClassRepository !== 'undefined') ? ClassRepository.getClass(classId) : null;
      if (cls) {
        App.showToast(`Navegando a Clase #${cls.sequenceNumber} (${cls.subjectName})`, 'info');
      }
    }
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

  _updateSaveStatusBadge(status, isDirty) {
    const badge = document.getElementById('editor-save-badge');
    if (!badge) return;

    badge.className = 'editor-save-badge';
    if (status === 'saving') {
      badge.classList.add('status-saving');
      badge.textContent = 'Guardando...';
    } else if (status === 'dirty' || isDirty) {
      badge.classList.add('status-dirty');
      badge.textContent = '● Cambios sin guardar';
    } else if (status === 'error') {
      badge.classList.add('status-error');
      badge.textContent = 'Error al guardar';
    } else {
      badge.classList.add('status-saved');
      badge.textContent = '✓ Guardado';
    }
  }

  autoResizeTextarea(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Obtener min-height sin forzar getComputedStyle a menos que sea estrictamente necesario
    const minH = parseInt(el.style.minHeight, 10) || 100;

    // Si está oculto en pestaña inactiva, aseguramos su altura mínima base
    if (el.offsetParent === null) {
      if (!el.style.height || parseInt(el.style.height, 10) < minH) {
        el.style.height = `${minH}px`;
      }
      return;
    }

    // Reset temporal para calcular scrollHeight sin arrastrar alturas previas
    el.style.height = 'auto';
    const targetH = Math.max(el.scrollHeight + 6, minH);
    el.style.height = `${targetH}px`;
    el.style.overflowY = targetH > 800 ? 'auto' : 'hidden';
  }

  autoResizeAllTextareas() {
    if (!this.container) return;
    const textareas = this.container.querySelectorAll('textarea');
    textareas.forEach(ta => this.autoResizeTextarea(ta));
  }

  cleanBrokenLinebreaks(text) {
    if (!text || typeof text !== 'string') return '';
    if (typeof window !== 'undefined' && window.ImportParser && typeof window.ImportParser.cleanBrokenLinebreaks === 'function') {
      return window.ImportParser.cleanBrokenLinebreaks(text);
    }
    let clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Reparar "Criterios de" e "Instrumentos de" huérfanos sin la palabra "evaluación"
    clean = clean.replace(/(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi, '\nCriterios de evaluación:\n');
    clean = clean.replace(/(?:^|\n)\s*Instrumentos\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi, '\nInstrumentos de evaluación:\n');

    // 2. Unir palabras clave partidas por salto de línea específicamente
    clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nCriterios de evaluación:');
    clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nInstrumentos de evaluación:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*:\s*(?:y\s+)?materiales\b/gi, '\nRecursos didácticos y materiales:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*\n+\s*(?:y\s+)?materiales(?!\s*:)/gi, '\nRecursos didácticos y materiales:');
    clean = clean.replace(/(?:^|\n)\s*(Tareas)\s*\n+\s*(?:y\s+)?compromisos(?!\s*:)/gi, '\nTareas y compromisos:');

    // 3. Normalizar encabezados de subsección para que tengan dos puntos
    clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos\s+y\s+materiales)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Tareas\s+(?:y\s+)?compromisos)(?!\s*:)/gi, '\n$1:');

    // 4. Unir saltos de línea artificiales tras comas o punto y coma dentro de una misma idea/viñeta
    clean = clean.replace(/([,;])\s*\n\s*(?![•\-\*\d\n\r#]|\*{1,2}[A-Z])/g, '$1 ');

    // 5. Unir oraciones partidas tras preposiciones, artículos o conjunciones
    clean = clean.replace(/(?:^|[^a-záéíóúñA-ZÁÉÍÓÚÑ])(de|del|la|el|los|las|en|con|para|por|sobre|un|una|unos|unas|su|sus|sin|y|o|que|al|a|como|entre|hacia|desde|hasta|e|ni)\s*\n\s*([a-záéíóúñ0-9«"“\(\[])/g, (match, prep, nextChar) => {
      const prefix = match.slice(0, match.indexOf(prep));
      return prefix + prep + ' ' + nextChar;
    });

    // 6. Unir líneas que terminan en palabra normal y la siguiente empieza con minúscula
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*([a-záéíóúñ])/g, '$1 $2');

    // 7. Unir líneas que terminan en texto y continúan con paréntesis explicativo en la línea siguiente
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*(\([a-záéíóúñA-ZÁÉÍÓÚÑ0-9])/g, '$1 $2');

    // 8. Unir palabras con guión partidas por salto
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ])\s*-\s*\n\s*([a-záéíóúñA-ZÁÉÍÓÚÑ])/g, '$1-$2');

    // 9. Espaciado armónico antes de subsecciones
    clean = clean.replace(/([^\n])\n*((?:Criterios|Instrumentos)\s+de\s+evaluaci[oó]n:)/gi, '$1\n\n$2');

    // 10. Eliminar saltos dobles innecesarios entre un encabezado con dos puntos (:) y su primera viñeta
    clean = clean.replace(/([^\n:]+:)\s*\n{2,}([•]|[-*](?!\*))/g, '$1\n$2');

    // 11. Normalizar saltos triples o excesivos
    clean = clean.replace(/\n{3,}/g, '\n\n');

    return clean.trim();
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

const ClassEditorView = new ClassEditorViewClass();

if (typeof window !== 'undefined') {
  window.ClassEditorView = ClassEditorView;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClassEditorView;
}
