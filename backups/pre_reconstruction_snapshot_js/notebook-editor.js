/**
 * MÓDULO DE EDICIÓN Y FORMATO DE CUADERNO / GUÍA PEDAGÓGICA DETALLADA DE CLASE
 * Editor enriquecido (WYSIWYG) tipo Word con inserción de imágenes, tablas, cuadros didácticos y vista de cuaderno imprimible.
 */

const NotebookEditor = {
  currentClassIndex: null,
  currentDateStr: null,
  currentClassData: null,
  _undoStack: [],
  _redoStack: [],
  _isHistoryAction: false,

  openForClass(classIndex) {
    if (typeof App !== 'undefined' && typeof App.openNotebookEditorView === 'function') {
      App.openNotebookEditorView(classIndex);
    } else {
      this.openInPage(classIndex);
    }
  },

  openInNewTab(classIndex = null) {
    const idx = classIndex !== null ? classIndex : this.currentClassIndex;
    const dateStr = this.currentDateStr || window.Planner?.currentDateStr;
    if (!dateStr) return;

    this.saveCurrentNotebookContent(false);
    const url = `notebook-editor.html?date=${encodeURIComponent(dateStr)}&class=${encodeURIComponent(idx)}`;
    window.open(url, '_blank');
  },

  closeModal() {
    this.saveCurrentNotebookContent(false);
    if (typeof App !== 'undefined' && typeof App.showPlannerView === 'function') {
      App.showPlannerView();
    }
  },

  toggleCompactHeader() {
    const wrapper = document.getElementById('notebook-sticky-header-wrapper');
    const icon = document.getElementById('compact-header-icon');
    const btn = document.getElementById('btn-toggle-compact-header');
    if (!wrapper) return;
    wrapper.classList.toggle('is-compact');
    const isCompact = wrapper.classList.contains('is-compact');
    if (icon) {
      icon.textContent = isCompact ? '🔽' : '🔼';
    }
    if (btn) {
      btn.title = isCompact ? 'Expandir encabezado completo' : 'Contraer encabezado para maximizar el área de escritura';
    }
  },

  openInPage(classIndex, isStandalone = false) {
    if (!window.Planner || !window.Planner.currentPlan || !window.Planner.currentPlan.classes[classIndex]) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('No se encontró la información de la clase seleccionada', 'warning');
      }
      return;
    }

    if (window.Planner.collectDataFromDOM) {
      window.Planner.collectDataFromDOM();
    }

    this.currentClassIndex = classIndex;
    this.currentDateStr = window.Planner.currentDateStr;
    this.currentClassData = window.Planner.currentPlan.classes[classIndex];
    this.isStandalone = isStandalone;

    const mount = document.getElementById('notebook-mount-point');
    if (!mount) return;

    const profile = StorageService.getProfile();
    const formattedDate = window.Planner.formatFullDate ? window.Planner.formatFullDate(this.currentDateStr) : this.currentDateStr;
    const cls = this.currentClassData;
    const classNum = cls.dayNumber || (classIndex + 1);

    // Si la clase pertenece a una sección espejo (ej. Sistemas 4°A / 4°B) y su cuaderno está vacío, auto-cargar contenido existente
    if (typeof StorageService !== 'undefined' && StorageService.getParallelGrade && StorageService.getParallelGrade(cls.subject, cls.grade)) {
      const isNotebookEmpty = (!cls.notebookContent || cls.notebookContent.trim() === '' || cls.notebookContent === '<p><br/></p>' || cls.notebookContent === '<p><br></p>');
      if (isNotebookEmpty) {
        const mirrorContent = StorageService.getParallelClassContent(cls.subject, cls.grade, classNum);
        if (mirrorContent && mirrorContent.notebookContent) {
          cls.notebookContent = mirrorContent.notebookContent;
          if (!cls.topic && mirrorContent.topic) cls.topic = mirrorContent.topic;
          if (!cls.dba && mirrorContent.dba) cls.dba = mirrorContent.dba;
          if (!cls.achievement && mirrorContent.achievement) cls.achievement = mirrorContent.achievement;
          if (!cls.observations && mirrorContent.observations) cls.observations = mirrorContent.observations;
        }
      }
    }

    const subjectDisplay = cls.subject || 'Clase';
    const gradeDisplay = cls.grade ? ` (Grado ${cls.grade})` : '';
    const period = window.Planner.currentPlan?.period || profile?.period || '1°';
    const mirrorGrade = typeof StorageService !== 'undefined' && StorageService.getParallelGrade
      ? StorageService.getParallelGrade(cls.subject, cls.grade)
      : null;

    const backBtnHtml = isStandalone
      ? `<button type="button" class="btn btn-secondary btn-sm" onclick="window.close()" title="Guardar y cerrar pestaña" style="font-weight:600; padding:0.45rem 0.9rem; display:inline-flex; align-items:center; gap:5px;">
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
           Cerrar Pestaña
         </button>`
      : `<button type="button" class="btn btn-secondary btn-sm" onclick="App.showPlannerView()" title="Volver al planeador de clases" style="font-weight:600; padding:0.45rem 0.9rem; display:inline-flex; align-items:center; gap:5px;">
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
           Volver al Planeador
         </button>`;

    mount.innerHTML = `
      <div class="notebook-fullpage-card">
        <!-- Barra Superior Sticky Unificada (Encabezado + Barra de Herramientas Estilo Word) -->
        <div class="notebook-sticky-header-wrapper" id="notebook-sticky-header-wrapper">
          <!-- Encabezado Superior de la Página -->
          <div class="notebook-fullpage-header">
            <div class="notebook-header-left">
              ${backBtnHtml}
              <div class="notebook-header-icon" style="width:38px; height:38px; border-radius:8px; background:var(--primary-100); color:var(--primary-700); display:flex; align-items:center; justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <div>
                <h2 id="notebook-page-title" style="margin:0; font-size:1.15rem; font-weight:700; color:var(--slate-900);">
                  Cuaderno / Guía Pedagógica: <span style="color:var(--primary-700);">${this.escapeHtml(subjectDisplay)}${this.escapeHtml(gradeDisplay)}</span> (Clase #${classNum})
                </h2>
                <div id="notebook-page-subtitle" style="font-size:0.8rem; color:var(--slate-500); margin-top:2px;">
                  ${this.escapeHtml(formattedDate)} • Periodo ${this.escapeHtml(period)} • ${cls.topic ? 'Tema: ' + this.escapeHtml(cls.topic) : 'Sin tema asignado'}
                </div>
              </div>
            </div>

            <div class="notebook-header-actions">
              ${mirrorGrade ? `
                <span class="badge-mirror" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;" title="Cualquier cambio en este cuaderno se sincroniza automáticamente con ${mirrorGrade}">
                  🔗 Espejo con ${mirrorGrade}
                </span>
              ` : ''}
              <!-- Autosave Badge tipo Docs -->
              <span id="notebook-autosave-badge" class="badge-autosave" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:0.8rem; font-weight:600; padding:4px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">✓ Guardado en el equipo</span>

              <!-- Plantillas Rápidas -->
              <div class="dropdown" style="position:relative; display:inline-block;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.toggleTemplatesMenu(event)" style="font-size:0.82rem; padding:0.45rem 0.85rem;">
                  ⚡ Plantillas Didácticas
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div class="dropdown-menu" id="notebook-templates-menu" style="min-width:260px; right:0; left:auto; z-index:200;">
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('standard')">
                    📝 Estructura Didáctica Estándar
                  </button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('math')">
                    📐 Taller / Problemas de Matemáticas
                  </button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('lab')">
                    🤖 Guía de Práctica / Robótica / Sistemas
                  </button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('sistemas7')">
                    💻 Sistemas 7° - Ofimática y Creación Digital
                  </button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('robotics10')">
                    🦾 Robótica 10° - Pinza Articulada con Joystick
                  </button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.applyTemplate('eval')">
                    📋 Ficha Evaluativa de Periodo
                  </button>
                </div>
              </div>

              <!-- Abrir en otra pestaña -->
              ${!isStandalone ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.openInNewTab()" style="font-size:0.82rem; padding:0.45rem 0.85rem;" title="Abrir este editor en una pestaña separada del navegador">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  Nueva Pestaña
                </button>
              ` : ''}

              <!-- Botón Imprimir Cuaderno -->
              <button type="button" class="btn btn-primary btn-sm" onclick="NotebookEditor.printNotebook()" style="font-size:0.82rem; padding:0.45rem 0.95rem;" title="Imprimir o exportar como PDF con formato de cuaderno de trabajo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Imprimir Cuaderno / PDF
              </button>

              <!-- Botón Guardar -->
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.saveCurrentNotebookContent(true)" style="font-size:0.82rem; padding:0.45rem 0.85rem;" title="Guardar cambios">
                💾 Guardar
              </button>

              <!-- Botón Contraer/Expandir Encabezado -->
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.toggleCompactHeader()" id="btn-toggle-compact-header" style="font-size:0.82rem; padding:0.45rem 0.65rem;" title="Contraer o expandir encabezado para maximizar el área de escritura">
                <span id="compact-header-icon">🔼</span>
              </button>
            </div>
          </div>

          <!-- Barra de Herramientas Estilo Word / Docs (Ribbon Toolbar Sticky) -->
          <div class="notebook-word-toolbar notebook-sticky-toolbar" id="notebook-word-toolbar">
            <!-- Deshacer / Rehacer -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('undo')" title="Deshacer (Ctrl+Z)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('redo')" title="Rehacer (Ctrl+Y)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path></svg>
              </button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Familia Tipográfica, Estilo de Párrafo y Tamaño -->
            <div class="toolbar-group">
              <select class="toolbar-select font-family-select" onchange="NotebookEditor.setFontFamily(this.value); this.value='';" title="Familia tipográfica (Fuente)">
                <option value="">Fuente...</option>
                <option value="Inter, sans-serif">Inter (Moderno)</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Calibri, sans-serif">Calibri</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Segoe UI', sans-serif">Segoe UI</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>

              <select class="toolbar-select" onchange="NotebookEditor.formatBlock(this.value); this.value='';" title="Estilo de párrafo o título">
                <option value="">Estilo de texto...</option>
                <option value="p">Párrafo Normal</option>
                <option value="h1">Título Principal (H1)</option>
                <option value="h2">Subtítulo de Sección (H2)</option>
                <option value="h3">Apartado / Ítem (H3)</option>
              </select>

              <select class="toolbar-select font-size-select" onchange="NotebookEditor.setFontSize(this.value); this.value='';" title="Tamaño de fuente">
                <option value="">Tamaño...</option>
                <option value="8pt">8 pt</option>
                <option value="9pt">9 pt</option>
                <option value="10pt">10 pt</option>
                <option value="11pt">11 pt</option>
                <option value="12pt">12 pt (Normal)</option>
                <option value="14pt">14 pt</option>
                <option value="16pt">16 pt</option>
                <option value="18pt">18 pt</option>
                <option value="20pt">20 pt</option>
                <option value="24pt">24 pt</option>
                <option value="28pt">28 pt</option>
                <option value="32pt">32 pt</option>
                <option value="36pt">36 pt</option>
              </select>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Formato Enriquecido: Negrita, Cursiva, Subrayado, Tachado, Subíndice, Superíndice -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('bold')" title="Negrita (Ctrl+B)"><strong>B</strong></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('italic')" title="Cursiva (Ctrl+I)"><em>I</em></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('underline')" title="Subrayado (Ctrl+U)"><u>U</u></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('strikeThrough')" title="Tachado"><s>S</s></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('subscript')" title="Subíndice (x₂)">x<sub>2</sub></button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('superscript')" title="Superíndice (x²)">x<sup>2</sup></button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Colores -->
            <div class="toolbar-group">
              <label class="toolbar-btn color-label" title="Color de Texto" style="cursor:pointer; margin:0;">
                <span style="font-weight:bold; color:#ef4444; border-bottom:2px solid #ef4444;">A</span>
                <input type="color" value="#1e293b" onchange="NotebookEditor.exec('foreColor', this.value)" style="display:none;" />
              </label>
              <label class="toolbar-btn color-label" title="Resaltador Fluorescente" style="cursor:pointer; margin:0;">
                <span style="background:#fef08a; padding:1px 4px; border-radius:2px; font-size:0.75rem; font-weight:bold;">🖍️</span>
                <input type="color" value="#fef08a" onchange="NotebookEditor.exec('hiliteColor', this.value)" style="display:none;" />
              </label>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Alineación e Interlineado -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyLeft')" title="Alinear a la izquierda">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyCenter')" title="Centrar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyRight')" title="Alinear a la derecha">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('justifyFull')" title="Justificar texto">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
              </button>

              <select class="toolbar-select line-spacing-select" onchange="NotebookEditor.setLineSpacing(this.value); this.value='';" title="Interlineado de párrafo">
                <option value="">Interlineado...</option>
                <option value="1.0">1.0 (Sencillo)</option>
                <option value="1.15">1.15 (Estándar Word)</option>
                <option value="1.5">1.5 (Líneas y media)</option>
                <option value="2.0">2.0 (Doble)</option>
              </select>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Listas y Sangrías -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('insertUnorderedList')" title="Lista con viñetas">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('insertOrderedList')" title="Lista numerada">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('outdent')" title="Disminuir sangría">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="11" y2="6"></line><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="18" x2="11" y2="18"></line><polyline points="7 8 3 12 7 16"></polyline></svg>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('indent')" title="Aumentar sangría">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="11" y2="6"></line><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="18" x2="11" y2="18"></line><polyline points="3 8 7 12 3 16"></polyline></svg>
              </button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Inserciones: Multimedia, Tablas, Enlaces, Símbolos y Didáctica -->
            <div class="toolbar-group">
              <!-- Insertar Imagen -->
              <label class="toolbar-btn" title="Insertar Imagen / Diagrama" style="cursor:pointer; margin:0; display:inline-flex; align-items:center; gap:3px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Imagen</span>
                <input type="file" accept="image/*" style="display:none;" onchange="NotebookEditor.handleImageUpload(event)" />
              </label>

              <!-- Menú Desplegable de Tablas (Word / Docs) -->
              <div class="dropdown" style="position:relative; display:inline-block;">
                <button type="button" class="toolbar-btn" onclick="NotebookEditor.toggleTableMenu(event)" title="Insertar o gestionar tablas">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                  <span>Tabla ▾</span>
                </button>
                <div class="dropdown-menu notebook-table-menu" id="notebook-table-menu">
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.insertTable()">➕ Insertar Tabla Estándar (3x3)</button>
                  <div class="dropdown-divider"></div>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.insertTableRow(false)">⬆️ Insertar Fila Arriba</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.insertTableRow(true)">⬇️ Insertar Fila Abajo</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.insertTableColumn(false)">⬅️ Insertar Columna a la Izquierda</button>
                  <button type="button" class="dropdown-item" onclick="NotebookEditor.insertTableColumn(true)">➡️ Insertar Columna a la Derecha</button>
                  <div class="dropdown-divider"></div>
                  <button type="button" class="dropdown-item text-danger" onclick="NotebookEditor.deleteTableRow()">🗑️ Eliminar Fila Seleccionada</button>
                  <button type="button" class="dropdown-item text-danger" onclick="NotebookEditor.deleteTableColumn()">🗑️ Eliminar Columna Seleccionada</button>
                  <button type="button" class="dropdown-item text-danger" onclick="NotebookEditor.deleteTable()">❌ Eliminar Tabla Completa</button>
                </div>
              </div>

              <!-- Enlace Web (Ctrl + K) -->
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertLink()" title="Insertar enlace web (Ctrl+K)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <span>Enlace</span>
              </button>

              <!-- Línea Divisoria -->
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertDivider()" title="Insertar línea divisoria horizontal">
                <span style="font-weight:bold; font-size:1.1rem; line-height:0.8;">—</span>
                <span>Línea</span>
              </button>

              <!-- Paleta de Símbolos Matemáticos y Científicos -->
              <div class="dropdown" style="position:relative; display:inline-block;">
                <button type="button" class="toolbar-btn" onclick="NotebookEditor.toggleSymbolsMenu(event)" title="Símbolos matemáticos y científicos">
                  <span style="font-weight:bold; font-size:0.95rem; color:var(--primary-700);">Ω</span>
                  <span>Símbolos ▾</span>
                </button>
                <div class="dropdown-menu notebook-symbols-menu" id="notebook-symbols-menu">
                  <div style="font-size:0.75rem; font-weight:700; color:var(--slate-600); margin-bottom:6px; padding:0 4px;">Símbolos Didácticos y Matemáticos:</div>
                  <div class="notebook-symbols-grid">
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('+')">+</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('−')">−</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('±')">±</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('×')">×</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('÷')">÷</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('=')">=</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('≠')">≠</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('≈')">≈</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('≤')">≤</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('≥')">≥</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('&lt;')">&lt;</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('&gt;')">&gt;</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('√')">√</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('∛')">∛</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('∞')">∞</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('π')">π</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('∑')">∑</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('∫')">∫</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('Δ')">Δ</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('α')">α</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('β')">β</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('θ')">θ</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('λ')">λ</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('μ')">μ</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('Ω')">Ω</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('°')">°</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('℃')">℃</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('²')">²</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('³')">³</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('½')">½</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('¼')">¼</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('¾')">¾</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('→')">→</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('←')">←</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('↔')">↔</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('⇒')">⇒</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('∈')">∈</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('∉')">∉</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('⊂')">⊂</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('∪')">∪</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('∩')">∩</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('✓')">✓</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('★')">★</button>
                    <button type="button" class="symbol-btn" onclick="NotebookEditor.insertSymbol('©')">©</button>
                  </div>
                </div>
              </div>

              <!-- Cuadros Didácticos -->
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('concept')" title="Insertar cuadro de Concepto Clave">
                📌 Concepto
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('activity')" title="Insertar cuadro de Actividad en Clase">
                ✍️ Actividad
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCallout('homework')" title="Insertar cuadro de Tarea">
                🏠 Tarea
              </button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Organización en Columnas y Salto de Página (Word / Docs) -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.setColumns(1)" title="1 Columna: Volver a texto continuo normal" style="display:inline-flex; align-items:center; gap:4px; font-weight:600; color:var(--slate-800);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="3" width="16" height="18" rx="1"></rect>
                  <line x1="8" y1="8" x2="16" y2="8"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                  <line x1="8" y1="16" x2="16" y2="16"></line>
                </svg>
                <span>1 Col</span>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.setColumns(2)" title="2 Columnas: Pasa el texto seleccionado a 2 columnas (Word / Docs)" style="display:inline-flex; align-items:center; gap:4px; font-weight:600; color:var(--slate-800);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="8" height="18" rx="1"></rect>
                  <rect x="13" y="3" width="8" height="18" rx="1"></rect>
                </svg>
                <span>2 Col</span>
              </button>

              <!-- Botón Salto de Página (Tipo Word) -->
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertPageBreakAtCursor()" title="Insertar Salto de Página tipo Word (Ctrl + Enter)" style="display:inline-flex; align-items:center; gap:5px; font-weight:600; color:var(--primary-700);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="2" y1="13" x2="22" y2="13" stroke-dasharray="3 3"></line>
                </svg>
                <span>Salto de Página</span>
              </button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Buscar & Reemplazar y Limpieza de Formato -->
            <div class="toolbar-group">
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.toggleFindReplace()" title="Buscar y Reemplazar texto (Ctrl+F)" style="display:inline-flex; align-items:center; gap:4px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Buscar</span>
              </button>
              <button type="button" class="toolbar-btn" onclick="NotebookEditor.exec('removeFormat')" title="Borrar formato del texto seleccionado">🧹</button>
            </div>

            <div class="toolbar-divider"></div>

            <!-- Acciones de Hoja -->
            <div class="toolbar-group">
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.openAttachments()" title="Ver y adjuntar guías PDF, talleres o imágenes vinculadas exclusivamente a esta clase" style="font-size:0.78rem; padding:3px 9px; color:#4338ca; border-color:#c7d2fe; background:#eef2ff; font-weight:700;">
                📎 Archivos / Guías
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.clearCanvas()" title="Borrar todo el contenido para escribir libremente desde cero" style="font-size:0.78rem; padding:3px 8px; color:#b91c1c; border-color:#fca5a5; background:#fef2f2;">
                🗑️ Hoja en Blanco
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.restoreDefaultContent()" title="Restaurar la secuencia didáctica oficial para esta clase" style="font-size:0.78rem; padding:3px 8px; color:#1d4ed8; border-color:#bfdbfe; background:#eff6ff;">
                🔄 Restaurar Oficial
              </button>
            </div>
          </div>
        </div>

        <!-- Área de Edición de Cuaderno Pedagógico en Hojas Separadas Tipo Word -->
        <div class="notebook-fullpage-container">
          <div class="notebook-pages-wrapper" id="notebook-pages-wrapper">
            <!-- Hojas renderizadas dinámicamente -->
          </div>
        </div>

        <!-- Panel Flotante de Buscar y Reemplazar (Estilo Word / Docs Ctrl+F) -->
        <div class="notebook-find-replace-panel" id="notebook-find-replace-panel" style="display:none;">
          <div class="find-replace-header">
            <strong>🔍 Buscar y Reemplazar</strong>
            <button type="button" class="btn-close-find" onclick="NotebookEditor.toggleFindReplace(false)" title="Cerrar panel">&times;</button>
          </div>
          <div class="find-replace-body">
            <div class="find-replace-row">
              <input type="text" id="notebook-find-input" placeholder="Buscar texto en el cuaderno..." onkeydown="if(event.key==='Enter') NotebookEditor.findNext()" />
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.findNext()" title="Buscar siguiente aparición">Siguiente</button>
            </div>
            <div class="find-replace-row">
              <input type="text" id="notebook-replace-input" placeholder="Reemplazar con..." />
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.replaceCurrent()" title="Reemplazar coincidencia actual">Reemplazar</button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.replaceAll()" title="Reemplazar todas las apariciones">Reemplazar Todo</button>
            </div>
            <div class="find-replace-status" id="notebook-find-status"></div>
          </div>
        </div>

        <!-- Barra de Estado Inferior Tipo Microsoft Word / Google Docs -->
        <div class="notebook-status-bar" id="notebook-status-bar">
          <div class="status-bar-left">
            <span id="sb-page-info">Página 1 de 1</span>
            <span class="status-divider">|</span>
            <span id="sb-word-count">0 palabras</span>
            <span class="status-divider">|</span>
            <span id="sb-char-count">0 caracteres</span>
            <span class="status-divider">|</span>
            <span id="sb-selection-info" style="display:none; color:var(--primary-600); font-weight:600;"></span>
          </div>
          <div class="status-bar-right">
            <span style="font-size:0.75rem; color:var(--slate-500); font-weight:600;">Zoom:</span>
            <select class="zoom-select" id="notebook-zoom-select" onchange="NotebookEditor.setZoom(this.value)" title="Escala visual de las hojas del cuaderno">
              <option value="0.75">75%</option>
              <option value="0.90">90%</option>
              <option value="1.0" selected>100% (Normal)</option>
              <option value="1.15">115%</option>
              <option value="1.25">125%</option>
            </select>
          </div>
        </div>
      </div>
    `;

    this.renderEditor();
    this.bindCanvasEvents();

    // Enfocar automáticamente el lienzo de edición
    setTimeout(() => {
      const canvas = document.getElementById('notebook-editable-canvas');
      if (canvas) {
        canvas.focus();
      }
    }, 150);
  },

  bindCanvasEvents() {
    const sheets = document.querySelectorAll('.notebook-editable-content');
    const hdrTopic = document.getElementById('hdr-edit-topic');
    const hdrDba = document.getElementById('hdr-edit-dba');
    const hdrAch = document.getElementById('hdr-edit-achievement');
    const hdrObs = document.getElementById('hdr-edit-observations');

    const triggerAutoSave = (immediate = false) => {
      this.triggerAutoSave(immediate);
    };

    sheets.forEach((sheet) => {
      // Garantizar que la hoja nunca desplace su contenido internamente
      sheet.onscroll = () => {
        sheet.scrollTop = 0;
        sheet.scrollLeft = 0;
      };

      sheet.onfocus = () => {
        if (!sheet.innerHTML.trim()) {
          sheet.innerHTML = '<p><br/></p>';
        }
      };

      sheet.onblur = () => {
        triggerAutoSave(true);
      };

      sheet.oninput = () => {
        sheet.scrollTop = 0;
        triggerAutoSave();
        this.schedulePagination(120);
        this.updateStatusBar();
        clearTimeout(this._historyDebounceTimer);
        this._historyDebounceTimer = setTimeout(() => {
          this.recordHistoryState();
        }, 600);
      };

      sheet.onkeyup = () => {
        this.updateStatusBar();
      };

      sheet.onmouseup = () => {
        this.updateStatusBar();
      };

      sheet.onkeydown = (e) => {
        // Atajo tipo Word / Docs: Ctrl + Z para Deshacer
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          this.undo();
          return;
        }

        // Atajo tipo Word / Docs: Ctrl + Y o Ctrl + Shift + Z para Rehacer
        if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
          e.preventDefault();
          this.redo();
          return;
        }

        // Atajo tipo Word: Ctrl + A para seleccionar todo a través de todas las hojas
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
          e.preventDefault();
          this.selectAllSheets();
          this.updateStatusBar();
          return;
        }

        // Atajo tipo Word / Docs: Ctrl + F para Buscar y Reemplazar
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
          e.preventDefault();
          this.toggleFindReplace();
          return;
        }

        // Atajo tipo Word / Docs: Ctrl + K para Insertar Enlace
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.insertLink();
          return;
        }

        // Atajo tipo Google Docs / Word: Ctrl + S para guardar inmediatamente sin diálogo del navegador
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          this.saveCurrentNotebookContent(false);
          this.updateAutoSaveStatus('saved');
          return;
        }

        // Atajo tipo Word: Ctrl + Enter para insertar salto de página
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.insertPageBreakAtCursor();
          return;
        }

        // Atajos tipo Word para formato con soporte multihioja (Ctrl + B, Ctrl + I, Ctrl + U)
        if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'u')) {
          const sel = window.getSelection();
          const curRange = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
          const crossInfo = this.getCrossSheetSelectionInfo(curRange);
          if (crossInfo && crossInfo.isCrossSheet) {
            e.preventDefault();
            const cmd = e.key.toLowerCase() === 'b' ? 'bold' : (e.key.toLowerCase() === 'i' ? 'italic' : 'underline');
            this.exec(cmd);
            return;
          }
        }


        // Manejo de eliminación o escritura cuando la selección abarca múltiples hojas
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const crossInfo = this.getCrossSheetSelectionInfo(range);
          if (crossInfo && crossInfo.isCrossSheet) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
              e.preventDefault();
              this.deleteCrossSheetRange(range);
              triggerAutoSave(true);
              return;
            } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
              e.preventDefault();
              this.deleteCrossSheetRange(range);
              document.execCommand('insertText', false, e.key);
              triggerAutoSave();
              this.schedulePagination(120);
              return;
            }
          }
        }

        if (e.key === 'Enter') {
          setTimeout(() => {
            sheet.scrollTop = 0;
            this.checkPagination();
          }, 10);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          setTimeout(() => this.schedulePagination(100), 10);
        }
      };
      sheet.onpaste = (e) => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const crossInfo = this.getCrossSheetSelectionInfo(range);
          if (crossInfo && crossInfo.isCrossSheet) {
            this.deleteCrossSheetRange(range);
          }
        }

        const clipboardData = e.clipboardData || window.clipboardData;
        if (clipboardData) {
          // Detectar si se está pegando una imagen directa desde el portapapeles
          const items = clipboardData.items;
          if (items && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
              if (items[i].type && items[i].type.startsWith('image/')) {
                const blob = items[i].getAsFile();
                if (blob) {
                  e.preventDefault();
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    this.compressAndInsertImage(evt.target.result, 'Imagen pegada');
                  };
                  reader.readAsDataURL(blob);
                  return;
                }
              }
            }
          }

          const html = clipboardData.getData('text/html');
          const text = clipboardData.getData('text/plain');
          // Si es texto plano con múltiples líneas/párrafos, estructurarlo en párrafos limpios
          if (!html && text && text.includes('\n')) {
            e.preventDefault();
            const paragraphs = text.split(/\r?\n\r?\n|\r?\n/);
            const formattedHtml = paragraphs
              .map(p => p.trim())
              .filter(p => p.length > 0)
              .map(p => `<p>${this.escapeHtml(p)}</p>`)
              .join('');
            document.execCommand('insertHTML', false, formattedHtml || '<p><br/></p>');
          }
        }
        sheet.scrollTop = 0;
        const pageSheet = sheet.closest('.notebook-page-sheet');
        if (pageSheet) pageSheet.scrollTop = 0;
        setTimeout(() => {
          sheet.scrollTop = 0;
          if (pageSheet) pageSheet.scrollTop = 0;
          this.checkPagination();
          triggerAutoSave();
        }, 20);
      };
    });

    // Vincular guardado en tiempo real e inmediato al desenfocar campos de cabecera
    [hdrTopic, hdrDba, hdrAch, hdrObs].forEach(el => {
      if (el) {
        el.oninput = () => triggerAutoSave();
        el.onblur = () => triggerAutoSave(true);
      }
    });

    // Inicializar soporte continuo de selección con mouse y portapapeles entre hojas
    this.setupCrossSheetSelection();

    // Evitar que hacer clic en los controles de la barra de herramientas robe el foco o destruya la selección
    const toolbar = document.getElementById('notebook-word-toolbar');
    if (toolbar && !toolbar._hasBoundToolbarEvents) {
      toolbar._hasBoundToolbarEvents = true;
      toolbar.addEventListener('mousedown', (e) => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          this._savedToolbarRange = sel.getRangeAt(0).cloneRange();
        }
        if (e.target.closest('button, .toolbar-btn, .color-label') && !e.target.closest('input[type="color"], select')) {
          e.preventDefault();
        }
      });
    }

    // Cerrar menús desplegables al hacer clic fuera
    if (!this._hasBoundGlobalClick) {
      this._hasBoundGlobalClick = true;
      document.addEventListener('click', (e) => {
        const colMenu = document.getElementById('notebook-columns-menu');
        if (colMenu && colMenu.classList.contains('show') && !e.target.closest('.dropdown')) {
          colMenu.classList.remove('show');
        }
        const tplMenu = document.getElementById('notebook-templates-menu');
        if (tplMenu && tplMenu.classList.contains('show') && !e.target.closest('.dropdown')) {
          tplMenu.classList.remove('show');
        }
        const tblMenu = document.getElementById('notebook-table-menu');
        if (tblMenu && tblMenu.classList.contains('show') && !e.target.closest('.dropdown')) {
          tblMenu.classList.remove('show');
        }
        const symMenu = document.getElementById('notebook-symbols-menu');
        if (symMenu && symMenu.classList.contains('show') && !e.target.closest('.dropdown')) {
          symMenu.classList.remove('show');
        }
      });
    }

    // Inicializar valores de la barra de estado
    this.updateStatusBar();
  },


  /**
   * Comprueba de forma robusta si un elemento editable o contenedor no contiene texto visual
   * ni elementos multimedia (imágenes, tablas, etc.), ignorando espacios de ancho cero y etiquetas vacías.
   */
  isContentEmpty(el) {
    if (!el) return true;
    if (el.querySelector('img, table, iframe, hr, svg, canvas, video, audio')) return false;
    const text = (el.textContent || '').replace(/[\s\u00a0\u200B]+/g, '');
    return text.length === 0;
  },

  /**
   * Comprueba si un string HTML de cuaderno contiene contenido real redactado
   */
  hasContent(content) {
    if (!content) return false;
    const c = String(content).trim();
    if (!c || c === '<p><br/></p>' || c === '<p><br></p>' || c === '<br>' || c === '<p></p>') return false;
    const text = c.replace(/<[^>]+>/g, '').replace(/[\s\u00a0\u200B]+/g, '');
    if (text.length > 0) return true;
    return /<(img|table|iframe|hr|svg|canvas|video|audio)[^>]*>/i.test(c);
  },

  /**
   * Determina si la clase tiene contenido real en su cuaderno (para mostrar badge y conservar)
   */
  hasNotebookContent(cls) {
    return this.hasContent(cls?.notebookContent);
  },

  /**
   * Crea de forma segura un Range del DOM entre dos nodos y offsets arbitrarios
   */
  createCrossRange(nodeA, offsetA, nodeB, offsetB) {
    if (!nodeA || !nodeB) return null;
    const clampOffset = (n, o) => {
      if (!n) return 0;
      const max = n.nodeType === Node.TEXT_NODE ? (n.length || 0) : (n.childNodes ? n.childNodes.length : 0);
      return Math.max(0, Math.min(max, typeof o === 'number' ? o : 0));
    };
    const sA = clampOffset(nodeA, offsetA);
    const sB = clampOffset(nodeB, offsetB);
    const range = document.createRange();
    try {
      if (nodeA === nodeB) {
        range.setStart(nodeA, Math.min(sA, sB));
        range.setEnd(nodeA, Math.max(sA, sB));
      } else {
        const pos = nodeA.compareDocumentPosition(nodeB);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
          range.setStart(nodeA, sA);
          range.setEnd(nodeB, sB);
        } else if (pos & Node.DOCUMENT_POSITION_PRECEDING) {
          range.setStart(nodeB, sB);
          range.setEnd(nodeA, sA);
        } else {
          range.setStart(nodeA, sA);
          range.setEnd(nodeB, sB);
        }
      }
      return range;
    } catch (e) {
      return null;
    }
  },

  /**
   * Aplica la selección visual activa entre dos puntos cualesquiera del cuaderno con dirección natural
   */
  applyCrossSheetSelection(startCaret, currentCaret) {
    if (!startCaret || !currentCaret || !startCaret.node || !currentCaret.node) return;
    const sel = window.getSelection();
    if (!sel) return;

    const clampOffset = (n, o) => {
      if (!n) return 0;
      const max = n.nodeType === Node.TEXT_NODE ? (n.length || 0) : (n.childNodes ? n.childNodes.length : 0);
      return Math.max(0, Math.min(max, typeof o === 'number' ? o : 0));
    };

    const sA = clampOffset(startCaret.node, startCaret.offset);
    const sB = clampOffset(currentCaret.node, currentCaret.offset);

    try {
      if (sel.setBaseAndExtent) {
        sel.setBaseAndExtent(startCaret.node, sA, currentCaret.node, sB);
      } else {
        const range = this.createCrossRange(startCaret.node, sA, currentCaret.node, sB);
        if (range) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } catch (e) {
      const range = this.createCrossRange(startCaret.node, sA, currentCaret.node, sB);
      if (range) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  },

  /**
   * Configura la selección continua con mouse y teclado a través de múltiples hojas
   * y auto-scroll vertical tipo Microsoft Word y Google Docs.
   */
  setupCrossSheetSelection() {
    if (this._hasBoundCrossSheetEvents) return;
    this._hasBoundCrossSheetEvents = true;

    let isMouseDown = false;
    let isDragging = false;
    let isCrossSheetMode = false;
    let originSheet = null;
    let startCaret = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let autoScrollRaf = null;

    const stopAutoScroll = () => {
      if (autoScrollRaf) {
        cancelAnimationFrame(autoScrollRaf);
        autoScrollRaf = null;
      }
    };

    const runAutoScroll = () => {
      if (!isMouseDown || !isDragging || !startCaret) {
        stopAutoScroll();
        return;
      }

      const stickyHeader = document.getElementById('notebook-sticky-header-wrapper');
      const headerBottom = stickyHeader ? stickyHeader.getBoundingClientRect().bottom : 80;
      const viewportHeight = window.innerHeight;

      const topThreshold = headerBottom + 50;
      const bottomThreshold = viewportHeight - 70;

      let speed = 0;
      if (lastClientY > bottomThreshold) {
        const dist = lastClientY - bottomThreshold;
        speed = Math.min(35, Math.max(6, dist * 0.45));
      } else if (lastClientY < topThreshold) {
        const dist = topThreshold - lastClientY;
        speed = -Math.min(35, Math.max(6, dist * 0.45));
      }

      if (speed !== 0) {
        window.scrollBy(0, speed);
        const isForward = lastClientY >= dragStartY;
        const currentCaret = this.getCaretInEditable(lastClientX, lastClientY, isForward);
        if (currentCaret && currentCaret.node) {
          this.applyCrossSheetSelection(startCaret, currentCaret);
        }
        autoScrollRaf = requestAnimationFrame(runAutoScroll);
      } else {
        stopAutoScroll();
      }
    };

    // Iniciar arrastre de selección continua
    document.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const wrapper = document.getElementById('notebook-pages-wrapper');
      if (!wrapper || !wrapper.contains(e.target)) return;
      if (e.target.closest('button, input, select, textarea, .dropdown, a, .notebook-find-replace-panel, .notebook-status-bar')) return;

      const clickedSheet = e.target.closest('.notebook-editable-content');
      const caret = this.getCaretInEditable(e.clientX, e.clientY, true);
      if (caret && caret.node) {
        isMouseDown = true;
        isDragging = false;
        isCrossSheetMode = false;
        originSheet = clickedSheet || (caret.editable || null);
        startCaret = caret;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        lastClientX = e.clientX;
        lastClientY = e.clientY;
      }
    });

    // Extender selección suavemente
    // REGLA FUNDAMENTAL TIPO WORD / DOCS:
    // Mientras el puntero permanezca dentro de la hoja de origen, NO intervenimos en la selección nativa.
    // El navegador ejecuta su motor tipográfico C++ nativo para arrastre con precisión de pixel, doble-clic y triple-clic.
    // Solo cuando el cursor cruza verticalmente hacia otra hoja activamos el puente multihioja continuo.
    document.addEventListener('mousemove', (e) => {
      if (!isMouseDown || !startCaret) return;
      lastClientX = e.clientX;
      lastClientY = e.clientY;

      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (!isDragging && Math.hypot(dx, dy) > 5) {
        isDragging = true;
      }

      if (isDragging) {
        const originRect = originSheet ? originSheet.getBoundingClientRect() : null;
        const isInsideOrigin = originRect && (
          e.clientY >= originRect.top - 8 &&
          e.clientY <= originRect.bottom + 8 &&
          e.clientX >= originRect.left - 20 &&
          e.clientX <= originRect.right + 20
        );

        if (!isCrossSheetMode && isInsideOrigin) {
          // Dentro de la misma hoja: dejar que el motor nativo del navegador gestione la selección perfecta
          return;
        }

        // El usuario ha cruzado el límite de página: activar puente entre hojas
        isCrossSheetMode = true;
        const isForward = e.clientY >= dragStartY;
        const currentCaret = this.getCaretInEditable(e.clientX, e.clientY, isForward);
        if (currentCaret && currentCaret.node) {
          this.applyCrossSheetSelection(startCaret, currentCaret);
        }

        const stickyHeader = document.getElementById('notebook-sticky-header-wrapper');
        const headerBottom = stickyHeader ? stickyHeader.getBoundingClientRect().bottom : 80;
        const viewportHeight = window.innerHeight;
        const topThreshold = headerBottom + 50;
        const bottomThreshold = viewportHeight - 70;

        if ((e.clientY > bottomThreshold || e.clientY < topThreshold) && !autoScrollRaf) {
          autoScrollRaf = requestAnimationFrame(runAutoScroll);
        } else if (e.clientY <= bottomThreshold && e.clientY >= topThreshold && autoScrollRaf) {
          stopAutoScroll();
        }
      }
    });

    // Finalizar arrastre y sincronizar barra de estado
    const handleMouseUp = () => {
      stopAutoScroll();
      isMouseDown = false;
      isDragging = false;
      isCrossSheetMode = false;
      startCaret = null;
      originSheet = null;
      setTimeout(() => this.updateStatusBar(), 10);
    };

    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
    document.addEventListener('selectionchange', () => {
      this.updateStatusBar();
    });

    // Copiar respetando únicamente el contenido pedagógico (omitiendo cabeceras y pies de página)
    document.addEventListener('copy', (e) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const clipData = this.getCrossSheetClipboardData(range);
      if (clipData && e.clipboardData) {
        e.preventDefault();
        e.clipboardData.setData('text/plain', clipData.text);
        e.clipboardData.setData('text/html', clipData.html);
      }
    });

    // Cortar respetando límites entre hojas
    document.addEventListener('cut', (e) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const clipData = this.getCrossSheetClipboardData(range);
      if (clipData && e.clipboardData) {
        e.preventDefault();
        e.clipboardData.setData('text/plain', clipData.text);
        e.clipboardData.setData('text/html', clipData.html);
        this.deleteCrossSheetRange(range);
        this.checkPagination();
      }
    });

    // Borrado o reemplazo fluido a nivel documento si la selección abarca múltiples hojas
    document.addEventListener('keydown', (e) => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const crossInfo = this.getCrossSheetSelectionInfo(range);
      if (!crossInfo || !crossInfo.isCrossSheet) return;

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        this.deleteCrossSheetRange(range);
        this.saveCurrentNotebookContent(false);
        this.updateAutoSaveStatus('saved');
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'u')) {
        e.preventDefault();
        const cmd = e.key.toLowerCase() === 'b' ? 'bold' : (e.key.toLowerCase() === 'i' ? 'italic' : 'underline');
        this.exec(cmd);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        e.preventDefault();
        this.deleteCrossSheetRange(range);
        document.execCommand('insertText', false, e.key);
        this.saveCurrentNotebookContent(false);
        this.schedulePagination(120);
      }
    });
  },


  getFirstTextPosition(el) {
    if (!el) return null;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue && node.nodeValue.replace(/[\r\n\t]/g, '').trim().length > 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    const firstText = walker.nextNode();
    if (firstText) {
      return { node: firstText, offset: 0 };
    }
    return { node: el.firstChild || el, offset: 0 };
  },

  getLastTextPosition(el) {
    if (!el) return null;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue && node.nodeValue.replace(/[\r\n\t]/g, '').trim().length > 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    let lastText = null;
    let curr = null;
    while ((curr = walker.nextNode())) {
      lastText = curr;
    }
    if (lastText) {
      return { node: lastText, offset: lastText.length };
    }
    const lastTarget = el.lastChild || el;
    const off = lastTarget.nodeType === Node.TEXT_NODE ? lastTarget.length : lastTarget.childNodes.length;
    return { node: lastTarget, offset: off };
  },

  getLeafBlockAtY(parent, y) {
    if (!parent || !parent.children || parent.children.length === 0) return parent;
    const innerBlocks = Array.from(parent.children).filter(el => {
      if (el.id === 'notebook-caret-marker') return false;
      const tag = el.tagName.toLowerCase();
      return tag === 'p' || tag === 'li' || tag === 'tr' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'div' || tag === 'blockquote';
    });
    if (innerBlocks.length === 0) return parent;
    for (let i = 0; i < innerBlocks.length; i++) {
      const b = innerBlocks[i];
      const bRect = b.getBoundingClientRect();
      const nextB = innerBlocks[i + 1];
      const nextTop = nextB ? nextB.getBoundingClientRect().top : bRect.bottom + 20;
      if (y >= bRect.top && y < nextTop) {
        return this.getLeafBlockAtY(b, y);
      }
    }
    if (y < innerBlocks[0].getBoundingClientRect().top) {
      return this.getLeafBlockAtY(innerBlocks[0], y);
    }
    return this.getLeafBlockAtY(innerBlocks[innerBlocks.length - 1], y);
  },

  /**
   * Obtiene la posición del cursor de texto dentro de cualquier hoja editable a partir de coordenadas X/Y
   * con soporte fluido para arrastre por márgenes laterales y bordes de página tipo Microsoft Word y Google Docs.
   */
  getCaretInEditable(x, y, isForward = true) {
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return null;
    const sheets = Array.from(wrapper.querySelectorAll('.notebook-page-sheet'));
    if (sheets.length === 0) return null;

    // 1. Detección directa si el cursor está sobre texto editable en el cuerpo del documento
    let range = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
    if (range && range.startContainer) {
      const editable = range.startContainer.nodeType === Node.ELEMENT_NODE 
        ? range.startContainer.closest('.notebook-editable-content')
        : range.startContainer.parentElement?.closest('.notebook-editable-content');
      if (editable) {
        return { node: range.startContainer, offset: range.startOffset, editable };
      }
    }

    // 2. Identificar la hoja objetivo de forma continua (sin zonas muertas entre páginas ni cabeceras)
    let targetSheetIdx = -1;
    for (let i = 0; i < sheets.length; i++) {
      const sRect = sheets[i].getBoundingClientRect();
      if (i === 0 && y < sRect.top) {
        targetSheetIdx = 0;
        break;
      }
      if (i === sheets.length - 1 && y > sRect.bottom) {
        targetSheetIdx = sheets.length - 1;
        break;
      }
      if (y >= sRect.top && y <= sRect.bottom) {
        targetSheetIdx = i;
        break;
      }
      // Espacio entre hojas (salto de página o gap)
      if (i < sheets.length - 1) {
        const nextRect = sheets[i + 1].getBoundingClientRect();
        if (y > sRect.bottom && y < nextRect.top) {
          const mid = (sRect.bottom + nextRect.top) / 2;
          targetSheetIdx = y <= mid ? i : (i + 1);
          break;
        }
      }
    }

    if (targetSheetIdx === -1) targetSheetIdx = 0;

    const targetSheet = sheets[targetSheetIdx];
    const editable = targetSheet.querySelector('.notebook-editable-content');
    if (!editable) return null;

    const editRect = editable.getBoundingClientRect();
    const children = Array.from(editable.children).filter(ch => ch.id !== 'notebook-caret-marker');

    if (children.length === 0) {
      const first = editable.firstChild || editable;
      return { node: first, offset: 0, editable };
    }

    // Si y está por encima de todo el contenido de la hoja objetivo
    const firstChild = children[0];
    const firstRect = firstChild.getBoundingClientRect();
    if (y < firstRect.top) {
      const leaf = this.getLeafBlockAtY(firstChild, y);
      const pos = this.getFirstTextPosition(leaf);
      return { node: pos.node, offset: pos.offset, editable };
    }

    // Si y está por debajo de todo el contenido de la hoja objetivo
    const lastChild = children[children.length - 1];
    const lastRect = lastChild.getBoundingClientRect();
    if (y > lastRect.bottom) {
      const leaf = this.getLeafBlockAtY(lastChild, y);
      const pos = this.getLastTextPosition(leaf);
      return { node: pos.node, offset: pos.offset, editable };
    }

    // y está dentro de la hoja: acotar x e y a los márgenes reales del editable para no salirse
    const clampedX = Math.max(editRect.left + 4, Math.min(editRect.right - 4, x));
    const clampedY = Math.max(editRect.top + 2, Math.min(editRect.bottom - 2, y));

    const subRange = document.caretRangeFromPoint ? document.caretRangeFromPoint(clampedX, clampedY) : null;
    if (subRange && subRange.startContainer && editable.contains(subRange.startContainer)) {
      return { node: subRange.startContainer, offset: subRange.startOffset, editable };
    }

    // Fallback recorriendo bloques de texto con resolución de sub-punto exacto
    for (let c = 0; c < children.length; c++) {
      const child = children[c];
      const cRect = child.getBoundingClientRect();
      const nextChild = children[c + 1];
      const nextTop = nextChild ? nextChild.getBoundingClientRect().top : cRect.bottom + 50;

      if (y >= cRect.top && y < nextTop) {
        const targetBlock = this.getLeafBlockAtY(child, y);
        const tbRect = targetBlock.getBoundingClientRect();
        const blockClampedX = Math.max(tbRect.left + 5, Math.min(tbRect.right - 5, x));
        const blockRange = document.caretRangeFromPoint ? document.caretRangeFromPoint(blockClampedX, y) : null;
        if (blockRange && targetBlock.contains(blockRange.startContainer)) {
          return { node: blockRange.startContainer, offset: blockRange.startOffset, editable };
        }
        const pos = isForward ? this.getLastTextPosition(targetBlock) : this.getFirstTextPosition(targetBlock);
        return { node: pos.node, offset: pos.offset, editable };
      }
    }

    const fallbackBlock = isForward ? this.getLeafBlockAtY(lastChild, y) : this.getLeafBlockAtY(firstChild, y);
    const fallbackPos = isForward ? this.getLastTextPosition(fallbackBlock) : this.getFirstTextPosition(fallbackBlock);
    return { node: fallbackPos.node, offset: fallbackPos.offset, editable };
  },

  /**
   * Comprueba si una selección Range actual abarca múltiples hojas de cuaderno
   */
  getCrossSheetSelectionInfo(range) {
    if (!range) return null;
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return null;
    const allSheets = Array.from(wrapper.querySelectorAll('.notebook-editable-content'));
    if (allSheets.length <= 1) return null;

    const startSheet = range.startContainer.nodeType === Node.ELEMENT_NODE 
      ? range.startContainer.closest('.notebook-editable-content')
      : range.startContainer.parentElement?.closest('.notebook-editable-content');
    const endSheet = range.endContainer.nodeType === Node.ELEMENT_NODE 
      ? range.endContainer.closest('.notebook-editable-content')
      : range.endContainer.parentElement?.closest('.notebook-editable-content');

    if (!startSheet || !endSheet) return null;
    const startIdx = allSheets.indexOf(startSheet);
    const endIdx = allSheets.indexOf(endSheet);
    if (startIdx === -1 || endIdx === -1) return null;

    return {
      isCrossSheet: startIdx !== endIdx,
      startSheet,
      endSheet,
      startIdx,
      endIdx,
      allSheets
    };
  },

  /**
   * Elimina de forma limpia y segura el contenido seleccionado entre hojas sin destruir encabezados ni pies de página
   */
  deleteCrossSheetRange(range) {
    const info = this.getCrossSheetSelectionInfo(range);
    if (!info) {
      range.deleteContents();
      return;
    }
    if (!info.isCrossSheet) {
      range.deleteContents();
      return;
    }

    const { startSheet, endSheet, startIdx, endIdx, allSheets } = info;

    // 1. Eliminar desde la posición inicial en la hoja de inicio hasta el final de esa hoja
    const rStart = document.createRange();
    rStart.setStart(range.startContainer, range.startOffset);
    rStart.setEnd(startSheet, startSheet.childNodes.length);
    rStart.deleteContents();

    // 2. Limpiar completamente el contenido editable de hojas intermedias
    for (let i = startIdx + 1; i < endIdx; i++) {
      allSheets[i].innerHTML = '';
    }

    // 3. Eliminar desde el inicio de la última hoja hasta la posición final de selección
    const rEnd = document.createRange();
    rEnd.setStart(endSheet, 0);
    rEnd.setEnd(range.endContainer, range.endOffset);
    rEnd.deleteContents();

    // 4. Asegurar que la hoja de inicio conserve al menos un contenedor editable si quedó vacía
    if (!startSheet.textContent.trim() && !startSheet.querySelector('p, div, table, ul, ol')) {
      startSheet.innerHTML = '<p><br/></p>';
    }

    // 5. Ubicar el cursor en la posición donde se borró
    try {
      const newRange = document.createRange();
      newRange.selectNodeContents(startSheet);
      newRange.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(newRange);
      startSheet.focus();
    } catch (e) {
      // Silencioso
    }

    // 6. Recalcular paginación (subir contenido y eliminar hojas vacías)
    this.checkPagination();
  },

  /**
   * Extrae el texto y HTML seleccionado entre hojas omitiendo encabezados y pies de página
   */
  getCrossSheetClipboardData(range) {
    const info = this.getCrossSheetSelectionInfo(range);
    if (!info || !info.isCrossSheet) return null;

    const { startSheet, endSheet, startIdx, endIdx, allSheets } = info;
    const plainTextPieces = [];
    const htmlPieces = [];

    for (let i = startIdx; i <= endIdx; i++) {
      const sheet = allSheets[i];
      const subRange = document.createRange();
      if (i === startIdx) {
        subRange.setStart(range.startContainer, range.startOffset);
        subRange.setEnd(sheet, sheet.childNodes.length);
      } else if (i === endIdx) {
        subRange.setStart(sheet, 0);
        subRange.setEnd(range.endContainer, range.endOffset);
      } else {
        subRange.selectNodeContents(sheet);
      }

      const fragment = subRange.cloneContents();
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(fragment);

      const textVal = (tempDiv.innerText || tempDiv.textContent || '').trim();
      if (textVal) plainTextPieces.push(textVal);
      if (tempDiv.innerHTML) htmlPieces.push(tempDiv.innerHTML);
    }

    return {
      text: plainTextPieces.join('\n\n'),
      html: htmlPieces.join('')
    };
  },

  /**
   * Selecciona todo el contenido editable de todas las hojas existentes (Ctrl + A estilo Word)
   */
  selectAllSheets() {
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;
    const allSheets = Array.from(wrapper.querySelectorAll('.notebook-editable-content'));
    if (allSheets.length === 0) return;

    const firstSheet = allSheets[0];
    const lastSheet = allSheets[allSheets.length - 1];

    const range = document.createRange();
    const firstTarget = firstSheet.firstChild || firstSheet;
    range.setStart(firstTarget, 0);

    const lastTarget = lastSheet.lastChild || lastSheet;
    const lastOffset = lastTarget.nodeType === Node.TEXT_NODE ? lastTarget.length : lastTarget.childNodes.length;
    range.setEnd(lastTarget, lastOffset);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  },

  updateAutoSaveStatus(status) {
    const badge = document.getElementById('notebook-autosave-badge');
    if (!badge) return;
    if (status === 'saving') {
      badge.innerHTML = '🟡 Guardando cambios...';
      badge.style.background = '#fef3c7';
      badge.style.color = '#92400e';
      badge.style.borderColor = '#fde68a';
    } else {
      badge.innerHTML = '✓ Guardado en el equipo';
      badge.style.background = '#ecfdf5';
      badge.style.color = '#065f46';
      badge.style.borderColor = '#a7f3d0';
    }
  },

  clearCanvas() {
    if (confirm('¿Deseas vaciar el cuaderno para escribir libremente desde cero?')) {
      if (this.currentClassData) {
        this.currentClassData.notebookContent = '<p><br/></p>';
      }
      this.renderEditor();
      this.bindCanvasEvents();
      this.saveCurrentNotebookContent(false);
      const first = document.querySelector('.notebook-editable-content');
      if (first) first.focus();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Hoja limpiada. Puedes escribir lo que necesites.', 'info');
      }
    }
  },

  restoreDefaultContent() {
    if (confirm('¿Deseas restaurar la plantilla pedagógica predeterminada para este cuaderno?')) {
      if (this.currentClassData) {
        this.currentClassData.notebookContent = this.generateDefaultContentFromClass(this.currentClassData);
        this.renderEditor();
        this.bindCanvasEvents();
        this.saveCurrentNotebookContent(false);
        const first = document.querySelector('.notebook-editable-content');
        if (first) first.focus();
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Plantilla pedagógica del cuaderno restaurada.', 'success');
        }
      }
    }
  },

  renderEditor() {
    if (!this.currentClassData) return;

    const profile = StorageService.getProfile();
    const formattedDate = window.Planner?.formatFullDate ? window.Planner.formatFullDate(this.currentDateStr) : (typeof ExportService !== 'undefined' && ExportService.formatDate ? ExportService.formatDate(this.currentDateStr) : this.currentDateStr);
    const cls = this.currentClassData;
    const logoUrl = ExportService.LOGO_BASE64 || 'img/logo_colegio.png';

    // Determinar si es la Clase 1 del periodo (solo en Clase 1 aparecen Eje Temático, Estándar/DBA e Indicadores)
    const classNum = parseInt(String(cls.dayNumber || (this.currentClassIndex + 1)).replace(/[^0-9]/g, ''), 10) || 1;
    const isDirGroup = cls.subject && String(cls.subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
    const isFirstClassOfPeriod = classNum === 1 && !isDirGroup;

    // Encabezado institucional de la Página 1
    const pageHeaderBoxHtml = `
      <div class="notebook-header-box">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid var(--primary-600); padding-bottom: 0.75rem; margin-bottom: 1rem; gap:1rem;">
          <img src="${logoUrl}" alt="Logo Colegio" style="height:55px; width:auto; object-fit:contain;" />
          <div style="flex:1;">
            <div style="font-size: 0.85rem; font-weight: 800; color: var(--primary-800); text-transform: uppercase; letter-spacing: 0.5px;">
              ${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}
            </div>
            <h3 style="margin: 2px 0 0; font-size: 1.15rem; color: var(--slate-900);">
              GUÍA PEDAGÓGICA Y CUADERNO DE TRABAJO
            </h3>
          </div>
          <div style="text-align: right;">
            <span class="role-badge" style="font-size: 0.8rem; background: var(--primary-100); color: var(--primary-800); font-weight: 700; padding:0.3rem 0.7rem;">
              Clase #${cls.dayNumber || (this.currentClassIndex + 1)}
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; background: var(--slate-50); padding: 0.75rem 1rem; border-radius: 6px; border:1px solid var(--slate-200); margin-bottom: 0.75rem;">
          <div><strong>Docente:</strong> ${this.escapeHtml(profile.name || 'Manuel Muñoz')}</div>
          <div><strong>Asignatura:</strong> ${this.escapeHtml(cls.subject || 'General')}</div>
          <div><strong>Grado:</strong> ${this.escapeHtml(cls.grade || '')}</div>
          <div><strong>Fecha:</strong> ${this.escapeHtml(formattedDate)}</div>
          <div><strong>Periodo:</strong> ${this.escapeHtml(window.Planner?.currentPlan?.period || profile?.period || '1°')}</div>
          <div><strong>Día:</strong> ${this.escapeHtml(cls.dayOfWeek || '')}</div>
        </div>

        <!-- Campos Curriculares: SOLO se muestran en la Clase 1 de cada periodo (a partir de la clase 2 no aparecen) -->
        ${isFirstClassOfPeriod ? `
        <div style="margin-top:0.75rem; border-top: 1px solid var(--slate-200); padding-top: 0.6rem;">
          <div style="font-size:0.85rem; font-weight:700; color:var(--primary-900); margin-bottom:2px; display:flex; justify-content:space-between; align-items:center;">
            <span>📌 Eje Temático / Tema:</span>
            <span style="font-size:0.72rem; color:var(--slate-400); font-weight:normal;">✏️ Clic para editar o borrar</span>
          </div>
          <div class="notebook-editable-header-field" id="hdr-edit-topic" contenteditable="true" spellcheck="true" data-field="topic" placeholder="Escribe o edita el tema aquí...">${this.escapeHtml(cls.topic || '')}</div>

          <div style="font-size:0.85rem; font-weight:700; color:var(--slate-700); margin-top:0.6rem; margin-bottom:2px; display:flex; justify-content:space-between; align-items:center;">
            <span>🎯 Estándar / DBA:</span>
            <span style="font-size:0.72rem; color:var(--slate-400); font-weight:normal;">✏️ Clic para editar o borrar</span>
          </div>
          <div class="notebook-editable-header-field" id="hdr-edit-dba" contenteditable="true" spellcheck="true" data-field="dba" placeholder="Escribe o edita el estándar o situación problémica...">${this.escapeHtml(cls.dba || '').replace(/\n/g, '<br/>')}</div>

          <div style="font-size:0.85rem; font-weight:700; color:var(--slate-700); margin-top:0.6rem; margin-bottom:2px; display:flex; justify-content:space-between; align-items:center;">
            <span>🏆 Indicadores de Desempeño:</span>
            <span style="font-size:0.72rem; color:var(--slate-400); font-weight:normal;">✏️ Clic para editar o borrar</span>
          </div>
          <div class="notebook-editable-header-field" id="hdr-edit-achievement" contenteditable="true" spellcheck="true" data-field="achievement" placeholder="Escribe o edita los logros o indicadores de desempeño...">${this.escapeHtml(cls.achievement || '').replace(/\n/g, '<br/>')}</div>
        </div>
        ` : ''}

        <!-- Observaciones Pedagógicas Específicas de esta Clase -->
        <div style="margin-top:0.75rem; border-top: 1px solid var(--slate-200); padding-top: 0.6rem;">
          <div style="font-size:0.85rem; font-weight:700; color:#92400e; margin-bottom:2px; display:flex; justify-content:space-between; align-items:center;">
            <span>📝 Observaciones Pedagógicas de la Clase:</span>
            <span style="font-size:0.72rem; color:var(--slate-400); font-weight:normal;">✏️ Clic para redactar observaciones de esta clase</span>
          </div>
          <div class="notebook-editable-header-field" id="hdr-edit-observations" contenteditable="true" spellcheck="true" data-field="observations" placeholder="Escribe las observaciones pedagógicas específicas para esta sesión..." style="background: #fffbeb; border-color: #fde68a;">${this.escapeHtml(cls.observations || '').replace(/\n/g, '<br/>')}</div>
        </div>
      </div>
    `;

    // Segmentar el contenido en hojas tipo Word
    let rawPages = [];
    if (cls.notebookContent && cls.notebookContent.trim()) {
      if (cls.notebookContent.includes('notebook-page-break')) {
        rawPages = cls.notebookContent.split(/<div class="notebook-page-break"[^>]*><\/div>/gi);
      } else {
        rawPages = [cls.notebookContent];
      }
    } else {
      rawPages = [this.generateDefaultContentFromClass(cls)];
    }

    // Filtrar hojas fantasma vacías (conservando siempre la hoja inicial)
    rawPages = rawPages.filter((p, pIdx) => {
      if (pIdx === 0) return true;
      const clean = (p || '').replace(/<[^>]+>/g, '').replace(/[\s\u00a0\u200B]+/g, '');
      return clean.length > 0 || /<(img|table|iframe|hr|svg|canvas)[^>]*>/i.test(p);
    });
    if (!rawPages || rawPages.length === 0) rawPages = ['<p><br/></p>'];

    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;

    const totalPages = rawPages.length;
    let sheetsHtml = '';

    rawPages.forEach((content, pIdx) => {
      if (pIdx > 0) {
        sheetsHtml += `
          <div class="notebook-page-break-indicator" data-break-after="${pIdx - 1}">
            <span class="page-break-tag">📄 Salto de Página (Hoja ${pIdx + 1})</span>
          </div>
        `;
      }

      sheetsHtml += `
        <div class="notebook-page-sheet" data-page-index="${pIdx}">
          ${pIdx === 0 ? `
            <div class="notebook-institutional-header" id="notebook-page-header">
              ${pageHeaderBoxHtml}
            </div>
          ` : `
            <div class="notebook-sheet-cont-header">
              <div class="cont-left">
                <span class="cont-title">${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}</span> • GUÍA PEDAGÓGICA
              </div>
              <div class="cont-right">
                <span>${this.escapeHtml(cls.subject || 'Clase')} ${this.escapeHtml(cls.grade ? '(' + cls.grade + ')' : '')} • Clase #${classNum} (Continuación)</span>
                <button type="button" class="btn-remove-sheet" onclick="NotebookEditor.removePage(${pIdx})" title="Eliminar esta hoja y unir su contenido con la anterior">&times; Eliminar hoja</button>
              </div>
            </div>
          `}

          <div id="${pIdx === 0 ? 'notebook-editable-canvas' : ''}" class="notebook-editable-content" contenteditable="true" spellcheck="true" data-page-content="${pIdx}" placeholder="Haz clic aquí para escribir el contenido de la clase, preguntas dinamizadoras, actividades, talleres o tareas...">
            ${content}
          </div>

          <div class="notebook-sheet-footer">
            <span class="sheet-institution-tag">${this.escapeHtml(profile.institution || 'Colegio Hogar Madre de Dios')}</span>
            <span class="sheet-page-number" data-sheet-num="${pIdx}">Página ${pIdx + 1} de <span class="total-pages-count">${totalPages}</span></span>
          </div>
        </div>
      `;
    });

    // Barra inferior para agregar nueva hoja tipo Word
    sheetsHtml += `
      <div class="notebook-add-sheet-bar">
        <button type="button" class="btn btn-secondary" onclick="NotebookEditor.addNewPage()" style="display:inline-flex; align-items:center; gap:8px; font-weight:700; padding:0.65rem 1.5rem; background:#ffffff; border:1.5px dashed var(--primary-300); color:var(--primary-700); box-shadow:0 2px 8px rgba(0,0,0,0.06); border-radius:8px; cursor:pointer;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          ➕ Agregar Nueva Hoja (Página Siguiente)
        </button>
      </div>
    `;

    wrapper.innerHTML = sheetsHtml;
    setTimeout(() => {
      this.checkPagination();
    }, 60);
  },

  generateDefaultContentFromClass(cls) {
    const isDirGroup = cls?.subject && String(cls.subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
    if (isDirGroup) {
      return `
        <h2>🤝 1. Saludo, Reflexión y Asuntos Generales del Grupo</h2>
        <p>Espacio de bienvenida, diálogo formativo y revisión de novedades del aula con los estudiantes.</p>
        <div class="notebook-callout concept">
          <strong>📋 Puntos Clave de la Sesión:</strong>
          <p>Orientaciones generales, acuerdos de convivencia escolar y seguimiento al grupo.</p>
        </div>

        <h2>📝 2. Acuerdos y Seguimiento</h2>
        <p>Acompañamiento a los estudiantes y registro de compromisos escolares y formativos.</p>
        <div class="notebook-callout activity">
          <strong>👥 Compromisos del Aula:</strong>
          <ul>
            <li>Pautas de convivencia, respeto mutuo y cuidado del entorno escolar.</li>
            <li>Seguimiento al rendimiento académico y deberes escolares.</li>
          </ul>
        </div>

        <h2>📌 3. Conclusiones y Recordatorios</h2>
        <p>Cierre de la asesoría grupal y compromisos para la semana.</p>
      `;
    }

    return `
      <h2>1. Saberes Previos y Exploración</h2>
      <p>Escribe aquí las preguntas dinamizadoras, actividades de calentamiento o diálogo inicial con los estudiantes...</p>
      
      <h2>2. Conceptualización y Desarrollo del Tema</h2>
      <p>Escribe aquí los conceptos clave, definiciones, explicaciones y fórmulas que los estudiantes registrarán en su cuaderno...</p>
      
      <div class="notebook-callout concept">
        <strong>📌 Concepto Clave:</strong>
        <p>Idea principal o regla fundamental de la sesión.</p>
      </div>

      <h2>3. Taller Práctico / Actividad en Clase</h2>
      <p>Escribe aquí los ejercicios, problemas o guía de trabajo práctico paso a paso...</p>

      <div class="notebook-callout activity">
        <strong>✍️ Actividad en Clase:</strong>
        <ol>
          <li>Primer ejercicio o paso de la práctica.</li>
          <li>Segundo ejercicio o actividad en parejas.</li>
        </ol>
      </div>

      <h2>4. Evaluación y Cierre de la Sesión</h2>
      <p>Preguntas de consolidación, socialización y verificación de aprendizajes.</p>

      <div class="notebook-callout homework">
        <strong>🏠 Compromiso / Tarea para la casa:</strong>
        <p>Actividad de refuerzo o consulta para la próxima clase.</p>
      </div>
    `;
  },

  getActiveCanvas() {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.classList && activeEl.classList.contains('notebook-editable-content')) {
      return activeEl;
    }
    const closest = activeEl ? activeEl.closest('.notebook-editable-content') : null;
    if (closest) return closest;
    return document.querySelector('.notebook-editable-content') || document.getElementById('notebook-editable-canvas');
  },

  /**
   * Organiza ÚNICAMENTE el texto seleccionado en 1 o 2 columnas continuas (Estilo Word / Google Docs)
   */
  setColumns(colCount = 2) {
    this.recordHistoryState();

    let sel = window.getSelection();
    let currentRange = (sel && sel.rangeCount > 0 && !sel.isCollapsed) 
      ? sel.getRangeAt(0) 
      : (this._savedToolbarRange || null);

    const activeCanvas = this.getActiveCanvas();
    if (!currentRange && activeCanvas && sel && sel.rangeCount > 0) {
      currentRange = sel.getRangeAt(0);
    }

    if (!currentRange) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Selecciona el texto que deseas organizar en columnas', 'info');
      }
      return;
    }

    // 1 COLUMNA: Desempaquetar / revertir cualquier contenedor de 2 columnas al flujo normal
    if (colCount === 1) {
      let target = currentRange.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
        ? currentRange.commonAncestorContainer 
        : currentRange.commonAncestorContainer.parentElement;

      let flowContainers = [];
      if (target.classList && (target.classList.contains('notebook-columns-flow') || target.classList.contains('notebook-two-columns'))) {
        flowContainers.push(target);
      } else {
        const parentFlow = target.closest('.notebook-columns-flow, .notebook-two-columns');
        if (parentFlow) flowContainers.push(parentFlow);
        if (target.querySelectorAll) {
          flowContainers.push(...Array.from(target.querySelectorAll('.notebook-columns-flow, .notebook-two-columns')));
        }
      }

      if (flowContainers.length === 0 && activeCanvas) {
        const parentFlow = activeCanvas.querySelector('.notebook-columns-flow, .notebook-two-columns');
        if (parentFlow) flowContainers.push(parentFlow);
      }

      if (flowContainers.length > 0) {
        flowContainers.forEach(container => {
          const parent = container.parentNode;
          while (container.firstChild) {
            parent.insertBefore(container.firstChild, container);
          }
          container.remove();
        });
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Texto organizado en 1 columna normal', 'success');
        }
        this.schedulePagination(150);
        this.saveCurrentNotebookContent(false);
      } else {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('El texto ya está en 1 columna normal', 'info');
        }
      }
      return;
    }

    // 2 COLUMNAS: Convertir ÚNICAMENTE lo seleccionado por el usuario en 2 columnas
    if (colCount === 2) {
      if (currentRange.collapsed) {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Selecciona el texto que deseas pasar a 2 columnas', 'info');
        }
        return;
      }

      // Extraer con absoluta precisión únicamente lo seleccionado
      const frag = currentRange.extractContents();
      const container = document.createElement('div');
      container.className = 'notebook-columns-flow';

      const temp = document.createElement('div');
      temp.appendChild(frag);

      // Si el texto extraído contiene saltos de línea <br>, estructurarlos en párrafos <p>
      if (temp.querySelector('br') && temp.querySelectorAll('p, div, h1, h2, h3, li').length === 0) {
        const lines = temp.innerHTML.split(/<br\s*\/?>/i);
        const filtered = lines.filter(l => l.trim().length > 0);
        temp.innerHTML = filtered.map(l => '<p>' + l.trim() + '</p>').join('');
      }

      while (temp.firstChild) {
        container.appendChild(temp.firstChild);
      }

      let block = currentRange.startContainer.nodeType === Node.ELEMENT_NODE 
        ? currentRange.startContainer 
        : currentRange.startContainer.parentElement;
      while (block && block.parentElement && !block.parentElement.classList.contains('notebook-editable-content')) {
        block = block.parentElement;
      }

      if (block && block.parentElement && block.parentElement.classList.contains('notebook-editable-content')) {
        const parentCanvas = block.parentElement;
        const afterRange = document.createRange();
        afterRange.setStart(currentRange.startContainer, currentRange.startOffset);
        afterRange.setEndAfter(block.lastChild || block);
        const afterFrag = afterRange.extractContents();

        parentCanvas.insertBefore(container, block.nextSibling);

        const tempAfter = document.createElement('div');
        tempAfter.appendChild(afterFrag);
        if (tempAfter.innerHTML.trim().length > 0 && tempAfter.innerHTML !== '<br>') {
          const afterBlock = document.createElement(block.tagName.toLowerCase() || 'p');
          while (tempAfter.firstChild) {
            afterBlock.appendChild(tempAfter.firstChild);
          }
          parentCanvas.insertBefore(afterBlock, container.nextSibling);
        }

        if (block.innerHTML.trim().length === 0 || block.innerHTML === '<br>') {
          block.remove();
        }
      } else {
        currentRange.insertNode(container);
      }

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Texto seleccionado organizado en 2 columnas', 'success');
      }
      this.schedulePagination(150);
      this.saveCurrentNotebookContent(false);
    }
  },

  updatePageNumbers() {
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;

    // 1. Obtener todas las hojas en orden real del DOM
    const sheets = Array.from(wrapper.querySelectorAll('.notebook-page-sheet'));
    const total = sheets.length;

    // 2. Limpiar cualquier indicador huérfano antes de la primera hoja
    if (sheets.length > 0) {
      let prev = sheets[0].previousElementSibling;
      while (prev && prev.classList.contains('notebook-page-break-indicator')) {
        const toRemove = prev;
        prev = prev.previousElementSibling;
        toRemove.remove();
      }
    }

    // 3. Sincronizar numeración de cada hoja y garantizar EXACTAMENTE UN indicador previo
    sheets.forEach((sheet, idx) => {
      sheet.setAttribute('data-page-index', idx);
      const numEl = sheet.querySelector('.sheet-page-number');
      if (numEl) {
        numEl.innerHTML = `Página ${idx + 1} de <span class="total-pages-count">${total}</span>`;
      }
      const contentEl = sheet.querySelector('.notebook-editable-content');
      if (contentEl) {
        contentEl.setAttribute('data-page-content', idx);
        if (idx === 0) {
          contentEl.id = 'notebook-editable-canvas';
        } else if (contentEl.id === 'notebook-editable-canvas') {
          contentEl.removeAttribute('id');
        }
      }

      const removeBtn = sheet.querySelector('.btn-remove-sheet');
      if (removeBtn) {
        removeBtn.setAttribute('onclick', `NotebookEditor.removePage(${idx})`);
      }

      if (idx > 0) {
        // Encontrar todos los indicadores inmediatamente anteriores a esta hoja
        let indicators = [];
        let prev = sheet.previousElementSibling;
        while (prev && prev.classList.contains('notebook-page-break-indicator')) {
          indicators.push(prev);
          prev = prev.previousElementSibling;
        }

        if (indicators.length === 0) {
          // Si no hay ninguno, insertar uno
          const indicatorHtml = `
            <div class="notebook-page-break-indicator" data-break-after="${idx - 1}">
              <span class="page-break-tag">📄 Salto de Página (Hoja ${idx + 1})</span>
            </div>
          `;
          sheet.insertAdjacentHTML('beforebegin', indicatorHtml);
        } else {
          // Conservar solo el primero (el más cercano a la hoja) y sincronizar su texto
          const mainIndicator = indicators[0];
          mainIndicator.setAttribute('data-break-after', idx - 1);
          const isManual = mainIndicator.getAttribute('data-manual-break') === 'true';
          const tagSpan = mainIndicator.querySelector('.page-break-tag');
          if (tagSpan) {
            tagSpan.textContent = isManual 
              ? `📄 Salto de Página (Hoja ${idx + 1})` 
              : `📄 Salto de Página Automático (Hoja ${idx + 1})`;
          }
          // Eliminar CUALQUIER otro indicador duplicado o apilado
          for (let k = 1; k < indicators.length; k++) {
            indicators[k].remove();
          }
        }
      }
    });

    // 4. Limpiar cualquier indicador huérfano después de la última hoja
    if (sheets.length > 0) {
      const lastSheet = sheets[sheets.length - 1];
      let next = lastSheet.nextElementSibling;
      while (next && next.classList.contains('notebook-page-break-indicator')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
    }
  },

  addNewPage() {
    this.saveCurrentNotebookContent(false);
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;

    const profile = StorageService.getProfile();
    const cls = this.currentClassData || {};
    const classNum = parseInt(String(cls.dayNumber || (this.currentClassIndex + 1)).replace(/[^0-9]/g, ''), 10) || 1;
    const currentSheets = wrapper.querySelectorAll('.notebook-page-sheet');
    const newIdx = currentSheets.length;

    const indicatorHtml = `
      <div class="notebook-page-break-indicator" data-break-after="${newIdx - 1}">
        <span class="page-break-tag">📄 Salto de Página (Hoja ${newIdx + 1})</span>
      </div>
    `;

    const newSheetHtml = `
      <div class="notebook-page-sheet" data-page-index="${newIdx}">
        <div class="notebook-sheet-cont-header">
          <div class="cont-left">
            <span class="cont-title">${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}</span> • GUÍA PEDAGÓGICA
          </div>
          <div class="cont-right">
            <span>${this.escapeHtml(cls.subject || 'Clase')} ${this.escapeHtml(cls.grade ? '(' + cls.grade + ')' : '')} • Clase #${classNum} (Continuación)</span>
            <button type="button" class="btn-remove-sheet" onclick="NotebookEditor.removePage(${newIdx})" title="Eliminar esta hoja y unir su contenido con la anterior">&times; Eliminar hoja</button>
          </div>
        </div>
        <div class="notebook-editable-content" contenteditable="true" spellcheck="true" data-page-content="${newIdx}" placeholder="Continúa escribiendo el contenido de la clase en esta hoja...">
          <p><br/></p>
        </div>
        <div class="notebook-sheet-footer">
          <span class="sheet-institution-tag">${this.escapeHtml(profile.institution || 'Colegio Hogar Madre de Dios')}</span>
          <span class="sheet-page-number" data-sheet-num="${newIdx}">Página ${newIdx + 1}</span>
        </div>
      </div>
    `;

    const addBar = wrapper.querySelector('.notebook-add-sheet-bar');
    if (addBar) {
      addBar.insertAdjacentHTML('beforebegin', indicatorHtml + newSheetHtml);
    } else {
      wrapper.insertAdjacentHTML('beforeend', indicatorHtml + newSheetHtml);
    }

    this.bindCanvasEvents();
    this.updatePageNumbers();
    this.saveCurrentNotebookContent(false);

    const newContent = wrapper.querySelector(`.notebook-editable-content[data-page-content="${newIdx}"]`);
    if (newContent) {
      newContent.focus();
      newContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Hoja ${newIdx + 1} creada con éxito`, 'info');
    }
  },

  removePage(pageIdx) {
    if (pageIdx <= 0) return;
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;

    const sheetToRemove = wrapper.querySelector(`.notebook-page-sheet[data-page-index="${pageIdx}"]`);
    const prevSheet = wrapper.querySelector(`.notebook-page-sheet[data-page-index="${pageIdx - 1}"]`);
    if (!sheetToRemove || !prevSheet) return;

    if (!confirm(`¿Deseas eliminar la Hoja ${pageIdx + 1}? Si contiene texto, se moverá al final de la Hoja ${pageIdx}.`)) return;

    const contentToRemove = sheetToRemove.querySelector('.notebook-editable-content')?.innerHTML || '';
    const prevContentEl = prevSheet.querySelector('.notebook-editable-content');

    if (contentToRemove.trim() && contentToRemove.trim() !== '<p><br></p>' && contentToRemove.trim() !== '<p><br/></p>') {
      if (prevContentEl) {
        prevContentEl.innerHTML += contentToRemove;
      }
    }

    // Eliminar todos los indicadores inmediatamente anteriores a la hoja a remover
    let prev = sheetToRemove.previousElementSibling;
    while (prev && prev.classList.contains('notebook-page-break-indicator')) {
      const toRemove = prev;
      prev = prev.previousElementSibling;
      toRemove.remove();
    }
    sheetToRemove.remove();

    this.bindCanvasEvents();
    this.updatePageNumbers();
    this.saveCurrentNotebookContent(false);

    if (prevContentEl) prevContentEl.focus();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Hoja ${pageIdx + 1} eliminada`, 'info');
    }
  },

  insertPageBreakAtCursor() {
    const activeCanvas = this.getActiveCanvas();
    if (!activeCanvas) {
      this.addNewPage();
      return;
    }

    const currentSheet = activeCanvas.closest('.notebook-page-sheet');
    const currentIdx = currentSheet ? parseInt(currentSheet.getAttribute('data-page-index') || '0', 10) : 0;

    let extractedHtml = '<p><br/></p>';
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (activeCanvas.contains(range.commonAncestorContainer)) {
        const fullRange = range.cloneRange();
        fullRange.selectNodeContents(activeCanvas);
        fullRange.setStart(range.endContainer, range.endOffset);
        const fragment = fullRange.extractContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);
        if (tempDiv.innerHTML.trim()) {
          extractedHtml = tempDiv.innerHTML;
        }
      }
    }

    const wrapper = document.getElementById('notebook-pages-wrapper');
    const profile = StorageService.getProfile();
    const cls = this.currentClassData || {};
    const classNum = parseInt(String(cls.dayNumber || (this.currentClassIndex + 1)).replace(/[^0-9]/g, ''), 10) || 1;
    const nextIdx = currentIdx + 1;

    const indicatorHtml = `
      <div class="notebook-page-break-indicator" data-break-after="${currentIdx}" data-manual-break="true">
        <span class="page-break-tag">📄 Salto de Página (Hoja ${nextIdx + 1})</span>
      </div>
    `;

    const newSheetHtml = `
      <div class="notebook-page-sheet" data-page-index="${nextIdx}">
        <div class="notebook-sheet-cont-header">
          <div class="cont-left">
            <span class="cont-title">${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}</span> • GUÍA PEDAGÓGICA
          </div>
          <div class="cont-right">
            <span>${this.escapeHtml(cls.subject || 'Clase')} ${this.escapeHtml(cls.grade ? '(' + cls.grade + ')' : '')} • Clase #${classNum} (Continuación)</span>
            <button type="button" class="btn-remove-sheet" onclick="NotebookEditor.removePage(${nextIdx})" title="Eliminar esta hoja y unir su contenido con la anterior">&times; Eliminar hoja</button>
          </div>
        </div>
        <div class="notebook-editable-content" contenteditable="true" spellcheck="true" data-page-content="${nextIdx}" placeholder="Continúa escribiendo el contenido en esta hoja...">
          ${extractedHtml}
        </div>
        <div class="notebook-sheet-footer">
          <span class="sheet-institution-tag">${this.escapeHtml(profile.institution || 'Colegio Hogar Madre de Dios')}</span>
          <span class="sheet-page-number" data-sheet-num="${nextIdx}">Página ${nextIdx + 1}</span>
        </div>
      </div>
    `;

    if (currentSheet) {
      currentSheet.insertAdjacentHTML('afterend', indicatorHtml + newSheetHtml);
    } else {
      this.addNewPage();
      return;
    }

    this.bindCanvasEvents();
    this.updatePageNumbers();
    this.saveCurrentNotebookContent(false);

    const newContent = wrapper.querySelector(`.notebook-editable-content[data-page-content="${nextIdx}"]`);
    if (newContent) {
      newContent.focus();
      newContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('Salto de página insertado (Nueva Hoja creada)', 'success');
    }
  },

  // -------------------------------------------------------------
  // MOTOR DE PAGINACIÓN AUTOMÁTICA TIPO WORD (DETECCIÓN DE HOJA 1 A HOJA 2)
  // -------------------------------------------------------------
  schedulePagination(delay = 140) {
    clearTimeout(this._paginationTimer);
    this._paginationTimer = setTimeout(() => {
      this.checkPagination();
    }, delay);
  },

  ensurePageExists(pageIdx) {
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return null;

    const allSheets = Array.from(wrapper.querySelectorAll('.notebook-page-sheet'));
    if (pageIdx < allSheets.length) {
      return allSheets[pageIdx].querySelector('.notebook-editable-content');
    }

    const profile = StorageService.getProfile();
    const cls = this.currentClassData || {};
    const classNum = parseInt(String(cls.dayNumber || (this.currentClassIndex + 1)).replace(/[^0-9]/g, ''), 10) || 1;
    const targetIdx = allSheets.length;

    const indicatorHtml = `
      <div class="notebook-page-break-indicator" data-break-after="${targetIdx - 1}" data-auto-break="true">
        <span class="page-break-tag">📄 Salto de Página Automático (Hoja ${targetIdx + 1})</span>
      </div>
    `;

    const newSheetHtml = `
      <div class="notebook-page-sheet" data-page-index="${targetIdx}">
        <div class="notebook-sheet-cont-header">
          <div class="cont-left">
            <span class="cont-title">${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}</span> • GUÍA PEDAGÓGICA
          </div>
          <div class="cont-right">
            <span>${this.escapeHtml(cls.subject || 'Clase')} ${this.escapeHtml(cls.grade ? '(' + cls.grade + ')' : '')} • Clase #${classNum} (Continuación)</span>
            <button type="button" class="btn-remove-sheet" onclick="NotebookEditor.removePage(${targetIdx})" title="Eliminar esta hoja y unir su contenido con la anterior">&times; Eliminar hoja</button>
          </div>
        </div>
        <div class="notebook-editable-content" contenteditable="true" spellcheck="true" data-page-content="${targetIdx}" placeholder="Continúa escribiendo el contenido de la clase en esta hoja..."></div>
        <div class="notebook-sheet-footer">
          <span class="sheet-institution-tag">${this.escapeHtml(profile.institution || 'Colegio Hogar Madre de Dios')}</span>
          <span class="sheet-page-number" data-sheet-num="${targetIdx}">Página ${targetIdx + 1}</span>
        </div>
      </div>
    `;

    const addBar = wrapper.querySelector('.notebook-add-sheet-bar');
    if (addBar) {
      addBar.insertAdjacentHTML('beforebegin', indicatorHtml + newSheetHtml);
    } else {
      wrapper.insertAdjacentHTML('beforeend', indicatorHtml + newSheetHtml);
    }

    this.bindCanvasEvents();
    this.updatePageNumbers();

    const sheetsNow = wrapper.querySelectorAll('.notebook-page-sheet');
    const newSheet = sheetsNow[sheetsNow.length - 1];
    return newSheet ? newSheet.querySelector('.notebook-editable-content') : null;
  },

  removePageSilently(sheetElOrIdx) {
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;

    let sheetToRemove = null;
    if (typeof sheetElOrIdx === 'number') {
      if (sheetElOrIdx <= 0) return;
      sheetToRemove = wrapper.querySelector(`.notebook-page-sheet[data-page-index="${sheetElOrIdx}"]`);
    } else if (sheetElOrIdx && sheetElOrIdx.nodeType === Node.ELEMENT_NODE) {
      sheetToRemove = sheetElOrIdx;
    }

    if (!sheetToRemove) return;

    // Eliminar todos los indicadores inmediatamente anteriores a esta hoja
    let prev = sheetToRemove.previousElementSibling;
    while (prev && prev.classList.contains('notebook-page-break-indicator')) {
      const toRemove = prev;
      prev = prev.previousElementSibling;
      toRemove.remove();
    }

    sheetToRemove.remove();
  },

  saveCaretMarker() {
    this._hasCaretMarker = false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper || !wrapper.contains(range.commonAncestorContainer)) return;

    const oldMarker = document.getElementById('notebook-caret-marker');
    if (oldMarker) oldMarker.remove();

    try {
      const marker = document.createElement('span');
      marker.id = 'notebook-caret-marker';
      marker.style.display = 'inline-block';
      marker.style.width = '0';
      marker.style.height = '0';
      marker.style.lineHeight = '0';
      marker.style.overflow = 'hidden';
      marker.textContent = '\u200B';
      range.insertNode(marker);
      this._hasCaretMarker = true;
    } catch (e) {
      this._hasCaretMarker = false;
    }
  },

  restoreCaretMarker() {
    if (!this._hasCaretMarker) return;
    const marker = document.getElementById('notebook-caret-marker');
    if (!marker) return;

    try {
      const parent = marker.parentNode;
      if (parent) {
        const childNodes = Array.from(parent.childNodes);
        const index = childNodes.indexOf(marker);
        marker.remove();

        // Si el contenedor quedó completamente vacío (ej: párrafo vacío tras dar Enter)
        if (!parent.textContent && parent.childNodes.length === 0 && (parent.tagName === 'P' || parent.tagName === 'DIV' || parent.tagName === 'LI')) {
          parent.innerHTML = '<br/>';
          const newRange = document.createRange();
          newRange.setStart(parent, 0);
          newRange.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(newRange);
        } else {
          const newRange = document.createRange();
          const targetOffset = Math.min(Math.max(0, index), parent.childNodes.length);
          newRange.setStart(parent, targetOffset);
          newRange.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }
    } catch (e) {
      // Silencioso
    } finally {
      if (marker && marker.parentNode) marker.remove();
      this._hasCaretMarker = false;
    }
  },

  splitOverflowingBlock(blockEl, bottomLimit) {
    if (!blockEl || blockEl.nodeType !== Node.ELEMENT_NODE) return null;

    // 1. Si es una lista organizada (UL u OL)
    if (blockEl.tagName === 'UL' || blockEl.tagName === 'OL') {
      const items = Array.from(blockEl.children);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom > bottomLimit) {
          // Si el elemento i comienza antes del límite con espacio suficiente (>= 22px), intentar dividirlo internamente
          if (itemRect.top < bottomLimit - 22) {
            const splitLi = this.splitOverflowingBlock(item, bottomLimit);
            if (splitLi) {
              const newList = document.createElement(blockEl.tagName);
              newList.className = blockEl.className;
              if (blockEl.tagName === 'OL') {
                const startVal = parseInt(blockEl.getAttribute('start') || '1', 10);
                newList.setAttribute('start', startVal + i);
              }
              newList.appendChild(splitLi);
              while (blockEl.children[i + 1]) {
                newList.appendChild(blockEl.children[i + 1]);
              }
              return newList;
            }
          }

          // Si es el primer elemento de la lista y no se pudo dividir, toda la lista desborda
          if (i === 0) {
            return null;
          }

          // Si es un elemento posterior (i > 0), partir la lista a partir de este item
          const newList = document.createElement(blockEl.tagName);
          newList.className = blockEl.className;
          if (blockEl.tagName === 'OL') {
            const startVal = parseInt(blockEl.getAttribute('start') || '1', 10);
            newList.setAttribute('start', startVal + i);
          }
          while (blockEl.children[i]) {
            newList.appendChild(blockEl.children[i]);
          }
          return newList;
        }
      }
      return null;
    }

    // 2. Si es un elemento LI que contiene una sublista anidada (UL u OL)
    if (blockEl.tagName === 'LI') {
      const subList = Array.from(blockEl.children).find(ch => ch.tagName === 'UL' || ch.tagName === 'OL');
      if (subList) {
        const subRect = subList.getBoundingClientRect();
        // Si la sublista comienza dentro del límite útil, intentar dividir la sublista
        if (subRect.top < bottomLimit - 22) {
          const splitSubList = this.splitOverflowingBlock(subList, bottomLimit);
          if (splitSubList) {
            const newLi = document.createElement('li');
            newLi.className = blockEl.className;
            newLi.style.listStyleType = 'none';
            newLi.setAttribute('data-notebook-continuation', 'true');
            newLi.appendChild(splitSubList);
            return newLi;
          }
        }
      }
    }

    // 3. Si es un contenedor compuesto con párrafos, divs o listas internas
    const childBlocks = Array.from(blockEl.children).filter(ch => ch.tagName === 'P' || ch.tagName === 'DIV' || ch.tagName === 'UL' || ch.tagName === 'OL');
    if (childBlocks.length >= 1) {
      for (let cb = 0; cb < childBlocks.length; cb++) {
        const child = childBlocks[cb];
        const cbRect = child.getBoundingClientRect();
        if (cbRect.bottom > bottomLimit) {
          if (cbRect.top < bottomLimit - 22) {
            const splitChild = this.splitOverflowingBlock(child, bottomLimit);
            if (splitChild) {
              const newContainer = document.createElement(blockEl.tagName);
              newContainer.className = blockEl.className;
              newContainer.appendChild(splitChild);
              while (blockEl.children[cb + 1]) {
                newContainer.appendChild(blockEl.children[cb + 1]);
              }
              return newContainer;
            }
          }
          if (cb === 0) {
            return null;
          }
          const newContainer = document.createElement(blockEl.tagName);
          newContainer.className = blockEl.className;
          while (blockEl.children[cb]) {
            newContainer.appendChild(blockEl.children[cb]);
          }
          return newContainer;
        }
      }
    }

    // 4. Si es un párrafo, bloque de texto, div o item de lista simple (LI) sin sublistas
    if (blockEl.tagName === 'P' || blockEl.tagName === 'DIV' || blockEl.tagName === 'LI' || blockEl.tagName === 'BLOCKQUOTE') {
      const range = document.createRange();
      const textNodes = [];
      const collectText = (n) => {
        if (n.nodeType === Node.TEXT_NODE && n.nodeValue && n.nodeValue.trim().length > 0) {
          textNodes.push(n);
        } else {
          n.childNodes.forEach(collectText);
        }
      };
      collectText(blockEl);

      for (let tIdx = 0; tIdx < textNodes.length; tIdx++) {
        const tNode = textNodes[tIdx];
        for (let off = 1; off <= tNode.length; off++) {
          range.setStart(tNode, off - 1);
          range.setEnd(tNode, off);
          const rects = range.getClientRects();
          if (rects.length > 0 && rects[0].bottom > bottomLimit) {
            if (tIdx === 0 && off <= 3) {
              return null;
            }
            // Buscar un corte limpio por palabra
            let splitOffset = Math.max(0, off - 1);
            const textVal = tNode.nodeValue || '';
            const lastSpace = textVal.lastIndexOf(' ', splitOffset);
            if (lastSpace > 0 && lastSpace > splitOffset - 25) {
              splitOffset = lastSpace + 1;
            }

            const fullRange = document.createRange();
            fullRange.selectNodeContents(blockEl);
            fullRange.setStart(tNode, splitOffset);
            const fragment = fullRange.extractContents();

            const newBlock = document.createElement(blockEl.tagName);
            newBlock.className = blockEl.className;
            newBlock.appendChild(fragment);
            return newBlock;
          }
        }
      }
    }
    return null;
  },

  checkPagination() {
    if (this._isPaginating) return;
    this._isPaginating = true;

    try {
      const wrapper = document.getElementById('notebook-pages-wrapper');
      if (!wrapper) return;

      let sheets = Array.from(wrapper.querySelectorAll('.notebook-page-sheet'));
      if (sheets.length === 0) return;

      let hasChanged = false;
      let iterations = 0;
      const maxIterations = 15;
      const movedInThisRun = new Set();
      if (!this._recentlyMovedMap) {
        this._recentlyMovedMap = new WeakMap();
      }

      while (iterations < maxIterations) {
        iterations++;
        let stepChanged = false;
        sheets = Array.from(wrapper.querySelectorAll('.notebook-page-sheet'));

        for (let i = 0; i < sheets.length; i++) {
          const sheet = sheets[i];
          const contentEl = sheet.querySelector('.notebook-editable-content');
          sheet.scrollTop = 0;
          contentEl.scrollTop = 0;

          // Límite inferior físico de la hoja (justo antes del pie de página)
          const footerEl = sheet.querySelector('.notebook-sheet-footer');
          const bottomBoundary = footerEl ? (footerEl.getBoundingClientRect().top - 8) : (contentEl.getBoundingClientRect().bottom - 8);

          const children = Array.from(contentEl.children);
          if (children.length === 0) continue;

          let overflowIndex = -1;
          for (let c = 0; c < children.length; c++) {
            const child = children[c];
            if (child.id === 'notebook-caret-marker') continue;
            const cRect = child.getBoundingClientRect();
            if (cRect.bottom > bottomBoundary) {
              overflowIndex = c;
              break;
            }
          }

          // A) DESBORDAMIENTO: Mover a la siguiente hoja
          if (overflowIndex !== -1) {
            const overflowChild = children[overflowIndex];
            const cRect = overflowChild.getBoundingClientRect();

            // Si el bloque desbordante ya está al inicio y es el único elemento de la hoja
            if (overflowIndex === 0 && children.length === 1) {
              if (cRect.top < bottomBoundary - 22) {
                const splitBlock = this.splitOverflowingBlock(overflowChild, bottomBoundary);
                if (splitBlock) {
                  const nextContent = this.ensurePageExists(i + 1);
                  if (nextContent) {
                    this.saveCaretMarker();
                    nextContent.insertBefore(splitBlock, nextContent.firstChild);
                    movedInThisRun.add(splitBlock);
                    this._recentlyMovedMap.set(splitBlock, Date.now());
                    this.restoreCaretMarker();
                    stepChanged = true;
                    hasChanged = true;
                    break;
                  }
                }
              }
              // Bloque indivisible que ya está solo: no crear hojas vacías en bucle infinito
              continue;
            }

            const nextContent = this.ensurePageExists(i + 1);
            if (nextContent) {
              this.saveCaretMarker();

              // Intentar dividir el bloque si comienza dentro de la hoja y tiene espacio útil
              let splitBlock = null;
              if (cRect.top < bottomBoundary - 22) {
                splitBlock = this.splitOverflowingBlock(overflowChild, bottomBoundary);
              }

              if (splitBlock) {
                nextContent.insertBefore(splitBlock, nextContent.firstChild);
                movedInThisRun.add(splitBlock);
                this._recentlyMovedMap.set(splitBlock, Date.now());
                const nodesToMove = children.slice(overflowIndex + 1);
                let refNode = splitBlock.nextSibling;
                nodesToMove.forEach(node => {
                  nextContent.insertBefore(node, refNode);
                  movedInThisRun.add(node);
                  this._recentlyMovedMap.set(node, Date.now());
                });
                stepChanged = true;
                hasChanged = true;
              } else {
                const nodesToMove = children.slice(overflowIndex);
                let refNode = nextContent.firstChild;
                nodesToMove.forEach(node => {
                  nextContent.insertBefore(node, refNode);
                  movedInThisRun.add(node);
                  this._recentlyMovedMap.set(node, Date.now());
                });
                stepChanged = true;
                hasChanged = true;
              }

              this.restoreCaretMarker();
              break;
            }
          }

          // B) RETROCESO (PULL-BACK): Traer contenido si hay suficiente espacio libre
          if (i < sheets.length - 1 && overflowIndex === -1) {
            const nextSheet = sheets[i + 1];
            const nextContent = nextSheet.querySelector('.notebook-editable-content');
            const prevEl = nextSheet.previousElementSibling;
            const isManualBreak = prevEl && prevEl.getAttribute('data-manual-break') === 'true';

            // Si la hoja siguiente está totalmente vacía de contenido útil, retirarla de inmediato
            if (nextContent && this.isContentEmpty(nextContent)) {
              const isNextFocused = document.activeElement === nextContent || nextContent.contains(document.activeElement);
              if (!isNextFocused) {
                this.removePageSilently(nextSheet);
                stepChanged = true;
                hasChanged = true;
                break;
              }
            }

            if (!isManualBreak && nextContent && nextContent.children.length > 0) {
              const lastChild = contentEl.lastElementChild;
              const currentContentBottom = lastChild ? lastChild.getBoundingClientRect().bottom : contentEl.getBoundingClientRect().top;
              const freeSpace = bottomBoundary - currentContentBottom;

              const firstNextChild = nextContent.firstElementChild;
              if (firstNextChild && firstNextChild.id !== 'notebook-caret-marker') {
                const hasVisualContent = (firstNextChild.textContent || '').replace(/[\s\u00a0\u200B]+/g, '').length > 0 || 
                                         !!firstNextChild.querySelector('img, table, iframe, hr, svg, canvas');

                // Si es un nodo vacío o placeholder, eliminarlo para que no bloquee el retroceso
                if (!hasVisualContent) {
                  firstNextChild.remove();
                  stepChanged = true;
                  hasChanged = true;
                  break;
                }

                // Proteger contra oscilación inmediata de rebote (mínimo 2.5s)
                const lastPushedTime = this._recentlyMovedMap.get(firstNextChild);
                if (lastPushedTime && (Date.now() - lastPushedTime < 2500)) {
                  continue;
                }

                // Evitar oscilación ping-pong en la misma corrida
                if (!movedInThisRun.has(firstNextChild)) {
                  // Si es una lista organizada (UL u OL) que no cabe completa, intentar traer items individuales (LI)
                  if ((firstNextChild.tagName === 'UL' || firstNextChild.tagName === 'OL') && firstNextChild.children.length > 0) {
                    const firstLi = firstNextChild.firstElementChild;
                    if (firstLi) {
                      // B.1) Si firstLi es una continuación de sublista anidada, intentar traer sub-items individuales
                      const innerSubList = firstLi.querySelector(':scope > ul, :scope > ol') || firstLi.querySelector('ul, ol');
                      if (innerSubList && innerSubList.children.length > 0) {
                        const firstInnerLi = innerSubList.firstElementChild;
                        let innerH = firstInnerLi.offsetHeight;
                        if (typeof window !== 'undefined' && window.getComputedStyle) {
                          try {
                            const cs = window.getComputedStyle(firstInnerLi);
                            innerH += (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
                          } catch (eCs) {}
                        }
                        if (innerH > 0 && freeSpace >= innerH + 6) {
                          this.saveCaretMarker();
                          let targetSubList = null;
                          if (lastChild && (lastChild.tagName === 'UL' || lastChild.tagName === 'OL')) {
                            const targetLi = lastChild.lastElementChild;
                            if (targetLi) {
                              targetSubList = targetLi.querySelector('ul, ol');
                            }
                          }
                          if (targetSubList) {
                            targetSubList.appendChild(firstInnerLi);
                          } else if (lastChild && lastChild.tagName === firstNextChild.tagName) {
                            lastChild.appendChild(firstInnerLi);
                          } else {
                            contentEl.appendChild(firstInnerLi);
                          }
                          if (innerSubList.children.length === 0) {
                            firstLi.remove();
                          }
                          if (firstNextChild.children.length === 0) {
                            firstNextChild.remove();
                          }
                          this.restoreCaretMarker();
                          stepChanged = true;
                          hasChanged = true;
                          const isNextFocused = document.activeElement === nextContent || nextContent.contains(document.activeElement);
                          if (!isNextFocused && this.isContentEmpty(nextContent)) {
                            this.removePageSilently(nextSheet);
                          }
                          break;
                        }
                      }

                      // B.2) Traer el elemento LI completo si cabe
                      let liHeight = firstLi.offsetHeight;
                      if (typeof window !== 'undefined' && window.getComputedStyle) {
                        try {
                          const cs = window.getComputedStyle(firstLi);
                          liHeight += (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
                        } catch (eCs) {}
                      }

                      if (liHeight > 0 && freeSpace >= liHeight + 6) {
                        this.saveCaretMarker();
                        if (lastChild && lastChild.tagName === firstNextChild.tagName) {
                          lastChild.appendChild(firstLi);
                        } else {
                          const subList = document.createElement(firstNextChild.tagName);
                          subList.className = firstNextChild.className;
                          contentEl.appendChild(subList);
                          subList.appendChild(firstLi);
                        }
                        if (firstNextChild.children.length === 0) {
                          firstNextChild.remove();
                        }
                        this.restoreCaretMarker();
                        stepChanged = true;
                        hasChanged = true;

                        const isNextFocused = document.activeElement === nextContent || nextContent.contains(document.activeElement);
                        if (!isNextFocused && this.isContentEmpty(nextContent)) {
                          this.removePageSilently(nextSheet);
                        }
                        break;
                      }
                    }
                  }

                  let childHeight = firstNextChild.offsetHeight;
                  if (typeof window !== 'undefined' && window.getComputedStyle) {
                    try {
                      const cs = window.getComputedStyle(firstNextChild);
                      childHeight += (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
                    } catch (eCs) {}
                  }

                  if (childHeight > 0 && freeSpace >= childHeight + 8) {
                    this.saveCaretMarker();
                    contentEl.appendChild(firstNextChild);
                    this.restoreCaretMarker();
                    stepChanged = true;
                    hasChanged = true;

                    const isNextFocused = document.activeElement === nextContent || nextContent.contains(document.activeElement);
                    if (!isNextFocused && this.isContentEmpty(nextContent)) {
                      this.removePageSilently(nextSheet);
                    }
                    break;
                  }
                }
              }
            }
          }
        }

        if (!stepChanged) break;
      }

      // Limpiar cualquier hoja intermedia o final que haya quedado vacía (salvo si tiene el foco activo)
      const remainingSheets = Array.from(wrapper.querySelectorAll('.notebook-page-sheet'));
      for (let s = remainingSheets.length - 1; s >= 1; s--) {
        const sSheet = remainingSheets[s];
        const sContent = sSheet.querySelector('.notebook-editable-content');
        const isFocused = sContent && (document.activeElement === sContent || sContent.contains(document.activeElement));
        if (!isFocused && this.isContentEmpty(sContent)) {
          this.removePageSilently(sSheet);
          hasChanged = true;
        }
      }

      // Sincronizar y limpiar SIEMPRE la numeración y la integridad de indicadores
      this.updatePageNumbers();

      if (hasChanged) {
        this.bindCanvasEvents();
        this.saveCurrentNotebookContent(false);
      }
    } finally {
      this._isPaginating = false;
    }
  },

  triggerAutoSave(immediate = false) {
    this.updateAutoSaveStatus('saving');
    clearTimeout(this._debounceSave);
    if (immediate) {
      this.saveCurrentNotebookContent(false);
      this.updateAutoSaveStatus('saved');
      return;
    }
    this._debounceSave = setTimeout(() => {
      this.saveCurrentNotebookContent(false);
      this.updateAutoSaveStatus('saved');
    }, 400);
  },

  /**
   * Captura instantánea del contenido del cuaderno para el historial de Deshacer (Ctrl + Z)
   */
  recordHistoryState() {
    if (this._isHistoryAction) return;
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;
    const snapshot = wrapper.innerHTML;
    if (this._undoStack.length > 0 && this._undoStack[this._undoStack.length - 1] === snapshot) {
      return;
    }
    this._undoStack.push(snapshot);
    if (this._undoStack.length > 40) this._undoStack.shift();
    this._redoStack = [];
  },

  /**
   * Deshacer acción (Ctrl + Z / Botón Deshacer)
   */
  undo() {
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper || this._undoStack.length === 0) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('No hay más acciones para deshacer', 'info');
      }
      return false;
    }
    const current = wrapper.innerHTML;

    let previous = this._undoStack.pop();
    while (previous && previous === current && this._undoStack.length > 0) {
      previous = this._undoStack.pop();
    }
    if (!previous || previous === current) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('No hay más acciones para deshacer', 'info');
      }
      return false;
    }

    this._redoStack.push(current);
    this._isHistoryAction = true;
    wrapper.innerHTML = previous;
    this.rebindAllSheetEvents();
    this.schedulePagination(100);
    this.saveCurrentNotebookContent(false);
    this._isHistoryAction = false;
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('Deshecho (Ctrl+Z)', 'info');
    }
    return true;
  },

  /**
   * Rehacer acción (Ctrl + Y / Botón Rehacer)
   */
  redo() {
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper || this._redoStack.length === 0) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('No hay más acciones para rehacer', 'info');
      }
      return false;
    }
    const current = wrapper.innerHTML;
    this._undoStack.push(current);

    const nextState = this._redoStack.pop();
    if (nextState) {
      this._isHistoryAction = true;
      wrapper.innerHTML = nextState;
      this.rebindAllSheetEvents();
      this.schedulePagination(100);
      this.saveCurrentNotebookContent(false);
      this._isHistoryAction = false;
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Rehecho (Ctrl+Y)', 'info');
      }
      return true;
    }
    return false;
  },

  rebindAllSheetEvents() {
    this.bindCanvasEvents();
    this.setupCrossSheetSelection();
  },

  /**
   * Ejecuta comandos de formato de texto (negrilla, color, alineación, etc.)
   * con soporte continuo para selecciones que abarcan múltiples hojas (Ctrl + A o selección con ratón).
   */
  exec(command, value = null) {
    if (command === 'undo') {
      this.undo();
      return;
    }
    if (command === 'redo') {
      this.redo();
      return;
    }
    this.recordHistoryState();

    let sel = window.getSelection();
    let range = (sel && sel.rangeCount > 0 && !sel.isCollapsed) 
      ? sel.getRangeAt(0) 
      : (this._savedToolbarRange || null);

    if (range && (!sel || sel.rangeCount === 0 || sel.isCollapsed)) {
      sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const crossInfo = this.getCrossSheetSelectionInfo(range);

    if (crossInfo && crossInfo.isCrossSheet) {
      const { startIdx, endIdx, allSheets } = crossInfo;
      const originalStartContainer = range.startContainer;
      const originalStartOffset = range.startOffset;
      const originalEndContainer = range.endContainer;
      const originalEndOffset = range.endOffset;

      for (let i = startIdx; i <= endIdx; i++) {
        const sheet = allSheets[i];
        const subRange = document.createRange();

        if (i === startIdx) {
          subRange.setStart(originalStartContainer, originalStartOffset);
          const lastChild = sheet.lastChild || sheet;
          const off = lastChild.nodeType === Node.TEXT_NODE ? lastChild.length : lastChild.childNodes.length;
          subRange.setEnd(lastChild, off);
        } else if (i === endIdx) {
          const firstChild = sheet.firstChild || sheet;
          subRange.setStart(firstChild, 0);
          subRange.setEnd(originalEndContainer, originalEndOffset);
        } else {
          subRange.selectNodeContents(sheet);
        }

        sel.removeAllRanges();
        sel.addRange(subRange);
        sheet.focus();
        document.execCommand(command, false, value);
      }

      // Restaurar la selección unificada multihioja visible para el usuario
      const fullRange = this.createCrossRange
        ? this.createCrossRange(originalStartContainer, originalStartOffset, originalEndContainer, originalEndOffset)
        : null;
      if (fullRange) {
        sel.removeAllRanges();
        sel.addRange(fullRange);
        this._savedToolbarRange = fullRange.cloneRange();
      }
      this.triggerAutoSave();
      this.schedulePagination(150);
      return;
    }

    document.execCommand(command, false, value);
    const canvas = this.getActiveCanvas();
    if (canvas) canvas.focus();
    this.triggerAutoSave();
    this.schedulePagination(150);
  },

  /**
   * Aplica estilos de párrafo o títulos (H1, H2, H3, P) con soporte multihioja
   */
  formatBlock(tag) {
    if (!tag) return;
    this.recordHistoryState();
    let sel = window.getSelection();
    let range = (sel && sel.rangeCount > 0 && !sel.isCollapsed) 
      ? sel.getRangeAt(0) 
      : (this._savedToolbarRange || null);

    if (range && (!sel || sel.rangeCount === 0 || sel.isCollapsed)) {
      sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const crossInfo = this.getCrossSheetSelectionInfo(range);

    if (crossInfo && crossInfo.isCrossSheet) {
      const { startIdx, endIdx, allSheets } = crossInfo;
      const originalStartContainer = range.startContainer;
      const originalStartOffset = range.startOffset;
      const originalEndContainer = range.endContainer;
      const originalEndOffset = range.endOffset;

      for (let i = startIdx; i <= endIdx; i++) {
        const sheet = allSheets[i];
        const subRange = document.createRange();

        if (i === startIdx) {
          subRange.setStart(originalStartContainer, originalStartOffset);
          const lastChild = sheet.lastChild || sheet;
          const off = lastChild.nodeType === Node.TEXT_NODE ? lastChild.length : lastChild.childNodes.length;
          subRange.setEnd(lastChild, off);
        } else if (i === endIdx) {
          const firstChild = sheet.firstChild || sheet;
          subRange.setStart(firstChild, 0);
          subRange.setEnd(originalEndContainer, originalEndOffset);
        } else {
          subRange.selectNodeContents(sheet);
        }

        sel.removeAllRanges();
        sel.addRange(subRange);
        sheet.focus();
        document.execCommand('formatBlock', false, `<${tag}>`);
      }

      const fullRange = this.createCrossRange
        ? this.createCrossRange(originalStartContainer, originalStartOffset, originalEndContainer, originalEndOffset)
        : null;
      if (fullRange) {
        sel.removeAllRanges();
        sel.addRange(fullRange);
        this._savedToolbarRange = fullRange.cloneRange();
      }
      this.triggerAutoSave();
      this.schedulePagination(150);
      return;
    }

    document.execCommand('formatBlock', false, `<${tag}>`);
    const canvas = this.getActiveCanvas();
    if (canvas) canvas.focus();
    this.triggerAutoSave();
    this.schedulePagination(150);
  },

  /**
   * Aplica tamaño de fuente al texto seleccionado con soporte continuo para múltiples hojas (Ctrl + A o selección con ratón).
   */
  setFontSize(size) {
    if (!size) return;
    this.recordHistoryState();
    const sizeVal = (size.includes('pt') || size.includes('px') || size.includes('rem') || size.includes('em'))
      ? size
      : (size + 'pt');

    let sel = window.getSelection();
    let range = (sel && sel.rangeCount > 0 && !sel.isCollapsed) 
      ? sel.getRangeAt(0) 
      : (this._savedToolbarRange || null);

    if (range && (!sel || sel.rangeCount === 0 || sel.isCollapsed)) {
      sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (!range) return;

    const crossInfo = this.getCrossSheetSelectionInfo ? this.getCrossSheetSelectionInfo(range) : null;

    const applySizeToElement = (sheetEl) => {
      document.execCommand('fontSize', false, 7);
      const fontEls = sheetEl.querySelectorAll('font[size="7"]');
      fontEls.forEach(f => {
        f.removeAttribute('size');
        f.style.fontSize = sizeVal;
        f.querySelectorAll('[style*="font-size"]').forEach(child => {
          child.style.fontSize = '';
        });
      });
    };

    if (crossInfo && crossInfo.isCrossSheet) {
      const { startIdx, endIdx, allSheets } = crossInfo;
      const originalStartContainer = range.startContainer;
      const originalStartOffset = range.startOffset;
      const originalEndContainer = range.endContainer;
      const originalEndOffset = range.endOffset;

      for (let i = startIdx; i <= endIdx; i++) {
        const sheet = allSheets[i];
        const subRange = document.createRange();

        if (i === startIdx) {
          subRange.setStart(originalStartContainer, originalStartOffset);
          const lastChild = sheet.lastChild || sheet;
          const off = lastChild.nodeType === Node.TEXT_NODE ? lastChild.length : lastChild.childNodes.length;
          subRange.setEnd(lastChild, off);
        } else if (i === endIdx) {
          const firstChild = sheet.firstChild || sheet;
          subRange.setStart(firstChild, 0);
          subRange.setEnd(originalEndContainer, originalEndOffset);
        } else {
          subRange.selectNodeContents(sheet);
        }

        sel.removeAllRanges();
        sel.addRange(subRange);
        sheet.focus();
        applySizeToElement(sheet);
      }

      // Restaurar selección unificada visible
      const fullRange = this.createCrossRange
        ? this.createCrossRange(originalStartContainer, originalStartOffset, originalEndContainer, originalEndOffset)
        : null;
      if (fullRange) {
        sel.removeAllRanges();
        sel.addRange(fullRange);
        this._savedToolbarRange = fullRange.cloneRange();
      }
      this.triggerAutoSave();
      this.schedulePagination(150);
      return;
    }

    // Selección dentro de una sola hoja
    const sheetEl = (range.commonAncestorContainer && range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer?.parentElement)?.closest('.notebook-editable-content') || this.getActiveCanvas();

    if (sheetEl && sel && sel.rangeCount > 0) {
      sheetEl.focus();
      applySizeToElement(sheetEl);
    }
    this.triggerAutoSave();
    this.schedulePagination(150);
  },

  /**
   * Aplica familia tipográfica (fuente) al texto seleccionado con soporte continuo para múltiples hojas.
   */
  setFontFamily(font) {
    if (!font) return;
    this.recordHistoryState();

    let sel = window.getSelection();
    let range = (sel && sel.rangeCount > 0 && !sel.isCollapsed) 
      ? sel.getRangeAt(0) 
      : (this._savedToolbarRange || null);

    if (range && (!sel || sel.rangeCount === 0 || sel.isCollapsed)) {
      sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (!range) return;

    const crossInfo = this.getCrossSheetSelectionInfo ? this.getCrossSheetSelectionInfo(range) : null;

    const applyFontToElement = (sheetEl) => {
      document.execCommand('fontName', false, font);
      const fonts = sheetEl.querySelectorAll('font[face]');
      fonts.forEach(f => {
        f.style.fontFamily = font;
      });
    };

    if (crossInfo && crossInfo.isCrossSheet) {
      const { startIdx, endIdx, allSheets } = crossInfo;
      const originalStartContainer = range.startContainer;
      const originalStartOffset = range.startOffset;
      const originalEndContainer = range.endContainer;
      const originalEndOffset = range.endOffset;

      for (let i = startIdx; i <= endIdx; i++) {
        const sheet = allSheets[i];
        const subRange = document.createRange();

        if (i === startIdx) {
          subRange.setStart(originalStartContainer, originalStartOffset);
          const lastChild = sheet.lastChild || sheet;
          const off = lastChild.nodeType === Node.TEXT_NODE ? lastChild.length : lastChild.childNodes.length;
          subRange.setEnd(lastChild, off);
        } else if (i === endIdx) {
          const firstChild = sheet.firstChild || sheet;
          subRange.setStart(firstChild, 0);
          subRange.setEnd(originalEndContainer, originalEndOffset);
        } else {
          subRange.selectNodeContents(sheet);
        }

        sel.removeAllRanges();
        sel.addRange(subRange);
        sheet.focus();
        applyFontToElement(sheet);
      }

      const fullRange = this.createCrossRange
        ? this.createCrossRange(originalStartContainer, originalStartOffset, originalEndContainer, originalEndOffset)
        : null;
      if (fullRange) {
        sel.removeAllRanges();
        sel.addRange(fullRange);
        this._savedToolbarRange = fullRange.cloneRange();
      }
      this.triggerAutoSave();
      this.schedulePagination(150);
      return;
    }

    const sheetEl = (range.commonAncestorContainer && range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer?.parentElement)?.closest('.notebook-editable-content') || this.getActiveCanvas();

    if (sheetEl && sel && sel.rangeCount > 0) {
      sheetEl.focus();
      applyFontToElement(sheetEl);
    }
    this.triggerAutoSave();
    this.schedulePagination(150);
  },

  /**
   * Aplica interlineado tipo Microsoft Word / Google Docs (1.0, 1.15, 1.5, 2.0) al párrafo o selección activa
   */
  setLineSpacing(spacing) {
    if (!spacing) return;
    this.recordHistoryState();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const blocks = new Set();
    const findBlock = (node) => {
      if (!node) return null;
      return node.nodeType === Node.ELEMENT_NODE 
        ? node.closest('p, div, li, h1, h2, h3, blockquote') 
        : node.parentElement?.closest('p, div, li, h1, h2, h3, blockquote');
    };

    const startB = findBlock(range.startContainer);
    if (startB) blocks.add(startB);
    const endB = findBlock(range.endContainer);
    if (endB) blocks.add(endB);

    if (range.commonAncestorContainer && range.commonAncestorContainer.querySelectorAll) {
      const descendants = range.commonAncestorContainer.querySelectorAll('p, div, li, h1, h2, h3, blockquote');
      descendants.forEach(d => {
        if (!sel.isCollapsed && sel.containsNode && sel.containsNode(d, true)) {
          blocks.add(d);
        }
      });
    }

    if (blocks.size === 0) {
      const activeCanvas = this.getActiveCanvas();
      if (activeCanvas) blocks.add(activeCanvas);
    }

    blocks.forEach(b => {
      b.style.lineHeight = spacing;
    });

    this.triggerAutoSave();
    this.schedulePagination(120);
  },

  /**
   * Inserta un hipervínculo web estándar con apertura segura en nueva pestaña (Ctrl + K)
   */
  insertLink() {
    const sel = window.getSelection();
    const selectedText = sel && !sel.isCollapsed ? sel.toString().trim() : '';
    const url = prompt('Ingresa la dirección web (URL) para el enlace (ej: https://ejemplo.com):', 'https://');
    if (!url || url.trim() === '' || url === 'https://') return;

    this.recordHistoryState();
    if (selectedText) {
      document.execCommand('createLink', false, url.trim());
      const links = document.querySelectorAll('a[href="' + url.trim() + '"]');
      links.forEach(a => {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      });
    } else {
      const linkText = prompt('Texto que se mostrará para el enlace:', url.trim()) || url.trim();
      const linkHtml = `<a href="${this.escapeHtml(url.trim())}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(linkText)}</a>&nbsp;`;
      document.execCommand('insertHTML', false, linkHtml);
    }
    this.triggerAutoSave();
    this.schedulePagination(100);
  },

  /**
   * Inserta una línea horizontal divisoria (regla horizontal tipo Word)
   */
  insertDivider() {
    this.recordHistoryState();
    document.execCommand('insertHorizontalRule', false, null);
    this.triggerAutoSave();
    this.schedulePagination(100);
  },

  /**
   * Muestra u oculta la paleta de símbolos matemáticos y científicos
   */
  toggleSymbolsMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('notebook-symbols-menu');
    if (menu) menu.classList.toggle('show');
    const tblMenu = document.getElementById('notebook-table-menu');
    if (tblMenu) tblMenu.classList.remove('show');
  },

  /**
   * Inserta un símbolo matemático o científico en la posición del cursor
   */
  insertSymbol(sym) {
    this.recordHistoryState();
    const menu = document.getElementById('notebook-symbols-menu');
    if (menu) menu.classList.remove('show');
    const canvas = this.getActiveCanvas();
    if (canvas) canvas.focus();
    document.execCommand('insertText', false, sym);
    this.triggerAutoSave();
    this.updateStatusBar();
  },

  /**
   * Muestra u oculta el menú contextual de gestión de tablas
   */
  toggleTableMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('notebook-table-menu');
    if (menu) menu.classList.toggle('show');
    const symMenu = document.getElementById('notebook-symbols-menu');
    if (symMenu) symMenu.classList.remove('show');
  },

  getActiveTableCell() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const node = sel.anchorNode;
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE 
      ? node.closest('td, th') 
      : node.parentElement?.closest('td, th');
  },

  insertTableRow(below = true) {
    const cell = this.getActiveTableCell();
    if (!cell) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Haz clic dentro de una celda de la tabla para insertar una fila', 'info');
      }
      return;
    }
    this.recordHistoryState();
    const row = cell.closest('tr');
    const colCount = row.children.length;
    const newRow = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td');
      td.innerHTML = '<br/>';
      newRow.appendChild(td);
    }
    if (below) {
      row.parentNode.insertBefore(newRow, row.nextSibling);
    } else {
      row.parentNode.insertBefore(newRow, row);
    }
    const menu = document.getElementById('notebook-table-menu');
    if (menu) menu.classList.remove('show');
    this.triggerAutoSave();
    this.schedulePagination(100);
  },

  insertTableColumn(right = true) {
    const cell = this.getActiveTableCell();
    if (!cell) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Haz clic dentro de una celda de la tabla para insertar una columna', 'info');
      }
      return;
    }
    this.recordHistoryState();
    const row = cell.closest('tr');
    const colIndex = Array.from(row.children).indexOf(cell);
    const table = row.closest('table');
    const allRows = table.querySelectorAll('tr');
    allRows.forEach(r => {
      const isHeader = r.parentElement && r.parentElement.tagName === 'THEAD';
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.innerHTML = isHeader ? 'Columna' : '<br/>';
      const targetChild = r.children[colIndex];
      if (targetChild) {
        if (right) {
          r.insertBefore(newCell, targetChild.nextSibling);
        } else {
          r.insertBefore(newCell, targetChild);
        }
      } else {
        r.appendChild(newCell);
      }
    });
    const menu = document.getElementById('notebook-table-menu');
    if (menu) menu.classList.remove('show');
    this.triggerAutoSave();
    this.schedulePagination(100);
  },

  deleteTableRow() {
    const cell = this.getActiveTableCell();
    if (!cell) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Haz clic dentro de la fila que deseas eliminar', 'info');
      }
      return;
    }
    this.recordHistoryState();
    const row = cell.closest('tr');
    const table = row.closest('table');
    if (table.querySelectorAll('tr').length <= 1) {
      table.remove();
    } else {
      row.remove();
    }
    const menu = document.getElementById('notebook-table-menu');
    if (menu) menu.classList.remove('show');
    this.triggerAutoSave();
    this.schedulePagination(100);
  },

  deleteTableColumn() {
    const cell = this.getActiveTableCell();
    if (!cell) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Haz clic dentro de la columna que deseas eliminar', 'info');
      }
      return;
    }
    this.recordHistoryState();
    const row = cell.closest('tr');
    const colIndex = Array.from(row.children).indexOf(cell);
    const table = row.closest('table');
    if (row.children.length <= 1) {
      table.remove();
    } else {
      const allRows = table.querySelectorAll('tr');
      allRows.forEach(r => {
        if (r.children[colIndex]) {
          r.children[colIndex].remove();
        }
      });
    }
    const menu = document.getElementById('notebook-table-menu');
    if (menu) menu.classList.remove('show');
    this.triggerAutoSave();
    this.schedulePagination(100);
  },

  deleteTable() {
    const cell = this.getActiveTableCell();
    if (!cell) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Haz clic dentro de la tabla que deseas eliminar', 'info');
      }
      return;
    }
    this.recordHistoryState();
    const table = cell.closest('table');
    if (table) {
      table.remove();
      this.triggerAutoSave();
      this.schedulePagination(100);
    }
    const menu = document.getElementById('notebook-table-menu');
    if (menu) menu.classList.remove('show');
  },

  /**
   * Panel de Búsqueda y Reemplazo (Ctrl + F)
   */
  toggleFindReplace(show) {
    const panel = document.getElementById('notebook-find-replace-panel');
    if (!panel) return;
    if (typeof show === 'boolean') {
      panel.style.display = show ? 'block' : 'none';
    } else {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
    if (panel.style.display === 'block') {
      const input = document.getElementById('notebook-find-input');
      if (input) {
        input.focus();
        input.select();
      }
      const status = document.getElementById('notebook-find-status');
      if (status) status.textContent = '';
    }
  },

  findNext() {
    const input = document.getElementById('notebook-find-input');
    const term = input ? input.value.trim() : '';
    const status = document.getElementById('notebook-find-status');
    if (!term) {
      if (status) status.textContent = 'Escribe un texto para buscar';
      return;
    }
    if (window.find) {
      const found = window.find(term, false, false, true, false, false, false);
      if (!found) {
        const canvas = document.getElementById('notebook-editable-canvas') || document.querySelector('.notebook-editable-content');
        if (canvas) {
          const range = document.createRange();
          range.setStart(canvas, 0);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          const retry = window.find(term, false, false, true, false, false, false);
          if (status) status.textContent = retry ? 'Coincidencia encontrada' : 'No se encontraron resultados';
        } else {
          if (status) status.textContent = 'No se encontraron más resultados';
        }
      } else {
        if (status) status.textContent = 'Coincidencia encontrada';
      }
    } else {
      if (status) status.textContent = 'Búsqueda no compatible con el navegador';
    }
    this.updateStatusBar();
  },

  replaceCurrent() {
    const sel = window.getSelection();
    const input = document.getElementById('notebook-find-input');
    const replaceInput = document.getElementById('notebook-replace-input');
    const status = document.getElementById('notebook-find-status');
    const term = input ? input.value : '';
    const replacement = replaceInput ? replaceInput.value : '';

    if (!term) return;

    if (sel && !sel.isCollapsed && sel.toString().toLowerCase() === term.toLowerCase()) {
      this.recordHistoryState();
      document.execCommand('insertText', false, replacement);
      if (status) status.textContent = 'Texto reemplazado';
      this.triggerAutoSave();
      this.findNext();
    } else {
      this.findNext();
    }
  },

  replaceAll() {
    const input = document.getElementById('notebook-find-input');
    const replaceInput = document.getElementById('notebook-replace-input');
    const status = document.getElementById('notebook-find-status');
    const term = input ? input.value : '';
    const replacement = replaceInput ? replaceInput.value : '';

    if (!term) return;
    this.recordHistoryState();

    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;
    const sheets = wrapper.querySelectorAll('.notebook-editable-content');
    let count = 0;

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');

    sheets.forEach(sheet => {
      const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT, null, false);
      let node;
      const textNodes = [];
      while ((node = walker.nextNode())) {
        if (regex.test(node.nodeValue)) {
          textNodes.push(node);
        }
        regex.lastIndex = 0;
      }
      textNodes.forEach(tNode => {
        const matches = (tNode.nodeValue.match(regex) || []).length;
        count += matches;
        tNode.nodeValue = tNode.nodeValue.replace(regex, replacement);
      });
    });

    if (status) {
      status.textContent = count > 0 ? `Reemplazadas ${count} coincidencias.` : 'No se encontraron coincidencias.';
    }
    if (count > 0) {
      this.triggerAutoSave(true);
      this.schedulePagination(120);
      this.updateStatusBar();
    }
  },

  /**
   * Actualiza en tiempo real la barra de estado inferior (Word / Docs)
   */
  updateStatusBar() {
    const sbPage = document.getElementById('sb-page-info');
    const sbWords = document.getElementById('sb-word-count');
    const sbChars = document.getElementById('sb-char-count');
    const sbSel = document.getElementById('sb-selection-info');
    if (!sbPage && !sbWords && !sbChars) return;

    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;

    const sheets = Array.from(wrapper.querySelectorAll('.notebook-page-sheet'));
    const totalPages = sheets.length || 1;

    let activePage = 1;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const node = sel.anchorNode;
      const sheetEl = node?.nodeType === Node.ELEMENT_NODE ? node.closest('.notebook-page-sheet') : node?.parentElement?.closest('.notebook-page-sheet');
      if (sheetEl) {
        const idx = sheets.indexOf(sheetEl);
        if (idx !== -1) activePage = idx + 1;
      }
    }

    if (sbPage) {
      sbPage.textContent = `Página ${activePage} de ${totalPages}`;
    }

    const contents = wrapper.querySelectorAll('.notebook-editable-content');
    let fullText = '';
    contents.forEach(c => {
      fullText += ' ' + (c.innerText || c.textContent || '');
    });

    const cleanText = fullText.replace(/[\r\n\t]+/g, ' ').trim();
    const words = cleanText.length > 0 ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const chars = cleanText.length;

    if (sbWords) sbWords.textContent = `${words} ${words === 1 ? 'palabra' : 'palabras'}`;
    if (sbChars) sbChars.textContent = `${chars} ${chars === 1 ? 'carácter' : 'caracteres'}`;

    if (sbSel) {
      if (sel && !sel.isCollapsed) {
        const selText = sel.toString().trim();
        if (selText.length > 0) {
          const selWords = selText.split(/\s+/).filter(Boolean).length;
          sbSel.style.display = 'inline';
          sbSel.textContent = `${selWords} palabras seleccionadas (${selText.length} caracteres)`;
        } else {
          sbSel.style.display = 'none';
        }
      } else {
        sbSel.style.display = 'none';
      }
    }
  },

  /**
   * Aplica nivel de zoom visual a las páginas del cuaderno (75% - 125%)
   */
  setZoom(scale) {
    const wrapper = document.getElementById('notebook-pages-wrapper');
    if (!wrapper) return;
    const val = parseFloat(scale) || 1.0;
    wrapper.classList.remove('zoom-75', 'zoom-90', 'zoom-100', 'zoom-115', 'zoom-125');
    if (Math.abs(val - 0.75) < 0.05) wrapper.classList.add('zoom-75');
    else if (Math.abs(val - 0.90) < 0.05) wrapper.classList.add('zoom-90');
    else if (Math.abs(val - 1.15) < 0.05) wrapper.classList.add('zoom-115');
    else if (Math.abs(val - 1.25) < 0.05) wrapper.classList.add('zoom-125');
    else wrapper.classList.add('zoom-100');
  },

  insertCallout(type) {
    let calloutHtml = '';
    switch (type) {
      case 'concept':
        calloutHtml = `
          <div class="notebook-callout concept">
            <strong>📌 Concepto Clave:</strong>
            <p>Escribe aquí el principio o definición importante...</p>
          </div><p></p>
        `;
        break;
      case 'activity':
        calloutHtml = `
          <div class="notebook-callout activity">
            <strong>✍️ Actividad en Clase:</strong>
            <p>Escribe aquí la consigna del ejercicio práctico...</p>
          </div><p></p>
        `;
        break;
      case 'homework':
        calloutHtml = `
          <div class="notebook-callout homework">
            <strong>🏠 Compromiso / Tarea para la Casa:</strong>
            <p>Escribe aquí las tareas o consultas asignadas...</p>
          </div><p></p>
        `;
        break;
    }
    document.execCommand('insertHTML', false, calloutHtml);
  },

  insertTable() {
    const tableHtml = `
      <table class="notebook-embedded-table">
        <thead>
          <tr>
            <th>Concepto / Criterio</th>
            <th>Descripción / Procedimiento</th>
            <th>Resultado / Observaciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Paso 1</td>
            <td>Escribe aquí el procedimiento...</td>
            <td>Dato 1</td>
          </tr>
          <tr>
            <td>Paso 2</td>
            <td>Escribe aquí el procedimiento...</td>
            <td>Dato 2</td>
          </tr>
        </tbody>
      </table><p></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
  },

  compressAndInsertImage(dataUrl, name, maxWidth = 1000, quality = 0.82) {
    const img = new Image();
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        const imgHtml = `
          <div style="text-align: center; margin: 1rem 0;">
            <img src="${compressedDataUrl}" alt="Figura de clase" class="notebook-embedded-img" />
            <div style="font-size:0.75rem; color:#64748b; font-style:italic; margin-top:4px;">${this.escapeHtml(name)}</div>
          </div><p></p>
        `;
        document.execCommand('insertHTML', false, imgHtml);
        this.schedulePagination(150);
        this.saveCurrentNotebookContent(false);
      } catch (err) {
        // Fallback en caso de error con canvas
        const imgHtml = `
          <div style="text-align: center; margin: 1rem 0;">
            <img src="${dataUrl}" alt="Figura de clase" class="notebook-embedded-img" />
            <div style="font-size:0.75rem; color:#64748b; font-style:italic; margin-top:4px;">${this.escapeHtml(name)}</div>
          </div><p></p>
        `;
        document.execCommand('insertHTML', false, imgHtml);
        this.schedulePagination(150);
        this.saveCurrentNotebookContent(false);
      }
    };
    img.onerror = () => {
      const imgHtml = `
        <div style="text-align: center; margin: 1rem 0;">
          <img src="${dataUrl}" alt="Figura de clase" class="notebook-embedded-img" />
          <div style="font-size:0.75rem; color:#64748b; font-style:italic; margin-top:4px;">${this.escapeHtml(name)}</div>
        </div><p></p>
      `;
      document.execCommand('insertHTML', false, imgHtml);
      this.schedulePagination(150);
      this.saveCurrentNotebookContent(false);
    };
    img.src = dataUrl;
  },

  handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.compressAndInsertImage(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  },

  toggleTemplatesMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('notebook-templates-menu');
    if (menu) menu.classList.toggle('show');
  },

  applyTemplate(type) {
    const menu = document.getElementById('notebook-templates-menu');
    if (menu) menu.classList.remove('show');

    if (!confirm('¿Deseas aplicar esta plantilla didáctica? Se insertará en el cuaderno.')) return;

    const canvas = document.getElementById('notebook-editable-canvas');
    if (!canvas) return;

    let tplHtml = '';
    const cls = this.currentClassData || {};

    if (type === 'math') {
      tplHtml = `
        <h2>📐 1. Propósito y Saberes Previos</h2>
        <p>Repaso de conceptos algebraicos y numéricos requeridos para la sesión.</p>

        <h2>📊 2. Modelado Matemático y Fórmulas Clave</h2>
        <div class="notebook-callout concept">
          <strong>📌 Definición y Regla Matemática:</strong>
          <p>Escribe las ecuaciones y propiedades principales aquí...</p>
        </div>

        <h2>✍️ 3. Ejercicios Resueltos Paso a Paso</h2>
        <p><strong>Ejemplo 1:</strong> Planteamiento y solución guiada del problema.</p>

        <h2>📝 4. Taller de Aplicación Individual y en Parejas</h2>
        <ol>
          <li>Ejercicio de afianzamiento 1.</li>
          <li>Ejercicio de afianzamiento 2.</li>
          <li>Problema en contexto real.</li>
        </ol>

        <div class="notebook-callout homework">
          <strong>🏠 Tarea:</strong>
          <p>Resolver los ejercicios complementarios del libro / guía de trabajo.</p>
        </div>
      `;
    } else if (type === 'lab') {
      tplHtml = `
        <h2>🤖 1. Objetivo de la Práctica de Laboratorio</h2>
        <p>Desarrollo y montaje de prototipos, algoritmos y conexiones electrónicas.</p>

        <h2>🛠️ 2. Materiales y Recursos Necesarios</h2>
        <ul>
          <li>Computador / Software de simulación</li>
          <li>Placa Arduino / Componentes electrónicos</li>
          <li>Sensores y cables de conexión</li>
        </ul>

        <h2>⚙️ 3. Procedimiento y Diagrama de Conexión</h2>
        <div class="notebook-callout concept">
          <strong>📌 Circuito / Algoritmo:</strong>
          <p>Inserta aquí el diagrama o pseudocódigo de la práctica...</p>
        </div>

        <h2>🧪 4. Resultados y Tabla de Datos</h2>
        <p>Registro de mediciones y comportamiento del sistema.</p>

        <div class="notebook-callout activity">
          <strong>✍️ Conclusiones y Reto:</strong>
          <p>Optimizar el funcionamiento y documentar el código.</p>
        </div>
      `;
    } else if (type === 'robotics10') {
      tplHtml = `
        <h2>🦾 1. Situación Problémica y Estándar Institucional</h2>
        <div class="notebook-callout concept">
          <strong>❓ Pregunta Problematizadora:</strong>
          <p>¿Cómo transformar señales analógicas de un módulo joystick en trayectorias mecánicas angulares para accionar una pinza robótica articulada mediante servomotores y engranajes?</p>
          <strong>🎯 Estándar:</strong>
          <p>Analizo y seleccionar componentes electrónicos, sistemas de modelado digital y estructuras de control por software para integrarlos en un prototipo mecatrónico funcional.</p>
        </div>

        <h2>🛠️ 2. Materiales y Recursos Mecatrónicos</h2>
        <ul>
          <li><strong>Mecánica:</strong> Piezas 18 a 27 cortadas en acrílico/MDF de 3mm (escala 1:1), engranajes sincronizados 19 y 20, tornillería M3 con tuercas autoblocantes y arandelas antifricción.</li>
          <li><strong>Electrónica:</strong> Microcontrolador Arduino UNO, módulo joystick analógico de 2 ejes (X/Y) y pulsador Z, servomotor angular (MG995 / MG996R o SG90).</li>
          <li><strong>Potencia:</strong> Pack de baterías independiente (5V-6V) con masa común (GND compartido) para protección del microcontrolador.</li>
          <li><strong>Software e IA:</strong> Tinkercad Circuits, Arduino IDE con librería <code>Servo.h</code> y prompts técnicos para asistencia de IA.</li>
        </ul>

        <h2>⚡ 3. Esquema Eléctrico y Distribución de Pines</h2>
        <div class="notebook-callout code">
          <p><strong>Conexiones del Circuito:</strong></p>
          <ul>
            <li>Joystick VCC &rarr; 5V (Arduino) | Joystick GND &rarr; GND | Joystick VRx &rarr; Pin Analógico A0</li>
            <li>Servomotor Señal (Amarillo/Naranja) &rarr; Pin PWM 9 (Arduino)</li>
            <li>Servomotor VCC (Rojo) &rarr; Positivo (+) del Pack de Baterías (5V-6V)</li>
            <li>Servomotor GND (Marrón/Negro) &rarr; Negativo (-) del Pack de Baterías <strong>y GND de Arduino (Masa Común)</strong></li>
          </ul>
        </div>

        <h2>💻 4. Programación en C++ y Prompting Asistido por IA</h2>
        <div class="notebook-callout activity">
          <strong>🤖 Prompt Técnico Formulado:</strong>
          <p><em>"Genera un sketch en C++ para Arduino IDE que controle un servomotor en el pin PWM 9 usando las lecturas analógicas de un joystick en el pin A0. Incluye la librería Servo.h, configura Serial a 9600 bps, y utiliza la función map() para transformar el rango 0-1023 en un ángulo seguro entre 25° y 115° para no forzar los engranajes de la pinza..."</em></p>
        </div>

        <pre style="background:#1e293b; color:#f8fafc; padding:12px; border-radius:6px; font-size:0.82rem; overflow-x:auto;">
<code>#include &lt;Servo.h&gt;

Servo pinzaServo;
const int pinJoyX = A0;
const int pinServo = 9;

// Límites angulares mecánicos de calibración para proteger la pinza
const int ANGULO_MIN = 25;  // Pinza cerrada (sin forzar dientes)
const int ANGULO_MAX = 115; // Pinza abierta al límite de eslabones

void setup() {
  Serial.begin(9600);
  pinzaServo.attach(pinServo);
  pinzaServo.write(ANGULO_MIN);
  Serial.println("Pinza Robótica Inicializada con Éxito.");
}

void loop() {
  int valorJoy = analogRead(pinJoyX);
  // Transformación lineal de señal analógica a trayectoria angular
  int angulo = map(valorJoy, 0, 1023, ANGULO_MIN, ANGULO_MAX);
  angulo = constrain(angulo, ANGULO_MIN, ANGULO_MAX);
  
  pinzaServo.write(angulo);
  
  Serial.print("Lectura Joystick: ");
  Serial.print(valorJoy);
  Serial.print(" -> Ángulo Servomotor: ");
  Serial.println(angulo);
  
  delay(20); // Retardo cinemático de respuesta
}</code></pre>

        <h2>📐 5. Calibración Mecánica y Cinemática</h2>
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead>
            <tr style="background:#f1f5f9; text-align:left;">
              <th style="border:1px solid #cbd5e1; padding:6px;">Parámetro</th>
              <th style="border:1px solid #cbd5e1; padding:6px;">Valor Teórico</th>
              <th style="border:1px solid #cbd5e1; padding:6px;">Calibración Física</th>
              <th style="border:1px solid #cbd5e1; padding:6px;">Observación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #cbd5e1; padding:6px;">Cero Mecánico</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">0°</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">Ajustado en Chasis 18</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">Sin tensión previa</td>
            </tr>
            <tr>
              <td style="border:1px solid #cbd5e1; padding:6px;">Apertura Máxima</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">180°</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">115°</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">Evita desencajar piñones</td>
            </tr>
            <tr>
              <td style="border:1px solid #cbd5e1; padding:6px;">Cierre Seguro</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">0°</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">25°</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">No rompe dientes acrílicos</td>
            </tr>
          </tbody>
        </table>

        <h2>🏆 6. Desafío "Pick & Place" y Evaluación Formativa</h2>
        <div class="notebook-callout homework">
          <strong>📋 Criterios de Evaluación en Equipo (3 Estudiantes):</strong>
          <ul>
            <li><strong>Revisión Mecánica:</strong> Movimiento suave y sincronizado de los engranajes 19 y 20 sin atascos.</li>
            <li><strong>Sustentación de Código:</strong> Explicación oral de los bloques generados con IA y la función map.</li>
            <li><strong>Reto Funcional Pick & Place:</strong> Sujeción y traslado de 3 objetos sin vibración del motor.</li>
            <li><strong>Bitácora y Coevaluación:</strong> Registro de prompts, código final comentado y valoración interna entre pares.</li>
          </ul>
        </div>
      `;
    } else if (type === 'sistemas7') {
      tplHtml = `
        <h2>💻 1. Situación Problémica y Estándar Institucional</h2>
        <div class="notebook-callout concept">
          <strong>❓ Pregunta Problematizadora:</strong>
          <p>¿Cómo utilizar las herramientas de ofimática y creación de contenido digital para comunicar ideas con calidad profesional y creatividad?</p>
          <strong>🎯 Estándar de Competencia:</strong>
          <p>Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.</p>
        </div>

        <h2>🛠️ 2. Recursos Tecnológicos y Entorno de Trabajo</h2>
        <ul>
          <li><strong>Dispositivos:</strong> Computadores de escritorio, tabletas y celulares.</li>
          <li><strong>Software Ofimático y de Edición:</strong> Procesador de textos (Word/Docs), Hoja de cálculo (Excel/Sheets), Presentaciones interactivas (PowerPoint/Canva), Editor de video (Clipchamp, CapCut, Movie Maker).</li>
          <li><strong>Ecosistema Colaborativo:</strong> Almacenamiento en la nube (Google Drive/OneDrive) y portafolio digital.</li>
        </ul>

        <h2>⌨️ 3. Ficha Técnica y Procedimiento en la Sala de Sistemas</h2>
        <div class="notebook-callout activity">
          <strong>📌 Técnicas y Criterios Editoriales:</strong>
          <table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:0.85rem;">
            <thead>
              <tr style="background:#e0f2fe; text-align:left;">
                <th style="border:1px solid #bae6fd; padding:6px;">Eje Temático</th>
                <th style="border:1px solid #bae6fd; padding:6px;">Procedimiento / Comandos</th>
                <th style="border:1px solid #bae6fd; padding:6px;">Criterio de Calidad Editorial</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #e2e8f0; padding:6px;"><strong>Procesadores de texto</strong></td>
                <td style="border:1px solid #e2e8f0; padding:6px;">Jerarquía de títulos (Estilos), tablas con encabezados destacados y normas de formato digital.</td>
                <td style="border:1px solid #e2e8f0; padding:6px;">Estructura limpia, tabla de contenido automática y ortografía impecable.</td>
              </tr>
              <tr>
                <td style="border:1px solid #e2e8f0; padding:6px;"><strong>Hojas de cálculo</strong></td>
                <td style="border:1px solid #e2e8f0; padding:6px;">Fórmulas matemáticas y lógicas (=SUMA, =PROMEDIO, =SI), formato condicional y gráficos estadísticos.</td>
                <td style="border:1px solid #e2e8f0; padding:6px;">Automatización de cálculos, orden y gráficos claros con leyendas.</td>
              </tr>
              <tr>
                <td style="border:1px solid #e2e8f0; padding:6px;"><strong>Presentaciones interactivas</strong></td>
                <td style="border:1px solid #e2e8f0; padding:6px;">Diapositivas dinámicas, hipervínculos, botones de acción y multimedia interactiva.</td>
                <td style="border:1px solid #e2e8f0; padding:6px;">Contraste visual de alto impacto, armonía cromática y síntesis de ideas.</td>
              </tr>
              <tr>
                <td style="border:1px solid #e2e8f0; padding:6px;"><strong>Edición de video digital</strong></td>
                <td style="border:1px solid #e2e8f0; padding:6px;">Importación de clips, cortes en la línea de tiempo, transiciones suaves, pistas de voz y música libre de copyright.</td>
                <td style="border:1px solid #e2e8f0; padding:6px;">Ritmo visual narrativo, audio ecualizado y exportación en HD (1080p).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>✍️ 4. Guía de Taller Práctico Paso a Paso</h2>
        <ol>
          <li><strong>Fase 1 (Exploración):</strong> Identifica el propósito comunicativo de la pieza digital y organiza el guion o bosquejo previo en tu libreta.</li>
          <li><strong>Fase 2 (Producción):</strong> Ejecuta la aplicación correspondiente aplicando normas de jerarquía, estilos y fórmulas precisas.</li>
          <li><strong>Fase 3 (Control de Calidad):</strong> Revisa la estética general, legibilidad tipográfica y funcionamiento de enlaces y fórmulas.</li>
          <li><strong>Fase 4 (Entrega en Nube):</strong> Exporta el entregable final y sincronízalo en tu carpeta de Google Drive o portafolio digital institucional.</li>
        </ol>

        <h2>📋 5. Rúbrica de Evaluación Formativa e Integral</h2>
        <div class="notebook-callout homework">
          <strong>🏆 Indicadores de Desempeño Evaluados:</strong>
          <ul>
            <li><strong>Gestión Documental:</strong> Estructura documentos complejos con estilos, tablas y diseño editorial riguroso.</li>
            <li><strong>Análisis y Lógica de Datos:</strong> Automatiza operaciones numéricas y representa gráficamente la información.</li>
            <li><strong>Diseño y Creatividad Digital:</strong> Diseña piezas gráficas y presentaciones interactivas con armonía estética.</li>
            <li><strong>Producción Audiovisual:</strong> Edita secuencias de video aplicando criterios técnicos de corte, sonido y ritmo.</li>
            <li><strong>Ética y Calidad:</strong> Evalúa la veracidad y pertinencia del contenido digital respetando derechos de autor.</li>
          </ul>
        </div>
      `;
    } else if (type === 'eval') {
      tplHtml = `
        <h2>📋 EVALUACIÓN PEDAGÓGICA DE PERIODO</h2>
        <p><strong>Criterios de Evaluación:</strong> Comprensión conceptual, argumentación y resolución de situaciones problema.</p>

        <h2>PARTE 1: Preguntas de Selección Múltiple y Análisis</h2>
        <ol>
          <li><strong>Pregunta 1:</strong> Enunciado de la situación problema...</li>
          <li><strong>Pregunta 2:</strong> Enunciado de la situación problema...</li>
        </ol>

        <h2>PARTE 2: Desarrollo y Procedimiento Justificado</h2>
        <p>Resuelve detallando cada paso del algoritmo o demostración.</p>
      `;
    } else {
      tplHtml = this.generateDefaultContentFromClass(cls);
    }

    canvas.innerHTML = tplHtml;
    App.showToast('Plantilla didáctica aplicada al cuaderno', 'success');
  },

  saveCurrentNotebookContent(showToast = true) {
    clearTimeout(this._debounceSave);
    if (this.currentClassIndex === null) return;

    const sheets = Array.from(document.querySelectorAll('.notebook-editable-content'));
    if (!sheets || sheets.length === 0) return;

    // Guardar únicamente páginas con contenido visual real
    const hasAnyRealContent = sheets.some(s => !this.isContentEmpty(s));
    let combinedHtml = '';
    if (hasAnyRealContent) {
      const validPagesHtml = [];
      sheets.forEach((s, idx) => {
        const hasContent = !this.isContentEmpty(s);
        if (hasContent || (idx === 0 && validPagesHtml.length === 0)) {
          validPagesHtml.push(s.innerHTML.trim());
        }
      });
      combinedHtml = validPagesHtml.join('<div class="notebook-page-break" data-page-break="true"></div>');
    } else {
      combinedHtml = '';
    }

    const hdrTopic = document.getElementById('hdr-edit-topic');
    const hdrDba = document.getElementById('hdr-edit-dba');
    const hdrAch = document.getElementById('hdr-edit-achievement');
    const hdrObs = document.getElementById('hdr-edit-observations');

    const isDirGroup = this.currentClassData?.subject && String(this.currentClassData.subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');

    const topicVal = isDirGroup ? '' : (hdrTopic ? hdrTopic.innerText.trim() : (this.currentClassData?.topic || ''));
    const dbaVal = isDirGroup ? '' : (hdrDba ? hdrDba.innerText.trim() : (this.currentClassData?.dba || ''));
    const achVal = isDirGroup ? '' : (hdrAch ? hdrAch.innerText.trim() : (this.currentClassData?.achievement || ''));
    const obsVal = hdrObs ? hdrObs.innerText.trim() : (this.currentClassData?.observations || '');

    if (this.currentClassData) {
      this.currentClassData.notebookContent = combinedHtml;
      this.currentClassData.topic = topicVal;
      this.currentClassData.dba = dbaVal;
      this.currentClassData.achievement = achVal;
      this.currentClassData.observations = obsVal;
    }

    const dateStr = this.currentDateStr || window.Planner?.currentDateStr;

    // Actualizar objeto en memoria de Planner si está cargado
    if (window.Planner && window.Planner.currentPlan && window.Planner.currentPlan.classes && window.Planner.currentPlan.classes[this.currentClassIndex]) {
      const cls = window.Planner.currentPlan.classes[this.currentClassIndex];
      cls.notebookContent = combinedHtml;
      cls.topic = topicVal;
      cls.dba = dbaVal;
      cls.achievement = achVal;
      cls.observations = obsVal;
    }

    // Persistencia directa e inmediata en StorageService
    if (dateStr) {
      let planToSave = (window.Planner && window.Planner.currentPlan && window.Planner.currentPlan.classes)
        ? window.Planner.currentPlan
        : (StorageService.getPlanByDate ? StorageService.getPlanByDate(dateStr) : StorageService.getPlan(dateStr));

      if (planToSave && planToSave.classes && planToSave.classes[this.currentClassIndex]) {
        const cls = planToSave.classes[this.currentClassIndex];
        cls.notebookContent = combinedHtml;
        cls.topic = topicVal;
        cls.dba = dbaVal;
        cls.achievement = achVal;
        cls.observations = obsVal;
        StorageService.savePlan(dateStr, planToSave);
      }
    }

    if (showToast && typeof App !== 'undefined' && App.showToast) {
      const mirrorGrade = typeof StorageService !== 'undefined' && StorageService.getParallelGrade
        ? StorageService.getParallelGrade(this.currentClassData?.subject, this.currentClassData?.grade)
        : null;
      if (mirrorGrade) {
        App.showToast(`Cuaderno guardado y sincronizado automáticamente con ${mirrorGrade}`, 'success');
      } else {
        App.showToast('Cuaderno de clase guardado con éxito', 'success');
      }
    }
  },

  openAttachments() {
    if (this.currentClassIndex !== null && typeof Planner !== 'undefined' && Planner.openClassAttachmentsModal) {
      Planner.openClassAttachmentsModal(this.currentClassIndex);
    } else {
      alert('Debes tener una clase seleccionada para gestionar sus archivos.');
    }
  },

  printNotebook() {
    this.saveCurrentNotebookContent(false);

    const sheets = Array.from(document.querySelectorAll('.notebook-editable-content'));
    if (!sheets || sheets.length === 0) return;

    // Filtrar hojas vacías para que jamás se imprima una hoja en blanco con solo encabezado y pie
    const validSheets = sheets.filter((s, idx) => {
      if (idx === 0 && sheets.length === 1) return true;
      return !this.isContentEmpty(s);
    });
    const finalSheets = validSheets.length > 0 ? validSheets : [sheets[0]];

    const pagesHtml = finalSheets.map(s => s.innerHTML);
    const totalPages = pagesHtml.length;

    const profile = StorageService.getProfile();
    const logoUrl = ExportService.LOGO_BASE64 || 'img/logo_colegio.png';
    const cls = this.currentClassData;
    const classNum = parseInt(String(cls?.dayNumber || (this.currentClassIndex + 1)).replace(/[^0-9]/g, ''), 10) || 1;
    const isDirGroup = cls?.subject && String(cls.subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
    const isFirstClassOfPeriod = classNum === 1 && !isDirGroup;

    let pagesBodyHtml = '';
    pagesHtml.forEach((pageHtml, pIdx) => {
      pagesBodyHtml += `
        <div class="notebook-print-page">
          ${pIdx === 0 ? `
            <div class="notebook-print-header">
              <img src="${logoUrl}" class="notebook-print-logo" alt="Logo" />
              <div class="notebook-print-title-box">
                <h1>${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}</h1>
                <h2>CUADERNO Y GUÍA DIDÁCTICA DE APRENDIZAJE</h2>
              </div>
              <div style="text-align:right; font-size:10pt; font-weight:bold; color:#2563eb;">
                CLASE #${this.escapeHtml(cls?.dayNumber || '')}
              </div>
            </div>

            <table class="notebook-meta-table">
              <tr>
                <td><strong>Docente:</strong> ${this.escapeHtml(profile.name || 'Manuel Muñoz')}</td>
                <td><strong>Asignatura:</strong> ${this.escapeHtml(cls?.subject || '')}</td>
                <td><strong>Grado:</strong> ${this.escapeHtml(cls?.grade || '')}</td>
              </tr>
              <tr>
                <td><strong>Fecha:</strong> ${this.escapeHtml(window.Planner?.formatFullDate ? window.Planner.formatFullDate(this.currentDateStr) : this.currentDateStr)}</td>
                <td><strong>Periodo:</strong> ${this.escapeHtml(window.Planner?.currentPlan?.period || profile?.period || '1°')}</td>
                <td><strong>Día:</strong> ${this.escapeHtml(cls?.dayOfWeek || '')}</td>
              </tr>
              ${isFirstClassOfPeriod && cls?.topic ? `<tr><td colspan="3"><strong>📌 Eje Temático:</strong> ${this.escapeHtml(cls.topic)}</td></tr>` : ''}
              ${isFirstClassOfPeriod && cls?.dba ? `<tr><td colspan="3"><strong>🎯 Estándar / DBA:</strong><br/>${this.escapeHtml(cls.dba).replace(/\n/g, '<br/>')}</td></tr>` : ''}
              ${isFirstClassOfPeriod && cls?.achievement ? `<tr><td colspan="3"><strong>🏆 Indicador(es) de Desempeño:</strong><br/>${this.escapeHtml(cls.achievement).replace(/\n/g, '<br/>')}</td></tr>` : ''}
            </table>
          ` : `
            <div class="notebook-print-cont-header">
              <span style="font-weight:700; color:#1e3a8a;">${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')} • GUÍA PEDAGÓGICA</span>
              <span>${this.escapeHtml(cls?.subject || '')} (${this.escapeHtml(cls?.grade || '')}) • CLASE #${this.escapeHtml(cls?.dayNumber || '')} (Continuación)</span>
            </div>
          `}

          <div class="notebook-content-body">
            ${pageHtml}
          </div>

          <div class="notebook-print-footer">
            <div>Preparado por: ${this.escapeHtml(profile.name || 'Docente')} • ${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}</div>
            <div>Página ${pIdx + 1} de ${totalPages}</div>
          </div>
        </div>
      `;
    });

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Cuaderno de Clase - ${this.escapeHtml(this.currentClassData?.subject || 'Clase')}</title>
        <style>
          @page {
            size: letter portrait;
            margin: 1.2cm 1.4cm 1.2cm 1.4cm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            line-height: 1.45;
            font-size: 10pt;
          }
          .notebook-print-page {
            box-sizing: border-box;
            width: 100%;
            height: 25.3cm;
            max-height: 25.3cm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
            overflow: hidden;
            padding: 0;
            margin: 0;
          }
          .notebook-print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .notebook-print-header {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 0.5rem;
            margin-bottom: 0.65rem;
          }
          .notebook-print-logo {
            width: 65px;
            height: auto;
            object-fit: contain;
          }
          .notebook-print-title-box {
            flex: 1;
          }
          .notebook-print-title-box h1 {
            margin: 0;
            font-size: 13pt;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .notebook-print-title-box h2 {
            margin: 2px 0 0;
            font-size: 10pt;
            color: #475569;
            font-weight: 600;
          }
          .notebook-meta-table {
            flex-shrink: 0;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0.8rem;
            font-size: 9pt;
            background: #f8fafc;
          }
          .notebook-meta-table td {
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
          }
          .notebook-meta-table strong {
            color: #1e293b;
          }
          .notebook-print-cont-header {
            flex-shrink: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #2563eb;
            padding-bottom: 3px;
            margin-bottom: 0.65rem;
            font-size: 8.5pt;
            color: #475569;
          }
          .notebook-content-body {
            flex: 1 1 auto;
            min-height: 0;
            overflow: hidden;
          }
          .notebook-print-footer {
            flex-shrink: 0;
            margin-top: auto;
            padding-top: 0.35rem;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            color: #64748b;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          h1, h2, h3 {
            color: #1e3a8a;
            page-break-after: avoid;
          }
          h2 {
            font-size: 11.5pt;
            margin-top: 0.75rem;
            margin-bottom: 0.25rem;
          }
          h3 {
            font-size: 10.5pt;
            margin-top: 0.5rem;
            margin-bottom: 0.2rem;
          }
          p {
            margin: 0.3rem 0;
          }
          ul, ol {
            margin: 0.3rem 0;
            padding-left: 1.25rem;
          }
          li {
            margin: 0.12rem 0;
          }
          .notebook-callout {
            border-radius: 6px;
            padding: 0.6rem 0.85rem;
            margin: 0.6rem 0;
            page-break-inside: avoid;
          }
          .notebook-callout.concept {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            color: #1e40af;
          }
          .notebook-callout.activity {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            color: #166534;
          }
          .notebook-callout.homework {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            color: #92400e;
          }
          .notebook-embedded-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0.8rem 0;
            font-size: 9.5pt;
            page-break-inside: avoid;
          }
          .notebook-embedded-table th, .notebook-embedded-table td {
            border: 1px solid #94a3b8;
            padding: 5px 8px;
          }
          .notebook-embedded-table th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
          }
          .notebook-embedded-img {
            max-width: 90%;
            height: auto;
            border-radius: 6px;
            display: block;
            margin: 0.5rem auto;
            page-break-inside: avoid;
          }
          .notebook-two-columns {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1.2rem !important;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .notebook-columns-flow {
            column-count: 2 !important;
            column-gap: 1.5rem !important;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        ${pagesBodyHtml}

        <script>
          window.onafterprint = function() {
            try {
              if (window.parent && window.parent !== window) {
                const f = window.parent.document.getElementById('notebook-hidden-print-frame');
                if (f) f.remove();
              } else {
                window.close();
              }
            } catch(e) {
              window.close();
            }
          };
        </script>
      </body>
      </html>
    `;

    this.printViaHiddenFrame(printableHtml);
  },

  openAllNotebooksForDay() {
    if (!window.Planner || !window.Planner.currentPlan || !window.Planner.currentPlan.classes.length) {
      App.showToast('No hay clases registradas en este día para imprimir el folleto', 'warning');
      return;
    }

    window.Planner.collectDataFromDOM();
    const profile = StorageService.getProfile();
    const plan = window.Planner.currentPlan;
    const formattedDate = window.Planner.formatFullDate ? window.Planner.formatFullDate(window.Planner.currentDateStr) : window.Planner.currentDateStr;
    const logoUrl = ExportService.LOGO_BASE64 || 'img/logo_colegio.png';

    let bookletClassesHtml = '';

    plan.classes.forEach((cls, i) => {
      let content = cls.notebookContent || this.generateDefaultContentFromClass(cls);
      if (content && content.includes('notebook-page-break')) {
        const parts = content.split(/<div class="notebook-page-break"[^>]*><\/div>/gi);
        const validParts = parts.filter((p, pIdx) => {
          if (pIdx === 0) return true;
          const clean = (p || '').replace(/<[^>]+>/g, '').replace(/[\s\u00a0\u200B]+/g, '');
          return clean.length > 0 || /<(img|table|iframe|hr|svg|canvas)[^>]*>/i.test(p);
        });
        content = validParts.join('<div class="notebook-page-break" data-page-break="true"></div>');
      }
      const classNum = parseInt(String(cls.dayNumber || String(i + 1)).replace(/[^0-9]/g, ''), 10) || 1;
      const isDirGroup = cls?.subject && String(cls.subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
      const isFirstClassOfPeriod = classNum === 1 && !isDirGroup;

      bookletClassesHtml += `
        <div class="booklet-class-section" style="${i > 0 ? 'page-break-before: always; margin-top: 2rem;' : ''}">
          <div class="notebook-print-header">
            <img src="${logoUrl}" class="notebook-print-logo" alt="Logo" />
            <div class="notebook-print-title-box">
              <h1>${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}</h1>
              <h2>GUÍA PEDAGÓGICA Y CUADERNO DE TRABAJO</h2>
            </div>
            <div style="text-align:right; font-size:10pt; font-weight:bold; color:#2563eb;">
              CLASE #${this.escapeHtml(cls.dayNumber || String(i + 1))}
            </div>
          </div>

          <table class="notebook-meta-table">
            <tr>
              <td><strong>Docente:</strong> ${this.escapeHtml(profile.name || 'Manuel Muñoz')}</td>
              <td><strong>Asignatura:</strong> ${this.escapeHtml(cls.subject)}</td>
              <td><strong>Grado:</strong> ${this.escapeHtml(cls.grade)}</td>
            </tr>
            <tr>
              <td><strong>Fecha:</strong> ${this.escapeHtml(formattedDate)}</td>
              <td><strong>Periodo:</strong> ${this.escapeHtml(plan.period || profile?.period || '1°')}</td>
              <td><strong>Día:</strong> ${this.escapeHtml(cls.dayOfWeek || '')}</td>
            </tr>
            ${isFirstClassOfPeriod && cls.topic ? `<tr><td colspan="3"><strong>📌 Eje Temático:</strong> ${this.escapeHtml(cls.topic)}</td></tr>` : ''}
            ${isFirstClassOfPeriod && cls.dba ? `<tr><td colspan="3"><strong>🎯 Estándar / DBA:</strong><br/>${this.escapeHtml(cls.dba).replace(/\n/g, '<br/>')}</td></tr>` : ''}
            ${isFirstClassOfPeriod && cls.achievement ? `<tr><td colspan="3"><strong>🏆 Indicador(es) de Desempeño:</strong><br/>${this.escapeHtml(cls.achievement).replace(/\n/g, '<br/>')}</td></tr>` : ''}
          </table>

          <div class="notebook-content-body">
            ${content}
          </div>

          <div class="notebook-print-footer">
            <div>Preparado por: ${this.escapeHtml(profile.name || 'Docente')} • ${this.escapeHtml(profile.institution || 'COLEGIO HOGAR MADRE DE DIOS')}</div>
            <div>Firma del Docente: _______________________</div>
          </div>
        </div>
      `;
    });

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Folleto de Cuadernos del Día - ${this.escapeHtml(formattedDate)}</title>
        <style>
          @page {
            size: letter portrait;
            margin: 1.2cm 1.4cm 1.2cm 1.4cm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            line-height: 1.45;
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-size: 10pt;
          }
          .notebook-print-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
          }
          .notebook-print-logo {
            width: 65px;
            height: auto;
            object-fit: contain;
          }
          .notebook-print-title-box {
            flex: 1;
          }
          .notebook-print-title-box h1 {
            margin: 0;
            font-size: 13pt;
            color: #1e3a8a;
            text-transform: uppercase;
          }
          .notebook-print-title-box h2 {
            margin: 2px 0 0;
            font-size: 10.5pt;
            color: #475569;
            font-weight: 600;
          }
          .notebook-meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1.25rem;
            font-size: 9.5pt;
            background: #f8fafc;
          }
          .notebook-meta-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
          }
          .notebook-meta-table strong {
            color: #1e293b;
          }
          h1, h2, h3 {
            color: #1e3a8a;
            page-break-after: avoid;
          }
          h2 {
            font-size: 12pt;
            margin-top: 1.2rem;
          }
          h3 {
            font-size: 11pt;
          }
          p {
            margin: 0.5rem 0;
          }
          .notebook-callout {
            border-radius: 6px;
            padding: 0.75rem 1rem;
            margin: 0.75rem 0;
            page-break-inside: avoid;
          }
          .notebook-callout.concept {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            color: #1e40af;
          }
          .notebook-callout.activity {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            color: #166534;
          }
          .notebook-callout.homework {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            color: #92400e;
          }
          .notebook-embedded-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 10pt;
            page-break-inside: avoid;
          }
          .notebook-embedded-table th, .notebook-embedded-table td {
            border: 1px solid #94a3b8;
            padding: 6px 10px;
          }
          .notebook-embedded-table th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
          }
          .notebook-embedded-img {
            max-width: 90%;
            height: auto;
            border-radius: 6px;
            display: block;
            margin: 0.5rem auto;
            page-break-inside: avoid;
          }
          .notebook-two-columns {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5rem !important;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .notebook-columns-flow {
            column-count: 2 !important;
            column-gap: 2rem !important;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .notebook-print-footer {
            margin-top: 1rem;
            padding-top: 0.5rem;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            color: #64748b;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${bookletClassesHtml}

        <script>
          window.onafterprint = function() {
            try {
              if (window.parent && window.parent !== window) {
                const f = window.parent.document.getElementById('notebook-hidden-print-frame');
                if (f) f.remove();
              } else {
                window.close();
              }
            } catch(e) {
              window.close();
            }
          };
        </script>
      </body>
      </html>
    `;

    this.printViaHiddenFrame(printableHtml);
  },

  printViaHiddenFrame(printableHtml) {
    let frame = document.getElementById('notebook-hidden-print-frame');
    if (frame) {
      frame.remove();
    }
    frame = document.createElement('iframe');
    frame.id = 'notebook-hidden-print-frame';
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.style.visibility = 'hidden';
    document.body.appendChild(frame);

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(printableHtml);
    doc.close();

    setTimeout(() => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (err) {
        console.warn('Fallback a ventana de impresión emergente:', err);
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.open();
          printWin.document.write(printableHtml);
          printWin.document.close();
        }
      }
    }, 400);
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

window.NotebookEditor = NotebookEditor;

// Auto-guardado de seguridad inmediato antes de cerrar la ventana o cambiar de pestaña
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('beforeunload', () => {
    if (window.NotebookEditor && typeof window.NotebookEditor.saveCurrentNotebookContent === 'function') {
      window.NotebookEditor.saveCurrentNotebookContent(false);
    }
  });

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && window.NotebookEditor && typeof window.NotebookEditor.saveCurrentNotebookContent === 'function') {
        window.NotebookEditor.saveCurrentNotebookContent(false);
      }
    });
  }

  // Atajo global Ctrl+S, Ctrl+Z, Ctrl+Y cuando el editor de cuaderno está activo
  window.addEventListener('keydown', (e) => {
    const mount = document.getElementById('notebook-mount-point');
    if (!mount || !mount.querySelector('.notebook-fullpage-card') || !window.NotebookEditor) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      window.NotebookEditor.saveCurrentNotebookContent(false);
      window.NotebookEditor.updateAutoSaveStatus('saved');
    } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      window.NotebookEditor.undo();
    } else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
      e.preventDefault();
      window.NotebookEditor.redo();
    }
  });
}
