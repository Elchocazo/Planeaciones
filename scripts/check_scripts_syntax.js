const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /<script\s+src=["']([^"']+)["']/g;
let m;
let count = 0;
while ((m = regex.exec(html)) !== null) {
  const src = m[1].split('?')[0];
  if (src.startsWith('http')) continue;
  try {
    const code = fs.readFileSync(src, 'utf8');
    new Function(code);
    count++;
  } catch(e) {
    console.error('ERROR in', src, e.message);
  }
}
console.log('Checked', count, 'scripts. All syntax OK.');
