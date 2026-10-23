/**
 * TEST SUITE: AUDITORÍA Y PERSISTENCIA SEGURA (14 ESCENARIOS OBLIGATORIOS FASE 9)
 *
 * Escenarios probados:
 * 1. Crear una clase y recargar la aplicación.
 * 2. Importar un respaldo y comprobar que la restauración termina antes de informar éxito.
 * 3. Editar una fecha, guardar y recargar.
 * 4. Editar un consecutivo, guardar y recargar.
 * 5. Eliminar una clase y comprobar que las demás conservan sus fechas, IDs y números.
 * 6. Iniciar con datos personalizados y comprobar que los valores predeterminados no los reemplazan.
 * 7. Ejecutar dos veces una migración sin duplicar ni perder datos.
 * 8. Ejecutar el diagnóstico de recuperación sin modificar datos.
 * 9. Recuperar información sin resucitar clases eliminadas.
 * 10. Simular un fallo de almacenamiento y verificar que no se comunica un guardado exitoso falso.
 * 11. Simular una desconexión de Firestore y comprobar que la navegación y las ediciones locales siguen funcionando.
 * 12. Guardar contenido extenso del Cuaderno del Docente y comprobar su persistencia.
 * 13. Comprobar que dos clases diferentes con la misma fecha y materia no se fusionan incorrectamente.
 * 14. Verificar que una operación de guardado afecta solo a la clase seleccionada.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 ========================================================');
console.log('🧪 SUITE: AUDITORÍA Y PERSISTENCIA SEGURA (14 ESCENARIOS)');
console.log('🧪 ========================================================');

function createIsolatedEnvironment(initialLS = {}, initialIDB = {}) {
  const localStorageStore = Object.assign({}, initialLS);
  const sessionStorageStore = {};
  const idbStore = Object.assign({}, initialIDB);
  const listeners = {};

  const elements = {};
  function getOrCreateElement(id) {
    if (!elements[id]) {
      elements[id] = {
        id,
        innerHTML: '',
        innerText: '',
        textContent: '',
        style: { display: 'block' },
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        getAttribute: () => null,
        setAttribute: () => {},
        addEventListener: (event, handler) => {
          listeners[`${id}_${event}`] = listeners[`${id}_${event}`] || [];
          listeners[`${id}_${event}`].push(handler);
        }
      };
    }
    return elements[id];
  }

  const customContext = {
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {}
    },
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (t) => clearTimeout(t),
    setInterval: (fn, ms) => setInterval(fn, ms),
    clearInterval: (t) => clearInterval(t),
    queueMicrotask: (fn) => queueMicrotask(fn),
    Promise: Promise,
    Date: Date,
    JSON: JSON,
    Math: Math,
    RegExp: RegExp,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Set: Set,
    Map: Map,
    URLSearchParams: URLSearchParams,
    localStorage: {
      getItem: (k) => (Object.prototype.hasOwnProperty.call(localStorageStore, k) ? localStorageStore[k] : null),
      setItem: (k, v) => { localStorageStore[k] = String(v); },
      removeItem: (k) => { delete localStorageStore[k]; },
      clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; },
      get length() { return Object.keys(localStorageStore).length; },
      key: (i) => Object.keys(localStorageStore)[i]
    },
    sessionStorage: {
      getItem: (k) => (Object.prototype.hasOwnProperty.call(sessionStorageStore, k) ? sessionStorageStore[k] : null),
      setItem: (k, v) => { sessionStorageStore[k] = String(v); },
      removeItem: (k) => { delete sessionStorageStore[k]; },
      clear: () => { for (const k in sessionStorageStore) delete sessionStorageStore[k]; }
    },
    document: {
      readyState: 'complete',
      getElementById: (id) => getOrCreateElement(id),
      querySelectorAll: () => [],
      querySelector: () => null,
      createElement: (tag) => getOrCreateElement(tag),
      body: getOrCreateElement('body'),
      documentElement: getOrCreateElement('html'),
      addEventListener: (event, handler) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(handler);
      }
    },
    CustomEvent: class {
      constructor(type, detail) {
        this.type = type;
        this.detail = detail && detail.detail ? detail.detail : detail;
      }
    },
    IDBStorage: {
      isSupported: () => true,
      init: async () => true,
      get: async (k) => (Object.prototype.hasOwnProperty.call(idbStore, k) ? JSON.parse(JSON.stringify(idbStore[k])) : null),
      set: async (k, v) => { idbStore[k] = JSON.parse(JSON.stringify(v)); return true; },
      delete: async (k) => { delete idbStore[k]; return true; },
      keys: async () => Object.keys(idbStore)
    }
  };

  customContext.window = customContext;
  customContext.global = customContext;
  customContext.window.location = {
    protocol: 'file:',
    hostname: '',
    pathname: '/index.html',
    hash: '#dashboard'
  };
  customContext.window.addEventListener = (event, handler) => {
    listeners[event] = listeners[event] || [];
    listeners[event].push(handler);
  };
  customContext.window.dispatchEvent = (evt) => {
    const list = listeners[evt.type] || [];
    list.forEach(h => h(evt));
  };
  customContext.window.history = { replaceState: () => {}, pushState: () => {} };

  vm.createContext(customContext);

  const scripts = [
    'js/firebase-config.js',
    'js/storage.js',
    'js/holidays.js',
    'js/data/curriculum/matematicas.js',
    'js/data/curriculum/sistemas.js',
    'js/data/curriculum/robotica.js',
    'js/data/curriculum/logica.js',
    'js/data/curriculum/direccion_grupo.js',
    'js/data/curriculum-data.js',
    'js/data/initial-classes-data.js',
    'js/repositories/schedule-repository.js',
    'js/repositories/sequence-repository.js',
    'js/repositories/class-repository.js',
    'js/repositories/curriculum-repository.js',
    'js/core/app-state.js',
    'js/core/router.js',
    'js/core/pagination-engine.js',
    'js/users-service.js',
    'js/services/class-service.js',
    'js/services/sequence-service.js',
    'js/services/schedule-service.js',
    'js/services/recovery-service.js',
    'js/services/migration-manager.js',
    'js/services/backup-service.js',
    'js/services/import-parser.js',
    'js/services/import-service.js',
    'js/services/firestore-service.js',
    'js/plan-repository.js',
    'js/curriculum.js',
    'js/ui/curriculum-selector.js',
    'js/ui/import-modal.js',
    'js/ui/dashboard-view.js',
    'js/ui/class-editor-view.js',
    'js/ui/sequence-view.js',
    'js/ui/history-view.js',
    'js/ui/recovery-view.js',
    'js/notebook-editor.js',
    'js/coordinator-view.js',
    'js/ui/auth-modal.js',
    'js/calendar.js',
    'js/planner.js',
    'js/app.js'
  ];

  for (const s of scripts) {
    const full = path.join(__dirname, '..', s);
    const code = fs.readFileSync(full, 'utf8');
    vm.runInContext(code, customContext, { filename: s });
  }

  return { ctx: customContext, localStorageStore, idbStore };
}

(async () => {
  // -------------------------------------------------------------------------
  // ESCENARIO 1: Crear una clase y recargar la aplicación
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 1: Crear una clase y recargar la aplicación...');
  {
    const { ctx, localStorageStore, idbStore } = createIsolatedEnvironment();
    await ctx.App.init();

    const created = ctx.ClassRepository.createClass({
      date: '2026-11-04',
      subjectName: 'Sistemas',
      gradeName: '4°A',
      topic: 'Algoritmos y diagramas de flujo',
      sequenceNumber: 7
    }, 'usr_manuel');

    await ctx.ClassRepository.flushPersist('usr_manuel');

    assert.ok(created && created.id, 'La clase creada debe poseer un ID válido');
    assert.strictEqual(created.topic, 'Algoritmos y diagramas de flujo');

    // Simular recarga en un nuevo entorno utilizando el mismo almacenamiento persistente
    const envReload = createIsolatedEnvironment(localStorageStore, idbStore);
    await envReload.ctx.App.init();
    const retrieved = envReload.ctx.ClassRepository.getClass(created.id, 'usr_manuel');

    assert.ok(retrieved, 'La clase creada debe existir tras recargar la aplicación');
    assert.strictEqual(retrieved.topic, 'Algoritmos y diagramas de flujo');
    assert.strictEqual(retrieved.sequenceNumber, 7);
    console.log('   ✅ Escenario 1 Aprobado: Creación y persistencia verificada tras reload.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 2: Importar un respaldo y comprobar que la restauración termina antes de informar éxito
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 2: Importar un respaldo con confirmación de persistencia...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    const mockBackup = {
      version: '4.0',
      schemaVersion: 5,
      teacherId: 'usr_manuel',
      profile: { name: 'Manuel Muñoz' },
      classes: [
        {
          id: 'cls_backup_test_001',
          date: '2026-11-10',
          subjectName: 'Matemáticas',
          gradeName: '7°',
          sequenceNumber: 12,
          topic: 'Ecuaciones lineales de primer grado',
          didacticSequence: { inicio: 'Saludo', desarrollo: 'Ejercicios', cierre: 'Evaluación' },
          pedagogy: { inicio: 'Saludo', desarrollo: 'Ejercicios', cierre: 'Evaluación' }
        }
      ],
      plans: {}
    };

    const res = await ctx.BackupService.restoreBackup(JSON.stringify(mockBackup), 'usr_manuel');
    assert.strictEqual(res.success, true, 'restoreBackup debe retornar éxito tras persistir');

    // Comprobar que verifyPersistence confirma la presencia de la clase importada
    const verified = await ctx.ClassRepository.verifyPersistence('cls_backup_test_001', 'usr_manuel');
    assert.strictEqual(verified.isVerified, true, 'La clase restaurada debe estar confirmada en persistencia');
    console.log('   ✅ Escenario 2 Aprobado: Restauración completada y verificada antes de éxito.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 3: Editar una fecha, guardar y recargar
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 3: Editar una fecha, guardar y recargar...');
  {
    const { ctx, localStorageStore, idbStore } = createIsolatedEnvironment();
    await ctx.App.init();

    const cls = ctx.ClassRepository.createClass({
      date: '2026-11-03',
      subjectName: 'Robótica',
      gradeName: '10°',
      topic: 'Brazo articulado y servomotores',
      sequenceNumber: 5
    }, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    // Cambiar la fecha explícitamente a 2026-11-17 conservando el ID
    const origId = cls.id;
    cls.date = '2026-11-17';
    ctx.ClassRepository.saveClass(cls, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    // Verificar en recarga
    const envReload = createIsolatedEnvironment(localStorageStore, idbStore);
    await envReload.ctx.App.init();

    const reloaded = envReload.ctx.ClassRepository.getClass(origId, 'usr_manuel');
    assert.ok(reloaded, 'La clase debe existir con su ID original');
    assert.strictEqual(reloaded.id, origId, 'El ID de la clase debe permanecer inalterable');
    assert.strictEqual(reloaded.date, '2026-11-17', 'La nueva fecha debe persistir tras recargar');
    console.log('   ✅ Escenario 3 Aprobado: Edición explícita de fecha conservando ID e integridad.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 4: Editar un consecutivo, guardar y recargar
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 4: Editar un consecutivo, guardar y recargar...');
  {
    const { ctx, localStorageStore, idbStore } = createIsolatedEnvironment();
    await ctx.App.init();

    const cls = ctx.ClassRepository.createClass({
      date: '2026-11-05',
      subjectName: 'Lógica',
      gradeName: '6°',
      topic: 'Tablas de verdad y condicionales',
      sequenceNumber: 2
    }, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    // Modificar consecutivo explícitamente a 9 con manualSequence
    cls.sequenceNumber = 9;
    cls.dayNumber = '9';
    cls.manualSequence = true;
    ctx.ClassRepository.saveClass(cls, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    // Recargar y verificar
    const envReload = createIsolatedEnvironment(localStorageStore, idbStore);
    await envReload.ctx.App.init();

    const reloaded = envReload.ctx.ClassRepository.getClass(cls.id, 'usr_manuel');
    assert.strictEqual(reloaded.sequenceNumber, 9, 'El consecutivo modificado debe persistir');
    assert.strictEqual(reloaded.dayNumber, '9');
    console.log('   ✅ Escenario 4 Aprobado: Edición explícita de consecutivo preservada.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 5: Eliminar una clase y comprobar que las demás conservan sus fechas, IDs y números
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 5: Eliminar clase sin desplazar ni renumerar a las demás...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    const c1 = ctx.ClassRepository.createClass({ date: '2026-11-02', subjectName: 'Sistemas', gradeName: '3°', sequenceNumber: 1, topic: 'T1' }, 'usr_manuel');
    const c2 = ctx.ClassRepository.createClass({ date: '2026-11-09', subjectName: 'Sistemas', gradeName: '3°', sequenceNumber: 2, topic: 'T2' }, 'usr_manuel');
    const c3 = ctx.ClassRepository.createClass({ date: '2026-11-16', subjectName: 'Sistemas', gradeName: '3°', sequenceNumber: 3, topic: 'T3' }, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    // Eliminar c2
    ctx.ClassRepository.deleteClass(c2.id, 'usr_manuel', { date: c2.date });
    await ctx.ClassRepository.flushPersist('usr_manuel');

    assert.strictEqual(ctx.ClassRepository.getClass(c2.id, 'usr_manuel'), null, 'c2 debe haber sido eliminada');
    assert.strictEqual(ctx.ClassRepository.isDeletedClass(c2.id, 'usr_manuel'), true, 'c2 debe estar en tombstones');

    // Comprobar que c1 y c3 no sufrieron ninguna mutación en ID, fecha o consecutivo
    const c1After = ctx.ClassRepository.getClass(c1.id, 'usr_manuel');
    const c3After = ctx.ClassRepository.getClass(c3.id, 'usr_manuel');

    assert.ok(c1After, 'c1 debe permanecer intacta');
    assert.strictEqual(c1After.id, c1.id);
    assert.strictEqual(c1After.date, '2026-11-02');
    assert.strictEqual(c1After.sequenceNumber, 1);

    assert.ok(c3After, 'c3 debe permanecer intacta');
    assert.strictEqual(c3After.id, c3.id);
    assert.strictEqual(c3After.date, '2026-11-16');
    assert.strictEqual(c3After.sequenceNumber, 3, 'c3 NO debe renumerarse automáticamente a 2');
    console.log('   ✅ Escenario 5 Aprobado: Eliminación quirúrgica sin desplazamiento ni renumeración espuria.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 6: Iniciar con datos personalizados y comprobar que los valores predeterminados no los reemplazan
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 6: Iniciar con perfil personalizado sin sobrescritura destructiva...');
  {
    const { ctx, localStorageStore } = createIsolatedEnvironment();
    // Simular que el docente configuró un perfil personalizado
    const customProfile = {
      name: 'Docente Especializado',
      institution: 'Colegio Experimental San José',
      period: '2°',
      homeroom: '10°A',
      subjects: [{ name: 'Ajedrez', grades: ['4°', '5°'] }],
      weeklySchedule: { "1": [{ time: '8:00 - 9:00', subject: 'Ajedrez', grade: '4°' }] }
    };
    localStorageStore['teacher_planner_profile_v1'] = JSON.stringify(customProfile);

    // Arrancar sin la bandera para simular migración o primer arranque de v5
    delete localStorageStore['schedule_official_updated_v5'];

    await ctx.App.init();

    const profAfter = ctx.StorageService.getProfile();
    assert.strictEqual(profAfter.name, 'Docente Especializado', 'El nombre personalizado debe conservarse');
    assert.strictEqual(profAfter.institution, 'Colegio Experimental San José', 'La institución personalizada debe conservarse');
    assert.strictEqual(profAfter.period, '2°', 'El periodo personalizado debe conservarse');
    console.log('   ✅ Escenario 6 Aprobado: Valores predeterminados no sobrescriben datos personalizados.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 7: Ejecutar dos veces una migración sin duplicar ni perder datos
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 7: Ejecutar dos veces una migración (Idempotencia)...');
  {
    const { ctx, localStorageStore } = createIsolatedEnvironment();
    localStorageStore['teacher_planner_plans_usr_manuel_v3'] = JSON.stringify({
      '2026-11-20': {
        date: '2026-11-20',
        period: '1°',
        classes: [
          {
            id: 'cls_mig_test_1',
            date: '2026-11-20',
            subject: 'Sistemas',
            grade: '5°',
            consecutive: 4,
            description: 'Inicio: Introducción.\n\nDesarrollo: Práctica de hojas de cálculo.\n\nCierre: Reflexión.',
            topic: 'Fórmulas básicas en hojas de cálculo'
          }
        ]
      }
    });

    localStorageStore['planeaciones_data_schema_version'] = '4'; // Requiere migración a 5
    await ctx.App.init();

    const count1 = Object.keys(ctx.ClassRepository.getAllClasses('usr_manuel')).length;

    // Ejecutar migración por segunda vez
    const res2 = await ctx.MigrationManager.runMigration('usr_manuel');
    assert.strictEqual(res2.success, true);

    const count2 = Object.keys(ctx.ClassRepository.getAllClasses('usr_manuel')).length;
    assert.strictEqual(count1, count2, 'La cantidad de clases no debe variar al re-ejecutar la migración');
    console.log('   ✅ Escenario 7 Aprobado: Migración 100% idempotente sin duplicaciones.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 8: Ejecutar el diagnóstico de recuperación sin modificar datos
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 8: Diagnóstico de recuperación de solo lectura...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    const initialClassesJson = JSON.stringify(ctx.ClassRepository._getAllMap('usr_manuel'));

    // Ejecutar runAudit (auditoría / diagnóstico)
    const report = await ctx.RecoveryService.runAudit('usr_manuel');
    assert.ok(report, 'runAudit debe devolver reporte');
    assert.ok(typeof report.totalClasses === 'number');

    const afterClassesJson = JSON.stringify(ctx.ClassRepository._getAllMap('usr_manuel'));
    assert.strictEqual(initialClassesJson, afterClassesJson, 'runAudit no debe mutar el mapa de clases');
    console.log('   ✅ Escenario 8 Aprobado: runAudit es 100% de solo lectura y diagnóstico.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 9: Recuperar información sin resucitar clases eliminadas
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 9: Recuperación segura sin resucitar clases eliminadas...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    const toDelete = ctx.ClassRepository.createClass({
      date: '2026-11-12',
      subjectName: 'Sistemas',
      gradeName: '2°',
      topic: 'Clase que será eliminada conscientemente',
      sequenceNumber: 3
    }, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    // Eliminar conscientemente
    ctx.ClassRepository.deleteClass(toDelete.id, 'usr_manuel', { date: toDelete.date });
    await ctx.ClassRepository.flushPersist('usr_manuel');

    assert.strictEqual(ctx.ClassRepository.isDeletedClass(toDelete.id, 'usr_manuel'), true);

    // Ejecutar executeSafeRecovery
    await ctx.RecoveryService.executeSafeRecovery('usr_manuel');

    // Comprobar que toDelete no resucitó
    const checkDeleted = ctx.ClassRepository.getClass(toDelete.id, 'usr_manuel');
    assert.strictEqual(checkDeleted, null, 'Una clase con tombstone activo NUNCA debe ser resucitada');
    console.log('   ✅ Escenario 9 Aprobado: Blindaje anti-resurrección verificado.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 10: Simular fallo de almacenamiento y verificar que no se comunica guardado exitoso falso
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 10: Detección de fallo de persistencia...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    // Simular que tanto LocalStorage como IDBStorage fallan
    ctx.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    ctx.IDBStorage.set = async () => false;

    let threw = false;
    try {
      await ctx.ClassRepository.saveClassPersisted({
        id: 'cls_fail_test',
        date: '2026-11-24',
        subjectName: 'Matemáticas',
        gradeName: '3°',
        topic: 'Prueba de fallo'
      }, 'usr_manuel');
    } catch (e) {
      threw = true;
    }

    assert.strictEqual(threw, true, 'saveClassPersisted debe rechazar la promesa si la persistencia física falla');
    console.log('   ✅ Escenario 10 Aprobado: Fallo de persistencia reportado fielmente sin falso positivo.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 11: Simular desconexión de Firestore y comprobar navegación y edición offline
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 11: Firestore offline con navegación y edición intactas...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    // Desconectar / apagar Firestore
    ctx.FirestoreService.isInitialized = false;
    ctx.FirestoreService.db = null;
    ctx.FirestoreService.status = 'offline';

    // Navegar localmente entre vistas
    ctx.AppRouter.navigateTo('calendar');
    assert.strictEqual(ctx.AppRouter.currentView, 'calendar');

    ctx.AppRouter.navigateTo('sequences');
    assert.strictEqual(ctx.AppRouter.currentView, 'sequences');

    // Guardar una clase offline
    const offlineCls = ctx.ClassRepository.createClass({
      date: '2026-11-25',
      subjectName: 'Robótica',
      gradeName: '11°',
      topic: 'Programación de microcontroladores sin conexión',
      sequenceNumber: 6
    }, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    const readBack = ctx.ClassRepository.getClass(offlineCls.id, 'usr_manuel');
    assert.ok(readBack, 'La clase guardada offline debe persistir inmediatamente en local');
    console.log('   ✅ Escenario 11 Aprobado: Operación offline 100% disponible sin bloqueos de red.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 12: Guardar contenido extenso del Cuaderno del Docente y comprobar su persistencia
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 12: Persistencia de contenido extenso del Cuaderno del Docente...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    const bigHtml = '<div class="notebook-sheet">' + '<p>Párrafo pedagógico extenso con fórmulas y explicaciones detalladas.</p>'.repeat(500) + '</div>';

    const cls = ctx.ClassRepository.createClass({
      date: '2026-11-26',
      subjectName: 'Sistemas',
      gradeName: '6°',
      topic: 'Guía de trabajo integral',
      notebookContent: bigHtml,
      sequenceNumber: 8
    }, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    const verified = await ctx.ClassRepository.verifyPersistence(cls.id, 'usr_manuel');
    assert.strictEqual(verified.isVerified, true);

    const loaded = ctx.ClassRepository.getClass(cls.id, 'usr_manuel');
    assert.strictEqual(loaded.notebookContent.length, bigHtml.length, 'El contenido HTML extenso debe conservarse íntegro');
    console.log(`   ✅ Escenario 12 Aprobado: Cuaderno extenso (${bigHtml.length} bytes) persistido sin pérdida.`);
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 13: Comprobar que dos clases diferentes con la misma fecha y materia no se fusionan
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 13: Clases diferentes con misma fecha y materia no se fusionan...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    const classMorning = {
      id: 'cls_morning_math_7',
      date: '2026-11-27',
      time: '7:50 - 9:30',
      subjectName: 'Matemáticas',
      group: '7°',
      gradeName: '7°',
      sequenceNumber: 15,
      topic: 'Polinomios aritméticos con signos de agrupación'
    };

    const classAfternoon = {
      id: 'cls_afternoon_math_7',
      date: '2026-11-27',
      time: '11:50 - 12:35',
      subjectName: 'Matemáticas',
      group: '7°',
      gradeName: '7°',
      sequenceNumber: 16,
      topic: 'Taller de refuerzo y nivelación'
    };

    // Verificar que _isSameLogicalClass devuelve FALSE para dos clases con IDs distintos
    const isSame = ctx.RecoveryService._isSameLogicalClass(classMorning, classAfternoon);
    assert.strictEqual(isSame, false, '_isSameLogicalClass debe ser false para dos clases con IDs diferentes');

    ctx.ClassRepository.saveClass(classMorning, 'usr_manuel');
    ctx.ClassRepository.saveClass(classAfternoon, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    const m = ctx.ClassRepository.getClass('cls_morning_math_7', 'usr_manuel');
    const a = ctx.ClassRepository.getClass('cls_afternoon_math_7', 'usr_manuel');

    assert.ok(m && a, 'Ambas clases deben existir en el repositorio');
    assert.notStrictEqual(m.id, a.id);
    assert.strictEqual(m.topic, 'Polinomios aritméticos con signos de agrupación');
    assert.strictEqual(a.topic, 'Taller de refuerzo y nivelación');
    console.log('   ✅ Escenario 13 Aprobado: Clases en misma fecha y materia coexisten independientemente.');
  }

  // -------------------------------------------------------------------------
  // ESCENARIO 14: Verificar que una operación de guardado afecta solo a la clase seleccionada
  // -------------------------------------------------------------------------
  console.log('\n▶ ESCENARIO 14: Aislamiento atómico de guardado (afecta solo a la clase seleccionada)...');
  {
    const { ctx } = createIsolatedEnvironment();
    await ctx.App.init();

    const cTarget = ctx.ClassRepository.createClass({
      date: '2026-11-30',
      subjectName: 'Lógica',
      gradeName: '6°',
      topic: 'Tema original target',
      sequenceNumber: 3
    }, 'usr_manuel');

    const cNeighbor = ctx.ClassRepository.createClass({
      date: '2026-11-30',
      subjectName: 'Sistemas',
      gradeName: '8°',
      topic: 'Tema vecino intocado',
      sequenceNumber: 4
    }, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    // Mutar únicamente cTarget
    cTarget.topic = 'Tema target actualizado exitosamente';
    ctx.ClassRepository.saveClass(cTarget, 'usr_manuel');
    await ctx.ClassRepository.flushPersist('usr_manuel');

    const neighborRead = ctx.ClassRepository.getClass(cNeighbor.id, 'usr_manuel');
    assert.strictEqual(neighborRead.topic, 'Tema vecino intocado', 'El vecino no debe sufrir ninguna alteración');
    assert.strictEqual(neighborRead.sequenceNumber, 4);

    const targetRead = ctx.ClassRepository.getClass(cTarget.id, 'usr_manuel');
    assert.strictEqual(targetRead.topic, 'Tema target actualizado exitosamente');
    console.log('   ✅ Escenario 14 Aprobado: Guardado atómico estrictamente aislado.');
  }

  console.log('\n========================================================');
  console.log('🎉 LOS 14 ESCENARIOS DE PERSISTENCIA Y SEGURIDAD APROBADOS AL 100%');
  console.log('========================================================');
})();
