/**
 * MODAL DE IMPORTACIÓN INTELIGENTE (ImportModal)
 * 
 * Permite al docente pegar cualquier texto de planeación (estructurado o no estructurado),
 * analizarlo automáticamente con ImportParser, previsualizar la extracción,
 * resolver conflictos de identidad (Clase #7 vs Clase #2) y aplicar cambios
 * con salvaguarda total y opción de deshacer.
 */

class ImportModalClass {
  constructor() {
    this.targetClass = null;
    this.analysisResult = null;
    this.onSuccessCallback = null;
    this.backdrop = null;
  }

  init() {
    this._ensureModalMarkup();
  }

  /**
   * Abre el modal para importar sobre una clase existente o como nueva clase
   */
  open(targetClass = null, onSuccess = null) {
    this._ensureModalMarkup();
    this.targetClass = targetClass ? JSON.parse(JSON.stringify(targetClass)) : null;
    this.onSuccessCallback = onSuccess;
    this.analysisResult = null;

    // Resetear vistas del modal
    const textarea = document.getElementById('import-modal-textarea');
    if (textarea) textarea.value = '';

    const previewPanel = document.getElementById('import-modal-preview-panel');
    if (previewPanel) previewPanel.style.display = 'none';

    const inputPanel = document.getElementById('import-modal-input-panel');
    if (inputPanel) inputPanel.style.display = 'block';

    const contextEl = document.getElementById('import-modal-target-context');
    if (contextEl) {
      if (this.targetClass) {
        contextEl.innerHTML = `
          <div class="import-context-pill">
            <span>🎯 Destino: <strong>${this.targetClass.subjectName || 'Clase'} — ${this.targetClass.gradeName || ''}</strong></span>
            <span class="badge-seq">Clase #${this.targetClass.sequenceNumber}</span>
            <span class="badge-date">📅 ${this.targetClass.date || 'Sin fecha'}</span>
          </div>
        `;
      } else {
        contextEl.innerHTML = `
          <div class="import-context-pill info">
            <span>➕ Modo: <strong>Crear nueva clase independiente</strong> (o seleccionar destino tras analizar)</span>
          </div>
        `;
      }
    }

    this._attachPasteHandler();

    if (this.backdrop) {
      this.backdrop.classList.add('active');
    }
  }

  close() {
    if (this.backdrop) {
      this.backdrop.classList.remove('active');
    }
  }

  /**
   * Analiza el texto pegado en el textarea
   */
  analyzeText() {
    const textarea = document.getElementById('import-modal-textarea');
    const rawText = textarea ? textarea.value.trim() : '';

    if (!rawText) {
      alert('Por favor pega el texto de la planeación antes de analizar.');
      return;
    }

    try {
      this.analysisResult = ImportService.prepareImport(rawText, this.targetClass);
      this._renderPreview();
    } catch (err) {
      console.error('[ImportModal] Error al analizar planeación:', err);
      alert('Ocurrió un error al analizar la planeación: ' + err.message);
    }
  }

