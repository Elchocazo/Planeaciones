const ImportParser = require('../js/services/import-parser.js');
const base64 = 'ABCDEF1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10000);
const rawHtml = '<p>Texto</p><img src="data:image/png;base64,' + base64 + '"><p>Texto</p>';

console.time('cda');
ImportParser.cleanDocumentArtifacts(rawHtml);
console.timeEnd('cda');

console.time('cbl');
ImportParser.cleanBrokenLinebreaks(rawHtml);
console.timeEnd('cbl');

console.time('unglue');
const u = ImportParser.unglueText(rawHtml);
console.timeEnd('unglue');
console.log('unglue length:', u.length);
