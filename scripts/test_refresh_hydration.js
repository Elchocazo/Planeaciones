/**
 * PRUEBA DE INTEGRACIÓN: HIDRATACIÓN INICIAL Y PREVENCIÓN DE PARPADEO EN RECARGA (F5)
 * Verifica que al recargar la página nunca se muestre el estado vacío provisional ("0 planeadas / 3 pendientes").
 */

const fs = require('fs');
const path = require('path');

// Simular entorno de navegador
const localStorageStore = {};
global.localStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, val) => { localStorageStore[key] = String(val); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

global.window = {
  addEventListener: () => {},
  dispatchEvent: () => {},
  location: { hash: '' }
};

// 1. Cargar datos de prueba simulando datos ya guardados en localStorage
const teacherId = 'usr_manuel';
const testDate = '2026-09-22';
const v4Key = `teacher_class_sessions_${teacherId}_v4`;

const mockSessions = {
  'cls_test_1': {
    id: 'cls_test_1',
    teacherId: teacherId,
    date: testDate,
    time: '07:00 - 08:30',
    subjectId: 'matematicas',
    subjectName: 'Matemáticas',
    gradeId: '2',
    gradeName: '2°',
    group: '2°',
    period: '1°',
    sequenceNumber: 1,
    status: 'planned',
    curriculum: { topic: 'Números hasta 1000' }
  }
};

localStorage.setItem(v4Key, JSON.stringify(mockSessions));

// 2. Requerir ClassRepository
const ClassRepository = require('../js/repositories/class-repository.js');

console.log('================================================================');
console.log('TEST SUITE: HIDRATACIÓN SINCRÓNICA Y ANTI-PARPADEO EN REFRESH');
console.log('================================================================\n');

// TEST 1: Hidratación sincrónica en constructor / arranque
console.log('--- TEST 1: Hidratación sincrónica inmediata de ClassRepository ---');
const classesSync = ClassRepository.getAllClasses(teacherId);
if (classesSync.length === 1 && classesSync[0].id === 'cls_test_1') {
  console.log('  ✅ [PASS] ClassRepository cargó las clases de forma 100% sincrónica al instanciarse.');
} else {
  console.error('  ❌ [FAIL] ClassRepository no tiene clases inmediatamente tras instanciarse:', classesSync);
  process.exit(1);
}

// TEST 2: getByDate inmediato sin llamada async
console.log('\n--- TEST 2: Consulta por fecha síncrona ---');
const classesOnDate = ClassRepository.getByDate(testDate, teacherId);
if (classesOnDate.length === 1 && classesOnDate[0].curriculum.topic === 'Números hasta 1000') {
  console.log('  ✅ [PASS] getByDate devuelve inmediatamente las clases planeadas en el frame 0.');
} else {
  console.error('  ❌ [FAIL] getByDate devolvió lista vacía:', classesOnDate);
  process.exit(1);
}

// TEST 3: init() no borra ni sobrescribe con vacío si ya hay datos
console.log('\n--- TEST 3: init() asíncrono preserva datos cargados sincrónicamente ---');
ClassRepository.init(teacherId).then((res) => {
  const finalClasses = ClassRepository.getAllClasses(teacherId);
  if (finalClasses.length === 1 && finalClasses[0].id === 'cls_test_1') {
    console.log('  ✅ [PASS] init() respetó el caché sincronizado sin resetearlo a vacío.');
    console.log('\n================================================================');
    console.log('RESULTADO FINAL: TODAS LAS PRUEBAS DE HIDRATACIÓN SUPERADAS');
    console.log('================================================================');
  } else {
    console.error('  ❌ [FAIL] init() alteró el caché de manera inconsistente.');
    process.exit(1);
  }
});