  _renderPreview() {
    const inputPanel = document.getElementById('import-modal-input-panel');
    const previewPanel = document.getElementById('import-modal-preview-panel');
    if (inputPanel) inputPanel.style.display = 'none';
    if (previewPanel) previewPanel.style.display = 'block';

    const res = this.analysisResult;
    const parsed = res.parsed;
    const conflicts = res.conflicts || [];
    const hasConflicts = res.hasConflicts;

    // 1. Checklist de componentes detectados
    const checklistHtml = `
      <div class="import-detection-grid">
        <div class="detection-item ${parsed.metadata.hasPart1 ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.metadata.hasPart1 ? '✅' : '⚪'}</span>
          <span class="det-label">Parte 1 (Secuencia Didáctica)</span>
        </div>
        <div class="detection-item ${parsed.metadata.hasPart2 ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.metadata.hasPart2 ? '✅' : '⚪'}</span>
          <span class="det-label">Parte 2 (Cuaderno del Docente)</span>
        </div>
        <div class="detection-item ${parsed.curriculum.topic ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.curriculum.topic ? '✅' : '⚪'}</span>
          <span class="det-label">Tema Principal: <em>${this._escape(parsed.curriculum.topic || 'No detectado')}</em></span>
        </div>
        <div class="detection-item ${parsed.curriculum.dba ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.curriculum.dba ? '✅' : '⚪'}</span>
          <span class="det-label">DBA detectado</span>
        </div>
        <div class="detection-item ${parsed.didacticSequence.inicio ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.didacticSequence.inicio ? '✅' : '⚪'}</span>
          <span class="det-label">Fase de Inicio ${parsed.didacticSequence.durations.inicio ? `(${parsed.didacticSequence.durations.inicio} min)` : ''}</span>
        </div>
        <div class="detection-item ${parsed.didacticSequence.desarrollo ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.didacticSequence.desarrollo ? '✅' : '⚪'}</span>
          <span class="det-label">Fase de Desarrollo ${parsed.didacticSequence.durations.desarrollo ? `(${parsed.didacticSequence.durations.desarrollo} min)` : ''}</span>
        </div>
        <div class="detection-item ${parsed.didacticSequence.cierre ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.didacticSequence.cierre ? '✅' : '⚪'}</span>
          <span class="det-label">Fase de Cierre ${parsed.didacticSequence.durations.cierre ? `(${parsed.didacticSequence.durations.cierre} min)` : ''}</span>
        </div>
        <div class="detection-item ${parsed.teacherNotebook.studentNotebookContent ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.teacherNotebook.studentNotebookContent ? '✅' : '⚪'}</span>
          <span class="det-label">Contenido de Cuaderno</span>
        </div>
        <div class="detection-item ${parsed.teacherNotebook.practicalActivity ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.teacherNotebook.practicalActivity ? '✅' : '⚪'}</span>
          <span class="det-label">Actividad / Taller Práctico</span>
        </div>
        <div class="detection-item ${parsed.observations || parsed.didacticSequence.observaciones ? 'detected' : 'missing'}">
          <span class="det-icon">${parsed.observations || parsed.didacticSequence.observaciones ? '✅' : '⚪'}</span>
          <span class="det-label">Observaciones Pedagógicas</span>
        </div>
      </div>
    `;

    // 2. Manejo de Conflictos de Identidad (Req. 40-45, 119)
    let conflictHtml = '';
    if (this.targetClass && hasConflicts) {
      const parsedSeq = parsed.metadata?.sequenceNumber ?? parsed.general?.sequenceNumber ?? null;
      const targetSeq = this.targetClass.sequenceNumber;
      const parsedGrd = parsed.metadata?.grade || parsed.general?.grade || '';
      const targetGrd = this.targetClass.gradeName;

      conflictHtml = `
        <div class="import-conflict-alert">
          <div class="alert-icon">⚠️</div>
          <div class="alert-body">
            <h4 style="margin:0 0 0.4rem; color:#b45309;">Conflicto de identidad detectado</h4>
            <p style="margin:0 0 0.5rem; font-size:0.85rem; color:#92400e;">
              El texto importado indica <strong>Clase #${parsedSeq || '—'} (${parsedGrd || '—'})</strong>, 
              pero estás editando actualmente la <strong>Clase #${targetSeq} (${targetGrd})</strong>.
            </p>
            <div class="identity-resolution-options">
              <label class="radio-option active" id="label-res-keep">
                <input type="radio" name="import_identity_action" value="keep" checked onchange="ImportModal.onResolutionChange('keep')" />
                <div>
                  <strong>Preservar identidad actual (Recomendado)</strong>
                  <div class="desc">Mantiene la Clase #${targetSeq} (${targetGrd}) y solo actualiza los temas y contenidos pedagógicos.</div>
                </div>
              </label>

              <label class="radio-option" id="label-res-new">
                <input type="radio" name="import_identity_action" value="new" onchange="ImportModal.onResolutionChange('new')" />
                <div>
                  <strong>Importar como nueva clase independiente</strong>
                  <div class="desc">Crea una nueva clase para ${parsedGrd || targetGrd} con consecutivo automático (max + 1) sin tocar la Clase #${targetSeq}.</div>
                </div>
              </label>

              <label class="radio-option" id="label-res-overwrite">
                <input type="radio" name="import_identity_action" value="overwrite" onchange="ImportModal.onResolutionChange('overwrite')" />
                <div>
                  <strong>Sobrescribir identidad</strong>
                  <div class="desc">Cambia el consecutivo de esta clase a #${parsedSeq} y grado a ${parsedGrd}. <em>(Usar con precaución)</em></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      `;
    }

    // 3. Campos extraídos para edición rápida previa a la aplicación
    const fieldsHtml = `
      <div class="import-fields-review">
        <h4 style="margin:0.75rem 0 0.5rem; font-size:0.9rem; color:#1e293b;">Revisar y ajustar contenido extraído:</h4>
        
        <div class="form-group">
          <label class="form-label" style="font-size:0.8rem;">Tema principal:</label>
          <input type="text" id="preview-field-topic" class="form-input" value="${this._escape(parsed.curriculum.topic || '')}" />
        </div>

        <div class="preview-fields-row">
          <div class="form-group half-width">
            <label class="form-label" style="font-size:0.8rem;">DBA:</label>
            <textarea id="preview-field-dba" class="form-textarea" rows="2">${this._escape(parsed.curriculum.dba || '')}</textarea>
          </div>
          <div class="form-group half-width">
            <label class="form-label" style="font-size:0.8rem;">Logro / Desempeño:</label>
            <textarea id="preview-field-achievement" class="form-textarea" rows="2">${this._escape(parsed.curriculum.achievement || '')}</textarea>
          </div>
        </div>

        <div class="preview-fields-tabs">
          <div class="tab-header">
            <strong>Fases didácticas detectadas:</strong>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size:0.75rem;">1. Inicio ${parsed.didacticSequence.durations.inicio ? `(${parsed.didacticSequence.durations.inicio} min)` : ''}:</label>
            <textarea id="preview-field-inicio" class="form-textarea" rows="2">${this._escape(parsed.didacticSequence.inicio || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size:0.75rem;">2. Desarrollo ${parsed.didacticSequence.durations.desarrollo ? `(${parsed.didacticSequence.durations.desarrollo} min)` : ''}:</label>
            <textarea id="preview-field-desarrollo" class="form-textarea" rows="3">${this._escape(parsed.didacticSequence.desarrollo || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size:0.75rem;">3. Cierre ${parsed.didacticSequence.durations.cierre ? `(${parsed.didacticSequence.durations.cierre} min)` : ''}:</label>
            <textarea id="preview-field-cierre" class="form-textarea" rows="2">${this._escape(parsed.didacticSequence.cierre || '')}</textarea>
          </div>
        </div>

        ${parsed.teacherNotebook.studentNotebookContent ? `
          <div class="form-group" style="margin-top:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">📖 Cuaderno del estudiante / Guía:</label>
            <textarea id="preview-field-notebook" class="form-textarea" rows="3">${this._escape(parsed.teacherNotebook.studentNotebookContent || '')}</textarea>
          </div>
        ` : ''}

        ${parsed.teacherNotebook.practicalActivity ? `
          <div class="form-group" style="margin-top:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">🛠️ Taller o Actividad Práctica:</label>
            <textarea id="preview-field-activity" class="form-textarea" rows="3">${this._escape(parsed.teacherNotebook.practicalActivity || '')}</textarea>
          </div>
        ` : ''}

        ${(parsed.observations || parsed.didacticSequence?.observaciones) ? `
          <div class="form-group" style="margin-top:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">📝 Observaciones Pedagógicas de la Sesión:</label>
            <textarea id="preview-field-observaciones" class="form-textarea" rows="3">${this._escape(parsed.observations || parsed.didacticSequence?.observaciones || '')}</textarea>
          </div>
        ` : ''}
      </div>
    `;

    previewPanel.innerHTML = `
      <div class="preview-content-scroll">
        ${checklistHtml}
        ${conflictHtml}
        ${fieldsHtml}
      </div>

      <div class="modal-footer import-footer">
        <button type="button" class="btn btn-secondary" onclick="ImportModal.backToInput()">
          ← Volver a editar texto
        </button>

        <div class="footer-action-buttons">
          <button type="button" class="btn btn-secondary" onclick="ImportModal.close()">
            Cancelar
          </button>
          
          <button type="button" class="btn btn-primary" onclick="ImportModal.importAsNewClass()">
            ➕ Importar como nueva clase
          </button>

          ${this.targetClass ? `
            <button type="button" class="btn btn-success" id="btn-apply-to-target" onclick="ImportModal.applyToCurrentClass()">
              ✅ Aplicar a Clase #${this.targetClass.sequenceNumber}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  onResolutionChange(val) {
    ['keep', 'new', 'overwrite'].forEach(id => {
      const el = document.getElementById(`label-res-${id}`);
      if (el) {
        if (id === val) el.classList.add('active');
        else el.classList.remove('active');
      }
    });

    const btnApply = document.getElementById('btn-apply-to-target');
    if (btnApply) {
      if (val === 'new') {
        btnApply.style.display = 'none';
      } else {
        btnApply.style.display = 'inline-flex';
      }
    }
  }

