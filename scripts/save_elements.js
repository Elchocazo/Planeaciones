const fs = require('fs');
const xml = fs.readFileSync('extracted_document.xml', 'utf8');

const bodyMatch = xml.match(/<w:body>([\s\S]*?)<\/w:body>/);
if (bodyMatch) {
  const bodyContent = bodyMatch[1];
  const regex = /<(w:p|w:tbl)(\s|>)([\s\S]*?)<\/\1>/g;
  let match;
  let idx = 0;
  while ((match = regex.exec(bodyContent)) !== null) {
    fs.writeFileSync(`scripts/element_${idx}.xml`, match[0]);
    console.log(`Saved scripts/element_${idx}.xml (${match[1]})`);
    idx++;
  }
}
