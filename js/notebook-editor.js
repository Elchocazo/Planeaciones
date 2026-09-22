/**
 * MÓDULO DE EDICIÓN Y FORMATO DE CUADERNO / GUÍA PEDAGÓGICA (NotebookEditor)
 * Arquitectura: UN SOLO DOCUMENTO EDITABLE (contenteditable único)
 * Soporta selección de texto nativa continua entre páginas, formato tipo Word/Docs,
 * autosave con debounce, historial de versiones y control de concurrencia multi-pestaña.
 */

const NotebookEditor = {
  currentClassId: null,
  currentClassIndex: null,
  currentDateStr: null,
  currentClassData: null,
  isStandalone: false,
  _autoSaveTimer: null,
  _versionHistory: [],
  _documentVersion: 1,
  _lastSavedContent: '',
  _isRemoteConflict: false,

  /**
   * Abre el cuaderno para una clase desde su ID permanente
   */
  openForClassId(classId, isStandalone = false) {
    this.openByClassId(classId, isStandalone);
  },

  openByClassId(classId, isStandalone = false) {
    if (!classId) return;
    const tid = (typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : 'usr_manuel';
    let cls = (typeof ClassRepository !== 'undefined') ? ClassRepository.getClass(classId, tid) : null;

    if (!cls && typeof StorageService !== 'undefined') {
      const allPlans = StorageService.getAllPlans();
      for (const d of Object.keys(allPlans)) {
        const found = allPlans[d]?.classes?.find(c => c.id === classId);
        if (found) {
          cls = found;
          cls.date = d;
          break;
        }
      }
    }

    if (!cls) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('No se encontró la información de la clase seleccionada', 'warning');
      }
      return;
    }

    this.currentClassId = classId;
    this.currentClassIndex = null;
    this.currentDateStr = cls.date;
    this.currentClassData = cls;
    this.isStandalone = isStandalone;

    const mount = document.getElementById('notebook-mount-point');
    if (!mount) return;

    const profile = (typeof StorageService !== 'undefined') ? StorageService.getProfile() : {};
    const formattedDate = (typeof ExportService !== 'undefined' && ExportService.formatDate) ? ExportService.formatDate(cls.date) : cls.date;
    const classNum = cls.sequenceNumber || cls.dayNumber || 1;
    const subjectDisplay = cls.subjectName || cls.subject || 'Clase';
    const gradeDisplay = (cls.gradeName || cls.grade) ? ' (' + (cls.gradeName || cls.grade) + ')' : '';
    const period = cls.period || profile?.period || '1°';
    const rawTopic = cls.curriculum?.topic || cls.topic || 'Sin tema';
    const topic = String(rawTopic).replace(/^[\s\*#_]+/, '').replace(/[\s\*#_]+$/, '').trim();

    this._loadVersionHistory(cls.date, classId);

    const backBtnHtml = isStandalone
      ? '<button type="button" class="btn btn-secondary btn-sm" onclick="window.close()" title="Guardar y cerrar pestaña" style="font-weight:600; padding:0.45rem 0.9rem; display:inline-flex; align-items:center; gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>Cerrar Pestaña</button>'
      : '<button type="button" class="btn btn-secondary btn-sm" onclick="AppRouter.goBack()" title="Volver a la sección anterior" style="font-weight:600; padding:0.45rem 0.9rem; display:inline-flex; align-items:center; gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>← Volver</button>';

    mount.innerHTML = `
      <div class="notebook-fullpage-card">
        <!-- Banner de Conflicto de Edición Multi-Pestaña -->
        <div id="notebook-conflict-banner" style="display:none; background:#fffbeb; border-bottom:2px solid #f59e0b; padding:10px 18px; font-size:0.88rem; color:#92400e; align-items:center; justify-content:space-between; gap:12px; z-index:300;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">⚠️</span>
            <span><strong>Aviso de concurrencia:</strong> Este documento fue modificado en otra pestaña o ventana.</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.reloadFromRemote()" style="background:#fff; border-color:#d97706; color:#b45309; font-weight:700;">🔄 Cargar Versión Reciente</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.dismissConflict()">Mantener Mi Versión</button>
          </div>
        </div>

        <!-- Barra Superior Sticky: Encabezado y Herramientas Tipo Word -->
        <div class="notebook-sticky-header-wrapper" id="notebook-sticky-header-wrapper">
          <div class="notebook-fullpage-header">
            <div class="notebook-header-left">
              ${backBtnHtml}
              <div class="notebook-header-icon" style="width:38px; height:38px; border-radius:8px; background:var(--primary-100); color:var(--primary-700); display:flex; align-items:center; justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <div>
                <h2 style="margin:0; font-size:1.15rem; font-weight:700; color:var(--slate-900);">
                  Cuaderno / Guía Pedagógica: <span style="color:var(--primary-700);">${this.escapeHtml(subjectDisplay)}${this.escapeHtml(gradeDisplay)}</span> (Clase #${classNum})
                </h2>
                <div style="font-size:0.8rem; color:var(--slate-500); margin-top:2px;">
                  ${this.escapeHtml(formattedDate)} • Periodo ${this.escapeHtml(period)} • Tema: ${this.escapeHtml(topic)}
                </div>
              </div>
            </div>

            <div class="notebook-header-actions">
              <span id="notebook-autosave-badge" class="badge-autosave" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:0.8rem; font-weight:600; padding:4px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                ✓ Guardado
              </span>

              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.openHistoryModal()" title="Ver historial de versiones de este documento">
                🕒 Historial
              </button>

              <div class="dropdown" style="position:relative; display:inline-block;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.toggleTemplatesMenu(event)">
                  ⚡ Plantillas ▾
                </button>
                <div class="dropdown-menu" id="notebook-templates-menu" style="min-width:260px; right:0; left:auto; z-index:200;">
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('standard')">📝 Estructura Didáctica Estándar</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('math')">📐 Taller de Matemáticas</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('lab')">🤖 Guía de Práctica / Robótica</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('sistemas7')">💻 Sistemas 7° - Creación Digital</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('robotics10')">🦾 Robótica 10° - Pinza Robótica</button>
                </div>
              </div>

              ${!isStandalone ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.openInNewTab()" title="Abrir en una pestaña separada">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  Nueva Pestaña
                </button>
              ` : ''}

              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.exportWordDocx()" title="Descargar como documento de Word (.doc)" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700;">
                📄 Word (.doc)
              </button>

              <button type="button" class="btn btn-primary btn-sm" onclick="NotebookEditor.printNotebook()" title="Imprimir o exportar a PDF">
                🖨️ PDF
              </button>

              <button type="button" class="btn btn-success btn-sm" onclick="NotebookEditor.saveCurrentNotebookContent(true)" title="Guardar manualmente" style="background:#059669; border-color:#059669; color:#fff; font-weight:700;">
                💾 Guardar
              </button>
            </div>
          </div>

          <!-- Barra de Herramientas Estilo Word / Google Docs -->
          <div class="notebook-word-toolbar" id="notebook-word-toolbar">
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('undo')" title="Deshacer (Ctrl+Z)">↩️</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('redo')" title="Rehacer (Ctrl+Y)">↪️</button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.formatCurrentEditorContent()" title="Organizar automáticamente títulos, párrafos, listas y negritas" style="font-weight:700; color:#1d4ed8; background:#eff6ff; border-color:#bfdbfe; display:inline-flex; align-items:center; gap:4px; padding:0.25rem 0.6rem;">
                🪄 Auto-formato
              </button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <select class="toolbar-select" onchange="NotebookEditor.setFontFamily(this.value); this.value='';" title="Fuente tipográfica">
                <option value="">Fuente...</option>
                <option value="Inter, sans-serif">Inter (Moderno)</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Calibri, sans-serif">Calibri</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>

              <select class="toolbar-select" onchange="NotebookEditor.formatBlock(this.value); this.value='';" title="Estilo de párrafo">
                <option value="">Estilo...</option>
                <option value="p">Párrafo Normal</option>
                <option value="h1">Título Principal (H1)</option>
                <option value="h2">Subtítulo de Sección (H2)</option>
                <option value="h3">Apartado / Subtítulo (H3)</option>
              </select>

              <select class="toolbar-select" onchange="NotebookEditor.setFontSize(this.value); this.value='';" title="Tamaño de fuente">
                <option value="">Tamaño...</option>
                <option value="10pt">10 pt</option>
                <option value="11pt">11 pt</option>
                <option value="12pt">12 pt (Normal)</option>
                <option value="14pt">14 pt</option>
                <option value="16pt">16 pt</option>
                <option value="18pt">18 pt</option>
                <option value="24pt">24 pt</option>
              </select>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('bold')" title="Negrita (Ctrl+B)"><strong>B</strong></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('italic')" title="Cursiva (Ctrl+I)"><em>I</em></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('underline')" title="Subrayado (Ctrl+U)"><u>U</u></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('strikeThrough')" title="Tachado"><s>S</s></button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <label class="toolbar-btn" title="Color de Texto" style="cursor:pointer; margin:0;">
                <span style="font-weight:bold; color:#ef4444; border-bottom:2px solid #ef4444;">A</span>
                <input type="color" value="#1e293b" onchange="NotebookEditor.exec('foreColor', this.value)" style="display:none;" />
              </label>
              <label class="toolbar-btn" title="Resaltador" style="cursor:pointer; margin:0;">
                <span style="background:#fef08a; padding:1px 4px; border-radius:2px; font-size:0.75rem;">🖍️</span>
                <input type="color" value="#fef08a" onchange="NotebookEditor.exec('hiliteColor', this.value)" style="display:none;" />
              </label>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyLeft')" title="Izquierda">⇤</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyCenter')" title="Centrar">≡</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyRight')" title="Derecha">⇥</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyFull')" title="Justificado">≣</button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('insertUnorderedList')" title="Viñetas">• Lista</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('insertOrderedList')" title="Numeración">1. Lista</button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <label class="toolbar-btn" title="Insertar Imagen" style="cursor:pointer; margin:0; display:inline-flex; align-items:center; gap:3px;">
                🖼️ Imagen
                <input type="file" accept="image/*" style="display:none;" onchange="NotebookEditor.handleImageUpload(event)" />
              </label>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertTable()" title="Insertar Tabla 3x3">
                📊 Tabla
              </button>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertLink()" title="Insertar Enlace (Ctrl+K)">
                🔗 Enlace
              </button>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertPageBreakAtCursor()" title="Insertar Salto de Página (Ctrl+Enter)" style="font-weight:700; color:var(--primary-700);">
                📄 Salto
              </button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('concept')" title="Concepto Clave">📌 Concepto</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('activity')" title="Actividad en Clase">✍️ Actividad</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('homework')" title="Tarea para la Casa">🏠 Tarea</button>
            </div>
          </div>
        </div>

        <!-- Documento Único -->
        <div class="notebook-document-scroll-wrapper">
          <div class="notebook-paper-container">
            <div class="notebook-page-header-card">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--primary-600); padding-bottom:0.75rem; margin-bottom:0.8rem; gap:1rem;">
                <img src="${(typeof ExportService !== 'undefined' && ExportService.LOGO_BASE64) ? ExportService.LOGO_BASE64 : 'img/logo_colegio.png'}" alt="Logo" style="height:50px; width:auto; object-fit:contain;" />
                <div style="flex:1;">
                  <div style="font-size:0.85rem; font-weight:800; color:var(--primary-800); text-transform:uppercase;">
                    ${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}
                  </div>
                  <h3 style="margin:2px 0 0; font-size:1.15rem; color:var(--slate-900);">
                    GUÍA PEDAGÓGICA Y CUADERNO DE CLASE
                  </h3>
                </div>
                <div style="text-align:right;">
                  <span class="role-badge" style="font-size:0.8rem; background:var(--primary-100); color:var(--primary-800); font-weight:700; padding:0.3rem 0.7rem;">
                    Clase #${classNum}
                  </span>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:0.5rem; font-size:0.85rem; background:var(--slate-50); padding:0.6rem 0.9rem; border-radius:6px; border:1px solid var(--slate-200); margin-bottom:0.75rem;">
                <div><strong>Docente:</strong> ${this.escapeHtml(profile.name || 'Manuel Muñoz')}</div>
                <div><strong>Asignatura:</strong> ${this.escapeHtml(subjectDisplay)}</div>
                <div><strong>Grado:</strong> ${this.escapeHtml(cls.gradeName || cls.grade || '')}</div>
                <div><strong>Fecha:</strong> ${this.escapeHtml(formattedDate)}</div>
                <div><strong>Periodo:</strong> ${this.escapeHtml(period)}</div>
                <div><strong>Día:</strong> ${this.escapeHtml(cls.dayOfWeek || '')}</div>
              </div>
            </div>

            <!-- Editor Contenteditable -->
            <div id="notebook-single-editor"
                 class="notebook-single-editor-body"
                 contenteditable="true"
                 spellcheck="true"
                 placeholder="Escribe aquí el desarrollo de la clase, explicaciones, preguntas orientadoras, actividades o guías...">
              ${this._prepareInitialHtml(cls)}
            </div>

            <!-- Observaciones Pedagógicas Específicas de la Sesión -->
            <div class="notebook-observations-card" style="margin-top:2.5rem; border-top:2px dashed #cbd5e1; padding-top:1.25rem; page-break-inside:avoid; break-inside:avoid;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label style="font-size:0.88rem; font-weight:700; color:#92400e; display:flex; align-items:center; gap:6px;">
                  📝 Observaciones Pedagógicas de la Clase:
                </label>
                <span style="font-size:0.75rem; color:#64748b; font-weight:500;">(Cierre pedagógico / Última hoja)</span>
              </div>
              <textarea id="hdr-edit-observations" class="table-textarea" rows="4" style="width:100%; box-sizing:border-box; font-size:0.85rem; line-height:1.5; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:8px 10px; font-family:inherit; color:#1e293b; resize:none; overflow:hidden;" placeholder="Redacta aquí observaciones específicas para esta sesión...">${this.escapeHtml(cls.observations || cls.pedagogy?.observaciones || '')}</textarea>
            </div>

            <!-- Pie de Página Institucional -->
            <div class="notebook-document-footer">
              <span>${this.escapeHtml(profile.institution || 'Colegio Hogar Madre de Dios')}</span>
              <span id="doc-word-count-badge" style="color:var(--slate-500); font-size:0.78rem;">0 palabras</span>
            </div>
          </div>
        </div>

        <!-- Modal de Historial de Versiones -->
        <div class="modal-backdrop" id="notebook-history-modal">
          <div class="modal-card modal-large" style="max-width:700px;">
            <div class="modal-header">
              <h2>🕒 Historial de Versiones del Cuaderno</h2>
              <button type="button" class="btn-close-modal" onclick="NotebookEditor.closeHistoryModal()">&times;</button>
            </div>
            <div class="modal-body" id="notebook-history-list" style="padding:1.25rem; max-height:450px; overflow-y:auto;">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="NotebookEditor.closeHistoryModal()">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Usar el binding completo que incluye el fix de toolbar, imágenes y page breaks
    this._bindSingleEditorEvents();
    this._listenToRemoteSync();
  },

  /**
   * Abre el cuaderno para una clase desde la vista principal
   */
  openForClass(classIndex) {
    if (typeof App !== 'undefined' && typeof App.openNotebookEditorView === 'function') {
      App.openNotebookEditorView(classIndex);
    } else {
      this.openInPage(classIndex);
    }
  },

  /**
   * Abre el cuaderno en una nueva pestaña del navegador
   */
  openInNewTab(classIndex = null) {
    if (this.currentClassId) {
      this.saveCurrentNotebookContent(false);
      const url = 'notebook-editor.html?classId=' + encodeURIComponent(this.currentClassId);
      window.open(url, '_blank');
      return;
    }
    const idx = classIndex !== null ? classIndex : this.currentClassIndex;
    const dateStr = this.currentDateStr || window.Planner?.currentDateStr;
    if (!dateStr) return;

    this.saveCurrentNotebookContent(false);
    const url = 'notebook-editor.html?date=' + encodeURIComponent(dateStr) + '&class=' + encodeURIComponent(idx);
    window.open(url, '_blank');
  },

  /**
   * Cierra el editor y vuelve a la vista de planeación
   */
  closeModal() {
    this.saveCurrentNotebookContent(false);
    if (typeof App !== 'undefined' && typeof App.showPlannerView === 'function') {
      App.showPlannerView();
    }
  },

  /**
   * Inicializa y monta el editor en la página
   */
  openInPage(classIndex, isStandalone = false) {
    if (!window.Planner || !window.Planner.currentPlan || !window.Planner.currentPlan.classes || !window.Planner.currentPlan.classes[classIndex]) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('No se encontró la información de la clase seleccionada', 'warning');
      }
      return;
    }

    this.currentClassIndex = classIndex;
    this.currentDateStr = window.Planner.currentDateStr;
    this.currentClassData = window.Planner.currentPlan.classes[classIndex];
    this.isStandalone = isStandalone;

    const mount = document.getElementById('notebook-mount-point');
    if (!mount) return;

    const profile = (typeof StorageService !== 'undefined') ? StorageService.getProfile() : {};
    const formattedDate = window.Planner.formatFullDate ? window.Planner.formatFullDate(this.currentDateStr) : this.currentDateStr;
    const cls = this.currentClassData;
    const classNum = cls.dayNumber || (classIndex + 1);
    const subjectDisplay = cls.subject || 'Clase';
    const gradeDisplay = cls.grade ? ' (' + cls.grade + ')' : '';
    const period = window.Planner.currentPlan?.period || profile?.period || '1°';

    const rawTopic = cls.topic || cls.curriculum?.topic || '';
    const cleanTopic = String(rawTopic).replace(/^[\s\*#_]+/, '').replace(/[\s\*#_]+$/, '').trim();

    // Cargar historial de versiones previo desde IndexedDB si existe
    this._loadVersionHistory(this.currentDateStr, classIndex);

    const backBtnHtml = isStandalone
      ? '<button type="button" class="btn btn-secondary btn-sm" onclick="window.close()" title="Guardar y cerrar pestaña" style="font-weight:600; padding:0.45rem 0.9rem; display:inline-flex; align-items:center; gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>Cerrar Pestaña</button>'
      : '<button type="button" class="btn btn-secondary btn-sm" onclick="AppRouter.goBack()" title="Volver a la sección anterior" style="font-weight:600; padding:0.45rem 0.9rem; display:inline-flex; align-items:center; gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>← Volver</button>';

    mount.innerHTML = `
      <div class="notebook-fullpage-card">
        <!-- Banner de Conflicto de Edición Multi-Pestaña (Oculto por defecto) -->
        <div id="notebook-conflict-banner" style="display:none; background:#fffbeb; border-bottom:2px solid #f59e0b; padding:10px 18px; font-size:0.88rem; color:#92400e; align-items:center; justify-content:space-between; gap:12px; z-index:300;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">⚠️</span>
            <span><strong>Aviso de concurrencia:</strong> Este documento fue modificado en otra pestaña o ventana. Puedes cargar la versión remota o conservar tu versión actual.</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.reloadFromRemote()" style="background:#fff; border-color:#d97706; color:#b45309; font-weight:700;">🔄 Cargar Versión Reciente</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.dismissConflict()">Mantener Mi Versión</button>
          </div>
        </div>

        <!-- Barra Superior Sticky: Encabezado y Herramientas Tipo Word -->
        <div class="notebook-sticky-header-wrapper" id="notebook-sticky-header-wrapper">
          <div class="notebook-fullpage-header">
            <div class="notebook-header-left">
              ${backBtnHtml}
              <div class="notebook-header-icon" style="width:38px; height:38px; border-radius:8px; background:var(--primary-100); color:var(--primary-700); display:flex; align-items:center; justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <div>
                <h2 style="margin:0; font-size:1.15rem; font-weight:700; color:var(--slate-900);">
                  Cuaderno / Guía Pedagógica: <span style="color:var(--primary-700);">${this.escapeHtml(subjectDisplay)}${this.escapeHtml(gradeDisplay)}</span> (Clase #${classNum})
                </h2>
                <div style="font-size:0.8rem; color:var(--slate-500); margin-top:2px;">
                  ${this.escapeHtml(formattedDate)} • Periodo ${this.escapeHtml(period)} • ${cleanTopic ? 'Tema: ' + this.escapeHtml(cleanTopic) : 'Sin tema'}
                </div>
              </div>
            </div>

            <div class="notebook-header-actions">
              <!-- Indicador de Autosave -->
              <span id="notebook-autosave-badge" class="badge-autosave" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:0.8rem; font-weight:600; padding:4px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                ✓ Guardado
              </span>

              <!-- Historial de Versiones -->
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.openHistoryModal()" title="Ver historial de versiones de este documento">
                🕒 Historial de Versiones
              </button>

              <!-- Plantillas Didácticas Rápidas -->
              <div class="dropdown" style="position:relative; display:inline-block;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.toggleTemplatesMenu(event)">
                  ⚡ Plantillas ▾
                </button>
                <div class="dropdown-menu" id="notebook-templates-menu" style="min-width:260px; right:0; left:auto; z-index:200;">
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('standard')">📝 Estructura Didáctica Estándar</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('math')">📐 Taller de Matemáticas</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('lab')">🤖 Guía de Práctica / Robótica</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('sistemas7')">💻 Sistemas 7° - Creación Digital</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('robotics10')">🦾 Robótica 10° - Pinza Robótica</button>
                </div>
              </div>

              ${!isStandalone ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.openInNewTab()" title="Abrir en una pestaña separada">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  Nueva Pestaña
                </button>
              ` : ''}

              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.exportWordDocx()" title="Descargar como documento de Word (.doc)" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700;">
                📄 Word (.doc)
              </button>

              <button type="button" class="btn btn-primary btn-sm" onclick="NotebookEditor.printNotebook()" title="Imprimir o exportar a PDF">
                🖨️ Imprimir / PDF
              </button>

              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.saveCurrentNotebookContent(true)" title="Guardar manualmente">
                💾 Guardar
              </button>
            </div>
          </div>

          <!-- Barra de Herramientas Estilo Word / Google Docs -->
          <div class="notebook-word-toolbar" id="notebook-word-toolbar">
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('undo')" title="Deshacer (Ctrl+Z)">↩️</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('redo')" title="Rehacer (Ctrl+Y)">↪️</button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.formatCurrentEditorContent()" title="Organizar automáticamente títulos, párrafos, listas y negritas" style="font-weight:700; color:#1d4ed8; background:#eff6ff; border-color:#bfdbfe; display:inline-flex; align-items:center; gap:4px; padding:0.25rem 0.6rem;">
                🪄 Auto-formato
              </button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Fuente y Tamaño -->
            <div class="toolbar-group">
              <select class="toolbar-select" onchange="NotebookEditor.setFontFamily(this.value); this.value='';" title="Fuente tipográfica">
                <option value="">Fuente...</option>
                <option value="Inter, sans-serif">Inter (Moderno)</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Calibri, sans-serif">Calibri</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>

              <select class="toolbar-select" onchange="NotebookEditor.formatBlock(this.value); this.value='';" title="Estilo de párrafo">
                <option value="">Estilo...</option>
                <option value="p">Párrafo Normal</option>
                <option value="h1">Título Principal (H1)</option>
                <option value="h2">Subtítulo de Sección (H2)</option>
                <option value="h3">Apartado / Subtítulo (H3)</option>
              </select>

              <select class="toolbar-select" onchange="NotebookEditor.setFontSize(this.value); this.value='';" title="Tamaño de fuente">
                <option value="">Tamaño...</option>
                <option value="10pt">10 pt</option>
                <option value="11pt">11 pt</option>
                <option value="12pt">12 pt (Normal)</option>
                <option value="14pt">14 pt</option>
                <option value="16pt">16 pt</option>
                <option value="18pt">18 pt</option>
                <option value="24pt">24 pt</option>
              </select>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Formato B, I, U, S -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('bold')" title="Negrita (Ctrl+B)"><strong>B</strong></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('italic')" title="Cursiva (Ctrl+I)"><em>I</em></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('underline')" title="Subrayado (Ctrl+U)"><u>U</u></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('strikeThrough')" title="Tachado"><s>S</s></button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Color y Resaltador -->
            <div class="toolbar-group">
              <label class="toolbar-btn" title="Color de Texto" style="cursor:pointer; margin:0;">
                <span style="font-weight:bold; color:#ef4444; border-bottom:2px solid #ef4444;">A</span>
                <input type="color" value="#1e293b" onchange="NotebookEditor.exec('foreColor', this.value)" style="display:none;" />
              </label>
              <label class="toolbar-btn" title="Resaltador" style="cursor:pointer; margin:0;">
                <span style="background:#fef08a; padding:1px 4px; border-radius:2px; font-size:0.75rem;">🖍️</span>
                <input type="color" value="#fef08a" onchange="NotebookEditor.exec('hiliteColor', this.value)" style="display:none;" />
              </label>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Alineaciones -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyLeft')" title="Izquierda">⇤</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyCenter')" title="Centrar">≡</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyRight')" title="Derecha">⇥</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyFull')" title="Justificado">≣</button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Listas -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('insertUnorderedList')" title="Viñetas">• Lista</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('insertOrderedList')" title="Numeración">1. Lista</button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Tablas, Imágenes, Enlaces, Salto de Página -->
            <div class="toolbar-group">
              <label class="toolbar-btn" title="Insertar Imagen" style="cursor:pointer; margin:0; display:inline-flex; align-items:center; gap:3px;">
                🖼️ Imagen
                <input type="file" accept="image/*" style="display:none;" onchange="NotebookEditor.handleImageUpload(event)" />
              </label>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertTable()" title="Insertar Tabla 3x3">
                📊 Tabla
              </button>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertLink()" title="Insertar Enlace (Ctrl+K)">
                🔗 Enlace
              </button>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertPageBreakAtCursor()" title="Insertar Salto de Página tipo Word (Ctrl+Enter)" style="font-weight:700; color:var(--primary-700);">
                📄 Salto de Página
              </button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Cuadros Didácticos -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('concept')" title="Concepto Clave">📌 Concepto</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('activity')" title="Actividad en Clase">✍️ Actividad</button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('homework')" title="Tarea para la Casa">🏠 Tarea</button>
            </div>
          </div>
        </div>

        <!-- ÁREA PRINCIPAL: UN SOLO CONTENEDOR EDITABLE TIPO GOOGLE DOCS / WORD -->
        <div class="notebook-document-scroll-wrapper">
          <div class="notebook-paper-container">
            <!-- Encabezado Institucional Integrado en la Hoja 1 -->
            <div class="notebook-page-header-card">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--primary-600); padding-bottom:0.75rem; margin-bottom:0.8rem; gap:1rem;">
                <img src="${(typeof ExportService !== 'undefined' && ExportService.LOGO_BASE64) ? ExportService.LOGO_BASE64 : 'img/logo_colegio.png'}" alt="Logo" style="height:50px; width:auto; object-fit:contain;" />
                <div style="flex:1;">
                  <div style="font-size:0.85rem; font-weight:800; color:var(--primary-800); text-transform:uppercase;">
                    ${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}
                  </div>
                  <h3 style="margin:2px 0 0; font-size:1.15rem; color:var(--slate-900);">
                    GUÍA PEDAGÓGICA Y CUADERNO DE CLASE
                  </h3>
                </div>
                <div style="text-align:right;">
                  <span class="role-badge" style="font-size:0.8rem; background:var(--primary-100); color:var(--primary-800); font-weight:700; padding:0.3rem 0.7rem;">
                    Clase #${classNum}
                  </span>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:0.5rem; font-size:0.85rem; background:var(--slate-50); padding:0.6rem 0.9rem; border-radius:6px; border:1px solid var(--slate-200); margin-bottom:0.75rem;">
                <div><strong>Docente:</strong> ${this.escapeHtml(profile.name || 'Manuel Muñoz')}</div>
                <div><strong>Asignatura:</strong> ${this.escapeHtml(cls.subject || 'General')}</div>
                <div><strong>Grado:</strong> ${this.escapeHtml(cls.grade || '')}</div>
                <div><strong>Fecha:</strong> ${this.escapeHtml(formattedDate)}</div>
                <div><strong>Periodo:</strong> ${this.escapeHtml(period)}</div>
                <div><strong>Día:</strong> ${this.escapeHtml(cls.dayOfWeek || '')}</div>
              </div>
            </div>

            <!-- ========================================================================= -->
            <!-- EL ÚNICO ELEMENTO CONTENTEDITABLE PARA TODO EL DOCUMENTO (CERO FRAGMENTACIÓN) -->
            <!-- ========================================================================= -->
            <div id="notebook-single-editor"
                 class="notebook-single-editor-body"
                 contenteditable="true"
                 spellcheck="true"
                 placeholder="Escribe aquí el desarrollo de la clase, explicaciones, preguntas orientadoras, actividades o guías...">
              ${this._prepareInitialHtml(cls)}
            </div>

            <!-- Observaciones Pedagógicas Específicas de la Sesión (Al final del cuaderno / Última hoja) -->
            <div class="notebook-observations-card" style="margin-top:2.5rem; border-top:2px dashed #cbd5e1; padding-top:1.25rem; page-break-inside:avoid; break-inside:avoid;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label style="font-size:0.88rem; font-weight:700; color:#92400e; display:flex; align-items:center; gap:6px;">
                  📝 Observaciones Pedagógicas de la Clase:
                </label>
                <span style="font-size:0.75rem; color:#64748b; font-weight:500;">(Cierre pedagógico / Última hoja)</span>
              </div>
              <textarea id="hdr-edit-observations" class="table-textarea" rows="4" style="width:100%; box-sizing:border-box; font-size:0.85rem; line-height:1.5; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:8px 10px; font-family:inherit; color:#1e293b; resize:none; overflow:hidden;" placeholder="Redacta aquí observaciones específicas para esta sesión...">${this.escapeHtml(cls.observations || '')}</textarea>
            </div>

            <!-- Pie de Página Institucional -->
            <div class="notebook-document-footer">
              <span>${this.escapeHtml(profile.institution || 'Colegio Hogar Madre de Dios')}</span>
              <span id="doc-word-count-badge" style="color:var(--slate-500); font-size:0.78rem;">0 palabras</span>
            </div>
          </div>
        </div>

        <!-- Modal de Historial de Versiones -->
        <div class="modal-backdrop" id="notebook-history-modal">
          <div class="modal-card modal-large" style="max-width:700px;">
            <div class="modal-header">
              <h2>🕒 Historial de Versiones del Cuaderno</h2>
              <button type="button" class="btn-close-modal" onclick="NotebookEditor.closeHistoryModal()">&times;</button>
            </div>
            <div class="modal-body" id="notebook-history-list" style="padding:1.25rem; max-height:450px; overflow-y:auto;">
              <!-- Renderizado dinámicamente -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="NotebookEditor.closeHistoryModal()">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindSingleEditorEvents();
    this._listenToRemoteSync();
  },

  /**
   * Prepara el HTML inicial garantizando que nunca quede en blanco, roto o en texto plano/Markdown colapsado.
   * Integra armónicamente la guía de contenido y el taller/actividad práctica sin truncamientos.
   */
  _prepareInitialHtml(cls) {
    let raw = '';
    if (cls) {
      if (this.hasContent(cls.notebookContent)) {
        raw = cls.notebookContent;
      } else if (this.hasContent(cls.teacherNotebook?.studentNotebookContent)) {
        raw = cls.teacherNotebook.studentNotebookContent;
      } else if (this.hasContent(cls.teacherNotebook?.detailedContent)) {
        raw = cls.teacherNotebook.detailedContent;
      }
    }

    // Comprobar si existe actividad práctica / taller registrada en la clase
    const practical = (cls?.teacherNotebook?.practicalActivity || cls?.practicalActivity || cls?.actividadPractica || cls?.taller || '').trim();

    // Limpiar posibles cabeceras truncadas o huérfanas como "TALLER / " o "TALLER:" al final del contenido
    if (raw) {
      raw = raw.replace(/(?:<p>\s*)?(?:•\s*)?TALLER\s*[\/:\-]?\s*(?:<\/p>)?\s*$/i, '').trim();
    }

    if (practical) {
      // Verificar si el contenido práctico ya está presente dentro de raw
      const practicalSnippet = practical.replace(/<[^>]+>/g, '').trim().slice(0, 40);
      const rawText = (raw || '').replace(/<[^>]+>/g, '');
      const alreadyIncluded = practicalSnippet && rawText.includes(practicalSnippet);

      if (!alreadyIncluded) {
        const practicalFormatted = this.formatNotebookHtml(practical);
        const sectionHeading = '<h2>✍️ Taller / Actividad Práctica</h2>';

        if (raw && raw.trim()) {
          raw = raw + '\n\n' + sectionHeading + '\n' + practicalFormatted;
        } else {
          raw = sectionHeading + '\n' + practicalFormatted;
        }
      }
    }

    if (raw && raw.trim()) {
      return this.formatNotebookHtml(raw);
    }
    return this.generateDefaultContentFromClass(cls);
  },

  /**
   * Vincula todos los eventos nativos de edición y autoguardado sobre el único contenteditable
   */
  _bindSingleEditorEvents() {
    const editor = document.getElementById('notebook-single-editor');
    const hdrObs = document.getElementById('hdr-edit-observations');
    if (!editor) return;

    this._lastSavedContent = editor.innerHTML;

    // Autoguardado con debounce optimizado (2000ms al teclear)
    editor.oninput = () => {
      this.triggerAutoSave(false);
    };

    // Al perder el foco, guardar inmediatamente
    editor.onblur = () => {
      this.triggerAutoSave(true);
    };

    // Observaciones guardadas al editar o desenfocar, con auto-resize
    if (hdrObs) {
      // Auto-resize al cargar: expandir para mostrar todo el contenido existente
      const autoResizeObs = () => {
        hdrObs.style.height = 'auto';
        hdrObs.style.height = (hdrObs.scrollHeight + 2) + 'px';
      };
      setTimeout(autoResizeObs, 80);
      hdrObs.oninput = () => {
        autoResizeObs();
        this.triggerAutoSave(false);
      };
      hdrObs.onblur = () => this.triggerAutoSave(true);
    }

    // Atajos de teclado tipo Word nativos
    editor.onkeydown = (e) => {
      // Ctrl + S: Guardar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.saveCurrentNotebookContent(true);
        return;
      }

      // Ctrl + Enter: Insertar Salto de Página
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.insertPageBreakAtCursor();
        return;
      }

      // Ctrl + K: Insertar Enlace
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.insertLink();
        return;
      }
    };

    // Manejo de pegado de imágenes, HTML enriquecido o texto estructurado/Markdown
    editor.onpaste = (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      if (clipboardData && clipboardData.items) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          if (clipboardData.items[i].type.startsWith('image/')) {
            const blob = clipboardData.items[i].getAsFile();
            if (blob) {
              e.preventDefault();
              const reader = new FileReader();
              reader.onload = (evt) => {
                this.insertImageAtCursor(evt.target.result);
              };
              reader.readAsDataURL(blob);
              return;
            }
          }
        }
      }

      if (clipboardData) {
        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text/plain');

        // Si viene texto plano o Markdown que necesita estructuración pedagógica
        if (text && (/\*\*|•|#{1,3}\s+|\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡]|\bRegla\b|\bPaso\b/.test(text) || !html)) {
          e.preventDefault();
          const formatted = this.formatNotebookHtml(text);
          if (formatted) {
            document.execCommand('insertHTML', false, formatted);
            this.triggerAutoSave(false);
            this._updateWordCount();
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast('✨ Contenido insertado con formato adecuado en el cuaderno', 'info');
            }
            return;
          }
        } else if (html && /<(?:p|h[1-6]|ul|ol|table|b|strong|i|em)[^>]*>/i.test(html)) {
          if (/\*\*|•|\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡]/.test(html)) {
            e.preventDefault();
            const formatted = this.formatNotebookHtml(html);
            if (formatted) {
              document.execCommand('insertHTML', false, formatted);
              this.triggerAutoSave(false);
              this._updateWordCount();
              return;
            }
          }
        }
      }

      setTimeout(() => {
        this.triggerAutoSave(false);
        this._updateWordCount();
      }, 50);
    };

    // Salvaguarda al cambiar de pestaña o cerrar
    window.addEventListener('beforeunload', () => this.saveCurrentNotebookContent(false));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveCurrentNotebookContent(false);
      }
    });

    // === FIX CRÍTICO: Evitar pérdida de foco al hacer clic en cualquier botón de la toolbar ===
    // Sin este fix, el editor pierde la selección y execCommand falla silenciosamente
    const toolbar = document.getElementById('notebook-word-toolbar');
    if (toolbar) {
      toolbar.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Mantener foco y selección en el editor
      });
    }

    // === Interacciones de imágenes (redimensionar, alinear, eliminar) ===
    this._initImageInteractions();

    // === Visualización de cambios de página ===
    this._initPageBreakOverlay();

    this._updateWordCount();
  },

  /**
   * Dispara el autoguardado con debounce optimizado (2000ms al teclear)
   */
  triggerAutoSave(immediate = false) {
    const badge = document.getElementById('notebook-autosave-badge');
    if (badge) {
      badge.textContent = '⏳ Editando...';
      badge.style.background = '#fffbeb';
      badge.style.color = '#b45309';
      badge.style.borderColor = '#fde68a';
    }

    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }

    if (immediate) {
      this.saveCurrentNotebookContent(false);
    } else {
      // 2000ms da suficiente espacio mientras el usuario sigue tecleando fluido
      this._autoSaveTimer = setTimeout(() => {
        this.saveCurrentNotebookContent(false);
      }, 2000);
    }
  },

  /**
   * Guarda de forma atómica el contenido del cuaderno en PlanRepository y ClassRepository
   * Evita re-procesar si el contenido no ha cambiado realmente.
   */
  saveCurrentNotebookContent(showToast = false) {
    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }

    const editor = document.getElementById('notebook-single-editor');
    if (!editor || (!this.currentClassId && this.currentClassIndex === null)) return false;

    const currentHtml = editor.innerHTML;
    const hdrObs = document.getElementById('hdr-edit-observations');
    const obsVal = hdrObs ? hdrObs.value.trim() : (this.currentClassData?.observations || '');

    // Evitar trabajo pesado si no hay cambio respecto al último guardado
    const hasContentChanged = (currentHtml !== this._lastSavedContent);
    const hasObsChanged = (obsVal !== (this._lastSavedObs || ''));
    if (!hasContentChanged && !hasObsChanged && !showToast) {
      return true;
    }

    const dateStr = this.currentDateStr || window.Planner?.currentDateStr;
    const classId = this.currentClassId || this.currentClassData?.id || window.Planner?.currentPlan?.classes?.[this.currentClassIndex]?.id;

    // Regla anti-vacíos: no sobreescribir con vacío si había contenido real
    if (this.currentClassData) {
      if (this.hasContent(currentHtml)) {
        this.currentClassData.notebookContent = currentHtml;
        if (!this.currentClassData.teacherNotebook) this.currentClassData.teacherNotebook = {};
        this.currentClassData.teacherNotebook.studentNotebookContent = currentHtml;
      }
      this.currentClassData.observations = obsVal;
    }

    // Persistir en ClassRepository si está disponible (arquitectura v4/v5)
    let savedInClassRepo = false;
    if (typeof ClassRepository !== 'undefined' && classId) {
      try {
        const tid = (typeof ClassRepository._getCurrentTeacherId === 'function') ? ClassRepository._getCurrentTeacherId() : 'usr_manuel';
        const clsInRepo = ClassRepository.getClass(classId, tid);
        if (clsInRepo) {
          if (this.hasContent(currentHtml)) {
            clsInRepo.notebookContent = currentHtml;
            if (!clsInRepo.teacherNotebook) clsInRepo.teacherNotebook = {};
            clsInRepo.teacherNotebook.studentNotebookContent = currentHtml;
          }
          clsInRepo.observations = obsVal;
          ClassRepository.saveClass(clsInRepo, tid);
          savedInClassRepo = true;
        }
      } catch (eRepo) {
        console.warn('Error saving notebook to ClassRepository:', eRepo);
      }
    }

    // Actualizar en Planner en memoria (legado)
    if (window.Planner && window.Planner.currentPlan && window.Planner.currentPlan.classes) {
      const cls = (this.currentClassIndex !== null)
        ? window.Planner.currentPlan.classes[this.currentClassIndex]
        : window.Planner.currentPlan.classes.find(c => c.id === classId);
      if (cls) {
        if (this.hasContent(currentHtml)) {
          cls.notebookContent = currentHtml;
          if (!cls.teacherNotebook) cls.teacherNotebook = {};
          cls.teacherNotebook.studentNotebookContent = currentHtml;
        }
        cls.observations = obsVal;
      }
    }

    // Persistir atómicamente a través de StorageService.saveClass por clase aislada
    let success = savedInClassRepo;
    if (dateStr && classId && typeof StorageService !== 'undefined' && StorageService.saveClass) {
      const updatedClass = {
        notebookContent: this.hasContent(currentHtml) ? currentHtml : (this.currentClassData?.notebookContent || ''),
        observations: obsVal
      };
      const res = StorageService.saveClass(dateStr, classId, updatedClass);
      if (res && res.plan) success = true;
    } else if (dateStr && typeof StorageService !== 'undefined' && StorageService.savePlan) {
      const planToSave = window.Planner?.currentPlan || StorageService.getPlanByDate(dateStr);
      if (planToSave) {
        if (StorageService.savePlan(dateStr, planToSave)) success = true;
      }
    }

    this._lastSavedContent = currentHtml;
    this._lastSavedObs = obsVal;
    
    // Actualizar conteo de palabras tras el guardado
    this._updateWordCount();

    // Registrar snapshot solo con cambios mayores y espaciados
    this._recordVersionSnapshot(currentHtml);

    const badge = document.getElementById('notebook-autosave-badge');
    if (badge) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      badge.textContent = '✓ Guardado (' + timeStr + ')';
      badge.style.background = '#ecfdf5';
      badge.style.color = '#065f46';
      badge.style.borderColor = '#a7f3d0';
    }

    if (showToast && typeof App !== 'undefined' && App.showToast) {
      App.showToast('✓ Cuaderno guardado con éxito', 'success');
    }

    return success;
  },

  /**
   * Escucha mensajes de sincronización remota de PlanRepository
   */
  _listenToRemoteSync() {
    if (this._hasBoundRemoteSync) return;
    this._hasBoundRemoteSync = true;

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('plan_remote_update', (e) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.date === this.currentDateStr) {
        // Otra pestaña actualizó este mismo día
        const conflictBanner = document.getElementById('notebook-conflict-banner');
        if (conflictBanner) {
          conflictBanner.style.display = 'flex';
          this._isRemoteConflict = true;
        }
      }
    });
    }
  },

  reloadFromRemote() {
    if (!this.currentDateStr || this.currentClassIndex === null) return;
    const plan = StorageService.getPlanByDate(this.currentDateStr);
    if (plan && plan.classes && plan.classes[this.currentClassIndex]) {
      this.currentClassData = plan.classes[this.currentClassIndex];
      const editor = document.getElementById('notebook-single-editor');
      if (editor) {
        editor.innerHTML = this.currentClassData.notebookContent || '';
        this._lastSavedContent = editor.innerHTML;
      }
      const hdrObs = document.getElementById('hdr-edit-observations');
      if (hdrObs) {
        hdrObs.value = this.currentClassData.observations || '';
      }
    }
    this.dismissConflict();
  },

  dismissConflict() {
    const banner = document.getElementById('notebook-conflict-banner');
    if (banner) banner.style.display = 'none';
    this._isRemoteConflict = false;
  },

  // =========================================================================
  // HISTORIAL DE VERSIONES
  // =========================================================================

  _recordVersionSnapshot(htmlContent) {
    if (!htmlContent || !this.hasContent(htmlContent)) return;
    // No guardar snapshots muy grandes en historial (imágenes base64 pueden congelar localStorage)
    if (htmlContent.length > 150000) return;

    const now = Date.now();
    // Throttling: solo crear un nuevo punto en historial si han pasado al menos 30 segundos desde el último
    if (this._lastSnapshotTime && (now - this._lastSnapshotTime < 30000)) {
      return;
    }

    // Evitar duplicar snapshots idénticos
    if (this._versionHistory.length > 0 && this._versionHistory[0].html === htmlContent) {
      return;
    }

    const nowDate = new Date(now);
    const timeStr = nowDate.toLocaleDateString('es-CO') + ' ' + nowDate.toLocaleTimeString('es-CO');
    const versionNum = this._versionHistory.length + 1;

    this._versionHistory.unshift({
      version: versionNum,
      timestamp: nowDate.toISOString(),
      displayDate: timeStr,
      summary: 'Versión ' + versionNum + ' (' + this._countWords(htmlContent) + ' palabras)',
      html: htmlContent
    });

    // Mantener un máximo ligero de 10 versiones
    if (this._versionHistory.length > 10) {
      this._versionHistory = this._versionHistory.slice(0, 10);
    }

    this._lastSnapshotTime = now;
    this._saveVersionHistory();
  },

  _saveVersionHistory() {
    const keyId = this.currentClassId || this.currentClassIndex;
    if (!this.currentDateStr || (keyId === null || keyId === undefined)) return;
    const key = 'notebook_history_' + this.currentDateStr + '_' + keyId;
    try {
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        IDBStorage.set(key, this._versionHistory);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(this._versionHistory));
      }
    } catch (e) {}
  },

  async _loadVersionHistory(dateStr, classIdx) {
    const key = 'notebook_history_' + dateStr + '_' + classIdx;
    try {
      if (typeof IDBStorage !== 'undefined' && IDBStorage.get) {
        const h = await IDBStorage.get(key);
        if (Array.isArray(h)) this._versionHistory = h;
      } else if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(key);
        if (raw) this._versionHistory = JSON.parse(raw);
      }
    } catch (e) {}
  },

  openHistoryModal() {
    const modal = document.getElementById('notebook-history-modal');
    const list = document.getElementById('notebook-history-list');
    if (!modal || !list) return;

    if (this._versionHistory.length === 0) {
      list.innerHTML = '<div style="padding:2rem; text-align:center; color:var(--slate-500);">Aún no hay versiones anteriores registradas para esta sesión.</div>';
    } else {
      list.innerHTML = this._versionHistory.map((ver, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.8rem 1rem; border-bottom:1px solid var(--slate-100); background:${idx === 0 ? '#f8fafc' : '#fff'};">
          <div>
            <strong>${this.escapeHtml(ver.summary)}</strong>
            <div style="font-size:0.8rem; color:var(--slate-500);">${this.escapeHtml(ver.displayDate)}</div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.restoreVersion(${idx})" style="font-weight:700;">
            ↩️ Restaurar Esta Versión
          </button>
        </div>
      `).join('');
    }

    modal.classList.add('active');
  },

  closeHistoryModal() {
    const modal = document.getElementById('notebook-history-modal');
    if (modal) modal.classList.remove('active');
  },

  restoreVersion(index) {
    const target = this._versionHistory[index];
    if (!target || !target.html) return;

    if (confirm('¿Deseas restaurar la ' + target.summary + '? Tu contenido actual se guardará antes de restaurar.')) {
      const editor = document.getElementById('notebook-single-editor');
      if (editor) {
        editor.innerHTML = target.html;
        this.saveCurrentNotebookContent(true);
      }
      this.closeHistoryModal();
    }
  },

  // =========================================================================
  // HERRAMIENTAS DE EDICIÓN NATIVAS
  // =========================================================================

  exec(cmd, val = null) {
    const editor = document.getElementById('notebook-single-editor');
    if (!editor) return;
    // Garantizar foco activo antes del comando (evita fallo silencioso al hacer clic en toolbar)
    editor.focus();
    try {
      document.execCommand(cmd, false, val);
    } catch (e) {
      console.warn('[NotebookEditor] execCommand falló:', cmd, e);
    }
    this.triggerAutoSave(false);
  },

  formatBlock(tag) {
    if (!tag) return;
    this.exec('formatBlock', '<' + tag + '>');
  },

  setFontFamily(family) {
    if (!family) return;
    this.exec('fontName', family);
  },

  setFontSize(size) {
    if (!size) return;
    this.exec('fontSize', '3');
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = size;
      const range = sel.getRangeAt(0);
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    }
    this.triggerAutoSave(false);
  },

  insertPageBreakAtCursor() {
    const breakHtml = '<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Salto de Página</span></div><p><br/></p>';
    this.exec('insertHTML', breakHtml);
  },

  insertLink() {
    const url = prompt('Introduce la URL del enlace (ej: https://...):');
    if (url) {
      this.exec('createLink', url);
    }
  },

  insertTable() {
    const tableHtml = `
      <table class="notebook-table" style="width:100%; border-collapse:collapse; margin:1rem 0;">
        <thead>
          <tr>
            <th style="border:1px solid #cbd5e1; padding:8px; background:#f1f5f9;">Columna 1</th>
            <th style="border:1px solid #cbd5e1; padding:8px; background:#f1f5f9;">Columna 2</th>
            <th style="border:1px solid #cbd5e1; padding:8px; background:#f1f5f9;">Columna 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px;">Dato 1</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Dato 2</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Dato 3</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px;">Dato 4</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Dato 5</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Dato 6</td>
          </tr>
        </tbody>
      </table>
      <p><br/></p>
    `;
    this.exec('insertHTML', tableHtml);
  },

  insertCallout(type) {
    let calloutHtml = '';
    if (type === 'concept') {
      calloutHtml = '<div class="notebook-callout concept"><strong>📌 Concepto Clave:</strong><p>Escribe aquí la definición o principio fundamental.</p></div><p><br/></p>';
    } else if (type === 'activity') {
      calloutHtml = '<div class="notebook-callout activity"><strong>✍️ Actividad en Clase:</strong><p>Instrucciones y pasos para la actividad práctica.</p></div><p><br/></p>';
    } else if (type === 'homework') {
      calloutHtml = '<div class="notebook-callout homework"><strong>🏠 Tarea / Compromiso:</strong><p>Actividades o ejercicios para desarrollar en casa.</p></div><p><br/></p>';
    }
    this.exec('insertHTML', calloutHtml);
  },

  handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      this.insertImageAtCursor(evt.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  },

  insertImageAtCursor(dataUrl) {
    const imgHtml = '<div style="text-align:center; margin:1rem 0;"><img src="' + dataUrl + '" alt="Imagen pedagógica" style="max-width:100%; height:auto; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.1);" /></div><p><br/></p>';
    this.exec('insertHTML', imgHtml);
  },

  toggleTemplatesMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('notebook-templates-menu');
    if (menu) menu.classList.toggle('show');
  },

  applyTemplate(templateId) {
    const editor = document.getElementById('notebook-single-editor');
    if (!editor) return;

    const templates = {
      standard: `
        <h2>🎯 1. Propósito y Pregunta Orientadora</h2>
        <p>¿Qué buscamos comprender o resolver durante esta sesión pedagógica?</p>
        <div class="notebook-callout concept">
          <strong>📌 Concepto Central:</strong>
          <p>Definición del tema o procedimiento clave.</p>
        </div>
        <h2>✍️ 2. Actividad de Aprendizaje y Práctica</h2>
        <p>Paso a paso de la actividad individual o grupal con los estudiantes.</p>
        <h2>🏆 3. Cierre y Evaluación Formativa</h2>
        <p>Conclusiones, retroalimentación y verificación de aprendizajes.</p>
      `,
      math: `
        <h2>📐 Taller Matemático: Problemas de Aplicación</h2>
        <div class="notebook-callout concept">
          <strong>📌 Regla / Fórmula Matemática:</strong>
          <p>Enunciado y ejemplo ilustrativo resuelto.</p>
        </div>
        <h3>Ejercicios Prácticos:</h3>
        <ol>
          <li>Ejercicio de calentamiento y cálculo guiado.</li>
          <li>Situación problémica de la vida cotidiana.</li>
          <li>Desafío de pensamiento lógico y análisis.</li>
        </ol>
      `,
      lab: `
        <h2>🤖 Guía de Laboratorio / Práctica Experimental</h2>
        <div class="notebook-callout activity">
          <strong>🔬 Materiales y Recursos:</strong>
          <p>Herramientas requeridas para el desarrollo de la sesión.</p>
        </div>
        <h3>Procedimiento Experimental:</h3>
        <p>1. Conexión y montaje de componentes.<br>2. Programación o diseño.<br>3. Comprobación y pruebas.</p>
      `,
      sistemas7: `
        <h2>💻 Creación Digital y Ofimática Aplicada</h2>
        <p>Desarrollo de competencias informáticas y gestión de documentos estructurados.</p>
        <div class="notebook-callout concept">
          <strong>📌 Habilidad Digital de la Sesión:</strong>
          <p>Configuración de páginas, márgenes, tipografías y tablas organizativas.</p>
        </div>
      `,
      robotics10: `
        <h2>🦾 Robótica 10°: Pinza Articulada con Joystick</h2>
        <p>Control biomecánico de servomotores mediante entradas analógicas del joystick.</p>
        <div class="notebook-callout concept">
          <strong>📌 Concepto de Mapeo (map):</strong>
          <p>Conversión de valores analógicos (0 a 1023) a grados angulares del servomotor (0° a 180°).</p>
        </div>
      `
    };

    const tpl = templates[templateId] || templates.standard;
    if (confirm('¿Deseas insertar esta plantilla didáctica en el cuaderno?')) {
      editor.innerHTML = tpl + '<p><br/></p>';
      this.saveCurrentNotebookContent(true);
    }
    const menu = document.getElementById('notebook-templates-menu');
    if (menu) menu.classList.remove('show');
  },

  /**
   * Exporta el Cuaderno / Guía Pedagógica a Microsoft Word (.doc) con diseño institucional completo
   */
  exportWordDocx() {
    this.saveCurrentNotebookContent(false);
    const cls = this.currentClassData || (this.currentClassIndex !== null && window.Planner?.currentPlan?.classes?.[this.currentClassIndex]) || {};
    const profile = (typeof StorageService !== 'undefined') ? StorageService.getProfile() : {};
    const institution = profile.institution || 'COLEGIO HOGAR MADRE DE DIOS';
    const teacherName = profile.name || 'Manuel Muñoz';
    const formattedDate = (typeof ExportService !== 'undefined' && ExportService.formatDate) ? ExportService.formatDate(cls.date || this.currentDateStr) : (cls.date || this.currentDateStr || '');
    const classNum = cls.sequenceNumber || cls.dayNumber || 1;
    const subjectDisplay = cls.subjectName || cls.subject || 'Asignatura';
    const gradeDisplay = cls.gradeName || cls.grade || '';
    const period = cls.period || profile.period || '1°';
    const topic = cls.curriculum?.topic || cls.topic || 'Guía de Clase';

    const editor = document.getElementById('notebook-single-editor');
    const bodyHtml = editor ? editor.innerHTML : (cls.notebookContent || '');
    const hdrObs = document.getElementById('hdr-edit-observations');
    const obsVal = hdrObs ? hdrObs.value.trim() : (cls.observations || '');

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Cuaderno del Docente - ${this.escapeHtml(subjectDisplay)} - ${this.escapeHtml(institution)}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: letter portrait;
            margin: 1.27cm 1.27cm 1.27cm 1.27cm;
            mso-header-margin: 36pt;
            mso-footer-margin: 36pt;
            mso-paper-source: 0;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: Calibri, Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.45;
            color: #1e293b;
          }
          h1, h2, h3, h4 { color: #1e3a8a; margin-top: 14pt; margin-bottom: 6pt; }
          h1 { font-size: 18pt; border-bottom: 2pt solid #1e3a8a; padding-bottom: 4pt; }
          h2 { font-size: 14pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 2pt; }
          h3 { font-size: 12pt; }
          p { margin: 0 0 7pt 0; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
          }
          td, th {
            border: 1pt solid #94a3b8;
            padding: 6pt 8pt;
            font-size: 10pt;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #0f172a;
          }
          .notebook-callout {
            border-left: 4pt solid #3b82f6;
            background-color: #eff6ff;
            padding: 8pt 12pt;
            margin: 10pt 0;
          }
          .notebook-callout.concept {
            border-left-color: #059669;
            background-color: #ecfdf5;
          }
          .notebook-callout.activity {
            border-left-color: #2563eb;
            background-color: #eff6ff;
          }
          .notebook-callout.homework {
            border-left-color: #d97706;
            background-color: #fffbeb;
          }
          .header-table {
            width: 100%;
            border: none;
            margin-bottom: 14pt;
            border-collapse: collapse;
          }
          .header-table td {
            border: none;
            padding: 2pt 4pt;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1pt solid #cbd5e1;
            margin-bottom: 14pt;
          }
          .meta-table td {
            border: 1pt solid #e2e8f0;
            padding: 4pt 8pt;
            font-size: 9.5pt;
          }
          .observations-box {
            border: 1pt solid #fde68a;
            background-color: #fffbeb;
            padding: 8pt 12pt;
            margin-top: 20pt;
            border-radius: 4pt;
          }
          .page-break {
            page-break-before: always;
            mso-break-type: section-break;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          <!-- Encabezado Institucional -->
          <table class="header-table">
            <tr>
              <td style="width: 75%; vertical-align: middle;">
                <div style="font-size: 11pt; font-weight: bold; color: #1e3a8a; text-transform: uppercase;">
                  ${this.escapeHtml(institution)}
                </div>
                <div style="font-size: 15pt; font-weight: bold; color: #0f172a; margin-top: 2pt;">
                  GUÍA PEDAGÓGICA Y CUADERNO DE CLASE
                </div>
              </td>
              <td style="width: 25%; text-align: right; vertical-align: middle;">
                <div style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-weight: bold; font-size: 11pt; padding: 4pt 10pt; border-radius: 4pt;">
                  Clase #${classNum}
                </div>
              </td>
            </tr>
          </table>

          <!-- Metadatos de la Sesión -->
          <table class="meta-table">
            <tr>
              <td style="width: 40%;"><strong>Docente:</strong> ${this.escapeHtml(teacherName)}</td>
              <td style="width: 30%;"><strong>Asignatura:</strong> ${this.escapeHtml(subjectDisplay)}</td>
              <td style="width: 30%;"><strong>Grado:</strong> ${this.escapeHtml(gradeDisplay)}</td>
            </tr>
            <tr>
              <td><strong>Fecha:</strong> ${this.escapeHtml(formattedDate)}</td>
              <td><strong>Periodo:</strong> ${this.escapeHtml(period)}</td>
              <td><strong>Tema:</strong> ${this.escapeHtml(topic)}</td>
            </tr>
          </table>

          <!-- Contenido del Cuaderno -->
          <div class="notebook-content">
            ${bodyHtml}
          </div>

          <!-- Observaciones Pedagógicas -->
          ${obsVal ? `
            <div class="observations-box">
              <strong style="color: #92400e; font-size: 10pt;">📝 Observaciones Pedagógicas de la Sesión:</strong>
              <p style="margin: 4pt 0 0 0; font-size: 9.5pt; white-space: pre-wrap;">${this.escapeHtml(obsVal)}</p>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword;charset=utf-8' });
    const subClean = (subjectDisplay || 'Clase').replace(/[\s\/\\:*?"<>|]+/g, '_');
    const grdClean = (gradeDisplay || '').replace(/[\s\/\\:*?"<>|]+/g, '_');
    const fileName = `Cuaderno_${subClean}_${grdClean}_Clase_${classNum}_${cls.date || this.currentDateStr || 'sesion'}.doc`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('Descargando Cuaderno Docente en formato Word (.doc)...', 'info');
    }
  },

  printNotebook() {
    this.saveCurrentNotebookContent(false);

    // =========================================================================
    // PASO 1: PREPARAR EL DOM PARA IMPRESIÓN LIMPIA
    // =========================================================================

    // 1a. Convertir el textarea de observaciones en un div legible (no como formulario)
    const hdrObs = document.getElementById('hdr-edit-observations');
    let obsDiv = null;
    if (hdrObs) {
      obsDiv = document.createElement('div');
      obsDiv.id = 'nb-print-obs-div';
      obsDiv.style.cssText = 'font-size:0.85rem; line-height:1.6; color:#1e293b; white-space:pre-wrap; padding:0; margin:0;';
      obsDiv.textContent = hdrObs.value || '';
      hdrObs.parentNode.insertBefore(obsDiv, hdrObs);
      hdrObs.style.display = 'none';
    }

    // 1b. Ocultar marcadores de página del editor (Hoja 2, Hoja 3, etc.)
    const pageBreakMarkers = document.querySelectorAll('.nb-auto-page-break');
    pageBreakMarkers.forEach(el => { el.dataset.printHidden = '1'; el.style.display = 'none'; });

    // 1c. Ocultar el contador de palabras
    const wordCountBadge = document.getElementById('doc-word-count-badge');
    if (wordCountBadge) wordCountBadge.dataset.printHidden = '1', wordCountBadge.style.display = 'none';

    // 1d. Inyectar @page con tamaño carta y márgenes correctos
    let printStyle = document.getElementById('notebook-print-orientation-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'notebook-print-orientation-style';
      document.head.appendChild(printStyle);
    }
    printStyle.textContent = `
      @page {
        size: letter portrait;
        margin: 0;
      }
    `;

    // =========================================================================
    // PASO 2: MARCAR EL BODY PARA QUE EL CSS DE IMPRESIÓN TOME CONTROL
    // =========================================================================
    document.body.classList.add('printing-notebook');

    // =========================================================================
    // PASO 3: IMPRIMIR
    // =========================================================================
    window.print();

    // =========================================================================
    // PASO 4: RESTAURAR EL DOM AL ESTADO ORIGINAL
    // =========================================================================
    setTimeout(() => {
      document.body.classList.remove('printing-notebook');

      // Restaurar textarea de observaciones
      if (hdrObs) {
        hdrObs.style.display = '';
        if (obsDiv) obsDiv.remove();
      }

      // Restaurar marcadores de página
      pageBreakMarkers.forEach(el => {
        delete el.dataset.printHidden;
        el.style.display = '';
      });

      // Restaurar contador de palabras
      if (wordCountBadge) {
        delete wordCountBadge.dataset.printHidden;
        wordCountBadge.style.display = '';
      }

      // Remover estilo de impresión inyectado
      if (printStyle) printStyle.remove();

    }, 2000);
  },

  generateDefaultContentFromClass(cls) {
    const isDirGroup = cls?.subject && String(cls.subject).toLowerCase().includes('direccion de grupo');
    if (isDirGroup) {
      return `
        <h2>🤝 1. Saludo, Reflexión y Asuntos Generales del Grupo</h2>
        <p>Espacio de bienvenida, diálogo formativo y seguimiento de novedades del aula.</p>
        <div class="notebook-callout concept">
          <strong>📋 Puntos Clave de la Sesión:</strong>
          <p>Acuerdos de convivencia, compromisos académicos y orientación vocacional.</p>
        </div>
      `;
    }

    const sub = cls?.subject || 'Clase';
    const grd = cls?.grade || '';
    const top = cls?.topic || 'Desarrollo de la Clase';

    return `
      <h2>🎯 ${this.escapeHtml(top)}</h2>
      <p>Introducción y exploración de ideas previas con los estudiantes de ${this.escapeHtml(grd)}.</p>
      <div class="notebook-callout concept">
        <strong>📌 Concepto Clave:</strong>
        <p>Fundamentos teóricos y explicaciones principales de la sesión.</p>
      </div>
      <h2>✍️ Actividad Práctica y Ejercitación</h2>
      <p>Desarrollo de talleres, ejercicios o dinámicas de aula.</p>
    `;
  },

  hasContent(content) {
    if (!content) return false;
    const str = String(content).trim();
    if (!str || str === '<p><br/></p>' || str === '<p><br></p>' || str === '<p></p>' || str === '<br>') return false;
    const text = str.replace(/<[^>]+>/g, '').replace(/[\s\u00a0\u200B]+/g, '');
    if (text.length > 0) return true;
    return /<(img|table|iframe|hr|svg|canvas|video|audio)[^>]*>/i.test(str);
  },

  hasNotebookContent(cls) {
    return this.hasContent(cls?.notebookContent);
  },

  _countWords(str) {
    if (!str) return 0;
    const text = str.replace(/<[^>]+>/g, ' ').replace(/[\s\u00a0\u200B]+/g, ' ').trim();
    if (!text) return 0;
    return text.split(' ').filter(Boolean).length;
  },

  _updateWordCount() {
    const editor = document.getElementById('notebook-single-editor');
    const badge = document.getElementById('doc-word-count-badge');
    if (!editor || !badge) return;
    const words = this._countWords(editor.innerHTML);
    badge.textContent = words + (words === 1 ? ' palabra' : ' palabras');
  },

  /**
   * Convierte texto plano o Markdown a HTML estructurado y pedagógico para el Cuaderno
   */
  formatNotebookHtml(content) {
    if (!content || typeof content !== 'string') return '';
    const trimmed = content.trim();
    if (!trimmed || trimmed === '<p><br/></p>' || trimmed === '<p><br></p>' || trimmed === '<br>') return '';

    // Si ya es HTML estructurado y NO tiene encabezados o viñetas en Markdown crudo
    const hasRichTags = /<(?:p|h[1-6]|ul|ol|table|div|blockquote)[^>]*>/i.test(trimmed);
    const hasRawMarkdown = /\*\*\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡]|\*\*(?:Regla|Paso|Norma|Lectura|Definici[oó]n|Importante)[\s\w#º°\d]*:|\n•\s*\*\*|•\s+\*\*|\*\*[^*]+\*\*/.test(trimmed);

    if (hasRichTags && !hasRawMarkdown) {
      return trimmed;
    }

    // Usar el convertidor centralizado de ImportParser si está disponible
    if (typeof ImportParser !== 'undefined' && typeof ImportParser.formatMarkdownToHtml === 'function') {
      return ImportParser.formatMarkdownToHtml(trimmed);
    }

    // Fallback integrado si ImportParser no está en el scope
    return this._fallbackFormatMarkdown(trimmed);
  },

  _fallbackFormatMarkdown(content) {
    let text = this.cleanBrokenLinebreaks(content)
      .replace(/([^\n])\s+([•]|[-*](?=\s+[A-ZÁÉÍÓÚÑa-záéíóúñ0-9¿¡"«\*\d]))\s+/g, '$1\n$2 ')
      .replace(/([^\n])\s*(\*{2}\d+[\.\)]\s+[^\n*]+\*{2})/g, '$1\n\n$2')
      .replace(/(\*{2}\d+[\.\)]\s+[^\n*]+\*{2})\s*([A-ZÁÉÍÓÚÑ¿¡•])/g, '$1\n\n$2')
      .replace(/([.!?:;)\]\*])\s*(\*{1,2}(?:Regla(?:\s+n[úu]mero)?\s*\d+|Paso\s*\d+|Norma\s*\d+|Lectura\s+completa|Definici[oó]n|Ejemplo|Importante|Nota|Pregunta)\b[^:\n\r]{0,50}:\*{0,2})/gi, '$1\n\n$2')
      .replace(/\n{3,}/g, '\n\n');

    const blocks = text.split(/\n{2,}/);
    const htmlBlocks = [];

    for (let b of blocks) {
      const block = b.trim();
      if (!block) continue;

      const headingMatch = block.match(/^(?:#{1,3}\s+|\*{0,2})(\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡][^\n*]+?)\*{0,2}$/);
      if (headingMatch) {
        const title = headingMatch[1].replace(/[\*#]/g, '').trim();
        htmlBlocks.push(`<h2 style="color:#1e3a8a; margin-top:1.4rem; margin-bottom:0.6rem; font-size:1.18rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px;">${this.escapeHtml(title)}</h2>`);
        continue;
      }

      const ruleMatch = block.match(/^\*{0,2}((?:Regla(?:\s+n[úu]mero)?\s*\d+|Norma\s*\d+|Paso\s*\d+|Importante|Nota|Definici[oó]n)[\s\w#º°\d]*:)\*{0,2}\s*([\s\S]+)$/i);
      if (ruleMatch) {
        const ruleLabel = ruleMatch[1].replace(/[\*#]/g, '').trim();
        const ruleBody = this._formatInlineMarkdown(ruleMatch[2]);
        htmlBlocks.push(`<div class="notebook-callout concept" style="margin:0.8rem 0; padding:10px 14px; background:#eff6ff; border-left:4px solid #3b82f6; border-radius:4px; font-size:0.95rem; line-height:1.6;"><strong style="color:#1d4ed8;">${this.escapeHtml(ruleLabel)}</strong> ${ruleBody}</div>`);
        continue;
      }

      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0 && lines.every(l => /^[•\-\*]\s+/.test(l))) {
        const listItemsHtml = lines.map(l => {
          const c = l.replace(/^[•\-\*]\s+/, '').trim();
          return `<li style="margin-bottom:0.35rem;">${this._formatInlineMarkdown(c)}</li>`;
        }).join('');
        htmlBlocks.push(`<ul style="margin:0.5rem 0 0.8rem 1.25rem; padding-left:1rem; line-height:1.6; color:#1e293b;">${listItemsHtml}</ul>`);
        continue;
      }

      // Si contiene viñetas intercaladas en el bloque
      if (lines.some(l => /^[•\-\*]\s+/.test(l))) {
        let currentP = [];
        let currentList = [];
        for (const line of lines) {
          if (/^[•\-\*]\s+/.test(line)) {
            if (currentP.length > 0) {
              htmlBlocks.push(`<p style="margin-bottom:0.6rem; line-height:1.6; text-align:justify;">${this._formatInlineMarkdown(currentP.join(' '))}</p>`);
              currentP = [];
            }
            const c = line.replace(/^[•\-\*]\s+/, '').trim();
            currentList.push(`<li style="margin-bottom:0.35rem;">${this._formatInlineMarkdown(c)}</li>`);
          } else {
            if (currentList.length > 0) {
              htmlBlocks.push(`<ul style="margin:0.5rem 0 0.8rem 1.25rem; padding-left:1rem; line-height:1.6; color:#1e293b;">${currentList.join('')}</ul>`);
              currentList = [];
            }
            currentP.push(line);
          }
        }
        if (currentList.length > 0) {
          htmlBlocks.push(`<ul style="margin:0.5rem 0 0.8rem 1.25rem; padding-left:1rem; line-height:1.6; color:#1e293b;">${currentList.join('')}</ul>`);
        }
        if (currentP.length > 0) {
          htmlBlocks.push(`<p style="margin-bottom:0.8rem; line-height:1.6; text-align:justify;">${this._formatInlineMarkdown(currentP.join(' '))}</p>`);
        }
        continue;
      }

      const formattedPara = this._formatInlineMarkdown(block.replace(/\n/g, ' '));
      htmlBlocks.push(`<p style="margin-bottom:0.8rem; line-height:1.6; text-align:justify;">${formattedPara}</p>`);
    }

    return htmlBlocks.join('\n\n');
  },

  _formatInlineMarkdown(str) {
    if (!str) return '';
    let res = this.escapeHtml(str);
    res = res.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    res = res.replace(/(^|[^\*])\*([^\*]+?)\*([^\*]|$)/g, '$1<em>$2</em>$3');
    return res;
  },

  /**
   * Reorganiza y aplica formato adecuado al contenido actual del editor
   */
  formatCurrentEditorContent() {
    const editor = document.getElementById('notebook-single-editor');
    if (!editor) return;
    const current = editor.innerHTML;
    if (!this.hasContent(current)) return;

    const formatted = this.formatNotebookHtml(current);
    if (formatted) {
      editor.innerHTML = formatted;
      this.triggerAutoSave(true);
      this._updateWordCount();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('✨ Formato del cuaderno organizado correctamente', 'success');
      }
    }
  },

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
    clean = clean.replace(/(?:^|\n)\s*(TALLER\s*[\/:\-])\s*\n+\s*(ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)\b/gi, '\n$1 $2');

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
  },

  // =========================================================================
  // REDIMENSIONAMIENTO E INTERACCIONES DE IMÁGENES
  // =========================================================================

  _initImageInteractions() {
    const editor = document.getElementById('notebook-single-editor');
    if (!editor || editor._imgInteractBound) return;
    editor._imgInteractBound = true;

    // Inyectar CSS para el toolbar de imagen y los separadores de página
    if (!document.getElementById('nb-img-toolbar-css')) {
      const style = document.createElement('style');
      style.id = 'nb-img-toolbar-css';
      style.textContent = `
        #nb-img-toolbar {
          display: none;
          position: fixed;
          z-index: 9999;
          background: #1e293b;
          border-radius: 8px;
          padding: 5px 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.35);
          align-items: center;
          gap: 4px;
          flex-wrap: nowrap;
          transform: translateY(-6px);
          transition: opacity 0.15s;
        }
        #nb-img-toolbar.active { display: flex; }
        #nb-img-toolbar button {
          background: #334155;
          color: #e2e8f0;
          border: 1px solid #475569;
          border-radius: 4px;
          padding: 3px 8px;
          font-size: 0.78rem;
          cursor: pointer;
          white-space: nowrap;
          line-height: 1.4;
        }
        #nb-img-toolbar button:hover { background: #3b82f6; border-color: #3b82f6; color: #fff; }
        #nb-img-toolbar .nb-sep { width: 1px; height: 18px; background: #475569; flex-shrink: 0; }
        #nb-img-toolbar .nb-lbl { color: #94a3b8; font-size: 0.72rem; }
        #nb-img-toolbar button.nb-danger:hover { background: #ef4444; border-color: #ef4444; }
        .nb-img-selected { outline: 2.5px solid #3b82f6 !important; outline-offset: 2px; border-radius: 3px; cursor: pointer; }
        .nb-auto-page-break {
          position: absolute;
          left: 0;
          right: 0;
          height: 18px;
          background: #e2e8f0;
          border-top: 1px solid #cbd5e1;
          border-bottom: 1px solid #cbd5e1;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nb-auto-page-break-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .nb-auto-page-break-label {
          background: #ffffff;
          color: #64748b;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 1px 8px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          letter-spacing: 0.3px;
        }
      `;
      document.head.appendChild(style);
    }

    // Crear el toolbar flotante de imagen (una sola instancia global)
    if (!document.getElementById('nb-img-toolbar')) {
      const tb = document.createElement('div');
      tb.id = 'nb-img-toolbar';
      tb.innerHTML = `
        <span class="nb-lbl">Ancho:</span>
        <button onmousedown="event.preventDefault()" onclick="NotebookEditor._setImageWidth('25%')">25%</button>
        <button onmousedown="event.preventDefault()" onclick="NotebookEditor._setImageWidth('50%')">50%</button>
        <button onmousedown="event.preventDefault()" onclick="NotebookEditor._setImageWidth('75%')">75%</button>
        <button onmousedown="event.preventDefault()" onclick="NotebookEditor._setImageWidth('100%')">100%</button>
        <div class="nb-sep"></div>
        <button onmousedown="event.preventDefault()" onclick="NotebookEditor._alignImage('left')" title="Alinear izquierda">⇤</button>
        <button onmousedown="event.preventDefault()" onclick="NotebookEditor._alignImage('center')" title="Centrar">≡</button>
        <button onmousedown="event.preventDefault()" onclick="NotebookEditor._alignImage('right')" title="Alinear derecha">⇥</button>
        <div class="nb-sep"></div>
        <button class="nb-danger" onmousedown="event.preventDefault()" onclick="NotebookEditor._deleteSelectedImage()" title="Eliminar imagen">✕ Eliminar</button>
      `;
      document.body.appendChild(tb);
    }

    // Clic en imagen dentro del editor → seleccionar y mostrar toolbar
    editor.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (img) {
        e.stopPropagation();
        this._selectImage(img);
      }
    });

    // Clic fuera → deseleccionar
    document.addEventListener('mousedown', (e) => {
      const toolbar = document.getElementById('nb-img-toolbar');
      if (!e.target.closest('#nb-img-toolbar') && !e.target.closest('#notebook-single-editor img')) {
        this._deselectImage();
      }
    });
  },

  _selectedImage: null,

  _selectImage(img) {
    this._deselectImage();
    this._selectedImage = img;
    img.classList.add('nb-img-selected');
    const toolbar = document.getElementById('nb-img-toolbar');
    if (!toolbar) return;
    const rect = img.getBoundingClientRect();
    const tbWidth = 400;
    let left = rect.left + window.scrollX + rect.width / 2 - tbWidth / 2;
    let top = rect.top + window.scrollY - 46;
    // Evitar que salga de la pantalla
    left = Math.max(8, Math.min(left, window.innerWidth - tbWidth - 8));
    if (top < 8) top = rect.bottom + window.scrollY + 8;
    toolbar.style.top = top + 'px';
    toolbar.style.left = left + 'px';
    toolbar.classList.add('active');
  },

  _deselectImage() {
    if (this._selectedImage) {
      this._selectedImage.classList.remove('nb-img-selected');
      this._selectedImage = null;
    }
    const toolbar = document.getElementById('nb-img-toolbar');
    if (toolbar) toolbar.classList.remove('active');
  },

  _setImageWidth(width) {
    if (!this._selectedImage) return;
    this._selectedImage.style.width = width;
    this._selectedImage.style.height = 'auto';
    this._selectedImage.style.maxWidth = '100%';
    // Reposicionar toolbar
    this._selectImage(this._selectedImage);
    this.triggerAutoSave(false);
    setTimeout(() => this._updatePageBreakIndicators(), 300);
  },

  _alignImage(align) {
    if (!this._selectedImage) return;
    const wrapper = this._selectedImage.closest('div[style*="text-align"]') || this._selectedImage.parentElement;
    if (wrapper && wrapper.tagName === 'DIV' && wrapper !== document.getElementById('notebook-single-editor')) {
      wrapper.style.textAlign = align;
    } else {
      if (align === 'left') {
        this._selectedImage.style.float = 'left';
        this._selectedImage.style.marginRight = '1rem';
        this._selectedImage.style.marginLeft = '0';
        this._selectedImage.style.display = '';
      } else if (align === 'right') {
        this._selectedImage.style.float = 'right';
        this._selectedImage.style.marginLeft = '1rem';
        this._selectedImage.style.marginRight = '0';
        this._selectedImage.style.display = '';
      } else {
        this._selectedImage.style.float = '';
        this._selectedImage.style.display = 'block';
        this._selectedImage.style.margin = '0 auto';
      }
    }
    this.triggerAutoSave(false);
  },

  _deleteSelectedImage() {
    if (!this._selectedImage) return;
    const img = this._selectedImage;
    this._deselectImage();
    // Si el wrapper div sólo contiene la imagen, eliminar todo el wrapper
    const wrapper = img.parentElement;
    if (wrapper && wrapper.tagName === 'DIV' && wrapper !== document.getElementById('notebook-single-editor')) {
      const otherContent = Array.from(wrapper.childNodes).filter(n => n !== img && (n.nodeType !== 3 || n.textContent.trim()));
      if (otherContent.length === 0) {
        wrapper.remove();
      } else {
        img.remove();
      }
    } else {
      img.remove();
    }
    this.triggerAutoSave(false);
    setTimeout(() => this._updatePageBreakIndicators(), 300);
  },

  // =========================================================================
  // VISUALIZACIÓN DE CAMBIOS DE PÁGINA EN EL EDITOR
  // =========================================================================

  _initPageBreakOverlay() {
    const editor = document.getElementById('notebook-single-editor');
    const paperContainer = document.querySelector('.notebook-paper-container');
    if (!editor || !paperContainer) return;

    // El paper-container debe tener position:relative para posicionar marcadores
    const pos = getComputedStyle(paperContainer).position;
    if (pos === 'static') paperContainer.style.position = 'relative';

    // Actualización inicial — esperar a que el DOM esté completamente renderizado
    setTimeout(() => this._updatePageBreakIndicators(), 500);

    // Re-calcular al editar (con debounce para no sobrecargar)
    if (!editor._pageBreakBound) {
      editor._pageBreakBound = true;
      const debouncedUpdate = this._debounce(() => this._updatePageBreakIndicators(), 1000);
      editor.addEventListener('input', debouncedUpdate);
    }

    // Re-calcular al cambiar tamaño de ventana
    window.addEventListener('resize', this._debounce(() => this._updatePageBreakIndicators(), 600));
  },

  _debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  _updatePageBreakIndicators() {
    const editor = document.getElementById('notebook-single-editor');
    const paperContainer = document.querySelector('.notebook-paper-container');
    if (!editor || !paperContainer) return;

    // Eliminar marcadores anteriores
    paperContainer.querySelectorAll('.nb-auto-page-break').forEach(el => el.remove());

    const containerWidth = paperContainer.clientWidth;
    if (!containerWidth) return;

    // Calcular altura de página con margen estrecho (Carta: 215.9mm × 279.4mm)
    // Relación de aspecto Carta = 279.4 / 215.9 ≈ 1.2941 (o A4: 297/210 ≈ 1.414)
    // En pantalla, la hoja tiene padding de 1.27cm (aprox 48px por lado = 96px total)
    const pageHeightPx = Math.round(containerWidth * 1.35);

    // Descontar el alto del encabezado institucional (solo afecta la primera página)
    const headerCard = paperContainer.querySelector('.notebook-page-header-card');
    const headerHeight = headerCard ? (headerCard.offsetHeight + 18) : 0;

    // offsetTop del editor dentro del paperContainer
    const editorOffsetTop = editor.offsetTop;
    const editorHeight = editor.scrollHeight;

    // Primera ruptura de página
    let yInEditor = pageHeightPx - headerHeight - editorOffsetTop;
    if (yInEditor <= 30) yInEditor += pageHeightPx;

    let pageNum = 2;
    while (yInEditor < editorHeight - 40) {
      const marker = document.createElement('div');
      marker.className = 'nb-auto-page-break';
      marker.contentEditable = 'false';
      marker.setAttribute('data-page-num', pageNum);
      marker.style.top = (editorOffsetTop + yInEditor) + 'px';
      marker.innerHTML = `
        <div class="nb-auto-page-break-inner">
          <span class="nb-auto-page-break-label">Hoja ${pageNum}</span>
        </div>
      `;
      paperContainer.appendChild(marker);
      yInEditor += pageHeightPx;
      pageNum++;
    }
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

if (typeof window !== 'undefined') {
  window.NotebookEditor = NotebookEditor;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotebookEditor;
}
