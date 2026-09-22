/**
 * SELECTOR DE MALLA CURRICULAR (CurriculumSelectorModal)
 * Permite seleccionar temas, DBAs y desempeños del banco curricular para copiarlos
 * a la clase activa en edición como snapshot inmutable (Req. 43, 44).
 */

class CurriculumSelectorModalClass {
  constructor() {
    this.modalEl = null;
    this.selectedPeriod = '1°';
    this.selectedSubject = '';
    this.selectedGrade = '';
  }

  init() {
    this.modalEl = document.getElementById('curriculum-picker-modal-backdrop');
  }

  openSelector() {
    if (!ClassEditorView || !ClassEditorView.currentClass) {
      alert('Debes tener una clase abierta en el editor para cambiar su contenido curricular.');
      return;
    }

    const cls = ClassEditorView.currentClass;
    this.selectedPeriod = cls.period || '1°';
    this.selectedSubject = cls.subjectName;
    this.selectedGrade = cls.gradeName;

    let backdrop = document.getElementById('curriculum-picker-modal-backdrop');
    if (!backdrop) {
      this._createModalDOM();
      backdrop = document.getElementById('curriculum-picker-modal-backdrop');
    }

    this.renderContent();
    backdrop.classList.add('active');
  }

  closeSelector() {
    const backdrop = document.getElementById('curriculum-picker-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  _createModalDOM() {
    const div = document.createElement('div');
    div.id = 'curriculum-picker-modal-backdrop';
    div.className = 'modal-backdrop';
    div.innerHTML = `
      <div class="modal-card modal-large" style="max-width: 960px;">
        <div class="modal-header">
          <h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            Seleccionar Contenido de la Malla Curricular
          </h2>
          <button type="button" class="btn-close-modal" onclick="CurriculumSelectorModal.closeSelector()">&times;</button>
        </div>
        <div class="modal-body" id="curriculum-picker-body" style="max-height: 72vh; overflow-y: auto;">
          <!-- Renderizado dinámico -->
        </div>
        <div class="modal-footer" style="justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" onclick="CurriculumSelectorModal.closeSelector()">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  }

  renderContent() {
    const container = document.getElementById('curriculum-picker-body');
    if (!container) return;

    const items = CurriculumRepository.getItems(this.selectedPeriod, this.selectedSubject, this.selectedGrade);

    container.innerHTML = `
      <div class="curriculum-picker-filters" style="display:flex; gap:10px; margin-bottom:1.25rem; flex-wrap:wrap; background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0;">
        <div>
          <label style="font-size:0.75rem; font-weight:700; color:#475569; display:block;">Período:</label>
          <select class="form-select" onchange="CurriculumSelectorModal.onPeriodChange(this.value)" style="padding:4px 8px; font-size:0.85rem;">
            <option value="1°" ${this.selectedPeriod === '1°' ? 'selected' : ''}>1° Período</option>
            <option value="2°" ${this.selectedPeriod === '2°' ? 'selected' : ''}>2° Período</option>
            <option value="3°" ${this.selectedPeriod === '3°' ? 'selected' : ''}>3° Período</option>
            <option value="4°" ${this.selectedPeriod === '4°' ? 'selected' : ''}>4° Período</option>
          </select>
        </div>
        <div>
          <label style="font-size:0.75rem; font-weight:700; color:#475569; display:block;">Asignatura:</label>
          <input type="text" class="form-input" value="${this.selectedSubject}" readonly style="background:#f1f5f9; padding:4px 8px; font-size:0.85rem;" />
        </div>
        <div>
          <label style="font-size:0.75rem; font-weight:700; color:#475569; display:block;">Grado:</label>
          <input type="text" class="form-input" value="${this.selectedGrade}" readonly style="background:#f1f5f9; padding:4px 8px; font-size:0.85rem;" />
        </div>
      </div>

      <div class="curriculum-items-list" style="display:flex; flex-direction:column; gap:12px;">
        ${items.length > 0 ? items.map((item, idx) => {
          return `
            <div class="curriculum-picker-card" style="border:1px solid #cbd5e1; border-radius:8px; padding:12px; background:#ffffff; transition:border-color 0.2s;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:6px;">
                <h4 style="margin:0; font-size:0.95rem; color:#1e3a8a;">${idx + 1}. ${item.topic}</h4>
                <button type="button" class="btn btn-primary btn-sm" onclick="CurriculumSelectorModal.applyItem(${idx})" style="flex-shrink:0;">
                  ✓ Usar este contenido
                </button>
              </div>
              ${item.dba ? `
                <div style="font-size:0.78rem; color:#475569; margin-bottom:4px; line-height:1.35;">
                  <strong>DBA:</strong> ${item.dba.slice(0, 180)}...
                </div>
              ` : ''}
              ${item.achievement ? `
                <div style="font-size:0.78rem; color:#475569; line-height:1.35;">
                  <strong>Desempeño / Logro:</strong> ${item.achievement.slice(0, 180)}...
                </div>
              ` : ''}
            </div>
          `;
        }).join('') : `
          <div style="padding:2rem; text-align:center; color:#94a3b8;">
            No se encontraron temas en la malla para esta combinación de asignatura y grado.
          </div>
        `}
      </div>
    `;
  }

  onPeriodChange(val) {
    this.selectedPeriod = val;
    this.renderContent();
  }

  applyItem(itemIndex) {
    const items = CurriculumRepository.getItems(this.selectedPeriod, this.selectedSubject, this.selectedGrade);
    const selected = items[itemIndex];
    if (!selected) return;

    // Actualizar campos del editor directamente
    const topicInput = document.getElementById('editor-input-topic');
    const dbaInput = document.getElementById('editor-input-dba');
    const achInput = document.getElementById('editor-input-achievement');

    if (topicInput) topicInput.value = selected.topic || '';
    if (dbaInput) dbaInput.value = selected.dba || '';
    if (achInput) achInput.value = selected.achievement || '';

    // Si tiene secuencia sugerida y el desarrollo está vacío, sugerirlo
    const devInput = document.getElementById('editor-input-desarrollo');
    if (devInput && !devInput.value.trim() && selected.suggestedSequence) {
      devInput.value = selected.suggestedSequence;
    }

    if (typeof ClassEditorView !== 'undefined') {
      ClassEditorView.onFieldInput();
    }

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('✓ Contenido curricular aplicado a la clase', 'success');
    }

    this.closeSelector();
  }
}

const CurriculumSelectorModal = new CurriculumSelectorModalClass();

if (typeof window !== 'undefined') {
  window.CurriculumSelectorModal = CurriculumSelectorModal;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CurriculumSelectorModal;
}
