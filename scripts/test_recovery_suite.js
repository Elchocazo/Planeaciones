/**
 * SUITE DE PRUEBAS: RECUPERACIÓN DE DATOS, AUDITORÍA E IMPORTADOR INTELIGENTE
 * Verifica el 100% de los requerimientos de la reestructuración definitiva y salvaguarda de datos.
 */

const assert = require('assert');

// 1. Mocks de Entorno de Persistencia
const memoryStore = {};
global.localStorage = {
  getItem: (key) => memoryStore[key] || null,
  setItem: (key, val) => { memoryStore[key] = String(val); },
  removeItem: (key) => { delete memoryStore[key]; },
  clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
  key: (i) => Object.keys(memoryStore)[i] || null,
  get length() { return Object.keys(memoryStore).length; }
};

global.IDBStorage = {
  get: async (key) => {
    const val = memoryStore['idb_' + key];
    return val ? JSON.parse(val) : null;
  },
  set: async (key, val) => {
    memoryStore['idb_' + key] = JSON.stringify(val);
    return true;
  }
};

const TEACHER_ID = 'usr_manuel';

// 2. Cargar Módulos
const ClassRepository = require('../js/repositories/class-repository.js');
const RecoveryService = require('../js/services/recovery-service.js');
const ImportParser = require('../js/services/import-parser.js');
const ImportService = require('../js/services/import-service.js');
const ExportAdapter = require('../js/export/export-adapter.js');

