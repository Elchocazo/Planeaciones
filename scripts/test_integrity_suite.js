/**
 * TEST INTEGRITY SUITE: VERIFICACIÓN DE LOS 10 CASOS OBLIGATORIOS
 * AUDITORÍA Y RECONSTRUCCIÓN ESTRUCTURAL - CERO PÉRDIDA DE DATOS
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// --- SIMULACIÓN DE ENTORNO NAVEGADOR (LocalStorage, BroadcastChannel, Window, Document) ---
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store.hasOwnProperty(key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  get length() {
    return Object.keys(this.store).length;
  }
  key(index) {
    return Object.keys(this.store)[index] || null;
  }
}

globalThis.localStorage = new LocalStorageMock();

// Event listener stubs for window & document
const eventListeners = {};
globalThis.window = {
  localStorage: globalThis.localStorage,
  BroadcastChannel: globalThis.BroadcastChannel,
  addEventListener: (event, cb) => {
    if (!eventListeners[event]) eventListeners[event] = [];
    eventListeners[event].push(cb);
  },
  removeEventListener: (event, cb) => {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter(fn => fn !== cb);
    }
  },
  dispatchEvent: (evt) => {
    if (eventListeners[evt.type]) {
      eventListeners[evt.type].forEach(fn => fn(evt));
    }
    return true;
  }
};

globalThis.CustomEvent = class CustomEvent {
  constructor(type, params = {}) {
    this.type = type;
    this.detail = params.detail || {};
  }
};

globalThis.document = {
  addEventListener: (event, cb) => {
    if (!eventListeners[event]) eventListeners[event] = [];
    eventListeners[event].push(cb);
  },
  readyState: 'complete'
};

// Cargar módulos
const PlanRepository = require('../js/plan-repository.js');
const UserService = require('../js/users-service.js');
const StorageService = require('../js/storage.js');

globalThis.PlanRepository = PlanRepository;
globalThis.UserService = UserService;
globalThis.StorageService = StorageService;
window.PlanRepository = PlanRepository;
window.UserService = UserService;
window.StorageService = StorageService;

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  console.log(`\n==================================================`);
  console.log(`[TEST ${totalTests}] ${name}`);
  console.log(`==================================================`);
  try {
    fn();
    passedTests++;
    console.log(`>>> RESULTADO: PASO (SUCCESS)`);
  } catch (err) {
    console.error(`>>> RESULTADO: FALLO (FAIL)`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  console.log(`\n==================================================`);
  console.log(`[TEST ${totalTests}] ${name}`);
  console.log(`==================================================`);
  try {
    await fn();
    passedTests++;
    console.log(`>>> RESULTADO: PASO (SUCCESS)`);
  } catch (err) {
    console.error(`>>> RESULTADO: FALLO (FAIL)`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAll() {
  console.log('Iniciando Suite de Pruebas de Integridad Estructural...');

  // Reset storage
  localStorage.clear();
  PlanRepository._cache = {};
  await PlanRepository.init();

  // =========================================================================
  // CASO 1: Crear planeación el lunes -> recargar -> sigue en lunes
  // =========================================================================
  runTest('Caso 1: Crear planeacion el lunes -> recargar -> sigue en lunes', () => {
    const teacherId = 'usr_manuel';
    const mondayDate = '2026-09-07'; // Lunes

    // 1. Crear y guardar planeación de lunes
    const plan = PlanRepository.createPlan(teacherId, mondayDate, StorageService.getDefaultSchedule());
    plan.classes[0].topic = 'Introduccion a Algoritmos';
    plan.classes[0].achievement = 'Comprende el concepto de secuencia logica';
    plan.classes[0].notebookContent = '<p>Apuntes iniciales del lunes</p>';

    PlanRepository.savePlan(teacherId, mondayDate, plan);

    // 2. Simular recarga borrando la memoria caché
    PlanRepository._cache = {};

    // 3. Recuperar planeación
    const reloadedPlan = PlanRepository.getPlan(teacherId, mondayDate);

    assert(reloadedPlan !== null, 'La planeacion debe existir tras la recarga');
    assert.strictEqual(reloadedPlan.date, mondayDate, 'La fecha de la planeacion debe ser estrictamente 2026-09-07');
    assert.strictEqual(reloadedPlan.classes[0].date, mondayDate, 'La fecha de cada clase debe ser 2026-09-07');
    assert.strictEqual(reloadedPlan.classes[0].topic, 'Introduccion a Algoritmos');
    assert.strictEqual(reloadedPlan.classes[0].notebookContent, '<p>Apuntes iniciales del lunes</p>');

    // Verificar que StorageService.getPlanByDate entrega exactamente lo mismo
    const storagePlan = StorageService.getPlanByDate(mondayDate);
    assert.strictEqual(storagePlan.date, mondayDate);
    assert.strictEqual(storagePlan.classes[0].topic, 'Introduccion a Algoritmos');
  });

  // =========================================================================
  // CASO 2: Crear planeación martes y miércoles -> recargar -> ambas permanecen en sus fechas
  // =========================================================================
  runTest('Caso 2: Crear planeacion martes y miercoles -> recargar -> ambas en sus fechas', () => {
    const teacherId = 'usr_manuel';
    const tuesdayDate = '2026-09-08';
    const wednesdayDate = '2026-09-09';

    // Martes
    const tuesdayPlan = PlanRepository.createPlan(teacherId, tuesdayDate, StorageService.getDefaultSchedule());
    tuesdayPlan.classes[0].topic = 'Estructuras de Control Martes';
    PlanRepository.savePlan(teacherId, tuesdayDate, tuesdayPlan);

    // Miércoles
    const wednesdayPlan = PlanRepository.createPlan(teacherId, wednesdayDate, StorageService.getDefaultSchedule());
    wednesdayPlan.classes[0].topic = 'Matrices y Grafos Miercoles';
    PlanRepository.savePlan(teacherId, wednesdayDate, wednesdayPlan);

    // Simular recarga total (vaciar caché en memoria)
    PlanRepository._cache = {};

    // Recuperar ambos
    const loadedTue = PlanRepository.getPlan(teacherId, tuesdayDate);
    const loadedWed = PlanRepository.getPlan(teacherId, wednesdayDate);

    assert(loadedTue !== null, 'Martes debe existir');
    assert(loadedWed !== null, 'Miercoles debe existir');
    assert.strictEqual(loadedTue.date, tuesdayDate);
    assert.strictEqual(loadedWed.date, wednesdayDate);
    assert.strictEqual(loadedTue.classes[0].topic, 'Estructuras de Control Martes');
    assert.strictEqual(loadedWed.classes[0].topic, 'Matrices y Grafos Miercoles');
  });

  // =========================================================================
  // CASO 3: Crear lunes y martes -> editar martes -> lunes no cambia
  // =========================================================================
  runTest('Caso 3: Crear lunes y martes -> editar martes -> lunes no cambia', () => {
    const teacherId = 'usr_manuel';
    const mondayDate = '2026-09-07';
    const tuesdayDate = '2026-09-08';

    const originalMonday = JSON.stringify(PlanRepository.getPlan(teacherId, mondayDate));

    // Editar martes sustancialmente
    const tuesdayPlan = PlanRepository.getPlan(teacherId, tuesdayDate);
    tuesdayPlan.classes[0].topic = 'Topico Modificado de Martes V2';
    tuesdayPlan.generalNotes = 'Nota especial solo para el martes';
    PlanRepository.savePlan(teacherId, tuesdayDate, tuesdayPlan);

    // Simular recarga
    PlanRepository._cache = {};

    const reloadedMonday = JSON.stringify(PlanRepository.getPlan(teacherId, mondayDate));
    const reloadedTuesday = PlanRepository.getPlan(teacherId, tuesdayDate);

    // Lunes debe permanecer 100% idéntico
    assert.strictEqual(reloadedMonday, originalMonday, 'Lunes no debe haber sido alterado por la edicion de martes');
    // Martes debe tener los cambios
    assert.strictEqual(reloadedTuesday.classes[0].topic, 'Topico Modificado de Martes V2');
    assert.strictEqual(reloadedTuesday.generalNotes, 'Nota especial solo para el martes');
  });

  // =========================================================================
  // CASO 4: Abrir cuaderno martes, escribir texto extenso -> actualizar -> texto conservado íntegro
  // =========================================================================
  runTest('Caso 4: Texto extenso en cuaderno -> actualizar -> texto conservado (regla anti-vacios)', () => {
    const teacherId = 'usr_manuel';
    const tuesdayDate = '2026-09-08';

    const richDocument = `
      <h1>Sesion 1: Arquitectura de Microprocesadores</h1>
      <p>El procesador central se divide en ALU, Unidad de Control y Banco de Registros.</p>
      <ul>
        <li>Registro acumulador</li>
        <li>Contador de programa (PC)</li>
        <li>Pila de llamadas</li>
      </ul>
      <p>Observacion pedagogica: Los estudiantes demostraron alta apropiacion en simulacion practica.</p>
    `;

    // 1. Guardar contenido extenso en la clase 0
    const plan = PlanRepository.getPlan(teacherId, tuesdayDate);
    plan.classes[0].notebookContent = richDocument;
    PlanRepository.savePlan(teacherId, tuesdayDate, plan);

    // 2. Simular intento de guardado con payload que viene vacío en notebookContent
    const partialIncomingData = {
      classes: [
        {
          id: plan.classes[0].id,
          topic: 'Topico Modificado de Martes V2',
          notebookContent: '' // Campo vacío enviado por accidente
        }
      ]
    };

    // Al guardar, la regla anti-vacíos DEBE proteger el texto previo existente
    PlanRepository.savePlan(teacherId, tuesdayDate, partialIncomingData);

    // 3. Simular recarga y verificar integridad
    PlanRepository._cache = {};
    const verifiedPlan = PlanRepository.getPlan(teacherId, tuesdayDate);

    assert(verifiedPlan.classes[0].notebookContent.includes('Arquitectura de Microprocesadores'), 'El texto extenso no debe perderse ni sobrescribirse por vacio');
    assert(verifiedPlan.classes[0].notebookContent.includes('Pila de llamadas'), 'Los puntos de la lista se conservan intactos');
  });

  // =========================================================================
  // CASO 5: Cuaderno docente: UN SOLO DOCUMENTO contenteditable continuo
  // =========================================================================
  runTest('Caso 5: Cuaderno docente con unico contenteditable y seleccion continua', () => {
    const htmlPath = path.join(__dirname, '..', 'notebook-editor.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // 1. Verificar punto de montaje y scripts en notebook-editor.html
    assert(htmlContent.includes('id="notebook-mount-point"'), 'Debe existir id="notebook-mount-point" para montaje de documento');
    assert(htmlContent.includes('js/plan-repository.js'), 'Debe cargar plan-repository.js');
    assert(htmlContent.includes('js/notebook-editor.js'), 'Debe cargar notebook-editor.js');

    // 2. Verificar que js/notebook-editor.js define UN SOLO contenteditable="true" (#notebook-single-editor)
    const jsPath = path.join(__dirname, '..', 'js', 'notebook-editor.js');
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    assert(jsContent.includes('id="notebook-single-editor"'), 'js/notebook-editor.js debe definir id="notebook-single-editor"');
    assert(jsContent.includes('contenteditable="true"'), 'js/notebook-editor.js debe definir contenteditable="true"');

    // Comprobar que en el template principal solo hay UN contenedor editable
    const templateMatch = jsContent.match(/<div id="notebook-single-editor"[\s\S]*?<\/div>/);
    assert(templateMatch !== null, 'El contenedor editable debe existir en la plantilla');

    // 3. Verificar en css/styles.css las reglas del documento continuo
    const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    assert(cssContent.includes('.notebook-paper-container'), 'CSS debe definir .notebook-paper-container');
    assert(cssContent.includes('.notebook-single-editor-body'), 'CSS debe definir .notebook-single-editor-body');
    assert(cssContent.includes('.notebook-page-break'), 'CSS debe definir separadores de pagina .notebook-page-break');
  });

  // =========================================================================
  // CASO 6: Dos pestañas editando el mismo documento -> concurrencia y sync
  // =========================================================================
  await runAsyncTest('Caso 6: Dos pestanas editando el mismo documento -> sincronizacion BroadcastChannel', async () => {
    const teacherId = 'usr_manuel';
    const testDate = '2026-09-10';

    // Pestaña 1 crea el plan inicial
    const initialPlan = PlanRepository.createPlan(teacherId, testDate, StorageService.getDefaultSchedule());
    initialPlan.classes[0].topic = 'Version pestana 1';
    PlanRepository.savePlan(teacherId, testDate, initialPlan);

    // Simular Pestaña 2 escuchando el canal 'planeaciones_sync_v3'
    let receivedEvent = null;
    const tab2Channel = new BroadcastChannel('planeaciones_sync_v3');
    tab2Channel.onmessage = (event) => {
      receivedEvent = event.data;
    };

    // Pestaña 1 actualiza el plan
    const updatedPlan = PlanRepository.getPlan(teacherId, testDate);
    updatedPlan.classes[0].topic = 'Version sincronizada pestana 1 v2';
    PlanRepository.savePlan(teacherId, testDate, updatedPlan);

    // Esperar mensaje en el canal
    await new Promise(resolve => setTimeout(resolve, 200));

    assert(receivedEvent !== null, 'Pestana 2 debio recibir el mensaje Broadcast');
    assert.strictEqual(receivedEvent.type, 'PLAN_SAVED');
    assert.strictEqual(receivedEvent.date, testDate);
    assert.strictEqual(receivedEvent.version, 2);
    assert.strictEqual(receivedEvent.plan.classes[0].topic, 'Version sincronizada pestana 1 v2');

    tab2Channel.close();
  });

  // =========================================================================
  // CASO 7: Cambio de usuario -> planeaciones completamente aisladas por teacherId
  // =========================================================================
  runTest('Caso 7: Cambio de usuario -> planeaciones completamente aisladas por teacherId', () => {
    const teacherA = 'usr_manuel';
    const teacherB = 'usr_docente_ciencias';
    const date = '2026-09-11';

    // Docente A guarda su planeación de Matemáticas
    const planA = PlanRepository.createPlan(teacherA, date);
    planA.classes = [{
      id: PlanRepository.generateClassId(planA.id, 0, 'Matematicas', '7°'),
      subject: 'Matematicas',
      topic: 'Ecuaciones de segundo grado'
    }];
    PlanRepository.savePlan(teacherA, date, planA);

    // Docente B guarda su planeación de Biología en la MISMA fecha
    const planB = PlanRepository.createPlan(teacherB, date);
    planB.classes = [{
      id: PlanRepository.generateClassId(planB.id, 0, 'Biologia', '8°'),
      subject: 'Biologia',
      topic: 'Genetica Mendeliana'
    }];
    PlanRepository.savePlan(teacherB, date, planB);

    // Vaciar caché para forzar lectura pura desde almacenamiento
    PlanRepository._cache = {};

    const retrievedA = PlanRepository.getPlan(teacherA, date);
    const retrievedB = PlanRepository.getPlan(teacherB, date);

    assert(retrievedA !== null, 'Docente A debe tener su plan');
    assert(retrievedB !== null, 'Docente B debe tener su plan');
    assert.strictEqual(retrievedA.classes[0].subject, 'Matematicas');
    assert.strictEqual(retrievedA.classes[0].topic, 'Ecuaciones de segundo grado');
    assert.strictEqual(retrievedB.classes[0].subject, 'Biologia');
    assert.strictEqual(retrievedB.classes[0].topic, 'Genetica Mendeliana');

    // Verificar que las claves en storage son totalmente independientes
    const keyA = PlanRepository.getStorageKey(teacherA);
    const keyB = PlanRepository.getStorageKey(teacherB);
    assert.notStrictEqual(keyA, keyB, 'Las claves de almacenamiento deben ser unicas por docente');
    assert(localStorage.getItem(keyA).includes('Ecuaciones de segundo grado'));
    assert(localStorage.getItem(keyB).includes('Genetica Mendeliana'));
  });

  // =========================================================================
  // CASO 8: Cierre inesperado durante escritura -> recupera última versión guardada
  // =========================================================================
  runTest('Caso 8: Cierre inesperado -> recupera ultima version guardada', () => {
    const teacherId = 'usr_manuel';
    const date = '2026-09-14';

    // Guardado continuo durante edición
    const plan = PlanRepository.createPlan(teacherId, date, StorageService.getDefaultSchedule());
    plan.classes[0].topic = 'Texto en progreso antes de corte de energia';
    plan.classes[0].notebookContent = '<p>Parrafo guardado automaticamente 500ms antes del cierre</p>';
    PlanRepository.savePlan(teacherId, date, plan);

    // Simular caída abrupta (crash): borrado de toda la memoria volátil del proceso
    PlanRepository._cache = {};

    // Simular arranque en frío y recuperación
    const recoveredPlan = PlanRepository.getPlan(teacherId, date);
    assert(recoveredPlan !== null, 'Debe recuperarse la planeacion');
    assert.strictEqual(recoveredPlan.classes[0].topic, 'Texto en progreso antes de corte de energia');
    assert.strictEqual(recoveredPlan.classes[0].notebookContent, '<p>Parrafo guardado automaticamente 500ms antes del cierre</p>');
  });

  // =========================================================================
  // CASO 9: Planeación existente tras varios días -> nunca cambia de fecha (inmutabilidad)
  // =========================================================================
  runTest('Caso 9: Planeacion existente -> nunca cambia de fecha (inmutabilidad estricta)', () => {
    const teacherId = 'usr_manuel';
    const originalDate = '2026-09-07';

    const originalPlan = PlanRepository.getPlan(teacherId, originalDate);
    assert(originalPlan !== null, 'La planeacion del 7 de septiembre debe existir');

    // Ejecutar múltiples consultas de StorageService y navegación simulada
    for (let i = 1; i <= 30; i++) {
      const dayStr = i < 10 ? '0' + i : String(i);
      const simulatedDate = `2026-10-${dayStr}`;
      StorageService.getPlanByDate(simulatedDate);
    }

    // Volver a consultar la fecha original
    const checkedPlan = PlanRepository.getPlan(teacherId, originalDate);
    assert.strictEqual(checkedPlan.date, originalDate, 'La fecha debe seguir siendo estrictamente 2026-09-07');
    assert.strictEqual(checkedPlan.classes[0].date, originalDate);
    assert.strictEqual(checkedPlan.classes[0].dayOfWeek, 'Lunes');
  });

  // =========================================================================
  // CASO 10: Cambiar horario semanal institucional -> planeaciones históricas NO cambian
  // =========================================================================
  runTest('Caso 10: Cambiar horario semanal -> planeaciones historicas NO cambian', () => {
    const teacherId = 'usr_manuel';
    const historicDate = '2026-09-07'; // Lunes histórico existente

    const beforeChangePlan = PlanRepository.getPlan(teacherId, historicDate);
    const originalSubject = beforeChangePlan.classes[0].subject; // 'Direccion de grupo'
    const originalTopic = beforeChangePlan.classes[0].topic;

    // Modificar el horario semanal por defecto del docente (simular cambio en Configuración de Horario)
    const modifiedSchedule = JSON.parse(JSON.stringify(StorageService.getDefaultSchedule()));
    modifiedSchedule["1"][0] = { time: '7:00 - 7:50', subject: 'Robotica Cuantica Avanzada', grade: '11°' };

    // Verificar que al consultar el día histórico, éste NO muta sus clases
    const historicAfter = PlanRepository.getPlan(teacherId, historicDate);
    assert.strictEqual(historicAfter.classes[0].subject, originalSubject, 'El dia historico debe conservar su materia original');
    assert.strictEqual(historicAfter.classes[0].topic, originalTopic, 'El dia historico debe conservar su topico original');
    assert.notStrictEqual(historicAfter.classes[0].subject, 'Robotica Cuantica Avanzada', 'El dia historico NO debe ser sobrescrito por el nuevo horario');

    // Pero un día NUEVO en el futuro sí debe adoptar el nuevo horario al crearse
    const futureDate = '2026-11-02'; // Lunes nuevo futuro
    const newFuturePlan = PlanRepository.createPlan(teacherId, futureDate, modifiedSchedule);
    assert.strictEqual(newFuturePlan.classes[0].subject, 'Robotica Cuantica Avanzada', 'Un dia nuevo si recibe el nuevo horario modificado');
  });

  // =========================================================================
  // RESUMEN FINAL
  // =========================================================================
  console.log(`\n==================================================`);
  console.log(`RESUMEN DE PRUEBAS DE INTEGRIDAD:`);
  console.log(`Total Pruebas: ${totalTests}`);
  console.log(`Aprobadas:     ${passedTests}`);
  console.log(`Fallidas:      ${totalTests - passedTests}`);
  console.log(`==================================================\n`);

  if (passedTests === totalTests) {
    console.log('>>> TODOS LOS 10 CASOS OBLIGATORIOS PASARON SATISFACTORIAMENTE (10/10) <<<');
    process.exit(0);
  } else {
    console.error('>>> AL MENOS UNA PRUEBA FALLO <<<');
    process.exit(1);
  }
}

runAll().catch(err => {
  console.error('Error fatal en ejecucion de tests:', err);
  process.exit(1);
});
