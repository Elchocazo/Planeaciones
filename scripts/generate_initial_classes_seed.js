const fs = require('fs');
const path = require('path');

const snapPath = path.join(__dirname, '..', 'backups', 'cloud_firestore_snapshot_all.json');
const outPath = path.join(__dirname, '..', 'js', 'data', 'initial-classes-data.js');

const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));

const jsContent = `/**
 * BANCO DE PLANEACIONES Y CLASES PEDAGÓGICAS OFICIALES
 * Manuel Muñoz - Colegio Hogar Madre de Dios
 * Sincronizado con Google Cloud Firestore
 */

const INITIAL_CLASSES_DATA = ${JSON.stringify(snap.classes, null, 2)};

if (typeof window !== 'undefined') {
  window.INITIAL_CLASSES_DATA = INITIAL_CLASSES_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_CLASSES_DATA };
}
`;

fs.writeFileSync(outPath, jsContent, 'utf8');
console.log('Generated successfully! File size:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');
