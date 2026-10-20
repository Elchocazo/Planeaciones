const ImportParser = require('../js/services/import-parser.js');
const base64 = 'iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADHAw9aAAAgAElEQVR4nOzdeVRU1/4H8M8w'.repeat(100000); // ~7.5 MB
const html = '<p>Texto antes</p><p><img src="data:image/png;base64,' + base64 + '"></p><p>Texto después</p>';

console.log('HTML size:', (html.length / 1024 / 1024).toFixed(2), 'MB');

console.time('cleanDocumentArtifacts');
try {
  const c = ImportParser.cleanDocumentArtifacts(html);
  console.timeEnd('cleanDocumentArtifacts');
  console.log('Result length:', c.length);
} catch (e) {
  console.error('cleanDocumentArtifacts error:', e);
}

console.time('unglueText');
try {
  const u = ImportParser.unglueText(html);
  console.timeEnd('unglueText');
  console.log('Result length:', u.length);
} catch (e) {
  console.error('unglueText error:', e);
}
