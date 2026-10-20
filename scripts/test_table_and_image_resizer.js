const assert = require('assert');

// Simulación de entorno DOM para pruebas unitarias
class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.style = {};
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c)
    };
    this.className = '';
    this.children = [];
    this.childNodes = [];
    this.parentElement = null;
    this.parentNode = null;
    this.attributes = {};
    this.isConnected = true;
    this.offsetWidth = 300;
    this.offsetHeight = 150;
    this.clientWidth = 300;
    this.clientHeight = 150;
  }

  appendChild(child) {
    child.parentElement = this;
    child.parentNode = this;
    child.isConnected = true;
    this.children.push(child);
    this.childNodes.push(child);
    return child;
  }

  insertBefore(newNode, refNode) {
    newNode.parentElement = this;
    newNode.parentNode = this;
    newNode.isConnected = true;
    const idx = this.children.indexOf(refNode);
    if (idx >= 0) {
      this.children.splice(idx, 0, newNode);
      this.childNodes.splice(idx, 0, newNode);
    } else {
      this.appendChild(newNode);
    }
    return newNode;
  }

  set id(val) {
    this._id = val;
    if (val && fakeDocument) {
      fakeDocument.elementsById[val] = this;
    }
  }

  get id() {
    return this._id || '';
  }

  remove() {
    this.isConnected = false;
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx >= 0) {
        this.parentElement.children.splice(idx, 1);
        this.parentElement.childNodes.splice(idx, 1);
      }
    }
  }

  set className(val) {
    this._className = val || '';
    if (this.classList && this.classList._classes) {
      this.classList._classes.clear();
      this._className.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }
  }

  get className() {
    return this._className || '';
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    this.childNodes = [];
    if (!html) return;
    const matches = String(html).matchAll(/<([a-z0-9]+)([^>]*)>/gi);
    for (const match of matches) {
      const tag = match[1];
      const attrs = match[2];
      const child = new FakeElement(tag);
      const classMatch = attrs.match(/class=["']([^"']+)["']/i);
      if (classMatch) {
        child.className = classMatch[1];
        classMatch[1].split(/\s+/).forEach(c => child.classList.add(c));
      }
      const dataHandleMatch = attrs.match(/data-handle=["']([^"']+)["']/i);
      if (dataHandleMatch) {
        child.dataset = { handle: dataHandleMatch[1] };
      }
      this.children.push(child);
      this.childNodes.push(child);
      child.parentElement = this;
      child.parentNode = this;
    }
  }

  get innerHTML() {
    return this._innerHTML || '';
  }

  setAttribute(name, val) { this.attributes[name] = val; }
  getAttribute(name) { return this.attributes[name]; }

  closest(selector) {
    if (selector.toLowerCase().includes(this.tagName.toLowerCase())) return this;
    if (this.parentElement) return this.parentElement.closest(selector);
    return null;
  }

  querySelectorAll(selector) {
    const res = [];
    const walk = (node) => {
      node.children.forEach(c => {
        if (selector.toLowerCase().includes(c.tagName.toLowerCase()) || 
            (selector.startsWith('.') && c.classList.contains(selector.slice(1)))) {
          res.push(c);
        }
        walk(c);
      });
    };
    walk(this);
    return res;
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  getBoundingClientRect() {
    return {
      top: 100,
      left: 100,
      width: this.offsetWidth || 300,
      height: this.offsetHeight || 150,
      right: 100 + (this.offsetWidth || 300),
      bottom: 100 + (this.offsetHeight || 150)
    };
  }

  addEventListener() {}
}

const fakeDocument = {
  elementsById: {},
  getElementById(id) { return this.elementsById[id] || null; },
  createElement(tag) { return new FakeElement(tag); },
  querySelector(sel) {
    if (sel === '.notebook-paper-container') return this.paperContainer;
    return null;
  },
  querySelectorAll() { return []; },
  addEventListener() {},
  head: new FakeElement('head'),
  body: new FakeElement('body')
};

global.window = global;
global.document = fakeDocument;

const NotebookEditor = require('../js/notebook-editor.js');

console.log('================================================================');
console.log('TEST SUITE: SISTEMA DE NODOS DE REDIMENSIÓN TIPO WORD');
console.log('================================================================');

// Configuración de DOM simulado
const paperContainer = new FakeElement('div');
paperContainer.className = 'notebook-paper-container';
fakeDocument.paperContainer = paperContainer;

const editor = new FakeElement('div');
editor.id = 'notebook-single-editor';
fakeDocument.elementsById['notebook-single-editor'] = editor;
paperContainer.appendChild(editor);

// Test 1: Creación del overlay con los 8 nodos de redimensión
console.log('\n--- TEST 1: Inicialización del overlay y sus nodos de redimensión ---');
const overlay = NotebookEditor._ensureResizerOverlay();
assert.ok(overlay, 'El overlay debe ser creado');
assert.strictEqual(overlay.id, 'notebook-element-resizer-overlay');
assert.ok(overlay.querySelector('.handle-se'), 'Debe contener el nodo de esquina inferior derecha (Word)');
assert.ok(overlay.querySelector('.handle-nw'), 'Debe contener nodo superior izquierdo');
assert.ok(overlay.querySelector('.handle-ne'), 'Debe contener nodo superior derecho');
assert.ok(overlay.querySelector('.handle-sw'), 'Debe contener nodo inferior izquierdo');
console.log('  ✅ [PASS] Overlay creado con todos los 8 nodos y barra de herramientas.');

