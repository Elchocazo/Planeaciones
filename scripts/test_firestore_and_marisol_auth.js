/**
 * TEST AUTOMATIZADO: Verificación de Autenticación de Marisol Ruiz y Servicio Firestore
 */

const assert = require('assert');

// Simular entorno de navegador mínimo para node
global.window = {};
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

// Cargar firebase-config.js
const { INSTITUTIONAL_AUTH, FirebaseConfigManager } = require('../js/firebase-config.js');

console.log('1. Verificando credenciales institucionales de Marisol Ruiz...');
assert.strictEqual(INSTITUTIONAL_AUTH.COORDINATOR.name, 'Marisol Ruiz');
assert.strictEqual(INSTITUTIONAL_AUTH.COORDINATOR.password, 'CHMD2026');
assert.strictEqual(INSTITUTIONAL_AUTH.COORDINATOR.role, 'coordinator');
console.log('   ✅ INSTITUTIONAL_AUTH configurado correctamente.');

// Cargar users-service.js
// Mock IDBStorage y PlanRepository
global.IDBStorage = { isSupported: () => false };
global.PlanRepository = {
  getAllPlans: () => ({}),
  savePlan: () => true
};

const UserService = require('../js/users-service.js');

console.log('2. Verificando usuarios en UserService...');
const users = UserService.getAllUsers();
const marisol = users.find(u => u.name === 'Marisol Ruiz' || u.role === 'coordinator');

assert(marisol, 'Debe existir el usuario Marisol Ruiz o rol coordinator');
assert.strictEqual(marisol.name, 'Marisol Ruiz');
assert.strictEqual(marisol.password, 'CHMD2026');
assert.strictEqual(marisol.role, 'coordinator');
console.log('   ✅ Usuario Marisol Ruiz presente en el catálogo de usuarios.');

console.log('3. Verificando validación de contraseña institucional...');
assert.strictEqual(UserService.verifyPassword('usr_coordinacion', 'CHMD2026'), true, 'CHMD2026 debe ser válida');
assert.strictEqual(UserService.verifyPassword('usr_coordinacion', 'CHMD2025'), false, 'Clave incorrecta debe rechazarse');
assert.strictEqual(UserService.verifyPassword('usr_coordinacion', ''), false, 'Clave vacía debe rechazarse');
console.log('   ✅ Validación de contraseña CHMD2026 funciona con precisión estricta.');

console.log('4. Verificando API de FirestoreService...');
const FirestoreService = require('../js/services/firestore-service.js');
assert(typeof FirestoreService.init === 'function', 'init debe ser función');
assert(typeof FirestoreService.savePlan === 'function', 'savePlan debe ser función');
assert(typeof FirestoreService.saveCoordinatorReview === 'function', 'saveCoordinatorReview debe ser función');
assert(typeof FirestoreService.uploadAllLocalPlans === 'function', 'uploadAllLocalPlans debe ser función');
assert(typeof FirestoreService.downloadAllFromCloud === 'function', 'downloadAllFromCloud debe ser función');
assert(typeof FirestoreService.startRealtimeSync === 'function', 'startRealtimeSync debe ser función');
console.log('   ✅ FirestoreService implementa todos los métodos requeridos.');

console.log('\n🎉 TODOS LOS TESTS DE INTEGRACIÓN Y AUTENTICACIÓN PASARON CON ÉXITO.');
