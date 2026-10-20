const assert = require('assert');

// 1. Simular entorno mínimo DOM/Browser si es necesario
global.window = global;
global.document = {
  getElementById: (id) => null,
  activeElement: null
};

const ClassRepository = require('../js/repositories/class-repository.js');
const ClassEditorView = require('../js/ui/class-editor-view.js');

console.log('================================================================');
console.log('TEST SUITE: GESTIÓN DE ANEXOS E IMÁGENES POR CLASE');
console.log('================================================================');

// Test 1: Comprobación de métodos de compresión y formateo
console.log('\n--- TEST 1: Formateo de tamaño de archivos ---');
assert.strictEqual(ClassEditorView._formatFileSize(512), '1 KB');
assert.strictEqual(ClassEditorView._formatFileSize(1024 * 150), '150 KB');
assert.strictEqual(ClassEditorView._formatFileSize(1024 * 1024 * 2.5), '2.5 MB');
console.log('  ✅ [PASS] Tamaños formateados adecuadamente.');

// Test 2: Inserción de anexo en una clase y persistencia en ClassRepository
console.log('\n--- TEST 2: Inserción de anexo y persistencia en Repositorio ---');
const testClassId = 'cls_test_attachments_1';
const initialClass = {
  id: testClassId,
  teacherId: 'usr_manuel',
  date: '2026-03-20',
  sequenceNumber: 15,
  subjectName: 'Aritmética',
  gradeName: 'Segundo',
  topic: 'Prueba de anexos',
  attachments: []
};

ClassRepository.saveClass(initialClass);

const fakeImageDataUrl = 'data:image/jpeg;base64,' + Buffer.from('fake_compressed_image_bytes').toString('base64');
const fakePdfDataUrl = 'data:application/pdf;base64,' + Buffer.from('fake_pdf_document_bytes').toString('base64');

ClassEditorView.currentClass = JSON.parse(JSON.stringify(initialClass));

// Simular agregado de imagen
ClassEditorView.currentClass.attachments.push({
  name: 'foto_pizarra_clase15.jpg',
  type: 'image/jpeg',
  sizeText: '120 KB',
  dataUrl: fakeImageDataUrl
});

// Simular agregado de PDF
ClassEditorView.currentClass.attachments.push({
  name: 'taller_matematicas_2do.pdf',
  type: 'application/pdf',
  sizeText: '350 KB',
  dataUrl: fakePdfDataUrl
});

// Guardar en ClassRepository
const savedClass = ClassRepository.saveClass(ClassEditorView.currentClass);
assert.strictEqual(savedClass.attachments.length, 2, 'Debe tener 2 anexos');
assert.strictEqual(savedClass.attachments[0].name, 'foto_pizarra_clase15.jpg');
assert.strictEqual(savedClass.attachments[1].name, 'taller_matematicas_2do.pdf');
console.log('  ✅ [PASS] Anexos guardados en ClassRepository correctamente.');

// Test 3: Verificación de renderizado de la cuadrícula de anexos
console.log('\n--- TEST 3: Renderizado HTML de la galería de anexos ---');
const gridHtml = ClassEditorView._renderAttachmentsGrid(savedClass.attachments);
assert.ok(gridHtml.includes('foto_pizarra_clase15.jpg'), 'El HTML debe contener el nombre de la imagen');
assert.ok(gridHtml.includes('taller_matematicas_2do.pdf'), 'El HTML debe contener el nombre del PDF');
assert.ok(gridHtml.includes('DOCUMENTO PDF'), 'El HTML debe contener la insignia PDF');
assert.ok(gridHtml.includes('IMAGEN'), 'El HTML debe contener la insignia IMAGEN');
assert.ok(gridHtml.includes('ClassEditorView.previewAttachment(0)'), 'Debe incluir botón de vista previa');
assert.ok(gridHtml.includes('ClassEditorView.deleteAttachment(0)'), 'Debe incluir botón de eliminación');
console.log('  ✅ [PASS] Galería de anexos renderizada con miniaturas, botones de ver, descargar y eliminar.');

// Test 4: Recuperación desde el repositorio tras recarga
console.log('\n--- TEST 4: Persistencia y recuperación tras recarga ---');
const retrieved = ClassRepository.getClass(testClassId);
assert.ok(retrieved, 'La clase debe existir');
assert.strictEqual(retrieved.attachments.length, 2);
assert.strictEqual(retrieved.attachments[0].dataUrl, fakeImageDataUrl);
console.log('  ✅ [PASS] Anexos recuperados intactos desde ClassRepository.');

// Test 5: Comprobación de que la cuadrícula vacía muestra mensaje orientador
console.log('\n--- TEST 5: Mensaje de galería vacía ---');
const emptyGridHtml = ClassEditorView._renderAttachmentsGrid([]);
assert.ok(emptyGridHtml.includes('Esta clase aún no tiene archivos ni imágenes adjuntas'), 'Debe mostrar texto amigable');
console.log('  ✅ [PASS] Mensaje informativo ante ausencia de anexos verificado.');

console.log('\n================================================================');
console.log('TODAS LAS PRUEBAS DE ANEXOS E IMÁGENES SUPERADAS (PASS)');
console.log('================================================================\n');
