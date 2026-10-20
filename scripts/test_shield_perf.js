const ImportParser = require('../js/services/import-parser.js');

// Simulate a base64 image data URI
const base64Sample = 'iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADHAw9aAAAgAElEQVR4nOzdeVRU1/4H8M8w' +
  'ABCDEF1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(50000); // ~3.5MB

const rawHtml = `<p>Explicación inicial de circuitos.</p>
<div style="text-align:center;"><img src="data:image/png;base64,${base64Sample}" alt="Guía"></div>
<p>Conexión con la próxima clase: NE555.</p>`;

console.log('Original HTML size:', (rawHtml.length / 1024 / 1024).toFixed(2), 'MB');

// Test 1: Without shielding (current behavior)
console.time('current_cleanDocumentArtifacts');
const unshielded = ImportParser.cleanDocumentArtifacts(rawHtml);
console.timeEnd('current_cleanDocumentArtifacts');

// Test if base64 was corrupted
const imgMatch = unshielded.match(/src="data:image\/png;base64,([^"]+)"/);
const isCorrupted = imgMatch && (imgMatch[1].includes('\n') || imgMatch[1].includes(' '));
console.log('Was base64 corrupted by regexes?', isCorrupted);

// Test 2: With shielding token
console.time('shielded_cleanDocumentArtifacts');
const imgTokens = [];
const shielded = rawHtml.replace(/<img\b[^>]*src=["']data:image\/[^"']+["'][^>]*>/gi, (m) => {
  const token = `___IMG_TOKEN_${imgTokens.length}___`;
  imgTokens.push(m);
  return token;
});
let cleaned = ImportParser.cleanDocumentArtifacts(shielded);
imgTokens.forEach((imgHtml, idx) => {
  cleaned = cleaned.replace(`___IMG_TOKEN_${idx}___`, imgHtml);
});
console.time('unshielded_unglueText');
const unshieldedU = ImportParser.unglueText(rawHtml);
console.timeEnd('unshielded_unglueText');
const imgMatchU = unshieldedU.match(/src="data:image\/png;base64,([^"]+)"/);
console.log('Was base64 corrupted by unglueText (contains newlines)?', imgMatchU && imgMatchU[1].includes('\n'));
console.log('Size after unglueText:', (unshieldedU.length / 1024 / 1024).toFixed(2), 'MB');

