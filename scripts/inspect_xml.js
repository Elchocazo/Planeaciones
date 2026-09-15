const fs = require('fs');
const xml = fs.readFileSync('extracted_document.xml', 'utf8');

const bodyMatch = xml.match(/<w:body>([\s\S]*?)<\/w:body>/);
if (bodyMatch) {
  const bodyContent = bodyMatch[1];
  const regex = /<(w:p|w:tbl)(\s|>)([\s\S]*?)<\/\1>/g;
  let match;
  let idx = 0;
  while ((match = regex.exec(bodyContent)) !== null) {
    const type = match[1];
    const raw = match[0];
    const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`Element ${idx++} [${type}]: ${text.substring(0, 120)}`);
  }
}
