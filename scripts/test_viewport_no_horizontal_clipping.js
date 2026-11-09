/**
 * Suite de Regresión: Prevención de Recorte Horizontal Izquierdo (Viewport Clipping)
 * Verifica que ni el modo Cuaderno (body.notebook-mode) ni pantallas de 1024px-1366px
 * desplacen o recorten el borde izquierdo de la ventana sin barra de desplazamiento.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'css', 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const nbJs = fs.readFileSync(path.join(ROOT, 'js', 'notebook-editor.js'), 'utf8');
const routerJs = fs.readFileSync(path.join(ROOT, 'js', 'core', 'router.js'), 'utf8');
const appJs = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');

console.log('TEST: Prevención de recorte lateral izquierdo en ventana y modo Cuaderno');

// 1. Prohibir overflow-x: visible en body.notebook-mode (causante directo del scrollLeft oculto)
const notebookModeBlock = css.match(/body\.notebook-mode\s*\{[^}]*\}/);
assert(notebookModeBlock, 'Debe existir regla body.notebook-mode en css/styles.css');
assert(
  !/overflow-x\s*:\s*visible/i.test(notebookModeBlock[0]),
  'body.notebook-mode NO debe usar overflow-x: visible (provoca recorte izquierdo con html overflow-x: hidden)'
);
assert(
  /overflow-x\s*:\s*clip\s*!important/i.test(notebookModeBlock[0]),
  'body.notebook-mode debe usar overflow-x: clip !important para impedir scrollLeft > 0 sin romper position: sticky'
);

const notebookAppContainerBlock = css.match(/body\.notebook-mode\s+\.app-container\s*\{[^}]*\}/);
assert(notebookAppContainerBlock, 'Debe existir regla body.notebook-mode .app-container');
assert(
  !/overflow(-x)?\s*:\s*visible/i.test(notebookAppContainerBlock[0]),
  'body.notebook-mode .app-container NO debe abrir overflow-x: visible'
);
assert(
  /overflow-x\s*:\s*clip\s*!important/i.test(notebookAppContainerBlock[0]) &&
  /overflow-y\s*:\s*visible\s*!important/i.test(notebookAppContainerBlock[0]),
  'body.notebook-mode .app-container debe combinar overflow-x: clip !important con overflow-y: visible !important'
);

// 2. Contenedores principales con flex-wrap y min-width: 0 para pantallas de 1024px-1366px
const mainHeaderBlock = css.match(/\.main-header\s*\{[^}]*\}/);
assert(mainHeaderBlock && /flex-wrap\s*:\s*wrap/i.test(mainHeaderBlock[0]), '.main-header debe permitir flex-wrap: wrap');
assert(/min-width\s*:\s*0/i.test(mainHeaderBlock[0]), '.main-header debe declarar min-width: 0');

const navBarBlock = css.match(/\.main-nav-tabs-bar\s*\{[^}]*\}/);
assert(navBarBlock && /flex-wrap\s*:\s*wrap/i.test(navBarBlock[0]), '.main-nav-tabs-bar debe permitir flex-wrap: wrap');

assert(
  !html.includes('id="header-admin-tools" style="display:flex; align-items:center; gap:0.4rem; flex-wrap:nowrap;"'),
  '#header-admin-tools en index.html no debe forzar flex-wrap:nowrap inline'
);
assert(
  html.includes('css/styles.css?v=20261029-v2'),
  'index.html debe tener cache-buster actualizado en css/styles.css'
);

// 3. Foco sin salto horizontal y guardia de scrollLeft = 0 en JS
assert(
  nbJs.includes('focus({ preventScroll: true })'),
  'NotebookEditor._restoreSelection debe usar focus({ preventScroll: true })'
);
assert(
  routerJs.includes('left: 0') && routerJs.includes('scrollLeft = 0'),
  'AppRouter.navigateTo debe restablecer scrollLeft = 0 y left: 0'
);
assert(
  appJs.includes('_installHorizontalScrollGuard') && appJs.includes('scrollLeft = 0'),
  'App debe instalar guardia pasiva contra desplazamiento horizontal accidental'
);

console.log('✅ OK - Todas las verificaciones contra recorte lateral izquierdo pasaron al 100%');
