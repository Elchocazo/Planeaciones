const assert = require('assert');
const fs = require('fs');

console.log('--- TEST: Texto dinámico de botones de resolución en ImportModal ---');

// Leer el archivo import-modal.js y validar su lógica
const code = fs.readFileSync('js/ui/import-modal.js', 'utf8');

assert.ok(code.includes("btnApply.innerHTML = `⚠️ Sobrescribir como ${seqLabel}`;"), 'Actualiza texto al seleccionar overwrite');
assert.ok(code.includes("btnApply.innerHTML = '➕ Importar como nueva clase';"), 'Actualiza texto al seleccionar new');
assert.ok(code.includes("btnApply.innerHTML = `✅ Aplicar a Clase #${targetSeq}`;"), 'Actualiza texto al seleccionar keep');
assert.ok(code.includes("btnApply.className = 'btn btn-warning';"), 'Aplica estilo btn-warning al sobrescribir');

// Simular el comportamiento del método onResolutionChange en un entorno mock
class MockElement {
  constructor(id) {
    this.id = id;
    this.classList = {
      _classes: new Set(),
      add(cls) { this._classes.add(cls); },
      remove(cls) { this._classes.delete(cls); },
      contains(cls) { return this._classes.has(cls); }
    };
    this.style = {};
    this.innerHTML = '';
    this.className = '';
  }
}

const elements = {
  'label-res-keep': new MockElement('label-res-keep'),
  'label-res-new': new MockElement('label-res-new'),
  'label-res-overwrite': new MockElement('label-res-overwrite'),
  'btn-apply-to-target': new MockElement('btn-apply-to-target'),
  'btn-import-as-new': new MockElement('btn-import-as-new')
};

global.document = {
  getElementById(id) {
    return elements[id] || null;
  }
};

// Cargar o emular onResolutionChange con la misma lógica
const fakeModal = {
  targetClass: { sequenceNumber: 19, gradeName: 'Séptimo' },
  analysisResult: {
    parsed: {
      metadata: { sequenceNumber: 16, grade: 'Séptimo' }
    }
  },
  onResolutionChange: function(val) {
    ['keep', 'new', 'overwrite'].forEach(id => {
      const el = document.getElementById(`label-res-${id}`);
      if (el) {
        if (id === val) el.classList.add('active');
        else el.classList.remove('active');
      }
    });

    const parsed = this.analysisResult?.parsed;
    const parsedSeq = parsed?.metadata?.sequenceNumber ?? parsed?.general?.sequenceNumber ?? null;
    const targetSeq = this.targetClass ? this.targetClass.sequenceNumber : '';

    const btnApply = document.getElementById('btn-apply-to-target');
    const btnNew = document.getElementById('btn-import-as-new');

    if (btnApply) {
      btnApply.style.display = 'inline-flex';
      if (val === 'overwrite') {
        const seqLabel = parsedSeq ? `Clase #${parsedSeq}` : (parsed?.metadata?.grade || parsed?.general?.grade ? `Grado ${parsed.metadata?.grade || parsed.general?.grade}` : 'nueva identidad');
        btnApply.innerHTML = `⚠️ Sobrescribir como ${seqLabel}`;
        btnApply.className = 'btn btn-warning';
        btnApply.style.background = '#d97706';
        btnApply.style.borderColor = '#d97706';
        btnApply.style.color = '#ffffff';
        if (btnNew) btnNew.style.display = 'none';
      } else if (val === 'new') {
        btnApply.innerHTML = '➕ Importar como nueva clase';
        btnApply.className = 'btn btn-primary';
        btnApply.style.background = '';
        btnApply.style.borderColor = '';
        btnApply.style.color = '';
        if (btnNew) btnNew.style.display = 'none';
      } else {
        // 'keep'
        btnApply.innerHTML = `✅ Aplicar a Clase #${targetSeq}`;
        btnApply.className = 'btn btn-success';
        btnApply.style.background = '#059669';
        btnApply.style.borderColor = '#059669';
        btnApply.style.color = '#ffffff';
        if (btnNew) btnNew.style.display = 'none';
      }
    }
  }
};

// 1. Caso default (keep)
fakeModal.onResolutionChange('keep');
assert.strictEqual(elements['btn-apply-to-target'].innerHTML, '✅ Aplicar a Clase #19');
assert.strictEqual(elements['label-res-keep'].classList.contains('active'), true);
console.log('  ✅ [PASS] keep -> Botón dice "✅ Aplicar a Clase #19"');

// 2. Caso overwrite (el caso del usuario con Clase #16 vs #19)
fakeModal.onResolutionChange('overwrite');
assert.strictEqual(elements['btn-apply-to-target'].innerHTML, '⚠️ Sobrescribir como Clase #16');
assert.strictEqual(elements['btn-apply-to-target'].className, 'btn btn-warning');
assert.strictEqual(elements['btn-apply-to-target'].style.background, '#d97706');
assert.strictEqual(elements['label-res-overwrite'].classList.contains('active'), true);
assert.strictEqual(elements['label-res-keep'].classList.contains('active'), false);
console.log('  ✅ [PASS] overwrite -> Botón dice "⚠️ Sobrescribir como Clase #16"');

// 3. Caso new
fakeModal.onResolutionChange('new');
assert.strictEqual(elements['btn-apply-to-target'].innerHTML, '➕ Importar como nueva clase');
assert.strictEqual(elements['btn-apply-to-target'].className, 'btn btn-primary');
assert.strictEqual(elements['label-res-new'].classList.contains('active'), true);
console.log('  ✅ [PASS] new -> Botón dice "➕ Importar como nueva clase"');

console.log('\nTodos los tests de texto dinámico en ImportModal pasaron exitosamente.\n');
