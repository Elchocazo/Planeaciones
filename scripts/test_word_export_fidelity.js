const assert = require('assert');
const fs = require('fs');
const NotebookEditor = require('../js/notebook-editor.js');

console.log('TEST: Regla 15 - Fidelidad Word = PDF (prepareWordHtml)');

const img = '<img src="data:image/webp;base64,AAAA1.5rem2px==" style="width:3rem">';
const html = `
<h2 style="margin-top:1.1rem; border-bottom:1.5px solid #bfdbfe; padding-bottom:4px; letter-spacing:-0.01em;">Título</h2>
<p style="margin-bottom:0.35rem; text-align:justify;">¿Cómo se lee?<br>A) uno<br>B) dos</p>
<p style="text-align:justify;">Párrafo sin saltos</p>
<br clear="all" style="break-before: page;">
<div class="notebook-page-break" contenteditable="false" data-page-break="true"><div class="page-break-line"></div><span class="page-break-label">Hoja Independiente</span></div>
<div class="notebook-student-worksheet-header" style="border:2px solid #1e3a8a; display:block;">
  <div style="display:flex; justify-content:space-between;"><h2 style="margin:0;">Taller</h2><span>Matemáticas - Grado 2°</span></div>
  <div style="display:grid; grid-template-columns:2.5fr 1fr 1fr; gap:8px;"><div><strong>Estudiante:</strong> ____</div></div>
  <div style="margin-top:6px;"><strong>Tema:</strong> Valor posicional</div>
</div>
<p>Final</p>${img}`;

const out = NotebookEditor.prepareWordHtml(html);

assert(!/\d\s*rem\b/.test(out.replace(img, '')), 'Quedan unidades rem');
assert(/margin-top:13\.2pt/.test(out), 'rem no convertido a pt');
assert(/border-bottom:1\.1pt/.test(out), 'px no convertido a pt');
assert(!/display\s*:\s*(flex|grid)|grid-template|letter-spacing|gap\s*:/.test(out), 'Quedan propiedades flex/grid');
assert(!/break-before/.test(out.replace(/page-break-before/g, '')), 'Quedan break-before de pantalla');
assert(/<p style="margin-bottom:[^"]*text-align:left;">¿Cómo/.test(out), 'Párrafo con <br> sigue justificado');
assert(/text-align:justify;">Párrafo sin saltos/.test(out), 'Párrafo normal debe conservar justificado (estética PDF)');
assert(!/notebook-page-break|contenteditable|page-break-label/.test(out), 'Marcador de hoja no convertido');
assert((out.match(/page-break-before:always/g) || []).length === 1, 'Debe haber exactamente 1 salto nativo');
assert(/<table[^>]*>[\s\S]*Estudiante:[\s\S]*Calificación:[\s\S]*Valor posicional/.test(out), 'Encabezado del taller no es tabla');
assert(out.includes(img), 'La imagen base64 debe restaurarse intacta (Regla 5)');

// Rendimiento (< 10 ms para un documento típico)
const big = html.repeat(40);
const t0 = Date.now();
NotebookEditor.prepareWordHtml(big);
assert(Date.now() - t0 < 50, 'prepareWordHtml demasiado lento');

// Con el .doc real adjunto (si existe)
const f = 'C:/Users/moz65/.gemini/antigravity/brain/7d7f03cf-52cf-4759-9c89-8c6c10c9859e/.user_uploaded/media_1793074927296_fefd1990.doc';
if (fs.existsSync(f)) {
  const body = fs.readFileSync(f, 'utf8').split('<div class="notebook-content">')[1].split('<!-- Observaciones')[0];
  const t1 = Date.now();
  const r = NotebookEditor.prepareWordHtml(body);
  console.log('  .doc real procesado en', Date.now() - t1, 'ms');
  assert(!/\d\s*rem\b/.test(r) && !/display:\s*(flex|grid)/.test(r) && !/break-before:\s*page/.test(r), 'doc real aún con artefactos');
  assert(!/<br clear="all" style="break-before/.test(r));
}
console.log('OK - Todas las pruebas de la Regla 15 pasaron');
