/**
 * MÓDULO DE EDICIÓN Y FORMATO DE CUADERNO / GUÍA PEDAGÓGICA (NotebookEditor)
 * Arquitectura: UN SOLO DOCUMENTO EDITABLE (contenteditable único)
 * Soporta selección de texto nativa continua entre páginas, formato tipo Word/Docs,
 * autosave con debounce, historial de versiones y control de concurrencia multi-pestaña.
 */

const NotebookEditor = {
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

    // Cargar historial de versiones previo desde IndexedDB si existe
    this._loadVersionHistory(this.currentDateStr, classIndex);

    const backBtnHtml = isStandalone
      ? '<button type="button" class="btn btn-secondary btn-sm" onclick="window.close()" title="Guardar y cerrar pestaña" style="font-weight:600; padding:0.45rem 0.9rem; display:inline-flex; align-items:center; gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>Cerrar Pestaña</button>'
      : '<button type="button" class="btn btn-secondary btn-sm" onclick="App.showPlannerView()" title="Volver al planeador de clases" style="font-weight:600; padding:0.45rem 0.9rem; display:inline-flex; align-items:center; gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>Volver al Planeador</button>';

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
                  ${this.escapeHtml(formattedDate)} • Periodo ${this.escapeHtml(period)} • ${cls.topic ? 'Tema: ' + this.escapeHtml(cls.topic) : 'Sin tema'}
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

              <!-- Observaciones Pedagógicas Específicas de la Sesión -->
              <div style="margin-top:0.6rem; border-top:1px solid var(--slate-200); padding-top:0.5rem;">
                <label style="font-size:0.82rem; font-weight:700; color:#92400e; display:flex; align-items:center; gap:4px; margin-bottom:3px;">
                  📝 Observaciones Pedagógicas de la Clase:
                </label>
                <textarea id="hdr-edit-observations" class="table-textarea" rows="2" style="width:100%; box-sizing:border-box; font-size:0.82rem; background:#fffbeb; border-color:#fde68a; border-radius:4px; padding:4px 8px;" placeholder="Redacta aquí observaciones específicas para esta sesión...">${this.escapeHtml(cls.observations || '')}</textarea>
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
   * Prepara el HTML inicial garantizando que nunca quede en blanco o roto
   */
  _prepareInitialHtml(cls) {
    if (cls && cls.notebookContent && cls.notebookContent.trim() && cls.notebookContent !== '<p><br/></p>' && cls.notebookContent !== '<p><br></p>') {
      return cls.notebookContent;
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

    // Autoguardado con debounce de 700ms al teclear
    editor.oninput = () => {
      this.triggerAutoSave(false);
      this._updateWordCount();
    };

    // Al perder el foco, guardar inmediatamente
    editor.onblur = () => {
      this.triggerAutoSave(true);
    };

    // Observaciones guardadas al editar o desenfocar
    if (hdrObs) {
      hdrObs.oninput = () => this.triggerAutoSave(false);
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

    // Manejo de pegado de imágenes o texto plano
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

    this._updateWordCount();
  },

  /**
   * Dispara el autoguardado con debounce (700ms)
   */
  triggerAutoSave(immediate = false) {
    const badge = document.getElementById('notebook-autosave-badge');
    if (badge) {
      badge.textContent = '⏳ Guardando...';
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
      this._autoSaveTimer = setTimeout(() => {
        this.saveCurrentNotebookContent(false);
      }, 700);
    }
  },

  /**
   * Guarda de forma atómica el contenido del cuaderno en PlanRepository
   */
  saveCurrentNotebookContent(showToast = false) {
    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }

    const editor = document.getElementById('notebook-single-editor');
    if (!editor || this.currentClassIndex === null) return false;

    const currentHtml = editor.innerHTML;
    const hdrObs = document.getElementById('hdr-edit-observations');
    const obsVal = hdrObs ? hdrObs.value.trim() : (this.currentClassData?.observations || '');

    const dateStr = this.currentDateStr || window.Planner?.currentDateStr;
    if (!dateStr) return false;

    // Regla anti-vacíos: no sobreescribir con vacío si había contenido real
    if (this.currentClassData) {
      if (this.hasContent(currentHtml)) {
        this.currentClassData.notebookContent = currentHtml;
      }
      this.currentClassData.observations = obsVal;
    }

    // Actualizar en Planner en memoria
    if (window.Planner && window.Planner.currentPlan && window.Planner.currentPlan.classes && window.Planner.currentPlan.classes[this.currentClassIndex]) {
      const cls = window.Planner.currentPlan.classes[this.currentClassIndex];
      if (this.hasContent(currentHtml)) {
        cls.notebookContent = currentHtml;
      }
      cls.observations = obsVal;
    }

    // Persistir atómicamente a través de StorageService.saveClass por clase aislada
    let success = false;
    const classId = this.currentClassData?.id || window.Planner?.currentPlan?.classes?.[this.currentClassIndex]?.id;
    if (classId && typeof StorageService !== 'undefined' && StorageService.saveClass) {
      const updatedClass = {
        notebookContent: this.hasContent(currentHtml) ? currentHtml : (this.currentClassData?.notebookContent || ''),
        observations: obsVal
      };
      const res = StorageService.saveClass(dateStr, classId, updatedClass);
      success = Boolean(res && res.plan);
      this._lastSavedContent = currentHtml;
      this._recordVersionSnapshot(currentHtml);
    } else {
      const planToSave = window.Planner?.currentPlan || StorageService.getPlanByDate(dateStr);
      if (planToSave) {
        success = StorageService.savePlan(dateStr, planToSave);
        this._lastSavedContent = currentHtml;
        this._recordVersionSnapshot(currentHtml);
      }
    }

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
    const now = new Date();
    const timeStr = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO');

    // Evitar duplicar snapshots idénticos
    if (this._versionHistory.length > 0 && this._versionHistory[0].html === htmlContent) {
      return;
    }

    const versionNum = this._versionHistory.length + 1;
    this._versionHistory.unshift({
      version: versionNum,
      timestamp: now.toISOString(),
      displayDate: timeStr,
      summary: 'Versión ' + versionNum + ' (' + this._countWords(htmlContent) + ' palabras)',
      html: htmlContent
    });

    if (this._versionHistory.length > 25) {
      this._versionHistory = this._versionHistory.slice(0, 25);
    }

    this._saveVersionHistory();
  },

  _saveVersionHistory() {
    if (!this.currentDateStr || this.currentClassIndex === null) return;
    const key = 'notebook_history_' + this.currentDateStr + '_' + this.currentClassIndex;
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
    if (editor) editor.focus();
    document.execCommand(cmd, false, val);
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

  printNotebook() {
    this.saveCurrentNotebookContent(false);
    window.print();
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
