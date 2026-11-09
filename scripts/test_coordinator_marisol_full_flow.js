/**
 * TEST AUTOMATIZADO INTEGRAL:
 * Interfaz de la Coordinadora Marisol Ruiz:
 * - Visualización y descarga del Cuaderno (Word .doc y PDF)
 * - Visualización y descarga del PDF de la Tabla de Desarrollo de Clases (Secuencia didáctica oficial)
 * - Visualización de las clases del día del docente titular (Manuel Muñoz) y sus planeaciones
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// 1. Simulación de entorno DOM y navegador
global.window = {};
global.document = {
  _elements: {},
  getElementById(id) {
    if (!this._elements[id]) {
      this._elements[id] = {
        id,
        className: '',
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); },
          toggle(c, force) { if (force !== undefined) { force ? this.add(c) : this.remove(c); } else { this.contains(c) ? this.remove(c) : this.add(c); } }
        },
        style: {},
        innerHTML: '',
        value: '',
        remove() { delete global.document._elements[id]; }
      };
    }
    return this._elements[id];
  },
  querySelector(sel) { return null; },
  querySelectorAll(sel) { return []; },
  body: {
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    },
    appendChild(el) { global.lastAppendedChild = el; return el; },
    removeChild(el) {}
  },
  createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      style: {},
      innerHTML: '',
      dataset: {},
      click() { global.lastClickedElement = this; },
      remove() {}
    };
    return el;
  },
  head: { appendChild(el) {} }
};

global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; }
};

global.sessionStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; }
};

global.Blob = function(parts, opts) {
  this.parts = parts;
  this.opts = opts;
  global.lastBlobCreated = this;
};

global.URL = {
  createObjectURL(blob) { return 'blob:mock-url-' + Date.now(); },
  revokeObjectURL(url) {}
};

global.IDBStorage = { isSupported: () => false };

// Cargar dependencias de la app
require('../js/data/initial-classes-data.js');
const StorageService = require('../js/storage.js');
const UserService = require('../js/users-service.js');
const ClassRepo = require('../js/repositories/class-repository.js');
const PlanRepo = require('../js/plan-repository.js');
const ExportService = require('../js/export.js');
const NotebookEditor = require('../js/notebook-editor.js');
const CoordView = require('../js/coordinator-view.js');

global.StorageService = StorageService;
global.UserService = UserService;
global.ClassRepository = ClassRepo;
global.PlanRepository = PlanRepo;
global.ExportService = ExportService;
global.NotebookEditor = NotebookEditor;
global.CoordinatorView = CoordView;

async function runTests() {
  console.log('🚀 Iniciando Suite de Pruebas: Interfaz y Flujo de Coordinadora Marisol Ruiz...\n');

  // Inicializar repositorios
  await ClassRepo.init('usr_manuel');
  await PlanRepo.init('usr_manuel');

  // PRUEBA 1: Establecer sesión activa de Marisol Ruiz
  console.log('1. Verificando perfil y sesión institucional de Marisol Ruiz...');
  UserService.setCurrentUser('usr_coordinacion');
  assert.strictEqual(UserService.isCoordinatorActive(), true, 'isCoordinatorActive debe ser verdadero para Marisol Ruiz');
  const current = UserService.getCurrentUser();
  assert.strictEqual(current.name, 'Marisol Ruiz');
  assert.strictEqual(current.role, 'coordinator');
  console.log('   ✅ Sesión activa de Marisol Ruiz configurada con éxito.');

  // PRUEBA 2: Mapeo transparente de datos hacia Manuel Muñoz
  console.log('2. Verificando que las consultas de Coordinación mapean a las planeaciones de Manuel Muñoz...');
  const coordClasses = ClassRepo.getAllClasses('usr_coordinacion');
  assert(coordClasses.length > 0, 'ClassRepo debe mapear usr_coordinacion a usr_manuel y retornar sus clases');
  const coordPlans = PlanRepo.getAllPlans('usr_coordinacion');
  assert(Object.keys(coordPlans).length > 0, 'PlanRepo debe mapear usr_coordinacion a usr_manuel y retornar sus planeaciones');
  console.log(`   ✅ Correcto: Se recuperaron ${coordClasses.length} clases y ${Object.keys(coordPlans).length} fechas con planeaciones.`);

  // PRUEBA 3: Visualización de clases del día en openDayClassesReview
  console.log('3. Verificando la visualización de clases del día con sus respectivas planeaciones...');
  const testDate = '2026-10-15';
  CoordView.openDayClassesReview(testDate, 'usr_coordinacion');
  const dayModal = global.lastAppendedChild;
  assert(dayModal, 'openDayClassesReview debe generar el modal en el DOM');
  const html = dayModal.innerHTML;

  assert(html.includes('Planeaciones del Día: Jueves, 15 de Octubre de 2026'), 'Debe mostrar el encabezado de fecha');
  assert(html.includes('Docente titular: <strong>Manuel Muñoz</strong>'), 'Debe indicar a Manuel Muñoz como titular');
  assert(html.includes('Sistemas 1°'), 'Debe contener la clase de Sistemas 1°');
  assert(html.includes('Diferencias entre objetos naturales y artificiales'), 'Debe contener el tema de la clase');
  assert(html.includes('📖 Cuaderno Docente:'), 'Debe contener la sección de acciones de Cuaderno');
  assert(html.includes('📋 Tabla de Desarrollo de Clase:'), 'Debe contener la sección de acciones de Tabla');
  console.log('   ✅ Clases del día y sus planeaciones renderizadas correctamente.');

  // PRUEBA 4: Acciones requeridas de Cuaderno (Ver, Word .doc y PDF)
  console.log('4. Verificando botones de descarga y visualización del Cuaderno...');
  assert(html.includes('CoordinatorView.openClassNotebookReader'), 'Debe tener botón para Ver Cuaderno');
  assert(html.includes('CoordinatorView.downloadNotebookWord'), 'Debe tener botón para Descargar Word (.doc) del Cuaderno');
  assert(html.includes('CoordinatorView.downloadNotebookPdf'), 'Debe tener botón para Descargar PDF del Cuaderno');
  console.log('   ✅ Acciones de Cuaderno (Ver, Word, PDF) presentes en cada clase.');

  // PRUEBA 5: Acciones requeridas de Tabla de Desarrollo (Ver Tabla, PDF Tabla, Word Tabla)
  console.log('5. Verificando botones de visualización y PDF de la Tabla de Desarrollo de Clases...');
  assert(html.includes('CoordinatorView.inspectPlan'), 'Debe tener botón para Ver Tabla de desarrollo');
  assert(html.includes('CoordinatorView.downloadTeacherPdf'), 'Debe tener botón para Descargar PDF de la Tabla de desarrollo');
  assert(html.includes('CoordinatorView.downloadTeacherDocx'), 'Debe tener botón para Descargar Word de la Tabla de desarrollo');
  console.log('   ✅ Acciones de Tabla de Desarrollo (Ver, PDF, Word) presentes en cada clase.');

  // PRUEBA 6: Descarga física de Cuaderno en Word (.doc)
  console.log('6. Probando descarga directa del Cuaderno en Word (.doc)...');
  global.lastBlobCreated = null;
  global.lastClickedElement = null;
  CoordView.downloadNotebookWord('usr_manuel', testDate, 0);
  assert(global.lastBlobCreated, 'downloadNotebookWord debe instanciar un Blob con el documento Word');
  assert(global.lastClickedElement, 'downloadNotebookWord debe disparar la descarga en el navegador');
  assert(global.lastClickedElement.download.endsWith('.doc'), 'El archivo descargado debe tener extensión .doc');
  assert(global.lastBlobCreated.parts[0].includes('COLEGIO HOGAR MADRE DE DIOS'), 'El Word debe contener el membrete institucional');
  assert(global.lastBlobCreated.parts[0].includes('Cuaderno Pedagógico de Clase'), 'El Word debe tener el título de Cuaderno Pedagógico');
  console.log(`   ✅ Descarga Word del Cuaderno generada exitosamente: "${global.lastClickedElement.download}".`);

  // PRUEBA 7: Modal de lectura del Cuaderno (openClassNotebookReader)
  console.log('7. Probando visor de Cuaderno Docente (openClassNotebookReader)...');
  CoordView.openClassNotebookReader('usr_manuel', testDate, 0);
  const readerModal = global.lastAppendedChild;
  assert(readerModal, 'openClassNotebookReader debe generar modal en el DOM');
  const readerHtml = readerModal.innerHTML;
  assert(readerHtml.includes('Cuaderno Pedagógico: Sistemas 1°'), 'Debe mostrar el título del cuaderno');
  assert(readerHtml.includes('CoordinatorView.downloadNotebookWord'), 'Debe tener botón para descargar Word (.doc)');
  assert(readerHtml.includes('CoordinatorView.downloadNotebookPdf'), 'Debe tener botón para descargar PDF');
  assert(readerHtml.includes('CoordinatorView.inspectPlan'), 'Debe tener botón para alternar a la tabla');
  console.log('   ✅ Visor de Cuaderno con descargas Word/PDF y navegación a Tabla verificado.');

  // PRUEBA 8: Visor oficial de Tabla de Desarrollo (inspectPlan)
  console.log('8. Probando visor oficial de Tabla de Desarrollo (inspectPlan)...');
  CoordView.inspectPlan('usr_manuel', testDate, 0);
  const inspectModal = global.lastAppendedChild;
  assert(inspectModal, 'inspectPlan debe generar modal en el DOM');
  const inspectHtml = inspectModal.innerHTML;
  assert(inspectHtml.includes('Tabla de Secuencia Didáctica Oficial'), 'Debe mostrar el título oficial');
  assert(inspectHtml.includes('PREPARADOR DE CLASE'), 'Debe contener la hoja oficial del preparador');
  assert(inspectHtml.includes('Secuencia didáctica Inicio-Desarrollo'), 'Debe contener la columna de desarrollo de clase');
  assert(inspectHtml.includes('CoordinatorView.downloadTeacherPdf'), 'Debe tener botón para descargar PDF de la tabla');
  assert(inspectHtml.includes('CoordinatorView.openClassNotebookReader'), 'Debe tener botón para ver el cuaderno');
  console.log('   ✅ Tabla de Desarrollo oficial con exportación PDF y enlace al Cuaderno verificado.');

  // PRUEBA 9: Banner del Calendario para Coordinación
  console.log('9. Verificando banner del Calendario para Marisol Ruiz...');
  const calJs = fs.readFileSync(path.join(__dirname, '../js/calendar.js'), 'utf8');
  assert(calJs.includes('CoordinatorView.openDayClassesReview'), 'Banner de calendario debe tener botón para Clases de Hoy');
  assert(calJs.includes('CoordinatorView.openDashboard'), 'Banner de calendario debe tener botón para Panel General');
  assert(calJs.includes('AuthModal.logout'), 'Banner de calendario debe tener botón para Cerrar Sesión');
  console.log('   ✅ Banner del Calendario con botones de acceso directo verificado.');

  // PRUEBA 10: CSS en index.html para modo coordinador y cuaderno
  console.log('10. Verificando reglas CSS en index.html...');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert(indexHtml.includes('body.role-coordinator-active:not(.notebook-mode) #calendar-view'), 'CSS debe permitir vista de cuaderno');
  assert(indexHtml.includes('body.role-coordinator-active.notebook-mode #notebook-view'), 'CSS debe desplegar notebook-view en modo cuaderno');
  assert(indexHtml.includes('@media print'), 'CSS debe contemplar ocultamiento en impresión');
  console.log('   ✅ Reglas CSS en index.html verificadas.');

  console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100%)!');
}

runTests().catch(err => {
  console.error('\n❌ ERROR EN PRUEBAS:', err);
  process.exit(1);
});
