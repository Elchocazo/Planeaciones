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
  _savedSelectionRange: null,
  _boundSelectionChange: false,

  /**
   * Guarda de manera segura el rango de selección activo dentro del editor
   */
  _saveSelection() {
    try {
      const editor = document.getElementById('notebook-single-editor');
      if (!editor || editor.offsetParent === null) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
          this._savedSelectionRange = range.cloneRange();
        }
      }
    } catch (e) {
      // Ignorar errores en estados de selección no estándar
    }
  },

  /**
   * Restaura el rango de selección previamente guardado y devuelve el foco al editor.
   * Si no había rango guardado, sitúa el cursor al final del contenido del editor.
   */
  _restoreSelection() {
    try {
      const editor = document.getElementById('notebook-single-editor');
      if (!editor) return;
      editor.focus();
      const sel = window.getSelection();
      if (this._savedSelectionRange) {
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(this._savedSelectionRange);
        }
      } else {
        const newRange = document.createRange();
        newRange.selectNodeContents(editor);
        newRange.collapse(false);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        this._savedSelectionRange = newRange.cloneRange();
      }
    } catch (e) {
      // Ignorar fallos al restaurar
    }
  },

  /**
   * Obtiene el bloque contenedor semántico (p, h1-h6, li, blockquote, div) que encierra el cursor
   */
  _getEnclosingBlock() {
    const editor = document.getElementById('notebook-single-editor');
    if (!editor) return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.getRangeAt(0).commonAncestorContainer;
    while (node && node !== editor) {
      if (node.nodeType === 1 && /^(p|h1|h2|h3|h4|h5|h6|li|blockquote|div)$/i.test(node.tagName)) {
        if (!node.classList.contains('notebook-callout') && !node.classList.contains('notebook-paper-container')) {
          return node;
        }
      }
      node = node.parentNode;
    }
    return null;
  },

  /**
   * Envuelve la selección activa con un span con estilos directos
   */
  _wrapSelectionWithStyle(stylesObj) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    Object.assign(span.style, stylesObj);
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
  },

  /**
   * Inserta fragmento HTML de forma segura en la posición del cursor, con fallback al DOM
   */
  _insertHtmlAtCursor(html) {
    this._restoreSelection();
    let success = false;
    try {
      success = document.execCommand('insertHTML', false, html);
    } catch (e) {}

    if (!success) {
      const editor = document.getElementById('notebook-single-editor');
      if (!editor) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
          const temp = document.createElement('div');
          temp.innerHTML = html;
          const frag = document.createDocumentFragment();
          let lastNode = null;
          while (temp.firstChild) {
            lastNode = temp.firstChild;
            frag.appendChild(temp.firstChild);
          }
          range.deleteContents();
          range.insertNode(frag);
          if (lastNode) {
            const nextRange = document.createRange();
            nextRange.setStartAfter(lastNode);
            nextRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(nextRange);
          }
          success = true;
        }
      }
      if (!success) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        while (temp.firstChild) {
          editor.appendChild(temp.firstChild);
        }
      }
    }
    this._saveSelection();
    this.triggerAutoSave(false);
    this._updateWordCount();
  },

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
    this._savedSelectionRange = null;

    const mount = document.getElementById('notebook-mount-point');
    if (!mount) return;

    const isCoord = (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) ||
                    (typeof AuthModal !== 'undefined' && AuthModal.getSession && AuthModal.getSession()?.role === 'coordinator');

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
              ${isCoord ? `
                <span class="badge-autosave" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:0.8rem; font-weight:700; padding:4px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                  🎓 Solo Lectura • Coordinación
                </span>
                <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.exportWordDocx()" title="Descargar como documento de Word (.doc)" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700;">
                  📄 Word (.doc)
                </button>
                <button type="button" class="btn btn-primary btn-sm" onclick="NotebookEditor.printNotebook()" title="Imprimir o exportar a PDF">
                  🖨️ PDF
                </button>
              ` : `
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

                <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.openImportModal()" title="Importar planeación o guía sobre este cuaderno" style="font-weight:700; color:#1d4ed8; background:#eff6ff; border-color:#bfdbfe; display:inline-flex; align-items:center; gap:5px;">
                  📥 Importar
                </button>

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
              `}
            </div>
          </div>

          <!-- Barra de Herramientas Estilo Word / Google Docs -->
          <div class="notebook-word-toolbar" id="notebook-word-toolbar" style="${isCoord ? 'display:none;' : ''}">
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
              <label class="toolbar-btn color-label" title="Color de Texto" style="cursor:pointer; margin:0; position:relative;" onclick="this.querySelector('input').click()">
                <span style="font-weight:bold; color:#ef4444; border-bottom:2px solid #ef4444;">A</span>
                <input type="color" value="#1e293b" oninput="NotebookEditor.setTextColor(this.value)" onchange="NotebookEditor.setTextColor(this.value)" style="position:absolute; opacity:0; width:1px; height:1px; pointer-events:none;" />
              </label>
              <label class="toolbar-btn color-label" title="Resaltador" style="cursor:pointer; margin:0; position:relative;" onclick="this.querySelector('input').click()">
                <span style="background:#fef08a; padding:1px 4px; border-radius:2px; font-size:0.75rem;">🖍️</span>
                <input type="color" value="#fef08a" oninput="NotebookEditor.setHighlightColor(this.value)" onchange="NotebookEditor.setHighlightColor(this.value)" style="position:absolute; opacity:0; width:1px; height:1px; pointer-events:none;" />
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
              <label class="toolbar-btn" title="Insertar Imagen" style="cursor:pointer; margin:0; display:inline-flex; align-items:center; gap:3px; position:relative;" onclick="this.querySelector('input').click()">
                🖼️ Imagen
                <input type="file" accept="image/*" style="position:absolute; opacity:0; width:1px; height:1px; pointer-events:none;" onchange="NotebookEditor.handleImageUpload(event)" />
              </label>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertTable()" title="Insertar Tabla 3x3">
                📊 Tabla
              </button>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertLink()" title="Insertar Enlace (Ctrl+K)">
                🔗 Enlace
              </button>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCodeBlock()" title="Insertar Bloque de Código (C++, Arduino, Python, etc.)">
                💻 Código
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

            <div class="toolbar-divider"></div>

            <div class="toolbar-group" style="align-items:center; gap:4px;">
              <span style="font-size:0.75rem; font-weight:700; color:var(--slate-600); margin-left:2px;">📐 Margen:</span>
              <select id="nb-margin-select" class="form-input form-input-sm" onchange="NotebookEditor.setMargin(this.value)" style="font-size:0.78rem; padding:2px 6px; height:28px; width:auto; font-weight:600; cursor:pointer;" title="Márgenes de página">
                <option value="1.27" selected>Estrecho (1.27 cm)</option>
                <option value="2.0">Moderado (2.0 cm)</option>
                <option value="2.54">Normal (2.54 cm)</option>
                <option value="1.0">Compacto (1.0 cm)</option>
              </select>
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
              <div style="display:flex; gap:10px; align-items:center;">
                <span id="notebook-total-pages-badge" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:0.75rem; padding:2px 8px; border-radius:10px; border:1px solid #bae6fd;">1 Hoja</span>
                <span id="doc-word-count-badge" style="color:var(--slate-500); font-size:0.78rem;">0 palabras</span>
              </div>
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
   * Abre el modal de importación inteligente directamente sobre la clase activa del cuaderno
   */
  openImportModal() {
    if (typeof ImportModal !== 'undefined' && ImportModal.open) {
      let cls = this.currentClassData;
      if (!cls && this.currentClassId && typeof ClassRepository !== 'undefined') {
        cls = ClassRepository.getClass(this.currentClassId) || (ClassRepository.getClassById ? ClassRepository.getClassById(this.currentClassId) : null);
      }
      ImportModal.open(cls, (updatedClass) => {
        if (!updatedClass) return;
        if (this.currentClassId) {
          this.openByClassId(this.currentClassId, this.isStandalone);
        } else if (this.currentClassIndex !== null) {
          this.openForClass(this.currentClassIndex);
        }
        // Guardar automáticamente el cuaderno tras importar
        this.saveCurrentNotebookContent(false);
      });
    } else {
      alert('El asistente de importación no está disponible.');
    }
  },

  /**
   * Cierra el editor y vuelve a la vista de planeación
   */
  closeModal() {
    this.saveCurrentNotebookContent(false);
    this._savedSelectionRange = null;
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

    // Perfil de coordinación: modo solo lectura (antes no se declaraba aquí y lanzaba ReferenceError)
    const isCoord = (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) ||
                    (typeof AuthModal !== 'undefined' && AuthModal.getSession && AuthModal.getSession()?.role === 'coordinator');

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

              <button type="button" class="btn btn-secondary btn-sm" onclick="NotebookEditor.openImportModal()" title="Importar planeación o guía sobre este cuaderno" style="font-weight:700; color:#1d4ed8; background:#eff6ff; border-color:#bfdbfe; display:inline-flex; align-items:center; gap:5px;">
                📥 Importar
              </button>

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
              <label class="toolbar-btn color-label" title="Color de Texto" style="cursor:pointer; margin:0; position:relative;" onclick="this.querySelector('input').click()">
                <span style="font-weight:bold; color:#ef4444; border-bottom:2px solid #ef4444;">A</span>
                <input type="color" value="#1e293b" oninput="NotebookEditor.setTextColor(this.value)" onchange="NotebookEditor.setTextColor(this.value)" style="position:absolute; opacity:0; width:1px; height:1px; pointer-events:none;" />
              </label>
              <label class="toolbar-btn color-label" title="Resaltador" style="cursor:pointer; margin:0; position:relative;" onclick="this.querySelector('input').click()">
                <span style="background:#fef08a; padding:1px 4px; border-radius:2px; font-size:0.75rem;">🖍️</span>
                <input type="color" value="#fef08a" oninput="NotebookEditor.setHighlightColor(this.value)" onchange="NotebookEditor.setHighlightColor(this.value)" style="position:absolute; opacity:0; width:1px; height:1px; pointer-events:none;" />
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
              <label class="toolbar-btn" title="Insertar Imagen" style="cursor:pointer; margin:0; display:inline-flex; align-items:center; gap:3px; position:relative;" onclick="this.querySelector('input').click()">
                🖼️ Imagen
                <input type="file" accept="image/*" style="position:absolute; opacity:0; width:1px; height:1px; pointer-events:none;" onchange="NotebookEditor.handleImageUpload(event)" />
              </label>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertTable()" title="Insertar Tabla 3x3">
                📊 Tabla
              </button>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertLink()" title="Insertar Enlace (Ctrl+K)">
                🔗 Enlace
              </button>

              <button type="button" class="toolbar-btn" onclick="NotebookEditor.insertCodeBlock()" title="Insertar Bloque de Código (C++, Arduino, Python, etc.)">
                💻 Código
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

            <div class="toolbar-divider"></div>

            <div class="toolbar-group" style="align-items:center; gap:4px;">
              <span style="font-size:0.75rem; font-weight:700; color:var(--slate-600); margin-left:2px;">📐 Margen:</span>
              <select id="nb-margin-select-full" class="form-input form-input-sm" onchange="NotebookEditor.setMargin(this.value)" style="font-size:0.78rem; padding:2px 6px; height:28px; width:auto; font-weight:600; cursor:pointer;" title="Márgenes de página">
                <option value="1.27" selected>Estrecho (1.27 cm)</option>
                <option value="2.0">Moderado (2.0 cm)</option>
                <option value="2.54">Normal (2.54 cm)</option>
                <option value="1.0">Compacto (1.0 cm)</option>
              </select>
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
                 contenteditable="${isCoord ? 'false' : 'true'}"
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
              <textarea id="hdr-edit-observations" class="table-textarea" rows="4" ${isCoord ? 'readonly' : ''} style="width:100%; box-sizing:border-box; font-size:0.85rem; line-height:1.5; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:8px 10px; font-family:inherit; color:#1e293b; resize:none; overflow:hidden;" placeholder="${isCoord ? 'Sin observaciones del docente' : 'Redacta aquí observaciones específicas para esta sesión...'}">${this.escapeHtml(cls.observations || '')}</textarea>
            </div>

            <!-- Pie de Página Institucional -->
            <div class="notebook-document-footer">
              <span>${this.escapeHtml(profile.institution || 'Colegio Hogar Madre de Dios')}</span>
              <div style="display:flex; gap:10px; align-items:center;">
                <span id="notebook-total-pages-badge" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:0.75rem; padding:2px 8px; border-radius:10px; border:1px solid #bae6fd;">1 Hoja</span>
                <span id="doc-word-count-badge" style="color:var(--slate-500); font-size:0.78rem;">0 palabras</span>
              </div>
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
   * Si se detecta taller o actividad práctica, lo organiza en una hoja independiente con ficha institucional para el estudiante.
   */
  _prepareInitialHtml(cls) {
    let raw = '';
    if (cls) {
      // 1. Auto-recuperación de texto original: si notebookContent o studentNotebookContent están
      // truncados (< 100 caracteres) pero existe sourceText completo (> 200 caracteres),
      // re-analizamos con ImportParser para restaurar el contenido íntegro sin intervención manual.
      const parser = (typeof ImportParser !== 'undefined') ? ImportParser : (typeof window !== 'undefined' ? window.ImportParser : null);
      if (parser && cls.teacherNotebook?.sourceText && cls.teacherNotebook.sourceText.length > 200) {
        const studentNbLen = (cls.teacherNotebook?.studentNotebookContent || '').trim().length;
        const nbCleanLen = (cls.notebookContent || '').replace(/<[^>]+>/g, '').trim().length;
        if (studentNbLen < 100 || nbCleanLen < 100) {
          try {
            const reParsed = parser.parse(cls.teacherNotebook.sourceText);
            if (reParsed.teacherNotebook?.studentNotebookContent && reParsed.teacherNotebook.studentNotebookContent.length > studentNbLen) {
              cls.teacherNotebook.studentNotebookContent = reParsed.teacherNotebook.studentNotebookContent;
              if (reParsed.teacherNotebook.practicalActivity) {
                cls.teacherNotebook.practicalActivity = reParsed.teacherNotebook.practicalActivity;
              }
              if (reParsed.teacherNotebook.additionalNotes) {
                cls.teacherNotebook.additionalNotes = reParsed.teacherNotebook.additionalNotes;
              }
              if (reParsed.curriculum?.topic && (!cls.curriculum?.topic || cls.curriculum.topic.length < 20)) {
                if (!cls.curriculum) cls.curriculum = {};
                cls.curriculum.topic = reParsed.curriculum.topic;
                cls.topic = reParsed.curriculum.topic;
              }
              // Eliminar notebookContent truncado para que se regenere con el contenido restaurado
              delete cls.notebookContent;

              // Guardar la clase restaurada de forma persistente
              try {
                if (cls.id && typeof ClassRepository !== 'undefined' && ClassRepository.saveClass) {
                  ClassRepository.saveClass(cls, cls.teacherId);
                } else if (typeof StorageService !== 'undefined' && cls.date) {
                  const plan = StorageService.getPlanByDate(cls.date);
                  if (plan && plan.classes) {
                    const idx = plan.classes.findIndex(c => c.id === cls.id);
                    if (idx !== -1) {
                      plan.classes[idx] = cls;
                      StorageService.savePlan(cls.date, plan);
                    }
                  }
                }
              } catch (saveErr) {
                console.warn('[NotebookEditor] Error persistiendo clase auto-reparada:', saveErr);
              }
            }
          } catch (e) {
            console.warn('[NotebookEditor] Error en auto-recuperación de sourceText:', e);
          }
        }
      }

      // 2. Comprobar si notebookContent está truncado en comparación con studentNotebookContent
      const studentNb = cls.teacherNotebook?.studentNotebookContent || '';
      const detailed = cls.teacherNotebook?.detailedContent || '';
      const nbContent = cls.notebookContent || '';
      const isNbTruncated = nbContent.replace(/<[^>]+>/g, '').trim().length < 100 && studentNb.trim().length > 100;

      if (this.hasContent(nbContent) && !isNbTruncated) {
        raw = nbContent;
      } else if (this.hasContent(studentNb)) {
        raw = studentNb;
      } else if (this.hasContent(detailed)) {
        raw = detailed;
      } else if (this.hasContent(cls.didacticSequence?.desarrollo)) {
        const top = cls.curriculum?.topic || cls.topic || 'Desarrollo de la Clase';
        raw = `<h2>🎯 ${this.escapeHtml(top)}</h2>\n\n${cls.didacticSequence.desarrollo}`;
      }
    }

    // Comprobar si existe actividad práctica / taller registrada en la clase
    const practical = this.cleanDocumentArtifacts((cls?.teacherNotebook?.practicalActivity || cls?.practicalActivity || cls?.actividadPractica || cls?.taller || '').trim());

    // Limpiar posibles cabeceras truncadas o huérfanas como "TALLER / " o "TALLER:" al final del contenido
    if (raw) {
      raw = raw.replace(/(?:<p>\s*)?(?:•\s*)?TALLER\s*[\/:\-]?\s*(?:<\/p>)?\s*$/i, '').trim();
    }

    const subDisplay = cls?.subjectName || cls?.subject || 'Clase';
    const grdDisplay = cls?.gradeName || cls?.grade || '';
    const rawTopic = cls?.curriculum?.topic || cls?.topic || '';
    const cleanTopic = String(rawTopic).replace(/^[\s\*#_]+/, '').replace(/[\s\*#_]+$/, '').trim();

    // Salto de página explícito para garantizar que el taller inicie en hoja independiente
    const pageBreakHtml = '<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>';

    // Ficha de encabezado para el estudiante lista para imprimir y entregar
    const worksheetHeader = `
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc; page-break-inside:avoid; break-inside:avoid;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px;">✍️ Taller / Actividad Práctica de la Clase</h2>
    <span style="font-size:0.85rem; font-weight:700; color:#475569;">${this.escapeHtml(subDisplay)}${grdDisplay ? ' - Grado ' + this.escapeHtml(grdDisplay) : ''}</span>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px; line-height:1.4;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> ______________</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
  ${cleanTopic ? `<div style="margin-top:6px; font-size:0.82rem; color:#1e293b; border-top:1px dashed #e2e8f0; padding-top:4px;"><strong>Tema:</strong> ${this.escapeHtml(cleanTopic)}</div>` : ''}
</div>`.trim();

    if (practical) {
      // Verificar si el contenido práctico ya está presente dentro de raw
      const practicalSnippet = practical.replace(/<[^>]+>/g, '').trim().slice(0, 40);
      const rawText = (raw || '').replace(/<[^>]+>/g, '');
      const alreadyIncluded = practicalSnippet && rawText.includes(practicalSnippet);

      if (!alreadyIncluded) {
        const practicalFormatted = this.formatNotebookHtml(practical);

        if (raw && raw.trim()) {
          const mainFormatted = this.formatNotebookHtml(raw);
          return `${mainFormatted}\n\n${pageBreakHtml}\n\n${worksheetHeader}\n${practicalFormatted}`;
        } else {
          return `${worksheetHeader}\n${practicalFormatted}`;
        }
      } else {
        // Si el contenido ya estaba dentro de raw pero no tiene el salto de página, independizarlo
        if (!raw.includes('notebook-page-break') && /<h[1-6][^>]*>(?:✍️\s*)?Taller\b/i.test(raw)) {
          raw = raw.replace(/(<h[1-6][^>]*>(?:✍️\s*)?Taller\b)/i, `${pageBreakHtml}\n$1`);
        }
      }
    }

    if (raw && raw.trim()) {
      const formatted = this.formatNotebookHtml(raw);
      // Si el contenido original era un párrafo monolítico, actualizarlo en la clase para que quede estructurado de forma persistente
      const pCount = (raw.match(/<p\b/gi) || []).length;
      const plainTextLen = raw.replace(/<[^>]+>/g, '').trim().length;
      const isMonolithic = (pCount <= 2 && plainTextLen > 200) && (
        /(?:TEMAS\s+DEL|DESEMPEÑOS?\s+DE|CRITERIOS?\s+DE|Fase\s+de|Eje\s+temático|Tiempo:|Taller|Actividad|Solucionario|Ejemplos|Conceptos|Reglas|Definici[oó]n)/i.test(raw) ||
        /(?:[A-ZÁÉÍÓÚÑ][^:\n]{2,40}:\s+){2,}/.test(raw) ||
        /\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(raw) ||
        /[a-d]\)\s+/.test(raw) ||
        (plainTextLen > 400 && (raw.match(/\.\s+[A-ZÁÉÍÓÚÑ]/g) || []).length >= 2)
      );
      if (isMonolithic && formatted && cls) {
        cls.notebookContent = formatted;
        if (!cls.teacherNotebook) cls.teacherNotebook = {};
        cls.teacherNotebook.studentNotebookContent = formatted;
        try {
          if (cls.id && typeof ClassRepository !== 'undefined' && ClassRepository.saveClass) {
            ClassRepository.saveClass(cls, cls.teacherId);
          }
        } catch (eSave) {}
      }
      return formatted;
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

    // Configurar párrafos estándar de Word/Google Docs al presionar Enter (<p> en lugar de <div>)
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (e) {}

    editor.addEventListener('focus', () => {
      try {
        document.execCommand('defaultParagraphSeparator', false, 'p');
      } catch (e) {}
    });

    // Guardar selección activa continuamente
    editor.addEventListener('mouseup', () => this._saveSelection());
    editor.addEventListener('keyup', () => this._saveSelection());

    if (!this._boundSelectionChange) {
      this._boundSelectionChange = true;
      document.addEventListener('selectionchange', () => {
        this._saveSelection();
      });
    }

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
              this._compressImage(blob, 1280, 0.82).then((compressed) => {
                if (compressed) {
                  this.insertImageAtCursor(compressed);
                }
              }).catch(() => {});
              return;
            }
          }
        }
      }

      if (clipboardData) {
        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text/plain');

        // Si viene texto plano o HTML que necesita estructuración pedagógica
        const needsFormatting = (text && (/\*\*|•|#{1,3}\s+|\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡]|\bRegla\b|\bPaso\b|[a-d]\)\s+|[=+\-]\s+por/i.test(text) || text.split('\n').length >= 3 || !html));
        if (needsFormatting) {
          e.preventDefault();
          let formatted = this.formatNotebookHtml(text);
          // Garantizar que no se inyecten cajas azules automáticas (callouts) al pegar
          if (typeof this._cleanAutoCallouts === 'function') {
            formatted = this._cleanAutoCallouts(formatted);
          }
          if (formatted) {
            document.execCommand('insertHTML', false, formatted);
            this.triggerAutoSave(false);
            this._updateWordCount();
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast('✨ Contenido estructurado adecuadamente en el cuaderno', 'info');
            }
            return;
          }
        } else if (html && /<(?:p|h[1-6]|ul|ol|table|b|strong|i|em|div)[^>]*>/i.test(html)) {
          // Desarmar cualquier cuadro azul conflictivo que venga en el HTML pegado
          let cleanHtml = html;
          if (typeof this._cleanAutoCallouts === 'function') {
            cleanHtml = this._cleanAutoCallouts(cleanHtml);
          }
          e.preventDefault();
          const formatted = this.formatNotebookHtml(cleanHtml);
          if (formatted) {
            document.execCommand('insertHTML', false, formatted);
            this.triggerAutoSave(false);
            this._updateWordCount();
            return;
          }
        }
      }

      setTimeout(() => {
        this.triggerAutoSave(false);
        this._updateWordCount();
      }, 50);
    };

    // Salvaguarda al cambiar de pestaña o cerrar (registrar una sola vez globalmente)
    if (!this._boundUnloadEvents) {
      this._boundUnloadEvents = true;
      window.addEventListener('beforeunload', () => this.saveCurrentNotebookContent(false));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.saveCurrentNotebookContent(false);
        }
      });
    }

    // === FIX CRÍTICO: Evitar pérdida de foco al hacer clic en botones de la toolbar ===
    // Permitir apertura de menús desplegables nativos en <select>, <option>, <input> y <label>
    document.querySelectorAll('.notebook-word-toolbar').forEach(toolbar => {
      toolbar.onmousedown = (e) => {
        const isInteractiveFormEl = e.target.closest('select, input, textarea, label, option');
        if (isInteractiveFormEl) {
          this._saveSelection();
          return; // No llamar a preventDefault para que el select o picker se despliegue normalmente
        }
        e.preventDefault(); // Mantener foco y selección en el editor para botones estándar
      };
    });

    // === Cabecera sticky compacta al hacer scroll para optimizar espacio visual ===
    const stickyHeader = document.getElementById('notebook-sticky-header-wrapper');
    if (stickyHeader && !this._boundStickyScroll) {
      this._boundStickyScroll = true;
      window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
          stickyHeader.classList.add('is-compact');
        } else {
          stickyHeader.classList.remove('is-compact');
        }
      }, { passive: true });
    }

    // === Nodos de redimensión e interacciones tipo Word (Tablas e Imágenes) ===
    this._initElementResizer();

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
   * Obtiene el HTML limpio del editor, removiendo espaciadores y marcadores efímeros de paginación
   */
  getCleanEditorHtml(editor) {
    if (!editor) return '';
    let html = '';
    if (typeof PaginationEngine !== 'undefined' && PaginationEngine.getCleanHtml) {
      html = PaginationEngine.getCleanHtml(editor);
    } else {
      const clone = editor.cloneNode(true);
      clone.querySelectorAll('.nb-page-break-spacer, .nb-auto-page-break').forEach(el => el.remove());
      clone.querySelectorAll('.nb-page-break-target').forEach(el => {
        el.classList.remove('nb-page-break-target');
        if (el.dataset.origMarginTop !== undefined) {
          el.style.marginTop = el.dataset.origMarginTop;
          delete el.dataset.origMarginTop;
        } else {
          el.style.marginTop = '';
        }
        if (!el.getAttribute('style') || el.getAttribute('style').trim() === '') {
          el.removeAttribute('style');
        }
      });
      html = clone.innerHTML;
    }
    return this.cleanDocumentArtifacts(html);
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

    // Modo Coordinación: Exclusivamente lectura y descargas (no modifica el contenido de Manuel)
    if (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) {
      return false;
    }

    const editor = document.getElementById('notebook-single-editor');
    if (!editor || (!this.currentClassId && this.currentClassIndex === null)) return false;

    const currentHtml = this.getCleanEditorHtml(editor);
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

    // Persistir a través de StorageService solo como fallback si ClassRepository no estaba disponible
    let success = savedInClassRepo;
    if (!savedInClassRepo && dateStr && classId && typeof StorageService !== 'undefined' && StorageService.saveClass) {
      const updatedClass = {
        notebookContent: this.hasContent(currentHtml) ? currentHtml : (this.currentClassData?.notebookContent || ''),
        observations: obsVal
      };
      const res = StorageService.saveClass(dateStr, classId, updatedClass);
      if (res && res.plan) success = true;
    } else if (!savedInClassRepo && dateStr && typeof StorageService !== 'undefined' && StorageService.savePlan) {
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
        editor.innerHTML = this._prepareInitialHtml(this.currentClassData);
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
    this._restoreSelection();
    try {
      document.execCommand(cmd, false, val);
    } catch (e) {
      console.warn('[NotebookEditor] execCommand falló:', cmd, e);
    }
    this._saveSelection();
    this.triggerAutoSave(false);
  },

  formatBlock(tag) {
    if (!tag) return;
    this._restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let success = false;
    try {
      success = document.execCommand('formatBlock', false, '<' + tag + '>');
    } catch (e) {}
    if (!success) {
      try {
        success = document.execCommand('formatBlock', false, tag);
      } catch (e) {}
    }

    const block = this._getEnclosingBlock();
    if (block && block.tagName.toLowerCase() !== tag.toLowerCase()) {
      const newEl = document.createElement(tag);
      while (block.firstChild) {
        newEl.appendChild(block.firstChild);
      }
      if (block.style.cssText) newEl.style.cssText = block.style.cssText;
      block.parentNode.replaceChild(newEl, block);

      const newRange = document.createRange();
      newRange.selectNodeContents(newEl);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
    this._saveSelection();
    this.triggerAutoSave(false);
  },

  setFontFamily(family) {
    if (!family) return;
    this._restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (sel.isCollapsed) {
      const block = this._getEnclosingBlock();
      if (block) {
        block.style.fontFamily = family;
      }
    } else {
      try {
        document.execCommand('fontName', false, family);
      } catch (e) {}
      const editor = document.getElementById('notebook-single-editor');
      if (editor) {
        editor.querySelectorAll('font[face]').forEach(fontEl => {
          const span = document.createElement('span');
          span.style.fontFamily = fontEl.getAttribute('face');
          while (fontEl.firstChild) span.appendChild(fontEl.firstChild);
          fontEl.parentNode.replaceChild(span, fontEl);
        });
      }
    }
    this._saveSelection();
    this.triggerAutoSave(false);
  },

  setFontSize(size) {
    if (!size) return;
    this._restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (sel.isCollapsed) {
      const block = this._getEnclosingBlock();
      if (block) {
        block.style.fontSize = size;
      } else {
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.innerHTML = '&#8203;';
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStart(span.firstChild, 1);
        newRange.collapse(true);
        sel.addRange(newRange);
      }
    } else {
      const span = document.createElement('span');
      span.style.fontSize = size;
      const fragment = range.extractContents();
      fragment.querySelectorAll('*').forEach(el => {
        if (el.style && el.style.fontSize) el.style.fontSize = '';
      });
      span.appendChild(fragment);
      range.insertNode(span);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    }
    this._saveSelection();
    this.triggerAutoSave(false);
  },

  setTextColor(color) {
    if (!color) return;
    this._restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (sel.isCollapsed) {
      const block = this._getEnclosingBlock();
      if (block) {
        block.style.color = color;
      }
    } else {
      let ok = false;
      try {
        ok = document.execCommand('foreColor', false, color);
      } catch (e) {}
      if (!ok) {
        this._wrapSelectionWithStyle({ color: color });
      } else {
        const editor = document.getElementById('notebook-single-editor');
        if (editor) {
          editor.querySelectorAll('font[color]').forEach(fontEl => {
            const span = document.createElement('span');
            span.style.color = fontEl.getAttribute('color');
            while (fontEl.firstChild) span.appendChild(fontEl.firstChild);
            fontEl.parentNode.replaceChild(span, fontEl);
          });
        }
      }
    }
    this._saveSelection();
    this.triggerAutoSave(false);
  },

  setHighlightColor(color) {
    if (!color) return;
    this._restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (sel.isCollapsed) {
      const block = this._getEnclosingBlock();
      if (block) {
        block.style.backgroundColor = color;
      }
    } else {
      let ok = false;
      try {
        ok = document.execCommand('hiliteColor', false, color);
      } catch (e) {}
      if (!ok) {
        try {
          ok = document.execCommand('backColor', false, color);
        } catch (e) {}
      }
      if (!ok) {
        this._wrapSelectionWithStyle({ backgroundColor: color });
      }
    }
    this._saveSelection();
    this.triggerAutoSave(false);
  },

  insertPageBreakAtCursor() {
    const breakHtml = '<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Salto de Página</span></div><p><br/></p>';
    this._insertHtmlAtCursor(breakHtml);
    setTimeout(() => this.recalculatePagination(), 50);
  },

  insertLink() {
    this._restoreSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : '';
    const url = prompt('Introduce la URL del enlace (ej: https://...):', 'https://');
    if (!url || !url.trim() || url.trim() === 'https://') return;
    const cleanUrl = url.trim();
    if (selectedText) {
      this.exec('createLink', cleanUrl);
    } else {
      const linkHtml = `<a href="${this.escapeHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(cleanUrl)}</a>`;
      this._insertHtmlAtCursor(linkHtml);
    }
  },

  insertTable() {
    const tableHtml = `
      <table class="notebook-table" style="width:100%; border-collapse:collapse; margin:1rem 0; border:1px solid #cbd5e1;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #cbd5e1; padding:8px 12px; font-weight:700; text-align:left;">Columna 1</th>
            <th style="border:1px solid #cbd5e1; padding:8px 12px; font-weight:700; text-align:left;">Columna 2</th>
            <th style="border:1px solid #cbd5e1; padding:8px 12px; font-weight:700; text-align:left;">Columna 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px 12px;">Dato 1</td>
            <td style="border:1px solid #cbd5e1; padding:8px 12px;">Dato 2</td>
            <td style="border:1px solid #cbd5e1; padding:8px 12px;">Dato 3</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px 12px;">Dato 4</td>
            <td style="border:1px solid #cbd5e1; padding:8px 12px;">Dato 5</td>
            <td style="border:1px solid #cbd5e1; padding:8px 12px;">Dato 6</td>
          </tr>
        </tbody>
      </table>
      <p><br/></p>
    `;
    this._insertHtmlAtCursor(tableHtml);
    setTimeout(() => {
      const editor = document.getElementById('notebook-single-editor');
      const tables = editor?.querySelectorAll('table');
      if (tables && tables.length > 0) {
        this._selectResizerElement(tables[tables.length - 1]);
      }
    }, 80);
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
    this._insertHtmlAtCursor(calloutHtml);
  },

  insertCodeBlock(lang = 'C++ / Arduino') {
    const editor = document.getElementById('notebook-single-editor');
    if (!editor) return;

    let selectedText = '';
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      selectedText = sel.toString();
    }

    let codeContent = selectedText.trim();
    if (!codeContent) {
      codeContent = '// Escribe o pega aquí tu código (C++, Arduino, Python, etc.)\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  \n}';
    }

    if (typeof ImportParser !== 'undefined' && typeof ImportParser.repairCodeFormatting === 'function') {
      codeContent = ImportParser.repairCodeFormatting(codeContent);
    }

    const escaped = this.escapeHtml(codeContent);
    const codeHtml = `
<div class="notebook-code-block" style="background:#f8fafc; border:1.5px solid #cbd5e1; border-left:4px solid #2563eb; border-radius:6px; margin:0.8rem 0; padding:10px 14px; font-family:'Consolas', 'Courier New', monospace; font-size:0.82rem; line-height:1.45; overflow-x:auto; white-space:pre-wrap; word-break:break-word; color:#0f172a; page-break-inside:avoid; break-inside:avoid;">
  <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:0.75rem; font-weight:700; color:#2563eb; text-transform:uppercase; margin-bottom:6px; border-bottom:1px solid #e2e8f0; padding-bottom:4px; letter-spacing:0.5px; user-select:none; display:flex; justify-content:space-between; align-items:center;">
    <span>💻 Código / Sketch (${lang})</span>
  </div>
  <pre style="margin:0; font-family:inherit; font-size:inherit; white-space:pre-wrap; word-break:break-word; color:inherit; background:transparent; border:none; padding:0;"><code>${escaped}</code></pre>
</div><p><br/></p>`.trim();

    this._insertHtmlAtCursor(codeHtml);
  },

  /**
   * Comprime y optimiza imágenes a tamaño web/documento (máx 1280px, 82% calidad)
   * Evita bloqueos del navegador por saturación de memoria base64 y cuotas de almacenamiento
   */
  _compressImage(fileOrDataUrl, maxWidth = 1280, quality = 0.82) {
    return new Promise((resolve) => {
      if (!fileOrDataUrl) return resolve(null);
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null);
      }

      const img = new Image();
      img.onload = () => {
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
        if (!ctx) return resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null);
        }
      };
      img.onerror = () => {
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null);
      };

      if (typeof fileOrDataUrl === 'string') {
        img.src = fileOrDataUrl;
      } else if (fileOrDataUrl instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(fileOrDataUrl);
      } else {
        resolve(null);
      }
    });
  },

  async handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await this._compressImage(file, 1280, 0.82);
      if (compressed) {
        this.insertImageAtCursor(compressed);
      }
    } catch (err) {
      console.warn('[NotebookEditor] Error al procesar imagen:', err);
    }
    e.target.value = '';
  },

  insertImageAtCursor(dataUrl) {
    if (!dataUrl) return;
    const imgHtml = '<div style="text-align:center; margin:1rem 0;"><img src="' + dataUrl + '" alt="Imagen pedagógica" style="max-width:100%; height:auto; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.1);" /></div><p><br/></p>';
    this._insertHtmlAtCursor(imgHtml);
    this.triggerAutoSave(false);
    setTimeout(() => {
      this.recalculatePagination();
      const editor = document.getElementById('notebook-single-editor');
      const imgs = editor?.querySelectorAll('img');
      if (imgs && imgs.length > 0) {
        this._selectResizerElement(imgs[imgs.length - 1]);
      }
    }, 100);
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
    let bodyHtml = '';
    if (editor) {
      const clone = editor.cloneNode(true);
      // Reemplazar espaciadores de página de PaginationEngine por saltos de página nativos de Word
      clone.querySelectorAll('.nb-page-break-spacer').forEach(sp => {
        const br = document.createElement('br');
        br.setAttribute('clear', 'all');
        br.style.cssText = 'page-break-before:always; mso-break-type:page-break;';
        sp.parentNode.replaceChild(br, sp);
      });
      clone.querySelectorAll('.nb-auto-page-break').forEach(el => el.remove());
      bodyHtml = this.cleanDocumentArtifacts(clone.innerHTML);
    } else {
      bodyHtml = this.cleanDocumentArtifacts(cls.notebookContent || '');
    }

    const hdrObs = document.getElementById('hdr-edit-observations');
    const obsVal = hdrObs ? hdrObs.value.trim() : (cls.observations || '');

    const paperSize = (typeof PageConfig !== 'undefined' && PageConfig.paperSize === 'a4') ? 'a4' : 'letter';
    const marginVal = (typeof PageConfig !== 'undefined') ? PageConfig.margins.topCm : 1.27;

    // Comprobar si las observaciones tienen salto de página previo
    const obsCard = document.querySelector('.notebook-observations-card');
    const obsHasBreak = obsCard && obsCard.previousElementSibling && obsCard.previousElementSibling.classList.contains('nb-page-break-spacer');

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
            size: ${paperSize} portrait;
            margin: ${marginVal}cm ${marginVal}cm ${marginVal}cm ${marginVal}cm;
            mso-header-margin: 36pt;
            mso-footer-margin: 36pt;
            mso-paper-source: 0;
          }
          div.Section1 { page: Section1; }
          .nb-page-break-target, .notebook-page-break {
            page-break-before: always;
            mso-break-type: page-break;
          }
          .nb-auto-page-break, .nb-page-break-spacer {
            display: none;
            mso-hide: all;
          }
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
            ${obsHasBreak ? `<br clear="all" style="page-break-before:always; mso-break-type:page-break;" />` : ''}
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

    // 1c. Despejar márgenes dinámicos aplicados por el separador de pantalla
    // Evita que Chromium sume el margen de pantalla (150-200px) encima de la hoja impresa
    const editor = document.getElementById('notebook-single-editor');
    const breakTargets = editor ? editor.querySelectorAll('.nb-page-break-target, [data-orig-margin-top]') : [];
    const savedMargins = [];
    breakTargets.forEach(el => {
      savedMargins.push({ el, marginTop: el.style.marginTop });
      el.style.marginTop = '';
    });

    // 1d. Ocultar el contador de palabras
    const wordCountBadge = document.getElementById('doc-word-count-badge');
    if (wordCountBadge) {
      wordCountBadge.dataset.printHidden = '1';
      wordCountBadge.style.display = 'none';
    }

    // 1e. Inyectar @page con tamaño y márgenes sincronizados desde PageConfig
    const paperSize = (typeof PageConfig !== 'undefined' && PageConfig.paperSize === 'a4') ? 'a4' : 'letter';
    const marginVal = (typeof PageConfig !== 'undefined') ? PageConfig.margins.topCm : 1.27;
    let printStyle = document.getElementById('notebook-print-orientation-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'notebook-print-orientation-style';
      document.head.appendChild(printStyle);
    }
    printStyle.textContent = `
      @page {
        size: ${paperSize} portrait;
        margin: ${marginVal}cm !important;
      }
    `;

    // =========================================================================
    // PASO 2: MARCAR EL BODY PARA QUE EL CSS DE IMPRESIÓN TOME CONTROL
    // =========================================================================
    document.body.classList.add('printing-notebook');

    // =========================================================================
    // PASO 3: RESTAURACIÓN SEGURA DEL DOM TRAS IMPRIMIR
    // =========================================================================
    let restored = false;
    const restoreDOM = () => {
      if (restored) return;
      restored = true;

      document.body.classList.remove('printing-notebook');

      // Restaurar textarea de observaciones
      if (hdrObs) {
        hdrObs.style.display = '';
        if (obsDiv) obsDiv.remove();
      }

      // Restaurar márgenes dinámicos del editor de pantalla
      savedMargins.forEach(({ el, marginTop }) => {
        if (marginTop) el.style.marginTop = marginTop;
      });

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

      // Recalcular indicadores de pantalla
      if (typeof this._updatePageBreakIndicators === 'function') {
        this._updatePageBreakIndicators();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('afterprint', restoreDOM, { once: true });
    }

    // =========================================================================
    // PASO 4: IMPRIMIR
    // =========================================================================
    window.print();

    // Fallback por si afterprint no se dispara
    setTimeout(restoreDOM, 2500);
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
   * Desenvuelve cuadros azules generados automáticamente al pegar que causan conflictos de edición
   * Preserva intactos los cuadros legítimos insertados desde la barra de herramientas (📌, ✍️, 🏠)
   */
  cleanDocumentArtifacts(text) {
    if (!text || typeof text !== 'string') return '';
    if (typeof ImportParser !== 'undefined' && typeof ImportParser.cleanDocumentArtifacts === 'function') {
      return ImportParser.cleanDocumentArtifacts(text);
    }
    const hasImages = text.includes('<img') || text.includes('data:image/');
    let imagePlaceholders = null;
    let clean = text;

    if (hasImages) {
      imagePlaceholders = [];
      clean = clean.replace(/<img\b[^>]*>/gi, (m) => {
        const ph = `___IMG_SHIELD_${imagePlaceholders.length}___`;
        imagePlaceholders.push(m);
        return ph;
      });
    }

    clean = clean
      .replace(/(?:\\[tT]ext|\/[tT]ext|\x09ext|\\textbf|\\textit|\\mathrm|\\mathbf|\\textnormal|\\mbox)\s*\{([^}]*)\}/gi, '$1')
      .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
      .replace(/\\times\b/g, '×').replace(/\\div\b/g, '÷').replace(/\\cdot\b/g, '·').replace(/\\pm\b/g, '±')
      .replace(/\\(?:le|leq)\b/g, '≤').replace(/\\(?:ge|geq)\b/g, '≥').replace(/\\neq\b/g, '≠').replace(/\\approx\b/g, '≈')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\$([^\$\n\r]+?)\$/g, '$1')
      .replace(/\$/g, '')
      .replace(/\{([^{}\n\r]*)\}/g, (m, inside) => {
        if (/[0-9a-zA-Z_]\s*,\s*[0-9a-zA-Z_]/.test(inside) || /^(?:\s*|;|return|if|for|void|int|const|Servo)\b/.test(inside)) {
          return m;
        }
        return inside;
      })
      .replace(/\{\s*\}/g, '')
      .replace(/""\*{1,3}/g, '"').replace(/''\*{1,3}/g, "'")
      .replace(/->\s*\*{0,2}/g, '-> ')
      .replace(/(?:^|\n)\s*(?:•\s*)?[\*•\-\–—_]{1,3}\s*(?=\n|$)/g, '\n')
      .replace(/(?<=[^\*\s])\*{1,3}(?=[^\*]|$)/g, '')
      .replace(/\*{1,3}/g, '')
      .replace(/(?<!\([^\n\)]*)\s*\*{1,2}\)\s*(?=\n|•|$)/g, '');

    if (imagePlaceholders && imagePlaceholders.length > 0) {
      imagePlaceholders.forEach((imgTag, idx) => {
        clean = clean.replace(`___IMG_SHIELD_${idx}___`, imgTag);
      });
    }

    return clean;
  },

  _cleanAutoCallouts(html) {
    if (!html || typeof html !== 'string') return '';
    let cleaned = this.cleanDocumentArtifacts(html);
    cleaned = cleaned.replace(/<div class="notebook-callout concept"[^>]*>([\s\S]*?)<\/div>/gi, (match, inner) => {
      if (/(?:📌|✍️|🏠|Concepto Clave:|Actividad en Clase:|Tarea \/ Compromiso:)/i.test(inner)) {
        return match;
      }
      return `<p style="margin-top:0.35rem; margin-bottom:0.25rem; line-height:1.4;">${inner.trim()}</p>`;
    });

    // 1. Limpiar cajas de fórmulas matemáticas vacías o que solo contengan comas/signos
    cleaned = cleaned.replace(/<div class="notebook-math-block"[^>]*>([\s\S]*?)<\/div>/gi, (match, inner) => {
      const text = inner.replace(/<[^>]+>/g, '').trim();
      if (!text || !/[a-zA-Z0-9\+\-\*\/=]/.test(text) || /^[,;.:\-_*•]+$/.test(text)) {
        return '';
      }
      return match;
    });

    // 2. Limpiar párrafos vacíos o que solo contengan asteriscos, viñetas, comas o espacios
    cleaned = cleaned.replace(/<p[^>]*>\s*(?:[•\*\-–—,;.:_]|\&nbsp;|<br\s*[\/]?>)*\s*<\/p>/gi, '');

    // 3. Limpiar ítems de lista vacíos o residuales
    cleaned = cleaned.replace(/<li[^>]*>\s*(?:[•\*\-–—,;.:_]|\&nbsp;|<br\s*[\/]?>)*\s*<\/li>/gi, '');

    // 4. Limpiar listas vacías
    cleaned = cleaned.replace(/<(ul|ol)[^>]*>\s*<\/\1>/gi, '');

    // 5. Limpiar asteriscos huérfanos o trailing ** antes del cierre de etiquetas
    cleaned = cleaned.replace(/\s*\*{1,3}(?=<\/h[1-6]>|<\/p>|<\/li>)/gi, '');
    cleaned = cleaned.replace(/\s*(?:-\s*&gt;|-&gt;|\-\>)\s*\*{0,2}\)?(?=<\/p>|<\/li>)/gi, '');

    return cleaned.trim();
  },

  /**
   * Convierte texto plano o Markdown a HTML estructurado y pedagógico para el Cuaderno
   */
  formatNotebookHtml(content, force = false) {
    if (!content || typeof content !== 'string') return '';
    const trimmed = content.trim();
    if (!trimmed || trimmed === '<p><br/></p>' || trimmed === '<p><br></p>' || trimmed === '<br>') return '';

    // Si ya es HTML estructurado y NO tiene encabezados o viñetas en Markdown crudo ni viñetas colapsadas ni fórmulas pendientes
    const hasRichTags = /<(?:p|h[1-6]|ul|ol|table|div|blockquote)[^>]*>/i.test(trimmed);
    const hasRawMarkdown = /\$\$[^\$\n\r]+\$\$|\*\*\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡]|\*\*(?:Regla|Paso|Norma|Lectura|Definici[oó]n|Importante)[\s\w#º°\d]*:|\n•\s*\*\*|•\s+\*\*|\*\*[^*]+\*\*|##\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed);
    const bulletCount = (trimmed.match(/•/g) || []).length;
    const liCount = (trimmed.match(/<li\b/gi) || []).length;
    const hasUnstructuredBullets = (bulletCount > 0 && liCount === 0) || (bulletCount > 1 && liCount < bulletCount / 2) ||
      (/•/.test(trimmed) && (!/<li[^>]*>/i.test(trimmed) || /<(?:p|div)[^>]*>[^<]*•/i.test(trimmed)));

    // Detectar si el contenido es un párrafo monolítico sin estructurar (ej. todo el cuaderno pegado en una sola etiqueta <p>)
    const pCount = (trimmed.match(/<p\b/gi) || []).length;
    const plainTextLen = trimmed.replace(/<[^>]+>/g, '').trim().length;
    const isMonolithicParagraph = (pCount <= 2 && plainTextLen > 200) && (
      /(?:TEMAS\s+DEL|DESEMPEÑOS?\s+DE|CRITERIOS?\s+DE|Fase\s+de|Eje\s+temático|Tiempo:|Taller|Actividad|Solucionario|Ejemplos|Conceptos|Reglas|Definici[oó]n)/i.test(trimmed) ||
      /(?:[A-ZÁÉÍÓÚÑ][^:\n]{2,40}:\s+){2,}/.test(trimmed) ||
      /\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
      /[a-d]\)\s+/.test(trimmed) ||
      (plainTextLen > 400 && (trimmed.match(/\.\s+[A-ZÁÉÍÓÚÑ]/g) || []).length >= 2)
    );

    const isWordHtml = /class=["']?Mso|mso-|style=["'][^"']*mso-/i.test(trimmed) ||
      /<p[^>]*>\s*<(?:b|strong)[^>]*>[^<]{3,80}<\/(?:b|strong)>\s*<\/p>/i.test(trimmed);

    if (!force && hasRichTags && !hasRawMarkdown && !hasUnstructuredBullets && !isMonolithicParagraph && !isWordHtml) {
      return this._cleanAutoCallouts(this.cleanDocumentArtifacts(trimmed));
    }

    // Usar el convertidor centralizado de ImportParser si está disponible
    let res = '';
    if (typeof ImportParser !== 'undefined' && typeof ImportParser.formatMarkdownToHtml === 'function') {
      res = ImportParser.formatMarkdownToHtml(trimmed);
    } else {
      res = this._fallbackFormatMarkdown(trimmed);
    }

    return this._cleanAutoCallouts(res);
  },

  _fallbackFormatMarkdown(content) {
    let cleanInput = content;
    const bulletCount = (cleanInput.match(/•/g) || []).length;
    const liCount = (cleanInput.match(/<li\b/gi) || []).length;
    const hasUnstructuredBullets = (bulletCount > 1 && liCount < bulletCount / 2) ||
      (/•/.test(cleanInput) && (!/<li[^>]*>/i.test(cleanInput) || /<(?:p|div)[^>]*>[^<]*•[^<]*•/i.test(cleanInput)));

    const pCount = (cleanInput.match(/<p\b/gi) || []).length;
    const plainTextLen = cleanInput.replace(/<[^>]+>/g, '').trim().length;
    const isMonolithicParagraph = (pCount <= 2 && plainTextLen > 200) && (
      /(?:TEMAS\s+DEL|DESEMPEÑOS?\s+DE|CRITERIOS?\s+DE|Fase\s+de|Eje\s+temático|Tiempo:|Taller|Actividad|Solucionario|Ejemplos|Conceptos|Reglas|Definici[oó]n)/i.test(cleanInput) ||
      /(?:[A-ZÁÉÍÓÚÑ][^:\n]{2,40}:\s+){2,}/.test(cleanInput) ||
      /\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(cleanInput) ||
      /[a-d]\)\s+/.test(cleanInput) ||
      (plainTextLen > 400 && (cleanInput.match(/\.\s+[A-ZÁÉÍÓÚÑ]/g) || []).length >= 2)
    );

    if ((hasUnstructuredBullets || isMonolithicParagraph) && /<[^>]+>/.test(cleanInput)) {
      cleanInput = cleanInput
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<li[^>]*>/gi, '\n• ')
        .replace(/<[^>]+>/g, '');
    }

    let text = this.cleanBrokenLinebreaks(cleanInput)
      .replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ])-(Regla|Paso|Norma|Ejemplo|Definici[oó]n|Importante|Nota)\b/gi, '$1 -\n\n$2')
      .replace(/(?:^|\n|[.!?]\s*|\s+)•\s*([\p{Lu}0-9\s\/\-:\(\)]{5,}[\p{Lu}0-9\)])(?=\s+[\p{Lu}][\p{Ll}]|\s*•|\s*$)/gu, '\n\n## $1\n\n')
      .replace(/(?:^|\n)(##\s+)?([\p{Lu}]{2,}(?:\s+[\p{Lu}0-9\/\-]+){1,8})\s+([\p{Lu}][\p{Ll}])/gu, (match, hash, title, nextWord) => `\n\n## ${title}\n\n${nextWord}`)
      .replace(/([^\n])\s*(•)\s*/g, '$1\n$2 ')
      .replace(/(?:^|\n)•\s*([A-ZÁÉÍÓÚÑ][^\n•\(\)]+\([^\)]+\))\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ])/gu, '\n\n## $1\n\n$2')
      .replace(new RegExp('(?:^|\\n)•\\s*([A-ZÁÉÍÓÚÑ][^\\n•]{3,75}?)\\s+((?:Restar|Sumar|Multiplicar|Dividir|Para agilizar|Para resolver|En la siguiente|Resolver|Consiste en|Es la|Son los|Se define|Permite)\\b)', 'gu'), '\n\n## $1\n\n$2')
      .replace(/(?:^|\n)•\s*(Resumen(?:\s+Clave)?(?:\s+para\s+Consignar)?|Conexi[oó]n\s+con\s+la\s+siguiente\s+clase)\s*(?=\n|$)/gi, '\n\n## $1\n\n')
      .replace(/([^\n])\s*((?:Regla\s+fundamental|Regla\s+de\s+memoria\s+f[aá]cil|Ejemplo\s+paso\s+a\s+paso)\s*:)/gi, '$1\n\n$2')
      .replace(/([^\n])\s*(Ejemplos?\s*:)\s*(?=[•\-\*\d]|\n)/gi, '$1\n\n**$2**\n')
      .replace(/\$\$([^\$]+)\$\$/g, (match, eq) => `\n\n$$${eq.trim()}$$\n\n`)
      .replace(/(##[^\n]+)\n+(?=[•\-\*\d])/g, '$1\n\n')
      .replace(/([.:;\n]|\*{2})\s+([-*])\s+(?=[A-ZÁÉÍÓÚÑa-záéíóúñ¿¡"«\*\d])/g, '$1\n$2 ')
      .replace(/([^\n])\s*(\*{2}\d+[\.\)]\s+[^\n*]+\*{2})/g, '$1\n\n$2')
      .replace(/(\*{2}\d+[\.\)]\s+[^\n*]+\*{2})\s*([A-ZÁÉÍÓÚÑ¿¡•])/g, '$1\n\n$2')
      .replace(/([.!?:;)\]\*])\s*(\*{1,2}(?:Regla(?:\s+(?:fundamental|de\s+memoria\s+f[aá]cil|n[úu]mero))?|Paso\s*[A-Z\d]|Norma\s*\d+|Lectura\s+completa|Definici[oó]n|Ejemplo(?:\s+paso\s+a\s+paso)?|Importante|Nota|Pregunta)\b[^:\n\r]{0,50}:\*{0,2})/gi, '$1\n\n$2')
      .replace(/(?:^|\n)\s*(\*{0,2}Paso\s*[A-Z\d][^\n:•]*:?[^\n•]*?\*{0,2})\s*(?=\n|•|$)/gi, '\n\n$1\n\n')
      .replace(/\n{3,}/g, '\n\n');

    // Asegurar que encabezados mayores como TALLER / EJERCICIO PRÁCTICO queden separados en su propio bloque
    text = text.replace(/(?:^|\n)\s*((?:\*{0,2})(?:TALLER\b[^\n:]*|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?[^\n:]*|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?[^\n:]*)(?:\*{0,2}))\s*(?=\n|$)/gi, (m, p1) => `\n\n${p1}\n\n`);

    // Asegurar que fórmulas matemáticas ($$formula$$) queden aisladas en su propio bloque
    text = text.replace(/(?:\s*)(\$\$[^\$\n]+\$\$)(?:\s*)/g, '\n\n$1\n\n');

    const blocks = text.split(/\n{2,}/);
    const htmlBlocks = [];

    for (let b of blocks) {
      const block = b.trim();
      if (!block) continue;

      // 0. Fórmula matemática LaTeX ($$formula$$)
      const mathMatch = block.match(/^\$\$([^\$]+)\$\$$/);
      if (mathMatch) {
        const formula = mathMatch[1].trim();
        if (formula && formula.length >= 2 && /[a-zA-Z0-9\+\-\*\/=]/.test(formula) && !/^[,;.:\-_*•]+$/.test(formula)) {
          htmlBlocks.push(`<div class="notebook-math-block" style="text-align:center; margin:0.6rem 0; padding:8px 12px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:6px; font-family:'Cambria Math', 'Times New Roman', serif; font-size:1.15rem; font-weight:700; color:#1e3a8a; letter-spacing:0.5px;">${this.escapeHtml(formula)}</div>`);
        }
        continue;
      }

      // Paso 1: Paso 2: etc.
      const stepMatch = block.match(/^(?:#{1,3}\s+|\*{0,2})(Paso\s*\d+[\s\w#º°\d\(\)]*:)\*{0,2}\s*(.*)$/i);
      if (stepMatch) {
        const stepTitle = stepMatch[1].replace(/[\*#]/g, '').trim();
        const stepRest = (stepMatch[2] || '').trim();
        htmlBlocks.push(`<h3 style="color:#1e293b; margin-top:0.85rem; margin-bottom:0.3rem; font-size:1.02rem; font-weight:700;">🛠️ ${this.escapeHtml(stepTitle)}</h3>`);
        if (stepRest) {
          const formattedRest = this._formatInlineMarkdown(stepRest);
          if (formattedRest && !/^[\s\*•\-\–—_.]+$/.test(formattedRest)) {
            htmlBlocks.push(`<p style="margin-top:0.25rem; margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${formattedRest}</p>`);
          }
        }
        continue;
      }

      const headingMatch = block.match(/^(?:#{1,3}\s+)(.+)$/) ||
                           block.match(/^(?:#{1,3}\s+|\*{0,2})(\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ¿¡][^\n*]+?)\*{0,2}$/) ||
                           block.match(/^([\p{Lu}0-9\s\/\-:\(\)]{6,}[\p{Lu}0-9\)])$/u);
      if (headingMatch) {
        let title = (headingMatch[1] || headingMatch[0]).replace(/[\*#]/g, '').trim();

        // Detección especial de TALLER / EJERCICIO PRÁCTICO: independizar en una hoja con ficha estudiantil
        const isTallerHeading = /^(?:TALLER(?:\s*[\/:\-]\s*(?:ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)?\s*PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|\s*PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|\s+DE\s+APLICACI[OÓ]N|\s+EN\s+CLASE)?|ACTIVIDAD(?:ES)?\s+PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?|EJERCICIO(?:S)?\s+PR[AÁ]CTIC[OA]S?(?:\s+DE\s+LA\s+CLASE)?)\b/i.test(title);
        if (isTallerHeading) {
          const lastHtml = htmlBlocks[htmlBlocks.length - 1] || '';
          if (htmlBlocks.length > 0 && !lastHtml.includes('notebook-page-break')) {
            htmlBlocks.push('<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">📄 Hoja Independiente: Taller / Ejercicio Práctico</span></div>');
          }
          if (!lastHtml.includes('notebook-student-worksheet-header')) {
            htmlBlocks.push(`
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; border-radius:6px; padding:10px 14px; margin:0.8rem 0; background:#f8fafc; page-break-inside:avoid; break-inside:avoid;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px;">
    <h2 style="margin:0; padding:0; border:none; font-size:1.1rem; font-weight:800; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px;">✍️ Taller / Actividad Práctica de la Clase</h2>
  </div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px; font-size:0.82rem; color:#1e293b; margin-top:6px; line-height:1.4;">
    <div><strong>Estudiante:</strong> ________________________________________________</div>
    <div><strong>Fecha:</strong> ______________</div>
    <div><strong>Calificación:</strong> _________</div>
  </div>
</div>`.trim());
            continue;
          }
        }

        let icon = '';
        if (/TRANSCRIPCI[OÓ]N|PROP[OÓ]SITO|OBJETIVO|INTRODUCCI[OÓ]N/i.test(title)) icon = '🎯 ';
        else if (/PAR[AÁ]METROS|FORMATO|ESPECIFICACI/i.test(title)) icon = '📐 ';
        else if (/REGLAS|NORMAS|ESTILO|DIGITACI[OÓ]N/i.test(title)) icon = '⌨️ ';
        else if (/PROCEDIMIENTO|T[EÉ]CNICO|RESUMEN|PASO/i.test(title)) icon = '🛠️ ';
        else if (/SUSTRACCI[OÓ]N|ADICI[OÓ]N|N[UÚ]MEROS|OPERACION|MATEM[AÁ]TICA/i.test(title)) icon = '🔢 ';
        else if (/SIGNO|PAR[EÉ]NTESIS|LEY/i.test(title)) icon = '⚡ ';
        else if (/M[EÉ]TODO|POLINOMIO|CADENA/i.test(title)) icon = '📋 ';
        else if (/CONEXI[OÓ]N|SIGUIENTE/i.test(title)) icon = '🚀 ';
        else if (!/^[\d\.\s\p{Emoji}]/u.test(title)) icon = '📌 ';

        htmlBlocks.push(`<h2 style="color:#1e3a8a; margin-top:1.2rem; margin-bottom:0.5rem; font-size:1.15rem; font-weight:700; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px; letter-spacing:-0.01em;">${icon}${this.escapeHtml(title)}</h2>`);
        continue;
      }

      // 3. Reglas pedagógicas, pasos, ejemplos o definiciones formateados limpiamente como párrafo con título en negrita
      const ruleMatch = block.match(/^\*{0,2}((?:Regla(?:\s+(?:fundamental|de\s+memoria\s+f[aá]cil|n[úu]mero))?|Norma\s*\d+|Lectura\s+completa|Definici[oó]n|Ejemplo(?:\s+paso\s+a\s+paso)?|Importante|Nota|Pregunta)[\s\w#º°\d\(\)]*:)\*{0,2}\s*([\s\S]+)$/i);
      if (ruleMatch) {
        const ruleLabel = ruleMatch[1].replace(/[\*#]/g, '').trim();
        const ruleBody = this._formatInlineMarkdown(ruleMatch[2]);
        htmlBlocks.push(`<p style="margin-top:0.35rem; margin-bottom:0.25rem; line-height:1.4;"><strong style="color:#1d4ed8;">${this.escapeHtml(ruleLabel)}</strong> ${ruleBody}</p>`);
        continue;
      }

      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const validLines = lines.filter(l => !/^[\s\*•\-\–—_]{1,3}$/.test(l));
      if (validLines.length > 0 && validLines.every(l => /^[•\-\*]\s+/.test(l))) {
        const listItemsHtml = validLines.map(l => {
          const c = l.replace(/^[•\-\*]\s+/, '').trim();
          if (!c || /^[\s\*•\-\–—_.]+$/.test(c)) return '';
          return `<li style="margin-bottom:0.2rem;">${this._formatInlineMarkdown(c)}</li>`;
        }).filter(Boolean).join('');
        if (listItemsHtml) {
          htmlBlocks.push(`<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${listItemsHtml}</ul>`);
        }
        continue;
      }

      // Si contiene viñetas intercaladas en el bloque
      if (validLines.some(l => /^[•\-\*]\s+/.test(l))) {
        let currentP = [];
        let currentList = [];
        for (const line of validLines) {
          if (/^[•\-\*]\s+/.test(line)) {
            if (currentP.length > 0) {
              htmlBlocks.push(`<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${this._formatInlineMarkdown(currentP.join(' '))}</p>`);
              currentP = [];
            }
            const c = line.replace(/^[•\-\*]\s+/, '').trim();
            if (c && !/^[\s\*•\-\–—_.]+$/.test(c)) {
              currentList.push(`<li style="margin-bottom:0.2rem;">${this._formatInlineMarkdown(c)}</li>`);
            }
          } else {
            if (currentList.length > 0) {
              htmlBlocks.push(`<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${currentList.join('')}</ul>`);
              currentList = [];
            }
            currentP.push(line);
          }
        }
        if (currentList.length > 0) {
          htmlBlocks.push(`<ul style="margin:0.35rem 0 0.55rem 1.25rem; padding-left:0.8rem; line-height:1.45; color:#1e293b;">${currentList.join('')}</ul>`);
        }
        if (currentP.length > 0) {
          htmlBlocks.push(`<p style="margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${this._formatInlineMarkdown(currentP.join(' '))}</p>`);
        }
        continue;
      }

      const formattedPara = this._formatInlineMarkdown(block.replace(/\n/g, ' '));
      if (formattedPara && !/^[\s\*•\-\–—_.]+$/.test(formattedPara)) {
        htmlBlocks.push(`<p style="margin-top:0.3rem; margin-bottom:0.35rem; line-height:1.45; text-align:justify;">${formattedPara}</p>`);
      }
    }

    return htmlBlocks.join('\n\n');
  },

  _formatInlineMarkdown(str) {
    if (!str) return '';
    let cleaned = this.cleanDocumentArtifacts(str);
    let res = this.escapeHtml(cleaned);
    // Pares de negrita **texto**
    res = res.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Pares de cursiva *texto*
    res = res.replace(/(^|[^\*])\*([^\*]+?)\*([^\*]|$)/g, '$1<em>$2</em>$3');
    // Limpiar asteriscos huérfanos residuales
    res = res.replace(/\*{1,3}/g, '');
    // Limpiar paréntesis o corchetes de cierre huérfanos con asteriscos como **) solo si NO hay apertura '('
    if (!res.includes('(')) {
      res = res.replace(/\s*\*{1,3}\)\s*$/g, '');
    }
    if (!res.startsWith('<strong>')) {
      res = res.replace(/^([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\(\)\/]{2,45}:)\s*/, '<strong>$1</strong> ');
    }
    return res.trim();
  },

  /**
   * Reorganiza y aplica formato adecuado al contenido actual del editor
   */
  formatCurrentEditorContent() {
    const editor = document.getElementById('notebook-single-editor');
    if (!editor) return;
    const current = editor.innerHTML;
    if (!this.hasContent(current)) return;

    let textToProcess = current;
    if (typeof ImportParser !== 'undefined' && typeof ImportParser.convertHtmlToFormattedText === 'function') {
      textToProcess = ImportParser.convertHtmlToFormattedText(current);
    }
    const formatted = this.formatNotebookHtml(textToProcess, true);
    if (formatted) {
      editor.innerHTML = formatted;
      this.triggerAutoSave(true);
      this._updateWordCount();
      setTimeout(() => this._updatePageBreakIndicators(), 100);
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
    clean = clean.replace(/(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi, '\nCriterios de evaluación:\n');
    clean = clean.replace(/(?:^|\n)\s*Instrumentos\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi, '\nInstrumentos de evaluación:\n');

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

    // 8. Unir palabras con guión partidas por salto (ej. "teórico -\npráctico")
    // Se protege para que solo una si la segunda palabra inicia en minúscula y la primera no es una preposición
    clean = clean.replace(/(?<!\b(?:en|de|con|el|la|un|una))\b([a-záéíóúñA-ZÁÉÍÓÚÑ]+)\s*-\s*\n\s*([a-záéíóúñ]+)\b/g, '$1-$2');


    // 9. Espaciado armónico antes de subsecciones
    clean = clean.replace(/([^\n])\n*((?:Criterios|Instrumentos)\s+de\s+evaluaci[oó]n:)/gi, '$1\n\n$2');

    // 10. Eliminar saltos dobles innecesarios entre un encabezado con dos puntos (:) y su primera viñeta
    clean = clean.replace(/([^\n:]{1,120}:)\s*\n{2,}([•]|[-*](?!\*))/g, '$1\n$2');

    // 11. Normalizar saltos triples o excesivos
    clean = clean.replace(/\n{3,}/g, '\n\n');

    return clean.trim();
  },

  // =========================================================================
  // SISTEMA DE NODOS DE REDIMENSIÓN TIPO WORD PARA TABLAS E IMÁGENES
  // =========================================================================

  _selectedElement: null,
  _selectedTableCell: null,
  _hoverColCell: null,
  _isResizing: false,
  _isResizingCol: false,

  _initElementResizer() {
    const editor = document.getElementById('notebook-single-editor');
    if (!editor || editor._resizerBound) return;
    editor._resizerBound = true;

    // Asegurar que el overlay exista en .notebook-paper-container
    this._ensureResizerOverlay();

    // 1. Clic en imagen o tabla dentro del editor contenteditable
    editor.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (img && editor.contains(img)) {
        e.stopPropagation();
        this._selectResizerElement(img);
        return;
      }

      const table = e.target.closest('table');
      if (table && editor.contains(table)) {
        const cell = e.target.closest('th, td');
        this._selectResizerElement(table, cell);
        return;
      }
    });

    // 2. Hover sobre bordes verticales entre columnas (tipo Word col-resize)
    editor.addEventListener('mousemove', (e) => {
      if (this._isResizing || this._isResizingCol) return;
      const table = e.target.closest('table');
      if (table && editor.contains(table)) {
        const cell = e.target.closest('th, td');
        if (cell) {
          const rect = cell.getBoundingClientRect();
          const isNearRight = (e.clientX >= rect.right - 6 && e.clientX <= rect.right + 2);
          if (isNearRight) {
            document.body.style.cursor = 'col-resize';
            cell.style.cursor = 'col-resize';
            this._hoverColCell = cell;
            return;
          }
        }
      }
      if (this._hoverColCell) {
        document.body.style.cursor = '';
        if (this._hoverColCell) this._hoverColCell.style.cursor = '';
        this._hoverColCell = null;
      }
    });

    // 3. Inicio de redimensión interactiva de ancho de columna
    editor.addEventListener('mousedown', (e) => {
      if (this._hoverColCell) {
        e.preventDefault();
        e.stopPropagation();
        this._startColResize(e, this._hoverColCell);
      }
    });

    // 4-7. Eventos globales en document/window vinculados una única vez para evitar fugas de memoria
    if (!this._boundGlobalResizerEvents) {
      this._boundGlobalResizerEvents = true;

      // 4. Clic fuera del editor y overlay -> deseleccionar elemento
      document.addEventListener('mousedown', (e) => {
        if (this._isResizing || this._isResizingCol) return;
        const overlay = document.getElementById('notebook-element-resizer-overlay');
        if (overlay && overlay.contains(e.target)) return;

        const clickedImg = e.target.closest('#notebook-single-editor img');
        const clickedTable = e.target.closest('#notebook-single-editor table');
        if (!clickedImg && !clickedTable) {
          this._hideResizerOverlay();
        }
      });

      // 6. Reposicionamiento ante redimensionamiento de ventana
      window.addEventListener('resize', () => {
        if (this._selectedElement) this._updateOverlayPosition();
      });

      // 7. Teclas: Escape para deseleccionar, Supr/Backspace para borrar imagen
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this._hideResizerOverlay();
        } else if ((e.key === 'Delete' || e.key === 'Backspace') && this._selectedElement && this._selectedElement.tagName === 'IMG') {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) {
            this._deleteSelectedImage();
          }
        }
      });
    }

    // 5. Reposicionamiento ante scroll del documento
    const scrollWrapper = document.querySelector('.notebook-document-scroll-wrapper');
    if (scrollWrapper && !scrollWrapper._resizerScrollBound) {
      scrollWrapper._resizerScrollBound = true;
      scrollWrapper.addEventListener('scroll', () => {
        if (this._selectedElement) this._updateOverlayPosition();
      }, { passive: true });
    }
  },

  _ensureResizerOverlay() {
    let overlay = document.getElementById('notebook-element-resizer-overlay');
    const paperContainer = document.querySelector('.notebook-paper-container');
    if (!paperContainer) return null;

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'notebook-element-resizer-overlay';
      overlay.className = 'notebook-resizer-overlay';
      overlay.setAttribute('contenteditable', 'false');
      overlay.setAttribute('data-no-export', 'true');
      overlay.innerHTML = `
        <div class="resizer-outline"></div>
        <div class="resizer-handle handle-nw" data-handle="nw" title="Cambiar tamaño proporcional"></div>
        <div class="resizer-handle handle-n"  data-handle="n"  title="Cambiar altura"></div>
        <div class="resizer-handle handle-ne" data-handle="ne" title="Cambiar tamaño proporcional"></div>
        <div class="resizer-handle handle-e"  data-handle="e"  title="Cambiar ancho"></div>
        <div class="resizer-handle handle-se" data-handle="se" title="Cambiar tamaño (Nodo esquina Word)"></div>
        <div class="resizer-handle handle-s"  data-handle="s"  title="Cambiar altura"></div>
        <div class="resizer-handle handle-sw" data-handle="sw" title="Cambiar tamaño proporcional"></div>
        <div class="resizer-handle handle-w"  data-handle="w"  title="Cambiar ancho"></div>
        <div class="resizer-dimension-badge"></div>
        <div class="resizer-toolbar"></div>
      `;

      // Vincular eventos de arrastre a cada nodo de redimensión
      overlay.querySelectorAll('.resizer-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
          const handleType = handle.dataset.handle;
          this._startHandleResize(e, handleType);
        });
      });

      paperContainer.appendChild(overlay);
    }
    return overlay;
  },

  _selectResizerElement(el, cell = null) {
    if (!el || !el.isConnected) return;
    this._selectedElement = el;
    this._selectedTableCell = cell;

    const overlay = this._ensureResizerOverlay();
    if (!overlay) return;

    const isImg = el.tagName === 'IMG';
    const isTable = el.tagName === 'TABLE';

    overlay.className = 'notebook-resizer-overlay active ' + (isTable ? 'is-table' : 'is-image');

    const toolbar = overlay.querySelector('.resizer-toolbar');
    if (toolbar) {
      toolbar.innerHTML = isTable ? this._renderTableToolbar(el) : this._renderImageToolbar(el);
    }

    this._updateOverlayPosition();
  },

  _updateOverlayPosition() {
    if (!this._selectedElement || !this._selectedElement.isConnected) {
      this._hideResizerOverlay();
      return;
    }

    const overlay = document.getElementById('notebook-element-resizer-overlay');
    const paperContainer = document.querySelector('.notebook-paper-container');
    if (!overlay || !paperContainer) return;

    const sheetRect = paperContainer.getBoundingClientRect();
    const targetRect = this._selectedElement.getBoundingClientRect();

    const top = targetRect.top - sheetRect.top;
    const left = targetRect.left - sheetRect.left;
    const width = targetRect.width;
    const height = targetRect.height;

    overlay.style.top = top + 'px';
    overlay.style.left = left + 'px';
    overlay.style.width = width + 'px';
    overlay.style.height = height + 'px';

    // Posición dinámica de la toolbar para evitar salirse de la hoja
    const toolbar = overlay.querySelector('.resizer-toolbar');
    if (toolbar) {
      if (top < 45) {
        toolbar.style.top = (height + 8) + 'px';
      } else {
        toolbar.style.top = '-42px';
      }
    }
  },

  _hideResizerOverlay() {
    this._selectedElement = null;
    this._selectedTableCell = null;
    const overlay = document.getElementById('notebook-element-resizer-overlay');
    if (overlay) {
      overlay.className = 'notebook-resizer-overlay';
      overlay.style.display = 'none';
    }
  },

  _startHandleResize(e, handleType) {
    e.preventDefault();
    e.stopPropagation();
    if (!this._selectedElement) return;

    const target = this._selectedElement;
    const isImg = target.tagName === 'IMG';
    const isTable = target.tagName === 'TABLE';

    this._isResizing = true;
    const overlay = document.getElementById('notebook-element-resizer-overlay');
    if (overlay) overlay.classList.add('is-resizing');

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = target.offsetWidth;
    const startHeight = target.offsetHeight;
    const aspectRatio = startWidth / (startHeight || 1);

    const paperContainer = document.querySelector('.notebook-paper-container');
    const maxWidth = paperContainer ? (paperContainer.clientWidth - 80) : 750;

    const onMouseMove = (ev) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (handleType === 'se') {
        newWidth = Math.max(40, startWidth + deltaX);
        if (isImg) {
          newHeight = Math.max(30, newWidth / aspectRatio);
        } else {
          newHeight = Math.max(40, startHeight + deltaY);
        }
      } else if (handleType === 'sw') {
        newWidth = Math.max(40, startWidth - deltaX);
        if (isImg) {
          newHeight = Math.max(30, newWidth / aspectRatio);
        } else {
          newHeight = Math.max(40, startHeight + deltaY);
        }
      } else if (handleType === 'ne') {
        newWidth = Math.max(40, startWidth + deltaX);
        if (isImg) {
          newHeight = Math.max(30, newWidth / aspectRatio);
        } else {
          newHeight = Math.max(40, startHeight - deltaY);
        }
      } else if (handleType === 'nw') {
        newWidth = Math.max(40, startWidth - deltaX);
        if (isImg) {
          newHeight = Math.max(30, newWidth / aspectRatio);
        } else {
          newHeight = Math.max(40, startHeight - deltaY);
        }
      } else if (handleType === 'e') {
        newWidth = Math.max(40, startWidth + deltaX);
      } else if (handleType === 'w') {
        newWidth = Math.max(40, startWidth - deltaX);
      } else if (handleType === 's') {
        newHeight = Math.max(30, startHeight + deltaY);
      } else if (handleType === 'n') {
        newHeight = Math.max(30, startHeight - deltaY);
      }

      if (newWidth > maxWidth) newWidth = maxWidth;

      if (isImg) {
        target.style.width = Math.round(newWidth) + 'px';
        if (handleType === 'e' || handleType === 'w') {
          target.style.height = 'auto';
        } else {
          target.style.height = Math.round(newHeight) + 'px';
        }
        target.style.maxWidth = '100%';
      } else if (isTable) {
        target.style.width = Math.round(newWidth) + 'px';
        if (handleType === 's' || handleType === 'se') {
          target.style.height = Math.round(newHeight) + 'px';
        }
      }

      this._updateOverlayPosition();

      // Tooltip informativo con dimensiones exactas
      const badge = overlay?.querySelector('.resizer-dimension-badge');
      if (badge) {
        badge.textContent = `${Math.round(target.offsetWidth)} × ${Math.round(target.offsetHeight)} px`;
      }
    };

    const onMouseUp = () => {
      this._isResizing = false;
      if (overlay) overlay.classList.remove('is-resizing');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      this.triggerAutoSave(false);
      setTimeout(() => this.recalculatePagination(), 100);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  },

  _startColResize(e, cell) {
    this._isResizingCol = true;
    document.body.style.cursor = 'col-resize';
    const table = cell.closest('table');
    const startX = e.clientX;
    const startWidth = cell.offsetWidth;
    const colIndex = Array.from(cell.parentElement.children).indexOf(cell);

    const onMouseMove = (ev) => {
      const deltaX = ev.clientX - startX;
      const newWidth = Math.max(30, startWidth + deltaX);
      table.querySelectorAll('tr').forEach(row => {
        if (row.children[colIndex]) {
          row.children[colIndex].style.width = newWidth + 'px';
        }
      });
      this._updateOverlayPosition();
    };

    const onMouseUp = () => {
      this._isResizingCol = false;
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.triggerAutoSave(false);
      setTimeout(() => this.recalculatePagination(), 100);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  },

  _renderTableToolbar(table) {
    return `
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._addTableRow()" title="Insertar fila abajo">
        ➕ Fila
      </button>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._addTableColumn()" title="Insertar columna a la derecha">
        ➕ Col
      </button>
      <div class="tb-sep"></div>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._deleteTableRow()" title="Eliminar fila actual">
        ➖ Fila
      </button>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._deleteTableColumn()" title="Eliminar columna actual">
        ➖ Col
      </button>
      <div class="tb-sep"></div>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._setTableWidth('100%')" title="Ajustar tabla al 100% del ancho">
        ↔️ 100%
      </button>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._setTableWidth('auto')" title="Ajustar tabla al contenido">
        Ajustar
      </button>
      <div class="tb-sep"></div>
      <button type="button" class="btn-delete" onmousedown="event.preventDefault()" onclick="NotebookEditor._deleteSelectedTable()" title="Eliminar tabla">
        🗑️
      </button>
    `;
  },

  _renderImageToolbar(img) {
    return `
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._setImageWidth('25%')">25%</button>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._setImageWidth('50%')">50%</button>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._setImageWidth('75%')">75%</button>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._setImageWidth('100%')">100%</button>
      <div class="tb-sep"></div>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._alignImage('left')" title="Alinear izquierda">⇤ Izq</button>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._alignImage('center')" title="Centrar">≡ Centro</button>
      <button type="button" onmousedown="event.preventDefault()" onclick="NotebookEditor._alignImage('right')" title="Alinear derecha">⇥ Der</button>
      <div class="tb-sep"></div>
      <button type="button" class="btn-delete" onmousedown="event.preventDefault()" onclick="NotebookEditor._deleteSelectedImage()" title="Eliminar imagen">
        🗑️ Eliminar
      </button>
    `;
  },

  _setImageWidth(width) {
    if (!this._selectedElement || this._selectedElement.tagName !== 'IMG') return;
    this._selectedElement.style.width = width;
    this._selectedElement.style.height = 'auto';
    this._selectedElement.style.maxWidth = '100%';
    this._updateOverlayPosition();
    this.triggerAutoSave(false);
    setTimeout(() => this.recalculatePagination(), 100);
  },

  _alignImage(align) {
    if (!this._selectedElement || this._selectedElement.tagName !== 'IMG') return;
    const img = this._selectedElement;
    const wrapper = img.closest('div[style*="text-align"]') || img.parentElement;
    if (wrapper && wrapper.tagName === 'DIV' && wrapper !== document.getElementById('notebook-single-editor')) {
      wrapper.style.textAlign = align;
    } else {
      if (align === 'left') {
        img.style.float = 'left';
        img.style.marginRight = '1rem';
        img.style.marginLeft = '0';
        img.style.display = '';
      } else if (align === 'right') {
        img.style.float = 'right';
        img.style.marginLeft = '1rem';
        img.style.marginRight = '0';
        img.style.display = '';
      } else {
        img.style.float = '';
        img.style.display = 'block';
        img.style.margin = '0 auto';
      }
    }
    this._updateOverlayPosition();
    this.triggerAutoSave(false);
  },

  _deleteSelectedImage() {
    if (!this._selectedElement || this._selectedElement.tagName !== 'IMG') return;
    const img = this._selectedElement;
    this._hideResizerOverlay();

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
    setTimeout(() => this.recalculatePagination(), 100);
  },

  _addTableRow() {
    if (!this._selectedElement || this._selectedElement.tagName !== 'TABLE') return;
    const table = this._selectedElement;
    const activeCell = this._selectedTableCell;
    let targetRow = activeCell ? activeCell.closest('tr') : null;
    if (!targetRow) {
      const rows = table.querySelectorAll('tr');
      targetRow = rows[rows.length - 1];
    }
    if (!targetRow) return;

    const colCount = targetRow.children.length;
    const newRow = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td');
      td.style.border = '1px solid #cbd5e1';
      td.style.padding = '8px 12px';
      td.innerHTML = '&nbsp;';
      newRow.appendChild(td);
    }

    if (targetRow.nextSibling) {
      targetRow.parentNode.insertBefore(newRow, targetRow.nextSibling);
    } else {
      targetRow.parentNode.appendChild(newRow);
    }

    this._updateOverlayPosition();
    this.triggerAutoSave(false);
    setTimeout(() => this.recalculatePagination(), 100);
  },

  _addTableColumn() {
    if (!this._selectedElement || this._selectedElement.tagName !== 'TABLE') return;
    const table = this._selectedElement;
    const activeCell = this._selectedTableCell;
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) return;

    let colIndex = activeCell ? Array.from(activeCell.parentElement.children).indexOf(activeCell) : (rows[0].children.length - 1);
    if (colIndex < 0) colIndex = rows[0].children.length - 1;

    rows.forEach((row, rIdx) => {
      const isHeader = row.querySelector('th') || (rIdx === 0 && row.parentElement.tagName === 'THEAD');
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px 12px';
      if (isHeader) {
        newCell.style.fontWeight = '700';
        newCell.style.background = '#f8fafc';
        newCell.style.color = '#1e293b';
        newCell.textContent = `Col ${row.children.length + 1}`;
      } else {
        newCell.innerHTML = '&nbsp;';
      }

      if (row.children[colIndex] && row.children[colIndex].nextSibling) {
        row.insertBefore(newCell, row.children[colIndex].nextSibling);
      } else {
        row.appendChild(newCell);
      }
    });

    this._updateOverlayPosition();
    this.triggerAutoSave(false);
    setTimeout(() => this.recalculatePagination(), 100);
  },

  _deleteTableRow() {
    if (!this._selectedElement || this._selectedElement.tagName !== 'TABLE') return;
    const table = this._selectedElement;
    const activeCell = this._selectedTableCell;
    const row = activeCell ? activeCell.closest('tr') : table.querySelector('tbody tr:last-child');
    if (!row) return;

    const totalRows = table.querySelectorAll('tr').length;
    if (totalRows <= 1) {
      this._deleteSelectedTable();
      return;
    }

    row.remove();
    this._selectedTableCell = null;
    this._updateOverlayPosition();
    this.triggerAutoSave(false);
    setTimeout(() => this.recalculatePagination(), 100);
  },

  _deleteTableColumn() {
    if (!this._selectedElement || this._selectedElement.tagName !== 'TABLE') return;
    const table = this._selectedElement;
    const activeCell = this._selectedTableCell;
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) return;

    const colIndex = activeCell ? Array.from(activeCell.parentElement.children).indexOf(activeCell) : (rows[0].children.length - 1);
    if (colIndex < 0) return;

    if (rows[0].children.length <= 1) {
      this._deleteSelectedTable();
      return;
    }

    rows.forEach(row => {
      if (row.children[colIndex]) {
        row.children[colIndex].remove();
      }
    });

    this._selectedTableCell = null;
    this._updateOverlayPosition();
    this.triggerAutoSave(false);
    setTimeout(() => this.recalculatePagination(), 100);
  },

  _setTableWidth(width) {
    if (!this._selectedElement || this._selectedElement.tagName !== 'TABLE') return;
    const table = this._selectedElement;
    table.style.width = width;
    if (width === 'auto') {
      table.querySelectorAll('th, td').forEach(c => c.style.width = '');
    }
    this._updateOverlayPosition();
    this.triggerAutoSave(false);
    setTimeout(() => this.recalculatePagination(), 100);
  },

  _deleteSelectedTable() {
    if (!this._selectedElement || this._selectedElement.tagName !== 'TABLE') return;
    const table = this._selectedElement;
    if (!confirm('¿Deseas eliminar esta tabla?')) return;
    this._hideResizerOverlay();
    table.remove();
    this.triggerAutoSave(false);
    setTimeout(() => this.recalculatePagination(), 100);
  },

  // =========================================================================
  // VISUALIZACIÓN DE CAMBIOS DE PÁGINA EN EL EDITOR
  // =========================================================================

  _initPageBreakOverlay() {
    const editor = document.getElementById('notebook-single-editor');
    const paperContainer = document.querySelector('.notebook-paper-container');
    if (!editor || !paperContainer) return;

    // Actualización inicial de paginación mediante el motor matemático
    setTimeout(() => this.recalculatePagination(), 100);

    // Re-calcular al editar con debounce seguro (750ms) usando PaginationEngine
    if (!editor._pageBreakBound) {
      editor._pageBreakBound = true;
      editor.addEventListener('input', () => {
        if (typeof PaginationEngine !== 'undefined') {
          PaginationEngine.schedulePagination(paperContainer, editor, 750);
        }
      });
    }

    // Re-calcular al cambiar tamaño de ventana
    if (typeof window !== 'undefined' && !window._notebookResizeBound) {
      window._notebookResizeBound = true;
      window.addEventListener('resize', this._debounce(() => this.recalculatePagination(), 300));
    }
  },

  _debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  recalculatePagination() {
    const editor = document.getElementById('notebook-single-editor');
    const paperContainer = document.querySelector('.notebook-paper-container');
    if (!editor || !paperContainer || !editor.isConnected) return { totalPages: 1, breaks: [] };
    if (typeof PaginationEngine !== 'undefined') {
      return PaginationEngine.paginate(paperContainer, editor);
    }
    return { totalPages: 1, breaks: [] };
  },

  _updatePageBreakIndicators() {
    return this.recalculatePagination();
  },

  setMargin(marginCm) {
    const margin = parseFloat(marginCm) || 1.27;
    if (typeof PageConfig !== 'undefined') {
      PageConfig.setMargins(margin, margin, margin, margin);
    }
    // Sincronizar selectores si existen en el DOM
    const s1 = document.getElementById('nb-margin-select');
    if (s1) s1.value = String(margin);
    const s2 = document.getElementById('nb-margin-select-full');
    if (s2) s2.value = String(margin);

    // Actualizar inmediatamente el padding visual de la hoja
    document.querySelectorAll('.notebook-paper-container').forEach(p => {
      p.style.padding = margin + 'cm';
    });

    this.recalculatePagination();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Margen configurado en ${margin} cm en los 4 lados`, 'info');
    }
  },

  setPaperSize(sizeName) {
    if (typeof PageConfig !== 'undefined') {
      PageConfig.setPaperSize(sizeName);
    }
    this.recalculatePagination();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Tamaño de papel: ${sizeName === 'a4' ? 'A4' : 'Carta'}`, 'info');
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
