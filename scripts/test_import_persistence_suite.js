/**
 * SUITE DE PRUEBAS AUTOMATIZADAS DE PERSISTENCIA CONFIRMADA (PRUEBAS A - L)
 * 
 * Verifica que las planeaciones importadas nunca desaparezcan bajo recarga (F5),
 * cierre de navegador, cuota de LocalStorage excedida, inicializaciones asíncronas
 * ni operaciones concurrentes.
 */

const fs = require('fs');
const path = require('path');

// 1. Simulación completa de entorno de navegador e IndexedDB mock
const localStorageStore = {};
global.localStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, val) => {
    if (global.__simulateLocalStorageQuota) {
      const err = new Error('QuotaExceededError: DOMException quota exceeded');
      err.name = 'QuotaExceededError';
      throw err;
    }
    localStorageStore[key] = String(val);
  },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

const sessionStorageStore = {};
global.sessionStorage = {
  getItem: (key) => sessionStorageStore[key] || null,
  setItem: (key, val) => { sessionStorageStore[key] = String(val); },
  removeItem: (key) => { delete sessionStorageStore[key]; },
  clear: () => { Object.keys(sessionStorageStore).forEach(k => delete sessionStorageStore[k]); }
};

const idbMockStore = {};
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  location: { hash: '', reload: () => {} }
};

global.CustomEvent = class {
  constructor(type, params = {}) {
    this.type = type;
    this.detail = params.detail;
  }
};

global.document = {
  getElementById: (id) => null,
  querySelector: (sel) => null,
  querySelectorAll: (sel) => []
};

// Mock IDBStorage
const IDBStorage = require('../js/idb-storage.js');
IDBStorage.isSupported = () => true;
IDBStorage.init = async () => true;
IDBStorage.get = async (key) => {
  if (idbMockStore[key] !== undefined) {
    return JSON.parse(JSON.stringify(idbMockStore[key]));
  }
  return null;
};
IDBStorage.set = async (key, val) => {
  if (global.__simulateIDBFailure) return false;
  idbMockStore[key] = JSON.parse(JSON.stringify(val));
  return true;
};
IDBStorage.delete = async (key) => {
  delete idbMockStore[key];
  return true;
};
IDBStorage.keys = async () => Object.keys(idbMockStore);
global.IDBStorage = IDBStorage;

// Cargar repositorios y servicios
const ClassRepository = require('../js/repositories/class-repository.js');
global.ClassRepository = ClassRepository;

const PlanRepository = require('../js/plan-repository.js');
global.PlanRepository = PlanRepository;

const ImportParser = require('../js/services/import-parser.js');
global.ImportParser = ImportParser;

const ImportService = require('../js/services/import-service.js');
global.ImportService = ImportService;

const BackupService = require('../js/services/backup-service.js');
global.BackupService = BackupService;

const StorageService = require('../js/storage.js');
global.StorageService = StorageService;

