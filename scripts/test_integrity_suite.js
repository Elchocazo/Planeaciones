/**
 * SUITE DE INTEGRIDAD ARQUITECTÓNICA Y CERO PÉRDIDA DE DATOS
 * Verifica rigurosamente los 12 requisitos mandatorios del sistema
 */

// Configuración de entorno Node.js para emular navegador
const memoryStore = {};
global.window = global;
global.window.scrollTo = function() {};

global.localStorage = {
  store: memoryStore,
  getItem(k) { return this.store[k] || null; },
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

// Cargar módulos del sistema
const UserService = require('../js/users-service.js');
global.UserService = UserService;

const PlanRepository = require('../js/plan-repository.js');
global.PlanRepository = PlanRepository;

const ExportService = require('../js/export.js');
global.ExportService = ExportService;

const StorageService = require('../js/storage.js');
global.StorageService = StorageService;

// Configurar perfil de prueba
const TEACHER_ID = 'usr_manuel';
UserService.setCurrentUser('usr_manuel');

StorageService.saveProfile({
  id: TEACHER_ID,
  name: 'Manuel Mosquera',
  period: '1°',
  homeroom: '7°',
  subjects: [{ name: 'Robótica', grades: ['8°', '9°'] }, { name: 'Matemáticas', grades: ['7°'] }],
  weeklySchedule: {
    "1": [{ subject: 'Robótica', grade: '9°', time: '07:00 - 08:00' }],
    "2": [{ subject: 'Matemáticas', grade: '7°', time: '08:00 - 09:00' }]
  }
});

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('================================================================');
console.log('INICIANDO SUITE DE INTEGRIDAD: CERO PÉRDIDA DE DATOS (12 PRUEBAS)');
console.log('================================================================\n');

try {
  // TEST 1: Aislamiento de fechas
  console.log('--- TEST 1: Aislamiento de fechas (14, 15, 16) ---');
  {
    PlanRepository.clearCache();
    const date14 = '2026-09-14';
    const date15 = '2026-09-15';
    const date16 = '2026-09-16';

    const plan14 = PlanRepository.createPlan(TEACHER_ID, date14, [
      { subject: 'Robótica', grade: '9°', topic: 'Tema Día 14', description: 'Secuencia 14', observations: 'Obs 14' }
    ]);
    const plan15 = PlanRepository.createPlan(TEACHER_ID, date15, [
      { subject: 'Robótica', grade: '9°', topic: 'Tema Día 15 Original', description: 'Secuencia 15', observations: 'Obs 15' }
    ]);
    const plan16 = PlanRepository.createPlan(TEACHER_ID, date16, [
      { subject: 'Robótica', grade: '9°', topic: 'Tema Día 16', description: 'Secuencia 16', observations: 'Obs 16' }
    ]);

    PlanRepository.savePlan(TEACHER_ID, date14, plan14);
    PlanRepository.savePlan(TEACHER_ID, date15, plan15);
    PlanRepository.savePlan(TEACHER_ID, date16, plan16);

    const snapshot14 = JSON.stringify(PlanRepository.getPlan(TEACHER_ID, date14));
    const snapshot16 = JSON.stringify(PlanRepository.getPlan(TEACHER_ID, date16));

    // Modificar el día 15
    const classId15 = plan15.classes[0].id;
    PlanRepository.saveClass(TEACHER_ID, date15, classId15, {
      topic: 'Tema Día 15 MODIFICADO',
      description: 'Secuencia 15 MODIFICADA'
    });

    const check14 = JSON.stringify(PlanRepository.getPlan(TEACHER_ID, date14));
    const check16 = JSON.stringify(PlanRepository.getPlan(TEACHER_ID, date16));
    const check15 = PlanRepository.getPlan(TEACHER_ID, date15);

    assert(snapshot14 === check14, 'El día 14 permanece 100% idéntico e inmutable tras modificar el día 15');
    assert(snapshot16 === check16, 'El día 16 permanece 100% idéntico e inmutable tras modificar el día 15');
    assert(check15.classes[0].topic === 'Tema Día 15 MODIFICADO', 'El día 15 se modificó correctamente');
  }

  // TEST 2: Aislamiento de clases
  console.log('\n--- TEST 2: Aislamiento de clases (3 clases, editar la 2da) ---');
  {
    const date = '2026-09-21';
    const plan = PlanRepository.createPlan(TEACHER_ID, date, [
      { subject: 'Robótica', grade: '8°', topic: 'Clase 1 Original', description: 'Sec 1', observations: 'Obs 1' },
      { subject: 'Robótica', grade: '9°', topic: 'Clase 2 Original', description: 'Sec 2', observations: 'Obs 2' },
      { subject: 'Matemáticas', grade: '7°', topic: 'Clase 3 Original', description: 'Sec 3', observations: 'Obs 3' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date, plan);

    const class1Before = JSON.stringify(PlanRepository.getPlan(TEACHER_ID, date).classes[0]);
    const class3Before = JSON.stringify(PlanRepository.getPlan(TEACHER_ID, date).classes[2]);

    const targetClassId = plan.classes[1].id;
    PlanRepository.saveClass(TEACHER_ID, date, targetClassId, {
      topic: 'Clase 2 MODIFICADA CON ÉXITO',
      description: 'Nueva secuencia didáctica clase 2'
    });

    const planAfter = PlanRepository.getPlan(TEACHER_ID, date);
    const class1After = JSON.stringify(planAfter.classes[0]);
    const class2After = planAfter.classes[1];
    const class3After = JSON.stringify(planAfter.classes[2]);

    assert(class1Before === class1After, 'Clase 1 permanece idéntica byte por byte');
    assert(class3Before === class3After, 'Clase 3 permanece idéntica byte por byte');
    assert(class2After.topic === 'Clase 2 MODIFICADA CON ÉXITO', 'Clase 2 se modificó de forma totalmente aislada');
  }

  // TEST 3: Cuaderno docente igualdad exacta
  console.log('\n--- TEST 3: Cuaderno docente igualdad exacta (HTML complejo, saltos de línea, tablas) ---');
  {
    const date = '2026-09-22';
    const notebookHtml = `<h2>Bitácora de Clase</h2><p>El estudiante demostró gran avance en programación.</p><table><tr><td>Criterio</td><td>Nota</td></tr><tr><td>Participación</td><td>5.0</td></tr></table><p>Próxima sesión: Sensores ultrasónicos.</p>`;

    const plan = PlanRepository.createPlan(TEACHER_ID, date, [
      { subject: 'Robótica', grade: '9°', topic: 'Robots Móviles' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date, plan);
    const classId = plan.classes[0].id;

    PlanRepository.saveClass(TEACHER_ID, date, classId, {
      notebookContent: notebookHtml
    });

    // Forzar recarga desde memoria
    PlanRepository.clearCache();
    const loadedPlan = PlanRepository.getPlan(TEACHER_ID, date);
    const loadedNotebook = loadedPlan.classes[0].notebookContent;

    assert(loadedNotebook === notebookHtml, 'El cuaderno docente mantiene igualdad estricta (===) sin recortes ni escapes');
  }

  // TEST 4: Comentarios / observaciones igualdad exacta
  console.log('\n--- TEST 4: Comentarios / observaciones igualdad exacta ---');
  {
    const date = '2026-09-23';
    const observationsText = `Observación detallada con caracteres especiales: ¡Éxito total! "Atención especial a Juan Pérez".\nSegunda línea con notas pedagógicas y acentos: árbol, comunicación, éxito.`;

    const plan = PlanRepository.createPlan(TEACHER_ID, date, [
      { subject: 'Robótica', grade: '9°', topic: 'Circuitos' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date, plan);
    const classId = plan.classes[0].id;

    PlanRepository.saveClass(TEACHER_ID, date, classId, {
      observations: observationsText
    });

    PlanRepository.clearCache();
    const loadedPlan = PlanRepository.getPlan(TEACHER_ID, date);
    const loadedObs = loadedPlan.classes[0].observations;

    assert(loadedObs === observationsText, 'Observaciones mantiene igualdad estricta (===)');
  }

  // TEST 5: Secuencia didáctica (description) igualdad exacta
  console.log('\n--- TEST 5: Secuencia didáctica (description) igualdad exacta ---');
  {
    const date = '2026-09-24';
    const sequenceText = `INICIO: Activación de presaberes sobre variables booleanas (15 min).\nDESARROLLO: Ejercicio práctico en simulador Tinkercad creando compuertas lógicas AND y OR (60 min).\nCIERRE: Evaluación formativa y conclusiones en el tablero institucional (15 min).`;

    const plan = PlanRepository.createPlan(TEACHER_ID, date, [
      { subject: 'Robótica', grade: '9°', topic: 'Compuertas Lógicas' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date, plan);
    const classId = plan.classes[0].id;

    PlanRepository.saveClass(TEACHER_ID, date, classId, {
      description: sequenceText
    });

    PlanRepository.clearCache();
    const loadedPlan = PlanRepository.getPlan(TEACHER_ID, date);
    const loadedDesc = loadedPlan.classes[0].description;

    assert(loadedDesc === sequenceText, 'Secuencia didáctica mantiene igualdad estricta (===)');
  }

  // TEST 6: Cambio de horario semanal no altera histórico
  console.log('\n--- TEST 6: Cambio de horario semanal no altera histórico ---');
  {
    const date = '2026-09-28'; // Un lunes
    const historicPlan = PlanRepository.createPlan(TEACHER_ID, date, [
      { subject: 'Robótica', grade: '9°', topic: 'Histórico Intacto', description: 'Secuencia guardada' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date, historicPlan);

    // Cambiar el horario semanal oficial en el perfil para el día lunes (1)
    const newWeeklySchedule = {
      "1": [{ subject: 'Ciencias Naturales', grade: '10°', time: '07:00 - 08:00' }]
    };
    StorageService.saveWeeklySchedule(newWeeklySchedule);

    // Leer el plan histórico de la fecha guardada
    const planAfterScheduleChange = StorageService.getPlanByDate(date);

    assert(planAfterScheduleChange.classes.length === 1, 'El día histórico mantiene su cantidad de clases');
    assert(planAfterScheduleChange.classes[0].subject === 'Robótica', 'La materia sigue siendo Robótica histórica');
    assert(planAfterScheduleChange.classes[0].grade === '9°', 'El grado sigue siendo 9° histórico');
    assert(planAfterScheduleChange.classes[0].topic === 'Histórico Intacto', 'El tema histórico no fue sobrescrito');
  }

  // TEST 7: Secuencia period|subject|grade independiente y acumulativa
  console.log('\n--- TEST 7: Secuencia period|subject|grade independiente y acumulativa ---');
  {
    const SEQ_TEACHER = 'usr_seq_test';
    PlanRepository.clearCache();
    // Robótica 9° día 1
    const seqRob1 = PlanRepository.calculateNextSequenceNumber(SEQ_TEACHER, '2026-10-01', '1°', 'Robótica', '9°');
    assert(seqRob1 === 1, 'Robótica 9° inicia en secuencia 1');

    const plan1 = PlanRepository.createPlan(SEQ_TEACHER, '2026-10-01', [
      { subject: 'Robótica', grade: '9°', dayNumber: String(seqRob1), sequenceNumber: seqRob1 }
    ]);
    PlanRepository.savePlan(SEQ_TEACHER, '2026-10-01', plan1);

    // Matemáticas 7° en el mismo día debe ser independiente
    const seqMat1 = PlanRepository.calculateNextSequenceNumber(SEQ_TEACHER, '2026-10-01', '1°', 'Matemáticas', '7°');
    assert(seqMat1 === 1, 'Matemáticas 7° inicia en secuencia 1 independiente');

    // Robótica 9° día 2 debe ser 2
    const seqRob2 = PlanRepository.calculateNextSequenceNumber(SEQ_TEACHER, '2026-10-02', '1°', 'Robótica', '9°');
    assert(seqRob2 === 2, 'Robótica 9° en día siguiente incrementa a 2');

    const plan2 = PlanRepository.createPlan(SEQ_TEACHER, '2026-10-02', [
      { subject: 'Robótica', grade: '9°', dayNumber: String(seqRob2), sequenceNumber: seqRob2 }
    ]);
    PlanRepository.savePlan(SEQ_TEACHER, '2026-10-02', plan2);

    // Robótica 9° día 3 debe ser 3
    const seqRob3 = PlanRepository.calculateNextSequenceNumber(SEQ_TEACHER, '2026-10-03', '1°', 'Robótica', '9°');
    assert(seqRob3 === 3, 'Robótica 9° en tercer día incrementa a 3');

    // Comprobar que Matemáticas 7° sigue en 1 porque no se ha guardado otra
    const seqMatCheck = PlanRepository.calculateNextSequenceNumber(SEQ_TEACHER, '2026-10-03', '1°', 'Matemáticas', '7°');
    assert(seqMatCheck === 1, 'Matemáticas 7° se mantuvo en 1 sin verse afectada por Robótica 9°');
  }

  // TEST 8: Recarga del navegador preserva todo
  console.log('\n--- TEST 8: Recarga del navegador (limpiar caché y recargar de storage) ---');
  {
    const date = '2026-10-05';
    const plan = PlanRepository.createPlan(TEACHER_ID, date, [
      { subject: 'Robótica', grade: '9°', topic: 'Persistencia Total', description: 'Secuencia guardada', notebookContent: '<b>Cuaderno</b>' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date, plan);

    // Simular reinicio de navegador borrando cachés en memoria
    PlanRepository.clearCache();

    const reloadedPlan = PlanRepository.getPlan(TEACHER_ID, date);
    assert(reloadedPlan !== null, 'El plan se recupera tras simular reinicio');
    assert(reloadedPlan.classes[0].topic === 'Persistencia Total', 'Tema intacto tras reinicio');
    assert(reloadedPlan.classes[0].notebookContent === '<b>Cuaderno</b>', 'Cuaderno intacto tras reinicio');
  }

  // TEST 9: Cambio de día preserva datos
  console.log('\n--- TEST 9: Cambio de día (Día A -> Día B -> Día A) ---');
  {
    const dateA = '2026-10-10';
    const dateB = '2026-10-11';

    const planA = PlanRepository.createPlan(TEACHER_ID, dateA, [
      { subject: 'Robótica', grade: '9°', topic: 'Día A Topic', description: 'Día A Desc' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, dateA, planA);

    const planB = PlanRepository.createPlan(TEACHER_ID, dateB, [
      { subject: 'Matemáticas', grade: '7°', topic: 'Día B Topic', description: 'Día B Desc' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, dateB, planB);

    // Cargar B, luego volver a A
    const loadedB = PlanRepository.getPlan(TEACHER_ID, dateB);
    const loadedA = PlanRepository.getPlan(TEACHER_ID, dateA);

    assert(loadedA.classes[0].topic === 'Día A Topic', 'Día A preserva sus datos tras navegar a Día B');
    assert(loadedB.classes[0].topic === 'Día B Topic', 'Día B preserva sus datos tras navegar a Día A');
  }

  // TEST 10: Dos pestañas detectan conflicto
  console.log('\n--- TEST 10: Dos pestañas detectan conflicto y protegen datos ---');
  {
    const date = '2026-10-15';
    const plan = PlanRepository.createPlan(TEACHER_ID, date, [
      { subject: 'Robótica', grade: '9°', topic: 'Base Version 1', description: 'Secuencia V1' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date, plan);
    const classId = plan.classes[0].id;

    // Pestaña 1 actualiza a versión 2
    PlanRepository.saveClass(TEACHER_ID, date, classId, {
      topic: 'Actualizado por Pestaña 1',
      description: 'Secuencia enriquecida Pestaña 1'
    });

    // Pestaña 2 intenta sobrescribir con versión antigua (v: 1)
    const resultConflict = PlanRepository.saveClass(TEACHER_ID, date, classId, {
      topic: 'Intento de sobrescritura Pestaña 2',
      version: 1 // Versión desactualizada
    });

    // El repositorio debe resolver protegiendo el trabajo valioso y guardando snapshot
    const finalPlan = PlanRepository.getPlan(TEACHER_ID, date);
    const finalClass = finalPlan.classes[0];

    assert(Boolean(finalClass.description), 'El contenido valioso previo (description) no fue borrado por la colisión');
    assert(finalClass.version >= 2, 'El versionado incrementó correctamente tras la resolución');
  }

  // TEST 11: No sobrescribir con vacío (Regla anti-vacíos)
  console.log('\n--- TEST 11: Regla anti-vacíos (evitar sobrescrituras por campos vacíos) ---');
  {
    const date = '2026-10-20';
    const plan = PlanRepository.createPlan(TEACHER_ID, date, [
      {
        subject: 'Robótica',
        grade: '9°',
        topic: 'Tema Valioso',
        description: 'Secuencia Didáctica Muy Importante',
        observations: 'Observaciones Críticas',
        notebookContent: '<p>Cuaderno Valioso</p>'
      }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date, plan);
    const classId = plan.classes[0].id;

    // Enviar actualización con campos prioritarios en blanco
    PlanRepository.saveClass(TEACHER_ID, date, classId, {
      topic: 'Nuevo Tema Actualizado',
      description: '',
      observations: '',
      notebookContent: ''
    });

    const checkPlan = PlanRepository.getPlan(TEACHER_ID, date);
    const checkClass = checkPlan.classes[0];

    assert(checkClass.topic === 'Nuevo Tema Actualizado', 'El tema se actualizó correctamente');
    assert(checkClass.description === 'Secuencia Didáctica Muy Importante', 'description fue protegido contra sobrescritura en blanco');
    assert(checkClass.observations === 'Observaciones Críticas', 'observations fue protegido contra sobrescritura en blanco');
    assert(checkClass.notebookContent === '<p>Cuaderno Valioso</p>', 'notebookContent fue protegido contra sobrescritura en blanco');
  }

  // TEST 12: Eliminar clase con snapshot sin afectar otras clases ni fechas
  console.log('\n--- TEST 12: Eliminar clase con snapshot de seguridad ---');
  {
    const date1 = '2026-10-25';
    const date2 = '2026-10-26';

    const plan1 = PlanRepository.createPlan(TEACHER_ID, date1, [
      { subject: 'Robótica', grade: '9°', topic: 'Clase A1' },
      { subject: 'Robótica', grade: '8°', topic: 'Clase A2 (Para Eliminar)' },
      { subject: 'Matemáticas', grade: '7°', topic: 'Clase A3' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date1, plan1);

    const plan2 = PlanRepository.createPlan(TEACHER_ID, date2, [
      { subject: 'Robótica', grade: '9°', topic: 'Clase B1 Otra Fecha' }
    ]);
    PlanRepository.savePlan(TEACHER_ID, date2, plan2);

    const classToDeleteId = plan1.classes[1].id;
    const plan2SnapshotBefore = JSON.stringify(PlanRepository.getPlan(TEACHER_ID, date2));

    // Eliminar la clase 2 de la fecha 1
    const deleteSuccess = PlanRepository.deleteClass(TEACHER_ID, date1, classToDeleteId);

    assert(deleteSuccess === true, 'deleteClass reportó éxito');

    const plan1After = PlanRepository.getPlan(TEACHER_ID, date1);
    const plan2After = JSON.stringify(PlanRepository.getPlan(TEACHER_ID, date2));

    assert(plan1After.classes.length === 2, 'El día 1 ahora tiene 2 clases');
    assert(plan1After.classes[0].topic === 'Clase A1', 'Clase 1 del día 1 permanece intacta');
    assert(plan1After.classes[1].topic === 'Clase A3', 'Clase 3 del día 1 permanece intacta');
    assert(plan2SnapshotBefore === plan2After, 'El día 2 permanece 100% idéntico e inmutable');

    // Verificar que existe snapshot de respaldo de la clase eliminada
    const snapshots = PlanRepository.getSnapshots(TEACHER_ID);
    const hasDeleteSnapshot = Object.keys(snapshots).some(k => k.includes(`delete_class_${date1}_${classToDeleteId}`));
    assert(hasDeleteSnapshot === true, 'Se creó correctamente el snapshot de respaldo antes de eliminar');
  }

  console.log('\n================================================================');
  console.log(`RESULTADO FINAL: ${passedTests}/${totalTests} PRUEBAS SUPERADAS EXITOSAMENTE (100%)`);
  console.log('================================================================\n');

} catch (err) {
  console.error('\n❌ ERROR EN LA SUITE DE PRUEBAS:', err);
  process.exit(1);
}
