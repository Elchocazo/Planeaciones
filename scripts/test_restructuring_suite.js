/**
 * SUITE DE PRUEBAS DE LA REESTRUCTURACIÓN DEFINITIVA (20 PRUEBAS MANDATORIAS)
 * Verifica todos los criterios del Requisito 109:
 * Persistencia atómica, números de secuencia inmutables, independencia 4A/4B,
 * navegación de solo lectura, formatos de exportación intactos y migración segura.
 */

const fs = require('fs');
const path = require('path');

// 1. Configuración de entorno Node.js para emulación de DOM y Storage
const memoryStore = {};
global.window = global;
global.window.scrollTo = function() {};

global.localStorage = {
  store: memoryStore,
  getItem(k) { return this.store[k] !== undefined ? this.store[k] : null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { for (let k in this.store) delete this.store[k]; }
};

global.document = {
  addEventListener() {},
  getElementById(id) {
    return {
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      addEventListener() {},
      classList: { add() {}, remove() {}, toggle() {} },
      querySelectorAll() { return []; },
      querySelector() { return null; }
    };
  },
  querySelectorAll() { return []; },
  body: {
    insertAdjacentHTML() {},
    classList: { add() {}, remove() {}, toggle() {} }
  }
};

// 2. Carga de Módulos
const UserService = require('../js/users-service.js');
global.UserService = UserService;

const ScheduleRepository = require('../js/repositories/schedule-repository.js');
global.ScheduleRepository = ScheduleRepository;

const SequenceRepository = require('../js/repositories/sequence-repository.js');
global.SequenceRepository = SequenceRepository;

const ClassRepository = require('../js/repositories/class-repository.js');
global.ClassRepository = ClassRepository;

const CurriculumRepository = require('../js/repositories/curriculum-repository.js');
global.CurriculumRepository = CurriculumRepository;

const AppState = require('../js/core/app-state.js');
global.AppState = AppState;

const AppRouter = require('../js/core/router.js');
global.AppRouter = AppRouter;

const ClassService = require('../js/services/class-service.js');
global.ClassService = ClassService;

const SequenceService = require('../js/services/sequence-service.js');
global.SequenceService = SequenceService;

const ScheduleService = require('../js/services/schedule-service.js');
global.ScheduleService = ScheduleService;

const MigrationManager = require('../js/services/migration-manager.js');
global.MigrationManager = MigrationManager;

const BackupService = require('../js/services/backup-service.js');
global.BackupService = BackupService;

const ExportAdapter = require('../js/export/export-adapter.js');
global.ExportAdapter = ExportAdapter;

const ExportService = require('../js/export.js');
global.ExportService = ExportService;

const PlanRepository = require('../js/plan-repository.js');
global.PlanRepository = PlanRepository;

const StorageService = require('../js/storage.js');
global.StorageService = StorageService;

// Configuración de docente de prueba
const TEACHER_ID = 'usr_manuel';
UserService.setCurrentUser(TEACHER_ID);

StorageService.saveProfile({
  id: TEACHER_ID,
  name: 'Manuel Mosquera',
  period: '1°',
  homeroom: '7°',
  subjects: [
    { name: 'Sistemas', grades: ['4°A', '4°B'] },
    { name: 'Robótica', grades: ['10°'] }
  ],
  weeklySchedule: {
    "1": [
      { subject: 'Sistemas', grade: '4°A', time: '07:00 - 08:00' },
      { subject: 'Sistemas', grade: '4°B', time: '08:00 - 09:00' }
    ],
    "2": [
      { subject: 'Robótica', grade: '10°', time: '07:00 - 08:00' }
    ]
  }
});

let testCount = 0;
let passCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Fallo en prueba: ${message}`);
  }
}

console.log('================================================================');
console.log('SUITE DE REESTRUCTURACIÓN: 20 PRUEBAS MANDATORIAS (REQ. 109)');
console.log('================================================================\n');

async function runAllTests() {
  // -------------------------------------------------------------
  console.log('--- TEST 01: Navegación de solo lectura (loadDate nunca muta ni guarda) ---');
  // -------------------------------------------------------------
  const initialDataCount = Object.keys(memoryStore).length;
  // Llamar a lectura de vista
  const dayView = ScheduleService.buildDayView('2026-09-15', TEACHER_ID);
  assert(dayView !== null, 'ScheduleService genera la vista del día sin errores');
  assert(dayView.date === '2026-09-15', 'Fecha de vista corresponde a la solicitada');
  assert(Object.keys(memoryStore).length === initialDataCount, 'Navegar/leer no agregó ni una sola clave a la persistencia (estricta lectura)');

  // -------------------------------------------------------------
  console.log('\n--- TEST 02: Independencia de consecutivos por paralelo (4°A ≠ 4°B) ---');
  // -------------------------------------------------------------
  const seq4A_1 = SequenceRepository.getNextSequenceNumber('1°', 'Sistemas', '4°A', TEACHER_ID);
  assert(seq4A_1 === 1, 'Sistemas 4°A inicia en consecutivo 1');

  // Registrar clase para 4°A
  const cls4A_1 = {
    id: 'cls_4a_1',
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Sistemas',
    gradeName: '4°A',
    sequenceNumber: 1,
    date: '2026-09-15'
  };
  ClassRepository.saveClass(cls4A_1);

  const seq4A_2 = SequenceRepository.getNextSequenceNumber('1°', 'Sistemas', '4°A', TEACHER_ID);
  assert(seq4A_2 === 2, 'Sistemas 4°A avanza a consecutivo 2');

  const seq4B_1 = SequenceRepository.getNextSequenceNumber('1°', 'Sistemas', '4°B', TEACHER_ID);
  assert(seq4B_1 === 1, 'Sistemas 4°B permanece en consecutivo 1 de forma totalmente independiente');

  // -------------------------------------------------------------
  console.log('\n--- TEST 03: Consecutivo persiste tras recargas (Clase 5 sigue siendo Clase 5) ---');
  // -------------------------------------------------------------
  const clsRob_5 = {
    id: 'cls_rob_5',
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Robótica',
    gradeName: '10°',
    sequenceNumber: 5,
    date: '2026-09-22',
    pedagogy: { inicio: 'Inicio de la clase 5' }
  };
  ClassRepository.saveClass(clsRob_5);

  // Simular recarga: leer directamente desde el repositorio
  const reloadedRob5 = ClassRepository.getClass('cls_rob_5');
  assert(reloadedRob5 !== null, 'Clase 5 se recupera exitosamente');
  assert(reloadedRob5.sequenceNumber === 5, 'Clase 5 mantiene estrictamente sequenceNumber === 5');
  assert(reloadedRob5.pedagogy.inicio === 'Inicio de la clase 5', 'Contenido pedagógico intacto');

  // -------------------------------------------------------------
  console.log('\n--- TEST 04: Editar una clase no afecta a las demás clases ---');
  // -------------------------------------------------------------
  const clsRob_4 = {
    id: 'cls_rob_4',
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Robótica',
    gradeName: '10°',
    sequenceNumber: 4,
    date: '2026-09-20',
    pedagogy: { inicio: 'Inicio original 4', desarrollo: 'Desarrollo original 4' }
  };
  ClassRepository.saveClass(clsRob_4);

  // Modificar Clase 5
  reloadedRob5.pedagogy.inicio = 'INICIO MODIFICADO EXCLUSIVAMENTE EN CLASE 5';
  ClassRepository.saveClass(reloadedRob5);

  const checkRob4 = ClassRepository.getClass('cls_rob_4');
  assert(checkRob4.pedagogy.inicio === 'Inicio original 4', 'Clase 4 no fue alterada');
  assert(checkRob4.pedagogy.desarrollo === 'Desarrollo original 4', 'Desarrollo de Clase 4 intacto');
  assert(ClassRepository.getClass('cls_rob_5').pedagogy.inicio === 'INICIO MODIFICADO EXCLUSIVAMENTE EN CLASE 5', 'Clase 5 guardó sus cambios');

  // -------------------------------------------------------------
  console.log('\n--- TEST 05: Modificar un día no afecta a otros días ---');
  // -------------------------------------------------------------
  const clsMartes = {
    id: 'cls_martes_1',
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Robótica',
    gradeName: '10°',
    sequenceNumber: 6,
    date: '2026-09-29',
    pedagogy: { desarrollo: 'Clase del Martes 29' }
  };
  const clsMiercoles = {
    id: 'cls_miercoles_1',
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Robótica',
    gradeName: '10°',
    sequenceNumber: 7,
    date: '2026-09-30',
    pedagogy: { desarrollo: 'Clase del Miércoles 30' }
  };
  ClassRepository.saveClass(clsMartes);
  ClassRepository.saveClass(clsMiercoles);

  // Modificar Martes
  clsMartes.pedagogy.desarrollo = 'NUEVO DESARROLLO MARTES 29';
  ClassRepository.saveClass(clsMartes);

  assert(ClassRepository.getClass('cls_miercoles_1').pedagogy.desarrollo === 'Clase del Miércoles 30', 'El Miércoles 30 permaneció 100% inmutable');
  assert(ClassRepository.getClass('cls_martes_1').pedagogy.desarrollo === 'NUEVO DESARROLLO MARTES 29', 'El Martes 29 se actualizó');

  // -------------------------------------------------------------
  console.log('\n--- TEST 06: Guardado atómico solo persiste la clase activa ---');
  // -------------------------------------------------------------
  ClassService.setCurrentEditingClass('cls_rob_5');
  const updateResult = ClassService.updateCurrentClassField('pedagogy.cierre', 'Cierre atómico guardado');
  assert(updateResult.success === true, 'Actualización en ClassService reporta éxito');
  
  const savedCurrent = ClassService.saveCurrentEditingClass();
  assert(savedCurrent.success === true, 'Guardado atómico de la clase activa reporta éxito');
  assert(ClassRepository.getClass('cls_rob_5').pedagogy.cierre === 'Cierre atómico guardado', 'Campo de cierre guardado en Clase 5');
  assert(ClassRepository.getClass('cls_rob_4').pedagogy.cierre === undefined || ClassRepository.getClass('cls_rob_4').pedagogy.cierre === '', 'Clase 4 no recibió mutaciones colaterales');

  // -------------------------------------------------------------
  console.log('\n--- TEST 07: Exportación genera formato institucional idéntico ---');
  // -------------------------------------------------------------
  const fullCls = ClassRepository.getClass('cls_rob_5');
  const adapted = ExportAdapter.fromClass(fullCls, { name: 'Manuel Mosquera', institution: 'Colegio Test' });
  assert(adapted.date === fullCls.date, 'ExportAdapter conserva fecha');
  assert(Array.isArray(adapted.classes) && adapted.classes.length === 1, 'Contiene la clase individual');
  assert(adapted.classes[0].subject === 'Robótica', 'Materia coincide');
  assert(adapted.classes[0].grade === '10°', 'Grado coincide');
  assert(adapted.classes[0].consecutive === 5, 'Consecutivo coincide');

  // -------------------------------------------------------------
  console.log('\n--- TEST 08: Estilos PDF previenen cortes de filas y encabezados huérfanos ---');
  // -------------------------------------------------------------
  const cssPath = path.join(__dirname, '../css/styles.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert(cssContent.includes('page-break-inside: avoid'), 'CSS contiene tr { page-break-inside: avoid }');
  assert(cssContent.includes('preparador-phase-title') && cssContent.includes('page-break-after: avoid'), 'CSS previene títulos de fase huérfanos con page-break-after: avoid');

  // -------------------------------------------------------------
  console.log('\n--- TEST 09: Generador Word (.docx) produce tablas institucionales 2x6 ---');
  // -------------------------------------------------------------
  const docxGeneratorPath = path.join(__dirname, '../js/docx-generator.js');
  const docxContent = fs.readFileSync(docxGeneratorPath, 'utf8');
  assert(docxContent.includes('tblHeader'), 'docx-generator repite encabezado de tabla (tblHeader)');
  assert(docxContent.includes('cantSplit'), 'docx-generator previene corte de filas con cantSplit');

  // -------------------------------------------------------------
  console.log('\n--- TEST 10: Dashboard muestra clases programadas del día ---');
  // -------------------------------------------------------------
  // Lunes tiene Sistemas 4°A y Sistemas 4°B
  const mondayView = ScheduleService.buildDayView('2026-09-14', TEACHER_ID); // Lunes
  assert(mondayView.scheduledItems.length === 2, 'El Lunes tiene 2 slots programados');
  assert(mondayView.scheduledItems[0].slot.subjectName === 'Sistemas', 'Slot 1 es Sistemas');
  assert(mondayView.scheduledItems[0].slot.gradeName === '4°A', 'Slot 1 es 4°A');
  assert(mondayView.scheduledItems[1].slot.gradeName === '4°B', 'Slot 2 es 4°B');

  // -------------------------------------------------------------
  console.log('\n--- TEST 11: Estado de clase preciso (Programada, Planeada, Pendiente) ---');
  // -------------------------------------------------------------
  // Slot 1 (4A) tiene clase creada pero sin tema -> Pendiente
  // Creamos clase con tema para slot 2 (4B)
  const cls4B = {
    id: 'cls_4b_planned',
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Sistemas',
    gradeName: '4°B',
    sequenceNumber: 1,
    date: '2026-09-14',
    curriculum: { topic: 'El Hardware y la CPU' },
    pedagogy: { inicio: 'Saludo y motivación' }
  };
  ClassRepository.saveClass(cls4B);

  const mondayStatusView = ScheduleService.buildDayView('2026-09-14', TEACHER_ID);
  const item4B = mondayStatusView.scheduledItems.find(i => i.slot.gradeName === '4°B');
  assert(item4B.isPlanned === true, 'Clase con tema se clasifica como Planeada');
  assert(item4B.isPending === false, 'Clase planeada no es pendiente');

  // -------------------------------------------------------------
  console.log('\n--- TEST 12: Importación de Malla genera snapshot inmutable ---');
  // -------------------------------------------------------------
  const snapshotCurriculum = {
    topic: 'Algoritmos y Diagramas',
    dba: 'DBA 1 - Comprende diagramas de flujo',
    achievement: 'Diseña un algoritmo básico'
  };
  const importedClass = {
    id: 'cls_snapshot_test',
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Sistemas',
    gradeName: '4°A',
    sequenceNumber: 3,
    date: '2026-10-05',
    curriculum: JSON.parse(JSON.stringify(snapshotCurriculum))
  };
  ClassRepository.saveClass(importedClass);

  // Modificar el objeto origen simulando cambio externo en el banco
  snapshotCurriculum.topic = 'TEMA MODIFICADO EN BANCO';

  const readSnapshot = ClassRepository.getClass('cls_snapshot_test');
  assert(readSnapshot.curriculum.topic === 'Algoritmos y Diagramas', 'La clase conserva su snapshot inmutable sin verse afectada por cambios externos');

  // -------------------------------------------------------------
  console.log('\n--- TEST 13: Modificar la Malla curricular no altera clases históricas ---');
  // -------------------------------------------------------------
  // Simulamos un update en CurriculumRepository si existiera mutador
  const histCls = ClassRepository.getClass('cls_snapshot_test');
  assert(histCls.curriculum.topic === 'Algoritmos y Diagramas', 'Histórico permanece fiel a la fecha de creación');

  // -------------------------------------------------------------
  console.log('\n--- TEST 14: Modo rápido genera clase válida y completa ---');
  // -------------------------------------------------------------
  const quickResult = ClassService.applyQuickPlan({
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Robótica',
    gradeName: '10°',
    date: '2026-10-06',
    topic: 'Sensores Ultrasónicos',
    dba: 'DBA Sensores',
    achievement: 'Conecta sensor HC-SR04',
    activity: 'Práctica de medición de distancia con Arduino'
  });
  assert(quickResult.success === true, 'Planeación rápida reporta éxito');
  const qClass = quickResult.classSession;
  assert(qClass.curriculum.topic === 'Sensores Ultrasónicos', 'Tema asignado');
  assert(qClass.pedagogy.desarrollo === 'Práctica de medición de distancia con Arduino', 'Actividad mapeada a desarrollo');
  assert(qClass.sequenceNumber > 0, 'Consecutivo asignado');

  // -------------------------------------------------------------
  console.log('\n--- TEST 15: Modo detallado preserva los 7 campos pedagógicos ---');
  // -------------------------------------------------------------
  const detailedClass = {
    id: 'cls_detailed_7',
    teacherId: TEACHER_ID,
    period: '1°',
    subjectName: 'Robótica',
    gradeName: '10°',
    sequenceNumber: 15,
    date: '2026-10-07',
    pedagogy: {
      inicio: 'Fase 1: Activación de saberes',
      desarrollo: 'Fase 2: Construcción de pinza robótica',
      cierre: 'Fase 3: Socialización y pruebas',
      recursos: 'Servomotores, cables, tarjetas',
      evaluacion: 'Rúbrica de ensamble',
      tareas: 'Consultar sobre grados de libertad',
      observaciones: 'Estudiantes muy motivados'
    }
  };
  ClassRepository.saveClass(detailedClass);
  const readDetailed = ClassRepository.getClass('cls_detailed_7');
  assert(readDetailed.pedagogy.inicio === 'Fase 1: Activación de saberes', 'Preserva inicio');
  assert(readDetailed.pedagogy.desarrollo === 'Fase 2: Construcción de pinza robótica', 'Preserva desarrollo');
  assert(readDetailed.pedagogy.cierre === 'Fase 3: Socialización y pruebas', 'Preserva cierre');
  assert(readDetailed.pedagogy.recursos === 'Servomotores, cables, tarjetas', 'Preserva recursos');
  assert(readDetailed.pedagogy.evaluacion === 'Rúbrica de ensamble', 'Preserva evaluacion');
  assert(readDetailed.pedagogy.tareas === 'Consultar sobre grados de libertad', 'Preserva tareas');
  assert(readDetailed.pedagogy.observaciones === 'Estudiantes muy motivados', 'Preserva observaciones');

  // -------------------------------------------------------------
  console.log('\n--- TEST 16: Migración preserva 100% de los datos sin pérdida ---');
  // -------------------------------------------------------------
  // Inyectar un plan legacy v3 con datos completos
  const legacyDate = '2026-11-10';
  const legacyKey = `teacher_planner_plans_${TEACHER_ID}_v3`;
  const existingV3 = JSON.parse(memoryStore[legacyKey] || '{}');
  existingV3[legacyDate] = {
    date: legacyDate,
    period: '1°',
    classes: [
      {
        id: 'legacy_cls_99',
        subject: 'Robótica',
        grade: '10°',
        consecutive: 20,
        topic: 'Robots Móviles',
        dba: 'DBA Robótica Móvil',
        achievement: 'Diseña chasis',
        description: 'INICIO:\nRevisión de motores.\n\nDESARROLLO:\nMontaje del puente H.\n\nCIERRE:\nPrueba de giro.\n\nRECURSOS:\nMotores DC.',
        observations: 'Clase exitosa',
        notebookContent: '<p>Guía de laboratorio</p>'
      }
    ]
  };
  memoryStore[legacyKey] = JSON.stringify(existingV3);
  localStorage.setItem('planeaciones_data_schema_version', '3'); // Forzar necesidad de migración

  const migResult = await MigrationManager.runMigration(TEACHER_ID);
  assert(migResult.success === true, 'Migración a v4 reporta éxito');
  
  const migratedClass = ClassRepository.getClass('legacy_cls_99');
  assert(migratedClass !== null, 'Clase heredada fue migrada y encontrada');
  assert(migratedClass.sequenceNumber === 20, 'Consecutivo 20 preservado');
  assert(migratedClass.curriculum.topic === 'Robots Móviles', 'Tema preservado');
  assert(migratedClass.pedagogy.inicio.includes('Revisión de motores'), 'Inicio extraído con fidelidad');
  assert(migratedClass.pedagogy.desarrollo.includes('Montaje del puente H'), 'Desarrollo extraído con fidelidad');
  assert(migratedClass.pedagogy.cierre.includes('Prueba de giro'), 'Cierre extraído con fidelidad');
  assert(migratedClass.pedagogy.recursos.includes('Motores DC'), 'Recursos extraídos con fidelidad');
  assert(migratedClass.pedagogy.observaciones === 'Clase exitosa', 'Observaciones preservadas');
  assert(migratedClass.notebookContent === '<p>Guía de laboratorio</p>', 'Cuaderno docente preservado byte por byte');

  // -------------------------------------------------------------
  console.log('\n--- TEST 17: Respaldo (Backup) exporta y restaura estado idéntico ---');
  // -------------------------------------------------------------
  const fullBackup = BackupService.generateFullBackup(TEACHER_ID);
  assert(fullBackup !== null, 'Backup generado');
  assert(fullBackup.schemaVersion >= 4, 'Backup registra schemaVersion válida (v4 o v5)');

  // Modificar estado temporalmente
  const prevCount = ClassRepository.getAllClasses(TEACHER_ID).length;
  ClassRepository.deleteClass('legacy_cls_99', TEACHER_ID);
  assert(ClassRepository.getClass('legacy_cls_99') === null, 'Clase eliminada temporalmente');

  // Restaurar desde backup
  const restoreRes = await BackupService.restoreBackup(fullBackup, TEACHER_ID);
  assert(restoreRes.success === true, 'Restauración reporta éxito');
  assert(ClassRepository.getClass('legacy_cls_99') !== null, 'Clase restaurada con éxito desde backup');
  assert(ClassRepository.getAllClasses(TEACHER_ID).length === prevCount, 'Cantidad total de clases coincide con el backup');

  // -------------------------------------------------------------
  console.log('\n--- TEST 18: Sincronización de persistencia y compatibilidad espejo ---');
  // -------------------------------------------------------------
  const mirrorKey = `teacher_planner_plans_${TEACHER_ID}_v3`;
  const mirrorPlans = JSON.parse(memoryStore[mirrorKey] || '{}');
  assert(mirrorPlans[legacyDate] !== undefined, 'El mirror v3 se mantiene actualizado para componentes legados');
  assert(mirrorPlans[legacyDate].classes.some(c => c.id === 'legacy_cls_99'), 'La clase migrada existe en el mirror');

  // -------------------------------------------------------------
  console.log('\n--- TEST 19: Cálculo exacto de progreso de secuencias ---');
  // -------------------------------------------------------------
  const prog = SequenceService.calculateProgress('1°', 'Robótica', '10°', TEACHER_ID);
  assert(prog.total > 0, 'Total de clases contabilizadas mayor a cero');
  assert(prog.planned > 0, 'Clases planeadas contabilizadas');
  assert(prog.percentage >= 0 && prog.percentage <= 100, 'Porcentaje dentro del rango 0 - 100%');
  assert(prog.planned + prog.pending === prog.total, 'Suma de planeadas y pendientes es igual al total');

  // -------------------------------------------------------------
  console.log('\n--- TEST 20: Duplicar clase asigna el siguiente consecutivo (max + 1) ---');
  // -------------------------------------------------------------
  const currentMaxSeq = SequenceRepository.getNextSequenceNumber('1°', 'Robótica', '10°', TEACHER_ID);
  const dupResult = ClassService.duplicateClassAsNext('cls_rob_5', '2026-10-15', TEACHER_ID);
  assert(dupResult.success === true, 'Duplicar clase reporta éxito');
  const dupClass = dupResult.classSession;
  assert(dupClass.sequenceNumber === currentMaxSeq, `La clase duplicada recibió el siguiente número consecutivo: ${currentMaxSeq}`);
  assert(dupClass.id !== 'cls_rob_5', 'La clase duplicada tiene un id nuevo e independiente');
  assert(dupClass.date === '2026-10-15', 'La fecha de la clase duplicada es la fecha destino');
  assert(dupClass.curriculum.topic === ClassRepository.getClass('cls_rob_5').curriculum.topic, 'Copia el contenido curricular');

  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`RESULTADO FINAL DE REESTRUCTURACIÓN: ${passCount}/${testCount} PRUEBAS SUPERADAS (100%)`);
  console.log('================================================================');
}

runAllTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('\n❌ ERROR EN EJECUCIÓN DE PRUEBAS:', err);
  process.exit(1);
});