  backToInput() {
    const inputPanel = document.getElementById('import-modal-input-panel');
    const previewPanel = document.getElementById('import-modal-preview-panel');
    if (inputPanel) inputPanel.style.display = 'block';
    if (previewPanel) previewPanel.style.display = 'none';
  }

  /**
   * Recolecta cualquier corrección manual hecha en los inputs de previsualización
   */
  _getAdjustedParsedData() {
    if (!this.analysisResult || !this.analysisResult.parsed) return null;
    const p = JSON.parse(JSON.stringify(this.analysisResult.parsed));

    const topicEl = document.getElementById('preview-field-topic');
    if (topicEl) p.curriculum.topic = topicEl.value.trim();

    const dbaEl = document.getElementById('preview-field-dba');
    if (dbaEl) p.curriculum.dba = dbaEl.value.trim();

    const achEl = document.getElementById('preview-field-achievement');
    if (achEl) p.curriculum.achievement = achEl.value.trim();

    const inicioEl = document.getElementById('preview-field-inicio');
    if (inicioEl) p.didacticSequence.inicio = inicioEl.value.trim();

    const desEl = document.getElementById('preview-field-desarrollo');
    if (desEl) p.didacticSequence.desarrollo = desEl.value.trim();

    const cierreEl = document.getElementById('preview-field-cierre');
    if (cierreEl) p.didacticSequence.cierre = cierreEl.value.trim();

    const nbEl = document.getElementById('preview-field-notebook');
    if (nbEl) p.teacherNotebook.studentNotebookContent = nbEl.value.trim();

    const actEl = document.getElementById('preview-field-activity');
    if (actEl) p.teacherNotebook.practicalActivity = actEl.value.trim();

    const obsEl = document.getElementById('preview-field-observaciones');
    if (obsEl) {
      const obsVal = obsEl.value.trim();
      p.didacticSequence.observaciones = obsVal;
      p.observations = obsVal;
    }

    return p;
  }