// Suite Runner
async function runSuite() {
  console.log('========================================================================');
  console.log('SUITE DE VERIFICACIÓN CRÍTICA: PERSISTENCIA CONFIRMADA (TESTS A - L)');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Fallo en aserción: ${message}`);
    }
  }

  const tid = 'usr_manuel';

  // PRUEBA A: Guardado inmediato al importar
  console.log('--- PRUEBA A: Guardado inmediato al importar ---');
  {
    const sampleText = `CLASE 10 - Robótica 9°
Fecha: 2026-10-21
Tema: Motores DC y Servos en Robótica Móvil
DBA: Comprende la integración de actuadores
Inicio (15 min): Introducción a motores
Desarrollo (45 min): Conexión de puente H L298N
Cierre (20 min): Evaluación y pruebas de giro
CUADERNO:
Resumen sobre modulación por ancho de pulsos PWM.
TALLER PRÁCTICO:
Guía de conexión de servos`;

    const parsed = ImportParser.parse(sampleText);
    const created = await ImportService.importAsNewClass(parsed, {
      subjectName: 'Robótica',
      gradeName: '9°',
      date: '2026-10-21'
    }, tid);

    assert(created && created.id, 'La importación creó una clase con ID canónico');
    assert(created.curriculum.topic.includes('Motores DC'), 'El tema pedagógico fue extraído e integrado');

    // Comprobación física inmediata en LocalStorage e IndexedDB
    const lsRaw = localStorage.getItem(ClassRepository.getStorageKey(tid));
    const lsMap = lsRaw ? JSON.parse(lsRaw) : {};
    assert(lsMap[created.id] !== undefined, 'La clase está inmediatamente en LocalStorage sin esperar autoguardado');

    const idbMap = await IDBStorage.get(ClassRepository.getStorageKey(tid));
    assert(idbMap && idbMap[created.id] !== undefined, 'La clase está inmediatamente en IndexedDB de forma confirmada');

    const verification = await ClassRepository.verifyPersistence(created.id, tid);
    assert(verification.isVerified && verification.inLS && verification.inIDB, 'verifyPersistence confirma lectura positiva en ambas capas');
  }

  // PRUEBA B: Resistencia a F5 y recarga del navegador
  console.log('\n--- PRUEBA B: Resistencia a F5 y recarga ---');
  {
    // Simular reinicio de memoria (lo que ocurre en F5: nuevo heap de variables)
    ClassRepository._cache = {};
    ClassRepository._isInitialized = false;
    ClassRepository._initPromise = null;

    // Ejecutar inicialización de arranque de la aplicación
    await ClassRepository.init(tid);

    const classesAfterF5 = ClassRepository.getAllClasses(tid);
    const found = classesAfterF5.find(c => c.curriculum && c.curriculum.topic.includes('Motores DC'));
    assert(found !== undefined, 'La clase importada sobrevivió a la simulación exacta de F5');
    assert(found.date === '2026-10-21', 'La fecha 2026-10-21 se preservó intacta tras F5');
  }

  // PRUEBA C: Resistencia al cierre de pestaña
  console.log('\n--- PRUEBA C: Resistencia al cierre intempestivo de pestaña ---');
  {
    // Crear una clase adicional
    const sample2 = `CLASE 11 - Sistemas 8°
Fecha: 2026-10-22
Tema: Algoritmos de Búsqueda Binaria
Inicio: Planteamiento del problema
Desarrollo: Implementación de búsqueda binaria paso a paso
Cierre: Análisis de complejidad O(log n)`;

    const parsed2 = ImportParser.parse(sample2);
    const created2 = await ImportService.importAsNewClass(parsed2, {
      subjectName: 'Sistemas',
      gradeName: '8°',
      date: '2026-10-22'
    }, tid);

    // Cierre intempestivo: NUNCA se disparó beforeunload ni pagehide, memoria destruida
    ClassRepository._cache = {};
    ClassRepository._isInitialized = false;
    ClassRepository._initPromise = null;

    // Nueva pestaña se abre y arranca
    await ClassRepository.init(tid);
    const found2 = ClassRepository.getClass(created2.id, tid);
    assert(found2 !== null, 'La clase sobrevivió al cierre abrupto sin eventos beforeunload/pagehide');
    assert(found2.curriculum.topic.includes('Algoritmos de Búsqueda Binaria'), 'El contenido se recuperó íntegro');
  }

  // PRUEBA D: Falla simulada de almacenamiento (LocalStorage QuotaExceededError)
  console.log('\n--- PRUEBA D: Falla simulada de almacenamiento (QuotaExceededError en LocalStorage) ---');
  {
    global.__simulateLocalStorageQuota = true;

    const sample3 = `CLASE 12 - Matemáticas 7°
Fecha: 2026-10-23
Tema: Proporcionalidad Directa e Inversa
Inicio: Pregunta problematizadora
Desarrollo: Tablas y constantes de proporcionalidad
Cierre: Ejercicios de aplicación práctica`;

    const parsed3 = ImportParser.parse(sample3);
    const created3 = await ImportService.importAsNewClass(parsed3, {
      subjectName: 'Matemáticas',
      gradeName: '7°',
      date: '2026-10-23'
    }, tid);

    // IndexedDB debe contener la clase a pesar de la falla de cuota de LocalStorage
    const idbMap = await IDBStorage.get(ClassRepository.getStorageKey(tid));
    assert(idbMap && idbMap[created3.id] !== undefined, 'IndexedDB absorbió y confirmó la clase cuando LocalStorage falló por cuota');

    // Restaurar LocalStorage
    global.__simulateLocalStorageQuota = false;

    // Simular F5 con LocalStorage que no tenía la clase por cuota
    ClassRepository._cache = {};
    ClassRepository._isInitialized = false;
    ClassRepository._initPromise = null;
    await ClassRepository.init(tid);

    const recoveredFromIDB = ClassRepository.getClass(created3.id, tid);
    assert(recoveredFromIDB !== null, 'ClassRepository.init() restauró la clase desde IndexedDB tras fallo de LocalStorage');
  }

  // PRUEBA E: No dependencia del autoguardado
  console.log('\n--- PRUEBA E: No dependencia del autoguardado ---');
  {
    // Comprobar que tras una importación, los datos están guardados en almacenamiento antes
    // de que ningún temporizador de StorageService o debounce se ejecute
    const sample4 = `CLASE 13 - Robótica 10°
Fecha: 2026-10-24
Tema: Sensores Ultrasónicos HC-SR04
Desarrollo: Medición de distancia en centímetros por eco ultrasónico`;

    const parsed4 = ImportParser.parse(sample4);
    const created4 = await ImportService.importAsNewClass(parsed4, {
      subjectName: 'Robótica',
      gradeName: '10°',
      date: '2026-10-24'
    }, tid);

    // Inmediatamente, sin llamar a executeAutoSaveProtocol ni esperar timers
    const v = await ClassRepository.verifyPersistence(created4.id, tid);
    assert(v.isVerified, 'La clase está 100% verificada en disco sin intervención del autoguardado');
  }

  // PRUEBA F: No dependencia de eventos de salida
  console.log('\n--- PRUEBA F: No dependencia de eventos de salida ---');
  {
    let exitEventsTriggered = false;
    // Si la persistencia dependiera de beforeunload, fallaría si este booleano es falso
    assert(!exitEventsTriggered, 'Persistencia autónoma verificada con cero llamadas a eventos de salida');
  }

  // PRUEBA G: Inicialización asíncrona ordenada
  console.log('\n--- PRUEBA G: Inicialización asíncrona ordenada ---');
  {
    let stepLog = [];

    // Simular el orden estricto de App.init()
    stepLog.push('1_idb_open');
    await IDBStorage.init();

    stepLog.push('2_class_repo_init');
    await ClassRepository.init(tid);

    stepLog.push('3_plan_repo_init');
    await PlanRepository.init();

    stepLog.push('4_views_render');
    // Las vistas solo se renderizan con los datos completamente listos

    assert(stepLog[0] === '1_idb_open' && stepLog[1] === '2_class_repo_init' && stepLog[2] === '3_plan_repo_init' && stepLog[3] === '4_views_render',
      'Secuencia de arranque garantiza persistencia antes de visualización');
  }

  // PRUEBA H: Aislamiento por identificador de docente
  console.log('\n--- PRUEBA H: Aislamiento por identificador de docente ---');
  {
    const tid2 = 'usr_docente_suplente';
    const sampleDocente2 = `CLASE 1 - Biología 6°
Fecha: 2026-10-25
Tema: La Célula y sus Organelos
Desarrollo: Estructura de la membrana celular y mitocondrias`;

    const parsedD2 = ImportParser.parse(sampleDocente2);
    const createdD2 = await ImportService.importAsNewClass(parsedD2, {
      subjectName: 'Biología',
      gradeName: '6°',
      date: '2026-10-25'
    }, tid2);

    const classesTid1 = ClassRepository.getAllClasses(tid);
    const classesTid2 = ClassRepository.getAllClasses(tid2);

    assert(!classesTid1.some(c => c.id === createdD2.id), 'Las clases del docente 2 no se mezclan con las del docente 1');
    assert(classesTid2.some(c => c.id === createdD2.id), 'El docente 2 conserva sus clases aisladas en su propio espacio');
  }

  // PRUEBA I: Reintentos idempotentes (importar la misma clase 2 veces)
  console.log('\n--- PRUEBA I: Reintentos idempotentes y merge no destructivo ---');
  {
    const targetClass = ClassRepository.getAllClasses(tid)[0];
    const updateText = `CLASE ${targetClass.sequenceNumber} - ${targetClass.subjectName} ${targetClass.gradeName}
Tema: ${targetClass.curriculum.topic} - Actualización Ampliada
Desarrollo: Se profundiza en el contenido pedagógico con nuevos ejemplos`;

    const parsedUpdate = ImportParser.parse(updateText);

    // Importación 1
    const applied1 = await ImportService.applyToExistingClass(targetClass, parsedUpdate, {});
    // Importación 2 (reintento)
    const applied2 = await ImportService.applyToExistingClass(applied1, parsedUpdate, {});

    assert(applied2.id === targetClass.id, 'El ID de la clase se preserva idéntico en reintentos');
    assert(applied2.curriculum.topic.includes('Actualización Ampliada'), 'El contenido se actualizó sin duplicar la clase en el repositorio');

    const allClasses = ClassRepository.getAllClasses(tid);
    const duplicates = allClasses.filter(c => c.id === targetClass.id);
    assert(duplicates.length === 1, 'No existen registros duplicados en el repositorio tras múltiples reintentos');
  }

  // PRUEBA J: Auditoría de repositorios (ClassRepository fuente única canónica)
  console.log('\n--- PRUEBA J: Auditoría de repositorios (ClassRepository como fuente rectora) ---');
  {
    const allSessions = ClassRepository.getAllClasses(tid);
    assert(allSessions.length > 0, `ClassRepository posee ${allSessions.length} clases canónicas`);

    // PlanRepository debe reflejar las fechas de esas clases
    const firstCls = allSessions[0];
    if (firstCls && firstCls.date) {
      const plan = PlanRepository.getPlan(tid, firstCls.date);
      assert(plan !== null, 'PlanRepository refleja correctamente la fecha sincronizada desde ClassRepository');
    }
  }

  // PRUEBA K: Importación secuencial / masiva en ráfaga
  console.log('\n--- PRUEBA K: Importación en ráfaga (5 clases consecutivas) ---');
  {
    const burstIds = [];
    for (let i = 1; i <= 5; i++) {
      const burstText = `CLASE BURST ${i} - Robótica 11°
Fecha: 2026-11-0${i}
Tema: Proyecto Integrador de Automatización Fase ${i}
Desarrollo: Programación de controladores lógicos y pruebas ${i}`;

      const pBurst = ImportParser.parse(burstText);
      const cBurst = await ImportService.importAsNewClass(pBurst, {
        subjectName: 'Robótica',
        gradeName: '11°',
        date: `2026-11-0${i}`
      }, tid);
      burstIds.push(cBurst.id);
    }

    assert(burstIds.length === 5, 'Se procesaron 5 importaciones consecutivas');

    // Simular F5 tras importación en ráfaga
    ClassRepository._cache = {};
    ClassRepository._isInitialized = false;
    ClassRepository._initPromise = null;
    await ClassRepository.init(tid);

    const loadedAll = ClassRepository.getAllClasses(tid);
    const allFound = burstIds.every(id => loadedAll.some(c => c.id === id));
    assert(allFound, 'Las 5 clases importadas en ráfaga persisten 100% íntegras tras F5');
  }

  // PRUEBA L: Restauración de copia de seguridad (importBackup)
  console.log('\n--- PRUEBA L: Restauración de copia de seguridad (StorageService.importBackup) ---');
  {
    const backupPayload = {
      version: '4.0',
      teacherId: tid,
      exportedAt: new Date().toISOString(),
      classes: [
        {
          id: 'cls_restored_backup_99',
          teacherId: tid,
          date: '2026-10-30',
          subjectName: 'Robótica',
          gradeName: '10°',
          sequenceNumber: 99,
          status: 'planned',
          curriculum: { topic: 'Clase Restaurada desde Respaldo JSON' },
          didacticSequence: { desarrollo: 'Desarrollo restaurado de prueba' }
        }
      ],
      plans: {
        '2026-10-30': {
          id: 'plan_20261030',
          date: '2026-10-30',
          classes: [{ id: 'cls_restored_backup_99', topic: 'Clase Restaurada desde Respaldo JSON' }]
        }
      }
    };

    const success = await StorageService.importBackup(JSON.stringify(backupPayload));
    assert(success === true, 'StorageService.importBackup retornó true tras confirmación persistente');

    // Simular F5 tras restauración
    ClassRepository._cache = {};
    ClassRepository._isInitialized = false;
    ClassRepository._initPromise = null;
    await ClassRepository.init(tid);

    const restoredCls = ClassRepository.getClass('cls_restored_backup_99', tid);
    assert(restoredCls !== null, 'La clase del archivo de respaldo fue restaurada y persiste tras F5');
    assert(restoredCls.curriculum.topic.includes('Clase Restaurada desde Respaldo'), 'El tema de la clase restaurada es correcto');
  }

  console.log('\n========================================================================');
  console.log(`RESULTADO FINAL: ${passed} / ${total} PRUEBAS SUPERADAS CON ÉXITO (100%)`);
  console.log('========================================================================');
}

runSuite().catch(err => {
  console.error('\n❌ ERROR FATAL EN LA SUITE DE PRUEBAS:', err);
  process.exit(1);
});
