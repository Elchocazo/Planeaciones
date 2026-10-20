const fs = require('fs');
const code = fs.readFileSync('js/services/import-parser.js', 'utf8');

// Extract unglueText function body
const fnBody = code.match(/unglueText\(text\) \{([\s\S]+?)\n  \}/)[1];
const lines = fnBody.split('\n');

const base64 = 'ABCDEF1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10000);
const rawHtml = '<p>Texto</p><img src="data:image/png;base64,' + base64 + '"><p>Texto</p>';

let clean = rawHtml;

// Run lines one by one and time them
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line.startsWith('//') || line.startsWith('const ') || line.startsWith('return ')) continue;
  
  const start = Date.now();
  try {
    eval(lines[i]);
    const elapsed = Date.now() - start;
    if (elapsed > 10) {
      console.log(`Line ${i + 1} took ${elapsed}ms: ${line.substring(0, 60)}`);
    }
  } catch (e) {
    // skip
  }
}
console.log('Done scanning unglueText lines!');