  /**
   * Aplica a la clase actual en edición
   */
  applyToCurrentClass() {
    if (!this.targetClass) {
      this.importAsNewClass();
      return;
    }

    const adjustedData = this._getAdjustedParsedData();
    const actionRadio = document.querySelector('input[name="import_identity_action"]:checked');
    const identityAction = actionRadio ? actionRadio.value : 'keep';

    if (identityAction === 'new') {
      this.importAsNewClass();
      return;
    }

    const decisions = {};
    if (identityAction === 'overwrite') {
      decisions.sequenceNumber = 'import';
      decisions.grade = 'import';
      decisions.date = 'import';
      decisions.subject = 'import';
    } else {
      decisions.sequenceNumber = 'target';
      decisions.grade = 'target';
      decisions.date = 'target';
      decisions.subject = 'target';
    }

    try {
      const updated = ImportService.applyToExistingClass(this.targetClass, adjustedData, decisions);
      this.close();

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`✅ Planeación importada a Clase #${updated.sequenceNumber}.`, 'success');
      }

      this._showUndoToast(updated.id);

      if (this.onSuccessCallback) {
        this.onSuccessCallback(updated);
      } else if (typeof ClassEditorView !== 'undefined' && ClassEditorView.loadClass) {
        ClassEditorView.loadClass(updated.id);
      } else if (typeof DashboardView !== 'undefined' && DashboardView.render) {
        DashboardView.render();
      }
    } catch (err) {
      console.error('[ImportModal] Error al aplicar planeación:', err);
      alert('Error al guardar planeación: ' + err.message);
    }
  }

  /**
   * Importa como una nueva clase independiente (max + 1)
   */
  importAsNewClass() {
    const adjustedData = this._getAdjustedParsedData();
    const tid = typeof ClassRepository !== 'undefined' && ClassRepository._getCurrentTeacherId ? ClassRepository._getCurrentTeacherId() : 'usr_manuel';
    const options = this.targetClass ? {
      subjectName: this.targetClass.subjectName,
      gradeName: this.targetClass.gradeName,
      group: this.targetClass.group,
      period: this.targetClass.period,
      targetClass: this.targetClass
    } : {};

    try {
      const created = ImportService.importAsNewClass(adjustedData, options, tid);
      this.close();

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`✅ Creada nueva clase #${created.sequenceNumber} para ${created.subjectName} (${created.gradeName}).`, 'success');
      }

      if (this.onSuccessCallback) {
        this.onSuccessCallback(created);
      } else if (typeof AppRouter !== 'undefined') {
        AppRouter.navigateTo('class-editor', { classId: created.id });
      }
    } catch (err) {
      console.error('[ImportModal] Error al crear nueva clase:', err);
      alert('Error al crear clase: ' + err.message);
    }
  }

  _showUndoToast(classId) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const undoDiv = document.createElement('div');
    undoDiv.className = 'toast toast-info import-undo-toast';
    undoDiv.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%;">
        <span>Planeación importada correctamente.</span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="ImportModal.triggerUndo('${classId}', this)" style="background:#fff; color:#1e293b; font-weight:700;">
          ↩️ Deshacer importación
        </button>
      </div>
    `;
    toastContainer.appendChild(undoDiv);

    // Desaparecer a los 12 segundos
    setTimeout(() => {
      if (undoDiv.parentNode) undoDiv.parentNode.removeChild(undoDiv);
    }, 12000);
  }

  triggerUndo(classId, btn) {
    const undone = ImportService.undoLastImport();
    if (undone) {
      if (btn && btn.closest('.import-undo-toast')) {
        btn.closest('.import-undo-toast').remove();
      }
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('↩️ Se ha revertido la planeación al estado anterior.', 'info');
      }
      if (typeof ClassEditorView !== 'undefined' && ClassEditorView.loadClass) {
        ClassEditorView.loadClass(classId);
      } else if (typeof DashboardView !== 'undefined') {
        DashboardView.render();
      }
    } else {
      alert('No se pudo deshacer la importación o el historial ya no está disponible.');
    }
  }

  _escape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  _ensureModalMarkup() {
    let el = document.getElementById('import-planning-modal-backdrop');
    if (el) {
      this.backdrop = el;
      return;
    }

    const html = `
      <div class="modal-backdrop" id="import-planning-modal-backdrop">
        <div class="modal-card modal-large" style="max-width: 900px;">
          <div class="modal-header">
            <h2 id="import-modal-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Importador Inteligente de Planeaciones
            </h2>
            <button type="button" class="btn-close-modal" onclick="ImportModal.close()">&times;</button>
          </div>

          <div class="modal-body" style="padding: 1.25rem;">
            <!-- Contexto del destino -->
            <div id="import-modal-target-context" style="margin-bottom: 1rem;"></div>

            <!-- Panel 1: Entrada de texto -->
            <div id="import-modal-input-panel">
              <p style="font-size:0.85rem; color:#64748b; margin-top:0;">
                Pega aquí tu planeación estructurada o texto generado. El importador detectará automáticamente las dos partes: 
                <strong>Secuencia Didáctica Institucional</strong> y <strong>Cuaderno del Docente</strong>.
              </p>

              <div class="form-group">
                <textarea id="import-modal-textarea" class="form-textarea" rows="12" style="font-family:monospace; font-size:0.85rem; line-height:1.5;" placeholder="Pega el texto aquí... Ej:

