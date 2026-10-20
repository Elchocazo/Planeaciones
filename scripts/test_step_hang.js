const ImportParser = require('../js/services/import-parser.js');
const base64 = 'ABCDEF1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10000); // 680KB
const rawHtml = '<p>Texto</p><img src="data:image/png;base64,' + base64 + '"><p>Texto</p>';

console.log('Testing full unglueText on 680KB HTML...');
console.time('unglueText');
ImportParser.unglueText(rawHtml);
console.timeEnd('unglueText');

console.log('Testing full cleanBrokenLinebreaks on 680KB HTML...');
console.time('cleanBrokenLinebreaks');
ImportParser.cleanBrokenLinebreaks(rawHtml);
console.timeEnd('cleanBrokenLinebreaks');
