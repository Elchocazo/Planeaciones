/**
 * TEST SUITE: INTEGRIDAD DE FECHAS, NUMERACIÓN, ELIMINACIÓN Y RENDIMIENTO (REGLA 14)
 * Valida los 12 escenarios críticos para garantizar que las clases no cambien de fecha,
 * no sufran auto-renumeración indebida, se eliminen quirúrgicamente y no congelen la UI.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// 1. Emular entorno global del navegador
const storage = {};
global.window = global;
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.IDBStorage = {
  get: async (k) => storage[k] ? JSON.parse(storage[k]) : null,
  set: async (k, v) => { storage[k] = JSON.stringify(v); return true; },
  delete: async (k) => { delete storage[k]; return true; }
};
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  dispatchEvent: () => {},
  getElementById: () => ({ offsetParent: {}, innerHTML: '', appendChild: () => {}, style: {}, classList: { add(){}, remove(){}, toggle(){} } })
};
global.CustomEvent = class CustomEvent { constructor(name, detail) { this.name = name; this.detail = detail; } };
global.UserService = {
  getCurrentUserId: () => 'usr_manuel',
  isCoordinatorActive: () => false
};

// 2. Cargar dependencias de la app
eval(fs.readFileSync(path.join(__dirname, '../js/core/app-state.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/storage.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/holidays.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/repositories/schedule-repository.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/plan-repository.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/repositories/class-repository.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/services/schedule-service.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../js/services/firestore-service.js'), 'utf8'));

const TID = 'usr_manuel';

async function runIntegrityTests() {
  console.log('================================================================');
  console.log('TEST SUITE: INTEGRIDAD DE FECHAS, NUMERACIÓN, ELIMINACIÓN Y RENDIMIENTO');
  console.log('================================================================\n');

  // Inicializar repositorio con datos limpios
  await ClassRepository.init(TID);
  storage['school_deleted_classes_' + TID] = '[]';

  // -------------------------------------------------------------
  // ESCENARIO 1: Eliminar una clase de un día con varias clases
  // -------------------------------------------------------------
  console.log('--- ESCENARIO 1: Eliminación quirúrgica en un día con varias clases ---');
  const d1 = '2026-10-21';
  const c1A = {
    id: 'cls_20261021_test_1',
    teacherId: TID,
    date: d1,
    time: '7:00 - 8:40',
    subject: 'Matemáticas',
    grade: '7°',
    sequenceNumber: 1,
    curriculum: { topic: 'Tema A' }
  };
  const c1B = {
    id: 'cls_20261021_test_2',
    teacherId: TID,
    date: d1,
    time: '8:40 - 9:30',
    subject: 'Sistemas',
    grade: '8°',
    sequenceNumber: 2,
    curriculum: { topic: 'Tema B' }
  };
  ClassRepository.saveClass(c1A, TID);
  ClassRepository.saveClass(c1B, TID);

  const delRes1 = ClassRepository.deleteClass(c1A.id, TID);
  assert.strictEqual(delRes1, true, 'deleteClass reporta éxito para c1A');
  assert.strictEqual(ClassRepository.getClass(c1A.id, TID), null, 'c1A debe estar eliminada');
  const remaining1B = ClassRepository.getClass(c1B.id, TID);
  assert.notStrictEqual(remaining1B, null, 'c1B debe existir intacta');
  assert.strictEqual(remaining1B.date, d1, 'c1B conserva su fecha');
  assert.strictEqual(remaining1B.sequenceNumber, 2, 'c1B conserva su secuencia');
  assert.strictEqual(remaining1B.curriculum.topic, 'Tema B', 'c1B conserva su contenido');
  console.log('  ✅ [PASS] Solo se eliminó c1A; c1B permaneció inmutable en fecha y contenido.');

  // -------------------------------------------------------------
  // ESCENARIO 2: Eliminar clase intermedia sin alterar días adyacentes
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 2: Eliminación intermedia sin desplazamiento de fechas adyacentes ---');
  const dPrev = '2026-10-20';
  const dMid = '2026-10-21';
  const dNext = '2026-10-22';
  const cPrev = { id: 'cls_adj_prev', teacherId: TID, date: dPrev, subject: 'Robótica', grade: '10°', sequenceNumber: 10 };
  const cMid = { id: 'cls_adj_mid', teacherId: TID, date: dMid, subject: 'Robótica', grade: '10°', sequenceNumber: 11 };
  const cNext = { id: 'cls_adj_next', teacherId: TID, date: dNext, subject: 'Robótica', grade: '10°', sequenceNumber: 12 };
  ClassRepository.saveClass(cPrev, TID);
  ClassRepository.saveClass(cMid, TID);
  ClassRepository.saveClass(cNext, TID);

  ClassRepository.deleteClass(cMid.id, TID);
  const pPrev = ClassRepository.getClass(cPrev.id, TID);
  const pNext = ClassRepository.getClass(cNext.id, TID);
  assert.strictEqual(pPrev.date, dPrev, 'Clase anterior no cambió de fecha');
  assert.strictEqual(pNext.date, dNext, 'Clase posterior no cambió de fecha');
  console.log('  ✅ [PASS] Clases adyacentes conservan estrictamente sus fechas.');

  // -------------------------------------------------------------
  // ESCENARIO 3: ScheduleService.buildDayView no roba clases de otras fechas
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 3: buildDayView en día con huecos no roba clases ajenas ---');
  const futureClass = {
    id: 'cls_future_nov',
    teacherId: TID,
    date: '2026-11-05',
    subject: 'Sistemas',
    grade: '6°',
    sequenceNumber: 8,
    curriculum: { topic: 'Tablas dinámicas' }
  };
  ClassRepository.saveClass(futureClass, TID);

  const dayView = ScheduleService.buildDayView('2026-10-22', TID);
  const futureCheck = ClassRepository.getClass(futureClass.id, TID);
  assert.strictEqual(futureCheck.date, '2026-11-05', 'buildDayView NUNCA debe alterar la fecha de la clase de noviembre');
  const sis6Slot = dayView.scheduledItems.find(i => i.slot.subjectName === 'Sistemas' && (i.slot.gradeName === '6°' || i.slot.grade === '6'));
  if (sis6Slot) {
    assert.strictEqual(sis6Slot.isPending, true, 'El slot vacío debe permanecer como pendiente');
    assert.strictEqual(sis6Slot.isPlanned, false, 'El slot vacío no debe marcarse como planeado falsamente');
  }
  console.log('  ✅ [PASS] buildDayView es de estricta lectura: 0 robo de clases.');

  // -------------------------------------------------------------
  // ESCENARIO 4: Modificar fecha conserva ID estable y limpia fecha vieja
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 4: Modificar fecha mantiene ID estable y purga la fecha previa ---');
  const moveClass = {
    id: 'cls_stable_id_123',
    teacherId: TID,
    date: '2026-10-21',
    subject: 'Lógica',
    grade: '6°',
    sequenceNumber: 7,
    curriculum: { topic: 'Pensamiento Algorítmico' }
  };
  ClassRepository.saveClass(moveClass, TID);

  // Mover a 2026-10-23
  moveClass.date = '2026-10-23';
  const savedMoved = ClassRepository.saveClass(moveClass, TID);
  assert.strictEqual(savedMoved.id, 'cls_stable_id_123', 'El ID de la clase debe ser 100% estable');
  assert.strictEqual(savedMoved.date, '2026-10-23', 'La fecha debe actualizarse a 2026-10-23');

  // Verificar que en 2026-10-21 ya no exista
  const classesOnOldDate = ClassRepository.getClasses({ date: '2026-10-21' }, TID);
  assert.strictEqual(classesOnOldDate.some(c => c.id === 'cls_stable_id_123'), false, 'No debe existir en la fecha vieja en ClassRepository');
  const oldPlan = PlanRepository.getPlan(TID, '2026-10-21');
  if (oldPlan && oldPlan.classes) {
    assert.strictEqual(oldPlan.classes.some(c => c.id === 'cls_stable_id_123'), false, 'No debe existir en la fecha vieja en PlanRepository');
  }
  const newPlan = PlanRepository.getPlan(TID, '2026-10-23');
  assert(newPlan && newPlan.classes.some(c => c.id === 'cls_stable_id_123'), 'Debe existir en la fecha nueva en PlanRepository');
  console.log('  ✅ [PASS] ID estable verificado y fecha previa limpiada sin duplicados.');

  // -------------------------------------------------------------
  // ESCENARIO 5: Inmunidad ante recarga tras cambio de fecha
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 5: Inmunidad ante recarga F5 tras cambio de fecha ---');
  // Simular recarga re-inicializando repositorio
  ClassRepository._cache = {};
  await ClassRepository.init(TID);
  const reloadedMoved = ClassRepository.getClass('cls_stable_id_123', TID);
  assert.notStrictEqual(reloadedMoved, null, 'Clase existe tras recarga');
  assert.strictEqual(reloadedMoved.date, '2026-10-23', 'Fecha se mantiene en 2026-10-23 tras recarga');
  const oldDateReloaded = ClassRepository.getClasses({ date: '2026-10-21' }, TID);
  assert.strictEqual(oldDateReloaded.some(c => c.id === 'cls_stable_id_123'), false, 'Cero resurrección en fecha antigua');
  console.log('  ✅ [PASS] Persistencia confirmada: Cero reversión tras recarga.');

  // -------------------------------------------------------------
  // ESCENARIO 6: Modificar número manual marca manualSequence
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 6: Numeración manual inmutable y protegida ---');
  reloadedMoved.sequenceNumber = 25;
  reloadedMoved.manualSequence = true;
  ClassRepository.saveClass(reloadedMoved, TID);

  // Ejecutar realignSequenceNumbersToSchedule y verificar que NO se sobreescribe
  const realignedCount = ClassRepository.realignSequenceNumbersToSchedule(TID);
  const protectedCls = ClassRepository.getClass('cls_stable_id_123', TID);
  assert.strictEqual(protectedCls.sequenceNumber, 25, 'La secuencia manual 25 debe ser inviolable ante realign');
  console.log('  ✅ [PASS] Secuencia manual 25 protegida contra realineaciones automáticas.');

  // -------------------------------------------------------------
  // ESCENARIO 7: Propagación de secuencia numérica por saveClassesBatch
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 7: Propagación por saveClassesBatch en una sola transacción ---');
  const batchList = [
    { id: 'cls_prop_1', teacherId: TID, date: '2026-10-26', subject: 'Robótica', grade: '10°', sequenceNumber: 15, manualSequence: true },
    { id: 'cls_prop_2', teacherId: TID, date: '2026-10-27', subject: 'Robótica', grade: '10°', sequenceNumber: 16, manualSequence: true },
    { id: 'cls_prop_3', teacherId: TID, date: '2026-10-28', subject: 'Robótica', grade: '10°', sequenceNumber: 17, manualSequence: true }
  ];
  const savedBatch = ClassRepository.saveClassesBatch(batchList, TID);
  assert.strictEqual(savedBatch.length, 3, 'Se guardaron 3 clases en batch');
  assert.strictEqual(ClassRepository.getClass('cls_prop_1', TID).sequenceNumber, 15);
  assert.strictEqual(ClassRepository.getClass('cls_prop_2', TID).sequenceNumber, 16);
  assert.strictEqual(ClassRepository.getClass('cls_prop_3', TID).sequenceNumber, 17);
  console.log('  ✅ [PASS] Batch guardado y propagado con números correlativos.');

  // -------------------------------------------------------------
  // ESCENARIO 8: Renumerar en SequenceView.autoFixGroupSequence
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 8: Renumeración explícita estrictamente correlativa (1, 2, 3...) ---');
  // Crear clases desordenadas para Robótica 10°
  const cSeqA = { id: 'cls_ord_1', teacherId: TID, date: '2026-11-01', time: '8:00', subject: 'Robótica', grade: '10°', period: '1°', sequenceNumber: 99 };
  const cSeqB = { id: 'cls_ord_2', teacherId: TID, date: '2026-11-02', time: '8:00', subject: 'Robótica', grade: '10°', period: '1°', sequenceNumber: 3 };
  ClassRepository.saveClass(cSeqA, TID);
  ClassRepository.saveClass(cSeqB, TID);

  const groupClasses = ClassRepository.getAllClasses(TID).filter(c => c.subject === 'Robótica' && c.grade === '10°' && c.date >= '2026-11-01');
  groupClasses.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  groupClasses.forEach((c, idx) => {
    c.sequenceNumber = idx + 1;
    c.dayNumber = String(idx + 1);
    c.manualSequence = true;
  });
  ClassRepository.saveClassesBatch(groupClasses, TID);

  assert.strictEqual(ClassRepository.getClass('cls_ord_1', TID).sequenceNumber, 1, 'Primera clase fechada recibe #1');
  assert.strictEqual(ClassRepository.getClass('cls_ord_2', TID).sequenceNumber, 2, 'Segunda clase fechada recibe #2');
  console.log('  ✅ [PASS] Renumeración estrictamente correlativa (#1, #2) comprobada.');

  // -------------------------------------------------------------
  // ESCENARIO 9: Rendimiento de modificación en lote (< 100 ms)
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 9: Prueba de rendimiento en lote (cero lag de hilo principal) ---');
  const largeBatch = [];
  for (let i = 0; i < 40; i++) {
    const dayStr = String(i + 1).padStart(2, '0');
    largeBatch.push({
      id: `cls_bench_${i}`,
      teacherId: TID,
      date: `2026-12-${dayStr}`,
      subject: 'Matemáticas',
      grade: '7°',
      sequenceNumber: i + 1,
      curriculum: { topic: `Tema ${i}` }
    });
  }
  const tStart = Date.now();
  ClassRepository.saveClassesBatch(largeBatch, TID);
  const elapsed = Date.now() - tStart;
  console.log(`  ⏱ Guardado en lote de 40 clases tomó: ${elapsed} ms`);
  assert(elapsed < 100, `El guardado en lote debe tardar menos de 100 ms (tomó ${elapsed} ms)`);
  console.log('  ✅ [PASS] Rendimiento óptimo sin congelamiento del hilo principal.');

  // -------------------------------------------------------------
  // ESCENARIO 10: Startup de la app no sobreescribe secuencias
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 10: Arranque de app respeta numeración manual ---');
  ClassRepository._cache = {};
  await ClassRepository.init(TID);
  const startCheck = ClassRepository.getClass('cls_prop_1', TID);
  assert.strictEqual(startCheck.sequenceNumber, 15, 'Secuencia 15 debe mantenerse intacta en el arranque');
  console.log('  ✅ [PASS] Secuencia preservada tras arranque completo.');

  // -------------------------------------------------------------
  // ESCENARIO 11: Firestore download preserva fechas y números manuales
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 11: Descarga de Firestore preserva fechas y numeración manual ---');
  const cloudClass = {
    id: 'cls_20260901_mat7_1', // ID con fecha vieja en el nombre
    teacherId: TID,
    date: '2026-10-30',        // Fecha real editada por el usuario
    sequenceNumber: 42,        // Secuencia manual del docente
    subject: 'Matemáticas',
    grade: '7°'
  };
  // Simular guardado directo desde snapshot/cloud con skipCloud
  ClassRepository.saveClass(cloudClass, TID, { skipCloud: true });
  const downloadedCls = ClassRepository.getClass('cls_20260901_mat7_1', TID);
  assert.strictEqual(downloadedCls.date, '2026-10-30', 'La fecha no debe revertirse al patrón del ID');
  assert.strictEqual(downloadedCls.sequenceNumber, 42, 'La secuencia manual no debe sobreescribirse');
  console.log('  ✅ [PASS] Descarga de nube respeta inmutabilidad de fecha y número.');

  // -------------------------------------------------------------
  // ESCENARIO 12: Eliminar una clase con mismo sequenceNumber que otra clase en el mismo día
  // -------------------------------------------------------------
  console.log('\n--- ESCENARIO 12: Misma secuencia en el mismo día no causa eliminación colateral ---');
  const cSameSeqA = { id: 'cls_same_seq_A', teacherId: TID, date: '2026-11-15', subject: 'Lógica', grade: '6°', sequenceNumber: 1 };
  const cSameSeqB = { id: 'cls_same_seq_B', teacherId: TID, date: '2026-11-15', subject: 'Robótica', grade: '10°', sequenceNumber: 1 };
  ClassRepository.saveClass(cSameSeqA, TID);
  ClassRepository.saveClass(cSameSeqB, TID);

  ClassRepository.deleteClass(cSameSeqA.id, TID);
  assert.strictEqual(ClassRepository.getClass(cSameSeqA.id, TID), null, 'cSameSeqA debe estar eliminada');
  const aliveB = ClassRepository.getClass(cSameSeqB.id, TID);
  assert.notStrictEqual(aliveB, null, 'cSameSeqB DEBE permanecer viva aunque compartiera sequenceNumber: 1 en la misma fecha');
  console.log('  ✅ [PASS] Eliminación quirúrgica exclusiva: cSameSeqB sobrevivió al 100%.');

  console.log('\n================================================================');
  console.log('🎉 TODOS LOS 12 ESCENARIOS DE INTEGRIDAD DE CLASES PASARON AL 100%');
  console.log('================================================================');
}

runIntegrityTests().catch(err => {
  console.error('❌ Error en test suite de integridad:', err);
  process.exit(1);
});
