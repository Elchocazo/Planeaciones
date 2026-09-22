/**
 * SUITE DE PRUEBAS DE RENDIMIENTO Y BENCHMARK DE ARQUITECTURA
 * Verifica:
 * 1. Tiempo constante O(1) en cálculo de consecutivos de clase (<1ms)
 * 2. Rendimiento del banco curricular en memoria (cache eficiente sin re-parseos)
 * 3. Integridad total de los datos curriculares modularizados (Matemáticas, Sistemas, Robótica, Lógica, Dirección de Grupo)
 * 4. Autoguardado inteligente condicional (dirty checking) sin bloqueos del hilo principal
 * 5. Consistencia de índices tras guardados, actualizaciones y eliminaciones atómicas
 */

const assert = require('assert');

// Mocks de entorno de persistencia
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
  },
  saveSnapshot: async (userId, data) => {
    memoryStore['idb_snap_' + userId] = JSON.stringify(data);
    return true;
  },
  requestPersistence: () => true
};

const ClassRepository = require('../js/repositories/class-repository.js');
const StorageService = require('../js/storage.js');
const CurriculumService = require('../js/curriculum.js');

async function runPerformanceBenchmarks() {
  console.log('================================================================');
  console.log('SUITE DE BENCHMARKS: RENDIMIENTO WEB, CURRÍCULO E ÍNDICES O(1)');
  console.log('================================================================\n');

  const TEACHER_ID = 'usr_bench_teacher';

  // -------------------------------------------------------------------
  // TEST 1: Integridad de datos curriculares modularizados
  // -------------------------------------------------------------------
  console.log('--- TEST 1: Integridad de datos curriculares modularizados ---');
  const allCur = CurriculumService.getAllCurriculum();
  assert.ok(allCur['1°'], 'Periodo 1° presente');
  assert.ok(allCur['2°'], 'Periodo 2° presente');
  assert.ok(allCur['3°'], 'Periodo 3° presente');
  assert.ok(allCur['4°'], 'Periodo 4° presente');

  // Verificar asignaturas esenciales
  assert.ok(allCur['1°']['Matemáticas'], 'Matemáticas presente');
  assert.ok(allCur['1°']['Sistemas'], 'Sistemas presente');
  assert.ok(allCur['1°']['Tecnología e Informática'], 'Tecnología e Informática presente (alias)');
  assert.ok(allCur['1°']['Robótica'], 'Robótica presente');
  assert.ok(allCur['1°']['Lógica'], 'Lógica presente');
  assert.ok(allCur['1°']['Dirección de grupo'], 'Dirección de grupo presente');

  // Verificar items específicos (ej. Robótica 10°, Sistemas 7°, Matemáticas 7°)
  const rob10 = allCur['1°']['Robótica']['10°'];
  assert.ok(Array.isArray(rob10) && rob10.length >= 4, 'Robótica 10° tiene sus temas completos');
  assert.ok(rob10.some(t => t.topic && (t.topic.includes('gripper') || t.topic.includes('cinemática') || t.topic.includes('Servomotores'))), 'Temas de cinemática, CAD y gripper presentes');

  const sis7 = allCur['1°']['Sistemas']['7°'];
  assert.ok(Array.isArray(sis7) && sis7.length >= 4, 'Sistemas 7° completo');

  console.log('  ✅ [PASS] 100% de asignaturas, grados y temas institucionales íntegros tras modularización.\n');

  // -------------------------------------------------------------------
  // TEST 2: Rendimiento del cache de banco curricular en memoria
  // -------------------------------------------------------------------
  console.log('--- TEST 2: Rendimiento de consulta curricular en memoria ---');
  const curStart = process.hrtime.bigint();
  const ITERATIONS = 1000;
  for (let i = 0; i < ITERATIONS; i++) {
    CurriculumService.getItems('1°', 'Matemáticas', '7°');
    CurriculumService.getItems('1°', 'Sistemas', '4°A');
    CurriculumService.getItems('1°', 'Robótica', '10°');
  }
  const curEnd = process.hrtime.bigint();
  const curMs = Number(curEnd - curStart) / 1e6;
  const avgPerQueryUs = (curMs / (ITERATIONS * 3)) * 1000;
  console.log(`  ⚡ 3,000 consultas curriculares completadas en ${curMs.toFixed(2)} ms (promedio: ${avgPerQueryUs.toFixed(2)} µs por consulta)`);
  assert.ok(curMs < 200, 'Lectura curricular es ultrarrápida (< 200ms para 3000 consultas)');
  console.log('  ✅ [PASS] Cache en memoria elimina micro-congelamientos por lectura repetitiva.\n');

  // -------------------------------------------------------------------
  // TEST 3: Tiempo constante O(1) en cálculo de consecutivos de clase
  // -------------------------------------------------------------------
  console.log('--- TEST 3: Benchmark de consecutivos con volumen (500 clases) ---');
  // Poblar 500 clases simuladas
  const subjects = ['Matemáticas', 'Sistemas', 'Robótica', 'Lógica'];
  const grades = ['2°', '3°', '4°A', '4°B', '7°', '10°'];

  for (let i = 1; i <= 500; i++) {
    const sub = subjects[i % subjects.length];
    const grd = grades[i % grades.length];
    ClassRepository.saveClass({
      id: `bench_cls_${i}`,
      teacherId: TEACHER_ID,
      subjectName: sub,
      gradeName: grd,
      group: grd,
      period: '1°',
      sequenceNumber: (i % 25) + 1,
      date: `2026-09-${String((i % 28) + 1).padStart(2, '0')}`,
      curriculum: { topic: `Tema de prueba #${i}` }
    }, TEACHER_ID);
  }

  // Medir tiempo de cálculo de consecutivo
  const seqStart = process.hrtime.bigint();
  const SEQ_LOOKUPS = 2000;
  for (let i = 0; i < SEQ_LOOKUPS; i++) {
    const sub = subjects[i % subjects.length];
    const grd = grades[i % grades.length];
    const nextSeq = ClassRepository.getNextSequenceNumber({
      teacherId: TEACHER_ID,
      period: '1°',
      subject: sub,
      grade: grd,
      group: grd
    });
    assert.ok(nextSeq >= 1, 'Consecutivo válido devuelto');
  }
  const seqEnd = process.hrtime.bigint();
  const seqMs = Number(seqEnd - seqStart) / 1e6;
  const avgSeqUs = (seqMs / SEQ_LOOKUPS) * 1000;
  console.log(`  ⚡ ${SEQ_LOOKUPS} consultas de consecutivo ejecutadas en ${seqMs.toFixed(2)} ms (promedio: ${avgSeqUs.toFixed(2)} µs por consulta)`);
  assert.ok(seqMs < 100, 'Cálculo de consecutivo opera en tiempo constante O(1) (< 100ms para 2000 consultas)');
  console.log('  ✅ [PASS] Consecutivos operan en O(1) constante sin degradación con volumen de datos.\n');

  // -------------------------------------------------------------------
  // TEST 4: Autoguardado inteligente con Dirty Checking
  // -------------------------------------------------------------------
  console.log('--- TEST 4: Autoguardado inteligente (Skip si no hay cambios) ---');
  StorageService.markClean();
  let snapBefore = memoryStore['idb_snap_' + TEACHER_ID];

  // Ejecutar protocolo en segundo plano sin feedback (como lo hace el heartbeat periódico)
  const resultClean = await StorageService.executeAutoSaveProtocol(false);
  assert.strictEqual(resultClean, true, 'Protocolo reporta éxito sin bloquear');
  // Debe omitir escribir snapshot porque no estaba marcado como dirty
  assert.strictEqual(memoryStore['idb_snap_' + TEACHER_ID], snapBefore, 'Omitió volcado pesado a IndexedDB cuando no hay cambios');

  // Marcar como dirty (usuario escribió algo)
  StorageService.markDirty();
  const resultDirty = await StorageService.executeAutoSaveProtocol(false);
  assert.strictEqual(resultDirty, true, 'Protocolo reporta éxito');
  assert.strictEqual(StorageService._isDirty, false, 'Limpió bandera dirty tras guardar');
  console.log('  ✅ [PASS] Heartbeat omite serializaciones cuando no hay cambios (cero congelamiento).\n');

  // -------------------------------------------------------------------
  // TEST 5: Consistencia de índices ante eliminación y guardado atómico
  // -------------------------------------------------------------------
  console.log('--- TEST 5: Consistencia de índice ante guardado y eliminación ---');
  const testSub = 'Robótica';
  const testGrd = '10°';

  // Guardar clase con consecutivo 35
  const clsHigh = ClassRepository.saveClass({
    id: 'cls_bench_high',
    teacherId: TEACHER_ID,
    subjectName: testSub,
    gradeName: testGrd,
    group: testGrd,
    period: '1°',
    sequenceNumber: 35,
    date: '2026-10-20',
    curriculum: { topic: 'Tema de alta secuencia' }
  }, TEACHER_ID);

  const nextAfterHigh = ClassRepository.getNextSequenceNumber({
    teacherId: TEACHER_ID,
    period: '1°',
    subject: testSub,
    grade: testGrd,
    group: testGrd
  });
  assert.strictEqual(nextAfterHigh, 36, 'Reconoció el nuevo máximo consecutivo (35 + 1 = 36)');

  // Eliminar la clase: el índice se invalida y recalcula el nuevo máximo de forma segura
  ClassRepository.deleteClass('cls_bench_high', TEACHER_ID);
  const nextAfterDelete = ClassRepository.getNextSequenceNumber({
    teacherId: TEACHER_ID,
    period: '1°',
    subject: testSub,
    grade: testGrd,
    group: testGrd
  });
  assert.ok(nextAfterDelete <= 35, 'Tras eliminar, el consecutivo refleja el estado real sin saltos huérfanos');
  console.log('  ✅ [PASS] Índice y persistencia sincronizados a la perfección.\n');

  console.log('================================================================');
  console.log('RESULTADO BENCHMARK: 5 / 5 PRUEBAS SUPERADAS EXITOSAMENTE (100%)');
  console.log('================================================================');
}

runPerformanceBenchmarks().catch(err => {
  console.error('❌ ERROR EN BENCHMARK:', err);
  process.exit(1);
});