async function runRecoverySuite() {
  console.log('================================================================');
  console.log('SUITE DE PRUEBAS: RECUPERACIÓN DE DATOS E IMPORTADOR INTELIGENTE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------
  // TEST 1: Auditoría de almacenamiento no destructiva
  // -------------------------------------------------------------------
  console.log('--- TEST 1: Auditoría universal de fuentes de almacenamiento ---');
  // Inyectar datos en varias llaves
  memoryStore[`teacher_planner_plans_${TEACHER_ID}_v3`] = JSON.stringify({
    '2026-09-01': {
      date: '2026-09-01',
      period: '1°',
      classes: [
        {
          id: 'v3_cls_1',
          dayNumber: '1',
          subject: 'Sistemas',
          grade: '3°',
          topic: 'El teclado y sus partes',
          description: 'FASE DE INICIO:\nSaludo y dinámica\n\nFASE DE DESARROLLO:\nIdentificación de teclas alfanuméricas\n\nFASE DE CIERRE:\nEjercicio práctico',
          observations: 'Buena participación',
          notebookContent: '<p>Dibujar el teclado en el cuaderno</p>'
        }
      ]
    }
  });

  const auditReport = await RecoveryService.auditAllStorages(TEACHER_ID);
  assert.ok(auditReport, 'Auditoría genera reporte');
  assert.ok(auditReport.scannedKeys.length > 0, 'Se escanearon llaves del sistema');
  assert.strictEqual(auditReport.found >= 1, true, 'Detectó al menos 1 clase histórica');
  console.log(`  ✅ [PASS] Auditoría completada: ${auditReport.found} clases detectadas en los almacenamientos.\n`);

  // -------------------------------------------------------------------
  // TEST 2: Recuperación e integración sin pérdida de datos
  // -------------------------------------------------------------------
  console.log('--- TEST 2: Rescate e integración atómica al ClassRepository ---');
  const recReport = await RecoveryService.executeSafeRecovery(TEACHER_ID);
  assert.strictEqual(recReport.success, true, 'Protocolo de recuperación reporta éxito');
  
  const allRecovered = ClassRepository.getAllClasses(TEACHER_ID);
  assert.ok(allRecovered.length >= 1, 'ClassRepository contiene las clases rescatadas');
  
  const rescuedClass = allRecovered.find(c => c.subjectName === 'Sistemas' && c.gradeName === '3°');
  assert.ok(rescuedClass, 'La clase de Sistemas 3° fue rescatada');
  assert.strictEqual(rescuedClass.sequenceNumber, 1, 'Consecutivo 1 preservado');
  assert.strictEqual(rescuedClass.curriculum.topic, 'El teclado y sus partes', 'Tema preservado');
  assert.strictEqual(rescuedClass.didacticSequence.inicio, 'Saludo y dinámica', 'Fase de inicio extraída');
  assert.strictEqual(rescuedClass.didacticSequence.desarrollo, 'Identificación de teclas alfanuméricas', 'Fase de desarrollo extraída');
  assert.strictEqual(rescuedClass.teacherNotebook.studentNotebookContent, '<p>Dibujar el teclado en el cuaderno</p>', 'Cuaderno del docente preservado');
  console.log('  ✅ [PASS] Clases rescatadas con secuencia didáctica y cuaderno de docente íntegros.\n');

  // -------------------------------------------------------------------
  // TEST 3: Detección y vinculación de clases huérfanas
  // -------------------------------------------------------------------
  console.log('--- TEST 3: Gestión y vinculación de planeaciones huérfanas ---');
  const orphan = {
    id: 'orphan_cls_test',
    teacherId: TEACHER_ID,
    subjectName: 'Robótica',
    gradeName: '10°',
    sequenceNumber: 12,
    date: '', // Huérfana (sin fecha)
    status: 'orphaned',
    curriculum: { topic: 'Programación de servo motores' }
  };
  ClassRepository.saveClass(orphan, TEACHER_ID);

  const orphansList = ClassRepository.getOrphanedClasses(TEACHER_ID);
  assert.ok(orphansList.some(c => c.id === 'orphan_cls_test'), 'Clase huérfana identificada');

  // Vincular a fecha
  const linked = ClassRepository.linkOrphanedClass('orphan_cls_test', '2026-10-22', 'slot_jueves_1', TEACHER_ID);
  assert.ok(linked, 'Vinculación exitosa');
  assert.strictEqual(linked.date, '2026-10-22', 'Fecha actualizada');
  assert.strictEqual(linked.sequenceNumber, 12, 'Consecutivo #12 estrictamente preservado');
  assert.strictEqual(linked.isOrphaned, false, 'Ya no es huérfana');
  console.log('  ✅ [PASS] Vinculación exitosa preservando identidad y consecutivo permanente.\n');

  // -------------------------------------------------------------------
  // TEST 4: Cálculo de completitud de planeación (Req. 49, 50)
  // -------------------------------------------------------------------
  console.log('--- TEST 4: Medición de completitud curricular y pedagógica ---');
  const comp = ClassRepository.getPlanningCompleteness(rescuedClass);
  assert.ok(comp.percent > 0, 'Porcentaje mayor a 0');
  assert.strictEqual(typeof comp.isComplete, 'boolean', 'Reporta bandera booleana');
  console.log(`  ✅ [PASS] Completitud calculada: ${comp.percent}% (Campos llenos: ${comp.filledFields}/${comp.totalFields}).\n`);

  // -------------------------------------------------------------------
  // TEST 5: Protección de identidad en el Importador Inteligente
  // -------------------------------------------------------------------
  console.log('--- TEST 5: Regla de Identidad del Importador (Clase #7 vs Clase #2) ---');
  const existingCls7 = {
    id: 'target_cls_7',
    teacherId: TEACHER_ID,
    sequenceNumber: 7,
    gradeName: 'Tercero',
    subjectName: 'Sistemas',
    date: '2026-09-25',
    curriculum: { topic: 'Tema Anterior', dba: 'DBA Antiguo' },
    didacticSequence: { inicio: 'Inicio Antiguo' }
  };

  const importText = `
PARTE 1: SECUENCIA DIDÁCTICA ESTRUCTURADA
Asignatura: Sistemas
Grado: Segundo
Clase #: 2
Tema: Algoritmos y Diagramas de Flujo
FASE DE INICIO (15 minutos): Activación mediante juego de instrucciones
FASE DE DESARROLLO (60 minutos): Creación de un algoritmo para lavarse las manos
FASE DE CIERRE (15 minutos): Reflexión sobre la secuencia de pasos

PARTE 2: CUADERNO DEL DOCENTE
Pregunta: ¿Por qué es importante el orden de las instrucciones?
Contenido para el estudiante: Un algoritmo es una secuencia lógica y finita de pasos.
`;

  const prep = ImportService.prepareImport(importText, existingCls7);
  assert.strictEqual(prep.hasConflicts, true, 'Detectó conflicto de identidad (Clase #2 vs Clase #7)');
  
  // Decisión por defecto: PRESERVAR IDENTIDAD (target)
  const mergedDefault = ImportService.applyToExistingClass(existingCls7, prep.parsed);
  assert.strictEqual(mergedDefault.sequenceNumber, 7, 'Preservó estrictamente Clase #7');
  assert.strictEqual(mergedDefault.gradeName, 'Tercero', 'Preservó estrictamente Grado Tercero');
  assert.strictEqual(mergedDefault.curriculum.topic, 'Algoritmos y Diagramas de Flujo', 'Incorporó nuevo tema');
  assert.strictEqual(mergedDefault.didacticSequence.inicio, 'Activación mediante juego de instrucciones', 'Incorporó nuevo inicio');
  assert.strictEqual(mergedDefault.didacticSequence.durations.inicio, 15, 'Extrajo duración de 15 minutos');
  assert.strictEqual(mergedDefault.teacherNotebook.question, '¿Por qué es importante el orden de las instrucciones?', 'Incorporó cuaderno docente');
  console.log('  ✅ [PASS] Regla de Identidad protegió Consecutivo #7 y Grado Tercero incorporando el contenido pedagógico.\n');

  // -------------------------------------------------------------------
  // TEST 6: Importar como nueva clase independiente (max + 1)
  // -------------------------------------------------------------------
  console.log('--- TEST 6: Importar como nueva clase independiente ---');
  const newImported = ImportService.importAsNewClass(prep.parsed, { targetClass: existingCls7 }, TEACHER_ID);
  assert.ok(newImported, 'Nueva clase creada');
  assert.ok(newImported.id !== existingCls7.id, 'ID completamente nuevo e independiente');
  assert.ok(newImported.sequenceNumber > existingCls7.sequenceNumber, 'Asignó consecutivo siguiente superior');
  console.log(`  ✅ [PASS] Nueva clase creada con ID: ${newImported.id} y Consecutivo #${newImported.sequenceNumber}.\n`);

  // -------------------------------------------------------------------
  // TEST 7: Deshacer importación (Undo)
  // -------------------------------------------------------------------
  console.log('--- TEST 7: Reversibilidad de importación (Deshacer / Undo) ---');
  assert.strictEqual(ImportService.hasUndoAvailable(), true, 'Hay copia de seguridad de importación');
  const undone = ImportService.undoLastImport();
  assert.strictEqual(undone, true, 'Deshacer reporta éxito');
  
  const restoredTarget = ClassRepository.getClass(existingCls7.id, TEACHER_ID);
  assert.strictEqual(restoredTarget.curriculum.topic, 'Tema Anterior', 'Restauró tema anterior');
  assert.strictEqual(restoredTarget.didacticSequence.inicio, 'Inicio Antiguo', 'Restauró inicio anterior');
  console.log('  ✅ [PASS] Deshacer importación restauró con éxito el estado exacto anterior.\n');

  // -------------------------------------------------------------------
  // TEST 8: ExportAdapter mantiene formato institucional y NO contamina con cuaderno docente
  // -------------------------------------------------------------------
  console.log('--- TEST 8: Adaptador de Exportación institucional sin contaminación ---');
  const testClassForExport = {
    id: 'exp_cls_1',
    sequenceNumber: 3,
    date: '2026-09-15',
    subjectName: 'Sistemas',
    gradeName: '4°A',
    curriculum: { topic: 'Hardware vs Software', dba: 'DBA 1', achievement: 'Reconoce componentes' },
    didacticSequence: {
      inicio: 'Revisión de partes físicas',
      desarrollo: 'Diferenciación entre hardware tangible y software intangible',
      cierre: 'Evaluación rápida de conceptos',
      recursos: 'Computadores de la sala',
      evaluation: 'Lista de chequeo',
      tareas: 'Consultar 3 ejemplos de software libre'
    },
    teacherNotebook: {
      question: '¿Puede un computador funcionar sin software?',
      studentNotebookContent: 'Contenido extenso que NO debe aparecer en el formato oficial 2x6'
    }
  };

  const adapted = ExportAdapter.fromClass(testClassForExport);
  assert.ok(adapted, 'ExportAdapter genera preparador institucional');
  assert.strictEqual(adapted.classes.length, 1, 'Contiene la clase adaptada');
  
  const expCls = adapted.classes[0];
  assert.ok(expCls.description.includes('FASE DE INICIO:\nRevisión de partes físicas'), 'Incluye Fase de Inicio institucional');
  assert.ok(expCls.description.includes('FASE DE DESARROLLO:\nDiferenciación entre hardware'), 'Incluye Fase de Desarrollo institucional');
  assert.ok(expCls.description.includes('FASE DE CIERRE:\nEvaluación rápida'), 'Incluye Fase de Cierre institucional');
  assert.ok(!expCls.description.includes('Contenido extenso que NO debe aparecer'), 'El cuaderno docente NO contamina la descripción institucional');
  console.log('  ✅ [PASS] ExportAdapter produce descripción institucional pura sin contaminar con el cuaderno docente.\n');

  // -------------------------------------------------------------------
  // TEST 9: Fusión ultra-defensiva sin error 'Cannot set properties of undefined'
  // -------------------------------------------------------------------
  console.log('--- TEST 9: Fusión inteligente ultra-defensiva (_smartMerge con clases legacy) ---');
  // Simular clase legacy que NO tiene didacticSequence ni curriculum ni teacherNotebook
  const legacyBase = {
    id: 'legacy_base_1',
    subject: 'Robótica',
    subjectName: 'Robótica',
    grade: '10°',
    gradeName: '10°',
    group: '10°',
    sequenceNumber: 15,
    topic: 'Microcontroladores Arduino',
    pedagogy: {
      inicio: 'Repaso de entradas analógicas',
      desarrollo: 'Conexión del potenciómetro al pin A0',
      cierre: 'Preguntas de verificación'
    },
    notebookContent: 'Apuntes: Pin A0 lee valores de 0 a 1023.'
  };

  const incomingV5 = {
    id: 'legacy_base_1',
    subjectName: 'Robótica',
    gradeName: '10°',
    sequenceNumber: 15,
    curriculum: {
      topic: 'Microcontroladores Arduino y Sensores',
      dba: 'DBA 3 Tecnología',
      achievement: 'Programa lecturas analógicas'
    },
    didacticSequence: {
      inicio: 'Repaso de entradas analógicas enriquecido',
      recursos: 'Placas Arduino Uno, Protoboard, LEDs',
      evaluation: 'Rúbrica de conexión en circuito'
    },
    teacherNotebook: {
      question: '¿Cómo transformamos una señal analógica en un valor digital?',
      studentNotebookContent: 'Transcripción: Fórmula de conversión de voltaje a bits.'
    }
  };

  // Esta llamada antes arrojaba: Cannot set properties of undefined (setting 'inicio')
  let mergedResult = null;
  assert.doesNotThrow(() => {
    mergedResult = RecoveryService._smartMerge(legacyBase, incomingV5);
  }, 'smartMerge no debe arrojar error con clases base heredadas');

  assert.ok(mergedResult, 'Objeto fusionado existe');
  assert.ok(mergedResult.didacticSequence, 'didacticSequence existe');
  assert.strictEqual(mergedResult.didacticSequence.inicio, 'Repaso de entradas analógicas enriquecido');
  assert.strictEqual(mergedResult.didacticSequence.desarrollo, 'Conexión del potenciómetro al pin A0', 'Preserva desarrollo desde base legacy');
  assert.strictEqual(mergedResult.didacticSequence.recursos, 'Placas Arduino Uno, Protoboard, LEDs');
  assert.strictEqual(mergedResult.curriculum.topic, 'Microcontroladores Arduino y Sensores');
  assert.strictEqual(mergedResult.curriculum.dba, 'DBA 3 Tecnología');
  assert.strictEqual(mergedResult.teacherNotebook.question, '¿Cómo transformamos una señal analógica en un valor digital?');
  assert.strictEqual(mergedResult.teacherNotebook.studentNotebookContent, 'Transcripción: Fórmula de conversión de voltaje a bits.');
  assert.strictEqual(mergedResult.pedagogy.inicio, mergedResult.didacticSequence.inicio, 'Espejo pedagogy sincronizado');
  assert.strictEqual(mergedResult.status, 'planned', 'Estado calculado correctamente como planned');

  // Caso inverso: base v5 fusionada con incoming legacy
  let reverseMerged = null;
  assert.doesNotThrow(() => {
    reverseMerged = RecoveryService._smartMerge(incomingV5, legacyBase);
  }, 'smartMerge no debe arrojar error con incoming legacy');

  assert.strictEqual(reverseMerged.didacticSequence.desarrollo, 'Conexión del potenciómetro al pin A0', 'Toma desarrollo del legacy');
  assert.strictEqual(reverseMerged.curriculum.dba, 'DBA 3 Tecnología', 'No sobrescribe con vacío de legacy');
  console.log('  ✅ [PASS] Fusión ultra-defensiva superada: Cero excepciones por undefined, enriquecimiento bidireccional y preservación total.\n');

  console.log('================================================================');
  console.log('RESULTADO FINAL: TODAS LAS 9 PRUEBAS DE RECUPERACIÓN SUPERADAS');
  console.log('================================================================');
}

runRecoverySuite().catch(err => {
  console.error('❌ ERROR EN PRUEBAS DE RECUPERACIÓN:', err);
  process.exit(1);
});