PARTE 1: SECUENCIA DIDÁCTICA
Asignatura: Robótica
Grado: 10°
Tema: Sensores y actuadores
Fase de Inicio (15 min): Activación de conocimientos previos...
Fase de Desarrollo (60 min): Montaje en protoboard...
Fase de Cierre (15 min): Demostración en grupo...

PARTE 2: CUADERNO DEL DOCENTE
Pregunta: ¿Cómo interactúa el robot con el entorno?
Contenido para el estudiante: Los sensores son transductores..."></textarea>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="ImportModal.reformatCurrentText()" title="Detecta encabezados pegados y restaura saltos de línea automáticamente" style="font-size:0.8rem; font-weight:600; color:var(--primary-700); border-color:var(--primary-200); background:var(--primary-50);">
                    🪄 Organizar saltos y formato
                  </button>
                  <span id="import-paste-feedback" style="display:none; font-size:0.78rem; color:#059669; font-weight:600;">✓ Formato y saltos restaurados</span>
                  <span id="import-paste-hint" style="font-size:0.75rem; color:#94a3b8;">Soporta Markdown, negritas y pegado directo desde Gemini</span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button type="button" class="btn btn-secondary" onclick="ImportModal.close()">Cancelar</button>
                  <button type="button" class="btn btn-primary btn-lg" onclick="ImportModal.analyzeText()">
                    🔍 Analizar planeación
                  </button>
                </div>
              </div>
            </div>

            <!-- Panel 2: Previsualización y Validación -->
            <div id="import-modal-preview-panel" style="display:none;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    this.backdrop = document.getElementById('import-planning-modal-backdrop');
    this._attachPasteHandler();
  }

  _attachPasteHandler() {
    const textarea = document.getElementById('import-modal-textarea');
    if (!textarea || textarea._smartPasteAttached) return;
    textarea._smartPasteAttached = true;

    textarea.addEventListener('paste', (e) => {
      const clipboardData = e.clipboardData || (typeof window !== 'undefined' ? window.clipboardData : null);
      if (!clipboardData) return;

      const html = clipboardData.getData ? clipboardData.getData('text/html') : '';
      const plain = clipboardData.getData ? clipboardData.getData('text/plain') : '';

      let formatted = '';
      if (html && html.trim() && typeof ImportParser !== 'undefined' && ImportParser.convertHtmlToFormattedText) {
        formatted = ImportParser.convertHtmlToFormattedText(html);
      } else if (plain && typeof ImportParser !== 'undefined' && ImportParser.unglueText) {
        formatted = ImportParser.unglueText(plain);
      }

      if (formatted && formatted.trim()) {
        e.preventDefault();
        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const current = textarea.value || '';

        if (!current.trim()) {
          textarea.value = formatted;
          textarea.selectionStart = textarea.selectionEnd = formatted.length;
        } else {
          let inserted = false;
          if (typeof document !== 'undefined' && document.execCommand) {
            try {
              inserted = document.execCommand('insertText', false, formatted);
            } catch (err) {}
          }
          if (!inserted) {
            textarea.value = current.substring(0, start) + formatted + current.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + formatted.length;
          }
        }

        if (typeof Event !== 'undefined') {
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        this._showPasteFormatFeedback();
      }
    });
  }

  reformatCurrentText() {
    const textarea = document.getElementById('import-modal-textarea');
    if (!textarea || !textarea.value.trim()) return;
    if (typeof ImportParser !== 'undefined' && ImportParser.unglueText) {
      textarea.value = ImportParser.unglueText(textarea.value);
      this._showPasteFormatFeedback();
    }
  }

  _showPasteFormatFeedback() {
    const fb = document.getElementById('import-paste-feedback');
    const hint = document.getElementById('import-paste-hint');
    if (fb) {
      fb.style.display = 'inline-block';
      if (hint) hint.style.display = 'none';
      setTimeout(() => {
        fb.style.display = 'none';
        if (hint) hint.style.display = 'inline-block';
      }, 3000);
    }
  }
}

const ImportModal = new ImportModalClass();

if (typeof window !== 'undefined') {
  window.ImportModal = ImportModal;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImportModal;
}