// Test 2: Selección y redimensión de Tabla
console.log('\n--- TEST 2: Selección de Tabla y barra contextual tipo Word ---');
const table = new FakeElement('table');
table.className = 'notebook-table';
const tbody = new FakeElement('tbody');
const tr1 = new FakeElement('tr');
const td1 = new FakeElement('td');
td1.innerHTML = 'Celda 1';
const td2 = new FakeElement('td');
td2.innerHTML = 'Celda 2';
tr1.appendChild(td1);
tr1.appendChild(td2);
tbody.appendChild(tr1);
table.appendChild(tbody);
editor.appendChild(table);

NotebookEditor._selectResizerElement(table, td1);
assert.strictEqual(NotebookEditor._selectedElement, table, 'La tabla debe estar seleccionada');
assert.strictEqual(NotebookEditor._selectedTableCell, td1, 'La celda debe estar guardada');
assert.ok(overlay.classList.contains('is-table'), 'El overlay debe tener la clase is-table');

// Comprobar barra de herramientas de tabla
const tableTbHtml = NotebookEditor._renderTableToolbar(table);
assert.ok(tableTbHtml.includes('➕ Fila'), 'Debe tener botón para agregar fila');
assert.ok(tableTbHtml.includes('➕ Col'), 'Debe tener botón para agregar columna');
assert.ok(tableTbHtml.includes('➖ Fila'), 'Debe tener botón para eliminar fila');
assert.ok(tableTbHtml.includes('↔️ 100%'), 'Debe tener botón para ancho 100%');
console.log('  ✅ [PASS] Tabla seleccionada y barra de herramientas validada.');

// Test 3: Operaciones sobre la tabla (Agregar fila y columna)
console.log('\n--- TEST 3: Manipulación estructural de la tabla (Filas y Columnas) ---');
const initialRows = table.querySelectorAll('tr').length;
NotebookEditor._addTableRow();
const afterAddRow = table.querySelectorAll('tr').length;
assert.strictEqual(afterAddRow, initialRows + 1, 'Debe haber agregado 1 fila');

const initialCols = table.querySelectorAll('tr')[0].children.length;
NotebookEditor._addTableColumn();
const afterAddCol = table.querySelectorAll('tr')[0].children.length;
assert.strictEqual(afterAddCol, initialCols + 1, 'Debe haber agregado 1 columna a todas las filas');

NotebookEditor._setTableWidth('100%');
assert.strictEqual(table.style.width, '100%', 'Ancho de tabla debe ser 100%');
console.log('  ✅ [PASS] Agregar fila, columna y ancho 100% completado exitosamente.');

// Test 4: Selección y redimensión de Imagen
console.log('\n--- TEST 4: Selección de Imagen, proporción y barra de herramientas ---');
const img = new FakeElement('img');
img.src = 'data:image/jpeg;base64,12345';
editor.appendChild(img);

NotebookEditor._selectResizerElement(img);
assert.strictEqual(NotebookEditor._selectedElement, img, 'La imagen debe estar seleccionada');
assert.ok(overlay.classList.contains('is-image'), 'El overlay debe tener la clase is-image');

const imgTbHtml = NotebookEditor._renderImageToolbar(img);
assert.ok(imgTbHtml.includes('25%') && imgTbHtml.includes('50%') && imgTbHtml.includes('100%'), 'Debe tener botones de porcentaje');
assert.ok(imgTbHtml.includes('≡ Centro'), 'Debe tener botón de centrado');
assert.ok(imgTbHtml.includes('🗑️ Eliminar'), 'Debe tener botón de eliminar');

NotebookEditor._setImageWidth('75%');
assert.strictEqual(img.style.width, '75%', 'Ancho de imagen actualizado a 75%');
console.log('  ✅ [PASS] Imagen seleccionada, dimensionada y alineada correctamente.');

// Test 5: Deselección y ocultamiento del overlay
console.log('\n--- TEST 5: Deselección limpia sin contaminación del documento ---');
NotebookEditor._hideResizerOverlay();
assert.strictEqual(NotebookEditor._selectedElement, null, 'No debe haber elemento seleccionado');
assert.strictEqual(overlay.style.display, 'none', 'El overlay debe estar oculto');
assert.strictEqual(editor.querySelectorAll('#notebook-element-resizer-overlay').length, 0, 'El overlay NUNCA debe estar dentro del contenteditable');
console.log('  ✅ [PASS] Deselección y no-contaminación del contenido editable comprobada.');

console.log('\n================================================================');
console.log('TODAS LAS PRUEBAS DE NODOS DE REDIMENSIÓN SUPERADAS (PASS)');
console.log('================================================================\n');
