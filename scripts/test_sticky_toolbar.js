const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TEST SUITE: BARRA VISIBLE Y STICKY AL HACER SCROLL');
console.log('================================================================');

const notebookEditorCode = fs.readFileSync('js/notebook-editor.js', 'utf8');

const testHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="css/styles.css">
<style>
body { margin: 0; }
</style>
</head>
<body class="notebook-mode">
<div class="app-container">
  <main id="notebook-view" class="notebook-fullpage-layout" style="display: block;">
    <section id="notebook-mount-point"></section>
  </main>
</div>

<script>
window.Planner = {
  currentDateStr: '2026-09-28',
  currentPlan: {
    classes: [
      {
        id: 'cls_test_sticky',
        subject: 'Lenguaje',
        grade: '5°',
        topic: 'Prueba de Scroll y Sticky Toolbar',
        notebookContent: '<p>Línea 1</p>' + '<p>Párrafo de relleno largo</p>'.repeat(60)
      }
    ]
  }
};
window.PageConfig = {
  paperSize: 'letter',
  margins: { topCm: 1.27, rightCm: 1.27, bottomCm: 1.27, leftCm: 1.27 },
  setMargins(t, r, b, l) { this.margins = { topCm: t, rightCm: r, bottomCm: b, leftCm: l }; },
  setPaperSize(s) { this.paperSize = s; }
};
window.StorageService = {
  getProfile() { return { institution: 'COLEGIO DE PRUEBA' }; }
};
window.PaginationEngine = {
  paginate() { return { totalPages: 2, breaks: [] }; },
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
    NotebookEditor.openInPage(0);
    
    const toolbar = document.querySelector('.notebook-word-toolbar');
    const stickyWrapper = document.getElementById('notebook-sticky-header-wrapper');
    
    const initialToolbarRect = toolbar.getBoundingClientRect();
    const initialWrapperRect = stickyWrapper.getBoundingClientRect();
    
    // Scroll window down by 800px
    window.scrollTo(0, 800);
    window.dispatchEvent(new Event('scroll'));
    
    const scrolledToolbarRect = toolbar.getBoundingClientRect();
    const scrolledWrapperRect = stickyWrapper.getBoundingClientRect();
    const isCompact = stickyWrapper.classList.contains('is-compact');
    
    // Test clicking a toolbar button while scrolled down
    const p1 = document.getElementById('notebook-single-editor').querySelector('p');
    const range = document.createRange();
    range.selectNodeContents(p1);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    NotebookEditor._saveSelection();
    
    toolbar.querySelector('button[title*="Negrita"]').click();
    const boldApplied = p1.innerHTML.includes('<b>') || p1.innerHTML.includes('<strong>');
    
    document.getElementById('test-results').textContent = JSON.stringify({
      initialWrapperTop: initialWrapperRect.top,
      scrolledWrapperTop: scrolledWrapperRect.top,
      scrolledToolbarTop: scrolledToolbarRect.top,
      toolbarHeight: scrolledToolbarRect.height,
      toolbarIsVisible: scrolledToolbarRect.top >= 0 && scrolledToolbarRect.bottom <= window.innerHeight,
      isCompact: isCompact,
      boldAppliedWhileScrolled: boldApplied,
      windowScrollY: window.scrollY
    });
  } catch(e) {
    document.getElementById('test-results').textContent = 'ERROR: ' + e.stack;
  }
});
</script>
</body>
</html>`;

fs.writeFileSync('temp_test_sticky_real.html', testHtml);
try {
  const absPath = 'file:///' + path.resolve('temp_test_sticky_real.html').replace(/\\/g, '/');
  const output = execSync(`"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --disable-gpu --virtual-time-budget=2000 --dump-dom "${absPath}"`, { encoding: 'utf8' });
  const m = output.match(/<div id="test-results">([\s\S]*?)<\/div>/);
  if (m && m[1].startsWith('{')) {
    const res = JSON.parse(m[1]);
    console.log('Resultados:', res);
    const passSticky = res.scrolledWrapperTop === 0 && res.toolbarIsVisible;
    const passClick = res.boldAppliedWhileScrolled;
    console.log(`  ${passSticky ? '✅ [PASS]' : '❌ [FAIL]'} Barra sticky en la parte superior: wrapperTop=${res.scrolledWrapperTop}px, toolbarTop=${res.scrolledToolbarTop}px`);
    console.log(`  ${res.isCompact ? '✅ [PASS]' : '❌ [FAIL]'} Header se vuelve compacto al hacer scroll para ahorrar espacio: isCompact=${res.isCompact}`);
    console.log(`  ${passClick ? '✅ [PASS]' : '❌ [FAIL]'} Botones de la barra funcionan perfectamente durante el scroll: boldApplied=${res.boldAppliedWhileScrolled}`);
    if (passSticky && passClick) {
      console.log('🎉 LA BARRA PERMANECE VISIBLE Y FUNCIONA PERFECTAMENTE AL HACER SCROLL');
    } else {
      process.exit(1);
    }
  } else {
    console.error('Error en salida:', m ? m[1] : output.slice(0, 500));
    process.exit(1);
  }
} finally {
  if (fs.existsSync('temp_test_sticky_real.html')) fs.unlinkSync('temp_test_sticky_real.html');
}
