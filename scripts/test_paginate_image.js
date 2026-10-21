let JSDOM;
try {
  JSDOM = require('jsdom').JSDOM;
} catch (e) {
  console.log('jsdom no está instalado en este entorno Node. Se omite simulación sintética de imagen en DOM.');
  process.exit(0);
}
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html>
<html>
<body>
  <div class="notebook-paper-container">
    <div class="notebook-page-header-card" style="height:150px;"></div>
    <div id="notebook-single-editor"></div>
    <div class="notebook-observations-card" style="height:100px;"></div>
    <div class="notebook-document-footer" style="height:40px;"></div>
  </div>
</body>
</html>`);

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

// Mock offsetHeight and getComputedStyle
dom.window.HTMLElement.prototype.offsetHeight = 30;
const origGetComputedStyle = dom.window.getComputedStyle;
dom.window.getComputedStyle = function(el) {
  return {
    marginTop: '10px',
    marginBottom: '10px',
    paddingTop: '0px',
    paddingBottom: '0px'
  };
};

const { PaginationEngine } = require('../js/core/pagination-engine.js');

const editor = dom.window.document.getElementById('notebook-single-editor');
const paperContainer = dom.window.document.querySelector('.notebook-paper-container');

// Fill editor with normal paragraphs
for (let i = 0; i < 20; i++) {
  const p = dom.window.document.createElement('p');
  p.textContent = 'Párrafo ' + i + ' con texto normal de clase.';
  p.offsetHeight = 40;
  editor.appendChild(p);
}

// Add an image container like insertImageAtCursor does
const imgWrapper = dom.window.document.createElement('div');
imgWrapper.style.textAlign = 'center';
imgWrapper.style.margin = '1rem 0';
const img = dom.window.document.createElement('img');
img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
imgWrapper.appendChild(img);
imgWrapper.offsetHeight = 1500; // Large infographic height
editor.appendChild(imgWrapper);

console.time('paginate');
const res = PaginationEngine.paginate(paperContainer, editor);
console.timeEnd('paginate');

console.log('Total pages:', res.totalPages);
console.log('Breaks count:', res.breaks.length);
console.log('Spacers count:', paperContainer.querySelectorAll('.nb-page-break-spacer').length);
