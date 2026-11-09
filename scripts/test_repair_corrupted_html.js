const assert = require('assert');
const NotebookEditor = require('../js/notebook-editor.js');

let html = `
<ul>
  <li>Justifica sus procedimientos con argumentos numéricos...</li>
  <li>Primer</li>
</ul>
<p><strong>tema:</strong> La Adición con números hasta 999.999 agrupando (reagrupación):</p>
<ul style="margin:0.35rem 0 0.55rem 1.25rem;">
  <li>Ejemplo resuelto</li>
</ul>
<h3 style="color:#1d4ed8;">🛠️ <strong>paso a paso:</strong></h3>
<p>Operación: 538.746 + 284.585 \\rightarrow 823.331</p>
<p>Diseñar la portada de "Segundo Período" y transcribir con letra clara, regla y colores los</p>
<h2 style="color:#1e3a8a;">📚 ejes temáticos</h2>
<p>, los</p>
<h2 style="color:#1e3a8a;">🎯 desempeños de aprendizaje</h2>
<p>y la pregunta problematizadora de la malla curricular.</p>
`;

const fixed = NotebookEditor.prepareWordHtml(html);
console.log('--- FIXED BY NOTEBOOK EDITOR ---\n' + fixed);

assert.ok(!fixed.includes('Primer</li>'), 'Word HTML no debe tener Primer huérfano');
assert.ok(fixed.includes('Primer tema:'), 'Word HTML debe tener Primer tema unido');
assert.ok(fixed.includes('→'), 'Word HTML debe tener flecha →');
assert.ok(!fixed.includes('\\rightarrow'), 'Word HTML no debe tener \\rightarrow');
assert.ok(fixed.includes('Ejemplo resuelto paso a paso:'), 'Word HTML debe tener Ejemplo resuelto paso a paso');
assert.ok(!fixed.includes('ejes temáticos</h2>'), 'Word HTML no debe tener ejes temáticos h2');
assert.ok(fixed.includes('los ejes temáticos, los desempeños de aprendizaje y la pregunta problematizadora'), 'Word HTML debe tener texto fluido');

console.log('✅ NotebookEditor.prepareWordHtml auto-repair PASSED 100%!');
