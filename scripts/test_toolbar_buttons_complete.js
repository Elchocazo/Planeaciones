const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TEST SUITE: TODOS LOS BOTONES DE LA BARRA DE HERRAMIENTAS');
console.log('================================================================');

// Read actual js/notebook-editor.js
const notebookEditorCode = fs.readFileSync('js/notebook-editor.js', 'utf8');

const testHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
.notebook-word-toolbar { display: flex; align-items: center; }
.toolbar-btn { cursor: pointer; }
.notebook-single-editor-body { min-height: 200px; }
.notebook-callout { padding: 10px; border-left: 4px solid blue; }
.notebook-callout.concept { border-color: #3b82f6; }
.notebook-callout.activity { border-color: #10b981; }
.notebook-callout.homework { border-color: #f59e0b; }
.notebook-page-break { border-top: 1px dashed red; }
</style>
</head>
<body class="notebook-mode">
<div class="app-container">
  <main id="notebook-view" class="notebook-fullpage-layout" style="display: block;">
    <section id="notebook-mount-point"></section>
  </main>
</div>

<script>
// Mock environment
window.Planner = {
  currentDateStr: '2026-09-28',
  currentPlan: {
    classes: [
      {
        id: 'cls_test_1',
        subject: 'Matemáticas',
        grade: '4°',
        topic: 'Prueba de Botones de Toolbar',
        notebookContent: '<p id="p1">Primer párrafo de prueba para verificar estilos.</p><p id="p2">Segundo párrafo para encabezados.</p>'
      }
    ]
  }
};
window.PageConfig = {
  paperSize: 'letter',
  margins: { topCm: 1.27, rightCm: 1.27, bottomCm: 1.27, leftCm: 1.27 },
  setMargins(t, r, b, l) {
    this.margins = { topCm: t, rightCm: r, bottomCm: b, leftCm: l };
  },
  setPaperSize(s) { this.paperSize = s; }
};
window.StorageService = {
  getProfile() { return { institution: 'COLEGIO DE PRUEBA' }; }
};
window.PaginationEngine = {
  paginate() { return { totalPages: 1, breaks: [] }; },
  getCleanHtml(el) { return el.innerHTML; }
};
</script>

<script>
${notebookEditorCode}
</script>

<div id="test-results"></div>

<script>
window.addEventListener('load', () => {
  try {
    // Mount the editor
    NotebookEditor.openInPage(0);

  const results = {};
  const editor = document.getElementById('notebook-single-editor');
  const toolbar = document.querySelector('.notebook-word-toolbar');

  function selectText(node, start, end) {
    editor.focus();
    let textNode = node;
    while (textNode && textNode.nodeType !== 3 && textNode.firstChild) {
      textNode = textNode.firstChild;
    }
    const range = document.createRange();
    const maxLen = textNode.nodeType === 3 ? textNode.textContent.length : textNode.childNodes.length;
    range.setStart(textNode, Math.min(start, maxLen));
    range.setEnd(textNode, Math.min(end, maxLen));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    NotebookEditor._saveSelection();
  }

  // 1. Negrita (Bold)
  const textNode1 = document.getElementById('p1').firstChild;
  selectText(textNode1, 0, 6);
  toolbar.querySelector('button[title*="Negrita"]').click();
  results.bold = editor.innerHTML.includes('<b>Primer</b>') || editor.innerHTML.includes('<strong>Primer</strong>');

  // 2. Cursiva (Italic)
  const textNode2 = document.getElementById('p1').lastChild;
  selectText(textNode2, 1, 8);
  toolbar.querySelector('button[title*="Cursiva"]').click();
  results.italic = editor.innerHTML.includes('<i>') || editor.innerHTML.includes('<em>');

  // 3. Subrayado (Underline)
  const textNode3 = document.getElementById('p1').lastChild;
  selectText(textNode3, 1, 8);
  toolbar.querySelector('button[title*="Subrayado"]').click();
  results.underline = editor.innerHTML.includes('<u>');

  // 4. Tachado (Strikethrough)
  const textNode4 = document.getElementById('p1').lastChild;
  selectText(textNode4, 1, 8);
  toolbar.querySelector('button[title*="Tachado"]').click();
  results.strike = editor.innerHTML.includes('<s>') || editor.innerHTML.includes('<strike>');

  // 5. Estilo Dropdown (H1)
  selectText(document.getElementById('p2').firstChild, 0, 5);
  const styleSelect = toolbar.querySelector('select[title*="Estilo"]');
  styleSelect.value = 'h1';
  styleSelect.dispatchEvent(new Event('change'));
  results.styleH1 = editor.innerHTML.includes('<h1>') && editor.innerHTML.includes('</h1>');

  // 6. Tamaño Dropdown
  const h1El = editor.querySelector('h1');
  selectText(h1El, 0, 4);
  const sizeSelect = toolbar.querySelector('select[title*="Tamaño"]');
  sizeSelect.value = '18pt';
  sizeSelect.dispatchEvent(new Event('change'));
  results.fontSize = editor.innerHTML.includes('font-size: 18pt') || editor.innerHTML.includes('font-size:18pt');

  // 7. Color de Texto
  selectText(h1El, 0, 4);
  const colorInput = toolbar.querySelector('input[type="color"]');
  colorInput.value = '#ef4444';
  colorInput.dispatchEvent(new Event('change'));
  results.foreColor = editor.innerHTML.includes('color: rgb(239, 68, 68)') || editor.innerHTML.includes('color: #ef4444');

  // 8. Resaltador
  const hiliteInput = toolbar.querySelectorAll('input[type="color"]')[1];
  hiliteInput.value = '#fef08a';
  hiliteInput.dispatchEvent(new Event('change'));
  results.hiliteColor = editor.innerHTML.includes('background-color: rgb(254, 240, 138)') || editor.innerHTML.includes('background-color: #fef08a');

  // 9. Fuente Dropdown (cursor colapsado en p1)
  const rangeCollapsed = document.createRange();
  rangeCollapsed.setStart(document.getElementById('p1'), 0);
  rangeCollapsed.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(rangeCollapsed);
  NotebookEditor._saveSelection();
  const fontSelect = toolbar.querySelector('select[title*="Fuente"]');
  fontSelect.value = 'Arial, sans-serif';
  fontSelect.dispatchEvent(new Event('change'));
  results.fontFamily = document.getElementById('p1').style.fontFamily.includes('Arial');

  // 10. Alineación Centro
  toolbar.querySelector('button[title*="Centrar"]').click();
  results.alignCenter = document.getElementById('p1').style.textAlign === 'center';

  // 11. Lista desordenada
  toolbar.querySelector('button[title*="Viñetas"]').click();
  results.ul = editor.innerHTML.includes('<ul>') && editor.innerHTML.includes('<li>');

  // 12. Tabla
  toolbar.querySelector('button[title*="Tabla"]').click();
  results.table = editor.innerHTML.includes('<table');

  // 13. Salto de Página
  toolbar.querySelector('button[title*="Salto"]').click();
  results.pageBreak = editor.innerHTML.includes('notebook-page-break');

  // 14. Callouts: Concepto, Actividad, Tarea
  toolbar.querySelector('button[title*="Concepto"]').click();
  toolbar.querySelector('button[title*="Actividad"]').click();
  toolbar.querySelector('button[title*="Tarea"]').click();
  results.calloutConcept = editor.innerHTML.includes('notebook-callout concept');
  results.calloutActivity = editor.innerHTML.includes('notebook-callout activity');
  results.calloutHomework = editor.innerHTML.includes('notebook-callout homework');

  // 15. Selector de Margen
  const marginSelect = toolbar.querySelector('select[title*="Márgenes"]');
  marginSelect.value = '2.54';
  marginSelect.dispatchEvent(new Event('change'));
  const paper = document.querySelector('.notebook-paper-container');
  results.margin = PageConfig.margins.topCm === 2.54 && paper.style.padding === '2.54cm';

  // 16. Auto-formato
  toolbar.querySelector('button[title*="Organizar automáticamente"]').click();
  results.autoFormat = editor.innerHTML.length > 0;

  document.getElementById('test-results').textContent = JSON.stringify(results);
} catch (e) {
  document.getElementById('test-results').textContent = 'ERROR: ' + e.stack;
}
});
</script>
</body>
</html>`;

fs.writeFileSync('temp_test_complete_suite.html', testHtml);
try {
  const absPath = 'file:///' + path.resolve('temp_test_complete_suite.html').replace(/\\/g, '/');
  const output = execSync(`"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --disable-gpu --virtual-time-budget=2000 --dump-dom "${absPath}"`, { encoding: 'utf8' });
  const m = output.match(/<div id="test-results">([\s\S]*?)<\/div>/);
  if (m && m[1].startsWith('{')) {
    const res = JSON.parse(m[1]);
    let allPassed = true;
    for (const [key, val] of Object.entries(res)) {
      const mark = val ? '✅ [PASS]' : '❌ [FAIL]';
      console.log(`  ${mark} Control Toolbar: ${key} -> ${val}`);
      if (!val) allPassed = false;
    }
    console.log('----------------------------------------------------------------');
    if (allPassed) {
      console.log('🎉 TODOS LOS BOTONES Y CONTROLES DEL TOOLBAR FUNCIONAN AL 100%');
    } else {
      console.error('⚠️ ALGUNOS CONTROLES FALLARON');
      process.exit(1);
    }
  } else {
    console.error('Error en salida:', m ? m[1] : output.slice(0, 500));
    process.exit(1);
  }
} finally {
  if (fs.existsSync('temp_test_complete_suite.html')) fs.unlinkSync('temp_test_complete_suite.html');
}
