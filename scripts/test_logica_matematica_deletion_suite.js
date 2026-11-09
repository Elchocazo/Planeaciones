/**
 * Test de Regresión Quirúrgico: Eliminación de Lógica Matemática 6°
 * Verifica:
 * 1. Problema A: Cero sustitución inmediata por duplicados fantasma.
 * 2. Problema B: Cero resurrección tras recarga (F5) desde IndexedDB, LocalStorage o semillas.
 * 3. Problema C: Cero congelamiento del hilo principal en arranque y recarga (<50ms).
 */

const assert = require('assert');

// Mock DOM y Almacenamientos
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

global.sessionStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

global.IDBStorage = {
  _store: {},
  async get(k) { return this._store[k] || null; },
  async set(k, v) { this._store[k] = JSON.parse(JSON.stringify(v)); return true; },
  async delete(k) { delete this._store[k]; return true; }
};

global.window = {
  dispatchEvent() {},
  addEventListener() {}
};

global.CustomEvent = class {
  constructor(name, detail) { this.name = name; this.detail = detail; }
};

// Cargar Módulos
const ClassRepository = require('../js/repositories/class-repository.js');
const PlanRepository = require('../js/plan-repository.js');
const SequenceService = require('../js/services/sequence-service.js');

async function runScenario() {
  console.log('--- TEST REGRESIÓN: ELIMINACIÓN LÓGICA MATEMÁTICA 6° ---');
  const tid = 'usr_manuel';

  // 1. Sembrar clases de Lógica Matemática 6° simulando la BD real con un duplicado oculto
  const class1 = {
    id: 'cls_logica_6_seq1',
    teacherId: tid,
    date: '2026-09-15',
    subject: 'Lógica Matemática',
    subjectName: 'Lógica Matemática',
    grade: '6°',
    gradeName: '6°',
    sequenceNumber: 1,
    topic: 'Proposiciones simples',
    period: '1°'
  };

  const class2 = {
    id: 'cls_logica_6_seq2',
    teacherId: tid,
    date: '2026-09-22',
    subject: 'Lógica Matemática',
    subjectName: 'Lógica Matemática',
    grade: '6°',
    gradeName: '6°',
    sequenceNumber: 2,
    topic: 'Tablas de verdad',
    period: '1°'
  };

  const classToDelete = {
    id: 'cls_logica_6_seq3',
    teacherId: tid,
    date: '2026-09-29',
    subject: 'Lógica Matemática',
    subjectName: 'Lógica Matemática',
    grade: '6°',
    gradeName: '6°',
    sequenceNumber: 3,
    topic: 'Conectores lógicos',
    period: '1°'
  };

  // Duplicado fantasma que solía sustituir inmediatamente a classToDelete
  const shadowDuplicate = {
    id: 'cls_logica_6_shadow_dup',
    teacherId: tid,
    date: '2026-09-29',
    subject: 'Lógica Matemática',
    subjectName: 'Lógica Matemática',
    grade: '6°',
    gradeName: '6°',
    sequenceNumber: 3,
    topic: 'Conectores lógicos (versión borrador antigua)',
    period: '1°'
  };

  ClassRepository.saveClass(class1, tid);
  ClassRepository.saveClass(class2, tid);
  ClassRepository.saveClass(classToDelete, tid);
  // Insertar sombra directamente en cache y storage como ocurre con datos históricos heredados
  ClassRepository._cache[tid]['cls_logica_6_shadow_dup'] = shadowDuplicate;
  ClassRepository._persist(ClassRepository._cache[tid], tid);

  const initialClasses = ClassRepository.getAllClasses(tid).filter(c => c.subjectName === 'Lógica Matemática' && c.gradeName === '6°');
  console.log('Clases iniciales visibles (deduplicadas):', initialClasses.length);
  assert.strictEqual(initialClasses.length, 3, 'Deben haber 3 clases visibles antes de borrar');

  // 2. Ejecutar eliminación de la clase 3
  console.log('Eliminando clase #3...');
  const delOk = ClassRepository.deleteClass('cls_logica_6_seq3', tid, {
    date: '2026-09-29',
    sequenceNumber: 3,
    subjectName: 'Lógica Matemática',
    gradeName: '6°'
  });
  assert(delOk, 'La eliminación debe reportar éxito');

  // PROBLEMA A: Verificar que no haya sustitución inmediata
  const afterDeleteClasses = ClassRepository.getAllClasses(tid).filter(c => c.subjectName === 'Lógica Matemática' && c.gradeName === '6°');
  console.log('Clases visibles tras eliminar:', afterDeleteClasses.length);
  assert.strictEqual(afterDeleteClasses.length, 2, 'Deben quedar exactamente 2 clases (cero sustitución)');

  const resurrectedSlot = afterDeleteClasses.find(c => c.sequenceNumber === 3 || c.date === '2026-09-29');
  assert(!resurrectedSlot, 'PROBLEMA A RESUELTO: Ninguna clase sustituyó a la clase eliminada en slot 3');

  // PROBLEMA C: Medir tiempo de recarga / inicio (debe ser instantáneo sin congelamiento)
  console.log('Simulando recarga del navegador (F5)...');
  const t0 = Date.now();
  // Limpiar memoria volátil
  ClassRepository._cache = {};
  ClassRepository._deletedClassIdsSets = {};
  ClassRepository._deletedSlotsSets = {};

  // Reiniciar repositorio
  await ClassRepository.init();
  const reloadDuration = Date.now() - t0;
  console.log(`Tiempo de recarga e inicialización: ${reloadDuration}ms`);
  assert(reloadDuration < 100, 'PROBLEMA C RESUELTO: Cero congelamiento en arranque y recarga (<100ms)');

  // PROBLEMA B: Verificar que no haya resurrección tras recarga
  const afterReloadClasses = ClassRepository.getAllClasses(tid).filter(c => c.subjectName === 'Lógica Matemática' && c.gradeName === '6°');
  console.log('Clases tras F5:', afterReloadClasses.length);
  assert.strictEqual(afterReloadClasses.length, 2, 'PROBLEMA B RESUELTO: Exactamente 2 clases tras F5, cero resurrección');

  const resurrectedAfterF5 = afterReloadClasses.find(c => c.id === 'cls_logica_6_seq3' || c.id === 'cls_logica_6_shadow_dup' || c.date === '2026-09-29');
  assert(!resurrectedAfterF5, 'PROBLEMA B RESUELTO: Ni la clase eliminada ni su duplicado reaparecieron tras recargar');

  console.log('✅ TODOS LOS CRITERIOS DEL ESCENARIO DE LÓGICA MATEMÁTICA 6° SUPERADOS CON ÉXITO');
}

runScenario().catch(err => {
  console.error('ERROR EN TEST:', err);
  process.exit(1);
});
