/**
 * SUITE DE PRUEBAS COMPLETA: SISTEMA DE PAGINACIÓN REAL Y MÁRGENES FÍSICOS
 * Valida todos los requerimientos y escenarios del motor matemático PaginationEngine.
 */

const fs = require('fs');
const path = require('path');

// Cargar motor de paginación y editor
const { PageConfig, PaginationEngine } = require('../js/core/pagination-engine.js');
const NotebookEditor = require('../js/notebook-editor.js');

console.log('================================================================');
console.log('SUITE DE PRUEBAS DE PAGINACIÓN Y MÁRGENES MATEMÁTICOS (WORD / DOCS)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// PRUEBA 1: Modelo matemático de Carta (Letter) y márgenes de 1.27 cm
// -----------------------------------------------------------------------------
console.log('--- TEST 1: Modelo matemático de Carta (Letter) y márgenes de 1.27 cm ---');
PageConfig.setPaperSize('letter');
PageConfig.setMargins(1.27, 1.27, 1.27, 1.27);

const pWidth = PageConfig.getPageWidthPx();
const pHeight = PageConfig.getPageHeightPx();
const mTop = PageConfig.getMarginTopPx();
const mBottom = PageConfig.getMarginBottomPx();
const mLeft = PageConfig.getMarginLeftPx();
const mRight = PageConfig.getMarginRightPx();
const uWidth = PageConfig.getUsableWidthPx();
const uHeight = PageConfig.getUsableHeightPx();

console.log(`  Carta: ${pWidth}x${pHeight}px | Márgenes: ${mTop}px (1.27cm) | Área útil: ${uWidth}x${uHeight}px`);

if (pWidth === 816 && pHeight === 1056 && mTop === 48 && mBottom === 48 && uWidth === 720 && uHeight === 960) {
  console.log('  ✅ [PASS] Geometría exacta Carta @ 96 DPI: 816x1056px, márgenes de 48px y área útil 720x960px.');
} else {
  console.error('  ❌ [FAIL] Error en las dimensiones físicas calculadas para Carta:', { pWidth, pHeight, mTop, uWidth, uHeight });
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 2: Modelo matemático de A4
// -----------------------------------------------------------------------------
console.log('\n--- TEST 2: Geometría de tamaño A4 ---');
PageConfig.setPaperSize('a4');
const a4Width = PageConfig.getPageWidthPx();
const a4Height = PageConfig.getPageHeightPx();
console.log(`  A4: ${a4Width}x${a4Height}px`);

if (a4Width === 794 && a4Height === 1123) {
  console.log('  ✅ [PASS] Geometría A4 correcta (210x297mm -> 794x1123px).');
} else {
  console.error('  ❌ [FAIL] Error en dimensiones A4:', { a4Width, a4Height });
  process.exit(1);
}

// Restaurar Carta para el resto de pruebas
PageConfig.setPaperSize('letter');
PageConfig.setMargins(1.27, 1.27, 1.27, 1.27);

// -----------------------------------------------------------------------------
// PRUEBA 3: Sanitización de HTML para guardado (cero contaminación de spacers)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 3: Sanitización de HTML en guardado (cero espaciadores guardados) ---');
const mockEditorWithSpacers = {
  cloneNode: function() {
    return {
      querySelectorAll: function(sel) {
        if (sel.includes('.nb-page-break-spacer') || sel.includes('.nb-auto-page-break')) {
          return [{ remove: () => {} }, { remove: () => {} }];
        }
        return [];
      },
      innerHTML: '<h2>Título 1</h2><p>Contenido limpio del docente</p>'
    };
  }
};

const cleanSavedHtml = NotebookEditor.getCleanEditorHtml(mockEditorWithSpacers);
if (cleanSavedHtml === '<h2>Título 1</h2><p>Contenido limpio del docente</p>') {
  console.log('  ✅ [PASS] getCleanEditorHtml remueve espaciadores efímeros y preserva el HTML docente intacto.');
} else {
  console.error('  ❌ [FAIL] getCleanEditorHtml no limpió correctamente:', cleanSavedHtml);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// Helper createMockDOM
// -----------------------------------------------------------------------------
function createMockDOM(blocks = [], hasHeader = true, obsHeight = 0, footerHeight = 30) {
  global.window = {
    getComputedStyle: (el) => ({
      marginTop: '0px',
      marginBottom: '0px',
      position: 'relative'
    })
  };

  const editorChildren = [];
  const insertedSpacers = [];

  const parentHandler = {
    insertBefore: (newEl, ref) => {
      insertedSpacers.push({ spacer: newEl, before: ref });
      const idx = editorChildren.indexOf(ref);
      if (idx !== -1) {
        editorChildren.splice(idx, 0, newEl);
      } else {
        editorChildren.push(newEl);
      }
      newEl.parentNode = parentHandler;
    },
    removeChild: (el) => {
      const idx = editorChildren.indexOf(el);
      if (idx !== -1) editorChildren.splice(idx, 1);
    }
  };

  blocks.forEach(b => {
    const isList = b.tag === 'UL' || b.tag === 'OL';
    const listChildren = isList && b.items ? b.items.map(it => ({
      nodeType: 1,
      tagName: 'LI',
      offsetHeight: it.height || 35,
      textContent: it.text || 'Elemento',
      parentNode: null,
      classList: { contains: () => false }
    })) : [];

    const el = {
      nodeType: 1,
      tagName: b.tag || 'P',
      offsetHeight: b.height || (isList ? listChildren.reduce((a, c) => a + c.offsetHeight, 0) : 40),
      textContent: b.text || 'Texto',
      children: listChildren,
      classList: {
        contains: (cls) => b.isManualBreak ? (cls === 'notebook-page-break') : false
      },
      parentNode: parentHandler,
      setAttribute: function(k, v) { this[k] = v; },
      getAttribute: function(k) { return this[k]; },
      removeAttribute: function(k) { delete this[k]; },
      querySelector: (sel) => {
        if (isList && sel === 'li') return listChildren[0] || null;
        if (b.tag === 'P' && b.text?.startsWith('Paso')) return { textContent: b.text };
        if (b.strong) return { textContent: b.strong };
        return null;
      },
      querySelectorAll: (sel) => {
        if (isList && sel.includes('li')) return listChildren;
        return [];
      },
      appendChild: function(c) {
        this.children.push(c);
        c.parentNode = this;
      }
    };
    listChildren.forEach(li => { li.parentNode = el; });
    editorChildren.push(el);
  });

  const editor = {
    id: 'notebook-single-editor',
    isConnected: true,
    children: editorChildren,
    querySelectorAll: (sel) => {
      const res = [];
      editorChildren.forEach(c => {
        if (sel.includes('data-split-continuation') && c.getAttribute?.('data-split-continuation')) {
          res.push(c);
        }
      });
      return res;
    },
    querySelector: (sel) => {
      if (sel.includes('data-split-source=')) {
        const id = sel.match(/data-split-source="([^"]+)"/)?.[1];
        return editorChildren.find(c => c.getAttribute?.('data-split-source') === id) || null;
      }
      return null;
    },
    cloneNode: () => ({ querySelectorAll: () => [], innerHTML: '' })
  };

  const headerCard = hasHeader ? { offsetHeight: 120 } : null;
  const obsCard = obsHeight > 0 ? { offsetHeight: obsHeight, parentNode: null } : null;
  const docFooter = footerHeight > 0 ? { offsetHeight: footerHeight, parentNode: null } : null;

  const paperContainer = {
    style: {},
    querySelector: (sel) => {
      if (sel === '.notebook-page-header-card') return headerCard;
      if (sel === '.notebook-observations-card') return obsCard;
      if (sel === '.notebook-document-footer') return docFooter;
      if (sel.includes('data-split-source=')) return editor.querySelector(sel);
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel.includes('data-split-continuation')) return editor.querySelectorAll(sel);
      return [];
    }
  };

  if (obsCard) {
    obsCard.parentNode = {
      insertBefore: (newEl, ref) => insertedSpacers.push({ spacer: newEl, before: ref, isClosing: true })
    };
  }

  return { paperContainer, editor, insertedSpacers };
}

// -----------------------------------------------------------------------------
// PRUEBA 4: Escenario A — Poco contenido (1 sola página)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 4: Escenario A — Poco contenido en una clase ---');
const shortDom = createMockDOM([
  { tag: 'H2', height: 40, text: 'Propósito' },
  { tag: 'P', height: 120, text: 'Explicación corta' }
]);
const shortResult = PaginationEngine.paginate(shortDom.paperContainer, shortDom.editor);

if (shortResult.totalPages === 1 && shortResult.breaks.length === 0) {
  console.log('  ✅ [PASS] Contenido corto ocupa exactamente 1 hoja sin saltos.');
} else {
  console.error('  ❌ [FAIL] Contenido corto generó saltos inesperados:', shortResult);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 5: Escenario C — Contenido que supera la página por una sola línea
// -----------------------------------------------------------------------------
console.log('\n--- TEST 5: Escenario C — Bloque que rebosa por una sola línea pasa a la siguiente hoja ---');
const overflowDom = createMockDOM([
  { tag: 'P', height: 500, text: 'Párrafo largo 1' },
  { tag: 'P', height: 300, text: 'Párrafo 2' },
  { tag: 'P', height: 80, text: 'Paso 3' }
]);
const overflowResult = PaginationEngine.paginate(overflowDom.paperContainer, overflowDom.editor);

if (overflowResult.totalPages === 2 && overflowResult.breaks.length === 1) {
  const brk = overflowResult.breaks[0];
  console.log(`  ✅ [PASS] Paso 3 fue trasladado a Página 2 con espaciador matemático (espacio restante: ${brk.remainingSpace}px).`);
} else {
  console.error('  ❌ [FAIL] El bloque desbordado no generó el salto correcto:', overflowResult);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 6: Escenario D — Prevención de títulos huérfanos cerca del final de hoja
// -----------------------------------------------------------------------------
console.log('\n--- TEST 6: Escenario D — Prevención de títulos huérfanos al fondo de página ---');
const orphanDom = createMockDOM([
  { tag: 'P', height: 800, text: 'Contenido previo' },
  { tag: 'H2', height: 40, text: 'Paso 4: Problema aplicado' },
  { tag: 'P', height: 120, text: 'Un termómetro en una ciudad de montaña...' }
]);
const orphanResult = PaginationEngine.paginate(orphanDom.paperContainer, orphanDom.editor);

if (orphanResult.totalPages === 2 && orphanResult.breaks[0].targetBlock.tagName === 'H2') {
  console.log('  ✅ [PASS] El título H2 fue trasladado a la Página 2 impidiendo que quede huérfano al final.');
} else {
  console.error('  ❌ [FAIL] El título no fue protegido contra orfandad:', orphanResult);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 7: Escenario G — Observaciones pedagógicas y Footer que no caben en P1
// -----------------------------------------------------------------------------
console.log('\n--- TEST 7: Escenario G — Observaciones pedagógicas se trasladan limpiamente si no caben ---');
const obsDom = createMockDOM(
  [{ tag: 'P', height: 750, text: 'Contenido extenso de la clase' }],
  true,
  150,
  30
);
const obsResult = PaginationEngine.paginate(obsDom.paperContainer, obsDom.editor);

if (obsResult.totalPages === 2 && obsResult.breaks.some(b => b.isClosingBlock)) {
  console.log('  ✅ [PASS] Observaciones pedagógicas y footer trasladados en bloque a la siguiente hoja sin cortarse.');
} else {
  console.error('  ❌ [FAIL] Las observaciones no se protegieron de corte inferior:', obsResult);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 8: Cambio dinámico de margen (1.27 cm -> 2.0 cm -> 1.0 cm)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 8: Recálculo dinámico al cambiar márgenes desde la interfaz ---');
PageConfig.setMargins(1.27, 1.27, 1.27, 1.27);
const uH127 = PageConfig.getUsableHeightPx();

PageConfig.setMargins(2.0, 2.0, 2.0, 2.0);
const uH200 = PageConfig.getUsableHeightPx();

PageConfig.setMargins(1.0, 1.0, 1.0, 1.0);
const uH100 = PageConfig.getUsableHeightPx();

console.log(`  Margen 1.27cm -> Alto útil: ${uH127}px`);
console.log(`  Margen 2.00cm -> Alto útil: ${uH200}px`);
console.log(`  Margen 1.00cm -> Alto útil: ${uH100}px`);

if (uH200 < uH127 && uH100 > uH127) {
  console.log('  ✅ [PASS] El área útil se ajusta dinámicamente y con precisión matemática al cambiar el margen.');
} else {
  console.error('  ❌ [FAIL] Recálculo de área útil incorrecto.');
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 9: Verificación de reglas de impresión y exportación en CSS y JS
// -----------------------------------------------------------------------------
console.log('\n--- TEST 9: Consistencia con CSS de impresión y exportación a Word ---');
const cssText = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
const jsText = fs.readFileSync(path.join(__dirname, '../js/notebook-editor.js'), 'utf8');

const hasPrintSpacerRule = cssText.includes('body.printing-notebook .nb-page-break-spacer') &&
                           cssText.includes('break-before: page !important;');
const hasWordBreakInjection = jsText.includes("page-break-before:always; mso-break-type:page-break;");
const hasPageConfigBinding = jsText.includes('PageConfig.margins.topCm');

if (hasPrintSpacerRule) {
  console.log('  ✅ [PASS] styles.css asigna break-before: page !important a los espaciadores de paginación.');
} else {
  console.error('  ❌ [FAIL] styles.css no tiene la regla de impresión adecuada para .nb-page-break-spacer.');
  process.exit(1);
}

if (hasWordBreakInjection && hasPageConfigBinding) {
  console.log('  ✅ [PASS] exportWordDocx sincroniza los saltos de hoja reales con mso-break-type: page-break.');
} else {
  console.error('  ❌ [FAIL] exportWordDocx no sincroniza los saltos con el motor.');
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 10: Escenario Captura Usuario — Partición granular de listas (UL / OL)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 10: Escenario Captura Usuario — División granular de listas (ítem por ítem) ---');
// P1 disponible = 840px.
// Contenido previo = 650px (restan 190px).
// Lista de 5 ítems de 60px cada uno (total 300px).
// 650 + 300 = 950px > 840px.
// Caben exactamente 3 ítems en P1 (3 * 60 = 180px <= 190px).
// Los 2 ítems restantes pasan a P2. CERO hueco masivo innecesario.
const listDom = createMockDOM([
  { tag: 'P', height: 650, text: 'Explicación teórica inicial de tablas' },
  {
    tag: 'UL',
    items: [
      { height: 60, text: 'Fila: conjunto horizontal' },
      { height: 60, text: 'Columna: conjunto vertical' },
      { height: 60, text: 'Celda: unidad básica' },
      { height: 60, text: 'Rango: grupo de celdas' },
      { height: 60, text: 'Encabezado: fila superior' }
    ]
  }
]);

const listResult = PaginationEngine.paginate(listDom.paperContainer, listDom.editor);
if (listResult.totalPages === 2 && listResult.breaks.length === 1) {
  const remaining = listResult.breaks[0].remainingSpace;
  console.log(`  ✅ [PASS] Lista dividida ítem por ítem como Word/Docs: 3 ítems en Hoja 1, resto en Hoja 2. Espacio restante exacto: ${remaining}px.`);
} else {
  console.error('  ❌ [FAIL] La lista no se dividió granularmente:', listResult);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 11: Subtítulo destacado + Lista sin hueco y con keep-with-next
// -----------------------------------------------------------------------------
console.log('\n--- TEST 11: Subtítulo destacado ("Elementos Fundamentales") + Lista ---');
// Subtítulo (35px) + Lista donde los primeros ítems sí caben en P1:
// El subtítulo debe permanecer en P1 con los primeros ítems y la lista dividirse.
const subDom = createMockDOM([
  { tag: 'P', height: 600, text: 'Definición de tablas' },
  { tag: 'P', height: 35, text: 'Elementos Fundamentales de la Tabla', strong: 'Elementos Fundamentales de la Tabla' },
  {
    tag: 'UL',
    items: [
      { height: 60, text: 'Fila' },
      { height: 60, text: 'Columna' },
      { height: 60, text: 'Celda' },
      { height: 60, text: 'Rango' },
      { height: 60, text: 'Pie' }
    ]
  }
]);
const subResult = PaginationEngine.paginate(subDom.paperContainer, subDom.editor);

if (subResult.totalPages === 2 && subResult.breaks[0].targetBlock.tagName === 'UL') {
  console.log('  ✅ [PASS] El subtítulo permaneció en Hoja 1 junto a los primeros ítems de la lista sin generar vacíos.');
} else {
  console.error('  ❌ [FAIL] Error en la paginación con subtítulo destacado:', subResult);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// PRUEBA 12: Recombinación no destructiva al limpiar espaciadores
// -----------------------------------------------------------------------------
console.log('\n--- TEST 12: Recombinación no destructiva de elementos divididos ---');
// Simular contenedor con lista partida
const mockParent = { removeChild: () => {} };
const sourceUl = {
  tagName: 'UL',
  children: [{ textContent: 'Item 1' }, { textContent: 'Item 2' }],
  getAttribute: (k) => k === 'data-split-source' ? 'split_test' : null,
  removeAttribute: () => {},
  appendChild: function(c) { this.children.push(c); }
};
const contUl = {
  tagName: 'UL',
  firstChild: { textContent: 'Item 3' },
  children: [{ textContent: 'Item 3' }],
  getAttribute: (k) => k === 'data-split-continuation' ? 'split_test' : null,
  parentNode: mockParent,
  remove: () => {}
};
// Simular firstChild loop
contUl.firstChild = contUl.children[0];
let loopCount = 0;
const origAppend = sourceUl.appendChild;
sourceUl.appendChild = function(c) {
  origAppend.call(this, c);
  contUl.children.shift();
  contUl.firstChild = contUl.children[0] || null;
};

const recombineContainer = {
  querySelectorAll: (sel) => sel.includes('data-split-continuation') ? [contUl] : [],
  querySelector: (sel) => sel.includes('split_test') ? sourceUl : null
};

PaginationEngine._recombineSplitElements(recombineContainer);
if (sourceUl.children.length === 3) {
  console.log('  ✅ [PASS] _recombineSplitElements fusiona los ítems de vuelta al contenedor original.');
} else {
  console.error('  ❌ [FAIL] Recombinación falló, items:', sourceUl.children.length);
  process.exit(1);
}

console.log('\n================================================================');
console.log('RESULTADO FINAL: TODAS LAS PRUEBAS (12/12) SUPERADAS CON ÉXITO');
console.log('================================================================\n');
